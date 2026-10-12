import "server-only";

import { requireServerAuth } from "@/lib/server-auth";
import * as customerService from "@/server/modules/customer/customer.service";
import type { CreateCustomerDto } from "@/types/customer.types";

export async function getCustomers() {
  await requireServerAuth();
  return customerService.getCustomers();
}

export async function getCustomerById(id: string) {
  await requireServerAuth();
  return customerService.getCustomerById(id);
}

export async function getCustomerVehicleById(id: string) {
  return getCustomerById(id);
}

export async function createCustomer(customerData: CreateCustomerDto) {
  await requireServerAuth();
  return customerService.createCustomer(customerData);
}

export async function editCustomerById(
  id: string,
  customerData: CreateCustomerDto,
) {
  await requireServerAuth();
  return customerService.updateCustomerById(id, customerData);
}
