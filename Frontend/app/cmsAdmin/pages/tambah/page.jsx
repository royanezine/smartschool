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

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import RichTextEditor from "../../../components/cms/RichTextEditor";
import { apiFetch } from "../../../../lib/api";

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

      const result = await apiFetch("/api/v1/cms/halaman", {
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
      <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-red-600">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{message}</span>
      </p>
    );
  };

  /* ==========================================================
     RETURN
  ========================================================== */

  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC]">
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

        <main className="min-h-screen w-full">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1450px]">

              {/* ==================================================
                  TOP NAVIGATION
              ================================================== */}

              <div className="mb-6 flex flex-col gap-4 sm:mb-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
                  <Link
                    href="/cmsAdmin"
                    className="font-medium text-slate-400 transition hover:text-[#2563EB]"
                  >
                    Dashboard
                  </Link>

                  <span className="text-slate-300">/</span>

                  <Link
                    href="/cmsAdmin/pages"
                    className="font-medium text-slate-400 transition hover:text-[#2563EB]"
                  >
                    Halaman Statis
                  </Link>

                  <span className="text-slate-300">/</span>

                  <span className="font-semibold text-slate-700">
                    Tambah Halaman
                  </span>
                </div>

                <Link
                  href="/cmsAdmin/pages"
                  className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#2563EB]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
                </Link>
              </div>

              {/* ==================================================
                  SUCCESS
              ================================================== */}

              {successMessage && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                  <div>
                    <p className="text-sm font-semibold text-emerald-800">
                      Berhasil
                    </p>

                    <p className="mt-0.5 text-xs text-emerald-700">
                      {successMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* ==================================================
                  ERROR
              ================================================== */}

              {submitError && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-red-800">
                      Gagal menyimpan halaman
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-700">
                      {submitError}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSubmitError("")}
                    className="text-red-400 transition hover:text-red-600"
                    aria-label="Tutup pesan error"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* ==================================================
                  HEADER CARD
              ================================================== */}

              <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                        <FileText className="h-6 w-6" />
                      </div>

                      <div className="min-w-0">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
                          CMS
                        </p>

                        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                          Tambah Halaman Statis
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                          Buat halaman informasi baru untuk website sekolah.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`inline-flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 ${
                        isPublished
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-amber-200 bg-amber-50"
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isPublished
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                      />

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Status
                        </p>

                        <p
                          className={`text-xs font-bold ${
                            isPublished
                              ? "text-emerald-700"
                              : "text-amber-700"
                          }`}
                        >
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

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                      <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                            <Type className="h-5 w-5" />
                          </div>

                          <div>
                            <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                              Informasi Halaman
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500">
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
                            className="mb-2 block text-sm font-semibold text-slate-700"
                          >
                            Judul Halaman
                            <span className="ml-1 text-red-500">*</span>
                          </label>

                          <input
                            id="judul"
                            type="text"
                            autoComplete="off"
                            placeholder="Contoh: Akademik"
                            {...register("judul")}
                            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                              errors.judul
                                ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                                : "border-slate-200 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10"
                            }`}
                          />

                          <div className="mt-2 flex items-start justify-between gap-3">
                            <div>
                              <FieldError
                                message={errors.judul?.message}
                              />

                              {!errors.judul && (
                                <p className="text-xs text-slate-400">
                                  Gunakan judul yang singkat dan mudah dipahami.
                                </p>
                              )}
                            </div>

                            <span className="shrink-0 text-xs text-slate-400">
                              {(judulValue || "").length}/150
                            </span>
                          </div>
                        </div>

                        {/* STATUS */}

                        <div>
                          <label
                            htmlFor="status"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                          >
                            Status Halaman
                            <span className="ml-1 text-red-500">*</span>
                          </label>

                          <select
                            id="status"
                            {...register("status")}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10"
                          >
                            <option value="draft">
                              Draft
                            </option>

                            <option value="dipublikasikan">
                              Dipublikasikan
                            </option>
                          </select>

                          <p className="mt-2 text-xs leading-5 text-slate-400">
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

                    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                      <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                              <FileText className="h-5 w-5" />
                            </div>

                            <div>
                              <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                                Konten Halaman
                              </h2>

                              <p className="mt-0.5 text-xs text-slate-500">
                                Isi informasi yang akan ditampilkan pada website.
                              </p>
                            </div>

                          </div>

                          <div className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                            <FileText className="h-3.5 w-3.5 text-slate-400" />

                            <span className="text-xs font-medium text-slate-500">
                              {contentLength.toLocaleString("id-ID")} karakter
                            </span>
                          </div>

                        </div>
                      </div>

                      <div className="min-w-0 p-5 sm:p-6">

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Isi Konten
                        </label>

                        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-[#2563EB] focus-within:ring-4 focus-within:ring-blue-500/10">
                          <RichTextEditor
                            value={content}
                            onChange={handleContentChange}
                          />
                        </div>

                        <FieldError
                          message={errors.konten?.message}
                        />

                        <div className="mt-3 flex flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                          <span>
                            Gunakan editor untuk mengatur format konten.
                          </span>

                          <span className="font-medium text-slate-500">
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

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                      <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F172A] text-white">
                            <Globe className="h-4 w-4" />
                          </div>

                          <div>
                            <h2 className="text-sm font-bold text-slate-900">
                              Publikasi
                            </h2>

                            <p className="text-xs text-slate-500">
                              Pengaturan halaman
                            </p>
                          </div>

                        </div>
                      </div>

                      <div className="p-5">

                        <div
                          className={`rounded-xl border p-4 ${
                            isPublished
                              ? "border-emerald-200 bg-emerald-50/60"
                              : "border-amber-200 bg-amber-50/60"
                          }`}
                        >
                          <div className="flex items-start gap-3">

                            <div
                              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                                isPublished
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />

                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {isPublished
                                  ? "Siap dipublikasikan"
                                  : "Masih dalam draft"}
                              </p>

                              <p className="mt-1 text-xs leading-5 text-slate-500">
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
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
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
                            className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
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

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                      <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                            <Eye className="h-4 w-4" />
                          </div>

                          <div>
                            <h2 className="text-sm font-bold text-slate-900">
                              Ringkasan
                            </h2>

                            <p className="text-xs text-slate-500">
                              Informasi halaman
                            </p>
                          </div>

                        </div>
                      </div>

                      <div className="p-5">

                        <div className="space-y-4">

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Judul
                            </p>

                            <p className="mt-1.5 break-words text-sm font-semibold text-slate-700">
                              {judulValue || "Belum ada judul"}
                            </p>
                          </div>

                          <div className="h-px bg-slate-100" />

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Status
                            </p>

                            <div className="mt-2 flex items-center gap-2">

                              <span
                                className={`h-2 w-2 rounded-full ${
                                  isPublished
                                    ? "bg-emerald-500"
                                    : "bg-amber-500"
                                }`}
                              />

                              <span className="text-sm font-semibold text-slate-700">
                                {isPublished
                                  ? "Dipublikasikan"
                                  : "Draft"}
                              </span>

                            </div>
                          </div>

                          <div className="h-px bg-slate-100" />

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Isi Konten
                            </p>

                            <p className="mt-1.5 text-sm font-semibold text-slate-700">
                              {contentLength.toLocaleString("id-ID")} karakter
                            </p>
                          </div>

                        </div>
                      </div>
                    </section>

                    {/* =================================================
                        URL
                    ================================================= */}

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                      <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Globe className="h-4 w-4" />
                          </div>

                          <div>
                            <h2 className="text-sm font-bold text-slate-900">
                              URL Halaman
                            </h2>

                            <p className="text-xs text-slate-500">
                              Dibuat otomatis
                            </p>
                          </div>

                        </div>
                      </div>

                      <div className="p-5">

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Slug
                          </p>

                          <p className="mt-1.5 text-sm font-semibold text-slate-700">
                            Otomatis
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Backend membuat slug berdasarkan judul halaman.
                          </p>

                        </div>

                        <div className="mt-3 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />

                          <p className="text-xs leading-5 text-blue-700">
                            Kamu tidak perlu memasukkan slug secara manual.
                          </p>
                        </div>

                      </div>
                    </section>

                    {/* =================================================
                        INFORMASI
                    ================================================= */}

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                      <div className="flex items-start gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          <Info className="h-4 w-4" />
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            Informasi
                          </h3>

                          <div className="mt-2 space-y-2 text-xs leading-5 text-slate-500">
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
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="hidden items-center gap-2 text-xs text-slate-400 md:flex">
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
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 sm:w-auto"
                        >
                          <X className="h-4 w-4" />
                          Batal
                        </button>

                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
                <p className="text-xs text-slate-400">
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