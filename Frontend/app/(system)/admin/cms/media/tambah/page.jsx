"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../../../components/Sidebar";
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
    <div className="theme-page flex min-h-screen w-full">
      {/* =====================================================
          SIDEBAR
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
                    theme-border
                    theme-card
                    px-3.5
                    py-2.5
                    text-sm
                    font-semibold
                    theme-text-secondary
                    shadow-sm
                    transition-all
                    hover:-translate-x-0.5
                    theme-table-hover
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
                  theme-border
                  theme-card
                  shadow-sm
                "
              >
                {/* Decorative */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-24
                    h-64
                    w-64
                    rounded-full
                    bg-[var(--color-primary)]
                    opacity-[0.08]
                    blur-3xl
                  "
                />

                <div
                  className="
                    pointer-events-none
                    absolute
                    -bottom-28
                    left-1/3
                    h-64
                    w-64
                    rounded-full
                    bg-[var(--color-info)]
                    opacity-[0.06]
                    blur-3xl
                  "
                />

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
                        theme-info
                        sm:h-14
                        sm:w-14
                      "
                    >
                      <Upload className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>

                    {/* TEXT */}
                    <div className="min-w-0">
                      <p
                        className="
                          mb-1
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.18em]
                          theme-text-muted
                          sm:text-xs
                        "
                      >
                        CMS Management
                      </p>

                      <h1
                        className="
                          text-2xl
                          font-bold
                          tracking-tight
                          theme-text
                          sm:text-3xl
                          lg:text-4xl
                        "
                      >
                        Upload Media
                      </h1>

                      <p
                        className="
                          mt-1.5
                          max-w-2xl
                          text-xs
                          leading-relaxed
                          theme-text-secondary
                          sm:text-sm
                        "
                      >
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
                    theme-border
                    theme-card
                    shadow-sm
                  "
                >
                  {/* FORM HEADER */}
                  <div
                    className="
                      border-b
                      theme-border-soft
                      px-5
                      py-4
                      sm:px-6
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          theme-info
                        "
                      >
                        <FileUp className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <h2
                          className="
                            text-sm
                            font-bold
                            theme-text
                            sm:text-base
                          "
                        >
                          Pilih File
                        </h2>

                        <p className="mt-0.5 text-xs theme-text-muted">
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
                        theme-border
                        theme-card-soft
                        p-6
                        transition-all
                        hover:border-[var(--color-primary)]
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
                        className="
                          flex
                          cursor-pointer
                          flex-col
                          items-center
                          justify-center
                          text-center
                        "
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
                            theme-card
                            theme-primary-outline
                            shadow-sm
                            ring-1
                            ring-[var(--color-border)]
                            transition-all
                            hover:shadow-md
                          "
                        >
                          <Upload className="h-7 w-7" />
                        </div>

                        <h3
                          className="
                            text-sm
                            font-bold
                            theme-text
                            sm:text-base
                          "
                        >
                          Klik untuk memilih file
                        </h3>

                        <p
                          className="
                            mt-1
                            text-xs
                            theme-text-muted
                            sm:text-sm
                          "
                        >
                          atau pilih file dari perangkat Anda
                        </p>

                        <span
                          className="
                            mt-4
                            inline-flex
                            items-center
                            rounded-full
                            theme-card
                            px-3
                            py-1.5
                            text-[10px]
                            font-semibold
                            theme-text-muted
                            shadow-sm
                            ring-1
                            ring-[var(--color-border)]
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
                          theme-border
                          theme-info
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
                              theme-card
                              shadow-sm
                            "
                          >
                            <FileIcon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p
                              title={file.name}
                              className="
                                truncate
                                text-sm
                                font-semibold
                                theme-text
                              "
                            >
                              {file.name}
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className="
                                  text-[10px]
                                  font-medium
                                  theme-text-muted
                                "
                              >
                                {formatSize(file.size)}
                              </span>

                              <span
                                className="
                                  h-1
                                  w-1
                                  rounded-full
                                  bg-[var(--color-border)]
                                "
                              />

                              <span
                                className="
                                  text-[10px]
                                  font-medium
                                  theme-text
                                "
                              >
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
                            theme-text-muted
                            transition
                            hover:bg-[var(--color-danger-background)]
                            hover:text-[var(--color-danger)]
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
                      {/* CANCEL */}
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
                          theme-border
                          theme-card
                          px-5
                          py-3
                          text-sm
                          font-semibold
                          theme-text-secondary
                          transition-all
                          theme-table-hover
                          sm:w-auto
                        "
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Batal
                      </button>

                      {/* SUBMIT */}
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
                          theme-primary
                          px-5
                          py-3
                          text-sm
                          font-semibold
                          shadow-lg
                          transition-all
                          hover:-translate-y-0.5
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

                  {/* PANDUAN */}
                  <div
                    className="
                      rounded-2xl
                      border
                      theme-border
                      theme-card
                      p-5
                      shadow-sm
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          theme-success
                        "
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold theme-text">
                          Panduan Upload
                        </h3>

                        <p className="text-[10px] theme-text-muted">
                          Informasi file
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">

                      <div className="flex gap-3">
                        <div
                          className="
                            mt-0.5
                            h-1.5
                            w-1.5
                            shrink-0
                            rounded-full
                            bg-[var(--color-primary)]
                          "
                        />

                        <p
                          className="
                            text-xs
                            leading-relaxed
                            theme-text-secondary
                          "
                        >
                          Ukuran file maksimal{" "}
                          <span className="font-semibold theme-text">
                            5 MB
                          </span>
                          .
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <div
                          className="
                            mt-0.5
                            h-1.5
                            w-1.5
                            shrink-0
                            rounded-full
                            bg-[var(--color-primary)]
                          "
                        />

                        <p
                          className="
                            text-xs
                            leading-relaxed
                            theme-text-secondary
                          "
                        >
                          Gunakan nama file yang singkat dan mudah dikenali.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <div
                          className="
                            mt-0.5
                            h-1.5
                            w-1.5
                            shrink-0
                            rounded-full
                            bg-[var(--color-primary)]
                          "
                        />

                        <p
                          className="
                            text-xs
                            leading-relaxed
                            theme-text-secondary
                          "
                        >
                          Pastikan file yang dipilih sesuai dengan kebutuhan
                          website.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SUPPORTED FILE */}
                  <div
                    className="
                      mt-4
                      rounded-2xl
                      border
                      theme-border
                      theme-card
                      p-5
                      shadow-sm
                    "
                  >
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wider
                        theme-text-muted
                      "
                    >
                      File yang didukung
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2">

                      {/* IMAGE */}
                      <div className="rounded-xl theme-info p-3 text-center">
                        <ImageIcon className="mx-auto h-5 w-5" />

                        <p className="mt-1 text-[9px] font-semibold">
                          Gambar
                        </p>
                      </div>

                      {/* VIDEO */}
                      <div className="rounded-xl theme-card-soft p-3 text-center">
                        <Video
                          className="
                            mx-auto
                            h-5
                            w-5
                            text-[var(--color-primary)]
                          "
                        />

                        <p
                          className="
                            mt-1
                            text-[9px]
                            font-semibold
                            theme-text
                          "
                        >
                          Video
                        </p>
                      </div>

                      {/* PDF */}
                      <div className="rounded-xl theme-danger p-3 text-center">
                        <FileText className="mx-auto h-5 w-5" />

                        <p className="mt-1 text-[9px] font-semibold">
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
                <p
                  className="
                    text-[11px]
                    font-medium
                    theme-text-muted
                  "
                >
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