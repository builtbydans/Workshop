import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { WorkInProgressBanner } from "@/components/work-in-progress-banner";
import { createClient } from "@/lib/supabase/server";
import type { NavUserData } from "@/types/auth.types";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let navUser: NavUserData | null = null;

  if (user) {
    const { data: employee } = await supabase
      .from("employees")
      .select("first_name, last_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const fullName = employee
      ? `${employee.first_name} ${employee.last_name}`.trim()
      : (user.email ?? "User");

    navUser = {
      firstName: employee?.first_name ?? fullName,
      fullName,
      email: user.email ?? "",
      avatar: "",
    };
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={navUser} />

      <SidebarInset>
        <WorkInProgressBanner />
        <SiteHeader user={navUser} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
