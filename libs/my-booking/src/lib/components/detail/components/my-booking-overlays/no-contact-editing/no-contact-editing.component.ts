import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { TranslocoService } from "@ngneat/transloco";
import { Paragraph } from "@cg/content-api/typescript-interfaces";
import { penIcon } from "@cg/icon";
import { PhoneNumber } from "@cg/shared";

@Component({
  selector: "cg-no-contact-editing",
  templateUrl: "./no-contact-editing.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoContactEditingComponent implements OnInit {
  public text: Paragraph;
  public title: string;

  public readonly icon = penIcon;
  public readonly phone = PhoneNumber.MY_BOOKING_CANCEL;

  public constructor(private readonly translocoService: TranslocoService) {}

  public ngOnInit(): void {
    this.text = {
      text: this.translocoService.translate("myBooking.detail.overlays.noContactEditingSubline"),
      ngTemplate: "cgParagraph"
    };

    this.title = this.translocoService.translate("myBooking.detail.overlays.noContactEditingTitle");
  }
}
