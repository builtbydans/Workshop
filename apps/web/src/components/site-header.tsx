"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ExternalLink, MoonIcon, SunIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import type { NavUserData } from "@/types/auth.types";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function SiteHeader({ user }: { user: NavUserData | null }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const getPageTitle = (path: string) => {
    if (path === "/") return `Welcome back, ${user?.firstName}`;

    const firstSegment = path.match(/\/([^\/]+)/)?.[1];

    return firstSegment
      ? firstSegment.replace(/\b\w/g, (char) => char.toUpperCase())
      : "Dashboard";
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />

        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <h1 className="text-base font-medium">{getPageTitle(pathname)}</h1>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
            <a href="/demo/garage" rel="noopener noreferrer" target="_blank">
              Simulate Enquiry
              <ExternalLink data-icon="inline-end" />
            </a>
          </Button>
          <Button
            asChild
            size="icon-sm"
            variant="outline"
            className="sm:hidden"
            aria-label="Simulate Enquiry"
          >
            <a href="/demo/garage" rel="noopener noreferrer" target="_blank">
              <ExternalLink />
            </a>
          </Button>
          <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
            <a href="/demo/customer" rel="noopener noreferrer" target="_blank">
              Customer Portal
              <ExternalLink data-icon="inline-end" />
            </a>
          </Button>
          <Button
            asChild
            size="icon-sm"
            variant="outline"
            className="sm:hidden"
            aria-label="Customer Portal"
          >
            <a href="/demo/customer" rel="noopener noreferrer" target="_blank">
              <ExternalLink />
            </a>
          </Button>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative flex items-center justify-center h-8 w-8 rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <SunIcon className="absolute size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />

            <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
