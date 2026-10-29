"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";

import { getRapotSaya, getDetailRapotSaya } from "@/services/raport.service";


function unwrapList(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  return [];
}

function unwrapItem(result) {
  if (result?.data?.data) return result.data.data;
  return result?.data ?? result ?? null;
}

function jenisRapotLabel(value) {
  if (value === "tengah_semester") return "Tengah Semester";
  if (value === "akhir_semester") return "Akhir Semester";
  return value || "-";
}

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || value === "") return "-";

  const number = Number(value);
  if (!Number.isFinite(number)) return "-";

  return number.toFixed(digits);
}

function formatDate(value) {
  if (!value) return "-";

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return "-";
  }
}

function tahunAjaranLabel(item) {
  if (!item) return "-";

  if (typeof item === "string" || typeof item === "number") {
    return String(item);
  }

  return item.tahunAjaran || item.nama || item.tahun || item.id || "-";
}

function statusRapot(item) {
  const raw = String(item?.status || "")
    .trim()
    .toLowerCase();

  if (raw === "published") {
    return { published: true, label: "Published" };
  }

  if (raw === "draft") {
    return { published: false, label: "Draft" };
  }

  if (item?.dipublishPada) {
    return { published: true, label: "Published" };
  }

  return { published: false, label: "Draft" };
}

function predikatColor(predikat) {
  const value = String(predikat || "").trim().toUpperCase();

  if (value === "A") return "theme-success";
  if (value === "B") {
    return "bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[var(--color-info)]";
  }
  if (value === "C") return "theme-warning";

  return "theme-danger";
}


