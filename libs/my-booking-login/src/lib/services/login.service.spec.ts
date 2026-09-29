import { HttpEventType } from "@angular/common/http";
import { lastValueFrom, of } from "rxjs";
import { ApiError } from "@cg/resume-core";
import { ApiService } from "@cg/core/api";
import { Lpn } from "@cg/shared";
import { LoginService } from "./login.service";

export class FakeApiService {
  public get = jest.fn(() => of({}));
}

describe("LoginService", () => {
  let service: LoginService;
  let apiService: FakeApiService;

  beforeEach(() => {
    apiService = new FakeApiService();
    service = new LoginService(apiService as unknown as ApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("login", () => {
    it("request for ktci code should be response successful", async () => {
      const requestData: { lpn: Lpn } = {
        lpn: { numbers: "101", letters: "AA", region: "K" }
      };

      apiService.get.mockImplementation(() => of({ resumeId: "test-id" }));

      const response = await lastValueFrom(service.checkLicensePlateNumberCode(requestData.lpn));
      expect(response).toStrictEqual({ resumeId: "test-id" });
    });

    it("request for ktci code should be response with failure", async () => {
      const requestData: { lpn: Lpn } = {
        lpn: { numbers: "101", letters: "AA", region: "K" }
      };
      const apiResumeResponse: ApiError = {
        status: 202,
        statusText: "error.statusText",
        type: HttpEventType.Response,
        url: "error.url",
        ok: false,
        body: "error.error"
      };
      apiService.get.mockImplementation(() => of(apiResumeResponse));

      const response = await lastValueFrom(service.checkLicensePlateNumberCode(requestData.lpn));
      expect(response).toStrictEqual(apiResumeResponse);
    });

    it("login with resume id and ktci code should be response successful", async () => {
      const responseData = { resume: {}, state: null };
      apiService.get.mockImplementation(() => of(responseData));

      const response = await lastValueFrom(service.requestKtciResumeWithResumeIdAndKtciCode("resume-id", "123456"));
      expect(response).toStrictEqual(responseData);
    });
  });
});
