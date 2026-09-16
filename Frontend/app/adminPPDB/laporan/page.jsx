"use client";

import { useMemo, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import {
  ChevronRight,
  Users,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  School,
  Layers,
  BookOpen,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ================= DATA PENDAFTAR =================

const dataPendaftar = [
  { id: 1, noPendaftaran: "PPDB001", nama: "Andi Saputra", asalSekolah: "SMP Negeri 1", jurusan: "RPL", gelombang: "1", status: "Menunggu", tanggalDaftar: "2026-01-08" },
  { id: 2, noPendaftaran: "PPDB002", nama: "Budi Hartono", asalSekolah: "SMP Negeri 2", jurusan: "TKJ", gelombang: "1", status: "Terverifikasi", tanggalDaftar: "2026-01-08" },
  { id: 3, noPendaftaran: "PPDB003", nama: "Citra Ayu Lestari", asalSekolah: "SMP Negeri 3", jurusan: "Multimedia", gelombang: "1", status: "Lulus", tanggalDaftar: "2026-01-09" },
  { id: 4, noPendaftaran: "PPDB004", nama: "Deni Firmansyah", asalSekolah: "SMP Islam Al-Amin", jurusan: "Akuntansi", gelombang: "2", status: "Daftar Ulang", tanggalDaftar: "2026-02-02" },
  { id: 5, noPendaftaran: "PPDB005", nama: "Eka Putri Wulandari", asalSekolah: "SMP Negeri 4", jurusan: "RPL", gelombang: "2", status: "Tidak Lulus", tanggalDaftar: "2026-02-03" },
  { id: 6, noPendaftaran: "PPDB006", nama: "Fajar Nugroho", asalSekolah: "SMP Negeri 1", jurusan: "TKJ", gelombang: "1", status: "Terverifikasi", tanggalDaftar: "2026-01-10" },
  { id: 7, noPendaftaran: "PPDB007", nama: "Gita Lestari", asalSekolah: "SMP Kristen Harapan", jurusan: "Multimedia", gelombang: "1", status: "Lulus", tanggalDaftar: "2026-01-11" },
  { id: 8, noPendaftaran: "PPDB008", nama: "Hendra Wijaya", asalSekolah: "SMP Negeri 5", jurusan: "Akuntansi", gelombang: "2", status: "Lulus", tanggalDaftar: "2026-02-04" },
  { id: 9, noPendaftaran: "PPDB009", nama: "Indah Permatasari", asalSekolah: "SMP Negeri 2", jurusan: "RPL", gelombang: "3", status: "Menunggu", tanggalDaftar: "2026-03-01" },
  { id: 10, noPendaftaran: "PPDB010", nama: "Joko Prasetyo", asalSekolah: "SMP Negeri 3", jurusan: "TKJ", gelombang: "2", status: "Daftar Ulang", tanggalDaftar: "2026-02-05" },
  { id: 11, noPendaftaran: "PPDB011", nama: "Kartika Sari", asalSekolah: "SMP Negeri 4", jurusan: "Multimedia", gelombang: "1", status: "Daftar Ulang", tanggalDaftar: "2026-01-12" },
  { id: 12, noPendaftaran: "PPDB012", nama: "Luthfi Rahman", asalSekolah: "SMP Islam Al-Amin", jurusan: "Akuntansi", gelombang: "1", status: "Tidak Lulus", tanggalDaftar: "2026-01-13" },
  { id: 13, noPendaftaran: "PPDB013", nama: "Maya Anggraini", asalSekolah: "SMP Negeri 1", jurusan: "RPL", gelombang: "2", status: "Lulus", tanggalDaftar: "2026-02-06" },
  { id: 14, noPendaftaran: "PPDB014", nama: "Naufal Ardiansyah", asalSekolah: "SMP Negeri 5", jurusan: "TKJ", gelombang: "3", status: "Tidak Lulus", tanggalDaftar: "2026-03-02" },
  { id: 15, noPendaftaran: "PPDB015", nama: "Olivia Zahra", asalSekolah: "SMP Kristen Harapan", jurusan: "Multimedia", gelombang: "2", status: "Daftar Ulang", tanggalDaftar: "2026-02-07" },
  { id: 16, noPendaftaran: "PPDB016", nama: "Putra Wibowo", asalSekolah: "SMP Negeri 2", jurusan: "Akuntansi", gelombang: "1", status: "Daftar Ulang", tanggalDaftar: "2026-01-14" },
  { id: 17, noPendaftaran: "PPDB017", nama: "Qonita Rahmawati", asalSekolah: "SMP Negeri 1", jurusan: "RPL", gelombang: "1", status: "Tidak Lulus", tanggalDaftar: "2026-01-15" },
  { id: 18, noPendaftaran: "PPDB018", nama: "Rizky Ramadhan", asalSekolah: "SMP Negeri 3", jurusan: "TKJ", gelombang: "2", status: "Lulus", tanggalDaftar: "2026-02-08" },
  { id: 19, noPendaftaran: "PPDB019", nama: "Sinta Dewi", asalSekolah: "SMP Kristen Harapan", jurusan: "Multimedia", gelombang: "3", status: "Menunggu", tanggalDaftar: "2026-03-03" },
  { id: 20, noPendaftaran: "PPDB020", nama: "Taufik Hidayat", asalSekolah: "SMP Negeri 4", jurusan: "Akuntansi", gelombang: "2", status: "Tidak Lulus", tanggalDaftar: "2026-02-09" },
];

const JURUSAN_LIST = ["RPL", "TKJ", "Multimedia", "Akuntansi"];
const GELOMBANG_LIST = ["1", "2", "3"];

const JURUSAN_COLORS = { RPL: "#2563EB", TKJ: "#0EA5E9", Multimedia: "#8B5CF6", Akuntansi: "#F59E0B" };
const STATUS_COLORS = { Diterima: "#10B981", Ditolak: "#F43F5E", "Proses Seleksi": "#F59E0B" };

const GELOMBANG_OPTIONS = ["Semua Gelombang", ...GELOMBANG_LIST];

function formatTanggal(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

// ================= EXPORT HELPERS =================

// Export Excel menggunakan SheetJS (pastikan package "xlsx" sudah terpasang: npm i xlsx)
async function exportExcel(rows, filename) {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan PPDB");
  XLSX.writeFile(wb, filename);
}

// Export PDF memanfaatkan print dialog browser (area non-laporan disembunyikan lewat CSS @media print)
function exportPDF() {
  window.print();
}

export default function LaporanPPDBPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filterGelombang, setFilterGelombang] = useState("Semua Gelombang");

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const dataFiltered = useMemo(() => {
    if (filterGelombang === "Semua Gelombang") return dataPendaftar;
    return dataPendaftar.filter((p) => p.gelombang === filterGelombang);
  }, [filterGelombang]);

  // ---- Ringkasan utama ----
  const ringkasan = useMemo(() => {
    const total = dataFiltered.length;
    const diterima = dataFiltered.filter((p) => p.status === "Lulus" || p.status === "Daftar Ulang").length;
    const ditolak = dataFiltered.filter((p) => p.status === "Tidak Lulus").length;
    const daftarUlang = dataFiltered.filter((p) => p.status === "Daftar Ulang").length;
    return { total, diterima, ditolak, daftarUlang };
  }, [dataFiltered]);

  // ---- Per jurusan ----
  const perJurusan = useMemo(
    () =>
      JURUSAN_LIST.map((j) => ({
        jurusan: j,
        jumlah: dataFiltered.filter((p) => p.jurusan === j).length,
      })),
    [dataFiltered]
  );

  // ---- Per gelombang ----
  const perGelombang = useMemo(
    () =>
      GELOMBANG_LIST.map((g) => ({
        gelombang: `Gelombang ${g}`,
        jumlah: dataFiltered.filter((p) => p.gelombang === g).length,
      })),
    [dataFiltered]
  );

  // ---- Distribusi status (untuk pie chart) ----
  const distribusiStatus = useMemo(() => {
    const menunggu = dataFiltered.filter((p) => p.status === "Menunggu" || p.status === "Terverifikasi").length;
    return [
      { name: "Diterima", value: ringkasan.diterima },
      { name: "Ditolak", value: ringkasan.ditolak },
      { name: "Proses Seleksi", value: menunggu },
    ].filter((d) => d.value > 0);
  }, [dataFiltered, ringkasan]);

  // ---- Rekap asal sekolah ----
  const rekapAsalSekolah = useMemo(() => {
    const map = {};
    dataFiltered.forEach((p) => {
      if (!map[p.asalSekolah]) map[p.asalSekolah] = { asalSekolah: p.asalSekolah, jumlah: 0, diterima: 0 };
      map[p.asalSekolah].jumlah += 1;
      if (p.status === "Lulus" || p.status === "Daftar Ulang") map[p.asalSekolah].diterima += 1;
    });
    return Object.values(map).sort((a, b) => b.jumlah - a.jumlah);
  }, [dataFiltered]);

  const handleExportExcel = () => {
    const rows = dataFiltered.map((p) => ({
      "No. Pendaftaran": p.noPendaftaran,
      Nama: p.nama,
      "Asal Sekolah": p.asalSekolah,
      Jurusan: p.jurusan,
      Gelombang: p.gelombang,
      Status: p.status,
      "Tanggal Daftar": formatTanggal(p.tanggalDaftar),
    }));
    exportExcel(rows, `Laporan-PPDB-${filterGelombang.replace(/\s/g, "-")}.xlsx`);
  };

  return (
    <div className="flex h-screen w-full bg-[#EEF0F2] overflow-hidden">
      <div className="print:hidden">
        <Sidebar
          role="adminPPDB"
          active="laporan"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <div className="print:hidden">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{ name: "Admin PPDB", email: "adminppdb@smartschool.com", avatar: "PP" }}
          />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div id="area-laporan" className="w-full p-4 md:p-6 lg:p-8">
            <div className="w-full space-y-5 max-w-[1320px] mx-auto">
              <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>PPDB</span>
                  <ChevronRight size={12} />
                  <span className="text-slate-600 font-medium">Laporan</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <select
                    value={filterGelombang}
                    onChange={(e) => setFilterGelombang(e.target.value)}
                    className="text-xs text-slate-600 border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400 bg-white"
                  >
                    {GELOMBANG_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-md transition-colors"
                  >
                    <FileSpreadsheet size={14} />
                    Export Excel
                  </button>

                  <button
                    onClick={exportPDF}
                    className="flex items-center gap-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-md transition-colors"
                  >
                    <FileText size={14} />
                    Export PDF
                  </button>
                </div>
              </div>

              {/* Judul untuk versi cetak/PDF */}
              <div className="hidden print:block text-center mb-2">
                <h1 className="text-lg font-bold text-slate-800">Laporan PPDB — SmartSchool</h1>
                <p className="text-xs text-slate-500">
                  {filterGelombang === "Semua Gelombang" ? "Seluruh Gelombang" : filterGelombang} &middot;{" "}
                  {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              </div>

              {/* ===== KARTU RINGKASAN ===== */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Users size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total Pendaftar</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{ringkasan.total}</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Jumlah Diterima</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">{ringkasan.diterima}</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                    <XCircle size={16} className="text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Jumlah Ditolak</p>
                    <p className="text-2xl font-bold text-rose-500 mt-1">{ringkasan.ditolak}</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <ClipboardCheck size={16} className="text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Sudah Daftar Ulang</p>
                    <p className="text-2xl font-bold text-violet-600 mt-1">{ringkasan.daftarUlang}</p>
                  </div>
                </div>
              </section>

              {/* ===== GRAFIK PER JURUSAN & PER GELOMBANG ===== */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen size={14} className="text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700">Pendaftar per Jurusan</p>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={perJurusan} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="jurusan" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip cursor={{ fill: "#F8FAFC" }} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
                      <Bar dataKey="jumlah" radius={[6, 6, 0, 0]}>
                        {perJurusan.map((entry) => (
                          <Cell key={entry.jurusan} fill={JURUSAN_COLORS[entry.jurusan]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Layers size={14} className="text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700">Pendaftar per Gelombang</p>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={perGelombang} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="gelombang" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip cursor={{ fill: "#F8FAFC" }} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
                      <Bar dataKey="jumlah" fill="#2563EB" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* ===== DISTRIBUSI STATUS & REKAP ASAL SEKOLAH ===== */}
              <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-5 lg:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={14} className="text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700">Distribusi Status Akhir</p>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={distribusiStatus}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                      >
                        {distribusiStatus.map((entry) => (
                          <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span className="text-xs text-slate-500">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl p-5 lg:col-span-3">
                  <div className="flex items-center gap-2 mb-4">
                    <School size={14} className="text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700">Rekap Asal Sekolah</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                          <th className="py-2 pr-3 font-medium">Asal Sekolah</th>
                          <th className="py-2 pr-3 font-medium text-center">Jumlah Pendaftar</th>
                          <th className="py-2 pr-3 font-medium text-center">Diterima</th>
                          <th className="py-2 font-medium">Proporsi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rekapAsalSekolah.map((r) => (
                          <tr key={r.asalSekolah} className="border-b border-slate-50">
                            <td className="py-2.5 pr-3 text-slate-700">{r.asalSekolah}</td>
                            <td className="py-2.5 pr-3 text-center text-slate-600 font-medium">{r.jumlah}</td>
                            <td className="py-2.5 pr-3 text-center text-emerald-600 font-medium">{r.diterima}</td>
                            <td className="py-2.5">
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${(r.jumlah / ringkasan.total) * 100}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <footer className="text-center text-[11px] text-slate-400 py-3 print:hidden">
                © 2026 SmartSchool &middot; Dashboard Admin PPDB &middot; All rights reserved
              </footer>
            </div>
          </div>
        </main>
      </div>

      {/* Sembunyikan elemen non-laporan saat mencetak / export PDF */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}