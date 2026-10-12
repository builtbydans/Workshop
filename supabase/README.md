# Supabase demo data

The demo dataset lives in [`seed.sql`](./seed.sql) and models **Northside Motor Co.**, a fictional Manchester garage.

## What it includes

| Entity | Count |
|--------|------:|
| Employees | 6 (1 manager, 1 admin, 4 technicians) |
| Customers | 25 |
| Vehicles | 32 |
| Jobs | 45 (every workflow status) |
| Work items | 14 |
| Job raises | 4 (2 open, 1 acknowledged, 1 resolved) |
| Job updates | 13 |
| Invoices | 6 (draft, unpaid, paid, void) |

Jobs are timestamped with `now()` so the dashboard always shows realistic "today" activity — active bays, upcoming bookings, and months of completed history.

---

## Local development

**Prerequisites:** [Supabase CLI](https://supabase.com/docs/guides/cli), Docker running.

```bash
# From the repo root
cd /path/to/workshop

# Start local Supabase (skip if already running)
supabase start

# Wipe data, re-run migrations, and load seed.sql
supabase db reset
```

Copy the local URL and keys from `supabase start` output into `apps/web/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon key from supabase start>
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SECRET_KEY=<service role key from supabase start>
```

Start the app:

```bash
cd apps/web
npm run dev
```

Open http://localhost:3000 — sign in (or create a user in local Studio at http://127.0.0.1:54323).

---

## Production (hosted Supabase)

1. **Back up** anything you want to keep (Supabase → Database → Backups).

2. Open **Supabase Dashboard → SQL Editor**.

3. Copy the entire contents of [`seed.sql`](./seed.sql) and **Run**.

4. **Link your auth user** to the manager employee:
   - Go to **Authentication → Users** and copy your user UUID.
   - In SQL Editor:
     ```sql
     update public.employees
     set user_id = '<your-auth-user-id>'
     where id = 'e1000000-0000-4000-8000-000000000001';
     ```

5. **Refresh the app** (e.g. your Vercel URL) and sign in.

6. *(Optional)* Set technician PINs in the app for clock-in demos.

---

## Verify it worked

After seeding, you should see roughly:

- **Dashboard:** ~45 jobs, active workshop count, open raises, recent activity
- **Customers:** 25 entries
- **Jobs:** mix of leads, in-progress, ready for collection, and paid history
- **Invoices:** draft, unpaid, and paid examples

---

## Notes

- The seed is **destructive** — it truncates all operational tables before inserting.
- **Auth users are not deleted** — your login still works; you just need the `user_id` link above.
- Technician PINs are not seeded; set them in the app.
- Job and invoice numbers reset to `JOB-2026-000001` / `INV-2026-000001` each run.
