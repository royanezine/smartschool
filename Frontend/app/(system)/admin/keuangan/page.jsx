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
  Calendar,
  AlertCircle,
  Building2,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
  Inbox,
} from "lucide-react";

/* ---------- Token tema ---------- */

const themeCardShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimarySurface =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_80%,#000))]";

const themeDarkGradient =
  "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-text)_88%,#000),color-mix(in_srgb,var(--color-text)_70%,#000))]";

const TONES = {
  primary: {
    surface: themePrimarySurface,
    text: "text-[var(--color-primary)]",
  },
  success: {
    surface: "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)]",
    text: "text-[var(--color-success)]",
  },
  danger: {
    surface: "bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)]",
    text: "text-[var(--color-danger)]",
  },
  warning: {
    surface: "bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)]",
    text: "text-[var(--color-warning)]",
  },
};

/* ---------- Helper ---------- */

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

/* ---------- Komponen kecil ---------- */

function StatCard({ icon: Icon, label, children }) {
  return (
    <div
      className={`theme-card flex min-w-0 flex-col rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text"
        >
          <Icon size={17} />
        </div>
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
          {label}
        </p>
      </div>

      <div className="mt-4 flex flex-1 flex-col justify-end">{children}</div>
    </div>
  );
}

function SectionTitle({ title, action }) {
  return (
    <div className="flex h-7 items-center justify-between">
      <h2 className="text-sm font-bold theme-text">{title}</h2>
      {action}
    </div>
  );
}

/* ---------- Halaman ---------- */

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

  // Progres pembayaran tagihan
  const totalTagihan = Number(tagihanRingkasan?.totalTagihan || 0);
  const totalDibayar = Number(tagihanRingkasan?.totalDibayar || 0);
  const progressPersen =
    totalTagihan > 0
      ? Math.min(100, Math.max(0, (totalDibayar / totalTagihan) * 100))
      : 0;
  const sisaTagihan = Math.max(0, totalTagihan - totalDibayar);

  // Selisih bulan ini
  const selisihBulanIni =
    (pemasukanBulanIni || 0) - (pengeluaranBulanIni || 0);

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
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
          <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
            {/* HEADER & ACTIONS */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${themePrimaryGradient} text-white shadow-[0_4px_14px_color-mix(in_srgb,var(--color-primary)_25%,transparent)]`}
                >
                  <Wallet size={22} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                    Keuangan / Bendahara
                  </p>

                  <h1 className="mt-0.5 text-xl font-bold theme-text sm:text-2xl">
                    Manajemen Keuangan
                  </h1>

                  <p className="mt-0.5 text-xs leading-relaxed theme-text-secondary sm:text-sm">
                    Kelola pemasukan, pengeluaran, dan laporan keuangan sekolah.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={filteredData.length === 0}
                  className={`theme-card inline-flex h-10 items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} px-4 text-xs font-semibold theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Download size={15} />
                  Export
                </button>

                <button
                  type="button"
                  onClick={() => openForm("pengeluaran")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] px-4 text-xs font-semibold text-[var(--color-danger)] transition hover:bg-[color-mix(in_srgb,var(--color-danger)_18%,transparent)]"
                >
                  <ArrowUpRight size={15} />
                  Pengeluaran
                </button>

                <button
                  type="button"
                  onClick={() => openForm("pemasukan")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                >
                  <Plus size={15} />
                  Pemasukan
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_6%,transparent)] p-4 text-sm">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold theme-text">
                    Sebagian data gagal dimuat
                  </p>
                  <p className="mt-1 break-words theme-text-secondary">
                    {error}
                  </p>
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

            {/* TOP GRID: SALDO UTAMA & KARTU RINGKASAN */}
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {/* Kartu Saldo Utama */}
              <div
                className={`relative flex flex-col overflow-hidden rounded-2xl ${themePrimaryGradient} p-6 text-white shadow-lg lg:col-span-4`}
              >
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-white/5" />

                <div className="relative flex items-center justify-between">
                  <p className="text-sm font-medium text-white/90">
                    Total Saldo Kas
                  </p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                    <Wallet size={18} className="text-white" />
                  </div>
                </div>

                <h2 className="relative mt-5 break-words text-3xl font-bold tracking-tight">
                  {loading ? "..." : formatRupiahOrUnavailable(saldoAkhir)}
                </h2>

                <p className="relative mt-1.5 flex items-center gap-1.5 text-xs text-white/80">
                  <TrendingUp size={13} /> Saldo gabungan semua akun
                </p>

                <div className="relative mt-auto grid grid-cols-2 gap-3 pt-8">
                  <button
                    type="button"
                    onClick={() => openForm("pemasukan")}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/20 py-2.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
                  >
                    <ArrowDownLeft size={14} />
                    Catat Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => openForm("pengeluaran")}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-xs font-semibold text-[var(--color-primary)] transition hover:bg-white/90"
                  >
                    <ArrowUpRight size={14} />
                    Catat Keluar
                  </button>
                </div>
              </div>

              {/* 4 Kartu Ringkasan */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
                <StatCard icon={TrendingUp} label="Total Pemasukan">
                  <p className="break-words text-xl font-bold theme-text">
                    {loading ? "..." : formatRupiahOrUnavailable(totalMasuk)}
                  </p>
                  <div
                    className={`mt-3 flex items-center justify-between border-t ${themeDivider} pt-3`}
                  >
                    <span className="text-[11px] theme-text-muted">
                      Bulan ini
                    </span>
                    <span className="text-xs font-semibold text-[var(--color-success)]">
                      {loading ? "..." : formatRupiahOrUnavailable(pemasukanBulanIni)}
                    </span>
                  </div>
                </StatCard>

                <StatCard icon={TrendingDown} label="Total Pengeluaran">
                  <p className="break-words text-xl font-bold theme-text">
                    {loading ? "..." : formatRupiahOrUnavailable(totalKeluar)}
                  </p>
                  <div
                    className={`mt-3 flex items-center justify-between border-t ${themeDivider} pt-3`}
                  >
                    <span className="text-[11px] theme-text-muted">
                      Bulan ini
                    </span>
                    <span className="text-xs font-semibold text-[var(--color-danger)]">
                      {loading ? "..." : formatRupiahOrUnavailable(pengeluaranBulanIni)}
                    </span>
                  </div>
                </StatCard>

                <StatCard icon={Receipt} label="Total Transaksi">
                  <p className="text-xl font-bold theme-text">
                    {loading ? "..." : formatNumberOrUnavailable(jurnalTotal)}
                  </p>
                  <div
                    className={`mt-3 flex items-center justify-between border-t ${themeDivider} pt-3`}
                  >
                    <span className="text-[11px] theme-text-muted">
                      Jumlah tercatat
                    </span>
                    <span className="text-xs font-semibold theme-text-secondary">
                      Jurnal kas
                    </span>
                  </div>
                </StatCard>

                <StatCard icon={AlertCircle} label="Tunggakan">
                  <p className="break-words text-xl font-bold text-[var(--color-danger)]">
                    {loading
                      ? "..."
                      : formatRupiahOrUnavailable(
                          tunggakanRingkasan?.totalTunggakan,
                        )}
                  </p>
                  <div
                    className={`mt-3 flex items-center justify-between border-t ${themeDivider} pt-3`}
                  >
                    <span className="text-[11px] theme-text-muted">
                      Siswa menunggak
                    </span>
                    <span className="text-xs font-semibold theme-text-secondary">
                      {tunggakanRingkasan?.jumlahTagihan || 0} Tagihan
                    </span>
                  </div>
                </StatCard>
              </div>
            </section>

            {/* MIDDLE GRID: AKUN KAS & LAPORAN PROGRES */}
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {/* Kiri: Akun Kas & Bank */}
              <div className="flex flex-col gap-3 lg:col-span-4">
                <SectionTitle
                  title="Akun Kas & Bank"
                  action={
                    <Link
                      href="/admin/keuangan/akunKas/tambah"
                      aria-label="Tambah akun kas"
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${themePrimarySurface} ${themePrimaryText} transition hover:opacity-80`}
                    >
                      <Plus size={16} />
                    </Link>
                  }
                />

                <div className="flex flex-1 flex-col gap-3">
                  {akunKas.map((akun) => {
                    const isBank = akun.tipe === "bank";

                    return (
                      <div
                        key={akun.id}
                        className={`relative overflow-hidden rounded-xl p-4 text-white shadow-sm ${
                          isBank ? themePrimaryGradient : themeDarkGradient
                        }`}
                      >
                        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10" />

                        <div className="relative flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            {isBank ? (
                              <Building2 size={16} className="shrink-0 text-white/80" />
                            ) : (
                              <Wallet size={16} className="shrink-0 text-white/80" />
                            )}
                            <p className="truncate text-sm font-medium">
                              {akun.nama}
                            </p>
                          </div>
                          <span className="shrink-0 rounded bg-white/20 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
                            {isBank ? "Bank" : "Tunai"}
                          </span>
                        </div>

                        <div className="relative mt-4">
                          <p className="text-lg font-bold">
                            {formatRupiah(akun.saldo)}
                          </p>
                          <p className="mt-0.5 text-[10px] text-white/75">
                            {akun.kode || (isBank ? "REKENING" : "KAS")}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {!loading && akunKas.length === 0 && (
                    <div
                      className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed ${themeNeutralBorder} ${themeNeutralSurface} p-6 text-center`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${themePrimarySurface} ${themePrimaryText}`}
                      >
                        <Wallet size={18} />
                      </div>
                      <p className="text-xs font-medium theme-text-secondary">
                        Belum ada akun kas
                      </p>
                      <Link
                        href="/admin/keuangan/akunKas/tambah"
                        className={`text-xs font-semibold ${themePrimaryText} hover:underline`}
                      >
                        Tambah akun kas
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Kanan: Laporan & Progres */}
              <div className="flex flex-col gap-3 lg:col-span-8">
                <SectionTitle
                  title="Laporan & Progres"
                  action={
                    <button
                      type="button"
                      onClick={() => setRefreshKey((k) => k + 1)}
                      aria-label="Muat ulang"
                      className={`flex h-7 w-7 items-center justify-center rounded-full theme-text-muted transition ${themeNeutralHover}`}
                    >
                      <RefreshCw
                        size={15}
                        className={loading ? "animate-spin" : ""}
                      />
                    </button>
                  }
                />

                <div
                  className={`theme-card grid flex-1 grid-cols-1 gap-6 rounded-2xl border ${themeNeutralBorder} p-5 sm:grid-cols-2 sm:gap-0 ${themeCardShadow}`}
                >
                  {/* Progres Pembayaran */}
                  <div className="flex flex-col justify-center sm:pr-6">
                    <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                      Progres Pembayaran Tagihan
                    </p>

                    <p className="mt-3 break-words text-2xl font-bold theme-text">
                      {formatRupiah(totalDibayar)}
                    </p>
                    <p className="mt-0.5 text-xs theme-text-secondary">
                      dari {formatRupiah(totalTagihan)}
                    </p>

                    <div
                      className={`mt-4 h-2 w-full overflow-hidden rounded-full ${themeNeutralSurface} border ${themeDivider}`}
                    >
                      <div
                        className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
                        style={{ width: `${progressPersen}%` }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="theme-text-secondary">
                        Sisa: {formatRupiah(sisaTagihan)}
                      </span>
                      <span className={`font-semibold ${themePrimaryText}`}>
                        {progressPersen.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Laporan Bulan Ini */}
                  <div
                    className={`flex flex-col justify-center sm:border-l ${themeDivider} sm:pl-6`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                      Laporan Bulan Ini
                    </p>

                    <div className="mt-3 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm theme-text-secondary">
                          Masuk
                        </span>
                        <span className="text-sm font-bold text-[var(--color-success)]">
                          {formatRupiah(pemasukanBulanIni || 0)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm theme-text-secondary">
                          Keluar
                        </span>
                        <span className="text-sm font-bold text-[var(--color-danger)]">
                          {formatRupiah(pengeluaranBulanIni || 0)}
                        </span>
                      </div>

                      <div
                        className={`flex items-center justify-between gap-3 border-t ${themeDivider} pt-3`}
                      >
                        <span className="text-sm font-semibold theme-text">
                          Selisih
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            selisihBulanIni < 0
                              ? "text-[var(--color-danger)]"
                              : themePrimaryText
                          }`}
                        >
                          {formatRupiah(selisihBulanIni)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* BOTTOM: AKTIVITAS TERBARU */}
            <section
              className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <div
                className={`flex flex-col gap-4 border-b ${themeDivider} p-5 lg:flex-row lg:items-center lg:justify-between`}
              >
                <div>
                  <h2 className="text-sm font-bold theme-text">
                    Aktivitas Terbaru
                  </h2>
                  <p className="mt-1 text-xs theme-text-secondary">
                    Riwayat pemasukan dan pengeluaran terbaru.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="relative w-full sm:w-56">
                    <Search
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Cari transaksi..."
                      className={`theme-input h-9 w-full rounded-lg border ${themeNeutralBorder} pl-8 pr-3 text-xs outline-none transition ${themeFocus}`}
                    />
                  </div>

                  <select
                    value={jenisFilter}
                    onChange={(e) => {
                      setJenisFilter(e.target.value);
                      setPage(1);
                    }}
                    className={`theme-input h-9 cursor-pointer rounded-lg border ${themeNeutralBorder} px-3 text-xs outline-none transition ${themeFocus}`}
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
                    className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition ${
                      bulanIniOnly
                        ? `border-[var(--color-primary)] ${themePrimarySurface} ${themePrimaryText}`
                        : `${themeNeutralBorder} theme-card theme-text-secondary ${themeNeutralHover}`
                    }`}
                  >
                    <Calendar size={13} />
                    Bulan Ini
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead>
                    <tr className={`border-b ${themeDivider} ${themeNeutralSurface}`}>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                        Tanggal
                      </th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                        No. Jurnal
                      </th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                        Keterangan / Kategori
                      </th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                        Jumlah
                      </th>
                      <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                        Status
                      </th>
                      <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center">
                          <Loader2
                            size={24}
                            className={`mx-auto animate-spin ${themePrimaryText}`}
                          />
                          <p className="mt-2 text-sm theme-text-secondary">
                            Memuat transaksi...
                          </p>
                        </td>
                      </tr>
                    ) : paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center">
                          <div
                            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${themeNeutralSurface} theme-text-muted`}
                          >
                            <Inbox size={20} />
                          </div>
                          <p className="mt-3 text-sm font-medium theme-text-secondary">
                            Tidak ada transaksi ditemukan
                          </p>
                          <p className="mt-1 text-xs theme-text-muted">
                            Transaksi yang dicatat akan tampil di sini.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item) => {
                        const isPemasukan = item.jenis === "pemasukan";
                        const isAktif = item.status === "aktif";

                        return (
                          <tr
                            key={item.id}
                            className={`border-b ${themeDivider} transition ${themeNeutralHover}`}
                          >
                            <td className="whitespace-nowrap px-5 py-4 text-xs theme-text-secondary">
                              {formatTanggal(item.tanggal)}
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-xs font-medium theme-text-secondary">
                              {item.nomor}
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-xs font-semibold theme-text">
                                {item.keterangan}
                              </p>
                              <p className="mt-0.5 text-[10px] theme-text-muted">
                                {item.kategori}
                              </p>
                            </td>
                            <td
                              className={`whitespace-nowrap px-5 py-4 text-right text-xs font-bold ${
                                isPemasukan
                                  ? "text-[var(--color-success)]"
                                  : "text-[var(--color-danger)]"
                              }`}
                            >
                              {isPemasukan ? "+" : "-"}
                              {formatRupiah(item.jumlah)}
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                  isAktif
                                    ? `${TONES.success.surface} ${TONES.success.text}`
                                    : `${themeNeutralSurface} theme-text-secondary`
                                }`}
                              >
                                {item.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => openDetail(item)}
                                aria-label="Lihat detail"
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} theme-text-muted transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]`}
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

              {/* Pagination */}
              {!loading && paginatedData.length > 0 && (
                <div
                  className={`flex flex-col gap-3 border-t ${themeDivider} px-5 py-4 sm:flex-row sm:items-center sm:justify-between`}
                >
                  <p className="text-xs theme-text-secondary">
                    Menampilkan{" "}
                    <span className="font-semibold theme-text">
                      {paginatedData.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold theme-text">
                      {filteredData.length}
                    </span>{" "}
                    transaksi
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      aria-label="Halaman sebelumnya"
                      className={`theme-card inline-flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} theme-text-secondary transition ${themeNeutralHover} disabled:opacity-40`}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="px-2 text-xs font-medium theme-text-secondary">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      aria-label="Halaman berikutnya"
                      className={`theme-card inline-flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} theme-text-secondary transition ${themeNeutralHover} disabled:opacity-40`}
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