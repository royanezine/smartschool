
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSlug(value) {
  return normalizeText(value).replace(/^\/+|\/+$/g, "");
}

export default function PublicNavbar({ sekolah = {}, halaman = [] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const subdomain = normalizeText(sekolah.subdomain);
  const base = subdomain ? `/${subdomain}` : "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const menuItems = [
    { label: "Beranda", href: base, key: "home" },
    { label: "Tentang", href: `${base}/tentang`, key: "about" },
    { label: "Artikel", href: `${base}/articles`, key: "articles" },
    ...(Array.isArray(halaman) ? halaman : [])
      .filter((item) => item?.slug && item?.judul)
      .filter((item) => {
        const slug = normalizeSlug(item.slug).toLowerCase();
        return !["articles", "artikel", "berita", "tentang"].includes(slug);
      })
      .map((item) => ({
        label: item.judul,
        href: `${base}/${normalizeSlug(item.slug)}`,
        key: `page-${item.id || item.slug}`,
      })),
  ];

  const isActive = (href) => {
    if (!pathname) return false;
    if (href === base) return pathname === base || pathname === `${base}/`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const logo = normalizeText(sekolah.logoKecilUrl);
  const namaSekolah = normalizeText(sekolah.nama) || "Sekolah";
  const jenjang = normalizeText(sekolah.jenjang) || "Sekolah";

  return (
    <div
      className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-6 sm:pt-4"
      style={{ color: "var(--warna-netral-teks, #0F172A)" }}
    >
      <header
        className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition-all duration-300 sm:px-6"
        style={{
          backgroundColor: "var(--warna-netral-putih, #FFFFFF)",
          borderColor: "var(--warna-netral-garis, #E2E8F0)",
          boxShadow: scrolled
            ? "0 8px 30px rgba(15, 23, 42, 0.08)"
            : "0 2px 10px rgba(15, 23, 42, 0.025)",
        }}
      >
        <Link
          href={base}
          className="flex min-w-0 shrink items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--warna-primer-utama,#2563EB)]"
          aria-label={`Beranda ${namaSekolah}`}
        >
          {logo ? (
            <div
              className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border p-1 sm:h-11 sm:w-11"
              style={{
                backgroundColor: "var(--warna-netral-putih, #FFFFFF)",
                borderColor: "var(--warna-netral-garis, #E2E8F0)",
              }}
            >
              <Image
                src={logo}
                alt={`Logo ${namaSekolah}`}
                fill
                sizes="44px"
                unoptimized
                className="object-contain p-1"
              />
            </div>
          ) : (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white sm:h-11 sm:w-11"
              style={{
                backgroundColor: "var(--warna-primer-utama, #2563EB)",
              }}
            >
              {namaSekolah.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <p className="max-w-[190px] truncate text-sm font-bold tracking-tight sm:max-w-[280px] sm:text-base">
              {namaSekolah}
            </p>
            <p
              className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] sm:text-xs"
              style={{ color: "var(--warna-primer-utama, #2563EB)" }}
            >
              {jenjang}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Navigasi utama">
          {menuItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="rounded-xl px-3 py-2 text-sm font-medium transition-colors"
                style={{
                  color: active
                    ? "var(--warna-primer-utama, #2563EB)"
                    : "var(--warna-netral-teksLembut, #64748B)",
                  backgroundColor: active
                    ? "var(--warna-netral-latar, #F8FAFC)"
                    : "transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}

          <Link
            href={`${base}/PPDB`}
            className="ml-2 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              backgroundColor: "var(--warna-primer-utama, #2563EB)",
            }}
          >
            Daftar PPDB
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 17 17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border xl:hidden"
          style={{
            backgroundColor: "var(--warna-netral-latar, #F8FAFC)",
            borderColor: "var(--warna-netral-garis, #E2E8F0)",
            color: "var(--warna-netral-teks, #0F172A)",
          }}
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={open}
          aria-controls="public-mobile-navigation"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="m18 6-12 12M6 6l12 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {open && (
        <nav
          id="public-mobile-navigation"
          aria-label="Navigasi mobile"
          className="mx-auto mt-2 w-full max-w-7xl rounded-2xl border p-3 shadow-xl xl:hidden"
          style={{
            backgroundColor: "var(--warna-netral-putih, #FFFFFF)",
            borderColor: "var(--warna-netral-garis, #E2E8F0)",
          }}
        >
          <div className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto">
            {menuItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className="rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                  style={{
                    color: active
                      ? "var(--warna-primer-utama, #2563EB)"
                      : "var(--warna-netral-teks, #0F172A)",
                    backgroundColor: active
                      ? "var(--warna-netral-latar, #F8FAFC)"
                      : "transparent",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}

            <div
              className="my-2 border-t"
              style={{ borderColor: "var(--warna-netral-garis, #E2E8F0)" }}
            />

            <Link
              href={`${base}/PPDB`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{
                backgroundColor: "var(--warna-primer-utama, #2563EB)",
              }}
            >
              Daftar PPDB
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
