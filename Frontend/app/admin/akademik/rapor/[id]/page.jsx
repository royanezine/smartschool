"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
import { ChevronLeft, Printer, User, GraduationCap } from "lucide-react";

/**
 * app/admin/akademik/rapor/[id]/page.jsx
 *
 * Halaman detail Rapor satu siswa. Diakses dari
 * app/admin/akademik/rapor/page.jsx (klik siswa di dalam kelas).
 *
 * CATATAN DATA:
 * MOCK_SISWA & MOCK_NILAI masih dummy, id-nya harus sama dengan yang
 * dipakai di halaman daftar kelas (app/admin/akademik/rapor/page.jsx).
 * Kalau nanti nyambung ke API, ganti bagian `useMemo` yang mencari siswa
 * dengan fetch berdasarkan `params.id`.
 */

const MAPEL = [
  { key: "agm", label: "Pendidikan Agama dan Budi Pekerti", kkm: 75 },
  { key: "pkn", label: "Pendidikan Pancasila dan Kewarganegaraan", kkm: 75 },
  { key: "indo", label: "Bahasa Indonesia", kkm: 75 },
  { key: "mat", label: "Matematika", kkm: 75 },
  { key: "sej", label: "Sejarah Indonesia", kkm: 75 },
  { key: "ingg", label: "Bahasa Inggris", kkm: 75 },
  { key: "seni", label: "Seni Budaya", kkm: 75 },
  { key: "penj", label: "Pendidikan Jasmani, Olahraga dan Kesehatan", kkm: 75 },
  { key: "pkwu", label: "Produk Kreatif dan Kewirausahaan", kkm: 75 },
];

const MOCK_SISWA = [
  { id: 1, kelas: "X RPL 1", induk: "10231", nama: "Alya Ramadhani", lp: "P", nilai: { agm: 86, pkn: 75, indo: 86, mat: 75, sej: 86, ingg: 75, seni: 86, penj: 75, pkwu: 86 } },
  { id: 2, kelas: "X RPL 1", induk: "10232", nama: "Bunga Citra Lestari", lp: "P", nilai: { agm: 86, pkn: 75, indo: 86, mat: 75, sej: 86, ingg: 75, seni: 86, penj: 75, pkwu: 86 } },
  { id: 3, kelas: "X RPL 1", induk: "10233", nama: "Cahyo Nugroho", lp: "L", nilai: { agm: 75, pkn: 87, indo: 75, mat: 87, sej: 75, ingg: 87, seni: 75, penj: 87, pkwu: 75 } },
  { id: 4, kelas: "X RPL 2", induk: "10301", nama: "Dimas Prasetyo", lp: "L", nilai: { agm: 87, pkn: 86, indo: 87, mat: 86, sej: 87, ingg: 86, seni: 87, penj: 86, pkwu: 87 } },
  { id: 5, kelas: "X TKJ 1", induk: "10401", nama: "Eka Wulandari", lp: "P", nilai: { agm: 75, pkn: 87, indo: 75, mat: 87, sej: 75, ingg: 87, seni: 75, penj: 87, pkwu: 75 } },
  { id: 6, kelas: "X TKJ 1", induk: "10501", nama: "Fajar Setiawan", lp: "P", nilai: { agm: 87, pkn: 86, indo: 87, mat: 86, sej: 87, ingg: 86, seni: 87, penj: 86, pkwu: 87 } },
  { id: 7, kelas: "X TKJ 2", induk: "10601", nama: "Gilang Ramadhan", lp: "L", nilai: { agm: 75, pkn: 87, indo: 75, mat: 87, sej: 75, ingg: 87, seni: 75, penj: 87, pkwu: 75 } },
  { id: 8, kelas: "X TKJ 2", induk: "10602", nama: "Hana Permatasari", lp: "P", nilai: { agm: 87, pkn: 86, indo: 87, mat: 86, sej: 87, ingg: 86, seni: 87, penj: 86, pkwu: 87 } },
  { id: 9, kelas: "XII RPL 1", induk: "12101", nama: "Indra Kusuma", lp: "L", nilai: { agm: 75, pkn: 86, indo: 75, mat: 86, sej: 75, ingg: 86, seni: 75, penj: 86, pkwu: 75 } },
  { id: 10, kelas: "XII RPL 1", induk: "12102", nama: "Julia Anggraeni", lp: "P", nilai: { agm: 88, pkn: 79, indo: 90, mat: 82, sej: 85, ingg: 91, seni: 87, penj: 80, pkwu: 89 } },
  { id: 11, kelas: "XII RPL 2", induk: "12201", nama: "Krisna Aditya", lp: "L", nilai: { agm: 70, pkn: 65, indo: 72, mat: 60, sej: 74, ingg: 68, seni: 75, penj: 78, pkwu: 66 } },
  { id: 12, kelas: "XII RPL 2", induk: "12202", nama: "Larasati Dewi", lp: "P", nilai: { agm: 95, pkn: 92, indo: 96, mat: 90, sej: 93, ingg: 97, seni: 94, penj: 89, pkwu: 95 } },
  { id: 13, kelas: "XII TKJ 1", induk: "12301", nama: "Muhammad Fadli", lp: "L", nilai: { agm: 80, pkn: 83, indo: 78, mat: 76, sej: 85, ingg: 79, seni: 82, penj: 88, pkwu: 81 } },
  { id: 14, kelas: "XII TKJ 1", induk: "12302", nama: "Naila Zahra", lp: "P", nilai: { agm: 84, pkn: 86, indo: 88, mat: 79, sej: 90, ingg: 85, seni: 91, penj: 77, pkwu: 86 } },
  { id: 15, kelas: "XI RPL 1", induk: "11101", nama: "Oka Wijaya", lp: "L", nilai: { agm: 77, pkn: 74, indo: 80, mat: 71, sej: 76, ingg: 73, seni: 78, penj: 82, pkwu: 75 } },
  { id: 16, kelas: "XI RPL 1", induk: "11102", nama: "Putri Ayuningtyas", lp: "P", nilai: { agm: 91, pkn: 88, indo: 93, mat: 85, sej: 89, ingg: 94, seni: 90, penj: 83, pkwu: 92 } },
  { id: 17, kelas: "XI TKJ 1", induk: "11201", nama: "Reza Firmansyah", lp: "L", nilai: { agm: 68, pkn: 71, indo: 65, mat: 69, sej: 72, ingg: 66, seni: 70, penj: 74, pkwu: 67 } },
  { id: 18, kelas: "XI TKJ 2", induk: "11202", nama: "Salsabila Putri", lp: "P", nilai: { agm: 86, pkn: 84, indo: 87, mat: 80, sej: 88, ingg: 85, seni: 89, penj: 81, pkwu: 87 } },
];

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

