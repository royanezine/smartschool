import { NextResponse } from "next/server";

const ROOT_DOMAIN = "smartschool.citrasolusi.id";

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

const RESERVED_TENANTS = [
  "www",
  "api",
  "admin",
  "guru",
  "siswa",
  "yayasan",
  "super-admin",
  "login",
  "register",
  "forgot-password",
  "onboarding",
  "pin",
  ".git",
];

function isExcludedPath(pathname) {
  return EXCLUDED_PATHS.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`)
  );
}

function matchesRoute(pathname, routes) {
  return routes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );
}

function isValidTenant(value) {
  if (typeof value !== "string") return false;

  const tenant = value.trim().toLowerCase();

  if (!tenant || RESERVED_TENANTS.includes(tenant)) {
    return false;
  }

  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tenant);
}

function getTenantFromHost(host) {
  const hostname = host
    .split(":")[0]
    .toLowerCase()
    .replace(/\.$/, "");

  if (hostname.endsWith(".localhost")) {
    const tenant = hostname.slice(
      0,
      -".localhost".length
    );

    return isValidTenant(tenant) ? tenant : null;
  }

  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const tenant = hostname.slice(
      0,
      -`.${ROOT_DOMAIN}`.length
    );

    return isValidTenant(tenant) ? tenant : null;
  }

  return null;
}

function isReservedPath(pathname) {
  return /(^|\/)\.git(?:\/|$)/i.test(pathname);
}

export function proxy(request) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  const host =
    request.headers.get("host") || url.host;

  if (isExcludedPath(pathname)) {
    return NextResponse.next();
  }

  if (isReservedPath(pathname)) {
    return NextResponse.json(
      {
        success: false,
        message: "Halaman tidak ditemukan",
      },
      { status: 404 }
    );
  }

  if (
    matchesRoute(pathname, SYSTEM_ROUTES) ||
    matchesRoute(pathname, AUTH_ROUTES)
  ) {
    return NextResponse.next();
  }

  const tenant = getTenantFromHost(host);

  if (!tenant) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-school-subdomain", tenant);

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

  const rewriteUrl = url.clone();

  rewriteUrl.pathname =
    pathname === "/"
      ? tenantPrefix
      : `${tenantPrefix}${pathname}`;

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