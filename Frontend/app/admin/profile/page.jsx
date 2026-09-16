"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

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
  deskripsi: "Administrator utama sistem SmartSchool dengan pengalaman 10+ tahun di bidang manajemen pendidikan dan teknologi informasi. Berkomitmen untuk menghadirkan solusi digital yang inovatif dan efisien bagi dunia pendidikan.",
  keahlian: ["Manajemen Pendidikan", "Sistem Informasi", "Analisis Data", "Manajemen Proyek", "Digital Transformation", "Strategic Planning"],
  pendidikan: [
    { tahun: "2015 - 2018", gelar: "S3 Manajemen Pendidikan", institusi: "Universitas Indonesia", predikat: "Cum Laude" },
    { tahun: "2010 - 2012", gelar: "S2 Teknologi Pendidikan", institusi: "Universitas Negeri Jakarta", predikat: "Dengan Pujian" },
    { tahun: "2005 - 2009", gelar: "S1 Pendidikan Matematika", institusi: "Universitas Pendidikan Indonesia", predikat: "Cum Laude" },
  ],
  sertifikasi: [
    "Sertifikasi Manajemen Proyek (PMP)",
    "Sertifikasi Pendidikan Digital",
    "Sertifikasi Analisis Data",
  ],
};

const statsData = [
  { label: "Total Sekolah", value: "6", icon: School, color: "bg-blue-50 text-blue-600", change: "+2", trend: "up" },
  { label: "Total Guru", value: "237", icon: Users, color: "bg-emerald-50 text-emerald-600", change: "+12", trend: "up" },
  { label: "Total Siswa", value: "4.312", icon: GraduationCap, color: "bg-indigo-50 text-indigo-600", change: "+89", trend: "up" },
  { label: "Total Kelas", value: "28", icon: BookOpen, color: "bg-amber-50 text-amber-600", change: "+3", trend: "up" },
];

const activityLogs = [
  { id: 1, action: "Login ke sistem", time: "2 jam lalu", device: "Chrome - Windows", type: "login" },
  { id: 2, action: "Menambahkan data guru baru (5 guru)", time: "3 jam lalu", device: "Chrome - Windows", type: "create" },
  { id: 3, action: "Mengupdate data siswa (12 siswa)", time: "5 jam lalu", device: "Firefox - macOS", type: "update" },
  { id: 4, action: "Export laporan kehadiran", time: "1 hari lalu", device: "Chrome - Windows", type: "export" },
  { id: 5, action: "Mengelola pengaturan sistem", time: "2 hari lalu", device: "Edge - Windows", type: "settings" },
  { id: 6, action: "Menambahkan sekolah baru", time: "3 hari lalu", device: "Chrome - Windows", type: "create" },
];

