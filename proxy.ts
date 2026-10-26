import { getSessionCookie } from "better-auth/cookies";
import { hasLocale } from "next-intl";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE, routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

// The portfolio is a single page, so section URLs like /km/projects open the
// page at that section instead.
const sectionPath = /^\/(?:([a-z]{2})\/)?(about|experience|projects|contact)\/?$/;

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The admin has no language prefix. Without a session cookie it's straight
  // to the login page; whether the session is valid, and the admin's, is
  // checked on the server by requireAdmin() (lib/authorization.ts).
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname !== "/admin/login" && !getSessionCookie(request)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  const section = pathname.match(sectionPath);
  if (section) {
    const requested = section[1] ?? request.cookies.get(LOCALE_COOKIE)?.value;
    const url = request.nextUrl.clone();
    url.pathname = `/${hasLocale(routing.locales, requested) ? requested : routing.defaultLocale}`;
    url.hash = section[2];
    return NextResponse.redirect(url);
  }

  // Visitors without a saved choice get English whatever their browser
  // language: the locale comes from the URL, then the cookie, then the default.
  const headers = new Headers(request.headers);
  headers.delete("accept-language");
  return handleI18nRouting(new NextRequest(request.url, { headers }));
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
