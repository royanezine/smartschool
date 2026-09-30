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
import { useEffect, useState } from "react";

// =============================================================
// THEME HELPERS
// =============================================================
const themeCardShadow =
    "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
    "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeFocus =
    "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

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
// DETAIL YAYASAN
// =============================================================
export default function DetailYayasanPage() {
    const params = useParams();
    const router = useRouter();

    // =========================================================
    // ID DARI URL
    // =========================================================
    const id = Array.isArray(params?.id)
        ? params.id[0]
        : params?.id;

    // =========================================================
    // STATE
    // =========================================================
    const [yayasan, setYayasan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
            <div className="theme-page theme-text min-h-full">
                <div className="w-full min-h-[70vh] flex items-center justify-center px-4">
                    <div className="text-center">
                        <div
                            className={`w-14 h-14 rounded-full ${themeInfoSurface} flex items-center justify-center mx-auto mb-4`}
                        >
                            <Loader2
                                size={28}
                                className="text-[var(--color-info)] animate-spin"
                            />
                        </div>

                        <h2 className="text-lg font-semibold theme-text">
                            Memuat data yayasan...
                        </h2>

                        <p className="text-sm theme-text-muted mt-1">
                            Sedang mengambil data dari server.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // ERROR / DATA TIDAK ADA
    // =========================================================
    if (!yayasan) {
        return (
            <div className="theme-page theme-text min-h-full">
                <div className="w-full min-h-[70vh] flex items-center justify-center px-4">
                    <div
                        className={`theme-card rounded-2xl p-8 ${themeCardShadow} border theme-border max-w-md w-full text-center`}
                    >
                        <div
                            className={`w-16 h-16 rounded-full ${themeDangerSurface} flex items-center justify-center mx-auto mb-4`}
                        >
                            <AlertCircle
                                size={48}
                                className="theme-danger"
                            />
                        </div>

                        <h2 className="text-2xl font-semibold theme-text">
                            Yayasan tidak ditemukan
                        </h2>

                        <p className="theme-text-secondary text-sm mt-2">
                            {error ||
                                "Data yang Anda cari mungkin telah dihapus."}
                        </p>

                        <button
                            onClick={() =>
                                router.push(
                                    "/super-admin/yayasan"
                                )
                            }
                            className={`mt-5 px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${themePrimarySoft} ${themePrimarySoftBorder} border text-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] ${themeSmallShadow}`}
                        >
                            Kembali ke Daftar Yayasan
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // STATUS
    // =========================================================
    const statusThemeMap = {
        Aktif: {
            bg: themeSuccessSurface,
            text: "text-[var(--color-success)]",
            border: themeSuccessBorder,
            dot: "bg-[var(--color-success)]",
            icon: CheckCircle,
        },

        Trial: {
            bg: themeWarningSurface,
            text: "text-[var(--color-warning)]",
            border: themeWarningBorder,
            dot: "bg-[var(--color-warning)]",
            icon: Clock,
        },

        Nonaktif: {
            bg: themeDangerSurface,
            text: "theme-danger",
            border: themeDangerBorder,
            dot: "bg-[var(--color-text-muted)]",
            icon: XCircle,
        },
    };

    const statusStyle =
        statusThemeMap[yayasan.status] ||
        statusThemeMap.Nonaktif;

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
        <div className="theme-page theme-text min-h-full">
            <div className="w-full max-w-[1100px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                {/* =================================================
                    KEMBALI
                ================================================= */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm theme-text-secondary hover:text-[var(--color-primary)] transition-colors mb-5 group"
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
                <div
                    className={`theme-card rounded-xl border theme-border p-5 sm:p-6 ${themeCardShadow} mb-6`}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            {/* LOGO */}
                            <div
                                className={`w-16 h-16 rounded-xl ${themeNeutralSurface} border ${themeNeutralBorder} flex items-center justify-center ${themeSmallShadow} flex-shrink-0 overflow-hidden`}
                            >
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
                                        className="theme-text-muted"
                                    />
                                )}
                            </div>

                            {/* NAMA */}
                            <div className="min-w-0">
                                <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">
                                    {yayasan.nama}
                                </h1>

                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="text-sm theme-text-secondary font-mono">
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

                                        {yayasan.status}
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
                                className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all bg-[var(--color-primary)] text-[var(--color-card)] hover:opacity-90 shadow-[0_6px_16px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]"
                            >
                                <Edit size={15} />

                                <span>
                                    Edit
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* INFO */}
                    <div
                        className={`flex flex-wrap items-center gap-3 mt-3 pt-3 border-t ${themeDivider} text-sm theme-text-secondary`}
                    >
                        {yayasan.bergabung && (
                            <span className="flex items-center gap-1.5">
                                <Calendar
                                    size={14}
                                    className="theme-text-muted"
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
                                className="theme-text-muted"
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
                    <InfoBox
                        icon={User}
                        color="primary"
                        label="Ketua Yayasan"
                        value={yayasan.ketua}
                    />

                    <InfoBox
                        icon={School}
                        color="success"
                        label="Jumlah Sekolah"
                        value={`${yayasan.jumlahSekolah} Sekolah`}
                    />

                    <InfoBox
                        icon={Users}
                        color="info"
                        label="Total Pengguna"
                        value={totalPengguna}
                    />
                </div>

                {/* =================================================
                    DETAIL 2 KOLOM
                ================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* KONTAK */}
                    <div
                        className={`theme-card rounded-xl border theme-border p-5 ${themeCardShadow}`}
                    >
                        <h3 className="text-sm font-semibold theme-text mb-4 flex items-center gap-2">
                            <MailIcon
                                size={16}
                                className="theme-text-muted"
                            />

                            Kontak
                        </h3>

                        <div className="space-y-3">
                            <ContactRow
                                icon={MailIcon}
                                value={yayasan.email}
                            />

                            <ContactRow
                                icon={Phone}
                                value={yayasan.telepon}
                            />

                            <ContactRow
                                icon={GlobeIcon}
                                value={yayasan.website}
                            />
                        </div>
                    </div>

                    {/* ALAMAT */}
                    <div
                        className={`theme-card rounded-xl border theme-border p-5 ${themeCardShadow}`}
                    >
                        <h3 className="text-sm font-semibold theme-text mb-4 flex items-center gap-2">
                            <MapPin
                                size={16}
                                className="theme-text-muted"
                            />

                            Alamat
                        </h3>

                        <div className="space-y-2 text-sm">
                            <p
                                className={`theme-text-secondary ${themeNeutralSurface} px-3 py-2 rounded-lg border ${themeNeutralBorder}`}
                            >
                                {yayasan.alamat ||
                                    "-"}
                            </p>

                            <p
                                className={`theme-text-secondary ${themeNeutralSurface} px-3 py-2 rounded-lg border ${themeNeutralBorder}`}
                            >
                                {buildAddress(
                                    yayasan
                                )}

                                <span className="block text-xs theme-text-muted mt-0.5">
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
                        value={yayasan.totalGuru}
                        label="Guru"
                        color="primary"
                    />

                    <StatCard
                        icon={UserCheck}
                        value={yayasan.totalSiswa}
                        label="Siswa"
                        color="success"
                    />

                    <StatCard
                        icon={User}
                        value={yayasan.totalAdmin}
                        label="Admin"
                        color="info"
                    />
                </div>

                {/* =================================================
                    SEKOLAH DI BAWAH NAUNGAN
                ================================================= */}
                <div
                    className={`theme-card rounded-xl border theme-border p-5 ${themeCardShadow} mb-6`}
                >
                    <h3 className="text-sm font-semibold theme-text mb-4 flex items-center gap-2">
                        <School
                            size={16}
                            className="theme-text-muted"
                        />

                        Sekolah Di Bawah Naungan
                    </h3>

                    {yayasan.sekolah.length > 0 ? (
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
                                            className={`flex items-center gap-2 text-sm theme-text-secondary ${themeNeutralSurface} px-3 py-2 rounded-lg border ${themeNeutralBorder}`}
                                        >
                                            <Building2
                                                size={14}
                                                className="theme-text-muted flex-shrink-0"
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
                                className="mx-auto theme-text-muted mb-2"
                            />

                            <p className="text-sm theme-text-muted">
                                Belum ada sekolah di bawah yayasan ini.
                            </p>
                        </div>
                    )}
                </div>

                {/* =================================================
                    TOMBOL AKSI
                ================================================= */}
                <div
                    className={`flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t ${themeDivider}`}
                >
                    <button
                        onClick={() => router.back()}
                        className={`w-full sm:w-auto px-5 py-2.5 text-sm font-medium theme-text-secondary ${themeNeutralHover} rounded-lg transition-colors`}
                    >
                        Tutup
                    </button>

                    <button
                        onClick={() =>
                            router.push(
                                `/super-admin/yayasan/edit/${yayasan.id}`
                            )
                        }
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all bg-[var(--color-primary)] text-[var(--color-card)] hover:opacity-90 shadow-[0_6px_16px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]"
                    >
                        <Edit size={16} />

                        Edit Yayasan
                    </button>
                </div>
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

    if (
        response.data !== undefined &&
        response.data !== null
    ) {
        if (
            response.data?.profil ||
            response.data?.yayasan ||
            response.data?.statistik ||
            response.data?.statistics
        ) {
            return response.data;
        }

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
        primary: {
            bg: themePrimarySoft,
            text: "text-[var(--color-primary)]",
            border: themePrimarySoftBorder,
        },

        success: {
            bg: themeSuccessSurface,
            text: "text-[var(--color-success)]",
            border: themeSuccessBorder,
        },

        info: {
            bg: themeInfoSurface,
            text: "text-[var(--color-info)]",
            border: themeInfoBorder,
        },
    };

    const selected =
        colorMap[color] ||
        colorMap.primary;

    return (
        <div
            className={`theme-card rounded-xl border theme-border p-4 ${themeCardShadow}`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`p-2 rounded-lg ${selected.bg} ${selected.text} border ${selected.border}`}
                >
                    <Icon size={16} />
                </div>

                <div className="min-w-0">
                    <p className="text-xs theme-text-muted font-medium">
                        {label}
                    </p>

                    <p className="text-sm font-semibold theme-text truncate">
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
        <div
            className={`flex items-center gap-3 text-sm ${themeNeutralSurface} px-3 py-2 rounded-lg border ${themeNeutralBorder}`}
        >
            <Icon
                size={15}
                className="theme-text-muted flex-shrink-0"
            />

            <span className="theme-text-secondary truncate">
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
        primary: {
            bg: themePrimarySoft,
            text: "text-[var(--color-primary)]",
            border: themePrimarySoftBorder,
        },

        success: {
            bg: themeSuccessSurface,
            text: "text-[var(--color-success)]",
            border: themeSuccessBorder,
        },

        info: {
            bg: themeInfoSurface,
            text: "text-[var(--color-info)]",
            border: themeInfoBorder,
        },
    };

    const selected =
        colorMap[color] ||
        colorMap.primary;

    return (
        <div
            className={`theme-card rounded-xl border theme-border p-4 text-center ${themeCardShadow}`}
        >
            <div
                className={`p-2 rounded-lg ${selected.bg} ${selected.text} border ${selected.border} w-fit mx-auto mb-1.5`}
            >
                <Icon size={18} />
            </div>

            <p className="text-xl font-bold theme-text">
                {Number(value) || 0}
            </p>

            <p className="text-xs theme-text-muted font-medium">
                {label}
            </p>
        </div>
    );
}