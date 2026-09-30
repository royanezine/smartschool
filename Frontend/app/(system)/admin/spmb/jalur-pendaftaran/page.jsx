"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  MapPin,
  Sparkles,
  Users,
  FileCheck2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Info,
  CalendarDays,
  Loader2,
  AlertCircle,
  Route,
  Clock3,
  Search,
  RefreshCw,
} from "lucide-react";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";
import { getPendaftarPpdb } from "../../../../../services/ppdb.service";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

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

// ============================================================
// COLOR MAP
// ============================================================

const colorMap = {
  zonasi: {
    bg: themeInfoSurface,
    text: "text-[var(--color-info)]",
    border: themeInfoBorder,
    icon: MapPin,
  },

  prestasi: {
    bg: themeWarningSurface,
    text: "text-[var(--color-warning)]",
    border: themeWarningBorder,
    icon: Sparkles,
  },

  afirmasi: {
    bg: themeSuccessSurface,
    text: "text-[var(--color-success)]",
    border: themeSuccessBorder,
    icon: Users,
  },

  pindahan: {
    bg: themePrimarySoft,
    text: themePrimaryText,
    border: themePrimarySoftBorder,
    icon: FileCheck2,
  },

  default: {
    bg: themeNeutralSurface,
    text: "theme-text-secondary",
    border: themeNeutralBorder,
    icon: Route,
  },
};

function getColorByNama(nama) {
  const normalized = String(nama || "").toLowerCase();

  if (normalized.includes("zonasi")) {
    return colorMap.zonasi;
  }

  if (normalized.includes("prestasi")) {
    return colorMap.prestasi;
  }

  if (normalized.includes("afirmasi")) {
    return colorMap.afirmasi;
  }

  if (
    normalized.includes("pindahan") ||
    normalized.includes("perpindahan") ||
    normalized.includes("mutasi")
  ) {
    return colorMap.pindahan;
  }

  return colorMap.default;
}

// ============================================================
// HELPERS
// ============================================================

