import apiClient from "../api/apiClient";

export interface UndertimeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  reason: string;
  status: string;
  decidedByName?: string | null;
  decisionNotes?: string | null;
  decidedAt?: string | null;
  createdAt: string;
}

export interface CreateUndertimeRequestPayload {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export async function fetchMyUndertimeRequests(): Promise<UndertimeRequest[]> {
  const res = await apiClient.get<UndertimeRequest[]>("/undertime/my-requests");
  return res.data;
}

export async function createUndertimeRequest(payload: CreateUndertimeRequestPayload): Promise<UndertimeRequest> {
  const res = await apiClient.post<UndertimeRequest>("/undertime/requests", payload);
  return res.data;
}

export async function fetchAmIUndertimeApprover(): Promise<boolean> {
  const res = await apiClient.get<{ isApprover: boolean }>("/undertime/am-i-approver");
  return res.data.isApprover;
}

export async function fetchPendingUndertime(): Promise<UndertimeRequest[]> {
  const res = await apiClient.get<UndertimeRequest[]>("/undertime/pending-approvals");
  return res.data;
}

export async function decideUndertime(id: string, approved: boolean, notes?: string): Promise<UndertimeRequest> {
  const res = await apiClient.post<UndertimeRequest>(`/undertime/requests/${id}/decide`, { approved, notes });
  return res.data;
}