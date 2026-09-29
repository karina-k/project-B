import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { TranslocoService } from "@ngneat/transloco";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { Paragraph } from "@cg/content-api/typescript-interfaces";
import { calendarInfoFilledIcon } from "@cg/icon";
import { CustomerCase, OverlayService, PhoneNumber } from "@cg/shared";
import { MyBookingTrackingService } from "../../../../../services/my-booking-tracking.service";
import { isAppointmentChangeableInMyBooking } from "../../../../../utils/is-appointment-changable-in-my-booking.util";
import { EditAppointmentComponent } from "../edit-appointment/edit-appointment.component";
import { EditAppointmentByCallbackComponent } from "../edit-appointment-by-callback/edit-appointment-by-callback.component";

@UntilDestroy()
@Component({
  selector: "cg-cancel-appointment",
  templateUrl: "./cancel-appointment.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CancelAppointmentComponent implements OnInit {
  public readonly PhoneNumber = PhoneNumber;
  public text: Paragraph;

  @Input()
  public customerCase: CustomerCase;

  public readonly calendarInfoFilledIcon = calendarInfoFilledIcon;

  public constructor(
    private readonly overlayService: OverlayService,
    private readonly mybookingTrackingService: MyBookingTrackingService,
    private readonly translocoService: TranslocoService
  ) {}

  public ngOnInit(): void {
    this.initTranslation();
  }

  private initTranslation() {
    this.translocoService
      .selectTranslate("myBooking.detail.overlays.cancelAppointmentSubline")
      .pipe(untilDestroyed(this))
      .subscribe((text: string) => {
        this.text = {
          text,
          ngTemplate: "cgParagraph"
        };
      });
  }

  public changeAppointment(): void {
    this.mybookingTrackingService.trackEditAppointment(
      "edit-appointment",
      this.customerCase.appointment.availabilityPeriodStart
    );
    this.overlayService.close();
    this.overlayService.open(
      isAppointmentChangeableInMyBooking(this.customerCase)
        ? EditAppointmentComponent
        : EditAppointmentByCallbackComponent,
      { customerCase: this.customerCase }
    );
  }
}