export default function SiswaRaportPage() {
  const [rapotList, setRapotList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState("");


  const loadRapot = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getRapotSaya();
      setRapotList(unwrapList(result));
    } catch (err) {
      console.error("Gagal memuat daftar raport:", err);
      setError(err?.message || "Gagal memuat daftar raport.");
      setRapotList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRapot();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadRapot]);


  const handleViewDetail = async (item) => {
    if (!item?.id) {
      setError("ID raport tidak ditemukan.");
      return;
    }

    setShowDetail(true);
    setDetail(item);
    setDetailError("");
    setDetailLoading(true);

    try {
      const result = await getDetailRapotSaya(item.id);
      const data = unwrapItem(result);

      if (data) {
        setDetail(data);
      } else {
        setDetailError("Data detail raport tidak ditemukan.");
      }
    } catch (err) {
      console.error("Gagal memuat detail raport:", err);
      setDetailError(err?.message || "Gagal memuat detail raport.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setShowDetail(false);
    setDetailLoading(false);
    setDetailError("");
    setDetail(null);
  };

  const akademik = Array.isArray(detail?.akademik)
    ? detail.akademik
    : [];

  const detailStatus = statusRapot(detail);


  return (
    <div className="theme-page min-h-full w-full">
      <main className="theme-page min-h-full w-full overflow-x-hidden">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <div className="theme-card theme-border mb-6 overflow-hidden rounded-2xl border p-6 shadow-[0_10px_30px_color-mix(in_srgb,var(--color-text)_8%,transparent)] sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                  <Award size={28} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                    Portal Siswa
                  </p>
                  <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                    Raport Saya
                  </h1>
                  <p className="theme-text-secondary mt-1 text-sm">
                    Lihat hasil belajar yang telah dipublikasikan oleh wali
                    kelas.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadRapot}
                disabled={loading}
                className="theme-border theme-card theme-text-secondary inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Muat Ulang
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="theme-danger mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />

              <p className="min-w-0 flex-1 font-medium">{error}</p>

              <button
                type="button"
                aria-label="Tutup notifikasi"
                onClick={() => setError("")}
                className="shrink-0 rounded p-1"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="theme-card theme-border flex items-center justify-center gap-2 rounded-2xl border py-16 text-sm theme-text-muted">
              <Loader2
                size={18}
                className="animate-spin text-[var(--color-primary)]"
              />
              Memuat raport...
            </div>
          ) : rapotList.length === 0 ? (
            <div className="theme-card theme-border flex flex-col items-center gap-2 rounded-2xl border py-16 text-center">
              {error ? (
                <>
                  <AlertCircle size={36} className="theme-danger" />
                  <p className="theme-text-secondary text-sm font-medium">
                    Gagal memuat daftar raport
                  </p>
                  <p className="theme-text-muted max-w-md px-4 text-xs">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={loadRapot}
                    className="theme-primary mt-3 rounded-lg px-4 py-2 text-sm font-semibold"
                  >
                    Coba Lagi
                  </button>
                </>
              ) : (
                <>
                  <FileText size={36} className="theme-text-muted opacity-50" />
                  <p className="theme-text-secondary text-sm font-medium">
                    Belum ada raport yang dipublikasikan
                  </p>
                  <p className="theme-text-muted max-w-md px-4 text-xs">
                    Raport akan tampil di sini setelah wali kelas
                    mempublikasikannya.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rapotList.map((item, index) => {
                const status = statusRapot(item);

                return (
                <div
                  key={item.id || `${item.jenisRapot}-${index}`}
                  className="theme-card theme-border flex min-w-0 flex-col rounded-2xl border p-5 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] transition hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_10%,transparent)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                        <BookOpen size={20} />
                      </div>

                      <div className="min-w-0">
                        <p className="theme-text font-bold">
                          {jenisRapotLabel(item.jenisRapot)}
                        </p>
                        <p className="theme-text-muted truncate text-xs">
                          {tahunAjaranLabel(item.tahunAjaran)}
                          {item?.kelas?.nama ? ` · ${item.kelas.nama}` : ""}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        status.published ? "theme-success" : "theme-warning"
                      }`}
                    >
                      {status.published ? (
                        <CheckCircle2 size={11} />
                      ) : (
                        <Clock size={11} />
                      )}
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="theme-card-soft rounded-lg px-2 py-2">
                      <p className="theme-text-muted text-[10px] uppercase tracking-wide">
                        Rata-rata
                      </p>
                      <p className="theme-text mt-0.5 text-sm font-bold">
                        {formatNumber(item.rataRata)}
                      </p>
                    </div>

                    <div className="theme-card-soft rounded-lg px-2 py-2">
                      <p className="theme-text-muted text-[10px] uppercase tracking-wide">
                        Ranking
                      </p>
                      <p className="theme-text mt-0.5 text-sm font-bold">
                        {item.ranking ?? "-"}
                      </p>
                    </div>

                    <div className="theme-card-soft rounded-lg px-2 py-2">
                      <p className="theme-text-muted text-[10px] uppercase tracking-wide">
                        Semester
                      </p>
                      <p className="theme-text mt-0.5 text-sm font-bold">
                        {item.semester ?? "-"}
                      </p>
                    </div>
                  </div>

                  <div className="theme-text-muted mt-3 flex items-center gap-1.5 text-xs">
                    <CalendarDays size={13} />
                    {status.published
                      ? `Dipublikasikan ${formatDate(item.dipublishPada)}`
                      : "Belum dipublikasikan"}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewDetail(item)}
                    className="theme-primary mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:brightness-95"
                  >
                    <Eye size={16} />
                    Lihat Detail
                  </button>
                </div>
                );
              })}
            </div>
          )}

          <footer className="theme-border-soft theme-text-muted mt-8 border-t pt-6 text-center text-xs">
            © 2026 SmartSchool • Raport Saya
          </footer>
        </div>
      </main>

      {showDetail && detail && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDetail();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="raport-detail-title"
            className="theme-card theme-border max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_20%,transparent)]"
          >
            <div className="theme-border flex items-center justify-between border-b px-6 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                  <Award size={20} />
                </div>

                <div className="min-w-0">
                  <h2
                    id="raport-detail-title"
                    className="theme-text text-lg font-bold"
                  >
                    Raport {jenisRapotLabel(detail.jenisRapot)}
                  </h2>
                  <p className="theme-text-muted text-xs">
                    {tahunAjaranLabel(detail.tahunAjaran)} ·{" "}
                    {detail.semester || "-"}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    detailStatus.published ? "theme-success" : "theme-warning"
                  }`}
                >
                  {detailStatus.published ? (
                    <CheckCircle2 size={11} />
                  ) : (
                    <Clock size={11} />
                  )}
                  {detailStatus.label}
                </span>

                <button
                  type="button"
                  aria-label="Tutup detail raport"
                  onClick={closeDetail}
                  className="theme-text-muted rounded-lg p-1.5 transition hover:text-[var(--color-primary)]"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {detailLoading ? (
              <div className="theme-text-muted flex items-center justify-center gap-2 py-12 text-sm">
                <Loader2
                  size={18}
                  className="animate-spin text-[var(--color-primary)]"
                />
                Memuat detail...
              </div>
            ) : detailError ? (
              <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                <AlertCircle size={28} className="theme-danger" />
                <p className="theme-text-secondary text-sm">{detailError}</p>
                <button
                  type="button"
                  onClick={() => handleViewDetail(detail)}
                  className="theme-primary rounded-lg px-4 py-2 text-sm font-semibold"
                >
                  Coba Lagi
                </button>
              </div>
            ) : (
              <div className="space-y-6 p-4 sm:p-6">
                <div className="theme-card-soft grid grid-cols-2 gap-4 rounded-xl p-4 sm:grid-cols-4">
                  <InfoCell
                    label="Nama"
                    value={detail.identitas?.nama}
                  />
                  <InfoCell
                    label="NIS"
                    value={detail.identitas?.nis}
                  />
                  <InfoCell
                    label="NISN"
                    value={detail.identitas?.nisn}
                  />
                  <InfoCell
                    label="Kelas"
                    value={detail.identitas?.kelas}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <SummaryCell
                    label="Rata-rata"
                    value={formatNumber(detail.rataRata)}
                  />
                  <SummaryCell
                    label="Ranking"
                    value={detail.ranking ?? "-"}
                  />
                  <SummaryCell
                    label="Hadir"
                    value={detail.kehadiran?.hadir ?? 0}
                  />
                  <SummaryCell
                    label="Alpha"
                    value={detail.kehadiran?.alpha ?? 0}
                  />
                </div>

                <section>
                  <p className="theme-text-secondary mb-2 flex items-center gap-2 text-sm font-semibold">
                    <BookOpen size={15} />
                    Nilai Mata Pelajaran
                  </p>

                  {akademik.length === 0 ? (
                    <p className="theme-text-muted text-xs">
                      Belum ada data nilai.
                    </p>
                  ) : (
                    <div className="theme-border overflow-x-auto rounded-xl border">
                      <table className="w-full min-w-[520px] text-sm">
                        <thead>
                          <tr className="theme-card-soft theme-border border-b">
                            <th className="theme-text-muted px-3 py-2.5 text-left text-xs font-semibold uppercase">
                              Mata Pelajaran
                            </th>
                            <th className="theme-text-muted px-3 py-2.5 text-right text-xs font-semibold uppercase">
                              Nilai
                            </th>
                            <th className="theme-text-muted px-3 py-2.5 text-right text-xs font-semibold uppercase">
                              KKM
                            </th>
                            <th className="theme-text-muted px-3 py-2.5 text-center text-xs font-semibold uppercase">
                              Predikat
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-[var(--color-border-soft)]">
                          {akademik.map((row, index) => (
                            <tr key={row.kelasMapelId || index}>
                              <td className="theme-text px-3 py-2.5 font-medium">
                                {row.mapel || "-"}
                              </td>

                              <td className="theme-text px-3 py-2.5 text-right font-bold">
                                {row.nilaiAkhir === null ||
                                row.nilaiAkhir === undefined
                                  ? "-"
                                  : formatNumber(row.nilaiAkhir, 0)}
                              </td>

                              <td className="theme-text-secondary px-3 py-2.5 text-right">
                                {row.kkm ?? "-"}
                              </td>

                              <td className="px-3 py-2.5 text-center">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${predikatColor(
                                    row.predikat,
                                  )}`}
                                >
                                  {row.predikat || "-"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section>
                  <p className="theme-text-secondary mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Clock size={15} />
                    Kehadiran
                  </p>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <SummaryCell
                      label="Hadir"
                      value={detail.kehadiran?.hadir ?? 0}
                    />
                    <SummaryCell
                      label="Izin"
                      value={detail.kehadiran?.izin ?? 0}
                    />
                    <SummaryCell
                      label="Sakit"
                      value={detail.kehadiran?.sakit ?? 0}
                    />
                    <SummaryCell
                      label="Alpha"
                      value={detail.kehadiran?.alpha ?? 0}
                    />
                  </div>
                </section>

                <section>
                  <p className="theme-text-secondary mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Sparkles size={15} />
                    Catatan Wali Kelas
                  </p>

                  <div className="theme-card-soft rounded-xl p-4 text-sm theme-text-secondary">
                    {detail.catatanWaliKelas || "Tidak ada catatan."}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


function InfoCell({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="theme-text-muted text-[10px] font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="theme-text mt-0.5 break-words text-sm font-semibold">
        {value ?? "-"}
      </p>
    </div>
  );
}

function SummaryCell({ label, value }) {
  return (
    <div className="theme-card theme-border rounded-xl border px-3 py-2.5 text-center">
      <p className="theme-text-muted text-[10px] font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="theme-text mt-0.5 text-lg font-bold">{value}</p>
    </div>
  );
}