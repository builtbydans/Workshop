import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "../env";

let client: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!client) {
    const env = getServerEnv();
    client = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY);
  }

  return client;
}

/** Lazy proxy matching the previous default-export usage sites. */
const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getSupabase(), prop, receiver);
    return typeof value === "function" ? value.bind(getSupabase()) : value;
  },
});

export default supabase;
