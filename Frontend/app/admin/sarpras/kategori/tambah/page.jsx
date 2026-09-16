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

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import { createKategoriAset } from "../../../../../services/sarpras.service";

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

  /* =========================================================
     HANDLE CHANGE
  ========================================================= */

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

  /* =========================================================
     SUBMIT
  ========================================================= */

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

  /* =========================================================
     CANCEL
  ========================================================= */

  function handleCancel() {
    if (saving) return;

    router.push("/admin/sarpras/kategori");
  }

  /* =========================================================
     STATUS PREVIEW
  ========================================================= */

  const isActive = form.status === "aktif";

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f8fafc]">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar
          active="sarpras"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      {/* =====================================================
          CONTENT AREA
      ===================================================== */}

      <div
        className={`flex h-screen min-w-0 flex-col overflow-hidden transition-[margin] duration-300 ${
          isCollapsed ? "lg:ml-[88px]" : "lg:ml-[260px]"
        }`}
      >
        {/* ===================================================
            HEADER
        =================================================== */}

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

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 pb-10 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-7">
            <div className="mx-auto w-full max-w-[1280px]">
              {/* =================================================
                  PAGE HEADER
              ================================================= */}

              <div className="mb-7">
                <Link
                  href="/admin/sarpras/kategori"
                  className="group mb-5 inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-blue-600"
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
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
                        Sarana & Prasarana
                      </span>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      Tambah Kategori Aset
                    </h1>

                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                      Tambahkan kategori baru untuk mengelompokkan barang
                      inventaris sekolah dengan lebih terstruktur.
                    </p>
                  </div>

                  <div className="hidden shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_4px_16px_rgba(15,23,42,0.04)] sm:flex">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Tag size={19} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Modul
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-slate-800">
                        Kategori Aset
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  ALERT ERROR
              ================================================= */}

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm">
                    <AlertCircle size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-rose-800">
                      Gagal menyimpan
                    </p>

                    <p className="mt-1 text-sm leading-5 text-rose-700">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="rounded-lg p-1.5 text-rose-400 transition hover:bg-rose-100 hover:text-rose-700"
                  >
                    <X size={17} />
                  </button>
                </div>
              )}

              {/* =================================================
                  ALERT SUCCESS
              ================================================= */}

              {saved && (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-emerald-800">
                      Kategori berhasil ditambahkan
                    </p>

                    <p className="mt-0.5 text-xs text-emerald-700">
                      Mengalihkan ke daftar kategori...
                    </p>
                  </div>
                </div>
              )}

              {/* =================================================
                  MAIN GRID
              ================================================= */}

              <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
                {/* =================================================
                    LEFT - FORM
                ================================================= */}

                <form onSubmit={handleSubmit} className="min-w-0">
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_6px_24px_rgba(15,23,42,0.05)]">
                    {/* FORM HEADER */}

                    <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/80 via-white to-white px-5 py-5 sm:px-7">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_6px_16px_rgba(37,99,235,0.18)]">
                            <Tag size={20} strokeWidth={2} />
                          </div>

                          <div className="min-w-0">
                            <h2 className="text-sm font-bold text-slate-900">
                              Informasi Kategori
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500">
                              Lengkapi informasi kategori aset.
                            </p>
                          </div>
                        </div>

                        <span className="hidden rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold tracking-wide text-blue-600 sm:inline-flex">
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
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                            <h3 className="text-sm font-bold text-slate-900">
                              Identitas Kategori
                            </h3>
                          </div>

                          <p className="mt-1.5 text-xs text-slate-400">
                            Nama digunakan sebagai identitas kategori pada
                            data aset.
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor="nama"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                          >
                            Nama Kategori
                            <span className="ml-1 text-rose-500">*</span>
                          </label>

                          <div className="relative">
                            <Tag
                              size={18}
                              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-16 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            />

                            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400">
                              {form.nama.length}/50
                            </span>
                          </div>

                          <p className="mt-2 text-xs text-slate-400">
                            Gunakan nama yang singkat, jelas, dan mudah
                            dikenali.
                          </p>
                        </div>
                      </section>

                      {/* STATUS */}

                      <section className="border-t border-slate-100 pt-7">
                        <div className="mb-5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                            <h3 className="text-sm font-bold text-slate-900">
                              Status Kategori
                            </h3>
                          </div>

                          <p className="mt-1.5 text-xs text-slate-400">
                            Tentukan apakah kategori dapat digunakan dalam
                            pengelolaan aset.
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor="status"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                          >
                            Status
                            <span className="ml-1 text-rose-500">*</span>
                          </label>

                          <select
                            id="status"
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            disabled={saving}
                            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            style={{
                              color: "#0f172a",
                              colorScheme: "light",
                            }}
                          >
                            <option
                              value="aktif"
                              className="text-slate-900"
                            >
                              Aktif
                            </option>

                            <option
                              value="nonaktif"
                              className="text-slate-900"
                            >
                              Nonaktif
                            </option>
                          </select>

                          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3">
                            <Info
                              size={15}
                              className="mt-0.5 shrink-0 text-slate-400"
                            />

                            <p className="text-xs leading-5 text-slate-500">
                              Kategori{" "}
                              <span className="font-semibold text-slate-700">
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

                      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                            <Info size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-bold text-blue-900">
                              Informasi
                            </p>

                            <p className="mt-1 text-xs leading-5 text-blue-700">
                              Data kategori akan tersimpan sebagai data master
                              dan dapat digunakan saat menambahkan aset baru.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* FORM FOOTER */}

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X size={17} />
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(37,99,235,0.18)] transition hover:bg-blue-700 hover:shadow-[0_8px_20px_rgba(37,99,235,0.24)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
                    RIGHT - PREVIEW CARD
                ================================================= */}

                <aside className="min-w-0 xl:sticky xl:top-5">
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_6px_24px_rgba(15,23,42,0.05)]">
                    {/* PREVIEW HEADER */}

                    <div className="border-b border-slate-100 px-5 py-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                            <Layers3 size={18} />
                          </div>

                          <div>
                            <h2 className="text-sm font-bold text-slate-900">
                              Preview Kategori
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Tampilan data sebelum disimpan
                            </p>
                          </div>
                        </div>

                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            isActive ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                      </div>
                    </div>

                    {/* PREVIEW BODY */}

                    <div className="p-5">
                      {/* PREMIUM PREVIEW */}

                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-5">
                        {/* Decorative elements */}

                        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />

                        <div className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-indigo-500/10 blur-3xl" />

                        <div className="relative">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/10">
                              <Tag size={20} />
                            </div>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ring-1 ${
                                isActive
                                  ? "bg-emerald-400/10 text-emerald-300 ring-emerald-300/10"
                                  : "bg-white/10 text-slate-300 ring-white/10"
                              }`}
                            >
                              {isActive ? "AKTIF" : "NONAKTIF"}
                            </span>
                          </div>

                          <div className="mt-8">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-300">
                              Kategori Aset
                            </p>

                            <h3 className="mt-2 min-h-[56px] break-words text-xl font-bold leading-7 text-white">
                              {form.nama.trim() || "Nama Kategori"}
                            </h3>

                            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

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

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                              isActive
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {isActive ? (
                              <Check size={17} />
                            ) : (
                              <X size={17} />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Status
                            </p>

                            <p
                              className={`mt-0.5 text-sm font-bold ${
                                isActive
                                  ? "text-emerald-600"
                                  : "text-slate-600"
                              }`}
                            >
                              {isActive ? "Aktif" : "Nonaktif"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* DETAIL */}

                      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <Tag size={15} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Nama
                            </p>

                            <p className="mt-0.5 break-words text-sm font-semibold text-slate-800">
                              {form.nama.trim() || "Belum diisi"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <Layers3 size={15} />
                          </div>

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Jenis Data
                            </p>

                            <p className="mt-0.5 text-sm font-semibold text-slate-800">
                              Kategori Aset
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* PREVIEW NOTE */}

                      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                        <div className="flex items-start gap-2.5">
                          <Info
                            size={15}
                            className="mt-0.5 shrink-0 text-blue-600"
                          />

                          <p className="text-[11px] leading-5 text-blue-700">
                            Preview akan mengikuti perubahan nama dan status
                            kategori secara otomatis.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* PREVIEW FOOTER */}

                    <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2
                          size={15}
                          className="shrink-0 text-emerald-500"
                        />

                        <p className="text-[11px] leading-4 text-slate-500">
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

              <div className="mt-7 border-t border-slate-200/70 pt-5 text-center">
                <p className="text-xs text-slate-400">
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