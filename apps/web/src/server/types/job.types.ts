import { ActorRole, JobAction, JobStatus } from "../constants/job-status";

export interface AssignedTechnicianDto {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface CreateJobDto {
  vehicle_id: string;
  job_type?: string;
  description?: string;
}

export interface UpdateJobDto {
  vehicle_id?: string;
  job_type?: string;
  description?: string;
  status?: JobStatus;

  quoted_cost?: number;
  deposit_amount?: number;
  deposit_received_at?: string;
}

export interface TransitionJobDto {
  targetStatus: JobStatus;
  note?: string;
  actorId?: string;
  actorRole?: ActorRole;
  actorEmployeeId?: string;
}

export interface AssignTechnicianDto {
  technicianId: string | null;
}

export type { JobAction };
