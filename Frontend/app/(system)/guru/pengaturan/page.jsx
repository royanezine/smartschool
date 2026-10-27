"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { getProfile, updateProfile } from "@/services/user.service";
import {
  Settings,
  Lock,
  Save,
  Check,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  AlertCircle,
  Info,
  Loader2,
  ShieldCheck,
} from "lucide-react";


const TABS = [
  { key: "profil", label: "Profil", icon: User },
  { key: "keamanan", label: "Keamanan", icon: Lock },
];

const EMPTY_FORM = {
  namaLengkap: "",
  noTelepon: "",
  alamat: "",
  alamatDomisili: "",
  tempatLahir: "",
  tanggalLahir: "",
  avatar: "",
};

function getInitials(nama) {
  if (!nama) return "GR";

  return nama
    .replace(/,.*/, "")
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function toDateInput(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function normalizeForm(user) {
  return {
    namaLengkap: user?.namaLengkap || "",
    noTelepon: user?.noTelepon || "",
    alamat: user?.alamat || "",
    alamatDomisili: user?.alamatDomisili || "",
    tempatLahir: user?.tempatLahir || "",
    tanggalLahir: toDateInput(user?.tanggalLahir),
    avatar: user?.avatar || "",
  };
}

export default function GuruPengaturanPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tabAktif, setTabAktif] = useState("profil");

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tersimpan, setTersimpan] = useState(false);
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
      console.error("Gagal mengambil profil:", err);
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

  const tampilkanTersimpan = () => {
    setTersimpan(true);
    setTimeout(() => setTersimpan(false), 2500);
  };

  const updateField = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const simpanProfil = async (event) => {
    event.preventDefault();

    if (!form.namaLengkap.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await updateProfile({
        namaLengkap: form.namaLengkap.trim(),
        noTelepon: form.noTelepon.trim() || null,
        alamat: form.alamat.trim() || null,
        alamatDomisili: form.alamatDomisili.trim() || null,
        tempatLahir: form.tempatLahir.trim() || null,
        tanggalLahir: form.tanggalLahir || null,
        avatar: form.avatar.trim() || null,
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
      tampilkanTersimpan();
    } catch (err) {
      console.error("Gagal menyimpan profil:", err);
      setError(
        err?.message || "Terjadi kesalahan saat menyimpan profil."
      );
    } finally {
      setSaving(false);
    }
  };

  const headerUser = profile
    ? {
        name: profile.namaLengkap || "Guru",
        email: profile.email || "",
        avatar: getInitials(profile.namaLengkap),
      }
    : undefined;

  return (
    <div className="flex h-screen overflow-hidden theme-page">
      <Sidebar
        active="pengaturan"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
        role="guru"
      />

      <div className="flex min-w-0 flex-1 flex-col theme-page">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={headerUser}
        />

        <main className="flex-1 overflow-y-auto theme-page">
          <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <div className="flex flex-col gap-5 mb-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="
                      w-10 h-10 rounded-xl
                      theme-card theme-border
                      flex items-center justify-center
                      theme-text-secondary
                      hover:theme-sidebar-hover
                      transition-colors
                      flex-shrink-0
                      shadow-sm
                    "
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />

                      <p className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider">
                        Pengaturan Akun
                      </p>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold theme-text tracking-tight">
                      Pengaturan
                    </h1>

                    <p className="text-sm theme-text-muted mt-1.5 max-w-2xl">
                      Kelola data profil dan keamanan akun Anda.
                    </p>
                  </div>
                </div>

                {tersimpan && (
                  <span
                    className="
                      hidden sm:flex shrink-0
                      items-center gap-1.5
                      rounded-full border
                      theme-success
                      px-3 py-1.5
                      text-xs font-medium
                    "
                  >
                    <Check size={13} />
                    Perubahan disimpan
                  </span>
                )}
              </div>
            </div>

            <div
              className="
                flex gap-1.5
                overflow-x-auto
                rounded-2xl border theme-border
                theme-card
                p-1.5
                shadow-sm
                mb-6
              "
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const aktif = tabAktif === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setTabAktif(tab.key)}
                    className={`
                      flex items-center gap-1.5
                      whitespace-nowrap
                      rounded-xl
                      px-3.5 py-2
                      text-xs font-semibold
                      transition-all
                      ${
                        aktif
                          ? "theme-primary shadow-sm"
                          : "theme-text-secondary hover:theme-sidebar-hover"
                      }
                    `}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="theme-danger mb-5 flex items-start gap-3 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {tabAktif === "profil" && (
              <div className="rounded-2xl border theme-border theme-card overflow-hidden shadow-sm">
                <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b theme-border-soft">
                  <div className="w-10 h-10 rounded-xl theme-info flex items-center justify-center flex-shrink-0">
                    <Settings size={18} className="text-[var(--color-info)]" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold theme-text">
                      Data Profil
                    </h2>

                    <p className="text-xs theme-text-muted mt-0.5">
                      Data ini tersimpan pada profil akun Anda di server.
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-sm theme-text-muted">
                    <Loader2 size={18} className="animate-spin" />
                    Memuat profil...
                  </div>
                ) : profile ? (
                  <form onSubmit={simpanProfil}>
                    <div className="p-5 sm:p-6 space-y-5">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <ReadOnlyField
                          icon={Mail}
                          label="Email"
                          value={profile.email}
                        />

                        <ReadOnlyField
                          icon={User}
                          label="Nama Pengguna"
                          value={profile.namaPengguna || "-"}
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
                          className="theme-input mt-2 w-full rounded-xl px-3.5 py-3 text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-primary)/.10]"
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
                            className="theme-input mt-2 w-full rounded-xl px-3.5 py-3 text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-primary)/.10]"
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
                            className="theme-input mt-2 w-full rounded-xl px-3.5 py-3 text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-primary)/.10]"
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
                            className="theme-input mt-2 w-full rounded-xl px-3.5 py-3 text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-primary)/.10]"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold theme-text-secondary">
                            URL Foto Profil
                          </label>

                          <input
                            type="url"
                            value={form.avatar}
                            onChange={updateField("avatar")}
                            placeholder="https://..."
                            className="theme-input mt-2 w-full rounded-xl px-3.5 py-3 text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-primary)/.10]"
                          />
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
                          className="theme-input mt-2 w-full resize-none rounded-xl px-3.5 py-3 text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-primary)/.10]"
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
                          className="theme-input mt-2 w-full resize-none rounded-xl px-3.5 py-3 text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-primary)/.10]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 px-5 sm:px-6 py-4 border-t theme-border-soft">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold theme-primary shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {saving ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}
                        {saving ? "Menyimpan..." : "Simpan Profil"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="px-5 sm:px-6 py-10 text-center">
                    <p className="text-sm theme-text-muted">
                      Profil tidak dapat dimuat.
                    </p>

                    <button
                      type="button"
                      onClick={loadProfile}
                      className="theme-primary mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
                    >
                      Coba Lagi
                    </button>
                  </div>
                )}
              </div>
            )}

            {tabAktif === "keamanan" && (
              <div className="rounded-2xl border theme-border theme-card overflow-hidden shadow-sm">
                <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b theme-border-soft">
                  <div className="w-10 h-10 rounded-xl theme-info flex items-center justify-center flex-shrink-0">
                    <Lock size={18} className="text-[var(--color-info)]" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold theme-text">
                      Ubah Kata Sandi
                    </h2>

                    <p className="text-xs theme-text-muted mt-0.5">
                      Perubahan kata sandi belum dapat dilakukan dari halaman ini.
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div className="theme-warning flex items-start gap-3 rounded-xl px-4 py-3.5">
                    <Info size={18} className="mt-0.5 shrink-0" />

                    <div className="text-sm">
                      <p className="font-semibold">
                        Belum tersedia endpoint ubah kata sandi mandiri
                      </p>

                      <p className="mt-1 text-xs leading-5">
                        Backend hanya menyediakan reset kata sandi melalui OTP
                        email (<span className="font-mono">/api/auth/lupa-kata-sandi</span>{" "}
                        dan{" "}
                        <span className="font-mono">/api/auth/atur-ulang-kata-sandi</span>)
                        serta reset oleh admin. Gunakan alur lupa kata sandi
                        atau hubungi admin sekolah untuk mengubah kata sandi.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t theme-border-soft pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-xs theme-text-muted">
                      <ShieldCheck size={15} />
                      Jangan bagikan kata sandi kepada siapa pun.
                    </div>

                    <Link
                      href="/forgot-password"
                      className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90"
                    >
                      <Mail size={15} />
                      Buka Lupa Kata Sandi
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="py-7 text-center">
              <p className="text-xs theme-text-placeholder">
                SmartSchool Guru • Pengaturan
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ReadOnlyField({ icon: Icon, label, value }) {
  return (
    <div>
      <label className="text-xs font-semibold theme-text-secondary">
        {label}
      </label>

      <div className="theme-card-soft theme-border mt-2 flex items-center gap-2 rounded-xl border px-3.5 py-3">
        <Icon size={15} className="shrink-0 theme-text-muted" />
        <span className="truncate text-sm theme-text-secondary">
          {value || "-"}
        </span>
      </div>
    </div>
  );
}
