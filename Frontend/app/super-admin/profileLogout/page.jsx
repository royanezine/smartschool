"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  User,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Key,
  Bell,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  LogOut,
  Sparkles,
  Crown,
  Building2,
  School,
  Users,
  Clock,
  Activity,
  Settings,
  Smartphone,
  Globe,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
  RefreshCw,
} from "lucide-react";

// ===== DUMMY DATA =====
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
  { id: 1, action: "Login", detail: "Login dari IP 192.168.1.1", timestamp: "2026-08-11T14:30:00Z", device: "Chrome - Windows" },
  { id: 2, action: "Pengaturan", detail: "Mengubah pengaturan umum sistem", timestamp: "2026-08-11T10:15:00Z", device: "Chrome - Windows" },
  { id: 3, action: "Manajemen User", detail: "Menambahkan user baru: Guru SMA 1", timestamp: "2026-08-10T16:45:00Z", device: "Chrome - Mac" },
  { id: 4, action: "Login", detail: "Login dari IP 192.168.1.1", timestamp: "2026-08-10T08:00:00Z", device: "Chrome - Windows" },
  { id: 5, action: "Yayasan", detail: "Memverifikasi yayasan: YPI Harapan", timestamp: "2026-08-09T13:20:00Z", device: "Firefox - Windows" },
  { id: 6, action: "Langganan", detail: "Memperpanjang langganan SMA Bina Bangsa", timestamp: "2026-08-08T11:00:00Z", device: "Chrome - Windows" },
];

const deviceSessions = [
  { device: "Chrome - Windows", ip: "192.168.1.1", lastActive: "2026-08-11T14:30:00Z", current: true },
  { device: "Firefox - Windows", ip: "192.168.1.5", lastActive: "2026-08-09T13:20:00Z", current: false },
  { device: "Chrome - Mac", ip: "192.168.1.10", lastActive: "2026-08-10T16:45:00Z", current: false },
  { device: "Safari - iPhone", ip: "192.168.1.20", lastActive: "2026-08-07T09:00:00Z", current: false },
];

// ===== UTILITY =====
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

// ===== MAIN COMPONENT =====

export default function ProfilePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu] = useState("profil");
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const notifications = [
    { id: 1, title: "Pembaruan Sistem v2.0", desc: "Dikirim 2 jam lalu", read: false },
    { id: 2, title: "Pengingat: Backup Data", desc: "Dikirim 1 hari lalu", read: false },
  ];

  // Form states
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
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
      console.log("Profile updated:", profile);
    }, 1000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordData.passwordBaru !== passwordData.konfirmasiPassword) {
      alert("Password baru dan konfirmasi password tidak cocok!");
      return;
    }
    console.log("Password changed:", passwordData);
    setPasswordData({ passwordLama: "", passwordBaru: "", konfirmasiPassword: "" });
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "security", label: "Keamanan", icon: Lock },
    { id: "activity", label: "Aktivitas", icon: Activity },
    { id: "sessions", label: "Sesi Aktif", icon: Smartphone },
  ];

  const stats = [
    { label: "Total Login", value: "247", icon: LogOut, color: "bg-blue-50 text-blue-600" },
    { label: "Hari Aktif", value: "189", icon: Calendar, color: "bg-emerald-50 text-emerald-600" },
    { label: "Aksi Dilakukan", value: "1,432", icon: Activity, color: "bg-purple-50 text-purple-600" },
    { label: "Peran", value: "Super Admin", icon: Crown, color: "bg-amber-50 text-amber-600" },
  ];
