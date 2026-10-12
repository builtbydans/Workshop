import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json } from "@/server/lib/http";
import * as vehicleService from "@/server/modules/vehicle/vehicle.service";

type Params = { params: Promise<{ customerId: string }> };

export async function GET(request: Request, { params }: Params) {
  return handleRoute(async () => {
    await requireAuth(request);
    const { customerId } = await params;
    const vehicles = await vehicleService.getVehiclesByCustomerId(customerId);
    return json(200, vehicles);
  });
}
