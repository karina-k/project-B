import { ChangeDetectorRef } from "@angular/core";
import { lastValueFrom, of } from "rxjs";
import { TranslocoService } from "@ngneat/transloco";
import { LoginFacade } from "../../../../+state/login.facade";
import { MyBookingNotificationStatus } from "../../../../enums";
import { MyBookingStatusToastComponent } from "./my-booking-status-toast.component";

const translocoMessage = "Nur noch 2 Versuche";
class FakeChangeDetectorRef {
  public detectChanges = jest.fn();
}

class FakeTranslocoService {
  public selectTranslate = jest.fn(() => of(translocoMessage));
}

class FakeLoginFacade {
  public licencePlateNumberCheckFailed$ = of(2);
  public loginWithKtciCodeFailed$ = of(2);
}

describe("MyBookingStatusToastComponent", () => {
  let component: MyBookingStatusToastComponent;
  let cdr: FakeChangeDetectorRef;
  let translocoService: FakeTranslocoService;
  let loginFacade: FakeLoginFacade;

  beforeEach(() => {
    cdr = new FakeChangeDetectorRef();
    translocoService = new FakeTranslocoService();
    loginFacade = new FakeLoginFacade();
    component = new MyBookingStatusToastComponent(
      cdr as unknown as ChangeDetectorRef,
      loginFacade as unknown as LoginFacade,
      translocoService as unknown as TranslocoService
    );
  });

  it.each`
    toastStatus                                                     | expectedHeadline                 | expectedMessage                 | expectedIconName
    ${MyBookingNotificationStatus.SUCCESS}                         | ${"successHeadline"}             | ${""}                           | ${"ic_checkmark_x160"}
    ${MyBookingNotificationStatus.ERROR}                           | ${"errorHeadline"}               | ${"errorMessage"}               | ${"ic_feedback_error"}
    ${MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_SUCCESS}      | ${"mailSentHeadline"}            | ${"mailSentMessage"}            | ${"ic_checkmark_x160"}
    ${MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_AGAIN}        | ${"mailSentHeadline"}            | ${"mailSentMessage"}            | ${"ic_checkmark_x160"}
    ${MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_NOT_POSSIBLE} | ${"mailSentNotPossibleHeadline"} | ${"mailSentNotPossibleMessage"} | ${"ic_info_yellow_x24"}
    ${MyBookingNotificationStatus.LOGOUT}                          | ${"logout"}                      | ${""}                           | ${"ic_checkmark_x160"}
    ${MyBookingNotificationStatus.LOGOUT_INACTIVITY}               | ${"logoutInactivity"}            | ${""}                           | ${"ic_info_yellow_x24"}
    ${MyBookingNotificationStatus.WRONG_KTCI}                      | ${"attemptsTitle"}               | ${translocoMessage}             | ${"ic_info_yellow_x24"}
    ${MyBookingNotificationStatus.WRONG_LPN}                       | ${"attemptsTitle"}               | ${translocoMessage}             | ${"ic_info_yellow_x24"}
  `(
    "should show toast with status $toastStatus",
    async ({ toastStatus, expectedHeadline, expectedMessage, expectedIconName }) => {
      component.toastStatus = toastStatus;
      component.ngOnInit();

      const textKeyFirst =
        toastStatus !== MyBookingNotificationStatus.WRONG_KTCI &&
        toastStatus !== MyBookingNotificationStatus.WRONG_LPN
          ? "myBooking.statusToast."
          : "";
      const message = expectedMessage ? `${textKeyFirst}${expectedMessage}` : "";

      expect(component.hideCloseIcon).toEqual(![MyBookingNotificationStatus.LOGOUT_INACTIVITY].includes(toastStatus));
      expect(component.headline).toEqual(`myBooking.statusToast.${expectedHeadline}`);
      expect(await lastValueFrom(component.message$)).toEqual(message);
      expect(component.icon).toEqual({
        name: expectedIconName,
        src: `https://assets.example.com/icons/${expectedIconName}.svg`,
        ngTemplate: "cgIcon"
      });
    }
  );

  it("should emit close clicked", () => {
    const closeClicked = jest.spyOn(component.closeClicked, "emit");
    component.onCloseClicked();
    expect(closeClicked).toBeCalled();
  });
});
