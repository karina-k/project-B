import { Component } from "@angular/core";
import { of } from "rxjs";
import { TranslocoService } from "@ngneat/transloco";
import { Paragraph } from "@cg/content-api/typescript-interfaces";
import { CompromisedPart, Damage, OverlayService, VehicleTypeBranch, VehicleTypeProductService } from "@cg/shared";
import { customerCase, damages } from "../../../../../+state/mock.data";
import { MyBookingTrackingService } from "../../../../../services/my-booking-tracking.service";
import { EditAppointmentComponent } from "../edit-appointment/edit-appointment.component";
import { EditAppointmentByCallbackComponent } from "../edit-appointment-by-callback/edit-appointment-by-callback.component";
import { CancelAppointmentComponent } from "./cancel-appointment.component";

class FakeOverlayService {
  public close = jest.fn();
  public open = jest.fn();
}

class FakeMyBookingTrackingService {
  public trackEditAppointment = jest.fn();
}

const translation = "translation";

class FakeTranslocoService {
  public translate = jest.fn(() => translation);
  public selectTranslate = jest.fn(() => of(translation));
}

describe("CancelAppointmentComponent", () => {
  let component: CancelAppointmentComponent;
  let overlayService: FakeOverlayService;
  let myBookingTrackingService: FakeMyBookingTrackingService;
  let translocoService: FakeTranslocoService;

  beforeEach(async () => {
    overlayService = new FakeOverlayService();
    myBookingTrackingService = new FakeMyBookingTrackingService();
    translocoService = new FakeTranslocoService();
    component = new CancelAppointmentComponent(
      overlayService as unknown as OverlayService,
      myBookingTrackingService as unknown as MyBookingTrackingService,
      translocoService as unknown as TranslocoService
    );
    component.customerCase = customerCase;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("ngOnInit should initialise text", () => {
    component.ngOnInit();
    const expectedParagraph: Paragraph = {
      text: translation,
      ngTemplate: "cgParagraph"
    };

    expect(component.text).toStrictEqual(expectedParagraph);
  });

  describe("changeAppointment", () => {
    const expectedTrackedEvent = "edit-appointment";

    it("should open the edit appointment drawer", () => {
      component.customerCase = customerCase;

      component.changeAppointment();

      expect(overlayService.close).toBeCalled();
      expect(overlayService.open).toBeCalledWith(EditAppointmentComponent, { customerCase });
      expect(myBookingTrackingService.trackEditAppointment).toBeCalledWith(
        expectedTrackedEvent,
        component.customerCase.appointment.jobStart
      );
    });

    it("should open the callback appointment drawer due to multiple damages", () => {
      component.customerCase = { ...customerCase, damages: [customerCase.damages[0], customerCase.damages[0]] };

      component.changeAppointment();

      expect(overlayService.close).toBeCalled();
      expect(overlayService.open).toBeCalledWith(EditAppointmentByCallbackComponent, {
        customerCase: component.customerCase
      });
    });

    it.each`
      vehicleType                                  | drawerComponent
      ${VehicleTypeBranch.CAR}                     | ${EditAppointmentComponent}
      ${VehicleTypeProductService.CAR}             | ${EditAppointmentComponent}
      ${VehicleTypeProductService.CABRIO}          | ${EditAppointmentComponent}
      ${VehicleTypeProductService.COMBI}           | ${EditAppointmentComponent}
      ${VehicleTypeProductService.COUPE}           | ${EditAppointmentComponent}
      ${VehicleTypeProductService.HARDTOP}         | ${EditAppointmentComponent}
      ${VehicleTypeProductService.JEEP}            | ${EditAppointmentComponent}
      ${VehicleTypeProductService.JEEP_SUV}        | ${EditAppointmentComponent}
      ${VehicleTypeProductService.SUV}             | ${EditAppointmentComponent}
      ${VehicleTypeProductService.PICKUP}          | ${EditAppointmentComponent}
      ${VehicleTypeProductService.PLANKBED}        | ${EditAppointmentComponent}
      ${VehicleTypeProductService.PLANKBED_PICKUP} | ${EditAppointmentComponent}
      ${VehicleTypeProductService.ROADSTER}        | ${EditAppointmentComponent}
      ${VehicleTypeProductService.TARGA}           | ${EditAppointmentComponent}
      ${VehicleTypeBranch.TRAIN}                   | ${EditAppointmentByCallbackComponent}
      ${VehicleTypeBranch.UNKNOWN}                 | ${EditAppointmentByCallbackComponent}
      ${VehicleTypeBranch.TRUCK}                   | ${EditAppointmentByCallbackComponent}
      ${VehicleTypeBranch.BUS}                     | ${EditAppointmentByCallbackComponent}
      ${VehicleTypeProductService.TRUCK}           | ${EditAppointmentByCallbackComponent}
      ${VehicleTypeProductService.BUS}             | ${EditAppointmentByCallbackComponent}
      ${VehicleTypeProductService.X}               | ${EditAppointmentByCallbackComponent}
      ${VehicleTypeProductService.SPECIAL_VEHICLE} | ${EditAppointmentByCallbackComponent}
    `(
      "should open the correct drawer due to vehicle type ($vehicleType)",
      ({
        vehicleType,
        drawerComponent
      }: {
        vehicleType: VehicleTypeBranch | VehicleTypeProductService;
        drawerComponent: Component;
      }) => {
        component.customerCase = { ...customerCase, car: { ...customerCase.car, vehicleType } };

        component.changeAppointment();

        expect(overlayService.close).toBeCalled();
        expect(overlayService.open).toBeCalledWith(drawerComponent, {
          customerCase: component.customerCase
        });
      }
    );

    it("should open the callback appointment drawer due different compromised part", () => {
      const damage: Damage = { ...damages[0], compromisedPart: CompromisedPart.REAR };
      component.customerCase = { ...customerCase, damages: [damage] };

      component.changeAppointment();

      expect(overlayService.close).toBeCalled();
      expect(overlayService.open).toBeCalledWith(EditAppointmentByCallbackComponent, {
        customerCase: component.customerCase
      });
      expect(myBookingTrackingService.trackEditAppointment).toBeCalledWith(
        expectedTrackedEvent,
        component.customerCase.appointment.jobStart
      );
    });
  });
});
