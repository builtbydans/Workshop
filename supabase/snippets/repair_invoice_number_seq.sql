-- One-time repair: sync invoice_number_seq with existing invoice numbers.
-- Safe to re-run. Does not modify invoice rows or constraints.
--
-- Run in the Supabase SQL editor against the affected database.

select setval(
  'public.invoice_number_seq',
  coalesce(
    (
      select max(substring(invoice_number from '([0-9]+)$')::bigint)
      from public.invoices
      where invoice_number ~ '[0-9]+$'
    ),
    1
  ),
  true
);
