"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

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

import { getUsers } from "../../../../services/user.service";

export default function DetailSiswaPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [siswa, setSiswa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          err?.message || "Gagal mengambil data siswa dari backend."
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

  if (loading) {
    return (
      <div className="flex min-h-screen w-full bg-[#F8FAFC]">
        <Sidebar
          active="siswa"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            toggleSidebar={() => setIsCollapsed(!isCollapsed)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex flex-1 items-center justify-center px-6">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <User size={22} />
              </div>

              <p className="mt-4 text-sm font-medium text-slate-600">
                Memuat data siswa...
              </p>

              <div className="mx-auto mt-3 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-500" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !siswa) {
    return (
      <div className="flex min-h-screen w-full bg-[#F8FAFC]">
        <Sidebar
          active="siswa"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            toggleSidebar={() => setIsCollapsed(!isCollapsed)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex flex-1 items-center justify-center px-6">
            <div className="w-full max-w-md rounded-xl border border-[#DCE6F2] bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                <User size={22} />
              </div>

              <h1 className="mt-4 text-lg font-semibold text-[#172554]">
                Data Siswa Tidak Ditemukan
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {error || "Data siswa tidak tersedia."}
              </p>

              <button
                type="button"
                onClick={() => router.push("/admin/siswa")}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
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

  return (
    <div className="flex min-h-screen w-full min-w-0 bg-[#F8FAFC]">
      <div className="shrink-0">
        <Sidebar
          active="siswa"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setIsCollapsed(!isCollapsed)}
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

              {/* HEADER ACTION */}
              <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="group inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#1E3A8A]"
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
                    router.push(`/admin/siswa/edit/${siswa.id}`)
                  }
                  className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-[#BFDBFE] bg-white px-4 py-2.5 text-sm font-semibold text-[#2563EB] shadow-sm transition hover:border-[#93C5FD] hover:bg-[#EFF6FF]"
                >
                  <Edit size={16} />
                  Edit Profil
                </button>
              </div>

              {/* PROFILE HEADER */}
              <section className="overflow-hidden rounded-xl border border-[#DCE6F2] bg-white shadow-sm">
                <div className="h-1 w-full bg-[#3B82F6]" />

                <div className="p-5 sm:p-6 lg:p-8">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                    <div className="flex min-w-0 items-center gap-5">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] text-2xl font-bold text-[#1D4ED8] sm:h-24 sm:w-24 sm:text-3xl">
                        {initial}
                      </div>

                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-md border border-[#DBEAFE] bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#2563EB]">
                            DATA SISWA
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
                              String(status).toLowerCase() === "aktif"
                                ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                                : "border border-rose-100 bg-rose-50 text-rose-700"
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {status}
                          </span>
                        </div>

                        <h1 className="break-words text-2xl font-bold tracking-tight text-[#172554] sm:text-3xl">
                          {nama}
                        </h1>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Hash
                              size={14}
                              className="text-[#60A5FA]"
                            />
                            NIS {nis}
                          </span>

                          <span className="hidden text-slate-300 sm:inline">
                            |
                          </span>

                          <span>
                            NISN {nisn}
                          </span>

                          <span className="hidden text-slate-300 sm:inline">
                            |
                          </span>

                          <span className="font-semibold text-[#1E40AF]">
                            {kelas}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden shrink-0 border-l border-[#E2E8F0] pl-8 lg:block">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Bergabung
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#1E3A8A]">
                        <Calendar
                          size={15}
                          className="text-[#60A5FA]"
                        />

                        {formatDate(joinDate)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-[#EEF2F7] pt-6 sm:grid-cols-2 lg:grid-cols-4">

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

              {/* CONTENT */}
              <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">

                {/* LEFT */}
                <div className="min-w-0 space-y-5 xl:col-span-2">

                  {/* ALAMAT */}
                  <section className="overflow-hidden rounded-xl border border-[#DCE6F2] bg-white shadow-sm">
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

                  {/* ORANG TUA */}
                  <section className="overflow-hidden rounded-xl border border-[#DCE6F2] bg-white shadow-sm">
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
                        icon={<BriefcaseBusiness size={14} />}
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
                          <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                            <CheckCircle size={14} />
                            Alamat domisili sama dengan alamat KTP
                          </div>
                        )}
                      </div>

                    </div>
                  </section>

                </div>

                {/* RIGHT */}
                <div className="min-w-0 space-y-5">

                  {/* AKADEMIK */}
                  <section className="overflow-hidden rounded-xl border border-[#DCE6F2] bg-white shadow-sm">
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
                        valueClass="text-emerald-600"
                      />

                    </div>
                  </section>

                  {/* RINGKASAN */}
                  <section className="overflow-hidden rounded-xl border border-[#DCE6F2] bg-white shadow-sm">
                    <SectionHeader
                      icon={<User size={18} />}
                      title="Ringkasan"
                      description="Informasi utama siswa"
                    />

                    <div className="divide-y divide-[#EEF2F7]">

                      <SummaryRow
                        label="Status"
                        value={status}
                        valueClass={
                          String(status).toLowerCase() === "aktif"
                            ? "text-emerald-600"
                            : "text-rose-600"
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

function formatDate(value) {
  if (!value || value === "-") return "-";

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

function SectionHeader({
  icon,
  title,
  description,
}) {
  return (
    <div className="flex items-start gap-3 border-b border-[#EEF2F7] px-5 py-4 lg:px-6">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] text-[#3B82F6]">
        {icon}
      </div>

      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-[#172554]">
          {title}
        </h2>

        {description && (
          <p className="mt-0.5 text-xs text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  breakText = false,
}) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <div className="mt-0.5 shrink-0 text-[#60A5FA]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p
          className={`mt-1 text-sm font-medium text-[#334155] ${
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
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        {icon && (
          <span className="text-[#60A5FA]">
            {icon}
          </span>
        )}
      </div>

      <p
        className={`mt-1.5 text-sm font-medium text-[#334155] ${
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

function AcademicStat({
  label,
  value,
  valueClass = "text-[#172554]",
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 rounded-lg border border-[#EEF2F7] bg-[#F8FAFC] p-4">
      <div className="min-w-0 pr-3">
        <p className="text-xs font-medium text-slate-400">
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

function SummaryRow({
  label,
  value,
  valueClass = "text-[#334155]",
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 lg:px-6">
      <span className="text-xs font-medium text-slate-400">
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