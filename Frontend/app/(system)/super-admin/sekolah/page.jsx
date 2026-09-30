"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getSekolahBinaan,
  getYayasanSummary,
} from "../../../../services/yayasan.service";

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
  Database,
} from "lucide-react";

/* ============================================================
   THEME HELPERS
============================================================ */

const themeCardShadow =
  "shadow-[0_3px_14px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimarySurface =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeInfoText =
  "text-[var(--color-info)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeSuccessText =
  "text-[var(--color-success)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeWarningText =
  "text-[var(--color-warning)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimaryButton =
  "bg-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,var(--color-text))] text-[var(--color-card)]";

/* ============================================================
   STATUS STYLE
============================================================ */

const statusColorMap = {
  Aktif: {
    bg: themeSuccessSurface,
    text: themeSuccessText,
    border: themeSuccessBorder,
    dot: "bg-[var(--color-success)]",
  },

  Trial: {
    bg: themeWarningSurface,
    text: themeWarningText,
    border: themeWarningBorder,
    dot: "bg-[var(--color-warning)]",
  },

  Nonaktif: {
    bg: themeNeutralSurface,
    text: "theme-text-secondary",
    border: themeNeutralBorder,
    dot: "bg-[var(--color-text-muted)]",
  },
};

/* ============================================================
   PAKET STYLE
============================================================ */

const paketColorMap = {
  Enterprise: {
    bg: themeInfoSurface,
    text: themeInfoText,
    border: themeInfoBorder,
  },

  Professional: {
    bg: themePrimarySurface,
    text: themePrimaryText,
    border: themePrimaryBorder,
  },

  Starter: {
    bg: themeNeutralSurface,
    text: "theme-text-secondary",
    border: themeNeutralBorder,
  },
};

/* ============================================================
   HELPER RESPONSE API
============================================================ */

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

/* ============================================================
   HELPER VALUE
============================================================ */

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

    totalGuru:
      Number(
        firstValue(
          item?.totalGuru,
          item?.jumlahGuru,
          0
        )
      ) || 0,

    totalSiswa:
      Number(
        firstValue(
          item?.totalSiswa,
          item?.jumlahSiswa,
          0
        )
      ) || 0,

    totalKelas:
      Number(
        firstValue(
          item?.totalKelas,
          item?.jumlahKelas,
          0
        )
      ) || 0,

    tanggalMulai:
      langganan?.tanggalMulai ||
      null,

    tanggalBerakhir:
      langganan?.tanggalBerakhir ||
      null,

    createdAt:
      item?.dibuatPada ||
      item?.createdAt ||
      null,
  };
}

