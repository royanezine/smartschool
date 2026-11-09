"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getPrestasi,
  deletePrestasi,
  getKelasPrestasi,
} from "@/services/prestasi.service";

import {
  Search,
  Award,
  Trophy,
  Plus,
  X,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  Pencil,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const TINGKAT_OPTIONS = [
  "Kabupaten/Kota",
  "Provinsi",
  "Nasional",
  "Internasional",
];

const BULAN_OPTIONS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const SORT_OPTIONS = [
  { value: "terbaru", label: "Terbaru" },
  { value: "terlama", label: "Terlama" },
  { value: "nama-asc", label: "Nama Siswa (A-Z)" },
  { value: "nama-desc", label: "Nama Siswa (Z-A)" },
  { value: "lomba-asc", label: "Nama Lomba (A-Z)" },
  { value: "lomba-desc", label: "Nama Lomba (Z-A)" },
  { value: "juara-asc", label: "Juara (Terkecil)" },
  { value: "juara-desc", label: "Juara (Terbesar)" },
  { value: "tahun-asc", label: "Tahun (Lama)" },
  { value: "tahun-desc", label: "Tahun (Baru)" },
];

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const getResponseData = (response) => {
  let result = response;

  for (let i = 0; i < 5; i++) {
    if (
      result &&
      typeof result === "object" &&
      !Array.isArray(result) &&
      Object.prototype.hasOwnProperty.call(result, "data")
    ) {
      result = result.data;
    } else {
      break;
    }
  }

  return result;
};

const getArrayData = (response, keys = []) => {
  const result = getResponseData(response);

  if (Array.isArray(result)) {
    return result;
  }

  if (result && typeof result === "object") {
    for (const key of keys) {
      if (Array.isArray(result[key])) {
        return result[key];
      }
    }
  }

  return [];
};

const getErrorMessage = (error) => {
  if (error?.message) {
    return error.message;
  }

  return "Terjadi kesalahan. Silakan coba kembali.";
};

const normalizeText = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
};

const extractJuaraNumber = (juara) => {
  const match = String(juara).match(/\d+/);
  return match ? Number(match[0]) : 999;
};

const normalizePrestasi = (item) => ({
  ...item,

  id: item.id,

  siswaId: item.siswaId || item.siswa?.id || null,

  kelasId: item.kelasId || item.kelasRel?.id || null,

  namaSiswa:
    item.siswa?.namaLengkap ||
    item.namaSiswa ||
    "-",

  namaKelas:
    item.kelasRel?.nama ||
    item.kelas?.nama ||
    (typeof item.kelas === "string" ? item.kelas : null) ||
    "-",

  namaLomba: normalizeText(item.namaLomba),

  tingkat: normalizeText(item.tingkat),

  juara: normalizeText(item.juara),

  bulan: normalizeText(item.bulan),

  tahun: normalizeText(item.tahun),

  penyelenggara: normalizeText(item.penyelenggara),
});

