"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  ArrowLeft,
  UserRound,
  School,
  Phone,
  FileText,
  GraduationCap,
  Save,
  CheckCircle2,
  Upload,
} from "lucide-react";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// ============================================================
// PAGE
// ============================================================

export default function TambahPendaftarPage() {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    namaLengkap: "",
    nisn: "",
    nik: "",
    jenisKelamin: "",
    tempatLahir: "",
    tanggalLahir: "",
    agama: "",
    noTelepon: "",
    email: "",
    alamat: "",
    provinsi: "",
    kota: "",
    kecamatan: "",
    kelurahan: "",
    asalSekolah: "",
    tahunLulus: "",
    jurusan: "",
    gelombang: "",
    namaAyah: "",
    pekerjaanAyah: "",
    namaIbu: "",
    pekerjaanIbu: "",
    noTeleponOrangTua: "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setSaving(true);

    setTimeout(() => {
      setSaving(false);
      router.push("/admin/spmb/pendaftaran");
    }, 800);
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="spmb"
        setActive={() => {}}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header
            toggleSidebar={() =>
              setCollapsed((value) => !value)
            }
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="min-h-0 flex-1 overflow-hidden">
          <div className="flex h-full min-h-0 flex-col">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div
              className={`theme-card shrink-0 border-b ${themeDivider}`}
            >
              <div className="flex flex-col gap-3 px-4 py-4 sm:px-5 lg:px-6">

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/spmb/pendaftaran"
                    )
                  }
                  className={`theme-text-secondary flex w-fit items-center gap-2 text-xs font-semibold transition hover:text-[var(--color-primary)]`}
                >
                  <ArrowLeft size={15} />
                  Kembali ke Data Pendaftaran
                </button>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft}`}
                    >
                      <UserRound
                        size={20}
                        className={themePrimaryText}
                      />
                    </div>

                    <div>
                      <h1 className="theme-text text-xl font-bold">
                        Tambah Pendaftar
                      </h1>

                      <p className="theme-text-muted text-xs">
                        Tambahkan data calon siswa baru ke sistem SPMB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`theme-neutral-border theme-text-muted ${themeNeutralSurface} rounded-md border px-3 py-2 text-[10px] font-semibold`}
                    >
                      Data Baru
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================
                CONTENT
            ================================================== */}

            <div className="min-h-0 flex-1 overflow-auto">
              <form
                onSubmit={handleSubmit}
                className="mx-auto w-full max-w-[1400px] p-4 sm:p-5 lg:p-6"
              >
                <div className="grid gap-5 xl:grid-cols-3">

                  {/* ==================================================
                      LEFT
                  ================================================== */}

                  <div className="space-y-5 xl:col-span-2">

                    {/* DATA PRIBADI */}

                    <FormSection
                      icon={UserRound}
                      title="Data Pribadi"
                      description="Informasi identitas calon siswa."
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Nama Lengkap"
                          required
                          value={form.namaLengkap}
                          onChange={(value) =>
                            handleChange(
                              "namaLengkap",
                              value
                            )
                          }
                          placeholder="Masukkan nama lengkap"
                        />

                        <Input
                          label="NISN"
                          required
                          value={form.nisn}
                          onChange={(value) =>
                            handleChange(
                              "nisn",
                              value
                            )
                          }
                          placeholder="Masukkan NISN"
                        />

                        <Input
                          label="NIK"
                          value={form.nik}
                          onChange={(value) =>
                            handleChange(
                              "nik",
                              value
                            )
                          }
                          placeholder="Masukkan NIK"
                        />

                        <Select
                          label="Jenis Kelamin"
                          required
                          value={form.jenisKelamin}
                          onChange={(value) =>
                            handleChange(
                              "jenisKelamin",
                              value
                            )
                          }
                          options={[
                            "Laki-laki",
                            "Perempuan",
                          ]}
                        />

                        <Input
                          label="Tempat Lahir"
                          value={form.tempatLahir}
                          onChange={(value) =>
                            handleChange(
                              "tempatLahir",
                              value
                            )
                          }
                          placeholder="Contoh: Jakarta"
                        />

                        <Input
                          label="Tanggal Lahir"
                          type="date"
                          value={form.tanggalLahir}
                          onChange={(value) =>
                            handleChange(
                              "tanggalLahir",
                              value
                            )
                          }
                        />

                        <Select
                          label="Agama"
                          value={form.agama}
                          onChange={(value) =>
                            handleChange(
                              "agama",
                              value
                            )
                          }
                          options={[
                            "Islam",
                            "Kristen",
                            "Katolik",
                            "Hindu",
                            "Buddha",
                            "Konghucu",
                          ]}
                        />
                      </div>
                    </FormSection>

                    {/* KONTAK */}

                    <FormSection
                      icon={Phone}
                      title="Kontak & Alamat"
                      description="Informasi kontak dan domisili calon siswa."
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Nomor Telepon"
                          value={form.noTelepon}
                          onChange={(value) =>
                            handleChange(
                              "noTelepon",
                              value
                            )
                          }
                          placeholder="08xxxxxxxxxx"
                        />

                        <Input
                          label="Email"
                          type="email"
                          value={form.email}
                          onChange={(value) =>
                            handleChange(
                              "email",
                              value
                            )
                          }
                          placeholder="email@example.com"
                        />

                        <div className="md:col-span-2">
                          <TextArea
                            label="Alamat Lengkap"
                            value={form.alamat}
                            onChange={(value) =>
                              handleChange(
                                "alamat",
                                value
                              )
                            }
                            placeholder="Masukkan alamat lengkap"
                          />
                        </div>

                        <Input
                          label="Provinsi"
                          value={form.provinsi}
                          onChange={(value) =>
                            handleChange(
                              "provinsi",
                              value
                            )
                          }
                          placeholder="Masukkan provinsi"
                        />

                        <Input
                          label="Kota / Kabupaten"
                          value={form.kota}
                          onChange={(value) =>
                            handleChange(
                              "kota",
                              value
                            )
                          }
                          placeholder="Masukkan kota"
                        />

                        <Input
                          label="Kecamatan"
                          value={form.kecamatan}
                          onChange={(value) =>
                            handleChange(
                              "kecamatan",
                              value
                            )
                          }
                          placeholder="Masukkan kecamatan"
                        />

                        <Input
                          label="Kelurahan / Desa"
                          value={form.kelurahan}
                          onChange={(value) =>
                            handleChange(
                              "kelurahan",
                              value
                            )
                          }
                          placeholder="Masukkan kelurahan"
                        />
                      </div>
                    </FormSection>

                    {/* ASAL SEKOLAH */}

                    <FormSection
                      icon={School}
                      title="Data Asal Sekolah"
                      description="Informasi sekolah asal calon siswa."
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Asal Sekolah"
                          required
                          value={form.asalSekolah}
                          onChange={(value) =>
                            handleChange(
                              "asalSekolah",
                              value
                            )
                          }
                          placeholder="Nama sekolah asal"
                        />

                        <Select
                          label="Tahun Lulus"
                          value={form.tahunLulus}
                          onChange={(value) =>
                            handleChange(
                              "tahunLulus",
                              value
                            )
                          }
                          options={[
                            "2026",
                            "2025",
                            "2024",
                          ]}
                        />
                      </div>
                    </FormSection>

                    {/* ORANG TUA */}

                    <FormSection
                      icon={UsersIcon}
                      title="Data Orang Tua / Wali"
                      description="Informasi orang tua atau wali calon siswa."
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Nama Ayah"
                          value={form.namaAyah}
                          onChange={(value) =>
                            handleChange(
                              "namaAyah",
                              value
                            )
                          }
                          placeholder="Nama lengkap ayah"
                        />

                        <Input
                          label="Pekerjaan Ayah"
                          value={form.pekerjaanAyah}
                          onChange={(value) =>
                            handleChange(
                              "pekerjaanAyah",
                              value
                            )
                          }
                          placeholder="Pekerjaan ayah"
                        />

                        <Input
                          label="Nama Ibu"
                          value={form.namaIbu}
                          onChange={(value) =>
                            handleChange(
                              "namaIbu",
                              value
                            )
                          }
                          placeholder="Nama lengkap ibu"
                        />

                        <Input
                          label="Pekerjaan Ibu"
                          value={form.pekerjaanIbu}
                          onChange={(value) =>
                            handleChange(
                              "pekerjaanIbu",
                              value
                            )
                          }
                          placeholder="Pekerjaan ibu"
                        />

                        <Input
                          label="Nomor Telepon Orang Tua / Wali"
                          value={
                            form.noTeleponOrangTua
                          }
                          onChange={(value) =>
                            handleChange(
                              "noTeleponOrangTua",
                              value
                            )
                          }
                          placeholder="08xxxxxxxxxx"
                        />
                      </div>
                    </FormSection>
                  </div>

                  {/* ==================================================
                      RIGHT
                  ================================================== */}

                  <div className="space-y-5">

                    {/* PENERIMAAN */}

                    <FormSection
                      icon={GraduationCap}
                      title="Data Penerimaan"
                      description="Tentukan program dan gelombang pendaftaran."
                    >
                      <div className="space-y-4">
                        <Select
                          label="Gelombang Pendaftaran"
                          required
                          value={form.gelombang}
                          onChange={(value) =>
                            handleChange(
                              "gelombang",
                              value
                            )
                          }
                          options={[
                            "Gelombang 1",
                            "Gelombang 2",
                            "Gelombang 3",
                          ]}
                        />

                        <Select
                          label="Program / Jurusan"
                          required
                          value={form.jurusan}
                          onChange={(value) =>
                            handleChange(
                              "jurusan",
                              value
                            )
                          }
                          options={[
                            "IPA",
                            "IPS",
                            "Teknik",
                          ]}
                        />
                      </div>
                    </FormSection>

                    {/* DOKUMEN */}

                    <FormSection
                      icon={FileText}
                      title="Dokumen Pendaftaran"
                      description="Dokumen pendukung calon siswa."
                    >
                      <div className="space-y-3">
                        {[
                          "Kartu Keluarga",
                          "Akta Kelahiran",
                          "Ijazah / SKL",
                          "Pas Foto",
                        ].map((item) => (
                          <div
                            key={item}
                            className={`theme-neutral-border ${themeNeutralSurface} flex items-center justify-between rounded-lg border p-3`}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={`theme-card theme-neutral-border flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${themeSmallShadow}`}
                              >
                                <FileText
                                  size={15}
                                  className="theme-text-muted"
                                />
                              </div>

                              <span className="theme-text-secondary truncate text-xs font-medium">
                                {item}
                              </span>
                            </div>

                            <button
                              type="button"
                              className={`theme-card theme-neutral-border theme-text-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] hover:text-[var(--color-primary)]`}
                            >
                              <Upload size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </FormSection>

                    {/* INFORMASI */}

                    <div
                      className={`rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} p-4`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themeSmallShadow}`}
                        >
                          <CheckCircle2
                            size={17}
                            className={themePrimaryText}
                          />
                        </div>

                        <div>
                          <p className="theme-text text-xs font-bold">
                            Periksa data sebelum menyimpan
                          </p>

                          <p className="theme-text-secondary mt-1 text-[10px] leading-5">
                            Pastikan seluruh data calon siswa
                            sudah sesuai dengan dokumen
                            pendaftaran.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    ACTION
                ================================================== */}

                <div
                  className={`mt-5 flex flex-col-reverse gap-2 border-t ${themeDivider} pt-5 sm:flex-row sm:justify-end`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/spmb/pendaftaran"
                      )
                    }
                    className={`theme-card ${themeNeutralBorder} theme-text-secondary rounded-lg border px-5 py-2.5 text-xs font-semibold transition ${themeNeutralHover}`}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className={`${themePrimaryGradient} inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-xs font-semibold text-[var(--color-card)] ${themeSmallShadow} transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <Save size={15} />

                    {saving
                      ? "Menyimpan..."
                      : "Simpan Pendaftar"}
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

// ============================================================
// FORM SECTION
// ============================================================

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section
      className={`theme-card ${themeNeutralBorder} rounded-xl border p-5 ${themeCardShadow}`}
    >
      <div className="mb-5 flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft}`}
        >
          <Icon
            size={17}
            className={themePrimaryText}
          />
        </div>

        <div>
          <h2 className="theme-text text-sm font-bold">
            {title}
          </h2>

          <p className="theme-text-muted mt-0.5 text-[10px]">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

