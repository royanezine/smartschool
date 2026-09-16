"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import {
  CalendarDays,
  Plus,
  Save,
  X,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Info,
  Database,
  GraduationCap,
  Layers3,
} from "lucide-react";

import {
  createTahunAjaran,
} from "../../../../services/tahunAjaran.service";

export default function TambahTahunAjaranPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] = useState({
    nama: "",
    semester: "Ganjil",
    status: "tidak_aktif",
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    const nama = form.nama.trim();

    if (!nama) {
      setError(
        "Nama tahun ajaran wajib diisi."
      );

      return false;
    }

    const tahunRegex =
      /^\d{4}\/\d{4}$/;

    if (!tahunRegex.test(nama)) {
      setError(
        "Format tahun ajaran harus seperti 2026/2027."
      );

      return false;
    }

    const tahun = nama.split("/");

    const tahunAwal = Number(
      tahun[0]
    );

    const tahunAkhir = Number(
      tahun[1]
    );

    if (
      tahunAkhir !==
      tahunAwal + 1
    ) {
      setError(
        "Tahun ajaran harus memiliki jarak satu tahun, contoh 2026/2027."
      );

      return false;
    }

    if (
      !["Ganjil", "Genap"].includes(
        form.semester
      )
    ) {
      setError(
        "Semester harus Ganjil atau Genap."
      );

      return false;
    }

    if (
      ![
        "aktif",
        "tidak_aktif",
      ].includes(form.status)
    ) {
      setError(
        "Status tahun ajaran tidak valid."
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        nama: form.nama.trim(),
        semester: form.semester,
        status: form.status,
      };

      console.log(
        "CREATE TAHUN AJARAN:",
        payload
      );

      await createTahunAjaran(
        payload
      );

      setSuccess(
        "Tahun ajaran berhasil ditambahkan. Sekarang kamu dapat menghubungkan kelas melalui halaman detail tahun ajaran."
      );

      setTimeout(() => {
        router.push(
          "/admin/tahun-ajaran"
        );

        router.refresh();
      }, 1000);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal menambahkan tahun ajaran."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar
        active="tahunAjaran"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email:
              "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-3 py-4 sm:px-5 sm:py-6 md:px-6 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1200px]">

              <div className="mb-5">
                <Link
                  href="/admin/tahun-ajaran"
                  className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
                >
                  <ArrowLeft
                    size={17}
                    className="transition-transform group-hover:-translate-x-1"
                  />

                  Kembali ke Daftar Tahun Ajaran
                </Link>
              </div>

              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                  <Plus
                    size={22}
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                      Tambah Tahun Ajaran
                    </h1>

                    <span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-600">
                      Data Master
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Buat periode akademik baru untuk sekolah.
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100">
                    <AlertCircle
                      size={18}
                      className="text-rose-600"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-rose-800">
                      Gagal menambahkan data
                    </p>

                    <p className="mt-1 text-sm leading-6 text-rose-700">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                    className="rounded-lg p-1 text-rose-400 hover:bg-rose-100 hover:text-rose-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {success && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                    <CheckCircle2
                      size={18}
                      className="text-emerald-600"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-emerald-800">
                      Berhasil
                    </p>

                    <p className="mt-1 text-sm leading-6 text-emerald-700">
                      {success}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">

                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-5 sm:px-6 lg:px-7">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <CalendarDays
                          size={19}
                        />
                      </div>

                      <div>
                        <h2 className="text-sm font-bold text-slate-800 sm:text-base">
                          Informasi Tahun Ajaran
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          Data ini akan menjadi induk periode untuk kelas.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 lg:p-7">
                    <div className="space-y-5">

                      <div>
                        <label
                          htmlFor="nama"
                          className="mb-2 block text-xs font-semibold text-slate-600"
                        >
                          Nama Tahun Ajaran
                          <span className="ml-1 text-rose-500">
                            *
                          </span>
                        </label>

                        <div className="relative">
                          <CalendarDays
                            size={17}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            id="nama"
                            name="nama"
                            type="text"
                            value={
                              form.nama
                            }
                            onChange={
                              handleChange
                            }
                            disabled={
                              loading
                            }
                            placeholder="2026/2027"
                            maxLength={9}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                          />
                        </div>

                        <p className="mt-1.5 text-xs text-slate-400">
                          Contoh:{" "}
                          <span className="font-medium text-slate-500">
                            2026/2027
                          </span>
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="semester"
                          className="mb-2 block text-xs font-semibold text-slate-600"
                        >
                          Semester
                          <span className="ml-1 text-rose-500">
                            *
                          </span>
                        </label>

                        <div className="relative">
                          <GraduationCap
                            size={17}
                            className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                          />

                          <select
                            id="semester"
                            name="semester"
                            value={
                              form.semester
                            }
                            onChange={
                              handleChange
                            }
                            disabled={
                              loading
                            }
                            className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                          >
                            <option value="Ganjil">
                              Ganjil
                            </option>

                            <option value="Genap">
                              Genap
                            </option>
                          </select>

                          <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="status"
                          className="mb-2 block text-xs font-semibold text-slate-600"
                        >
                          Status
                          <span className="ml-1 text-rose-500">
                            *
                          </span>
                        </label>

                        <div className="relative">
                          <CheckCircle2
                            size={17}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <select
                            id="status"
                            name="status"
                            value={
                              form.status
                            }
                            onChange={
                              handleChange
                            }
                            disabled={
                              loading
                            }
                            className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                          >
                            <option value="tidak_aktif">
                              Tidak Aktif
                            </option>

                            <option value="aktif">
                              Aktif
                            </option>
                          </select>

                          <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                        <Info
                          size={16}
                          className="text-indigo-700"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-indigo-800">
                          Hubungan dengan Kelas
                        </p>

                        <p className="mt-1 text-xs leading-5 text-indigo-700">
                          Setelah tahun ajaran berhasil dibuat, kelas dapat
                          dihubungkan menggunakan tahun ajaran ini sebagai
                          periode akademiknya.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                          <Database
                            size={17}
                            className="text-slate-600"
                          />
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Penyimpanan
                          </p>

                          <p className="mt-0.5 text-sm font-medium text-slate-700">
                            Database Sekolah
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                          <Layers3
                            size={17}
                            className="text-blue-600"
                          />
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">
                            Relasi
                          </p>

                          <p className="mt-0.5 text-sm font-medium text-blue-700">
                            Tahun Ajaran → Kelas
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 lg:px-7">
                    <Link
                      href="/admin/tahun-ajaran"
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:w-auto"
                    >
                      <X size={17} />
                      Batal
                    </Link>

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save size={17} />
                          Simpan Tahun Ajaran
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <aside className="hidden xl:block">
                  <div className="sticky top-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <CalendarDays size={17} />
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-800">
                            Alur Data
                          </h3>

                          <p className="text-[11px] text-slate-400">
                            Tahun ajaran & kelas
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5 p-5">
                      <GuideStep
                        number="1"
                        title="Buat Tahun Ajaran"
                        description="Masukkan periode seperti 2026/2027."
                      />

                      <GuideStep
                        number="2"
                        title="Pilih Semester"
                        description="Tentukan Ganjil atau Genap."
                      />

                      <GuideStep
                        number="3"
                        title="Tentukan Status"
                        description="Aktif akan menjadi periode utama sekolah."
                      />

                      <GuideStep
                        number="4"
                        title="Hubungkan Kelas"
                        description="Kelas menggunakan tahunAjaranId dari periode ini."
                      />
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                      <div className="flex items-start gap-2">
                        <Layers3
                          size={14}
                          className="mt-0.5 shrink-0 text-indigo-500"
                        />

                        <p className="text-[10px] leading-4 text-slate-400">
                          Kelas tidak dibuat pada endpoint
                          tahun ajaran. Relasi kelas dilakukan
                          melalui data Kelas.
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              <div className="mt-6 xl:hidden">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Layers3 size={16} />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        Relasi Kelas
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-slate-400">
                        Setelah tahun ajaran dibuat, kelas dapat
                        menggunakan tahun ajaran tersebut melalui
                        tahunAjaranId.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="py-6 text-center">
                <p className="text-[11px] text-slate-400">
                  © 2026 SmartSchool • Tambah Tahun Ajaran
                </p>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function GuideStep({
  number,
  title,
  description,
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
        {number}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-700">
          {title}
        </p>

        <p className="mt-1 text-[11px] leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}