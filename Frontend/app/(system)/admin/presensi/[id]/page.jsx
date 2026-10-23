"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ClipboardCheck,
  MapPin,
  UserRound,
  BookOpen,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

import {
  getAbsensiKelas,
  getMonitoringKehadiranGuru,
} from "@/services/absensi.service";


function formatTanggal(tanggal) {
  if (!tanggal) return "-";
  const raw = String(tanggal);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [yyyy, mm, dd] = raw.split("-");
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd)).toLocaleDateString(
      "id-ID",
      { day: "2-digit", month: "long", year: "numeric" }
    );
  }
  const date = new Date(tanggal);
  if (Number.isNaN(date.getTime())) return String(tanggal);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatJam(tanggal) {
  if (!tanggal) return "-";
  const date = new Date(tanggal);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

function getInitials(name) {
  return (
    String(name || "-")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "-"
  );
}

const STATUS_CONFIG = {
  Hadir: "theme-success",
  Terlambat: "theme-warning",
  Izin: "theme-info",
  Sakit: "theme-card-soft theme-text-secondary",
  "Tidak Hadir": "theme-danger",
};


export default function DetailPresensiPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");

    try {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
      const guruRes = await getMonitoringKehadiranGuru(today);
      const guruData = Array.isArray(guruRes?.data) ? guruRes.data : [];
      
      const foundGuru = guruData.find((item) => item.id === id || item.absensi?.id === id);
      
      if (foundGuru) {
        const pengguna = foundGuru.pengguna || {};
        const absensi = foundGuru;
        
        setData({
          nama: pengguna.namaLengkap || "Pengguna",
          nomorInduk: pengguna.nip || pengguna.nuptk || "-",
          role: "Guru",
          kelas: pengguna.jabatan || absensi.shiftKerja?.nama || "-",
          tanggal: absensi.tanggal,
          jamMasuk: absensi.waktuMasuk ? formatJam(absensi.waktuMasuk) : "-",
          jamPulang: absensi.waktuKeluar ? formatJam(absensi.waktuKeluar) : "-",
          status: absensi.statusShift === "tepat_waktu" ? "Hadir" : (absensi.statusShift === "terlambat" ? "Terlambat" : (absensi.status || "Tidak Hadir")),
          metode: absensi.metode || "-",
          lintang: absensi.lintang,
          bujur: absensi.bujur,
          keterangan: absensi.keterangan || "-",
          avatar: getInitials(pengguna.namaLengkap)
        });
      } else {
        throw new Error("Data presensi tidak ditemukan atau ID tidak valid.");
      }
    } catch (err) {
      setError(err?.message || "Gagal mengambil data detail presensi.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        activeMenu="presensi"
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          title="Detail Presensi"
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
            
            <div>
              <button
                type="button"
                onClick={() => router.push("/admin/presensi")}
                className="inline-flex items-center gap-2 rounded-xl border theme-border theme-card px-4 py-2 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]"
              >
                <ArrowLeft size={16} />
                Kembali ke Daftar
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Terjadi kesalahan</p>
                  <p className="mt-0.5 text-sm">{error}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 theme-card rounded-2xl border theme-border">
                <Loader2 size={28} className="animate-spin text-[var(--color-primary)]" />
                <p className="text-sm font-medium theme-text">Memuat detail presensi...</p>
              </div>
            ) : data ? (
              <div className="space-y-6">
                <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
                  <div className="theme-primary h-24 w-full opacity-20" />
                  <div className="px-6 pb-6 relative">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-10 sm:-mt-12 mb-4">
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white dark:border-gray-800 theme-primary text-3xl font-bold shadow-md">
                        {data.avatar}
                      </div>
                      <div className="text-center sm:text-left flex-1 pb-2">
                        <h1 className="text-2xl font-bold theme-text">{data.nama}</h1>
                        <p className="text-sm theme-text-secondary">{data.nomorInduk}</p>
                      </div>
                      <div className="pb-2">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${STATUS_CONFIG[data.status] || "theme-card-soft"}`}>
                          {data.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="theme-card rounded-xl border p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-1">
                      <CalendarDays size={18} className="theme-text-muted" />
                      <p className="text-sm font-medium theme-text-muted">Tanggal</p>
                    </div>
                    <p className="text-base font-semibold theme-text">{formatTanggal(data.tanggal)}</p>
                  </div>

                  <div className="theme-card rounded-xl border p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-1">
                      <UserRound size={18} className="theme-text-muted" />
                      <p className="text-sm font-medium theme-text-muted">Peran</p>
                    </div>
                    <p className="text-base font-semibold theme-text">{data.role}</p>
                  </div>

                  <div className="theme-card rounded-xl border p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-1">
                      <BookOpen size={18} className="theme-text-muted" />
                      <p className="text-sm font-medium theme-text-muted">Kelas / Jabatan</p>
                    </div>
                    <p className="text-base font-semibold theme-text">{data.kelas}</p>
                  </div>

                  <div className="theme-card rounded-xl border p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-1">
                      <ClipboardCheck size={18} className="theme-text-muted" />
                      <p className="text-sm font-medium theme-text-muted">Metode Absensi</p>
                    </div>
                    <p className="text-base font-semibold theme-text capitalize">{data.metode}</p>
                  </div>

                  <div className="theme-card rounded-xl border p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-1">
                      <Clock3 size={18} className="text-emerald-500" />
                      <p className="text-sm font-medium theme-text-muted">Jam Masuk</p>
                    </div>
                    <p className="text-base font-semibold theme-text">{data.jamMasuk}</p>
                  </div>

                  <div className="theme-card rounded-xl border p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-1">
                      <Clock3 size={18} className="text-blue-500" />
                      <p className="text-sm font-medium theme-text-muted">Jam Pulang</p>
                    </div>
                    <p className="text-base font-semibold theme-text">{data.jamPulang}</p>
                  </div>
                </div>

                <div className="theme-card rounded-xl border p-5 shadow-sm space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin size={18} className="theme-text-muted" />
                      <p className="text-sm font-medium theme-text-muted">Lokasi Presensi</p>
                    </div>
                    {data.lintang && data.bujur ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm theme-text-secondary">
                          Koordinat: {data.lintang}, {data.bujur}
                        </p>
                        <a
                          href={`https://www.google.com/maps?q=${data.lintang},${data.bujur}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] hover:underline"
                        >
                          Lihat di Google Maps <ExternalLink size={14} />
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm theme-text-secondary">Tidak ada data lokasi (GPS).</p>
                    )}
                  </div>

                  <div className="pt-4 border-t theme-border">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle size={18} className="theme-text-muted" />
                      <p className="text-sm font-medium theme-text-muted">Keterangan</p>
                    </div>
                    <p className="text-sm theme-text-secondary whitespace-pre-wrap">
                      {data.keterangan}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}