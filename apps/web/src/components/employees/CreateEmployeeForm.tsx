"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-error";
import { createEmployee } from "@/services/employee.service";
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
  CreateEmployeeDto,
  EmployeeRole,
  EMPLOYEE_ROLES,
} from "@/types/employee.types";

const roleLabels: Record<EmployeeRole, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  TECHNICIAN: "Technician",
};

const initialFormData: CreateEmployeeDto = {
  first_name: "",
  last_name: "",
  role: "TECHNICIAN",
  pin: "",
};

const CreateEmployeeForm = () => {
  const router = useRouter();
  const [formData, setFormData] =
    useState<CreateEmployeeDto>(initialFormData);
  const [loading, setLoading] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const employee = await createEmployee({
        ...formData,
        pin: formData.pin?.trim() || undefined,
      });

      toast.success("Employee created successfully");
      router.push(`/employees/${employee.id}`);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create employee"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Employee details</CardTitle>
        <CardDescription>
          Create a workshop staff profile and choose their access role.
          Technicians need a 5-digit PIN for the workshop floor tablet.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input
                autoComplete="given-name"
                id="first_name"
                name="first_name"
                onChange={handleChange}
                required
                value={formData.first_name}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input
                autoComplete="family-name"
                id="last_name"
                name="last_name"
                onChange={handleChange}
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
                <SelectValue placeholder="Select a role" />
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
              name="pin"
              onChange={handleChange}
              pattern="\d{5}"
              placeholder="5-digit PIN"
              required={formData.role === "TECHNICIAN"}
              value={formData.pin ?? ""}
            />
            <p className="text-sm text-muted-foreground">
              Required for technicians. Used on /technician/login, not the
              office email login.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              disabled={loading}
              onClick={() => router.push("/employees")}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={loading} type="submit">
              {loading && <LoaderCircle className="animate-spin" />}
              {loading ? "Creating..." : "Create employee"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateEmployeeForm;
