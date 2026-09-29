"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

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

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu] = useState("yayasan");

  const notifications = [
    {
      id: 1,
      title: "Pembaruan Sistem v2.0",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Pengingat: Backup Data",
      desc: "Dikirim 1 hari lalu",
      read: false,
    },
    {
      id: 3,
      title: "Yayasan baru mendaftar",
      desc: "Dikirim 3 hari lalu",
      read: true,
    },
  ];

  const goBack = () => {
    router.push("/super-admin/yayasan");
  };

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <div className="flex min-h-screen">
        {/* =========================================================
            SIDEBAR
        ========================================================= */}
        <Sidebar
          active={activeMenu}
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* =========================================================
            MAIN CONTENT
        ========================================================= */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* HEADER */}
          <Header
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            notifications={notifications}
            user={{
              name: "Sarah",
              email: "sarah@smartschool.com",
              avatar: "SA",
            }}
          />

          {/* =======================================================
              CONTENT
          ======================================================= */}
          <main className="w-full flex-1">
            <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
              
              {/* ===================================================
                  BREADCRUMB
              =================================================== */}
              <div className="mb-5 flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={goBack}
                  className="font-medium text-slate-400 transition-colors hover:text-blue-600"
                >
                  Yayasan
                </button>

                <ChevronRight
                  size={13}
                  className="text-slate-300"
                />

                <span className="font-semibold text-slate-600">
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
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                  >
                    <ArrowLeft size={19} />
                  </button>

                  {/* TITLE */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                        Tambah Yayasan
                      </h1>

                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-blue-600">
                        DATA BARU
                      </span>
                    </div>

                    <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                      Lengkapi informasi yayasan untuk mendaftarkan yayasan
                      baru ke dalam sistem SmartSchool.
                    </p>
                  </div>
                </div>

                {/* INFO CARD */}
                <div className="hidden shrink-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm md:flex">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Landmark size={17} />
                  </div>

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                      Form
                    </p>

                    <p className="text-xs font-bold text-slate-700">
                      Data Yayasan
                    </p>
                  </div>
                </div>
              </div>

              {/* ===================================================
                  FORM
              =================================================== */}
              <form className="space-y-6">
                
                {/* =================================================
                    INFORMASI YAYASAN
                ================================================= */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  
                  {/* SECTION HEADER */}
                  <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Building2 size={19} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-slate-800 sm:text-base">
                          Informasi Yayasan
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
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
                            accept="image/png,image/jpeg,image/jpg"
                            className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 outline-none transition hover:border-blue-300 file:mr-3 file:cursor-pointer file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-600 hover:file:bg-blue-100"
                          />

                          <Upload
                            size={15}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                        </div>

                        <p className="mt-1.5 text-[10px] text-slate-400">
                          JPG / PNG · Maksimal 2MB
                        </p>
                      </FormField>
                    </div>
                  </div>
                </section>

                {/* =================================================
                    ALAMAT YAYASAN
                ================================================= */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  
                  {/* SECTION HEADER */}
                  <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <MapPin size={19} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-slate-800 sm:text-base">
                          Alamat Yayasan
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
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
                          <option
                            value=""
                            disabled
                          >
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
                          <option
                            value=""
                            disabled
                          >
                            Pilih kabupaten / kota
                          </option>

                          <option value="Depok">
                            Depok
                          </option>

                          <option value="Bogor">
                            Bogor
                          </option>

                          <option value="Bekasi">
                            Bekasi
                          </option>

                          <option value="Bandung">
                            Bandung
                          </option>

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
                            className="pointer-events-none absolute right-3 top-3 text-slate-400"
                          />
                        </div>
                      </FormField>
                    </div>
                  </div>
                </section>

                {/* =================================================
                    AKSI
                ================================================= */}
                <div className="border-t border-slate-200 pt-5">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    
                    {/* INFO */}
                    <p className="hidden text-xs text-slate-400 sm:block">
                      <span className="font-bold text-rose-500">
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
                        className="w-full rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-100 active:scale-[0.98] sm:w-auto"
                      >
                        Batal
                      </button>

                      {/* SIMPAN */}
                      <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-[0.98] sm:w-auto"
                      >
                        <Save size={16} />
                        Simpan Yayasan
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </main>
        </div>
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
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        {icon && (
          <span className="text-slate-400">
            {icon}
          </span>
        )}

        <span>{label}</span>

        {required && (
          <span className="text-rose-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

/* ================================================================
   INPUT STYLE
================================================================ */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

/* ================================================================
   SELECT STYLE
================================================================ */

const selectClass =
  "w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none transition-all duration-200 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10";