"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  Users,
  FileCheck2,
  Route,
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  ChevronRight,
  FileText,
  UserRound,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";
import { getJalurPpdb } from "../../../../../../services/jalurPpdb.service";

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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// =========================================================
// COLOR MAP
// =========================================================

const colorMap = {
  zonasi: {
    bg: themePrimarySoft,
    text: themePrimaryText,
    border: themePrimarySoftBorder,
    soft: themePrimarySoft,
    icon: MapPin,
  },

  prestasi: {
    bg: themeWarningSurface,
    text: "text-[var(--color-warning)]",
    border: themeWarningBorder,
    soft: themeWarningSurface,
    icon: Sparkles,
  },

  afirmasi: {
    bg: themeSuccessSurface,
    text: "text-[var(--color-success)]",
    border: themeSuccessBorder,
    soft: themeSuccessSurface,
    icon: Users,
  },

  pindahan: {
    bg: themeNeutralSurface,
    text: "theme-danger",
    border: themeNeutralBorder,
    soft: themeNeutralSurface,
    icon: FileCheck2,
  },

  default: {
    bg: themeNeutralSurface,
    text: "theme-text-secondary",
    border: themeNeutralBorder,
    soft: themeNeutralSurface,
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
    normalized.includes("perpindahan")
  ) {
    return colorMap.pindahan;
  }

  return colorMap.default;
}

// =========================================================
// HELPERS
// =========================================================

