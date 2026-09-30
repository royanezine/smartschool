"use client";

import { useRouter, useParams } from "next/navigation";
import {
    School,
    MapPin,
    X,
    Mail,
    Phone,
    Globe,
    Upload,
    Building,
    Hash,
    FileText,
    Save,
    Calendar,
} from "lucide-react";
import { sekolahData } from "../../../../../../lib/data";

const themeCardShadow =
    "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
    "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeFocus =
    "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimaryButton =
    "bg-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,var(--color-text))] text-[var(--color-card)]";

const themePrimarySoft =
    "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftHover =
    "hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimaryBorder =
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

const themeInput =
    "theme-input theme-text " + themeFocus;

function ThemeIconBox({
    children,
    variant = "primary",
}) {
    const variants = {
        primary: `${themePrimarySoft} text-[var(--color-primary)] ${themePrimaryBorder}`,
        info: `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,
        success: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
        warning: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
        danger: `${themeDangerSurface} text-[var(--color-warning)] ${themeDangerBorder}`,
    };

    return (
        <span
            className={`p-1.5 rounded-lg border ${variants[variant] || variants.primary}`}
        >
            {children}
        </span>
    );
}

export default function EditSekolahPage() {
    const router = useRouter();
    const params = useParams();

    const rawId = Array.isArray(params?.id)
        ? params.id[0]
        : params?.id;

    /*
     * Data lama menggunakan numeric ID.
     * Tetap dipertahankan agar halaman existing tidak berubah.
     */
    const id = Number(rawId);

    const school = sekolahData.find(
        (item) => item.id === id
    );

    // =========================================================
    // SEKOLAH TIDAK DITEMUKAN
    // =========================================================

    if (!school) {
        return (
            <div className="theme-page theme-text min-h-full">
                <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
                    <div className="text-center max-w-md">
                        <div
                            className={`w-16 h-16 mx-auto mb-5 rounded-2xl ${themeNeutralSurface} ${themeNeutralBorder} border flex items-center justify-center ${themeSmallShadow}`}
                        >
                            <School
                                size={30}
                                className="text-[var(--color-text-muted)]"
                            />
                        </div>

                        <h2 className="text-xl sm:text-2xl font-bold theme-text">
                            Sekolah tidak ditemukan
                        </h2>

                        <p className="text-sm theme-text-muted mt-2">
                            Data sekolah yang ingin diedit
                            tidak tersedia.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/super-admin/sekolah"
                                )
                            }
                            className={`mt-5 px-4 py-2.5 rounded-lg text-sm font-medium transition ${themePrimaryButton} ${themeSmallShadow}`}
                        >
                            Kembali ke Daftar Sekolah
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="theme-page theme-text min-h-full">
            <div className="w-full max-w-[1100px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                {/* =====================================================
                    HEADER FORM
                ===================================================== */}

                <div
                    className={`flex items-center justify-between ${themeDivider} border-b pb-4 mb-6`}
                >
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-semibold theme-text flex items-center gap-2.5">
                            <span
                                className={`p-2 rounded-lg ${themePrimarySoft} text-[var(--color-primary)] border ${themePrimaryBorder}`}
                            >
                                <School size={18} />
                            </span>

                            Edit Sekolah
                        </h1>

                        <p className="text-sm theme-text-secondary ml-[52px] mt-0.5">
                            Perbarui data sekolah yang
                            terdaftar di sistem.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/super-admin/sekolah"
                            )
                        }
                        className={`p-2 rounded-lg theme-text-muted ${themeNeutralHover} hover:text-[var(--color-primary)] transition-colors`}
                        aria-label="Tutup"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form className="space-y-7">
                    {/* =================================================
                        INFORMASI SEKOLAH
                    ================================================= */}

                    <section>
                        <h3 className="text-sm font-semibold theme-text-secondary mb-4 flex items-center gap-2.5">
                            <ThemeIconBox variant="primary">
                                <School size={16} />
                            </ThemeIconBox>

                            Informasi Sekolah
                        </h3>

                        <div
                            className={`theme-card rounded-xl border theme-border p-4 sm:p-5 ${themeCardShadow} space-y-4`}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* NAMA SEKOLAH */}
                                <div>
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        Nama Sekolah{" "}
                                        <span className="text-[var(--color-warning)]">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <School
                                            size={15}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                                        />

                                        <input
                                            type="text"
                                            defaultValue={
                                                school.nama
                                            }
                                            className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition ${themeInput}`}
                                            placeholder="Masukkan nama sekolah"
                                        />
                                    </div>
                                </div>

                                {/* NPSN */}
                                <div>
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        NPSN{" "}
                                        <span className="text-[var(--color-warning)]">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <Hash
                                            size={15}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                                        />

                                        <input
                                            type="text"
                                            defaultValue={
                                                school.npsn
                                            }
                                            className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition ${themeInput}`}
                                            placeholder="Masukkan NPSN"
                                        />
                                    </div>
                                </div>

                                {/* JENJANG */}
                                <div>
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        Jenjang{" "}
                                        <span className="text-[var(--color-warning)]">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        className={`w-full px-3 py-2 text-sm rounded-lg border transition cursor-pointer ${themeInput}`}
                                        defaultValue={
                                            school.jenjang
                                        }
                                    >
                                        <option value="SD">
                                            SD
                                        </option>
                                        <option value="SMP">
                                            SMP
                                        </option>
                                        <option value="SMA">
                                            SMA
                                        </option>
                                        <option value="SMK">
                                            SMK
                                        </option>
                                    </select>
                                </div>

                                {/* STATUS SEKOLAH */}
                                <div>
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        Status Sekolah
                                    </label>

                                    <select
                                        className={`w-full px-3 py-2 text-sm rounded-lg border transition cursor-pointer ${themeInput}`}
                                        defaultValue={
                                            school.statusSekolah
                                        }
                                    >
                                        <option value="Negeri">
                                            Negeri
                                        </option>
                                        <option value="Swasta">
                                            Swasta
                                        </option>
                                    </select>
                                </div>

                                {/* EMAIL */}
                                <div>
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        Email
                                    </label>

                                    <div className="relative">
                                        <Mail
                                            size={15}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                                        />

                                        <input
                                            type="email"
                                            defaultValue={
                                                school.email
                                            }
                                            className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition ${themeInput}`}
                                            placeholder="sekolah@email.com"
                                        />
                                    </div>
                                </div>

                                {/* TELEPON */}
                                <div>
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        No Telepon
                                    </label>

                                    <div className="relative">
                                        <Phone
                                            size={15}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                                        />

                                        <input
                                            type="text"
                                            defaultValue={
                                                school.telepon
                                            }
                                            className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition ${themeInput}`}
                                            placeholder="021-12345678"
                                        />
                                    </div>
                                </div>

                                {/* WEBSITE */}
                                <div>
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        Website
                                    </label>

                                    <div className="relative">
                                        <Globe
                                            size={15}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                                        />

                                        <input
                                            type="text"
                                            defaultValue={
                                                school.website
                                            }
                                            className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition ${themeInput}`}
                                            placeholder="https://sekolah.sch.id"
                                        />
                                    </div>
                                </div>

                                {/* LOGO */}
                                <div>
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        Logo
                                    </label>

                                    <div className="relative">
                                        <input
                                            type="file"
                                            className={`w-full px-3 py-2 text-sm rounded-lg border transition cursor-pointer theme-input
                                                file:mr-3
                                                file:py-1.5
                                                file:px-3
                                                file:text-sm
                                                file:font-medium
                                                file:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]
                                                file:text-[var(--color-primary)]
                                                file:border-0
                                                file:rounded-lg
                                                hover:file:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]
                                            `}
                                            accept="image/*"
                                        />

                                        <Upload
                                            size={15}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none"
                                        />
                                    </div>

                                    <p className="text-[10px] theme-text-muted mt-1">
                                        Format: JPG, PNG,
                                        maks 2MB
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* =================================================
                        ALAMAT
                    ================================================= */}

                    <section>
                        <h3 className="text-sm font-semibold theme-text-secondary mb-4 flex items-center gap-2.5">
                            <ThemeIconBox variant="success">
                                <MapPin size={16} />
                            </ThemeIconBox>

                            Alamat
                        </h3>

                        <div
                            className={`theme-card rounded-xl border theme-border p-4 sm:p-5 ${themeCardShadow} space-y-4`}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* PROVINSI */}
                                <div>
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        Provinsi{" "}
                                        <span className="text-[var(--color-warning)]">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        className={`w-full px-3 py-2 text-sm rounded-lg border transition cursor-pointer ${themeInput}`}
                                        defaultValue={
                                            school.provinsi
                                        }
                                    >
                                        <option value="DKI Jakarta">
                                            DKI Jakarta
                                        </option>
                                        <option value="Banten">
                                            Banten
                                        </option>
                                        <option value="Jawa Barat">
                                            Jawa Barat
                                        </option>
                                    </select>
                                </div>

                                {/* KOTA */}
                                <div>
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        Kabupaten/Kota{" "}
                                        <span className="text-[var(--color-warning)]">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        className={`w-full px-3 py-2 text-sm rounded-lg border transition cursor-pointer ${themeInput}`}
                                        defaultValue={
                                            school.kota
                                        }
                                    >
                                        <option value="Jakarta Pusat">
                                            Jakarta Pusat
                                        </option>
                                        <option value="Jakarta Utara">
                                            Jakarta Utara
                                        </option>
                                        <option value="Jakarta Barat">
                                            Jakarta Barat
                                        </option>
                                        <option value="Tangerang Selatan">
                                            Tangerang Selatan
                                        </option>
                                        <option value="Tangerang">
                                            Tangerang
                                        </option>
                                        <option value="Depok">
                                            Depok
                                        </option>
                                    </select>
                                </div>

                                {/* KECAMATAN */}
                                <div>
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        Kecamatan
                                    </label>

                                    <input
                                        type="text"
                                        defaultValue={
                                            school.kecamatan
                                        }
                                        className={`w-full px-3 py-2 text-sm rounded-lg border transition ${themeInput}`}
                                        placeholder="Masukkan kecamatan"
                                    />
                                </div>

                                {/* KELURAHAN */}
                                <div>
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        Kelurahan
                                    </label>

                                    <input
                                        type="text"
                                        defaultValue={
                                            school.kelurahan
                                        }
                                        className={`w-full px-3 py-2 text-sm rounded-lg border transition ${themeInput}`}
                                        placeholder="Masukkan kelurahan"
                                    />
                                </div>

                                {/* KODE POS */}
                                <div>
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        Kode Pos
                                    </label>

                                    <input
                                        type="text"
                                        defaultValue={
                                            school.kodePos
                                        }
                                        className={`w-full px-3 py-2 text-sm rounded-lg border transition ${themeInput}`}
                                        placeholder="Masukkan kode pos"
                                    />
                                </div>

                                {/* ALAMAT LENGKAP */}
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        Alamat Lengkap{" "}
                                        <span className="text-[var(--color-warning)]">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <textarea
                                            rows={2}
                                            defaultValue={
                                                school.alamat
                                            }
                                            className={`w-full px-3 py-2 text-sm rounded-lg border transition resize-none ${themeInput}`}
                                            placeholder="Masukkan alamat lengkap (jalan, nomor, RT/RW, dll.)"
                                        />

                                        <FileText
                                            size={15}
                                            className="absolute right-3 top-3 theme-text-muted pointer-events-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* =================================================
                        YAYASAN & PAKET
                    ================================================= */}

                    <section>
                        <h3 className="text-sm font-semibold theme-text-secondary mb-4 flex items-center gap-2.5">
                            <ThemeIconBox variant="info">
                                <Building size={16} />
                            </ThemeIconBox>

                            Yayasan & Paket Langganan
                        </h3>

                        <div
                            className={`theme-card rounded-xl border theme-border p-4 sm:p-5 ${themeCardShadow} space-y-4`}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* YAYASAN */}
                                <div>
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        Yayasan
                                    </label>

                                    <select
                                        className={`w-full px-3 py-2 text-sm rounded-lg border transition cursor-pointer ${themeInput}`}
                                        defaultValue={
                                            school.yayasan
                                        }
                                    >
                                        <option value="-">
                                            - Tanpa Yayasan -
                                        </option>

                                        <option value="Yayasan Al-Azhar">
                                            Yayasan Al-Azhar
                                        </option>

                                        <option value="Yayasan BPK Penabur">
                                            Yayasan BPK Penabur
                                        </option>

                                        <option value="Yayasan Pengembangan Pendidikan">
                                            Yayasan Pengembangan
                                            Pendidikan
                                        </option>

                                        <option value="Yayasan Bina Insani">
                                            Yayasan Bina Insani
                                        </option>

                                        <option value="Yayasan Al-Falah">
                                            Yayasan Al-Falah
                                        </option>
                                    </select>
                                </div>

                                {/* PAKET */}
                                <div>
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        Paket Langganan{" "}
                                        <span className="text-[var(--color-warning)]">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        className={`w-full px-3 py-2 text-sm rounded-lg border transition cursor-pointer ${themeInput}`}
                                        defaultValue={
                                            school.paket
                                        }
                                    >
                                        <option value="Starter">
                                            Starter
                                        </option>

                                        <option value="Professional">
                                            Professional
                                        </option>

                                        <option value="Enterprise">
                                            Enterprise
                                        </option>
                                    </select>
                                </div>

                                {/* TANGGAL MULAI */}
                                <div>
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        Tanggal Mulai
                                    </label>

                                    <div className="relative">
                                        <Calendar
                                            size={15}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                                        />

                                        <input
                                            type="date"
                                            defaultValue={
                                                school.tanggalMulai
                                            }
                                            className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition ${themeInput}`}
                                        />
                                    </div>
                                </div>

                                {/* TANGGAL BERAKHIR */}
                                <div>
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        Tanggal Berakhir
                                    </label>

                                    <div className="relative">
                                        <Calendar
                                            size={15}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                                        />

                                        <input
                                            type="date"
                                            defaultValue={
                                                school.tanggalBerakhir
                                            }
                                            className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition ${themeInput}`}
                                        />
                                    </div>
                                </div>

                                {/* STATUS */}
                                <div>
                                    <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                                        Status{" "}
                                        <span className="text-[var(--color-warning)]">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        className={`w-full px-3 py-2 text-sm rounded-lg border transition cursor-pointer ${themeInput}`}
                                        defaultValue={
                                            school.status
                                        }
                                    >
                                        <option value="Aktif">
                                            Aktif
                                        </option>

                                        <option value="Trial">
                                            Trial
                                        </option>

                                        <option value="Nonaktif">
                                            Nonaktif
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* =================================================
                        TOMBOL AKSI
                    ================================================= */}

                    <div
                        className={`flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t ${themeDivider}`}
                    >
                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/super-admin/sekolah"
                                )
                            }
                            className={`w-full sm:w-auto px-5 py-2.5 text-sm font-medium theme-text-secondary rounded-lg transition-colors ${themeNeutralHover}`}
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${themePrimaryButton} ${themeSmallShadow}`}
                        >
                            <Save size={16} />

                            Update Sekolah
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}