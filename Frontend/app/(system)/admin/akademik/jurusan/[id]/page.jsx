"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import CanAccess from "@/app/components/auth/CanAccess";
import { getJurusanById } from "@/services/jurusan.service";
import {
  GraduationCap,
  FlaskConical,
  Landmark,
  Languages,
  Code2,
  Palette,
  Calculator,
  Wrench,
  UtensilsCrossed,
  CircleCheck,
  CircleSlash,
  ArrowLeft,
  Pencil,
  Loader2,
  AlertCircle,
  Hash,
  FileText,
  Layers3,
  Users,
  BookOpen,
  CalendarDays,
  Sparkles,
} from "lucide-react";

const ICONS = {
  FlaskConical,
  Landmark,
  Languages,
  Code2,
  Palette,
  Calculator,
  Wrench,
  UtensilsCrossed,
};

export default function DetailJurusanPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getJurusanById(id);
        const found = res?.data && !Array.isArray(res.data) ? res.data : res;
        if (!found) {
          setError("Jurusan tidak ditemukan.");
        } else {
          setItem(found);
        }
      } catch (err) {
        setError(err?.message || "Gagal memuat data jurusan.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const active = (item?.status || "").toLowerCase() === "aktif";
  const Icon = ICONS[item?.icon] || GraduationCap;

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            {/* Header Navigasi */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/admin/akademik/jurusan")}
                  className="theme-card theme-border theme-text-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition hover:shadow-md hover:theme-text"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h1 className="theme-text text-xl font-bold tracking-tight sm:text-2xl">
                    Detail Jurusan
                  </h1>
                  <p className="theme-text-muted text-sm">
                    Informasi lengkap program keahlian
                  </p>
                </div>
              </div>
            </div>

            {loading && (
              <div className="theme-card theme-border flex min-h-[400px] items-center justify-center rounded-2xl border">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin theme-primary-text" size={32} />
                  <p className="theme-text-muted text-sm font-medium">
                    Memuat data jurusan...
                  </p>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Terjadi Kesalahan</p>
                  <p className="mt-1 opacity-90">{error}</p>
                </div>
              </div>
            )}

            {item && !loading && (
              <div className="space-y-6">
                {/* HERO CARD */}
                <div className="theme-border theme-card relative overflow-hidden rounded-3xl border p-6 shadow-sm sm:p-8">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)] blur-3xl" />

                  <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-5 sm:items-center">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] shadow-sm sm:h-20 sm:w-20">
                        <Icon size={40} strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="theme-text text-xl font-bold tracking-tight sm:text-2xl">
                            {item.nama}
                          </h2>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                              active
                                ? "border-[color-mix(in_srgb,var(--color-success)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]"
                                : "theme-text-muted theme-border theme-card-soft"
                            }`}
                          >
                            {active ? (
                              <CircleCheck size={14} strokeWidth={2.5} />
                            ) : (
                              <CircleSlash size={14} strokeWidth={2.5} />
                            )}
                            {active ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <p className="inline-flex items-center gap-1.5 rounded-lg border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-3 py-1 font-mono text-sm font-bold theme-primary-text">
                            <Hash size={14} />
                            {item.kode}
                          </p>
                          <p className="theme-card theme-border theme-text-secondary inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-sm font-medium">
                            <Layers3 size={14} />
                            {item._count?.kelas ?? item.kelas ?? 0} Kelas
                          </p>
                        </div>
                      </div>
                    </div>

                    <CanAccess menu="jurusan" action="update">
                      <button
                        onClick={() =>
                          router.push(`/admin/akademik/jurusan/${item.id}/edit`)
                        }
                        className="theme-primary flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-md transition hover:opacity-90 md:w-auto"
                      >
                        <Pencil size={16} />
                        Edit Jurusan
                      </button>
                    </CanAccess>
                  </div>
                </div>

                {/* STAT GRID */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
                  <div className="theme-card theme-border flex items-center gap-4 rounded-2xl border p-5 shadow-sm">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                      <Hash size={22} />
                    </div>
                    <div>
                      <p className="theme-text-muted text-xs font-semibold uppercase tracking-wider">
                        Kode Jurusan
                      </p>
                      <p className="theme-text mt-1 font-mono text-lg font-semibold">
                        {item.kode}
                      </p>
                    </div>
                  </div>

                  <div className="theme-card theme-border flex items-center gap-4 rounded-2xl border p-5 shadow-sm">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                      <Layers3 size={22} />
                    </div>
                    <div>
                      <p className="theme-text-muted text-xs font-semibold uppercase tracking-wider">
                        Jumlah Kelas
                      </p>
                      <p className="theme-text mt-1 text-lg font-semibold">
                        {item._count?.kelas ?? item.kelas ?? 0} Kelas
                      </p>
                    </div>
                  </div>

                  <div className="theme-card theme-border flex items-center gap-4 rounded-2xl border p-5 shadow-sm">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                      <Users size={22} />
                    </div>
                    <div>
                      <p className="theme-text-muted text-xs font-semibold uppercase tracking-wider">
                        Total Siswa
                      </p>
                      <p className="theme-text mt-1 text-lg font-semibold">
                        {item._count?.siswa ?? item.siswa ?? 0} Siswa
                      </p>
                    </div>
                  </div>

                  <div className="theme-card theme-border flex items-center gap-4 rounded-2xl border p-5 shadow-sm">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                      <BookOpen size={22} />
                    </div>
                    <div>
                      <p className="theme-text-muted text-xs font-semibold uppercase tracking-wider">
                        Mata Pelajaran
                      </p>
                      <p className="theme-text mt-1 text-lg font-semibold">
                        {item._count?.mapel ?? item.mapel ?? 0} Mapel
                      </p>
                    </div>
                  </div>
                </div>

                {/* DESKRIPSI */}
                <div className="theme-card theme-border rounded-2xl border p-6 shadow-sm sm:p-8">
                  <div className="flex items-center gap-3 border-b border-[var(--color-border-soft)] pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="theme-text text-base font-semibold">
                        Deskripsi Jurusan
                      </h3>
                      <p className="theme-text-muted text-xs">
                        Penjelasan singkat mengenai program keahlian ini.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5">
                    <p className="theme-text-secondary text-sm leading-7 sm:text-base">
                      {item.deskripsi ||
                        "Belum ada deskripsi yang ditambahkan untuk jurusan ini. Silakan edit jurusan untuk menambahkan informasi."}
                    </p>
                  </div>
                </div>

                {/* INFO TAMBAHAN */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                  <div className="theme-card theme-border rounded-2xl border p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} className="theme-primary-text" />
                      <p className="theme-text-muted text-xs font-semibold uppercase tracking-wider">
                        Dibuat Pada
                      </p>
                    </div>
                    <p className="theme-text mt-2 text-sm font-semibold">
                      {item.dibuatPada
                        ? new Date(item.dibuatPada).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </p>
                  </div>

                  <div className="theme-card theme-border rounded-2xl border p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="theme-primary-text" />
                      <p className="theme-text-muted text-xs font-semibold uppercase tracking-wider">
                        Terakhir Diperbarui
                      </p>
                    </div>
                    <p className="theme-text mt-2 text-sm font-semibold">
                      {item.diperbaruiPada
                        ? new Date(item.diperbaruiPada).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}