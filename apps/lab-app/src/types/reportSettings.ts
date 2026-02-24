export type TemplateId = 'templateA' | 'templateB' | 'templateC';

export type SignaturePlacement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export type TextSizePreset = 'Small' | 'Medium' | 'Large';

export type SignatureColumns = 2 | 3 | 4;

export interface ReportRoleSetting {
  id?: number;
  role: string;
  displayName: string;
  designation: string;
  signatureUrl: string;
  enabled: boolean;
  sortOrder: number;
}

export interface ReportSettingsPayload {
  templateId: TemplateId;
  headerEnabled: boolean;
  headerRequired: boolean;
  fontSize: number;
  textSize: TextSizePreset;
  textColor: string;
  signaturePlacement: SignaturePlacement;
  signatureColumns: SignatureColumns;
  disclaimerEnabled: boolean;
  disclaimerText: string;
  roles: ReportRoleSetting[];
}

export interface ReportSettingsResponse {
  id: number;
  labId: number;
  templateId: TemplateId;
  headerEnabled: boolean;
  headerRequired: boolean;
  fontSize: number;
  textSize: TextSizePreset;
  textColor: string;
  signaturePlacement: SignaturePlacement;
  signatureColumns: SignatureColumns;
  disclaimerEnabled: boolean;
  disclaimerText: string;
  roles: ReportRoleSetting[];
  createdAt: string;
  updatedAt: string;
}
