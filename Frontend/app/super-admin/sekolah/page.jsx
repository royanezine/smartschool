"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import {
  getSekolahBinaan,
  getYayasanSummary,
} from "../../../services/yayasan.service";

import {
  Building2,
  Users,
  GraduationCap,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock3,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  LayoutGrid,
  Database,
} from "lucide-react";

// ============================================================
// STATUS STYLE
// ============================================================

const statusColorMap = {
  Aktif: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },

  Trial: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },

  Nonaktif: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
};

// ============================================================
// PAKET STYLE
// ============================================================

const paketColorMap = {
  Enterprise: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },

  Professional: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },

  Starter: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
  },
};

// ============================================================
// HELPER RESPONSE API
// ============================================================

function unwrapArrayResponse(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  if (Array.isArray(result?.data?.data)) {
    return result.data.data;
  }

  if (Array.isArray(result?.result)) {
    return result.result;
  }

  if (Array.isArray(result?.result?.data)) {
    return result.result.data;
  }

  if (Array.isArray(result?.response)) {
    return result.response;
  }

  if (Array.isArray(result?.response?.data)) {
    return result.response.data;
  }

  return [];
}

function unwrapObjectResponse(result) {
  if (!result) {
    return {};
  }

  if (
    result?.data &&
    !Array.isArray(result.data) &&
    typeof result.data === "object"
  ) {
    if (
      result.data.data &&
      typeof result.data.data === "object" &&
      !Array.isArray(result.data.data)
    ) {
      return result.data.data;
    }

    return result.data;
  }

  if (
    result?.result &&
    typeof result.result === "object" &&
    !Array.isArray(result.result)
  ) {
    if (
      result.result.data &&
      typeof result.result.data === "object" &&
      !Array.isArray(result.result.data)
    ) {
      return result.result.data;
    }

    return result.result;
  }

  if (
    result?.response?.data &&
    typeof result.response.data === "object" &&
    !Array.isArray(result.response.data)
  ) {
    return result.response.data;
  }

  return result;
}

// ============================================================
// HELPER VALUE
// ============================================================

function firstValue(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return "-";
}

function normalizeStatus(value) {
  const status = String(value || "")
    .trim()
    .toLowerCase();

  if (
    status === "aktif" ||
    status === "active" ||
    status === "berlangganan" ||
    status === "paid"
  ) {
    return "Aktif";
  }

  if (
    status === "uji coba" ||
    status === "uji_coba" ||
    status === "trial"
  ) {
    return "Trial";
  }

  if (
    status === "nonaktif" ||
    status === "inactive" ||
    status === "tidak aktif" ||
    status === "expired"
  ) {
    return "Nonaktif";
  }

  return value ? String(value) : "Nonaktif";
}

function normalizeJenjang(item) {
  const value = firstValue(
    item?.jenjang,
    item?.tingkat,
    item?.level,
    item?.jenisSekolah,
    item?.jenis
  );

  if (value === "-") {
    return "-";
  }

  return String(value);
}

function normalizePaket(item) {
  const langganan =
    item?.langgananSekolah?.[0] ||
    item?.langganan?.[0] ||
    item?.langgananSekolah ||
    item?.langganan ||
    null;

  return firstValue(
    langganan?.paket?.nama,
    item?.paket?.nama,
    item?.paketNama,
    item?.paket
  );
}

function normalizeSchool(item, index) {
  const langganan =
    item?.langgananSekolah?.[0] ||
    item?.langganan?.[0] ||
    item?.langgananSekolah ||
    item?.langganan ||
    null;

  const paketNama = normalizePaket(item);

  const rawStatus =
    item?.status ||
    langganan?.statusLangganan ||
    langganan?.statusPembayaran;

  return {
    id: item?.id || `school-${index}`,

    nama: firstValue(
      item?.nama,
      item?.namaSekolah,
      item?.name
    ),

    npsn: firstValue(
      item?.npsn,
      item?.NPSN
    ),

    jenjang: normalizeJenjang(item),

    yayasan: firstValue(
      item?.yayasan?.nama,
      item?.namaYayasan,
      item?.yayasanNama
    ),

    paket:
      paketNama === "-"
        ? "Starter"
        : paketNama,

    status: normalizeStatus(rawStatus),

    statusSekolah: firstValue(
      item?.status,
      item?.statusSekolah
    ),

    subdomain: firstValue(
      item?.subdomain
    ),

    email: firstValue(
      item?.email
    ),

    telepon: firstValue(
      item?.telepon,
      item?.noTelepon
    ),

    alamat: firstValue(
      item?.alamat
    ),

    logo: firstValue(
      item?.logoBesarUrl,
      item?.logoKecilUrl,
      item?.logo
    ),

    totalGuru: Number(
      firstValue(
        item?.totalGuru,
        item?.jumlahGuru,
        0
      )
    ) || 0,

    totalSiswa: Number(
      firstValue(
        item?.totalSiswa,
        item?.jumlahSiswa,
        0
      )
    ) || 0,

    totalKelas: Number(
      firstValue(
        item?.totalKelas,
        item?.jumlahKelas,
        0
      )
    ) || 0,

    tanggalMulai: langganan?.tanggalMulai || null,

    tanggalBerakhir:
      langganan?.tanggalBerakhir || null,

    createdAt:
      item?.dibuatPada ||
      item?.createdAt ||
      null,
  };
}

