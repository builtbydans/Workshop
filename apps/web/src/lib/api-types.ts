import type { ApiErrorDetails } from "@/lib/api-error";

export type ApiFetch = <T>(path: string, init?: RequestInit) => Promise<T>;

export type ApiSuccessEnvelope<T> = {
  success: true;
  data: T;
};

export type ApiErrorEnvelope = {
  success: false;
  code?: string;
  message?: string;
  details?: ApiErrorDetails;
};
