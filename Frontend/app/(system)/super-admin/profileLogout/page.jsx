"use client";

import { useCallback, useEffect, useState } from "react";
import {
  User,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Lock,
  Edit,
  Save,
  X,
  Camera,
  Eye,
  EyeOff,
  CheckCircle,
  Crown,
  Clock,
  Smartphone,
  Activity,
  Info,
  RefreshCw,
  AlertCircle,
  Building2,
  Loader2,
} from "lucide-react";

import { getProfile, updateProfile } from "@/services/user.service";
import { getAuditLogs } from "@/services/auditLog.service";
import { changePassword } from "@/services/auth.services";
import { getBackendOrigin } from "@/lib/auth";

// Warna solid primary (tanpa #000 hardcoded) supaya ikut perubahan tema dari CMS.
const themePrimaryGradient = "bg-[var(--color-primary)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

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

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-danger)_22%,transparent)]";

const themeFocus =
  "focus:outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const emptyProfile = {
  id: "",
  namaLengkap: "",
  namaPengguna: "",
  email: "",
  noTelepon: "",
  avatar: null,
  alamat: "",
  alamatDomisili: "",
  tempatLahir: "",
  tanggalLahir: "",
  status: "",
  dibuatPada: "",
  terakhirLogin: "",
  peran: null,
  sekolah: null,
};

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTanggalShort(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;

  return formatTanggalShort(value);
}

function normalizeProfile(user) {
  return {
    ...emptyProfile,
    ...user,
    namaLengkap: user?.namaLengkap ?? "",
    namaPengguna: user?.namaPengguna ?? "",
    email: user?.email ?? "",
    noTelepon: user?.noTelepon ?? "",
    avatar: user?.avatar ?? null,
    alamat: user?.alamat ?? "",
    alamatDomisili: user?.alamatDomisili ?? "",
    tempatLahir: user?.tempatLahir ?? "",
    tanggalLahir: user?.tanggalLahir
      ? String(user.tanggalLahir).slice(0, 10)
      : "",
  };
}

function getRoleName(profile) {
  return profile?.peran?.namaTampilan || profile?.peran?.nama || "Pengguna";
}

function getStatusName(status) {
  if (!status) return "Tidak diketahui";

  const normalized = String(status).toLowerCase();

  if (normalized === "aktif") return "Aktif";
  if (normalized === "nonaktif") return "Nonaktif";

  return status;
}

