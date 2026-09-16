"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Download,
  User,
  School,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  CreditCard,
  ShieldCheck,
  GraduationCap,
  Loader2,
} from "lucide-react";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

/* =========================================================
   DATA GURU
   Nanti tinggal diganti dengan data dari API
========================================================= */

const DEFAULT_GURU = [
  {
    id: 1,
    nama: "Andi Pratama, S.Pd.",
    nip: "198506152010011001",
    nuptk: "1234567890123456",
    jenisKelamin: "L",
    tempatLahir: "Tasikmalaya",
    tanggalLahir: "1985-06-15",
    agama: "Islam",
    noTelepon: "0812-3456-7890",
    email: "andi.pratama@smartschool.sch.id",
    alamat: "Jl. Merdeka No. 15, Tasikmalaya",
    mapel: "Matematika",
    jabatan: "Guru Mata Pelajaran",
    status: "aktif",
    tahunMasuk: "2010",
  },
  {
    id: 2,
    nama: "Siti Rahmawati, S.Pd.",
    nip: "198703122012022002",
    nuptk: "1234567890123457",
    jenisKelamin: "P",
    tempatLahir: "Bandung",
    tanggalLahir: "1987-03-12",
    agama: "Islam",
    noTelepon: "0813-2233-4455",
    email: "siti.rahmawati@smartschool.sch.id",
    alamat: "Jl. Cihideung No. 22, Tasikmalaya",
    mapel: "Bahasa Indonesia",
    jabatan: "Guru Mata Pelajaran",
    status: "aktif",
    tahunMasuk: "2012",
  },
];


/* =========================================================
   INITIAL
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
   QR CODE PLACEHOLDER
========================================================= */

function QRCodePlaceholder() {
  const patterns = [
    0, 1, 2, 7, 8, 9, 14, 15, 16,
    4, 5, 6, 11, 12, 13, 18, 19, 20,
    28, 29, 30, 35, 36, 37, 42, 43, 44,
    24, 26, 32, 34, 40, 41, 46, 48,
  ];

  return (
    <div className="w-[82px] h-[82px] bg-white rounded-lg p-1.5 grid grid-cols-7 gap-[2px] border border-slate-200">
      {Array.from({ length: 49 }).map((_, index) => (
        <div
          key={index}
          className={`rounded-[1px] ${
            patterns.includes(index)
              ? "bg-slate-900"
              : "bg-white"
          }`}
        />
      ))}
    </div>
  );
}


/* =========================================================
   CARD DEPAN GURU
========================================================= */

