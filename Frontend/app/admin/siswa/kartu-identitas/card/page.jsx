"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Download,
  User,
  MapPin,
  Phone,
  CalendarDays,
  School,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

/* =========================================================
   MOCK DATA
========================================================= */

const MOCK_SISWA = [
  {
    id: 1,
    nama: "Alya Ramadhani",
    nisn: "0051234567",
    nik: "3278123456780001",
    kelas: "7A",
    jenisKelamin: "P",
    tempatLahir: "Tasikmalaya",
    tanggalLahir: "12 Mar 2013",
    agama: "Islam",
    alamat: "Jl. Merdeka No. 12, Tasikmalaya",
    noTelepon: "0812-3456-7890",
    status: "aktif",
    tahunMasuk: "2025",
  },
  {
    id: 2,
    nama: "Bunga Citra Lestari",
    nisn: "0051234568",
    nik: "3278123456780002",
    kelas: "7A",
    jenisKelamin: "P",
    tempatLahir: "Bandung",
    tanggalLahir: "24 Jul 2013",
    agama: "Islam",
    alamat: "Jl. Cihideung No. 5, Tasikmalaya",
    noTelepon: "0813-2233-4455",
    status: "aktif",
    tahunMasuk: "2025",
  },
  {
    id: 3,
    nama: "Cahyo Nugroho",
    nisn: "0051234569",
    nik: "3278123456780003",
    kelas: "7B",
    jenisKelamin: "L",
    tempatLahir: "Tasikmalaya",
    tanggalLahir: "02 Jan 2013",
    agama: "Islam",
    alamat: "Jl. Sutisna Senjaya No. 88, Tasikmalaya",
    noTelepon: "0821-9988-7766",
    status: "aktif",
    tahunMasuk: "2025",
  },
  {
    id: 4,
    nama: "Indra Kusuma",
    nisn: "0041234570",
    nik: "3278123456780004",
    kelas: "8A",
    jenisKelamin: "L",
    tempatLahir: "Garut",
    tanggalLahir: "18 Sep 2012",
    agama: "Islam",
    alamat: "Jl. Yudanegara No. 21, Tasikmalaya",
    noTelepon: "0857-1122-3344",
    status: "aktif",
    tahunMasuk: "2024",
  },
  {
    id: 5,
    nama: "Julia Anggraeni",
    nisn: "0041234571",
    nik: "3278123456780005",
    kelas: "8A",
    jenisKelamin: "P",
    tempatLahir: "Tasikmalaya",
    tanggalLahir: "30 Nov 2012",
    agama: "Islam",
    alamat: "Jl. Ir. H. Djuanda No. 40, Tasikmalaya",
    noTelepon: "0878-5566-7788",
    status: "nonaktif",
    tahunMasuk: "2024",
  },
  {
    id: 6,
    nama: "Reza Firmansyah",
    nisn: "0031234572",
    nik: "3278123456780006",
    kelas: "9A",
    jenisKelamin: "L",
    tempatLahir: "Ciamis",
    tanggalLahir: "07 Apr 2011",
    agama: "Islam",
    alamat: "Jl. Cieunteung No. 9, Tasikmalaya",
    noTelepon: "0896-4433-2211",
    status: "aktif",
    tahunMasuk: "2023",
  },
];

/* =========================================================
   CONSTANT
========================================================= */

const KARTU_IDENTITAS_URL = "/admin/siswa/kartu-identitas";

/* =========================================================
   HELPER
========================================================= */

