"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import {
  GraduationCap,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Users,
  UserCheck,
  CalendarDays,
  Eye,
  LayoutGrid,
  AlertCircle,
  School,
  X,
} from "lucide-react";

import {
  getKelas,
  deleteKelas,
} from "../../../services/kelas.service";

import {
  getTahunAjaran,
} from "../../../services/tahunAjaran.service";

// =========================================================
// HELPER
// =========================================================

function getJenjangFromTingkat(tingkat) {
  const value = Number(tingkat);

  if (value === 10) return "X";
  if (value === 11) return "XI";
  if (value === 12) return "XII";

  return value ? `Tingkat ${value}` : "-";
}

/**
 * Mengambil jumlah siswa dari response API.
 *
 * Prioritas:
 * 1. _count.anggota
 * 2. jumlahSiswa
 * 3. jumlah_siswa
 * 4. anggota.length
 */
function getJumlahSiswa(item) {
  if (!item) return 0;

  const countAnggota = item?._count?.anggota;

  if (
    countAnggota !== undefined &&
    countAnggota !== null
  ) {
    const value = Number(countAnggota);

    return Number.isFinite(value) ? value : 0;
  }

  if (
    item?.jumlahSiswa !== undefined &&
    item?.jumlahSiswa !== null
  ) {
    const value = Number(item.jumlahSiswa);

    return Number.isFinite(value) ? value : 0;
  }

  if (
    item?.jumlah_siswa !== undefined &&
    item?.jumlah_siswa !== null
  ) {
    const value = Number(item.jumlah_siswa);

    return Number.isFinite(value) ? value : 0;
  }

  if (Array.isArray(item?.anggota)) {
    return item.anggota.length;
  }

  return 0;
}

function getNamaWaliKelas(item) {
  return (
    item?.waliKelas?.namaLengkap ||
    item?.waliKelas?.nama ||
    item?.wali_kelas?.namaLengkap ||
    item?.wali_kelas?.nama ||
    "Belum ditentukan"
  );
}

/**
 * Membaca nama tahun ajaran dari beberapa kemungkinan
 * bentuk response backend.
 *
 * Backend bisa mengirim:
 *
 * tahunAjaran: {
 *   tahunAjaran: "2026/2027",
 *   semester: "Genap"
 * }
 *
 * atau:
 *
 * tahunAjaran: {
 *   nama: "2026/2027",
 *   semester: "Genap"
 * }
 */
function getNamaTahunAjaran(item) {
  return (
    item?.tahunAjaran?.nama ||
    item?.tahunAjaran?.tahunAjaran ||
    item?.tahun_ajaran?.nama ||
    item?.tahun_ajaran?.tahunAjaran ||
    item?.tahun_ajaran ||
    item?.tahunAjaranNama ||
    item?.tahun_ajaran_nama ||
    "-"
  );
}

