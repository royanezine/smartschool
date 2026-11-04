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

function getPpdbBasePath(pathname) {
  if (!pathname || !pathname.startsWith("/")) return null;

  const match = pathname.match(/^\/([^/]+)\/PPDB(?:\/|$)/i);

  if (match) {
    return match[1].toLowerCase() === "ppdb" ? null : `/${match[1]}`;
  }

  if (/^\/PPDB(?:\/|$)/i.test(pathname)) return "";

  return null;
}

function isPageActive(item) {
  if (!item || typeof item !== "object") return false;

  const slug = normalizeSlug(item.slug).toLowerCase();
  const title = normalizeText(item.judul ?? item.title).toLowerCase();

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

  if (status && !["aktif", "publikasi", "dipublikasikan"].includes(status)) {
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
    [
      "beranda",
      "home",
      "homepage",
      "articles",
      "artikel",
      "berita",
      "tentang",
      "ppdb",
      "daftar-ppdb",
      "daftarppdb",
    ].includes(slug) ||
    ["beranda", "home", "tentang", "artikel", "ppdb", "daftar ppdb"].includes(
      title
    )
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

  for (const key of ["daftarCms", "halamanCms", "halaman", "pages", "items"]) {
    if (Array.isArray(result?.[key])) return result[key];
  }

  return [];
}

export default function PublicNavbar({ sekolah = {}, halaman = [] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [halamanApi, setHalamanApi] = useState([]);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();

  const subdomain = normalizeText(sekolah?.subdomain);
  const base = subdomain ? `/${subdomain}` : "/";
  const ppdbBase = getPpdbBasePath(pathname);
  const diHalamanPpdb = ppdbBase !== null;
  const ppdbHome = `${ppdbBase}/PPDB`;
  const cleanBase = base === "/" ? "" : base;
  const ppdbHref = `${cleanBase}/PPDB`;

  // Animasi mount pertama kali
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // Lock scroll saat mobile menu terbuka
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Mengambil halaman CMS
  useEffect(() => {
    let cancelled = false;

    async function loadPages() {
      if (!subdomain) return;

      try {
        const response = await publikService.getDaftarHalaman(subdomain);

        if (!cancelled) {
          setHalamanApi(getPageList(response));
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

  // Deteksi scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Menu navigasi
  const menuItems = useMemo(() => {
    const combined = [
      ...(Array.isArray(halaman) ? halaman : []),
      ...halamanApi,
    ];

    // PERBAIKAN: Gunakan Set untuk melacak ID dan Slug yang sudah dipakai
    const seenIds = new Set();
    const seenSlugs = new Set();

    const pages = combined
      .filter(isPageActive)
      .filter((item) => {
        const id = String(item.id || "").trim();
        const slug = normalizeSlug(item.slug).toLowerCase();

        // Cek duplikat berdasarkan ID (jika ada)
        if (id) {
          if (seenIds.has(id)) return false;
          seenIds.add(id);
        }

        // Cek duplikat berdasarkan Slug
        if (slug) {
          if (seenSlugs.has(slug)) return false;
          seenSlugs.add(slug);
        }

        return true;
      })
      .sort((a, b) => {
        const orderA = Number(a.urutan ?? a.order ?? 9999);
        const orderB = Number(b.urutan ?? b.order ?? 9999);

        return orderA - orderB;
      });

    const baseMenus = [
      {
        label: "Beranda",
        href: base,
        key: "home",
      },
      {
        label: "Tentang",
        href: `${base}/tentang`,
        key: "about",
      },
      {
        label: "Artikel",
        href: `${base}/articles`,
        key: "articles",
      },
      {
        label: "PPDB",
        href: ppdbHref,
        key: "ppdb",
      },
    ];

    const extraPages = pages
      .map((item, index) => ({
        label: normalizeText(item.judul ?? item.title),
        href: `${base}/${normalizeSlug(item.slug)}`,
        // PERBAIKAN: Pastikan key unik dengan fallback ke index/slug
        key: `page-${item.id || item.slug || index}`,
      }))
      .filter((page) => {
        const normLabel = page.label.toLowerCase();
        return (
          page.href !== ppdbHref &&
          normLabel !== "daftar ppdb" &&
          normLabel !== "ppdb"
        );
      });

    return [...baseMenus, ...extraPages];
  }, [halaman, halamanApi, base, ppdbHref]);

  // Deteksi menu aktif
  function isActive(href, isRoot) {
    if (!pathname) return false;

    if (isRoot) {
      return pathname === href || pathname === `${href}/`;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const logo = normalizeText(sekolah?.logoKecilUrl);
  const namaSekolah = normalizeText(sekolah?.nama) || "Sekolah";
  const jenjang = normalizeText(sekolah?.jenjang) || "Sekolah";

  const currentReturnPath = pathname || (cleanBase ? `/${cleanBase}` : "/");
  const ctaHref = `/login?redirect=${encodeURIComponent(currentReturnPath)}`;
  const ctaLabel = "Login";

  return (
    <div className="contents">
      {/* NAVBAR UTAMA */}
      <div
        className={`fixed inset-x-0 top-0 z-50 w-full px-3 transition-all duration-500 ease-out sm:px-6 ${
          mounted
            ? "translate-y-0 opacity-100"
            : "-translate-y-6 opacity-0"
        } ${scrolled ? "pt-2 sm:pt-3" : "pt-3 sm:pt-4"}`}
        style={{
          color: "var(--warna-netral-teks, #0F172A)",
        }}
      >
        <header
          className={`mx-auto flex w-full max-w-7xl items-center justify-between gap-3 border px-4 transition-all duration-500 ease-out sm:px-6 ${
            scrolled
              ? "rounded-xl py-2 shadow-lg backdrop-blur-md"
              : "rounded-2xl py-3 shadow-sm"
          }`}
          style={{
            backgroundColor: scrolled
              ? "rgba(255, 255, 255, 0.85)"
              : "var(--warna-netral-putih, #FFFFFF)",
            borderColor: scrolled
              ? "rgba(226, 232, 240, 0.8)"
              : "var(--warna-netral-garis, #E2E8F0)",
            boxShadow: scrolled
              ? "0 8px 32px rgba(15, 23, 42, 0.10)"
              : "0 2px 10px rgba(15, 23, 42, 0.025)",
            backdropFilter: scrolled
              ? "saturate(180%) blur(12px)"
              : "none",
            WebkitBackdropFilter: scrolled
              ? "saturate(180%) blur(12px)"
              : "none",
          }}
        >
          {/* LOGO DAN IDENTITAS SEKOLAH */}
          <Link
            href={base}
            className="group flex min-w-0 shrink items-center gap-3 rounded-lg transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
            aria-label={`Beranda ${namaSekolah}`}
          >
            {logo ? (
              <div
                className={`relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border p-1 transition-all duration-500 group-hover:rotate-3 group-hover:scale-105 sm:h-11 sm:w-11 ${
                  scrolled ? "shadow-sm" : ""
                }`}
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
                  className="object-contain p-1 transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ) : (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white transition-all duration-500 group-hover:rotate-3 group-hover:scale-105 sm:h-11 sm:w-11"
                style={{
                  backgroundColor: "var(--warna-primer-utama, #2563EB)",
                }}
              >
                {namaSekolah.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <p className="max-w-[180px] truncate text-sm font-bold tracking-tight transition-colors duration-300 sm:max-w-[280px] sm:text-base">
                {namaSekolah}
              </p>

              <p
                className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 sm:text-xs"
                style={{
                  color: "var(--warna-primer-utama, #2563EB)",
                }}
              >
                {jenjang}
              </p>
            </div>
          </Link>

          {/* NAVIGASI DESKTOP */}
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
                  className="group relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    color: active
                      ? "var(--warna-primer-utama, #2563EB)"
                      : "var(--warna-netral-teksLembut, #64748B)",
                    backgroundColor: active
                      ? "var(--warna-netral-latar, #F8FAFC)"
                      : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color =
                        "var(--warna-primer-utama, #2563EB)";

                      e.currentTarget.style.backgroundColor =
                        "var(--warna-netral-latar, #F8FAFC)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color =
                        "var(--warna-netral-teksLembut, #64748B)";

                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <span className="relative">
                    {item.label}

                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 rounded-full transition-all duration-300 ${
                        active
                          ? "w-full opacity-100"
                          : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                      }`}
                      style={{
                        backgroundColor:
                          "var(--warna-primer-utama, #2563EB)",
                      }}
                    />
                  </span>
                </Link>
              );
            })}

            {/* TOMBOL PPDB */}
            <Link
              href={ctaHref}
              className="group relative ml-2 inline-flex items-center gap-2 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
              style={{
                backgroundColor: "var(--warna-primer-utama, #2563EB)",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
              }}
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

              <span className="relative">{ctaLabel}</span>

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
                className="relative transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              >
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </Link>
          </nav>

          {/* TOMBOL MENU MOBILE */}
          <button
            type="button"
            className="group inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 xl:hidden"
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
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:rotate-90"
              >
                <path d="m18 6-12 12M6 6l12 12" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:scale-110"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </header>

        {/* NAVIGASI MOBILE */}
        <div
          className={`mx-auto w-full max-w-7xl xl:hidden ${
            open
              ? "pointer-events-auto mt-2 opacity-100"
              : "pointer-events-none -mt-2 opacity-0"
          } transition-all duration-300 ease-out`}
        >
          <nav
            id="public-mobile-navigation"
            aria-label="Navigasi mobile"
            className={`w-full rounded-2xl border p-3 shadow-xl transition-all duration-300 ${
              open
                ? "translate-y-0 scale-100"
                : "-translate-y-2 scale-[0.98]"
            }`}
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
                    className="rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:translate-x-1"
                    style={{
                      color: active
                        ? "var(--warna-primer-utama, #2563EB)"
                        : "var(--warna-netral-teks, #0F172A)",
                      backgroundColor: active
                        ? "var(--warna-netral-latar, #F8FAFC)"
                        : "transparent",
                      transitionDelay: open ? `${index * 40}ms` : "0ms",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div
                className="my-2 border-t"
                style={{
                  borderColor: "var(--warna-netral-garis, #E2E8F0)",
                }}
              />

              <Link
                href={ctaHref}
                onClick={() => setOpen(false)}
                className="group relative flex items-center justify-center overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:opacity-90 active:scale-95"
                style={{
                  backgroundColor: "var(--warna-primer-utama, #2563EB)",
                }}
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative">{ctaLabel}</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* BACKDROP MOBILE */}
        <div
          className={`fixed inset-0 -z-10 bg-black/20 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${
            open
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      </div>

      {/* SPACER KHUSUS HALAMAN PPDB */}
      {mounted && diHalamanPpdb && (
        <div
          aria-hidden="true"
          className="h-20 w-full sm:h-24"
        />
      )}
    </div>
  );
}