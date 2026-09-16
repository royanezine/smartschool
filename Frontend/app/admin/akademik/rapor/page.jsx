"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import { Search, FileText, ChevronLeft, Users, GraduationCap, Printer, Eye } from "lucide-react";

/**
 * app/admin/akademik/rapor/page.jsx
 *
 * Halaman Rapor — dua tingkat tampilan:
 * 1) Grid kartu kelas (RPL/TKJ, X-XII) — menampilkan jumlah siswa & wali kelas.
 * 2) Klik salah satu kartu kelas -> tampil daftar siswa di kelas itu,
 *    lengkap dengan tombol untuk melihat/mencetak rapor per siswa.
 *
 * CATATAN DATA:
 * MOCK_SISWA masih dummy, strukturnya sama dengan yang dipakai di halaman
 * Nilai supaya konsisten. Kalau nanti nyambung ke API, tinggal ganti
 * MOCK_SISWA dengan hasil fetch dan WALI_KELAS dengan data guru wali.
 */

const WALI_KELAS = {
  "X RPL 1": "Dewi Anggraini, S.Kom.",
  "X RPL 2": "Fajar Nugroho, S.Kom.",
  "X TKJ 1": "Rina Kartika, S.T.",
  "X TKJ 2": "Andi Saputra, S.T.",
  "XI RPL 1": "Yuni Astuti, S.Kom.",
  "XI TKJ 1": "Bayu Pratama, S.T.",
  "XI TKJ 2": "Sri Wahyuni, S.T.",
  "XII RPL 1": "Hendra Gunawan, S.Kom.",
  "XII RPL 2": "Lina Marlina, S.Kom.",
  "XII TKJ 1": "Agus Setiawan, S.T.",
};

const MOCK_SISWA = [
  { id: 1, kelas: "X RPL 1", induk: "10231", nama: "Alya Ramadhani", lp: "P" },
  { id: 2, kelas: "X RPL 1", induk: "10232", nama: "Bunga Citra Lestari", lp: "P" },
  { id: 3, kelas: "X RPL 1", induk: "10233", nama: "Cahyo Nugroho", lp: "L" },
  { id: 4, kelas: "X RPL 2", induk: "10301", nama: "Dimas Prasetyo", lp: "L" },
  { id: 5, kelas: "X TKJ 1", induk: "10401", nama: "Eka Wulandari", lp: "P" },
  { id: 6, kelas: "X TKJ 1", induk: "10501", nama: "Fajar Setiawan", lp: "P" },
  { id: 7, kelas: "X TKJ 2", induk: "10601", nama: "Gilang Ramadhan", lp: "L" },
  { id: 8, kelas: "X TKJ 2", induk: "10602", nama: "Hana Permatasari", lp: "P" },
  { id: 9, kelas: "XII RPL 1", induk: "12101", nama: "Indra Kusuma", lp: "L" },
  { id: 10, kelas: "XII RPL 1", induk: "12102", nama: "Julia Anggraeni", lp: "P" },
  { id: 11, kelas: "XII RPL 2", induk: "12201", nama: "Krisna Aditya", lp: "L" },
  { id: 12, kelas: "XII RPL 2", induk: "12202", nama: "Larasati Dewi", lp: "P" },
  { id: 13, kelas: "XII TKJ 1", induk: "12301", nama: "Muhammad Fadli", lp: "L" },
  { id: 14, kelas: "XII TKJ 1", induk: "12302", nama: "Naila Zahra", lp: "P" },
  { id: 15, kelas: "XI RPL 1", induk: "11101", nama: "Oka Wijaya", lp: "L" },
  { id: 16, kelas: "XI RPL 1", induk: "11102", nama: "Putri Ayuningtyas", lp: "P" },
  { id: 17, kelas: "XI TKJ 1", induk: "11201", nama: "Reza Firmansyah", lp: "L" },
  { id: 18, kelas: "XI TKJ 2", induk: "11202", nama: "Salsabila Putri", lp: "P" },
];

const KELAS_LIST = Array.from(new Set(MOCK_SISWA.map((s) => s.kelas))).sort();

