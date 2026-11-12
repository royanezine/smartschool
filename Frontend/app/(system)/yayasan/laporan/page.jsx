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
    path: "/yayasan/laporan/akademik",
    stat: "-",
  },
  {
    key: "guru",
    title: "Guru",
    desc: "Rekap kinerja, kehadiran, dan beban mengajar tenaga pendidik",
    icon: GraduationCap,
    path: "/yayasan/laporan/guru",
    stat: "-",
  },
  {
    key: "iventaris",
    title: "Inventaris",
    desc: "Kondisi aset dan sarana-prasarana tiap unit sekolah",
    icon: Package,
    path: "/yayasan/laporan/iventaris",
    stat: "-",
  },
  {
    key: "siswa",
    title: "Siswa",
    desc: "Rekap data induk, mutasi, dan demografi siswa lintas unit",
    icon: UserSquare2,
    path: "/yayasan/laporan/siswa",
    stat: "-",
  },
];

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_80%,#000))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const primaryCardTheme = {
  surface: themePrimarySoft,
  border: themePrimarySoftBorder,
  hoverBorder:
    "hover:border-[color-mix(in_srgb,var(--color-primary)_38%,transparent)]",
  ring: "group-hover:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
  decoration: "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]",
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
      (acc, s) => acc + (s.statistik?.totalSiswa || 0),
      0
    );
    const totalGuru = sekolahList.reduce(
      (acc, s) => acc + (s.statistik?.totalGuru || 0),
      0
    );
    setStats({
      totalSekolah,
      totalGuru,
      totalSiswa,
      sekolahCount: sekolahList.length,
    });
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
      .then((res) => {
        if (active) processOverview(res);
      })
      .catch((err) => {
        if (active)
          setError(err?.message || "Gagal memuat ringkasan laporan yayasan.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [processOverview]);

  const dynamicCategories = categories.map((cat) => {
    let statText = cat.stat;
    if (cat.key === "akademik") statText = `${stats.totalSekolah} unit sekolah`;
    else if (cat.key === "guru") statText = `${stats.totalGuru} guru terdata`;
    else if (cat.key === "iventaris")
      statText = `${stats.sekolahCount} unit sekolah`;
    else if (cat.key === "siswa") statText = `${stats.totalSiswa} siswa terdata`;
    return { ...cat, stat: statText };
  });

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div
                className={`shrink-0 rounded-lg p-2 ${themePrimaryGradient} text-white ${themePrimaryShadow}`}
              >
                <FileText size={18} />
              </div>
              <h1 className="theme-text truncate text-xl font-semibold sm:text-2xl">
                Laporan & Analitik
              </h1>
            </div>
            <p className="theme-text-secondary ml-[42px] mt-1 flex items-center gap-1.5 text-sm">
              <Sparkles size={14} className="theme-text-muted shrink-0" />
              <span className="truncate">
                Pilih kategori laporan yang ingin dilihat lebih detail.
              </span>
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] p-4">
            <AlertCircle
              className="mt-0.5 shrink-0 text-[var(--color-warning)]"
              size={18}
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-[var(--color-warning)]">
                Gagal Memuat Data
              </h4>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {error}
              </p>
            </div>
            <button
              type="button"
              onClick={fetchData}
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline"
            >
              <RefreshCw size={12} /> Coba Lagi
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dynamicCategories.map((item) => {
            const Icon = item.icon;
            const c = primaryCardTheme;
            return (
              <button
                key={item.key}
                onClick={() => router.push(item.path)}
                className={`group theme-card relative min-w-0 overflow-hidden rounded-2xl border ${c.border} ${c.hoverBorder} p-5 text-left ${themeCardShadow} transition-all duration-300 hover:shadow-[0_12px_32px_color-mix(in_srgb,var(--color-text)_9%,transparent)] sm:p-6`}
              >
                <div
                  className={`absolute -right-6 -top-6 h-28 w-28 rounded-full ${c.decoration} opacity-70`}
                />
                <div className="relative min-w-0">
                  <div className="flex items-start justify-between">
                    <div
                      className={`shrink-0 rounded-xl p-3 ${c.surface} ring-4 ring-transparent ${c.ring} transition-all duration-300 sm:p-3.5`}
                    >
                      <Icon size={22} className="theme-primary-text" />
                    </div>
                    <ChevronRight
                      size={20}
                      className="theme-text-muted mt-1 shrink-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                    />
                  </div>
                  <h3 className="theme-text mt-4 truncate text-base font-semibold sm:mt-5 sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="theme-text-secondary mt-1.5 line-clamp-2 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                  <div
                    className={`mt-4 inline-flex max-w-full items-center truncate rounded-full px-2.5 py-1 text-xs font-medium theme-primary-text ${c.surface}`}
                  >
                    {loading ? (
                      <span className="flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin" /> Memuat...
                      </span>
                    ) : (
                      item.stat
                    )}
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