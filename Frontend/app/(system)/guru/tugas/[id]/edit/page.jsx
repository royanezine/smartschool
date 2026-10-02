"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  getDetailTugas,
  updateTugas,
} from "../../../../../services/tugas.service";

import {
  ClipboardList,
  ArrowLeft,
  Save,
  AlertCircle,
  CalendarDays,
  Users,
  BookOpen,
  Clock,
  CheckCircle2,
  Loader2,
  Pencil,
  FileText,
  GraduationCap,
  Timer,
  Info,
  UserCheck,
} from "lucide-react";

/* =========================================================
   THEME HELPERS
========================================================= */

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

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

/* =========================================================
   STATUS THEME
========================================================= */

const deadlineStatusClasses = {
  danger: `${themeDangerSurface} theme-danger ${themeDangerBorder}`,
  warning: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
  success: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
  normal: `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`,
};

/* =========================================================
   HELPERS
========================================================= */

function formatTanggalInput(date) {
  if (!date) return "";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
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

function getJumlahPengumpulan(data) {
  const value =
    data?.jumlahPengumpulan ??
    data?.jumlah_pengumpulan ??
    data?.jumlahDikumpulkan ??
    data?.jumlah_dikumpulkan ??
    data?.totalPengumpulan ??
    data?.total_pengumpulan ??
    data?.pengumpulan ??
    data?.submissionCount ??
    data?.submission_count ??
    data?._count?.pengumpulan ??
    data?._count?.submissions ??
    0;

  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function getTotalSiswa(data) {
  const value =
    data?.totalSiswa ??
    data?.total_siswa ??
    data?.jumlahSiswa ??
    data?.jumlah_siswa ??
    data?.kelasMapel?.kelas?.jumlahSiswa ??
    data?.kelasMapel?.kelas?.jumlah_siswa ??
    data?.kelasMapel?.kelas?._count?.anggota ??
    data?.kelasMapel?.kelas?._count?.siswa ??
    data?._count?.siswa ??
    0;

  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function getProgress(data) {
  const submitted = getJumlahPengumpulan(data);
  const total = getTotalSiswa(data);

  if (!total) return 0;

  return Math.min(100, Math.round((submitted / total) * 100));
}

function getDeadlineStatus(date) {
  if (!date) {
    return {
      label: "Belum ditentukan",
      type: "normal",
    };
  }

  const deadline = new Date(date);

  if (isNaN(deadline.getTime())) {
    return {
      label: "Tidak valid",
      type: "danger",
    };
  }

  const now = new Date();

  if (deadline < now) {
    return {
      label: "Sudah berakhir",
      type: "danger",
    };
  }

  const difference = deadline.getTime() - now.getTime();

  const days = difference / (1000 * 60 * 60 * 24);

  if (days <= 1) {
    return {
      label: "Berakhir hari ini",
      type: "warning",
    };
  }

  if (days <= 3) {
    return {
      label: "Segera berakhir",
      type: "warning",
    };
  }

  return {
    label: "Masih aktif",
    type: "success",
  };
}

/* =========================================================
   MAIN
========================================================= */

export default function EditTugasPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [tugas, setTugas] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    batasWaktu: "",
  });

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

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

  /* =======================================================
     LOAD DETAIL
  ======================================================= */

  useEffect(() => {
    if (!id) return;

    const loadTugas = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getDetailTugas(id);

        console.log("RESPONSE DETAIL TUGAS:", response);

        const data =
          response?.data?.data ??
          response?.data ??
          response;

        if (!data) {
          throw new Error("Data tugas tidak ditemukan");
        }

        setTugas(data);

        setForm({
          judul: data?.judul || "",
          deskripsi: data?.deskripsi || "",
          batasWaktu: formatTanggalInput(data?.batasWaktu),
        });
      } catch (err) {
        console.error("ERROR LOAD TUGAS:", err);

        setError(err?.message || "Gagal memuat data tugas");
      } finally {
        setLoading(false);
      }
    };

    loadTugas();
  }, [id]);

  /* =======================================================
     HANDLE CHANGE
  ======================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  /* =======================================================
     HANDLE SUBMIT
  ======================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.judul.trim()) {
      setError("Judul tugas wajib diisi.");
      return;
    }

    if (form.judul.trim().length < 3) {
      setError("Judul tugas minimal 3 karakter.");
      return;
    }

    if (!form.batasWaktu) {
      setError("Batas waktu wajib diisi.");
      return;
    }

    const deadline = new Date(form.batasWaktu);

    if (isNaN(deadline.getTime())) {
      setError("Format batas waktu tidak valid.");
      return;
    }

    try {
      setSaving(true);

      const batasWaktuISO = deadline.toISOString();

      const payload = {
        judul: form.judul.trim(),
        deskripsi: form.deskripsi.trim(),
        batasWaktu: batasWaktuISO,
      };

      console.log("PAYLOAD UPDATE TUGAS:", payload);

      await updateTugas(id, payload);

      setSuccess("Tugas berhasil diperbarui.");

      setTimeout(() => {
        router.push(`/guru/tugas/${id}`);
      }, 1000);
    } catch (err) {
      console.error("ERROR UPDATE TUGAS:", err);

      setError(err?.message || "Gagal menyimpan perubahan tugas.");
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DATA RELATION
  ======================================================= */

  const kelasNama =
    tugas?.kelasMapel?.kelas?.nama ||
    tugas?.kelas?.nama ||
    tugas?.namaKelas ||
    "-";

  const mapelNama =
    tugas?.kelasMapel?.mataPelajaran?.nama ||
    tugas?.mataPelajaran?.nama ||
    tugas?.mapel?.nama ||
    "-";

  const guruNama =
    tugas?.kelasMapel?.guruPengajar?.namaLengkap ||
    tugas?.guru?.namaLengkap ||
    "-";

  const jumlahPengumpulan = getJumlahPengumpulan(tugas);

  const totalSiswa = getTotalSiswa(tugas);

  const progress = getProgress(tugas);

  const deadlineStatus = getDeadlineStatus(tugas?.batasWaktu);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active="tugas"
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0">
            <Header
              toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              notifications={notifications}
              user={{
                name: "Guru",
                email: "guru@smartschool.com",
                avatar: "GU",
              }}
            />
          </div>

          <main className="theme-page flex min-h-0 flex-1 items-center justify-center p-4">
            <div className="text-center">
              <div
                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimarySoftBorder} border`}
              >
                <Loader2
                  className={`h-6 w-6 animate-spin ${themePrimaryText}`}
                />
              </div>

              <p className="theme-text-secondary mt-4 text-sm font-medium">
                Memuat data tugas...
              </p>

              <p className="theme-text-muted mt-1 text-xs">
                Mohon tunggu sebentar
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR LOAD
  ======================================================= */

  if (error && !tugas) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active="tugas"
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0">
            <Header
              toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              notifications={notifications}
              user={{
                name: "Guru",
                email: "guru@smartschool.com",
                avatar: "GU",
              }}
            />
          </div>

          <main className="theme-page flex flex-1 items-center justify-center overflow-y-auto p-4">
            <div
              className={`theme-card w-full max-w-md rounded-2xl border p-6 text-center ${themeDangerBorder} ${themeCardShadow}`}
            >
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border ${themeDangerSurface} ${themeDangerBorder}`}
              >
                <AlertCircle className="h-7 w-7 theme-danger" />
              </div>

              <h2 className="theme-text mt-5 text-lg font-semibold">
                Gagal Memuat Tugas
              </h2>

              <p className="theme-text-secondary mt-2 text-sm leading-6">
                {error}
              </p>

              <button
                type="button"
                onClick={() => router.push("/guru/tugas")}
                className={`mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--color-card)] transition ${themePrimaryGradient} ${themePrimaryShadow}`}
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

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* SIDEBAR */}

      <Sidebar
        active="tugas"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* CONTENT */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* HEADER */}

        <div className="shrink-0">
          <Header
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            notifications={notifications}
            user={{
              name: "Guru",
              email: "guru@smartschool.com",
              avatar: "GU",
            }}
          />
        </div>

        {/* MAIN */}

        <main className="theme-page min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {/* BACK */}

            <button
              type="button"
              onClick={() => router.push(`/guru/tugas/${id}`)}
              className="theme-text-secondary mb-5 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--color-primary)]"
            >
              <ArrowLeft size={16} />
              Kembali ke Detail Tugas
            </button>

            {/* TITLE */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                >
                  <Pencil size={20} />
                </div>

                <div className="min-w-0">
                  <h1 className="theme-text text-xl font-bold tracking-tight sm:text-2xl">
                    Edit Tugas
                  </h1>

                  <p className="theme-text-secondary mt-1 text-sm">
                    Perbarui informasi tugas dan batas waktu pengumpulan.
                  </p>
                </div>
              </div>

              <div
                className={`hidden items-center gap-2 rounded-xl border px-3 py-2 sm:flex ${themePrimarySoftBorder} ${themePrimarySoft}`}
              >
                <ClipboardList
                  size={15}
                  className={themePrimaryText}
                />

                <span className={`text-xs font-medium ${themePrimaryText}`}>
                  Mode Pengeditan
                </span>
              </div>
            </div>

            {/* TWO COLUMN LAYOUT */}

            <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              {/* =================================================
                  LEFT - FORM
              ================================================== */}

              <section
                className={`theme-card min-w-0 overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
              >
                {/* FORM HEADER */}

                <div
                  className={`border-b px-5 py-5 sm:px-6 ${themeDivider}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="theme-text text-sm font-bold sm:text-base">
                        Informasi Tugas
                      </h2>

                      <p className="theme-text-muted mt-1 text-xs">
                        Ubah data tugas sesuai kebutuhan.
                      </p>
                    </div>

                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${themeNeutralSurface} ${themeNeutralBorder}`}
                    >
                      <FileText
                        size={17}
                        className="theme-text-secondary"
                      />
                    </div>
                  </div>
                </div>

                {/* FORM */}

                <form onSubmit={handleSubmit}>
                  <div className="space-y-6 p-5 sm:p-6">
                    {/* ERROR */}

                    {error && (
                      <div
                        className={`flex items-start gap-3 rounded-xl border p-4 ${themeDangerSurface} ${themeDangerBorder}`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${theme-card} ${themeDangerBorder}`}
                        >
                          <AlertCircle
                            size={17}
                            className="theme-danger"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="theme-danger text-sm font-semibold">
                            Gagal menyimpan
                          </p>

                          <p className="theme-danger mt-1 break-words text-xs leading-5 opacity-80">
                            {error}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* SUCCESS */}

                    {success && (
                      <div
                        className={`flex items-start gap-3 rounded-xl border p-4 ${themeSuccessSurface} ${themeSuccessBorder}`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${themeSuccessBorder} ${theme-card}`}
                        >
                          <CheckCircle2
                            size={17}
                            className="text-[var(--color-success)]"
                          />
                        </div>

                        <div>
                          <p className="text-[var(--color-success)] text-sm font-semibold">
                            Berhasil
                          </p>

                          <p className="mt-1 text-xs text-[var(--color-success)] opacity-80">
                            {success}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* JUDUL */}

                    <div>
                      <label
                        htmlFor="judul"
                        className="theme-text-secondary mb-2 block text-sm font-semibold"
                      >
                        Judul Tugas
                        <span className="theme-danger ml-1">*</span>
                      </label>

                      <input
                        id="judul"
                        name="judul"
                        type="text"
                        value={form.judul}
                        onChange={handleChange}
                        disabled={saving}
                        placeholder="Contoh: Tugas Matriks"
                        className={`theme-input h-12 w-full rounded-xl px-4 text-sm outline-none transition ${themeFocus} placeholder:text-[var(--color-text-placeholder)] disabled:cursor-not-allowed disabled:opacity-60`}
                      />

                      <p className="theme-text-muted mt-1.5 text-xs">
                        Gunakan judul yang singkat dan mudah dipahami siswa.
                      </p>
                    </div>

                    {/* DESKRIPSI */}

                    <div>
                      <label
                        htmlFor="deskripsi"
                        className="theme-text-secondary mb-2 block text-sm font-semibold"
                      >
                        Deskripsi Tugas
                      </label>

                      <textarea
                        id="deskripsi"
                        name="deskripsi"
                        rows={7}
                        value={form.deskripsi}
                        onChange={handleChange}
                        disabled={saving}
                        placeholder="Tulis instruksi, materi, atau keterangan tugas..."
                        className={`theme-input w-full resize-y rounded-xl px-4 py-3 text-sm leading-6 outline-none transition ${themeFocus} placeholder:text-[var(--color-text-placeholder)] disabled:cursor-not-allowed disabled:opacity-60`}
                      />

                      <div className="mt-1.5 flex items-center justify-between gap-3">
                        <p className="theme-text-muted text-xs">
                          Deskripsi bersifat opsional.
                        </p>

                        <span className="theme-text-muted text-[11px]">
                          {form.deskripsi.length} karakter
                        </span>
                      </div>
                    </div>

                    {/* DEADLINE */}

                    <div>
                      <label
                        htmlFor="batasWaktu"
                        className="theme-text-secondary mb-2 flex items-center gap-2 text-sm font-semibold"
                      >
                        <Clock
                          size={15}
                          className={themePrimaryText}
                        />

                        Batas Waktu
                        <span className="theme-danger">*</span>
                      </label>

                      <input
                        id="batasWaktu"
                        name="batasWaktu"
                        type="datetime-local"
                        value={form.batasWaktu}
                        onChange={handleChange}
                        disabled={saving}
                        className={`theme-input h-12 w-full rounded-xl px-4 text-sm outline-none transition ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                      />

                      <p className="theme-text-muted mt-1.5 text-xs">
                        Siswa tidak dapat mengumpulkan tugas setelah melewati
                        batas waktu.
                      </p>
                    </div>

                    {/* INFO READ ONLY */}

                    <div
                      className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface}`}
                    >
                      <div
                        className={`border-b px-4 py-4 ${themeDivider}`}
                      >
                        <div className="flex items-center gap-2">
                          <Info
                            size={16}
                            className={themePrimaryText}
                          />

                          <p className="theme-text-secondary text-sm font-semibold">
                            Informasi Pembelajaran
                          </p>
                        </div>

                        <p className="theme-text-muted mt-1 text-xs leading-5">
                          Data kelas dan mata pelajaran mengikuti Kelas Mapel
                          yang sudah tersimpan.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2">
                        {/* KELAS */}

                        <div
                          className={`flex items-start gap-3 border-b p-4 sm:border-r ${themeDivider}`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${theme-card} ${themePrimarySoftBorder}`}
                          >
                            <Users
                              size={16}
                              className={themePrimaryText}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="theme-text-muted text-xs">
                              Kelas
                            </p>

                            <p className="theme-text mt-1 break-words text-sm font-semibold">
                              {kelasNama}
                            </p>
                          </div>
                        </div>

                        {/* MAPEL */}

                        <div
                          className={`flex items-start gap-3 border-b p-4 sm:border-b-0 ${themeDivider}`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${theme-card} ${themePrimarySoftBorder}`}
                          >
                            <BookOpen
                              size={16}
                              className={themePrimaryText}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="theme-text-muted text-xs">
                              Mata Pelajaran
                            </p>

                            <p className="theme-text mt-1 break-words text-sm font-semibold">
                              {mapelNama}
                            </p>
                          </div>
                        </div>

                        {/* GURU */}

                        <div
                          className={`flex items-start gap-3 p-4 sm:border-r ${themeDivider}`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${theme-card} ${themePrimarySoftBorder}`}
                          >
                            <GraduationCap
                              size={16}
                              className={themePrimaryText}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="theme-text-muted text-xs">
                              Guru Pengajar
                            </p>

                            <p className="theme-text mt-1 break-words text-sm font-semibold">
                              {guruNama}
                            </p>
                          </div>
                        </div>

                        {/* DEADLINE */}

                        <div
                          className={`flex items-start gap-3 border-t p-4 ${themeDivider}`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${theme-card} ${themePrimarySoftBorder}`}
                          >
                            <CalendarDays
                              size={16}
                              className={themePrimaryText}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="theme-text-muted text-xs">
                              Deadline Saat Ini
                            </p>

                            <p className="theme-text mt-1 text-sm font-semibold">
                              {formatTanggal(tugas?.batasWaktu)}
                            </p>

                            <p className="theme-text-muted mt-0.5 text-xs">
                              {formatJam(tugas?.batasWaktu)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FORM FOOTER */}

                  <div
                    className={`border-t px-5 py-4 sm:px-6 ${themeDivider} ${themeNeutralSurface}`}
                  >
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/guru/tugas/${id}`)
                        }
                        disabled={saving}
                        className={`theme-card theme-text-secondary inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition ${themeNeutralBorder} ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto`}
                      >
                        <ArrowLeft size={16} />
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-[var(--color-card)] transition ${themePrimaryGradient} ${themePrimaryShadow} disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto`}
                      >
                        {saving ? (
                          <>
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save size={17} />
                            Simpan Perubahan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </section>

              {/* =================================================
                  RIGHT - PREVIEW / SUMMARY
              ================================================== */}

              <aside className="space-y-5">
                {/* PREVIEW CARD */}

                <section
                  className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  <div className={`relative overflow-hidden p-5 ${themePrimaryGradient}`}>
                    <div
                      className="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full blur-3xl"
                      style={{
                        background:
                          "color-mix(in srgb, var(--color-card) 12%, transparent)",
                      }}
                    />

                    <div
                      className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full blur-3xl"
                      style={{
                        background:
                          "color-mix(in srgb, var(--color-info) 18%, transparent)",
                      }}
                    />

                    <div className="relative">
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl border text-[var(--color-card)]"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--color-card) 18%, transparent)",
                            background:
                              "color-mix(in srgb, var(--color-card) 12%, transparent)",
                          }}
                        >
                          <ClipboardList size={19} />
                        </div>

                        <span
                          className="rounded-full border px-2.5 py-1 text-[10px] font-semibold text-[var(--color-card)]"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--color-card) 18%, transparent)",
                            background:
                              "color-mix(in srgb, var(--color-card) 10%, transparent)",
                          }}
                        >
                          PREVIEW
                        </span>
                      </div>

                      <p
                        className="mt-5 text-[11px] font-medium uppercase tracking-wider"
                        style={{
                          color:
                            "color-mix(in srgb, var(--color-card) 68%, transparent)",
                        }}
                      >
                        Judul Tugas
                      </p>

                      <h3 className="mt-1 break-words text-lg font-bold leading-6 text-[var(--color-card)]">
                        {form.judul || "Judul tugas"}
                      </h3>

                      <p
                        className="mt-3 line-clamp-4 min-h-[80px] text-xs leading-5"
                        style={{
                          color:
                            "color-mix(in srgb, var(--color-card) 76%, transparent)",
                        }}
                      >
                        {form.deskripsi ||
                          "Deskripsi tugas akan tampil di sini setelah diisi."}
                      </p>
                    </div>
                  </div>

                  {/* PREVIEW META */}

                  <div>
                    {/* KELAS */}

                    <div
                      className={`flex items-center gap-3 border-b px-5 py-4 ${themeDivider}`}
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder}`}
                      >
                        <Users
                          size={16}
                          className={themePrimaryText}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="theme-text-muted text-[11px]">
                          Kelas
                        </p>

                        <p className="theme-text mt-0.5 truncate text-sm font-semibold">
                          {kelasNama}
                        </p>
                      </div>
                    </div>

                    {/* MAPEL */}

                    <div
                      className={`flex items-center gap-3 border-b px-5 py-4 ${themeDivider}`}
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder}`}
                      >
                        <BookOpen
                          size={16}
                          className={themePrimaryText}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="theme-text-muted text-[11px]">
                          Mata Pelajaran
                        </p>

                        <p className="theme-text mt-0.5 truncate text-sm font-semibold">
                          {mapelNama}
                        </p>
                      </div>
                    </div>

                    {/* DEADLINE */}

                    <div className="flex items-center gap-3 px-5 py-4">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder}`}
                      >
                        <CalendarDays
                          size={16}
                          className={themePrimaryText}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="theme-text-muted text-[11px]">
                          Batas Waktu
                        </p>

                        <p className="theme-text mt-0.5 text-sm font-semibold">
                          {form.batasWaktu
                            ? formatTanggal(form.batasWaktu)
                            : "-"}
                        </p>

                        <p className="theme-text-muted mt-0.5 text-xs">
                          {form.batasWaktu
                            ? formatJam(form.batasWaktu)
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* DEADLINE STATUS */}

                <section
                  className={`theme-card rounded-2xl border p-5 ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border ${themePrimarySoft} ${themePrimarySoftBorder}`}
                    >
                      <Timer
                        size={18}
                        className={themePrimaryText}
                      />
                    </div>

                    <div>
                      <p className="theme-text text-sm font-bold">
                        Status Deadline
                      </p>

                      <p className="theme-text-muted mt-0.5 text-xs">
                        Kondisi batas waktu saat ini
                      </p>
                    </div>
                  </div>

                  <div
                    className={`mt-4 rounded-xl border p-4 ${themeNeutralSurface} ${themeNeutralBorder}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="theme-text-secondary text-xs font-medium">
                        Status
                      </span>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                          deadlineStatusClasses[deadlineStatus.type]
                        }`}
                      >
                        {deadlineStatus.label}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <CalendarDays
                        size={14}
                        className="theme-text-muted"
                      />

                      <span className="theme-text-secondary text-xs">
                        {formatTanggal(tugas?.batasWaktu)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <Clock
                        size={14}
                        className="theme-text-muted"
                      />

                      <span className="theme-text-secondary text-xs">
                        {formatJam(tugas?.batasWaktu)}
                      </span>
                    </div>
                  </div>
                </section>

                {/* SUBMISSION SUMMARY */}

                <section
                  className={`theme-card rounded-2xl border p-5 ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border ${themeSuccessSurface} ${themeSuccessBorder}`}
                      >
                        <CheckCircle2
                          size={18}
                          className="text-[var(--color-success)]"
                        />
                      </div>

                      <div>
                        <p className="theme-text text-sm font-bold">
                          Pengumpulan
                        </p>

                        <p className="theme-text-muted mt-0.5 text-xs">
                          Progres siswa
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-lg font-bold ${themePrimaryText}`}
                    >
                      {progress}%
                    </span>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="theme-text-secondary">
                        Terkumpul
                      </span>

                      <span className="theme-text font-semibold">
                        {jumlahPengumpulan}
                        {totalSiswa > 0 ? ` / ${totalSiswa}` : ""}
                      </span>
                    </div>

                    <div
                      className={`mt-2 h-2 overflow-hidden rounded-full ${themeNeutralSurface}`}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${themePrimaryGradient}`}
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div
                      className={`rounded-xl border p-3 ${themeNeutralSurface} ${themeNeutralBorder}`}
                    >
                      <div className="theme-text-muted flex items-center gap-1.5">
                        <UserCheck size={13} />

                        <span className="text-[10px]">
                          Terkumpul
                        </span>
                      </div>

                      <p className="theme-text mt-1 text-base font-bold">
                        {jumlahPengumpulan}
                      </p>
                    </div>

                    <div
                      className={`rounded-xl border p-3 ${themeNeutralSurface} ${themeNeutralBorder}`}
                    >
                      <div className="theme-text-muted flex items-center gap-1.5">
                        <Users size={13} />

                        <span className="text-[10px]">
                          Total Siswa
                        </span>
                      </div>

                      <p className="theme-text mt-1 text-base font-bold">
                        {totalSiswa || "-"}
                      </p>
                    </div>
                  </div>
                </section>

                {/* INFO */}

                <div
                  className={`flex items-start gap-3 rounded-xl border p-4 ${themeInfoSurface} ${themeInfoBorder}`}
                >
                  <Info
                    size={16}
                    className="mt-0.5 shrink-0 text-[var(--color-info)]"
                  />

                  <p className="text-xs leading-5 text-[var(--color-info)]">
                    Kelas, mata pelajaran, dan guru pengajar tidak dapat diubah
                    dari halaman edit ini karena mengikuti data Kelas Mapel
                    yang sudah tersimpan.
                  </p>
                </div>
              </aside>
            </div>

            <div className="h-4" />
          </div>
        </main>
      </div>
    </div>
  );
}