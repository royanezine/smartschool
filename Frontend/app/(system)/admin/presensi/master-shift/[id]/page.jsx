
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  ArrowLeft,
  Pencil,
  Trash2,
  Clock3,
  Users,
  CalendarClock,
  Info,
  Sun,
  Moon,
  AlertCircle,
  Loader2,
  RefreshCw,
  CheckCircle2,
  BriefcaseBusiness,
} from "lucide-react";

import {
  getShiftKerjaById,
  deleteShiftKerja,
} from "@/services/shiftKerja.service";


function formatTime(value) {
  if (!value) return "--:--";

  const match = String(value).match(/(\d{2}):(\d{2})/);

  return match ? `${match[1]}:${match[2]}` : "--:--";
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number.toLocaleString("id-ID")
    : "—";
}

function normalizeStatus(value) {
  const status = String(value ?? "").toLowerCase();

  if (status === "aktif") return "Aktif";
  if (status === "nonaktif") return "Nonaktif";

  return "Tidak diketahui";
}

function getLateLimit(shift) {
  if (!shift?.jamMasuk || shift.jamMasuk === "--:--") {
    return "--:--";
  }

  const [hour, minute] = shift.jamMasuk
    .split(":")
    .map(Number);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return "--:--";
  }

  const tolerance = Number(shift.toleransiTerlambatMenit ?? 0);
  const totalMinutes = hour * 60 + minute + tolerance;

  const finalHour = Math.floor(totalMinutes / 60) % 24;
  const finalMinute = totalMinutes % 60;

  return `${String(finalHour).padStart(2, "0")}:${String(
    finalMinute
  ).padStart(2, "0")}`;
}


function normalizeShift(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  if (!data.id) {
    return null;
  }

  return {
    id: data.id,
    sekolahId: data.sekolahId ?? null,
    nama: data.nama ?? "Shift Tanpa Nama",
    kode: data.kode ?? null,
    jamMasuk: formatTime(data.jamMasuk),
    jamKeluar: formatTime(data.jamKeluar),
    toleransiTerlambatMenit: Number(
      data.toleransiTerlambatMenit ?? 0
    ),
    status: normalizeStatus(data.status),
    jumlahPegawai:
      data.jumlahPegawai != null
        ? Number(data.jumlahPegawai)
        : data._count?.pengguna != null
          ? Number(data._count.pengguna)
          : null,
    totalAbsensi:
      data.totalAbsensi != null
        ? Number(data.totalAbsensi)
        : data._count?.absensi != null
          ? Number(data._count.absensi)
          : null,
    dibuatPada: data.dibuatPada ?? null,
    diperbaruiPada: data.diperbaruiPada ?? null,
  };
}


