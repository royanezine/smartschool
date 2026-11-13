"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Download,
  ExternalLink,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  exportAbsensiFile,
  getRekapAbsensiMapel,
} from "@/services/absensi.service";
import { getKelasMapelDiampu } from "@/services/kelasMapel.service";

function getErrorMessage(err, fallback) {
  return (
    err?.response?.data?.message ||
    err?.data?.message ||
    err?.message ||
    fallback
  );
}

export default function GuruHistoriAbsensiPage() {
  const [collapsed, setCollapsed] = useState(false);

  const [kelasMapelList, setKelasMapelList] = useState([]);
  const [selectedKelasId, setSelectedKelasId] = useState("");
  const [selectedMapelId, setSelectedMapelId] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [search, setSearch] = useState("");

  const [rekapSiswa, setRekapSiswa] = useState([]);
  const [totalRiwayat, setTotalRiwayat] = useState(0);

  const [loadingMaster, setLoadingMaster] = useState(true);
  const [loadingRekap, setLoadingRekap] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [exportNotice, setExportNotice] = useState("");

  const loadMasterDiampu = useCallback(async () => {
    try {
      setLoadingMaster(true);
      setError("");

      const data = await getKelasMapelDiampu();
      const list = Array.isArray(data) ? data : [];
      setKelasMapelList(list);

      if (list.length > 0) {
        const first = list[0];
        setSelectedKelasId((prev) => prev || first?.kelasId || first?.kelas?.id || "");
        setSelectedMapelId((prev) => prev || first?.mataPelajaranId || first?.mataPelajaran?.id || "");
      }
    } catch (err) {
      setError(
        getErrorMessage(err, "Gagal memuat daftar kelas dan mata pelajaran yang diampu.")
      );
    } finally {
      setLoadingMaster(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadMasterDiampu();
    });
  }, [loadMasterDiampu]);

  const kelasOptions = useMemo(() => {
    const map = new Map();
    for (const item of kelasMapelList) {
      const k = item?.kelas;
      const kId = item?.kelasId || k?.id;
      if (kId && !map.has(kId)) {
        map.set(kId, {
          id: kId,
          nama: k?.nama || "Kelas",
          tingkat: k?.tingkat ?? null,
        });
      }
    }
    return Array.from(map.values());
  }, [kelasMapelList]);

  const mapelOptions = useMemo(() => {
    const map = new Map();
    for (const item of kelasMapelList) {
      if (selectedKelasId && (item?.kelasId || item?.kelas?.id) !== selectedKelasId) {
        continue;
      }
      const m = item?.mataPelajaran;
      const mId = item?.mataPelajaranId || m?.id;
      if (mId && !map.has(mId)) {
        map.set(mId, {
          id: mId,
          nama: m?.nama || "Mata Pelajaran",
          kode: m?.kode || "",
        });
      }
    }
    if (map.size === 0) {
      for (const item of kelasMapelList) {
        const m = item?.mataPelajaran;
        const mId = item?.mataPelajaranId || m?.id;
        if (mId && !map.has(mId)) {
          map.set(mId, {
            id: mId,
            nama: m?.nama || "Mata Pelajaran",
            kode: m?.kode || "",
          });
        }
      }
    }
    return Array.from(map.values());
  }, [kelasMapelList, selectedKelasId]);

  const loadRekap = useCallback(async () => {
    if (!selectedKelasId && !selectedMapelId) {
      setRekapSiswa([]);
      setTotalRiwayat(0);
      return;
    }

    try {
      setLoadingRekap(true);
      setError("");

      const data = await getRekapAbsensiMapel({
        kelasId: selectedKelasId || undefined,
        mataPelajaranId: selectedMapelId || undefined,
        tanggalMulai: tanggalMulai || undefined,
        tanggalSelesai: tanggalSelesai || undefined,
      });

      setRekapSiswa(Array.isArray(data?.rekapSiswa) ? data.rekapSiswa : []);
      setTotalRiwayat(Number(data?.totalData) || 0);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat rekap histori absensi siswa."));
      setRekapSiswa([]);
      setTotalRiwayat(0);
    } finally {
      setLoadingRekap(false);
    }
  }, [selectedKelasId, selectedMapelId, tanggalMulai, tanggalSelesai]);

  useEffect(() => {
    if (!loadingMaster) {
      Promise.resolve().then(() => {
        loadRekap();
      });
    }
  }, [loadingMaster, loadRekap]);

  const filteredRekap = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return rekapSiswa;

    return rekapSiswa.filter((row) => {
      const nama = String(row?.siswa?.namaLengkap || "").toLowerCase();
      const nisn = String(row?.siswa?.nisn || "").toLowerCase();
      const kelas = String(row?.kelas?.nama || "").toLowerCase();
      return nama.includes(kw) || nisn.includes(kw) || kelas.includes(kw);
    });
  }, [rekapSiswa, search]);

  const summary = useMemo(() => {
    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpha = 0;

    for (const row of filteredRekap) {
      hadir += Number(row?.hadir) || 0;
      izin += Number(row?.izin) || 0;
      sakit += Number(row?.sakit) || 0;
      alpha += Number(row?.alpha) || 0;
    }

    const total = hadir + izin + sakit + alpha;
    const avgPersen = total > 0 ? Math.round((hadir / total) * 100) : 0;

    return {
      jumlahSiswa: filteredRekap.length,
      hadir,
      izin,
      sakit,
      alpha,
      avgPersen,
    };
  }, [filteredRekap]);

  const handleExport = async () => {
    try {
      setExporting(true);
      setExportNotice("");
      setError("");

      const blob = await exportAbsensiFile({
        kelasId: selectedKelasId || undefined,
        tanggalMulai: tanggalMulai || undefined,
        tanggalSelesai: tanggalSelesai || undefined,
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `rekap-absensi-${selectedKelasId || "guru"}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      setExportNotice("File rekap absensi Excel berhasil diunduh.");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Gagal mengekspor data absensi. Pastikan akun memiliki izin export absensi."
        )
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="theme-page theme-text flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} activeMenu="histori-absensi" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setCollapsed((v) => !v)}
          title="Histori & Rekap Absensi"
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="theme-text flex items-center gap-2 text-xl font-bold sm:text-2xl">
                <BookOpen className="text-[var(--color-primary)]" size={22} />
                Histori & Rekap Absensi Siswa
              </h1>
              <p className="theme-text-muted mt-1 text-sm">
                Rekap kehadiran riil per kelas dan mata pelajaran yang Anda ampu.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={loadRekap}
                disabled={loadingRekap || loadingMaster}
                className="theme-card theme-border theme-text inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition hover:opacity-85 disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={loadingRekap ? "animate-spin" : ""}
                />
                Muat Ulang
              </button>

              <button
                type="button"
                onClick={handleExport}
                disabled={exporting || filteredRekap.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                Ekspor Excel
              </button>
            </div>
          </div>

          {exportNotice && (
            <div className="mb-4 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] px-4 py-3 text-xs text-[var(--color-success)]">
              {exportNotice}
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-3 text-xs text-[var(--color-danger)]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <div className="theme-card theme-border mb-6 rounded-xl border p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="theme-text-muted mb-1 flex items-center gap-1 text-[11px] font-semibold">
                  <Filter size={12} />
                  Kelas
                </label>
                <select
                  value={selectedKelasId}
                  onChange={(e) => setSelectedKelasId(e.target.value)}
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2 text-xs"
                >
                  <option value="">Semua Kelas Diampu</option>
                  {kelasOptions.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="theme-text-muted mb-1 flex items-center gap-1 text-[11px] font-semibold">
                  <BookOpen size={12} />
                  Mata Pelajaran
                </label>
                <select
                  value={selectedMapelId}
                  onChange={(e) => setSelectedMapelId(e.target.value)}
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2 text-xs"
                >
                  <option value="">Semua Mapel Diampu</option>
                  {mapelOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama}
                      {m.kode ? ` (${m.kode})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="theme-text-muted mb-1 flex items-center gap-1 text-[11px] font-semibold">
                  <Calendar size={12} />
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="theme-text-muted mb-1 flex items-center gap-1 text-[11px] font-semibold">
                  <Calendar size={12} />
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="theme-text-muted mb-1 flex items-center gap-1 text-[11px] font-semibold">
                  <Search size={12} />
                  Cari Siswa
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nama atau NISN..."
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="theme-card theme-border rounded-xl border p-3.5">
              <p className="theme-text-muted text-[11px]">Siswa Tercatat</p>
              <p className="theme-text mt-1 text-xl font-bold">{summary.jumlahSiswa}</p>
            </div>
            <div className="theme-card theme-border rounded-xl border p-3.5">
              <p className="theme-text-muted text-[11px]">Hadir</p>
              <p className="mt-1 text-xl font-bold text-[var(--color-success)]">{summary.hadir}</p>
            </div>
            <div className="theme-card theme-border rounded-xl border p-3.5">
              <p className="theme-text-muted text-[11px]">Izin</p>
              <p className="mt-1 text-xl font-bold text-[var(--color-info)]">{summary.izin}</p>
            </div>
            <div className="theme-card theme-border rounded-xl border p-3.5">
              <p className="theme-text-muted text-[11px]">Sakit</p>
              <p className="mt-1 text-xl font-bold text-[var(--color-warning)]">{summary.sakit}</p>
            </div>
            <div className="theme-card theme-border rounded-xl border p-3.5">
              <p className="theme-text-muted text-[11px]">Alpha</p>
              <p className="mt-1 text-xl font-bold text-[var(--color-danger)]">{summary.alpha}</p>
            </div>
            <div className="theme-card theme-border rounded-xl border p-3.5">
              <p className="theme-text-muted text-[11px]">Rata-rata Hadir</p>
              <p className="theme-text mt-1 text-xl font-bold">{summary.avgPersen}%</p>
            </div>
          </div>

          <div className="theme-card theme-border overflow-hidden rounded-xl border">
            <div className="theme-divider flex items-center justify-between border-b px-4 py-3 text-xs">
              <span className="theme-text font-semibold">
                Rekapitulasi Kehadiran ({totalRiwayat} entri absensi)
              </span>
            </div>

            {loadingMaster || loadingRekap ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center p-8">
                <Loader2 size={28} className="animate-spin text-[var(--color-primary)]" />
                <p className="theme-text-muted mt-2 text-xs">
                  Memuat rekap absensi siswa dari backend...
                </p>
              </div>
            ) : kelasMapelList.length === 0 ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center p-8 text-center">
                <Users size={28} className="theme-text-muted mb-2" />
                <p className="theme-text text-sm font-semibold">
                  Belum Ada Kelas / Mata Pelajaran Diampu
                </p>
                <p className="theme-text-muted mt-1 max-w-md text-xs">
                  Akun guru ini belum memiliki penugasan kelas-mapel aktif pada server.
                </p>
              </div>
            ) : filteredRekap.length === 0 ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center p-8 text-center">
                <Users size={28} className="theme-text-muted mb-2" />
                <p className="theme-text text-sm font-semibold">
                  Belum Ada Data Histori Absensi
                </p>
                <p className="theme-text-muted mt-1 max-w-md text-xs">
                  Tidak ditemukan catatan absensi untuk kelas, mata pelajaran, atau rentang tanggal yang dipilih.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="theme-divider border-b bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">No</th>
                      <th className="px-4 py-3 font-semibold">Siswa</th>
                      <th className="px-4 py-3 font-semibold">Kelas</th>
                      <th className="px-4 py-3 text-center font-semibold">Hadir</th>
                      <th className="px-4 py-3 text-center font-semibold">Izin</th>
                      <th className="px-4 py-3 text-center font-semibold">Sakit</th>
                      <th className="px-4 py-3 text-center font-semibold">Alpha</th>
                      <th className="px-4 py-3 text-center font-semibold">Total</th>
                      <th className="px-4 py-3 text-center font-semibold">Kehadiran</th>
                      <th className="px-4 py-3 text-right font-semibold">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                    {filteredRekap.map((row, idx) => {
                      const siswaId = row?.siswa?.id || "";
                      const namaSiswa = row?.siswa?.namaLengkap || "-";
                      const nisn = row?.siswa?.nisn || "";
                      const namaKelas = row?.kelas?.nama || "-";
                      const detailHref = siswaId
                        ? `/guru/histori-absensi/${encodeURIComponent(
                            siswaId
                          )}?nama=${encodeURIComponent(
                            namaSiswa
                          )}&kelas=${encodeURIComponent(namaKelas)}`
                        : "#";

                      return (
                        <tr
                          key={siswaId || idx}
                          className="transition hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]"
                        >
                          <td className="theme-text-muted px-4 py-3">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <p className="theme-text font-semibold">{namaSiswa}</p>
                            {nisn && (
                              <p className="theme-text-muted text-[11px]">
                                NISN: {nisn}
                              </p>
                            )}
                          </td>
                          <td className="theme-text-secondary px-4 py-3">
                            {namaKelas}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-[var(--color-success)]">
                            {row?.hadir ?? 0}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-[var(--color-info)]">
                            {row?.izin ?? 0}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-[var(--color-warning)]">
                            {row?.sakit ?? 0}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-[var(--color-danger)]">
                            {row?.alpha ?? 0}
                          </td>
                          <td className="theme-text px-4 py-3 text-center font-bold">
                            {row?.total ?? 0}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-primary)]">
                              {row?.persentaseHadir ?? 0}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {siswaId ? (
                              <Link
                                href={detailHref}
                                className="theme-border inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold text-[var(--color-primary)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]"
                              >
                                Riwayat
                                <ExternalLink size={12} />
                              </Link>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
