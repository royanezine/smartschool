"use client";

import { Megaphone, Info } from "lucide-react";

import PpdbNavbar from "@/app/components/ppdb/PpdbNavbar";

/*
 * Backend belum memiliki model/route pengumuman PPDB. Halaman ini
 * menampilkan empty state yang jujur, bukan daftar pengumuman contoh.
 */
export const PENGUMUMAN_PPDB_UNAVAILABLE =
  "Belum ada pengumuman yang dapat ditampilkan. Backend belum " +
  "menyediakan endpoint pengumuman PPDB, sehingga pengumuman resmi " +
  "akan tampil di sini setelah fitur tersebut tersedia.";

export default function PpdbPengumuman() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PpdbNavbar />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
            <Megaphone size={13} />
            Pengumuman PPDB
          </div>

          <h1 className="mt-3 text-xl font-semibold text-slate-800 sm:text-2xl">
            Pengumuman
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Informasi resmi seputar jadwal, berkas,
            dan hasil seleksi PPDB akan diumumkan
            melalui halaman ini.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
          <div className="flex-shrink-0 rounded-lg bg-amber-100 p-1.5 text-amber-700">
            <Info size={16} />
          </div>

          <div>
            <p className="text-sm font-semibold text-amber-900">
              Fitur pengumuman belum tersedia
            </p>

            <p className="mt-1 text-xs leading-relaxed text-amber-800">
              {PENGUMUMAN_PPDB_UNAVAILABLE}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Megaphone size={28} />
          </div>

          <h2 className="mt-4 text-base font-semibold text-slate-800">
            Belum ada pengumuman
          </h2>

          <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-slate-500">
            Silakan kembali lagi nanti. Pengumuman
            akan ditampilkan setelah tersedia di
            sistem.
          </p>
        </div>
      </div>
    </div>
  );
}
