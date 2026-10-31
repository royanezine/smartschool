"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Layers3,
  DoorOpen,
  School,
  Pencil,
  Info,
  ChevronRight,
  Boxes,
  Users,
  Hash,
  AlertCircle,
  Armchair,
  Table,
  Presentation,
  PackageOpen,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";
const themePrimaryShadow =
  "shadow-[0_4px_14px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";
const themeCardShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeSoftSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]";

export default function GlobalDetailRuanganPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  // Ruangan data placeholder state
  const [ruangan, setRuangan] = useState({
    id: id,
    nama: `Ruangan ${id || ""}`.trim(),
    kode: "R-101",
    gedung: "Gedung Utama",
    lantai: "Lantai 1",
    kapasitas: 36,
    status: "aktif",
    kelas: null, // null = Belum ada kelas
    asetCount: {
      meja: 0,
      kursi: 0,
      papanTulis: 0,
      lainnya: 0,
    },
  });

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={false}
        setCollapsed={() => {}}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={() => {}}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 min-w-0">
            {/* Breadcrumb Navigation */}
            <nav className="flex flex-wrap items-center gap-2 text-xs font-medium theme-text-muted">
              <button
                type="button"
                onClick={() => router.push("/admin/sarpras/ruangan")}
                className="hover:text-[var(--color-primary)] transition"
              >
                Pengelolaan Ruangan
              </button>
              <ChevronRight size={14} />
              <span className="theme-text font-semibold truncate max-w-[200px]">
                {ruangan.nama}
              </span>
            </nav>

            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <button
                  type="button"
                  onClick={() => router.push("/admin/sarpras/ruangan")}
                  className="mb-2 inline-flex items-center gap-2 text-sm font-medium theme-text-muted hover:text-[var(--color-primary)] transition"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Daftar Ruangan
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                    <DoorOpen size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                        {ruangan.nama}
                      </h1>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          ruangan.status === "aktif"
                            ? "bg-[color-mix(in_srgb,var(--color-success)_15%,transparent)] theme-success"
                            : ruangan.status === "perbaikan"
                            ? "bg-[color-mix(in_srgb,var(--color-warning)_15%,transparent)] text-[var(--color-warning)]"
                            : "bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)] theme-text-muted"
                        }`}
                      >
                        {ruangan.status}
                      </span>
                    </div>
                    <p className="theme-text-muted text-xs sm:text-sm mt-0.5">
                      Informasi fisik, alokasi kelas, dan keterhubungan aset ruangan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/admin/sarpras/ruangan/${id}/edit`)
                  }
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} hover:brightness-95 transition-all`}
                >
                  <Pencil size={15} />
                  <span>Edit Ruangan</span>
                </button>
              </div>
            </div>

            {/* Backend Gap / Architecture Status Notice */}
            <div className="flex items-start gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--color-info)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_6%,transparent)] p-4 sm:p-5 text-sm theme-info">
              <Info size={20} className="shrink-0 mt-0.5 text-[var(--color-info)]" />
              <div className="space-y-1">
                <p className="font-semibold text-sm">Pratinjau Struktur Detail Ruangan</p>
                <p className="text-xs leading-relaxed opacity-95">
                  Halaman ini menampilkan rancangan struktur detail ruangan sesuai hierarki:
                  <strong> Gedung └── Lantai └── Ruangan ├── Kelas (opsional) └── Asset/Inventaris</strong>.
                  Data spesifik ruangan dan relasi aset saat ini menunggu implementasi endpoint Backend (Backend Gap).
                </p>
              </div>
            </div>

            {/* Section 1: Informasi Ruangan */}
            <div className={`theme-card theme-border rounded-2xl border p-5 sm:p-6 ${themeCardShadow} space-y-4`}>
              <div className="flex items-center justify-between pb-3 border-b theme-border">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                    <DoorOpen size={18} />
                  </div>
                  <h2 className="theme-text text-base font-bold">
                    Informasi Detail Ruangan
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] border theme-border space-y-1">
                  <span className="theme-text-muted text-xs flex items-center gap-1.5 font-medium">
                    <DoorOpen size={14} className="text-[var(--color-primary)]" />
                    Nama Ruangan
                  </span>
                  <p className="theme-text font-semibold text-sm sm:text-base">
                    {ruangan.nama}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] border theme-border space-y-1">
                  <span className="theme-text-muted text-xs flex items-center gap-1.5 font-medium">
                    <Hash size={14} className="text-[var(--color-primary)]" />
                    Kode Ruangan
                  </span>
                  <p className="theme-text font-mono font-semibold text-sm sm:text-base">
                    {ruangan.kode || "-"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] border theme-border space-y-1">
                  <span className="theme-text-muted text-xs flex items-center gap-1.5 font-medium">
                    <Building2 size={14} className="text-[var(--color-primary)]" />
                    Gedung
                  </span>
                  <p className="theme-text font-semibold text-sm sm:text-base">
                    {ruangan.gedung}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] border theme-border space-y-1">
                  <span className="theme-text-muted text-xs flex items-center gap-1.5 font-medium">
                    <Layers3 size={14} className="text-[var(--color-primary)]" />
                    Lantai
                  </span>
                  <p className="theme-text font-semibold text-sm sm:text-base">
                    {ruangan.lantai}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] border theme-border space-y-1">
                  <span className="theme-text-muted text-xs flex items-center gap-1.5 font-medium">
                    <Users size={14} className="text-[var(--color-primary)]" />
                    Kapasitas Ruangan
                  </span>
                  <p className="theme-text font-semibold text-sm sm:text-base">
                    {ruangan.kapasitas} Orang / Siswa
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] border theme-border space-y-1">
                  <span className="theme-text-muted text-xs flex items-center gap-1.5 font-medium">
                    Status Ruangan
                  </span>
                  <p className="theme-text font-semibold text-sm sm:text-base capitalize">
                    {ruangan.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Kelas yang Terhubung */}
            <div className={`theme-card theme-border rounded-2xl border p-5 sm:p-6 ${themeCardShadow} space-y-4`}>
              <div className="flex items-center justify-between pb-3 border-b theme-border">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                    <School size={18} />
                  </div>
                  <div>
                    <h2 className="theme-text text-base font-bold">
                      Kelas yang Terhubung
                    </h2>
                    <p className="theme-text-muted text-xs mt-0.5">
                      Ruangan boleh terhubung ke rombel kelas atau difungsikan sebagai ruang umum/lab.
                    </p>
                  </div>
                </div>
              </div>

              {ruangan.kelas ? (
                <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] border theme-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <School size={20} className="text-[var(--color-primary)]" />
                    <div>
                      <p className="theme-text font-bold text-sm">
                        {ruangan.kelas.nama}
                      </p>
                      <p className="theme-text-muted text-xs">
                        Tingkat: {ruangan.kelas.tingkat}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed theme-border text-center space-y-2">
                  <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${themeSoftSurface} theme-text-muted`}>
                    <School size={20} />
                  </div>
                  <h3 className="theme-text text-sm font-semibold">
                    Belum Ada Kelas Terhubung
                  </h3>
                  <p className="theme-text-muted text-xs max-w-sm mx-auto">
                    Ruangan ini belum dialokasikan untuk kelas tertentu (dapat digunakan sebagai ruang praktikum, ruang guru, atau ruang umum).
                  </p>
                </div>
              )}
            </div>

            {/* Section 3: Asset/Inventaris Ruangan */}
            <div className={`theme-card theme-border rounded-2xl border p-5 sm:p-6 ${themeCardShadow} space-y-5`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b theme-border gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                    <Boxes size={18} />
                  </div>
                  <div>
                    <h2 className="theme-text text-base font-bold">
                      Asset & Inventaris Ruangan
                    </h2>
                    <p className="theme-text-muted text-xs mt-0.5">
                      Sarana fisik teralokasi: Meja, Kursi, Papan Tulis, dan perlengkapan lainnya.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/admin/sarpras/iventaris")}
                  className="text-xs font-semibold theme-text-secondary hover:text-[var(--color-primary)] transition"
                >
                  Buka Master Aset →
                </button>
              </div>

              {/* Asset Category Badges / Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                    <Table size={18} />
                  </div>
                  <div>
                    <p className="theme-text font-bold text-base leading-none">
                      {ruangan.asetCount.meja}
                    </p>
                    <p className="theme-text-muted text-[11px] mt-1">
                      Meja Siswa/Guru
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                    <Armchair size={18} />
                  </div>
                  <div>
                    <p className="theme-text font-bold text-base leading-none">
                      {ruangan.asetCount.kursi}
                    </p>
                    <p className="theme-text-muted text-[11px] mt-1">
                      Kursi Siswa/Guru
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                    <Presentation size={18} />
                  </div>
                  <div>
                    <p className="theme-text font-bold text-base leading-none">
                      {ruangan.asetCount.papanTulis}
                    </p>
                    <p className="theme-text-muted text-[11px] mt-1">
                      Papan Tulis / Screen
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                    <PackageOpen size={18} />
                  </div>
                  <div>
                    <p className="theme-text font-bold text-base leading-none">
                      {ruangan.asetCount.lainnya}
                    </p>
                    <p className="theme-text-muted text-[11px] mt-1">
                      Asset Lainnya
                    </p>
                  </div>
                </div>
              </div>

              {/* Empty state informatif for Asset */}
              <div className="p-8 rounded-xl border border-dashed theme-border text-center space-y-3">
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${themeSoftSurface} theme-text-muted`}>
                  <Boxes size={24} />
                </div>
                <h3 className="theme-text text-sm font-semibold">
                  Belum Ada Asset Terhubung ke Ruangan Ini
                </h3>
                <p className="theme-text-muted text-xs max-w-md mx-auto leading-relaxed">
                  Relasi spesifik <code className="px-1.5 py-0.5 rounded bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] font-mono text-[11px]">Ruangan → Aset</code> (foreign key <code className="font-mono text-[11px]">ruanganId</code> pada tabel Aset) belum tersedia pada skema Backend. Saat ini penempatan fisik aset diisi melalui kolom teks manual di modul Inventaris Sarpras.
                </p>
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/sarpras/iventaris")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold theme-text-secondary border theme-border hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] transition"
                  >
                    Kelola Inventaris Sarpras
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/admin/sarpras/ruangan")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold theme-text-secondary border theme-border hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] transition"
              >
                <ArrowLeft size={16} />
                <span>Kembali ke Daftar Ruangan</span>
              </button>

              <button
                type="button"
                onClick={() => router.push(`/admin/sarpras/ruangan/${id}/edit`)}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} hover:brightness-95 transition-all`}
              >
                <Pencil size={15} />
                <span>Edit Ruangan</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
