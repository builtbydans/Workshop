import { AppError, ERROR_CODES } from "../../errors/AppError";
import { JOB_STATUS } from "../../constants/job-status";
import { generateSecureToken, hashToken } from "../../lib/token-crypto";
import * as jobRepository from "../job/job.repository";
import * as jobService from "../job/job.service";
import * as quoteTokenRepository from "./quote-token.repository";
import type {
  CreateQuoteLinkResult,
  PublicQuoteState,
  PublicQuoteView,
} from "@/types/quote.types";
import type { QuoteTokenRow } from "../../types/quote-token.types";

const VAT_RATE = 20;
const DEFAULT_TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000;

function money(value: number) {
  return Math.round(value * 100) / 100;
}

function splitInclusiveVat(gross: number, vatRate = VAT_RATE) {
  const net = money(gross / (1 + vatRate / 100));
  const vat = money(gross - net);
  return { net, vat, gross: money(gross) };
}

function resolvePublicOrigin() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

function buildQuoteUrl(token: string) {
  return `${resolvePublicOrigin()}/demo/garage/quote/${token}`;
}

function isExpired(token: QuoteTokenRow, now = Date.now()) {
  return new Date(token.expires_at).getTime() <= now;
}

function toPublicQuote(
  lead: Awaited<ReturnType<typeof jobRepository.getLeadById>>,
  expiresAt: string,
): NonNullable<PublicQuoteView["quote"]> {
  const quoted = Number(lead.quoted_cost ?? 0);
  const { net, vat, gross } = splitInclusiveVat(quoted);

  return {
    job_number: lead.job_number,
    customer_first_name: lead.vehicles.customers.first_name,
    registration: lead.vehicles.registration,
    make: lead.vehicles.make,
    model: lead.vehicles.model,
    description: lead.description ?? "",
    job_type: lead.job_type,
    quoted_cost: gross,
    vat_rate: VAT_RATE,
    net,
    vat,
    gross,
    expires_at: expiresAt,
    quote_reference: lead.job_number,
  };
}

function stateFromJobAndToken(
  lead: { status: string } | null,
  token: QuoteTokenRow,
): PublicQuoteState {
  if (token.revoked_at) {
    return "INVALID";
  }

  if (token.response === "ACCEPTED" || lead?.status === JOB_STATUS.AWAITING_DEPOSIT) {
    return "ACCEPTED";
  }

  if (token.response === "DECLINED" || lead?.status === JOB_STATUS.LOST) {
    return "DECLINED";
  }

  if (isExpired(token)) {
    return "EXPIRED";
  }

  if (lead?.status === JOB_STATUS.QUOTED) {
    return "AWAITING";
  }

  // Job moved elsewhere (booked, etc.) — treat link as no longer actionable.
  if (lead) {
    return "INVALID";
  }

  return "INVALID";
}

/**
 * Staff action: mint (or rotate) a customer quote link for a QUOTED lead.
 * Previous unanswered tokens for the job are revoked — hashes cannot be reversed.
 */
