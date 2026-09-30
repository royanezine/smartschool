"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "../../../../../../components/Header";
import Sidebar from "../../../../../../components/Sidebar";

import {
  ArrowLeft,
  Package,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Hash,
  Boxes,
  Tags,
  Loader2,
  Warehouse,
  Activity,
  CircleCheck,
  AlertTriangle,
  PackageCheck,
  Info,
  CalendarDays,
  Wrench,
  FileText,
  ClipboardList,
} from "lucide-react";

import {
  getAset,
  getGudang,
  getKategoriAset,
  updateAset,
} from "../../../../../../../services/sarpras.service";

/* =========================================================
   GLOBAL THEME HELPERS
========================================================= */

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

const themePrimaryFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]";

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

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

/*
  --color-danger belum dipastikan tersedia di global theme.
  Karena itu background/border danger dibuat dari --color-text,
  sementara warna teks tetap memakai class global theme-danger.
*/
const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus = themePrimaryFocus;

/* =========================================================
   HELPERS
========================================================= */

function getArray(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.result)) {
    return response.result;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.result?.data)) {
    return response.result.data;
  }

  return [];
}

function formatDateForInput(value) {
  if (!value) return "";

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
}

function formatCondition(value) {
  switch (value) {
    case "rusak_ringan":
      return "Rusak Ringan";

    case "rusak_berat":
      return "Rusak Berat";

    default:
      return "Baik";
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function EditAsetPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [saving, setSaving] = useState(false);

  const [gudangList, setGudangList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    nama: "",
    kode: "",
    kondisi: "baik",

    jumlah: "1",
    jumlahStok: "1",
    stokMinimum: "0",

    kategoriAsetId: "",
    gudangId: "",
    lokasi: "",

    status: "aktif",

    tanggalPembelian: "",
    perawatanTerakhir: "",
    tanggalRusak: "",

    deskripsiKerusakan: "",
    statusPerbaikan: "",
    catatan: "",
  });

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    if (!id) return;

    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadingMaster(true);
      setError("");

      const [
        asetResponse,
        gudangResponse,
        kategoriResponse,
      ] = await Promise.all([
        getAset(),
        getGudang(),
        getKategoriAset(),
      ]);

      const asetList = getArray(asetResponse);
      const gudangData = getArray(gudangResponse);
      const kategoriData = getArray(kategoriResponse);

      setGudangList(gudangData);
      setKategoriList(kategoriData);

      const aset = asetList.find(
        (item) => String(item?.id) === String(id)
      );

      if (!aset) {
        setError("Data aset tidak ditemukan.");
        return;
      }

      setForm({
        nama: aset?.nama || "",
        kode: aset?.kode || "",
        kondisi: aset?.kondisi || "baik",

        jumlah: String(aset?.jumlah ?? 1),
        jumlahStok: String(aset?.jumlahStok ?? 0),
        stokMinimum: String(aset?.stokMinimum ?? 0),

        kategoriAsetId:
          aset?.kategoriAsetId ||
          aset?.kategoriAset?.id ||
          "",

        gudangId:
          aset?.gudangId ||
          aset?.gudang?.id ||
          "",

        lokasi: aset?.lokasi || "",

        status: aset?.status || "aktif",

        tanggalPembelian: formatDateForInput(
          aset?.tanggalPembelian
        ),

        perawatanTerakhir: formatDateForInput(
          aset?.perawatanTerakhir
        ),

        tanggalRusak: formatDateForInput(
          aset?.tanggalRusak
        ),

        deskripsiKerusakan:
          aset?.deskripsiKerusakan || "",

        statusPerbaikan:
          aset?.statusPerbaikan || "",

        catatan: aset?.catatan || "",
      });
    } catch (err) {
      console.error(
        "Gagal mengambil data aset:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil data aset."
      );
    } finally {
      setLoading(false);
      setLoadingMaster(false);
    }
  };

  /* =========================================================
     HANDLE CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    if (!form.nama.trim()) {
      return "Nama aset wajib diisi.";
    }

    if (form.nama.trim().length < 3) {
      return "Nama aset minimal 3 karakter.";
    }

    if (!form.kode.trim()) {
      return "Kode aset wajib diisi.";
    }

    if (form.kode.trim().length < 2) {
      return "Kode aset minimal 2 karakter.";
    }

    const jumlah = Number(form.jumlah);
    const jumlahStok = Number(form.jumlahStok);
    const stokMinimum = Number(form.stokMinimum);

    if (!Number.isInteger(jumlah) || jumlah < 1) {
      return "Jumlah minimal 1.";
    }

    if (
      !Number.isInteger(jumlahStok) ||
      jumlahStok < 0
    ) {
      return "Jumlah stok tidak valid.";
    }

    if (
      !Number.isInteger(stokMinimum) ||
      stokMinimum < 0
    ) {
      return "Stok minimum tidak valid.";
    }

    if (jumlahStok > jumlah) {
      return "Jumlah stok tidak boleh lebih besar dari jumlah aset.";
    }

    if (!form.kategoriAsetId) {
      return "Kategori aset wajib dipilih.";
    }

    if (!form.gudangId) {
      return "Gudang wajib dipilih.";
    }

    if (
      form.kondisi === "baik" &&
      form.tanggalRusak
    ) {
      return "Aset dengan kondisi baik tidak seharusnya memiliki tanggal rusak.";
    }

    return "";
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!id) {
      setError("ID aset tidak ditemukan.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        kode: form.kode.trim(),
        nama: form.nama.trim(),

        kondisi: form.kondisi || "baik",

        jumlah: Number(form.jumlah),
        jumlahStok: Number(form.jumlahStok),
        stokMinimum: Number(form.stokMinimum),

        lokasi: form.lokasi.trim() || null,

        kategoriAsetId:
          form.kategoriAsetId,

        gudangId:
          form.gudangId,

        status:
          form.status || "aktif",

        tanggalPembelian:
          form.tanggalPembelian || null,

        perawatanTerakhir:
          form.perawatanTerakhir || null,

        tanggalRusak:
          form.tanggalRusak || null,

        deskripsiKerusakan:
          form.deskripsiKerusakan.trim() || null,

        statusPerbaikan:
          form.statusPerbaikan || null,

        catatan:
          form.catatan.trim() || null,
      };

      await updateAset(id, payload);

      setSuccess(
        "Data aset berhasil diperbarui."
      );

      setTimeout(() => {
        router.push("/admin/sarpras/gudang");
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error(
        "Gagal memperbarui aset:",
        err
      );

      setError(
        err?.message ||
          "Gagal memperbarui data aset."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     CANCEL
  ========================================================= */

  const handleCancel = () => {
    router.push("/admin/sarpras/gudang");
  };

  /* =========================================================
     PREVIEW
  ========================================================= */

  const selectedGudang = useMemo(() => {
    return gudangList.find(
      (item) =>
        String(item?.id) ===
        String(form.gudangId)
    );
  }, [gudangList, form.gudangId]);

  const selectedKategori = useMemo(() => {
    return kategoriList.find(
      (item) =>
        String(item?.id) ===
        String(form.kategoriAsetId)
    );
  }, [
    kategoriList,
    form.kategoriAsetId,
  ]);

  const stockStatus = useMemo(() => {
    const stock =
      Number(form.jumlahStok) || 0;

    const minimum =
      Number(form.stokMinimum) || 0;

    if (stock <= 0) {
      return {
        key: "habis",
        label: "Stok Habis",
        icon: Package,
        text: "theme-danger",
        bg: themeDangerSurface,
        border: themeDangerBorder,
      };
    }

    if (stock <= minimum) {
      return {
        key: "menipis",
        label: "Stok Menipis",
        icon: AlertTriangle,
        text: "theme-warning",
        bg: themeWarningSurface,
        border: themeWarningBorder,
      };
    }

    return {
      key: "aman",
      label: "Stok Aman",
      icon: CircleCheck,
      text: "theme-success",
      bg: themeSuccessSurface,
      border: themeSuccessBorder,
    };
  }, [
    form.jumlahStok,
    form.stokMinimum,
  ]);

  const StockIcon = stockStatus.icon;

  const stockPercentage = useMemo(() => {
    const total =
      Number(form.jumlah) || 0;

    const stock =
      Number(form.jumlahStok) || 0;

    if (total <= 0) return 0;

    return Math.min(
      100,
      Math.max(
        0,
        (stock / total) * 100
      )
    );
  }, [
    form.jumlah,
    form.jumlahStok,
  ]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="theme-page h-screen w-full overflow-hidden">
        <div className="fixed inset-y-0 left-0 z-50">
          <Sidebar
            active="sarpras"
            setActive={() => {}}
            collapsed={isCollapsed}
            setCollapsed={setIsCollapsed}
          />
        </div>

        <div
          className={`flex h-screen min-w-0 flex-col overflow-hidden transition-[margin] duration-300 ${
            isCollapsed
              ? "lg:ml-[88px]"
              : "lg:ml-[260px]"
          }`}
        >
          <div className="shrink-0">
            <Header
              toggleSidebar={() =>
                setIsCollapsed(
                  !isCollapsed
                )
              }
              notifications={[]}
              user={{
                name: "Admin Sekolah",
                email:
                  "admin@smartschool.com",
                avatar: "AD",
              }}
            />
          </div>

          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
            <div className="mx-auto flex min-h-[500px] w-full max-w-7xl items-center justify-center">
              <div
                className={`theme-card w-full max-w-md rounded-3xl border theme-border p-10 text-center ${themeCardShadow}`}
              >
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${themePrimarySoft} ${themePrimaryText}`}
                >
                  <Loader2
                    size={30}
                    className="animate-spin"
                  />
                </div>

                <h2 className="theme-text mt-5 text-lg font-bold">
                  Memuat Data Aset
                </h2>

                <p className="theme-text-muted mt-1.5 text-sm">
                  Mengambil informasi aset
                  dari sistem...
                </p>
              </div>
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
    <div className="theme-page h-screen w-full overflow-hidden">
      {/* SIDEBAR */}

      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar
          active="sarpras"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      {/* CONTENT */}

      <div
        className={`flex h-screen min-w-0 flex-col overflow-hidden transition-[margin] duration-300 ${
          isCollapsed
            ? "lg:ml-[88px]"
            : "lg:ml-[260px]"
        }`}
      >
        {/* HEADER */}

        <div className="shrink-0">
          <Header
            toggleSidebar={() =>
              setIsCollapsed(
                !isCollapsed
              )
            }
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email:
                "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        {/* MAIN */}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 pb-8 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-7">
            <div className="mx-auto w-full max-w-[1380px]">

              {/* PAGE HEADER */}

              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className={`group mb-4 inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium theme-text-secondary transition ${themeNeutralHover} hover:${themePrimaryText}`}
                >
                  <ArrowLeft
                    size={17}
                    className="transition-transform duration-200 group-hover:-translate-x-0.5"
                  />

                  Kembali ke Daftar Aset
                </button>

                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                    >
                      <Package
                        size={27}
                        strokeWidth={1.9}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={`text-xs font-bold uppercase tracking-[0.14em] ${themePrimaryText}`}
                        >
                          Sarana & Prasarana
                        </p>

                        <span
                          className={`theme-card theme-text-muted max-w-[220px] truncate rounded-full border ${themeBorderClass} px-2.5 py-1 text-[10px] font-semibold`}
                        >
                          ID #{id}
                        </span>
                      </div>

                      <h1 className="theme-text mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                        Edit Aset
                      </h1>

                      <p className="theme-text-muted mt-1 text-sm">
                        Perbarui informasi,
                        stok, penempatan,
                        perawatan, dan
                        kondisi aset.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`theme-card hidden rounded-2xl border ${themeBorderClass} px-4 py-3 xl:block`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                      >
                        <Activity size={18} />
                      </div>

                      <div>
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                          Status Data
                        </p>

                        <p className="theme-text mt-0.5 text-sm font-semibold">
                          {form.status ===
                          "aktif"
                            ? "Aset Aktif"
                            : "Aset Nonaktif"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div
                  className={`mb-5 flex items-start gap-3 rounded-2xl border ${themeDangerBorder} ${themeDangerSurface} p-4`}
                >
                  <div
                    className={`theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-xl theme-danger ${themeSmallShadow}`}
                  >
                    <AlertCircle size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="theme-danger text-sm font-bold">
                      Gagal
                    </p>

                    <p className="theme-danger mt-1 text-sm leading-5">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                    className="theme-danger rounded-lg p-1 transition hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]"
                  >
                    <X size={17} />
                  </button>
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div
                  className={`mb-5 flex items-start gap-3 rounded-2xl border ${themeSuccessBorder} ${themeSuccessSurface} p-4`}
                >
                  <div
                    className={`theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-xl theme-success ${themeSmallShadow}`}
                  >
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <p className="theme-success text-sm font-bold">
                      Berhasil
                    </p>

                    <p className="theme-success mt-1 text-sm">
                      {success}
                    </p>
                  </div>
                </div>
              )}

              {/* GRID */}

              <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">

                {/* FORM */}

                <form
                  onSubmit={handleSubmit}
                  className="min-w-0"
                >
                  <div
                    className={`theme-card overflow-hidden rounded-3xl border ${themeBorderClass} ${themeCardShadow}`}
                  >

                    {/* FORM HEADER */}

                    <div
                      className={`border-b ${themeDivider} ${themePrimarySoft} px-5 py-5 sm:px-7`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                          >
                            <Package size={21} />
                          </div>

                          <div>
                            <h2 className="theme-text text-sm font-bold">
                              Informasi Aset
                            </h2>

                            <p className="theme-text-muted mt-0.5 text-xs">
                              Lengkapi informasi
                              aset sesuai data
                              sistem.
                            </p>
                          </div>
                        </div>

                        <span
                          className={`hidden rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} px-3 py-1.5 text-[10px] font-bold sm:inline-flex`}
                        >
                          EDIT DATA
                        </span>
                      </div>
                    </div>

                    {/* FORM BODY */}

                    <div className="space-y-8 p-5 sm:p-7">

                      {/* INFORMASI DASAR */}

                      <section>
                        <div className="mb-5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${themePrimaryGradient}`}
                            />

                            <h3 className="theme-text text-sm font-bold">
                              Informasi Dasar
                            </h3>
                          </div>

                          <p className="theme-text-muted mt-1.5 text-xs">
                            Identitas utama aset
                            yang terdaftar.
                          </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">

                          {/* NAMA */}

                          <div className="md:col-span-2">
                            <label
                              htmlFor="nama"
                              className="theme-text-secondary mb-2 block text-sm font-semibold"
                            >
                              Nama Aset
                              <span className="theme-danger ml-1">
                                *
                              </span>
                            </label>

                            <div className="relative">
                              <Package
                                size={18}
                                className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                              />

                              <input
                                id="nama"
                                name="nama"
                                type="text"
                                value={form.nama}
                                onChange={
                                  handleChange
                                }
                                placeholder="Contoh: Laptop Lenovo ThinkPad"
                                maxLength={100}
                                disabled={saving}
                                className={`theme-input h-12 w-full rounded-xl border ${themeBorderClass} pl-11 pr-4 text-sm font-medium outline-none transition ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                              />
                            </div>

                            <div className="mt-1.5 flex justify-end">
                              <span className="theme-text-muted text-[10px]">
                                {form.nama.length}
                                /100
                              </span>
                            </div>
                          </div>

                          {/* KODE */}

                          <div>
                            <label
                              htmlFor="kode"
                              className="theme-text-secondary mb-2 block text-sm font-semibold"
                            >
                              Kode Aset
                              <span className="theme-danger ml-1">
                                *
                              </span>
                            </label>

                            <div className="relative">
                              <Hash
                                size={18}
                                className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                              />

                              <input
                                id="kode"
                                name="kode"
                                type="text"
                                value={form.kode}
                                onChange={
                                  handleChange
                                }
                                placeholder="Contoh: ELK-001"
                                maxLength={50}
                                disabled={saving}
                                className={`theme-input h-12 w-full rounded-xl border ${themeBorderClass} pl-11 pr-4 text-sm font-medium uppercase outline-none transition ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                              />
                            </div>

                            <p className="theme-text-muted mt-1.5 text-xs">
                              Kode unik identitas
                              aset.
                            </p>
                          </div>

                          {/* KONDISI */}

                          <div>
                            <label
                              htmlFor="kondisi"
                              className="theme-text-secondary mb-2 block text-sm font-semibold"
                            >
                              Kondisi
                              <span className="theme-danger ml-1">
                                *
                              </span>
                            </label>

                            <select
                              id="kondisi"
                              name="kondisi"
                              value={
                                form.kondisi
                              }
                              onChange={
                                handleChange
                              }
                              disabled={saving}
                              className={`theme-input h-12 w-full rounded-xl border ${themeBorderClass} px-4 text-sm font-medium outline-none transition ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
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
                        </div>
                      </section>

                      {/* STOK */}

                      <section
                        className={`border-t ${themeDivider} pt-7`}
                      >
                        <div className="mb-5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${themePrimaryGradient}`}
                            />

                            <h3 className="theme-text text-sm font-bold">
                              Informasi Stok
                            </h3>
                          </div>

                          <p className="theme-text-muted mt-1.5 text-xs">
                            Jumlah keseluruhan,
                            stok tersedia, dan
                            batas minimum.
                          </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-3">

                          {/* JUMLAH */}

                          <div>
                            <label
                              htmlFor="jumlah"
                              className="theme-text-secondary mb-2 block text-sm font-semibold"
                            >
                              Jumlah
                              <span className="theme-danger ml-1">
                                *
                              </span>
                            </label>

                            <div className="relative">
                              <Boxes
                                size={18}
                                className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                              />

                              <input
                                id="jumlah"
                                name="jumlah"
                                type="number"
                                min="1"
                                value={
                                  form.jumlah
                                }
                                onChange={
                                  handleChange
                                }
                                disabled={saving}
                                className={`theme-input h-12 w-full rounded-xl border ${themeBorderClass} pl-11 pr-4 text-sm font-semibold outline-none transition ${themeFocus}`}
                              />
                            </div>
                          </div>

                          {/* STOK */}

                          <div>
                            <label
                              htmlFor="jumlahStok"
                              className="theme-text-secondary mb-2 block text-sm font-semibold"
                            >
                              Stok Saat Ini
                              <span className="theme-danger ml-1">
                                *
                              </span>
                            </label>

                            <div className="relative">
                              <Boxes
                                size={18}
                                className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                              />

                              <input
                                id="jumlahStok"
                                name="jumlahStok"
                                type="number"
                                min="0"
                                value={
                                  form.jumlahStok
                                }
                                onChange={
                                  handleChange
                                }
                                disabled={saving}
                                className={`theme-input h-12 w-full rounded-xl border ${themeBorderClass} pl-11 pr-4 text-sm font-semibold outline-none transition ${themeFocus}`}
                              />
                            </div>
                          </div>

                          {/* MINIMUM */}

                          <div>
                            <label
                              htmlFor="stokMinimum"
                              className="theme-text-secondary mb-2 block text-sm font-semibold"
                            >
                              Stok Minimum
                              <span className="theme-danger ml-1">
                                *
                              </span>
                            </label>

                            <div className="relative">
                              <Boxes
                                size={18}
                                className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                              />

                              <input
                                id="stokMinimum"
                                name="stokMinimum"
                                type="number"
                                min="0"
                                value={
                                  form.stokMinimum
                                }
                                onChange={
                                  handleChange
                                }
                                disabled={saving}
                                className={`theme-input h-12 w-full rounded-xl border ${themeBorderClass} pl-11 pr-4 text-sm font-semibold outline-none transition ${themeFocus}`}
                              />
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* PENEMPATAN */}

                      <section
                        className={`border-t ${themeDivider} pt-7`}
                      >
                        <div className="mb-5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${themePrimaryGradient}`}
                            />

                            <h3 className="theme-text text-sm font-bold">
                              Penempatan Aset
                            </h3>
                          </div>

                          <p className="theme-text-muted mt-1.5 text-xs">
                            Atur kategori, gudang,
                            dan lokasi aset.
                          </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">

                          {/* KATEGORI */}

                          <div>
                            <label
                              htmlFor="kategoriAsetId"
                              className="theme-text-secondary mb-2 block text-sm font-semibold"
                            >
                              Kategori Aset
                              <span className="theme-danger ml-1">
                                *
                              </span>
                            </label>

                            <div className="relative">
                              <Tags
                                size={18}
                                className="theme-text-muted absolute left-3.5 top-1/2 z-10 -translate-y-1/2"
                              />

                              <select
                                id="kategoriAsetId"
                                name="kategoriAsetId"
                                value={
                                  form.kategoriAsetId
                                }
                                onChange={
                                  handleChange
                                }
                                disabled={
                                  loadingMaster ||
                                  saving
                                }
                                className={`theme-input h-12 w-full rounded-xl border ${themeBorderClass} pl-11 pr-4 text-sm font-medium outline-none transition ${themeFocus}`}
                              >
                                <option value="">
                                  {loadingMaster
                                    ? "Memuat kategori..."
                                    : kategoriList.length ===
                                      0
                                    ? "Belum ada kategori"
                                    : "Pilih kategori"}
                                </option>

                                {kategoriList.map(
                                  (kategori) => (
                                    <option
                                      key={
                                        kategori.id
                                      }
                                      value={
                                        kategori.id
                                      }
                                    >
                                      {
                                        kategori.nama
                                      }
                                    </option>
                                  )
                                )}
                              </select>
                            </div>
                          </div>

                          {/* GUDANG */}

                          <div>
                            <label
                              htmlFor="gudangId"
                              className="theme-text-secondary mb-2 block text-sm font-semibold"
                            >
                              Gudang
                              <span className="theme-danger ml-1">
                                *
                              </span>
                            </label>

                            <div className="relative">
                              <Warehouse
                                size={18}
                                className="theme-text-muted absolute left-3.5 top-1/2 z-10 -translate-y-1/2"
                              />

                              <select
                                id="gudangId"
                                name="gudangId"
                                value={
                                  form.gudangId
                                }
                                onChange={
                                  handleChange
                                }
                                disabled={
                                  loadingMaster ||
                                  saving
                                }
                                className={`theme-input h-12 w-full rounded-xl border ${themeBorderClass} pl-11 pr-4 text-sm font-medium outline-none transition ${themeFocus}`}
                              >
                                <option value="">
                                  {loadingMaster
                                    ? "Memuat gudang..."
                                    : gudangList.length ===
                                      0
                                    ? "Belum ada gudang"
                                    : "Pilih gudang"}
                                </option>

                                {gudangList.map(
                                  (gudang) => (
                                    <option
                                      key={
                                        gudang.id
                                      }
                                      value={
                                        gudang.id
                                      }
                                    >
                                      {gudang.nama}
                                      {gudang.lokasi
                                        ? ` — ${gudang.lokasi}`
                                        : ""}
                                    </option>
                                  )
                                )}
                              </select>
                            </div>
                          </div>

                          {/* LOKASI */}

                          <div className="md:col-span-2">
                            <label
                              htmlFor="lokasi"
                              className="theme-text-secondary mb-2 block text-sm font-semibold"
                            >
                              Lokasi Detail
                            </label>

                            <div className="relative">
                              <MapPin
                                size={18}
                                className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                              />

                              <input
                                id="lokasi"
                                name="lokasi"
                                type="text"
                                value={
                                  form.lokasi
                                }
                                onChange={
                                  handleChange
                                }
                                placeholder="Contoh: Ruang Lab RPL"
                                maxLength={100}
                                disabled={saving}
                                className={`theme-input h-12 w-full rounded-xl border ${themeBorderClass} pl-11 pr-4 text-sm font-medium outline-none transition ${themeFocus}`}
                              />
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* PEMBELIAN & PERAWATAN */}

                      <section
                        className={`border-t ${themeDivider} pt-7`}
                      >
                        <div className="mb-5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${themePrimaryGradient}`}
                            />

                            <h3 className="theme-text text-sm font-bold">
                              Pembelian & Perawatan
                            </h3>
                          </div>

                          <p className="theme-text-muted mt-1.5 text-xs">
                            Informasi riwayat
                            pembelian dan
                            perawatan aset.
                          </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">

                          {/* TANGGAL PEMBELIAN */}

                          <div>
                            <label
                              htmlFor="tanggalPembelian"
                              className="theme-text-secondary mb-2 block text-sm font-semibold"
                            >
                              Tanggal Pembelian
                            </label>

                            <div className="relative">
                              <CalendarDays
                                size={18}
                                className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                              />

                              <input
                                id="tanggalPembelian"
                                name="tanggalPembelian"
                                type="date"
                                value={
                                  form.tanggalPembelian
                                }
                                onChange={
                                  handleChange
                                }
                                disabled={saving}
                                className={`theme-input h-12 w-full rounded-xl border ${themeBorderClass} pl-11 pr-4 text-sm font-medium outline-none transition ${themeFocus}`}
                              />
                            </div>
                          </div>

                          {/* PERAWATAN */}

                          <div>
                            <label
                              htmlFor="perawatanTerakhir"
                              className="theme-text-secondary mb-2 block text-sm font-semibold"
                            >
                              Perawatan Terakhir
                            </label>

                            <div className="relative">
                              <Wrench
                                size={18}
                                className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                              />

                              <input
                                id="perawatanTerakhir"
                                name="perawatanTerakhir"
                                type="date"
                                value={
                                  form.perawatanTerakhir
                                }
                                onChange={
                                  handleChange
                                }
                                disabled={saving}
                                className={`theme-input h-12 w-full rounded-xl border ${themeBorderClass} pl-11 pr-4 text-sm font-medium outline-none transition ${themeFocus}`}
                              />
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* KERUSAKAN */}

                      <section
                        className={`border-t ${themeDivider} pt-7`}
                      >
                        <div className="mb-5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${themePrimaryGradient}`}
                            />

                            <h3 className="theme-text text-sm font-bold">
                              Kerusakan & Perbaikan
                            </h3>
                          </div>

                          <p className="theme-text-muted mt-1.5 text-xs">
                            Isi bagian ini jika
                            aset mengalami
                            kerusakan atau sedang
                            diperbaiki.
                          </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">

                          {/* TANGGAL RUSAK */}

                          <div>
                            <label
                              htmlFor="tanggalRusak"
                              className="theme-text-secondary mb-2 block text-sm font-semibold"
                            >
                              Tanggal Rusak
                            </label>

                            <div className="relative">
                              <CalendarDays
                                size={18}
                                className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                              />

                              <input
                                id="tanggalRusak"
                                name="tanggalRusak"
                                type="date"
                                value={
                                  form.tanggalRusak
                                }
                                onChange={
                                  handleChange
                                }
                                disabled={saving}
                                className={`theme-input h-12 w-full rounded-xl border ${themeBorderClass} pl-11 pr-4 text-sm font-medium outline-none transition ${themeFocus}`}
                              />
                            </div>
                          </div>

                          {/* STATUS PERBAIKAN */}

                          <div>
                            <label
                              htmlFor="statusPerbaikan"
                              className="theme-text-secondary mb-2 block text-sm font-semibold"
                            >
                              Status Perbaikan
                            </label>

                            <div className="relative">
                              <Wrench
                                size={18}
                                className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                              />

                              <select
                                id="statusPerbaikan"
                                name="statusPerbaikan"
                                value={
                                  form.statusPerbaikan
                                }
                                onChange={
                                  handleChange
                                }
                                disabled={saving}
                                className={`theme-input h-12 w-full rounded-xl border ${themeBorderClass} pl-11 pr-4 text-sm font-medium outline-none transition ${themeFocus}`}
                              >
                                <option value="">
                                  Tidak ada
                                </option>

                                <option value="belum_diperbaiki">
                                  Belum Diperbaiki
                                </option>

                                <option value="dalam_perbaikan">
                                  Dalam Perbaikan
                                </option>

                                <option value="selesai">
                                  Selesai
                                </option>
                              </select>
                            </div>
                          </div>

                          {/* DESKRIPSI KERUSAKAN */}

                          <div className="md:col-span-2">
                            <label
                              htmlFor="deskripsiKerusakan"
                              className="theme-text-secondary mb-2 block text-sm font-semibold"
                            >
                              Deskripsi Kerusakan
                            </label>

                            <textarea
                              id="deskripsiKerusakan"
                              name="deskripsiKerusakan"
                              value={
                                form.deskripsiKerusakan
                              }
                              onChange={
                                handleChange
                              }
                              rows={4}
                              maxLength={2000}
                              disabled={saving}
                              placeholder="Jelaskan kerusakan aset jika ada..."
                              className={`theme-input w-full resize-none rounded-xl border ${themeBorderClass} px-4 py-3 text-sm font-medium outline-none transition ${themeFocus}`}
                            />

                            <div className="mt-1.5 flex justify-end">
                              <span className="theme-text-muted text-[10px]">
                                {
                                  form
                                    .deskripsiKerusakan
                                    .length
                                }
                                /2000
                              </span>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* CATATAN */}

                      <section
                        className={`border-t ${themeDivider} pt-7`}
                      >
                        <div className="mb-5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${themePrimaryGradient}`}
                            />

                            <h3 className="theme-text text-sm font-bold">
                              Catatan
                            </h3>
                          </div>

                          <p className="theme-text-muted mt-1.5 text-xs">
                            Tambahkan informasi
                            tambahan mengenai
                            aset.
                          </p>
                        </div>

                        <div className="relative">
                          <FileText
                            size={18}
                            className="theme-text-muted absolute left-3.5 top-3.5"
                          />

                          <textarea
                            id="catatan"
                            name="catatan"
                            value={form.catatan}
                            onChange={
                              handleChange
                            }
                            rows={4}
                            maxLength={2000}
                            disabled={saving}
                            placeholder="Contoh: Aset digunakan untuk kegiatan laboratorium..."
                            className={`theme-input w-full resize-none rounded-xl border ${themeBorderClass} py-3 pl-11 pr-4 text-sm font-medium outline-none transition ${themeFocus}`}
                          />
                        </div>

                        <div className="mt-1.5 flex justify-end">
                          <span className="theme-text-muted text-[10px]">
                            {form.catatan.length}
                            /2000
                          </span>
                        </div>
                      </section>

                      {/* STATUS */}

                      <section
                        className={`border-t ${themeDivider} pt-7`}
                      >
                        <div className="mb-5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${themePrimaryGradient}`}
                            />

                            <h3 className="theme-text text-sm font-bold">
                              Status Aset
                            </h3>
                          </div>

                          <p className="theme-text-muted mt-1.5 text-xs">
                            Tentukan apakah aset
                            masih aktif digunakan.
                          </p>
                        </div>

                        <div className="relative">
                          <Activity
                            size={18}
                            className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                          />

                          <select
                            id="status"
                            name="status"
                            value={form.status}
                            onChange={
                              handleChange
                            }
                            disabled={saving}
                            className={`theme-input h-12 w-full rounded-xl border ${themeBorderClass} pl-11 pr-4 text-sm font-medium outline-none transition ${themeFocus}`}
                          >
                            <option value="aktif">
                              Aktif
                            </option>

                            <option value="nonaktif">
                              Nonaktif
                            </option>
                          </select>
                        </div>
                      </section>

                      {/* INFO */}

                      <div
                        className={`rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themePrimaryText} ${themeSmallShadow}`}
                          >
                            <Info size={18} />
                          </div>

                          <div>
                            <p className="theme-info text-sm font-bold">
                              Informasi
                            </p>

                            <p className="theme-info mt-1 text-xs leading-5">
                              Data sistem seperti
                              sekolah, pembuat,
                              waktu pembuatan, dan
                              waktu perubahan
                              dikelola otomatis oleh
                              sistem.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* FOOTER */}

                    <div
                      className={`flex flex-col-reverse gap-3 border-t ${themeDivider} ${themeNeutralSurface} px-5 py-4 sm:flex-row sm:justify-end sm:px-7`}
                    >
                      <button
                        type="button"
                        onClick={
                          handleCancel
                        }
                        disabled={saving}
                        className={`theme-card theme-text-secondary inline-flex h-11 items-center justify-center gap-2 rounded-xl border ${themeBorderClass} px-5 text-sm font-semibold transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <X size={17} />
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-6 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {saving ? (
                          <>
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save size={17} />
                            Simpan Perubahan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                {/* PREVIEW */}

                <aside className="min-w-0 xl:sticky xl:top-5">
                  <div
                    className={`theme-card overflow-hidden rounded-3xl border ${themeBorderClass} ${themeCardShadow}`}
                  >

                    {/* PREVIEW HEADER */}

                    <div
                      className={`border-b ${themeDivider} px-5 py-5`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)]`}
                          >
                            <Package size={19} />
                          </div>

                          <div>
                            <h2 className="theme-text text-sm font-bold">
                              Preview Aset
                            </h2>

                            <p className="theme-text-muted mt-0.5 text-xs">
                              Ringkasan data aset
                            </p>
                          </div>
                        </div>

                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            form.status ===
                            "aktif"
                              ? "bg-[var(--color-success)]"
                              : "bg-[color-mix(in_srgb,var(--color-text)_35%,transparent)]"
                          }`}
                        />
                      </div>
                    </div>

                    {/* PREVIEW BODY */}

                    <div className="p-5">

                      {/* MAIN CARD */}

                      <div
                        className={`relative overflow-hidden rounded-2xl p-5 ${themePrimaryGradient}`}
                      >
                        <div
                          className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full ${themeInfoSurface} blur-2xl`}
                        />

                        <div
                          className={`pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full ${themePrimarySoft} blur-2xl`}
                        />

                        <div className="relative">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-card)_14%,transparent)] text-[var(--color-card)] ring-1 ring-[color-mix(in_srgb,var(--color-card)_15%,transparent)]">
                              <Package size={21} />
                            </div>

                            <span className="rounded-full bg-[color-mix(in_srgb,var(--color-card)_14%,transparent)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-card)] ring-1 ring-[color-mix(in_srgb,var(--color-card)_15%,transparent)]">
                              {form.status ===
                              "aktif"
                                ? "AKTIF"
                                : "NONAKTIF"}
                            </span>
                          </div>

                          <div className="mt-7">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]">
                              Nama Aset
                            </p>

                            <h3 className="mt-1 break-words text-lg font-bold leading-6 text-[var(--color-card)]">
                              {form.nama ||
                                "Nama Aset"}
                            </h3>

                            <div className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-lg bg-[color-mix(in_srgb,var(--color-card)_14%,transparent)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-card)] ring-1 ring-[color-mix(in_srgb,var(--color-card)_15%,transparent)]">
                              <Hash size={13} />

                              <span className="truncate">
                                {form.kode ||
                                  "KODE-ASET"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* STOCK */}

                      <div
                        className={`mt-4 rounded-2xl border p-4 ${stockStatus.bg} ${stockStatus.border}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`theme-card flex h-9 w-9 items-center justify-center rounded-xl ${stockStatus.text}`}
                            >
                              <StockIcon size={18} />
                            </div>

                            <div>
                              <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                                Kondisi Stok
                              </p>

                              <p
                                className={`mt-0.5 text-sm font-bold ${stockStatus.text}`}
                              >
                                {
                                  stockStatus.label
                                }
                              </p>
                            </div>
                          </div>

                          <span className="theme-text text-lg font-bold">
                            {form.jumlahStok ||
                              0}
                          </span>
                        </div>

                        <div className="mt-3">
                          <div className="mb-1.5 flex items-center justify-between text-[10px]">
                            <span className="theme-text-muted">
                              Ketersediaan
                            </span>

                            <span className="theme-text-secondary font-semibold">
                              {Math.round(
                                stockPercentage
                              )}
                              %
                            </span>
                          </div>

                          <div
                            className={`h-2 overflow-hidden rounded-full ${themeNeutralSurface}`}
                          >
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                stockStatus.key ===
                                "habis"
                                  ? "bg-[var(--color-text)]"
                                  : stockStatus.key ===
                                    "menipis"
                                  ? "bg-[var(--color-warning)]"
                                  : "bg-[var(--color-success)]"
                              }`}
                              style={{
                                width: `${stockPercentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* SUMMARY */}

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div
                          className={`theme-card rounded-2xl border ${themeBorderClass} p-3.5`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                            >
                              <Boxes size={15} />
                            </div>

                            <div>
                              <p className="theme-text-muted text-[10px] font-medium">
                                Jumlah
                              </p>

                              <p className="theme-text text-base font-bold">
                                {form.jumlah ||
                                  0}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`theme-card rounded-2xl border ${themeBorderClass} p-3.5`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${themeInfoSurface} theme-info`}
                            >
                              <PackageCheck size={15} />
                            </div>

                            <div>
                              <p className="theme-text-muted text-[10px] font-medium">
                                Minimum
                              </p>

                              <p className="theme-text text-base font-bold">
                                {form.stokMinimum ||
                                  0}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* DETAIL */}

                      <div
                        className={`theme-card mt-4 overflow-hidden rounded-2xl border ${themeBorderClass}`}
                      >

                        {/* KATEGORI */}

                        <div
                          className={`flex items-center gap-3 border-b ${themeDivider} px-4 py-3.5`}
                        >
                          <div
                            className={`theme-card flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themePrimaryText} ${themeSmallShadow}`}
                          >
                            <Tags size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Kategori
                            </p>

                            <p className="theme-text-secondary mt-0.5 truncate text-sm font-semibold">
                              {selectedKategori?.nama ||
                                "Belum dipilih"}
                            </p>
                          </div>
                        </div>

                        {/* GUDANG */}

                        <div
                          className={`flex items-center gap-3 border-b ${themeDivider} px-4 py-3.5`}
                        >
                          <div
                            className={`theme-card flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themePrimaryText} ${themeSmallShadow}`}
                          >
                            <Warehouse size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Gudang
                            </p>

                            <p className="theme-text-secondary mt-0.5 truncate text-sm font-semibold">
                              {selectedGudang?.nama ||
                                "Belum dipilih"}
                            </p>
                          </div>
                        </div>

                        {/* LOKASI */}

                        <div
                          className={`flex items-center gap-3 border-b ${themeDivider} px-4 py-3.5`}
                        >
                          <div
                            className={`theme-card flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themePrimaryText} ${themeSmallShadow}`}
                          >
                            <MapPin size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Lokasi
                            </p>

                            <p className="theme-text-secondary mt-0.5 truncate text-sm font-semibold">
                              {form.lokasi ||
                                "Belum diisi"}
                            </p>
                          </div>
                        </div>

                        {/* KONDISI */}

                        <div
                          className={`flex items-center gap-3 border-b ${themeDivider} px-4 py-3.5`}
                        >
                          <div
                            className={`theme-card flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themePrimaryText} ${themeSmallShadow}`}
                          >
                            <Activity size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Kondisi
                            </p>

                            <p className="theme-text-secondary mt-0.5 truncate text-sm font-semibold">
                              {formatCondition(
                                form.kondisi
                              )}
                            </p>
                          </div>
                        </div>

                        {/* PEMBELIAN */}

                        <div
                          className={`flex items-center gap-3 border-b ${themeDivider} px-4 py-3.5`}
                        >
                          <div
                            className={`theme-card flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themePrimaryText} ${themeSmallShadow}`}
                          >
                            <CalendarDays size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Pembelian
                            </p>

                            <p className="theme-text-secondary mt-0.5 truncate text-sm font-semibold">
                              {form.tanggalPembelian ||
                                "Belum diisi"}
                            </p>
                          </div>
                        </div>

                        {/* PERAWATAN */}

                        <div
                          className={`flex items-center gap-3 border-b ${themeDivider} px-4 py-3.5`}
                        >
                          <div
                            className={`theme-card flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themePrimaryText} ${themeSmallShadow}`}
                          >
                            <Wrench size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Perawatan
                            </p>

                            <p className="theme-text-secondary mt-0.5 truncate text-sm font-semibold">
                              {form.perawatanTerakhir ||
                                "Belum diisi"}
                            </p>
                          </div>
                        </div>

                        {/* PERBAIKAN */}

                        <div className="flex items-center gap-3 px-4 py-3.5">
                          <div
                            className={`theme-card flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themePrimaryText} ${themeSmallShadow}`}
                          >
                            <ClipboardList size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Perbaikan
                            </p>

                            <p className="theme-text-secondary mt-0.5 truncate text-sm font-semibold">
                              {form.statusPerbaikan
                                ? form.statusPerbaikan
                                    .replaceAll(
                                      "_",
                                      " "
                                    )
                                : "Tidak ada"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* DAMAGE INFO */}

                      {(form.deskripsiKerusakan ||
                        form.catatan) && (
                        <div
                          className={`theme-card mt-4 rounded-2xl border ${themeBorderClass} p-4`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themeNeutralSurface} theme-text-secondary`}
                            >
                              <FileText size={17} />
                            </div>

                            <div className="min-w-0">
                              <p className="theme-text text-xs font-bold">
                                Keterangan
                              </p>

                              {form.deskripsiKerusakan && (
                                <p className="theme-text-muted mt-2 text-xs leading-5">
                                  {
                                    form.deskripsiKerusakan
                                  }
                                </p>
                              )}

                              {form.catatan && (
                                <p className="theme-text-muted mt-2 text-xs leading-5">
                                  {form.catatan}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PREVIEW FOOTER */}

                    <div
                      className={`border-t ${themeDivider} ${themeNeutralSurface} px-5 py-4`}
                    >
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2
                          size={16}
                          className="theme-success mt-0.5 shrink-0"
                        />

                        <p className="theme-text-muted text-[11px] leading-4">
                          Preview akan mengikuti
                          perubahan data secara
                          otomatis sebelum kamu
                          menyimpan.
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              {/* FOOTER */}

              <div
                className={`mt-7 border-t ${themeDivider} pt-5 text-center`}
              >
                <p className="theme-text-muted text-xs">
                  © 2026 SmartSchool • Modul
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

/* =========================================================
   GLOBAL THEME BORDER
========================================================= */

const themeBorderClass = "theme-border";