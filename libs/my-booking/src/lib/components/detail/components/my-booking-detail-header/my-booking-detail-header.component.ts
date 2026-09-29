import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { Observable } from "rxjs";
import { switchMap } from "rxjs/operators";
import { TranslocoService } from "@ngneat/transloco";
import { HeadlineType } from "@cg/core/ui";
import { confirmedIcon } from "@cg/icon";
import { compromisedPartTranslationKey, Damage, RequiredService } from "@cg/shared";

@Component({
  selector: "cg-my-booking-detail-header",
  templateUrl: "./my-booking-detail-header.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyBookingDetailHeaderComponent implements OnInit, OnChanges {
  public readonly HeadlineType = HeadlineType;

  @Input()
  public damages: Damage[];

  @Input()
  public customerName: string;

  @Input()
  public orderNumber: string | null;

  public readonly confirmedIcon = confirmedIcon;

  public damageTypeDescription$: Observable<string>;
  public orderNumberInfo$: Observable<string>;

  public constructor(private readonly translocoService: TranslocoService) {}

  public ngOnInit(): void {
    this.damageTypeDescription$ = this.getDamageTypeDescription$();

    this.orderNumberInfo$ = this.translocoService.selectTranslate("myBooking.detail.orderNumberInfo", {
      orderNumber: this.orderNumber
    });
  }

  private getDamageTypeDescription$(): Observable<string> {
    if (this.damages?.length > 1) {
      return this.translocoService.selectTranslate("myBooking.detail.multipleDamages");
    }

    return this.translocoService.selectTranslate(compromisedPartTranslationKey[this.damages[0].compromisedPart]).pipe(
      switchMap((compromisedPart: string) =>
        this.damages[0].requiredService.toUpperCase() !== RequiredService.REPAIR
          ? this.translocoService.selectTranslate("myBooking.detail.damageTypeReplace", {
              compromisedPart
            })
          : this.translocoService.selectTranslate("myBooking.detail.damageTypeRepair", {
              compromisedPart
            })
      )
    );
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.customerName = changes.customerName ? changes.customerName.currentValue : this.customerName;
      this.orderNumber = changes.orderNumber ? changes.orderNumber.currentValue : this.orderNumber;
    }
  }
}