// ============================================================
// INPUT
// ============================================================

function Input({
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="theme-text-secondary mb-1.5 block text-[10px] font-semibold">
        {label}

        {required && (
          <span className="theme-danger ml-1">*</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className={`theme-input theme-text theme-neutral-border h-10 w-full rounded-lg border ${themeNeutralSurface} px-3 text-xs outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
      />
    </div>
  );
}

// ============================================================
// SELECT
// ============================================================

function Select({
  label,
  required,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="theme-text-secondary mb-1.5 block text-[10px] font-semibold">
        {label}

        {required && (
          <span className="theme-danger ml-1">*</span>
        )}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={`theme-input theme-text theme-neutral-border h-10 w-full rounded-lg border ${themeNeutralSurface} px-3 text-xs outline-none transition ${themeFocus}`}
      >
        <option value="">
          Pilih {label}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================================
// TEXTAREA
// ============================================================

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="theme-text-secondary mb-1.5 block text-[10px] font-semibold">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        rows={3}
        className={`theme-input theme-text theme-neutral-border w-full resize-none rounded-lg border ${themeNeutralSurface} px-3 py-2.5 text-xs outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
      />
    </div>
  );
}

// ============================================================
// USERS ICON
// ============================================================

function UsersIcon(props) {
  return <UserRound {...props} />;
}