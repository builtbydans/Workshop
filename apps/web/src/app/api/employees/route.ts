import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json } from "@/server/lib/http";
import * as employeeService from "@/server/modules/employee/employee.service";

export async function GET(request: Request) {
  return handleRoute(async () => {
    await requireAuth(request);
    const employees = await employeeService.getEmployees();
    return json(200, employees);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    await requireAuth(request);
    const body = await request.json();
    const employee = await employeeService.createEmployee(body);
    return json(201, employee);
  });
}
