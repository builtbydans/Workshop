import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";

import EmployeeRoleBadge from "@/components/employees/EmployeeRoleBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeDto } from "@/types/employee.types";
import { formatRelativeDate } from "@/utils/date";

interface EmployeesTableProps {
  employees: EmployeeDto[];
}

const EmployeesTable = ({ employees }: EmployeesTableProps) => {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Employee</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell className="h-32 text-center" colSpan={5}>
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <UserRound className="size-8" />
                  <p>No employees found.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <p className="font-medium">
                    {employee.first_name} {employee.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {employee.id}
                  </p>
                </TableCell>
                <TableCell>
                  <EmployeeRoleBadge role={employee.role} />
                </TableCell>
                <TableCell>
                  <Badge
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                    variant="outline"
                  >
                    Active
                  </Badge>
                </TableCell>
                <TableCell>
                  <span suppressHydrationWarning>
                    {formatRelativeDate(employee.created_at)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/employees/${employee.id}`}>
                      View
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
};

export default EmployeesTable;
