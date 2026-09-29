import { Cta } from "@cg/content-api/typescript-interfaces";
import { CtaVariation } from "@cg/core/ui";
import { environment } from "@cg/environments";
import { arrowsIcon } from "@cg/icon";

export const textsSaveAndRestore = {
  title: "myBooking.login.saveAndRestore.titleResume",
  subtitle: "myBooking.login.saveAndRestore.subtitleResume"
};

const title = "Weiter";
export const lpnCtaSaveAndRestore: Cta = {
  id: "ab-test-cta",
  title,
  icon: arrowsIcon,
  link: {
    href: null,
    title,
    text: title,
    routerLink: false
  },
  arrowDirection: "right",
  variation: CtaVariation.PRIMARY,
  ngTemplate: "cgCta"
};

export const imageContentSaveAndRestore = {
  sizes: [
    {
      srcset: `${environment.assetPath}/reentry/reentry_car_checkup_XS.png`,
      media: "xs"
    },
    {
      srcset: `${environment.assetPath}/reentry/reentry_car_checkup_SM.png`,
      media: "sm"
    },
    {
      srcset: `${environment.assetPath}/reentry/reentry_car_checkup_XL.png`,
      media: "md"
    },
    {
      srcset: `${environment.assetPath}/reentry/reentry_car_checkup_XL.png`,
      media: "lg"
    },
    {
      srcset: `${environment.assetPath}/reentry/reentry_car_checkup_XL.png`,
      media: "xl"
    }
  ],
  source: `${environment.assetPath}/reentry/reentry_car_checkup_XL.png`,
  classes: "cls-1 cls-2",
  alt: "Willkommen zurück zu Ihrer Terminbuchung",
  ngTemplate: "cgPicture"
};
