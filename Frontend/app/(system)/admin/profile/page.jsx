
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Building2,
  FileText,
  Settings,
  Edit,
  Camera,
  Shield,
  Activity,
  CheckCircle,
  LogOut,
  School,
  RefreshCw,
  AlertCircle,
  LoaderCircle,
  UserCircle,
  BadgeCheck,
  ChevronRight,
} from "lucide-react";

const PROFILE_ENDPOINT = "/api/users/profile";

function formatDate(value, withTime = false) {
  if (!value) return "Belum tersedia";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Belum tersedia";

  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime
      ? { hour: "2-digit", minute: "2-digit" }
      : {}),
  });
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "Belum tersedia";
  }

  return String(value);
}

function getInitials(name) {
  if (!name || typeof name !== "string") return "—";

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function normalizeProfile(response) {
  const user = response?.data;

  if (!response?.success || !user || !user.id) {
    throw new Error(
      response?.message || "Data profil tidak ditemukan."
    );
  }

  return user;
}

function InfoItem({ icon: Icon, label, value, className = "" }) {
  return (
    <div className={`flex min-w-0 items-start gap-3 ${className}`}>
      <Icon
        size={17}
        className="theme-text-muted mt-0.5 shrink-0"
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <p className="theme-text-secondary text-xs font-medium">
          {label}
        </p>
        <p className="theme-text mt-1 break-words text-sm font-medium">
          {displayValue(value)}
        </p>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="theme-card theme-border flex min-w-0 items-center gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-md"
    >
      <div className="theme-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="theme-text text-sm font-semibold">{label}</p>
        <p className="theme-text-secondary mt-1 text-xs">
          {description}
        </p>
      </div>

      <ChevronRight
        size={16}
        className="theme-text-muted shrink-0"
      />
    </button>
  );
}

function ProfileLoading() {
  return (
    <div className="theme-page flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <LoaderCircle
          size={32}
          className="animate-spin text-blue-600"
        />
        <p className="theme-text-secondary text-sm">
          Memuat data profil...
        </p>
      </div>
    </div>
  );
}

export default function AdminProfilePage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await apiFetch(PROFILE_ENDPOINT);
        const user = normalizeProfile(response);

        setProfile(user);
      } catch (err) {
        console.error("Gagal mengambil profil:", err);

        setError(
          err?.message || "Gagal mengambil data profil dari server."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    if (!window.confirm("Yakin ingin logout?")) return;

    import("@/lib/auth")
      .then(({ clearSession }) => {
        clearSession();
        router.replace("/login");
      })
      .catch((err) => {
        console.error("Gagal membersihkan sesi:", err);
        router.replace("/login");
      });
  };

  if (loading) {
    return <ProfileLoading />;
  }

  const nama =
    profile?.namaLengkap || profile?.namaPengguna || "Pengguna";

  const peran = profile?.peran;
  const sekolah = profile?.sekolah;

  const roleName =
    peran?.namaTampilan || peran?.nama || "Belum tersedia";

  const avatarUrl =
    typeof profile?.avatar === "string" &&
    /^https?:\/\//i.test(profile.avatar)
      ? profile.avatar
      : "";

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="profile"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setIsCollapsed((value) => !value)}
          notifications={[]}
          user={{
            name: nama,
            email: profile?.email || "",
            avatar: avatarUrl || getInitials(nama),
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] space-y-5 p-4 sm:p-6 lg:p-8">
            <section className="theme-card theme-border flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                  <UserCircle size={25} />
                </div>

                <div className="min-w-0">
                  <h1 className="theme-text text-xl font-semibold sm:text-2xl">
                    Profil Admin
                  </h1>
                  <p className="theme-text-secondary mt-1 text-sm">
                    Informasi akun yang sedang login
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={refreshing}
                  onClick={() => fetchProfile(true)}
                  className="theme-card theme-border theme-text-secondary inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium hover:bg-black/5 disabled:opacity-60"
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Muat Ulang
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/admin/profile/edit")}
                  className="theme-card theme-border theme-text-secondary inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium hover:bg-black/5"
                >
                  <Edit size={16} />
                  Edit Profil
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/admin/settings")}
                  className="theme-primary inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold hover:opacity-90"
                >
                  <Settings size={16} />
                  Pengaturan
                </button>
              </div>
            </section>

            {error && (
              <section className="theme-card theme-border rounded-2xl border p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <div className="min-w-0 flex-1">
                    <h2 className="theme-text text-sm font-semibold">
                      Profil gagal dimuat
                    </h2>
                    <p className="theme-text-secondary mt-1 break-words text-sm">
                      {error}
                    </p>
                    <button
                      type="button"
                      onClick={() => fetchProfile(true)}
                      className="mt-3 text-sm font-semibold text-blue-600"
                    >
                      Coba lagi
                    </button>
                  </div>
                </div>
              </section>
            )}

            {profile && (
              <>
                <section className="theme-card theme-border overflow-hidden rounded-2xl border">
                  <div
                    className="h-24 sm:h-32"
                    style={{
                      background:
                        "linear-gradient(110deg, var(--color-primary), #3b82f6)",
                    }}
                  />

                  <div className="relative -mt-12 p-5 sm:p-7">
                    <div className="flex flex-col gap-6 lg:flex-row">
                      <div className="flex flex-col items-center gap-3 lg:w-52 lg:shrink-0">
                        <div className="relative">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={`Foto profil ${nama}`}
                              className="h-28 w-28 rounded-2xl border-4 border-[var(--color-card)] object-cover shadow-md sm:h-32 sm:w-32"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="theme-primary flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-[var(--color-card)] text-4xl font-bold shadow-md sm:h-32 sm:w-32">
                              {getInitials(nama)}
                            </div>
                          )}

                          <button
                            type="button"
                            title="Edit foto profil"
                            onClick={() =>
                              router.push("/admin/profile/edit")
                            }
                            className="theme-card theme-border theme-text-muted absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm hover:bg-black/5"
                          >
                            <Camera size={16} />
                          </button>
                        </div>

                        <div className="text-center">
                          <h2 className="theme-text break-words text-base font-semibold">
                            {nama}
                          </h2>
                          <p className="theme-text-secondary mt-1 text-sm">
                            {displayValue(profile.jabatan)}
                          </p>

                          <span className="theme-success mt-3 inline-flex items-center gap-1.5 rounded-full border border-current/20 px-3 py-1 text-xs font-medium">
                            <CheckCircle size={13} />
                            {displayValue(profile.status)}
                          </span>
                        </div>

                        <div className="theme-primary inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-semibold">
                          <Shield size={13} />
                          {roleName}
                        </div>
                      </div>

                      <div className="theme-border min-w-0 flex-1 border-t pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-1">
                        <h2 className="theme-text mb-5 text-sm font-semibold">
                          Informasi Pribadi
                        </h2>

                        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                          <InfoItem
                            icon={User}
                            label="Nama Lengkap"
                            value={profile.namaLengkap}
                          />

                          <InfoItem
                            icon={Mail}
                            label="Email"
                            value={profile.email}
                          />

                          <InfoItem
                            icon={UserCircle}
                            label="Username"
                            value={profile.namaPengguna}
                          />

                          <InfoItem
                            icon={Phone}
                            label="Nomor Telepon"
                            value={profile.noTelepon}
                          />

                          <InfoItem
                            icon={Shield}
                            label="Role"
                            value={roleName}
                          />

                          <InfoItem
                            icon={CheckCircle}
                            label="Status Akun"
                            value={profile.status}
                          />

                          <InfoItem
                            icon={MapPin}
                            label="Tempat Lahir"
                            value={profile.tempatLahir}
                          />

                          <InfoItem
                            icon={Calendar}
                            label="Tanggal Lahir"
                            value={formatDate(profile.tanggalLahir)}
                          />

                          <InfoItem
                            icon={MapPin}
                            label="Alamat"
                            value={profile.alamat}
                            className="sm:col-span-2"
                          />

                          <InfoItem
                            icon={MapPin}
                            label="Alamat Domisili"
                            value={profile.alamatDomisili}
                            className="sm:col-span-2"
                          />

                          <InfoItem
                            icon={FileText}
                            label="NIP"
                            value={profile.nip}
                          />

                          <InfoItem
                            icon={FileText}
                            label="NUPTK"
                            value={profile.nuptk}
                          />

                          <InfoItem
                            icon={Calendar}
                            label="Tanggal Bergabung"
                            value={formatDate(profile.dibuatPada)}
                          />

                          <InfoItem
                            icon={Clock}
                            label="Terakhir Login"
                            value={formatDate(profile.terakhirLogin, true)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="theme-card theme-border rounded-2xl border p-5 sm:p-6">
                  <h2 className="theme-text mb-5 flex items-center gap-2 text-sm font-semibold">
                    <Building2 size={18} />
                    Informasi Sekolah
                  </h2>

                  {sekolah ? (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                      <InfoItem
                        icon={School}
                        label="Nama Sekolah"
                        value={sekolah.nama}
                      />

                      <InfoItem
                        icon={FileText}
                        label="Kode Sekolah"
                        value={sekolah.kode}
                      />

                      <InfoItem
                        icon={Mail}
                        label="Email Sekolah"
                        value={sekolah.email}
                      />

                      <InfoItem
                        icon={Phone}
                        label="Telepon Sekolah"
                        value={sekolah.telepon}
                      />

                      <InfoItem
                        icon={MapPin}
                        label="Alamat Sekolah"
                        value={sekolah.alamat}
                        className="sm:col-span-2"
                      />

                      <InfoItem
                        icon={Building2}
                        label="Subdomain"
                        value={sekolah.subdomain}
                      />

                      <InfoItem
                        icon={CheckCircle}
                        label="Status Sekolah"
                        value={sekolah.status}
                      />
                    </div>
                  ) : (
                    <p className="theme-text-secondary text-sm">
                      Tidak ada data sekolah pada akun ini.
                    </p>
                  )}
                </section>

                <section className="theme-card theme-border rounded-2xl border p-5 sm:p-6">
                  <h2 className="theme-text mb-5 flex items-center gap-2 text-sm font-semibold">
                    <BadgeCheck size={18} />
                    Informasi Peran
                  </h2>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    <InfoItem
                      icon={Shield}
                      label="Nama Peran"
                      value={peran?.nama}
                    />

                    <InfoItem
                      icon={UserCircle}
                      label="Nama Tampilan"
                      value={peran?.namaTampilan}
                    />

                    <InfoItem
                      icon={Activity}
                      label="Deskripsi Peran"
                      value={peran?.deskripsi}
                      className="sm:col-span-2"
                    />
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="theme-card theme-border rounded-2xl border p-5">
                    <div className="theme-primary mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                      <Calendar size={19} />
                    </div>
                    <p className="theme-text-secondary text-xs">
                      Tanggal Bergabung
                    </p>
                    <p className="theme-text mt-2 text-sm font-semibold">
                      {formatDate(profile.dibuatPada)}
                    </p>
                  </div>

                  <div className="theme-card theme-border rounded-2xl border p-5">
                    <div className="theme-primary mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                      <Clock size={19} />
                    </div>
                    <p className="theme-text-secondary text-xs">
                      Terakhir Login
                    </p>
                    <p className="theme-text mt-2 text-sm font-semibold">
                      {formatDate(profile.terakhirLogin, true)}
                    </p>
                  </div>

                  <div className="theme-card theme-border rounded-2xl border p-5">
                    <div className="theme-primary mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                      <Shield size={19} />
                    </div>
                    <p className="theme-text-secondary text-xs">
                      Status Akun
                    </p>
                    <p className="theme-text mt-2 text-sm font-semibold">
                      {displayValue(profile.status)}
                    </p>
                  </div>
                </section>
              </>
            )}

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <QuickAction
                icon={Edit}
                label="Edit Profil"
                description="Perbarui informasi pribadi"
                onClick={() => router.push("/admin/profile/edit")}
              />

              <QuickAction
                icon={Settings}
                label="Pengaturan"
                description="Kelola pengaturan akun"
                onClick={() => router.push("/admin/settings")}
              />

              <QuickAction
                icon={LogOut}
                label="Logout"
                description="Keluar dari akun"
                onClick={handleLogout}
              />
            </section>

            <footer className="theme-border border-t py-4 text-center">
              <p className="theme-text-muted text-xs">
                SmartSchool • Profil Admin
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
