"use client";

import { useState, useEffect } from "react";
import {
  getProfilLengkapYayasan,
  updateProfilLengkapYayasan,
  updateProfilYayasan,
} from "@/services/yayasan.service";
import { changePassword } from "@/services/auth.services";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";


const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

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

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";


const TABS = [
  {
    id: "profil",
    label: "Profil",
    icon: User,
  },
  {
    id: "yayasan",
    label: "Info Yayasan",
    icon: Building2,
  },
  {
    id: "keamanan",
    label: "Keamanan",
    icon: Lock,
  },
  {
    id: "notifikasi",
    label: "Notifikasi",
    icon: Bell,
  },
  {
    id: "tampilan",
    label: "Tampilan",
    icon: Palette,
  },
];

const initialProfil = {
  nama: "",
  email: "",
  telepon: "",
  jabatan: "",
};

const initialYayasan = {
  id: "",
  nama: "",
  npyp: "",
  alamat: "",
  email: "",
  telepon: "",
};

const initialNotifikasi = [
  {
    id: "pengumuman",
    label: "Pengumuman sekolah",
    desc: "Notifikasi libur, acara, dan info umum",
    aktif: true,
  },
  {
    id: "nilai",
    label: "Deadline input nilai",
    desc: "Pengingat batas waktu penginputan nilai",
    aktif: true,
  },
  {
    id: "pembayaran",
    label: "Status pembayaran SPP",
    desc: "Update pembayaran dan tunggakan siswa",
    aktif: false,
  },
  {
    id: "laporan",
    label: "Laporan mingguan",
    desc: "Ringkasan aktivitas seluruh unit sekolah",
    aktif: true,
  },
];


function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`
        relative
        inline-flex
        h-6
        w-11
        flex-shrink-0
        items-center
        rounded-full
        transition-colors
        ${
          checked
            ? "bg-[var(--color-primary)]"
            : themeNeutralSurface
        }
        border
        ${
          checked
            ? "border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]"
            : themeNeutralBorder
        }
      `}
    >
      <span
        className={`
          inline-block
          h-[18px]
          w-[18px]
          transform
          rounded-full
          bg-[var(--color-card)]
          shadow-[0_1px_4px_color-mix(in_srgb,var(--color-text)_15%,transparent)]
          transition-transform
          ${
            checked
              ? "translate-x-[22px]"
              : "translate-x-1"
          }
        `}
      />
    </button>
  );
}


function SectionCard({ children }) {
  return (
    <div
      className={`
        theme-card
        rounded-xl
        border theme-border
        ${themeCardShadow}
        p-5
        sm:p-6
      `}
    >
      {children}
    </div>
  );
}


function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
      {children}
    </label>
  );
}


const inputClass = `
  theme-input
  w-full
  px-3.5
  py-2.5
  text-sm
  rounded-lg
  transition-colors
  ${themeFocus}
  placeholder:text-[var(--color-text-placeholder)]
`;


