import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { select, Store } from "@ngrx/store";
import { TypedAction } from "@ngrx/store/src/models";
import { Observable, of } from "rxjs";
import { catchError, map, switchMap, withLatestFrom } from "rxjs/operators";
import { AppointmentFacade, CustomerCaseActions, ProcessFacade } from "@cg/olb/state";
import { ResumeActions } from "@cg/resume-core";
import { GoogleTagManagerService } from "@cg/analytics";
import * as SharedActions from "@cg/booking-shared-state";
import { CustomerCase, CustomerCaseService, Lpn, Resume, ResumeRequestState, ResumeType } from "@cg/shared";
import { MyBookingNotificationStatus } from "../enums/my-booking-toast-status.enum";
import { KtciResume, Login } from "../interfaces";
import { LoginService } from "../services/login.service";
import * as LoginActions from "./login.actions";
import * as LoginSelectors from "./login.selectors";

const eventActionKtciCode = "log-in-code";
const eventActionLicensePlate = "log-in-license-plate";
const eventNewKtciCode = "request-log-in-code";
const eventLabelFail = "fail";
const eventLabelResendFail = "not-available";
const eventLabelSuccess = "next/success";

@Injectable()
export class LoginEffects {
  public licencePlateNumberCheck$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.checkLicensePlateNumber),
      switchMap((action: { lpn: Lpn }) =>
        this.loginService.checkLicensePlateNumberCode(action.lpn).pipe(
          switchMap(({ resumeId, emailAddress }: Login) => {
            this.trackEvent(eventLabelSuccess);
            return of(
              LoginActions.licensePlateNumberCheckSuccessResultReceived({
                resumeId: resumeId
              }),
              LoginActions.setNotificationStatusToMailDeliverySuccess({ payload: { emailAddress } })
            );
          }),
          catchError((error: HttpErrorResponse) => {
            const isRateError = ![403, 410].includes(error.status);
            const errorObject = error.error;
            let maxAttempts = 0;
            this.trackEvent(isRateError ? eventLabelFail : eventLabelResendFail, eventActionLicensePlate);
            if (error.status === 403) {
              return this.handle403(errorObject);
            } else if (isRateError) {
              this.navigateToErrorPage();
            } else {
              maxAttempts = this.getMaxAttempts(errorObject["failedAttempts"]);
            }
            return of(
              LoginActions.licensePlateNumberCheckFailureResultReceived({
                maxAttempts
              }),
              LoginActions.setNotificationStatus({ payload: MyBookingNotificationStatus.WRONG_LPN })
            );
          })
        )
      )
    )
  );

  public loginWithKtciCode$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.loginWithKtciCodeButtonClicked),
      switchMap((action) =>
        this.loginService.requestKtciResumeWithResumeIdAndKtciCode(action.resumeId, action.ktci).pipe(
          map((payload) => {
            this.trackEvent(eventLabelSuccess, eventActionKtciCode);
            return LoginActions.loginWithKtciSuccessful({ payload });
          }),
          catchError((error) => {
            this.trackEvent(eventLabelFail, eventActionKtciCode);
            if (error.status === 410) {
              this.navigateToErrorPage();
            }
            const maxAttempts = this.getMaxAttempts(error.error["failedAttempts"]);
            return of(
              LoginActions.loginFailureResultReceived({
                maxAttempts
              }),
              LoginActions.setNotificationStatus({ payload: MyBookingNotificationStatus.WRONG_KTCI })
            );
          })
        )
      )
    )
  );

  public loginWithKtciCodeSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.loginWithKtciSuccessful),
      switchMap((response) => this.customerCaseService.getCustomerCase$(response.payload.customerCaseId)),
      withLatestFrom(this.store.pipe(select(LoginSelectors.getKtciResume))),
      map(([customerCase, ktciResume]: [CustomerCase, KtciResume]) => {
        this.appointmentFacade.resetState();
        this.processFacade.resetState();
        this.store.dispatch(CustomerCaseActions.fetchCustomerCaseSuccess({ payload: customerCase }));

        const resume: Resume = {
          customerCaseId: customerCase.id,
          created: ktciResume.created,
          manualCarSelection: ktciResume.manualCarSelection,
          resumeType: ktciResume.resumeType,
          version: ktciResume.version,
          state: ktciResume.state as unknown as ResumeRequestState
        };

        if (ktciResume.resumeType === ResumeType.B2C_MYBOOKING) {
          this.router.navigate(["/my-booking/detail"]);
          return LoginActions.setResume({ resume });
        }

        this.store.dispatch(SharedActions.setResumeResponse({ payload: resume }));
        this.router.navigate(["/olb"]);
        return ResumeActions.loadResumeSuccess({ response: resume });
      })
    )
  );
  public sendMailAgain$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.sendKtciMailAgain),
      withLatestFrom(this.store.pipe(select(LoginSelectors.getLpn))),
      map(([_action, lpn]) => lpn),
      switchMap((lpn) =>
        this.loginService.checkLicensePlateNumberCode(lpn).pipe(
          map(() => {
            this.trackEvent(eventLabelSuccess, eventNewKtciCode);
            return LoginActions.setNotificationStatus({
              payload: MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_AGAIN
            });
          }),
          catchError(() => {
            this.trackEvent("fail", eventNewKtciCode);
            return of(
              LoginActions.setNotificationStatus({
                payload: MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_NOT_POSSIBLE
              })
            );
          })
        )
      )
    )
  );

  private getMaxAttempts(failedAttempts: number): number {
    const maxAttempts = 3 - failedAttempts;
    if (maxAttempts <= 0) {
      this.navigateToErrorPage();
      return 0;
    }
    return maxAttempts;
  }

  private navigateToErrorPage(): void {
    this.router.navigate(["/my-booking/error"]);
  }

  private trackEvent(eventLabel: string, eventAction = "log-in-license-plate"): void {
    this.gtmService.trackEvent({
      eventCategory: "my-booking",
      eventAction,
      eventLabel
    });
  }

  private handle403(
    errorObject: [string: string | number]
  ): Observable<
    | ({ payload: MyBookingNotificationStatus } & TypedAction<"[Login/API] Set Toast Status">)
    | ({ payload: { resumeId: string } } & TypedAction<"[Login/API] Ktci Already Deliverd After Lpn Check">)
  > {
    return of(
      LoginActions.ktciAlreadyDeliverdAfterLpnCheck({
        payload: { resumeId: errorObject["resumeId"] }
      }),
      LoginActions.setNotificationStatus({ payload: MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_NOT_POSSIBLE })
    );
  }

  // eslint-disable-next-line max-params
  public constructor(
    private readonly actions$: Actions,
    private readonly loginService: LoginService,
    private readonly customerCaseService: CustomerCaseService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly router: Router,
    private readonly store: Store,
    private readonly processFacade: ProcessFacade,
    private readonly appointmentFacade: AppointmentFacade
  ) {}
}
