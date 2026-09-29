import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from "@angular/core";
import { forkJoin } from "rxjs";
import { take } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { applePayIcon, ecIcon, googlePayIcon, maestroIcon, mastercardIcon, visaIcon } from "@cg/icon";
import {
  BreakpointService,
  ContentCard,
  CustomerCaseAppointment,
  CustomerCaseCar,
  CustomerCaseEditContact,
  Damage
} from "@cg/shared";
import { DetailService } from "../../../../services/detail.service";

@UntilDestroy()
@Component({
  selector: "cg-my-booking-booked-details",
  templateUrl: "./my-booking-booked-details.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyBookingBookedDetailsComponent implements OnInit, OnChanges {
  @Input()
  public customerCaseEditContact: CustomerCaseEditContact;

  @Input()
  public customerCaseId: string;

  @Input()
  public requiredService: string;

  @Input()
  public car: CustomerCaseCar;

  @Input()
  public damages: Damage[];

  @Input()
  public appointment: CustomerCaseAppointment;

  public contentCardsPartsLeftColumn: ContentCard[];
  public contentCardsRightColumn: ContentCard[];
  public paymentIcons = [ecIcon, mastercardIcon, maestroIcon, visaIcon, applePayIcon, googlePayIcon];

  public constructor(
    private readonly detailService: DetailService,
    private readonly breakpointService: BreakpointService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.createContentCards();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (!changes) {
      return;
    }

    if (changes.appointment) {
      this.appointment = changes.appointment.currentValue;
    }

    if (changes.car) {
      this.car = changes.car.currentValue;
    }

    if (changes.customerCaseEditContact) {
      this.customerCaseEditContact = changes.customerCaseEditContact.currentValue;
    }

    this.createContentCards();
  }

  private createContentCards(): void {
    const paymentContentCard = this.detailService.createPaymentContentCard();
    const lpnContentCard = this.detailService.createLpnContentCard(this.car.lpn, true);
    const addressContentCard = this.detailService.createAddressContentCard(this.customerCaseEditContact, true);
    let damageDateContentCard;
    let damageDate: string;
    if (this.damages?.length > 0 && this.damages[0].occurrenceDate !== "1970-01-01") {
      damageDate = this.damages[0].occurrenceDate;
      damageDateContentCard = this.detailService.createDamageDateContentCard(damageDate, true);
    }

    forkJoin([
      this.breakpointService.isMatchingBreakpoint$("UNTIL_DESKTOP").pipe(take(1)),
      this.detailService.createToTakeWithContentCard$(damageDate, true).pipe(take(1))
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([isUntilDesktop, toTakeWithContentCard]: [boolean, ContentCard]) => {
        const contactContentCard = this.detailService.createContactContentCard(
          this.customerCaseEditContact,
          this.customerCaseId,
          !!isUntilDesktop
        );
        this.contentCardsPartsLeftColumn = [lpnContentCard, addressContentCard, contactContentCard];
        this.contentCardsRightColumn = damageDateContentCard
          ? [damageDateContentCard, toTakeWithContentCard]
          : [toTakeWithContentCard];
        this.contentCardsRightColumn = [...this.contentCardsRightColumn, paymentContentCard];
        this.cdr.detectChanges();
      });
  }
}
