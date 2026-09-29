import { createAction, props } from "@ngrx/store";
import { Lpn, Resume } from "@cg/shared";
import { MyBookingNotificationStatus } from "../enums";
import { KtciResume } from "../interfaces";

export const checkLicensePlateNumber = createAction("[Login/API] Check Licence Plate Number", props<{ lpn: Lpn }>());

export const loginWithKtciCodeButtonClicked = createAction(
  "[Login/API] Login With KTCI Code Button Clicked",
  props<{ resumeId: string; ktci: string }>()
);

export const loginWithKtciSuccessful = createAction(
  "[Login/API] Login With KTCI Code Button Success",
  props<{ payload: KtciResume }>()
);

export const licensePlateNumberCheckSuccessResultReceived = createAction(
  "[Login/API] Licence Plate Number Check Success Result Received",
  props<{ resumeId: string }>()
);

export const licensePlateNumberCheckFailureResultReceived = createAction(
  "[Login/API] Licence Plate Number Check Failure Result Failure",
  props<{ maxAttempts: number }>()
);

export const loginFailureResultReceived = createAction(
  "[Login/API] Login Failure Result Failure",
  props<{ maxAttempts: number }>()
);

export const setResume = createAction("[Login/API] Set Resume", props<{ resume: Resume }>());

export const resetState = createAction("[Login/API] Reset State");

export const setNotificationStatus = createAction(
  "[Login/API] Set Toast Status",
  props<{ payload: Exclude<MyBookingNotificationStatus, MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_SUCCESS> }>()
);

export const setNotificationStatusToMailDeliverySuccess = createAction(
  "[Login/API] Set Toast Status To KTCI_MAIL_DELIVERY_SUCCESS",
  props<{ payload: { emailAddress: string } }>()
);

export const sendKtciMailAgain = createAction("[Login/API] Send Ktci Mail Again");

export const ktciAlreadyDeliverdAfterLpnCheck = createAction(
  "[Login/API] Ktci Already Deliverd After Lpn Check",
  props<{ payload: { resumeId: string } }>()
);
