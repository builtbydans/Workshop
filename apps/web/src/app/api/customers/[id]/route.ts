import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json, parseBody } from "@/server/lib/http";
import * as customerService from "@/server/modules/customer/customer.service";
import { updateCustomerSchema } from "@/server/schemas/customer.schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  return handleRoute(async () => {
    await requireAuth(request);
    const { id } = await params;
    const customer = await customerService.getCustomerById(id);
    return json(200, customer);
  });
}

export async function PUT(request: Request, { params }: Params) {
  return handleRoute(async () => {
    await requireAuth(request);
    const { id } = await params;
    const body = await parseBody(request, updateCustomerSchema);
    const customer = await customerService.updateCustomerById(id, body);
    return json(200, customer);
  });
}

export async function DELETE(request: Request, { params }: Params) {
  return handleRoute(async () => {
    await requireAuth(request);
    const { id } = await params;
    const customer = await customerService.deleteCustomerById(id);
    return json(200, customer);
  });
}
