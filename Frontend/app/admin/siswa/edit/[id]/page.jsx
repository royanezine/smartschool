"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
import { ArrowLeft, Save, User, UserRound, MapPin, Users } from "lucide-react";

const STORAGE_KEY = "siswa_data";

const loadSiswa = () => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  try {
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveSiswa = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const KELAS_LIST = [
  "X IPA 1",
  "X IPA 2",
  "X IPA 3",
  "X IPS 1",
  "X IPS 2",
  "X IPS 3",
  "X RPL 1",
  "X RPL 2",
  "X TKJ 1",
  "X TKJ 2",
  "XI IPA 1",
  "XI IPA 2",
  "XI IPA 3",
  "XI IPS 1",
  "XI IPS 2",
  "XI IPS 3",
  "XI RPL 1",
  "XI RPL 2",
  "XI TKJ 1",
  "XI TKJ 2",
  "XII IPA 1",
  "XII IPA 2",
  "XII IPA 3",
  "XII IPS 1",
  "XII IPS 2",
  "XII IPS 3",
  "XII RPL 1",
  "XII RPL 2",
  "XII TKJ 1",
  "XII TKJ 2",
];

export default function EditSiswaPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // FORM STATE (lengkap seperti tambah siswa)
  // =========================================================
  const [formData, setFormData] = useState({
    nama: "",
    nis: "",
    nisn: "",
    kelas: "",
    status: "Aktif",
    gender: "L",
    tglLahir: "",
    joinDate: new Date().toISOString().slice(0, 10),

    // Alamat detail
    kecamatan: "",
    kota: "",
    kelurahan: "",
    provinsi: "",

    // Kontak
    email: "",
    phone: "",
    alamat: "",

    // Data orang tua
    nikOrtu: "",
    namaOrtu: "",
    pekerjaanOrtu: "",
    alamatKtpOrtu: "",
    alamatDomisiliOrtu: "",
    domisiliSama: true,
  });

  // =========================================================
  // SEARCHABLE SELECT UNTUK KELAS
  // =========================================================
  const [kelasSearch, setKelasSearch] = useState("");
  const [isKelasOpen, setIsKelasOpen] = useState(false);
  const kelasRef = useRef(null);

  const filteredKelas = KELAS_LIST.filter((k) =>
    k.toLowerCase().includes(kelasSearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (kelasRef.current && !kelasRef.current.contains(e.target)) {
        setIsKelasOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================================================
  // LOAD DATA SISWA
  // =========================================================
  useEffect(() => {
    const list = loadSiswa();
    const found = list.find((s) => Number(s.id) === id);

    if (found) {
      setFormData({
        nama: found.nama || "",
        nis: found.nis || "",
        nisn: found.nisn || "",
        kelas: found.kelas || "",
        status: found.status || "Aktif",
        gender: found.gender || "L",
        tglLahir: found.tglLahir || "",
        joinDate: found.joinDate || new Date().toISOString().slice(0, 10),

        kecamatan: found.kecamatan || "",
        kota: found.kota || "",
        kelurahan: found.kelurahan || "",
        provinsi: found.provinsi || "",

        email: found.email || "",
        phone: found.phone || "",
        alamat: found.alamat || "",

        nikOrtu: found.nikOrtu || "",
        namaOrtu: found.namaOrtu || "",
        pekerjaanOrtu: found.pekerjaanOrtu || "",
        alamatKtpOrtu: found.alamatKtpOrtu || "",
        alamatDomisiliOrtu: found.alamatDomisiliOrtu || "",
        domisiliSama: found.domisiliSama !== undefined ? found.domisiliSama : true,
      });

      setLoading(false);
    } else {
      alert("Siswa tidak ditemukan!");
      router.push("/admin/siswa");
    }
  }, [id, router]);

  // =========================================================
  // HANDLE CHANGE
  // =========================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================================================
  // HANDLE DOMISILI SAMA
  // =========================================================
  const handleDomisiliSama = (e) => {
    const checked = e.target.checked;
    setFormData((prev) => {
      const newData = { ...prev, domisiliSama: checked };
      if (checked) {
        newData.alamatDomisiliOrtu = prev.alamatKtpOrtu;
      }
      return newData;
    });
  };

  // Efek untuk menyalin saat alamat KTP berubah jika domisili sama aktif
  useEffect(() => {
    if (formData.domisiliSama) {
      setFormData((prev) => ({
        ...prev,
        alamatDomisiliOrtu: prev.alamatKtpOrtu,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.alamatKtpOrtu]);

  // =========================================================
  // HANDLE SUBMIT
  // =========================================================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nama.trim()) {
      alert("Nama lengkap wajib diisi!");
      return;
    }
    if (!formData.nis.trim()) {
      alert("NIS wajib diisi!");
      return;
    }
    if (!formData.kelas) {
      alert("Kelas wajib dipilih!");
      return;
    }
    if (!formData.nisn.trim()) {
      alert("NISN wajib diisi!");
      return;
    }

    setSaving(true);

    const list = loadSiswa();
    const index = list.findIndex((s) => Number(s.id) === id);

    if (index !== -1) {
      list[index] = {
        ...list[index],
        ...formData,
        id: list[index].id,
      };

      saveSiswa(list);
      alert("Data siswa berhasil diperbarui!");
      router.push("/admin/siswa");
      return;
    }

    setSaving(false);
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
          <p className="text-sm text-slate-500">Memuat data siswa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar
        active="siswa"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setIsCollapsed(!isCollapsed)}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-3 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1400px]">
              {/* TOP BAR */}
              <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex w-fit items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition hover:text-slate-800"
                >
                  <ArrowLeft size={17} />
                  <span>Kembali</span>
                </button>
                <div className="hidden sm:block text-xs text-slate-400">
                  Admin Sekolah / Siswa / Edit
                </div>
              </div>

              {/* PAGE TITLE */}
              <div className="mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <UserRound size={20} />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
                      Edit Data Siswa
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                      Perbarui informasi data peserta didik dengan lengkap.
                    </p>
                  </div>
                </div>
              </div>

              {/* FORM CARD */}
              <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-white to-cyan-50/50 px-4 py-4 sm:px-6 sm:py-5 lg:px-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                      <User size={19} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-slate-800 sm:text-base">
                        Informasi Siswa
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                        Pastikan data yang dimasukkan sudah benar.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="p-4 sm:p-6 lg:p-7">
                    {/* =========================================
                        DATA UTAMA
                    ========================================== */}
                    <div className="mb-6">
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-700">
                          Data Utama
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                          Identitas dan status siswa.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {/* NAMA */}
                        <div className="min-w-0">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Nama Lengkap <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="nama"
                            value={formData.nama}
                            onChange={handleChange}
                            placeholder="Contoh: Ahmad Fauzan"
                            required
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>

                        {/* NIS */}
                        <div className="min-w-0">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            NIS <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="nis"
                            value={formData.nis}
                            onChange={handleChange}
                            placeholder="2401001"
                            required
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>

                        {/* NISN */}
                        <div className="min-w-0">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            NISN <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="nisn"
                            value={formData.nisn}
                            onChange={handleChange}
                            placeholder="1234567890"
                            required
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>

                        {/* KELAS — SEARCHABLE SELECT */}
                        <div ref={kelasRef} className="min-w-0 relative">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Kelas <span className="text-rose-500">*</span>
                          </label>
                          <div
                            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20"
                            onClick={() => setIsKelasOpen((prev) => !prev)}
                          >
                            <input
                              type="text"
                              placeholder={formData.kelas || "Cari kelas..."}
                              value={kelasSearch}
                              onChange={(e) => {
                                setKelasSearch(e.target.value);
                                setIsKelasOpen(true);
                              }}
                              onFocus={() => setIsKelasOpen(true)}
                              className="w-full bg-transparent outline-none placeholder:text-slate-400"
                              autoComplete="off"
                            />
                          </div>

                          {isKelasOpen && (
                            <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                              {filteredKelas.length === 0 ? (
                                <li className="px-4 py-2 text-sm text-slate-500">
                                  Tidak ada kelas yang cocok
                                </li>
                              ) : (
                                filteredKelas.map((k) => (
                                  <li
                                    key={k}
                                    className={`cursor-pointer px-4 py-2 text-sm transition hover:bg-blue-50 ${
                                      formData.kelas === k
                                        ? "bg-blue-100 font-semibold text-blue-700"
                                        : ""
                                    }`}
                                    onClick={() => {
                                      setFormData({ ...formData, kelas: k });
                                      setKelasSearch("");
                                      setIsKelasOpen(false);
                                    }}
                                  >
                                    {k}
                                  </li>
                                ))
                              )}
                            </ul>
                          )}
                        </div>

                        {/* STATUS */}
                        <div className="min-w-0">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Status
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="Aktif">Aktif</option>
                            <option value="Nonaktif">Nonaktif</option>
                          </select>
                        </div>

                        {/* GENDER */}
                        <div className="min-w-0">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Jenis Kelamin
                          </label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                          </select>
                        </div>

                        {/* TGL LAHIR */}
                        <div className="min-w-0">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Tanggal Lahir
                          </label>
                          <input
                            type="date"
                            name="tglLahir"
                            value={formData.tglLahir}
                            onChange={handleChange}
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>

                        {/* TANGGAL BERGABUNG */}
                        <div className="min-w-0">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Tanggal Bergabung
                          </label>
                          <input
                            type="date"
                            name="joinDate"
                            value={formData.joinDate}
                            onChange={handleChange}
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* =========================================
                        ALAMAT DETAIL
                    ========================================== */}
                    <div className="mb-6 border-t border-slate-100 pt-6">
                      <div className="mb-4 flex items-center gap-2">
                        <MapPin size={18} className="text-blue-600" />
                        <h3 className="text-sm font-semibold text-slate-700">
                          Alamat Lengkap
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div className="min-w-0">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Kecamatan
                          </label>
                          <input
                            type="text"
                            name="kecamatan"
                            value={formData.kecamatan}
                            onChange={handleChange}
                            placeholder="Kecamatan"
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div className="min-w-0">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Kota / Kabupaten
                          </label>
                          <input
                            type="text"
                            name="kota"
                            value={formData.kota}
                            onChange={handleChange}
                            placeholder="Kota"
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div className="min-w-0">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Kelurahan / Desa
                          </label>
                          <input
                            type="text"
                            name="kelurahan"
                            value={formData.kelurahan}
                            onChange={handleChange}
                            placeholder="Kelurahan"
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div className="min-w-0">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Provinsi
                          </label>
                          <input
                            type="text"
                            name="provinsi"
                            value={formData.provinsi}
                            onChange={handleChange}
                            placeholder="Provinsi"
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div className="min-w-0 md:col-span-2 xl:col-span-3">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Alamat Lengkap (Jalan, RT/RW, dll)
                          </label>
                          <textarea
                            name="alamat"
                            value={formData.alamat}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Jl. Contoh No. 1, RT 01 RW 02"
                            className="w-full min-w-0 resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* =========================================
                        INFORMASI KONTAK
                    ========================================== */}
                    <div className="mb-6 border-t border-slate-100 pt-6">
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-700">
                          Informasi Kontak
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                          Email dan nomor telepon yang dapat dihubungi.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="min-w-0">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="siswa@sekolah.com"
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div className="min-w-0">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Telepon
                          </label>
                          <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="081234567890"
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* =========================================
                        DATA ORANG TUA
                    ========================================== */}
                    <div className="mb-6 border-t border-slate-100 pt-6">
                      <div className="mb-4 flex items-center gap-2">
                        <Users size={18} className="text-blue-600" />
                        <h3 className="text-sm font-semibold text-slate-700">
                          Data Orang Tua / Wali
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div className="min-w-0">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            NIK Orang Tua
                          </label>
                          <input
                            type="text"
                            name="nikOrtu"
                            value={formData.nikOrtu}
                            onChange={handleChange}
                            placeholder="1234567890123456"
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div className="min-w-0">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Nama Orang Tua
                          </label>
                          <input
                            type="text"
                            name="namaOrtu"
                            value={formData.namaOrtu}
                            onChange={handleChange}
                            placeholder="Bapak/Ibu ..."
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div className="min-w-0">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Pekerjaan
                          </label>
                          <input
                            type="text"
                            name="pekerjaanOrtu"
                            value={formData.pekerjaanOrtu}
                            onChange={handleChange}
                            placeholder="PNS / Swasta / dll"
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div className="min-w-0 md:col-span-2 xl:col-span-3">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Alamat KTP Orang Tua
                          </label>
                          <input
                            type="text"
                            name="alamatKtpOrtu"
                            value={formData.alamatKtpOrtu}
                            onChange={handleChange}
                            placeholder="Alamat sesuai KTP"
                            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div className="min-w-0 md:col-span-2 xl:col-span-3">
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Alamat Domisili Orang Tua
                          </label>
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              name="alamatDomisiliOrtu"
                              value={formData.alamatDomisiliOrtu}
                              onChange={handleChange}
                              placeholder="Alamat domisili sekarang"
                              className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                              disabled={formData.domisiliSama}
                            />
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                              <input
                                type="checkbox"
                                name="domisiliSama"
                                checked={formData.domisiliSama}
                                onChange={handleDomisiliSama}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span>Alamat domisili sama dengan alamat KTP</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* =========================================
                        ACTION BUTTONS
                    ========================================== */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={saving}
                        className="w-full rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:shadow-lg hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        {saving ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save size={17} />
                            Perbarui Data
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* FOOTER */}
              <div className="py-4 text-center text-[11px] text-slate-400">
                © 2026 SmartSchool • Edit Data Siswa
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}