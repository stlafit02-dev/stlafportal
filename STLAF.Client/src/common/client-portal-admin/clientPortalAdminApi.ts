import { isAxiosError } from "axios";
import apiClient from "../api/apiClient";
import type {
  Service,
  FormSchema,
  FieldDefinition,
  DocumentTemplate,
  TemplateFieldConfig,
  VoucherCode,
  AdminGeneratedDocument,
} from "./types";

export async function fetchAllServices(): Promise<Service[]> {
  const res = await apiClient.get<Service[]>("/client-portal/services/admin");
  return res.data;
}

export async function fetchService(id: string): Promise<Service> {
  const res = await apiClient.get<Service>(`/client-portal/services/admin/${id}`);
  return res.data;
}

export async function saveService(
  id: string | null,
  dto: { name: string; description: string; category: string; isActive: boolean },
): Promise<Service> {
  const res = id
    ? await apiClient.put<Service>(`/client-portal/services/admin/${id}`, dto)
    : await apiClient.post<Service>("/client-portal/services/admin", dto);
  return res.data;
}

export async function fetchLatestFormSchema(serviceId: string): Promise<FormSchema | null> {
  try {
    const res = await apiClient.get<FormSchema>(`/client-portal/form-schemas/${serviceId}/latest`);
    return res.data;
  } catch {
    return null;
  }
}

export async function saveFormSchema(serviceId: string, fields: FieldDefinition[]): Promise<FormSchema> {
  const res = await apiClient.post<FormSchema>(`/client-portal/form-schemas/${serviceId}`, { fields });
  return res.data;
}

export async function fetchDocumentTemplate(serviceId: string): Promise<DocumentTemplate | null> {
  try {
    const res = await apiClient.get<DocumentTemplate>(`/client-portal/document-templates/${serviceId}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function detectDocxTemplateFields(file: File): Promise<string[]> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post<{ fields: string[] }>(
    "/client-portal/document-templates/detect-docx-fields",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data.fields;
}

export async function uploadDocumentTemplate(
  serviceId: string,
  file: File,
  fieldConfig: TemplateFieldConfig[],
): Promise<DocumentTemplate> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fieldConfigJson", JSON.stringify(fieldConfig));

  const res = await apiClient.post<DocumentTemplate>(
    `/client-portal/document-templates/${serviceId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
}

export async function generateVoucher(durationDays: number | null, voucherExpiresAt: string | null): Promise<VoucherCode> {
  const res = await apiClient.post<VoucherCode>("/client-portal/vouchers/generate", {
    durationDays,
    voucherExpiresAt,
  });
  return res.data;
}

export async function fetchVouchers(): Promise<VoucherCode[]> {
  const res = await apiClient.get<VoucherCode[]>("/client-portal/vouchers");
  return res.data;
}

export async function deleteService(id: string): Promise<{ success: boolean; errorMessage?: string }> {
  try {
    await apiClient.delete(`/client-portal/services/admin/${id}`);
    return { success: true };
  } catch (err) {
    if (isAxiosError(err) && err.response?.data?.message) {
      return { success: false, errorMessage: err.response.data.message as string };
    }
    return { success: false, errorMessage: "Could not delete this service." };
  }
}

export async function fetchAllGeneratedDocuments(): Promise<AdminGeneratedDocument[]> {
  const res = await apiClient.get<AdminGeneratedDocument[]>("/client-portal-admin/documents");
  return res.data;
}

export async function deleteGeneratedDocument(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/client-portal-admin/documents/${id}`);
    return true;
  } catch {
    return false;
  }
}

export async function checkMyAdminAccess(): Promise<boolean> {
  try {
    const res = await apiClient.get<{ hasAccess: boolean }>("/client-portal-admin/access/mine");
    return res.data.hasAccess;
  } catch {
    return false;
  }
}
