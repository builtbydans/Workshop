import { handleRoute, json } from "@/server/lib/http";
import * as employeeService from "@/server/modules/employee/employee.service";

export async function GET() {
  return handleRoute(async () => {
    const technicians = await employeeService.getTechnicians();
    return json(200, technicians);
  });
}
