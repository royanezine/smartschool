"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  getDaftarIzin,
  verifikasiIzin,
  verifikasiPengajuan,
} from "@/services/izin.service";

import { apiFetch } from "../../../../../lib/api";

/* ============================================================
   HELPERS
   ============================================================ */

function normalizeResponse(response) {
  if (!response) return null;

  return (
    response?.data ??
    response?.result ??
    response?.results ??
    response
  );
}

function getArrayResponse(response) {
  const data = normalizeResponse(response);

  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.izin)) return data.izin;
  if (Array.isArray(data?.pengajuan)) return data.pengajuan;

  return [];
}

function formatTanggal(value) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatTanggalLengkap(value) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function calculateDuration(start, end) {
  if (!start || !end) return 0;

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const diff =
      Math.abs(endDate.getTime() - startDate.getTime()) /
      (1000 * 60 * 60 * 24);

    return Math.floor(diff) + 1;
  } catch {
    return 0;
  }
}

function getInitials(name) {
  if (!name) return "?";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item.charAt(0).toUpperCase())
    .join("");
}

function getNamaGuru(item) {
  return (
    item?.guru?.namaLengkap ||
    item?.guru?.nama ||
    item?.user?.namaLengkap ||
    item?.user?.nama ||
    item?.namaGuru ||
    item?.nama ||
    "Guru"
  );
}

function getStatus(item) {
  return String(
    item?.status ||
      item?.statusPengajuan ||
      item?.statusVerifikasi ||
      "menunggu"
  ).toLowerCase();
}

function getJenis(item) {
  return String(
    item?.jenis ||
      item?.jenisIzin ||
      item?.jenisPengajuan ||
      "izin"
  ).toLowerCase();
}

function getTanggalMulai(item) {
  return item?.tanggalMulai || item?.mulai || item?.tanggal || null;
}

function getTanggalSelesai(item) {
  return item?.tanggalSelesai || item?.selesai || item?.tanggalMulai || null;
}

function getAlasan(item) {
  return (
    item?.alasan ||
    item?.keterangan ||
    item?.keperluan ||
    item?.deskripsi ||
    "-"
  );
}

function getLampiran(item) {
  return (
    item?.lampiran ||
    item?.fileLampiran ||
    item?.file ||
    item?.dokumen ||
    item?.urlLampiran ||
    null
  );
}

function getId(item) {
  return (
    item?.id ||
    item?.izinId ||
    item?.pengajuanId ||
    item?.permohonanId
  );
}

function getStatusLabel(status) {
  const labels = {
    menunggu: "Menunggu",
    pending: "Menunggu",
    diajukan: "Diajukan",
    disetujui: "Disetujui",
    disetujui_sebagian: "Disetujui Sebagian",
    ditolak: "Ditolak",
    ditolak_sebagian: "Ditolak Sebagian",
    dibatalkan: "Dibatalkan",
  };

  return labels[status] || status;
}

function getJenisLabel(jenis) {
  const labels = {
    izin: "Izin",
    sakit: "Sakit",
    cuti: "Cuti",
    alpha: "Alpha",
    terlambat: "Terlambat",
  };

  return labels[jenis] || jenis;
}

function getStatusClass(status) {
  switch (status) {
    case "disetujui":
      return "theme-success";

    case "ditolak":
      return "theme-danger";

    case "menunggu":
    case "pending":
    case "diajukan":
      return "theme-warning";

    case "dibatalkan":
      return "theme-danger";

    default:
      return "theme-info";
  }
}

function getJenisClass(jenis) {
  switch (jenis) {
    case "sakit":
      return "theme-danger";

    case "cuti":
      return "theme-warning";

    case "izin":
      return "theme-info";

    default:
      return "theme-card-soft theme-text-secondary";
  }
}

function getUploadUrl(value) {
  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
  const cleanPath = value.replace(/^\/+/, "");

  return `${cleanBaseUrl}/${cleanPath}`;
}

/* ============================================================
   STAT CARD
   ============================================================ */

function StatCard({
  label,
  value,
  icon: Icon,
  description,
  type = "info",
}) {
  const iconClass = {
    success: "theme-success",
    warning: "theme-warning",
    danger: "theme-danger",
    info: "theme-info",
  };

  return (
    <div className="theme-card relative overflow-hidden rounded-2xl border shadow-sm">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="theme-text-muted text-sm font-medium">
              {label}
            </p>

            <p className="theme-text mt-2 text-3xl font-bold">
              {value}
            </p>

            {description && (
              <p className="theme-text-muted mt-1 text-xs">
                {description}
              </p>
            )}
          </div>

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass[type]}`}
          >
            <Icon size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STATUS BADGE
   ============================================================ */

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
        status
      )}`}
    >
      {status === "disetujui" && <CheckCircle2 size={13} />}

      {(status === "menunggu" ||
        status === "pending" ||
        status === "diajukan") && <Clock3 size={13} />}

      {status === "ditolak" && <XCircle size={13} />}

      {getStatusLabel(status)}
    </span>
  );
}

