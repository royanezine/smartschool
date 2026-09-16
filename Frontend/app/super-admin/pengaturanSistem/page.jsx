"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  Settings,
  Globe,
  Shield,
  Bell,
  Mail,
  Key,
  UserCog,
  Database,
  Clock,
  RefreshCw,
  Save,
  X,
  Check,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Cloud,
  Share2,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Plus,
  Search,
  FileText,
  Building2,
  School,
  Calendar,
  DollarSign,
  CreditCard,
  Zap,
  Sparkles,
  Crown,
} from "lucide-react";

export default function PengaturanSistemPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu] = useState("pengaturan");
  const [activeTab, setActiveTab] = useState("umum");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ===== STATE UNTUK SETIAP SECTION =====
  const [general, setGeneral] = useState({
    namaSistem: "SmartSchool",
    subdomain: "smartschool",
    timezone: "Asia/Jakarta",
    tanggalFormat: "dd-mm-yyyy",
    bahasa: "id",
    logo: null,
    favicon: null,
    maintenanceMode: false,
    maintenanceMessage: "Kami sedang melakukan pemeliharaan. Kembali lagi nanti.",
  });

  const [security, setSecurity] = useState({
    authMethod: "email_password",
    minPasswordLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    blockDuration: 30,
    twoFactorAuth: false,
    twoFactorMethod: "email",
  });

  const [integrations, setIntegrations] = useState({
    xendit: {
      enabled: true,
      apiKey: "xnd_production_...",
      publicKey: "xnd_public_...",
      webhookSecret: "whsec_...",
      environment: "production",
    },
    email: {
      provider: "smtp",
      host: "smtp.gmail.com",
      port: 587,
      username: "noreply@smartschool.com",
      password: "********",
      encryption: "tls",
    },
    cloud: {
      provider: "aws",
      bucket: "smartschool-assets",
      region: "ap-southeast-1",
      accessKey: "AKIA...",
      secretKey: "********",
    },
  });

  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    pushEnabled: false,
    smsEnabled: false,
    notifyOnMaintenance: true,
    notifyOnSubscription: true,
    notifyOnPayment: true,
    notifyOnUserRegistration: true,
    notifyOnBackup: false,
    emailFrom: "noreply@smartschool.com",
    emailReplyTo: "support@smartschool.com",
  });

  const [activityLogs] = useState([
    { id: 1, user: "Super Admin", action: "Mengubah pengaturan umum", timestamp: "2026-08-11 14:30:22", ip: "192.168.1.1" },
    { id: 2, user: "Super Admin", action: "Mengaktifkan maintenance mode", timestamp: "2026-08-10 09:15:45", ip: "192.168.1.1" },
    { id: 3, user: "Admin Sekolah", action: "Mengubah pengaturan sekolah", timestamp: "2026-08-09 16:20:10", ip: "192.168.1.5" },
  ]);

  const [filterLog, setFilterLog] = useState("");

  const notificationsData = [
    { id: 1, title: "Pembaruan Sistem v2.0", desc: "Dikirim 2 jam lalu", read: false },
    { id: 2, title: "Pengingat: Backup Data", desc: "Dikirim 1 hari lalu", read: false },
  ];

  // ===== HANDLER =====
  const handleGeneralChange = (field, value) => {
    setGeneral((prev) => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field, value) => {
    setSecurity((prev) => ({ ...prev, [field]: value }));
  };

  const handleIntegrationChange = (service, field, value) => {
    setIntegrations((prev) => ({
      ...prev,
      [service]: { ...prev[service], [field]: value },
    }));
  };

  const handleNotificationChange = (field, value) => {
    setNotifications((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      console.log("Pengaturan disimpan:", { general, security, integrations, notifications });
    }, 1000);
  };

  const filteredLogs = activityLogs.filter((log) =>
    log.user.toLowerCase().includes(filterLog.toLowerCase()) ||
    log.action.toLowerCase().includes(filterLog.toLowerCase()) ||
    log.ip.includes(filterLog)
  );

  const tabs = [
    { id: "umum", label: "Umum", icon: Settings },
    { id: "keamanan", label: "Keamanan", icon: Shield },
    { id: "integrasi", label: "Integrasi", icon: Share2 },
    { id: "notifikasi", label: "Notifikasi", icon: Bell },
    { id: "aktivitas", label: "Aktivitas", icon: Clock },
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
        notifications={notificationsData}
        user={{
          name: "Super Admin",
          email: "admin@smartschool.com",
          avatar: "SA",
        }}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="w-full space-y-5 sm:space-y-6">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Settings size={20} className="text-blue-600" />

                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                  Pengaturan Sistem
                </h1>
              </div>

              <p className="text-sm text-slate-500 mt-1">
                Kelola konfigurasi dan pengaturan utama SmartSchool
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>

          {/* SUCCESS MESSAGE */}
          {saveSuccess && (
            <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <Check size={18} className="text-emerald-600" />

              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  Pengaturan berhasil disimpan
                </p>

                <p className="text-xs text-emerald-600 mt-0.5">
                  Perubahan konfigurasi sistem telah berhasil disimpan.
                </p>
              </div>
            </div>
          )}

          {/* TABS */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm">
            <div className="border-b border-slate-200/80 overflow-x-auto">
              <div className="flex min-w-max">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 sm:px-5 py-3.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                        isActive
                          ? "text-blue-600 border-blue-600"
                          : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-4 sm:p-6">

              {activeTab === "umum" && (
                <GeneralTab
                  general={general}
                  handleChange={handleGeneralChange}
                />
              )}

              {activeTab === "keamanan" && (
                <SecurityTab
                  security={security}
                  handleChange={handleSecurityChange}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              )}

              {activeTab === "integrasi" && (
                <IntegrationTab
                  integrations={integrations}
                  handleChange={handleIntegrationChange}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              )}

              {activeTab === "notifikasi" && (
                <NotificationTab
                  notifications={notifications}
                  handleChange={handleNotificationChange}
                />
              )}

              {activeTab === "aktivitas" && (
                <ActivityTab
                  logs={filteredLogs}
                  filter={filterLog}
                  setFilter={setFilterLog}
                />
              )}

            </div>
          </div>

          {/* FOOTER */}
          <div className="text-center text-xs text-slate-400/80 py-2 border-t border-slate-200/40">
            © 2026 SmartSchool • Pengaturan terakhir diperbarui hari ini
          </div>

        </div>
      </main>
    </div>
  </div>
);
}

// ============================================================
// TAB KOMPONEN dengan teks lebih jelas
// ============================================================

function GeneralTab({ general, handleChange }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Sistem</label>
          <input
            type="text"
            value={general.namaSistem}
            onChange={(e) => handleChange("namaSistem", e.target.value)}
            className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-slate-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Subdomain Utama</label>
          <input
            type="text"
            value={general.subdomain}
            onChange={(e) => handleChange("subdomain", e.target.value)}
            className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-slate-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Zona Waktu</label>
          <select
            value={general.timezone}
            onChange={(e) => handleChange("timezone", e.target.value)}
            className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          >
            <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
            <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
            <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
            <option value="Asia/Singapore">Asia/Singapore</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Format Tanggal</label>
          <select
            value={general.tanggalFormat}
            onChange={(e) => handleChange("tanggalFormat", e.target.value)}
            className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          >
            <option value="dd-mm-yyyy">DD-MM-YYYY</option>
            <option value="mm-dd-yyyy">MM-DD-YYYY</option>
            <option value="yyyy-mm-dd">YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Bahasa</label>
          <select
            value={general.bahasa}
            onChange={(e) => handleChange("bahasa", e.target.value)}
            className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          >
            <option value="id">Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Logo</label>
          <input
            type="file"
            className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg file:mr-3 file:py-1.5 file:px-3 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 file:border-0 file:rounded-lg hover:file:bg-blue-100 transition cursor-pointer"
            accept="image/*"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Favicon</label>
          <input
            type="file"
            className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg file:mr-3 file:py-1.5 file:px-3 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 file:border-0 file:rounded-lg hover:file:bg-blue-100 transition cursor-pointer"
            accept="image/x-icon,image/png"
          />
        </div>
      </div>
      <div className="border-t border-slate-200/60 pt-4">
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={general.maintenanceMode}
              onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-sm font-medium text-slate-700">Mode Pemeliharaan</span>
        </div>
        {general.maintenanceMode && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Pesan Pemeliharaan</label>
            <textarea
              value={general.maintenanceMessage}
              onChange={(e) => handleChange("maintenanceMessage", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none placeholder:text-slate-400"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SecurityTab({ security, handleChange, showPassword, setShowPassword }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Metode Autentikasi</label>
          <select
            value={security.authMethod}
            onChange={(e) => handleChange("authMethod", e.target.value)}
            className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          >
            <option value="email_password">Email + Password</option>
            <option value="email_otp">Email + OTP</option>
            <option value="sso">SSO (SAML/OAuth)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Panjang Password Minimum</label>
          <input
            type="number"
            value={security.minPasswordLength}
            onChange={(e) => handleChange("minPasswordLength", parseInt(e.target.value))}
            className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={security.requireUppercase}
            onChange={(e) => handleChange("requireUppercase", e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Huruf Besar
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={security.requireLowercase}
            onChange={(e) => handleChange("requireLowercase", e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Huruf Kecil
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={security.requireNumbers}
            onChange={(e) => handleChange("requireNumbers", e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Angka
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={security.requireSymbols}
            onChange={(e) => handleChange("requireSymbols", e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Simbol
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Session Timeout (menit)</label>
          <input
            type="number"
            value={security.sessionTimeout}
            onChange={(e) => handleChange("sessionTimeout", parseInt(e.target.value))}
            className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Login Attempts</label>
          <input
            type="number"
            value={security.maxLoginAttempts}
            onChange={(e) => handleChange("maxLoginAttempts", parseInt(e.target.value))}
            className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Durasi Blokir (menit)</label>
          <input
            type="number"
            value={security.blockDuration}
            onChange={(e) => handleChange("blockDuration", parseInt(e.target.value))}
            className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
      </div>
      <div className="border-t border-slate-200/60 pt-4 space-y-3">
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={security.twoFactorAuth}
              onChange={(e) => handleChange("twoFactorAuth", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-sm font-medium text-slate-700">Two-Factor Authentication (2FA)</span>
        </div>
        {security.twoFactorAuth && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Metode 2FA</label>
            <select
              value={security.twoFactorMethod}
              onChange={(e) => handleChange("twoFactorMethod", e.target.value)}
              className="w-full max-w-xs px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="authenticator">Authenticator App</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

function IntegrationTab({ integrations, handleChange, showPassword, setShowPassword }) {
  return (
    <div className="space-y-8">
      {/* Xendit */}
      <div>
        <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
          <DollarSign size={16} className="text-blue-600" />
          Xendit (Pembayaran)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={integrations.xendit.enabled}
                onChange={(e) => handleChange("xendit", "enabled", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm font-medium text-slate-700">Aktif</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Environment</label>
            <select
              value={integrations.xendit.environment}
              onChange={(e) => handleChange("xendit", "environment", e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            >
              <option value="production">Production</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">API Key</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={integrations.xendit.apiKey}
                onChange={(e) => handleChange("xendit", "apiKey", e.target.value)}
                className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 pr-10"
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Webhook Secret</label>
            <input
              type="password"
              value={integrations.xendit.webhookSecret}
              onChange={(e) => handleChange("xendit", "webhookSecret", e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="border-t border-slate-200/60 pt-4">
        <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
          <Mail size={16} className="text-blue-600" />
          Email (SMTP)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Provider</label>
            <select
              value={integrations.email.provider}
              onChange={(e) => handleChange("email", "provider", e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            >
              <option value="smtp">SMTP</option>
              <option value="sendgrid">SendGrid</option>
              <option value="mailgun">Mailgun</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Host</label>
            <input
              type="text"
              value={integrations.email.host}
              onChange={(e) => handleChange("email", "host", e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Port</label>
            <input
              type="number"
              value={integrations.email.port}
              onChange={(e) => handleChange("email", "port", parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Encryption</label>
            <select
              value={integrations.email.encryption}
              onChange={(e) => handleChange("email", "encryption", e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            >
              <option value="tls">TLS</option>
              <option value="ssl">SSL</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
            <input
              type="text"
              value={integrations.email.username}
              onChange={(e) => handleChange("email", "username", e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type="password"
                value={integrations.email.password}
                onChange={(e) => handleChange("email", "password", e.target.value)}
                className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 pr-10"
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
        </div>
      </div>
    </div>
  );
}

function NotificationTab({ notifications, handleChange }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.emailEnabled}
              onChange={(e) => handleChange("emailEnabled", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-sm font-medium text-slate-700">Email</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.pushEnabled}
              onChange={(e) => handleChange("pushEnabled", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-sm font-medium text-slate-700">Push Notifikasi</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.smsEnabled}
              onChange={(e) => handleChange("smsEnabled", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-sm font-medium text-slate-700">SMS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.notifyOnMaintenance}
              onChange={(e) => handleChange("notifyOnMaintenance", e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Maintenance Mode
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.notifyOnSubscription}
              onChange={(e) => handleChange("notifyOnSubscription", e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Perubahan Langganan
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.notifyOnPayment}
              onChange={(e) => handleChange("notifyOnPayment", e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Pembayaran
          </label>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.notifyOnUserRegistration}
              onChange={(e) => handleChange("notifyOnUserRegistration", e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Registrasi Pengguna
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.notifyOnBackup}
              onChange={(e) => handleChange("notifyOnBackup", e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Backup Database
          </label>
        </div>
      </div>

      <div className="border-t border-slate-200/60 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Pengirim (From)</label>
          <input
            type="email"
            value={notifications.emailFrom}
            onChange={(e) => handleChange("emailFrom", e.target.value)}
            className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Balasan (Reply-To)</label>
          <input
            type="email"
            value={notifications.emailReplyTo}
            onChange={(e) => handleChange("emailReplyTo", e.target.value)}
            className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
      </div>
    </div>
  );
}

function ActivityTab({ logs, filter, setFilter }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari aktivitas..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-slate-400"
          />
        </div>
        <span className="text-sm text-slate-500">{logs.length} aktivitas ditemukan</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Pengguna</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Aktivitas</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Waktu</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">Tidak ada aktivitas ditemukan</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{log.user}</td>
                  <td className="px-4 py-2.5 text-slate-700">{log.action}</td>
                  <td className="px-4 py-2.5 text-slate-500 hidden sm:table-cell">{log.timestamp}</td>
                  <td className="px-4 py-2.5 text-slate-400 font-mono text-xs hidden md:table-cell">{log.ip}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}