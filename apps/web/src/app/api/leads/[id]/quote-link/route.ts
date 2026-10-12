import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json } from "@/server/lib/http";
import * as quoteTokenService from "@/server/modules/quote-token/quote-token.service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleRoute(async () => {
    await requireAuth(request);
    const { id } = await context.params;
    const link = await quoteTokenService.createOrRotateQuoteLink(id);
    return json(201, link);
  });
}
