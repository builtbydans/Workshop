import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import env from "./env";

/**
 * Paths anyone can visit without being logged in.
 * Quote-approval is reserved for a later ticket.
 */
function isPublicPath(pathname: string) {
  if (pathname === "/" || pathname === "/login" || pathname.startsWith("/login/")) {
    return true;
  }

  if (pathname === "/technician" || pathname.startsWith("/technician/")) {
    return true;
  }

  if (pathname.startsWith("/quotes/approve")) {
    return true;
  }

  return false;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // 1. Update the request cookies so downstream code sees the new session
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // 2. Rebuild the response bound to that updated request
          supabaseResponse = NextResponse.next({
            request,
          });

          // 3. Send the cookies back to the browser
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });

          // 4. Cache headers from Supabase — stop CDNs caching authed responses
          Object.entries(headers).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value);
          });
        },
      },
    },
  );

  // Do not put logic between createServerClient and getUser().
  // getUser() validates with Auth and refreshes tokens when needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Route Handlers authenticate via Bearer token or cookies themselves.
  if (pathname.startsWith("/api")) {
    return supabaseResponse;
  }

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("error", "login_required");

    const redirectResponse = NextResponse.redirect(loginUrl);

    // Keep any refreshed cookies on the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });

    return redirectResponse;
  }

  return supabaseResponse;
}
