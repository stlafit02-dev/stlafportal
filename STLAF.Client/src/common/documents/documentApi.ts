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
