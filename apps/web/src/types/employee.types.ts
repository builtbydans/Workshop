export const EMPLOYEE_ROLES = ["MANAGER", "TECHNICIAN", "ADMIN"] as const;

export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

export interface EmployeeDto {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  role: EmployeeRole;
  active: boolean;
  has_pin?: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateEmployeeDto {
  first_name: string;
  last_name: string;
  role: EmployeeRole;
  pin?: string;
}

export interface UpdateEmployeeDto {
  first_name?: string;
  last_name?: string;
  role?: EmployeeRole;
  active?: boolean;
  pin?: string;
}

export interface WorkshopTechnicianDto {
  id: string;
  first_name: string;
  last_name: string;
}
