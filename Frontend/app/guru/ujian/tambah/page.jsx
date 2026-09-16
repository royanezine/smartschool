"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Save,
  ClipboardList,
  AlertCircle,
  BookOpen,
  Loader2,
  CheckCircle2,
  Clock3,
  Monitor,
  FileText,
  ShieldCheck,
  CalendarDays,
  Users,
  GraduationCap,
  Info,
  CircleCheck,
} from "lucide-react";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import { getKelasMapel } from "../../../../services/kelasMapel.service";
import { createUjian } from "../../../../services/ujian.service";

/* =========================================================
   HELPER
========================================================= */

function parseData(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
}

function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem("user");

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error("Gagal membaca user:", error);
    return null;
  }
}

function getCurrentUserId() {
  const user = getCurrentUser();

  return (
    user?.id ||
    user?.userId ||
    user?.penggunaId ||
    null
  );
}

function formatDateTime(value) {
  if (!value) {
    return "Belum ditentukan";
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Format tidak valid";
    }

    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return "Belum ditentukan";
  }
}

function getDurationLabel(value) {
  const duration = Number(value);

  if (!Number.isFinite(duration) || duration <= 0) {
    return "-";
  }

  if (duration < 60) {
    return `${duration} menit`;
  }

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  if (minutes === 0) {
    return `${hours} jam`;
  }

  return `${hours} jam ${minutes} menit`;
}

/* =========================================================
   PAGE
========================================================= */

