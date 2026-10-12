export interface EmployeeDto {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  role: string;
  active: boolean;
  has_pin: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type EmployeeRecord = Omit<EmployeeDto, "has_pin"> & {
  pin_hash?: string | null;
};

export interface CreateEmployeeDto {
  first_name: string;
  last_name: string;
  role: string;
  pin?: string;
}

export interface CreateEmployeeRecordDto {
  first_name: string;
  last_name: string;
  role: string;
  pin_hash?: string | null;
}

export interface UpdateEmployeeDto {
  first_name?: string;
  last_name?: string;
  role?: string;
  active?: boolean;
  pin?: string;
}

export interface UpdateEmployeeRecordDto {
  first_name?: string;
  last_name?: string;
  role?: string;
  active?: boolean;
  pin_hash?: string | null;
}

export interface WorkshopTechnicianDto {
  id: string;
  first_name: string;
  last_name: string;
}
