import { Resume } from "@cg/shared";
import { MyBookingNotificationStatus } from "../enums/my-booking-toast-status.enum";
import * as LoginActions from "./login.actions";
import { initialState, LoginState, reducer } from "./login.reducer";

const lpn = { numbers: "101", letters: "AA", region: "K" };

describe("Login Reducer", () => {
  const resume: Resume = {
    customerCaseId: "test-id"
  } as Resume;

  it("checkLicensePlateNumber should set lpn in store", () => {
    const action = LoginActions.checkLicensePlateNumber({ lpn });

    const result: LoginState = reducer(initialState, action);

    expect(result.lpn).toEqual(lpn);
  });

  it("licencePlateNumberCheckSuccessResultReceived should set resumeId in store", () => {
    const action = LoginActions.licensePlateNumberCheckSuccessResultReceived({ resumeId: "test-id" });

    const result: LoginState = reducer(initialState, action);

    expect(result.resumeId).toBeDefined();
    expect(result.resumeId).toEqual("test-id");
  });

  it("licencePlateNumberCheckFailureResultReceived should set errorCheckLicencePlate parameter in store", () => {
    const action = LoginActions.licensePlateNumberCheckFailureResultReceived({ maxAttempts: 2 });

    const result: LoginState = reducer(initialState, action);

    expect(result.maxAttemptsLpn).toEqual(2);
  });

  it("setResume should set resume parameter in store", () => {
    const action = LoginActions.setResume({ resume });

    const result: LoginState = reducer(initialState, action);

    expect(result.resume?.customerCaseId).toBeDefined();
    expect(result.resume).toEqual(resume);
  });

  it("loginFailureResultReceived should set errorLoginWithKtciCode parameter in store", () => {
    const action = LoginActions.loginFailureResultReceived({ maxAttempts: 2 });

    const result: LoginState = reducer(initialState, action);

    expect(result.maxAttemptsKtciCode).toEqual(2);
  });

  it("resetState should reset the store", () => {
    const action = LoginActions.resetState();

    const result: LoginState = reducer(
      {
        resume,
        resumeId: "1234",
        maxAttemptsKtciCode: null,
        maxAttemptsLpn: null,
        toastStatus: null,
        lpn: null,
        isKtciContent: false,
        ktciResume: null,
        emailAddress: null
      },
      action
    );

    expect(result.maxAttemptsKtciCode).toEqual(null);
    expect(result.resume).toEqual(null);
    expect(result.resumeId).toEqual(null);
    expect(result.maxAttemptsLpn).toEqual(null);
  });

  it("setNotificationStatus", () => {
    const action = LoginActions.resetState();

    const result: LoginState = reducer(
      {
        resume,
        resumeId: "1234",
        maxAttemptsKtciCode: null,
        maxAttemptsLpn: null,
        toastStatus: null,
        lpn: null,
        isKtciContent: false,
        ktciResume: null,
        emailAddress: null
      },
      action
    );

    expect(result.maxAttemptsKtciCode).toEqual(null);
    expect(result.resume).toEqual(null);
    expect(result.resumeId).toEqual(null);
    expect(result.maxAttemptsLpn).toEqual(null);
  });

  it("setNotificationStatus should set the toast status", () => {
    const action = LoginActions.setNotificationStatus({ payload: MyBookingNotificationStatus.ERROR });
    const result: LoginState = reducer(
      {
        resume,
        resumeId: "1234",
        maxAttemptsLpn: null,
        maxAttemptsKtciCode: null,
        toastStatus: MyBookingNotificationStatus.ERROR,
        lpn,
        isKtciContent: false,
        ktciResume: null,
        emailAddress: null
      },
      action
    );
    expect(result.toastStatus).toEqual(MyBookingNotificationStatus.ERROR);
  });

  it("setNotificationStatusToMailDeliverSuccess should set the toast status with email", () => {
    const emailAddress = "test@test.de";
    const action = LoginActions.setNotificationStatusToMailDeliverySuccess({ payload: { emailAddress } });
    const result: LoginState = reducer(
      {
        resume,
        resumeId: "1234",
        maxAttemptsLpn: null,
        maxAttemptsKtciCode: null,
        toastStatus: MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_SUCCESS,
        lpn,
        isKtciContent: false,
        ktciResume: null,
        emailAddress
      },
      action
    );
    expect(result.toastStatus).toEqual(MyBookingNotificationStatus.KTCI_MAIL_DELIVERY_SUCCESS);
    expect(result.emailAddress).toEqual(emailAddress);
  });
});
