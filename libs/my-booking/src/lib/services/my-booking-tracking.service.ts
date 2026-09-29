import { Injectable } from "@angular/core";
import { damageWindowTrackingMapping } from "@cg/olb/tiles";
import { differenceInCalendarDays, differenceInHours } from "date-fns";
import { GoogleTagManagerService } from "@cg/analytics";
import { DamageWindow } from "@cg/shared";
import { MyBookingTrackingEvent } from "../models";

@Injectable({
  providedIn: "root"
})
export class MyBookingTrackingService {
  public constructor(private readonly gtmService: GoogleTagManagerService) {}

  public trackFieldEvent(eventData: MyBookingTrackingEvent): void {
    this.trackEvent(eventData);
  }

  public trackEditCustomer(eventAction: string, startDate: string): void {
    this.trackEvent({
      eventAction,
      eventLabel: "my-booking/detail",
      appointment: {
        "days-until": Math.abs(this.getDifferenceInDays(startDate))
      }
    });
  }

  public trackAppointmentDetails(
    damageWindow: DamageWindow,
    requiredService: "repair" | "replace",
    isOrganization: boolean
  ) {
    this.trackEvent({
      eventLabel: isOrganization ? "editing-not-possible" : "editing-possible",
      eventAction: damageWindowTrackingMapping.get(damageWindow),
      appointment: {
        "job-type": requiredService
      }
    });
  }

  public trackEditAppointment(eventAction: string, startDate: string, endDate?: string): void {
    const getAppointnment = () => {
      switch (eventAction) {
        case "appointment-edited":
          return this.getAppointmentEdited(startDate, endDate);
        case "cancel-appointment":
          return this.getCancelAppointments(startDate);
        default:
          return {
            "days-until": Math.abs(this.getDifferenceInDays(startDate))
          };
      }
    };

    this.trackEvent({
      eventAction,
      eventLabel: "my-booking/detail",
      appointment: getAppointnment()
    });
  }

  private trackEvent(eventData: MyBookingTrackingEvent): void {
    this.gtmService.trackEvent({
      ...eventData,
      eventCategory: "my-booking"
    });
  }

  private getDifferenceInDays(appointmentDate: string, oldAppointmentDate?: string): number {
    return differenceInCalendarDays(
      new Date(appointmentDate),
      new Date(oldAppointmentDate ? oldAppointmentDate : new Date(Date.now()))
    );
  }

  private getCancelAppointments(startDate: string): { [key: string]: number } {
    const daysDifference = this.getDifferenceInDays(startDate);
    const appointment = {
      "canceled-days-before": daysDifference
    };

    if (daysDifference === 0) {
      appointment["canceled-hours-before"] = Math.abs(differenceInHours(new Date(startDate), new Date(Date.now())));
    }

    return appointment;
  }

  private getAppointmentEdited(startDate: string, endDate: string): { [key: string]: number | string } {
    const daysChanged = this.getDifferenceInDays(startDate, endDate);

    return {
      "days-until": Math.abs(this.getDifferenceInDays(startDate)),
      "days-changed-to-appointment": Math.abs(daysChanged),
      edited: daysChanged < 0 ? "earlier-date" : "later-date"
    };
  }
}
