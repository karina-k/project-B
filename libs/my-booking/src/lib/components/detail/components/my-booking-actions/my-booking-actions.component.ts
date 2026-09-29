import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { accordionChevronDownIcon } from "@cg/icon";
import { CustomerCase, OverlayService, PhoneNumber } from "@cg/shared";
import { MyBookingTrackingService } from "../../../../services/my-booking-tracking.service";
import { isAppointmentChangeableInMyBooking } from "../../../../utils/is-appointment-changable-in-my-booking.util";
import { EditAppointmentComponent } from "../my-booking-overlays";
import { CancelAppointmentComponent } from "../my-booking-overlays/cancel-appointment/cancel-appointment.component";
import { EditAppointmentByCallbackComponent } from "../my-booking-overlays/edit-appointment-by-callback/edit-appointment-by-callback.component";

@Component({
  selector: "cg-my-booking-actions",
  templateUrl: "./my-booking-actions.component.html",
  styleUrls: ["./my-booking-actions.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyBookingActionsComponent {
  public readonly PhoneNumber = PhoneNumber;

  @Input()
  public customerCase: CustomerCase;

  public readonly accordionIcon = accordionChevronDownIcon;

  public expanded = false;

  public constructor(
    private readonly overlayService: OverlayService,
    private readonly trackingService: MyBookingTrackingService
  ) {}

  public accordionToggled(): void {
    this.expanded = !this.expanded;
  }

  public cancelAppointment(): void {
    this.overlayService.open(CancelAppointmentComponent, { customerCase: this.customerCase });
    this.trackingService.trackEditAppointment(
      "cancel-appointment",
      this.customerCase.appointment.availabilityPeriodStart
    );
  }

  public changeAppointment(): void {
    this.overlayService.open(
      isAppointmentChangeableInMyBooking(this.customerCase)
        ? EditAppointmentComponent
        : EditAppointmentByCallbackComponent,
      { customerCase: this.customerCase }
    );
    this.trackingService.trackFieldEvent({ eventAction: "edit-appointment", eventLabel: "my-booking/detail" });
  }
}
