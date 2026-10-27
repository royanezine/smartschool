"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { createSiswa } from "@/services/siswa.service";
import {
  ArrowLeft,
  IdCard,
  Save,
  X,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";


const JENIS_KELAMIN_OPTIONS = ["Laki-laki", "Perempuan"];

const EMPTY_FORM = {
  namaPengguna: "",
  namaLengkap: "",
  email: "",
  kataSandi: "",
  nisn: "",
  nis: "",
  jenisKelamin: "",
};

const REQUIRED_FIELDS = [
  "namaPengguna",
  "namaLengkap",
  "email",
  "kataSandi",
];


function Field({ label, children, required = false }) {
  return (
    <label className="block">
      <span className="text-xs font-medium theme-text-muted">
        {label}

        {required && (
          <span className="ml-1 text-[var(--color-danger)]">*</span>
        )}
      </span>

      {children}
    </label>
  );
}

const inputClass =
  "mt-1 w-full px-3 py-2 text-sm rounded-lg border theme-input theme-text placeholder:text-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-colors";


export default function TambahSiswaPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const toggleSidebar = () => setIsCollapsed((previous) => !previous);

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    setForm((previous) => ({ ...previous, [field]: value }));

    if (errors[field]) {
      setErrors((previous) => ({ ...previous, [field]: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    REQUIRED_FIELDS.forEach((field) => {
      if (!String(form[field] || "").trim()) {
        nextErrors[field] = "Wajib diisi";
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setSubmitError("");

    try {
      await createSiswa({
        namaPengguna: form.namaPengguna.trim(),
        namaLengkap: form.namaLengkap.trim(),
        email: form.email.trim(),
        kataSandi: form.kataSandi,
        nisn: form.nisn.trim() || undefined,
        nis: form.nis.trim() || undefined,
        jenisKelamin: form.jenisKelamin || undefined,
      });

      router.push("/admin/siswa/kartu-identitas");
    } catch (err) {
      console.error("Gagal menyimpan data siswa:", err);
      setSubmitError(err?.message || "Gagal menyimpan data siswa.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        active="siswaKartuIdentitas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex-1 flex flex-col min-w-0 w-full h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 w-full overflow-y-auto">
          <div className="w-full max-w-none p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/siswa/kartu-identitas")}
                className="w-9 h-9 rounded-lg border theme-border theme-card flex items-center justify-center theme-text-secondary theme-table-hover flex-shrink-0 transition-colors"
                title="Kembali ke daftar"
              >
                <ArrowLeft size={16} />
              </button>

              <div className="p-2.5 rounded-xl theme-primary shadow-lg flex-shrink-0">
                <IdCard size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-bold theme-text">Tambah Siswa</h1>

                <p className="text-sm theme-text-secondary">
                  Buat akun siswa baru melalui API siswa.
                </p>
              </div>
            </div>

            {submitError && (
              <div className="theme-danger flex items-start gap-3 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{submitError}</p>
              </div>
            )}

            <div className="w-full theme-card rounded-2xl border theme-border shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="theme-info flex items-start gap-3 rounded-xl px-4 py-3">
                  <Info size={17} className="mt-0.5 shrink-0" />

                  <p className="text-xs leading-5 theme-text-muted">
                    Endpoint <span className="font-mono">POST /api/siswa</span>{" "}
                    hanya menerima data akun dan identitas dasar. Data kelas,
                    orang tua, dan alamat belum didukung oleh endpoint ini.
                    Akun baru otomatis berstatus aktif.
                  </p>
                </div>

                <div>
                  <h2 className="text-sm font-bold theme-text">
                    Akun Pengguna
                  </h2>

                  <p className="text-xs theme-text-muted mt-1">
                    Diperlukan untuk login siswa ke sistem.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <Field label="Nama pengguna" required>
                    <input
                      type="text"
                      value={form.namaPengguna}
                      onChange={handleChange("namaPengguna")}
                      placeholder="cth. alya.ramadhani"
                      className={inputClass}
                    />
                    <FieldError message={errors.namaPengguna} />
                  </Field>

                  <Field label="Email" required>
                    <input
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder="cth. siswa@smartschool.sch.id"
                      className={inputClass}
                    />
                    <FieldError message={errors.email} />
                  </Field>

                  <Field label="Kata sandi awal" required>
                    <input
                      type="password"
                      value={form.kataSandi}
                      onChange={handleChange("kataSandi")}
                      placeholder="Minimal 8 karakter"
                      className={inputClass}
                    />
                    <FieldError message={errors.kataSandi} />
                  </Field>
                </div>

                <div className="border-t theme-border-soft pt-5">
                  <h2 className="text-sm font-bold theme-text">
                    Data Identitas Siswa
                  </h2>

                  <p className="text-xs theme-text-muted mt-1">
                    Informasi dasar yang tersimpan pada akun siswa.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 xl:col-span-3">
                    <Field label="Nama lengkap" required>
                      <input
                        type="text"
                        value={form.namaLengkap}
                        onChange={handleChange("namaLengkap")}
                        placeholder="cth. Alya Ramadhani"
                        className={inputClass}
                      />
                      <FieldError message={errors.namaLengkap} />
                    </Field>
                  </div>

                  <Field label="NISN">
                    <input
                      type="text"
                      value={form.nisn}
                      onChange={handleChange("nisn")}
                      placeholder="cth. 0051234567"
                      className={`${inputClass} font-mono`}
                    />
                  </Field>

                  <Field label="NIS">
                    <input
                      type="text"
                      value={form.nis}
                      onChange={handleChange("nis")}
                      placeholder="cth. 20240001"
                      className={`${inputClass} font-mono`}
                    />
                  </Field>

                  <Field label="Jenis kelamin">
                    <select
                      value={form.jenisKelamin}
                      onChange={handleChange("jenisKelamin")}
                      className={inputClass}
                    >
                      <option value="">Pilih jenis kelamin</option>

                      {JENIS_KELAMIN_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="flex items-center gap-2 pt-2 max-w-md ml-auto">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/siswa/kartu-identitas")}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-secondary text-sm font-medium theme-table-hover transition-colors"
                  >
                    <X size={15} />
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl theme-primary text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    {saving ? "Menyimpan..." : "Simpan Siswa"}
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

function FieldError({ message }) {
  if (!message) return null;

  return (
    <p className="text-[11px] theme-danger mt-1">{message}</p>
  );
}
