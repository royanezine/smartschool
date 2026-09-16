"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  Settings,
  ChevronLeft,
  Sparkles,
  User,
  Lock,
  Bell,
  Palette,
  Building2,
  Save,
  Eye,
  EyeOff,
  Camera,
  Check,
  Moon,
  Sun,
  Globe,
  Mail,
  Phone,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ===== DUMMY DATA =====
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
const TABS = [
  { id: "profil", label: "Profil", icon: User },
  { id: "yayasan", label: "Info Yayasan", icon: Building2 },
  { id: "keamanan", label: "Keamanan", icon: Lock },
  { id: "notifikasi", label: "Notifikasi", icon: Bell },
  { id: "tampilan", label: "Tampilan", icon: Palette },
];

const initialProfil = {
  nama: "Admin Yayasan",
  email: "admin@smartschool.com",
  telepon: "081234567890",
  jabatan: "Administrator Sistem",
};

const initialYayasan = {
  nama: "Yayasan Smart School",
  npwp: "01.234.567.8-901.000",
  alamat: "Jl. Pendidikan No. 45, Jakarta Selatan",
  email: "info@smartschool.sch.id",
  telepon: "(021) 555-0123",
};

const initialNotifikasi = [
  { id: "pengumuman", label: "Pengumuman sekolah", desc: "Notifikasi libur, acara, dan info umum", aktif: true },
  { id: "nilai", label: "Deadline input nilai", desc: "Pengingat batas waktu penginputan nilai", aktif: true },
  { id: "pembayaran", label: "Status pembayaran SPP", desc: "Update pembayaran dan tunggakan siswa", aktif: false },
  { id: "laporan", label: "Laporan mingguan", desc: "Ringkasan aktivitas seluruh unit sekolah", aktif: true },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-blue-500" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SectionCard({ children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
      {children}
    </div>
  );
}

function FieldLabel({ children }) {
  return <label className="block text-xs font-medium text-slate-500 mb-1.5">{children}</label>;
}

const inputClass =
  "w-full px-3.5 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors";

// ===== MAIN COMPONENT =====

