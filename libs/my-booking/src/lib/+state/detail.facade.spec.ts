import { Store } from "@ngrx/store";
import { of } from "rxjs";
import { Appointment, UpdateCustomerRequest } from "@cg/shared";
import { CustomerProperyType } from "../enum";
import * as DetailActions from "./detail.actions";
import { DetailFacade } from "./detail.facade";
import { customer, customerCase } from "./mock.data";

describe("DetailFacade", () => {
  let store: Partial<Store>;
  let facade: DetailFacade;

  beforeEach(() => {
    store = {
      dispatch: jest.fn(),
      pipe: jest.fn()
    };

    facade = new DetailFacade(store as Store);
    facade.customerCase$ = of(customerCase);
  });

  it("should be defined", () => {
    expect(facade).toBeDefined();
  });

  it("should logout if autologout", () => {
    facade.logout(true);
    expect(store.dispatch).toHaveBeenNthCalledWith(1, DetailActions.logout({ payload: true }));
  });

  it("should dispatch getCustomerCaseOnRefresh", () => {
    facade.getCustomerCaseOnRefresh("1234");
    expect(store.dispatch).toHaveBeenNthCalledWith(
      1,
      DetailActions.getCustomerCase({ payload: { customerCaseId: "1234" } })
    );
  });

  it("should logout if manual autologout", () => {
    facade.logout(false);
    expect(store.dispatch).toHaveBeenNthCalledWith(1, DetailActions.logout({ payload: false }));
  });

  it("should dispatch updateCustomer of updateAddressOfCustomer", () => {
    const street = "Teststraße 33";
    const zip = "12345";
    const city = "München";
    const country = "DE";
    const title = "Herr";
    const firstname = "David";
    const lastname = "Test";
    facade.updateAddressOfCustomer({ zip, city, country, street, lastname, firstname, title });
    const result: UpdateCustomerRequest = {
      customerCaseId: customerCase.id,
      driver: {
        address: {
          addressLine1: street,
          addressLine2: street,
          zipCode: zip,
          city,
          country,
          street
        },
        contact: {
          titleDriver: title,
          firstName: firstname,
          lastName: lastname,
          title,
          email: customer.customerEmail,
          phone: customer.customerPhone1
        },
        optInEmail: false,
        optInSms: false
      }
    };
    expect(store.dispatch).toHaveBeenNthCalledWith(
      1,
      DetailActions.updateCustomer({
        payload: {
          customer: result,
          type: CustomerProperyType.ADDRESS
        }
      })
    );
  });

  it("should dispatch updateCustomer of updateContactOfCustomer", () => {
    facade.updateContactOfCustomer({ email: customer.customerEmail, phone: customer.customerPhone1 });
    const street = customer.customerBillAddressLine2;
    const title = customer.customerTitle;
    const result: UpdateCustomerRequest = {
      customerCaseId: customerCase.id,
      driver: {
        address: {
          addressLine1: street,
          addressLine2: street,
          zipCode: customer.customerShipZipCode,
          city: customer.customerBillCity,
          country: customer.customerBillCountry,
          street
        },
        contact: {
          titleDriver: title,
          firstName: customer.customerFirstName,
          lastName: customer.customerLastName,
          title,
          email: customer.customerEmail,
          phone: customer.customerPhone1
        },
        optInEmail: false,
        optInSms: false
      }
    };
    expect(store.dispatch).toHaveBeenNthCalledWith(
      1,
      DetailActions.updateCustomer({
        payload: {
          type: CustomerProperyType.CONTACT,
          customer: result
        }
      })
    );
  });

  it("should dispatch updateAppointment of updateAppointmentOfCustomer", () => {
    const updatedAppointment = {
      appointmentId: "1231"
    } as Appointment;
    const prevAppointmentStartDate = "2022-09-07T07:30:00+02:00";

    facade.updateAppointmentOfCustomer(updatedAppointment, prevAppointmentStartDate);
    expect(store.dispatch).toHaveBeenNthCalledWith(
      1,
      DetailActions.updateAppointment({
        payload: {
          prevAppointmentStartDate,
          setAppointmentPayload: updatedAppointment
        }
      })
    );
  });

  it("should dispatch setNotificationStatus", () => {
    facade.setNotificationStatus(null);
    expect(store.dispatch).toHaveBeenNthCalledWith(1, DetailActions.setNotificationStatus({ payload: null }));
  });
});
