export type SubscriptionPlan = "free" | "premium";
export type SubscriptionStatus = "active" | "expired";
export type SubmissionStatus = "draft" | "submitted" | "processing" | "completed" | "failed";

export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Submission {
  id: string;
  serviceId: string;
  formSchemaVersion: number;
  responses: Record<string, unknown>;
  status: SubmissionStatus;
  createdAt: string;
}

export interface MyDocument {
  id: string;
  submissionId: string;
  serviceId: string;
  downloadUrl: string;
  generatedAt: string;
}

export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  expiresAt: string | null;
}
