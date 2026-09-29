"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { apiFetch } from "../../../lib/api";
import {
  User,
  Lock,
  Bell,
  Eye,
  EyeOff,
  Check,
  IdCard,
  Mail,
  School,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  Save,
  AlertCircle,
  Loader2,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getAvatarUrl(avatar) {
  if (!avatar) return "";

  const value = String(avatar).trim();

  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_URL}${value}`;
  }

  return `${API_URL}/${value}`;
}

function getInitials(name) {
  if (!name) return "S";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export default function PengaturanSiswaPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const notifications = [
    {
      id: 1,
      title: "Tugas Matematika deadline besok",
      desc: "Dikirim 1 jam lalu",
      read: false,
    },
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      setError("");

      const response = await apiFetch("/api/users/profile", {
        method: "GET",
      });

      const userData =
        response?.data ||
        response?.user ||
        response;

      setProfile(userData);
    } catch (err) {
      console.error("Gagal mengambil profile:", err);

      setError(
        err?.message ||
          "Gagal mengambil data profile. Silakan coba lagi."
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  const nama = profile?.namaLengkap || "Siswa";
  const email = profile?.email || "-";
  const avatarUrl = getAvatarUrl(profile?.avatar);
  const initials = getInitials(nama);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        role="siswa"
        active="profil"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen((prev) => !prev)
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          toggleSidebar={() =>
            setSidebarOpen((prev) => !prev)
          }
          notifications={notifications}
          user={{
            name: nama,
            email,
            avatar: avatarUrl || initials,
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1380px] p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">
                Profil Saya
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
                Pengaturan
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Kelola keamanan dan preferensi akun kamu.
              </p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <div className="min-w-0">
                  <p className="font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <Check size={18} />

                <span>{success}</span>
              </div>
            )}

            {loadingProfile ? (
              <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <Loader2
                    size={28}
                    className="animate-spin text-blue-600"
                  />

                  <p className="text-sm">
                    Memuat data profile...
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="min-w-0 space-y-6">
                  <DataPribadiSection
                    profile={profile}
                    onProfileUpdated={setProfile}
                    onSuccess={setSuccess}
                    onError={setError}
                  />

                  <KeamananSection />

                  <NotifikasiSection />
                </div>

                <aside className="xl:sticky xl:top-6">
                  <StudentCard
                    profile={profile}
                    avatarUrl={avatarUrl}
                    initials={initials}
                  />
                </aside>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   SETTINGS CARD
========================================================= */

function SettingsCard({
  icon: Icon,
  title,
  desc,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-800">
            {title}
          </h3>

          {desc && (
            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              {desc}
            </p>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   SAVE BUTTON
========================================================= */

function SaveButton({
  saved,
  onClick,
  disabled = false,
  loading = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      type="button"
      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#155DFC] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0D47C9] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <Loader2
          size={15}
          className="animate-spin"
        />
      ) : saved ? (
        <Check size={15} />
      ) : (
        <Save size={15} />
      )}

      {loading
        ? "Menyimpan..."
        : saved
        ? "Tersimpan"
        : "Simpan Perubahan"}
    </button>
  );
}

/* =========================================================
   STUDENT CARD
========================================================= */

function StudentCard({
  profile,
  avatarUrl,
  initials,
}) {
  const nama = profile?.namaLengkap || "Siswa";
  const nisn = profile?.nisn || "-";
  const email = profile?.email || "-";
  const sekolah = profile?.sekolah?.nama || "-";
  const status = profile?.status || "-";

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm">
      <div className="relative overflow-hidden bg-[#155DFC] px-6 pb-20 pt-6">
        <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/10" />

        <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/5" />

        <div className="absolute right-16 top-12 h-8 w-8 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-100">
              Student Card
            </p>

            <p className="mt-1 text-xs text-blue-100/80">
              SmartSchool
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur">
            <GraduationCap size={18} />
          </div>
        </div>
      </div>

      <div className="relative px-5 pb-5 sm:px-6">
        <div className="-mt-14 flex items-end justify-between">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`Foto ${nama}`}
              className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-md"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-blue-100 to-blue-50 text-2xl font-bold text-blue-700 shadow-md">
              {initials}
            </div>
          )}

          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold capitalize text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            {status}
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {nama}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {profile?.peran?.namaTampilan ||
              profile?.peran?.nama ||
              "Siswa"}
          </p>
        </div>

        <div className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/70">
          <StudentInfo
            icon={IdCard}
            label="NISN"
            value={nisn}
          />

          <StudentInfo
            icon={School}
            label="Sekolah"
            value={sekolah}
          />

          <StudentInfo
            icon={Mail}
            label="Email"
            value={email}
          />

          <StudentInfo
            icon={User}
            label="Username"
            value={profile?.namaPengguna || "-"}
          />
        </div>

        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <ShieldCheck size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800">
                Akun terlindungi
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Pastikan kata sandi akun kamu tetap aman
                dan tidak dibagikan kepada orang lain.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <BookOpen
              size={14}
              className="text-slate-400"
            />

            <span className="text-[11px] text-slate-400">
              SmartSchool Student
            </span>
          </div>

          <span className="text-[11px] font-semibold text-blue-600">
            {profile?.sekolah?.kode || "STUDENT"}
          </span>
        </div>
      </div>
    </div>
  );
}

function StudentInfo({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
        <Icon size={14} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   DATA PRIBADI
========================================================= */

function DataPribadiSection({
  profile,
  onProfileUpdated,
  onSuccess,
  onError,
}) {
  const [namaLengkap, setNamaLengkap] = useState(
    profile?.namaLengkap || ""
  );

  const [noTelepon, setNoTelepon] = useState(
    profile?.noTelepon || ""
  );

  const [alamat, setAlamat] = useState(
    profile?.alamat || ""
  );

  const [alamatDomisili, setAlamatDomisili] =
    useState(profile?.alamatDomisili || "");

  const [tempatLahir, setTempatLahir] =
    useState(profile?.tempatLahir || "");

  const [tanggalLahir, setTanggalLahir] = useState(
    profile?.tanggalLahir
      ? new Date(profile.tanggalLahir)
          .toISOString()
          .split("T")[0]
      : ""
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNamaLengkap(profile?.namaLengkap || "");
    setNoTelepon(profile?.noTelepon || "");
    setAlamat(profile?.alamat || "");
    setAlamatDomisili(
      profile?.alamatDomisili || ""
    );
    setTempatLahir(profile?.tempatLahir || "");

    setTanggalLahir(
      profile?.tanggalLahir
        ? new Date(profile.tanggalLahir)
            .toISOString()
            .split("T")[0]
        : ""
    );
  }, [profile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      onError("");
      onSuccess("");

      const response = await apiFetch(
        "/api/users/profile",
        {
          method: "PUT",
          body: JSON.stringify({
            namaLengkap,
            noTelepon,
            alamat,
            alamatDomisili,
            tempatLahir,
            tanggalLahir:
              tanggalLahir || undefined,
          }),
        }
      );

      const updatedProfile =
        response?.data ||
        response?.user ||
        response;

      onProfileUpdated((current) => ({
        ...current,
        ...updatedProfile,
      }));

      setSaved(true);
      onSuccess(
        "Data profile berhasil diperbarui."
      );

      setTimeout(() => {
        setSaved(false);
        onSuccess("");
      }, 2500);
    } catch (err) {
      console.error(
        "Gagal update profile:",
        err
      );

      onError(
        err?.message ||
          "Gagal menyimpan perubahan profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsCard
      icon={User}
      title="Data Pribadi"
      desc="Data akun kamu dapat diperbarui melalui profile"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReadOnlyField
            label="NISN"
            value={profile?.nisn || "-"}
            icon={IdCard}
          />

          <ReadOnlyField
            label="Email"
            value={profile?.email || "-"}
            icon={Mail}
          />

          <ReadOnlyField
            label="Username"
            value={
              profile?.namaPengguna || "-"
            }
            icon={User}
          />

          <ReadOnlyField
            label="Sekolah"
            value={
              profile?.sekolah?.nama || "-"
            }
            icon={School}
          />
        </div>

        <div className="border-t border-slate-100 pt-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Data yang dapat diperbarui
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="Nama Lengkap"
              value={namaLengkap}
              onChange={setNamaLengkap}
            />

            <InputField
              label="No. Telepon"
              value={noTelepon}
              onChange={setNoTelepon}
              placeholder="Masukkan nomor telepon"
            />

            <InputField
              label="Tempat Lahir"
              value={tempatLahir}
              onChange={setTempatLahir}
              placeholder="Masukkan tempat lahir"
            />

            <div>
              <label className="text-xs font-semibold text-slate-600">
                Tanggal Lahir
              </label>

              <input
                type="date"
                value={tanggalLahir}
                onChange={(event) =>
                  setTanggalLahir(
                    event.target.value
                  )
                }
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4">
            <TextAreaField
              label="Alamat"
              value={alamat}
              onChange={setAlamat}
              placeholder="Masukkan alamat"
            />

            <TextAreaField
              label="Alamat Domisili"
              value={alamatDomisili}
              onChange={setAlamatDomisili}
              placeholder="Masukkan alamat domisili"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-400">
            Data seperti NISN, email, username, dan
            sekolah mengikuti data dari sekolah.
          </p>

          <SaveButton
            saved={saved}
            loading={saving}
            disabled={!namaLengkap.trim()}
            onClick={handleSave}
          />
        </div>
      </div>
    </SettingsCard>
  );
}

function ReadOnlyField({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        rows={3}
        className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

/* =========================================================
   KEAMANAN
========================================================= */

function KeamananSection() {
  const [sandiLama, setSandiLama] = useState("");
  const [sandiBaru, setSandiBaru] = useState("");
  const [konfirmasiSandi, setKonfirmasiSandi] =
    useState("");

  const [showSandi, setShowSandi] = useState(false);

  const cocok =
    sandiBaru.length > 0 &&
    sandiBaru === konfirmasiSandi;

  const handleSave = () => {
    alert(
      "Endpoint ubah kata sandi belum tersedia pada backend yang kamu kirim."
    );
  };

  return (
    <SettingsCard
      icon={Lock}
      title="Keamanan"
      desc="Ubah kata sandi akun kamu secara berkala"
    >
      <div className="space-y-4">
        <PasswordInput
          label="Kata Sandi Saat Ini"
          value={sandiLama}
          onChange={setSandiLama}
          show={showSandi}
          onToggle={() =>
            setShowSandi((prev) => !prev)
          }
        />

        <PasswordInput
          label="Kata Sandi Baru"
          value={sandiBaru}
          onChange={setSandiBaru}
          show={showSandi}
          onToggle={() =>
            setShowSandi((prev) => !prev)
          }
        />

        <div>
          <PasswordInput
            label="Konfirmasi Kata Sandi Baru"
            value={konfirmasiSandi}
            onChange={setKonfirmasiSandi}
            show={showSandi}
            onToggle={() =>
              setShowSandi((prev) => !prev)
            }
          />

          {konfirmasiSandi.length > 0 &&
            !cocok && (
              <p className="mt-1.5 text-xs text-red-600">
                Konfirmasi kata sandi tidak cocok.
              </p>
            )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-400">
            Fitur ubah kata sandi menunggu endpoint
            backend.
          </p>

          <button
            type="button"
            onClick={handleSave}
            disabled={!cocok || !sandiLama}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0D47C9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Lock size={15} />
            Ubah Kata Sandi
          </button>
        </div>
      </div>
    </SettingsCard>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600">
        {label}
      </label>

      <div className="relative mt-1.5">
        <input
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          type={show ? "text" : "password"}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 pr-11 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
        />

        <button
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
          type="button"
        >
          {show ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   NOTIFIKASI
========================================================= */

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-700">
          {label}
        </p>

        {desc && (
          <p className="mt-0.5 text-xs leading-5 text-slate-500">
            {desc}
          </p>
        )}
      </div>

      <button
        onClick={() => onChange(!checked)}
        type="button"
        role="switch"
        aria-checked={checked}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked
            ? "bg-[#155DFC]"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked
              ? "translate-x-5"
              : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function NotifikasiSection() {
  const [tugasBaru, setTugasBaru] = useState(true);
  const [materiBaru, setMateriBaru] = useState(true);
  const [pengingatUjian, setPengingatUjian] =
    useState(true);
  const [pengumuman, setPengumuman] =
    useState(false);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    alert(
      "Endpoint preferensi notifikasi belum tersedia pada backend yang dikirim."
    );
  };

  return (
    <SettingsCard
      icon={Bell}
      title="Notifikasi"
      desc="Atur jenis pemberitahuan yang ingin kamu terima"
    >
      <div className="divide-y divide-slate-100">
        <ToggleRow
          label="Tugas Baru"
          desc="Saat guru mengupload tugas baru"
          checked={tugasBaru}
          onChange={setTugasBaru}
        />

        <ToggleRow
          label="Materi Baru"
          desc="Saat ada bahan belajar baru diupload"
          checked={materiBaru}
          onChange={setMateriBaru}
        />

        <ToggleRow
          label="Pengingat Ujian"
          desc="Pengingat H-1 sebelum jadwal ujian"
          checked={pengingatUjian}
          onChange={setPengingatUjian}
        />

        <ToggleRow
          label="Pengumuman Sekolah"
          desc="Info umum dari pihak sekolah"
          checked={pengumuman}
          onChange={setPengumuman}
        />
      </div>

      <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0D47C9]"
        >
          {saved && <Check size={15} />}
          Simpan Perubahan
        </button>
      </div>
    </SettingsCard>
  );
}