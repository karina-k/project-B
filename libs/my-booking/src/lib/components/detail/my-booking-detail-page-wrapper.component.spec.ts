import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NavigationStart, Router, RouterEvent } from "@angular/router";
import { of, Subject } from "rxjs";
import { take } from "rxjs/operators";
import { CookieService } from "ngx-cookie-service";
import { LocationsFacade } from "@cg/locations";
import {
  MY_BOOKING_DETAIL_URL,
  MY_BOOKING_LOGIN_URL,
  MY_BOOKING_LOGOUT_URL,
  MyBookingNotificationStatus
} from "@cg/my-booking-login";
import { OverlayService } from "@cg/shared";
import { DetailFacade } from "../../+state/detail.facade";
import { customerCase, customerCaseEditContact } from "../../+state/mock.data";
import { AutoLogoutService } from "../../services/auto-logout.service";
import { BrowserBackOverlayComponent } from "./components/my-booking-overlays";
import { MyBookingDetailPageWrapperComponent } from "./my-booking-detail-page-wrapper.component";

class FakeDetailFacade {
  public customerCase$ = of(customerCase);
  public customerCaseEditContact$ = of(customerCaseEditContact);
  public notificationStatus$ = of(null);
  public setNotificationStatus = jest.fn();
  public logout = jest.fn();
}

class FakeChangeDetectorRef {
  public detectChanges = jest.fn();
}

class FakeCookieService {
  public set = jest.fn();
}

class FakeAutoLogoutService {
  public initAutologoutFunctionality = jest.fn();
  public clearIntervalAndRemoveListener = jest.fn();
}

class FakeLocationsFacade {
  public getServiceCentersDetails = jest.fn();
  public setUserLocation = jest.fn();
  public selectedServiceCenter$ = of();
}

const routerEventsSubject = new Subject<RouterEvent>();

class FakeRouter {
  public events = routerEventsSubject.asObservable();
  public navigate = jest.fn();
}

class FakeOverlayService {
  public open = jest.fn();
  public close = jest.fn();
}

jest.useFakeTimers();

describe("MyBookingDetailPageWrapperComponent", () => {
  let component: MyBookingDetailPageWrapperComponent;
  let cookieService: FakeCookieService;
  let autoLogoutService: FakeAutoLogoutService;
  let detailFacade: FakeDetailFacade;
  let router: FakeRouter;
  let overlayService: FakeOverlayService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyBookingDetailPageWrapperComponent],
      providers: [
        {
          provide: ChangeDetectorRef,
          useValue: new FakeChangeDetectorRef()
        },
        {
          provide: CookieService,
          useValue: new FakeCookieService()
        },
        {
          provide: DetailFacade,
          useValue: new FakeDetailFacade()
        },
        {
          provide: AutoLogoutService,
          useValue: new FakeAutoLogoutService()
        },
        {
          provide: LocationsFacade,
          useValue: new FakeLocationsFacade()
        },
        {
          provide: OverlayService,
          useValue: new FakeOverlayService()
        },
        {
          provide: Router,
          useValue: new FakeRouter()
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    const fixture: ComponentFixture<MyBookingDetailPageWrapperComponent> = TestBed.createComponent(
      MyBookingDetailPageWrapperComponent
    );
    component = fixture.componentInstance;

    cookieService = TestBed.inject(CookieService) as unknown as FakeCookieService;
    autoLogoutService = TestBed.inject(AutoLogoutService) as unknown as FakeAutoLogoutService;
    detailFacade = TestBed.inject(DetailFacade) as unknown as FakeDetailFacade;
    router = TestBed.inject(Router) as unknown as FakeRouter;
    overlayService = TestBed.inject(OverlayService) as unknown as FakeOverlayService;
    component.ngOnInit();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(autoLogoutService.initAutologoutFunctionality).toBeCalled();
    expect(component.damages).toEqual(customerCase.damages);
    expect(component.appointment).toEqual(customerCase.appointment);
    expect(component.customerCaseDamage).toEqual(customerCase.damages[0]);
    expect(component.car).toEqual(customerCase.car);
    expect(component.customerCaseEditContact).toEqual(customerCaseEditContact);
    expect(component.customerCaseLoaded).toBeTruthy();
  });

  it("should set cookie on page reload", () => {
    window.dispatchEvent(new Event("beforeunload"));
    expect(cookieService.set).toBeCalled();
  });

  it("should show toast", async () => {
    detailFacade.notificationStatus$ = of(MyBookingNotificationStatus.SUCCESS);
    component.ngOnInit();
    component.notificationStatus$
      .pipe(take(1))
      .subscribe((status) => expect(status).toEqual(MyBookingNotificationStatus.SUCCESS));
    jest.runAllTimers();
  });

  it("should hide toast after timeout", async () => {
    detailFacade.notificationStatus$ = of(MyBookingNotificationStatus.SUCCESS);
    component.ngOnInit();
    component.notificationStatus$
      .pipe(take(1))
      .subscribe((status) => expect(status).toEqual(MyBookingNotificationStatus.SUCCESS));
    jest.runAllTimers();
    component.notificationStatus$.pipe(take(1)).subscribe((status) => expect(status).toEqual(null));
  });

  it("should not logout if route url is not /my-booking/logout", () => {
    routerEventsSubject.next(new NavigationStart(1, MY_BOOKING_DETAIL_URL));
    expect(detailFacade.logout).not.toBeCalledWith(false);
  });

  it("should logout if route url is /my-booking/logout", () => {
    routerEventsSubject.next(new NavigationStart(1, MY_BOOKING_LOGOUT_URL));
    expect(detailFacade.logout).toBeCalledWith(false);
  });

  it("should open BrowserBackOverlayComponent if navigationTrigger is popstate to login page", () => {
    routerEventsSubject.next(new NavigationStart(1, MY_BOOKING_LOGIN_URL, "popstate"));
    expect(overlayService.open).toBeCalledWith(BrowserBackOverlayComponent, {});
    expect(router.navigate).toBeCalledWith([MY_BOOKING_DETAIL_URL]);
  });

  it("should reset counter for toast and refresh handler", () => {
    const clearIntervalSpy = jest.spyOn(autoLogoutService, "clearIntervalAndRemoveListener");

    component.ngOnDestroy();
    expect(clearIntervalSpy).toBeCalled();
    expect(overlayService.close).toBeCalled();
    expect(component.refreshHandler).toEqual(expect.any(Function));
  });
});
