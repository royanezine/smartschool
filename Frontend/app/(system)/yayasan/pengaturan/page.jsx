"use client";

import { useState, useEffect } from "react";
import {
  getProfilLengkapYayasan,
  updateProfilLengkapYayasan,
  updateProfilYayasan,
} from "@/services/yayasan.service";
import { changePassword } from "@/services/auth.services";
import {
  Settings,
  ChevronLeft,
  Sparkles,
  User,
  Lock,
  Building2,
  Save,
  Eye,
  EyeOff,
  Camera,
  Check,
  Mail,
  Phone,
  Shield,
  AlertTriangle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

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

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const TABS = [
  { id: "profil", label: "Profil", icon: User },
  { id: "yayasan", label: "Info Yayasan", icon: Building2 },
  { id: "keamanan", label: "Keamanan", icon: Lock },
];

const initialProfil = {
  nama: "",
  email: "",
  telepon: "",
  jabatan: "",
};

const initialYayasan = {
  id: "",
  nama: "",
  npyp: "",
  alamat: "",
  email: "",
  telepon: "",
};

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border transition-colors ${
        checked
          ? "border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[var(--color-primary)]"
          : `${themeNeutralSurface} ${themeNeutralBorder}`
      }`}
    >
      <span
        className={`inline-block h-[18px] w-[18px] transform rounded-full bg-[var(--color-card)] shadow-[0_1px_4px_color-mix(in_srgb,var(--color-text)_15%,transparent)] transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SectionCard({ children }) {
  return (
    <div
      className={`theme-card theme-border rounded-xl border p-5 sm:p-6 ${themeCardShadow}`}
    >
      {children}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="theme-text-secondary mb-1.5 block text-xs font-medium">
      {children}
    </label>
  );
}

const inputClass = `theme-input w-full rounded-lg px-3.5 py-2.5 text-sm transition-colors placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`;

export default function PengaturanPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profil");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [profil, setProfil] = useState(initialProfil);
  const [yayasan, setYayasan] = useState(initialYayasan);

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordBaru, setShowPasswordBaru] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    lama: "",
    baru: "",
    konfirmasi: "",
  });

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        setLoading(true);
        setErrorMsg("");

        const profilRes = await getProfilLengkapYayasan();
        const profilData = profilRes?.data || profilRes;

        if (active && profilData) {
          const u = profilData.user;
          if (u) {
            setProfil({
              nama: u.namaLengkap || "",
              email: u.email || "",
              telepon: u.noTelepon || "",
              jabatan: "Admin Yayasan",
            });
          }

          const y = profilData.yayasan;
          if (y) {
            setYayasan({
              id: "",
              nama: y.nama || "",
              npyp: y.npyp || "",
              alamat: y.alamat || "",
              email: y.email || "",
              telepon: y.telepon || "",
            });
          }
        }
      } catch (err) {
        if (active) {
          console.error("Gagal memuat profil:", err);
          setErrorMsg(err?.message || "Gagal memuat profil pengguna");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const handleSimpan = async () => {
    try {
      setSaving(true);
      setErrorMsg("");

      if (activeTab === "profil") {
        await updateProfilLengkapYayasan({
          user: {
            namaLengkap: profil.nama,
            noTelepon: profil.telepon || null,
          },
        });
      } else if (activeTab === "yayasan") {
        if (!yayasan.nama || yayasan.nama.trim().length < 3) {
          throw new Error("Nama yayasan minimal 3 karakter.");
        }
        if (!yayasan.npyp || yayasan.npyp.trim().length < 3) {
          throw new Error("NPYP yayasan minimal 3 karakter.");
        }

        await updateProfilYayasan({
          nama: yayasan.nama.trim(),
          npyp: yayasan.npyp.trim(),
          alamat: yayasan.alamat ? yayasan.alamat.trim() : null,
          telepon: yayasan.telepon ? yayasan.telepon.trim() : null,
          email: yayasan.email ? yayasan.email.trim() : null,
        });
      } else if (activeTab === "keamanan") {
        if (!passwordForm.lama) {
          throw new Error("Password saat ini wajib diisi.");
        }
        if (!passwordForm.baru) {
          throw new Error("Password baru wajib diisi.");
        }
        if (passwordForm.baru.length < 8) {
          throw new Error("Password baru minimal 8 karakter.");
        }
        if (passwordForm.baru === passwordForm.lama) {
          throw new Error(
            "Password baru harus berbeda dari password saat ini."
          );
        }
        if (passwordForm.baru !== passwordForm.konfirmasi) {
          throw new Error("Konfirmasi password baru tidak cocok.");
        }

        await changePassword({
          kataSandiLama: passwordForm.lama,
          kataSandiBaru: passwordForm.baru,
        });

        setPasswordForm({ lama: "", baru: "", konfirmasi: "" });
      }

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      const is409 =
        err?.status === 409 ||
        err?.statusCode === 409 ||
        /409/.test(String(err));
      if (is409) {
        setErrorMsg(
          err?.message ||
            "Konflik Data (HTTP 409): NPYP Yayasan sudah terdaftar pada lembaga lain."
        );
      } else {
        setErrorMsg(
          err?.message ||
            "Gagal menyimpan perubahan. Periksa kembali isian form."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => router.push("/yayasan")}
              className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
            >
              <ChevronLeft size={13} />
              Dashboard
            </button>

            <div className="flex items-center gap-2.5">
              <div
                className={`shrink-0 rounded-lg p-2 ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
              >
                <Settings size={18} />
              </div>
              <h1 className="theme-text truncate text-xl font-semibold sm:text-2xl">
                Pengaturan
              </h1>
            </div>

            <p className="theme-text-secondary ml-[42px] mt-1 flex items-center gap-1.5 text-sm">
              <Sparkles
                size={14}
                className="shrink-0 text-[var(--color-text-muted)]"
              />
              <span className="truncate">
                Kelola profil, keamanan, notifikasi, dan preferensi akun Anda.
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleSimpan}
            disabled={saving || loading}
            className={`flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-card)] transition-colors hover:opacity-90 ${themePrimaryShadow} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : saved ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Menyimpan..." : saved ? "Tersimpan" : "Simpan Perubahan"}
          </button>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar Tabs */}
          <div className="w-full shrink-0 lg:w-56">
            <div
              className={`theme-card theme-border flex flex-row gap-1 overflow-x-auto rounded-xl border p-2 lg:flex-col lg:overflow-visible ${themeCardShadow}`}
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? `${themePrimarySoft} border text-[var(--color-primary)] ${themePrimarySoftBorder}`
                        : `theme-text-secondary ${themeNeutralHover}`
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="min-w-0 flex-1 space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {activeTab === "profil" && loading && (
              <SectionCard>
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <Loader2 className="h-7 w-7 animate-spin text-[var(--color-primary)]" />
                  <span className="theme-text-muted text-xs">
                    Memuat profil pengguna...
                  </span>
                </div>
              </SectionCard>
            )}

            {activeTab === "profil" && !loading && (
              <SectionCard>
                <h3 className="theme-text-secondary mb-4 text-sm font-semibold">
                  Informasi Profil
                </h3>

                <div className="mb-6 flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-full ${themePrimaryGradient} text-xl font-semibold text-[var(--color-card)] ${themePrimaryShadow}`}
                    >
                      Y
                    </div>

                    <button
                      type="button"
                      className={`theme-card theme-border theme-text-muted absolute -bottom-1 -right-1 rounded-full border p-1.5 transition-colors hover:border-[color-mix(in_srgb,var(--color-primary)_28%,transparent)] hover:text-[var(--color-primary)] ${themeCardShadow}`}
                    >
                      <Camera size={12} />
                    </button>
                  </div>

                  <div>
                    <p className="theme-text text-sm font-semibold">
                      {profil.nama}
                    </p>
                    <p className="theme-text-muted text-xs">{profil.jabatan}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                  <div>
                    <FieldLabel>Nama Lengkap</FieldLabel>
                    <input
                      type="text"
                      value={profil.nama}
                      onChange={(e) =>
                        setProfil({ ...profil, nama: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <FieldLabel>Jabatan</FieldLabel>
                    <input
                      type="text"
                      value={profil.jabatan}
                      onChange={(e) =>
                        setProfil({ ...profil, jabatan: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <FieldLabel>Email</FieldLabel>
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                      />
                      <input
                        type="email"
                        value={profil.email}
                        onChange={(e) =>
                          setProfil({ ...profil, email: e.target.value })
                        }
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Nomor Telepon</FieldLabel>
                    <div className="relative">
                      <Phone
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                      />
                      <input
                        type="text"
                        value={profil.telepon}
                        onChange={(e) =>
                          setProfil({ ...profil, telepon: e.target.value })
                        }
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {activeTab === "yayasan" && (
              <SectionCard>
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] p-3.5">
                  <Building2
                    className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                    size={16}
                  />
                  <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    Pengaturan identitas resmi yayasan naungan. Data
                    tersinkronisasi langsung dengan sistem backend yayasan.
                  </p>
                </div>

                <h3 className="theme-text-secondary mb-4 text-sm font-semibold">
                  Informasi Lembaga Yayasan
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                  <div className="sm:col-span-2 2xl:col-span-4">
                    <FieldLabel>Nama Yayasan *</FieldLabel>
                    <input
                      type="text"
                      value={yayasan.nama}
                      onChange={(e) =>
                        setYayasan({ ...yayasan, nama: e.target.value })
                      }
                      className={inputClass}
                      placeholder="Masukkan nama resmi yayasan"
                    />
                  </div>

                  <div>
                    <FieldLabel>NPYP *</FieldLabel>
                    <input
                      type="text"
                      value={yayasan.npyp}
                      onChange={(e) =>
                        setYayasan({ ...yayasan, npyp: e.target.value })
                      }
                      className={inputClass}
                      placeholder="Contoh: NPYP-998877"
                    />
                    <p className="theme-text-muted mt-1 text-[11px]">
                      NPYP unik terdaftar pada kementerian / dinas terkait.
                    </p>
                  </div>

                  <div>
                    <FieldLabel>Telepon Kantor</FieldLabel>
                    <input
                      type="text"
                      value={yayasan.telepon}
                      onChange={(e) =>
                        setYayasan({ ...yayasan, telepon: e.target.value })
                      }
                      className={inputClass}
                      placeholder="Nomor telepon kantor yayasan"
                    />
                  </div>

                  <div>
                    <FieldLabel>Email Lembaga</FieldLabel>
                    <input
                      type="email"
                      value={yayasan.email}
                      onChange={(e) =>
                        setYayasan({ ...yayasan, email: e.target.value })
                      }
                      className={inputClass}
                      placeholder="email@yayasan.org"
                    />
                  </div>

                  <div className="sm:col-span-2 2xl:col-span-4">
                    <FieldLabel>Alamat Kantor Yayasan</FieldLabel>
                    <input
                      type="text"
                      value={yayasan.alamat}
                      onChange={(e) =>
                        setYayasan({ ...yayasan, alamat: e.target.value })
                      }
                      className={inputClass}
                      placeholder="Alamat lengkap domisili kantor yayasan"
                    />
                  </div>
                </div>
              </SectionCard>
            )}

            {activeTab === "keamanan" && (
              <>
                <SectionCard>
                  <h3 className="theme-text-secondary mb-4 text-sm font-semibold">
                    Ubah Password
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2 sm:max-w-sm">
                      <FieldLabel>Password Saat Ini</FieldLabel>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordForm.lama}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              lama: e.target.value,
                            })
                          }
                          placeholder="••••••••"
                          className={`${inputClass} pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
                        >
                          {showPassword ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Password Baru</FieldLabel>
                      <div className="relative">
                        <input
                          type={showPasswordBaru ? "text" : "password"}
                          value={passwordForm.baru}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              baru: e.target.value,
                            })
                          }
                          placeholder="••••••••"
                          className={`${inputClass} pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswordBaru(!showPasswordBaru)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
                        >
                          {showPasswordBaru ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Konfirmasi Password Baru</FieldLabel>
                      <input
                        type="password"
                        value={passwordForm.konfirmasi}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            konfirmasi: e.target.value,
                          })
                        }
                        placeholder="••••••••"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="theme-border-soft mt-4 flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="theme-text-muted text-xs">
                      Minimal 8 karakter, kombinasi huruf besar, huruf kecil,
                      dan angka.
                    </p>
                    <button
                      type="button"
                      onClick={handleSimpan}
                      disabled={
                        saving ||
                        loading ||
                        !passwordForm.lama ||
                        !passwordForm.baru
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          Simpan Password
                        </>
                      )}
                    </button>
                  </div>
                </SectionCard>

                <SectionCard>
                  <div className="flex items-start gap-3">
                    <div
                      className={`shrink-0 rounded-lg border p-2 ${themeWarningSurface} ${themeWarningBorder} text-[var(--color-warning)]`}
                    >
                      <Shield size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="theme-text text-sm font-semibold">
                            Verifikasi Dua Langkah
                          </p>
                          <p className="theme-text-muted mt-0.5 text-xs">
                            Tambahkan lapisan keamanan ekstra saat masuk ke
                            akun.
                          </p>
                        </div>
                        <Toggle checked={false} onChange={() => {}} />
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard>
                  <div className="flex items-start gap-3">
                    <div
                      className={`shrink-0 rounded-lg border p-2 ${themeDangerSurface} ${themeDangerBorder} text-[var(--color-text)]`}
                    >
                      <AlertTriangle size={16} />
                    </div>

                    <div>
                      <p className="theme-text text-sm font-semibold">
                        Keluar dari Semua Perangkat
                      </p>
                      <p className="theme-text-muted mb-3 mt-0.5 text-xs">
                        Akhiri semua sesi aktif di perangkat lain selain
                        perangkat ini.
                      </p>
                      <button
                        type="button"
                        className={`rounded-lg border px-3.5 py-2 text-xs font-medium text-[var(--color-text)] transition-colors hover:opacity-80 ${themeDangerSurface} ${themeDangerBorder}`}
                      >
                        Keluar dari Semua Perangkat
                      </button>
                    </div>
                  </div>
                </SectionCard>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}