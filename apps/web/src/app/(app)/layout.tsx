import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { WorkInProgressBanner } from "@/components/work-in-progress-banner";
import { getServerAuth } from "@/lib/server-auth";
import type { NavUserData } from "@/types/auth.types";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await getServerAuth();

  let navUser: NavUserData | null = null;

  if (auth) {
    const fullName =
      auth.firstName || auth.lastName
        ? `${auth.firstName ?? ""} ${auth.lastName ?? ""}`.trim()
        : auth.email || "User";

    navUser = {
      firstName: auth.firstName ?? fullName,
      fullName,
      email: auth.email,
      avatar: "",
      role: auth.role,
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
