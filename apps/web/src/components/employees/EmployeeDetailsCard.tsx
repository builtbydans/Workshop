"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  LoaderCircle,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-error";
import {
  deleteEmployeeById,
  editEmployeeById,
} from "@/services/employee.service";
import EmployeeRoleBadge from "@/components/employees/EmployeeRoleBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmployeeDto,
  EmployeeRole,
  EMPLOYEE_ROLES,
  UpdateEmployeeDto,
} from "@/types/employee.types";
import { formatRelativeDate } from "@/utils/date";

interface EmployeeDetailsCardProps {
  employee: EmployeeDto;
}

const roleLabels: Record<EmployeeRole, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  TECHNICIAN: "Technician",
};

const EmployeeDetailsCard = ({ employee }: EmployeeDetailsCardProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<UpdateEmployeeDto>({
    first_name: employee.first_name,
    last_name: employee.last_name,
    role: employee.role,
    pin: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      await editEmployeeById(employee.id, {
        ...formData,
        pin: formData.pin?.trim() ? formData.pin : undefined,
      });
      toast.success("Employee updated successfully");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update employee"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Deactivate ${employee.first_name} ${employee.last_name}?`,
      )
    ) {
      return;
    }

    setDeleting(true);

    try {
      await deleteEmployeeById(employee.id);
      toast.success("Employee deactivated");
      router.push("/employees");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete employee"));
      setDeleting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">
                {employee.first_name} {employee.last_name}
              </CardTitle>
              <CardDescription className="mt-1">
                Update this employee&apos;s workshop profile.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <EmployeeRoleBadge role={employee.role} />
              <Badge
                className="border-emerald-200 bg-emerald-50 text-emerald-700"
                variant="outline"
              >
                Active
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First name</Label>
                <Input
                  id="first_name"
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      first_name: event.target.value,
                    }))
                  }
                  required
                  value={formData.first_name}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last name</Label>
                <Input
                  id="last_name"
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      last_name: event.target.value,
                    }))
                  }
                  required
                  value={formData.last_name}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                onValueChange={(role: EmployeeRole) =>
                  setFormData((current) => ({ ...current, role }))
                }
                value={formData.role}
              >
                <SelectTrigger className="w-full" id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {roleLabels[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin">Workshop PIN</Label>
              <Input
                id="pin"
                inputMode="numeric"
                maxLength={5}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    pin: event.target.value,
                  }))
                }
                pattern="\d{5}"
                placeholder={
                  employee.has_pin ? "Leave blank to keep current PIN" : "Set a 5-digit PIN"
                }
                value={formData.pin ?? ""}
              />
            </div>

            <div className="flex flex-wrap justify-between gap-3 border-t pt-5">
              <Button
                disabled={saving || deleting}
                onClick={handleDelete}
                type="button"
                variant="destructive"
              >
                {deleting ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Trash2 />
                )}
                {deleting ? "Deactivating..." : "Deactivate employee"}
              </Button>

              <Button disabled={saving || deleting} type="submit">
                {saving && <LoaderCircle className="animate-spin" />}
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Employee record</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex gap-3">
              <UserRound className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Employee ID</p>
                <p className="break-all text-muted-foreground">{employee.id}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Linked Auth user</p>
                <p className="break-all text-muted-foreground">
                  {employee.user_id ?? "Not linked yet"}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Current role</p>
                <p className="text-muted-foreground">
                  {roleLabels[employee.role]}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CalendarDays className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Created</p>
                <p className="text-muted-foreground" suppressHydrationWarning>
                  {formatRelativeDate(employee.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDetailsCard;
