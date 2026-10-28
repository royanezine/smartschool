
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

const EXCLUDED_PATHS = [
  "/_next",
  "/api",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
];

function isExcludedPath(pathname) {
  return EXCLUDED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function matchesRoute(pathname, routes) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function getTenantFromHost(host) {
  const hostname = host.split(":")[0].toLowerCase();

  // Hanya aktif untuk subdomain lokal, misalnya smart.localhost
  if (!hostname.endsWith(".localhost")) {
    return null;
  }

  const tenant = hostname.slice(0, -".localhost".length);

  if (!tenant || tenant === "www") {
    return null;
  }

  // Mencegah nilai tenant yang tidak valid
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(tenant)) {
    return null;
  }

  return tenant;
}

export function proxy(request) {
  const url = request.nextUrl;
  const pathname = url.pathname;
  const host = request.headers.get("host") || url.host;

  // Jangan mengubah endpoint API, aset Next.js, atau file statis.
  if (isExcludedPath(pathname)) {
    return NextResponse.next();
  }

  const tenant = getTenantFromHost(host);

  // Domain utama atau localhost tanpa subdomain tenant.
  if (!tenant) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-school-subdomain", tenant);

  // Halaman autentikasi menggunakan route global.
  if (matchesRoute(pathname, AUTH_ROUTES)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Halaman sistem tetap menggunakan route global.
  if (matchesRoute(pathname, SYSTEM_ROUTES)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const tenantPrefix = `/${tenant}`;

  // Jika prefix tenant ditulis manual pada subdomain tenant,
  // arahkan ke URL tanpa prefix agar tidak terjadi duplikasi.
  if (
    pathname === tenantPrefix ||
    pathname.startsWith(`${tenantPrefix}/`)
  ) {
    const correctedUrl = url.clone();
    correctedUrl.pathname = pathname.slice(tenantPrefix.length) || "/";

    return NextResponse.redirect(correctedUrl);
  }

  // Contoh:
  // smart.localhost:3000/         -> /smart
  // smart.localhost:3000/profil   -> /smart/profil
  // smart.localhost:3000/articles -> /smart/articles
  const rewriteUrl = url.clone();
  rewriteUrl.pathname =
    pathname === "/" ? tenantPrefix : `${tenantPrefix}${pathname}`;

  return NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)",
  ],
};
