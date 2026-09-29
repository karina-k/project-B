import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { NavigationStart, Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { filter, switchMap, tap } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { addSeconds } from "date-fns/fp";
import { CookieService } from "ngx-cookie-service";
import { LocationsFacade } from "@cg/locations";
import {
  MY_BOOKING_DETAIL_URL,
  MY_BOOKING_LOGIN_URL,
  MY_BOOKING_LOGOUT_URL,
  MyBookingNotificationStatus
} from "@cg/my-booking-login";
import {
  CustomerCase,
  CustomerCaseAppointment,
  CustomerCaseCar,
  CustomerCaseEditContact,
  Damage,
  OverlayService
} from "@cg/shared";
import { DetailFacade } from "../../+state/detail.facade";
import { AutoLogoutService } from "../../services";
import { BrowserBackOverlayComponent } from "./components/my-booking-overlays";

@UntilDestroy()
@Component({
  selector: "cg-detail",
  templateUrl: "./my-booking-detail-page-wrapper.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyBookingDetailPageWrapperComponent implements OnInit, OnDestroy {
  public customerCaseEditContact: CustomerCaseEditContact;
  public customerCase: CustomerCase;
  public customerCaseId: string;
  public customerCaseDamage: Damage;
  public car: CustomerCaseCar;
  public damages: Damage[];
  public appointment: CustomerCaseAppointment;
  public customerCaseLoaded = false;
  public notificationStatus$: Observable<MyBookingNotificationStatus>;

  @HostListener("window:beforeunload", ["$event"]) public refreshHandler(): void {}

  public constructor(
    private readonly detailFacade: DetailFacade,
    private readonly locationFacade: LocationsFacade,
    private readonly cdr: ChangeDetectorRef,
    private readonly cookieService: CookieService,
    private readonly autoLogoutService: AutoLogoutService,
    private readonly router: Router,
    private readonly overlayService: OverlayService
  ) {}

  public ngOnInit(): void {
    this.refreshHandler = () => {
      this.cookieService.set("customerCaseId", this.customerCaseId, addSeconds(5, new Date(Date.now())));
    };
    this.autoLogoutService.initAutologoutFunctionality();

    this.detailFacade.customerCaseEditContact$
      .pipe(
        untilDestroyed(this),
        filter((customerCaseEditContact: CustomerCaseEditContact) => !!customerCaseEditContact)
      )
      .subscribe((customerCaseEditContact: CustomerCaseEditContact) => {
        this.customerCaseEditContact = customerCaseEditContact;
        this.cdr.markForCheck();
      });

    this.detailFacade.customerCase$
      .pipe(
        untilDestroyed(this),
        filter((customerCase) => !!customerCase && customerCase.damages.length > 0)
      )
      .subscribe((customerCase: CustomerCase) => {
        this.locationFacade.getServiceCentersDetails(customerCase.appointment.location);
        this.appointment = customerCase.appointment;
        this.customerCase = customerCase;
        this.customerCaseId = customerCase.id;
        this.damages = customerCase.damages;
        this.customerCaseDamage = customerCase.damages[0];
        this.car = customerCase.car;
        this.customerCaseLoaded = true;
        this.cdr.markForCheck();
      });

    this.dispatchUserLocation();
    this.initializeToastStatus();
    this.initializeRouterEventListener();
  }

  public ngOnDestroy(): void {
    this.overlayService.close();
    this.autoLogoutService.clearIntervalAndRemoveListener();
    this.refreshHandler = () => {};
  }

  private dispatchUserLocation(): void {
    this.locationFacade.selectedServiceCenter$
      .pipe(
        untilDestroyed(this),
        filter((center) => !!center)
      )
      .subscribe((center) => {
        this.locationFacade.setUserLocation({
          lat: center.coordinates.latitude,
          lng: center.coordinates.longitude
        });
      });
  }

  private initializeToastStatus(): void {
    this.notificationStatus$ = this.detailFacade.notificationStatus$.pipe(
      untilDestroyed(this),
      tap((toastStatus) => {
        if (toastStatus) {
          setTimeout(() => {
            this.detailFacade.setNotificationStatus(null);
          }, 4000);
        }
      }),
      switchMap((toastStatus) => of(toastStatus))
    );
  }

  private initializeRouterEventListener(): void {
    this.router.events
      .pipe(
        untilDestroyed(this),
        filter((event) => event instanceof NavigationStart)
      )
      .subscribe((event: NavigationStart) => {
        if (event.url === MY_BOOKING_LOGOUT_URL) {
          this.detailFacade.logout(false);
        } else if (event.url === MY_BOOKING_LOGIN_URL && event.navigationTrigger === "popstate") {
          this.overlayService.open(BrowserBackOverlayComponent, {});
          this.router.navigate([MY_BOOKING_DETAIL_URL]).then(() => {});
        }
      });
  }
}
