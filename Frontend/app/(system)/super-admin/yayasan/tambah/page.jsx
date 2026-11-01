"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Landmark,
  MapPin,
  Mail,
  Phone,
  Building2,
  FileText,
  Save,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react";

import { createYayasan } from "@/services/yayasan.service";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeDangerSoft =
  "bg-[color-mix(in_srgb,var(--color-danger,_#ef4444)_9%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-danger,_#ef4444)_22%,transparent)]";

const themeSuccessSoft =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const inputClass = `
  w-full
  rounded-xl
  border
  theme-border
  ${themeNeutralSurface}
  px-3
  py-2.5
  text-sm
  theme-text
  outline-none
  transition-all
  duration-200
  placeholder:theme-text-placeholder
  hover:border-[color-mix(in_srgb,var(--color-primary)_25%,var(--color-border))]
  ${themeFocus}
`.replace(/\s+/g, " ").trim();

const selectClass = `
  w-full
  cursor-pointer
  rounded-xl
  border
  theme-border
  ${themeNeutralSurface}
  px-3
  py-2.5
  text-sm
  theme-text-secondary
  outline-none
  transition-all
  duration-200
  hover:border-[color-mix(in_srgb,var(--color-primary)_25%,var(--color-border))]
  ${themeFocus}
`.replace(/\s+/g, " ").trim();

