import { ChangeDetectorRef, Directive, OnInit } from "@angular/core";
import { AbstractControl, FormGroup } from "@angular/forms";
import { TranslocoService } from "@ngneat/transloco";
import { GoogleTagManagerService } from "@cg/analytics";

@Directive()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class LoginDirective<F extends { [K in keyof F]: AbstractControl<unknown, unknown> }>
  implements OnInit
{
  public form!: FormGroup<F>;
  public errorMessage: string | null = null;
  public resumeAttempts = 3;

  protected constructor(
    protected changeDetection: ChangeDetectorRef,
    protected translocoService: TranslocoService,
    protected gtmService: GoogleTagManagerService
  ) {}

  public ngOnInit(): void {
    this.initFormGroup();
  }

  public abstract initFormGroup(): void;

  public trackEvent(eventLabel: string, eventAction = "log-in-license-plate", eventCategory = "my-booking"): void {
    this.gtmService.trackEvent({
      eventCategory: eventCategory,
      eventAction,
      eventLabel
    });
  }
}
