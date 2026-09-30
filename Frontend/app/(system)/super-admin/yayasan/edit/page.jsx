"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Landmark,
  MapPin,
  Mail,
  Phone,
  Globe,
  Upload,
  User,
  Hash,
  FileText,
  Save,
  ChevronRight,
} from "lucide-react";

// =============================================================
// THEME HELPERS
// =============================================================
const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

// =============================================================
// INPUT STYLE
// =============================================================
const inputClass = `
  w-full rounded-lg
  border theme-border
  theme-card
  px-3.5 py-2.5
  text-sm theme-text
  outline-none transition-all
  placeholder:theme-text-placeholder
  ${themeFocus}
`;

const selectClass = `
  w-full rounded-lg
  border theme-border
  theme-card
  px-3.5 py-2.5
  text-sm theme-text
  outline-none transition-all
  ${themeFocus}
`;

// =============================================================
// EDIT YAYASAN
// =============================================================
export default function EditYayasanPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    namaYayasan: "Yayasan Pendidikan Nusantara",
    kodeYayasan: "YPN-001",
    ketuaYayasan: "Budi Santoso",
    status: "Aktif",
    email: "info@ypnusantara.sch.id",
    telepon: "021-77889900",
    website: "https://ypnusantara.sch.id",

    provinsi: "Jawa Barat",
    kabupaten: "Kota Depok",
    kecamatan: "Cimanggis",
    kelurahan: "Tugu",
    kodePos: "16451",
    alamat:
      "Jl. Pendidikan No. 10, Kelurahan Tugu, Kecamatan Cimanggis, Kota Depok, Jawa Barat",
  });

  const [logoPreview, setLogoPreview] = useState(null);

  // =========================================================
  // HANDLE CHANGE
  // =========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // HANDLE LOGO
  // =========================================================
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
  };

  // =========================================================
  // SUBMIT
  // =========================================================
  const handleSubmit = (e) => {
    e.preventDefault();

    // FE saja untuk sekarang
    console.log("Data Yayasan:", formData);

    alert("Data yayasan berhasil disimpan!");

    router.push("/super-admin/yayasan");
  };

  // =========================================================
  // BACK
  // =========================================================
  const goBack = () => {
    router.push("/super-admin/yayasan");
  };

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1400px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* =====================================================
            BREADCRUMB
        ===================================================== */}
        <div className="mb-5 flex items-center gap-2 text-sm">
          <button
            onClick={goBack}
            className="theme-text-secondary transition-colors hover:text-[var(--color-primary)]"
          >
            Yayasan
          </button>

          <ChevronRight
            size={16}
            className="theme-text-muted"
          />

          <span className="font-medium theme-text">
            Edit Yayasan
          </span>
        </div>

        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold theme-text">
                Edit Yayasan
              </h1>

              <span
                className={`rounded-full ${themePrimarySoft} border ${themePrimarySoftBorder} px-3 py-1 text-xs font-semibold text-[var(--color-primary)]`}
              >
                EDIT DATA
              </span>
            </div>

            <p className="text-sm theme-text-secondary">
              Perbarui informasi dan data yayasan yang sudah terdaftar.
            </p>
          </div>

          <button
            onClick={goBack}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border ${themeNeutralBorder} ${themeCardShadow} theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary transition-all ${themeNeutralHover}`}
          >
            <ArrowLeft size={17} />

            Kembali
          </button>
        </div>

        {/* =====================================================
            FORM
        ===================================================== */}
        <form onSubmit={handleSubmit}>
          <div
            className={`theme-card overflow-hidden rounded-xl border theme-border ${themeCardShadow}`}
          >
            {/* =================================================
                CARD HEADER
            ================================================= */}
            <div
              className={`border-b ${themeDivider} px-5 py-5 sm:px-6`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${themePrimarySoft} border ${themePrimarySoftBorder}`}
                >
                  <Landmark
                    className="h-5 w-5 text-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <h2 className="text-base font-semibold theme-text">
                    Form / Data Yayasan
                  </h2>

                  <p className="mt-0.5 text-sm theme-text-secondary">
                    Silakan ubah informasi yayasan sesuai data terbaru.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                INFORMASI YAYASAN
            ================================================= */}
            <div
              className={`border-b ${themeDivider} px-5 py-6 sm:px-6`}
            >
              <div className="mb-5">
                <h3 className="text-sm font-semibold theme-text">
                  Informasi Yayasan
                </h3>

                <p className="mt-1 text-xs theme-text-secondary">
                  Informasi utama mengenai yayasan.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Nama */}
                <FormField
                  label="Nama Yayasan"
                  required
                  icon={<Landmark size={16} />}
                >
                  <input
                    type="text"
                    name="namaYayasan"
                    value={formData.namaYayasan}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Masukkan nama yayasan"
                  />
                </FormField>

                {/* Kode */}
                <FormField
                  label="Kode Yayasan"
                  required
                  icon={<Hash size={16} />}
                >
                  <input
                    type="text"
                    name="kodeYayasan"
                    value={formData.kodeYayasan}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Contoh: YPN-001"
                  />
                </FormField>

                {/* Ketua */}
                <FormField
                  label="Ketua Yayasan"
                  required
                  icon={<User size={16} />}
                >
                  <input
                    type="text"
                    name="ketuaYayasan"
                    value={formData.ketuaYayasan}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Nama ketua yayasan"
                  />
                </FormField>

                {/* Status */}
                <FormField
                  label="Status"
                  required
                >
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="Aktif">
                      Aktif
                    </option>

                    <option value="Trial">
                      Trial
                    </option>

                    <option value="Nonaktif">
                      Nonaktif
                    </option>
                  </select>
                </FormField>

                {/* Email */}
                <FormField
                  label="Email"
                  icon={<Mail size={16} />}
                >
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="email@yayasan.sch.id"
                  />
                </FormField>

                {/* Telepon */}
                <FormField
                  label="No. Telepon"
                  icon={<Phone size={16} />}
                >
                  <input
                    type="text"
                    name="telepon"
                    value={formData.telepon}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="021-xxxxxxx"
                  />
                </FormField>

                {/* Website */}
                <div className="md:col-span-2">
                  <FormField
                    label="Website"
                    icon={<Globe size={16} />}
                  >
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="https://website-yayasan.sch.id"
                    />
                  </FormField>
                </div>

                {/* =================================================
                    LOGO
                ================================================= */}
                <div className="md:col-span-2">
                  <FormField
                    label="Logo Yayasan"
                    icon={<Upload size={16} />}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <label
                        className={`
                          flex h-28 w-28 cursor-pointer
                          items-center justify-center
                          overflow-hidden rounded-xl
                          border-2 border-dashed
                          ${themeNeutralBorder}
                          ${themeNeutralSurface}
                          transition-all
                          hover:border-[color-mix(in_srgb,var(--color-primary)_45%,transparent)]
                          hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)]
                        `}
                      >
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Preview logo"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 theme-text-muted">
                            <Upload size={22} />

                            <span className="text-xs">
                              Upload
                            </span>
                          </div>
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>

                      <div>
                        <p className="text-sm font-medium theme-text">
                          Ganti Logo Yayasan
                        </p>

                        <p className="mt-1 text-xs leading-5 theme-text-secondary">
                          Format JPG, PNG atau WEBP.
                          <br />
                          Maksimal ukuran file 2 MB.
                        </p>
                      </div>
                    </div>
                  </FormField>
                </div>
              </div>
            </div>

            {/* =================================================
                ALAMAT
            ================================================= */}
            <div className="px-5 py-6 sm:px-6">
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <MapPin
                    size={18}
                    className="text-[var(--color-primary)]"
                  />

                  <h3 className="text-sm font-semibold theme-text">
                    Alamat Yayasan
                  </h3>
                </div>

                <p className="mt-1 text-xs theme-text-secondary">
                  Perbarui informasi lokasi dan alamat yayasan.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Provinsi */}
                <FormField label="Provinsi">
                  <select
                    name="provinsi"
                    value={formData.provinsi}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="">
                      Pilih Provinsi
                    </option>

                    <option value="Jawa Barat">
                      Jawa Barat
                    </option>

                    <option value="DKI Jakarta">
                      DKI Jakarta
                    </option>

                    <option value="Banten">
                      Banten
                    </option>

                    <option value="Jawa Tengah">
                      Jawa Tengah
                    </option>

                    <option value="Jawa Timur">
                      Jawa Timur
                    </option>
                  </select>
                </FormField>

                {/* Kabupaten */}
                <FormField label="Kabupaten / Kota">
                  <select
                    name="kabupaten"
                    value={formData.kabupaten}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="">
                      Pilih Kabupaten / Kota
                    </option>

                    <option value="Kota Depok">
                      Kota Depok
                    </option>

                    <option value="Kota Bogor">
                      Kota Bogor
                    </option>

                    <option value="Kabupaten Bogor">
                      Kabupaten Bogor
                    </option>

                    <option value="Kota Bekasi">
                      Kota Bekasi
                    </option>

                    <option value="Kota Bandung">
                      Kota Bandung
                    </option>
                  </select>
                </FormField>

                {/* Kecamatan */}
                <FormField label="Kecamatan">
                  <input
                    type="text"
                    name="kecamatan"
                    value={formData.kecamatan}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Masukkan kecamatan"
                  />
                </FormField>

                {/* Kelurahan */}
                <FormField label="Kelurahan">
                  <input
                    type="text"
                    name="kelurahan"
                    value={formData.kelurahan}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Masukkan kelurahan"
                  />
                </FormField>

                {/* Kode Pos */}
                <FormField label="Kode Pos">
                  <input
                    type="text"
                    name="kodePos"
                    value={formData.kodePos}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Contoh: 16451"
                  />
                </FormField>

                {/* Alamat */}
                <div className="md:col-span-2">
                  <FormField
                    label="Alamat Lengkap"
                    icon={<FileText size={16} />}
                  >
                    <textarea
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleChange}
                      rows={4}
                      className={`${inputClass} resize-none`}
                      placeholder="Masukkan alamat lengkap yayasan"
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* =================================================
                FOOTER ACTION
            ================================================= */}
            <div
              className={`
                flex flex-col-reverse gap-3
                border-t ${themeDivider}
                ${themeNeutralSurface}
                px-5 py-5 sm:flex-row sm:justify-end sm:px-6
              `}
            >
              <button
                type="button"
                onClick={goBack}
                className={`
                  inline-flex items-center justify-center gap-2
                  rounded-lg
                  border ${themeNeutralBorder}
                  theme-card
                  px-5 py-2.5
                  text-sm font-medium
                  theme-text-secondary
                  transition-all
                  ${themeNeutralHover}
                `}
              >
                Batal
              </button>

              <button
                type="submit"
                className="
                  inline-flex items-center justify-center gap-2
                  rounded-lg
                  bg-[var(--color-primary)]
                  px-5 py-2.5
                  text-sm font-semibold
                  text-[var(--color-card)]
                  shadow-[0_6px_16px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]
                  transition-all
                  hover:opacity-90
                "
              >
                <Save size={17} />

                Simpan Perubahan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================================
// FORM FIELD
// =============================================================
function FormField({
  label,
  required,
  icon,
  children,
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-sm font-medium theme-text-secondary">
        {icon && (
          <span className="theme-text-muted">
            {icon}
          </span>
        )}

        {label}

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