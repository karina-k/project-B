import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { Observable } from "rxjs";
import { UntilDestroy } from "@ngneat/until-destroy";
import { AppointmentService } from "@cg/appointment-ui";
import { ContentCard, CustomerCase } from "@cg/shared";
import { DetailService, MyBookingTrackingService } from "../../../../services";

@UntilDestroy()
@Component({
  selector: "cg-my-booking-booked-appointment",
  templateUrl: "./my-booking-booked-appointment.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyBookingBookedAppointmentComponent implements OnInit, OnChanges {
  @Input()
  public customerCase: CustomerCase;

  public contentCards: ContentCard[];

  public googleMapsRouteHref: string;
  public calendarHref: string;

  public get isMobile$(): Observable<boolean> {
    return this.detailService.isMobile$;
  }

  public constructor(
    private readonly appointmentService: AppointmentService,
    private readonly detailService: DetailService,
    private readonly trackingService: MyBookingTrackingService
  ) {}

  public ngOnInit(): void {
    this.createContentCards();
    this.googleMapsRouteHref = this.appointmentService.buildGoogleMapsRouteHref(
      this.customerCase.appointment.street,
      this.customerCase.appointment.city,
      true
    );
    this.calendarHref = this.appointmentService.buildCalendarHref({ appointmentId: this.customerCase.appointment.id });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (!changes?.customerCase) {
      return;
    }

    this.customerCase = changes.customerCase.currentValue;
    this.createContentCards();
  }

  public trackRoutePlaningEvent(eventLabel: string): void {
    this.trackingService.trackFieldEvent({ eventLabel, eventAction: "route-planning" });
  }

  public trackCalendarEvent(eventLabel: string): void {
    this.trackingService.trackFieldEvent({ eventLabel, eventAction: "save-to-calendar" });
  }

  private createContentCards(): void {
    const dateContentCard = this.detailService.createDateContentCard(this.customerCase, true);
    const locationContentCard = this.detailService.createLocationContentCard(this.customerCase, false);
    this.contentCards = [dateContentCard, locationContentCard];
  }
}
