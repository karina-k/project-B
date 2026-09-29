import { Inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Observable, of } from "rxjs";
import { filter, switchMap, take } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { CookieService } from "ngx-cookie-service";
import { SecurityFacade } from "@cg/core/api";
import { IS_SERVER_PLATFORM } from "@cg/core/utils";
import { LoginFacade, MY_BOOKING_LOGIN_URL } from "@cg/my-booking-login";
import { DetailFacade } from "../+state/detail.facade";

@UntilDestroy()
@Injectable({
  providedIn: "root"
})
export class RefreshGuard implements CanActivate {
  public constructor(
    private readonly cookieService: CookieService,
    private readonly detailFacade: DetailFacade,
    private readonly router: Router,
    private readonly loginFacade: LoginFacade,
    private readonly securityFacade: SecurityFacade,
    @Inject(IS_SERVER_PLATFORM) private readonly isServer: boolean
  ) {}

  public canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
    if (this.isServer) {
      return of(true);
    }

    const customerCaseId = this.cookieService.get("customerCaseId");

    if (customerCaseId) {
      return this.securityFacade.refreshToken$.pipe(
        untilDestroyed(this),
        filter((refreshToken) => !!refreshToken),
        switchMap(() => {
          this.detailFacade.getCustomerCaseOnRefresh(customerCaseId);
          return of(true);
        })
      );
    }
    return this.loginFacade.resume$.pipe(
      take(1),
      switchMap((resume) => {
        if (!resume) {
          this.router.navigateByUrl(MY_BOOKING_LOGIN_URL);
        }
        return of(!!resume);
      })
    );
  }
}
