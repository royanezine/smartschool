"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import {
  Search,
  Filter,
  IdCard,
  Eye,
  CreditCard,
  Users,
  GraduationCap,
  CheckCircle2,
  School,
  Plus,
} from "lucide-react";

/* =========================================================
   MOCK DATA
========================================================= */

const MOCK_SISWA = [
  {
    id: 1,
    nama: "Alya Ramadhani",
    nisn: "0051234567",
    kelas: "7A",
    jenjang: "VII",
    jenisKelamin: "P",
    status: "aktif",
    tempatLahir: "Tasikmalaya",
    tanggalLahir: "12 Mar 2013",
    alamat: "Jl. Merdeka No. 12, Tasikmalaya",
    namaOrtu: "Hendra Ramadhani",
    teleponOrtu: "0812-3456-7890",
    waliKelas: "Siti Rahayu, S.Pd",
    tahunMasuk: "2025",
  },
  {
    id: 2,
    nama: "Bunga Citra Lestari",
    nisn: "0051234568",
    kelas: "7A",
    jenjang: "VII",
    jenisKelamin: "P",
    status: "aktif",
    tempatLahir: "Bandung",
    tanggalLahir: "24 Jul 2013",
    alamat: "Jl. Cihideung No. 5, Tasikmalaya",
    namaOrtu: "Agus Lestari",
    teleponOrtu: "0813-2233-4455",
    waliKelas: "Siti Rahayu, S.Pd",
    tahunMasuk: "2025",
  },
  {
    id: 3,
    nama: "Cahyo Nugroho",
    nisn: "0051234569",
    kelas: "7B",
    jenjang: "VII",
    jenisKelamin: "L",
    status: "aktif",
    tempatLahir: "Tasikmalaya",
    tanggalLahir: "02 Jan 2013",
    alamat: "Jl. Sutisna Senjaya No. 88, Tasikmalaya",
    namaOrtu: "Wawan Nugroho",
    teleponOrtu: "0821-9988-7766",
    waliKelas: "Andi Prasetyo, S.Pd",
    tahunMasuk: "2025",
  },
  {
    id: 4,
    nama: "Indra Kusuma",
    nisn: "0041234570",
    kelas: "8A",
    jenjang: "VIII",
    jenisKelamin: "L",
    status: "aktif",
    tempatLahir: "Garut",
    tanggalLahir: "18 Sep 2012",
    alamat: "Jl. Yudanegara No. 21, Tasikmalaya",
    namaOrtu: "Sutrisno Kusuma",
    teleponOrtu: "0857-1122-3344",
    waliKelas: "Dewi Anggraini, S.Si",
    tahunMasuk: "2024",
  },
  {
    id: 5,
    nama: "Julia Anggraeni",
    nisn: "0041234571",
    kelas: "8A",
    jenjang: "VIII",
    jenisKelamin: "P",
    status: "nonaktif",
    tempatLahir: "Tasikmalaya",
    tanggalLahir: "30 Nov 2012",
    alamat: "Jl. Ir. H. Djuanda No. 40, Tasikmalaya",
    namaOrtu: "Yayan Anggraeni",
    teleponOrtu: "0878-5566-7788",
    waliKelas: "Dewi Anggraini, S.Si",
    tahunMasuk: "2024",
  },
  {
    id: 6,
    nama: "Reza Firmansyah",
    nisn: "0031234572",
    kelas: "9A",
    jenjang: "IX",
    jenisKelamin: "L",
    status: "aktif",
    tempatLahir: "Ciamis",
    tanggalLahir: "07 Apr 2011",
    alamat: "Jl. Cieunteung No. 9, Tasikmalaya",
    namaOrtu: "Dadang Firmansyah",
    teleponOrtu: "0896-4433-2211",
    waliKelas: "Budi Santoso, S.Pd",
    tahunMasuk: "2023",
  },
];

/* =========================================================
   OPTIONS
========================================================= */

