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
  Loader2,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  FileText,
} from "lucide-react";

import { getRaportSiswa } from "@/services/raport.service";
import { getKelasMapelById } from "@/services/kelasMapel.service";

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
  const params = useParams();
  const searchParams = useSearchParams();

  const siswaId = params?.id;
  const tahunAjaranId = searchParams.get("tahunAjaranId");
  const kelasMapelId = searchParams.get("kelasMapelId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSiswa, setDataSiswa] = useState(null);
  const [kelasMapelDetail, setKelasMapelDetail] = useState(null);
  const [selectedMapelName, setSelectedMapelName] = useState("");

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

        const [raportResult, mapelDetailResult] = await Promise.all([
          getRaportSiswa(String(siswaId), String(tahunAjaranId)),
          kelasMapelId ? getKelasMapelById(String(kelasMapelId)).catch(() => null) : Promise.resolve(null),
        ]);

        const data = getResultData(raportResult);

        if (isMounted) {
          if (!data) {
            throw new Error("Data raport siswa tidak ditemukan.");
          }

          setDataSiswa(data);
          setKelasMapelDetail(mapelDetailResult);

          const targetNama = String(
            mapelDetailResult?.mataPelajaran?.nama || ""
          ).trim();
          const listAkademik = Array.isArray(data.akademik) ? data.akademik : [];
          const matched = targetNama
            ? listAkademik.find(
                (item) =>
                  String(item?.mapel || "").trim().toLowerCase() ===
                  targetNama.toLowerCase()
              )
            : null;

          setSelectedMapelName(
            matched?.mapel || targetNama || listAkademik[0]?.mapel || ""
          );
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
  }, [siswaId, tahunAjaranId, kelasMapelId]);

  const listAkademik = Array.isArray(dataSiswa?.akademik) ? dataSiswa.akademik : [];
  const activeMapelData =
    listAkademik.find(
      (item) =>
        String(item?.mapel || "").trim().toLowerCase() ===
        String(selectedMapelName || "").trim().toLowerCase()
    ) || null;

  const identitas = dataSiswa?.identitas || dataSiswa?.siswa || {};
  const displayNamaMapel =
    activeMapelData?.mapel ||
    kelasMapelDetail?.mataPelajaran?.nama ||
    selectedMapelName ||
    "Mata Pelajaran";
  const nilaiAkhir =
    activeMapelData?.totalNilai !== undefined && activeMapelData?.totalNilai !== null
      ? Number(activeMapelData.totalNilai)
      : null;
  const kkm = activeMapelData?.kkm ?? 75;
  const predikat =
    activeMapelData?.predikat ||
    (nilaiAkhir !== null ? getGrade(nilaiAkhir) : null);
  const kehadiran = dataSiswa?.kehadiran || null;


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
                    Informasi rincian nilai agregat raport dan kehadiran siswa.
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
              <div className="w-full grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px] gap-6 items-start">
                
                {/* Kolom Kiri: Detail Nilai */}
                <div className="space-y-6">
                  <div className="theme-card border theme-border rounded-xl p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="theme-primary flex h-11 w-11 items-center justify-center rounded-lg">
                          <GraduationCap size={20} />
                        </div>
                        <div>
                          <p className="theme-text text-sm font-semibold">
                            {identitas?.nama || "Siswa"}
                          </p>
                          <p className="theme-text-secondary text-xs">
                            NIS {identitas?.nis || "-"} • NISN {identitas?.nisn || "-"}
                            {identitas?.kelas ? ` • Kelas ${identitas.kelas}` : ""}
                          </p>
                        </div>
                      </div>
                      {kelasMapelDetail?.kelas?.nama && (
                        <span className="theme-card-soft theme-border rounded-lg border px-3 py-1 text-xs font-semibold theme-text-secondary">
                          {kelasMapelDetail.kelas.nama}
                        </span>
                      )}
                    </div>

                    <div className="theme-card theme-border rounded-xl border p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="theme-text-muted text-xs">Mata Pelajaran Terpilih</p>
                          <p className="theme-text mt-1 text-sm font-semibold">
                            {displayNamaMapel}
                          </p>
                        </div>
                        <BookOpen size={20} className="text-theme-primary" />
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="theme-card-soft theme-border rounded-lg border p-4">
                          <p className="theme-text-muted text-xs">Nilai Akhir</p>
                          <p className="theme-text mt-2 text-2xl font-bold">
                            {nilaiAkhir !== null ? nilaiAkhir : "-"}
                          </p>
                        </div>
                        <div className="theme-card-soft theme-border rounded-lg border p-4">
                          <p className="theme-text-muted text-xs">KKM</p>
                          <p className="theme-text mt-2 text-2xl font-bold">
                            {kkm}
                          </p>
                        </div>
                      </div>

                      <div className="theme-info mt-4 flex items-center justify-between rounded-xl border px-4 py-4">
                        <div>
                          <p className="text-xs font-medium">Predikat</p>
                          <p className="theme-text-secondary mt-1 text-sm font-semibold">
                            {nilaiAkhir !== null
                              ? nilaiAkhir >= kkm
                                ? "Tuntas memenuhi KKM"
                                : "Di bawah KKM"
                              : "Belum ada nilai"}
                          </p>
                        </div>
                        {predikat ? (
                          <span className={`${getGradeStyle(predikat)} inline-flex min-w-[40px] justify-center rounded-md border px-3 py-1 text-sm font-bold`}>
                            {predikat}
                          </span>
                        ) : (
                          <span className="theme-text-muted text-sm">Belum ada</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Daftar Semua Nilai Mapel Siswa dari Endpoint Raport */}
                  <div className="theme-card border theme-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-base font-semibold theme-text">Daftar Nilai Semua Mata Pelajaran</h2>
                        <p className="text-xs theme-text-muted">Klik baris mata pelajaran untuk melihat ringkasan di atas.</p>
                      </div>
                      <span className="text-xs font-semibold theme-text-secondary">
                        {listAkademik.length} Mapel
                      </span>
                    </div>

                    {listAkademik.length === 0 ? (
                      <p className="text-xs theme-text-muted py-6 text-center">
                        Belum ada nilai mata pelajaran yang tercatat untuk siswa ini pada tahun ajaran terpilih.
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border theme-border">
                        <table className="w-full text-left text-sm">
                          <thead className="theme-card-soft border-b theme-border text-xs uppercase theme-text-muted">
                            <tr>
                              <th className="px-4 py-3">Mata Pelajaran</th>
                              <th className="px-4 py-3 text-center">KKM</th>
                              <th className="px-4 py-3 text-center">Nilai Akhir</th>
                              <th className="px-4 py-3 text-center">Predikat</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y theme-border">
                            {listAkademik.map((item) => {
                              const isSelected =
                                String(item.mapel || "").toLowerCase() ===
                                String(displayNamaMapel || "").toLowerCase();
                              const itemPredikat = item.predikat || getGrade(item.totalNilai);
                              return (
                                <tr
                                  key={item.mapel}
                                  onClick={() => setSelectedMapelName(item.mapel)}
                                  className={`cursor-pointer transition ${
                                    isSelected
                                      ? "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]"
                                      : "theme-table-hover"
                                  }`}
                                >
                                  <td className="px-4 py-3 font-medium theme-text">{item.mapel}</td>
                                  <td className="px-4 py-3 text-center theme-text-secondary">{item.kkm ?? 75}</td>
                                  <td className="px-4 py-3 text-center font-bold theme-text">{item.totalNilai ?? "-"}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`${getGradeStyle(itemPredikat)} inline-flex min-w-[32px] justify-center rounded border px-2 py-0.5 text-xs font-bold`}>
                                      {itemPredikat}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kolom Kanan: Kehadiran & Catatan */}
                <aside className="space-y-5">
                  {kehadiran && (
                    <section className="theme-card border theme-border rounded-xl p-5 shadow-sm">
                      <h3 className="text-sm font-bold theme-text flex items-center gap-2 mb-3">
                        <CalendarDays size={16} className="text-[var(--color-primary)]" />
                        Rekap Kehadiran Siswa
                      </h3>
                      <div className="grid grid-cols-2 gap-2.5 text-center">
                        <div className="theme-card-soft border theme-border rounded-lg p-3">
                          <p className="text-[11px] theme-text-muted">Hadir</p>
                          <p className="text-lg font-bold theme-text">{kehadiran.hadir ?? 0}</p>
                        </div>
                        <div className="theme-card-soft border theme-border rounded-lg p-3">
                          <p className="text-[11px] theme-text-muted">Izin</p>
                          <p className="text-lg font-bold theme-text">{kehadiran.izin ?? 0}</p>
                        </div>
                        <div className="theme-card-soft border theme-border rounded-lg p-3">
                          <p className="text-[11px] theme-text-muted">Sakit</p>
                          <p className="text-lg font-bold theme-text">{kehadiran.sakit ?? 0}</p>
                        </div>
                        <div className="theme-card-soft border theme-border rounded-lg p-3">
                          <p className="text-[11px] theme-text-muted">Alpha</p>
                          <p className="text-lg font-bold theme-text">{kehadiran.alpha ?? 0}</p>
                        </div>
                      </div>
                    </section>
                  )}

                  <section className="theme-card border theme-border rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold theme-text flex items-center gap-2 mb-2">
                      <FileText size={16} className="text-[var(--color-primary)]" />
                      Catatan Wali Kelas
                    </h3>
                    <p className="text-xs leading-relaxed theme-text-secondary">
                      {dataSiswa.catatanWaliKelas || "Belum ada catatan wali kelas."}
                    </p>
                  </section>

                  <section className="rounded-xl border border-[color-mix(in_srgb,var(--color-info)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[var(--color-info)]" />
                      <div>
                        <h3 className="text-xs font-bold text-[var(--color-info)]">Sumber Data Raport</h3>
                        <p className="mt-1 text-[11px] leading-relaxed theme-text-secondary">
                          Nilai akhir dan predikat dihitung langsung oleh server melalui agregasi bobot komponen nilai dan KKM resmi sekolah.
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