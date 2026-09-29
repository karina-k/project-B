import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { LoginComponent, MyBookingErrorComponent } from "@cg/my-booking-login";
import { MyBookingDetailPageWrapperComponent } from "./components/detail/my-booking-detail-page-wrapper.component";
import { FrameComponent } from "./components/frame/frame.component";
import { RefreshGuard } from "./guard/refresh.guard";

const routes: Route[] = [
  {
    path: "login",
    component: FrameComponent,
    children: [
      {
        path: "",
        component: LoginComponent
      },
      {
        path: ":resume-id",
        component: LoginComponent
      }
    ]
  },
  {
    path: "detail",
    component: FrameComponent,
    children: [
      {
        path: "",
        component: MyBookingDetailPageWrapperComponent,
        canActivate: [RefreshGuard]
      }
    ]
  },
  {
    path: "",
    component: FrameComponent,
    children: [{ path: "error", component: MyBookingErrorComponent }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class MyBookingRoutingModule {}
