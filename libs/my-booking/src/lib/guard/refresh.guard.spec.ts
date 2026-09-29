import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { lastValueFrom, Observable, of } from "rxjs";
import { CookieService } from "ngx-cookie-service";
import { SecurityFacade } from "@cg/core/api";
import { LoginFacade, MY_BOOKING_LOGIN_URL } from "@cg/my-booking-login";
import { Resume } from "@cg/shared";
import DoneCallback = jest.DoneCallback;
import { DetailFacade } from "../+state/detail.facade";
import { RefreshGuard } from "./refresh.guard";

class FakeLoginFacade {
  public resume$: Observable<Resume> = of(null);
}

class FakeDetailFacade {
  public getCustomerCaseOnRefresh = jest.fn();
}

class FakeCookieService {
  public get = jest.fn(() => "12345");
}

class FakeSecurityFacade {
  public refreshToken$ = of("1234");
}

class FakeRouter {
  public navigateByUrl = jest.fn();
}

describe("RefreshGuard", () => {
  let guard: RefreshGuard;
  let loginFacade: FakeLoginFacade;
  let router: FakeRouter;
  let detailFacade: FakeDetailFacade;
  let cookieService: FakeCookieService;
  let securityFacade: FakeSecurityFacade;
  const activatedRouteSnapshot = new ActivatedRouteSnapshot();
  const url = "https://www.example.com/my-booking/detail";
  beforeEach(() => {
    loginFacade = new FakeLoginFacade();
    router = new FakeRouter();
    detailFacade = new FakeDetailFacade();
    cookieService = new FakeCookieService();
    securityFacade = new FakeSecurityFacade();

    guard = new RefreshGuard(
      cookieService as unknown as CookieService,
      detailFacade as unknown as DetailFacade,
      router as unknown as Router,
      loginFacade as unknown as LoginFacade,
      securityFacade as unknown as SecurityFacade,
      false
    );
  });

  it("should be created", () => {
    expect(guard).toBeTruthy();
  });

  it("should not execute on server", (done: DoneCallback) => {
    guard = new RefreshGuard(
      cookieService as unknown as CookieService,
      detailFacade as unknown as DetailFacade,
      router as unknown as Router,
      loginFacade as unknown as LoginFacade,
      securityFacade as unknown as SecurityFacade,
      true
    );

    guard.canActivate(activatedRouteSnapshot, <RouterStateSnapshot>{ url }).subscribe((res) => {
      expect(res).toBeTruthy();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
      done();
    });
  });

  it("should get customer case on refresh", async () => {
    const result = await lastValueFrom(guard.canActivate(activatedRouteSnapshot, <RouterStateSnapshot>{ url }));
    expect(detailFacade.getCustomerCaseOnRefresh).toBeCalledTimes(1);
    expect(result).toBeTruthy();
  });

  it("should navigate to detail page if first login", async () => {
    cookieService.get = jest.fn(() => "");
    loginFacade.resume$ = of({ resumeType: "B2C_BOOKING" } as unknown as Resume);
    const result = await lastValueFrom(guard.canActivate(activatedRouteSnapshot, <RouterStateSnapshot>{ url }));
    expect(router.navigateByUrl).not.toBeCalled();
    expect(result).toBeTruthy();
  });

  it("should navigate to login page if no customerCaseId cookie and resume", async () => {
    cookieService.get = jest.fn(() => "");
    router.navigateByUrl = jest.fn(() => Promise.resolve());
    loginFacade.resume$ = of(null);
    const result = await lastValueFrom(guard.canActivate(activatedRouteSnapshot, <RouterStateSnapshot>{ url }));
    expect(router.navigateByUrl).toBeCalledWith(MY_BOOKING_LOGIN_URL);
    expect(result).toBeFalsy();
  });
});
