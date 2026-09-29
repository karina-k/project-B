import { ChangeDetectorRef, SimpleChange } from "@angular/core";
import { of } from "rxjs";
import { BreakpointService, RequiredService } from "@cg/shared";
import { appointment, car, customer, customerCaseEditContact } from "../../../../+state/mock.data";
import {
  addressContentCard,
  contactContactCard,
  damageDateContentCard,
  lpnContentnCard,
  paymentContentCard,
  toTakeWithContentCard
} from "../../../../mocks/content-card.mocks";
import { DetailService } from "../../../../services/detail.service";
import { MyBookingBookedDetailsComponent } from "./my-booking-booked-details.component";

class FakeDetailService {
  public createLpnContentCard = jest.fn(() => lpnContentnCard);
  public createAddressContentCard = jest.fn(() => addressContentCard);
  public createDamageDateContentCard = jest.fn(() => damageDateContentCard);
  public createToTakeWithContentCard$ = jest.fn(() => of(toTakeWithContentCard));
  public createContactContentCard = jest.fn(() => contactContactCard);
  public createPaymentContentCard = jest.fn(() => paymentContentCard);
}

class FakeBreakpointService {
  public isMatchingBreakpoint$ = jest.fn(() => of(false));
}

class FakeChangeDetectorRef {
  public detectChanges = jest.fn();
}

describe("MyBookingBookedDetailsComponent", () => {
  let component: MyBookingBookedDetailsComponent;
  let detailService: FakeDetailService;
  let breakpointService: FakeBreakpointService;
  let changeDetectorRef: FakeChangeDetectorRef;

  beforeEach(async () => {
    detailService = new FakeDetailService();
    breakpointService = new FakeBreakpointService();
    changeDetectorRef = new FakeChangeDetectorRef();

    component = new MyBookingBookedDetailsComponent(
      detailService as unknown as DetailService,
      breakpointService as unknown as BreakpointService,
      changeDetectorRef as unknown as ChangeDetectorRef
    );
    component.car = {
      brand: "test",
      model: "test",
      lpn: {
        numbers: "12",
        region: "aa",
        letters: "aa"
      }
    };
    component.requiredService = RequiredService.REPAIR;
    component.customerCaseId = "test";
    component.damages = [{ occurrenceDate: "2020-10-10" }];
    component.customerCaseEditContact = customerCaseEditContact;
    component.ngOnInit();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(detailService.createLpnContentCard).toBeCalledWith(component.car.lpn, true);
    expect(detailService.createPaymentContentCard).toBeCalledWith();
    expect(detailService.createAddressContentCard).toBeCalledWith(component.customerCaseEditContact, true);
    expect(detailService.createContactContentCard).toBeCalledWith(
      component.customerCaseEditContact,
      component.customerCaseId,
      false
    );
    expect(detailService.createDamageDateContentCard).toBeCalledWith(component.damages[0].occurrenceDate, true);
    expect(detailService.createToTakeWithContentCard$).toBeCalledWith(component.damages[0].occurrenceDate, true);

    expect(component.contentCardsRightColumn).toEqual([
      damageDateContentCard,
      toTakeWithContentCard,
      paymentContentCard
    ]);
    expect(component.contentCardsPartsLeftColumn).toEqual([lpnContentnCard, addressContentCard, contactContactCard]);
  });

  it("should change properties", async () => {
    component.ngOnChanges({
      appointment: {
        currentValue: {
          ...appointment,
          city: "München"
        }
      } as SimpleChange,
      car: {
        currentValue: {
          ...car,
          model: "Opel"
        }
      } as SimpleChange,
      customer: {
        currentValue: {
          ...customer,
          customerFirstName: "Test"
        }
      } as SimpleChange
    });
    expect(component.appointment.city).toEqual("München");
    expect(component.car.model).toEqual("Opel");
    expect(component.customerCaseEditContact.firstName).toEqual("Test");
  });
});
