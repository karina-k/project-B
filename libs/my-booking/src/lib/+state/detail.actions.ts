import { createAction, props } from "@ngrx/store";
import { MyBookingNotificationStatus } from "@cg/my-booking-login";
import { CustomerObjects, SetAppointmentPayload, UpdateCustomerRequest } from "@cg/shared";
import { CustomerProperyType } from "../enum";
import { MyBookingDetail } from "../interfaces/my-booking-detail.interface";
import { MyBookingUpdateAppointment } from "../interfaces/my-booking-update-appointment.interface";

export const setMybookingDetailObject = createAction(
  "[Detail/API] Set MyBooking Detail Object",
  props<{ payload: MyBookingDetail }>()
);

export const updateCustomer = createAction(
  "[Detail/API] Update Customer",
  props<{ payload: { customer: UpdateCustomerRequest; type: CustomerProperyType } }>()
);

export const updateCustomerSuccessReceived = createAction(
  "[Detail/API] Update Customer Success Received",
  props<{ payload: CustomerObjects }>()
);

export const updateCustomerFailureReceived = createAction("[Detail/API] Update Customer Failure Received");

export const getCustomerCase = createAction(
  "[Detail/API] Get Customer Case",
  props<{ payload: { customerCaseId: string } }>()
);

export const getCustomerCaseFailureReceived = createAction(
  "[Detail/API] Get Customer Case On Refresh Failure Received"
);

export const logout = createAction("[Detail/API] Log Out", props<{ payload: boolean }>());

export const resetState = createAction("[Detail/API] Reset State");

export const setNotificationStatus = createAction(
  "[Detail/API] Set Toast Status",
  props<{ payload: MyBookingNotificationStatus }>()
);

export const updateAppointment = createAction(
  "[Detail/API] Update Appointment",
  props<{ payload: MyBookingUpdateAppointment }>()
);

export const updateAppointmentSuccessReceived = createAction(
  "[Detail/API] Update Appointment Success Received",
  props<{ payload: SetAppointmentPayload }>()
);

export const updateAppointmentFailureReceived = createAction("[Detail/API] Update Appointment Failure Received");
