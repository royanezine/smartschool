import { NextResponse } from "next/server";

export function proxy(request) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  if (!hostname.endsWith(".localhost")) {
    return NextResponse.next();
  }

  const subdomain = hostname.replace(".localhost", "");
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  if (
    pathname === "/website" ||
    pathname.startsWith("/website/")
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  url.pathname = `/website${pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};