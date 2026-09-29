import { Action } from "@ngrx/store";
import { BehaviorSubject, of } from "rxjs";
import { AppointmentFacade, CustomerCaseFacade, DamageFacade, ProductFacade } from "@cg/olb/state";
import { SpinnerFacade } from "@cg/spinner";
import { TranslocoService } from "@ngneat/transloco";
import { LocationsFacade } from "@cg/locations";
import {
  Appointment,
  ChosenProduct,
  ConfigFacade,
  OverlayService,
  RequiredService,
  VehicleTypeProductService
} from "@cg/shared";
import { DetailFacade } from "../../../../../+state/detail.facade";
import { customerCase } from "../../../../../+state/mock.data";
import { CalloutAppointmentComponent } from "../callout-appointment/callout-appointment.component";
import { EditAppointmentComponent } from "./edit-appointment.component";

class FakeDetailFacade {
  public updateAppointmentOfCustomer = jest.fn();
}
class FakeAppointmentFacade {
  public setAppointmentId = jest.fn();
  public setStatus = jest.fn();
  public setSelectedServiceCenterIds = jest.fn();
  public setAppointmentLocation = jest.fn();
  public saveAutocompleteResult = jest.fn();
  public setFormattedAddress = jest.fn();
}

class FakeProductFacade {
  public products$ = of([{ bookingNr: "1234" }]);
  public loadAllProducts = jest.fn();
  public setSelectedProduct = jest.fn();
}

class FakeCustomerCaseFacade {
  public customerCaseId$ = of();
  public setCustomerCaseId = jest.fn();
  public setLoaded = jest.fn();
}

class FakeLocationsFacade {
  public userPosition$ = of({ lng: 123, lat: 123 });
}

class FakeSpinnerFacade {
  public forceShowSpinner = jest.fn();
  public hideForcedSpinner = jest.fn();
}

class FakeDamageFacade {
  public requiredService$ = of();
  public gmCount$ = of();
  public setRequiredService = jest.fn();
}

class FakeTranslocoService {
  public translate = jest.fn();
}

class FakeConfigFacade {}

class FakeOverlayService {
  public open = jest.fn();
  public close = jest.fn();
}

const timestamp = "2022-09-07T07:30:00+02:00";
const appointment: Appointment = {
  appointmentId: "100",
  customerCaseId: "123",
  availabilityPeriodStart: timestamp,
  availabilityPeriodEnd: "2022-09-07T11:30:00+02:00",
  customerAppointmentStart: "2020-08-06 12:00:00",
  customerAppointmentEnd: "2020-08-06 13:00:00",
  serviceCenter: "123",
  street: "Subbelrather Straße 387",
  city: "Köln",
  sublocality: "xxx",
  postalCode: "50825",
  state: "Nordrhein-Westfalen",
  country: "Deutschland",
  fitterId: 1184,
  overallTaskTime: 83,
  jobStart: timestamp,
  jobEnd: "2022-09-07T09:08:00+02:00",
  locationType: "INHOUSE",
  status: "FIXED"
};

jest.mock("@cg/environments");

