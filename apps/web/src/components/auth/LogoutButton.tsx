"use client";

import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type LogoutButtonProps = {
  variant?: "button" | "menu-item";
};

export function LogoutButton({ variant = "button" }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (variant === "menu-item") {
    return (
      <DropdownMenuItem onClick={handleLogout}>
        <LogOutIcon />
        Log out
      </DropdownMenuItem>
    );
  }

  return <Button onClick={handleLogout}>Logout</Button>;
}
