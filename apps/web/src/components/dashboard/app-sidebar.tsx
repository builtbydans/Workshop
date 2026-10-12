"use client";

import * as React from "react";

import { NavDocuments } from "@/components/dashboard/nav-documents";
import { NavMain } from "@/components/dashboard/nav-main";
import { NavSecondary } from "@/components/dashboard/nav-secondary";
import { NavUser } from "@/components/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  LayoutDashboardIcon,
  UsersIcon,
  CarIcon,
  WrenchIcon,
  ClipboardListIcon,
  ReceiptIcon,
  CommandIcon,
  PoundSterlingIcon,
  PersonStandingIcon,
} from "lucide-react";

import Link from "next/link";
import type { NavUserData } from "@/types/auth.types";

const data = {
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Customers",
      url: "/customers",
      icon: <UsersIcon />,
    },
    {
      title: "Vehicles",
      url: "/vehicles",
      icon: <CarIcon />,
    },
    {
      title: "Jobs",
      url: "/jobs",
      icon: <WrenchIcon />,
    },
    {
      title: "Leads",
      url: "/leads",
      icon: <ClipboardListIcon />,
    },
    {
      title: "Invoices",
      url: "/invoices",
      icon: <ReceiptIcon />,
    },
    {
      title: "Quotes",
      url: "/quotes",
      icon: <PoundSterlingIcon />,
    },
    {
      title: "Employees",
      url: "/employees",
      icon: <PersonStandingIcon />,
    },
  ],

  navSecondary: [],
  documents: [],
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: NavUserData | null;
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const { open, setOpen, isMobile } = useSidebar();
  const expandedByHoverRef = React.useRef(false);
  const isUserMenuOpenRef = React.useRef(false);

  const handleMouseEnter = React.useCallback(() => {
    if (isMobile || open) return;
    expandedByHoverRef.current = true;
    setOpen(true);
  }, [isMobile, open, setOpen]);

  const handleMouseLeave = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile || !expandedByHoverRef.current || isUserMenuOpenRef.current) {
        return;
      }

      // Dropdown content is portaled outside the sidebar — moving onto it
      // must not count as leaving, or expand/collapse fights the menu.
      const related = event.relatedTarget;
      if (
        related instanceof Element &&
        related.closest('[data-slot="dropdown-menu-content"]')
      ) {
        return;
      }

      expandedByHoverRef.current = false;
      setOpen(false);
    },
    [isMobile, setOpen],
  );

  const handleUserMenuOpenChange = React.useCallback(
    (menuOpen: boolean) => {
      isUserMenuOpenRef.current = menuOpen;

      if (menuOpen) {
        expandedByHoverRef.current = true;
        setOpen(true);
        return;
      }

      // Menu closed: collapse only if the pointer is no longer over the sidebar
      requestAnimationFrame(() => {
        const hovering = document
          .querySelector('[data-slot="sidebar-container"]')
          ?.matches(":hover");

        if (!hovering && expandedByHoverRef.current) {
          expandedByHoverRef.current = false;
          setOpen(false);
        }
      });
    },
    [setOpen],
  );

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard">
                <div className="flex size-5! items-center justify-center rounded-sm bg-primary text-primary-foreground">
                  <CommandIcon className="size-3.5!" />
                </div>
                <span className="text-base font-semibold">Workshop</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {user ? (
          <NavUser user={user} onOpenChange={handleUserMenuOpenChange} />
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
