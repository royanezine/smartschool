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
import { useState, useEffect } from "react";
import { getDetailSekolahBinaan } from "../../../../../services/yayasan.service";

// =============================================================
// THEME HELPERS
// =============================================================

const themeCardShadow =
    "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
    "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryButton =
    "bg-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,var(--color-text))] text-[var(--color-card)]";

const themePrimarySoft =
    "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
    "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themeFocus =
    "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeDivider =
    "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeNeutralSurface =
    "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
    "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
    "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeInfoSurface =
    "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
    "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
    "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
    "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
    "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
    "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
    "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
    "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

// =============================================================
// PAGE
// =============================================================

export default function DetailSekolahPage() {
    const params = useParams();
    const router = useRouter();

    // ID backend berupa UUID, jadi JANGAN parseInt
    const id = Array.isArray(params?.id)
        ? params.id[0]
        : params?.id;

    const [school, setSchool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isMobile, setIsMobile] = useState(false);

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
            window.removeEventListener(
                "resize",
                checkMobile
            );
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

                const response =
                    await getDetailSekolahBinaan(id);

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
                 */

                let result = response;

                if (result?.data !== undefined) {
                    result = result.data;
                }

                /*
                 * Kalau masih berupa:
                 *
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
                    Array.isArray(
                        profil?.langgananSekolah
                    )
                        ? profil.langgananSekolah[0]
                        : profil?.langgananSekolah ||
                          null;

                // =================================================
                // NORMALISASI DATA
                // =================================================

                const normalizedSchool = {
                    id: profil?.id || id,

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

                    jenjang:
                        profil?.jenjang ||
                        profil?.tingkat ||
                        "-",

                    status: normalizeStatus(
                        profil?.status ||
                            langganan?.statusLangganan
                    ),

                    statusSekolah:
                        profil?.status ||
                        "-",

                    yayasan:
                        profil?.yayasan?.nama ||
                        profil?.namaYayasan ||
                        "-",

                    paket:
                        langganan?.paket?.nama ||
                        profil?.paket?.nama ||
                        profil?.namaPaket ||
                        "-",

                    paketId:
                        langganan?.paket?.id ||
                        profil?.paketId ||
                        null,

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

                    bergabung:
                        profil?.dibuatPada ||
                        profil?.createdAt ||
                        null,

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
            <div className="theme-page theme-text min-h-full">
                <div className="w-full max-w-[1280px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                    <div className="max-w-4xl mx-auto min-h-[70vh] flex items-center justify-center">
                        <div className="text-center">
                            <div
                                className={`w-14 h-14 mx-auto mb-4 rounded-full ${themePrimarySoft} flex items-center justify-center`}
                            >
                                <Loader2
                                    size={28}
                                    className="text-[var(--color-primary)] animate-spin"
                                />
                            </div>

                            <h2 className="text-lg sm:text-xl font-semibold theme-text">
                                Memuat data sekolah...
                            </h2>

                            <p className="text-sm theme-text-muted mt-1">
                                Sedang mengambil data dari
                                server
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // ERROR / SCHOOL NOT FOUND
    // =========================================================

    if (!school) {
        return (
            <div className="theme-page theme-text min-h-full">
                <div className="w-full max-w-[1280px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                    <div className="max-w-md w-full mx-auto min-h-[70vh] flex items-center justify-center">
                        <div className="text-center w-full">
                            <div
                                className={`p-4 rounded-full ${themeNeutralSurface} mx-auto w-16 h-16 flex items-center justify-center mb-4`}
                            >
                                {error ? (
                                    <AlertCircle
                                        size={32}
                                        className="text-[var(--color-warning)]"
                                    />
                                ) : (
                                    <School
                                        size={32}
                                        className="theme-text-muted"
                                    />
                                )}
                            </div>

                            <h2 className="text-xl sm:text-2xl font-semibold theme-text">
                                Sekolah tidak ditemukan
                            </h2>

                            <p className="text-sm theme-text-muted mt-2">
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
                                    className={`px-5 py-2.5 rounded-lg transition shadow-sm hover:shadow ${themePrimaryButton}`}
                                >
                                    Kembali ke Daftar
                                    Sekolah
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // STATUS STYLE
    // =========================================================

    const statusStyleMap = {
        Aktif: {
            bg: themeSuccessSurface,
            text: "text-[var(--color-success)]",
            border: themeSuccessBorder,
            dot: "bg-[var(--color-success)]",
        },

        Trial: {
            bg: themeWarningSurface,
            text: "text-[var(--color-warning)]",
            border: themeWarningBorder,
            dot: "bg-[var(--color-warning)]",
        },

        Nonaktif: {
            bg: themeDangerSurface,
            text: "theme-text-secondary",
            border: themeDangerBorder,
            dot: "bg-[var(--color-text-muted)]",
        },
    };

    const statusStyle =
        statusStyleMap[school.status] ||
        statusStyleMap.Nonaktif;

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="theme-page theme-text min-h-full">
            <div className="w-full max-w-[1280px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">
                    {/* =================================================
                        TOMBOL KEMBALI
                    ================================================= */}

                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm theme-text-muted hover:text-[var(--color-primary)] transition-colors group"
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

                    <div
                        className={`theme-card rounded-xl ${themeNeutralBorder} p-3 sm:p-4 md:p-6 ${themeCardShadow}`}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                {/* LOGO */}

                                <div
                                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg ${themeNeutralSurface} flex items-center justify-center overflow-hidden ${themeSmallShadow} flex-shrink-0`}
                                >
                                    {school.logo ? (
                                        <img
                                            src={school.logo}
                                            alt={`Logo ${school.nama}`}
                                            className="w-full h-full object-contain"
                                            onError={(
                                                e
                                            ) => {
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
                                            className="theme-text-muted"
                                        />
                                    )}
                                </div>

                                {/* NAMA + NPSN */}

                                <div className="min-w-0">
                                    <h1 className="text-base sm:text-xl md:text-2xl font-semibold theme-text truncate">
                                        {school.nama}
                                    </h1>

                                    <p className="text-xs sm:text-sm theme-text-muted font-mono mt-0.5">
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
                                    <span
                                        className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${themePrimarySoft} text-[var(--color-primary)] ${themePrimarySoftBorder}`}
                                    >
                                        {school.paket}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* BERGABUNG */}

                        {school.bergabung && (
                            <p className="text-xs sm:text-sm theme-text-muted mt-2 sm:mt-3 flex items-center gap-1 sm:gap-1.5">
                                <Sparkles
                                    size={
                                        isMobile
                                            ? 12
                                            : 14
                                    }
                                    className="theme-text-muted flex-shrink-0"
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
                            color="primary"
                            isMobile={isMobile}
                        />

                        <InfoCard
                            label="Status Sekolah"
                            value={
                                school.statusSekolah
                            }
                            icon={Building2}
                            color="info"
                            isMobile={isMobile}
                        />

                        <InfoCard
                            label="Paket"
                            value={school.paket}
                            icon={Briefcase}
                            color="warning"
                            isMobile={isMobile}
                        />

                        <InfoCard
                            label="Yayasan"
                            value={school.yayasan}
                            icon={Building2}
                            color="primary"
                            isMobile={isMobile}
                        />
                    </div>

                    {/* =================================================
                        KONTAK
                    ================================================= */}

                    <div
                        className={`theme-card rounded-xl ${themeNeutralBorder} p-3 sm:p-4 md:p-5 ${themeCardShadow}`}
                    >
                        <h3 className="text-xs sm:text-sm font-semibold theme-text-secondary mb-2 sm:mb-3 md:mb-4 flex items-center gap-2 sm:gap-2.5">
                            <span
                                className={`p-1 sm:p-1.5 rounded-lg ${themeInfoSurface} text-[var(--color-info)]`}
                            >
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

                    <div
                        className={`theme-card rounded-xl ${themeNeutralBorder} p-3 sm:p-4 md:p-5 ${themeCardShadow}`}
                    >
                        <h3 className="text-xs sm:text-sm font-semibold theme-text-secondary mb-2 sm:mb-3 md:mb-4 flex items-center gap-2 sm:gap-2.5">
                            <span
                                className={`p-1 sm:p-1.5 rounded-lg ${themeSuccessSurface} text-[var(--color-success)]`}
                            >
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

                        <p className="text-xs sm:text-sm theme-text-secondary">
                            {school.alamat ||
                                "-"}
                        </p>

                        <p className="text-xs sm:text-sm theme-text-muted mt-1">
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
                            school.kota !== "-"
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

                    <div
                        className={`theme-card rounded-xl ${themeNeutralBorder} p-3 sm:p-4 md:p-5 ${themeCardShadow}`}
                    >
                        <h3 className="text-xs sm:text-sm font-semibold theme-text-secondary mb-2 sm:mb-3 md:mb-4 flex items-center gap-2 sm:gap-2.5">
                            <span
                                className={`p-1 sm:p-1.5 rounded-lg ${themeWarningSurface} text-[var(--color-warning)]`}
                            >
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
                                        className="theme-text-muted flex-shrink-0"
                                    />

                                    <span className="theme-text-secondary">
                                        Mulai:
                                    </span>

                                    <span className="font-medium theme-text">
                                        {formatDate(
                                            school.tanggalMulai
                                        )}
                                    </span>
                                </div>

                                <span className="theme-text-muted hidden xs:inline">
                                    →
                                </span>

                                <span className="theme-text-muted xs:hidden">
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
                                        className="theme-text-muted flex-shrink-0"
                                    />

                                    <span className="theme-text-secondary">
                                        Berakhir:
                                    </span>

                                    <span className="font-medium theme-text">
                                        {formatDate(
                                            school.tanggalBerakhir
                                        )}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs sm:text-sm theme-text-muted">
                                Belum ada data masa
                                langganan.
                            </p>
                        )}
                    </div>

                    {/* =================================================
                        STATISTIK SEKOLAH
                    ================================================= */}

                    <div>
                        <h3 className="text-xs sm:text-sm font-semibold theme-text-secondary mb-2 sm:mb-3 flex items-center gap-2 sm:gap-2.5">
                            <span
                                className={`p-1 sm:p-1.5 rounded-lg ${themePrimarySoft} text-[var(--color-primary)]`}
                            >
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
                                color="primary"
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
                                color="success"
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
                                color="info"
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
                                color="warning"
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
                                color="danger"
                                isMobile={
                                    isMobile
                                }
                            />
                        </div>
                    </div>

                    {/* =================================================
                        TOMBOL AKSI
                    ================================================= */}

                    <div
                        className={`flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t ${themeDivider}`}
                    >
                        <button
                            onClick={() =>
                                router.back()
                            }
                            className={`w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium theme-text-secondary ${themeNeutralHover} rounded-lg transition-colors`}
                        >
                            Tutup
                        </button>

                        <button
                            onClick={() =>
                                router.push(
                                    `/super-admin/sekolah/edit/${school.id}`
                                )
                            }
                            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow ${themePrimaryButton}`}
                        >
                            <Edit size={16} />

                            Edit Sekolah
                        </button>
                    </div>
                </div>
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
        primary: {
            bg: "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]",
            text: "text-[var(--color-primary)]",
        },

        info: {
            bg: "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]",
            text: "text-[var(--color-info)]",
        },

        success: {
            bg: "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]",
            text: "text-[var(--color-success)]",
        },

        warning: {
            bg: "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]",
            text: "text-[var(--color-warning)]",
        },

        danger: {
            bg: "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]",
            text: "theme-text-secondary",
        },
    };

    const iconStyle =
        colorMap[color] ||
        colorMap.primary;

    const iconSize = isMobile ? 12 : 14;

    const labelSize = isMobile
        ? "text-[8px]"
        : "text-[10px]";

    const valueSize = isMobile
        ? "text-xs"
        : "text-sm";

    return (
        <div
            className={`theme-card rounded-lg ${themeNeutralBorder} p-2 sm:p-3 md:p-3.5 ${themeSmallShadow} hover:shadow-[0_6px_20px_color-mix(in_srgb,var(--color-text)_8%,transparent)] transition-shadow`}
        >
            <div className="flex items-center gap-2 sm:gap-3">
                <div
                    className={`p-1 sm:p-1.5 rounded-lg ${iconStyle.bg} ${iconStyle.text} flex-shrink-0`}
                >
                    <Icon size={iconSize} />
                </div>

                <div className="min-w-0">
                    <p
                        className={`${labelSize} font-medium theme-text-muted uppercase tracking-wider`}
                    >
                        {label}
                    </p>

                    <p
                        className={`${valueSize} font-medium theme-text-secondary truncate`}
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
        <div
            className={`flex items-center gap-2 sm:gap-2.5 theme-text-secondary ${themeNeutralSurface} px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg ${themeNeutralBorder} truncate hover:bg-[var(--color-card)] hover:border-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] transition-colors`}
        >
            <Icon
                size={iconSize}
                className="theme-text-muted flex-shrink-0"
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
        primary: {
            bg: "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]",
            text: "text-[var(--color-primary)]",
        },

        success: {
            bg: "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]",
            text: "text-[var(--color-success)]",
        },

        info: {
            bg: "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]",
            text: "text-[var(--color-info)]",
        },

        warning: {
            bg: "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]",
            text: "text-[var(--color-warning)]",
        },

        danger: {
            bg: "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]",
            text: "theme-text-secondary",
        },
    };

    const iconStyle =
        colorMap[color] ||
        colorMap.primary;

    const iconSize = isMobile ? 14 : 16;

    const valueSize = isMobile
        ? "text-base"
        : "text-lg";

    const labelSize = isMobile
        ? "text-[8px]"
        : "text-[10px]";

    return (
        <div
            className={`theme-card rounded-lg ${themeNeutralBorder} p-2 sm:p-3 md:p-3.5 text-center ${themeSmallShadow} hover:shadow-[0_6px_20px_color-mix(in_srgb,var(--color-text)_8%,transparent)] transition-shadow`}
        >
            <div
                className={`p-1.5 sm:p-2 rounded-lg ${iconStyle.bg} ${iconStyle.text} inline-flex mx-auto mb-1 sm:mb-1.5`}
            >
                <Icon size={iconSize} />
            </div>

            <p
                className={`${valueSize} font-bold theme-text-secondary`}
            >
                {Number(value) || 0}
            </p>

            <p
                className={`${labelSize} font-medium theme-text-muted uppercase tracking-wider`}
            >
                {label}
            </p>
        </div>
    );
}