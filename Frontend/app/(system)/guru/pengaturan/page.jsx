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
} from "lucide-react";

// =========================================================
// TABS
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

// =========================================================
// THEME HELPERS
// =========================================================

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

// =========================================================
// KOMPONEN UTAMA
// =========================================================

export default function AdminPengaturanPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tabAktif, setTabAktif] = useState("keamanan");
  const [tersimpan, setTersimpan] = useState(false);

  // =======================================================
  // KEAMANAN
  // =======================================================

  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] =
    useState("");
  const [lihatPassword, setLihatPassword] = useState(false);

  // =======================================================
  // NOTIFIKASI
  // =======================================================

  const [notifikasi, setNotifikasi] = useState({
    emailPengumuman: true,
    emailTugas: true,
    emailSarpras: true,
    pushPengingat: true,
    pushPersetujuan: false,
  });

  // =======================================================
  // TAMPILAN
  // =======================================================

  const [tema, setTema] = useState("terang");
  const [ukuranFont, setUkuranFont] = useState("sedang");

  // =======================================================
  // HANDLERS
  // =======================================================

  const tampilkanTersimpan = () => {
    setTersimpan(true);

    setTimeout(() => {
      setTersimpan(false);
    }, 2500);
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
    setNotifikasi((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    tampilkanTersimpan();
  };

  const simpanTampilan = () => {
    tampilkanTersimpan();
  };

  return (
    <div className="flex h-screen overflow-hidden theme-page">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        active="pengaturan"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      {/* =====================================================
          MAIN
      ====================================================== */}

      <div className="flex min-w-0 flex-1 flex-col theme-page">

        <Header
          toggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
          notifications={notifications}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="flex-1 overflow-y-auto theme-page">

          <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

            <div className="space-y-6">

              {/* =================================================
                  HEADER
              ================================================== */}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="min-w-0">

                  <div className="flex items-center gap-2.5">

                    <div
                      className={`
                        flex h-9 w-9 shrink-0
                        items-center justify-center
                        rounded-lg
                        ${themePrimaryGradient}
                        text-[var(--color-card)]
                        ${themePrimaryShadow}
                      `}
                    >
                      <Settings size={18} />
                    </div>

                    <h1
                      className="
                        truncate
                        text-xl font-semibold
                        theme-text
                        sm:text-2xl
                      "
                    >
                      Pengaturan
                    </h1>

                  </div>

                  <p
                    className="
                      mt-1 ml-[42px]
                      flex items-center gap-1.5
                      text-sm theme-text-secondary
                    "
                  >
                    <Sparkles
                      size={14}
                      className="shrink-0 theme-text-muted"
                    />

                    <span className="truncate">
                      Kelola keamanan, notifikasi, dan tampilan akun.
                    </span>
                  </p>

                </div>

                {tersimpan && (
                  <span
                    className={`
                      flex shrink-0
                      items-center gap-1.5
                      rounded-full border
                      ${themeSuccessBorder}
                      ${themeSuccessSurface}
                      px-3 py-1.5
                      text-xs font-medium
                      text-[var(--color-success)]
                    `}
                  >
                    <Check size={13} />
                    Perubahan disimpan
                  </span>
                )}

              </div>

              {/* =================================================
                  TABS
              ================================================== */}

              <div
                className={`
                  flex gap-1.5
                  overflow-x-auto
                  rounded-xl border
                  ${themeNeutralBorder}
                  theme-card
                  p-1.5
                  ${themeCardShadow}
                `}
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
                        rounded-lg
                        px-3.5 py-2
                        text-xs font-medium
                        transition-all
                        ${
                          aktif
                            ? `${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`
                            : `theme-text-secondary ${themeNeutralHover}`
                        }
                      `}
                    >
                      <Icon size={14} />
                      {t.label}
                    </button>
                  );
                })}

              </div>

              {/* =================================================
                  TAB: KEAMANAN
              ================================================== */}

              {tabAktif === "keamanan" && (
                <form
                  onSubmit={simpanPassword}
                  className={`
                    rounded-xl border
                    ${themeNeutralBorder}
                    theme-card
                    p-5 sm:p-6
                    ${themeCardShadow}
                    space-y-5
                  `}
                >

                  <div>

                    <h2 className="text-sm font-semibold theme-text">
                      Ubah Kata Sandi
                    </h2>

                    <p className="mt-1 text-sm theme-text-secondary">
                      Gunakan kata sandi yang kuat dan belum pernah
                      dipakai sebelumnya.
                    </p>

                  </div>

                  <div className="space-y-4">

                    {/* PASSWORD LAMA */}

                    <div>

                      <label
                        className="
                          mb-1.5 block
                          text-xs font-semibold
                          theme-text-secondary
                        "
                      >
                        Kata Sandi Saat Ini
                      </label>

                      <div className="relative">

                        <input
                          type={
                            lihatPassword
                              ? "text"
                              : "password"
                          }
                          required
                          value={passwordLama}
                          onChange={(e) =>
                            setPasswordLama(e.target.value)
                          }
                          className="
                            theme-input
                            w-full rounded-lg
                            px-3 py-2 pr-10
                            text-sm
                            outline-none
                            focus:border-[var(--color-primary)]
                            focus:ring-2
                            focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]
                          "
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setLihatPassword(!lihatPassword)
                          }
                          className="
                            absolute right-3 top-1/2
                            -translate-y-1/2
                            theme-text-muted
                            transition-colors
                            hover:text-[var(--color-primary)]
                          "
                        >
                          {lihatPassword ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>

                      </div>

                    </div>

                    {/* PASSWORD BARU */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                      <div>

                        <label
                          className="
                            mb-1.5 block
                            text-xs font-semibold
                            theme-text-secondary
                          "
                        >
                          Kata Sandi Baru
                        </label>

                        <input
                          type={
                            lihatPassword
                              ? "text"
                              : "password"
                          }
                          required
                          value={passwordBaru}
                          onChange={(e) =>
                            setPasswordBaru(e.target.value)
                          }
                          className="
                            theme-input
                            w-full rounded-lg
                            px-3 py-2
                            text-sm
                            outline-none
                            focus:border-[var(--color-primary)]
                            focus:ring-2
                            focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]
                          "
                        />

                      </div>

                      {/* KONFIRMASI */}

                      <div>

                        <label
                          className="
                            mb-1.5 block
                            text-xs font-semibold
                            theme-text-secondary
                          "
                        >
                          Konfirmasi Kata Sandi
                        </label>

                        <input
                          type={
                            lihatPassword
                              ? "text"
                              : "password"
                          }
                          required
                          value={konfirmasiPassword}
                          onChange={(e) =>
                            setKonfirmasiPassword(
                              e.target.value
                            )
                          }
                          className="
                            theme-input
                            w-full rounded-lg
                            px-3 py-2
                            text-sm
                            outline-none
                            focus:border-[var(--color-primary)]
                            focus:ring-2
                            focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]
                          "
                        />

                      </div>

                    </div>

                    {konfirmasiPassword &&
                      passwordBaru !==
                        konfirmasiPassword && (
                        <p className="text-sm theme-danger">
                          Konfirmasi kata sandi tidak cocok.
                        </p>
                      )}

                  </div>

                  <div
                    className={`
                      flex justify-end
                      border-t ${themeDivider}
                      pt-4
                    `}
                  >

                    <button
                      type="submit"
                      disabled={
                        !passwordBaru ||
                        passwordBaru !==
                          konfirmasiPassword
                      }
                      className={`
                        flex items-center gap-1.5
                        rounded-lg
                        px-4 py-2.5
                        text-sm font-medium
                        ${themePrimaryGradient}
                        text-[var(--color-card)]
                        ${themePrimaryShadow}
                        transition-all
                        hover:opacity-90
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      `}
                    >
                      <Save size={14} />
                      Perbarui Kata Sandi
                    </button>

                  </div>

                </form>
              )}

              {/* =================================================
                  TAB: NOTIFIKASI
              ================================================== */}

              {tabAktif === "notifikasi" && (
                <div
                  className={`
                    overflow-hidden rounded-xl
                    border ${themeNeutralBorder}
                    theme-card
                    ${themeCardShadow}
                  `}
                >

                  {/* EMAIL HEADER */}

                  <div
                    className={`
                      border-b ${themeDivider}
                      p-5 sm:p-6
                    `}
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`
                          flex h-9 w-9
                          items-center justify-center
                          rounded-xl
                          ${themeInfoSurface}
                          ${themeInfoBorder}
                          border
                          text-[var(--color-info)]
                        `}
                      >
                        <Bell size={16} />
                      </div>

                      <div>

                        <h2 className="text-sm font-semibold theme-text">
                          Notifikasi Email
                        </h2>

                        <p className="mt-1 text-sm theme-text-secondary">
                          Pilih jenis email yang ingin kamu terima.
                        </p>

                      </div>

                    </div>

                  </div>

                  <div>

                    <ToggleRow
                      label="Pengumuman sekolah"
                      desc="Info penting dari admin dan kepala sekolah"
                      checked={notifikasi.emailPengumuman}
                      onChange={() =>
                        toggleNotifikasi(
                          "emailPengumuman"
                        )
                      }
                    />

                    <ToggleRow
                      label="Pengumpulan tugas siswa"
                      desc="Saat siswa mengumpulkan atau terlambat mengumpulkan tugas"
                      checked={notifikasi.emailTugas}
                      onChange={() =>
                        toggleNotifikasi("emailTugas")
                      }
                    />

                    <ToggleRow
                      label="Status peminjaman sarpras"
                      desc="Saat pengajuan peminjaman disetujui atau ditolak"
                      checked={notifikasi.emailSarpras}
                      onChange={() =>
                        toggleNotifikasi(
                          "emailSarpras"
                        )
                      }
                    />

                  </div>

                  {/* PUSH HEADER */}

                  <div
                    className={`
                      border-b border-t ${themeDivider}
                      p-5 sm:p-6
                    `}
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`
                          flex h-9 w-9
                          items-center justify-center
                          rounded-xl
                          ${themePrimarySoft}
                          ${themePrimarySoftBorder}
                          border
                          ${themePrimaryText}
                        `}
                      >
                        <Bell size={16} />
                      </div>

                      <div>

                        <h2 className="text-sm font-semibold theme-text">
                          Notifikasi Push
                        </h2>

                        <p className="mt-1 text-sm theme-text-secondary">
                          Notifikasi langsung di perangkat kamu.
                        </p>

                      </div>

                    </div>

                  </div>

                  <div>

                    <ToggleRow
                      label="Pengingat jadwal mengajar"
                      desc="Pengingat 15 menit sebelum jadwal mengajar dimulai"
                      checked={notifikasi.pushPengingat}
                      onChange={() =>
                        toggleNotifikasi(
                          "pushPengingat"
                        )
                      }
                    />

                    <ToggleRow
                      label="Persetujuan mendesak"
                      desc="Notifikasi saat ada pengajuan yang butuh respons cepat"
                      checked={notifikasi.pushPersetujuan}
                      onChange={() =>
                        toggleNotifikasi(
                          "pushPersetujuan"
                        )
                      }
                    />

                  </div>

                </div>
              )}

              {/* =================================================
                  TAB: TAMPILAN
              ================================================== */}

              {tabAktif === "tampilan" && (
                <div
                  className={`
                    rounded-xl border
                    ${themeNeutralBorder}
                    theme-card
                    p-5 sm:p-6
                    ${themeCardShadow}
                    space-y-6
                  `}
                >

                  {/* TEMA */}

                  <div>

                    <h2 className="mb-3 text-sm font-semibold theme-text">
                      Tema
                    </h2>

                    <div className="grid grid-cols-2 gap-3">

                      {["terang", "gelap"].map(
                        (opsi) => {
                          const aktif =
                            tema === opsi;

                          return (
                            <button
                              key={opsi}
                              type="button"
                              onClick={() =>
                                setTema(opsi)
                              }
                              className={`
                                rounded-lg
                                border
                                px-4 py-3
                                text-sm font-medium
                                capitalize
                                transition-all
                                ${
                                  aktif
                                    ? `${themePrimaryGradient} border-transparent text-[var(--color-card)] ${themePrimaryShadow}`
                                    : `${themeNeutralBorder} theme-card theme-text-secondary ${themeNeutralHover}`
                                }
                              `}
                            >
                              {opsi}
                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>

                  {/* UKURAN FONT */}

                  <div>

                    <h2 className="mb-3 text-sm font-semibold theme-text">
                      Ukuran Font
                    </h2>

                    <div className="grid grid-cols-3 gap-3">

                      {["kecil", "sedang", "besar"].map(
                        (opsi) => {
                          const aktif =
                            ukuranFont === opsi;

                          return (
                            <button
                              key={opsi}
                              type="button"
                              onClick={() =>
                                setUkuranFont(opsi)
                              }
                              className={`
                                rounded-lg
                                border
                                px-4 py-3
                                text-sm font-medium
                                capitalize
                                transition-all
                                ${
                                  aktif
                                    ? `${themePrimaryGradient} border-transparent text-[var(--color-card)] ${themePrimaryShadow}`
                                    : `${themeNeutralBorder} theme-card theme-text-secondary ${themeNeutralHover}`
                                }
                              `}
                            >
                              {opsi}
                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>

                  {/* SIMPAN */}

                  <div
                    className={`
                      flex justify-end
                      border-t ${themeDivider}
                      pt-4
                    `}
                  >

                    <button
                      type="button"
                      onClick={simpanTampilan}
                      className={`
                        flex items-center gap-1.5
                        rounded-lg
                        px-4 py-2.5
                        text-sm font-medium
                        ${themePrimaryGradient}
                        text-[var(--color-card)]
                        ${themePrimaryShadow}
                        transition-all
                        hover:opacity-90
                      `}
                    >
                      <Save size={14} />
                      Simpan Preferensi
                    </button>

                  </div>

                </div>
              )}

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

// =========================================================
// KOMPONEN TOGGLE ROW
// =========================================================

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}) {
  return (
    <div
      className={`
        flex items-center
        justify-between gap-4
        border-b ${themeDivider}
        p-5 sm:px-6
        last:border-b-0
      `}
    >

      <div className="min-w-0">

        <p className="text-sm font-medium theme-text">
          {label}
        </p>

        <p className="mt-0.5 text-sm theme-text-muted">
          {desc}
        </p>

      </div>

      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        className={`
          relative h-6 w-10 shrink-0
          rounded-full
          transition-all
          ${
            checked
              ? "bg-[var(--color-primary)]"
              : "bg-[color-mix(in_srgb,var(--color-text)_18%,transparent)]"
          }
        `}
      >

        <span
          className={`
            absolute top-0.5
            h-5 w-5
            rounded-full
            bg-[var(--color-card)]
            shadow-[0_1px_4px_color-mix(in_srgb,var(--color-text)_15%,transparent)]
            transition-transform
            ${
              checked
                ? "translate-x-[18px]"
                : "translate-x-0.5"
            }
          `}
        />

      </button>

    </div>
  );
}