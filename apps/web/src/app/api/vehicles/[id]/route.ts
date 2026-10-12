import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json, parseBody } from "@/server/lib/http";
import * as vehicleService from "@/server/modules/vehicle/vehicle.service";
import { updateVehicleSchema } from "@/server/schemas/vehicle.schema";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  return handleRoute(async () => {
    await requireAuth(request);
    const { id } = await params;
    const body = await parseBody(request, updateVehicleSchema);
    const vehicle = await vehicleService.updateVehicleById(id, body);
    return json(200, vehicle);
  });
}

export async function DELETE(request: Request, { params }: Params) {
  return handleRoute(async () => {
    await requireAuth(request);
    const { id } = await params;
    const vehicle = await vehicleService.deleteVehicleById(id);
    return json(200, vehicle);
  });
}
