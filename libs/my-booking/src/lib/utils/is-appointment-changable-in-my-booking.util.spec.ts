import { CompromisedPart, VehicleTypeBranch } from "@cg/shared";
import { customerCase } from "../+state/mock.data";
import { isAppointmentChangeableInMyBooking } from "./is-appointment-changable-in-my-booking.util";

describe("isAppointmentChangeableInMyBooking", () => {
  it("should be changable", () => {
    const res = isAppointmentChangeableInMyBooking(customerCase);
    expect(res).toBeTruthy();
  });

  describe("should NOT be changable", () => {
    it("multiple damages", () => {
      const res = isAppointmentChangeableInMyBooking({
        ...customerCase,
        damages: [customerCase.damages[0], customerCase.damages[0]]
      });
      expect(res).toBeFalsy();
    });

    it("wrong vehicleType", () => {
      const res = isAppointmentChangeableInMyBooking({
        ...customerCase,
        car: {
          ...customerCase.car,
          vehicleType: VehicleTypeBranch.BUS
        }
      });
      expect(res).toBeFalsy();
    });

    it.each`
      compromisedPart
      ${CompromisedPart.LEFT_SIDE}
      ${CompromisedPart.RIGHT_SIDE}
      ${CompromisedPart.REAR}
      ${CompromisedPart.ROOF}
      ${CompromisedPart.OTHER}
    `("wrong compromisedPart", ({ compromisedPart }: { compromisedPart: CompromisedPart }) => {
      const res = isAppointmentChangeableInMyBooking({
        ...customerCase,
        damages: [{ ...customerCase.damages[0], compromisedPart }]
      });
      expect(res).toBeFalsy();
    });
  });
});
