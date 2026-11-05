"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { getRuangan } from "@/services/sarpras.service";

import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  MapPin,
  Users,
  DoorOpen,
  Pencil,
  CalendarDays,
  Info,
  Building2,
  LayoutGrid,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

function extractData(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function DetailRuanganPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [ruangan, setRuangan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await getRuangan();
      const data = extractData(response).find(
        (item) => String(item.id) === String(id)
      );
      if (!data) throw new Error("Data ruangan tidak ditemukan.");
      setRuangan(data);
    } catch (error) {
      setErrorMessage(error?.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
          <p className="theme-text-muted text-sm font-medium">Memuat data ruangan...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !ruangan) {
    return (
      <div className="theme-page flex h-screen w-full items-center justify-center flex-col gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <AlertCircle size={32} />
        </div>
        <p className="theme-text font-semibold">{errorMessage || "Data tidak ditemukan"}</p>
        <button
          onClick={() => router.push("/admin/sarpras/ruangan")}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
        >
          <ArrowLeft size={16} />
          Kembali ke Daftar Ruangan
        </button>
      </div>
    );
  }

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={false}
        setCollapsed={() => {}}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={() => {}}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <div className="flex min-h-0 flex-1">
          <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
            <div className="w-full p-4 sm:p-6 lg:p-8 2xl:px-12 space-y-6">
              
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() => router.push("/admin/sarpras/ruangan")}
                    className="inline-flex w-fit items-center gap-2 text-sm font-medium theme-text-muted transition hover:text-[var(--color-primary)]"
                  >
                    <ArrowLeft size={17} />
                    Kembali ke Daftar Ruangan
                  </button>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                      <DoorOpen size={25} />
                    </div>
                    <div>
                      <h1 className="theme-text text-2xl font-bold">Detail Ruangan</h1>
                      <p className="theme-text-muted mt-1 text-sm">
                        Informasi lengkap mengenai ruangan dan fasilitasnya.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push(`/admin/sarpras/ruangan/${id}/edit`)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 shadow-sm"
                >
                  <Pencil size={16} />
                  Edit Ruangan
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="min-w-0 space-y-6">
                  <div className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                    <div className="bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] p-6 sm:p-8 border-b theme-border relative overflow-hidden">
                      <div className="absolute -right-10 -top-10 text-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] opacity-50">
                        <DoorOpen size={200} strokeWidth={1} />
                      </div>
                      
                      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20">
                          <DoorOpen size={36} />
                        </div>
                        <div>
                          <h2 className="theme-text text-3xl font-bold tracking-tight">{ruangan.nama}</h2>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                              <MapPin size={14} />
                              {ruangan.lokasi || "Lokasi belum diatur"}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-success)_15%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]">
                              <CheckCircle2 size={14} />
                              Aktif
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8">
                      <h3 className="theme-text font-bold mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-[var(--color-primary)]" />
                        Keterangan Ruangan
                      </h3>
                      <div className="rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] p-5 text-sm leading-relaxed theme-text-secondary whitespace-pre-wrap">
                        {ruangan.keterangan || "Tidak ada keterangan tambahan untuk ruangan ini."}
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="flex min-w-0 flex-col gap-6">
                  <div className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm p-6">
                    <h3 className="theme-text font-bold mb-5 border-b theme-border pb-3">
                      Spesifikasi Ruangan
                    </h3>
                    
                    <div className="space-y-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                          <Users size={20} />
                        </div>
                        <div>
                          <p className="theme-text-muted text-[11px] font-semibold uppercase tracking-wider">
                            Kapasitas Maksimal
                          </p>
                          <p className="theme-text mt-1 font-semibold text-lg">
                            {ruangan.kapasitas ? `${ruangan.kapasitas} Orang` : "Tidak dibatasi"}
                          </p>
                        </div>
                      </div>

                      <div className="theme-border border-b" />

                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] text-[var(--color-info)]">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <p className="theme-text-muted text-[11px] font-semibold uppercase tracking-wider">
                            Gedung / Lokasi
                          </p>
                          <p className="theme-text mt-1 font-semibold">
                            {ruangan.lokasi || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="theme-border border-b" />

                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)]">
                          <CalendarDays size={20} />
                        </div>
                        <div>
                          <p className="theme-text-muted text-[11px] font-semibold uppercase tracking-wider">
                            Terdaftar Pada
                          </p>
                          <p className="theme-text mt-1 font-semibold">
                            {formatDate(ruangan.dibuatPada || ruangan.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="theme-info flex items-start gap-3 rounded-2xl border p-5">
                    <Info size={18} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-info)]">
                        Informasi Aset
                      </p>
                      <p className="mt-1 text-xs leading-relaxed opacity-90">
                        Untuk melihat daftar inventaris atau aset yang berada di ruangan ini, silakan buka menu <b>Manajemen Aset</b> dan filter berdasarkan lokasi ruangan.
                      </p>
                      <button 
                        onClick={() => router.push("/admin/sarpras/aset")}
                        className="mt-3 text-xs font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
                      >
                        Buka Manajemen Aset &rarr;
                      </button>
                    </div>
                  </div>

                  <div className="theme-card rounded-2xl border theme-border p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck size={17} className="text-[var(--color-success)]" />
                      <h3 className="text-sm font-bold theme-text">Status Validasi</h3>
                    </div>
                    <p className="text-xs theme-text-secondary leading-relaxed">
                      Data ruangan ini telah tersinkronisasi dengan database sekolah. Segala perubahan akan langsung tercatat pada sistem.
                    </p>
                  </div>
                </aside>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}