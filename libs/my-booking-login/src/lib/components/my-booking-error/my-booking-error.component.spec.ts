import { Location } from "@angular/common";
import { OlbConfiguration } from "@cg/olb/configuration";
import { EntryChannel } from "@cg/shared";
import { LoginFacade } from "../../+state/login.facade";
import { MyBookingErrorComponent } from "./my-booking-error.component";

class FakeLocation {
  public back = jest.fn();
}

class FakeLoginFacade {
  public resetState = jest.fn();
}

class FakeOlbConfiguration {
  public entryChannel = "test";
}

describe("ErrorComponent", () => {
  const location = new FakeLocation();
  let olbConfig: FakeOlbConfiguration;
  const loginFacade: FakeLoginFacade = new FakeLoginFacade();
  let component: MyBookingErrorComponent;

  beforeEach(() => {
    olbConfig = new FakeOlbConfiguration();

    component = new MyBookingErrorComponent(
      olbConfig as unknown as OlbConfiguration,
      location as unknown as Location,
      loginFacade as unknown as LoginFacade
    );
  });

  it("should create", () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
    expect(component.isHuk).toBeFalsy();
    expect(component.listElements).toEqual([
      "myBooking.errorPage.reasons.spamFolder",
      "myBooking.errorPage.reasons.tooManyRequests",
      "myBooking.errorPage.reasons.incorrectEmail",
      "myBooking.errorPage.reasons.alreadyBooked",
      "myBooking.errorPage.reasons.licensePlateNotFound"
    ]);
  });

  it("should set list elements for huk", () => {
    olbConfig.entryChannel = EntryChannel.HUK_COBRANDED;
    component.ngOnInit();
    expect(component.isHuk).toBeTruthy();
    expect(component.listElements).toEqual([
      "myBooking.errorPage.reasons.licensePlateNotFound",
      "myBooking.errorPage.reasons.linkExpired"
    ]);
  });

  it("should call function to navigate to login page and dispatch reset state", () => {
    component.navigateToLogin();
    expect(location.back).toBeCalled();
    expect(loginFacade.resetState).toBeCalled();
  });
});
