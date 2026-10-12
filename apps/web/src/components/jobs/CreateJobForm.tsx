"use client";

import { useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-error";
import { createCustomer } from "@/services/customer.service";
import { CreateCustomerDto } from "@/types/customer.types";
import { Button } from "../ui/button";

export const CreateCustomerForm = () => {
  const [formData, setFormData] = useState<CreateCustomerDto>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

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

      await createCustomer(formData);

      toast.success("Customer created");

      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create customer"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <input
        name="first_name"
        placeholder="First Name"
        value={formData.first_name}
        onChange={handleChange}
        className="border p-2 w-full rounded"
      />

      <input
        name="last_name"
        placeholder="Last Name"
        value={formData.last_name}
        onChange={handleChange}
        className="border p-2 w-full rounded"
      />

      <input
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="border p-2 w-full rounded"
      />

      <input
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
        className="border p-2 w-full rounded"
      />

      <Button
        variant="outline"
        type="submit"
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Creating..." : "Create Customer"}
      </Button>
    </form>
  );
};
