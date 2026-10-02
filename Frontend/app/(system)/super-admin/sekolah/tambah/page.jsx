
"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  School,
  MapPin,
  Mail,
  Phone,
  Globe,
  Upload,
  Building2,
  Hash,
  FileText,
  Save,
  Calendar,
  ChevronRight,
} from "lucide-react";

/* ================================================================
   THEME HELPERS
================================================================ */

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

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

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

/* FIX: Variabel yang sebelumnya belum didefinisikan */
const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] hover:border-[color-mix(in_srgb,var(--color-text)_16%,transparent)]";

const themePrimaryButton =
  "bg-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,var(--color-text))] text-[var(--color-card)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

/* ================================================================
   INPUT STYLE
================================================================ */

const inputClass = `
  w-full
  rounded-xl
  border
  theme-border
  theme-input
  px-3
  py-2.5
  text-sm
  theme-text
  outline-none
  transition-all
  duration-200
  placeholder:theme-text-placeholder
  hover:border-[color-mix(in_srgb,var(--color-primary)_20%,var(--color-border))]
  ${themeFocus}
`;

const selectClass = `
  w-full
  cursor-pointer
  rounded-xl
  border
  theme-border
  theme-input
  px-3
  py-2.5
  text-sm
  theme-text
  outline-none
  transition-all
  duration-200
  hover:border-[color-mix(in_srgb,var(--color-primary)_20%,var(--color-border))]
  ${themeFocus}
`;

const fileInputClass = `
  block
  w-full
  cursor-pointer
  rounded-xl
  border
  theme-border
  theme-input
  text-xs
  theme-text-secondary
  outline-none
  transition
  hover:border-[color-mix(in_srgb,var(--color-primary)_20%,var(--color-border))]
  file:mr-3
  file:cursor-pointer
  file:border-0
  file:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]
  file:px-3
  file:py-2
  file:text-xs
  file:font-semibold
  file:text-[var(--color-primary)]
  hover:file:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]
`;

/* ================================================================
   PAGE
================================================================ */

