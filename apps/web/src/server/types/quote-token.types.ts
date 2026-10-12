export type QuoteTokenResponse = "ACCEPTED" | "DECLINED";

export type QuoteTokenRow = {
  id: string;
  job_id: string;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  responded_at: string | null;
  response: QuoteTokenResponse | null;
  decline_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type {
  PublicQuoteState,
  PublicQuoteView,
  CreateQuoteLinkResult,
} from "@/types/quote.types";
