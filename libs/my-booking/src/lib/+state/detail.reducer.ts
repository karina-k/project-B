import { Action, createReducer, on } from "@ngrx/store";
import { MyBookingNotificationStatus } from "@cg/my-booking-login";
import { AppointmentResponse, CustomerCase, CustomerCaseEditContact } from "@cg/shared";
import * as DetailActions from "./detail.actions";

export const MYBOOKING_DETAIL_FEATURE_KEY = "myBookingDetail";

export interface DetailState {
  customerCaseEditContact: CustomerCaseEditContact;
  customerCase: CustomerCase;
  toastStatus: MyBookingNotificationStatus | null;
  appointmentState: {
    nextLoadingLimitReached: boolean;
  };
  availableAppointments: AppointmentResponse;
}

export interface DetailPartialState {
  readonly [MYBOOKING_DETAIL_FEATURE_KEY]: DetailState;
}

export const initialState: DetailState = {
  customerCaseEditContact: null,
  customerCase: null,
  toastStatus: null,
  availableAppointments: null,
  appointmentState: null
};

const detailReducer = createReducer(
  initialState,
  on(DetailActions.setMybookingDetailObject, (state, action) => ({
    ...state,
    customerCase: action.payload.customerCase,
    customerCaseEditContact: action.payload.customerCaseEditContact
  })),
  on(DetailActions.updateCustomerFailureReceived, DetailActions.updateAppointmentFailureReceived, (state) => ({
    ...state,
    toastStatus: MyBookingNotificationStatus.ERROR
  })),
  on(DetailActions.updateCustomerSuccessReceived, (state, action) => {
    const contact = action.payload.driver.contact;
    const address = action.payload.driver.address;
    state = {
      ...state,
      customerCase: {
        ...state.customerCase,
        customer: {
          ...state.customerCase.customer,
          customerEmail: contact.email,
          customerPhone1: contact.phone,
          customerPhone2: contact.phone,
          customerTitle: contact.title,
          customerFirstName: contact.firstName,
          customerLastName: contact.lastName,
          customerShipAddressLine2: address.street,
          customerShipZipCode: address.zipCode,
          customerShipCity: address.city,
          customerShipCountry: address.country
        }
      },
      toastStatus: MyBookingNotificationStatus.SUCCESS
    };
    return state;
  }),
  on(DetailActions.updateAppointmentSuccessReceived, (state, action) => {
    const updatedAppointment = action.payload;
    state = {
      ...state,
      customerCase: {
        ...state.customerCase,
        appointment: {
          ...state.customerCase.appointment,
          availabilityPeriodEnd: updatedAppointment.availabilityPeriodEnd,
          availabilityPeriodStart: updatedAppointment.availabilityPeriodStart,
          jobEnd: updatedAppointment.jobEnd,
          jobStart: updatedAppointment.jobStart,
          city: updatedAppointment.city,
          fitterId: updatedAppointment.fitterId,
          id: updatedAppointment.appointmentId,
          postalCode: updatedAppointment.postalCode,
          street: updatedAppointment.street,
          location: updatedAppointment.serviceCenter
        }
      },
      toastStatus: MyBookingNotificationStatus.SUCCESS
    };
    return state;
  }),
  on(DetailActions.resetState, () => ({
    ...initialState
  })),
  on(DetailActions.setNotificationStatus, (state, action) => ({
    ...state,
    toastStatus: action.payload
  }))
);

export function reducer(state: DetailState, action: Action): DetailState {
  return detailReducer(state, action);
}