export default function TambahSekolahPage() {
  const router = useRouter();

  const goBack = () => {
    router.push("/super-admin/sekolah");
  };

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
        {/* BREADCRUMB */}
        <div className="mb-5 flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={goBack}
            className="font-medium theme-text-muted transition-colors hover:text-[var(--color-primary)]"
          >
            Sekolah
          </button>

          <ChevronRight size={13} className="theme-text-muted" />

          <span className="font-semibold theme-text-secondary">
            Tambah Sekolah
          </span>
        </div>

        {/* PAGE HEADER */}
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              aria-label="Kembali ke halaman sekolah"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} theme-text-muted ${themeSmallShadow} transition-all duration-200 hover:border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] hover:text-[var(--color-primary)] active:scale-95`}
            >
              <ArrowLeft size={19} />
            </button>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight theme-text sm:text-2xl">
                  Tambah Sekolah
                </h1>

                <span
                  className={`rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} px-2.5 py-1 text-[10px] font-bold tracking-wide text-[var(--color-primary)]`}
                >
                  DATA BARU
                </span>
              </div>

              <p className="mt-1 max-w-2xl text-xs leading-5 theme-text-muted sm:text-sm">
                Lengkapi informasi sekolah untuk mendaftarkan
                sekolah baru ke dalam sistem SmartSchool.
              </p>
            </div>
          </div>

          {/* INFO CARD */}
          <div
            className={`hidden shrink-0 items-center gap-2.5 rounded-xl border theme-border theme-card px-3 py-2.5 ${themeCardShadow} md:flex`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg border ${themeInfoBorder} ${themeInfoSurface} text-[var(--color-info)]`}
            >
              <School size={17} />
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider theme-text-muted">
                Form
              </p>
              <p className="text-xs font-bold theme-text-secondary">
                Data Sekolah
              </p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          {/* INFORMASI SEKOLAH */}
          <section
            className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
          >
            <div className={`border-b ${themeDivider} px-4 py-4 sm:px-6`}>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  <School size={19} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-bold theme-text sm:text-base">
                    Informasi Sekolah
                  </h2>
                  <p className="mt-0.5 text-xs theme-text-muted">
                    Informasi dasar mengenai sekolah
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField label="Nama Sekolah" required icon={<School size={15} />}>
                  <input
                    type="text"
                    name="namaSekolah"
                    placeholder="Contoh: SMK Taruna Bhakti"
                    required
                    className={inputClass}
                  />
                </FormField>

                <FormField label="NPSN" required icon={<Hash size={15} />}>
                  <input
                    type="text"
                    name="npsn"
                    placeholder="Masukkan NPSN"
                    required
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Jenjang" required>
                  <select name="jenjang" required defaultValue="" className={selectClass}>
                    <option value="" disabled>
                      Pilih jenjang
                    </option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="SMK">SMK</option>
                  </select>
                </FormField>

                <FormField label="Status Sekolah">
                  <select name="statusSekolah" defaultValue="Negeri" className={selectClass}>
                    <option value="Negeri">Negeri</option>
                    <option value="Swasta">Swasta</option>
                  </select>
                </FormField>

                <FormField label="Email" icon={<Mail size={15} />}>
                  <input
                    type="email"
                    name="email"
                    placeholder="sekolah@email.com"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="No. Telepon" icon={<Phone size={15} />}>
                  <input
                    type="tel"
                    name="telepon"
                    placeholder="021-12345678"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Website" icon={<Globe size={15} />}>
                  <input
                    type="url"
                    name="website"
                    placeholder="https://sekolah.sch.id"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Logo Sekolah">
                  <div className="relative">
                    <input
                      type="file"
                      name="logo"
                      accept="image/png,image/jpeg,image/jpg"
                      className={fileInputClass}
                    />
                    <Upload
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] theme-text-muted">
                    JPG / PNG · Maksimal 2MB
                  </p>
                </FormField>
              </div>
            </div>
          </section>

          {/* ALAMAT SEKOLAH */}
          <section
            className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
          >
            <div className={`border-b ${themeDivider} px-4 py-4 sm:px-6`}>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${themeSuccessBorder} ${themeSuccessSurface} text-[var(--color-success)]`}
                >
                  <MapPin size={19} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-bold theme-text sm:text-base">
                    Alamat Sekolah
                  </h2>
                  <p className="mt-0.5 text-xs theme-text-muted">
                    Lokasi dan alamat lengkap sekolah
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField label="Provinsi" required>
                  <select name="provinsi" required defaultValue="" className={selectClass}>
                    <option value="" disabled>
                      Pilih provinsi
                    </option>
                    <option value="DKI Jakarta">DKI Jakarta</option>
                    <option value="Banten">Banten</option>
                    <option value="Jawa Barat">Jawa Barat</option>
                    <option value="Jawa Tengah">Jawa Tengah</option>
                    <option value="Jawa Timur">Jawa Timur</option>
                    <option value="Bali">Bali</option>
                    <option value="Sumatera Utara">Sumatera Utara</option>
                    <option value="Sumatera Selatan">Sumatera Selatan</option>
                  </select>
                </FormField>

                <FormField label="Kabupaten / Kota" required>
                  <select name="kabupatenKota" required defaultValue="" className={selectClass}>
                    <option value="" disabled>
                      Pilih kabupaten / kota
                    </option>
                    <option value="Depok">Depok</option>
                    <option value="Bogor">Bogor</option>
                    <option value="Bekasi">Bekasi</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Tangerang">Tangerang</option>
                    <option value="Tangerang Selatan">Tangerang Selatan</option>
                    <option value="Jakarta Selatan">Jakarta Selatan</option>
                    <option value="Jakarta Pusat">Jakarta Pusat</option>
                    <option value="Denpasar">Denpasar</option>
                    <option value="Surabaya">Surabaya</option>
                  </select>
                </FormField>

                <FormField label="Kecamatan">
                  <input
                    type="text"
                    name="kecamatan"
                    placeholder="Masukkan kecamatan"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Kelurahan">
                  <input
                    type="text"
                    name="kelurahan"
                    placeholder="Masukkan kelurahan"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Kode Pos">
                  <input
                    type="text"
                    name="kodePos"
                    inputMode="numeric"
                    placeholder="Contoh: 16452"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Alamat Lengkap" required className="md:col-span-2">
                  <div className="relative">
                    <textarea
                      name="alamat"
                      rows={3}
                      required
                      placeholder="Masukkan alamat lengkap, jalan, nomor, RT/RW, dan informasi lainnya..."
                      className={`${inputClass} min-h-[95px] resize-none pr-10`}
                    />
                    <FileText
                      size={15}
                      className="pointer-events-none absolute right-3 top-3 theme-text-muted"
                    />
                  </div>
                </FormField>
              </div>
            </div>
          </section>

          {/* YAYASAN & PAKET */}
          <section
            className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
          >
            <div className={`border-b ${themeDivider} px-4 py-4 sm:px-6`}>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${themeInfoBorder} ${themeInfoSurface} text-[var(--color-info)]`}
                >
                  <Building2 size={19} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-bold theme-text sm:text-base">
                    Yayasan & Paket Langganan
                  </h2>
                  <p className="mt-0.5 text-xs theme-text-muted">
                    Atur yayasan dan paket yang digunakan sekolah
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField label="Yayasan">
                  <select name="yayasan" defaultValue="-" className={selectClass}>
                    <option value="-">- Tanpa Yayasan -</option>
                    <option value="Yayasan Al-Azhar">Yayasan Al-Azhar</option>
                    <option value="Yayasan BPK Penabur">Yayasan BPK Penabur</option>
                    <option value="Yayasan Pengembangan Pendidikan">
                      Yayasan Pengembangan Pendidikan
                    </option>
                    <option value="Yayasan Bina Insani">Yayasan Bina Insani</option>
                    <option value="Yayasan Al-Falah">Yayasan Al-Falah</option>
                  </select>
                </FormField>

                <FormField label="Paket Langganan" required>
                  <select name="paketLangganan" required defaultValue="" className={selectClass}>
                    <option value="" disabled>
                      Pilih paket langganan
                    </option>
                    <option value="Starter">Starter</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </FormField>

                <FormField label="Tanggal Mulai">
                  <div className="relative">
                    <Calendar
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />
                    <input
                      type="date"
                      name="tanggalMulai"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </FormField>

                <FormField label="Tanggal Berakhir">
                  <div className="relative">
                    <Calendar
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />
                    <input
                      type="date"
                      name="tanggalBerakhir"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </FormField>

                <FormField label="Status" required>
                  <select name="status" required defaultValue="Aktif" className={selectClass}>
                    <option value="Aktif">Aktif</option>
                    <option value="Trial">Trial</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </FormField>
              </div>
            </div>
          </section>

          {/* ACTION BAR */}
          <div className={`border-t ${themeDivider} pt-5`}>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="hidden text-xs theme-text-muted sm:block">
                <span className="font-bold text-[var(--color-warning)]">*</span>{" "}
                Field wajib diisi
              </p>

              <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                <button
                  type="button"
                  onClick={goBack}
                  className={`w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-6 py-2.5 text-sm font-semibold theme-text-secondary ${themeSmallShadow} transition-all duration-200 ${themeNeutralHover} active:scale-[0.98] sm:w-auto`}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold ${themePrimaryButton} ${themeSmallShadow} transition-all duration-200 hover:shadow-md active:scale-[0.98] sm:w-auto`}
                >
                  <Save size={16} />
                  Simpan Sekolah
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================================================================
   REUSABLE FORM FIELD
================================================================ */

function FormField({
  label,
  required = false,
  icon,
  children,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold theme-text-secondary">
        {icon && <span className="theme-text-muted">{icon}</span>}
        <span>{label}</span>
        {required && (
          <span className="text-[var(--color-warning)]">*</span>
        )}
      </label>

      {children}
    </div>
  );
}