export default function MasterShiftDetailPage() {
  const router = useRouter();
  const params = useParams();

  const shiftId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const listUrl = "/admin/presensi/master-shift";


  const loadShift = useCallback(async () => {
    if (!shiftId) {
      setShift(null);
      setErrorMessage("ID shift tidak ditemukan pada URL.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await getShiftKerjaById(shiftId);
      const mappedShift = normalizeShift(response);

      if (!mappedShift) {
        setShift(null);
        setErrorMessage(
          "Data shift tidak ditemukan atau respons backend tidak sesuai."
        );
        return;
      }

      setShift(mappedShift);
    } catch (error) {
      console.error("Gagal mengambil detail shift:", error);

      setShift(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal mengambil detail shift dari server."
      );
    } finally {
      setLoading(false);
    }
  }, [shiftId]);

  useEffect(() => {
    loadShift();
  }, [loadShift]);


  const handleDelete = async () => {
    if (!shift || deleting) return;

    const confirmed = window.confirm(
      `Hapus shift "${shift.nama}"? Backend akan menolak penghapusan jika shift masih digunakan oleh pengguna.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setErrorMessage("");

    try {
      await deleteShiftKerja(shift.id);

      window.alert("Permintaan penghapusan shift berhasil diproses.");
      router.push(listUrl);
    } catch (error) {
      console.error("Gagal menghapus shift:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal menghapus shift. Silakan coba lagi."
      );
    } finally {
      setDeleting(false);
    }
  };


  if (loading) {
    return (
      <PageShell>
        <main className="flex flex-1 items-center justify-center theme-page">
          <div className="text-center">
            <Loader2
              size={30}
              className="mx-auto animate-spin text-[var(--color-primary)]"
            />
            <p className="mt-3 text-sm font-semibold theme-text">
              Memuat detail shift...
            </p>
            <p className="mt-1 text-xs theme-text-muted">
              Mengambil data dari server.
            </p>
          </div>
        </main>
      </PageShell>
    );
  }


  if (!shift) {
    return (
      <PageShell>
        <main className="flex flex-1 items-center justify-center px-6 theme-page">
          <div className="w-full max-w-md rounded-xl border theme-border theme-card px-6 py-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border theme-border theme-card-soft theme-text-muted">
              <Clock3 size={24} />
            </div>

            <h1 className="mt-4 text-base font-bold theme-text">
              Shift Tidak Ditemukan
            </h1>

            <p className="mt-2 text-sm leading-6 theme-text-muted">
              {errorMessage || "Data shift tidak tersedia."}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={loadShift}
                className="inline-flex h-10 items-center gap-2 rounded-lg border theme-border theme-card px-4 text-sm font-semibold theme-text"
              >
                <RefreshCw size={14} />
                Coba Lagi
              </button>

              <button
                type="button"
                onClick={() => router.push(listUrl)}
                className="inline-flex h-10 items-center gap-2 rounded-lg theme-primary px-4 text-sm font-semibold"
              >
                <ArrowLeft size={15} />
                Kembali
              </button>
            </div>
          </div>
        </main>
      </PageShell>
    );
  }


  const isActive = shift.status === "Aktif";
  const lateLimit = getLateLimit(shift);


  return (
    <PageShell>
      <main className="min-h-0 flex-1 overflow-y-auto theme-page">
        <div className="w-full px-5 py-6 md:px-8 md:py-8 xl:px-10">
          <button
            type="button"
            onClick={() => router.push(listUrl)}
            className="mb-5 inline-flex items-center gap-2 text-xs font-semibold theme-text-secondary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border theme-border theme-card">
              <ArrowLeft size={14} />
            </span>
            Kembali ke Master Shift
          </button>

          {errorMessage && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p className="min-w-0 flex-1">{errorMessage}</p>
              <button
                type="button"
                onClick={() => setErrorMessage("")}
                className="text-xs font-semibold underline"
              >
                Tutup
              </button>
            </div>
          )}


          <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                  isActive
                    ? "theme-info"
                    : "border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                }`}
              >
                <Clock3 size={22} />
              </div>

              <div className="min-w-0">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] theme-text-muted">
                  Master Shift
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="break-words text-2xl font-bold tracking-tight theme-text sm:text-[28px]">
                    {shift.nama}
                  </h1>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    {shift.status}
                  </span>
                </div>

                <p className="mt-2 font-mono text-xs font-semibold theme-text-muted">
                  Kode: {shift.kode || "—"}
                </p>

                <p className="mt-3 max-w-3xl text-sm leading-6 theme-text-secondary">
                  Informasi shift kerja berdasarkan data yang dikirim backend.
                </p>
              </div>
            </div>

            <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => router.push(`${listUrl}/${shift.id}/edit`)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border theme-border theme-card px-4 text-sm font-semibold theme-text-secondary"
              >
                <Pencil size={15} />
                Edit
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-10 items-center gap-2 rounded-lg theme-danger px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Trash2 size={15} />
                )}
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>


          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 xl:gap-4">
            <StatCard
              icon={<Sun size={15} />}
              label="Jam Masuk"
              value={shift.jamMasuk}
            />

            <StatCard
              icon={<Moon size={15} />}
              label="Jam Pulang"
              value={shift.jamKeluar}
            />

            <StatCard
              icon={<Clock3 size={15} />}
              label="Toleransi"
              value={`${shift.toleransiTerlambatMenit} menit`}
            />

            <StatCard
              icon={<AlertCircle size={15} />}
              label="Batas Toleransi"
              value={lateLimit}
              highlight
            />

            <StatCard
              icon={<CalendarClock size={15} />}
              label="Total Absensi"
              value={formatNumber(shift.totalAbsensi)}
            />
          </div>


          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:gap-6">
            <div className="space-y-5">

              <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                <SectionHeader
                  icon={<Clock3 size={15} />}
                  title="Informasi Shift"
                  description="Detail shift yang tersimpan pada backend."
                />

                <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                  <InfoField label="Nama Shift" value={shift.nama} />
                  <InfoField label="Kode Shift" value={shift.kode || "—"} />
                  <InfoField label="Jam Masuk" value={shift.jamMasuk} />
                  <InfoField label="Jam Pulang" value={shift.jamKeluar} />
                  <InfoField
                    label="Toleransi Terlambat"
                    value={`${shift.toleransiTerlambatMenit} menit`}
                  />
                  <InfoField label="Status" value={shift.status} />
                  <InfoField
                    label="Jumlah Pengguna"
                    value={formatNumber(shift.jumlahPegawai)}
                  />
                  <InfoField
                    label="Total Absensi"
                    value={formatNumber(shift.totalAbsensi)}
                  />
                  {shift.dibuatPada && (
                    <InfoField
                      label="Dibuat Pada"
                      value={formatDate(shift.dibuatPada)}
                    />
                  )}
                  {shift.diperbaruiPada && (
                    <InfoField
                      label="Diperbarui Pada"
                      value={formatDate(shift.diperbaruiPada)}
                    />
                  )}
                </div>
              </section>


              <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                <SectionHeader
                  icon={<BriefcaseBusiness size={15} />}
                  title="Kategori Jabatan"
                  description="Informasi penugasan kategori jabatan tidak dikirim oleh endpoint detail shift."
                />

                <EmptyInfo message="Endpoint GET /api/shift-kerja/:id tidak mengembalikan daftar kategori jabatan. Kategori jabatan tidak dapat ditampilkan dari data shift ini." />
              </section>


              <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                <div className="flex items-center justify-between gap-4 border-b theme-border theme-card-soft px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border theme-info">
                      <Users size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-bold theme-text">
                        Pengguna Terhubung
                      </p>
                      <p className="mt-0.5 text-[11px] theme-text-muted">
                        Jumlah pengguna yang terhubung berdasarkan ringkasan BE.
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full border theme-border theme-card px-2.5 py-1 text-[11px] font-semibold theme-text-muted">
                    {shift.jumlahPegawai == null
                      ? "—"
                      : `${formatNumber(shift.jumlahPegawai)} pengguna`}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-start gap-3 rounded-lg border theme-border theme-card-soft p-4">
                    <Info
                      size={17}
                      className="mt-0.5 shrink-0 theme-text-muted"
                    />
                    <div>
                      <p className="text-sm font-semibold theme-text">
                        Ringkasan pengguna
                      </p>
                      <p className="mt-1 text-xs leading-5 theme-text-muted">
                        Backend mengirim jumlah pengguna, bukan daftar nama,
                        email, peran, atau kategori jabatan. Informasi tersebut
                        tidak ditampilkan agar tidak menghasilkan data perkiraan.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>


            <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
              <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                <SectionHeader
                  icon={<CalendarClock size={15} />}
                  title="Ringkasan Jam Kerja"
                />

                <div className="space-y-3.5 p-5">
                  <WorkTime
                    label="Jam Masuk"
                    value={shift.jamMasuk}
                  />

                  <Divider />

                  <WorkTime
                    label="Batas Toleransi"
                    value={lateLimit}
                    highlight
                  />

                  <Divider />

                  <WorkTime
                    label="Jam Pulang"
                    value={shift.jamKeluar}
                  />
                </div>
              </section>

              <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                <SectionHeader
                  icon={<Users size={15} />}
                  title="Ringkasan Penggunaan"
                />

                <div className="space-y-4 p-5">
                  <SummaryRow
                    label="Jumlah Pengguna"
                    value={formatNumber(shift.jumlahPegawai)}
                  />

                  <Divider />

                  <SummaryRow
                    label="Total Absensi"
                    value={formatNumber(shift.totalAbsensi)}
                  />
                </div>
              </section>

              <section className="theme-card rounded-xl border theme-border p-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border theme-border theme-card-soft theme-text-secondary">
                    {isActive ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      <Info size={15} />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold theme-text">
                      Status Shift: {shift.status}
                    </p>
                    <p className="mt-1 text-[11px] leading-5 theme-text-muted">
                      {isActive
                        ? "Shift berstatus aktif berdasarkan data backend."
                        : "Shift berstatus nonaktif berdasarkan data backend."}
                    </p>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </PageShell>
  );
}


