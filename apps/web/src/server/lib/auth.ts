import { createServerClient } from "@supabase/ssr";
import supabase from "../config/db/supabase";
import { AppError, ERROR_CODES } from "../errors/AppError";
import { readWorkshopToken } from "./workshop-token";
import * as employeeRepository from "../modules/employee/employee.repository";
import type { AuthContext } from "../types/auth.types";

function parseRequestCookies(request: Request) {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return [];
  }

  return cookieHeader.split(";").map((part) => {
    const [name, ...rest] = part.trim().split("=");
    return { name, value: decodeURIComponent(rest.join("=")) };
  });
}

async function getAuthFromCookies(
  request: Request,
): Promise<AuthContext | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const cookieClient = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return parseRequestCookies(request);
      },
      setAll() {
        // Route handlers only read the session from the incoming request.
      },
    },
  });

  const {
    data: { user },
    error,
  } = await cookieClient.auth.getUser();

  if (error || !user) {
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

async function getAuthFromBearerToken(
  token: string,
): Promise<AuthContext | null> {
  const workshopSession = readWorkshopToken(token);

  if (workshopSession) {
    return {
      userId: workshopSession.employeeId,
      email: "",
      role: workshopSession.role,
      employeeId: workshopSession.employeeId,
    };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
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

export async function requireAuth(request: Request): Promise<AuthContext> {
  const header = request.headers.get("authorization");

  if (header) {
    const [scheme, token] = header.split(" ");

    if (scheme === "Bearer" && token) {
      const auth = await getAuthFromBearerToken(token);

      if (auth) {
        return auth;
      }
    }
  }

  const cookieAuth = await getAuthFromCookies(request);

  if (cookieAuth) {
    return cookieAuth;
  }

  throw new AppError(
    "Authentication required",
    401,
    ERROR_CODES.UNAUTHORIZED,
  );
}
