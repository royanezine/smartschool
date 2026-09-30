"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import {
  Building,
  ArrowLeft,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Image as ImageIcon,
} from "lucide-react";

import { createGedung } from "../../../../../../services/infrastruktur.service";

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
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

const themeCardShadow =
  "shadow-[0_3px_14px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeButtonShadow =
  "shadow-[0_6px_18px_color-mix(in_srgb,var(--color-text)_12%,transparent)]";

const themeButtonHoverShadow =
  "hover:shadow-[0_9px_24px_color-mix(in_srgb,var(--color-text)_16%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeNeutralDivider =
  "border-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]";

export default function TambahGedungPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const [formData, setFormData] = useState({
    nama: "",
    kode: "",
    fotoUrl: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    if (submitError) {
      setSubmitError("");
    }
  };

  const validate = () => {
    const newErrors = {};

    const nama = formData.nama.trim();
    const kode = formData.kode.trim();
    const fotoUrl = formData.fotoUrl.trim();

    if (!nama) {
      newErrors.nama = "Nama gedung wajib diisi";
    } else if (nama.length > 100) {
      newErrors.nama = "Nama gedung maksimal 100 karakter";
    }

    if (!kode) {
      newErrors.kode = "Kode gedung wajib diisi";
    } else if (kode.length > 50) {
      newErrors.kode = "Kode gedung maksimal 50 karakter";
    }

    if (fotoUrl) {
      try {
        new URL(fotoUrl);
      } catch {
        newErrors.fotoUrl = "URL foto tidak valid";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) return;

    if (!validate()) {
      return;
    }

    setIsSaving(true);
    setSaved(false);
    setSubmitError("");

    try {
      const payload = {
        nama: formData.nama.trim(),
        kode: formData.kode.trim(),
        fotoUrl: formData.fotoUrl.trim() || null,
      };

      console.log("Payload create gedung:", payload);

      const response = await createGedung(payload);

      console.log("Response create gedung:", response);

      setSaved(true);

      setTimeout(() => {
        router.push("/admin/sarpras/gedung");
      }, 1200);
    } catch (error) {
      console.error("Error create gedung:", error);

      setSubmitError(
        error?.message ||
          "Gagal menambahkan gedung. Silakan coba lagi."
      );

      setSaved(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (isSaving) return;

    router.push("/admin/sarpras/gedung");
  };

  return (
    <div className="theme-page flex min-h-screen">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          toggleSidebar={() => setIsCollapsed((prev) => !prev)}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 p-3 sm:p-5 lg:p-7 xl:p-8">
          <div className="mx-auto w-full max-w-[1200px] space-y-4 sm:space-y-5 lg:space-y-6">

            {/* BACK */}
            <button
              type="button"
              onClick={handleBack}
              disabled={isSaving}
              className="group inline-flex items-center gap-2 text-sm font-medium theme-text-secondary transition-colors hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowLeft
                size={18}
                className="transition-transform group-hover:-translate-x-0.5"
              />

              Kembali ke Daftar Gedung
            </button>

            {/* HEADER */}
            <section
              className={`relative overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
            >
              <div
                className={`pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full blur-3xl ${themePrimarySoft}`}
              />

              <div className="relative flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} sm:h-14 sm:w-14`}
                  >
                    <Plus
                      size={22}
                      strokeWidth={1.9}
                      className="sm:h-[25px] sm:w-[25px]"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="theme-text text-xl font-semibold tracking-[-0.025em] sm:text-2xl lg:text-[26px]">
                        Tambah Gedung
                      </h1>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} px-2.5 py-0.5 text-[10px] font-semibold text-[var(--color-primary)] sm:px-3 sm:py-1 sm:text-[11px]`}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"
                        />

                        Sarana & Prasarana
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 sm:gap-2">
                      <Building
                        size={13}
                        className="shrink-0 text-[var(--color-primary)] sm:h-[14px] sm:w-[14px]"
                        strokeWidth={2}
                      />

                      <p className="theme-text-muted text-xs leading-5 sm:text-sm">
                        Lengkapi informasi gedung untuk
                        ditambahkan ke sistem.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-wrap gap-2 sm:flex-row lg:w-auto">

                  {/* BATAL */}
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSaving}
                    className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} theme-card px-4 text-sm font-medium theme-text-secondary ${themeButtonShadow} transition-all ${themeNeutralHover} hover:border-[color-mix(in_srgb,var(--color-text)_18%,transparent)] hover:text-[var(--color-text)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:px-5`}
                  >
                    <X
                      size={16}
                      className="sm:h-[17px] sm:w-[17px]"
                    />

                    Batal
                  </button>

                  {/* SIMPAN */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-4 text-sm font-semibold text-[var(--color-card)] ${themeButtonShadow} transition-all ${themeButtonHoverShadow} active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:px-5`}
                  >
                    <Save
                      size={16}
                      strokeWidth={2.3}
                      className="sm:h-[17px] sm:w-[17px]"
                    />

                    {isSaving ? "Menyimpan..." : "Simpan Gedung"}
                  </button>
                </div>
              </div>
            </section>

            {/* SUCCESS */}
            {saved && (
              <div
                className={`flex items-center gap-3 rounded-2xl border ${themeSuccessBorder} ${themeSuccessSurface} px-4 py-3 text-sm theme-success`}
              >
                <CheckCircle
                  size={18}
                  className="shrink-0 theme-success"
                />

                <span>
                  Gedung berhasil ditambahkan! Mengalihkan ke
                  daftar gedung...
                </span>
              </div>
            )}

            {/* ERROR */}
            {submitError && (
              <div
                className={`flex items-start gap-3 rounded-2xl border ${themeDangerBorder} ${themeDangerSurface} px-4 py-3 text-sm theme-danger`}
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 theme-danger"
                />

                <div className="min-w-0">
                  <p className="font-semibold">
                    Gagal menambahkan gedung
                  </p>

                  <p className="mt-0.5 break-words">
                    {submitError}
                  </p>
                </div>
              </div>
            )}

            {/* FORM CARD */}
            <section
              className={`rounded-2xl border theme-border theme-card p-5 ${themeCardShadow} sm:p-6 lg:p-7`}
            >
              <div
                className={`mb-5 flex items-center gap-3 border-b ${themeNeutralDivider} pb-4`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  <Info size={16} />
                </div>

                <div>
                  <p className="theme-text text-sm font-semibold">
                    Informasi Gedung
                  </p>

                  <p className="theme-text-muted text-xs">
                    Masukkan data gedung yang tersedia pada
                    sistem
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* NAMA */}
                  <div>
                    <label className="theme-text-secondary mb-1.5 block text-xs font-medium">
                      Nama Gedung{" "}
                      <span className="theme-danger">*</span>
                    </label>

                    <input
                      type="text"
                      value={formData.nama}
                      onChange={(e) =>
                        handleChange(
                          "nama",
                          e.target.value
                        )
                      }
                      placeholder="Contoh: Gedung Utama"
                      maxLength={100}
                      disabled={isSaving}
                      className={`theme-input w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all placeholder:theme-text-placeholder ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60 ${
                        errors.nama
                          ? "border-[color-mix(in_srgb,var(--color-text)_30%,transparent)]"
                          : "theme-border"
                      }`}
                    />

                    <div className="mt-1 flex items-center justify-between">
                      {errors.nama ? (
                        <p className="theme-danger flex items-center gap-1 text-xs">
                          <AlertCircle size={12} />
                          {errors.nama}
                        </p>
                      ) : (
                        <span />
                      )}

                      <span className="theme-text-muted text-[10px]">
                        {formData.nama.length}/100
                      </span>
                    </div>
                  </div>

                  {/* KODE */}
                  <div>
                    <label className="theme-text-secondary mb-1.5 block text-xs font-medium">
                      Kode Gedung{" "}
                      <span className="theme-danger">*</span>
                    </label>

                    <input
                      type="text"
                      value={formData.kode}
                      onChange={(e) =>
                        handleChange(
                          "kode",
                          e.target.value
                        )
                      }
                      placeholder="Contoh: A, B, C"
                      maxLength={50}
                      disabled={isSaving}
                      className={`theme-input w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all placeholder:theme-text-placeholder ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60 ${
                        errors.kode
                          ? "border-[color-mix(in_srgb,var(--color-text)_30%,transparent)]"
                          : "theme-border"
                      }`}
                    />

                    <div className="mt-1 flex items-center justify-between">
                      {errors.kode ? (
                        <p className="theme-danger flex items-center gap-1 text-xs">
                          <AlertCircle size={12} />
                          {errors.kode}
                        </p>
                      ) : (
                        <span />
                      )}

                      <span className="theme-text-muted text-[10px]">
                        {formData.kode.length}/50
                      </span>
                    </div>
                  </div>

                  {/* FOTO */}
                  <div className="md:col-span-2">
                    <label className="theme-text-secondary mb-1.5 block text-xs font-medium">
                      URL Foto Gedung

                      <span className="theme-text-muted ml-1 text-xs font-normal">
                        (opsional)
                      </span>
                    </label>

                    <div className="relative">
                      <ImageIcon
                        size={16}
                        className="theme-text-muted absolute left-4 top-1/2 -translate-y-1/2"
                      />

                      <input
                        type="url"
                        value={formData.fotoUrl}
                        onChange={(e) =>
                          handleChange(
                            "fotoUrl",
                            e.target.value
                          )
                        }
                        placeholder="https://contoh.com/foto-gedung.jpg"
                        disabled={isSaving}
                        className={`theme-input w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm outline-none transition-all placeholder:theme-text-placeholder ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60 ${
                          errors.fotoUrl
                            ? "border-[color-mix(in_srgb,var(--color-text)_30%,transparent)]"
                            : "theme-border"
                        }`}
                      />
                    </div>

                    {errors.fotoUrl && (
                      <p className="theme-danger mt-1.5 flex items-center gap-1 text-xs">
                        <AlertCircle size={12} />
                        {errors.fotoUrl}
                      </p>
                    )}

                    <p className="theme-text-muted mt-1.5 text-xs">
                      Masukkan URL gambar jika gedung memiliki
                      foto.
                    </p>
                  </div>
                </div>

                {/* INFO */}
                <div
                  className={`flex items-start gap-3 rounded-xl border ${themeInfoBorder} ${themeInfoSurface} px-4 py-3`}
                >
                  <Info
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--color-info)]"
                  />

                  <div>
                    <p className="text-[var(--color-info)] text-xs font-semibold">
                      Informasi
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-[var(--color-info)]">
                      Data yang dikirim adalah nama, kode, dan
                      URL foto. Foto akan disimpan oleh backend
                      pada field yang sesuai dengan struktur
                      database.
                    </p>
                  </div>
                </div>

                {/* FOOTER ACTION */}
                <div
                  className={`flex flex-col-reverse gap-2.5 border-t ${themeNeutralDivider} pt-5 sm:flex-row sm:items-center sm:justify-end`}
                >
                  {/* BATAL */}
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSaving}
                    className={`inline-flex h-11 items-center justify-center rounded-xl border ${themeNeutralBorder} theme-card px-6 text-sm font-medium theme-text-secondary ${themeButtonShadow} transition-all ${themeNeutralHover} hover:border-[color-mix(in_srgb,var(--color-text)_18%,transparent)] hover:text-[var(--color-text)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    Batal
                  </button>

                  {/* SIMPAN */}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-6 text-sm font-semibold text-[var(--color-card)] ${themeButtonShadow} transition-all ${themeButtonHoverShadow} active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <Save
                      size={17}
                      strokeWidth={2.3}
                    />

                    {isSaving
                      ? "Menyimpan..."
                      : "Simpan Gedung"}
                  </button>
                </div>
              </form>
            </section>

            {/* FOOTER */}
            <div
              className={`border-t ${themeNeutralDivider} pt-4 text-center sm:pt-5`}
            >
              <p className="theme-text-muted text-xs">
                © 2026 SmartSchool • Tambah Gedung - Sarana &
                Prasarana
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}