const KELAS_OPTIONS = [
  "Semua Kelas",
  ...Array.from(
    new Set(MOCK_SISWA.map((s) => s.kelas))
  ).sort(),
];

const STATUS_OPTIONS = [
  "Semua Status",
  "Aktif",
  "Nonaktif",
];

/* =========================================================
   HELPER
========================================================= */

function getInitials(nama) {
  return nama
    .replace(/,.*/, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* =========================================================
   JENIS KELAMIN BADGE
========================================================= */

function JenisKelaminBadge({ jenisKelamin }) {
  const isPria = jenisKelamin === "L";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
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
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const isActive = status === "aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
        isActive
          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
          : "bg-slate-100 text-slate-500 border border-slate-200"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive
            ? "bg-emerald-500"
            : "bg-slate-400"
        }`}
      />

      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}

/* =========================================================
   AVATAR
========================================================= */

function Avatar({ nama, size = "md" }) {
  const dims =
    size === "sm"
      ? "w-9 h-9 text-xs"
      : "w-16 h-16 text-lg";

  return (
    <div
      className={`${dims} rounded-full bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white flex items-center justify-center font-bold flex-shrink-0`}
    >
      {getInitials(nama)}
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function KartuIdentitasSiswaPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [search, setSearch] = useState("");

  const [kelasFilter, setKelasFilter] =
    useState("Semua Kelas");

  const [statusFilter, setStatusFilter] =
    useState("Semua Status");

  /* =======================================================
     SIDEBAR
  ======================================================= */

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  /* =======================================================
     FILTER DATA
  ======================================================= */

  const filteredSiswa = useMemo(() => {
    return MOCK_SISWA.filter((s) => {
      const searchValue = search.toLowerCase();

      const matchSearch =
        s.nama
          .toLowerCase()
          .includes(searchValue) ||
        s.nisn.includes(searchValue);

      const matchKelas =
        kelasFilter === "Semua Kelas" ||
        s.kelas === kelasFilter;

      const matchStatus =
        statusFilter === "Semua Status" ||
        (statusFilter === "Aktif"
          ? s.status === "aktif"
          : s.status === "nonaktif");

      return (
        matchSearch &&
        matchKelas &&
        matchStatus
      );
    });
  }, [
    search,
    kelasFilter,
    statusFilter,
  ]);

  /* =======================================================
     STATISTIK
  ======================================================= */

  const totalSiswa = MOCK_SISWA.length;

  const totalAktif = MOCK_SISWA.filter(
    (s) => s.status === "aktif"
  ).length;

  const totalKelas = new Set(
    MOCK_SISWA.map((s) => s.kelas)
  ).size;

  /* =======================================================
     DETAIL
  ======================================================= */

  const handleDetail = (s) => {
    router.push(
      `/admin/siswa/kartu-identitas/${s.id}`
    );
  };

  /* =======================================================
     ID CARD
  ======================================================= */

  const handleIdCard = (s) => {
    router.push(
      `/admin/siswa/kartu-identitas/card?id=${s.id}`
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Sidebar
        active="siswaKartuIdentitas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* ===================================================
          CONTENT
      =================================================== */}

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

            <div className="flex items-center justify-between gap-3 flex-wrap">

              <div className="flex items-center gap-3">

                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white shadow-lg shadow-[#155DFC]/20">
                  <IdCard size={20} />
                </div>

                <div>

                  <h1 className="text-2xl font-bold text-slate-800">
                    Kartu Identitas Siswa
                  </h1>

                  <p className="text-sm text-slate-500">
                    Data identitas siswa dan lihat detail profil.
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  router.push(
                    "/admin/siswa/kartu-identitas/tambah"
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold shadow-lg shadow-[#155DFC]/20 hover:opacity-90 transition-opacity"
              >
                <Plus size={16} />
                Tambah Siswa
              </button>

            </div>

            {/* =================================================
                STATISTIK
            ================================================= */}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

              {/* TOTAL SISWA */}

              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">

                <div className="flex items-center gap-2">

                  <Users
                    size={14}
                    className="text-[#155DFC]"
                  />

                  <p className="text-[11px] font-medium text-slate-500 tracking-wide">
                    Total Siswa
                  </p>

                </div>

                <p className="text-2xl font-bold text-slate-900 mt-1.5">
                  {totalSiswa}
                </p>

              </div>

              {/* JUMLAH KELAS */}

              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">

                <div className="flex items-center gap-2">

                  <School
                    size={14}
                    className="text-[#155DFC]"
                  />

                  <p className="text-[11px] font-medium text-slate-500 tracking-wide">
                    Jumlah Kelas
                  </p>

                </div>

                <p className="text-2xl font-bold text-slate-900 mt-1.5">
                  {totalKelas}
                </p>

              </div>

              {/* AKTIF */}

              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">

                <div className="flex items-center gap-2">

                  <CheckCircle2
                    size={14}
                    className="text-emerald-500"
                  />

                  <p className="text-[11px] font-medium text-slate-500 tracking-wide">
                    Status Aktif
                  </p>

                </div>

                <p className="text-2xl font-bold text-slate-900 mt-1.5">
                  {totalAktif}
                </p>

              </div>

              {/* RATA-RATA */}

              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">

                <div className="flex items-center gap-2">

                  <GraduationCap
                    size={14}
                    className="text-[#155DFC]"
                  />

                  <p className="text-[11px] font-medium text-slate-500 tracking-wide">
                    Rata-rata / Kelas
                  </p>

                </div>

                <p className="text-2xl font-bold text-slate-900 mt-1.5">
                  {totalKelas
                    ? Math.round(
                        totalSiswa / totalKelas
                      )
                    : 0}
                </p>

              </div>

            </div>

            {/* =================================================
                FILTER
            ================================================= */}

            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-3">

              {/* SEARCH */}

              <div className="relative flex-1">

                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Cari nama atau NISN..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 text-slate-800"
                />

              </div>

              {/* FILTER */}

              <div className="flex items-center gap-2">

                <Filter
                  size={15}
                  className="text-[#155DFC] hidden sm:block"
                />

                <select
                  value={kelasFilter}
                  onChange={(e) =>
                    setKelasFilter(e.target.value)
                  }
                  className="text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 bg-white text-slate-800 font-medium"
                >
                  {KELAS_OPTIONS.map((k) => (
                    <option
                      key={k}
                      value={k}
                    >
                      {k}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 bg-white text-slate-800 font-medium"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option
                      key={s}
                      value={s}
                    >
                      {s}
                    </option>
                  ))}
                </select>

              </div>

            </div>

            {/* =================================================
                TABEL
            ================================================= */}

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full text-sm border-collapse">

                  {/* =================================================
                      TABLE HEADER
                  ================================================= */}

                  <thead>

                    <tr className="bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white">

                      {/* NO */}

                      <th className="text-center font-semibold px-4 py-3 w-[60px]">
                        No
                      </th>

                      {/* PROFIL */}

                      <th className="text-left font-semibold px-4 py-3 min-w-[240px]">
                        Profil
                      </th>

                      {/* NISN */}

                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        NISN
                      </th>

                      {/* KELAS */}

                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Kelas
                      </th>

                      {/* JENIS KELAMIN */}

                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Jenis Kelamin
                      </th>

                      {/* STATUS */}

                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                        Status
                      </th>

                      {/* AKSI */}

                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                        Aksi
                      </th>

                    </tr>

                  </thead>

                  {/* =================================================
                      TABLE BODY
                  ================================================= */}

                  <tbody>

                    {filteredSiswa.map((s, idx) => (

                      <tr
                        key={s.id}
                        className={`border-b border-slate-100 last:border-0 transition-colors hover:bg-[#eaf1ff] ${
                          idx % 2 === 0
                            ? "bg-[#f7f9ff]"
                            : "bg-white"
                        }`}
                      >

                        {/* NO */}

                        <td className="px-4 py-3 text-center">

                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#eaf1ff] text-[#155DFC] border border-[#c7dbff] text-xs font-bold">
                            {idx + 1}
                          </span>

                        </td>

                        {/* PROFIL */}

                        <td className="px-4 py-3">

                          <button
                            type="button"
                            onClick={() =>
                              handleDetail(s)
                            }
                            title="Lihat detail siswa"
                            className="flex items-center gap-3 text-left group"
                          >

                            <Avatar
                              nama={s.nama}
                              size="sm"
                            />

                            <div>

                              <p className="font-semibold text-slate-900 group-hover:text-[#155DFC] transition-colors">
                                {s.nama}
                              </p>

                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Siswa • {s.jenjang}
                              </p>

                            </div>

                          </button>

                        </td>

                        {/* NISN */}

                        <td className="px-4 py-3">

                          <span className="font-mono text-xs font-medium text-slate-600">
                            {s.nisn}
                          </span>

                        </td>

                        {/* KELAS */}

                        <td className="px-4 py-3">

                          <span className="inline-flex items-center justify-center min-w-[48px] px-2.5 py-1 rounded-lg text-xs font-bold text-[#155DFC] bg-[#eaf1ff] border border-[#c7dbff]">
                            {s.kelas}
                          </span>

                        </td>

                        {/* JENIS KELAMIN */}

                        <td className="px-4 py-3">

                          <JenisKelaminBadge
                            jenisKelamin={
                              s.jenisKelamin
                            }
                          />

                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-3 text-center">

                          <StatusBadge
                            status={s.status}
                          />

                        </td>

                        {/* AKSI */}

                        <td className="px-4 py-3">

                          <div className="flex items-center justify-center gap-1.5">

                            {/* DETAIL */}

                            <button
                              onClick={() =>
                                handleDetail(s)
                              }
                              title="Lihat detail siswa"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[#155DFC] bg-[#eaf1ff] border border-[#c7dbff] hover:bg-[#d6e6ff] text-xs font-medium transition-colors"
                            >

                              <Eye size={13} />

                              Detail

                            </button>

                            {/* ID CARD */}

                            <button
                              onClick={() =>
                                handleIdCard(s)
                              }
                              title="Lihat ID Card"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-white bg-gradient-to-r from-[#155DFC] to-[#0d47c9] hover:brightness-110 text-xs font-medium transition-all shadow-sm"
                            >

                              <CreditCard
                                size={13}
                              />

                              ID Card

                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                    {/* EMPTY */}

                    {filteredSiswa.length === 0 && (

                      <tr>

                        <td
                          colSpan={7}
                          className="px-4 py-12 text-center"
                        >

                          <div className="flex flex-col items-center">

                            <div className="w-12 h-12 rounded-full bg-[#eaf1ff] flex items-center justify-center mb-3">

                              <Search
                                size={20}
                                className="text-[#155DFC]"
                              />

                            </div>

                            <p className="text-sm font-semibold text-slate-700">
                              Data siswa tidak ditemukan
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              Coba ubah kata kunci atau filter.
                            </p>

                          </div>

                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

              {/* =================================================
                  TABLE FOOTER
              ================================================= */}

              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">

                <p className="text-xs text-slate-500">

                  Menampilkan{" "}

                  <span className="font-semibold text-slate-700">
                    {filteredSiswa.length}
                  </span>{" "}

                  dari{" "}

                  <span className="font-semibold text-slate-700">
                    {totalSiswa}
                  </span>{" "}

                  siswa

                </p>

                <div className="flex items-center gap-2">

                  <span className="text-[11px] text-slate-400">
                    Kartu Identitas Siswa
                  </span>

                  <IdCard
                    size={15}
                    className="text-[#155DFC]"
                  />

                </div>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}