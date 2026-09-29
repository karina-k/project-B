import { OverlayService } from "@cg/shared";
import { DetailFacade } from "../../../../../+state/detail.facade";
import { BrowserBackOverlayComponent } from "./browser-back-overlay.component";

class FakeOverlayService {
  public close = jest.fn();
}

class FakeDetailFacade {
  public logout = jest.fn();
}

describe("BrowserBackOverlayComponent", () => {
  let component: BrowserBackOverlayComponent;
  let overlayService: FakeOverlayService;
  let detailFacade: FakeDetailFacade;

  beforeEach(() => {
    overlayService = new FakeOverlayService();
    detailFacade = new FakeDetailFacade();
    component = new BrowserBackOverlayComponent(
      detailFacade as unknown as DetailFacade,
      overlayService as unknown as OverlayService
    );
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should dispatch logout action and close drawer", () => {
    component.logoutButtonClicked();
    expect(overlayService.close).toBeCalled();
    expect(detailFacade.logout).toBeCalled();
  });
});
