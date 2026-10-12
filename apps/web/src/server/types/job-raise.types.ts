export const RAISE_STATUS = {
  OPEN: "OPEN",
  ACKNOWLEDGED: "ACKNOWLEDGED",
  RESOLVED: "RESOLVED",
} as const;

export type RaiseStatus = (typeof RAISE_STATUS)[keyof typeof RAISE_STATUS];

export interface RaiseEmployeeDto {
  id: string;
  first_name: string;
  last_name: string;
}

export interface JobRaiseNoteDto {
  id: string;
  body: string;
  created_at: string;
  employee: RaiseEmployeeDto;
}

export interface JobRaiseDto {
  id: string;
  job_id: string;
  status: RaiseStatus;
  created_at: string;
  updated_at: string;
  acknowledged_at?: string | null;
  resolved_at?: string | null;
  raised_by: RaiseEmployeeDto;
  notes: JobRaiseNoteDto[];
}

export interface DashboardRaiseDto {
  id: string;
  job_id: string;
  job_number: string;
  job_status: string;
  created_at: string;
  updated_at: string;
  latest_note: string;
  raised_by: RaiseEmployeeDto;
  vehicles: {
    registration: string;
    make: string;
    model: string;
  } | null;
}
