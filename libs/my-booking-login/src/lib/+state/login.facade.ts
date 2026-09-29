import { Injectable } from "@angular/core";
import { Action, select, Store } from "@ngrx/store";
import { filter, take } from "rxjs/operators";
import { Lpn } from "@cg/shared";
import { MyBookingNotificationStatus } from "../enums";
import * as LoginActions from "./login.actions";
import * as LoginSelectors from "./login.selectors";

@Injectable({
  providedIn: "root"
})
export class LoginFacade {
  public loginWithKtciCodeFailed$ = this.store.pipe(select(LoginSelectors.getLoginWithKtciCcdeFailure));
  public licencePlateNumberCheckSuccess$ = this.store.pipe(
    select(LoginSelectors.getLicencePlateNumberCheckSuccessResult)
  );
  public licencePlateNumberCheckFailed$ = this.store.pipe(
    select(LoginSelectors.getLicencePlateNumberCheckFailureResult)
  );
  public resume$ = this.store.pipe(select(LoginSelectors.getResume));
  public notificationStatus$ = this.store.pipe(select(LoginSelectors.getNotificationStatus));
  public isKtciContent$ = this.store.pipe(select(LoginSelectors.isKtciContent));
  public emailAddress$ = this.store.pipe(select(LoginSelectors.getEmailAddress));

  public constructor(private readonly store: Store) {}

  public checkLicensePlateNumber(lpn: Lpn) {
    this.dispatchAfterClearingToast(LoginActions.checkLicensePlateNumber({ lpn }));
  }

  public loginWithKtciCodeButtonClicked(resumeId: string, ktci: string) {
    this.store.dispatch(LoginActions.loginWithKtciCodeButtonClicked({ resumeId, ktci }));
  }

  private dispatchAfterClearingToast(action: Action) {
    this.notificationStatus$
      .pipe(
        filter((status: MyBookingNotificationStatus | null) => status == null),
        take(1)
      )
      .subscribe(() => this.store.dispatch(action));

    this.setNotificationStatus(null);
  }

  public setNotificationStatus(
    status: Exclude<MyBookingNotificationStatus, MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_SUCCESS>
  ) {
    this.store.dispatch(LoginActions.setNotificationStatus({ payload: status }));
  }

  public sendKtciMailAgain() {
    this.store.dispatch(LoginActions.sendKtciMailAgain());
  }

  public resetState() {
    this.store.dispatch(LoginActions.resetState());
  }
}
