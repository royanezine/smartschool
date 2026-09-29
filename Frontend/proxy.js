import { NextResponse } from "next/server";

export function proxy(request) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // Hanya proses subdomain *.localhost
  if (!hostname.endsWith(".localhost")) {
    return NextResponse.next();
  }

  // Ambil nama tenant dari subdomain
  // contoh:
  // sma-smart.localhost
  //          ↓
  // sma-smart
  const tenant = hostname.replace(".localhost", "");

  const pathname = request.nextUrl.pathname;

  // Jangan rewrite file/system route
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Buat URL baru
  const url = request.nextUrl.clone();

  /*
   * Subdomain:
   *
   * sma-smart.localhost
   *
   * akan diarahkan secara internal menjadi:
   *
   * /sma-smart
   *
   * sehingga Next.js mencocokkannya dengan:
   *
   * app/[tenant]/page.jsx
   */

  url.pathname = `/${tenant}${pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};