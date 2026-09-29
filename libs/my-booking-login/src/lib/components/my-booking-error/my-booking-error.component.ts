import { Location } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { OLB_CONFIG, OlbConfiguration } from "@cg/olb/configuration";
import { EntryChannel, PhoneNumber } from "@cg/shared";
import { LoginFacade } from "../../+state/login.facade";

@Component({
  selector: "cg-error",
  templateUrl: "./my-booking-error.component.html",
  styleUrls: ["./my-booking-error.component.scss"]
})
export class MyBookingErrorComponent implements OnInit {
  public readonly PhoneNumber = PhoneNumber;
  public listElements = [
    "myBooking.errorPage.reasons.spamFolder",
    "myBooking.errorPage.reasons.tooManyRequests",
    "myBooking.errorPage.reasons.incorrectEmail",
    "myBooking.errorPage.reasons.alreadyBooked",
    "myBooking.errorPage.reasons.licensePlateNotFound"
  ];
  public isHuk = false;

  public constructor(
    @Inject(OLB_CONFIG) private readonly olbConfig: OlbConfiguration,
    private readonly location: Location,
    private readonly loginFacade: LoginFacade
  ) {}

  public ngOnInit(): void {
    this.isHuk = this.olbConfig.entryChannel === EntryChannel.HUK_COBRANDED;
    if (this.isHuk) {
      this.listElements = [
        "myBooking.errorPage.reasons.licensePlateNotFound",
        "myBooking.errorPage.reasons.linkExpired"
      ];
    }
  }

  public async navigateToLogin(): Promise<void> {
    this.loginFacade.resetState();
    this.location.back();
  }
}
