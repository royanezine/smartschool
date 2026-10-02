"use client";

import { useState } from "react";
import {
  Settings,
  Shield,
  Bell,
  Mail,
  DollarSign,
  Clock,
  RefreshCw,
  Save,
  Check,
  Eye,
  EyeOff,
  Share2,
  Search,
} from "lucide-react";

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
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeInput =
  "theme-input theme-text";

const themeLabel =
  "block text-sm font-medium theme-text mb-1.5";

const themeMuted =
  "theme-text-secondary";

const themePlaceholder =
  "placeholder:text-[var(--color-text-placeholder)]";

const themeCard =
  "theme-card theme-border";

const themeCheckbox =
  "accent-[var(--color-primary)] focus:ring-[var(--color-primary)]";


// ============================================================
// MAIN PAGE
// ============================================================

export default function PengaturanSistemPage() {
  const [activeTab, setActiveTab] = useState("umum");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ============================================================
  // GENERAL
  // ============================================================

  const [general, setGeneral] = useState({
    namaSistem: "SmartSchool",
    subdomain: "smartschool",
    timezone: "Asia/Jakarta",
    tanggalFormat: "dd-mm-yyyy",
    bahasa: "id",
    logo: null,
    favicon: null,
    maintenanceMode: false,
    maintenanceMessage:
      "Kami sedang melakukan pemeliharaan. Kembali lagi nanti.",
  });

  // ============================================================
  // SECURITY
  // ============================================================

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

  // ============================================================
  // INTEGRATIONS
  // ============================================================

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

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

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

  // ============================================================
  // ACTIVITY LOG
  // ============================================================

  const [activityLogs] = useState([
    {
      id: 1,
      user: "Super Admin",
      action: "Mengubah pengaturan umum",
      timestamp: "2026-08-11 14:30:22",
      ip: "192.168.1.1",
    },
    {
      id: 2,
      user: "Super Admin",
      action: "Mengaktifkan maintenance mode",
      timestamp: "2026-08-10 09:15:45",
      ip: "192.168.1.1",
    },
    {
      id: 3,
      user: "Admin Sekolah",
      action: "Mengubah pengaturan sekolah",
      timestamp: "2026-08-09 16:20:10",
      ip: "192.168.1.5",
    },
  ]);

  const [filterLog, setFilterLog] = useState("");

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleGeneralChange = (field, value) => {
    setGeneral((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSecurityChange = (field, value) => {
    setSecurity((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleIntegrationChange = (service, field, value) => {
    setIntegrations((prev) => ({
      ...prev,
      [service]: {
        ...prev[service],
        [field]: value,
      },
    }));
  };

  const handleNotificationChange = (field, value) => {
    setNotifications((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setSaveSuccess(false);

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

      console.log("Pengaturan disimpan:", {
        general,
        security,
        integrations,
        notifications,
      });
    }, 1000);
  };

  const filteredLogs = activityLogs.filter(
    (log) =>
      log.user.toLowerCase().includes(filterLog.toLowerCase()) ||
      log.action.toLowerCase().includes(filterLog.toLowerCase()) ||
      log.ip.includes(filterLog)
  );

  const tabs = [
    {
      id: "umum",
      label: "Umum",
      icon: Settings,
    },
    {
      id: "keamanan",
      label: "Keamanan",
      icon: Shield,
    },
    {
      id: "integrasi",
      label: "Integrasi",
      icon: Share2,
    },
    {
      id: "notifikasi",
      label: "Notifikasi",
      icon: Bell,
    },
    {
      id: "aktivitas",
      label: "Aktivitas",
      icon: Clock,
    },
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1500px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-5 sm:space-y-6">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-xl ${themePrimarySoft} ${themePrimarySoftBorder} border flex items-center justify-center`}
              >
                <Settings
                  size={19}
                  className={themePrimaryText}
                />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold theme-text">
                Pengaturan Sistem
              </h1>
            </div>

            <p className="text-sm theme-text-secondary mt-1">
              Kelola konfigurasi dan pengaturan utama SmartSchool
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] text-sm font-medium transition ${themePrimaryShadow} hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed`}
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
                Simpan Perubahan
              </>
            )}
          </button>
        </div>

        {/* ======================================================
            SUCCESS MESSAGE
        ====================================================== */}

        {saveSuccess && (
          <div
            className={`flex items-center gap-3 p-3.5 rounded-xl ${themeSuccessSurface} ${themeSuccessBorder} border`}
          >
            <div
              className={`w-8 h-8 rounded-lg ${themeSuccessSurface} flex items-center justify-center shrink-0`}
            >
              <Check
                size={18}
                className="text-[var(--color-success)]"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-[var(--color-success)]">
                Pengaturan berhasil disimpan
              </p>

              <p className="text-xs theme-text-secondary mt-0.5">
                Perubahan konfigurasi sistem telah berhasil disimpan.
              </p>
            </div>
          </div>
        )}

        {/* ======================================================
            TABS + CONTENT
        ====================================================== */}

        <div
          className={`${themeCard} rounded-xl ${themeCardShadow} overflow-hidden`}
        >
          {/* TABS */}

          <div className={`border-b ${themeDivider} overflow-x-auto`}>
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
                        ? `${themePrimaryText} border-[var(--color-primary)] ${themePrimarySoft}`
                        : `theme-text-secondary border-transparent ${themeNeutralHover}`
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

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div
          className={`text-center text-xs theme-text-muted py-3 border-t ${themeDivider}`}
        >
          © 2026 SmartSchool • Pengaturan terakhir diperbarui hari ini
        </div>
      </div>
    </div>
  );
}


// ============================================================
// GENERAL TAB
// ============================================================

function GeneralTab({ general, handleChange }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Nama Sistem */}

        <div>
          <label className={themeLabel}>
            Nama Sistem
          </label>

          <input
            type="text"
            value={general.namaSistem}
            onChange={(e) =>
              handleChange("namaSistem", e.target.value)
            }
            className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus} ${themePlaceholder} transition`}
          />
        </div>

        {/* Subdomain */}

        <div>
          <label className={themeLabel}>
            Subdomain Utama
          </label>

          <input
            type="text"
            value={general.subdomain}
            onChange={(e) =>
              handleChange("subdomain", e.target.value)
            }
            className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus} ${themePlaceholder} transition`}
          />
        </div>

        {/* Timezone */}

        <div>
          <label className={themeLabel}>
            Zona Waktu
          </label>

          <select
            value={general.timezone}
            onChange={(e) =>
              handleChange("timezone", e.target.value)
            }
            className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus} transition`}
          >
            <option value="Asia/Jakarta">
              Asia/Jakarta (WIB)
            </option>
            <option value="Asia/Makassar">
              Asia/Makassar (WITA)
            </option>
            <option value="Asia/Jayapura">
              Asia/Jayapura (WIT)
            </option>
            <option value="Asia/Singapore">
              Asia/Singapore
            </option>
          </select>
        </div>

        {/* Format tanggal */}

        <div>
          <label className={themeLabel}>
            Format Tanggal
          </label>

          <select
            value={general.tanggalFormat}
            onChange={(e) =>
              handleChange("tanggalFormat", e.target.value)
            }
            className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus} transition`}
          >
            <option value="dd-mm-yyyy">
              DD-MM-YYYY
            </option>

            <option value="mm-dd-yyyy">
              MM-DD-YYYY
            </option>

            <option value="yyyy-mm-dd">
              YYYY-MM-DD
            </option>
          </select>
        </div>

        {/* Bahasa */}

        <div>
          <label className={themeLabel}>
            Bahasa
          </label>

          <select
            value={general.bahasa}
            onChange={(e) =>
              handleChange("bahasa", e.target.value)
            }
            className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus} transition`}
          >
            <option value="id">
              Indonesia
            </option>

            <option value="en">
              English
            </option>
          </select>
        </div>

        {/* Logo */}

        <div>
          <label className={themeLabel}>
            Logo
          </label>

          <input
            type="file"
            accept="image/*"
            className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus} file:mr-3 file:py-1.5 file:px-3 file:text-sm file:font-medium file:border-0 file:rounded-lg file:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] file:text-[var(--color-primary)] hover:file:bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] transition cursor-pointer`}
          />
        </div>

        {/* Favicon */}

        <div>
          <label className={themeLabel}>
            Favicon
          </label>

          <input
            type="file"
            accept="image/x-icon,image/png"
            className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus} file:mr-3 file:py-1.5 file:px-3 file:text-sm file:font-medium file:border-0 file:rounded-lg file:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] file:text-[var(--color-primary)] hover:file:bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] transition cursor-pointer`}
          />
        </div>
      </div>

      {/* Maintenance */}

      <div className={`border-t ${themeDivider} pt-4`}>
        <div className="flex items-center gap-3">

          <ThemeToggle
            checked={general.maintenanceMode}
            onChange={(value) =>
              handleChange("maintenanceMode", value)
            }
          />

          <span className="text-sm font-medium theme-text">
            Mode Pemeliharaan
          </span>
        </div>

        {general.maintenanceMode && (
          <div className="mt-3">
            <label className={themeLabel}>
              Pesan Pemeliharaan
            </label>

            <textarea
              value={general.maintenanceMessage}
              onChange={(e) =>
                handleChange(
                  "maintenanceMessage",
                  e.target.value
                )
              }
              rows={2}
              className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus} ${themePlaceholder} resize-none transition`}
            />
          </div>
        )}
      </div>
    </div>
  );
}


// ============================================================
// SECURITY TAB
// ============================================================

function SecurityTab({ security, handleChange }) {
  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label className={themeLabel}>
            Metode Autentikasi
          </label>

          <select
            value={security.authMethod}
            onChange={(e) =>
              handleChange("authMethod", e.target.value)
            }
            className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus}`}
          >
            <option value="email_password">
              Email + Password
            </option>

            <option value="email_otp">
              Email + OTP
            </option>

            <option value="sso">
              SSO (SAML/OAuth)
            </option>
          </select>
        </div>

        <div>
          <label className={themeLabel}>
            Panjang Password Minimum
          </label>

          <input
            type="number"
            value={security.minPasswordLength}
            onChange={(e) =>
              handleChange(
                "minPasswordLength",
                parseInt(e.target.value)
              )
            }
            className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus}`}
          />
        </div>
      </div>

      {/* Password Rules */}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

        <ThemeCheckbox
          checked={security.requireUppercase}
          onChange={(value) =>
            handleChange("requireUppercase", value)
          }
          label="Huruf Besar"
        />

        <ThemeCheckbox
          checked={security.requireLowercase}
          onChange={(value) =>
            handleChange("requireLowercase", value)
          }
          label="Huruf Kecil"
        />

        <ThemeCheckbox
          checked={security.requireNumbers}
          onChange={(value) =>
            handleChange("requireNumbers", value)
          }
          label="Angka"
        />

        <ThemeCheckbox
          checked={security.requireSymbols}
          onChange={(value) =>
            handleChange("requireSymbols", value)
          }
          label="Simbol"
        />
      </div>

      {/* Session */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div>
          <label className={themeLabel}>
            Session Timeout (menit)
          </label>

          <input
            type="number"
            value={security.sessionTimeout}
            onChange={(e) =>
              handleChange(
                "sessionTimeout",
                parseInt(e.target.value)
              )
            }
            className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus}`}
          />
        </div>

        <div>
          <label className={themeLabel}>
            Max Login Attempts
          </label>

          <input
            type="number"
            value={security.maxLoginAttempts}
            onChange={(e) =>
              handleChange(
                "maxLoginAttempts",
                parseInt(e.target.value)
              )
            }
            className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus}`}
          />
        </div>

        <div>
          <label className={themeLabel}>
            Durasi Blokir (menit)
          </label>

          <input
            type="number"
            value={security.blockDuration}
            onChange={(e) =>
              handleChange(
                "blockDuration",
                parseInt(e.target.value)
              )
            }
            className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus}`}
          />
        </div>
      </div>

      {/* 2FA */}

      <div className={`border-t ${themeDivider} pt-4 space-y-3`}>

        <div className="flex items-center gap-3">

          <ThemeToggle
            checked={security.twoFactorAuth}
            onChange={(value) =>
              handleChange("twoFactorAuth", value)
            }
          />

          <span className="text-sm font-medium theme-text">
            Two-Factor Authentication (2FA)
          </span>
        </div>

        {security.twoFactorAuth && (
          <div>
            <label className={themeLabel}>
              Metode 2FA
            </label>

            <select
              value={security.twoFactorMethod}
              onChange={(e) =>
                handleChange(
                  "twoFactorMethod",
                  e.target.value
                )
              }
              className={`w-full max-w-xs px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus}`}
            >
              <option value="email">
                Email
              </option>

              <option value="sms">
                SMS
              </option>

              <option value="authenticator">
                Authenticator App
              </option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}


// ============================================================
// INTEGRATION TAB
// ============================================================

function IntegrationTab({
  integrations,
  handleChange,
  showPassword,
  setShowPassword,
}) {
  return (
    <div className="space-y-8">

      {/* XENDIT */}

      <div>
        <h4 className="text-sm font-semibold theme-text flex items-center gap-2 mb-3">
          <DollarSign
            size={16}
            className={themePrimaryText}
          />

          Xendit (Pembayaran)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="flex items-center gap-3">
            <ThemeToggle
              checked={integrations.xendit.enabled}
              onChange={(value) =>
                handleChange(
                  "xendit",
                  "enabled",
                  value
                )
              }
            />

            <span className="text-sm font-medium theme-text">
              Aktif
            </span>
          </div>

          <div>
            <label className={themeLabel}>
              Environment
            </label>

            <select
              value={integrations.xendit.environment}
              onChange={(e) =>
                handleChange(
                  "xendit",
                  "environment",
                  e.target.value
                )
              }
              className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus}`}
            >
              <option value="production">
                Production
              </option>

              <option value="sandbox">
                Sandbox
              </option>
            </select>
          </div>

          <div>
            <label className={themeLabel}>
              API Key
            </label>

            <PasswordInput
              value={integrations.xendit.apiKey}
              onChange={(value) =>
                handleChange(
                  "xendit",
                  "apiKey",
                  value
                )
              }
              visible={showPassword}
              onToggle={() =>
                setShowPassword(!showPassword)
              }
            />
          </div>

          <div>
            <label className={themeLabel}>
              Webhook Secret
            </label>

            <input
              type="password"
              value={integrations.xendit.webhookSecret}
              onChange={(e) =>
                handleChange(
                  "xendit",
                  "webhookSecret",
                  e.target.value
                )
              }
              className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus}`}
            />
          </div>
        </div>
      </div>

      {/* EMAIL */}

      <div className={`border-t ${themeDivider} pt-4`}>

        <h4 className="text-sm font-semibold theme-text flex items-center gap-2 mb-3">
          <Mail
            size={16}
            className={themePrimaryText}
          />

          Email (SMTP)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className={themeLabel}>
              Provider
            </label>

            <select
              value={integrations.email.provider}
              onChange={(e) =>
                handleChange(
                  "email",
                  "provider",
                  e.target.value
                )
              }
              className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus}`}
            >
              <option value="smtp">
                SMTP
              </option>

              <option value="sendgrid">
                SendGrid
              </option>

              <option value="mailgun">
                Mailgun
              </option>
            </select>
          </div>

          <div>
            <label className={themeLabel}>
              Host
            </label>

            <input
              type="text"
              value={integrations.email.host}
              onChange={(e) =>
                handleChange(
                  "email",
                  "host",
                  e.target.value
                )
              }
              className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus}`}
            />
          </div>

          <div>
            <label className={themeLabel}>
              Port
            </label>

            <input
              type="number"
              value={integrations.email.port}
              onChange={(e) =>
                handleChange(
                  "email",
                  "port",
                  parseInt(e.target.value)
                )
              }
              className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus}`}
            />
          </div>

          <div>
            <label className={themeLabel}>
              Encryption
            </label>

            <select
              value={integrations.email.encryption}
              onChange={(e) =>
                handleChange(
                  "email",
                  "encryption",
                  e.target.value
                )
              }
              className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus}`}
            >
              <option value="tls">
                TLS
              </option>

              <option value="ssl">
                SSL
              </option>

              <option value="none">
                None
              </option>
            </select>
          </div>

          <div>
            <label className={themeLabel}>
              Username
            </label>

            <input
              type="text"
              value={integrations.email.username}
              onChange={(e) =>
                handleChange(
                  "email",
                  "username",
                  e.target.value
                )
              }
              className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus}`}
            />
          </div>

          <div>
            <label className={themeLabel}>
              Password
            </label>

            <PasswordInput
              value={integrations.email.password}
              onChange={(value) =>
                handleChange(
                  "email",
                  "password",
                  value
                )
              }
              visible={showPassword}
              onToggle={() =>
                setShowPassword(!showPassword)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}


// ============================================================
// NOTIFICATION TAB
// ============================================================

function NotificationTab({
  notifications,
  handleChange,
}) {
  return (
    <div className="space-y-6">

      {/* CHANNELS */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="flex items-center gap-3">
          <ThemeToggle
            checked={notifications.emailEnabled}
            onChange={(value) =>
              handleChange("emailEnabled", value)
            }
          />

          <span className="text-sm font-medium theme-text">
            Email
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle
            checked={notifications.pushEnabled}
            onChange={(value) =>
              handleChange("pushEnabled", value)
            }
          />

          <span className="text-sm font-medium theme-text">
            Push Notifikasi
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle
            checked={notifications.smsEnabled}
            onChange={(value) =>
              handleChange("smsEnabled", value)
            }
          />

          <span className="text-sm font-medium theme-text">
            SMS
          </span>
        </div>
      </div>

      {/* EVENT NOTIFICATIONS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        <div className="space-y-2">

          <ThemeCheckbox
            checked={notifications.notifyOnMaintenance}
            onChange={(value) =>
              handleChange(
                "notifyOnMaintenance",
                value
              )
            }
            label="Maintenance Mode"
          />

          <ThemeCheckbox
            checked={notifications.notifyOnSubscription}
            onChange={(value) =>
              handleChange(
                "notifyOnSubscription",
                value
              )
            }
            label="Perubahan Langganan"
          />

          <ThemeCheckbox
            checked={notifications.notifyOnPayment}
            onChange={(value) =>
              handleChange(
                "notifyOnPayment",
                value
              )
            }
            label="Pembayaran"
          />
        </div>

        <div className="space-y-2">

          <ThemeCheckbox
            checked={
              notifications.notifyOnUserRegistration
            }
            onChange={(value) =>
              handleChange(
                "notifyOnUserRegistration",
                value
              )
            }
            label="Registrasi Pengguna"
          />

          <ThemeCheckbox
            checked={notifications.notifyOnBackup}
            onChange={(value) =>
              handleChange(
                "notifyOnBackup",
                value
              )
            }
            label="Backup Database"
          />
        </div>
      </div>

      {/* EMAIL */}

      <div
        className={`border-t ${themeDivider} pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4`}
      >

        <div>
          <label className={themeLabel}>
            Email Pengirim (From)
          </label>

          <input
            type="email"
            value={notifications.emailFrom}
            onChange={(e) =>
              handleChange(
                "emailFrom",
                e.target.value
              )
            }
            className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus}`}
          />
        </div>

        <div>
          <label className={themeLabel}>
            Email Balasan (Reply-To)
          </label>

          <input
            type="email"
            value={notifications.emailReplyTo}
            onChange={(e) =>
              handleChange(
                "emailReplyTo",
                e.target.value
              )
            }
            className={`w-full px-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus}`}
          />
        </div>
      </div>
    </div>
  );
}