// ============================================================
// SORT CONTROL
// ============================================================

function SortControl({
  sortField,
  sortOrder,
  onSort,
}) {
  const sortOptions = [
    {
      value: "nama",
      label: "Nama Sekolah",
    },
    {
      value: "npsn",
      label: "NPSN",
    },
    {
      value: "jenjang",
      label: "Jenjang",
    },
    {
      value: "status",
      label: "Status",
    },
    {
      value: "paket",
      label: "Paket",
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <select
        value={sortField}
        onChange={(e) =>
          onSort(
            e.target.value,
            sortOrder
          )
        }
        className="
          h-9
          rounded-xl
          border
          border-slate-200
          bg-slate-50
          px-3
          text-xs
          font-medium
          text-slate-600
          outline-none
          transition-all
          focus:border-blue-400
          focus:bg-white
          focus:ring-4
          focus:ring-blue-500/10
        "
      >
        {sortOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() =>
          onSort(
            sortField,
            sortOrder === "asc"
              ? "desc"
              : "asc"
          )
        }
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          border
          border-slate-200
          bg-slate-50
          text-slate-500
          transition-all
          hover:border-slate-300
          hover:bg-slate-100
        "
        title={
          sortOrder === "asc"
            ? "Urutkan menurun"
            : "Urutkan menaik"
        }
      >
        {sortOrder === "asc" ? (
          <ArrowUp
            size={16}
            className="text-blue-500"
          />
        ) : (
          <ArrowDown
            size={16}
            className="text-blue-500"
          />
        )}
      </button>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function DataSekolahPage() {
  const router = useRouter();

  const [activeMenu, setActiveMenu] =
    useState("sekolah");

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [sekolahData, setSekolahData] =
    useState([]);

  const [stats, setStats] = useState({
    total: 0,
    aktif: 0,
    nonaktif: 0,
    trial: 0,
    totalGuru: 0,
    totalSiswa: 0,
  });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [currentUser, setCurrentUser] =
    useState({
      name: "Super Admin",
      email: "",
      avatar: "SA",
    });

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedJenjang, setSelectedJenjang] =
    useState("Semua");

  const [selectedStatus, setSelectedStatus] =
    useState("Semua");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [isMobile, setIsMobile] =
    useState(false);

  const [sortField, setSortField] =
    useState("nama");

  const [sortOrder, setSortOrder] =
    useState("asc");

  const itemsPerPage = 5;

  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  const notifications = [
    {
      id: 1,
      title: "Pembaruan Sistem v2.0",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Pengingat: Backup Data",
      desc: "Dikirim 1 hari lalu",
      read: false,
    },
  ];

  // ==========================================================
  // LOAD USER
  // ==========================================================

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem("user");

      if (!savedUser) {
        return;
      }

      const parsedUser =
        JSON.parse(savedUser);

      const name =
        parsedUser?.namaLengkap ||
        parsedUser?.nama ||
        parsedUser?.name ||
        parsedUser?.username ||
        "Super Admin";

      const email =
        parsedUser?.email || "";

      const avatar =
        name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((word) =>
            word.charAt(0).toUpperCase()
          )
          .join("") || "SA";

      setCurrentUser({
        name,
        email,
        avatar,
      });
    } catch (err) {
      console.error(
        "Gagal membaca user localStorage:",
        err
      );
    }
  }, []);

  // ==========================================================
  // RESPONSIVE
  // ==========================================================

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(
        window.innerWidth < 768
      );
    };

    handleResize();

    window.addEventListener(
      "resize",
      handleResize
    );

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

  // ==========================================================
  // FETCH DATA
  // ==========================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        sekolahResponse,
        summaryResponse,
      ] = await Promise.all([
        getSekolahBinaan(),
        getYayasanSummary(),
      ]);

      // ======================================================
      // DEBUG RESPONSE
      // ======================================================

      console.log(
        "================================="
      );

      console.log(
        "RAW SEKOLAH RESPONSE:",
        sekolahResponse
      );

      console.log(
        "RAW SEKOLAH RESPONSE TYPE:",
        typeof sekolahResponse
      );

      console.log(
        "RAW SEKOLAH IS ARRAY:",
        Array.isArray(
          sekolahResponse
        )
      );

      console.log(
        "RAW SUMMARY RESPONSE:",
        summaryResponse
      );

      console.log(
        "================================="
      );

      // ======================================================
      // NORMALIZE SCHOOL RESPONSE
      // ======================================================

      const rawSchools =
        unwrapArrayResponse(
          sekolahResponse
        );

      console.log(
        "NORMALIZED SCHOOL ARRAY:",
        rawSchools
      );

      console.log(
        "NORMALIZED SCHOOL COUNT:",
        rawSchools.length
      );

      const normalizedSchools =
        rawSchools.map(
          normalizeSchool
        );

      setSekolahData(
        normalizedSchools
      );

      // ======================================================
      // SUMMARY
      // ======================================================

      const summary =
        unwrapObjectResponse(
          summaryResponse
        );

      console.log(
        "NORMALIZED SUMMARY:",
        summary
      );

      const total =
        Number(
          firstValue(
            summary?.totalSekolah,
            normalizedSchools.length,
            0
          )
        ) || 0;

      const aktifFromSummary =
        Number(
          summary?.sekolahAktif
        );

      const trialFromSummary =
        Number(
          summary?.sekolahUjiCoba
        );

      const aktif =
        Number.isFinite(
          aktifFromSummary
        ) &&
        aktifFromSummary >= 0
          ? aktifFromSummary
          : normalizedSchools.filter(
              (item) =>
                item.status === "Aktif"
            ).length;

      const trial =
        Number.isFinite(
          trialFromSummary
        ) &&
        trialFromSummary >= 0
          ? trialFromSummary
          : normalizedSchools.filter(
              (item) =>
                item.status === "Trial"
            ).length;

      const nonaktif =
        Math.max(
          0,
          total - aktif - trial
        );

      const totalGuru =
        Number(
          firstValue(
            summary?.totalGuru,
            normalizedSchools.reduce(
              (sum, item) =>
                sum +
                (Number(
                  item.totalGuru
                ) || 0),
              0
            ),
            0
          )
        ) || 0;

      const totalSiswa =
        Number(
          firstValue(
            summary?.totalSiswa,
            summary?.totalPenggunaAktif,
            normalizedSchools.reduce(
              (sum, item) =>
                sum +
                (Number(
                  item.totalSiswa
                ) || 0),
              0
            ),
            0
          )
        ) || 0;

      setStats({
        total,
        aktif,
        nonaktif,
        trial,
        totalGuru,
        totalSiswa,
      });
    } catch (err) {
      console.error(
        "ERROR LOAD DATA SEKOLAH:",
        err
      );

      setSekolahData([]);

      setError(
        err?.message ||
          "Gagal mengambil data sekolah dari server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================================
  // FILTER OPTIONS
  // ==========================================================

  const jenjangOptions = useMemo(() => {
    const values =
      sekolahData
        .map(
          (item) => item.jenjang
        )
        .filter(
          (value) =>
            value &&
            value !== "-"
        );

    return [
      "Semua",
      ...Array.from(
        new Set(values)
      ).sort(),
    ];
  }, [sekolahData]);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredData = useMemo(() => {
    const keyword =
      searchQuery
        .trim()
        .toLowerCase();

    return sekolahData.filter(
      (item) => {
        const matchesSearch =
          !keyword ||
          [
            item.nama,
            item.npsn,
            item.jenjang,
            item.yayasan,
            item.paket,
            item.status,
            item.subdomain,
            item.email,
          ]
            .join(" ")
            .toLowerCase()
            .includes(keyword);

        const matchesJenjang =
          selectedJenjang === "Semua" ||
          item.jenjang ===
            selectedJenjang;

        const matchesStatus =
          selectedStatus === "Semua" ||
          item.status ===
            selectedStatus;

        return (
          matchesSearch &&
          matchesJenjang &&
          matchesStatus
        );
      }
    );
  }, [
    sekolahData,
    searchQuery,
    selectedJenjang,
    selectedStatus,
  ]);

  // ==========================================================
  // SORT
  // ==========================================================

  const sortedData = useMemo(() => {
    const data = [
      ...filteredData,
    ];

    data.sort((a, b) => {
      const first = String(
        a?.[sortField] ?? ""
      ).toLowerCase();

      const second = String(
        b?.[sortField] ?? ""
      ).toLowerCase();

      if (first < second) {
        return sortOrder === "asc"
          ? -1
          : 1;
      }

      if (first > second) {
        return sortOrder === "asc"
          ? 1
          : -1;
      }

      return 0;
    });

    return data;
  }, [
    filteredData,
    sortField,
    sortOrder,
  ]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalPages = Math.ceil(
    sortedData.length /
      itemsPerPage
  );

  const safeTotalPages =
    Math.max(
      totalPages,
      1
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      safeTotalPages
    );

  const startIndex =
    (safeCurrentPage - 1) *
    itemsPerPage;

  const paginatedData =
    sortedData.slice(
      startIndex,
      startIndex +
        itemsPerPage
    );

  // ==========================================================
  // RESET PAGE WHEN FILTER CHANGES
  // ==========================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedJenjang,
    selectedStatus,
  ]);

  // ==========================================================
  // SORT
  // ==========================================================

  const handleSort = (
    field,
    order
  ) => {
    setSortField(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const resetSort = () => {
    setSortField("nama");
    setSortOrder("asc");
  };

  const renderSortIcon = (
    field
  ) => {
    if (
      sortField !== field
    ) {
      return (
        <ArrowUp
          size={12}
          className="text-slate-300"
        />
      );
    }

    return sortOrder === "asc" ? (
      <ArrowUp
        size={12}
        className="text-blue-500"
      />
    ) : (
      <ArrowDown
        size={12}
        className="text-blue-500"
      />
    );
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = (
    item
  ) => {
    window.alert(
      `Fitur hapus sekolah untuk "${item.nama}" belum dihubungkan ke endpoint DELETE backend.`
    );
  };

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">

        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <Sidebar
          active={activeMenu}
          setActive={setActiveMenu}
          collapsed={!sidebarOpen}
          setCollapsed={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
        />

        <div className="flex min-w-0 flex-1 flex-col">

          {/* ==================================================
              HEADER
          ================================================== */}

          <Header
            toggleSidebar={() =>
              setSidebarOpen(
                !sidebarOpen
              )
            }
            notifications={
              notifications
            }
            user={currentUser}
          />

          {/* ==================================================
              MAIN
          ================================================== */}

          <main className="flex-1 p-3 sm:p-5 lg:p-7 xl:p-8">

            <div className="mx-auto w-full max-w-[1600px] space-y-5 sm:space-y-6">

              {/* ==================================================
                  PAGE HEADER
              ================================================== */}

              <section
                className="
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                  shadow-[0_3px_14px_rgba(15,23,42,0.05)]
                  sm:p-6
                "
              >

                <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          bg-blue-50
                          text-blue-600
                        "
                      >
                        <Building2
                          size={20}
                          strokeWidth={1.9}
                        />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-blue-600">
                          Super Admin
                        </p>

                        <h1 className="text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl">
                          Data Sekolah
                        </h1>
                      </div>
                    </div>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                      Kelola dan pantau seluruh
                      data sekolah yang terdaftar
                      pada platform SmartSchool.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/super-admin/sekolah/tambah"
                      )
                    }
                    className="
                      inline-flex
                      h-10
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-blue-600
                      px-4
                      text-sm
                      font-semibold
                      text-white
                      shadow-[0_5px_15px_rgba(37,99,235,0.22)]
                      transition-all
                      hover:bg-blue-700
                      active:scale-[0.98]
                    "
                  >
                    <Plus size={17} />
                    Tambah Sekolah
                  </button>

                </div>

              </section>

              {/* ==================================================
                  STATISTICS
              ================================================== */}

              <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

                <StatCard
                  label="Total Sekolah"
                  value={stats.total}
                  icon={Building2}
                  color="blue"
                />

                <StatCard
                  label="Sekolah Aktif"
                  value={stats.aktif}
                  icon={CheckCircle}
                  color="emerald"
                />

                <StatCard
                  label="Trial"
                  value={stats.trial}
                  icon={Clock3}
                  color="amber"
                />

                <StatCard
                  label="Nonaktif"
                  value={stats.nonaktif}
                  icon={XCircle}
                  color="rose"
                />

                <StatCard
                  label="Total Guru"
                  value={stats.totalGuru}
                  icon={Users}
                  color="violet"
                />

                <StatCard
                  label="Total Siswa"
                  value={stats.totalSiswa}
                  icon={GraduationCap}
                  color="teal"
                />

              </section>

              {/* ==================================================
                  FILTER
              ================================================== */}

              <section
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-4
                  shadow-[0_3px_14px_rgba(15,23,42,0.05)]
                  sm:p-5
                "
              >

                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                  <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">

                    {/* SEARCH */}

                    <div className="relative min-w-0 flex-1">
                      <Search
                        size={17}
                        className="
                          pointer-events-none
                          absolute
                          left-3
                          top-1/2
                          -translate-y-1/2
                          text-slate-400
                        "
                      />

                      <input
                        type="text"
                        value={
                          searchQuery
                        }
                        onChange={(e) =>
                          setSearchQuery(
                            e.target.value
                          )
                        }
                        placeholder="Cari nama sekolah, NPSN, yayasan..."
                        className="
                          h-10
                          w-full
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          pl-10
                          pr-3
                          text-sm
                          text-slate-700
                          outline-none
                          transition-all
                          placeholder:text-slate-400
                          hover:border-slate-300
                          focus:border-blue-400
                          focus:bg-white
                          focus:ring-4
                          focus:ring-blue-500/10
                        "
                      />
                    </div>

                    {/* JENJANG */}

                    <div className="w-full sm:w-[170px]">
                      <FilterSelect
                        value={
                          selectedJenjang
                        }
                        onChange={
                          setSelectedJenjang
                        }
                        options={
                          jenjangOptions
                        }
                      />
                    </div>

                    {/* STATUS */}

                    <div className="w-full sm:w-[160px]">
                      <FilterSelect
                        value={
                          selectedStatus
                        }
                        onChange={
                          setSelectedStatus
                        }
                        options={[
                          "Semua",
                          "Aktif",
                          "Trial",
                          "Nonaktif",
                        ]}
                      />
                    </div>

                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <SlidersHorizontal
                        size={14}
                      />

                      <span>
                        {sortedData.length}{" "}
                        data ditemukan
                      </span>
                    </div>

                    <SortControl
                      sortField={
                        sortField
                      }
                      sortOrder={
                        sortOrder
                      }
                      onSort={
                        handleSort
                      }
                    />

                  </div>

                </div>

                {(searchQuery ||
                  selectedJenjang !==
                    "Semua" ||
                  selectedStatus !==
                    "Semua" ||
                  sortField !== "nama" ||
                  sortOrder !==
                    "asc") && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">

                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                      Filter aktif:
                    </span>

                    {searchQuery && (
                      <span className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-blue-700">
                        "{searchQuery}"
                      </span>
                    )}

                    {selectedJenjang !==
                      "Semua" && (
                      <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                        {selectedJenjang}
                      </span>
                    )}

                    {selectedStatus !==
                      "Semua" && (
                      <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                        {selectedStatus}
                      </span>
                    )}

                    {(sortField !==
                      "nama" ||
                      sortOrder !==
                        "asc") && (
                      <span className="rounded-lg border border-violet-100 bg-violet-50 px-2.5 py-1 text-[10px] font-medium text-violet-700">
                        Sort:{" "}
                        {sortField}{" "}
                        {sortOrder ===
                        "asc"
                          ? "↑"
                          : "↓"}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery(
                          ""
                        );
                        setSelectedJenjang(
                          "Semua"
                        );
                        setSelectedStatus(
                          "Semua"
                        );
                        resetSort();
                      }}
                      className="ml-auto text-[10px] text-slate-400 transition-colors hover:text-slate-600 hover:underline"
                    >
                      Reset Filter
                    </button>

                  </div>
                )}

              </section>

              {/* ==================================================
                  TABLE
              ================================================== */}

              <section
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-[0_3px_14px_rgba(15,23,42,0.05)]
                "
              >

                {loading ? (
                  <LoadingState />
                ) : error ? (
                  <ErrorState
                    message={error}
                  />
                ) : isMobile ? (

                  /* ================= MOBILE ================= */

                  <div className="divide-y divide-slate-100">

                    {paginatedData.length ===
                    0 ? (
                      <EmptyState />
                    ) : (
                      paginatedData.map(
                        (
                          item,
                          index
                        ) => (
                          <MobileSchoolCard
                            key={
                              item.id
                            }
                            item={
                              item
                            }
                            number={
                              startIndex +
                              index +
                              1
                            }
                            router={
                              router
                            }
                            onDelete={
                              handleDelete
                            }
                            sortField={
                              sortField
                            }
                            sortOrder={
                              sortOrder
                            }
                          />
                        )
                      )
                    )}

                  </div>

                ) : (

                  /* ================= DESKTOP ================= */

                  <div className="w-full overflow-x-auto">

                    <table className="w-full min-w-[1080px] border-collapse">

                      <colgroup>
                        <col className="w-[60px]" />
                        <col className="w-[280px]" />
                        <col className="w-[120px]" />
                        <col className="w-[100px]" />
                        <col className="w-[180px]" />
                        <col className="w-[140px]" />
                        <col className="w-[140px]" />
                        <col className="w-[120px]" />
                      </colgroup>

                      <thead>

                        <tr className="border-b border-slate-200 bg-slate-50/80">

                          <TableHead>
                            No
                          </TableHead>

                          <TableHead
                            sortable
                            onClick={() =>
                              handleSort(
                                "nama",
                                sortField ===
                                  "nama" &&
                                  sortOrder ===
                                    "asc"
                                  ? "desc"
                                  : "asc"
                              )
                            }
                          >
                            <span className="flex items-center gap-1">
                              Nama Sekolah
                              {renderSortIcon(
                                "nama"
                              )}
                            </span>
                          </TableHead>

                          <TableHead
                            sortable
                            onClick={() =>
                              handleSort(
                                "npsn",
                                sortField ===
                                  "npsn" &&
                                  sortOrder ===
                                    "asc"
                                  ? "desc"
                                  : "asc"
                              )
                            }
                          >
                            <span className="flex items-center gap-1">
                              NPSN
                              {renderSortIcon(
                                "npsn"
                              )}
                            </span>
                          </TableHead>

                          <TableHead
                            sortable
                            onClick={() =>
                              handleSort(
                                "jenjang",
                                sortField ===
                                  "jenjang" &&
                                  sortOrder ===
                                    "asc"
                                  ? "desc"
                                  : "asc"
                              )
                            }
                          >
                            <span className="flex items-center gap-1">
                              Jenjang
                              {renderSortIcon(
                                "jenjang"
                              )}
                            </span>
                          </TableHead>

                          <TableHead>
                            Yayasan
                          </TableHead>

                          <TableHead
                            sortable
                            onClick={() =>
                              handleSort(
                                "paket",
                                sortField ===
                                  "paket" &&
                                  sortOrder ===
                                    "asc"
                                  ? "desc"
                                  : "asc"
                              )
                            }
                          >
                            <span className="flex items-center gap-1">
                              Paket
                              {renderSortIcon(
                                "paket"
                              )}
                            </span>
                          </TableHead>

                          <TableHead
                            sortable
                            onClick={() =>
                              handleSort(
                                "status",
                                sortField ===
                                  "status" &&
                                  sortOrder ===
                                    "asc"
                                  ? "desc"
                                  : "asc"
                              )
                            }
                          >
                            <span className="flex items-center gap-1">
                              Status
                              {renderSortIcon(
                                "status"
                              )}
                            </span>
                          </TableHead>

                          <TableHead align="right">
                            Aksi
                          </TableHead>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-slate-100">

                        {paginatedData.length ===
                        0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-6 py-16"
                            >
                              <EmptyState />
                            </td>
                          </tr>
                        ) : (
                          paginatedData.map(
                            (
                              item,
                              index
                            ) => {

                              const statusStyle =
                                statusColorMap[
                                  item
                                    .status
                                ] ||
                                statusColorMap
                                  .Nonaktif;

                              const paketStyle =
                                paketColorMap[
                                  item
                                    .paket
                                ] ||
                                paketColorMap
                                  .Starter;

                              return (
                                <tr
                                  key={
                                    item.id
                                  }
                                  className="
                                    group
                                    h-[88px]
                                    transition-colors
                                    hover:bg-slate-50/70
                                  "
                                >

                                  {/* NO */}

                                  <td
                                    className="
                                      px-5
                                      py-4
                                      text-center
                                      text-sm
                                      text-slate-400
                                    "
                                  >
                                    {startIndex +
                                      index +
                                      1}
                                  </td>

                                  {/* NAMA */}

                                  <td className="px-4 py-4">

                                    <div className="flex items-center gap-3">

                                      <div
                                        className="
                                          flex
                                          h-11
                                          w-11
                                          shrink-0
                                          items-center
                                          justify-center
                                          rounded-xl
                                          border
                                          border-blue-100
                                          bg-blue-50
                                          text-blue-600
                                          transition-all
                                          group-hover:border-blue-200
                                          group-hover:bg-blue-100
                                        "
                                      >
                                        <Building2
                                          size={20}
                                          strokeWidth={
                                            1.9
                                          }
                                        />
                                      </div>

                                      <div className="min-w-0">

                                        <p className="truncate text-sm font-semibold text-slate-800">
                                          {
                                            item.nama
                                          }
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                          {
                                            item.statusSekolah
                                          }
                                        </p>

                                      </div>

                                    </div>

                                  </td>

                                  {/* NPSN */}

                                  <td className="px-4 py-4">

                                    <span
                                      className="
                                        font-mono
                                        text-xs
                                        font-medium
                                        tracking-wide
                                        text-slate-500
                                      "
                                    >
                                      {
                                        item.npsn
                                      }
                                    </span>

                                  </td>

                                  {/* JENJANG */}

                                  <td className="px-4 py-4">

                                    <span
                                      className="
                                        inline-flex
                                        items-center
                                        rounded-lg
                                        border
                                        border-slate-200
                                        bg-slate-50
                                        px-2.5
                                        py-1
                                        text-xs
                                        font-medium
                                        text-slate-600
                                      "
                                    >
                                      {
                                        item.jenjang
                                      }
                                    </span>

                                  </td>

                                  {/* YAYASAN */}

                                  <td className="px-4 py-4">

                                    <p
                                      className="
                                        max-w-[160px]
                                        truncate
                                        text-sm
                                        text-slate-500
                                      "
                                      title={
                                        item.yayasan
                                      }
                                    >
                                      {
                                        item.yayasan
                                      }
                                    </p>

                                  </td>

                                  {/* PAKET */}

                                  <td className="px-4 py-4">

                                    <span
                                      className={`
                                        inline-flex
                                        items-center
                                        rounded-lg
                                        border
                                        px-2.5
                                        py-1
                                        text-xs
                                        font-medium
                                        ${paketStyle.bg}
                                        ${paketStyle.text}
                                        ${paketStyle.border}
                                      `}
                                    >
                                      {
                                        item.paket
                                      }
                                    </span>

                                  </td>

                                  {/* STATUS */}

                                  <td className="px-4 py-4">

                                    <span
                                      className={`
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        border
                                        px-2.5
                                        py-1
                                        text-xs
                                        font-medium
                                        ${statusStyle.bg}
                                        ${statusStyle.text}
                                        ${statusStyle.border}
                                      `}
                                    >

                                      <span
                                        className={`
                                          h-1.5
                                          w-1.5
                                          rounded-full
                                          ${statusStyle.dot}
                                        `}
                                      />

                                      {
                                        item.status
                                      }

                                    </span>

                                  </td>

                                  {/* ACTION */}

                                  <td className="px-4 py-4">

                                    <div className="flex items-center justify-end gap-1">

                                      <ActionButton
                                        title="Lihat detail"
                                        onClick={() =>
                                          router.push(
                                            `/super-admin/sekolah/${item.id}`
                                          )
                                        }
                                      >
                                        <Eye
                                          size={
                                            16
                                          }
                                        />
                                      </ActionButton>

                                      <ActionButton
                                        title="Edit sekolah"
                                        hover="amber"
                                        onClick={() =>
                                          router.push(
                                            `/super-admin/sekolah/edit/${item.id}`
                                          )
                                        }
                                      >
                                        <Edit
                                          size={
                                            16
                                          }
                                        />
                                      </ActionButton>

                                      <ActionButton
                                        title="Hapus sekolah"
                                        hover="rose"
                                        onClick={() =>
                                          handleDelete(
                                            item
                                          )
                                        }
                                      >
                                        <Trash2
                                          size={
                                            16
                                          }
                                        />
                                      </ActionButton>

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
                )}

                {/* ==================================================
                    PAGINATION
                ================================================== */}

                {!loading &&
                  !error && (
                    <div
                      className="
                        flex
                        flex-col
                        gap-3
                        border-t
                        border-slate-200
                        px-4
                        py-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        sm:px-5
                      "
                    >

                      <p className="text-xs text-slate-500">

                        Menampilkan{" "}

                        <span className="font-semibold text-slate-700">
                          {paginatedData.length ===
                          0
                            ? 0
                            : startIndex +
                              1}
                        </span>

                        {" – "}

                        <span className="font-semibold text-slate-700">
                          {Math.min(
                            startIndex +
                              paginatedData.length,
                            sortedData.length
                          )}
                        </span>

                        {" dari "}

                        <span className="font-semibold text-slate-700">
                          {
                            sortedData.length
                          }
                        </span>

                        {" data"}

                      </p>

                      <div className="flex items-center justify-center gap-1">

                        {/* PREVIOUS */}

                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage(
                              Math.max(
                                1,
                                safeCurrentPage -
                                  1
                              )
                            )
                          }
                          disabled={
                            safeCurrentPage ===
                            1
                          }
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            text-slate-400
                            transition-all
                            hover:bg-slate-50
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                          "
                        >
                          <ArrowUp
                            size={14}
                            className="-rotate-90"
                          />
                        </button>

                        {/* PAGE NUMBERS */}

                        {[
                          ...Array(
                            Math.min(
                              safeTotalPages,
                              5
                            )
                          ),
                        ].map(
                          (_, index) => {
                            const page =
                              index + 1;

                            return (
                              <button
                                type="button"
                                key={
                                  page
                                }
                                onClick={() =>
                                  setCurrentPage(
                                    page
                                  )
                                }
                                className={`
                                  flex
                                  h-9
                                  w-9
                                  items-center
                                  justify-center
                                  rounded-lg
                                  text-xs
                                  font-semibold
                                  transition-all
                                  ${
                                    safeCurrentPage ===
                                    page
                                      ? "bg-blue-600 text-white shadow-[0_4px_10px_rgba(37,99,235,0.25)]"
                                      : "text-slate-500 hover:bg-slate-100"
                                  }
                                `}
                              >
                                {
                                  page
                                }
                              </button>
                            );
                          }
                        )}

                        {safeTotalPages >
                          5 && (
                          <>
                            <span className="px-0.5 text-slate-400">
                              …
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                setCurrentPage(
                                  safeTotalPages
                                )
                              }
                              className={`
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                text-xs
                                font-semibold
                                transition-all
                                ${
                                  safeCurrentPage ===
                                  safeTotalPages
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-500 hover:bg-slate-100"
                                }
                              `}
                            >
                              {
                                safeTotalPages
                              }
                            </button>
                          </>
                        )}

                        {/* NEXT */}

                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage(
                              Math.min(
                                safeTotalPages,
                                safeCurrentPage +
                                  1
                              )
                            )
                          }
                          disabled={
                            safeCurrentPage ===
                              safeTotalPages ||
                            safeTotalPages ===
                              0
                          }
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            text-slate-400
                            transition-all
                            hover:bg-slate-50
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                          "
                        >
                          <ArrowDown
                            size={14}
                            className="-rotate-90"
                          />
                        </button>

                      </div>

                    </div>
                  )}

              </section>

              {/* ==================================================
                  FOOTER
              ================================================== */}

              <div className="border-t border-slate-200/70 pt-5 text-center">

                <p className="text-xs text-slate-400">
                  © 2026 SmartSchool • Data
                  Sekolah terakhir
                  diperbarui hari ini
                </p>

              </div>

            </div>

          </main>

        </div>

      </div>
    </div>
  );
}

// ============================================================
// TABLE HEAD
// ============================================================

function TableHead({
  children,
  sortable = false,
  onClick,
  align = "left",
}) {
  return (
    <th
      onClick={onClick}
      className={`
        h-12
        px-4
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.08em]
        text-slate-400
        ${
          align === "right"
            ? "text-right"
            : "text-left"
        }
        ${
          sortable
            ? "cursor-pointer select-none hover:text-blue-600"
            : ""
        }
      `}
    >
      <div
        className={`
          flex
          items-center
          gap-1.5
          ${
            align === "right"
              ? "justify-end"
              : "justify-start"
          }
        `}
      >
        {children}
      </div>
    </th>
  );
}

// ============================================================
// FILTER SELECT
// ============================================================

function FilterSelect({
  value,
  onChange,
  options,
}) {
  return (
    <select
      value={value}
      onChange={(e) =>
        onChange(
          e.target.value
        )
      }
      className="
        h-10
        w-full
        rounded-xl
        border
        border-slate-200
        bg-slate-50
        px-3
        text-sm
        text-slate-600
        outline-none
        transition-all
        hover:border-slate-300
        focus:border-blue-400
        focus:bg-white
        focus:ring-4
        focus:ring-blue-500/10
      "
    >
      {options.map(
        (option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        )
      )}
    </select>
  );
}

// ============================================================
// ACTION BUTTON
// ============================================================

function ActionButton({
  children,
  onClick,
  title,
  hover = "blue",
}) {
  const hoverClass = {
    blue:
      "hover:bg-blue-50 hover:text-blue-600",

    amber:
      "hover:bg-amber-50 hover:text-amber-600",

    rose:
      "hover:bg-rose-50 hover:text-rose-600",
  };

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`
        flex
        h-8
        w-8
        items-center
        justify-center
        rounded-lg
        text-slate-400
        transition-all
        ${hoverClass[hover]}
      `}
    >
      {children}
    </button>
  );
}

