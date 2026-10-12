import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import CreateEmployeeForm from "@/components/employees/CreateEmployeeForm";
import { Button } from "@/components/ui/button";

const CreateEmployeePage = () => {
  return (
    <main className="space-y-6 p-5">
      <Button asChild size="sm" variant="ghost">
        <Link href="/employees">
          <ArrowLeft data-icon="inline-start" />
          Back to employees
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create employee
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new member of staff to the garage.
        </p>
      </div>

      <CreateEmployeeForm />
    </main>
  );
};

export default CreateEmployeePage;
