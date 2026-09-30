"use client";

import { useState } from "react";
import Image from "next/image";
import {
  User,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Key,
  Lock,
  Edit,
  Save,
  X,
  Camera,
  Eye,
  EyeOff,
  CheckCircle,
  LogOut,
  Crown,
  Clock,
  Smartphone,
  Activity,
  Info,
  RefreshCw,
} from "lucide-react";

// ============================================================
// DUMMY DATA
// ============================================================

const userData = {
  id: "usr-001",
  namaLengkap: "Super Admin",
  email: "admin@smartschool.com",
  noTelepon: "+62 812 3456 7890",
  avatar: null,
  role: "Super Admin",
  status: "Aktif",
  bergabung: "2024-01-01T00:00:00Z",
  terakhirLogin: "2026-08-11T14:30:00Z",
  alamat: "Jl. Pendidikan No. 1, Jakarta Pusat",
  kota: "Jakarta Pusat",
  provinsi: "DKI Jakarta",
  kodePos: "10110",
  website: "https://smartschool.com",
  bio: "Super Administrator SmartSchool dengan pengalaman lebih dari 5 tahun di bidang manajemen sistem pendidikan.",
};

const activityLogs = [
  {
    id: 1,
    action: "Login",
    detail: "Login dari IP 192.168.1.1",
    timestamp: "2026-08-11T14:30:00Z",
    device: "Chrome - Windows",
  },
  {
    id: 2,
    action: "Pengaturan",
    detail: "Mengubah pengaturan umum sistem",
    timestamp: "2026-08-11T10:15:00Z",
    device: "Chrome - Windows",
  },
  {
    id: 3,
    action: "Manajemen User",
    detail: "Menambahkan user baru: Guru SMA 1",
    timestamp: "2026-08-10T16:45:00Z",
    device: "Chrome - Mac",
  },
  {
    id: 4,
    action: "Login",
    detail: "Login dari IP 192.168.1.1",
    timestamp: "2026-08-10T08:00:00Z",
    device: "Chrome - Windows",
  },
  {
    id: 5,
    action: "Yayasan",
    detail: "Memverifikasi yayasan: YPI Harapan",
    timestamp: "2026-08-09T13:20:00Z",
    device: "Firefox - Windows",
  },
  {
    id: 6,
    action: "Langganan",
    detail: "Memperpanjang langganan SMA Bina Bangsa",
    timestamp: "2026-08-08T11:00:00Z",
    device: "Chrome - Windows",
  },
];

const deviceSessions = [
  {
    device: "Chrome - Windows",
    ip: "192.168.1.1",
    lastActive: "2026-08-11T14:30:00Z",
    current: true,
  },
  {
    device: "Firefox - Windows",
    ip: "192.168.1.5",
    lastActive: "2026-08-09T13:20:00Z",
    current: false,
  },
  {
    device: "Chrome - Mac",
    ip: "192.168.1.10",
    lastActive: "2026-08-10T16:45:00Z",
    current: false,
  },
  {
    device: "Safari - iPhone",
    ip: "192.168.1.20",
    lastActive: "2026-08-07T09:00:00Z",
    current: false,
  },
];

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

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

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

const themeFocus =
  "focus:outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeHeroSecondary =
  "text-[color-mix(in_srgb,var(--color-card)_78%,transparent)]";

// ============================================================
// UTILITY
// ============================================================