// ============================================================
// MOBILE SCHOOL CARD
// ============================================================

function MobileSchoolCard({
  item,
  number,
  router,
  onDelete,
  sortField,
  sortOrder,
}) {
  const statusStyle =
    statusColorMap[
      item.status
    ] ||
    statusColorMap.Nonaktif;

  const paketStyle =
    paketColorMap[
      item.paket
    ] ||
    paketColorMap.Starter;

  return (
    <div className="p-4 transition-colors hover:bg-slate-50/50">

      <div className="flex items-start gap-3">

        {/* NUMBER */}

        <span className="w-5 pt-2 text-xs font-medium text-slate-400">
          {number}
        </span>

        {/* ICON */}

        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-blue-100
            bg-blue-50
            text-blue-600
          "
        >
          <Building2
            size={20}
            strokeWidth={1.9}
          />
        </div>

        {/* INFORMATION */}

        <div className="min-w-0 flex-1">

          <p
            className={`
              truncate
              text-sm
              font-semibold
              ${
                sortField ===
                "nama"
                  ? "text-blue-700"
                  : "text-slate-800"
              }
            `}
          >
            {item.nama}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">

            <span
              className={
                sortField ===
                "npsn"
                  ? "font-semibold text-blue-600"
                  : "text-slate-400"
              }
            >
              {item.npsn}
            </span>

            <span className="text-slate-300">
              •
            </span>

            <span
              className={
                sortField ===
                "jenjang"
                  ? "font-semibold text-blue-600"
                  : "text-slate-400"
              }
            >
              {item.jenjang}
            </span>

            <span className="text-slate-300">
              •
            </span>

            <span
              className={
                sortField ===
                "status"
                  ? "font-semibold text-blue-600"
                  : "text-slate-400"
              }
            >
              {item.status}
            </span>

          </div>

        </div>

        {/* ACTION */}

        <div className="flex items-center gap-1">

          <ActionButton
            title="Detail"
            onClick={() =>
              router.push(
                `/super-admin/sekolah/${item.id}`
              )
            }
          >
            <Eye size={15} />
          </ActionButton>

          <ActionButton
            title="Edit"
            hover="amber"
            onClick={() =>
              router.push(
                `/super-admin/sekolah/edit/${item.id}`
              )
            }
          >
            <Edit size={15} />
          </ActionButton>

          <ActionButton
            title="Hapus"
            hover="rose"
            onClick={() =>
              onDelete(item)
            }
          >
            <Trash2 size={15} />
          </ActionButton>

        </div>

      </div>

      {/* BADGES */}

      <div className="ml-8 mt-3 flex flex-wrap items-center gap-1.5">

        <span
          className={`
            rounded-lg
            border
            px-2.5
            py-1
            text-[10px]
            font-medium
            ${
              sortField ===
              "jenjang"
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-slate-50 text-slate-600"
            }
          `}
        >
          {item.jenjang}
        </span>

        <span
          className={`
            rounded-lg
            border
            px-2.5
            py-1
            text-[10px]
            font-medium
            ${
              sortField ===
              "paket"
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : `${paketStyle.bg} ${paketStyle.text} ${paketStyle.border}`
            }
          `}
        >
          {item.paket}
        </span>

        <span
          className={`
            inline-flex
            items-center
            gap-1
            rounded-full
            border
            px-2.5
            py-1
            text-[10px]
            font-medium
            ${
              sortField ===
              "status"
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : `${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`
            }
          `}
        >
          <span
            className={`
              h-1.5
              w-1.5
              rounded-full
              ${
                sortField ===
                "status"
                  ? "bg-blue-500"
                  : statusStyle.dot
              }
            `}
          />

          {item.status}
        </span>

        {sortField && (
          <span className="ml-auto text-[10px] text-slate-300">
            {sortOrder ===
            "asc"
              ? "↑"
              : "↓"}
          </span>
        )}

      </div>

    </div>
  );
}

// ============================================================
// LOADING
// ============================================================

function LoadingState() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-16 text-center">

      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

      <p className="mt-4 text-sm font-semibold text-slate-700">
        Memuat data sekolah...
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Mengambil data terbaru dari
        server SmartSchool.
      </p>

    </div>
  );
}

