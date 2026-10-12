import { JobStatus } from "@/constants/job-status";
import type { DashboardRaiseDto } from "./job-raise.types";

export type { DashboardRaiseDto };

export interface WorkshopDashboardDto {
  customers: number;
  vehicles: number;
  jobs: number;
  leads: number;
  invoices: number;
  jobsToday: number;
  revenueToday: number;
  vehiclesInWorkshop: number;
  readyForCollection: number;
  jobsByStatus: Record<JobStatus, number>;
  todaysJobs: DashboardJobDto[];
  recentActivity: DashboardActivityDto[];
  openRaises: DashboardRaiseDto[];
  openRaiseCount: number;
}

export interface DashboardJobDto {
  id: string;
  job_number: string;
  status: JobStatus;
  job_type: string | null;
  vehicles: {
    registration: string;
    make: string;
    model: string;
    customers: {
      first_name: string;
      last_name: string;
    };
  };
}

export interface DashboardActivityDto {
  id: string;
  message: string;
  created_at: string;
  job_number: string | null;
}
