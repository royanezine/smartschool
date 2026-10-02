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

import Header from "../../../../../../components/Header";
import Sidebar from "../../../../../../components/Sidebar";

import {
  getTahunAjaran,
  updateTahunAjaran,
} from "../../../../../../../services/tahunAjaran.service";

import { getKelas } from "../../../../../../../services/kelas.service";

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
          throw new Error("Tahun ajaran tidak ditemukan.");
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
      setError("ID tahun ajaran tidak ditemukan.");
      return;
    }

    setError("");

    // =======================================================
    // VALIDASI NAMA
    // =======================================================

    const cleanNama = nama.trim();

    if (!cleanNama) {
      setError("Nama tahun ajaran wajib diisi.");
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

    if (!["Ganjil", "Genap"].includes(semester)) {
      setError("Semester harus Ganjil atau Genap.");
      return;
    }

    // =======================================================
    // VALIDASI STATUS
    // =======================================================

    if (!["aktif", "tidak_aktif"].includes(status)) {
      setError("Status tahun ajaran tidak valid.");
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

      router.replace("/admin/akademik/tahun-ajaran");
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

          <main className="theme-page flex min-h-0 flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full theme-info">
                <Loader2
                  size={22}
                  className="animate-spin theme-sidebar-text-active"
                />
              </div>

              <p className="theme-text-muted text-sm font-medium">
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
    <div className="theme-page flex h-screen w-full overflow-hidden">
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

        <main className="theme-page min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            <div className="space-y-7">
              {/* =================================================
                  BREADCRUMB
              ================================================= */}

              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="theme-text-muted inline-flex items-center gap-1.5 font-medium transition theme-header-hover rounded-lg px-2 py-1"
                >
                  <ArrowLeft size={16} />

                  <span>Kembali</span>
                </button>

                <span className="theme-text-muted">
                  /
                </span>

                <span className="theme-text-secondary font-medium">
                  Edit Tahun Ajaran
                </span>
              </div>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div className="theme-danger rounded-xl border p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full theme-danger">
                      <AlertCircle size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        Terjadi kesalahan
                      </p>

                      <p className="mt-1 text-sm leading-5">
                        {error}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setError("")}
                      className="theme-card theme-border theme-text-secondary rounded-lg border px-3 py-1.5 text-sm font-medium transition theme-header-hover"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================
                  FORM CARD
              ================================================= */}

              <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                {/* =================================================
                    HERO HEADER
                ================================================= */}

                <div className="theme-primary px-6 py-6 sm:px-8 sm:py-7">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white">
                      <CalendarDays size={28} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/75">
                        Data Master
                      </p>

                      <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Edit Tahun Ajaran
                      </h1>

                      <p className="mt-1 text-sm text-white/75">
                        Perbarui informasi tahun ajaran yang
                        terdaftar.
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
                      className="theme-text-secondary mb-2 block text-sm font-semibold"
                    >
                      Nama Tahun Ajaran{" "}
                      <span className="text-[var(--color-danger)]">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={18}
                        className="theme-text-muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                      />

                      <input
                        id="nama"
                        name="nama"
                        type="text"
                        value={nama}
                        onChange={(event) =>
                          setNama(event.target.value)
                        }
                        disabled={saving}
                        placeholder="Contoh: 2026/2027"
                        maxLength={9}
                        autoComplete="off"
                        className="theme-input h-11 w-full rounded-xl border pl-11 pr-4 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <p className="theme-text-muted mt-1.5 text-xs">
                      Gunakan format tahun awal/tahun akhir,
                      misalnya 2026/2027.
                    </p>
                  </div>

                  {/* =================================================
                      SEMESTER
                  ================================================= */}

                  <div>
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      Semester{" "}
                      <span className="text-[var(--color-danger)]">
                        *
                      </span>
                    </label>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {["Ganjil", "Genap"].map((item) => {
                        const selected = semester === item;

                        return (
                          <button
                            key={item}
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              setSemester(item)
                            }
                            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              selected
                                ? "theme-info"
                                : "theme-card theme-border theme-text-secondary theme-header-hover"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <GraduationCap size={17} />

                              {item}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* =================================================
                      STATUS
                  ================================================= */}

                  <div>
                    <label
                      htmlFor="status"
                      className="theme-text-secondary mb-2 block text-sm font-semibold"
                    >
                      Status{" "}
                      <span className="text-[var(--color-danger)]">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <CheckCircle2
                        size={18}
                        className="theme-text-muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                      />

                      <select
                        id="status"
                        name="status"
                        value={status}
                        onChange={(event) =>
                          setStatus(event.target.value)
                        }
                        disabled={saving}
                        className="theme-input theme-text h-11 w-full appearance-none rounded-xl border py-3 pl-11 pr-10 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
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
                        className="theme-text-muted pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                      />
                    </div>
                  </div>

                  {/* =================================================
                      INFO KELAS
                  ================================================= */}

                  <div className="theme-info rounded-xl border p-4">
                    <div className="flex items-start gap-3">
                      <div className="theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <Info size={17} />
                      </div>

                      <div>
                        <p className="theme-text text-sm font-semibold">
                          Hubungan dengan Kelas
                        </p>

                        <p className="theme-text-secondary mt-1 text-xs leading-5">
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

                  <div className="theme-card theme-border overflow-hidden rounded-xl border">
                    {/* HEADER */}

                    <div className="theme-table-header flex items-center justify-between gap-4 border-b px-4 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                          <Layers3 size={18} />
                        </div>

                        <div className="min-w-0">
                          <h2 className="theme-text text-sm font-bold">
                            Kelas Terhubung
                          </h2>

                          <p className="theme-text-muted truncate text-xs">
                            Kelas yang menggunakan tahun
                            ajaran ini.
                          </p>
                        </div>
                      </div>

                      <span className="theme-info shrink-0 rounded-full px-3 py-1 text-xs font-bold">
                        {loadingKelas
                          ? "..."
                          : kelas.length}
                      </span>
                    </div>

                    {/* CONTENT */}

                    <div className="p-4">
                      {/* LOADING */}

                      {loadingKelas ? (
                        <div className="theme-text-muted flex items-center justify-center gap-2 py-6 text-sm">
                          <Loader2
                            size={17}
                            className="theme-sidebar-text-active animate-spin"
                          />

                          Memuat kelas...
                        </div>
                      ) : kelas.length === 0 ? (
                        /* EMPTY */

                        <div className="py-7 text-center">
                          <Layers3
                            size={28}
                            className="theme-text-muted mx-auto"
                          />

                          <p className="theme-text-secondary mt-2 text-sm font-semibold">
                            Belum ada kelas
                          </p>

                          <p className="theme-text-muted mt-1 text-xs">
                            Belum ada kelas yang terhubung
                            dengan tahun ajaran ini.
                          </p>
                        </div>
                      ) : (
                        /* LIST KELAS */

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {kelas.map((item, index) => (
                            <div
                              key={
                                item?.id ?? index
                              }
                              className="theme-card theme-border theme-table-hover rounded-xl border p-3 transition"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="theme-text truncate text-sm font-bold">
                                    {item?.nama || "-"}
                                  </p>

                                  <p className="theme-text-muted mt-1 text-xs">
                                    Tingkat{" "}
                                    {item?.tingkat ?? "-"}
                                  </p>

                                  {item?.kapasitas !=
                                    null && (
                                    <p className="theme-text-muted mt-1 text-[11px]">
                                      Kapasitas:{" "}
                                      {item.kapasitas}{" "}
                                      siswa
                                    </p>
                                  )}
                                </div>

                                <GraduationCap
                                  size={18}
                                  className="theme-sidebar-text-active shrink-0"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* =================================================
                      ACTION
                  ================================================= */}

                  <div className="theme-border-soft flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => router.back()}
                      className="theme-card theme-border theme-text-secondary theme-header-hover rounded-xl border px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
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

              <footer className="theme-text-muted pt-6 text-center text-xs">
                © 2026 SmartSchool • Edit Tahun Ajaran
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}