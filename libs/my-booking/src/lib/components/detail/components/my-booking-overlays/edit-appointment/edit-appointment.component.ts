import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormGroup, UntypedFormControl, Validators } from "@angular/forms";
import { Actions, ofType } from "@ngrx/effects";
import { BehaviorSubject, combineLatest, of } from "rxjs";
import { filter, take } from "rxjs/operators";
import { AppointmentActions, AppointmentFacade, CustomerCaseFacade, DamageFacade, ProductFacade } from "@cg/olb/state";
import { SpinnerFacade } from "@cg/spinner";
import { TranslocoService } from "@ngneat/transloco";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { Paragraph } from "@cg/content-api/typescript-interfaces";
import { AddFormControls } from "@cg/core/types";
import { environment } from "@cg/environments";
import { calendarInfoFilledIcon } from "@cg/icon";
import { LocationsFacade } from "@cg/locations";
import { GetProductsRequest } from "@cg/olb/shared";
import {
  Appointment,
  AppointmentData,
  AppointmentSearchForm,
  Button,
  ConfigFacade,
  CustomerCase,
  JobStatus,
  OverlayService,
  PhoneNumber,
  RequiredService
} from "@cg/shared";
import { DetailFacade } from "../../../../../+state/detail.facade";
import { CalloutAppointmentComponent } from "../callout-appointment/callout-appointment.component";

@UntilDestroy()
@Component({
  selector: "cg-edit-appointment",
  templateUrl: "./edit-appointment.component.html"
})
export class EditAppointmentComponent implements OnInit, OnDestroy {
  @Input() public customerCase: CustomerCase;
  public readonly PhoneNumber = PhoneNumber;
  public text: Paragraph;
  public readonly calendarInfoFilledIcon = calendarInfoFilledIcon;
  public appointmentData: AppointmentData;
  public prevAppointmentStartDate: string;
  public form: FormGroup<AddFormControls<AppointmentSearchForm>>;

  public detailFooterButtons: Button[];
  public calloutFooterButtons: Button[];

  public get hasSelectedAppointment(): boolean {
    return !!this.form.value.selectedAppointmentId;
  }

  // eslint-disable-next-line max-params
  public constructor(
    private readonly detailFacade: DetailFacade,
    private readonly appointmentFacade: AppointmentFacade,
    private readonly productFacade: ProductFacade,
    private readonly damageFacade: DamageFacade,
    private readonly customerCaseFacade: CustomerCaseFacade,
    private readonly locationsFacade: LocationsFacade,
    private readonly spinnerFacade: SpinnerFacade,
    private readonly configFacade: ConfigFacade,
    private readonly actions$: Actions,
    private readonly translocoService: TranslocoService,
    private readonly overlayService: OverlayService
  ) {
    this.detailFooterButtons = [
      {
        id: "backButton",
        text: this.translocoService.translate("footer.buttons.prev")
      }
    ];

    this.calloutFooterButtons = [
      {
        id: "calloutFooterButton",
        text: this.translocoService.translate("overlayFooter.footerButtons.abort")
      }
    ];
  }

  public ngOnInit(): void {
    environment.features.mobileService = false;
    this.prevAppointmentStartDate = this.customerCase.appointment.availabilityPeriodStart;

    this.initAppointmentList();
  }

  public ngOnDestroy(): void {
    environment.features.mobileService = true;
  }

  public initForm(): void {
    this.form = new FormGroup<AddFormControls<AppointmentSearchForm>>({
      searchServiceCenterInput: new UntypedFormControl("", Validators.required),
      selectedAppointmentId: new UntypedFormControl("", Validators.required)
    });
  }

