"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Newspaper,
  Tag,
  School,
  Loader2,
  AlertCircle,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SUBDOMAIN = "smart";

export default function DetailArtikelPage() {
  const params = useParams();
  const id = params?.id;

  const [artikel, setArtikel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchArtikel = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/v1/publik/${SUBDOMAIN}/artikel`
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil data artikel.");
        }

        const result = await response.json();

        const daftarArtikel = result?.data || [];

        const foundArtikel = daftarArtikel.find(
          (item) => String(item.id) === String(id)
        );

        if (!foundArtikel) {
          throw new Error("Artikel tidak ditemukan.");
        }

        setArtikel(foundArtikel);
      } catch (err) {
        console.error("Error detail artikel:", err);
        setError(err.message || "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtikel();
  }, [id]);

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />

          <p className="text-sm text-slate-500">
            Memuat artikel...
          </p>
        </div>
      </main>
    );
  }

  if (error || !artikel) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>

          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Artikel Tidak Ditemukan
          </h1>

          <p className="text-sm text-slate-500 mb-6">
            {error || "Artikel yang kamu cari tidak tersedia."}
          </p>

          <Link
            href="/website/articles"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Artikel
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/website"
              className="flex items-center gap-3"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center">
                <School className="w-6 h-6 text-white" />
              </div>

              <div>
                <h1 className="font-bold text-slate-900 leading-tight">
                  Smart School
                </h1>

                <p className="text-xs text-slate-500">
                  Sekolah Digital
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/website"
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition"
              >
                Beranda
              </Link>

              <Link
                href="/website/tentang"
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition"
              >
                Tentang
              </Link>

              <Link
                href="/website/akademik"
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition"
              >
                Akademik
              </Link>

              <Link
                href="/website/artikel"
                className="text-sm font-semibold text-blue-600"
              >
                Artikel
              </Link>

              <Link
                href="/website/kontak"
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition"
              >
                Kontak
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <section className="py-10 lg:py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link
              href="/website"
              className="hover:text-blue-600 transition"
            >
              Beranda
            </Link>

            <span>/</span>

            <Link
              href="/website/artikel"
              className="hover:text-blue-600 transition"
            >
              Artikel
            </Link>

            <span>/</span>

            <span className="text-slate-700 truncate max-w-[200px]">
              {artikel.judul}
            </span>
          </div>

          {/* Back */}
          <Link
            href="/website/articles"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke semua artikel
          </Link>

          {/* Article */}
          <article className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">

            {/* Featured Image */}
            {artikel.gambarUtama ? (
              <div className="w-full aspect-[16/8] bg-slate-100 overflow-hidden">
                <img
                  src={artikel.gambarUtama}
                  alt={artikel.judul}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full aspect-[16/6] bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                <Newspaper className="w-20 h-20 text-blue-200" />
              </div>
            )}

            {/* Article Body */}
            <div className="p-6 sm:p-8 lg:p-12">

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6">

                {artikel.kategoriArtikel && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                    <Tag className="w-3.5 h-3.5" />

                    {artikel.kategoriArtikel.nama}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays className="w-4 h-4" />

                  {formatTanggal(
                    artikel.dibuatPada || artikel.createdAt
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-slate-900 mb-6">
                {artikel.judul}
              </h1>

              {/* Ringkasan */}
              {artikel.ringkasan && (
                <div className="border-l-4 border-blue-600 bg-blue-50/50 px-5 py-4 mb-8">
                  <p className="text-base sm:text-lg leading-relaxed text-slate-600">
                    {artikel.ringkasan}
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-slate-200 mb-8" />

              {/* Content */}
              <div className="text-slate-700 text-base sm:text-lg leading-8 whitespace-pre-line">
                {artikel.konten || "Konten artikel belum tersedia."}
              </div>

              {/* Bottom */}
              <div className="mt-12 pt-8 border-t border-slate-200">
                <Link
                  href="/website/artikel"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Lihat Artikel Lainnya
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-white mt-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">

          <div className="grid md:grid-cols-3 gap-10">

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <School className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="font-bold">
                    Smart School
                  </h3>

                  <p className="text-xs text-slate-400">
                    Sekolah Digital
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-400 leading-6">
                Platform informasi dan layanan digital sekolah
                untuk mendukung pembelajaran yang modern,
                terintegrasi, dan mudah diakses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">
                Navigasi
              </h3>

              <div className="space-y-3 text-sm text-slate-400">
                <Link
                  href="/website"
                  className="block hover:text-white transition"
                >
                  Beranda
                </Link>

                <Link
                  href="/website/tentang"
                  className="block hover:text-white transition"
                >
                  Tentang
                </Link>

                <Link
                  href="/website/akademik"
                  className="block hover:text-white transition"
                >
                  Akademik
                </Link>

                <Link
                  href="/website/artikel"
                  className="block hover:text-white transition"
                >
                  Artikel
                </Link>

                <Link
                  href="/website/kontak"
                  className="block hover:text-white transition"
                >
                  Kontak
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">
                Informasi
              </h3>

              <p className="text-sm text-slate-400 leading-6">
                Dapatkan informasi terbaru mengenai kegiatan,
                pengumuman, dan berita sekolah melalui halaman
                artikel kami.
              </p>
            </div>

          </div>

          <div className="border-t border-slate-800 mt-10 pt-6 text-center">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Smart School. All rights reserved.
            </p>
          </div>

        </div>
      </footer>
    </main>
  );
}