export default function PrestasiPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [data, setData] = useState([]);
  const [kelasList, setKelasList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [kelasFilter, setKelasFilter] = useState("");
  const [tingkatFilter, setTingkatFilter] = useState("");
  const [tahunFilter, setTahunFilter] = useState("");
  const [sortBy, setSortBy] = useState("terbaru");

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [prestasiResponse, kelasResponse] = await Promise.all([
        getPrestasi(),
        getKelasPrestasi(),
      ]);

      const prestasiData = getArrayData(prestasiResponse, [
        "items",
        "prestasi",
        "results",
      ]);

      const kelasData = getArrayData(kelasResponse, [
        "items",
        "kelas",
        "results",
      ]);

      setData(prestasiData.map(normalizePrestasi));
      setKelasList(kelasData);
    } catch (err) {
      console.error("Gagal mengambil data prestasi:", err);

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showSuccess = (message) => {
    setSuccess(message);
    setError("");

    window.setTimeout(() => {
      setSuccess("");
    }, 3500);
  };

  const showError = (message) => {
    setError(message);
    setSuccess("");
  };

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    const filtered = data.filter((p) => {
      const matchSearch =
        !keyword ||
        p.namaSiswa.toLowerCase().includes(keyword) ||
        p.namaLomba.toLowerCase().includes(keyword) ||
        p.penyelenggara.toLowerCase().includes(keyword) ||
        p.namaKelas.toLowerCase().includes(keyword);

      const matchKelas =
        !kelasFilter ||
        String(p.kelasId || "") === String(kelasFilter) ||
        String(p.kelasRel?.id || "") === String(kelasFilter);

      const matchTingkat =
        !tingkatFilter ||
        p.tingkat === tingkatFilter;

      const matchTahun =
        !tahunFilter ||
        String(p.tahun) === String(tahunFilter);

      return (
        matchSearch &&
        matchKelas &&
        matchTingkat &&
        matchTahun
      );
    });

    const getBulanIndex = (bulan) => BULAN_OPTIONS.indexOf(bulan);

    return filtered.sort((a, b) => {
      const tahunA = Number(a.tahun) || 0;
      const tahunB = Number(b.tahun) || 0;

      const bulanA = getBulanIndex(a.bulan);
      const bulanB = getBulanIndex(b.bulan);

      switch (sortBy) {
        case "terlama":
          return tahunA - tahunB || bulanA - bulanB;

        case "terbaru":
          return tahunB - tahunA || bulanB - bulanA;

        case "nama-asc":
          return a.namaSiswa.localeCompare(b.namaSiswa, "id", {
            sensitivity: "base",
          });

        case "nama-desc":
          return b.namaSiswa.localeCompare(a.namaSiswa, "id", {
            sensitivity: "base",
          });

        case "lomba-asc":
          return a.namaLomba.localeCompare(b.namaLomba, "id", {
            sensitivity: "base",
          });

        case "lomba-desc":
          return b.namaLomba.localeCompare(a.namaLomba, "id", {
            sensitivity: "base",
          });

        case "juara-asc":
          return extractJuaraNumber(a.juara) - extractJuaraNumber(b.juara);

        case "juara-desc":
          return extractJuaraNumber(b.juara) - extractJuaraNumber(a.juara);

        case "tahun-asc":
          return tahunA - tahunB;

        case "tahun-desc":
          return tahunB - tahunA;

        default:
          return tahunB - tahunA || bulanB - bulanA;
      }
    });
  }, [
    data,
    search,
    kelasFilter,
    tingkatFilter,
    tahunFilter,
    sortBy,
  ]);

  const totalPrestasi = data.length;

  const totalJuara1 = data.filter(
    (p) => p.juara.toLowerCase() === "juara 1"
  ).length;

  const siswaBerprestasi = new Set(
    data.map((p) => p.siswaId || p.namaSiswa)
  ).size;

  const tahunOptions = useMemo(() => {
    return [
      ...new Set(
        data
          .map((p) => String(p.tahun))
          .filter((tahun) => tahun !== "-")
      ),
    ].sort((a, b) => Number(b) - Number(a));
  }, [data]);

  const handleHapus = async (item) => {
    if (!item?.id || deletingId) {
      return;
    }

    const konfirmasi = window.confirm(
      `Apakah kamu yakin ingin menghapus prestasi ${item.namaSiswa} pada lomba ${item.namaLomba}?`
    );

    if (!konfirmasi) {
      return;
    }

    setDeletingId(item.id);
    setError("");

    try {
      await deletePrestasi(item.id);

      setData((prev) =>
        prev.filter((p) => p.id !== item.id)
      );

      showSuccess("Data prestasi berhasil dihapus.");
    } catch (err) {
      console.error("Gagal menghapus prestasi:", err);

      showError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilter = () => {
    setSearch("");
    setKelasFilter("");
    setTingkatFilter("");
    setTahunFilter("");
    setSortBy("terbaru");
  };

  const toggleSortDirection = () => {
    if (sortBy === "terbaru" || sortBy === "terbaru") {
      setSortBy("terlama");
    } else if (sortBy === "terlama") {
      setSortBy("terbaru");
    } else if (sortBy.endsWith("-asc")) {
      setSortBy(sortBy.replace("-asc", "-desc"));
    } else if (sortBy.endsWith("-desc")) {
      setSortBy(sortBy.replace("-desc", "-asc"));
    }
  };

  const isAscending =
    sortBy === "terlama" ||
    sortBy.endsWith("-asc");

  const hasFilter =
    search ||
    kelasFilter ||
    tingkatFilter ||
    tahunFilter ||
    sortBy !== "terbaru";

  const inputBase = `
    h-11 w-full rounded-xl border px-3.5
    text-sm font-medium outline-none transition
    ${themeNeutralBorder}
    theme-input
    focus:border-[var(--color-primary)]
    focus:ring-4
    focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
  `;

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">

      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar
          active="akademikPrestasi"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="admin"
        />
      </div>

      <div
        className={`
          flex h-screen min-w-0 w-full flex-1 flex-col
          overflow-hidden transition-[margin] duration-300
          ${
            isCollapsed
              ? "lg:ml-[88px]"
              : "lg:ml-[260px]"
          }
        `}
      >

        <div className="w-full shrink-0 border-b theme-border">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 w-full flex-1 overflow-y-auto overflow-x-hidden">

          <div className="mx-auto w-full space-y-6 px-4 pb-12 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-7 xl:px-10 2xl:px-12">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex min-w-0 items-center gap-3">

                <div className={`shrink-0 rounded-xl p-2.5 text-white ${themePrimaryGradient} ${themePrimaryShadow}`}>
                  <Trophy size={21} />
                </div>

                <div className="min-w-0">
                  <h1 className="theme-text text-2xl font-bold">
                    Prestasi
                  </h1>

                  <p className="theme-text-muted mt-0.5 text-sm">
                    Catatan prestasi siswa dari berbagai tingkat perlombaan.
                  </p>
                </div>

              </div>

              <div className="flex shrink-0 gap-2">

                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className={`
                    flex items-center justify-center gap-2
                    rounded-xl border px-4 py-2.5
                    text-sm font-semibold transition-colors
                    ${themeNeutralBorder}
                    theme-card
                    hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]
                    disabled:opacity-50
                  `}
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />

                  <span className="hidden sm:inline">
                    Muat Ulang
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/akademik/prestasi/tambah")
                  }
                  className={`
                    flex items-center justify-center gap-2
                    rounded-xl px-4 py-2.5
                    text-sm font-semibold
                    text-white transition-all
                    ${themePrimaryGradient}
                    ${themePrimaryShadow}
                    hover:brightness-[1.04]
                    active:scale-[0.98]
                  `}
                >
                  <Plus size={16} />
                  Tambah Prestasi
                </button>

              </div>

            </div>

            {error && (
              <div className={`flex items-start gap-3 rounded-xl border p-4 ${themeNeutralBorder} theme-card`}>

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] theme-danger">
                  <AlertCircle size={17} />
                </div>

                <div className="min-w-0 flex-1 text-sm theme-text-secondary">
                  <p className="font-bold theme-text">
                    Terjadi Kesalahan
                  </p>

                  <p className="mt-1 break-words">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="theme-text-muted transition-colors hover:opacity-70"
                >
                  <X size={17} />
                </button>

              </div>
            )}

            {success && (
              <div className={`flex items-center gap-3 rounded-xl border p-4 ${themeNeutralBorder} theme-card`}>

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] theme-success">
                  <CheckCircle2 size={17} />
                </div>

                <p className="flex-1 text-sm theme-text-secondary">
                  {success}
                </p>

                <button
                  type="button"
                  onClick={() => setSuccess("")}
                  className="theme-text-muted transition-colors hover:opacity-70"
                >
                  <X size={17} />
                </button>

              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

              <div className={`theme-card ${themeDivider} ${themeCardShadow} rounded-2xl border p-5`}>

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] p-2.5 theme-warning">
                    <Award size={19} />
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wider theme-text-muted">
                    Total Prestasi
                  </p>

                </div>

                <p className="mt-4 text-3xl font-bold theme-text">
                  {loading ? "..." : totalPrestasi}
                </p>

              </div>

              <div className={`theme-card ${themeDivider} ${themeCardShadow} rounded-2xl border p-5`}>

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] p-2.5 theme-success">
                    <Trophy size={19} />
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wider theme-text-muted">
                    Juara 1
                  </p>

                </div>

                <p className="mt-4 text-3xl font-bold theme-text">
                  {loading ? "..." : totalJuara1}
                </p>

              </div>

              <div className={`theme-card ${themeDivider} ${themeCardShadow} rounded-2xl border p-5 sm:col-span-2 xl:col-span-1`}>

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] p-2.5 theme-info">
                    <Award size={19} />
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wider theme-text-muted">
                    Siswa Berprestasi
                  </p>

                </div>

                <p className="mt-4 text-3xl font-bold theme-text">
                  {loading ? "..." : siswaBerprestasi}
                </p>

              </div>

            </div>

            <div className={`theme-card ${themeDivider} ${themeCardShadow} rounded-2xl border p-4 sm:p-5`}>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

                <div className="relative xl:col-span-2">

                  <Search
                    size={18}
                    className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama siswa, lomba, atau penyelenggara..."
                    className={`${inputBase} pl-10`}
                  />

                </div>

                <div className="relative">

                  <select
                    value={kelasFilter}
                    onChange={(e) => setKelasFilter(e.target.value)}
                    className={`${inputBase} cursor-pointer appearance-none pr-10`}
                  >
                    <option value="">
                      Semua Kelas
                    </option>

                    {kelasList.map((kelas) => (
                      <option
                        key={kelas.id}
                        value={kelas.id}
                      >
                        {kelas.nama}
                      </option>
                    ))}

                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
                  />

                </div>

                <div className="relative">

                  <select
                    value={tingkatFilter}
                    onChange={(e) => setTingkatFilter(e.target.value)}
                    className={`${inputBase} cursor-pointer appearance-none pr-10`}
                  >
                    <option value="">
                      Semua Tingkat
                    </option>

                    {TINGKAT_OPTIONS.map((tingkat) => (
                      <option key={tingkat} value={tingkat}>
                        {tingkat}
                      </option>
                    ))}

                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
                  />

                </div>

                <div className="flex gap-2 xl:col-span-2">

                  <div className="relative flex-1">

                    <select
                      value={tahunFilter}
                      onChange={(e) => setTahunFilter(e.target.value)}
                      className={`${inputBase} cursor-pointer appearance-none pr-10`}
                    >
                      <option value="">
                        Semua Tahun
                      </option>

                      {tahunOptions.map((tahun) => (
                        <option key={tahun} value={tahun}>
                          {tahun}
                        </option>
                      ))}

                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
                    />

                  </div>

                  {hasFilter && (
                    <button
                      type="button"
                      onClick={resetFilter}
                      className={`
                        flex h-11 shrink-0 items-center justify-center gap-2
                        rounded-xl border px-4 text-sm font-semibold
                        ${themeNeutralBorder}
                        theme-text-secondary
                        transition-colors
                        hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]
                      `}
                    >
                      <X size={16} />
                      Reset
                    </button>
                  )}

                </div>

              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-2">

                  <div className="relative">

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`${inputBase} cursor-pointer appearance-none pr-10 sm:w-56`}
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}

                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
                    />

                  </div>

                  <button
                    type="button"
                    onClick={toggleSortDirection}
                    title={isAscending ? "Ubah ke Descending" : "Ubah ke Ascending"}
                    className={`
                      flex h-11 shrink-0 items-center justify-center gap-2
                      rounded-xl border px-3.5 text-sm font-semibold
                      ${themeNeutralBorder}
                      theme-text-secondary
                      transition-colors
                      hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]
                    `}
                  >
                    {isAscending ? (
                      <ArrowUp size={16} />
                    ) : (
                      <ArrowDown size={16} />
                    )}

                    <span className="hidden sm:inline">
                      {isAscending ? "ASC" : "DESC"}
                    </span>
                  </button>

                </div>

                <p className="text-xs theme-text-muted">
                  Urutan:{" "}
                  <span className="font-semibold theme-text-secondary">
                    {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Terbaru"}
                  </span>
                  {" • "}
                  {isAscending ? "Ascending" : "Descending"}
                </p>

              </div>

            </div>

            <div className={`theme-card ${themeDivider} ${themeCardShadow} overflow-hidden rounded-2xl border`}>

              <div className={`flex items-center justify-between border-b ${themeDivider} px-5 py-4`}>

                <div>
                  <h2 className="text-sm font-bold theme-text">
                    Daftar Prestasi Siswa
                  </h2>

                  <p className="mt-1 text-xs theme-text-muted">
                    {loading
                      ? "Mengambil data..."
                      : `${filteredData.length} data ditampilkan`}
                  </p>
                </div>

              </div>

              <div className="w-full overflow-x-auto">

                <table className="w-full min-w-[1000px] text-sm">

                  <thead>
                    <tr className={`border-b ${themeDivider} bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]`}>

                      <th className="w-14 px-4 py-3.5 text-center font-bold theme-text-secondary">
                        No
                      </th>

                      <th className="px-5 py-3.5 text-left font-bold theme-text-secondary">
                        Siswa
                      </th>

                      <th className="px-5 py-3.5 text-left font-bold theme-text-secondary">
                        Nama Lomba
                      </th>

                      <th className="px-5 py-3.5 text-left font-bold theme-text-secondary">
                        Tingkat
                      </th>

                      <th className="px-5 py-3.5 text-left font-bold theme-text-secondary">
                        Juara
                      </th>

                      <th className="px-5 py-3.5 text-left font-bold theme-text-secondary">
                        Bulan / Tahun
                      </th>

                      <th className="px-5 py-3.5 text-left font-bold theme-text-secondary">
                        Penyelenggara
                      </th>

                      <th className="px-5 py-3.5 text-center font-bold theme-text-secondary">
                        Aksi
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {loading ? (

                      <tr>
                        <td colSpan={8} className="px-5 py-16 text-center">

                          <Loader2
                            size={30}
                            className="mx-auto animate-spin theme-text-muted"
                          />

                          <p className="mt-3 text-sm theme-text-muted">
                            Memuat data prestasi...
                          </p>

                        </td>
                      </tr>

                    ) : filteredData.length === 0 ? (

                      <tr>
                        <td colSpan={8} className="px-5 py-16 text-center">

                          <Award
                            size={38}
                            className="mx-auto theme-text-muted"
                          />

                          <p className="mt-3 text-sm font-bold theme-text">
                            Tidak ada data prestasi
                          </p>

                          <p className="mt-1 text-xs theme-text-muted">
                            Belum ada data yang tersedia atau sesuai filter.
                          </p>

                        </td>
                      </tr>

                    ) : (

                      filteredData.map((p, index) => (

                        <tr
                          key={p.id}
                          className={`
                            border-b last:border-0
                            ${themeDivider}
                            transition-colors
                            hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]
                          `}
                        >

                          <td className="px-4 py-4 text-center font-semibold theme-text-muted">
                            {index + 1}
                          </td>

                          <td className="px-5 py-4">

                            <p className="font-bold theme-text">
                              {p.namaSiswa}
                            </p>

                            <p className="mt-0.5 text-xs theme-text-muted">
                              {p.namaKelas}
                            </p>

                          </td>

                          <td className="max-w-[240px] px-5 py-4 font-medium theme-text-secondary">
                            {p.namaLomba}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-medium theme-text-secondary">
                            {p.tingkat}
                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2 whitespace-nowrap font-semibold theme-text">

                              <Trophy
                                size={14}
                                className="shrink-0 text-[var(--color-warning)]"
                              />

                              {p.juara}

                            </div>

                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-medium theme-text-secondary">
                            {p.bulan} {p.tahun}
                          </td>

                          <td className="max-w-[200px] px-5 py-4 text-xs theme-text-muted">
                            {p.penyelenggara}
                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center justify-center gap-1">

                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/admin/akademik/prestasi/${p.id}`
                                  )
                                }
                                title="Lihat detail"
                                className="rounded-lg p-2 text-blue-500 transition-colors hover:bg-blue-500/10"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/admin/akademik/prestasi/${p.id}/edit`
                                  )
                                }
                                title="Edit prestasi"
                                className="rounded-lg p-2 text-amber-500 transition-colors hover:bg-amber-500/10"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleHapus(p)}
                                disabled={deletingId === p.id || deletingId !== null}
                                title="Hapus prestasi"
                                className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingId === p.id ? (
                                  <Loader2
                                    size={16}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>

                            </div>

                          </td>

                        </tr>

                      ))

                    )}

                  </tbody>

                </table>

              </div>

            </div>

            <div className={`mt-7 border-t ${themeDivider} pt-5 text-center`}>

              <p className="text-xs theme-text-muted">
                © 2026 SmartSchool • Modul Prestasi Siswa
              </p>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}