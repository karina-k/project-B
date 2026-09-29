import { SetAppointmentPayload } from "@cg/shared";

export interface MyBookingUpdateAppointment {
  setAppointmentPayload: SetAppointmentPayload;
  prevAppointmentStartDate: string;
}
