import { JobUpdateDto } from "./job-update.types";
import { JobRaiseDto } from "./job-raise.types";
import { JobCostSummaryDto, WorkItemDto } from "./work-item.types";
import type { InvoiceDto } from "./invoice.types";
import { JobStatus } from "@/constants/job-status";

export interface JobActionDto {
  targetStatus: JobStatus;
  requiresReason: boolean;
  isOverride?: boolean;
}

export interface AssignedTechnicianDto {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface CreateJobDto {
  vehicle_id: string;
  job_type: string;
  description?: string;
  estimated_cost?: number;
}
export interface UpdateJobDto {
  vehicle_id?: string;
  job_type?: string;
  description?: string;
  status?: JobStatus;
  estimated_cost?: number;
  actual_cost?: number;
}

export interface JobSummaryDto {
  id: string;
  job_number: string;
  status: JobStatus;
  created_at: string;
  quoted_cost: string | number | null;
  actual_cost: string | number | null;
  description: string | null;
  job_type: string | null;
  updated_at: string;
  updates: JobUpdateDto[];
  allowedActions?: JobActionDto[];
  assigned_technician_id?: string | null;
  assigned_technician?: AssignedTechnicianDto | null;
  openRaise?: JobRaiseDto | null;
  canRaiseToManager?: boolean;
  workItems?: WorkItemDto[];
  costs?: JobCostSummaryDto;
  invoice?: InvoiceDto | null;
  invoiceConfirmed?: boolean;
  invoicePaid?: boolean;
  canGenerateInvoice?: boolean;
  canConfirmInvoice?: boolean;

  vehicles: {
    registration: string;
    make: string;
    model: string;

    customers: {
      first_name: string;
      last_name: string;
      phone: string;
      email: string;
    };
  };
}
