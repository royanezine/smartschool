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

  return Number.isFinite(number) && number >= 0
    ? number
    : 0;
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

  return Number.isFinite(number) && number >= 0
    ? number
    : 0;
}

function getProgress(data) {
  const submitted = getJumlahPengumpulan(data);
  const total = getTotalSiswa(data);

  if (!total) return 0;

  return Math.min(
    100,
    Math.round((submitted / total) * 100)
  );
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

  const difference =
    deadline.getTime() - now.getTime();

  const days =
    difference / (1000 * 60 * 60 * 24);

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

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

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

        const response =
          await getDetailTugas(id);

        console.log(
          "RESPONSE DETAIL TUGAS:",
          response
        );

        const data =
          response?.data?.data ??
          response?.data ??
          response;

        if (!data) {
          throw new Error(
            "Data tugas tidak ditemukan"
          );
        }

        setTugas(data);

        setForm({
          judul: data?.judul || "",
          deskripsi: data?.deskripsi || "",
          batasWaktu: formatTanggalInput(
            data?.batasWaktu
          ),
        });
      } catch (err) {
        console.error(
          "ERROR LOAD TUGAS:",
          err
        );

        setError(
          err?.message ||
            "Gagal memuat data tugas"
        );
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
      setError(
        "Judul tugas minimal 3 karakter."
      );
      return;
    }

    if (!form.batasWaktu) {
      setError(
        "Batas waktu wajib diisi."
      );
      return;
    }

    const deadline = new Date(
      form.batasWaktu
    );

    if (isNaN(deadline.getTime())) {
      setError(
        "Format batas waktu tidak valid."
      );
      return;
    }

    try {
      setSaving(true);

      const batasWaktuISO =
        deadline.toISOString();

      const payload = {
        judul: form.judul.trim(),
        deskripsi:
          form.deskripsi.trim(),
        batasWaktu: batasWaktuISO,
      };

      console.log(
        "PAYLOAD UPDATE TUGAS:",
        payload
      );

      await updateTugas(id, payload);

      setSuccess(
        "Tugas berhasil diperbarui."
      );

      setTimeout(() => {
        router.push(
          `/guru/tugas/${id}`
        );
      }, 1000);
    } catch (err) {
      console.error(
        "ERROR UPDATE TUGAS:",
        err
      );

      setError(
        err?.message ||
          "Gagal menyimpan perubahan tugas."
      );
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
    tugas?.kelasMapel?.guruPengajar
      ?.namaLengkap ||
    tugas?.guru?.namaLengkap ||
    "-";

  const jumlahPengumpulan =
    getJumlahPengumpulan(tugas);

  const totalSiswa =
    getTotalSiswa(tugas);

  const progress =
    getProgress(tugas);

  const deadlineStatus =
    getDeadlineStatus(
      tugas?.batasWaktu
    );

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-slate-50">
        <Sidebar
          active="tugas"
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0">
            <Header
              toggleSidebar={() =>
                setSidebarOpen(
                  !sidebarOpen
                )
              }
              notifications={notifications}
              user={{
                name: "Guru",
                email:
                  "guru@smartschool.com",
                avatar: "GU",
              }}
            />
          </div>

          <main className="flex min-h-0 flex-1 items-center justify-center p-4">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>

              <p className="mt-4 text-sm font-medium text-slate-600">
                Memuat data tugas...
              </p>

              <p className="mt-1 text-xs text-slate-400">
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
      <div className="flex h-screen w-full overflow-hidden bg-slate-50">
        <Sidebar
          active="tugas"
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0">
            <Header
              toggleSidebar={() =>
                setSidebarOpen(
                  !sidebarOpen
                )
              }
              notifications={notifications}
              user={{
                name: "Guru",
                email:
                  "guru@smartschool.com",
                avatar: "GU",
              }}
            />
          </div>

          <main className="flex flex-1 items-center justify-center overflow-y-auto p-4">
            <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
                <AlertCircle className="h-7 w-7 text-rose-500" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-slate-800">
                Gagal Memuat Tugas
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/guru/tugas"
                  )
                }
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
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
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar
        active="tugas"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(
            !sidebarOpen
          )
        }
      />

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* HEADER */}

        <div className="shrink-0">
          <Header
            toggleSidebar={() =>
              setSidebarOpen(
                !sidebarOpen
              )
            }
            notifications={notifications}
            user={{
              name: "Guru",
              email:
                "guru@smartschool.com",
              avatar: "GU",
            }}
          />
        </div>

        {/* MAIN */}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">

          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

            {/* =================================================
                BACK
            ================================================== */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/guru/tugas/${id}`
                )
              }
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Kembali ke Detail Tugas
            </button>

            {/* =================================================
                TITLE
            ================================================== */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Pencil size={20} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                    Edit Tugas
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Perbarui informasi tugas dan
                    batas waktu pengumpulan.
                  </p>
                </div>

              </div>

              <div className="hidden items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 sm:flex">
                <ClipboardList
                  size={15}
                  className="text-blue-500"
                />

                <span className="text-xs font-medium text-blue-600">
                  Mode Pengeditan
                </span>
              </div>

            </div>

            {/* =================================================
                TWO COLUMN LAYOUT
            ================================================== */}

            <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

              {/* =================================================
                  LEFT - FORM
              ================================================== */}

              <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

                {/* FORM HEADER */}

                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                  <div className="flex items-center justify-between gap-3">

                    <div>
                      <h2 className="text-sm font-bold text-slate-800 sm:text-base">
                        Informasi Tugas
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        Ubah data tugas sesuai kebutuhan.
                      </p>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                      <FileText size={17} />
                    </div>

                  </div>

                </div>

                {/* FORM */}

                <form onSubmit={handleSubmit}>

                  <div className="space-y-6 p-5 sm:p-6">

                    {/* ERROR */}

                    {error && (
                      <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-500">
                          <AlertCircle size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-rose-700">
                            Gagal menyimpan
                          </p>

                          <p className="mt-1 break-words text-xs leading-5 text-rose-600">
                            {error}
                          </p>
                        </div>

                      </div>
                    )}

                    {/* SUCCESS */}

                    {success && (
                      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                          <CheckCircle2 size={17} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-emerald-700">
                            Berhasil
                          </p>

                          <p className="mt-1 text-xs text-emerald-600">
                            {success}
                          </p>
                        </div>

                      </div>
                    )}

                    {/* JUDUL */}

                    <div>

                      <label
                        htmlFor="judul"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Judul Tugas
                        <span className="ml-1 text-rose-500">
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
                        placeholder="Contoh: Tugas Matriks"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <p className="mt-1.5 text-xs text-slate-400">
                        Gunakan judul yang singkat dan
                        mudah dipahami siswa.
                      </p>

                    </div>

                    {/* DESKRIPSI */}

                    <div>

                      <label
                        htmlFor="deskripsi"
                        className="mb-2 block text-sm font-semibold text-slate-700"
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
                        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <div className="mt-1.5 flex items-center justify-between gap-3">
                        <p className="text-xs text-slate-400">
                          Deskripsi bersifat opsional.
                        </p>

                        <span className="text-[11px] text-slate-400">
                          {form.deskripsi.length} karakter
                        </span>
                      </div>

                    </div>

                    {/* DEADLINE */}

                    <div>

                      <label
                        htmlFor="batasWaktu"
                        className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                      >
                        <Clock
                          size={15}
                          className="text-blue-500"
                        />

                        Batas Waktu
                        <span className="text-rose-500">
                          *
                        </span>
                      </label>

                      <input
                        id="batasWaktu"
                        name="batasWaktu"
                        type="datetime-local"
                        value={form.batasWaktu}
                        onChange={handleChange}
                        disabled={saving}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition hover:border-blue-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <p className="mt-1.5 text-xs text-slate-400">
                        Siswa tidak dapat mengumpulkan
                        tugas setelah melewati batas waktu.
                      </p>

                    </div>

                    {/* INFO READ ONLY */}

                    <div className="rounded-xl border border-slate-200 bg-slate-50">

                      <div className="border-b border-slate-200 px-4 py-4">

                        <div className="flex items-center gap-2">

                          <Info
                            size={16}
                            className="text-blue-500"
                          />

                          <p className="text-sm font-semibold text-slate-700">
                            Informasi Pembelajaran
                          </p>

                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          Data kelas dan mata pelajaran
                          mengikuti Kelas Mapel yang
                          sudah tersimpan.
                        </p>

                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2">

                        {/* KELAS */}

                        <div className="flex items-start gap-3 border-b border-slate-200 p-4 sm:border-r">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-500 shadow-sm">
                            <Users size={16} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs text-slate-400">
                              Kelas
                            </p>

                            <p className="mt-1 break-words text-sm font-semibold text-slate-700">
                              {kelasNama}
                            </p>
                          </div>
                        </div>

                        {/* MAPEL */}

                        <div className="flex items-start gap-3 border-b border-slate-200 p-4 sm:border-b-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-500 shadow-sm">
                            <BookOpen size={16} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs text-slate-400">
                              Mata Pelajaran
                            </p>

                            <p className="mt-1 break-words text-sm font-semibold text-slate-700">
                              {mapelNama}
                            </p>
                          </div>
                        </div>

                        {/* GURU */}

                        <div className="flex items-start gap-3 p-4 sm:border-r">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-500 shadow-sm">
                            <GraduationCap size={16} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs text-slate-400">
                              Guru Pengajar
                            </p>

                            <p className="mt-1 break-words text-sm font-semibold text-slate-700">
                              {guruNama}
                            </p>
                          </div>
                        </div>

                        {/* DEADLINE */}

                        <div className="flex items-start gap-3 border-t border-slate-200 p-4">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-500 shadow-sm">
                            <CalendarDays size={16} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs text-slate-400">
                              Deadline Saat Ini
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-700">
                              {formatTanggal(
                                tugas?.batasWaktu
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {formatJam(
                                tugas?.batasWaktu
                              )}
                            </p>
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>

                  {/* FORM FOOTER */}

                  <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/guru/tugas/${id}`
                          )
                        }
                        disabled={saving}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        <ArrowLeft size={16} />
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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

                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

                  <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#12357d] to-[#0c2458] p-5">

                    <div className="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full bg-blue-400/20 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />

                    <div className="relative">

                      <div className="flex items-center justify-between gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white backdrop-blur">
                          <ClipboardList size={19} />
                        </div>

                        <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-blue-100">
                          PREVIEW
                        </span>

                      </div>

                      <p className="mt-5 text-[11px] font-medium uppercase tracking-wider text-blue-200/70">
                        Judul Tugas
                      </p>

                      <h3 className="mt-1 break-words text-lg font-bold leading-6 text-white">
                        {form.judul ||
                          "Judul tugas"}
                      </h3>

                      <p className="mt-3 line-clamp-4 min-h-[80px] text-xs leading-5 text-blue-100/80">
                        {form.deskripsi ||
                          "Deskripsi tugas akan tampil di sini setelah diisi."}
                      </p>

                    </div>

                  </div>

                  {/* PREVIEW META */}

                  <div className="divide-y divide-slate-100">

                    <div className="flex items-center gap-3 px-5 py-4">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                        <Users size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-slate-400">
                          Kelas
                        </p>

                        <p className="mt-0.5 truncate text-sm font-semibold text-slate-700">
                          {kelasNama}
                        </p>
                      </div>

                    </div>

                    <div className="flex items-center gap-3 px-5 py-4">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                        <BookOpen size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-slate-400">
                          Mata Pelajaran
                        </p>

                        <p className="mt-0.5 truncate text-sm font-semibold text-slate-700">
                          {mapelNama}
                        </p>
                      </div>

                    </div>

                    <div className="flex items-center gap-3 px-5 py-4">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                        <CalendarDays size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-slate-400">
                          Batas Waktu
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-slate-700">
                          {form.batasWaktu
                            ? formatTanggal(
                                form.batasWaktu
                              )
                            : "-"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {form.batasWaktu
                            ? formatJam(
                                form.batasWaktu
                              )
                            : "-"}
                        </p>
                      </div>

                    </div>

                  </div>

                </section>

                {/* DEADLINE STATUS */}

                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                      <Timer size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Status Deadline
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Kondisi batas waktu saat ini
                      </p>
                    </div>

                  </div>

                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">

                    <div className="flex items-center justify-between gap-3">

                      <span className="text-xs font-medium text-slate-500">
                        Status
                      </span>

                      <span
                        className={`
                          rounded-full border px-2.5 py-1
                          text-[10px] font-semibold
                          ${
                            deadlineStatus.type ===
                            "danger"
                              ? "border-rose-200 bg-rose-50 text-rose-600"
                              : deadlineStatus.type ===
                                "warning"
                              ? "border-amber-200 bg-amber-50 text-amber-600"
                              : "border-emerald-200 bg-emerald-50 text-emerald-600"
                          }
                        `}
                      >
                        {deadlineStatus.label}
                      </span>

                    </div>

                    <div className="mt-4 flex items-center gap-2">

                      <CalendarDays
                        size={14}
                        className="text-slate-400"
                      />

                      <span className="text-xs text-slate-600">
                        {formatTanggal(
                          tugas?.batasWaktu
                        )}
                      </span>

                    </div>

                    <div className="mt-2 flex items-center gap-2">

                      <Clock
                        size={14}
                        className="text-slate-400"
                      />

                      <span className="text-xs text-slate-600">
                        {formatJam(
                          tugas?.batasWaktu
                        )}
                      </span>

                    </div>

                  </div>

                </section>

                {/* SUBMISSION SUMMARY */}

                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">

                  <div className="flex items-center justify-between gap-3">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                        <CheckCircle2 size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          Pengumpulan
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Progres siswa
                        </p>
                      </div>

                    </div>

                    <span className="text-lg font-bold text-blue-600">
                      {progress}%
                    </span>

                  </div>

                  <div className="mt-5">

                    <div className="flex items-center justify-between text-xs">

                      <span className="text-slate-500">
                        Terkumpul
                      </span>

                      <span className="font-semibold text-slate-700">
                        {jumlahPengumpulan}
                        {totalSiswa > 0
                          ? ` / ${totalSiswa}`
                          : ""}
                      </span>

                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                        }}
                      />

                    </div>

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">

                    <div className="rounded-xl bg-slate-50 p-3">

                      <div className="flex items-center gap-1.5 text-slate-400">
                        <UserCheck size={13} />

                        <span className="text-[10px]">
                          Terkumpul
                        </span>
                      </div>

                      <p className="mt-1 text-base font-bold text-slate-800">
                        {jumlahPengumpulan}
                      </p>

                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">

                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Users size={13} />

                        <span className="text-[10px]">
                          Total Siswa
                        </span>
                      </div>

                      <p className="mt-1 text-base font-bold text-slate-800">
                        {totalSiswa || "-"}
                      </p>

                    </div>

                  </div>

                </section>

                {/* INFO */}

                <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">

                  <Info
                    size={16}
                    className="mt-0.5 shrink-0 text-blue-500"
                  />

                  <p className="text-xs leading-5 text-blue-700">
                    Kelas, mata pelajaran, dan guru
                    pengajar tidak dapat diubah dari
                    halaman edit ini karena mengikuti
                    data Kelas Mapel yang sudah tersimpan.
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