"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "../../../../../components/Sidebar";
import Header from "../../../../../components/Header";

import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Clock3,
  CalendarDays,
  Settings2,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  getUjianById,
  updateUjian,
} from "../../../../../../services/ujian.service";

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

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

/* =========================================================
   HELPER
========================================================= */

function parseObjectResponse(response) {
  if (!response) return null;

  if (
    response?.data?.data !== undefined
  ) {
    return response.data.data;
  }

  if (
    response?.data !== undefined
  ) {
    return response.data;
  }

  return response;
}

function formatDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  const hours = String(
    date.getHours()
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/* =========================================================
   PAGE
========================================================= */

export default function EditUjianPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  /* =======================================================
     STATE
  ======================================================= */

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  ] = useState(false);

  const [ujian, setUjian] =
    useState(null);

  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    jenis: "pilihan_ganda",
    durasi: 60,
    waktuMulai: "",
    waktuSelesai: "",
    nilaiKelulusan: 75,
    dipublikasikan: false,
    modeUjian: "online",
    penilaianOtomatis: true,
  });

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadUjian = useCallback(
    async () => {
      if (!id) {
        setError(
          "ID ujian tidak ditemukan."
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await getUjianById(id);

        const data =
          parseObjectResponse(
            response
          );

        if (!data?.id) {
          throw new Error(
            "Data ujian tidak ditemukan."
          );
        }

        setUjian(data);

        setForm({
          judul:
            data.judul || "",

          deskripsi:
            data.deskripsi || "",

          jenis:
            data.jenis ||
            "pilihan_ganda",

          durasi:
            data.durasi ?? 60,

          waktuMulai:
            formatDateTimeLocal(
              data.waktuMulai
            ),

          waktuSelesai:
            formatDateTimeLocal(
              data.waktuSelesai
            ),

          nilaiKelulusan:
            data.nilaiKelulusan ??
            75,

          dipublikasikan:
            Boolean(
              data.dipublikasikan
            ),

          modeUjian:
            data.modeUjian ||
            "online",

          penilaianOtomatis:
            data.penilaianOtomatis !==
            false,
        });
      } catch (err) {
        console.error(
          "GET DETAIL UJIAN ERROR:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil data ujian."
        );
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadUjian();
  }, [loadUjian]);

  /* =======================================================
     HANDLE FORM
  ======================================================= */

  function handleChange(e) {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
    setSuccess("");
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(e) {
    e.preventDefault();

    if (!id) {
      setError(
        "ID ujian tidak ditemukan."
      );
      return;
    }

    if (!form.judul.trim()) {
      setError(
        "Judul ujian wajib diisi."
      );
      return;
    }

    if (
      !form.durasi ||
      Number(form.durasi) <= 0
    ) {
      setError(
        "Durasi ujian harus lebih dari 0 menit."
      );
      return;
    }

    if (
      form.nilaiKelulusan === "" ||
      Number(form.nilaiKelulusan) < 0 ||
      Number(form.nilaiKelulusan) > 100
    ) {
      setError(
        "Nilai kelulusan harus antara 0 sampai 100."
      );
      return;
    }

    if (
      form.waktuMulai &&
      form.waktuSelesai
    ) {
      const mulai = new Date(
        form.waktuMulai
      );

      const selesai = new Date(
        form.waktuSelesai
      );

      if (
        selesai.getTime() <=
        mulai.getTime()
      ) {
        setError(
          "Waktu selesai harus setelah waktu mulai."
        );
        return;
      }
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        judul:
          form.judul.trim(),

        deskripsi:
          form.deskripsi.trim() ||
          null,

        jenis: form.jenis,

        durasi: Number(
          form.durasi
        ),

        waktuMulai:
          form.waktuMulai
            ? new Date(
                form.waktuMulai
              ).toISOString()
            : null,

        waktuSelesai:
          form.waktuSelesai
            ? new Date(
                form.waktuSelesai
              ).toISOString()
            : null,

        nilaiKelulusan:
          Number(
            form.nilaiKelulusan
          ),

        dipublikasikan:
          Boolean(
            form.dipublikasikan
          ),

        modeUjian:
          form.modeUjian,

        penilaianOtomatis:
          Boolean(
            form.penilaianOtomatis
          ),
      };

      await updateUjian(
        id,
        payload
      );

      setSuccess(
        "Ujian berhasil diperbarui."
      );

      setTimeout(() => {
        router.push(
          "/guru/ujian"
        );
      }, 800);
    } catch (err) {
      console.error(
        "UPDATE UJIAN ERROR:",
        err
      );

      setError(
        err?.message ||
          "Gagal memperbarui ujian."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="theme-page flex min-h-screen">
        <Sidebar
          role="guru"
          active="ujian"
          collapsed={
            isSidebarCollapsed
          }
          setCollapsed={
            setIsSidebarCollapsed
          }
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            toggleSidebar={() =>
              setIsSidebarCollapsed(
                (prev) => !prev
              )
            }
            notifications={[]}
            user={{
              name: "Guru",
              email:
                "guru@smartschool.com",
              avatar: "G",
            }}
          />

          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <Loader2
                size={32}
                className={`mx-auto animate-spin ${themePrimaryText}`}
              />

              <p className="theme-text-secondary mt-3 text-sm font-semibold">
                Memuat data ujian...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="theme-page flex min-h-screen">
      {/* SIDEBAR */}

      <Sidebar
        role="guru"
        active="ujian"
        collapsed={
          isSidebarCollapsed
        }
        setCollapsed={
          setIsSidebarCollapsed
        }
      />

      {/* CONTENT */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() =>
            setIsSidebarCollapsed(
              (prev) => !prev
            )
          }
          notifications={[]}
          user={{
            name: "Guru",
            email:
              "guru@smartschool.com",
            avatar: "G",
          }}
        />

        <main className="theme-page flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-6">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/guru/ujian"
                  )
                }
                className={`theme-text-secondary mb-5 flex items-center gap-2 text-sm font-medium transition hover:text-[var(--color-primary)]`}
              >
                <ArrowLeft size={17} />
                Kembali ke Ujian
              </button>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                    >
                      <BookOpen size={21} />
                    </div>

                    <div>
                      <h1 className="theme-text text-xl font-bold sm:text-2xl">
                        Edit Ujian
                      </h1>

                      <p className="theme-text-secondary mt-1 text-sm">
                        Perbarui informasi dan pengaturan ujian.
                      </p>
                    </div>
                  </div>
                </div>

                {ujian && (
                  <div className="flex items-center gap-2">
                    {form.dipublikasikan ? (
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`}
                      >
                        <Eye size={14} />
                        Dipublikasikan
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`}
                      >
                        <EyeOff size={14} />
                        Draft
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* =================================================
                ALERT
            ================================================= */}

            {error && (
              <div
                className={`mb-5 flex items-start gap-3 rounded-xl border ${themeDangerBorder} ${themeDangerSurface} p-4`}
              >
                <AlertCircle
                  size={19}
                  className="theme-danger mt-0.5 shrink-0"
                />

                <div>
                  <p className="theme-danger text-sm font-bold">
                    Terjadi Kesalahan
                  </p>

                  <p className="theme-danger mt-1 text-sm">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {success && (
              <div
                className={`mb-5 flex items-start gap-3 rounded-xl border ${themeSuccessBorder} ${themeSuccessSurface} p-4`}
              >
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-[var(--color-success)]"
                />

                <div>
                  <p className="text-sm font-bold text-[var(--color-success)]">
                    Berhasil
                  </p>

                  <p className="mt-1 text-sm text-[var(--color-success)]">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleSubmit}>

              {/* =================================================
                  INFORMASI DASAR
              ================================================= */}

              <section
                className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`border-b ${themeDivider} px-5 py-5 sm:px-6`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                    >
                      <BookOpen size={19} />
                    </div>

                    <div>
                      <h2 className="theme-text text-sm font-bold">
                        Informasi Dasar
                      </h2>

                      <p className="theme-text-muted text-xs">
                        Informasi utama ujian
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:p-6">

                  {/* JUDUL */}

                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      Judul Ujian
                      <span className="theme-danger ml-1">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="judul"
                      value={form.judul}
                      onChange={handleChange}
                      placeholder="Contoh: Ujian Tengah Semester Fisika"
                      className={`theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                    />
                  </div>

                  {/* DESKRIPSI */}

                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      Deskripsi
                    </label>

                    <textarea
                      name="deskripsi"
                      value={form.deskripsi}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tuliskan petunjuk atau deskripsi ujian..."
                      className={`theme-input w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                    />
                  </div>

                  {/* GRID */}

                  <div className="grid gap-5 sm:grid-cols-2">

                    <div>
                      <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                        Jenis Ujian
                      </label>

                      <select
                        name="jenis"
                        value={form.jenis}
                        onChange={handleChange}
                        className={`theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none ${themeFocus}`}
                      >
                        <option value="pilihan_ganda">
                          Pilihan Ganda
                        </option>

                        <option value="essay">
                          Essay
                        </option>

                        <option value="campuran">
                          Campuran
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                        Mode Ujian
                      </label>

                      <select
                        name="modeUjian"
                        value={form.modeUjian}
                        onChange={handleChange}
                        className={`theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none ${themeFocus}`}
                      >
                        <option value="online">
                          Online
                        </option>

                        <option value="offline">
                          Offline
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  WAKTU & NILAI
              ================================================= */}

              <section
                className={`theme-card mt-5 overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`border-b ${themeDivider} px-5 py-5 sm:px-6`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${themeWarningSurface} text-[var(--color-warning)]`}
                    >
                      <Clock3 size={19} />
                    </div>

                    <div>
                      <h2 className="theme-text text-sm font-bold">
                        Waktu & Penilaian
                      </h2>

                      <p className="theme-text-muted text-xs">
                        Atur waktu dan nilai kelulusan
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">

                  {/* DURASI */}

                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      Durasi
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        name="durasi"
                        value={form.durasi}
                        onChange={handleChange}
                        className={`theme-input w-full rounded-xl border px-4 py-3 pr-16 text-sm outline-none ${themeFocus}`}
                      />

                      <span className="theme-text-muted absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium">
                        menit
                      </span>
                    </div>
                  </div>

                  {/* NILAI */}

                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      Nilai Kelulusan
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        name="nilaiKelulusan"
                        value={
                          form.nilaiKelulusan
                        }
                        onChange={handleChange}
                        className={`theme-input w-full rounded-xl border px-4 py-3 pr-10 text-sm outline-none ${themeFocus}`}
                      />

                      <span className="theme-text-muted absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium">
                        %
                      </span>
                    </div>
                  </div>

                  {/* MULAI */}

                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      Waktu Mulai
                    </label>

                    <input
                      type="datetime-local"
                      name="waktuMulai"
                      value={
                        form.waktuMulai
                      }
                      onChange={handleChange}
                      className={`theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none ${themeFocus}`}
                    />
                  </div>

                  {/* SELESAI */}

                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      Waktu Selesai
                    </label>

                    <input
                      type="datetime-local"
                      name="waktuSelesai"
                      value={
                        form.waktuSelesai
                      }
                      onChange={handleChange}
                      className={`theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none ${themeFocus}`}
                    />
                  </div>
                </div>
              </section>

              {/* =================================================
                  PENGATURAN
              ================================================= */}

              <section
                className={`theme-card mt-5 overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`border-b ${themeDivider} px-5 py-5 sm:px-6`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                    >
                      <Settings2 size={19} />
                    </div>

                    <div>
                      <h2 className="theme-text text-sm font-bold">
                        Pengaturan
                      </h2>

                      <p className="theme-text-muted text-xs">
                        Konfigurasi tambahan ujian
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5 sm:p-6">

                  {/* AUTO GRADING */}

                  <label
                    className={`theme-card flex cursor-pointer items-start gap-4 rounded-xl border ${themeNeutralBorder} p-4 transition ${themeNeutralHover} hover:border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)]`}
                  >
                    <input
                      type="checkbox"
                      name="penilaianOtomatis"
                      checked={
                        form.penilaianOtomatis
                      }
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
                    />

                    <div>
                      <p className="theme-text text-sm font-bold">
                        Penilaian otomatis
                      </p>

                      <p className="theme-text-muted mt-1 text-xs leading-5">
                        Sistem akan menghitung
                        nilai soal yang dapat
                        dinilai secara otomatis.
                      </p>
                    </div>
                  </label>

                  {/* PUBLISH */}

                  <label
                    className={`theme-card flex cursor-pointer items-start gap-4 rounded-xl border ${themeNeutralBorder} p-4 transition ${themeNeutralHover} hover:border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)]`}
                  >
                    <input
                      type="checkbox"
                      name="dipublikasikan"
                      checked={
                        form.dipublikasikan
                      }
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
                    />

                    <div>
                      <p className="theme-text text-sm font-bold">
                        Publikasikan ujian
                      </p>

                      <p className="theme-text-muted mt-1 text-xs leading-5">
                        Jika aktif, ujian dapat
                        ditampilkan kepada siswa
                        sesuai jadwal yang ditentukan.
                      </p>
                    </div>
                  </label>
                </div>
              </section>

              {/* =================================================
                  INFO
              ================================================= */}

              <div
                className={`mt-5 rounded-xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
              >
                <div className="flex gap-3">
                  <CalendarDays
                    size={18}
                    className={`mt-0.5 shrink-0 ${themePrimaryText}`}
                  />

                  <div>
                    <p
                      className={`text-sm font-bold ${themePrimaryText}`}
                    >
                      Perhatian
                    </p>

                    <p
                      className={`mt-1 text-xs leading-5 ${themePrimaryText}`}
                    >
                      Perubahan informasi ujian
                      tidak mengubah soal yang
                      sudah dibuat. Untuk mengubah
                      soal, gunakan menu kelola soal
                      pada halaman ujian.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  BUTTON
              ================================================= */}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    router.push(
                      "/guru/ujian"
                    )
                  }
                  className={`theme-card ${themeNeutralBorder} theme-text-secondary w-full rounded-xl border px-5 py-3 text-sm font-semibold transition ${themeNeutralHover} hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto`}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className={`${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto`}
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
            </form>

            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="theme-text-muted py-8 text-center text-xs">
              © 2026 SmartSchool • Guru Ujian
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}