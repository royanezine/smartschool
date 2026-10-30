"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  ClipboardList,
  CheckCircle2,
  CalendarDays,
  Clock3,
  Users,
  RefreshCw,
  AlertCircle,
  Loader2,
  BookOpen,
  GraduationCap,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  getAllUjianAdmin,
  getKelasMapelAdmin,
  updateUjian,
  deleteUjian,
} from "@/services/ujian.service";


const statusConfig = {
  Aktif: {
    label: "Aktif",
    className:
      "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]",
    icon: CheckCircle2,
  },
  Terjadwal: {
    label: "Terjadwal",
    className:
      "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)]",
    icon: CalendarDays,
  },
  Draft: {
    label: "Draft",
    className:
      "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] theme-text-secondary border-[color-mix(in_srgb,var(--color-text)_15%,transparent)]",
    icon: ClipboardList,
  },
  Selesai: {
    label: "Selesai",
    className:
      "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]",
    icon: Clock3,
  },
};


function computeStatus(item) {
  if (!item.dipublikasikan) return "Draft";
  const now = new Date();
  if (item.waktuSelesai && new Date(item.waktuSelesai) < now) return "Selesai";
  if (item.waktuMulai && new Date(item.waktuMulai) > now) return "Terjadwal";
  return "Aktif";
}