const KEHADIRAN_DUMMY = { sakit: 2, izin: 1, alpa: 0 };
const CATATAN_DUMMY =
  "Menunjukkan sikap disiplin dan aktif dalam kegiatan belajar. Perlu meningkatkan lagi keaktifan bertanya di kelas.";
const SIKAP_DUMMY = { spiritual: "Baik", sosial: "Baik" };

function getPredikat(n) {
  if (n >= 90) return "A";
  if (n >= 80) return "B";
  if (n >= 75) return "C";
  return "D";
}

export default function RaporDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const siswa = useMemo(() => {
    return MOCK_SISWA.find((s) => String(s.id) === String(params.id));
  }, [params.id]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handlePrint = () => {
    window.print();
  };

  const rataRata = siswa
    ? (Object.values(siswa.nilai).reduce((a, n) => a + n, 0) / Object.values(siswa.nilai).length).toFixed(2)
    : 0;

  if (!siswa) {
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
            <div className="p-4 sm:p-6 lg:p-8">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors mb-4"
              >
                <ChevronLeft size={16} />
                Kembali
              </button>
              <div className="bg-white rounded-xl border border-slate-200/80 p-10 text-center text-sm text-slate-500 shadow-sm">
                Data siswa tidak ditemukan.
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
        <main className="flex-1 overflow-y-auto print:overflow-visible">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto print:max-w-full">
            {/* NAV & AKSI — disembunyikan saat print */}
            <div className="flex items-center justify-between print:hidden">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors"
              >
                <ChevronLeft size={16} />
                Kembali
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-200 transition-colors"
              >
                <Printer size={16} />
                Cetak Rapor
              </button>
            </div>

            {/* KOP RAPOR */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm print:shadow-none print:border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-5 print:bg-white print:text-slate-900 print:border-b print:border-slate-300">
                <p className="text-xs font-medium tracking-wide text-blue-100 print:text-slate-500">
                  Laporan Hasil Belajar Siswa
                </p>
                <h1 className="text-xl font-bold mt-0.5">SMK Smart School</h1>
                <p className="text-xs text-blue-100 mt-0.5 print:text-slate-500">
                  Tahun Ajaran 2025/2026 — Semester Ganjil
                </p>
              </div>

              {/* IDENTITAS SISWA */}
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 print:hidden">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Nama Siswa</p>
                    <p className="text-sm font-semibold text-slate-900">{siswa.nama}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 print:hidden">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Kelas</p>
                    <p className="text-sm font-semibold text-slate-900">{siswa.kelas}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Nomor Induk</p>
                  <p className="text-sm font-semibold text-slate-900">{siswa.induk}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Jenis Kelamin</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {siswa.lp === "L" ? "Laki-laki" : "Perempuan"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Wali Kelas</p>
                  <p className="text-sm font-semibold text-slate-900">{WALI_KELAS[siswa.kelas] || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Rata-rata Nilai</p>
                  <p className="text-sm font-semibold text-slate-900">{rataRata}</p>
                </div>
              </div>
            </div>

            {/* TABEL NILAI MAPEL */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm print:shadow-none print:border print:border-slate-300 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 print:border-slate-300">
                <p className="text-sm font-semibold text-slate-900">Nilai Pengetahuan &amp; Keterampilan</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white print:bg-slate-100 print:text-slate-900">
                      <th className="text-left font-semibold px-4 py-3 w-10">No.</th>
                      <th className="text-left font-semibold px-4 py-3">Mata Pelajaran</th>
                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">KKM</th>
                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">Nilai</th>
                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">Predikat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MAPEL.map((m, idx) => {
                      const n = siswa.nilai[m.key];
                      return (
                        <tr
                          key={m.key}
                          className={`border-b border-slate-100 last:border-0 ${
                            idx % 2 === 0 ? "bg-blue-50/60" : "bg-white"
                          } print:bg-white`}
                        >
                          <td className="px-4 py-2.5 text-slate-700 font-medium">{idx + 1}</td>
                          <td className="px-4 py-2.5 text-slate-900 font-medium">{m.label}</td>
                          <td className="px-4 py-2.5 text-center text-slate-700">{m.kkm}</td>
                          <td className="px-4 py-2.5 text-center text-slate-900 font-semibold">
                            {n.toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-center text-slate-700 font-medium">
                            {getPredikat(n)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SIKAP & KEHADIRAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm print:shadow-none print:border print:border-slate-300 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 print:border-slate-300">
                  <p className="text-sm font-semibold text-slate-900">Sikap</p>
                </div>
                <div className="px-6 py-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">Spiritual</p>
                    <p className="text-sm font-semibold text-slate-900">{SIKAP_DUMMY.spiritual}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">Sosial</p>
                    <p className="text-sm font-semibold text-slate-900">{SIKAP_DUMMY.sosial}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm print:shadow-none print:border print:border-slate-300 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 print:border-slate-300">
                  <p className="text-sm font-semibold text-slate-900">Kehadiran</p>
                </div>
                <div className="px-6 py-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">Sakit</p>
                    <p className="text-sm font-semibold text-slate-900">{KEHADIRAN_DUMMY.sakit} hari</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">Izin</p>
                    <p className="text-sm font-semibold text-slate-900">{KEHADIRAN_DUMMY.izin} hari</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">Tanpa Keterangan</p>
                    <p className="text-sm font-semibold text-slate-900">{KEHADIRAN_DUMMY.alpa} hari</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CATATAN WALI KELAS */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm print:shadow-none print:border print:border-slate-300 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 print:border-slate-300">
                <p className="text-sm font-semibold text-slate-900">Catatan Wali Kelas</p>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-slate-700 leading-relaxed">{CATATAN_DUMMY}</p>
              </div>
            </div>

            {/* TANDA TANGAN */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm print:shadow-none print:border print:border-slate-300 px-6 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm text-slate-600">Orang Tua/Wali</p>
                  <div className="h-16" />
                  <p className="text-sm font-semibold text-slate-900 border-t border-slate-300 pt-2">
                    (........................)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Wali Kelas</p>
                  <div className="h-16" />
                  <p className="text-sm font-semibold text-slate-900 border-t border-slate-300 pt-2">
                    {WALI_KELAS[siswa.kelas] || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Kepala Sekolah</p>
                  <div className="h-16" />
                  <p className="text-sm font-semibold text-slate-900 border-t border-slate-300 pt-2">
                    (........................)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}