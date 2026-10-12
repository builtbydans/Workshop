import * as jobUpdateRepository from "./job-update.repository";

import { JobStatus, JOB_STATUS_MESSAGES } from "../../../constants/job-status";
import type { JobUpdateDto, JobUpdateKind } from "../../../types/job-update.types";

const BILLING_MESSAGES = new Set([
  "Invoice sent",
  "Invoice paid",
  "Invoice voided",
]);

const toJobUpdateDto = (update: any): JobUpdateDto => ({
  id: update.id,
  job_id: update.job_id,
  message: update.message,
  note: update.note ?? null,
  kind: (BILLING_MESSAGES.has(update.message)
    ? "BILLING"
    : "WORKFLOW") as JobUpdateKind,
  created_at: update.created_at,
});

const createWorkflowUpdate = async (
  jobId: string,
  status: JobStatus,
  note?: string,
) => {
  return toJobUpdateDto(
    await jobUpdateRepository.createJobUpdate({
      job_id: jobId,
      message: JOB_STATUS_MESSAGES[status],
      note: note?.trim() || null,
    }),
  );
};

const createBillingUpdate = async (
  jobId: string,
  message: "Invoice sent" | "Invoice paid" | "Invoice voided",
  note?: string,
) => {
  return toJobUpdateDto(
    await jobUpdateRepository.createJobUpdate({
      job_id: jobId,
      message,
      note: note?.trim() || null,
    }),
  );
};

const getJobUpdatesByJobId = async (jobId: string) => {
  const updates = await jobUpdateRepository.getJobUpdatesByJobId(jobId);
  return (updates ?? []).map(toJobUpdateDto);
};

export { createWorkflowUpdate, createBillingUpdate, getJobUpdatesByJobId };