export default function TambahYayasanPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nama: "",
    npyp: "",
    alamat: "",
    telepon: "",
    email: "",
    status: "aktif",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (error) setError("");
  };

  const validate = () => {
    const errors = {};

    if (!formData.nama.trim()) {
      errors.nama = "Nama yayasan wajib diisi (minimal 3 karakter).";
    } else if (formData.nama.trim().length < 3) {
      errors.nama = "Nama yayasan minimal 3 karakter.";
    }

    if (!formData.npyp.trim()) {
      errors.npyp = "NPYP wajib diisi dengan format YYS-XXXXXX (contoh: YYS-123456).";
    } else if (!/^YYS-[0-9]{6}$/.test(formData.npyp.trim())) {
      errors.npyp = "Format NPYP tidak valid. Wajib diawali 'YYS-' diikuti 6 digit angka (contoh: YYS-123456).";
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Format alamat email tidak valid.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        nama: formData.nama.trim(),
        npyp: formData.npyp.trim(),
        status: formData.status,
      };

      if (formData.alamat.trim()) {
        payload.alamat = formData.alamat.trim();
      }
      if (formData.telepon.trim()) {
        payload.telepon = formData.telepon.trim();
      }
      if (formData.email.trim()) {
        payload.email = formData.email.trim();
      }

      const res = await createYayasan(payload);

      const successMsg = res?.message || `Yayasan "${payload.nama}" berhasil didaftarkan.`;
      setSuccess(successMsg);

      setTimeout(() => {
        router.push("/super-admin/yayasan");
      }, 1500);
    } catch (err) {
      console.error("Gagal menambahkan yayasan:", err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Terjadi kesalahan saat mendaftarkan yayasan.";

      setError(serverMsg);

      // Handle duplicate NPYP specifically
      if (err?.response?.status === 409 || serverMsg.toLowerCase().includes("npyp")) {
        setFieldErrors((prev) => ({
          ...prev,
          npyp: serverMsg,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.push("/super-admin/yayasan");
  };

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-xs">
          <Link
            href="/super-admin/yayasan"
            className="font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
          >
            Yayasan
          </Link>

          <ChevronRight
            size={13}
            className="text-[var(--color-text-placeholder)]"
          />

          <span className="font-semibold theme-text">
            Tambah Yayasan
          </span>
        </div>

        {/* Header Title */}
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              aria-label="Kembali ke halaman yayasan"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border theme-border theme-card theme-text-secondary ${themeSmallShadow} transition-all duration-200 hover:border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] hover:text-[var(--color-primary)] active:scale-95`}
            >
              <ArrowLeft size={19} />
            </button>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight theme-text sm:text-2xl">
                  Tambah Yayasan Baru
                </h1>

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  FULL PAGE FORM
                </span>
              </div>

              <p className="mt-1 max-w-2xl text-xs leading-5 theme-text-secondary sm:text-sm">
                Daftarkan lembaga yayasan pendidikan ke dalam sistem SmartSchool dengan NPYP resmi.
              </p>
            </div>
          </div>

          <div
            className={`hidden shrink-0 items-center gap-2.5 rounded-xl border theme-border theme-card px-3 py-2.5 md:flex ${themeSmallShadow}`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySoft} text-[var(--color-primary)]`}
            >
              <Landmark size={17} />
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider theme-text-muted">
                Endpoint
              </p>
              <p className="text-xs font-mono font-bold theme-text">
                POST /api/yayasan
              </p>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {success && (
          <div className={`mb-6 rounded-2xl border p-4 ${themeSuccessSoft} ${themeSuccessBorder} flex items-center gap-3`}>
            <CheckCircle2 size={20} className="text-[var(--color-success)] shrink-0" />
            <div>
              <p className="text-sm font-semibold theme-text">Pendaftaran Berhasil</p>
              <p className="text-xs theme-text-secondary">{success}. Mengalihkan ke daftar yayasan...</p>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className={`mb-6 rounded-2xl border p-4 ${themeDangerSoft} ${themeDangerBorder} flex items-start gap-3`}>
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">Pendaftaran Gagal</p>
              <p className="text-xs text-red-500 dark:text-red-300 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Section: Identitas Yayasan */}
          <section
            className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
          >
            <div className={`border-b ${themeDivider} px-4 py-4 sm:px-6`}>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  <Building2 size={19} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-bold theme-text sm:text-base">
                    Identitas Lembaga Yayasan
                  </h2>
                  <p className="mt-0.5 text-xs theme-text-muted">
                    Data pokok yayasan sesuai registrasi kementerian/dinas terkait
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  label="Nama Yayasan"
                  required
                  icon={<Landmark size={15} />}
                  error={fieldErrors.nama}
                >
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder="Contoh: Yayasan Pendidikan Smart School"
                    className={inputClass}
                    required
                  />
                </FormField>

                <FormField
                  label="Nomor Pokok Yayasan Pendidikan (NPYP)"
                  required
                  icon={<FileText size={15} />}
                  error={fieldErrors.npyp}
                >
                  <div>
                    <input
                      type="text"
                      name="npyp"
                      value={formData.npyp}
                      onChange={handleChange}
                      placeholder="Format: YYS-XXXXXX (contoh: YYS-987654)"
                      className={`${inputClass} font-mono`}
                      required
                    />
                    <p className="mt-1 text-[11px] theme-text-muted flex items-center gap-1">
                      <Info size={12} />
                      Wajib diawali `YYS-` diikuti 6 angka. Backend memvalidasi duplikasi.
                    </p>
                  </div>
                </FormField>

                <FormField label="Status Yayasan" icon={<CheckCircle2 size={15} />}>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </FormField>

                <FormField
                  label="Email Resmi Yayasan"
                  icon={<Mail size={15} />}
                  error={fieldErrors.email}
                >
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="info@yayasan-smartschool.sch.id"
                    className={inputClass}
                  />
                </FormField>

                <FormField
                  label="No. Telepon / Hotline"
                  icon={<Phone size={15} />}
                >
                  <input
                    type="text"
                    name="telepon"
                    value={formData.telepon}
                    onChange={handleChange}
                    placeholder="021-12345678 atau 08123456789"
                    className={inputClass}
                  />
                </FormField>

                <FormField
                  label="Alamat Lengkap Kantor Yayasan"
                  className="md:col-span-2"
                  icon={<MapPin size={15} />}
                >
                  <textarea
                    rows={3}
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    placeholder="Masukkan alamat kantor pusat yayasan, nama jalan, kota, provinsi..."
                    className={`${inputClass} min-h-[95px] resize-none`}
                  />
                </FormField>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className={`border-t ${themeDivider} pt-5`}>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="hidden text-xs theme-text-muted sm:block">
                <span className="font-bold text-[var(--color-primary)]">*</span> Field wajib diisi
              </p>

              <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={loading}
                  className={`w-full rounded-xl border theme-border theme-card px-6 py-2.5 text-sm font-semibold theme-text-secondary ${themeSmallShadow} transition-all duration-200 hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] active:scale-[0.98] disabled:opacity-50 sm:w-auto`}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-[var(--color-card)] ${themeSmallShadow} transition-all duration-200 hover:opacity-90 hover:shadow-md active:scale-[0.98] disabled:opacity-60 sm:w-auto`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Menyimpan ke Server...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Simpan Yayasan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  required = false,
  icon,
  children,
  error,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold theme-text-secondary">
        {icon && <span className="theme-text-muted">{icon}</span>}
        <span>{label}</span>
        {required && <span className="text-[var(--color-primary)]">*</span>}
      </label>

      {children}

      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}