function getSemesterTahunAjaran(item) {
  return (
    item?.tahunAjaran?.semester ||
    item?.tahun_ajaran?.semester ||
    item?.semester ||
    "-"
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
  valueClass,
}) {
  return (
    <div className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p
            className={`mt-2 text-2xl font-bold tracking-tight ${
              valueClass || "text-slate-800"
            }`}
          >
            {value}
          </p>

          <p className="mt-1 truncate text-[11px] text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

// =========================================================
// MAIN
// =========================================================

export default function AdminKelasPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [kelas, setKelas] = useState([]);
  const [tahunAjaran, setTahunAjaran] = useState([]);

  const [search, setSearch] = useState("");
  const [jenjangFilter, setJenjangFilter] = useState("Semua");
  const [tahunAjaranFilter, setTahunAjaranFilter] =
    useState("Semua");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [totalData, setTotalData] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

// =========================================================
// LOAD TAHUN AJARAN
// =========================================================

  const loadTahunAjaran = async () => {
    try {
      const response = await getTahunAjaran();

      let list = [];

      if (Array.isArray(response)) {
        list = response;
      } else if (Array.isArray(response?.data)) {
        list = response.data;
      } else if (
        Array.isArray(response?.data?.data)
      ) {
        list = response.data.data;
      }

      /**
       * Normalisasi response backend.
       *
       * Backend:
       * tahunAjaran: "2026/2027"
       *
       * FE:
       * nama: "2026/2027"
       */
      const normalized = list.map((item) => ({
        ...item,

        nama:
          item?.nama ||
          item?.tahunAjaran ||
          item?.tahun_ajaran ||
          "",

        semester:
          item?.semester ||
          "-",
      }));

      console.log(
        "========== TAHUN AJARAN API =========="
      );
      console.log("Response:", response);
      console.log("Data:", normalized);
      console.log(
        "Jumlah tahun ajaran:",
        normalized.length
      );
      console.log(
        "======================================"
      );

      setTahunAjaran(normalized);
    } catch (err) {
      console.error(
        "Gagal mengambil tahun ajaran:",
        err
      );

      setTahunAjaran([]);
    }
  };

// =========================================================
// LOAD KELAS
// =========================================================

  const loadKelas = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      let tingkat;

      if (jenjangFilter === "X") {
        tingkat = 10;
      } else if (jenjangFilter === "XI") {
        tingkat = 11;
      } else if (jenjangFilter === "XII") {
        tingkat = 12;
      }

      const response = await getKelas({
        page: currentPage,
        limit: itemsPerPage,

        search:
          search.trim() || undefined,

        tahunAjaranId:
          tahunAjaranFilter !== "Semua"
            ? tahunAjaranFilter
            : undefined,

        tingkat,

        sortBy: "tingkat",
        sortOrder: "asc",
      });

      console.log(
        "========== KELAS API =========="
      );
      console.log("Response:", response);
      console.log("Data:", response?.data);

      if (Array.isArray(response?.data)) {
        response.data.forEach((item) => {
          console.log(
            `Kelas "${item?.nama}"`,
            {
              id: item?.id,
              tingkat: item?.tingkat,

              tahunAjaran:
                item?.tahunAjaran,

              tahun_ajaran:
                item?.tahun_ajaran,

              jumlahSiswa:
                item?.jumlahSiswa,

              count:
                item?._count,

              anggota:
                item?.anggota,

              waliKelas:
                item?.waliKelas,
            }
          );
        });
      }

      console.log(
        "==============================="
      );

      const data =
        Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];

      setKelas(data);

      const pagination =
        response?.pagination ||
        response?.meta ||
        {};

      const total = Number(
        pagination?.totalData ??
          pagination?.total ??
          response?.totalData ??
          response?.total ??
          data.length
      );

      setTotalData(
        Number.isFinite(total)
          ? total
          : data.length
      );
    } catch (err) {
      console.error(
        "Gagal mengambil data kelas:",
        err
      );

      setKelas([]);
      setTotalData(0);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data kelas."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

// =========================================================
// INITIAL LOAD
// =========================================================

  useEffect(() => {
    loadTahunAjaran();
  }, []);

// =========================================================
// LOAD KELAS
// =========================================================

  useEffect(() => {
    loadKelas(false);
  }, [
    currentPage,
    itemsPerPage,
    search,
    jenjangFilter,
    tahunAjaranFilter,
  ]);

// =========================================================
// TOTAL PAGE
// =========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalData / itemsPerPage
    )
  );

