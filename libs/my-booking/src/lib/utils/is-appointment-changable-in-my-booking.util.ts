import { appointmentChangeCarTypeList, CompromisedPart, CustomerCase, Damage } from "@cg/shared";

export const isAppointmentChangeableInMyBooking = (customerCase: CustomerCase): boolean =>
  customerCase.damages.length === 1 &&
  appointmentChangeCarTypeList.includes(customerCase.car.vehicleType) &&
  customerCase.damages[0].compromisedPart === CompromisedPart.FRONT;

export const isReplaceRequired = (customerCase: CustomerCase): boolean =>
  customerCase.damages.some((damage: Damage) => damage.requiredService === "REPLACE");
