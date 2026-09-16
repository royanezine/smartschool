"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";
import { apiFetch } from "../../../../../lib/api";

import {
  ArrowLeft,
  Tags,
  Check,
  Loader2,
  AlertCircle,
  FolderOpen,
} from "lucide-react";

export default function TambahKategoriPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nama: "",
    status: "aktif",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nama = form.nama.trim();

    if (!nama) {
      setError("Nama kategori wajib diisi.");
      return;
    }

    if (nama.length < 3) {
      setError(
        "Nama kategori minimal 3 karakter."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        nama,
        status: form.status,
      };

      await apiFetch(
        "/api/v1/cms/kategori-artikel",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      alert(
        "Kategori artikel berhasil ditambahkan."
      );

      router.push(
        "/cmsAdmin/articles/categories"
      );
      router.refresh();
    } catch (error) {
      console.error(
        "Gagal membuat kategori:",
        error
      );

      setError(
        error?.message ||
          "Gagal membuat kategori artikel."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (saving) return;

    router.push(
      "/cmsAdmin/articles/categories"
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="min-h-screen lg:ml-[260px]">
        <Header />

        <main className="p-4 sm:p-6 lg:p-8">
          {/* =================================================
              TOP NAVIGATION
          ================================================= */}

          <div className="mb-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={17} />

              Kembali ke Kategori
            </button>
          </div>

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-7">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-blue-50 text-blue-600">
                <Tags size={23} />
              </div>

              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-medium">
                  <span className="text-blue-600">
                    CMS
                  </span>

                  <span className="text-slate-300">
                    /
                  </span>

                  <span className="text-slate-500">
                    Artikel
                  </span>

                  <span className="text-slate-300">
                    /
                  </span>

                  <span className="text-slate-500">
                    Kategori
                  </span>

                  <span className="text-slate-300">
                    /
                  </span>

                  <span className="text-slate-500">
                    Tambah
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                  Tambah Kategori Artikel
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Buat kategori baru untuk
                  mengelompokkan artikel sekolah
                  agar konten CMS lebih terorganisir.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            {/* =================================================
                FORM
            ================================================= */}

            <div className="border border-slate-200 bg-white shadow-sm">
              {/* FORM HEADER */}

              <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center bg-slate-100 text-slate-600">
                    <FolderOpen size={18} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-[#0F172A]">
                      Informasi Kategori
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Isi informasi kategori di bawah
                    </p>
                  </div>
                </div>
              </div>

              {/* FORM BODY */}

              <form onSubmit={handleSubmit}>
                <div className="space-y-6 p-5 sm:p-7">
                  {/* ERROR */}

                  {error && (
                    <div className="flex gap-3 border border-red-100 bg-red-50 p-4">
                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0 text-red-500"
                      />

                      <div>
                        <p className="text-sm font-bold text-red-700">
                          Gagal menyimpan
                        </p>

                        <p className="mt-1 text-xs leading-5 text-red-600">
                          {error}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* NAMA */}

                  <div>
                    <label
                      htmlFor="nama"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Nama Kategori
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="nama"
                      type="text"
                      name="nama"
                      value={form.nama}
                      onChange={handleChange}
                      placeholder="Contoh: Berita Sekolah"
                      disabled={saving}
                      autoFocus
                      maxLength={100}
                      className="h-12 w-full border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-400">
                        Minimal 3 karakter.
                      </p>

                      <p className="text-xs text-slate-400">
                        {form.nama.length}/100
                      </p>
                    </div>
                  </div>

                  {/* STATUS */}

                  <div>
                    <label
                      htmlFor="status"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Status
                    </label>

                    <select
                      id="status"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      disabled={saving}
                      className="h-12 w-full border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    >
                      <option value="aktif">
                        Aktif
                      </option>

                      <option value="nonaktif">
                        Nonaktif
                      </option>
                    </select>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Kategori aktif dapat langsung
                      digunakan ketika membuat artikel.
                    </p>
                  </div>

                  {/* PREVIEW */}

                  <div className="border-t border-slate-100 pt-6">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Preview
                    </p>

                    <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-blue-50 text-blue-600">
                        <Tags size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#0F172A]">
                          {form.nama.trim() ||
                            "Nama kategori"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {form.status ===
                          "aktif"
                            ? "Kategori aktif"
                            : "Kategori nonaktif"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 px-2.5 py-1 text-[11px] font-bold ${
                          form.status ===
                          "aktif"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {form.status ===
                        "aktif"
                          ? "Aktif"
                          : "Nonaktif"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    FORM FOOTER
                ================================================= */}

                <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="h-11 border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      !form.nama.trim()
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 bg-[#2563EB] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
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
                        <Check size={17} />

                        Simpan Kategori
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* =================================================
                INFORMATION SIDEBAR
            ================================================= */}

            <div className="space-y-5">
              {/* INFO CARD */}

              <div className="border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Tentang Kategori
                  </h2>
                </div>

                <div className="p-5">
                  <div className="space-y-5">
                    <InfoItem
                      number="01"
                      title="Nama kategori"
                      description="Gunakan nama yang jelas dan mudah dipahami oleh admin maupun pengunjung website."
                    />

                    <InfoItem
                      number="02"
                      title="Status aktif"
                      description="Kategori aktif dapat dipilih saat admin membuat atau mengedit artikel."
                    />

                    <InfoItem
                      number="03"
                      title="Slug otomatis"
                      description="Slug tidak perlu diisi manual. Backend akan membuat slug berdasarkan nama kategori."
                    />
                  </div>
                </div>
              </div>

              {/* EXAMPLE */}

              <div className="border border-blue-100 bg-blue-50/60 p-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-white text-blue-600">
                    <Tags size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-blue-700">
                      Contoh kategori
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        "Berita Sekolah",
                        "Pengumuman",
                        "Prestasi",
                        "Kegiatan",
                        "Akademik",
                        "Ekstrakurikuler",
                      ].map(
                        (item) => (
                          <span
                            key={item}
                            className="border border-blue-100 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-blue-600"
                          >
                            {item}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  number,
  title,
  description,
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-slate-100 text-[10px] font-bold text-slate-500">
        {number}
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-700">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}