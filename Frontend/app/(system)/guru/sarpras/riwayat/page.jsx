"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  FileText,
  Sparkles,
  Search,
  Package,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import { getDaftarPeminjaman } from "../../../../services/sarpras.service";

// =========================================================
// FILTER
// =========================================================

const KATEGORI_FILTER = [
  "Semua",
  "Elektronik",
  "Ruangan",
  "Olahraga",
  "Lainnya",
];

const RENTANG_FILTER = [
  "30 Hari Terakhir",
  "3 Bulan Terakhir",
  "Semester Ini",
  "Semua",
];

// =========================================================
// STATUS CONFIG
// =========================================================

const hasilConfig = {
  dikembalikan: {
    label: "Dikembalikan",
    icon: CheckCircle2,
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    dot: "bg-emerald-500",
  },
  terlambat: {
    label: "Dikembalikan Terlambat",
    icon: AlertTriangle,
    pill: "bg-amber-50 text-amber-700 border-amber-200/70",
    dot: "bg-amber-500",
  },
  ditolak: {
    label: "Ditolak",
    icon: XCircle,
    pill: "bg-red-50 text-red-700 border-red-200/70",
    dot: "bg-red-500",
  },
};

// =========================================================
// HELPERS
// =========================================================

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

function getKategori(peminjaman) {
  const detail = peminjaman?.detailPeminjaman?.[0];
  const aset = detail?.aset;
  if (!aset) return "Lainnya";

  const kategori =
    aset?.kategori?.nama || aset?.kategori?.namaKategori || aset?.kategoriNama;
  if (!kategori) return "Lainnya";

  const k = kategori.toLowerCase();
  if (
    k.includes("elektronik") ||
    k.includes("laptop") ||
    k.includes("proyektor") ||
    k.includes("speaker")
  )
    return "Elektronik";
  if (k.includes("ruang") || k.includes("gedung")) return "Ruangan";
  if (k.includes("olahraga") || k.includes("sport")) return "Olahraga";
  return "Lainnya";
}

function getNamaAset(peminjaman) {
  const details = peminjaman?.detailPeminjaman || [];
  if (details.length === 0) return "Aset";
  if (details.length === 1) {
    return (
      details[0]?.aset?.nama ||
      details[0]?.aset?.namaAset ||
      details[0]?.namaAset ||
      "Aset"
    );
  }
  const namaPertama =
    details[0]?.aset?.nama ||
    details[0]?.aset?.namaAset ||
    details[0]?.namaAset ||
    "Aset";
  return `${namaPertama} + ${details.length - 1} aset`;
}

function getJumlah(peminjaman) {
  const details = peminjaman?.detailPeminjaman || [];
  return details.reduce((total, item) => total + Number(item?.jumlah || 0), 0);
}

function getHasil(peminjaman) {
  if (peminjaman?.status === "ditolak") return "ditolak";

  if (peminjaman?.status === "dikembalikan") {
    const tanggalRencana = peminjaman?.tanggalKembaliRencana;
    const tanggalAktual = peminjaman?.tanggalKembaliAktual;

    if (tanggalRencana && tanggalAktual) {
      const rencana = new Date(tanggalRencana);
      const aktual = new Date(tanggalAktual);
      if (aktual > rencana) return "terlambat";
    }
    return "dikembalikan";
  }
  return null;
}

function normalizeResponse(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  if (Array.isArray(response.data?.items)) return response.data.items;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.peminjaman)) return response.peminjaman;
  if (Array.isArray(response.data?.peminjaman)) return response.data.peminjaman;
  return [];
}

// =========================================================
// PAGE
// =========================================================

export default function GuruSarprasRiwayatPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [rentangAktif, setRentangAktif] = useState("30 Hari Terakhir");
  const [pencarian, setPencarian] = useState("");

  const [daftarRiwayat, setDaftarRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const notifications = [
    {
      id: 1,
      title: "Riwayat Peminjaman",
      desc: "Data diperbarui dari sistem",
      read: false,
    },
  ];

  /* =======================================================
     LOAD RIWAYAT — dipisah biar bisa dipanggil refresh
  ======================================================= */

  const loadRiwayat = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const response = await getDaftarPeminjaman({ page: 1, limit: 100 });
      const data = normalizeResponse(response);

      const history = data.filter(
        (item) =>
          item?.status === "dikembalikan" || item?.status === "ditolak"
      );

      setDaftarRiwayat(history);
    } catch (err) {
      console.error("Gagal mengambil riwayat peminjaman:", err);
      setError(err?.message || "Gagal mengambil riwayat peminjaman.");
      setDaftarRiwayat([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* LOAD PERTAMA KALI */
  useEffect(() => {
    loadRiwayat(false);
  }, [loadRiwayat]);

  /* HANDLER REFRESH */
  const handleRefresh = () => {
    if (loading || refreshing) return;
    loadRiwayat(true);
  };

  const tanggalMulaiRentang = useMemo(() => {
    const sekarang = new Date();
    if (rentangAktif === "Semua") return null;

    if (rentangAktif === "30 Hari Terakhir") {
      const date = new Date(sekarang);
      date.setDate(date.getDate() - 30);
      return date;
    }

    if (rentangAktif === "3 Bulan Terakhir") {
      const date = new Date(sekarang);
      date.setMonth(date.getMonth() - 3);
      return date;
    }

    if (rentangAktif === "Semester Ini") {
      const bulan = sekarang.getMonth();
      if (bulan <= 5) return new Date(sekarang.getFullYear(), 0, 1);
      return new Date(sekarang.getFullYear(), 6, 1);
    }

    return null;
  }, [rentangAktif]);

  const dataTersaring = useMemo(() => {
    const search = pencarian.trim().toLowerCase();

    return daftarRiwayat.filter((r) => {
      const hasil = getHasil(r);
      if (!hasil) return false;

      const kategori = getKategori(r);
      const cocokKategori =
        kategoriAktif === "Semua" || kategori === kategoriAktif;

      const namaAset = getNamaAset(r);
      const nomor = r?.nomorPeminjaman || "";
      const keperluan = r?.keperluan || "";

      const cocokPencarian =
        !search ||
        namaAset.toLowerCase().includes(search) ||
        nomor.toLowerCase().includes(search) ||
        keperluan.toLowerCase().includes(search);

      let cocokRentang = true;
      if (tanggalMulaiRentang) {
        const tanggal = r?.tanggalPinjam || r?.tanggalPengajuan;
        if (!tanggal) {
          cocokRentang = false;
        } else {
          cocokRentang = new Date(tanggal) >= tanggalMulaiRentang;
        }
      }

      return cocokKategori && cocokPencarian && cocokRentang;
    });
  }, [daftarRiwayat, kategoriAktif, pencarian, tanggalMulaiRentang]);

  const ringkasan = useMemo(() => {
    const total = dataTersaring.length;
    const tepatWaktu = dataTersaring.filter(
      (r) => getHasil(r) === "dikembalikan"
    ).length;
    const terlambat = dataTersaring.filter(
      (r) => getHasil(r) === "terlambat"
    ).length;
    const ditolak = dataTersaring.filter(
      (r) => getHasil(r) === "ditolak"
    ).length;
    return { total, tepatWaktu, terlambat, ditolak };
  }, [dataTersaring]);

  /* NAVIGATE KE DETAIL */
  const bukaDetail = (item) => {
    if (!item?.id) return;
    router.push(`/guru/sarpras/riwayat/${item.id}`);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
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
            name: "Bu Sari",
            email: "guru@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="w-full max-w-[1700px] 2xl:max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">

            {/* =========================================
                PAGE HEADER + REFRESH
            ========================================= */}

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm">
                  <FileText size={22} />
                </div>

                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#2563EB]">
                      Sarana & Prasarana
                    </p>
                  </div>

                  <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-[#0F172A]">
                    Riwayat Peminjaman
                  </h1>

                  <p className="mt-1 text-sm text-slate-500 max-w-2xl flex items-center gap-1.5">
                    <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">
                      Catatan peminjaman yang telah dikembalikan atau ditolak.
                    </span>
                  </p>
                </div>
              </div>

              {/* TOMBOL REFRESH */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className="inline-flex items-center justify-center gap-2 h-11 px-4 text-sm font-semibold rounded-xl border border-[#60A5FA]/30 bg-white text-[#1E3A5F] shadow-sm hover:border-[#2563EB] hover:bg-[#2563EB]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <RefreshCw
                  size={15}
                  className={loading || refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Memuat..." : "Refresh"}
              </button>
            </div>

            {/* =========================================
                ERROR
            ========================================= */}

            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200/70 rounded-xl p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-500 border border-red-100 flex-shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-800">
                    Gagal mengambil riwayat
                  </p>
                  <p className="text-xs text-red-700/80 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* =========================================
                RINGKASAN
            ========================================= */}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <RingkasanCard
                label="Total Riwayat"
                value={loading ? "—" : ringkasan.total}
                tone="blue"
              />
              <RingkasanCard
                label="Tepat Waktu"
                value={loading ? "—" : ringkasan.tepatWaktu}
                tone="emerald"
              />
              <RingkasanCard
                label="Terlambat"
                value={loading ? "—" : ringkasan.terlambat}
                tone="amber"
              />
              <RingkasanCard
                label="Ditolak"
                value={loading ? "—" : ringkasan.ditolak}
                tone="red"
              />
            </div>

            {/* =========================================
                SEARCH + FILTER
            ========================================= */}

            <div className="bg-white rounded-xl border border-[#60A5FA]/20 p-4 shadow-sm space-y-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={pencarian}
                  onChange={(e) => setPencarian(e.target.value)}
                  placeholder="Cari nama item atau nomor pengajuan..."
                  className="w-full pl-10 pr-3 h-11 text-sm rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {KATEGORI_FILTER.map((kategori) => {
                    const aktif = kategoriAktif === kategori;
                    return (
                      <button
                        key={kategori}
                        type="button"
                        onClick={() => setKategoriAktif(kategori)}
                        className={`inline-flex items-center h-10 px-3.5 text-xs font-semibold rounded-lg border whitespace-nowrap transition-colors ${
                          aktif
                            ? "bg-[#2563EB] text-white border-[#2563EB]"
                            : "bg-white text-slate-600 border-[#60A5FA]/25 hover:border-[#2563EB] hover:text-[#2563EB]"
                        }`}
                      >
                        {kategori}
                      </button>
                    );
                  })}
                </div>

                <select
                  value={rentangAktif}
                  onChange={(e) => setRentangAktif(e.target.value)}
                  className="h-10 text-xs font-semibold px-3 rounded-lg border border-[#60A5FA]/25 bg-white text-slate-600 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 flex-shrink-0"
                >
                  {RENTANG_FILTER.map((rentang) => (
                    <option key={rentang} value={rentang}>
                      {rentang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* =========================================
                LIST
            ========================================= */}

            <div
              className={`bg-white rounded-xl border border-[#60A5FA]/20 shadow-sm overflow-hidden transition-opacity duration-200 ${
                refreshing ? "opacity-60 pointer-events-none" : "opacity-100"
              }`}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 size={24} className="animate-spin text-[#2563EB]" />
                  <p className="text-sm text-slate-500 mt-3">
                    Memuat riwayat peminjaman...
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#60A5FA]/15">
                  {dataTersaring.map((r) => {
                    const hasil = getHasil(r);
                    const cfg = hasilConfig[hasil];
                    const namaAset = getNamaAset(r);
                    const kategori = getKategori(r);
                    const jumlah = getJumlah(r);

                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => bukaDetail(r)}
                        className="group w-full text-left flex items-center gap-4 p-4 sm:px-5 sm:py-4 hover:bg-[#F8FAFC] transition-colors"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] flex-shrink-0">
                          <Package size={18} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-sm font-bold text-[#0F172A] truncate">
                              {namaAset}
                            </h2>

                            {r.nomorPeminjaman && (
                              <span className="text-[10px] font-mono font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-[#F8FAFC] border border-[#60A5FA]/20">
                                {r.nomorPeminjaman}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <CalendarDays size={12} className="text-slate-400" />
                              {formatTanggal(r.tanggalPinjam || r.tanggalPengajuan)}
                            </span>

                            <span className="hidden sm:inline">{jumlah} unit</span>

                            <span className="hidden md:inline">{kategori}</span>
                          </div>
                        </div>

                        {cfg && (
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.pill}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            <span className="hidden sm:inline">{cfg.label}</span>
                          </span>
                        )}

                        <ChevronRight
                          size={16}
                          className="hidden sm:block text-slate-300 group-hover:text-[#2563EB] transition-colors flex-shrink-0"
                        />
                      </button>
                    );
                  })}

                  {dataTersaring.length === 0 && (
                    <div className="text-center py-16 px-4">
                      <div className="mx-auto w-14 h-14 rounded-xl bg-[#F8FAFC] border border-[#60A5FA]/20 flex items-center justify-center">
                        <Package size={22} className="text-[#60A5FA]" />
                      </div>
                      <p className="text-sm font-bold text-[#0F172A] mt-4">
                        Tidak ada riwayat peminjaman
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Belum ada data yang sesuai dengan filter.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   RINGKASAN CARD
========================================================= */

function RingkasanCard({ label, value, tone = "blue" }) {
  const tones = {
    blue: {
      icon: "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB]",
      value: "text-[#0F172A]",
    },
    emerald: {
      icon: "bg-emerald-50 border-emerald-200/70 text-emerald-600",
      value: "text-emerald-600",
    },
    amber: {
      icon: "bg-amber-50 border-amber-200/70 text-amber-600",
      value: "text-amber-600",
    },
    red: {
      icon: "bg-red-50 border-red-200/70 text-red-600",
      value: "text-red-600",
    },
  };

  const t = tones[tone] || tones.blue;

  return (
    <div className="bg-white rounded-xl border border-[#60A5FA]/20 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg border flex-shrink-0 ${t.icon}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
            {label}
          </p>
          <p className={`text-xl font-bold mt-0.5 truncate ${t.value}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}