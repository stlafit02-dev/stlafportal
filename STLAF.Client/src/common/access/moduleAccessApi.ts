import apiClient from "../api/apiClient";

export interface ModuleAccessPosition {
  module: string;
  officePosition: string;
}

export async function fetchModuleAccessPositions(): Promise<ModuleAccessPosition[]> {
  const res = await apiClient.get<ModuleAccessPosition[]>("/module-access");
  return res.data;
}