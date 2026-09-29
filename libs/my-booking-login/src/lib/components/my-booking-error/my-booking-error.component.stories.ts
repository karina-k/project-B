import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { BrowserModule } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { TranslocoTestingModule, TranslocoTestingOptions } from "@ngneat/transloco";
import { moduleMetadata } from "@storybook/angular";
import { CoreUiModule } from "@cg/core/ui";
import { MyBookingErrorComponent } from "./my-booking-error.component";

const langs = {
  de: {
    myBooking: {
      errorPage: {
        loginNotPossible: "Anmeldung nicht möglich",
        followingReasons: "Das kann folgende Gründe haben:",
        reasons: {
          spamFolder: "Die Booking Mail ist im Spam Ordner gelandet. Bitte prüfen Sie ihren Spam Ordner.",
          tooManyRequests:
            "<strong>Der LoginCode wurde bereits dreimal angefordert.</strong><br>Bitte kontaktieren Sie unseren Kundensupport.",
          incorrectEmail: "Ihre E-Mail Adresse ist nicht korrekt.",
          licensePlateNotFound: "Ihr Kennzeichen wird bei uns nicht gefunden.",
          linkExpired: "Der Link ist nach 14 Tagen bereits abgelaufen.",
          alreadyBooked: "Sie haben Ihre Buchung bereits durchgeführt."
        },
        ctaBookOnline: "Buchen Sie einen neuen Termin online.",
        or: "Oder",
        pleaseContactSupport: "Bitte wenden Sie sich an unseren Support:",
        alwaysAvailable: "Für Sie sind wir immer erreichbar - 7 Tage die Woche, 24h am Tag.",
        byPhone: "Per Telefon:"
      }
    },
    olbTechnicalError: {
      ctas: {
        start: {
          title: "Buchung neu starten"
        }
      }
    }
  }
};

function getTanslocoModule(options: TranslocoTestingOptions = {}) {
  return TranslocoTestingModule.forRoot({
    langs: langs,
    translocoConfig: {
      availableLangs: ["de"],
      defaultLang: "de"
    },
    preloadLangs: true,
    ...options
  });
}

export default {
  title: "My Booking/Error",
  decorators: [
    moduleMetadata({
      declarations: [MyBookingErrorComponent],
      imports: [BrowserModule, CoreUiModule, HttpClientModule, RouterTestingModule, getTanslocoModule()],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }]
    })
  ]
};

export const normal = () => ({
  component: MyBookingErrorComponent,
  props: {}
});
