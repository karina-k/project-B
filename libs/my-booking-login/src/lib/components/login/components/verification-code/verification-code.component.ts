import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { FormGroup, UntypedFormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { ktciValidators } from "@cg/validators";
import { TranslocoService } from "@ngneat/transloco";
import { UntilDestroy } from "@ngneat/until-destroy";
import { GoogleTagManagerService } from "@cg/analytics";
import { Cta } from "@cg/content-api/typescript-interfaces";
import { AddFormControls } from "@cg/core/types";
import { HeadlineType } from "@cg/core/ui";
import { LoginFacade } from "../../../../+state/login.facade";
import { LoginKtciForm } from "../../../../interfaces";
import { LoginDirective } from "../../login-directive/login.directive";
import { lpnCtaLogin, textsLoginKtci } from "../../models/login.model";

@UntilDestroy()
@Component({
  selector: "cg-verification-code",
  templateUrl: "./verification-code.component.html",
  styleUrls: ["./verification-code.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerificationCodeComponent extends LoginDirective<AddFormControls<LoginKtciForm>> {
  public readonly HeadlineType = HeadlineType;

  @Input()
  public resumeId = "";

  public ktciInput = {
    id: "ktci",
    controlName: "ktci",
    placeholder: "myBooking.login.ktciInput.placeholder",
    errorMessage: "myBooking.login.ktciInput.error"
  };

  public texts: {
    title: string;
    subtitle?: string;
    description: string;
  } = textsLoginKtci;

  public lpnCta: Cta = lpnCtaLogin;

  public recipientEmail$: Observable<string> = this.loginFacade.emailAddress$;

  public constructor(
    protected readonly changeDetection: ChangeDetectorRef,
    protected readonly translocoService: TranslocoService,
    protected readonly gtmService: GoogleTagManagerService,
    private readonly loginFacade: LoginFacade
  ) {
    super(changeDetection, translocoService, gtmService);
  }

  public initFormGroup(): void {
    this.form = new FormGroup<AddFormControls<LoginKtciForm>>({
      ktci: new UntypedFormControl(null, ktciValidators())
    });
  }

  public onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.trackEvent("next/fail");
      return;
    }
    this.loginFacade.loginWithKtciCodeButtonClicked(this.resumeId, this.form.controls.ktci.value);
  }
}
