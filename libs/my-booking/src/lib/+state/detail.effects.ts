import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { forkJoin, of } from "rxjs";
import { catchError, map, switchMap, withLatestFrom } from "rxjs/operators";
import { CustomerCaseFacade } from "@cg/olb/state";
import { SpinnerFacade } from "@cg/spinner";
import { AppointmentService } from "@cg/appointment-ui";
import { LoginActions, MY_BOOKING_LOGIN_URL, MyBookingNotificationStatus } from "@cg/my-booking-login";
import {
  CustomerCase,
  CustomerCaseEditContact,
  CustomerCaseService,
  CustomerService,
  OverlayService,
  Resume
} from "@cg/shared";
import * as DetailActions from "./detail.actions";

interface CustomerCaseId {
  customerCaseId?: string;
}

interface RequestCustomerCaseAction {
  payload: CustomerCase | CustomerCaseId;
}

@Injectable()
export class DetailEffects {
  public setMyBookingDetailObject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.setResume),
      withLatestFrom(this.customerCaseFacade.customerCase$),
      switchMap(([_action, customerCase]: [{ resume: Resume }, CustomerCase]) =>
        this.customerCaseService.getCustomerCaseEditContact$(customerCase.id).pipe(
          map((customerCaseEditContact: CustomerCaseEditContact) =>
            DetailActions.setMybookingDetailObject({
              payload: {
                customerCase: customerCase,
                customerCaseEditContact: customerCaseEditContact,
                toastStatus: null
              }
            })
          )
        )
      )
    )
  );

  public updateCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DetailActions.updateCustomer),
      switchMap((action) => {
        this.spinnerFacade.showSpinner({});
        return this.customerService
          .updateCustomer(action.payload.customer.customerCaseId, action.payload.customer)
          .pipe(
            map((response) => {
              this.overlayService.close();
              this.spinnerFacade.hideSpinner();
              return DetailActions.updateCustomerSuccessReceived({ payload: response });
            }),
            catchError(() => of(DetailActions.updateCustomerFailureReceived()))
          );
      })
    )
  );

  public updateAppointment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DetailActions.updateAppointment),
      switchMap((action) => {
        this.spinnerFacade.showSpinner({});
        return this.appointmentService.confirmAppointment(action.payload.setAppointmentPayload).pipe(
          map(() => {
            this.overlayService.close();
            this.spinnerFacade.hideSpinner();
            return DetailActions.updateAppointmentSuccessReceived({
              payload: action.payload.setAppointmentPayload
            });
          }),
          catchError(() => {
            this.spinnerFacade.hideSpinner();
            return of(DetailActions.updateAppointmentFailureReceived());
          })
        );
      })
    )
  );

  public getCustomerCase$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DetailActions.getCustomerCase),
      map((action) => this.getCustomerCaseId(action)),
      switchMap((customerCaseId: string) =>
        forkJoin([
          this.customerCaseService.getCustomerCase$(customerCaseId),
          this.customerCaseService.getCustomerCaseEditContact$(customerCaseId)
        ]).pipe(
          map(([customerCase, customerCaseEditContact]: [CustomerCase, CustomerCaseEditContact]) =>
            DetailActions.setMybookingDetailObject({
              payload: {
                customerCase: customerCase,
                customerCaseEditContact: customerCaseEditContact,
                toastStatus: null
              }
            })
          )
        )
      ),
      catchError(() => {
        this.router.navigate([MY_BOOKING_LOGIN_URL]);
        return of(DetailActions.getCustomerCaseFailureReceived());
      })
    )
  );

  public logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DetailActions.logout),
      switchMap((response) => {
        const statusToast = response.payload
          ? MyBookingNotificationStatus.LOGOUT_INACTIVITY
          : MyBookingNotificationStatus.LOGOUT;

        this.router.navigate([MY_BOOKING_LOGIN_URL]);

        return of(
          DetailActions.resetState(),
          LoginActions.resetState(),
          LoginActions.setNotificationStatus({ payload: statusToast })
        );
      })
    )
  );

  private isCustomerCase(action: RequestCustomerCaseAction): action is { payload: CustomerCase } {
    return (action.payload as CustomerCase).id !== undefined;
  }

  private isCustomerCaseId(action: RequestCustomerCaseAction): action is { payload: CustomerCaseId } {
    return (action.payload as CustomerCaseId).customerCaseId !== undefined;
  }

  private getCustomerCaseId(action: RequestCustomerCaseAction | { payload: CustomerCase }): string | undefined {
    if (this.isCustomerCaseId(action)) {
      return action.payload.customerCaseId;
    }

    if (this.isCustomerCase(action)) {
      return action.payload.id;
    }
  }

  // eslint-disable-next-line max-params
  public constructor(
    private readonly actions$: Actions,
    private readonly customerCaseService: CustomerCaseService,
    private readonly customerCaseFacade: CustomerCaseFacade,
    private readonly customerService: CustomerService,
    private readonly router: Router,
    private readonly overlayService: OverlayService,
    private readonly appointmentService: AppointmentService,
    private readonly spinnerFacade: SpinnerFacade
  ) {}
}
