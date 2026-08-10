import apiClient from "../common/api/apiClient";

export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  department: string;
  role: string;
  officePosition?: string | null;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: UserInfo;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return response.data;
}
