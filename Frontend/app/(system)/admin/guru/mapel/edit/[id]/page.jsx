"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "../../../../../../components/Header";
import Sidebar from "../../../../../../components/Sidebar";

import {
  ArrowLeft,
  BookMarked,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Hash,
  Type,
  ToggleLeft,
  Info,
  School,
  Pencil,
  RefreshCw,
} from "lucide-react";

import {
  getMataPelajaran,
  updateMataPelajaran,
} from "../../../../../../../services/mataPelajaran.service";

function StatusBadge({ status }) {
  const aktif = status === "aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
        aktif
          ? "theme-success"
          : "theme-card-soft theme-text-muted theme-border"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          aktif
            ? "bg-[var(--color-success)]"
            : "bg-[var(--color-text-muted)]"
        }`}
      />

      {aktif ? "Aktif" : "Nonaktif"}
    </span>
  );
}

export default function EditMapelPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [form, setForm] = useState({
    nama: "",
    kode: "",
    status: "aktif",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  /*
   * ============================================
   * AMBIL DATA MAPEL
   * GET /api/mata-pelajaran
   * ============================================
   */
  const loadMapel = async () => {
    if (!id) {
      setError("ID mata pelajaran tidak ditemukan.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getMataPelajaran();

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Gagal mengambil data mata pelajaran."
        );
      }

      const data = Array.isArray(response?.data)
        ? response.data
        : [];

      const selectedMapel = data.find(
        (item) => item?.id === id
      );

      if (!selectedMapel) {
        throw new Error(
          "Mata pelajaran tidak ditemukan atau sudah tidak tersedia."
        );
      }

      setForm({
        nama: selectedMapel.nama || "",
        kode: selectedMapel.kode || "",
        status: selectedMapel.status || "aktif",
      });
    } catch (err) {
      console.error("GET MAPEL ERROR:", err);

      setError(
        err?.message ||
          "Gagal mengambil data mata pelajaran."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapel();
  }, [id]);

  /*
   * ============================================
   * HANDLE CHANGE
   * ============================================
   */
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /*
   * ============================================
   * UPDATE MAPEL
   *
   * PUT /api/mata-pelajaran/:id
   *
   * Body:
   * {
   *   nama,
   *   kode,
   *   status
   * }
   * ============================================
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    const nama = form.nama.trim();
    const kode = form.kode.trim();

    if (!nama) {
      setError("Nama mata pelajaran wajib diisi.");
      return;
    }

    if (!kode) {
      setError("Kode mata pelajaran wajib diisi.");
      return;
    }

    if (!id) {
      setError("ID mata pelajaran tidak ditemukan.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await updateMataPelajaran(id, {
        nama,
        kode,
        status: form.status,
      });

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Gagal memperbarui mata pelajaran."
        );
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/admin/guru/mapel");
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error("UPDATE MAPEL ERROR:", err);

      setError(
        err?.message ||
          "Gagal memperbarui mata pelajaran."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================
   * BACK
   * ============================================
   */
  const handleBack = () => {
    if (saving) return;

    router.push("/admin/guru/mapel");
  };

  /*
   * ============================================
   * LOADING PAGE
   * ============================================
   */
  if (loading) {
    return (
      <div className="flex h-screen w-full theme-page overflow-hidden">
        <Sidebar
          active="guruMapel"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="admin"
        />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col items-center justify-center min-h-[500px]">
                  <div className="w-12 h-12 rounded-xl theme-info flex items-center justify-center">
                    <Loader2
                      size={24}
                      className="text-[var(--color-primary)] animate-spin"
                    />
                  </div>

                  <p className="text-sm font-medium theme-text-secondary mt-4">
                    Memuat data mata pelajaran...
                  </p>

                  <p className="text-xs theme-text-muted mt-1">
                    Mohon tunggu sebentar
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /*
   * ============================================
   * ERROR SAAT LOAD DATA
   * ============================================
   */
  if (error && !form.nama && !form.kode) {
    return (
      <div className="flex h-screen w-full theme-page overflow-hidden">
        <Sidebar
          active="guruMapel"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="admin"
        />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                <div className="theme-card rounded-2xl border theme-border shadow-sm p-8">
                  <div className="max-w-md mx-auto text-center">
                    <div className="w-14 h-14 mx-auto rounded-xl theme-danger flex items-center justify-center">
                      <AlertCircle
                        size={28}
                        className="text-[var(--color-danger)]"
                      />
                    </div>

                    <h2 className="text-lg font-bold theme-text mt-4">
                      Data Tidak Ditemukan
                    </h2>

                    <p className="text-sm theme-text-muted mt-2 leading-relaxed">
                      {error}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                      <button
                        type="button"
                        onClick={loadMapel}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl theme-primary text-sm font-medium transition-colors"
                      >
                        <RefreshCw size={16} />
                        Coba Lagi
                      </button>

                      <button
                        type="button"
                        onClick={handleBack}
                        className="
                          w-full sm:w-auto
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          px-4
                          py-2.5
                          rounded-xl
                          border
                          theme-border
                          theme-card
                          theme-text-secondary
                          theme-table-hover
                          text-sm
                          font-medium
                          transition-colors
                        "
                      >
                        <ArrowLeft size={16} />
                        Kembali
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /*
   * ============================================
   * MAIN PAGE
   * ============================================
   */
  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar
        active="guruMapel"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
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

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

              {/* PAGE HEADER */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={saving}
                  className="
                    p-2.5
                    rounded-xl
                    border
                    theme-border
                    theme-card
                    theme-text-muted
                    theme-table-hover
                    transition-colors
                    shrink-0
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                  title="Kembali ke daftar mapel"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="p-2.5 rounded-xl theme-primary shadow-lg shrink-0">
                  <Pencil size={20} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-2xl font-bold theme-text">
                    Edit Mata Pelajaran
                  </h1>

                  <p className="text-sm theme-text-muted mt-1">
                    Perbarui informasi mata pelajaran yang
                    sudah tersimpan.
                  </p>
                </div>
              </div>

              {/* SUCCESS */}
              {success && (
                <div className="flex items-center gap-3 p-4 rounded-xl border theme-success">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[var(--color-success-background)]">
                    <CheckCircle2
                      size={20}
                      className="text-[var(--color-success)]"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[var(--color-success)]">
                      Mata pelajaran berhasil diperbarui
                    </p>

                    <p className="text-xs text-[var(--color-success)] mt-0.5">
                      Mengalihkan ke daftar mata pelajaran...
                    </p>
                  </div>
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl border theme-danger">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[var(--color-danger-background)]">
                    <AlertCircle
                      size={20}
                      className="text-[var(--color-danger)]"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-danger)]">
                      Gagal memperbarui mata pelajaran
                    </p>

                    <p className="text-sm text-[var(--color-danger)] mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* MAIN GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* FORM */}
                <form
                  onSubmit={handleSubmit}
                  className="
                    lg:col-span-2
                    theme-card
                    rounded-2xl
                    border
                    theme-border
                    shadow-sm
                    overflow-hidden
                  "
                >
                  {/* FORM HEADER */}
                  <div className="px-6 py-5 border-b theme-border-soft theme-card-soft">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg theme-info flex items-center justify-center">
                        <BookMarked
                          size={18}
                          className="text-[var(--color-primary)]"
                        />
                      </div>

                      <div>
                        <h2 className="text-sm font-semibold theme-text-secondary">
                          Informasi Mata Pelajaran
                        </h2>

                        <p className="text-xs theme-text-muted mt-0.5">
                          Ubah data yang ingin diperbarui.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FORM BODY */}
                  <div className="p-6 space-y-6">

                    {/* NAMA */}
                    <div>
                      <label
                        htmlFor="nama"
                        className="flex items-center gap-1.5 text-sm font-medium theme-text-secondary mb-2"
                      >
                        <Type
                          size={14}
                          className="theme-text-muted"
                        />

                        Nama Mata Pelajaran

                        <span className="text-[var(--color-danger)]">
                          *
                        </span>
                      </label>

                      <input
                        id="nama"
                        type="text"
                        value={form.nama}
                        onChange={(e) =>
                          handleChange(
                            "nama",
                            e.target.value
                          )
                        }
                        placeholder="Contoh: Matematika"
                        disabled={saving}
                        autoComplete="off"
                        className="
                          theme-input
                          w-full
                          px-3.5
                          py-3
                          text-sm
                          rounded-xl
                          border
                          focus:outline-none
                          focus:ring-2
                          focus:ring-[var(--color-primary)]/20
                          focus:border-[var(--color-primary)]
                          transition-all
                          disabled:opacity-60
                          disabled:cursor-not-allowed
                        "
                      />

                      <p className="text-xs theme-text-muted mt-1.5">
                        Masukkan nama mata pelajaran sesuai
                        dengan data sekolah.
                      </p>
                    </div>

                    {/* KODE */}
                    <div>
                      <label
                        htmlFor="kode"
                        className="flex items-center gap-1.5 text-sm font-medium theme-text-secondary mb-2"
                      >
                        <Hash
                          size={14}
                          className="theme-text-muted"
                        />

                        Kode Mata Pelajaran

                        <span className="text-[var(--color-danger)]">
                          *
                        </span>
                      </label>

                      <input
                        id="kode"
                        type="text"
                        value={form.kode}
                        onChange={(e) =>
                          handleChange(
                            "kode",
                            e.target.value.toUpperCase()
                          )
                        }
                        placeholder="Contoh: MTK-01"
                        disabled={saving}
                        autoComplete="off"
                        className="
                          theme-input
                          w-full
                          px-3.5
                          py-3
                          text-sm
                          rounded-xl
                          border
                          font-mono
                          uppercase
                          focus:outline-none
                          focus:ring-2
                          focus:ring-[var(--color-primary)]/20
                          focus:border-[var(--color-primary)]
                          transition-all
                          disabled:opacity-60
                          disabled:cursor-not-allowed
                        "
                      />

                      <p className="text-xs theme-text-muted mt-1.5">
                        Kode harus unik di sekolah ini.
                      </p>
                    </div>

                    {/* STATUS */}
                    <div>
                      <label
                        htmlFor="status"
                        className="flex items-center gap-1.5 text-sm font-medium theme-text-secondary mb-2"
                      >
                        <ToggleLeft
                          size={15}
                          className="theme-text-muted"
                        />

                        Status
                      </label>

                      <select
                        id="status"
                        value={form.status}
                        onChange={(e) =>
                          handleChange(
                            "status",
                            e.target.value
                          )
                        }
                        disabled={saving}
                        className="
                          theme-input
                          w-full
                          px-3.5
                          py-3
                          text-sm
                          rounded-xl
                          border
                          focus:outline-none
                          focus:ring-2
                          focus:ring-[var(--color-primary)]/20
                          focus:border-[var(--color-primary)]
                          transition-all
                          disabled:opacity-60
                          disabled:cursor-not-allowed
                        "
                      >
                        <option value="aktif">
                          Aktif
                        </option>

                        <option value="nonaktif">
                          Nonaktif
                        </option>
                      </select>

                      <p className="text-xs theme-text-muted mt-1.5">
                        Mapel nonaktif tetap tersimpan, tetapi
                        dapat dibatasi penggunaannya pada fitur
                        tertentu.
                      </p>
                    </div>
                  </div>

                  {/* FORM FOOTER */}
                  <div
                    className="
                      flex
                      flex-col-reverse
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                      gap-3
                      px-6
                      py-5
                      border-t
                      theme-border-soft
                      theme-card-soft
                    "
                  >
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={saving}
                      className="
                        w-full
                        sm:w-auto
                        px-5
                        py-2.5
                        rounded-xl
                        border
                        theme-border
                        theme-card
                        theme-text-secondary
                        theme-table-hover
                        transition-all
                        font-medium
                        text-sm
                        disabled:opacity-60
                        disabled:cursor-not-allowed
                      "
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={saving || success}
                      className="
                        w-full
                        sm:w-auto
                        flex
                        items-center
                        justify-center
                        gap-2
                        px-5
                        py-2.5
                        theme-primary
                        rounded-xl
                        transition-all
                        shadow-sm
                        font-medium
                        text-sm
                        disabled:opacity-60
                        disabled:cursor-not-allowed
                      "
                    >
                      {saving ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />

                          Menyimpan Perubahan...
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

                {/* RIGHT PANEL */}
                <div className="space-y-6">

                  {/* PREVIEW */}
                  <div className="theme-card rounded-2xl border theme-border shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b theme-border-soft theme-card-soft">
                      <div className="flex items-center gap-2">
                        <Pencil
                          size={16}
                          className="text-[var(--color-primary)]"
                        />

                        <h2 className="text-sm font-semibold theme-text-secondary">
                          Pratinjau
                        </h2>
                      </div>

                      <p className="text-xs theme-text-muted mt-1">
                        Perubahan akan terlihat setelah data
                        berhasil disimpan.
                      </p>
                    </div>

                    <div className="p-5">
                      <div className="p-4 rounded-xl border theme-border theme-card-soft">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="
                              font-mono
                              text-xs
                              font-semibold
                              theme-info
                              border
                              px-2.5
                              py-1
                              rounded-lg
                            "
                          >
                            {form.kode.trim()
                              ? form.kode
                                  .trim()
                                  .toUpperCase()
                              : "KODE"}
                          </span>

                          <StatusBadge
                            status={form.status}
                          />
                        </div>

                        <h3 className="text-base font-bold theme-text mt-3">
                          {form.nama.trim() ||
                            "Nama mata pelajaran"}
                        </h3>

                        <p className="text-xs theme-text-muted mt-1">
                          Mata Pelajaran
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* INFO BACKEND */}
                  <div className="theme-info rounded-2xl border p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg theme-card flex items-center justify-center">
                        <Info
                          size={16}
                          className="text-[var(--color-primary)]"
                        />
                      </div>

                      <div>
                        <h2 className="text-sm font-semibold text-[var(--color-primary)]">
                          Informasi Update
                        </h2>

                        <p className="text-[11px] theme-text-muted">
                          Sesuai API backend
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shrink-0" />

                        <p className="theme-text-secondary">
                          Nama, kode, dan status dapat diperbarui
                          dari halaman ini.
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shrink-0" />

                        <p className="theme-text-secondary">
                          Kode mata pelajaran harus tetap unik
                          dalam sekolah.
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shrink-0" />

                        <p className="theme-text-secondary">
                          Sekolah ditentukan otomatis dari akun
                          Admin Sekolah yang login.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SCHOOL */}
                  <div className="theme-card rounded-2xl border theme-border shadow-sm p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg theme-success flex items-center justify-center shrink-0">
                        <School
                          size={18}
                          className="text-[var(--color-success)]"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold theme-text-secondary">
                          Data Sekolah
                        </p>

                        <p className="text-xs theme-text-muted mt-1 leading-relaxed">
                          Data hanya dapat diperbarui jika mata
                          pelajaran tersebut berada pada sekolah
                          yang sesuai dengan akun yang sedang
                          login.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTNOTE */}
              <div className="flex items-center gap-2 text-xs theme-text-muted px-1">
                <AlertCircle size={14} />

                <span>
                  Pastikan perubahan data sudah benar sebelum
                  menyimpan.
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}