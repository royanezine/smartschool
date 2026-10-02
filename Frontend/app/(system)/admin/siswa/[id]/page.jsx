"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Edit,
  GraduationCap,
  User,
  CheckCircle,
  Hash,
  BriefcaseBusiness,
} from "lucide-react";

import { getUsers } from "@/services/user.service";

/* ============================================================
   THEME
   ============================================================ */

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_16%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

/* ============================================================
   PAGE
   ============================================================ */

export default function DetailSiswaPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [siswa, setSiswa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ============================================================
     FETCH SISWA
     ============================================================ */

  useEffect(() => {
    let mounted = true;

    const fetchSiswa = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getUsers({
          page: 1,
          limit: 100,
          role: "siswa",
        });

        if (!mounted) return;

        const users =
          response?.data?.data ||
          response?.data?.users ||
          response?.data ||
          response?.users ||
          [];

        const list = Array.isArray(users) ? users : [];

        const found = list.find(
          (item) => String(item.id) === String(id)
        );

        if (!found) {
          setError("Data siswa tidak ditemukan.");
          return;
        }

        setSiswa(found);
      } catch (err) {
        console.error("Gagal mengambil detail siswa:", err);

        if (!mounted) return;

        setError(
          err?.message ||
            "Gagal mengambil data siswa dari backend."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchSiswa();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  /* ============================================================
     LOADING
     ============================================================ */

  if (loading) {
    return (
      <div className="theme-page flex min-h-screen w-full">
        <Sidebar
          active="siswa"
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

          <main className="flex flex-1 items-center justify-center px-6">
            <div className="text-center">
              <div
                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${themePrimarySoft} ${themePrimaryText}`}
              >
                <User size={22} />
              </div>

              <p className="theme-text-secondary mt-4 text-sm font-medium">
                Memuat data siswa...
              </p>

              <div
                className={`mx-auto mt-3 h-1.5 w-32 overflow-hidden rounded-full ${themeNeutralSurface}`}
              >
                <div
                  className="h-full w-1/2 animate-pulse rounded-full bg-[var(--color-primary)]"
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR
     ============================================================ */

  if (error || !siswa) {
    return (
      <div className="theme-page flex min-h-screen w-full">
        <Sidebar
          active="siswa"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />

        <div className="flex min-w-0 flex-1 flex-col">
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

          <main className="flex flex-1 items-center justify-center px-6">
            <div
              className={`theme-card w-full max-w-md rounded-xl border ${themeNeutralBorder} p-8 text-center ${themeCardShadow}`}
            >
              <div
                className={`theme-danger mx-auto flex h-12 w-12 items-center justify-center rounded-full ${themeDangerSurface}`}
              >
                <User size={22} />
              </div>

              <h1 className="theme-text mt-4 text-lg font-semibold">
                Data Siswa Tidak Ditemukan
              </h1>

              <p className="theme-text-muted mt-2 text-sm leading-6">
                {error || "Data siswa tidak tersedia."}
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/admin/siswa")
                }
                className={`theme-primary ${themePrimaryShadow} mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-[var(--color-card)] transition hover:opacity-90`}
              >
                <ArrowLeft size={16} />
                Kembali ke Daftar Siswa
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* ============================================================
     NORMALIZE DATA
     ============================================================ */

  const nama =
    siswa.nama ||
    siswa.namaLengkap ||
    siswa.name ||
    "-";

  const initial =
    nama?.trim()?.charAt(0)?.toUpperCase() || "S";

  const status =
    siswa.status ||
    siswa.statusPengguna ||
    "-";

  const nis =
    siswa.nis ||
    siswa.NIS ||
    siswa.nomorInduk ||
    "-";

  const nisn =
    siswa.nisn ||
    siswa.NISN ||
    "-";

  const kelas =
    siswa.kelas?.nama ||
    siswa.namaKelas ||
    siswa.kelas ||
    "-";

  const gender =
    siswa.gender ||
    siswa.jenisKelamin ||
    siswa.jenis_kelamin ||
    "";

  const tanggalLahir =
    siswa.tglLahir ||
    siswa.tanggalLahir ||
    siswa.tanggal_lahir ||
    "-";

  const email =
    siswa.email ||
    "-";

  const phone =
    siswa.phone ||
    siswa.noTelepon ||
    siswa.nomorTelepon ||
    siswa.telepon ||
    "-";

  const alamat =
    siswa.alamat ||
    siswa.alamatLengkap ||
    "-";

  const kelurahan =
    siswa.kelurahan ||
    siswa.desa ||
    "-";

  const kecamatan =
    siswa.kecamatan ||
    "-";

  const kota =
    siswa.kota ||
    siswa.kabupaten ||
    "-";

  const provinsi =
    siswa.provinsi ||
    "-";

  const namaOrtu =
    siswa.namaOrtu ||
    siswa.namaOrangTua ||
    siswa.namaWali ||
    "-";

  const nikOrtu =
    siswa.nikOrtu ||
    siswa.nikOrangTua ||
    siswa.nikWali ||
    "-";

  const pekerjaanOrtu =
    siswa.pekerjaanOrtu ||
    siswa.pekerjaanOrangTua ||
    siswa.pekerjaanWali ||
    "-";

  const alamatKtpOrtu =
    siswa.alamatKtpOrtu ||
    siswa.alamatKtpOrangTua ||
    "-";

  const alamatDomisiliOrtu =
    siswa.alamatDomisiliOrtu ||
    siswa.alamatDomisiliOrangTua ||
    "-";

  const domisiliSama =
    siswa.domisiliSama ||
    siswa.alamatDomisiliSama ||
    false;

  const joinDate =
    siswa.joinDate ||
    siswa.tanggalMasuk ||
    siswa.createdAt ||
    "-";

  const isActive =
    String(status).toLowerCase() === "aktif";

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="theme-page flex min-h-screen w-full min-w-0">
      {/* SIDEBAR */}
      <div className="shrink-0">
        <Sidebar
          active="siswa"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      {/* CONTENT */}
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

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 py-5 sm:px-6 md:px-7 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1500px]">

              {/* ==================================================
                  ACTION BAR
                  ================================================== */}

              <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="theme-text-muted group inline-flex w-fit items-center gap-2 text-sm font-medium transition hover:text-[var(--color-primary)]"
                >
                  <ArrowLeft
                    size={17}
                    className="transition-transform group-hover:-translate-x-0.5"
                  />

                  <span>
                    Kembali ke Daftar Siswa
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/siswa/edit/${siswa.id}`
                    )
                  }
                  className={`theme-card ${themePrimarySoftBorder} ${themePrimaryText} ${themeSmallShadow} inline-flex w-fit items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]`}
                >
                  <Edit size={16} />
                  Edit Profil
                </button>
              </div>

              {/* ==================================================
                  PROFILE
                  ================================================== */}

              <section
                className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div className="h-1 w-full bg-[var(--color-primary)]" />

                <div className="p-5 sm:p-6 lg:p-8">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                    {/* PROFILE IDENTITY */}
                    <div className="flex min-w-0 items-center gap-5">
                      <div
                        className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} text-2xl font-bold sm:h-24 sm:w-24 sm:text-3xl`}
                      >
                        {initial}
                      </div>

                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">

                          <span
                            className={`${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} rounded-md border px-2.5 py-1 text-xs font-semibold`}
                          >
                            DATA SISWA
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${
                              isActive
                                ? `${themeSuccessBorder} ${themeSuccessSurface} theme-success`
                                : `${themeDangerBorder} ${themeDangerSurface} theme-danger`
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {status}
                          </span>
                        </div>

                        <h1 className="theme-text break-words text-2xl font-bold tracking-tight sm:text-3xl">
                          {nama}
                        </h1>

                        <div className="theme-text-muted mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                          <span className="inline-flex items-center gap-1.5">
                            <Hash
                              size={14}
                              className={themePrimaryText}
                            />

                            NIS {nis}
                          </span>

                          <span className="theme-text-muted hidden opacity-40 sm:inline">
                            |
                          </span>

                          <span>
                            NISN {nisn}
                          </span>

                          <span className="theme-text-muted hidden opacity-40 sm:inline">
                            |
                          </span>

                          <span className="font-semibold text-[var(--color-primary)]">
                            {kelas}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* JOIN DATE */}
                    <div
                      className={`hidden shrink-0 border-l ${themeDivider} pl-8 lg:block`}
                    >
                      <p className="theme-text-muted text-xs font-medium uppercase tracking-wide">
                        Bergabung
                      </p>

                      <div className="theme-text-secondary mt-1 flex items-center gap-2 text-sm font-semibold">
                        <Calendar
                          size={15}
                          className={themePrimaryText}
                        />

                        {formatDate(joinDate)}
                      </div>
                    </div>
                  </div>

                  {/* BASIC INFO */}
                  <div
                    className={`mt-7 grid grid-cols-1 gap-x-8 gap-y-5 border-t ${themeDivider} pt-6 sm:grid-cols-2 lg:grid-cols-4`}
                  >
                    <InfoItem
                      icon={<User size={17} />}
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
                      icon={<Calendar size={17} />}
                      label="Tanggal Lahir"
                      value={formatDate(tanggalLahir)}
                    />

                    <InfoItem
                      icon={<Mail size={17} />}
                      label="Email"
                      value={email}
                      breakText
                    />

                    <InfoItem
                      icon={<Phone size={17} />}
                      label="Nomor Telepon"
                      value={phone}
                    />
                  </div>
                </div>
              </section>

              {/* ==================================================
                  DETAIL CONTENT
                  ================================================== */}

              <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">

                {/* ==================================================
                    LEFT COLUMN
                    ================================================== */}

                <div className="min-w-0 space-y-5 xl:col-span-2">

                  {/* ALAMAT */}
                  <section
                    className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
                  >
                    <SectionHeader
                      icon={<MapPin size={18} />}
                      title="Alamat"
                      description="Informasi alamat tempat tinggal siswa"
                    />

                    <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-5 sm:grid-cols-2 lg:p-6">
                      <DetailItem
                        label="Alamat Jalan"
                        value={alamat}
                        breakText
                        className="sm:col-span-2"
                      />

                      <DetailItem
                        label="Kelurahan / Desa"
                        value={kelurahan}
                      />

                      <DetailItem
                        label="Kecamatan"
                        value={kecamatan}
                      />

                      <DetailItem
                        label="Kota / Kabupaten"
                        value={kota}
                      />

                      <DetailItem
                        label="Provinsi"
                        value={provinsi}
                      />
                    </div>
                  </section>

                  {/* ORANG TUA / WALI */}
                  <section
                    className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
                  >
                    <SectionHeader
                      icon={<Users size={18} />}
                      title="Orang Tua / Wali"
                      description="Informasi orang tua atau wali siswa"
                    />

                    <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-5 sm:grid-cols-2 lg:p-6">

                      <DetailItem
                        label="Nama Orang Tua"
                        value={namaOrtu}
                      />

                      <DetailItem
                        label="NIK Orang Tua"
                        value={nikOrtu}
                        breakText
                      />

                      <DetailItem
                        label="Pekerjaan"
                        value={pekerjaanOrtu}
                        icon={
                          <BriefcaseBusiness size={14} />
                        }
                      />

                      <div className="hidden sm:block" />

                      <DetailItem
                        label="Alamat KTP"
                        value={alamatKtpOrtu}
                        breakText
                        className="sm:col-span-2"
                      />

                      <div className="min-w-0 sm:col-span-2">
                        <DetailItem
                          label="Alamat Domisili"
                          value={alamatDomisiliOrtu}
                          breakText
                        />

                        {domisiliSama && (
                          <div
                            className={`theme-success ${themeSuccessBorder} ${themeSuccessSurface} mt-3 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium`}
                          >
                            <CheckCircle size={14} />

                            Alamat domisili sama dengan alamat KTP
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                </div>

                {/* ==================================================
                    RIGHT COLUMN
                    ================================================== */}

                <div className="min-w-0 space-y-5">

                  {/* STATISTIK AKADEMIK */}
                  <section
                    className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
                  >
                    <SectionHeader
                      icon={<GraduationCap size={18} />}
                      title="Statistik Akademik"
                      description="Ringkasan performa siswa"
                    />

                    <div className="space-y-3 p-5 lg:p-6">

                      <AcademicStat
                        label="Rata-rata Nilai"
                        value={
                          siswa.rataRataNilai ??
                          siswa.rataRata ??
                          "-"
                        }
                      />

                      <AcademicStat
                        label="Mata Pelajaran Unggulan"
                        value={
                          siswa.mataPelajaranUnggulan ??
                          "-"
                        }
                      />

                      <AcademicStat
                        label="Tingkat Kehadiran"
                        value={
                          siswa.tingkatKehadiran ??
                          "-"
                        }
                        valueClass="theme-success"
                      />
                    </div>
                  </section>

                  {/* RINGKASAN */}
                  <section
                    className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
                  >
                    <SectionHeader
                      icon={<User size={18} />}
                      title="Ringkasan"
                      description="Informasi utama siswa"
                    />

                    <div
                      className={`divide-y ${themeDivider}`}
                    >
                      <SummaryRow
                        label="Status"
                        value={status}
                        valueClass={
                          isActive
                            ? "theme-success"
                            : "theme-danger"
                        }
                      />

                      <SummaryRow
                        label="Kelas"
                        value={kelas}
                      />

                      <SummaryRow
                        label="NIS"
                        value={nis}
                      />

                      <SummaryRow
                        label="NISN"
                        value={nisn}
                      />

                      <SummaryRow
                        label="Bergabung"
                        value={formatDate(joinDate)}
                      />
                    </div>
                  </section>
                </div>
              </div>

              <div className="h-4" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   FORMAT DATE
   ============================================================ */

function formatDate(value) {
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
}

/* ============================================================
   SECTION HEADER
   ============================================================ */

function SectionHeader({
  icon,
  title,
  description,
}) {
  return (
    <div
      className={`flex items-start gap-3 border-b ${themeDivider} px-5 py-4 lg:px-6`}
    >
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft}`}
      >
        <span className={themePrimaryText}>
          {icon}
        </span>
      </div>

      <div className="min-w-0">
        <h2 className="theme-text text-sm font-semibold">
          {title}
        </h2>

        {description && (
          <p className="theme-text-muted mt-0.5 text-xs">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   INFO ITEM
   ============================================================ */

function InfoItem({
  icon,
  label,
  value,
  breakText = false,
}) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <div
        className={`mt-0.5 shrink-0 ${themePrimaryText}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="theme-text-muted text-xs font-medium">
          {label}
        </p>

        <p
          className={`theme-text-secondary mt-1 text-sm font-medium ${
            breakText
              ? "break-words [overflow-wrap:anywhere]"
              : "truncate"
          }`}
          title={String(value)}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   DETAIL ITEM
   ============================================================ */

function DetailItem({
  label,
  value,
  breakText = false,
  className = "",
  icon,
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="flex items-center gap-1.5">
        <p className="theme-text-muted text-xs font-medium">
          {label}
        </p>

        {icon && (
          <span className={themePrimaryText}>
            {icon}
          </span>
        )}
      </div>

      <p
        className={`theme-text-secondary mt-1.5 text-sm font-medium ${
          breakText
            ? "break-words leading-6 [overflow-wrap:anywhere]"
            : "truncate"
        }`}
        title={String(value)}
      >
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   ACADEMIC STAT
   ============================================================ */

function AcademicStat({
  label,
  value,
  valueClass = "theme-text",
}) {
  return (
    <div
      className={`flex min-w-0 items-center justify-between gap-4 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
    >
      <div className="min-w-0 pr-3">
        <p className="theme-text-muted text-xs font-medium">
          {label}
        </p>
      </div>

      <p
        className={`shrink-0 text-2xl font-bold tracking-tight ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   SUMMARY ROW
   ============================================================ */

function SummaryRow({
  label,
  value,
  valueClass = "theme-text-secondary",
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 lg:px-6">
      <span className="theme-text-muted text-xs font-medium">
        {label}
      </span>

      <span
        className={`max-w-[60%] truncate text-right text-sm font-semibold ${valueClass}`}
        title={String(value)}
      >
        {value}
      </span>
    </div>
  );
}