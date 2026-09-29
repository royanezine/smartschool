"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    ChevronLeft,
    CreditCard,
    Building2,
    Wallet,
    Banknote,
    QrCode,
    Check,
    Loader2,
    ArrowRight,
    Shield,
    Lock,
    Calendar,
    FileText,
    HelpCircle,
    Mail,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

// ========== Komponen Metode Pembayaran ==========
const PaymentMethod = ({
    icon: Icon,
    label,
    selected,
    onClick,
    description,
    badge,
    disabled = false,
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-200 ${
            selected
                ? "border-blue-500 bg-blue-50/80 shadow-sm shadow-blue-100"
                : "border-slate-200 hover:border-slate-300 bg-white"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"}`}
    >
        <div className={`p-2 rounded-lg ${selected ? "bg-blue-100" : "bg-slate-100"}`}>
            <Icon className={`w-5 h-5 ${selected ? "text-blue-600" : "text-slate-500"}`} />
        </div>
        <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${selected ? "text-blue-700" : "text-slate-700"}`}>
                    {label}
                </span>
                {badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        {badge}
                    </span>
                )}
            </div>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
        {selected && (
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
            </div>
        )}
    </button>
);

// ========== Komponen Utama ==========
export default function CheckoutPage() {
    const [selectedMethod, setSelectedMethod] = useState("va");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [expandedDetails, setExpandedDetails] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        phone: "",
    });

    const invoiceData = {
        id: "INV-2025-001",
        school: "SMA Harapan Bangsa",
        amount: 2500000,
        dueDate: "17 Agustus 2025",
        items: [{ name: "Paket SAAS Sistem Informasi Sekolah", qty: 1, price: 2500000 }],
        status: "pending",
    };

    const paymentMethods = [
        {
            id: "va",
            icon: Building2,
            label: "Virtual Account",
            description: "BCA, Mandiri, BRI, BNI, Permata",
            badge: "Populer",
        },
        {
            id: "credit_card",
            icon: CreditCard,
            label: "Kartu Kredit",
            description: "Visa, Mastercard, JCB",
            badge: "Aman",
        },
        {
            id: "ewallet",
            icon: Wallet,
            label: "E-Wallet",
            description: "OVO, Dana, LinkAja, ShopeePay",
        },
        {
            id: "qr",
            icon: QrCode,
            label: "QRIS",
            description: "Scan QR Code via aplikasi",
        },
        {
            id: "bank_transfer",
            icon: Banknote,
            label: "Transfer Bank",
            description: "Transfer manual ke rekening kami",
        },
    ];

    const handlePayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
        }, 3000);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Link href="/pelanggan" className="p-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <ChevronLeft className="w-5 h-5 text-slate-500" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                                <Image
                                    src="/logo/logoSS.png"
                                    alt="Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Checkout</h1>
                                <p className="text-sm text-slate-500 font-medium tracking-wide">
                                    SAAS SISTEM INFORMASI SEKOLAH
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200/60">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-slate-600 font-medium">Aman & Terpercaya</span>
                    </div>
                </div>

                {!isSuccess ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Kolom Kiri & Tengah - Form Pembayaran */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Ringkasan Pesanan */}
                            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-6">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    Ringkasan Pesanan
                                </h2>
                                <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Kode Invoice</span>
                                        <span className="font-mono font-semibold text-slate-800">{invoiceData.id}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Sekolah</span>
                                        <span className="font-semibold text-slate-800">{invoiceData.school}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Batas Bayar</span>
                                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {invoiceData.dueDate}
                                        </span>
                                    </div>
                                    <div className="border-t border-slate-200/60 pt-3 flex justify-between">
                                        <span className="text-sm font-medium text-slate-700">Total</span>
                                        <span className="text-lg font-bold text-blue-600">
                                            {formatCurrency(invoiceData.amount)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setExpandedDetails(!expandedDetails)}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-1"
                                    >
                                        {expandedDetails ? "Sembunyikan detail" : "Lihat detail"}
                                        {expandedDetails ? (
                                            <ChevronUp className="w-3 h-3" />
                                        ) : (
                                            <ChevronDown className="w-3 h-3" />
                                        )}
                                    </button>
                                    {expandedDetails && (
                                        <div className="border-t border-slate-200/60 pt-3 space-y-2">
                                            {invoiceData.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-slate-600">{item.name} x{item.qty}</span>
                                                    <span className="text-slate-700">{formatCurrency(item.price)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Metode Pembayaran */}
                            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-6">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-blue-600" />
                                    Metode Pembayaran
                                </h2>
                                <div className="space-y-3">
                                    {paymentMethods.map((method) => (
                                        <PaymentMethod
                                            key={method.id}
                                            icon={method.icon}
                                            label={method.label}
                                            description={method.description}
                                            badge={method.badge}
                                            selected={selectedMethod === method.id}
                                            onClick={() => setSelectedMethod(method.id)}
                                            disabled={method.id === "credit_card" || method.id === "ewallet"}
                                        />
                                    ))}
                                    <p className="text-xs text-slate-400 mt-2">
                                        * Metode pembayaran yang dinonaktifkan akan tersedia segera
                                    </p>
                                </div>
                            </div>

                            {/* Data Diri */}
                            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-6">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-blue-600" />
                                    Data Diri
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 block mb-1.5">
                                            Nama Lengkap <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white text-slate-700"
                                            placeholder="Masukkan nama lengkap"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 block mb-1.5">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white text-slate-700"
                                            placeholder="Masukkan email"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 block mb-1.5">
                                            Nomor Telepon
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white text-slate-700"
                                            placeholder="Masukkan nomor telepon"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kolom Kanan - Ringkasan & Tombol Bayar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-6 sticky top-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Lock className="w-4 h-4 text-emerald-500" />
                                    <h3 className="text-sm font-semibold text-slate-700">Ringkasan Pembayaran</h3>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="text-slate-700">{formatCurrency(invoiceData.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Biaya Admin</span>
                                        <span className="text-emerald-600">Gratis</span>
                                    </div>
                                    <div className="border-t border-slate-200/60 pt-3 flex justify-between">
                                        <span className="font-semibold text-slate-700">Total</span>
                                        <span className="text-xl font-bold text-blue-600">
                                            {formatCurrency(invoiceData.amount)}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                                    <p className="text-xs text-slate-600 flex items-start gap-2">
                                        <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span>Pembayaran Anda aman. Data akan dienkripsi dan diproses melalui Xendit.</span>
                                    </p>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
                                        isProcessing
                                            ? "bg-slate-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
                                    }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            Bayar Sekarang
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-[10px] text-slate-400 mt-3">
                                    Dengan mengklik bayar, Anda menyetujui Syarat & Ketentuan
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    // ========== Halaman Sukses ==========
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-8 sm:p-10 text-center">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                Pembayaran Berhasil!
                            </h2>
                            <p className="text-slate-500 text-sm mb-6">
                                Terima kasih, pembayaran Anda telah kami terima. Invoice akan segera diproses.
                            </p>

                            <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-4 text-left space-y-2 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Kode Invoice</span>
                                    <span className="font-mono font-semibold text-slate-800">{invoiceData.id}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Jumlah</span>
                                    <span className="font-bold text-blue-600">{formatCurrency(invoiceData.amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Metode</span>
                                    <span className="font-medium text-slate-700">
                                        {paymentMethods.find((m) => m.id === selectedMethod)?.label}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Status</span>
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                        <Check className="w-3 h-3" />
                                        LUNAS
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href="/dashboard"
                                    className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors text-center"
                                >
                                    Ke Dashboard
                                </Link>
                                <a
                                    href="mailto:admin@portalpelanggan.id"
                                    className="flex-1 bg-white border border-slate-200/60 text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors text-center"
                                >
                                    <Mail className="w-4 h-4 inline-block mr-2" />
                                    Hubungi Admin
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}