"use client";

import { useState } from "react";
import Image from "next/image";
import {
    CheckCircle,
    Clock,
    FileText,
    HelpCircle,
    Mail,
    Building2,
    Calendar,
    Check as CheckIcon,
    Copy,
    LayoutDashboard,
    Sparkles,
} from "lucide-react";

// ========== Tombol Bantuan ==========
const HelpButton = () => (
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 bg-white shadow-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-slate-200/80 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">Butuh bantuan?</span>
        </div>
        <a
            href="mailto:admin@portalpelanggan.id"
            className="text-xs sm:text-sm text-slate-800 font-medium hover:text-slate-900 transition-colors"
        >
            admin@portalpelanggan.id
        </a>
    </div>
);

// ========== Progress Steps ==========
const ProgressSteps = () => {
    const steps = [
        { label: "Pendaftaran terkirim", icon: CheckCircle },
        { label: "Pembayaran diterima", icon: CheckCircle },
        { label: "Verifikasi selesai", icon: CheckCircle },
        { label: "Akun aktif", icon: CheckCircle },
    ];

    return (
        <div className="flex items-center justify-between max-w-lg mx-auto w-full px-2 sm:px-0">
            {steps.map((step, index, arr) => (
                <div key={index} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center w-full">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 flex-shrink-0">
                            <step.icon className="w-5 h-5 sm:w-5 sm:h-5" />
                        </div>
                        <span className="text-[9px] sm:text-xs font-medium mt-2 text-center text-slate-700 leading-tight max-w-[60px] sm:max-w-[80px]">
                            {step.label}
                        </span>
                    </div>
                    {/* Garis penghubung fleksibel, tidak kaku di layar HP */}
                    {index < arr.length - 1 && (
                        <div className="flex-1 h-0.5 mx-1 sm:mx-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    )}
                </div>
            ))}
        </div>
    );
};

// ========== Komponen Utama ==========
export default function CustomerPortalPaid() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText("SCH-2026-08110");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
                {/* ===== HEADER ===== */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
                    <div className="flex items-center gap-4">
                        <div className="relative w-11 h-11 sm:w-14 sm:h-14 flex-shrink-0">
                            <Image
                                src="/logo/logoSS.png"
                                alt="Logo Portal Pelanggan"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
                                Portal Pelanggan
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-400 font-medium tracking-wide -mt-0.5">
                                SAAS SISTEM INFORMASI SEKOLAH
                            </p>
                        </div>
                    </div>
                    <HelpButton />
                </div>

                {/* ===== KARTU UTAMA ===== */}
                <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden transition-all hover:shadow-3xl hover:shadow-emerald-200/30">
                    {/* — Header Status dengan gradien premium — */}
                    <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 px-6 sm:px-8 py-6 sm:py-8 overflow-hidden">
                        {/* Efek dekoratif */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px] sm:text-xs font-medium border border-white/10">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        BERHASIL
                                    </span>
                                </div>
                                <h2 className="text-xl sm:text-3xl font-bold text-white mt-2 flex flex-wrap items-center gap-2">
                                    Pembayaran Berhasil & Akun Aktif
                                    <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
                                </h2>
                                <p className="text-white/80 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
                                    Pendaftaran <strong className="text-white">SMA Harapan Bangsa</strong> sudah kami terima.
                                    Aktivasi akun berjalan otomatis setelah pembayaran terverifikasi oleh admin —
                                    biasanya <strong className="text-white">1×24 jam kerja</strong> setelah bukti pembayaran diunggah.
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 sm:px-6 sm:py-3 flex items-center gap-2 border border-white/20 shadow-lg">
                                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                                    <span className="text-white text-xs sm:text-sm font-bold tracking-widest">
                                        AKTIF
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* — Progress Steps — */}
                    <div className="px-4 sm:px-8 pt-8 pb-4 border-b border-slate-200/60">
                        <ProgressSteps />
                    </div>

                    {/* — Body: Tagihan + Aksi — */}
                    <div className="p-4 sm:p-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Kiri — Rincian Tagihan */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="p-2 bg-emerald-50 rounded-lg flex-shrink-0">
                                        <FileText className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 tracking-wide">
                                        RINCIAN TAGIHAN
                                    </h3>
                                </div>

                                <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 overflow-hidden">
                                    <div className="divide-y divide-slate-200/60">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-5 py-3 sm:py-4 hover:bg-white/50 transition-colors gap-1 sm:gap-0">
                                            <span className="text-[11px] sm:text-sm text-slate-500 font-medium">
                                                Kode Tagihan
                                            </span>
                                            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                                <span className="text-[11px] sm:text-sm font-mono font-bold text-slate-800 bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-slate-200/60 break-all">
                                                    SCH-2026-08110
                                                </span>
                                                <button
                                                    onClick={handleCopy}
                                                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 flex-shrink-0"
                                                    title="Salin kode"
                                                >
                                                    {copied ? (
                                                        <CheckIcon className="w-4 h-4 text-emerald-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-5 py-3 sm:py-4 hover:bg-white/50 transition-colors gap-1 sm:gap-0">
                                            <span className="text-[11px] sm:text-sm text-slate-500 font-medium">
                                                Nama Sekolah
                                            </span>
                                            <span className="text-[11px] sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                                                SMA Harapan Bangsa
                                            </span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-5 py-3 sm:py-4 hover:bg-white/50 transition-colors gap-1 sm:gap-0">
                                            <span className="text-[11px] sm:text-sm text-slate-500 font-medium">
                                                Jumlah Tagihan
                                            </span>
                                            <span className="text-base sm:text-lg font-bold text-emerald-600">
                                                Rp 2.500.000
                                            </span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-5 py-3 sm:py-4 hover:bg-white/50 transition-colors gap-1 sm:gap-0">
                                            <span className="text-[11px] sm:text-sm text-slate-500 font-medium">
                                                Batas Waktu
                                            </span>
                                            <span className="text-[11px] sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                                                17 Agustus 2026
                                            </span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-5 py-3 sm:py-4 bg-emerald-50/50 hover:bg-emerald-50/70 transition-colors gap-1 sm:gap-0">
                                            <span className="text-[11px] sm:text-sm text-slate-500 font-medium">
                                                Status
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-sm font-bold bg-emerald-100 text-emerald-700 border border-emerald-200/80 shadow-sm">
                                                <CheckIcon className="w-3.5 h-3.5" />
                                                LUNAS
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Kanan — Aksi Cepat */}
                            <div className="w-full lg:w-80 flex-shrink-0">
                                <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-xl border border-emerald-200/60 p-6 h-full flex flex-col shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <h4 className="text-sm font-semibold text-slate-700">
                                            AKSI CEPAT
                                        </h4>
                                    </div>

                                    <div className="space-y-3 flex-1 flex flex-col">
                                        <a
                                            href="/dashboard"
                                            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-medium bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
                                        >
                                            <LayoutDashboard className="w-5 h-5" />
                                            Masuk ke Dashboard
                                        </a>

                                        <a
                                            href="mailto:admin@portalpelanggan.id"
                                            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-medium bg-white border border-slate-200/60 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                                        >
                                            <Mail className="w-5 h-5" />
                                            Hubungi Admin Sekolah
                                        </a>
                                    </div>

                                    <div className="mt-6 pt-5 border-t border-emerald-200/40">
                                        <div className="flex items-start gap-2.5">
                                            <div className="p-1.5 bg-emerald-50 rounded-full flex-shrink-0">
                                                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                                            </div>
                                            <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed">
                                                <span className="font-medium text-slate-600 block mb-0.5">
                                                    Akun aktif
                                                </span>
                                                Anda dapat mengakses dashboard untuk mengelola data sekolah.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* — Footer Card — */}
                    <div className="px-4 sm:px-8 py-4 bg-slate-50/50 border-t border-slate-200/60">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] sm:text-xs text-slate-400">
                            <span>© 2025 Portal Pelanggan — SAAS Sistem Informasi Sekolah</span>
                            <span className="flex items-center gap-1.5">
                                <CheckIcon className="w-3 h-3 text-emerald-500" />
                                Verifikasi selesai
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}