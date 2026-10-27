"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { createUser } from "@/services/user.service";
import { getRoles } from "@/services/role.service";
import { ArrowLeft, IdCard, Save, X, Loader2, AlertCircle } from "lucide-react";


const JENIS_KELAMIN_OPTIONS = ["Laki-laki", "Perempuan"];
const SHIFT_OPTIONS = ["pagi", "siang"];

const EMPTY_FORM = {
  namaPengguna: "",
  namaLengkap: "",
  email: "",
  kataSandi: "",
  nip: "",
  nuptk: "",
  nik: "",
  jabatan: "",
  golongan: "",
  jenisKelamin: "",
  tempatLahir: "",
  tanggalLahir: "",
  noTelepon: "",
  alamat: "",
  shiftKerja: "pagi",
};

const REQUIRED_FIELDS = [
  "namaPengguna",
  "namaLengkap",
  "email",
  "kataSandi",
  "nip",
  "jabatan",
  "shiftKerja",
];

function Field({ label, children, required = false }) {
  return (
    <label className="block">
      <span className="text-xs font-medium theme-text-muted">
        {label}
        {required && <span className="ml-1 text-[var(--color-danger)]">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "mt-1 w-full px-3 py-2 text-sm rounded-lg border theme-input focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-colors";

export default function TambahPegawaiPage() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    let isMounted = true;

    async function loadRoles() {
      try {
        const data = await getRoles();
        if (isMounted) {
          setRoles(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Gagal memuat daftar peran:", err);
        if (isMounted) {
          setSubmitError(
            err?.message || "Daftar peran tidak dapat dimuat dari server."
          );
        }
      } finally {
        if (isMounted) setLoadingRoles(false);
      }
    }

    loadRoles();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));

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

    const roleGuru = roles.find(
      (role) => String(role?.nama).toLowerCase() === "guru"
    );

    if (!roleGuru?.id) {
      setSubmitError(
        "Peran guru tidak ditemukan pada server. Hubungi super admin."
      );
      return;
    }

    setSaving(true);
    setSubmitError("");

    try {
      await createUser({
        namaPengguna: form.namaPengguna.trim(),
        namaLengkap: form.namaLengkap.trim(),
        email: form.email.trim(),
        kataSandi: form.kataSandi,
        peranId: roleGuru.id,
        nip: form.nip.trim(),
        nuptk: form.nuptk.trim() || null,
        nik: form.nik.trim() || null,
        jabatan: form.jabatan.trim(),
        golongan: form.golongan.trim() || null,
        jenisKelamin: form.jenisKelamin || null,
        tempatLahir: form.tempatLahir.trim() || null,
        tanggalLahir: form.tanggalLahir || null,
        noTelepon: form.noTelepon.trim() || null,
        alamat: form.alamat.trim() || null,
        shiftKerja: form.shiftKerja,
      });

      router.push("/admin/guru/kartu-identitas");
    } catch (err) {
      console.error("Gagal menyimpan pegawai:", err);
      setSubmitError(err?.message || "Gagal menyimpan data pegawai.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        active="guruKartuIdentitas"
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
                onClick={() => router.push("/admin/guru/kartu-identitas")}
                className="
                  w-9 h-9 rounded-lg
                  border theme-border
                  theme-card
                  flex items-center justify-center
                  theme-text-muted
                  theme-table-hover
                  flex-shrink-0
                  transition-colors
                "
                title="Kembali ke daftar"
              >
                <ArrowLeft size={16} />
              </button>

              <div className="p-2.5 rounded-xl theme-primary shadow-lg flex-shrink-0">
                <IdCard size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-bold theme-text">
                  Tambah Pegawai
                </h1>

                <p className="text-sm theme-text-muted">
                  Buat akun guru baru melalui API pengguna.
                </p>
              </div>
            </div>

            {submitError && (
              <div className="theme-danger flex items-start gap-3 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{submitError}</p>
              </div>
            )}

            {loadingRoles && (
              <div className="theme-card flex items-center gap-2 rounded-xl border theme-border px-4 py-3 text-sm theme-text-muted">
                <Loader2 size={16} className="animate-spin" />
                Memuat peran guru...
              </div>
            )}

            <div className="w-full theme-card rounded-2xl border theme-border shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-sm font-bold theme-text">
                    Akun Pengguna
                  </h2>

                  <p className="text-xs theme-text-muted mt-1">
                    Diperlukan untuk login guru ke sistem.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <Field label="Nama pengguna" required>
                    <input
                      type="text"
                      value={form.namaPengguna}
                      onChange={handleChange("namaPengguna")}
                      placeholder="cth. sarah.amelia"
                      className={inputClass}
                    />
                    <FieldError message={errors.namaPengguna} />
                  </Field>

                  <Field label="Email" required>
                    <input
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder="cth. nama@smartschool.sch.id"
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
                    Data Kepegawaian
                  </h2>

                  <p className="text-xs theme-text-muted mt-1">
                    Data yang tersedia pada endpoint pengguna.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <Field label="Nama lengkap & gelar" required>
                    <input
                      type="text"
                      value={form.namaLengkap}
                      onChange={handleChange("namaLengkap")}
                      placeholder="cth. Sarah Amelia, S.Pd"
                      className={inputClass}
                    />
                    <FieldError message={errors.namaLengkap} />
                  </Field>

                  <Field label="NIP" required>
                    <input
                      type="text"
                      value={form.nip}
                      onChange={handleChange("nip")}
                      placeholder="cth. 198501152010012001"
                      className={`${inputClass} font-mono`}
                    />
                    <FieldError message={errors.nip} />
                  </Field>

                  <Field label="NUPTK">
                    <input
                      type="text"
                      value={form.nuptk}
                      onChange={handleChange("nuptk")}
                      className={`${inputClass} font-mono`}
                    />
                  </Field>

                  <Field label="NIK">
                    <input
                      type="text"
                      value={form.nik}
                      onChange={handleChange("nik")}
                      className={`${inputClass} font-mono`}
                    />
                  </Field>

                  <Field label="Jabatan" required>
                    <input
                      type="text"
                      value={form.jabatan}
                      onChange={handleChange("jabatan")}
                      placeholder="cth. Guru Matematika"
                      className={inputClass}
                    />
                    <FieldError message={errors.jabatan} />
                  </Field>

                  <Field label="Golongan">
                    <input
                      type="text"
                      value={form.golongan}
                      onChange={handleChange("golongan")}
                      placeholder="cth. III/c"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Shift kerja" required>
                    <select
                      value={form.shiftKerja}
                      onChange={handleChange("shiftKerja")}
                      className={inputClass}
                    >
                      {SHIFT_OPTIONS.map((shift) => (
                        <option key={shift} value={shift}>
                          {shift === "pagi" ? "Pagi" : "Siang"}
                        </option>
                      ))}
                    </select>
                    <FieldError message={errors.shiftKerja} />
                  </Field>

                  <Field label="Jenis kelamin">
                    <select
                      value={form.jenisKelamin}
                      onChange={handleChange("jenisKelamin")}
                      className={inputClass}
                    >
                      <option value="">Pilih jenis kelamin</option>
                      {JENIS_KELAMIN_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Tempat lahir">
                    <input
                      type="text"
                      value={form.tempatLahir}
                      onChange={handleChange("tempatLahir")}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Tanggal lahir">
                    <input
                      type="date"
                      value={form.tanggalLahir}
                      onChange={handleChange("tanggalLahir")}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Nomor telepon">
                    <input
                      type="tel"
                      value={form.noTelepon}
                      onChange={handleChange("noTelepon")}
                      placeholder="cth. 0812-3456-7890"
                      className={inputClass}
                    />
                  </Field>

                  <div className="sm:col-span-2 xl:col-span-3">
                    <Field label="Alamat">
                      <textarea
                        value={form.alamat}
                        onChange={handleChange("alamat")}
                        placeholder="cth. Jl. Merdeka No. 12, Tasikmalaya"
                        rows={2}
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 max-w-md ml-auto">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/guru/kartu-identitas")}
                    className="
                      flex-1
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-4
                      py-2.5
                      rounded-xl
                      border theme-border
                      theme-card
                      theme-text-secondary
                      theme-table-hover
                      text-sm
                      font-medium
                      transition-colors
                    "
                  >
                    <X size={15} />
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving || loadingRoles}
                    className="
                      flex-1
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-4
                      py-2.5
                      rounded-xl
                      theme-primary
                      text-sm
                      font-semibold
                      transition-all
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {saving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    {saving ? "Menyimpan..." : "Simpan Pegawai"}
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
    <p className="text-[11px] mt-1 text-[var(--color-danger)]">
      {message}
    </p>
  );
}
