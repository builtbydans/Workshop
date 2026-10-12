import "server-only";

import { requireServerAuth } from "@/lib/server-auth";
import * as employeeService from "@/server/modules/employee/employee.service";
import type {
  CreateEmployeeDto,
  EmployeeDto,
  UpdateEmployeeDto,
} from "@/types/employee.types";

export async function getEmployees(): Promise<EmployeeDto[]> {
  await requireServerAuth();
  return employeeService.getEmployees() as Promise<EmployeeDto[]>;
}

export async function getEmployeeById(id: string): Promise<EmployeeDto> {
  await requireServerAuth();
  return employeeService.getEmployeeById(id) as Promise<EmployeeDto>;
}

export async function createEmployee(employeeData: CreateEmployeeDto) {
  await requireServerAuth();
  return employeeService.createEmployee(employeeData);
}

export async function editEmployeeById(
  id: string,
  employeeData: UpdateEmployeeDto,
) {
  await requireServerAuth();
  return employeeService.updateEmployee(id, employeeData);
}

export async function deleteEmployeeById(id: string) {
  await requireServerAuth();
  return employeeService.deleteEmployee(id);
}
