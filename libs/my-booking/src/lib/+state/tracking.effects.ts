import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { select, Store } from "@ngrx/store";
import { TypedAction } from "@ngrx/store/src/models";
import { tap, withLatestFrom } from "rxjs/operators";
import {
  CustomerCase,
  eventRequiredServiceMapping,
  RequiredService,
  toDamageWindow,
  UpdateCustomerRequest
} from "@cg/shared";
import { CustomerProperyType } from "../enum";
import { MyBookingTrackingService } from "../services";
import * as DetailActions from "./detail.actions";
import * as DetailSelectors from "./detail.selectors";

@Injectable()
export class TrackingEffects {
  public updateAppointment$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(DetailActions.updateAppointment),
        tap((action) => {
          this.trackingService.trackEditAppointment(
            "appointment-edited",
            action.payload.setAppointmentPayload.availabilityPeriodStart,
            action.payload.prevAppointmentStartDate
          );
        })
      ),
    { dispatch: false }
  );

  public trackAppointmentDetails$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(DetailActions.setMybookingDetailObject),
        withLatestFrom(this.store.pipe(select(DetailSelectors.getCustomerCase))),
        tap(([_action, customerCase]) => {
          this.trackingService.trackAppointmentDetails(
            toDamageWindow[customerCase.damages[0].compromisedPart],
            eventRequiredServiceMapping.get(customerCase.damages[0].requiredService as RequiredService),
            customerCase.customer.customerIsOrganization === "Y"
          );
        })
      ),
    { dispatch: false }
  );

  public updateCustomer$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(DetailActions.updateCustomer),
        withLatestFrom(this.store.pipe(select(DetailSelectors.getCustomerCase))),
        tap(
          ([action, customerCase]: [
            {
              payload: { customer: UpdateCustomerRequest; type: CustomerProperyType };
            } & TypedAction<"[Detail/API] Update Customer">,
            CustomerCase
          ]) => {
            this.trackingService.trackEditCustomer(
              action.payload.type === CustomerProperyType.ADDRESS
                ? "customer-address-edited"
                : "customer-contact-edited",
              customerCase.appointment.availabilityPeriodStart
            );
          }
        )
      ),
    { dispatch: false }
  );

  public constructor(
    private readonly actions$: Actions,
    private readonly trackingService: MyBookingTrackingService,
    private readonly store: Store
  ) {}
}
