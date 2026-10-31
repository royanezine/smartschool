"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Layers3,
  DoorOpen,
  School,
  Boxes,
  Pencil,
  ChevronRight,
  Info,
  Users,
  Hash,
  Activity,
  PackagePlus,
  AlertCircle,
  Armchair,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  getGedung,
  getLantaiByGedung,
} from "@/services/infrastruktur.service";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";
const themePrimaryShadow =
  "shadow-[0_4px_14px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";
const themeCardShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeSoftSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

export default function DetailRuanganPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id; // Lantai ID
  const ruanganId = params?.ruanganId; // Ruangan ID

  const [lantai, setLantai] = useState(null);
  const [gedung, setGedung] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const gedungResult = await getGedung();
      if (!gedungResult?.success) return;

      const gedungList = Array.isArray(gedungResult.data) ? gedungResult.data : [];
      for (const item of gedungList) {
        const result = await getLantaiByGedung(item.id);
        if (!result?.success) continue;

        const lantaiList = Array.isArray(result.data) ? result.data : [];
        const found = lantaiList.find((l) => String(l.id) === String(id));
        if (found) {
          setLantai(found);
          setGedung(item);
          break;
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, loadData]);

  // Data ruangan representasi arsitektural (Backend API belum ada)
  const ruangan = {
    id: ruanganId,
    nama: `Ruangan ${ruanganId || ""}`.trim(),
    kode: "R-101",
    kapasitas: 36,
    status: "aktif",
    kelas: null, // Opsional: null jika ruang umum/lab
  };

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
                onClick={() => router.push("/admin/sarpras/gedung")}
                className="hover:text-[var(--color-primary)] transition"
              >
                Infrastruktur Gedung
              </button>
              <ChevronRight size={14} />
              <button
                type="button"
                onClick={() =>
                  router.push(`/admin/sarpras/gedung/lantai/detail/${id}`)
                }
                className="hover:text-[var(--color-primary)] transition truncate max-w-[150px]"
              >
                {lantai?.nama || "Lantai"}
              </button>
              <ChevronRight size={14} />
              <button
                type="button"
                onClick={() =>
                  router.push(`/admin/sarpras/gedung/lantai/${id}/ruangan`)
                }
                className="hover:text-[var(--color-primary)] transition"
              >
                Ruangan
              </button>
              <ChevronRight size={14} />
              <span className="theme-text font-semibold truncate max-w-[150px]">
                {ruangan.nama}
              </span>
            </nav>

            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/admin/sarpras/gedung/lantai/${id}/ruangan`)
                  }
                  className="mb-2 inline-flex items-center gap-2 text-sm font-medium theme-text-muted hover:text-[var(--color-primary)] transition"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Daftar Ruangan
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                    <DoorOpen size={24} />
                  </div>
                  <div>
                    <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                      {ruangan.nama}
                    </h1>
                    <p className="theme-text-muted text-xs sm:text-sm mt-0.5">
                      {gedung?.nama || "Gedung"} • {lantai?.nama || "Lantai"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/sarpras/gedung/lantai/${id}/ruangan/${ruanganId}/edit`
                    )
                  }
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} hover:brightness-95 transition-all`}
                >
                  <Pencil size={16} />
                  Edit Ruangan
                </button>
              </div>
            </div>

            {/* Top Quick Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow}`}>
                <div className="flex items-center justify-between">
                  <p className="theme-text-muted text-xs font-semibold uppercase tracking-wider">
                    Kapasitas Ruangan
                  </p>
                  <Users size={18} className="text-[var(--color-primary)]" />
                </div>
                <p className="theme-text text-2xl font-bold mt-2">
                  {ruangan.kapasitas} Siswa
                </p>
                <p className="theme-text-muted text-xs mt-0.5">Standar ruang belajar</p>
              </div>

              <div className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow}`}>
                <div className="flex items-center justify-between">
                  <p className="theme-text-muted text-xs font-semibold uppercase tracking-wider">
                    Status Operasional
                  </p>
                  <Activity size={18} className="theme-success" />
                </div>
                <p className="theme-text text-2xl font-bold mt-2 capitalize flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-success)]" />
                  {ruangan.status}
                </p>
                <p className="theme-text-muted text-xs mt-0.5">Siap digunakan untuk kegiatan</p>
              </div>

              <div className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow}`}>
                <div className="flex items-center justify-between">
                  <p className="theme-text-muted text-xs font-semibold uppercase tracking-wider">
                    Total Asset / Sarana
                  </p>
                  <Boxes size={18} className="text-[var(--color-warning)]" />
                </div>
                <p className="theme-text text-2xl font-bold mt-2">0 Unit</p>
                <p className="theme-text-muted text-xs mt-0.5">Menunggu alokasi inventaris</p>
              </div>
            </div>

            {/* Section 1: Informasi Ruangan */}
            <div className={`theme-card theme-border overflow-hidden rounded-2xl border ${themeCardShadow}`}>
              <div className={`theme-border border-b px-6 py-4 ${themeSoftSurface}`}>
                <h2 className="theme-text text-base font-semibold flex items-center gap-2">
                  <DoorOpen size={18} className="text-[var(--color-primary)]" />
                  Informasi Detail Ruangan
                </h2>
                <p className="theme-text-muted text-xs mt-0.5">
                  Atribut fisik ruangan dan lokasi penempatan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x theme-border">
                <div className="p-5 space-y-1">
                  <p className="theme-text-muted text-xs uppercase font-medium tracking-wider">
                    Nama Ruangan
                  </p>
                  <p className="theme-text text-sm font-bold">{ruangan.nama}</p>
                </div>

                <div className="p-5 space-y-1">
                  <p className="theme-text-muted text-xs uppercase font-medium tracking-wider">
                    Kode Ruangan
                  </p>
                  <p className="theme-text text-sm font-mono font-bold">
                    {ruangan.kode || "-"}
                  </p>
                </div>

                <div className="p-5 space-y-1">
                  <p className="theme-text-muted text-xs uppercase font-medium tracking-wider">
                    Lokasi Gedung
                  </p>
                  <p className="theme-text text-sm font-bold">{gedung?.nama || "-"}</p>
                </div>

                <div className="p-5 space-y-1">
                  <p className="theme-text-muted text-xs uppercase font-medium tracking-wider">
                    Posisi Lantai
                  </p>
                  <p className="theme-text text-sm font-bold">{lantai?.nama || "-"}</p>
                </div>

                <div className="p-5 space-y-1">
                  <p className="theme-text-muted text-xs uppercase font-medium tracking-wider">
                    Daya Tampung
                  </p>
                  <p className="theme-text text-sm font-bold">
                    {ruangan.kapasitas} Kursi / Siswa
                  </p>
                </div>

                <div className="p-5 space-y-1">
                  <p className="theme-text-muted text-xs uppercase font-medium tracking-wider">
                    Status
                  </p>
                  <p className="theme-text text-sm font-bold capitalize">
                    {ruangan.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Kelas yang Terhubung */}
            <div className={`theme-card theme-border overflow-hidden rounded-2xl border ${themeCardShadow}`}>
              <div className={`theme-border flex items-center justify-between border-b px-6 py-4 ${themeSoftSurface}`}>
                <div>
                  <h2 className="theme-text text-base font-semibold flex items-center gap-2">
                    <School size={18} className="text-[var(--color-primary)]" />
                    Kelas yang Terhubung
                  </h2>
                  <p className="theme-text-muted text-xs mt-0.5">
                    Hubungan opsional 1 Ruangan ke 1 Kelas.
                  </p>
                </div>
              </div>

              <div className="p-6">
                {ruangan.kelas ? (
                  <div className="flex items-center justify-between p-4 rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-success)_6%,transparent)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-success)] text-[var(--color-card)] font-bold">
                        <School size={20} />
                      </div>
                      <div>
                        <p className="theme-text font-bold text-sm">{ruangan.kelas.nama}</p>
                        <p className="theme-text-muted text-xs">Tingkat {ruangan.kelas.tingkat}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${themeSoftSurface} text-[var(--color-info)]`}>
                      <School size={22} />
                    </div>
                    <h3 className="theme-text text-sm font-bold mt-3">
                      Belum Ada Kelas Terhubung
                    </h3>
                    <p className="theme-text-muted text-xs max-w-sm mx-auto mt-1 leading-relaxed">
                      Ruangan ini saat ini tidak ditetapkan secara khusus untuk satu kelas, dan dapat difungsikan sebagai ruang umum, ruang guru, atau laboratorium.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Asset & Inventaris Ruangan */}
            <div className={`theme-card theme-border overflow-hidden rounded-2xl border ${themeCardShadow}`}>
              <div className={`theme-border flex items-center justify-between border-b px-6 py-4 ${themeSoftSurface}`}>
                <div>
                  <h2 className="theme-text text-base font-semibold flex items-center gap-2">
                    <Boxes size={18} className="text-[var(--color-primary)]" />
                    Asset & Inventaris Ruangan
                  </h2>
                  <p className="theme-text-muted text-xs mt-0.5">
                    Sarana fisik teralokasi: Meja, Kursi, Papan Tulis, dan perlengkapan lainnya.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/admin/sarpras/iventaris")}
                  className="text-xs font-semibold theme-text-secondary hover:text-[var(--color-primary)] transition"
                >
                  Buka Master Aset →
                </button>
              </div>

              {/* Asset Category Breakdown Preview */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-center">
                    <Armchair size={20} className="mx-auto text-[var(--color-primary)]" />
                    <p className="theme-text text-lg font-bold mt-2">0</p>
                    <p className="theme-text-muted text-xs font-medium">Meja Siswa/Guru</p>
                  </div>

                  <div className="p-4 rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-center">
                    <Armchair size={20} className="mx-auto text-[var(--color-info)]" />
                    <p className="theme-text text-lg font-bold mt-2">0</p>
                    <p className="theme-text-muted text-xs font-medium">Kursi Siswa/Guru</p>
                  </div>

                  <div className="p-4 rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-center">
                    <Boxes size={20} className="mx-auto text-[var(--color-warning)]" />
                    <p className="theme-text text-lg font-bold mt-2">0</p>
                    <p className="theme-text-muted text-xs font-medium">Papan Tulis / Screen</p>
                  </div>

                  <div className="p-4 rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-center">
                    <PackagePlus size={20} className="mx-auto text-[var(--color-success)]" />
                    <p className="theme-text text-lg font-bold mt-2">0</p>
                    <p className="theme-text-muted text-xs font-medium">Asset Lainnya</p>
                  </div>
                </div>

                {/* Empty State for Assets */}
                <div className="rounded-xl border border-dashed theme-border p-8 text-center bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]">
                  <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${themeSoftSurface} text-[var(--color-warning)]`}>
                    <Boxes size={22} />
                  </div>
                  <h3 className="theme-text text-sm font-bold mt-3">
                    Belum Ada Asset Terhubung ke Ruangan Ini
                  </h3>
                  <p className="theme-text-muted text-xs max-w-md mx-auto mt-1 leading-relaxed">
                    Relasi spesifik `Ruangan → Aset` (foreign key `ruanganId` pada tabel Aset) belum tersedia pada skema Backend. Saat ini penempatan fisik aset diisi melalui kolom teks manual di modul Inventaris Sarpras.
                  </p>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => router.push("/admin/sarpras/iventaris")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold theme-text border theme-border hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] transition"
                    >
                      Kelola Inventaris Sarpras
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
