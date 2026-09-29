import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { Cta, Icon, Paragraph } from "@cg/content-api/typescript-interfaces";
import { CtaVariation } from "@cg/core/ui";
import { PhoneNumber } from "@cg/shared";

@Component({
  selector: "cg-base-info-overlay",
  templateUrl: "./base-info-overlay.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseInfoOverlayComponent {
  @Input()
  public phone: PhoneNumber;

  @Input()
  public title: string;

  @Input()
  public text: Paragraph;

  @Input()
  public icon: Icon;

  public readonly CANCEL_TITLE = "myBooking.detail.overlays.baseInfoOverlayCancelBtn";

  @Input()
  public hideSaveBtn = true;

  @Input()
  public submitButtonTranslationKey: string;

  @Input()
  public cancelCta: Cta = {
    id: "info-overlay-cancel-cta",
    title: this.CANCEL_TITLE,
    icon: null,
    link: {
      href: null,
      title: this.CANCEL_TITLE,
      text: this.CANCEL_TITLE,
      routerLink: false
    },
    arrowDirection: "right",
    variation: CtaVariation.PRIMARY,
    ngTemplate: "cgCta"
  };

  @Output()
  public submitButtonClicked: EventEmitter<void> = new EventEmitter<void>();

  public emitSubmitButtonClicked() {
    this.submitButtonClicked.emit();
  }
}
