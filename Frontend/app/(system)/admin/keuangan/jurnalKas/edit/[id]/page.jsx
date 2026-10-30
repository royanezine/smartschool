"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  FileText,
  Plus,
  Ban,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

export default function EditJurnalKasPage() {
  const params = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="jurnalKas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setIsCollapsed((prev) => !prev)}
        />

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[800px] px-4 py-10 sm:px-6">
            <div className="theme-card overflow-hidden rounded-2xl border p-8 shadow-sm text-center">
              <div className="theme-info mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
                <AlertCircle size={28} />
              </div>

              <h1 className="theme-text mt-5 text-xl font-bold">
                Jurnal Kas Bersifat Immutable (Tetap)
              </h1>

              <p className="theme-text-secondary mt-3 text-sm leading-relaxed">
                Sesuai standar akuntansi keuangan sekolah, entri jurnal kas yang
                telah dibukukan tidak dapat disunting secara langsung untuk
                menjaga integritas saldo akun kas dan audit trail.
              </p>

              <p className="theme-text-muted mt-2 text-xs leading-relaxed">
                Jika terdapat kekeliruan pencatatan, silakan lakukan pembatalan
                transaksi melalui halaman detail, kemudian buat transaksi baru
                dengan data yang benar.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/admin/keuangan/jurnalKas/detail/${params?.id || ""}`}
                  className="theme-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition"
                >
                  <Ban size={16} />
                  Lihat Detail & Batalkan
                </Link>

                <Link
                  href="/admin/keuangan/jurnalKas/tambah"
                  className="theme-input inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition"
                >
                  <Plus size={16} />
                  Buat Transaksi Baru
                </Link>

                <Link
                  href="/admin/keuangan/jurnalKas"
                  className="theme-text-muted inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:text-[var(--color-primary)]"
                >
                  <ArrowLeft size={16} />
                  Kembali
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
