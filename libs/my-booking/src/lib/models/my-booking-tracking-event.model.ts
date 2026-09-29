export interface MyBookingTrackingEvent {
  eventAction: string;
  eventLabel: string;
  appointment?: {
    "days-until"?: number;
    "days-changed-to-appointment"?: number;
    "canceled-days-before"?: number;
    "canceled-hours-before"?: number;
    "job-type"?: "repair" | "replace";
  };
}
