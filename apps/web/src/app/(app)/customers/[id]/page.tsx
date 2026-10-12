import Link from "next/link";
import { ArrowLeft, Mail, Phone, UserRound } from "lucide-react";

import { getCustomerById } from "@/services/customer.service.server";
import { getVehiclesByCustomerId } from "@/services/vehicle.service.server";

import { CustomerVehiclesSection } from "@/components/customers/CustomerVehiclesSection";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const CustomerPage = async ({ params }: Props) => {
  const { id } = await params;

  const [customer, vehicles] = await Promise.all([
    getCustomerById(id),
    getVehiclesByCustomerId(id),
  ]);

  return (
    <main className="space-y-6 p-5">
      <Button asChild size="sm" variant="ghost">
        <Link href="/customers">
          <ArrowLeft data-icon="inline-start" />
          Back to customers
        </Link>
      </Button>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <UserRound className="size-5 text-muted-foreground" />
            {customer.first_name} {customer.last_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <a
            className="flex items-center gap-2 hover:underline"
            href={`mailto:${customer.email}`}
          >
            <Mail className="size-4 text-muted-foreground" />
            {customer.email}
          </a>
          <a
            className="flex items-center gap-2 hover:underline"
            href={`tel:${customer.phone}`}
          >
            <Phone className="size-4 text-muted-foreground" />
            {customer.phone}
          </a>
        </CardContent>
      </Card>

      <div className="max-w-4xl">
        <CustomerVehiclesSection customerId={id} vehicles={vehicles} />
      </div>
    </main>
  );
};

export default CustomerPage;
