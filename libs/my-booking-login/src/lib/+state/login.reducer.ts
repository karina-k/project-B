import { Action, createReducer, on } from "@ngrx/store";
import { Lpn, Resume } from "@cg/shared";
import { MyBookingNotificationStatus } from "../enums/my-booking-toast-status.enum";
import { KtciResume } from "../interfaces";
import * as LoginActions from "./login.actions";

export const LOGIN_FEATURE_KEY = "myBookingLogin";

export interface LoginState {
  resumeId: string | null;
  resume: Resume | null;
  lpn: Lpn;
  maxAttemptsLpn: number | null;
  maxAttemptsKtciCode: number | null;
  notificationStatus: MyBookingNotificationStatus;
  ktciResume: KtciResume;
  isKtciContent: boolean;
  emailAddress: string | null;
}

export interface LoginPartialState {
  readonly [LOGIN_FEATURE_KEY]: LoginState;
}

export const initialState: LoginState = {
  resumeId: null,
  resume: null,
  lpn: null,
  maxAttemptsLpn: null,
  maxAttemptsKtciCode: null,
  notificationStatus: null,
  ktciResume: null,
  isKtciContent: false,
  emailAddress: null
};

const loginReducer = createReducer(
  initialState,
  on(
    LoginActions.checkLicensePlateNumber,
    (state, action): LoginState => ({
      ...state,
      lpn: action.lpn
    })
  ),
  on(
    LoginActions.ktciAlreadyDeliverdAfterLpnCheck,
    (state, action): LoginState => ({
      ...state,
      resumeId: action.payload.resumeId,
      isKtciContent: true
    })
  ),
  on(
    LoginActions.licensePlateNumberCheckSuccessResultReceived,
    (state, action): LoginState => ({
      ...state,
      resumeId: action.resumeId,
      isKtciContent: true
    })
  ),
  on(
    LoginActions.licensePlateNumberCheckFailureResultReceived,
    (state, action): LoginState => ({
      ...state,
      maxAttemptsLpn: action.maxAttempts
    })
  ),
  on(
    LoginActions.setResume,
    (state, action): LoginState => ({
      ...state,
      resume: action.resume
    })
  ),
  on(
    LoginActions.loginWithKtciSuccessful,
    (state, action): LoginState => ({
      ...state,
      ktciResume: action.payload
    })
  ),
  on(
    LoginActions.loginFailureResultReceived,
    (state, action): LoginState => ({
      ...state,
      maxAttemptsKtciCode: action.maxAttempts
    })
  ),
  on(
    LoginActions.resetState,
    (): LoginState => ({
      ...initialState
    })
  ),
  on(
    LoginActions.setNotificationStatus,
    (state, action): LoginState => ({
      ...state,
      notificationStatus: action.payload
    })
  ),
  on(
    LoginActions.setNotificationStatusToMailDeliverySuccess,
    (state, action): LoginState => ({
      ...state,
      notificationStatus: MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_SUCCESS,
      emailAddress: action.payload.emailAddress
    })
  )
);

export function reducer(state: LoginState, action: Action): LoginState {
  return loginReducer(state, action);
}
