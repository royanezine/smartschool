
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getProfile } from "@/services/user.service";
import {
  Settings,
  Building2,
  UserRound,
  Mail,
  Phone,
  MapPin,
  Globe,
  ShieldCheck,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Hash,
  ExternalLink,
  Info,
} from "lucide-react";


const cardClass =
  "rounded-2xl border border-[var(--color-text)]/10 theme-card shadow-sm";

const labelClass = "text-xs theme-text-muted";
const valueClass = "mt-1 break-words text-sm font-semibold theme-text";

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "Belum tersedia";
  }

  return String(value);
}

function formatDate(value) {
  if (!value) return "Belum tersedia";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Belum tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function getStatus(status) {
  const value = String(status || "").toLowerCase();

  if (["aktif", "active", "true"].includes(value)) {
    return {
      label: status,
      active: true,
    };
  }

  if (["nonaktif", "inactive", "false", "dinonaktifkan"].includes(value)) {
    return {
      label: status,
      active: false,
    };
  }

  return {
    label: formatValue(status),
    active: null,
  };
}

function StatusBadge({ status }) {
  const result = getStatus(status);

  const colorClass =
    result.active === true
      ? "border-[color-mix(in_srgb,var(--color-success)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]"
      : result.active === false
        ? "border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)]"
        : "border-[var(--color-text)]/10 theme-text-secondary";

  return (
    <span
      className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${colorClass}`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          result.active === true
            ? "bg-[var(--color-success)]"
            : result.active === false
              ? "bg-[var(--color-warning)]"
              : "bg-[var(--color-text-muted)]"
        }`}
      />
      <span className="break-words">{result.label}</span>
    </span>
  );
}

