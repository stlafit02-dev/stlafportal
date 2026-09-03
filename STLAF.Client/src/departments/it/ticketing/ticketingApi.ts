import apiClient from "../../../common/api/apiClient";

export interface Ticket {
  id: string;
  ticketNumber: string;
  name: string;
  companyEmail: string;
  viberNumber?: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  department: string;
  assignedToId?: string | null;
  assignedToName?: string | null;
  dateSubmitted: string;
  updatedDate: string;
  remarks?: string | null;
}

export interface TicketSummary {
  open: number;
  inProgress: number;
  onHold: number;
  resolved: number;
  closed: number;
}

export interface CreateTicketPayload {
  name: string;
  companyEmail: string;
  viberNumber?: string;
  description: string;
  category: string;
  priority: string;
  department: string;
}

export interface ItStaff {
  id: string;
  fullName: string;
}

// ---------- Public endpoints (no auth) ----------

export async function fetchQueue(): Promise<Ticket[]> {
  const res = await apiClient.get<Ticket[]>("/it/tickets/queue");
  return res.data;
}

export async function fetchSummary(): Promise<TicketSummary> {
  const res = await apiClient.get<TicketSummary>("/it/tickets/summary");
  return res.data;
}

export async function createTicket(
  payload: CreateTicketPayload,
): Promise<Ticket> {
  const res = await apiClient.post<Ticket>("/it/tickets", payload);
  return res.data;
}

// ---------- Authenticated (IT staff) endpoints ----------

export async function fetchAllTickets(): Promise<Ticket[]> {
  const res = await apiClient.get<Ticket[]>("/it/tickets");
  return res.data;
}

export async function fetchItStaff(): Promise<ItStaff[]> {
  const res = await apiClient.get<ItStaff[]>("/it/tickets/staff");
  return res.data;
}

export async function updateTicketStatus(
  id: string,
  status: string,
): Promise<Ticket> {
  const res = await apiClient.patch<Ticket>(`/it/tickets/${id}/status`, {
    status,
  });
  return res.data;
}

export async function addTicketRemark(id: string, remarks: string): Promise<Ticket> {
  const res = await apiClient.patch<Ticket>(`/it/tickets/${id}/remarks`, { remarks });
  return res.data;
}

export async function assignTicket(
  id: string,
  assignedToId: string | null,
): Promise<Ticket> {
  const res = await apiClient.patch<Ticket>(`/it/tickets/${id}/assign`, {
    assignedToId,
  });
  return res.data;
}
export async function deleteTicket(id: string): Promise<void> {
  await apiClient.delete(`/it/tickets/${id}`);
}

export async function exportTickets(filter: {
  status?: string;
  search?: string;
  month?: string;
}): Promise<void> {
  const params = new URLSearchParams();
  if (filter.status && filter.status !== "All") params.append("status", filter.status);
  if (filter.search) params.append("search", filter.search);
  if (filter.month) params.append("month", filter.month);

  const res = await apiClient.get(`/it/tickets/export?${params.toString()}`, {
    responseType: "blob",
  });

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filter.month
    ? `Tickets-Export-${filter.month}.xlsx`
    : `Tickets-Export-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
export interface EmployeeTicketProfile {
  fullName: string;
  companyEmail: string;
  viberNumber?: string | null;
  department: string;
}

export interface CreatePortalTicketPayload {
  category: string;
  priority: string;
  description: string;
}

export async function fetchMyTicketProfile(): Promise<EmployeeTicketProfile> {
  const res = await apiClient.get<EmployeeTicketProfile>(
    "/it/tickets/my-profile",
  );
  return res.data;
}

export async function fetchMyTickets(): Promise<Ticket[]> {
  const res = await apiClient.get<Ticket[]>("/it/tickets/my");
  return res.data;
}

export async function createMyTicket(
  payload: CreatePortalTicketPayload,
): Promise<Ticket> {
  const res = await apiClient.post<Ticket>("/it/tickets/my", payload);
  return res.data;
}
