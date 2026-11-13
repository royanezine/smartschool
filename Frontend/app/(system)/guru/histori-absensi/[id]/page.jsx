"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getRiwayatAbsensiSiswa } from "@/services/absensi.service";

function getErrorMessage(err, fallback) {
  return (
    err?.response?.data?.message ||
    err?.data?.message ||
    err?.message ||
    fallback
  );
}

function formatTanggal(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusBadge(status) {
  const s = String(status || "").toLowerCase();
  if (s === "hadir") {
    return {
      label: "Hadir",
      icon: CheckCircle2,
      cls: "border-[color-mix(in_srgb,var(--color-success)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]",
    };
  }
  if (s === "izin") {
    return {
      label: "Izin",
      icon: FileText,
      cls: "border-[color-mix(in_srgb,var(--color-info)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] text-[var(--color-info)]",
    };
  }
  if (s === "sakit") {
    return {
      label: "Sakit",
      icon: Stethoscope,
      cls: "border-[color-mix(in_srgb,var(--color-warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)]",
    };
  }
  return {
    label: status ? status.toUpperCase() : "Alpha",
    icon: XCircle,
    cls: "border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)]",
  };
}

export default function GuruDetailHistoriAbsensiPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const siswaId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const namaParam = searchParams.get("nama") || "";
  const kelasParam = searchParams.get("kelas") || "";

  const [collapsed, setCollapsed] = useState(false);
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 30, totalData: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("Semua");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRiwayat = useCallback(async () => {
    if (!siswaId) {
      setError("ID siswa tidak valid.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await getRiwayatAbsensiSiswa(String(siswaId), {
        page,
        limit: 50,
      });

      const list = Array.isArray(res?.data) ? res.data : [];
      setRecords(list);
      if (res?.meta) {
        setMeta(res.meta);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat riwayat absensi siswa."));
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [siswaId, page]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadRiwayat();
    });
  }, [loadRiwayat]);

  const siswaInfo = useMemo(() => {
    const firstWithSiswa = records.find((r) => r?.siswa);
    return {
      nama:
        firstWithSiswa?.siswa?.namaLengkap ||
        namaParam ||
        "Siswa",
      nisn: firstWithSiswa?.siswa?.nisn || "",
      kelas:
        records[0]?.kelas?.nama ||
        kelasParam ||
        "-",
    };
  }, [records, namaParam, kelasParam]);

  const filteredRecords = useMemo(() => {
    if (statusFilter === "Semua") return records;
    return records.filter(
      (r) => String(r?.status || "").toLowerCase() === statusFilter.toLowerCase()
    );
  }, [records, statusFilter]);

  const stats = useMemo(() => {
    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpha = 0;

    for (const r of records) {
      const s = String(r?.status || "").toLowerCase();
      if (s === "hadir") hadir += 1;
      else if (s === "izin") izin += 1;
      else if (s === "sakit") sakit += 1;
      else alpha += 1;
    }

    const total = records.length;
    const persen = total > 0 ? Math.round((hadir / total) * 100) : 0;

    return { total, hadir, izin, sakit, alpha, persen };
  }, [records]);

  return (
    <div className="theme-page theme-text flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} activeMenu="histori-absensi" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setCollapsed((v) => !v)}
          title="Detail Riwayat Absensi Siswa"
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/guru/histori-absensi"
                className="theme-text-muted mb-2 inline-flex items-center gap-1.5 text-xs font-semibold hover:text-[var(--color-primary)]"
              >
                <ArrowLeft size={14} />
                Kembali ke Rekap Histori Absensi
              </Link>
              <h1 className="theme-text flex items-center gap-2 text-xl font-bold">
                <User size={20} className="text-[var(--color-primary)]" />
                {siswaInfo.nama}
              </h1>
              <p className="theme-text-muted mt-0.5 text-xs">
                Kelas: {siswaInfo.kelas}
                {siswaInfo.nisn ? ` • NISN: ${siswaInfo.nisn}` : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={loadRiwayat}
              disabled={loading}
              className="theme-card theme-border theme-text inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition hover:opacity-85 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Muat Ulang
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-3 text-xs text-[var(--color-danger)]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="theme-card theme-border rounded-xl border p-3.5">
              <p className="theme-text-muted text-[11px]">Total Tercatat</p>
              <p className="theme-text mt-1 text-xl font-bold">{stats.total}</p>
            </div>
            <div className="theme-card theme-border rounded-xl border p-3.5">
              <p className="theme-text-muted text-[11px]">Hadir</p>
              <p className="mt-1 text-xl font-bold text-[var(--color-success)]">{stats.hadir}</p>
            </div>
            <div className="theme-card theme-border rounded-xl border p-3.5">
              <p className="theme-text-muted text-[11px]">Izin</p>
              <p className="mt-1 text-xl font-bold text-[var(--color-info)]">{stats.izin}</p>
            </div>
            <div className="theme-card theme-border rounded-xl border p-3.5">
              <p className="theme-text-muted text-[11px]">Sakit</p>
              <p className="mt-1 text-xl font-bold text-[var(--color-warning)]">{stats.sakit}</p>
            </div>
            <div className="theme-card theme-border rounded-xl border p-3.5">
              <p className="theme-text-muted text-[11px]">Alpha</p>
              <p className="mt-1 text-xl font-bold text-[var(--color-danger)]">{stats.alpha}</p>
            </div>
            <div className="theme-card theme-border rounded-xl border p-3.5">
              <p className="theme-text-muted text-[11px]">Persentase Hadir</p>
              <p className="theme-text mt-1 text-xl font-bold">{stats.persen}%</p>
            </div>
          </div>

          <div className="theme-card theme-border overflow-hidden rounded-xl border">
            <div className="theme-divider flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="theme-text text-xs font-semibold">
                Riwayat Pertemuan ({filteredRecords.length} entri pada halaman ini)
              </span>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="theme-input theme-text rounded-lg border px-3 py-1.5 text-xs"
              >
                <option value="Semua">Semua Status</option>
                <option value="hadir">Hadir</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="alpha">Alpha</option>
              </select>
            </div>

            {loading ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center p-8">
                <Loader2 size={28} className="animate-spin text-[var(--color-primary)]" />
                <p className="theme-text-muted mt-2 text-xs">
                  Memuat riwayat absensi siswa...
                </p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
                <Calendar size={28} className="theme-text-muted mb-2" />
                <p className="theme-text text-sm font-semibold">
                  Belum Ada Riwayat Absensi
                </p>
                <p className="theme-text-muted mt-1 text-xs">
                  Belum ada log absensi yang tercatat untuk siswa ini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="theme-divider border-b bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Tanggal</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Metode</th>
                      <th className="px-4 py-3 font-semibold">Jam Masuk</th>
                      <th className="px-4 py-3 font-semibold">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                    {filteredRecords.map((item) => {
                      const badge = statusBadge(item.status);
                      const BadgeIcon = badge.icon;

                      return (
                        <tr key={item.id}>
                          <td className="theme-text whitespace-nowrap px-4 py-3 font-medium">
                            {formatTanggal(item.tanggal)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badge.cls}`}
                            >
                              <BadgeIcon size={12} />
                              {badge.label}
                            </span>
                          </td>
                          <td className="theme-text-secondary px-4 py-3">
                            {item.metode || "-"}
                          </td>
                          <td className="theme-text-secondary whitespace-nowrap px-4 py-3">
                            <span className="inline-flex items-center gap-1">
                              <Clock size={12} />
                              {item.jamMasuk || "-"}
                            </span>
                          </td>
                          <td className="theme-text-secondary px-4 py-3">
                            {item.catatan || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {meta?.totalPages > 1 && (
              <div className="theme-divider flex items-center justify-between border-t px-4 py-3 text-xs">
                <span className="theme-text-muted">
                  Halaman {meta.page || page} dari {meta.totalPages} ({meta.totalData || records.length} total)
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="theme-border rounded-lg border px-3 py-1 font-semibold disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="theme-border rounded-lg border px-3 py-1 font-semibold disabled:opacity-50"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
