"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import {
  Building,
  ArrowLeft,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Edit,
  Image as ImageIcon,
  Link2,
  Hash,
  Eye,
  Sparkles,
} from "lucide-react";

import {
  getGedung,
  updateGedung,
} from "../../../../../../services/infrastruktur.service";

export default function EditGedungPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [imageError, setImageError] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    kode: "",
    fotoUrl: "",
  });

  const BACK_URL = "/admin/sarpras/gedung";

  /* =========================================================
     FETCH GEDUNG DETAIL
  ========================================================= */

  useEffect(() => {
    const fetchGedungDetail = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await getGedung();

        const result =
          response?.data ??
          response?.result ??
          response ??
          [];

        const gedungList = Array.isArray(result)
          ? result
          : [];

        const data = gedungList.find(
          (item) =>
            String(item?.id) === String(id)
        );

        if (!data) {
          setErrorMessage(
            "Data gedung tidak ditemukan."
          );
          return;
        }

        /*
         * Backend Prisma menggunakan:
         * fotoGedung
         *
         * FE tetap menggunakan:
         * fotoUrl
         *
         * Jadi kita mapping di sini.
         */
        const fotoGedung =
          data?.fotoGedung ??
          data?.fotoUrl ??
          "";

        setFormData({
          nama: data?.nama ?? "",
          kode: data?.kode ?? "",
          fotoUrl:
            typeof fotoGedung === "string"
              ? fotoGedung.trim()
              : "",
        });

        setImageError(false);
      } catch (error) {
        console.error(
          "Error fetch detail gedung:",
          error
        );

        setErrorMessage(
          error?.message ||
            "Gagal mengambil data gedung."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchGedungDetail();
  }, [id]);

  /* =========================================================
     HANDLE CHANGE
  ========================================================= */

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "fotoUrl") {
      setImageError(false);
    }

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    if (errorMessage) {
      setErrorMessage("");
    }

    if (saved) {
      setSaved(false);
    }
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validate = () => {
    const newErrors = {};

    const nama = formData.nama.trim();
    const kode = formData.kode.trim();
    const fotoUrl = formData.fotoUrl.trim();

    if (!nama) {
      newErrors.nama =
        "Nama gedung wajib diisi";
    } else if (nama.length > 100) {
      newErrors.nama =
        "Nama gedung maksimal 100 karakter";
    }

    if (kode.length > 50) {
      newErrors.kode =
        "Kode gedung maksimal 50 karakter";
    }

    if (fotoUrl) {
      try {
        new URL(fotoUrl);
      } catch {
        newErrors.fotoUrl =
          "Foto URL harus berupa URL yang valid";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    if (!id) {
      setErrorMessage(
        "ID gedung tidak ditemukan."
      );
      return;
    }

    try {
      setIsSaving(true);
      setSaved(false);
      setErrorMessage("");

      const payload = {
        nama: formData.nama.trim(),

        kode: formData.kode.trim()
          ? formData.kode.trim()
          : null,

        /*
         * Tetap kirim fotoUrl.
         * Backend controller yang mengubah
         * fotoUrl -> fotoGedung.
         */
        fotoUrl: formData.fotoUrl.trim()
          ? formData.fotoUrl.trim()
          : null,
      };

      await updateGedung(id, payload);

      setSaved(true);

      setTimeout(() => {
        router.push(BACK_URL);
      }, 1200);
    } catch (error) {
      console.error(
        "Error update gedung:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Gedung gagal diperbarui. Silakan coba lagi."
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (isLoading) {
    return (
      <div className="h-screen overflow-hidden bg-[#f8fafc]">

        {/* SIDEBAR */}
        <div className="fixed inset-y-0 left-0 z-50 h-screen">
          <Sidebar
            active="sarpras"
            setActive={() => {}}
            collapsed={isCollapsed}
            setCollapsed={setIsCollapsed}
          />
        </div>

        {/* CONTENT */}
        <div
          className={`flex h-screen min-w-0 flex-col transition-[margin] duration-300 ${
            isCollapsed
              ? "lg:ml-[88px]"
              : "lg:ml-[260px]"
          }`}
        >
          <div className="shrink-0">
            <Header
              toggleSidebar={() =>
                setIsCollapsed(!isCollapsed)
              }
              notifications={[]}
              user={{
                name: "Admin Sekolah",
                email: "admin@smartschool.com",
                avatar: "AD",
              }}
            />
          </div>

          <main className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-6">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_4px_20px_rgba(15,23,42,0.05)]">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <div className="h-6 w-6 animate-spin rounded-full border-[2.5px] border-blue-100 border-t-blue-600" />
              </div>

              <h2 className="mt-5 text-sm font-semibold text-slate-800">
                Memuat data gedung
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Mohon tunggu sebentar...
              </p>

            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <div className="h-screen overflow-hidden bg-[#f8fafc]">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <div className="fixed inset-y-0 left-0 z-50 h-screen">
        <Sidebar
          active="sarpras"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      {/* =====================================================
          PAGE AREA
      ===================================================== */}

      <div
        className={`flex h-screen min-w-0 flex-col transition-[margin] duration-300 ${
          isCollapsed
            ? "lg:ml-[88px]"
            : "lg:ml-[260px]"
        }`}
      >

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="z-40 shrink-0">
          <Header
            toggleSidebar={() =>
              setIsCollapsed(!isCollapsed)
            }
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">

          <div className="min-h-full p-3 sm:p-5 lg:p-6 xl:p-7">

            <div className="mx-auto w-full max-w-[1250px] space-y-5">

              {/* =================================================
                  BACK / BREADCRUMB
              ================================================= */}

              <div className="flex items-center justify-between">

                <button
                  type="button"
                  onClick={() =>
                    router.push(BACK_URL)
                  }
                  className="group inline-flex items-center gap-2 rounded-lg py-1 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
                >
                  <ArrowLeft
                    size={17}
                    strokeWidth={2}
                    className="transition-transform duration-200 group-hover:-translate-x-1"
                  />

                  <span>
                    Kembali ke Daftar Gedung
                  </span>
                </button>

                <div className="hidden items-center gap-2 text-[11px] text-slate-400 sm:flex">
                  <span>Sarpras</span>
                  <span>/</span>
                  <span>Gedung</span>
                  <span>/</span>

                  <span className="font-medium text-slate-500">
                    Edit
                  </span>
                </div>

              </div>

              {/* =================================================
                  HEADER CARD
              ================================================= */}

              <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_15px_rgba(15,23,42,0.05)]">

                <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-blue-50/80 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-20 right-48 h-40 w-40 rounded-full bg-indigo-50/50 blur-3xl" />

                <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:px-7 lg:py-6">

                  {/* LEFT */}

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.20)] sm:h-14 sm:w-14">
                      <Edit
                        size={23}
                        strokeWidth={1.9}
                      />
                    </div>

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h1 className="text-xl font-bold tracking-[-0.025em] text-slate-900 sm:text-2xl">
                          Edit Gedung
                        </h1>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                          ID #{id}
                        </span>

                      </div>

                      <div className="mt-1.5 flex items-center gap-2">

                        <Building
                          size={14}
                          className="shrink-0 text-blue-500"
                        />

                        <p className="text-xs leading-5 text-slate-500 sm:text-sm">
                          Perbarui informasi gedung
                          yang tersimpan di
                          SmartSchool.
                        </p>

                      </div>

                    </div>
                  </div>

                  {/* RIGHT ACTION */}

                  <div className="flex w-full gap-2 lg:w-auto">

                    <button
                      type="button"
                      onClick={() =>
                        router.push(BACK_URL)
                      }
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98] lg:h-11 lg:flex-none lg:px-5"
                    >
                      <X size={16} />
                      Batal
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSaving}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(15,23,42,0.14)] transition-all hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 lg:h-11 lg:flex-none lg:px-5"
                    >
                      <Save
                        size={16}
                        strokeWidth={2.2}
                      />

                      {isSaving
                        ? "Menyimpan..."
                        : "Simpan Perubahan"}
                    </button>

                  </div>

                </div>
              </section>

              {/* =================================================
                  ERROR
              ================================================= */}

              {errorMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-rose-600 shadow-sm">
                    <AlertCircle size={17} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-sm font-semibold text-rose-800">
                      Terjadi kesalahan
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-rose-700">
                      {errorMessage}
                    </p>

                  </div>

                </div>
              )}

              {/* =================================================
                  SUCCESS
              ================================================= */}

              {saved && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                    <CheckCircle size={17} />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-emerald-800">
                      Perubahan berhasil disimpan
                    </p>

                    <p className="mt-0.5 text-xs text-emerald-700">
                      Mengalihkan kembali ke daftar gedung...
                    </p>

                  </div>

                </div>
              )}

              {/* =================================================
                  CONTENT GRID
              ================================================= */}

              <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">

                {/* =================================================
                    FORM
                ================================================= */}

                <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_15px_rgba(15,23,42,0.04)]">

                  {/* FORM HEADER */}

                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Building
                          size={17}
                          strokeWidth={1.9}
                        />
                      </div>

                      <div className="min-w-0">

                        <h2 className="text-sm font-semibold text-slate-800">
                          Informasi Gedung
                        </h2>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Perbarui data dasar gedung
                        </p>

                      </div>

                    </div>

                    <span className="hidden rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-400 sm:block">
                      Data Gedung
                    </span>

                  </div>

                  {/* FORM */}

                  <form
                    onSubmit={handleSubmit}
                    className="p-5 sm:p-6"
                  >

                    <div className="space-y-5">

                      {/* =================================================
                          NAMA
                      ================================================= */}

                      <div>

                        <label
                          htmlFor="nama"
                          className="mb-2 block text-xs font-semibold text-slate-700"
                        >
                          Nama Gedung{" "}
                          <span className="text-rose-500">
                            *
                          </span>
                        </label>

                        <div className="relative">

                          <div className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center text-slate-400">
                            <Building size={16} />
                          </div>

                          <input
                            id="nama"
                            type="text"
                            value={formData.nama}
                            onChange={(e) =>
                              handleChange(
                                "nama",
                                e.target.value
                              )
                            }
                            maxLength={100}
                            placeholder="Contoh: Gedung Utama"
                            autoComplete="off"
                            style={{
                              color: "#0f172a",
                              WebkitTextFillColor:
                                "#0f172a",
                            }}
                            className={`w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition-all placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 ${
                              errors.nama
                                ? "border-rose-300 focus:border-rose-400"
                                : "border-slate-200 focus:border-blue-500"
                            }`}
                          />

                        </div>

                        <div className="mt-1.5 flex min-h-[17px] items-center justify-between">

                          {errors.nama ? (
                            <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600">
                              <AlertCircle size={12} />
                              {errors.nama}
                            </p>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              Gunakan nama gedung yang mudah dikenali.
                            </span>
                          )}

                          <span className="ml-auto text-[10px] text-slate-400">
                            {formData.nama.length}/100
                          </span>

                        </div>

                      </div>

                      {/* =================================================
                          KODE
                      ================================================= */}

                      <div>

                        <label
                          htmlFor="kode"
                          className="mb-2 block text-xs font-semibold text-slate-700"
                        >
                          Kode Gedung
                        </label>

                        <div className="relative">

                          <div className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center text-slate-400">
                            <Hash size={16} />
                          </div>

                          <input
                            id="kode"
                            type="text"
                            value={formData.kode}
                            onChange={(e) =>
                              handleChange(
                                "kode",
                                e.target.value
                              )
                            }
                            maxLength={50}
                            placeholder="Contoh: A, B, GDG-01"
                            autoComplete="off"
                            style={{
                              color: "#0f172a",
                              WebkitTextFillColor:
                                "#0f172a",
                            }}
                            className={`w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition-all placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 ${
                              errors.kode
                                ? "border-rose-300 focus:border-rose-400"
                                : "border-slate-200 focus:border-blue-500"
                            }`}
                          />

                        </div>

                        <div className="mt-1.5 flex min-h-[17px] items-center justify-between">

                          {errors.kode ? (
                            <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600">
                              <AlertCircle size={12} />
                              {errors.kode}
                            </p>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              Kode bersifat opsional.
                            </span>
                          )}

                          <span className="ml-auto text-[10px] text-slate-400">
                            {formData.kode.length}/50
                          </span>

                        </div>

                      </div>

                      {/* =================================================
                          FOTO
                      ================================================= */}

                      <div>

                        <div className="mb-2 flex items-center justify-between">

                          <label
                            htmlFor="fotoUrl"
                            className="block text-xs font-semibold text-slate-700"
                          >
                            URL Foto Gedung
                          </label>

                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-slate-500">
                            OPSIONAL
                          </span>

                        </div>

                        <div className="relative">

                          <div className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center text-slate-400">
                            <Link2 size={16} />
                          </div>

                          <input
                            id="fotoUrl"
                            type="url"
                            value={formData.fotoUrl}
                            onChange={(e) =>
                              handleChange(
                                "fotoUrl",
                                e.target.value
                              )
                            }
                            placeholder="https://contoh.com/foto-gedung.jpg"
                            autoComplete="off"
                            style={{
                              color: "#0f172a",
                              WebkitTextFillColor:
                                "#0f172a",
                            }}
                            className={`w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition-all placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 ${
                              errors.fotoUrl
                                ? "border-rose-300 focus:border-rose-400"
                                : "border-slate-200 focus:border-blue-500"
                            }`}
                          />

                        </div>

                        {errors.fotoUrl ? (
                          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-rose-600">
                            <AlertCircle size={12} />
                            {errors.fotoUrl}
                          </p>
                        ) : (
                          <p className="mt-1.5 text-[11px] leading-5 text-slate-400">
                            Masukkan URL gambar untuk
                            menampilkan foto gedung pada
                            preview.
                          </p>
                        )}

                      </div>

                      {/* =================================================
                          INFORMATION
                      ================================================= */}

                      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">

                        <div className="flex items-start gap-3">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                            <Info size={15} />
                          </div>

                          <div className="min-w-0">

                            <p className="text-xs font-semibold text-blue-800">
                              Informasi Pengelolaan
                            </p>

                            <p className="mt-1 text-[11px] leading-5 text-blue-700">
                              Data yang dapat diperbarui
                              pada halaman ini adalah
                              nama, kode, dan URL foto.
                              Pengelolaan lantai dilakukan
                              melalui fitur terpisah.
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        FORM FOOTER
                    ================================================= */}

                    <div className="mt-6 flex flex-col-reverse gap-2.5 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">

                      <button
                        type="button"
                        onClick={() =>
                          router.push(BACK_URL)
                        }
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98]"
                      >
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(15,23,42,0.14)] transition-all hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Save
                          size={17}
                          strokeWidth={2.2}
                        />

                        {isSaving
                          ? "Menyimpan..."
                          : "Simpan Perubahan"}
                      </button>

                    </div>
                  </form>
                </section>

                {/* =================================================
                    PREVIEW
                ================================================= */}

                <aside className="min-w-0">

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_15px_rgba(15,23,42,0.04)] xl:sticky xl:top-5">

                    {/* PREVIEW HEADER */}

                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                          <Eye size={16} />
                        </div>

                        <div>

                          <h2 className="text-sm font-semibold text-slate-800">
                            Preview
                          </h2>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            Tampilan data gedung
                          </p>

                        </div>

                      </div>

                      <Sparkles
                        size={15}
                        className="text-blue-500"
                      />

                    </div>

                    {/* IMAGE */}

                    <div className="p-4">

                      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-slate-100">

                        {formData.fotoUrl &&
                        !imageError ? (
                          <>
                            <img
                              src={formData.fotoUrl}
                              alt={
                                formData.nama ||
                                "Preview gedung"
                              }
                              className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                              onError={() =>
                                setImageError(true)
                              }
                            />

                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />

                            <div className="absolute bottom-3 left-3">

                              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-slate-900/70 px-2.5 py-1.5 text-[9px] font-semibold text-white backdrop-blur-md">
                                <ImageIcon size={11} />
                                Foto Gedung
                              </span>

                            </div>
                          </>
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center px-5 text-center">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm">
                              <Building size={23} />
                            </div>

                            <p className="mt-3 text-xs font-semibold text-slate-500">
                              {imageError
                                ? "Foto tidak dapat ditampilkan"
                                : "Belum ada foto gedung"}
                            </p>

                            <p className="mt-1 max-w-[220px] text-[10px] leading-4 text-slate-400">
                              {imageError
                                ? "Periksa kembali URL foto yang dimasukkan."
                                : "Tambahkan URL foto pada form untuk melihat preview."}
                            </p>

                          </div>
                        )}

                      </div>
                    </div>

                    {/* PREVIEW INFORMATION */}

                    <div className="px-5 pb-5">

                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">

                        {/* NAME */}

                        <div className="flex items-start gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <Building size={16} />
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">
                              Nama Gedung
                            </p>

                            <p className="mt-1 break-words text-sm font-bold text-slate-800">
                              {formData.nama ||
                                "Nama Gedung"}
                            </p>

                          </div>

                        </div>

                        <div className="my-4 h-px bg-slate-200/70" />

                        {/* CODE */}

                        <div className="flex items-center justify-between gap-4">

                          <div className="flex items-center gap-2.5">

                            <Hash
                              size={14}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="text-xs text-slate-500">
                              Kode
                            </span>

                          </div>

                          <span className="max-w-[150px] truncate rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono text-[10px] font-semibold text-slate-600">
                            {formData.kode || "—"}
                          </span>

                        </div>

                        {/* ID */}

                        <div className="mt-3 flex items-center justify-between gap-4">

                          <div className="flex items-center gap-2.5">

                            <Info
                              size={14}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="text-xs text-slate-500">
                              ID Gedung
                            </span>

                          </div>

                          <span className="max-w-[160px] truncate font-mono text-[10px] font-semibold text-slate-600">
                            #{id}
                          </span>

                        </div>

                      </div>
                    </div>

                    {/* PREVIEW FOOTER */}

                    <div className="border-t border-slate-100 bg-white px-5 py-4">

                      <div className="flex items-start gap-2.5">

                        <CheckCircle
                          size={14}
                          className="mt-0.5 shrink-0 text-emerald-500"
                        />

                        <p className="text-[10px] leading-4 text-slate-400">
                          Preview diperbarui secara
                          otomatis mengikuti data
                          yang kamu masukkan.
                        </p>

                      </div>

                    </div>

                  </div>
                </aside>

              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="border-t border-slate-200/70 py-2 text-center">

                <p className="text-[10px] text-slate-400 sm:text-xs">
                  © 2026 SmartSchool • Edit Gedung •
                  Sarana & Prasarana
                </p>

              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}