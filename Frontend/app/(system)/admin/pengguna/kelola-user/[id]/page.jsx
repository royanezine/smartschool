"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getUserById } from "@/services/user.service";

import {
  ArrowLeft,
  Pencil,
  Loader2,
  UserRound,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  ShieldCheck,
  CalendarDays,
  School,
  IdCard,
  AlertCircle,
  RefreshCw,
  Clock3,
} from "lucide-react";

/* =========================================================
   HELPERS
========================================================= */

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan saat mengambil data pengguna.";
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function formatRole(user) {
  return (
    user?.peran?.namaTampilan ||
    user?.peran?.nama ||
    user?.role ||
    "-"
  );
}

function formatJenisKelamin(value) {
  if (value === "L") return "Laki-laki";
  if (value === "P") return "Perempuan";
  return formatValue(value);
}

function formatStatus(value) {
  if (!value) return "Tidak diketahui";
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getKategoriJabatanName(user) {
  const kategori = user?.kategoriJabatan;
  if (typeof kategori === "string" && kategori.trim()) return kategori;
  if (kategori && typeof kategori === "object") {
    return (
      kategori.nama ??
      kategori.namaKategori ??
      kategori.namaJabatan ??
      kategori.namaKategoriJabatan ??
      "-"
    );
  }
  return "-";
}

function getShiftName(user) {
  const shiftMaster = user?.shiftKerjaMaster;
  if (shiftMaster && typeof shiftMaster === "object") {
    return (
      shiftMaster.nama ??
      shiftMaster.namaShift ??
      shiftMaster.namaShiftKerja ??
      shiftMaster.kode ??
      user?.shiftKerja ??
      "-"
    );
  }
  return user?.shiftKerja || "-";
}

function formatJam(value) {
  if (!value) return "";
  const text = String(value);
  const isoMatch = text.match(/T(\d{2}:\d{2})/);
  if (isoMatch) return isoMatch[1];
  const timeMatch = text.match(/^(\d{1,2}:\d{2})/);
  if (timeMatch) {
    const [hour, minute] = timeMatch[1].split(":");
    return `${hour.padStart(2, "0")}:${minute}`;
  }
  return text;
}

function getShiftTime(user) {
  const shift = user?.shiftKerjaMaster;
  if (!shift || typeof shift !== "object") return "-";
  const start = formatJam(shift.jamMasuk ?? shift.jamMulai ?? shift.waktuMulai);
  const end = formatJam(shift.jamKeluar ?? shift.jamSelesai ?? shift.waktuSelesai);
  if (!start && !end) return "-";
  return `${start || "-"} - ${end || "-"}`;
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 gap-3 border-b theme-border py-3 last:border-b-0">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-card-soft theme-text-secondary">
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide theme-text-muted">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-medium theme-text">
          {formatValue(value)}
        </p>
      </div>
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
      <div className="border-b theme-border px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold theme-text">{title}</h2>
        {description && (
          <p className="mt-1 text-xs theme-text-muted">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-x-6 px-5 py-2 sm:grid-cols-2 sm:px-6">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function DetailUserPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUser = useCallback(async () => {
    if (!id) {
      setUser(null);
      setError("ID pengguna tidak ditemukan.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await getUserById(String(id));
      if (!response?.success || !response?.data) {
        throw new Error(response?.message || "Data pengguna tidak ditemukan.");
      }
      setUser(response.data);
    } catch (err) {
      setUser(null);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const role = String(
    user?.peran?.nama || user?.peran?.namaTampilan || user?.role || ""
  )
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const isGuru = role === "guru";
  const isAktif = String(user?.status || "").toLowerCase() === "aktif";

  const kategoriJabatan = getKategoriJabatanName(user);
  const shiftName = getShiftName(user);
  const shiftTime = getShiftTime(user);

  return (
    <div className="flex h-screen w-full overflow-hidden theme-page">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            {/* BACK */}
            <button
              type="button"
              onClick={() => router.push("/admin/pengguna/kelola-user")}
              className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium theme-text-secondary transition hover:theme-card-soft"
            >
              <ArrowLeft size={17} />
              Kembali ke Kelola User
            </button>

            {/* PAGE HEADER */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide theme-primary-text">
                  Manajemen Pengguna
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                  Detail Pengguna
                </h1>
                <p className="mt-2 text-sm theme-text-muted">
                  Informasi akun, identitas, dan penempatan kerja pengguna SmartSchool.
                </p>
              </div>

              {!loading && user && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/admin/pengguna/kelola-user/${id}/edit`)
                  }
                  className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90"
                >
                  <Pencil size={17} />
                  Edit Pengguna
                </button>
              )}
            </div>

            {/* ERROR */}
            {error && (
              <div
                role="alert"
                className="theme-danger mb-5 flex items-start gap-3 rounded-xl border theme-border p-4 text-sm"
              >
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <div className="flex-1">{error}</div>
                <button
                  type="button"
                  onClick={loadUser}
                  className="inline-flex shrink-0 items-center gap-1 font-semibold"
                >
                  <RefreshCw size={14} />
                  Coba lagi
                </button>
              </div>
            )}

            {/* LOADING */}
            {loading ? (
              <div className="theme-card flex min-h-64 items-center justify-center rounded-2xl border theme-border">
                <Loader2 size={20} className="animate-spin theme-primary-text" />
                <span className="ml-3 text-sm theme-text-muted">
                  Memuat detail pengguna...
                </span>
              </div>
            ) : user ? (
              <div className="space-y-5">
                {/* PROFIL UTAMA */}
                <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                  <div className="h-1.5 bg-[var(--color-primary)]" />

                  <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
                    <div className="theme-primary-soft flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Foto profil pengguna"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound size={36} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="break-words text-xl font-bold theme-text sm:text-2xl">
                        {user.namaLengkap || user.namaPengguna || "Pengguna"}
                      </h2>

                      <p className="mt-1 break-words text-sm theme-text-muted">
                        @{user.namaPengguna || "-"} · {user.email || "-"}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="theme-primary-soft inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                          <ShieldCheck size={14} />
                          {formatRole(user)}
                        </span>

                        <span
                          className={
                            isAktif
                              ? "theme-success inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                              : "theme-danger inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                          }
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {formatStatus(user.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* INFORMASI AKUN */}
                <Section
                  title="Informasi Akun"
                  description="Identitas dasar dan informasi kontak pengguna."
                >
                  <InfoItem icon={UserRound} label="Nama lengkap" value={user.namaLengkap} />
                  <InfoItem icon={UserRound} label="Username" value={user.namaPengguna} />
                  <InfoItem icon={Mail} label="Email" value={user.email} />
                  <InfoItem icon={Phone} label="Nomor telepon" value={user.noTelepon} />
                  <InfoItem icon={ShieldCheck} label="Peran" value={formatRole(user)} />
                  <InfoItem icon={School} label="Sekolah" value={user.sekolah?.nama} />
                </Section>

                {/* IDENTITAS & KEPEGAWAIAN */}
                <Section
                  title="Identitas dan Kepegawaian"
                  description="Data administratif dan penempatan kerja."
                >
                  <InfoItem icon={IdCard} label="NIP" value={user.nip} />
                  <InfoItem icon={IdCard} label="NUPTK" value={user.nuptk} />
                  <InfoItem icon={IdCard} label="NIPD" value={user.nipd} />
                  <InfoItem icon={IdCard} label="NISN" value={user.nisn} />
                  <InfoItem icon={IdCard} label="NIK" value={user.nik} />
                  <InfoItem icon={BriefcaseBusiness} label="Kategori jabatan" value={kategoriJabatan} />
                  <InfoItem icon={BriefcaseBusiness} label="Jabatan pada profil" value={user.jabatan} />
                  <InfoItem icon={BriefcaseBusiness} label="Golongan" value={user.golongan} />

                  {isGuru && (
                    <>
                      <InfoItem icon={Clock3} label="Shift kerja" value={shiftName} />
                      <InfoItem icon={Clock3} label="Jam kerja" value={shiftTime} />
                    </>
                  )}

                  <InfoItem icon={UserRound} label="Jenis kelamin" value={formatJenisKelamin(user.jenisKelamin)} />
                  <InfoItem icon={MapPin} label="Tempat lahir" value={user.tempatLahir} />
                  <InfoItem icon={CalendarDays} label="Tanggal lahir" value={formatDate(user.tanggalLahir)} />
                </Section>

                {/* ALAMAT */}
                <Section title="Alamat" description="Informasi alamat pengguna.">
                  <InfoItem icon={MapPin} label="Alamat" value={user.alamat} />
                  <InfoItem icon={MapPin} label="Alamat domisili" value={user.alamatDomisili} />
                </Section>

                {/* INFORMASI SISTEM */}
                <Section title="Informasi Sistem" description="Waktu pencatatan akun.">
                  <InfoItem icon={CalendarDays} label="Dibuat pada" value={formatDateTime(user.dibuatPada)} />
                  <InfoItem icon={CalendarDays} label="Diperbarui pada" value={formatDateTime(user.diperbaruiPada)} />
                </Section>

                {/* FOOTER ACTION */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/pengguna/kelola-user")}
                    className="theme-card theme-border rounded-xl border px-5 py-2.5 text-sm font-semibold theme-text-secondary transition hover:theme-card-soft"
                  >
                    Kembali ke Daftar
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}