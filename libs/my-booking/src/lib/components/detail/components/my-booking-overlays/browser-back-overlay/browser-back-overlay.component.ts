import { ChangeDetectionStrategy, Component } from "@angular/core";
import { logoutIcon } from "@cg/icon";
import { OverlayService } from "@cg/shared";
import { DetailFacade } from "../../../../../+state/detail.facade";

@Component({
  selector: "cg-browser-back-overlay",
  templateUrl: "./browser-back-overlay.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrowserBackOverlayComponent {
  public readonly logoutIcon = logoutIcon;

  public constructor(private readonly detailFacade: DetailFacade, private readonly overlayService: OverlayService) {}

  public logoutButtonClicked(): void {
    this.detailFacade.logout();
    this.overlayService.close();
  }
}
