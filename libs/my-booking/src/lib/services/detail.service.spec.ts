import { DatePipe, registerLocaleData } from "@angular/common";
import localeDe from "@angular/common/locales/de";
import localeDeExtra from "@angular/common/locales/extra/de";
import { lastValueFrom, of } from "rxjs";
import { take } from "rxjs/operators";
import { TranslocoService } from "@ngneat/transloco";
import { BreakpointService, CustomerCaseEditContact, OverlayService } from "@cg/shared";
import { customerCase, customerCaseEditContact } from "../+state/mock.data";
import { NoContactEditingComponent } from "../components/detail/components/my-booking-overlays";
import {
  addressContentCard,
  contactContactCard,
  damageDateContentCard,
  dateContentCard,
  locationContentCard,
  lpnContentnCard,
  paymentContentCard,
  toTakeWithContentCard
} from "../mocks/content-card.mocks";
import { DetailService } from "./detail.service";
import { MyBookingTrackingService } from "./my-booking-tracking.service";

registerLocaleData(localeDe, "de", localeDeExtra);

const translation = "text";

class FakeDatePipe {
  public transform = jest.fn((date, format) => new DatePipe("de").transform(date, format));
}

class FakeOverlayService {
  public open = jest.fn();
}

class FakeBreakpointService {
  public isTouch$ = of(false);
}

class FakeMyBookingTrackingService {
  public trackFieldEvent = jest.fn();
}

class FakeTranslocoService {
  public selectTranslate = jest.fn(() => of(translation));
}

describe("DetailService", () => {
  let service: DetailService;
  let overlayService: FakeOverlayService;
  let datePipe: FakeDatePipe;
  let breakpointService: FakeBreakpointService;
  let trackingService: FakeMyBookingTrackingService;
  let translocoService: FakeTranslocoService;

  beforeEach(() => {
    overlayService = new FakeOverlayService();
    datePipe = new FakeDatePipe();
    breakpointService = new FakeBreakpointService();
    trackingService = new FakeMyBookingTrackingService();
    translocoService = new FakeTranslocoService();

    service = new DetailService(
      datePipe as unknown as DatePipe,
      overlayService as unknown as OverlayService,
      breakpointService as unknown as BreakpointService,
      trackingService as unknown as MyBookingTrackingService,
      translocoService as unknown as TranslocoService
    );
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should create location ContentCard", () => {
    expect(service.createLocationContentCard(customerCase, true)).toEqual(locationContentCard);
  });

  it("should create Lpn ContentCard", () => {
    expect(service.createLpnContentCard(customerCase.car.lpn, true)).toEqual(lpnContentnCard);
  });

  describe("createAddressContentCard", () => {
    it("should create Address ContentCard", () => {
      const card = { ...addressContentCard, onEditClick: expect.any(Function) };
      expect(service.createAddressContentCard(customerCaseEditContact, true)).toEqual(card);
    });

    it("should open NoContactEditingComponent when clicked", () => {
      const card = service.createAddressContentCard(customerCaseEditContact, true);
      card.onEditClick();

      expect(overlayService.open).toHaveBeenCalledWith(NoContactEditingComponent);
      expect(trackingService.trackFieldEvent).toHaveBeenCalledWith({
        eventAction: "editing-not-possible",
        eventLabel: "customer-address"
      });
    });
  });

  it("should create DamageDate ContentCard", () => {
    expect(service.createDamageDateContentCard(customerCase.damages[0].occurrenceDate, true)).toEqual(
      damageDateContentCard
    );
  });

  it.each<[string, string]>([
    ["1970-01-01", "<ul><li>text</li><li>text</li></ul>"],
    [null, "<ul><li>text</li><li>text</li><li>text</li></ul>"]
  ])("should create ToTakeWith ContentCard of %s%", async (damageDate, text) => {
    const card = { ...toTakeWithContentCard, description: text };
    const contentCard = await lastValueFrom(service.createToTakeWithContentCard$(damageDate, true).pipe(take(1)));

    expect(contentCard).toEqual(card);
  });

  describe("createContactContentCard", () => {
    it("should create Contact ContentCard (mobile)", () => {
      const card = { ...contactContactCard, onEditClick: expect.any(Function) };
      expect(service.createContactContentCard(customerCaseEditContact, customerCase.id, true)).toEqual(card);
    });

    it("should create Contact ContentCard (landline)", () => {
      const card = { ...contactContactCard, onEditClick: expect.any(Function), description: "34t3@test.de</br>1234" };
      const testCustomerCaseCustomer: CustomerCaseEditContact = {
        ...customerCaseEditContact,
        phone: { mobile: null, landline: "1234" }
      };

      expect(service.createContactContentCard(testCustomerCaseCustomer, customerCase.id, true)).toEqual(card);
    });

    it("should open NoContactEditingComponent when clicked", () => {
      const card = service.createContactContentCard(customerCaseEditContact, customerCase.id, true);
      card.onEditClick();

      expect(overlayService.open).toHaveBeenCalledWith(NoContactEditingComponent);
      expect(trackingService.trackFieldEvent).toHaveBeenCalledWith({
        eventAction: "editing-not-possible",
        eventLabel: "customer-contact"
      });
    });
  });

  it("should create Date ContentCard", () => {
    datePipe.transform.mockReturnValueOnce("Mi.");
    datePipe.transform.mockReturnValueOnce("07.09.2022");
    datePipe.transform.mockReturnValueOnce("07:30");
    const card = { ...dateContentCard, onEditClick: expect.any(Function) };
    expect(service.createDateContentCard(customerCase, true)).toEqual(card);
  });

  it("should create payment content card", () => {
    expect(service.createPaymentContentCard()).toEqual(paymentContentCard);
  });

  it.each`
    isMobile
    ${false}
    ${true}
  `("should test isMobile $isMobile", async ({ isMobile }) => {
    breakpointService.isTouch$ = of(isMobile);
    const result = await lastValueFrom(service.isMobile$);
    expect(result).toEqual(isMobile);
  });
});
