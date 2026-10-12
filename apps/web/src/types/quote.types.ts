export type PublicQuoteState =
  | "AWAITING"
  | "ACCEPTED"
  | "DECLINED"
  | "EXPIRED"
  | "INVALID";

export type PublicQuoteView = {
  state: PublicQuoteState;
  quote: {
    job_number: string;
    customer_first_name: string;
    registration: string;
    make: string;
    model: string;
    description: string;
    job_type: string | null;
    quoted_cost: number;
    vat_rate: number;
    net: number;
    vat: number;
    gross: number;
    expires_at: string;
    quote_reference: string;
  } | null;
  message?: string;
};

export type CreateQuoteLinkResult = {
  url: string;
  expires_at: string;
  job_number: string;
};
