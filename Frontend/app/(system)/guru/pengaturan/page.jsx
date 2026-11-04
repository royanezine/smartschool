"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { getProfile, updateProfile } from "@/services/user.service";
import { changePassword } from "@/services/auth.services";
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
  Eye,
  EyeOff,
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

function UbahKataSandiGuruSection() {
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
            Perbarui kata sandi akun Anda secara berkala demi keamanan.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
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
    </div>
  );
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

            {tabAktif === "keamanan" && <UbahKataSandiGuruSection />}

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
