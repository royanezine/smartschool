"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  FileCheck2,
  FileText,
  Link2,
  Loader2,
  MapPin,
  Pencil,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import TautanPendaftaranModal from "@/app/components/spmb/TautanPendaftaranModal";
import {
  hasPermission,
  subscribeAuth,
} from "@/lib/auth";
import {
  getJalurPpdbById,
  getRankingJalurPpdb,
} from "@/services/jalurPpdb.service";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimaryText = "text-[var(--color-primary)]";
const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";
const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";
const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

function formatNumber(n) {
  return Number(n || 0).toLocaleString("id-ID");
}

function formatTanggal(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTanggalWaktu(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPeriodeStatus(jalur) {
  if (!jalur?.tanggalMulai && !jalur?.tanggalSelesai) {
    return {
      label: "Periode Belum Diatur",
      color: "theme-text-muted bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]",
    };
  }

  const now = new Date();
  const start = jalur.tanggalMulai ? new Date(jalur.tanggalMulai) : null;
  const end = jalur.tanggalSelesai ? new Date(jalur.tanggalSelesai) : null;

  if (start && now < start) {
    return {
      label: "Akan Datang",
      color: "text-[var(--color-info)] bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)]",
    };
  }

  if (end && now > end) {
    return {
      label: "Periode Berakhir",
      color: "text-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)]",
    };
  }

  return {
    label: "Sedang Berlangsung",
    color: "text-[var(--color-success)] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)]",
  };
}

export default function DetailJalurPage() {
  const router = useRouter();
  const params = useParams();

  const id = useMemo(() => {
    if (!params?.id) return "";
    return Array.isArray(params.id) ? params.id[0] : String(params.id);
  }, [params]);

  const [collapsed, setCollapsed] = useState(false);
  const [jalur, setJalur] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const auth = useSyncExternalStore(
    subscribeAuth,
    () => {
      try {
        const raw = localStorage.getItem("auth");
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },
    () => null
  );

  const canUpdate = hasPermission(auth, "ppdb.update");

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!id) return;

      try {
        setError("");
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [response, rankingRes] = await Promise.all([
          getJalurPpdbById(id),
          getRankingJalurPpdb(id).catch(() => null),
        ]);

        if (!response?.success || !response?.data) {
          throw new Error(
            response?.message || "Gagal mengambil data detail jalur."
          );
        }

        setJalur(response.data);
        if (rankingRes?.success && rankingRes?.data) {
          setRanking(rankingRes.data);
        }
      } catch (err) {
        console.error("GET DETAIL JALUR ERROR:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil data detail jalur."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleCopyId = () => {
    if (jalur?.id && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(jalur.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const isAktif = String(jalur?.status || "").toLowerCase() === "aktif";
  const periode = getPeriodeStatus(jalur);

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="spmb"
        setActive={() => {}}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role="admin"
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={() => setCollapsed((v) => !v)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="w-full">
              {/* Header Navigation & Actions */}
              <div className="mb-6 flex flex-col gap-4">
                <Link
                  href="/admin/spmb/jalur"
                  className="theme-text-muted inline-flex w-fit items-center gap-2 text-sm font-medium transition hover:opacity-70"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Daftar Jalur
                </Link>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="theme-text-muted mb-2 flex items-center gap-2 text-xs">
                      <span>SPMB</span>
                      <span>/</span>
                      <Link
                        href="/admin/spmb/jalur"
                        className="transition hover:underline"
                      >
                        Jalur Pendaftaran
                      </Link>
                      <span>/</span>
                      <span className={`${themePrimaryText} font-medium`}>
                        Detail
                      </span>
                    </div>

                    <h1 className="theme-text text-2xl font-bold tracking-tight md:text-3xl">
                      Detail Jalur Pendaftaran
                    </h1>
                    <p className="theme-text-muted mt-1 text-sm">
                      Informasi lengkap konfigurasi, kuota, dan status jalur PPDB dari backend.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                      href={`/admin/spmb/seleksi?jalurId=${encodeURIComponent(id)}`}
                      className="theme-card theme-border inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition hover:opacity-80"
                    >
                      <Trophy size={15} className="text-[var(--color-primary)]" />
                      Ranking Seleksi
                    </Link>

                    <button
                      type="button"
                      onClick={() => setLinkOpen(true)}
                      disabled={!jalur?.id || !jalur?.sekolahId}
                      className="theme-card theme-border inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Link2 size={15} />
                      Tautan Pendaftaran
                    </button>

                    {canUpdate && (
                      <Link
                        href={`/admin/spmb/jalur/${encodeURIComponent(id)}/edit`}
                        className={`${themePrimaryGradient} inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold text-[var(--color-card)] transition hover:brightness-95`}
                      >
                        <Pencil size={14} />
                        Edit Jalur
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => loadData(true)}
                      disabled={refreshing}
                      className="theme-card theme-border inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RefreshCw
                        size={14}
                        className={refreshing ? "animate-spin" : ""}
                      />
                      {refreshing ? "Memuat..." : "Refresh"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="theme-danger mb-6 flex items-start gap-3 rounded-xl border p-4">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold">Terjadi Kesalahan</p>
                    <p className="mt-0.5">{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadData(false)}
                    className="theme-card theme-border rounded-lg border px-3 py-1 text-xs font-medium"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              {/* Loading State */}
              {loading ? (
                <div className="theme-card theme-border flex min-h-[380px] items-center justify-center rounded-2xl border p-8">
                  <div className="text-center">
                    <Loader2
                      size={32}
                      className="mx-auto animate-spin text-[var(--color-primary)]"
                    />
                    <p className="theme-text-muted mt-3 text-sm font-medium">
                      Mengambil data detail jalur dari server...
                    </p>
                  </div>
                </div>
              ) : jalur ? (
                /* Container Utama Tunggal & Menyatu */
                <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                  {/* Bagian 1: Identitas & Status Utama */}
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                          <Route size={24} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h2 className="theme-text text-xl font-bold sm:text-2xl">
                              {jalur.nama}
                            </h2>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                isAktif
                                  ? "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]"
                                  : "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] theme-text-muted"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isAktif
                                    ? "bg-[var(--color-success)]"
                                    : "bg-[var(--color-text-muted)]"
                                }`}
                              />
                              {isAktif ? "Aktif" : "Nonaktif"}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${periode.color}`}
                            >
                              {periode.label}
                            </span>
                          </div>

                          <p className="theme-text-secondary mt-2.5 max-w-3xl text-sm leading-relaxed">
                            {jalur.deskripsi ||
                              "Belum ada deskripsi yang ditambahkan untuk jalur pendaftaran ini."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bagian 2: Informasi Operasional & Kuota */}
                  <div className="border-t theme-border bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] p-6 sm:p-8">
                    <h3 className="theme-text text-xs font-semibold uppercase tracking-wider mb-5">
                      Rincian Operasional & Kuota
                    </h3>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {/* Kuota Penerimaan */}
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                          <Users size={18} />
                        </div>
                        <div>
                          <span className="theme-text-muted text-xs font-medium block">
                            Kuota Penerimaan
                          </span>
                          <span className="theme-text text-xl font-bold tracking-tight mt-0.5 block">
                            {formatNumber(jalur.kuota)}{" "}
                            <span className="text-xs font-normal theme-text-secondary">
                              Siswa
                            </span>
                          </span>
                          <span className="theme-text-muted text-[11px] mt-0.5 block">
                            Daya tampung maksimal peserta didik
                          </span>
                        </div>
                      </div>

                      {/* Tanggal Mulai */}
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] text-[var(--color-info)]">
                          <CalendarDays size={18} />
                        </div>
                        <div>
                          <span className="theme-text-muted text-xs font-medium block">
                            Tanggal Mulai
                          </span>
                          <span className="theme-text text-sm font-semibold mt-1 block">
                            {formatTanggal(jalur.tanggalMulai)}
                          </span>
                          <span className="theme-text-muted text-[11px] mt-0.5 block">
                            Awal periode pendaftaran dibuka
                          </span>
                        </div>
                      </div>

                      {/* Tanggal Selesai */}
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)]">
                          <Clock3 size={18} />
                        </div>
                        <div>
                          <span className="theme-text-muted text-xs font-medium block">
                            Tanggal Selesai
                          </span>
                          <span className="theme-text text-sm font-semibold mt-1 block">
                            {formatTanggal(jalur.tanggalSelesai)}
                          </span>
                          <span className="theme-text-muted text-[11px] mt-0.5 block">
                            Batas akhir penutupan pendaftaran
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bagian 2.5: Konfigurasi Seleksi & Persyaratan Berkas */}
                  <div className="border-t theme-border bg-[color-mix(in_srgb,var(--color-text)_1%,transparent)] p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-5">
                      <Sparkles size={16} className="text-[var(--color-primary)]" />
                      <h3 className="theme-text text-xs font-semibold uppercase tracking-wider">
                        Konfigurasi Seleksi & Persyaratan Berkas
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                      {/* Kategori */}
                      <div className="rounded-xl border theme-border p-4 theme-card">
                        <span className="theme-text-muted text-[11px] font-medium block">
                          Kategori Seleksi
                        </span>
                        <span className="theme-text text-sm font-bold capitalize mt-1 block">
                          {jalur.kategori || "Reguler"}
                        </span>
                      </div>

                      {/* Metode Ranking */}
                      <div className="rounded-xl border theme-border p-4 theme-card">
                        <span className="theme-text-muted text-[11px] font-medium block">
                          Metode Pemeringkatan
                        </span>
                        <span className="theme-text text-sm font-bold capitalize mt-1 block">
                          {jalur.metodeRanking === "jarak" ? "Jarak Terdekat" : "Nilai / Rapor"}
                        </span>
                      </div>

                      {/* Jarak Maksimal */}
                      <div className="rounded-xl border theme-border p-4 theme-card">
                        <span className="theme-text-muted text-[11px] font-medium block">
                          Radius Maksimal
                        </span>
                        <span className="theme-text text-sm font-bold mt-1 block">
                          {jalur.jarakMaksimalKm !== null && jalur.jarakMaksimalKm !== undefined
                            ? `${jalur.jarakMaksimalKm} Km`
                            : "Tanpa Batas Radius"}
                        </span>
                      </div>

                      {/* Nilai Minimal */}
                      <div className="rounded-xl border theme-border p-4 theme-card">
                        <span className="theme-text-muted text-[11px] font-medium block">
                          Ambang Nilai Minimal
                        </span>
                        <span className="theme-text text-sm font-bold mt-1 block">
                          {jalur.nilaiMinimal !== null && jalur.nilaiMinimal !== undefined
                            ? Number(jalur.nilaiMinimal).toLocaleString("id-ID")
                            : "Tanpa Ambang Nilai"}
                        </span>
                      </div>
                    </div>

                    {/* Berkas Wajib */}
                    <div>
                      <span className="theme-text-muted text-[11px] font-medium block mb-2">
                        Dokumen Berkas Wajib Calon Peserta
                      </span>
                      {Array.isArray(jalur.berkasWajib) && jalur.berkasWajib.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {jalur.berkasWajib.map((b) => (
                            <span
                              key={b}
                              className="inline-flex items-center gap-1.5 rounded-lg border theme-border bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] px-3 py-1 text-xs font-semibold theme-text"
                            >
                              <FileCheck2 size={13} className="text-[var(--color-primary)]" />
                              {b}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="theme-text-muted text-xs">
                          Tidak ada persyaratan berkas khusus.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bagian 2.6: Ringkasan Pemeringkatan & Ranking Calon Peserta */}
                  <div className="border-t theme-border p-6 sm:p-8">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Trophy
                          size={16}
                          className="text-[var(--color-primary)]"
                        />
                        <h3 className="theme-text text-xs font-semibold uppercase tracking-wider">
                          Pemeringkatan & Hasil Seleksi Jalur
                        </h3>
                      </div>
                      <Link
                        href={`/admin/spmb/seleksi?jalurId=${encodeURIComponent(id)}`}
                        className={`${themePrimaryText} inline-flex items-center gap-1 text-xs font-semibold hover:underline`}
                      >
                        Buka Seleksi & Pemeringkatan Lengkap &rarr;
                      </Link>
                    </div>

                    {ranking ? (
                      <div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
                          <div className={`theme-card ${themeNeutralBorder} rounded-xl border p-3`}>
                            <p className="theme-text-muted text-[11px]">Total Pendaftar</p>
                            <p className="theme-text text-lg font-bold mt-0.5">{ranking.totalPendaftar}</p>
                          </div>
                          <div className={`theme-card ${themeNeutralBorder} rounded-xl border p-3`}>
                            <p className="theme-text-muted text-[11px]">Daya Tampung Kuota</p>
                            <p className="theme-text text-lg font-bold mt-0.5">{ranking.kuota}</p>
                          </div>
                          <div className={`theme-card ${themeNeutralBorder} rounded-xl border p-3`}>
                            <p className="theme-text-muted text-[11px]">Masuk Kuota</p>
                            <p className="theme-text text-lg font-bold mt-0.5 text-[var(--color-primary)]">
                              {ranking.daftar?.filter((d) => d.masukKuota).length ?? 0}
                            </p>
                          </div>
                          <div className={`theme-card ${themeNeutralBorder} rounded-xl border p-3`}>
                            <p className="theme-text-muted text-[11px]">Metode Seleksi</p>
                            <p className="theme-text text-xs font-semibold mt-1.5">
                              {ranking.metodeRanking === "jarak" ? "Jarak Terdekat" : "Nilai Rapor"}
                            </p>
                          </div>
                        </div>

                        {ranking.daftar && ranking.daftar.length > 0 ? (
                          <div className="overflow-x-auto rounded-xl border theme-border">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className={`border-b theme-border ${themeNeutralSurface}`}>
                                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase theme-text-muted">Peringkat</th>
                                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase theme-text-muted">Nomor & Nama</th>
                                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase theme-text-muted">
                                    {ranking.metodeRanking === "jarak" ? "Jarak" : "Nilai Rapor"}
                                  </th>
                                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase theme-text-muted">Berkas</th>
                                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase theme-text-muted">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ranking.daftar.slice(0, 5).map((item) => (
                                  <tr key={item.id || item.nomorPendaftaran} className={`border-b theme-border last:border-0 ${themeNeutralHover}`}>
                                    <td className="px-3 py-2 font-bold">
                                      <span
                                        className={`inline-flex h-6 min-w-6 items-center justify-center rounded px-1.5 text-[11px] font-bold ${
                                          item.masukKuota
                                            ? "bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]"
                                            : "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] theme-text-muted"
                                        }`}
                                      >
                                        #{item.peringkat}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2">
                                      <p className="font-semibold theme-text">{item.namaLengkap}</p>
                                      <p className="theme-text-muted font-mono text-[10px]">{item.nomorPendaftaran}</p>
                                    </td>
                                    <td className="px-3 py-2">
                                      {ranking.metodeRanking === "jarak"
                                        ? (item.jarakKm !== null ? `${item.jarakKm} km` : "-")
                                        : (item.nilaiRapor !== null ? item.nilaiRapor : "-")}
                                    </td>
                                    <td className="px-3 py-2">
                                      {item.berkasLengkap ? (
                                        <span className="text-[10px] font-semibold text-[var(--color-success)]">Lengkap</span>
                                      ) : (
                                        <span className="text-[10px] text-[var(--color-danger)]">Kurang</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2">
                                      {item.masukKuota ? (
                                        <span className="inline-flex rounded bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
                                          Masuk Kuota
                                        </span>
                                      ) : (
                                        <span className="inline-flex rounded bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] px-2 py-0.5 text-[10px] font-semibold theme-text-muted">
                                          Di Luar Kuota
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="theme-text-muted text-xs italic">
                            Belum ada calon peserta yang mendaftar pada jalur ini.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="theme-text-muted text-xs italic">
                        Memuat data ranking pendaftar...
                      </p>
                    )}
                  </div>

                  {/* Bagian 3: Informasi Sistem & Audit (Menyatu di bagian bawah) */}
                  <div className="border-t theme-border p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldCheck
                        size={16}
                        className="text-[var(--color-primary)]"
                      />
                      <h3 className="theme-text text-xs font-semibold uppercase tracking-wider">
                        Informasi Sistem & Audit
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                      <div>
                        <span className="theme-text-muted block text-[11px]">
                          ID Jalur
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="font-mono text-xs theme-text break-all">
                            {jalur.id}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyId}
                            className="theme-text-muted transition hover:text-[var(--color-text)] shrink-0"
                            title="Salin ID Jalur"
                          >
                            {copiedId ? (
                              <Check
                                size={13}
                                className="text-[var(--color-success)]"
                              />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="theme-text-muted block text-[11px]">
                          ID Sekolah
                        </span>
                        <span className="font-mono text-xs theme-text break-all mt-1 block">
                          {jalur.sekolahId || "-"}
                        </span>
                      </div>

                      <div>
                        <span className="theme-text-muted block text-[11px]">
                          Dibuat Pada
                        </span>
                        <span className="theme-text font-medium mt-1 block">
                          {formatTanggalWaktu(jalur.dibuatPada)}
                        </span>
                      </div>

                      <div>
                        <span className="theme-text-muted block text-[11px]">
                          Terakhir Diperbarui
                        </span>
                        <span className="theme-text font-medium mt-1 block">
                          {formatTanggalWaktu(jalur.diperbaruiPada)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>

      <TautanPendaftaranModal
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        jalur={jalur}
      />
    </div>
  );
}
