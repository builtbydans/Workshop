# Archive

Frozen snapshots of earlier implementations kept for reference and interview discussion.

## `express-server/`

The original Express API that previously ran as a separate Railway service.

This is a full copy of the Express app as it existed before the Next.js Route Handler migration:

- `app.ts` / `create-app.ts` — Express bootstrap and middleware wiring
- `modules/**/*.routes.ts` — Express routers
- `modules/**/*.controller.ts` — HTTP controllers (`req` / `res` / `next`)
- `middleware/` — auth, validation, error, and not-found middleware
- Domain layer (services, repositories, schemas, types) as it lived alongside Express

**Live production code now lives in `apps/web/src/server/` and `apps/web/src/app/api/`.**

Do not deploy or edit this archive for feature work — treat it as a historical reference.
