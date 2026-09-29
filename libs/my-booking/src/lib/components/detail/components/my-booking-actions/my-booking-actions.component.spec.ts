import { CompromisedPart, Damage, OverlayService, VehicleTypeBranch } from "@cg/shared";
import { customerCase, damages } from "../../../../+state/mock.data";
import { MyBookingTrackingService } from "../../../../services/my-booking-tracking.service";
import { EditAppointmentByCallbackComponent, EditAppointmentComponent } from "../my-booking-overlays";
import { MyBookingActionsComponent } from "./my-booking-actions.component";

class FakeOverlayService {
  public open = jest.fn();
}

class FakeTrackingService {
  public trackFieldEvent = jest.fn();
  public trackEditAppointment = jest.fn();
}

describe("MyBookingActionsComponent", () => {
  let component: MyBookingActionsComponent;
  let overlayService: FakeOverlayService;
  let trackingService: FakeTrackingService;

  beforeEach(async () => {
    overlayService = new FakeOverlayService();
    trackingService = new FakeTrackingService();
    component = new MyBookingActionsComponent(
      overlayService as unknown as OverlayService,
      trackingService as unknown as MyBookingTrackingService
    );
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should toggle accordion", () => {
    component.accordionToggled();
    expect(component.expanded).toBeTruthy();

    component.accordionToggled();
    expect(component.expanded).toBeFalsy();
  });

  it("should call the open drawer function if cancel appointment button clicked", () => {
    component.customerCase = customerCase;
    component.cancelAppointment();
    expect(overlayService.open).toBeCalled();
    expect(trackingService.trackEditAppointment).toHaveBeenCalledWith(
      "cancel-appointment",
      "2022-09-07T07:30:00+02:00"
    );
  });

  describe("changeAppointment", () => {
    const trackedEvent = {
      eventAction: "edit-appointment",
      eventLabel: "my-booking/detail"
    };
    it("should open the edit appointment drawer", () => {
      component.customerCase = customerCase;

      component.changeAppointment();

      expect(overlayService.open).toBeCalledWith(EditAppointmentComponent, { customerCase });
      expect(trackingService.trackFieldEvent).toHaveBeenCalledWith(trackedEvent);
    });

    it("should open the callback appointment drawer due to multiple damages", () => {
      component.customerCase = { ...customerCase, damages: [customerCase.damages[0], customerCase.damages[0]] };

      component.changeAppointment();

      expect(overlayService.open).toBeCalledWith(EditAppointmentByCallbackComponent, {
        customerCase: component.customerCase
      });
      expect(trackingService.trackFieldEvent).toHaveBeenCalledWith(trackedEvent);
    });

    it("should open the callback appointment drawer due to vehicle type", () => {
      component.customerCase = { ...customerCase, car: { ...customerCase.car, vehicleType: VehicleTypeBranch.TRAIN } };

      component.changeAppointment();

      expect(overlayService.open).toBeCalledWith(EditAppointmentByCallbackComponent, {
        customerCase: component.customerCase
      });
      expect(trackingService.trackFieldEvent).toHaveBeenCalledWith(trackedEvent);
    });

    it("should open the callback appointment drawer due different compromised part", () => {
      const damage: Damage = { ...damages[0], compromisedPart: CompromisedPart.REAR };
      component.customerCase = { ...customerCase, damages: [damage] };

      component.changeAppointment();

      expect(overlayService.open).toBeCalledWith(EditAppointmentByCallbackComponent, {
        customerCase: component.customerCase
      });
      expect(trackingService.trackFieldEvent).toHaveBeenCalledWith(trackedEvent);
    });
  });
});
