import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json, parseBody } from "@/server/lib/http";
import * as customerService from "@/server/modules/customer/customer.service";
import {
  createCustomerSchema,
} from "@/server/schemas/customer.schema";

export async function GET(request: Request) {
  return handleRoute(async () => {
    await requireAuth(request);
    const customers = await customerService.getCustomers();
    return json(200, customers);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    await requireAuth(request);
    const body = await parseBody(request, createCustomerSchema);
    const customer = await customerService.createCustomer(body);
    return json(201, customer);
  });
}
