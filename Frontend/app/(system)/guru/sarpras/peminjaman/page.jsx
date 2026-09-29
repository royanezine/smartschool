"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  ClipboardList,
  Sparkles,
  Search,
  Package,
  Projector,
  Dumbbell,
  DoorOpen,
  Laptop,
  Wrench,
  CalendarDays,
  Clock,
  Hourglass,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { getDaftarPeminjaman } from "../../../../../services/sarpras.service";

// =========================================================
// STATUS FILTER
// =========================================================

const STATUS_FILTER = [
  { label: "Semua", value: "" },
  { label: "Menunggu", value: "menunggu_persetujuan" },
  { label: "Disetujui", value: "disetujui" },
  { label: "Berlangsung", value: "dipinjam" },
  { label: "Ditolak", value: "ditolak" },
];

const statusConfig = {
  menunggu_persetujuan: {
    label: "Menunggu",
    icon: Hourglass,
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    accent: "before:bg-gradient-to-b before:from-amber-400 before:to-amber-600",
  },
  disetujui: {
    label: "Disetujui",
    icon: CheckCircle2,
    pill: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    accent: "before:bg-gradient-to-b before:from-blue-500 before:to-blue-700",
  },
  dipinjam: {
    label: "Berlangsung",
    icon: Clock,
    pill: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
    accent: "before:bg-gradient-to-b before:from-violet-500 before:to-violet-700",
  },
  ditolak: {
    label: "Ditolak",
    icon: XCircle,
    pill: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
    accent: "before:bg-gradient-to-b before:from-red-500 before:to-red-700",
  },
  dikembalikan: {
    label: "Selesai",
    icon: CheckCircle2,
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    accent: "before:bg-gradient-to-b before:from-emerald-500 before:to-emerald-700",
  },
};

// =========================================================
// HELPERS
// =========================================================

function getPaginationData(response) {
  const root = response?.data ?? response ?? {};

  const data = Array.isArray(root)
    ? root
    : Array.isArray(root?.data)
    ? root.data
    : Array.isArray(root?.items)
    ? root.items
    : Array.isArray(root?.results)
    ? root.results
    : [];

  const pagination = root?.pagination ?? response?.pagination ?? {};

  const page =
    Number(pagination?.page ?? root?.page ?? response?.page ?? 1) || 1;

  const limit =
    Number(pagination?.limit ?? root?.limit ?? response?.limit ?? 10) || 10;

  const total =
    Number(
      pagination?.totalData ??
        pagination?.total ??
        root?.totalData ??
        root?.total ??
        response?.totalData ??
        data.length
    ) || 0;

  const totalPages =
    Number(
      pagination?.totalPages ??
        root?.totalPages ??
        response?.totalPages ??
        Math.ceil(total / limit)
    ) || 1;

  return { data, page, limit, total, totalPages };
}