function PageShell({ children }) {
  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar />

      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <Header />
        {children}
      </div>
    </div>
  );
}


function SectionHeader({ icon, title, description }) {
  return (
    <div className="flex items-center gap-3 border-b theme-border theme-card-soft px-5 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border theme-info">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold theme-text">{title}</p>
        {description && (
          <p className="mt-0.5 text-[11px] theme-text-muted">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg border theme-border theme-card-soft p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider theme-text-muted">
        {label}
      </p>
      <p className="mt-1.5 break-words text-sm font-semibold theme-text">
        {value || "—"}
      </p>
    </div>
  );
}

function EmptyInfo({ message }) {
  return (
    <div className="px-5 py-8 text-center">
      <Info size={20} className="mx-auto theme-text-muted" />
      <p className="mx-auto mt-2 max-w-lg text-xs leading-5 theme-text-muted">
        {message}
      </p>
    </div>
  );
}

function StatCard({ icon, label, value, highlight = false }) {
  return (
    <div className="theme-card rounded-xl border theme-border p-4 shadow-sm transition-colors hover:border-[var(--color-primary)]">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border theme-info">
          {icon}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider theme-text-muted">
          {label}
        </p>
      </div>

      <p
        className={`mt-2.5 break-words text-xl font-bold tracking-tight ${
          highlight
            ? "text-[var(--color-primary)]"
            : "theme-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs theme-text-muted">{label}</span>
      <span className="text-sm font-bold theme-text">{value}</span>
    </div>
  );
}

function WorkTime({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs theme-text-muted">{label}</span>
      <span
        className={`text-sm font-bold ${
          highlight
            ? "text-[var(--color-primary)]"
            : "theme-text"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-[var(--color-border)]" />;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
