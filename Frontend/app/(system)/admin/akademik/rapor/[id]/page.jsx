"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getRaportSiswa, getTahunAjaran } from "@/services/raport.service";
import {
  ChevronLeft,
  Printer,
  User,
  GraduationCap,
  Loader2,
} from "lucide-react";

function getPredikat(n) {
  const num = Number(n) || 0;
  if (num >= 90) return "A";
  if (num >= 80) return "B";
  if (num >= 75) return "C";
  return "D";
}

export default function RaporDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [raporData, setRaporData] = useState(null);
  const [tahunAjaranInfo, setTahunAjaranInfo] =
    useState(null);

  const siswaId = params?.id;
  const paramTaId = searchParams.get("tahunAjaranId");

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    if (!siswaId) return;

    let active = true;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        let taId = paramTaId;

        const taRes = await getTahunAjaran();
        const taList = Array.isArray(taRes?.data)
          ? taRes.data
          : Array.isArray(taRes)
          ? taRes
          : [];

        // Field resmi tahun ajaran adalah `status` (contoh:
        // "aktif"/"tidak_aktif"), bukan `aktif`.
        const taAktif =
          taList.find(
            (t) =>
              String(t?.status || "").toLowerCase() === "aktif"
          ) || taList[0];

        const taTerpilih = taId
          ? taList.find(
              (t) => String(t?.id) === String(taId)
            ) || taAktif
          : taAktif;

        taId = taTerpilih?.id || taId;

        if (active) {
          setTahunAjaranInfo(taTerpilih || null);
        }

        if (!taId) {
          if (active) {
            setErrorMsg("Tahun ajaran belum dikonfigurasi di server.");
            setLoading(false);
          }
          return;
        }

        const res = await getRaportSiswa(String(siswaId), String(taId));
        if (!active) return;
        const data = res?.data || res;
        setRaporData(data);
      } catch (err) {
        if (!active) return;
        const msg = err?.message || "Gagal memuat buku rapor siswa.";
        setErrorMsg(msg);
      } finally {
        if (active) setLoading(false);
      }
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [siswaId, paramTaId]);

  const handlePrint = () => {
    window.print();
  };

  // Kontrak GET /api/raport/:siswaId/tahun-ajaran/:tahunAjaranId adalah
  // { identitas, akademik, kehadiran, catatanWaliKelas }.
  const identitas = raporData?.identitas || null;
  const kehadiran = raporData?.kehadiran || null;
  const catatanWaliKelas =
    raporData?.catatanWaliKelas || "";

  const nilaiList = useMemo(() => {
    const raw = raporData?.akademik;
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => ({
      mapel: item?.mapel || "Mata Pelajaran",
      kkm: item?.kkm ?? null,
      totalNilai: Number(item?.totalNilai || 0),
      predikat: item?.predikat || null,
    }));
  }, [raporData]);

  const rataRata = useMemo(() => {
    if (nilaiList.length === 0) return null;
    const total = nilaiList.reduce((acc, curr) => acc + curr.totalNilai, 0);
    return (total / nilaiList.length).toFixed(2);
  }, [nilaiList]);

  if (loading) {
    return (
      <div className="flex h-screen w-full theme-page overflow-hidden">
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
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
          <main className="flex-1 flex items-center justify-center p-6 theme-page">
            <div className="flex flex-col items-center gap-3 text-sm theme-text-muted">
              <Loader2 size={24} className="animate-spin theme-primary-text" />
              <p>Memuat data buku rapor siswa...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (errorMsg || !identitas) {
    return (
      <div className="flex h-screen w-full theme-page overflow-hidden">
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
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
          <main className="flex-1 overflow-y-auto theme-page">
            <div className="p-4 sm:p-6 lg:p-8 space-y-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm font-semibold theme-text-muted theme-sidebar-hover transition-colors rounded-md px-1 py-1"
              >
                <ChevronLeft size={16} />
                Kembali
              </button>

              <div className="theme-card rounded-xl border theme-border p-10 text-center text-sm theme-text-muted shadow-sm">
                {errorMsg || "Data siswa atau buku rapor tidak ditemukan."}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
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
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto print:overflow-visible theme-page">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto print:max-w-full">
            <div className="flex items-center justify-between print:hidden">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm font-semibold theme-text-muted theme-sidebar-hover transition-colors rounded-md px-1 py-1"
              >
                <ChevronLeft size={16} />
                Kembali
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl theme-primary text-sm font-semibold shadow-sm transition-colors"
              >
                <Printer size={16} />
                Cetak Rapor
              </button>
            </div>

            <div className="theme-card rounded-xl border theme-border shadow-sm print:shadow-none print:border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-5 print:bg-white print:text-slate-900 print:border-b print:border-slate-300">
                <p className="text-xs font-medium tracking-wide text-blue-100 uppercase">
                  Laporan Hasil Belajar Peserta Didik
                </p>

                <h2 className="text-xl font-bold mt-0.5">
                  Buku Rapor Siswa
                </h2>

                <p className="text-xs text-blue-100 mt-1">
                  Tahun Ajaran:{" "}
                  {tahunAjaranInfo?.tahunAjaran || "Belum tersedia"} &bull;
                  Semester:{" "}
                  {tahunAjaranInfo?.semester || "Belum tersedia"}
                </p>
              </div>

              <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg theme-info print:hidden">
                    <User size={18} />
                  </div>

                  <div>
                    <p className="text-xs theme-text-muted">
                      Nama Siswa
                    </p>

                    <p className="text-sm font-semibold theme-text">
                      {identitas.nama || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg theme-info print:hidden">
                    <GraduationCap size={18} />
                  </div>

                  <div>
                    <p className="text-xs theme-text-muted">
                      Kelas
                    </p>

                    <p className="text-sm font-semibold theme-text">
                      {identitas.kelas || "-"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs theme-text-muted">
                    Nomor Induk / NISN
                  </p>

                  <p className="text-sm font-semibold theme-text">
                    {identitas.nis || identitas.nisn || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs theme-text-muted">
                    Jenis Kelamin
                  </p>

                  <p className="text-sm font-semibold theme-text">
                    Belum tersedia
                  </p>
                </div>

                <div>
                  <p className="text-xs theme-text-muted">
                    Wali Kelas
                  </p>

                  <p className="text-sm font-semibold theme-text">
                    Belum tersedia
                  </p>
                </div>

                <div>
                  <p className="text-xs theme-text-muted">
                    Rata-rata Nilai
                  </p>

                  <p className="text-sm font-semibold theme-text">
                    {rataRata ?? "Belum tersedia"}
                  </p>
                </div>
              </div>
            </div>

            <div className="theme-card rounded-xl border theme-border shadow-sm print:shadow-none print:border print:border-slate-300 overflow-hidden">
              <div className="px-6 py-4 border-b theme-border-soft print:border-slate-300">
                <p className="text-sm font-semibold theme-text">
                  Nilai Pengetahuan &amp; Keterampilan
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white print:bg-slate-100 print:text-slate-900">
                      <th className="text-left font-semibold px-4 py-3 w-10">
                        No.
                      </th>

                      <th className="text-left font-semibold px-4 py-3">
                        Mata Pelajaran
                      </th>

                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                        KKM
                      </th>

                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                        Nilai
                      </th>

                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                        Predikat
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {nilaiList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-sm theme-text-muted"
                        >
                          Belum ada nilai yang difinalisasi untuk siswa ini.
                        </td>
                      </tr>
                    ) : (
                      nilaiList.map((m, idx) => (
                        <tr
                          key={m.mapel}
                          className="border-b theme-border-soft last:border-0 theme-table-hover print:bg-white"
                        >
                          <td className="px-4 py-2.5 theme-text-secondary font-medium">
                            {idx + 1}
                          </td>

                          <td className="px-4 py-2.5 theme-text font-medium">
                            {m.mapel}
                          </td>

                          <td className="px-4 py-2.5 text-center theme-text-secondary">
                            {m.kkm ?? "-"}
                          </td>

                          <td className="px-4 py-2.5 text-center theme-text font-semibold">
                            {m.totalNilai}
                          </td>

                          <td className="px-4 py-2.5 text-center theme-text-secondary font-medium">
                            {m.predikat || getPredikat(m.totalNilai)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="theme-card rounded-xl border theme-border shadow-sm print:shadow-none print:border print:border-slate-300 overflow-hidden">
                <div className="px-6 py-4 border-b theme-border-soft print:border-slate-300">
                  <p className="text-sm font-semibold theme-text">
                    Kehadiran
                  </p>
                </div>

                <div className="px-6 py-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm theme-text-secondary">
                      Hadir
                    </p>

                    <p className="text-sm font-semibold theme-text">
                      {kehadiran?.hadir ?? "Belum tersedia"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm theme-text-secondary">
                      Sakit
                    </p>

                    <p className="text-sm font-semibold theme-text">
                      {kehadiran?.sakit ?? "Belum tersedia"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm theme-text-secondary">
                      Izin
                    </p>

                    <p className="text-sm font-semibold theme-text">
                      {kehadiran?.izin ?? "Belum tersedia"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm theme-text-secondary">
                      Tanpa Keterangan
                    </p>

                    <p className="text-sm font-semibold theme-text">
                      {kehadiran?.alpha ?? "Belum tersedia"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="theme-card rounded-xl border theme-border shadow-sm print:shadow-none print:border print:border-slate-300 overflow-hidden">
                <div className="px-6 py-4 border-b theme-border-soft print:border-slate-300">
                  <p className="text-sm font-semibold theme-text">
                    Catatan Wali Kelas
                  </p>
                </div>

                <div className="px-6 py-4">
                  <p className="text-sm theme-text-secondary leading-relaxed">
                    {catatanWaliKelas ||
                      "Tidak ada catatan khusus dari wali kelas."}
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
