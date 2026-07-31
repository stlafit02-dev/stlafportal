import apiClient from "../api/apiClient";

export interface OvertimeRequest {
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
  deptDecidedByName?: string | null;
  deptDecisionNotes?: string | null;
  deptDecidedAt?: string | null;
  partnerDecidedByName?: string | null;
  partnerDecisionNotes?: string | null;
  partnerDecidedAt?: string | null;
  createdAt: string;
}

export interface CreateOvertimeRequestPayload {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface OvertimePartner {
  id: string;
  department: string;
  partnerEmployeeId: string;
  partnerName: string;
}

export async function fetchMyOvertimeRequests(): Promise<OvertimeRequest[]> {
  const res = await apiClient.get<OvertimeRequest[]>("/overtime/my-requests");
  return res.data;
}

export async function createOvertimeRequest(payload: CreateOvertimeRequestPayload): Promise<OvertimeRequest> {
  const res = await apiClient.post<OvertimeRequest>("/overtime/requests", payload);
  return res.data;
}

export async function fetchAmIDeptApprover(): Promise<boolean> {
  const res = await apiClient.get<{ isApprover: boolean }>("/overtime/am-i-dept-approver");
  return res.data.isApprover;
}

export async function fetchPendingDeptOvertime(): Promise<OvertimeRequest[]> {
  const res = await apiClient.get<OvertimeRequest[]>("/overtime/pending-dept-approvals");
  return res.data;
}

export async function decideDeptOvertime(id: string, approved: boolean, notes?: string): Promise<OvertimeRequest> {
  const res = await apiClient.post<OvertimeRequest>(`/overtime/requests/${id}/decide-dept`, { approved, notes });
  return res.data;
}

export async function fetchAmIPartner(): Promise<boolean> {
  const res = await apiClient.get<{ isPartner: boolean }>("/overtime/am-i-partner");
  return res.data.isPartner;
}

export async function fetchPendingPartnerOvertime(): Promise<OvertimeRequest[]> {
  const res = await apiClient.get<OvertimeRequest[]>("/overtime/pending-partner-approvals");
  return res.data;
}

export async function decidePartnerOvertime(id: string, approved: boolean, notes?: string): Promise<OvertimeRequest> {
  const res = await apiClient.post<OvertimeRequest>(`/overtime/requests/${id}/decide-partner`, { approved, notes });
  return res.data;
}

export async function fetchOvertimePartners(): Promise<OvertimePartner[]> {
  const res = await apiClient.get<OvertimePartner[]>("/overtime/partners");
  return res.data;
}

export async function setOvertimePartner(department: string, partnerEmployeeId: string): Promise<OvertimePartner> {
  const res = await apiClient.post<OvertimePartner>("/overtime/partners", { department, partnerEmployeeId });
  return res.data;
}