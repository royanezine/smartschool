"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ChevronDown,
  Info,
  Layers3,
} from "lucide-react";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import {
  getTahunAjaran,
  updateTahunAjaran,
} from "../../../../../services/tahunAjaran.service";

import { getKelas } from "../../../../../services/kelas.service";

export default function EditTahunAjaranPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id;

  // =========================================================
  // STATE
  // =========================================================
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingKelas, setLoadingKelas] = useState(true);

  const [error, setError] = useState("");

  const [nama, setNama] = useState("");
  const [semester, setSemester] = useState("Ganjil");
  const [status, setStatus] = useState("tidak_aktif");

  const [kelas, setKelas] = useState([]);

  // =========================================================
  // SIDEBAR
  // =========================================================
  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  // =========================================================
  // EXTRACT RESPONSE TAHUN AJARAN
  // =========================================================
  const extractTahunAjaran = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.data?.items)) {
      return response.data.items;
    }

    if (Array.isArray(response?.items)) {
      return response.items;
    }

    return [];
  };

  // =========================================================
  // EXTRACT KELAS
  // =========================================================
  const extractKelas = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.data?.items)) {
      return response.data.items;
    }

    if (Array.isArray(response?.items)) {
      return response.items;
    }

    return [];
  };

  // =========================================================
  // LOAD DATA
  // =========================================================
  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        setLoadingKelas(true);
        setError("");

        // =====================================================
        // AMBIL TAHUN AJARAN
        // =====================================================
        const response = await getTahunAjaran();

        const list = extractTahunAjaran(response);

        const item = list.find(
          (row) => String(row?.id) === String(id)
        );

        if (!item) {
          throw new Error(
            "Tahun ajaran tidak ditemukan."
          );
        }

        // =====================================================
        // SET FORM
        // =====================================================
        setNama(item.nama ?? "");
        setSemester(item.semester ?? "Ganjil");
        setStatus(item.status ?? "tidak_aktif");

        // =====================================================
        // AMBIL KELAS
        // =====================================================
        try {
          const kelasResponse = await getKelas({
            tahunAjaranId: id,
            page: 1,
            limit: 100,
          });

          setKelas(extractKelas(kelasResponse));
        } catch (kelasError) {
          console.error(
            "Gagal mengambil kelas:",
            kelasError
          );

          setKelas([]);
        }
      } catch (err) {
        console.error(
          "Gagal mengambil data tahun ajaran:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil data tahun ajaran."
        );
      } finally {
        setLoading(false);
        setLoadingKelas(false);
      }
    };

    load();
  }, [id]);

  // =========================================================
  // SUBMIT
  // =========================================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!id) {
      setError(
        "ID tahun ajaran tidak ditemukan."
      );
      return;
    }

    setError("");

    // =======================================================
    // VALIDASI NAMA
    // =======================================================
    const cleanNama = nama.trim();

    if (!cleanNama) {
      setError(
        "Nama tahun ajaran wajib diisi."
      );
      return;
    }

    if (!/^\d{4}\/\d{4}$/.test(cleanNama)) {
      setError(
        "Format tahun ajaran harus seperti 2026/2027."
      );
      return;
    }

    const [tahunAwalString, tahunAkhirString] =
      cleanNama.split("/");

    const tahunAwal = Number(tahunAwalString);
    const tahunAkhir = Number(tahunAkhirString);

    if (tahunAkhir !== tahunAwal + 1) {
      setError(
        "Tahun ajaran harus memiliki jarak satu tahun, contoh 2026/2027."
      );
      return;
    }

    // =======================================================
    // VALIDASI SEMESTER
    // =======================================================
    if (
      !["Ganjil", "Genap"].includes(
        semester
      )
    ) {
      setError(
        "Semester harus Ganjil atau Genap."
      );
      return;
    }

    // =======================================================
    // VALIDASI STATUS
    // =======================================================
    if (
      !["aktif", "tidak_aktif"].includes(
        status
      )
    ) {
      setError(
        "Status tahun ajaran tidak valid."
      );
      return;
    }

    try {
      setSaving(true);

      // =====================================================
      // UPDATE DATA
      // =====================================================
      await updateTahunAjaran(id, {
        nama: cleanNama,
        semester,
        status,
      });

      // =====================================================
      // KEMBALI KE LIST
      // =====================================================
      router.replace(
        "/admin/tahun-ajaran"
      );

      router.refresh();
    } catch (err) {
      console.error(
        "Gagal memperbarui tahun ajaran:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal memperbarui tahun ajaran."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING PAGE
  // =========================================================
  if (loading) {
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
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex min-h-0 flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#155DFC] border-t-transparent" />

              <p className="text-sm font-medium text-slate-500">
                Memuat data tahun ajaran...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <Sidebar
        active="tahunAjaran"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* HEADER */}
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* MAIN */}
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-slate-50/80 to-white">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            <div className="space-y-7">

              {/* =================================================
                  BREADCRUMB
              ================================================= */}
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex items-center gap-1.5 text-slate-500 transition hover:text-[#155DFC]"
                >
                  <ArrowLeft size={16} />

                  <span className="font-medium">
                    Kembali
                  </span>
                </button>

                <span className="text-slate-300">
                  /
                </span>

                <span className="font-medium text-slate-600">
                  Edit Tahun Ajaran
                </span>
              </div>

              {/* =================================================
                  ERROR
              ================================================= */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50/80 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <AlertCircle
                        size={20}
                        className="text-red-600"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-red-800">
                        Terjadi kesalahan
                      </p>

                      <p className="mt-1 text-sm leading-5 text-red-600">
                        {error}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setError("")}
                      className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================
                  FORM CARD
              ================================================= */}
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

                {/* =================================================
                    HERO HEADER
                ================================================= */}
                <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] px-6 py-6 sm:px-8 sm:py-7">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/10 text-white">
                      <CalendarDays size={28} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                        Data Master
                      </p>

                      <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Edit Tahun Ajaran
                      </h1>

                      <p className="mt-1 text-sm text-slate-300">
                        Perbarui informasi tahun ajaran yang terdaftar.
                      </p>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    FORM
                ================================================= */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 p-6 sm:p-8"
                >

                  {/* =================================================
                      NAMA TAHUN AJARAN
                  ================================================= */}
                  <div>
                    <label
                      htmlFor="nama"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Nama Tahun Ajaran{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="nama"
                        name="nama"
                        type="text"
                        value={nama}
                        onChange={(event) =>
                          setNama(
                            event.target.value
                          )
                        }
                        disabled={saving}
                        placeholder="Contoh: 2026/2027"
                        maxLength={9}
                        autoComplete="off"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                      />
                    </div>

                    <p className="mt-1.5 text-xs text-slate-400">
                      Gunakan format tahun awal/tahun
                      akhir, misalnya 2026/2027.
                    </p>
                  </div>

                  {/* =================================================
                      SEMESTER
                  ================================================= */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Semester{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {["Ganjil", "Genap"].map(
                        (item) => {
                          const selected =
                            semester === item;

                          return (
                            <button
                              key={item}
                              type="button"
                              disabled={saving}
                              onClick={() =>
                                setSemester(item)
                              }
                              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                selected
                                  ? "border-[#155DFC] bg-[#eaf1ff] text-[#155DFC] shadow-sm"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                              } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <GraduationCap
                                  size={17}
                                />

                                {item}
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* =================================================
                      STATUS
                  ================================================= */}
                  <div>
                    <label
                      htmlFor="status"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Status{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <CheckCircle2
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <select
                        id="status"
                        name="status"
                        value={status}
                        onChange={(event) =>
                          setStatus(
                            event.target.value
                          )
                        }
                        disabled={saving}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm text-slate-800 outline-none transition focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                      >
                        <option value="tidak_aktif">
                          Tidak Aktif
                        </option>

                        <option value="aktif">
                          Aktif
                        </option>
                      </select>

                      <ChevronDown
                        size={17}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  </div>

                  {/* =================================================
                      INFO KELAS
                  ================================================= */}
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        <Info size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-indigo-800">
                          Hubungan dengan Kelas
                        </p>

                        <p className="mt-1 text-xs leading-5 text-indigo-700">
                          Kelas yang terdaftar pada tahun
                          ajaran ini tetap terhubung
                          menggunakan ID tahun ajaran.
                          Mengubah nama, semester, atau
                          status tidak menghapus kelas.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      KELAS TERHUBUNG
                  ================================================= */}
                  <div className="overflow-hidden rounded-xl border border-slate-200">

                    {/* HEADER */}
                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50 px-4 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <Layers3 size={18} />
                        </div>

                        <div className="min-w-0">
                          <h2 className="text-sm font-bold text-slate-800">
                            Kelas Terhubung
                          </h2>

                          <p className="truncate text-xs text-slate-400">
                            Kelas yang menggunakan tahun
                            ajaran ini.
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                        {loadingKelas
                          ? "..."
                          : kelas.length}
                      </span>
                    </div>

                    {/* CONTENT */}
                    <div className="p-4">

                      {/* LOADING */}
                      {loadingKelas ? (
                        <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />

                          Memuat kelas...
                        </div>
                      ) : kelas.length === 0 ? (

                        /* EMPTY */
                        <div className="py-7 text-center">
                          <Layers3
                            size={28}
                            className="mx-auto text-slate-300"
                          />

                          <p className="mt-2 text-sm font-semibold text-slate-600">
                            Belum ada kelas
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Belum ada kelas yang terhubung
                            dengan tahun ajaran ini.
                          </p>
                        </div>
                      ) : (

                        /* LIST KELAS */
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {kelas.map(
                            (item, index) => (
                              <div
                                key={
                                  item?.id ??
                                  index
                                }
                                className="rounded-xl border border-slate-200 bg-white p-3 transition hover:border-indigo-200 hover:bg-slate-50/50"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-700">
                                      {item?.nama ||
                                        "-"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                      Tingkat{" "}
                                      {item?.tingkat ??
                                        "-"}
                                    </p>

                                    {item?.kapasitas !=
                                      null && (
                                      <p className="mt-1 text-[11px] text-slate-400">
                                        Kapasitas:{" "}
                                        {
                                          item.kapasitas
                                        }{" "}
                                        siswa
                                      </p>
                                    )}
                                  </div>

                                  <GraduationCap
                                    size={18}
                                    className="shrink-0 text-indigo-500"
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* =================================================
                      ACTION
                  ================================================= */}
                  <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        router.back()
                      }
                      className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d47c9] disabled:cursor-not-allowed disabled:opacity-50"
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

                          Simpan Perubahan
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}
              <footer className="pt-6 text-center text-xs text-slate-400">
                © 2026 SmartSchool • Edit Tahun Ajaran
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