function formatTanggalLengkap(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getDokumenPendukung(nama) {
  const normalized = String(nama || "").toLowerCase();

  if (normalized.includes("prestasi")) {
    return [
      "Kartu Keluarga (KK)",
      "Sertifikat atau Piagam Prestasi",
      "Fotokopi Rapor Kelas Terakhir",
    ];
  }

  if (normalized.includes("afirmasi")) {
    return [
      "Kartu Keluarga (KK)",
      "Dokumen Pendukung Afirmasi",
      "Fotokopi Rapor",
    ];
  }

  if (
    normalized.includes("pindahan") ||
    normalized.includes("perpindahan") ||
    normalized.includes("mutasi")
  ) {
    return [
      "Kartu Keluarga (KK)",
      "Surat Tugas / Perpindahan Kerja Orang Tua",
      "Fotokopi Rapor Kelas Terakhir",
    ];
  }

  return [
    "Kartu Keluarga (KK)",
    "Akta Kelahiran",
    "Fotokopi Rapor Kelas Terakhir",
  ];
}

function getStatusInfo(item) {
  const status = String(item?.status || "").toLowerCase();

  if (status === "aktif") {
    return {
      label: "Aktif",
      className: `${themeSuccessBorder} ${themeSuccessSurface} text-[var(--color-success)]`,
    };
  }

  return {
    label: "Tidak Aktif",
    className: `${themeNeutralBorder} ${themeNeutralSurface} theme-text-secondary`,
  };
}

function isPeriodeAktif(item) {
  const now = new Date();

  const mulai = item?.tanggalMulai
    ? new Date(item.tanggalMulai)
    : null;

  const selesai = item?.tanggalSelesai
    ? new Date(item.tanggalSelesai)
    : null;

  if (!mulai || Number.isNaN(mulai.getTime())) {
    return false;
  }

  if (selesai && !Number.isNaN(selesai.getTime())) {
    return now >= mulai && now <= selesai;
  }

  return now >= mulai;
}

// ============================================================
// PAGE
// ============================================================

export default function JalurPendaftaranPage() {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState("");

  const toggleSidebar = () => {
    setCollapsed((value) => !value);
  };

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadData = useCallback(
    async (isRefresh = false) => {
      try {
        setError("");

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await getPendaftarPpdb();

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Gagal mengambil data jalur pendaftaran."
          );
        }

        const pendaftar = Array.isArray(response?.data)
          ? response.data
          : [];

        const uniqueMap = new Map();

        pendaftar.forEach((item) => {
          const jalur = item?.jalurPpdb;

          if (!jalur?.id) {
            return;
          }

          if (!uniqueMap.has(jalur.id)) {
            uniqueMap.set(jalur.id, {
              id: jalur.id,
              sekolahId: item?.sekolahId || "",
              nama: jalur?.nama || "-",
              deskripsi: jalur?.deskripsi || "",
              kuota: Number(jalur?.kuota || 0),
              tanggalMulai: jalur?.tanggalMulai || null,
              tanggalSelesai: jalur?.tanggalSelesai || null,
              status: jalur?.status || "",
            });
          }
        });

        const jalur = Array.from(uniqueMap.values());

        setData(jalur);

        setOpenId((currentId) => {
          if (
            currentId &&
            jalur.some(
              (item) => item?.id === currentId
            )
          ) {
            return currentId;
          }

          return jalur[0]?.id || null;
        });
      } catch (err) {
        console.error("GET JALUR PPDB ERROR:", err);

        setError(
          err?.message ||
            "Gagal mengambil data jalur pendaftaran."
        );

        setData([]);
        setOpenId(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return data;
    }

    return data.filter((item) => {
      const nama = String(
        item?.nama || ""
      ).toLowerCase();

      const deskripsi = String(
        item?.deskripsi || ""
      ).toLowerCase();

      return (
        nama.includes(keyword) ||
        deskripsi.includes(keyword)
      );
    });
  }, [data, search]);

  // ============================================================
  // STATS
  // ============================================================

  const totalJalur = data.length;

  const totalKuota = data.reduce(
    (total, item) =>
      total + Number(item?.kuota || 0),
    0
  );

  const jalurAktif = data.filter(
    (item) =>
      String(item?.status || "").toLowerCase() ===
      "aktif"
  ).length;

  const jalurPeriodeAktif = data.filter(
    (item) =>
      String(item?.status || "").toLowerCase() ===
        "aktif" &&
      isPeriodeAktif(item)
  ).length;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeMenu="spmb"
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="theme-page flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm theme-text-secondary">
                  <span>SPMB</span>
                  <span>/</span>

                  <span
                    className={`font-medium ${themePrimaryText}`}
                  >
                    Jalur Pendaftaran
                  </span>
                </div>

                <h1 className="theme-text text-2xl font-bold tracking-tight md:text-3xl">
                  Jalur Pendaftaran
                </h1>

                <p className="theme-text-secondary mt-1 max-w-2xl text-sm leading-6 md:text-base">
                  Lihat informasi jalur pendaftaran,
                  kuota, periode, dan persyaratan SPMB.
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadData(true)}
                disabled={refreshing}
                className={`theme-card ${themeNeutralBorder} theme-text-secondary inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl border px-4 text-sm font-semibold ${themeSmallShadow} transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-60 lg:self-auto`}
              >
                {refreshing ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <RefreshCw size={17} />
                )}

                {refreshing ? "Memuat..." : "Refresh"}
              </button>
            </div>

            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (
              <div
                className={`theme-danger mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm`}
              >
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-0.5">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* =====================================================
                STATISTICS
            ===================================================== */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Jalur"
                value={totalJalur}
                icon={Route}
                description="Jalur tersedia"
              />

              <StatCard
                title="Total Kuota"
                value={totalKuota}
                icon={Users}
                description="Daya tampung siswa"
              />

              <StatCard
                title="Jalur Aktif"
                value={jalurAktif}
                icon={CheckCircle2}
                description="Status aktif"
              />

              <StatCard
                title="Periode Aktif"
                value={jalurPeriodeAktif}
                icon={Clock3}
                description="Sedang berjalan"
              />
            </div>

            {/* =====================================================
                SEARCH
            ===================================================== */}

            <div
              className={`theme-card ${themeNeutralBorder} mb-5 overflow-hidden rounded-2xl border ${themeCardShadow}`}
            >
              <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between md:p-5">
                <div>
                  <h2 className="theme-text text-sm font-semibold">
                    Daftar Jalur Pendaftaran
                  </h2>

                  <p className="theme-text-muted mt-0.5 text-xs">
                    Klik jalur untuk melihat informasi lengkap.
                  </p>
                </div>

                <div className="relative w-full md:max-w-sm">
                  <Search
                    size={17}
                    className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Cari nama jalur..."
                    className={`theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]`}
                  />
                </div>
              </div>
            </div>

            {/* =====================================================
                LOADING
            ===================================================== */}

            {loading ? (
              <div
                className={`theme-card ${themeNeutralBorder} flex min-h-[380px] items-center justify-center rounded-2xl border ${themeCardShadow}`}
              >
                <div className="flex flex-col items-center">
                  <Loader2
                    size={30}
                    className={`${themePrimaryText} animate-spin`}
                  />

                  <p className="theme-text-secondary mt-3 text-sm">
                    Memuat jalur pendaftaran...
                  </p>
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              /* =====================================================
                 EMPTY STATE
              ===================================================== */

              <div
                className={`theme-card ${themeNeutralBorder} flex min-h-[380px] flex-col items-center justify-center rounded-2xl border px-6 text-center ${themeCardShadow}`}
              >
                <div
                  className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${themePrimarySoft} ${themePrimaryText}`}
                >
                  <Route size={30} />
                </div>

                <h3 className="theme-text text-lg font-bold">
                  {data.length === 0
                    ? "Belum ada jalur pendaftaran"
                    : "Data tidak ditemukan"}
                </h3>

                <p className="theme-text-secondary mt-1 max-w-md text-sm leading-6">
                  {data.length === 0
                    ? "Belum ada data jalur pendaftaran yang tersedia."
                    : "Coba gunakan kata kunci pencarian yang berbeda."}
                </p>

                {data.length === 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      loadData(true)
                    }
                    className={`${themePrimaryGradient} inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--color-card)] transition hover:opacity-90`}
                  >
                    <RefreshCw size={17} />
                    Muat Ulang
                  </button>
                )}
              </div>
            ) : (
              /* =====================================================
                 LIST
              ===================================================== */

              <div className="space-y-4">
                {filteredData.map((item) => {
                  const isOpen =
                    openId === item?.id;

                  const style =
                    getColorByNama(item?.nama);

                  const Icon = style.icon;

                  const statusInfo =
                    getStatusInfo(item);

                  const dokumen =
                    getDokumenPendukung(
                      item?.nama
                    );

                  const periodeAktif =
                    isPeriodeAktif(item) &&
                    String(
                      item?.status || ""
                    ).toLowerCase() === "aktif";

                  return (
                    <div
                      key={item?.id}
                      className={`theme-card overflow-hidden rounded-2xl border ${style.border} ${themeCardShadow} transition`}
                    >
                      {/* HEADER ACCORDION */}

                      <button
                        type="button"
                        onClick={() =>
                          setOpenId(
                            isOpen
                              ? null
                              : item?.id
                          )
                        }
                        className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] sm:p-5"
                        aria-expanded={isOpen}
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.text}`}
                        >
                          <Icon size={20} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="theme-text font-bold">
                              {item?.nama || "-"}
                            </p>

                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusInfo.className}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>

                          <p className="theme-text-secondary mt-1 line-clamp-2 text-sm leading-5">
                            {item?.deskripsi ||
                              "Tidak ada deskripsi jalur."}
                          </p>
                        </div>

                        <div className="hidden shrink-0 text-right sm:block">
                          <p className="theme-text-muted text-xs">
                            Kuota
                          </p>

                          <p className="theme-text mt-0.5 text-sm font-bold">
                            {Number(
                              item?.kuota || 0
                            ).toLocaleString(
                              "id-ID"
                            )}{" "}
                            siswa
                          </p>
                        </div>

                        <ChevronDown
                          size={18}
                          className={`theme-text-muted shrink-0 transition-transform ${
                            isOpen
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </button>

                      {/* DETAIL */}

                      {isOpen && (
                        <div
                          className={`${themeDivider} border-t px-4 pb-5 pt-5 sm:px-5 sm:pb-6`}
                        >
                          {/* INFO CARDS */}

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <DetailCard
                              icon={Users}
                              label="Kuota"
                              value={`${Number(
                                item?.kuota || 0
                              ).toLocaleString(
                                "id-ID"
                              )} siswa`}
                            />

                            <DetailCard
                              icon={
                                CalendarDays
                              }
                              label="Tanggal Mulai"
                              value={formatTanggalLengkap(
                                item?.tanggalMulai
                              )}
                            />

                            <DetailCard
                              icon={Clock3}
                              label="Tanggal Selesai"
                              value={formatTanggalLengkap(
                                item?.tanggalSelesai
                              )}
                            />
                          </div>

                          {/* PERIOD */}

                          <div className="mt-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                                periodeAktif
                                  ? `${themeSuccessBorder} ${themeSuccessSurface} text-[var(--color-success)]`
                                  : `${themeNeutralBorder} ${themeNeutralSurface} theme-text-secondary`
                              }`}
                            >
                              <CheckCircle2
                                size={14}
                              />

                              {periodeAktif
                                ? "Sedang dalam periode pendaftaran"
                                : "Di luar periode pendaftaran"}
                            </span>
                          </div>

                          {/* DESCRIPTION */}

                          <div className="mt-6">
                            <p className="theme-text-muted mb-2 text-xs font-bold uppercase tracking-wide">
                              Deskripsi
                            </p>

                            <p className="theme-text-secondary text-sm leading-6">
                              {item?.deskripsi ||
                                "Tidak ada deskripsi jalur pendaftaran."}
                            </p>
                          </div>

                          {/* DOCUMENT */}

                          <div className="mt-6">
                            <p className="theme-text-muted mb-3 text-xs font-bold uppercase tracking-wide">
                              Dokumen Pendukung
                            </p>

                            <div className="space-y-2">
                              {dokumen.map(
                                (
                                  dokumenItem,
                                  index
                                ) => (
                                  <div
                                    key={index}
                                    className={`flex items-start gap-2.5 rounded-lg ${themeNeutralSurface} px-3.5 py-3`}
                                  >
                                    <FileCheck2
                                      size={15}
                                      className={`mt-0.5 shrink-0 ${style.text}`}
                                    />

                                    <span className="theme-text-secondary text-sm">
                                      {
                                        dokumenItem
                                      }
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {/* SYSTEM IDS */}

                          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <SystemInfo
                              label="ID Jalur"
                              value={item?.id}
                            />

                            <SystemInfo
                              label="ID Sekolah"
                              value={
                                item?.sekolahId
                              }
                            />
                          </div>

                          {/* ACTION */}

                          <div
                            className={`${themeDivider} mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between`}
                          >
                            <p className="theme-text-muted text-xs leading-5">
                              Data jalur berasal dari
                              sistem PPDB.
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/admin/spmb/jalur-pendaftaran/detail/${encodeURIComponent(
                                    String(
                                      item?.id || ""
                                    )
                                  )}`
                                )
                              }
                              disabled={!item?.id}
                              className={`${themeNeutralBorder} theme-card theme-text-secondary inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border px-5 py-2.5 text-sm font-semibold transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              Lihat Detail
                              <ChevronRight
                                size={16}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* =====================================================
                INFO
            ===================================================== */}

            <div
              className={`theme-card ${themeNeutralBorder} mt-5 flex items-start gap-2.5 rounded-xl border p-4 text-xs ${themeCardShadow}`}
            >
              <Info
                size={15}
                className={`mt-0.5 shrink-0 ${themePrimaryText}`}
              />

              <p className="theme-text-secondary leading-5">
                Data nama jalur, kuota, periode,
                status, ID jalur, dan ID sekolah
                ditampilkan berdasarkan data dari
                sistem PPDB.
              </p>
            </div>

            {/* =====================================================
                FOOTER
            ===================================================== */}

            <footer
              className={`${themeDivider} mt-6 border-t py-4 text-center`}
            >
              <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-2">
                <span className="theme-text-muted text-[10px] font-medium">
                  © 2026 SmartSchool
                </span>

                <span className="theme-text-placeholder hidden sm:block">
                  •
                </span>

                <span className="theme-text-muted text-[10px]">
                  Dashboard Admin Sekolah
                </span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================
// DETAIL CARD
// ============================================================

function DetailCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className={`theme-card ${themeNeutralBorder} rounded-xl border p-4`}
    >
      <div className="flex items-center gap-2">
        <Icon
          size={16}
          className="theme-text-muted"
        />

        <p className="theme-text-secondary text-xs font-semibold">
          {label}
        </p>
      </div>

      <p className="theme-text mt-2 text-sm font-bold">
        {value}
      </p>
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}) {
  return (
    <div
      className={`theme-card ${themeNeutralBorder} rounded-2xl border p-5 ${themeCardShadow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="theme-text-secondary text-sm font-medium">
            {title}
          </p>

          <p className="theme-text mt-2 text-2xl font-bold tracking-tight">
            {Number(
              value || 0
            ).toLocaleString("id-ID")}
          </p>

          <p className="theme-text-muted mt-1 text-xs">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SYSTEM INFO
// ============================================================

function SystemInfo({ label, value }) {
  return (
    <div
      className={`${themeNeutralSurface} ${themeNeutralBorder} rounded-xl border p-4`}
    >
      <p className="theme-text-muted text-xs font-semibold">
        {label}
      </p>

      <p className="theme-text-secondary mt-1 break-all text-sm font-medium">
        {value || "-"}
      </p>
    </div>
  );
}