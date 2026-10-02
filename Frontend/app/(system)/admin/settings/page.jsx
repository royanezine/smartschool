"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  Settings,
  Save,
  Globe,
  Bell,
  Users,
  School,
  Calendar,
  FileText,
  CheckCircle,
  ChevronRight,
  Building2,
  Mail,
  Phone,
  MapPin,
  UserCheck,
  Smartphone,
  Lock,
  Info,
  UserCog,
  Key,
  Award,
  Star,
  BookOpen,
} from "lucide-react";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimarySurface =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySurfaceHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

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
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_24%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]";

// ============================================================
// PAGE
// ============================================================

export default function AdminPengaturanPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    // Informasi Sekolah
    namaSekolah: "SMK Taruna Bhakti",
    npsn: "20229123",
    alamat: "Jl. Pendidikan No. 45, Jakarta Selatan",
    telepon: "021-7890123",
    email: "info@smktaruna.sch.id",

    // Tahun Ajaran
    tahunAjaran: "2026/2027",
    semester: "Ganjil",
    tanggalMulai: "2026-07-15",
    tanggalSelesai: "2026-12-20",

    // Notifikasi
    notifikasiEmail: true,
    notifikasiSMS: false,
    notifikasiPush: true,

    // Role Level Sekolah
    roles: [
      {
        id: 1,
        name: "Kepala Sekolah",
        level: 1,
        deskripsi:
          "Akses penuh ke semua modul sekolah, termasuk pengelolaan guru, siswa, dan laporan.",
        permissions: [
          "Lihat Semua",
          "Kelola Guru",
          "Kelola Siswa",
          "Kelola Keuangan",
          "Lihat Laporan",
        ],
        status: "aktif",
        icon: Star,
      },
      {
        id: 2,
        name: "Wakil Kepala Sekolah",
        level: 2,
        deskripsi:
          "Mengelola akademik, kurikulum, dan kegiatan sekolah.",
        permissions: [
          "Kelola Akademik",
          "Kelola Kurikulum",
          "Kelola Kegiatan",
          "Lihat Laporan",
        ],
        status: "aktif",
        icon: Award,
      },
      {
        id: 3,
        name: "Kepala Jurusan",
        level: 3,
        deskripsi:
          "Mengelola jurusan, guru, dan siswa di bidang keahlian tertentu.",
        permissions: [
          "Kelola Jurusan",
          "Kelola Guru Jurusan",
          "Kelola Siswa Jurusan",
        ],
        status: "aktif",
        icon: BookOpen,
      },
      {
        id: 4,
        name: "Koordinator BK",
        level: 4,
        deskripsi:
          "Mengelola bimbingan konseling, data siswa, dan layanan BK.",
        permissions: [
          "Kelola BK",
          "Kelola Data Siswa",
          "Layanan Konseling",
        ],
        status: "aktif",
        icon: UserCheck,
      },
      {
        id: 5,
        name: "Bendahara",
        level: 5,
        deskripsi:
          "Mengelola keuangan, tagihan, dan laporan keuangan sekolah.",
        permissions: [
          "Kelola Keuangan",
          "Kelola Tagihan",
          "Kelola Pembayaran",
          "Laporan Keuangan",
        ],
        status: "nonaktif",
        icon: Lock,
      },
    ],
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggle = (name) => {
    setSettings((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleRoleToggle = (id) => {
    setSettings((prev) => ({
      ...prev,
      roles: prev.roles.map((role) =>
        role.id === id
          ? {
              ...role,
              status:
                role.status === "aktif"
                  ? "nonaktif"
                  : "aktif",
            }
          : role
      ),
    }));
  };

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="theme-page flex h-screen w-full min-w-0 overflow-hidden">
      <Sidebar
        active="pengaturan"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full min-w-0 p-3 sm:p-4 md:p-6 lg:p-7 xl:p-8">
            <div className="w-full space-y-6">

              {/* ==================================================
                  PAGE HEADER
              ================================================== */}

              <section
                className={`relative overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
              >
                <div
                  className={`pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full ${themePrimarySurface} blur-3xl`}
                />

                <div
                  className={`pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full ${themeNeutralSurface} blur-3xl`}
                />

                <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:p-7">
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                    >
                      <Settings size={23} />
                    </div>

                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className={`rounded-full ${themePrimarySurface} px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${themePrimaryText}`}
                        >
                          System
                        </span>

                        <span className="hidden text-xs theme-text-muted sm:inline">
                          /
                        </span>

                        <span className="hidden text-xs theme-text-muted sm:inline">
                          Admin Sekolah
                        </span>
                      </div>

                      <h1 className="truncate text-xl font-bold theme-text sm:text-2xl">
                        Pengaturan Sistem
                      </h1>

                      <p className="mt-1 text-xs leading-relaxed theme-text-secondary sm:text-sm">
                        Kelola konfigurasi sekolah, tahun ajaran,
                        notifikasi, dan pengelolaan role level sekolah.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition-all sm:w-auto ${
                      saved
                        ? "bg-[var(--color-success)]"
                        : themePrimaryGradient
                    }`}
                  >
                    {saved ? (
                      <>
                        <CheckCircle size={17} />
                        Pengaturan Tersimpan
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        Simpan Pengaturan
                      </>
                    )}
                  </button>
                </div>
              </section>

              {/* ==================================================
                  QUICK INFO
              ================================================== */}

              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <InfoCard
                  icon={Building2}
                  label="Profil Sekolah"
                  value={
                    settings.namaSekolah ||
                    "Belum dikonfigurasi"
                  }
                  iconClass={`${themeInfoSurface} text-[var(--color-info)]`}
                />

                <InfoCard
                  icon={Calendar}
                  label="Tahun Ajaran"
                  value={
                    settings.tahunAjaran ||
                    "Belum dikonfigurasi"
                  }
                  iconClass={`${themePrimarySurface} ${themePrimaryText}`}
                />

                <InfoCard
                  icon={UserCog}
                  label="Role Level"
                  value={`${
                    settings.roles.filter(
                      (r) => r.status === "aktif"
                    ).length
                  } aktif`}
                  iconClass={`${themePrimarySurface} ${themePrimaryText}`}
                />

                <InfoCard
                  icon={Bell}
                  label="Notifikasi"
                  value="3 layanan tersedia"
                  iconClass={`${themeWarningSurface} text-[var(--color-warning)]`}
                />
              </section>

              {/* ==================================================
                  MAIN SETTINGS
              ================================================== */}

              <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">

                {/* LEFT CONTENT */}

                <div className="min-w-0 space-y-6">

                  {/* INFORMASI SEKOLAH */}

                  <SettingsSection
                    icon={Globe}
                    title="Informasi Sekolah"
                    description="Kelola informasi dasar yang digunakan pada sistem SmartSchool."
                    iconClass={`${themeInfoSurface} text-[var(--color-info)]`}
                  >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <InputField
                        label="Nama Sekolah"
                        name="namaSekolah"
                        value={settings.namaSekolah}
                        onChange={handleChange}
                        placeholder="Contoh: SMK Taruna Bhakti"
                        icon={Building2}
                      />

                      <InputField
                        label="NPSN"
                        name="npsn"
                        value={settings.npsn}
                        onChange={handleChange}
                        placeholder="Contoh: 20229123"
                        icon={FileText}
                      />

                      <div className="md:col-span-2">
                        <InputField
                          label="Alamat Sekolah"
                          name="alamat"
                          value={settings.alamat}
                          onChange={handleChange}
                          placeholder="Masukkan alamat lengkap sekolah"
                          icon={MapPin}
                        />
                      </div>

                      <InputField
                        label="Nomor Telepon"
                        name="telepon"
                        value={settings.telepon}
                        onChange={handleChange}
                        placeholder="021-xxxxxxx"
                        icon={Phone}
                      />

                      <InputField
                        label="Email Sekolah"
                        name="email"
                        value={settings.email}
                        onChange={handleChange}
                        placeholder="admin@sekolah.sch.id"
                        icon={Mail}
                        type="email"
                      />
                    </div>
                  </SettingsSection>

                  {/* TAHUN AJARAN */}

                  <SettingsSection
                    icon={School}
                    title="Tahun Ajaran"
                    description="Atur periode akademik yang digunakan oleh sekolah."
                    iconClass={`${themePrimarySurface} ${themePrimaryText}`}
                  >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <SelectField
                        label="Tahun Ajaran"
                        name="tahunAjaran"
                        value={settings.tahunAjaran}
                        onChange={handleChange}
                        icon={Calendar}
                        options={[
                          "2026/2027",
                          "2025/2026",
                          "2024/2025",
                        ]}
                      />

                      <SelectField
                        label="Semester Aktif"
                        name="semester"
                        value={settings.semester}
                        onChange={handleChange}
                        icon={Calendar}
                        options={[
                          "Ganjil",
                          "Genap",
                        ]}
                      />

                      <InputField
                        label="Tanggal Mulai"
                        name="tanggalMulai"
                        value={settings.tanggalMulai}
                        onChange={handleChange}
                        type="date"
                        icon={Calendar}
                      />

                      <InputField
                        label="Tanggal Selesai"
                        name="tanggalSelesai"
                        value={settings.tanggalSelesai}
                        onChange={handleChange}
                        type="date"
                        icon={Calendar}
                      />
                    </div>

                    <div
                      className={`mt-5 flex items-start gap-3 rounded-xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
                    >
                      <Info
                        size={17}
                        className="mt-0.5 flex-shrink-0 text-[var(--color-info)]"
                      />

                      <div>
                        <p className="text-xs font-semibold theme-text">
                          Informasi tahun ajaran
                        </p>

                        <p className="mt-1 text-xs leading-relaxed theme-text-secondary">
                          Tahun ajaran aktif akan digunakan sebagai
                          referensi utama untuk jadwal, kelas, absensi,
                          nilai, dan aktivitas akademik lainnya.
                        </p>
                      </div>
                    </div>
                  </SettingsSection>

                  {/* ROLE LEVEL */}

                  <SettingsSection
                    icon={UserCog}
                    title="Pengelolaan Role Level Sekolah"
                    description="Kelola hak akses dan level jabatan di lingkungan sekolah."
                    iconClass={`${themePrimarySurface} ${themePrimaryText}`}
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        {settings.roles.map((role) => {
                          const RoleIcon = role.icon;
                          const isActive =
                            role.status === "aktif";

                          return (
                            <div
                              key={role.id}
                              className={`rounded-xl border p-4 transition-all ${
                                isActive
                                  ? `${themeSuccessBorder} ${themeSuccessSurface}`
                                  : `${themeNeutralBorder} ${themeNeutralSurface}`
                              }`}
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex min-w-0 gap-3">
                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                      isActive
                                        ? `${themeSuccessSurface} text-[var(--color-success)]`
                                        : `${themeNeutralSurface} theme-text-muted`
                                    }`}
                                  >
                                    <RoleIcon size={18} />
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-sm font-semibold theme-text">
                                        {role.name}
                                      </p>

                                      <span
                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                          isActive
                                            ? `${themeSuccessSurface} text-[var(--color-success)]`
                                            : `${themeNeutralSurface} theme-text-muted`
                                        }`}
                                      >
                                        <span
                                          className={`h-1.5 w-1.5 rounded-full ${
                                            isActive
                                              ? "bg-[var(--color-success)]"
                                              : "bg-[var(--color-text-muted)]"
                                          }`}
                                        />

                                        {isActive
                                          ? "Aktif"
                                          : "Nonaktif"}
                                      </span>

                                      <span
                                        className={`rounded-full ${themePrimarySurface} px-2 py-0.5 text-[10px] font-medium ${themePrimaryText}`}
                                      >
                                        Level {role.level}
                                      </span>
                                    </div>

                                    <p className="mt-1 text-xs leading-relaxed theme-text-secondary">
                                      {role.deskripsi}
                                    </p>

                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      {role.permissions.map(
                                        (perm, idx) => (
                                          <span
                                            key={idx}
                                            className={`rounded-lg px-2 py-0.5 text-[10px] font-medium ${
                                              isActive
                                                ? `theme-card border ${themeNeutralBorder} theme-text-secondary`
                                                : `${themeNeutralSurface} theme-text-muted`
                                            }`}
                                          >
                                            {perm}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRoleToggle(role.id)
                                  }
                                  aria-pressed={isActive}
                                  className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                                    isActive
                                      ? "bg-[var(--color-success)]"
                                      : "bg-[var(--color-text-muted)]"
                                  }`}
                                >
                                  <span
                                    className={`absolute top-1 h-4 w-4 rounded-full bg-[var(--color-card)] shadow-sm transition-transform ${
                                      isActive
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div
                        className={`mt-3 flex items-start gap-3 rounded-xl border ${themePrimaryBorder} ${themePrimarySurface} p-4`}
                      >
                        <Info
                          size={17}
                          className={`mt-0.5 flex-shrink-0 ${themePrimaryText}`}
                        />

                        <div>
                          <p className="text-xs font-semibold theme-text">
                            Pengelolaan Role Level
                          </p>

                          <p className="mt-1 text-xs leading-relaxed theme-text-secondary">
                            Aktifkan atau nonaktifkan role level sekolah
                            sesuai kebutuhan. Role yang nonaktif tidak
                            dapat digunakan oleh pengguna.
                          </p>
                        </div>
                      </div>
                    </div>
                  </SettingsSection>

                  {/* NOTIFIKASI */}

                  <SettingsSection
                    icon={Bell}
                    title="Notifikasi"
                    description="Atur kanal notifikasi yang digunakan oleh sistem."
                    iconClass={`${themeWarningSurface} text-[var(--color-warning)]`}
                  >
                    <div
                      className={`divide-y ${themeDivider} overflow-hidden rounded-xl border ${themeNeutralBorder}`}
                    >
                      <ToggleRow
                        icon={Mail}
                        title="Notifikasi Email"
                        description="Kirim pemberitahuan penting melalui email."
                        checked={settings.notifikasiEmail}
                        onChange={() =>
                          handleToggle("notifikasiEmail")
                        }
                      />

                      <ToggleRow
                        icon={Smartphone}
                        title="Notifikasi SMS"
                        description="Gunakan SMS untuk pemberitahuan tertentu."
                        checked={settings.notifikasiSMS}
                        onChange={() =>
                          handleToggle("notifikasiSMS")
                        }
                      />

                      <ToggleRow
                        icon={Bell}
                        title="Notifikasi Push"
                        description="Tampilkan pemberitahuan langsung pada aplikasi."
                        checked={settings.notifikasiPush}
                        onChange={() =>
                          handleToggle("notifikasiPush")
                        }
                      />
                    </div>
                  </SettingsSection>

                  {/* BOTTOM SAVE */}

                  <div
                    className={`flex flex-col gap-3 rounded-2xl border ${themePrimaryBorder} ${themePrimarySurface} p-5 ${themeCardShadow} sm:flex-row sm:items-center sm:justify-between sm:p-6`}
                  >
                    <div>
                      <h3 className="text-sm font-semibold theme-text">
                        Simpan perubahan
                      </h3>

                      <p className="mt-1 text-xs leading-relaxed theme-text-secondary">
                        Pastikan konfigurasi sudah sesuai sebelum
                        menyimpan.
                      </p>
                    </div>

                    <button
                      onClick={handleSave}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-5 py-2.5 text-sm font-semibold text-[var(--color-card)] transition hover:opacity-90 sm:w-auto`}
                    >
                      {saved ? (
                        <>
                          <CheckCircle size={16} />
                          Tersimpan
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Simpan Perubahan
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* RIGHT SIDEBAR */}

                <aside className="min-w-0 space-y-5">

                  {/* STATUS SISTEM */}

                  <div
                    className={`overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
                  >
                    <div
                      className={`border-b ${themeDivider} ${themeNeutralSurface} p-5`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold theme-text">
                            Status Sistem
                          </h3>

                          <p className="mt-1 text-xs theme-text-muted">
                            Ringkasan konfigurasi
                          </p>
                        </div>

                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeSuccessSurface}`}
                        >
                          <CheckCircle
                            size={18}
                            className="text-[var(--color-success)]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 p-3">
                      <StatusRow
                        label="Sistem"
                        value="Normal"
                        active
                      />

                      <StatusRow
                        label="Tahun Ajaran"
                        value={
                          settings.tahunAjaran ||
                          "Belum diatur"
                        }
                      />

                      <StatusRow
                        label="Semester"
                        value={
                          settings.semester ||
                          "Belum diatur"
                        }
                      />

                      <StatusRow
                        label="Role Aktif"
                        value={`${
                          settings.roles.filter(
                            (r) => r.status === "aktif"
                          ).length
                        } dari ${settings.roles.length}`}
                        active
                      />
                    </div>
                  </div>

                  {/* SHORTCUT */}

                  <div
                    className={`overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
                  >
                    <div className="p-5">
                      <div className="mb-4">
                        <h3 className="text-sm font-bold theme-text">
                          Pengaturan Terkait
                        </h3>

                        <p className="mt-1 text-xs theme-text-muted">
                          Akses cepat ke menu administrasi.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <ShortcutItem
                          icon={Calendar}
                          title="Tahun Ajaran"
                          description="Kelola periode akademik"
                          href="/admin/tahun-ajaran"
                        />

                        <ShortcutItem
                          icon={Users}
                          title="Pengguna"
                          description="Kelola akun pengguna"
                          href="/admin/pengguna"
                        />

                        <ShortcutItem
                          icon={UserCog}
                          title="Manajemen Role"
                          description="Kelola level akses"
                          href="/admin/manajemen-role"
                        />
                      </div>
                    </div>
                  </div>

                  {/* HELP */}

                  <div
                    className={`rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-5`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                    >
                      <Info size={19} />
                    </div>

                    <h3 className="mt-4 text-sm font-bold theme-text">
                      Butuh bantuan?
                    </h3>

                    <p className="mt-1.5 text-xs leading-relaxed theme-text-secondary">
                      Pastikan pengaturan tahun ajaran dan role level
                      sekolah sudah benar sebelum digunakan oleh pengguna.
                    </p>
                  </div>
                </aside>
              </div>

              {/* FOOTER */}

              <footer
                className={`border-t ${themeDivider} pt-5 text-center`}
              >
                <p className="text-[11px] theme-text-muted">
                  © 2026 SmartSchool • Pengaturan Admin Sekolah
                </p>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function InfoCard({
  icon: Icon,
  label,
  value,
  iconClass,
}) {
  return (
    <div
      className={`group rounded-2xl border ${themeNeutralBorder} theme-card p-4 ${themeCardShadow} transition-all hover:-translate-y-0.5`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={19} />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide theme-text-muted">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-semibold theme-text-secondary">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  iconClass,
  children,
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
    >
      <div
        className={`border-b ${themeDivider} ${themeNeutralSurface} px-5 py-5 sm:px-6`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconClass}`}
          >
            <Icon size={19} />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold theme-text sm:text-base">
              {title}
            </h2>

            <p className="mt-1 text-xs leading-relaxed theme-text-secondary sm:text-sm">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  type = "text",
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-semibold theme-text-secondary">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
          />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} py-3 text-sm theme-text outline-none transition placeholder:text-[var(--color-text-placeholder)] hover:${themePrimaryBorder} ${themeFocus} ${
            Icon ? "pl-10 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  options,
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-semibold theme-text-secondary">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
          />
        )}

        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full appearance-none rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} py-3 pr-10 text-sm theme-text outline-none transition ${themeFocus} ${
            Icon ? "pl-10" : "pl-4"
          }`}
        >
          <option value="">Pilih {label}</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <svg
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div
      className={`flex flex-col gap-4 p-4 transition-colors ${themeNeutralHover} sm:flex-row sm:items-center sm:justify-between`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-muted`}
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold theme-text-secondary">
            {title}
          </p>

          <p className="mt-1 text-xs leading-relaxed theme-text-muted">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
          checked
            ? "bg-[var(--color-primary)]"
            : "bg-[var(--color-text-muted)]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-[var(--color-card)] shadow-sm transition-transform ${
            checked
              ? "translate-x-6"
              : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function StatusRow({
  label,
  value,
  active = false,
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition ${themeNeutralHover}`}
    >
      <span className="text-xs theme-text-secondary">
        {label}
      </span>

      <div className="flex items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            active
              ? "bg-[var(--color-success)]"
              : "bg-[var(--color-text-muted)]"
          }`}
        />

        <span
          className={`text-xs font-medium ${
            active
              ? "text-[var(--color-success)]"
              : "theme-text-secondary"
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function ShortcutItem({
  icon: Icon,
  title,
  description,
  href,
}) {
  return (
    <a
      href={href}
      className={`group flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all ${themeNeutralHover} hover:${themeNeutralBorder}`}
    >
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${themePrimarySurface} ${themePrimaryText} transition-colors group-hover:${themePrimarySurfaceHover}`}
      >
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold theme-text-secondary">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[11px] theme-text-muted">
          {description}
        </p>
      </div>

      <ChevronRight
        size={15}
        className={`flex-shrink-0 theme-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]`}
      />
    </a>
  );
}