function getInitials(nama) {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

/* =========================================================
   QR PLACEHOLDER
========================================================= */

function QRCodePlaceholder() {
  const patterns = [
    0,
    1,
    2,
    7,
    8,
    9,
    14,
    15,
    16,
    4,
    5,
    6,
    11,
    12,
    13,
    18,
    19,
    20,
    28,
    29,
    30,
    35,
    36,
    37,
    42,
    43,
    44,
    24,
    26,
    32,
    34,
    40,
    41,
    46,
    48,
  ];

  return (
    <div className="w-[82px] h-[82px] bg-white rounded-lg p-1.5 grid grid-cols-7 gap-[2px] border border-slate-200">
      {Array.from({ length: 49 }).map((_, index) => (
        <div
          key={index}
          className={`rounded-[1px] ${
            patterns.includes(index) ? "bg-slate-900" : "bg-white"
          }`}
        />
      ))}
    </div>
  );
}

/* =========================================================
   CARD FRONT
========================================================= */

function StudentCard({ siswa }) {
  return (
    <div
      id="student-card"
      className="relative w-[430px] max-w-full aspect-[1.586/1] rounded-2xl overflow-hidden bg-white shadow-2xl border border-slate-200 print:shadow-none print:border-0"
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-28 w-72 h-72 rounded-full bg-[#155DFC]/10" />

        <div className="absolute -left-24 -bottom-32 w-80 h-80 rounded-full bg-[#155DFC]/5" />

        <div className="absolute right-0 top-0 w-[48%] h-full bg-gradient-to-br from-[#155DFC] to-[#0d47c9] clip-card" />

        <div className="absolute right-[25%] -top-20 w-44 h-44 rounded-full border-[22px] border-white/10" />

        <div className="absolute right-[5%] bottom-[-70px] w-48 h-48 rounded-full border-[28px] border-white/10" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 h-full flex flex-col p-5">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <School size={24} className="text-[#155DFC]" />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
              SMARTSCHOOL
            </p>

            <h3 className="text-sm font-extrabold text-slate-900">
              KARTU PELAJAR
            </h3>

            <p className="text-[8px] text-slate-500">
              Student Identity Card
            </p>
          </div>
        </div>

        {/* MAIN */}
        <div className="flex-1 flex items-center gap-4 mt-2">
          {/* PHOTO */}
          <div className="relative w-[92px] h-[115px] rounded-xl overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-400">
                {getInitials(siswa.nama)}
              </span>
            </div>
          </div>

          {/* INFO */}
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">
              Nama Lengkap
            </p>

            <h2 className="text-lg font-extrabold text-slate-900 leading-tight truncate max-w-[185px]">
              {siswa.nama}
            </h2>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[8px] text-slate-400 w-12">
                  NISN
                </span>

                <span className="text-[9px] font-bold text-slate-700">
                  {siswa.nisn}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[8px] text-slate-400 w-12">
                  KELAS
                </span>

                <span className="text-[9px] font-bold text-slate-700">
                  {siswa.kelas}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[8px] text-slate-400 w-12">
                  LAHIR
                </span>

                <span className="text-[9px] font-semibold text-slate-700">
                  {siswa.tempatLahir}, {siswa.tanggalLahir}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[8px] text-slate-400">Tahun Ajaran</p>

            <p className="text-[10px] font-bold text-slate-700">
              {siswa.tahunMasuk} / {Number(siswa.tahunMasuk) + 1}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <QRCodePlaceholder />

            <span className="text-[6px] text-slate-400 mt-1">
              SCAN TO VERIFY
            </span>
          </div>
        </div>
      </div>

      {/* CARD LABEL */}
      <div className="absolute right-4 top-4 z-20">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[7px] font-bold uppercase tracking-wider">
          <ShieldCheck size={9} />
          Official
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   CARD BACK
========================================================= */

function StudentCardBack({ siswa }) {
  return (
    <div className="relative w-[430px] max-w-full aspect-[1.586/1] rounded-2xl overflow-hidden bg-white shadow-2xl border border-slate-200 print:shadow-none print:border-0">
      {/* TOP */}
      <div className="h-[30%] bg-gradient-to-r from-[#155DFC] to-[#0d47c9] relative overflow-hidden">
        <div className="absolute -right-10 -top-16 w-44 h-44 rounded-full border-[20px] border-white/10" />

        <div className="relative z-10 p-5 text-white">
          <p className="text-[8px] uppercase tracking-[0.2em] opacity-70">
            SMARTSCHOOL
          </p>

          <h3 className="text-sm font-bold mt-1">Kartu Pelajar</h3>
        </div>
      </div>

      {/* BLACK STRIPE */}
      <div className="h-7 bg-slate-900 mt-3" />

      {/* CONTENT */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p className="text-[7px] text-slate-400 uppercase">NISN</p>

            <p className="text-[9px] font-bold text-slate-700">
              {siswa.nisn}
            </p>
          </div>

          <div>
            <p className="text-[7px] text-slate-400 uppercase">NIK</p>

            <p className="text-[9px] font-bold text-slate-700">
              {siswa.nik}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-[7px] text-slate-400 uppercase">Alamat</p>

            <p className="text-[9px] font-semibold text-slate-700">
              {siswa.alamat}
            </p>
          </div>

          <div>
            <p className="text-[7px] text-slate-400 uppercase">Telepon</p>

            <p className="text-[9px] font-bold text-slate-700">
              {siswa.noTelepon}
            </p>
          </div>

          <div>
            <p className="text-[7px] text-slate-400 uppercase">Agama</p>

            <p className="text-[9px] font-bold text-slate-700">
              {siswa.agama}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[7px] text-slate-400 max-w-[220px] leading-relaxed">
            Kartu ini merupakan identitas resmi siswa. Jika ditemukan, harap
            dikembalikan kepada pihak sekolah.
          </p>

          <div className="text-right">
            <p className="text-[7px] text-slate-400">STATUS</p>

            <p className="text-[9px] font-bold text-emerald-600 uppercase">
              {siswa.status}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
        {icon}
      </div>

      <div>
        <p className="text-[11px] text-slate-400">{label}</p>

        <p className="text-sm font-semibold text-slate-700">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function IDCardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [siswa, setSiswa] = useState(null);
  const [loading, setLoading] = useState(true);

  const id = searchParams.get("id");

  /* =======================================================
     GET DATA
  ======================================================= */

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const found = MOCK_SISWA.find((item) => item.id === Number(id));

    setSiswa(found || null);
    setLoading(false);
  }, [id]);

  /* =======================================================
     KEMBALI KE HALAMAN AWAL KARTU IDENTITAS
  ======================================================= */

  const handleBackToKartuIdentitas = () => {
    router.push(KARTU_IDENTITAS_URL);
  };

  /* =======================================================
     PRINT
  ======================================================= */

  const handlePrint = () => {
    window.print();
  };

  /* =======================================================
     SIDEBAR
  ======================================================= */

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar
          active="siswaKartuIdentitas"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="admin"
        />

        <div className="flex-1 flex flex-col">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex-1 flex items-center justify-center">
            <div className="w-9 h-9 rounded-full border-4 border-slate-200 border-t-[#155DFC] animate-spin" />
          </main>
        </div>
      </div>
    );
  }

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!siswa) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar
          active="siswaKartuIdentitas"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="admin"
        />

        <div className="flex-1 flex flex-col">
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
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <CreditCard size={28} className="text-slate-400" />
              </div>

              <h1 className="text-lg font-bold text-slate-800">
                ID Card tidak ditemukan
              </h1>

              <p className="text-sm text-slate-500 mt-1 mb-5">
                Data siswa yang dipilih tidak tersedia.
              </p>

              <button
                onClick={handleBackToKartuIdentitas}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#155DFC] text-white text-sm font-semibold hover:bg-[#0d47c9] transition"
              >
                <ArrowLeft size={16} />
                Kembali ke Kartu Identitas
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
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
        <div className="print:hidden">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* PAGE HEADER */}
            <div className="print:hidden flex items-center justify-between gap-4 flex-wrap mb-7">
              <div className="flex items-center gap-3">
                {/* KEMBALI KE HALAMAN AWAL KARTU IDENTITAS */}
                <button
                  onClick={handleBackToKartuIdentitas}
                  aria-label="Kembali ke Kartu Identitas"
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#155DFC] hover:bg-slate-50 transition"
                >
                  <ArrowLeft size={18} />
                </button>

                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    ID Card Siswa
                  </h1>

                  <p className="text-sm text-slate-500 mt-0.5">
                    Preview kartu identitas siswa.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  <Printer size={16} />
                  Cetak
                </button>

                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold shadow-lg shadow-[#155DFC]/20 hover:brightness-105 transition"
                >
                  <Download size={16} />
                  Cetak / Simpan
                </button>
              </div>
            </div>

            {/* PREVIEW */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="print:hidden px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CreditCard size={17} className="text-[#155DFC]" />

                  <h2 className="text-sm font-bold text-slate-800">
                    Preview Kartu
                  </h2>
                </div>

                <p className="text-xs text-slate-500 mt-1">
                  Tampilan kartu depan dan belakang sebelum dicetak.
                </p>
              </div>

              {/* CARDS */}
              <div className="p-5 sm:p-8 lg:p-10">
                <div className="flex flex-col xl:flex-row items-center justify-center gap-8 xl:gap-12">
                  {/* FRONT */}
                  <div className="w-full flex flex-col items-center gap-3">
                    <div className="print:hidden flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#eaf1ff] text-[#155DFC] flex items-center justify-center text-[10px] font-bold">
                        01
                      </span>

                      <span className="text-xs font-bold text-slate-600">
                        Bagian Depan
                      </span>
                    </div>

                    <StudentCard siswa={siswa} />
                  </div>

                  {/* BACK */}
                  <div className="w-full flex flex-col items-center gap-3">
                    <div className="print:hidden flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#eaf1ff] text-[#155DFC] flex items-center justify-center text-[10px] font-bold">
                        02
                      </span>

                      <span className="text-xs font-bold text-slate-600">
                        Bagian Belakang
                      </span>
                    </div>

                    <StudentCardBack siswa={siswa} />
                  </div>
                </div>
              </div>
            </div>

            {/* DATA SISWA */}
            <div className="print:hidden mt-5 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-800">
                  Informasi Siswa
                </h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  Data yang digunakan pada kartu identitas.
                </p>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <InfoItem
                  icon={<User size={16} />}
                  label="Nama"
                  value={siswa.nama}
                />

                <InfoItem
                  icon={<CreditCard size={16} />}
                  label="NISN"
                  value={siswa.nisn}
                />

                <InfoItem
                  icon={<School size={16} />}
                  label="Kelas"
                  value={siswa.kelas}
                />

                <InfoItem
                  icon={<CalendarDays size={16} />}
                  label="Tanggal Lahir"
                  value={siswa.tanggalLahir}
                />

                <InfoItem
                  icon={<MapPin size={16} />}
                  label="Tempat Lahir"
                  value={siswa.tempatLahir}
                />

                <InfoItem
                  icon={<Phone size={16} />}
                  label="Telepon"
                  value={siswa.noTelepon}
                />

                <InfoItem
                  icon={<User size={16} />}
                  label="Jenis Kelamin"
                  value={
                    siswa.jenisKelamin === "L"
                      ? "Laki-laki"
                      : "Perempuan"
                  }
                />

                <InfoItem
                  icon={<ShieldCheck size={16} />}
                  label="Status"
                  value={
                    siswa.status === "aktif"
                      ? "Aktif"
                      : "Nonaktif"
                  }
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="print:hidden flex items-center justify-between mt-5 pb-4">
              {/* KEMBALI KE HALAMAN AWAL KARTU IDENTITAS */}
              <button
                onClick={handleBackToKartuIdentitas}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
              >
                <ArrowLeft size={16} />
                Kembali ke Kartu Identitas
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold shadow-lg shadow-[#155DFC]/20"
              >
                <Printer size={16} />
                Cetak ID Card
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* PRINT STYLE */}
      <style jsx global>{`
        .clip-card {
          clip-path: polygon(30% 0, 100% 0, 100% 100%, 0% 100%);
        }

        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }

          body {
            background: white !important;
          }

          #student-card {
            break-inside: avoid;
          }

          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}