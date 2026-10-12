import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json, jsonMessage } from "@/server/lib/http";
import * as employeeService from "@/server/modules/employee/employee.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  return handleRoute(async () => {
    await requireAuth(request);
    const { id } = await params;
    const employee = await employeeService.getEmployeeById(id);
    return json(200, employee);
  });
}

export async function PATCH(request: Request, { params }: Params) {
  return handleRoute(async () => {
    await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const employee = await employeeService.updateEmployee(id, body);
    return json(200, employee);
  });
}

export async function PUT(request: Request, { params }: Params) {
  return PATCH(request, { params });
}

export async function DELETE(request: Request, { params }: Params) {
  return handleRoute(async () => {
    await requireAuth(request);
    const { id } = await params;
    await employeeService.deleteEmployee(id);
    return jsonMessage(200, "Employee deleted successfully.");
  });
}
