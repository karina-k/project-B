import { MyBookingNotificationStatus } from "@cg/my-booking-login";
import { CustomerCase, CustomerCaseEditContact } from "@cg/shared";

export interface MyBookingDetail {
  customerCase: CustomerCase;
  customerCaseEditContact: CustomerCaseEditContact;
  toastStatus: MyBookingNotificationStatus;
}
