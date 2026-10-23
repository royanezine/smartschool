"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  MonitorPlay,
  Plus,
  Search,
  Users,
  UserCheck,
  BookOpen,
  Edit3,
  Eye,
  Trash2,
  CheckCircle2,
  Clock3,
  GraduationCap,
  RefreshCw,
  Loader2,
  AlertCircle,
  AlertTriangle,
  X,
} from "lucide-react";

import {
  getKelasMapel,
  deleteKelasMapel,
} from "@/services/kelasMapel.service";

export default function ModulClassPage() {
  const [search, setSearch] = useState("");
  const [filterMapel, setFilterMapel] = useState("Semua");
  const [filterTingkat, setFilterTingkat] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const themePrimarySoft =
    "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";
  const themePrimaryHover =
    "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";
  const themePrimaryShadow =
    "shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await getKelasMapel();
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil data modul kelas LMS:", err);
      setError(err?.message || "Gagal memuat data kelas LMS.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const mapelOptions = useMemo(() => {
    const set = new Set();
    classes.forEach((c) => {
      const nama = c?.mataPelajaran?.nama;
      if (nama) set.add(nama);
    });
    return Array.from(set).sort();
  }, [classes]);

  const tingkatOptions = useMemo(() => {
    const set = new Set();
    classes.forEach((c) => {
      const tingkat = c?.kelas?.tingkat;
      if (tingkat !== undefined && tingkat !== null) set.add(String(tingkat));
    });
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [classes]);

  const filteredClasses = useMemo(() => {
    return classes.filter((item) => {
      const keyword = search.toLowerCase();

      const namaKelas = item?.kelas?.nama || "";
      const namaMapel = item?.mataPelajaran?.nama || "";
      const kodeMapel = item?.mataPelajaran?.kode || "";
      const namaGuru = item?.guruPengajar?.namaLengkap || "";
      const nipGuru = item?.guruPengajar?.nip || "";

      const matchSearch =
        !keyword ||
        namaKelas.toLowerCase().includes(keyword) ||
        namaMapel.toLowerCase().includes(keyword) ||
        kodeMapel.toLowerCase().includes(keyword) ||
        namaGuru.toLowerCase().includes(keyword) ||
        nipGuru.toLowerCase().includes(keyword);

      const matchMapel =
        filterMapel === "Semua" || item?.mataPelajaran?.nama === filterMapel;

      const matchTingkat =
        filterTingkat === "Semua" ||
        String(item?.kelas?.tingkat) === filterTingkat;

      const currentStatus = (item?.status || "aktif").toLowerCase();
      const matchStatus =
        filterStatus === "Semua" ||
        (filterStatus === "Aktif" && currentStatus === "aktif") ||
        (filterStatus === "Nonaktif" && currentStatus !== "aktif");

      return matchSearch && matchMapel && matchTingkat && matchStatus;
    });
  }, [classes, search, filterMapel, filterTingkat, filterStatus]);

  const totalClasses = classes.length;
  const activeClasses = classes.filter(
    (item) => (item?.status || "aktif").toLowerCase() === "aktif"
  ).length;
  const inactiveClasses = totalClasses - activeClasses;

  const uniqueKelasCount = useMemo(() => {
    const set = new Set();
    classes.forEach((item) => {
      if (item.kelasId) set.add(item.kelasId);
    });
    return set.size;
  }, [classes]);

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;

    setDeleting(true);
    setFeedback(null);

    try {
      await deleteKelasMapel(deleteConfirmItem.id);
      setFeedback({
        type: "success",
        message: `Mata pelajaran kelas "${deleteConfirmItem?.kelas?.nama || "Kelas"} - ${deleteConfirmItem?.mataPelajaran?.nama || "Mapel"}" berhasil dihapus.`,
      });
      setDeleteConfirmItem(null);
      await loadData(true);
    } catch (err) {
      console.error("Gagal menghapus kelas-mapel:", err);
      setFeedback({
        type: "error",
        message: err?.message || "Gagal menghapus kelas mata pelajaran.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="theme-page min-h-screen flex">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <div className="p-5 md:p-7 lg:p-8">
            <div className="flex items-center gap-2 text-sm mb-3">
              <span className="theme-text-muted">LMS & CBT</span>
              <span className="theme-text-placeholder">/</span>
              <span className="theme-text font-medium">Modul LMS & Class</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center ${themePrimaryShadow}`}
                >
                  <MonitorPlay size={24} className="text-white" />
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold theme-text">
                    Modul LMS & Class
                  </h1>
                  <p className="text-sm theme-text-secondary mt-1">
                    Kelola relasi kelas pembelajaran, mata pelajaran, dan guru pengampu LMS.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={refreshing || loading}
                  className="p-2.5 rounded-xl border theme-border theme-card hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition theme-text-secondary flex items-center gap-2 text-sm disabled:opacity-50"
                  title="Segarkan data"
                >
                  <RefreshCw
                    size={18}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <Link
                  href="/admin/lms-cbt/modul-class/tambah"
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:brightness-95 text-white rounded-xl text-sm font-semibold ${themePrimaryShadow} transition-all`}
                >
                  <Plus size={18} />
                  <span>Tambah Penugasan Kelas</span>
                </Link>
              </div>
            </div>

            {feedback && (
              <div
                className={`mb-6 p-4 rounded-xl border flex items-center justify-between gap-3 text-sm ${
                  feedback.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                    : "bg-red-500/10 border-red-500/20 text-red-500"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {feedback.type === "success" ? (
                    <CheckCircle2 size={18} className="shrink-0" />
                  ) : (
                    <AlertCircle size={18} className="shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="p-1 hover:opacity-75 transition"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
              <StatCard
                title="Total Relasi Kelas-Mapel"
                value={totalClasses}
                description="Penugasan mapel & guru di kelas"
                icon={MonitorPlay}
              />

              <StatCard
                title="Kelas Induk Terdaftar"
                value={uniqueKelasCount}
                description="Kelas aktif dengan mapel LMS"
                icon={GraduationCap}
              />

              <StatCard
                title="Status Aktif"
                value={activeClasses}
                description="Sedang aktif digunakan"
                icon={CheckCircle2}
              />

              <StatCard
                title="Status Nonaktif"
                value={inactiveClasses}
                description="Tidak aktif / diarsipkan"
                icon={Clock3}
              />
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => loadData()}
                  className="text-xs font-semibold underline hover:opacity-80"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            <div className="theme-card rounded-2xl border theme-border shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)] overflow-hidden">
              <div className="p-5 border-b theme-border-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari kelas, mata pelajaran, atau guru pengampu..."
                    className="theme-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={filterMapel}
                    onChange={(e) => setFilterMapel(e.target.value)}
                    className="theme-input px-3.5 py-2 rounded-xl text-xs md:text-sm focus:outline-none"
                  >
                    <option value="Semua">Semua Mata Pelajaran</option>
                    {mapelOptions.map((mapel) => (
                      <option key={mapel} value={mapel}>
                        {mapel}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterTingkat}
                    onChange={(e) => setFilterTingkat(e.target.value)}
                    className="theme-input px-3.5 py-2 rounded-xl text-xs md:text-sm focus:outline-none"
                  >
                    <option value="Semua">Semua Tingkat</option>
                    {tingkatOptions.map((tingkat) => (
                      <option key={tingkat} value={tingkat}>
                        Tingkat {tingkat}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="theme-input px-3.5 py-2 rounded-xl text-xs md:text-sm focus:outline-none"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="theme-card-soft border-b theme-border-soft">
                      <th className="text-left px-5 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider">
                        Kelas
                      </th>
                      <th className="text-left px-5 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider">
                        Mata Pelajaran
                      </th>
                      <th className="text-left px-5 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider">
                        Guru Pengampu
                      </th>
                      <th className="text-center px-5 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-right px-5 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y theme-border-soft">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-16 text-center">
                          <Loader2
                            size={28}
                            className="animate-spin text-[var(--color-primary)] mx-auto mb-3"
                          />
                          <p className="text-sm font-medium theme-text">
                            Memuat data kelas LMS...
                          </p>
                          <p className="text-xs theme-text-muted mt-1">
                            Menghubungkan dengan API backend server
                          </p>
                        </td>
                      </tr>
                    ) : filteredClasses.length > 0 ? (
                      filteredClasses.map((item) => {
                        const isAktif =
                          (item?.status || "aktif").toLowerCase() === "aktif";
                        const namaKelas = item?.kelas?.nama || "Tanpa Kelas";
                        const tingkatKelas = item?.kelas?.tingkat
                          ? `Tingkat ${item.kelas.tingkat}`
                          : "-";
                        const namaMapel =
                          item?.mataPelajaran?.nama || "Mata Pelajaran";
                        const kodeMapel = item?.mataPelajaran?.kode || "-";
                        const namaGuru =
                          item?.guruPengajar?.namaLengkap || "Belum Ditugaskan";
                        const nipGuru = item?.guruPengajar?.nip;

                        return (
                          <tr
                            key={item.id}
                            className={`${themePrimaryHover} transition`}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl ${themePrimarySoft} flex items-center justify-center shrink-0`}
                                >
                                  <GraduationCap
                                    size={19}
                                    className="text-[var(--color-primary)]"
                                  />
                                </div>
                                <div>
                                  <p className="font-semibold text-sm theme-text">
                                    {namaKelas}
                                  </p>
                                  <p className="text-xs theme-text-muted mt-0.5">
                                    {tingkatKelas}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <BookOpen size={15} className="theme-text-muted shrink-0" />
                                <div>
                                  <span className="text-sm font-medium theme-text block">
                                    {namaMapel}
                                  </span>
                                  <span className="text-[11px] theme-text-muted">
                                    Kode: {kodeMapel}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                                  <UserCheck size={15} />
                                </div>
                                <div>
                                  <span className="text-sm font-medium theme-text block">
                                    {namaGuru}
                                  </span>
                                  {nipGuru && (
                                    <span className="text-[11px] theme-text-muted">
                                      NIP: {nipGuru}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                  isAktif
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                    : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isAktif ? "bg-emerald-500" : "bg-gray-400"
                                  }`}
                                />
                                {isAktif ? "Aktif" : "Nonaktif"}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  href={`/admin/lms-cbt/modul-class/${item.id}`}
                                  title="Lihat detail kelas"
                                  className={`p-2 rounded-lg theme-text-muted hover:text-[var(--color-primary)] ${themePrimarySoft} transition`}
                                >
                                  <Eye size={16} />
                                </Link>

                                <Link
                                  href={`/admin/lms-cbt/modul-class/${item.id}/edit`}
                                  title="Edit penugasan kelas"
                                  className="p-2 rounded-lg theme-text-muted hover:text-[var(--color-warning)] hover:bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] transition"
                                >
                                  <Edit3 size={16} />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmItem(item)}
                                  title="Hapus penugasan mapel dari kelas"
                                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-5 py-14 text-center">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-14 h-14 rounded-2xl ${themePrimarySoft} flex items-center justify-center mb-3`}
                            >
                              <MonitorPlay size={25} className="theme-text-muted" />
                            </div>
                            <p className="font-semibold theme-text">
                              Tidak ada kelas LMS ditemukan
                            </p>
                            <p className="text-sm theme-text-muted mt-1 max-w-sm">
                              {search || filterMapel !== "Semua" || filterTingkat !== "Semua" || filterStatus !== "Semua"
                                ? "Coba sesuaikan kata kunci pencarian atau filter yang dipilih."
                                : "Belum ada penugasan kelas-mapel. Klik tombol 'Tambah Penugasan Kelas' untuk membuat baru."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-4 border-t theme-border-soft flex items-center justify-between text-xs theme-text-secondary">
                <span>
                  Menampilkan {filteredClasses.length} dari {classes.length} penugasan kelas-mapel
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[color-mix(in_srgb,var(--color-text)_45%,transparent)] backdrop-blur-sm">
          <div className="w-full max-w-md theme-card border theme-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-semibold theme-text text-base">
                  Konfirmasi Hapus Penugasan
                </h3>
                <p className="text-xs theme-text-muted mt-0.5">
                  Tindakan ini akan menonaktifkan penugasan mapel dari kelas.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl theme-card-soft text-xs space-y-1.5 theme-text-secondary">
              <p>
                <strong>Kelas:</strong> {deleteConfirmItem?.kelas?.nama || "-"}
              </p>
              <p>
                <strong>Mata Pelajaran:</strong>{" "}
                {deleteConfirmItem?.mataPelajaran?.nama || "-"}
              </p>
              <p>
                <strong>Guru Pengampu:</strong>{" "}
                {deleteConfirmItem?.guruPengajar?.namaLengkap || "-"}
              </p>
            </div>

            <p className="text-xs text-red-500">
              Perhatian: Riwayat nilai, materi, dan tugas yang terhubung dengan kelas-mapel ini mungkin terpengaruh. Pastikan tidak ada data operasional yang sedang berjalan.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl theme-card-soft text-xs font-medium hover:brightness-95 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:brightness-95 transition disabled:opacity-50"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="theme-card rounded-2xl border theme-border shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm theme-text-secondary">{title}</p>
          <p className="text-2xl font-bold theme-text mt-2">{value}</p>
          <p className="text-xs theme-text-muted mt-1">{description}</p>
        </div>

        <div className="w-11 h-11 rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] flex items-center justify-center shrink-0">
          <Icon size={20} className="text-[var(--color-primary)]" />
        </div>
      </div>
    </div>
  );
}
