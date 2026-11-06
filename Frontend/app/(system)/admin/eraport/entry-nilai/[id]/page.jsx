"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  X,
  ClipboardCheck,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";

import { getRaportSiswa } from "@/services/raport.service";

function getResultData(result) {
  if (result?.data?.data) {
    return result.data.data;
  }
  return result?.data || null;
}

function getGrade(finalScore) {
  const score = Number(finalScore) || 0;
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "E";
}

function getGradeStyle(grade) {
  if (grade === "A") return "theme-success";
  if (grade === "B") return "theme-info";
  if (grade === "C") return "theme-warning";
  return "theme-danger";
}

export default function DetailNilaiPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const siswaId = params?.id;
  const tahunAjaranId = searchParams.get("tahunAjaranId");
  const kelasMapelId = searchParams.get("kelasMapelId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSiswa, setDataSiswa] = useState(null);

  // State untuk menyimpan nilai yang sudah diagregasi
  const [nilaiDetail, setNilaiDetail] = useState({
    namaMapel: "Mata Pelajaran",
    nilaiAkhir: null,
    kkm: 75,
    predikat: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchDetail() {
      if (!siswaId || !tahunAjaranId) {
        if (isMounted) {
          setError("Parameter ID Siswa atau Tahun Ajaran tidak ditemukan.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await getRaportSiswa(
          String(siswaId),
          String(tahunAjaranId)
        );
        
        const data = getResultData(result);

        if (isMounted) {
          if (!data) {
            throw new Error("Data raport siswa tidak ditemukan.");
          }

          // Simulasi nama mapel (karena di halaman detail ini kita tidak fetch ulang data mapel,
          // idealnya nama mapel di-pass via query param, tapi untuk simplifikasi kita set default dulu)
          // Jika kamu mau lebih akurat, kamu bisa pass nama mapel di URL.
          
          setDataSiswa(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Gagal mengambil detail nilai:", err);
          setError(err?.message || "Gagal memuat data nilai siswa.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [siswaId, tahunAjaranId]);

  // Karena kita tidak fetch ulang mapel, kita bisa mengekstrak data mapel dari data raport
  // atau menggunakan data dari props/state.
  // Sebagai fallback, kita ambil dari data akademik siswa berdasarkan mapel.
  useEffect(() => {
    if (dataSiswa?.akademik && Array.isArray(dataSiswa.akademik)) {
      // Ambil data nilai mapel pertama atau berdasarkan matching id (jika ada)
      const mapelData = dataSiswa.akademik[0]; // Ambil mapel pertama sebagai contoh
      
      if (mapelData) {
        setNilaiDetail({
          namaMapel: mapelData.mapel || "Mata Pelajaran",
          nilaiAkhir: mapelData.totalNilai || null,
          kkm: mapelData.kkm || 75,
          predikat: mapelData.totalNilai ? getGrade(mapelData.totalNilai) : null,
        });
      }
    }
  }, [dataSiswa]);


  return (
    <div className="flex h-screen overflow-hidden theme-page theme-text">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Header />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
            
            {/* Breadcrumb & Tombol Kembali */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/eraport/entry-nilai"
                  className="p-2 border theme-border rounded-lg theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] hover:theme-text transition"
                  title="Kembali ke Entry Nilai"
                >
                  <ArrowLeft size={18} />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold theme-text tracking-tight">
                    Detail Nilai Siswa
                  </h1>
                  <p className="text-sm theme-text-secondary mt-0.5">
                    Informasi rincian nilai dan predikat siswa.
                  </p>
                </div>
              </div>
            </div>

            {loading && (
              <div className="w-full p-12 text-center theme-card border theme-border rounded-xl flex flex-col items-center">
                <Loader2 size={32} className="animate-spin text-[var(--color-primary)] mb-3" />
                <p className="text-sm theme-text-secondary">Memuat detail nilai siswa...</p>
              </div>
            )}

            {!loading && error && (
              <div className="w-full p-6 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] flex items-start gap-3 text-sm text-[var(--color-danger)]">
                <AlertCircle size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Gagal Memuat Data</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && dataSiswa && (
              <div className="w-full grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_350px] 2xl:grid-cols-[minmax(0,1fr)_400px] gap-6 items-start">
                
                {/* Kolom Kiri: Detail Nilai */}
                <div className="theme-card border theme-border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="theme-primary flex h-11 w-11 items-center justify-center rounded-lg">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <p className="theme-text text-sm font-semibold">
                        {dataSiswa.siswa?.nama || "Nama Siswa"}
                      </p>
                      <p className="theme-text-secondary text-xs">
                        NIS {dataSiswa.siswa?.nis || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="theme-card theme-border rounded-xl border p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="theme-text-muted text-xs">Mata Pelajaran</p>
                        <p className="theme-text mt-1 text-sm font-semibold">
                          {nilaiDetail.namaMapel}
                        </p>
                      </div>
                      <BookOpen size={20} className="text-theme-primary" />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="theme-card-soft theme-border rounded-lg border p-4">
                        <p className="theme-text-muted text-xs">Nilai Akhir</p>
                        <p className="theme-text mt-2 text-2xl font-bold">
                          {nilaiDetail.nilaiAkhir !== null ? nilaiDetail.nilaiAkhir : "-"}
                        </p>
                      </div>
                      <div className="theme-card-soft theme-border rounded-lg border p-4">
                        <p className="theme-text-muted text-xs">KKM</p>
                        <p className="theme-text mt-2 text-2xl font-bold">
                          {nilaiDetail.kkm}
                        </p>
                      </div>
                    </div>

                    <div className="theme-info mt-4 flex items-center justify-between rounded-xl border px-4 py-4">
                      <div>
                        <p className="text-xs font-medium">Predikat</p>
                        <p className="theme-text-secondary mt-1 text-sm font-semibold">
                          Berdasarkan nilai akhir
                        </p>
                      </div>
                      {nilaiDetail.predikat ? (
                        <span className={`${getGradeStyle(nilaiDetail.predikat)} inline-flex min-w-[40px] justify-center rounded-md border px-3 py-1 text-sm font-bold`}>
                          {nilaiDetail.predikat}
                        </span>
                      ) : (
                        <span className="theme-text-muted text-sm">Belum ada</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Panduan / Info */}
                <aside className="space-y-5">
                  <section className="rounded-xl border border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] p-5">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={18} className="mt-0.5 shrink-0 text-[var(--color-warning)]" />
                      <div>
                        <h3 className="text-xs font-bold text-[var(--color-warning)]">Informasi Nilai</h3>
                        <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-warning)] opacity-90">
                          Backend saat ini mengirimkan nilai yang sudah diagregasi. Rincian Tugas, UTS, UAS, dan Praktik belum tersedia melalui endpoint raport.
                        </p>
                      </div>
                    </div>
                  </section>
                </aside>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}