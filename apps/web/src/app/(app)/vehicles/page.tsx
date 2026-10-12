import { CarFront } from "lucide-react";

import { getVehicles } from "@/services/vehicle.service.server";

import { VehicleTable } from "@/components/vehicles/VehicleTable";

const VehiclesPage = async () => {
  const vehicles = await getVehicles();

  return (
    <main className="space-y-6 py-6 px-12">
      <div>
        <div className="flex items-center gap-2">
          <CarFront className="size-6" />
          <h1 className="text-2xl font-semibold tracking-tight">Vehicles</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage registered vehicles and open their linked customer records.
        </p>
      </div>

      <VehicleTable vehicles={vehicles} />
    </main>
  );
};

export default VehiclesPage;
