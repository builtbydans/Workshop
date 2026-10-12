export type JobUpdateKind = "WORKFLOW" | "BILLING";

export interface JobUpdateDto {
  id: string;
  job_id: string;
  message: string;
  note?: string | null;
  kind?: JobUpdateKind;
  created_at: string;
}
