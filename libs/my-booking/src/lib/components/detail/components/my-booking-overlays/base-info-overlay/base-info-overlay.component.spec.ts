/* eslint-disable sonarjs/no-duplicate-string */
import { Paragraph } from "@cg/content-api/typescript-interfaces";
import { infoIcon } from "@cg/icon";
import { PhoneNumber } from "@cg/shared";
import { BaseInfoOverlayComponent } from "./base-info-overlay.component";

describe("BaseInfoOverlayComponent", () => {
  let component: BaseInfoOverlayComponent;

  beforeEach(async () => {
    component = new BaseInfoOverlayComponent();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should have correct default cancel button", () => {
    expect(component.cancelCta).toEqual({
      arrowDirection: "right",
      icon: null,
      id: "info-overlay-cancel-cta",
      link: {
        href: null,
        routerLink: false,
        text: "myBooking.detail.overlays.baseInfoOverlayCancelBtn",
        title: "myBooking.detail.overlays.baseInfoOverlayCancelBtn"
      },
      ngTemplate: "cgCta",
      title: "myBooking.detail.overlays.baseInfoOverlayCancelBtn",
      variation: "primary"
    });
  });

  it("should have correct title", () => {
    const title = "Hello World";
    component.title = title;

    expect(component.title).toBe(title);
  });

  it("should set correct icon", () => {
    component.icon = infoIcon;

    expect(component.icon).toEqual(infoIcon);
  });

  it("should set correct phone", () => {
    component.phone = PhoneNumber.MY_BOOKING_CANCEL;

    expect(component.phone).toEqual(PhoneNumber.MY_BOOKING_CANCEL);
  });

  it("should set correct text", () => {
    const text: Paragraph = {
      text: "Test",
      ngTemplate: "cgParagraph"
    };
    component.text = text;

    expect(component.text).toEqual(text);
  });
});
