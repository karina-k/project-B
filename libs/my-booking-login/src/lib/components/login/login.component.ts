import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, of } from "rxjs";
import { filter, tap } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { CookieService } from "ngx-cookie-service";
import { OverlayService } from "@cg/shared";
import { LoginFacade } from "../../+state/login.facade";
import { MyBookingNotificationStatus } from "../../enums";
import { LoginProblemsOverlayComponent } from "./components/login-problems-overlay/login-problems-overlay.component";
import { imageContentLogin } from "./models/login.model";
import { imageContentSaveAndRestore } from "./models/save-and-restore.model";

@UntilDestroy()
@Component({
  selector: "cg-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {
  public resumeId = "";
  public isSaveAndRestore = false;
  public isKtciContent$ = of(false);

  public imageContent: {
    sizes: { srcset: string; media: string }[];
    source: string;
    classes: string;
    alt: string;
    ngTemplate: string;
  } = imageContentSaveAndRestore;

  public notificationStatus$: Observable<MyBookingNotificationStatus>;

  public constructor(
    private readonly route: ActivatedRoute,
    private readonly changeDetection: ChangeDetectorRef,
    private readonly loginFacade: LoginFacade,
    private readonly overlayService: OverlayService,
    private readonly cookieService: CookieService
  ) {}

  public ngOnInit(): void {
    this.resumeId = this.route.snapshot.params["resume-id"];
    this.isSaveAndRestore = !!this.resumeId;

    if (!this.isSaveAndRestore) {
      this.imageContent = imageContentLogin;

      this.loginFacade.licencePlateNumberCheckSuccess$
        .pipe(
          untilDestroyed(this),
          filter((resumeId) => !!resumeId)
        )
        .subscribe((resumeId) => {
          this.resumeId = resumeId;
          this.changeDetection.detectChanges();
        });
    } else {
      this.cookieService.set("resumeId", this.resumeId);
    }

    this.handleNotificationStatus();

    this.isKtciContent$ = this.loginFacade.isKtciContent$;

    this.isKtciContent$.pipe(untilDestroyed(this)).subscribe(() => {
      this.changeDetection.detectChanges();
    });
  }

  public ngOnDestroy(): void {
    this.closeToast();
  }

  public openLoginProblemsOverlay(): void {
    this.overlayService.open(LoginProblemsOverlayComponent);
  }

  public closeToast(): void {
    this.loginFacade.setNotificationStatus(null);
  }

  public sendKtciMailAgain(): void {
    this.loginFacade.sendKtciMailAgain();
  }

  private handleNotificationStatus(): void {
    this.notificationStatus$ = this.loginFacade.notificationStatus$.pipe(
      untilDestroyed(this),
      tap((status: MyBookingNotificationStatus) => {
        if (status && status !== MyBookingNotificationStatus.LOGOUT_INACTIVITY) {
          const timeout = status !== MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_NOT_POSSIBLE ? 4000 : 8000;
          setTimeout(() => {
            this.closeToast();
          }, timeout);
        }
      }),
      filter(
        (status: MyBookingNotificationStatus) => status !== MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_SUCCESS
      )
    );
  }
}