function TeacherCard({ guru }) {
  return (
    <div
      id="teacher-card-front"
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

            <School
              size={24}
              className="text-[#155DFC]"
            />

          </div>


          <div>

            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
              SMARTSCHOOL
            </p>

            <h3 className="text-sm font-extrabold text-slate-900">
              KARTU IDENTITAS GURU
            </h3>

            <p className="text-[8px] text-slate-500">
              Teacher Identity Card
            </p>

          </div>

        </div>


        {/* MAIN */}

        <div className="flex-1 flex items-center gap-4 mt-2">


          {/* FOTO */}

          <div className="relative w-[92px] h-[115px] rounded-xl overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">

            <div className="absolute inset-0 flex items-center justify-center">

              <span className="text-2xl font-bold text-slate-400">
                {getInitials(guru.nama)}
              </span>

            </div>

          </div>


          {/* DATA GURU */}

          <div className="min-w-0">

            <p className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">
              Nama Lengkap
            </p>

            <h2 className="text-[17px] font-extrabold text-slate-900 leading-tight max-w-[200px]">
              {guru.nama}
            </h2>


            <div className="mt-2 space-y-1">


              <div className="flex items-center gap-2">

                <span className="text-[8px] text-slate-400 w-12">
                  NIP
                </span>

                <span className="text-[9px] font-bold text-slate-700">
                  {guru.nip}
                </span>

              </div>


              <div className="flex items-center gap-2">

                <span className="text-[8px] text-slate-400 w-12">
                  NUPTK
                </span>

                <span className="text-[9px] font-bold text-slate-700">
                  {guru.nuptk}
                </span>

              </div>


              <div className="flex items-center gap-2">

                <span className="text-[8px] text-slate-400 w-12">
                  MAPEL
                </span>

                <span className="text-[9px] font-semibold text-slate-700">
                  {guru.mapel}
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* FOOTER */}

        <div className="flex items-end justify-between">

          <div>

            <p className="text-[8px] text-slate-400">
              Jabatan
            </p>

            <p className="text-[9px] font-bold text-slate-700">
              {guru.jabatan}
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


      {/* OFFICIAL */}

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
   CARD BELAKANG GURU
========================================================= */

function TeacherCardBack({ guru }) {
  return (
    <div
      id="teacher-card-back"
      className="relative w-[430px] max-w-full aspect-[1.586/1] rounded-2xl overflow-hidden bg-white shadow-2xl border border-slate-200 print:shadow-none print:border-0"
    >

      {/* HEADER */}

      <div className="h-[30%] bg-gradient-to-r from-[#155DFC] to-[#0d47c9] relative overflow-hidden">

        <div className="absolute -right-10 -top-16 w-44 h-44 rounded-full border-[20px] border-white/10" />

        <div className="relative z-10 p-5 text-white">

          <p className="text-[8px] uppercase tracking-[0.2em] opacity-70">
            SMARTSCHOOL
          </p>

          <h3 className="text-sm font-bold mt-1">
            Kartu Identitas Guru
          </h3>

        </div>

      </div>


      {/* STRIPE */}

      <div className="h-7 bg-slate-900 mt-3" />


      {/* DATA */}

      <div className="p-5">

        <div className="grid grid-cols-2 gap-x-6 gap-y-3">


          <div>

            <p className="text-[7px] text-slate-400 uppercase">
              NIP
            </p>

            <p className="text-[9px] font-bold text-slate-700">
              {guru.nip}
            </p>

          </div>


          <div>

            <p className="text-[7px] text-slate-400 uppercase">
              NUPTK
            </p>

            <p className="text-[9px] font-bold text-slate-700">
              {guru.nuptk}
            </p>

          </div>


          <div>

            <p className="text-[7px] text-slate-400 uppercase">
              Tempat / Tanggal Lahir
            </p>

            <p className="text-[9px] font-semibold text-slate-700">
              {guru.tempatLahir},{" "}
              {guru.tanggalLahir}
            </p>

          </div>


          <div>

            <p className="text-[7px] text-slate-400 uppercase">
              Agama
            </p>

            <p className="text-[9px] font-bold text-slate-700">
              {guru.agama}
            </p>

          </div>


          <div>

            <p className="text-[7px] text-slate-400 uppercase">
              Mata Pelajaran
            </p>

            <p className="text-[9px] font-bold text-slate-700">
              {guru.mapel}
            </p>

          </div>


          <div>

            <p className="text-[7px] text-slate-400 uppercase">
              Telepon
            </p>

            <p className="text-[9px] font-bold text-slate-700">
              {guru.noTelepon}
            </p>

          </div>


          <div className="col-span-2">

            <p className="text-[7px] text-slate-400 uppercase">
              Email
            </p>

            <p className="text-[9px] font-semibold text-slate-700">
              {guru.email}
            </p>

          </div>


          <div className="col-span-2">

            <p className="text-[7px] text-slate-400 uppercase">
              Alamat
            </p>

            <p className="text-[9px] font-semibold text-slate-700">
              {guru.alamat}
            </p>

          </div>

        </div>


        {/* FOOTER */}

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">

          <p className="text-[7px] text-slate-400 max-w-[230px] leading-relaxed">

            Kartu ini merupakan identitas resmi tenaga
            pendidik SmartSchool. Jika ditemukan,
            harap dikembalikan kepada pihak sekolah.

          </p>


          <div className="text-right">

            <p className="text-[7px] text-slate-400">
              STATUS
            </p>

            <p className="text-[9px] font-bold text-emerald-600 uppercase">
              {guru.status}
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

      <div className="min-w-0">

        <p className="text-[11px] text-slate-400">
          {label}
        </p>

        <p className="text-sm font-semibold text-slate-700 truncate">
          {value || "-"}
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   MAIN PAGE
========================================================= */

export default function GuruCardPage() {

  const router = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams.get("id");

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [guru, setGuru] = useState(null);

  const [loading, setLoading] = useState(true);


  /* =======================================================
     LOAD GURU
  ======================================================= */

  useEffect(() => {

    if (!id) {

      setLoading(false);

      return;

    }


    try {

      const savedData =
        localStorage.getItem("smartschool_guru");

      const guruList = savedData
        ? JSON.parse(savedData)
        : DEFAULT_GURU;


      const found = guruList.find(
        (item) =>
          String(item.id) === String(id)
      );


      setGuru(found || null);

    } catch (error) {

      console.error(
        "Gagal mengambil data guru:",
        error
      );

      setGuru(null);

    }


    setLoading(false);

  }, [id]);


  /* =======================================================
     PRINT
  ======================================================= */

  const handlePrint = () => {

    window.print();

  };


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <div className="flex h-screen bg-slate-50">

        <Sidebar
          active="guru"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="admin"
        />


        <div className="flex-1 flex flex-col">

          <Header
            toggleSidebar={() =>
              setIsCollapsed(!isCollapsed)
            }
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />


          <main className="flex-1 flex items-center justify-center">

            <Loader2
              size={32}
              className="animate-spin text-blue-600"
            />

          </main>

        </div>

      </div>

    );

  }


  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!guru) {

    return (

      <div className="flex h-screen bg-slate-50">

        <Sidebar
          active="guru"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="admin"
        />


        <div className="flex-1 flex flex-col">

          <Header
            toggleSidebar={() =>
              setIsCollapsed(!isCollapsed)
            }
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />


          <main className="flex-1 flex items-center justify-center">

            <div className="text-center">

              <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">

                <CreditCard
                  size={28}
                  className="text-slate-400"
                />

              </div>


              <h1 className="text-lg font-bold text-slate-800">
                Data guru tidak ditemukan
              </h1>


              <p className="text-sm text-slate-500 mt-1 mb-5">
                Data guru yang dipilih tidak tersedia.
              </p>


              <button
                onClick={() =>
                  router.push("/admin/guru")
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#155DFC] text-white text-sm font-semibold"
              >

                <ArrowLeft size={16} />

                Kembali

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
        active="guru"
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
            toggleSidebar={() =>
              setIsCollapsed(!isCollapsed)
            }
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


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="print:hidden flex items-center justify-between gap-4 flex-wrap mb-7">


              <div className="flex items-center gap-3">

                            <button
              onClick={() =>
                router.push("/admin/guru/kartu-identitas")
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
            >
              <ArrowLeft size={16} />
              Kembali
            </button>


                <div>

                  <h1 className="text-2xl font-bold text-slate-800">
                    ID Card Guru
                  </h1>

                  <p className="text-sm text-slate-500 mt-0.5">
                    Preview kartu identitas guru.
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold shadow-lg shadow-[#155DFC]/20"
                >

                  <Download size={16} />

                  Cetak / Simpan

                </button>

              </div>

            </div>


            {/* =================================================
                CARD PREVIEW
            ================================================= */}

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">


              {/* HEADER PREVIEW */}

              <div className="print:hidden px-5 py-4 border-b border-slate-100">

                <div className="flex items-center gap-2">

                  <CreditCard
                    size={17}
                    className="text-[#155DFC]"
                  />

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


                  {/* DEPAN */}

                  <div className="w-full flex flex-col items-center gap-3">

                    <div className="print:hidden flex items-center gap-2">

                      <span className="w-6 h-6 rounded-full bg-[#eaf1ff] text-[#155DFC] flex items-center justify-center text-[10px] font-bold">
                        01
                      </span>

                      <span className="text-xs font-bold text-slate-600">
                        Bagian Depan
                      </span>

                    </div>


                    <TeacherCard guru={guru} />

                  </div>


                  {/* BELAKANG */}

                  <div className="w-full flex flex-col items-center gap-3">

                    <div className="print:hidden flex items-center gap-2">

                      <span className="w-6 h-6 rounded-full bg-[#eaf1ff] text-[#155DFC] flex items-center justify-center text-[10px] font-bold">
                        02
                      </span>

                      <span className="text-xs font-bold text-slate-600">
                        Bagian Belakang
                      </span>

                    </div>


                    <TeacherCardBack guru={guru} />

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                INFORMASI GURU
            ================================================= */}

            <div className="print:hidden mt-5 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">


              <div className="px-5 py-4 border-b border-slate-100">

                <h2 className="text-sm font-bold text-slate-800">
                  Informasi Guru
                </h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  Data yang digunakan pada kartu identitas.
                </p>

              </div>


              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">


                <InfoItem
                  icon={<User size={16} />}
                  label="Nama"
                  value={guru.nama}
                />


                <InfoItem
                  icon={<CreditCard size={16} />}
                  label="NIP"
                  value={guru.nip}
                />


                <InfoItem
                  icon={<CreditCard size={16} />}
                  label="NUPTK"
                  value={guru.nuptk}
                />


                <InfoItem
                  icon={<GraduationCap size={16} />}
                  label="Mata Pelajaran"
                  value={guru.mapel}
                />


                <InfoItem
                  icon={<School size={16} />}
                  label="Jabatan"
                  value={guru.jabatan}
                />


                <InfoItem
                  icon={<CalendarDays size={16} />}
                  label="Tanggal Lahir"
                  value={guru.tanggalLahir}
                />


                <InfoItem
                  icon={<Phone size={16} />}
                  label="Telepon"
                  value={guru.noTelepon}
                />


                <InfoItem
                  icon={<Mail size={16} />}
                  label="Email"
                  value={guru.email}
                />


                <InfoItem
                  icon={<MapPin size={16} />}
                  label="Alamat"
                  value={guru.alamat}
                />


                <InfoItem
                  icon={<ShieldCheck size={16} />}
                  label="Status"
                  value={
                    guru.status === "aktif"
                      ? "Aktif"
                      : "Nonaktif"
                  }
                />

              </div>

            </div>


            {/* =================================================
                FOOTER BUTTON
            ================================================= */}

            <div className="print:hidden flex items-center justify-between mt-5 pb-4">


                              <button
                    onClick={() => router.push("/admin/guru")}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                  >
                    <ArrowLeft size={16} />
                    Kembali ke Daftar Guru
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


      {/* =====================================================
          PRINT
      ===================================================== */}

      <style jsx global>{`

        .clip-card {
          clip-path: polygon(
            30% 0,
            100% 0,
            100% 100%,
            0% 100%
          );
        }


        @media print {

          @page {
            size: A4;
            margin: 15mm;
          }


          body {
            background: white !important;
          }


          .print\\:hidden {
            display: none !important;
          }


          #teacher-card-front,
          #teacher-card-back {
            break-inside: avoid;
          }

        }

      `}</style>

    </div>
  );
}