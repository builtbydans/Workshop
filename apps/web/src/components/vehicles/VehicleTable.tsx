import Link from "next/link";
import { ArrowRight, CarFront } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { VehicleData } from "@/types/vehicle.types";
import { formatRegistration } from "@/utils/formatRegistration";

interface VehicleTableProps {
  vehicles: VehicleData[];
}

export function VehicleTable({ vehicles }: VehicleTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Vehicle</TableHead>
            <TableHead>Registration</TableHead>
            <TableHead>Customer ID</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.length === 0 ? (
            <TableRow>
              <TableCell className="h-32 text-center" colSpan={4}>
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <CarFront className="size-8" />
                  <p>No vehicles found.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>
                  <p className="font-medium">
                    {vehicle.make} {vehicle.model}
                  </p>
                </TableCell>
                <TableCell>
                  <span className="inline-flex rounded-md border bg-yellow-300 dark:text-black px-3 py-1.5 font-mono text-sm font-bold tracking-wider">
                    {formatRegistration(vehicle.registration)}
                  </span>
                </TableCell>
                <TableCell>{vehicle.customer_id}</TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/customers/${vehicle.customer_id}`}>
                      View customer
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
