"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import {
  ArrowLeft,
  User,
  Calendar,
  BookOpen,
  CheckCircle2,
  XCircle,
  Stethoscope,
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Clock,
  GraduationCap,
} from "lucide-react";

// =========================================================
// DATA DUMMY – SISWA & ABSENSI
// =========================================================

const SISWA_LIST = [
  { id: 1, nama: "Ahmad Fauzan", nis: "2401001", kelas: "X IPA 1", email: "ahmad.f@sekolah.com", phone: "081234567890", alamat: "Jl. Merdeka No. 12, Jakarta", tglLahir: "2006-05-10", gender: "L" },
  { id: 2, nama: "Bella Safira", nis: "2401002", kelas: "X IPA 1", email: "bella@sekolah.com", phone: "081234567891", alamat: "Jl. Sudirman No. 8, Jakarta", tglLahir: "2006-08-22", gender: "P" },
  { id: 3, nama: "Cahyo Nugroho", nis: "2401003", kelas: "X IPA 1", email: "cahyo@sekolah.com", phone: "081234567892", alamat: "Jl. Diponegoro No. 5, Jakarta", tglLahir: "2006-03-15", gender: "L" },
  { id: 4, nama: "Dinda Rahmawati", nis: "2401004", kelas: "X IPA 1", email: "dinda@sekolah.com", phone: "081234567893", alamat: "Jl. Gatot Subroto No. 3, Jakarta", tglLahir: "2006-11-02", gender: "P" },
  { id: 5, nama: "Eko Prasetyo", nis: "2401005", kelas: "X IPA 1", email: "eko@sekolah.com", phone: "081234567894", alamat: "Jl. Asia Afrika No. 45, Jakarta", tglLahir: "2006-09-12", gender: "L" },
  { id: 6, nama: "Fitri Handayani", nis: "2402001", kelas: "X IPA 2", email: "fitri@sekolah.com", phone: "081234567895", alamat: "Jl. Merdeka No. 20, Jakarta", tglLahir: "2006-02-28", gender: "P" },
  { id: 7, nama: "Galih Saputra", nis: "2402002", kelas: "X IPA 2", email: "galih@sekolah.com", phone: "081234567896", alamat: "Jl. Sudirman No. 15, Jakarta", tglLahir: "2006-07-19", gender: "L" },
  { id: 8, nama: "Hana Nurul", nis: "2402003", kelas: "X IPA 2", email: "hana@sekolah.com", phone: "081234567897", alamat: "Jl. Diponegoro No. 10, Jakarta", tglLahir: "2006-04-05", gender: "P" },
  { id: 9, nama: "Iqbal Ramadhan", nis: "2402004", kelas: "X IPA 2", email: "iqbal@sekolah.com", phone: "081234567898", alamat: "Jl. Gatot Subroto No. 7, Jakarta", tglLahir: "2006-12-25", gender: "L" },
  { id: 10, nama: "Jihan Syafira", nis: "2402005", kelas: "X IPA 2", email: "jihan@sekolah.com", phone: "081234567899", alamat: "Jl. Asia Afrika No. 22, Jakarta", tglLahir: "2006-06-14", gender: "P" },
  // Tambahkan data siswa lainnya sesuai kebutuhan
];

const MAPEL_LIST = [
  "Matematika",
  "Bahasa Indonesia",
  "Fisika",
  "Biologi",
  "Kimia",
  "Bahasa Inggris",
  "Sejarah",
  "PKN",
  "Agama",
  "Seni Budaya",
];

// Generate data absensi untuk siswa tertentu
const generateAttendanceForStudent = (siswaId) => {
  const data = [];
  const statuses = ["Hadir", "Hadir", "Hadir", "Hadir", "Sakit", "Izin", "Alpa"];
  const dates = [
    "2026-08-01", "2026-08-08", "2026-08-15", "2026-08-22",
    "2026-08-29", "2026-09-05", "2026-09-12", "2026-09-19",
    "2026-09-26", "2026-10-03", "2026-10-10", "2026-10-17",
  ];
  const notes = {
    Sakit: ["Demam", "Flu", "Sakit kepala", "Batuk"],
    Izin: ["Acara keluarga", "Keperluan pribadi"],
    Alpa: ["Tidak masuk tanpa keterangan"],
  };

  let id = 1;
  MAPEL_LIST.forEach((mapel) => {
    const numRecords = 4 + Math.floor(Math.random() * 5);
    const shuffledDates = [...dates].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(numRecords, shuffledDates.length); i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const hasNote = status !== "Hadir" && Math.random() > 0.5;
      data.push({
        id: id++,
        mapel,
        tanggal: shuffledDates[i],
        status,
        catatan: hasNote && status !== "Hadir"
          ? notes[status]?.[Math.floor(Math.random() * notes[status].length)] || "-"
          : "-",
        pertemuanKe: i + 1,
      });
    }
  });
  return data;
};

