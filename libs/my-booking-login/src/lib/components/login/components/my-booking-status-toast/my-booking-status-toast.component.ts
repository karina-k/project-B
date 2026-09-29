import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from "@angular/core";
import { Observable, of } from "rxjs";
import { switchMap, take } from "rxjs/operators";
import { TranslocoService } from "@ngneat/transloco";
import { Icon } from "@cg/content-api/typescript-interfaces";
import { HeadlineType } from "@cg/core/ui";
import { errorIcon, infoYellowIcon, successIcon } from "@cg/icon";
import { LoginFacade } from "../../../../+state/login.facade";
import { MyBookingNotificationStatus } from "../../../../enums";

@Component({
  selector: "cg-my-booking-status-toast",
  templateUrl: "./my-booking-status-toast.component.html",
  styleUrls: ["./my-booking-status-toast.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyBookingStatusToastComponent implements OnInit {
  public readonly emailAddress$ = this.loginFacade.emailAddress$;
  public readonly HeadlineType = HeadlineType;
  public readonly MyBookingNotificationStatus = MyBookingNotificationStatus;

  @Input()
  public toastStatus: MyBookingNotificationStatus;

  @Output() public closeClicked = new EventEmitter<void>();

  public hideCloseIcon = true;

  public icon: Icon;
  public headline: string;
  public message$: Observable<string>;

  public constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly loginFacade: LoginFacade,
    private readonly translocoService: TranslocoService
  ) {}

  public ngOnInit(): void {
    this.hideCloseIcon = this.toastStatus !== MyBookingNotificationStatus.LOGOUT_INACTIVITY;
    this.headline = this.mapHeadline();
    this.message$ = this.mapMessage$();
    this.icon = this.mapIconSvgName();
    this.cdr.detectChanges();
  }

  public onCloseClicked(): void {
    this.closeClicked.emit();
  }

  private mapIconSvgName(): Icon {
    switch (this.toastStatus) {
      case MyBookingNotificationStatus.ERROR:
        return errorIcon;
      case MyBookingNotificationStatus.SUCCESS:
      case MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_SUCCESS:
      case MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_AGAIN:
      case MyBookingNotificationStatus.LOGOUT:
        return successIcon;
      case MyBookingNotificationStatus.LOGOUT_INACTIVITY:
      case MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_NOT_POSSIBLE:
      case MyBookingNotificationStatus.WRONG_LPN:
      case MyBookingNotificationStatus.WRONG_KTCI:
        return infoYellowIcon;
    }
  }

  private mapHeadline(): string {
    const textKeyBegin = "myBooking.statusToast";

    switch (this.toastStatus) {
      case MyBookingNotificationStatus.ERROR:
        return `${textKeyBegin}.errorHeadline`;
      case MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_SUCCESS:
      case MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_AGAIN:
        return `${textKeyBegin}.mailSentHeadline`;
      case MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_NOT_POSSIBLE:
        return `${textKeyBegin}.mailSentNotPossibleHeadline`;
      case MyBookingNotificationStatus.SUCCESS:
        return `${textKeyBegin}.successHeadline`;
      case MyBookingNotificationStatus.LOGOUT:
        return `${textKeyBegin}.logout`;
      case MyBookingNotificationStatus.LOGOUT_INACTIVITY:
        return `${textKeyBegin}.logoutInactivity`;
      case MyBookingNotificationStatus.WRONG_LPN:
      case MyBookingNotificationStatus.WRONG_KTCI:
        return `${textKeyBegin}.attemptsTitle`;
      default:
        return "";
    }
  }

  private mapMessage$(): Observable<string> {
    const textKeyBegin = "myBooking.statusToast";

    switch (this.toastStatus) {
      case MyBookingNotificationStatus.ERROR:
        return of(`${textKeyBegin}.errorMessage`);
      case MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_SUCCESS:
      case MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_AGAIN:
        return of(`${textKeyBegin}.mailSentMessage`);
      case MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_NOT_POSSIBLE:
        return of(`${textKeyBegin}.mailSentNotPossibleMessage`);
      case MyBookingNotificationStatus.WRONG_LPN:
        return this.loginFacade.licencePlateNumberCheckFailed$.pipe(
          take(1),
          switchMap((attempts: number | null) =>
            this.translocoService.selectTranslate(`${textKeyBegin}.attemptsMessage`, { attempts })
          )
        );
      case MyBookingNotificationStatus.WRONG_KTCI:
        return this.loginFacade.loginWithKtciCodeFailed$.pipe(
          take(1),
          switchMap((attempts: number | null) =>
            this.translocoService.selectTranslate(`${textKeyBegin}.attemptsMessage`, { attempts })
          )
        );
      default:
        return of("");
    }
  }
}
