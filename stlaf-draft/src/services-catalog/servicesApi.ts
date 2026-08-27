import apiClient from "../common/api/apiClient";
import type { Service } from "../types/domain";

export async function fetchServices(): Promise<Service[]> {
  const response = await apiClient.get<Service[]>("/client-portal/services");
  return response.data;
}