// ============================================================
// ERROR
// ============================================================

function ErrorState({
  message,
}) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-16 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
        <XCircle size={25} />
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-700">
        Gagal memuat data sekolah
      </p>

      <p className="mt-1 max-w-md text-xs leading-5 text-slate-400">
        {message}
      </p>

      <p className="mt-3 text-xs text-slate-400">
        Pastikan backend berjalan dan
        akun memiliki izin
        yayasan.view.
      </p>

    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">

      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-slate-100
          text-slate-400
        "
      >
        <Database size={24} />
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-700">
        Tidak ada data ditemukan
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Coba ubah kata kunci atau
        filter pencarian.
      </p>

    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
    },

    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },

    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
    },

    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
    },

    violet: {
      bg: "bg-violet-50",
      text: "text-violet-600",
    },

    teal: {
      bg: "bg-teal-50",
      text: "text-teal-600",
    },
  };

  const styles =
    colorMap[color] ||
    colorMap.blue;

  return (
    <div
      className="
        group
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-3.5
        shadow-[0_2px_10px_rgba(15,23,42,0.04)]
        transition-all
        hover:-translate-y-0.5
        hover:shadow-[0_7px_20px_rgba(15,23,42,0.08)]
        sm:p-4
      "
    >

      <div className="flex items-center gap-3">

        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${styles.bg}
            ${styles.text}
          `}
        >
          <Icon
            size={18}
            strokeWidth={1.9}
          />
        </div>

        <div className="min-w-0">

          <p
            className="
              truncate
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.06em]
              text-slate-400
            "
          >
            {label}
          </p>

          <p
            className="
              mt-0.5
              text-xl
              font-semibold
              tracking-tight
              text-slate-800
            "
          >
            {typeof value ===
            "number"
              ? value.toLocaleString(
                  "id-ID"
                )
              : value}
          </p>

        </div>

      </div>

    </div>
  );
}