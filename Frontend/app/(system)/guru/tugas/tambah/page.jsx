"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  BookOpen,
  Users,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  getKelasMapelGuru,
  createTugas,
} from "../../../../../services/tugas.service";

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

// ======================================================
// MAIN
// ======================================================

export default function TambahTugasPage() {
  const router = useRouter();

  const [kelasMapel, setKelasMapel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    kelasMapelId: "",
    judul: "",
    deskripsi: "",
    tanggal: "",
    waktu: "23:59",
  });

  // ======================================================
  // LOAD KELAS MAPEL
  // ======================================================

  useEffect(() => {
    loadKelasMapel();
  }, []);

  const loadKelasMapel = async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("user");
      let currentUser = null;

      try {
        currentUser = storedUser ? JSON.parse(storedUser) : null;
      } catch {
        currentUser = null;
      }

      console.log("USER LOGIN:", {
        userId: currentUser?.userId,
        email: currentUser?.email,
        role: currentUser?.role,
      });

      const currentUserId = currentUser?.userId;

      if (!currentUserId) {
        throw new Error(
          "Data pengguna tidak ditemukan. Silakan login kembali."
        );
      }

      const response = await getKelasMapelGuru();
      console.log("RESPONSE KELAS MAPEL:", response);

      const data = Array.isArray(response?.data)
        ? response.data
        : [];

      console.log("SEMUA KELAS MAPEL:", data);

      const kelasMapelGuru = data.filter((item) => {
        const guruId =
          item?.guruPengajarId ??
          item?.guruPengajar?.id ??
          null;

        return guruId === currentUserId;
      });

      console.log(
        "KELAS MAPEL GURU LOGIN:",
        kelasMapelGuru
      );

      setKelasMapel(kelasMapelGuru);
    } catch (err) {
      console.error(
        "Gagal mengambil kelas mapel:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil data kelas dan mata pelajaran."
      );

      setKelasMapel([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // HANDLE CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.kelasMapelId) {
      setError(
        "Silakan pilih kelas dan mata pelajaran."
      );
      return;
    }

    if (!form.judul.trim()) {
      setError("Judul tugas wajib diisi.");
      return;
    }

    if (form.judul.trim().length < 3) {
      setError(
        "Judul tugas minimal 3 karakter."
      );
      return;
    }

    if (!form.tanggal) {
      setError("Tanggal deadline wajib diisi.");
      return;
    }

    if (!form.waktu) {
      setError("Waktu deadline wajib diisi.");
      return;
    }

    const selected = kelasMapel.find(
      (item) => item.id === form.kelasMapelId
    );

    if (!selected) {
      setError(
        "Kelas dan mata pelajaran yang dipilih tidak valid."
      );
      return;
    }

    try {
      setSaving(true);

      const batasWaktu = new Date(
        `${form.tanggal}T${form.waktu}:00`
      ).toISOString();

      const payload = {
        kelasMapelId: form.kelasMapelId,
        judul: form.judul.trim(),
        deskripsi:
          form.deskripsi.trim() || null,
        batasWaktu,
      };

      const storedUser =
        localStorage.getItem("user");

      let currentUser = null;

      try {
        currentUser = storedUser
          ? JSON.parse(storedUser)
          : null;
      } catch {
        currentUser = null;
      }

      console.log(
        "========== DEBUG CREATE TUGAS =========="
      );

      console.log("USER LOGIN:", {
        userId: currentUser?.userId,
        email: currentUser?.email,
        role: currentUser?.role,
      });

      console.log("PAYLOAD:", payload);
      console.log(
        "KELAS MAPEL TERPILIH:",
        selected
      );

      console.log(
        "GURU PENGAJAR ID:",
        selected?.guruPengajarId ??
          selected?.guruPengajar?.id
      );

      console.log(
        "========================================"
      );

      await createTugas(payload);

      setSuccess("Tugas berhasil dibuat.");

      setTimeout(() => {
        router.push("/guru/tugas");
      }, 800);
    } catch (err) {
      console.error(
        "Gagal membuat tugas:",
        err
      );

      setError(
        err?.message ||
          "Gagal membuat tugas. Silakan coba lagi."
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // DATA TERPILIH
  // ======================================================

  const selectedKelasMapel =
    kelasMapel.find(
      (item) => item.id === form.kelasMapelId
    );

  const namaKelas =
    selectedKelasMapel?.kelas?.namaKelas ||
    selectedKelasMapel?.kelas?.nama ||
    "-";

  const namaMapel =
    selectedKelasMapel?.mataPelajaran?.nama ||
    selectedKelasMapel?.mataPelajaran?.namaMapel ||
    selectedKelasMapel?.mataPelajaran
      ?.nama_mata_pelajaran ||
    "-";

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="theme-page fixed inset-0 flex overflow-hidden">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <div className="h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* HEADER */}

        <div className="flex-shrink-0">
          <Header
            title="Tambah Tugas"
            userName="Guru"
            userEmail="guru@smartschool.com"
            userInitial="GU"
          />
        </div>

        {/* ==================================================
            SCROLLABLE CONTENT
        ================================================== */}

        <main className="theme-page flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

          <div className="mx-auto w-full max-w-5xl">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-6">

              <button
                type="button"
                onClick={() =>
                  router.push("/guru/tugas")
                }
                className="theme-text-secondary mb-3 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--color-primary)]"
              >
                <ArrowLeft size={18} />
                Kembali ke Tugas
              </button>

              <h1 className="theme-text text-2xl font-bold sm:text-3xl">
                Tambah Tugas
              </h1>

              <p className="theme-text-secondary mt-1 text-sm">
                Buat tugas baru untuk siswa.
              </p>
            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div
                className={`mb-5 flex items-start gap-3 rounded-xl border p-4 ${themeDangerSurface} ${themeDangerBorder} theme-danger`}
              >
                <div
                  className={`theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${themeDangerBorder}`}
                >
                  <AlertCircle
                    size={20}
                    className="theme-danger"
                  />
                </div>

                <div>
                  <p className="font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-1 text-sm opacity-80">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* ==================================================
                SUCCESS
            ================================================== */}

            {success && (
              <div
                className={`mb-5 flex items-start gap-3 rounded-xl border p-4 ${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`}
              >
                <div
                  className={`theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${themeSuccessBorder}`}
                >
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <p className="font-semibold">
                    Berhasil
                  </p>

                  <p className="mt-1 text-sm opacity-80">
                    {success}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* ==================================================
                    FORM
                ================================================== */}

                <div className="lg:col-span-2">

                  <div
                    className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
                  >

                    <div
                      className={`border-b px-5 py-5 sm:px-6 ${themeDivider}`}
                    >
                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
                        >
                          <FileText size={20} />
                        </div>

                        <div>
                          <h2 className="theme-text font-semibold">
                            Informasi Tugas
                          </h2>

                          <p className="theme-text-secondary text-sm">
                            Lengkapi informasi tugas.
                          </p>
                        </div>

                      </div>
                    </div>

                    <div className="space-y-6 p-5 sm:p-6">

                      {/* ==================================================
                          KELAS MAPEL
                      ================================================== */}

                      <div>

                        <label
                          htmlFor="kelasMapelId"
                          className="theme-text mb-2 block text-sm font-semibold"
                        >
                          Kelas & Mata Pelajaran

                          <span className="ml-1 theme-danger">
                            *
                          </span>
                        </label>

                        <div className="relative">

                          <BookOpen
                            size={18}
                            className="theme-text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                          />

                          <select
                            id="kelasMapelId"
                            name="kelasMapelId"
                            value={form.kelasMapelId}
                            onChange={handleChange}
                            disabled={
                              loading || saving
                            }
                            className={`theme-input w-full appearance-none rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${themeFocus}`}
                          >

                            <option value="">
                              {loading
                                ? "Memuat data..."
                                : "Pilih kelas dan mata pelajaran"}
                            </option>

                            {kelasMapel.map(
                              (item) => (
                                <option
                                  key={item.id}
                                  value={item.id}
                                >
                                  {item.kelas?.namaKelas ||
                                    item.kelas?.nama ||
                                    "Kelas"}{" "}
                                  -{" "}
                                  {item.mataPelajaran
                                    ?.nama ||
                                    item.mataPelajaran
                                      ?.namaMapel ||
                                    item
                                      .mataPelajaran
                                      ?.nama_mata_pelajaran ||
                                    "Mata Pelajaran"}
                                </option>
                              )
                            )}

                          </select>
                        </div>

                        {loading && (
                          <div className="theme-text-secondary mt-2 flex items-center gap-2 text-xs">
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                            Mengambil data...
                          </div>
                        )}

                        {!loading &&
                          kelasMapel.length === 0 && (
                            <p className="mt-2 text-xs text-[var(--color-warning)]">
                              Belum ada kelas dan mata
                              pelajaran yang kamu ampu.
                            </p>
                          )}
                      </div>

                      {/* ==================================================
                          JUDUL
                      ================================================== */}

                      <div>

                        <label
                          htmlFor="judul"
                          className="theme-text mb-2 block text-sm font-semibold"
                        >
                          Judul Tugas

                          <span className="ml-1 theme-danger">
                            *
                          </span>
                        </label>

                        <input
                          id="judul"
                          name="judul"
                          type="text"
                          value={form.judul}
                          onChange={handleChange}
                          disabled={saving}
                          maxLength={100}
                          placeholder="Contoh: Membuat Website Sederhana"
                          className={`theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60 placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                        />

                        <div className="mt-1 flex justify-end">
                          <span className="theme-text-muted text-xs">
                            {form.judul.length}/100
                          </span>
                        </div>

                      </div>

                      {/* ==================================================
                          DESKRIPSI
                      ================================================== */}

                      <div>

                        <label
                          htmlFor="deskripsi"
                          className="theme-text mb-2 block text-sm font-semibold"
                        >
                          Deskripsi Tugas
                        </label>

                        <textarea
                          id="deskripsi"
                          name="deskripsi"
                          value={form.deskripsi}
                          onChange={handleChange}
                          disabled={saving}
                          rows={6}
                          placeholder="Jelaskan tugas yang harus dikerjakan siswa..."
                          className={`theme-input w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60 placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                        />

                        <p className="theme-text-muted mt-2 text-xs">
                          Jelaskan instruksi tugas
                          dengan jelas.
                        </p>

                      </div>

                      {/* ==================================================
                          DEADLINE
                      ================================================== */}

                      <div>

                        <label className="theme-text mb-2 block text-sm font-semibold">
                          Deadline

                          <span className="ml-1 theme-danger">
                            *
                          </span>
                        </label>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                          {/* TANGGAL */}

                          <div>

                            <label
                              htmlFor="tanggal"
                              className="theme-text-secondary mb-2 block text-xs font-medium"
                            >
                              Tanggal
                            </label>

                            <div className="relative">

                              <Calendar
                                size={18}
                                className="theme-text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                              />

                              <input
                                id="tanggal"
                                name="tanggal"
                                type="date"
                                value={form.tanggal}
                                onChange={handleChange}
                                disabled={saving}
                                className={`theme-input w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${themeFocus}`}
                              />

                            </div>
                          </div>

                          {/* WAKTU */}

                          <div>

                            <label
                              htmlFor="waktu"
                              className="theme-text-secondary mb-2 block text-xs font-medium"
                            >
                              Waktu
                            </label>

                            <div className="relative">

                              <Clock
                                size={18}
                                className="theme-text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                              />

                              <input
                                id="waktu"
                                name="waktu"
                                type="time"
                                value={form.waktu}
                                onChange={handleChange}
                                disabled={saving}
                                className={`theme-input w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${themeFocus}`}
                              />

                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* ==================================================
                    RINGKASAN
                ================================================== */}

                <div className="lg:col-span-1">

                  <div className="space-y-5 lg:sticky lg:top-6">

                    {/* SUMMARY CARD */}

                    <div
                      className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
                    >

                      <div
                        className={`border-b px-5 py-4 ${themeDivider}`}
                      >
                        <h2 className="theme-text font-semibold">
                          Ringkasan
                        </h2>

                        <p className="theme-text-secondary mt-1 text-xs">
                          Preview tugas
                        </p>
                      </div>

                      <div className="space-y-5 p-5">

                        {/* KELAS */}

                        <div className="flex gap-3">

                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
                          >
                            <BookOpen size={17} />
                          </div>

                          <div className="min-w-0">

                            <p className="theme-text-muted text-xs">
                              Kelas
                            </p>

                            <p className="theme-text mt-1 text-sm font-semibold">
                              {namaKelas}
                            </p>

                            <p className="theme-text-secondary text-xs">
                              {namaMapel}
                            </p>

                          </div>
                        </div>

                        {/* JUDUL */}

                        <div className="flex gap-3">

                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${themeNeutralSurface} ${themeNeutralBorder} theme-text-secondary`}
                          >
                            <FileText size={17} />
                          </div>

                          <div className="min-w-0">

                            <p className="theme-text-muted text-xs">
                              Judul
                            </p>

                            <p className="theme-text mt-1 break-words text-sm font-semibold">
                              {form.judul ||
                                "Belum diisi"}
                            </p>

                          </div>
                        </div>

                        {/* DEADLINE */}

                        <div className="flex gap-3">

                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${themeWarningSurface} ${themeWarningBorder} text-[var(--color-warning)]`}
                          >
                            <Clock size={17} />
                          </div>

                          <div className="min-w-0">

                            <p className="theme-text-muted text-xs">
                              Deadline
                            </p>

                            <p className="theme-text mt-1 break-words text-sm font-semibold">
                              {form.tanggal
                                ? new Date(
                                    `${form.tanggal}T${form.waktu}`
                                  ).toLocaleString(
                                    "id-ID",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : "Belum diisi"}
                            </p>

                          </div>
                        </div>

                        {/* INFO SISWA */}

                        <div
                          className={`rounded-xl border p-4 ${themeInfoSurface} ${themeInfoBorder}`}
                        >

                          <div className="flex gap-3">

                            <Users
                              size={18}
                              className={`mt-0.5 shrink-0 ${themePrimaryText}`}
                            />

                            <div>

                              <p className="theme-text text-sm font-semibold">
                                Tugas untuk siswa
                              </p>

                              <p className="theme-text-secondary mt-1 text-xs leading-5">
                                Tugas akan diberikan
                                kepada siswa pada
                                kelas yang dipilih.
                              </p>

                            </div>
                          </div>

                        </div>
                      </div>
                    </div>

                    {/* ==================================================
                        BUTTON
                    ================================================== */}

                    <div
                      className={`theme-card rounded-2xl border p-4 ${themeNeutralBorder} ${themeCardShadow}`}
                    >

                      <div className="flex flex-col gap-3">

                        {/* SIMPAN */}

                        <button
                          type="submit"
                          disabled={
                            saving ||
                            loading ||
                            kelasMapel.length === 0
                          }
                          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[var(--color-card)] transition ${themePrimaryGradient} ${themePrimaryShadow} hover:brightness-95 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {saving ? (
                            <>
                              <Loader2
                                size={18}
                                className="animate-spin"
                              />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save size={18} />
                              Simpan Tugas
                            </>
                          )}
                        </button>

                        {/* BATAL */}

                        <button
                          type="button"
                          disabled={saving}
                          onClick={() =>
                            router.push(
                              "/guru/tugas"
                            )
                          }
                          className={`theme-card w-full rounded-xl border px-4 py-3 text-sm font-semibold theme-text-secondary transition ${themeNeutralBorder} ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          Batal
                        </button>

                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}