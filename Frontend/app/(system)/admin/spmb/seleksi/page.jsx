"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  FileCheck2,
  GraduationCap,
  Info,
  Loader2,
  MapPin,
  RefreshCw,
  Route,
  Search,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { getPengaturanSpmb, getRankingJalur } from "@/services/ppdb.service";
import { getJalurPpdb } from "@/services/jalurPpdb.service";
import { formatAngka, formatNilai } from "@/lib/spmb";

const LIMIT_SELEKSI = 20;

const themePrimaryText = "text-[var(--color-primary)]";
const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";
const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";
const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";
const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";
const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";
const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";
const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

function SeleksiSpmbContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramJalurId = searchParams.get("jalurId") || "";

  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [halaman, setHalaman] = useState(1);

  const [jalurList, setJalurList] = useState([]);
  const [selectedJalurId, setSelectedJalurId] = useState(paramJalurId);
  const [rankingData, setRankingData] = useState(null);
  const [pengaturan, setPengaturan] = useState(null);

  const [loadingJalur, setLoadingJalur] = useState(true);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [is404, setIs404] = useState(false);

  // 1. Muat daftar Jalur SPMB & Pengaturan SPMB
  const initData = useCallback(async () => {
    try {
      setLoadingJalur(true);
      setError("");

      const [resJalur, resPengaturan] = await Promise.all([
        getJalurPpdb(),
        getPengaturanSpmb().catch(() => null),
      ]);

      const list = Array.isArray(resJalur?.data)
        ? resJalur.data
        : Array.isArray(resJalur)
        ? resJalur
        : [];
      setJalurList(list);

      if (resPengaturan?.data) {
        setPengaturan(resPengaturan.data);
      }

      // Tentukan jalur yang dipilih
      if (list.length > 0) {
        const found = list.some((item) => item.id === paramJalurId);
        setSelectedJalurId(found ? paramJalurId : list[0].id);
      }
    } catch (err) {
      console.error("Gagal memuat jalur PPDB:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat daftar jalur PPDB."
      );
    } finally {
      setLoadingJalur(false);
    }
  }, [paramJalurId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initData();
  }, [initData]);

  // 2. Muat Ranking Jalur dari Endpoint Resmi GET /api/ppdb/jalur/:id/ranking
  const loadRanking = useCallback(async (jalurId, isRefresh = false) => {
    if (!jalurId) {
      setRankingData(null);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoadingRanking(true);
      }
      setError("");
      setIs404(false);

      const res = await getRankingJalur(jalurId);

      if (!res?.success || !res?.data) {
        throw new Error(res?.message || "Gagal memuat data ranking jalur.");
      }

      setRankingData(res.data);
      setHalaman(1);
    } catch (err) {
      console.error("Gagal memuat ranking:", err);
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memuat ranking.";
      setError(msg);
      if (
        msg.toLowerCase().includes("tidak ditemukan") ||
        (err && err.status === 404)
      ) {
        setIs404(true);
      }
      setRankingData(null);
    } finally {
      setLoadingRanking(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (selectedJalurId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadRanking(selectedJalurId);
    }
  }, [selectedJalurId, loadRanking]);

  // Handle ganti jalur
  const handlePilihJalur = (id) => {
    setSelectedJalurId(id);
    router.replace(`/admin/spmb/seleksi?jalurId=${encodeURIComponent(id)}`);
  };

  // Data baris ranking terfilter (TANPA SORT MANUAL — urutan ranking Backend adalah kebenaran)
  const baris = useMemo(() => {
    if (!rankingData?.daftar || !Array.isArray(rankingData.daftar)) {
      return [];
    }

    let list = rankingData.daftar;

    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      list = list.filter(
        (item) =>
          String(item.namaLengkap || "").toLowerCase().includes(kw) ||
          String(item.nomorPendaftaran || "").toLowerCase().includes(kw)
      );
    }

    if (filterStatus === "Masuk Kuota") {
      list = list.filter((item) => item.masukKuota);
    } else if (filterStatus === "Di Luar Kuota") {
      list = list.filter((item) => !item.masukKuota);
    } else if (filterStatus === "Berkas Kurang") {
      list = list.filter((item) => !item.berkasLengkap);
    } else if (filterStatus === "Tidak Memenuhi Kriteria") {
      list = list.filter((item) => !item.memenuhiKriteria);
    }

    return list;
  }, [rankingData, search, filterStatus]);

  const totalHalaman = Math.max(1, Math.ceil(baris.length / LIMIT_SELEKSI));
  const halamanAktif = Math.min(halaman, totalHalaman);

  const barisHalaman = useMemo(() => {
    const mulai = (halamanAktif - 1) * LIMIT_SELEKSI;
    return baris.slice(mulai, mulai + LIMIT_SELEKSI);
  }, [baris, halamanAktif]);

  // Statistik dari response Backend
  const totalPendaftar = rankingData?.totalPendaftar ?? 0;
  const kuotaJalur = rankingData?.kuota ?? 0;
  const masukKuotaCount =
    rankingData?.daftar?.filter((item) => item.masukKuota).length ?? 0;
  const memenuhiKriteriaCount =
    rankingData?.daftar?.filter((item) => item.memenuhiKriteria).length ?? 0;
  const berkasKurangCount =
    rankingData?.daftar?.filter((item) => !item.berkasLengkap).length ?? 0;

  const rankingTerbuka = Boolean(pengaturan?.rankingTerbuka);

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="spmb"
        setActive={() => {}}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
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
            {/* Header & Aksi */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                >
                  <GraduationCap size={21} />
                </div>
                <div>
                  <h1 className="theme-text text-xl font-bold sm:text-2xl">
                    Seleksi & Pemeringkatan SPMB
                  </h1>
                  <p className="theme-text-secondary mt-1 text-sm leading-6">
                    Hasil pemeringkatan seleksi resmi peserta didik terintegrasi langsung dengan server backend.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadRanking(selectedJalurId, true)}
                  disabled={refreshing || !selectedJalurId}
                  className={`${themePrimaryGradient} inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-[var(--color-card)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {refreshing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  Refresh Ranking
                </button>
              </div>
            </div>

            {/* Banner Status Publikasi Ranking (Kondisi 1 & 2: Terbuka vs Tidak Terbuka) */}
            {pengaturan && (
              <div
                className={`mb-5 flex items-start gap-3 rounded-xl border p-4 ${
                  rankingTerbuka
                    ? "border-[color-mix(in_srgb,var(--color-success)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]"
                    : "border-[color-mix(in_srgb,var(--color-warning)_32%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]"
                }`}
              >
                {rankingTerbuka ? (
                  <Eye size={18} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                ) : (
                  <EyeOff size={18} className="mt-0.5 shrink-0 text-[var(--color-warning)]" />
                )}
                <div className="flex-1 text-xs">
                  <p className="font-bold theme-text">
                    {rankingTerbuka
                      ? "Publikasi Ranking Terbuka"
                      : "Publikasi Ranking Belum Dibuka untuk Umum"}
                  </p>
                  <p className="theme-text-secondary mt-0.5 leading-relaxed">
                    {rankingTerbuka
                      ? "Peringkat seleksi saat ini dipublikasikan secara terbuka dan dapat dipantau oleh calon peserta didik melalui portal PPDB."
                      : "Peringkat seleksi saat ini berstatus tertutup di Pengaturan SPMB. Data di bawah ini adalah pratinjau ranking internal yang hanya terlihat oleh Admin."}
                  </p>
                </div>
                <Link
                  href="/admin/spmb/pengaturan"
                  className="theme-card theme-border shrink-0 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition hover:opacity-80"
                >
                  Ubah Pengaturan
                </Link>
              </div>
            )}

            {/* Pilihan Jalur SPMB */}
            {loadingJalur ? (
              <div className="theme-card theme-border flex items-center gap-2 rounded-xl border p-4 mb-5">
                <Loader2 size={16} className="animate-spin text-[var(--color-primary)]" />
                <span className="theme-text-muted text-xs">Memuat daftar jalur SPMB...</span>
              </div>
            ) : jalurList.length === 0 ? (
              <div className="theme-card theme-border rounded-xl border p-6 text-center mb-5">
                <Route size={24} className="mx-auto theme-text-muted mb-2" />
                <p className="theme-text text-sm font-semibold">Belum Ada Jalur Pendaftaran</p>
                <p className="theme-text-muted text-xs mt-1">
                  Sekolah belum memiliki jalur SPMB aktif. Buat jalur terlebih dahulu untuk melihat ranking seleksi.
                </p>
                <Link
                  href="/admin/spmb/jalur/tambah"
                  className={`${themePrimaryGradient} mt-3 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-[var(--color-card)]`}
                >
                  Tambah Jalur SPMB
                </Link>
              </div>
            ) : (
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
                <label htmlFor="pilih-jalur" className="theme-text text-xs font-semibold shrink-0">
                  Pilih Jalur Seleksi:
                </label>
                <div className="flex flex-1 flex-wrap gap-2">
                  {jalurList.map((j) => {
                    const isSelected = j.id === selectedJalurId;
                    return (
                      <button
                        key={j.id}
                        type="button"
                        onClick={() => handlePilihJalur(j.id)}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                          isSelected
                            ? `${themePrimaryGradient} border-transparent text-[var(--color-card)] shadow-sm`
                            : `theme-card theme-border theme-text ${themeNeutralHover}`
                        }`}
                      >
                        <Route size={14} />
                        <span>{j.nama}</span>
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] theme-text-muted"
                          }`}
                        >
                          Kuota: {j.kuota}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error State (Kondisi 3 & 5: Jalur 404 / Error API) */}
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] p-4">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-[var(--color-danger)]" />
                <div className="flex-1 text-xs">
                  <p className="font-bold theme-text">
                    {is404 ? "Jalur Tidak Ditemukan (404)" : "Gagal Memuat Ranking"}
                  </p>
                  <p className="theme-text-secondary mt-0.5 leading-relaxed">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => loadRanking(selectedJalurId)}
                  className="theme-card theme-border rounded-lg border px-3 py-1 text-xs font-medium"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Loading Ranking State */}
            {loadingRanking ? (
              <div className="theme-card theme-border flex min-h-[300px] flex-col items-center justify-center rounded-2xl border p-8">
                <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
                <p className="theme-text-muted mt-3 text-xs font-medium">
                  Mengambil pemeringkatan resmi dari server backend...
                </p>
              </div>
            ) : rankingData ? (
              <>
                {/* Ringkasan Parameter & Snapshot Ranking dari Backend */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 mb-5">
                  <Stat title="Total Pendaftar" value={totalPendaftar} />
                  <Stat title="Daya Tampung / Kuota" value={kuotaJalur} />
                  <Stat
                    title="Masuk Kuota"
                    value={masukKuotaCount}
                    subtext={`Peringkat 1 s/d ${kuotaJalur}`}
                  />
                  <Stat
                    title="Memenuhi Kriteria"
                    value={memenuhiKriteriaCount}
                    subtext="Persyaratan lengkap"
                  />
                  <Stat
                    title="Metode Pemeringkatan"
                    value={
                      rankingData.metodeRanking === "jarak"
                        ? "Jarak Terdekat"
                        : "Nilai Rapor"
                    }
                    isText
                  />
                </div>

                {/* Filter & Tabel Ranking */}
                <div
                  className={`theme-card ${themeNeutralBorder} flex min-h-0 flex-col overflow-hidden rounded-xl border ${themeCardShadow}`}
                >
                  <div
                    className={`flex shrink-0 flex-col gap-3 border-b ${themeDivider} p-4 sm:flex-row sm:items-center sm:justify-between`}
                  >
                    <div className="relative flex-1">
                      <Search
                        size={15}
                        className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2"
                      />
                      <input
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setHalaman(1);
                        }}
                        placeholder="Cari nama siswa atau nomor pendaftaran..."
                        className={`theme-input theme-text theme-neutral-border h-9 w-full rounded-lg border ${themeNeutralSurface} pl-9 pr-3 text-xs outline-none transition ${themeFocus}`}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => {
                          setFilterStatus(e.target.value);
                          setHalaman(1);
                        }}
                        className={`theme-input theme-text theme-neutral-border h-9 rounded-lg border ${themeNeutralSurface} px-3 text-xs outline-none transition ${themeFocus}`}
                      >
                        <option value="Semua">Semua Hasil Seleksi</option>
                        <option value="Masuk Kuota">Hanya Masuk Kuota</option>
                        <option value="Di Luar Kuota">Di Luar Kuota</option>
                        <option value="Berkas Kurang">Berkas Belum Lengkap</option>
                        <option value="Tidak Memenuhi Kriteria">Tidak Memenuhi Kriteria</option>
                      </select>
                    </div>
                  </div>

                  {/* Kondisi 4: Response Kosong */}
                  {baris.length === 0 ? (
                    <div className="px-6 py-14 text-center">
                      <GraduationCap size={28} className="theme-text-muted mx-auto" />
                      <h2 className="theme-text mt-3 text-sm font-bold">
                        {rankingData.daftar.length === 0
                          ? "Belum ada pendaftar pada jalur ini"
                          : "Tidak ada peserta yang sesuai dengan filter pencarian"}
                      </h2>
                      <p className="theme-text-muted mx-auto mt-1 max-w-md text-xs leading-5">
                        {rankingData.daftar.length === 0
                          ? "Peserta yang mendaftar pada jalur ini akan otomatis diproses pemeringkatannya oleh server."
                          : "Ubah kata kunci pencarian atau sesuaikan filter untuk melihat calon peserta didik."}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[960px]">
                        <thead>
                          <tr className={`border-b ${themeDivider} ${themeNeutralSurface}`}>
                            <Th>Peringkat</Th>
                            <Th>Nomor & Nama Peserta</Th>
                            <Th>Jarak Rumah</Th>
                            <Th>Nilai Rapor</Th>
                            <Th>Kelengkapan Berkas</Th>
                            <Th>Kriteria Seleksi</Th>
                            <Th>Status Penerimaan</Th>
                          </tr>
                        </thead>

                        <tbody>
                          {barisHalaman.map((item) => {
                            const isZonasi = rankingData.metodeRanking === "jarak";
                            return (
                              <tr
                                key={item.id || item.nomorPendaftaran}
                                className={`border-b ${themeDivider} last:border-0 ${themeNeutralHover}`}
                              >
                                {/* Peringkat */}
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-xs font-bold ${
                                      item.masukKuota
                                        ? "bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]"
                                        : "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] theme-text-muted"
                                    }`}
                                  >
                                    #{item.peringkat}
                                  </span>
                                </td>

                                {/* Calon Peserta */}
                                <td className="px-4 py-3">
                                  <p className="theme-text text-xs font-semibold">
                                    {item.namaLengkap}
                                  </p>
                                  <p className="theme-text-muted font-mono text-[11px]">
                                    {item.nomorPendaftaran}
                                  </p>
                                </td>

                                {/* Jarak */}
                                <td className="px-4 py-3 text-xs">
                                  {item.jarakKm !== null && item.jarakKm !== undefined ? (
                                    <span
                                      className={`inline-flex items-center gap-1 font-medium ${
                                        isZonasi ? "font-bold theme-text" : "theme-text-secondary"
                                      }`}
                                    >
                                      <MapPin size={13} className="text-[var(--color-primary)]" />
                                      {item.jarakKm} km
                                    </span>
                                  ) : (
                                    <span className="theme-text-muted text-xs">-</span>
                                  )}
                                </td>

                                {/* Nilai Rapor */}
                                <td className="px-4 py-3 text-xs">
                                  {item.nilaiRapor !== null && item.nilaiRapor !== undefined ? (
                                    <span
                                      className={`font-medium ${
                                        !isZonasi ? "font-bold theme-text" : "theme-text-secondary"
                                      }`}
                                    >
                                      {formatNilai(item.nilaiRapor)}
                                    </span>
                                  ) : (
                                    <span className="theme-text-muted text-xs">-</span>
                                  )}
                                </td>

                                {/* Kelengkapan Berkas */}
                                <td className="px-4 py-3 text-xs">
                                  {item.berkasLengkap ? (
                                    <span className="inline-flex items-center gap-1 rounded-md border border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-success)]">
                                      <CheckCircle2 size={12} />
                                      Lengkap
                                    </span>
                                  ) : (
                                    <div className="flex flex-col gap-0.5">
                                      <span className="inline-flex items-center gap-1 rounded-md border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-danger)]">
                                        <XCircle size={12} />
                                        Kurang
                                      </span>
                                      {Array.isArray(item.berkasKurang) && item.berkasKurang.length > 0 && (
                                        <span className="theme-text-muted text-[10px]">
                                          {item.berkasKurang.join(", ")}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </td>

                                {/* Status Kriteria */}
                                <td className="px-4 py-3 text-xs">
                                  {item.memenuhiKriteria ? (
                                    <span className="inline-flex items-center gap-1 rounded-md border border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-success)]">
                                      <CheckCircle2 size={12} />
                                      Memenuhi Syarat
                                    </span>
                                  ) : (
                                    <div className="flex flex-col gap-0.5">
                                      <span className="inline-flex items-center gap-1 rounded-md border border-[color-mix(in_srgb,var(--color-warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-warning)]">
                                        <AlertTriangle size={12} />
                                        Tidak Memenuhi
                                      </span>
                                      {Array.isArray(item.alasanTidakMemenuhi) &&
                                        item.alasanTidakMemenuhi.length > 0 && (
                                          <span className="theme-text-muted text-[10px] max-w-[200px] truncate" title={item.alasanTidakMemenuhi.join(", ")}>
                                            {item.alasanTidakMemenuhi.join(", ")}
                                          </span>
                                        )}
                                    </div>
                                  )}
                                </td>

                                {/* Status Penerimaan (Masuk Kuota vs Di Luar Kuota) */}
                                <td className="px-4 py-3 text-xs">
                                  {item.masukKuota ? (
                                    <span className="inline-flex items-center gap-1 rounded-md border border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-primary)]">
                                      <Award size={12} />
                                      Masuk Kuota
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-md border border-[color-mix(in_srgb,var(--color-text)_14%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] px-2.5 py-1 text-[10px] font-semibold theme-text-muted">
                                      Di Luar Kuota
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination */}
                  {baris.length > 0 && (
                    <div
                      className={`flex shrink-0 flex-col gap-2 border-t ${themeDivider} px-4 py-3 sm:flex-row sm:items-center sm:justify-between`}
                    >
                      <p className="theme-text-muted text-xs">
                        Menampilkan {barisHalaman.length} dari {formatAngka(baris.length)} peserta
                        {totalHalaman > 1 && ` • Halaman ${halamanAktif}/${totalHalaman}`}
                      </p>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setHalaman((v) => Math.max(1, v - 1))}
                          disabled={halamanAktif <= 1}
                          className={`theme-neutral-border theme-text-secondary flex h-8 w-8 items-center justify-center rounded-lg border transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          <ChevronLeft size={15} />
                        </button>
                        <span
                          className={`${themePrimaryGradient} inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold text-[var(--color-card)]`}
                        >
                          {halamanAktif}
                        </span>
                        <button
                          type="button"
                          onClick={() => setHalaman((v) => Math.min(totalHalaman, v + 1))}
                          disabled={halamanAktif >= totalHalaman}
                          className={`theme-neutral-border theme-text-secondary flex h-8 w-8 items-center justify-center rounded-lg border transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <Link
                    href={`/admin/spmb/jalur/${encodeURIComponent(selectedJalurId)}`}
                    className={`${themePrimaryText} inline-flex items-center gap-1 font-semibold hover:underline`}
                  >
                    Buka Detail Konfigurasi Jalur Ini &rarr;
                  </Link>

                  <Link
                    href="/admin/spmb/data-pendaftaran"
                    className="theme-text-secondary inline-flex items-center gap-1 hover:underline"
                  >
                    Buka Menu Verifikasi Berkas & Kelulusan
                  </Link>
                </div>
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

function Stat({ title, value, subtext, isText }) {
  return (
    <div className={`theme-card ${themeNeutralBorder} rounded-xl border p-4 ${themeCardShadow}`}>
      <p className="theme-text-muted text-xs font-medium">{title}</p>
      <p className="theme-text mt-1 text-2xl font-bold">
        {isText ? value : typeof value === "number" ? formatAngka(value) : value || "-"}
      </p>
      {subtext && <p className="theme-text-muted text-[10px] mt-1">{subtext}</p>}
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="theme-text-muted px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider">
      {children}
    </th>
  );
}

export default function SeleksiSpmbPage() {
  return (
    <Suspense
      fallback={
        <div className="theme-page flex h-screen w-full items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
        </div>
      }
    >
      <SeleksiSpmbContent />
    </Suspense>
  );
}
