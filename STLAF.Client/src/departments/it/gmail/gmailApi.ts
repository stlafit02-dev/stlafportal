import apiClient from "../../../common/api/apiClient";

export interface GwsAccount {
  id: string;
  name: string;
  maxCapacity: number;
  activeCount: number;
  inactiveCount: number;
  createdAt: string;
}

export interface CreateGwsAccountPayload {
  name: string;
  maxCapacity: number;
}

export async function updateGwsAccount(
  id: string,
  payload: CreateGwsAccountPayload,
): Promise<GwsAccount> {
  const res = await apiClient.put<GwsAccount>(
    `/it/gmail/accounts/${id}`,
    payload,
  );
  return res.data;
}

export interface EmailAccount {
  id: string;
  fullName: string;
  localGmail: string;
  password: string;
  stlafEmail: string;
  oldUser?: string | null;
  oldStlafEmail?: string | null;
  status: string;
  gwsAccountId: string;
  gwsAccountName: string;
  remarks?: string | null;
  recycled: boolean;
  createdAt: string;
}

export interface UpdateEmailAccountPayload {
  fullName: string;
  oldUser?: string;
  password: string;
  status: string;
  remarks?: string;
}

export interface RecycleEmailAccountPayload {
  newFullName: string;
  newStlafEmail: string;
}

export interface CreateEmailAccountPayload {
  fullName: string;
  oldUser?: string;
  localGmail: string;
  stlafEmail: string;
  password: string;
  status: string;
  gwsAccountId: string;
  remarks?: string;
}

export interface AppPasswordEntry {
  id: string;
  gwsAccountId: string;
  gwsAccountName: string;
  appPasswordValue: string;
  month: number;
  year: number;
  notes?: string | null;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface CreateAppPasswordPayload {
  gwsAccountId: string;
  appPasswordValue: string;
  month: number;
  year: number;
  notes?: string;
}

export async function fetchGwsAccounts(): Promise<GwsAccount[]> {
  const res = await apiClient.get<GwsAccount[]>("/it/gmail/accounts");
  return res.data;
}

export async function createGwsAccount(
  payload: CreateGwsAccountPayload,
): Promise<GwsAccount> {
  const res = await apiClient.post<GwsAccount>("/it/gmail/accounts", payload);
  return res.data;
}

export async function fetchEmailAccounts(): Promise<EmailAccount[]> {
  const res = await apiClient.get<EmailAccount[]>("/it/gmail/emails");
  return res.data;
}

export async function createEmailAccount(
  payload: CreateEmailAccountPayload,
): Promise<EmailAccount> {
  const res = await apiClient.post<EmailAccount>("/it/gmail/emails", payload);
  return res.data;
}

export async function updateEmailAccount(
  id: string,
  payload: UpdateEmailAccountPayload,
): Promise<EmailAccount> {
  const res = await apiClient.put<EmailAccount>(
    `/it/gmail/emails/${id}`,
    payload,
  );
  return res.data;
}

export async function recycleEmailAccount(
  id: string,
  payload: RecycleEmailAccountPayload,
): Promise<EmailAccount> {
  const res = await apiClient.post<EmailAccount>(
    `/it/gmail/emails/${id}/recycle`,
    payload,
  );
  return res.data;
}

export async function deleteEmailAccount(id: string): Promise<void> {
  await apiClient.delete(`/it/gmail/emails/${id}`);
}

export async function fetchAppPasswords(): Promise<AppPasswordEntry[]> {
  const res = await apiClient.get<AppPasswordEntry[]>(
    "/it/gmail/app-passwords",
  );
  return res.data;
}

export async function createAppPassword(
  payload: CreateAppPasswordPayload,
): Promise<AppPasswordEntry> {
  const res = await apiClient.post<AppPasswordEntry>(
    "/it/gmail/app-passwords",
    payload,
  );
  return res.data;
}
