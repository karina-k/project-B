import {
  CustomerCase,
  CustomerCaseAppointment,
  CustomerCaseEditContact,
  EntryChannel,
  UpdateCustomerRequest,
  VehicleTypeBranch
} from "@cg/shared";

export const car = {
  vin: "WF0DXXGAJD5E3199",
  hsn: "2000",
  tsn: "200",
  brand: "Ford",
  model: "Fiesta",
  registrationDate: "2013-01-01",
  vehicleType: VehicleTypeBranch.CAR,
  insuranceNumber: "5312",
  insuranceName: "Allianz Versicherungs AG",
  policyNumber: "TST AC 1 5412 03",
  insuranceStart: "2016-12-31",
  insuranceEnd: "2025-12-30",
  lpn: {
    type: "NORMAL",
    country: "DE",
    region: "K",
    letters: "AA",
    numbers: "102",
    raw: "K AA 102"
  }
};

export const customer = {
  customerName: "David Test",
  customerFirstName: "David",
  customerLastName: "Test",
  customerIsOrganization: "N",
  customerNumber: "34384304",
  customerTitle: "Herr",
  customerEmail: "34t3@test.de",
  customerPhone1: "0232434",
  customerMarketingEmail: "N",
  customerMarketingSms: "N",
  customerShipAddressLine2: "Teststraße 24",
  customerShipZipCode: "12345",
  customerShipCity: "Bad Test",
  customerShipCountry: "DE",
  customerBillAddressLine2: "Teststraße 24",
  customerBillZipCode: "12345",
  customerBillCity: "Bad Test",
  customerBillCountry: "DE",
  costCenter: "978",
  contactFirstName: "Max",
  contactLastName: "Mustermann"
};

export const appointment = {
  id: "44a86e92-e009-41b0-8b4b-10cdc031f08a",
  customerCaseId: "bcab089f-55f5-4d65-9f61-bd838b6a8ebf",
  location: "341",
  city: "Köln",
  street: "Subbelrather Straße 387",
  state: "Nordrhein-Westfalen",
  postalCode: "50825",
  country: "Deutschland",
  availabilityPeriodStart: "2022-09-07T07:30:00+02:00",
  availabilityPeriodEnd: "2022-09-07T11:30:00+02:00",
  date: "2022-09-07",
  overallTaskTime: 83,
  fitterId: 1184,
  jobStart: "2022-09-07T07:30:00+02:00",
  jobEnd: "2022-09-07T09:08:00+02:00",
  adasJob: false,
  locationType: "INHOUSE",
  status: "FIXED",
  type: ""
} as CustomerCaseAppointment;

export const damages = [
  {
    id: "1ae67d73-a09a-40b3-9b16-a0999aad0da0",
    occurrenceDate: "1970-01-01",
    compromisedPart: "FRONT",
    requiredService: "REPLACE"
  }
];

export const customerCase = {
  id: "1234",
  status: "OPPORTUNITY",
  entryChannel: EntryChannel.BOOKING,
  aeNummer: "12",
  car,
  appointment,
  customer,
  damages
} as CustomerCase;

export const customerCaseEditContact: CustomerCaseEditContact = {
  name: "Test Booking",
  title: "Herr",
  firstName: "Test",
  lastName: "Booking",
  address: { street: "Teststraße 34", zipCode: "78073", city: "Bad Dürrheim", country: "DE" },
  email: "34t3@test.de",
  phone: { mobile: "34343343434", landline: "345340233233" },
  isOrganization: false
};

export const updateCustomerRequest = {
  customerCaseId: "1234",
  driver: {
    optInEmail: true,
    optInSms: true,
    address: {
      city: customer.customerBillCity,
      country: customer.customerBillCountry,
      street: customer.customerBillAddressLine2,
      addressLine2: customer.customerBillAddressLine2,
      zipCode: customer.customerBillZipCode
    },
    contact: {
      titleDriver: customer.customerTitle,
      email: customer.customerEmail,
      firstName: customer.customerFirstName,
      lastName: customer.customerLastName,
      phone: customer.customerPhone1,
      title: customer.customerTitle
    }
  }
} as UpdateCustomerRequest;
