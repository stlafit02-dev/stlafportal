export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  isActive: boolean;
  createdAt: string;
}

export type FieldType =
  | "text" | "textarea" | "number" | "email" | "date"
  | "select" | "radio" | "checkbox" | "multiselect";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: FieldOption[];
  helpText?: string;
}

export interface FormSchema {
  id: string;
  serviceId: string;
  version: number;
  fields: FieldDefinition[];
}

export interface TemplateFieldConfig {
  fieldKey: string;
  blurOnFree: boolean;
}

export interface DocumentTemplate {
  id: string;
  serviceId: string;
  templateFileKey: string;
  fieldConfig: TemplateFieldConfig[];
}

export interface AdminGeneratedDocument {
  id: string;
  submissionId: string;
  serviceId: string;
  serviceName: string;
  clientEmail: string;
  clientFullName: string;
  downloadUrl: string;
  generatedAt: string;
}

export interface VoucherCode {
  id: string;
  code: string;
  durationDays: number | null;
  voucherExpiresAt: string | null;
  isUsed: boolean;
  redeemedAt: string | null;
  createdAt: string;
}
