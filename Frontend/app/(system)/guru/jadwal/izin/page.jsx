"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  FileText,
  Plus,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Hourglass,
  Paperclip,
  ArrowRight,
  Loader2,
  RefreshCw,
  UserCheck,
} from "lucide-react";

import { getDaftarIzin } from "@/services/izin.service";
import { getSessionUser } from "@/lib/auth";

// === TEMA & STYLING ===
const themePrimaryGradient =
"bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_80%,#000))]";


const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";
const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";
const themePrimaryText = "text-[var(--color-primary)]";
const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";
const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]";
const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";
const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

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
  "bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)]";
const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)]";
// Gunakan text-danger alih-alih theme-danger (penyebab error solid red)
const themeDangerText = "text-[var(--color-danger)]";

const STATUS_STYLE = {
  disetujui: {
    bg: themeSuccessSurface,
    text: "text-[var(--color-success)]",
    border: themeSuccessBorder,
    icon: CheckCircle2,
    label: "Disetujui",
  },
  menunggu: {
    bg: themeWarningSurface,
    text: "text-[var(--color-warning)]",
    border: themeWarningBorder,
    icon: Hourglass,
    label: "Menunggu",
  },
  ditolak: {
    bg: themeDangerSurface,
    text: themeDangerText,
    border: themeDangerBorder,
    icon: XCircle,
    label: "Ditolak",
  },
};

const JENIS_IZIN = [
  { value: "sakit", label: "Sakit" },
  { value: "izin", label: "Izin" },
];

