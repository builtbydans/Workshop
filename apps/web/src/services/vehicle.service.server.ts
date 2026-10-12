import "server-only";

import { requireServerAuth } from "@/lib/server-auth";
import * as vehicleService from "@/server/modules/vehicle/vehicle.service";
import type { CreateVehicleDto } from "@/types/vehicle.types";

export async function getVehicles() {
  await requireServerAuth();
  return vehicleService.getVehicles();
}

export async function getVehiclesByCustomerId(customerId: string) {
  await requireServerAuth();
  return vehicleService.getVehiclesByCustomerId(customerId);
}

export async function createVehicle(vehicleData: CreateVehicleDto) {
  await requireServerAuth();
  return vehicleService.createVehicle(vehicleData);
}