function formatTanggal(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusConfig(status) {
  return (
    statusConfig[status] || {
      label: status || "Tidak diketahui",
      icon: AlertTriangle,
      pill: "bg-slate-50 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
      accent: "before:bg-gradient-to-b before:from-slate-400 before:to-slate-600",
    }
  );
}

function getAssetIcon(nama = "") {
  const value = nama.toLowerCase();
  if (value.includes("proyektor") || value.includes("projector")) return Projector;
  if (value.includes("speaker") || value.includes("sound")) return Package;
  if (value.includes("laptop") || value.includes("komputer")) return Laptop;
  if (value.includes("ruang") || value.includes("kelas") || value.includes("lab"))
    return DoorOpen;
  if (value.includes("olahraga") || value.includes("matras") || value.includes("bola"))
    return Dumbbell;
  return Wrench;
}

function getAssetTone(nama = "") {
  const value = nama.toLowerCase();
  if (value.includes("proyektor") || value.includes("projector")) return "blue";
  if (value.includes("speaker") || value.includes("sound")) return "indigo";
  if (value.includes("laptop") || value.includes("komputer")) return "sky";
  if (value.includes("ruang") || value.includes("kelas") || value.includes("lab"))
    return "violet";
  if (value.includes("olahraga") || value.includes("matras") || value.includes("bola"))
    return "emerald";
  return "slate";
}

const assetToneGradients = {
  blue: "bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/25",
  indigo: "bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-indigo-500/25",
  sky: "bg-gradient-to-br from-sky-500 to-sky-700 shadow-sky-500/25",
  violet: "bg-gradient-to-br from-violet-500 to-violet-700 shadow-violet-500/25",
  emerald: "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-500/25",
  slate: "bg-gradient-to-br from-slate-500 to-slate-700 shadow-slate-500/25",
};

// =========================================================
// PAGE
// =========================================================

export default function GuruSarprasPeminjamanPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [filterAktif, setFilterAktif] = useState("");
  const [pencarianInput, setPencarianInput] = useState("");
  const [pencarian, setPencarian] = useState("");

  const [daftarPengajuan, setDaftarPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const notifications = [
    {
      id: 1,
      title: "Peminjaman Sarpras",
      desc: "Pantau status pengajuan peminjaman",
      read: false,
    },
  ];

  const loadPeminjaman = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDaftarPeminjaman({
        page,
        limit,
        status: filterAktif,
        search: pencarian,
      });

      const result = getPaginationData(response);

      setDaftarPengajuan(result.data);
      setTotalData(result.total);
      setTotalPages(Math.max(1, result.totalPages));
    } catch (err) {
      console.error("Gagal mengambil data peminjaman:", err);
      setError(err?.message || "Gagal mengambil data peminjaman.");
      setDaftarPengajuan([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPeminjaman();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterAktif, pencarian]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setPencarian(pencarianInput.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [pencarianInput]);

  const handleRefresh = () => {
    loadPeminjaman();
  };

  const jumlahData = useMemo(() => totalData, [totalData]);

  /* NAVIGATE KE DETAIL */
  const bukaDetail = (item) => {
    if (!item?.id) return;
    router.push(`/guru/sarpras/peminjaman/${item.id}`);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{
            name: "Guru",
            email: "guru@smartschool.com",
            avatar: "GU",
          }}
        />

        <main className="flex-1 overflow-y-auto relative bg-gradient-to-b from-slate-50/60 via-white to-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -top-32 right-0 h-[320px] w-[320px] rounded-full bg-blue-100/30 blur-3xl" />
            <div className="absolute top-1/3 -left-40 h-[280px] w-[280px] rounded-full bg-indigo-100/20 blur-3xl" />
          </div>

          <div className="relative w-full max-w-[1700px] 2xl:max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">

            {/* PAGE HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20">
                  <ClipboardList size={22} />
                </div>

                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-600">
                      Sarana & Prasarana
                    </p>
                  </div>

                  <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-slate-900">
                    Peminjaman Saya
                  </h1>

                  <p className="mt-1 text-sm text-slate-500 max-w-2xl flex items-center gap-1.5">
                    <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">
                      Pantau status pengajuan peminjaman kamu.
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 h-11 px-4 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-blue-300 hover:text-blue-600 transition-all disabled:opacity-50"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {/* SEARCH + FILTER */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-sm space-y-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={pencarianInput}
                  onChange={(e) => setPencarianInput(e.target.value)}
                  placeholder="Cari nomor pengajuan, keperluan, atau aset..."
                  className="w-full pl-10 pr-3 h-11 text-sm rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {STATUS_FILTER.map((filter) => {
                  const aktif = filterAktif === filter.value;
                  return (
                    <button
                      key={filter.value || "semua"}
                      type="button"
                      onClick={() => {
                        setPage(1);
                        setFilterAktif(filter.value);
                      }}
                      className={`inline-flex items-center gap-1.5 h-10 px-3.5 text-xs font-semibold rounded-xl border whitespace-nowrap transition-all ${
                        aktif
                          ? "bg-gradient-to-b from-blue-600 to-blue-700 text-white border-transparent shadow-md shadow-blue-600/25"
                          : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                      }`}
                    >
                      {filter.label}
                      {filter.value === "" && (
                        <span
                          className={`ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            aktif
                              ? "bg-white/25 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {jumlahData}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-500 border border-red-100 flex-shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-700">Gagal mengambil data</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm py-16 flex flex-col items-center justify-center">
                <Loader2 size={26} className="animate-spin text-blue-600" />
                <p className="text-sm text-slate-500 mt-3">Memuat data peminjaman...</p>
              </div>
            )}

            {/* LIST */}
            {!loading && (
              <div className="space-y-3">
                {daftarPengajuan.map((peminjaman) => {
                  const status = getStatusConfig(peminjaman.status);
                  const StatusIcon = status.icon;

                  const detail = peminjaman.detailPeminjaman || [];
                  const firstDetail = detail[0];
                  const namaAset = firstDetail?.aset?.nama || "Aset";
                  const jumlah =
                    firstDetail?.jumlah ??
                    detail.reduce(
                      (total, item) => total + Number(item?.jumlah || 0),
                      0
                    );

                  const ItemIcon = getAssetIcon(namaAset);
                  const tone = getAssetTone(namaAset);
                  const gradient = assetToneGradients[tone];

                  return (
                    <button
                      key={peminjaman.id}
                      type="button"
                      onClick={() => bukaDetail(peminjaman)}
                      className={`group relative w-full text-left bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] ${status.accent}`}
                    >
                      <div className="flex items-center gap-3 p-4 sm:p-5">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md flex-shrink-0 ${gradient}`}
                        >
                          <ItemIcon size={18} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-sm font-bold text-slate-900 truncate">
                              {namaAset}
                            </h2>

                            {peminjaman.nomorPeminjaman && (
                              <span className="text-[10px] font-mono font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/70">
                                {peminjaman.nomorPeminjaman}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <CalendarDays size={12} className="text-slate-400" />
                              {formatTanggal(
                                peminjaman.tanggalPinjam ||
                                  peminjaman.tanggalPengajuan
                              )}
                            </span>

                            <span className="flex items-center gap-1">
                              <Package size={12} className="text-slate-400" />
                              {jumlah} unit
                            </span>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${status.pill}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>

                        <ChevronRight
                          size={16}
                          className="hidden sm:block text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0"
                        />
                      </div>
                    </button>
                  );
                })}

                {daftarPengajuan.length === 0 && (
                  <div className="bg-white border border-dashed border-slate-300 rounded-2xl shadow-sm text-center py-16">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <ClipboardList size={22} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 mt-4">
                      Belum ada pengajuan peminjaman
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Pengajuan peminjaman kamu akan muncul di sini.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* PAGINATION */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl shadow-sm px-4 py-3">
                <p className="text-xs text-slate-500">
                  Halaman{" "}
                  <span className="font-semibold text-slate-700">{page}</span>{" "}
                  dari{" "}
                  <span className="font-semibold text-slate-700">{totalPages}</span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 disabled:hover:text-slate-500"
                  >
                    <ChevronLeft size={15} />
                  </button>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 disabled:hover:text-slate-500"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}