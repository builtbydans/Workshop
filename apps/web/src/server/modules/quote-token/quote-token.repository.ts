import supabase from "../../config/db/supabase";
import { AppError } from "../../errors/AppError";
import type {
  QuoteTokenResponse,
  QuoteTokenRow,
} from "../../types/quote-token.types";

const createQuoteToken = async (input: {
  job_id: string;
  token_hash: string;
  expires_at: string;
}): Promise<QuoteTokenRow> => {
  const { data, error } = await supabase
    .from("quote_tokens")
    .insert({
      job_id: input.job_id,
      token_hash: input.token_hash,
      expires_at: input.expires_at,
    })
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data as QuoteTokenRow;
};

const findByTokenHash = async (
  tokenHash: string,
): Promise<QuoteTokenRow | null> => {
  const { data, error } = await supabase
    .from("quote_tokens")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return (data as QuoteTokenRow | null) ?? null;
};

const findActiveByJobId = async (
  jobId: string,
): Promise<QuoteTokenRow | null> => {
  const { data, error } = await supabase
    .from("quote_tokens")
    .select("*")
    .eq("job_id", jobId)
    .is("revoked_at", null)
    .is("responded_at", null)
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return (data as QuoteTokenRow | null) ?? null;
};

const revokeActiveTokensForJob = async (jobId: string) => {
  const { error } = await supabase
    .from("quote_tokens")
    .update({
      revoked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("job_id", jobId)
    .is("revoked_at", null)
    .is("responded_at", null);

  if (error) {
    throw new AppError(error.message, 500);
  }
};

const markResponded = async (
  id: string,
  response: QuoteTokenResponse,
  declineReason?: string | null,
): Promise<QuoteTokenRow | null> => {
  const { data, error } = await supabase
    .from("quote_tokens")
    .update({
      response,
      decline_reason: declineReason?.trim() || null,
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .is("responded_at", null)
    .is("revoked_at", null)
    .select()
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return (data as QuoteTokenRow | null) ?? null;
};

export {
  createQuoteToken,
  findByTokenHash,
  findActiveByJobId,
  revokeActiveTokensForJob,
  markResponded,
};
