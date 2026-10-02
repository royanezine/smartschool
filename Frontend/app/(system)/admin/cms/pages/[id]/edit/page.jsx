"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import RichTextEditor from "@/app/components/cms/RichTextEditor";
import { apiFetch } from "../../../../../../../lib/api";

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

      const result = await apiFetch("/api/cms/halaman");

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

      await apiFetch(`/api/cms/halaman/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          judul,
          konten: form.konten || "",
          status: form.status,
        }),
      });

      setSuccess("Perubahan halaman berhasil disimpan.");

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
      <div className="theme-page flex min-h-screen w-full">
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
              <div className="theme-info mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>

              <h2 className="theme-text text-sm font-bold">
                Memuat halaman...
              </h2>

              <p className="theme-text-muted mt-1 text-xs">
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
    <div className="theme-page flex min-h-screen w-full">
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
                  className="theme-text-muted inline-flex items-center gap-2 text-sm font-semibold transition hover:text-[var(--color-primary)]"
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
                  <div className="theme-info flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h1 className="theme-text truncate text-2xl font-bold tracking-tight sm:text-3xl">
                      Edit Halaman
                    </h1>

                    <p className="theme-text-secondary mt-0.5 text-xs sm:text-sm">
                      Perbarui informasi dan konten halaman website sekolah.
                    </p>
                  </div>
                </div>

                {originalPage?.slug && (
                  <a
                    href={`/website/${originalPage.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="theme-card theme-border theme-text-secondary inline-flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:border-[var(--color-primary)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-primary)]"
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
                <div className="theme-danger mb-5 flex items-start gap-3 rounded-2xl border p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-danger)_15%,transparent)]">
                    <AlertCircle className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold">
                      Terjadi kesalahan
                    </h3>

                    <p className="mt-1 text-xs leading-5">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="transition hover:opacity-70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* ==================================================
                  SUCCESS
              ================================================== */}

              {success && (
                <div className="theme-success mb-5 flex items-start gap-3 rounded-2xl border p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-success)_15%,transparent)]">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold">
                      Berhasil
                    </h3>

                    <p className="mt-1 text-xs">
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

                    <section className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                      <div className="theme-card-soft theme-border border-b px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="theme-info flex h-9 w-9 items-center justify-center rounded-xl">
                            <FileText className="h-4 w-4" />
                          </div>

                          <div>
                            <h2 className="theme-text text-sm font-bold">
                              Informasi Halaman
                            </h2>

                            <p className="theme-text-muted mt-0.5 text-[11px]">
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
                            value={form.judul}
                            onChange={(e) =>
                              handleChange(
                                "judul",
                                e.target.value
                              )
                            }
                            placeholder="Contoh: Tentang Sekolah"
                            className="theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none shadow-sm transition focus:border-[var(--color-primary)]"
                          />

                          <p className="theme-text-muted mt-2 text-[11px]">
                            Minimal 3 karakter.
                          </p>
                        </div>

                        {/* CONTENT */}

                        <div>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <label className="theme-text-secondary block text-sm font-semibold">
                              Konten Halaman
                            </label>

                            <span className="theme-text-muted text-[10px] font-medium">
                              Rich Text
                            </span>
                          </div>

                          <div className="theme-input overflow-hidden rounded-xl border focus-within:border-[var(--color-primary)]">
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

                          <p className="theme-text-muted mt-2 text-[11px] leading-5">
                            Gunakan editor untuk membuat judul,
                            paragraf, daftar, link, dan format
                            konten lainnya.
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* SLUG INFORMATION */}

                    <section className="theme-card theme-border rounded-2xl border p-5 shadow-sm sm:p-6">
                      <div className="flex items-start gap-3">
                        <div className="theme-card-soft theme-text-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                          <Globe2 className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="theme-text text-sm font-bold">
                            URL Halaman
                          </h3>

                          <p className="theme-text-muted mt-1 text-xs leading-5">
                            Slug dikelola oleh backend CMS dan
                            tidak perlu diubah secara manual.
                          </p>

                          <div className="theme-card-soft theme-border mt-4 overflow-hidden rounded-xl border">
                            <div className="flex items-center gap-2 px-4 py-3">
                              <Globe2
                                className="h-4 w-4 shrink-0"
                                style={{
                                  color: "var(--color-primary)",
                                }}
                              />

                              <span className="theme-text-secondary break-all text-sm font-medium">
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

                    <section className="theme-card theme-border rounded-2xl border shadow-sm">
                      <div className="theme-border border-b px-5 py-4">
                        <h2 className="theme-text text-sm font-bold">
                          Status Publikasi
                        </h2>

                        <p className="theme-text-muted mt-0.5 text-[11px]">
                          Tentukan status halaman website.
                        </p>
                      </div>

                      <div className="p-5">
                        <label
                          htmlFor="status"
                          className="theme-text-secondary mb-2 block text-sm font-semibold"
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
                          className="theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none shadow-sm transition focus:border-[var(--color-primary)]"
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

                    <section className="theme-card theme-border rounded-2xl border shadow-sm">
                      <div className="theme-border border-b px-5 py-4">
                        <h2 className="theme-text text-sm font-bold">
                          Informasi
                        </h2>
                      </div>

                      <div className="space-y-4 p-5">

                        <div>
                          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                            ID Halaman
                          </p>

                          <p className="theme-text-secondary mt-1 break-all text-xs">
                            {originalPage?.id || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                            Slug
                          </p>

                          <p className="theme-text-secondary mt-1 break-all text-xs">
                            {originalPage?.slug || "-"}
                          </p>
                        </div>

                        {originalPage?.dibuatPada && (
                          <div>
                            <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                              Dibuat
                            </p>

                            <p className="theme-text-secondary mt-1 text-xs">
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
                            <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                              Terakhir diperbarui
                            </p>

                            <p className="theme-text-secondary mt-1 text-xs">
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

                    <section className="theme-card theme-border rounded-2xl border p-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                          <Save className="h-4 w-4" />
                        </div>

                        <div>
                          <h3 className="theme-text text-sm font-bold">
                            Simpan Perubahan
                          </h3>

                          <p className="theme-text-muted mt-1 text-xs leading-5">
                            Pastikan judul, konten, dan status
                            halaman sudah sesuai.
                          </p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={saving}
                        className="theme-primary mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
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
                        className="theme-card theme-border theme-text-secondary mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition theme-sidebar-hover"
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
                <p className="theme-text-muted text-[11px]">
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