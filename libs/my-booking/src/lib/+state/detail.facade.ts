import { Injectable } from "@angular/core";
import { select, Store } from "@ngrx/store";
import { take } from "rxjs/operators";
import { MyBookingNotificationStatus } from "@cg/my-booking-login";
import { AddressForm, Appointment, CustomerContactForm, UpdateCustomerRequest } from "@cg/shared";
import { CustomerProperyType } from "../enum";
import * as DetailActions from "./detail.actions";
import * as DetailSelectors from "./detail.selectors";

@Injectable({
  providedIn: "root"
})
export class DetailFacade {
  public damages$ = this.store.pipe(select(DetailSelectors.getDamages));
  public customerCase$ = this.store.pipe(select(DetailSelectors.getCustomerCase));
  public notificationStatus$ = this.store.pipe(select(DetailSelectors.getToastStatus));
  public customerCaseEditContact$ = this.store.pipe(select(DetailSelectors.getCustomerCaseEditContact));

  public constructor(private readonly store: Store) {}

  public getCustomerCaseOnRefresh(customerCaseId: string): void {
    this.store.dispatch(DetailActions.getCustomerCase({ payload: { customerCaseId } }));
  }

  public updateAddressOfCustomer(addressForm: AddressForm): void {
    this.customerCase$.pipe(take(1)).subscribe((customerCase) => {
      const customer = customerCase.customer;
      const updateCustomerRequest: UpdateCustomerRequest = {
        customerCaseId: customerCase.id,
        driver: {
          address: {
            addressLine1: addressForm.street,
            addressLine2: addressForm.street,
            zipCode: addressForm.zip,
            city: addressForm.city,
            country: addressForm.country,
            street: addressForm.street
          },
          contact: {
            titleDriver: addressForm.title,
            firstName: addressForm.firstname,
            lastName: addressForm.lastname,
            title: addressForm.title,
            email: customer.customerEmail,
            phone: customer.customerPhone1
          },
          optInEmail: false,
          optInSms: false
        }
      };
      this.store.dispatch(
        DetailActions.updateCustomer({
          payload: {
            customer: updateCustomerRequest,
            type: CustomerProperyType.ADDRESS
          }
        })
      );
    });
  }

  public updateContactOfCustomer(contactForm: CustomerContactForm): void {
    this.customerCase$.pipe(take(1)).subscribe((customerCase) => {
      const customer = customerCase.customer;
      const street = customer.customerShipAddressLine2 ?? customer.customerShipAddressLine1;
      const title = customer.customerTitle;
      const updateCustomerRequest: UpdateCustomerRequest = {
        customerCaseId: customerCase.id,
        driver: {
          address: {
            addressLine1: street,
            addressLine2: street,
            zipCode: customer.customerShipZipCode,
            city: customer.customerShipCity,
            country: customer.customerShipCountry,
            street
          },
          contact: {
            titleDriver: title,
            firstName: customer.customerFirstName,
            lastName: customer.customerLastName,
            title,
            email: contactForm.email,
            phone: contactForm.phone
          },
          optInEmail: false,
          optInSms: false
        }
      };
      this.store.dispatch(
        DetailActions.updateCustomer({
          payload: {
            customer: updateCustomerRequest,
            type: CustomerProperyType.CONTACT
          }
        })
      );
    });
  }

  public updateAppointmentOfCustomer(appointment: Appointment, prevAppointmentStartDate: string): void {
    const payload = {
      setAppointmentPayload: { ...appointment },
      prevAppointmentStartDate: prevAppointmentStartDate
    };
    this.store.dispatch(DetailActions.updateAppointment({ payload }));
  }

  public logout(isAutoLogout: boolean = false): void {
    this.store.dispatch(DetailActions.logout({ payload: isAutoLogout }));
  }

  public setNotificationStatus(status: MyBookingNotificationStatus | null): void {
    this.store.dispatch(DetailActions.setNotificationStatus({ payload: status }));
  }
}
