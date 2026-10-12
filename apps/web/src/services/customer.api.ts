import type { ApiFetch } from "@/lib/api-types";
import type { CreateCustomerDto, CustomerData } from "@/types/customer.types";

export function createCustomerService(apiFetch: ApiFetch) {
  const createCustomer = (customerData: CreateCustomerDto) =>
    apiFetch<CustomerData>("/customers", {
      method: "POST",
      body: JSON.stringify(customerData),
    });

  const getCustomers = () =>
    apiFetch<CustomerData[]>("/customers", {
      method: "GET",
    });

  const getCustomerById = (id: string) =>
    apiFetch<CustomerData>(`/customers/${id}`, {
      method: "GET",
      cache: "no-store",
    });

  const getCustomerVehicleById = (id: string) =>
    apiFetch<CustomerData>(`/customers/${id}`, {
      method: "GET",
      cache: "no-store",
    });

  const editCustomerById = (id: string, customerData: CreateCustomerDto) =>
    apiFetch<CustomerData>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(customerData),
    });

  return {
    createCustomer,
    getCustomers,
    getCustomerById,
    getCustomerVehicleById,
    editCustomerById,
  };
}
