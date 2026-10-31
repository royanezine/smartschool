
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { publikService } from "@/services/publik.service";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSlug(value) {
  return normalizeText(value).replace(/^\/+|\/+$/g, "");
}

// Menentukan prefix tenant saat halaman PPDB dibuka.
// "" = PPDB diakses langsung dari subdomain sekolah, null = bukan halaman PPDB.
function getPpdbBasePath(pathname) {
  if (typeof pathname !== "string" || !pathname.startsWith("/")) {
    return null;
  }

  const denganTenant = pathname.match(/^\/([^/]+)\/PPDB(?:\/|$)/i);

  if (denganTenant) {
    return denganTenant[1].toLowerCase() === "ppdb"
      ? null
      : `/${denganTenant[1]}`;
  }

  if (/^\/PPDB(?:\/|$)/i.test(pathname)) {
    return "";
  }

  return null;
}

function isPageActive(item) {
  if (!item || typeof item !== "object") return false;

  const slug = normalizeSlug(item.slug).toLowerCase();
  const title = normalizeText(item.judul ?? item.title);

  if (!slug || !title) return false;

  if (
    item.dihapusPada ||
    item.deletedAt ||
    item.deleted_at ||
    item.isDeleted === true ||
    item.is_deleted === true
  ) {
    return false;
  }

  const status = normalizeText(item.status).toLowerCase();

  if (
    status &&
    !["aktif", "publikasi", "dipublikasikan"].includes(status)
  ) {
    return false;
  }

  if (
    item.aktif === false ||
    item.isActive === false ||
    item.is_active === false
  ) {
    return false;
  }

  if (
    ["beranda", "home", "homepage", "articles", "artikel", "berita", "tentang"].includes(slug) ||
    ["beranda", "home", "tentang", "artikel"].includes(title.toLowerCase())
  ) {
    return false;
  }

  return true;
}

function unwrap(value) {
  let result = value;

  for (let i = 0; i < 8; i++) {
    if (
      !result ||
      typeof result !== "object" ||
      Array.isArray(result) ||
      !Object.prototype.hasOwnProperty.call(result, "data")
    ) {
      break;
    }

    result = result.data;
  }

  return result;
}

function getPageList(response) {
  const result = unwrap(response);

  if (Array.isArray(result)) return result;

  for (const key of [
    "daftarCms",
    "halamanCms",
    "halaman",
    "pages",
    "items",
  ]) {
    if (Array.isArray(result?.[key])) return result[key];
  }

  return [];
}

export default function PublicNavbar({
  sekolah = {},
  halaman = [],
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [halamanApi, setHalamanApi] = useState([]);
  const pathname = usePathname();
  const [pathnameTerakhir, setPathnameTerakhir] = useState(pathname);

  // Tutup menu mobile setiap kali rute berubah. Dilakukan saat render
  // (pola adjust state), bukan di dalam effect, agar tidak memicu
  // cascading render.
  if (pathname !== pathnameTerakhir) {
    setPathnameTerakhir(pathname);
    setOpen(false);
  }

  const subdomain = normalizeText(sekolah.subdomain);
  const base = subdomain ? `/${subdomain}` : "/";

  const ppdbBase = getPpdbBasePath(pathname);
  const diHalamanPpdb = ppdbBase !== null;
  const ppdbHome = `${ppdbBase}/PPDB`;

  useEffect(() => {
    let cancelled = false;

    async function loadPages() {
      if (!subdomain) return;

      try {
        const response = await publikService.getDaftarHalaman(subdomain);
        const pages = getPageList(response);

        if (!cancelled) {
          setHalamanApi(pages);
        }
      } catch (error) {
        console.error("[PublicNavbar] Gagal mengambil halaman CMS:", error);
      }
    }

    loadPages();

    return () => {
      cancelled = true;
    };
  }, [subdomain]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = useMemo(() => {
    // Di halaman PPDB, navbar sekolah yang sama berpindah konteks ke menu PPDB.
    if (diHalamanPpdb) {
      return [
        { label: "Beranda", href: ppdbHome, key: "ppdb-beranda" },
        {
          label: "Jalur Pendaftaran",
          href: `${ppdbHome}/jalurPendaftaran`,
          key: "ppdb-jalur",
        },
        {
          label: "Alur Pendaftaran",
          href: `${ppdbHome}/alurPendaftaran`,
          key: "ppdb-alur",
        },
        {
          label: "Pengumuman",
          href: `${ppdbHome}/pengumuman`,
          key: "ppdb-pengumuman",
        },
      ];
    }

    const combined = [
      ...(Array.isArray(halaman) ? halaman : []),
      ...halamanApi,
    ];

    const seen = new Set();

    const pages = combined
      .filter(isPageActive)
      .filter((item) => {
        const slug = normalizeSlug(item.slug).toLowerCase();

        if (seen.has(slug)) return false;

        seen.add(slug);
        return true;
      })
      .sort((a, b) => {
        const orderA = Number(a.urutan ?? a.order ?? 9999);
        const orderB = Number(b.urutan ?? b.order ?? 9999);
        return orderA - orderB;
      });

    return [
      { label: "Beranda", href: base, key: "home" },
      { label: "Tentang", href: `${base}/tentang`, key: "about" },
      { label: "Artikel", href: `${base}/articles`, key: "articles" },
      ...pages.map((item) => ({
        label: normalizeText(item.judul ?? item.title),
        href: `${base}/${normalizeSlug(item.slug)}`,
        key: `page-${item.id || item.slug}`,
      })),
    ];
  }, [halaman, halamanApi, base, diHalamanPpdb, ppdbHome]);

  const isActive = (href, isRoot) => {
    if (!pathname) return false;

    if (isRoot) {
      return pathname === href || pathname === `${href}/`;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const logo = normalizeText(sekolah.logoKecilUrl);
  const namaSekolah = normalizeText(sekolah.nama) || "Sekolah";
  const jenjang = normalizeText(sekolah.jenjang) || "Sekolah";
  const ppdbHref = `${base}/PPDB`;
  const ctaHref = diHalamanPpdb ? `${ppdbHome}/cek-pendaftaran` : ppdbHref;
  const ctaLabel = diHalamanPpdb ? "Cek Pendaftaran" : "Daftar PPDB";

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
          className="flex min-w-0 shrink items-center gap-3 rounded-lg"
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

        <nav
          className="hidden items-center gap-1 xl:flex"
          aria-label="Navigasi utama"
        >
          {menuItems.map((item, index) => {
            const active = isActive(item.href, index === 0);

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
            href={ctaHref}
            className="ml-2 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: "var(--warna-primer-utama, #2563EB)" }}
          >
            {ctaLabel}
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
            {menuItems.map((item, index) => {
              const active = isActive(item.href, index === 0);

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
              href={ctaHref}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: "var(--warna-primer-utama, #2563EB)" }}
            >
              {ctaLabel}
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
