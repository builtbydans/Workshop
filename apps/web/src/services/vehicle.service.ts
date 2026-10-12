import { apiFetch } from "@/lib/api";
import { createVehicleService } from "@/services/vehicle.api";

export const { getVehicles, createVehicle, getVehiclesByCustomerId } =
  createVehicleService(apiFetch);
