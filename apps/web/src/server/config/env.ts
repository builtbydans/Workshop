import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
});

export type ServerEnv = z.infer<typeof envSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) {
    return cached;
  }

  const result = envSchema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  });

  if (!result.success) {
    const names = result.error.issues.map((issue) => issue.path.join("."));
    const uniqueNames = [...new Set(names)];
    throw new Error(
      `Missing or invalid environment variables: ${uniqueNames.join(", ")}`,
    );
  }

  cached = result.data;
  return cached;
}

/** Lazy proxy so importing this module during build does not require env vars. */
const env = new Proxy({} as ServerEnv, {
  get(_target, prop: string | symbol) {
    return getServerEnv()[prop as keyof ServerEnv];
  },
});

export default env;
