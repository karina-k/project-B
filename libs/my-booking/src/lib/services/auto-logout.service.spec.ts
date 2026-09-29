/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Renderer2, RendererFactory2 } from "@angular/core";
import { DetailFacade } from "../+state/detail.facade";
import { AutoLogoutService, STORE_KEY } from "./auto-logout.service";

class FakeDetailFacade {
  public logout = jest.fn();
}

class FakeRendererFactory2 {
  public createRenderer = jest.fn(() => ({ listen: () => {} } as unknown as Renderer2));
}

describe("AutoLogoutService", () => {
  let service: AutoLogoutService;
  let rendererFactory2: FakeRendererFactory2;
  let detailFacade: FakeDetailFacade;

  beforeEach(() => {
    rendererFactory2 = new FakeRendererFactory2();
    detailFacade = new FakeDetailFacade();

    service = new AutoLogoutService(
      true,
      rendererFactory2 as unknown as RendererFactory2,
      detailFacade as unknown as DetailFacade
    );
  });

  afterAll(() => {
    localStorage.clear();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should init auto logout functionality", async () => {
    service.initAutologoutFunctionality();
    expect(detailFacade.logout).not.toBeCalled();
  });

  it("should remove event listener", async () => {
    service.initListener();
    service.removeListener();

    // @ts-ignore
    expect(service.mouseoverListener).toEqual(undefined);
    // @ts-ignore
    expect(service.mouseoutListener).toEqual(undefined);
    // @ts-ignore
    expect(service.keyupListener).toEqual(undefined);
    // @ts-ignore
    expect(service.keypressListener).toEqual(undefined);
    // @ts-ignore
    expect(service.keydownListener).toEqual(undefined);
    // @ts-ignore
    expect(service.clickListener).toEqual(undefined);
  });

  it("should log out after long time of inactivity", async () => {
    service.setLastAction(new Date("1970-01-01").valueOf());
    service.check();
    expect(detailFacade.logout).toBeCalledWith(true);
  });

  it("should set last action", () => {
    service.setLastAction(1234);
    expect(localStorage.getItem(STORE_KEY)).toEqual("1234");
  });

  it("should not init auto logout functionality if it is not browser", () => {
    const serviceForTest = new AutoLogoutService(
      false,
      rendererFactory2 as unknown as RendererFactory2,
      detailFacade as unknown as DetailFacade
    );
    serviceForTest.initAutologoutFunctionality();
    const initListenerSpy = jest.spyOn(serviceForTest, "initListener");
    const setLastActionSpy = jest.spyOn(serviceForTest, "setLastAction");
    const checkSpy = jest.spyOn(serviceForTest, "check");

    expect(setLastActionSpy).not.toBeCalled();
    expect(checkSpy).not.toBeCalled();
    expect(initListenerSpy).not.toBeCalled();
  });

  it("should clear interval and remove listener", () => {
    const removeListenerSpy = jest.spyOn(service, "removeListener");

    service.clearIntervalAndRemoveListener();
    expect(removeListenerSpy).toBeCalled();
  });
});
