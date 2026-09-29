import { Cta } from "@cg/content-api/typescript-interfaces";
import { CtaVariation } from "@cg/core/ui";
import { environment } from "@cg/environments";
import { arrowsIcon } from "@cg/icon";

export const textsLogin = {
  title: "myBooking.login.titleLogin",
  description: "myBooking.login.descriptionLogin"
};

export const textsLoginKtci = {
  title: "myBooking.login.titleLogin",
  description: "myBooking.login.descriptionLoginKtci"
};

export const lpnCtaLogin: Cta = {
  id: "ab-test-cta",
  title: "Anmelden",
  icon: arrowsIcon,
  link: {
    href: null,
    title: "Anmelden",
    text: "Anmelden",
    routerLink: false
  },
  arrowDirection: "right",
  variation: CtaVariation.PRIMARY,
  ngTemplate: "cgCta"
};

export const ktciInput = {
  id: "customer-address-firstname",
  controlName: "firstname",
  placeholder: "customerAddress.inputs.firstname.placeholder",
  errorMessage: "customerAddress.inputs.firstname.error"
};

export const imageContentLogin = {
  sizes: [
    {
      srcset: `${environment.assetPath}/my-booking/my-booking-login-mobile-360.png`,
      media: "xs"
    },
    {
      srcset: `${environment.assetPath}/my-booking/my-booking-login-tablet-675.png`,
      media: "sm"
    },
    {
      srcset: `${environment.assetPath}/my-booking/my-booking-login-desktop-768.png`,
      media: "md"
    },
    {
      srcset: `${environment.assetPath}/my-booking/my-booking-login-widescreen-992.png`,
      media: "lg"
    },
    {
      srcset: `${environment.assetPath}/my-booking/my-booking-login-widescreen-1200.png`,
      media: "xl"
    }
  ],
  source: `${environment.assetPath}/my-booking/my-booking-login-widescreen-1200.png`,
  classes: "cls-1 cls-2",
  alt: "Alternative text",
  ngTemplate: "cgPicture"
};
