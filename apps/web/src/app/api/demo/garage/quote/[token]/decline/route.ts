import { handleRoute, json, parseBody } from "@/server/lib/http";
import {
  assertRateLimit,
  getClientIdentity,
} from "@/server/lib/rate-limit";
import * as quoteTokenService from "@/server/modules/quote-token/quote-token.service";
import {
  declineQuoteSchema,
  quoteTokenParamSchema,
} from "@/server/schemas/quote-token.schema";
import { AppError, ERROR_CODES } from "@/server/errors/AppError";

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  return handleRoute(async () => {
    assertRateLimit(getClientIdentity(request), {
      key: "demo-garage-quote-respond",
      limit: 20,
      windowMs: 15 * 60 * 1000,
      message: "Too many quote responses. Please try again shortly.",
    });

    const { token } = await context.params;
    const parsed = quoteTokenParamSchema.safeParse(token);

    if (!parsed.success) {
      throw new AppError("This quote link is invalid", 404, ERROR_CODES.NOT_FOUND);
    }

    let reason = "";
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = await parseBody(request, declineQuoteSchema);
      reason = body.reason ?? "";
    }

    const view = await quoteTokenService.declinePublicQuote(
      parsed.data,
      reason,
    );
    return json(200, view);
  });
}
