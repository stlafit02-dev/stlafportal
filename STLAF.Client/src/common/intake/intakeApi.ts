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
export async function downloadProposal(submissionId: string, trackingNumber: string): Promise<void> {
  const res = await apiClient.get(`/intake/submissions/${submissionId}/proposal`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Proposal-${trackingNumber}.docx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
