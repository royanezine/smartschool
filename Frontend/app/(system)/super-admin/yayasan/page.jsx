"use client";

import {
  useState,
  useEffect,
  useCallback,
} from "react";
import Link from "next/link";
import {
  Landmark,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  FileSpreadsheet,
  School,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  Loader2,
  Building,
} from "lucide-react";

import { listYayasan, deleteYayasan } from "@/services/yayasan.service";
import { getPlatformRingkasan, getPlatformYayasan } from "@/services/platform.service";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeInfoSoft =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeSuccessSoft =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSoft =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeDangerSoft =
  "bg-[color-mix(in_srgb,var(--color-danger,_#ef4444)_9%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-danger,_#ef4444)_22%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_80%,#000))]";

const inputClass = `
  h-10
  w-full
  rounded-xl
  border
  theme-border
  ${themeNeutralSurface}
  px-3
  text-sm
  theme-text
  outline-none
  transition-all
  placeholder:text-[var(--color-text-placeholder)]
  hover:border-[color-mix(in_srgb,var(--color-primary)_25%,var(--color-border))]
  ${themeFocus}
`.replace(/\s+/g, " ").trim();

const selectClass = `
  h-10
  w-full
  cursor-pointer
  appearance-none
  rounded-xl
  border
  theme-border
  ${themeNeutralSurface}
  pl-3
  pr-8
  text-sm
  theme-text-secondary
  outline-none
  transition-all
  ${themeFocus}
`.replace(/\s+/g, " ").trim();

function formatDate(value) {
  if (!value) return "-";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return "-";
  }
}

