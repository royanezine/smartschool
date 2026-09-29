"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Clock3,
  CalendarDays,
  Award,
  Settings2,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  getUjianById,
  updateUjian,
} from "../../../../../services/ujian.service";

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

  function handleChange(
    e
  ) {
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

  async function handleSubmit(
    e
  ) {
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
      <div className="flex min-h-screen bg-slate-50">
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
                className="mx-auto animate-spin text-indigo-600"
              />

              <p className="mt-3 text-sm font-semibold text-slate-700">
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
    <div className="flex min-h-screen bg-slate-50">
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

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">

            {/* HEADER */}

            <div className="mb-6">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/guru/ujian"
                  )
                }
                className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
              >
                <ArrowLeft
                  size={17}
                />
                Kembali ke Ujian
              </button>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <BookOpen
                        size={21}
                      />
                    </div>

                    <div>
                      <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
                        Edit Ujian
                      </h1>

                      <p className="mt-1 text-sm text-slate-500">
                        Perbarui informasi dan pengaturan ujian.
                      </p>
                    </div>
                  </div>
                </div>

                {ujian && (
                  <div className="flex items-center gap-2">
                    {form.dipublikasikan ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        <Eye
                          size={14}
                        />
                        Dipublikasikan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                        <EyeOff
                          size={14}
                        />
                        Draft
                      </span>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* ALERT */}

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="text-sm font-bold text-red-700">
                    Terjadi Kesalahan
                  </p>

                  <p className="mt-1 text-sm text-red-600">
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
                  <p className="text-sm font-bold text-emerald-700">
                    Berhasil
                  </p>

                  <p className="mt-1 text-sm text-emerald-600">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
            >

              {/* INFORMASI DASAR */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <BookOpen
                        size={19}
                      />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-slate-800">
                        Informasi Dasar
                      </h2>

                      <p className="text-xs text-slate-400">
                        Informasi utama ujian
                      </p>
                    </div>

                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:p-6">

                  {/* JUDUL */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Judul Ujian
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="judul"
                      value={
                        form.judul
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Contoh: Ujian Tengah Semester Fisika"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    />
                  </div>

                  {/* DESKRIPSI */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Deskripsi
                    </label>

                    <textarea
                      name="deskripsi"
                      value={
                        form.deskripsi
                      }
                      onChange={
                        handleChange
                      }
                      rows={4}
                      placeholder="Tuliskan petunjuk atau deskripsi ujian..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    />
                  </div>

                  {/* GRID */}

                  <div className="grid gap-5 sm:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Jenis Ujian
                      </label>

                      <select
                        name="jenis"
                        value={
                          form.jenis
                        }
                        onChange={
                          handleChange
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
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
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Mode Ujian
                      </label>

                      <select
                        name="modeUjian"
                        value={
                          form.modeUjian
                        }
                        onChange={
                          handleChange
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
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

              {/* WAKTU & NILAI */}

              <section className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Clock3
                        size={19}
                      />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-slate-800">
                        Waktu & Penilaian
                      </h2>

                      <p className="text-xs text-slate-400">
                        Atur waktu dan nilai kelulusan
                      </p>
                    </div>

                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">

                  {/* DURASI */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Durasi
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        name="durasi"
                        value={
                          form.durasi
                        }
                        onChange={
                          handleChange
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-16 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                        menit
                      </span>
                    </div>
                  </div>

                  {/* NILAI */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                        onChange={
                          handleChange
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-10 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                        %
                      </span>
                    </div>
                  </div>

                  {/* MULAI */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Waktu Mulai
                    </label>

                    <input
                      type="datetime-local"
                      name="waktuMulai"
                      value={
                        form.waktuMulai
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    />
                  </div>

                  {/* SELESAI */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Waktu Selesai
                    </label>

                    <input
                      type="datetime-local"
                      name="waktuSelesai"
                      value={
                        form.waktuSelesai
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    />
                  </div>

                </div>
              </section>

              {/* PENGATURAN */}

              <section className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <Settings2
                        size={19}
                      />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-slate-800">
                        Pengaturan
                      </h2>

                      <p className="text-xs text-slate-400">
                        Konfigurasi tambahan ujian
                      </p>
                    </div>

                  </div>
                </div>

                <div className="space-y-4 p-5 sm:p-6">

                  {/* AUTO GRADING */}

                  <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/30">

                    <input
                      type="checkbox"
                      name="penilaianOtomatis"
                      checked={
                        form.penilaianOtomatis
                      }
                      onChange={
                        handleChange
                      }
                      className="mt-1 h-4 w-4 accent-indigo-600"
                    />

                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        Penilaian otomatis
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Sistem akan menghitung
                        nilai soal yang dapat
                        dinilai secara otomatis.
                      </p>
                    </div>

                  </label>

                  {/* PUBLISH */}

                  <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/30">

                    <input
                      type="checkbox"
                      name="dipublikasikan"
                      checked={
                        form.dipublikasikan
                      }
                      onChange={
                        handleChange
                      }
                      className="mt-1 h-4 w-4 accent-indigo-600"
                    />

                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        Publikasikan ujian
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Jika aktif, ujian dapat
                        ditampilkan kepada siswa
                        sesuai jadwal yang ditentukan.
                      </p>
                    </div>

                  </label>

                </div>
              </section>

              {/* INFO */}

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex gap-3">

                  <CalendarDays
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div>
                    <p className="text-sm font-bold text-blue-800">
                      Perhatian
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      Perubahan informasi ujian
                      tidak mengubah soal yang
                      sudah dibuat. Untuk mengubah
                      soal, gunakan menu kelola soal
                      pada halaman ujian.
                    </p>
                  </div>

                </div>
              </div>

              {/* BUTTON */}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  disabled={
                    saving
                  }
                  onClick={() =>
                    router.push(
                      "/guru/ujian"
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                      <Save
                        size={17}
                      />
                      Simpan Perubahan
                    </>
                  )}
                </button>

              </div>

            </form>

            <footer className="py-8 text-center text-xs text-slate-400">
              © 2026 SmartSchool •
              Guru Ujian
            </footer>

          </div>
        </main>
      </div>
    </div>
  );
}