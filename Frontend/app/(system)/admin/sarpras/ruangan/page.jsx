"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DoorOpen,
  Plus,
  Search,
  Filter,
  Building2,
  Layers3,
  School,
  Boxes,
  Eye,
  Pencil,
  ArrowUpDown,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertCircle,
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
  "bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]";

export default function GlobalRuanganPage() {
  const router = useRouter();

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGedung, setSelectedGedung] = useState("");
  const [selectedLantai, setSelectedLantai] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Context data from Backend (real data)
  const [gedungList, setGedungList] = useState([]);
  const [lantaiList, setLantaiList] = useState([]);
  const [loadingContext, setLoadingContext] = useState(true);

  // Ruangan list state (Strictly honest: no fake business data)
  const [ruanganList, setRuanganList] = useState([]);
  const [loadingRuangan, setLoadingRuangan] = useState(false);

  // Load real Gedung from Backend
  const loadGedung = useCallback(async () => {
    try {
      setLoadingContext(true);
      const res = await getGedung();
      if (res?.success && Array.isArray(res.data)) {
        setGedungList(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingContext(false);
    }
  }, []);

  // Load Lantai when Gedung changes
  const loadLantai = useCallback(
    async (gedungId) => {
      if (!gedungId) {
        setLantaiList([]);
        setSelectedLantai("");
        return;
      }

      // Check if found in gedungList with nested lantai
      const foundGedung = gedungList.find(
        (g) => String(g.id) === String(gedungId)
      );
      if (
        foundGedung?.lantai &&
        Array.isArray(foundGedung.lantai) &&
        foundGedung.lantai.length > 0
      ) {
        setLantaiList(foundGedung.lantai);
        return;
      }

      try {
        const res = await getLantaiByGedung(gedungId);
        if (res?.success && Array.isArray(res.data)) {
          setLantaiList(res.data);
        } else {
          setLantaiList([]);
        }
      } catch (err) {
        console.error(err);
        setLantaiList([]);
      }
    },
    [gedungList]
  );

  useEffect(() => {
    loadGedung();
  }, [loadGedung]);

  useEffect(() => {
    if (selectedGedung) {
      loadLantai(selectedGedung);
    } else {
      setLantaiList([]);
      setSelectedLantai("");
    }
  }, [selectedGedung, loadLantai]);

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedGedung("");
    setSelectedLantai("");
    setStatusFilter("");
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
            {/* Top Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                    <DoorOpen size={24} />
                  </div>
                  <div>
                    <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                      Pengelolaan Ruangan
                    </h1>
                    <p className="theme-text-muted text-xs sm:text-sm mt-0.5">
                      Kelola data seluruh ruangan sekolah, pantau alokasi kelas, dan keterhubungan aset secara terpusat.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => router.push("/admin/sarpras/ruangan/tambah")}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} hover:brightness-95 transition-all`}
                >
                  <Plus size={16} />
                  <span>Tambah Ruangan</span>
                </button>
              </div>
            </div>

            {/* Backend Gap / Architecture Status Notice */}
            <div className="flex items-start gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--color-info)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_6%,transparent)] p-4 sm:p-5 text-sm theme-info">
              <Info size={20} className="shrink-0 mt-0.5 text-[var(--color-info)]" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Status Modul Pengelolaan Ruangan</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--color-info)_15%,transparent)]">
                    UI Ready / Menunggu Endpoint Backend
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-95">
                  Hierarki arsitektur: <strong className="font-semibold">Gedung └── Lantai └── Ruangan ├── Kelas (opsional) └── Asset/Inventaris</strong>.
                  Tampilan CRUD frontend telah disiapkan dalam bentuk full-page tanpa dummy data palsu. Saat ini endpoint Backend CRUD Ruangan belum tersedia di database.
                </p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className={`theme-card theme-border rounded-2xl border p-4 sm:p-5 ${themeCardShadow} space-y-4`}>
              <div className="flex items-center justify-between pb-3 border-b theme-border">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-[var(--color-primary)]" />
                  <span className="theme-text text-sm font-semibold">
                    Filter & Pencarian Ruangan
                  </span>
                </div>
                {(searchTerm || selectedGedung || selectedLantai || statusFilter) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold theme-text-muted hover:text-[var(--color-primary)] transition"
                  >
                    <RefreshCw size={13} />
                    Reset Filter
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search Term */}
                <div className="relative">
                  <Search
                    size={16}
                    className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama atau kode ruangan..."
                    className="theme-input w-full rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm focus:border-[var(--color-primary)]"
                  />
                </div>

                {/* Filter Gedung */}
                <div className="relative">
                  <Building2
                    size={15}
                    className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                  <select
                    value={selectedGedung}
                    onChange={(e) => setSelectedGedung(e.target.value)}
                    className="theme-input w-full rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm appearance-none focus:border-[var(--color-primary)]"
                  >
                    <option value="">Semua Gedung</option>
                    {gedungList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nama} {g.kode ? `(${g.kode})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Lantai */}
                <div className="relative">
                  <Layers3
                    size={15}
                    className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                  <select
                    value={selectedLantai}
                    onChange={(e) => setSelectedLantai(e.target.value)}
                    disabled={!selectedGedung || lantaiList.length === 0}
                    className="theme-input w-full rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm appearance-none focus:border-[var(--color-primary)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!selectedGedung
                        ? "Pilih Gedung Dahulu"
                        : lantaiList.length === 0
                        ? "Tidak ada lantai"
                        : "Semua Lantai"}
                    </option>
                    {lantaiList.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Status */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="theme-input w-full rounded-xl px-4 py-2 text-xs sm:text-sm appearance-none focus:border-[var(--color-primary)]"
                  >
                    <option value="">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="perbaikan">Dalam Perbaikan</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className={`theme-card theme-border rounded-2xl border overflow-hidden ${themeCardShadow}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 sm:px-6 py-4 border-b theme-border gap-2">
                <div className="flex items-center gap-2.5">
                  <h2 className="theme-text text-base font-bold">
                    Daftar Ruangan Sekolah
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                    {ruanganList.length} Ruangan
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs theme-text-muted">
                  <School size={14} />
                  <span>
                    Infrastruktur Terintegrasi Gedung & Lantai
                  </span>
                </div>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse text-left">
                  <thead>
                    <tr className={`theme-border border-b ${themeSoftSurface}`}>
                      <th className="theme-text-muted px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] w-12 text-center">
                        NO
                      </th>
                      <th className="theme-text-muted px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em]">
                        NAMA RUANGAN
                      </th>
                      <th className="theme-text-muted px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em]">
                        KODE
                      </th>
                      <th className="theme-text-muted px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em]">
                        GEDUNG
                      </th>
                      <th className="theme-text-muted px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em]">
                        LANTAI
                      </th>
                      <th className="theme-text-muted px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em]">
                        KELAS
                      </th>
                      <th className="theme-text-muted px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em]">
                        JUMLAH ASSET
                      </th>
                      <th className="theme-text-muted px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em]">
                        STATUS
                      </th>
                      <th className="theme-text-muted px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-right">
                        AKSI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ruanganList.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-16 text-center">
                          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${themeSoftSurface} text-[var(--color-primary)]`}>
                            <DoorOpen size={32} />
                          </div>
                          <h3 className="theme-text text-base font-semibold mt-4">
                            Belum Ada Data Ruangan
                          </h3>
                          <p className="theme-text-muted text-xs max-w-md mx-auto mt-1.5 leading-relaxed">
                            Data ruangan sekolah belum terdaftar di database. Sistem saat ini menunggu ketersediaan endpoint Backend CRUD Ruangan (Backend Gap) untuk menyimpan data secara permanen.
                          </p>
                          <div className="mt-5 flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => router.push("/admin/sarpras/ruangan/tambah")}
                              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} hover:brightness-95 transition`}
                            >
                              <Plus size={14} />
                              Tambah Ruangan Sekarang
                            </button>
                            <button
                              type="button"
                              onClick={() => router.push("/admin/sarpras/gedung")}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold theme-text-secondary border theme-border hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] transition"
                            >
                              <Building2 size={14} />
                              Lihat Data Gedung
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      ruanganList.map((ruang, index) => (
                        <tr
                          key={ruang.id || index}
                          className="theme-border border-b hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] transition"
                        >
                          <td className="px-5 py-3.5 text-xs text-center font-mono theme-text-muted">
                            {index + 1}
                          </td>
                          <td className="px-5 py-3.5 text-xs font-semibold theme-text">
                            {ruang.nama}
                          </td>
                          <td className="px-5 py-3.5 text-xs font-mono theme-text-secondary">
                            {ruang.kode || "-"}
                          </td>
                          <td className="px-5 py-3.5 text-xs theme-text">
                            {ruang.gedung?.nama || "-"}
                          </td>
                          <td className="px-5 py-3.5 text-xs theme-text">
                            {ruang.lantai?.nama || "-"}
                          </td>
                          <td className="px-5 py-3.5 text-xs">
                            {ruang.kelas?.nama ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                                <School size={12} />
                                {ruang.kelas.nama}
                              </span>
                            ) : (
                              <span className="theme-text-muted italic text-[11px]">
                                Tidak terhubung
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-xs theme-text-secondary">
                            <span className="inline-flex items-center gap-1 font-medium">
                              <Boxes size={13} className="theme-text-muted" />
                              {ruang.jumlahAsset || 0} Aset
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                ruang.status === "aktif"
                                  ? "bg-[color-mix(in_srgb,var(--color-success)_15%,transparent)] theme-success"
                                  : ruang.status === "perbaikan"
                                  ? "bg-[color-mix(in_srgb,var(--color-warning)_15%,transparent)] text-[var(--color-warning)]"
                                  : "bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)] theme-text-muted"
                              }`}
                            >
                              {ruang.status || "Aktif"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                title="Detail Ruangan"
                                onClick={() =>
                                  router.push(`/admin/sarpras/ruangan/${ruang.id}`)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] text-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] transition"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                type="button"
                                title="Edit Ruangan"
                                onClick={() =>
                                  router.push(`/admin/sarpras/ruangan/${ruang.id}/edit`)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)] hover:bg-[color-mix(in_srgb,var(--color-warning)_20%,transparent)] transition"
                              >
                                <Pencil size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
