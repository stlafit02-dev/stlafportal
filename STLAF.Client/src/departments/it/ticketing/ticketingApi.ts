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
