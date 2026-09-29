import { CommonModule, DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { AppointmentEffects, CustomerCaseEffects, ProductEffects } from "@cg/olb/effects";
import { ServicesModule } from "@cg/olb/services";
import { StateModule } from "@cg/olb/state";
import { ResumeCoreModule } from "@cg/resume-core";
import { SpinnerModule } from "@cg/spinner";
import { TranslocoModule } from "@ngneat/transloco";
import { CookieService } from "ngx-cookie-service";
import { AppointmentUiModule } from "@cg/appointment-ui";
import { CoreUiModule } from "@cg/core/ui";
import { FooterModule } from "@cg/footer";
import { HeaderModule } from "@cg/header";
import { LocationsModule } from "@cg/locations";
import { LpnInputModule } from "@cg/lpn-input";
import { MyBookingLoginModule } from "@cg/my-booking-login";
import { SharedOlbModule } from "@cg/olb/shared";
import { SharedModule } from "@cg/shared";
import { DetailEffects } from "./+state/detail.effects";
import * as fromDetail from "./+state/detail.reducer";
import { MYBOOKING_DETAIL_FEATURE_KEY } from "./+state/detail.reducer";
import { TrackingEffects } from "./+state/tracking.effects";
import { MyBookingActionsComponent } from "./components/detail/components/my-booking-actions/my-booking-actions.component";
import { MyBookingBookedAppointmentComponent } from "./components/detail/components/my-booking-booked-appointment/my-booking-booked-appointment.component";
import { MyBookingBookedDetailsComponent } from "./components/detail/components/my-booking-booked-details/my-booking-booked-details.component";
import { MyBookingDetailHeaderComponent } from "./components/detail/components/my-booking-detail-header/my-booking-detail-header.component";
import {
  BrowserBackOverlayComponent,
  CancelAppointmentComponent,
  EditAppointmentByCallbackComponent,
  EditAppointmentComponent,
  EditCustomerAddressComponent,
  NoContactEditingComponent
} from "./components/detail/components/my-booking-overlays";
import { BaseInfoOverlayComponent } from "./components/detail/components/my-booking-overlays/base-info-overlay/base-info-overlay.component";
import { CalloutAppointmentComponent } from "./components/detail/components/my-booking-overlays/callout-appointment/callout-appointment.component";
import { MyBookingDetailPageWrapperComponent } from "./components/detail/my-booking-detail-page-wrapper.component";
import { FrameComponent } from "./components/frame/frame.component";
import { RefreshGuard } from "./guard/refresh.guard";
import { MyBookingRoutingModule } from "./my-booking-routing.module";
import { AutoLogoutService } from "./services/auto-logout.service";
import { DetailService } from "./services/detail.service";
import { MyBookingTrackingService } from "./services/my-booking-tracking.service";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderModule,
    FooterModule,
    CoreUiModule,
    TranslocoModule,
    LpnInputModule,
    SharedOlbModule,
    MyBookingRoutingModule,
    ResumeCoreModule,
    ServicesModule,
    MyBookingLoginModule,
    LocationsModule,
    SpinnerModule,
    SharedModule,
    AppointmentUiModule,
    ReactiveFormsModule,
    EffectsModule.forFeature([DetailEffects, AppointmentEffects, ProductEffects, CustomerCaseEffects, TrackingEffects]),
    StoreModule.forFeature(MYBOOKING_DETAIL_FEATURE_KEY, fromDetail.reducer),
    StateModule
  ],
  declarations: [
    FrameComponent,
    MyBookingDetailPageWrapperComponent,
    MyBookingBookedAppointmentComponent,
    MyBookingDetailHeaderComponent,
    MyBookingBookedDetailsComponent,
    EditCustomerAddressComponent,
    MyBookingActionsComponent,
    CancelAppointmentComponent,
    EditAppointmentComponent,
    EditAppointmentByCallbackComponent,
    BrowserBackOverlayComponent,
    NoContactEditingComponent,
    BaseInfoOverlayComponent,
    CalloutAppointmentComponent
  ],
  providers: [DetailService, DatePipe, CookieService, RefreshGuard, AutoLogoutService, MyBookingTrackingService]
})
export class MyBookingModule {}
