"use client";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Landmark,
  MapPin,
  Mail,
  Phone,
  Globe,
  Upload,
  Building2,
  User,
  Hash,
  FileText,
  Save,
  ChevronRight,
} from "lucide-react";

export default function TambahYayasanPage() {
  const router = useRouter();

  const goBack = () => {
    router.push("/super-admin/yayasan");
  };

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
        {/* ===================================================
            BREADCRUMB
        =================================================== */}
        <div className="mb-5 flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={goBack}
            className="font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
          >
            Yayasan
          </button>

          <ChevronRight
            size={13}
            className="text-[var(--color-text-placeholder)]"
          />

          <span className="font-semibold theme-text">
            Tambah Yayasan
          </span>
        </div>

        {/* ===================================================
            PAGE HEADER
        =================================================== */}
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* LEFT */}
          <div className="flex min-w-0 items-center gap-3">
            {/* BACK */}
            <button
              type="button"
              onClick={goBack}
              aria-label="Kembali ke halaman yayasan"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border theme-border theme-card theme-text-secondary ${themeSmallShadow} transition-all duration-200 hover:border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] hover:text-[var(--color-primary)] active:scale-95`}
            >
              <ArrowLeft size={19} />
            </button>

            {/* TITLE */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight theme-text sm:text-2xl">
                  Tambah Yayasan
                </h1>

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  DATA BARU
                </span>
              </div>

              <p className="mt-1 max-w-2xl text-xs leading-5 theme-text-secondary sm:text-sm">
                Lengkapi informasi yayasan untuk mendaftarkan yayasan
                baru ke dalam sistem SmartSchool.
              </p>
            </div>
          </div>

          {/* INFO CARD */}
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
                Form
              </p>

              <p className="text-xs font-bold theme-text">
                Data Yayasan
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================
            FORM
        =================================================== */}
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          {/* =================================================
              INFORMASI YAYASAN
          ================================================= */}
          <section
            className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
          >
            {/* SECTION HEADER */}
            <div className={`border-b ${themeDivider} px-4 py-4 sm:px-6`}>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  <Building2 size={19} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-bold theme-text sm:text-base">
                    Informasi Yayasan
                  </h2>

                  <p className="mt-0.5 text-xs theme-text-muted">
                    Informasi dasar mengenai yayasan
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION CONTENT */}
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* NAMA YAYASAN */}
                <FormField
                  label="Nama Yayasan"
                  required
                  icon={<Landmark size={15} />}
                >
                  <input
                    type="text"
                    placeholder="Contoh: Yayasan Bina Insani"
                    className={inputClass}
                  />
                </FormField>

                {/* KODE YAYASAN */}
                <FormField
                  label="Kode Yayasan"
                  required
                  icon={<Hash size={15} />}
                >
                  <input
                    type="text"
                    placeholder="Contoh: YP-001"
                    className={inputClass}
                  />
                </FormField>

                {/* KETUA */}
                <FormField
                  label="Ketua Yayasan"
                  required
                  icon={<User size={15} />}
                >
                  <input
                    type="text"
                    placeholder="Masukkan nama ketua yayasan"
                    className={inputClass}
                  />
                </FormField>

                {/* STATUS */}
                <FormField label="Status">
                  <select
                    className={selectClass}
                    defaultValue="Aktif"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Trial">Trial</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </FormField>

                {/* EMAIL */}
                <FormField
                  label="Email"
                  icon={<Mail size={15} />}
                >
                  <input
                    type="email"
                    placeholder="yayasan@email.com"
                    className={inputClass}
                  />
                </FormField>

                {/* TELEPON */}
                <FormField
                  label="No. Telepon"
                  icon={<Phone size={15} />}
                >
                  <input
                    type="text"
                    placeholder="021-12345678"
                    className={inputClass}
                  />
                </FormField>

                {/* WEBSITE */}
                <FormField
                  label="Website"
                  icon={<Globe size={15} />}
                >
                  <input
                    type="text"
                    placeholder="https://yayasan.or.id"
                    className={inputClass}
                  />
                </FormField>

                {/* LOGO */}
                <FormField label="Logo Yayasan">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className={`block w-full cursor-pointer rounded-xl border theme-border ${themeNeutralSurface} text-xs theme-text-secondary outline-none transition hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] file:mr-3 file:cursor-pointer file:border-0 file:${themePrimarySoft} file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[var(--color-primary)] hover:file:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]`}
                    />

                    <Upload
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />
                  </div>

                  <p className="mt-1.5 text-[10px] theme-text-muted">
                    JPG / PNG / WEBP · Maksimal 2MB
                  </p>
                </FormField>
              </div>
            </div>
          </section>

          {/* =================================================
              ALAMAT YAYASAN
          ================================================= */}
          <section
            className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
          >
            {/* SECTION HEADER */}
            <div className={`border-b ${themeDivider} px-4 py-4 sm:px-6`}>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themeInfoSurface} text-[var(--color-info)]`}
                >
                  <MapPin size={19} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-bold theme-text sm:text-base">
                    Alamat Yayasan
                  </h2>

                  <p className="mt-0.5 text-xs theme-text-muted">
                    Lokasi dan alamat lengkap yayasan
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION CONTENT */}
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* PROVINSI */}
                <FormField
                  label="Provinsi"
                  required
                >
                  <select
                    className={selectClass}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Pilih provinsi
                    </option>

                    <option value="DKI Jakarta">
                      DKI Jakarta
                    </option>

                    <option value="Banten">
                      Banten
                    </option>

                    <option value="Jawa Barat">
                      Jawa Barat
                    </option>

                    <option value="Jawa Tengah">
                      Jawa Tengah
                    </option>

                    <option value="Jawa Timur">
                      Jawa Timur
                    </option>

                    <option value="Bali">
                      Bali
                    </option>
                  </select>
                </FormField>

                {/* KABUPATEN */}
                <FormField
                  label="Kabupaten / Kota"
                  required
                >
                  <select
                    className={selectClass}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Pilih kabupaten / kota
                    </option>

                    <option value="Depok">Depok</option>
                    <option value="Bogor">Bogor</option>
                    <option value="Bekasi">Bekasi</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Tangerang">
                      Tangerang
                    </option>
                    <option value="Tangerang Selatan">
                      Tangerang Selatan
                    </option>
                    <option value="Jakarta Selatan">
                      Jakarta Selatan
                    </option>
                    <option value="Jakarta Pusat">
                      Jakarta Pusat
                    </option>
                    <option value="Denpasar">
                      Denpasar
                    </option>
                    <option value="Surabaya">
                      Surabaya
                    </option>
                  </select>
                </FormField>

                {/* KECAMATAN */}
                <FormField label="Kecamatan">
                  <input
                    type="text"
                    placeholder="Masukkan kecamatan"
                    className={inputClass}
                  />
                </FormField>

                {/* KELURAHAN */}
                <FormField label="Kelurahan">
                  <input
                    type="text"
                    placeholder="Masukkan kelurahan"
                    className={inputClass}
                  />
                </FormField>

                {/* KODE POS */}
                <FormField label="Kode Pos">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Contoh: 16452"
                    className={inputClass}
                  />
                </FormField>

                {/* ALAMAT LENGKAP */}
                <FormField
                  label="Alamat Lengkap"
                  required
                  className="md:col-span-2"
                >
                  <div className="relative">
                    <textarea
                      rows={3}
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

          {/* =================================================
              AKSI
          ================================================= */}
          <div className={`border-t ${themeDivider} pt-5`}>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* INFO */}
              <p className="hidden text-xs theme-text-muted sm:block">
                <span className="font-bold text-[var(--color-primary)]">
                  *
                </span>{" "}
                Field wajib diisi
              </p>

              {/* BUTTON */}
              <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                {/* BATAL */}
                <button
                  type="button"
                  onClick={goBack}
                  className={`w-full rounded-xl border theme-border theme-card px-6 py-2.5 text-sm font-semibold theme-text-secondary ${themeSmallShadow} transition-all duration-200 hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] active:scale-[0.98] sm:w-auto`}
                >
                  Batal
                </button>

                {/* SIMPAN */}
                <button
                  type="submit"
                  className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-[var(--color-card)] ${themeSmallShadow} transition-all duration-200 hover:opacity-90 hover:shadow-md active:scale-[0.98] sm:w-auto`}
                >
                  <Save size={16} />
                  Simpan Yayasan
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
   FORM FIELD COMPONENT
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
        {icon && (
          <span className="theme-text-muted">
            {icon}
          </span>
        )}

        <span>{label}</span>

        {required && (
          <span className="text-[var(--color-primary)]">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

/* ================================================================
   THEME HELPERS
================================================================ */

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

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

/* ================================================================
   INPUT STYLE
================================================================ */

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

/* ================================================================
   SELECT STYLE
================================================================ */

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