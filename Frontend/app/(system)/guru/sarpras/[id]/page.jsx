
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Edit,
  FileText,
  MapPin,
  Package,
  RefreshCw,
  Tag,
  User,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Wrench,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getLaporanKerusakanById } from "@/services/sarpras.service";

function extractObject(response) {
  let result = response;

  while (
    result?.data &&
    !Array.isArray(result.data) &&
    typeof result.data === "object"
  ) {
    result = result.data;
  }

  return result;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getText(...values) {
  const value = values.find(
    (item) =>
      item !== null &&
      item !== undefined &&
      String(item).trim() !== ""
  );

  return value ? String(value).trim() : "-";
}

function getLokasiAset(aset) {
  if (!aset) return "-";

  const ruangan = aset.ruangan;
  const gudang = aset.gudang;

  const lokasi = [
    aset.lokasi,
    ruangan?.nama,
    ruangan?.lokasi,
    ruangan?.gedung?.nama,
    ruangan?.lantai?.nama,
    gudang?.lokasi,
    gudang?.nama,
  ]
    .filter(
      (item) =>
        item !== null &&
        item !== undefined &&
        String(item).trim() !== ""
    )
    .map((item) => String(item).trim());

  const hasil = [...new Set(lokasi)];

  return hasil.length > 0 ? hasil.join(" • ") : "-";
}

const statusConfig = {
  menunggu: {
    label: "Menunggu",
    className:
      "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20",
  },
  diproses: {
    label: "Diproses",
    className:
      "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]",
  },
  selesai: {
    label: "Selesai",
    className:
      "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20",
  },
  ditolak: {
    label: "Ditolak",
    className:
      "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20",
  },
};

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-background)] text-[var(--color-text-secondary)]">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-[var(--color-text-secondary)]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-[var(--color-text)]">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

export default function DetailLaporanKerusakanPage() {
  const params = useParams();
  const id = params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDetail = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getLaporanKerusakanById(id);
      const result = extractObject(response);

      if (!result?.id) {
        throw new Error("Data laporan kerusakan tidak ditemukan.");
      }

      setLaporan(result);
    } catch (err) {
      setError(
        err?.message || "Gagal mengambil detail laporan kerusakan."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const statusKey = String(laporan?.status || "").toLowerCase();

  const status = statusConfig[statusKey] || {
    label: laporan?.status || "Tidak diketahui",
    className:
      "bg-[var(--color-background)] text-[var(--color-text-secondary)] border-[var(--color-border)]",
  };

  const aset = laporan?.aset;

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="w-full space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/guru/sarpras"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
                >
                  <ArrowLeft size={17} />
                  Kembali ke Sarana Prasarana
                </Link>

                {!loading && !error && laporan && (
                  <Link
                    href={`/guru/sarpras/${id}/edit`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                  >
                    <Edit size={17} />
                    Edit Laporan
                  </Link>
                )}
              </div>

              {loading ? (
                <div className="flex min-h-72 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
                  <div className="text-center">
                    <Loader2
                      size={30}
                      className="mx-auto animate-spin theme-primary-text"
                    />

                    <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                      Memuat detail laporan...
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-card)] p-6 text-center">
                  <AlertCircle
                    size={32}
                    className="mx-auto text-[var(--color-danger)]"
                  />

                  <p className="mt-3 text-sm text-[var(--color-danger)]">
                    {error}
                  </p>

                  <button
                    onClick={loadDetail}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <RefreshCw size={16} />
                    Coba Lagi
                  </button>
                </div>
              ) : (
                <div className="w-full space-y-6">
                  <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                        <FileText size={22} />
                      </div>

                      <div>
                        <h1 className="text-xl font-bold text-[var(--color-text)]">
                          Detail Laporan Kerusakan
                        </h1>

                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                          Informasi laporan kerusakan sarana dan prasarana.
                        </p>
                      </div>
                    </div>

                    <span
                      className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 2xl:grid-cols-4">
                    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm sm:p-6 xl:col-span-2 2xl:col-span-2">
                      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="font-bold text-[var(--color-text)]">
                          Informasi Laporan
                        </h2>

                        <span
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <InfoItem
                          icon={CalendarDays}
                          label="Tanggal Laporan"
                          value={formatDate(laporan.tanggalLaporan)}
                        />

                        <InfoItem
                          icon={User}
                          label="Dilaporkan Oleh"
                          value={laporan.dilaporkanOleh}
                        />
                      </div>

                      <div className="mt-6 border-t border-[var(--color-border)] pt-5">
                        <p className="mb-2 text-xs text-[var(--color-text-secondary)]">
                          Deskripsi Kerusakan
                        </p>

                        <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--color-text)]">
                          {laporan.deskripsi || "-"}
                        </p>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm sm:p-6 xl:col-span-1 2xl:col-span-2">
                      <div className="mb-4 flex items-center gap-2">
                        <Wrench
                          size={19}
                          className="text-[var(--color-primary)]"
                        />

                        <h2 className="font-bold text-[var(--color-text)]">
                          Catatan Perbaikan
                        </h2>
                      </div>

                      <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--color-text-secondary)]">
                        {laporan.catatanPerbaikan ||
                          "Belum ada catatan perbaikan."}
                      </p>
                    </section>

                    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm sm:p-6 xl:col-span-2 2xl:col-span-2">
                      <div className="mb-5 flex items-center gap-2">
                        <Package
                          size={19}
                          className="text-[var(--color-primary)]"
                        />

                        <h2 className="font-bold text-[var(--color-text)]">
                          Informasi Aset
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                        <InfoItem
                          icon={Package}
                          label="Nama Aset"
                          value={getText(aset?.nama)}
                        />

                        <InfoItem
                          icon={Tag}
                          label="Kode Aset"
                          value={getText(aset?.kode)}
                        />

                        <InfoItem
                          icon={MapPin}
                          label="Lokasi"
                          value={getLokasiAset(aset)}
                        />

                        <InfoItem
                          icon={Package}
                          label="Gudang"
                          value={getText(aset?.gudang?.nama)}
                        />

                        <InfoItem
                          icon={Tag}
                          label="Kategori"
                          value={getText(aset?.kategoriAset?.nama)}
                        />

                        <InfoItem
                          icon={CheckCircle2}
                          label="Kondisi Aset"
                          value={getText(aset?.kondisi)}
                        />
                      </div>
                    </section>

                    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm sm:p-6 xl:col-span-1 2xl:col-span-2">
                      <h2 className="mb-4 font-bold text-[var(--color-text)]">
                        Informasi Waktu
                      </h2>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InfoItem
                          icon={Clock}
                          label="Dibuat Pada"
                          value={formatDate(laporan.dibuatPada)}
                        />

                        <InfoItem
                          icon={Clock}
                          label="Diperbarui Pada"
                          value={formatDate(laporan.diperbaruiPada)}
                        />
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