const createOrRotateQuoteLink = async (
  jobId: string,
): Promise<CreateQuoteLinkResult> => {
  const lead = await jobRepository.getLeadById(jobId);

  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  if (lead.status !== JOB_STATUS.QUOTED) {
    throw new AppError(
      "A customer quote link is only available once the lead has been quoted",
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  if (lead.quoted_cost == null || Number(lead.quoted_cost) <= 0) {
    throw new AppError(
      "Quoted cost is required before sharing a customer link",
      400,
      ERROR_CODES.VALIDATION_ERROR,
    );
  }

  await quoteTokenRepository.revokeActiveTokensForJob(jobId);

  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + DEFAULT_TOKEN_TTL_MS).toISOString();

  await quoteTokenRepository.createQuoteToken({
    job_id: jobId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  return {
    url: buildQuoteUrl(token),
    expires_at: expiresAt,
    job_number: lead.job_number,
  };
};

const getPublicQuoteByToken = async (
  rawToken: string,
): Promise<PublicQuoteView> => {
  if (!rawToken?.trim()) {
    return { state: "INVALID", quote: null, message: "This quote link is invalid." };
  }

  const token = await quoteTokenRepository.findByTokenHash(
    hashToken(rawToken.trim()),
  );

  if (!token || token.revoked_at) {
    return { state: "INVALID", quote: null, message: "This quote link is invalid." };
  }

  let lead;
  try {
    lead = await jobRepository.getLeadById(token.job_id);
  } catch {
    return { state: "INVALID", quote: null, message: "This quote link is invalid." };
  }

  const state = stateFromJobAndToken(lead, token);

  if (state === "INVALID" || !lead) {
    return { state: "INVALID", quote: null, message: "This quote link is invalid." };
  }

  const quote = toPublicQuote(lead, token.expires_at);

  if (state === "EXPIRED") {
    return {
      state,
      quote,
      message: "This quotation has expired. Please contact the garage for a new quote.",
    };
  }

  if (state === "ACCEPTED") {
    return {
      state,
      quote,
      message:
        "Quotation accepted. The garage will contact you about the deposit.",
    };
  }

  if (state === "DECLINED") {
    return {
      state,
      quote,
      message: "This quotation was declined.",
    };
  }

  return { state: "AWAITING", quote };
};

const acceptPublicQuote = async (rawToken: string): Promise<PublicQuoteView> => {
  const view = await getPublicQuoteByToken(rawToken);

  if (view.state === "ACCEPTED") {
    return view;
  }

  if (view.state === "DECLINED") {
    throw new AppError(
      "This quotation was already declined",
      409,
      ERROR_CODES.INVALID_STATUS_TRANSITION,
    );
  }

  if (view.state === "EXPIRED") {
    throw new AppError("This quotation has expired", 410, ERROR_CODES.VALIDATION_ERROR);
  }

  if (view.state !== "AWAITING") {
    throw new AppError("This quote link is invalid", 404, ERROR_CODES.NOT_FOUND);
  }

  const token = await quoteTokenRepository.findByTokenHash(
    hashToken(rawToken.trim()),
  );

  if (!token) {
    throw new AppError("This quote link is invalid", 404, ERROR_CODES.NOT_FOUND);
  }

  // Reuse existing accept path (status guard + workflow update).
  await jobService.acceptQuote(token.job_id);

  await quoteTokenRepository.markResponded(token.id, "ACCEPTED");

  return getPublicQuoteByToken(rawToken);
};

const declinePublicQuote = async (
  rawToken: string,
  reason?: string,
): Promise<PublicQuoteView> => {
  const view = await getPublicQuoteByToken(rawToken);

  if (view.state === "DECLINED") {
    return view;
  }

  if (view.state === "ACCEPTED") {
    throw new AppError(
      "This quotation was already accepted",
      409,
      ERROR_CODES.INVALID_STATUS_TRANSITION,
    );
  }

  if (view.state === "EXPIRED") {
    throw new AppError("This quotation has expired", 410, ERROR_CODES.VALIDATION_ERROR);
  }

  if (view.state !== "AWAITING") {
    throw new AppError("This quote link is invalid", 404, ERROR_CODES.NOT_FOUND);
  }

  const token = await quoteTokenRepository.findByTokenHash(
    hashToken(rawToken.trim()),
  );

  if (!token) {
    throw new AppError("This quote link is invalid", 404, ERROR_CODES.NOT_FOUND);
  }

  const note = reason?.trim()
    ? `Customer declined quotation: ${reason.trim()}`
    : "Customer declined quotation";

  await jobService.markLeadAsLost(token.job_id, { reason: note });
  await quoteTokenRepository.markResponded(
    token.id,
    "DECLINED",
    reason?.trim() || null,
  );

  return getPublicQuoteByToken(rawToken);
};

export {
  createOrRotateQuoteLink,
  getPublicQuoteByToken,
  acceptPublicQuote,
  declinePublicQuote,
  // exported for tests
  splitInclusiveVat,
  buildQuoteUrl,
  DEFAULT_TOKEN_TTL_MS,
};
