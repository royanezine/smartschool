// app/cmsAdmin/agenda/tambah/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import {
  Save,
  X,
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  Clock,
  Tag,
  CheckCircle2,
  FileEdit,
  Timer,
  Sparkles,
} from "lucide-react";

export default function TambahAgendaPage() {
  const router = useRouter();

  // =====================================================
  // SIDEBAR
  // =====================================================
  const [active, setActive] = useState("agenda");
  const [collapsed, setCollapsed] = useState(false);

  // =====================================================
  // FORM
  // =====================================================
  const [form, setForm] = useState({
    judul: "",
    kategori: "",
    lokasi: "",
    deskripsi: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    status: "draft",
  });

  const [loading, setLoading] = useState(false);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =====================================================
  // SUBMIT
  // =====================================================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.judul.trim()) {
      alert("Judul agenda wajib diisi.");
      return;
    }

    if (!form.tanggalMulai) {
      alert("Tanggal mulai wajib diisi.");
      return;
    }

    if (
      form.tanggalSelesai &&
      form.tanggalMulai > form.tanggalSelesai
    ) {
      alert(
        "Tanggal selesai tidak boleh lebih awal dari tanggal mulai."
      );
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      alert("Agenda berhasil disimpan.");

      router.push("/cmsAdmin/agenda");
    }, 1200);
  };

  // =====================================================
  // STATUS CONFIG
  // =====================================================
  const statusOptions = [
    {
      value: "draft",
      label: "Draft",
      description: "Simpan sebagai draft",
      icon: FileEdit,
      activeClass: "theme-warning",
      iconClass: "theme-warning",
    },
    {
      value: "published",
      label: "Publikasikan",
      description: "Tampilkan sekarang",
      icon: CheckCircle2,
      activeClass: "theme-success",
      iconClass: "theme-success",
    },
    {
      value: "scheduled",
      label: "Jadwalkan",
      description: "Terbit sesuai waktu",
      icon: Timer,
      activeClass: "theme-info",
      iconClass: "theme-info",
    },
  ];

  // =====================================================
  // INPUT CLASS
  // =====================================================
  const inputClass =
    "theme-input w-full min-w-0 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm outline-none transition-all duration-200 focus:border-[var(--color-primary)]";

  return (
    <div className="theme-page flex min-h-screen w-full">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <aside className="shrink-0">
        <Sidebar
          active={active}
          setActive={setActive}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </aside>

      {/* =====================================================
          MAIN
      ====================================================== */}
      <main
        className="
          theme-page
          flex-1
          min-w-0
          overflow-x-hidden
          overflow-y-auto
          transition-all
          duration-300
        "
      >
        {/* HEADER */}
        <Header
          title="Tambah Agenda"
          user={{ name: "Admin" }}
        />

        {/* =====================================================
            CONTENT
        ====================================================== */}
        <div
          className="
            w-full
            min-w-0
            px-3
            py-5
            sm:px-5
            sm:py-6
            md:px-7
            md:py-8
            lg:px-9
            xl:px-12
            2xl:px-16
          "
        >
          <div className="w-full min-w-0 space-y-6">

            {/* =================================================
                BREADCRUMB
            ================================================== */}
            <div
              className="
                flex
                w-full
                min-w-0
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <nav className="min-w-0 overflow-x-auto">
                <ol
                  className="
                    theme-text-muted
                    flex
                    items-center
                    gap-2
                    whitespace-nowrap
                    text-xs
                    font-medium
                    sm:text-sm
                  "
                >
                  <li className="shrink-0">
                    <a
                      href="/cmsAdmin"
                      className="transition-opacity hover:opacity-70"
                    >
                      Dashboard
                    </a>
                  </li>

                  <li className="theme-text-placeholder">/</li>

                  <li className="shrink-0">
                    <a
                      href="/cmsAdmin/agenda"
                      className="transition-opacity hover:opacity-70"
                    >
                      Agenda
                    </a>
                  </li>

                  <li className="theme-text-placeholder">/</li>

                  <li
                    className="shrink-0 font-semibold"
                    style={{
                      color: "var(--color-primary)",
                    }}
                  >
                    Tambah Baru
                  </li>
                </ol>
              </nav>

              <button
                type="button"
                onClick={() => router.back()}
                className="
                  theme-text-secondary
                  inline-flex
                  w-fit
                  shrink-0
                  items-center
                  gap-2
                  rounded-lg
                  px-2
                  py-1.5
                  text-xs
                  font-semibold
                  transition
                  hover:opacity-70
                  sm:text-sm
                "
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </button>
            </div>

            {/* =================================================
                PAGE INTRO
            ================================================== */}
            <section
              className="
                theme-card
                theme-border
                relative
                w-full
                min-w-0
                overflow-hidden
                rounded-2xl
                border
                shadow-sm
              "
            >
              {/* Decorative background */}
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-20
                  -top-20
                  h-48
                  w-48
                  rounded-full
                  blur-3xl
                  opacity-20
                "
                style={{
                  background:
                    "var(--color-primary)",
                }}
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-20
                  left-1/3
                  h-40
                  w-40
                  rounded-full
                  blur-3xl
                  opacity-10
                "
                style={{
                  background:
                    "var(--color-info)",
                }}
              />

              <div
                className="
                  relative
                  flex
                  w-full
                  min-w-0
                  flex-col
                  gap-5
                  p-5
                  sm:p-6
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                  lg:p-7
                "
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="theme-info flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm">
                    <Calendar className="h-6 w-6" />
                  </div>

                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="theme-info inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                        <Sparkles className="h-3 w-3" />
                        Agenda
                      </span>
                    </div>

                    <h1 className="theme-text text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                      Tambah Agenda Baru
                    </h1>

                    <p className="theme-text-muted mt-1.5 max-w-2xl text-xs leading-relaxed sm:text-sm">
                      Buat dan kelola agenda kegiatan sekolah
                      dengan informasi yang lengkap dan terstruktur.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                FORM
            ================================================== */}
            <form
              onSubmit={handleSubmit}
              className="
                theme-card
                theme-border
                w-full
                min-w-0
                overflow-hidden
                rounded-2xl
                border
                shadow-sm
              "
            >
              {/* =================================================
                  FORM HEADER
              ================================================== */}
              <div
                className="
                  theme-card-soft
                  theme-border-soft
                  flex
                  items-center
                  gap-3
                  border-b
                  px-5
                  py-4
                  sm:px-6
                  lg:px-8
                "
              >
                <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                  <FileText className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <h2 className="theme-text text-sm font-bold sm:text-base">
                    Informasi Agenda
                  </h2>

                  <p className="theme-text-muted mt-0.5 text-[11px] sm:text-xs">
                    Isi informasi berikut untuk membuat agenda.
                  </p>
                </div>
              </div>

              {/* =================================================
                  FORM BODY
              ================================================== */}
              <div
                className="
                  w-full
                  min-w-0
                  space-y-7
                  p-5
                  sm:p-6
                  lg:p-8
                "
              >
                {/* =================================================
                    JUDUL
                ================================================== */}
                <div className="w-full min-w-0">
                  <label
                    htmlFor="judul"
                    className="theme-text-secondary mb-2 block text-sm font-semibold"
                  >
                    Judul Agenda
                    <span
                      className="ml-1"
                      style={{
                        color: "var(--color-danger)",
                      }}
                    >
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <Calendar className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />

                    <input
                      id="judul"
                      type="text"
                      required
                      value={form.judul}
                      onChange={(e) =>
                        handleChange(
                          "judul",
                          e.target.value
                        )
                      }
                      placeholder="Contoh: Rapat Evaluasi Semester"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                {/* =================================================
                    GRID 2 COLUMN
                ================================================== */}
                <div
                  className="
                    grid
                    w-full
                    min-w-0
                    grid-cols-1
                    gap-5
                    lg:grid-cols-2
                    lg:gap-6
                  "
                >
                  {/* KATEGORI */}
                  <div className="min-w-0">
                    <label
                      htmlFor="kategori"
                      className="theme-text-secondary mb-2 block text-sm font-semibold"
                    >
                      Kategori
                    </label>

                    <div className="relative">
                      <Tag className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />

                      <select
                        id="kategori"
                        value={form.kategori}
                        onChange={(e) =>
                          handleChange(
                            "kategori",
                            e.target.value
                          )
                        }
                        className={`${inputClass} cursor-pointer appearance-none pl-10`}
                      >
                        <option value="">
                          Pilih Kategori
                        </option>
                        <option value="Rapat">
                          Rapat
                        </option>
                        <option value="Kegiatan">
                          Kegiatan
                        </option>
                        <option value="PPDB">
                          PPDB
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* LOKASI */}
                  <div className="min-w-0">
                    <label
                      htmlFor="lokasi"
                      className="theme-text-secondary mb-2 block text-sm font-semibold"
                    >
                      Lokasi
                    </label>

                    <div className="relative">
                      <MapPin className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />

                      <input
                        id="lokasi"
                        type="text"
                        value={form.lokasi}
                        onChange={(e) =>
                          handleChange(
                            "lokasi",
                            e.target.value
                          )
                        }
                        placeholder="Contoh: Aula Utama"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  {/* TANGGAL MULAI */}
                  <div className="min-w-0">
                    <label
                      htmlFor="tanggalMulai"
                      className="theme-text-secondary mb-2 flex items-center gap-1.5 text-sm font-semibold"
                    >
                      <Clock
                        className="h-4 w-4"
                        style={{
                          color:
                            "var(--color-primary)",
                        }}
                      />

                      Tanggal Mulai

                      <span
                        style={{
                          color:
                            "var(--color-danger)",
                        }}
                      >
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <Calendar className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />

                      <input
                        id="tanggalMulai"
                        type="datetime-local"
                        required
                        value={form.tanggalMulai}
                        onChange={(e) =>
                          handleChange(
                            "tanggalMulai",
                            e.target.value
                          )
                        }
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  {/* TANGGAL SELESAI */}
                  <div className="min-w-0">
                    <label
                      htmlFor="tanggalSelesai"
                      className="theme-text-secondary mb-2 flex items-center gap-1.5 text-sm font-semibold"
                    >
                      <Clock
                        className="h-4 w-4"
                        style={{
                          color:
                            "var(--color-primary)",
                        }}
                      />

                      Tanggal Selesai
                    </label>

                    <div className="relative">
                      <Calendar className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />

                      <input
                        id="tanggalSelesai"
                        type="datetime-local"
                        value={form.tanggalSelesai}
                        onChange={(e) =>
                          handleChange(
                            "tanggalSelesai",
                            e.target.value
                          )
                        }
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>

                {/* =================================================
                    DESKRIPSI
                ================================================== */}
                <div className="w-full min-w-0">
                  <label
                    htmlFor="deskripsi"
                    className="theme-text-secondary mb-2 block text-sm font-semibold"
                  >
                    Deskripsi Agenda
                  </label>

                  <div className="relative">
                    <FileText className="theme-text-placeholder pointer-events-none absolute left-3.5 top-3.5 h-4 w-4" />

                    <textarea
                      id="deskripsi"
                      rows={6}
                      value={form.deskripsi}
                      onChange={(e) =>
                        handleChange(
                          "deskripsi",
                          e.target.value
                        )
                      }
                      placeholder="Tuliskan informasi lengkap mengenai agenda..."
                      className={`${inputClass} resize-y pl-10`}
                    />
                  </div>
                </div>

                {/* =================================================
                    STATUS
                ================================================== */}
                <div className="w-full min-w-0">
                  <div className="mb-3">
                    <label className="theme-text-secondary block text-sm font-semibold">
                      Status Agenda
                    </label>

                    <p className="theme-text-muted mt-1 text-xs">
                      Tentukan bagaimana agenda akan dipublikasikan.
                    </p>
                  </div>

                  <div
                    className="
                      grid
                      w-full
                      min-w-0
                      grid-cols-1
                      gap-3
                      sm:grid-cols-3
                    "
                  >
                    {statusOptions.map((option) => {
                      const Icon = option.icon;
                      const selected =
                        form.status === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            handleChange(
                              "status",
                              option.value
                            )
                          }
                          className={`
                            group
                            relative
                            flex
                            min-w-0
                            items-center
                            gap-3
                            rounded-xl
                            border
                            p-3.5
                            text-left
                            transition-all
                            duration-200
                            ${
                              selected
                                ? option.activeClass
                                : "theme-card theme-border theme-text-secondary hover:opacity-80"
                            }
                          `}
                        >
                          <div
                            className={`
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              ${
                                selected
                                  ? option.iconClass
                                  : "theme-card-soft theme-text-muted"
                              }
                            `}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold sm:text-sm">
                              {option.label}
                            </p>

                            <p className="theme-text-muted mt-0.5 truncate text-[10px] sm:text-xs">
                              {option.description}
                            </p>
                          </div>

                          {selected && (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* =================================================
                  ACTION FOOTER
              ================================================== */}
              <div
                className="
                  theme-card-soft
                  theme-border-soft
                  flex
                  w-full
                  min-w-0
                  flex-col-reverse
                  gap-3
                  border-t
                  p-5
                  sm:flex-row
                  sm:justify-end
                  sm:p-6
                  lg:px-8
                "
              >
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="
                    theme-card
                    theme-border
                    theme-text-secondary
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    shadow-sm
                    transition-all
                    duration-200
                    hover:opacity-80
                    sm:w-auto
                  "
                >
                  <X className="h-4 w-4" />
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    theme-primary
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    px-7
                    py-3
                    text-sm
                    font-semibold
                    shadow-lg
                    transition-all
                    duration-200
                    hover:opacity-90
                    active:scale-[0.98]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    sm:w-auto
                  "
                >
                  {loading ? (
                    <>
                      <span
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-white/30
                          border-t-white
                        "
                      />

                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Simpan Agenda
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* =================================================
                INFO FOOTER
            ================================================== */}
            <div
              className="
                theme-card
                theme-border
                flex
                w-full
                min-w-0
                items-start
                gap-3
                rounded-xl
                border
                p-4
                shadow-sm
              "
            >
              <div className="theme-card-soft theme-text-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <FileText className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="theme-text-secondary text-xs font-semibold">
                  Informasi
                </p>

                <p className="theme-text-muted mt-0.5 text-[11px] leading-relaxed sm:text-xs">
                  Pastikan informasi agenda sudah sesuai sebelum
                  menyimpannya.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}