function formatTanggal(isoStr) {
  if (!isoStr) return "-";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function formatWaktu(mulaiStr, selesaiStr) {
  if (!mulaiStr && !selesaiStr) return "-";
  try {
    const formatJam = (iso) => {
      if (!iso) return "";
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };
    const j1 = formatJam(mulaiStr);
    const j2 = formatJam(selesaiStr);
    if (j1 && j2) return `${j1} - ${j2}`;
    return j1 || j2 || "-";
  } catch {
    return "-";
  }
}


export default function UjianCbtPage() {
  const [ujian, setUjian] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterKelas, setFilterKelas] = useState("Semua");
  const [filterMapel, setFilterMapel] = useState("Semua");

  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedUjian, setSelectedUjian] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submittingDelete, setSubmittingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const ujianRes = await getAllUjianAdmin();

      const formatted = ujianRes.map((item) => {
        const computed = computeStatus(item);
        return {
          ...item,
          status: computed,
          tanggalFormatted: formatTanggal(item.waktuMulai),
          waktuFormatted: formatWaktu(item.waktuMulai, item.waktuSelesai),
        };
      });

      setUjian(formatted);
    } catch (err) {
      console.error("Gagal memuat data ujian CBT:", err);
      setError(
        err?.message || "Terjadi kesalahan saat memuat data ujian CBT dari server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const distinctKelas = useMemo(() => {
    const set = new Set();
    ujian.forEach((u) => {
      if (u.kelasNama && u.kelasNama !== "-") set.add(u.kelasNama);
    });
    return Array.from(set).sort();
  }, [ujian]);

  const distinctMapel = useMemo(() => {
    const set = new Set();
    ujian.forEach((u) => {
      if (u.mapel && u.mapel !== "-") set.add(u.mapel);
    });
    return Array.from(set).sort();
  }, [ujian]);

  const filteredUjian = useMemo(() => {
    return ujian.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (item.nama && item.nama.toLowerCase().includes(q)) ||
        (item.judul && item.judul.toLowerCase().includes(q)) ||
        (item.mapel && item.mapel.toLowerCase().includes(q)) ||
        (item.kelasNama && item.kelasNama.toLowerCase().includes(q)) ||
        (item.guru && item.guru.toLowerCase().includes(q));

      const matchStatus =
        filterStatus === "Semua" || item.status === filterStatus;

      const matchKelas =
        filterKelas === "Semua" || item.kelasNama === filterKelas;

      const matchMapel =
        filterMapel === "Semua" || item.mapel === filterMapel;

      return matchSearch && matchStatus && matchKelas && matchMapel;
    });
  }, [ujian, search, filterStatus, filterKelas, filterMapel]);

  const totalPages = Math.max(1, Math.ceil(filteredUjian.length / itemsPerPage));
  const paginatedUjian = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredUjian.slice(start, start + itemsPerPage);
  }, [filteredUjian, page, itemsPerPage]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleFilterStatusChange = (val) => {
    setFilterStatus(val);
    setPage(1);
  };

  const handleFilterKelasChange = (val) => {
    setFilterKelas(val);
    setPage(1);
  };

  const handleFilterMapelChange = (val) => {
    setFilterMapel(val);
    setPage(1);
  };

  const totalUjian = ujian.length;
  const aktifCount = ujian.filter((item) => item.status === "Aktif").length;
  const terjadwalCount = ujian.filter((item) => item.status === "Terjadwal").length;
  const totalPercobaan = ujian.reduce(
    (acc, curr) => acc + (Number(curr.peserta) || 0),
    0
  );

  const handleTogglePublish = async (item) => {
    try {
      const nextStatus = !item.dipublikasikan;
      await updateUjian(item.id, {
        dipublikasikan: nextStatus,
      });

      setActionSuccess(
        nextStatus
          ? `Ujian "${item.nama || item.judul}" berhasil dipublikasikan.`
          : `Ujian "${item.nama || item.judul}" dialihkan ke status Draft.`
      );
      setTimeout(() => setActionSuccess(null), 4000);
      fetchData();
    } catch (err) {
      console.error("Gagal mengubah status publikasi:", err);
      setActionError(
        err?.message || "Gagal mengubah status publikasi ujian."
      );
      setTimeout(() => setActionError(null), 5000);
    }
  };

  const openDeleteDialog = (item) => {
    setSelectedUjian(item);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedUjian) return;
    setSubmittingDelete(true);
    setDeleteError(null);

    try {
      await deleteUjian(selectedUjian.id);
      setActionSuccess(`Ujian "${selectedUjian.nama || selectedUjian.judul}" berhasil dihapus.`);
      setTimeout(() => setActionSuccess(null), 4000);
      setShowDeleteModal(false);
      setSelectedUjian(null);
      fetchData();
    } catch (err) {
      console.error("Gagal menghapus ujian:", err);
      setDeleteError(
        err?.message || "Gagal menghapus ujian dari sistem."
      );
    } finally {
      setSubmittingDelete(false);
    }
  };

  return (
    <div className="min-h-screen theme-page flex">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm theme-text-secondary mb-4">
            <span>CBT</span>
            <span>/</span>
            <span className="theme-text font-medium">Ujian CBT Online</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold theme-text tracking-tight">
                Ujian CBT Online
              </h1>
              <p className="text-sm theme-text-secondary mt-1">
                Pemantauan, pengelolaan asesmen, konfigurasi jadwal, dan bank soal ujian sekolah.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchData(true)}
                disabled={loading || refreshing}
                className="
                  inline-flex items-center gap-2 px-3.5 py-2
                  border theme-border rounded-lg text-sm font-medium
                  theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                  transition disabled:opacity-50
                "
                title="Segarkan data"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin text-[var(--color-primary)]" : ""}
                />
                <span>{refreshing ? "Menyegarkan..." : "Segarkan"}</span>
              </button>

              <Link
                href="/admin/lms-cbt/ujian/tambah"
                className="
                  inline-flex items-center gap-2 px-4 py-2
                  bg-[var(--color-primary)] text-white rounded-lg
                  text-sm font-medium hover:opacity-90 transition shadow-sm
                "
              >
                <Plus size={16} />
                <span>Buat Ujian</span>
              </Link>
            </div>
          </div>

          {actionSuccess && (
            <div className="mb-6 p-4 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] flex items-center justify-between text-sm text-[var(--color-success)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span className="font-medium">{actionSuccess}</span>
              </div>
              <button
                onClick={() => setActionSuccess(null)}
                className="p-1 hover:opacity-75 transition"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {actionError && (
            <div className="mb-6 p-4 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] flex items-center justify-between text-sm text-[var(--color-danger)]">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} />
                <span>{actionError}</span>
              </div>
              <button
                onClick={() => setActionError(null)}
                className="p-1 hover:opacity-75 transition"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] flex items-start gap-3 text-sm text-[var(--color-danger)]">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Gagal Memuat Data Ujian</p>
                <p className="mt-1">{error}</p>
                <button
                  onClick={() => fetchData()}
                  className="mt-3 px-3 py-1.5 bg-[var(--color-danger)] text-white rounded-md text-xs font-medium hover:opacity-90 transition"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Ujian"
              value={totalUjian}
              icon={FileQuestion}
              description="Seluruh asesmen sekolah"
              variant="primary"
            />
            <StatCard
              title="Ujian Aktif"
              value={aktifCount}
              icon={CheckCircle2}
              description="Sedang berlangsung"
              variant="success"
            />
            <StatCard
              title="Terjadwal"
              value={terjadwalCount}
              icon={CalendarDays}
              description="Akan datang"
              variant="warning"
            />
            <StatCard
              title="Total Percobaan Ujian"
              value={totalPercobaan}
              icon={Users}
              description="Seluruh rekaman sesi ujian"
              variant="info"
            />
          </div>

          <div className="theme-card border theme-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 md:p-5 border-b theme-border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                  />
                  <input
                    type="text"
                    placeholder="Cari judul, mapel, kelas, guru..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="
                      theme-input w-full pl-9 pr-3 py-2 border theme-border
                      rounded-lg text-sm theme-text theme-text-placeholder outline-none
                      focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]
                      focus:border-[var(--color-primary)]
                    "
                  />
                </div>

                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => handleFilterStatusChange(e.target.value)}
                    className="
                      theme-input w-full px-3 py-2 border theme-border rounded-lg
                      text-sm theme-text-secondary outline-none focus:ring-2
                      focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]
                      focus:border-[var(--color-primary)]
                    "
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Terjadwal">Terjadwal</option>
                    <option value="Draft">Draft</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>

                <div>
                  <select
                    value={filterKelas}
                    onChange={(e) => handleFilterKelasChange(e.target.value)}
                    className="
                      theme-input w-full px-3 py-2 border theme-border rounded-lg
                      text-sm theme-text-secondary outline-none focus:ring-2
                      focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]
                      focus:border-[var(--color-primary)]
                    "
                  >
                    <option value="Semua">Semua Kelas</option>
                    {distinctKelas.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={filterMapel}
                    onChange={(e) => handleFilterMapelChange(e.target.value)}
                    className="
                      theme-input w-full px-3 py-2 border theme-border rounded-lg
                      text-sm theme-text-secondary outline-none focus:ring-2
                      focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]
                      focus:border-[var(--color-primary)]
                    "
                  >
                    <option value="Semua">Semua Mata Pelajaran</option>
                    {distinctMapel.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(search || filterStatus !== "Semua" || filterKelas !== "Semua" || filterMapel !== "Semua") && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="theme-text-muted">
                    Menampilkan <strong>{filteredUjian.length}</strong> dari {ujian.length} ujian
                  </span>
                  <button
                    onClick={() => {
                      setSearch("");
                      setFilterStatus("Semua");
                      setFilterKelas("Semua");
                      setFilterMapel("Semua");
                    }}
                    className="text-[var(--color-primary)] hover:underline font-medium"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <Loader2
                  size={32}
                  className="animate-spin text-[var(--color-primary)] mx-auto mb-3"
                />
                <p className="text-sm theme-text-secondary">
                  Memuat data ujian CBT dari server...
                </p>
              </div>
            ) : filteredUjian.length === 0 ? (
              <div className="p-12 text-center">
                <FileQuestion
                  size={44}
                  className="theme-text-muted mx-auto mb-3 opacity-40"
                />
                <h3 className="font-semibold theme-text text-base">
                  Tidak Ada Ujian Ditemukan
                </h3>
                <p className="text-xs theme-text-muted mt-1 max-w-sm mx-auto">
                  {ujian.length === 0
                    ? "Belum ada data ujian CBT yang terdaftar pada sistem sekolah."
                    : "Tidak ada ujian yang cocok dengan kriteria pencarian atau filter yang dipilih."}
                </p>
              </div>
            ) : (
              <>
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="theme-card-soft border-b theme-border text-xs font-semibold theme-text-secondary uppercase tracking-wider">
                        <th className="px-4 py-3.5 w-12 text-center">No</th>
                        <th className="px-4 py-3.5">Ujian & Mapel</th>
                        <th className="px-4 py-3.5">Kelas & Guru</th>
                        <th className="px-4 py-3.5">Jadwal & Durasi</th>
                        <th className="px-4 py-3.5 text-center">Soal</th>
                        <th className="px-4 py-3.5 text-center">Percobaan</th>
                        <th className="px-4 py-3.5 text-center">Status</th>
                        <th className="px-4 py-3.5 text-center">Publikasi</th>
                        <th className="px-4 py-3.5 text-center w-36">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y theme-border text-sm">
                      {paginatedUjian.map((item, idx) => {
                        const rowNumber = (page - 1) * itemsPerPage + idx + 1;
                        const statusBadge =
                          statusConfig[item.status] || statusConfig.Draft;
                        const StatusIcon = statusBadge.icon;

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] transition"
                          >
                            <td className="px-4 py-3 text-center theme-text-muted text-xs">
                              {rowNumber}
                            </td>

                            <td className="px-4 py-3">
                              <Link
                                href={`/admin/lms-cbt/ujian/${item.id}`}
                                className="font-semibold theme-text hover:text-[var(--color-primary)] transition block"
                              >
                                {item.nama || item.judul}
                              </Link>
                              <div className="text-xs theme-text-secondary mt-0.5 flex items-center gap-1.5">
                                <BookOpen size={13} className="theme-text-muted" />
                                <span>{item.mapel || "-"}</span>
                                {item.tipe && (
                                  <span className="px-1.5 py-0.5 rounded bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] text-[10px] theme-text-muted font-medium">
                                    {item.tipe}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="font-medium theme-text text-xs">
                                {item.kelasNama || "-"}
                              </div>
                              <div className="text-xs theme-text-muted mt-0.5 flex items-center gap-1.5">
                                <GraduationCap size={13} />
                                <span>{item.guru || "-"}</span>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="text-xs font-medium theme-text flex items-center gap-1.5">
                                <CalendarDays size={13} className="theme-text-muted" />
                                <span>{item.tanggalFormatted}</span>
                              </div>
                              <div className="text-xs theme-text-muted mt-0.5 flex items-center gap-1.5">
                                <Clock3 size={13} />
                                <span>
                                  {item.waktuFormatted} ({item.durasi || 0} mnt)
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-3 text-center font-medium theme-text text-xs">
                              {item.jumlahSoal || 0}
                            </td>

                            <td className="px-4 py-3 text-center font-medium theme-text text-xs">
                              <span className="inline-flex items-center gap-1">
                                <Users size={13} className="theme-text-muted" />
                                {item.peserta || 0}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-center">
                              <span
                                className={`
                                  inline-flex items-center gap-1 px-2.5 py-1
                                  rounded-full text-xs font-medium border
                                  ${statusBadge.className}
                                `}
                              >
                                <StatusIcon size={12} />
                                {statusBadge.label}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleTogglePublish(item)}
                                className={`
                                  px-2.5 py-1 rounded text-xs font-medium transition border
                                  ${
                                    item.dipublikasikan
                                      ? "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-success)_18%,transparent)]"
                                      : "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-muted border-theme-border hover:theme-text"
                                  }
                                `}
                                title={
                                  item.dipublikasikan
                                    ? "Klik untuk jadikan Draf"
                                    : "Klik untuk publikasikan ujian"
                                }
                              >
                                {item.dipublikasikan ? "Terbit" : "Draf"}
                              </button>
                            </td>

                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Link
                                  href={`/admin/lms-cbt/ujian/${item.id}`}
                                  className="p-1.5 rounded-lg theme-text-secondary hover:text-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] transition"
                                  title="Lihat Rincian & Soal"
                                >
                                  <Eye size={16} />
                                </Link>
                                <Link
                                  href={`/admin/lms-cbt/ujian/${item.id}/edit`}
                                  className="p-1.5 rounded-lg theme-text-secondary hover:text-[var(--color-warning)] hover:bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] transition"
                                  title="Edit Ujian"
                                >
                                  <Pencil size={16} />
                                </Link>
                                <button
                                  onClick={() => openDeleteDialog(item)}
                                  className="p-1.5 rounded-lg theme-text-secondary hover:text-[var(--color-danger)] hover:bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] transition"
                                  title="Hapus Ujian"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="block lg:hidden divide-y theme-border">
                  {paginatedUjian.map((item) => {
                    const statusBadge =
                      statusConfig[item.status] || statusConfig.Draft;
                    const StatusIcon = statusBadge.icon;

                    return (
                      <div key={item.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/admin/lms-cbt/ujian/${item.id}`}
                              className="font-semibold theme-text text-sm hover:text-[var(--color-primary)] transition block"
                            >
                              {item.nama || item.judul}
                            </Link>
                            <p className="text-xs theme-text-secondary mt-0.5">
                              {item.mapel} • {item.kelasNama}
                            </p>
                          </div>
                          <span
                            className={`
                              inline-flex items-center gap-1 px-2 py-0.5
                              rounded-full text-[11px] font-medium border shrink-0
                              ${statusBadge.className}
                            `}
                          >
                            <StatusIcon size={11} />
                            {statusBadge.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs theme-text-secondary">
                          <div>
                            <span className="theme-text-muted block text-[10px]">
                              Jadwal:
                            </span>
                            <span>{item.tanggalFormatted}</span>
                          </div>
                          <div>
                            <span className="theme-text-muted block text-[10px]">
                              Waktu & Durasi:
                            </span>
                            <span>
                              {item.waktuFormatted} ({item.durasi || 0} mnt)
                            </span>
                          </div>
                          <div>
                            <span className="theme-text-muted block text-[10px]">
                              Guru:
                            </span>
                            <span>{item.guru || "-"}</span>
                          </div>
                          <div>
                            <span className="theme-text-muted block text-[10px]">
                              Soal & Sesi:
                            </span>
                            <span>
                              {item.jumlahSoal || 0} soal • {item.peserta || 0} percobaan
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t theme-border-soft">
                          <button
                            onClick={() => handleTogglePublish(item)}
                            className={`
                              px-2.5 py-1 rounded text-xs font-medium border
                              ${
                                item.dipublikasikan
                                  ? "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_30%,transparent)]"
                                  : "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-muted border-theme-border"
                              }
                            `}
                          >
                            {item.dipublikasikan ? "Publik: Terbit" : "Publik: Draf"}
                          </button>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/lms-cbt/ujian/${item.id}`}
                              className="p-1.5 rounded-lg theme-text-secondary hover:text-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] transition"
                              title="Detail"
                            >
                              <Eye size={16} />
                            </Link>
                            <Link
                              href={`/admin/lms-cbt/ujian/${item.id}/edit`}
                              className="p-1.5 rounded-lg theme-text-secondary hover:text-[var(--color-warning)] hover:bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] transition"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </Link>
                            <button
                              onClick={() => openDeleteDialog(item)}
                              className="p-1.5 rounded-lg theme-text-secondary hover:text-[var(--color-danger)] hover:bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] transition"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-4 py-3 border-t theme-border flex items-center justify-between text-xs theme-text-secondary">
                  <div>
                    Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong> (
                    {filteredUjian.length} total ujian)
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-1.5 border theme-border rounded-md hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-40 transition"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="p-1.5 border theme-border rounded-md hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-40 transition"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {showDeleteModal && selectedUjian && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={() => {
              if (!submittingDelete) {
                setShowDeleteModal(false);
                setSelectedUjian(null);
              }
            }}
          />
          <div className="relative w-full max-w-md theme-card border theme-border rounded-xl shadow-2xl p-6 overflow-hidden animate-scaleUp text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] flex items-center justify-center text-[var(--color-danger)] mb-4">
              <Trash2 size={24} />
            </div>

            <h3 className="font-semibold theme-text text-base">
              Hapus ujian ini dari sistem?
            </h3>

            <p className="text-sm theme-text-secondary mt-2 leading-relaxed">
              Ujian <span className="font-semibold theme-text">{selectedUjian.nama || selectedUjian.judul}</span> ({selectedUjian.mapel}) akan dinonaktifkan. Butir soal yang terkait juga akan dinonaktifkan.
            </p>

            {deleteError && (
              <div className="mt-4 p-3 rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-xs text-[var(--color-danger)] text-left flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUjian(null);
                }}
                disabled={submittingDelete}
                className="px-4 py-2 border theme-border rounded-lg text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={submittingDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-danger)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {submittingDelete && <Loader2 size={16} className="animate-spin" />}
                <span>{submittingDelete ? "Menghapus..." : "Hapus Ujian"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function StatCard({ title, value, icon: Icon, description, variant = "primary" }) {
  const variantConfig = {
    primary: {
      bg: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
      text: "text-[var(--color-primary)]",
    },
    success: {
      bg: "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
      text: "text-[var(--color-success)]",
    },
    warning: {
      bg: "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]",
      text: "text-[var(--color-warning)]",
    },
    info: {
      bg: "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",
      text: "text-[var(--color-info)]",
    },
  };

  const current = variantConfig[variant] || variantConfig.primary;

  return (
    <div className="theme-card border theme-border rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium theme-text-secondary uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold theme-text mt-1.5">{value}</p>
          <p className="text-xs theme-text-muted mt-1">{description}</p>
        </div>
        <div
          className={`w-10 h-10 rounded-lg ${current.bg} flex items-center justify-center ${current.text} shrink-0`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
