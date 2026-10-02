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
  Loader2,
  PackageCheck,
  CircleAlert,
  Info,
} from "lucide-react";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import {
  getGudang,
  getKategoriAset,
  createAset,
} from "../../../../../../services/sarpras.service";

// ============================================================
// GLOBAL THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

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

const themeInfoStrongSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_14%,transparent)]";

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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeCard =
  `theme-card ${themeCardShadow}`;

const themeInputBase = `
  theme-input
  w-full rounded-xl px-4 py-3 text-sm
  outline-none transition
  disabled:cursor-not-allowed
  disabled:opacity-60
  ${themeFocus}
`;

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

        setGudangList(
          Array.isArray(gudangData) ? gudangData : []
        );

        setKategoriList(
          Array.isArray(kategoriData) ? kategoriData : []
        );
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
      newErrors.jumlah =
        "Jumlah harus berupa angka minimal 1.";
    }

    if (form.jumlahStok === "") {
      newErrors.jumlahStok =
        "Jumlah stok wajib diisi.";
    } else if (
      !Number.isInteger(Number(form.jumlahStok)) ||
      Number(form.jumlahStok) < 0
    ) {
      newErrors.jumlahStok =
        "Jumlah stok harus berupa angka minimal 0.";
    } else if (
      form.jumlah &&
      Number(form.jumlahStok) > Number(form.jumlah)
    ) {
      newErrors.jumlahStok =
        "Jumlah stok tidak boleh lebih besar dari jumlah aset.";
    }

    if (form.stokMinimum === "") {
      newErrors.stokMinimum =
        "Stok minimum wajib diisi.";
    } else if (
      !Number.isInteger(Number(form.stokMinimum)) ||
      Number(form.stokMinimum) < 0
    ) {
      newErrors.stokMinimum =
        "Stok minimum harus berupa angka minimal 0.";
    }

    if (!form.kategoriAsetId) {
      newErrors.kategoriAsetId =
        "Kategori aset wajib dipilih.";
    }

    if (!form.gudangId) {
      newErrors.gudangId =
        "Gudang wajib dipilih.";
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
      setError(
        "Periksa kembali data yang belum sesuai."
      );
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

        tanggalPembelian:
          form.tanggalPembelian || null,

        perawatanTerakhir:
          form.perawatanTerakhir || null,

        tanggalRusak:
          form.tanggalRusak || null,

        deskripsiKerusakan:
          form.deskripsiKerusakan?.trim() || null,

        statusPerbaikan:
          form.statusPerbaikan?.trim() || null,

        catatan:
          form.catatan?.trim() || null,
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
      (item) =>
        String(item.id) === String(form.gudangId)
    );
  }, [gudangList, form.gudangId]);

  const selectedKategori = useMemo(() => {
    return kategoriList.find(
      (item) =>
        String(item.id) ===
        String(form.kategoriAsetId)
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

  const completedFields =
    requiredFields.filter(Boolean).length;

  const completionPercentage = Math.round(
    (completedFields / requiredFields.length) * 100
  );

  // =========================================================
  // STOCK STATUS
  // =========================================================

  const stockStatus = useMemo(() => {
    const stok = Number(
      form.jumlahStok || 0
    );

    const minimum = Number(
      form.stokMinimum || 0
    );

    if (
      !form.jumlahStok ||
      form.stokMinimum === ""
    ) {
      return {
        label: "Belum ditentukan",
        className: `${themeNeutralSurface} theme-text-muted`,
      };
    }

    if (stok <= minimum) {
      return {
        label: "Stok rendah",
        className: `${themeWarningSurface} theme-warning`,
      };
    }

    return {
      label: "Stok aman",
      className: `${themeSuccessSurface} theme-success`,
    };
  }, [
    form.jumlahStok,
    form.stokMinimum,
  ]);

  // =========================================================
  // REUSABLE CLASS
  // =========================================================

  const inputClass = (name) => `
    ${themeInputBase}
    ${
      errors[name]
        ? `${themeDangerBorder} ring-2 ring-[color-mix(in_srgb,var(--color-text)_10%,transparent)]`
        : `${themeNeutralBorder}`
    }
  `;

  const selectClass = (name) => `
    ${themeInputBase}
    ${
      errors[name]
        ? `${themeDangerBorder} ring-2 ring-[color-mix(in_srgb,var(--color-text)_10%,transparent)]`
        : `${themeNeutralBorder}`
    }
  `;

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="theme-page min-h-screen">
      <div className="flex min-h-screen items-stretch">

        {/* SIDEBAR */}
        <aside className="relative z-40 shrink-0 self-stretch">
          <Sidebar />
        </aside>

        {/* AREA KANAN */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* HEADER */}
          <div className="theme-header relative z-30 shrink-0">
            <Header />
          </div>

          {/* MAIN */}
          <main className="min-w-0 flex-1 overflow-x-hidden">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">

              {/* PAGE HEADER */}
              <div className="mb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex min-w-0 items-center gap-3">

                    <Link
                      href="/admin/sarpras/gudang"
                      className={`
                        flex h-11 w-11 shrink-0 items-center
                        justify-center rounded-xl
                        ${themeNeutralBorder}
                        theme-card
                        theme-text-secondary
                        ${themeSmallShadow}
                        transition
                        hover:border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)]
                        hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]
                        hover:text-[var(--color-primary)]
                      `}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Link>

                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-medium">
                        <span className="theme-text-muted">
                          Sarpras
                        </span>

                        <span className="theme-text-muted">
                          /
                        </span>

                        <span className="theme-text-muted">
                          Gudang & Aset
                        </span>

                        <span className="theme-text-muted">
                          /
                        </span>

                        <span className={themePrimaryText}>
                          Tambah Aset
                        </span>
                      </div>

                      <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                        Tambah Aset
                      </h1>

                      <p className="theme-text-secondary mt-1 text-sm">
                        Tambahkan data aset baru ke dalam sistem
                        sarana dan prasarana.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/admin/sarpras/gudang"
                    className={`
                      inline-flex shrink-0 items-center
                      justify-center gap-2 rounded-xl
                      ${themeNeutralBorder}
                      theme-card
                      theme-text-secondary
                      px-4 py-2.5 text-sm font-semibold
                      ${themeSmallShadow}
                      transition
                      ${themeNeutralHover}
                    `}
                  >
                    <X className="h-4 w-4" />
                    Batal
                  </Link>
                </div>
              </div>

              {/* ALERT ERROR */}
              {error && (
                <div
                  className={`
                    mb-6 flex items-start gap-3 rounded-xl
                    border px-4 py-3.5
                    ${themeDangerBorder}
                    ${themeDangerSurface}
                    theme-danger
                  `}
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      Terjadi kesalahan
                    </p>

                    <p className="theme-text-secondary mt-0.5 text-sm">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="
                      theme-text-muted
                      ml-auto shrink-0 rounded-lg p-1
                      transition
                      hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]
                      hover:text-[var(--color-text)]
                    "
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* ALERT SUCCESS */}
              {success && (
                <div
                  className={`
                    mb-6 flex items-start gap-3 rounded-xl
                    border px-4 py-3.5
                    ${themeSuccessBorder}
                    ${themeSuccessSurface}
                    theme-success
                  `}
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <p className="text-sm font-semibold">
                      Berhasil
                    </p>

                    <p className="theme-text-secondary mt-0.5 text-sm">
                      {success}
                    </p>
                  </div>
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">

                  {/* LEFT */}
                  <div className="min-w-0 space-y-6">

                    {/* INFORMASI UTAMA */}
                    <section
                      className={`
                        overflow-hidden rounded-2xl
                        ${themeCard}
                      `}
                    >
                      <div
                        className={`
                          ${themeDivider}
                          border-b px-5 py-5 sm:px-6
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                              flex h-10 w-10 items-center
                              justify-center rounded-xl
                              ${themePrimarySoft}
                              ${themePrimaryText}
                            `}
                          >
                            <Package className="h-5 w-5" />
                          </div>

                          <div>
                            <h2 className="theme-text text-base font-bold">
                              Informasi Aset
                            </h2>

                            <p className="theme-text-muted mt-0.5 text-xs">
                              Informasi dasar mengenai aset.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">

                        {/* KODE */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Kode Aset
                            <span className="theme-danger ml-1">
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
                            <p className="theme-danger mt-1.5 text-xs">
                              {errors.kode}
                            </p>
                          )}
                        </div>

                        {/* NAMA */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Nama Aset
                            <span className="theme-danger ml-1">
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
                            <p className="theme-danger mt-1.5 text-xs">
                              {errors.nama}
                            </p>
                          )}
                        </div>

                        {/* KONDISI */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Kondisi Aset
                          </label>

                          <select
                            name="kondisi"
                            value={form.kondisi}
                            onChange={handleChange}
                            className={selectClass("kondisi")}
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
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Status
                          </label>

                          <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className={selectClass("status")}
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

                    {/* STOK */}
                    <section
                      className={`
                        overflow-hidden rounded-2xl
                        ${themeCard}
                      `}
                    >
                      <div
                        className={`
                          ${themeDivider}
                          border-b px-5 py-5 sm:px-6
                        `}
                      >
                        <div className="flex items-center gap-3">

                          <div
                            className={`
                              flex h-10 w-10 items-center
                              justify-center rounded-xl
                              ${themeInfoSurface}
                              theme-info
                            `}
                          >
                            <Boxes className="h-5 w-5" />
                          </div>

                          <div>
                            <h2 className="theme-text text-base font-bold">
                              Persediaan & Stok
                            </h2>

                            <p className="theme-text-muted mt-0.5 text-xs">
                              Tentukan jumlah aset dan batas stok.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-3 sm:p-6">

                        {/* JUMLAH */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Jumlah Aset
                            <span className="theme-danger ml-1">
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
                            <p className="theme-danger mt-1.5 text-xs">
                              {errors.jumlah}
                            </p>
                          )}
                        </div>

                        {/* STOK */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Jumlah Stok
                            <span className="theme-danger ml-1">
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
                            <p className="theme-danger mt-1.5 text-xs">
                              {errors.jumlahStok}
                            </p>
                          )}
                        </div>

                        {/* MINIMUM */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Stok Minimum
                            <span className="theme-danger ml-1">
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
                            <p className="theme-danger mt-1.5 text-xs">
                              {errors.stokMinimum}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* LOKASI & MASTER */}
                    <section
                      className={`
                        overflow-hidden rounded-2xl
                        ${themeCard}
                      `}
                    >
                      <div
                        className={`
                          ${themeDivider}
                          border-b px-5 py-5 sm:px-6
                        `}
                      >
                        <div className="flex items-center gap-3">

                          <div
                            className={`
                              flex h-10 w-10 items-center
                              justify-center rounded-xl
                              ${themeSuccessSurface}
                              theme-success
                            `}
                          >
                            <MapPin className="h-5 w-5" />
                          </div>

                          <div>
                            <h2 className="theme-text text-base font-bold">
                              Lokasi & Klasifikasi
                            </h2>

                            <p className="theme-text-muted mt-0.5 text-xs">
                              Tentukan lokasi, gudang, dan kategori aset.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">

                        {/* LOKASI */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Lokasi
                          </label>

                          <div className="relative">
                            <MapPin
                              className="
                                theme-text-muted
                                pointer-events-none
                                absolute left-3.5 top-1/2
                                h-4 w-4 -translate-y-1/2
                              "
                            />

                            <input
                              type="text"
                              name="lokasi"
                              value={form.lokasi}
                              onChange={handleChange}
                              placeholder="Contoh: Ruang Guru"
                              className={`${inputClass("lokasi")} pl-10`}
                            />
                          </div>
                        </div>

                        {/* GUDANG */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Gudang
                            <span className="theme-danger ml-1">
                              *
                            </span>
                          </label>

                          <div className="relative">
                            <Warehouse
                              className="
                                theme-text-muted
                                pointer-events-none
                                absolute left-3.5 top-1/2 z-10
                                h-4 w-4 -translate-y-1/2
                              "
                            />

                            <select
                              name="gudangId"
                              value={form.gudangId}
                              onChange={handleChange}
                              disabled={loadingMaster}
                              className={`${selectClass("gudangId")} pl-10`}
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
                            <p className="theme-danger mt-1.5 text-xs">
                              {errors.gudangId}
                            </p>
                          )}
                        </div>

                        {/* KATEGORI */}
                        <div className="sm:col-span-2">
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Kategori Aset
                            <span className="theme-danger ml-1">
                              *
                            </span>
                          </label>

                          <div className="relative">
                            <Tags
                              className="
                                theme-text-muted
                                pointer-events-none
                                absolute left-3.5 top-1/2 z-10
                                h-4 w-4 -translate-y-1/2
                              "
                            />

                            <select
                              name="kategoriAsetId"
                              value={form.kategoriAsetId}
                              onChange={handleChange}
                              disabled={loadingMaster}
                              className={`${selectClass(
                                "kategoriAsetId"
                              )} pl-10`}
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
                            <p className="theme-danger mt-1.5 text-xs">
                              {errors.kategoriAsetId}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* TANGGAL */}
                    <section
                      className={`
                        overflow-hidden rounded-2xl
                        ${themeCard}
                      `}
                    >
                      <div
                        className={`
                          ${themeDivider}
                          border-b px-5 py-5 sm:px-6
                        `}
                      >
                        <div className="flex items-center gap-3">

                          <div
                            className={`
                              flex h-10 w-10 items-center
                              justify-center rounded-xl
                              ${themePrimarySoft}
                              ${themePrimaryText}
                            `}
                          >
                            <CalendarDays className="h-5 w-5" />
                          </div>

                          <div>
                            <h2 className="theme-text text-base font-bold">
                              Riwayat Aset
                            </h2>

                            <p className="theme-text-muted mt-0.5 text-xs">
                              Informasi waktu pembelian dan perawatan aset.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">

                        {/* PEMBELIAN */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
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
                            <p className="theme-danger mt-1.5 text-xs">
                              {errors.tanggalPembelian}
                            </p>
                          )}
                        </div>

                        {/* PERAWATAN */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
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
                            <p className="theme-danger mt-1.5 text-xs">
                              {errors.perawatanTerakhir}
                            </p>
                          )}
                        </div>

                        {/* RUSAK */}
                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
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
                            <p className="theme-danger mt-1.5 text-xs">
                              {errors.tanggalRusak}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* PERBAIKAN */}
                    <section
                      className={`
                        overflow-hidden rounded-2xl
                        ${themeCard}
                      `}
                    >
                      <div
                        className={`
                          ${themeDivider}
                          border-b px-5 py-5 sm:px-6
                        `}
                      >
                        <div className="flex items-center gap-3">

                          <div
                            className={`
                              flex h-10 w-10 items-center
                              justify-center rounded-xl
                              ${themeWarningSurface}
                              theme-warning
                            `}
                          >
                            <Wrench className="h-5 w-5" />
                          </div>

                          <div>
                            <h2 className="theme-text text-base font-bold">
                              Kerusakan & Perbaikan
                            </h2>

                            <p className="theme-text-muted mt-0.5 text-xs">
                              Informasi kerusakan dan status perbaikan aset.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">

                        {/* DESKRIPSI */}
                        <div className="sm:col-span-2">
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
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
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Status Perbaikan
                          </label>

                          <select
                            name="statusPerbaikan"
                            value={form.statusPerbaikan}
                            onChange={handleChange}
                            className={selectClass(
                              "statusPerbaikan"
                            )}
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
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
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

                    {/* BUTTON */}
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={submitting}
                        className={`
                          inline-flex min-h-[46px]
                          items-center justify-center gap-2
                          rounded-xl
                          ${themeNeutralBorder}
                          theme-card
                          theme-text-secondary
                          px-5 text-sm font-semibold
                          ${themeSmallShadow}
                          transition
                          ${themeNeutralHover}
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        `}
                      >
                        <X className="h-4 w-4" />
                        Reset
                      </button>

                      <button
                        type="submit"
                        disabled={
                          submitting ||
                          loadingMaster
                        }
                        className={`
                          inline-flex min-h-[46px]
                          items-center justify-center gap-2
                          rounded-xl
                          ${themePrimaryGradient}
                          px-6 text-sm font-semibold
                          text-[var(--color-card)]
                          ${themePrimaryShadow}
                          transition
                          hover:brightness-95
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        `}
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

                  {/* RIGHT - SUMMARY */}
                  <aside className="min-w-0 xl:sticky xl:top-6">
                    <div className="space-y-5">

                      {/* PREVIEW */}
                      <div
                        className={`
                          overflow-hidden rounded-2xl
                          ${themeCard}
                        `}
                      >
                        <div
                          className={`
                            ${themePrimaryGradient}
                            p-6 text-[var(--color-card)]
                          `}
                        >
                          <div className="mb-6 flex items-start justify-between gap-3">

                            <div>
                              <p className="text-xs font-medium opacity-75">
                                Preview Aset
                              </p>

                              <h3 className="mt-1 text-lg font-bold">
                                Ringkasan Aset
                              </h3>
                            </div>

                            <div
                              className="
                                flex h-10 w-10 items-center
                                justify-center rounded-xl
                                bg-[color-mix(in_srgb,var(--color-card)_14%,transparent)]
                              "
                            >
                              <PackageCheck className="h-5 w-5" />
                            </div>
                          </div>

                          <div
                            className="
                              rounded-xl
                              border
                              border-[color-mix(in_srgb,var(--color-card)_14%,transparent)]
                              bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)]
                              p-4
                            "
                          >
                            <p className="text-xs opacity-75">
                              Nama Aset
                            </p>

                            <p className="mt-1 break-words text-lg font-bold">
                              {form.nama ||
                                "Nama aset belum diisi"}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">

                              <span
                                className="
                                  rounded-lg
                                  bg-[color-mix(in_srgb,var(--color-card)_14%,transparent)]
                                  px-2.5 py-1 text-xs font-medium
                                "
                              >
                                {form.kode || "KODE"}
                              </span>

                              <span
                                className="
                                  rounded-lg
                                  bg-[color-mix(in_srgb,var(--color-card)_14%,transparent)]
                                  px-2.5 py-1 text-xs font-medium capitalize
                                "
                              >
                                {form.kondisi?.replace(
                                  "_",
                                  " "
                                ) || "Baik"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* DETAIL */}
                        <div
                          className={`
                            divide-y
                            ${themeDivider.replace(
                              "border-",
                              ""
                            )}
                          `}
                        >
                          <div className="flex items-center justify-between gap-4 px-5 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <Boxes className="theme-text-muted h-4 w-4 shrink-0" />

                              <span className="theme-text-secondary text-sm">
                                Jumlah
                              </span>
                            </div>

                            <span className="theme-text shrink-0 text-sm font-bold">
                              {form.jumlah || "0"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4 px-5 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <PackageCheck className="theme-text-muted h-4 w-4 shrink-0" />

                              <span className="theme-text-secondary text-sm">
                                Stok
                              </span>
                            </div>

                            <span className="theme-text shrink-0 text-sm font-bold">
                              {form.jumlahStok || "0"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4 px-5 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <CircleAlert className="theme-text-muted h-4 w-4 shrink-0" />

                              <span className="theme-text-secondary text-sm">
                                Minimum
                              </span>
                            </div>

                            <span className="theme-text shrink-0 text-sm font-bold">
                              {form.stokMinimum || "0"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4 px-5 py-4">
                            <span className="theme-text-secondary text-sm">
                              Status Stok
                            </span>

                            <span
                              className={`
                                rounded-lg px-2.5 py-1
                                text-xs font-semibold
                                ${stockStatus.className}
                              `}
                            >
                              {stockStatus.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* MASTER DATA */}
                      <div
                        className={`
                          rounded-2xl
                          ${themeCard}
                          p-5
                        `}
                      >
                        <div className="mb-4 flex items-center gap-3">

                          <div
                            className={`
                              flex h-9 w-9 items-center
                              justify-center rounded-lg
                              ${themeNeutralSurface}
                              theme-text-secondary
                            `}
                          >
                            <ClipboardList className="h-4 w-4" />
                          </div>

                          <div>
                            <h3 className="theme-text text-sm font-bold">
                              Klasifikasi
                            </h3>

                            <p className="theme-text-muted text-xs">
                              Data master terpilih
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">

                          <div>
                            <p className="theme-text-muted mb-1 text-xs font-medium">
                              Kategori
                            </p>

                            <p className="theme-text-secondary break-words text-sm font-semibold">
                              {selectedKategori?.nama ||
                                "Belum dipilih"}
                            </p>
                          </div>

                          <div>
                            <p className="theme-text-muted mb-1 text-xs font-medium">
                              Gudang
                            </p>

                            <p className="theme-text-secondary break-words text-sm font-semibold">
                              {selectedGudang?.nama ||
                                "Belum dipilih"}
                            </p>
                          </div>

                          <div>
                            <p className="theme-text-muted mb-1 text-xs font-medium">
                              Lokasi
                            </p>

                            <p className="theme-text-secondary break-words text-sm font-semibold">
                              {form.lokasi ||
                                "Belum diisi"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* COMPLETENESS */}
                      <div
                        className={`
                          rounded-2xl
                          ${themeCard}
                          p-5
                        `}
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">

                          <div>
                            <h3 className="theme-text text-sm font-bold">
                              Kelengkapan Data
                            </h3>

                            <p className="theme-text-muted mt-0.5 text-xs">
                              Field wajib diisi
                            </p>
                          </div>

                          <span
                            className={`${themePrimaryText} text-sm font-bold`}
                          >
                            {completionPercentage}%
                          </span>
                        </div>

                        <div
                          className={`
                            h-2 overflow-hidden rounded-full
                            ${themeNeutralSurface}
                          `}
                        >
                          <div
                            className={`
                              h-full rounded-full
                              ${themePrimaryGradient}
                              transition-all duration-300
                            `}
                            style={{
                              width: `${completionPercentage}%`,
                            }}
                          />
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs">

                          <span className="theme-text-secondary">
                            {completedFields} dari{" "}
                            {requiredFields.length} field
                          </span>

                          {completionPercentage === 100 ? (
                            <span className="theme-success flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Lengkap
                            </span>
                          ) : (
                            <span className="theme-warning flex items-center gap-1 font-semibold">
                              <Info className="h-3.5 w-3.5" />
                              Belum lengkap
                            </span>
                          )}
                        </div>
                      </div>

                      {/* INFO */}
                      <div
                        className={`
                          rounded-2xl
                          border
                          ${themeInfoBorder}
                          ${themeInfoSurface}
                          p-5
                        `}
                      >
                        <div className="flex items-start gap-3">

                          <div
                            className={`
                              flex h-9 w-9 shrink-0
                              items-center justify-center
                              rounded-lg
                              ${themeInfoStrongSurface}
                              theme-info
                            `}
                          >
                            <Info className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="theme-info text-sm font-bold">
                              Informasi
                            </h3>

                            <p className="theme-text-secondary mt-1 text-xs leading-5">
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