export default function RaporPage() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [kelasFilter, setKelasFilter] = useState("");
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [search, setSearch] = useState("");

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const filteredKelas = useMemo(() => {
    return KELAS_LIST.filter((k) => k.toLowerCase().includes(kelasFilter.toLowerCase()));
  }, [kelasFilter]);

  const siswaDiKelas = useMemo(() => {
    if (!selectedKelas) return [];
    return MOCK_SISWA.filter(
      (s) => s.kelas === selectedKelas && s.nama.toLowerCase().includes(search.toLowerCase())
    );
  }, [selectedKelas, search]);

  const handleLihatRapor = (siswa) => {
    router.push(`/admin/akademik/rapor/${siswa.id}`);
  };

  const handleCetakRapor = (siswa) => {
    console.log("Cetak rapor:", siswa.nama);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar
        active="akademikRapor"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{ name: "Admin Sekolah", email: "admin@smartschool.com", avatar: "AD" }}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* HEADER */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200">
                <FileText size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Rapor</h1>
                <p className="text-sm text-slate-600">
                  {selectedKelas
                    ? `Daftar siswa kelas ${selectedKelas}`
                    : "Pilih kelas untuk melihat daftar siswa dan rapornya."}
                </p>
              </div>
            </div>

            {selectedKelas === null ? (
              <>
                {/* CARI KELAS */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={kelasFilter}
                      onChange={(e) => setKelasFilter(e.target.value)}
                      placeholder="Cari kelas..."
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-slate-800"
                    />
                  </div>
                </div>

                {/* GRID KELAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredKelas.map((kelas) => {
                    const jumlahSiswa = MOCK_SISWA.filter((s) => s.kelas === kelas).length;
                    return (
                      <button
                        key={kelas}
                        onClick={() => {
                          setSelectedKelas(kelas);
                          setSearch("");
                        }}
                        className="text-left bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600">
                            <GraduationCap size={20} />
                          </div>
                          <span className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                            <Users size={12} />
                            {jumlahSiswa} siswa
                          </span>
                        </div>
                        <p className="text-lg font-bold text-slate-900 mt-3">{kelas}</p>
                        <p className="text-sm text-slate-600 mt-0.5">
                          Wali Kelas: {WALI_KELAS[kelas] || "-"}
                        </p>
                      </button>
                    );
                  })}
                  {filteredKelas.length === 0 && (
                    <div className="col-span-full bg-white rounded-xl border border-slate-200/80 p-10 text-center text-sm text-slate-400 shadow-sm">
                      Tidak ada kelas yang cocok dengan pencarian.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* NAV KEMBALI + CARI SISWA */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    onClick={() => setSelectedKelas(null)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors"
                  >
                    <ChevronLeft size={16} />
                    Kembali ke daftar kelas
                  </button>
                  <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari nama siswa..."
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-slate-800 bg-white"
                    />
                  </div>
                </div>

                {/* INFO KELAS */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900">{selectedKelas}</p>
                      <p className="text-sm text-slate-600">Wali Kelas: {WALI_KELAS[selectedKelas] || "-"}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                    <Users size={14} />
                    {MOCK_SISWA.filter((s) => s.kelas === selectedKelas).length} siswa
                  </span>
                </div>

                {/* TABEL SISWA */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                          <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">No.</th>
                          <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">Induk</th>
                          <th className="text-left font-semibold px-4 py-3 min-w-[220px]">Nama Siswa</th>
                          <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">L/P</th>
                          <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {siswaDiKelas.map((s, idx) => (
                          <tr
                            key={s.id}
                            className={`border-b border-slate-100 last:border-0 transition-colors hover:bg-blue-100/60 ${
                              idx % 2 === 0 ? "bg-blue-50/60" : "bg-white"
                            }`}
                          >
                            <td className="px-4 py-2.5 text-slate-700 font-medium">{idx + 1}</td>
                            <td className="px-4 py-2.5 text-slate-700">{s.induk}</td>
                            <td className="px-4 py-2.5 text-slate-900 font-semibold">{s.nama}</td>
                            <td className="px-4 py-2.5 text-center text-slate-700 font-medium">{s.lp}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleLihatRapor(s)}
                                  title="Lihat rapor"
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 text-xs font-semibold transition-colors"
                                >
                                  <Eye size={13} />
                                  Lihat
                                </button>
                                <button
                                  onClick={() => handleCetakRapor(s)}
                                  title="Cetak rapor"
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-semibold transition-colors"
                                >
                                  <Printer size={13} />
                                  Cetak
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {siswaDiKelas.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                              Tidak ada siswa yang cocok dengan pencarian.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}