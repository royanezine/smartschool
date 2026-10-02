"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Users,
  Clock,
  Edit,
  UserRound,
  BriefcaseBusiness,
  GraduationCap,
  Hash,
  CheckCircle2,
  UserCheck,
  School,
} from "lucide-react";

import { getUsers } from "../../../../../services/user.service";

// =========================================================
// INITIALS
// =========================================================

const getInitials = (nama = "") => {
  const parts = String(nama)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return String(nama).substring(0, 2).toUpperCase();
};

// =========================================================
// AVATAR COLOR
// =========================================================

const getAvatarColor = (nama = "") => {
  const colors = [
    "bg-blue-700",
    "bg-slate-700",
    "bg-indigo-700",
    "bg-cyan-700",
    "bg-teal-700",
    "bg-violet-700",
    "bg-sky-700",
    "bg-blue-800",
  ];

  return colors[String(nama).length % colors.length];
};

// =========================================================
// FORMAT DATE
// =========================================================

const formatDate = (value) => {
  if (!value || value === "-") {
    return "-";
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return value;
  }
};

// =========================================================
// INFO ITEM
// =========================================================

function InfoItem({
  icon: Icon,
  label,
  value,
  iconClass = "theme-text-muted",
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg theme-card-soft ${iconClass}`}
      >
        <Icon size={17} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-medium theme-text-muted">
          {label}
        </p>

        <p className="break-words text-sm font-semibold leading-5 theme-text sm:text-[15px]">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  icon: Icon,
  value,
  label,
  description,
  iconClass = "text-[var(--color-primary)]",
  valueClass = "theme-text",
}) {
  return (
    <div className="rounded-xl border theme-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={`text-2xl font-bold tracking-tight sm:text-3xl ${valueClass}`}
          >
            {value}
          </p>

          <p className="mt-1 truncate text-sm font-semibold theme-text-secondary">
            {label}
          </p>

          {description && (
            <p className="mt-1 break-words text-xs theme-text-muted">
              {description}
            </p>
          )}
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border theme-card-soft">
          <Icon
            size={19}
            className={iconClass}
            strokeWidth={1.8}
          />
        </div>
      </div>
    </div>
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function DetailGuruPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [guru, setGuru] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =======================================================
  // GET DATA FROM BACKEND
  // =======================================================

  useEffect(() => {
    let mounted = true;

    const fetchGuru = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getUsers({
          page: 1,
          limit: 100,
          role: "guru",
        });

        if (!mounted) {
          return;
        }

        console.log("Response data guru:", response);

        const users =
          response?.data?.data ||
          response?.data?.users ||
          response?.data?.items ||
          response?.data ||
          response?.users ||
          response?.items ||
          [];

        const list = Array.isArray(users)
          ? users
          : [];

        const found = list.find(
          (item) =>
            String(item.id) === String(id)
        );

        if (!found) {
          setError("Data guru tidak ditemukan.");
          return;
        }

        setGuru(found);
      } catch (err) {
        console.error(
          "Gagal mengambil detail guru:",
          err
        );

        if (!mounted) {
          return;
        }

        setError(
          err?.message ||
            "Gagal mengambil data guru dari backend."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchGuru();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="flex min-h-screen w-full theme-page">
        <Sidebar
          active="guru"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            toggleSidebar={() =>
              setIsCollapsed((prev) => !prev)
            }
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full theme-info">
                <UserRound size={22} />
              </div>

              <p className="mt-4 text-sm font-medium theme-text-secondary">
                Memuat data guru...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error || !guru) {
    return (
      <div className="flex min-h-screen w-full theme-page">
        <Sidebar
          active="guru"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            toggleSidebar={() =>
              setIsCollapsed((prev) => !prev)
            }
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex flex-1 items-center justify-center overflow-y-auto px-6">
            <div className="w-full max-w-md rounded-xl border theme-card p-8 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full theme-danger">
                <UserRound size={22} />
              </div>

              <h1 className="mt-4 text-lg font-bold theme-text">
                Data Guru Tidak Ditemukan
              </h1>

              <p className="mt-2 text-sm leading-6 theme-text-muted">
                {error ||
                  "Data guru tidak tersedia."}
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/admin/guru")
                }
                className="mt-5 inline-flex items-center gap-2 rounded-lg theme-primary px-4 py-2.5 text-sm font-semibold transition"
              >
                <ArrowLeft size={16} />
                Kembali ke Daftar Guru
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =======================================================
  // NORMALIZE DATA BACKEND
  // =======================================================

  const nama =
    guru.nama ||
    guru.namaLengkap ||
    guru.name ||
    "-";

  const email =
    guru.email ||
    "-";

  const phone =
    guru.phone ||
    guru.noTelepon ||
    guru.nomorTelepon ||
    guru.telepon ||
    "-";

  const gender =
    guru.gender ||
    guru.jenisKelamin ||
    guru.jenis_kelamin ||
    "";

  const tglLahir =
    guru.tglLahir ||
    guru.tanggalLahir ||
    guru.tanggal_lahir ||
    "-";

  const nip =
    guru.nip ||
    guru.NIP ||
    "-";

  const mapel =
    guru.mapel?.nama ||
    guru.mapel ||
    guru.mataPelajaran?.nama ||
    guru.mataPelajaran ||
    "Mata pelajaran belum diatur";

  const status =
    guru.status ||
    guru.statusPengguna ||
    "-";

  const alamat =
    guru.alamat ||
    guru.alamatLengkap ||
    "-";

  const joinDate =
    guru.joinDate ||
    guru.tanggalBergabung ||
    guru.tanggalMasuk ||
    guru.createdAt ||
    "-";

  const kelasDiampu =
    guru.kelasDiampu ??
    guru.totalKelas ??
    guru.jumlahKelas ??
    "-";

  const totalSiswa =
    guru.totalSiswa ??
    guru.jumlahSiswa ??
    "-";

  const rataKehadiran =
    guru.rataRataKehadiran ??
    guru.persentaseKehadiran ??
    "-";

  const isActive =
    String(status).toLowerCase() === "aktif";

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="flex min-h-screen w-full min-w-0 theme-page">

      {/* SIDEBAR */}
      <div className="shrink-0">
        <Sidebar
          active="guru"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      {/* MAIN WRAPPER */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* HEADER */}
        <Header
          toggleSidebar={() =>
            setIsCollapsed((prev) => !prev)
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* CONTENT */}
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-3 py-4 sm:px-5 sm:py-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
            <div className="w-full space-y-5">

              {/* PAGE HEADER */}
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="min-w-0">
                  <button
                    onClick={() =>
                      router.back()
                    }
                    className="inline-flex max-w-full items-center gap-2 text-sm font-medium theme-text-muted transition hover:text-[var(--color-primary)]"
                  >
                    <ArrowLeft
                      size={17}
                      strokeWidth={1.8}
                      className="shrink-0"
                    />

                    <span className="truncate">
                      Kembali ke Daftar Guru
                    </span>
                  </button>

                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]">
                      Data Guru
                    </p>

                    <h1 className="mt-1 text-xl font-bold tracking-tight theme-text sm:text-2xl">
                      Detail Profil Guru
                    </h1>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      `/admin/guru/edit/${guru.id}`
                    )
                  }
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border theme-card px-4 py-2.5 text-sm font-semibold theme-text-secondary shadow-sm transition theme-sidebar-hover hover:text-[var(--color-primary)] sm:w-auto"
                >
                  <Edit
                    size={16}
                    strokeWidth={1.9}
                  />

                  Edit Profil
                </button>
              </div>

              {/* PROFILE CARD */}
              <section className="w-full overflow-hidden rounded-xl border theme-card shadow-sm">
                <div className="h-1 bg-[var(--color-primary)]" />

                <div className="p-4 sm:p-6 lg:p-7 xl:p-8">
                  <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    {/* IDENTITY */}
                    <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">

                      {/* AVATAR */}
                      <div
                        className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-xl ${getAvatarColor(
                          nama
                        )} text-2xl font-bold text-white shadow-sm sm:h-24 sm:w-24 sm:text-3xl`}
                      >
                        {getInitials(nama)}
                      </div>

                      {/* IDENTITY */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-md theme-card-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide theme-text-secondary">
                            Guru
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${
                              isActive
                                ? "theme-success"
                                : "theme-danger"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                isActive
                                  ? "bg-[var(--color-success)]"
                                  : "bg-[var(--color-danger)]"
                              }`}
                            />

                            {status}
                          </span>
                        </div>

                        <h2 className="mt-2 break-words text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                          {nama}
                        </h2>

                        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm theme-text-muted">

                          <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
                            <Hash
                              size={15}
                              className="shrink-0 theme-text-placeholder"
                            />

                            <span className="break-all">
                              {nip}
                            </span>
                          </span>

                          <span className="hidden h-4 w-px bg-[var(--color-border)] sm:block" />

                          <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
                            <BookOpen
                              size={15}
                              className="shrink-0 theme-text-placeholder"
                            />

                            <span className="break-words">
                              {mapel}
                            </span>
                          </span>

                        </div>
                      </div>
                    </div>

                    {/* JOIN DATE */}
                    <div className="shrink-0 border-t theme-border pt-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                      <p className="text-xs font-medium uppercase tracking-wide theme-text-muted">
                        Bergabung Sejak
                      </p>

                      <div className="mt-1.5 flex items-center gap-2">
                        <Calendar
                          size={17}
                          className="shrink-0 text-[var(--color-primary)]"
                          strokeWidth={1.8}
                        />

                        <span className="text-sm font-semibold theme-text">
                          {formatDate(joinDate)}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* DIVIDER */}
                  <div className="my-6 border-t theme-border" />

                  {/* BASIC INFORMATION */}
                  <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                    <InfoItem
                      icon={Mail}
                      label="Email"
                      value={email}
                      iconClass="text-[var(--color-primary)]"
                    />

                    <InfoItem
                      icon={Phone}
                      label="Nomor Telepon"
                      value={phone}
                      iconClass="text-[var(--color-primary)]"
                    />

                    <InfoItem
                      icon={UserRound}
                      label="Jenis Kelamin"
                      value={
                        gender === "L"
                          ? "Laki-laki"
                          : gender === "P"
                          ? "Perempuan"
                          : gender || "-"
                      }
                      iconClass="text-[var(--color-primary)]"
                    />

                    <InfoItem
                      icon={Calendar}
                      label="Tanggal Lahir"
                      value={formatDate(tglLahir)}
                      iconClass="text-[var(--color-primary)]"
                    />

                  </div>
                </div>
              </section>

              {/* MAIN GRID */}
              <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.75fr)_minmax(280px,0.75fr)] xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.72fr)] 2xl:grid-cols-[minmax(0,2fr)_minmax(320px,0.7fr)]">

                {/* LEFT COLUMN */}
                <div className="min-w-0 space-y-5">

                  {/* DATA KEPEGAWAIAN */}
                  <section className="w-full rounded-xl border theme-card shadow-sm">
                    <div className="border-b theme-border px-4 py-4 sm:px-6">
                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-info">
                          <BriefcaseBusiness
                            size={18}
                            className="text-[var(--color-info)]"
                            strokeWidth={1.8}
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold theme-text">
                            Informasi Kepegawaian
                          </h3>

                          <p className="mt-0.5 text-xs theme-text-muted">
                            Informasi penugasan dan status guru
                          </p>
                        </div>

                      </div>
                    </div>

                    <div className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-5 p-4 sm:grid-cols-2 sm:p-6">

                      <InfoItem
                        icon={Hash}
                        label="NIP"
                        value={nip}
                      />

                      <InfoItem
                        icon={BookOpen}
                        label="Mata Pelajaran"
                        value={mapel}
                      />

                      <InfoItem
                        icon={UserCheck}
                        label="Status Kepegawaian"
                        value={status}
                      />

                      <InfoItem
                        icon={Clock}
                        label="Tanggal Bergabung"
                        value={formatDate(joinDate)}
                      />

                    </div>
                  </section>

                  {/* ALAMAT */}
                  <section className="w-full rounded-xl border theme-card shadow-sm">
                    <div className="border-b theme-border px-4 py-4 sm:px-6">
                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-info">
                          <MapPin
                            size={18}
                            className="text-[var(--color-info)]"
                            strokeWidth={1.8}
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold theme-text">
                            Alamat
                          </h3>

                          <p className="mt-0.5 text-xs theme-text-muted">
                            Informasi alamat tempat tinggal guru
                          </p>
                        </div>

                      </div>
                    </div>

                    <div className="p-4 sm:p-6">
                      <div className="w-full rounded-lg border theme-card-soft p-4">
                        <p className="text-xs font-medium theme-text-muted">
                          Alamat Lengkap
                        </p>

                        <p className="mt-2 break-words text-sm font-semibold leading-6 theme-text sm:text-[15px]">
                          {alamat}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* INFORMASI PRIBADI */}
                  <section className="w-full rounded-xl border theme-card shadow-sm">
                    <div className="border-b theme-border px-4 py-4 sm:px-6">
                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-info">
                          <Users
                            size={18}
                            className="text-[var(--color-info)]"
                            strokeWidth={1.8}
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold theme-text">
                            Informasi Pribadi
                          </h3>

                          <p className="mt-0.5 text-xs theme-text-muted">
                            Informasi dasar profil guru
                          </p>
                        </div>

                      </div>
                    </div>

                    <div className="grid min-w-0 grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-6">

                      <InfoItem
                        icon={UserRound}
                        label="Nama Lengkap"
                        value={nama}
                      />

                      <InfoItem
                        icon={UserRound}
                        label="Jenis Kelamin"
                        value={
                          gender === "L"
                            ? "Laki-laki"
                            : gender === "P"
                            ? "Perempuan"
                            : gender || "-"
                        }
                      />

                      <InfoItem
                        icon={Calendar}
                        label="Tanggal Lahir"
                        value={formatDate(tglLahir)}
                      />

                      <InfoItem
                        icon={Phone}
                        label="Nomor Telepon"
                        value={phone}
                      />

                    </div>
                  </section>

                </div>

                {/* RIGHT COLUMN */}
                <aside className="min-w-0 space-y-5">

                  {/* STATISTIK */}
                  <section className="w-full rounded-xl border theme-card shadow-sm">
                    <div className="border-b theme-border px-4 py-4 sm:px-5">
                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-info">
                          <GraduationCap
                            size={18}
                            className="text-[var(--color-info)]"
                            strokeWidth={1.8}
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold theme-text">
                            Statistik Mengajar
                          </h3>

                          <p className="mt-0.5 text-xs theme-text-muted">
                            Ringkasan aktivitas mengajar
                          </p>
                        </div>

                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 p-4">

                      <StatCard
                        icon={School}
                        value={kelasDiampu}
                        label="Kelas Diampu"
                        description="Kelas yang ditangani"
                        iconClass="text-[var(--color-primary)]"
                      />

                      <StatCard
                        icon={Users}
                        value={totalSiswa}
                        label="Total Siswa"
                        description="Siswa yang diajar"
                        iconClass="text-[var(--color-info)]"
                      />

                      <StatCard
                        icon={CheckCircle2}
                        value={rataKehadiran}
                        label="Rata-rata Kehadiran"
                        description="Kehadiran mengajar"
                        iconClass="text-[var(--color-success)]"
                        valueClass="text-[var(--color-success)]"
                      />

                    </div>
                  </section>

                  {/* STATUS */}
                  <section className="w-full rounded-xl border theme-card shadow-sm">
                    <div className="border-b theme-border px-4 py-4 sm:px-5">
                      <h3 className="text-sm font-bold theme-text">
                        Status Profil
                      </h3>

                      <p className="mt-0.5 text-xs theme-text-muted">
                        Status data guru saat ini
                      </p>
                    </div>

                    <div className="p-4 sm:p-5">
                      <div
                        className={`flex min-w-0 items-start gap-3 rounded-lg border p-4 ${
                          isActive
                            ? "theme-success"
                            : "theme-danger"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg theme-card ${
                            isActive
                              ? "text-[var(--color-success)]"
                              : "text-[var(--color-danger)]"
                          }`}
                        >
                          {isActive ? (
                            <CheckCircle2 size={17} />
                          ) : (
                            <Clock size={17} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p
                            className={`text-sm font-bold ${
                              isActive
                                ? "text-[var(--color-success)]"
                                : "text-[var(--color-danger)]"
                            }`}
                          >
                            {isActive
                              ? "Profil Aktif"
                              : "Profil Nonaktif"}
                          </p>

                          <p
                            className={`mt-1 break-words text-xs leading-5 ${
                              isActive
                                ? "text-[var(--color-success)]"
                                : "text-[var(--color-danger)]"
                            }`}
                          >
                            {isActive
                              ? "Guru terdaftar sebagai tenaga pendidik aktif."
                              : "Guru saat ini berstatus nonaktif."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* SUBJECT */}
                  <section className="w-full rounded-xl border theme-card shadow-sm">
                    <div className="border-b theme-border px-4 py-4 sm:px-5">
                      <h3 className="text-sm font-bold theme-text">
                        Mata Pelajaran
                      </h3>

                      <p className="mt-0.5 text-xs theme-text-muted">
                        Bidang pengajaran utama
                      </p>
                    </div>

                    <div className="p-4 sm:p-5">
                      <div className="flex min-w-0 items-center gap-3 rounded-lg border theme-info p-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border theme-card">
                          <BookOpen
                            size={18}
                            className="text-[var(--color-info)]"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-medium theme-text-muted">
                            Mengajar
                          </p>

                          <p className="mt-0.5 break-words text-sm font-bold theme-text">
                            {mapel}
                          </p>
                        </div>

                      </div>
                    </div>
                  </section>

                </aside>
              </div>

              {/* BOTTOM ACTION */}
              <div className="flex min-w-0 flex-col gap-3 border-t theme-border pb-4 pt-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="min-w-0">
                  <p className="text-sm font-semibold theme-text-secondary">
                    Perlu mengubah data guru?
                  </p>

                  <p className="mt-0.5 text-xs theme-text-muted">
                    Pastikan data yang diperbarui sudah sesuai.
                  </p>
                </div>

                <div className="flex w-full gap-2 sm:w-auto">

                  <button
                    onClick={() =>
                      router.back()
                    }
                    className="flex-1 rounded-lg border theme-card px-4 py-2.5 text-sm font-semibold theme-text-secondary transition theme-sidebar-hover sm:flex-none"
                  >
                    Kembali
                  </button>

                  <button
                    onClick={() =>
                      router.push(
                        `/admin/guru/edit/${guru.id}`
                      )
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg theme-primary px-4 py-2.5 text-sm font-semibold shadow-sm transition sm:flex-none"
                  >
                    <Edit size={16} />
                    Edit Profil
                  </button>

                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}