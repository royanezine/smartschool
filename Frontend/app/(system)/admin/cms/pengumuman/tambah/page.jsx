"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  Save,
  X,
  ArrowLeft,
  Megaphone,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  CalendarClock,
  ChevronRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function TambahPengumumanPage() {
  const router = useRouter();

  const [active, setActive] = useState("pengumuman");
  const [collapsed, setCollapsed] = useState(false);

  const [form, setForm] = useState({
    judul: "",
    kategori: "",
    konten: "",
    status: "draft",
    tanggal: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!form.judul.trim()) {
      newErrors.judul = "Judul wajib diisi";
    }

    if (!form.konten.trim()) {
      newErrors.konten = "Konten wajib diisi";
    }

    if (form.status === "scheduled" && !form.tanggal) {
      newErrors.tanggal = "Waktu terbit wajib diisi";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("Pengumuman berhasil disimpan!");
      router.push("/cmsAdmin/pengumuman");
    }, 1500);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "published":
        return <CheckCircle className="w-4 h-4" />;
      case "scheduled":
        return <CalendarClock className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "published":
        return "Publikasikan Sekarang";
      case "scheduled":
        return "Jadwalkan Nanti";
      default:
        return "Draft";
    }
  };

  return (
    <div className="flex min-h-screen w-full theme-page">
      {/* SIDEBAR */}
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          title="Tambah Pengumuman"
          user={{ name: "Admin" }}
          notifications={[]}
        />

        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 lg:p-8 theme-page">
          <div className="w-full min-w-0 max-w-6xl mx-auto space-y-6">
            {/* BREADCRUMB */}
            <nav className="flex items-center gap-2 text-xs sm:text-sm theme-text-muted">
              <a
                href="/cmsAdmin"
                className="hover:text-[var(--color-primary)] transition"
              >
                Dashboard
              </a>

              <ChevronRight className="w-3.5 h-3.5 theme-text-placeholder" />

              <a
                href="/cmsAdmin/pengumuman"
                className="hover:text-[var(--color-primary)] transition"
              >
                Pengumuman
              </a>

              <ChevronRight className="w-3.5 h-3.5 theme-text-placeholder" />

              <span className="text-[var(--color-primary)] font-semibold truncate">
                Tambah Baru
              </span>
            </nav>

            {/* BACK BUTTON */}
            <button
              type="button"
              onClick={() => router.back()}
              className="
                inline-flex items-center gap-2
                text-sm font-medium
                theme-text-muted
                hover:text-[var(--color-primary)]
                transition
                group
              "
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Kembali
            </button>

            {/* PAGE HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="shrink-0 p-3 rounded-2xl theme-primary shadow-lg">
                  <Megaphone className="w-6 h-6" />
                </div>

                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full theme-info border text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    <Sparkles className="w-3 h-3" />
                    CMS Website
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold theme-text">
                    Buat Pengumuman Baru
                  </h1>

                  <p className="text-sm theme-text-muted mt-1">
                    Isi informasi pengumuman yang akan ditampilkan
                  </p>
                </div>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="w-full min-w-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* MAIN FORM - 2/3 width */}
                <div className="lg:col-span-2 w-full min-w-0 space-y-5">
                  {/* JUDUL */}
                  <div className="theme-card rounded-2xl border theme-border shadow-sm p-5 sm:p-6">
                    <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-2">
                      Judul Pengumuman{" "}
                      <span className="text-[var(--color-danger)]">*</span>
                    </label>

                    <div className="relative">
                      <Megaphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />

                      <input
                        type="text"
                        value={form.judul}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            judul: e.target.value,
                          })
                        }
                        placeholder="Contoh: Libur Akhir Semester Ganjil"
                        className={`
                          theme-input
                          w-full pl-10 pr-4 py-3
                          rounded-xl border
                          text-sm
                          outline-none
                          transition-all
                          ${
                            errors.judul
                              ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
                              : "focus:border-[var(--color-primary)]"
                          }
                        `}
                      />
                    </div>

                    {errors.judul && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[var(--color-danger)]">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.judul}
                      </p>
                    )}
                  </div>

                  {/* KONTEN */}
                  <div className="theme-card rounded-2xl border theme-border shadow-sm p-5 sm:p-6">
                    <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-2">
                      Konten Pengumuman{" "}
                      <span className="text-[var(--color-danger)]">*</span>
                    </label>

                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3.5 w-4 h-4 theme-text-muted" />

                      <textarea
                        rows={8}
                        value={form.konten}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            konten: e.target.value,
                          })
                        }
                        placeholder="Tulis isi pengumuman di sini..."
                        className={`
                          theme-input
                          w-full pl-10 pr-4 py-3
                          rounded-xl border
                          text-sm
                          outline-none
                          transition-all
                          resize-y
                          min-h-[180px]
                          ${
                            errors.konten
                              ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
                              : "focus:border-[var(--color-primary)]"
                          }
                        `}
                      />
                    </div>

                    {errors.konten && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[var(--color-danger)]">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.konten}
                      </p>
                    )}

                    <p className="mt-2 text-xs theme-text-muted">
                      {form.konten.length} karakter
                    </p>
                  </div>
                </div>

                {/* SIDEBAR FORM - 1/3 width */}
                <div className="lg:col-span-1 w-full min-w-0 space-y-5">
                  {/* KATEGORI */}
                  <div className="theme-card rounded-2xl border theme-border shadow-sm p-5 sm:p-6">
                    <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-2">
                      Kategori
                    </label>

                    <select
                      value={form.kategori}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          kategori: e.target.value,
                        })
                      }
                      className="
                        theme-input
                        w-full px-4 py-3
                        rounded-xl border
                        text-sm
                        outline-none
                        focus:border-[var(--color-primary)]
                        transition
                        cursor-pointer
                        appearance-none
                        bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394758B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')]
                        bg-[length:18px]
                        bg-[right_12px_center]
                        bg-no-repeat
                        pr-10
                      "
                    >
                      <option value="">Pilih Kategori</option>
                      <option value="Akademik">Akademik</option>
                      <option value="Kegiatan">Kegiatan</option>
                      <option value="PPDB">PPDB</option>
                      <option value="Lomba">Lomba</option>
                      <option value="Info">Info Sekolah</option>
                    </select>
                  </div>

                  {/* STATUS */}
                  <div className="theme-card rounded-2xl border theme-border shadow-sm p-5 sm:p-6">
                    <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-2">
                      Status
                    </label>

                    <div className="space-y-2">
                      {["draft", "published", "scheduled"].map((status) => (
                        <label
                          key={status}
                          className={`
                            flex items-center gap-3
                            p-3 rounded-xl border-2
                            cursor-pointer
                            transition-all
                            ${
                              form.status === status
                                ? "border-[var(--color-primary)] bg-[var(--color-sidebar-active)]"
                                : "theme-border theme-card theme-sidebar-hover"
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="status"
                            value={status}
                            checked={form.status === status}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                status: e.target.value,
                              })
                            }
                            className="
                              w-4 h-4
                              accent-[var(--color-primary)]
                              focus:ring-0
                            "
                          />

                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={
                                form.status === status
                                  ? "text-[var(--color-primary)]"
                                  : "theme-text-muted"
                              }
                            >
                              {getStatusIcon(status)}
                            </span>

                            <span
                              className={`
                                text-sm font-medium
                                ${
                                  form.status === status
                                    ? "theme-text"
                                    : "theme-text-secondary"
                                }
                              `}
                            >
                              {getStatusLabel(status)}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* TANGGAL (jika scheduled) */}
                  {form.status === "scheduled" && (
                    <div className="theme-card rounded-2xl border theme-border shadow-sm p-5 sm:p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-2">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 theme-text-muted" />
                          Waktu Terbit
                          <span className="text-[var(--color-danger)]">
                            *
                          </span>
                        </span>
                      </label>

                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />

                        <input
                          type="datetime-local"
                          value={form.tanggal}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              tanggal: e.target.value,
                            })
                          }
                          className={`
                            theme-input
                            w-full pl-10 pr-4 py-3
                            rounded-xl border
                            text-sm
                            outline-none
                            transition-all
                            ${
                              errors.tanggal
                                ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
                                : "focus:border-[var(--color-primary)]"
                            }
                          `}
                        />
                      </div>

                      {errors.tanggal && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[var(--color-danger)]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.tanggal}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="w-full min-w-0 mt-6 pt-6 border-t theme-border flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="
                    inline-flex items-center justify-center gap-2
                    w-full sm:w-auto
                    px-6 py-3
                    rounded-xl
                    border theme-border
                    theme-card
                    theme-text-secondary
                    theme-sidebar-hover
                    text-sm font-semibold
                    transition-all
                  "
                >
                  <X className="w-4 h-4" />
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    inline-flex items-center justify-center gap-2
                    w-full sm:w-auto
                    px-8 py-3
                    rounded-xl
                    theme-primary
                    text-sm font-semibold
                    shadow-lg
                    transition-all
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    disabled:hover:translate-y-0
                    hover:-translate-y-0.5
                  "
                >
                  {loading ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>

                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Pengumuman
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* FOOTER */}
            <footer className="pt-4 border-t theme-border-soft text-center text-xs theme-text-muted">
              © 2026 SmartSchool CMS • Pengumuman
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}