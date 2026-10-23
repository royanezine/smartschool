"use client";

import { useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
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
  ArrowLeft,
} from "lucide-react";


const TABS = [
  { key: "keamanan", label: "Keamanan", icon: Lock },
  { key: "notifikasi", label: "Notifikasi", icon: Bell },
  { key: "tampilan", label: "Tampilan", icon: Palette },
];


const notifications = [
  {
    id: 1,
    title: "Pengajuan Disetujui",
    desc: "Dikirim 1 jam lalu",
    read: false,
  },
  {
    id: 2,
    title: "Batas Pengembalian Alat",
    desc: "Dikirim 4 jam lalu",
    read: false,
  },
];


export default function AdminPengaturanPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tabAktif, setTabAktif] = useState("keamanan");
  const [tersimpan, setTersimpan] = useState(false);

  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [lihatPassword, setLihatPassword] = useState(false);

  const [notifikasi, setNotifikasi] = useState({
    emailPengumuman: true,
    emailTugas: true,
    emailSarpras: true,
    pushPengingat: true,
    pushPersetujuan: false,
  });

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
    <div className="flex h-screen overflow-hidden theme-page">
      <Sidebar
        active="pengaturan"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex min-w-0 flex-1 flex-col theme-page">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="flex-1 overflow-y-auto theme-page">
          <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <div className="flex flex-col gap-5 mb-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="
                      w-10 h-10 rounded-xl
                      theme-card theme-border
                      flex items-center justify-center
                      theme-text-secondary
                      hover:theme-sidebar-hover
                      transition-colors
                      flex-shrink-0
                      shadow-sm
                    "
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />

                      <p className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider">
                        Pengaturan Akun
                      </p>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold theme-text tracking-tight">
                      Pengaturan
                    </h1>

                    <p className="text-sm theme-text-muted mt-1.5 max-w-2xl">
                      Kelola keamanan, notifikasi, dan tampilan akun Anda.
                    </p>
                  </div>
                </div>

                {tersimpan && (
                  <span
                    className="
                      hidden sm:flex shrink-0
                      items-center gap-1.5
                      rounded-full border
                      theme-success
                      px-3 py-1.5
                      text-xs font-medium
                    "
                  >
                    <Check size={13} />
                    Perubahan disimpan
                  </span>
                )}
              </div>
            </div>

            <div
              className="
                flex gap-1.5
                overflow-x-auto
                rounded-2xl border theme-border
                theme-card
                p-1.5
                shadow-sm
                mb-6
              "
            >
              {TABS.map((t) => {
                const Icon = t.icon;
                const aktif = tabAktif === t.key;

                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTabAktif(t.key)}
                    className={`
                      flex items-center gap-1.5
                      whitespace-nowrap
                      rounded-xl
                      px-3.5 py-2
                      text-xs font-semibold
                      transition-all
                      ${
                        aktif
                          ? "theme-primary shadow-sm"
                          : "theme-text-secondary hover:theme-sidebar-hover"
                      }
                    `}
                  >
                    <Icon size={14} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {tabAktif === "keamanan" && (
              <form
                onSubmit={simpanPassword}
                className="
                  rounded-2xl border theme-border
                  theme-card
                  overflow-hidden
                  shadow-sm
                "
              >
                <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b theme-border-soft">
                  <div className="w-10 h-10 rounded-xl theme-info flex items-center justify-center flex-shrink-0">
                    <Lock size={18} className="text-[var(--color-info)]" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold theme-text">
                      Ubah Kata Sandi
                    </h2>

                    <p className="text-xs theme-text-muted mt-0.5">
                      Gunakan kata sandi yang kuat dan belum pernah dipakai.
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                  <div>
                    <label className="text-xs font-semibold theme-text-secondary">
                      Kata Sandi Saat Ini
                    </label>

                    <div className="relative mt-2">
                      <input
                        type={lihatPassword ? "text" : "password"}
                        required
                        value={passwordLama}
                        onChange={(e) => setPasswordLama(e.target.value)}
                        className="
                          theme-input
                          w-full rounded-xl
                          px-3.5 py-3 pr-10
                          text-sm
                          outline-none
                          transition-all
                          focus:border-[var(--color-primary)]
                          focus:ring-4
                          focus:ring-[color:var(--color-primary)/.10]
                        "
                      />

                      <button
                        type="button"
                        onClick={() => setLihatPassword(!lihatPassword)}
                        className="
                          absolute right-3 top-1/2
                          -translate-y-1/2
                          theme-text-muted
                          transition-colors
                          hover:text-[var(--color-primary)]
                        "
                      >
                        {lihatPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold theme-text-secondary">
                        Kata Sandi Baru
                      </label>

                      <input
                        type={lihatPassword ? "text" : "password"}
                        required
                        value={passwordBaru}
                        onChange={(e) => setPasswordBaru(e.target.value)}
                        className="
                          theme-input
                          mt-2 w-full rounded-xl
                          px-3.5 py-3
                          text-sm
                          outline-none
                          transition-all
                          focus:border-[var(--color-primary)]
                          focus:ring-4
                          focus:ring-[color:var(--color-primary)/.10]
                        "
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold theme-text-secondary">
                        Konfirmasi Kata Sandi
                      </label>

                      <input
                        type={lihatPassword ? "text" : "password"}
                        required
                        value={konfirmasiPassword}
                        onChange={(e) => setKonfirmasiPassword(e.target.value)}
                        className="
                          theme-input
                          mt-2 w-full rounded-xl
                          px-3.5 py-3
                          text-sm
                          outline-none
                          transition-all
                          focus:border-[var(--color-primary)]
                          focus:ring-4
                          focus:ring-[color:var(--color-primary)/.10]
                        "
                      />
                    </div>
                  </div>

                  {konfirmasiPassword && passwordBaru !== konfirmasiPassword && (
                    <div className="rounded-xl border theme-danger px-3.5 py-2.5">
                      <p className="text-xs font-medium">
                        Konfirmasi kata sandi tidak cocok.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 px-5 sm:px-6 py-4 border-t theme-border-soft">
                  <button
                    type="submit"
                    disabled={!passwordBaru || passwordBaru !== konfirmasiPassword}
                    className="
                      flex items-center gap-1.5
                      rounded-xl
                      px-4 py-2.5
                      text-sm font-semibold
                      theme-primary
                      shadow-sm
                      transition-all
                      hover:opacity-90
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <Save size={14} />
                    Perbarui Kata Sandi
                  </button>
                </div>
              </form>
            )}

            {tabAktif === "notifikasi" && (
              <div className="rounded-2xl border theme-border theme-card overflow-hidden shadow-sm">
                <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b theme-border-soft">
                  <div className="w-10 h-10 rounded-xl theme-info flex items-center justify-center flex-shrink-0">
                    <Bell size={18} className="text-[var(--color-info)]" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold theme-text">
                      Notifikasi Email
                    </h2>

                    <p className="text-xs theme-text-muted mt-0.5">
                      Pilih jenis email yang ingin Anda terima.
                    </p>
                  </div>
                </div>

                <div>
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

                <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-y theme-border-soft">
                  <div className="w-10 h-10 rounded-xl theme-info flex items-center justify-center flex-shrink-0">
                    <Bell size={18} className="text-[var(--color-info)]" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold theme-text">
                      Notifikasi Push
                    </h2>

                    <p className="text-xs theme-text-muted mt-0.5">
                      Notifikasi langsung di perangkat Anda.
                    </p>
                  </div>
                </div>

                <div>
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

            {tabAktif === "tampilan" && (
              <div className="rounded-2xl border theme-border theme-card overflow-hidden shadow-sm">
                <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b theme-border-soft">
                  <div className="w-10 h-10 rounded-xl theme-info flex items-center justify-center flex-shrink-0">
                    <Palette size={18} className="text-[var(--color-info)]" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold theme-text">
                      Preferensi Tampilan
                    </h2>

                    <p className="text-xs theme-text-muted mt-0.5">
                      Sesuaikan tema dan ukuran font aplikasi.
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-6">
                  <div>
                    <label className="text-xs font-semibold theme-text-secondary">
                      Tema
                    </label>

                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {["terang", "gelap"].map((opsi) => {
                        const aktif = tema === opsi;

                        return (
                          <button
                            key={opsi}
                            type="button"
                            onClick={() => setTema(opsi)}
                            className={`
                              rounded-xl border
                              px-4 py-3
                              text-sm font-semibold
                              capitalize
                              transition-all
                              ${
                                aktif
                                  ? "border-transparent theme-primary shadow-sm"
                                  : "theme-border theme-card-soft theme-text-secondary hover:theme-sidebar-hover"
                              }
                            `}
                          >
                            {opsi}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold theme-text-secondary">
                      Ukuran Font
                    </label>

                    <div className="mt-2 grid grid-cols-3 gap-3">
                      {["kecil", "sedang", "besar"].map((opsi) => {
                        const aktif = ukuranFont === opsi;

                        return (
                          <button
                            key={opsi}
                            type="button"
                            onClick={() => setUkuranFont(opsi)}
                            className={`
                              rounded-xl border
                              px-4 py-3
                              text-sm font-semibold
                              capitalize
                              transition-all
                              ${
                                aktif
                                  ? "border-transparent theme-primary shadow-sm"
                                  : "theme-border theme-card-soft theme-text-secondary hover:theme-sidebar-hover"
                              }
                            `}
                          >
                            {opsi}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 px-5 sm:px-6 py-4 border-t theme-border-soft">
                  <button
                    type="button"
                    onClick={simpanTampilan}
                    className="
                      flex items-center gap-1.5
                      rounded-xl
                      px-4 py-2.5
                      text-sm font-semibold
                      theme-primary
                      shadow-sm
                      transition-all
                      hover:opacity-90
                    "
                  >
                    <Save size={14} />
                    Simpan Preferensi
                  </button>
                </div>
              </div>
            )}

            <div className="py-7 text-center">
              <p className="text-xs theme-text-placeholder">
                SmartSchool Admin • Pengaturan
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b theme-border-soft last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold theme-text-secondary">{label}</p>

        <p className="text-xs theme-text-muted mt-1 leading-relaxed">{desc}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        aria-label={label}
        className={`
          relative inline-flex items-center
          w-11 h-6 p-[2px]
          rounded-full flex-shrink-0
          transition-colors duration-200
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-offset-2
          focus-visible:ring-[var(--color-primary)]
          ${checked ? "theme-primary" : "bg-[var(--color-text-placeholder)]"}
        `}
      >
        <span
          className={`
            block w-5 h-5 rounded-full bg-white shadow-sm
            transition-transform duration-200
            ${checked ? "translate-x-[20px]" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
}