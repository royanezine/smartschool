"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { getPrestasiById } from "@/services/prestasi.service";

import {
  ArrowLeft,
  Trophy,
  Loader2,
  AlertCircle,
  UserRound,
  GraduationCap,
  CalendarDays,
  Building2,
  FileText,
  ExternalLink,
  Pencil,
  Award,
  X,
  CheckCircle2,
  Info,
} from "lucide-react";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";
const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";
const themeCardShadow =
  "shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";
const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";
const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";
const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";
const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";
const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";
const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const getResponseData = (response) => {
  let result = response;
  for (let i = 0; i < 4; i++) {
    if (
      result &&
      typeof result === "object" &&
      !Array.isArray(result) &&
      Object.prototype.hasOwnProperty.call(result, "data")
    ) {
      result = result.data;
    } else break;
  }
  return result;
};

export default function DetailPrestasiPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [prestasi, setPrestasi] = useState(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getPrestasiById(id);
        const data = getResponseData(res);
        if (active) setPrestasi(data && data.id ? data : null);
      } catch (err) {
        if (active) setError(err?.message || "Gagal memuat detail prestasi.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const namaSiswa =
    prestasi?.siswa?.namaLengkap || prestasi?.namaSiswa || "-";
  const nisn = prestasi?.siswa?.nisn || "-";
  const nipd = prestasi?.siswa?.nipd || "-";
  const namaKelas =
    prestasi?.kelasRel?.nama || prestasi?.kelas || "-";
  const tingkatKelas = prestasi?.kelasRel?.tingkat || "-";

  return (
    <div className="theme-page h-screen w-full overflow-hidden">
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar
          active="akademikPrestasi"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="admin"
        />
      </div>

      <div
        className={`flex h-screen min-w-0 flex-col overflow-hidden transition-[margin] duration-300 ${
          isCollapsed ? "lg:ml-[88px]" : "lg:ml-[260px]"
        }`}
      >
        <div className="shrink-0">
          <Header
            toggleSidebar={() => setIsCollapsed(!isCollapsed)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 pb-12 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-7 xl:px-10 2xl:px-12">
            <div className="mb-6">
              <Link
                href="/admin/akademik/prestasi"
                className="theme-text-secondary group mb-5 inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] hover:text-[var(--color-primary)]"
              >
                <ArrowLeft
                  size={17}
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />
                Kembali ke Prestasi
              </Link>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                    Detail Prestasi
                  </h1>
                  <p className="theme-text-secondary mt-1.5 max-w-2xl text-sm leading-6">
                    Informasi lengkap prestasi siswa.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/akademik/prestasi/${id}/edit`}
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-[var(--color-card)] transition-all ${themePrimaryGradient} shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)] hover:brightness-[1.04] active:scale-[0.98]`}
                  >
                    <Pencil size={16} /> Edit Prestasi
                  </Link>
                </div>
              </div>
            </div>

            {error && (
              <div
                className={`mb-5 flex items-start gap-3 rounded-2xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themeNeutralSurface} theme-danger ${themeSmallShadow}`}
                >
                  <AlertCircle size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="theme-text text-sm font-bold">Gagal memuat</p>
                  <p className="theme-text-secondary mt-1 text-sm leading-5">
                    {error}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="theme-text-muted rounded-lg p-1.5 transition hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] hover:text-[var(--color-text)]"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {loading ? (
              <div
                className={`theme-card ${themeDivider} ${themeCardShadow} rounded-3xl border p-12 text-center`}
              >
                <Loader2
                  size={32}
                  className="theme-text-muted mx-auto animate-spin"
                />
                <p className="theme-text-muted mt-3 text-sm">
                  Memuat detail prestasi...
                </p>
              </div>
            ) : !prestasi ? (
              <div
                className={`theme-card ${themeDivider} ${themeCardShadow} rounded-3xl border p-12 text-center`}
              >
                <Award size={40} className="theme-text-muted mx-auto" />
                <p className="theme-text mt-3 text-sm font-semibold">
                  Data prestasi tidak ditemukan
                </p>
                <p className="theme-text-muted mt-1 text-xs">
                  Data mungkin sudah dihapus atau tidak tersedia.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_440px]">
                <div className="min-w-0 space-y-6">
                  <div
                    className={`relative overflow-hidden rounded-3xl p-6 ${themePrimaryGradient} text-[var(--color-card)] sm:p-8`}
                  >
                    <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[color-mix(in_srgb,var(--color-card)_14%,transparent)] blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[color-mix(in_srgb,var(--color-info)_20%,transparent)] blur-3xl" />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-card)_14%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--color-card)_18%,transparent)]">
                          <Trophy size={26} />
                        </div>
                        <span className="rounded-full bg-[color-mix(in_srgb,var(--color-card)_14%,transparent)] px-3 py-1.5 text-[10px] font-bold tracking-wide ring-1 ring-[color-mix(in_srgb,var(--color-card)_18%,transparent)]">
                          {prestasi.juara || "-"}
                        </span>
                      </div>

                      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--color-card)_78%,var(--color-primary))]">
                        Prestasi
                      </p>
                      <h2 className="mt-2 text-2xl font-bold leading-tight">
                        {prestasi.namaLomba || "-"}
                      </h2>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]">
                        <span className="flex items-center gap-1.5">
                          <Award size={13} /> {prestasi.tingkat || "-"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={13} /> {prestasi.bulan || "-"}{" "}
                          {prestasi.tahun || ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`theme-card ${themeDivider} ${themeCardShadow} overflow-hidden rounded-3xl border`}
                  >
                    <div className={`border-b ${themeDivider} px-5 py-4 sm:px-6`}>
                      <h3 className="theme-text text-sm font-bold">
                        Informasi Siswa
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                      <div
                        className={`rounded-2xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
                      >
                        <div className="theme-text-muted mb-2 flex items-center gap-2">
                          <UserRound size={15} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            Nama Siswa
                          </span>
                        </div>
                        <p className="theme-text text-sm font-bold">{namaSiswa}</p>
                        <p className="theme-text-muted mt-1 text-xs">
                          NISN: {nisn}
                        </p>
                        <p className="theme-text-muted text-xs">NIPD: {nipd}</p>
                      </div>

                      <div
                        className={`rounded-2xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
                      >
                        <div className="theme-text-muted mb-2 flex items-center gap-2">
                          <GraduationCap size={15} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            Kelas
                          </span>
                        </div>
                        <p className="theme-text text-sm font-bold">{namaKelas}</p>
                        <p className="theme-text-muted mt-1 text-xs">
                          Tingkat: {tingkatKelas}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`theme-card ${themeDivider} ${themeCardShadow} overflow-hidden rounded-3xl border`}
                  >
                    <div className={`border-b ${themeDivider} px-5 py-4 sm:px-6`}>
                      <h3 className="theme-text text-sm font-bold">
                        Detail Perlombaan
                      </h3>
                    </div>
                    <div className="space-y-5 p-5 sm:p-6">
                      <div>
                        <p className="theme-text-muted mb-1 text-[10px] font-bold uppercase tracking-wider">
                          Nama Lomba
                        </p>
                        <p className="theme-text text-sm font-semibold">
                          {prestasi.namaLomba || "-"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <div className="theme-text-muted mb-1 flex items-center gap-2">
                            <CalendarDays size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              Waktu Pelaksanaan
                            </span>
                          </div>
                          <p className="theme-text text-sm font-semibold">
                            {prestasi.bulan || "-"} {prestasi.tahun || ""}
                          </p>
                        </div>
                        <div>
                          <div className="theme-text-muted mb-1 flex items-center gap-2">
                            <Building2 size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              Penyelenggara
                            </span>
                          </div>
                          <p className="theme-text text-sm font-semibold">
                            {prestasi.penyelenggara || "-"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="theme-text-muted mb-1 flex items-center gap-2">
                          <FileText size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            Keterangan
                          </span>
                        </div>
                        <p className="theme-text-secondary whitespace-pre-wrap text-sm">
                          {prestasi.keterangan || "Tidak ada keterangan."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="min-w-0 space-y-6 xl:sticky xl:top-6">
                  <div
                    className={`theme-card ${themeDivider} ${themeCardShadow} overflow-hidden rounded-3xl border`}
                  >
                    <div className={`border-b ${themeDivider} px-5 py-4`}>
                      <h3 className="theme-text text-sm font-bold">Sertifikat</h3>
                    </div>
                    <div className="p-5">
                      {prestasi.sertifikatUrl ? (
                        <a
                          href={prestasi.sertifikatUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-between gap-3 rounded-2xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4 transition ${themeNeutralHover}`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} theme-primary`}
                            >
                              <FileText size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="theme-text text-sm font-semibold">
                                Lihat Sertifikat
                              </p>
                              <p className="theme-text-muted mt-0.5 truncate text-xs">
                                {prestasi.sertifikatUrl}
                              </p>
                            </div>
                          </div>
                          <ExternalLink
                            size={16}
                            className="theme-text-muted shrink-0"
                          />
                        </a>
                      ) : (
                        <div
                          className={`rounded-2xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4 text-center`}
                        >
                          <FileText
                            size={24}
                            className="theme-text-muted mx-auto"
                          />
                          <p className="theme-text-muted mt-2 text-xs">
                            Belum ada sertifikat.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={`rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Info size={15} className="theme-info mt-0.5 shrink-0" />
                      <p className="theme-text-secondary text-[11px] leading-5">
                        Data prestasi ini tercatat di sistem dan dapat diperbarui
                        melalui halaman edit.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`theme-card ${themeDivider} ${themeCardShadow} rounded-3xl border p-5`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="theme-success shrink-0" />
                      <p className="theme-text-secondary text-xs leading-4">
                        Data prestasi valid dan tersimpan.
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
            )}

            <div className={`mt-7 border-t ${themeDivider} pt-5 text-center`}>
              <p className="theme-text-muted text-xs">
                © 2026 SmartSchool • Modul Prestasi Siswa
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}