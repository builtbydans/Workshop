import "server-only";

import { redirect } from "next/navigation";

import { LOGIN_PATH } from "@/config/api";
import { createClient } from "@/lib/supabase/server";
import * as employeeRepository from "@/server/modules/employee/employee.repository";
import type { AuthContext } from "@/server/types/auth.types";

export async function getServerAuth(): Promise<AuthContext | null> {
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
    role:
      role === "MANAGER" || role === "ADMIN" || role === "TECHNICIAN"
        ? role
        : undefined,
  };
}

export async function requireServerAuth(): Promise<AuthContext> {
  const auth = await getServerAuth();

  if (!auth) {
    redirect(LOGIN_PATH);
  }

  return auth;
}
