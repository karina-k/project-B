import { createFeatureSelector, createSelector } from "@ngrx/store";
import { LOGIN_FEATURE_KEY, LoginState } from "./login.reducer";

export const getLoginState = createFeatureSelector<LoginState>(LOGIN_FEATURE_KEY);

export const getLicencePlateNumberCheckFailureResult = createSelector(getLoginState, (state: LoginState) =>
  state ? state.maxAttemptsLpn : null
);

export const getLicencePlateNumberCheckSuccessResult = createSelector(getLoginState, (state: LoginState) =>
  state ? state.resumeId : null
);

export const getLoginWithKtciCcdeFailure = createSelector(getLoginState, (state: LoginState) =>
  state ? state.maxAttemptsKtciCode : null
);

export const getResume = createSelector(getLoginState, (state: LoginState) => (state ? state.resume : null));

export const getNotificationStatus = createSelector(getLoginState, (state: LoginState) =>
  state ? state.notificationStatus : null
);

export const getEmailAddress = createSelector(getLoginState, (state: LoginState) =>
  state ? state.emailAddress : null
);

export const getLpn = createSelector(getLoginState, (state: LoginState) => (state ? state.lpn : null));

export const getKtciResume = createSelector(getLoginState, (state: LoginState) => (state ? state.ktciResume : null));

export const isKtciContent = createSelector(getLoginState, (state: LoginState) => (state ? state.isKtciContent : null));