describe("EditAppointmentComponent", () => {
  let component: EditAppointmentComponent;
  let detailFacade: FakeDetailFacade;
  let appointmentFacade: FakeAppointmentFacade;
  let productFacade: FakeProductFacade;
  let customerCaseFacade: FakeCustomerCaseFacade;
  let locationsFacade: FakeLocationsFacade;
  let damageFacade: FakeDamageFacade;
  let spinnerFacade: FakeSpinnerFacade;
  let actions$: BehaviorSubject<Action>;
  let translocoService: FakeTranslocoService;
  let configFacade: FakeConfigFacade;
  let overlayService: FakeOverlayService;

  beforeEach(async () => {
    detailFacade = new FakeDetailFacade();
    appointmentFacade = new FakeAppointmentFacade();
    productFacade = new FakeProductFacade();
    customerCaseFacade = new FakeCustomerCaseFacade();
    damageFacade = new FakeDamageFacade();
    translocoService = new FakeTranslocoService();
    actions$ = new BehaviorSubject<Action>({ type: "" });
    spinnerFacade = new FakeSpinnerFacade();
    configFacade = new FakeConfigFacade();
    locationsFacade = new FakeLocationsFacade();
    overlayService = new FakeOverlayService();

    component = new EditAppointmentComponent(
      detailFacade as unknown as DetailFacade,
      appointmentFacade as unknown as AppointmentFacade,
      productFacade as unknown as ProductFacade,
      damageFacade as unknown as DamageFacade,
      customerCaseFacade as unknown as CustomerCaseFacade,
      locationsFacade as unknown as LocationsFacade,
      spinnerFacade as unknown as SpinnerFacade,
      configFacade as unknown as ConfigFacade,
      actions$,
      translocoService as unknown as TranslocoService,
      overlayService as unknown as OverlayService
    );
    component.customerCase = customerCase;
    component.ngOnInit();
  });

  it("should create", () => {
    const formattedAddress = `${customerCase.appointment.city}, ${customerCase.appointment.country}`;
    expect(component).toBeTruthy();
    expect(spinnerFacade.forceShowSpinner).toBeCalled();
    expect(customerCaseFacade.setCustomerCaseId).toBeCalledWith(customerCase.id);
    expect(appointmentFacade.setAppointmentLocation).toBeCalledWith({
      city: "Köln",
      postalCode: "50825",
      street: "Subbelrather Straße 387"
    });
    expect(appointmentFacade.saveAutocompleteResult).toBeCalledWith(123, 123, formattedAddress, timestamp);
    expect(appointmentFacade.setFormattedAddress).toBeCalledWith(formattedAddress);
    expect(appointmentFacade.setSelectedServiceCenterIds).toBeCalledWith([customerCase.appointment.location]);
    expect(appointmentFacade.setStatus).toBeCalledWith(customerCase.appointment.status);
    expect(damageFacade.setRequiredService).toBeCalledWith(customerCase.damages[0].requiredService as RequiredService);
  });

  it("should save and update appointment", () => {
    component.goBackToAppointmentList = jest.fn();
    component.appointmentData = {
      appointmentId$: of("100"),
      availableAppointments$: of([appointment]),
      customerCaseId$: of("123"),
      config: of({ busy: true }),
      confirmAppointment: jest.fn()
    };
    component.saveForm();

    const expectedAppointment = { ...appointment };
    expectedAppointment.availabilityPeriodStart = expectedAppointment.customerAppointmentStart;

    expect(detailFacade.updateAppointmentOfCustomer).toHaveBeenCalledWith(
      expectedAppointment,
      customerCase.appointment.availabilityPeriodStart
    );
    expect(appointmentFacade.setAppointmentId).toHaveBeenCalledWith(null);
  });

  it("should set no appointment id on back", () => {
    component.goBackToAppointmentList();

    expect(appointmentFacade.setAppointmentId).toHaveBeenCalledWith(null);
    expect(component.form.value.selectedAppointmentId).toBeFalsy();
  });

  it("should log error if no appointment id found", () => {
    component.appointmentData = {
      appointmentId$: of(null),
      availableAppointments$: of([appointment]),
      customerCaseId$: of("123"),
      config: of({ busy: true }),
      confirmAppointment: jest.fn()
    };
    console.error = jest.fn();
    component.saveForm();
    expect(console.error).toBeCalledWith("No appointment id");
  });

  it("should log error if no appointment is selected", () => {
    component.appointmentData = {
      appointmentId$: of("12"),
      customerCaseId$: of("123"),
      availableAppointments$: of([appointment])
    };
    console.error = jest.fn();
    component.saveForm();
    expect(console.error).toBeCalledWith("No selected appointment");
  });

  it("should have selected appointment", () => {
    component.initForm();
    component.form.controls.selectedAppointmentId.setValue("123");
    expect(component.hasSelectedAppointment).toBeTruthy();
  });

  it("should open callout overlay", () => {
    component.calloutClicked();

    expect(overlayService.open).toHaveBeenCalledWith(CalloutAppointmentComponent);
  });

  describe("should load all products", () => {
    it("via vin", () => {
      component.customerCase = { ...customerCase, car: { vin: "123" } };
      component.setAppointmentData();

      expect(productFacade.loadAllProducts).toHaveBeenCalledWith({
        customerCaseId: "1234",
        part: "FRONT",
        productType: "REPLACE",
        vin: "123"
      });
    });

    it("via manual car selection", () => {
      component.customerCase = {
        ...customerCase,
        car: { brand: "Tesla", model: "Y", vehicleType: VehicleTypeProductService.CAR }
      };
      component.setAppointmentData();

      expect(productFacade.loadAllProducts).toHaveBeenCalledWith({
        brand: "Tesla",
        carType: "PKW",
        customerCaseId: "1234",
        model: "Y",
        part: "FRONT",
        productType: "REPLACE"
      });
    });
  });

  it("should set selected producrt if present", () => {
    const shoppingCartEntries: ChosenProduct[] = [
      {
        itemNumber: "111",
        quantity: 1
      }
    ];
    component.customerCase = {
      ...customerCase,
      shoppingCartEntries
    };
    component.setAppointmentData();

    expect(productFacade.setSelectedProduct).toHaveBeenCalledWith(shoppingCartEntries);
  });
});
