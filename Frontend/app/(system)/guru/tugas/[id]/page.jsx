"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import { getDetailTugas } from "../../../../services/tugas.service";

import {
  CalendarDays,
  ClipboardList,
  Users,
  ArrowLeft,
  Pencil,
  AlertCircle,
  Loader2,
  BookOpen,
  Clock,
} from "lucide-react";

// ======================================================
// THEME HELPERS
// ======================================================

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

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

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

// ======================================================
// HELPERS
// ======================================================

function formatTanggalWaktu(date) {
  if (!date) return "-";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "-";

  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTanggal(date) {
  if (!date) return "-";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatJam(date) {
  if (!date) return "-";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "-";

  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusTugas(tugas) {
  if (!tugas?.batasWaktu) return "Terkirim";

  const deadline = new Date(tugas.batasWaktu);

  if (isNaN(deadline.getTime())) return "Terkirim";

  return new Date() > deadline ? "Berakhir" : "Terkirim";
}

// ======================================================
// STATUS THEME
// ======================================================

const statusBadgeStyle = {
  Terkirim: `${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`,
  Berakhir: `${themeDangerSurface} theme-danger ${themeDangerBorder}`,
};

const statusIcon = {
  Terkirim: ClipboardList,
  Berakhir: AlertCircle,
};

// ======================================================
// MAIN
// ======================================================

export default function DetailTugasPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [tugas, setTugas] = useState(null);
  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ======================================================
  // NOTIFICATION
  // ======================================================

  const notifications = [
    {
      id: 1,
      title: "Rapat Wali Kelas",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Batas Input Nilai Rapor",
      desc: "Dikirim 5 jam lalu",
      read: false,
    },
  ];

  // ======================================================
  // LOAD DETAIL TUGAS
  // ======================================================

  useEffect(() => {
    if (!params?.id) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("ID TUGAS:", params.id);

        const response = await getDetailTugas(params.id);

        console.log("RESPONSE DETAIL TUGAS:", response);

        const data =
          response?.data?.data ??
          response?.data ??
          response;

        if (!data) {
          throw new Error("Data tugas tidak ditemukan");
        }

        setTugas(data);
      } catch (err) {
        console.error("ERROR DETAIL TUGAS:", err);

        setError(
          err?.message || "Gagal mengambil detail tugas"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params?.id]);

  // ======================================================
  // STATUS
  // ======================================================

  const status = tugas
    ? getStatusTugas(tugas)
    : null;

  const StatusIcon = status
    ? statusIcon[status] || ClipboardList
    : ClipboardList;

  // ======================================================
  // DATA KELAS & MAPEL
  // ======================================================

  const kelasNama =
    tugas?.kelasMapel?.kelas?.nama ||
    "-";

  const mapelNama =
    tugas?.kelasMapel?.mataPelajaran?.nama ||
    "-";

  const guruNama =
    tugas?.kelasMapel?.guruPengajar?.namaLengkap ||
    "-";

  const jumlahPengumpulan =
    tugas?._count?.pengumpulanTugasSiswa ?? 0;

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="theme-page flex h-screen overflow-hidden">
        <Sidebar
          active="tugas"
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
              name: "Guru",
              email: "guru@smartschool.com",
              avatar: "GU",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-4">
            <div className="text-center">
              <div
                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${themePrimarySoft}`}
              >
                <Loader2
                  className={`h-7 w-7 animate-spin ${themePrimaryText}`}
                />
              </div>

              <p className="theme-text-secondary mt-4 text-sm">
                Memuat data tugas...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="theme-page flex h-screen overflow-hidden">
        <Sidebar
          active="tugas"
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
              name: "Guru",
              email: "guru@smartschool.com",
              avatar: "GU",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-4">
            <div
              className={`theme-card w-full max-w-md rounded-2xl border ${themeDangerBorder} p-6 text-center ${themeCardShadow}`}
            >
              <div
                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${themeDangerSurface} theme-danger`}
              >
                <AlertCircle className="h-6 w-6" />
              </div>

              <h2 className="theme-text mt-4 text-lg font-semibold">
                Gagal Memuat Tugas
              </h2>

              <p className="theme-text-secondary mt-2 text-sm leading-6">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/guru/tugas")
                }
                className={`mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} transition hover:opacity-90`}
              >
                <ArrowLeft size={16} />
                Kembali ke Tugas
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ======================================================
  // DATA TIDAK ADA
  // ======================================================

  if (!tugas) {
    return (
      <div className="theme-page flex h-screen overflow-hidden">
        <Sidebar
          active="tugas"
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
              name: "Guru",
              email: "guru@smartschool.com",
              avatar: "GU",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-4">
            <div className="text-center">
              <div
                className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${themeNeutralSurface}`}
              >
                <ClipboardList
                  className="h-7 w-7 theme-text-muted"
                />
              </div>

              <p className="theme-text-secondary text-sm">
                Data tugas tidak ditemukan.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/guru/tugas")
                }
                className={`mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--color-card)] ${themePrimaryGradient} transition hover:opacity-90`}
              >
                <ArrowLeft size={16} />
                Kembali
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN PAGE
  // ======================================================

  return (
    <div className="theme-page flex h-screen overflow-hidden">

      {/* SIDEBAR */}
      <Sidebar
        active="tugas"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      {/* CONTENT */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* HEADER */}
        <div className="shrink-0">
          <Header
            toggleSidebar={() =>
              setSidebarOpen(!sidebarOpen)
            }
            notifications={notifications}
            user={{
              name: "Guru",
              email: "guru@smartschool.com",
              avatar: "GU",
            }}
          />
        </div>

        {/* MAIN */}
        <main className="theme-page min-h-0 flex-1 overflow-y-auto">

          <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

            {/* ==================================================
                BACK
            ================================================== */}

            <button
              type="button"
              onClick={() => router.back()}
              className="theme-text-secondary mb-5 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--color-primary)]"
            >
              <ArrowLeft size={16} />
              Kembali
            </button>

            {/* ==================================================
                TITLE CARD
            ================================================== */}

            <section
              className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <div className="p-5 sm:p-6 lg:p-7">

                {/* TOP */}
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                  {/* TITLE */}
                  <div className="flex min-w-0 items-start gap-3">

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                    >
                      <ClipboardList size={21} />
                    </div>

                    <div className="min-w-0">

                      <h1 className="theme-text break-words text-xl font-semibold leading-tight sm:text-2xl">
                        {tugas.judul || "Tanpa judul"}
                      </h1>

                      <div className="theme-text-secondary mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">

                        <span className="inline-flex items-center gap-1.5">
                          <BookOpen
                            size={14}
                            className="theme-text-muted"
                          />

                          {mapelNama}
                        </span>

                        <span className="theme-text-muted hidden sm:inline">
                          •
                        </span>

                        <span>
                          {kelasNama}
                        </span>

                      </div>
                    </div>
                  </div>

                  {/* STATUS */}
                  <span
                    className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                      statusBadgeStyle[status] ||
                      `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`
                    }`}
                  >
                    <StatusIcon size={13} />

                    {status}
                  </span>
                </div>

                {/* ==================================================
                    INFO GRID
                ================================================== */}

                <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  {/* KELAS */}
                  <div
                    className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
                  >
                    <div className="flex items-center gap-2">
                      <Users
                        size={16}
                        className={themePrimaryText}
                      />

                      <span className="theme-text-muted text-xs font-medium">
                        Kelas
                      </span>
                    </div>

                    <p className="theme-text mt-2 break-words text-sm font-semibold">
                      {kelasNama}
                    </p>
                  </div>

                  {/* MAPEL */}
                  <div
                    className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen
                        size={16}
                        className={themePrimaryText}
                      />

                      <span className="theme-text-muted text-xs font-medium">
                        Mata Pelajaran
                      </span>
                    </div>

                    <p className="theme-text mt-2 break-words text-sm font-semibold">
                      {mapelNama}
                    </p>
                  </div>

                  {/* PENGUMPULAN */}
                  <div
                    className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardList
                        size={16}
                        className={themePrimaryText}
                      />

                      <span className="theme-text-muted text-xs font-medium">
                        Pengumpulan
                      </span>
                    </div>

                    <p className="theme-text mt-2 text-sm font-semibold">
                      {jumlahPengumpulan} siswa
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* ==================================================
                CONTENT GRID
            ================================================== */}

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">

              {/* ==================================================
                  DESKRIPSI
              ================================================== */}

              <section
                className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`border-b ${themeDivider} px-5 py-4 sm:px-6`}
                >
                  <div className="flex items-center gap-2">
                    <ClipboardList
                      size={18}
                      className={themePrimaryText}
                    />

                    <h2 className="theme-text text-sm font-semibold sm:text-base">
                      Deskripsi Tugas
                    </h2>
                  </div>
                </div>

                <div className="p-5 sm:p-6">

                  <div
                    className={`min-h-[140px] rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4 sm:p-5`}
                  >
                    <p className="theme-text-secondary whitespace-pre-line break-words text-sm leading-7">
                      {tugas.deskripsi ||
                        "Tidak ada deskripsi tugas."}
                    </p>
                  </div>

                </div>
              </section>

              {/* ==================================================
                  INFORMASI
              ================================================== */}

              <section
                className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`border-b ${themeDivider} px-5 py-4`}
                >
                  <h2 className="theme-text text-sm font-semibold sm:text-base">
                    Informasi Tugas
                  </h2>
                </div>

                <div>

                  {/* KELAS */}
                  <div
                    className={`flex items-start gap-3 border-b ${themeDivider} px-5 py-4`}
                  >
                    <Users
                      size={17}
                      className="theme-text-muted mt-0.5 shrink-0"
                    />

                    <div className="min-w-0">

                      <p className="theme-text-muted text-xs">
                        Kelas
                      </p>

                      <p className="theme-text mt-1 break-words text-sm font-medium">
                        {kelasNama}
                      </p>

                    </div>
                  </div>

                  {/* MAPEL */}
                  <div
                    className={`flex items-start gap-3 border-b ${themeDivider} px-5 py-4`}
                  >
                    <BookOpen
                      size={17}
                      className="theme-text-muted mt-0.5 shrink-0"
                    />

                    <div className="min-w-0">

                      <p className="theme-text-muted text-xs">
                        Mata Pelajaran
                      </p>

                      <p className="theme-text mt-1 break-words text-sm font-medium">
                        {mapelNama}
                      </p>

                    </div>
                  </div>

                  {/* DEADLINE */}
                  <div
                    className={`flex items-start gap-3 border-b ${themeDivider} px-5 py-4`}
                  >
                    <CalendarDays
                      size={17}
                      className="theme-text-muted mt-0.5 shrink-0"
                    />

                    <div className="min-w-0">

                      <p className="theme-text-muted text-xs">
                        Batas Pengumpulan
                      </p>

                      <p className="theme-text mt-1 break-words text-sm font-medium">
                        {formatTanggal(
                          tugas.batasWaktu
                        )}
                      </p>

                    </div>
                  </div>

                  {/* JAM */}
                  <div
                    className={`flex items-start gap-3 border-b ${themeDivider} px-5 py-4`}
                  >
                    <Clock
                      size={17}
                      className="theme-text-muted mt-0.5 shrink-0"
                    />

                    <div className="min-w-0">

                      <p className="theme-text-muted text-xs">
                        Waktu
                      </p>

                      <p className="theme-text mt-1 break-words text-sm font-medium">
                        {formatJam(
                          tugas.batasWaktu
                        )}{" "}
                        WIB
                      </p>

                    </div>
                  </div>

                  {/* GURU */}
                  <div className="flex items-start gap-3 px-5 py-4">
                    <Users
                      size={17}
                      className="theme-text-muted mt-0.5 shrink-0"
                    />

                    <div className="min-w-0">

                      <p className="theme-text-muted text-xs">
                        Guru Pengajar
                      </p>

                      <p className="theme-text mt-1 break-words text-sm font-medium">
                        {guruNama}
                      </p>

                    </div>
                  </div>

                </div>
              </section>
            </div>

            {/* ==================================================
                ACTION
            ================================================== */}

            <section
              className={`theme-card mt-5 rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow} sm:p-6`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="theme-text text-sm font-semibold">
                    Kelola Tugas
                  </h2>

                  <p className="theme-text-secondary mt-1 text-xs">
                    Ubah informasi tugas atau lihat hasil
                    pengumpulan siswa.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">

                  {/* EDIT */}
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/guru/tugas/${tugas.id}/edit`
                      )
                    }
                    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} transition hover:opacity-90`}
                  >
                    <Pencil size={16} />
                    Edit Tugas
                  </button>

                  {/* NILAI */}
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/guru/tugas/${tugas.id}/nilai`
                      )
                    }
                    className={`theme-card ${themeNeutralBorder} theme-text-secondary inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                  >
                    <Users size={16} />
                    Lihat Nilai
                  </button>

                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}