export default function TambahUjianPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [kelasMapel, setKelasMapel] = useState([]);

  const [loadingKelasMapel, setLoadingKelasMapel] =
    useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    kelasMapelId: "",
    judul: "",
    deskripsi: "",
    jenis: "Kuis",
    durasi: 60,
    waktuMulai: "",
    waktuSelesai: "",
    nilaiKelulusan: 75,
    modeUjian: "standard",
    dipublikasikan: false,
    penilaianOtomatis: true,
  });

  /* =========================================================
     LOAD KELAS MAPEL
  ========================================================= */

  useEffect(() => {
    loadKelasMapel();
  }, []);

  async function loadKelasMapel() {
    try {
      setLoadingKelasMapel(true);
      setError("");

      const response = await getKelasMapel();

      console.log(
        "========== GET KELAS MAPEL =========="
      );

      console.log("Response:", response);

      const data = parseData(response);

      console.log("Data:", data);

      const userId = getCurrentUserId();

      console.log("Current User ID:", userId);

      const filtered = userId
        ? data.filter((item) => {
            const guruId =
              item?.guruPengajarId ||
              item?.guruPengajar?.id ||
              "";

            return (
              String(guruId) ===
              String(userId)
            );
          })
        : [];

      console.log(
        "Kelas Mapel Guru:",
        filtered
      );

      setKelasMapel(filtered);

      if (filtered.length > 0) {
        setForm((prev) => ({
          ...prev,
          kelasMapelId: String(
            filtered[0].id
          ),
        }));
      }
    } catch (err) {
      console.error(
        "GAGAL GET KELAS MAPEL:",
        err
      );

      setKelasMapel([]);

      setError(
        err?.message ||
          "Gagal mengambil data kelas dan mata pelajaran."
      );
    } finally {
      setLoadingKelasMapel(false);
    }
  }

  /* =========================================================
     SELECTED KELAS MAPEL
  ========================================================= */

  const selectedKelasMapel = useMemo(() => {
    return kelasMapel.find(
      (item) =>
        String(item?.id) ===
        String(form.kelasMapelId)
    );
  }, [
    kelasMapel,
    form.kelasMapelId,
  ]);

  const selectedKelasName =
    selectedKelasMapel?.kelas?.nama ||
    "Belum dipilih";

  const selectedMapelName =
    selectedKelasMapel?.mataPelajaran?.nama ||
    "Belum dipilih";

  const selectedGuruName =
    selectedKelasMapel?.guruPengajar
      ?.namaLengkap ||
    "Guru";

  /* =========================================================
     HANDLE CHANGE
  ========================================================= */

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setError("");
    setSuccess("");

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  /* =========================================================
     VALIDASI
  ========================================================= */

  function validateForm() {
    if (!form.kelasMapelId) {
      return "Kelas dan mata pelajaran wajib dipilih.";
    }

    const judul = form.judul.trim();

    if (!judul) {
      return "Judul ujian wajib diisi.";
    }

    if (judul.length < 3) {
      return "Judul ujian minimal 3 karakter.";
    }

    if (judul.length > 100) {
      return "Judul ujian maksimal 100 karakter.";
    }

    if (!form.jenis) {
      return "Jenis ujian wajib dipilih.";
    }

    const durasi = Number(form.durasi);

    if (!Number.isFinite(durasi)) {
      return "Durasi ujian harus berupa angka.";
    }

    if (durasi < 5) {
      return "Durasi ujian minimal 5 menit.";
    }

    let waktuMulai = null;
    let waktuSelesai = null;

    if (form.waktuMulai) {
      const mulai = new Date(
        form.waktuMulai
      );

      if (Number.isNaN(mulai.getTime())) {
        return "Format waktu mulai tidak valid.";
      }

      waktuMulai = mulai;
    }

    if (form.waktuSelesai) {
      const selesai = new Date(
        form.waktuSelesai
      );

      if (
        Number.isNaN(
          selesai.getTime()
        )
      ) {
        return "Format waktu selesai tidak valid.";
      }

      waktuSelesai = selesai;
    }

    if (
      waktuMulai &&
      waktuSelesai &&
      waktuMulai >= waktuSelesai
    ) {
      return "Waktu selesai harus lebih besar dari waktu mulai.";
    }

    if (
      form.nilaiKelulusan !== "" &&
      form.nilaiKelulusan !== null &&
      form.nilaiKelulusan !== undefined
    ) {
      const nilai = Number(
        form.nilaiKelulusan
      );

      if (!Number.isFinite(nilai)) {
        return "Nilai kelulusan harus berupa angka.";
      }

      if (nilai < 0 || nilai > 100) {
        return "Nilai kelulusan harus berada antara 0 sampai 100.";
      }
    }

    return null;
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const durasi = Number(form.durasi);

    let waktuMulai = null;
    let waktuSelesai = null;

    if (form.waktuMulai) {
      waktuMulai = new Date(
        form.waktuMulai
      ).toISOString();
    }

    if (form.waktuSelesai) {
      waktuSelesai = new Date(
        form.waktuSelesai
      ).toISOString();
    }

    let nilaiKelulusan = null;

    if (
      form.nilaiKelulusan !== "" &&
      form.nilaiKelulusan !== null &&
      form.nilaiKelulusan !== undefined
    ) {
      nilaiKelulusan = Number(
        form.nilaiKelulusan
      );
    }

    const payload = {
      kelasMapelId:
        form.kelasMapelId,

      judul:
        form.judul.trim(),

      deskripsi:
        form.deskripsi.trim() || null,

      jenis:
        form.jenis,

      durasi,

      waktuMulai,

      waktuSelesai,

      nilaiKelulusan,

      modeUjian:
        form.modeUjian || "standard",

      dipublikasikan:
        Boolean(
          form.dipublikasikan
        ),

      penilaianOtomatis:
        Boolean(
          form.penilaianOtomatis
        ),
    };

    console.log(
      "========== CREATE UJIAN =========="
    );

    console.log(
      "Payload:",
      payload
    );

    try {
      setSaving(true);

      const response =
        await createUjian(
          payload
        );

      console.log(
        "CREATE UJIAN SUCCESS:",
        response
      );

      setSuccess(
        "Ujian berhasil dibuat. Mengalihkan ke daftar ujian..."
      );

      setTimeout(() => {
        router.push(
          "/guru/ujian"
        );
      }, 700);
    } catch (err) {
      console.error(
        "GAGAL CREATE UJIAN:",
        err
      );

      setError(
        err?.message ||
          "Gagal membuat ujian."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        active="ujian"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="guru"
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() =>
            setIsCollapsed(
              (prev) => !prev
            )
          }
          notifications={[]}
          user={{
            name: "Guru",
            email:
              "guru@smartschool.com",
            avatar: "GR",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1400px] px-3 py-5 sm:px-5 sm:py-6 lg:px-7 lg:py-8">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/guru/ujian"
                    )
                  }
                  disabled={saving}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Kembali"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <ClipboardList
                        size={19}
                      />
                    </div>

                    <h1 className="truncate text-xl font-bold text-slate-800 sm:text-2xl lg:text-3xl">
                      Tambah Ujian
                    </h1>
                  </div>

                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                    Buat dan atur ujian baru
                    untuk kelas dan mata
                    pelajaran yang kamu ajar.
                  </p>
                </div>
              </div>

              {/* STATUS MINI */}
              <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex">
                <div
                  className={`h-2 w-2 rounded-full ${
                    saving
                      ? "bg-amber-400"
                      : "bg-blue-500"
                  }`}
                />

                <span className="text-xs font-semibold text-slate-600">
                  {saving
                    ? "Menyimpan..."
                    : "Mode penyusunan"}
                </span>
              </div>
            </div>

            {/* =================================================
                ALERT
            ================================================= */}

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-rose-600"
                />

                <div className="min-w-0">
                  <p className="text-sm font-bold text-rose-800">
                    Terjadi masalah
                  </p>

                  <p className="mt-1 break-words text-sm leading-5 text-rose-700">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-bold text-emerald-800">
                    Berhasil
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                MAIN GRID
            ================================================= */}

            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">

              {/* =================================================
                  LEFT — FORM
              ================================================= */}

              <div className="min-w-0">
                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="space-y-5"
                >

                  {/* =================================================
                      INFORMASI DASAR
                  ================================================= */}

                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <FileText
                            size={19}
                          />
                        </div>

                        <div>
                          <h2 className="text-base font-bold text-slate-800 sm:text-lg">
                            Informasi Ujian
                          </h2>

                          <p className="mt-0.5 text-xs leading-5 text-slate-500 sm:text-sm">
                            Lengkapi informasi dasar
                            ujian.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5 p-4 sm:p-6 md:grid-cols-2">

                      {/* KELAS MAPEL */}

                      <div className="md:col-span-2">
                        <label
                          htmlFor="kelasMapelId"
                          className="mb-2 block text-sm font-semibold text-slate-800"
                        >
                          Kelas & Mata Pelajaran
                          <span className="ml-1 text-rose-500">
                            *
                          </span>
                        </label>

                        <div className="relative">
                          <BookOpen
                            size={17}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <select
                            id="kelasMapelId"
                            name="kelasMapelId"
                            value={
                              form.kelasMapelId
                            }
                            onChange={
                              handleChange
                            }
                            disabled={
                              loadingKelasMapel ||
                              saving
                            }
                            required
                            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                          >
                            <option value="">
                              {loadingKelasMapel
                                ? "Memuat kelas dan mata pelajaran..."
                                : kelasMapel.length ===
                                  0
                                ? "Tidak ada penugasan"
                                : "Pilih kelas & mata pelajaran"}
                            </option>

                            {kelasMapel.map(
                              (item) => (
                                <option
                                  key={
                                    item.id
                                  }
                                  value={
                                    item.id
                                  }
                                >
                                  {item?.kelas
                                    ?.nama ||
                                    "Kelas tidak diketahui"}{" "}
                                  —{" "}
                                  {item
                                    ?.mataPelajaran
                                    ?.nama ||
                                    "Mata pelajaran tidak diketahui"}
                                </option>
                              )
                            )}
                          </select>

                          {loadingKelasMapel && (
                            <Loader2
                              size={17}
                              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-500"
                            />
                          )}
                        </div>

                        {!loadingKelasMapel &&
                          kelasMapel.length ===
                            0 && (
                            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                              <div className="flex items-start gap-3">
                                <AlertCircle
                                  size={18}
                                  className="mt-0.5 shrink-0 text-amber-600"
                                />

                                <div>
                                  <p className="text-sm font-bold text-amber-800">
                                    Penugasan belum
                                    tersedia
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-amber-700">
                                    Akun guru ini belum
                                    memiliki kelas dan
                                    mata pelajaran yang
                                    dapat digunakan untuk
                                    membuat ujian.
                                  </p>

                                  <button
                                    type="button"
                                    onClick={
                                      loadKelasMapel
                                    }
                                    disabled={
                                      loadingKelasMapel
                                    }
                                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-amber-800 ring-1 ring-amber-200 transition hover:bg-amber-100 disabled:opacity-50"
                                  >
                                    <RefreshIcon />

                                    Muat ulang
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                        {selectedKelasMapel && (
                          <div className="mt-3 rounded-xl bg-slate-50 p-3">
                            <p className="mb-2 text-xs font-medium text-slate-500">
                              Penugasan yang dipilih
                            </p>

                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                <CheckCircle2
                                  size={13}
                                />

                                {selectedKelasName}
                              </span>

                              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                                <CheckCircle2
                                  size={13}
                                />

                                {selectedMapelName}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* JUDUL */}

                      <div className="md:col-span-2">
                        <label
                          htmlFor="judul"
                          className="mb-2 block text-sm font-semibold text-slate-800"
                        >
                          Judul Ujian
                          <span className="ml-1 text-rose-500">
                            *
                          </span>
                        </label>

                        <input
                          id="judul"
                          name="judul"
                          type="text"
                          value={
                            form.judul
                          }
                          onChange={
                            handleChange
                          }
                          required
                          minLength={3}
                          maxLength={100}
                          disabled={saving}
                          placeholder="Contoh: UTS Matematika Kelas X"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                        />

                        <div className="mt-1.5 flex items-center justify-between gap-3">
                          <p className="text-xs text-slate-400">
                            Minimal 3 dan maksimal
                            100 karakter.
                          </p>

                          <span className="text-xs font-medium text-slate-400">
                            {form.judul.length}/100
                          </span>
                        </div>
                      </div>

                      {/* DESKRIPSI */}

                      <div className="md:col-span-2">
                        <label
                          htmlFor="deskripsi"
                          className="mb-2 block text-sm font-semibold text-slate-800"
                        >
                          Deskripsi
                        </label>

                        <textarea
                          id="deskripsi"
                          name="deskripsi"
                          value={
                            form.deskripsi
                          }
                          onChange={
                            handleChange
                          }
                          rows={4}
                          disabled={saving}
                          placeholder="Tuliskan petunjuk atau informasi tambahan untuk siswa..."
                          className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                        />
                      </div>

                      {/* JENIS */}

                      <div>
                        <label
                          htmlFor="jenis"
                          className="mb-2 block text-sm font-semibold text-slate-800"
                        >
                          Jenis Ujian
                          <span className="ml-1 text-rose-500">
                            *
                          </span>
                        </label>

                        <select
                          id="jenis"
                          name="jenis"
                          value={
                            form.jenis
                          }
                          onChange={
                            handleChange
                          }
                          disabled={saving}
                          required
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                        >
                          <option value="UTS">
                            UTS
                          </option>

                          <option value="UAS">
                            UAS
                          </option>

                          <option value="Kuis">
                            Kuis
                          </option>

                          <option value="Harian">
                            Harian
                          </option>

                          <option value="Lainnya">
                            Lainnya
                          </option>
                        </select>
                      </div>

                      {/* DURASI */}

                      <div>
                        <label
                          htmlFor="durasi"
                          className="mb-2 block text-sm font-semibold text-slate-800"
                        >
                          Durasi Ujian
                          <span className="ml-1 text-rose-500">
                            *
                          </span>
                        </label>

                        <div className="relative">
                          <Clock3
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            id="durasi"
                            name="durasi"
                            type="number"
                            min="5"
                            step="1"
                            value={
                              form.durasi
                            }
                            onChange={
                              handleChange
                            }
                            disabled={saving}
                            required
                            className="w-full rounded-xl border border-slate-200 px-10 py-3 pr-16 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                          />

                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                            menit
                          </span>
                        </div>
                      </div>

                      {/* NILAI */}

                      <div>
                        <label
                          htmlFor="nilaiKelulusan"
                          className="mb-2 block text-sm font-semibold text-slate-800"
                        >
                          Nilai Kelulusan
                        </label>

                        <input
                          id="nilaiKelulusan"
                          name="nilaiKelulusan"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={
                            form.nilaiKelulusan
                          }
                          onChange={
                            handleChange
                          }
                          disabled={saving}
                          placeholder="75"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                        />

                        <p className="mt-1.5 text-xs text-slate-400">
                          Nilai antara 0 sampai
                          100.
                        </p>
                      </div>

                      {/* MODE */}

                      <div>
                        <label
                          htmlFor="modeUjian"
                          className="mb-2 block text-sm font-semibold text-slate-800"
                        >
                          Mode Ujian
                        </label>

                        <div className="relative">
                          <Monitor
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <select
                            id="modeUjian"
                            name="modeUjian"
                            value={
                              form.modeUjian
                            }
                            onChange={
                              handleChange
                            }
                            disabled={saving}
                            className="w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                          >
                            <option value="standard">
                              Standard
                            </option>

                            <option value="online">
                              Online
                            </option>

                            <option value="offline">
                              Offline
                            </option>
                          </select>
                        </div>
                      </div>

                      {/* WAKTU MULAI */}

                      <div>
                        <label
                          htmlFor="waktuMulai"
                          className="mb-2 block text-sm font-semibold text-slate-800"
                        >
                          Waktu Mulai
                        </label>

                        <input
                          id="waktuMulai"
                          name="waktuMulai"
                          type="datetime-local"
                          value={
                            form.waktuMulai
                          }
                          onChange={
                            handleChange
                          }
                          disabled={saving}
                          className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                        />

                        <p className="mt-1.5 text-xs text-slate-400">
                          Kosongkan jika tanpa
                          jadwal mulai.
                        </p>
                      </div>

                      {/* WAKTU SELESAI */}

                      <div>
                        <label
                          htmlFor="waktuSelesai"
                          className="mb-2 block text-sm font-semibold text-slate-800"
                        >
                          Waktu Selesai
                        </label>

                        <input
                          id="waktuSelesai"
                          name="waktuSelesai"
                          type="datetime-local"
                          value={
                            form.waktuSelesai
                          }
                          onChange={
                            handleChange
                          }
                          disabled={saving}
                          className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                        />

                        <p className="mt-1.5 text-xs text-slate-400">
                          Harus lebih besar dari
                          waktu mulai.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* =================================================
                      PENGATURAN
                  ================================================= */}

                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <ShieldCheck
                            size={19}
                          />
                        </div>

                        <div>
                          <h2 className="text-base font-bold text-slate-800 sm:text-lg">
                            Pengaturan Ujian
                          </h2>

                          <p className="mt-0.5 text-xs leading-5 text-slate-500 sm:text-sm">
                            Tentukan status publikasi
                            dan metode penilaian.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 sm:p-6">

                      {/* PUBLIKASI */}

                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30">
                        <input
                          type="checkbox"
                          name="dipublikasikan"
                          checked={
                            form.dipublikasikan
                          }
                          onChange={
                            handleChange
                          }
                          disabled={saving}
                          className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">
                            Publikasikan ujian
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Jika aktif, ujian akan
                            berstatus dipublikasikan
                            setelah berhasil dibuat.
                          </p>
                        </div>
                      </label>

                      {/* PENILAIAN */}

                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30">
                        <input
                          type="checkbox"
                          name="penilaianOtomatis"
                          checked={
                            form.penilaianOtomatis
                          }
                          onChange={
                            handleChange
                          }
                          disabled={saving}
                          className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">
                            Penilaian otomatis
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Membantu sistem menilai
                            soal pilihan ganda secara
                            otomatis.
                          </p>
                        </div>
                      </label>
                    </div>
                  </section>

                  {/* =================================================
                      ACTION
                  ================================================= */}

                  <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/guru/ujian"
                        )
                      }
                      disabled={saving}
                      className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={
                        saving ||
                        loadingKelasMapel ||
                        kelasMapel.length === 0
                      }
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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

                          Simpan Ujian
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* =================================================
                  RIGHT — SIDEBAR SUMMARY
              ================================================= */}

              <aside className="min-w-0 space-y-4 xl:sticky xl:top-5">

                {/* =================================================
                    PREVIEW CARD
                ================================================= */}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-5">
                    <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />

                    <div className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl" />

                    <div className="relative">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/10">
                          <ClipboardList
                            size={19}
                          />
                        </div>

                        <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/80 ring-1 ring-white/10">
                          {form.jenis || "Ujian"}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-blue-200">
                        Preview Ujian
                      </p>

                      <h2 className="mt-1.5 break-words text-lg font-bold leading-7 text-white">
                        {form.judul.trim() ||
                          "Judul ujian belum diisi"}
                      </h2>

                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-blue-100/70">
                        {form.deskripsi.trim() ||
                          "Deskripsi ujian akan ditampilkan di bagian ini."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 p-5">

                    {/* KELAS */}

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <GraduationCap
                          size={17}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Kelas
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                          {selectedKelasName}
                        </p>
                      </div>
                    </div>

                    {/* MAPEL */}

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <BookOpen
                          size={17}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Mata Pelajaran
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                          {selectedMapelName}
                        </p>
                      </div>
                    </div>

                    {/* GURU */}

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <Users
                          size={17}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Pengajar
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                          {selectedGuruName}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* =================================================
                    DETAIL CARD
                ================================================= */}

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Info size={17} />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Ringkasan Pengaturan
                      </h3>

                      <p className="text-xs text-slate-500">
                        Detail yang sudah kamu tentukan
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">

                    {/* DURASI */}

                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock3 size={15} />

                        <span className="text-xs">
                          Durasi
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-slate-800">
                        {getDurationLabel(
                          form.durasi
                        )}
                      </span>
                    </div>

                    {/* NILAI */}

                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <CheckCircle2
                          size={15}
                        />

                        <span className="text-xs">
                          Nilai kelulusan
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-slate-800">
                        {form.nilaiKelulusan ===
                        ""
                          ? "-"
                          : `${form.nilaiKelulusan}`}
                      </span>
                    </div>

                    {/* MODE */}

                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Monitor size={15} />

                        <span className="text-xs">
                          Mode
                        </span>
                      </div>

                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold capitalize text-slate-700">
                        {form.modeUjian}
                      </span>
                    </div>

                    {/* STATUS */}

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <ShieldCheck
                          size={15}
                        />

                        <span className="text-xs">
                          Publikasi
                        </span>
                      </div>

                      <span
                        className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                          form.dipublikasikan
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {form.dipublikasikan
                          ? "Dipublikasikan"
                          : "Draft"}
                      </span>
                    </div>
                  </div>
                </section>

                {/* =================================================
                    JADWAL CARD
                ================================================= */}

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <CalendarDays
                        size={17}
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Jadwal Ujian
                      </h3>

                      <p className="text-xs text-slate-500">
                        Waktu pelaksanaan
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-medium text-slate-400">
                        Waktu mulai
                      </p>

                      <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-700">
                        {formatDateTime(
                          form.waktuMulai
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-medium text-slate-400">
                        Waktu selesai
                      </p>

                      <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-700">
                        {formatDateTime(
                          form.waktuSelesai
                        )}
                      </p>
                    </div>
                  </div>
                </section>

                {/* =================================================
                    CHECKLIST CARD
                ================================================= */}

                <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                      <CircleCheck
                        size={17}
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Sebelum menyimpan
                      </h3>

                      <div className="mt-3 space-y-2.5">
                        <ChecklistItem
                          active={
                            Boolean(
                              form.kelasMapelId
                            )
                          }
                          text="Kelas dan mata pelajaran dipilih"
                        />

                        <ChecklistItem
                          active={
                            form.judul.trim()
                              .length >= 3
                          }
                          text="Judul ujian sudah diisi"
                        />

                        <ChecklistItem
                          active={
                            Number(
                              form.durasi
                            ) >= 5
                          }
                          text="Durasi ujian valid"
                        />

                        <ChecklistItem
                          active={
                            Boolean(
                              form.penilaianOtomatis
                            )
                          }
                          text="Penilaian otomatis aktif"
                        />
                      </div>
                    </div>
                  </div>
                </section>

              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   CHECKLIST ITEM
========================================================= */

function ChecklistItem({
  active,
  text,
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
          active
            ? "bg-blue-600 text-white"
            : "border border-slate-300 bg-white"
        }`}
      >
        {active && (
          <CheckCircle2
            size={11}
          />
        )}
      </div>

      <span
        className={`text-xs ${
          active
            ? "font-medium text-slate-700"
            : "text-slate-400"
        }`}
      >
        {text}
      </span>
    </div>
  );
}

/* =========================================================
   SMALL ICON
========================================================= */

function RefreshIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
    </svg>
  );
}