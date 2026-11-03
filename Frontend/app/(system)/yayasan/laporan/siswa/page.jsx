"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  School,
  Venus,
  Mars,
  MapPin,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getLaporanSiswa } from "@/services/yayasan.service";


const JENJANG_OPTIONS = ["Semua Jenjang", "SD", "SMP", "SMA"];

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";


export default function DataSiswaPage() {
  const router = useRouter();

  const [jenjang, setJenjang] = useState(JENJANG_OPTIONS[0]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [perSekolah, setPerSekolah] = useState([]);
  const [ringkasan, setRingkasan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSiswa = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getLaporanSiswa();
      const d = res?.data || res || {};
      setRingkasan(d.ringkasan || null);
      setPerSekolah(Array.isArray(d.perSekolah) ? d.perSekolah : []);
    } catch (err) {
      setError(err?.message || "Gagal memuat data siswa.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getLaporanSiswa();
        if (cancelled) return;
        const d = res?.data || res || {};
        setRingkasan(d.ringkasan || null);
        setPerSekolah(Array.isArray(d.perSekolah) ? d.perSekolah : []);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Gagal memuat data siswa.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredSekolah = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return perSekolah.filter((s) => {
      const matchJenjang = jenjang === "Semua Jenjang" || s.jenjang === jenjang;
      const matchSearch = !keyword || s.namaSekolah?.toLowerCase().includes(keyword) || s.alamat?.toLowerCase().includes(keyword);
      return matchJenjang && matchSearch;
    });
  }, [perSekolah, jenjang, search]);

  const summary = useMemo(() => {
    if (jenjang === "Semua Jenjang" && !search.trim() && ringkasan) {
      return {
        totalSiswa: Number(ringkasan.totalSiswa) || 0,
        totalUnit: Number(ringkasan.totalUnit) || 0,
        laki: Number(ringkasan.totalLakiLaki) || 0,
        perempuan: Number(ringkasan.totalPerempuan) || 0,
      };
    }
    const totalSiswa = filteredSekolah.reduce((a, s) => a + (Number(s.total) || 0), 0);
    const laki = filteredSekolah.reduce((a, s) => a + (Number(s.lakiLaki) || 0), 0);
    const perempuan = filteredSekolah.reduce((a, s) => a + (Number(s.perempuan) || 0), 0);
    return { totalSiswa, totalUnit: filteredSekolah.length, laki, perempuan };
  }, [filteredSekolah, ringkasan, jenjang, search]);

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const handleDownload = () => {
    const header = ["Nama Sekolah", "Jenjang", "Alamat", "Laki-laki", "Perempuan", "Total"];
    const rows = filteredSekolah.map((s) => [s.namaSekolah, s.jenjang, s.alamat || "-", s.lakiLaki, s.perempuan, s.total]);
    const csv = [header, ...rows].map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "laporan-siswa-yayasan.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1800px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="space-y-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <button type="button" onClick={() => router.push("/yayasan/laporan")} className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors mb-1">
                <ChevronLeft size={13} /> Laporan & Analitik
              </button>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] ${themeSmallShadow} flex-shrink-0`}><Users size={18} /></div>
                <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">Data Siswa</h1>
              </div>
              <p className="theme-text-secondary text-sm mt-1 ml-[42px] flex items-center gap-1.5">
                <Sparkles size={14} className="text-[var(--color-primary)] flex-shrink-0" />
                <span className="truncate">Total siswa per unit sekolah — klik untuk lihat rincian.</span>
              </p>
            </div>
            <button type="button" onClick={handleDownload} disabled={loading || filteredSekolah.length === 0} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-[var(--color-primary)] text-[var(--color-card)] hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,var(--color-text))] transition-colors shadow-[0_4px_12px_color-mix(in_srgb,var(--color-primary)_16%,transparent)] whitespace-nowrap flex-shrink-0 disabled:opacity-50">
              <Download size={16} /> Unduh Laporan
            </button>
          </div>

          <div className={`theme-card rounded-xl border theme-border p-4 ${themeCardShadow}`}>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama sekolah..." className={`theme-input w-full pl-9 pr-3 py-2.5 text-sm rounded-lg transition-colors ${themeFocus} placeholder:text-[var(--color-text-placeholder)]`} />
              </div>
              <div className="relative flex-1 min-w-[160px]">
                <select value={jenjang} onChange={(e) => setJenjang(e.target.value)} className={`theme-input w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${themeFocus}`}>
                  {JENJANG_OPTIONS.map((j) => (<option key={j} value={j}>{j}</option>))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`theme-card rounded-xl border theme-border p-3.5 ${themeCardShadow} flex items-center gap-3 min-w-0`}>
              <div className={`p-2 rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder} text-[var(--color-primary)] flex-shrink-0`}><Users size={16} /></div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">Total Siswa</p>
                <p className="text-lg font-bold theme-text">{loading ? "..." : summary.totalSiswa.toLocaleString("id-ID")}</p>
              </div>
            </div>
            <div className={`theme-card rounded-xl border theme-border p-3.5 ${themeCardShadow} flex items-center gap-3 min-w-0`}>
              <div className="p-2 rounded-lg border bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)] border-[color-mix(in_srgb,var(--color-info)_22%,transparent)] text-[var(--color-info)] flex-shrink-0"><School size={16} /></div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">Unit Sekolah</p>
                <p className="text-lg font-bold theme-text">{loading ? "..." : summary.totalUnit}</p>
              </div>
            </div>
            <div className={`theme-card rounded-xl border theme-border p-3.5 ${themeCardShadow} flex items-center gap-3 min-w-0`}>
              <div className="p-2 rounded-lg border bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)] border-[color-mix(in_srgb,var(--color-info)_22%,transparent)] text-[var(--color-info)] flex-shrink-0"><Mars size={16} /></div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">Siswa Laki-laki</p>
                <p className="text-lg font-bold theme-text">{loading ? "..." : summary.laki.toLocaleString("id-ID")}</p>
              </div>
            </div>
            <div className={`theme-card rounded-xl border theme-border p-3.5 ${themeCardShadow} flex items-center gap-3 min-w-0`}>
              <div className="p-2 rounded-lg border bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] border-[color-mix(in_srgb,var(--color-warning)_22%,transparent)] text-[var(--color-warning)] flex-shrink-0"><Venus size={16} /></div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">Siswa Perempuan</p>
                <p className="text-lg font-bold theme-text">{loading ? "..." : summary.perempuan.toLocaleString("id-ID")}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold theme-text">Per Unit Sekolah</h3>
              <span className="text-xs theme-text-muted">{filteredSekolah.length} unit</span>
            </div>

            {loading ? (
              <div className={`theme-card rounded-xl border theme-border ${themeCardShadow} p-12 text-center`}>
                <Loader2 size={32} className="mx-auto text-[var(--color-primary)] animate-spin mb-3" />
                <p className="text-sm theme-text-muted">Memuat data siswa...</p>
              </div>
            ) : error ? (
              <div className={`theme-card rounded-xl border border-[var(--color-danger)]/20 ${themeCardShadow} p-8 text-center`}>
                <AlertCircle size={32} className="mx-auto text-[var(--color-danger)] mb-2" />
                <p className="text-sm font-medium theme-text">{error}</p>
                <button type="button" onClick={fetchSiswa} className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-primary)] text-white">
                  <RefreshCw size={12} /> Coba Lagi
                </button>
              </div>
            ) : filteredSekolah.length === 0 ? (
              <div className={`theme-card rounded-xl border theme-border ${themeCardShadow} p-10 text-center`}>
                <Users size={28} className="mx-auto text-[var(--color-text-placeholder)] mb-2" />
                <p className="text-sm theme-text-muted">Tidak ada sekolah yang cocok.</p>
              </div>
            ) : (
              filteredSekolah.map((s) => {
                const total = Number(s.total) || 0;
                const lk = Number(s.lakiLaki) || 0;
                const pr = Number(s.perempuan) || 0;
                const isOpen = expandedId === s.sekolahId;

                return (
                  <div key={s.sekolahId} className={`theme-card rounded-xl border theme-border ${themeCardShadow} overflow-hidden`}>
                    <button type="button" onClick={() => toggleExpand(s.sekolahId)} className={`w-full flex items-center justify-between gap-3 p-4 sm:p-5 ${themeNeutralHover} transition-colors text-left`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2.5 rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder} text-[var(--color-primary)] flex-shrink-0`}>
                          <School size={17} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold theme-text truncate">{s.namaSekolah}</p>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] border-[color-mix(in_srgb,var(--color-text)_12%,transparent)] text-[var(--color-text-muted)] flex-shrink-0">
                              {s.jenjang || "Umum"}
                            </span>
                          </div>
                          <p className="text-xs theme-text-muted truncate flex items-center gap-1 mt-0.5">
                            <MapPin size={11} className="flex-shrink-0" />
                            {s.alamat || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="hidden sm:flex items-center gap-3 text-xs theme-text-secondary">
                          <span className="flex items-center gap-1"><Mars size={12} className="text-[var(--color-info)]" />{lk}</span>
                          <span className="flex items-center gap-1"><Venus size={12} className="text-[var(--color-warning)]" />{pr}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold theme-text">{total.toLocaleString("id-ID")}</span>
                          <span className="text-xs theme-text-muted ml-1">siswa</span>
                        </div>
                        <ChevronRight size={16} className={`text-[var(--color-text-muted)] transition-transform flex-shrink-0 ${isOpen ? "rotate-90" : ""}`} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className={`border-t ${themeDivider} bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]`}>
                        <div className="p-4 sm:p-5 text-sm theme-text-muted flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-4 flex-wrap">
                            <span className="flex items-center gap-1.5"><Mars size={13} className="text-[var(--color-info)]" /> Laki-laki: <strong className="theme-text">{lk.toLocaleString("id-ID")}</strong></span>
                            <span className="flex items-center gap-1.5"><Venus size={13} className="text-[var(--color-warning)]" /> Perempuan: <strong className="theme-text">{pr.toLocaleString("id-ID")}</strong></span>
                          </div>
                          <span className="font-semibold theme-text whitespace-nowrap">{total.toLocaleString("id-ID")} Siswa</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