function getAvatarUrl(avatar) {
  if (!avatar || typeof avatar !== "string") return null;

  if (/^https?:\/\//i.test(avatar)) return avatar;

  const baseUrl = getBackendOrigin();

  return `${baseUrl}/${avatar.replace(/^\/+/, "")}`;
}

// Semua StatCard memakai warna primary yang sama, sama seperti halaman Log Aktivitas.
function StatCard({ icon: Icon, label, value }) {
  return (
    <div
      className={`min-w-0 rounded-2xl border theme-border theme-card p-4 ${themeCardShadow}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
        >
          <Icon size={17} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
            {label}
          </p>
          <p className="truncate text-lg font-semibold theme-text">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState(emptyProfile);
  const [form, setForm] = useState(emptyProfile);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getProfile();

      if (!response?.success || !response?.data) {
        throw new Error(
          response?.message || "Data profil tidak berhasil diambil."
        );
      }

      const normalized = normalizeProfile(response.data);

      setProfile(normalized);
      setForm(normalized);
    } catch (error) {
      console.error("Gagal mengambil profil:", error);
      setErrorMessage(
        error?.message || "Gagal mengambil data profil dari server."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadProfile]);

  const handleProfileChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleCancelEdit = () => {
    setForm(profile);
    setIsEditing(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSaveProfile = async () => {
    if (!form.namaLengkap.trim()) {
      setErrorMessage("Nama lengkap wajib diisi.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    setSaveSuccess(false);

    try {
      const payload = {
        namaLengkap: form.namaLengkap.trim(),
        noTelepon: form.noTelepon.trim() || null,
        alamat: form.alamat.trim() || null,
        alamatDomisili: form.alamatDomisili.trim() || null,
        tempatLahir: form.tempatLahir.trim() || null,
        tanggalLahir: form.tanggalLahir || null,
      };

      const response = await updateProfile(payload);

      if (!response?.success || !response?.data) {
        throw new Error(response?.message || "Profil gagal diperbarui.");
      }

      const updatedProfile = normalizeProfile({
        ...profile,
        ...response.data,
      });

      setProfile(updatedProfile);
      setForm(updatedProfile);
      setIsEditing(false);
      setSaveSuccess(true);
      setSuccessMessage(response.message || "Profil berhasil diperbarui.");
    } catch (error) {
      console.error("Gagal menyimpan profil:", error);
      setErrorMessage(
        error?.message || "Terjadi kesalahan saat menyimpan profil."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { key: "profile", label: "Profil", icon: User },
    { key: "security", label: "Keamanan", icon: Lock },
    { key: "activity", label: "Aktivitas", icon: Activity },
    { key: "sessions", label: "Sesi Aktif", icon: Smartphone },
  ];

  const roleName = getRoleName(profile);
  const avatarUrl = getAvatarUrl(profile.avatar);
  const isActive = String(profile.status).toLowerCase() === "aktif";

  const stats = [
    {
      label: "Status Akun",
      value: getStatusName(profile.status),
      icon: Shield,
    },
    {
      label: "Bergabung",
      value: formatTanggalShort(profile.dibuatPada),
      icon: Calendar,
    },
    {
      label: "Terakhir Login",
      value: profile.terakhirLogin ? timeAgo(profile.terakhirLogin) : "-",
      icon: Clock,
    },
    {
      label: "Peran",
      value: roleName,
      icon: Crown,
    },
  ];

  return (
    <div className="theme-page theme-text min-h-full w-full min-w-0">
      {/* Tanpa max-w & mx-auto agar konten selalu menempel ke sidebar saat zoom out */}
      <div className="w-full min-w-0 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`shrink-0 p-2.5 rounded-xl ${themePrimaryGradient} text-white ${themePrimaryShadow}`}
              >
                <UserCircle size={19} />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-semibold theme-text">
                    Profil Saya
                  </h1>

                  <span
                    className={`text-xs font-medium ${themePrimarySoft} ${themePrimaryText} px-3 py-1 rounded-full border ${themePrimarySoftBorder}`}
                  >
                    {isLoading ? "Memuat..." : roleName}
                  </span>
                </div>

                <p className="text-sm theme-text-secondary mt-1">
                  Kelola informasi profil dan pengaturan akun Anda.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {!isEditing && activeTab === "profile" && (
                <button
                  type="button"
                  onClick={() => {
                    setForm(profile);
                    setIsEditing(true);
                    setErrorMessage("");
                    setSuccessMessage("");
                    setSaveSuccess(false);
                  }}
                  disabled={isLoading || !profile.id}
                  className={`flex items-center gap-2 px-5 py-2 text-sm font-medium text-white ${themePrimaryGradient} rounded-lg transition-all ${themePrimaryShadow} hover:opacity-90 disabled:opacity-50`}
                >
                  <Edit size={16} />
                  Edit Profil
                </button>
              )}

              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium theme-text-secondary theme-card border ${themeNeutralBorder} rounded-lg ${themeNeutralHover} disabled:opacity-50`}
                  >
                    <X size={16} />
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving || isLoading}
                    className={`flex items-center gap-2 px-5 py-2 text-sm font-medium text-white ${themePrimaryGradient} rounded-lg ${themePrimaryShadow} hover:opacity-90 disabled:opacity-70`}
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Simpan
                      </>
                    )}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={loadProfile}
                disabled={isLoading || isSaving}
                title="Muat ulang profil"
                className={`p-2 rounded-lg border theme-border theme-card ${themeNeutralHover} disabled:opacity-50`}
              >
                <RefreshCw
                  size={16}
                  className={isLoading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className={`flex items-start gap-2.5 p-3 rounded-lg border ${themeDangerSurface} ${themeDangerBorder} text-sm`}
            >
              <AlertCircle
                size={17}
                className="text-[var(--color-danger)] shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">{errorMessage}</div>
              <button
                type="button"
                onClick={() => setErrorMessage("")}
                aria-label="Tutup pesan error"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className={`flex items-center gap-2 p-3 rounded-lg border ${themeSuccessSurface} ${themeSuccessBorder} text-sm`}
            >
              <CheckCircle
                size={17}
                className="text-[var(--color-success)] shrink-0"
              />
              <span>{successMessage}</span>
              <button
                type="button"
                className="ml-auto"
                onClick={() => {
                  setSuccessMessage("");
                  setSaveSuccess(false);
                }}
                aria-label="Tutup pesan sukses"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                icon={stat.icon}
                label={stat.label}
                value={isLoading ? "..." : stat.value}
              />
            ))}
          </div>

          <div
            className={`theme-card rounded-xl border theme-border ${themeCardShadow} p-4 sm:p-6`}
          >
            {isLoading ? (
              <div className="flex items-center gap-4 py-4">
                <div
                  className={`w-20 h-20 rounded-full ${themeNeutralSurface} animate-pulse`}
                />
                <div className="flex-1 space-y-3">
                  <div
                    className={`h-5 w-48 max-w-full rounded ${themeNeutralSurface} animate-pulse`}
                  />
                  <div
                    className={`h-4 w-64 max-w-full rounded ${themeNeutralSurface} animate-pulse`}
                  />
                  <div
                    className={`h-4 w-40 max-w-full rounded ${themeNeutralSurface} animate-pulse`}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full ${themePrimaryGradient} flex items-center justify-center text-white text-2xl sm:text-3xl font-bold ${themePrimaryShadow} overflow-hidden`}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`Foto profil ${profile.namaLengkap}`}
                        className="w-full h-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      (profile.namaLengkap || profile.namaPengguna || "?")
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>

                  <div
                    title="Upload foto profil belum tersedia di endpoint BE yang diberikan"
                    className={`absolute -bottom-1 -right-1 p-1.5 rounded-full ${themeNeutralSurface} theme-text-muted border-2 border-[var(--color-card)]`}
                  >
                    <Camera size={14} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-semibold theme-text">
                        {profile.namaLengkap || "-"}
                      </h2>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="flex items-center gap-1.5 text-sm theme-text-secondary break-all">
                          <Mail size={14} className="theme-text-muted shrink-0" />
                          {profile.email || "-"}
                        </span>

                        <span className="hidden sm:inline theme-text-muted">
                          |
                        </span>

                        <span className="flex items-center gap-1.5 text-sm theme-text-secondary">
                          <Phone size={14} className="theme-text-muted shrink-0" />
                          {profile.noTelepon || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
                          isActive
                            ? `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`
                            : `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive
                              ? "bg-[var(--color-success)]"
                              : "bg-[var(--color-warning)]"
                          }`}
                        />
                        {getStatusName(profile.status)}
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${themePrimarySoft} ${themePrimaryText} border ${themePrimarySoftBorder} flex items-center gap-1.5`}
                      >
                        <Crown size={12} />
                        {roleName}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs theme-text-muted">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      Bergabung: {formatTanggalShort(profile.dibuatPada)}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />
                      Terakhir login: {formatTanggal(profile.terakhirLogin)}
                    </span>
                  </div>

                  {profile.sekolah?.nama && (
                    <div className="flex items-center gap-1.5 text-xs theme-text-secondary mt-2">
                      <Building2 size={13} />
                      {profile.sekolah.nama}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto theme-card rounded-t-xl border theme-border border-b-0">
            <nav className="flex gap-0.5 min-w-max px-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActiveTab = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.key);
                      if (tab.key !== "profile") {
                        setIsEditing(false);
                        setForm(profile);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                      isActiveTab
                        ? `border-[var(--color-primary)] ${themePrimaryText} ${themePrimarySoft}`
                        : `border-transparent theme-text-secondary ${themeNeutralHover}`
                    }`}
                  >
                    <Icon
                      size={16}
                      className={
                        isActiveTab ? themePrimaryText : "theme-text-muted"
                      }
                    />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div
            className={`theme-card rounded-b-xl border theme-border ${themeCardShadow} p-4 sm:p-6`}
          >
            {activeTab === "profile" && (
              <ProfileTab
                profile={form}
                isEditing={isEditing}
                isLoading={isLoading}
                handleChange={handleProfileChange}
              />
            )}

            {activeTab === "security" && <SecurityTab />}

            {activeTab === "activity" && <ActivityTab />}

            {activeTab === "sessions" && <SessionsTab />}
          </div>

          <div
            className={`text-center text-xs theme-text-muted py-2 border-t ${themeDivider}`}
          >
            © {new Date().getFullYear()} SmartSchool
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ profile, isEditing, isLoading, handleChange }) {
  const inputClass = (editing) =>
    `w-full px-3 py-2 text-sm rounded-lg border transition theme-text ${
      editing
        ? `${themeNeutralBorder} ${themeNeutralSurface} ${themeFocus}`
        : `theme-card ${themeNeutralBorder} cursor-default`
    } disabled:opacity-80`;

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className={`h-10 rounded-lg ${themeNeutralSurface} animate-pulse`}
            />
          ))}
        </div>
      ) : (
        <>
          <div>
            <h3 className="text-sm font-semibold theme-text">Informasi Akun</h3>
            <p className="text-xs theme-text-secondary mt-1">
              Informasi yang diambil dari akun SmartSchool Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                Nama Lengkap{" "}
                <span className="text-[var(--color-warning)]">*</span>
              </label>
              <input
                type="text"
                value={profile.namaLengkap}
                onChange={(event) =>
                  handleChange("namaLengkap", event.target.value)
                }
                disabled={!isEditing}
                required
                className={inputClass(isEditing)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={profile.namaPengguna}
                disabled
                className={inputClass(false)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className={inputClass(false)}
              />
              <p className="text-[11px] theme-text-muted mt-1">
                Perubahan email belum didukung oleh endpoint update profil.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={profile.noTelepon}
                onChange={(event) =>
                  handleChange("noTelepon", event.target.value)
                }
                disabled={!isEditing}
                className={inputClass(isEditing)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                Tempat Lahir
              </label>
              <input
                type="text"
                value={profile.tempatLahir}
                onChange={(event) =>
                  handleChange("tempatLahir", event.target.value)
                }
                disabled={!isEditing}
                className={inputClass(isEditing)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={profile.tanggalLahir}
                onChange={(event) =>
                  handleChange("tanggalLahir", event.target.value)
                }
                disabled={!isEditing}
                className={inputClass(isEditing)}
              />
            </div>
          </div>

          <div className={`border-t ${themeDivider} pt-4`}>
            <h4 className="text-sm font-semibold theme-text flex items-center gap-2 mb-3">
              <MapPin size={16} className="theme-text-muted" />
              Alamat
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                  Alamat Utama
                </label>
                <textarea
                  value={profile.alamat}
                  onChange={(event) =>
                    handleChange("alamat", event.target.value)
                  }
                  disabled={!isEditing}
                  rows={2}
                  className={`${inputClass(isEditing)} resize-y`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                  Alamat Domisili
                </label>
                <textarea
                  value={profile.alamatDomisili}
                  onChange={(event) =>
                    handleChange("alamatDomisili", event.target.value)
                  }
                  disabled={!isEditing}
                  rows={2}
                  className={`${inputClass(isEditing)} resize-y`}
                />
              </div>
            </div>
          </div>

          {!isEditing && (
            <div
              className={`flex items-start gap-2.5 p-3 rounded-lg border ${themeInfoSurface} ${themeInfoBorder} text-xs theme-text-secondary`}
            >
              <Info
                size={15}
                className="text-[var(--color-info)] shrink-0 mt-0.5"
              />
              <p>
                Tekan <strong>Edit Profil</strong> untuk mengubah nama, nomor
                telepon, informasi kelahiran, dan alamat. Email dan username
                ditampilkan dari data akun BE.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`p-1.5 rounded-lg border ${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`}
      >
        <Icon size={16} />
      </div>
      <div>
        <h4 className="text-sm font-semibold theme-text">{title}</h4>
        <p className="text-xs theme-text-secondary mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function SecurityTab() {
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

  const passwordInputClass = `w-full rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-3.5 py-2.5 pr-10 text-sm theme-text ${themeFocus}`;

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
    <div className="space-y-5">
      <SectionHeader
        icon={Lock}
        title="Keamanan Akun"
        description="Perbarui kata sandi akun Super Admin Anda."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className={`flex items-start gap-3 p-4 rounded-lg border ${themeDangerSurface} ${themeDangerBorder} text-[var(--color-danger)] text-sm`}
          >
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className={`flex items-start gap-3 p-4 rounded-lg border ${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)] text-sm`}
          >
            <CheckCircle size={18} className="shrink-0 mt-0.5" />
            <p>{success}</p>
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
                className={passwordInputClass}
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
                className={passwordInputClass}
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
                className={passwordInputClass}
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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3">
          <p className="text-xs theme-text-muted">
            Minimal 8 karakter. Jangan bagikan kata sandi kepada siapa pun.
          </p>

          <button
            type="submit"
            disabled={saving || !form.kataSandiLama || !form.kataSandiBaru}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
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

      <div className={`border-t ${themeDivider} pt-4`}>
        <h4 className="text-sm font-semibold theme-text mb-3">
          Pengaturan Keamanan
        </h4>

        <div className="space-y-3">
          <div
            className={`flex items-center justify-between gap-3 p-4 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface}`}
          >
            <div className="flex items-start gap-3">
              <Shield size={18} className="theme-text-secondary mt-0.5" />
              <div>
                <p className="text-sm font-medium theme-text">
                  Two-Factor Authentication
                </p>
                <p className="text-xs theme-text-secondary mt-1">
                  Status 2FA belum tersedia dari endpoint yang diberikan.
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 text-xs px-2.5 py-1 rounded-full border ${themeNeutralBorder} theme-text-muted`}
            >
              Belum tersedia
            </span>
          </div>

          <div
            className={`flex items-center justify-between gap-3 p-4 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface}`}
          >
            <div className="flex items-start gap-3">
              <Mail size={18} className="theme-text-secondary mt-0.5" />
              <div>
                <p className="text-sm font-medium theme-text">
                  Notifikasi Keamanan
                </p>
                <p className="text-xs theme-text-secondary mt-1">
                  Pengaturan notifikasi belum tersedia dari endpoint yang
                  diberikan.
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 text-xs px-2.5 py-1 rounded-full border ${themeNeutralBorder} theme-text-muted`}
            >
              Belum tersedia
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAuditLogs({ page: 1, limit: 15 });
      const items = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      setLogs(items);
    } catch (err) {
      setError(err?.message || "Gagal memuat log aktivitas platform.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchLogs();
    });
  }, [fetchLogs]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          icon={Activity}
          title="Riwayat Aktivitas Platform"
          description="Menampilkan log audit aktivitas terbaru dari endpoint GET /api/audit-log."
        />
        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${themeNeutralBorder} theme-text disabled:opacity-50`}
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Clock size={13} />
          )}
          Muat Ulang
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10 text-xs theme-text-secondary gap-2">
          <Loader2 size={16} className="animate-spin" />
          Memuat riwayat aktivitas...
        </div>
      ) : logs.length === 0 ? (
        <div
          className={`flex flex-col items-center text-center py-10 px-4 rounded-lg border border-dashed ${themeNeutralBorder}`}
        >
          <Activity size={28} className="theme-text-muted mb-3" />
          <p className="text-sm font-medium theme-text">
            Belum ada log aktivitas tercatat
          </p>
          <p className="text-xs theme-text-secondary mt-1 max-w-md">
            Aktivitas perubahan data atau autentikasi yang tercatat pada sistem akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className={`divide-y rounded-lg border ${themeNeutralBorder}`}>
          {logs.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between text-xs"
            >
              <div className="min-w-0">
                <p className="font-semibold theme-text">
                  {item.aksi || "-"}{" "}
                  {item.entitas ? (
                    <span className="font-normal theme-text-secondary">
                      ({item.entitas})
                    </span>
                  ) : null}
                </p>
                <p className="theme-text-secondary mt-0.5 truncate">
                  {item.namaPelaku || item.peranPelaku || "Sistem"}
                  {item.alamatIp ? ` • IP: ${item.alamatIp}` : ""}
                </p>
              </div>
              <span className="theme-text-muted shrink-0 text-[11px]">
                {item.dibuatPada
                  ? new Date(item.dibuatPada).toLocaleString("id-ID")
                  : "-"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SessionsTab() {
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={Smartphone}
        title="Perangkat yang Terhubung"
        description="Daftar sesi login belum tersedia dari endpoint BE yang diberikan."
      />

      <div
        className={`flex flex-col items-center text-center py-10 px-4 rounded-lg border border-dashed ${themeNeutralBorder}`}
      >
        <Smartphone size={28} className="theme-text-muted mb-3" />
        <p className="text-sm font-medium theme-text">
          Data sesi perangkat belum tersedia
        </p>
        <p className="text-xs theme-text-secondary mt-1 max-w-md">
          Backend perlu menyediakan daftar sesi aktif beserta mekanisme
          pencabutan sesi sebelum fitur pengelolaan perangkat dapat digunakan.
        </p>
      </div>
    </div>
  );
}