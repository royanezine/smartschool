"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";
import {
  ArrowLeft,
  IdCard,
  Save,
  X,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| THEME HELPERS
|--------------------------------------------------------------------------
*/

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

/**
 * app/admin/siswa/kartu-identitas/tambah/page.jsx
 *
 * Halaman tambah siswa baru.
 *
 * Data baru dititipkan sementara ke localStorage menggunakan
 * key "ki_new_siswa_queue", kemudian diarahkan kembali ke
 * halaman daftar kartu identitas siswa.
 */

const QUEUE_KEY = "ki_new_siswa_queue";

const JENIS_KELAMIN_OPTIONS = [
  "Laki-laki",
  "Perempuan",
];

const AGAMA_OPTIONS = [
  "Islam",
  "Kristen",
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
];

const HUBUNGAN_OPTIONS = [
  "Ayah",
  "Ibu",
  "Wali",
];

const STATUS_OPTIONS = [
  "aktif",
  "nonaktif",
];

const KELAS_OPTIONS = [
  "7A",
  "7B",
  "8A",
  "8B",
  "9A",
  "9B",
];

const EMPTY_FORM = {
  nama: "",
  nisn: "",
  nik: "",
  jenisKelamin: "",
  tempatLahir: "",
  tanggalLahir: "",
  agama: "",

  kelas: "",
  tahunMasuk: "",
  status: "aktif",

  noTelepon: "",
  email: "",
  alamat: "",

  namaOrtu: "",
  hubunganOrtu: "",
  teleponOrtu: "",
  alamatOrtu: "",
};

const REQUIRED_FIELDS = [
  "nama",
  "nisn",
  "jenisKelamin",
  "kelas",
  "namaOrtu",
];

/*
|--------------------------------------------------------------------------
| FIELD
|--------------------------------------------------------------------------
*/

function Field({
  label,
  children,
  required = false,
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium theme-text-muted">
        {label}

        {required && (
          <span className="theme-danger ml-1">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

/*
|--------------------------------------------------------------------------
| INPUT STYLE
|--------------------------------------------------------------------------
*/

const inputClass = `
  mt-1 w-full
  px-3 py-2
  text-sm rounded-lg
  border ${themeNeutralBorder}
  ${themeNeutralSurface}
  theme-text
  placeholder:text-[var(--color-text-placeholder)]
  focus:outline-none
  ${themeFocus}
  transition-colors
`;

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function TambahSiswaPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [errors, setErrors] =
    useState({});

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  /*
  |--------------------------------------------------------------------------
  | HANDLE CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (field) => (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {};

    REQUIRED_FIELDS.forEach((field) => {
      if (
        !String(
          form[field] || ""
        ).trim()
      ) {
        nextErrors[field] =
          "Wajib diisi";
      }
    });

    if (
      Object.keys(nextErrors).length > 0
    ) {
      setErrors(nextErrors);
      return;
    }

    try {
      const raw =
        window.localStorage.getItem(
          QUEUE_KEY
        );

      const queue = raw
        ? JSON.parse(raw)
        : [];

      const newSiswa = {
        ...form,

        // Tambahkan ID sementara
        id: `siswa-${Date.now()}`,

        // Waktu dibuat
        createdAt:
          new Date().toISOString(),
      };

      queue.push(newSiswa);

      window.localStorage.setItem(
        QUEUE_KEY,
        JSON.stringify(queue)
      );
    } catch (error) {
      console.error(
        "Gagal menyimpan data siswa baru:",
        error
      );
    }

    router.push(
      "/admin/siswa/kartu-identitas"
    );
  };

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        active="siswaKartuIdentitas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="flex-1 flex flex-col min-w-0 w-full h-full overflow-hidden">
        {/* HEADER */}

        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="flex-1 w-full overflow-y-auto">
          <div className="w-full max-w-none p-4 sm:p-6 lg:p-8 space-y-6">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/siswa/kartu-identitas"
                  )
                }
                className={`
                  w-9 h-9 rounded-lg
                  border ${themeNeutralBorder}
                  theme-card
                  flex items-center justify-center
                  theme-text-secondary
                  ${themeNeutralHover}
                  hover:text-[var(--color-primary)]
                  flex-shrink-0
                  transition-colors
                `}
                title="Kembali ke daftar"
              >
                <ArrowLeft size={16} />
              </button>

              <div
                className={`
                  p-2.5 rounded-xl
                  ${themePrimaryGradient}
                  text-[var(--color-card)]
                  ${themePrimaryShadow}
                `}
              >
                <IdCard size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-bold theme-text">
                  Tambah Siswa
                </h1>

                <p className="text-sm theme-text-secondary">
                  Isi data identitas siswa baru.
                </p>
              </div>
            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <div
              className={`
                w-full theme-card
                rounded-2xl
                border ${themeNeutralBorder}
                ${themeCardShadow}
                p-6
              `}
            >
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* =================================================
                    DATA IDENTITAS
                ================================================= */}

                <div>
                  <div className="mb-4">
                    <h2 className="text-sm font-bold theme-text">
                      Data Identitas Siswa
                    </h2>

                    <p className="text-xs theme-text-muted mt-1">
                      Informasi dasar dan identitas siswa.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {/* NAMA */}

                    <Field
                      label="Nama lengkap"
                      required
                    >
                      <input
                        type="text"
                        value={form.nama}
                        onChange={handleChange(
                          "nama"
                        )}
                        placeholder="cth. Alya Ramadhani"
                        className={inputClass}
                      />

                      {errors.nama && (
                        <p className="text-[11px] theme-danger mt-1">
                          {errors.nama}
                        </p>
                      )}
                    </Field>

                    {/* NISN */}

                    <Field
                      label="NISN"
                      required
                    >
                      <input
                        type="text"
                        value={form.nisn}
                        onChange={handleChange(
                          "nisn"
                        )}
                        placeholder="cth. 0051234567"
                        className={`${inputClass} font-mono`}
                      />

                      {errors.nisn && (
                        <p className="text-[11px] theme-danger mt-1">
                          {errors.nisn}
                        </p>
                      )}
                    </Field>

                    {/* NIK */}

                    <Field label="NIK">
                      <input
                        type="text"
                        value={form.nik}
                        onChange={handleChange(
                          "nik"
                        )}
                        placeholder="cth. 3278123456780001"
                        className={`${inputClass} font-mono`}
                      />
                    </Field>

                    {/* JENIS KELAMIN */}

                    <Field
                      label="Jenis kelamin"
                      required
                    >
                      <select
                        value={
                          form.jenisKelamin
                        }
                        onChange={handleChange(
                          "jenisKelamin"
                        )}
                        className={inputClass}
                      >
                        <option value="">
                          Pilih jenis kelamin
                        </option>

                        {JENIS_KELAMIN_OPTIONS.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          )
                        )}
                      </select>

                      {errors.jenisKelamin && (
                        <p className="text-[11px] theme-danger mt-1">
                          {
                            errors.jenisKelamin
                          }
                        </p>
                      )}
                    </Field>

                    {/* TEMPAT LAHIR */}

                    <Field label="Tempat lahir">
                      <input
                        type="text"
                        value={
                          form.tempatLahir
                        }
                        onChange={handleChange(
                          "tempatLahir"
                        )}
                        placeholder="cth. Tasikmalaya"
                        className={inputClass}
                      />
                    </Field>

                    {/* TANGGAL LAHIR */}

                    <Field label="Tanggal lahir">
                      <input
                        type="date"
                        value={
                          form.tanggalLahir
                        }
                        onChange={handleChange(
                          "tanggalLahir"
                        )}
                        className={inputClass}
                      />
                    </Field>

                    {/* AGAMA */}

                    <Field label="Agama">
                      <select
                        value={form.agama}
                        onChange={handleChange(
                          "agama"
                        )}
                        className={inputClass}
                      >
                        <option value="">
                          Pilih agama
                        </option>

                        {AGAMA_OPTIONS.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          )
                        )}
                      </select>
                    </Field>

                    {/* TELEPON */}

                    <Field label="Nomor telepon">
                      <input
                        type="text"
                        value={
                          form.noTelepon
                        }
                        onChange={handleChange(
                          "noTelepon"
                        )}
                        placeholder="cth. 0812-3456-7890"
                        className={inputClass}
                      />
                    </Field>

                    {/* EMAIL */}

                    <Field label="Email">
                      <input
                        type="email"
                        value={form.email}
                        onChange={handleChange(
                          "email"
                        )}
                        placeholder="cth. siswa@smartschool.sch.id"
                        className={inputClass}
                      />
                    </Field>

                    {/* ALAMAT */}

                    <div className="sm:col-span-2 xl:col-span-3">
                      <Field label="Alamat">
                        <textarea
                          value={form.alamat}
                          onChange={handleChange(
                            "alamat"
                          )}
                          placeholder="cth. Jl. Merdeka No. 12, Tasikmalaya"
                          rows={2}
                          className={`${inputClass} resize-none`}
                        />
                      </Field>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    DATA AKADEMIK
                ================================================= */}

                <div
                  className={`
                    border-t ${themeDivider}
                    pt-5
                  `}
                >
                  <div className="mb-4">
                    <h2 className="text-sm font-bold theme-text">
                      Data Akademik
                    </h2>

                    <p className="text-xs theme-text-muted mt-1">
                      Informasi kelas dan status siswa.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {/* KELAS */}

                    <Field
                      label="Kelas"
                      required
                    >
                      <select
                        value={form.kelas}
                        onChange={handleChange(
                          "kelas"
                        )}
                        className={inputClass}
                      >
                        <option value="">
                          Pilih kelas
                        </option>

                        {KELAS_OPTIONS.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          )
                        )}
                      </select>

                      {errors.kelas && (
                        <p className="text-[11px] theme-danger mt-1">
                          {errors.kelas}
                        </p>
                      )}
                    </Field>

                    {/* TAHUN MASUK */}

                    <Field label="Tahun masuk">
                      <input
                        type="text"
                        value={
                          form.tahunMasuk
                        }
                        onChange={handleChange(
                          "tahunMasuk"
                        )}
                        placeholder="cth. 2025"
                        className={inputClass}
                      />
                    </Field>

                    {/* STATUS */}

                    <Field label="Status">
                      <select
                        value={form.status}
                        onChange={handleChange(
                          "status"
                        )}
                        className={inputClass}
                      >
                        {STATUS_OPTIONS.map(
                          (status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status ===
                              "aktif"
                                ? "Aktif"
                                : "Nonaktif"}
                            </option>
                          )
                        )}
                      </select>
                    </Field>
                  </div>
                </div>

                {/* =================================================
                    DATA ORANG TUA
                ================================================= */}

                <div
                  className={`
                    border-t ${themeDivider}
                    pt-5
                  `}
                >
                  <div className="mb-4">
                    <h2 className="text-sm font-bold theme-text">
                      Data Orang Tua / Wali
                    </h2>

                    <p className="text-xs theme-text-muted mt-1">
                      Informasi orang tua atau wali siswa.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {/* NAMA ORTU */}

                    <Field
                      label="Nama orang tua / wali"
                      required
                    >
                      <input
                        type="text"
                        value={
                          form.namaOrtu
                        }
                        onChange={handleChange(
                          "namaOrtu"
                        )}
                        placeholder="cth. Hendra Ramadhani"
                        className={inputClass}
                      />

                      {errors.namaOrtu && (
                        <p className="text-[11px] theme-danger mt-1">
                          {errors.namaOrtu}
                        </p>
                      )}
                    </Field>

                    {/* HUBUNGAN */}

                    <Field label="Hubungan">
                      <select
                        value={
                          form.hubunganOrtu
                        }
                        onChange={handleChange(
                          "hubunganOrtu"
                        )}
                        className={inputClass}
                      >
                        <option value="">
                          Pilih hubungan
                        </option>

                        {HUBUNGAN_OPTIONS.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          )
                        )}
                      </select>
                    </Field>

                    {/* TELEPON ORTU */}

                    <Field label="Nomor telepon orang tua / wali">
                      <input
                        type="text"
                        value={
                          form.teleponOrtu
                        }
                        onChange={handleChange(
                          "teleponOrtu"
                        )}
                        placeholder="cth. 0812-9988-7766"
                        className={inputClass}
                      />
                    </Field>

                    {/* ALAMAT ORTU */}

                    <div className="sm:col-span-2 xl:col-span-3">
                      <Field label="Alamat orang tua / wali">
                        <textarea
                          value={
                            form.alamatOrtu
                          }
                          onChange={handleChange(
                            "alamatOrtu"
                          )}
                          placeholder="cth. Jl. Merdeka No. 12, Tasikmalaya"
                          rows={2}
                          className={`${inputClass} resize-none`}
                        />
                      </Field>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    BUTTON
                ================================================= */}

                <div className="flex items-center gap-2 pt-2 max-w-md ml-auto">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/siswa/kartu-identitas"
                      )
                    }
                    className={`
                      flex-1
                      inline-flex items-center justify-center gap-2
                      px-4 py-2.5 rounded-xl
                      border ${themeNeutralBorder}
                      theme-card
                      theme-text-secondary
                      text-sm font-medium
                      ${themeNeutralHover}
                      hover:text-[var(--color-primary)]
                      transition-colors
                    `}
                  >
                    <X size={15} />
                    Batal
                  </button>

                  <button
                    type="submit"
                    className={`
                      flex-1
                      inline-flex items-center justify-center gap-2
                      px-4 py-2.5 rounded-xl
                      ${themePrimaryGradient}
                      text-[var(--color-card)]
                      text-sm font-semibold
                      ${themePrimaryShadow}
                      hover:brightness-110
                      transition-all
                    `}
                  >
                    <Save size={15} />
                    Simpan Siswa
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}