
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  getDetailTugas,
  getPengumpulanByTugas,
} from "@/services/tugas.service";

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

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

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

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUUID(value) {
  return typeof value === "string" && UUID_REGEX.test(value.trim());
}

function unwrapResponse(response) {
  let data = response;

  for (let i = 0; i < 5; i += 1) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      break;
    }

    if (
      data.data !== undefined &&
      data.data !== null &&
      typeof data.data === "object"
    ) {
      data = data.data;
      continue;
    }

    break;
  }

  return data;
}

/**
 * Mengambil nama pengguna dari object relasi API.
 * String yang berbentuk UUID tidak dianggap sebagai nama.
 */
function getNamaPengguna(value) {
  if (!value) return "";

  if (typeof value === "string") {
    const text = value.trim();

    return text && !isUUID(text) ? text : "";
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  const kandidat = [
    value.namaLengkap,
    value.nama,
    value.name,
    value.namaGuru,
    value.namaPengguna,
    value.fullName,
    value.displayName,
    value.user?.namaLengkap,
    value.user?.nama,
    value.user?.name,
    value.pengguna?.namaLengkap,
    value.pengguna?.nama,
    value.pengguna?.name,
    value.guru?.namaLengkap,
    value.guru?.nama,
    value.guru?.pengguna?.namaLengkap,
    value.guru?.pengguna?.nama,
    value.profil?.namaLengkap,
    value.profil?.nama,
  ];

  for (const nama of kandidat) {
    if (
      typeof nama === "string" &&
      nama.trim() &&
      nama.trim() !== "-" &&
      !isUUID(nama.trim())
    ) {
      return nama.trim();
    }
  }

  return "";
}

/**
 * Mengambil data guru dari beberapa kemungkinan relasi API.
 */
function getDataGuru(tugas) {
  const kelasMapel = tugas?.kelasMapel ?? {};

  const kandidat = [
    kelasMapel?.guruPengajar,
    kelasMapel?.guru,
    kelasMapel?.pengguna,
    kelasMapel?.guruMapel,
    kelasMapel?.pengajar,
    kelasMapel?.guruPengajar?.pengguna,
    kelasMapel?.guru?.pengguna,
    tugas?.guruPengajar,
    tugas?.guru,
    tugas?.guruMapel,
    tugas?.pengajar,
    tugas?.pengguna,
    tugas?.dibuatOleh,
    tugas?.createdBy,
  ];

  for (const item of kandidat) {
    if (
      item &&
      typeof item === "object" &&
      !Array.isArray(item)
    ) {
      return item;
    }
  }

  return null;
}

/**
 * Mengambil nama guru, bukan ID guru.
 */
function getNamaGuru(tugas) {
  if (!tugas) return "";

  const kelasMapel = tugas?.kelasMapel ?? {};

  const kandidatNama = [
    getNamaPengguna(kelasMapel?.guruPengajar),
    getNamaPengguna(kelasMapel?.guru),
    getNamaPengguna(kelasMapel?.pengguna),
    getNamaPengguna(kelasMapel?.guruMapel),
    getNamaPengguna(kelasMapel?.pengajar),
    getNamaPengguna(kelasMapel?.guruPengajar?.pengguna),
    getNamaPengguna(kelasMapel?.guru?.pengguna),
    getNamaPengguna(tugas?.guruPengajar),
    getNamaPengguna(tugas?.guru),
    getNamaPengguna(tugas?.guruMapel),
    getNamaPengguna(tugas?.pengajar),
    getNamaPengguna(tugas?.pengguna),
    getNamaPengguna(tugas?.dibuatOleh),
    getNamaPengguna(tugas?.createdBy),
    tugas?.guruPengajarNama,
    tugas?.namaGuru,
    tugas?.guruNama,
    tugas?.namaPengajar,
    kelasMapel?.guruPengajarNama,
    kelasMapel?.namaGuru,
    kelasMapel?.namaPengajar,
  ];

  for (const nama of kandidatNama) {
    if (
      typeof nama === "string" &&
      nama.trim() &&
      nama.trim() !== "-" &&
      !isUUID(nama.trim())
    ) {
      return nama.trim();
    }
  }

  return "";
}

function formatTanggal(date) {
  if (!date) return "-";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatJam(date) {
  if (!date) return "-";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusTugas(tugas) {
  if (!tugas?.batasWaktu) return "Tanpa Batas Waktu";

  const deadline = new Date(tugas.batasWaktu);

  if (Number.isNaN(deadline.getTime())) {
    return "Tanpa Batas Waktu";
  }

  return Date.now() > deadline.getTime()
    ? "Berakhir"
    : "Berlangsung";
}

const statusBadgeStyle = {
  Berlangsung: `${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`,
  "Tanpa Batas Waktu": `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`,
  Berakhir: `${themeDangerSurface} theme-danger ${themeDangerBorder}`,
};

const statusIcon = {
  Berlangsung: ClipboardList,
  "Tanpa Batas Waktu": Clock,
  Berakhir: AlertCircle,
};

export default function DetailTugasPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;
  const tugasId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [loading, setLoading] = useState(true);
  const [tugas, setTugas] = useState(null);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!tugasId) {
      setLoading(false);
      setError("ID tugas tidak ditemukan pada URL.");
      return;
    }

    let active = true;

    async function loadDetailTugas() {
      try {
        setLoading(true);
        setError("");

        const [detailResult, submissionResult] =
          await Promise.allSettled([
            getDetailTugas(tugasId),
            getPengumpulanByTugas(tugasId),
          ]);

        if (!active) return;

        if (detailResult.status === "rejected") {
          throw detailResult.reason;
        }

        const data = unwrapResponse(detailResult.value);

        if (
          !data ||
          typeof data !== "object" ||
          Array.isArray(data) ||
          !data.id
        ) {
          throw new Error(
            "Data tugas tidak ditemukan atau respons API tidak sesuai."
          );
        }

        let submissions = null;

        if (submissionResult.status === "fulfilled") {
          const submissionData = unwrapResponse(
            submissionResult.value
          );

          if (Array.isArray(submissionData)) {
            submissions = submissionData;
          } else if (
            Array.isArray(submissionData?.pengumpulanTugasSiswa)
          ) {
            submissions = submissionData.pengumpulanTugasSiswa;
          } else if (
            Array.isArray(submissionData?.pengumpulan)
          ) {
            submissions = submissionData.pengumpulan;
          } else if (Array.isArray(submissionData?.items)) {
            submissions = submissionData.items;
          }
        } else {
          console.error(
            "GAGAL MEMUAT DAFTAR PENGUMPULAN TUGAS:",
            submissionResult.reason
          );
        }

        const tugasFinal = {
          ...data,
          ...(Array.isArray(submissions)
            ? {
                pengumpulanTugasSiswa: submissions,
                _count: {
                  ...(data._count || {}),
                  pengumpulanTugasSiswa: submissions.length,
                },
              }
            : {}),
        };

        if (!active) return;

        setTugas(tugasFinal);
      } catch (err) {
        if (!active) return;

        console.error("ERROR DETAIL TUGAS:", err);

        setError(
          err?.message || "Gagal mengambil detail tugas."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDetailTugas();

    return () => {
      active = false;
    };
  }, [tugasId]);

  const kelasMapel = tugas?.kelasMapel ?? {};
  const kelas = kelasMapel?.kelas ?? tugas?.kelas ?? {};

  const mapel =
    kelasMapel?.mataPelajaran ??
    kelasMapel?.mapel ??
    tugas?.mataPelajaran ??
    tugas?.mapel ??
    {};

  const guru = getDataGuru(tugas);
  const guruNama = getNamaGuru(tugas);

  const kelasNama =
    kelas?.nama ??
    kelas?.namaKelas ??
    kelas?.nama_kelas ??
    "-";

  const mapelNama =
    mapel?.nama ??
    mapel?.namaMapel ??
    mapel?.namaMataPelajaran ??
    "-";

  const daftarPengumpulan =
    tugas?.pengumpulanTugasSiswa ??
    tugas?.pengumpulan ??
    tugas?.pengumpulanTugas ??
    [];

  const jumlahPengumpulan =
    tugas?._count?.pengumpulanTugasSiswa ??
    tugas?._count?.pengumpulan ??
    tugas?.jumlahPengumpulan ??
    (Array.isArray(daftarPengumpulan)
      ? daftarPengumpulan.length
      : 0);

  const status = tugas ? getStatusTugas(tugas) : null;

  const StatusIcon = status
    ? statusIcon[status] || ClipboardList
    : ClipboardList;

  const namaUntukHeader = guruNama || "Guru";

  const emailGuru =
    guru?.email ??
    guru?.user?.email ??
    guru?.pengguna?.email ??
    "guru@smartschool.com";

  const avatarGuru = guruNama
    ? guruNama
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "GU";

  function renderLayout(content) {
    return (
      <div className="theme-page flex h-screen min-h-0 overflow-hidden">
        <Sidebar
          active="tugas"
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() =>
            setSidebarOpen((prev) => !prev)
          }
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="shrink-0">
            <Header
              toggleSidebar={() =>
                setSidebarOpen((prev) => !prev)
              }
              user={{
                name: namaUntukHeader,
                email: emailGuru,
                avatar: avatarGuru,
              }}
            />
          </div>

          {content}
        </div>
      </div>
    );
  }

  if (loading) {
    return renderLayout(
      <main className="flex min-w-0 flex-1 items-center justify-center p-4">
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
    );
  }

  if (error) {
    return renderLayout(
      <main className="flex min-w-0 flex-1 items-center justify-center p-4">
        <div
          className={`theme-card w-full max-w-md rounded-2xl border ${themeDangerBorder} p-6 text-center ${themeCardShadow}`}
        >
          <div
            className={`theme-danger mx-auto flex h-12 w-12 items-center justify-center rounded-full ${themeDangerSurface}`}
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
            onClick={() => router.push("/guru/tugas")}
            className={`mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} transition hover:opacity-90`}
          >
            <ArrowLeft size={16} />
            Kembali ke Tugas
          </button>
        </div>
      </main>
    );
  }

  if (!tugas) {
    return renderLayout(
      <main className="flex min-w-0 flex-1 items-center justify-center p-4">
        <div className="text-center">
          <div
            className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${themeNeutralSurface}`}
          >
            <ClipboardList className="theme-text-muted h-7 w-7" />
          </div>

          <p className="theme-text-secondary text-sm">
            Data tugas tidak ditemukan.
          </p>

          <button
            type="button"
            onClick={() => router.push("/guru/tugas")}
            className={`mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--color-card)] ${themePrimaryGradient} transition hover:opacity-90`}
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
        </div>
      </main>
    );
  }

  return renderLayout(
    <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
      <div className="w-full p-4 sm:p-5 lg:p-6 xl:p-8">
        <button
          type="button"
          onClick={() => router.push("/guru/tugas")}
          className="theme-text-secondary mb-5 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--color-primary)]"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>

        <section
          className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
        >
          <div className="p-5 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
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

                    <span>{kelasNama}</span>
                  </div>
                </div>
              </div>

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

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3">
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

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
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
                  {tugas.deskripsi || "Tidak ada deskripsi tugas."}
                </p>
              </div>
            </div>
          </section>

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
              <div
                className={`flex items-start gap-3 border-b ${themeDivider} px-5 py-4`}
              >
                <Users
                  size={17}
                  className="theme-text-muted mt-0.5 shrink-0"
                />

                <div className="min-w-0">
                  <p className="theme-text-muted text-xs">Kelas</p>
                  <p className="theme-text mt-1 break-words text-sm font-medium">
                    {kelasNama}
                  </p>
                </div>
              </div>

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
                    {formatTanggal(tugas.batasWaktu)}
                  </p>
                </div>
              </div>

              <div
                className={`flex items-start gap-3 border-b ${themeDivider} px-5 py-4`}
              >
                <Clock
                  size={17}
                  className="theme-text-muted mt-0.5 shrink-0"
                />

                <div className="min-w-0">
                  <p className="theme-text-muted text-xs">Waktu</p>
                  <p className="theme-text mt-1 break-words text-sm font-medium">
                    {tugas.batasWaktu
                      ? `${formatJam(tugas.batasWaktu)} WIB`
                      : "Tidak ada batas waktu"}
                  </p>
                </div>
              </div>

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
                    {guruNama || "Nama guru belum tersedia"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section
          className={`theme-card mt-5 rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow} sm:p-6`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="theme-text text-sm font-semibold">
                Kelola Tugas
              </h2>

              <p className="theme-text-secondary mt-1 text-xs">
                Ubah informasi tugas atau lihat hasil pengumpulan siswa.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  router.push(`/guru/tugas/${tugas.id}/edit`)
                }
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} transition hover:opacity-90`}
              >
                <Pencil size={16} />
                Edit Tugas
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(`/guru/tugas/${tugas.id}/nilai`)
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
  );
}
