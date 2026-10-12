"use client";

import { useState } from "react";
import { CreateCustomerDto, CustomerData } from "@/types/customer.types";
import { getErrorMessage } from "@/lib/api-error";
import { editCustomerById } from "@/services/customer.service";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  customer: CustomerData;
}

const EditCustomerForm = ({ customer }: Props) => {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateCustomerDto>({
    first_name: customer.first_name,
    last_name: customer.last_name,
    email: customer.email,
    phone: customer.phone,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      await editCustomerById(customer.id, formData);

      toast.success("Customer successfully edited");
      router.push(`/customers/${customer.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to edit customer"));
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
        {loading ? "Editing..." : "Edit Customer"}
      </Button>
    </form>
  );
};

export default EditCustomerForm;
