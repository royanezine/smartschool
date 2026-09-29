"use client";

import { useParams, useRouter } from "next/navigation";
import {
    School,
    Building2,
    Users,
    GraduationCap,
    Mail as MailIcon,
    Phone,
    Globe as GlobeIcon,
    MapPin,
    BarChart3,
    ArrowLeft,
    UserCog,
    BookOpen,
    LayoutGrid,
    Calendar,
    Edit,
    Sparkles,
    Clock,
    Briefcase,
    Loader2,
    AlertCircle,
} from "lucide-react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { getDetailSekolahBinaan } from "../../../../services/yayasan.service";
import { useState, useEffect } from "react";

export default function DetailSekolahPage() {
    const params = useParams();
    const router = useRouter();

    // ID backend berupa UUID, jadi JANGAN parseInt
    const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

    const [school, setSchool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeMenu] = useState("sekolah");
    const [isMobile, setIsMobile] = useState(false);

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
            title: "Sekolah baru mendaftar",
            desc: "Dikirim 3 hari lalu",
            read: true,
        },
    ];

    // =========================================================
    // CEK MOBILE
    // =========================================================
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };

        checkMobile();

        window.addEventListener("resize", checkMobile);

        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }, []);

    // =========================================================
    // AMBIL DETAIL SEKOLAH DARI BACKEND
    // =========================================================
    useEffect(() => {
        if (!id) {
            setError("ID sekolah tidak ditemukan");
            setLoading(false);
            return;
        }

        let cancelled = false;

        const loadDetailSekolah = async () => {
            try {
                setLoading(true);
                setError("");

                console.log(
                    "Mengambil detail sekolah dengan ID:",
                    id
                );

                const response = await getDetailSekolahBinaan(id);

                console.log(
                    "Response detail sekolah:",
                    response
                );

                if (cancelled) return;

                /*
                 * Backend successResponse biasanya menghasilkan:
                 *
                 * {
                 *   success: true,
                 *   message: "...",
                 *   data: {
                 *      profil: {...},
                 *      statistik: {...}
                 *   }
                 * }
                 *
                 * Tetapi kita buat pengambilan data fleksibel
                 * supaya tidak error kalau service sudah
                 * mengembalikan response.data.
                 */

                let result = response;

                if (result?.data !== undefined) {
                    result = result.data;
                }

                /*
                 * Kalau masih berupa:
                 * {
                 *   data: {
                 *      profil,
                 *      statistik
                 *   }
                 * }
                 */
                if (
                    result?.data?.profil ||
                    result?.data?.statistik
                ) {
                    result = result.data;
                }

                const profil =
                    result?.profil ||
                    result?.sekolah ||
                    result?.school ||
                    null;

                const statistik =
                    result?.statistik ||
                    result?.statistics ||
                    {};

                if (!profil) {
                    console.error(
                        "Data profil sekolah tidak ditemukan:",
                        response
                    );

                    throw new Error(
                        "Data sekolah tidak ditemukan dari server"
                    );
                }

                // =================================================
                // LANGGANAN TERBARU
                // =================================================
                const langganan =
                    Array.isArray(profil?.langgananSekolah)
                        ? profil.langgananSekolah[0]
                        : profil?.langgananSekolah ||
                          null;

                // =================================================
                // FORMAT DATA UNTUK UI
                // =================================================
                const normalizedSchool = {
                    // ID
                    id: profil?.id || id,

                    // IDENTITAS
                    nama:
                        profil?.nama ||
                        profil?.namaSekolah ||
                        "-",

                    npsn:
                        profil?.npsn ||
                        "-",

                    subdomain:
                        profil?.subdomain ||
                        "-",

                    // =================================================
                    // JENJANG
                    // =================================================
                    jenjang:
                        profil?.jenjang ||
                        profil?.tingkat ||
                        "-",

                    // =================================================
                    // STATUS
                    // =================================================
                    status:
                        normalizeStatus(
                            profil?.status ||
                                langganan?.statusLangganan
                        ),

                    statusSekolah:
                        profil?.status ||
                        "-",

                    // =================================================
                    // YAYASAN
                    // =================================================
                    yayasan:
                        profil?.yayasan?.nama ||
                        profil?.namaYayasan ||
                        "-",

                    // =================================================
                    // PAKET
                    // =================================================
                    paket:
                        langganan?.paket?.nama ||
                        profil?.paket?.nama ||
                        profil?.namaPaket ||
                        "-",

                    paketId:
                        langganan?.paket?.id ||
                        profil?.paketId ||
                        null,

                    // =================================================
                    // KONTAK
                    // =================================================
                    email:
                        profil?.email ||
                        "-",

                    telepon:
                        profil?.telepon ||
                        profil?.noTelepon ||
                        profil?.nomorTelepon ||
                        "-",

                    website:
                        profil?.website ||
                        profil?.urlWebsite ||
                        "-",

                    // =================================================
                    // ALAMAT
                    // =================================================
                    alamat:
                        profil?.alamat ||
                        "-",

                    kelurahan:
                        profil?.kelurahan ||
                        profil?.desa ||
                        "-",

                    kecamatan:
                        profil?.kecamatan ||
                        "-",

                    kota:
                        profil?.kota ||
                        profil?.kabupaten ||
                        "-",

                    provinsi:
                        profil?.provinsi ||
                        "-",

                    kodePos:
                        profil?.kodePos ||
                        profil?.kode_pos ||
                        "-",

                    // =================================================
                    // LOGO
                    // =================================================
                    logo:
                        profil?.logoBesarUrl ||
                        profil?.logoKecilUrl ||
                        profil?.logo ||
                        null,

                    logoBesarUrl:
                        profil?.logoBesarUrl ||
                        null,

                    logoKecilUrl:
                        profil?.logoKecilUrl ||
                        null,

                    faviconUrl:
                        profil?.faviconUrl ||
                        null,

                    // =================================================
                    // LANGGANAN
                    // =================================================
                    tanggalMulai:
                        langganan?.tanggalMulai ||
                        profil?.tanggalMulai ||
                        null,

                    tanggalBerakhir:
                        langganan?.tanggalBerakhir ||
                        profil?.tanggalBerakhir ||
                        null,

                    statusLangganan:
                        langganan?.statusLangganan ||
                        null,

                    statusPembayaran:
                        langganan?.statusPembayaran ||
                        null,

                    // =================================================
                    // BERGABUNG
                    // =================================================
                    bergabung:
                        profil?.dibuatPada ||
                        profil?.createdAt ||
                        null,

                    // =================================================
                    // STATISTIK
                    // =================================================
                    totalGuru:
                        Number(
                            statistik?.totalGuru ??
                                profil?.totalGuru ??
                                0
                        ) || 0,

                    totalSiswa:
                        Number(
                            statistik?.totalSiswa ??
                                profil?.totalSiswa ??
                                0
                        ) || 0,

                    totalKelas:
                        Number(
                            statistik?.totalKelas ??
                                profil?.totalKelas ??
                                0
                        ) || 0,

                    totalMapel:
                        Number(
                            statistik?.totalMapel ??
                                profil?.totalMapel ??
                                0
                        ) || 0,

                    totalAdmin:
                        Number(
                            statistik?.totalAdmin ??
                                profil?.totalAdmin ??
                                0
                        ) || 0,
                };

                console.log(
                    "Data sekolah setelah normalisasi:",
                    normalizedSchool
                );

                setSchool(normalizedSchool);
            } catch (err) {
                console.error(
                    "Error mengambil detail sekolah:",
                    err
                );

                if (cancelled) return;

                setSchool(null);

                setError(
                    err?.message ||
                        "Gagal mengambil data sekolah"
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadDetailSekolah();

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

                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        <div className="max-w-4xl mx-auto min-h-[70vh] flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                                    <Loader2
                                        size={28}
                                        className="text-blue-600 animate-spin"
                                    />
                                </div>

                                <h2 className="text-lg sm:text-xl font-semibold text-slate-700">
                                    Memuat data sekolah...
                                </h2>

                                <p className="text-sm text-slate-400 mt-1">
                                    Sedang mengambil data dari server
                                </p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    // =========================================================
    // ERROR / SCHOOL NOT FOUND
    // =========================================================
    if (!school) {
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

                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        <div className="max-w-md w-full mx-auto min-h-[70vh] flex items-center justify-center">
                            <div className="text-center w-full">
                                <div className="p-4 rounded-full bg-slate-100 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                                    {error ? (
                                        <AlertCircle
                                            size={32}
                                            className="text-rose-400"
                                        />
                                    ) : (
                                        <School
                                            size={32}
                                            className="text-slate-400"
                                        />
                                    )}
                                </div>

                                <h2 className="text-xl sm:text-2xl font-semibold text-slate-700">
                                    Sekolah tidak ditemukan
                                </h2>

                                <p className="text-sm text-slate-400 mt-2">
                                    {error ||
                                        "Data sekolah yang Anda cari tidak tersedia"}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-2 justify-center mt-5">
                                    <button
                                        onClick={() =>
                                            router.push(
                                                "/super-admin/sekolah"
                                            )
                                        }
                                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow w-full sm:w-auto"
                                    >
                                        Kembali ke Daftar Sekolah
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    // =========================================================
    // STATUS COLOR
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

    const statusStyle =
        statusColorMap[school.status] ||
        statusColorMap.Aktif;

    // =========================================================
    // RENDER
    // =========================================================
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* =================================================
                SIDEBAR
            ================================================= */}
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
                <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">
                        {/* =================================================
                            TOMBOL KEMBALI
                        ================================================= */}
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 hover:text-slate-700 transition-colors group"
                        >
                            <ArrowLeft
                                size={isMobile ? 14 : 16}
                                className="group-hover:-translate-x-0.5 transition-transform"
                            />

                            Kembali
                        </button>

                        {/* =================================================
                            HEADER DETAIL SEKOLAH
                        ================================================= */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 md:p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                    {/* LOGO */}
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
                                        {school.logo ? (
                                            <img
                                                src={school.logo}
                                                alt={`Logo ${school.nama}`}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display =
                                                        "none";
                                                }}
                                            />
                                        ) : (
                                            <School
                                                size={
                                                    isMobile
                                                        ? 24
                                                        : 30
                                                }
                                                className="text-slate-400"
                                            />
                                        )}
                                    </div>

                                    {/* NAMA + NPSN */}
                                    <div className="min-w-0">
                                        <h1 className="text-base sm:text-xl md:text-2xl font-semibold text-slate-800 truncate">
                                            {school.nama}
                                        </h1>

                                        <p className="text-xs sm:text-sm text-slate-500 font-mono mt-0.5">
                                            NPSN:{" "}
                                            {school.npsn ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>

                                {/* STATUS + PAKET */}
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 sm:ml-auto">
                                    <span
                                        className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                    >
                                        <span
                                            className={`inline-block w-1.5 h-1.5 rounded-full ${statusStyle.dot} mr-1 sm:mr-1.5`}
                                        />

                                        {school.status}
                                    </span>

                                    {school.paket !== "-" && (
                                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-50 text-blue-600 border border-blue-200">
                                            {school.paket}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* BERGABUNG */}
                            {school.bergabung && (
                                <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-3 flex items-center gap-1 sm:gap-1.5">
                                    <Sparkles
                                        size={
                                            isMobile
                                                ? 12
                                                : 14
                                        }
                                        className="text-slate-400 flex-shrink-0"
                                    />

                                    <span className="truncate">
                                        Bergabung sejak{" "}
                                        {formatDate(
                                            school.bergabung
                                        )}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* =================================================
                            INFO SINGKAT
                        ================================================= */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                            <InfoCard
                                label="Jenjang"
                                value={school.jenjang}
                                icon={School}
                                color="blue"
                                isMobile={isMobile}
                            />

                            <InfoCard
                                label="Status Sekolah"
                                value={
                                    school.statusSekolah
                                }
                                icon={Building2}
                                color="purple"
                                isMobile={isMobile}
                            />

                            <InfoCard
                                label="Paket"
                                value={school.paket}
                                icon={Briefcase}
                                color="amber"
                                isMobile={isMobile}
                            />

                            <InfoCard
                                label="Yayasan"
                                value={school.yayasan}
                                icon={Building2}
                                color="violet"
                                isMobile={isMobile}
                            />
                        </div>

                        {/* =================================================
                            KONTAK
                        ================================================= */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 md:p-5 shadow-sm">
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 md:mb-4 flex items-center gap-2 sm:gap-2.5">
                                <span className="p-1 sm:p-1.5 rounded-lg bg-blue-50 text-blue-600">
                                    <MailIcon
                                        size={
                                            isMobile
                                                ? 14
                                                : 16
                                        }
                                    />
                                </span>

                                Kontak
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                                <ContactItem
                                    icon={MailIcon}
                                    value={school.email}
                                    isMobile={
                                        isMobile
                                    }
                                />

                                <ContactItem
                                    icon={Phone}
                                    value={
                                        school.telepon
                                    }
                                    isMobile={
                                        isMobile
                                    }
                                />

                                <ContactItem
                                    icon={GlobeIcon}
                                    value={
                                        school.website
                                    }
                                    isMobile={
                                        isMobile
                                    }
                                />
                            </div>
                        </div>

                        {/* =================================================
                            ALAMAT
                        ================================================= */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 md:p-5 shadow-sm">
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 flex items-center gap-2 sm:gap-2.5">
                                <span className="p-1 sm:p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                                    <MapPin
                                        size={
                                            isMobile
                                                ? 14
                                                : 16
                                        }
                                    />
                                </span>

                                Alamat
                            </h3>

                            <p className="text-xs sm:text-sm text-slate-600">
                                {school.alamat ||
                                    "-"}
                            </p>

                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                {school.kelurahan &&
                                school.kelurahan !==
                                    "-"
                                    ? `${school.kelurahan}, `
                                    : ""}
                                {school.kecamatan &&
                                school.kecamatan !==
                                    "-"
                                    ? `${school.kecamatan}, `
                                    : ""}
                                {school.kota &&
                                school.kota !==
                                    "-"
                                    ? `${school.kota}, `
                                    : ""}
                                {school.provinsi &&
                                school.provinsi !==
                                    "-"
                                    ? school.provinsi
                                    : ""}
                                {school.kodePos &&
                                school.kodePos !==
                                    "-"
                                    ? ` - ${school.kodePos}`
                                    : ""}
                            </p>
                        </div>

                        {/* =================================================
                            MASA LANGGANAN
                        ================================================= */}
                        <div className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 md:p-5 shadow-sm">
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 md:mb-4 flex items-center gap-2 sm:gap-2.5">
                                <span className="p-1 sm:p-1.5 rounded-lg bg-amber-50 text-amber-600">
                                    <Calendar
                                        size={
                                            isMobile
                                                ? 14
                                                : 16
                                        }
                                    />
                                </span>

                                Masa Langganan
                            </h3>

                            {school.tanggalMulai ||
                            school.tanggalBerakhir ? (
                                <div className="flex flex-col xs:flex-row flex-wrap items-start xs:items-center gap-1.5 xs:gap-2 sm:gap-4 text-xs sm:text-sm">
                                    {/* MULAI */}
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <Clock
                                            size={
                                                isMobile
                                                    ? 12
                                                    : 14
                                            }
                                            className="text-slate-400 flex-shrink-0"
                                        />

                                        <span className="text-slate-600">
                                            Mulai:
                                        </span>

                                        <span className="font-medium text-slate-700">
                                            {formatDate(
                                                school.tanggalMulai
                                            )}
                                        </span>
                                    </div>

                                    <span className="text-slate-300 hidden xs:inline">
                                        →
                                    </span>

                                    <span className="text-slate-300 xs:hidden">
                                        -
                                    </span>

                                    {/* BERAKHIR */}
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <Clock
                                            size={
                                                isMobile
                                                    ? 12
                                                    : 14
                                            }
                                            className="text-slate-400 flex-shrink-0"
                                        />

                                        <span className="text-slate-600">
                                            Berakhir:
                                        </span>

                                        <span className="font-medium text-slate-700">
                                            {formatDate(
                                                school.tanggalBerakhir
                                            )}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs sm:text-sm text-slate-400">
                                    Belum ada data masa langganan.
                                </p>
                            )}
                        </div>

                        {/* =================================================
                            STATISTIK SEKOLAH
                        ================================================= */}
                        <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 flex items-center gap-2 sm:gap-2.5">
                                <span className="p-1 sm:p-1.5 rounded-lg bg-violet-50 text-violet-600">
                                    <BarChart3
                                        size={
                                            isMobile
                                                ? 14
                                                : 16
                                        }
                                    />
                                </span>

                                Statistik Sekolah
                            </h3>

                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                                <StatCard
                                    label="Guru"
                                    value={
                                        school.totalGuru
                                    }
                                    icon={Users}
                                    color="blue"
                                    isMobile={
                                        isMobile
                                    }
                                />

                                <StatCard
                                    label="Siswa"
                                    value={
                                        school.totalSiswa
                                    }
                                    icon={
                                        GraduationCap
                                    }
                                    color="emerald"
                                    isMobile={
                                        isMobile
                                    }
                                />

                                <StatCard
                                    label="Kelas"
                                    value={
                                        school.totalKelas
                                    }
                                    icon={
                                        LayoutGrid
                                    }
                                    color="purple"
                                    isMobile={
                                        isMobile
                                    }
                                />

                                <StatCard
                                    label="Mapel"
                                    value={
                                        school.totalMapel
                                    }
                                    icon={BookOpen}
                                    color="amber"
                                    isMobile={
                                        isMobile
                                    }
                                />

                                <StatCard
                                    label="Admin"
                                    value={
                                        school.totalAdmin
                                    }
                                    icon={UserCog}
                                    color="rose"
                                    isMobile={
                                        isMobile
                                    }
                                />
                            </div>
                        </div>

                        {/* =================================================
                            TOMBOL AKSI
                        ================================================= */}
                        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200/80">
                            <button
                                onClick={() =>
                                    router.back()
                                }
                                className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Tutup
                            </button>

                            <button
                                onClick={() =>
                                    router.push(
                                        `/super-admin/sekolah/edit/${school.id}`
                                    )
                                }
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
                            >
                                <Edit size={16} />

                                Edit Sekolah
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

// =============================================================
// HELPER: NORMALIZE STATUS
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
        value === "active" ||
        value === "berlangganan"
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

    // Kalau backend mengirim status lain,
    // tetap tampilkan dengan format yang rapi.
    return (
        String(status).charAt(0).toUpperCase() +
        String(status).slice(1)
    );
}

// =============================================================
// HELPER: FORMAT DATE
// =============================================================
function formatDate(date) {
    if (!date) {
        return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
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
// KOMPONEN INFO CARD
// =============================================================
function InfoCard({
    label,
    value,
    icon: Icon,
    color,
    isMobile,
}) {
    const colorMap = {
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        amber: "bg-amber-50 text-amber-600",
        violet: "bg-violet-50 text-violet-600",
        emerald: "bg-emerald-50 text-emerald-600",
        rose: "bg-rose-50 text-rose-600",
    };

    const iconBg =
        colorMap[color] ||
        colorMap.blue;

    const iconSize = isMobile ? 12 : 14;

    const labelSize = isMobile
        ? "text-[8px]"
        : "text-[10px]";

    const valueSize = isMobile
        ? "text-xs"
        : "text-sm";

    return (
        <div className="bg-white rounded-lg border border-slate-200/80 p-2 sm:p-3 md:p-3.5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3">
                <div
                    className={`p-1 sm:p-1.5 rounded-lg ${iconBg} flex-shrink-0`}
                >
                    <Icon size={iconSize} />
                </div>

                <div className="min-w-0">
                    <p
                        className={`${labelSize} font-medium text-slate-400 uppercase tracking-wider`}
                    >
                        {label}
                    </p>

                    <p
                        className={`${valueSize} font-medium text-slate-700 truncate`}
                    >
                        {value || "-"}
                    </p>
                </div>
            </div>
        </div>
    );
}

// =============================================================
// KOMPONEN KONTAK ITEM
// =============================================================
function ContactItem({
    icon: Icon,
    value,
    isMobile,
}) {
    const iconSize = isMobile ? 12 : 14;

    const textSize = isMobile
        ? "text-xs"
        : "text-sm";

    return (
        <div className="flex items-center gap-2 sm:gap-2.5 text-slate-600 bg-slate-50 px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg border border-slate-200/60 truncate hover:bg-white hover:border-slate-300 transition-colors">
            <Icon
                size={iconSize}
                className="text-slate-400 flex-shrink-0"
            />

            <span
                className={`${textSize} truncate`}
            >
                {value || "-"}
            </span>
        </div>
    );
}

// =============================================================
// KOMPONEN STAT CARD
// =============================================================
function StatCard({
    label,
    value,
    icon: Icon,
    color,
    isMobile,
}) {
    const colorMap = {
        blue: "bg-blue-50 text-blue-600",
        emerald:
            "bg-emerald-50 text-emerald-600",
        purple:
            "bg-purple-50 text-purple-600",
        amber:
            "bg-amber-50 text-amber-600",
        rose:
            "bg-rose-50 text-rose-600",
    };

    const iconBg =
        colorMap[color] ||
        colorMap.blue;

    const iconSize = isMobile ? 14 : 16;

    const valueSize = isMobile
        ? "text-base"
        : "text-lg";

    const labelSize = isMobile
        ? "text-[8px]"
        : "text-[10px]";

    return (
        <div className="bg-white rounded-lg border border-slate-200/80 p-2 sm:p-3 md:p-3.5 text-center shadow-sm hover:shadow-md transition-shadow">
            <div
                className={`p-1.5 sm:p-2 rounded-lg ${iconBg} inline-flex mx-auto mb-1 sm:mb-1.5`}
            >
                <Icon size={iconSize} />
            </div>

            <p
                className={`${valueSize} font-bold text-slate-700`}
            >
                {Number(value) || 0}
            </p>

            <p
                className={`${labelSize} font-medium text-slate-400 uppercase tracking-wider`}
            >
                {label}
            </p>
        </div>
    );
}