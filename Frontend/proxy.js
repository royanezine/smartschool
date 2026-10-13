import { NextResponse } from "next/server";

const SYSTEM_ROUTES = [
"/admin",
"/guru",
"/siswa",
"/yayasan",
"/super-admin",
];

function isExcludedPath(pathname) {
return (
pathname.startsWith("/_next") ||
pathname.startsWith("/api") ||
pathname === "/favicon.ico" ||
pathname === "/robots.txt" ||
pathname === "/sitemap.xml"
);
}

export function proxy(request) {
const host = request.headers.get("host") || "";
const hostname = host.split(":")[0].toLowerCase();
const pathname = request.nextUrl.pathname;

// Abaikan aset dan API.
if (isExcludedPath(pathname)) {
return NextResponse.next();
}

// Domain utama, misalnya localhost:3000.
if (!hostname.endsWith(".localhost")) {
return NextResponse.next();
}

const tenant = hostname.slice(0, -".localhost".length);

if (!tenant || tenant === "www") {
return NextResponse.next();
}

// Teruskan identitas subdomain untuk kebutuhan FE.
const requestHeaders = new Headers(request.headers);
requestHeaders.set("x-school-subdomain", tenant);

// Halaman autentikasi tetap menggunakan route (auth).
if (
pathname === "/login" ||
pathname.startsWith("/login/") ||
pathname === "/register" ||
pathname.startsWith("/register/") ||
pathname.startsWith("/forgot-password") ||
pathname.startsWith("/onboarding")
) {
return NextResponse.next({
request: { headers: requestHeaders },
});
}

// Halaman sistem tetap menggunakan route (system).
const isSystemRoute = SYSTEM_ROUTES.some(
(route) =>
pathname === route || pathname.startsWith(`${route}/`)
);

if (isSystemRoute) {
return NextResponse.next({
request: { headers: requestHeaders },
});
}

// Halaman publik diarahkan ke app/[tenant]/...
const url = request.nextUrl.clone();
url.pathname = `/${tenant}${pathname}`;

return NextResponse.rewrite(url, {
request: { headers: requestHeaders },
});
}

export const config = {
matcher: [
"/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
],
};
