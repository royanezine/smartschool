"use client";

import { useState, useMemo } from "react";
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
import {
  Search,
  Filter,
  NotebookPen,
  Printer,
  Trash2,
  Users,
  GraduationCap,
  TrendingUp,
} from "lucide-react";

/**
 * app/admin/akademik/nilai/page.jsx
 *
 * Halaman Nilai — tabel rekap nilai siswa per mata pelajaran.
 *
 * Theme:
 * Menggunakan global Light/Dark theme SmartSchool melalui
 * class theme-* dari globals.css.
 *
 * CATATAN DATA:
 * MOCK_NILAI masih dummy. Kalau nanti sudah terhubung
 * ke API, tinggal ganti MOCK_NILAI dengan hasil fetch
 * yang memiliki struktur data yang sama.
 */

const MAPEL = [
  { key: "agm", label: "Agm" },
  { key: "pkn", label: "PKn" },
  { key: "indo", label: "Indo" },
  { key: "mat", label: "Mat" },
  { key: "sej", label: "Sej" },
  { key: "ingg", label: "Ingg" },
  { key: "seni", label: "Seni" },
  { key: "penj", label: "Penj" },
  { key: "pkwu", label: "PKWU" },
];

const MOCK_NILAI = [
  {
    id: 1,
    kelas: "X RPL 1",
    induk: "10231",
    nama: "Alya Ramadhani",
    lp: "P",
    nilai: {
      agm: 86,
      pkn: 75,
      indo: 86,
      mat: 75,
      sej: 86,
      ingg: 75,
      seni: 86,
      penj: 75,
      pkwu: 86,
    },
  },
  {
    id: 2,
    kelas: "X RPL 1",
    induk: "10232",
    nama: "Bunga Citra Lestari",
    lp: "P",
    nilai: {
      agm: 86,
      pkn: 75,
      indo: 86,
      mat: 75,
      sej: 86,
      ingg: 75,
      seni: 86,
      penj: 75,
      pkwu: 86,
    },
  },
  {
    id: 3,
    kelas: "X RPL 1",
    induk: "10233",
    nama: "Cahyo Nugroho",
    lp: "L",
    nilai: {
      agm: 75,
      pkn: 87,
      indo: 75,
      mat: 87,
      sej: 75,
      ingg: 87,
      seni: 75,
      penj: 87,
      pkwu: 75,
    },
  },
  {
    id: 4,
    kelas: "X RPL 2",
    induk: "10301",
    nama: "Dimas Prasetyo",
    lp: "L",
    nilai: {
      agm: 87,
      pkn: 86,
      indo: 87,
      mat: 86,
      sej: 87,
      ingg: 86,
      seni: 87,
      penj: 86,
      pkwu: 87,
    },
  },
  {
    id: 5,
    kelas: "X TKJ 1",
    induk: "10401",
    nama: "Eka Wulandari",
    lp: "P",
    nilai: {
      agm: 75,
      pkn: 87,
      indo: 75,
      mat: 87,
      sej: 75,
      ingg: 87,
      seni: 75,
      penj: 87,
      pkwu: 75,
    },
  },
  {
    id: 6,
    kelas: "X TKJ 1",
    induk: "10501",
    nama: "Fajar Setiawan",
    lp: "P",
    nilai: {
      agm: 87,
      pkn: 86,
      indo: 87,
      mat: 86,
      sej: 87,
      ingg: 86,
      seni: 87,
      penj: 86,
      pkwu: 87,
    },
  },
  {
    id: 7,
    kelas: "X TKJ 2",
    induk: "10601",
    nama: "Gilang Ramadhan",
    lp: "L",
    nilai: {
      agm: 75,
      pkn: 87,
      indo: 75,
      mat: 87,
      sej: 75,
      ingg: 87,
      seni: 75,
      penj: 87,
      pkwu: 75,
    },
  },
  {
    id: 8,
    kelas: "X TKJ 2",
    induk: "10602",
    nama: "Hana Permatasari",
    lp: "P",
    nilai: {
      agm: 87,
      pkn: 86,
      indo: 87,
      mat: 86,
      sej: 87,
      ingg: 86,
      seni: 87,
      penj: 86,
      pkwu: 87,
    },
  },
  {
    id: 9,
    kelas: "XII RPL 1",
    induk: "12101",
    nama: "Indra Kusuma",
    lp: "L",
    nilai: {
      agm: 75,
      pkn: 86,
      indo: 75,
      mat: 86,
      sej: 75,
      ingg: 86,
      seni: 75,
      penj: 86,
      pkwu: 75,
    },
  },
  {
    id: 10,
    kelas: "XII RPL 1",
    induk: "12102",
    nama: "Julia Anggraeni",
    lp: "P",
    nilai: {
      agm: 88,
      pkn: 79,
      indo: 90,
      mat: 82,
      sej: 85,
      ingg: 91,
      seni: 87,
      penj: 80,
      pkwu: 89,
    },
  },
  {
    id: 11,
    kelas: "XII RPL 2",
    induk: "12201",
    nama: "Krisna Aditya",
    lp: "L",
    nilai: {
      agm: 70,
      pkn: 65,
      indo: 72,
      mat: 60,
      sej: 74,
      ingg: 68,
      seni: 75,
      penj: 78,
      pkwu: 66,
    },
  },
  {
    id: 12,
    kelas: "XII RPL 2",
    induk: "12202",
    nama: "Larasati Dewi",
    lp: "P",
    nilai: {
      agm: 95,
      pkn: 92,
      indo: 96,
      mat: 90,
      sej: 93,
      ingg: 97,
      seni: 94,
      penj: 89,
      pkwu: 95,
    },
  },
  {
    id: 13,
    kelas: "XII TKJ 1",
    induk: "12301",
    nama: "Muhammad Fadli",
    lp: "L",
    nilai: {
      agm: 80,
      pkn: 83,
      indo: 78,
      mat: 76,
      sej: 85,
      ingg: 79,
      seni: 82,
      penj: 88,
      pkwu: 81,
    },
  },
  {
    id: 14,
    kelas: "XII TKJ 1",
    induk: "12302",
    nama: "Naila Zahra",
    lp: "P",
    nilai: {
      agm: 84,
      pkn: 86,
      indo: 88,
      mat: 79,
      sej: 90,
      ingg: 85,
      seni: 91,
      penj: 77,
      pkwu: 86,
    },
  },
  {
    id: 15,
    kelas: "XI RPL 1",
    induk: "11101",
    nama: "Oka Wijaya",
    lp: "L",
    nilai: {
      agm: 77,
      pkn: 74,
      indo: 80,
      mat: 71,
      sej: 76,
      ingg: 73,
      seni: 78,
      penj: 82,
      pkwu: 75,
    },
  },
  {
    id: 16,
    kelas: "XI RPL 1",
    induk: "11102",
    nama: "Putri Ayuningtyas",
    lp: "P",
    nilai: {
      agm: 91,
      pkn: 88,
      indo: 93,
      mat: 85,
      sej: 89,
      ingg: 94,
      seni: 90,
      penj: 83,
      pkwu: 92,
    },
  },
  {
    id: 17,
    kelas: "XI TKJ 1",
    induk: "11201",
    nama: "Reza Firmansyah",
    lp: "L",
    nilai: {
      agm: 68,
      pkn: 71,
      indo: 65,
      mat: 69,
      sej: 72,
      ingg: 66,
      seni: 70,
      penj: 74,
      pkwu: 67,
    },
  },
  {
    id: 18,
    kelas: "XI TKJ 2",
    induk: "11202",
    nama: "Salsabila Putri",
    lp: "P",
    nilai: {
      agm: 86,
      pkn: 84,
      indo: 87,
      mat: 80,
      sej: 88,
      ingg: 85,
      seni: 89,
      penj: 81,
      pkwu: 87,
    },
  },
];

