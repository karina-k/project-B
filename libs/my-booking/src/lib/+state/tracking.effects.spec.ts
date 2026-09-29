import { Actions } from "@ngrx/effects";
import { Action } from "@ngrx/store";
import { getMockStore, MockStore } from "@ngrx/store/testing";
import { defer, lastValueFrom, Observable, of } from "rxjs";
import { first } from "rxjs/operators";
import { MyBookingNotificationStatus } from "@cg/my-booking-login";
import { DamageWindow, SetAppointmentPayload } from "@cg/shared";
import { CustomerProperyType } from "../enum";
import { MyBookingTrackingService } from "../services/my-booking-tracking.service";
import * as DetailActions from "./detail.actions";
import * as DetailSelectors from "./detail.selectors";
import { appointment, customerCase, customerCaseEditContact, updateCustomerRequest } from "./mock.data";
import { TrackingEffects } from "./tracking.effects";

class FakeTrackingService {
  public trackEditAppointment = jest.fn();
  public trackEditCustomer = jest.fn();
  public trackAppointmentDetails = jest.fn();
}

describe("TrackingEffects", () => {
  const trackingService = new FakeTrackingService();

  let actions$: Observable<Action>;
  let effects: TrackingEffects;
  let mockStore: MockStore;

  let initEffect: () => void;

  const prevAppointmentStartDate = appointment.availabilityPeriodStart;

  beforeEach(() => {
    mockStore = getMockStore({});
    mockStore.overrideSelector(DetailSelectors.getCustomerCase, customerCase);

    initEffect = () => {
      effects = new TrackingEffects(
        new Actions<Action>(defer(() => actions$)),
        trackingService as unknown as MyBookingTrackingService,
        mockStore
      );
    };

    initEffect();
  });

  it.each([["customer-address-edited", "customer-contact-edited"]])(
    "should track customer update",
    async (eventAction) => {
      actions$ = of(
        DetailActions.updateCustomer({
          payload: { customer: updateCustomerRequest, type: CustomerProperyType.ADDRESS }
        })
      );

      await lastValueFrom(effects.updateCustomer$.pipe(first()));

      expect(trackingService.trackEditCustomer).toHaveBeenCalledWith(eventAction, prevAppointmentStartDate);
    }
  );

  it("should track appointment details", async () => {
    actions$ = of(
      DetailActions.setMybookingDetailObject({
        payload: {
          customerCase: customerCase,
          customerCaseEditContact: customerCaseEditContact,
          toastStatus: MyBookingNotificationStatus.SUCCESS
        }
      })
    );
    await lastValueFrom(effects.trackAppointmentDetails$.pipe(first()));
    expect(trackingService.trackAppointmentDetails).toHaveBeenCalledWith(DamageWindow.FRONT, "replace", false);
  });

  it("should track appointment update", async () => {
    const setAppointmentPayload = {
      ...appointment,
      sublocality: "",
      appointmentId: appointment.id,
      customerCaseId: customerCase.id,
      serviceCenter: appointment.location,
      customerAppointmentStart: appointment.jobStart,
      customerAppointmentEnd: appointment.jobEnd
    } as SetAppointmentPayload;

    actions$ = of(
      DetailActions.updateAppointment({
        payload: {
          setAppointmentPayload,
          prevAppointmentStartDate
        }
      })
    );

    await lastValueFrom(effects.updateAppointment$.pipe(first()));

    expect(trackingService.trackEditAppointment).toHaveBeenCalledWith(
      "appointment-edited",
      appointment.availabilityPeriodStart,
      prevAppointmentStartDate
    );
  });
});
