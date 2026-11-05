"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { getRuangan, deleteRuangan } from "@/services/sarpras.service";

import {
  DoorOpen,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  MapPin,
  Users,
  Loader2,
  AlertCircle,
  ClipboardList,
  CheckCircle2,
  X,
} from "lucide-react";

function extractData(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    "Terjadi kesalahan. Silakan coba lagi."
  );
}

export default function RuanganPage() {
  const router = useRouter();

  const [ruanganList, setRuanganList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadRuangan = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      setErrorMessage("");
      const response = await getRuangan();

      if (response?.success === false) {
        throw new Error(response.message || "Gagal mengambil data ruangan.");
      }

      setRuanganList(extractData(response));
    } catch (error) {
      console.error("Gagal mengambil data ruangan:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRuangan();
  }, [loadRuangan]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const filteredRuangan = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return ruanganList;

    return ruanganList.filter((ruangan) => {
      return [ruangan.nama, ruangan.lokasi, ruangan.keterangan].some((value) =>
        String(value || "").toLowerCase().includes(keyword)
      );
    });
  }, [ruanganList, searchTerm]);

  const totalRuangan = ruanganList.length;
  const totalKapasitas = ruanganList.reduce(
    (total, item) => total + (Number(item.kapasitas) || 0),
    0
  );
  const ruanganDenganLokasi = ruanganList.filter((item) => item.lokasi).length;

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setErrorMessage("");

      await deleteRuangan(deleteTarget.id);

      setSuccessMessage(`Ruangan "${deleteTarget.nama}" berhasil dihapus.`);
      setDeleteTarget(null);
      await loadRuangan(false);
    } catch (error) {
      console.error("Gagal menghapus ruangan:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar active="sarpras" setActive={() => {}} collapsed={false} setCollapsed={() => {}} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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

        <div className="flex min-h-0 flex-1">
          <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
            <div className="w-full p-4 sm:p-6 lg:p-8 2xl:px-12 space-y-6">
              
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[color-mix(in_srgb,var(--color-primary)_70%,var(--color-info))] text-white shadow-lg shadow-[var(--color-primary)]/20">
                    <DoorOpen size={28} />
                  </div>
                  <div>
                    <h1 className="theme-text text-2xl sm:text-3xl font-bold tracking-tight">
                      Pengelolaan Ruangan
                    </h1>
                    <p className="theme-text-muted mt-1 text-sm">
                      Manajemen data ruangan, kapasitas, dan lokasi terintegrasi.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => loadRuangan(false)}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 rounded-xl border theme-border px-4 py-2.5 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/admin/sarpras/ruangan/tambah")}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-95"
                  >
                    <Plus size={18} />
                    Tambah Ruangan
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <div className="flex-1 font-medium">{errorMessage}</div>
                  <button onClick={() => setErrorMessage("")} className="opacity-70 hover:opacity-100">
                    <X size={16} />
                  </button>
                </div>
              )}

              {successMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-600">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <div className="flex-1 font-medium">{successMessage}</div>
                  <button onClick={() => setSuccessMessage("")} className="opacity-70 hover:opacity-100">
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                <div className="theme-card rounded-2xl border theme-border p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="theme-text-muted text-xs font-semibold uppercase tracking-wider">Total Ruangan</p>
                      <h2 className="theme-text mt-2 text-3xl font-bold">{totalRuangan}</h2>
                    </div>
                    <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] p-3 text-[var(--color-primary)]">
                      <DoorOpen size={22} />
                    </div>
                  </div>
                </div>

                <div className="theme-card rounded-2xl border theme-border p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="theme-text-muted text-xs font-semibold uppercase tracking-wider">Total Kapasitas</p>
                      <h2 className="theme-text mt-2 text-3xl font-bold">
                        {totalKapasitas.toLocaleString("id-ID")}
                      </h2>
                    </div>
                    <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] p-3 text-[var(--color-success)]">
                      <Users size={22} />
                    </div>
                  </div>
                </div>

                <div className="theme-card rounded-2xl border theme-border p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="theme-text-muted text-xs font-semibold uppercase tracking-wider">Memiliki Lokasi</p>
                      <h2 className="theme-text mt-2 text-3xl font-bold">{ruanganDenganLokasi}</h2>
                    </div>
                    <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] p-3 text-[var(--color-warning)]">
                      <MapPin size={22} />
                    </div>
                  </div>
                </div>
              </div>

              <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                <div className="flex flex-col gap-4 border-b theme-border bg-[color-mix(in_srgb,var(--color-text)_1%,transparent)] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="theme-text font-bold text-lg">Data Ruangan Sekolah</h2>
                    <p className="theme-text-muted mt-0.5 text-xs">
                      Daftar seluruh ruangan yang terdaftar pada sistem.
                    </p>
                  </div>

                  <div className="relative w-full sm:max-w-sm">
                    <Search size={18} className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Cari nama, lokasi, atau keterangan..."
                      className="theme-input w-full rounded-xl border theme-border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead className="border-b theme-border">
                      <tr className="bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]">
                        <th className="theme-text-muted w-16 px-5 py-4 text-center text-[11px] font-bold uppercase tracking-wider">No</th>
                        <th className="theme-text-muted px-5 py-4 text-[11px] font-bold uppercase tracking-wider">Nama Ruangan</th>
                        <th className="theme-text-muted px-5 py-4 text-[11px] font-bold uppercase tracking-wider">Lokasi</th>
                        <th className="theme-text-muted px-5 py-4 text-[11px] font-bold uppercase tracking-wider">Kapasitas</th>
                        <th className="theme-text-muted px-5 py-4 text-[11px] font-bold uppercase tracking-wider">Keterangan</th>
                        <th className="theme-text-muted px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border-soft)]">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-20 text-center">
                            <Loader2 size={32} className="mx-auto animate-spin text-[var(--color-primary)]" />
                            <p className="theme-text-muted mt-4 text-sm font-medium">Memuat data ruangan...</p>
                          </td>
                        </tr>
                      ) : filteredRuangan.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-20 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] text-[var(--color-primary)]">
                              <ClipboardList size={32} />
                            </div>
                            <h3 className="theme-text mt-5 text-base font-bold">
                              {searchTerm ? "Data Tidak Ditemukan" : "Belum Ada Ruangan"}
                            </h3>
                            <p className="theme-text-muted mt-1 max-w-xs mx-auto text-sm leading-relaxed">
                              {searchTerm 
                                ? "Tidak ada data yang cocok dengan kata kunci pencarian Anda." 
                                : "Daftar ruangan masih kosong. Silakan tambahkan ruangan baru untuk memulai."}
                            </p>
                            {!searchTerm && (
                              <button
                                type="button"
                                onClick={() => router.push("/admin/sarpras/ruangan/tambah")}
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                              >
                                <Plus size={16} />
                                Tambah Ruangan Pertama
                              </button>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredRuangan.map((ruangan, index) => (
                          <tr
                            key={ruangan.id || index}
                            className="group transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_3%,transparent)]"
                          >
                            <td className="theme-text-muted px-5 py-4 text-center text-xs font-mono font-medium">
                              {String(index + 1).padStart(2, "0")}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                                  <DoorOpen size={16} />
                                </div>
                                <span className="theme-text text-sm font-semibold">
                                  {ruangan.nama || "-"}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              {ruangan.lokasi ? (
                                <span className="inline-flex items-center gap-1.5 rounded-md border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] px-2.5 py-1 text-[11px] font-medium theme-text-secondary">
                                  <MapPin size={12} className="theme-text-muted" />
                                  {ruangan.lokasi}
                                </span>
                              ) : (
                                <span className="theme-text-muted text-xs italic">Belum diatur</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              {ruangan.kapasitas !== null && ruangan.kapasitas !== undefined ? (
                                <div className="flex items-center gap-1.5 theme-text text-sm font-medium">
                                  <Users size={14} className="theme-text-muted" />
                                  {ruangan.kapasitas} <span className="theme-text-muted text-xs font-normal">Orang</span>
                                </div>
                              ) : (
                                <span className="theme-text-muted text-xs italic">-</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <span className="theme-text-secondary block max-w-[250px] truncate text-xs">
                                {ruangan.keterangan || "-"}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  title="Lihat Detail"
                                  onClick={() => router.push(`/admin/sarpras/ruangan/${ruangan.id}`)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-info)] transition hover:bg-[var(--color-info-background)]"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  type="button"
                                  title="Edit Ruangan"
                                  onClick={() => router.push(`/admin/sarpras/ruangan/${ruangan.id}/edit`)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-warning)] transition hover:bg-[var(--color-warning-background)]"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  type="button"
                                  title="Hapus Ruangan"
                                  onClick={() => setDeleteTarget(ruangan)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-danger)] transition hover:bg-[var(--color-danger-background)]"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {!loading && filteredRuangan.length > 0 && (
                  <div className="flex items-center justify-between border-t theme-border bg-[color-mix(in_srgb,var(--color-text)_1%,transparent)] px-5 py-3">
                    <p className="theme-text-muted text-xs">
                      Menampilkan <span className="font-semibold theme-text">{filteredRuangan.length}</span> dari <span className="font-semibold theme-text">{ruanganList.length}</span> ruangan
                    </p>
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="theme-card relative w-full max-w-sm rounded-2xl border theme-border p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertCircle size={28} />
            </div>
            <h3 className="theme-text text-center text-lg font-bold">Hapus Ruangan?</h3>
            <p className="theme-text-secondary mt-2 text-center text-sm leading-relaxed">
              Apakah Anda yakin ingin menghapus ruangan <strong className="theme-text">"{deleteTarget.nama}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border theme-border py-2.5 text-sm font-semibold theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}