export default function PengaturanPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("profil");
  const [saved, setSaved] = useState(false);

  const [profil, setProfil] = useState(initialProfil);
  const [yayasan, setYayasan] = useState(initialYayasan);
  const [notifikasi, setNotifikasi] = useState(initialNotifikasi);
  const [tema, setTema] = useState("terang");
  const [bahasa, setBahasa] = useState("id");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordBaru, setShowPasswordBaru] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ lama: "", baru: "", konfirmasi: "" });

  const notifications = [
    { id: 1, title: "Pengumuman Libur Semester", desc: "Dikirim 2 jam lalu", read: false },
    { id: 2, title: "Deadline Input Nilai", desc: "Dikirim 5 jam lalu", read: false },
  ];

  const toggleNotifikasi = (id) => {
    setNotifikasi((prev) => prev.map((n) => (n.id === id ? { ...n, aktif: !n.aktif } : n)));
  };

  const handleSimpan = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        active="pengaturan"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{ name: "Admin Yayasan", email: "admin@smartschool.com", avatar: "Y" }}
        />
        <main className="flex-1 overflow-y-auto min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">

            {/* PAGE HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <button
                  onClick={() => router.push("/yayasan")}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors mb-1"
                >
                  <ChevronLeft size={13} />
                  Dashboard
                </button>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-500 text-white shadow-sm flex-shrink-0">
                    <Settings size={18} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                    Pengaturan
                  </h1>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">Kelola profil, keamanan, notifikasi, dan preferensi akun Anda.</span>
                </p>
              </div>

              <button
                onClick={handleSimpan}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors shadow-sm whitespace-nowrap flex-shrink-0"
              >
                {saved ? <Check size={16} /> : <Save size={16} />}
                {saved ? "Tersimpan" : "Simpan Perubahan"}
              </button>
            </div>

            {/* CONTENT: TABS + PANEL */}
            <div className="flex flex-col lg:flex-row gap-6">

              {/* TAB NAV */}
              <div className="lg:w-56 flex-shrink-0">
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                          isActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }`}
                      >
                        <Icon size={16} className="flex-shrink-0" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PANEL */}
              <div className="flex-1 min-w-0 space-y-4">

                {/* PROFIL */}
                {activeTab === "profil" && (
                  <SectionCard>
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Informasi Profil</h3>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-semibold">
                          Y
                        </div>
                        <button className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-sm">
                          <Camera size={12} />
                        </button>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{profil.nama}</p>
                        <p className="text-xs text-slate-400">{profil.jabatan}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Nama Lengkap</FieldLabel>
                        <input
                          type="text"
                          value={profil.nama}
                          onChange={(e) => setProfil({ ...profil, nama: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <FieldLabel>Jabatan</FieldLabel>
                        <input
                          type="text"
                          value={profil.jabatan}
                          onChange={(e) => setProfil({ ...profil, jabatan: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <FieldLabel>Email</FieldLabel>
                        <div className="relative">
                          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            value={profil.email}
                            onChange={(e) => setProfil({ ...profil, email: e.target.value })}
                            className={`${inputClass} pl-9`}
                          />
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Nomor Telepon</FieldLabel>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={profil.telepon}
                            onChange={(e) => setProfil({ ...profil, telepon: e.target.value })}
                            className={`${inputClass} pl-9`}
                          />
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                )}

                {/* INFO YAYASAN */}
                {activeTab === "yayasan" && (
                  <SectionCard>
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Informasi Lembaga</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <FieldLabel>Nama Yayasan</FieldLabel>
                        <input
                          type="text"
                          value={yayasan.nama}
                          onChange={(e) => setYayasan({ ...yayasan, nama: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <FieldLabel>NPWP</FieldLabel>
                        <input
                          type="text"
                          value={yayasan.npwp}
                          onChange={(e) => setYayasan({ ...yayasan, npwp: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <FieldLabel>Telepon Kantor</FieldLabel>
                        <input
                          type="text"
                          value={yayasan.telepon}
                          onChange={(e) => setYayasan({ ...yayasan, telepon: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <FieldLabel>Email Lembaga</FieldLabel>
                        <input
                          type="email"
                          value={yayasan.email}
                          onChange={(e) => setYayasan({ ...yayasan, email: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <FieldLabel>Alamat</FieldLabel>
                        <input
                          type="text"
                          value={yayasan.alamat}
                          onChange={(e) => setYayasan({ ...yayasan, alamat: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </SectionCard>
                )}

                {/* KEAMANAN */}
                {activeTab === "keamanan" && (
                  <>
                    <SectionCard>
                      <h3 className="text-sm font-semibold text-slate-700 mb-4">Ubah Password</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 sm:max-w-sm">
                          <FieldLabel>Password Saat Ini</FieldLabel>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={passwordForm.lama}
                              onChange={(e) => setPasswordForm({ ...passwordForm, lama: e.target.value })}
                              placeholder="••••••••"
                              className={`${inputClass} pr-10`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <FieldLabel>Password Baru</FieldLabel>
                          <div className="relative">
                            <input
                              type={showPasswordBaru ? "text" : "password"}
                              value={passwordForm.baru}
                              onChange={(e) => setPasswordForm({ ...passwordForm, baru: e.target.value })}
                              placeholder="••••••••"
                              className={`${inputClass} pr-10`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswordBaru(!showPasswordBaru)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPasswordBaru ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <FieldLabel>Konfirmasi Password Baru</FieldLabel>
                          <input
                            type="password"
                            value={passwordForm.konfirmasi}
                            onChange={(e) => setPasswordForm({ ...passwordForm, konfirmasi: e.target.value })}
                            placeholder="••••••••"
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-3">
                        Minimal 8 karakter, kombinasi huruf besar, huruf kecil, dan angka.
                      </p>
                    </SectionCard>

                    <SectionCard>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex-shrink-0">
                          <Shield size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">Verifikasi Dua Langkah</p>
                              <p className="text-xs text-slate-400 mt-0.5">Tambahkan lapisan keamanan ekstra saat masuk ke akun.</p>
                            </div>
                            <Toggle checked={false} onChange={() => {}} />
                          </div>
                        </div>
                      </div>
                    </SectionCard>
                  </>
                )}

                {/* NOTIFIKASI */}
                {activeTab === "notifikasi" && (
                  <SectionCard>
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">Preferensi Notifikasi</h3>
                    <p className="text-xs text-slate-400 mb-4">Pilih jenis notifikasi yang ingin Anda terima.</p>
                    <div className="divide-y divide-slate-100">
                      {notifikasi.map((n) => (
                        <div key={n.id} className="flex items-center justify-between gap-3 py-3.5">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{n.label}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{n.desc}</p>
                          </div>
                          <Toggle checked={n.aktif} onChange={() => toggleNotifikasi(n.id)} />
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {/* TAMPILAN */}
                {activeTab === "tampilan" && (
                  <>
                    <SectionCard>
                      <h3 className="text-sm font-semibold text-slate-700 mb-4">Tema</h3>
                      <div className="grid grid-cols-2 gap-3 max-w-sm">
                        <button
                          onClick={() => setTema("terang")}
                          className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                            tema === "terang"
                              ? "border-blue-500 bg-blue-50 text-blue-600"
                              : "border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          <Sun size={16} />
                          Terang
                        </button>
                        <button
                          onClick={() => setTema("gelap")}
                          className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                            tema === "gelap"
                              ? "border-blue-500 bg-blue-50 text-blue-600"
                              : "border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          <Moon size={16} />
                          Gelap
                        </button>
                      </div>
                    </SectionCard>

                    <SectionCard>
                      <h3 className="text-sm font-semibold text-slate-700 mb-4">Bahasa</h3>
                      <div className="relative max-w-sm">
                        <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                          value={bahasa}
                          onChange={(e) => setBahasa(e.target.value)}
                          className="w-full appearance-none pl-9 pr-3 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors cursor-pointer"
                        >
                          <option value="id">Bahasa Indonesia</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </SectionCard>
                  </>
                )}

                {/* DANGER ZONE (selalu tampil di bagian bawah panel) */}
                {activeTab === "keamanan" && (
                  <SectionCard>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex-shrink-0">
                        <AlertTriangle size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Keluar dari Semua Perangkat</p>
                        <p className="text-xs text-slate-400 mt-0.5 mb-3">
                          Akhiri semua sesi aktif di perangkat lain selain perangkat ini.
                        </p>
                        <button className="px-3.5 py-2 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors">
                          Keluar dari Semua Perangkat
                        </button>
                      </div>
                    </div>
                  </SectionCard>
                )}

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}