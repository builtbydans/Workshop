/**
 * Base URL for the Workshop API.
 *
 * Same-origin Next.js Route Handlers live under `/api`.
 * Override with NEXT_PUBLIC_API_URL only if the API is hosted elsewhere.
 */
function resolveApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }

  // Browser: same-origin relative path
  if (typeof window !== "undefined") {
    return "/api";
  }

  // Server Components / Route Handlers calling the API over HTTP
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }

  const port = process.env.PORT ?? "3000";
  return `http://localhost:${port}/api`;
}

export const API_URL = resolveApiUrl();

export const LOGIN_PATH = "/login?error=unauthorized";
