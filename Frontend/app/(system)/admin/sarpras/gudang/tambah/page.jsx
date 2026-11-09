
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  ArrowLeft,
  Warehouse,
  MapPin,
  ClipboardList,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  Building2,
} from "lucide-react";

import { createGudang } from "@/services/sarpras.service";

const primaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const primarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const primaryText =
  "text-[var(--color-primary)]";

const primaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const neutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const neutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const cardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const inputBase = `
  theme-input
  w-full rounded-xl border ${neutralBorder}
  px-4 py-3 text-sm
  outline-none transition
  focus:border-[var(--color-primary)]
  focus:bg-[var(--color-card)]
  focus:ring-2
  focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]
  disabled:cursor-not-allowed
  disabled:opacity-60
`;

const initialForm = {
  nama: "",
  lokasi: "",
  keterangan: "",
};

export default function TambahGudangPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    const newErrors = {};

    const nama = form.nama.trim();
    const lokasi = form.lokasi.trim();
    const keterangan = form.keterangan.trim();

    if (!nama) {
      newErrors.nama = "Nama gudang wajib diisi.";
    } else if (nama.length > 100) {
      newErrors.nama = "Nama gudang maksimal 100 karakter.";
    }

    if (lokasi.length > 255) {
      newErrors.lokasi = "Lokasi maksimal 255 karakter.";
    }

    if (keterangan.length > 255) {
      newErrors.keterangan = "Keterangan maksimal 255 karakter.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      setError("Periksa kembali data yang kamu masukkan.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        nama: form.nama.trim(),
        lokasi: form.lokasi.trim() || null,
        keterangan: form.keterangan.trim() || null,
      };

      await createGudang(payload);

      setSuccess("Gudang berhasil ditambahkan.");

      setTimeout(() => {
        router.push("/admin/sarpras/gudang");
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error("Gagal menambahkan gudang:", err);

      setError(
        err?.message || "Gagal menambahkan gudang. Silakan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setError("");
    setSuccess("");
  };

  const completedFields = [
    form.nama.trim(),
    form.lokasi.trim(),
    form.keterangan.trim(),
  ].filter(Boolean).length;

  const completionPercentage = Math.round(
    (completedFields / 3) * 100
  );

  const inputClass = (name) => `
    ${inputBase}
    ${
      errors[name]
        ? "border-[var(--color-danger)] ring-2 ring-[color-mix(in_srgb,var(--color-danger)_12%,transparent)]"
        : ""
    }
  `;

  return (
    <div className="theme-page flex min-h-screen w-full">
      <Sidebar
        active="gudang"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="theme-header relative z-30 shrink-0 border-b theme-border">
          <Header
            toggleSidebar={() => setIsCollapsed((value) => !value)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="theme-page min-w-0 flex-1 overflow-y-auto">
          <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <Link
                  href="/admin/sarpras/gudang"
                  className={`theme-card flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${neutralBorder} theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] hover:text-[var(--color-primary)]`}
                >
                  <ArrowLeft size={20} />
                </Link>

                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className="theme-text-muted">Sarpras</span>
                    <span className="theme-text-muted">/</span>
                    <Link
                      href="/admin/sarpras/gudang"
                      className="theme-text-muted hover:text-[var(--color-primary)]"
                    >
                      Master Gudang
                    </Link>
                    <span className="theme-text-muted">/</span>
                    <span className={primaryText}>Tambah</span>
                  </div>

                  <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                    Tambah Gudang
                  </h1>

                  <p className="theme-text-secondary mt-1 text-sm">
                    Tambahkan data tempat penyimpanan aset sekolah.
                  </p>
                </div>
              </div>

              <Link
                href="/admin/sarpras/gudang"
                className={`theme-card inline-flex items-center justify-center gap-2 rounded-xl border ${neutralBorder} px-4 py-2.5 text-sm font-semibold theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]`}
              >
                <X size={16} />
                Batal
              </Link>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-4">
                <AlertCircle
                  size={19}
                  className="theme-danger mt-0.5 shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <p className="theme-danger text-sm font-bold">
                    Terjadi kesalahan
                  </p>

                  <p className="theme-text-secondary mt-1 text-sm">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="theme-text-muted rounded-lg p-1"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)] p-4">
                <CheckCircle2
                  size={19}
                  className="theme-success mt-0.5 shrink-0"
                />

                <div>
                  <p className="theme-success text-sm font-bold">
                    Berhasil
                  </p>

                  <p className="theme-text-secondary mt-1 text-sm">
                    {success}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">

                <div className="min-w-0 space-y-6">
                  <section
                    className={`theme-card overflow-hidden rounded-2xl border ${neutralBorder} ${cardShadow}`}
                  >
                    <div className={`flex items-center gap-3 border-b ${neutralBorder} px-5 py-5 sm:px-6`}>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${primarySoft} ${primaryText}`}
                      >
                        <Warehouse size={20} />
                      </div>

                      <div>
                        <h2 className="theme-text text-base font-bold">
                          Informasi Gudang
                        </h2>

                        <p className="theme-text-muted mt-0.5 text-xs">
                          Lengkapi informasi dasar gudang sekolah.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5 p-5 sm:p-6">
                      <div>
                        <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                          Nama Gudang
                          <span className="theme-danger ml-1">*</span>
                        </label>

                        <div className="relative">
                          <Warehouse
                            size={17}
                            className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                          />

                          <input
                            type="text"
                            name="nama"
                            value={form.nama}
                            onChange={handleChange}
                            maxLength={100}
                            disabled={submitting}
                            placeholder="Contoh: Gudang Sarana Prasarana"
                            className={`${inputClass("nama")} pl-10`}
                          />
                        </div>

                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          {errors.nama ? (
                            <p className="theme-danger text-xs">
                              {errors.nama}
                            </p>
                          ) : (
                            <p className="theme-text-muted text-xs">
                              Nama gudang wajib diisi.
                            </p>
                          )}

                          <span className="theme-text-muted text-[10px]">
                            {form.nama.length}/100
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                          Lokasi Gudang
                        </label>

                        <div className="relative">
                          <MapPin
                            size={17}
                            className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                          />

                          <input
                            type="text"
                            name="lokasi"
                            value={form.lokasi}
                            onChange={handleChange}
                            maxLength={255}
                            disabled={submitting}
                            placeholder="Contoh: Gedung A, Lantai 1"
                            className={`${inputClass("lokasi")} pl-10`}
                          />
                        </div>

                        <div className="mt-1.5 flex justify-between gap-2">
                          {errors.lokasi ? (
                            <p className="theme-danger text-xs">
                              {errors.lokasi}
                            </p>
                          ) : (
                            <p className="theme-text-muted text-xs">
                              Lokasi fisik gudang.
                            </p>
                          )}

                          <span className="theme-text-muted text-[10px]">
                            {form.lokasi.length}/255
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                          Keterangan
                        </label>

                        <textarea
                          name="keterangan"
                          value={form.keterangan}
                          onChange={handleChange}
                          maxLength={255}
                          rows={4}
                          disabled={submitting}
                          placeholder="Tuliskan keterangan tambahan mengenai gudang..."
                          className={`${inputClass("keterangan")} resize-none`}
                        />

                        <div className="mt-1.5 flex justify-between gap-2">
                          {errors.keterangan ? (
                            <p className="theme-danger text-xs">
                              {errors.keterangan}
                            </p>
                          ) : (
                            <p className="theme-text-muted text-xs">
                              Keterangan tambahan bersifat opsional.
                            </p>
                          )}

                          <span className="theme-text-muted text-[10px]">
                            {form.keterangan.length}/255
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={submitting}
                      className={`theme-card inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border ${neutralBorder} px-5 text-sm font-semibold theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-60`}
                    >
                      <X size={16} />
                      Reset
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className={`${primaryGradient} ${primaryShadow} inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save size={17} />
                          Simpan Gudang
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <aside className="min-w-0 space-y-5 xl:sticky xl:top-6">
                  <div
                    className={`theme-card overflow-hidden rounded-2xl border ${neutralBorder} ${cardShadow}`}
                  >
                    <div className={`${primaryGradient} p-6 text-white`}>
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium opacity-75">
                            Preview Gudang
                          </p>

                          <h3 className="mt-1 text-lg font-bold">
                            Informasi Gudang
                          </h3>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                          <Building2 size={21} />
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/15 bg-white/10 p-4">
                        <p className="text-xs opacity-75">
                          Nama Gudang
                        </p>

                        <p className="mt-1 break-words text-lg font-bold">
                          {form.nama || "Nama belum diisi"}
                        </p>

                        <div className="mt-3 flex items-center gap-2 text-xs opacity-90">
                          <MapPin size={14} />

                          <span className="break-words">
                            {form.lokasi || "Lokasi belum diisi"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 p-5">
                      <div>
                        <p className="theme-text-muted mb-1 text-xs">
                          Keterangan
                        </p>

                        <p className="theme-text-secondary break-words text-sm">
                          {form.keterangan || "Belum ada keterangan"}
                        </p>
                      </div>

                      <div className={`border-t ${neutralBorder} pt-4`}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="theme-text text-sm font-semibold">
                            Kelengkapan Data
                          </span>

                          <span className={`${primaryText} text-sm font-bold`}>
                            {completionPercentage}%
                          </span>
                        </div>

                        <div className={`h-2 overflow-hidden rounded-full ${neutralSurface}`}>
                          <div
                            className={`${primaryGradient} h-full rounded-full transition-all duration-300`}
                            style={{
                              width: `${completionPercentage}%`,
                            }}
                          />
                        </div>

                        <p className="theme-text-muted mt-2 text-xs">
                          {completedFields} dari 3 informasi diisi.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-2xl border border-[color-mix(in_srgb,var(--color-info)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)] p-5`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-info)_14%,transparent)] theme-info">
                        <Info size={17} />
                      </div>

                      <div>
                        <h3 className="theme-info text-sm font-bold">
                          Informasi
                        </h3>

                        <p className="theme-text-secondary mt-1 text-xs leading-5">
                          Gudang digunakan sebagai lokasi penyimpanan
                          aset sekolah. Data gudang akan terhubung
                          dengan aset melalui gudangId.
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </form>

            <div className="py-3 text-center">
              <p className="theme-text-muted text-[11px]">
                © 2026 SmartSchool • Tambah Gudang
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
