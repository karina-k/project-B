import { MyBookingNotificationStatus } from "@cg/my-booking-login";
import { Appointment, CustomerObjects } from "@cg/shared";
import { MyBookingDetail } from "../interfaces/my-booking-detail.interface";
import * as DetailActions from "./detail.actions";
import { DetailState, initialState, reducer } from "./detail.reducer";
import {
  appointment,
  car,
  customer,
  customerCase,
  customerCaseEditContact,
  damages,
  updateCustomerRequest
} from "./mock.data";

describe("Detail Reducer", () => {
  const myBookingDetail = {
    customerCase,
    customerCaseEditContact
  } as MyBookingDetail;

  it("setMybookingDetailObject should set properties in store", () => {
    const action = DetailActions.setMybookingDetailObject({ payload: myBookingDetail });

    const result: DetailState = reducer(initialState, action);

    expect(result.customerCase.customer).toEqual(customer);
    expect(result.customerCase.car).toEqual(car);
    expect(result.customerCase.damages).toEqual(damages);
    expect(result.customerCase.appointment).toEqual(appointment);
    expect(result.customerCaseEditContact).toEqual(customerCaseEditContact);
  });

  it("updateCustomerSuccessReceived should update the store", () => {
    const action1 = DetailActions.setMybookingDetailObject({ payload: myBookingDetail });
    let result: DetailState = reducer(initialState, action1);

    updateCustomerRequest.driver.contact.firstName = "Dieter";
    const action2 = DetailActions.updateCustomerSuccessReceived({
      payload: {
        ...updateCustomerRequest
      } as CustomerObjects
    });
    result = reducer(result, action2);

    expect(result.customerCase.customer.customerFirstName).toEqual("Dieter");
    expect(result.toastStatus).toEqual(MyBookingNotificationStatus.SUCCESS);
  });

  it("updateCustomerFailureReceived should set the error toast status", () => {
    const action1 = DetailActions.setMybookingDetailObject({ payload: myBookingDetail });
    let result: DetailState = reducer(initialState, action1);

    const action2 = DetailActions.updateCustomerFailureReceived();
    result = reducer(result, action2);

    expect(result.toastStatus).toEqual(MyBookingNotificationStatus.ERROR);
  });

  it("updateAppointmentSuccessReceived should update the store", () => {
    const action1 = DetailActions.setMybookingDetailObject({ payload: myBookingDetail });
    let result: DetailState = reducer(initialState, action1);

    const payload = {
      sublocality: "",
      appointmentId: appointment.id,
      serviceCenter: appointment.location
    } as Appointment;
    const action = DetailActions.updateAppointmentSuccessReceived({ payload });
    result = reducer(result, action);

    expect(result.toastStatus).toEqual(MyBookingNotificationStatus.SUCCESS);
    expect(result.customerCase.appointment.id).toEqual(payload.appointmentId);
    expect(result.customerCase.appointment.location).toEqual(payload.serviceCenter);
  });

  it("resetState should reset the store", () => {
    const action = DetailActions.resetState();
    const result: DetailState = reducer(
      {
        customerCase: null,
        customerCaseEditContact: null,
        toastStatus: null,
        appointmentState: null,
        availableAppointments: null
      },
      action
    );
    expect(result.customerCase).toEqual(null);
  });

  it("setNotificationStatus should set the toast status", () => {
    const action = DetailActions.setNotificationStatus({ payload: MyBookingNotificationStatus.ERROR });
    const result: DetailState = reducer(
      {
        customerCase: null,
        customerCaseEditContact: null,
        toastStatus: null,
        appointmentState: null,
        availableAppointments: null
      },
      action
    );
    expect(result.toastStatus).toEqual(MyBookingNotificationStatus.ERROR);
  });
});
