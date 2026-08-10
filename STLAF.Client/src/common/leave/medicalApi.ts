import apiClient from "../api/apiClient";

export interface MedicalCertificate {
  id: string;
  leaveRequestId: string;
  employeeName: string;
  department: string;
  status: string;
  driveFileUrl?: string | null;
  uploadedAt?: string | null;
  verifiedByName?: string | null;
  verificationNotes?: string | null;
  verifiedAt?: string | null;
}

export async function fetchMedicalBlockStatus(): Promise<boolean> {
  const res = await apiClient.get<{ isBlocked: boolean }>(
    "/leave/medical-block-status",
  );
  return res.data.isBlocked;
}

export async function fetchMyMedicalCertificates(): Promise<
  MedicalCertificate[]
> {
  const res = await apiClient.get<MedicalCertificate[]>(
    "/leave/my-medical-certificates",
  );
  return res.data;
}

export async function uploadMedicalCertificate(
  certificateId: string,
  file: File,
): Promise<MedicalCertificate> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post<MedicalCertificate>(
    `/leave/medical-certificates/${certificateId}/upload`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
}

export async function fetchPendingMedicalVerifications(): Promise<
  MedicalCertificate[]
> {
  const res = await apiClient.get<MedicalCertificate[]>(
    "/leave/medical-certificates/pending",
  );
  return res.data;
}

export async function verifyMedicalCertificate(
  id: string,
  approved: boolean,
  notes?: string,
): Promise<MedicalCertificate> {
  const res = await apiClient.post<MedicalCertificate>(
    `/leave/medical-certificates/${id}/verify`,
    { approved, notes },
  );
  return res.data;
}
export async function testFileStorageConnection(): Promise<{
  success: boolean;
  error?: string | null;
}> {
  const res = await apiClient.post<{ success: boolean; error?: string | null }>(
    "/leave/test-file-storage",
  );
  return res.data;
}
