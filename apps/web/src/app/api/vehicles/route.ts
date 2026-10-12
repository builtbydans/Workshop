import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json, parseBody } from "@/server/lib/http";
import * as vehicleService from "@/server/modules/vehicle/vehicle.service";
import { createVehicleSchema } from "@/server/schemas/vehicle.schema";

export async function GET(request: Request) {
  return handleRoute(async () => {
    await requireAuth(request);
    const vehicles = await vehicleService.getVehicles();
    return json(200, vehicles);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    await requireAuth(request);
    const body = await parseBody(request, createVehicleSchema);
    const vehicle = await vehicleService.createVehicle(body);
    return json(201, vehicle);
  });
}
