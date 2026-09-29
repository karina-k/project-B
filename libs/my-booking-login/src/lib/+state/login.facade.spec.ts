import { Store } from "@ngrx/store";
import { of } from "rxjs";
import * as LoginActions from "./login.actions";
import { LoginFacade } from "./login.facade";

describe("LoginFacade", () => {
  let store: Partial<Store>;
  let facade: LoginFacade;

  beforeEach(() => {
    store = {
      dispatch: jest.fn(),
      pipe: jest.fn()
    };

    facade = new LoginFacade(store as Store);
  });

  it("should dispatch checkLicensePlateNumber", () => {
    const lpn = {
      region: "K",
      letters: "AA",
      numbers: "101"
    };

    facade.notificationStatus$ = of(null);
    facade.checkLicensePlateNumber(lpn);

    expect(store.dispatch).toHaveBeenCalledTimes(2);
    expect(store.dispatch).toHaveBeenCalledWith(LoginActions.checkLicensePlateNumber({ lpn }));
  });

  it("should dispatch loginWithKtciCodeButtonClicked", () => {
    const resumeId = "resume-id";
    facade.notificationStatus$ = of(null);
    facade.loginWithKtciCodeButtonClicked(resumeId, "123456");

    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(
      LoginActions.loginWithKtciCodeButtonClicked({ resumeId, ktci: "123456" })
    );
  });

  it("should dispatch sendKtciMailAgain", () => {
    facade.sendKtciMailAgain();

    expect(store.dispatch).toHaveBeenNthCalledWith(1, LoginActions.sendKtciMailAgain());
  });

  it("should dispatch resetState", () => {
    facade.resetState();

    expect(store.dispatch).toHaveBeenNthCalledWith(1, LoginActions.resetState());
  });
});
