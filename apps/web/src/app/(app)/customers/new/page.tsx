import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CreateCustomerForm } from "@/components/customers/CreateCustomerForm";
import { Button } from "@/components/ui/button";

const CreateCustomerPage = () => {
  return (
    <main className="space-y-6 p-5">
      <Button asChild size="sm" variant="ghost">
        <Link href="/customers">
          <ArrowLeft data-icon="inline-start" />
          Back to customers
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create customer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new customer record to the garage.
        </p>
      </div>

      <CreateCustomerForm />
    </main>
  );
};

export default CreateCustomerPage;
