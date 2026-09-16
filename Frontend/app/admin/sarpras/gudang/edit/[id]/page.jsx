"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

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
} from "../../../../../../services/sarpras.service";

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
        text: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-200",
      };
    }

    if (stock <= minimum) {
      return {
        key: "menipis",
        label: "Stok Menipis",
        icon: AlertTriangle,
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
      };
    }

    return {
      key: "aman",
      label: "Stok Aman",
      icon: CircleCheck,
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
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
      <div className="h-screen w-full overflow-hidden bg-[#f8fafc]">
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
              <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Loader2
                    size={30}
                    className="animate-spin"
                  />
                </div>

                <h2 className="mt-5 text-lg font-bold text-slate-900">
                  Memuat Data Aset
                </h2>

                <p className="mt-1.5 text-sm text-slate-500">
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
    <div className="h-screen w-full overflow-hidden bg-[#f8fafc]">
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
                  className="group mb-4 inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-blue-600"
                >
                  <ArrowLeft
                    size={17}
                    className="transition-transform duration-200 group-hover:-translate-x-0.5"
                  />

                  Kembali ke Daftar Aset
                </button>

                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)]">
                      <Package
                        size={27}
                        strokeWidth={1.9}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                          Sarana & Prasarana
                        </p>

                        <span className="max-w-[220px] truncate rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                          ID #{id}
                        </span>
                      </div>

                      <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Edit Aset
                      </h1>

                      <p className="mt-1 text-sm text-slate-500">
                        Perbarui informasi,
                        stok, penempatan,
                        perawatan, dan
                        kondisi aset.
                      </p>
                    </div>
                  </div>

                  <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_3px_12px_rgba(15,23,42,0.04)] xl:block">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Activity size={18} />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Status Data
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-slate-800">
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
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm">
                    <AlertCircle size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-rose-800">
                      Gagal
                    </p>

                    <p className="mt-1 text-sm leading-5 text-rose-700">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                    className="rounded-lg p-1 text-rose-400 transition hover:bg-rose-100 hover:text-rose-700"
                  >
                    <X size={17} />
                  </button>
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-emerald-800">
                      Berhasil
                    </p>

                    <p className="mt-1 text-sm text-emerald-700">
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
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)]">

                    {/* FORM HEADER */}

                    <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-white px-5 py-5 sm:px-7">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_5px_14px_rgba(37,99,235,0.2)]">
                            <Package size={21} />
                          </div>

                          <div>
                            <h2 className="text-sm font-bold text-slate-900">
                              Informasi Aset
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500">
                              Lengkapi informasi
                              aset sesuai data
                              sistem.
                            </p>
                          </div>
                        </div>

                        <span className="hidden rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-600 sm:inline-flex">
                          EDIT DATA
                        </span>
                      </div>
                    </div>

                    {/* FORM BODY */}

                    <div className="space-y-8 p-5 sm:p-7">

                      {/* =================================================
                          INFORMASI DASAR
                      ================================================= */}

                      <section>
                        <div className="mb-5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                            <h3 className="text-sm font-bold text-slate-900">
                              Informasi Dasar
                            </h3>
                          </div>

                          <p className="mt-1.5 text-xs text-slate-400">
                            Identitas utama aset
                            yang terdaftar.
                          </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">

                          {/* NAMA */}

                          <div className="md:col-span-2">
                            <label
                              htmlFor="nama"
                              className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                              Nama Aset
                              <span className="ml-1 text-rose-500">
                                *
                              </span>
                            </label>

                            <div className="relative">
                              <Package
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                              />
                            </div>

                            <div className="mt-1.5 flex justify-end">
                              <span className="text-[10px] text-slate-400">
                                {form.nama.length}
                                /100
                              </span>
                            </div>
                          </div>

                          {/* KODE */}

                          <div>
                            <label
                              htmlFor="kode"
                              className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                              Kode Aset
                              <span className="ml-1 text-rose-500">
                                *
                              </span>
                            </label>

                            <div className="relative">
                              <Hash
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium uppercase text-slate-900 outline-none transition placeholder:normal-case placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                              />
                            </div>

                            <p className="mt-1.5 text-xs text-slate-400">
                              Kode unik identitas
                              aset.
                            </p>
                          </div>

                          {/* KONDISI */}

                          <div>
                            <label
                              htmlFor="kondisi"
                              className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                              Kondisi
                              <span className="ml-1 text-rose-500">
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
                              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
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

                      {/* =================================================
                          STOK
                      ================================================= */}

                      <section className="border-t border-slate-100 pt-7">
                        <div className="mb-5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                            <h3 className="text-sm font-bold text-slate-900">
                              Informasi Stok
                            </h3>
                          </div>

                          <p className="mt-1.5 text-xs text-slate-400">
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
                              className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                              Jumlah
                              <span className="ml-1 text-rose-500">
                                *
                              </span>
                            </label>

                            <div className="relative">
                              <Boxes
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                              />
                            </div>
                          </div>

                          {/* STOK */}

                          <div>
                            <label
                              htmlFor="jumlahStok"
                              className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                              Stok Saat Ini
                              <span className="ml-1 text-rose-500">
                                *
                              </span>
                            </label>

                            <div className="relative">
                              <Boxes
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                              />
                            </div>
                          </div>

                          {/* MINIMUM */}

                          <div>
                            <label
                              htmlFor="stokMinimum"
                              className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                              Stok Minimum
                              <span className="ml-1 text-rose-500">
                                *
                              </span>
                            </label>

                            <div className="relative">
                              <Boxes
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                              />
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* =================================================
                          PENEMPATAN
                      ================================================= */}

                      <section className="border-t border-slate-100 pt-7">
                        <div className="mb-5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                            <h3 className="text-sm font-bold text-slate-900">
                              Penempatan Aset
                            </h3>
                          </div>

                          <p className="mt-1.5 text-xs text-slate-400">
                            Atur kategori, gudang,
                            dan lokasi aset.
                          </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">

                          {/* KATEGORI */}

                          <div>
                            <label
                              htmlFor="kategoriAsetId"
                              className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                              Kategori Aset
                              <span className="ml-1 text-rose-500">
                                *
                              </span>
                            </label>

                            <div className="relative">
                              <Tags
                                size={18}
                                className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400"
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
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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
                              className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                              Gudang
                              <span className="ml-1 text-rose-500">
                                *
                              </span>
                            </label>

                            <div className="relative">
                              <Warehouse
                                size={18}
                                className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400"
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
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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
                              className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                              Lokasi Detail
                            </label>

                            <div className="relative">
                              <MapPin
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                              />
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* =================================================
                          PEMBELIAN & PERAWATAN
                      ================================================= */}

                      <section className="border-t border-slate-100 pt-7">
                        <div className="mb-5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                            <h3 className="text-sm font-bold text-slate-900">
                              Pembelian & Perawatan
                            </h3>
                          </div>

                          <p className="mt-1.5 text-xs text-slate-400">
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
                              className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                              Tanggal Pembelian
                            </label>

                            <div className="relative">
                              <CalendarDays
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                              />
                            </div>
                          </div>

                          {/* PERAWATAN */}

                          <div>
                            <label
                              htmlFor="perawatanTerakhir"
                              className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                              Perawatan Terakhir
                            </label>

                            <div className="relative">
                              <Wrench
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                              />
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* =================================================
                          KERUSAKAN
                      ================================================= */}

                      <section className="border-t border-slate-100 pt-7">
                        <div className="mb-5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                            <h3 className="text-sm font-bold text-slate-900">
                              Kerusakan & Perbaikan
                            </h3>
                          </div>

                          <p className="mt-1.5 text-xs text-slate-400">
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
                              className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                              Tanggal Rusak
                            </label>

                            <div className="relative">
                              <CalendarDays
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                              />
                            </div>
                          </div>

                          {/* STATUS PERBAIKAN */}

                          <div>
                            <label
                              htmlFor="statusPerbaikan"
                              className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                              Status Perbaikan
                            </label>

                            <div className="relative">
                              <Wrench
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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
                              className="mb-2 block text-sm font-semibold text-slate-700"
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
                              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                            />

                            <div className="mt-1.5 flex justify-end">
                              <span className="text-[10px] text-slate-400">
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

                      {/* =================================================
                          CATATAN
                      ================================================= */}

                      <section className="border-t border-slate-100 pt-7">
                        <div className="mb-5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                            <h3 className="text-sm font-bold text-slate-900">
                              Catatan
                            </h3>
                          </div>

                          <p className="mt-1.5 text-xs text-slate-400">
                            Tambahkan informasi
                            tambahan mengenai
                            aset.
                          </p>
                        </div>

                        <div className="relative">
                          <FileText
                            size={18}
                            className="absolute left-3.5 top-3.5 text-slate-400"
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
                            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                          />
                        </div>

                        <div className="mt-1.5 flex justify-end">
                          <span className="text-[10px] text-slate-400">
                            {form.catatan.length}
                            /2000
                          </span>
                        </div>
                      </section>

                      {/* =================================================
                          STATUS
                      ================================================= */}

                      <section className="border-t border-slate-100 pt-7">
                        <div className="mb-5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                            <h3 className="text-sm font-bold text-slate-900">
                              Status Aset
                            </h3>
                          </div>

                          <p className="mt-1.5 text-xs text-slate-400">
                            Tentukan apakah aset
                            masih aktif digunakan.
                          </p>
                        </div>

                        <div className="relative">
                          <Activity
                            size={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <select
                            id="status"
                            name="status"
                            value={form.status}
                            onChange={
                              handleChange
                            }
                            disabled={saving}
                            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

                      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                            <Info size={18} />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-blue-900">
                              Informasi
                            </p>

                            <p className="mt-1 text-xs leading-5 text-blue-700">
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

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                      <button
                        type="button"
                        onClick={
                          handleCancel
                        }
                        disabled={saving}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X size={17} />
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(37,99,235,0.2)] transition hover:bg-blue-700 hover:shadow-[0_8px_20px_rgba(37,99,235,0.28)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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

                {/* =================================================
                    PREVIEW
                ================================================= */}

                <aside className="min-w-0 xl:sticky xl:top-5">
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)]">

                    {/* PREVIEW HEADER */}

                    <div className="border-b border-slate-100 px-5 py-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                            <Package size={19} />
                          </div>

                          <div>
                            <h2 className="text-sm font-bold text-slate-900">
                              Preview Aset
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Ringkasan data aset
                            </p>
                          </div>
                        </div>

                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            form.status ===
                            "aktif"
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />
                      </div>
                    </div>

                    {/* PREVIEW BODY */}

                    <div className="p-5">

                      {/* MAIN CARD */}

                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 p-5">
                        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-400/10 blur-2xl" />

                        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-indigo-400/10 blur-2xl" />

                        <div className="relative">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/10">
                              <Package size={21} />
                            </div>

                            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-blue-100 ring-1 ring-white/10">
                              {form.status ===
                              "aktif"
                                ? "AKTIF"
                                : "NONAKTIF"}
                            </span>
                          </div>

                          <div className="mt-7">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200">
                              Nama Aset
                            </p>

                            <h3 className="mt-1 break-words text-lg font-bold leading-6 text-white">
                              {form.nama ||
                                "Nama Aset"}
                            </h3>

                            <div className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-blue-100 ring-1 ring-white/10">
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
                              className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white ${stockStatus.text}`}
                            >
                              <StockIcon size={18} />
                            </div>

                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
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

                          <span className="text-lg font-bold text-slate-900">
                            {form.jumlahStok ||
                              0}
                          </span>
                        </div>

                        <div className="mt-3">
                          <div className="mb-1.5 flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">
                              Ketersediaan
                            </span>

                            <span className="font-semibold text-slate-500">
                              {Math.round(
                                stockPercentage
                              )}
                              %
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-white">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                stockStatus.key ===
                                "habis"
                                  ? "bg-rose-500"
                                  : stockStatus.key ===
                                    "menipis"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
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
                        <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <Boxes size={15} />
                            </div>

                            <div>
                              <p className="text-[10px] font-medium text-slate-400">
                                Jumlah
                              </p>

                              <p className="text-base font-bold text-slate-900">
                                {form.jumlah ||
                                  0}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                              <PackageCheck size={15} />
                            </div>

                            <div>
                              <p className="text-[10px] font-medium text-slate-400">
                                Minimum
                              </p>

                              <p className="text-base font-bold text-slate-900">
                                {form.stokMinimum ||
                                  0}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* DETAIL */}

                      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60">

                        {/* KATEGORI */}

                        <div className="flex items-center gap-3 border-b border-slate-200/80 px-4 py-3.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                            <Tags size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Kategori
                            </p>

                            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                              {selectedKategori?.nama ||
                                "Belum dipilih"}
                            </p>
                          </div>
                        </div>

                        {/* GUDANG */}

                        <div className="flex items-center gap-3 border-b border-slate-200/80 px-4 py-3.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                            <Warehouse size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Gudang
                            </p>

                            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                              {selectedGudang?.nama ||
                                "Belum dipilih"}
                            </p>
                          </div>
                        </div>

                        {/* LOKASI */}

                        <div className="flex items-center gap-3 border-b border-slate-200/80 px-4 py-3.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                            <MapPin size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Lokasi
                            </p>

                            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                              {form.lokasi ||
                                "Belum diisi"}
                            </p>
                          </div>
                        </div>

                        {/* KONDISI */}

                        <div className="flex items-center gap-3 border-b border-slate-200/80 px-4 py-3.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                            <Activity size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Kondisi
                            </p>

                            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                              {formatCondition(
                                form.kondisi
                              )}
                            </p>
                          </div>
                        </div>

                        {/* PEMBELIAN */}

                        <div className="flex items-center gap-3 border-b border-slate-200/80 px-4 py-3.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                            <CalendarDays size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Pembelian
                            </p>

                            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                              {form.tanggalPembelian ||
                                "Belum diisi"}
                            </p>
                          </div>
                        </div>

                        {/* PERAWATAN */}

                        <div className="flex items-center gap-3 border-b border-slate-200/80 px-4 py-3.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                            <Wrench size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Perawatan
                            </p>

                            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                              {form.perawatanTerakhir ||
                                "Belum diisi"}
                            </p>
                          </div>
                        </div>

                        {/* PERBAIKAN */}

                        <div className="flex items-center gap-3 px-4 py-3.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                            <ClipboardList size={15} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Perbaikan
                            </p>

                            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
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
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                              <FileText size={17} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900">
                                Keterangan
                              </p>

                              {form.deskripsiKerusakan && (
                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                  {
                                    form.deskripsiKerusakan
                                  }
                                </p>
                              )}

                              {form.catatan && (
                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                  {form.catatan}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PREVIEW FOOTER */}

                    <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0 text-emerald-500"
                        />

                        <p className="text-[11px] leading-4 text-slate-500">
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

              <div className="mt-7 border-t border-slate-200/70 pt-5 text-center">
                <p className="text-xs text-slate-400">
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