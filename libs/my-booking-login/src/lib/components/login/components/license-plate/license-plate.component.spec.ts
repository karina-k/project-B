/* eslint-disable sonarjs/no-duplicate-string */
import { HttpEventType } from "@angular/common/http";
import { ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { OlbConfiguration } from "@cg/olb/configuration";
import { ApiError, ResumeFacade } from "@cg/resume-core";
import { TranslocoService } from "@ngneat/transloco";
import { DataLayerEntry, GoogleTagManagerService } from "@cg/analytics";
import { EntryChannel, Resume } from "@cg/shared";
import { LoginFacade } from "../../../../+state/login.facade";
import { LicensePlateComponent } from "./license-plate.component";

class FakeRouter {
  public navigate = jest.fn();
}

class FakeResumeFacade {
  public loadResume = jest.fn();
  public loadSuccess$ = new BehaviorSubject<Resume | null>(null);
  public loadFailure$ = new BehaviorSubject<ApiError | null>(null);
  public resetState = jest.fn();
}

class FakeLoginFacade {
  public licencePlateNumberCheckFailed$ = new BehaviorSubject<string | null>(null);
  public setNotificationStatus = jest.fn();
  public checkLicensePlateNumber = jest.fn();
}

class FakeChangeDetectionRef {
  public markForCheck = jest.fn();
}

class FakeTranslocoService {
  public translate = jest.fn(() => "Fehler");
}

const formValues = {
  lpn: {
    region: "K",
    letters: "AA",
    numbers: "101"
  }
};

describe("LicensePlateComponent", () => {
  let router: FakeRouter;
  let resumeFacade: FakeResumeFacade;
  let cdr: FakeChangeDetectionRef;
  let translocoService: FakeTranslocoService;
  let component: LicensePlateComponent;
  let gtmService: Partial<GoogleTagManagerService>;
  let loginFacade: FakeLoginFacade;
  const olbConfig: OlbConfiguration = { entryChannel: EntryChannel.BOOKING };

  beforeEach(async () => {
    router = new FakeRouter();
    resumeFacade = new FakeResumeFacade();
    resumeFacade.loadSuccess$ = new BehaviorSubject<Resume | null>(null);
    resumeFacade.loadFailure$ = new BehaviorSubject<ApiError | null>(null);
    cdr = new FakeChangeDetectionRef();
    loginFacade = new FakeLoginFacade();
    loginFacade.licencePlateNumberCheckFailed$ = new BehaviorSubject<string | null>(null);
    translocoService = new FakeTranslocoService();
    gtmService = {
      trackEvent: jest.fn()
    };

    component = new LicensePlateComponent(
      cdr as unknown as ChangeDetectorRef,
      translocoService as unknown as TranslocoService,
      gtmService as unknown as GoogleTagManagerService,
      router as unknown as Router,
      loginFacade as unknown as LoginFacade,
      resumeFacade as unknown as ResumeFacade,
      olbConfig as unknown as OlbConfiguration
    );
    component.ngOnInit();
    component.form.controls.lpn.setValue(formValues.lpn);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("Save and Restore", () => {
    beforeEach(() => {
      component.resumeId = "test-id";
    });

    it.each([410, 404])("should route to expired page if resume response is %s", (status) => {
      const error: ApiError = {
        status,
        statusText: "irrelevant",
        url: null,
        ok: false,
        type: HttpEventType.Response,
        body: { failedAttempts: 1 }
      };

      const expectedUrl = ["/my-booking/error"];
      resumeFacade.loadFailure$.next(error);
      expect(router.navigate).toHaveBeenCalledWith(expectedUrl);
    });

    it("should set error message if loadFailure$ returned status unauthorised", () => {
      expect(component.errorMessage).toBe(null);
      for (let expectedAttempt = 2; expectedAttempt > 0; expectedAttempt--) {
        const error: ApiError = {
          status: 401,
          statusText: "Unauthorised",
          url: null,
          ok: false,
          type: HttpEventType.Response,
          body: { failedAttempts: expectedAttempt }
        };

        const errorBody = error.body as { failedAttempts: number };
        const errorMessage = (component.resumeAttempts - errorBody.failedAttempts).toString();
        translocoService.translate = jest.fn(() => errorMessage);
        resumeFacade.loadFailure$.next(error);
        expect(component.errorMessage).toBe(errorMessage);
        expect(cdr.markForCheck).toHaveBeenCalled();
      }
    });

    it("should route to error page if response status is other than gone, not found or unauthorised", () => {
      const error: ApiError = {
        status: 500,
        statusText: "irrelevant",
        url: null,
        ok: false,
        type: HttpEventType.Response,
        body: { failedAttempts: 1 }
      };
      const expectedUrl = ["/my-booking/error"];

      resumeFacade.loadFailure$.next(error);
      expect(router.navigate).toHaveBeenCalledWith(expectedUrl);
    });

    describe("Tracking", () => {
      it("should track when form is invalid on submit", () => {
        component.form.patchValue({
          lpn: null
        });
        component.form.updateValueAndValidity();
        component.onSubmit();

        const expected: DataLayerEntry = {
          eventCategory: "my-booking",
          eventAction: "log-in-license-plate",
          eventLabel: "next/fail"
        };
        expect(gtmService.trackEvent).toHaveBeenCalledWith(expected);
      });

      it("should track when login has failed", () => {
        const error: ApiError = {
          status: 500,
          statusText: "irrelevant",
          url: null,
          ok: false,
          type: HttpEventType.Response,
          body: { failedAttempts: 1 }
        };
        const expected: DataLayerEntry = {
          eventCategory: "my-booking",
          eventAction: "log-in-license-plate",
          eventLabel: "next/fail"
        };
        resumeFacade.loadFailure$.next(error);

        expect(gtmService.trackEvent).toHaveBeenCalledWith(expected);
      });

      it("should track when license plate is valid", () => {
        const expected: DataLayerEntry = {
          eventCategory: "my-booking",
          eventAction: "log-in-license-plate",
          eventLabel: "next/success"
        };
        resumeFacade.loadSuccess$.next({} as Resume);

        expect(gtmService.trackEvent).toHaveBeenCalledWith(expected);
      });
    });
  });

  describe("Login", () => {
    it("should set error message if lpn was not correct", () => {
      resumeFacade.loadFailure$.next({
        status: 401,
        type: HttpEventType.Response,
        body: { failedAttempts: 1 }
      } as ApiError);
      expect(component.errorMessage).toEqual("Fehler");
    });

    it("should dispatch license plate check request", () => {
      component.resumeId = "";
      const lpn = { region: "K", letters: "AA", numbers: "101" };
      component.form.setValue({ lpn });
      component.onSubmit();

      expect(loginFacade.checkLicensePlateNumber).toBeCalledWith(lpn);
    });

    it("should redirect to olb after resume is successful", () => {
      const expectedUrl = ["/olb"];
      resumeFacade.loadSuccess$.next({} as Resume);
      expect(router.navigate).toHaveBeenCalledWith(expectedUrl);
    });
  });
});
