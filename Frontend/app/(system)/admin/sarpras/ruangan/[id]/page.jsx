
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
  FileText,
  RefreshCw,
  Clock,
  Hash,
  GraduationCap,
  Layers,
} from "lucide-react";

function extractData(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function DetailItem({ icon: Icon, label, value, color = "primary" }) {
  const primaryColorClass =
    "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text";

  const colorClasses = {
    primary: primaryColorClass,
    info: primaryColorClass,
    success: primaryColorClass,
    warning: primaryColorClass,
  };

  return (
    <div className="flex min-w-0 items-start gap-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          colorClasses[color] || colorClasses.primary
        }`}
      >
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="theme-text-muted text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </p>

        <p className="theme-text mt-1 break-words font-semibold">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

export default function DetailRuanganPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [ruangan, setRuangan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getRuangan();
      const data = extractData(response);

      const selectedRuangan = data.find(
        (item) => String(item.id) === String(id)
      );

      if (!selectedRuangan) {
        throw new Error("Data ruangan tidak ditemukan.");
      }

      setRuangan(selectedRuangan);
    } catch (error) {
      console.error("Gagal mengambil detail ruangan:", error);
      setErrorMessage(
        error?.message || "Gagal memuat informasi ruangan."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBack = () => {
    router.push("/admin/sarpras/ruangan");
  };

  const handleEdit = () => {
    router.push(`/admin/sarpras/ruangan/${id}/edit`);
  };

  if (loading) {
    return (
      <div className="theme-page flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="animate-spin text-[var(--color-primary)]"
            size={32}
          />
          <p className="theme-text-muted text-sm">
            Memuat data ruangan...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage || !ruangan) {
    return (
      <div className="theme-page flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <AlertCircle size={32} />
        </div>

        <div className="text-center">
          <h2 className="theme-text font-bold">
            Data Ruangan Tidak Ditemukan
          </h2>
          <p className="theme-text-muted mt-2 text-sm">
            {errorMessage || "Informasi ruangan tidak tersedia."}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-xl border theme-border px-4 py-2.5 text-sm theme-text"
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>

          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const kapasitas =
    ruangan.kapasitas !== null &&
    ruangan.kapasitas !== undefined
      ? `${ruangan.kapasitas} Orang`
      : "Tidak ditentukan";

  // Nama sekolah harus berasal dari relasi atau data profil sekolah.
  const namaSekolah =
    ruangan.sekolah?.namaSekolah ||
    ruangan.sekolah?.nama ||
    ruangan.namaSekolah ||
    "Sekolah";

  const namaRuangan = ruangan.nama || "Tanpa Nama";

  const namaGedung =
    ruangan.gedung?.nama ||
    ruangan.gedung?.namaGedung ||
    null;

  const namaLantai =
    ruangan.lantai?.nama ||
    ruangan.lantai?.namaLantai ||
    null;

  const jumlahKelas = ruangan._count?.kelas ?? 0;

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
            <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8 2xl:px-12">

              {/* HEADER */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 text-sm font-medium theme-text-muted hover:text-[var(--color-primary)]"
                  >
                    <ArrowLeft size={17} />
                    Kembali ke Daftar Ruangan
                  </button>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                      <DoorOpen size={25} />
                    </div>

                    <div>
                      <h1 className="theme-text text-2xl font-bold">
                        Detail Ruangan
                      </h1>
                      <p className="theme-text-muted mt-1 text-sm">
                        Informasi fasilitas dan identitas ruangan sekolah.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleEdit}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-95"
                >
                  <Pencil size={16} />
                  Edit Ruangan
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">

                {/* INFORMASI UTAMA */}
                <div className="min-w-0 space-y-6">
                  <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                    <div className="relative overflow-hidden border-b theme-border bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] p-6 sm:p-8">
                      <div className="pointer-events-none absolute -right-10 -top-10 text-[var(--color-primary)] opacity-[0.06]">
                        <DoorOpen size={200} strokeWidth={1} />
                      </div>

                      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-lg">
                          <DoorOpen size={36} />
                        </div>

                        <div className="min-w-0">
                          <h2 className="theme-text break-words text-3xl font-bold tracking-tight">
                            {namaRuangan}
                          </h2>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                              <MapPin size={14} />
                              {ruangan.lokasi || "Lokasi belum diatur"}
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]">
                              <Users size={14} />
                              {jumlahKelas} Kelas
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* KETERANGAN */}
                    <div className="p-6 sm:p-8">
                      <h3 className="theme-text mb-4 flex items-center gap-2 font-bold">
                        <FileText
                          size={18}
                          className="text-[var(--color-primary)]"
                        />
                        Keterangan Ruangan
                      </h3>

                      <div className="min-h-[100px] whitespace-pre-wrap break-words rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] p-5 text-sm leading-relaxed theme-text-secondary">
                        {ruangan.keterangan ||
                          "Tidak ada keterangan tambahan untuk ruangan ini."}
                      </div>
                    </div>
                  </section>

                  {/* IDENTITAS DATA */}
                  <section className="theme-card rounded-2xl border theme-border p-6 shadow-sm">
                    <h3 className="theme-text mb-5 flex items-center gap-2 font-bold">
                      <Info
                        size={18}
                        className="text-[var(--color-primary)]"
                      />
                      Identitas Data
                    </h3>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <DetailItem
                        icon={DoorOpen}
                        label="Nama Ruangan"
                        value={namaRuangan}
                      />

                      <DetailItem
                        icon={Building2}
                        label="Nama Sekolah"
                        value={namaSekolah}
                        color="info"
                      />
                    </div>
                  </section>
                </div>

                {/* SIDEBAR INFORMASI */}
                <aside className="flex min-w-0 flex-col gap-6">
                  <section className="theme-card rounded-2xl border theme-border p-6 shadow-sm">
                    <h3 className="theme-text mb-5 border-b theme-border pb-3 font-bold">
                      Spesifikasi Ruangan
                    </h3>

                    <div className="space-y-5">
                      <DetailItem
                        icon={Users}
                        label="Kapasitas Maksimal"
                        value={kapasitas}
                      />

                      <div className="border-b theme-border" />

<DetailItem
                        icon={MapPin}
                        label="Lokasi"
                        value={ruangan.lokasi || "Belum ditentukan"}
                        color="info"
                      />

                      {namaGedung && (
                        <>
                          <div className="border-b theme-border" />
                          <DetailItem
                            icon={Building2}
                            label="Gedung"
                            value={namaGedung}
                            color="success"
                          />
                        </>
                      )}

{namaLantai && (
                        <>
                          <div className="border-b theme-border" />
                          <DetailItem
                            icon={Layers}
                            label="Lantai"
                            value={namaLantai}
                            color="warning"
                          />
                        </>
                      )}

                      <div className="border-b theme-border" />

                      <DetailItem
                        icon={GraduationCap}
                        label="Kelas yang Menggunakan"
                        value={`${jumlahKelas} Kelas`}
                        color="success"
                      />
                    </div>
                  </section>

{/* RIWAYAT DATA */}
                  <section className="theme-card rounded-2xl border theme-border p-6 shadow-sm">
                    <h3 className="theme-text mb-5 border-b theme-border pb-3 font-bold">
                      Riwayat Data
                    </h3>

                    <div className="space-y-5">
                      <DetailItem
                        icon={CalendarDays}
                        label="Dibuat Pada"
                        value={formatDateTime(ruangan.dibuatPada)}
                        color="success"
                      />

                      <div className="border-b theme-border" />

                      <DetailItem
                        icon={Clock}
                        label="Diperbarui Pada"
                        value={formatDateTime(ruangan.diperbaruiPada)}
                        color="warning"
                      />
                    </div>
                  </section>

                  {/* INFORMASI */}
                  <section className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex items-start gap-3 rounded-2xl border p-5">
                    <Info size={18} className="mt-0.5 shrink-0" />

                    <div>
<p className="text-sm font-semibold theme-primary-text">
                        Informasi Ruangan
                      </p>

                      <p className="mt-1 text-xs leading-relaxed opacity-90">
                        Data ruangan diambil dari database sekolah.
                        Untuk mengubah nama, lokasi, kapasitas, atau
                        keterangan, gunakan tombol Edit Ruangan.
                      </p>
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
