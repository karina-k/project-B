import { ChangeDetectionStrategy, Component } from "@angular/core";
import { PhoneNumber } from "@cg/shared";

@Component({
  selector: "cg-login-problems-overlay",
  templateUrl: "./login-problems-overlay.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginProblemsOverlayComponent {
  public readonly PhoneNumber = PhoneNumber;
}