const formatTanggal = (dateString) => {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTanggalShort = (dateString) => {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const timeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);

  const diffMs = now - past;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;

  return formatTanggalShort(dateString);
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ==========================================================
  // FORM STATES
  // ==========================================================

  const [profile, setProfile] = useState({
    namaLengkap: userData.namaLengkap,
    email: userData.email,
    noTelepon: userData.noTelepon,
    alamat: userData.alamat,
    kota: userData.kota,
    provinsi: userData.provinsi,
    kodePos: userData.kodePos,
    website: userData.website,
    bio: userData.bio,
  });

  const [passwordData, setPasswordData] = useState({
    passwordLama: "",
    passwordBaru: "",
    konfirmasiPassword: "",
  });

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    setSaveSuccess(false);

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setIsEditing(false);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

      console.log("Profile updated:", profile);
    }, 1000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();

    if (
      passwordData.passwordBaru !==
      passwordData.konfirmasiPassword
    ) {
      alert("Password baru dan konfirmasi password tidak cocok!");
      return;
    }

    console.log("Password changed:", passwordData);

    setPasswordData({
      passwordLama: "",
      passwordBaru: "",
      konfirmasiPassword: "",
    });
  };

  // ==========================================================
  // TABS
  // ==========================================================

  const tabs = [
    {
      id: "profile",
      label: "Profil",
      icon: User,
    },
    {
      id: "security",
      label: "Keamanan",
      icon: Lock,
    },
    {
      id: "activity",
      label: "Aktivitas",
      icon: Activity,
    },
    {
      id: "sessions",
      label: "Sesi Aktif",
      icon: Smartphone,
    },
  ];

  // ==========================================================
  // STATS
  // ==========================================================

  const stats = [
    {
      label: "Total Login",
      value: "247",
      icon: LogOut,
      type: "primary",
    },
    {
      label: "Hari Aktif",
      value: "189",
      icon: Calendar,
      type: "success",
    },
    {
      label: "Aksi Dilakukan",
      value: "1,432",
      icon: Activity,
      type: "info",
    },
    {
      label: "Peran",
      value: "Super Admin",
      icon: Crown,
      type: "warning",
    },
  ];

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1500px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="space-y-6">

          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`
                  shrink-0
                  p-2.5
                  rounded-xl
                  ${themePrimaryGradient}
                  text-[var(--color-card)]
                  ${themePrimaryShadow}
                `}
              >
                <UserCircle size={19} />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-semibold theme-text">
                    Profil Saya
                  </h1>

                  <span
                    className={`
                      text-xs
                      font-medium
                      ${themePrimarySoft}
                      ${themePrimaryText}
                      px-3
                      py-1
                      rounded-full
                      border
                      ${themePrimarySoftBorder}
                    `}
                  >
                    Super Admin
                  </span>
                </div>

                <p className="text-sm theme-text-secondary mt-1">
                  Kelola profil dan pengaturan akun Anda.
                </p>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex items-center gap-2.5 sm:ml-auto">
              {!isEditing && activeTab === "profile" && (
                <button
                  onClick={() => setIsEditing(true)}
                  className={`
                    flex
                    items-center
                    gap-2
                    px-5
                    py-2
                    text-sm
                    font-medium
                    text-[var(--color-card)]
                    ${themePrimaryGradient}
                    rounded-lg
                    transition-all
                    ${themePrimaryShadow}
                    hover:opacity-90
                  `}
                >
                  <Edit size={16} />
                  Edit Profil
                </button>
              )}

              {isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className={`
                      flex
                      items-center
                      gap-2
                      px-4
                      py-2
                      text-sm
                      font-medium
                      theme-text-secondary
                      theme-card
                      border
                      ${themeNeutralBorder}
                      rounded-lg
                      ${themeNeutralHover}
                      transition-colors
                    `}
                  >
                    <X size={16} />
                    Batal
                  </button>

                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className={`
                      flex
                      items-center
                      gap-2
                      px-5
                      py-2
                      text-sm
                      font-medium
                      text-[var(--color-card)]
                      ${themePrimaryGradient}
                      rounded-lg
                      transition-all
                      ${themePrimaryShadow}
                      hover:opacity-90
                      disabled:opacity-70
                      disabled:cursor-not-allowed
                    `}
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw
                          size={16}
                          className="animate-spin"
                        />
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

              {saveSuccess && (
                <span
                  className={`
                    flex
                    items-center
                    gap-1.5
                    text-sm
                    text-[var(--color-success)]
                    ${themeSuccessSurface}
                    px-3
                    py-1.5
                    rounded-lg
                    border
                    ${themeSuccessBorder}
                    animate-in
                    fade-in
                    slide-in-from-right-2
                  `}
                >
                  <CheckCircle size={16} />
                  Tersimpan!
                </span>
              )}
            </div>
          </div>

          {/* ==================================================
              STATS
          ================================================== */}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;

              const iconClass =
                stat.type === "primary"
                  ? `${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`
                  : stat.type === "success"
                    ? `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`
                    : stat.type === "info"
                      ? `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`
                      : `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`;

              return (
                <div
                  key={idx}
                  className={`
                    theme-card
                    rounded-lg
                    border
                    theme-border
                    p-3.5
                    ${themeSmallShadow}
                    hover:shadow-[0_5px_18px_color-mix(in_srgb,var(--color-text)_8%,transparent)]
                    transition-shadow
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        p-2
                        rounded-lg
                        border
                        ${iconClass}
                        flex-shrink-0
                      `}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-medium theme-text-muted uppercase tracking-wider truncate">
                        {stat.label}
                      </p>

                      <p className="text-lg font-semibold theme-text truncate">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ==================================================
              PROFILE HEADER CARD
          ================================================== */}

          <div
            className={`
              theme-card
              rounded-xl
              border
              theme-border
              ${themeCardShadow}
              p-4
              sm:p-6
            `}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">

              {/* AVATAR */}

              <div className="relative flex-shrink-0">
                <div
                  className={`
                    w-20
                    h-20
                    sm:w-24
                    sm:h-24
                    rounded-full
                    ${themePrimaryGradient}
                    flex
                    items-center
                    justify-center
                    text-[var(--color-card)]
                    text-2xl
                    sm:text-3xl
                    font-bold
                    ${themePrimaryShadow}
                    overflow-hidden
                  `}
                >
                  {userData.avatar ? (
                    <Image
                      src={userData.avatar}
                      alt="Avatar"
                      width={96}
                      height={96}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    userData.namaLengkap.charAt(0)
                  )}
                </div>

                <button
                  className={`
                    absolute
                    -bottom-1
                    -right-1
                    p-1.5
                    rounded-full
                    ${themePrimaryGradient}
                    text-[var(--color-card)]
                    ${themeSmallShadow}
                    transition-opacity
                    hover:opacity-90
                    border-2
                    border-[var(--color-card)]
                  `}
                >
                  <Camera size={14} />
                </button>
              </div>

              {/* PROFILE INFO */}

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-semibold theme-text">
                      {userData.namaLengkap}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                      <span className="flex items-center gap-1.5 text-sm theme-text-secondary">
                        <Mail
                          size={14}
                          className="theme-text-muted"
                        />
                        {userData.email}
                      </span>

                      <span className="hidden sm:inline theme-text-muted">
                        |
                      </span>

                      <span className="flex items-center gap-1.5 text-sm theme-text-secondary">
                        <Phone
                          size={14}
                          className="theme-text-muted"
                        />
                        {userData.noTelepon}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">

                    {/* STATUS */}

                    <span
                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-medium
                        ${themeSuccessSurface}
                        text-[var(--color-success)]
                        border
                        ${themeSuccessBorder}
                        flex
                        items-center
                        gap-1.5
                      `}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                      Aktif
                    </span>

                    {/* ROLE */}

                    <span
                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-medium
                        ${themeWarningSurface}
                        text-[var(--color-warning)]
                        border
                        ${themeWarningBorder}
                        flex
                        items-center
                        gap-1.5
                      `}
                    >
                      <Crown size={12} />
                      Super Admin
                    </span>
                  </div>
                </div>

                <p className="text-sm theme-text-secondary mt-2 leading-relaxed">
                  {userData.bio}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs theme-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    Bergabung: {formatTanggal(userData.bergabung)}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Clock size={12} />
                    Terakhir Login:{" "}
                    {formatTanggal(userData.terakhirLogin)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              TABS
          ================================================== */}

          <div
            className={`
              overflow-x-auto
              theme-card
              rounded-t-xl
              border
              theme-border
              border-b-0
            `}
          >
            <nav className="flex gap-0.5 min-w-max px-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex
                      items-center
                      gap-2
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      border-b-2
                      transition-all
                      duration-200
                      ${
                        isActive
                          ? `border-[var(--color-primary)] ${themePrimaryText} ${themePrimarySoft}`
                          : `
                            border-transparent
                            theme-text-secondary
                            hover:text-[var(--color-primary)]
                            ${themeNeutralHover}
                          `
                      }
                    `}
                  >
                    <Icon
                      size={16}
                      className={
                        isActive
                          ? themePrimaryText
                          : "theme-text-muted"
                      }
                    />

                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ==================================================
              CONTENT
          ================================================== */}

          <div
            className={`
              theme-card
              rounded-b-xl
              border
              theme-border
              ${themeCardShadow}
              p-4
              sm:p-6
            `}
          >
            {activeTab === "profile" && (
              <ProfileTab
                profile={profile}
                isEditing={isEditing}
                handleChange={handleProfileChange}
              />
            )}

            {activeTab === "security" && (
              <SecurityTab
                passwordData={passwordData}
                handleChange={handlePasswordChange}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showOldPassword={showOldPassword}
                setShowOldPassword={setShowOldPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                handleChangePassword={handleChangePassword}
              />
            )}

            {activeTab === "activity" && (
              <ActivityTab logs={activityLogs} />
            )}

            {activeTab === "sessions" && (
              <SessionsTab sessions={deviceSessions} />
            )}
          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div
            className={`
              text-center
              text-xs
              theme-text-muted
              py-2
              border-t
              ${themeDivider}
            `}
          >
            © 2026 SmartSchool • Profil terakhir diperbarui hari ini
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PROFILE TAB
// ============================================================

function ProfileTab({
  profile,
  isEditing,
  handleChange,
}) {
  const inputClass = (editing) =>
    `
      w-full
      px-3
      py-2
      text-sm
      rounded-lg
      border
      transition
      ${
        editing
          ? `
            theme-input
            ${themeFocus}
          `
          : `
            theme-card
            theme-border
            theme-text
            cursor-default
          `
      }
    `;

  return (
    <div className="space-y-6">

      {/* BASIC PROFILE */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label className="block text-xs font-medium theme-text-secondary mb-1.5">
            Nama Lengkap{" "}
            <span className="text-[var(--color-warning)]">*</span>
          </label>

          <input
            type="text"
            value={profile.namaLengkap}
            onChange={(e) =>
              handleChange("namaLengkap", e.target.value)
            }
            disabled={!isEditing}
            className={inputClass(isEditing)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium theme-text-secondary mb-1.5">
            Email{" "}
            <span className="text-[var(--color-warning)]">*</span>
          </label>

          <input
            type="email"
            value={profile.email}
            onChange={(e) =>
              handleChange("email", e.target.value)
            }
            disabled={!isEditing}
            className={inputClass(isEditing)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium theme-text-secondary mb-1.5">
            No Telepon
          </label>

          <input
            type="text"
            value={profile.noTelepon}
            onChange={(e) =>
              handleChange("noTelepon", e.target.value)
            }
            disabled={!isEditing}
            className={inputClass(isEditing)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium theme-text-secondary mb-1.5">
            Website
          </label>

          <input
            type="text"
            value={profile.website}
            onChange={(e) =>
              handleChange("website", e.target.value)
            }
            disabled={!isEditing}
            className={inputClass(isEditing)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium theme-text-secondary mb-1.5">
            Bio
          </label>

          <textarea
            value={profile.bio}
            onChange={(e) =>
              handleChange("bio", e.target.value)
            }
            disabled={!isEditing}
            rows={2}
            className={`${inputClass(isEditing)} resize-none`}
          />
        </div>
      </div>

      {/* ADDRESS */}

      <div
        className={`
          border-t
          ${themeDivider}
          pt-4
        `}
      >
        <h4 className="text-sm font-semibold theme-text flex items-center gap-2 mb-3">
          <MapPin
            size={16}
            className="theme-text-muted"
          />
          Alamat
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="md:col-span-2">
            <label className="block text-xs font-medium theme-text-secondary mb-1.5">
              Alamat
            </label>

            <input
              type="text"
              value={profile.alamat}
              onChange={(e) =>
                handleChange("alamat", e.target.value)
              }
              disabled={!isEditing}
              className={inputClass(isEditing)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium theme-text-secondary mb-1.5">
              Kota
            </label>

            <input
              type="text"
              value={profile.kota}
              onChange={(e) =>
                handleChange("kota", e.target.value)
              }
              disabled={!isEditing}
              className={inputClass(isEditing)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium theme-text-secondary mb-1.5">
              Provinsi
            </label>

            <input
              type="text"
              value={profile.provinsi}
              onChange={(e) =>
                handleChange("provinsi", e.target.value)
              }
              disabled={!isEditing}
              className={inputClass(isEditing)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium theme-text-secondary mb-1.5">
              Kode Pos
            </label>

            <input
              type="text"
              value={profile.kodePos}
              onChange={(e) =>
                handleChange("kodePos", e.target.value)
              }
              disabled={!isEditing}
              className={inputClass(isEditing)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SECURITY TAB
// ============================================================

function SecurityTab({
  passwordData,
  handleChange,
  showPassword,
  setShowPassword,
  showOldPassword,
  setShowOldPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  handleChangePassword,
}) {
  const passwordInputClass = `
    w-full
    px-3
    py-2
    text-sm
    theme-input
    border
    theme-border
    rounded-lg
    transition
    pr-10
    ${themeFocus}
  `;

  return (
    <div className="space-y-6">

      {/* CHANGE PASSWORD */}

      <div className="flex items-center gap-2.5 mb-2">
        <div
          className={`
            p-1.5
            rounded-lg
            ${themeWarningSurface}
            text-[var(--color-warning)]
            border
            ${themeWarningBorder}
          `}
        >
          <Lock size={16} />
        </div>

        <h4 className="text-sm font-semibold theme-text">
          Ubah Password
        </h4>
      </div>

      <form
        onSubmit={handleChangePassword}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4">

          {/* OLD PASSWORD */}

          <div>
            <label className="block text-xs font-medium theme-text-secondary mb-1.5">
              Password Lama
            </label>

            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                value={passwordData.passwordLama}
                onChange={(e) =>
                  handleChange(
                    "passwordLama",
                    e.target.value
                  )
                }
                placeholder="Masukkan password lama"
                className={passwordInputClass}
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowOldPassword(!showOldPassword)
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  theme-text-muted
                  hover:text-[var(--color-primary)]
                  transition-colors
                "
              >
                {showOldPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>

          {/* NEW PASSWORD */}

          <div>
            <label className="block text-xs font-medium theme-text-secondary mb-1.5">
              Password Baru
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordData.passwordBaru}
                onChange={(e) =>
                  handleChange(
                    "passwordBaru",
                    e.target.value
                  )
                }
                placeholder="Masukkan password baru (min 8 karakter)"
                className={passwordInputClass}
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  theme-text-muted
                  hover:text-[var(--color-primary)]
                  transition-colors
                "
              >
                {showPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}

          <div>
            <label className="block text-xs font-medium theme-text-secondary mb-1.5">
              Konfirmasi Password Baru
            </label>

            <div className="relative">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={passwordData.konfirmasiPassword}
                onChange={(e) =>
                  handleChange(
                    "konfirmasiPassword",
                    e.target.value
                  )
                }
                placeholder="Konfirmasi password baru"
                className={passwordInputClass}
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  theme-text-muted
                  hover:text-[var(--color-primary)]
                  transition-colors
                "
              >
                {showConfirmPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* PASSWORD INFO */}

        <div
          className={`
            flex
            items-center
            gap-2
            text-xs
            theme-text-secondary
            ${themeInfoSurface}
            p-3
            rounded-lg
            border
            ${themeInfoBorder}
          `}
        >
          <Info
            size={14}
            className="text-[var(--color-info)] flex-shrink-0"
          />

          <span>
            Password harus memiliki minimal 8 karakter,
            mengandung huruf besar, huruf kecil, angka,
            dan simbol.
          </span>
        </div>

        {/* UPDATE BUTTON */}

        <button
          type="submit"
          className={`
            px-5
            py-2
            text-sm
            font-medium
            text-[var(--color-card)]
            ${themePrimaryGradient}
            rounded-lg
            transition-all
            ${themePrimaryShadow}
            hover:opacity-90
          `}
        >
          <Key
            size={16}
            className="inline mr-2"
          />
          Update Password
        </button>
      </form>

      {/* ACCOUNT SECURITY */}

      <div
        className={`
          border-t
          ${themeDivider}
          pt-4
        `}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className={`
              p-1.5
              rounded-lg
              ${themePrimarySoft}
              ${themePrimaryText}
              border
              ${themePrimarySoftBorder}
            `}
          >
            <Shield size={16} />
          </div>

          <h4 className="text-sm font-semibold theme-text">
            Keamanan Akun
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* 2FA */}

          <div
            className={`
              flex
              items-center
              justify-between
              p-3
              rounded-lg
              ${themeNeutralSurface}
              border
              ${themeNeutralBorder}
            `}
          >
            <div>
              <p className="text-sm font-medium theme-text">
                Two-Factor Authentication
              </p>

              <p className="text-xs theme-text-muted">
                Keamanan tambahan dengan 2FA
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
              />

              <div
                className="
                  w-11
                  h-6
                  rounded-full
                  bg-[color-mix(in_srgb,var(--color-text)_16%,transparent)]
                  peer-focus:outline-none
                  peer-focus:ring-2
                  peer-focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                  peer-checked:bg-[var(--color-primary)]
                  peer
                  peer-checked:after:translate-x-full
                  after:content-['']
                  after:absolute
                  after:top-[2px]
                  after:left-[2px]
                  after:bg-[var(--color-card)]
                  after:border
                  after:border-[color-mix(in_srgb,var(--color-text)_12%,transparent)]
                  after:rounded-full
                  after:h-5
                  after:w-5
                  after:transition-all
                "
              />
            </label>
          </div>

          {/* SECURITY NOTIFICATION */}

          <div
            className={`
              flex
              items-center
              justify-between
              p-3
              rounded-lg
              ${themeNeutralSurface}
              border
              ${themeNeutralBorder}
            `}
          >
            <div>
              <p className="text-sm font-medium theme-text">
                Notifikasi Keamanan
              </p>

              <p className="text-xs theme-text-muted">
                Email untuk aktivitas mencurigakan
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="sr-only peer"
              />

              <div
                className="
                  w-11
                  h-6
                  rounded-full
                  bg-[color-mix(in_srgb,var(--color-text)_16%,transparent)]
                  peer-focus:outline-none
                  peer-focus:ring-2
                  peer-focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                  peer-checked:bg-[var(--color-primary)]
                  peer
                  peer-checked:after:translate-x-full
                  after:content-['']
                  after:absolute
                  after:top-[2px]
                  after:left-[2px]
                  after:bg-[var(--color-card)]
                  after:border
                  after:border-[color-mix(in_srgb,var(--color-text)_12%,transparent)]
                  after:rounded-full
                  after:h-5
                  after:w-5
                  after:transition-all
                "
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ACTIVITY TAB
// ============================================================

function ActivityTab({ logs }) {
  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`
              p-1.5
              rounded-lg
              ${themeInfoSurface}
              text-[var(--color-info)]
              border
              ${themeInfoBorder}
            `}
          >
            <Activity size={16} />
          </div>

          <h4 className="text-sm font-semibold theme-text">
            Riwayat Aktivitas
          </h4>
        </div>

        <span className="text-xs theme-text-muted">
          {logs.length} aktivitas
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          <thead>
            <tr
              className={`
                ${themeNeutralSurface}
                border-b
                ${themeDivider}
              `}
            >
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold theme-text-secondary uppercase tracking-wider">
                Aksi
              </th>

              <th className="px-4 py-2.5 text-left text-[10px] font-semibold theme-text-secondary uppercase tracking-wider hidden sm:table-cell">
                Detail
              </th>

              <th className="px-4 py-2.5 text-left text-[10px] font-semibold theme-text-secondary uppercase tracking-wider hidden md:table-cell">
                Perangkat
              </th>

              <th className="px-4 py-2.5 text-left text-[10px] font-semibold theme-text-secondary uppercase tracking-wider">
                Waktu
              </th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr
                key={log.id}
                className={`
                  border-b
                  ${themeDivider}
                  hover:${themePrimarySoft}
                  transition-colors
                `}
              >
                <td className="px-4 py-2.5">
                  <span
                    className={`
                      px-2.5
                      py-0.5
                      rounded-full
                      text-xs
                      font-medium
                      ${themePrimarySoft}
                      ${themePrimaryText}
                      border
                      ${themePrimarySoftBorder}
                    `}
                  >
                    {log.action}
                  </span>
                </td>

                <td className="px-4 py-2.5 theme-text-secondary hidden sm:table-cell">
                  {log.detail}
                </td>

                <td className="px-4 py-2.5 theme-text-muted text-xs hidden md:table-cell">
                  {log.device}
                </td>

                <td className="px-4 py-2.5 theme-text-secondary text-xs whitespace-nowrap">
                  {timeAgo(log.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// SESSIONS TAB
// ============================================================

function SessionsTab({ sessions }) {
  const currentSession = sessions.find(
    (session) => session.current
  );

  return (
    <div className="space-y-4">

      {/* HEADER */}

      <div className="flex items-center gap-2.5">
        <div
          className={`
            p-1.5
            rounded-lg
            ${themeSuccessSurface}
            text-[var(--color-success)]
            border
            ${themeSuccessBorder}
          `}
        >
          <Smartphone size={16} />
        </div>

        <h4 className="text-sm font-semibold theme-text">
          Perangkat yang Terhubung
        </h4>
      </div>

      {/* CURRENT SESSION */}

      {currentSession && (
        <div
          className={`
            p-4
            rounded-lg
            ${themeSuccessSurface}
            border
            ${themeSuccessBorder}
          `}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />

            <span className="text-sm font-medium text-[var(--color-success)]">
              Sesi Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-sm">
            <span className="theme-text-secondary">
              Perangkat:{" "}
              <span className="font-medium theme-text">
                {currentSession.device}
              </span>
            </span>

            <span className="theme-text-secondary">
              IP:{" "}
              <span className="font-medium theme-text">
                {currentSession.ip}
              </span>
            </span>

            <span className="theme-text-secondary">
              Aktif:{" "}
              <span className="font-medium theme-text">
                {timeAgo(currentSession.lastActive)}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* SESSION TABLE */}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          <thead>
            <tr
              className={`
                ${themeNeutralSurface}
                border-b
                ${themeDivider}
              `}
            >
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold theme-text-secondary uppercase tracking-wider">
                Perangkat
              </th>

              <th className="px-4 py-2.5 text-left text-[10px] font-semibold theme-text-secondary uppercase tracking-wider hidden sm:table-cell">
                IP
              </th>

              <th className="px-4 py-2.5 text-left text-[10px] font-semibold theme-text-secondary uppercase tracking-wider">
                Terakhir Aktif
              </th>

              <th className="px-4 py-2.5 text-left text-[10px] font-semibold theme-text-secondary uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {sessions.map((session, idx) => (
              <tr
                key={idx}
                className={`
                  border-b
                  ${themeDivider}
                  hover:bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]
                  transition-colors
                `}
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Smartphone
                      size={14}
                      className="theme-text-muted"
                    />

                    <span className="theme-text">
                      {session.device}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-2.5 theme-text-secondary font-mono text-xs hidden sm:table-cell">
                  {session.ip}
                </td>

                <td className="px-4 py-2.5 theme-text-secondary text-xs">
                  {timeAgo(session.lastActive)}
                </td>

                <td className="px-4 py-2.5">
                  {session.current ? (
                    <span
                      className={`
                        px-2.5
                        py-0.5
                        rounded-full
                        text-xs
                        font-medium
                        ${themeSuccessSurface}
                        text-[var(--color-success)]
                        border
                        ${themeSuccessBorder}
                        flex
                        items-center
                        gap-1.5
                      `}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                      Aktif
                    </span>
                  ) : (
                    <span
                      className={`
                        px-2.5
                        py-0.5
                        rounded-full
                        text-xs
                        font-medium
                        ${themeNeutralSurface}
                        theme-text-secondary
                        border
                        ${themeNeutralBorder}
                      `}
                    >
                      Tidak Aktif
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* LOGOUT ALL */}

      <div
        className={`
          flex
          flex-wrap
          items-center
          gap-3
          pt-2
          border-t
          ${themeDivider}
        `}
      >
        <button
          className={`
            px-4
            py-2
            text-sm
            font-medium
            text-[var(--color-warning)]
            hover:${themeWarningSurface}
            rounded-lg
            transition-colors
            border
            ${themeWarningBorder}
          `}
        >
          <LogOut
            size={16}
            className="inline mr-2"
          />
          Logout Semua Perangkat
        </button>

        <p className="text-xs theme-text-muted">
          Akan mengeluarkan semua perangkat kecuali yang sedang aktif
        </p>
      </div>
    </div>
  );
}