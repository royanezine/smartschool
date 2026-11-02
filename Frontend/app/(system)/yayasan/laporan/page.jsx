"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  BookOpen,
  GraduationCap,
  Package,
  UserSquare2,
  ChevronRight,
  Sparkles,

  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getLaporanOverview } from "@/services/yayasan.service";


const categories = [
  {
    key: "akademik",
    title: "Akademik",
    desc: "Rekap nilai, kehadiran, dan capaian belajar per unit sekolah",
    icon: BookOpen,
    color: "primary",
    path: "/yayasan/laporan/akademik",
    stat: "-",
  },
  {
    key: "guru",
    title: "Guru",
    desc: "Rekap kinerja, kehadiran, dan beban mengajar tenaga pendidik",
    icon: GraduationCap,
    color: "info",
    path: "/yayasan/laporan/guru",
    stat: "-",
  },
  {
    key: "iventaris",
    title: "Inventaris",
    desc: "Kondisi aset dan sarana-prasarana tiap unit sekolah",
    icon: Package,
    color: "warning",
    path: "/yayasan/laporan/iventaris",
    stat: "-",
  },
  {
    key: "siswa",
    title: "Siswa",
    desc: "Rekap data induk, mutasi, dan demografi siswa lintas unit",
    icon: UserSquare2,
    color: "success",
    path: "/yayasan/laporan/siswa",
    stat: "-",
  },
];

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_22%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_22%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";


const categoryTheme = {
  primary: {
    surface: themePrimarySoft,
    border: themePrimarySoftBorder,
    text: "text-[var(--color-primary)]",
    hoverBorder: "hover:border-[color-mix(in_srgb,var(--color-primary)_38%,transparent)]",
    ring: "group-hover:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
    decoration: "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]",
  },
  info: {
    surface: themeInfoSurface,
    border: themeInfoBorder,
    text: "text-[var(--color-info)]",
    hoverBorder: "hover:border-[color-mix(in_srgb,var(--color-info)_38%,transparent)]",
    ring: "group-hover:ring-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",
    decoration: "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]",
  },
  warning: {
    surface: themeWarningSurface,
    border: themeWarningBorder,
    text: "text-[var(--color-warning)]",
    hoverBorder: "hover:border-[color-mix(in_srgb,var(--color-warning)_38%,transparent)]",
    ring: "group-hover:ring-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]",
    decoration: "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]",
  },
  success: {
    surface: themeSuccessSurface,
    border: themeSuccessBorder,
    text: "text-[var(--color-success)]",
    hoverBorder: "hover:border-[color-mix(in_srgb,var(--color-success)_38%,transparent)]",
    ring: "group-hover:ring-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
    decoration: "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]",
  },
};

export default function LaporanYayasanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSekolah: 0,
    totalGuru: 0,
    totalSiswa: 0,
    sekolahCount: 0,
  });

  const processOverview = useCallback((res) => {
    const d = res?.data || {};
    const totalSekolah = Number(d.totalSekolah) || 0;
    const sekolahData = d.sekolah || {};
    const sekolahList = Array.isArray(sekolahData.items)
      ? sekolahData.items
      : Array.isArray(sekolahData)
      ? sekolahData
      : [];
    const totalSiswa = sekolahList.reduce(
      (acc, s) => acc + (s.statistik?.totalSiswa || 0), 0
    );
    const totalGuru = sekolahList.reduce(
      (acc, s) => acc + (s.statistik?.totalGuru || 0), 0
    );
    setStats({ totalSekolah, totalGuru, totalSiswa, sekolahCount: sekolahList.length });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getLaporanOverview();
      processOverview(res);
    } catch (err) {
      setError(err?.message || "Gagal memuat ringkasan laporan yayasan.");
    } finally {
      setLoading(false);
    }
  }, [processOverview]);

  useEffect(() => {
    let active = true;
    getLaporanOverview()
      .then((res) => { if (active) processOverview(res); })
      .catch((err) => { if (active) setError(err?.message || "Gagal memuat ringkasan laporan yayasan."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [processOverview]);

  const dynamicCategories = categories.map((cat) => {
    let statText = cat.stat;
    if (cat.key === "akademik") statText = `${stats.totalSekolah} unit sekolah`;
    else if (cat.key === "guru") statText = `${stats.totalGuru} guru terdata`;
    else if (cat.key === "iventaris") statText = `${stats.sekolahCount} unit sekolah`;
    else if (cat.key === "siswa") statText = `${stats.totalSiswa} siswa terdata`;
    return { ...cat, stat: statText };
  });

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1800px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} flex-shrink-0`}>
                <FileText size={18} />
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">Laporan & Analitik</h1>
            </div>
            <p className="theme-text-secondary text-sm mt-1 ml-[42px] flex items-center gap-1.5">
              <Sparkles size={14} className="theme-text-muted flex-shrink-0" />
              <span className="truncate">Pilih kategori laporan yang ingin dilihat lebih detail.</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] p-4 flex items-start gap-3">
            <AlertCircle className="text-[var(--color-warning)] shrink-0 mt-0.5" size={18} />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[var(--color-warning)]">Gagal Memuat Data</h4>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">{error}</p>
            </div>
            <button type="button" onClick={fetchData} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline flex-shrink-0">
              <RefreshCw size={12} /> Coba Lagi
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dynamicCategories.map((item) => {
            const Icon = item.icon;
            const c = categoryTheme[item.color];
            return (
              <button key={item.key} onClick={() => router.push(item.path)} className={`group text-left theme-card rounded-2xl border ${c.border} ${c.hoverBorder} p-5 sm:p-6 ${themeCardShadow} hover:shadow-[0_12px_32px_color-mix(in_srgb,var(--color-text)_9%,transparent)] transition-all duration-300 relative overflow-hidden min-w-0`}>
                <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full ${c.decoration} opacity-70`} />
                <div className="relative min-w-0">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 sm:p-3.5 rounded-xl ${c.surface} ${c.text} ring-4 ring-transparent ${c.ring} transition-all duration-300 flex-shrink-0`}>
                      <Icon size={22} />
                    </div>
                    <ChevronRight size={20} className="theme-text-muted group-hover:text-[var(--color-primary)] group-hover:translate-x-0.5 transition-all duration-300 mt-1 flex-shrink-0" />
                  </div>
                  <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-semibold theme-text truncate">{item.title}</h3>
                  <p className="mt-1.5 theme-text-secondary text-sm leading-relaxed line-clamp-2">{item.desc}</p>
                  <div className={`mt-4 inline-flex items-center text-xs font-medium ${c.text} ${c.surface} px-2.5 py-1 rounded-full max-w-full truncate`}>
                    {loading ? (
                      <span className="flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Memuat...</span>
                    ) : item.stat}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
