import { Inject, Injectable, Renderer2, RendererFactory2 } from "@angular/core";
import { IS_BROWSER_PLATFORM } from "@cg/core/utils";
import { DetailFacade } from "../+state/detail.facade";

const MINUTES_UNITL_AUTO_LOGOUT = 5; // in mins
const CHECK_INTERVAL = 5000; // in ms
export const STORE_KEY = "lastAction";

@Injectable({
  providedIn: "root"
})
export class AutoLogoutService {
  private renderer: Renderer2;
  private interval: ReturnType<typeof setInterval> | undefined;

  private clickListener(): void {}
  private mouseoverListener(): void {}
  private mouseoutListener(): void {}
  private keypressListener(): void {}
  private keydownListener(): void {}
  private keyupListener(): void {}

  public constructor(
    @Inject(IS_BROWSER_PLATFORM) private readonly isBrowser: boolean,
    private readonly rendererFactory: RendererFactory2,
    private readonly detailFacade: DetailFacade
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  public initAutologoutFunctionality(): void {
    if (!this.isBrowser) {
      return;
    }
    this.initListener();
    this.setLastAction(Date.now());
    this.check();
    this.initInterval();
  }

  private getLastAction(): number {
    return parseInt(localStorage.getItem(STORE_KEY), 10);
  }

  public setLastAction(lastAction: number) {
    localStorage.setItem(STORE_KEY, lastAction.toString());
  }

  public initListener(): void {
    const reset = () => {
      localStorage.setItem(STORE_KEY, Date.now().toString());
    };
    this.clickListener = this.renderer.listen("body", "click", reset);
    this.mouseoverListener = this.renderer.listen("body", "mouseover", reset);
    this.mouseoutListener = this.renderer.listen("body", "mouseout", reset);
    this.keypressListener = this.renderer.listen("body", "keypress", reset);
    this.keydownListener = this.renderer.listen("body", "keydown", reset);
    this.keyupListener = this.renderer.listen("body", "keyup", reset);
  }

  public removeListener(): void {
    if (
      this.clickListener &&
      this.mouseoverListener &&
      this.mouseoutListener &&
      this.keypressListener &&
      this.keyupListener &&
      this.keydownListener
    ) {
      this.clickListener();
      this.mouseoverListener();
      this.mouseoutListener();
      this.keypressListener();
      this.keyupListener();
      this.keydownListener();
    }
  }

  public clearIntervalAndRemoveListener(): void {
    clearInterval(this.interval);
    this.removeListener();
  }

  public check(): void {
    const now = Date.now();
    const timeleft = this.getLastAction() + MINUTES_UNITL_AUTO_LOGOUT * 60 * 1000;
    const diff = timeleft - now;

    const isTimeout = diff < 0;

    if (isTimeout) {
      this.removeListener();
      this.detailFacade.logout(true);
      this.setLastAction(0);
    }
  }

  private initInterval(): void {
    this.interval = setInterval(() => {
      this.check();
    }, CHECK_INTERVAL);
  }
}
