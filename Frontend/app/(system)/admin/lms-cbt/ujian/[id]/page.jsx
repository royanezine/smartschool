"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  KeyRound,
  FileQuestion,
  Users,
  CalendarDays,
  Clock3,
  BookOpen,
  GraduationCap,
  Check,
  CheckCircle2,
  ClipboardList,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  getDetailUjian,
  deleteUjian,
  updateUjian,
} from "@/services/ujian.service";


const statusConfig = {
  Aktif: {
    label: "Aktif",
    className:
      "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]",
    icon: CheckCircle2,
  },
  Terjadwal: {
    label: "Terjadwal",
    className:
      "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)]",
    icon: CalendarDays,
  },
  Draft: {
    label: "Draft",
    className:
      "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] theme-text-secondary border-[color-mix(in_srgb,var(--color-text)_15%,transparent)]",
    icon: ClipboardList,
  },
  Selesai: {
    label: "Selesai",
    className:
      "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]",
    icon: Clock3,
  },
};

function computeStatus(item) {
  if (!item?.dipublikasikan) return "Draft";
  const now = new Date();
  if (item?.waktuSelesai && new Date(item.waktuSelesai) < now) return "Selesai";
  if (item?.waktuMulai && new Date(item.waktuMulai) > now) return "Terjadwal";
  return "Aktif";
}

