"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getUserById, updateUser } from "@/services/user.service";
import {
  ArrowLeft,
  Save,
  User,
  Fingerprint,
  Cake,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  BadgeCheck,
  CalendarDays,
  Briefcase,
  Venus,
  Mars,
  Loader2,
  AlertCircle,
} from "lucide-react";


const OPSI_STATUS = ["aktif", "nonaktif"];
const OPSI_JENIS_KELAMIN = ["Laki-laki", "Perempuan"];
const OPSI_SHIFT = ["pagi", "siang"];
const OPSI_GOLONGAN = [
  "II/a",
  "II/b",
  "II/c",
  "II/d",
  "III/a",
  "III/b",
  "III/c",
  "III/d",
  "IV/a",
  "IV/b",
];

const inputClass =
  "theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20";

function toDateInput(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function normalizeJenisKelamin(value) {
  if (value === "L" || value === "Laki-laki") return "Laki-laki";
  if (value === "P" || value === "Perempuan") return "Perempuan";
  return "";
}

function mapUserToForm(user) {
  return {
    namaLengkap: user?.namaLengkap || "",
    namaPengguna: user?.namaPengguna || "",
    email: user?.email || "",
    nip: user?.nip || "",
    nuptk: user?.nuptk || "",
    nik: user?.nik || "",
    jabatan: user?.jabatan || "",
    golongan: user?.golongan || "",
    status: user?.status || "aktif",
    shiftKerja: String(user?.shiftKerja || "").toLowerCase(),
    jenisKelamin: normalizeJenisKelamin(user?.jenisKelamin),
    tempatLahir: user?.tempatLahir || "",
    tanggalLahir: toDateInput(user?.tanggalLahir),
    noTelepon: user?.noTelepon || "",
    alamat: user?.alamat || "",
    alamatDomisili: user?.alamatDomisili || "",
    avatar: user?.avatar || "",
  };
}

function FieldWrapper({
  icon: Icon,
  label,
  required = false,
  children,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="theme-text-secondary mb-1.5 flex items-center gap-1.5 text-xs font-medium">
        {Icon && <Icon size={13} className="theme-text-muted" />}
        {label}
        {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>

      {children}
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="theme-card theme-border overflow-hidden rounded-xl border shadow-sm">
      <div className="theme-border flex items-center gap-2.5 border-b px-5 py-4 sm:px-6">
        <Icon size={16} className="text-[var(--color-primary)]" />
        <h2 className="theme-text text-sm font-semibold">{title}</h2>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function EditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams.get("id");

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const toggleSidebar = () => setIsCollapsed((previous) => !previous);

  const loadData = useCallback(async () => {
    if (!id) {
      setError("ID pegawai tidak ditemukan.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getUserById(id);
      const data = response?.data ?? response;

      if (!data?.id) {
        throw new Error("Data pegawai tidak ditemukan.");
      }

      setForm(mapUserToForm(data));
    } catch (err) {
      console.error("Gagal mengambil data pegawai:", err);
      setError(err?.message || "Gagal mengambil data pegawai.");
      setForm(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const updateField = (field) => (event) => {
    const value = event?.target ? event.target.value : event;

    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleBack = () => {
    if (id) {
      router.push(`/admin/guru/kartu-identitas/${id}`);
      return;
    }

    router.push("/admin/guru/kartu-identitas");
  };

  const handleSimpan = async (event) => {
    event.preventDefault();

    if (!form || !id) return;

    if (!form.namaLengkap.trim() || !form.namaPengguna.trim()) {
      setError("Nama lengkap dan nama pengguna wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        namaLengkap: form.namaLengkap.trim(),
        namaPengguna: form.namaPengguna.trim(),
        email: form.email.trim(),
        nip: form.nip.trim() || null,
        nuptk: form.nuptk.trim() || null,
        nik: form.nik.trim() || null,
        jabatan: form.jabatan.trim() || null,
        golongan: form.golongan.trim() || null,
        status: form.status,
        jenisKelamin: form.jenisKelamin || null,
        tempatLahir: form.tempatLahir.trim() || null,
        tanggalLahir: form.tanggalLahir || null,
        noTelepon: form.noTelepon.trim() || null,
        alamat: form.alamat.trim() || null,
        alamatDomisili: form.alamatDomisili.trim() || null,
        avatar: form.avatar.trim() || null,
      };

      if (form.shiftKerja) {
        payload.shiftKerja = form.shiftKerja;
      }

      await updateUser(id, payload);

      router.push(`/admin/guru/kartu-identitas/${id}`);
    } catch (err) {
      console.error("Gagal menyimpan data pegawai:", err);
      setError(err?.message || "Gagal menyimpan perubahan data pegawai.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full items-center justify-center overflow-hidden">
        <div className="flex items-center gap-2 text-sm theme-text-muted">
          <Loader2 size={20} className="animate-spin" />
          Memuat data pegawai...
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active="guruKartuIdentitas"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="admin"
        />

        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            toggleSidebar={toggleSidebar}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="theme-card theme-border rounded-xl border p-10 text-center shadow-sm">
                <p className="theme-text-secondary mb-4 text-sm">
                  {error || "Data pegawai tidak ditemukan."}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/guru/kartu-identitas")
                  }
                  className="theme-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Kartu Identitas
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="guruKartuIdentitas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <form
            onSubmit={handleSimpan}
            className="space-y-6 p-4 pb-28 sm:p-6 lg:p-8"
          >
            <button
              type="button"
              onClick={handleBack}
              className="theme-text-secondary flex w-fit items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--color-primary)]"
            >
              <ArrowLeft size={16} />
              Kembali ke Detail Pegawai
            </button>

            <div>
              <h1 className="theme-text text-2xl font-bold">
                Edit Data Pegawai
              </h1>

              <p className="theme-text-muted text-sm">
                {form.namaLengkap} •{" "}
                <span className="font-mono">{form.nip || "-"}</span>
              </p>
            </div>

            {error && (
              <div className="theme-danger flex items-start gap-3 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {notice && (
              <div className="theme-success rounded-xl px-4 py-3 text-sm">
                {notice}
              </div>
            )}

            <SectionCard icon={User} title="Akun Pengguna">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <FieldWrapper
                  icon={User}
                  label="Nama Lengkap"
                  required
                  className="sm:col-span-2"
                >
                  <input
                    type="text"
                    value={form.namaLengkap}
                    onChange={updateField("namaLengkap")}
                    className={inputClass}
                    required
                  />
                </FieldWrapper>

                <FieldWrapper icon={User} label="Nama Pengguna" required>
                  <input
                    type="text"
                    value={form.namaPengguna}
                    onChange={updateField("namaPengguna")}
                    className={inputClass}
                    required
                  />
                </FieldWrapper>

                <FieldWrapper icon={Mail} label="Email" required>
                  <input
                    type="email"
                    value={form.email}
                    onChange={updateField("email")}
                    className={inputClass}
                    required
                  />
                </FieldWrapper>

                <FieldWrapper icon={BadgeCheck} label="Status Akun">
                  <select
                    value={form.status}
                    onChange={updateField("status")}
                    className={inputClass}
                  >
                    {OPSI_STATUS.map((option) => (
                      <option key={option} value={option}>
                        {option === "aktif" ? "Aktif" : "Nonaktif"}
                      </option>
                    ))}
                  </select>
                </FieldWrapper>

                <FieldWrapper icon={CalendarDays} label="Shift Kerja">
                  <select
                    value={form.shiftKerja}
                    onChange={updateField("shiftKerja")}
                    className={inputClass}
                  >
                    <option value="">Belum ditentukan</option>
                    {OPSI_SHIFT.map((option) => (
                      <option key={option} value={option}>
                        {option === "pagi" ? "Pagi" : "Siang"}
                      </option>
                    ))}
                  </select>
                </FieldWrapper>

                <FieldWrapper
                  icon={User}
                  label="URL Foto Profil"
                  className="sm:col-span-2"
                >
                  <input
                    type="url"
                    value={form.avatar}
                    onChange={updateField("avatar")}
                    className={inputClass}
                    placeholder="https://..."
                  />
                </FieldWrapper>
              </div>
            </SectionCard>

            <SectionCard icon={BadgeCheck} title="Informasi Kepegawaian">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <FieldWrapper icon={Fingerprint} label="NIP">
                  <input
                    type="text"
                    value={form.nip}
                    onChange={updateField("nip")}
                    className={`${inputClass} font-mono`}
                  />
                </FieldWrapper>

                <FieldWrapper icon={Fingerprint} label="NUPTK">
                  <input
                    type="text"
                    value={form.nuptk}
                    onChange={updateField("nuptk")}
                    className={`${inputClass} font-mono`}
                  />
                </FieldWrapper>

                <FieldWrapper icon={Fingerprint} label="NIK">
                  <input
                    type="text"
                    value={form.nik}
                    onChange={updateField("nik")}
                    className={`${inputClass} font-mono`}
                  />
                </FieldWrapper>

                <FieldWrapper icon={Briefcase} label="Jabatan">
                  <input
                    type="text"
                    value={form.jabatan}
                    onChange={updateField("jabatan")}
                    className={inputClass}
                    placeholder="Contoh: Guru Matematika"
                  />
                </FieldWrapper>

                <FieldWrapper icon={GraduationCap} label="Golongan">
                  <select
                    value={form.golongan}
                    onChange={updateField("golongan")}
                    className={inputClass}
                  >
                    <option value="">Pilih golongan</option>
                    {OPSI_GOLONGAN.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </FieldWrapper>
              </div>
            </SectionCard>

            <SectionCard icon={User} title="Data Diri">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <FieldWrapper icon={MapPin} label="Tempat Lahir">
                  <input
                    type="text"
                    value={form.tempatLahir}
                    onChange={updateField("tempatLahir")}
                    className={inputClass}
                  />
                </FieldWrapper>

                <FieldWrapper icon={Cake} label="Tanggal Lahir">
                  <input
                    type="date"
                    value={form.tanggalLahir}
                    onChange={updateField("tanggalLahir")}
                    className={inputClass}
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={form.jenisKelamin === "Perempuan" ? Venus : Mars}
                  label="Jenis Kelamin"
                >
                  <select
                    value={form.jenisKelamin}
                    onChange={updateField("jenisKelamin")}
                    className={inputClass}
                  >
                    <option value="">Pilih jenis kelamin</option>
                    {OPSI_JENIS_KELAMIN.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </FieldWrapper>

                <FieldWrapper icon={Phone} label="Nomor Telepon">
                  <input
                    type="tel"
                    value={form.noTelepon}
                    onChange={updateField("noTelepon")}
                    className={inputClass}
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={MapPin}
                  label="Alamat Domisili"
                  className="sm:col-span-2"
                >
                  <textarea
                    value={form.alamatDomisili}
                    onChange={updateField("alamatDomisili")}
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={MapPin}
                  label="Alamat"
                  className="sm:col-span-2"
                >
                  <textarea
                    value={form.alamat}
                    onChange={updateField("alamat")}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </FieldWrapper>
              </div>
            </SectionCard>
          </form>
        </main>

        <div className="theme-header theme-border flex items-center justify-end gap-2.5 border-t px-4 py-3.5 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={handleBack}
            disabled={saving}
            className="theme-card theme-border theme-text-secondary theme-sidebar-hover rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSimpan}
            disabled={saving}
            className="theme-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}


export default function Edit() {
  return (
    <Suspense fallback={<div className="theme-page min-h-screen" />}>
      <EditContent />
    </Suspense>
  );
}
