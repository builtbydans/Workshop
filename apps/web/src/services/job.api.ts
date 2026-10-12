import type { ApiFetch } from "@/lib/api-types";
import type { JobStatus } from "@/constants/job-status";
import type { JobSummaryDto } from "@/types/job.types";

export function createJobService(apiFetch: ApiFetch) {
  const getJobs = () =>
    apiFetch<JobSummaryDto[]>("/jobs", {
      method: "GET",
      cache: "no-store",
    });

  const getJobById = (id: string) =>
    apiFetch<JobSummaryDto>(`/jobs/${id}`, {
      method: "GET",
      cache: "no-store",
    });

  const transitionJob = (id: string, targetStatus: JobStatus, note?: string) =>
    apiFetch<JobSummaryDto>(`/jobs/${id}/transitions`, {
      method: "POST",
      body: JSON.stringify({
        targetStatus,
        ...(note ? { note } : {}),
      }),
    });

  const assignTechnician = (id: string, technicianId: string | null) =>
    apiFetch<JobSummaryDto>(`/jobs/${id}/assignment`, {
      method: "PATCH",
      body: JSON.stringify({ technicianId }),
    });

  const raiseToManager = (id: string, note: string) =>
    apiFetch<JobSummaryDto>(`/jobs/${id}/raises`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });

  const acknowledgeRaise = (jobId: string, raiseId: string) =>
    apiFetch<JobSummaryDto>(`/jobs/${jobId}/raises/${raiseId}/acknowledge`, {
      method: "POST",
    });

  const resolveRaise = (jobId: string, raiseId: string) =>
    apiFetch<JobSummaryDto>(`/jobs/${jobId}/raises/${raiseId}/resolve`, {
      method: "POST",
    });

  const createWorkItem = (
    jobId: string,
    item: {
      kind: string;
      origin?: string;
      description: string;
      quantity: number;
      unit_cost?: number;
      unit_price: number;
    },
  ) =>
    apiFetch<JobSummaryDto>(`/jobs/${jobId}/work-items`, {
      method: "POST",
      body: JSON.stringify(item),
    });

  const deleteWorkItem = (jobId: string, itemId: string) =>
    apiFetch<JobSummaryDto>(`/jobs/${jobId}/work-items/${itemId}`, {
      method: "DELETE",
    });

  return {
    getJobs,
    getJobById,
    transitionJob,
    assignTechnician,
    raiseToManager,
    acknowledgeRaise,
    resolveRaise,
    createWorkItem,
    deleteWorkItem,
  };
}
