import { TranslocoService } from "@ngneat/transloco";
import { Paragraph } from "@cg/content-api/typescript-interfaces";
import { customerCase } from "../../../../../+state/mock.data";
import { EditAppointmentByCallbackComponent } from "./edit-appointment-by-callback.component";

class FakeTranslocoService {
  public translate = jest.fn((key: string) => key);
}

describe("CancelAppointmentComponent", () => {
  let component: EditAppointmentByCallbackComponent;
  let translocoService: FakeTranslocoService;

  beforeEach(async () => {
    translocoService = new FakeTranslocoService();
    component = new EditAppointmentByCallbackComponent(translocoService as unknown as TranslocoService);
    component.customerCase = customerCase;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("ngOnInit should initialise text", () => {
    component.ngOnInit();
    const expectedParagraph: Paragraph = {
      text: "myBooking.detail.overlays.editAppointmentByPhone",
      ngTemplate: "cgParagraph"
    };

    expect(component.contentText).toStrictEqual(expectedParagraph);
  });
});
