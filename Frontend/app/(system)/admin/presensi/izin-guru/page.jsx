"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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

/* =========================================================
   HELPER RESPONSE
========================================================= */

function normalizeResponseData(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  if (Array.isArray(response.data?.items)) return response.data.items;
  if (Array.isArray(response.data?.results)) return response.data.results;
  if (Array.isArray(response.data?.users)) return response.data.users;
  if (Array.isArray(response.users)) return response.users;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.results)) return response.results;
  return [];
}

/* =========================================================
   FORMAT
========================================================= */

function formatTanggal(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTanggalSingkat(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTanggalWaktu(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function hitungDurasi(tanggalMulai, tanggalSelesai) {
  if (!tanggalMulai || !tanggalSelesai) return "-";
  const mulai = new Date(tanggalMulai);
  const selesai = new Date(tanggalSelesai);
  if (Number.isNaN(mulai.getTime()) || Number.isNaN(selesai.getTime())) return "-";
  const selisih = Math.abs(selesai.getTime() - mulai.getTime());
  const hari = Math.floor(selisih / (1000 * 60 * 60 * 24));
  return `${hari + 1} hari`;
}

function getInitials(name) {
  if (!name) return "GU";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function getJenisLabel(jenis) {
  if (jenis === "sakit") return "Sakit";
  if (jenis === "izin") return "Izin";
  return jenis || "-";
}

function getStatusLabel(status) {
  if (status === "menunggu") return "Menunggu";
  if (status === "disetujui") return "Disetujui";
  if (status === "ditolak") return "Ditolak";
  return status || "-";
}

function getStatusStyle(status) {
  if (status === "menunggu") {
    return {
      badge: "bg-[var(--color-primary)] from-amber-50 to-orange-50 theme-warning border-amber-200",
      dot: "bg-amber-500",
    };
  }
  if (status === "disetujui") {
    return {
      badge: "bg-[var(--color-primary)] from-emerald-50 to-teal-50 theme-success border-emerald-200",
      dot: "bg-emerald-500",
    };
  }
  if (status === "ditolak") {
    return {
      badge: "bg-[var(--color-primary)] from-red-50 to-rose-50 theme-danger border-red-200",
      dot: "bg-red-500",
    };
  }
  return {
    badge: "theme-card-soft theme-text-secondary theme-border",
    dot: "bg-slate-400",
  };
}

function getJenisStyle(jenis) {
  if (jenis === "sakit") {
    return "theme-warning border border-transparent";
  }
  if (jenis === "izin") {
    return "bg-[var(--color-primary)] from-blue-50 to-indigo-50 theme-text-primary border-blue-200";
  }
  return "theme-card-soft theme-text-secondary theme-border";
}

function getUploadUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}

/* =========================================================
   MAP IZIN
========================================================= */

function mapIzinToAdminData(item) {
  return {
    id: item?.id,
    nama:
      item?.pengguna?.namaLengkap ||
      item?.namaLengkap ||
      "Tidak diketahui",
    nip: item?.pengguna?.nip || item?.nip || "-",
    jabatan: item?.pengguna?.jabatan || item?.jabatan || "Guru",
    penggunaId: item?.penggunaId || item?.pengguna?.id || null,
    jenis: item?.jenis || "-",
    tanggalMulai: item?.tanggalMulai || null,
    tanggalSelesai: item?.tanggalSelesai || null,
    alasan: item?.alasan || "-",
    urlBukti: item?.urlBukti || null,
    status: item?.status || "menunggu",
    catatan: item?.catatan || null,
    penyetujuId: item?.penyetujuId || null,
    penyetujuNama: item?.penyetuju?.namaLengkap || null,
    dibuatPada: item?.dibuatPada || null,
    diperbaruiPada: item?.diperbaruiPada || null,
    guruPenggantiId:
      item?.guruPenggantiId || item?.guruPengganti?.id || null,
    guruPengganti: item?.guruPengganti || null,
  };
}

function normalizeGuru(item) {
  if (!item) return null;
  const id = item.id || item.userId || item.penggunaId;
  const namaLengkap =
    item.namaLengkap || item.nama || item.name || item.pengguna?.namaLengkap;
  if (!id || !namaLengkap) return null;
  return {
    id: String(id),
    namaLengkap,
    nip: item.nip || item.pengguna?.nip || null,
    jabatan: item.jabatan || item.pengguna?.jabatan || "Guru",
    peran:
      item.peran ||
      item.role ||
      item.namaRole ||
      item.pengguna?.peran ||
      null,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function PermohonanIzinGuruPage() {
  const [data, setData] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [jenisFilter, setJenisFilter] = useState("semua");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [guruLoading, setGuruLoading] = useState(false);
  const [guruError, setGuruError] = useState("");
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedGuruPenggantiId, setSelectedGuruPenggantiId] = useState("");
  const [rejectCatatan, setRejectCatatan] = useState("");

  /* =========================================================
     LOAD
  ========================================================= */

  const loadData = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);
        setError("");

        const response = await getDaftarIzin();
        const normalized = normalizeResponseData(response);
        const mapped = normalized.map(mapIzinToAdminData);

        setData(mapped);

        if (selectedId) {
          const masihAda = mapped.some((item) => item.id === selectedId);
          if (!masihAda) setSelectedId(null);
        }
      } catch (err) {
        console.error("Gagal mengambil data permohonan izin:", err);
        setError(err?.message || "Gagal mengambil data permohonan izin.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedId]
  );

  const loadGuru = useCallback(async () => {
    try {
      setGuruLoading(true);
      setGuruError("");

      const response = await apiFetch("/api/users/?role=guru&limit=100", {
        method: "GET",
      });

      const normalized = normalizeResponseData(response);
      const normalizedGuru = normalized.map(normalizeGuru).filter(Boolean);

      const uniqueGuru = Array.from(
        new Map(normalizedGuru.map((guru) => [String(guru.id), guru])).values()
      );

      setGuruList(uniqueGuru);

      if (uniqueGuru.length === 0) {
        setGuruError(
          "Data guru kosong. Cek response endpoint /api/users/?role=guru&limit=100."
        );
      }
    } catch (err) {
      console.error("Gagal mengambil daftar guru:", err);
      setGuruError(err?.message || "Daftar guru tidak dapat dimuat.");
      setGuruList([]);
    } finally {
      setGuruLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadGuru();
  }, [loadData, loadGuru]);

  /* =========================================================
     SELECTED
  ========================================================= */

  const selectedData = useMemo(() => {
    if (!selectedId) return null;
    return data.find((item) => item.id === selectedId) || null;
  }, [data, selectedId]);

  const selectedGuruPengganti = useMemo(() => {
    if (!selectedGuruPenggantiId) return null;
    return (
      guruList.find(
        (guru) => String(guru.id) === String(selectedGuruPenggantiId)
      ) || null
    );
  }, [guruList, selectedGuruPenggantiId]);

  const detailGuruPengganti = useMemo(() => {
    if (!selectedData?.guruPenggantiId) return null;
    if (selectedData.guruPengganti) return selectedData.guruPengganti;
    return (
      guruList.find(
        (guru) =>
          String(guru.id) === String(selectedData.guruPenggantiId)
      ) || null
    );
  }, [selectedData, guruList]);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return data.filter((item) => {
      const matchSearch =
        !keyword ||
        item.nama.toLowerCase().includes(keyword) ||
        String(item.nip || "").toLowerCase().includes(keyword) ||
        String(item.alasan || "").toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "semua" || item.status === statusFilter;
      const matchJenis = jenisFilter === "semua" || item.jenis === jenisFilter;

      return matchSearch && matchStatus && matchJenis;
    });
  }, [data, search, statusFilter, jenisFilter]);

  const statistics = useMemo(() => {
    return {
      total: data.length,
      menunggu: data.filter((item) => item.status === "menunggu").length,
      disetujui: data.filter((item) => item.status === "disetujui").length,
      ditolak: data.filter((item) => item.status === "ditolak").length,
    };
  }, [data]);

  /* =========================================================
     ACTIONS
  ========================================================= */

  const handleSelectData = (item) => {
    setSelectedId(item.id);
    setSelectedGuruPenggantiId(item.guruPenggantiId || "");
    setRejectCatatan("");
    setError("");
  };

  const openApproveModal = () => {
    if (!selectedData) return;
    setSelectedGuruPenggantiId(selectedData.guruPenggantiId || "");
    setGuruError("");
    if (guruList.length === 0) loadGuru();
    setShowApproveModal(true);
  };

  const closeApproveModal = () => {
    if (processingId) return;
    setShowApproveModal(false);
    if (!selectedData?.guruPenggantiId) setSelectedGuruPenggantiId("");
  };

  const openRejectModal = () => {
    if (!selectedData) return;
    setRejectCatatan(selectedData.catatan || "");
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    if (processingId) return;
    setShowRejectModal(false);
    setRejectCatatan("");
  };

  const handleApprove = async () => {
    if (!selectedData) return;
    if (!selectedGuruPenggantiId) {
      setError("Silakan pilih guru pengganti terlebih dahulu.");
      return;
    }

    try {
      setProcessingId(selectedData.id);
      setError("");

      await verifikasiPengajuan(selectedData.id, {
        status: "disetujui",
        catatan: "Permohonan izin disetujui.",
        guruPenggantiId: selectedGuruPenggantiId,
      });

      setShowApproveModal(false);
      await loadData(true);
      setSelectedGuruPenggantiId(selectedGuruPenggantiId);
    } catch (err) {
      console.error("Gagal menyetujui permohonan:", err);
      setError(err?.message || "Gagal menyetujui permohonan izin.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedData) return;

    try {
      setProcessingId(selectedData.id);
      setError("");

      await verifikasiIzin(selectedData.id, {
        status: "ditolak",
        catatan: rejectCatatan.trim() || "Permohonan izin ditolak.",
      });

      setShowRejectModal(false);
      setRejectCatatan("");
      setSelectedGuruPenggantiId("");
      await loadData(true);
    } catch (err) {
      console.error("Gagal menolak permohonan:", err);
      setError(err?.message || "Gagal menolak permohonan izin.");
    } finally {
      setProcessingId(null);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex h-screen w-full overflow-hidden theme-page">
      <Sidebar />

      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <header className="flex-shrink-0 z-30 theme-card backdrop-blur-md border-b theme-border">
          <Header />
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden theme-page">
          <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">

            {/* ============================================================
                HEADER PAGE — card dengan aksen gradient
            ============================================================ */}
            <div className="relative overflow-hidden rounded-2xl theme-card border theme-border shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-[var(--color-primary)]" />
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl theme-primary text-white shadow-lg shadow-sm">
                      <FileText className="h-6 w-6" />
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center gap-2 text-xs theme-text-placeholder">
                        <span>Admin</span>
                        <span>/</span>
                        <span>Presensi</span>
                        <span>/</span>
                        <span className="font-medium theme-text-secondary">
                          Permohonan Izin
                        </span>
                      </div>

                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight theme-text">
                        Permohonan Izin Guru
                      </h1>

                      <p className="mt-1 text-sm theme-text-muted">
                        Kelola pengajuan izin dan penugasan guru pengganti.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      loadData(true);
                      loadGuru();
                    }}
                    disabled={refreshing}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 text-sm font-medium theme-text-secondary shadow-sm transition hover:theme-card-soft hover:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                    {refreshing ? "Memuat..." : "Refresh"}
                  </button>
                </div>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-[var(--color-primary)] from-red-50 to-rose-50 px-4 py-3 text-sm theme-danger shadow-sm">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Terjadi kesalahan</p>
                  <p className="mt-0.5">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="theme-danger transition hover:theme-danger"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* ============================================================
                STATISTICS — dengan top accent bar
            ============================================================ */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 w-full">
              <StatCard
                label="Total Pengajuan"
                value={statistics.total}
                icon={FileText}
                gradient="from-blue-500 to-indigo-600"
                shadow="shadow-sm"
              
              />
              <StatCard
                label="Menunggu"
                value={statistics.menunggu}
                icon={Clock3}
                gradient="from-amber-500 to-orange-500"
                shadow="shadow-amber-500/25"
               
              />
              <StatCard
                label="Disetujui"
                value={statistics.disetujui}
                icon={CheckCircle2}
                gradient="from-emerald-500 to-teal-500"
                shadow="shadow-emerald-500/25"
               
              />
              <StatCard
                label="Ditolak"
                value={statistics.ditolak}
                icon={XCircle}
                gradient="from-red-500 to-rose-500"
                shadow="shadow-red-500/25"
                
              />
            </div>

            {/* ============================================================
                MAIN GRID
            ============================================================ */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">

              {/* ============================================================
                  TABLE
              ============================================================ */}
              <div className="overflow-hidden rounded-2xl border theme-border theme-card shadow-sm">
                <div className="border-b theme-border bg-[var(--color-primary)] from-slate-50/50 to-white p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 theme-text-placeholder" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama guru, NIP, atau alasan..."
                        className="h-10 w-full rounded-xl border theme-border theme-card pl-10 pr-4 text-sm theme-text outline-none transition placeholder:theme-text-placeholder focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="relative">
                        <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 theme-text-placeholder" />
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="h-10 w-full min-w-[155px] cursor-pointer appearance-none rounded-xl border theme-border theme-card pl-10 pr-8 text-sm theme-text-secondary outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
                        >
                          <option value="semua">Semua Status</option>
                          <option value="menunggu">Menunggu</option>
                          <option value="disetujui">Disetujui</option>
                          <option value="ditolak">Ditolak</option>
                        </select>
                      </div>

                      <select
                        value={jenisFilter}
                        onChange={(e) => setJenisFilter(e.target.value)}
                        className="h-10 min-w-[130px] cursor-pointer rounded-xl border theme-border theme-card px-3 text-sm theme-text-secondary outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
                      >
                        <option value="semua">Semua Jenis</option>
                        <option value="sakit">Sakit</option>
                        <option value="izin">Izin</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b theme-border bg-[var(--color-primary)] theme-card-soft">
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                          Guru
                        </th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                          Jenis
                        </th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                          Tanggal
                        </th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                          Status
                        </th>
                        <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border-soft)]">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-16 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-blue-200 blur-lg opacity-50" />
                                <Loader2 className="relative h-7 w-7 animate-spin theme-text-primary" />
                              </div>
                              <p className="mt-3 text-sm theme-text-muted">
                                Memuat data...
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredData.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-16 text-center">
                            <div className="mx-auto flex max-w-sm flex-col items-center">
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br theme-card-soft">
                                <FileText className="h-6 w-6 theme-text-placeholder" />
                              </div>
                              <p className="mt-3 text-sm font-semibold theme-text-secondary">
                                Tidak ada data
                              </p>
                              <p className="mt-1 text-xs theme-text-muted">
                                Belum ada permohonan izin yang sesuai dengan
                                filter.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((item) => {
                          const isSelected = item.id === selectedId;
                          const statusStyle = getStatusStyle(item.status);
                          return (
                            <tr
                              key={item.id}
                              className={`cursor-pointer transition-all duration-150 ${
                                isSelected
                                  ? "bg-[var(--color-primary)] from-blue-50 to-indigo-50/50 shadow-[inset_3px_0_0_0_theme(colors.blue.500)]"
                                  : "hover:theme-info/40"
                              }`}
                              onClick={() => handleSelectData(item)}
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl theme-primary text-xs font-bold text-white shadow-md shadow-sm">
                                    {getInitials(item.nama)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold theme-text">
                                      {item.nama}
                                    </p>
                                    <p className="mt-0.5 text-xs theme-text-muted">
                                      NIP: {item.nip}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getJenisStyle(
                                    item.jenis
                                  )}`}
                                >
                                  {getJenisLabel(item.jenis)}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <p className="text-sm font-medium theme-text-secondary">
                                  {formatTanggalSingkat(item.tanggalMulai)}
                                </p>
                                <p className="mt-0.5 text-xs theme-text-muted">
                                  s/d {formatTanggalSingkat(item.tanggalSelesai)}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle.badge}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                                  />
                                  {getStatusLabel(item.status)}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleSelectData(item);
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold theme-text-primary transition hover:theme-info hover:theme-text-primary"
                                >
                                  Detail
                                  <ArrowLeft className="h-4 w-4 rotate-180" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {!loading && filteredData.length > 0 && (
                  <div className="border-t theme-border theme-card-soft px-5 py-3">
                    <p className="text-xs theme-text-muted">
                      Menampilkan{" "}
                      <span className="font-semibold theme-text-primary">
                        {filteredData.length}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold theme-text-secondary">
                        {data.length}
                      </span>{" "}
                      pengajuan
                    </p>
                  </div>
                )}
              </div>

              {/* ============================================================
                  DETAIL PANEL
              ============================================================ */}
              <div className="overflow-hidden rounded-2xl border theme-border theme-card shadow-sm">
                {!selectedData ? (
                  <div className="flex min-h-[560px] flex-col items-center justify-center px-6 text-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-blue-200 blur-2xl opacity-40" />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl theme-primary text-white shadow-lg shadow-blue-500/30">
                        <FileText className="h-7 w-7" />
                      </div>
                    </div>
                    <h3 className="mt-5 text-base font-bold theme-text">
                      Pilih pengajuan
                    </h3>
                    <p className="mt-1.5 max-w-xs text-sm leading-6 theme-text-muted">
                      Pilih salah satu permohonan izin pada tabel untuk melihat
                      detail pengajuan.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="relative border-b theme-border bg-[var(--color-primary)] from-blue-50/70 to-indigo-50/40 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl theme-primary text-sm font-bold text-white shadow-md shadow-sm">
                            {getInitials(selectedData.nama)}
                          </div>
                          <div className="min-w-0">
                            <h2 className="truncate text-base font-bold theme-text">
                              {selectedData.nama}
                            </h2>
                            <p className="mt-0.5 text-xs theme-text-muted">
                              NIP: {selectedData.nip}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            getStatusStyle(selectedData.status).badge
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              getStatusStyle(selectedData.status).dot
                            }`}
                          />
                          {getStatusLabel(selectedData.status)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-5 p-5">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50/60 to-amber-50/30 p-3.5">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-500">
                            Jenis Izin
                          </p>
                          <span
                            className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getJenisStyle(
                              selectedData.jenis
                            )}`}
                          >
                            {getJenisLabel(selectedData.jenis)}
                          </span>
                        </div>
                        <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-indigo-50/30 p-3.5">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">
                            Durasi
                          </p>
                          <p className="mt-2 text-sm font-bold theme-text">
                            {hitungDurasi(
                              selectedData.tanggalMulai,
                              selectedData.tanggalSelesai
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border theme-border bg-gradient-to-br from-slate-50/80 to-white p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 theme-text-primary">
                            <CalendarDays className="h-3.5 w-3.5" />
                          </div>
                          <p className="text-sm font-bold theme-text">
                            Periode Izin
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-placeholder">
                              Mulai
                            </p>
                            <p className="mt-1 text-sm font-semibold theme-text">
                              {formatTanggal(selectedData.tanggalMulai)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-placeholder">
                              Selesai
                            </p>
                            <p className="mt-1 text-sm font-semibold theme-text">
                              {formatTanggal(selectedData.tanggalSelesai)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-sm font-bold theme-text">
                          Alasan
                        </p>
                        <div className="rounded-xl border theme-border bg-gradient-to-br from-slate-50/80 to-white p-4">
                          <p className="whitespace-pre-wrap text-sm leading-6 theme-text-secondary">
                            {selectedData.alasan}
                          </p>
                        </div>
                      </div>

                      {selectedData.urlBukti && (
                        <div>
                          <p className="mb-2 text-sm font-bold theme-text">
                            Bukti Izin
                          </p>
                          <a
                            href={getUploadUrl(selectedData.urlBukti)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-xl border theme-border theme-card p-3 transition hover:border-blue-300 hover:theme-info/40 hover:shadow-md hover:shadow-blue-500/10"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg theme-primary text-white shadow-md shadow-sm">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold theme-text">
                                  Lihat bukti izin
                                </p>
                                <p className="text-xs theme-text-muted">
                                  Buka dokumen/lampiran
                                </p>
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 theme-text-placeholder" />
                          </a>
                        </div>
                      )}

                      {/* GURU PENGGANTI */}
                      <div className="overflow-hidden rounded-xl border border-blue-200/70 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl theme-primary text-white shadow-md shadow-sm">
                            <UserCheck className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold theme-text">
                              Guru Pengganti
                            </p>
                            <p className="text-xs theme-text-muted">
                              Ditugaskan menggantikan selama izin.
                            </p>
                          </div>
                        </div>

                        {selectedData.status === "menunggu" ? (
                          <div className="rounded-lg border border-dashed border-blue-300/70 theme-card/70 p-3">
                            <p className="text-sm theme-text-muted">
                              Guru pengganti akan ditentukan saat permohonan
                              disetujui.
                            </p>
                          </div>
                        ) : detailGuruPengganti ? (
                          <div className="rounded-lg border border-blue-200 theme-card p-3 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white shadow-md shadow-emerald-500/20">
                                  {getInitials(detailGuruPengganti.namaLengkap)}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold theme-text">
                                    {detailGuruPengganti.namaLengkap}
                                  </p>
                                  <p className="mt-0.5 text-xs theme-text-muted">
                                    NIP: {detailGuruPengganti.nip || "-"}
                                  </p>
                                </div>
                              </div>
                              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                            </div>
                          </div>
                        ) : selectedData.guruPenggantiId ? (
                          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <p className="text-sm font-semibold text-amber-800">
                              Guru pengganti sudah dipilih
                            </p>
                            <p className="mt-1 text-xs theme-warning">
                              ID guru pengganti: {selectedData.guruPenggantiId}
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-lg border theme-border theme-card p-3">
                            <p className="text-sm theme-text-muted">
                              Belum ada guru pengganti.
                            </p>
                          </div>
                        )}
                      </div>

                      {selectedData.catatan && (
                        <div>
                          <p className="mb-2 text-sm font-bold theme-text">
                            Catatan
                          </p>
                          <div className="rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-50/70 to-orange-50/40 p-4">
                            <p className="whitespace-pre-wrap text-sm leading-6 text-amber-900/80">
                              {selectedData.catatan}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="border-t theme-border pt-4">
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-medium theme-text-placeholder uppercase tracking-wider">
                              Diajukan
                            </span>
                            <span className="text-right text-xs font-semibold theme-text-secondary">
                              {formatTanggalWaktu(selectedData.dibuatPada)}
                            </span>
                          </div>
                          {selectedData.penyetujuNama && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-xs font-medium theme-text-placeholder uppercase tracking-wider">
                                Diproses oleh
                              </span>
                              <span className="text-right text-xs font-semibold theme-text-secondary">
                                {selectedData.penyetujuNama}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedData.status === "menunggu" && (
                        <div className="grid grid-cols-2 gap-3 border-t theme-border pt-5">
                          <button
                            type="button"
                            onClick={openRejectModal}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 theme-card px-4 text-sm font-bold text-red-600 transition hover:bg-red-50 hover:border-red-300 hover:shadow-md hover:shadow-red-500/10"
                          >
                            <XCircle className="h-4 w-4" />
                            Tolak
                          </button>
                          <button
                            type="button"
                            onClick={openApproveModal}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] from-blue-500 to-indigo-600 px-4 text-sm font-bold text-white shadow-md shadow-blue-500/30 transition hover:shadow-lg hover:shadow-blue-500/40 hover:brightness-110"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Setujui
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* =========================================================
          MODAL APPROVE
      ========================================================= */}
      {showApproveModal && selectedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl theme-card shadow-2xl">
            <div className="relative border-b theme-border bg-[var(--color-primary)] from-emerald-50/70 to-teal-50/40 px-5 py-4">
              <div className="absolute inset-x-0 top-0 h-1 bg-[var(--color-primary)] from-emerald-500 to-teal-500" />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold theme-text">
                      Setujui Permohonan
                    </h3>
                    <p className="mt-0.5 text-xs theme-text-muted">
                      Tentukan guru pengganti sebelum menyetujui.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeApproveModal}
                  disabled={!!processingId}
                  className="rounded-lg p-1.5 theme-text-placeholder transition hover:theme-card/60 hover:theme-text-secondary disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div className="rounded-xl border theme-border bg-gradient-to-br from-slate-50/80 to-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl theme-primary text-xs font-bold text-white shadow-md shadow-sm">
                    {getInitials(selectedData.nama)}
                  </div>
                  <div>
                    <p className="text-sm font-bold theme-text">
                      {selectedData.nama}
                    </p>
                    <p className="mt-0.5 text-xs theme-text-muted">
                      NIP: {selectedData.nip}
                    </p>
                  </div>
                </div>
                <div className="mt-3 border-t theme-border pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium theme-text-placeholder uppercase tracking-wider">
                      Periode
                    </span>
                    <span className="text-xs font-semibold theme-text-secondary">
                      {formatTanggalSingkat(selectedData.tanggalMulai)} -{" "}
                      {formatTanggalSingkat(selectedData.tanggalSelesai)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold theme-text">
                  Guru Pengganti
                  <span className="ml-1 theme-danger">*</span>
                </label>
                <div className="relative">
                  <Users className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 theme-text-placeholder" />
                  <select
                    value={selectedGuruPenggantiId}
                    onChange={(e) => {
                      setSelectedGuruPenggantiId(e.target.value);
                      setError("");
                    }}
                    disabled={guruLoading || !!processingId}
                    className="h-11 w-full cursor-pointer appearance-none rounded-xl border theme-border theme-card pl-10 pr-10 text-sm theme-text-secondary outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] disabled:cursor-not-allowed disabled:theme-card-soft"
                  >
                    <option value="">
                      {guruLoading
                        ? "Memuat daftar guru..."
                        : guruList.length === 0
                        ? "Tidak ada guru tersedia"
                        : "Pilih guru pengganti"}
                    </option>
                    {guruList.map((guru) => (
                      <option key={guru.id} value={guru.id}>
                        {guru.namaLengkap}
                        {guru.nip ? ` - ${guru.nip}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {guruLoading && (
                  <div className="mt-2 flex items-center gap-2 text-xs theme-text-muted">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Mengambil daftar guru...
                  </div>
                )}

                {guruError && (
                  <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-xs text-red-600">{guruError}</p>
                    <button
                      type="button"
                      onClick={loadGuru}
                      className="mt-2 text-xs font-bold theme-danger underline"
                    >
                      Coba lagi
                    </button>
                  </div>
                )}

                {!guruLoading && !guruError && guruList.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    Data guru belum tersedia.
                  </p>
                )}
              </div>

              {selectedGuruPengganti && (
                <div className="overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    <p className="text-sm font-bold text-emerald-900">
                      Guru pengganti yang dipilih
                    </p>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-emerald-200/70 theme-card p-3 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white shadow-md shadow-emerald-500/20">
                      {getInitials(selectedGuruPengganti.namaLengkap)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold theme-text">
                        {selectedGuruPengganti.namaLengkap}
                      </p>
                      <p className="mt-0.5 text-xs theme-text-muted">
                        NIP: {selectedGuruPengganti.nip || "-"}
                      </p>
                    </div>
                    <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-emerald-500" />
                  </div>
                </div>
              )}

              <div className="flex gap-3 rounded-xl border border-blue-100 bg-[var(--color-primary)] from-blue-50/70 to-indigo-50/40 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 theme-text-primary" />
                <p className="text-xs leading-5 theme-text-primary">
                  Setelah disetujui, guru yang dipilih akan tercatat sebagai
                  guru pengganti dan menerima notifikasi penugasan.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t theme-border theme-card-soft px-5 py-4">
              <button
                type="button"
                onClick={closeApproveModal}
                disabled={!!processingId}
                className="h-10 rounded-xl border theme-border theme-card px-4 text-sm font-semibold theme-text-secondary transition hover:theme-card-soft disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={
                  !!processingId ||
                  !selectedGuruPenggantiId ||
                  guruLoading ||
                  guruList.length === 0
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] from-emerald-500 to-teal-600 px-4 text-sm font-bold text-white shadow-md shadow-emerald-500/30 transition hover:shadow-lg hover:shadow-emerald-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {processingId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Setujui Permohonan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL REJECT
      ========================================================= */}
      {showRejectModal && selectedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl theme-card shadow-2xl">
            <div className="relative border-b theme-border bg-[var(--color-primary)] from-red-50/70 to-rose-50/40 px-5 py-4">
              <div className="absolute inset-x-0 top-0 h-1 bg-[var(--color-primary)] from-red-500 to-rose-500" />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/25">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold theme-text">
                      Tolak Permohonan
                    </h3>
                    <p className="mt-0.5 text-xs theme-text-muted">
                      Berikan alasan penolakan jika diperlukan.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeRejectModal}
                  disabled={!!processingId}
                  className="rounded-lg p-1.5 theme-text-placeholder transition hover:theme-card/60 hover:theme-text-secondary disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl border border-red-100 bg-gradient-to-br from-red-50/70 to-rose-50/40 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/20">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-800">
                      {selectedData.nama}
                    </p>
                    <p className="mt-0.5 text-xs text-red-600">
                      Permohonan akan ditolak.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold theme-text">
                  Catatan Penolakan
                </label>
                <textarea
                  value={rejectCatatan}
                  onChange={(e) => setRejectCatatan(e.target.value)}
                  rows={4}
                  placeholder="Masukkan catatan penolakan..."
                  disabled={!!processingId}
                  className="w-full resize-none rounded-xl border theme-border px-3 py-2.5 text-sm theme-text-secondary outline-none placeholder:theme-text-placeholder transition focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:theme-card-soft"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t theme-border theme-card-soft px-5 py-4">
              <button
                type="button"
                onClick={closeRejectModal}
                disabled={!!processingId}
                className="h-10 rounded-xl border theme-border theme-card px-4 text-sm font-semibold theme-text-secondary transition hover:theme-card-soft disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={!!processingId}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] from-red-500 to-rose-600 px-4 text-sm font-bold text-white shadow-md shadow-red-500/30 transition hover:shadow-lg hover:shadow-red-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {processingId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Tolak Permohonan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ label, value, icon: Icon, gradient, shadow, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border theme-border theme-card p-5 shadow-sm transition hover:shadow-lg hover:shadow-slate-200/50">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider theme-text-placeholder">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight theme-text">
            {value}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md ${shadow} transition group-hover:scale-105`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
