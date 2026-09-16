"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

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

import { getUsers } from "../../../../services/user.service";

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
  iconClass = "text-slate-500",
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 ${iconClass}`}
      >
        <Icon size={17} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-medium text-slate-500">
          {label}
        </p>

        <p className="break-words text-sm font-semibold leading-5 text-slate-800 sm:text-[15px]">
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
  iconClass = "text-blue-600",
  valueClass = "text-slate-900",
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={`text-2xl font-bold tracking-tight sm:text-3xl ${valueClass}`}
          >
            {value}
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-slate-700">
            {label}
          </p>

          {description && (
            <p className="mt-1 break-words text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
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
      <div className="flex min-h-screen w-full bg-[#F8FAFC]">
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
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <UserRound size={22} />
              </div>

              <p className="mt-4 text-sm font-medium text-slate-600">
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
      <div className="flex min-h-screen w-full bg-[#F8FAFC]">
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
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <UserRound size={22} />
              </div>

              <h1 className="mt-4 text-lg font-bold text-slate-900">
                Data Guru Tidak Ditemukan
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {error ||
                  "Data guru tidak tersedia."}
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/admin/guru")
                }
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
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
    <div className="flex min-h-screen w-full min-w-0 bg-[#F8FAFC]">

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
                    className="inline-flex max-w-full items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
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
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">
                      Data Guru
                    </p>

                    <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
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
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 sm:w-auto"
                >
                  <Edit
                    size={16}
                    strokeWidth={1.9}
                  />

                  Edit Profil
                </button>
              </div>

              {/* PROFILE CARD */}
              <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="h-1 bg-blue-700" />

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
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                            Guru
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${
                              isActive
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                isActive
                                  ? "bg-emerald-500"
                                  : "bg-rose-500"
                              }`}
                            />

                            {status}
                          </span>
                        </div>

                        <h2 className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                          {nama}
                        </h2>

                        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">

                          <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
                            <Hash
                              size={15}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="break-all">
                              {nip}
                            </span>
                          </span>

                          <span className="hidden h-4 w-px bg-slate-200 sm:block" />

                          <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
                            <BookOpen
                              size={15}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="break-words">
                              {mapel}
                            </span>
                          </span>

                        </div>
                      </div>
                    </div>

                    {/* JOIN DATE */}
                    <div className="shrink-0 border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Bergabung Sejak
                      </p>

                      <div className="mt-1.5 flex items-center gap-2">
                        <Calendar
                          size={17}
                          className="shrink-0 text-blue-600"
                          strokeWidth={1.8}
                        />

                        <span className="text-sm font-semibold text-slate-800">
                          {formatDate(joinDate)}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* DIVIDER */}
                  <div className="my-6 border-t border-slate-100" />

                  {/* BASIC INFORMATION */}
                  <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                    <InfoItem
                      icon={Mail}
                      label="Email"
                      value={email}
                      iconClass="text-blue-600"
                    />

                    <InfoItem
                      icon={Phone}
                      label="Nomor Telepon"
                      value={phone}
                      iconClass="text-blue-600"
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
                      iconClass="text-blue-600"
                    />

                    <InfoItem
                      icon={Calendar}
                      label="Tanggal Lahir"
                      value={formatDate(tglLahir)}
                      iconClass="text-blue-600"
                    />

                  </div>
                </div>
              </section>

              {/* MAIN GRID */}
              <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.75fr)_minmax(280px,0.75fr)] xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.72fr)] 2xl:grid-cols-[minmax(0,2fr)_minmax(320px,0.7fr)]">

                {/* LEFT COLUMN */}
                <div className="min-w-0 space-y-5">

                  {/* DATA KEPEGAWAIAN */}
                  <section className="w-full rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <BriefcaseBusiness
                            size={18}
                            className="text-blue-700"
                            strokeWidth={1.8}
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-800">
                            Informasi Kepegawaian
                          </h3>

                          <p className="mt-0.5 text-xs text-slate-500">
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
                  <section className="w-full rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <MapPin
                            size={18}
                            className="text-blue-700"
                            strokeWidth={1.8}
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-800">
                            Alamat
                          </h3>

                          <p className="mt-0.5 text-xs text-slate-500">
                            Informasi alamat tempat tinggal guru
                          </p>
                        </div>

                      </div>
                    </div>

                    <div className="p-4 sm:p-6">
                      <div className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                        <p className="text-xs font-medium text-slate-500">
                          Alamat Lengkap
                        </p>

                        <p className="mt-2 break-words text-sm font-semibold leading-6 text-slate-800 sm:text-[15px]">
                          {alamat}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* INFORMASI PRIBADI */}
                  <section className="w-full rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <Users
                            size={18}
                            className="text-blue-700"
                            strokeWidth={1.8}
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-800">
                            Informasi Pribadi
                          </h3>

                          <p className="mt-0.5 text-xs text-slate-500">
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
                  <section className="w-full rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <GraduationCap
                            size={18}
                            className="text-blue-700"
                            strokeWidth={1.8}
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-800">
                            Statistik Mengajar
                          </h3>

                          <p className="mt-0.5 text-xs text-slate-500">
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
                        iconClass="text-blue-600"
                      />

                      <StatCard
                        icon={Users}
                        value={totalSiswa}
                        label="Total Siswa"
                        description="Siswa yang diajar"
                        iconClass="text-indigo-600"
                      />

                      <StatCard
                        icon={CheckCircle2}
                        value={rataKehadiran}
                        label="Rata-rata Kehadiran"
                        description="Kehadiran mengajar"
                        iconClass="text-emerald-600"
                        valueClass="text-emerald-600"
                      />

                    </div>
                  </section>

                  {/* STATUS */}
                  <section className="w-full rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
                      <h3 className="text-sm font-bold text-slate-800">
                        Status Profil
                      </h3>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Status data guru saat ini
                      </p>
                    </div>

                    <div className="p-4 sm:p-5">
                      <div
                        className={`flex min-w-0 items-start gap-3 rounded-lg border p-4 ${
                          isActive
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-rose-200 bg-rose-50"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ${
                            isActive
                              ? "text-emerald-600"
                              : "text-rose-600"
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
                                ? "text-emerald-800"
                                : "text-rose-800"
                            }`}
                          >
                            {isActive
                              ? "Profil Aktif"
                              : "Profil Nonaktif"}
                          </p>

                          <p
                            className={`mt-1 break-words text-xs leading-5 ${
                              isActive
                                ? "text-emerald-700"
                                : "text-rose-700"
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
                  <section className="w-full rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
                      <h3 className="text-sm font-bold text-slate-800">
                        Mata Pelajaran
                      </h3>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Bidang pengajaran utama
                      </p>
                    </div>

                    <div className="p-4 sm:p-5">
                      <div className="flex min-w-0 items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/60 p-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-white">
                          <BookOpen
                            size={18}
                            className="text-blue-700"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-500">
                            Mengajar
                          </p>

                          <p className="mt-0.5 break-words text-sm font-bold text-slate-800">
                            {mapel}
                          </p>
                        </div>

                      </div>
                    </div>
                  </section>

                </aside>
              </div>

              {/* BOTTOM ACTION */}
              <div className="flex min-w-0 flex-col gap-3 border-t border-slate-200 pb-4 pt-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700">
                    Perlu mengubah data guru?
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Pastikan data yang diperbarui sudah sesuai.
                  </p>
                </div>

                <div className="flex w-full gap-2 sm:w-auto">

                  <button
                    onClick={() =>
                      router.back()
                    }
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex-none"
                  >
                    Kembali
                  </button>

                  <button
                    onClick={() =>
                      router.push(
                        `/admin/guru/edit/${guru.id}`
                      )
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 sm:flex-none"
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