export default function SuperAdminYayasanPage() {
  const [yayasanList, setYayasanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const [summary, setSummary] = useState({
    totalYayasan: 0,
    yayasanAktif: 0,
    yayasanNonaktif: 0,
    yayasanBerlangganan: 0,
  });

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [selectedBerlangganan, setSelectedBerlangganan] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch summary
  useEffect(() => {
    let mounted = true;
    async function loadRingkasan() {
      try {
        const res = await getPlatformRingkasan();
        if (mounted && res?.data) {
          setSummary((prev) => ({
            ...prev,
            totalYayasan: Number(res.data.totalYayasan) || 0,
          }));
        }
      } catch (err) {
        console.warn("Gagal memuat ringkasan platform:", err);
      }
    }
    loadRingkasan();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch list yayasan from backend
  const fetchYayasanData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: currentPage,
        limit: pageSize,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (selectedStatus !== "Semua") {
        params.status = selectedStatus.toLowerCase();
      }

      if (selectedBerlangganan === "Berlangganan") {
        params.berlangganan = "true";
      } else if (selectedBerlangganan === "Tanpa Paket") {
        params.berlangganan = "false";
      }

      const res =
        selectedBerlangganan === "Berlangganan"
          ? await listYayasan(params)
          : await getPlatformYayasan(params);

      const items =
        (Array.isArray(res?.data?.items) ? res.data.items : null) ||
        (Array.isArray(res?.data) ? res.data : null) ||
        (Array.isArray(res?.items) ? res.items : null) ||
        [];

      setYayasanList(items);

      const paginationData = res?.meta || res?.pagination || res?.data?.pagination;
      if (paginationData) {
        setMeta({
          page: paginationData.page || currentPage,
          limit: paginationData.limit || pageSize,
          total: paginationData.total || items.length,
          totalPages: paginationData.totalPages || 1,
        });
      } else {
        setMeta({
          page: currentPage,
          limit: pageSize,
          total: items.length,
          totalPages: Math.ceil(items.length / pageSize) || 1,
        });
      }

      const aktifCount = items.filter((y) => y.status === "aktif").length;
      const nonaktifCount = items.filter((y) => y.status === "nonaktif").length;
      const berlanggananCount = items.filter(
        (y) => Boolean(y.paketId || y.paket || y.langganan?.paket)
      ).length;

      setSummary((prev) => ({
        ...prev,
        yayasanAktif: aktifCount,
        yayasanNonaktif: nonaktifCount,
        yayasanBerlangganan: berlanggananCount,
      }));
    } catch (err) {
      console.error("Gagal memuat daftar yayasan:", err);
      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Gagal memuat data yayasan dari server."
      );
      setYayasanList([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, selectedStatus, selectedBerlangganan]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      if (active) {
        await fetchYayasanData();
      }
    });
    return () => {
      active = false;
    };
  }, [fetchYayasanData]);

  const handleResetFilter = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedStatus("Semua");
    setSelectedBerlangganan("Semua");
    setCurrentPage(1);
  };

  // Handle Delete Confirmation
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setDeleteError("");

      const res = await deleteYayasan(deleteTarget.id);

      setSuccessMessage(
        res?.message || `Yayasan "${deleteTarget.nama}" berhasil dinonaktifkan.`
      );
      setToast({
        type: "success",
        message: res?.message || `Yayasan "${deleteTarget.nama}" berhasil dinonaktifkan.`,
      });
      setDeleteTarget(null);

      // Refresh list from backend
      await fetchYayasanData();

      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (err) {
      console.error("Gagal menonaktifkan yayasan:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal menonaktifkan yayasan.";
      setDeleteError(msg);
      setToast({
        type: "error",
        message: msg,
      });
    } finally {
      setDeleting(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (yayasanList.length === 0) {
      setToast({
        type: "warning",
        message: "Tidak ada data yayasan untuk diekspor.",
      });
      return;
    }

    const headers = [
      "No",
      "Nama Yayasan",
      "NPYP",
      "Status",
      "Paket Langganan",
      "Status Langganan",
      "Jumlah Sekolah",
      "Email",
      "Telepon",
      "Alamat",
      "Tanggal Terdaftar",
    ];

    const escapeCSV = (val) => {
      const text = String(val ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = yayasanList.map((item, idx) => [
      (currentPage - 1) * pageSize + idx + 1,
      item.nama || "-",
      item.npyp || "-",
      item.status || "aktif",
      item.paket?.nama || "Tanpa Paket",
      item.statusLangganan || "-",
      item._count?.sekolah ?? (item.sekolah?.length || 0),
      item.email || "-",
      item.telepon || "-",
      item.alamat || "-",
      formatDate(item.dibuatPada),
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.map(escapeCSV).join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `data-yayasan-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="theme-page theme-text min-h-full w-full min-w-0">
      <main className="w-full min-w-0">
        {/* Tidak ada max-w + mx-auto: konten menempel ke sidebar dan
            mengisi sisa lebar layar, berapa pun level zoom-nya. */}
        <div className="w-full min-w-0 space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 2xl:px-10">
          {/* Header Banner */}
          <section
            className={`relative overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
          >
            <div
              className={`pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full ${themePrimarySoft} opacity-70 blur-3xl`}
            />
            <div
              className={`pointer-events-none absolute bottom-0 right-24 h-40 w-40 rounded-full ${themePrimarySoft} opacity-60 blur-3xl`}
            />

            <div className="relative p-5 sm:p-6 lg:p-7">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white sm:h-12 sm:w-12 ${themePrimaryGradient} ${themeSmallShadow}`}
                    >
                      <Landmark size={22} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-semibold tracking-tight theme-text sm:text-2xl">
                          Data Master Yayasan
                        </h1>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:text-xs ${themePrimarySoft} ${themePrimarySoftBorder} text-[var(--color-primary)]`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                          Super Admin
                        </span>
                      </div>

                      <p className="mt-1 text-xs theme-text-secondary sm:text-sm">
                        Kelola data lembaga yayasan pendidikan, relasi sekolah naungan, dan akun pengelola yayasan.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/super-admin/yayasan/tambah"
                    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white ${themeSmallShadow} transition-all hover:opacity-90`}
                  >
                    <Plus size={16} strokeWidth={2} />
                    <span>Tambah Yayasan</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary ${themeSmallShadow} transition-all ${themeNeutralHover}`}
                  >
                    <FileSpreadsheet size={16} strokeWidth={1.8} />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Success Banner */}
          {successMessage && (
            <section
              className={`rounded-2xl border px-4 py-3 ${themeSuccessSoft} ${themeSuccessBorder}`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-[var(--color-success)] shrink-0" />
                <p className="text-sm font-medium theme-text">{successMessage}</p>
              </div>
            </section>
          )}

          {/* Error Banner */}
          {error && (
            <section
              className={`rounded-2xl border px-4 py-3 ${themeDangerSoft} ${themeDangerBorder}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themeDangerSoft} text-red-500`}
                  >
                    <XCircle size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold theme-text">
                      Gagal memuat data yayasan
                    </p>
                    <p className="mt-0.5 text-xs theme-text-secondary">{error}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fetchYayasanData}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg border ${themeDangerBorder} theme-card px-3 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30`}
                >
                  <RotateCcw size={14} />
                  Coba Lagi
                </button>
              </div>
            </section>
          )}

          {/* Stat Cards */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Total Yayasan"
              value={loading ? "..." : meta.total || summary.totalYayasan || yayasanList.length}
              icon={Landmark}
              color="primary"
            />
            <StatCard
              label="Yayasan Aktif"
              value={loading ? "..." : summary.yayasanAktif}
              icon={CheckCircle2}
              color="success"
            />
            <StatCard
              label="Yayasan Nonaktif"
              value={loading ? "..." : summary.yayasanNonaktif}
              icon={XCircle}
              color="danger"
            />
            <StatCard
              label="Berlangganan Paket"
              value={loading ? "..." : summary.yayasanBerlangganan}
              icon={Building}
              color="info"
            />
          </section>

          {/* Filter & Search Bar */}
          <section
            className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
          >
            <div className={`border-b ${themeDivider} px-4 py-4 sm:px-5`}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-secondary`}
                  >
                    <SlidersHorizontal size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold theme-text">Filter & Pencarian Yayasan</h2>
                    <p className="text-[11px] theme-text-muted">
                      Cari nama yayasan, NPYP, atau saring berdasarkan status dan status paket
                    </p>
                  </div>
                </div>

                {(selectedStatus !== "Semua" || selectedBerlangganan !== "Semua" || debouncedSearch) && (
                  <button
                    type="button"
                    onClick={handleResetFilter}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg border theme-border theme-card px-3 text-xs theme-text-secondary transition-colors ${themeNeutralHover}`}
                  >
                    <RotateCcw size={13} />
                    Reset Filter
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="relative">
                  <Search
                    size={17}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
                  />
                  <input
                    type="text"
                    placeholder="Cari nama yayasan atau NPYP..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>

                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    aria-label="Filter Status"
                    className={selectClass}
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="aktif">Status: Aktif</option>
                    <option value="nonaktif">Status: Nonaktif</option>
                  </select>
                </div>

                <div className="relative">
                  <select
                    value={selectedBerlangganan}
                    onChange={(e) => {
                      setSelectedBerlangganan(e.target.value);
                      setCurrentPage(1);
                    }}
                    aria-label="Filter Berlangganan"
                    className={selectClass}
                  >
                    <option value="Semua">Semua Langganan</option>
                    <option value="Berlangganan">Memiliki Paket Aktif</option>
                    <option value="Tanpa Paket">Tanpa Paket Langganan</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs theme-text-muted">
                <span>
                  Menampilkan <strong className="theme-text">{yayasanList.length}</strong> dari{" "}
                  <strong className="theme-text">{meta.total}</strong> yayasan
                </span>
                <span>Halaman {meta.page} dari {meta.totalPages || 1}</span>
              </div>
            </div>
          </section>

          {/* Table List Yayasan */}
          <section
            className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className={`border-b ${themeDivider} ${themeNeutralSurface}`}>
                    <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                      No
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                      Yayasan & NPYP
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                      Paket & Langganan
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                      Sekolah Naungan
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                      Kontak
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className={`divide-y ${themeDivider}`}>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 size={24} className="animate-spin text-[var(--color-primary)]" />
                          <p className="text-xs theme-text-muted">Memuat data yayasan...</p>
                        </div>
                      </td>
                    </tr>
                  ) : yayasanList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Landmark size={32} className="theme-text-muted opacity-40" />
                          <p className="text-sm font-medium theme-text">Tidak ada data yayasan</p>
                          <p className="text-xs theme-text-muted">
                            {debouncedSearch
                              ? "Coba gunakan kata kunci pencarian yang lain."
                              : "Belum ada yayasan terdaftar di sistem."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    yayasanList.map((item, index) => {
                      const rowNum = (currentPage - 1) * pageSize + index + 1;
                      const schoolCount =
                        item._count?.sekolah ??
                        (item.sekolah?.length || item.totalSekolah || 0);
                      const namaPaket =
                        item.paket?.nama ||
                        item.langganan?.paket?.nama ||
                        "Tanpa Paket";
                      const statusLangganan =
                        item.statusLangganan || item.langganan?.statusLangganan;
                      const tglBerakhir =
                        item.tanggalBerakhirLangganan ||
                        item.langganan?.tanggalBerakhir;

                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${themeNeutralHover}`}
                        >
                          <td className="w-14 px-5 py-4 text-xs theme-text-muted">
                            {rowNum.toString().padStart(2, "0")}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${themePrimarySoft} ${themePrimarySoftBorder} text-[var(--color-primary)]`}
                              >
                                <Landmark size={18} strokeWidth={1.8} />
                              </div>
                              <div className="min-w-0">
                                <Link
                                  href={`/super-admin/yayasan/${item.id}`}
                                  className="font-semibold theme-text hover:text-[var(--color-primary)] hover:underline truncate block"
                                >
                                  {item.nama}
                                </Link>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-[11px] theme-text-muted bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-1.5 py-0.5 rounded">
                                    NPYP: {item.npyp || "-"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-xs">
                              <p className="font-medium theme-text">
                                {namaPaket}
                              </p>
                              {statusLangganan && (
                                <p className="text-[11px] theme-text-muted capitalize">
                                  Status: {statusLangganan}
                                </p>
                              )}
                              {tglBerakhir && (
                                <p className="text-[10px] theme-text-muted">
                                  s.d {formatDate(tglBerakhir)}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="inline-flex items-center gap-1.5 rounded-lg border theme-border px-2.5 py-1 text-xs font-medium theme-text-secondary">
                              <School size={13} className="text-[var(--color-primary)]" />
                              <span>{schoolCount} Sekolah</span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-xs">
                            <p className="theme-text truncate max-w-[180px]">{item.email || "-"}</p>
                            <p className="theme-text-muted text-[11px]">{item.telepon || "-"}</p>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                item.status === "aktif"
                                  ? `${themeSuccessSoft} ${themeSuccessBorder} text-[var(--color-success)]`
                                  : `${themeDangerSoft} ${themeDangerBorder} text-red-500`
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  item.status === "aktif" ? "bg-[var(--color-success)]" : "bg-red-500"
                                }`}
                              />
                              {item.status === "aktif" ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/super-admin/yayasan/${item.id}`}
                                title="Lihat detail yayasan"
                                className={`flex h-8 w-8 items-center justify-center rounded-lg theme-text-muted transition-colors ${themePrimaryHover} hover:text-[var(--color-primary)]`}
                              >
                                <Eye size={15} />
                              </Link>

                              <Link
                                href={`/super-admin/yayasan/${item.id}/edit`}
                                title="Edit profil yayasan"
                                className={`flex h-8 w-8 items-center justify-center rounded-lg theme-text-muted transition-colors hover:bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] hover:text-[var(--color-warning)]`}
                              >
                                <Edit size={15} />
                              </Link>

                              <button
                                type="button"
                                title="Nonaktifkan yayasan"
                                onClick={() => {
                                  setDeleteTarget(item);
                                  setDeleteError("");
                                }}
                                className={`flex h-8 w-8 items-center justify-center rounded-lg theme-text-muted transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div
              className={`flex flex-col items-center justify-between gap-3 border-t ${themeDivider} px-4 py-4 sm:flex-row sm:px-5`}
            >
              <p className="text-xs theme-text-muted">
                Halaman <strong className="theme-text">{meta.page}</strong> dari{" "}
                <strong className="theme-text">{meta.totalPages || 1}</strong> (Total{" "}
                <strong className="theme-text">{meta.total}</strong> yayasan)
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border theme-border theme-card theme-text-secondary transition-colors ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="px-3 text-xs font-semibold theme-text">
                  {meta.page}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= (meta.totalPages || 1) || loading}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border theme-border theme-card theme-text-secondary transition-colors ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Delete / Deactivate Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border theme-border theme-card p-6 ${themeCardShadow}`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themeDangerSoft} text-red-500`}
              >
                <AlertTriangle size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold theme-text">
                  Nonaktifkan Yayasan?
                </h3>
                <p className="mt-1 text-xs theme-text-secondary">
                  Anda akan menonaktifkan yayasan{" "}
                  <strong className="theme-text">{deleteTarget.nama}</strong> (NPYP:{" "}
                  {deleteTarget.npyp || "-"}).
                </p>
                <p className="mt-2 text-[11px] theme-text-muted">
                  Perhatian: Backend tidak mengizinkan penonaktifan jika yayasan masih memiliki sekolah terhubung.
                </p>
              </div>
            </div>

            {deleteError && (
              <div
                className={`mt-4 rounded-xl border p-3 text-xs text-red-600 dark:text-red-400 ${themeDangerSoft} ${themeDangerBorder}`}
              >
                <strong>Gagal:</strong> {deleteError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError("");
                }}
                className={`rounded-xl border theme-border theme-card px-4 py-2 text-xs font-semibold theme-text-secondary transition-colors ${themeNeutralHover} disabled:opacity-50`}
              >
                Batal
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow transition-all hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Ya, Nonaktifkan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border theme-border theme-card p-4 shadow-xl max-w-md animate-in fade-in slide-in-from-bottom-2"
        >
          {toast.type === "warning" ? (
            <AlertTriangle size={18} className="text-[var(--color-warning)] shrink-0" />
          ) : toast.type === "error" ? (
            <XCircle size={18} className="text-red-500 shrink-0" />
          ) : (
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          )}
          <p className="text-xs sm:text-sm theme-text flex-1">{toast.message}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="theme-text-muted hover:theme-text transition-colors p-1"
            aria-label="Tutup"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colorClasses = {
    primary: {
      icon: `${themePrimarySoft} text-[var(--color-primary)]`,
      accent: "bg-[var(--color-primary)]",
    },
    success: {
      icon: `${themePrimarySoft} text-[var(--color-primary)]`,
      accent: "bg-[var(--color-primary)]",
    },
    warning: {
      icon: `${themePrimarySoft} text-[var(--color-primary)]`,
      accent: "bg-[var(--color-primary)]",
    },
    danger: {
      icon: `${themePrimarySoft} text-[var(--color-primary)]`,
      accent: "bg-[var(--color-primary)]",
    },
    info: {
      icon: `${themePrimarySoft} text-[var(--color-primary)]`,
      accent: "bg-[var(--color-primary)]",
    },
  };

  const current = colorClasses[color] || colorClasses.primary;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border theme-border theme-card p-4 ${themeSmallShadow} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div
        className={`absolute left-0 right-0 top-0 h-[2px] ${current.accent} opacity-70`}
      />
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${current.icon}`}
        >
          <Icon size={18} strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-medium uppercase tracking-wide theme-text-muted sm:text-[11px]">
            {label}
          </p>
          <p className="mt-0.5 text-lg font-bold tracking-tight theme-text sm:text-xl">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}