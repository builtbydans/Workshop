import { handleRoute, json, parseBody } from "@/server/lib/http";
import * as employeeService from "@/server/modules/employee/employee.service";
import { clockInSchema } from "@/server/schemas/workshop.schema";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await parseBody(request, clockInSchema);
    const session = await employeeService.clockIn(body.employeeId, body.pin);
    return json(200, session);
  });
}
