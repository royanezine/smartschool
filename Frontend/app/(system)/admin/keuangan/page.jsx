"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  getAkunKas,
  getJurnalKas,
  getLaporanKas,
} from "@/services/jurnalKas.service";
import {
  getRingkasanTagihan,
  getTunggakan,
} from "@/services/tagihan.service";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  Search,
  RefreshCw,
  Download,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  Loader2,
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react";

const themeCardShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimarySurface =
  "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

function formatRupiah(value) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatTanggal(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatKategori(value) {
  return String(value || "-")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function todayISO() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function awalBulanIni() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function isSameMonth(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function getErrorMessage(error, fallback) {
  if (error instanceof Error && error.message) return error.message;
  return `Gagal memuat ${fallback}.`;
}

function formatRupiahOrUnavailable(value) {
  return value === null || value === undefined
    ? "Tidak tersedia"
    : formatRupiah(value);
}

function formatNumberOrUnavailable(value) {
  return value === null || value === undefined
    ? "Tidak tersedia"
    : Number(value).toLocaleString("id-ID");
}

export default function KeuanganPage() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState("semua");
  const [kategoriFilter, setKategoriFilter] = useState("semua");
  const [bulanIniOnly, setBulanIniOnly] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 5;

  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [akunKas, setAkunKas] = useState([]);
  const [akunTotalSaldo, setAkunTotalSaldo] = useState(null);

  const [jurnal, setJurnal] = useState([]);
  const [jurnalRingkasan, setJurnalRingkasan] = useState(null);
  const [jurnalTotal, setJurnalTotal] = useState(null);

  const [tagihanRingkasan, setTagihanRingkasan] = useState(null);
  const [tunggakanRingkasan, setTunggakanRingkasan] = useState(null);
  const [bulanIni, setBulanIni] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        getAkunKas(),
        getJurnalKas({ page: 1, limit: 100 }),
        getRingkasanTagihan(),
        getTunggakan({ page: 1, limit: 1 }),
        getLaporanKas({
          dari: awalBulanIni(),
          sampai: todayISO(),
        }),
      ]);

      if (!active) return;

      const messages = [];
      const [akunRes, jurnalRes, tagihanRes, tunggakanRes, bulanRes] = results;

      if (akunRes.status === "fulfilled") {
        setAkunKas(akunRes.value.data || []);
        setAkunTotalSaldo(
          akunRes.value.ringkasan?.totalSaldo === undefined ||
            akunRes.value.ringkasan?.totalSaldo === null
            ? null
            : Number(akunRes.value.ringkasan.totalSaldo),
        );
      } else {
        setAkunKas([]);
        setAkunTotalSaldo(null);
        messages.push(getErrorMessage(akunRes.reason, "akun kas"));
      }

      if (jurnalRes.status === "fulfilled") {
        setJurnal(jurnalRes.value.data || []);
        setJurnalRingkasan(jurnalRes.value.ringkasan || null);
        setJurnalTotal(
          typeof jurnalRes.value.meta?.total === "number"
            ? jurnalRes.value.meta.total
            : null,
        );
      } else {
        setJurnal([]);
        setJurnalRingkasan(null);
        setJurnalTotal(null);
        messages.push(getErrorMessage(jurnalRes.reason, "jurnal kas"));
      }

      if (tagihanRes.status === "fulfilled") {
        setTagihanRingkasan(tagihanRes.value.data || null);
      } else {
        setTagihanRingkasan(null);
        messages.push(getErrorMessage(tagihanRes.reason, "ringkasan tagihan"));
      }

      if (tunggakanRes.status === "fulfilled") {
        setTunggakanRingkasan(tunggakanRes.value.ringkasan || null);
      } else {
        setTunggakanRingkasan(null);
        messages.push(getErrorMessage(tunggakanRes.reason, "tunggakan"));
      }

      if (bulanRes.status === "fulfilled") {
        setBulanIni(bulanRes.value.data || null);
      } else {
        setBulanIni(null);
        messages.push(getErrorMessage(bulanRes.reason, "laporan bulan ini"));
      }

      setError(messages.join(" "));
      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const transactions = useMemo(
    () =>
      jurnal.map((item) => ({
        id: item.id,
        tanggal: item.tanggal,
        nomor: item.nomorJurnal || "-",
        kategori: formatKategori(item.kategori),
        kategoriKey: item.kategori,
        keterangan: item.keterangan || "-",
        jenis: item.jenis === "masuk" ? "pemasukan" : "pengeluaran",
        jumlah: Number(item.jumlah) || 0,
        status: item.status || "aktif",
        akun: item.akunKas?.nama || "-",
        sumber: item.sumber || "-",
      })),
    [jurnal],
  );

  const kategoriOptions = useMemo(() => {
    const map = new Map();
    transactions.forEach((item) => {
      if (item.kategoriKey) {
        map.set(item.kategoriKey, item.kategori);
      }
    });
    return [...map.entries()].map(([value, label]) => ({ value, label }));
  }, [transactions]);

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return transactions.filter((item) => {
      const matchSearch =
        !keyword ||
        item.keterangan.toLowerCase().includes(keyword) ||
        item.nomor.toLowerCase().includes(keyword);
      const matchJenis =
        jenisFilter === "semua" || item.jenis === jenisFilter;
      const matchKategori =
        kategoriFilter === "semua" || item.kategoriKey === kategoriFilter;
      const matchBulan = !bulanIniOnly || isSameMonth(item.tanggal);

      return matchSearch && matchJenis && matchKategori && matchBulan;
    });
  }, [transactions, search, jenisFilter, kategoriFilter, bulanIniOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / limit));
  const currentPage = Math.min(page, totalPages);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  const saldoAkhir = akunTotalSaldo;
  const totalMasuk =
    jurnalRingkasan === null ? null : Number(jurnalRingkasan.totalMasuk || 0);
  const totalKeluar =
    jurnalRingkasan === null ? null : Number(jurnalRingkasan.totalKeluar || 0);
  const pemasukanBulanIni =
    bulanIni === null ? null : Number(bulanIni.totalMasuk || 0);
  const pengeluaranBulanIni =
    bulanIni === null ? null : Number(bulanIni.totalKeluar || 0);

  const openDetail = (item) => {
    if (item?.id) {
      router.push(`/admin/keuangan/jurnalKas/detail/${item.id}`);
    }
  };

  const openForm = (type) => {
    router.push(`/admin/keuangan/jurnalKas/tambah?tipe=${type}`);
  };

  const handleExport = () => {
    if (filteredData.length === 0) return;

    const headers = [
      "Tanggal",
      "Nomor Jurnal",
      "Kategori",
      "Keterangan",
      "Akun Kas",
      "Jenis",
      "Jumlah",
      "Status",
    ];

    const rows = filteredData.map((item) => [
      item.tanggal,
      item.nomor,
      item.kategori,
      item.keterangan,
      item.akun,
      item.jenis === "pemasukan" ? "Pemasukan" : "Pengeluaran",
      item.jumlah,
      item.status,
    ]);

    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "keuangan-smartschool.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const toggleSidebar = () => setIsCollapsed((v) => !v);

  // Hitung persentase pembayaran tagihan
  const totalTagihan = tagihanRingkasan?.totalTagihan || 0;
  const totalDibayar = tagihanRingkasan?.totalDibayar || 0;
  const progressPersen = totalTagihan > 0 ? (totalDibayar / totalTagihan) * 100 : 0;

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden bg-[#f8fafc]">
      <Sidebar
        active="keuangan"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Bendahara Sekolah",
              email: "bendahara@smartschool.com",
              avatar: "BD",
            }}
          />
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full space-y-5 p-4 sm:p-6 lg:p-8">
            
            {/* HEADER & ACTIONS */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium theme-text-muted">
                  Tetap pantau arus kas dan laporan keuangan sekolah Anda hari ini.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={filteredData.length === 0}
                  className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card px-3 text-xs font-semibold theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Download size={14} />
                  Export
                </button>

                <button
                  type="button"
                  onClick={() => openForm("pengeluaran")}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] px-3 text-xs font-semibold text-[var(--color-danger)] transition hover:bg-[color-mix(in_srgb,var(--color-danger)_18%,transparent)]"
                >
                  <ArrowUpRight size={14} className="rotate-45" />
                  Pengeluaran
                </button>

                <button
                  type="button"
                  onClick={() => openForm("pemasukan")}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                >
                  <Plus size={14} />
                  Pemasukan
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_6%,transparent)] p-4 text-sm">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-[var(--color-danger)]" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold theme-text">Sebagian data gagal dimuat</p>
                  <p className="mt-1 break-words theme-text-secondary">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRefreshKey((value) => value + 1)}
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold theme-text-secondary"
                >
                  <RefreshCw size={13} /> Coba lagi
                </button>
              </div>
            )}

            {/* TOP GRID: SALDO UTAMA & STAT CARDS */}
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {/* Kartu Saldo Utama (Biru) */}
              <div className="lg:col-span-4 relative overflow-hidden rounded-2xl bg-[#2563eb] p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white/90">Total Saldo Kas</p>
                  <Wallet size={20} className="text-white/70" />
                </div>
                <h2 className="mt-4 text-3xl font-bold tracking-tight">
                  {loading ? "..." : formatRupiahOrUnavailable(saldoAkhir)}
                </h2>
                <p className="mt-1 flex items-center gap-1 text-xs text-white/80">
                  <TrendingUp size={12} /> Saldo gabungan semua akun
                </p>

                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => openForm("pemasukan")}
                    className="flex-1 rounded-xl bg-[#1e40af] py-2 text-xs font-semibold transition hover:bg-[#1e3a8a]"
                  >
                    Transfer Masuk
                  </button>
                  <button 
                    onClick={() => openForm("pengeluaran")}
                    className="flex-1 rounded-xl bg-white py-2 text-xs font-semibold text-[#2563eb] transition hover:bg-slate-50"
                  >
                    Transfer Keluar
                  </button>
                </div>
              </div>

              {/* 4 Kartu Ringkasan */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pemasukan */}
                <div className={`rounded-2xl border ${themeNeutralBorder} bg-white p-4 ${themeCardShadow}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                      <TrendingUp size={16} />
                    </div>
                    <p className="text-xs font-semibold text-slate-500">TOTAL PEMASUKAN</p>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-xl font-bold text-slate-800">
                        {loading ? "..." : formatRupiahOrUnavailable(totalMasuk)}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Bulan ini</p>
                    </div>
                    <p className="text-xs font-semibold text-emerald-500">
                      {loading ? "..." : formatRupiahOrUnavailable(pemasukanBulanIni)}
                    </p>
                  </div>
                </div>

                {/* Pengeluaran */}
                <div className={`rounded-2xl border ${themeNeutralBorder} bg-white p-4 ${themeCardShadow}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
                      <TrendingDown size={16} />
                    </div>
                    <p className="text-xs font-semibold text-slate-500">TOTAL PENGELUARAN</p>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-xl font-bold text-slate-800">
                        {loading ? "..." : formatRupiahOrUnavailable(totalKeluar)}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Bulan ini</p>
                    </div>
                    <p className="text-xs font-semibold text-red-500">
                      {loading ? "..." : formatRupiahOrUnavailable(pengeluaranBulanIni)}
                    </p>
                  </div>
                </div>

                {/* Total Transaksi */}
                <div className={`rounded-2xl border ${themeNeutralBorder} bg-white p-4 ${themeCardShadow}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                      <Receipt size={16} />
                    </div>
                    <p className="text-xs font-semibold text-slate-500">TOTAL TRANSAKSI</p>
                  </div>
                  <div className="mt-3">
                    <p className="text-xl font-bold text-slate-800">
                      {loading ? "..." : formatNumberOrUnavailable(jurnalTotal)}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">Jumlah tercatat</p>
                  </div>
                </div>

                {/* Tunggakan */}
                <div className={`rounded-2xl border ${themeNeutralBorder} bg-white p-4 ${themeCardShadow}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                      <AlertCircle size={16} />
                    </div>
                    <p className="text-xs font-semibold text-slate-500">TUNGGAKAN</p>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-xl font-bold text-red-500">
                        {loading ? "..." : formatRupiahOrUnavailable(tunggakanRingkasan?.totalTunggakan)}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Siswa menunggak</p>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-600">
                      {tunggakanRingkasan?.jumlahTagihan || 0} Tagihan
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* MIDDLE GRID: AKUN KAS & LAPORAN PROGRES */}
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              
              {/* Kiri: Akun Kas & Bank */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-800">Akun Kas & Bank</h2>
                  <Link href="/admin/keuangan/akunKas/tambah" className="text-blue-500 hover:text-blue-600">
                    <Plus size={18} className="rounded-full bg-blue-50 p-0.5" />
                  </Link>
                </div>

                <div className="flex flex-col gap-3">
                  {akunKas.map((akun, index) => {
                    const isBank = akun.tipe === "bank";
                    // Alternating colors for design (Blue and Dark)
                    const isDark = index % 2 !== 0;
                    
                    return (
                      <div
                        key={akun.id}
                        className={`relative overflow-hidden rounded-xl p-4 shadow-sm ${
                          isDark ? "bg-[#1e293b] text-white" : "bg-[#2563eb] text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isBank ? <Building2 size={16} className="text-white/80" /> : <Wallet size={16} className="text-white/80" />}
                            <p className="text-sm font-medium">{akun.nama}</p>
                          </div>
                          <span className="rounded bg-white/20 px-2 py-0.5 text-[9px] font-semibold backdrop-blur-sm">
                            {isBank ? "Bank" : "Tunai"}
                          </span>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-lg font-bold">{formatRupiah(akun.saldo)}</p>
                          <p className={`mt-0.5 text-[10px] ${isDark ? "text-slate-400" : "text-blue-200"}`}>
                            {akun.kode || (isBank ? "REKENING" : "KAS")}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {!loading && akunKas.length === 0 && (
                    <div className={`flex items-center justify-center rounded-xl border border-dashed ${themeNeutralBorder} p-6`}>
                      <p className="text-center text-xs theme-text-muted">Belum ada akun kas.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Kanan: Laporan & Progres */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-800">Laporan & Progres</h2>
                  <button onClick={() => setRefreshKey(k => k+1)} className="text-slate-400 hover:text-slate-600">
                    <RefreshCw size={16} />
                  </button>
                </div>

                <div className={`flex-1 rounded-2xl border ${themeNeutralBorder} bg-white p-5 ${themeCardShadow} flex flex-col sm:flex-row gap-6`}>
                  
                  {/* Progres Pembayaran */}
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Progres Pembayaran Tagihan
                    </p>
                    <div className="flex items-end justify-between mb-1">
                      <p className="text-2xl font-bold text-slate-800">
                        {formatRupiah(totalDibayar)}
                      </p>
                      <p className="text-xs text-slate-500 mb-1">
                        dari {formatRupiah(totalTagihan)}
                      </p>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mt-2">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                        style={{ width: `${progressPersen}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Sisa: {formatRupiah(totalTagihan - totalDibayar)}
                    </p>
                  </div>

                  <div className="hidden sm:block w-px bg-slate-100 my-2" />

                  {/* Laporan Bulan Ini */}
                  <div className="flex-1 flex flex-col justify-center space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Laporan Bulan Ini
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Masuk</span>
                      <span className="text-sm font-bold text-emerald-500">
                        {formatRupiah(pemasukanBulanIni || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Keluar</span>
                      <span className="text-sm font-bold text-red-500">
                        {formatRupiah(pengeluaranBulanIni || 0)}
                      </span>
                    </div>
                    
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-700">Selisih</span>
                      <span className="text-sm font-bold text-blue-600">
                        {formatRupiah((pemasukanBulanIni || 0) - (pengeluaranBulanIni || 0))}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* BOTTOM: AKTIVITAS TERBARU (TABEL) */}
            <section className={`overflow-hidden rounded-2xl border ${themeNeutralBorder} bg-white ${themeCardShadow}`}>
              
              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Aktivitas Terbaru</h2>
                  <p className="mt-1 text-xs text-slate-500">Riwayat pemasukan dan pengeluaran terbaru.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Cari transaksi..."
                      className="h-8 w-full sm:w-48 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <select
                    value={jenisFilter}
                    onChange={(e) => {
                      setJenisFilter(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-600 outline-none focus:border-blue-500"
                  >
                    <option value="semua">Semua</option>
                    <option value="pemasukan">Masuk</option>
                    <option value="pengeluaran">Keluar</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      setBulanIniOnly((v) => !v);
                      setPage(1);
                    }}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition ${
                      bulanIniOnly
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Calendar size={12} />
                    Bulan Ini
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Tanggal</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">No. Jurnal</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Keterangan / Kategori</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Jumlah</th>
                      <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                      <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center">
                          <Loader2 size={24} className="mx-auto animate-spin text-blue-500" />
                          <p className="mt-2 text-sm text-slate-500">Memuat transaksi...</p>
                        </td>
                      </tr>
                    ) : paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center">
                          <p className="text-sm text-slate-500">Tidak ada transaksi ditemukan.</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item) => {
                        const isPemasukan = item.jenis === "pemasukan";
                        return (
                          <tr key={item.id} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                            <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                              {formatTanggal(item.tanggal)}
                            </td>
                            <td className="px-5 py-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                              {item.nomor}
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-xs font-semibold text-slate-800">{item.keterangan}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{item.kategori}</p>
                            </td>
                            <td className={`px-5 py-4 text-right text-xs font-bold whitespace-nowrap ${
                              isPemasukan ? "text-emerald-500" : "text-red-500"
                            }`}>
                              {isPemasukan ? "+" : "-"}{formatRupiah(item.jumlah)}
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${
                                item.status === 'aktif' 
                                  ? 'bg-emerald-50 text-emerald-600' 
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {item.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => openDetail(item)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 transition hover:border-blue-500 hover:text-blue-500"
                              >
                                <Eye size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bawah */}
              {!loading && paginatedData.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    Menampilkan <span className="font-semibold text-slate-700">{paginatedData.length}</span> dari <span className="font-semibold text-slate-700">{filteredData.length}</span> transaksi
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="inline-flex h-7 items-center justify-center rounded border border-slate-200 bg-white px-2 text-xs text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="px-2 text-xs font-medium text-slate-600">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="inline-flex h-7 items-center justify-center rounded border border-slate-200 bg-white px-2 text-xs text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}