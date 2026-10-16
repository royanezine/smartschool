
import { NextResponse } from "next/server";

const SYSTEM_ROUTES = [
  "/admin",
  "/guru",
  "/siswa",
  "/yayasan",
  "/super-admin",
];

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/onboarding",
  "/pin",
];

function isExcludedPath(pathname) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.json"
  );
}

function matchesRoute(pathname, routes) {
  return routes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );
}

export function proxy(request) {
  const url = request.nextUrl;
  const host = request.headers.get("host") || url.host;
  const hostname = host.split(":")[0].toLowerCase();
  const pathname = url.pathname;

  // 1. Lewati API dan aset statis.
  if (isExcludedPath(pathname)) {
    return NextResponse.next();
  }

  // 2. Proxy tenant hanya untuk subdomain .localhost.
  if (!hostname.endsWith(".localhost")) {
    return NextResponse.next();
  }

  const tenant = hostname.slice(0, -".localhost".length);

  if (!tenant || tenant === "www") {
    return NextResponse.next();
  }

  // 3. Kirim subdomain sekolah ke halaman.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-school-subdomain", tenant);

  // 4. Jangan rewrite halaman autentikasi.
  if (matchesRoute(pathname, AUTH_ROUTES)) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // 5. Jangan rewrite halaman sistem.
  if (matchesRoute(pathname, SYSTEM_ROUTES)) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // 6. Cegah tenant ditambahkan dua kali.
  const tenantPrefix = `/${tenant}`;

  if (
    pathname === tenantPrefix ||
    pathname.startsWith(`${tenantPrefix}/`)
  ) {
    const correctedUrl = url.clone();

    correctedUrl.pathname =
      pathname.slice(tenantPrefix.length) || "/";

    return NextResponse.redirect(correctedUrl);
  }

  // 7. Rewrite URL publik ke route internal tenant.
  const rewriteUrl = url.clone();

  rewriteUrl.pathname =
    pathname === "/"
      ? `/${tenant}`
      : `/${tenant}${pathname}`;

  return NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
