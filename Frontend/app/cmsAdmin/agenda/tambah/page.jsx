"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
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
      alert("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
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
      activeClass:
        "border-amber-300 bg-amber-50 text-amber-700",
      iconClass: "bg-amber-100 text-amber-600",
    },
    {
      value: "published",
      label: "Publikasikan",
      description: "Tampilkan sekarang",
      icon: CheckCircle2,
      activeClass:
        "border-emerald-300 bg-emerald-50 text-emerald-700",
      iconClass: "bg-emerald-100 text-emerald-600",
    },
    {
      value: "scheduled",
      label: "Jadwalkan",
      description: "Terbit sesuai waktu",
      icon: Timer,
      activeClass:
        "border-sky-300 bg-sky-50 text-sky-700",
      iconClass: "bg-sky-100 text-sky-600",
    },
  ];

  // =====================================================
  // INPUT CLASS
  // =====================================================
  const inputClass = `
    w-full
    min-w-0
    rounded-xl
    border
    border-slate-200
    bg-white
    px-4
    py-3
    text-sm
    font-medium
    text-slate-800
    placeholder:text-slate-400
    outline-none
    transition-all
    duration-200
    hover:border-slate-300
    focus:border-sky-500
    focus:ring-4
    focus:ring-sky-500/10
  `;

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* =====================================================
          SIDEBAR
          TIDAK DIUBAH / TIDAK DIPOTONG
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
          flex-1 + min-w-0 agar mengikuti sidebar
      ====================================================== */}
      <main
        className="
          flex-1
          min-w-0
          overflow-x-hidden
          overflow-y-auto
          bg-gradient-to-br
          from-slate-50
          via-slate-50
          to-sky-50/40
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
            Tidak menggunakan max-w sehingga saat zoom out
            area halaman dapat melebar mengikuti viewport.
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
                    flex
                    items-center
                    gap-2
                    whitespace-nowrap
                    text-xs
                    font-medium
                    text-slate-500
                    sm:text-sm
                  "
                >
                  <li className="shrink-0">
                    <a
                      href="/cmsAdmin"
                      className="transition-colors hover:text-sky-600"
                    >
                      Dashboard
                    </a>
                  </li>

                  <li className="text-slate-300">/</li>

                  <li className="shrink-0">
                    <a
                      href="/cmsAdmin/agenda"
                      className="transition-colors hover:text-sky-600"
                    >
                      Agenda
                    </a>
                  </li>

                  <li className="text-slate-300">/</li>

                  <li className="shrink-0 font-semibold text-sky-600">
                    Tambah Baru
                  </li>
                </ol>
              </nav>

              <button
                type="button"
                onClick={() => router.back()}
                className="
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
                  text-slate-600
                  transition-all
                  hover:bg-white
                  hover:text-sky-600
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
                relative
                w-full
                min-w-0
                overflow-hidden
                rounded-2xl
                border
                border-slate-200/70
                bg-white
                shadow-sm
              "
            >
              {/* decorative background */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-sky-100/50 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-cyan-100/40 blur-3xl" />

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
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-sky-200
                      bg-sky-50
                      shadow-sm
                    "
                  >
                    <Calendar className="h-6 w-6 text-sky-600" />
                  </div>

                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          border
                          border-sky-200
                          bg-sky-50
                          px-2.5
                          py-1
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-sky-700
                        "
                      >
                        <Sparkles className="h-3 w-3" />
                        Agenda
                      </span>
                    </div>

                    <h1
                      className="
                        text-xl
                        font-bold
                        tracking-tight
                        text-slate-900
                        sm:text-2xl
                        lg:text-3xl
                      "
                    >
                      Tambah Agenda Baru
                    </h1>

                    <p
                      className="
                        mt-1.5
                        max-w-2xl
                        text-xs
                        leading-relaxed
                        text-slate-500
                        sm:text-sm
                      "
                    >
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
                w-full
                min-w-0
                overflow-hidden
                rounded-2xl
                border
                border-slate-200/70
                bg-white
                shadow-sm
              "
            >
              {/* =================================================
                  FORM HEADER
              ================================================== */}
              <div
                className="
                  flex
                  items-center
                  gap-3
                  border-b
                  border-slate-100
                  bg-slate-50/70
                  px-5
                  py-4
                  sm:px-6
                  lg:px-8
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-sky-50
                    text-sky-600
                  "
                >
                  <FileText className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                    Informasi Agenda
                  </h2>

                  <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
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
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Judul Agenda
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Calendar
                      className="
                        pointer-events-none
                        absolute
                        left-3.5
                        top-1/2
                        h-4
                        w-4
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

                    <input
                      id="judul"
                      type="text"
                      required
                      value={form.judul}
                      onChange={(e) =>
                        handleChange("judul", e.target.value)
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
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Kategori
                    </label>

                    <div className="relative">
                      <Tag
                        className="
                          pointer-events-none
                          absolute
                          left-3.5
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-slate-400
                        "
                      />

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
                        <option value="Rapat">Rapat</option>
                        <option value="Kegiatan">
                          Kegiatan
                        </option>
                        <option value="PPDB">PPDB</option>
                      </select>
                    </div>
                  </div>

                  {/* LOKASI */}
                  <div className="min-w-0">
                    <label
                      htmlFor="lokasi"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Lokasi
                    </label>

                    <div className="relative">
                      <MapPin
                        className="
                          pointer-events-none
                          absolute
                          left-3.5
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-slate-400
                        "
                      />

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
                      className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700"
                    >
                      <Clock className="h-4 w-4 text-sky-600" />
                      Tanggal Mulai
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Calendar
                        className="
                          pointer-events-none
                          absolute
                          left-3.5
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-slate-400
                        "
                      />

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
                      className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700"
                    >
                      <Clock className="h-4 w-4 text-sky-600" />
                      Tanggal Selesai
                    </label>

                    <div className="relative">
                      <Calendar
                        className="
                          pointer-events-none
                          absolute
                          left-3.5
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-slate-400
                        "
                      />

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
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Deskripsi Agenda
                  </label>

                  <div className="relative">
                    <FileText
                      className="
                        pointer-events-none
                        absolute
                        left-3.5
                        top-3.5
                        h-4
                        w-4
                        text-slate-400
                      "
                    />

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
                    <label className="block text-sm font-semibold text-slate-700">
                      Status Agenda
                    </label>

                    <p className="mt-1 text-xs text-slate-400">
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
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
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
                                  : "bg-slate-100 text-slate-500"
                              }
                            `}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold sm:text-sm">
                              {option.label}
                            </p>

                            <p className="mt-0.5 truncate text-[10px] text-slate-400 sm:text-xs">
                              {option.description}
                            </p>
                          </div>

                          {selected && (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-current" />
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
                  flex
                  w-full
                  min-w-0
                  flex-col-reverse
                  gap-3
                  border-t
                  border-slate-100
                  bg-slate-50/60
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
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-slate-600
                    shadow-sm
                    transition-all
                    duration-200
                    hover:border-slate-300
                    hover:bg-slate-50
                    hover:text-slate-800
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
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-sky-600
                    px-7
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-sky-600/20
                    transition-all
                    duration-200
                    hover:bg-sky-700
                    hover:shadow-xl
                    hover:shadow-sky-600/25
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
                flex
                w-full
                min-w-0
                items-start
                gap-3
                rounded-xl
                border
                border-slate-200/70
                bg-white
                p-4
                shadow-sm
              "
            >
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-slate-100
                  text-slate-500
                "
              >
                <FileText className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700">
                  Informasi
                </p>

                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400 sm:text-xs">
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