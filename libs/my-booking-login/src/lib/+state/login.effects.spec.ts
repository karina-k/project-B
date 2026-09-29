/* eslint-disable sonarjs/no-duplicate-string */
import { HttpErrorResponse } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { provideMockActions } from "@ngrx/effects/testing";
import { Action } from "@ngrx/store";
import { provideMockStore } from "@ngrx/store/testing";
import { Observable } from "rxjs";
import { AppointmentFacade, ProcessFacade } from "@cg/olb/state";
import { cold, hot } from "jasmine-marbles";
import { GoogleTagManagerService } from "@cg/analytics";
import { CustomerCase, CustomerCaseService, Resume, ResumeRequestState, ResumeType } from "@cg/shared";
import { MyBookingNotificationStatus } from "../enums/my-booking-toast-status.enum";
import { KtciResume } from "../interfaces";
import { LoginService } from "../services/login.service";
import * as LoginActions from "./login.actions";
import { LoginEffects } from "./login.effects";
import { getKtciResume } from "./login.selectors";

class FakeLoginService {
  public checkLicensePlateNumberCode = jest.fn();
  public requestKtciResumeWithResumeIdAndKtciCode = jest.fn();
}
class FakeGtmService {
  public trackEvent = jest.fn();
}

class FakeRouter {
  public navigate = jest.fn();
}

class FakeCustomerCaseService {
  public getCustomerCase$ = jest.fn();
}

class FakeProcessFacade {
  public resetState = jest.fn();
}

class FakeAppointmentFacade {
  public resetState = jest.fn();
}

const lpn = { numbers: "101", letters: "AA", region: "K" };
const created = "2023-01-29T13:21:42+01:00";
const customerCaseId = "f626e896-8824-48a6-b4d6-8a584474e90d";
const eventCategory = "my-booking";

