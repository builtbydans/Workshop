import { apiFetch } from "@/lib/api";
import { createCustomerService } from "@/services/customer.api";

export const {
  createCustomer,
  getCustomers,
  getCustomerById,
  getCustomerVehicleById,
  editCustomerById,
} = createCustomerService(apiFetch);
