"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";
import { sekolahData } from "../../../../../lib/data";
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

export default function EditSekolahPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id);
    const school = sekolahData.find((item) => item.id === id);

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeMenu] = useState("sekolah");

    const notifications = [
        { id: 1, title: "Pembaruan Sistem v2.0", desc: "Dikirim 2 jam lalu", read: false },
        { id: 2, title: "Pengingat: Backup Data", desc: "Dikirim 1 hari lalu", read: false },
        { id: 3, title: "Sekolah baru mendaftar", desc: "Dikirim 3 hari lalu", read: true },
    ];

    if (!school) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-700">Sekolah tidak ditemukan</h2>
                    <button
                        onClick={() => router.push("/super-admin/sekolah")}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Kembali ke Daftar Sekolah
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar
                active={activeMenu}
                setActive={() => {}}
                collapsed={!sidebarOpen}
                setCollapsed={() => setSidebarOpen(!sidebarOpen)}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    notifications={notifications}
                    user={{ name: "Sarah", email: "sarah@smartschool.com", avatar: "SA" }}
                />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                    <div className="max-w-3xl mx-auto">
                        {/* HEADER FORM */}
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-6">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 flex items-center gap-2.5">
                                    <span className="p-2 rounded-lg bg-amber-600 text-white shadow-sm">
                                        <School size={18} />
                                    </span>
                                    Edit Sekolah
                                </h1>
                                <p className="text-sm text-slate-500 ml-[52px] mt-0.5">
                                    Perbarui data sekolah yang terdaftar di sistem.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push("/super-admin/sekolah")}
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                aria-label="Tutup"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form className="space-y-7">
                            {/* INFORMASI SEKOLAH */}
                            <section>
                                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2.5">
                                    <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                                        <School size={16} />
                                    </span>
                                    Informasi Sekolah
                                </h3>
                                <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Nama Sekolah <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <School size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    defaultValue={school.nama}
                                                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition text-slate-800 placeholder:text-slate-400"
                                                    placeholder="Masukkan nama sekolah"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                NPSN <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    defaultValue={school.npsn}
                                                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition text-slate-800 placeholder:text-slate-400"
                                                    placeholder="Masukkan NPSN"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Jenjang <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition cursor-pointer text-slate-800"
                                                defaultValue={school.jenjang}
                                            >
                                                <option value="SD">SD</option>
                                                <option value="SMP">SMP</option>
                                                <option value="SMA">SMA</option>
                                                <option value="SMK">SMK</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Status Sekolah
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition cursor-pointer text-slate-800"
                                                defaultValue={school.statusSekolah}
                                            >
                                                <option value="Negeri">Negeri</option>
                                                <option value="Swasta">Swasta</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Email
                                            </label>
                                            <div className="relative">
                                                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="email"
                                                    defaultValue={school.email}
                                                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition text-slate-800 placeholder:text-slate-400"
                                                    placeholder="sekolah@email.com"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                No Telepon
                                            </label>
                                            <div className="relative">
                                                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    defaultValue={school.telepon}
                                                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition text-slate-800 placeholder:text-slate-400"
                                                    placeholder="021-12345678"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Website
                                            </label>
                                            <div className="relative">
                                                <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    defaultValue={school.website}
                                                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition text-slate-800 placeholder:text-slate-400"
                                                    placeholder="https://sekolah.sch.id"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Logo
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg file:mr-3 file:py-1.5 file:px-3 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 file:border-0 file:rounded-lg hover:file:bg-blue-100 transition cursor-pointer text-slate-700"
                                                    accept="image/*"
                                                />
                                                <Upload size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">Format: JPG, PNG, maks 2MB</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ALAMAT */}
                            <section>
                                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2.5">
                                    <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                                        <MapPin size={16} />
                                    </span>
                                    Alamat
                                </h3>
                                <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Provinsi <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition cursor-pointer text-slate-800"
                                                defaultValue={school.provinsi}
                                            >
                                                <option value="DKI Jakarta">DKI Jakarta</option>
                                                <option value="Banten">Banten</option>
                                                <option value="Jawa Barat">Jawa Barat</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Kabupaten/Kota <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition cursor-pointer text-slate-800"
                                                defaultValue={school.kota}
                                            >
                                                <option value="Jakarta Pusat">Jakarta Pusat</option>
                                                <option value="Jakarta Utara">Jakarta Utara</option>
                                                <option value="Jakarta Barat">Jakarta Barat</option>
                                                <option value="Tangerang Selatan">Tangerang Selatan</option>
                                                <option value="Tangerang">Tangerang</option>
                                                <option value="Depok">Depok</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Kecamatan
                                            </label>
                                            <input
                                                type="text"
                                                defaultValue={school.kecamatan}
                                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition text-slate-800 placeholder:text-slate-400"
                                                placeholder="Masukkan kecamatan"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Kelurahan
                                            </label>
                                            <input
                                                type="text"
                                                defaultValue={school.kelurahan}
                                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition text-slate-800 placeholder:text-slate-400"
                                                placeholder="Masukkan kelurahan"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Kode Pos
                                            </label>
                                            <input
                                                type="text"
                                                defaultValue={school.kodePos}
                                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition text-slate-800 placeholder:text-slate-400"
                                                placeholder="Masukkan kode pos"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Alamat Lengkap <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <textarea
                                                    rows={2}
                                                    defaultValue={school.alamat}
                                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition resize-none text-slate-800 placeholder:text-slate-400"
                                                    placeholder="Masukkan alamat lengkap (jalan, nomor, RT/RW, dll.)"
                                                />
                                                <FileText size={15} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* YAYASAN & PAKET */}
                            <section>
                                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2.5">
                                    <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                                        <Building size={16} />
                                    </span>
                                    Yayasan & Paket Langganan
                                </h3>
                                <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Yayasan
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition cursor-pointer text-slate-800"
                                                defaultValue={school.yayasan}
                                            >
                                                <option value="-">- Tanpa Yayasan -</option>
                                                <option value="Yayasan Al-Azhar">Yayasan Al-Azhar</option>
                                                <option value="Yayasan BPK Penabur">Yayasan BPK Penabur</option>
                                                <option value="Yayasan Pengembangan Pendidikan">Yayasan Pengembangan Pendidikan</option>
                                                <option value="Yayasan Bina Insani">Yayasan Bina Insani</option>
                                                <option value="Yayasan Al-Falah">Yayasan Al-Falah</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Paket Langganan <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition cursor-pointer text-slate-800"
                                                defaultValue={school.paket}
                                            >
                                                <option value="Starter">Starter</option>
                                                <option value="Professional">Professional</option>
                                                <option value="Enterprise">Enterprise</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Tanggal Mulai
                                            </label>
                                            <div className="relative">
                                                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="date"
                                                    defaultValue={school.tanggalMulai}
                                                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition text-slate-800"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Tanggal Berakhir
                                            </label>
                                            <div className="relative">
                                                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="date"
                                                    defaultValue={school.tanggalBerakhir}
                                                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition text-slate-800"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                                Status <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition cursor-pointer text-slate-800"
                                                defaultValue={school.status}
                                            >
                                                <option value="Aktif">Aktif</option>
                                                <option value="Trial">Trial</option>
                                                <option value="Nonaktif">Nonaktif</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* TOMBOL AKSI */}
                            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200/80">
                                <button
                                    type="button"
                                    onClick={() => router.push("/super-admin/sekolah")}
                                    className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
                                >
                                    <Save size={16} />
                                    Update Sekolah
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}