import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AddFormControls } from "@cg/core/types";
import { AddressForm, CustomerCaseCustomer } from "@cg/shared";
import { DetailFacade } from "../../../../../+state/detail.facade";

@Component({
  selector: "cg-edit-customer-address",
  templateUrl: "./edit-customer-address.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditCustomerAddressComponent implements OnInit {
  @Input()
  public customer: CustomerCaseCustomer;

  public form: FormGroup<AddFormControls<{ customerAddress: AddressForm }>>;

  public constructor(private readonly detailFacade: DetailFacade) {}

  public ngOnInit(): void {
    const initialAddressForm = {
      title: this.customer.customerTitle,
      firstname: this.customer.customerFirstName,
      lastname: this.customer.customerLastName,
      zip: this.customer.customerShipZipCode,
      street: this.customer.customerShipAddressLine2 ?? this.customer.customerShipAddressLine1,
      city: this.customer.customerShipCity,
      country: this.customer.customerShipCountry
    };
    this.form = new FormGroup<AddFormControls<{ customerAddress: AddressForm }>>({
      customerAddress: new FormControl<AddressForm>(null, [Validators.required])
    });
    this.setFormValues(initialAddressForm);
  }

  public setFormValues(initialAddressForm: AddressForm): void {
    this.form.controls.customerAddress.patchValue(initialAddressForm);
  }

  public saveForm(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.detailFacade.updateAddressOfCustomer(this.form.controls.customerAddress.value);
  }
}