const KELAS_OPTIONS = [
  "Semua Kelas",
  ...Array.from(new Set(MOCK_NILAI.map((s) => s.kelas))).sort(),
];

function getRataRata(siswa) {
  const nilaiArr = Object.values(siswa.nilai);

  return (
    nilaiArr.reduce((a, n) => a + n, 0) / nilaiArr.length
  );
}

export default function NilaiPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [kelasFilter, setKelasFilter] = useState("Semua Kelas");

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const filteredSiswa = useMemo(() => {
    return MOCK_NILAI.filter((s) => {
      const matchSearch =
        s.nama.toLowerCase().includes(search.toLowerCase()) ||
        s.induk.includes(search);

      const matchKelas =
        kelasFilter === "Semua Kelas" || s.kelas === kelasFilter;

      return matchSearch && matchKelas;
    });
  }, [search, kelasFilter]);

  const handlePrint = (siswa) => {
    console.log("Cetak nilai:", siswa.nama);
  };

  const handleDelete = (siswa) => {
    console.log("Hapus nilai:", siswa.nama);
  };

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar
        active="akademikNilai"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* HEADER */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl theme-primary shadow-lg">
                <NotebookPen size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-bold theme-text">
                  Nilai
                </h1>

                <p className="text-sm theme-text-muted">
                  Rekap nilai siswa per mata pelajaran.
                </p>
              </div>
            </div>

            {/* STATISTIK RINGKAS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* TOTAL SISWA */}
              <div className="theme-card rounded-xl border theme-border p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Users
                    size={14}
                    className="theme-sidebar-text-active"
                  />

                  <p className="text-[11px] font-medium theme-text-muted tracking-wide">
                    Total Siswa
                  </p>
                </div>

                <p className="text-2xl font-bold theme-text mt-1.5">
                  {MOCK_NILAI.length}
                </p>
              </div>

              {/* JUMLAH KELAS */}
              <div className="theme-card rounded-xl border theme-border p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <GraduationCap
                    size={14}
                    className="theme-sidebar-text-active"
                  />

                  <p className="text-[11px] font-medium theme-text-muted tracking-wide">
                    Jumlah Kelas
                  </p>
                </div>

                <p className="text-2xl font-bold theme-text mt-1.5">
                  {KELAS_OPTIONS.length - 1}
                </p>
              </div>

              {/* RATA-RATA */}
              <div className="theme-card rounded-xl border theme-border p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp
                    size={14}
                    className="text-[var(--color-success)]"
                  />

                  <p className="text-[11px] font-medium theme-text-muted tracking-wide">
                    Rata-rata Nilai
                  </p>
                </div>

                <p className="text-2xl font-bold theme-text mt-1.5">
                  {(
                    MOCK_NILAI.reduce(
                      (a, s) => a + getRataRata(s),
                      0
                    ) / MOCK_NILAI.length
                  ).toFixed(2)}
                </p>
              </div>

              {/* MATA PELAJARAN */}
              <div className="theme-card rounded-xl border theme-border p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <NotebookPen
                    size={14}
                    className="text-[var(--color-danger)]"
                  />

                  <p className="text-[11px] font-medium theme-text-muted tracking-wide">
                    Mata Pelajaran
                  </p>
                </div>

                <p className="text-2xl font-bold theme-text mt-1.5">
                  {MAPEL.length}
                </p>
              </div>
            </div>

            {/* FILTER BAR */}
            <div className="theme-card rounded-xl border theme-border p-4 shadow-sm flex flex-col sm:flex-row gap-3">
              {/* SEARCH */}
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama atau nomor induk siswa..."
                  className="
                    w-full
                    pl-9 pr-3 py-2
                    text-sm
                    rounded-lg
                    border
                    theme-input
                    focus:outline-none
                  "
                />
              </div>

              {/* FILTER KELAS */}
              <div className="flex items-center gap-2">
                <Filter
                  size={15}
                  className="theme-text-muted hidden sm:block"
                />

                <select
                  value={kelasFilter}
                  onChange={(e) => setKelasFilter(e.target.value)}
                  className="
                    text-sm
                    rounded-lg
                    border
                    theme-input
                    px-3 py-2
                    focus:outline-none
                    font-medium
                  "
                >
                  {KELAS_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TABEL NILAI */}
            <div className="theme-card rounded-xl border theme-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        No.
                      </th>

                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Kelas
                      </th>

                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Induk
                      </th>

                      <th className="text-left font-semibold px-4 py-3 min-w-[220px]">
                        Nama Siswa
                      </th>

                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                        L/P
                      </th>

                      {MAPEL.map((m) => (
                        <th
                          key={m.key}
                          className="text-center font-semibold px-4 py-3 whitespace-nowrap"
                        >
                          {m.label}
                        </th>
                      ))}

                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                        #
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSiswa.map((s, idx) => (
                      <tr
                        key={s.id}
                        className="
                          border-b
                          theme-border-soft
                          last:border-0
                          transition-colors
                          theme-table-hover
                        "
                      >
                        {/* NO */}
                        <td className="px-4 py-2.5 theme-text-secondary font-medium">
                          {idx + 1}
                        </td>

                        {/* KELAS */}
                        <td className="px-4 py-2.5">
                          <span className="theme-sidebar-text-active font-semibold hover:underline cursor-pointer">
                            {s.kelas}
                          </span>
                        </td>

                        {/* INDUK */}
                        <td className="px-4 py-2.5 theme-text-secondary">
                          {s.induk}
                        </td>

                        {/* NAMA */}
                        <td className="px-4 py-2.5 theme-text font-semibold">
                          {s.nama}
                        </td>

                        {/* L/P */}
                        <td className="px-4 py-2.5 text-center theme-text-secondary font-medium">
                          {s.lp}
                        </td>

                        {/* NILAI MAPEL */}
                        {MAPEL.map((m) => (
                          <td
                            key={m.key}
                            className="px-4 py-2.5 text-center theme-text-secondary font-medium"
                          >
                            {s.nilai[m.key].toFixed(2)}
                          </td>
                        ))}

                        {/* AKSI */}
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* CETAK */}
                            <button
                              onClick={() => handlePrint(s)}
                              title="Cetak nilai"
                              className="
                                p-1.5
                                rounded-md
                                theme-info
                                transition-colors
                              "
                            >
                              <Printer size={14} />
                            </button>

                            {/* HAPUS */}
                            <button
                              onClick={() => handleDelete(s)}
                              title="Hapus nilai"
                              className="
                                p-1.5
                                rounded-md
                                theme-danger
                                transition-colors
                              "
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* EMPTY STATE */}
                    {filteredSiswa.length === 0 && (
                      <tr>
                        <td
                          colSpan={MAPEL.length + 6}
                          className="px-4 py-10 text-center text-sm theme-text-muted"
                        >
                          Tidak ada siswa yang cocok dengan filter ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}