"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  CalendarDays,
  Clock3,
  BookOpen,
  GraduationCap,
  Users,
  FileText,
  ExternalLink,
  Award,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
  CheckCircle2,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  getDetailTugas,
  getPengumpulanByTugas,
  beriNilaiTugas,
  deleteTugas,
} from "@/services/tugas.service";

function formatTanggal(isoString) {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "-";
  }
}

export default function DetailTugasAdminPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [tugas, setTugas] = useState(null);
  const [pengumpulan, setPengumpulan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [activeGrading, setActiveGrading] = useState(null); 
  const [gradeNilai, setGradeNilai] = useState("");
  const [gradeCatatan, setGradeCatatan] = useState("");
  const [submittingNilai, setSubmittingNilai] = useState(false);
  const [gradeError, setGradeError] = useState(null);
  const [gradeSuccess, setGradeSuccess] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchDetail = async (isManual = false) => {
    if (!id) return;
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [tugasRes, pengumpulanRes] = await Promise.all([
        getDetailTugas(id),
        getPengumpulanByTugas(id).catch(() => []),
      ]);

      const tugasData = tugasRes?.data ?? tugasRes;
      const pengumpulanData = Array.isArray(pengumpulanRes?.data)
        ? pengumpulanRes.data
        : Array.isArray(pengumpulanRes)
        ? pengumpulanRes
        : [];

      setTugas(tugasData);
      setPengumpulan(pengumpulanData);
    } catch (err) {
      console.error("Gagal memuat detail tugas:", err);
      setError(
        err?.message || "Gagal memuat detail tugas dari server atau data telah dihapus."
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
        const [tugasRes, pengumpulanRes] = await Promise.all([
          getDetailTugas(id),
          getPengumpulanByTugas(id).catch(() => []),
        ]);

        if (isMounted) {
          const tugasData = tugasRes?.data ?? tugasRes;
          const pengumpulanData = Array.isArray(pengumpulanRes?.data)
            ? pengumpulanRes.data
            : Array.isArray(pengumpulanRes)
            ? pengumpulanRes
            : [];

          setTugas(tugasData);
          setPengumpulan(pengumpulanData);
        }
      } catch (err) {
        console.error("Gagal memuat detail tugas:", err);
        if (isMounted) {
          setError(
            err?.message || "Gagal memuat detail tugas dari server atau data telah dihapus."
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

  const handleStartGrade = (p) => {
    setActiveGrading(p);
    setGradeNilai(p.nilai !== null && p.nilai !== undefined ? String(p.nilai) : "");
    setGradeCatatan(p.catatanGuru || "");
    setGradeError(null);
    setGradeSuccess(null);
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!activeGrading) return;

    setSubmittingNilai(true);
    setGradeError(null);

    try {
      const payload = {
        nilai: Number(gradeNilai),
        catatanGuru: gradeCatatan || undefined,
      };

      await beriNilaiTugas(activeGrading.id, payload);

      setGradeSuccess(`Nilai berhasil disimpan untuk siswa ${activeGrading.siswa?.namaLengkap || activeGrading.pengguna?.namaLengkap || ""}!`);

      setPengumpulan((prev) =>
        prev.map((item) =>
          item.id === activeGrading.id
            ? {
                ...item,
                nilai: Number(gradeNilai),
                catatanGuru: gradeCatatan,
                status: "Dinilai",
              }
            : item
        )
      );

      setTimeout(() => {
        setActiveGrading(null);
        setGradeSuccess(null);
      }, 1500);
    } catch (err) {
      console.error("Gagal menyimpan penilaian tugas:", err);
      setGradeError(err?.message || "Gagal menyimpan penilaian siswa.");
    } finally {
      setSubmittingNilai(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteTugas(id);
      router.push("/admin/lms-cbt/tugas-siswa");
    } catch (err) {
      console.error("Gagal menghapus tugas:", err);
      setDeleteError(err?.message || "Gagal menghapus tugas dari server.");
      setDeleting(false);
    }
  };

  const now = new Date();
  const batasDate = tugas?.batasWaktu ? new Date(tugas.batasWaktu) : null;
  const isLewatTenggat = batasDate ? batasDate < now : false;

  return (
    <div className="min-h-screen theme-page flex">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header />

        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-sm theme-text-secondary mb-4">
            <Link
              href="/admin/lms-cbt/tugas-siswa"
              className="hover:text-[var(--color-primary)] transition"
            >
              Tugas Siswa
            </Link>
            <span>/</span>
            <span className="theme-text font-medium truncate max-w-xs">
              {tugas?.judul || "Rincian Tugas"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/lms-cbt/tugas-siswa"
                className="
                  p-2 border theme-border rounded-lg theme-text-secondary
                  hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                  hover:theme-text transition
                "
                title="Kembali ke daftar tugas"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold theme-text tracking-tight">
                  {tugas?.judul || "Detail Tugas Siswa"}
                </h1>
                <p className="text-sm theme-text-secondary mt-0.5">
                  Rincian instruksi tugas, daftar berkas jawaban siswa, serta pemberian nilai.
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

              {tugas && (
                <>
                  <Link
                    href={`/admin/lms-cbt/tugas-siswa/${id}/edit`}
                    className="
                      inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)]
                      text-white rounded-lg text-sm font-medium hover:opacity-90
                      transition shadow-sm
                    "
                  >
                    <Pencil size={15} />
                    <span>Edit Tugas</span>
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
                    title="Hapus Tugas"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Hapus</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-6 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] flex items-start gap-3 text-sm text-[var(--color-danger)]">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Gagal Memuat Detail Tugas</p>
                <p className="mt-1">{error}</p>
                <Link
                  href="/admin/lms-cbt/tugas-siswa"
                  className="inline-block mt-3 px-3.5 py-1.5 bg-[var(--color-danger)] text-white rounded-md text-xs font-medium hover:opacity-90 transition"
                >
                  Kembali ke Daftar Tugas
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
                Memuat rincian tugas dan berkas pengumpulan siswa...
              </p>
            </div>
          ) : tugas ? (
            <div className="space-y-6">
              <div className="w-full p-6 rounded-xl theme-card border theme-border shadow-sm space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`
                          inline-flex items-center gap-1.5 px-3 py-1
                          rounded-full text-xs font-medium border
                          ${
                            isLewatTenggat
                              ? "bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)] border-[color-mix(in_srgb,var(--color-danger)_25%,transparent)]"
                              : "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]"
                          }
                        `}
                      >
                        <Clock3 size={13} />
                        {isLewatTenggat ? "Lewat Tenggat" : "Sedang Berjalan"}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold theme-text mt-2">
                      {tugas.judul}
                    </h2>
                    <p className="text-xs theme-text-secondary mt-1.5 max-w-3xl leading-relaxed whitespace-pre-line">
                      {tugas.deskripsi || "Tidak ada deskripsi instruksi pengerjaan tugas."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t theme-border-soft text-xs">
                  <div>
                    <span className="theme-text-muted block text-[11px] mb-0.5">
                      Kelas:
                    </span>
                    <span className="font-semibold theme-text flex items-center gap-1.5">
                      <GraduationCap size={14} className="theme-text-muted" />
                      {tugas.kelasMapel?.kelas?.nama || "-"}
                    </span>
                  </div>

                  <div>
                    <span className="theme-text-muted block text-[11px] mb-0.5">
                      Mata Pelajaran:
                    </span>
                    <span className="font-semibold theme-text flex items-center gap-1.5">
                      <BookOpen size={14} className="theme-text-muted" />
                      {tugas.kelasMapel?.mataPelajaran?.nama || "-"}
                    </span>
                  </div>

                  <div>
                    <span className="theme-text-muted block text-[11px] mb-0.5">
                      Batas Waktu (Tenggat):
                    </span>
                    <span className="font-semibold theme-text flex items-center gap-1.5">
                      <CalendarDays size={14} className="theme-text-muted" />
                      {formatTanggal(tugas.batasWaktu)}
                    </span>
                  </div>

                  <div>
                    <span className="theme-text-muted block text-[11px] mb-0.5">
                      Total Pengumpulan:
                    </span>
                    <span className="font-semibold text-[var(--color-primary)] flex items-center gap-1.5">
                      <Users size={14} />
                      {pengumpulan.length} Berkas Siswa
                    </span>
                  </div>
                </div>
              </div>

              {activeGrading && (
                <div className="w-full p-6 rounded-xl theme-card border-2 border-[var(--color-primary)] shadow-md animate-scaleUp space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b theme-border">
                    <div className="flex items-center gap-2">
                      <Award size={20} className="text-[var(--color-primary)]" />
                      <h3 className="font-bold theme-text text-base">
                        Input Penilaian Siswa: {activeGrading.siswa?.namaLengkap || activeGrading.pengguna?.namaLengkap || "Siswa"}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveGrading(null)}
                      className="p-1.5 rounded-lg theme-text-muted hover:theme-text hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {gradeError && (
                    <div className="p-3 rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-xs text-[var(--color-danger)] flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span>{gradeError}</span>
                    </div>
                  )}

                  {gradeSuccess && (
                    <div className="p-3 rounded-lg border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-xs text-[var(--color-success)] flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      <span>{gradeSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveGrade} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
                        Nilai (0 - 100) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        required
                        value={gradeNilai}
                        onChange={(e) => setGradeNilai(e.target.value)}
                        placeholder="Contoh: 85"
                        className="theme-input w-full px-3.5 py-2.5 border theme-border rounded-lg text-sm theme-text outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] focus:border-[var(--color-primary)]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1.5">
                        Catatan / Umpan Balik Guru
                      </label>
                      <input
                        type="text"
                        value={gradeCatatan}
                        onChange={(e) => setGradeCatatan(e.target.value)}
                        placeholder="Catatan evaluasi untuk siswa..."
                        className="theme-input w-full px-3.5 py-2.5 border theme-border rounded-lg text-sm theme-text outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] focus:border-[var(--color-primary)]"
                      />
                    </div>

                    <div className="md:col-span-3 flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveGrading(null)}
                        className="px-4 py-2 border theme-border rounded-lg text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={submittingNilai}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                      >
                        {submittingNilai && <Loader2 size={15} className="animate-spin" />}
                        <span>{submittingNilai ? "Menyimpan..." : "Simpan Nilai"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="w-full theme-card border theme-border rounded-xl p-5 md:p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText size={20} className="text-[var(--color-primary)]" />
                    <h3 className="font-bold theme-text text-base">
                      Pengumpulan Jawaban Siswa ({pengumpulan.length})
                    </h3>
                  </div>
                  <span className="text-xs theme-text-muted">
                    Klik tombol Beri Nilai untuk mengevaluasi jawaban siswa secara langsung
                  </span>
                </div>

                {pengumpulan.length === 0 ? (
                  <div className="p-10 text-center border theme-border rounded-xl theme-card-soft">
                    <Users
                      size={40}
                      className="mx-auto mb-2 theme-text-muted opacity-40"
                    />
                    <h4 className="font-semibold theme-text text-sm">
                      Belum Ada Siswa Mengumpulkan
                    </h4>
                    <p className="text-xs theme-text-muted mt-1">
                      Siswa pada kelas ini belum mengunggah jawaban untuk tugas terkait.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="theme-card-soft border-b theme-border text-xs font-semibold theme-text-secondary uppercase tracking-wider">
                          <th className="px-4 py-3.5 w-12 text-center">No</th>
                          <th className="px-4 py-3.5">Nama Siswa</th>
                          <th className="px-4 py-3.5">Waktu Pengumpulan</th>
                          <th className="px-4 py-3.5">Berkas Jawaban</th>
                          <th className="px-4 py-3.5">Catatan Siswa</th>
                          <th className="px-4 py-3.5 text-center">Nilai</th>
                          <th className="px-4 py-3.5 text-center w-36">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y theme-border text-sm">
                        {pengumpulan.map((p, idx) => {
                          const namaSiswa =
                            p.siswa?.namaLengkap ||
                            p.pengguna?.namaLengkap ||
                            "Siswa Tanpa Nama";
                          const nisnSiswa =
                            p.siswa?.nisn || p.pengguna?.nisn || "-";

                          return (
                            <tr
                              key={p.id || idx}
                              className="hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] transition"
                            >
                              <td className="px-4 py-3 text-center theme-text-muted text-xs">
                                {idx + 1}
                              </td>

                              <td className="px-4 py-3">
                                <div className="font-semibold theme-text">
                                  {namaSiswa}
                                </div>
                                <div className="text-xs theme-text-muted mt-0.5">
                                  NISN: {nisnSiswa}
                                </div>
                              </td>

                              <td className="px-4 py-3 text-xs theme-text-secondary">
                                {formatTanggal(p.dibuatPada || p.waktuPengumpulan)}
                              </td>

                              <td className="px-4 py-3">
                                {p.urlFile ? (
                                  <a
                                    href={p.urlFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] hover:opacity-80 transition"
                                  >
                                    <ExternalLink size={13} />
                                    <span>Buka Berkas</span>
                                  </a>
                                ) : (
                                  <span className="text-xs theme-text-muted">
                                    Tidak ada file
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-3 text-xs theme-text-secondary max-w-xs truncate">
                                {p.catatan || "-"}
                              </td>

                              <td className="px-4 py-3 text-center">
                                {p.nilai !== null && p.nilai !== undefined ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)] border border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]">
                                    {p.nilai}
                                  </span>
                                ) : (
                                  <span className="text-xs theme-text-muted">
                                    Belum dinilai
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleStartGrade(p)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border theme-border hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)] transition"
                                >
                                  <Award size={14} />
                                  <span>{p.nilai !== null && p.nilai !== undefined ? "Ubah Nilai" : "Beri Nilai"}</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {showDeleteModal && tugas && (
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
              Hapus tugas ini dari sistem?
            </h3>

            <p className="text-sm theme-text-secondary mt-2 leading-relaxed">
              Tugas <span className="font-semibold theme-text">{tugas.judul}</span> akan dinonaktifkan.
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
                <span>{deleting ? "Menghapus..." : "Hapus Tugas"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
