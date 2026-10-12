import { redirect } from "next/navigation";

import { LandingPage } from "@/components/marketing/landing-page";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Northside Motor Co. · Workshop",
  description:
    "Independent garage demo for the Workshop garage management system.",
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
