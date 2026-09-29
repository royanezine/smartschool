"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  AlertCircle,
  RefreshCw,
  BookOpen,
  GraduationCap,
} from "lucide-react";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import { getJadwalMengajar } from "../../../services/jadwalMengajar.service";

const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function formatTanggalHari(hari) {
  const sekarang = new Date();
  const hariIndex = hariList.indexOf(hari);
  const jsHari = sekarang.getDay();
  const hariSekarangIndex = jsHari === 0 ? 6 : jsHari - 1;
  const selisih = hariIndex - hariSekarangIndex;
  const tanggal = new Date(sekarang);
  tanggal.setDate(sekarang.getDate() + selisih);

  return tanggal.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getHariSekarang() {
  const sekarang = new Date();
  const hari = sekarang.getDay();
  if (hari === 0) return "Senin";
  return hariList[hari - 1];
}

function formatJam(jam) {
  if (!jam) return "-";
  return String(jam).slice(0, 5);
}

/* Warna aksen per mata pelajaran biar mirip jadwal sekolah */
const accentPalette = [
  { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-500", ring: "ring-blue-100" },
  { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", dot: "bg-indigo-500", ring: "ring-indigo-100" },
  { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", dot: "bg-sky-500", ring: "ring-sky-100" },
  { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", dot: "bg-cyan-500", ring: "ring-cyan-100" },
  { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700", dot: "bg-slate-500", ring: "ring-slate-100" },
];

function getAccent(index) {
  return accentPalette[index % accentPalette.length];
}

export default function JadwalSiswaPage() {
  const [hariAktif, setHariAktif] = useState(getHariSekarang());
  const [jadwalData, setJadwalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadJadwal = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getJadwalMengajar();
      console.log("[JADWAL SISWA] Response:", response);

      if (!response?.success) {
        throw new Error(response?.message || "Gagal mengambil jadwal pelajaran.");
      }

      const data = Array.isArray(response?.data) ? response.data : [];
      setJadwalData(data);
    } catch (err) {
      console.error("[JADWAL SISWA] Error:", err);
      setError(err?.message || "Gagal mengambil jadwal pelajaran.");
      setJadwalData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJadwal();
  }, []);

  const jadwalHariIni = useMemo(() => {
    return jadwalData
      .filter(
        (item) =>
          String(item?.hari || "").trim().toLowerCase() === hariAktif.toLowerCase()
      )
      .sort((a, b) =>
        String(a?.jamMulai || "").localeCompare(String(b?.jamMulai || ""))
      );
  }, [jadwalData, hariAktif]);

  const kelasSiswa = useMemo(() => {
    const kelasMap = new Map();
    jadwalData.forEach((item) => {
      const kelas = item?.kelasMapel?.kelas;
      if (kelas?.id) kelasMap.set(kelas.id, kelas);
    });
    return Array.from(kelasMap.values());
  }, [jadwalData]);

  const namaKelas = kelasSiswa.length > 0 ? kelasSiswa[0]?.nama : "-";

  const pindahHari = (arah) => {
    const index = hariList.indexOf(hariAktif);
    const nextIndex =
      arah === "next"
        ? (index + 1) % hariList.length
        : (index - 1 + hariList.length) % hariList.length;
    setHariAktif(hariList[nextIndex]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header toggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6">
          {/* BREADCRUMB */}
          <div className="mb-3">
            <p className="text-sm text-slate-500">
              Akademik
              <span className="mx-2 text-slate-300">/</span>
              <span className="text-slate-700">Jadwal Pelajaran</span>
            </p>
          </div>

          {/* HERO TITLE */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 px-6 py-6 mb-6 shadow-lg shadow-blue-600/20">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full bg-white/5" />

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
                  <CalendarDays size={26} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Jadwal Pelajaran</h1>
                  <p className="text-sm text-blue-100 mt-1">
                    Lihat jadwal pelajaran kelas Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/15 backdrop-blur px-4 py-2.5 ring-1 ring-white/20">
                  <p className="text-[11px] uppercase tracking-wide text-blue-100">
                    Kelas
                  </p>
                  <p className="text-sm font-semibold text-white">{namaKelas}</p>
                </div>
                <div className="hidden sm:block rounded-xl bg-white/15 backdrop-blur px-4 py-2.5 ring-1 ring-white/20">
                  <p className="text-[11px] uppercase tracking-wide text-blue-100">
                    Total Mapel
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {jadwalData.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-700">
                    Gagal mengambil jadwal
                  </p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={loadJadwal}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                >
                  <RefreshCw size={14} />
                  Coba Lagi
                </button>
              </div>
            </div>
          )}

          {/* HARI SELECTOR */}
          <div className="mb-6 rounded-2xl bg-white border border-slate-200 shadow-sm p-2">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => pindahHari("prev")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition"
                aria-label="Hari sebelumnya"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex-1 flex items-center gap-2 overflow-x-auto">
                {hariList.map((hari) => {
                  const isActive = hariAktif === hari;
                  const isToday = getHariSekarang() === hari;
                  return (
                    <button
                      type="button"
                      key={hari}
                      onClick={() => setHariAktif(hari)}
                      className={`relative shrink-0 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                          : "text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                      }`}
                    >
                      {hari}
                      {isToday && !isActive && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => pindahHari("next")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition"
                aria-label="Hari berikutnya"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* INFO HARI */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 ring-1 ring-blue-100 flex items-center justify-center">
                <CalendarDays size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {hariAktif}, {formatTanggalHari(hariAktif)}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {loading
                    ? "Memuat jadwal..."
                    : `${jadwalHariIni.length} mata pelajaran hari ini`}
                </p>
              </div>
            </div>

            {!loading && jadwalData.length > 0 && (
              <div className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-medium text-slate-600">
                <BookOpen size={14} className="text-slate-500" />
                Total jadwal:{" "}
                <span className="font-semibold text-slate-700">
                  {jadwalData.length}
                </span>
              </div>
            )}
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-20 text-center">
              <Loader2 size={36} className="mx-auto text-blue-600 animate-spin mb-4" />
              <p className="text-sm font-semibold text-slate-700">
                Memuat jadwal pelajaran...
              </p>
              <p className="text-xs text-slate-400 mt-1">Mengambil data dari server.</p>
            </div>
          ) : jadwalHariIni.length > 0 ? (
            <>
              {/* ============ DESKTOP: TIMELINE STYLE ============ */}
              <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="w-16 text-left px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Jam
                        </th>
                        <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Mata Pelajaran
                        </th>
                        <th className="w-64 text-left px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Guru Pengajar
                        </th>
                        <th className="w-40 text-left px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Ruang
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {jadwalHariIni.map((item, index) => {
                        const mapel = item?.kelasMapel?.mataPelajaran;
                        const guru = item?.kelasMapel?.guruPengajar;
                        const accent = getAccent(index);

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/70 transition-colors group"
                          >
                            {/* JAM */}
                            <td className="px-5 py-5 align-top">
                              <div className="flex flex-col items-center gap-1">
                                <div
                                  className={`w-2.5 h-2.5 rounded-full ${accent.dot}`}
                                />
                                <span className="text-xs font-bold text-slate-700">
                                  {formatJam(item.jamMulai)}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {formatJam(item.jamSelesai)}
                                </span>
                              </div>
                            </td>

                            {/* MAPEL */}
                            <td className="px-5 py-5">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-11 h-11 rounded-xl ${accent.bg} ring-1 ${accent.ring} flex items-center justify-center shrink-0`}
                                >
                                  <BookOpen size={19} className={accent.text} />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-800">
                                    {mapel?.nama || "-"}
                                  </p>
                                  {mapel?.kode && (
                                    <span
                                      className={`inline-block mt-1 rounded-md ${accent.bg} ${accent.text} px-2 py-0.5 text-[10px] font-semibold`}
                                    >
                                      {mapel.kode}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* GURU */}
                            <td className="px-5 py-5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                  <UserRound size={15} className="text-slate-500" />
                                </div>
                                <span className="text-sm text-slate-600">
                                  {guru?.namaLengkap || "-"}
                                </span>
                              </div>
                            </td>

                            {/* RUANG */}
                            <td className="px-5 py-5">
                              <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
                                <MapPin size={13} className="text-slate-400" />
                                {item.ruangan || "-"}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ============ MOBILE: CARD TIMELINE ============ */}
              <div className="md:hidden space-y-3">
                {jadwalHariIni.map((item, index) => {
                  const mapel = item?.kelasMapel?.mataPelajaran;
                  const guru = item?.kelasMapel?.guruPengajar;
                  const accent = getAccent(index);
                  const isLast = index === jadwalHariIni.length - 1;

                  return (
                    <div key={item.id} className="relative flex gap-3">
                      {/* TIMELINE */}
                      <div className="flex flex-col items-center pt-5">
                        <div
                          className={`w-3 h-3 rounded-full ${accent.dot} ring-4 ${accent.ring}`}
                        />
                        {!isLast && (
                          <div className="w-px flex-1 bg-slate-200 my-1" />
                        )}
                      </div>

                      {/* CARD */}
                      <div className="flex-1 pb-1">
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                          {/* HEADER */}
                          <div
                            className={`flex items-center justify-between px-4 py-2.5 ${accent.bg} border-b ${accent.border}`}
                          >
                            <div className="flex items-center gap-1.5">
                              <Clock3 size={14} className={accent.text} />
                              <span
                                className={`text-xs font-bold ${accent.text}`}
                              >
                                {formatJam(item.jamMulai)} -{" "}
                                {formatJam(item.jamSelesai)}
                              </span>
                            </div>
                            <span className="text-[10px] font-medium text-slate-500">
                              #{index + 1}
                            </span>
                          </div>

                          {/* BODY */}
                          <div className="p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div
                                className={`w-10 h-10 rounded-xl ${accent.bg} ring-1 ${accent.ring} flex items-center justify-center shrink-0`}
                              >
                                <BookOpen size={18} className={accent.text} />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-slate-800 truncate">
                                  {mapel?.nama || "-"}
                                </h3>
                                {mapel?.kode && (
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    Kode: {mapel.kode}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2 pt-3 border-t border-slate-100">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <UserRound
                                  size={14}
                                  className="text-slate-400 shrink-0"
                                />
                                <span className="truncate">
                                  {guru?.namaLengkap || "-"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin
                                  size={14}
                                  className="text-slate-400 shrink-0"
                                />
                                <span>{item.ruangan || "-"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* EMPTY STATE */
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl px-5 py-16 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <CalendarDays size={30} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                Tidak Ada Jadwal
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Tidak ada mata pelajaran untuk hari {hariAktif}.
              </p>
            </div>
          )}

          {/* INFO FOOTER */}
          <div className="mt-5 rounded-xl bg-blue-50/60 border border-blue-100 px-4 py-3 flex items-start gap-2.5">
            <Info size={17} className="mt-0.5 shrink-0 text-blue-500" />
            <p className="text-sm text-slate-600">
              Jadwal dapat berubah sewaktu-waktu sesuai informasi dari sekolah.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}