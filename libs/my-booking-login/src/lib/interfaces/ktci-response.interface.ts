import { ResumeType } from "@cg/shared";

export interface KtciResume {
  customerCaseId: string;
  resumeType: ResumeType;
  created: string;
  manualCarSelection: {
    brand: string;
    buildDate: string;
    carType: string;
    model: string;
  };
  aeNummer?: string;
  vermittlerName?: string;
  damageSize?: string;
  damageType?: string;
  damageLocation?: string;
  fetchGdv?: string;
  version?: number;
  state?: string;
}