/* ============================================================
   JENIS BADGE
   ============================================================ */

function JenisBadge({ jenis }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getJenisClass(
        jenis
      )}`}
    >
      {getJenisLabel(jenis)}
    </span>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */

export default function PermohonanIzinGuruPage() {
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [jenisFilter, setJenisFilter] = useState("semua");

  const [selected, setSelected] = useState(null);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [processing, setProcessing] = useState(false);

  const [catatan, setCatatan] = useState("");

  /* ============================================================
     FETCH DATA
     ============================================================ */

  const fetchData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getDaftarIzin();

      const items = getArrayResponse(response);

      setData(items);
    } catch (err) {
      console.error("Gagal mengambil daftar izin:", err);

      setError(
        err?.message ||
          "Gagal mengambil data permohonan izin guru."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ============================================================
     FILTER DATA
     ============================================================ */

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return data.filter((item) => {
      const namaGuru = getNamaGuru(item).toLowerCase();
      const alasan = getAlasan(item).toLowerCase();

      const status = getStatus(item);
      const jenis = getJenis(item);

      const matchesSearch =
        !keyword ||
        namaGuru.includes(keyword) ||
        alasan.includes(keyword) ||
        jenis.includes(keyword);

      const matchesStatus =
        statusFilter === "semua" ||
        status === statusFilter;

      const matchesJenis =
        jenisFilter === "semua" ||
        jenis === jenisFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesJenis
      );
    });
  }, [data, search, statusFilter, jenisFilter]);

  /* ============================================================
     STATISTICS
     ============================================================ */

  const statistics = useMemo(() => {
    return {
      total: data.length,

      menunggu: data.filter((item) => {
        const status = getStatus(item);

        return (
          status === "menunggu" ||
          status === "pending" ||
          status === "diajukan"
        );
      }).length,

      disetujui: data.filter(
        (item) => getStatus(item) === "disetujui"
      ).length,

      ditolak: data.filter(
        (item) => getStatus(item) === "ditolak"
      ).length,
    };
  }, [data]);

  /* ============================================================
     OPEN DETAIL
     ============================================================ */

  const handleOpenDetail = (item) => {
    setSelected(item);
    setCatatan("");
  };

  /* ============================================================
     CLOSE DETAIL
     ============================================================ */

  const handleCloseDetail = () => {
    if (processing) return;

    setSelected(null);
    setCatatan("");
  };

  /* ============================================================
     APPROVE
     ============================================================ */

  const handleApprove = async () => {
    if (!selected || processing) return;

    const id = getId(selected);

    if (!id) {
      setError("ID permohonan izin tidak ditemukan.");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      let response;

      try {
        response = await verifikasiIzin(id, {
          status: "disetujui",
          catatan: catatan || undefined,
        });
      } catch {
        response = await verifikasiPengajuan(id, {
          status: "disetujui",
          catatan: catatan || undefined,
        });
      }

      const result = normalizeResponse(response);

      if (
        result?.success === false ||
        response?.success === false
      ) {
        throw new Error(
          result?.message ||
            response?.message ||
            "Gagal menyetujui permohonan izin."
        );
      }

      setShowApproveModal(false);
      setSelected(null);
      setCatatan("");

      await fetchData(true);
    } catch (err) {
      console.error("Gagal menyetujui izin:", err);

      setError(
        err?.message ||
          "Gagal menyetujui permohonan izin."
      );
    } finally {
      setProcessing(false);
    }
  };

  /* ============================================================
     REJECT
     ============================================================ */

  const handleReject = async () => {
    if (!selected || processing) return;

    const id = getId(selected);

    if (!id) {
      setError("ID permohonan izin tidak ditemukan.");
      return;
    }

    if (!catatan.trim()) {
      setError("Catatan penolakan wajib diisi.");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      let response;

      try {
        response = await verifikasiIzin(id, {
          status: "ditolak",
          catatan: catatan.trim(),
        });
      } catch {
        response = await verifikasiPengajuan(id, {
          status: "ditolak",
          catatan: catatan.trim(),
        });
      }

      const result = normalizeResponse(response);

      if (
        result?.success === false ||
        response?.success === false
      ) {
        throw new Error(
          result?.message ||
            response?.message ||
            "Gagal menolak permohonan izin."
        );
      }

      setShowRejectModal(false);
      setSelected(null);
      setCatatan("");

      await fetchData(true);
    } catch (err) {
      console.error("Gagal menolak izin:", err);

      setError(
        err?.message ||
          "Gagal menolak permohonan izin."
      );
    } finally {
      setProcessing(false);
    }
  };

  /* ============================================================
     RESET FILTER
     ============================================================ */

  const resetFilter = () => {
    setSearch("");
    setStatusFilter("semua");
    setJenisFilter("semua");
  };

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="theme-page flex min-h-screen">
      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <Sidebar />

      {/* ========================================================
          CONTENT
      ======================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {/* ==================================================
                BREADCRUMB
            ================================================== */}

            <div className="theme-text-muted mb-5 flex items-center gap-2 text-sm">
              <span>Guru</span>

              <span>/</span>

              <span className="theme-text font-medium">
                Permohonan Izin
              </span>
            </div>

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <div className="theme-primary flex h-11 w-11 items-center justify-center rounded-xl">
                    <FileText size={21} />
                  </div>

                  <div>
                    <h1 className="theme-text text-2xl font-bold">
                      Permohonan Izin Siswa
                    </h1>

                    <p className="theme-text-secondary mt-1 text-sm">
                      Kelola dan verifikasi pengajuan izin guru.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="theme-card theme-text hover:theme-card-soft inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={
                    refreshing ? "animate-spin" : ""
                  }
                />

                {refreshing ? "Memuat..." : "Muat Ulang"}
              </button>
            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div className="theme-danger mb-6 flex items-start gap-3 rounded-xl border p-4">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-1 text-sm opacity-90">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="shrink-0 opacity-70 transition hover:opacity-100"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {/* ==================================================
                STATISTICS
            ================================================== */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Pengajuan"
                value={statistics.total}
                description="Seluruh permohonan"
                icon={FileText}
                type="info"
              />

              <StatCard
                label="Menunggu"
                value={statistics.menunggu}
                description="Perlu diverifikasi"
                icon={Clock3}
                type="warning"
              />

              <StatCard
                label="Disetujui"
                value={statistics.disetujui}
                description="Pengajuan diterima"
                icon={CheckCircle2}
                type="success"
              />

              <StatCard
                label="Ditolak"
                value={statistics.ditolak}
                description="Pengajuan ditolak"
                icon={XCircle}
                type="danger"
              />
            </div>

            {/* ==================================================
                FILTER
            ================================================== */}

            <div className="theme-card mb-6 rounded-2xl border p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Filter
                  size={18}
                  className="theme-text-secondary"
                />

                <h2 className="theme-text text-sm font-semibold">
                  Filter Data
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {/* SEARCH */}

                <div className="relative xl:col-span-2">
                  <Search
                    size={17}
                    className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Cari nama guru atau alasan..."
                    className="theme-input h-11 w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>

                {/* STATUS */}

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="theme-input h-11 w-full rounded-xl border px-3 text-sm outline-none transition focus:ring-2 focus:ring-[var(--color-primary)]/20"
                >
                  <option value="semua">
                    Semua Status
                  </option>

                  <option value="menunggu">
                    Menunggu
                  </option>

                  <option value="diajukan">
                    Diajukan
                  </option>

                  <option value="disetujui">
                    Disetujui
                  </option>

                  <option value="ditolak">
                    Ditolak
                  </option>
                </select>

                {/* JENIS */}

                <select
                  value={jenisFilter}
                  onChange={(event) =>
                    setJenisFilter(event.target.value)
                  }
                  className="theme-input h-11 w-full rounded-xl border px-3 text-sm outline-none transition focus:ring-2 focus:ring-[var(--color-primary)]/20"
                >
                  <option value="semua">
                    Semua Jenis
                  </option>

                  <option value="izin">
                    Izin
                  </option>

                  <option value="sakit">
                    Sakit
                  </option>

                  <option value="cuti">
                    Cuti
                  </option>
                </select>
              </div>

              {(search ||
                statusFilter !== "semua" ||
                jenisFilter !== "semua") && (
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="theme-text-muted text-xs">
                    Menampilkan{" "}
                    <span className="theme-text font-semibold">
                      {filteredData.length}
                    </span>{" "}
                    dari{" "}
                    <span className="theme-text font-semibold">
                      {data.length}
                    </span>{" "}
                    data
                  </p>

                  <button
                    type="button"
                    onClick={resetFilter}
                    className="theme-primary-outline text-xs font-semibold"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {/* ==================================================
                CONTENT
            ================================================== */}

            {loading ? (
              <div className="theme-card flex min-h-[400px] items-center justify-center rounded-2xl border shadow-sm">
                <div className="flex flex-col items-center gap-3">
                  <Loader2
                    size={32}
                    className="animate-spin"
                    style={{
                      color: "var(--color-primary)",
                    }}
                  />

                  <p className="theme-text-secondary text-sm">
                    Memuat data permohonan...
                  </p>
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="theme-card flex min-h-[400px] flex-col items-center justify-center rounded-2xl border p-8 text-center shadow-sm">
                <div className="theme-card-soft mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <FileText
                    size={28}
                    className="theme-text-muted"
                  />
                </div>

                <h3 className="theme-text text-lg font-semibold">
                  Tidak ada data
                </h3>

                <p className="theme-text-muted mt-2 max-w-md text-sm">
                  Tidak ditemukan permohonan izin yang sesuai
                  dengan filter yang dipilih.
                </p>

                {(search ||
                  statusFilter !== "semua" ||
                  jenisFilter !== "semua") && (
                  <button
                    type="button"
                    onClick={resetFilter}
                    className="theme-primary mt-5 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            ) : (
              <div className="theme-card overflow-hidden rounded-2xl border shadow-sm">
                {/* ==================================================
                    TABLE HEADER
                ================================================== */}

                <div className="theme-table-header border-b px-5 py-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="theme-text font-semibold">
                        Daftar Permohonan
                      </h2>

                      <p className="theme-text-muted mt-1 text-xs">
                        {filteredData.length} permohonan ditemukan
                      </p>
                    </div>

                    <div className="theme-text-muted flex items-center gap-2 text-xs">
                      <Users size={15} />

                      <span>
                        {statistics.total} total pengajuan
                      </span>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    TABLE
                ================================================== */}

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead className="theme-table-header border-b">
                      <tr>
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                          Guru
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                          Jenis
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                          Tanggal
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                          Durasi
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">
                          Status
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border)]">
                      {filteredData.map((item) => {
                        const id = getId(item);
                        const nama = getNamaGuru(item);
                        const jenis = getJenis(item);
                        const status = getStatus(item);

                        const tanggalMulai =
                          getTanggalMulai(item);

                        const tanggalSelesai =
                          getTanggalSelesai(item);

                        const duration =
                          calculateDuration(
                            tanggalMulai,
                            tanggalSelesai
                          );

                        return (
                          <tr
                            key={id || `${nama}-${tanggalMulai}`}
                            className="theme-table-hover transition-colors"
                          >
                            {/* GURU */}

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="theme-card-soft theme-text flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold">
                                  {getInitials(nama)}
                                </div>

                                <div className="min-w-0">
                                  <p className="theme-text truncate text-sm font-semibold">
                                    {nama}
                                  </p>

                                  <p className="theme-text-muted mt-0.5 text-xs">
                                    Pengajuan izin guru
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* JENIS */}

                            <td className="px-5 py-4">
                              <JenisBadge jenis={jenis} />
                            </td>

                            {/* TANGGAL */}

                            <td className="px-5 py-4">
                              <div className="flex items-start gap-2">
                                <CalendarDays
                                  size={16}
                                  className="theme-text-muted mt-0.5 shrink-0"
                                />

                                <div>
                                  <p className="theme-text text-sm font-medium">
                                    {formatTanggal(
                                      tanggalMulai
                                    )}
                                  </p>

                                  {tanggalSelesai &&
                                    tanggalSelesai !==
                                      tanggalMulai && (
                                      <p className="theme-text-muted mt-1 text-xs">
                                        s/d{" "}
                                        {formatTanggal(
                                          tanggalSelesai
                                        )}
                                      </p>
                                    )}
                                </div>
                              </div>
                            </td>

                            {/* DURASI */}

                            <td className="px-5 py-4">
                              <span className="theme-text text-sm font-medium">
                                {duration || "-"}{" "}
                                {duration === 1
                                  ? "hari"
                                  : "hari"}
                              </span>
                            </td>

                            {/* STATUS */}

                            <td className="px-5 py-4">
                              <StatusBadge status={status} />
                            </td>

                            {/* ACTION */}

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenDetail(item)
                                }
                                className="theme-primary-outline inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-[var(--color-primary)]/10"
                              >
                                Detail
                                <ExternalLink size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ==========================================================
          DETAIL DRAWER / MODAL
      ========================================================== */}

      {selected && (
        <div className="fixed inset-0 z-50">
          {/* OVERLAY */}

          <button
            type="button"
            aria-label="Tutup detail"
            onClick={handleCloseDetail}
            className="absolute inset-0 h-full w-full cursor-default bg-black/40 backdrop-blur-[1px]"
          />

          {/* PANEL */}

          <div className="theme-card absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l shadow-2xl">
            {/* HEADER */}

            <div className="theme-header flex items-center justify-between border-b px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseDetail}
                  className="theme-card-soft theme-text flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:opacity-80"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="min-w-0">
                  <h2 className="theme-text truncate text-lg font-bold">
                    Detail Permohonan
                  </h2>

                  <p className="theme-text-muted mt-0.5 text-xs">
                    Informasi pengajuan izin guru
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseDetail}
                className="theme-text-muted rounded-lg p-2 transition hover:bg-[var(--color-header-hover)] hover:text-[var(--color-text)]"
              >
                <X size={19} />
              </button>
            </div>

            {/* CONTENT */}

            <div className="flex-1 overflow-y-auto p-5">
              {/* GURU PROFILE */}

              <div className="theme-card-soft mb-5 rounded-2xl border p-4">
                <div className="flex items-center gap-4">
                  <div className="theme-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold">
                    {getInitials(
                      getNamaGuru(selected)
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="theme-text text-base font-bold">
                      {getNamaGuru(selected)}
                    </p>

                    <p className="theme-text-muted mt-1 text-sm">
                      Guru
                    </p>
                  </div>

                  <StatusBadge
                    status={getStatus(selected)}
                  />
                </div>
              </div>

              {/* DETAIL GRID */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="theme-card rounded-xl border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <FileText
                      size={16}
                      className="theme-text-muted"
                    />

                    <p className="theme-text-muted text-xs font-medium">
                      Jenis Pengajuan
                    </p>
                  </div>

                  <JenisBadge
                    jenis={getJenis(selected)}
                  />
                </div>

                <div className="theme-card rounded-xl border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Clock3
                      size={16}
                      className="theme-text-muted"
                    />

                    <p className="theme-text-muted text-xs font-medium">
                      Durasi
                    </p>
                  </div>

                  <p className="theme-text text-sm font-semibold">
                    {calculateDuration(
                      getTanggalMulai(selected),
                      getTanggalSelesai(selected)
                    ) || "-"}{" "}
                    hari
                  </p>
                </div>
              </div>

              {/* DATE */}

              <div className="theme-card mt-4 rounded-xl border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarDays
                    size={17}
                    className="theme-text-muted"
                  />

                  <p className="theme-text text-sm font-semibold">
                    Periode Izin
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="theme-text-muted text-xs">
                      Tanggal Mulai
                    </p>

                    <p className="theme-text mt-1 text-sm font-semibold">
                      {formatTanggalLengkap(
                        getTanggalMulai(selected)
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="theme-text-muted text-xs">
                      Tanggal Selesai
                    </p>

                    <p className="theme-text mt-1 text-sm font-semibold">
                      {formatTanggalLengkap(
                        getTanggalSelesai(selected)
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* REASON */}

              <div className="theme-card mt-4 rounded-xl border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <FileText
                    size={17}
                    className="theme-text-muted"
                  />

                  <p className="theme-text text-sm font-semibold">
                    Alasan / Keterangan
                  </p>
                </div>

                <p className="theme-text-secondary whitespace-pre-wrap text-sm leading-6">
                  {getAlasan(selected)}
                </p>
              </div>

              {/* ATTACHMENT */}

              {getLampiran(selected) && (
                <div className="theme-card mt-4 rounded-xl border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <FileText
                      size={17}
                      className="theme-text-muted"
                    />

                    <p className="theme-text text-sm font-semibold">
                      Lampiran
                    </p>
                  </div>

                  <a
                    href={getUploadUrl(
                      getLampiran(selected)
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="theme-primary-outline inline-flex items-center gap-2 text-sm font-semibold"
                  >
                    <ExternalLink size={15} />
                    Lihat Lampiran
                  </a>
                </div>
              )}

              {/* CATATAN VERIFIKASI */}

              {(getStatus(selected) === "menunggu" ||
                getStatus(selected) === "pending" ||
                getStatus(selected) === "diajukan") && (
                <div className="theme-card mt-4 rounded-xl border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <UserCheck
                      size={17}
                      className="theme-text-muted"
                    />

                    <p className="theme-text text-sm font-semibold">
                      Catatan Verifikasi
                    </p>
                  </div>

                  <textarea
                    value={catatan}
                    onChange={(event) =>
                      setCatatan(event.target.value)
                    }
                    rows={4}
                    placeholder="Tambahkan catatan jika diperlukan..."
                    className="theme-input w-full resize-none rounded-xl border p-3 text-sm outline-none transition focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>
              )}
            </div>

            {/* FOOTER */}

            {(getStatus(selected) === "menunggu" ||
              getStatus(selected) === "pending" ||
              getStatus(selected) === "diajukan") && (
              <div className="theme-header border-t p-5">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setShowRejectModal(true)
                    }
                    disabled={processing}
                    className="theme-danger inline-flex h-11 items-center justify-center gap-2 rounded-xl border font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle size={17} />
                    Tolak
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowApproveModal(true)
                    }
                    disabled={processing}
                    className="theme-success inline-flex h-11 items-center justify-center gap-2 rounded-xl border font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Check size={17} />
                    Setujui
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================================
          APPROVE MODAL
      ========================================================== */}

      {showApproveModal && selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Tutup modal"
            onClick={() => {
              if (!processing) {
                setShowApproveModal(false);
              }
            }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
          />

          <div className="theme-card relative w-full max-w-md rounded-2xl border p-6 shadow-2xl">
            <div className="mb-5 flex items-start gap-4">
              <div className="theme-success flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                <CheckCircle2 size={22} />
              </div>

              <div>
                <h3 className="theme-text text-lg font-bold">
                  Setujui Permohonan?
                </h3>

                <p className="theme-text-secondary mt-1 text-sm leading-5">
                  Permohonan izin dari{" "}
                  <span className="theme-text font-semibold">
                    {getNamaGuru(selected)}
                  </span>{" "}
                  akan disetujui.
                </p>
              </div>
            </div>

            <div className="theme-card-soft mb-5 rounded-xl border p-4">
              <p className="theme-text-muted text-xs">
                Jenis
              </p>

              <div className="mt-1">
                <JenisBadge
                  jenis={getJenis(selected)}
                />
              </div>

              <p className="theme-text-muted mt-3 text-xs">
                Periode
              </p>

              <p className="theme-text mt-1 text-sm font-medium">
                {formatTanggal(
                  getTanggalMulai(selected)
                )}{" "}
                -{" "}
                {formatTanggal(
                  getTanggalSelesai(selected)
                )}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowApproveModal(false)
                }
                disabled={processing}
                className="theme-card theme-text flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={processing}
                className="theme-success flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Memproses...
                  </span>
                ) : (
                  "Ya, Setujui"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          REJECT MODAL
      ========================================================== */}

      {showRejectModal && selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Tutup modal"
            onClick={() => {
              if (!processing) {
                setShowRejectModal(false);
              }
            }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
          />

          <div className="theme-card relative w-full max-w-md rounded-2xl border p-6 shadow-2xl">
            <div className="mb-5 flex items-start gap-4">
              <div className="theme-danger flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                <XCircle size={22} />
              </div>

              <div>
                <h3 className="theme-text text-lg font-bold">
                  Tolak Permohonan?
                </h3>

                <p className="theme-text-secondary mt-1 text-sm leading-5">
                  Permohonan dari{" "}
                  <span className="theme-text font-semibold">
                    {getNamaGuru(selected)}
                  </span>{" "}
                  akan ditolak.
                </p>
              </div>
            </div>

            <div className="mb-5">
              <label className="theme-text mb-2 block text-sm font-semibold">
                Alasan Penolakan
                <span className="theme-danger ml-1">
                  *
                </span>
              </label>

              <textarea
                value={catatan}
                onChange={(event) =>
                  setCatatan(event.target.value)
                }
                rows={4}
                placeholder="Masukkan alasan penolakan..."
                className="theme-input w-full resize-none rounded-xl border p-3 text-sm outline-none transition focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />

              <p className="theme-text-muted mt-1.5 text-xs">
                Alasan ini akan dicatat sebagai catatan
                verifikasi.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowRejectModal(false)
                }
                disabled={processing}
                className="theme-card theme-text flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={
                  processing || !catatan.trim()
                }
                className="theme-danger flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Memproses...
                  </span>
                ) : (
                  "Ya, Tolak"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}