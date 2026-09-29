import { TranslocoService } from "@ngneat/transloco";
import { Paragraph } from "@cg/content-api/typescript-interfaces";
import { NoContactEditingComponent } from "./no-contact-editing.component";

class FakeTranslocoService {
  public translate = jest.fn((key) => key);
}

describe("NoContactEditingComponent", () => {
  let component: NoContactEditingComponent;
  let translocoService: FakeTranslocoService;

  beforeEach(async () => {
    translocoService = new FakeTranslocoService();
    component = new NoContactEditingComponent(translocoService as unknown as TranslocoService);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("ngOnInit should initialise text", () => {
    component.ngOnInit();
    const expectedParagraph: Paragraph = {
      text: "myBooking.detail.overlays.noContactEditingSubline",
      ngTemplate: "cgParagraph"
    };

    expect(component.text).toStrictEqual(expectedParagraph);
  });
});
