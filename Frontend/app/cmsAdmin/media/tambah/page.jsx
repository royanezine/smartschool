"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import {
  Upload,
  X,
  ArrowLeft,
  FileUp,
  CheckCircle2,
  Image as ImageIcon,
  FileText,
  Video,
} from "lucide-react";

export default function UploadMediaPage() {
  const router = useRouter();

  const [active, setActive] = useState("media");
  const [collapsed, setCollapsed] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];

    if (selected) {
      setFile(selected);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file) return;

    setLoading(true);

    setTimeout(() => {
      alert(`File "${file.name}" berhasil diupload (dummy)`);
      setLoading(false);
      router.push("/cmsAdmin/media");
    }, 1000);
  };

  const getFileIcon = () => {
    if (!file) return FileUp;

    if (file.type.startsWith("image/")) {
      return ImageIcon;
    }

    if (file.type.startsWith("video/")) {
      return Video;
    }

    if (file.type === "application/pdf") {
      return FileText;
    }

    return FileUp;
  };

  const FileIcon = getFileIcon();

  const formatSize = (size) => {
    if (!size) return "0 KB";

    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }

    return `${(size / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* =====================================================
          SIDEBAR
          Jangan diberi overflow-hidden / shrink
      ===================================================== */}
      <div className="shrink-0">
        <Sidebar
          active={active}
          setActive={setActive}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="min-w-0 flex-1">
        <div className="w-full min-w-0">
          <div className="w-full px-3 py-4 sm:px-5 sm:py-6 md:px-7 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1500px]">
              {/* =================================================
                  TOP BAR
              ================================================= */}
              <div className="mb-5 flex items-center">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-3.5
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-600
                    shadow-sm
                    transition-all
                    hover:-translate-x-0.5
                    hover:border-indigo-200
                    hover:bg-indigo-50
                    hover:text-indigo-600
                    hover:shadow-md
                  "
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Kembali</span>
                </button>
              </div>

              {/* =================================================
                  HEADER
              ================================================= */}
              <section
                className="
                  relative
                  mb-6
                  overflow-hidden
                  rounded-2xl
                  border
                  border-indigo-100
                  bg-gradient-to-br
                  from-slate-950
                  via-indigo-950
                  to-indigo-800
                  shadow-xl
                  shadow-indigo-900/10
                "
              >
                {/* Decorative */}
                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-400/15 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

                <div className="relative p-5 sm:p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    {/* ICON */}
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
                        border-white/10
                        bg-white/10
                        shadow-inner
                        backdrop-blur-md
                        sm:h-14
                        sm:w-14
                      "
                    >
                      <Upload className="h-6 w-6 text-white sm:h-7 sm:w-7" />
                    </div>

                    {/* TEXT */}
                    <div className="min-w-0">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-200 sm:text-xs">
                        CMS Management
                      </p>

                      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                        Upload Media
                      </h1>

                      <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-indigo-100 sm:text-sm">
                        Tambahkan gambar, video, PDF, dan file lainnya ke
                        media library website sekolah.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  CONTENT
              ================================================= */}
              <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                {/* =================================================
                    FORM
                ================================================= */}
                <form
                  onSubmit={handleSubmit}
                  className="
                    min-w-0
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                  "
                >
                  {/* FORM HEADER */}
                  <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <FileUp className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-slate-800 sm:text-base">
                          Pilih File
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Pilih file yang ingin ditambahkan
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FORM BODY */}
                  <div className="p-5 sm:p-6">
                    {/* UPLOAD AREA */}
                    <div
                      className="
                        relative
                        rounded-2xl
                        border-2
                        border-dashed
                        border-slate-200
                        bg-slate-50/60
                        p-6
                        transition-all
                        hover:border-indigo-300
                        hover:bg-indigo-50/30
                        sm:p-10
                      "
                    >
                      <input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      <label
                        htmlFor="file-upload"
                        className="flex cursor-pointer flex-col items-center justify-center text-center"
                      >
                        <div
                          className="
                            mb-4
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-2xl
                            bg-white
                            text-indigo-600
                            shadow-sm
                            ring-1
                            ring-slate-200
                            transition-all
                            group-hover:shadow-md
                          "
                        >
                          <Upload className="h-7 w-7" />
                        </div>

                        <h3 className="text-sm font-bold text-slate-700 sm:text-base">
                          Klik untuk memilih file
                        </h3>

                        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                          atau pilih file dari perangkat Anda
                        </p>

                        <span
                          className="
                            mt-4
                            inline-flex
                            items-center
                            rounded-full
                            bg-white
                            px-3
                            py-1.5
                            text-[10px]
                            font-semibold
                            text-slate-500
                            shadow-sm
                            ring-1
                            ring-slate-200
                          "
                        >
                          Maksimal ukuran 5 MB
                        </span>
                      </label>
                    </div>

                    {/* SELECTED FILE */}
                    {file && (
                      <div
                        className="
                          mt-5
                          flex
                          min-w-0
                          items-center
                          justify-between
                          gap-3
                          rounded-2xl
                          border
                          border-indigo-100
                          bg-indigo-50/50
                          p-3
                          sm:p-4
                        "
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className="
                              flex
                              h-11
                              w-11
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              bg-white
                              text-indigo-600
                              shadow-sm
                            "
                          >
                            <FileIcon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p
                              title={file.name}
                              className="truncate text-sm font-semibold text-slate-700"
                            >
                              {file.name}
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-[10px] font-medium text-slate-400">
                                {formatSize(file.size)}
                              </span>

                              <span className="h-1 w-1 rounded-full bg-slate-300" />

                              <span className="text-[10px] font-medium text-emerald-600">
                                File dipilih
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            text-slate-400
                            transition
                            hover:bg-rose-50
                            hover:text-rose-600
                          "
                          title="Hapus file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* ACTION */}
                    <div
                      className="
                        mt-6
                        flex
                        flex-col-reverse
                        gap-3
                        sm:flex-row
                        sm:justify-end
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
                          px-5
                          py-3
                          text-sm
                          font-semibold
                          text-slate-600
                          transition-all
                          hover:border-slate-300
                          hover:bg-slate-50
                          sm:w-auto
                        "
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={!file || loading}
                        className="
                          inline-flex
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-indigo-600
                          px-5
                          py-3
                          text-sm
                          font-semibold
                          text-white
                          shadow-lg
                          shadow-indigo-600/20
                          transition-all
                          hover:-translate-y-0.5
                          hover:bg-indigo-700
                          hover:shadow-xl
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                          disabled:hover:translate-y-0
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
                            Mengupload...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload Media
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                {/* =================================================
                    INFO PANEL
                ================================================= */}
                <aside className="min-w-0">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          Panduan Upload
                        </h3>

                        <p className="text-[10px] text-slate-400">
                          Informasi file
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">
                      <div className="flex gap-3">
                        <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />

                        <p className="text-xs leading-relaxed text-slate-500">
                          Ukuran file maksimal{" "}
                          <span className="font-semibold text-slate-700">
                            5 MB
                          </span>
                          .
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />

                        <p className="text-xs leading-relaxed text-slate-500">
                          Gunakan nama file yang singkat dan mudah dikenali.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />

                        <p className="text-xs leading-relaxed text-slate-500">
                          Pastikan file yang dipilih sesuai dengan kebutuhan
                          website.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SUPPORTED FILE */}
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      File yang didukung
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-indigo-50 p-3 text-center">
                        <ImageIcon className="mx-auto h-5 w-5 text-indigo-600" />
                        <p className="mt-1 text-[9px] font-semibold text-indigo-600">
                          Gambar
                        </p>
                      </div>

                      <div className="rounded-xl bg-violet-50 p-3 text-center">
                        <Video className="mx-auto h-5 w-5 text-violet-600" />
                        <p className="mt-1 text-[9px] font-semibold text-violet-600">
                          Video
                        </p>
                      </div>

                      <div className="rounded-xl bg-rose-50 p-3 text-center">
                        <FileText className="mx-auto h-5 w-5 text-rose-600" />
                        <p className="mt-1 text-[9px] font-semibold text-rose-600">
                          PDF
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}
              <footer className="py-8 text-center">
                <p className="text-[11px] font-medium text-slate-400">
                  © 2026 SmartSchool • CMS Media Management
                </p>
              </footer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}