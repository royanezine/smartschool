"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Building,
  Users,
  GraduationCap,
  FileText,
  Settings,
  Edit,
  Camera,
  Shield,
  Activity,
  CheckCircle,
  LogOut,
  BookOpen,
  Award,
  School,
  CalendarDays,
  Bell,
  ChevronRight,
  UserCircle,
  Briefcase,
  Star,
  Linkedin,
  Github,
  Twitter,
  Globe,
  MailCheck,
  PhoneCall,
  MapPinned,
  BadgeCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

// =========================================================
// THEME HELPERS
// HANYA UNTUK WARNA / SHADOW / HOVER
// =========================================================

const themeShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeHoverShadow =
  "hover:shadow-[0_7px_20px_color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]";

const themePrimarySoftHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themePrimaryBorderHover =
  "hover:border-[color-mix(in_srgb,var(--color-primary)_35%,transparent)]";

// =========================================================
// DATA PROFIL
// =========================================================

const profileData = {
  id: 1,
  nama: "Dr. Ahmad Fauzi, M.Pd.",
  email: "ahmad.fauzi@smartschool.com",
  phone: "0812-3456-7890",
  alamat: "Jl. Merdeka No. 45, Jakarta Pusat, DKI Jakarta",
  posisi: "Administrator Utama",
  role: "Super Admin",
  status: "Aktif",
  bergabung: "15 Januari 2024",
  terakhirLogin: "2026-09-01T08:30:00Z",
  tglLahir: "1 Januari 1985",
  gender: "Laki-laki",
  nip: "198501012010011001",
  deskripsi:
    "Administrator utama sistem SmartSchool dengan pengalaman 10+ tahun di bidang manajemen pendidikan dan teknologi informasi. Berkomitmen untuk menghadirkan solusi digital yang inovatif dan efisien bagi dunia pendidikan.",
  keahlian: [
    "Manajemen Pendidikan",
    "Sistem Informasi",
    "Analisis Data",
    "Manajemen Proyek",
    "Digital Transformation",
    "Strategic Planning",
  ],
  pendidikan: [
    {
      tahun: "2015 - 2018",
      gelar: "S3 Manajemen Pendidikan",
      institusi: "Universitas Indonesia",
      predikat: "Cum Laude",
    },
    {
      tahun: "2010 - 2012",
      gelar: "S2 Teknologi Pendidikan",
      institusi: "Universitas Negeri Jakarta",
      predikat: "Dengan Pujian",
    },
    {
      tahun: "2005 - 2009",
      gelar: "S1 Pendidikan Matematika",
      institusi: "Universitas Pendidikan Indonesia",
      predikat: "Cum Laude",
    },
  ],
  sertifikasi: [
    "Sertifikasi Manajemen Proyek (PMP)",
    "Sertifikasi Pendidikan Digital",
    "Sertifikasi Analisis Data",
  ],
};

const statsData = [
  {
    label: "Total Sekolah",
    value: "6",
    icon: School,
    color: "primary",
    change: "+2",
    trend: "up",
  },
  {
    label: "Total Guru",
    value: "237",
    icon: Users,
    color: "success",
    change: "+12",
    trend: "up",
  },
  {
    label: "Total Siswa",
    value: "4.312",
    icon: GraduationCap,
    color: "info",
    change: "+89",
    trend: "up",
  },
  {
    label: "Total Kelas",
    value: "28",
    icon: BookOpen,
    color: "warning",
    change: "+3",
    trend: "up",
  },
];