// =========================================================
// STAT CARD
// =========================================================
function StatCard({ icon: Icon, label, value, color, change, trend }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_7px_20px_rgba(15,23,42,0.08)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-800">{value}</p>
          {change && (
            <div className="mt-1 flex items-center gap-1">
              <span className="text-xs font-medium text-emerald-600">↑ {change}</span>
              <span className="text-xs text-slate-400">dari bulan lalu</span>
            </div>
          )}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
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
      login: <LogOut size={14} className="text-blue-600" />,
      create: <FileText size={14} className="text-emerald-600" />,
      update: <Edit size={14} className="text-amber-600" />,
      export: <FileText size={14} className="text-indigo-600" />,
      settings: <Settings size={14} className="text-slate-600" />,
    };
    return icons[type] || <CheckCircle size={14} className="text-slate-600" />;
  };

  const getActivityColor = (type) => {
    const colors = {
      login: "bg-blue-50",
      create: "bg-emerald-50",
      update: "bg-amber-50",
      export: "bg-indigo-50",
      settings: "bg-slate-100",
    };
    return colors[type] || "bg-slate-50";
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc]">
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
              <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-50/70 blur-3xl" />
                
                <div className="relative flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">
                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] sm:h-14 sm:w-14">
                      <UserCircle size={22} strokeWidth={1.9} className="sm:h-[25px] sm:w-[25px]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-semibold tracking-[-0.025em] text-slate-900 sm:text-2xl lg:text-[26px]">
                          Profil Admin
                        </h1>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600 sm:px-3 sm:py-1 sm:text-[11px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          {profile.role}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 sm:gap-2">
                        <Shield size={13} className="shrink-0 text-blue-400 sm:h-[14px] sm:w-[14px]" strokeWidth={2} />
                        <p className="text-xs leading-5 text-slate-500 sm:text-sm">
                          Informasi profil dan aktivitas admin sekolah
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-wrap gap-2 sm:flex-row lg:w-auto">
                    <button
                      onClick={() => router.push("/admin/profile/edit")}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-[0_2px_5px_rgba(15,23,42,0.05)] transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98] sm:h-11 sm:px-5"
                    >
                      <Edit size={16} className="sm:h-[17px] sm:w-[17px]" />
                      Edit Profil
                    </button>
                    <button
                      onClick={() => router.push("/admin/settings")}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(15,23,42,0.16)] transition-all hover:bg-slate-800 hover:shadow-[0_9px_22px_rgba(15,23,42,0.20)] active:scale-[0.98] sm:h-11 sm:px-5"
                    >
                      <Settings size={16} strokeWidth={2.3} className="sm:h-[17px] sm:w-[17px]" />
                      Pengaturan
                    </button>
                  </div>
                </div>
              </section>

              {/* =================================================
                  PROFILE CARD - PREMIUM
              ================================================= */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] overflow-hidden">
                <div className="relative">
                  {/* Cover Background */}
                  <div className="h-24 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 sm:h-32 lg:h-40" />
                  
                  <div className="relative -mt-12 px-4 pb-5 sm:px-6 sm:pb-6 lg:px-8 lg:pb-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                      {/* AVATAR */}
                      <div className="flex flex-col items-center gap-3 lg:w-48 lg:flex-none">
                        <div className="relative">
                          <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-blue-600 to-indigo-600 text-4xl font-bold text-white shadow-[0_8px_25px_rgba(37,99,235,0.3)] sm:h-32 sm:w-32 sm:text-5xl">
                            {getInitials(profile.nama)}
                          </div>
                          <button className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.1)] transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-md">
                            <Camera size={16} className="text-slate-500" />
                          </button>
                        </div>
                        <div className="text-center">
                          <p className="text-base font-semibold text-slate-800">{profile.nama}</p>
                          <p className="text-sm text-slate-500">{profile.posisi}</p>
                          <div className="mt-2 flex items-center justify-center gap-1.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {profile.status}
                            </span>
                            <BadgeCheck size={16} className="text-blue-600" />
                          </div>
                        </div>
                      </div>

                      {/* PROFILE INFO - GRID */}
                      <div className="min-w-0 flex-1 border-t border-slate-200 pt-5 lg:border-t-0 lg:pt-0">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:gap-y-4">
                          <InfoItem icon={User} label="Nama Lengkap" value={profile.nama} />
                          <InfoItem icon={Mail} label="Email" value={profile.email} />
                          <InfoItem icon={Phone} label="Telepon" value={profile.phone} />
                          <InfoItem icon={Shield} label="Role" value={profile.role} />
                          <InfoItem icon={Calendar} label="Tanggal Lahir" value={profile.tglLahir} />
                          <InfoItem icon={CalendarDays} label="Bergabung" value={profile.bergabung} />
                          <InfoItem icon={MapPin} label="Alamat" value={profile.alamat} className="sm:col-span-2" />
                          <InfoItem icon={FileText} label="NIP" value={profile.nip} className="sm:col-span-2" />
                        </div>
                      </div>
                    </div>
                    
                    {/* DESKRIPSI */}
                    <div className="mt-4 border-t border-slate-100 pt-4 lg:mt-5 lg:pt-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <FileText size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-500">Deskripsi Diri</p>
                          <p className="mt-1 text-sm leading-relaxed text-slate-700">{profile.deskripsi}</p>
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
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Award size={18} className="text-blue-600" />
                      Keahlian
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.keahlian.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm font-medium text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* SERTIFIKASI */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <BadgeCheck size={18} className="text-blue-600" />
                      Sertifikasi
                    </h3>
                    <div className="space-y-2">
                      {profile.sertifikasi.map((cert, index) => (
                        <div key={index} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                          <CheckCircle size={16} className="text-emerald-500" />
                          <span className="text-sm text-slate-700">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* EDUCATION */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <GraduationCap size={18} className="text-blue-600" />
                      Riwayat Pendidikan
                    </h3>
                    <div className="space-y-4">
                      {profile.pendidikan.map((edu, index) => (
                        <div key={index} className="relative border-l-2 border-blue-600 pl-4 pb-4 last:pb-0">
                          <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-blue-600" />
                          <p className="text-xs font-medium text-blue-600">{edu.tahun}</p>
                          <p className="text-sm font-semibold text-slate-800">{edu.gelar}</p>
                          <p className="text-sm text-slate-500">{edu.institusi}</p>
                          {edu.predikat && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
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
                <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                  <div className="border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Activity size={18} className="text-blue-600" />
                        Aktivitas Terakhir
                      </h3>
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock size={13} />
                        {currentTime}
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100 px-5 py-3 sm:px-6 sm:py-4">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${getActivityColor(log.type)}`}>
                          {getActivityIcon(log.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800">{log.action}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-500">{log.time}</span>
                            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
                            <span className="text-xs text-slate-400">{log.device}</span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="mt-1.5 text-slate-300" />
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 px-5 py-3 sm:px-6 sm:py-4">
                    <button className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
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
                  onClick={() => router.push("/admin/settings")}
                  color="blue"
                />
                <QuickAction
                  icon={Bell}
                  label="Notifikasi"
                  desc="Lihat semua"
                  onClick={() => router.push("/admin/notifikasi")}
                  color="amber"
                />
                <QuickAction
                  icon={FileText}
                  label="Laporan"
                  desc="Lihat laporan"
                  onClick={() => router.push("/admin/laporan")}
                  color="indigo"
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
                  color="rose"
                />
              </section>

              {/* =================================================
                  FOOTER
              ================================================= */}
              <footer className="border-t border-slate-200/70 pt-4 text-center sm:pt-5">
                <p className="text-xs text-slate-400">
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
function InfoItem({ icon: Icon, label, value, className = "" }) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <Icon size={17} className="mt-0.5 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}

// =========================================================
// QUICK ACTION COMPONENT
// =========================================================
function QuickAction({ icon: Icon, label, desc, onClick, color }) {
  const colorMap = {
    blue: "hover:border-blue-300 hover:bg-blue-50/50",
    amber: "hover:border-amber-300 hover:bg-amber-50/50",
    indigo: "hover:border-indigo-300 hover:bg-indigo-50/50",
    rose: "hover:border-rose-300 hover:bg-rose-50/50",
  };

  const iconColorMap = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_7px_20px_rgba(15,23,42,0.08)] ${colorMap[color]}`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconColorMap[color]}`}>
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 text-left">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <ChevronRight size={16} className="ml-auto text-slate-300" />
    </button>
  );
}