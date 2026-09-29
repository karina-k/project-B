import { MyBookingNotificationStatus } from "@cg/my-booking-login";
import { DetailPartialState } from "./detail.reducer";
import * as DetailSelectors from "./detail.selectors";
import { appointment, car, customerCase, customerCaseEditContact, damages } from "./mock.data";

describe("Detail Selectors", () => {
  let state: DetailPartialState;

  beforeEach(() => {
    state = {
      myBookingDetail: {
        customerCase,
        customerCaseEditContact,
        toastStatus: MyBookingNotificationStatus.ERROR,
        appointmentState: null,
        availableAppointments: null
      }
    };
  });

  it("getAppointment() should return the appointment state", () => {
    const result = DetailSelectors.getAppointment(state);
    expect(result).toEqual(appointment);
  });

  it("getCar() should return the car state", () => {
    const result = DetailSelectors.getCar(state);
    expect(result).toEqual(car);
  });

  it("getDamages() should return the damages state", () => {
    const result = DetailSelectors.getDamages(state);
    expect(result).toEqual(damages);
  });

  it("getToastStatus() should return the toast status state", () => {
    const result = DetailSelectors.getToastStatus(state);
    expect(result).toEqual(MyBookingNotificationStatus.ERROR);
  });

  it("getToastStatus() should return the customer case state", () => {
    const result = DetailSelectors.getCustomerCase(state);
    expect(result).toEqual(customerCase);
  });

  it("getCustomerCaseEditContact() should return the customer case edit contact state", () => {
    const testState = {
      ...state,
      myBookingDetail: {
        ...state.myBookingDetail,
        customerCaseEditContact: customerCaseEditContact
      }
    };

    const result = DetailSelectors.getCustomerCaseEditContact(testState);
    expect(result).toEqual(customerCaseEditContact);
  });
});
