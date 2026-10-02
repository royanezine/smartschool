"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  Tag,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Layers3,
  Check,
  X,
  Info,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { createKategoriAset } from "@/services/sarpras.service";

// ============================================================
// GLOBAL THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

// ============================================================
// PAGE
// ============================================================

export default function TambahKategoriPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nama: "",
    status: "aktif",
  });

  // ==========================================================
  // HANDLE CHANGE
  // ==========================================================

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (saved) {
      setSaved(false);
    }
  }

  // ==========================================================
  // SUBMIT
  // ==========================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const nama = form.nama.trim();

    if (!nama) {
      setError("Nama kategori wajib diisi.");
      return;
    }

    if (nama.length < 3) {
      setError("Nama kategori minimal 3 karakter.");
      return;
    }

    if (nama.length > 50) {
      setError("Nama kategori maksimal 50 karakter.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        nama,
        status: form.status,
      };

      await createKategoriAset(payload);

      setSaved(true);

      setTimeout(() => {
        router.push("/admin/sarpras/kategori");
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error("Gagal membuat kategori:", err);

      const message =
        err?.message ||
        err?.response?.data?.message ||
        "Gagal menyimpan kategori.";

      setError(message);
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // CANCEL
  // ==========================================================

  function handleCancel() {
    if (saving) return;

    router.push("/admin/sarpras/kategori");
  }

  // ==========================================================
  // STATUS
  // ==========================================================

  const isActive = form.status === "aktif";

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <div className="theme-page h-screen w-full overflow-hidden">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar
          active="sarpras"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      {/* ======================================================
          CONTENT AREA
      ====================================================== */}

      <div
        className={`flex h-screen min-w-0 flex-col overflow-hidden transition-[margin] duration-300 ${
          isCollapsed ? "lg:ml-[88px]" : "lg:ml-[260px]"
        }`}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="shrink-0">
          <Header
            toggleSidebar={() => setIsCollapsed(!isCollapsed)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        {/* ====================================================
            MAIN
        ==================================================== */}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 pb-10 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-7">
            <div className="mx-auto w-full max-w-[1280px]">

              {/* ==================================================
                  PAGE HEADER
              ================================================== */}

              <div className="mb-7">
                <Link
                  href="/admin/sarpras/kategori"
                  className={`theme-text-secondary group mb-5 inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] hover:text-[var(--color-primary)]`}
                >
                  <ArrowLeft
                    size={17}
                    className="transition-transform duration-200 group-hover:-translate-x-0.5"
                  />

                  Kembali ke Kategori Aset
                </Link>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />

                      <span className="theme-primary text-[11px] font-bold uppercase tracking-[0.16em]">
                        Sarana & Prasarana
                      </span>
                    </div>

                    <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                      Tambah Kategori Aset
                    </h1>

                    <p className="theme-text-secondary mt-1.5 max-w-2xl text-sm leading-6">
                      Tambahkan kategori baru untuk mengelompokkan barang
                      inventaris sekolah dengan lebih terstruktur.
                    </p>
                  </div>

                  {/* MODUL BADGE */}

                  <div
                    className={`theme-card ${themeDivider} ${themeSmallShadow} hidden shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 sm:flex`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} theme-primary`}
                    >
                      <Tag size={19} />
                    </div>

                    <div>
                      <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                        Modul
                      </p>

                      <p className="theme-text mt-0.5 text-sm font-semibold">
                        Kategori Aset
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================================================
                  ERROR ALERT
              ================================================== */}

              {error && (
                <div
                  className={`mb-5 flex items-start gap-3 rounded-2xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themeNeutralSurface} theme-danger ${themeSmallShadow}`}
                  >
                    <AlertCircle size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="theme-text text-sm font-bold">
                      Gagal menyimpan
                    </p>

                    <p className="theme-text-secondary mt-1 text-sm leading-5">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className={`theme-text-muted rounded-lg p-1.5 transition hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] hover:text-[var(--color-text)]`}
                  >
                    <X size={17} />
                  </button>
                </div>
              )}

              {/* ==================================================
                  SUCCESS ALERT
              ================================================== */}

              {saved && (
                <div
                  className={`mb-5 flex items-center gap-3 rounded-2xl border ${themeSuccessBorder} ${themeSuccessSurface} p-4`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themeSuccessSurface} theme-success ${themeSmallShadow}`}
                  >
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <p className="theme-success text-sm font-bold">
                      Kategori berhasil ditambahkan
                    </p>

                    <p className="theme-success mt-0.5 text-xs">
                      Mengalihkan ke daftar kategori...
                    </p>
                  </div>
                </div>
              )}

              {/* ==================================================
                  MAIN GRID
              ================================================== */}

              <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">

                {/* =================================================
                    LEFT - FORM
                ================================================= */}

                <form onSubmit={handleSubmit} className="min-w-0">
                  <div
                    className={`theme-card ${themeDivider} ${themeCardShadow} overflow-hidden rounded-3xl border`}
                  >
                    {/* FORM HEADER */}

                    <div
                      className={`border-b ${themeDivider} ${themeInfoSurface} px-5 py-5 sm:px-7`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                          >
                            <Tag size={20} strokeWidth={2} />
                          </div>

                          <div className="min-w-0">
                            <h2 className="theme-text text-sm font-bold">
                              Informasi Kategori
                            </h2>

                            <p className="theme-text-secondary mt-0.5 text-xs">
                              Lengkapi informasi kategori aset.
                            </p>
                          </div>
                        </div>

                        <span
                          className={`hidden rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} px-3 py-1.5 text-[10px] font-bold tracking-wide theme-primary sm:inline-flex`}
                        >
                          DATA MASTER
                        </span>
                      </div>
                    </div>

                    {/* FORM BODY */}

                    <div className="space-y-7 p-5 sm:p-7">

                      {/* NAMA KATEGORI */}

                      <section>
                        <div className="mb-5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />

                            <h3 className="theme-text text-sm font-bold">
                              Identitas Kategori
                            </h3>
                          </div>

                          <p className="theme-text-muted mt-1.5 text-xs">
                            Nama digunakan sebagai identitas kategori pada
                            data aset.
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor="nama"
                            className="theme-text-secondary mb-2 block text-sm font-semibold"
                          >
                            Nama Kategori
                            <span className="theme-danger ml-1">*</span>
                          </label>

                          <div className="relative">
                            <Tag
                              size={18}
                              className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                            />

                            <input
                              id="nama"
                              name="nama"
                              type="text"
                              value={form.nama}
                              onChange={handleChange}
                              maxLength={50}
                              disabled={saving}
                              placeholder="Contoh: Elektronik"
                              className={`theme-input h-12 w-full rounded-xl border px-11 pr-16 text-sm font-medium outline-none transition ${themeNeutralBorder} ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                            />

                            <span className="theme-text-muted pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-medium">
                              {form.nama.length}/50
                            </span>
                          </div>

                          <p className="theme-text-muted mt-2 text-xs">
                            Gunakan nama yang singkat, jelas, dan mudah
                            dikenali.
                          </p>
                        </div>
                      </section>

                      {/* STATUS */}

                      <section
                        className={`border-t ${themeDivider} pt-7`}
                      >
                        <div className="mb-5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />

                            <h3 className="theme-text text-sm font-bold">
                              Status Kategori
                            </h3>
                          </div>

                          <p className="theme-text-muted mt-1.5 text-xs">
                            Tentukan apakah kategori dapat digunakan dalam
                            pengelolaan aset.
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor="status"
                            className="theme-text-secondary mb-2 block text-sm font-semibold"
                          >
                            Status
                            <span className="theme-danger ml-1">*</span>
                          </label>

                          <select
                            id="status"
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            disabled={saving}
                            className={`theme-input h-12 w-full appearance-none rounded-xl border px-4 text-sm font-medium outline-none transition ${themeNeutralBorder} ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Nonaktif</option>
                          </select>

                          <div
                            className={`mt-3 flex items-start gap-2.5 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
                          >
                            <Info
                              size={15}
                              className="theme-text-muted mt-0.5 shrink-0"
                            />

                            <p className="theme-text-secondary text-xs leading-5">
                              Kategori{" "}
                              <span className="theme-text font-semibold">
                                {isActive ? "aktif" : "nonaktif"}
                              </span>{" "}
                              {isActive
                                ? "dapat digunakan untuk mengelompokkan aset."
                                : "tidak digunakan untuk data aset baru."}
                            </p>
                          </div>
                        </div>
                      </section>

                      {/* INFORMATION */}

                      <div
                        className={`rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themeCardShadow} theme-primary`}
                          >
                            <Info size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="theme-text text-sm font-bold">
                              Informasi
                            </p>

                            <p className="theme-text-secondary mt-1 text-xs leading-5">
                              Data kategori akan tersimpan sebagai data master
                              dan dapat digunakan saat menambahkan aset baru.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* FORM FOOTER */}

                    <div
                      className={`flex flex-col-reverse gap-3 border-t ${themeDivider} ${themeNeutralSurface} px-5 py-4 sm:flex-row sm:justify-end sm:px-7`}
                    >
                      {/* BATAL */}

                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className={`theme-text-secondary inline-flex h-11 items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} theme-card px-5 text-sm font-semibold transition ${themeNeutralHover} hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <X size={17} />
                        Batal
                      </button>

                      {/* SIMPAN */}

                      <button
                        type="submit"
                        disabled={saving}
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-[var(--color-card)] transition-all ${themePrimaryGradient} ${themePrimaryShadow} hover:brightness-[1.04] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {saving ? (
                          <>
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save size={17} />
                            Simpan Kategori
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                {/* =================================================
                    RIGHT - PREVIEW
                ================================================= */}

                <aside className="min-w-0 xl:sticky xl:top-5">
                  <div
                    className={`theme-card ${themeDivider} ${themeCardShadow} overflow-hidden rounded-3xl border`}
                  >
                    {/* PREVIEW HEADER */}

                    <div
                      className={`border-b ${themeDivider} px-5 py-5`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)]`}
                          >
                            <Layers3 size={18} />
                          </div>

                          <div>
                            <h2 className="theme-text text-sm font-bold">
                              Preview Kategori
                            </h2>

                            <p className="theme-text-muted mt-0.5 text-xs">
                              Tampilan data sebelum disimpan
                            </p>
                          </div>
                        </div>

                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            isActive
                              ? "bg-[var(--color-success)]"
                              : "bg-[var(--color-text-muted)]"
                          }`}
                        />
                      </div>
                    </div>

                    {/* PREVIEW BODY */}

                    <div className="p-5">

                      {/* PREVIEW CARD */}

                      <div
                        className={`relative overflow-hidden rounded-2xl p-5 ${themePrimaryGradient}`}
                      >
                        {/* Decorative elements */}

                        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)] blur-3xl" />

                        <div className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-[color-mix(in_srgb,var(--color-info)_18%,transparent)] blur-3xl" />

                        <div className="relative">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)] text-[var(--color-card)] ring-1 ring-[color-mix(in_srgb,var(--color-card)_14%,transparent)]">
                              <Tag size={20} />
                            </div>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ring-1 ${
                                isActive
                                  ? "bg-[color-mix(in_srgb,var(--color-success)_18%,transparent)] text-[var(--color-card)] ring-[color-mix(in_srgb,var(--color-success)_28%,transparent)]"
                                  : "bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] text-[var(--color-card)] ring-[color-mix(in_srgb,var(--color-card)_14%,transparent)]"
                              }`}
                            >
                              {isActive ? "AKTIF" : "NONAKTIF"}
                            </span>
                          </div>

                          <div className="mt-8">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--color-card)_78%,var(--color-primary))]">
                              Kategori Aset
                            </p>

                            <h3 className="mt-2 min-h-[56px] break-words text-xl font-bold leading-7 text-[var(--color-card)]">
                              {form.nama.trim() || "Nama Kategori"}
                            </h3>

                            <div className="mt-4 flex items-center gap-2 text-xs text-[color-mix(in_srgb,var(--color-card)_68%,transparent)]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-card)]" />

                              <span>
                                {isActive
                                  ? "Kategori tersedia"
                                  : "Kategori tidak aktif"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* STATUS CARD */}

                      <div
                        className={`mt-4 rounded-2xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                              isActive
                                ? `${themeSuccessSurface} theme-success`
                                : `${themeNeutralSurface} theme-text-muted`
                            }`}
                          >
                            {isActive ? (
                              <Check size={17} />
                            ) : (
                              <X size={17} />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                              Status
                            </p>

                            <p
                              className={`mt-0.5 text-sm font-bold ${
                                isActive
                                  ? "theme-success"
                                  : "theme-text-secondary"
                              }`}
                            >
                              {isActive ? "Aktif" : "Nonaktif"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* DETAIL */}

                      <div
                        className={`mt-4 overflow-hidden rounded-2xl border ${themeNeutralBorder}`}
                      >
                        <div
                          className={`flex items-center gap-3 border-b ${themeDivider} px-4 py-4`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} theme-primary`}
                          >
                            <Tag size={15} />
                          </div>

                          <div className="min-w-0">
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Nama
                            </p>

                            <p className="theme-text mt-0.5 break-words text-sm font-semibold">
                              {form.nama.trim() || "Belum diisi"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-4">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} theme-primary`}
                          >
                            <Layers3 size={15} />
                          </div>

                          <div>
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Jenis Data
                            </p>

                            <p className="theme-text mt-0.5 text-sm font-semibold">
                              Kategori Aset
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* PREVIEW NOTE */}

                      <div
                        className={`mt-4 rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
                      >
                        <div className="flex items-start gap-2.5">
                          <Info
                            size={15}
                            className="theme-info mt-0.5 shrink-0"
                          />

                          <p className="theme-text-secondary text-[11px] leading-5">
                            Preview akan mengikuti perubahan nama dan status
                            kategori secara otomatis.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* PREVIEW FOOTER */}

                    <div
                      className={`border-t ${themeDivider} ${themeNeutralSurface} px-5 py-4`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2
                          size={15}
                          className="theme-success shrink-0"
                        />

                        <p className="theme-text-secondary text-[11px] leading-4">
                          Data siap disimpan ke master kategori aset.
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div
                className={`mt-7 border-t ${themeDivider} pt-5 text-center`}
              >
                <p className="theme-text-muted text-xs">
                  © 2026 SmartSchool • Modul Sarana & Prasarana
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}