import { ChangeDetectorRef } from "@angular/core";
import { TranslocoService } from "@ngneat/transloco";
import { GoogleTagManagerService } from "@cg/analytics";
import { LoginFacade } from "../../../../+state/login.facade";
import { VerificationCodeComponent } from "./verification-code.component";

class FakeLoginFacade {
  public loginWithKtciCodeButtonClicked = jest.fn();
  public setNotificationStatus = jest.fn();
}

class FakeChangeDetectionRef {
  public markForCheck = jest.fn();
}

class FakeTranslocoService {
  public translate = jest.fn();
}

describe("VerificationCodeComponent", () => {
  let cdr: FakeChangeDetectionRef;
  let translocoService: FakeTranslocoService;
  let component: VerificationCodeComponent;
  let gtmService: Partial<GoogleTagManagerService>;
  let loginFacade: FakeLoginFacade;

  beforeEach(async () => {
    cdr = new FakeChangeDetectionRef();
    loginFacade = new FakeLoginFacade();
    translocoService = new FakeTranslocoService();
    gtmService = {
      trackEvent: jest.fn()
    };

    component = new VerificationCodeComponent(
      cdr as unknown as ChangeDetectorRef,
      translocoService as unknown as TranslocoService,
      gtmService as unknown as GoogleTagManagerService,
      loginFacade as unknown as LoginFacade
    );
    component.ngOnInit();
    component.resumeId = "test-id";
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should call loginWithKtciCodeButtonClicked on button click", () => {
    component.form.controls.ktci.setValue("123456");
    component.onSubmit();
    expect(loginFacade.loginWithKtciCodeButtonClicked).toHaveBeenCalledWith("test-id", "123456");
  });

  it("should track failed case if form is not valid on button click", () => {
    component.form.controls.ktci.setValue("");
    component.onSubmit();
    expect(gtmService.trackEvent).toHaveBeenCalledWith({
      eventAction: "log-in-license-plate",
      eventCategory: "my-booking",
      eventLabel: "next/fail"
    });
    expect(loginFacade.setNotificationStatus).not.toHaveBeenCalledWith(null);
    expect(loginFacade.loginWithKtciCodeButtonClicked).not.toHaveBeenCalledWith("test-id", "");
  });
});
