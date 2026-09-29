import { GoogleTagManagerService } from "@cg/analytics";
import { DamageWindow } from "@cg/shared";
import { MyBookingTrackingService } from "./my-booking-tracking.service";

class FakeGoogleTagManagerService {
  public trackEvent = jest.fn();
}

describe("MyBookingTrackingService", () => {
  let service: MyBookingTrackingService;
  let googleTagManagerService: FakeGoogleTagManagerService;

  const eventCategory = "my-booking";
  const detailEventLabel = "my-booking/detail";

  beforeEach(() => {
    googleTagManagerService = new FakeGoogleTagManagerService();
    service = new MyBookingTrackingService(googleTagManagerService as unknown as GoogleTagManagerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it.each`
    mapEventLabel
    ${"maps-link"}
    ${"text-link"}
  `("should track map events", async ({ mapEventLabel }) => {
    service.trackFieldEvent({ eventLabel: mapEventLabel, eventAction: "route-planning" });

    expect(googleTagManagerService.trackEvent).toHaveBeenCalledWith({
      eventCategory,
      eventLabel: mapEventLabel,
      eventAction: "route-planning"
    });
  });

  it("should track edit appointment (edit or cancel) event", () => {
    const date = new Date().toString();

    service.trackEditAppointment("cancel-appointment", date, date);

    expect(googleTagManagerService.trackEvent).toHaveBeenCalledWith({
      eventCategory,
      eventLabel: detailEventLabel,
      eventAction: "cancel-appointment",
      appointment: {
        "canceled-days-before": 0,
        "canceled-hours-before": 0
      }
    });

    service.trackEditAppointment("appointment-edited", date, date);

    expect(googleTagManagerService.trackEvent).toHaveBeenCalledWith({
      eventCategory,
      eventLabel: detailEventLabel,
      eventAction: "appointment-edited",
      appointment: {
        "days-until": 0,
        "days-changed-to-appointment": 0,
        edited: "later-date"
      }
    });
  });

  it.each`
    eventAction
    ${"customer-address-edited"}
    ${"customer-contact-edited"}
  `("should track edit customer (contact or address) events", async ({ eventAction }) => {
    service.trackEditCustomer(eventAction, new Date().toString());

    expect(googleTagManagerService.trackEvent).toHaveBeenCalledWith({
      eventCategory,
      eventLabel: detailEventLabel,
      eventAction,
      appointment: {
        "days-until": 0
      }
    });
  });

  it.each`
    damageWindow              | requiredService | isOrganization | eventLabel                | eventAction
    ${DamageWindow.FRONT}     | ${"repair"}     | ${true}        | ${"editing-not-possible"} | ${"windscreen"}
    ${DamageWindow.REAR}      | ${"repair"}     | ${true}        | ${"editing-not-possible"} | ${"rear-window"}
    ${DamageWindow.ROOF}      | ${"replace"}    | ${false}       | ${"editing-possible"}     | ${"sunroof"}
    ${DamageWindow.LEFT_SIDE} | ${"replace"}    | ${false}       | ${"editing-possible"}     | ${"side-window"}
  `(
    "should track appointmentDetails",
    ({
      damageWindow,
      requiredService,
      isOrganization,
      eventLabel,
      eventAction
    }: {
      damageWindow: DamageWindow;
      requiredService: "repair" | "replace";
      isOrganization: boolean;
      eventLabel: string;
      eventAction: string;
    }) => {
      service.trackAppointmentDetails(damageWindow, requiredService, isOrganization);

      expect(googleTagManagerService.trackEvent).toHaveBeenCalledWith({
        eventCategory,
        eventLabel,
        eventAction,
        appointment: {
          "job-type": requiredService
        }
      });
    }
  );

  it("should track edit appointment events", () => {
    expect(service).toBeTruthy();
  });
});