// eslint-disable-next-line max-lines-per-function
describe("LoginEffects", () => {
  let actions$: Observable<Action>;
  let effects: LoginEffects;
  let loginService: FakeLoginService;
  let gtmService: FakeGtmService;
  let customerCaseService: FakeCustomerCaseService;
  let router: FakeRouter;
  let processFacade: FakeProcessFacade;
  let appointmentFacade: FakeAppointmentFacade;

  const resumeStateString = JSON.stringify({
    test: "test"
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoginEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            {
              selector: getKtciResume,
              value: {
                created,
                customerCaseId,
                manualCarSelection: null,
                resumeType: "B2C_MYBOOKING",
                state: resumeStateString
              }
            }
          ]
        }),
        {
          provide: LoginService,
          useValue: new FakeLoginService()
        },
        {
          provide: GoogleTagManagerService,
          useValue: new FakeGtmService()
        },
        {
          provide: CustomerCaseService,
          useValue: new FakeCustomerCaseService()
        },
        {
          provide: Router,
          useValue: new FakeRouter()
        },
        {
          provide: ProcessFacade,
          useValue: new FakeProcessFacade()
        },
        {
          provide: AppointmentFacade,
          useValue: new FakeProcessFacade()
        }
      ]
    });

    effects = TestBed.inject(LoginEffects);
    loginService = TestBed.inject(LoginService) as unknown as FakeLoginService;
    gtmService = TestBed.inject(GoogleTagManagerService) as unknown as FakeGtmService;
    customerCaseService = TestBed.inject(CustomerCaseService) as unknown as FakeCustomerCaseService;
    router = TestBed.inject(Router) as unknown as FakeRouter;
    processFacade = TestBed.inject(ProcessFacade) as unknown as FakeProcessFacade;
    appointmentFacade = TestBed.inject(AppointmentFacade) as unknown as FakeAppointmentFacade;
  });

  describe("Send KTCI mail again", () => {
    it("should dispatch setNotificationStatus with KTCI_MAIL_DELIVERY_AGAIN", () => {
      actions$ = hot("-a-|", {
        a: LoginActions.sendKtciMailAgain()
      });

      const responseLogin = cold("(-a|)", { a: { resumeId: "test-id" } });

      loginService.checkLicensePlateNumberCode.mockImplementation(() => responseLogin);

      const expected = hot("-a-|", {
        a: LoginActions.setNotificationStatus({ payload: MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_AGAIN })
      });
      expect(effects.sendMailAgain$).toBeObservable(expected);
      expect(gtmService.trackEvent).toHaveBeenCalledWith({
        eventAction: "request-log-in-code",
        eventCategory,
        eventLabel: "next/success"
      });
    });

    it("should dispatch setNotificationStatus with ERROR (eventLabel fail)", () => {
      actions$ = hot("-a-|", {
        a: LoginActions.sendKtciMailAgain()
      });

      const response = cold("(-#|)", {}, {} as HttpErrorResponse);

      loginService.checkLicensePlateNumberCode.mockImplementation(() => response);

      const expected = hot("-a-|", {
        a: LoginActions.setNotificationStatus({ payload: MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_NOT_POSSIBLE })
      });
      expect(effects.sendMailAgain$).toBeObservable(expected);
      expect(gtmService.trackEvent).toHaveBeenCalledWith({
        eventAction: "request-log-in-code",
        eventCategory,
        eventLabel: "fail"
      });
    });
  });

  describe("Licence Plate Number Check", () => {
    it("should dispatch licencePlateNumberCheckSuccessResultReceived", () => {
      actions$ = hot("-a", {
        a: LoginActions.checkLicensePlateNumber({ lpn })
      });
      const emailAddress = "test@test.de";

      const responseLogin = cold("(-a|)", { a: { resumeId: "test-id", emailAddress } });

      loginService.checkLicensePlateNumberCode.mockImplementation(() => responseLogin);

      const expected = cold("-(bc)", {
        b: LoginActions.licensePlateNumberCheckSuccessResultReceived({ resumeId: "test-id" }),
        c: LoginActions.setNotificationStatusToMailDeliverySuccess({ payload: { emailAddress } })
      });

      expect(effects.licencePlateNumberCheck$).toBeObservable(expected);
    });

    it("should dispatch setNotificationStatus with KTCI_MAIL_DELIVERY_NOT_POSSIBLE", () => {
      actions$ = hot("-a", {
        a: LoginActions.checkLicensePlateNumber({ lpn })
      });

      const error403: HttpErrorResponse = {
        status: 403,
        error: { resumeId: "1234" }
      } as HttpErrorResponse;

      const response = cold("(-#|)", {}, error403);
      loginService.checkLicensePlateNumberCode.mockImplementation(() => response);

      const expected = cold("-(bc)", {
        b: LoginActions.ktciAlreadyDeliverdAfterLpnCheck({ payload: { resumeId: "1234" } }),
        c: LoginActions.setNotificationStatus({ payload: MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_NOT_POSSIBLE })
      });
      expect(effects.licencePlateNumberCheck$).toBeObservable(expected);
      expect(gtmService.trackEvent).toHaveBeenCalledWith({
        eventAction: "log-in-license-plate",
        eventCategory: "my-booking",
        eventLabel: "not-available"
      });
    });

    it("should dispatch licencePlateNumberCheckFailureResultReceived", () => {
      actions$ = hot("-a", {
        a: LoginActions.checkLicensePlateNumber({ lpn: { numbers: "101", letters: "AA", region: "K" } })
      });

      const error: HttpErrorResponse = {
        error: { failedAttempts: 2 },
        status: 410
      } as HttpErrorResponse;

      const response = cold("(-#|)", {}, error);
      loginService.checkLicensePlateNumberCode.mockImplementation(() => response);

      const expected = cold("-(bc)", {
        b: LoginActions.licensePlateNumberCheckFailureResultReceived({ maxAttempts: 1 }),
        c: LoginActions.setNotificationStatus({ payload: MyBookingNotificationStatus.WRONG_LPN })
      });

      expect(effects.licencePlateNumberCheck$).toBeObservable(expected);
      expect(gtmService.trackEvent).toHaveBeenCalledWith({
        eventAction: "log-in-license-plate",
        eventCategory: "my-booking",
        eventLabel: "not-available"
      });
    });
  });

  describe("Login with KTCI Code", () => {
    it("should dispatch loginWithKtciSuccessful", () => {
      actions$ = hot("-a-|", {
        a: LoginActions.loginWithKtciCodeButtonClicked({
          resumeId: "resumeId",
          ktci: "123456"
        })
      });

      const ktciResponse: KtciResume = {
        created,
        customerCaseId,
        manualCarSelection: null,
        resumeType: ResumeType.B2C_MYBOOKING
      };

      const responseLogin = cold("(-a|)", { a: ktciResponse });

      loginService.requestKtciResumeWithResumeIdAndKtciCode.mockImplementation(() => responseLogin);

      const loginWithKtciSuccessful = hot("-a-|", {
        a: LoginActions.loginWithKtciSuccessful({ payload: ktciResponse })
      });

      expect(effects.loginWithKtciCode$).toBeObservable(loginWithKtciSuccessful);
      expect(gtmService.trackEvent).toHaveBeenCalledWith({
        eventAction: "log-in-code",
        eventCategory,
        eventLabel: "next/success"
      });
    });

    it("should dispatch loginSuccessResultReceived", () => {
      actions$ = hot("-a-|", {
        a: LoginActions.loginWithKtciSuccessful({
          payload: {
            created,
            customerCaseId,
            manualCarSelection: null,
            resumeType: ResumeType.B2C_MYBOOKING,
            state: resumeStateString
          }
        })
      });

      const customerCase = {
        id: "test-id"
      } as CustomerCase;

      const responseCustomerCase = cold("(-a|)", { a: customerCase });
      customerCaseService.getCustomerCase$.mockImplementation(() => responseCustomerCase);

      const resume: Resume = {
        customerCaseId: customerCase.id,
        created,
        manualCarSelection: null,
        resumeType: ResumeType.B2C_MYBOOKING,
        state: resumeStateString as unknown as ResumeRequestState
      };

      const expected = hot("-a-|", { a: LoginActions.setResume({ resume }) });
      expect(effects.loginWithKtciCodeSuccess$).toBeObservable(expected);
      expect(appointmentFacade.resetState).toHaveBeenCalled();
      expect(processFacade.resetState).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(["/my-booking/detail"]);
    });

    it("should dispatch loginFailureResultReceived", () => {
      actions$ = hot("-a", {
        a: LoginActions.loginWithKtciCodeButtonClicked({
          resumeId: "resume-id",
          ktci: "123456"
        })
      });

      const error: HttpErrorResponse = {
        error: { failedAttempts: 2 },
        status: 401
      } as HttpErrorResponse;

      const response = cold("(-#|)", {}, error);
      loginService.requestKtciResumeWithResumeIdAndKtciCode.mockImplementation(() => response);
      const expected = cold("-(bc)", {
        b: LoginActions.loginFailureResultReceived({ maxAttempts: 1 }),
        c: LoginActions.setNotificationStatus({ payload: MyBookingNotificationStatus.WRONG_KTCI })
      });
      expect(effects.loginWithKtciCode$).toBeObservable(expected);
    });
  });
});
