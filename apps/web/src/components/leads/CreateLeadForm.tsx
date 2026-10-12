"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";

import { getErrorMessage } from "@/lib/api-error";
import { createLead } from "@/services/lead.service";
import { CreateLeadDto } from "@/types/lead.types";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const CreateLeadForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateLeadDto>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    registration: "",
    make: "",
    model: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      await createLead(formData);

      toast.success("Your enquiry has been sent to the GMS Team");
      router.push(`/`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create lead"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Lead details</CardTitle>
        <CardDescription>
          Add the customer, vehicle, and enquiry information.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input
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
                id="last_name"
                name="last_name"
                onChange={handleChange}
                required
                value={formData.last_name}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
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
                id="phone"
                name="phone"
                onChange={handleChange}
                required
                type="tel"
                value={formData.phone}
              />
            </div>
          </div>

          <div className="border-t pt-5">
            <p className="mb-4 text-sm font-medium">Vehicle details</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="registration">Registration</Label>
                <Input
                  id="registration"
                  name="registration"
                  onChange={handleChange}
                  required
                  value={formData.registration}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  name="make"
                  onChange={handleChange}
                  required
                  value={formData.make}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  name="model"
                  onChange={handleChange}
                  required
                  value={formData.model}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Enquiry</Label>
            <textarea
              className="min-h-28 w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              id="message"
              name="message"
              onChange={handleChange}
              required
              rows={4}
              value={formData.message}
            />
          </div>

          <div className="flex justify-end">
            <Button disabled={loading} type="submit">
              {loading && <LoaderCircle className="animate-spin" />}
              {loading ? "Creating..." : "Send enquiry"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateLeadForm;