  // TODO: write test with manual selection
  public setAppointmentData(): void {
    this.locationsFacade.userPosition$
      .pipe(
        untilDestroyed(this),
        filter((serviceCenterCoordinates) => !!serviceCenterCoordinates)
      )
      .subscribe((serviceCenterCoordinates) => {
        this.spinnerFacade.hideForcedSpinner();
        const requiredService: RequiredService = this.customerCase.damages[0].requiredService as RequiredService;
        const serviceCenterAddress = `${this.customerCase.appointment.city}, ${this.customerCase.appointment.country}`;
        const timerangeBegin =
          requiredService === RequiredService.REPLACE ? this.customerCase.appointment.availabilityPeriodStart : null;

        const car = this.customerCase.car;
        const productPayload: GetProductsRequest = {
          customerCaseId: this.customerCase.id,
          productType: requiredService,
          part: this.customerCase.damages[0].compromisedPart,
          ...(car?.vin && { vin: car.vin }),
          ...(car?.brand && { brand: car.brand }),
          ...(car?.model && { model: car.model }),
          ...(car?.vehicleType && { carType: car.vehicleType })
        };

        this.customerCaseFacade.setCustomerCaseId(this.customerCase.id);
        this.customerCaseFacade.setLoaded(true);
        this.damageFacade.setRequiredService(requiredService);

        if (!this.customerCase.shoppingCartEntries?.length) {
          this.productFacade.loadAllProducts(productPayload);
        } else {
          this.productFacade.setSelectedProduct(this.customerCase.shoppingCartEntries);
        }

        this.appointmentFacade.setStatus(this.customerCase.appointment.status);
        this.appointmentFacade.setFormattedAddress(serviceCenterAddress);
        this.appointmentFacade.setSelectedServiceCenterIds([this.customerCase.appointment.location]);
        this.appointmentFacade.setAppointmentLocation({
          city: this.customerCase.appointment.city,
          postalCode: this.customerCase.appointment.postalCode,
          street: this.customerCase.appointment.street
        });
        this.appointmentFacade.saveAutocompleteResult(
          serviceCenterCoordinates.lat,
          serviceCenterCoordinates.lng,
          serviceCenterAddress,
          timerangeBegin
        );
        this.appointmentData = {
          appointmentId$: this.appointmentFacade.appointmentId$,
          currentAppointment$: this.appointmentFacade.currentAppointment$,
          availableAppointments$: this.appointmentFacade.availableAppointments$,
          selectedServiceCenter$: this.appointmentFacade.selectedServiceCenter$,
          selectedServiceCenterIds$: this.appointmentFacade.selectedServiceCenterIds$,
          availableServiceCenters$: this.appointmentFacade.availableServiceCenters$,
          isCalibration$: this.appointmentFacade.isCalibration$,
          requiredService$: of(this.customerCase.damages[0].requiredService as RequiredService),
          formattedAddress$: this.appointmentFacade.formattedAddress$,
          mobileServiceAvailable$: this.appointmentFacade.mobileServiceAvailable$,
          hasAdverseBuyAppointments$: this.appointmentFacade.hasAdverseBuyAppointments$,
          confirmed$: this.appointmentFacade.confirmed$,
          appointmentNextLoading$: this.appointmentFacade.appointmentNextLoading$,
          nextLoadingLimitReached$: this.appointmentFacade.nextLoadingLimitReached$,
          isLoading$: this.appointmentFacade.isLoading$,
          customerCaseId$: of(this.customerCase.id),
          gmCount$: of(this.customerCase.damages[0].gmCount),
          reloadAppointments$: new BehaviorSubject<boolean>(false),
          resumeResponse$: of(null),
          isBookingWithoutAppointmentAllowed: false,
          isScSelectDisabled: requiredService === RequiredService.REPLACE,
          config: this.configFacade.appointmentsConfig$,
          setStatus: (status: JobStatus) => {
            this.appointmentFacade.setStatus(status);
          },
          resetStateForForm: () => {
            this.appointmentFacade.resetStateForForm();
          },
          setSearchInput: (searchValue: string) => {
            this.appointmentFacade.setSearchInput(searchValue);
          },
          confirmAppointment: (appointment: Appointment) => {
            this.appointmentFacade.confirmAppointment(appointment);
          },
          setAppointmentId: (appointmentId: string) => {
            this.appointmentFacade.setAppointmentId(appointmentId);
          },
          setSelectedServiceCenterIds: (serviceCenterIds: string[]) => {
            this.appointmentFacade.setSelectedServiceCenterIds(serviceCenterIds);
          },
          clearAndRefetchAppointments: (serviceCenterId: string) => {
            this.appointmentFacade.clearAndRefetchAppointments(serviceCenterId, timerangeBegin);
          },
          setNextLoadingLimitReached: (limitReached: boolean) => {
            this.appointmentFacade.setNextLoadingLimitReached(limitReached);
          },
          setMobileServiceAvailable: (isAvailable: boolean) => {
            this.appointmentFacade.setMobileServiceAvailable(isAvailable);
          },
          getNextAppointments: (date: string) => {
            this.appointmentFacade.getNextAppointments(date);
          },
          saveAutocompleteResult: (lat: number, lng: number, address: string) => {
            this.appointmentFacade.saveAutocompleteResult(lat, lng, address);
          },
          reloadAppointments: () => {
            this.appointmentFacade.reloadAppointments();
          }
        };

        this.actions$.pipe(ofType(AppointmentActions.reloadAppointments), untilDestroyed(this)).subscribe(() => {
          this.appointmentData.reloadAppointments$.next(true);
        });
      });
  }

  public saveForm(): void {
    const { appointmentId$, availableAppointments$, customerCaseId$ } = this.appointmentData;

    combineLatest([appointmentId$, availableAppointments$, customerCaseId$])
      .pipe(take(1))
      .subscribe(([appointmentId, availableAppointments, customerCaseId]) => {
        if (!appointmentId) {
          console.error("No appointment id");

          return;
        }

        const selectedAppointment = availableAppointments.find((value) => value.appointmentId === appointmentId);
        if (!selectedAppointment) {
          console.error("No selected appointment");

          return;
        }

        const appointmentPayload: Appointment = {
          appointmentId: selectedAppointment.appointmentId,
          customerCaseId,
          availabilityPeriodStart: selectedAppointment.customerAppointmentStart, // has to be updated with customerAppointmentStart because backend does the same...
          availabilityPeriodEnd: selectedAppointment.availabilityPeriodEnd,
          customerAppointmentStart: selectedAppointment.customerAppointmentStart,
          customerAppointmentEnd: selectedAppointment.customerAppointmentEnd,
          serviceCenter: selectedAppointment.serviceCenter,
          street: selectedAppointment.street,
          city: selectedAppointment.city,
          sublocality: selectedAppointment.sublocality,
          postalCode: selectedAppointment.postalCode,
          state: selectedAppointment.state,
          country: selectedAppointment.country,
          fitterId: selectedAppointment.fitterId,
          overallTaskTime: selectedAppointment.overallTaskTime,
          jobStart: selectedAppointment.jobStart,
          jobEnd: selectedAppointment.jobEnd,
          locationType: "INHOUSE",
          status: "FIXED"
        };

        this.detailFacade.updateAppointmentOfCustomer(appointmentPayload, this.prevAppointmentStartDate);
        this.appointmentFacade.setAppointmentId(null);
      });
  }

  public goBackToAppointmentList(): void {
    this.appointmentFacade.setAppointmentId(null);
    this.initAppointmentList();
  }

  public calloutClicked(): void {
    this.overlayService.close();
    this.overlayService.open(CalloutAppointmentComponent);
  }

  private initAppointmentList() {
    this.initForm();
    this.spinnerFacade.forceShowSpinner();
    this.setAppointmentData();
  }
}
