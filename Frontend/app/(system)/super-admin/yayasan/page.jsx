"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import {
    Landmark,
    CheckCircle2,
    XCircle,
    Search,
    Eye,
    FileSpreadsheet,
    ArrowUp,
    ArrowDown,
    School,
    Clock3,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    RotateCcw,
    ArrowDownAZ,
    Users,
    Plus,
} from "lucide-react";

import {
    getYayasanSummary,
    getSekolahBinaan,
} from "../../../services/yayasan.service";

// =========================================================
// CONSTANT
// =========================================================

const ITEMS_PER_PAGE = 5;

// =========================================================
// STATUS STYLE
// =========================================================

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

// =========================================================
// SORT OPTIONS
// =========================================================

const sortOptions = [
    {
        value: "nama-asc",
        label: "Nama Sekolah — A → Z",
        field: "nama",
        order: "asc",
    },
    {
        value: "nama-desc",
        label: "Nama Sekolah — Z → A",
        field: "nama",
        order: "desc",
    },
    {
        value: "kode-asc",
        label: "Kode Sekolah — A → Z",
        field: "kode",
        order: "asc",
    },
    {
        value: "kode-desc",
        label: "Kode Sekolah — Z → A",
        field: "kode",
        order: "desc",
    },
    {
        value: "status-asc",
        label: "Status — A → Z",
        field: "status",
        order: "asc",
    },
    {
        value: "status-desc",
        label: "Status — Z → A",
        field: "status",
        order: "desc",
    },
];

// =========================================================
// NORMALIZE STATUS
// =========================================================

function normalizeStatus(status) {
    const value = String(status ?? "")
        .trim()
        .toLowerCase();

    if (
        value === "aktif" ||
        value === "active" ||
        value === "berlangganan aktif"
    ) {
        return "Aktif";
    }

    if (
        value === "trial" ||
        value === "uji coba" ||
        value === "masa trial"
    ) {
        return "Trial";
    }

    if (
        value === "nonaktif" ||
        value === "inactive" ||
        value === "non-active"
    ) {
        return "Nonaktif";
    }

    return status ? String(status) : "Nonaktif";
}

// =========================================================
// NORMALIZE SEKOLAH
// =========================================================

function normalizeSekolah(item) {
    if (!item || typeof item !== "object") {
        return null;
    }

    const subscription =
        Array.isArray(item.langgananSekolah) &&
        item.langgananSekolah.length > 0
            ? item.langgananSekolah[0]
            : null;

    return {
        ...item,

        id: item.id ?? null,

        nama: item.nama ?? "-",

        // Backend tidak mengirim "kode".
        // Yang tersedia adalah subdomain.
        kode: item.subdomain ?? "-",

        subdomain: item.subdomain ?? "-",

        status: normalizeStatus(item.status),

        telepon: item.telepon ?? "",

        email: item.email ?? "",

        logo: item.logo ?? null,

        paket: subscription?.paket?.nama ?? "-",

        statusLangganan:
            subscription?.statusLangganan ?? null,

        tanggalBerakhir:
            subscription?.tanggalBerakhir ?? null,
    };
}

// =========================================================
// EXTRACT DATA
// =========================================================

function extractData(response) {
    if (!response) {
        return null;
    }

    if (response.data !== undefined) {
        return response.data;
    }

    return response;
}

// =========================================================
// EXTRACT LIST
// =========================================================

function extractSekolahList(response) {
    const data = extractData(response);

    if (Array.isArray(data)) {
        return data;
    }

    if (
        data &&
        Array.isArray(data.data)
    ) {
        return data.data;
    }

    if (
        data &&
        Array.isArray(data.items)
    ) {
        return data.items;
    }

    if (
        data &&
        Array.isArray(data.results)
    ) {
        return data.results;
    }

    if (
        response &&
        Array.isArray(response.items)
    ) {
        return response.items;
    }

    return [];
}

// =========================================================
// EXTRACT SUMMARY
// =========================================================

function extractSummary(response) {
    const data = extractData(response);

    if (
        data &&
        typeof data === "object" &&
        !Array.isArray(data)
    ) {
        return data;
    }

    return {};
}

// =========================================================
// ERROR MESSAGE
// =========================================================

