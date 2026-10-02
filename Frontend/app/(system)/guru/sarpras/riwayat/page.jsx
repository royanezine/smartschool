"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

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

import { getDaftarPeminjaman } from "@/services/sarpras.service";

// =========================================================
// THEME HELPERS
// =========================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeDividerBg =
  "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

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
    surface: themeSuccessSurface,
    text: "text-[var(--color-success)]",
    border: themeSuccessBorder,
    dot: "bg-[var(--color-success)]",
  },

  terlambat: {
    label: "Dikembalikan Terlambat",
    icon: AlertTriangle,
    surface: themeWarningSurface,
    text: "text-[var(--color-warning)]",
    border: themeWarningBorder,
    dot: "bg-[var(--color-warning)]",
  },

  ditolak: {
    label: "Ditolak",
    icon: XCircle,
    surface: themeDangerSurface,
    text: "theme-danger",
    border: themeDangerBorder,
    dot: "bg-[var(--color-text)]",
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
    aset?.kategori?.nama ||
    aset?.kategori?.namaKategori ||
    aset?.kategoriNama;

  if (!kategori) return "Lainnya";

  const k = kategori.toLowerCase();

  if (
    k.includes("elektronik") ||
    k.includes("laptop") ||
    k.includes("proyektor") ||
    k.includes("speaker")
  ) {
    return "Elektronik";
  }

  if (k.includes("ruang") || k.includes("gedung")) {
    return "Ruangan";
  }

  if (k.includes("olahraga") || k.includes("sport")) {
    return "Olahraga";
  }

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

  return details.reduce(
    (total, item) => total + Number(item?.jumlah || 0),
    0
  );
}

function getHasil(peminjaman) {
  if (peminjaman?.status === "ditolak") {
    return "ditolak";
  }

  if (peminjaman?.status === "dikembalikan") {
    const tanggalRencana = peminjaman?.tanggalKembaliRencana;
    const tanggalAktual = peminjaman?.tanggalKembaliAktual;

    if (tanggalRencana && tanggalAktual) {
      const rencana = new Date(tanggalRencana);
      const aktual = new Date(tanggalAktual);

      if (aktual > rencana) {
        return "terlambat";
      }
    }

    return "dikembalikan";
  }

  return null;
}

function normalizeResponse(response) {
  if (!response) return [];

  if (Array.isArray(response)) return response;

  if (Array.isArray(response.data)) return response.data;

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response.data?.items)) {
    return response.data.items;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  if (Array.isArray(response.peminjaman)) {
    return response.peminjaman;
  }

  if (Array.isArray(response.data?.peminjaman)) {
    return response.data.peminjaman;
  }

  return [];
}

// =========================================================
// PAGE
// =========================================================

export default function GuruSarprasRiwayatPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [rentangAktif, setRentangAktif] =
    useState("30 Hari Terakhir");
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

  // =======================================================
  // LOAD RIWAYAT
  // =======================================================

  const loadRiwayat = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getDaftarPeminjaman({
        page: 1,
        limit: 100,
      });

      const data = normalizeResponse(response);

      const history = data.filter(
        (item) =>
          item?.status === "dikembalikan" ||
          item?.status === "ditolak"
      );

      setDaftarRiwayat(history);
    } catch (err) {
      console.error(
        "Gagal mengambil riwayat peminjaman:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil riwayat peminjaman."
      );

      setDaftarRiwayat([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // =======================================================
  // LOAD PERTAMA KALI
  // =======================================================

  useEffect(() => {
    loadRiwayat(false);
  }, [loadRiwayat]);

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = () => {
    if (loading || refreshing) return;

    loadRiwayat(true);
  };

  // =======================================================
  // RENTANG TANGGAL
  // =======================================================

  const tanggalMulaiRentang = useMemo(() => {
    const sekarang = new Date();

    if (rentangAktif === "Semua") {
      return null;
    }

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

      if (bulan <= 5) {
        return new Date(
          sekarang.getFullYear(),
          0,
          1
        );
      }

      return new Date(
        sekarang.getFullYear(),
        6,
        1
      );
    }

    return null;
  }, [rentangAktif]);

  // =======================================================
  // FILTER DATA
  // =======================================================

  const dataTersaring = useMemo(() => {
    const search = pencarian.trim().toLowerCase();

    return daftarRiwayat.filter((r) => {
      const hasil = getHasil(r);

      if (!hasil) return false;

      const kategori = getKategori(r);

      const cocokKategori =
        kategoriAktif === "Semua" ||
        kategori === kategoriAktif;

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
        const tanggal =
          r?.tanggalPinjam ||
          r?.tanggalPengajuan;

        if (!tanggal) {
          cocokRentang = false;
        } else {
          cocokRentang =
            new Date(tanggal) >= tanggalMulaiRentang;
        }
      }

      return (
        cocokKategori &&
        cocokPencarian &&
        cocokRentang
      );
    });
  }, [
    daftarRiwayat,
    kategoriAktif,
    pencarian,
    tanggalMulaiRentang,
  ]);

  // =======================================================
  // RINGKASAN
  // =======================================================

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

    return {
      total,
      tepatWaktu,
      terlambat,
      ditolak,
    };
  }, [dataTersaring]);

  // =======================================================
  // DETAIL
  // =======================================================

  const bukaDetail = (item) => {
    if (!item?.id) return;

    router.push(
      `/guru/sarpras/riwayat/${item.id}`
    );
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          toggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
          notifications={notifications}
          user={{
            name: "Bu Sari",
            email: "guru@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="theme-page flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1700px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 2xl:max-w-[1900px]">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow}`}
                >
                  <FileText size={22} />
                </div>

                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />

                    <p className="text-[var(--color-primary)] text-[11px] font-bold uppercase tracking-[0.12em]">
                      Sarana & Prasarana
                    </p>
                  </div>

                  <h1 className="theme-text text-2xl font-bold tracking-tight md:text-[28px]">
                    Riwayat Peminjaman
                  </h1>

                  <p className="theme-text-secondary mt-1 flex max-w-2xl items-center gap-1.5 text-sm">
                    <Sparkles
                      size={14}
                      className="theme-text-muted flex-shrink-0"
                    />

                    <span className="truncate">
                      Catatan peminjaman yang telah
                      dikembalikan atau ditolak.
                    </span>
                  </p>
                </div>
              </div>

              {/* REFRESH */}

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className={`theme-card ${themeNeutralBorder} theme-text-secondary inline-flex h-11 flex-shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold ${themeNeutralHover} ${themeSmallShadow} transition-all disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <RefreshCw
                  size={15}
                  className={
                    loading || refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                {refreshing
                  ? "Memuat..."
                  : "Refresh"}
              </button>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className={`flex items-start gap-3 rounded-xl border p-4 ${themeDangerSurface} ${themeDangerBorder}`}
              >
                <div
                  className={`theme-card theme-danger flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border ${themeDangerBorder}`}
                >
                  <AlertTriangle size={16} />
                </div>

                <div>
                  <p className="theme-danger text-sm font-bold">
                    Gagal mengambil riwayat
                  </p>

                  <p className="theme-text-secondary mt-1 text-xs">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                RINGKASAN
            ================================================= */}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <RingkasanCard
                label="Total Riwayat"
                value={
                  loading
                    ? "—"
                    : ringkasan.total
                }
                tone="blue"
              />

              <RingkasanCard
                label="Tepat Waktu"
                value={
                  loading
                    ? "—"
                    : ringkasan.tepatWaktu
                }
                tone="emerald"
              />

              <RingkasanCard
                label="Terlambat"
                value={
                  loading
                    ? "—"
                    : ringkasan.terlambat
                }
                tone="amber"
              />

              <RingkasanCard
                label="Ditolak"
                value={
                  loading
                    ? "—"
                    : ringkasan.ditolak
                }
                tone="red"
              />
            </div>

            {/* =================================================
                SEARCH + FILTER
            ================================================= */}

            <div
              className={`theme-card ${themeNeutralBorder} ${themeCardShadow} space-y-3 rounded-xl border p-4`}
            >
              <div className="relative">
                <Search
                  size={16}
                  className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                />

                <input
                  type="text"
                  value={pencarian}
                  onChange={(e) =>
                    setPencarian(e.target.value)
                  }
                  placeholder="Cari nama item atau nomor pengajuan..."
                  className={`theme-input ${themeFocus} theme-text w-full rounded-lg border py-0 pl-10 pr-3 text-sm placeholder:text-[var(--color-text-placeholder)] h-11 outline-none transition-colors`}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* KATEGORI */}

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {KATEGORI_FILTER.map((kategori) => {
                    const aktif =
                      kategoriAktif === kategori;

                    return (
                      <button
                        key={kategori}
                        type="button"
                        onClick={() =>
                          setKategoriAktif(kategori)
                        }
                        className={`inline-flex h-10 items-center whitespace-nowrap rounded-lg border px-3.5 text-xs font-semibold transition-colors ${
                          aktif
                            ? `${themePrimaryGradient} border-[var(--color-primary)] text-[var(--color-card)]`
                            : `theme-card ${themeNeutralBorder} theme-text-secondary ${themeNeutralHover} hover:text-[var(--color-primary)]`
                        }`}
                      >
                        {kategori}
                      </button>
                    );
                  })}
                </div>

                {/* RENTANG */}

                <select
                  value={rentangAktif}
                  onChange={(e) =>
                    setRentangAktif(e.target.value)
                  }
                  className={`theme-input ${themeFocus} theme-text-secondary h-10 flex-shrink-0 rounded-lg border px-3 text-xs font-semibold outline-none transition-colors`}
                >
                  {RENTANG_FILTER.map((rentang) => (
                    <option
                      key={rentang}
                      value={rentang}
                    >
                      {rentang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* =================================================
                LIST
            ================================================= */}

            <div
              className={`theme-card ${themeNeutralBorder} ${themeCardShadow} overflow-hidden rounded-xl border transition-opacity duration-200 ${
                refreshing
                  ? "pointer-events-none opacity-60"
                  : "opacity-100"
              }`}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2
                    size={24}
                    className="animate-spin text-[var(--color-primary)]"
                  />

                  <p className="theme-text-secondary mt-3 text-sm">
                    Memuat riwayat peminjaman...
                  </p>
                </div>
              ) : (
                <div>
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
                        className={`group theme-card flex w-full items-center gap-4 border-b ${themeDivider} p-4 text-left transition-colors last:border-b-0 ${themeNeutralHover} sm:px-5 sm:py-4`}
                      >
                        {/* ICON */}

                        <div
                          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
                        >
                          <Package size={18} />
                        </div>

                        {/* CONTENT */}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="theme-text truncate text-sm font-bold">
                              {namaAset}
                            </h2>

                            {r.nomorPeminjaman && (
                              <span
                                className={`theme-text-muted ${themeNeutralSurface} ${themeNeutralBorder} rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold`}
                              >
                                {r.nomorPeminjaman}
                              </span>
                            )}
                          </div>

                          <div className="theme-text-secondary mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                            <span className="flex items-center gap-1">
                              <CalendarDays
                                size={12}
                                className="theme-text-muted"
                              />

                              {formatTanggal(
                                r.tanggalPinjam ||
                                  r.tanggalPengajuan
                              )}
                            </span>

                            <span className="hidden sm:inline">
                              {jumlah} unit
                            </span>

                            <span className="hidden md:inline">
                              {kategori}
                            </span>
                          </div>
                        </div>

                        {/* STATUS */}

                        {cfg && (
                          <span
                            className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cfg.surface} ${cfg.border} ${cfg.text}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`}
                            />

                            <span className="hidden sm:inline">
                              {cfg.label}
                            </span>
                          </span>
                        )}

                        {/* CHEVRON */}

                        <ChevronRight
                          size={16}
                          className="theme-text-muted hidden flex-shrink-0 transition-colors group-hover:text-[var(--color-primary)] sm:block"
                        />
                      </button>
                    );
                  })}

                  {/* EMPTY */}

                  {dataTersaring.length === 0 && (
                    <div className="px-4 py-16 text-center">
                      <div
                        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl border ${themeNeutralSurface} ${themeNeutralBorder} ${themePrimaryText}`}
                      >
                        <Package size={22} />
                      </div>

                      <p className="theme-text mt-4 text-sm font-bold">
                        Tidak ada riwayat peminjaman
                      </p>

                      <p className="theme-text-secondary mt-1 text-xs">
                        Belum ada data yang sesuai
                        dengan filter.
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

// =========================================================
// RINGKASAN CARD
// =========================================================

function RingkasanCard({
  label,
  value,
  tone = "blue",
}) {
  const tones = {
    blue: {
      icon: `${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`,
      value: "theme-text",
    },

    emerald: {
      icon: `${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`,
      value: "text-[var(--color-success)]",
    },

    amber: {
      icon: `${themeWarningSurface} ${themeWarningBorder} text-[var(--color-warning)]`,
      value: "text-[var(--color-warning)]",
    },

    red: {
      icon: `${themeDangerSurface} ${themeDangerBorder} theme-danger`,
      value: "theme-danger",
    },
  };

  const t = tones[tone] || tones.blue;

  return (
    <div
      className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl border p-4`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border ${t.icon}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        </div>

        <div className="min-w-0">
          <p className="theme-text-muted truncate text-[10px] font-bold uppercase tracking-wider">
            {label}
          </p>

          <p
            className={`mt-0.5 truncate text-xl font-bold ${t.value}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}