// ============================================================
// ACTIVITY TAB
// ============================================================

function ActivityTab({
  logs,
  filter,
  setFilter,
}) {
  return (
    <div className="space-y-4">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <div className="relative flex-1 max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
          />

          <input
            type="text"
            placeholder="Cari aktivitas..."
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
            className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg ${themeInput} ${themeFocus} ${themePlaceholder}`}
          />
        </div>

        <span className="text-sm theme-text-secondary">
          {logs.length} aktivitas ditemukan
        </span>
      </div>

      <div
        className={`overflow-x-auto rounded-lg border ${themeDivider}`}
      >
        <table className="w-full text-sm">

          <thead>
            <tr
              className={`${themeNeutralSurface} border-b ${themeDivider}`}
            >
              <th className="px-4 py-2.5 text-left text-xs font-semibold theme-text-secondary uppercase tracking-wider">
                Pengguna
              </th>

              <th className="px-4 py-2.5 text-left text-xs font-semibold theme-text-secondary uppercase tracking-wider">
                Aktivitas
              </th>

              <th className="px-4 py-2.5 text-left text-xs font-semibold theme-text-secondary uppercase tracking-wider hidden sm:table-cell">
                Waktu
              </th>

              <th className="px-4 py-2.5 text-left text-xs font-semibold theme-text-secondary uppercase tracking-wider hidden md:table-cell">
                IP
              </th>
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center theme-text-muted"
                >
                  Tidak ada aktivitas ditemukan
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className={`border-b last:border-b-0 ${themeDivider} ${themeNeutralHover} transition-colors`}
                >
                  <td className="px-4 py-2.5 font-medium theme-text">
                    {log.user}
                  </td>

                  <td className="px-4 py-2.5 theme-text-secondary">
                    {log.action}
                  </td>

                  <td className="px-4 py-2.5 theme-text-secondary hidden sm:table-cell">
                    {log.timestamp}
                  </td>

                  <td className="px-4 py-2.5 theme-text-muted font-mono text-xs hidden md:table-cell">
                    {log.ip}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ============================================================
// REUSABLE THEME TOGGLE
// ============================================================

function ThemeToggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(e.target.checked)
        }
        className="sr-only peer"
      />

      <div
        className="
          relative
          w-11
          h-6
          rounded-full
          transition-colors
          bg-[color-mix(in_srgb,var(--color-text)_14%,transparent)]
          peer-focus:outline-none
          peer-focus:ring-2
          peer-focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]
          peer-checked:bg-[var(--color-primary)]
          after:content-['']
          after:absolute
          after:top-[2px]
          after:left-[2px]
          after:h-5
          after:w-5
          after:rounded-full
          after:bg-[var(--color-card)]
          after:border
          after:border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
          after:transition-all
          peer-checked:after:translate-x-full
        "
      />
    </label>
  );
}


// ============================================================
// REUSABLE THEME CHECKBOX
// ============================================================

function ThemeCheckbox({
  checked,
  onChange,
  label,
}) {
  return (
    <label className="flex items-center gap-2 text-sm theme-text-secondary cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(e.target.checked)
        }
        className={`w-4 h-4 rounded ${themeCheckbox}`}
      />

      {label}
    </label>
  );
}


// ============================================================
// PASSWORD INPUT
// ============================================================

function PasswordInput({
  value,
  onChange,
  visible,
  onToggle,
}) {
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={`w-full px-3 py-2 pr-10 text-sm rounded-lg ${themeInput} ${themeFocus}`}
      />

      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted hover:text-[var(--color-primary)] transition"
      >
        {visible ? (
          <EyeOff size={16} />
        ) : (
          <Eye size={16} />
        )}
      </button>
    </div>
  );
}