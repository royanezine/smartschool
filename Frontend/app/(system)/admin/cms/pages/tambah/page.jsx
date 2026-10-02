"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  FileText,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Globe,
  Layout,
  Type,
  Eye,
  Loader2,
  Send,
  Info,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Sidebar from "../../../../../components/Sidebar";
import Header from "../../../../../components/Header";
import RichTextEditor from "../../../../../components/cms/RichTextEditor";
import { apiFetch } from "../../../../../../lib/api";

/* ============================================================
   VALIDATION
============================================================ */

const pageSchema = z.object({
  judul: z
    .string()
    .trim()
    .min(3, "Judul minimal 3 karakter")
    .max(150, "Judul maksimal 150 karakter"),

  konten: z.string().optional(),

  status: z.enum(["draft", "dipublikasikan"]),
});

/* ============================================================
   PAGE
============================================================ */

export default function CreatePagePage() {
  const router = useRouter();

  const [active, setActive] = useState("pages");
  const [collapsed, setCollapsed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [content, setContent] = useState("");

  /* ==========================================================
     FORM
  ========================================================== */

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(pageSchema),

    defaultValues: {
      judul: "",
      konten: "",
      status: "draft",
    },
  });

  const judulValue = watch("judul");
  const statusValue = watch("status");

  const isPublished = statusValue === "dipublikasikan";

  /* ==========================================================
     CONTENT
  ========================================================== */

  const handleContentChange = (html) => {
    setContent(html || "");

    setValue("konten", html || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  /* ==========================================================
     CONTENT LENGTH
  ========================================================== */

  const getContentLength = () => {
    if (!content) return 0;

    if (typeof window === "undefined") return 0;

    const temp = document.createElement("div");
    temp.innerHTML = content;

    return (temp.textContent || temp.innerText || "")
      .replace(/\s+/g, " ")
      .trim().length;
  };

  const contentLength = getContentLength();

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setSubmitError("");
      setSuccessMessage("");

      const payload = {
        judul: data.judul.trim(),
        konten: data.konten || "",
        status: data.status,
      };

      const result = await apiFetch("/api/cms/halaman", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!result) {
        throw new Error("Gagal menyimpan halaman.");
      }

      setSuccessMessage("Halaman berhasil dibuat.");

      setTimeout(() => {
        router.push("/cmsAdmin/pages");
        router.refresh();
      }, 700);
    } catch (error) {
      setSubmitError(
        error?.message || "Terjadi kesalahan saat membuat halaman."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     FIELD ERROR
  ========================================================== */

  const FieldError = ({ message }) => {
    if (!message) return null;

    return (
      <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-[var(--color-danger)]">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{message}</span>
      </p>
    );
  };

  /* ==========================================================
     RETURN
  ========================================================== */

  return (
    <div className="theme-page flex min-h-screen w-full">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="flex min-w-0 flex-1 flex-col lg:ml-0">
        <Header
          title="Tambah Halaman Statis"
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
        />

        <main className="theme-page min-h-screen w-full">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1450px]">

              {/* ==================================================
                  TOP NAVIGATION
              ================================================== */}

              <div className="mb-6 flex flex-col gap-4 sm:mb-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
                  <Link
                    href="/cmsAdmin"
                    className="theme-text-muted transition hover:text-[var(--color-primary)]"
                  >
                    Dashboard
                  </Link>

                  <span className="theme-text-placeholder">/</span>

                  <Link
                    href="/cmsAdmin/pages"
                    className="theme-text-muted transition hover:text-[var(--color-primary)]"
                  >
                    Halaman Statis
                  </Link>

                  <span className="theme-text-placeholder">/</span>

                  <span className="theme-text font-semibold">
                    Tambah Halaman
                  </span>
                </div>

                <Link
                  href="/cmsAdmin/pages"
                  className="
                    theme-card theme-border theme-text-secondary
                    inline-flex w-fit items-center gap-2 rounded-xl
                    border px-4 py-2.5 text-sm font-semibold shadow-sm
                    transition
                    hover:border-[var(--color-primary)]
                    hover:bg-[var(--color-sidebar-active)]
                    hover:text-[var(--color-primary)]
                  "
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
                </Link>
              </div>

              {/* ==================================================
                  SUCCESS
              ================================================== */}

              {successMessage && (
                <div className="theme-success mb-5 flex items-start gap-3 rounded-xl border px-4 py-3.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <p className="text-sm font-semibold">
                      Berhasil
                    </p>

                    <p className="mt-0.5 text-xs opacity-90">
                      {successMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* ==================================================
                  ERROR
              ================================================== */}

              {submitError && (
                <div className="theme-danger mb-5 flex items-start gap-3 rounded-xl border px-4 py-3.5">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      Gagal menyimpan halaman
                    </p>

                    <p className="mt-1 text-xs leading-5 opacity-90">
                      {submitError}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSubmitError("")}
                    className="opacity-70 transition hover:opacity-100"
                    aria-label="Tutup pesan error"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* ==================================================
                  HEADER CARD
              ================================================== */}

              <section className="theme-card theme-border mb-6 overflow-hidden rounded-2xl border shadow-sm">
                <div className="theme-border border-b px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex min-w-0 items-center gap-4">
                      <div className="theme-info flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                        <FileText className="h-6 w-6" />
                      </div>

                      <div className="min-w-0">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]">
                          CMS
                        </p>

                        <h1 className="theme-text text-xl font-bold tracking-tight sm:text-2xl">
                          Tambah Halaman Statis
                        </h1>

                        <p className="theme-text-secondary mt-1 text-sm">
                          Buat halaman informasi baru untuk website sekolah.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`inline-flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 ${
                        isPublished
                          ? "theme-success"
                          : "theme-warning"
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isPublished
                            ? "bg-[var(--color-success)]"
                            : "bg-[var(--color-warning)]"
                        }`}
                      />

                      <div>
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                          Status
                        </p>

                        <p className="text-xs font-bold">
                          {isPublished
                            ? "Dipublikasikan"
                            : "Draft"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ==================================================
                  FORM
              ================================================== */}

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">

                  {/* =================================================
                      LEFT CONTENT
                  ================================================= */}

                  <div className="min-w-0 space-y-6">

                    {/* =================================================
                        INFORMASI DASAR
                    ================================================= */}

                    <section className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">

                      <div className="theme-card-soft theme-border border-b px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-3">

                          <div className="theme-info flex h-10 w-10 items-center justify-center rounded-xl">
                            <Type className="h-5 w-5" />
                          </div>

                          <div>
                            <h2 className="theme-text text-sm font-bold sm:text-base">
                              Informasi Halaman
                            </h2>

                            <p className="theme-text-secondary mt-0.5 text-xs">
                              Tentukan judul dan status halaman.
                            </p>
                          </div>

                        </div>
                      </div>

                      <div className="space-y-6 p-5 sm:p-6">

                        {/* JUDUL */}

                        <div>
                          <label
                            htmlFor="judul"
                            className="theme-text-secondary mb-2 block text-sm font-semibold"
                          >
                            Judul Halaman
                            <span className="ml-1 text-[var(--color-danger)]">
                              *
                            </span>
                          </label>

                          <input
                            id="judul"
                            type="text"
                            autoComplete="off"
                            placeholder="Contoh: Akademik"
                            {...register("judul")}
                            className={`theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                              errors.judul
                                ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
                                : "focus:border-[var(--color-primary)]"
                            }`}
                          />

                          <div className="mt-2 flex items-start justify-between gap-3">
                            <div>
                              <FieldError
                                message={errors.judul?.message}
                              />

                              {!errors.judul && (
                                <p className="theme-text-muted text-xs">
                                  Gunakan judul yang singkat dan mudah dipahami.
                                </p>
                              )}
                            </div>

                            <span className="theme-text-muted shrink-0 text-xs">
                              {(judulValue || "").length}/150
                            </span>
                          </div>
                        </div>

                        {/* STATUS */}

                        <div>
                          <label
                            htmlFor="status"
                            className="theme-text-secondary mb-2 block text-sm font-semibold"
                          >
                            Status Halaman
                            <span className="ml-1 text-[var(--color-danger)]">
                              *
                            </span>
                          </label>

                          <select
                            id="status"
                            {...register("status")}
                            className="theme-input w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition focus:border-[var(--color-primary)]"
                          >
                            <option value="draft">
                              Draft
                            </option>

                            <option value="dipublikasikan">
                              Dipublikasikan
                            </option>
                          </select>

                          <p className="theme-text-muted mt-2 text-xs leading-5">
                            Pilih draft jika halaman belum siap ditampilkan.
                          </p>

                          <FieldError
                            message={errors.status?.message}
                          />
                        </div>
                      </div>
                    </section>

                    {/* =================================================
                        KONTEN
                    ================================================= */}

                    <section className="theme-card theme-border min-w-0 overflow-hidden rounded-2xl border shadow-sm">

                      <div className="theme-card-soft theme-border border-b px-5 py-4 sm:px-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <div className="flex items-center gap-3">

                            <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                              <FileText className="h-5 w-5" />
                            </div>

                            <div>
                              <h2 className="theme-text text-sm font-bold sm:text-base">
                                Konten Halaman
                              </h2>

                              <p className="theme-text-secondary mt-0.5 text-xs">
                                Isi informasi yang akan ditampilkan pada website.
                              </p>
                            </div>

                          </div>

                          <div className="theme-card theme-border theme-text-secondary flex w-fit items-center gap-2 rounded-lg border px-3 py-2">
                            <FileText className="theme-text-muted h-3.5 w-3.5" />

                            <span className="text-xs font-medium">
                              {contentLength.toLocaleString("id-ID")} karakter
                            </span>
                          </div>

                        </div>
                      </div>

                      <div className="min-w-0 p-5 sm:p-6">

                        <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                          Isi Konten
                        </label>

                        <div className="theme-card theme-border min-w-0 overflow-hidden rounded-xl border transition focus-within:border-[var(--color-primary)]">
                          <RichTextEditor
                            value={content}
                            onChange={handleContentChange}
                          />
                        </div>

                        <FieldError
                          message={errors.konten?.message}
                        />

                        <div className="theme-text-muted mt-3 flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">
                          <span>
                            Gunakan editor untuk mengatur format konten.
                          </span>

                          <span className="theme-text-secondary font-medium">
                            {contentLength.toLocaleString("id-ID")} karakter
                          </span>
                        </div>

                      </div>
                    </section>
                  </div>

                  {/* =================================================
                      RIGHT SIDEBAR
                  ================================================= */}

                  <aside className="min-w-0 space-y-6">

                    {/* =================================================
                        PUBLIKASI
                    ================================================= */}

                    <section className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">

                      <div className="theme-card-soft theme-border border-b px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div className="theme-primary flex h-9 w-9 items-center justify-center rounded-lg">
                            <Globe className="h-4 w-4" />
                          </div>

                          <div>
                            <h2 className="theme-text text-sm font-bold">
                              Publikasi
                            </h2>

                            <p className="theme-text-secondary text-xs">
                              Pengaturan halaman
                            </p>
                          </div>

                        </div>
                      </div>

                      <div className="p-5">

                        <div
                          className={`rounded-xl border p-4 ${
                            isPublished
                              ? "theme-success"
                              : "theme-warning"
                          }`}
                        >
                          <div className="flex items-start gap-3">

                            <div
                              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                                isPublished
                                  ? "bg-[var(--color-success)]"
                                  : "bg-[var(--color-warning)]"
                              }`}
                            />

                            <div>
                              <p className="theme-text text-sm font-semibold">
                                {isPublished
                                  ? "Siap dipublikasikan"
                                  : "Masih dalam draft"}
                              </p>

                              <p className="theme-text-secondary mt-1 text-xs leading-5">
                                {isPublished
                                  ? "Halaman akan tersedia pada website sekolah."
                                  : "Halaman belum ditampilkan sebagai halaman publik."}
                              </p>
                            </div>

                          </div>
                        </div>

                        <div className="mt-5 hidden xl:block">

                          <button
                            type="submit"
                            disabled={loading}
                            className="theme-primary inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Menyimpan...
                              </>
                            ) : (
                              <>
                                {isPublished ? (
                                  <Send className="h-4 w-4" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}

                                {isPublished
                                  ? "Publikasikan"
                                  : "Simpan Draft"}
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              router.push("/cmsAdmin/pages")
                            }
                            disabled={loading}
                            className="theme-card theme-border theme-text-secondary mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition hover:bg-[var(--color-header-hover)] disabled:opacity-50"
                          >
                            <ArrowLeft className="h-4 w-4" />
                            Batal
                          </button>

                        </div>
                      </div>
                    </section>

                    {/* =================================================
                        PREVIEW
                    ================================================= */}

                    <section className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">

                      <div className="theme-card-soft theme-border border-b px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg">
                            <Eye className="h-4 w-4" />
                          </div>

                          <div>
                            <h2 className="theme-text text-sm font-bold">
                              Ringkasan
                            </h2>

                            <p className="theme-text-secondary text-xs">
                              Informasi halaman
                            </p>
                          </div>

                        </div>
                      </div>

                      <div className="p-5">

                        <div className="space-y-4">

                          <div>
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Judul
                            </p>

                            <p className="theme-text mt-1.5 break-words text-sm font-semibold">
                              {judulValue || "Belum ada judul"}
                            </p>
                          </div>

                          <div className="theme-border-soft h-px" />

                          <div>
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Status
                            </p>

                            <div className="mt-2 flex items-center gap-2">

                              <span
                                className={`h-2 w-2 rounded-full ${
                                  isPublished
                                    ? "bg-[var(--color-success)]"
                                    : "bg-[var(--color-warning)]"
                                }`}
                              />

                              <span className="theme-text text-sm font-semibold">
                                {isPublished
                                  ? "Dipublikasikan"
                                  : "Draft"}
                              </span>

                            </div>
                          </div>

                          <div className="theme-border-soft h-px" />

                          <div>
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Isi Konten
                            </p>

                            <p className="theme-text mt-1.5 text-sm font-semibold">
                              {contentLength.toLocaleString("id-ID")} karakter
                            </p>
                          </div>

                        </div>
                      </div>
                    </section>

                    {/* =================================================
                        URL
                    ================================================= */}

                    <section className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">

                      <div className="theme-card-soft theme-border border-b px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div className="theme-card-soft theme-text-secondary flex h-9 w-9 items-center justify-center rounded-lg">
                            <Globe className="h-4 w-4" />
                          </div>

                          <div>
                            <h2 className="theme-text text-sm font-bold">
                              URL Halaman
                            </h2>

                            <p className="theme-text-secondary text-xs">
                              Dibuat otomatis
                            </p>
                          </div>

                        </div>
                      </div>

                      <div className="p-5">

                        <div className="theme-card-soft theme-border rounded-xl border p-4">

                          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                            Slug
                          </p>

                          <p className="theme-text mt-1.5 text-sm font-semibold">
                            Otomatis
                          </p>

                          <p className="theme-text-secondary mt-1 text-xs leading-5">
                            Backend membuat slug berdasarkan judul halaman.
                          </p>

                        </div>

                        <div className="theme-info mt-3 flex items-start gap-2 rounded-xl border p-3">
                          <Info className="mt-0.5 h-4 w-4 shrink-0" />

                          <p className="text-xs leading-5">
                            Kamu tidak perlu memasukkan slug secara manual.
                          </p>
                        </div>

                      </div>
                    </section>

                    {/* =================================================
                        INFORMASI
                    ================================================= */}

                    <section className="theme-card theme-border rounded-2xl border p-5 shadow-sm">

                      <div className="flex items-start gap-3">

                        <div className="theme-card-soft theme-text-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                          <Info className="h-4 w-4" />
                        </div>

                        <div>
                          <h3 className="theme-text text-sm font-bold">
                            Informasi
                          </h3>

                          <div className="theme-text-secondary mt-2 space-y-2 text-xs leading-5">
                            <p>
                              Judul minimal 3 karakter.
                            </p>

                            <p>
                              Slug dibuat otomatis oleh backend.
                            </p>

                            <p>
                              Status tersedia sebagai draft atau dipublikasikan.
                            </p>

                            <p>
                              Pastikan konten sudah benar sebelum dipublikasikan.
                            </p>
                          </div>
                        </div>

                      </div>
                    </section>
                  </aside>
                </div>

                {/* ==================================================
                    ACTION BAR
                ================================================== */}

                <div className="mt-6">
                  <div className="theme-card theme-border rounded-2xl border p-4 shadow-sm sm:p-5">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="theme-text-muted hidden items-center gap-2 text-xs md:flex">
                        <Layout className="h-4 w-4" />

                        <span>
                          Data akan dikirim langsung ke CMS backend.
                        </span>
                      </div>

                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">

                        <button
                          type="button"
                          onClick={() =>
                            router.push("/cmsAdmin/pages")
                          }
                          disabled={loading}
                          className="theme-card theme-border theme-text-secondary inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition hover:bg-[var(--color-header-hover)] disabled:opacity-50 sm:w-auto"
                        >
                          <X className="h-4 w-4" />
                          Batal
                        </button>

                        <button
                          type="submit"
                          disabled={loading}
                          className="theme-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              {isPublished ? (
                                <Send className="h-4 w-4" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}

                              {isPublished
                                ? "Publikasikan"
                                : "Simpan Draft"}
                            </>
                          )}
                        </button>

                      </div>
                    </div>
                  </div>
                </div>
              </form>

              {/* ==================================================
                  FOOTER
              ================================================== */}

              <footer className="py-8 text-center">
                <p className="theme-text-muted text-xs">
                  © 2026 SmartSchool · CMS Management
                </p>
              </footer>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}