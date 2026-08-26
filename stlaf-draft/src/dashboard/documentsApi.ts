import apiClient from "../common/api/apiClient";
import type { MyDocument } from "../types/domain";

export async function fetchMyDocuments(): Promise<MyDocument[]> {
  const response = await apiClient.get<MyDocument[]>("/client-portal/documents/mine");
  return response.data;
}

export async function fetchDocumentForSubmission(submissionId: string): Promise<MyDocument | null> {
  try {
    const response = await apiClient.get<MyDocument>(`/client-portal/documents/by-submission/${submissionId}`);
    return response.data;
  } catch {
    return null;
  }
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function downloadDocument(downloadUrl: string): Promise<Blob> {
  const response = await fetch(downloadUrl);
  if (!response.ok) throw new Error("Download failed");
  return response.blob();
}