return (
  <div className="flex min-h-screen bg-slate-50">
    <Sidebar
      active={activeMenu}
      setActive={() => {}}
      collapsed={!sidebarOpen}
      setCollapsed={() => setSidebarOpen(!sidebarOpen)}
    />

    <div className="flex-1 flex flex-col min-w-0">
      <Header
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        notifications={notifications}
        user={{
          name: "Super Admin",
          email: "admin@smartschool.com",
          avatar: "SA",
        }}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50">
        <div className="w-full space-y-6">

            {/* HEADER */}
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  {/* Bagian kiri */}
  <div className="flex items-center gap-3">
    {/* Icon */}
    <div className="shrink-0 p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
      <UserCircle size={19} />
    </div>

    {/* Judul + Deskripsi */}
    <div>
      <div className="flex items-center gap-2.5 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
          Profil Saya
        </h1>

        <span className="text-xs font-medium text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200/60">
          Super Admin
        </span>
      </div>

      <p className="text-sm text-slate-500 mt-1">
        Kelola profil dan pengaturan akun Anda.
      </p>
    </div>
  </div>

  {/* Tombol kanan */}
  <div className="flex items-center gap-2.5 sm:ml-auto">
    {!isEditing && activeTab === "profile" && (
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
      >
        <Edit size={16} />
        Edit Profil
      </button>
    )}

    {isEditing && (
      <>
        <button
          onClick={() => setIsEditing(false)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <X size={16} />
          Batal
        </button>

        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed"
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

    {saveSuccess && (
      <span className="flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in slide-in-from-right-2">
        <CheckCircle size={16} />
        Tersimpan!
      </span>
    )}
  </div>
</div>

            {/* STATS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white rounded-lg border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stat.color} flex-shrink-0`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate">{stat.label}</p>
                        <p className="text-lg font-semibold text-slate-800">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PROFILE HEADER CARD */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
                    {userData.avatar ? (
                      <Image src={userData.avatar} alt="Avatar" width={96} height={96} className="rounded-full object-cover" />
                    ) : (
                      userData.namaLengkap.charAt(0)
                    )}
                  </div>
                  <button className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors border-2 border-white">
                    <Camera size={14} />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">{userData.namaLengkap}</h2>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Mail size={14} className="text-slate-400" />
                          {userData.email}
                        </span>
                        <span className="hidden sm:inline text-slate-300">|</span>
                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Phone size={14} className="text-slate-400" />
                          {userData.noTelepon}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Aktif
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1.5">
                        <Crown size={12} />
                        Super Admin
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{userData.bio}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400" />
                      Bergabung: {formatTanggal(userData.bergabung)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-400" />
                      Terakhir Login: {formatTanggal(userData.terakhirLogin)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div className="border-b border-slate-200/80 overflow-x-auto bg-white rounded-t-xl border-x border-t border-slate-200/80">
              <nav className="flex gap-0.5 min-w-max px-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200
                        ${isActive
                          ? 'border-blue-600 text-blue-600 bg-blue-50/30 -mb-[1px]'
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }
                      `}
                    >
                      <Icon size={16} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* CONTENT */}
            <div className="bg-white rounded-b-xl border-x border-b border-slate-200/80 shadow-sm p-4 sm:p-6">
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

            {/* FOOTER */}
            <div className="text-center text-xs text-slate-400/80 py-2 border-t border-slate-200/40">
              © 2026 SmartSchool • Profil terakhir diperbarui hari ini
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ===== TAB KOMPONEN =====

function ProfileTab({ profile, isEditing, handleChange }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Nama Lengkap <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={profile.namaLengkap}
            onChange={(e) => handleChange("namaLengkap", e.target.value)}
            disabled={!isEditing}
            className={`w-full px-3 py-2 text-sm rounded-lg border transition ${
              isEditing
                ? "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                : "bg-white border-slate-200/60 text-slate-700 cursor-default"
            }`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={!isEditing}
            className={`w-full px-3 py-2 text-sm rounded-lg border transition ${
              isEditing
                ? "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                : "bg-white border-slate-200/60 text-slate-700 cursor-default"
            }`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            No Telepon
          </label>
          <input
            type="text"
            value={profile.noTelepon}
            onChange={(e) => handleChange("noTelepon", e.target.value)}
            disabled={!isEditing}
            className={`w-full px-3 py-2 text-sm rounded-lg border transition ${
              isEditing
                ? "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                : "bg-white border-slate-200/60 text-slate-700 cursor-default"
            }`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Website
          </label>
          <input
            type="text"
            value={profile.website}
            onChange={(e) => handleChange("website", e.target.value)}
            disabled={!isEditing}
            className={`w-full px-3 py-2 text-sm rounded-lg border transition ${
              isEditing
                ? "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                : "bg-white border-slate-200/60 text-slate-700 cursor-default"
            }`}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Bio
          </label>
          <textarea
            value={profile.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            disabled={!isEditing}
            rows={2}
            className={`w-full px-3 py-2 text-sm rounded-lg border transition resize-none ${
              isEditing
                ? "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                : "bg-white border-slate-200/60 text-slate-700 cursor-default"
            }`}
          />
        </div>
      </div>

      <div className="border-t border-slate-200/60 pt-4">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-slate-400" />
          Alamat
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Alamat</label>
            <input
              type="text"
              value={profile.alamat}
              onChange={(e) => handleChange("alamat", e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition ${
                isEditing
                  ? "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  : "bg-white border-slate-200/60 text-slate-700 cursor-default"
              }`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Kota</label>
            <input
              type="text"
              value={profile.kota}
              onChange={(e) => handleChange("kota", e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition ${
                isEditing
                  ? "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  : "bg-white border-slate-200/60 text-slate-700 cursor-default"
              }`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Provinsi</label>
            <input
              type="text"
              value={profile.provinsi}
              onChange={(e) => handleChange("provinsi", e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition ${
                isEditing
                  ? "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  : "bg-white border-slate-200/60 text-slate-700 cursor-default"
              }`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Kode Pos</label>
            <input
              type="text"
              value={profile.kodePos}
              onChange={(e) => handleChange("kodePos", e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition ${
                isEditing
                  ? "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  : "bg-white border-slate-200/60 text-slate-700 cursor-default"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

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
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
          <Lock size={16} />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">Ubah Password</h4>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Password Lama</label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                value={passwordData.passwordLama}
                onChange={(e) => handleChange("passwordLama", e.target.value)}
                placeholder="Masukkan password lama"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Password Baru</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordData.passwordBaru}
                onChange={(e) => handleChange("passwordBaru", e.target.value)}
                placeholder="Masukkan password baru (min 8 karakter)"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Konfirmasi Password Baru</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.konfirmasiPassword}
                onChange={(e) => handleChange("konfirmasiPassword", e.target.value)}
                placeholder="Konfirmasi password baru"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
          <Info size={14} className="text-slate-400 flex-shrink-0" />
          <span>Password harus memiliki minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol.</span>
        </div>

        <button
          type="submit"
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
        >
          <Key size={16} className="inline mr-2" />
          Update Password
        </button>
      </form>

      <div className="border-t border-slate-200/60 pt-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Shield size={16} />
          </div>
          <h4 className="text-sm font-semibold text-slate-700">Keamanan Akun</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/60">
            <div>
              <p className="text-sm font-medium text-slate-700">Two-Factor Authentication</p>
              <p className="text-xs text-slate-400">Keamanan tambahan dengan 2FA</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/60">
            <div>
              <p className="text-sm font-medium text-slate-700">Notifikasi Keamanan</p>
              <p className="text-xs text-slate-400">Email untuk aktivitas mencurigakan</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-blue-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityTab({ logs }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
            <Activity size={16} />
          </div>
          <h4 className="text-sm font-semibold text-slate-700">Riwayat Aktivitas</h4>
        </div>
        <span className="text-xs text-slate-400">{logs.length} aktivitas</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80">
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Detail</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Perangkat</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-600 hidden sm:table-cell">{log.detail}</td>
                <td className="px-4 py-2.5 text-slate-400 text-xs hidden md:table-cell">{log.device}</td>
                <td className="px-4 py-2.5 text-slate-500 text-xs whitespace-nowrap">{timeAgo(log.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SessionsTab({ sessions }) {
  const currentSession = sessions.find((s) => s.current);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-green-50 text-green-600">
          <Smartphone size={16} />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">Perangkat yang Terhubung</h4>
      </div>

      {currentSession && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-emerald-700">Sesi Aktif</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-sm">
            <span className="text-slate-600">Perangkat: <span className="font-medium text-slate-700">{currentSession.device}</span></span>
            <span className="text-slate-600">IP: <span className="font-medium text-slate-700">{currentSession.ip}</span></span>
            <span className="text-slate-600">Aktif: <span className="font-medium text-slate-700">{timeAgo(currentSession.lastActive)}</span></span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80">
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Perangkat</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">IP</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Terakhir Aktif</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.map((session, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Smartphone size={14} className="text-slate-400" />
                    <span className="text-slate-700">{session.device}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-slate-500 font-mono text-xs hidden sm:table-cell">{session.ip}</td>
                <td className="px-4 py-2.5 text-slate-500 text-xs">{timeAgo(session.lastActive)}</td>
                <td className="px-4 py-2.5">
                  {session.current ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Aktif
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200">
                      Tidak Aktif
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200/60">
        <button className="px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 hover:border-rose-300">
          <LogOut size={16} className="inline mr-2" />
          Logout Semua Perangkat
        </button>
        <p className="text-xs text-slate-400">Akan mengeluarkan semua perangkat kecuali yang sedang aktif</p>
      </div>
    </div>
  );
}