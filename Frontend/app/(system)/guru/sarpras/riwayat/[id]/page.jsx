"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import Sidebar from "../../../../../components/Sidebar";
import Header from "../../../../../components/Header";

import {
  FileText,
  Package,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Info,
  RotateCcw,
  ClipboardList,
  MessageSquare,
  Clock,
} from "lucide-react";

import { getDetailPeminjaman } from "../../../../../../services/sarpras.service";

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

function getHasil(peminjaman) {
  if (peminjaman?.status === "ditolak") return "ditolak";

  if (peminjaman?.status === "dikembalikan") {
    const rencana = peminjaman?.tanggalKembaliRencana;
    const aktual = peminjaman?.tanggalKembaliAktual;

    if (rencana && aktual) {
      if (new Date(aktual) > new Date(rencana)) {
        return "terlambat";
      }
    }

    return "dikembalikan";
  }

  return null;
}

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

function formatTanggalLengkap(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTanggalWaktu(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

  if (details.length === 0) {
    return "Aset";
  }

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

// =========================================================
// PAGE
// =========================================================

export default function DetailRiwayatPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const notifications = [
    {
      id: 1,
      title: "Riwayat Peminjaman",
      desc: "Detail riwayat peminjaman",
      read: false,
    },
  ];

  useEffect(() => {
    let mounted = true;

    async function loadDetail() {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          setError("ID riwayat tidak ditemukan.");
          return;
        }

        const response = await getDetailPeminjaman(id);

        if (!mounted) return;

        const data = response?.data || response?.data?.data || response;

        setDetail(data || null);
      } catch (err) {
        if (!mounted) return;

        console.error("Gagal mengambil detail riwayat:", err);

        setError(
          err?.message || "Gagal mengambil detail riwayat."
        );

        setDetail(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleBack = () => {
    router.push("/guru/sarpras/riwayat");
  };

  const hasil = detail ? getHasil(detail) : null;
  const cfg = hasil ? hasilConfig[hasil] : null;
  const StatusIcon = cfg?.icon;
  const totalUnit = detail ? getJumlah(detail) : 0;

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{
            name: "Bu Sari",
            email: "guru@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="theme-page flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

            {/* =================================================
                BACK
            ================================================= */}

            <button
              type="button"
              onClick={handleBack}
              className="theme-text-secondary inline-flex items-center gap-2 text-xs font-semibold transition-colors hover:text-[var(--color-primary)]"
            >
              <span
                className={`theme-card ${themeNeutralBorder} flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:border-[var(--color-primary)]`}
              >
                <ArrowLeft size={14} />
              </span>

              Kembali ke Riwayat
            </button>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
              <div
                className={`theme-card ${themeNeutralBorder} ${themeCardShadow} flex flex-col items-center justify-center rounded-xl border py-16`}
              >
                <Loader2
                  size={24}
                  className="animate-spin text-[var(--color-primary)]"
                />

                <p className="theme-text-secondary mt-3 text-sm">
                  Memuat detail riwayat...
                </p>
              </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {!loading && error && (
              <div
                className={`theme-card ${themeNeutralBorder} ${themeCardShadow} rounded-xl border p-6`}
              >
                <div
                  className={`flex items-start gap-3 rounded-lg border p-4 ${themeDangerSurface} ${themeDangerBorder}`}
                >
                  <div
                    className={`theme-card theme-danger flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border ${themeDangerBorder}`}
                  >
                    <AlertTriangle size={15} />
                  </div>

                  <div className="flex-1">
                    <p className="theme-danger text-sm font-bold">
                      Gagal memuat detail
                    </p>

                    <p className="theme-text-secondary mt-1 text-xs">
                      {error}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBack}
                  className={`mt-5 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} transition-all hover:-translate-y-0.5`}
                >
                  Kembali ke Riwayat
                </button>
              </div>
            )}

            {/* =================================================
                NOT FOUND
            ================================================= */}

            {!loading && !error && !detail && (
              <div
                className={`theme-card ${themeNeutralBorder} rounded-xl border border-dashed text-center py-16`}
              >
                <div
                  className={`mx-auto flex h-12 w-12 items-center justify-center rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
                >
                  <FileText size={20} />
                </div>

                <p className="theme-text mt-4 text-sm font-bold">
                  Detail tidak ditemukan
                </p>

                <p className="theme-text-secondary mt-1 text-xs">
                  Data riwayat tidak tersedia atau sudah dihapus.
                </p>

                <button
                  type="button"
                  onClick={handleBack}
                  className={`mt-5 inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} transition-all hover:-translate-y-0.5`}
                >
                  Kembali ke Riwayat
                </button>
              </div>
            )}

            {/* =================================================
                DETAIL CONTENT
            ================================================= */}

            {!loading && !error && detail && (
              <div className="space-y-5">

                {/* =================================================
                    HEADER CARD
                ================================================= */}

                <div
                  className={`overflow-hidden rounded-xl ${themePrimaryGradient} ${themePrimaryShadow}`}
                >
                  <div className="flex items-stretch">
                    <div className="w-1 flex-shrink-0 bg-[var(--color-card)]/60" />

                    <div className="flex-1 p-5 text-[var(--color-card)] sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--color-card)]/20 bg-[var(--color-card)]/10">
                            <FileText size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-card)]/75">
                              Riwayat Peminjaman
                            </p>

                            <h1 className="mt-1 break-all font-mono text-lg font-bold sm:text-xl">
                              {detail.nomorPeminjaman || "-"}
                            </h1>

                            <p className="mt-1.5 text-xs text-[var(--color-card)]/70">
                              {formatTanggalLengkap(
                                detail.tanggalPengajuan
                              )}
                            </p>
                          </div>
                        </div>

                        {cfg && StatusIcon && (
                          <span
                            className="inline-flex flex-shrink-0 items-center gap-1.5 self-start rounded-md border border-[var(--color-card)]/20 bg-[var(--color-card)]/10 px-2.5 py-1 text-[11px] font-semibold"
                          >
                            <StatusIcon size={12} />

                            {cfg.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    QUICK STATS
                ================================================= */}

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatCard
                    icon={<CalendarDays size={15} />}
                    label="Tanggal Pinjam"
                    value={formatTanggal(detail.tanggalPinjam)}
                  />

                  <StatCard
                    icon={<CalendarDays size={15} />}
                    label="Rencana Kembali"
                    value={formatTanggal(
                      detail.tanggalKembaliRencana
                    )}
                  />

                  <StatCard
                    icon={<RotateCcw size={15} />}
                    label="Aktual Kembali"
                    value={formatTanggal(
                      detail.tanggalKembaliAktual
                    )}
                  />

                  <StatCard
                    icon={<Package size={15} />}
                    label="Total Unit"
                    value={`${totalUnit} unit`}
                  />
                </div>

                {/* =================================================
                    MAIN GRID
                ================================================= */}

                <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">

                  {/* =================================================
                      LEFT COLUMN
                  ================================================= */}

                  <div className="space-y-5">

                    {/* DAFTAR ASET */}

                    <div
                      className={`theme-card ${themeNeutralBorder} ${themeCardShadow} overflow-hidden rounded-xl border`}
                    >
                      <div
                        className={`flex items-center justify-between gap-4 border-b px-5 py-4 ${themeDivider} ${themeNeutralSurface}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
                          >
                            <Package size={15} />
                          </div>

                          <div>
                            <p className="theme-text text-sm font-bold">
                              Aset yang Dipinjam
                            </p>

                            <p className="theme-text-muted mt-0.5 text-[11px]">
                              {(detail.detailPeminjaman || []).length}{" "}
                              jenis aset • {totalUnit} total unit
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5">
                        {(detail.detailPeminjaman || []).length > 0 ? (
                          <div className="space-y-2">
                            {(detail.detailPeminjaman || []).map(
                              (item) => (
                                <div
                                  key={item.id}
                                  className={`theme-card ${themeNeutralBorder} ${themeNeutralHover} flex items-center gap-3 rounded-lg border p-3.5 transition-colors`}
                                >
                                  <div
                                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
                                  >
                                    <Package size={16} />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="theme-text truncate text-sm font-semibold">
                                      {item?.aset?.nama || "Aset"}
                                    </p>

                                    <p className="theme-text-muted mt-0.5 font-mono text-[11px]">
                                      {item?.aset?.kode || "-"}
                                    </p>
                                  </div>

                                  <span
                                    className={`flex-shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
                                  >
                                    {item.jumlah} unit
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div
                            className={`rounded-lg border border-dashed ${themePrimarySoftBorder} px-4 py-10 text-center`}
                          >
                            <Info
                              size={18}
                              className="mx-auto text-[var(--color-primary)]"
                            />

                            <p className="theme-text-secondary mt-2 text-xs">
                              Detail aset tidak tersedia.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* KEPERLUAN */}

                    <InfoBlock
                      icon={<ClipboardList size={15} />}
                      title="Keperluan"
                      content={detail.keperluan || "-"}
                    />

                    {/* CATATAN */}

                    {detail.catatanPeminjaman && (
                      <InfoBlock
                        icon={<MessageSquare size={15} />}
                        title="Catatan Peminjaman"
                        content={detail.catatanPeminjaman}
                      />
                    )}

                    {/* DIKEMBALIKAN / TERLAMBAT */}

                    {(hasil === "dikembalikan" ||
                      hasil === "terlambat") && (
                      <div
                        className={`theme-card ${themeNeutralBorder} ${themeCardShadow} overflow-hidden rounded-xl border`}
                      >
                        <div className="flex items-stretch">
                          <div
                            className={`w-1 flex-shrink-0 ${
                              hasil === "terlambat"
                                ? "bg-[var(--color-warning)]"
                                : "bg-[var(--color-success)]"
                            }`}
                          />

                          <div className="flex-1 px-5 py-4">
                            <div className="mb-3 flex items-center gap-3">
                              <div
                                className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                                  hasil === "terlambat"
                                    ? `${themeWarningSurface} ${themeWarningBorder} text-[var(--color-warning)]`
                                    : `${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`
                                }`}
                              >
                                {hasil === "terlambat" ? (
                                  <AlertTriangle size={15} />
                                ) : (
                                  <RotateCcw size={15} />
                                )}
                              </div>

                              <div>
                                <p className="theme-text text-sm font-bold">
                                  {hasil === "terlambat"
                                    ? "Dikembalikan Terlambat"
                                    : "Dikembalikan Tepat Waktu"}
                                </p>

                                <p className="theme-text-muted text-[11px]">
                                  {formatTanggalWaktu(
                                    detail.tanggalKembaliAktual
                                  )}
                                </p>
                              </div>
                            </div>

                            {hasil === "terlambat" && (
                              <p className="text-xs leading-relaxed text-[var(--color-warning)]">
                                Aset dikembalikan melewati tanggal
                                rencana pengembalian (
                                {formatTanggal(
                                  detail.tanggalKembaliRencana
                                )}
                                ).
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* DITOLAK */}

                    {detail.status === "ditolak" &&
                      detail.catatanPenolakan && (
                        <div
                          className={`theme-card ${themeDangerBorder} ${themeCardShadow} overflow-hidden rounded-xl border`}
                        >
                          <div className="flex items-stretch">
                            <div className="w-1 flex-shrink-0 bg-[var(--color-text)]" />

                            <div className="flex-1 px-5 py-4">
                              <div className="mb-3 flex items-center gap-3">
                                <div
                                  className={`flex h-9 w-9 items-center justify-center rounded-lg border ${themeDangerSurface} ${themeDangerBorder} theme-danger`}
                                >
                                  <XCircle size={15} />
                                </div>

                                <div>
                                  <p className="theme-text text-sm font-bold">
                                    Alasan Penolakan
                                  </p>

                                  <p className="theme-text-muted text-[11px]">
                                    Pengajuan ini tidak dapat disetujui
                                  </p>
                                </div>
                              </div>

                              <p className="theme-text-secondary text-sm leading-relaxed">
                                {detail.catatanPenolakan}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* =================================================
                      RIGHT COLUMN
                  ================================================= */}

                  <aside className="space-y-5 lg:sticky lg:top-6">

                    {/* INFO CARD */}

                    <div
                      className={`theme-card ${themeNeutralBorder} ${themeCardShadow} overflow-hidden rounded-xl border`}
                    >
                      <div
                        className={`flex items-center gap-3 border-b px-5 py-4 ${themeDivider} ${themeNeutralSurface}`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
                        >
                          <Clock size={14} />
                        </div>

                        <div>
                          <p className="theme-text text-sm font-bold">
                            Informasi Peminjaman
                          </p>

                          <p className="theme-text-muted mt-0.5 text-[11px]">
                            Detail waktu & kategori
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3.5 px-5 py-4">
                        <InfoRow
                          label="Nomor Pengajuan"
                          value={detail.nomorPeminjaman || "-"}
                          mono
                        />

                        <Divider />

                        <InfoRow
                          label="Tanggal Pengajuan"
                          value={formatTanggalLengkap(
                            detail.tanggalPengajuan
                          )}
                        />

                        <Divider />

                        <InfoRow
                          label="Tanggal Pinjam"
                          value={formatTanggal(detail.tanggalPinjam)}
                        />

                        <Divider />

                        <InfoRow
                          label="Rencana Kembali"
                          value={formatTanggal(
                            detail.tanggalKembaliRencana
                          )}
                        />

                        <Divider />

                        <InfoRow
                          label="Kategori"
                          value={getKategori(detail)}
                        />

                        <Divider />

                        <InfoRow
                          label="Total Unit"
                          value={`${totalUnit} unit`}
                        />
                      </div>
                    </div>

                    {/* NAMA ASET */}

                    <div
                      className={`theme-card ${themeNeutralBorder} ${themeCardShadow} overflow-hidden rounded-xl border`}
                    >
                      <div
                        className={`flex items-center gap-3 border-b px-5 py-4 ${themeDivider} ${themeNeutralSurface}`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
                        >
                          <Package size={14} />
                        </div>

                        <p className="theme-text text-sm font-bold">
                          Ringkasan Aset
                        </p>
                      </div>

                      <div className="px-5 py-4">
                        <p className="theme-text text-sm font-bold leading-relaxed">
                          {getNamaAset(detail)}
                        </p>
                      </div>
                    </div>

                    {/* ACTION */}

                    <button
                      type="button"
                      onClick={handleBack}
                      className={`theme-card ${themeNeutralBorder} ${themeNeutralHover} theme-text-secondary w-full rounded-lg border px-4 text-xs font-semibold transition-colors`}
                    >
                      Kembali ke Riwayat
                    </button>
                  </aside>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// =========================================================
// SUB COMPONENTS
// =========================================================

function StatCard({ icon, label, value }) {
  return (
    <div
      className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl border p-4 transition-colors hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="theme-text-muted truncate text-[10px] font-semibold uppercase tracking-wider">
            {label}
          </p>

          <p className="theme-text mt-0.5 truncate text-sm font-bold">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ icon, title, content }) {
  return (
    <div
      className={`theme-card ${themeNeutralBorder} ${themeCardShadow} overflow-hidden rounded-xl border`}
    >
      <div
        className={`flex items-center gap-3 border-b px-5 py-4 ${themeDivider} ${themeNeutralSurface}`}
      >
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
        >
          {icon}
        </div>

        <p className="theme-text text-sm font-bold">
          {title}
        </p>
      </div>

      <div className="px-5 py-4">
        <p className="theme-text-secondary text-sm leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="theme-text-muted flex-shrink-0">
        {label}
      </span>

      <span
        className={`theme-text text-right font-semibold break-all ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div className={`h-px w-full ${themeDividerBg}`} />;
}