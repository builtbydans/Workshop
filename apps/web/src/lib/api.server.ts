import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { LOGIN_PATH } from "@/config/api";
import { createClient } from "@/lib/supabase/server";
import { createApiFetch } from "@/lib/create-api-fetch";

async function getAccessToken(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

/** Server Component / RSC API calls. Safe to use next/headers. */
export const apiFetch = createApiFetch(
  getAccessToken,
  () => {
    redirect(LOGIN_PATH);
  },
  {
    async getExtraHeaders() {
      const cookie = (await headers()).get("cookie");
      return cookie ? { cookie } : undefined;
    },
  },
);
