"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Search,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  Download,
  Users,
  UserCheck,
  Building2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getLaporanGuru, getSekolahBinaan } from "@/services/yayasan.service";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimaryButton =
  "bg-[var(--color-primary)] text-[var(--color-card)] hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,var(--color-text))]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_24%,transparent)]";

const statusTheme = {
  aktif: {
    surface: themeSuccessSurface,
    text: "text-[var(--color-success)]",
    border: themeSuccessBorder,
    label: "Aktif",
  },
  nonaktif: {
    surface: "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]",
    text: "text-[var(--color-text-muted)]",
    border: "border-[color-mix(in_srgb,var(--color-text)_16%,transparent)]",
    label: "Nonaktif",
  },
};

export default function LaporanGuruPage() {
  const router = useRouter();

  const [unit, setUnit] = useState("Semua Unit");
  const [unitOptions, setUnitOptions] = useState(["Semua Unit"]);
  const [search, setSearch] = useState("");
  const [dataGuru, setDataGuru] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGuru = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [guruRes, sekolahRes] = await Promise.all([
        getLaporanGuru(),
        getSekolahBinaan(),
      ]);

      const rawList = Array.isArray(guruRes?.data) ? guruRes.data : [];
      setDataGuru(rawList);

      const sekolahList = Array.isArray(sekolahRes?.data?.items)
        ? sekolahRes.data.items
        : Array.isArray(sekolahRes?.data)
          ? sekolahRes.data
          : [];
      if (sekolahList.length > 0) {
        setUnitOptions(["Semua Unit", ...sekolahList.map((s) => s.nama)]);
      }
    } catch (err) {
      setError(err?.message || "Gagal memuat laporan data guru yayasan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [guruRes, sekolahRes] = await Promise.all([
          getLaporanGuru(),
          getSekolahBinaan(),
        ]);
        if (cancelled) return;
        const rawList = Array.isArray(guruRes?.data) ? guruRes.data : [];
        setDataGuru(rawList);
        const sekolahList = Array.isArray(sekolahRes?.data?.items)
          ? sekolahRes.data.items
          : Array.isArray(sekolahRes?.data)
            ? sekolahRes.data
            : [];
        if (sekolahList.length > 0) {
          setUnitOptions(["Semua Unit", ...sekolahList.map((s) => s.nama)]);
        }
      } catch (err) {
        if (!cancelled)
          setError(err?.message || "Gagal memuat laporan data guru yayasan.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredGuru = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return dataGuru.filter((g) => {
      const guruUnit = g.sekolah?.nama || "-";
      const matchUnit = unit === "Semua Unit" || guruUnit === unit;
      const nama = g.namaLengkap || g.namaPengguna || "";
      const email = g.email || "";
      const matchSearch =
        !keyword ||
        nama.toLowerCase().includes(keyword) ||
        email.toLowerCase().includes(keyword);
      return matchUnit && matchSearch;
    });
  }, [dataGuru, unit, search]);

  const summary = useMemo(() => {
    const totalGuru = filteredGuru.length;
    const guruAktif = filteredGuru.filter((g) => g.status === "aktif").length;
    const totalUnit = new Set(
      filteredGuru.map((g) => g.sekolah?.nama).filter(Boolean)
    ).size;
    return { totalGuru, guruAktif, totalUnit };
  }, [filteredGuru]);

  const handleDownload = () => {
    const headers = ["Nama Guru", "Email", "Unit Sekolah", "Peran", "Status"];
    const rows = filteredGuru.map((g) => [
      g.namaLengkap || g.namaPengguna || "-",
      g.email || "-",
      g.sekolah?.nama || "-",
      g.peran?.namaTampilan || g.peran?.nama || "Guru",
      g.status === "aktif" ? "Aktif" : "Nonaktif",
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "laporan-guru-yayasan.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <button
              onClick={() => router.push("/yayasan/laporan")}
              className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
            >
              <ChevronLeft size={13} /> Laporan & Analitik
            </button>

            <div className="flex items-center gap-2.5">
              <div
                className={`shrink-0 rounded-lg border ${themePrimarySoft} p-2 text-[var(--color-primary)] ${themePrimarySoftBorder} ${themeSmallShadow}`}
              >
                <GraduationCap size={18} />
              </div>
              <h1 className="theme-text truncate text-xl font-semibold sm:text-2xl">
                Laporan Guru
              </h1>
            </div>

            <p className="theme-text-secondary ml-[42px] mt-1 flex items-center gap-1.5 text-sm">
              <Sparkles
                size={14}
                className="shrink-0 text-[var(--color-primary)]"
              />
              <span className="truncate">
                Rekap data guru dan unit sekolah tempat mengajar.
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            disabled={loading || filteredGuru.length === 0}
            className={`inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition-all ${themePrimaryButton} disabled:opacity-50`}
          >
            <Download size={16} /> Unduh Laporan
          </button>
        </div>

        {/* Filter */}
        <div
          className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
        >
          <div className="flex flex-col flex-wrap gap-3 sm:flex-row">
            <div className="relative min-w-[180px] flex-1">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={`theme-text-secondary w-full cursor-pointer appearance-none rounded-lg border py-2.5 pl-3 pr-9 text-sm font-medium transition-colors hover:border-[color-mix(in_srgb,var(--color-text)_18%,transparent)] focus:outline-none ${themeNeutralSurface} ${themeNeutralBorder} ${themeFocus}`}
              >
                {unitOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
            </div>

            <div className="relative min-w-[200px] flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama guru atau email..."
                className={`theme-text-secondary w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm transition-colors placeholder:text-[var(--color-text-placeholder)] focus:outline-none ${themeNeutralSurface} ${themeNeutralBorder} ${themeFocus}`}
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          <div
            className={`theme-card flex min-w-0 items-center gap-3 rounded-xl border ${themeNeutralBorder} p-3.5 ${themeCardShadow}`}
          >
            <div
              className={`shrink-0 rounded-lg border ${themePrimarySoft} p-2 text-[var(--color-primary)] ${themePrimarySoftBorder}`}
            >
              <Users size={16} />
            </div>
            <div className="min-w-0">
              <p className="theme-text-muted truncate text-[11px] font-medium uppercase tracking-wider">
                Total Guru
              </p>
              <p className="theme-text text-lg font-bold">
                {loading ? "..." : summary.totalGuru}
              </p>
            </div>
          </div>

          <div
            className={`theme-card flex min-w-0 items-center gap-3 rounded-xl border ${themeNeutralBorder} p-3.5 ${themeCardShadow}`}
          >
            <div
              className={`shrink-0 rounded-lg border ${themeSuccessSurface} p-2 text-[var(--color-success)] ${themeSuccessBorder}`}
            >
              <UserCheck size={16} />
            </div>
            <div className="min-w-0">
              <p className="theme-text-muted truncate text-[11px] font-medium uppercase tracking-wider">
                Guru Aktif
              </p>
              <p className="theme-text text-lg font-bold">
                {loading ? "..." : summary.guruAktif}
              </p>
            </div>
          </div>

          <div
            className={`theme-card flex min-w-0 items-center gap-3 rounded-xl border ${themeNeutralBorder} p-3.5 ${themeCardShadow}`}
          >
            <div
              className={`shrink-0 rounded-lg border ${themeInfoSurface} p-2 text-[var(--color-info)] ${themeInfoBorder}`}
            >
              <Building2 size={16} />
            </div>
            <div className="min-w-0">
              <p className="theme-text-muted truncate text-[11px] font-medium uppercase tracking-wider">
                Unit Sekolah
              </p>
              <p className="theme-text text-lg font-bold">
                {loading ? "..." : summary.totalUnit}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div
          className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
        >
          <div
            className={`flex items-center justify-between gap-2 border-b p-4 sm:p-5 ${themeDivider}`}
          >
            <h3 className="theme-text-secondary truncate text-sm font-semibold">
              Daftar Guru
            </h3>
            <span className="theme-text-muted shrink-0 text-xs">
              {filteredGuru.length} guru
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className={themeNeutralSurface}>
                  <th
                    className={`theme-text-muted border ${themeNeutralBorder} whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider sm:px-5`}
                  >
                    Nama Guru
                  </th>
                  <th
                    className={`theme-text-muted border ${themeNeutralBorder} whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider`}
                  >
                    Email
                  </th>
                  <th
                    className={`theme-text-muted border ${themeNeutralBorder} whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider`}
                  >
                    Unit Sekolah
                  </th>
                  <th
                    className={`theme-text-muted border ${themeNeutralBorder} whitespace-nowrap px-3 py-3 text-center text-xs font-medium uppercase tracking-wider`}
                  >
                    Peran
                  </th>
                  <th
                    className={`theme-text-muted border ${themeNeutralBorder} whitespace-nowrap px-3 py-3 text-center text-xs font-medium uppercase tracking-wider`}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className={`border ${themeNeutralBorder} p-10 text-center`}
                    >
                      <Loader2
                        size={28}
                        className="mx-auto mb-2 animate-spin text-[var(--color-primary)]"
                      />
                      <p className="theme-text-muted text-sm">
                        Memuat data guru yayasan...
                      </p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className={`border ${themeNeutralBorder} p-8 text-center text-[var(--color-danger)]`}
                    >
                      <AlertCircle size={28} className="mx-auto mb-2" />
                      <p className="text-sm">{error}</p>
                      <button
                        type="button"
                        onClick={fetchGuru}
                        className="mt-2 text-xs font-semibold underline"
                      >
                        Coba Lagi
                      </button>
                    </td>
                  </tr>
                ) : filteredGuru.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className={`border ${themeNeutralBorder} p-10 text-center`}
                    >
                      <Users
                        size={28}
                        className="mx-auto mb-2 text-[var(--color-text-placeholder)]"
                      />
                      <p className="theme-text-muted text-sm">
                        Tidak ada guru yang cocok.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredGuru.map((g) => {
                    const st = statusTheme[g.status] || statusTheme.nonaktif;
                    return (
                      <tr
                        key={g.id}
                        className={`border-b ${themeDivider} transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]`}
                      >
                        <td
                          className={`border-r ${themeNeutralBorder} whitespace-nowrap px-4 py-3 sm:px-5`}
                        >
                          <span className="theme-text text-sm font-medium">
                            {g.namaLengkap || g.namaPengguna || "-"}
                          </span>
                        </td>
                        <td
                          className={`border-r ${themeNeutralBorder} theme-text-secondary whitespace-nowrap px-3 py-3`}
                        >
                          {g.email || "-"}
                        </td>
                        <td
                          className={`border-r ${themeNeutralBorder} theme-text-secondary whitespace-nowrap px-3 py-3`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Building2
                              size={13}
                              className="shrink-0 text-[var(--color-text-muted)]"
                            />
                            {g.sekolah?.nama || "-"}
                          </div>
                        </td>
                        <td
                          className={`border-r ${themeNeutralBorder} whitespace-nowrap px-3 py-3 text-center`}
                        >
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`}
                          >
                            {g.peran?.namaTampilan || g.peran?.nama || "Guru"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-center">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${st.surface} ${st.text} ${st.border}`}
                          >
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}