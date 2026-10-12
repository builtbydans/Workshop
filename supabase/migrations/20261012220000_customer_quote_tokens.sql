-- Secure customer quotation links for public accept/decline.
-- Plaintext tokens are never stored; only SHA-256 hashes.

create table public.quote_tokens (
  id uuid primary key default gen_random_uuid(),

  job_id uuid not null
    references public.jobs(id)
    on delete cascade,

  token_hash text not null,

  expires_at timestamptz not null,
  revoked_at timestamptz,

  responded_at timestamptz,
  response text,
  decline_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint quote_tokens_response_check check (
    response is null
    or response in ('ACCEPTED', 'DECLINED')
  ),

  constraint quote_tokens_response_consistency check (
    (response is null and responded_at is null)
    or (response is not null and responded_at is not null)
  )
);

create unique index quote_tokens_token_hash_unique
  on public.quote_tokens (token_hash);

-- At most one active (unrevoked, unanswered) token per job.
create unique index quote_tokens_one_active_per_job
  on public.quote_tokens (job_id)
  where revoked_at is null and responded_at is null;

create index quote_tokens_job_id_idx
  on public.quote_tokens (job_id);

comment on table public.quote_tokens is
  'Hashed customer quotation tokens for public quote accept/decline links.';
