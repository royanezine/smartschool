"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserPlus,
  School,
  Venus,
  Mars,
  MapPin,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getLaporanSiswa } from "@/services/yayasan.service";


const JENJANG_OPTIONS = ["Semua Jenjang", "SD", "SMP", "SMA"];

const totalSekolah = (s) =>
  Array.isArray(s?.tingkat) && s.tingkat.length > 0
    ? s.tingkat.reduce((acc, t) => acc + (t.laki || 0) + (t.perempuan || 0), 0)
    : (s?.statistik?.totalSiswa ?? s?.totalSiswa ?? 0);

const totalLaki = (s) =>
  Array.isArray(s?.tingkat) && s.tingkat.length > 0
    ? s.tingkat.reduce((acc, t) => acc + (t.laki || 0), 0)
    : 0;

const totalPerempuan = (s) =>
  Array.isArray(s?.tingkat) && s.tingkat.length > 0
    ? s.tingkat.reduce((acc, t) => acc + (t.perempuan || 0), 0)
    : 0;


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

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";


export default function DataSiswaPage() {
  const router = useRouter();

  const [jenjang, setJenjang] = useState(JENJANG_OPTIONS[0]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [dataSekolah, setDataSekolah] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSekolah = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getLaporanSiswa();
      const list = Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      setDataSekolah(list);
    } catch (err) {
      setError(err?.message || "Gagal memuat data sekolah binaan.");
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
        const list = Array.isArray(res?.data?.items)
          ? res.data.items
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        setDataSekolah(list);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Gagal memuat data sekolah binaan.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSekolah = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return dataSekolah.filter((s) => {
      const matchJenjang =
        jenjang === "Semua Jenjang" ||
        s.jenjang === jenjang ||
        s.nama?.toUpperCase().includes(jenjang);

      const matchSearch =
        !keyword ||
        s.nama?.toLowerCase().includes(keyword) ||
        s.subdomain?.toLowerCase().includes(keyword) ||
        s.alamat?.toLowerCase().includes(keyword);

      return matchJenjang && matchSearch;
    });
  }, [dataSekolah, jenjang, search]);


  const summary = useMemo(() => {
    const totalSiswa = filteredSekolah.reduce(
      (acc, s) => acc + totalSekolah(s),
      0
    );

    const totalUnit = filteredSekolah.length;

    const laki = filteredSekolah.reduce(
      (acc, s) => acc + totalLaki(s),
      0
    );

    const perempuan = filteredSekolah.reduce(
      (acc, s) => acc + totalPerempuan(s),
      0
    );

    return {
      totalSiswa,
      totalUnit,
      laki,
      perempuan,
    };
  }, [filteredSekolah]);


  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };


  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1800px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="space-y-6">


          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => router.push("/yayasan/laporan")}
                className="
                  inline-flex items-center gap-1
                  text-xs font-medium
                  text-[var(--color-text-muted)]
                  hover:text-[var(--color-primary)]
                  transition-colors
                  mb-1
                "
              >
                <ChevronLeft size={13} />
                Laporan & Analitik
              </button>

              <div className="flex items-center gap-2.5">
                <div
                  className={`
                    p-2 rounded-lg
                    ${themePrimaryGradient}
                    text-[var(--color-card)]
                    ${themeSmallShadow}
                    flex-shrink-0
                  `}
                >
                  <Users size={18} />
                </div>

                <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">
                  Data Siswa
                </h1>
              </div>

              <p className="theme-text-secondary text-sm mt-1 ml-[42px] flex items-center gap-1.5">
                <Sparkles
                  size={14}
                  className="text-[var(--color-primary)] flex-shrink-0"
                />

                <span className="truncate">
                  Total siswa per unit sekolah — klik untuk lihat rincian per tingkat.
                </span>
              </p>
            </div>

            <button
              type="button"
              className="
                inline-flex items-center justify-center gap-2
                px-4 py-2.5
                text-sm font-medium
                rounded-lg
                bg-[var(--color-primary)]
                text-[var(--color-card)]
                hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,var(--color-text))]
                transition-colors
                shadow-[0_4px_12px_color-mix(in_srgb,var(--color-primary)_16%,transparent)]
                whitespace-nowrap
                flex-shrink-0
              "
            >
              <UserPlus size={16} />
              Tambah Siswa
            </button>
          </div>


          <div
            className={`
              theme-card
              rounded-xl
              border theme-border
              p-4
              ${themeCardShadow}
            `}
          >
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">


              <div className="relative flex-1 min-w-[200px]">
                <Search
                  size={15}
                  className="
                    absolute left-3 top-1/2 -translate-y-1/2
                    text-[var(--color-text-muted)]
                  "
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama sekolah..."
                  className={`
                    theme-input
                    w-full
                    pl-9 pr-3
                    py-2.5
                    text-sm
                    rounded-lg
                    transition-colors
                    ${themeFocus}
                    placeholder:text-[var(--color-text-placeholder)]
                  `}
                />
              </div>


              <div className="relative flex-1 min-w-[160px]">
                <select
                  value={jenjang}
                  onChange={(e) => setJenjang(e.target.value)}
                  className={`
                    theme-input
                    w-full
                    appearance-none
                    pl-3 pr-9
                    py-2.5
                    text-sm font-medium
                    rounded-lg
                    transition-colors
                    cursor-pointer
                    ${themeFocus}
                  `}
                >
                  {JENJANG_OPTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={14}
                  className="
                    absolute right-3 top-1/2 -translate-y-1/2
                    text-[var(--color-text-muted)]
                    pointer-events-none
                  "
                />
              </div>
            </div>
          </div>


          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">


            <div
              className={`
                theme-card
                rounded-xl
                border theme-border
                p-3.5
                ${themeCardShadow}
                flex items-center gap-3
                min-w-0
              `}
            >
              <div
                className={`
                  p-2 rounded-lg border
                  ${themePrimarySoft}
                  ${themePrimarySoftBorder}
                  text-[var(--color-primary)]
                  flex-shrink-0
                `}
              >
                <Users size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                  Total Siswa
                </p>

                <p className="text-lg font-bold theme-text">
                  {summary.totalSiswa.toLocaleString("id-ID")}
                </p>
              </div>
            </div>


            <div
              className={`
                theme-card
                rounded-xl
                border theme-border
                p-3.5
                ${themeCardShadow}
                flex items-center gap-3
                min-w-0
              `}
            >
              <div
                className="
                  p-2 rounded-lg border
                  bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]
                  border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]
                  text-[var(--color-info)]
                  flex-shrink-0
                "
              >
                <School size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                  Unit Sekolah
                </p>

                <p className="text-lg font-bold theme-text">
                  {summary.totalUnit}
                </p>
              </div>
            </div>


            <div
              className={`
                theme-card
                rounded-xl
                border theme-border
                p-3.5
                ${themeCardShadow}
                flex items-center gap-3
                min-w-0
              `}
            >
              <div
                className="
                  p-2 rounded-lg border
                  bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]
                  border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]
                  text-[var(--color-info)]
                  flex-shrink-0
                "
              >
                <Mars size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                  Siswa Laki-laki
                </p>

                <p className="text-lg font-bold theme-text">
                  {summary.laki.toLocaleString("id-ID")}
                </p>
              </div>
            </div>


            <div
              className={`
                theme-card
                rounded-xl
                border theme-border
                p-3.5
                ${themeCardShadow}
                flex items-center gap-3
                min-w-0
              `}
            >
              <div
                className="
                  p-2 rounded-lg border
                  bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]
                  border-[color-mix(in_srgb,var(--color-warning)_22%,transparent)]
                  text-[var(--color-warning)]
                  flex-shrink-0
                "
              >
                <Venus size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                  Siswa Perempuan
                </p>

                <p className="text-lg font-bold theme-text">
                  {summary.perempuan.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>


          <div className="space-y-3">

            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold theme-text">
                Per Unit Sekolah
              </h3>

              <span className="text-xs theme-text-muted">
                {filteredSekolah.length} unit
              </span>
            </div>


            {loading ? (
              <div
                className={`
                  theme-card
                  rounded-xl
                  border theme-border
                  ${themeCardShadow}
                  p-12
                  text-center
                `}
              >
                <Loader2
                  size={32}
                  className="mx-auto text-[var(--color-primary)] animate-spin mb-3"
                />
                <p className="text-sm theme-text-muted">
                  Memuat data sekolah binaan...
                </p>
              </div>
            ) : error ? (
              <div
                className={`
                  theme-card
                  rounded-xl
                  border border-[var(--color-danger)]/20
                  ${themeCardShadow}
                  p-8
                  text-center
                `}
              >
                <AlertCircle
                  size={32}
                  className="mx-auto text-[var(--color-danger)] mb-2"
                />
                <p className="text-sm font-medium theme-text">{error}</p>
                <button
                  type="button"
                  onClick={fetchSekolah}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-primary)] text-white"
                >
                  <RefreshCw size={12} /> Coba Lagi
                </button>
              </div>
            ) : filteredSekolah.length === 0 ? (
              <div
                className={`
                  theme-card
                  rounded-xl
                  border theme-border
                  ${themeCardShadow}
                  p-10
                  text-center
                `}
              >
                <Users
                  size={28}
                  className="
                    mx-auto
                    text-[var(--color-text-placeholder)]
                    mb-2
                  "
                />

                <p className="text-sm theme-text-muted">
                  Tidak ada sekolah yang cocok.
                </p>
              </div>
            ) : (
              filteredSekolah.map((s) => {
                const total = totalSekolah(s);
                const isOpen = expandedId === s.id;

                return (
                  <div
                    key={s.id}
                    className={`
                      theme-card
                      rounded-xl
                      border theme-border
                      ${themeCardShadow}
                      overflow-hidden
                    `}
                  >

                    <button
                      type="button"
                      onClick={() => toggleExpand(s.id)}
                      className={`
                        w-full
                        flex items-center justify-between
                        gap-3
                        p-4 sm:p-5
                        ${themeNeutralHover}
                        transition-colors
                        text-left
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0">


                        <div
                          className={`
                            p-2.5 rounded-lg border
                            ${themePrimarySoft}
                            ${themePrimarySoftBorder}
                            text-[var(--color-primary)]
                            flex-shrink-0
                          `}
                        >
                          <School size={17} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">

                            <p className="text-sm font-semibold theme-text truncate">
                              {s.nama}
                            </p>

                            <span
                              className="
                                text-[10px]
                                font-medium
                                px-2 py-0.5
                                rounded-full
                                border
                                bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]
                                border-[color-mix(in_srgb,var(--color-text)_12%,transparent)]
                                text-[var(--color-text-muted)]
                                flex-shrink-0
                              "
                            >
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
                          <span className="flex items-center gap-1">
                            <Mars
                              size={12}
                              className="text-[var(--color-info)]"
                            />
                            {totalLaki(s)}
                          </span>

                          <span className="flex items-center gap-1">
                            <Venus
                              size={12}
                              className="text-[var(--color-warning)]"
                            />
                            {totalPerempuan(s)}
                          </span>
                        </div>


                        <div className="text-right">
                          <span className="text-base font-bold theme-text">
                            {total.toLocaleString("id-ID")}
                          </span>

                          <span className="text-xs theme-text-muted ml-1">
                            siswa
                          </span>
                        </div>

                        <ChevronRight
                          size={16}
                          className={`
                            text-[var(--color-text-muted)]
                            transition-transform
                            flex-shrink-0
                            ${isOpen ? "rotate-90" : ""}
                          `}
                        />
                      </div>
                    </button>


                    {isOpen && (
                      <div
                        className={`
                          border-t
                          ${themeDivider}
                          bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]
                        `}
                      >
                        {Array.isArray(s.tingkat) && s.tingkat.length > 0 ? (
                          <div className="overflow-x-auto w-full">
                            <table className="w-full min-w-[480px] text-sm border-collapse">

                              <thead>
                                <tr
                                  className="
                                    bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]
                                  "
                                >
                                  <th
                                    className="
                                      border
                                      border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                      text-left
                                      font-medium
                                      theme-text-muted
                                      text-xs
                                      uppercase
                                      tracking-wider
                                      px-4 sm:px-5
                                      py-2.5
                                      whitespace-nowrap
                                    "
                                  >
                                    Tingkat
                                  </th>

                                  <th
                                    className="
                                      border
                                      border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                      text-center
                                      font-medium
                                      theme-text-muted
                                      text-xs
                                      uppercase
                                      tracking-wider
                                      px-3
                                      py-2.5
                                      whitespace-nowrap
                                    "
                                  >
                                    Laki-laki
                                  </th>

                                  <th
                                    className="
                                      border
                                      border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                      text-center
                                      font-medium
                                      theme-text-muted
                                      text-xs
                                      uppercase
                                      tracking-wider
                                      px-3
                                      py-2.5
                                      whitespace-nowrap
                                    "
                                  >
                                    Perempuan
                                  </th>

                                  <th
                                    className="
                                      border
                                      border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                      text-center
                                      font-medium
                                      theme-text-muted
                                      text-xs
                                      uppercase
                                      tracking-wider
                                      px-3
                                      py-2.5
                                      whitespace-nowrap
                                    "
                                  >
                                    Total
                                  </th>
                                </tr>
                              </thead>

                              <tbody
                                className="
                                  divide-y
                                  divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]
                                  theme-card
                                "
                              >
                                {s.tingkat.map((t, i) => (
                                  <tr
                                    key={i}
                                    className={`
                                      ${themeNeutralHover}
                                      transition-colors
                                    `}
                                  >
                                    <td
                                      className="
                                        border
                                        border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                        px-4 sm:px-5
                                        py-2.5
                                        whitespace-nowrap
                                      "
                                    >
                                      <span className="text-sm font-medium theme-text">
                                        {t.label}
                                      </span>
                                    </td>

                                    <td
                                      className="
                                        border
                                        border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                        px-3
                                        py-2.5
                                        text-center
                                        theme-text-secondary
                                        whitespace-nowrap
                                      "
                                    >
                                      {t.laki}
                                    </td>

                                    <td
                                      className="
                                        border
                                        border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                        px-3
                                        py-2.5
                                        text-center
                                        theme-text-secondary
                                        whitespace-nowrap
                                      "
                                    >
                                      {t.perempuan}
                                    </td>

                                    <td
                                      className="
                                        border
                                        border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                        px-3
                                        py-2.5
                                        text-center
                                        whitespace-nowrap
                                      "
                                    >
                                      <span className="text-sm font-semibold theme-text">
                                        {t.laki + t.perempuan}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>


                              <tfoot>
                                <tr
                                  className="
                                    bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]
                                  "
                                >
                                  <td
                                    className="
                                      border
                                      border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                      px-4 sm:px-5
                                      py-2.5
                                      text-sm
                                      font-semibold
                                      theme-text-secondary
                                    "
                                  >
                                    Total {s.nama}
                                  </td>

                                  <td
                                    className="
                                      border
                                      border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                      px-3
                                      py-2.5
                                      text-center
                                      text-sm
                                      font-semibold
                                      theme-text-secondary
                                    "
                                  >
                                    {totalLaki(s)}
                                  </td>

                                  <td
                                    className="
                                      border
                                      border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                      px-3
                                      py-2.5
                                      text-center
                                      text-sm
                                      font-semibold
                                      theme-text-secondary
                                    "
                                  >
                                    {totalPerempuan(s)}
                                  </td>

                                  <td
                                    className="
                                      border
                                      border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                      px-3
                                      py-2.5
                                      text-center
                                      text-sm
                                      font-bold
                                      theme-text
                                    "
                                  >
                                    {total}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        ) : (
                          <div className="p-4 sm:p-5 text-sm theme-text-muted flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span>
                              Data siswa unit {s.nama} tercatat di sistem dengan total {total.toLocaleString("id-ID")} siswa. Rincian per rombel belum dikonfigurasi.
                            </span>
                            <span className="font-semibold theme-text whitespace-nowrap">
                              {total.toLocaleString("id-ID")} Siswa
                            </span>
                          </div>
                        )}
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