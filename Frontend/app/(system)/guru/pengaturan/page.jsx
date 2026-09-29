"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  Settings,
  Sparkles,
  Lock,
  Bell,
  Palette,
  Save,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

// =========================================================
// TABS (tanpa Profil)
// =========================================================
const TABS = [
  { key: "keamanan", label: "Keamanan", icon: Lock },
  { key: "notifikasi", label: "Notifikasi", icon: Bell },
  { key: "tampilan", label: "Tampilan", icon: Palette },
];

// =========================================================
// DATA DUMMY
// =========================================================
const notifications = [
  { id: 1, title: "Pengajuan Disetujui", desc: "Dikirim 1 jam lalu", read: false },
  { id: 2, title: "Batas Pengembalian Alat", desc: "Dikirim 4 jam lalu", read: false },
];

// =========================================================
// KOMPONEN UTAMA
// =========================================================
export default function AdminPengaturanPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tabAktif, setTabAktif] = useState("keamanan");
  const [tersimpan, setTersimpan] = useState(false);

  // Keamanan
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [lihatPassword, setLihatPassword] = useState(false);

  // Notifikasi
  const [notifikasi, setNotifikasi] = useState({
    emailPengumuman: true,
    emailTugas: true,
    emailSarpras: true,
    pushPengingat: true,
    pushPersetujuan: false,
  });

  // Tampilan
  const [tema, setTema] = useState("terang");
  const [ukuranFont, setUkuranFont] = useState("sedang");

  const tampilkanTersimpan = () => {
    setTersimpan(true);
    setTimeout(() => setTersimpan(false), 2500);
  };

  const simpanPassword = (e) => {
    e.preventDefault();
    if (passwordBaru !== konfirmasiPassword) {
      alert("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    setPasswordLama("");
    setPasswordBaru("");
    setKonfirmasiPassword("");
    tampilkanTersimpan();
  };

  const toggleNotifikasi = (key) => {
    setNotifikasi((prev) => ({ ...prev, [key]: !prev[key] }));
    tampilkanTersimpan();
  };

  const simpanTampilan = () => {
    tampilkanTersimpan();
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
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
          user={{ name: "Admin Sekolah", email: "admin@smartschool.com", avatar: "AS" }}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-3xl mx-auto space-y-6">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-600 text-white shadow-sm flex-shrink-0">
                    <Settings size={18} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                    Pengaturan
                  </h1>
                </div>
                <p className="text-sm text-slate-600 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-slate-500 flex-shrink-0" />
                  <span className="truncate">Kelola keamanan, notifikasi, dan tampilan akun.</span>
                </p>
              </div>

              {tersimpan && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-full flex-shrink-0">
                  <Check size={13} />
                  Perubahan disimpan
                </span>
              )}
            </div>

            {/* TABS */}
            <div className="flex gap-1.5 overflow-x-auto bg-white border border-slate-300 rounded-xl p-1.5 shadow-sm">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTabAktif(t.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    tabAktif === t.key
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB: KEAMANAN */}
            {tabAktif === "keamanan" && (
              <form onSubmit={simpanPassword} className="bg-white rounded-xl border border-slate-300 shadow-sm p-5 sm:p-6 space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">Ubah Kata Sandi</h2>
                  <p className="text-sm text-slate-600 mt-1">Gunakan kata sandi yang kuat dan belum pernah dipakai sebelumnya.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Kata Sandi Saat Ini</label>
                    <div className="relative">
                      <input
                        type={lihatPassword ? "text" : "password"}
                        required
                        value={passwordLama}
                        onChange={(e) => setPasswordLama(e.target.value)}
                        className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setLihatPassword(!lihatPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {lihatPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Kata Sandi Baru</label>
                      <input
                        type={lihatPassword ? "text" : "password"}
                        required
                        value={passwordBaru}
                        onChange={(e) => setPasswordBaru(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Konfirmasi Kata Sandi</label>
                      <input
                        type={lihatPassword ? "text" : "password"}
                        required
                        value={konfirmasiPassword}
                        onChange={(e) => setKonfirmasiPassword(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  {konfirmasiPassword && passwordBaru !== konfirmasiPassword && (
                    <p className="text-sm text-rose-600">Konfirmasi kata sandi tidak cocok.</p>
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={!passwordBaru || passwordBaru !== konfirmasiPassword}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save size={14} />
                    Perbarui Kata Sandi
                  </button>
                </div>
              </form>
            )}

            {/* TAB: NOTIFIKASI */}
            {tabAktif === "notifikasi" && (
              <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-200">
                  <h2 className="text-sm font-semibold text-slate-800">Notifikasi Email</h2>
                  <p className="text-sm text-slate-600 mt-1">Pilih jenis email yang ingin kamu terima.</p>
                </div>
                <div className="divide-y divide-slate-200">
                  <ToggleRow
                    label="Pengumuman sekolah"
                    desc="Info penting dari admin dan kepala sekolah"
                    checked={notifikasi.emailPengumuman}
                    onChange={() => toggleNotifikasi("emailPengumuman")}
                  />
                  <ToggleRow
                    label="Pengumpulan tugas siswa"
                    desc="Saat siswa mengumpulkan atau terlambat mengumpulkan tugas"
                    checked={notifikasi.emailTugas}
                    onChange={() => toggleNotifikasi("emailTugas")}
                  />
                  <ToggleRow
                    label="Status peminjaman sarpras"
                    desc="Saat pengajuan peminjaman disetujui atau ditolak"
                    checked={notifikasi.emailSarpras}
                    onChange={() => toggleNotifikasi("emailSarpras")}
                  />
                </div>

                <div className="p-5 sm:p-6 border-b border-t border-slate-200">
                  <h2 className="text-sm font-semibold text-slate-800">Notifikasi Push</h2>
                  <p className="text-sm text-slate-600 mt-1">Notifikasi langsung di perangkat kamu.</p>
                </div>
                <div className="divide-y divide-slate-200">
                  <ToggleRow
                    label="Pengingat jadwal mengajar"
                    desc="Pengingat 15 menit sebelum jadwal mengajar dimulai"
                    checked={notifikasi.pushPengingat}
                    onChange={() => toggleNotifikasi("pushPengingat")}
                  />
                  <ToggleRow
                    label="Persetujuan mendesak"
                    desc="Notifikasi saat ada pengajuan yang butuh respons cepat"
                    checked={notifikasi.pushPersetujuan}
                    onChange={() => toggleNotifikasi("pushPersetujuan")}
                  />
                </div>
              </div>
            )}

            {/* TAB: TAMPILAN */}
            {tabAktif === "tampilan" && (
              <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-5 sm:p-6 space-y-6">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800 mb-3">Tema</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {["terang", "gelap"].map((opsi) => (
                      <button
                        key={opsi}
                        onClick={() => setTema(opsi)}
                        className={`px-4 py-3 text-sm font-medium rounded-lg border capitalize transition-colors ${
                          tema === opsi
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                      >
                        {opsi}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-800 mb-3">Ukuran Font</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {["kecil", "sedang", "besar"].map((opsi) => (
                      <button
                        key={opsi}
                        onClick={() => setUkuranFont(opsi)}
                        className={`px-4 py-3 text-sm font-medium rounded-lg border capitalize transition-colors ${
                          ukuranFont === opsi
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                      >
                        {opsi}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-200">
                  <button
                    onClick={simpanTampilan}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <Save size={14} />
                    Simpan Preferensi
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

// =========================================================
// KOMPONEN TOGGLE ROW
// =========================================================
function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 p-5 sm:px-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-10 h-6 rounded-full flex-shrink-0 transition-colors ${
          checked ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}