import apiClient from "../api/apiClient";

export interface EmployeeProfile {
  companyId: string;
  fullName: string;
  department: string;
  officePosition: string;
}

export interface LeaveType {
  id: string;
  name: string;
  defaultCredits: number;
}

export interface LeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  defaultCredits: number;
  usedCredits: number;
  remainingCredits: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  decidedByName?: string | null;
  decisionNotes?: string | null;
  decidedAt?: string | null;
  createdAt: string;
}

export interface CreateLeaveRequestPayload {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface DecideLeaveRequestPayload {
  approved: boolean;
  notes?: string;
}

export interface LeaveApprover {
  id: string;
  department: string;
  approverEmployeeId: string;
  approverName: string;
}

export interface SmtpSender {
  id: string;
  label: string;
  email: string;
}

export interface NotificationSetting {
  smtpSenderId: string;
  senderEmail: string;
  senderLabel: string;
}

export async function fetchMyProfile(): Promise<EmployeeProfile> {
  const res = await apiClient.get<EmployeeProfile>("/leave/my-profile");
  return res.data;
}

export async function fetchLeaveTypes(): Promise<LeaveType[]> {
  const res = await apiClient.get<LeaveType[]>("/leave/types");
  return res.data;
}

export async function fetchMyBalances(): Promise<LeaveBalance[]> {
  const res = await apiClient.get<LeaveBalance[]>("/leave/my-balances");
  return res.data;
}

export async function fetchMyRequests(): Promise<LeaveRequest[]> {
  const res = await apiClient.get<LeaveRequest[]>("/leave/my-requests");
  return res.data;
}

export async function createLeaveRequest(
  payload: CreateLeaveRequestPayload,
): Promise<LeaveRequest> {
  const res = await apiClient.post<LeaveRequest>("/leave/requests", payload);
  return res.data;
}

export async function fetchAmIApprover(): Promise<boolean> {
  const res = await apiClient.get<{ isApprover: boolean }>(
    "/leave/am-i-approver",
  );
  return res.data.isApprover;
}

export async function fetchPendingApprovals(): Promise<LeaveRequest[]> {
  const res = await apiClient.get<LeaveRequest[]>("/leave/pending-approvals");
  return res.data;
}

export async function decideLeaveRequest(
  id: string,
  payload: DecideLeaveRequestPayload,
): Promise<LeaveRequest> {
  const res = await apiClient.post<LeaveRequest>(
    `/leave/requests/${id}/decide`,
    payload,
  );
  return res.data;
}

export async function createLeaveType(payload: {
  name: string;
  defaultCredits: number;
}): Promise<LeaveType> {
  const res = await apiClient.post<LeaveType>("/leave/types", payload);
  return res.data;
}

export async function updateLeaveType(
  id: string,
  payload: { name: string; defaultCredits: number },
): Promise<LeaveType> {
  const res = await apiClient.put<LeaveType>(`/leave/types/${id}`, payload);
  return res.data;
}

export async function fetchApprovers(): Promise<LeaveApprover[]> {
  const res = await apiClient.get<LeaveApprover[]>("/leave/approvers");
  return res.data;
}

export async function setApprover(
  department: string,
  approverEmployeeId: string,
): Promise<LeaveApprover> {
  const res = await apiClient.post<LeaveApprover>("/leave/approvers", {
    department,
    approverEmployeeId,
  });
  return res.data;
}

export async function fetchSmtpSenders(): Promise<SmtpSender[]> {
  const res = await apiClient.get<SmtpSender[]>("/leave/smtp-senders");
  return res.data;
}

export async function createSmtpSender(payload: {
  label: string;
  email: string;
  appPassword: string;
}): Promise<SmtpSender> {
  const res = await apiClient.post<SmtpSender>("/leave/smtp-senders", payload);
  return res.data;
}

export async function testSmtpSender(
  id: string,
): Promise<{ success: boolean; error?: string | null }> {
  const res = await apiClient.post<{ success: boolean; error?: string | null }>(
    `/leave/smtp-senders/${id}/test`,
  );
  return res.data;
}

export async function fetchNotificationSetting(): Promise<NotificationSetting | null> {
  const res = await apiClient.get<NotificationSetting | null>(
    "/leave/notification-setting",
  );
  return res.data;
}

export async function setNotificationSetting(
  smtpSenderId: string,
): Promise<NotificationSetting> {
  const res = await apiClient.put<NotificationSetting>(
    "/leave/notification-setting",
    { smtpSenderId },
  );
  return res.data;
}

export async function deleteSmtpSender(id: string): Promise<void> {
  await apiClient.delete(`/leave/smtp-senders/${id}`);
}
export interface EmployeeLeaveCredit {
  leaveTypeId: string;
  leaveTypeName: string;
  defaultCredits: number;
  overrideCredits?: number | null;
  effectiveCredits: number;
}

export async function fetchEmployeeLeaveCredits(
  employeeId: string,
): Promise<EmployeeLeaveCredit[]> {
  const res = await apiClient.get<EmployeeLeaveCredit[]>(
    `/leave/employees/${employeeId}/credits`,
  );
  return res.data;
}

export async function setEmployeeLeaveCredit(
  employeeId: string,
  leaveTypeId: string,
  credits: number | null,
): Promise<EmployeeLeaveCredit[]> {
  const res = await apiClient.put<EmployeeLeaveCredit[]>(
    `/leave/employees/${employeeId}/credits`,
    { leaveTypeId, credits },
  );
  return res.data;
}
