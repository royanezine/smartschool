"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../../../../components/Sidebar";
import Header from "../../../../../../components/Header";
import { apiFetch } from "../../../../../../../lib/api";

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
        "/api/cms/kategori-artikel",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      alert(
        "Kategori artikel berhasil ditambahkan."
      );

      router.push(
        "/admin/cms/articles/categories"
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
      "/admin/cms/articles/categories"
    );
  }

  return (
    <div className="theme-page min-h-screen">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="min-h-screen lg:ml-[260px]">
        <Header />

        <main className="theme-page p-4 sm:p-6 lg:p-8">
          {/* =================================================
              TOP NAVIGATION
          ================================================= */}

          <div className="mb-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="
                theme-text-secondary
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                transition
                hover:opacity-80
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
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
              <div className="theme-info flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
                <Tags size={23} />
              </div>

              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-medium">
                  <span
                    style={{
                      color: "var(--color-primary)",
                    }}
                  >
                    CMS
                  </span>

                  <span className="theme-text-placeholder">
                    /
                  </span>

                  <span className="theme-text-muted">
                    Artikel
                  </span>

                  <span className="theme-text-placeholder">
                    /
                  </span>

                  <span className="theme-text-muted">
                    Kategori
                  </span>

                  <span className="theme-text-placeholder">
                    /
                  </span>

                  <span className="theme-text-muted">
                    Tambah
                  </span>
                </div>

                <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                  Tambah Kategori Artikel
                </h1>

                <p className="theme-text-muted mt-2 max-w-2xl text-sm leading-6">
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

            <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
              {/* FORM HEADER */}

              <div className="theme-card-soft theme-border-soft border-b px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="theme-card theme-border theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg border">
                    <FolderOpen size={18} />
                  </div>

                  <div>
                    <h2 className="theme-text text-sm font-bold">
                      Informasi Kategori
                    </h2>

                    <p className="theme-text-muted mt-0.5 text-xs">
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
                    <div className="theme-danger flex gap-3 rounded-xl border p-4">
                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <div>
                        <p className="text-sm font-bold">
                          Gagal menyimpan
                        </p>

                        <p className="mt-1 text-xs leading-5">
                          {error}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* NAMA */}

                  <div>
                    <label
                      htmlFor="nama"
                      className="theme-text-secondary mb-2 block text-sm font-semibold"
                    >
                      Nama Kategori
                      <span
                        className="ml-1"
                        style={{
                          color:
                            "var(--color-danger)",
                        }}
                      >
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
                      className="
                        theme-input
                        h-12
                        w-full
                        rounded-xl
                        border
                        px-4
                        text-sm
                        outline-none
                        transition
                        placeholder:theme-text-placeholder
                        focus:border-[var(--color-primary)]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    />

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="theme-text-muted text-xs">
                        Minimal 3 karakter.
                      </p>

                      <p className="theme-text-muted text-xs">
                        {form.nama.length}/100
                      </p>
                    </div>
                  </div>

                  {/* STATUS */}

                  <div>
                    <label
                      htmlFor="status"
                      className="theme-text-secondary mb-2 block text-sm font-semibold"
                    >
                      Status
                    </label>

                    <select
                      id="status"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      disabled={saving}
                      className="
                        theme-input
                        h-12
                        w-full
                        rounded-xl
                        border
                        px-4
                        text-sm
                        outline-none
                        transition
                        focus:border-[var(--color-primary)]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      <option value="aktif">
                        Aktif
                      </option>

                      <option value="nonaktif">
                        Nonaktif
                      </option>
                    </select>

                    <p className="theme-text-muted mt-2 text-xs leading-5">
                      Kategori aktif dapat langsung
                      digunakan ketika membuat artikel.
                    </p>
                  </div>

                  {/* PREVIEW */}

                  <div className="theme-border-soft border-t pt-6">
                    <p className="theme-text-muted mb-3 text-xs font-bold uppercase tracking-wider">
                      Preview
                    </p>

                    <div className="theme-card-soft theme-border flex items-center gap-3 rounded-xl border p-4">
                      <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
                        <Tags size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="theme-text truncate text-sm font-bold">
                          {form.nama.trim() ||
                            "Nama kategori"}
                        </p>

                        <p className="theme-text-muted mt-1 text-xs">
                          {form.status ===
                          "aktif"
                            ? "Kategori aktif"
                            : "Kategori nonaktif"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          form.status === "aktif"
                            ? "theme-success"
                            : "theme-card theme-text-muted theme-border border"
                        }`}
                      >
                        {form.status === "aktif"
                          ? "Aktif"
                          : "Nonaktif"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    FORM FOOTER
                ================================================= */}

                <div className="theme-card-soft theme-border-soft flex flex-col-reverse gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="
                      theme-card
                      theme-border
                      theme-text-secondary
                      h-11
                      rounded-xl
                      border
                      px-5
                      text-sm
                      font-semibold
                      transition
                      hover:opacity-80
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      !form.nama.trim()
                    }
                    className="
                      theme-primary
                      inline-flex
                      h-11
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      px-6
                      text-sm
                      font-semibold
                      shadow-sm
                      transition
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
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

              <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                <div className="theme-card-soft theme-border-soft border-b px-5 py-4">
                  <h2 className="theme-text text-sm font-bold">
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

              <div className="theme-info rounded-2xl border p-5">
                <div className="flex gap-3">
                  <div className="theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                    <Tags size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
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
                      ].map((item) => (
                        <span
                          key={item}
                          className="
                            theme-card
                            theme-border
                            theme-text-secondary
                            rounded-lg
                            border
                            px-2.5
                            py-1.5
                            text-[11px]
                            font-semibold
                          "
                        >
                          {item}
                        </span>
                      ))}
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
      <div className="theme-card-soft theme-text-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold">
        {number}
      </div>

      <div>
        <p className="theme-text-secondary text-sm font-semibold">
          {title}
        </p>

        <p className="theme-text-muted mt-1 text-xs leading-5">
          {description}
        </p>
      </div>
    </div>
  );
}