function InfoCard({ icon: Icon, label, value, description }) {
  return (
    <div className={`${cardClass} min-w-0 p-4`}>
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
          <Icon size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <p className={labelClass}>{label}</p>
          <p className="mt-1 break-words text-sm font-semibold theme-text">
            {value}
          </p>
          {description ? (
            <p className="mt-1 break-words text-xs theme-text-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3 border-b border-[var(--color-text)]/8 py-3 last:border-b-0">
      <Icon
        size={17}
        className="mt-0.5 shrink-0 theme-text-muted"
      />

      <div className="min-w-0 flex-1">
        <p className={labelClass}>{label}</p>
        <p className={valueClass}>{formatValue(value)}</p>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3 border-b border-[var(--color-text)]/8 px-5 py-4 sm:px-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <h2 className="text-sm font-bold theme-text sm:text-base">
          {title}
        </h2>
        <p className="mt-1 text-xs leading-relaxed theme-text-secondary sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function AdminPengaturanPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await getProfile();

      if (response?.success === false) {
        throw new Error(
          response.message || "Data profil gagal diambil."
        );
      }

      const data = response?.data;

      if (!data || typeof data !== "object") {
        throw new Error(
          "Respons backend tidak berisi data profil yang valid."
        );
      }

      setProfile(data);
    } catch (err) {
      console.error("Gagal mengambil profil pengaturan:", err);
      setError(
        err?.message ||
          "Tidak dapat mengambil data dari server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadProfile]);

  const toggleSidebar = () => {
    setIsCollapsed((previous) => !previous);
  };

  const school = profile?.sekolah || null;
  const role = profile?.peran || null;

  const schoolName = school?.nama || "Data sekolah belum tersedia";
  const userName =
    profile?.namaLengkap ||
    profile?.namaPengguna ||
    "Pengguna";

  return (
    <div className="theme-page flex h-screen w-full min-w-0 overflow-hidden">
      <Sidebar
        active="pengaturan"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: userName,
            email: profile?.email || "",
            avatar: profile?.avatar || userName.slice(0, 2).toUpperCase(),
          }}
        />

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1600px] space-y-6 p-3 sm:p-5 lg:p-7">
            <section className={`${cardClass} relative overflow-hidden`}>
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] blur-3xl" />

              <div className="relative flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
                    <Settings size={23} />
                  </div>

                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs theme-text-muted">
                      <span>Admin Sekolah</span>
                      <span>/</span>
                      <span>Pengaturan Sistem</span>
                    </div>

                    <h1 className="text-xl font-bold theme-text sm:text-2xl">
                      Pengaturan Sistem
                    </h1>

                    <p className="mt-1 max-w-2xl text-xs leading-relaxed theme-text-secondary sm:text-sm">
                      Informasi sekolah dan akun yang sedang login,
                      diambil langsung dari backend SmartSchool.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => loadProfile(true)}
                  disabled={loading || refreshing}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[var(--color-text)]/10 px-4 py-2 text-sm font-semibold theme-text transition hover:bg-[var(--color-text)]/5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={16}
                    className={
                      refreshing ? "animate-spin" : ""
                    }
                  />
                  {refreshing ? "Memuat..." : "Muat Ulang Data"}
                </button>
              </div>
            </section>

            {loading && (
              <section className={`${cardClass} p-10`}>
                <div className="flex flex-col items-center justify-center text-center">
                  <RefreshCw
                    size={28}
                    className="animate-spin text-[var(--color-primary)]"
                  />
                  <p className="mt-4 text-sm font-semibold theme-text">
                    Mengambil data dari server
                  </p>
                  <p className="mt-1 text-xs theme-text-muted">
                    Mohon tunggu sebentar...
                  </p>
                </div>
              </section>
            )}

            {!loading && error && (
              <section className="rounded-2xl border border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_7%,transparent)] p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={21}
                    className="mt-0.5 shrink-0 text-[var(--color-warning)]"
                  />

                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold theme-text">
                      Data gagal dimuat
                    </h2>
                    <p className="mt-1 break-words text-sm theme-text-secondary">
                      {error}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed theme-text-muted">
                      Pastikan backend berjalan, token login masih
                      valid, dan NEXT_PUBLIC_API_URL mengarah ke server
                      yang benar.
                    </p>

                    <button
                      type="button"
                      onClick={() => loadProfile(true)}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                      <RefreshCw size={15} />
                      Coba Lagi
                    </button>
                  </div>
                </div>
              </section>
            )}

            {!loading && !error && profile && (
              <>
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <InfoCard
                    icon={Building2}
                    label="Nama Sekolah"
                    value={schoolName}
                    description="Data dari relasi sekolah"
                  />

                  <InfoCard
                    icon={UserRound}
                    label="Pengguna Login"
                    value={userName}
                    description={profile.email || "Email tidak tersedia"}
                  />

                  <InfoCard
                    icon={ShieldCheck}
                    label="Peran Pengguna"
                    value={
                      role?.namaTampilan ||
                      role?.nama ||
                      profile.jabatan ||
                      "Belum ditetapkan"
                    }
                    description="Peran dari backend"
                  />

                  <InfoCard
                    icon={CheckCircle2}
                    label="Status Akun"
                    value={formatValue(profile.status)}
                    description="Status akun pengguna"
                  />
                </section>

                <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
                  <section className={`${cardClass} min-w-0 overflow-hidden`}>
                    <SectionHeader
                      icon={Building2}
                      title="Informasi Sekolah"
                      description="Informasi sekolah berdasarkan data yang dikirim backend."
                    />

                    <div className="p-5 sm:p-6">
                      {school ? (
                        <>
                          <div className="mb-5 flex items-center gap-3">
                            {school.logoBesarUrl ||
                            school.logoKecilUrl ? (
                              <img
                                src={
                                  school.logoBesarUrl ||
                                  school.logoKecilUrl
                                }
                                alt={`Logo ${school.nama || "sekolah"}`}
                                className="h-14 w-14 shrink-0 rounded-xl border border-[var(--color-text)]/10 bg-white object-contain p-1"
                              />
                            ) : (
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                                <Building2 size={25} />
                              </div>
                            )}

                            <div className="min-w-0">
                              <h3 className="break-words text-base font-bold theme-text">
                                {formatValue(school.nama)}
                              </h3>
                              <div className="mt-2">
                                <StatusBadge status={school.status} />
                              </div>
                            </div>
                          </div>

                          <DetailRow
                            icon={Hash}
                            label="Kode Sekolah"
                            value={school.kode}
                          />

                          <DetailRow
                            icon={Globe}
                            label="Subdomain"
                            value={school.subdomain}
                          />

                          <DetailRow
                            icon={MapPin}
                            label="Alamat Sekolah"
                            value={school.alamat}
                          />

                          <DetailRow
                            icon={Phone}
                            label="Telepon Sekolah"
                            value={school.telepon}
                          />

                          <DetailRow
                            icon={Mail}
                            label="Email Sekolah"
                            value={school.email}
                          />
                        </>
                      ) : (
                        <EmptyState message="Backend tidak mengirim relasi sekolah untuk akun ini." />
                      )}
                    </div>
                  </section>

                  <section className={`${cardClass} min-w-0 overflow-hidden`}>
                    <SectionHeader
                      icon={UserRound}
                      title="Informasi Akun"
                      description="Identitas pengguna yang sedang login."
                    />

                    <div className="p-5 sm:p-6">
                      <div className="mb-5 flex items-center gap-3">
                        {profile.avatar ? (
                          <img
                            src={profile.avatar}
                            alt={userName}
                            className="h-14 w-14 shrink-0 rounded-full border border-[var(--color-text)]/10 object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-lg font-bold text-[var(--color-primary)]">
                            {userName.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="break-words text-base font-bold theme-text">
                            {userName}
                          </h3>
                          <p className="mt-1 break-words text-xs theme-text-secondary">
                            {formatValue(profile.namaPengguna)}
                          </p>
                        </div>
                      </div>

                      <DetailRow
                        icon={Mail}
                        label="Email"
                        value={profile.email}
                      />

                      <DetailRow
                        icon={Phone}
                        label="Nomor Telepon"
                        value={profile.noTelepon}
                      />

                      <DetailRow
                        icon={ShieldCheck}
                        label="Jabatan"
                        value={profile.jabatan}
                      />

                      <DetailRow
                        icon={Hash}
                        label="NIP"
                        value={profile.nip}
                      />

                      <DetailRow
                        icon={Hash}
                        label="NIPD"
                        value={profile.nipd}
                      />

                      <DetailRow
                        icon={Clock3}
                        label="Terakhir Login"
                        value={formatDate(profile.terakhirLogin)}
                      />
                    </div>
                  </section>

                  <section className={`${cardClass} min-w-0 overflow-hidden`}>
                    <SectionHeader
                      icon={ShieldCheck}
                      title="Informasi Peran"
                      description="Peran yang diberikan kepada akun ini oleh sistem."
                    />

                    <div className="p-5 sm:p-6">
                      {role ? (
                        <>
                          <div className="rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-text)]/[0.03] p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className={labelClass}>
                                  Nama Peran
                                </p>
                                <h3 className="mt-1 break-words text-base font-bold theme-text">
                                  {formatValue(
                                    role.namaTampilan || role.nama
                                  )}
                                </h3>
                              </div>

                              <StatusBadge status={role.status} />
                            </div>

                            <p className="mt-3 break-words text-sm leading-relaxed theme-text-secondary">
                              {formatValue(role.deskripsi)}
                            </p>
                          </div>

                          <div className="mt-4">
                            <DetailRow
                              icon={Hash}
                              label="ID Peran"
                              value={role.id}
                            />

                            <DetailRow
                              icon={ShieldCheck}
                              label="Nama Internal"
                              value={role.nama}
                            />
                          </div>

                          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--color-text)]/10 p-3">
                            <Info
                              size={17}
                              className="mt-0.5 shrink-0 theme-text-muted"
                            />
                            <p className="text-xs leading-relaxed theme-text-secondary">
                              Informasi ini menunjukkan peran akun
                              yang sedang login. Daftar seluruh role
                              dan perubahan hak akses memerlukan
                              endpoint manajemen role tersendiri.
                            </p>
                          </div>
                        </>
                      ) : (
                        <EmptyState message="Data peran tidak tersedia pada respons backend." />
                      )}
                    </div>
                  </section>

                  <section className={`${cardClass} min-w-0 overflow-hidden`}>
                    <SectionHeader
                      icon={CalendarDays}
                      title="Tahun Ajaran"
                      description="Status integrasi data akademik."
                    />

                    <div className="p-5 sm:p-6">
                      <div className="rounded-xl border border-[var(--color-text)]/10 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                            <CalendarDays size={19} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold theme-text">
                              Data tahun ajaran belum dimuat
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed theme-text-secondary">
                              Endpoint profil pengguna tidak
                              mengembalikan tahun ajaran aktif.
                              Bagian ini perlu dihubungkan dengan
                              endpoint tahun ajaran yang digunakan
                              backend proyekmu.
                            </p>
                          </div>
                        </div>

                        <Link
                          href="/admin/akademik/tahun-ajaran"
                          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline"
                        >
                          Buka menu Tahun Ajaran
                          <ExternalLink size={15} />
                        </Link>
                      </div>
                    </div>
                  </section>
                </div>

                <section className={`${cardClass} p-5 sm:p-6`}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]">
                      <CheckCircle2 size={20} />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-sm font-bold theme-text">
                        Data berhasil dimuat dari backend
                      </h2>
                      <p className="mt-1 text-xs leading-relaxed theme-text-secondary">
                        Data yang tampil pada bagian profil, sekolah,
                        dan peran berasal dari respons API. Halaman ini
                        belum mengubah konfigurasi sekolah, tahun
                        ajaran, notifikasi, ataupun hak akses.
                      </p>
                    </div>
                  </div>
                </section>
              </>
            )}

            <footer className="border-t border-[var(--color-text)]/10 py-4 text-center">
              <p className="text-xs theme-text-muted">
                SmartSchool · Pengaturan Admin Sekolah
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-text)]/15 p-5 text-center">
      <Info
        size={22}
        className="mx-auto theme-text-muted"
      />
      <p className="mt-2 text-sm theme-text-secondary">
        {message}
      </p>
    </div>
  );
}
