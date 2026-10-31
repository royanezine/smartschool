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
  Plus,
  Search,
  Filter,
  Info,
  ChevronRight,
  Loader2,
  AlertCircle,
  Eye,
  Pencil,
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
const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

export default function DaftarRuanganPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [lantai, setLantai] = useState(null);
  const [gedung, setGedung] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const gedungResult = await getGedung();
      if (!gedungResult?.success) {
        throw new Error(gedungResult?.message || "Gagal mengambil data gedung.");
      }

      const gedungList = Array.isArray(gedungResult.data) ? gedungResult.data : [];
      let foundLantai = null;
      let foundGedung = null;

      for (const item of gedungList) {
        const result = await getLantaiByGedung(item.id);
        if (!result?.success) continue;

        const lantaiList = Array.isArray(result.data) ? result.data : [];
        const found = lantaiList.find((l) => String(l.id) === String(id));
        if (found) {
          foundLantai = found;
          foundGedung = item;
          break;
        }
      }

      if (!foundLantai) {
        throw new Error("Data lantai tidak ditemukan.");
      }

      setLantai(foundLantai);
      setGedung(foundGedung);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Gagal memuat konteks lantai.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, loadData]);

  // Data ruangan saat ini 100% empty state karena Backend belum menyediakan API /api/infrastruktur/ruangan
  const ruanganList = [];

  const filteredRuangan = ruanganList.filter((item) => {
    const matchSearch =
      item.nama?.toLowerCase().includes(search.toLowerCase()) ||
      item.kode?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ? true : item.status === statusFilter;
    return matchSearch && matchStatus;
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
                onClick={() => router.push("/admin/sarpras/gedung")}
                className="hover:text-[var(--color-primary)] transition"
              >
                Infrastruktur Gedung
              </button>
              <ChevronRight size={14} />
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/admin/sarpras/gedung/detail/${gedung?.id || ""}`
                  )
                }
                className="hover:text-[var(--color-primary)] transition truncate max-w-[150px]"
              >
                {gedung?.nama || "Gedung"}
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
              <span className="theme-text font-semibold">Daftar Ruangan</span>
            </nav>

            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/admin/sarpras/gedung/lantai/detail/${id}`)
                  }
                  className="mb-2 inline-flex items-center gap-2 text-sm font-medium theme-text-muted hover:text-[var(--color-primary)] transition"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Detail Lantai
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                    <DoorOpen size={22} />
                  </div>
                  <div>
                    <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                      Pengelolaan Ruangan
                    </h1>
                    <p className="theme-text-muted text-xs sm:text-sm mt-0.5">
                      Hierarki: {gedung?.nama || "Gedung"} → {lantai?.nama || "Lantai"} → Ruangan
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/sarpras/gedung/lantai/${id}/ruangan/tambah`
                    )
                  }
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} hover:brightness-95 transition-all`}
                >
                  <Plus size={16} />
                  Tambah Ruangan
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_6%,transparent)] p-4 text-sm theme-danger">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Terjadi Kesalahan</p>
                  <p className="text-xs opacity-90 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Hierarchy & Integration Banner */}
            <div className="theme-card theme-border rounded-2xl border p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]">
              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] text-[var(--color-primary)] mt-0.5">
                  <Info size={18} />
                </div>
                <div className="space-y-1">
                  <p className="theme-text text-sm font-semibold">
                    Struktur Infrastruktur Sarpras: Gedung → Lantai → Ruangan
                  </p>
                  <p className="theme-text-muted text-xs leading-relaxed">
                    Setiap lantai dapat memiliki banyak ruangan fisik. Ruangan dapat dikaitkan dengan kelas (opsional) serta mendata asset/inventaris seperti meja, kursi, dan papan tulis.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-lg border theme-border px-3 py-1 text-xs font-semibold theme-text-secondary bg-[var(--color-card)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-info)] animate-pulse" />
                  Frontend Ready • Backend API Pending
                </span>
              </div>
            </div>

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className={`theme-card theme-border rounded-xl border p-4 ${themeCardShadow}`}>
                <div className="flex items-center justify-between">
                  <p className="theme-text-muted text-xs font-medium">Total Ruangan</p>
                  <DoorOpen size={16} className="text-[var(--color-primary)]" />
                </div>
                <p className="theme-text text-2xl font-bold mt-2">{ruanganList.length}</p>
                <p className="theme-text-muted text-[11px] mt-0.5">Pada {lantai?.nama || "lantai ini"}</p>
              </div>

              <div className={`theme-card theme-border rounded-xl border p-4 ${themeCardShadow}`}>
                <div className="flex items-center justify-between">
                  <p className="theme-text-muted text-xs font-medium">Terhubung Kelas</p>
                  <School size={16} className="text-[var(--color-success)]" />
                </div>
                <p className="theme-text text-2xl font-bold mt-2">0</p>
                <p className="theme-text-muted text-[11px] mt-0.5">Ruang kelas aktif</p>
              </div>

              <div className={`theme-card theme-border rounded-xl border p-4 ${themeCardShadow}`}>
                <div className="flex items-center justify-between">
                  <p className="theme-text-muted text-xs font-medium">Ruang Umum / Lab</p>
                  <Building2 size={16} className="text-[var(--color-info)]" />
                </div>
                <p className="theme-text text-2xl font-bold mt-2">0</p>
                <p className="theme-text-muted text-[11px] mt-0.5">Tanpa penugasan kelas</p>
              </div>

              <div className={`theme-card theme-border rounded-xl border p-4 ${themeCardShadow}`}>
                <div className="flex items-center justify-between">
                  <p className="theme-text-muted text-xs font-medium">Total Asset</p>
                  <Boxes size={16} className="text-[var(--color-warning)]" />
                </div>
                <p className="theme-text text-2xl font-bold mt-2">0 Unit</p>
                <p className="theme-text-muted text-[11px] mt-0.5">Inventaris ruangan</p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className={`theme-card theme-border rounded-2xl border p-4 ${themeCardShadow}`}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama atau kode ruangan..."
                    className={`theme-input w-full rounded-xl pl-10 pr-4 py-2 text-sm ${themeFocus}`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={`theme-input rounded-xl px-3 py-2 text-sm pr-8 ${themeFocus}`}
                    >
                      <option value="all">Semua Status</option>
                      <option value="aktif">Aktif</option>
                      <option value="perbaikan">Dalam Perbaikan</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>

                  {(search || statusFilter !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("all");
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold theme-text-secondary hover:text-[var(--color-primary)] transition"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table / List View */}
            <div className={`theme-card theme-border overflow-hidden rounded-2xl border ${themeCardShadow}`}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse text-left">
                  <thead>
                    <tr className={`theme-border border-b ${themeSoftSurface}`}>
                      <th className="theme-text-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] w-12 text-center">
                        No
                      </th>
                      <th className="theme-text-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em]">
                        Nama Ruangan
                      </th>
                      <th className="theme-text-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em]">
                        Kode
                      </th>
                      <th className="theme-text-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em]">
                        Kelas
                      </th>
                      <th className="theme-text-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em]">
                        Jumlah Asset
                      </th>
                      <th className="theme-text-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em]">
                        Status
                      </th>
                      <th className="theme-text-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-right">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_7%,transparent)]">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-14 text-center">
                          <Loader2 size={28} className="mx-auto animate-spin text-[var(--color-primary)]" />
                          <p className="theme-text-muted text-xs mt-2 font-medium">
                            Memuat data ruangan...
                          </p>
                        </td>
                      </tr>
                    ) : filteredRuangan.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${themeSoftSurface} text-[var(--color-primary)]`}>
                            <DoorOpen size={30} />
                          </div>
                          <h3 className="theme-text text-base font-bold mt-4">
                            Belum Ada Data Ruangan
                          </h3>
                          <p className="theme-text-muted text-xs max-w-md mx-auto mt-1 leading-relaxed">
                            Data ruangan pada {lantai?.nama || "lantai ini"} belum terdaftar. Saat ini endpoint backend untuk ruangan sedang dipersiapkan.
                          </p>
                          <div className="mt-5 flex justify-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/admin/sarpras/gedung/lantai/${id}/ruangan/tambah`
                                )
                              }
                              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} hover:brightness-95 transition`}
                            >
                              <Plus size={15} />
                              Tambah Ruangan Sekarang
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRuangan.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] transition"
                        >
                          <td className="px-5 py-4 text-xs theme-text-muted text-center font-mono">
                            {idx + 1}
                          </td>
                          <td className="px-5 py-4">
                            <p className="theme-text text-sm font-semibold">
                              {item.nama}
                            </p>
                            <p className="theme-text-muted text-xs">
                              Kapasitas: {item.kapasitas || 0} orang
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-mono text-xs theme-text-secondary px-2 py-1 rounded bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
                              {item.kode || "-"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs theme-text-secondary">
                            {item.kelas?.nama ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] theme-success font-medium">
                                <School size={12} />
                                {item.kelas.nama}
                              </span>
                            ) : (
                              <span className="theme-text-muted italic">
                                Belum terhubung
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-xs theme-text-secondary">
                            <span className="inline-flex items-center gap-1.5 font-medium">
                              <Boxes size={14} className="theme-text-muted" />
                              {item.totalAsset || 0} unit
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                                item.status === "aktif"
                                  ? "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] theme-success"
                                  : item.status === "perbaikan"
                                  ? "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)]"
                                  : "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] theme-text-muted"
                              }`}
                            >
                              {item.status || "aktif"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/admin/sarpras/gedung/lantai/${id}/ruangan/${item.id}`
                                  )
                                }
                                title="Detail Ruangan"
                                className="p-2 rounded-lg theme-text-secondary hover:text-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] transition"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/admin/sarpras/gedung/lantai/${id}/ruangan/${item.id}/edit`
                                  )
                                }
                                title="Edit Ruangan"
                                className="p-2 rounded-lg theme-text-secondary hover:text-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] transition"
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
