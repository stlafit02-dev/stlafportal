import apiClient from "../common/api/apiClient";

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>("/auth/change-password", payload);
  return res.data;
}