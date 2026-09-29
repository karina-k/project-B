import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { TranslocoModule } from "@ngneat/transloco";
import { CoreUiModule } from "@cg/core/ui";
import { LpnInputModule } from "@cg/lpn-input";
import { SharedOlbModule } from "@cg/olb/shared";
import { SharedModule } from "@cg/shared";
import { LoginEffects } from "./+state/login.effects";
import * as fromLogin from "./+state/login.reducer";
import { LOGIN_FEATURE_KEY } from "./+state/login.reducer";
import { LicensePlateComponent } from "./components/login/components/license-plate/license-plate.component";
import { LoginProblemsOverlayComponent } from "./components/login/components/login-problems-overlay/login-problems-overlay.component";
import { MyBookingStatusToastComponent } from "./components/login/components/my-booking-status-toast/my-booking-status-toast.component";
import { VerificationCodeComponent } from "./components/login/components/verification-code/verification-code.component";
import { LoginComponent } from "./components/login/login.component";
import { MyBookingErrorComponent } from "./components/my-booking-error/my-booking-error.component";
import { LoginService } from "./services/login.service";

@NgModule({
  imports: [
    CommonModule,
    EffectsModule.forFeature([LoginEffects]),
    StoreModule.forFeature(LOGIN_FEATURE_KEY, fromLogin.reducer),
    TranslocoModule,
    CoreUiModule,
    LpnInputModule,
    SharedOlbModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    MyBookingErrorComponent,
    LoginComponent,
    LicensePlateComponent,
    VerificationCodeComponent,
    LoginProblemsOverlayComponent,
    MyBookingStatusToastComponent
  ],
  providers: [LoginService],
  exports: [LoginComponent, MyBookingErrorComponent, MyBookingStatusToastComponent]
})
export class MyBookingLoginModule {}
