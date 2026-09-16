"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  CreditCard,
  User,
  GraduationCap,
  Users,
  MapPin,
  Phone,
  CalendarDays,
  IdCard,
  UserRound,
  School,
  Hash,
  CheckCircle2,
} from "lucide-react";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

/* =========================================================
   MOCK DATA
   Nanti bisa diganti dengan hasil fetch API
========================================================= */

const MOCK_SISWA = [
  {
    id: 1,
    nama: "Alya Ramadhani",
    nisn: "0051234567",
    nik: "3278123456780001",
    kelas: "7A",
    jenjang: "VII",
    jenisKelamin: "P",
    status: "aktif",
    tempatLahir: "Tasikmalaya",
    tanggalLahir: "12 Mar 2013",
    agama: "Islam",
    alamat: "Jl. Merdeka No. 12, Tasikmalaya",
    noTelepon: "0812-3456-7890",
    namaOrtu: "Hendra Ramadhani",
    hubunganOrtu: "Ayah",
    teleponOrtu: "0812-9988-7766",
    alamatOrtu: "Jl. Merdeka No. 12, Tasikmalaya",
    waliKelas: "Siti Rahayu, S.Pd",
    tahunMasuk: "2025",
  },
  {
    id: 2,
    nama: "Bunga Citra Lestari",
    nisn: "0051234568",
    nik: "3278123456780002",
    kelas: "7A",
    jenjang: "VII",
    jenisKelamin: "P",
    status: "aktif",
    tempatLahir: "Bandung",
    tanggalLahir: "24 Jul 2013",
    agama: "Islam",
    alamat: "Jl. Cihideung No. 5, Tasikmalaya",
    noTelepon: "0813-2233-4455",
    namaOrtu: "Agus Lestari",
    hubunganOrtu: "Ayah",
    teleponOrtu: "0813-1122-3344",
    alamatOrtu: "Jl. Cihideung No. 5, Tasikmalaya",
    waliKelas: "Siti Rahayu, S.Pd",
    tahunMasuk: "2025",
  },
  {
    id: 3,
    nama: "Cahyo Nugroho",
    nisn: "0051234569",
    nik: "3278123456780003",
    kelas: "7B",
    jenjang: "VII",
    jenisKelamin: "L",
    status: "aktif",
    tempatLahir: "Tasikmalaya",
    tanggalLahir: "02 Jan 2013",
    agama: "Islam",
    alamat: "Jl. Sutisna Senjaya No. 88, Tasikmalaya",
    noTelepon: "0821-9988-7766",
    namaOrtu: "Wawan Nugroho",
    hubunganOrtu: "Ayah",
    teleponOrtu: "0821-9988-7766",
    alamatOrtu: "Jl. Sutisna Senjaya No. 88, Tasikmalaya",
    waliKelas: "Andi Prasetyo, S.Pd",
    tahunMasuk: "2025",
  },
  {
    id: 4,
    nama: "Indra Kusuma",
    nisn: "0041234570",
    nik: "3278123456780004",
    kelas: "8A",
    jenjang: "VIII",
    jenisKelamin: "L",
    status: "aktif",
    tempatLahir: "Garut",
    tanggalLahir: "18 Sep 2012",
    agama: "Islam",
    alamat: "Jl. Yudanegara No. 21, Tasikmalaya",
    noTelepon: "0857-1122-3344",
    namaOrtu: "Sutrisno Kusuma",
    hubunganOrtu: "Ayah",
    teleponOrtu: "0857-1122-3344",
    alamatOrtu: "Jl. Yudanegara No. 21, Tasikmalaya",
    waliKelas: "Dewi Anggraini, S.Si",
    tahunMasuk: "2024",
  },
  {
    id: 5,
    nama: "Julia Anggraeni",
    nisn: "0041234571",
    nik: "3278123456780005",
    kelas: "8A",
    jenjang: "VIII",
    jenisKelamin: "P",
    status: "nonaktif",
    tempatLahir: "Tasikmalaya",
    tanggalLahir: "30 Nov 2012",
    agama: "Islam",
    alamat: "Jl. Ir. H. Djuanda No. 40, Tasikmalaya",
    noTelepon: "0878-5566-7788",
    namaOrtu: "Yayan Anggraeni",
    hubunganOrtu: "Ayah",
    teleponOrtu: "0878-5566-7788",
    alamatOrtu: "Jl. Ir. H. Djuanda No. 40, Tasikmalaya",
    waliKelas: "Dewi Anggraini, S.Si",
    tahunMasuk: "2024",
  },
  {
    id: 6,
    nama: "Reza Firmansyah",
    nisn: "0031234572",
    nik: "3278123456780006",
    kelas: "9A",
    jenjang: "IX",
    jenisKelamin: "L",
    status: "aktif",
    tempatLahir: "Ciamis",
    tanggalLahir: "07 Apr 2011",
    agama: "Islam",
    alamat: "Jl. Cieunteung No. 9, Tasikmalaya",
    noTelepon: "0896-4433-2211",
    namaOrtu: "Dadang Firmansyah",
    hubunganOrtu: "Ayah",
    teleponOrtu: "0896-4433-2211",
    alamatOrtu: "Jl. Cieunteung No. 9, Tasikmalaya",
    waliKelas: "Budi Santoso, S.Pd",
    tahunMasuk: "2023",
  },
];


