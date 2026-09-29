/* eslint-disable sonarjs/no-duplicate-string */
import { HttpClientModule, HttpErrorResponse, HttpEventType } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { provideMockActions } from "@ngrx/effects/testing";
import { Action } from "@ngrx/store";
import { provideMockStore } from "@ngrx/store/testing";
import { Observable, of } from "rxjs";
import { skip, take } from "rxjs/operators";
import { CustomerCaseFacade } from "@cg/olb/state";
import { SpinnerFacade } from "@cg/spinner";
import { cold, hot } from "jasmine-marbles";
import { AppointmentService } from "@cg/appointment-ui";
import { LoginActions, MY_BOOKING_LOGIN_URL, MY_BOOKING_LOGOUT_URL } from "@cg/my-booking-login";
import {
  Appointment,
  CustomerCaseService,
  CustomerObjects,
  CustomerService,
  OverlayService,
  SetAppointmentPayload
} from "@cg/shared";
import { CustomerProperyType } from "../enum";
import { MyBookingDetail } from "../interfaces/my-booking-detail.interface";
import * as DetailActions from "./detail.actions";
import { DetailEffects } from "./detail.effects";
import { appointment, customerCase, customerCaseEditContact, updateCustomerRequest } from "./mock.data";

class FakeCustomerCaseService {
  public getCustomerCase$ = jest.fn();
  public getCustomerCaseEditContact$ = jest.fn();
}

class FakeCustomerService {
  public updateCustomer = jest.fn();
}

class FakeRouter {
  public navigate = jest.fn();
}

class FakeAppointmentService {
  public confirmAppointment = jest.fn();
}

class FakeOverlayService {
  public close = jest.fn();
}

class FakeSpinnerFacade {
  public showSpinner = jest.fn();
  public hideSpinner = jest.fn();
}

class FakeCustomerCaseFacade {
  public customerCase$ = of({ id: "123-456-789" });
}

const errorResponse: HttpErrorResponse = {
  name: "HttpErrorResponse",
  message: "error",
  status: 401,
  statusText: "failed",
  type: HttpEventType.Response,
  ok: false,
  url: null
} as HttpErrorResponse;

