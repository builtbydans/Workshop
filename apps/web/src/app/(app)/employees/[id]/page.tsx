import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getEmployeeById } from "@/services/employee.service.server";
import EmployeeDetailsCard from "@/components/employees/EmployeeDetailsCard";
import { Button } from "@/components/ui/button";

interface EmployeePageProps {
  params: Promise<{ id: string }>;
}

const EmployeePage = async ({ params }: EmployeePageProps) => {
  const { id } = await params;
  const employee = await getEmployeeById(id);

  return (
    <main className="space-y-6 p-5">
      <Button asChild size="sm" variant="ghost">
        <Link href="/employees">
          <ArrowLeft data-icon="inline-start" />
          Back to employees
        </Link>
      </Button>

      <EmployeeDetailsCard employee={employee} />
    </main>
  );
};

export default EmployeePage;
