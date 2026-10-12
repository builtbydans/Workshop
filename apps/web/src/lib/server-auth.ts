import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { LOGIN_PATH } from "@/config/api";
import { createClient } from "@/lib/supabase/server";
import * as employeeRepository from "@/server/modules/employee/employee.repository";
import type { AuthContext } from "@/server/types/auth.types";

/** Deduped per RSC request so layout + page don't each hit Auth/DB. */
export const getServerAuth = cache(async (): Promise<AuthContext | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const employee = await employeeRepository.getEmployeeByUserId(user.id);
  const role = employee?.role?.trim().toUpperCase();

  return {
    userId: user.id,
    email: user.email ?? "",
    employeeId: employee?.id,
    firstName: employee?.first_name,
    lastName: employee?.last_name,
    role:
      role === "MANAGER" || role === "ADMIN" || role === "TECHNICIAN"
        ? role
        : undefined,
  };
});

export async function requireServerAuth(): Promise<AuthContext> {
  const auth = await getServerAuth();

  if (!auth) {
    redirect(LOGIN_PATH);
  }

  return auth;
}
