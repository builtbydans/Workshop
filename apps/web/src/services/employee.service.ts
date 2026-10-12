import { apiFetch } from "@/lib/api";
import { createEmployeeService } from "@/services/employee.api";

export const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  editEmployeeById,
  deleteEmployeeById,
} = createEmployeeService(apiFetch);