const activityLogs = [
  {
    id: 1,
    action: "Login ke sistem",
    time: "2 jam lalu",
    device: "Chrome - Windows",
    type: "login",
  },
  {
    id: 2,
    action: "Menambahkan data guru baru (5 guru)",
    time: "3 jam lalu",
    device: "Chrome - Windows",
    type: "create",
  },
  {
    id: 3,
    action: "Mengupdate data siswa (12 siswa)",
    time: "5 jam lalu",
    device: "Firefox - macOS",
    type: "update",
  },
  {
    id: 4,
    action: "Export laporan kehadiran",
    time: "1 hari lalu",
    device: "Chrome - Windows",
    type: "export",
  },
  {
    id: 5,
    action: "Mengelola pengaturan sistem",
    time: "2 hari lalu",
    device: "Edge - Windows",
    type: "settings",
  },
  {
    id: 6,
    action: "Menambahkan sekolah baru",
    time: "3 hari lalu",
    device: "Chrome - Windows",
    type: "create",
  },
];

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  change,
  trend,
}) {
  const colorMap = {
    primary:
      "theme-primary bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",

    success:
      "theme-success bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",

    info:
      "theme-info bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",

    warning:
      "theme-warning bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]",
  };

  return (
    <div
      className={`group theme-card theme-border rounded-2xl border p-4 ${themeShadow} transition-all hover:-translate-y-0.5 ${themeHoverShadow} sm:p-5`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-[0.06em]">
            {label}
          </p>

          <p className="theme-text mt-1 text-2xl font-bold tracking-tight">
            {value}
          </p>

          {change && (
            <div className="mt-1 flex items-center gap-1">
              <span className="theme-success text-xs font-medium">
                ↑ {change}
              </span>

              <span className="theme-text-muted text-xs">
                dari bulan lalu
              </span>
            </div>
          )}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorMap[color]}`}
        >
          <Icon size={20} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}

// =========================================================
// MAIN PAGE
// =========================================================

export default function AdminProfilePage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profile, setProfile] = useState(profileData);
  const [currentTime, setCurrentTime] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("profile");

  useEffect(() => {
    const now = new Date();

    const formatted = now.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    setCurrentTime(formatted);
  }, []);

  const getInitials = (nama) => {
    if (!nama) return "AD";

    const parts = nama.trim().split(" ");

    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return nama.substring(0, 2).toUpperCase();
  };

  const getActivityIcon = (type) => {
    const icons = {
      login: (
        <LogOut
          size={14}
          className="theme-info"
        />
      ),

      create: (
        <FileText
          size={14}
          className="theme-success"
        />
      ),

      update: (
        <Edit
          size={14}
          className="theme-warning"
        />
      ),

      export: (
        <FileText
          size={14}
          className="theme-primary"
        />
      ),

      settings: (
        <Settings
          size={14}
          className="theme-text-muted"
        />
      ),
    };

    return (
      icons[type] || (
        <CheckCircle
          size={14}
          className="theme-text-muted"
        />
      )
    );
  };

  const getActivityColor = (type) => {
    const colors = {
      login:
        "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",

      create:
        "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",

      update:
        "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]",

      export:
        "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",

      settings:
        "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]",
    };

    return (
      colors[type] ||
      "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
    );
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar
        active="profile"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      {/* MAIN CONTENT */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setIsCollapsed(!isCollapsed)}
          notifications={[]}
          user={{
            name: profile.nama,
            email: profile.email,
            avatar: getInitials(profile.nama),
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="w-full p-3 sm:p-5 lg:p-7 xl:p-8">
            <div className="mx-auto w-full max-w-[1400px] space-y-4 sm:space-y-5 lg:space-y-6">

              {/* =================================================
                  PAGE HEADER
              ================================================= */}

              <section
                className={`theme-card theme-border relative overflow-hidden rounded-2xl border ${themeShadow}`}
              >
                <div
                  className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full blur-3xl"
                  style={{
                    background:
                      "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                  }}
                />

                <div className="relative flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">
                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <div
                      className="theme-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_25%,transparent)] sm:h-14 sm:w-14"
                    >
                      <UserCircle
                        size={22}
                        strokeWidth={1.9}
                        className="sm:h-[25px] sm:w-[25px]"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="theme-text text-xl font-semibold tracking-[-0.025em] sm:text-2xl lg:text-[26px]">
                          Profil Admin
                        </h1>

                        <span
                          className={`theme-primary ${themePrimaryBorder} inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold sm:px-3 sm:py-1 sm:text-[11px]`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {profile.role}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-1.5 sm:gap-2">
                        <Shield
                          size={13}
                          className="theme-primary shrink-0 sm:h-[14px] sm:w-[14px]"
                          strokeWidth={2}
                        />

                        <p className="theme-text-secondary text-xs leading-5 sm:text-sm">
                          Informasi profil dan aktivitas admin sekolah
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-wrap gap-2 sm:flex-row lg:w-auto">
                    <button
                      onClick={() =>
                        router.push("/admin/profile/edit")
                      }
                      className={`theme-card theme-border theme-text-secondary inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium ${themeShadow} transition-all ${themePrimaryBorderHover} ${themePrimarySoftHover} active:scale-[0.98] sm:h-11 sm:px-5`}
                    >
                      <Edit
                        size={16}
                        className="sm:h-[17px] sm:w-[17px]"
                      />
                      Edit Profil
                    </button>

                    <button
                      onClick={() =>
                        router.push("/admin/settings")
                      }
                      className="theme-primary inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-[0_7px_18px_color-mix(in_srgb,var(--color-primary)_20%,transparent)] transition-all hover:opacity-90 hover:shadow-[0_9px_22px_color-mix(in_srgb,var(--color-primary)_25%,transparent)] active:scale-[0.98] sm:h-11 sm:px-5"
                    >
                      <Settings
                        size={16}
                        strokeWidth={2.3}
                        className="sm:h-[17px] sm:w-[17px]"
                      />
                      Pengaturan
                    </button>
                  </div>
                </div>
              </section>

              {/* =================================================
                  PROFILE CARD - PREMIUM
              ================================================= */}

              <section
                className={`theme-card theme-border overflow-hidden rounded-2xl border ${themeShadow}`}
              >
                <div className="relative">

                  {/* Cover Background */}
                  <div
                    className="h-24 w-full sm:h-32 lg:h-40"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 75%, var(--color-info)), color-mix(in srgb, var(--color-primary) 55%, var(--color-info)))",
                    }}
                  />

                  <div className="relative -mt-12 px-4 pb-5 sm:px-6 sm:pb-6 lg:px-8 lg:pb-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">

                      {/* AVATAR */}
                      <div className="flex flex-col items-center gap-3 lg:w-48 lg:flex-none">
                        <div className="relative">
                          <div
                            className="theme-primary flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-[var(--color-card)] text-4xl font-bold shadow-[0_8px_25px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] sm:h-32 sm:w-32 sm:text-5xl"
                          >
                            {getInitials(profile.nama)}
                          </div>

                          <button
                            className={`theme-card theme-border theme-text-muted absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-xl border ${themeShadow} transition-all ${themePrimaryBorderHover} ${themePrimarySoftHover} hover:shadow-[0_4px_12px_color-mix(in_srgb,var(--color-text)_10%,transparent)]`}
                          >
                            <Camera size={16} />
                          </button>
                        </div>

                        <div className="text-center">
                          <p className="theme-text text-base font-semibold">
                            {profile.nama}
                          </p>

                          <p className="theme-text-secondary text-sm">
                            {profile.posisi}
                          </p>

                          <div className="mt-2 flex items-center justify-center gap-1.5">
                            <span className="theme-success inline-flex items-center gap-1.5 rounded-full border border-current/20 px-3 py-1 text-xs font-medium">
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {profile.status}
                            </span>

                            <BadgeCheck
                              size={16}
                              className="theme-primary"
                            />
                          </div>
                        </div>
                      </div>

                      {/* PROFILE INFO - GRID */}
                      <div className="theme-border min-w-0 flex-1 border-t pt-5 lg:border-t-0 lg:pt-0">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:gap-y-4">
                          <InfoItem
                            icon={User}
                            label="Nama Lengkap"
                            value={profile.nama}
                          />

                          <InfoItem
                            icon={Mail}
                            label="Email"
                            value={profile.email}
                          />

                          <InfoItem
                            icon={Phone}
                            label="Telepon"
                            value={profile.phone}
                          />

                          <InfoItem
                            icon={Shield}
                            label="Role"
                            value={profile.role}
                          />

                          <InfoItem
                            icon={Calendar}
                            label="Tanggal Lahir"
                            value={profile.tglLahir}
                          />

                          <InfoItem
                            icon={CalendarDays}
                            label="Bergabung"
                            value={profile.bergabung}
                          />

                          <InfoItem
                            icon={MapPin}
                            label="Alamat"
                            value={profile.alamat}
                            className="sm:col-span-2"
                          />

                          <InfoItem
                            icon={FileText}
                            label="NIP"
                            value={profile.nip}
                            className="sm:col-span-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* DESKRIPSI */}
                    <div className="theme-border mt-4 border-t pt-4 lg:mt-5 lg:pt-5">
                      <div className="flex items-start gap-3">
                        <div
                          className={`theme-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft}`}
                        >
                          <FileText size={15} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="theme-text-secondary text-xs font-medium">
                            Deskripsi Diri
                          </p>

                          <p className="theme-text-secondary mt-1 text-sm leading-relaxed">
                            {profile.deskripsi}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  STATISTICS - PREMIUM
              ================================================= */}

              <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {statsData.map((stat) => (
                  <StatCard
                    key={stat.label}
                    icon={stat.icon}
                    label={stat.label}
                    value={stat.value}
                    color={stat.color}
                    change={stat.change}
                    trend={stat.trend}
                  />
                ))}
              </section>

              {/* =================================================
                  TWO COLUMN: SKILLS + ACTIVITY
              ================================================= */}

              <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                {/* LEFT COLUMN */}
                <div className="space-y-5">

                  {/* SKILLS */}
                  <div
                    className={`theme-card theme-border rounded-2xl border p-5 ${themeShadow} sm:p-6`}
                  >
                    <h3 className="theme-text mb-4 flex items-center gap-2 text-sm font-semibold">
                      <Award
                        size={18}
                        className="theme-primary"
                      />
                      Keahlian
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {profile.keahlian.map((skill) => (
                        <span
                          key={skill}
                          className={`theme-border theme-card-soft theme-text-secondary rounded-xl border px-3.5 py-1.5 text-sm font-medium transition-all ${themePrimaryBorderHover} ${themePrimarySoftHover}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* SERTIFIKASI */}
                  <div
                    className={`theme-card theme-border rounded-2xl border p-5 ${themeShadow} sm:p-6`}
                  >
                    <h3 className="theme-text mb-4 flex items-center gap-2 text-sm font-semibold">
                      <BadgeCheck
                        size={18}
                        className="theme-primary"
                      />
                      Sertifikasi
                    </h3>

                    <div className="space-y-2">
                      {profile.sertifikasi.map((cert, index) => (
                        <div
                          key={index}
                          className="theme-card-soft theme-border flex items-center gap-3 rounded-xl border px-4 py-2.5"
                        >
                          <CheckCircle
                            size={16}
                            className="theme-success"
                          />

                          <span className="theme-text-secondary text-sm">
                            {cert}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* EDUCATION */}
                  <div
                    className={`theme-card theme-border rounded-2xl border p-5 ${themeShadow} sm:p-6`}
                  >
                    <h3 className="theme-text mb-4 flex items-center gap-2 text-sm font-semibold">
                      <GraduationCap
                        size={18}
                        className="theme-primary"
                      />
                      Riwayat Pendidikan
                    </h3>

                    <div className="space-y-4">
                      {profile.pendidikan.map((edu, index) => (
                        <div
                          key={index}
                          className="relative border-l-2 border-[var(--color-primary)] pb-4 pl-4 last:pb-0"
                        >
                          <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-[var(--color-primary)]" />

                          <p className="theme-primary text-xs font-medium">
                            {edu.tahun}
                          </p>

                          <p className="theme-text text-sm font-semibold">
                            {edu.gelar}
                          </p>

                          <p className="theme-text-secondary text-sm">
                            {edu.institusi}
                          </p>

                          {edu.predikat && (
                            <span className="theme-success mt-1 inline-flex items-center gap-1 rounded-full border border-current/20 px-2 py-0.5 text-[10px] font-medium">
                              <Star size={10} />
                              {edu.predikat}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN - ACTIVITY LOG */}
                <div
                  className={`theme-card theme-border rounded-2xl border ${themeShadow}`}
                >
                  <div className="theme-border border-b px-5 py-4 sm:px-6 sm:py-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="theme-text flex items-center gap-2 text-sm font-semibold">
                        <Activity
                          size={18}
                          className="theme-primary"
                        />
                        Aktivitas Terakhir
                      </h3>

                      <span className="theme-text-secondary flex items-center gap-1.5 text-xs">
                        <Clock size={13} />
                        {currentTime}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-[var(--color-border-soft)] px-5 py-3 sm:px-6 sm:py-4">
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${getActivityColor(
                            log.type
                          )}`}
                        >
                          {getActivityIcon(log.type)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="theme-text text-sm font-medium">
                            {log.action}
                          </p>

                          <div className="mt-0.5 flex flex-wrap items-center gap-2">
                            <span className="theme-text-secondary text-xs">
                              {log.time}
                            </span>

                            <span className="hidden h-1 w-1 rounded-full bg-[color-mix(in_srgb,var(--color-text)_25%,transparent)] sm:block" />

                            <span className="theme-text-muted text-xs">
                              {log.device}
                            </span>
                          </div>
                        </div>

                        <ChevronRight
                          size={16}
                          className="theme-text-muted mt-1.5"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="theme-border border-t px-5 py-3 sm:px-6 sm:py-4">
                    <button className="theme-primary text-sm font-medium transition-opacity hover:opacity-80">
                      Lihat Semua Aktivitas →
                    </button>
                  </div>
                </div>
              </section>

              {/* =================================================
                  QUICK ACTIONS - PREMIUM
              ================================================= */}

              <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <QuickAction
                  icon={Settings}
                  label="Pengaturan"
                  desc="Kelola sistem"
                  onClick={() =>
                    router.push("/admin/settings")
                  }
                  color="primary"
                />

                <QuickAction
                  icon={Bell}
                  label="Notifikasi"
                  desc="Lihat semua"
                  onClick={() =>
                    router.push("/admin/notifikasi")
                  }
                  color="warning"
                />

                <QuickAction
                  icon={FileText}
                  label="Laporan"
                  desc="Lihat laporan"
                  onClick={() =>
                    router.push("/admin/laporan")
                  }
                  color="info"
                />

                <QuickAction
                  icon={LogOut}
                  label="Logout"
                  desc="Keluar sistem"
                  onClick={() => {
                    if (confirm("Yakin ingin logout?")) {
                      router.push("/login");
                    }
                  }}
                  color="danger"
                />
              </section>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <footer className="theme-border border-t pt-4 text-center sm:pt-5">
                <p className="theme-text-muted text-xs">
                  © 2026 SmartSchool • Profil Admin • {currentTime}
                </p>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// =========================================================
// INFO ITEM COMPONENT
// =========================================================

function InfoItem({
  icon: Icon,
  label,
  value,
  className = "",
}) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <Icon
        size={17}
        className="theme-text-muted mt-0.5 shrink-0"
      />

      <div className="min-w-0">
        <p className="theme-text-secondary text-xs font-medium">
          {label}
        </p>

        <p className="theme-text truncate text-sm font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}

// =========================================================
// QUICK ACTION COMPONENT
// =========================================================

function QuickAction({
  icon: Icon,
  label,
  desc,
  onClick,
  color,
}) {
  const colorMap = {
    primary: `${themePrimaryBorderHover} ${themePrimarySoftHover}`,

    warning:
      "hover:border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)]",

    info:
      "hover:border-[color-mix(in_srgb,var(--color-info)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]",

    danger:
      "hover:border-[color-mix(in_srgb,var(--color-text)_25%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]",
  };

  const iconColorMap = {
    primary:
      "theme-primary bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",

    warning:
      "theme-warning bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]",

    info:
      "theme-info bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",

    danger:
      "theme-danger bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]",
  };

  return (
    <button
      onClick={onClick}
      className={`theme-card theme-border flex items-center gap-3 rounded-2xl border p-4 ${themeShadow} transition-all hover:-translate-y-0.5 ${themeHoverShadow} ${colorMap[color]}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconColorMap[color]}`}
      >
        <Icon
          size={18}
          strokeWidth={1.8}
        />
      </div>

      <div className="min-w-0 text-left">
        <p className="theme-text text-sm font-semibold">
          {label}
        </p>

        <p className="theme-text-secondary text-xs">
          {desc}
        </p>
      </div>

      <ChevronRight
        size={16}
        className="theme-text-muted ml-auto"
      />
    </button>
  );
}