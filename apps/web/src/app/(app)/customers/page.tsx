import Link from "next/link";
import { Plus, UsersRound } from "lucide-react";

import { getCustomers } from "@/services/customer.service.server";

import { CustomerTable } from "@/components/customers/CustomerTable";
import { Button } from "@/components/ui/button";

const CustomersPage = async () => {
  const customers = await getCustomers();

  return (
    <main className="space-y-6 py-6 px-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <UsersRound className="size-6" />
            <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage customer records and view their garage activity.
          </p>
        </div>

        <Button asChild>
          <Link href="/customers/new">
            <Plus data-icon="inline-start" />
            New customer
          </Link>
        </Button>
      </div>
      <CustomerTable customers={customers} />
    </main>
  );
};

export default CustomersPage;
