import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { TranslocoService } from "@ngneat/transloco";
import { Paragraph } from "@cg/content-api/typescript-interfaces";
import { calendarInfoFilledIcon } from "@cg/icon";
import { CustomerCase, PhoneNumber } from "@cg/shared";

const HEADER_TEXT_KEY = "myBooking.detail.overlays.onlyCallbackAppointmentTitle";

@Component({
  selector: "cg-edit-appointment-by-callback",
  templateUrl: "./edit-appointment-by-callback.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditAppointmentByCallbackComponent implements OnInit {
  public readonly calendarInfoFilledIcon = calendarInfoFilledIcon;

  @Input()
  public customerCase: CustomerCase;

  public contentText: Paragraph;
  public phoneNumber: PhoneNumber = PhoneNumber.MY_BOOKING_APPOINTMENT_CALLBACK;
  public headerKey = HEADER_TEXT_KEY;

  public constructor(private readonly translocoService: TranslocoService) {}

  public ngOnInit(): void {
    this.setTextSubline();
  }

  private setTextSubline() {
    this.contentText = {
      text: this.translocoService.translate("myBooking.detail.overlays.editAppointmentByPhone"),
      ngTemplate: "cgParagraph"
    };
  }
}
