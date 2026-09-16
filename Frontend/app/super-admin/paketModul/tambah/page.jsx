"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import {
  Package,
  Layers,
  X,
  Check,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  Wallet,
  CalendarDays,
  ShieldCheck,
  Info,
  CircleCheck,
} from "lucide-react";

import {
  getFitur,
  createPaket,
} from "../../../../services/paket.service";

/* =========================================================
   ICON MAP
========================================================= */

const ICON_MAP = {
  akademik: Layers,
  keuangan: Wallet,
  kepegawaian: Layers,
  perpustakaan: Layers,
  presensi: Layers,
  ppdb: Layers,
  komunikasi: Layers,
  inventaris: Layers,
};

/* =========================================================
   HELPER
========================================================= */

function getFeatureId(item) {
  if (!item) return null;

  return (
    item.id ??
    item.fiturId ??
    item.fitur_id ??
    item.modulId ??
    item.modul_id ??
    item.kode ??
    item.slug ??
    null
  );
}

function getFeatureName(item) {
  if (!item) return "Fitur";

  return (
    item.nama ??
    item.namaFitur ??
    item.nama_fitur ??
    item.namaModul ??
    item.nama_modul ??
    item.name ??
    item.label ??
    item.judul ??
    "Fitur"
  );
}

function getFeatureDescription(item) {
  if (!item) return "";

  return (
    item.deskripsi ??
    item.description ??
    item.keterangan ??
    ""
  );
}

function normalizeFeature(item, index) {
  const id =
    getFeatureId(item) ??
    `fitur-${index}`;

  const nama =
    getFeatureName(item);

  const kode = String(
    item?.kode ?? ""
  ).toLowerCase();

  const iconKey = String(nama)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z]/g, "");

  const Icon =
    ICON_MAP[kode] ||
    ICON_MAP[iconKey] ||
    Layers;

  return {
    ...item,
    id,
    nama,
    kode,
    deskripsi:
      getFeatureDescription(item),
    icon: Icon,
  };
}

function getResponseData(response) {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (
    Array.isArray(
      response.data?.data
    )
  ) {
    return response.data.data;
  }

  if (Array.isArray(response.result)) {
    return response.result;
  }

  if (Array.isArray(response.results)) {
    return response.results;
  }

  return [];
}

function formatRupiah(value) {
  const number = Number(value || 0);

  if (number === 0) {
    return "Gratis";
  }

  return `Rp${number.toLocaleString(
    "id-ID"
  )}`;
}

/* =========================================================
   DURASI
   BACKEND:
   Paket.durasi = Int

   FE:
   bulan  = 30 hari
   tahun  = 365 hari
   trial  = 14 hari
========================================================= */

function getDurasiFromSiklus(value) {
  switch (value) {
    case "bulan":
      return 30;

    case "tahun":
      return 365;

    case "14 hari":
      return 14;

    default:
      return 30;
  }
}