/* ============================================================
   SORT CONTROL
============================================================ */

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
        className={`
          h-9
          rounded-xl
          border
          theme-border
          theme-input
          px-3
          text-xs
          font-medium
          theme-text-secondary
          outline-none
          transition-all
          ${themeFocus}
        `}
      >
        {sortOptions.map(
          (option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          )
        )}
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
        className={`
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          border
          theme-border
          ${themeNeutralSurface}
          theme-text-muted
          transition-all
          ${themeNeutralHover}
          hover:border-[color-mix(in_srgb,var(--color-primary)_20%,var(--color-border))]
        `}
        title={
          sortOrder === "asc"
            ? "Urutkan menurun"
            : "Urutkan menaik"
        }
      >
        {sortOrder === "asc" ? (
          <ArrowUp
            size={16}
            className={themePrimaryText}
          />
        ) : (
          <ArrowDown
            size={16}
            className={themePrimaryText}
          />
        )}
      </button>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function DataSekolahPage() {
  const router = useRouter();

  const [sekolahData, setSekolahData] =
    useState([]);

  const [stats, setStats] =
    useState({
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

  /* ==========================================================
     RESPONSIVE
  ========================================================== */

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

  /* ==========================================================
     FETCH DATA
  ========================================================== */

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

      console.log(
        "RAW SEKOLAH RESPONSE:",
        sekolahResponse
      );

      console.log(
        "RAW SUMMARY RESPONSE:",
        summaryResponse
      );

      const rawSchools =
        unwrapArrayResponse(
          sekolahResponse
        );

      const normalizedSchools =
        rawSchools.map(
          normalizeSchool
        );

      setSekolahData(
        normalizedSchools
      );

      const summary =
        unwrapObjectResponse(
          summaryResponse
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
                item.status ===
                "Aktif"
            ).length;

      const trial =
        Number.isFinite(
          trialFromSummary
        ) &&
        trialFromSummary >= 0
          ? trialFromSummary
          : normalizedSchools.filter(
              (item) =>
                item.status ===
                "Trial"
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

  /* ==========================================================
     FILTER OPTIONS
  ========================================================== */

  const jenjangOptions =
    useMemo(() => {
      const values =
        sekolahData
          .map(
            (item) =>
              item.jenjang
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

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredData =
    useMemo(() => {
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
            selectedJenjang ===
              "Semua" ||
            item.jenjang ===
              selectedJenjang;

          const matchesStatus =
            selectedStatus ===
              "Semua" ||
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

  /* ==========================================================
     SORT
  ========================================================== */

  const sortedData =
    useMemo(() => {
      const data = [
        ...filteredData,
      ];

      data.sort((a, b) => {
        const first =
          String(
            a?.[sortField] ??
              ""
          ).toLowerCase();

        const second =
          String(
            b?.[sortField] ??
              ""
          ).toLowerCase();

        if (first < second) {
          return sortOrder ===
            "asc"
            ? -1
            : 1;
        }

        if (first > second) {
          return sortOrder ===
            "asc"
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

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages =
    Math.ceil(
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

  /* ==========================================================
     RESET PAGE WHEN FILTER CHANGES
  ========================================================== */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedJenjang,
    selectedStatus,
  ]);

  /* ==========================================================
     SORT
  ========================================================== */

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
          className="theme-text-muted opacity-40"
        />
      );
    }

    return sortOrder ===
      "asc" ? (
      <ArrowUp
        size={12}
        className={themePrimaryText}
      />
    ) : (
      <ArrowDown
        size={12}
        className={themePrimaryText}
      />
    );
  };

  /* ==========================================================
     DELETE
  ========================================================== */

  const handleDelete = (
    item
  ) => {
    window.alert(
      `Fitur hapus sekolah untuk "${item.nama}" belum dihubungkan ke endpoint DELETE backend.`
    );
  };

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div className="theme-page theme-text min-h-full">
      <main className="w-full p-3 sm:p-5 lg:p-7 xl:p-8">
        <div className="mx-auto w-full max-w-[1600px] space-y-5 sm:space-y-6">

          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <section
            className={`
              relative
              overflow-hidden
              rounded-2xl
              border
              theme-border
              theme-card
              p-5
              ${themeCardShadow}
              sm:p-6
            `}
          >
            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className={`
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      border
                      ${themePrimaryBorder}
                      ${themePrimarySurface}
                      ${themePrimaryText}
                    `}
                  >
                    <Building2
                      size={20}
                      strokeWidth={1.9}
                    />
                  </div>

                  <div>
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${themePrimaryText}`}
                    >
                      Super Admin
                    </p>

                    <h1 className="text-xl font-semibold tracking-tight theme-text sm:text-2xl">
                      Data Sekolah
                    </h1>
                  </div>
                </div>

                <p className="mt-3 max-w-2xl text-sm leading-6 theme-text-secondary">
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
                className={`
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  px-4
                  text-sm
                  font-semibold
                  ${themePrimaryButton}
                  shadow-[0_5px_15px_color-mix(in_srgb,var(--color-primary)_22%,transparent)]
                  transition-all
                  hover:shadow-[0_7px_20px_color-mix(in_srgb,var(--color-primary)_28%,transparent)]
                  active:scale-[0.98]
                `}
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
              color="primary"
            />

            <StatCard
              label="Sekolah Aktif"
              value={stats.aktif}
              icon={CheckCircle}
              color="success"
            />

            <StatCard
              label="Trial"
              value={stats.trial}
              icon={Clock3}
              color="warning"
            />

            <StatCard
              label="Nonaktif"
              value={stats.nonaktif}
              icon={XCircle}
              color="neutral"
            />

            <StatCard
              label="Total Guru"
              value={stats.totalGuru}
              icon={Users}
              color="info"
            />

            <StatCard
              label="Total Siswa"
              value={stats.totalSiswa}
              icon={GraduationCap}
              color="primary"
            />
          </section>

          {/* ==================================================
              FILTER
          ================================================== */}

          <section
            className={`
              rounded-2xl
              border
              theme-border
              theme-card
              p-4
              ${themeCardShadow}
              sm:p-5
            `}
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">

                {/* SEARCH */}

                <div className="relative min-w-0 flex-1">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                  />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(
                        e.target.value
                      )
                    }
                    placeholder="Cari nama sekolah, NPSN, yayasan..."
                    className={`
                      h-10
                      w-full
                      rounded-xl
                      border
                      theme-border
                      theme-input
                      pl-10
                      pr-3
                      text-sm
                      theme-text
                      outline-none
                      transition-all
                      placeholder:text-[var(--color-text-placeholder)]
                      ${themeFocus}
                    `}
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
                <div className="flex items-center gap-2 text-xs theme-text-muted">
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
              sortOrder !== "asc") && (
              <div
                className={`
                  mt-4
                  flex
                  flex-wrap
                  items-center
                  gap-2
                  border-t
                  ${themeDivider}
                  pt-4
                `}
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] theme-text-muted">
                  Filter aktif:
                </span>

                {searchQuery && (
                  <span
                    className={`
                      rounded-lg
                      border
                      ${themePrimaryBorder}
                      ${themePrimarySurface}
                      px-2.5
                      py-1
                      text-[10px]
                      font-medium
                      ${themePrimaryText}
                    `}
                  >
                    "{searchQuery}"
                  </span>
                )}

                {selectedJenjang !==
                  "Semua" && (
                  <span
                    className={`
                      rounded-lg
                      border
                      ${themeNeutralBorder}
                      ${themeNeutralSurface}
                      px-2.5
                      py-1
                      text-[10px]
                      font-medium
                      theme-text-secondary
                    `}
                  >
                    {selectedJenjang}
                  </span>
                )}

                {selectedStatus !==
                  "Semua" && (
                  <span
                    className={`
                      rounded-lg
                      border
                      ${themeNeutralBorder}
                      ${themeNeutralSurface}
                      px-2.5
                      py-1
                      text-[10px]
                      font-medium
                      theme-text-secondary
                    `}
                  >
                    {selectedStatus}
                  </span>
                )}

                {(sortField !==
                  "nama" ||
                  sortOrder !==
                    "asc") && (
                  <span
                    className={`
                      rounded-lg
                      border
                      ${themeInfoBorder}
                      ${themeInfoSurface}
                      px-2.5
                      py-1
                      text-[10px]
                      font-medium
                      ${themeInfoText}
                    `}
                  >
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
                  className="ml-auto text-[10px] theme-text-muted transition-colors hover:text-[var(--color-primary)] hover:underline"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </section>

          {/* ==================================================
              TABLE / MOBILE
          ================================================== */}

          <section
            className={`
              overflow-hidden
              rounded-2xl
              border
              theme-border
              theme-card
              ${themeCardShadow}
            `}
          >
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState
                message={error}
              />
            ) : isMobile ? (
              /* ================= MOBILE ================= */

              <div
                className={`divide-y ${themeDivider}`}
              >
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
                    <tr
                      className={`
                        border-b
                        ${themeDivider}
                        ${themeNeutralSurface}
                      `}
                    >
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

                  <tbody
                    className={`divide-y ${themeDivider}`}
                  >
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
                              item.status
                            ] ||
                            statusColorMap.Nonaktif;

                          const paketStyle =
                            paketColorMap[
                              item.paket
                            ] ||
                            paketColorMap.Starter;

                          return (
                            <tr
                              key={
                                item.id
                              }
                              className={`
                                group
                                h-[88px]
                                transition-colors
                                ${themeNeutralHover}
                              `}
                            >
                              {/* NO */}

                              <td className="px-5 py-4 text-center text-sm theme-text-muted">
                                {startIndex +
                                  index +
                                  1}
                              </td>

                              {/* NAMA */}

                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`
                                      flex
                                      h-11
                                      w-11
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-xl
                                      border
                                      ${themePrimaryBorder}
                                      ${themePrimarySurface}
                                      ${themePrimaryText}
                                      transition-all
                                      group-hover:border-[color-mix(in_srgb,var(--color-primary)_35%,transparent)]
                                    `}
                                  >
                                    <Building2
                                      size={20}
                                      strokeWidth={
                                        1.9
                                      }
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold theme-text">
                                      {
                                        item.nama
                                      }
                                    </p>

                                    <p className="mt-1 text-xs theme-text-muted">
                                      {
                                        item.statusSekolah
                                      }
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* NPSN */}

                              <td className="px-4 py-4">
                                <span className="font-mono text-xs font-medium tracking-wide theme-text-secondary">
                                  {
                                    item.npsn
                                  }
                                </span>
                              </td>

                              {/* JENJANG */}

                              <td className="px-4 py-4">
                                <span
                                  className={`
                                    inline-flex
                                    items-center
                                    rounded-lg
                                    border
                                    ${themeNeutralBorder}
                                    ${themeNeutralSurface}
                                    px-2.5
                                    py-1
                                    text-xs
                                    font-medium
                                    theme-text-secondary
                                  `}
                                >
                                  {
                                    item.jenjang
                                  }
                                </span>
                              </td>

                              {/* YAYASAN */}

                              <td className="px-4 py-4">
                                <p
                                  className="max-w-[160px] truncate text-sm theme-text-secondary"
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
                                    hover="primary"
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
                                    hover="warning"
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
                  className={`
                    flex
                    flex-col
                    gap-3
                    border-t
                    ${themeDivider}
                    px-4
                    py-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    sm:px-5
                  `}
                >
                  <p className="text-xs theme-text-secondary">
                    Menampilkan{" "}
                    <span className="font-semibold theme-text">
                      {paginatedData.length ===
                      0
                        ? 0
                        : startIndex +
                          1}
                    </span>{" "}
                    –{" "}
                    <span className="font-semibold theme-text">
                      {Math.min(
                        startIndex +
                          paginatedData.length,
                        sortedData.length
                      )}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold theme-text">
                      {
                        sortedData.length
                      }
                    </span>{" "}
                    data
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
                      className={`
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        border
                        ${themeNeutralBorder}
                        ${themeNeutralSurface}
                        theme-text-muted
                        transition-all
                        ${themeNeutralHover}
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      `}
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
                                  ? `${themePrimaryButton} shadow-[0_4px_10px_color-mix(in_srgb,var(--color-primary)_25%,transparent)]`
                                  : `theme-text-secondary ${themeNeutralHover}`
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
                        <span className="px-0.5 theme-text-muted">
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
                                ? themePrimaryButton
                                : `theme-text-secondary ${themeNeutralHover}`
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
                      className={`
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        border
                        ${themeNeutralBorder}
                        ${themeNeutralSurface}
                        theme-text-muted
                        transition-all
                        ${themeNeutralHover}
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      `}
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

          <div
            className={`
              border-t
              ${themeDivider}
              pt-5
              text-center
            `}
          >
            <p className="text-xs theme-text-muted">
              © 2026 SmartSchool • Data
              Sekolah terakhir
              diperbarui hari ini
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   TABLE HEAD
============================================================ */

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
        theme-text-muted
        ${
          align === "right"
            ? "text-right"
            : "text-left"
        }
        ${
          sortable
            ? "cursor-pointer select-none hover:text-[var(--color-primary)]"
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

/* ============================================================
   FILTER SELECT
============================================================ */

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
      className={`
        h-10
        w-full
        rounded-xl
        border
        theme-border
        theme-input
        px-3
        text-sm
        theme-text-secondary
        outline-none
        transition-all
        ${themeFocus}
      `}
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

/* ============================================================
   ACTION BUTTON
============================================================ */

function ActionButton({
  children,
  onClick,
  title,
  hover = "primary",
}) {
  const hoverClass = {
    primary:
      "hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] hover:text-[var(--color-primary)]",

    warning:
      "hover:bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] hover:text-[var(--color-warning)]",
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
        theme-text-muted
        transition-all
        ${hoverClass[hover] || hoverClass.primary}
      `}
    >
      {children}
    </button>
  );
}

/* ============================================================
   MOBILE SCHOOL CARD
============================================================ */

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
    <div
      className={`
        p-4
        transition-colors
        ${themeNeutralHover}
      `}
    >
      <div className="flex items-start gap-3">

        {/* NUMBER */}

        <span className="w-5 pt-2 text-xs font-medium theme-text-muted">
          {number}
        </span>

        {/* ICON */}

        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            ${themePrimaryBorder}
            ${themePrimarySurface}
            ${themePrimaryText}
          `}
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
                  ? themePrimaryText
                  : "theme-text"
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
                  ? `font-semibold ${themePrimaryText}`
                  : "theme-text-muted"
              }
            >
              {item.npsn}
            </span>

            <span className="theme-text-muted opacity-50">
              •
            </span>

            <span
              className={
                sortField ===
                "jenjang"
                  ? `font-semibold ${themePrimaryText}`
                  : "theme-text-muted"
              }
            >
              {item.jenjang}
            </span>

            <span className="theme-text-muted opacity-50">
              •
            </span>

            <span
              className={
                sortField ===
                "status"
                  ? `font-semibold ${themePrimaryText}`
                  : "theme-text-muted"
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
            hover="primary"
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
            hover="warning"
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
            ${
              sortField ===
              "jenjang"
                ? `${themePrimaryBorder} ${themePrimarySurface} ${themePrimaryText}`
                : `${themeNeutralBorder} ${themeNeutralSurface} theme-text-secondary`
            }
            px-2.5
            py-1
            text-[10px]
            font-medium
          `}
        >
          {item.jenjang}
        </span>

        <span
          className={`
            rounded-lg
            border
            ${
              sortField ===
              "paket"
                ? `${themePrimaryBorder} ${themePrimarySurface} ${themePrimaryText}`
                : `${paketStyle.bg} ${paketStyle.text} ${paketStyle.border}`
            }
            px-2.5
            py-1
            text-[10px]
            font-medium
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
            ${
              sortField ===
              "status"
                ? `${themePrimaryBorder} ${themePrimarySurface} ${themePrimaryText}`
                : `${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`
            }
            px-2.5
            py-1
            text-[10px]
            font-medium
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
                  ? "bg-[var(--color-primary)]"
                  : statusStyle.dot
              }
            `}
          />

          {item.status}
        </span>

        {sortField && (
          <span className="ml-auto text-[10px] theme-text-muted opacity-50">
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

/* ============================================================
   LOADING
============================================================ */

function LoadingState() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className={`
          h-10
          w-10
          animate-spin
          rounded-full
          border-4
          ${themeNeutralBorder}
          border-t-[var(--color-primary)]
        `}
      />

      <p className="mt-4 text-sm font-semibold theme-text">
        Memuat data sekolah...
      </p>

      <p className="mt-1 text-xs theme-text-muted">
        Mengambil data terbaru dari
        server SmartSchool.
      </p>
    </div>
  );
}

/* ============================================================
   ERROR
============================================================ */

function ErrorState({
  message,
}) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className={`
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          border
          ${themeWarningBorder}
          ${themeWarningSurface}
          ${themeWarningText}
        `}
      >
        <XCircle size={25} />
      </div>

      <p className="mt-4 text-sm font-semibold theme-text">
        Gagal memuat data sekolah
      </p>

      <p className="mt-1 max-w-md text-xs leading-5 theme-text-muted">
        {message}
      </p>

      <p className="mt-3 text-xs theme-text-muted">
        Pastikan backend berjalan dan
        akun memiliki izin
        yayasan.view.
      </p>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div
        className={`
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          border
          ${themeNeutralBorder}
          ${themeNeutralSurface}
          theme-text-muted
        `}
      >
        <Database size={24} />
      </div>

      <p className="mt-4 text-sm font-semibold theme-text">
        Tidak ada data ditemukan
      </p>

      <p className="mt-1 text-xs theme-text-muted">
        Coba ubah kata kunci atau
        filter pencarian.
      </p>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}) {
  const colorMap = {
    primary: {
      bg: themePrimarySurface,
      text: themePrimaryText,
      border: themePrimaryBorder,
    },

    success: {
      bg: themeSuccessSurface,
      text: themeSuccessText,
      border: themeSuccessBorder,
    },

    warning: {
      bg: themeWarningSurface,
      text: themeWarningText,
      border: themeWarningBorder,
    },

    neutral: {
      bg: themeNeutralSurface,
      text: "theme-text-secondary",
      border: themeNeutralBorder,
    },

    info: {
      bg: themeInfoSurface,
      text: themeInfoText,
      border: themeInfoBorder,
    },
  };

  const styles =
    colorMap[color] ||
    colorMap.primary;

  return (
    <div
      className={`
        group
        rounded-2xl
        border
        theme-border
        theme-card
        p-3.5
        ${themeSmallShadow}
        transition-all
        hover:-translate-y-0.5
        hover:shadow-[0_7px_20px_color-mix(in_srgb,var(--color-text)_8%,transparent)]
        sm:p-4
      `}
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
            border
            ${styles.bg}
            ${styles.border}
            ${styles.text}
          `}
        >
          <Icon
            size={18}
            strokeWidth={1.9}
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.06em] theme-text-muted">
            {label}
          </p>

          <p className="mt-0.5 text-xl font-semibold tracking-tight theme-text">
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