// eslint-disable-next-line max-lines-per-function
describe("DetailEffects", () => {
  let actions$: Observable<Action>;
  let effects: DetailEffects;
  let customerCaseService: FakeCustomerCaseService;
  let overlayService: FakeOverlayService;
  let appointmentService: FakeAppointmentService;
  let router: FakeRouter;
  let spinnerFacade: FakeSpinnerFacade;
  let customerService: FakeCustomerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        DetailEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {
          provide: CustomerCaseService,
          useValue: new FakeCustomerCaseService()
        },
        {
          provide: OverlayService,
          useValue: new FakeOverlayService()
        },
        {
          provide: Router,
          useValue: new FakeRouter()
        },
        {
          provide: AppointmentService,
          useValue: new FakeAppointmentService()
        },
        {
          provide: SpinnerFacade,
          useValue: new FakeSpinnerFacade()
        },
        {
          provide: CustomerService,
          useValue: new FakeCustomerService()
        },
        {
          provide: CustomerCaseFacade,
          useValue: new FakeCustomerCaseFacade()
        }
      ]
    });

    effects = TestBed.inject(DetailEffects);
    customerCaseService = TestBed.inject(CustomerCaseService) as unknown as FakeCustomerCaseService;
    overlayService = TestBed.inject(OverlayService) as unknown as FakeOverlayService;
    appointmentService = TestBed.inject(AppointmentService) as unknown as FakeAppointmentService;
    router = TestBed.inject(Router) as unknown as FakeRouter;
    spinnerFacade = TestBed.inject(SpinnerFacade) as unknown as FakeSpinnerFacade;
    customerService = TestBed.inject(CustomerService) as unknown as FakeCustomerService;
  });

  it("should dispatch setMybookingDetailObject", () => {
    actions$ = hot("-a-|", {
      a: LoginActions.setResume({
        resume: {
          customerCaseId: "123-456-789",
          created: "2022-12-04"
        }
      })
    });

    const responseCustomerCaseEditContact = cold("(-a|)", { b: customerCaseEditContact });
    customerCaseService.getCustomerCaseEditContact$.mockImplementation(() => responseCustomerCaseEditContact);

    const expected = hot("-a-|", {
      a: DetailActions.setMybookingDetailObject({
        payload: {
          customerCase: { id: "123-456-789" },
          toastStatus: null
        } as MyBookingDetail
      })
    });
    expect(effects.setMyBookingDetailObject$).toBeObservable(expected);
  });

  it("should dispatch updateCustomerSuccessReceived", () => {
    actions$ = hot("-a-|", {
      a: DetailActions.updateCustomer({
        payload: { customer: updateCustomerRequest, type: CustomerProperyType.ADDRESS }
      })
    });

    const response = cold("(-a|)", { a: updateCustomerRequest });

    customerService.updateCustomer.mockImplementation(() => response);

    const expected = hot("-a-|", {
      a: DetailActions.updateCustomerSuccessReceived({
        payload: updateCustomerRequest as CustomerObjects
      })
    });
    expect(effects.updateCustomer$).toBeObservable(expected);
    expect(spinnerFacade.showSpinner).toBeCalled();
    expect(overlayService.close).toBeCalled();
    expect(spinnerFacade.hideSpinner).toBeCalled();
  });

  it("should dispatch updateCustomerFailureReceived", () => {
    actions$ = hot("-a-|", {
      a: DetailActions.updateCustomer({
        payload: { customer: updateCustomerRequest, type: CustomerProperyType.ADDRESS }
      })
    });

    const response = cold("(-#|)", {}, errorResponse);
    customerService.updateCustomer.mockImplementation(() => response);

    const expected = hot("-a-|", {
      a: DetailActions.updateCustomerFailureReceived()
    });
    expect(overlayService.close).not.toBeCalled();
    expect(effects.updateCustomer$).toBeObservable(expected);
  });

  it("should dispatch setMybookingDetailObject on page refresh", () => {
    actions$ = hot("-a-|", {
      a: DetailActions.getCustomerCase({ payload: { customerCaseId: "1234" } })
    });

    const responseCustomerCase = cold("(-a|)", { a: customerCase });
    const responseCustomerCaseEditContact = cold("(-b|)", { b: customerCaseEditContact });

    customerCaseService.getCustomerCase$.mockImplementation(() => responseCustomerCase);
    customerCaseService.getCustomerCaseEditContact$.mockImplementation(() => responseCustomerCaseEditContact);

    const expected = hot("-c-|", {
      c: DetailActions.setMybookingDetailObject({
        payload: {
          customerCase,
          customerCaseEditContact,
          toastStatus: null
        }
      })
    });
    expect(effects.getCustomerCase$).toBeObservable(expected);
  });

  it("should dispatch getCustomerCaseOnRefreshFailureReceived and navigate to login page", () => {
    actions$ = hot("-a-|", {
      a: DetailActions.getCustomerCase({ payload: { customerCaseId: "1234" } })
    });

    const responseCustomerCase = cold("(-a|)", { a: customerCase });
    const responseCustomerCaseEditContact = cold("(-#|)", {}, errorResponse);

    customerCaseService.getCustomerCase$.mockImplementation(() => responseCustomerCase);
    customerCaseService.getCustomerCaseEditContact$.mockImplementation(() => responseCustomerCaseEditContact);

    const expected = hot("-(c-|)", {
      c: DetailActions.getCustomerCaseFailureReceived()
    });
    expect(effects.getCustomerCase$).toBeObservable(expected);
    expect(router.navigate).toBeCalledWith([MY_BOOKING_LOGIN_URL]);
  });

  it("should dispatch resetState, navigate to login page and reset detail&login state", () => {
    actions$ = hot("-a-|", {
      a: DetailActions.logout({ payload: false })
    });

    effects.logout$.pipe(take(1)).subscribe((result) => {
      expect(router.navigate).toBeCalledWith([MY_BOOKING_LOGOUT_URL]);
      expect(result).toEqual(DetailActions.resetState());
    });

    effects.logout$.pipe(skip(1), take(1)).subscribe((result) => {
      expect(result).toEqual(LoginActions.resetState());
    });
  });

  it("should dispatch updateAppointmentSuccessReceived for updated appointment", () => {
    const setAppointmentPayload = {
      sublocality: "",
      appointmentId: appointment.id,
      customerCaseId: customerCase.id,
      serviceCenter: appointment.location,
      customerAppointmentStart: appointment.jobStart,
      customerAppointmentEnd: appointment.jobEnd
    } as SetAppointmentPayload;

    actions$ = hot("-a-|", {
      a: DetailActions.updateAppointment({
        payload: {
          setAppointmentPayload,
          prevAppointmentStartDate: ""
        }
      })
    });

    const response = cold("(-a|)", {});

    appointmentService.confirmAppointment.mockImplementation(() => response);

    const expected = hot("-a-|", {
      a: DetailActions.updateAppointmentSuccessReceived({
        payload: {
          sublocality: "",
          appointmentId: setAppointmentPayload.appointmentId,
          customerCaseId: setAppointmentPayload.customerCaseId,
          serviceCenter: setAppointmentPayload.serviceCenter,
          customerAppointmentStart: setAppointmentPayload.customerAppointmentStart,
          customerAppointmentEnd: setAppointmentPayload.customerAppointmentEnd
        } as Appointment
      })
    });
    expect(effects.updateAppointment$).toBeObservable(expected);
    expect(overlayService.close).toBeCalled();
  });

  it("should dispatch updateAppointmentFailureReceived for updated appointment", () => {
    const setAppointmentPayload = {
      ...appointment,
      sublocality: "",
      appointmentId: appointment.id,
      customerCaseId: customerCase.id,
      serviceCenter: appointment.location,
      customerAppointmentStart: appointment.jobStart,
      customerAppointmentEnd: appointment.jobEnd
    } as SetAppointmentPayload;

    actions$ = hot("-a-|", {
      a: DetailActions.updateAppointment({
        payload: {
          setAppointmentPayload,
          prevAppointmentStartDate: ""
        }
      })
    });

    const response = cold("(-#|)", {}, errorResponse);
    appointmentService.confirmAppointment.mockImplementation(() => response);

    const expected = hot("-a-|", {
      a: DetailActions.updateAppointmentFailureReceived()
    });
    expect(effects.updateAppointment$).toBeObservable(expected);
    expect(overlayService.close).not.toBeCalled();
  });
});
