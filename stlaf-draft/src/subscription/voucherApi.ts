import apiClient from "../common/api/apiClient";
import type { SubscriptionInfo } from "../types/domain";

export async function fetchMySubscription(): Promise<SubscriptionInfo> {
  const response = await apiClient.get<SubscriptionInfo>("/client-portal/subscriptions/mine");
  return response.data;
}

export interface RedeemResult {
  plan: "free" | "premium";
  expiresAt: string | null;
}

export async function redeemVoucher(code: string): Promise<RedeemResult> {
  const response = await apiClient.post<RedeemResult>("/client-portal/vouchers/redeem", { code });
  return response.data;
}