function formatTanggal(value) {
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

function getStatusInfo(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "aktif") {
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

// =========================================================
// PAGE
// =========================================================

export default function DetailJalurPendaftaranPage() {
  const router = useRouter();
  const params = useParams();

  const id = useMemo(() => {
    if (!params?.id) {
      return "";
    }

    return decodeURIComponent(String(params.id));
  }, [params]);

  const [collapsed, setCollapsed] = useState(false);
  const [jalur, setJalur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const toggleSidebar = () => {
    setCollapsed((value) => !value);
  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  async function loadData(isRefresh = false) {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getJalurPpdb();

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Gagal mengambil data jalur pendaftaran."
        );
      }

      const jalurList = Array.isArray(response?.data)
        ? response.data
        : [];

      const selected = jalurList.find(
        (item) => String(item?.id) === String(id)
      );

      if (!selected) {
        throw new Error(
          "Jalur pendaftaran tidak ditemukan."
        );
      }

      setJalur(selected);
    } catch (err) {
      console.error(
        "GET DETAIL JALUR PPDB ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil detail jalur pendaftaran."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  // =========================================================
  // DERIVED DATA
  // =========================================================

  const style = useMemo(() => {
    return getColorByNama(jalur?.nama);
  }, [jalur?.nama]);

  const Icon = style.icon;

  const statusInfo = getStatusInfo(jalur?.status);

  const periodeAktif =
    isPeriodeAktif(jalur) &&
    String(jalur?.status || "").toLowerCase() ===
      "aktif";

  const filteredPendaftar = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return [];
    }

    return [];
  }, [search]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active="spmb"
          setActive={() => {}}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          role="admin"
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

          <main className="flex flex-1 items-center justify-center overflow-y-auto">
            <div className="flex flex-col items-center">
              <Loader2
                size={32}
                className={`${themePrimaryText} animate-spin`}
              />

              <p className="theme-text-secondary mt-4 text-sm font-medium">
                Memuat detail jalur pendaftaran...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="spmb"
        setActive={() => {}}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role="admin"
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

        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1320px]">

              {/* =====================================================
                  HEADER
              ====================================================== */}

              <div className="mb-6">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/spmb/jalur-pendaftaran"
                    )
                  }
                  className={`theme-card theme-text-secondary ${themeNeutralBorder} ${themeSmallShadow} ${themeNeutralHover} mb-4 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition`}
                >
                  <ArrowLeft size={17} />
                  Kembali
                </button>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="theme-text-secondary mb-2 flex flex-wrap items-center gap-2 text-sm">
                      <span>SPMB</span>

                      <span className="theme-text-muted">
                        /
                      </span>

                      <span>Jalur Pendaftaran</span>

                      <span className="theme-text-muted">
                        /
                      </span>

                      <span
                        className={`${themePrimaryText} font-medium`}
                      >
                        Detail
                      </span>
                    </div>

                    <h1 className="theme-text text-2xl font-bold tracking-tight md:text-3xl">
                      Detail Jalur Pendaftaran
                    </h1>

                    <p className="theme-text-secondary mt-1 text-sm leading-6 md:text-base">
                      Kelola informasi dan data pendaftar
                      pada jalur pendaftaran ini.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => loadData(true)}
                    disabled={refreshing}
                    className={`theme-card theme-text-secondary ${themeNeutralBorder} ${themeSmallShadow} ${themeNeutralHover} inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {refreshing ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <RefreshCw size={17} />
                    )}

                    {refreshing
                      ? "Memuat..."
                      : "Refresh"}
                  </button>
                </div>
              </div>

              {/* =====================================================
                  ERROR
              ====================================================== */}

              {error && (
                <div
                  className={`theme-danger mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${themeNeutralBorder} ${themeNeutralSurface}`}
                >
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="font-semibold">
                      Terjadi kesalahan
                    </p>

                    <p className="theme-text-secondary mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {jalur && (
                <>
                  {/* =====================================================
                      DETAIL HERO
                  ====================================================== */}

                  <section
                    className={`theme-card overflow-hidden rounded-2xl border ${style.border} ${themeCardShadow}`}
                  >
                    <div className="p-5 sm:p-6 lg:p-7">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${style.bg} ${style.text}`}
                          >
                            <Icon size={25} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="theme-text text-xl font-bold md:text-2xl">
                                {jalur.nama || "-"}
                              </h2>

                              <span
                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${statusInfo.className}`}
                              >
                                {statusInfo.label}
                              </span>
                            </div>

                            <p className="theme-text-secondary mt-2 max-w-3xl text-sm leading-6">
                              {jalur.deskripsi ||
                                "Tidak ada deskripsi jalur pendaftaran."}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold ${
                            periodeAktif
                              ? `${themeSuccessBorder} ${themeSuccessSurface} text-[var(--color-success)]`
                              : `${themeNeutralBorder} ${themeNeutralSurface} theme-text-secondary`
                          }`}
                        >
                          <CheckCircle2 size={15} />

                          {periodeAktif
                            ? "Periode sedang berjalan"
                            : "Di luar periode"}
                        </div>
                      </div>

                      {/* INFO CARDS */}

                      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <InfoCard
                          icon={Users}
                          label="Kuota"
                          value={`${Number(
                            jalur.kuota || 0
                          ).toLocaleString(
                            "id-ID"
                          )} siswa`}
                        />

                        <InfoCard
                          icon={CalendarDays}
                          label="Tanggal Mulai"
                          value={formatTanggal(
                            jalur.tanggalMulai
                          )}
                        />

                        <InfoCard
                          icon={Clock3}
                          label="Tanggal Selesai"
                          value={formatTanggal(
                            jalur.tanggalSelesai
                          )}
                        />

                        <InfoCard
                          icon={ShieldCheck}
                          label="Status Periode"
                          value={
                            periodeAktif
                              ? "Sedang Berjalan"
                              : "Tidak Berjalan"
                          }
                        />
                      </div>
                    </div>
                  </section>

                  {/* =====================================================
                      PENDAFTAR
                  ====================================================== */}

                  <section
                    className={`theme-card mt-6 rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
                  >
                    <div
                      className={`border-b ${themeDivider} p-5 sm:p-6`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <ClipboardList
                              size={19}
                              className={themePrimaryText}
                            />

                            <h2 className="theme-text text-base font-bold">
                              Daftar Pendaftar
                            </h2>
                          </div>

                          <p className="theme-text-secondary mt-1 text-sm">
                            Daftar calon peserta didik yang
                            mendaftar melalui jalur{" "}
                            <span className="theme-text font-semibold">
                              {jalur.nama || "-"}
                            </span>
                            .
                          </p>
                        </div>

                        <div className="relative w-full lg:max-w-sm">
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
                            placeholder="Cari nama atau NISN..."
                            className={`theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition ${themeFocus} placeholder:text-[var(--color-text-placeholder)]`}
                          />
                        </div>
                      </div>
                    </div>

                    {filteredPendaftar.length === 0 ? (
                      <div className="px-6 py-16 text-center">
                        <div
                          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${themePrimarySoft} ${themePrimaryText}`}
                        >
                          <UserRound size={30} />
                        </div>

                        <h3 className="theme-text mt-4 text-base font-bold">
                          Data pendaftar belum tersedia
                        </h3>

                        <p className="theme-text-secondary mx-auto mt-1 max-w-lg text-sm leading-6">
                          Halaman detail jalur sudah siap.
                          Data calon siswa, status seleksi, dan
                          berkas seperti KK, Akta, dan Ijazah
                          akan ditampilkan pada bagian ini setelah
                          endpoint data pendaftar tersedia.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr
                              className={`border-b ${themeDivider} ${themeNeutralSurface}`}
                            >
                              <th className="theme-text-muted px-5 py-3 text-left text-xs font-bold uppercase tracking-wide">
                                No
                              </th>

                              <th className="theme-text-muted px-5 py-3 text-left text-xs font-bold uppercase tracking-wide">
                                Nama
                              </th>

                              <th className="theme-text-muted px-5 py-3 text-left text-xs font-bold uppercase tracking-wide">
                                NISN
                              </th>

                              <th className="theme-text-muted px-5 py-3 text-left text-xs font-bold uppercase tracking-wide">
                                Status
                              </th>

                              <th className="theme-text-muted px-5 py-3 text-right text-xs font-bold uppercase tracking-wide">
                                Aksi
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {filteredPendaftar.map(
                              (item, index) => (
                                <tr
                                  key={item.id}
                                  className={`border-b ${themeDivider} last:border-0 ${themeNeutralHover}`}
                                >
                                  <td className="theme-text-secondary px-5 py-4 text-sm">
                                    {index + 1}
                                  </td>

                                  <td className="theme-text px-5 py-4 text-sm font-semibold">
                                    {item.namaLengkap ||
                                      "-"}
                                  </td>

                                  <td className="theme-text-secondary px-5 py-4 text-sm">
                                    {item.nisn || "-"}
                                  </td>

                                  <td className="theme-text-secondary px-5 py-4 text-sm">
                                    {item.status || "-"}
                                  </td>

                                  <td className="px-5 py-4 text-right">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push(
                                          `/admin/spmb/pendaftar/detail/${encodeURIComponent(
                                            item.id
                                          )}`
                                        )
                                      }
                                      className={`theme-card theme-text-secondary ${themeNeutralBorder} ${themeNeutralHover} inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition`}
                                    >
                                      Detail
                                      <ChevronRight
                                        size={14}
                                      />
                                    </button>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  {/* =====================================================
                      INFORMASI BAWAH
                  ====================================================== */}

                  <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* DOKUMEN */}

                    <div
                      className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} p-5 sm:p-6`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                        >
                          <FileCheck2 size={19} />
                        </div>

                        <div>
                          <h3 className="theme-text text-sm font-bold">
                            Dokumen Pendukung
                          </h3>

                          <p className="theme-text-secondary mt-1 text-xs leading-5">
                            Persyaratan dokumen yang berkaitan
                            dengan jalur pendaftaran.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-2">
                        <DocumentItem label="Kartu Keluarga (KK)" />
                        <DocumentItem label="Akta Kelahiran" />
                        <DocumentItem label="Dokumen persyaratan jalur" />
                      </div>
                    </div>

                    {/* SISTEM */}

                    <div
                      className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} p-5 sm:p-6`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themeNeutralSurface} theme-text-secondary`}
                        >
                          <FileText size={19} />
                        </div>

                        <div>
                          <h3 className="theme-text text-sm font-bold">
                            Informasi Sistem
                          </h3>

                          <p className="theme-text-secondary mt-1 text-xs leading-5">
                            Informasi identitas data jalur
                            pendaftaran.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        <SystemInfo
                          label="ID Jalur"
                          value={jalur.id}
                        />

                        <SystemInfo
                          label="ID Sekolah"
                          value={jalur.sekolahId}
                        />

                        <SystemInfo
                          label="Status"
                          value={statusInfo.label}
                        />
                      </div>
                    </div>
                  </section>

                  {/* =====================================================
                      INFO
                  ====================================================== */}

                  <div
                    className={`mt-6 flex items-start gap-2.5 rounded-xl border ${themeInfoBorder} ${themeInfoSurface} p-4 text-xs`}
                  >
                    <AlertCircle
                      size={16}
                      className={`${themePrimaryText} mt-0.5 shrink-0`}
                    />

                    <p className="theme-text-secondary leading-5">
                      Halaman ini mengambil detail jalur berdasarkan
                      ID pada URL. Detail calon siswa dan berkas
                      pendaftar belum diambil dari backend karena
                      endpoint GET pendaftaran PPDB belum tersedia.
                    </p>
                  </div>
                </>
              )}

              {/* =====================================================
                  FOOTER
              ====================================================== */}

              <footer
                className={`mt-8 border-t ${themeDivider} py-5 text-center`}
              >
                <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-2">
                  <span className="theme-text-muted text-[10px] font-medium">
                    © 2026 SmartSchool
                  </span>

                  <span className="theme-text-muted hidden sm:block">
                    •
                  </span>

                  <span className="theme-text-muted text-[10px]">
                    Dashboard Admin Sekolah
                  </span>
                </div>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// =========================================================
// INFO CARD
// =========================================================

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className={`theme-card-soft rounded-xl border ${themeNeutralBorder} p-4`}
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

// =========================================================
// DOCUMENT ITEM
// =========================================================

function DocumentItem({ label }) {
  return (
    <div
      className={`theme-card-soft flex items-center gap-3 rounded-xl border ${themeNeutralBorder} px-3.5 py-3`}
    >
      <div
        className={`theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themeNeutralBorder} border theme-text-secondary`}
      >
        <FileCheck2 size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="theme-text text-sm font-semibold">
          {label}
        </p>

        <p className="theme-text-muted mt-0.5 text-xs">
          Akan diperiksa pada detail pendaftar
        </p>
      </div>

      <ChevronRight
        size={15}
        className="theme-text-muted shrink-0"
      />
    </div>
  );
}

// =========================================================
// SYSTEM INFO
// =========================================================

function SystemInfo({ label, value }) {
  return (
    <div
      className={`theme-card-soft rounded-xl border ${themeNeutralBorder} p-3.5`}
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