function formatTanggal(isoStr) {
  if (!isoStr) return "-";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function formatWaktu(mulaiStr, selesaiStr) {
  if (!mulaiStr && !selesaiStr) return "-";
  try {
    const formatJam = (iso) => {
      if (!iso) return "";
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };
    const j1 = formatJam(mulaiStr);
    const j2 = formatJam(selesaiStr);
    if (j1 && j2) return `${j1} - ${j2}`;
    return j1 || j2 || "-";
  } catch {
    return "-";
  }
}

export default function DetailUjianAdminPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [ujian, setUjian] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(null);

  const fetchDetail = async (isManual = false) => {
    if (!id) return;
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await getDetailUjian(id);
      setUjian(data);
    } catch (err) {
      console.error("Gagal memuat detail ujian:", err);
      setError(
        err?.message || "Gagal memuat detail data ujian dari server atau data telah dihapus."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getDetailUjian(id);
        if (isMounted) setUjian(data);
      } catch (err) {
        console.error("Gagal memuat detail ujian:", err);
        if (isMounted) {
          setError(
            err?.message || "Gagal memuat detail data ujian dari server atau data telah dihapus."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    const t = setTimeout(() => {
      load();
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(t);
    };
  }, [id]);

  const handleTogglePublish = async () => {
    if (!ujian) return;
    setPublishing(true);
    setPublishSuccess(null);
    try {
      const nextStatus = !ujian.dipublikasikan;
      await updateUjian(ujian.id, { dipublikasikan: nextStatus });
      setPublishSuccess(
        nextStatus
          ? `Ujian "${ujian.judul}" berhasil dipublikasikan.`
          : `Ujian "${ujian.judul}" dialihkan ke status Draft.`
      );
      setUjian((prev) => (prev ? { ...prev, dipublikasikan: nextStatus } : prev));
      setTimeout(() => setPublishSuccess(null), 4000);
    } catch (err) {
      console.error("Gagal mengubah status publikasi:", err);
      setError(err?.message || "Gagal mengubah status publikasi ujian.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteUjian(id);
      router.push("/admin/lms-cbt/ujian");
    } catch (err) {
      console.error("Gagal menghapus ujian:", err);
      setDeleteError(err?.message || "Gagal menghapus ujian dari sistem.");
      setDeleting(false);
    }
  };

  const computedStatus = ujian ? computeStatus(ujian) : "Draft";
  const statusBadge = statusConfig[computedStatus] || statusConfig.Draft;
  const StatusIcon = statusBadge.icon;

  return (
    <div className="min-h-screen theme-page flex">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header />

        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-sm theme-text-secondary mb-4">
            <Link
              href="/admin/lms-cbt/ujian"
              className="hover:text-[var(--color-primary)] transition"
            >
              Ujian CBT Online
            </Link>
            <span>/</span>
            <span className="theme-text font-medium truncate max-w-xs">
              {ujian?.judul || "Rincian Ujian"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/lms-cbt/ujian"
                className="
                  p-2 border theme-border rounded-lg theme-text-secondary
                  hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                  hover:theme-text transition
                "
                title="Kembali ke daftar ujian"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold theme-text tracking-tight">
                  {ujian?.judul || "Detail Ujian CBT"}
                </h1>
                <p className="text-sm theme-text-secondary mt-0.5">
                  Informasi asesmen, jadwal pengerjaan, token sesi, dan butir soal ujian.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => fetchDetail(true)}
                disabled={loading || refreshing}
                className="
                  inline-flex items-center gap-2 px-3 py-2 border theme-border
                  rounded-lg text-sm font-medium theme-text-secondary
                  hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                  transition disabled:opacity-50
                "
                title="Segarkan data"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin text-[var(--color-primary)]" : ""}
                />
                <span className="hidden sm:inline">
                  {refreshing ? "Menyegarkan..." : "Segarkan"}
                </span>
              </button>

              {ujian && (
                <>
                  <Link
                    href={`/admin/lms-cbt/ujian/${id}/edit`}
                    className="
                      inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)]
                      text-white rounded-lg text-sm font-medium hover:opacity-90
                      transition shadow-sm
                    "
                  >
                    <Pencil size={15} />
                    <span>Edit Ujian</span>
                  </Link>

                  <button
                    onClick={() => {
                      setDeleteError(null);
                      setShowDeleteModal(true);
                    }}
                    className="
                      inline-flex items-center gap-2 px-3.5 py-2 border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)]
                      bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]
                      text-[var(--color-danger)] rounded-lg text-sm font-medium
                      hover:bg-[color-mix(in_srgb,var(--color-danger)_15%,transparent)] transition
                    "
                    title="Hapus Ujian"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Hapus</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {publishSuccess && (
            <div className="mb-6 p-4 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] flex items-center justify-between text-sm text-[var(--color-success)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span className="font-medium">{publishSuccess}</span>
              </div>
              <button
                onClick={() => setPublishSuccess(null)}
                className="p-1 hover:opacity-75 transition"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-6 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] flex items-start gap-3 text-sm text-[var(--color-danger)]">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Gagal Memuat Detail Ujian</p>
                <p className="mt-1">{error}</p>
                <Link
                  href="/admin/lms-cbt/ujian"
                  className="inline-block mt-3 px-3.5 py-1.5 bg-[var(--color-danger)] text-white rounded-md text-xs font-medium hover:opacity-90 transition"
                >
                  Kembali ke Daftar Ujian
                </Link>
              </div>
            </div>
          )}

          {loading ? (
            <div className="p-16 text-center theme-card border theme-border rounded-xl">
              <Loader2
                size={36}
                className="animate-spin text-[var(--color-primary)] mx-auto mb-3"
              />
              <p className="text-sm theme-text-secondary">
                Memuat rincian asesmen dan bank soal dari server...
              </p>
            </div>
          ) : ujian ? (
            <div className="space-y-6">
              <div className="p-5 md:p-6 rounded-xl theme-card border theme-border shadow-sm space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`
                          inline-flex items-center gap-1.5 px-3 py-1
                          rounded-full text-xs font-medium border
                          ${statusBadge.className}
                        `}
                      >
                        <StatusIcon size={13} />
                        {statusBadge.label}
                      </span>
                      {ujian.tipe && (
                        <span className="px-2.5 py-1 rounded-md bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] text-xs font-medium theme-text-secondary">
                          Tipe: {ujian.tipe}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold theme-text mt-2">
                      {ujian.judul}
                    </h2>
                    <p className="text-xs theme-text-secondary mt-1 max-w-2xl leading-relaxed">
                      {ujian.deskripsi || "Tidak ada petunjuk khusus untuk asesmen ini."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {ujian.token && (
                      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] border border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)] text-xs font-mono font-bold text-[var(--color-primary)]">
                        <KeyRound size={15} />
                        <span>TOKEN: {ujian.token}</span>
                      </div>
                    )}

                    <button
                      onClick={handleTogglePublish}
                      disabled={publishing}
                      className={`
                        px-3.5 py-1.5 rounded-lg text-xs font-medium transition border flex items-center gap-1.5
                        ${
                          ujian.dipublikasikan
                            ? "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-success)_18%,transparent)]"
                            : "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-secondary border-theme-border hover:theme-text"
                        }
                      `}
                    >
                      {publishing && <Loader2 size={13} className="animate-spin" />}
                      <span>
                        {ujian.dipublikasikan
                          ? "Publik: Terbit (Klik jadikan Draf)"
                          : "Publik: Draf (Klik untuk Terbitkan)"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t theme-border-soft text-xs">
                  <div>
                    <span className="theme-text-muted block text-[11px] mb-0.5">
                      Kelas:
                    </span>
                    <span className="font-semibold theme-text flex items-center gap-1.5">
                      <GraduationCap size={14} className="theme-text-muted" />
                      {ujian.kelasMapel?.kelas?.nama || "-"}
                    </span>
                  </div>

                  <div>
                    <span className="theme-text-muted block text-[11px] mb-0.5">
                      Mata Pelajaran:
                    </span>
                    <span className="font-semibold theme-text flex items-center gap-1.5">
                      <BookOpen size={14} className="theme-text-muted" />
                      {ujian.kelasMapel?.mataPelajaran?.nama || "-"}
                    </span>
                  </div>

                  <div>
                    <span className="theme-text-muted block text-[11px] mb-0.5">
                      Guru Pengampu:
                    </span>
                    <span className="font-medium theme-text">
                      {ujian.kelasMapel?.guruPengajar?.namaLengkap || "-"}
                    </span>
                  </div>

                  <div>
                    <span className="theme-text-muted block text-[11px] mb-0.5">
                      Durasi Pengerjaan:
                    </span>
                    <span className="font-semibold theme-text flex items-center gap-1.5">
                      <Clock3 size={14} className="theme-text-muted" />
                      {ujian.durasi || 0} Menit
                    </span>
                  </div>

                  <div>
                    <span className="theme-text-muted block text-[11px] mb-0.5">
                      KKM / Nilai Lulus:
                    </span>
                    <span className="font-semibold theme-text">
                      {ujian.nilaiKelulusan ?? "-"}
                    </span>
                  </div>

                  <div>
                    <span className="theme-text-muted block text-[11px] mb-0.5">
                      Jadwal Tanggal:
                    </span>
                    <span className="font-medium theme-text flex items-center gap-1.5">
                      <CalendarDays size={14} className="theme-text-muted" />
                      {formatTanggal(ujian.waktuMulai)}
                    </span>
                  </div>

                  <div>
                    <span className="theme-text-muted block text-[11px] mb-0.5">
                      Rentang Waktu:
                    </span>
                    <span className="font-medium theme-text">
                      {formatWaktu(ujian.waktuMulai, ujian.waktuSelesai)}
                    </span>
                  </div>

                  <div>
                    <span className="theme-text-muted block text-[11px] mb-0.5">
                      Jumlah Butir Soal:
                    </span>
                    <span className="font-semibold text-[var(--color-primary)]">
                      {ujian.soalAsesmen?.length || 0} Soal
                    </span>
                  </div>
                </div>
              </div>

              <div className="theme-card border theme-border rounded-xl p-5 md:p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <FileQuestion size={20} className="text-[var(--color-primary)]" />
                    <h3 className="font-bold theme-text text-base">
                      Bank Soal ({ujian.soalAsesmen?.length || 0} Soal)
                    </h3>
                  </div>
                  <span className="text-xs theme-text-muted">
                    Kunci jawaban ditampilkan untuk peninjauan Admin Sekolah
                  </span>
                </div>

                {!ujian.soalAsesmen || ujian.soalAsesmen.length === 0 ? (
                  <div className="p-8 text-center border theme-border rounded-xl theme-card-soft">
                    <FileQuestion
                      size={36}
                      className="mx-auto mb-2 theme-text-muted opacity-40"
                    />
                    <p className="text-xs theme-text-muted">
                      Belum ada butir soal yang ditambahkan pada asesmen ini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ujian.soalAsesmen.map((s, idx) => (
                      <div
                        key={s.id || idx}
                        className="p-4 border theme-border rounded-xl theme-card text-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-medium theme-text text-sm leading-relaxed">
                            <span className="font-bold mr-2 text-[var(--color-primary)]">
                              {s.nomorUrut || idx + 1}.
                            </span>
                            {s.teksSoal}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2.5 py-1 rounded bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] text-[10px] theme-text-muted font-semibold uppercase">
                              {s.jenisSoal?.replace("_", " ") || "soal"}
                            </span>
                            <span className="px-2.5 py-1 rounded bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[11px] text-[var(--color-primary)] font-bold">
                              {s.poin} Poin
                            </span>
                          </div>
                        </div>

                        {Array.isArray(s.pilihan) && s.pilihan.length > 0 && (
                          <div className="pl-4 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                            {s.pilihan.map((p, pIdx) => {
                              const huruf = String.fromCharCode(65 + pIdx);
                              const isKunci =
                                String(s.kunciJawaban).trim().toLowerCase() ===
                                  String(p).trim().toLowerCase() ||
                                String(s.kunciJawaban).trim().toLowerCase() ===
                                  huruf.toLowerCase();

                              return (
                                <div
                                  key={pIdx}
                                  className={`
                                    p-2 rounded-lg flex items-center gap-2.5 border
                                    ${
                                      isKunci
                                        ? "border-[color-mix(in_srgb,var(--color-success)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)] font-medium"
                                        : "border-theme-border-soft theme-text-secondary"
                                    }
                                  `}
                                >
                                  <span className="font-bold w-4">{huruf}.</span>
                                  <span className="flex-1">{p}</span>
                                  {isKunci && (
                                    <Check
                                      size={14}
                                      className="text-[var(--color-success)] shrink-0"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {s.jenisSoal !== "pilihan_ganda" && s.kunciJawaban && (
                          <div className="pt-1 text-xs text-[var(--color-success)] font-medium flex items-center gap-2">
                            <span className="theme-text-muted">Kunci Jawaban:</span>
                            <span className="font-mono px-2 py-0.5 rounded bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]">
                              {s.kunciJawaban}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 border theme-border rounded-xl theme-card-soft text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-semibold theme-text">
                  <Users size={16} className="text-[var(--color-info)]" />
                  <span>Pemantauan Sesi Peserta</span>
                </div>
                <p className="theme-text-muted leading-relaxed">
                  Data percobaan siswa dihimpun dari rekaman ujian aktif. Penilaian otomatis diterapkan langsung pada hasil jawaban objektif siswa.
                </p>
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {showDeleteModal && ujian && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative w-full max-w-md theme-card border theme-border rounded-xl shadow-2xl p-6 overflow-hidden animate-scaleUp text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] flex items-center justify-center text-[var(--color-danger)] mb-4">
              <Trash2 size={24} />
            </div>

            <h3 className="font-semibold theme-text text-base">
              Hapus ujian ini dari sistem?
            </h3>

            <p className="text-sm theme-text-secondary mt-2 leading-relaxed">
              Ujian <span className="font-semibold theme-text">{ujian.judul}</span> akan dinonaktifkan. Data bank soal terkait juga akan dihapus.
            </p>

            {deleteError && (
              <div className="mt-4 p-3 rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-xs text-[var(--color-danger)] text-left flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 border theme-border rounded-lg text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-danger)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                <span>{deleting ? "Menghapus..." : "Hapus Ujian"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
