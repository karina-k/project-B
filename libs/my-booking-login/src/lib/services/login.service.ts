import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { ApiService } from "@cg/core/api";
import { Lpn } from "@cg/shared";
import { KtciResume, Login } from "../interfaces";

@Injectable({
  providedIn: "root"
})
export class LoginService {
  public constructor(private apiService: ApiService) {}

  public checkLicensePlateNumberCode(lpn: Lpn): Observable<Login> {
    const path = `?lpn=${lpn.region}-${lpn.letters}-${lpn.numbers}`;
    return this.apiService
      .get<Login>("resume", path, { disableRetry: true })
      .pipe(catchError((error: string) => throwError(error || "Could not request ktci code")));
  }

  public requestKtciResumeWithResumeIdAndKtciCode(resumeId: string, ktci: string): Observable<KtciResume> {
    const path = `/${resumeId}?code=${ktci}`;
    return this.apiService.get<KtciResume>("resume", path, { disableRetry: true }).pipe(
      map(
        (response) =>
          <KtciResume>{
            ...response,
            state: !response.state ? null : JSON.parse(response.state)
          }
      ),
      catchError((error: string) => throwError(error || "Could not login"))
    );
  }
}
