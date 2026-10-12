import type { ApiFetch } from "@/lib/api-types";
import type {
  CreateEmployeeDto,
  EmployeeDto,
  UpdateEmployeeDto,
} from "@/types/employee.types";

export function createEmployeeService(apiFetch: ApiFetch) {
  const createEmployee = (employeeData: CreateEmployeeDto) =>
    apiFetch<EmployeeDto>("/employees", {
      method: "POST",
      body: JSON.stringify(employeeData),
    });

  const getEmployees = () =>
    apiFetch<EmployeeDto[]>("/employees", {
      method: "GET",
      cache: "no-store",
    });

  const getEmployeeById = (id: string) =>
    apiFetch<EmployeeDto>(`/employees/${id}`, {
      method: "GET",
      cache: "no-store",
    });

  const editEmployeeById = (id: string, employeeData: UpdateEmployeeDto) =>
    apiFetch<EmployeeDto>(`/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(employeeData),
    });

  const deleteEmployeeById = (id: string) =>
    apiFetch<EmployeeDto>(`/employees/${id}`, {
      method: "DELETE",
    });

  return {
    createEmployee,
    getEmployees,
    getEmployeeById,
    editEmployeeById,
    deleteEmployeeById,
  };
}
