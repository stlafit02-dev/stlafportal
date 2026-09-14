import apiClient from "../../../common/api/apiClient";

export interface InternAccount {
  id: string;
  companyId: string;
  email: string;
  status: string;
  createdAt: string;
}

export interface CreateInternPayload {
  email: string;
  password: string;
}

export interface UpdateInternPayload {
  email: string;
  password?: string;
  status: string;
}

export interface ModuleCatalogEntry {
  key: string;
  label: string;
}

export async function fetchInterns(): Promise<InternAccount[]> {
  const res = await apiClient.get<InternAccount[]>("/it/interns");
  return res.data;
}

export async function createIntern(
  payload: CreateInternPayload,
): Promise<InternAccount> {
  const res = await apiClient.post<InternAccount>("/it/interns", payload);
  return res.data;
}

export async function updateIntern(
  id: string,
  payload: UpdateInternPayload,
): Promise<InternAccount> {
  const res = await apiClient.put<InternAccount>(`/it/interns/${id}`, payload);
  return res.data;
}

export async function fetchModuleCatalog(): Promise<ModuleCatalogEntry[]> {
  const res = await apiClient.get<ModuleCatalogEntry[]>("/module-access/catalog");
  return res.data;
}

export async function fetchInternModules(internId: string): Promise<string[]> {
  const res = await apiClient.get<string[]>(`/it/interns/${internId}/modules`);
  return res.data;
}

export async function setInternModules(
  internId: string,
  modules: string[],
): Promise<void> {
  await apiClient.put(`/it/interns/${internId}/modules`, { modules });
}
