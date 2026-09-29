import { SimpleChange, SimpleChanges } from "@angular/core";
import { lastValueFrom, of } from "rxjs";
import { TranslocoService } from "@ngneat/transloco";
import { CompromisedPart, compromisedPartTranslationKey, Damage } from "@cg/shared";
import { MyBookingDetailHeaderComponent } from "./my-booking-detail-header.component";

class FakeTranslocoService {
  public selectTranslate = jest.fn((key: string) => of(key));
}

const customerName = "TestName";
const orderNumber = "1234";
const damages: Damage[] = [{ compromisedPart: CompromisedPart.REAR }];

describe("AppointmentHeaderComponent", () => {
  let component: MyBookingDetailHeaderComponent;
  let translocoService: FakeTranslocoService;

  beforeEach(async () => {
    translocoService = new FakeTranslocoService();

    component = new MyBookingDetailHeaderComponent(translocoService as unknown as TranslocoService);
    component.orderNumber = orderNumber;
    component.customerName = customerName;
    component.damages = damages;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should check orderNumberInfo", async () => {
    component.ngOnInit();
    expect(await lastValueFrom(component.orderNumberInfo$)).toEqual("myBooking.detail.orderNumberInfo");
  });

  it("should change properties", async () => {
    component.ngOnChanges({
      customerName: {
        currentValue: "test2"
      } as SimpleChange,
      orderNumber: {
        currentValue: "123456"
      } as SimpleChange
    });
    expect(component.customerName).toEqual("test2");
    expect(component.orderNumber).toEqual("123456");
  });

  it.each`
    changedCustomerName | changedOrderNumber | expectedCustomerName | expectedOrderNumber
    ${null}             | ${"12"}            | ${customerName}      | ${"12"}
    ${null}             | ${null}            | ${customerName}      | ${orderNumber}
    ${"NeuerName"}      | ${null}            | ${"NeuerName"}       | ${orderNumber}
    ${"Super"}          | ${"1234"}          | ${"Super"}           | ${"1234"}
  `(
    "should test isMobile $isMobile",
    async ({ changedCustomerName, changedOrderNumber, expectedCustomerName, expectedOrderNumber }) => {
      let changes: SimpleChanges = {
        customerName: {
          currentValue: changedCustomerName
        } as SimpleChange,
        orderNumber: {
          currentValue: changedOrderNumber
        } as SimpleChange
      };
      if (changedCustomerName && !changedOrderNumber) {
        changes = {
          customerName: {
            currentValue: changedCustomerName
          } as SimpleChange
        };
      } else if (!changedCustomerName && changedOrderNumber) {
        changes = {
          orderNumber: {
            currentValue: changedOrderNumber
          } as SimpleChange
        };
      } else if (!changedCustomerName && !changedOrderNumber) {
        changes = {};
      }
      component.ngOnChanges(changes);
      expect(component.customerName).toEqual(expectedCustomerName);
      expect(component.orderNumber).toEqual(expectedOrderNumber);
    }
  );

  it.each<[string, string]>([
    ["REPAIR", "myBooking.detail.damageTypeRepair"],
    ["REPLACE", "myBooking.detail.damageTypeReplace"]
  ])("should set correct damage type for %s", async (damageType: string, translationKey: string) => {
    component.damages[0].requiredService = damageType;

    component.ngOnInit();

    expect(await lastValueFrom(component.damageTypeDescription$)).toEqual(translationKey);
    expect(translocoService.selectTranslate).nthCalledWith(
      1,
      compromisedPartTranslationKey[component.damages[0].compromisedPart]
    );
  });

  it("should set correct damage type for multiple damage", async () => {
    component.damages = component.damages.concat(component.damages);

    component.ngOnInit();

    expect(await lastValueFrom(component.damageTypeDescription$)).toEqual("myBooking.detail.multipleDamages");
    expect(translocoService.selectTranslate).nthCalledWith(1, "myBooking.detail.multipleDamages");
  });
});
