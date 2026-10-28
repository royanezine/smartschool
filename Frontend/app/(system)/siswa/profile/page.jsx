"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getProfile,
  updateProfile,
} from "@/services/user.service";
import {
  User,
  Check,
  IdCard,
  Mail,
  School,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  AlertCircle,
  Loader2,
  CalendarDays,
  Clock3,
  Wallet,
  UserCheck,
  Layers,
  RefreshCw,
  Phone,
  MapPin,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ---------- helpers ---------- */

function getAvatarUrl(avatar) {
  if (!avatar) return "";

  const value = String(avatar).trim();
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
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

function formatJam(value) {
  if (!value) return "-";

  const text = String(value);
  const match = text.match(/^(\d{1,2}):(\d{2})/);

  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }

  return text;
}

function formatRupiah(value) {
  const number = Number(value ?? 0);
  if (Number.isNaN(number)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const HARI_LABEL = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
  minggu: "Minggu",
};

function formatHari(value) {
  if (!value) return "-";

  const key = String(value).toLowerCase();
  return HARI_LABEL[key] || value;
}

/* ---------- page ---------- */

export default function ProfilSiswaPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProfile();

      const userData =
        response?.data || response?.user || response;

      setProfile(userData);
    } catch (err) {
      console.error("Gagal mengambil profile:", err);

      setError(
        err?.message ||
          "Gagal mengambil data profile. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProfile();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadProfile]);

  const nama = profile?.namaLengkap || "Siswa";
  const avatarUrl = getAvatarUrl(profile?.avatar);
  const initials = getInitials(nama);

  return (
    <main className="theme-page h-full min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1380px] px-4 pb-10 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
        {/* Header sticky — biar tidak tenggelam saat scroll */}
        <div className="sticky top-0 z-20 -mx-4 mb-6 border-b theme-border-soft bg-[var(--color-page)]/95 px-4 pb-4 pt-2 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight theme-text sm:text-[28px]">
            Profil Saya
          </h1>

          <p className="mt-1 text-sm theme-text-muted">
            Kelola data pribadi, keamanan, dan lihat
            informasi akademik kamu.
          </p>
        </div>

        {error && (
          <div className="theme-danger mb-6 flex items-start gap-3 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />

            <div className="min-w-0">
              <p className="font-semibold">
                Terjadi kesalahan
              </p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="theme-success mb-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm">
            <Check size={18} />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="theme-card flex min-h-[400px] items-center justify-center rounded-2xl border">
            <div className="flex flex-col items-center gap-3 theme-text-muted">
              <Loader2
                size={28}
                className="animate-spin text-[var(--color-primary)]"
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

              <DataAkademikSection profile={profile} />

              <MataPelajaranSection profile={profile} />
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
  );
}

/* ---------- reusable card ---------- */

function SettingsCard({ icon: Icon, title, desc, children }) {
  return (
    <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
      <div className="flex items-center gap-3 border-b theme-border-soft px-5 py-4 sm:px-6">
        <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-bold theme-text">
            {title}
          </h3>

          {desc && (
            <p className="mt-0.5 text-xs leading-5 theme-text-muted">
              {desc}
            </p>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

/* ---------- kartu siswa ---------- */

function StudentCard({ profile, avatarUrl, initials }) {
  const nama = profile?.namaLengkap || "Siswa";
  const nisn = profile?.nisn || "-";
  const email = profile?.email || "-";
  const sekolah = profile?.sekolah?.nama || "-";
  const status = profile?.status || "-";

  const kelasNama = profile?.kelas?.nama || "-";
  const shiftLabel = profile?.shift?.label || "Belum ditentukan";
  const waliKelas = profile?.waliKelas?.namaLengkap || "-";

  return (
    <div className="theme-card overflow-hidden rounded-[24px] border shadow-sm">
      <div className="relative overflow-hidden bg-[var(--color-primary)] px-6 pb-20 pt-6">
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
              className="h-24 w-24 rounded-2xl border-4 border-[var(--color-card)] object-cover shadow-md"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-[var(--color-card)] bg-[var(--color-info-background)] text-2xl font-bold text-[var(--color-primary)] shadow-md">
              {initials}
            </div>
          )}

          <div className="theme-success mb-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold capitalize">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
            {status}
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-bold tracking-tight theme-text">
            {nama}
          </h2>

          <p className="mt-1 text-sm theme-text-muted">
            {profile?.peran?.namaTampilan ||
              profile?.peran?.nama ||
              "Siswa"}
          </p>
        </div>

        <div className="theme-card-soft theme-border-soft mt-5 divide-y rounded-2xl border">
          <StudentInfo icon={IdCard} label="NISN" value={nisn} />
          <StudentInfo
            icon={School}
            label="Sekolah"
            value={sekolah}
          />
          <StudentInfo
            icon={Layers}
            label="Kelas"
            value={kelasNama}
          />
          <StudentInfo
            icon={Clock3}
            label="Shift"
            value={shiftLabel}
          />
          <StudentInfo
            icon={UserCheck}
            label="Wali Kelas"
            value={waliKelas}
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

        <div className="theme-info mt-5 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm">
              <ShieldCheck
                size={17}
                className="text-[var(--color-info)]"
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold theme-text">
                Akun terlindungi
              </p>
              <p className="mt-1 text-[11px] leading-5 theme-text-muted">
                Pastikan kata sandi akun kamu tetap aman
                dan tidak dibagikan kepada orang lain.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t theme-border-soft pt-4">
          <div className="flex items-center gap-2">
            <BookOpen
              size={14}
              className="theme-text-placeholder"
            />
            <span className="text-[11px] theme-text-placeholder">
              SmartSchool Student
            </span>
          </div>

          <span className="text-[11px] font-semibold text-[var(--color-primary)]">
            {profile?.sekolah?.kode || "STUDENT"}
          </span>
        </div>
      </div>
    </div>
  );
}

function StudentInfo({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-3">
      <div className="theme-card flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm">
        <Icon size={14} className="theme-text-muted" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide theme-text-placeholder">
          {label}
        </p>
        <p className="mt-0.5 truncate text-xs font-semibold theme-text-secondary">
          {value}
        </p>
      </div>
    </div>
  );
}


function DataPribadiSection({ profile }) {
  const [namaLengkap, setNamaLengkap] = useState(
    profile?.namaLengkap || ""
  );
  const [noTelepon, setNoTelepon] = useState(
    profile?.noTelepon || ""
  );
  const [alamat, setAlamat] = useState(
    profile?.alamat || ""
  );
  const [alamatDomisili, setAlamatDomisili] = useState(
    profile?.alamatDomisili || ""
  );
  const [tempatLahir, setTempatLahir] = useState(
    profile?.tempatLahir || ""
  );
  const [tanggalLahir, setTanggalLahir] = useState(
    profile?.tanggalLahir
      ? new Date(profile.tanggalLahir)
          .toISOString()
          .split("T")[0]
      : ""
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setNamaLengkap(profile?.namaLengkap || "");
      setNoTelepon(profile?.noTelepon || "");
      setAlamat(profile?.alamat || "");
      setAlamatDomisili(profile?.alamatDomisili || "");
      setTempatLahir(profile?.tempatLahir || "");

      setTanggalLahir(
        profile?.tanggalLahir
          ? new Date(profile.tanggalLahir)
              .toISOString()
              .split("T")[0]
          : ""
      );
    }, 0);

    return () => clearTimeout(timer);
  }, [profile]);

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
            value={profile?.namaPengguna || "-"}
            icon={User}
          />
          <ReadOnlyField
            label="Sekolah"
            value={profile?.sekolah?.nama || "-"}
            icon={School}
          />
        </div>

        <div className="border-t theme-border-soft pt-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide theme-text-placeholder">
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
              <label className="text-xs font-semibold theme-text-secondary">
                Tanggal Lahir
              </label>

              <input
                type="date"
                value={tanggalLahir}
                onChange={(event) =>
                  setTanggalLahir(event.target.value)
                }
                className="theme-input mt-1.5 h-11 w-full rounded-xl px-3.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]"
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

        <div className="border-t theme-border-soft pt-4">
          <p className="text-xs leading-5 theme-text-placeholder">
            Data seperti NISN, email, username, dan
            sekolah mengikuti data dari sekolah.
          </p>
        </div>
      </div>
    </SettingsCard>
  );
}


function DataAkademikSection({ profile }) {
  const kelas = profile?.kelas;
  const waliKelas = profile?.waliKelas;
  const shift = profile?.shift;
  const tahunAjaran = kelas?.tahunAjaran;
  const tabungan = profile?.tabungan;

  return (
    <SettingsCard
      icon={GraduationCap}
      title="Data Akademik"
      desc="Informasi kelas, wali kelas, shift, dan tabungan"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoTile
          icon={Layers}
          label="Kelas"
          value={kelas?.nama || "Belum terdaftar"}
          hint={
            kelas?.tingkat ? `Tingkat ${kelas.tingkat}` : ""
          }
        />

        <InfoTile
          icon={Clock3}
          label="Shift"
          value={shift?.label || "Belum ditentukan"}
          hint={shift?.kode ? `Kode: ${shift.kode}` : ""}
        />

        <InfoTile
          icon={UserCheck}
          label="Wali Kelas"
          value={waliKelas?.namaLengkap || "-"}
          hint=""
        />

        <InfoTile
          icon={CalendarDays}
          label="Tahun Ajaran"
          value={tahunAjaran?.tahunAjaran || "-"}
          hint={tahunAjaran?.semester || ""}
        />

        <InfoTile
          icon={Wallet}
          label="Tabungan"
          value={formatRupiah(tabungan?.saldo)}
          hint={
            tabungan?.status === "aktif"
              ? "Status: aktif"
              : tabungan?.status === "belum_ada"
              ? "Belum ada tabungan"
              : `Status: ${tabungan?.status ?? "-"}`
          }
        />

        <InfoTile
          icon={Phone}
          label="No. Telepon"
          value={profile?.noTelepon || "-"}
          hint=""
        />
      </div>
    </SettingsCard>
  );
}


function MataPelajaranSection({ profile }) {
  const mapel = profile?.mataPelajaran || [];

  return (
    <SettingsCard
      icon={BookOpen}
      title="Mata Pelajaran"
      desc="Mata pelajaran yang kamu ikuti beserta guru dan jadwal"
    >
      {mapel.length === 0 ? (
        <div className="rounded-xl border border-dashed theme-border-soft px-4 py-6 text-center text-sm theme-text-muted">
          Belum ada mata pelajaran yang terdaftar
          untuk kelas ini.
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b theme-border-soft bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]">
              <tr>
                <th className="px-4 py-2.5 font-semibold theme-text">
                  No
                </th>
                <th className="px-4 py-2.5 font-semibold theme-text">
                  Mata Pelajaran
                </th>
                <th className="px-4 py-2.5 font-semibold theme-text">
                  Kode
                </th>
                <th className="px-4 py-2.5 font-semibold theme-text">
                  Guru Pengajar
                </th>
                <th className="px-4 py-2.5 font-semibold theme-text">
                  Jadwal
                </th>
              </tr>
            </thead>

            <tbody>
              {mapel.map((item, index) => (
                <tr
                  key={
                    item.kelasMapelId || item.mataPelajaranId
                  }
                  className="border-b theme-border-soft last:border-b-0"
                >
                  <td className="px-4 py-3 theme-text-secondary">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 font-semibold theme-text">
                    {item.nama || "-"}
                  </td>
                  <td className="px-4 py-3 theme-text-secondary">
                    {item.kode || "-"}
                  </td>
                  <td className="px-4 py-3 theme-text-secondary">
                    {item.guru?.namaLengkap || "-"}
                  </td>
                  <td className="px-4 py-3 theme-text-secondary">
                    {item.jadwal && item.jadwal.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {item.jadwal.map((jadwal, i) => (
                          <span
                            key={`${item.kelasMapelId}-${i}`}
                            className="inline-flex items-center gap-1.5"
                          >
                            <Clock3
                              size={12}
                              className="theme-text-muted"
                            />
                            {formatHari(jadwal.hari)}{" "}
                            {formatJam(jadwal.jamMulai)}–
                            {formatJam(jadwal.jamSelesai)}
                            {jadwal.ruangan
                              ? ` • ${jadwal.ruangan}`
                              : ""}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SettingsCard>
  );
}


function InfoTile({ icon: Icon, label, value, hint }) {
  return (
    <div className="theme-card-soft theme-border-soft rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <div className="theme-card flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm">
          <Icon size={14} className="theme-text-muted" />
        </div>

        <p className="text-[11px] font-medium uppercase tracking-wide theme-text-placeholder">
          {label}
        </p>
      </div>

      <p className="mt-2 text-sm font-semibold theme-text">
        {value}
      </p>

      {hint && (
        <p className="mt-0.5 text-[11px] theme-text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

function ReadOnlyField({ label, value, icon: Icon }) {
  return (
    <div className="theme-card-soft theme-border-soft flex items-center gap-3 rounded-xl border px-3.5 py-3">
      <div className="theme-card theme-border flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
        <Icon size={15} className="theme-text-muted" />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium theme-text-placeholder">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold theme-text">
          {value}
        </p>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-semibold theme-text-secondary">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="theme-input mt-1.5 h-11 w-full rounded-xl px-3.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]"
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
      <label className="text-xs font-semibold theme-text-secondary">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="theme-input mt-1.5 w-full resize-none rounded-xl px-3.5 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]"
      />
    </div>
  );
}