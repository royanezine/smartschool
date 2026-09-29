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
  Building2,
  User,
  Hash,
  FileText,
  Save,
  ChevronRight,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

export default function EditYayasanPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // FE saja untuk sekarang
    console.log("Data Yayasan:", formData);

    alert("Data yayasan berhasil disimpan!");
    router.push("/super-admin/yayasan");
  };

  const goBack = () => {
    router.push("/super-admin/yayasan");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activeMenu="yayasan"
      />

      <div
        className={`transition-all duration-300 ${
          isCollapsed ? "ml-[80px]" : "ml-[260px]"
        }`}
      >
        <Header
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          notifications={3}
        />

        <main className="px-6 py-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-5 flex items-center gap-2 text-sm">
            <button
              onClick={goBack}
              className="text-slate-500 transition hover:text-blue-600"
            >
              Yayasan
            </button>

            <ChevronRight size={16} className="text-slate-400" />

            <span className="font-medium text-slate-800">
              Edit Yayasan
            </span>
          </div>

          {/* Header */}
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  Edit Yayasan
                </h1>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  EDIT DATA
                </span>
              </div>

              <p className="text-sm text-slate-500">
                Perbarui informasi dan data yayasan yang sudah terdaftar.
              </p>
            </div>

            <button
              onClick={goBack}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
              Kembali
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Form Card */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {/* Card Header */}
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Landmark className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Form / Data Yayasan
                    </h2>

                    <p className="mt-0.5 text-sm text-slate-500">
                      Silakan ubah informasi yayasan sesuai data terbaru.
                    </p>
                  </div>
                </div>
              </div>

              {/* Informasi Yayasan */}
              <div className="border-b border-slate-200 px-6 py-6">
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Informasi Yayasan
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Informasi utama mengenai yayasan.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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

                  <FormField label="Status" required>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Trial">Trial</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </FormField>

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

                  {/* Logo */}
                  <div className="md:col-span-2">
                    <FormField
                      label="Logo Yayasan"
                      icon={<Upload size={16} />}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <label className="flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-400 hover:bg-blue-50">
                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt="Preview logo"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-slate-400">
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
                          <p className="text-sm font-medium text-slate-700">
                            Ganti Logo Yayasan
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
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

              {/* Alamat */}
              <div className="px-6 py-6">
                <div className="mb-5">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-blue-600" />

                    <h3 className="text-sm font-semibold text-slate-900">
                      Alamat Yayasan
                    </h3>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Perbarui informasi lokasi dan alamat yayasan.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormField label="Provinsi">
                    <select
                      name="provinsi"
                      value={formData.provinsi}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      <option value="">Pilih Provinsi</option>
                      <option value="Jawa Barat">Jawa Barat</option>
                      <option value="DKI Jakarta">
                        DKI Jakarta
                      </option>
                      <option value="Banten">Banten</option>
                      <option value="Jawa Tengah">
                        Jawa Tengah
                      </option>
                      <option value="Jawa Timur">
                        Jawa Timur
                      </option>
                    </select>
                  </FormField>

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

              {/* Footer Action */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  <Save size={17} />
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

/* =========================
   COMPONENT
========================= */

function FormField({ label, required, icon, children }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700">
        {icon && (
          <span className="text-slate-400">
            {icon}
          </span>
        )}

        {label}

        {required && (
          <span className="text-red-500">*</span>
        )}
      </label>

      {children}
    </div>
  );
}

/* =========================
   STYLE
========================= */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const selectClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";