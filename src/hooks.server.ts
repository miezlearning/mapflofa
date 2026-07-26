import type { Handle } from "@sveltejs/kit";
import {
  resolveSession,
  setSessionCookie,
  SESSION_COOKIE,
} from "$lib/server/auth/session";
import { requireAdmin } from "$lib/server/api/auth";

/**
 * Global request hook:
 *  1. Resolve session cookie → attach event.locals.user / sessionId
 *  2. Reject unknown HTTP methods on /api/*
 *  3. Apply baseline security headers
 */
const ALLOWED_API_METHODS = new Set([
  "GET",
  "POST",
  "PATCH",
  "PUT",
  "DELETE",
  "OPTIONS",
  "HEAD",
]);

function wantsHtml(event: Parameters<Handle>[0]["event"]): boolean {
  const accept = event.request.headers.get("accept") ?? "";
  return accept.includes("text/html");
}

export const handle: Handle = async ({ event, resolve }) => {
  // --- Session resolution ---
  const token = event.cookies.get(SESSION_COOKIE);
  const session = await resolveSession(token);
  event.locals.user = session?.user ?? null;
  event.locals.sessionId = session?.sessionId ?? null;
  if (session?.refreshed && token) {
    // Re-issue cookie with new expiry to keep it rolling.
    setSessionCookie(event.cookies, token);
  }

  // --- Method allowlist for /api/* ---
  if (event.url.pathname.startsWith("/api/")) {
    if (!ALLOWED_API_METHODS.has(event.request.method)) {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (event.request.method !== "OPTIONS") {
      const unauth = requireAdmin(event);
      if (unauth) {
        if (event.request.method === "GET" && wantsHtml(event)) {
          return new Response(null, {
            status: 303,
            headers: { Location: "/api-blocked" },
          });
        }
        return unauth;
      }
    }
  }

  const response = await resolve(event);

  // --- Defense-in-depth security headers ---
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self'; frame-ancestors 'none';"
  );

  return response;
};
