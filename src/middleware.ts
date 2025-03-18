import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - login (login page)
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico, sitemap.xml, robots.txt (metadata files)
   */
  matcher: "/((?!login|api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
};

export async function middleware(request: NextRequest) {
  // TODO: Only allow one session at a time (maybe check during login callback?)
  // TODO: Ideally check roles too
  try {
    await auth.api.listSessions({
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError && error.status === "UNAUTHORIZED") {
      return NextResponse.redirect(getLoginUrl(request.nextUrl));
    }

    throw error;
  }

  return NextResponse.next();
}

function getLoginUrl(nextUrl: NextRequest["nextUrl"]) {
  const loginURL = new URL("/login", nextUrl.origin);

  const pathname = nextUrl.pathname.replace("/", "");
  if (pathname !== "") {
    loginURL.searchParams.set("returnUrl", pathname);
  }

  return loginURL;
}
