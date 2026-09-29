import { DatePipe } from "@angular/common";
import { Injectable } from "@angular/core";
import { combineLatest, Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import { appointmentElements } from "@cg/translation";
import { TranslocoService } from "@ngneat/transloco";
import { calendarIcon, pinMapLineIcon } from "@cg/icon";
import { BreakpointService, ContentCard, CustomerCase, CustomerCaseEditContact, Lpn, OverlayService } from "@cg/shared";
import {
  EditAppointmentComponent,
  NoContactEditingComponent
} from "../components/detail/components/my-booking-overlays";
import { EditAppointmentByCallbackComponent } from "../components/detail/components/my-booking-overlays/edit-appointment-by-callback/edit-appointment-by-callback.component";
import {
  isAppointmentChangeableInMyBooking,
  isReplaceRequired
} from "../utils/is-appointment-changable-in-my-booking.util";
import { MyBookingTrackingService } from "./my-booking-tracking.service";

const detailsEventLabel = "my-booking/detail";

@Injectable({
  providedIn: "root"
})
export class DetailService {
  public get isMobile$(): Observable<boolean> {
    return this.breakpointService.isTouch$;
  }

  private actionLabelNotPossible = "editing-not-possible";

  public constructor(
    private readonly datePipe: DatePipe,
    private readonly overlayService: OverlayService,
    private readonly breakpointService: BreakpointService,
    private readonly trackingService: MyBookingTrackingService,
    private readonly translocoService: TranslocoService
  ) {}

  public createLocationContentCard(customerCase: CustomerCase, hasSeparatorLine: boolean): ContentCard {
    const { appointment } = customerCase;
    const locationContentCard = this.createContentCard(
      "location",
      "myBooking.detail.serviceCenter",
      hasSeparatorLine,
      "",
      isReplaceRequired(customerCase) ? undefined : this.editAppointment(customerCase),
      { city: appointment.city }
    );
    locationContentCard.firstCellIcon = pinMapLineIcon;
    locationContentCard.subtitle = `${appointment.street}<br>${appointment.postalCode} ${appointment.city}`;
    return locationContentCard;
  }

  public createLpnContentCard(lpn: Lpn, hasSeparatorLine: boolean): ContentCard {
    return this.createContentCard(
      "lpn",
      "myBooking.detail.lpn",
      hasSeparatorLine,
      `${lpn.region}-${lpn.letters}-${lpn.numbers}`
    );
  }

  public createAddressContentCard(
    customerCaseEditContact: CustomerCaseEditContact,
    hasSeparatorLine: boolean
  ): ContentCard {
    const address = customerCaseEditContact.address;
    return this.createContentCard(
      "address",
      "myBooking.detail.address",
      hasSeparatorLine,
      `${customerCaseEditContact.firstName} ${customerCaseEditContact.lastName}</br>${address.street || ""}</br>${
        address.zipCode || ""
      } ${address.city || ""}`,
      () => {
        this.overlayService.open(NoContactEditingComponent);
        this.trackingService.trackFieldEvent({
          eventAction: this.actionLabelNotPossible,
          eventLabel: "customer-address"
        });
      }
    );
  }

  public createDamageDateContentCard(damageDate: string, hasSeparatorLine: boolean): ContentCard {
    return this.createContentCard(
      "damageDate",
      "myBooking.detail.damageDate",
      hasSeparatorLine,
      damageDate ? `${this.datePipe.transform(damageDate, "dd.MM.yyyy")}` : "--"
    );
  }

  public createToTakeWithContentCard$(damageDate: string, hasSeparatorLine: boolean): Observable<ContentCard> {
    const translationKeys = damageDate
      ? appointmentElements.mandatoryDocuments.items
      : appointmentElements.mandatoryDocumentsNoDamageDate.items;
    return combineLatest(
      translationKeys.map((translationKey: string) => this.translocoService.selectTranslate(translationKey))
    ).pipe(
      filter((translations: string[]) => translations.every(Boolean)),
      map((translations: string[]) => translations.map((translation: string) => `<li>${translation}</li>`)),
      map((listItems: string[]) => `<ul>${listItems.join("")}</ul>`),
      map((description: string) =>
        this.createContentCard(
          "toTakeWith",
          "appointmentConfirmation.texts.appointmentNeccessary",
          hasSeparatorLine,
          description
        )
      )
    );
  }

  public createContactContentCard(
    customerCaseEditContact: CustomerCaseEditContact,
    customerCaseId: string,
    hasSeparatorLine: boolean
  ): ContentCard {
    /*
    INFO: To edit the contact data of the customer, you can use the EditCustomerContactComponent. In this service, you can define a saveClicked Function,
    that calls DetailFacade.updateContactOfCustomer(..)
     */
    return this.createContentCard(
      "contact",
      "myBooking.detail.contact",
      hasSeparatorLine,
      `${customerCaseEditContact.email}</br>${
        customerCaseEditContact.phone.mobile ?? customerCaseEditContact.phone.landline
      }`,
      () => {
        this.overlayService.open(NoContactEditingComponent);
        this.trackingService.trackFieldEvent({
          eventAction: this.actionLabelNotPossible,
          eventLabel: "customer-contact"
        });
      }
    );
  }

  public createDateContentCard(customerCase: CustomerCase, hasSeparatorLine: boolean): ContentCard {
    const dateContentCard = this.createContentCard(
      "date",
      `${this.datePipe.transform(customerCase.appointment.availabilityPeriodStart, "EE")} ${this.datePipe.transform(
        customerCase.appointment.availabilityPeriodStart,
        "dd.MM.yyyy"
      )}`,
      hasSeparatorLine,
      "myBooking.detail.appointmentTimeInfo",
      this.editAppointment(customerCase)
    );
    dateContentCard.firstCellIcon = calendarIcon;
    dateContentCard.subtitle = "myBooking.detail.oclock";
    dateContentCard.subtitleTranslationParam = {
      time: this.datePipe.transform(customerCase.appointment.availabilityPeriodStart, "HH:mm")
    };
    return dateContentCard;
  }

  public createPaymentContentCard(): ContentCard {
    return this.createContentCard(
      "payment",
      "myBooking.detail.payment",
      false,
      "myBooking.detail.paymentDescription"
    );
  }

  private createContentCard(
    id: string,
    title: string,
    hasSeparatorLine: boolean,
    description?: string,
    onEditClick?: () => void,
    descriptionTranslationParam?: Record<string, string>
  ): ContentCard {
    const contentCard: ContentCard = {
      id,
      title,
      description,
      hasSeparatorLine,
      editTextKey: "myBooking.edit"
    };

    if (descriptionTranslationParam) {
      contentCard.descriptionTranslationParam = descriptionTranslationParam;
    }
    if (onEditClick) {
      contentCard.onEditClick = onEditClick;
    }
    return contentCard;
  }

  private editAppointment(customerCase: CustomerCase): () => void {
    return () => {
      if (isAppointmentChangeableInMyBooking(customerCase)) {
        this.overlayService.open(EditAppointmentComponent, { customerCase });
        this.trackingService.trackFieldEvent({ eventAction: "edit-appointment", eventLabel: detailsEventLabel });
      } else {
        this.overlayService.open(EditAppointmentByCallbackComponent, { customerCase });
        this.trackingService.trackFieldEvent({ eventAction: this.actionLabelNotPossible, eventLabel: "appointment" });
      }
    };
  }
}
