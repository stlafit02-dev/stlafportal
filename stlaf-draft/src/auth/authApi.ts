import apiClient from "../common/api/apiClient";

export interface ClientInfo {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  client: ClientInfo;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/client-portal/auth/login", { email, password });
  return response.data;
}

export async function signup(email: string, password: string, fullName: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/client-portal/auth/signup", { email, password, fullName });
  return response.data;
}