function getSiklusFromDurasi(durasi) {
  const value = Number(durasi);

  if (value === 365) {
    return "tahun";
  }

  if (value === 14) {
    return "14 hari";
  }

  return "bulan";
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function TambahPaketPage() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const isDuplikat =
    searchParams.get("duplikat") ===
    "true";

  /* =======================================================
     STATE
  ======================================================= */

  const [activeMenu, setActiveMenu] =
    useState("paket-modul");

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [fiturList, setFiturList] =
    useState([]);

  const [loadingFitur, setLoadingFitur] =
    useState(true);

  const [nama, setNama] =
    useState("");

  const [deskripsi, setDeskripsi] =
    useState("");

  const [harga, setHarga] =
    useState(0);

  const [siklus, setSiklus] =
    useState("bulan");

  const [status, setStatus] =
    useState("aktif");

  /*
    Yang disimpan adalah ID MODUL.

    Contoh:
    [
      "uuid-modul-akademik",
      "uuid-modul-keuangan"
    ]
  */
  const [fiturTerpilih, setFiturTerpilih] =
    useState([]);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const notifications = [
    {
      id: 1,
      title: "Pembaruan Sistem v2.0",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Pengingat: Backup Data",
      desc: "Dikirim 1 hari lalu",
      read: false,
    },
  ];

  /* =======================================================
     LOAD FITUR
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadFitur() {
      try {
        setLoadingFitur(true);
        setError("");

        const response =
          await getFitur();

        const data =
          getResponseData(response);

        if (!mounted) return;

        const normalized =
          data.map(
            (item, index) =>
              normalizeFeature(
                item,
                index
              )
          );

        setFiturList(normalized);
      } catch (err) {
        console.error(
          "Gagal memuat fitur:",
          err
        );

        if (!mounted) return;

        setError(
          err?.message ||
            "Gagal memuat daftar fitur."
        );
      } finally {
        if (mounted) {
          setLoadingFitur(false);
        }
      }
    }

    loadFitur();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     LOAD DATA DUPLIKAT
  ======================================================= */

  useEffect(() => {
    if (!isDuplikat) {
      return;
    }

    try {
      const stored =
        sessionStorage.getItem(
          "duplikatPaket"
        );

      if (!stored) {
        return;
      }

      const parsed =
        JSON.parse(stored);

      console.log(
        "DATA DUPLIKAT:",
        parsed
      );

      setNama(
        parsed.nama || ""
      );

      setDeskripsi(
        parsed.deskripsi || ""
      );

      setHarga(
        Number(parsed.harga) || 0
      );

      /*
        Backend menggunakan durasi integer.

        Data duplikat dari halaman Super Admin
        biasanya memiliki `siklus` hasil normalisasi,
        jadi kita tetap dukung keduanya.
      */
      if (parsed.siklus) {
        setSiklus(
          parsed.siklus
        );
      } else if (
        parsed.durasi !== undefined
      ) {
        setSiklus(
          getSiklusFromDurasi(
            parsed.durasi
          )
        );
      }

      setStatus(
        parsed.status || "aktif"
      );

      /*
        PENTING:
        Halaman Super Admin menyimpan `modulIds`.

        Bukan fiturIds.
      */
      const modulIds =
        Array.isArray(
          parsed.modulIds
        )
          ? parsed.modulIds
          : [];

      setFiturTerpilih(
        modulIds
      );

      sessionStorage.removeItem(
        "duplikatPaket"
      );
    } catch (err) {
      console.error(
        "Gagal membaca data duplikat:",
        err
      );

      setError(
        "Data duplikat tidak dapat dibaca."
      );
    }
  }, [isDuplikat]);

  /* =======================================================
     TOGGLE FITUR
  ======================================================= */

  function toggleFitur(id) {
    if (!id) return;

    setFiturTerpilih(
      (current) => {
        const exists =
          current.some(
            (item) =>
              String(item) ===
              String(id)
          );

        if (exists) {
          return current.filter(
            (item) =>
              String(item) !==
              String(id)
          );
        }

        return [
          ...current,
          id,
        ];
      }
    );
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(e) {
    e.preventDefault();

    if (!nama.trim()) {
      setError(
        "Nama paket wajib diisi."
      );
      return;
    }

    if (
      !Array.isArray(
        fiturTerpilih
      )
    ) {
      setError(
        "Data modul tidak valid."
      );
      return;
    }

    /*
      Backend createPaket melakukan:

      modulIds.map(...)

      Jadi modulIds HARUS selalu array.
    */

    try {
      setSaving(true);
      setError("");

      const durasi =
        getDurasiFromSiklus(
          siklus
        );

      const modulIds =
        fiturTerpilih.filter(
          Boolean
        );

      const payload = {
        nama: nama.trim(),

        deskripsi:
          deskripsi.trim(),

        harga:
          Number(harga) || 0,

        durasi,

        modulIds,
      };

      /*
        NOTE:
        createPaket backend menetapkan:

        status: "aktif"

        Jadi status FE tidak dikirim
        karena controller create memang
        tidak mengambil status dari body.
      */

      console.log(
        "================================"
      );

      console.log(
        "CREATE PAKET PAYLOAD:"
      );

      console.log(
        JSON.stringify(
          payload,
          null,
          2
        )
      );

      console.log(
        "MODUL TERPILIH:",
        modulIds
      );

      console.log(
        "DURASI:",
        durasi
      );

      console.log(
        "================================"
      );

      await createPaket(
        payload
      );

      /*
        Setelah berhasil,
        kembali ke halaman paket.
      */
      router.push(
        "/super-admin/paketModul"
      );
    } catch (err) {
      console.error(
        "Gagal membuat paket:",
        err
      );

      setError(
        err?.message ||
          "Gagal menyimpan paket."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     BACK
  ======================================================= */

  function goBack() {
    if (saving) return;

    router.push(
      "/super-admin/paketModul"
    );
  }

  /* =======================================================
     SELECTED FEATURES
  ======================================================= */

  const selectedFeatures =
    useMemo(() => {
      return fiturList.filter(
        (fitur) =>
          fiturTerpilih.some(
            (id) =>
              String(id) ===
              String(fitur.id)
          )
      );
    }, [
      fiturList,
      fiturTerpilih,
    ]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Sidebar
        active={activeMenu}
        setActive={setActiveMenu}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(
            !sidebarOpen
          )
        }
      />

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          toggleSidebar={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
          notifications={
            notifications
          }
          user={{
            name: "Sarah",
            email:
              "sarah@smartschool.com",
            avatar: "SA",
          }}
        />

        <main className="flex-1">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-7">
              <div className="min-w-0">
                <div className="flex items-start gap-3">

                  <button
                    type="button"
                    onClick={
                      goBack
                    }
                    disabled={
                      saving
                    }
                    className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ArrowLeft
                      size={18}
                    />
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">

                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
                        {isDuplikat
                          ? "Duplikat Paket"
                          : "Tambah Paket Baru"}
                      </h1>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-600">
                        <Sparkles
                          size={12}
                        />
                        Paket Langganan
                      </span>

                    </div>

                    <p className="mt-1.5 max-w-2xl text-sm sm:text-[15px] leading-6 text-slate-500">
                      {isDuplikat
                        ? "Buat paket baru berdasarkan paket yang sudah tersedia."
                        : "Atur informasi, harga, status, dan modul yang tersedia untuk paket sekolah."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-rose-500 shadow-sm">
                  <AlertCircle
                    size={17}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-rose-700">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-0.5 text-sm leading-5 text-rose-600 break-words">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="shrink-0 rounded-lg p-1.5 text-rose-400 hover:bg-rose-100 hover:text-rose-600"
                >
                  <X
                    size={16}
                  />
                </button>
              </div>
            )}

            {/* =================================================
                CONTENT GRID
            ================================================= */}

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">

              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="min-w-0"
              >
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

                  {/* FORM HEADER */}

                  <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Package
                          size={19}
                        />
                      </div>

                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-800">
                          Informasi Paket
                        </h2>

                        <p className="mt-0.5 text-xs sm:text-sm text-slate-400">
                          Lengkapi detail paket sebelum disimpan.
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* FORM BODY */}

                  <div className="space-y-6 p-5 sm:p-7">

                    {/* =================================================
                        NAMA
                    ================================================= */}

                    <div>
                      <label className="block text-sm font-semibold text-slate-700">
                        Nama Paket{" "}
                        <span className="ml-1 text-rose-500">
                          *
                        </span>
                      </label>

                      <p className="mt-1 text-xs sm:text-sm text-slate-400">
                        Nama yang akan ditampilkan kepada sekolah.
                      </p>

                      <input
                        value={nama}
                        onChange={(e) =>
                          setNama(
                            e.target.value
                          )
                        }
                        required
                        placeholder="Contoh: Professional"
                        className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm sm:text-[15px] font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    {/* =================================================
                        DESKRIPSI
                    ================================================= */}

                    <div>
                      <label className="block text-sm font-semibold text-slate-700">
                        Deskripsi Paket
                      </label>

                      <p className="mt-1 text-xs sm:text-sm text-slate-400">
                        Jelaskan secara singkat manfaat paket ini.
                      </p>

                      <textarea
                        value={
                          deskripsi
                        }
                        onChange={(e) =>
                          setDeskripsi(
                            e.target.value
                          )
                        }
                        rows={4}
                        placeholder="Contoh: Paket lengkap untuk sekolah yang membutuhkan fitur akademik dan administrasi."
                        className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm sm:text-[15px] leading-6 font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    {/* =================================================
                        HARGA + SIKLUS
                    ================================================= */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      {/* HARGA */}

                      <div>
                        <label className="block text-sm font-semibold text-slate-700">
                          Harga Paket
                        </label>

                        <p className="mt-1 text-xs sm:text-sm text-slate-400">
                          Masukkan harga dalam Rupiah.
                        </p>

                        <div className="relative mt-3">

                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                            Rp
                          </span>

                          <input
                            type="number"
                            min="0"
                            value={
                              harga
                            }
                            onChange={(e) =>
                              setHarga(
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm sm:text-[15px] font-semibold text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                          />

                        </div>
                      </div>

                      {/* SIKLUS */}

                      <div>
                        <label className="block text-sm font-semibold text-slate-700">
                          Siklus Pembayaran
                        </label>

                        <p className="mt-1 text-xs sm:text-sm text-slate-400">
                          Tentukan periode pembayaran.
                        </p>

                        <div className="relative mt-3">

                          <CalendarDays
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                          />

                          <select
                            value={
                              siklus
                            }
                            onChange={(e) =>
                              setSiklus(
                                e.target.value
                              )
                            }
                            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 pl-11 text-sm sm:text-[15px] font-medium text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                          >
                            <option value="bulan">
                              Per Bulan
                            </option>

                            <option value="tahun">
                              Per Tahun
                            </option>

                            <option value="14 hari">
                              14 Hari (Trial)
                            </option>
                          </select>

                        </div>

                        <p className="mt-2 text-[11px] text-slate-400">
                          Durasi yang disimpan ke database:{" "}
                          <span className="font-semibold text-slate-500">
                            {getDurasiFromSiklus(
                              siklus
                            )} hari
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* =================================================
                        STATUS
                    ================================================= */}

                    <div>
                      <label className="block text-sm font-semibold text-slate-700">
                        Status Paket
                      </label>

                      <p className="mt-1 text-xs sm:text-sm text-slate-400">
                        Tentukan apakah paket dapat digunakan oleh sekolah.
                      </p>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {/* AKTIF */}

                        <button
                          type="button"
                          onClick={() =>
                            setStatus(
                              "aktif"
                            )
                          }
                          className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                            status ===
                            "aktif"
                              ? "border-emerald-300 bg-emerald-50 shadow-sm ring-2 ring-emerald-100"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >

                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              status ===
                              "aktif"
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            <CircleCheck
                              size={18}
                            />
                          </span>

                          <span className="min-w-0">

                            <span className="block text-sm font-semibold text-slate-700">
                              Aktif
                            </span>

                            <span className="block text-xs text-slate-400">
                              Paket tersedia untuk sekolah
                            </span>

                          </span>

                          {status ===
                            "aktif" && (
                            <Check
                              size={16}
                              className="ml-auto shrink-0 text-emerald-500"
                            />
                          )}

                        </button>

                        {/* NONAKTIF */}

                        <button
                          type="button"
                          onClick={() =>
                            setStatus(
                              "nonaktif"
                            )
                          }
                          className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                            status ===
                            "nonaktif"
                              ? "border-slate-300 bg-slate-100 shadow-sm ring-2 ring-slate-100"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >

                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              status ===
                              "nonaktif"
                                ? "bg-slate-600 text-white"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            <ShieldCheck
                              size={18}
                            />
                          </span>

                          <span className="min-w-0">

                            <span className="block text-sm font-semibold text-slate-700">
                              Nonaktif
                            </span>

                            <span className="block text-xs text-slate-400">
                              Paket tidak tersedia
                            </span>

                          </span>

                          {status ===
                            "nonaktif" && (
                            <Check
                              size={16}
                              className="ml-auto shrink-0 text-slate-600"
                            />
                          )}

                        </button>

                      </div>

                      {status !==
                        "aktif" && (
                        <p className="mt-2 text-[11px] text-amber-600">
                          Catatan: saat membuat paket baru, backend saat ini otomatis menyimpan status sebagai{" "}
                          <strong>
                            aktif
                          </strong>
                          .
                        </p>
                      )}
                    </div>

                    {/* =================================================
                        MODUL / FITUR
                    ================================================= */}

                    <div>

                      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">

                        <div>
                          <label className="block text-sm font-semibold text-slate-700">
                            Modul / Fitur
                          </label>

                          <p className="mt-1 text-xs sm:text-sm text-slate-400">
                            Pilih modul yang termasuk dalam paket.
                          </p>
                        </div>

                        <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                          <Check
                            size={13}
                          />
                          {fiturTerpilih.length}{" "}
                          dipilih
                        </div>

                      </div>

                      {/* LOADING */}

                      {loadingFitur ? (
                        <div className="mt-4 flex min-h-[180px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50">

                          <div className="flex flex-col items-center gap-3">

                            <Loader2
                              size={25}
                              className="animate-spin text-blue-600"
                            />

                            <p className="text-sm text-slate-400">
                              Memuat daftar modul...
                            </p>

                          </div>

                        </div>
                      ) : (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">

                          {fiturList.map(
                            (fitur) => {
                              const checked =
                                fiturTerpilih.some(
                                  (id) =>
                                    String(
                                      id
                                    ) ===
                                    String(
                                      fitur.id
                                    )
                                );

                              const Icon =
                                fitur.icon ||
                                Layers;

                              return (
                                <button
                                  type="button"
                                  key={
                                    fitur.id
                                  }
                                  onClick={() =>
                                    toggleFitur(
                                      fitur.id
                                    )
                                  }
                                  className={`group flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                                    checked
                                      ? "border-blue-300 bg-blue-50/70 shadow-sm"
                                      : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                                  }`}
                                >

                                  {/* CHECKBOX */}

                                  <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                                      checked
                                        ? "border-blue-600 bg-blue-600"
                                        : "border-slate-300 bg-white group-hover:border-blue-300"
                                    }`}
                                  >
                                    {checked && (
                                      <Check
                                        size={
                                          12
                                        }
                                        strokeWidth={
                                          3
                                        }
                                        className="text-white"
                                      />
                                    )}
                                  </span>

                                  {/* ICON */}

                                  <span
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                      checked
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "bg-slate-100 text-slate-400"
                                    }`}
                                  >
                                    <Icon
                                      size={
                                        16
                                      }
                                    />
                                  </span>

                                  {/* TEXT */}

                                  <span className="min-w-0 flex-1">

                                    <span
                                      className={`block truncate text-sm font-semibold ${
                                        checked
                                          ? "text-blue-700"
                                          : "text-slate-700"
                                      }`}
                                    >
                                      {
                                        fitur.nama
                                      }
                                    </span>

                                    {fitur.deskripsi && (
                                      <span className="mt-0.5 block truncate text-xs text-slate-400">
                                        {
                                          fitur.deskripsi
                                        }
                                      </span>
                                    )}

                                  </span>

                                </button>
                              );
                            }
                          )}

                          {fiturList.length ===
                            0 && (
                            <div className="sm:col-span-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">

                              <Layers
                                size={28}
                                className="mx-auto mb-2 text-slate-300"
                              />

                              <p className="text-sm font-medium text-slate-500">
                                Belum ada modul
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Data fitur belum tersedia dari server.
                              </p>

                            </div>
                          )}

                        </div>
                      )}
                    </div>

                  </div>

                  {/* =================================================
                      FOOTER
                  ================================================= */}

                  <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-5 sm:px-7">

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

                      <button
                        type="button"
                        onClick={
                          goBack
                        }
                        disabled={
                          saving
                        }
                        className="w-full sm:w-auto min-w-[130px] rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={
                          saving ||
                          loadingFitur
                        }
                        className="w-full sm:w-auto min-w-[170px] flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        {saving ? (
                          <>
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Check
                              size={16}
                            />
                            Simpan Paket
                          </>
                        )}

                      </button>

                    </div>

                  </div>

                </div>
              </form>

              {/* =================================================
                  PREVIEW
              ================================================= */}

              <aside className="xl:sticky xl:top-6 min-w-0">

                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

                  {/* PREVIEW HEADER */}

                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-5 py-5 text-white">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-100">
                          Preview
                        </p>

                        <h2 className="mt-1 text-lg font-bold">
                          Paket Sekolah
                        </h2>

                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                        <Package
                          size={19}
                        />
                      </div>

                    </div>

                    <p className="mt-3 text-xs leading-5 text-blue-100">
                      Tampilan ringkas paket berdasarkan data yang kamu masukkan.
                    </p>

                  </div>

                  {/* PREVIEW BODY */}

                  <div className="p-5">

                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <p className="text-xs font-medium text-slate-400">
                            Nama Paket
                          </p>

                          <h3 className="mt-1 break-words text-lg font-bold text-slate-800">
                            {nama.trim() ||
                              "Nama Paket"}
                          </h3>

                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            status ===
                            "aktif"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {status ===
                          "aktif"
                            ? "AKTIF"
                            : "NONAKTIF"}
                        </span>

                      </div>

                      <p className="mt-3 min-h-[48px] text-xs leading-5 text-slate-400">
                        {deskripsi.trim() ||
                          "Deskripsi paket akan tampil di sini."}
                      </p>

                      <div className="mt-4 border-t border-slate-200 pt-4">

                        <p className="text-[11px] font-medium text-slate-400">
                          Harga
                        </p>

                        <div className="mt-1 flex flex-wrap items-baseline gap-1">

                          <span className="text-xl font-bold text-slate-800">
                            {formatRupiah(
                              harga
                            )}
                          </span>

                          {Number(
                            harga
                          ) > 0 && (
                            <span className="text-xs text-slate-400">
                              /{" "}
                              {siklus}
                            </span>
                          )}

                        </div>

                        <p className="mt-1 text-[10px] text-slate-400">
                          Durasi:{" "}
                          {
                            getDurasiFromSiklus(
                              siklus
                            )
                          }{" "}
                          hari
                        </p>

                      </div>

                    </div>

                    {/* PREVIEW MODULE */}

                    <div className="mt-5">

                      <div className="flex items-center justify-between">

                        <p className="text-sm font-bold text-slate-700">
                          Modul Termasuk
                        </p>

                        <span className="text-xs font-semibold text-blue-600">
                          {
                            selectedFeatures.length
                          }{" "}
                          fitur
                        </span>

                      </div>

                      <div className="mt-3 space-y-2">

                        {selectedFeatures
                          .slice(
                            0,
                            6
                          )
                          .map(
                            (
                              fitur
                            ) => {
                              const Icon =
                                fitur.icon ||
                                Layers;

                              return (
                                <div
                                  key={
                                    fitur.id
                                  }
                                  className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-white px-3 py-2.5"
                                >

                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Icon
                                      size={
                                        14
                                      }
                                    />
                                  </span>

                                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600">
                                    {
                                      fitur.nama
                                    }
                                  </span>

                                  <Check
                                    size={
                                      14
                                    }
                                    className="shrink-0 text-emerald-500"
                                  />

                                </div>
                              );
                            }
                          )}

                        {selectedFeatures.length ===
                          0 && (
                          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-7 text-center">

                            <Layers
                              size={24}
                              className="mx-auto mb-2 text-slate-300"
                            />

                            <p className="text-xs font-medium text-slate-500">
                              Belum ada fitur dipilih
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                              Pilih modul dari form.
                            </p>

                          </div>
                        )}

                        {selectedFeatures.length >
                          6 && (
                          <p className="pt-1 text-center text-[11px] font-medium text-slate-400">
                            +{" "}
                            {selectedFeatures.length -
                              6}{" "}
                            fitur lainnya
                          </p>
                        )}

                      </div>
                    </div>

                    {/* INFO */}

                    <div className="mt-5 flex gap-2.5 rounded-xl border border-blue-100 bg-blue-50 p-3.5">

                      <Info
                        size={16}
                        className="mt-0.5 shrink-0 text-blue-500"
                      />

                      <p className="text-xs leading-5 text-blue-700">
                        Pastikan informasi paket dan modul sudah benar sebelum menyimpan.
                      </p>

                    </div>

                  </div>
                </div>
              </aside>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}