function extractErrorMessage(error) {
    if (!error) {
        return "Terjadi kesalahan pada server.";
    }

    if (typeof error === "string") {
        return error;
    }

    return (
        error?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Terjadi kesalahan pada server."
    );
}

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function DataYayasanPage() {
    const router = useRouter();

    // =====================================================
    // SIDEBAR
    // =====================================================

    const [activeMenu, setActiveMenu] =
        useState("yayasan");

    const [sidebarOpen, setSidebarOpen] =
        useState(true);

    // =====================================================
    // DATA
    // =====================================================

    const [sekolahList, setSekolahList] =
        useState([]);

    const [summary, setSummary] =
        useState({
            totalSekolah: 0,
            sekolahAktif: 0,
            sekolahUjiCoba: 0,
            totalPenggunaAktif: 0,
        });

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    // =====================================================
    // FILTER
    // =====================================================

    const [searchQuery, setSearchQuery] =
        useState("");

    const [selectedStatus, setSelectedStatus] =
        useState("Semua");

    // =====================================================
    // PAGINATION
    // =====================================================

    const [currentPage, setCurrentPage] =
        useState(1);

    const [isMobile, setIsMobile] =
        useState(false);

    // =====================================================
    // SORT
    // =====================================================

    const [sortField, setSortField] =
        useState("nama");

    const [sortOrder, setSortOrder] =
        useState("asc");

    const [sortValue, setSortValue] =
        useState("nama-asc");

    // =====================================================
    // RESPONSIVE
    // =====================================================

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(
                window.innerWidth < 768
            );
        };

        checkMobile();

        window.addEventListener(
            "resize",
            checkMobile
        );

        return () => {
            window.removeEventListener(
                "resize",
                checkMobile
            );
        };
    }, []);

    // =====================================================
    // FETCH BACKEND
    // =====================================================

    const fetchYayasan = useCallback(
        async () => {
            try {
                setLoading(true);
                setError("");

                /*
                 * Backend menyediakan:
                 *
                 * GET /api/v1/yayasan/summary
                 * GET /api/v1/yayasan/sekolah
                 *
                 * Tidak menggunakan:
                 *
                 * GET /api/v1/yayasan
                 */

                const [
                    summaryResponse,
                    sekolahResponse,
                ] = await Promise.all([
                    getYayasanSummary(),
                    getSekolahBinaan(),
                ]);

                const summaryData =
                    extractSummary(
                        summaryResponse
                    );

                const sekolahData =
                    extractSekolahList(
                        sekolahResponse
                    )
                        .map(
                            normalizeSekolah
                        )
                        .filter(Boolean);

                setSummary({
                    totalSekolah:
                        Number(
                            summaryData.totalSekolah
                        ) || 0,

                    sekolahAktif:
                        Number(
                            summaryData.sekolahAktif
                        ) || 0,

                    sekolahUjiCoba:
                        Number(
                            summaryData.sekolahUjiCoba
                        ) || 0,

                    totalPenggunaAktif:
                        Number(
                            summaryData.totalPenggunaAktif
                        ) || 0,
                });

                setSekolahList(
                    sekolahData
                );

                setCurrentPage(1);
            } catch (err) {
                console.error(
                    "Error fetch data sekolah binaan:",
                    err
                );

                setError(
                    extractErrorMessage(
                        err
                    )
                );

                setSekolahList([]);

                setSummary({
                    totalSekolah: 0,
                    sekolahAktif: 0,
                    sekolahUjiCoba: 0,
                    totalPenggunaAktif: 0,
                });
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        fetchYayasan();
    }, [fetchYayasan]);

    // =====================================================
    // RESET PAGE
    // =====================================================

    useEffect(() => {
        setCurrentPage(1);
    }, [
        searchQuery,
        selectedStatus,
        sortValue,
    ]);

    // =====================================================
    // NOTIFICATIONS
    // =====================================================

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
        {
            id: 3,
            title: "Yayasan baru mendaftar",
            desc: "Dikirim 3 hari lalu",
            read: true,
        },
    ];

    // =====================================================
    // STATUS OPTIONS
    // =====================================================

    const statusOptions = useMemo(
        () => [
            "Semua",
            "Aktif",
            "Nonaktif",
            "Trial",
        ],
        []
    );

    // =====================================================
    // STATISTICS
    // =====================================================

    const stats = useMemo(() => {
        const total =
            Number(
                summary.totalSekolah
            ) || 0;

        const aktif =
            Number(
                summary.sekolahAktif
            ) || 0;

        const trial =
            Number(
                summary.sekolahUjiCoba
            ) || 0;

        const nonaktif =
            Math.max(
                total - aktif - trial,
                0
            );

        return {
            total,
            aktif,
            trial,
            nonaktif,

            totalPengguna:
                Number(
                    summary.totalPenggunaAktif
                ) || 0,

            ditampilkan:
                sekolahList.length,
        };
    }, [
        summary,
        sekolahList.length,
    ]);

    // =====================================================
    // FILTER + SORT
    // =====================================================

    const sortedData = useMemo(() => {
        const search =
            searchQuery
                .toLowerCase()
                .trim();

        const filtered =
            sekolahList.filter(
                (item) => {
                    const matchSearch =
                        !search ||
                        String(
                            item.nama ?? ""
                        )
                            .toLowerCase()
                            .includes(search) ||

                        String(
                            item.kode ?? ""
                        )
                            .toLowerCase()
                            .includes(search) ||

                        String(
                            item.subdomain ?? ""
                        )
                            .toLowerCase()
                            .includes(search) ||

                        String(
                            item.email ?? ""
                        )
                            .toLowerCase()
                            .includes(search) ||

                        String(
                            item.paket ?? ""
                        )
                            .toLowerCase()
                            .includes(search);

                    const matchStatus =
                        selectedStatus ===
                            "Semua" ||
                        item.status ===
                            selectedStatus;

                    return (
                        matchSearch &&
                        matchStatus
                    );
                }
            );

        return [...filtered].sort(
            (a, b) => {
                let valA =
                    a[sortField];

                let valB =
                    b[sortField];

                valA = String(
                    valA ?? ""
                )
                    .toLowerCase()
                    .trim();

                valB = String(
                    valB ?? ""
                )
                    .toLowerCase()
                    .trim();

                const result =
                    valA.localeCompare(
                        valB,
                        "id",
                        {
                            numeric: true,
                            sensitivity:
                                "base",
                        }
                    );

                return sortOrder ===
                    "asc"
                    ? result
                    : -result;
            }
        );
    }, [
        sekolahList,
        searchQuery,
        selectedStatus,
        sortField,
        sortOrder,
    ]);

    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages = Math.ceil(
        sortedData.length /
            ITEMS_PER_PAGE
    );

    const safeCurrentPage =
        totalPages > 0
            ? Math.min(
                  currentPage,
                  totalPages
              )
            : 1;

    const startIndex =
        (safeCurrentPage - 1) *
        ITEMS_PER_PAGE;

    const paginatedData =
        sortedData.slice(
            startIndex,
            startIndex +
                ITEMS_PER_PAGE
        );

    // =====================================================
    // SORT HANDLER
    // =====================================================

    const handleSort = (field) => {
        if (
            sortField === field
        ) {
            const newOrder =
                sortOrder === "asc"
                    ? "desc"
                    : "asc";

            setSortOrder(
                newOrder
            );

            setSortValue(
                `${field}-${newOrder}`
            );
        } else {
            setSortField(field);
            setSortOrder("asc");

            setSortValue(
                `${field}-asc`
            );
        }
    };

    // =====================================================
    // SORT SELECT
    // =====================================================

    const handleSortChange = (
        value
    ) => {
        const selected =
            sortOptions.find(
                (option) =>
                    option.value ===
                    value
            );

        if (!selected) return;

        setSortValue(value);

        setSortField(
            selected.field
        );

        setSortOrder(
            selected.order
        );
    };

    // =====================================================
    // SORT ICON
    // =====================================================

    const renderSortIcon = (
        field
    ) => {
        if (
            sortField !== field
        ) {
            return (
                <ArrowUp
                    size={12}
                    className="ml-1.5 text-slate-300"
                />
            );
        }

        return sortOrder ===
            "asc" ? (
            <ArrowUp
                size={12}
                className="ml-1.5 text-blue-600"
            />
        ) : (
            <ArrowDown
                size={12}
                className="ml-1.5 text-blue-600"
            />
        );
    };

    // =====================================================
    // VIEW DETAIL
    // =====================================================

    const handleViewDetail = (
        id
    ) => {
        if (!id) return;

        /*
         * Route frontend tetap menggunakan
         * route detail yang sudah ada.
         *
         * Backend detail:
         * GET /api/v1/yayasan/sekolah/:id
         */

        router.push(
            `/super-admin/yayasan/${id}`
        );
    };

    // =====================================================
    // TAMBAH YAYASAN
    // =====================================================

    const handleTambahYayasan = () => {
        router.push(
            "/super-admin/yayasan/tambah"
        );
    };

    // =====================================================
    // RESET FILTER
    // =====================================================

    const resetFilters = () => {
        setSearchQuery("");

        setSelectedStatus(
            "Semua"
        );

        setSortField("nama");
        setSortOrder("asc");
        setSortValue(
            "nama-asc"
        );

        setCurrentPage(1);
    };

    // =====================================================
    // ACTIVE FILTER COUNT
    // =====================================================

    const activeFilterCount =
        selectedStatus !==
        "Semua"
            ? 1
            : 0;

    // =====================================================
    // EXPORT CSV
    // =====================================================

    const handleExport = () => {
        if (
            sortedData.length === 0
        ) {
            window.alert(
                "Tidak ada data sekolah untuk diekspor."
            );

            return;
        }

        const headers = [
            "No",
            "Nama Sekolah",
            "Subdomain",
            "Email",
            "Telepon",
            "Paket",
            "Status Langganan",
            "Tanggal Berakhir",
            "Status Sekolah",
        ];

        const rows =
            sortedData.map(
                (item, index) => [
                    index + 1,
                    item.nama,
                    item.subdomain,
                    item.email,
                    item.telepon,
                    item.paket,
                    item.statusLangganan,
                    item.tanggalBerakhir
                        ? formatDate(
                              item.tanggalBerakhir
                          )
                        : "-",
                    item.status,
                ]
            );

        const escapeCSV = (
            value
        ) => {
            const text =
                String(
                    value ?? ""
                );

            return `"${text.replace(
                /"/g,
                '""'
            )}"`;
        };

        const csv = [
            headers
                .map(escapeCSV)
                .join(","),

            ...rows.map(
                (row) =>
                    row
                        .map(
                            escapeCSV
                        )
                        .join(",")
            ),
        ].join("\n");

        const blob =
            new Blob(
                [
                    "\uFEFF" +
                        csv,
                ],
                {
                    type: "text/csv;charset=utf-8;",
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href = url;

        link.download =
            "data-sekolah-binaan.csv";

        document.body.appendChild(
            link
        );

        link.click();

        document.body.removeChild(
            link
        );

        URL.revokeObjectURL(
            url
        );
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">

            {/* SIDEBAR */}

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

            {/* MAIN */}

            <div className="flex-1 flex flex-col min-w-0">

                {/* HEADER */}

                <Header
                    toggleSidebar={() =>
                        setSidebarOpen(
                            !sidebarOpen
                        )
                    }
                    notifications={
                        notifications
                    }
                    user={{
                        name: "Sarah",
                        email: "sarah@smartschool.com",
                        avatar: "SA",
                    }}
                />

                {/* CONTENT */}

                <main className="flex-1 p-4 sm:p-6 lg:p-8">

                    <div className="w-full max-w-[1800px] mx-auto space-y-6">

                        {/* PAGE HEADER */}

                        <section className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">

                            <div className="absolute right-0 top-0 w-72 h-72 bg-blue-50/60 rounded-full blur-3xl pointer-events-none" />

                            <div className="absolute right-24 bottom-0 w-40 h-40 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative p-5 sm:p-6 lg:p-7">

                                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                                    <div className="min-w-0">

                                        <div className="flex items-center gap-3">

                                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 flex-shrink-0">

                                                <Landmark
                                                    size={22}
                                                    strokeWidth={1.8}
                                                />

                                            </div>

                                            <div className="min-w-0">

                                                <div className="flex items-center gap-2 flex-wrap">

                                                    <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                                                        Sekolah Binaan
                                                    </h1>

                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] sm:text-xs font-semibold">

                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />

                                                        Yayasan

                                                    </span>

                                                </div>

                                                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                                                    Kelola dan pantau seluruh sekolah yang berada di bawah naungan yayasan.
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    {/* ACTION */}

                                    <div className="flex items-center gap-2">

                                        {/* TAMBAH YAYASAN */}

                                        <button
                                            type="button"
                                            onClick={
                                                handleTambahYayasan
                                            }
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20"
                                        >

                                            <Plus
                                                size={16}
                                                strokeWidth={2}
                                            />

                                            <span>
                                                Tambah Yayasan
                                            </span>

                                        </button>

                                        {/* EXPORT */}

                                        <button
                                            type="button"
                                            onClick={
                                                handleExport
                                            }
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                                        >

                                            <FileSpreadsheet
                                                size={16}
                                                strokeWidth={1.8}
                                            />

                                            <span className="hidden sm:inline">
                                                Export
                                            </span>

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </section>

                        {/* ERROR */}

                        {error && (
                            <section className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                                    <div className="flex items-start gap-3">

                                        <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">

                                            <XCircle
                                                size={17}
                                            />

                                        </div>

                                        <div>

                                            <p className="text-sm font-semibold text-rose-700">
                                                Gagal memuat data sekolah
                                            </p>

                                            <p className="text-xs text-rose-600 mt-0.5">
                                                {error}
                                            </p>

                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            fetchYayasan
                                        }
                                        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors"
                                    >

                                        <RotateCcw
                                            size={14}
                                        />

                                        Coba Lagi

                                    </button>

                                </div>

                            </section>
                        )}

                        {/* STATISTICS */}

                        <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">

                            <StatCard
                                label="Total Sekolah"
                                value={
                                    loading
                                        ? "..."
                                        : stats.total
                                }
                                icon={
                                    School
                                }
                                color="blue"
                            />

                            <StatCard
                                label="Sekolah Aktif"
                                value={
                                    loading
                                        ? "..."
                                        : stats.aktif
                                }
                                icon={
                                    CheckCircle2
                                }
                                color="emerald"
                            />

                            <StatCard
                                label="Masa Trial"
                                value={
                                    loading
                                        ? "..."
                                        : stats.trial
                                }
                                icon={
                                    Clock3
                                }
                                color="amber"
                            />

                            <StatCard
                                label="Nonaktif"
                                value={
                                    loading
                                        ? "..."
                                        : stats.nonaktif
                                }
                                icon={
                                    XCircle
                                }
                                color="rose"
                            />

                            <StatCard
                                label="Pengguna Aktif"
                                value={
                                    loading
                                        ? "..."
                                        : stats.totalPengguna
                                }
                                icon={
                                    Users
                                }
                                color="violet"
                            />

                        </section>

                        {/* FILTER */}

                        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

                            <div className="px-4 sm:px-5 py-4 border-b border-slate-100">

                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

                                    <div className="flex items-center gap-2">

                                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">

                                            <SlidersHorizontal
                                                size={16}
                                            />

                                        </div>

                                        <div>

                                            <h2 className="text-sm font-semibold text-slate-800">
                                                Filter & Urutkan Data
                                            </h2>

                                            <p className="text-[11px] text-slate-400">
                                                Gunakan pencarian, filter, dan urutan sekolah binaan
                                            </p>

                                        </div>

                                    </div>

                                    {activeFilterCount >
                                        0 && (
                                        <span className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-medium">
                                            {
                                                activeFilterCount
                                            }{" "}
                                            filter aktif
                                        </span>
                                    )}

                                </div>

                            </div>

                            <div className="p-4 sm:p-5">

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.8fr)_1fr_auto] gap-3">

                                    {/* SEARCH */}

                                    <div className="relative">

                                        <Search
                                            size={17}
                                            strokeWidth={1.8}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                        />

                                        <input
                                            type="text"
                                            placeholder="Cari nama sekolah, kode, subdomain, email, atau paket..."
                                            value={
                                                searchQuery
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setSearchQuery(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full h-10 pl-10 pr-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                        />

                                    </div>

                                    {/* STATUS */}

                                    <FilterSelect
                                        value={
                                            selectedStatus
                                        }
                                        onChange={
                                            setSelectedStatus
                                        }
                                        options={
                                            statusOptions
                                        }
                                        icon={
                                            CheckCircle2
                                        }
                                        label="Status"
                                    />

                                    {/* SORT */}

                                    <SortSelect
                                        value={
                                            sortValue
                                        }
                                        onChange={
                                            handleSortChange
                                        }
                                    />

                                </div>

                                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                                    <p className="text-xs text-slate-400">

                                        Menampilkan{" "}

                                        <span className="font-semibold text-slate-600">
                                            {
                                                paginatedData.length
                                            }
                                        </span>

                                        {" "}dari{" "}

                                        <span className="font-semibold text-slate-600">
                                            {
                                                sortedData.length
                                            }
                                        </span>

                                        {" "}sekolah

                                    </p>

                                    <div className="flex items-center gap-2 text-xs text-slate-400">

                                        <span>
                                            Diurutkan:
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 font-medium">

                                            {sortOrder ===
                                            "asc" ? (
                                                <ArrowUp
                                                    size={12}
                                                />
                                            ) : (
                                                <ArrowDown
                                                    size={12}
                                                />
                                            )}

                                            {
                                                sortOptions.find(
                                                    (
                                                        option
                                                    ) =>
                                                        option.value ===
                                                        sortValue
                                                )
                                                    ?.label
                                            }

                                        </span>

                                        <button
                                            type="button"
                                            onClick={
                                                resetFilters
                                            }
                                            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                                        >

                                            <RotateCcw
                                                size={13}
                                            />

                                            Reset

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </section>

                        {/* DATA TABLE */}

                        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

                            {/* HEADER */}

                            <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                                <div className="flex items-center gap-3">

                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

                                        <School
                                            size={17}
                                            strokeWidth={1.8}
                                        />

                                    </div>

                                    <div>

                                        <h2 className="text-sm font-semibold text-slate-800">
                                            Daftar Sekolah Binaan
                                        </h2>

                                        <p className="text-[11px] text-slate-400">
                                            Data sekolah yang berada di bawah yayasan
                                        </p>

                                    </div>

                                </div>

                                <div className="inline-flex items-center gap-2 text-xs text-slate-400">

                                    <Users
                                        size={14}
                                    />

                                    <span>
                                        {
                                            sortedData.length
                                        }{" "}
                                        data
                                    </span>

                                </div>

                            </div>

                            {/* MOBILE */}

                            {isMobile ? (

                                <div className="divide-y divide-slate-100">

                                    {loading ? (

                                        <LoadingMobile />

                                    ) : paginatedData.length ===
                                      0 ? (

                                        <EmptyState />

                                    ) : (

                                        paginatedData.map(
                                            (
                                                item,
                                                index
                                            ) => {

                                                const rowNumber =
                                                    startIndex +
                                                    index +
                                                    1;

                                                return (
                                                    <div
                                                        key={
                                                            item.id ||
                                                            `${item.nama}-${index}`
                                                        }
                                                        className="p-4 hover:bg-slate-50/50 transition-colors"
                                                    >

                                                        <div className="flex items-start gap-3">

                                                            <div className="w-6 pt-2 text-xs font-medium text-slate-400 text-center">
                                                                {
                                                                    rowNumber
                                                                }
                                                            </div>

                                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">

                                                                <School
                                                                    size={20}
                                                                    strokeWidth={1.7}
                                                                />

                                                            </div>

                                                            <div className="flex-1 min-w-0">

                                                                <div className="flex items-start justify-between gap-2">

                                                                    <div className="min-w-0">

                                                                        <p className="text-sm font-semibold text-slate-800 truncate">
                                                                            {
                                                                                item.nama
                                                                            }
                                                                        </p>

                                                                        <p className="mt-0.5 text-[11px] text-slate-400 font-mono truncate">
                                                                            {
                                                                                item.subdomain
                                                                            }
                                                                        </p>

                                                                    </div>

                                                                    <StatusBadge
                                                                        status={
                                                                            item.status
                                                                        }
                                                                    />

                                                                </div>

                                                                <div className="mt-3 flex flex-wrap gap-2">

                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-medium">

                                                                        <School
                                                                            size={12}
                                                                        />

                                                                        {item.paket !==
                                                                        "-" ? (
                                                                            item.paket
                                                                        ) : (
                                                                            "Belum ada paket"
                                                                        )}

                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </div>

                                                        <div className="mt-3 ml-9">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleViewDetail(
                                                                        item.id
                                                                    )
                                                                }
                                                                className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors"
                                                            >

                                                                <Eye
                                                                    size={14}
                                                                />

                                                                Detail

                                                            </button>

                                                        </div>

                                                    </div>
                                                );
                                            }
                                        )

                                    )}

                                </div>

                            ) : (

                                /* DESKTOP */

                                <div className="overflow-x-auto">

                                    <table className="w-full min-w-[900px] text-sm">

                                        <thead>

                                            <tr className="bg-slate-50/70 border-b border-slate-200">

                                                <TableHeader>
                                                    No
                                                </TableHeader>

                                                <TableHeader
                                                    sortable
                                                    onClick={() =>
                                                        handleSort(
                                                            "nama"
                                                        )
                                                    }
                                                >

                                                    <span className="inline-flex items-center">

                                                        Sekolah

                                                        {
                                                            renderSortIcon(
                                                                "nama"
                                                            )
                                                        }

                                                    </span>

                                                </TableHeader>

                                                <TableHeader
                                                    sortable
                                                    onClick={() =>
                                                        handleSort(
                                                            "kode"
                                                        )
                                                    }
                                                >

                                                    <span className="inline-flex items-center">

                                                        Kode Sekolah

                                                        {
                                                            renderSortIcon(
                                                                "kode"
                                                            )
                                                        }

                                                    </span>

                                                </TableHeader>

                                                <TableHeader>
                                                    Paket
                                                </TableHeader>

                                                <TableHeader
                                                    sortable
                                                    onClick={() =>
                                                        handleSort(
                                                            "status"
                                                        )
                                                    }
                                                >

                                                    <span className="inline-flex items-center">

                                                        Status

                                                        {
                                                            renderSortIcon(
                                                                "status"
                                                            )
                                                        }

                                                    </span>

                                                </TableHeader>

                                                <TableHeader>
                                                    Kontak
                                                </TableHeader>

                                                <TableHeader align="right">
                                                    Aksi
                                                </TableHeader>

                                            </tr>

                                        </thead>

                                        <tbody className="divide-y divide-slate-100">

                                            {loading ? (

                                                <LoadingTable />

                                            ) : paginatedData.length ===
                                              0 ? (

                                                <tr>

                                                    <td colSpan={7}>

                                                        <EmptyState />

                                                    </td>

                                                </tr>

                                            ) : (

                                                paginatedData.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => {

                                                        const rowNumber =
                                                            startIndex +
                                                            index +
                                                            1;

                                                        return (
                                                            <tr
                                                                key={
                                                                    item.id ||
                                                                    `${item.nama}-${index}`
                                                                }
                                                                className="group hover:bg-slate-50/70 transition-colors"
                                                            >

                                                                {/* NO */}

                                                                <td className="px-5 py-4 text-xs text-slate-400 w-14">

                                                                    {rowNumber
                                                                        .toString()
                                                                        .padStart(
                                                                            2,
                                                                            "0"
                                                                        )}

                                                                </td>

                                                                {/* SEKOLAH */}

                                                                <td className="px-5 py-4">

                                                                    <div className="flex items-center gap-3 min-w-[250px]">

                                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">

                                                                            <School
                                                                                size={19}
                                                                                strokeWidth={1.7}
                                                                            />

                                                                        </div>

                                                                        <div className="min-w-0">

                                                                            <p className="font-semibold text-slate-800 truncate max-w-[260px]">
                                                                                {
                                                                                    item.nama
                                                                                }
                                                                            </p>

                                                                            <p className="mt-0.5 text-[11px] text-slate-400 truncate max-w-[260px]">
                                                                                {
                                                                                    item.subdomain
                                                                                }
                                                                            </p>

                                                                        </div>

                                                                    </div>

                                                                </td>

                                                                {/* KODE */}

                                                                <td className="px-5 py-4">

                                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-xs font-mono text-slate-500">
                                                                        {
                                                                            item.kode
                                                                        }
                                                                    </span>

                                                                </td>

                                                                {/* PAKET */}

                                                                <td className="px-5 py-4">

                                                                    <div className="flex flex-col gap-1">

                                                                        <span className="text-sm font-medium text-slate-700">
                                                                            {
                                                                                item.paket
                                                                            }
                                                                        </span>

                                                                        {item.tanggalBerakhir && (
                                                                            <span className="text-[10px] text-slate-400">
                                                                                Berakhir:{" "}
                                                                                {formatDate(
                                                                                    item.tanggalBerakhir
                                                                                )}
                                                                            </span>
                                                                        )}

                                                                    </div>

                                                                </td>

                                                                {/* STATUS */}

                                                                <td className="px-5 py-4">

                                                                    <StatusBadge
                                                                        status={
                                                                            item.status
                                                                        }
                                                                    />

                                                                </td>

                                                                {/* KONTAK */}

                                                                <td className="px-5 py-4">

                                                                    <div className="min-w-[170px]">

                                                                        <p className="text-xs text-slate-600 truncate max-w-[190px]">
                                                                            {
                                                                                item.email ||
                                                                                "-"
                                                                            }
                                                                        </p>

                                                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                                                            {
                                                                                item.telepon ||
                                                                                "-"
                                                                            }
                                                                        </p>

                                                                    </div>

                                                                </td>

                                                                {/* ACTION */}

                                                                <td className="px-5 py-4">

                                                                    <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">

                                                                        <ActionButton
                                                                            icon={
                                                                                Eye
                                                                            }
                                                                            title="Lihat detail sekolah"
                                                                            color="blue"
                                                                            onClick={() =>
                                                                                handleViewDetail(
                                                                                    item.id
                                                                                )
                                                                            }
                                                                        />

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

                            {/* PAGINATION */}

                            <div className="px-4 sm:px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">

                                <p className="text-xs text-slate-400">

                                    Menampilkan{" "}

                                    <span className="font-semibold text-slate-600">
                                        {sortedData.length ===
                                        0
                                            ? 0
                                            : startIndex +
                                              1}
                                    </span>

                                    {" "}–{" "}

                                    <span className="font-semibold text-slate-600">

                                        {Math.min(
                                            startIndex +
                                                paginatedData.length,
                                            sortedData.length
                                        )}

                                    </span>

                                    {" "}dari{" "}

                                    <span className="font-semibold text-slate-600">
                                        {
                                            sortedData.length
                                        }
                                    </span>

                                    {" "}data

                                </p>

                                <div className="flex items-center gap-1">

                                    <button
                                        type="button"
                                        disabled={
                                            safeCurrentPage ===
                                            1
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                Math.max(
                                                    1,
                                                    safeCurrentPage -
                                                        1
                                                )
                                            )
                                        }
                                        className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >

                                        <ChevronLeft
                                            size={16}
                                        />

                                    </button>

                                    {totalPages >
                                        0 &&
                                        getPaginationPages(
                                            safeCurrentPage,
                                            totalPages
                                        ).map(
                                            (
                                                page,
                                                index
                                            ) =>
                                                page ===
                                                "..." ? (
                                                    <span
                                                        key={`ellipsis-${index}`}
                                                        className="w-8 text-center text-slate-400 text-xs"
                                                    >
                                                        ...
                                                    </span>
                                                ) : (
                                                    <button
                                                        key={
                                                            page
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                page
                                                            )
                                                        }
                                                        className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${
                                                            safeCurrentPage ===
                                                            page
                                                                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                                                                : "text-slate-500 hover:bg-slate-100"
                                                        }`}
                                                    >
                                                        {
                                                            page
                                                        }
                                                    </button>
                                                )
                                        )}

                                    <button
                                        type="button"
                                        disabled={
                                            totalPages ===
                                                0 ||
                                            safeCurrentPage ===
                                                totalPages
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                Math.min(
                                                    totalPages,
                                                    safeCurrentPage +
                                                        1
                                                )
                                            )
                                        }
                                        className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >

                                        <ChevronRight
                                            size={16}
                                        />

                                    </button>

                                </div>

                            </div>

                        </section>

                        {/* FOOTER */}

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-2 border-t border-slate-200/60">

                            <p className="text-[11px] text-slate-400">
                                SmartSchool Management System
                            </p>

                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">

                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

                                Sistem berjalan normal

                            </div>

                        </div>

                    </div>

                </main>

            </div>

        </div>
    );
}

// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(value) {
    if (!value) {
        return "-";
    }

    try {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return new Intl.DateTimeFormat(
            "id-ID",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        ).format(date);
    } catch {
        return "-";
    }
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
    label,
    value,
    icon: Icon,
    color,
}) {
    const colorClasses = {
        blue: {
            icon: "bg-blue-50 text-blue-600",
            accent: "bg-blue-500",
        },

        emerald: {
            icon: "bg-emerald-50 text-emerald-600",
            accent: "bg-emerald-500",
        },

        amber: {
            icon: "bg-amber-50 text-amber-600",
            accent: "bg-amber-500",
        },

        rose: {
            icon: "bg-rose-50 text-rose-600",
            accent: "bg-rose-500",
        },

        violet: {
            icon: "bg-violet-50 text-violet-600",
            accent: "bg-violet-500",
        },
    };

    const current =
        colorClasses[color] ||
        colorClasses.blue;

    return (
        <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

            <div
                className={`absolute top-0 left-0 right-0 h-[2px] ${current.accent} opacity-70`}
            />

            <div className="flex items-center gap-3">

                <div
                    className={`w-10 h-10 rounded-xl ${current.icon} flex items-center justify-center flex-shrink-0`}
                >

                    <Icon
                        size={18}
                        strokeWidth={1.8}
                    />

                </div>

                <div className="min-w-0">

                    <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wide text-slate-400 truncate">
                        {label}
                    </p>

                    <div className="flex items-center gap-1.5 mt-0.5">

                        <p className="text-lg sm:text-xl font-bold tracking-tight text-slate-800">
                            {value}
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

// =========================================================
// FILTER SELECT
// =========================================================

function FilterSelect({
    value,
    onChange,
    options,
    icon: Icon,
    label,
}) {
    return (
        <div className="relative">

            <Icon
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />

            <select
                value={value}
                onChange={(e) =>
                    onChange(
                        e.target.value
                    )
                }
                aria-label={label}
                className="w-full h-10 appearance-none pl-9 pr-8 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer transition-all focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            >

                {options.map(
                    (option) => (
                        <option
                            key={
                                option
                            }
                            value={
                                option
                            }
                        >
                            {
                                option
                            }
                        </option>
                    )
                )}

            </select>

            <ChevronRight
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none"
            />

        </div>
    );
}

// =========================================================
// SORT SELECT
// =========================================================

function SortSelect({
    value,
    onChange,
}) {
    return (
        <div className="relative">

            <ArrowDownAZ
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />

            <select
                value={value}
                onChange={(e) =>
                    onChange(
                        e.target.value
                    )
                }
                aria-label="Urutkan data"
                className="w-full h-10 appearance-none pl-9 pr-8 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer transition-all focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            >

                {sortOptions.map(
                    (option) => (
                        <option
                            key={
                                option.value
                            }
                            value={
                                option.value
                            }
                        >
                            {
                                option.label
                            }
                        </option>
                    )
                )}

            </select>

            <ChevronRight
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none"
            />

        </div>
    );
}

// =========================================================
// TABLE HEADER
// =========================================================

function TableHeader({
    children,
    sortable = false,
    onClick,
    align = "left",
}) {
    return (
        <th
            onClick={
                onClick
            }
            className={`px-5 py-3.5 text-${align} text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 ${
                sortable
                    ? "cursor-pointer hover:text-slate-600 select-none"
                    : ""
            }`}
        >
            {children}
        </th>
    );
}

// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({
    status,
}) {
    const style =
        statusColorMap[
            status
        ] ||
        statusColorMap.Nonaktif;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}
        >

            <span
                className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
            />

            {status}

        </span>
    );
}

// =========================================================
// ACTION BUTTON
// =========================================================

function ActionButton({
    icon: Icon,
    title,
    color,
    onClick,
}) {
    const colors = {
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
            onClick={
                onClick
            }
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 transition-all ${colors[color] || colors.blue}`}
        >

            <Icon
                size={15}
                strokeWidth={1.8}
            />

        </button>
    );
}

// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-5">

            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">

                <Search
                    size={24}
                    strokeWidth={1.7}
                />

            </div>

            <h3 className="text-sm font-semibold text-slate-700">
                Data tidak ditemukan
            </h3>

            <p className="mt-1 text-xs text-slate-400 text-center max-w-sm">
                Tidak ada sekolah yang sesuai dengan pencarian atau filter yang dipilih.
            </p>

        </div>
    );
}

// =========================================================
// LOADING MOBILE
// =========================================================

function LoadingMobile() {
    return (
        <div className="divide-y divide-slate-100">

            {Array.from(
                {
                    length: 5,
                }
            ).map(
                (_, index) => (
                    <div
                        key={
                            index
                        }
                        className="p-4 animate-pulse"
                    >

                        <div className="flex items-start gap-3">

                            <div className="w-6 h-4 bg-slate-100 rounded mt-2" />

                            <div className="w-11 h-11 rounded-xl bg-slate-100" />

                            <div className="flex-1">

                                <div className="h-4 bg-slate-100 rounded w-2/3" />

                                <div className="mt-2 h-3 bg-slate-100 rounded w-1/3" />

                                <div className="mt-3 h-6 bg-slate-100 rounded w-24" />

                            </div>

                        </div>

                    </div>
                )
            )}

        </div>
    );
}

// =========================================================
// LOADING TABLE
// =========================================================

function LoadingTable() {
    return (
        <>
            {Array.from(
                {
                    length: 5,
                }
            ).map(
                (_, index) => (
                    <tr
                        key={
                            index
                        }
                        className="animate-pulse"
                    >

                        <td className="px-5 py-4">
                            <div className="h-3 bg-slate-100 rounded w-5" />
                        </td>

                        <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                                <div className="w-10 h-10 rounded-xl bg-slate-100" />

                                <div className="space-y-2">

                                    <div className="h-4 bg-slate-100 rounded w-36" />

                                    <div className="h-3 bg-slate-100 rounded w-20" />

                                </div>

                            </div>

                        </td>

                        <td className="px-5 py-4">

                            <div className="h-6 bg-slate-100 rounded-lg w-24" />

                        </td>

                        <td className="px-5 py-4">

                            <div className="h-4 bg-slate-100 rounded w-28" />

                        </td>

                        <td className="px-5 py-4">

                            <div className="h-6 bg-slate-100 rounded-full w-16" />

                        </td>

                        <td className="px-5 py-4">

                            <div className="h-4 bg-slate-100 rounded w-32" />

                        </td>

                        <td className="px-5 py-4">

                            <div className="flex justify-end">

                                <div className="h-8 bg-slate-100 rounded-lg w-10" />

                            </div>

                        </td>

                    </tr>
                )
            )}
        </>
    );
}

// =========================================================
// PAGINATION
// =========================================================

function getPaginationPages(
    currentPage,
    totalPages
) {
    if (
        totalPages <= 5
    ) {
        return Array.from(
            {
                length:
                    totalPages,
            },
            (_, i) =>
                i + 1
        );
    }

    if (
        currentPage <= 3
    ) {
        return [
            1,
            2,
            3,
            4,
            "...",
            totalPages,
        ];
    }

    if (
        currentPage >=
        totalPages - 2
    ) {
        return [
            1,
            "...",
            totalPages - 3,
            totalPages - 2,
            totalPages - 1,
            totalPages,
        ];
    }

    return [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
    ];
}