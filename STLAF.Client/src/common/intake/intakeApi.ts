import apiClient from "../api/apiClient";

export interface IntakeSubmissionSummary {
  id: string;
  trackingNumber: string;
  clientName: string;
  clientType: string;
  contactPerson: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status: string;
  createdAt: string;
  consultationDate: string;
  consultationPreference: string;
  matchedServices: string[];
  categories: string[];
}

export async function fetchMyInquiries(): Promise<IntakeSubmissionSummary[]> {
  const res = await apiClient.get<IntakeSubmissionSummary[]>(
    "/intake/my-submissions",
  );
  return res.data;
}
export async function fetchAmIPointPerson(): Promise<boolean> {
  const res = await apiClient.get<boolean>("/intake/am-i-point-person");
  return res.data;
}
