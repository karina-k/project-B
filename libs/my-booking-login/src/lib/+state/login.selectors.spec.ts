import { Resume } from "@cg/shared";
import { MyBookingNotificationStatus } from "../enums/my-booking-toast-status.enum";
import { KtciResume } from "../interfaces";
import { LoginPartialState } from "./login.reducer";
import * as LoginSelectors from "./login.selectors";

const emailAddress = "test@test.de";
describe("Login Selectors", () => {
  let state: LoginPartialState;
  const resume: Resume = {
    customerCaseId: "test-id"
  } as Resume;

  beforeEach(() => {
    state = {
      myBookingLogin: {
        resume,
        resumeId: "test-id",
        maxAttemptsLpn: 2,
        maxAttemptsKtciCode: 3,
        notificationStatus: MyBookingNotificationStatus.ERROR,
        lpn: null,
        isKtciContent: false,
        ktciResume: {
          customerCaseId: "123"
        } as KtciResume,
        emailAddress
      }
    };
  });

  it("getLicencePlateNumberCheckFailureResult() should return number of remaining attempts", () => {
    const result = LoginSelectors.getLicencePlateNumberCheckFailureResult(state);
    expect(result).toEqual(2);
  });

  it("getLicencePlateNumberCheckSuccessResult() should return the resumeId state", () => {
    const result = LoginSelectors.getLicencePlateNumberCheckSuccessResult(state);
    expect(result).toEqual("test-id");
  });

  it("getLoginWithKtciCcdeFailure() should return the resume state", () => {
    const result = LoginSelectors.getLoginWithKtciCcdeFailure(state);
    expect(result).toEqual(3);
  });

  it("getToastStatus() should return the toast status state", () => {
    const result = LoginSelectors.getNotificationStatus(state);
    expect(result).toEqual(MyBookingNotificationStatus.ERROR);
  });

  it("getLpn() should return the lpn state", () => {
    const result = LoginSelectors.getLpn(state);
    expect(result).toEqual(null);
  });

  it("isKtciContent() should return the isKtciContent state", () => {
    const result = LoginSelectors.isKtciContent(state);
    expect(result).toEqual(false);
  });

  it("getKtciResume() should return the ktci resume state", () => {
    const result = LoginSelectors.getKtciResume(state);
    expect(result).toEqual({
      customerCaseId: "123"
    } as KtciResume);
  });

  it("getEmailAddress() should return email address of user", () => {
    const result = LoginSelectors.getEmailAddress(state);
    expect(result).toEqual(emailAddress);
  });
});
