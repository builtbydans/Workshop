import { createClient } from "@/lib/supabase/client";
import { createApiFetch, redirectToLogin } from "@/lib/create-api-fetch";

async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

/** Browser / Client Component API calls. Never import supabase/server here. */
export const apiFetch = createApiFetch(getAccessToken, redirectToLogin);
