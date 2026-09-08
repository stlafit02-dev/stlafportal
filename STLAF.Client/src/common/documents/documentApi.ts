import apiClient from "../api/apiClient";

export interface DocumentRequest {
  id: string;
  trackingNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  title: string;
  note: string;
  documentLink?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  deadlineDate?: string | null;
  status: string;
  eaDecidedByName?: string | null;
  eaDecisionNotes?: string | null;
  eaDecidedAt?: string | null;
  partnerDecidedByName?: string | null;
  partnerDecisionNotes?: string | null;
  partnerDecidedAt?: string | null;
  createdAt: string;
  deletedAt?: string | null;
  partnerArchivedAt?: string | null;
}

export async function fetchMyDocumentRequests(): Promise<DocumentRequest[]> {
  const res = await apiClient.get<DocumentRequest[]>(
    "/document-requests/my-requests",
  );
  return res.data;
}

export async function createDocumentRequest(
  title: string,
  note: string,
  documentLink: string | undefined,
  deadlineDate: string | undefined,
  file: File | null,
): Promise<DocumentRequest> {
  const formData = new FormData();
  formData.append("Title", title);
  formData.append("Note", note);
  if (documentLink) formData.append("DocumentLink", documentLink);
  if (deadlineDate) formData.append("DeadlineDate", deadlineDate);
  if (file) formData.append("file", file);

  const res = await apiClient.post<DocumentRequest>(
    "/document-requests/requests",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return res.data;
}

export async function updateDocumentRequest(
  id: string,
  title: string,
  note: string,
  documentLink: string | undefined,
  deadlineDate: string | undefined,
  file: File | null,
  removeFile: boolean,
): Promise<DocumentRequest> {
  const formData = new FormData();
  formData.append("Title", title);
  formData.append("Note", note);
  if (documentLink) formData.append("DocumentLink", documentLink);
  if (deadlineDate) formData.append("DeadlineDate", deadlineDate);
  if (file) formData.append("file", file);
  formData.append("RemoveFile", String(removeFile));

  const res = await apiClient.put<DocumentRequest>(
    `/document-requests/requests/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return res.data;
}

export async function returnDocumentRequest(id: string): Promise<DocumentRequest> {
  const res = await apiClient.post<DocumentRequest>(
    `/document-requests/requests/${id}/return`,
  );
  return res.data;
}

export async function deleteDocumentRequest(id: string): Promise<DocumentRequest> {
  const res = await apiClient.delete<DocumentRequest>(
    `/document-requests/requests/${id}`,
  );
  return res.data;
}

export async function fetchDocumentTrash(): Promise<DocumentRequest[]> {
  const res = await apiClient.get<DocumentRequest[]>(
    "/document-requests/trash",
  );
  return res.data;
}

export async function restoreDocumentRequest(id: string): Promise<DocumentRequest> {
  const res = await apiClient.post<DocumentRequest>(
    `/document-requests/requests/${id}/restore`,
  );
  return res.data;
}

export async function hardDeleteDocumentRequest(id: string): Promise<void> {
  await apiClient.delete(`/document-requests/requests/${id}/permanent`);
}

export async function fetchPendingEa(): Promise<DocumentRequest[]> {
  const res = await apiClient.get<DocumentRequest[]>(
    "/document-requests/pending-ea",
  );
  return res.data;
}

export async function decideEa(
  id: string,
  approved: boolean,
  notes?: string,
): Promise<DocumentRequest> {
  const res = await apiClient.post<DocumentRequest>(
    `/document-requests/requests/${id}/decide-ea`,
    { approved, notes },
  );
  return res.data;
}

export async function fetchReturnedToEa(): Promise<DocumentRequest[]> {
  const res = await apiClient.get<DocumentRequest[]>(
    "/document-requests/returned-to-ea",
  );
  return res.data;
}

export async function forwardRejection(id: string): Promise<DocumentRequest> {
  const res = await apiClient.post<DocumentRequest>(
    `/document-requests/requests/${id}/forward-rejection`,
  );
  return res.data;
}

export async function fetchPendingPartner(): Promise<DocumentRequest[]> {
  const res = await apiClient.get<DocumentRequest[]>(
    "/document-requests/pending-partner",
  );
  return res.data;
}

export async function decidePartner(
  id: string,
  approved: boolean,
  notes?: string,
): Promise<DocumentRequest> {
  const res = await apiClient.post<DocumentRequest>(
    `/document-requests/requests/${id}/decide-partner`,
    { approved, notes },
  );
  return res.data;
}
export async function fetchPartnerDashboard(): Promise<DocumentRequest[]> {
  const res = await apiClient.get<DocumentRequest[]>(
    "/document-requests/partner-dashboard",
  );
  return res.data;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export async function fetchPartnerRepository(
  page: number,
  pageSize: number,
  search: string,
): Promise<PagedResult<DocumentRequest>> {
  const res = await apiClient.get<PagedResult<DocumentRequest>>(
    "/document-requests/partner-repository",
    { params: { page, pageSize, search: search || undefined } },
  );
  return res.data;
}

export async function archiveForPartner(id: string): Promise<DocumentRequest> {
  const res = await apiClient.delete<DocumentRequest>(
    `/document-requests/requests/${id}/partner-archive`,
  );
  return res.data;
}

export async function fetchPartnerTrash(): Promise<DocumentRequest[]> {
  const res = await apiClient.get<DocumentRequest[]>(
    "/document-requests/partner-trash",
  );
  return res.data;
}

export async function restoreForPartner(id: string): Promise<DocumentRequest> {
  const res = await apiClient.post<DocumentRequest>(
    `/document-requests/requests/${id}/partner-restore`,
  );
  return res.data;
}

export async function hardDeleteForPartner(id: string): Promise<void> {
  await apiClient.delete(`/document-requests/requests/${id}/partner-permanent`);
}
