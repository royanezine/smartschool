"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Globe2,
  Menu,
  X,
  School,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/* =========================================================
   API BASE URL
========================================================= */

function getApiBaseUrl() {
  return API_URL
    .replace(/\/+$/, "")
    .replace(/\/api\/v1$/, "")
    .replace(/\/api$/, "");
}

/* =========================================================
   PAGE
========================================================= */

export default function PublicCmsPage() {
  const params = useParams();

  const subdomain = params?.slug;
  const pageSlug = params?.pageSlug;

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  /* =======================================================
     FETCH PAGE
  ======================================================= */

  useEffect(() => {
    if (!subdomain || !pageSlug) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchPage() {
      try {
        setLoading(true);
        setError("");
        setPage(null);

        const apiBaseUrl = getApiBaseUrl();

        const endpoint =
          `${apiBaseUrl}/api/v1/publik/` +
          `${encodeURIComponent(subdomain)}/halaman/` +
          `${encodeURIComponent(pageSlug)}`;

        console.log("=================================");
        console.log("PUBLIC CMS PAGE");
        console.log("SUBDOMAIN:", subdomain);
        console.log("PAGE SLUG:", pageSlug);
        console.log("ENDPOINT:", endpoint);
        console.log("=================================");

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const contentType =
          response.headers.get("content-type") || "";

        let result = null;

        if (contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();

          console.error(
            "Response bukan JSON:",
            text
          );

          throw new Error(
            `Response backend bukan JSON. Status: ${response.status}`
          );
        }

        console.log(
          "STATUS:",
          response.status
        );

        console.log(
          "RESULT:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              "Halaman tidak ditemukan."
          );
        }

        const data = result?.data ?? result;

        if (!data) {
          throw new Error(
            "Data halaman tidak ditemukan."
          );
        }

        if (!cancelled) {
          setPage(data);
        }
      } catch (err) {
        console.error(
          "Gagal mengambil halaman publik:",
          err
        );

        if (!cancelled) {
          setError(
            err?.message ||
              "Gagal mengambil halaman."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPage();

    return () => {
      cancelled = true;
    };
  }, [subdomain, pageSlug]);

  /* =======================================================
     TITLE
  ======================================================= */

  const title =
    page?.judul ||
    String(pageSlug || "Halaman")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC]">

        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-20 max-w-7xl items-center px-5 sm:px-6 lg:px-8">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <School size={20} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  SmartSchool
                </p>

                <p className="text-xs text-slate-400">
                  Website Resmi Sekolah
                </p>
              </div>

            </div>

          </div>
        </header>

        <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5">

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">

              <Loader2
                size={30}
                className="animate-spin text-blue-600"
              />

            </div>

            <h1 className="mt-5 text-lg font-bold text-slate-900">
              Memuat halaman...
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Mengambil konten halaman sekolah.
            </p>

          </div>

        </section>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !page) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-5">

        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">

            <AlertCircle
              size={28}
              className="text-red-500"
            />

          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Halaman Tidak Ditemukan
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error ||
              "Halaman yang kamu cari belum tersedia."}
          </p>

          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-left text-xs">

            <p className="text-slate-400">
              Subdomain
            </p>

            <p className="mt-1 font-semibold text-slate-700">
              {subdomain || "-"}
            </p>

            <p className="mt-3 text-slate-400">
              Slug
            </p>

            <p className="mt-1 font-semibold text-slate-700">
              {pageSlug || "-"}
            </p>

          </div>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft size={16} />
            Kembali ke Website
          </Link>

        </div>

      </main>
    );
  }

  /* =======================================================
     PAGE CONTENT
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

          {/* BRAND */}

          <Link
            href="/"
            className="flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <School size={22} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                SmartSchool
              </p>

              <p className="text-[11px] text-slate-400">
                Website Resmi Sekolah
              </p>
            </div>

          </Link>

          {/* DESKTOP NAV */}

          <nav className="hidden items-center gap-1 md:flex">

            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
            >
              Beranda
            </Link>

            <Link
              href="/tentang"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pageSlug === "tentang"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
              }`}
            >
              Tentang
            </Link>

            <Link
              href="/akademik"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pageSlug === "akademik"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
              }`}
            >
              Akademik
            </Link>

            <Link
              href="/articles"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
            >
              Artikel
            </Link>

            <Link
              href="/kontak"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pageSlug === "kontak"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
              }`}
            >
              Kontak
            </Link>

          </nav>

          {/* MOBILE */}

          <button
            type="button"
            onClick={() =>
              setMobileMenu(
                (current) => !current
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenu ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>

        </div>

        {mobileMenu && (
          <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">

            <nav className="flex flex-col gap-1">

              <Link
                href="/"
                onClick={() =>
                  setMobileMenu(false)
                }
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Beranda
              </Link>

              <Link
                href="/tentang"
                onClick={() =>
                  setMobileMenu(false)
                }
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Tentang
              </Link>

              <Link
                href="/akademik"
                onClick={() =>
                  setMobileMenu(false)
                }
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Akademik
              </Link>

              <Link
                href="/articles"
                onClick={() =>
                  setMobileMenu(false)
                }
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Artikel
              </Link>

              <Link
                href="/kontak"
                onClick={() =>
                  setMobileMenu(false)
                }
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Kontak
              </Link>

            </nav>

          </div>
        )}

      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-[#F8FAFC] to-indigo-50">

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>

          <div className="mt-8 max-w-4xl">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Informasi Sekolah
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              Informasi dan konten yang dipublikasikan
              melalui website sekolah.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          CMS CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-6 sm:px-8">

            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Konten CMS
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {page.judul || title}
            </h2>

          </div>

          <div className="px-6 py-8 sm:px-8 sm:py-10">

            {page.konten ? (
              <div
                className="
                  text-[15px]
                  leading-8
                  text-slate-700
                  sm:text-base

                  [&_p]:mb-5
                  [&_p:last-child]:mb-0

                  [&_h1]:mb-5
                  [&_h1]:text-3xl
                  [&_h1]:font-bold
                  [&_h1]:leading-tight
                  [&_h1]:text-slate-900

                  [&_h2]:mb-4
                  [&_h2]:mt-8
                  [&_h2]:text-2xl
                  [&_h2]:font-bold
                  [&_h2]:leading-tight
                  [&_h2]:text-slate-900

                  [&_h3]:mb-3
                  [&_h3]:mt-6
                  [&_h3]:text-xl
                  [&_h3]:font-bold
                  [&_h3]:text-slate-900

                  [&_ul]:mb-5
                  [&_ul]:list-disc
                  [&_ul]:pl-6

                  [&_ol]:mb-5
                  [&_ol]:list-decimal
                  [&_ol]:pl-6

                  [&_li]:mb-2

                  [&_strong]:font-bold
                  [&_strong]:text-slate-900

                  [&_a]:font-medium
                  [&_a]:text-blue-600
                  [&_a]:underline

                  [&_blockquote]:my-6
                  [&_blockquote]:border-l-4
                  [&_blockquote]:border-blue-500
                  [&_blockquote]:bg-blue-50
                  [&_blockquote]:px-5
                  [&_blockquote]:py-4

                  [&_img]:my-6
                  [&_img]:max-w-full
                  [&_img]:rounded-2xl

                  [&_table]:my-6
                  [&_table]:w-full
                  [&_table]:border-collapse

                  [&_th]:border
                  [&_th]:border-slate-200
                  [&_th]:bg-slate-50
                  [&_th]:px-4
                  [&_th]:py-3
                  [&_th]:text-left

                  [&_td]:border
                  [&_td]:border-slate-200
                  [&_td]:px-4
                  [&_td]:py-3
                "
                dangerouslySetInnerHTML={{
                  __html: page.konten,
                }}
              />
            ) : (
              <div className="py-10 text-center">

                <p className="text-sm text-slate-400">
                  Halaman ini belum memiliki konten.
                </p>

              </div>
            )}

          </div>

        </article>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-[#0F172A] px-5 py-10 text-white sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                <School size={20} />
              </div>

              <div>

                <p className="font-bold">
                  SmartSchool
                </p>

                <p className="text-xs text-slate-400">
                  Website Resmi Sekolah
                </p>

              </div>

            </div>

            <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">

              <Link
                href="/"
                className="text-slate-400 hover:text-white"
              >
                Beranda
              </Link>

              <Link
                href="/tentang"
                className="text-slate-400 hover:text-white"
              >
                Tentang
              </Link>

              <Link
                href="/akademik"
                className="text-slate-400 hover:text-white"
              >
                Akademik
              </Link>

              <Link
                href="/articles"
                className="text-slate-400 hover:text-white"
              >
                Artikel
              </Link>

              <Link
                href="/kontak"
                className="text-slate-400 hover:text-white"
              >
                Kontak
              </Link>

            </nav>

          </div>

          <div className="mt-8 border-t border-slate-800 pt-5">

            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} SmartSchool.
              All rights reserved.
            </p>

          </div>

        </div>

      </footer>

    </main>
  );
}