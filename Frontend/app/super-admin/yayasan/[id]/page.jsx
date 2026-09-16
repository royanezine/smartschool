"use client";

import { useParams, useRouter } from "next/navigation";
import {
    Building2,
    School,
    Users,
    UserCheck,
    Mail as MailIcon,
    Phone,
    Globe as GlobeIcon,
    MapPin,
    ArrowLeft,
    User,
    Edit,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
} from "lucide-react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { useEffect, useState } from "react";

export default function DetailYayasanPage() {
    const params = useParams();
    const router = useRouter();

    // =========================================================
    // ID DARI URL
    // =========================================================
    // ID database berupa UUID, jadi JANGAN menggunakan parseInt()
    const id = Array.isArray(params?.id)
        ? params.id[0]
        : params?.id;

    // =========================================================
    // STATE
    // =========================================================
    const [yayasan, setYayasan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeMenu] = useState("yayasan");

    // =========================================================
    // NOTIFICATIONS
    // =========================================================
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

    // =========================================================
    // LOAD DETAIL YAYASAN
    // =========================================================
    useEffect(() => {
        if (!id) {
            setError("ID yayasan tidak ditemukan.");
            setLoading(false);
            return;
        }

        let cancelled = false;

        const loadDetailYayasan = async () => {
            try {
                setLoading(true);
                setError("");

                const API_URL =
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://localhost:5000";

                const token =
                    typeof window !== "undefined"
                        ? localStorage.getItem("token")
                        : null;

                if (!token) {
                    throw new Error(
                        "Token login tidak ditemukan. Silakan login kembali."
                    );
                }

                // =================================================
                // REQUEST KE BACKEND
                // =================================================
                const response = await fetch(
                    `${API_URL}/api/yayasan/${id}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        cache: "no-store",
                    }
                );

                const text = await response.text();

                let result = null;

                try {
                    result = text ? JSON.parse(text) : null;
                } catch {
                    console.error(
                        "Response bukan JSON:",
                        text
                    );

                    throw new Error(
                        "Response dari server bukan JSON."
                    );
                }

                console.log(
                    "DETAIL YAYASAN RESPONSE:",
                    result
                );

                if (!response.ok) {
                    throw new Error(
                        result?.message ||
                            "Gagal mengambil detail yayasan."
                    );
                }

                if (cancelled) return;

                // =================================================
                // UNWRAP RESPONSE
                // =================================================
                const data = unwrapResponse(result);

                console.log(
                    "DETAIL YAYASAN DATA:",
                    data
                );

                // =================================================
                // CARI OBJECT YAYASAN
                // =================================================
                const rawYayasan =
                    data?.yayasan ||
                    data?.profil ||
                    data?.data?.yayasan ||
                    data?.data?.profil ||
                    data;

                if (
                    !rawYayasan ||
                    typeof rawYayasan !== "object"
                ) {
                    throw new Error(
                        "Data yayasan tidak ditemukan."
                    );
                }

                // =================================================
                // STATISTIK
                // =================================================
                const statistik =
                    data?.statistik ||
                    data?.statistics ||
                    rawYayasan?.statistik ||
                    rawYayasan?.statistics ||
                    {};

                // =================================================
                // DAFTAR SEKOLAH
                // =================================================
                const rawSekolah =
                    rawYayasan?.sekolah ||
                    rawYayasan?.sekolahs ||
                    rawYayasan?.sekolahList ||
                    data?.sekolah ||
                    data?.sekolahs ||
                    [];

                const daftarSekolah =
                    Array.isArray(rawSekolah)
                        ? rawSekolah
                        : [];

                // =================================================
                // NORMALIZE DATA
                // =================================================
                const normalized = {
                    id:
                        rawYayasan?.id ||
                        id,

                    nama:
                        rawYayasan?.nama ||
                        rawYayasan?.namaYayasan ||
                        rawYayasan?.nama_yayasan ||
                        "-",

                    npyp:
                        rawYayasan?.npyp ||
                        rawYayasan?.NPYP ||
                        "-",

                    status:
                        normalizeStatus(
                            rawYayasan?.status
                        ),

                    ketua:
                        rawYayasan?.ketua ||
                        rawYayasan?.ketuaYayasan ||
                        rawYayasan?.namaKetua ||
                        rawYayasan?.pimpinan ||
                        "-",

                    email:
                        rawYayasan?.email ||
                        "-",

                    telepon:
                        rawYayasan?.telepon ||
                        rawYayasan?.noTelepon ||
                        rawYayasan?.nomorTelepon ||
                        "-",

                    website:
                        rawYayasan?.website ||
                        rawYayasan?.urlWebsite ||
                        "-",

                    alamat:
                        rawYayasan?.alamat ||
                        "-",

                    kelurahan:
                        rawYayasan?.kelurahan ||
                        rawYayasan?.desa ||
                        "-",

                    kecamatan:
                        rawYayasan?.kecamatan ||
                        "-",

                    kota:
                        rawYayasan?.kota ||
                        rawYayasan?.kabupaten ||
                        "-",

                    provinsi:
                        rawYayasan?.provinsi ||
                        "-",

                    kodePos:
                        rawYayasan?.kodePos ||
                        rawYayasan?.kode_pos ||
                        "-",

                    logo:
                        rawYayasan?.logoUrl ||
                        rawYayasan?.logo ||
                        rawYayasan?.logoBesarUrl ||
                        null,

                    bergabung:
                        rawYayasan?.dibuatPada ||
                        rawYayasan?.createdAt ||
                        rawYayasan?.tanggalDaftar ||
                        null,

                    // =================================================
                    // JUMLAH SEKOLAH
                    // =================================================
                    jumlahSekolah:
                        Number(
                            statistik?.jumlahSekolah ??
                                statistik?.totalSekolah ??
                                rawYayasan?.jumlahSekolah ??
                                rawYayasan?.totalSekolah ??
                                daftarSekolah.length ??
                                0
                        ) || 0,

                    // =================================================
                    // GURU
                    // =================================================
                    totalGuru:
                        Number(
                            statistik?.totalGuru ??
                                statistik?.jumlahGuru ??
                                rawYayasan?.totalGuru ??
                                rawYayasan?.jumlahGuru ??
                                0
                        ) || 0,

                    // =================================================
                    // SISWA
                    // =================================================
                    totalSiswa:
                        Number(
                            statistik?.totalSiswa ??
                                statistik?.jumlahSiswa ??
                                rawYayasan?.totalSiswa ??
                                rawYayasan?.jumlahSiswa ??
                                0
                        ) || 0,

                    // =================================================
                    // ADMIN
                    // =================================================
                    totalAdmin:
                        Number(
                            statistik?.totalAdmin ??
                                statistik?.jumlahAdmin ??
                                rawYayasan?.totalAdmin ??
                                rawYayasan?.jumlahAdmin ??
                                0
                        ) || 0,

                    sekolah: daftarSekolah,
                };

                console.log(
                    "DETAIL YAYASAN NORMALIZED:",
                    normalized
                );

                setYayasan(normalized);
            } catch (err) {
                console.error(
                    "ERROR DETAIL YAYASAN:",
                    err
                );

                if (cancelled) return;

                setError(
                    err?.message ||
                        "Gagal mengambil data yayasan."
                );

                setYayasan(null);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadDetailYayasan();

        return () => {
            cancelled = true;
        };
    }, [id]);

    // =========================================================
    // LOADING
    // =========================================================
    if (loading) {
        return (
            <div className="flex h-screen bg-slate-50 overflow-hidden">
                <Sidebar
                    active={activeMenu}
                    setActive={() => {}}
                    collapsed={!sidebarOpen}
                    setCollapsed={() =>
                        setSidebarOpen(!sidebarOpen)
                    }
                />

                <div className="flex-1 flex flex-col min-w-0">
                    <Header
                        toggleSidebar={() =>
                            setSidebarOpen(!sidebarOpen)
                        }
                        notifications={notifications}
                        user={{
                            name: "Sarah",
                            email: "sarah@smartschool.com",
                            avatar: "SA",
                        }}
                    />

                    <main className="flex-1 flex items-center justify-center p-6">
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                                <Loader2
                                    size={28}
                                    className="text-blue-600 animate-spin"
                                />
                            </div>

                            <h2 className="text-lg font-semibold text-slate-700">
                                Memuat data yayasan...
                            </h2>

                            <p className="text-sm text-slate-400 mt-1">
                                Sedang mengambil data dari server.
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    // =========================================================
    // ERROR / DATA TIDAK ADA
    // =========================================================
    if (!yayasan) {
        return (
            <div className="flex h-screen bg-slate-50 overflow-hidden">
                <Sidebar
                    active={activeMenu}
                    setActive={() => {}}
                    collapsed={!sidebarOpen}
                    setCollapsed={() =>
                        setSidebarOpen(!sidebarOpen)
                    }
                />

                <div className="flex-1 flex flex-col min-w-0">
                    <Header
                        toggleSidebar={() =>
                            setSidebarOpen(!sidebarOpen)
                        }
                        notifications={notifications}
                        user={{
                            name: "Sarah",
                            email: "sarah@smartschool.com",
                            avatar: "SA",
                        }}
                    />

                    <main className="flex-1 flex items-center justify-center p-6">
                        <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-slate-200/80 max-w-md w-full">
                            <AlertCircle
                                size={48}
                                className="text-rose-300 mx-auto mb-4"
                            />

                            <h2 className="text-2xl font-semibold text-slate-700">
                                Yayasan tidak ditemukan
                            </h2>

                            <p className="text-slate-500 text-sm mt-2">
                                {error ||
                                    "Data yang Anda cari mungkin telah dihapus."}
                            </p>

                            <button
                                onClick={() =>
                                    router.push(
                                        "/super-admin/yayasan"
                                    )
                                }
                                className="mt-5 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
                            >
                                Kembali ke Daftar Yayasan
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    // =========================================================
    // STATUS
    // =========================================================
    const statusColorMap = {
        Aktif: {
            bg: "bg-emerald-50",
            text: "text-emerald-700",
            border: "border-emerald-200",
            dot: "bg-emerald-500",
            icon: CheckCircle,
        },

        Trial: {
            bg: "bg-amber-50",
            text: "text-amber-700",
            border: "border-amber-200",
            dot: "bg-amber-500",
            icon: Clock,
        },

        Nonaktif: {
            bg: "bg-rose-50",
            text: "text-rose-700",
            border: "border-rose-200",
            dot: "bg-rose-500",
            icon: XCircle,
        },
    };

    const statusStyle =
        statusColorMap[yayasan.status] ||
        statusColorMap.Nonaktif;

    const StatusIcon = statusStyle.icon;

    // =========================================================
    // TOTAL PENGGUNA
    // =========================================================
    const totalPengguna =
        Number(yayasan.totalGuru || 0) +
        Number(yayasan.totalSiswa || 0) +
        Number(yayasan.totalAdmin || 0);

    // =========================================================
    // RENDER
    // =========================================================
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* =====================================================
                SIDEBAR
            ===================================================== */}
            <Sidebar
                active={activeMenu}
                setActive={() => {}}
                collapsed={!sidebarOpen}
                setCollapsed={() =>
                    setSidebarOpen(!sidebarOpen)
                }
            />

            <div className="flex-1 flex flex-col min-w-0">
                {/* =================================================
                    HEADER
                ================================================= */}
                <Header
                    toggleSidebar={() =>
                        setSidebarOpen(!sidebarOpen)
                    }
                    notifications={notifications}
                    user={{
                        name: "Sarah",
                        email: "sarah@smartschool.com",
                        avatar: "SA",
                    }}
                />

                {/* =================================================
                    MAIN
                ================================================= */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        {/* =================================================
                            KEMBALI
                        ================================================= */}
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-5 group"
                        >
                            <ArrowLeft
                                size={16}
                                className="group-hover:-translate-x-0.5 transition-transform"
                            />

                            Kembali
                        </button>

                        {/* =================================================
                            HEADER DETAIL
                        ================================================= */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-sm mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                    {/* LOGO */}
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200/50 flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
                                        {yayasan.logo ? (
                                            <img
                                                src={yayasan.logo}
                                                alt={`Logo ${yayasan.nama}`}
                                                className="w-full h-full object-contain"
                                                onError={(event) => {
                                                    event.currentTarget.style.display =
                                                        "none";
                                                }}
                                            />
                                        ) : (
                                            <Building2
                                                size={30}
                                                className="text-slate-400"
                                            />
                                        )}
                                    </div>

                                    {/* NAMA */}
                                    <div className="min-w-0">
                                        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                                            {yayasan.nama}
                                        </h1>

                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <span className="text-sm text-slate-500 font-mono">
                                                NPYP:{" "}
                                                {yayasan.npyp ||
                                                    "-"}
                                            </span>

                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                            >
                                                <StatusIcon
                                                    size={12}
                                                />

                                                {
                                                    yayasan.status
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* EDIT */}
                                <div className="flex items-center gap-2 ml-auto sm:ml-0">
                                    <button
                                        onClick={() =>
                                            router.push(
                                                `/super-admin/yayasan/edit/${yayasan.id}`
                                            )
                                        }
                                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
                                    >
                                        <Edit
                                            size={15}
                                        />

                                        <span>
                                            Edit
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* INFO */}
                            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-200/60 text-sm text-slate-500">
                                {yayasan.bergabung && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar
                                            size={14}
                                            className="text-slate-400"
                                        />

                                        Bergabung:{" "}
                                        {formatDate(
                                            yayasan.bergabung
                                        )}
                                    </span>
                                )}

                                <span className="flex items-center gap-1.5">
                                    <Building2
                                        size={14}
                                        className="text-slate-400"
                                    />

                                    {
                                        yayasan.jumlahSekolah
                                    }{" "}
                                    Sekolah
                                </span>
                            </div>
                        </div>

                        {/* =================================================
                            GRID INFO UTAMA
                        ================================================= */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {/* KETUA */}
                            <InfoBox
                                icon={User}
                                color="blue"
                                label="Ketua Yayasan"
                                value={
                                    yayasan.ketua
                                }
                            />

                            {/* SEKOLAH */}
                            <InfoBox
                                icon={School}
                                color="emerald"
                                label="Jumlah Sekolah"
                                value={`${yayasan.jumlahSekolah} Sekolah`}
                            />

                            {/* PENGGUNA */}
                            <InfoBox
                                icon={Users}
                                color="violet"
                                label="Total Pengguna"
                                value={
                                    totalPengguna
                                }
                            />
                        </div>

                        {/* =================================================
                            DETAIL 2 KOLOM
                        ================================================= */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* =================================================
                                KONTAK
                            ================================================= */}
                            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
                                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                    <MailIcon
                                        size={16}
                                        className="text-slate-400"
                                    />

                                    Kontak
                                </h3>

                                <div className="space-y-3">
                                    <ContactRow
                                        icon={MailIcon}
                                        value={
                                            yayasan.email
                                        }
                                    />

                                    <ContactRow
                                        icon={Phone}
                                        value={
                                            yayasan.telepon
                                        }
                                    />

                                    <ContactRow
                                        icon={GlobeIcon}
                                        value={
                                            yayasan.website
                                        }
                                    />
                                </div>
                            </div>

                            {/* =================================================
                                ALAMAT
                            ================================================= */}
                            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
                                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                    <MapPin
                                        size={16}
                                        className="text-slate-400"
                                    />

                                    Alamat
                                </h3>

                                <div className="space-y-2 text-sm">
                                    <p className="text-slate-600 bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-200/40">
                                        {yayasan.alamat ||
                                            "-"}
                                    </p>

                                    <p className="text-slate-500 bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-200/40">
                                        {buildAddress(
                                            yayasan
                                        )}

                                        <span className="block text-xs text-slate-400 mt-0.5">
                                            Kode Pos:{" "}
                                            {yayasan.kodePos ||
                                                "-"}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            STATISTIK
                        ================================================= */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <StatCard
                                icon={Users}
                                value={
                                    yayasan.totalGuru
                                }
                                label="Guru"
                                color="blue"
                            />

                            <StatCard
                                icon={UserCheck}
                                value={
                                    yayasan.totalSiswa
                                }
                                label="Siswa"
                                color="emerald"
                            />

                            <StatCard
                                icon={User}
                                value={
                                    yayasan.totalAdmin
                                }
                                label="Admin"
                                color="violet"
                            />
                        </div>

                        {/* =================================================
                            SEKOLAH DI BAWAH NAUNGAN
                        ================================================= */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm mb-6">
                            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                <School
                                    size={16}
                                    className="text-slate-400"
                                />

                                Sekolah Di Bawah Naungan
                            </h3>

                            {yayasan.sekolah.length >
                            0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {yayasan.sekolah.map(
                                        (
                                            sekolah,
                                            index
                                        ) => {
                                            const sekolahNama =
                                                typeof sekolah ===
                                                "string"
                                                    ? sekolah
                                                    : sekolah?.nama ||
                                                      sekolah?.namaSekolah ||
                                                      "-";

                                            return (
                                                <div
                                                    key={
                                                        sekolah?.id ||
                                                        index
                                                    }
                                                    className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-200/40"
                                                >
                                                    <Building2
                                                        size={
                                                            14
                                                        }
                                                        className="text-slate-400 flex-shrink-0"
                                                    />

                                                    <span className="truncate">
                                                        {
                                                            sekolahNama
                                                        }
                                                    </span>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <School
                                        size={32}
                                        className="mx-auto text-slate-300 mb-2"
                                    />

                                    <p className="text-sm text-slate-400">
                                        Belum ada sekolah di bawah yayasan ini.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* =================================================
                            TOMBOL AKSI
                        ================================================= */}
                        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200/80">
                            <button
                                onClick={() =>
                                    router.back()
                                }
                                className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Tutup
                            </button>

                            <button
                                onClick={() =>
                                    router.push(
                                        `/super-admin/yayasan/edit/${yayasan.id}`
                                    )
                                }
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
                            >
                                <Edit size={16} />

                                Edit Yayasan
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

// =============================================================
// UNWRAP RESPONSE BACKEND
// =============================================================
function unwrapResponse(response) {
    if (!response) {
        return null;
    }

    // response.data
    if (
        response.data !== undefined &&
        response.data !== null
    ) {
        // Jika data langsung object profil/statistik
        if (
            response.data?.profil ||
            response.data?.yayasan ||
            response.data?.statistik ||
            response.data?.statistics
        ) {
            return response.data;
        }

        // Jika nested lagi
        if (
            response.data?.data !== undefined
        ) {
            return response.data.data;
        }

        return response.data;
    }

    return response;
}

// =============================================================
// NORMALIZE STATUS
// =============================================================
function normalizeStatus(status) {
    if (!status) {
        return "Nonaktif";
    }

    const value = String(status)
        .trim()
        .toLowerCase();

    if (
        value === "aktif" ||
        value === "active"
    ) {
        return "Aktif";
    }

    if (
        value === "trial" ||
        value === "uji coba" ||
        value === "uji_coba"
    ) {
        return "Trial";
    }

    if (
        value === "nonaktif" ||
        value === "inactive" ||
        value === "tidak aktif"
    ) {
        return "Nonaktif";
    }

    return (
        String(status).charAt(0).toUpperCase() +
        String(status).slice(1)
    );
}

// =============================================================
// FORMAT DATE
// =============================================================
function formatDate(date) {
    if (!date) {
        return "-";
    }

    const parsedDate = new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "-";
    }

    return parsedDate.toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
        }
    );
}

// =============================================================
// BUILD ADDRESS
// =============================================================
function buildAddress(yayasan) {
    const parts = [
        yayasan?.kelurahan,
        yayasan?.kecamatan,
        yayasan?.kota,
        yayasan?.provinsi,
    ].filter(
        (item) =>
            item &&
            item !== "-"
    );

    return parts.length > 0
        ? parts.join(", ")
        : "-";
}

// =============================================================
// INFO BOX
// =============================================================
function InfoBox({
    icon: Icon,
    color,
    label,
    value,
}) {
    const colorMap = {
        blue: "bg-blue-50 text-blue-600",
        emerald:
            "bg-emerald-50 text-emerald-600",
        violet:
            "bg-violet-50 text-violet-600",
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div
                    className={`p-2 rounded-lg ${
                        colorMap[color] ||
                        colorMap.blue
                    }`}
                >
                    <Icon size={16} />
                </div>

                <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-medium">
                        {label}
                    </p>

                    <p className="text-sm font-semibold text-slate-700 truncate">
                        {value || "-"}
                    </p>
                </div>
            </div>
        </div>
    );
}

// =============================================================
// CONTACT ROW
// =============================================================
function ContactRow({
    icon: Icon,
    value,
}) {
    return (
        <div className="flex items-center gap-3 text-sm bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-200/40">
            <Icon
                size={15}
                className="text-slate-400 flex-shrink-0"
            />

            <span className="text-slate-600 truncate">
                {value || "-"}
            </span>
        </div>
    );
}

// =============================================================
// STAT CARD
// =============================================================
function StatCard({
    icon: Icon,
    value,
    label,
    color,
}) {
    const colorMap = {
        blue: "bg-blue-50 text-blue-600",
        emerald:
            "bg-emerald-50 text-emerald-600",
        violet:
            "bg-violet-50 text-violet-600",
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 text-center shadow-sm">
            <div
                className={`p-2 rounded-lg ${
                    colorMap[color] ||
                    colorMap.blue
                } w-fit mx-auto mb-1.5`}
            >
                <Icon size={18} />
            </div>

            <p className="text-xl font-bold text-slate-800">
                {Number(value) || 0}
            </p>

            <p className="text-xs text-slate-400 font-medium">
                {label}
            </p>
        </div>
    );
}