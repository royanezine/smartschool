"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";
import RichTextEditor from "../../../../components/cms/RichTextEditor";
import { apiFetch } from "../../../../../lib/api";

import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Globe2,
  Eye,
  X,
  RefreshCw,
} from "lucide-react";

export default function EditPageCms() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [active, setActive] = useState("pages");
  const [collapsed, setCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    judul: "",
    konten: "",
    status: "draft",
  });

  const [originalPage, setOriginalPage] = useState(null);

  // ============================================================
  // FETCH DETAIL
  // Backend belum menyediakan GET /halaman/:id
  // Jadi kita ambil semua halaman lalu cari berdasarkan ID.
  // ============================================================

  const fetchPage = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const result = await apiFetch("/api/v1/cms/halaman");

      const responseData = result?.data;

      let pages = [];

      if (Array.isArray(responseData)) {
        pages = responseData;
      } else if (Array.isArray(responseData?.data)) {
        pages = responseData.data;
      }

      const foundPage = pages.find(
        (page) => String(page?.id) === String(id)
      );

      if (!foundPage) {
        throw new Error("Halaman yang ingin diedit tidak ditemukan.");
      }

      setOriginalPage(foundPage);

      setForm({
        judul: foundPage?.judul || "",
        konten: foundPage?.konten || "",
        status: foundPage?.status || "draft",
      });
    } catch (err) {
      console.error("Gagal mengambil detail halaman:", err);

      setError(
        err?.message ||
          "Gagal mengambil data halaman dari server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
  }, [id]);

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const judul = form.judul.trim();

    if (!judul) {
      setError("Judul halaman wajib diisi.");
      return;
    }

    if (judul.length < 3) {
      setError("Judul halaman minimal 3 karakter.");
      return;
    }

    if (!id) {
      setError("ID halaman tidak ditemukan.");
      return;
    }

    try {
      setSaving(true);

      await apiFetch(`/api/v1/cms/halaman/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          judul,
          konten: form.konten || "",
          status: form.status,
        }),
      });

      setSuccess("Perubahan halaman berhasil disimpan.");

      // Beri sedikit waktu agar success message terlihat
      setTimeout(() => {
        router.push(`/cmsAdmin/pages/${id}`);
      }, 700);
    } catch (err) {
      console.error("Gagal memperbarui halaman:", err);

      setError(
        err?.message ||
          "Gagal memperbarui halaman. Silakan coba lagi."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen w-full bg-[#f6f8fc]">
        <Sidebar
          active={active}
          setActive={setActive}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            title="Edit Halaman"
            user={{
              name: "CMS Admin",
              email: "cms@smartschool.com",
              avatar: "CA",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>

              <h2 className="text-sm font-bold text-slate-800">
                Memuat halaman...
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Mengambil data halaman dari server.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <div className="flex min-h-screen w-full bg-[#f6f8fc]">
      {/* SIDEBAR */}

      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* MAIN */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* HEADER */}

        <Header
          title="Edit Halaman"
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
        />

        {/* CONTENT */}

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-3 py-4 sm:px-5 sm:py-6 md:px-7 lg:px-9 xl:px-10">
            <div className="mx-auto w-full max-w-[1500px]">

              {/* ==================================================
                  TOP NAVIGATION
              ================================================== */}

              <div className="mb-6">
                <Link
                  href="/cmsAdmin/pages"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Halaman
                </Link>
              </div>

              {/* ==================================================
                  TITLE
              ================================================== */}

              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      Edit Halaman
                    </h1>

                    <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                      Perbarui informasi dan konten halaman website sekolah.
                    </p>
                  </div>
                </div>

               {originalPage?.slug && (
  <a
    href={`/website/${originalPage.slug}`}
    target="_blank"
    rel="noreferrer"
    className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
  >
    <Eye className="h-4 w-4" />
    Preview
  </a>
)}
              </div>

              {/* ==================================================
                  ALERT ERROR
              ================================================== */}

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-red-800">
                      Terjadi kesalahan
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-red-600">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="text-red-400 transition hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* ==================================================
                  SUCCESS
              ================================================== */}

              {success && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-emerald-800">
                      Berhasil
                    </h3>

                    <p className="mt-1 text-xs text-emerald-600">
                      {success}
                    </p>
                  </div>
                </div>
              )}

              {/* ==================================================
                  FORM
              ================================================== */}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">

                  {/* ==================================================
                      LEFT
                  ================================================== */}

                  <div className="min-w-0 space-y-6">

                    {/* TITLE + CONTENT */}

                    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                      <div className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/70 px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileText className="h-4 w-4" />
                          </div>

                          <div>
                            <h2 className="text-sm font-bold text-slate-800">
                              Informasi Halaman
                            </h2>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                              Tentukan judul dan isi halaman.
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
                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          </label>

                          <input
                            id="judul"
                            type="text"
                            value={form.judul}
                            onChange={(e) =>
                              handleChange(
                                "judul",
                                e.target.value
                              )
                            }
                            placeholder="Contoh: Tentang Sekolah"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                          />

                          <p className="mt-2 text-[11px] text-slate-400">
                            Minimal 3 karakter.
                          </p>
                        </div>

                        {/* CONTENT */}

                        <div>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <label className="block text-sm font-semibold text-slate-700">
                              Konten Halaman
                            </label>

                            <span className="text-[10px] font-medium text-slate-400">
                              Rich Text
                            </span>
                          </div>

                          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10">
                            <RichTextEditor
                              value={form.konten}
                              onChange={(value) =>
                                handleChange(
                                  "konten",
                                  value
                                )
                              }
                            />
                          </div>

                          <p className="mt-2 text-[11px] leading-5 text-slate-400">
                            Gunakan editor untuk membuat judul,
                            paragraf, daftar, link, dan format
                            konten lainnya.
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* SLUG INFORMATION */}

                    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                          <Globe2 className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-slate-800">
                            URL Halaman
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            Slug dikelola oleh backend CMS dan
                            tidak perlu diubah secara manual.
                          </p>

                          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                            <div className="flex items-center gap-2 px-4 py-3">
                              <Globe2 className="h-4 w-4 shrink-0 text-blue-500" />

                              <span className="break-all text-sm font-medium text-slate-600">
                                /{originalPage?.slug || "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* ==================================================
                      RIGHT SIDEBAR
                  ================================================== */}

                  <div className="min-w-0 space-y-6">

                    {/* STATUS */}

                    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                      <div className="border-b border-slate-100 px-5 py-4">
                        <h2 className="text-sm font-bold text-slate-800">
                          Status Publikasi
                        </h2>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Tentukan status halaman website.
                        </p>
                      </div>

                      <div className="p-5">
                        <label
                          htmlFor="status"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
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
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none shadow-sm transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                        >
                          <option value="draft">
                            Draft
                          </option>

                          <option value="dipublikasikan">
                            Dipublikasikan
                          </option>

                          <option value="aktif">
                            Aktif
                          </option>
                        </select>
                      </div>
                    </section>

                    {/* PAGE INFORMATION */}

                    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                      <div className="border-b border-slate-100 px-5 py-4">
                        <h2 className="text-sm font-bold text-slate-800">
                          Informasi
                        </h2>
                      </div>

                      <div className="space-y-4 p-5">

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            ID Halaman
                          </p>

                          <p className="mt-1 break-all text-xs text-slate-600">
                            {originalPage?.id || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Slug
                          </p>

                          <p className="mt-1 break-all text-xs text-slate-600">
                            {originalPage?.slug || "-"}
                          </p>
                        </div>

                        {originalPage?.dibuatPada && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Dibuat
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              {new Date(
                                originalPage.dibuatPada
                              ).toLocaleString("id-ID", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>
                          </div>
                        )}

                        {originalPage?.diperbaruiPada && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Terakhir diperbarui
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              {new Date(
                                originalPage.diperbaruiPada
                              ).toLocaleString("id-ID", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* SAVE */}

                    <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                          <Save className="h-4 w-4" />
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-800">
                            Simpan Perubahan
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Pastikan judul, konten, dan status
                            halaman sudah sesuai.
                          </p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={saving}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Simpan Perubahan
                          </>
                        )}
                      </button>

                      <Link
                        href="/cmsAdmin/pages"
                        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Batal
                      </Link>
                    </section>
                  </div>
                </div>
              </form>

              {/* FOOTER */}

              <footer className="py-7 text-center">
                <p className="text-[11px] text-slate-400">
                  © 2026 SmartSchool • CMS Management
                </p>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}