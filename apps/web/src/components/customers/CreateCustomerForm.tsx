"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-error";
import { createCustomer } from "@/services/customer.service";
import { CreateCustomerDto } from "@/types/customer.types";
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

export const CreateCustomerForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateCustomerDto>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const customer = await createCustomer(formData);

      toast.success("Customer created");
      router.push(`/customers/${customer.id}`);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create customer"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Customer details</CardTitle>
        <CardDescription>
          Enter the customer&apos;s contact information.
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
            <Label htmlFor="email">Email</Label>
            <Input
              autoComplete="email"
              id="email"
              name="email"
              onChange={handleChange}
              required
              type="email"
              value={formData.email}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              autoComplete="tel"
              id="phone"
              name="phone"
              onChange={handleChange}
              required
              type="tel"
              value={formData.phone}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <Button disabled={loading} type="submit">
              {loading && <LoaderCircle className="animate-spin" />}
              {loading ? "Creating..." : "Create customer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
