/* eslint-disable sonarjs/no-duplicate-string */
import { ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject, of } from "rxjs";
import { take } from "rxjs/operators";
import { CookieService } from "ngx-cookie-service";
import { OverlayService } from "@cg/shared";
import { LoginFacade } from "../../+state/login.facade";
import { MyBookingNotificationStatus } from "../../enums/my-booking-toast-status.enum";
import { LoginProblemsOverlayComponent } from "./components/login-problems-overlay/login-problems-overlay.component";
import { LoginComponent } from "./login.component";

class FakeLoginFacade {
  public licencePlateNumberCheckSuccess$ = new BehaviorSubject<string | null>(null);
  public isKtciContent$ = of(false);
  public notificationStatus$ = of(null);
  public setNotificationStatus = jest.fn();
  public sendKtciMailAgain = jest.fn();
}

class FakeRoute {
  public snapshot = {
    params: {}
  };
}

class FakeChangeDetectionRef {
  public detectChanges = jest.fn();
}

class FakeOverlayService {
  public open = jest.fn();
}

class FakeCookieService {
  public set = jest.fn();
}

describe("LoginComponent", () => {
  let route: FakeRoute;
  let cdr: FakeChangeDetectionRef;
  let component: LoginComponent;
  let loginFacade: FakeLoginFacade;
  let overlayService: FakeOverlayService;
  let cookieService: FakeCookieService;

  beforeEach(async () => {
    route = new FakeRoute();
    cdr = new FakeChangeDetectionRef();
    overlayService = new FakeOverlayService();
    loginFacade = new FakeLoginFacade();
    cookieService = new FakeCookieService();
    loginFacade.licencePlateNumberCheckSuccess$ = new BehaviorSubject<string | null>(null);

    component = new LoginComponent(
      route as unknown as ActivatedRoute,
      cdr as unknown as ChangeDetectorRef,
      loginFacade as unknown as LoginFacade,
      overlayService as unknown as OverlayService,
      cookieService as unknown as CookieService
    );
    component.ngOnInit();
  });

  afterAll(() => {
    jest.clearAllTimers();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should set cookie if is save and restore", () => {
    route.snapshot.params["resume-id"] = "12345";
    component.ngOnInit();
    expect(cookieService.set).toBeCalledWith("resumeId", "12345");
  });

  it("should set resume id if lpn was correct", () => {
    loginFacade.licencePlateNumberCheckSuccess$.next("123456");
    expect(component.resumeId).toEqual("123456");
  });

  it("should call setNotificationStatus with null if closeToast function is called", () => {
    component.closeToast();
    expect(loginFacade.setNotificationStatus).toBeCalledWith(null);
  });

  it("should call sendKtciMailAgain if sendKtciMailAgain function is called", () => {
    component.sendKtciMailAgain();
    expect(loginFacade.sendKtciMailAgain).toBeCalled();
  });

  it("should open login problems overlay", () => {
    component.openLoginProblemsOverlay();
    expect(overlayService.open).toBeCalledWith(LoginProblemsOverlayComponent);
  });

  it.each([
    null,
    MyBookingNotificationStatus.LOGOUT_INACTIVITY,
    MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_SUCCESS,
    MyBookingNotificationStatus.LOGOUT
  ])("should test toast status for %s", async (notificationStatus) => {
    jest.useFakeTimers();
    loginFacade.notificationStatus$ = of(notificationStatus);
    component.ngOnInit();

    component.notificationStatus$.pipe(take(1)).subscribe((status) => expect(status).toEqual(notificationStatus));

    jest.runAllTimers();

    if (notificationStatus === null || notificationStatus === MyBookingNotificationStatus.LOGOUT_INACTIVITY) {
      expect(loginFacade.setNotificationStatus).not.toBeCalledWith(null);
    } else {
      expect(loginFacade.setNotificationStatus).toBeCalledWith(null);
    }
  });

  it("should close toast by destroy", () => {
    const closeToastSpy = jest.spyOn(component, "closeToast");

    component.ngOnDestroy();
    expect(closeToastSpy).toBeCalled();
  });
});
