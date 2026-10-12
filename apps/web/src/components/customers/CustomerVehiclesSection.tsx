"use client";

import { useState } from "react";
import { CarFront, Plus } from "lucide-react";

import { VehicleData } from "@/types/vehicle.types";

import { Button } from "@/components/ui/button";
import { CreateVehicleForm } from "@/components/vehicles/CreateVehicleForm";

type CustomerVehiclesSectionProps = {
  customerId: string;
  vehicles: VehicleData[];
};

export const CustomerVehiclesSection = ({
  customerId,
  vehicles,
}: CustomerVehiclesSectionProps) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <section>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CarFront className="size-5" />
          <h2 className="text-xl font-semibold">Vehicles</h2>
        </div>

        <Button variant="outline" onClick={() => setShowForm(!showForm)}>
          {!showForm && <Plus data-icon="inline-start" />}
          {showForm ? "Cancel" : "Add Vehicle"}
        </Button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-lg border p-4">
          <CreateVehicleForm customerId={customerId} />
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="mt-4 flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border text-muted-foreground">
          <CarFront className="size-8" />
          <p>No vehicles found.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="rounded-xl border p-4">
              <div className="font-mono font-semibold tracking-wider">
                {vehicle.registration}
              </div>

              <div className="mt-1 text-sm text-muted-foreground">
                {vehicle.make} {vehicle.model}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