// =========================================================
// SAFETY CURRENT PAGE
// =========================================================

  useEffect(() => {
    if (
      currentPage > totalPages &&
      currentPage > 1
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

// =========================================================
// DISPLAYED DATA
// =========================================================

  const displayedKelas = useMemo(() => {
    return Array.isArray(kelas)
      ? kelas
      : [];
  }, [kelas]);

// =========================================================
// STATISTICS
// =========================================================

  const totalKelas = totalData;

  const totalSiswa = useMemo(() => {
    return displayedKelas.reduce(
      (total, item) => {
        return (
          total +
          getJumlahSiswa(item)
        );
      },
      0
    );
  }, [displayedKelas]);

  const totalWali = useMemo(() => {
    return displayedKelas.filter(
      (item) =>
        Boolean(
          item?.waliKelasId ||
          item?.wali_kelas_id
        )
    ).length;
  }, [displayedKelas]);

  const totalTanpaWali =
    displayedKelas.length -
    totalWali;

// =========================================================
// REFRESH
// =========================================================

  const handleRefresh = async () => {
    await Promise.all([
      loadTahunAjaran(),
      loadKelas(true),
    ]);
  };

// =========================================================
// DELETE
// =========================================================

  const handleDelete = async (item) => {
    const confirmed =
      window.confirm(
        `Yakin ingin menghapus kelas "${item.nama}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteKelas(item.id);

      await loadKelas(true);
    } catch (err) {
      console.error(
        "Gagal menghapus kelas:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus kelas."
      );
    }
  };

// =========================================================
// PAGINATION
// =========================================================

  const goToPage = (page) => {
    if (
      page >= 1 &&
      page <= totalPages
    ) {
      setCurrentPage(page);
    }
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from(
        {
          length: totalPages,
        },
        (_, index) =>
          index + 1
      );
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (
      currentPage >=
      totalPages - 2
    ) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  }, [
    currentPage,
    totalPages,
  ]);

  const startIndex =
    totalData === 0
      ? 0
      : (currentPage - 1) *
          itemsPerPage +
        1;

  const endIndex = Math.min(
    currentPage * itemsPerPage,
    totalData
  );

// =========================================================
// LOADING
// =========================================================

  if (loading) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-slate-100">

        <Sidebar
          active="kelas"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

          <Header
            toggleSidebar={() =>
              setIsCollapsed(
                (prev) => !prev
              )
            }
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email:
                "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex min-h-0 flex-1 items-center justify-center">

            <div className="flex flex-col items-center gap-3">

              <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />

              <p className="text-sm font-medium text-slate-500">
                Memuat data kelas...
              </p>

            </div>

          </main>

        </div>

      </div>
    );
  }

// =========================================================
// PAGE
// =========================================================

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100">

      {/* SIDEBAR */}

      <Sidebar
        active="kelas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      {/* CONTENT */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* HEADER */}

        <Header
          toggleSidebar={() =>
            setIsCollapsed(
              (prev) => !prev
            )
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email:
              "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* MAIN */}

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">

          <div className="w-full px-4 py-5 sm:px-5 sm:py-6 md:px-6 lg:px-8 xl:px-10">

            <div className="w-full space-y-5">

              {/* PAGE HEADER */}

              <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 shadow-sm sm:p-6">

                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-100/60 blur-2xl" />

                <div className="pointer-events-none absolute -bottom-16 right-40 h-32 w-32 rounded-full bg-indigo-100/50 blur-2xl" />

                <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                      <GraduationCap size={23} />
                    </div>

                    <div className="min-w-0">

                      <div className="mb-1 flex flex-wrap items-center gap-2">

                        <span className="rounded-md bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                          Akademik
                        </span>

                        <span className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-slate-500 shadow-sm">
                          {totalKelas} Kelas
                        </span>

                      </div>

                      <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                        Kelola Kelas
                      </h1>

                      <p className="mt-1 text-sm text-slate-500">
                        Kelola data kelas,
                        wali kelas, tahun
                        ajaran, dan
                        kapasitas siswa.
                      </p>

                    </div>

                  </div>

                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">

                    <button
                      type="button"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <RefreshCw
                        size={17}
                        className={
                          refreshing
                            ? "animate-spin"
                            : ""
                        }
                      />

                      Refresh

                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/admin/kelas/tambah"
                        )
                      }
                      className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 hover:shadow-lg"
                    >

                      <Plus size={18} />

                      Tambah Kelas

                    </button>

                  </div>

                </div>

              </section>

              {/* ERROR */}

              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-semibold text-red-700">
                      Gagal memuat data kelas
                    </p>

                    <p className="mt-1 break-words text-xs leading-5 text-red-600">
                      {error}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                    className="rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>

                </div>
              )}

              {/* STATISTICS */}

              <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">

                <StatCard
                  icon={GraduationCap}
                  label="Total Kelas"
                  value={totalKelas}
                  description="Kelas terdaftar"
                  iconClass="bg-blue-100 text-blue-700"
                />

                <StatCard
                  icon={Users}
                  label="Total Siswa"
                  value={totalSiswa}
                  description="Siswa pada halaman"
                  iconClass="bg-indigo-100 text-indigo-700"
                  valueClass="text-indigo-700"
                />

                <StatCard
                  icon={UserCheck}
                  label="Punya Wali"
                  value={totalWali}
                  description="Sudah ada wali kelas"
                  iconClass="bg-emerald-100 text-emerald-700"
                  valueClass="text-emerald-700"
                />

                <StatCard
                  icon={School}
                  label="Belum Ada Wali"
                  value={totalTanpaWali}
                  description="Belum ditentukan"
                  iconClass="bg-amber-100 text-amber-700"
                  valueClass="text-amber-700"
                />

              </section>

              {/* FILTER */}

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="flex flex-col gap-3">

                  {/* SEARCH */}

                  <div className="relative">

                    <Search
                      size={17}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(
                          e.target.value
                        );

                        setCurrentPage(1);
                      }}
                      placeholder="Cari nama kelas atau wali kelas..."
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition hover:border-slate-400 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                  </div>

                  {/* FILTER */}

                  <div className="flex flex-wrap items-center gap-2">

                    <select
                      value={jenjangFilter}
                      onChange={(e) => {
                        setJenjangFilter(
                          e.target.value
                        );

                        setCurrentPage(1);
                      }}
                      className="min-w-[130px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >

                      <option value="Semua">
                        Semua Jenjang
                      </option>

                      <option value="X">
                        Kelas X
                      </option>

                      <option value="XI">
                        Kelas XI
                      </option>

                      <option value="XII">
                        Kelas XII
                      </option>

                    </select>

                    <select
                      value={tahunAjaranFilter}
                      onChange={(e) => {
                        setTahunAjaranFilter(
                          e.target.value
                        );

                        setCurrentPage(1);
                      }}
                      className="min-w-[200px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >

                      <option value="Semua">
                        Semua Tahun Ajaran
                      </option>

                      {tahunAjaran.map(
                        (item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.nama ||
                              item.tahunAjaran ||
                              "-"}{" "}
                            ·{" "}
                            {item.semester ||
                              "-"}
                          </option>
                        )
                      )}

                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setJenjangFilter(
                          "Semua"
                        );
                        setTahunAjaranFilter(
                          "Semua"
                        );
                        setCurrentPage(1);
                      }}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                      Reset
                    </button>

                    <span className="ml-auto hidden text-sm text-slate-500 sm:block">
                      {totalData} kelas ditemukan
                    </span>

                  </div>

                </div>

              </section>

              {/* TABLE */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                  <div>

                    <h2 className="text-sm font-bold text-slate-800 sm:text-base">
                      Daftar Kelas
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Data langsung dari database sekolah.
                    </p>

                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm">

                    <CalendarDays size={14} />

                    <span>
                      {tahunAjaranFilter ===
                      "Semua"
                        ? "Semua Tahun Ajaran"
                        : tahunAjaran.find(
                            (item) =>
                              item.id ===
                              tahunAjaranFilter
                          )?.nama ||
                          "Filter Tahun Ajaran"}
                    </span>

                  </div>

                </div>

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[1050px]">

                    <thead>

                      <tr className="border-b border-slate-200 bg-white">

                        <th className="w-[6%] px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          No
                        </th>

                        <th className="w-[20%] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Kelas
                        </th>

                        <th className="w-[11%] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Tingkat
                        </th>

                        <th className="w-[23%] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Wali Kelas
                        </th>

                        <th className="w-[17%] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Tahun Ajaran
                        </th>

                        <th className="w-[11%] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Siswa
                        </th>

                        <th className="w-[12%] px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Aksi
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {displayedKelas.length ===
                      0 ? (

                        <tr>

                          <td
                            colSpan={7}
                            className="px-5 py-16 text-center"
                          >

                            <div className="mx-auto flex max-w-sm flex-col items-center">

                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <GraduationCap
                                  size={28}
                                />
                              </div>

                              <p className="mt-4 text-sm font-bold text-slate-700">
                                Belum ada data kelas
                              </p>

                              <p className="mt-1 text-xs leading-5 text-slate-400">
                                Belum ada kelas yang
                                sesuai dengan
                                sekolah atau filter
                                yang dipilih.
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    "/admin/kelas/tambah"
                                  )
                                }
                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                              >

                                <Plus size={15} />

                                Tambah Kelas

                              </button>

                            </div>

                          </td>

                        </tr>

                      ) : (

                        displayedKelas.map(
                          (item, index) => {

                            const jumlahSiswa =
                              getJumlahSiswa(
                                item
                              );

                            const jenjang =
                              getJenjangFromTingkat(
                                item.tingkat
                              );

                            const wali =
                              getNamaWaliKelas(
                                item
                              );

                            const namaTahunAjaran =
                              getNamaTahunAjaran(
                                item
                              );

                            const semester =
                              getSemesterTahunAjaran(
                                item
                              );

                            return (

                              <tr
                                key={item.id}
                                className="group transition-colors hover:bg-blue-50/40"
                              >

                                {/* NO */}

                                <td className="px-4 py-4 text-center text-sm font-medium text-slate-500">
                                  {(currentPage -
                                    1) *
                                    itemsPerPage +
                                    index +
                                    1}
                                </td>

                                {/* KELAS */}

                                <td className="px-4 py-4">

                                  <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                      <GraduationCap
                                        size={18}
                                      />
                                    </div>

                                    <div className="min-w-0">

                                      <p className="truncate text-sm font-bold text-slate-800">
                                        {item.nama ||
                                          "-"}
                                      </p>

                                      <p className="mt-0.5 text-[11px] text-slate-400">
                                        Kapasitas{" "}
                                        {item.kapasitas ??
                                          0}{" "}
                                        siswa
                                      </p>

                                    </div>

                                  </div>

                                </td>

                                {/* TINGKAT */}

                                <td className="px-4 py-4">

                                  <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                    {jenjang}
                                  </span>

                                  <p className="mt-1 text-[10px] text-slate-400">
                                    Tingkat{" "}
                                    {item.tingkat ??
                                      "-"}
                                  </p>

                                </td>

                                {/* WALI */}

                                <td className="px-4 py-4">

                                  <div className="flex items-center gap-2">

                                    <div
                                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                        item.waliKelasId ||
                                        item.wali_kelas_id
                                          ? "bg-emerald-50 text-emerald-600"
                                          : "bg-slate-100 text-slate-400"
                                      }`}
                                    >
                                      <UserCheck
                                        size={15}
                                      />
                                    </div>

                                    <div className="min-w-0">

                                      <p
                                        className={`truncate text-sm font-medium ${
                                          item.waliKelasId ||
                                          item.wali_kelas_id
                                            ? "text-slate-700"
                                            : "text-slate-400"
                                        }`}
                                      >
                                        {wali}
                                      </p>

                                      {(item
                                        ?.waliKelas
                                        ?.nip ||
                                        item
                                          ?.wali_kelas
                                          ?.nip) && (
                                        <p className="mt-0.5 truncate text-[10px] text-slate-400">
                                          NIP{" "}
                                          {item
                                            ?.waliKelas
                                            ?.nip ||
                                            item
                                              ?.wali_kelas
                                              ?.nip}
                                        </p>
                                      )}

                                    </div>

                                  </div>

                                </td>

                                {/* TAHUN AJARAN */}

                                <td className="px-4 py-4">

                                  <div className="flex items-center gap-2">

                                    <CalendarDays
                                      size={15}
                                      className="shrink-0 text-slate-400"
                                    />

                                    <div className="min-w-0">

                                      <p className="truncate text-sm font-medium text-slate-700">
                                        {
                                          namaTahunAjaran
                                        }
                                      </p>

                                      <p className="text-[10px] text-slate-400">
                                        Semester{" "}
                                        {
                                          semester
                                        }
                                      </p>

                                    </div>

                                  </div>

                                </td>

                                {/* SISWA */}

                                <td className="px-4 py-4">

                                  <div className="flex items-center gap-1.5">

                                    <Users
                                      size={15}
                                      className="text-slate-400"
                                    />

                                    <span className="text-sm font-semibold text-slate-700">
                                      {
                                        jumlahSiswa
                                      }
                                    </span>

                                  </div>

                                </td>

                                {/* AKSI */}

                                <td className="px-4 py-4">

                                  <div className="flex items-center justify-end gap-1">

                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push(
                                          `/admin/kelas/${item.id}`
                                        )
                                      }
                                      className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-100 hover:text-blue-700"
                                      title="Detail Kelas"
                                    >
                                      <Eye
                                        size={17}
                                      />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push(
                                          `/admin/kelas/edit/${item.id}`
                                        )
                                      }
                                      className="rounded-lg p-2 text-slate-400 transition hover:bg-amber-100 hover:text-amber-700"
                                      title="Edit Kelas"
                                    >
                                      <Edit
                                        size={17}
                                      />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDelete(
                                          item
                                        )
                                      }
                                      className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-100 hover:text-rose-700"
                                      title="Hapus Kelas"
                                    >
                                      <Trash2
                                        size={17}
                                      />
                                    </button>

                                  </div>

                                </td>

                              </tr>

                            );
                          }
                        )

                      )}

                    </tbody>

                  </table>

                </div>

                {/* PAGINATION */}

                {totalData > 0 && (

                  <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="text-[11px] text-slate-500">

                      Menampilkan{" "}

                      <span className="font-semibold text-slate-700">
                        {startIndex}
                      </span>{" "}

                      -{" "}

                      <span className="font-semibold text-slate-700">
                        {endIndex}
                      </span>{" "}

                      dari{" "}

                      <span className="font-semibold text-slate-700">
                        {totalData}
                      </span>{" "}

                      kelas

                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(
                            Number(
                              e.target.value
                            )
                          );

                          setCurrentPage(1);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 outline-none focus:border-blue-500"
                      >

                        <option value={10}>
                          10 / halaman
                        </option>

                        <option value={20}>
                          20 / halaman
                        </option>

                        <option value={40}>
                          40 / halaman
                        </option>

                      </select>

                      <button
                        type="button"
                        onClick={() =>
                          goToPage(
                            currentPage - 1
                          )
                        }
                        disabled={
                          currentPage === 1
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Prev
                      </button>

                      {pageNumbers.map(
                        (page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() =>
                              goToPage(page)
                            }
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition ${
                              currentPage ===
                              page
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-500 hover:bg-white hover:text-blue-600"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          goToPage(
                            currentPage + 1
                          )
                        }
                        disabled={
                          currentPage >=
                          totalPages
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>

                    </div>

                  </div>

                )}

              </section>

              {/* INFO */}

              <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                    <School size={17} />
                  </div>

                  <div>

                    <p className="text-xs font-bold text-blue-800">
                      Data berdasarkan sekolah
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-blue-700/70">
                      Data kelas yang
                      ditampilkan berasal
                      dari sekolah yang
                      terhubung dengan akun
                      admin yang sedang
                      login.
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                    <LayoutGrid size={17} />
                  </div>

                  <div>

                    <p className="text-xs font-bold text-indigo-800">
                      Terhubung ke backend
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-indigo-700/70">
                      Tambah, ubah, lihat
                      detail, dan hapus
                      kelas diproses melalui
                      API backend.
                    </p>

                  </div>

                </div>

              </section>

              {/* FOOTER */}

              <footer className="border-t border-slate-200 py-5 text-center">

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">

                  <LayoutGrid size={14} />

                  <span>
                    © 2026 SmartSchool •
                    Kelola Kelas
                  </span>

                </div>

              </footer>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}