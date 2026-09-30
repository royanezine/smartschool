"use client";

import { Suspense, useEffect, useState } from "react";
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

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

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
   THEME HELPERS
========================================================= */

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

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
    <div
      className={`w-[82px] h-[82px] theme-card rounded-lg p-1.5 grid grid-cols-7 gap-[2px] border ${themeNeutralBorder}`}
    >
      {Array.from({ length: 49 }).map((_, index) => (
        <div
          key={index}
          className={`rounded-[1px] ${
            patterns.includes(index)
              ? "bg-[var(--color-text)]"
              : "bg-[var(--color-card)]"
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
      className={`relative w-[430px] max-w-full aspect-[1.586/1] rounded-2xl overflow-hidden theme-card ${themeCardShadow} border ${themeNeutralBorder} print:shadow-none print:border-0`}
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -right-24 -top-28 w-72 h-72 rounded-full"
          style={{
            background:
              "color-mix(in srgb, var(--color-primary) 10%, transparent)",
          }}
        />

        <div
          className="absolute -left-24 -bottom-32 w-80 h-80 rounded-full"
          style={{
            background:
              "color-mix(in srgb, var(--color-primary) 5%, transparent)",
          }}
        />

        <div
          className={`absolute right-0 top-0 w-[48%] h-full ${themePrimaryGradient} clip-card`}
        />

        <div
          className="absolute right-[25%] -top-20 w-44 h-44 rounded-full border-[22px]"
          style={{
            borderColor:
              "color-mix(in srgb, var(--color-card) 10%, transparent)",
          }}
        />

        <div
          className="absolute right-[5%] bottom-[-70px] w-48 h-48 rounded-full border-[28px]"
          style={{
            borderColor:
              "color-mix(in srgb, var(--color-card) 10%, transparent)",
          }}
        />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 h-full flex flex-col p-5">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl theme-card flex items-center justify-center ${themeCardShadow}`}
          >
            <School
              size={24}
              className="text-[var(--color-primary)]"
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] theme-text-muted">
              SMARTSCHOOL
            </p>

            <h3 className="text-sm font-extrabold theme-text">
              KARTU PELAJAR
            </h3>

            <p className="text-[8px] theme-text-secondary">
              Student Identity Card
            </p>
          </div>
        </div>

        {/* MAIN */}
        <div className="flex-1 flex items-center gap-4 mt-2">
          {/* PHOTO */}
          <div
            className={`relative w-[92px] h-[115px] rounded-xl overflow-hidden border-4 theme-card ${themeCardShadow} ${themeNeutralSurface} flex-shrink-0`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold theme-text-muted">
                {getInitials(siswa.nama)}
              </span>
            </div>
          </div>

          {/* INFO */}
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-wider theme-text-muted font-semibold">
              Nama Lengkap
            </p>

            <h2 className="text-lg font-extrabold theme-text leading-tight truncate max-w-[185px]">
              {siswa.nama}
            </h2>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[8px] theme-text-muted w-12">
                  NISN
                </span>

                <span className="text-[9px] font-bold theme-text-secondary">
                  {siswa.nisn}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[8px] theme-text-muted w-12">
                  KELAS
                </span>

                <span className="text-[9px] font-bold theme-text-secondary">
                  {siswa.kelas}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[8px] theme-text-muted w-12">
                  LAHIR
                </span>

                <span className="text-[9px] font-semibold theme-text-secondary">
                  {siswa.tempatLahir}, {siswa.tanggalLahir}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[8px] theme-text-muted">
              Tahun Ajaran
            </p>

            <p className="text-[10px] font-bold theme-text-secondary">
              {siswa.tahunMasuk} / {Number(siswa.tahunMasuk) + 1}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <QRCodePlaceholder />

            <span className="text-[6px] theme-text-muted mt-1">
              SCAN TO VERIFY
            </span>
          </div>
        </div>
      </div>

      {/* CARD LABEL */}
      <div className="absolute right-4 top-4 z-20">
        <span
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm border text-[7px] font-bold uppercase tracking-wider"
          style={{
            background:
              "color-mix(in srgb, var(--color-card) 15%, transparent)",
            borderColor:
              "color-mix(in srgb, var(--color-card) 20%, transparent)",
            color: "var(--color-card)",
          }}
        >
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
    <div
      className={`relative w-[430px] max-w-full aspect-[1.586/1] rounded-2xl overflow-hidden theme-card ${themeCardShadow} border ${themeNeutralBorder} print:shadow-none print:border-0`}
    >
      {/* TOP */}
      <div
        className={`h-[30%] ${themePrimaryGradient} relative overflow-hidden`}
      >
        <div
          className="absolute -right-10 -top-16 w-44 h-44 rounded-full border-[20px]"
          style={{
            borderColor:
              "color-mix(in srgb, var(--color-card) 10%, transparent)",
          }}
        />

        <div
          className="relative z-10 p-5"
          style={{ color: "var(--color-card)" }}
        >
          <p className="text-[8px] uppercase tracking-[0.2em] opacity-70">
            SMARTSCHOOL
          </p>

          <h3 className="text-sm font-bold mt-1">
            Kartu Pelajar
          </h3>
        </div>
      </div>

      {/* STRIPE */}
      <div
        className="h-7 mt-3"
        style={{ background: "var(--color-text)" }}
      />

      {/* CONTENT */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p className="text-[7px] theme-text-muted uppercase">
              NISN
            </p>

            <p className="text-[9px] font-bold theme-text-secondary">
              {siswa.nisn}
            </p>
          </div>

          <div>
            <p className="text-[7px] theme-text-muted uppercase">
              NIK
            </p>

            <p className="text-[9px] font-bold theme-text-secondary">
              {siswa.nik}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-[7px] theme-text-muted uppercase">
              Alamat
            </p>

            <p className="text-[9px] font-semibold theme-text-secondary">
              {siswa.alamat}
            </p>
          </div>

          <div>
            <p className="text-[7px] theme-text-muted uppercase">
              Telepon
            </p>

            <p className="text-[9px] font-bold theme-text-secondary">
              {siswa.noTelepon}
            </p>
          </div>

          <div>
            <p className="text-[7px] theme-text-muted uppercase">
              Agama
            </p>

            <p className="text-[9px] font-bold theme-text-secondary">
              {siswa.agama}
            </p>
          </div>
        </div>

        <div
          className={`mt-4 pt-3 border-t ${themeDivider} flex items-center justify-between`}
        >
          <p className="text-[7px] theme-text-muted max-w-[220px] leading-relaxed">
            Kartu ini merupakan identitas resmi siswa. Jika ditemukan, harap
            dikembalikan kepada pihak sekolah.
          </p>

          <div className="text-right">
            <p className="text-[7px] theme-text-muted">
              STATUS
            </p>

            <p
              className={`text-[9px] font-bold uppercase ${
                siswa.status === "aktif"
                  ? "theme-success"
                  : "theme-text-muted"
              }`}
            >
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
      <div
        className={`w-9 h-9 rounded-lg ${themeNeutralSurface} border ${themeNeutralBorder} flex items-center justify-center theme-text-muted`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[11px] theme-text-muted">
          {label}
        </p>

        <p className="text-sm font-semibold theme-text-secondary">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

function IDCardPageContent() {
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

    const found = MOCK_SISWA.find(
      (item) => item.id === Number(id)
    );

    setSiswa(found || null);
    setLoading(false);
  }, [id]);

  /* =======================================================
     KEMBALI
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
      <div className="flex h-screen theme-page">
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
            <div
              className="w-9 h-9 rounded-full border-4 animate-spin"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--color-text) 12%, transparent)",
                borderTopColor: "var(--color-primary)",
              }}
            />
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
      <div className="flex h-screen theme-page">
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
              <div
                className={`w-16 h-16 mx-auto rounded-full ${themeNeutralSurface} flex items-center justify-center mb-4`}
              >
                <CreditCard
                  size={28}
                  className="theme-text-muted"
                />
              </div>

              <h1 className="text-lg font-bold theme-text">
                ID Card tidak ditemukan
              </h1>

              <p className="text-sm theme-text-secondary mt-1 mb-5">
                Data siswa yang dipilih tidak tersedia.
              </p>

              <button
                onClick={handleBackToKartuIdentitas}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] text-sm font-semibold ${themePrimaryShadow} hover:brightness-105 transition`}
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
    <div className="flex h-screen w-full theme-page overflow-hidden">
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
                <button
                  onClick={handleBackToKartuIdentitas}
                  aria-label="Kembali ke Kartu Identitas"
                  className={`w-10 h-10 rounded-xl theme-card border ${themeNeutralBorder} flex items-center justify-center theme-text-secondary ${themeNeutralHover} hover:text-[var(--color-primary)] transition`}
                >
                  <ArrowLeft size={18} />
                </button>

                <div>
                  <h1 className="text-2xl font-bold theme-text">
                    ID Card Siswa
                  </h1>

                  <p className="text-sm theme-text-secondary mt-0.5">
                    Preview kartu identitas siswa.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border ${themeNeutralBorder} theme-card theme-text-secondary text-sm font-semibold ${themeNeutralHover} transition`}
                >
                  <Printer size={16} />
                  Cetak
                </button>

                <button
                  onClick={handlePrint}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] text-sm font-semibold ${themePrimaryShadow} hover:brightness-105 transition`}
                >
                  <Download size={16} />
                  Cetak / Simpan
                </button>
              </div>
            </div>

            {/* PREVIEW */}
            <div
              className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} overflow-hidden`}
            >
              <div
                className={`print:hidden px-5 py-4 border-b ${themeDivider}`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard
                    size={17}
                    className="text-[var(--color-primary)]"
                  />

                  <h2 className="text-sm font-bold theme-text">
                    Preview Kartu
                  </h2>
                </div>

                <p className="text-xs theme-text-secondary mt-1">
                  Tampilan kartu depan dan belakang sebelum dicetak.
                </p>
              </div>

              {/* CARDS */}
              <div className="p-5 sm:p-8 lg:p-10">
                <div className="flex flex-col xl:flex-row items-center justify-center gap-8 xl:gap-12">
                  {/* FRONT */}
                  <div className="w-full flex flex-col items-center gap-3">
                    <div className="print:hidden flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full ${themePrimarySoft} ${themePrimaryText} flex items-center justify-center text-[10px] font-bold`}
                      >
                        01
                      </span>

                      <span className="text-xs font-bold theme-text-secondary">
                        Bagian Depan
                      </span>
                    </div>

                    <StudentCard siswa={siswa} />
                  </div>

                  {/* BACK */}
                  <div className="w-full flex flex-col items-center gap-3">
                    <div className="print:hidden flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full ${themePrimarySoft} ${themePrimaryText} flex items-center justify-center text-[10px] font-bold`}
                      >
                        02
                      </span>

                      <span className="text-xs font-bold theme-text-secondary">
                        Bagian Belakang
                      </span>
                    </div>

                    <StudentCardBack siswa={siswa} />
                  </div>
                </div>
              </div>
            </div>

            {/* DATA SISWA */}
            <div
              className={`print:hidden mt-5 theme-card rounded-xl border ${themeNeutralBorder} ${themeCardShadow} overflow-hidden`}
            >
              <div
                className={`px-5 py-4 border-b ${themeDivider}`}
              >
                <h2 className="text-sm font-bold theme-text">
                  Informasi Siswa
                </h2>

                <p className="text-xs theme-text-secondary mt-0.5">
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
              <button
                onClick={handleBackToKartuIdentitas}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border ${themeNeutralBorder} theme-card theme-text-secondary text-sm font-semibold ${themeNeutralHover} transition`}
              >
                <ArrowLeft size={16} />
                Kembali ke Kartu Identitas
              </button>

              <button
                onClick={handlePrint}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] text-sm font-semibold ${themePrimaryShadow}`}
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

export default function IDCardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen theme-page" />
      }
    >
      <IDCardPageContent />
    </Suspense>
  );
}