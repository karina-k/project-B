import { SimpleChange } from "@angular/core";
import { lastValueFrom, of } from "rxjs";
import { AppointmentService } from "@cg/appointment-ui";
import { CustomerCase, CustomerCaseAppointment } from "@cg/shared";
import { DetailService, MyBookingTrackingService } from "../../../../services";
import { MyBookingBookedAppointmentComponent } from "./my-booking-booked-appointment.component";

const googleMapsRouteHref = "googleMapsRouteHref";

class FakeAppointmentService {
  public buildCalendarHref = jest.fn(() => "");
  public buildGoogleMapsRouteHref = jest.fn(() => googleMapsRouteHref);
}

class FakeDetailService {
  public isMobile$ = of(false);
  public createDateContentCard = jest.fn(() => ({
    description: "appointment.appointmentInfoText.texts.repair",
    firstCellIcon: {
      name: "ic_calendar",
      src: "https://assets.example.com/icons/ic_calendar.svg"
    },
    id: "date",
    isSubtitleVisibleOnMobile: true,
    subtitle: "myBooking.detail.oclock",
    subtitleTranslationParam: {
      time: "07:30"
    },
    title: "Mi. 07.09.2022",
    showAsTileOnMobile: false
  }));
  public createLocationContentCard = jest.fn(() => ({
    description: "",
    firstCellIcon: {
      name: "ic_pin_map_line",
      src: "https://assets.example.com/icons/ic_pin_map_line.svg"
    },
    id: "location",
    subtitle: "Subbelrather Straße 387<br>50825 Köln",
    title: "Booking<sup>®</sup> Köln",
    hasSeparatorLine: true
  }));
}

class FakeTrackingService {
  public trackFieldEvent = jest.fn();
}

describe("MyBookingBookedAppointmentComponent", () => {
  let component: MyBookingBookedAppointmentComponent;
  let appointmentService: FakeAppointmentService;
  let detailService: FakeDetailService;
  let trackingService: FakeTrackingService;

  beforeEach(async () => {
    appointmentService = new FakeAppointmentService();
    detailService = new FakeDetailService();
    trackingService = new FakeTrackingService();

    component = new MyBookingBookedAppointmentComponent(
      appointmentService as unknown as AppointmentService,
      detailService as unknown as DetailService,
      trackingService as unknown as MyBookingTrackingService
    );
    component.customerCase = {
      appointment: { location: "111" } as CustomerCaseAppointment,
      status: null,
      entryChannel: null,
      aeNummer: null,
      customer: null
    };
  });

  it("should create", () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
    expect(component.googleMapsRouteHref).toEqual(googleMapsRouteHref);
    expect(component.contentCards).toEqual([
      {
        description: "appointment.appointmentInfoText.texts.repair",
        firstCellIcon: {
          name: "ic_calendar",
          src: "https://assets.example.com/icons/ic_calendar.svg"
        },
        id: "date",
        isSubtitleVisibleOnMobile: true,
        showAsTileOnMobile: false,
        subtitle: "myBooking.detail.oclock",
        subtitleTranslationParam: {
          time: "07:30"
        },
        title: "Mi. 07.09.2022"
      },
      {
        description: "",
        firstCellIcon: {
          name: "ic_pin_map_line",
          src: "https://assets.example.com/icons/ic_pin_map_line.svg"
        },
        hasSeparatorLine: true,
        id: "location",
        subtitle: "Subbelrather Straße 387<br>50825 Köln",
        title: "Booking<sup>®</sup> Köln"
      }
    ]);
  });

  it("should be not mobile", async () => {
    const isMobile = await lastValueFrom(component.isMobile$);
    expect(isMobile).toBeFalsy();
  });

  it("should update customerCase on ngOnChanges", () => {
    component.ngOnChanges({
      customerCase: {
        currentValue: {
          appointment: {}
        } as CustomerCase
      } as SimpleChange
    });
    expect(component.customerCase).toEqual({
      appointment: {}
    });
    expect(detailService.createDateContentCard).toBeCalled();
    expect(detailService.createLocationContentCard).toBeCalled();
  });

  it.each`
    mapEventLabel
    ${"maps-link"}
    ${"text-link"}
  `("should track map events", async ({ mapEventLabel }) => {
    component.trackRoutePlaningEvent(mapEventLabel);

    expect(trackingService.trackFieldEvent).toHaveBeenCalledWith({
      eventLabel: mapEventLabel,
      eventAction: "route-planning"
    });
  });

  it("should track calendar events", async () => {
    component.trackCalendarEvent("text-link");

    expect(trackingService.trackFieldEvent).toHaveBeenCalledWith({
      eventLabel: "text-link",
      eventAction: "save-to-calendar"
    });
  });
});
