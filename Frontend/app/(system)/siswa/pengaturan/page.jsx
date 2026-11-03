"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getProfile } from "@/services/user.service";
import { changePassword } from "@/services/auth.services";
import {
  Lock,
  Check,
  ShieldCheck,
  AlertCircle,
  Info,
  User,
  Mail,
  Loader2,
  GraduationCap,
  Eye,
  EyeOff,
  Save,
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

  const kelas = profile?.kelas?.nama || "-";
  const waliKelas = profile?.waliKelas?.namaLengkap || "-";

  return (
    <main className="min-w-0 flex-1 overflow-y-auto">
      <div className="w-full p-4 sm:p-6 lg:p-8">
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
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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
                    value={form.namaLengkap}
                    onChange={updateField("namaLengkap")}
                    className="theme-input mt-1.5 h-11 w-full rounded-xl px-3.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                      rows={2}
                      value={form.alamat}
                      onChange={updateField("alamat")}
                      className="theme-input mt-1.5 w-full resize-none rounded-xl px-3.5 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                  </div>
                </div>

                <div className="border-t theme-border-soft pt-4">
                  <p className="text-xs theme-text-placeholder">
                    Terakhir diperbarui:{" "}
                    {formatTanggal(profile?.diperbaruiPada)}
                  </p>
                </div>
              </div>
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
  const [form, setForm] = useState({
    kataSandiLama: "",
    kataSandiBaru: "",
    konfirmasiKataSandi: "",
  });
  const [showLama, setShowLama] = useState(false);
  const [showBaru, setShowBaru] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.kataSandiLama) {
      setError("Kata sandi saat ini wajib diisi.");
      return;
    }
    if (!form.kataSandiBaru) {
      setError("Kata sandi baru wajib diisi.");
      return;
    }
    if (form.kataSandiBaru.length < 8) {
      setError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (form.kataSandiBaru === form.kataSandiLama) {
      setError("Kata sandi baru harus berbeda dari kata sandi saat ini.");
      return;
    }
    if (form.kataSandiBaru !== form.konfirmasiKataSandi) {
      setError("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    try {
      setSaving(true);
      const res = await changePassword({
        kataSandiLama: form.kataSandiLama,
        kataSandiBaru: form.kataSandiBaru,
      });

      setSuccess(res?.message || "Kata sandi berhasil diubah.");
      setForm({
        kataSandiLama: "",
        kataSandiBaru: "",
        konfirmasiKataSandi: "",
      });
    } catch (err) {
      console.error("Gagal mengubah kata sandi:", err);
      setError(
        err?.message ||
          "Gagal mengubah kata sandi. Periksa kembali kata sandi lama Anda."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsCard
      icon={Lock}
      title="Keamanan Akun"
      desc="Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan akun."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="theme-danger flex items-start gap-3 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="theme-success flex items-start gap-3 rounded-xl px-4 py-3 text-sm border">
            <Check size={18} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
            <p className="text-[var(--color-success)]">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 sm:max-w-md">
            <label className="text-xs font-semibold theme-text-secondary">
              Kata Sandi Saat Ini
            </label>
            <div className="relative mt-2">
              <input
                type={showLama ? "text" : "password"}
                value={form.kataSandiLama}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    kataSandiLama: e.target.value,
                  }))
                }
                placeholder="Masukkan kata sandi saat ini"
                className="theme-input w-full rounded-xl px-3.5 py-3 pr-10 text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-primary)/.10]"
              />
              <button
                type="button"
                onClick={() => setShowLama(!showLama)}
                className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted hover:text-[var(--color-primary)]"
              >
                {showLama ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold theme-text-secondary">
              Kata Sandi Baru
            </label>
            <div className="relative mt-2">
              <input
                type={showBaru ? "text" : "password"}
                value={form.kataSandiBaru}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    kataSandiBaru: e.target.value,
                  }))
                }
                placeholder="Minimal 8 karakter"
                className="theme-input w-full rounded-xl px-3.5 py-3 pr-10 text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-primary)/.10]"
              />
              <button
                type="button"
                onClick={() => setShowBaru(!showBaru)}
                className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted hover:text-[var(--color-primary)]"
              >
                {showBaru ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold theme-text-secondary">
              Konfirmasi Kata Sandi Baru
            </label>
            <div className="relative mt-2">
              <input
                type={showKonfirmasi ? "text" : "password"}
                value={form.konfirmasiKataSandi}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    konfirmasiKataSandi: e.target.value,
                  }))
                }
                placeholder="Ulangi kata sandi baru"
                className="theme-input w-full rounded-xl px-3.5 py-3 pr-10 text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-primary)/.10]"
              />
              <button
                type="button"
                onClick={() => setShowKonfirmasi(!showKonfirmasi)}
                className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted hover:text-[var(--color-primary)]"
              >
                {showKonfirmasi ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t theme-border-soft pt-4 mt-2">
          <div className="flex items-center gap-2 text-xs theme-text-muted">
            <ShieldCheck size={15} />
            Minimal 8 karakter. Jangan bagikan kata sandi kepada siapa pun.
          </div>

          <button
            type="submit"
            disabled={saving || !form.kataSandiLama || !form.kataSandiBaru}
            className="flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold theme-primary shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={14} />
                Simpan Kata Sandi
              </>
            )}
          </button>
        </div>
      </form>
    </SettingsCard>
  );
}