// === HELPER FUNCTIONS ===
function normalizeDateOnly(value) {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTanggal(tanggal) {
  const normalized = normalizeDateOnly(tanggal);
  if (!normalized) return "-";
  const date = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatJenis(jenis) {
  if (!jenis) return "-";
  const found = JENIS_IZIN.find(
    (item) => item.value === String(jenis).toLowerCase()
  );
  return found ? found.label : jenis;
}

function normalizeResponseData(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

function buildUploadUrl(path) {
  if (!path) return "#";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "");
  return `${apiUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function GuruIzinPage() {
  const router = useRouter();
  const sessionUser = getSessionUser();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [riwayatIzin, setRiwayatIzin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");

  const notifications = [];
  const currentUserId = sessionUser?.id || sessionUser?.userId || "";

  const loadRiwayatIzin = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        else setRefreshing(true);
        setPageError("");

        const response = await getDaftarIzin({
          mine: true,
          limit: 100,
        });

        let daftar = normalizeResponseData(response);

        if (currentUserId) {
          daftar = daftar.filter(
            (item) =>
              String(item.penggunaId || item.pengguna?.id || "") ===
              String(currentUserId)
          );
        }

        setRiwayatIzin(daftar);
      } catch (error) {
        console.error("Gagal mengambil riwayat izin:", error);
        setPageError(
          error?.message || "Gagal mengambil riwayat pengajuan izin."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentUserId]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRiwayatIzin(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadRiwayatIzin]);

  const summary = {
    total: riwayatIzin.length,
    disetujui: riwayatIzin.filter((item) => item.status === "disetujui").length,
    menunggu: riwayatIzin.filter((item) => item.status === "menunggu").length,
    ditolak: riwayatIzin.filter((item) => item.status === "ditolak").length,
  };

  return (
    <div className="flex h-screen theme-page overflow-hidden">
      <Sidebar
        active="izin"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen((prev) => !prev)}
      />

      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden theme-page">
        <Header
          toggleSidebar={() => setSidebarOpen((prev) => !prev)}
          notifications={notifications}
          user={{
            name: "Bu Sari",
            email: "guru@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 theme-page">
          <div className="w-full space-y-6">
            {/* HEADER PAGE */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-lg ${themePrimaryGradient} text-white ${themePrimaryShadow} flex-shrink-0`}
                  >
                    <FileText size={18} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">
                        Pengajuan Izin
                      </h1>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-md ${themePrimarySoft} ${themePrimaryText} border ${themePrimarySoftBorder}`}
                      >
                        Guru
                      </span>
                    </div>
                    <p className="text-sm theme-text-secondary mt-1">
                      Ajukan izin tidak hadir mengajar dan pantau statusnya.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => loadRiwayatIzin(false)}
                  disabled={refreshing}
                  className={`inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-sm font-medium theme-text-secondary theme-card border ${themeNeutralBorder} rounded-lg ${themeNeutralHover} disabled:opacity-50 transition-colors`}
                >
                  <RefreshCw
                    size={15}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  type="button"
onClick={() =>
                    router.push(
                      "/guru/jadwal/izin/ajukan"
                    )
                  }
                  className={`inline-flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white ${themePrimaryGradient} rounded-lg hover:opacity-90 transition-opacity sm:flex-initial ${themeSmallShadow} whitespace-nowrap`}

                >
                  <Plus size={16} />
                  Ajukan Izin
                </button>
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {pageError && (
              <div
                className={`flex items-start justify-between gap-3 p-4 rounded-xl border ${themeDangerBorder} ${themeDangerSurface} ${themeDangerText}`}
              >
                <div className="text-sm">
                  <p className="font-semibold">Gagal memuat data</p>
                  <p className="mt-1">{pageError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => loadRiwayatIzin(true)}
                  className="text-sm font-medium underline hover:no-underline whitespace-nowrap"
                >
                  Coba lagi
                </button>
              </div>
            )}

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <SummaryCard
                icon={FileText}
                label="Total Pengajuan"
                value={loading ? "..." : summary.total}
                iconClass={`${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`}
              />
              <SummaryCard
                icon={Hourglass}
                label="Menunggu"
                value={loading ? "..." : summary.menunggu}
                iconClass={`${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`}
              />
              <SummaryCard
                icon={CheckCircle2}
                label="Disetujui"
                value={loading ? "..." : summary.disetujui}
                iconClass={`${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`}
              />
              <SummaryCard
                icon={XCircle}
                label="Ditolak"
                value={loading ? "..." : summary.ditolak}
                iconClass={`${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`}
              />
            </div>

            {/* LIST RIWAYAT */}
            <div
              className={`theme-card rounded-xl ${themeNeutralBorder} ${themeCardShadow} overflow-hidden`}
            >
              <div
                className={`p-4 sm:p-5 ${themeDivider} border-b flex items-center justify-between`}
              >
                <div>
                  <h3 className="text-sm font-semibold theme-text">
                    Riwayat Pengajuan
                  </h3>
                  <p className="text-xs theme-text-muted mt-1">
                    Daftar pengajuan izin kamu.
                  </p>
                </div>
                <span className="text-xs theme-text-muted flex-shrink-0">
                  {loading ? "Memuat..." : `${riwayatIzin.length} pengajuan`}
                </span>
              </div>

              <div className={`divide-y ${themeDivider}`}>
                {/* LOADING STATE */}
                {loading && (
                  <div className="p-10 text-center">
                    <Loader2
                      size={28}
                      className={`mx-auto ${themePrimaryText} animate-spin mb-3`}
                    />
                    <p className="text-sm theme-text-muted">
                      Memuat riwayat izin...
                    </p>
                  </div>
                )}

                {/* EMPTY STATE */}
                {!loading && riwayatIzin.length === 0 && (
                  <div className={`p-10 text-center ${themeNeutralSurface}`}>
                    <FileText
                      size={28}
                      className="mx-auto theme-text-muted mb-2"
                    />
                    <p className="text-sm theme-text-muted">
                      Belum ada pengajuan izin.
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push("/guru/jadwal/izin/ajukan")}
                      className={`mt-3 inline-flex items-center gap-1.5 text-sm font-medium ${themePrimaryText} hover:opacity-80`}
                    >
                      Buat pengajuan pertama
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}

                {/* DATA STATE */}
                {!loading &&
                  riwayatIzin.map((item, index) => {
                    const status =
                      STATUS_STYLE[item.status] || STATUS_STYLE.menunggu;
                    const StatusIcon = status.icon;
                    const tanggalMulai = formatTanggal(item.tanggalMulai);
                    const tanggalSelesai = formatTanggal(item.tanggalSelesai);

                    return (
                      <div
                        key={item.id || `${item.tanggalMulai}-${index}`}
                        className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4 transition-colors`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg ${themePrimarySoft} ${themePrimaryText} border ${themePrimarySoftBorder} flex items-center justify-center flex-shrink-0`}
                        >
                          <FileText size={17} />
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* TITLE & BADGES */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold theme-text">
                              {formatJenis(item.jenis)}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${themeNeutralSurface} theme-text-secondary border ${themeNeutralBorder}`}
                            >
                              Guru
                            </span>
                            <span
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${status.bg} ${status.text} ${status.border} flex items-center gap-1`}
                            >
                              <StatusIcon size={11} />
                              {status.label}
                            </span>
                          </div>

                          {/* DATE */}
                          <p className="text-xs theme-text-secondary mt-1.5 flex items-center gap-1.5">
                            <CalendarDays
                              size={13}
                              className="theme-text-muted flex-shrink-0"
                            />
                            {tanggalMulai === tanggalSelesai
                              ? tanggalMulai
                              : `${tanggalMulai} - ${tanggalSelesai}`}
                          </p>

                          {/* REASON */}
                          <p className="text-sm theme-text-secondary mt-2 leading-relaxed">
                            {item.alasan || "-"}
                          </p>

                          {/* GURU PENGGANTI */}
                          {item.guruPengganti?.namaLengkap && (
                            <div
                              className={`mt-2.5 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${themePrimarySoft} ${themePrimarySoftBorder} theme-text-secondary`}
                            >
                              <UserCheck
                                size={13}
                                className={themePrimaryText}
                              />
                              <span>
                                Guru Pengganti:{" "}
                                <strong className="theme-text">
                                  {item.guruPengganti.namaLengkap}
                                </strong>
                                {item.guruPengganti.nip
                                  ? ` (NIP: ${item.guruPengganti.nip})`
                                  : ""}
                              </span>
                            </div>
                          )}

                          {/* CATATAN ADMIN (DIPERBAIKI) */}
                          {item.catatan && (
                            <div
                              className={`mt-3 px-3.5 py-3 rounded-lg border ${
                                item.status === "ditolak"
                                  ? `${themeDangerSurface} ${themeDangerBorder}`
                                  : `${themeSuccessSurface} ${themeSuccessBorder}`
                              }`}
                            >
                              <p
                                className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                                  item.status === "ditolak"
                                    ? themeDangerText
                                    : "text-[var(--color-success)]"
                                }`}
                              >
                                Catatan Admin
                              </p>
                              <p
                                className={`text-xs leading-relaxed ${
                                  item.status === "ditolak"
                                    ? themeDangerText
                                    : "text-[var(--color-success)]"
                                }`}
                              >
                                {item.catatan}
                              </p>
                            </div>
                          )}

                          {/* LAMPIRAN */}
                          {item.urlBukti && (
                            <a
                              href={buildUploadUrl(item.urlBukti)}
                              target="_blank"
                              rel="noreferrer"
                              className={`inline-flex items-center gap-1.5 mt-3 text-xs font-medium ${themePrimaryText} hover:opacity-80`}
                            >
                              <Paperclip size={13} />
                              Lihat bukti
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, iconClass }) {
  return (
    <div
      className={`theme-card rounded-xl border border-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] p-3.5 ${themeCardShadow} flex items-center gap-3 min-w-0`}
    >
      <div className="p-2 rounded-lg border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex-shrink-0">
        <Icon size={16} className="theme-primary-text shrink-0" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
          {label}
        </p>
        <p className="text-lg font-bold theme-text">{value}</p>
      </div>
    </div>
  );
}