/* =========================================================
   HELPERS
========================================================= */

function getInitials(nama) {
  return nama
    .replace(/,.*/, "")
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}


/* =========================================================
   BADGES
========================================================= */

function StatusBadge({ status }) {
  const isActive = status === "aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isActive
          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
          : "bg-slate-100 text-slate-500 border border-slate-200"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />

      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}


function JenisKelaminBadge({ jenisKelamin }) {
  const isPria = jenisKelamin === "L";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
        isPria
          ? "bg-[#eaf1ff] text-[#155DFC] border border-[#c7dbff]"
          : "bg-pink-50 text-pink-600 border border-pink-200"
      }`}
    >
      {isPria ? "Laki-laki" : "Perempuan"}
    </span>
  );
}


/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({ label, value, icon }) {
  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400 mb-0.5">
          {label}
        </p>

        <p className="text-sm font-semibold text-slate-800 break-words">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}


/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-[#eaf1ff] text-[#155DFC] flex items-center justify-center">
        {icon}
      </div>

      <div>
        <h2 className="text-sm font-bold text-slate-800">
          {title}
        </h2>

        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}


/* =========================================================
   MAIN PAGE
========================================================= */

export default function DetailSiswaPage() {
  const router = useRouter();
  const params = useParams();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const id = Number(params?.id);

  const siswa = MOCK_SISWA.find(
    (item) => item.id === id
  );

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };


  /* =======================================================
     DATA TIDAK DITEMUKAN
  ======================================================= */

  if (!siswa) {
    return (
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
        <Sidebar
          active="siswaKartuIdentitas"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="admin"
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <User size={28} />
              </div>

              <h1 className="text-lg font-bold text-slate-800">
                Data siswa tidak ditemukan
              </h1>

              <p className="text-sm text-slate-500 mt-1 mb-5">
                Siswa dengan ID tersebut tidak tersedia.
              </p>

              <button
                onClick={() =>
                  router.push(
                    "/admin/siswa/kartu-identitas"
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#155DFC] text-white text-sm font-semibold hover:bg-[#0d47c9] transition"
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


  /* =======================================================
     DETAIL
  ======================================================= */

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">

      {/* SIDEBAR */}
      <Sidebar
        active="siswaKartuIdentitas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />


      {/* CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* HEADER */}
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />


        {/* MAIN */}
        <main className="flex-1 overflow-y-auto">

          <div className="p-4 sm:p-6 lg:p-8 space-y-6">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="flex items-center justify-between gap-4 flex-wrap">

              <div className="flex items-center gap-3">

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/siswa/kartu-identitas"
                    )
                  }
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#155DFC] hover:bg-[#f5f8ff] transition"
                  title="Kembali"
                >
                  <ArrowLeft size={18} />
                </button>

                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Detail Siswa
                  </h1>

                  <p className="text-sm text-slate-500 mt-0.5">
                    Informasi lengkap identitas dan data siswa.
                  </p>
                </div>

              </div>


              {/* ACTION */}
              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/siswa/kartu-identitas/card?id=${siswa.id}`
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 hover:text-[#155DFC] transition"
                >
                  <CreditCard size={16} />
                  ID Card
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/siswa/kartu-identitas/edit?id=${siswa.id}`
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold shadow-lg shadow-[#155DFC]/20 hover:brightness-105 transition"
                >
                  <Edit size={16} />
                  Edit Siswa
                </button>

              </div>
            </div>


            {/* =================================================
                PROFILE SUMMARY
            ================================================= */}

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">

              <div className="p-5 sm:p-6">

                <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                  {/* AVATAR */}
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-[#155DFC]/20 flex-shrink-0">
                    {getInitials(siswa.nama)}
                  </div>


                  {/* NAME */}
                  <div className="flex-1">

                    <div className="flex items-center gap-2 flex-wrap">

                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                        {siswa.nama}
                      </h2>

                      <StatusBadge status={siswa.status} />

                    </div>

                    <p className="text-sm text-slate-500 mt-1">
                      NISN {siswa.nisn}
                    </p>


                    <div className="flex items-center gap-2 mt-3 flex-wrap">

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eaf1ff] border border-[#c7dbff] text-[#155DFC] text-xs font-bold">
                        <School size={13} />
                        Kelas {siswa.kelas}
                      </span>

                      <JenisKelaminBadge
                        jenisKelamin={siswa.jenisKelamin}
                      />

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold">
                        <CalendarDays size={13} />
                        Masuk {siswa.tahunMasuk}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                IDENTITAS
            ================================================= */}

            <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">

              <SectionHeader
                icon={<User size={18} />}
                title="Data Identitas Siswa"
                subtitle="Informasi dasar dan identitas pribadi siswa"
              />

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                <InfoItem
                  label="Nama Lengkap"
                  value={siswa.nama}
                  icon={<User size={16} />}
                />

                <InfoItem
                  label="NISN"
                  value={siswa.nisn}
                  icon={<Hash size={16} />}
                />

                <InfoItem
                  label="NIK"
                  value={siswa.nik}
                  icon={<IdCard size={16} />}
                />

                <InfoItem
                  label="Jenis Kelamin"
                  value={
                    siswa.jenisKelamin === "L"
                      ? "Laki-laki"
                      : "Perempuan"
                  }
                  icon={<UserRound size={16} />}
                />

                <InfoItem
                  label="Tempat Lahir"
                  value={siswa.tempatLahir}
                  icon={<MapPin size={16} />}
                />

                <InfoItem
                  label="Tanggal Lahir"
                  value={siswa.tanggalLahir}
                  icon={<CalendarDays size={16} />}
                />

                <InfoItem
                  label="Agama"
                  value={siswa.agama}
                  icon={<UserRound size={16} />}
                />

                <InfoItem
                  label="No. Telepon"
                  value={siswa.noTelepon}
                  icon={<Phone size={16} />}
                />

                <InfoItem
                  label="Status"
                  value={
                    siswa.status === "aktif"
                      ? "Aktif"
                      : "Nonaktif"
                  }
                  icon={<CheckCircle2 size={16} />}
                />

                {/* ALAMAT */}
                <div className="sm:col-span-2 lg:col-span-3">

                  <div className="flex gap-3">

                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <MapPin size={16} />
                    </div>

                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">
                        Alamat
                      </p>

                      <p className="text-sm font-semibold text-slate-800">
                        {siswa.alamat}
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </section>


            {/* =================================================
                DATA AKADEMIK
            ================================================= */}

            <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">

              <SectionHeader
                icon={<GraduationCap size={18} />}
                title="Data Akademik"
                subtitle="Informasi akademik dan penempatan siswa"
              />

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                <InfoItem
                  label="Kelas"
                  value={siswa.kelas}
                  icon={<School size={16} />}
                />

                <InfoItem
                  label="Jenjang"
                  value={siswa.jenjang}
                  icon={<GraduationCap size={16} />}
                />

                <InfoItem
                  label="Wali Kelas"
                  value={siswa.waliKelas}
                  icon={<UserRound size={16} />}
                />

                <InfoItem
                  label="Tahun Masuk"
                  value={siswa.tahunMasuk}
                  icon={<CalendarDays size={16} />}
                />

                <InfoItem
                  label="Status Siswa"
                  value={
                    siswa.status === "aktif"
                      ? "Aktif"
                      : "Nonaktif"
                  }
                  icon={<CheckCircle2 size={16} />}
                />

              </div>

            </section>


            {/* =================================================
                ORANG TUA / WALI
            ================================================= */}

            <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">

              <SectionHeader
                icon={<Users size={18} />}
                title="Data Orang Tua / Wali"
                subtitle="Informasi orang tua atau wali siswa"
              />

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">

                <InfoItem
                  label="Nama Orang Tua / Wali"
                  value={siswa.namaOrtu}
                  icon={<UserRound size={16} />}
                />

                <InfoItem
                  label="Hubungan"
                  value={siswa.hubunganOrtu}
                  icon={<Users size={16} />}
                />

                <InfoItem
                  label="No. Telepon"
                  value={siswa.teleponOrtu}
                  icon={<Phone size={16} />}
                />

                <InfoItem
                  label="Alamat"
                  value={siswa.alamatOrtu}
                  icon={<MapPin size={16} />}
                />

              </div>

            </section>


            {/* =================================================
                FOOTER ACTION
            ================================================= */}

            <div className="flex items-center justify-between gap-3 pb-4">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/siswa/kartu-identitas"
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
              >
                <ArrowLeft size={16} />
                Kembali
              </button>


              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/siswa/kartu-identitas/card?id=${siswa.id}`
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 hover:text-[#155DFC] transition"
                >
                  <CreditCard size={16} />
                  Lihat ID Card
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/siswa/kartu-identitas/edit?id=${siswa.id}`
                    )
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold shadow-lg shadow-[#155DFC]/20 hover:brightness-105 transition"
                >
                  <Edit size={16} />
                  Edit Siswa
                </button>

              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}