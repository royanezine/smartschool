"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  Boxes,
  Package,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  MapPin,
  Tags,
  Warehouse,
  ClipboardList,
  Wrench,
  FileText,
  Loader2,
  PackageCheck,
  CircleAlert,
  Info,
} from "lucide-react";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import {
  getGudang,
  getKategoriAset,
  createAset,
} from "../../../../../services/sarpras.service";

export default function TambahAsetPage() {
  const router = useRouter();

  const [gudangList, setGudangList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);

  const [loadingMaster, setLoadingMaster] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    kode: "",
    nama: "",
    kondisi: "baik",
    jumlah: "",
    jumlahStok: "",
    stokMinimum: "",
    lokasi: "",
    kategoriAsetId: "",
    gudangId: "",
    status: "aktif",

    tanggalPembelian: "",
    perawatanTerakhir: "",
    tanggalRusak: "",
    deskripsiKerusakan: "",
    statusPerbaikan: "",
    catatan: "",
  });

  // =========================================================
  // LOAD MASTER DATA
  // =========================================================

  useEffect(() => {
    async function loadMasterData() {
      try {
        setLoadingMaster(true);
        setError("");

        const [gudangRes, kategoriRes] = await Promise.all([
          getGudang(),
          getKategoriAset(),
        ]);

        const gudangData =
          gudangRes?.data ??
          gudangRes?.result ??
          gudangRes ??
          [];

        const kategoriData =
          kategoriRes?.data ??
          kategoriRes?.result ??
          kategoriRes ??
          [];

        setGudangList(Array.isArray(gudangData) ? gudangData : []);
        setKategoriList(Array.isArray(kategoriData) ? kategoriData : []);
      } catch (err) {
        console.error("Gagal mengambil master data:", err);

        setError(
          err?.message ||
            "Gagal mengambil data gudang dan kategori aset."
        );
      } finally {
        setLoadingMaster(false);
      }
    }

    loadMasterData();
  }, []);

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    const newErrors = {};

    if (!form.kode.trim()) {
      newErrors.kode = "Kode aset wajib diisi.";
    } else if (form.kode.trim().length < 2) {
      newErrors.kode = "Kode aset minimal 2 karakter.";
    }

    if (!form.nama.trim()) {
      newErrors.nama = "Nama aset wajib diisi.";
    } else if (form.nama.trim().length < 3) {
      newErrors.nama = "Nama aset minimal 3 karakter.";
    }

    if (!form.jumlah) {
      newErrors.jumlah = "Jumlah aset wajib diisi.";
    } else if (
      !Number.isInteger(Number(form.jumlah)) ||
      Number(form.jumlah) < 1
    ) {
      newErrors.jumlah = "Jumlah harus berupa angka minimal 1.";
    }

    if (form.jumlahStok === "") {
      newErrors.jumlahStok = "Jumlah stok wajib diisi.";
    } else if (
      !Number.isInteger(Number(form.jumlahStok)) ||
      Number(form.jumlahStok) < 0
    ) {
      newErrors.jumlahStok = "Jumlah stok harus berupa angka minimal 0.";
    } else if (
      form.jumlah &&
      Number(form.jumlahStok) > Number(form.jumlah)
    ) {
      newErrors.jumlahStok =
        "Jumlah stok tidak boleh lebih besar dari jumlah aset.";
    }

    if (form.stokMinimum === "") {
      newErrors.stokMinimum = "Stok minimum wajib diisi.";
    } else if (
      !Number.isInteger(Number(form.stokMinimum)) ||
      Number(form.stokMinimum) < 0
    ) {
      newErrors.stokMinimum =
        "Stok minimum harus berupa angka minimal 0.";
    }

    if (!form.kategoriAsetId) {
      newErrors.kategoriAsetId = "Kategori aset wajib dipilih.";
    }

    if (!form.gudangId) {
      newErrors.gudangId = "Gudang wajib dipilih.";
    }

    if (form.tanggalPembelian) {
      const date = new Date(form.tanggalPembelian);

      if (Number.isNaN(date.getTime())) {
        newErrors.tanggalPembelian =
          "Tanggal pembelian tidak valid.";
      }
    }

    if (form.perawatanTerakhir) {
      const date = new Date(form.perawatanTerakhir);

      if (Number.isNaN(date.getTime())) {
        newErrors.perawatanTerakhir =
          "Tanggal perawatan tidak valid.";
      }
    }

    if (form.tanggalRusak) {
      const date = new Date(form.tanggalRusak);

      if (Number.isNaN(date.getTime())) {
        newErrors.tanggalRusak =
          "Tanggal kerusakan tidak valid.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const isValid = validateForm();

    if (!isValid) {
      setError("Periksa kembali data yang belum sesuai.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        kode: form.kode.trim(),
        nama: form.nama.trim(),
        kondisi: form.kondisi || "baik",

        jumlah: Number(form.jumlah),
        jumlahStok: Number(form.jumlahStok),
        stokMinimum: Number(form.stokMinimum),

        lokasi: form.lokasi?.trim() || null,

        kategoriAsetId: form.kategoriAsetId,
        gudangId: form.gudangId,

        status: form.status || "aktif",

        tanggalPembelian: form.tanggalPembelian || null,
        perawatanTerakhir: form.perawatanTerakhir || null,
        tanggalRusak: form.tanggalRusak || null,

        deskripsiKerusakan:
          form.deskripsiKerusakan?.trim() || null,

        statusPerbaikan:
          form.statusPerbaikan?.trim() || null,

        catatan: form.catatan?.trim() || null,
      };

      await createAset(payload);

      setSuccess("Aset berhasil ditambahkan.");

      setTimeout(() => {
        router.push("/admin/sarpras/gudang");
      }, 800);
    } catch (err) {
      console.error("Gagal membuat aset:", err);

      setError(
        err?.message ||
          "Gagal menambahkan aset. Silakan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // RESET
  // =========================================================

  const handleReset = () => {
    setForm({
      kode: "",
      nama: "",
      kondisi: "baik",
      jumlah: "",
      jumlahStok: "",
      stokMinimum: "",
      lokasi: "",
      kategoriAsetId: "",
      gudangId: "",
      status: "aktif",

      tanggalPembelian: "",
      perawatanTerakhir: "",
      tanggalRusak: "",
      deskripsiKerusakan: "",
      statusPerbaikan: "",
      catatan: "",
    });

    setErrors({});
    setError("");
    setSuccess("");
  };

  // =========================================================
  // SELECTED DATA
  // =========================================================

  const selectedGudang = useMemo(() => {
    return gudangList.find(
      (item) => String(item.id) === String(form.gudangId)
    );
  }, [gudangList, form.gudangId]);

  const selectedKategori = useMemo(() => {
    return kategoriList.find(
      (item) =>
        String(item.id) === String(form.kategoriAsetId)
    );
  }, [kategoriList, form.kategoriAsetId]);

  // =========================================================
  // COMPLETENESS
  // =========================================================

  const requiredFields = [
    form.kode,
    form.nama,
    form.jumlah,
    form.jumlahStok !== "",
    form.stokMinimum !== "",
    form.kategoriAsetId,
    form.gudangId,
  ];

  const completedFields = requiredFields.filter(Boolean).length;

  const completionPercentage = Math.round(
    (completedFields / requiredFields.length) * 100
  );

  // =========================================================
  // STOCK STATUS
  // =========================================================

  const stockStatus = useMemo(() => {
    const stok = Number(form.jumlahStok || 0);
    const minimum = Number(form.stokMinimum || 0);

    if (!form.jumlahStok || form.stokMinimum === "") {
      return {
        label: "Belum ditentukan",
        className: "bg-slate-100 text-slate-600",
      };
    }

    if (stok <= minimum) {
      return {
        label: "Stok rendah",
        className: "bg-orange-50 text-orange-700",
      };
    }

    return {
      label: "Stok aman",
      className: "bg-emerald-50 text-emerald-700",
    };
  }, [form.jumlahStok, form.stokMinimum]);

  // =========================================================
  // REUSABLE CLASS
  // =========================================================

  const inputClass = (name) => `
    w-full rounded-xl border bg-white px-4 py-3 text-sm
    text-slate-900 placeholder:text-slate-400
    outline-none transition
    ${
      errors[name]
        ? "border-red-300 ring-2 ring-red-100"
        : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
    }
  `;

  const selectClass = (name) => `
    w-full rounded-xl border bg-white px-4 py-3 text-sm
    text-slate-900 outline-none transition
    ${
      errors[name]
        ? "border-red-300 ring-2 ring-red-100"
        : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
    }
  `;

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="flex min-h-screen items-stretch">

        {/* =====================================================
            SIDEBAR
        ====================================================== */}

        <aside className="relative z-40 shrink-0 self-stretch">
          <Sidebar />
        </aside>

        {/* =====================================================
            AREA KANAN
        ====================================================== */}

        <div className="flex min-w-0 flex-1 flex-col">

          {/* HEADER */}
          <div className="relative z-30 shrink-0">
            <Header />
          </div>

          {/* ===================================================
              MAIN CONTENT
          ==================================================== */}

          <main className="min-w-0 flex-1 overflow-x-hidden">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">

              {/* =================================================
                  PAGE HEADER
              ================================================== */}

              <div className="mb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex min-w-0 items-center gap-3">

                    <Link
                      href="/admin/sarpras/gudang"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Link>

                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                        <span>Sarpras</span>
                        <span>/</span>
                        <span>Gudang & Aset</span>
                        <span>/</span>
                        <span className="text-blue-600">
                          Tambah Aset
                        </span>
                      </div>

                      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Tambah Aset
                      </h1>

                      <p className="mt-1 text-sm text-slate-500">
                        Tambahkan data aset baru ke dalam sistem
                        sarana dan prasarana.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/admin/sarpras/gudang"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <X className="h-4 w-4" />
                    Batal
                  </Link>
                </div>
              </div>

              {/* =================================================
                  ALERT
              ================================================== */}

              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      Terjadi kesalahan
                    </p>

                    <p className="mt-0.5 text-sm text-red-600">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="ml-auto shrink-0 rounded-lg p-1 text-red-500 hover:bg-red-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {success && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <p className="text-sm font-semibold">
                      Berhasil
                    </p>

                    <p className="mt-0.5 text-sm text-emerald-600">
                      {success}
                    </p>
                  </div>
                </div>
              )}

              {/* =================================================
                  FORM + SUMMARY
              ================================================== */}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">

                  {/* =================================================
                      LEFT - FORM
                  ================================================== */}

                  <div className="min-w-0 space-y-6">

                    {/* =============================================
                        INFORMASI UTAMA
                    ============================================== */}

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Package className="h-5 w-5" />
                          </div>

                          <div>
                            <h2 className="text-base font-bold text-slate-900">
                              Informasi Aset
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500">
                              Informasi dasar mengenai aset.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">

                        {/* KODE */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Kode Aset
                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          </label>

                          <input
                            type="text"
                            name="kode"
                            value={form.kode}
                            onChange={handleChange}
                            placeholder="Contoh: AST-001"
                            className={inputClass("kode")}
                          />

                          {errors.kode && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {errors.kode}
                            </p>
                          )}
                        </div>

                        {/* NAMA */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Nama Aset
                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          </label>

                          <input
                            type="text"
                            name="nama"
                            value={form.nama}
                            onChange={handleChange}
                            placeholder="Contoh: Meja Guru"
                            className={inputClass("nama")}
                          />

                          {errors.nama && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {errors.nama}
                            </p>
                          )}
                        </div>

                        {/* KONDISI */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Kondisi Aset
                          </label>

                          <select
                            name="kondisi"
                            value={form.kondisi}
                            onChange={handleChange}
                            className={selectClass("kondisi")}
                            style={{
                              color: "#0F172A",
                              colorScheme: "light",
                            }}
                          >
                            <option value="baik">
                              Baik
                            </option>
                            <option value="rusak_ringan">
                              Rusak Ringan
                            </option>
                            <option value="rusak_berat">
                              Rusak Berat
                            </option>
                          </select>
                        </div>

                        {/* STATUS */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Status
                          </label>

                          <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className={selectClass("status")}
                            style={{
                              color: "#0F172A",
                              colorScheme: "light",
                            }}
                          >
                            <option value="aktif">
                              Aktif
                            </option>
                            <option value="nonaktif">
                              Nonaktif
                            </option>
                          </select>
                        </div>
                      </div>
                    </section>

                    {/* =============================================
                        STOK
                    ============================================== */}

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Boxes className="h-5 w-5" />
                          </div>

                          <div>
                            <h2 className="text-base font-bold text-slate-900">
                              Persediaan & Stok
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500">
                              Tentukan jumlah aset dan batas stok.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-3 sm:p-6">

                        {/* JUMLAH */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Jumlah Aset
                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          </label>

                          <input
                            type="number"
                            min="1"
                            name="jumlah"
                            value={form.jumlah}
                            onChange={handleChange}
                            placeholder="0"
                            className={inputClass("jumlah")}
                          />

                          {errors.jumlah && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {errors.jumlah}
                            </p>
                          )}
                        </div>

                        {/* STOK */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Jumlah Stok
                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          </label>

                          <input
                            type="number"
                            min="0"
                            name="jumlahStok"
                            value={form.jumlahStok}
                            onChange={handleChange}
                            placeholder="0"
                            className={inputClass("jumlahStok")}
                          />

                          {errors.jumlahStok && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {errors.jumlahStok}
                            </p>
                          )}
                        </div>

                        {/* MINIMUM */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Stok Minimum
                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          </label>

                          <input
                            type="number"
                            min="0"
                            name="stokMinimum"
                            value={form.stokMinimum}
                            onChange={handleChange}
                            placeholder="0"
                            className={inputClass("stokMinimum")}
                          />

                          {errors.stokMinimum && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {errors.stokMinimum}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* =============================================
                        LOKASI & MASTER
                    ============================================== */}

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <MapPin className="h-5 w-5" />
                          </div>

                          <div>
                            <h2 className="text-base font-bold text-slate-900">
                              Lokasi & Klasifikasi
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500">
                              Tentukan lokasi, gudang, dan kategori aset.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">

                        {/* LOKASI */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Lokasi
                          </label>

                          <div className="relative">
                            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                              type="text"
                              name="lokasi"
                              value={form.lokasi}
                              onChange={handleChange}
                              placeholder="Contoh: Ruang Guru"
                              className={`${inputClass(
                                "lokasi"
                              )} pl-10`}
                            />
                          </div>
                        </div>

                        {/* GUDANG */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Gudang
                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          </label>

                          <div className="relative">
                            <Warehouse className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <select
                              name="gudangId"
                              value={form.gudangId}
                              onChange={handleChange}
                              disabled={loadingMaster}
                              className={`${selectClass(
                                "gudangId"
                              )} pl-10`}
                              style={{
                                color: "#0F172A",
                                colorScheme: "light",
                              }}
                            >
                              <option value="">
                                {loadingMaster
                                  ? "Memuat gudang..."
                                  : "Pilih gudang"}
                              </option>

                              {gudangList.map((item) => (
                                <option
                                  key={item.id}
                                  value={item.id}
                                >
                                  {item.nama}
                                </option>
                              ))}
                            </select>
                          </div>

                          {errors.gudangId && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {errors.gudangId}
                            </p>
                          )}
                        </div>

                        {/* KATEGORI */}
                        <div className="sm:col-span-2">
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Kategori Aset
                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          </label>

                          <div className="relative">
                            <Tags className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <select
                              name="kategoriAsetId"
                              value={form.kategoriAsetId}
                              onChange={handleChange}
                              disabled={loadingMaster}
                              className={`${selectClass(
                                "kategoriAsetId"
                              )} pl-10`}
                              style={{
                                color: "#0F172A",
                                colorScheme: "light",
                              }}
                            >
                              <option value="">
                                {loadingMaster
                                  ? "Memuat kategori..."
                                  : "Pilih kategori aset"}
                              </option>

                              {kategoriList.map((item) => (
                                <option
                                  key={item.id}
                                  value={item.id}
                                >
                                  {item.nama}
                                </option>
                              ))}
                            </select>
                          </div>

                          {errors.kategoriAsetId && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {errors.kategoriAsetId}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* =============================================
                        TANGGAL
                    ============================================== */}

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <CalendarDays className="h-5 w-5" />
                          </div>

                          <div>
                            <h2 className="text-base font-bold text-slate-900">
                              Riwayat Aset
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500">
                              Informasi waktu pembelian dan perawatan aset.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">

                        {/* PEMBELIAN */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Tanggal Pembelian
                          </label>

                          <input
                            type="date"
                            name="tanggalPembelian"
                            value={form.tanggalPembelian}
                            onChange={handleChange}
                            className={inputClass(
                              "tanggalPembelian"
                            )}
                          />

                          {errors.tanggalPembelian && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {errors.tanggalPembelian}
                            </p>
                          )}
                        </div>

                        {/* PERAWATAN */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Perawatan Terakhir
                          </label>

                          <input
                            type="date"
                            name="perawatanTerakhir"
                            value={form.perawatanTerakhir}
                            onChange={handleChange}
                            className={inputClass(
                              "perawatanTerakhir"
                            )}
                          />

                          {errors.perawatanTerakhir && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {errors.perawatanTerakhir}
                            </p>
                          )}
                        </div>

                        {/* RUSAK */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Tanggal Rusak
                          </label>

                          <input
                            type="date"
                            name="tanggalRusak"
                            value={form.tanggalRusak}
                            onChange={handleChange}
                            className={inputClass(
                              "tanggalRusak"
                            )}
                          />

                          {errors.tanggalRusak && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {errors.tanggalRusak}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* =============================================
                        PERBAIKAN
                    ============================================== */}

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                            <Wrench className="h-5 w-5" />
                          </div>

                          <div>
                            <h2 className="text-base font-bold text-slate-900">
                              Kerusakan & Perbaikan
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500">
                              Informasi kerusakan dan status perbaikan aset.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">

                        {/* DESKRIPSI */}
                        <div className="sm:col-span-2">
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Deskripsi Kerusakan
                          </label>

                          <textarea
                            name="deskripsiKerusakan"
                            value={form.deskripsiKerusakan}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Tuliskan deskripsi kerusakan jika ada..."
                            className={`${inputClass(
                              "deskripsiKerusakan"
                            )} resize-none`}
                          />
                        </div>

                        {/* STATUS PERBAIKAN */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Status Perbaikan
                          </label>

                          <select
                            name="statusPerbaikan"
                            value={form.statusPerbaikan}
                            onChange={handleChange}
                            className={selectClass(
                              "statusPerbaikan"
                            )}
                            style={{
                              color: "#0F172A",
                              colorScheme: "light",
                            }}
                          >
                            <option value="">
                              Pilih status perbaikan
                            </option>

                            <option value="belum_diperbaiki">
                              Belum Diperbaiki
                            </option>

                            <option value="sedang_diperbaiki">
                              Sedang Diperbaiki
                            </option>

                            <option value="selesai">
                              Selesai
                            </option>
                          </select>
                        </div>

                        {/* CATATAN */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Catatan
                          </label>

                          <textarea
                            name="catatan"
                            value={form.catatan}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Catatan tambahan..."
                            className={`${inputClass(
                              "catatan"
                            )} resize-none`}
                          />
                        </div>
                      </div>
                    </section>

                    {/* =============================================
                        BUTTON
                    ============================================== */}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={submitting}
                        className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <X className="h-4 w-4" />
                        Reset
                      </button>

                      <button
                        type="submit"
                        disabled={submitting || loadingMaster}
                        className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Simpan Aset
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* =================================================
                      RIGHT - SUMMARY
                  ================================================== */}

                  <aside className="min-w-0 xl:sticky xl:top-6">

                    <div className="space-y-5">

                      {/* =============================================
                          PREVIEW CARD
                      ============================================== */}

                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">

                          <div className="mb-6 flex items-start justify-between gap-3">

                            <div>
                              <p className="text-xs font-medium text-blue-100">
                                Preview Aset
                              </p>

                              <h3 className="mt-1 text-lg font-bold">
                                Ringkasan Aset
                              </h3>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                              <PackageCheck className="h-5 w-5" />
                            </div>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">

                            <p className="text-xs text-blue-100">
                              Nama Aset
                            </p>

                            <p className="mt-1 break-words text-lg font-bold">
                              {form.nama || "Nama aset belum diisi"}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">

                              <span className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-medium">
                                {form.kode || "KODE"}
                              </span>

                              <span className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-medium capitalize">
                                {form.kondisi?.replace(
                                  "_",
                                  " "
                                ) || "Baik"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* DETAIL */}
                        <div className="divide-y divide-slate-100">

                          <div className="flex items-center justify-between gap-4 px-5 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <Boxes className="h-4 w-4 shrink-0 text-slate-400" />

                              <span className="text-sm text-slate-500">
                                Jumlah
                              </span>
                            </div>

                            <span className="shrink-0 text-sm font-bold text-slate-900">
                              {form.jumlah || "0"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4 px-5 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <PackageCheck className="h-4 w-4 shrink-0 text-slate-400" />

                              <span className="text-sm text-slate-500">
                                Stok
                              </span>
                            </div>

                            <span className="shrink-0 text-sm font-bold text-slate-900">
                              {form.jumlahStok || "0"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4 px-5 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <CircleAlert className="h-4 w-4 shrink-0 text-slate-400" />

                              <span className="text-sm text-slate-500">
                                Minimum
                              </span>
                            </div>

                            <span className="shrink-0 text-sm font-bold text-slate-900">
                              {form.stokMinimum || "0"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4 px-5 py-4">
                            <span className="text-sm text-slate-500">
                              Status Stok
                            </span>

                            <span
                              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${stockStatus.className}`}
                            >
                              {stockStatus.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* =============================================
                          MASTER DATA
                      ============================================== */}

                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="mb-4 flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <ClipboardList className="h-4 w-4" />
                          </div>

                          <div>
                            <h3 className="text-sm font-bold text-slate-900">
                              Klasifikasi
                            </h3>

                            <p className="text-xs text-slate-500">
                              Data master terpilih
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">

                          <div>
                            <p className="mb-1 text-xs font-medium text-slate-400">
                              Kategori
                            </p>

                            <p className="break-words text-sm font-semibold text-slate-800">
                              {selectedKategori?.nama ||
                                "Belum dipilih"}
                            </p>
                          </div>

                          <div>
                            <p className="mb-1 text-xs font-medium text-slate-400">
                              Gudang
                            </p>

                            <p className="break-words text-sm font-semibold text-slate-800">
                              {selectedGudang?.nama ||
                                "Belum dipilih"}
                            </p>
                          </div>

                          <div>
                            <p className="mb-1 text-xs font-medium text-slate-400">
                              Lokasi
                            </p>

                            <p className="break-words text-sm font-semibold text-slate-800">
                              {form.lokasi ||
                                "Belum diisi"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* =============================================
                          COMPLETENESS
                      ============================================== */}

                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="mb-4 flex items-center justify-between gap-3">

                          <div>
                            <h3 className="text-sm font-bold text-slate-900">
                              Kelengkapan Data
                            </h3>

                            <p className="mt-0.5 text-xs text-slate-500">
                              Field wajib diisi
                            </p>
                          </div>

                          <span className="text-sm font-bold text-blue-600">
                            {completionPercentage}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-300"
                            style={{
                              width: `${completionPercentage}%`,
                            }}
                          />
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            {completedFields} dari{" "}
                            {requiredFields.length} field
                          </span>

                          {completionPercentage === 100 ? (
                            <span className="flex items-center gap-1 font-semibold text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Lengkap
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 font-semibold text-orange-600">
                              <Info className="h-3.5 w-3.5" />
                              Belum lengkap
                            </span>
                          )}
                        </div>
                      </div>

                      {/* =============================================
                          INFO
                      ============================================== */}

                      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">

                        <div className="flex items-start gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <Info className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-blue-900">
                              Informasi
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-blue-700">
                              Pastikan kode, nama, jumlah, stok,
                              kategori, dan gudang sudah benar
                              sebelum menyimpan data aset.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}