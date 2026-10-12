import { Badge } from "@/components/ui/badge";
import { EmployeeRole } from "@/types/employee.types";

interface EmployeeRoleBadgeProps {
  role: EmployeeRole;
}

const roleLabels: Record<EmployeeRole, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  TECHNICIAN: "Technician",
};

const EmployeeRoleBadge = ({ role }: EmployeeRoleBadgeProps) => {
  return <Badge variant="secondary">{roleLabels[role]}</Badge>;
};

export default EmployeeRoleBadge;
