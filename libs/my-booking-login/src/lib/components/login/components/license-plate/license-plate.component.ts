import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { filter } from "rxjs/operators";
import { OLB_CONFIG, OlbConfiguration } from "@cg/olb/configuration";
import { ResumeFacade } from "@cg/resume-core";
import { TranslocoService } from "@ngneat/transloco";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { GoogleTagManagerService } from "@cg/analytics";
import { Cta } from "@cg/content-api/typescript-interfaces";
import { AddFormControls } from "@cg/core/types";
import { HeadlineType } from "@cg/core/ui";
import { LoginFacade } from "../../../../+state/login.facade";
import { LoginLpnForm } from "../../../../interfaces";
import { LoginDirective } from "../../login-directive/login.directive";
import { lpnCtaLogin, textsLogin } from "../../models/login.model";
import { lpnCtaSaveAndRestore, textsSaveAndRestore } from "../../models/save-and-restore.model";

@UntilDestroy()
@Component({
  selector: "cg-license-plate",
  templateUrl: "./license-plate.component.html",
  styleUrls: ["./license-plate.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LicensePlateComponent extends LoginDirective<AddFormControls<LoginLpnForm>> implements OnInit {
  public readonly HeadlineType = HeadlineType;

  @Input()
  public resumeId = "";

  public isSaveAndRestore = false;

  public texts: {
    title: string;
    subtitle?: string;
    description?: string;
  } = textsSaveAndRestore;

  public lpnCta: Cta = lpnCtaSaveAndRestore;

  public constructor(
    changeDetection: ChangeDetectorRef,
    translocoService: TranslocoService,
    gtmService: GoogleTagManagerService,
    private readonly router: Router,
    private readonly loginFacade: LoginFacade,
    private readonly resumeFacade: ResumeFacade,
    @Inject(OLB_CONFIG) private readonly olbConfig: OlbConfiguration
  ) {
    super(changeDetection, translocoService, gtmService);
  }

  public ngOnInit() {
    super.ngOnInit();
    if (!this.resumeId) {
      this.texts = textsLogin;
      this.lpnCta = lpnCtaLogin;
    }
    this.isSaveAndRestore = !!this.resumeId;

    this.resumeFacade.loadFailure$
      .pipe(
        untilDestroyed(this),
        filter((error) => !!error)
      )
      .subscribe((error) => {
        this.trackNextEvent(false);

        if (!error) {
          return;
        }

        this.resumeFacade.resetState();

        const errorPath = this.olbConfig.entryChannel.toLowerCase().includes("cobranded")
          ? "/login/error"
          : "/my-booking/error";

        if (error.status === 410 || error.status === 404) {
          this.router.navigate([errorPath]);
        } else if (error.status === 401) {
          const errorBody = error.body as { failedAttempts: number };
          const translationKey = this.isSaveAndRestore
            ? "myBooking.login.saveAndRestore.attempts"
            : "myBooking.login.attempts";
          this.errorMessage = this.translocoService.translate(translationKey, {
            attempts: this.resumeAttempts - errorBody.failedAttempts
          });
          this.changeDetection.markForCheck();
        } else {
          this.router.navigate([errorPath]);
          this.errorMessage = this.translocoService.translate("myBooking.login.failed");
        }
      });

    this.resumeFacade.loadSuccess$.pipe(filter((result) => !!result)).subscribe(() => {
      this.router.navigate(["/olb"]);
      this.trackNextEvent(true);
    });
  }

  public initFormGroup(): void {
    this.form = new FormGroup<AddFormControls<LoginLpnForm>>({
      lpn: new FormControl(null, Validators.required)
    });
  }

  public onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.trackNextEvent(false);
      return;
    }
    const lpn = this.form.controls.lpn.value;
    if (!this.resumeId) {
      this.loginFacade.checkLicensePlateNumber(lpn);
    } else {
      this.resumeFacade.loadResume(this.resumeId, lpn);
    }
  }

  public trackNextEvent(success: boolean) {
    const eventLabel = success ? "next/success" : "next/fail";
    if (this.isSaveAndRestore) {
      this.trackEvent(eventLabel, "log-in-license-plate", "olb");
    } else {
      this.trackEvent(eventLabel);
    }
  }
}
