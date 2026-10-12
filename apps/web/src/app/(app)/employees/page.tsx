import Link from "next/link";
import { Plus, UsersRound } from "lucide-react";

import { getEmployees } from "@/services/employee.service.server";
import EmployeesTable from "@/components/employees/EmployeesTable";
import { Button } from "@/components/ui/button";

const EmployeesPage = async () => {
  const employees = await getEmployees();

  return (
    <main className="space-y-6 py-6 px-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <UsersRound className="size-6" />
            <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage workshop staff profiles, roles, and access.
          </p>
        </div>

        <Button asChild>
          <Link href="/employees/new">
            <Plus data-icon="inline-start" />
            Create employee
          </Link>
        </Button>
      </div>

      <EmployeesTable employees={employees} />
    </main>
  );
};

export default EmployeesPage;
