import apiClient from "./apiClient";
import type { IntakeGroupOption, IntakeFormOptions, IntakeFormData } from "../types/intake";

export async function fetchCatalog(): Promise<IntakeGroupOption[]> {
  const res = await apiClient.get<IntakeGroupOption[]>("/intake/catalog");
  return res.data;
}

export async function fetchFormOptions(): Promise<IntakeFormOptions> {
  const res = await apiClient.get<IntakeFormOptions>("/intake/form-options");
  return res.data;
}

export interface SubmitResult {
  id: string;
  trackingNumber: string;
}

export async function submitIntake(data: IntakeFormData): Promise<SubmitResult> {
  const formData = new FormData();
  formData.append("ClientType", data.clientType);
  formData.append("ClientName", data.clientName);
  if (data.industry) formData.append("Industry", data.industry);
  formData.append("Address", data.address);
  if (data.country) formData.append("Country", data.country);
  if (data.numberOfEmployees) formData.append("NumberOfEmployees", data.numberOfEmployees);
  formData.append("ContactPerson", data.contactPerson);
  formData.append("Designation", data.designation);
  if (data.contactEmail) formData.append("ContactEmail", data.contactEmail);
  if (data.contactPhone) formData.append("ContactPhone", data.contactPhone);

  data.selectedServiceIds.forEach((id) => formData.append("SelectedServiceIds", id));

  formData.append("ConsultationPreference", data.consultationPreference);
  formData.append("ConsultationDate", data.consultationDate);
  data.preferredTimeSlots.forEach((slot) => formData.append("PreferredTimeSlots", slot));
  if (data.clientConcerns) formData.append("ClientConcerns", data.clientConcerns);
  formData.append("HowDidYouFindUs", data.howDidYouFindUs);

  if (data.file) formData.append("file", data.file);

  const res = await apiClient.post<SubmitResult>("/intake/submissions", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}