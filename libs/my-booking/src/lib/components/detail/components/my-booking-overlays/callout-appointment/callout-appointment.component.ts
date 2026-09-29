import { ChangeDetectionStrategy, Component } from "@angular/core";
import { PhoneNumber } from "@cg/shared";

@Component({
  selector: "cg-callout-appointment",
  templateUrl: "./callout-appointment.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalloutAppointmentComponent {
  public readonly phone = PhoneNumber.MY_BOOKING_DETAIL;
}
