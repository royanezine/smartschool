"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import CanAccess from "@/app/components/auth/CanAccess";
import { getJurusan, deleteJurusan } from "@/services/jurusan.service";
import {
  GraduationCap,
  FlaskConical,
  Landmark,
  Languages,
  Code2,
  Palette,
  Calculator,
  Wrench,
  UtensilsCrossed,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Layers3,
  CircleCheck,
  CircleSlash,
  ChevronDown,
  Eye,
  RefreshCw,
  AlertCircle,
  Loader2,
  ArrowUpDown,
  School,
  Users,
  Activity,
} from "lucide-react";

const ICONS = {
  FlaskConical,
  Landmark,
  Languages,
  Code2,
  Palette,
  Calculator,
  Wrench,
  UtensilsCrossed,
};

function StatCard({ icon: Icon, label, value, subLabel }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border theme-border theme-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-widest theme-text-muted sm:text-[11px]">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-extrabold tracking-tight theme-text sm:text-3xl">
            {value}
          </p>
          {subLabel && (
            <p className="mt-1 truncate text-[10px] font-medium theme-text-muted sm:text-[11px]">
              {subLabel}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl theme-card-soft theme-text-secondary sm:h-12 sm:w-12">
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-400/20" />
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === "Aktif" || status === "aktif";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        active
          ? "border-slate-300/30 bg-slate-500/10 theme-text-secondary dark:border-slate-500/30"
          : "border-slate-400/20 bg-transparent theme-text-muted"
      }`}
    >
      {active ? (
        <CircleCheck size={12} strokeWidth={2.5} />
      ) : (
        <CircleSlash size={12} strokeWidth={2.5} />
      )}
      {active ? "Aktif" : "Nonaktif"}
    </span>
  );
}

export default function ListJurusanPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [sortBy, setSortBy] = useState("nama-asc");
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadJurusan = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await getJurusan({ limit: 100 });
      if (res?.data && Array.isArray(res.data)) setData(res.data);
      else if (Array.isArray(res)) setData(res);
      else setData([]);
    } catch (err) {
      console.error("Gagal memuat jurusan:", err);
      setErrorMsg(err?.message || "Gagal memuat data jurusan dari server.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(loadJurusan, 0);
    return () => clearTimeout(t);
  }, [loadJurusan]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = data.filter((j) => {
      const matchSearch =
        !q ||
        (j.nama || "").toLowerCase().includes(q) ||
        (j.kode || "").toLowerCase().includes(q) ||
        (j.deskripsi || "").toLowerCase().includes(q);
      const itemStatus =
        (j.status || "").toLowerCase() === "aktif" ? "Aktif" : "Nonaktif";
      const matchStatus =
        statusFilter === "Semua" || itemStatus === statusFilter;
      return matchSearch && matchStatus;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "nama-asc")
        return (a.nama || "").localeCompare(b.nama || "");
      if (sortBy === "nama-desc")
        return (b.nama || "").localeCompare(a.nama || "");
      if (sortBy === "kode-asc")
        return (a.kode || "").localeCompare(b.kode || "");
      if (sortBy === "kelas-desc")
        return (b._count?.kelas ?? 0) - (a._count?.kelas ?? 0);
      return 0;
    });

    return result;
  }, [data, search, statusFilter, sortBy]);

  const totalAktif = useMemo(
    () => data.filter((i) => (i.status || "").toLowerCase() === "aktif").length,
    [data]
  );
  const totalNonaktif = useMemo(
    () =>
      data.filter((i) => (i.status || "").toLowerCase() === "nonaktif").length,
    [data]
  );
  const totalKelas = useMemo(
    () => data.reduce((t, i) => t + (i._count?.kelas ?? i.kelas ?? 0), 0),
    [data]
  );

  const removeItem = async (item) => {
    if (!item?.id) return;
    try {
      setDeleting(true);
      setErrorMsg("");
      setSuccessMsg("");
      const res = await deleteJurusan(item.id);
      setSuccessMsg(res?.message || "Jurusan berhasil dihapus.");
      setConfirmDeleteItem(null);
      await loadJurusan();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Gagal menghapus jurusan:", err);
      setErrorMsg(
        err?.message ||
          "Gagal menghapus jurusan. Pastikan tidak ada kelas yang terhubung."
      );
      setConfirmDeleteItem(null);
    } finally {
      setDeleting(false);
    }
  };

  const resetFilter = () => {
    setSearch("");
    setStatusFilter("Semua");
    setSortBy("nama-asc");
  };

  return (
    <div className="flex h-screen overflow-hidden theme-page">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header />
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="w-full px-3 py-5 sm:px-5 lg:px-6 xl:px-8">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border theme-border theme-card-soft theme-text shadow-sm sm:h-14 sm:w-14">
                  <GraduationCap size={24} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-xl font-extrabold tracking-tight theme-text sm:text-2xl xl:text-3xl">
                      Data Jurusan
                    </h1>
                    <span className="hidden rounded-full border theme-border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider theme-text-muted sm:inline-block">
                      Program Keahlian
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs theme-text-muted sm:text-sm">
                    Kelola program keahlian & data jurusan sekolah terintegrasi
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={loadJurusan}
                  disabled={loading}
                  className="theme-card theme-border theme-text-secondary flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold shadow-sm transition hover:bg-slate-500/5 disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <CanAccess menu="jurusan" action="create">
                  <button
                    onClick={() => router.push("/admin/akademik/jurusan/tambah")}
                    className="flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-95 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                  >
                    <Plus size={17} />
                    <span className="hidden xs:inline">Tambah Jurusan</span>
                    <span className="xs:hidden">Tambah</span>
                  </button>
                </CanAccess>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-slate-500/30 bg-slate-500/10 p-3.5 text-sm theme-text">
                <div className="flex items-center gap-2.5">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                <button
                  onClick={() => setErrorMsg("")}
                  className="rounded p-1 hover:bg-slate-500/20"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-slate-500/30 bg-slate-500/10 p-3.5 text-sm theme-text">
                <div className="flex items-center gap-2.5">
                  <CircleCheck size={18} className="shrink-0" />
                  <span>{successMsg}</span>
                </div>
                <button
                  onClick={() => setSuccessMsg("")}
                  className="rounded p-1 hover:bg-slate-500/20"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
              <StatCard
                icon={Layers3}
                label="Total Jurusan"
                value={data.length}
                subLabel="Seluruh program"
              />
              <StatCard
                icon={CircleCheck}
                label="Jurusan Aktif"
                value={totalAktif}
                subLabel="Beroperasi"
              />
              <StatCard
                icon={CircleSlash}
                label="Nonaktif"
                value={totalNonaktif}
                subLabel="Tidak beroperasi"
              />
              <StatCard
                icon={GraduationCap}
                label="Total Kelas"
                value={totalKelas}
                subLabel="Terdaftar"
              />
              <StatCard
                icon={School}
                label="Rata-rata Kelas"
                value={
                  data.length > 0
                    ? Math.round((totalKelas / data.length) * 10) / 10
                    : 0
                }
                subLabel="Per jurusan"
              />
              <StatCard
                icon={Activity}
                label="Persentase Aktif"
                value={
                  data.length > 0
                    ? `${Math.round((totalAktif / data.length) * 100)}%`
                    : "0%"
                }
                subLabel="Dari total"
              />
            </div>

            <div className="theme-card theme-border mt-5 rounded-2xl border p-3.5 shadow-sm sm:p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama, kode, atau deskripsi jurusan..."
                    className="theme-input h-11 w-full rounded-xl pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-slate-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
                  <div className="relative w-full sm:w-40">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="theme-input h-11 w-full appearance-none rounded-xl px-3 pr-8 text-xs outline-none focus:ring-2 focus:ring-slate-500/20 sm:text-sm"
                    >
                      <option value="Semua">Semua Status</option>
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 theme-text-placeholder"
                    />
                  </div>

                  <div className="relative w-full sm:w-40">
                    <ArrowUpDown
                      size={14}
                      className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 theme-text-muted"
                    />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="theme-input h-11 w-full appearance-none rounded-xl pl-8 pr-8 text-xs outline-none focus:ring-2 focus:ring-slate-500/20 sm:text-sm"
                    >
                      <option value="nama-asc">Nama A-Z</option>
                      <option value="nama-desc">Nama Z-A</option>
                      <option value="kode-asc">Kode A-Z</option>
                      <option value="kelas-desc">Kelas Terbanyak</option>
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 theme-text-placeholder"
                    />
                  </div>

                  <button
                    onClick={resetFilter}
                    className="theme-card theme-border theme-text-secondary col-span-2 h-11 rounded-xl border px-4 text-sm font-semibold transition hover:bg-slate-500/5 sm:col-span-1"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t theme-border-soft pt-3">
                <p className="text-xs theme-text-muted">
                  Menampilkan{" "}
                  <span className="font-bold theme-text">
                    {filtered.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-bold theme-text-secondary">
                    {data.length}
                  </span>{" "}
                  jurusan
                </p>
                <span className="text-[11px] font-medium theme-text-muted">
                  Total {totalKelas} kelas terdaftar
                </span>
              </div>
            </div>

            <div className="theme-card theme-border mt-5 overflow-hidden rounded-2xl border shadow-sm">
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[820px] border-collapse text-left">
                  <thead>
                    <tr className="border-b theme-border theme-card-soft text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                      <th className="w-12 px-3 py-3.5 text-center sm:w-14 sm:px-4">
                        No
                      </th>
                      <th className="px-3 py-3.5 sm:px-4">Jurusan</th>
                      <th className="px-3 py-3.5 sm:px-4">Deskripsi</th>
                      <th className="px-3 py-3.5 text-center sm:px-4">Kelas</th>
                      <th className="px-3 py-3.5 sm:px-4">Status</th>
                      <th className="px-3 py-3.5 text-right sm:px-4">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2
                              className="animate-spin theme-text-muted"
                              size={28}
                            />
                            <span className="text-sm theme-text-muted">
                              Memuat data jurusan...
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      filtered.map((j, index) => {
                        const Icon = ICONS[j.icon] || GraduationCap;
                        return (
                          <tr
                            key={j.id}
                            className="border-b theme-border-soft transition hover:bg-slate-500/5 last:border-0"
                          >
                            <td className="px-3 py-3.5 text-center text-sm font-semibold theme-text-muted sm:px-4 sm:py-4">
                              {index + 1}
                            </td>

                            <td className="px-3 py-3.5 sm:px-4 sm:py-4">
                              <div className="flex items-center gap-2.5 sm:gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border theme-border theme-card-soft theme-text-secondary sm:h-10 sm:w-10">
                                  <Icon size={16} strokeWidth={2} />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold theme-text">
                                    {j.nama}
                                  </p>
                                  <p className="mt-0.5 inline-block rounded bg-slate-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold theme-text-muted">
                                    {j.kode}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-3 py-3.5 sm:px-4 sm:py-4">
                              <p className="max-w-[240px] truncate text-sm theme-text-secondary xl:max-w-[320px] 2xl:max-w-[400px]">
                                {j.deskripsi || "-"}
                              </p>
                            </td>

                            <td className="px-3 py-3.5 text-center sm:px-4 sm:py-4">
                              <span className="inline-flex min-w-[32px] items-center justify-center rounded-lg bg-slate-500/10 px-2 py-1 text-sm font-bold theme-text-secondary">
                                {j._count?.kelas ?? j.kelas ?? 0}
                              </span>
                            </td>

                            <td className="px-3 py-3.5 sm:px-4 sm:py-4">
                              <StatusBadge status={j.status} />
                            </td>

                            <td className="px-3 py-3.5 sm:px-4 sm:py-4">
                              <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/admin/akademik/jurusan/${j.id}`
                                    )
                                  }
                                  title="Lihat detail"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg theme-text-secondary transition hover:bg-slate-500/10 hover:theme-text"
                                >
                                  <Eye size={15} />
                                </button>
                                <CanAccess menu="jurusan" action="update">
                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/admin/akademik/jurusan/${j.id}/edit`
                                      )
                                    }
                                    title="Edit"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg theme-text-secondary transition hover:bg-slate-500/10 hover:theme-text"
                                  >
                                    <Pencil size={15} />
                                  </button>
                                </CanAccess>
                                <CanAccess menu="jurusan" action="delete">
                                  <button
                                    onClick={() => setConfirmDeleteItem(j)}
                                    title="Hapus"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg theme-text-secondary transition hover:bg-slate-500/10 hover:theme-text"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </CanAccess>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-20 text-center">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border theme-border theme-card-soft theme-text-muted">
                            <GraduationCap size={26} />
                          </div>
                          <p className="mt-4 text-base font-bold theme-text-secondary">
                            {data.length === 0
                              ? "Belum ada data jurusan"
                              : "Jurusan tidak ditemukan"}
                          </p>
                          <p className="mt-1.5 text-sm theme-text-muted">
                            {data.length === 0
                              ? "Klik 'Tambah Jurusan' untuk membuat jurusan baru."
                              : "Coba ubah kata kunci atau filter pencarian."}
                          </p>
                          {data.length === 0 && (
                            <CanAccess menu="jurusan" action="create">
                              <button
                                onClick={() =>
                                  router.push("/admin/akademik/jurusan/tambah")
                                }
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                              >
                                <Plus size={16} />
                                Tambah Jurusan
                              </button>
                            </CanAccess>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="h-4" />
          </div>
        </main>
      </div>

      {confirmDeleteItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="theme-card theme-border w-full max-w-md rounded-2xl border p-5 shadow-2xl sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-500/10 theme-text-secondary">
                <Trash2 size={22} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold theme-text">
                  Hapus Jurusan?
                </h2>
                <p className="mt-1.5 text-sm leading-6 theme-text-muted">
                  Yakin ingin menghapus{" "}
                  <strong className="theme-text">
                    {confirmDeleteItem.nama} ({confirmDeleteItem.kode})
                  </strong>
                  ?
                </p>
                <p className="mt-1 text-xs theme-text-muted">
                  Data akan dihapus permanen. Pastikan tidak ada kelas/siswa
                  terhubung.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                disabled={deleting}
                onClick={() => setConfirmDeleteItem(null)}
                className="theme-card theme-border theme-text-secondary h-10 rounded-xl border px-5 text-sm font-semibold transition hover:bg-slate-500/5 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                disabled={deleting}
                onClick={() => removeItem(confirmDeleteItem)}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 dark:bg-rose-600 dark:hover:bg-rose-700"
              >
                {deleting && <Loader2 className="animate-spin" size={16} />}
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}