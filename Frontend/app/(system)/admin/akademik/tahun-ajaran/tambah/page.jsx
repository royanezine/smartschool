"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

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
} from "@/services/tahunAjaran.service";

export default function TambahTahunAjaranPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    nama: "",
    semester: "Ganjil",
    status: "tidak_aktif",
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

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
      setError("Nama tahun ajaran wajib diisi.");
      return false;
    }

    const tahunRegex = /^\d{4}\/\d{4}$/;

    if (!tahunRegex.test(nama)) {
      setError(
        "Format tahun ajaran harus seperti 2026/2027."
      );
      return false;
    }

    const tahun = nama.split("/");

    const tahunAwal = Number(tahun[0]);
    const tahunAkhir = Number(tahun[1]);

    if (tahunAkhir !== tahunAwal + 1) {
      setError(
        "Tahun ajaran harus memiliki jarak satu tahun, contoh 2026/2027."
      );
      return false;
    }

    if (!["Ganjil", "Genap"].includes(form.semester)) {
      setError("Semester harus Ganjil atau Genap.");
      return false;
    }

    if (!["aktif", "tidak_aktif"].includes(form.status)) {
      setError("Status tahun ajaran tidak valid.");
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

      await createTahunAjaran(payload);

      setSuccess(
        "Tahun ajaran berhasil ditambahkan. Sekarang kamu dapat menghubungkan kelas melalui halaman detail tahun ajaran."
      );

      setTimeout(() => {
        router.push(
          "/admin/akademik/tahun-ajaran"
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
    <div className="theme-page flex h-screen w-full overflow-hidden">
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
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-3 py-4 sm:px-5 sm:py-6 md:px-6 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1200px]">

              {/* ================================================= */}
              {/* BACK */}
              {/* ================================================= */}

              <div className="mb-5">
                <Link
                  href="/admin/akademik/tahun-ajaran"
                  className="theme-text-muted theme-sidebar-hover group inline-flex items-center gap-2 text-sm font-medium transition"
                >
                  <ArrowLeft
                    size={17}
                    className="transition-transform group-hover:-translate-x-1"
                  />

                  Kembali ke Daftar Tahun Ajaran
                </Link>
              </div>

              {/* ================================================= */}
              {/* HEADER */}
              {/* ================================================= */}

              <div className="mb-6 flex items-center gap-4">

                <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-md">
                  <Plus size={22} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">

                    <h1 className="theme-text text-xl font-bold tracking-tight sm:text-2xl">
                      Tambah Tahun Ajaran
                    </h1>

                    <span className="theme-info rounded-md px-2 py-1 text-[10px] font-semibold">
                      Data Master
                    </span>

                  </div>

                  <p className="theme-text-muted mt-1 text-sm">
                    Buat periode akademik baru untuk sekolah.
                  </p>
                </div>

              </div>

              {/* ================================================= */}
              {/* ERROR */}
              {/* ================================================= */}

              {error && (
                <div className="theme-danger mb-5 flex items-start gap-3 rounded-2xl border p-4">

                  <div className="theme-danger flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <AlertCircle size={18} />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-semibold">
                      Gagal menambahkan data
                    </p>

                    <p className="mt-1 text-sm leading-6 opacity-80">
                      {error}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="theme-header-hover rounded-lg p-1 transition"
                  >
                    <X size={16} />
                  </button>

                </div>
              )}

              {/* ================================================= */}
              {/* SUCCESS */}
              {/* ================================================= */}

              {success && (
                <div className="theme-success mb-5 flex items-start gap-3 rounded-2xl border p-4">

                  <div className="theme-success flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <CheckCircle2 size={18} />
                  </div>

                  <div>

                    <p className="text-sm font-semibold">
                      Berhasil
                    </p>

                    <p className="mt-1 text-sm leading-6 opacity-80">
                      {success}
                    </p>

                  </div>

                </div>
              )}

              {/* ================================================= */}
              {/* CONTENT */}
              {/* ================================================= */}

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">

                {/* ================================================= */}
                {/* FORM */}
                {/* ================================================= */}

                <form
                  onSubmit={handleSubmit}
                  className="theme-card theme-border min-w-0 overflow-hidden rounded-2xl border shadow-sm"
                >

                  {/* FORM HEADER */}

                  <div className="theme-card-soft theme-border-soft border-b px-5 py-5 sm:px-6 lg:px-7">

                    <div className="flex items-center gap-3">

                      <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                        <CalendarDays size={19} />
                      </div>

                      <div>

                        <h2 className="theme-text text-sm font-bold sm:text-base">
                          Informasi Tahun Ajaran
                        </h2>

                        <p className="theme-text-muted mt-1 text-xs leading-5">
                          Data ini akan menjadi induk periode untuk kelas.
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* FORM BODY */}

                  <div className="p-5 sm:p-6 lg:p-7">

                    <div className="space-y-5">

                      {/* NAMA */}

                      <div>

                        <label
                          htmlFor="nama"
                          className="theme-text-secondary mb-2 block text-xs font-semibold"
                        >
                          Nama Tahun Ajaran

                          <span className="ml-1 text-[var(--color-danger)]">
                            *
                          </span>
                        </label>

                        <div className="relative">

                          <CalendarDays
                            size={17}
                            className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                          />

                          <input
                            id="nama"
                            name="nama"
                            type="text"
                            value={form.nama}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="2026/2027"
                            maxLength={9}
                            className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
                          />

                        </div>

                        <p className="theme-text-muted mt-1.5 text-xs">
                          Contoh:{" "}
                          <span className="theme-text-secondary font-medium">
                            2026/2027
                          </span>
                        </p>

                      </div>

                      {/* SEMESTER */}

                      <div>

                        <label
                          htmlFor="semester"
                          className="theme-text-secondary mb-2 block text-xs font-semibold"
                        >
                          Semester

                          <span className="ml-1 text-[var(--color-danger)]">
                            *
                          </span>
                        </label>

                        <div className="relative">

                          <GraduationCap
                            size={17}
                            className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2"
                          />

                          <select
                            id="semester"
                            name="semester"
                            value={form.semester}
                            onChange={handleChange}
                            disabled={loading}
                            className="theme-input h-11 w-full appearance-none rounded-xl border pl-10 pr-10 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
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
                            className="theme-text-muted pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                          />

                        </div>

                      </div>

                      {/* STATUS */}

                      <div>

                        <label
                          htmlFor="status"
                          className="theme-text-secondary mb-2 block text-xs font-semibold"
                        >
                          Status

                          <span className="ml-1 text-[var(--color-danger)]">
                            *
                          </span>
                        </label>

                        <div className="relative">

                          <CheckCircle2
                            size={17}
                            className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                          />

                          <select
                            id="status"
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            disabled={loading}
                            className="theme-input h-11 w-full appearance-none rounded-xl border pl-10 pr-10 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
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
                            className="theme-text-muted pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                          />

                        </div>

                      </div>

                    </div>

                    {/* ================================================= */}
                    {/* INFO RELASI */}
                    {/* ================================================= */}

                    <div className="theme-info mt-6 flex items-start gap-3 rounded-xl border p-4">

                      <div className="theme-card flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                        <Info size={16} />
                      </div>

                      <div>

                        <p className="theme-text text-sm font-semibold">
                          Hubungan dengan Kelas
                        </p>

                        <p className="theme-text-secondary mt-1 text-xs leading-5">
                          Setelah tahun ajaran berhasil dibuat,
                          kelas dapat dihubungkan menggunakan
                          tahun ajaran ini sebagai periode
                          akademiknya.
                        </p>

                      </div>

                    </div>

                    {/* ================================================= */}
                    {/* INFO CARDS */}
                    {/* ================================================= */}

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                      <div className="theme-card-soft theme-border flex items-center gap-3 rounded-xl border p-4">

                        <div className="theme-card flex h-9 w-9 items-center justify-center rounded-lg">
                          <Database
                            size={17}
                            className="theme-text-secondary"
                          />
                        </div>

                        <div>

                          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wide">
                            Penyimpanan
                          </p>

                          <p className="theme-text-secondary mt-0.5 text-sm font-medium">
                            Database Sekolah
                          </p>

                        </div>

                      </div>

                      <div className="theme-info flex items-center gap-3 rounded-xl border p-4">

                        <div className="theme-card flex h-9 w-9 items-center justify-center rounded-lg">
                          <Layers3 size={17} />
                        </div>

                        <div>

                          <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                            Relasi
                          </p>

                          <p className="mt-0.5 text-sm font-medium">
                            Tahun Ajaran → Kelas
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* ================================================= */}
                  {/* FORM FOOTER */}
                  {/* ================================================= */}

                  <div className="theme-card-soft theme-border-soft flex flex-col-reverse gap-3 border-t px-5 py-4 sm:flex-row sm:justify-end sm:px-6 lg:px-7">

                    <Link
                      href="/admin/akademik/tahun-ajaran"
                      className="theme-card theme-border theme-text-secondary theme-header-hover inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-6 py-2.5 text-sm font-medium transition sm:w-auto"
                    >
                      <X size={17} />
                      Batal
                    </Link>

                    <button
                      type="submit"
                      disabled={loading}
                      className="theme-primary inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-7 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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

                {/* ================================================= */}
                {/* DESKTOP SIDEBAR */}
                {/* ================================================= */}

                <aside className="hidden xl:block">

                  <div className="theme-card theme-border sticky top-6 overflow-hidden rounded-2xl border shadow-sm">

                    {/* SIDEBAR HEADER */}

                    <div className="theme-card-soft theme-border-soft border-b px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg">
                          <CalendarDays size={17} />
                        </div>

                        <div>

                          <h3 className="theme-text text-sm font-bold">
                            Alur Data
                          </h3>

                          <p className="theme-text-muted text-[11px]">
                            Tahun ajaran & kelas
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* GUIDE */}

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

                    {/* SIDEBAR FOOTER */}

                    <div className="theme-card-soft theme-border-soft border-t px-5 py-4">

                      <div className="flex items-start gap-2">

                        <Layers3
                          size={14}
                          className="theme-sidebar-text-active mt-0.5 shrink-0"
                        />

                        <p className="theme-text-muted text-[10px] leading-4">
                          Kelas tidak dibuat pada endpoint
                          tahun ajaran. Relasi kelas dilakukan
                          melalui data Kelas.
                        </p>

                      </div>

                    </div>

                  </div>

                </aside>

              </div>

              {/* ================================================= */}
              {/* MOBILE RELATION INFO */}
              {/* ================================================= */}

              <div className="mt-6 xl:hidden">

                <div className="theme-card theme-border rounded-xl border p-4 shadow-sm">

                  <div className="flex items-start gap-3">

                    <div className="theme-info flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                      <Layers3 size={16} />
                    </div>

                    <div>

                      <p className="theme-text text-xs font-bold">
                        Relasi Kelas
                      </p>

                      <p className="theme-text-muted mt-1 text-[11px] leading-5">
                        Setelah tahun ajaran dibuat, kelas dapat
                        menggunakan tahun ajaran tersebut melalui
                        tahunAjaranId.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* ================================================= */}
              {/* FOOTER */}
              {/* ================================================= */}

              <footer className="theme-text-muted py-6 text-center">
                <p className="text-[11px]">
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

      <div className="theme-info flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
        {number}
      </div>

      <div>

        <p className="theme-text-secondary text-xs font-semibold">
          {title}
        </p>

        <p className="theme-text-muted mt-1 text-[11px] leading-5">
          {description}
        </p>

      </div>

    </div>
  );
}