export default function DetailSiswaPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id);

  const [siswa, setSiswa] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState("Semua Mapel");

  useEffect(() => {
    const found = SISWA_LIST.find((s) => s.id === id);
    if (found) {
      setSiswa(found);
      setAttendanceData(generateAttendanceForStudent(id));
    } else {
      router.push("/guru/histori-absensi");
    }
  }, [id, router]);

  // Filter data per mapel
  const filteredData = useMemo(() => {
    if (selectedMapel === "Semua Mapel") return attendanceData;
    return attendanceData.filter((item) => item.mapel === selectedMapel);
  }, [attendanceData, selectedMapel]);

  // Statistik per mapel
  const mapelStats = useMemo(() => {
    const stats = {};
    MAPEL_LIST.forEach((mapel) => {
      const data = attendanceData.filter((item) => item.mapel === mapel);
      const total = data.length;
      const hadir = data.filter((d) => d.status === "Hadir").length;
      const sakit = data.filter((d) => d.status === "Sakit").length;
      const izin = data.filter((d) => d.status === "Izin").length;
      const alpa = data.filter((d) => d.status === "Alpa").length;
      const persentase = total > 0 ? Math.round((hadir / total) * 100) : 0;
      stats[mapel] = { total, hadir, sakit, izin, alpa, persentase };
    });
    return stats;
  }, [attendanceData]);

  // Total statistik
  const totalStats = useMemo(() => {
    const total = attendanceData.length;
    const hadir = attendanceData.filter((d) => d.status === "Hadir").length;
    const sakit = attendanceData.filter((d) => d.status === "Sakit").length;
    const izin = attendanceData.filter((d) => d.status === "Izin").length;
    const alpa = attendanceData.filter((d) => d.status === "Alpa").length;
    const persentase = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { total, hadir, sakit, izin, alpa, persentase };
  }, [attendanceData]);

  // Unique mapel yang ada
  const uniqueMapel = useMemo(() => {
    const set = new Set(attendanceData.map((item) => item.mapel));
    return ["Semua Mapel", ...Array.from(set)];
  }, [attendanceData]);

  if (!siswa) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <p className="text-slate-500">Memuat...</p>
      </div>
    );
  }

  const getInitials = (nama) => {
    const parts = nama.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return nama.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (nama) => {
    const colors = [
      "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500",
      "bg-indigo-500", "bg-purple-500", "bg-cyan-500", "bg-orange-500",
    ];
    return colors[nama.length % colors.length];
  };

  const getStatusBadge = (status) => {
    const map = {
      Hadir: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Sakit: "bg-amber-50 text-amber-700 border-amber-200",
      Izin: "bg-blue-50 text-blue-700 border-blue-200",
      Alpa: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return map[status] || "bg-slate-50 text-slate-500 border-slate-200";
  };

  const getStatusIcon = (status) => {
    const map = {
      Hadir: <CheckCircle2 size={14} className="text-emerald-500" />,
      Sakit: <Stethoscope size={14} className="text-amber-500" />,
      Izin: <FileText size={14} className="text-blue-500" />,
      Alpa: <XCircle size={14} className="text-rose-500" />,
    };
    return map[status] || null;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <Header />

        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8">

          <div className="w-full max-w-6xl mx-auto space-y-6">

            {/* BACK BUTTON */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition"
            >
              <ArrowLeft size={16} /> Kembali ke Histori Absensi
            </button>

            {/* =================================================
                PROFIL SISWA
            ================================================= */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className={`w-20 h-20 rounded-full ${getAvatarColor(siswa.nama)} flex items-center justify-center text-white text-3xl font-bold shadow-sm flex-shrink-0`}>
                  {getInitials(siswa.nama)}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-slate-800">{siswa.nama}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="text-sm text-slate-500">{siswa.nis}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {siswa.kelas}
                    </span>
                    <span className="text-sm text-slate-500">
                      {siswa.gender === "L" ? "Laki-laki" : "Perempuan"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
                    <FileText size={16} className="inline mr-1.5" /> Laporan
                  </button>
                </div>
              </div>

              {/* Detail Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">Email</p>
                    <p className="text-sm text-slate-700">{siswa.email || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">Telepon</p>
                    <p className="text-sm text-slate-700">{siswa.phone || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">Alamat</p>
                    <p className="text-sm text-slate-700">{siswa.alamat || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">Tanggal Lahir</p>
                    <p className="text-sm text-slate-700">{siswa.tglLahir ? formatDate(siswa.tglLahir) : "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                STATISTIK TOTAL
            ================================================= */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                ["Total", totalStats.total, "text-slate-800"],
                ["Hadir", totalStats.hadir, "text-emerald-600"],
                ["Sakit", totalStats.sakit, "text-amber-600"],
                ["Izin", totalStats.izin, "text-blue-600"],
                ["Alpa", totalStats.alpa, "text-rose-600"],
              ].map(([label, value, color]) => (
                <div
                  key={label}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 text-center hover:shadow transition-all"
                >
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
              <div className="bg-indigo-50/60 rounded-xl border border-indigo-100 shadow-sm p-3 text-center hover:shadow transition-all">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Kehadiran</p>
                <p className={`text-xl font-bold flex items-center justify-center gap-1 ${totalStats.persentase >= 80 ? "text-emerald-600" : "text-amber-600"}`}>
                  {totalStats.persentase}%
                  {totalStats.persentase >= 80 ? (
                    <TrendingUp size={16} className="text-emerald-500" />
                  ) : (
                    <TrendingDown size={16} className="text-amber-500" />
                  )}
                </p>
              </div>
            </div>

            {/* =================================================
                STATISTIK PER MAPEL
            ================================================= */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4">
                <BookOpen size={16} className="text-indigo-500" />
                Statistik Kehadiran per Mata Pelajaran
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MAPEL_LIST.map((mapel) => {
                  const stat = mapelStats[mapel];
                  if (!stat || stat.total === 0) return null;
                  return (
                    <div
                      key={mapel}
                      className="bg-slate-50 rounded-lg p-3 border border-slate-100"
                    >
                      <p className="font-medium text-slate-700 text-sm">{mapel}</p>
                      <div className="flex items-center gap-4 mt-1.5 text-xs">
                        <span className="text-emerald-600">✓ {stat.hadir}</span>
                        <span className="text-amber-600">🩺 {stat.sakit}</span>
                        <span className="text-blue-600">📋 {stat.izin}</span>
                        <span className="text-rose-600">✗ {stat.alpa}</span>
                        <span className={`font-bold ${stat.persentase >= 80 ? "text-emerald-600" : "text-amber-600"}`}>
                          {stat.persentase}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${stat.persentase >= 80 ? "bg-emerald-500" : "bg-amber-500"}`}
                          style={{ width: `${stat.persentase}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* =================================================
                RIWAYAT ABSENSI DETAIL
            ================================================= */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">
                    Riwayat Absensi Detail
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedMapel}
                    onChange={(e) => setSelectedMapel(e.target.value)}
                    className="px-3 py-1.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
                  >
                    {uniqueMapel.map((mapel) => (
                      <option key={mapel} value={mapel}>{mapel}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">#</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Mata Pelajaran</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Tanggal</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Status</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                          Tidak ada data absensi untuk siswa ini
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-150">
                          <td className="px-4 py-3 text-xs text-slate-400">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
                              {item.mapel}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">{formatDate(item.tanggal)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusBadge(item.status)}`}>
                              {getStatusIcon(item.status)}
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500">
                            {item.catatan !== "-" ? item.catatan : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-100">
              © 2026 SmartSchool • Detail Absensi Siswa
            </footer>

          </div>
        </main>

      </div>
    </div>
  );
}