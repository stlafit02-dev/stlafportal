import apiClient from "../common/api/apiClient";
import type { FormSchema, FormValues } from "../types/formSchema";
import type { Submission } from "../types/domain";

export async function fetchLatestFormSchema(serviceId: string): Promise<FormSchema | null> {
  try {
    const response = await apiClient.get<FormSchema>(`/client-portal/form-schemas/${serviceId}/latest`);
    return response.data;
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

function isNotFound(err: unknown): boolean {
  return typeof err === "object" && err !== null && "response" in err
    && (err as { response?: { status?: number } }).response?.status === 404;
}

export async function createSubmission(
  serviceId: string,
  formSchemaVersion: number,
  responses: FormValues,
): Promise<Submission> {
  const response = await apiClient.post<Submission>("/client-portal/submissions", {
    serviceId,
    formSchemaVersion,
    responses,
  });
  return response.data;
}

export async function fetchMySubmissions(): Promise<Submission[]> {
  const response = await apiClient.get<Submission[]>("/client-portal/submissions/mine");
  return response.data;
}

export async function fetchSubmission(submissionId: string): Promise<Submission> {
  const response = await apiClient.get<Submission>(`/client-portal/submissions/${submissionId}`);
  return response.data;
}

export async function retryGeneration(submissionId: string): Promise<void> {
  await apiClient.post(`/client-portal/submissions/${submissionId}/retry`);
}
