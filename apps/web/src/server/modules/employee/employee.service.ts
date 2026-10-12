import * as employeeRepository from "./employee.repository";
import * as auditRepository from "../audit/audit.repository";
import { AppError, ERROR_CODES } from "../../errors/AppError";

import {
  CreateEmployeeDto,
  EmployeeDto,
  EmployeeRecord,
  UpdateEmployeeDto,
  UpdateEmployeeRecordDto,
} from "../../types/employee.types";
import { hashPin, isValidPin, verifyPin } from "../../lib/pin";
import { createWorkshopToken } from "../../lib/workshop-token";
import type { ActorRole } from "../../constants/job-status";

const EMPLOYEE_ROLES = ["MANAGER", "TECHNICIAN", "ADMIN"] as const;

type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

const toEmployeeDto = (employee: EmployeeRecord): EmployeeDto => {
  const { pin_hash, ...rest } = employee;

  return {
    ...rest,
    has_pin: Boolean(pin_hash),
  };
};

const validateRole = (role: string) => {
  if (!EMPLOYEE_ROLES.includes(role as (typeof EMPLOYEE_ROLES)[number])) {
    throw new AppError("Invalid employee role.", 400);
  }
};

const requireValidPin = (pin?: string) => {
  if (!pin || !isValidPin(pin)) {
    throw new AppError("PIN must be a 5-digit code.", 400);
  }
};

const getEmployees = async (): Promise<EmployeeDto[]> => {
  const employees = await employeeRepository.getEmployees();

  return employees.map(toEmployeeDto);
};

const getEmployeeById = async (id: string): Promise<EmployeeDto> => {
  const employee = await employeeRepository.getEmployeeById(id);

  if (!employee) {
    throw new AppError("Employee not found.", 404);
  }

  return toEmployeeDto(employee);
};

const getRoleByUserId = async (
  userId: string,
): Promise<EmployeeRole | undefined> => {
  const employee = await employeeRepository.getEmployeeByUserId(userId);
  const role = employee?.role?.trim().toUpperCase();

  if (!role || !EMPLOYEE_ROLES.includes(role as EmployeeRole)) {
    return undefined;
  }

  return role as EmployeeRole;
};

const createEmployee = async (
  employeeData: CreateEmployeeDto,
): Promise<EmployeeDto> => {
  const firstName = employeeData.first_name.trim();
  const lastName = employeeData.last_name.trim();
  const role = employeeData.role.trim().toUpperCase();

  if (!firstName || !lastName) {
    throw new AppError("First name and last name are required.", 400);
  }

  validateRole(role);

  if (role === "TECHNICIAN") {
    requireValidPin(employeeData.pin);
  } else if (employeeData.pin) {
    requireValidPin(employeeData.pin);
  }

  const employee = await employeeRepository.createEmployee({
    first_name: firstName,
    last_name: lastName,
    role,
    pin_hash: employeeData.pin ? await hashPin(employeeData.pin) : null,
  });

  const employeeDto = toEmployeeDto(employee);

  await auditRepository.createAuditLog({
    entity_type: "employee",
    entity_id: employee.id,
    action: "CREATE",
    old_value: null,
    new_value: employeeDto,
  });

  return employeeDto;
};

const updateEmployee = async (
  id: string,
  updatedData: UpdateEmployeeDto,
): Promise<EmployeeDto> => {
  const existingEmployee = await employeeRepository.getEmployeeById(id);

  if (!existingEmployee) {
    throw new AppError("Employee not found.", 404);
  }

  const validatedData: UpdateEmployeeRecordDto = {};

  if (updatedData.first_name !== undefined) {
    const firstName = updatedData.first_name.trim();

    if (!firstName) {
      throw new AppError("First name cannot be empty.", 400);
    }

    validatedData.first_name = firstName;
  }

  if (updatedData.last_name !== undefined) {
    const lastName = updatedData.last_name.trim();

    if (!lastName) {
      throw new AppError("Last name cannot be empty.", 400);
    }

    validatedData.last_name = lastName;
  }

  if (updatedData.role !== undefined) {
    const role = updatedData.role.trim().toUpperCase();

    validateRole(role);

    validatedData.role = role;
  }

  if (updatedData.active !== undefined) {
    validatedData.active = updatedData.active;
  }

  if (updatedData.pin !== undefined) {
    requireValidPin(updatedData.pin);
    validatedData.pin_hash = await hashPin(updatedData.pin);
  }

  if (Object.keys(validatedData).length === 0) {
    throw new AppError("No valid employee update provided.", 400);
  }

  const updatedEmployee = await employeeRepository.updateEmployee(
    id,
    validatedData,
  );

  const oldEmployeeDto = toEmployeeDto(existingEmployee);
  const newEmployeeDto = toEmployeeDto(updatedEmployee);

  await auditRepository.createAuditLog({
    entity_type: "employee",
    entity_id: id,
    action: "UPDATE",
    old_value: oldEmployeeDto,
    new_value: newEmployeeDto,
  });

  return newEmployeeDto;
};

const getTechnicians = async () => {
  return await employeeRepository.getTechnicians();
};

const clockIn = async (employeeId: string, pin: string) => {
  requireValidPin(pin);

  const employee = await employeeRepository.getEmployeeById(employeeId);

  if (!employee || employee.role !== "TECHNICIAN") {
    throw new AppError("Invalid PIN.", 401, ERROR_CODES.UNAUTHORIZED);
  }

  const pinMatches = await verifyPin(pin, employee.pin_hash ?? null);

  if (!pinMatches) {
    throw new AppError("Invalid PIN.", 401, ERROR_CODES.UNAUTHORIZED);
  }

  return {
    token: createWorkshopToken(employee.id, employee.role as ActorRole),
    employee: toEmployeeDto(employee),
  };
};

const deleteEmployee = async (id: string): Promise<EmployeeDto> => {
  const existingEmployee = await employeeRepository.getEmployeeById(id);

  if (!existingEmployee) {
    throw new AppError("Employee not found.", 404);
  }

  const deletedEmployee = await employeeRepository.deleteEmployee(id);

  const oldEmployeeDto = toEmployeeDto(existingEmployee);
  const newEmployeeDto = toEmployeeDto(deletedEmployee);

  await auditRepository.createAuditLog({
    entity_type: "employee",
    entity_id: id,
    action: "DELETE",
    old_value: oldEmployeeDto,
    new_value: newEmployeeDto,
  });

  return newEmployeeDto;
};

export { getEmployees, getEmployeeById, getRoleByUserId, getTechnicians, clockIn, createEmployee, updateEmployee, deleteEmployee };
