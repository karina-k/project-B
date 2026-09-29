import { DetailFacade } from "../../../../../+state/detail.facade";
import { customer } from "../../../../../+state/mock.data";
import { EditCustomerAddressComponent } from "./edit-customer-address.component";

class FakeDetailFacade {
  public updateAddressOfCustomer = jest.fn();
}

describe("EditCustomerAddressComponent", () => {
  let component: EditCustomerAddressComponent;
  let detailFacade: FakeDetailFacade;

  beforeEach(async () => {
    detailFacade = new FakeDetailFacade();
    component = new EditCustomerAddressComponent(detailFacade as unknown as DetailFacade);
    component.customer = customer;
    component.ngOnInit();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should call updateAddressOfCustomer function of facade", () => {
    component.saveForm();
    expect(detailFacade.updateAddressOfCustomer).toHaveBeenCalledWith({
      city: "Bad Test",
      country: "DE",
      firstname: "David",
      lastname: "Test",
      street: "Teststraße 24",
      title: "Herr",
      zip: "12345"
    });
  });

  describe("should set initial form values", () => {
    it("with customerShipAddressLine2", () => {
      component.setFormValues = jest.fn();
      component.ngOnInit();

      expect(component.setFormValues).toHaveBeenCalledWith({
        city: "Bad Test",
        country: "DE",
        firstname: "David",
        lastname: "Test",
        street: "Teststraße 24",
        title: "Herr",
        zip: "12345"
      });
    });

    it("with customerShipAddressLine1", () => {
      component.setFormValues = jest.fn();

      component.customer = {
        ...customer,
        customerShipAddressLine2: undefined,
        customerShipAddressLine1: "Teststraße 33"
      };
      component.ngOnInit();

      expect(component.setFormValues).toHaveBeenCalledWith({
        city: "Bad Test",
        country: "DE",
        firstname: "David",
        lastname: "Test",
        street: "Teststraße 33",
        title: "Herr",
        zip: "12345"
      });
    });
  });
});
