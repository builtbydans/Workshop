import type { ApiFetch } from "@/lib/api-types";
import type { CreateVehicleDto, VehicleData } from "@/types/vehicle.types";

export function createVehicleService(apiFetch: ApiFetch) {
  const getVehicles = () =>
    apiFetch<VehicleData[]>("/vehicles", {
      method: "GET",
      cache: "no-store",
    });

  const createVehicle = (vehicleData: CreateVehicleDto) =>
    apiFetch<VehicleData>("/vehicles", {
      method: "POST",
      body: JSON.stringify(vehicleData),
    });

  const getVehiclesByCustomerId = (customerId: string) =>
    apiFetch<VehicleData[]>(`/vehicles/customer/${customerId}`, {
      method: "GET",
      cache: "no-store",
    });

  return {
    getVehicles,
    createVehicle,
    getVehiclesByCustomerId,
  };
}