export default function PengaturanPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profil");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [profil, setProfil] = useState(initialProfil);
  const [yayasan, setYayasan] = useState(initialYayasan);
  const [notifikasi, setNotifikasi] = useState(
    initialNotifikasi
  );

  const [tema, setTema] = useState("terang");
  const [bahasa, setBahasa] = useState("id");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showPasswordBaru, setShowPasswordBaru] =
    useState(false);

  const [passwordForm, setPasswordForm] = useState({
    lama: "",
    baru: "",
    konfirmasi: "",
  });

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        setLoading(true);
        setErrorMsg("");

        // Muat profil lengkap (user + yayasan) dari satu endpoint
        const profilRes = await getProfilLengkapYayasan();
        const profilData = profilRes?.data || profilRes;

        if (active && profilData) {
          const u = profilData.user;
          if (u) {
            setProfil({
              nama: u.namaLengkap || "",
              email: u.email || "",
              telepon: u.noTelepon || "",
              jabatan: "Admin Yayasan",
            });
          }

          const y = profilData.yayasan;
          if (y) {
            setYayasan({
              id: "",
              nama: y.nama || "",
              npyp: y.npyp || "",
              alamat: y.alamat || "",
              email: y.email || "",
              telepon: y.telepon || "",
            });
          }
        }
      } catch (err) {
        if (active) {
          console.error("Gagal memuat profil:", err);
          setErrorMsg(err?.message || "Gagal memuat profil pengguna");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const toggleNotifikasi = (id) => {
    setNotifikasi((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              aktif: !n.aktif,
            }
          : n
      )
    );
  };

  const handleSimpan = async () => {
    try {
      setSaving(true);
      setErrorMsg("");

      if (activeTab === "profil") {
        // Simpan profil user via profil-lengkap
        await updateProfilLengkapYayasan({
          user: {
            namaLengkap: profil.nama,
            noTelepon: profil.telepon || null,
          },
        });
      } else if (activeTab === "yayasan") {
        if (!yayasan.nama || yayasan.nama.trim().length < 3) {
          throw new Error("Nama yayasan minimal 3 karakter.");
        }
        if (!yayasan.npyp || yayasan.npyp.trim().length < 3) {
          throw new Error("NPYP yayasan minimal 3 karakter.");
        }

        // Endpoint: PUT /api/yayasan/profil
        await updateProfilYayasan({
          nama: yayasan.nama.trim(),
          npyp: yayasan.npyp.trim(),
          alamat: yayasan.alamat ? yayasan.alamat.trim() : null,
          telepon: yayasan.telepon ? yayasan.telepon.trim() : null,
          email: yayasan.email ? yayasan.email.trim() : null,
        });
      } else if (activeTab === "keamanan") {
        if (!passwordForm.lama) {
          throw new Error("Password saat ini wajib diisi.");
        }
        if (!passwordForm.baru) {
          throw new Error("Password baru wajib diisi.");
        }
        if (passwordForm.baru.length < 8) {
          throw new Error("Password baru minimal 8 karakter.");
        }
        if (passwordForm.baru === passwordForm.lama) {
          throw new Error("Password baru harus berbeda dari password saat ini.");
        }
        if (passwordForm.baru !== passwordForm.konfirmasi) {
          throw new Error("Konfirmasi password baru tidak cocok.");
        }

        await changePassword({
          kataSandiLama: passwordForm.lama,
          kataSandiBaru: passwordForm.baru,
        });

        setPasswordForm({
          lama: "",
          baru: "",
          konfirmasi: "",
        });
      } else {
        // Tab notifikasi/tampilan
        setErrorMsg(
          "Pengaturan pada tab ini belum memiliki endpoint Backend. "
            + "Hanya data profil, informasi yayasan, dan keamanan akun yang dapat disimpan saat ini."
        );
        return;
      }

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      // Tangani HTTP 409 atau duplicate error
      const is409 = err?.status === 409 || err?.statusCode === 409 || /409/.test(String(err));
      if (is409) {
        setErrorMsg(err?.message || "Konflik Data (HTTP 409): NPYP Yayasan sudah terdaftar pada lembaga lain.");
      } else {
        setErrorMsg(err?.message || "Gagal menyimpan perubahan. Periksa kembali isian form.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1500px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-6">


        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">

            <button
              type="button"
              onClick={() => router.push("/yayasan")}
              className="
                inline-flex
                items-center
                gap-1
                text-xs
                font-medium
                theme-text-muted
                hover:text-[var(--color-primary)]
                transition-colors
                mb-1
              "
            >
              <ChevronLeft size={13} />
              Dashboard
            </button>

            <div className="flex items-center gap-2.5">
              <div
                className={`
                  p-2
                  rounded-lg
                  ${themePrimaryGradient}
                  text-[var(--color-card)]
                  ${themePrimaryShadow}
                  flex-shrink-0
                `}
              >
                <Settings size={18} />
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">
                Pengaturan
              </h1>
            </div>

            <p className="text-sm theme-text-secondary mt-1 ml-[42px] flex items-center gap-1.5">
              <Sparkles
                size={14}
                className="theme-text-muted flex-shrink-0"
              />

              <span className="truncate">
                Kelola profil, keamanan, notifikasi,
                dan preferensi akun Anda.
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleSimpan}
            disabled={saving || loading}
            className={`
              flex
              items-center
              justify-center
              gap-2
              px-4
              py-2.5
              text-sm
              font-medium
              text-[var(--color-card)]
              bg-[var(--color-primary)]
              rounded-lg
              hover:opacity-90
              transition-colors
              ${themePrimaryShadow}
              whitespace-nowrap
              flex-shrink-0
              disabled:opacity-50
              disabled:cursor-not-allowed
            `}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : saved ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}

            {saving
              ? "Menyimpan..."
              : saved
              ? "Tersimpan"
              : "Simpan Perubahan"}
          </button>
        </div>


        <div className="flex flex-col lg:flex-row gap-6">


          <div className="lg:w-56 flex-shrink-0">
            <div
              className={`
                theme-card
                rounded-xl
                border theme-border
                ${themeCardShadow}
                p-2
                flex
                flex-row
                lg:flex-col
                gap-1
                overflow-x-auto
                lg:overflow-visible
              `}
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive =
                  activeTab === tab.id;

                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(tab.id)
                    }
                    className={`
                      flex
                      items-center
                      gap-2.5
                      px-3.5
                      py-2.5
                      rounded-lg
                      text-sm
                      font-medium
                      transition-colors
                      whitespace-nowrap
                      ${
                        isActive
                          ? `${themePrimarySoft} text-[var(--color-primary)] ${themePrimarySoftBorder} border`
                          : `theme-text-secondary ${themeNeutralHover}`
                      }
                    `}
                  >
                    <Icon
                      size={16}
                      className="flex-shrink-0"
                    />

                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>


          <div className="flex-1 min-w-0 space-y-4">


            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {activeTab === "profil" && loading && (
              <SectionCard>
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-7 h-7 animate-spin text-[var(--color-primary)]" />
                  <span className="text-xs theme-text-muted">Memuat profil pengguna...</span>
                </div>
              </SectionCard>
            )}

            {activeTab === "profil" && !loading && (
              <SectionCard>
                <h3 className="text-sm font-semibold theme-text-secondary mb-4">
                  Informasi Profil
                </h3>

                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-shrink-0">

                    <div
                      className={`
                        w-16
                        h-16
                        rounded-full
                        ${themePrimaryGradient}
                        text-[var(--color-card)]
                        flex
                        items-center
                        justify-center
                        text-xl
                        font-semibold
                        ${themePrimaryShadow}
                      `}
                    >
                      Y
                    </div>

                    <button
                      type="button"
                      className={`
                        absolute
                        -bottom-1
                        -right-1
                        p-1.5
                        rounded-full
                        theme-card
                        border theme-border
                        theme-text-muted
                        hover:text-[var(--color-primary)]
                        hover:border-[color-mix(in_srgb,var(--color-primary)_28%,transparent)]
                        transition-colors
                        ${themeCardShadow}
                      `}
                    >
                      <Camera size={12} />
                    </button>
                  </div>

                  <div>
                    <p className="text-sm font-semibold theme-text">
                      {profil.nama}
                    </p>

                    <p className="text-xs theme-text-muted">
                      {profil.jabatan}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <FieldLabel>
                      Nama Lengkap
                    </FieldLabel>

                    <input
                      type="text"
                      value={profil.nama}
                      onChange={(e) =>
                        setProfil({
                          ...profil,
                          nama: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <FieldLabel>
                      Jabatan
                    </FieldLabel>

                    <input
                      type="text"
                      value={profil.jabatan}
                      onChange={(e) =>
                        setProfil({
                          ...profil,
                          jabatan: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <FieldLabel>
                      Email
                    </FieldLabel>

                    <div className="relative">
                      <Mail
                        size={14}
                        className="
                          absolute
                          left-3
                          top-1/2
                          -translate-y-1/2
                          theme-text-muted
                        "
                      />

                      <input
                        type="email"
                        value={profil.email}
                        onChange={(e) =>
                          setProfil({
                            ...profil,
                            email: e.target.value,
                          })
                        }
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>
                      Nomor Telepon
                    </FieldLabel>

                    <div className="relative">
                      <Phone
                        size={14}
                        className="
                          absolute
                          left-3
                          top-1/2
                          -translate-y-1/2
                          theme-text-muted
                        "
                      />

                      <input
                        type="text"
                        value={profil.telepon}
                        onChange={(e) =>
                          setProfil({
                            ...profil,
                            telepon: e.target.value,
                          })
                        }
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}


            {activeTab === "yayasan" && (
              <SectionCard>
                <div className="mb-4 rounded-xl border border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] p-3.5 flex items-start gap-2.5">
                  <Building2 className="text-[var(--color-primary)] shrink-0 mt-0.5" size={16} />
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    Pengaturan identitas resmi yayasan naungan. Data tersinkronisasi langsung dengan sistem backend yayasan.
                  </p>
                </div>
                <h3 className="text-sm font-semibold theme-text-secondary mb-4">
                  Informasi Lembaga Yayasan
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="sm:col-span-2">
                    <FieldLabel>
                      Nama Yayasan *
                    </FieldLabel>

                    <input
                      type="text"
                      value={yayasan.nama}
                      onChange={(e) =>
                        setYayasan({
                          ...yayasan,
                          nama: e.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="Masukkan nama resmi yayasan"
                    />
                  </div>

                  <div>
                    <FieldLabel>
                      NPYP (Nomor Pokok Yayasan Pendidikan) *
                    </FieldLabel>

                    <input
                      type="text"
                      value={yayasan.npyp}
                      onChange={(e) =>
                        setYayasan({
                          ...yayasan,
                          npyp: e.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="Contoh: NPYP-998877"
                    />
                    <p className="text-[11px] theme-text-muted mt-1">
                      NPYP unik terdaftar pada kementerian / dinas terkait.
                    </p>
                  </div>

                  <div>
                    <FieldLabel>
                      Telepon Kantor
                    </FieldLabel>

                    <input
                      type="text"
                      value={yayasan.telepon}
                      onChange={(e) =>
                        setYayasan({
                          ...yayasan,
                          telepon: e.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="Nomor telepon kantor yayasan"
                    />
                  </div>

                  <div>
                    <FieldLabel>
                      Email Lembaga
                    </FieldLabel>

                    <input
                      type="email"
                      value={yayasan.email}
                      onChange={(e) =>
                        setYayasan({
                          ...yayasan,
                          email: e.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="email@yayasan.org"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <FieldLabel>
                      Alamat Kantor Yayasan
                    </FieldLabel>

                    <input
                      type="text"
                      value={yayasan.alamat}
                      onChange={(e) =>
                        setYayasan({
                          ...yayasan,
                          alamat: e.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="Alamat lengkap domisili kantor yayasan"
                    />
                  </div>
                </div>
              </SectionCard>
            )}

            {activeTab === "keamanan" && (
              <>
                <SectionCard>
                  <h3 className="text-sm font-semibold theme-text-secondary mb-4">
                    Ubah Password
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div className="sm:col-span-2 sm:max-w-sm">
                      <FieldLabel>
                        Password Saat Ini
                      </FieldLabel>

                      <div className="relative">
                        <input
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          value={passwordForm.lama}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              lama: e.target.value,
                            })
                          }
                          placeholder="••••••••"
                          className={`${inputClass} pr-10`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              !showPassword
                            )
                          }
                          className="
                            absolute
                            right-3
                            top-1/2
                            -translate-y-1/2
                            theme-text-muted
                            hover:text-[var(--color-primary)]
                            transition-colors
                          "
                        >
                          {showPassword ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <FieldLabel>
                        Password Baru
                      </FieldLabel>

                      <div className="relative">
                        <input
                          type={
                            showPasswordBaru
                              ? "text"
                              : "password"
                          }
                          value={passwordForm.baru}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              baru: e.target.value,
                            })
                          }
                          placeholder="••••••••"
                          className={`${inputClass} pr-10`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswordBaru(
                              !showPasswordBaru
                            )
                          }
                          className="
                            absolute
                            right-3
                            top-1/2
                            -translate-y-1/2
                            theme-text-muted
                            hover:text-[var(--color-primary)]
                            transition-colors
                          "
                        >
                          {showPasswordBaru ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <FieldLabel>
                        Konfirmasi Password Baru
                      </FieldLabel>

                      <input
                        type="password"
                        value={passwordForm.konfirmasi}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            konfirmasi:
                              e.target.value,
                          })
                        }
                        placeholder="••••••••"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t theme-border-soft">
                    <p className="text-xs theme-text-muted">
                      Minimal 8 karakter, kombinasi huruf besar, huruf kecil, dan angka.
                    </p>

                    <button
                      type="button"
                      onClick={handleSimpan}
                      disabled={saving || loading || !passwordForm.lama || !passwordForm.baru}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          Simpan Password
                        </>
                      )}
                    </button>
                  </div>
                </SectionCard>

                <SectionCard>
                  <div className="flex items-start gap-3">

                    <div
                      className={`
                        p-2
                        rounded-lg
                        ${themeWarningSurface}
                        ${themeWarningBorder}
                        text-[var(--color-warning)]
                        border
                        flex-shrink-0
                      `}
                    >
                      <Shield size={16} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold theme-text">
                            Verifikasi Dua Langkah
                          </p>

                          <p className="text-xs theme-text-muted mt-0.5">
                            Tambahkan lapisan keamanan ekstra
                            saat masuk ke akun.
                          </p>
                        </div>

                        <Toggle
                          checked={false}
                          onChange={() => {}}
                        />
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </>
            )}


            {activeTab === "notifikasi" && (
              <SectionCard>
                <h3 className="text-sm font-semibold theme-text-secondary mb-1">
                  Preferensi Notifikasi
                </h3>

                <p className="text-xs theme-text-muted mb-4">
                  Pilih jenis notifikasi yang ingin Anda
                  terima.
                </p>

                <div className={`divide-y ${themeDivider}`}>
                  {notifikasi.map((n) => (
                    <div
                      key={n.id}
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                        py-3.5
                      "
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium theme-text-secondary truncate">
                          {n.label}
                        </p>

                        <p className="text-xs theme-text-muted mt-0.5">
                          {n.desc}
                        </p>
                      </div>

                      <Toggle
                        checked={n.aktif}
                        onChange={() =>
                          toggleNotifikasi(n.id)
                        }
                      />
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}


            {activeTab === "tampilan" && (
              <>
                <SectionCard>
                  <h3 className="text-sm font-semibold theme-text-secondary mb-4">
                    Tema
                  </h3>

                  <div className="grid grid-cols-2 gap-3 max-w-sm">

                    <button
                      type="button"
                      onClick={() =>
                        setTema("terang")
                      }
                      className={`
                        flex
                        items-center
                        gap-2.5
                        px-4
                        py-3
                        rounded-lg
                        border
                        text-sm
                        font-medium
                        transition-colors
                        ${
                          tema === "terang"
                            ? `${themePrimarySoftBorder} ${themePrimarySoft} text-[var(--color-primary)]`
                            : `theme-border theme-text-secondary ${themeNeutralHover}`
                        }
                      `}
                    >
                      <Sun size={16} />
                      Terang
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setTema("gelap")
                      }
                      className={`
                        flex
                        items-center
                        gap-2.5
                        px-4
                        py-3
                        rounded-lg
                        border
                        text-sm
                        font-medium
                        transition-colors
                        ${
                          tema === "gelap"
                            ? `${themePrimarySoftBorder} ${themePrimarySoft} text-[var(--color-primary)]`
                            : `theme-border theme-text-secondary ${themeNeutralHover}`
                        }
                      `}
                    >
                      <Moon size={16} />
                      Gelap
                    </button>
                  </div>
                </SectionCard>

                <SectionCard>
                  <h3 className="text-sm font-semibold theme-text-secondary mb-4">
                    Bahasa
                  </h3>

                  <div className="relative max-w-sm">
                    <Globe
                      size={15}
                      className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        theme-text-muted
                        pointer-events-none
                      "
                    />

                    <select
                      value={bahasa}
                      onChange={(e) =>
                        setBahasa(e.target.value)
                      }
                      className={`
                        theme-input
                        w-full
                        appearance-none
                        pl-9
                        pr-3
                        py-2.5
                        text-sm
                        font-medium
                        rounded-lg
                        transition-colors
                        cursor-pointer
                        ${themeFocus}
                      `}
                    >
                      <option value="id">
                        Bahasa Indonesia
                      </option>

                      <option value="en">
                        English
                      </option>
                    </select>
                  </div>
                </SectionCard>
              </>
            )}


            {activeTab === "keamanan" && (
              <SectionCard>
                <div className="flex items-start gap-3">

                  <div
                    className={`
                      p-2
                      rounded-lg
                      ${themeDangerSurface}
                      ${themeDangerBorder}
                      text-[var(--color-text)]
                      border
                      flex-shrink-0
                    `}
                  >
                    <AlertTriangle size={16} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold theme-text">
                      Keluar dari Semua Perangkat
                    </p>

                    <p className="text-xs theme-text-muted mt-0.5 mb-3">
                      Akhiri semua sesi aktif di perangkat
                      lain selain perangkat ini.
                    </p>

                    <button
                      type="button"
                      className={`
                        px-3.5
                        py-2
                        text-xs
                        font-medium
                        text-[var(--color-text)]
                        ${themeDangerSurface}
                        ${themeDangerBorder}
                        border
                        rounded-lg
                        hover:opacity-80
                        transition-colors
                      `}
                    >
                      Keluar dari Semua Perangkat
                    </button>
                  </div>
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}