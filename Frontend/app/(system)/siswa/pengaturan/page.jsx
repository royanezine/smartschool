"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getProfile, updateProfile } from "@/services/user.service";
import {
  Lock,
  Check,
  ShieldCheck,
  AlertCircle,
  Info,
  User,
  Mail,
  Loader2,
  Save,
  GraduationCap,
} from "lucide-react";

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function toDateInput(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function emptyForm() {
  return {
    namaLengkap: "",
    noTelepon: "",
    alamat: "",
    alamatDomisili: "",
    tempatLahir: "",
    tanggalLahir: "",
  };
}

function normalizeForm(user) {
  return {
    namaLengkap: user?.namaLengkap || "",
    noTelepon: user?.noTelepon || "",
    alamat: user?.alamat || "",
    alamatDomisili: user?.alamatDomisili || "",
    tempatLahir: user?.tempatLahir || "",
    tanggalLahir: toDateInput(user?.tanggalLahir),
  };
}

export default function PengaturanSiswaPage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getProfile();

      if (!response?.success || !response?.data) {
        throw new Error(
          response?.message || "Data profil tidak berhasil diambil."
        );
      }

      setProfile(response.data);
      setForm(normalizeForm(response.data));
    } catch (err) {
      console.error("Gagal mengambil profil siswa:", err);
      setError(
        err?.message || "Gagal mengambil data profil dari server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadProfile]);

  const updateField = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!form.namaLengkap.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await updateProfile({
        namaLengkap: form.namaLengkap.trim(),
        noTelepon: form.noTelepon.trim() || null,
        alamat: form.alamat.trim() || null,
        alamatDomisili: form.alamatDomisili.trim() || null,
        tempatLahir: form.tempatLahir.trim() || null,
        tanggalLahir: form.tanggalLahir || null,
      });

      if (!response?.success) {
        throw new Error(
          response?.message || "Profil gagal diperbarui."
        );
      }

      const updated = {
        ...profile,
        ...(response.data || {}),
        ...form,
        tanggalLahir: form.tanggalLahir || null,
      };

      setProfile(updated);
      setForm(normalizeForm(updated));
      setSuccess(response.message || "Profil berhasil diperbarui.");
    } catch (err) {
      console.error("Gagal menyimpan profil siswa:", err);
      setError(
        err?.message || "Terjadi kesalahan saat menyimpan profil."
      );
    } finally {
      setSaving(false);
    }
  };

  const kelas = profile?.kelas?.nama || "-";
  const waliKelas = profile?.waliKelas?.namaLengkap || "-";

  return (
    <main className="theme-page min-h-full flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1000px] p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]">
            Preferensi Akun
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight theme-text sm:text-[28px]">
            Pengaturan
          </h1>

          <p className="mt-1 text-sm theme-text-muted">
            Kelola profil dan keamanan akun kamu.
          </p>
        </header>

        {error && (
          <div className="theme-danger mb-5 flex items-start gap-3 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="theme-success mb-5 flex items-start gap-3 rounded-xl px-4 py-3 text-sm">
            <Check size={18} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {loading ? (
          <div className="theme-card theme-border flex items-center justify-center gap-2 rounded-2xl border py-12 text-sm theme-text-muted">
            <Loader2 size={18} className="animate-spin" />
            Memuat profil...
          </div>
        ) : (
          <div className="space-y-6">
            <SettingsCard
              icon={User}
              title="Profil Siswa"
              desc="Data ini tersimpan pada profil akun kamu di server."
            >
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ReadOnlyField
                    icon={Mail}
                    label="Email"
                    value={profile?.email}
                  />

                  <ReadOnlyField
                    icon={User}
                    label="Nama Pengguna"
                    value={profile?.namaPengguna || "-"}
                  />

                  <ReadOnlyField
                    icon={GraduationCap}
                    label="NISN"
                    value={profile?.nisn || "-"}
                  />

                  <ReadOnlyField
                    icon={GraduationCap}
                    label="Kelas"
                    value={kelas}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold theme-text-secondary">
                    Nama Lengkap
                  </label>

                  <input
                    type="text"
                    required
                    value={form.namaLengkap}
                    onChange={updateField("namaLengkap")}
                    className="theme-input mt-1.5 h-11 w-full rounded-xl px-3.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold theme-text-secondary">
                      Nomor Telepon
                    </label>

                    <input
                      type="tel"
                      value={form.noTelepon}
                      onChange={updateField("noTelepon")}
                      className="theme-input mt-1.5 h-11 w-full rounded-xl px-3.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold theme-text-secondary">
                      Tempat Lahir
                    </label>

                    <input
                      type="text"
                      value={form.tempatLahir}
                      onChange={updateField("tempatLahir")}
                      className="theme-input mt-1.5 h-11 w-full rounded-xl px-3.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold theme-text-secondary">
                      Tanggal Lahir
                    </label>

                    <input
                      type="date"
                      value={form.tanggalLahir}
                      onChange={updateField("tanggalLahir")}
                      className="theme-input mt-1.5 h-11 w-full rounded-xl px-3.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold theme-text-secondary">
                      Wali Kelas
                    </label>

                    <div className="theme-card-soft theme-border mt-1.5 flex h-11 items-center rounded-xl border px-3.5 text-sm theme-text-secondary">
                      {waliKelas}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold theme-text-secondary">
                    Alamat Domisili
                  </label>

                  <textarea
                    rows={2}
                    value={form.alamatDomisili}
                    onChange={updateField("alamatDomisili")}
                    className="theme-input mt-1.5 w-full resize-none rounded-xl px-3.5 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold theme-text-secondary">
                    Alamat
                  </label>

                  <textarea
                    rows={3}
                    value={form.alamat}
                    onChange={updateField("alamat")}
                    className="theme-input mt-1.5 w-full resize-none rounded-xl px-3.5 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>

                <div className="flex flex-col gap-3 border-t theme-border-soft pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs theme-text-placeholder">
                    Terakhir diperbarui: {formatTanggal(profile?.diperbaruiPada)}
                  </p>

                  <button
                    type="submit"
                    disabled={saving}
                    className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    {saving ? "Menyimpan..." : "Simpan Profil"}
                  </button>
                </div>
              </form>
            </SettingsCard>

            <KeamananSection />

            <div className="theme-info flex items-start gap-3 rounded-2xl p-4">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-[var(--color-info)]"
              />
              <div>
                <p className="text-sm font-semibold theme-text">
                  Tips keamanan akun
                </p>
                <p className="mt-1 text-xs leading-5 theme-text-muted">
                  Gunakan kata sandi yang kuat, jangan membagikan kata sandi
                  kepada orang lain, dan pastikan informasi akun tetap aman.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


function SettingsCard({ icon: Icon, title, desc, children }) {
  return (
    <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
      <div className="flex items-center gap-3 border-b theme-border-soft px-5 py-4 sm:px-6">
        <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold theme-text">{title}</h2>
          {desc && (
            <p className="mt-0.5 text-xs leading-5 theme-text-muted">
              {desc}
            </p>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function ReadOnlyField({ icon: Icon, label, value }) {
  return (
    <div>
      <label className="text-xs font-semibold theme-text-secondary">
        {label}
      </label>

      <div className="theme-card-soft theme-border mt-1.5 flex h-11 items-center gap-2 rounded-xl border px-3.5">
        <Icon size={15} className="shrink-0 theme-text-muted" />
        <span className="truncate text-sm theme-text-secondary">
          {value || "-"}
        </span>
      </div>
    </div>
  );
}


function KeamananSection() {
  return (
    <SettingsCard
      icon={Lock}
      title="Keamanan Akun"
      desc="Perubahan kata sandi belum dapat dilakukan dari halaman ini."
    >
      <div className="space-y-4">
        <div className="theme-warning flex items-start gap-3 rounded-xl px-4 py-3.5">
          <Info size={18} className="mt-0.5 shrink-0" />

          <div className="text-sm">
            <p className="font-semibold">
              Belum tersedia endpoint ubah kata sandi mandiri
            </p>

            <p className="mt-1 text-xs leading-5">
              Backend hanya menyediakan reset kata sandi melalui OTP email
              (<span className="font-mono">/api/auth/lupa-kata-sandi</span> dan{" "}
              <span className="font-mono">/api/auth/atur-ulang-kata-sandi</span>)
              serta reset oleh admin. Gunakan alur lupa kata sandi atau
              hubungi admin sekolah.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t theme-border-soft pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs theme-text-placeholder">
            Disarankan menggunakan kata sandi yang unik.
          </p>

          <Link
            href="/forgot-password"
            className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90"
          >
            <Mail size={15} />
            Buka Lupa Kata Sandi
          </Link>
        </div>
      </div>
    </SettingsCard>
  );
}
