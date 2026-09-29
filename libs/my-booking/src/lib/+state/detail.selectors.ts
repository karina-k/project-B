import { createFeatureSelector, createSelector } from "@ngrx/store";
import { CustomerCase } from "@cg/shared";
import { DetailState, MYBOOKING_DETAIL_FEATURE_KEY } from "./detail.reducer";

export const getDetailState = createFeatureSelector<DetailState>(MYBOOKING_DETAIL_FEATURE_KEY);

export const getCar = createSelector(getDetailState, (state: DetailState) => state?.customerCase.car ?? null);

export const getToastStatus = createSelector(getDetailState, (state: DetailState) =>
  state ? state.toastStatus : null
);

export const getCustomerCase = createSelector(getDetailState, (state: DetailState) =>
  state ? state.customerCase : null
);

export const getCustomerCaseEditContact = createSelector(
  getDetailState,
  (state: DetailState) => state?.customerCaseEditContact ?? null
);

export const getAppointment = createSelector(
  getCustomerCase,
  (customerCase: CustomerCase) => customerCase?.appointment ?? null
);

export const getDamages = createSelector(
  getCustomerCase,
  (customerCase: CustomerCase) => customerCase?.damages ?? null
);
