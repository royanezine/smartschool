"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import {
  Package,
  Layers,
  X,
  Check,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CalendarDays,
  ShieldCheck,
  CircleCheck,
  Info,
  Search,
} from "lucide-react";

import {
  getPaketById,
  getFitur,
  updatePaket,
} from "../../../../../services/paket.service";

/* ============================================================
   ICON MAP
============================================================ */

const ICON_MAP = {
  akademik: Layers,
  cms: Layers,
  laporan: Layers,
  lms: Layers,
  tugas: Layers,
  ujian: Layers,
  ppdb: Layers,
  manajemen_aset: Layers,
  manajemen_pengguna: Layers,
  manajemen_sekolah: Layers,
  keuangan: Layers,
  kepegawaian: Layers,
  perpustakaan: Layers,
  presensi: Layers,
  komunikasi: Layers,
  inventaris: Layers,
};

/* ============================================================
   RESPONSE HELPER
============================================================ */

function extractData(response) {
  if (!response) return null;

  if (response.data !== undefined) {
    return response.data;
  }

  return response;
}

function extractArray(response) {
  const data = extractData(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

/* ============================================================
   FEATURE HELPERS
============================================================ */

function getFeatureId(item) {
  if (!item) return null;

  if (typeof item === "string") {
    return item;
  }

  if (typeof item === "number") {
    return String(item);
  }

  return (
    item.id ??
    item.modulId ??
    item.modul_id ??
    item.fiturId ??
    item.fitur_id ??
    null
  );
}

function getFeatureCode(item) {
  if (!item || typeof item !== "object") {
    return "";
  }

  return String(
    item.kode ??
      item.code ??
      item.modulKode ??
      item.modul_kode ??
      ""
  )
    .trim()
    .toLowerCase();
}

function getFeatureName(item) {
  if (!item) return "Fitur";

  if (typeof item === "string") {
    return item;
  }

  return (
    item.nama ??
    item.namaFitur ??
    item.nama_fitur ??
    item.namaModul ??
    item.nama_modul ??
    item.name ??
    item.label ??
    "Fitur"
  );
}

function getFeatureDescription(item) {
  if (!item || typeof item !== "object") {
    return "";
  }

  return (
    item.deskripsi ??
    item.description ??
    item.keterangan ??
    ""
  );
}

function normalizeFeature(item, index) {
  const id = getFeatureId(item);
  const kode = getFeatureCode(item);
  const nama = getFeatureName(item);
  const deskripsi = getFeatureDescription(item);

  const key =
    kode ||
    String(nama)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");

  const Icon = ICON_MAP[key] || Layers;

  return {
    ...item,
    id: id ?? `feature-${index}`,
    kode,
    nama,
    deskripsi,
    ikon: item?.ikon ?? null,
    sistem: item?.sistem ?? false,
    icon: Icon,
  };
}

/* ============================================================
   GET PACKAGE FEATURES
============================================================ */

function getPaketFeatures(paket) {
  if (!paket) {
    return [];
  }

  /*
    Backend GET /paket/:id mengembalikan:

    {
      id,
      nama,
      deskripsi,
      harga,
      durasi,
      fitur: [...]
    }
  */

  if (Array.isArray(paket.fitur)) {
    return paket.fitur;
  }

  /*
    Fallback jika suatu saat response berbeda.
  */

  if (Array.isArray(paket.modul)) {
    return paket.modul;
  }

  if (Array.isArray(paket.paketModul)) {
    return paket.paketModul
      .map((item) => item?.modul ?? item)
      .filter(Boolean);
  }

  if (Array.isArray(paket.modulIds)) {
    return paket.modulIds;
  }

  return [];
}

/* ============================================================
   PACKAGE FEATURE IDS
============================================================ */

function getPaketFeatureIds(paket) {
  return getPaketFeatures(paket)
    .map((item) => getFeatureId(item))
    .filter(Boolean);
}

/* ============================================================
   PACKAGE FEATURE CODES
============================================================ */

function getPaketFeatureCodes(paket) {
  return getPaketFeatures(paket)
    .map((item) => getFeatureCode(item))
    .filter(Boolean);
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function EditPaketPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  /* ==========================================================
     STATE
  ========================================================== */

  const [activeMenu, setActiveMenu] =
    useState("paket-modul");

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [loadingFitur, setLoadingFitur] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [nama, setNama] =
    useState("");

  const [deskripsi, setDeskripsi] =
    useState("");

  const [harga, setHarga] =
    useState("");

  /*
    Backend Paket.durasi = Int.

    Jadi state ini selalu menyimpan
    jumlah hari dalam bentuk string
    agar nyaman digunakan input number.
  */
  const [durasi, setDurasi] =
    useState("");

  const [status, setStatus] =
    useState("aktif");

  const [fiturList, setFiturList] =
    useState([]);

  /*
    Berisi ID modul.

    Contoh:

    [
      "uuid-modul-1",
      "uuid-modul-2"
    ]
  */
  const [fiturTerpilih, setFiturTerpilih] =
    useState([]);

  const [searchFitur, setSearchFitur] =
    useState("");

  /* ==========================================================
     NOTIFICATION
  ========================================================== */

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

  /* ==========================================================
     LOAD DATA
  ========================================================== */

  useEffect(() => {
    if (!id) {
      return;
    }

    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setLoadingFitur(true);
        setError("");

        const [
          paketResponse,
          fiturResponse,
        ] = await Promise.all([
          getPaketById(id),
          getFitur(),
        ]);

        console.log(
          "===================================="
        );

        console.log(
          "EDIT PAKET RESPONSE:",
          paketResponse
        );

        console.log(
          "EDIT FITUR RESPONSE:",
          fiturResponse
        );

        console.log(
          "===================================="
        );

        if (!mounted) return;

        /* ======================================================
           PACKAGE
        ====================================================== */

        const paket =
          extractData(paketResponse);

        if (!paket || !paket.id) {
          throw new Error(
            "Paket tidak ditemukan."
          );
        }

        console.log(
          "DATA PAKET:",
          paket
        );

        setNama(
          paket.nama ?? ""
        );

        setDeskripsi(
          paket.deskripsi ?? ""
        );

        setHarga(
          paket.harga ?? ""
        );

        setDurasi(
          paket.durasi ?? ""
        );

        setStatus(
          String(
            paket.status ?? "aktif"
          ).toLowerCase()
        );

        /* ======================================================
           EXISTING PACKAGE FEATURES
        ====================================================== */

        const paketFeatures =
          getPaketFeatures(paket);

        const paketFeatureIds =
          getPaketFeatureIds(paket);

        const paketFeatureCodes =
          getPaketFeatureCodes(paket);

        console.log(
          "FITUR PAKET:",
          paketFeatures
        );

        console.log(
          "ID FITUR PAKET:",
          paketFeatureIds
        );

        console.log(
          "KODE FITUR PAKET:",
          paketFeatureCodes
        );

        /* ======================================================
           ALL ACTIVE MODULES
        ====================================================== */

        const semuaFitur =
          extractArray(fiturResponse);

        let normalized =
          semuaFitur.map(
            (item, index) =>
              normalizeFeature(
                item,
                index
              )
          );

        /*
          Jika endpoint fitur kosong,
          gunakan fitur yang memang sudah
          tersimpan di paket.
        */

        if (
          normalized.length === 0 &&
          paketFeatures.length > 0
        ) {
          normalized =
            paketFeatures.map(
              (item, index) =>
                normalizeFeature(
                  item,
                  index
                )
            );
        }

        /*
          Jika ada fitur paket yang belum
          ada di endpoint fitur, tambahkan.
        */

        if (
          normalized.length > 0 &&
          paketFeatures.length > 0
        ) {
          const existingIds =
            new Set(
              normalized
                .map((item) =>
                  getFeatureId(item)
                )
                .filter(Boolean)
                .map(String)
            );

          const existingCodes =
            new Set(
              normalized
                .map((item) =>
                  getFeatureCode(item)
                )
                .filter(Boolean)
            );

          paketFeatures.forEach(
            (item) => {
              const itemId =
                getFeatureId(item);

              const itemCode =
                getFeatureCode(item);

              const exists =
                (itemId &&
                  existingIds.has(
                    String(itemId)
                  )) ||
                (itemCode &&
                  existingCodes.has(
                    itemCode
                  ));

              if (!exists) {
                normalized.push(
                  normalizeFeature(
                    item,
                    normalized.length
                  )
                );
              }
            }
          );
        }

        /* ======================================================
           REMOVE DUPLICATE
        ====================================================== */

        const uniqueMap =
          new Map();

        normalized.forEach(
          (item) => {
            const itemId =
              getFeatureId(item);

            const itemCode =
              getFeatureCode(item);

            const key = itemId
              ? `id:${String(
                  itemId
                )}`
              : itemCode
              ? `kode:${itemCode}`
              : null;

            if (
              key &&
              !uniqueMap.has(key)
            ) {
              uniqueMap.set(
                key,
                item
              );
            }
          }
        );

        const finalFeatures =
          Array.from(
            uniqueMap.values()
          );

        console.log(
          "FINAL FEATURE LIST:",
          finalFeatures
        );

        setFiturList(
          finalFeatures
        );

        /* ======================================================
           DETERMINE SELECTED MODULES
        ====================================================== */

        const selectedIds =
          finalFeatures
            .filter((fitur) => {
              const featureId =
                getFeatureId(
                  fitur
                );

              const featureCode =
                getFeatureCode(
                  fitur
                );

              const matchId =
                featureId &&
                paketFeatureIds.some(
                  (selectedId) =>
                    String(
                      selectedId
                    ) ===
                    String(
                      featureId
                    )
                );

              const matchCode =
                featureCode &&
                paketFeatureCodes.includes(
                  featureCode
                );

              return (
                matchId ||
                matchCode
              );
            })
            .map(
              (fitur) =>
                fitur.id
            )
            .filter(Boolean);

        console.log(
          "SELECTED MODULE IDS:",
          selectedIds
        );

        setFiturTerpilih(
          selectedIds
        );
      } catch (err) {
        console.error(
          "GAGAL MEMUAT EDIT PAKET:",
          err
        );

        if (!mounted) return;

        setError(
          err?.message ||
            "Gagal memuat data paket."
        );
      } finally {
        if (mounted) {
          setLoading(false);
          setLoadingFitur(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [id]);

  /* ==========================================================
     FILTER FEATURE
  ========================================================== */

  const filteredFitur =
    useMemo(() => {
      const keyword =
        searchFitur
          .trim()
          .toLowerCase();

      if (!keyword) {
        return fiturList;
      }

      return fiturList.filter(
        (fitur) => {
          const nama =
            String(
              fitur.nama ?? ""
            ).toLowerCase();

          const kode =
            String(
              fitur.kode ?? ""
            ).toLowerCase();

          const deskripsi =
            String(
              fitur.deskripsi ?? ""
            ).toLowerCase();

          return (
            nama.includes(keyword) ||
            kode.includes(keyword) ||
            deskripsi.includes(keyword)
          );
        }
      );
    }, [
      fiturList,
      searchFitur,
    ]);

  /* ==========================================================
     SELECTED FEATURES
  ========================================================== */

  const selectedFeatures =
    useMemo(() => {
      return fiturList.filter(
        (fitur) =>
          fiturTerpilih.some(
            (selectedId) =>
              String(
                selectedId
              ) ===
              String(
                fitur.id
              )
          )
      );
    }, [
      fiturList,
      fiturTerpilih,
    ]);

  /* ==========================================================
     TOGGLE FEATURE
  ========================================================== */

  function toggleFitur(
    fiturId
  ) {
    if (!fiturId) return;

    setFiturTerpilih(
      (current) => {
        const exists =
          current.some(
            (item) =>
              String(item) ===
              String(fiturId)
          );

        if (exists) {
          return current.filter(
            (item) =>
              String(item) !==
              String(fiturId)
          );
        }

        return [
          ...current,
          fiturId,
        ];
      }
    );
  }

  /* ==========================================================
     SELECT ALL
  ========================================================== */

  function pilihSemuaFitur() {
    const ids =
      fiturList
        .map(
          (fitur) =>
            fitur.id
        )
        .filter(Boolean);

    setFiturTerpilih(
      ids
    );
  }

  /* ==========================================================
     CLEAR ALL
  ========================================================== */

  function hapusSemuaFitur() {
    setFiturTerpilih([]);
  }

  /* ==========================================================
     BACK
  ========================================================== */

  function goBack() {
    if (saving) return;

    router.push(
      "/super-admin/paketModul"
    );
  }

  /* ==========================================================
     SUBMIT UPDATE
  ========================================================== */

  async function handleSubmit(e) {
    e.preventDefault();

    if (!id) {
      setError(
        "ID paket tidak ditemukan."
      );
      return;
    }

    if (!nama.trim()) {
      setError(
        "Nama paket wajib diisi."
      );
      return;
    }

    const numericHarga =
      Number(harga);

    const numericDurasi =
      Number(durasi);

    if (
      Number.isNaN(
        numericHarga
      ) ||
      numericHarga < 0
    ) {
      setError(
        "Harga paket tidak valid."
      );
      return;
    }

    if (
      Number.isNaN(
        numericDurasi
      ) ||
      numericDurasi <= 0
    ) {
      setError(
        "Durasi paket harus lebih dari 0 hari."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      /*
        PENTING:

        Backend updatePaket menerima:

        nama
        deskripsi
        harga
        durasi
        status
        modulIds

        BUKAN:
        fiturIds
        siklus
      */

      const modulIds =
        fiturTerpilih
          .map((item) =>
            String(item)
          )
          .filter(Boolean);

      const payload = {
        nama: nama.trim(),

        deskripsi:
          deskripsi.trim(),

        harga:
          numericHarga,

        durasi:
          numericDurasi,

        status:
          status || "aktif",

        modulIds,
      };

      console.log(
        "===================================="
      );

      console.log(
        "UPDATE PAKET"
      );

      console.log(
        "ID:",
        id
      );

      console.log(
        "PAYLOAD:",
        payload
      );

      console.log(
        "MODUL IDS:",
        modulIds
      );

      console.log(
        "===================================="
      );

      const result =
        await updatePaket(
          id,
          payload
        );

      console.log(
        "UPDATE RESULT:",
        result
      );

      router.push(
        "/super-admin/paketModul"
      );
    } catch (err) {
      console.error(
        "GAGAL UPDATE PAKET:",
        err
      );

      setError(
        err?.message ||
          "Gagal memperbarui paket."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================
     LOADING PAGE
  ========================================================== */

  if (loading) {
    return (
      <div className="flex min-h-screen w-full bg-[#f8fafc]">

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

        <div className="flex min-w-0 flex-1 flex-col">

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

          <main className="flex flex-1 items-center justify-center p-6">

            <div className="flex flex-col items-center gap-3">

              <Loader2
                size={32}
                className="animate-spin text-blue-600"
              />

              <p className="text-sm text-slate-500">
                Memuat data paket...
              </p>

            </div>

          </main>
        </div>
      </div>
    );
  }

  /* ==========================================================
     MAIN
  ========================================================== */

  return (
    <div className="flex min-h-screen w-full bg-[#f8fafc]">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

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

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">

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

        <main className="min-w-0 flex-1">

          <div className="w-full px-3 py-5 sm:px-5 sm:py-6 md:px-6 lg:px-8 xl:px-10 2xl:px-12">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="mb-6">

              <div className="flex min-w-0 items-start gap-3">

                <button
                  type="button"
                  onClick={goBack}
                  disabled={saving}
                  className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft
                    size={18}
                  />
                </button>

                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                      Edit Paket
                    </h1>

                    <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                      Paket Langganan
                    </span>

                  </div>

                  <p className="mt-1.5 text-sm leading-6 text-slate-500">
                    Ubah informasi paket,
                    harga, durasi, status,
                    dan modul yang tersedia.
                  </p>

                </div>
              </div>
            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div className="mb-6 flex min-w-0 items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-rose-500">
                  <AlertCircle
                    size={17}
                  />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-sm font-semibold text-rose-700">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-1 break-words text-sm text-rose-600">
                    {error}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="shrink-0 rounded-lg p-1.5 text-rose-400 transition hover:bg-rose-100 hover:text-rose-600"
                >
                  <X
                    size={16}
                  />
                </button>

              </div>
            )}

            {/* ==================================================
                GRID
            ================================================== */}

            <div className="grid w-full min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_350px] 2xl:grid-cols-[minmax(0,1fr)_390px]">

              {/* ==================================================
                  FORM
              ================================================== */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="w-full min-w-0"
              >

                <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

                  {/* FORM HEADER */}

                  <div className="border-b border-slate-100 px-4 py-5 sm:px-6 lg:px-7">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Package
                          size={19}
                        />
                      </div>

                      <div className="min-w-0">

                        <h2 className="text-base font-bold text-slate-800 sm:text-lg">
                          Informasi Paket
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                          Perbarui detail paket
                          dan modul yang tersedia.
                        </p>

                      </div>
                    </div>
                  </div>

                  {/* FORM BODY */}

                  <div className="space-y-6 p-4 sm:p-6 lg:p-7">

                    {/* ==================================================
                        NAMA
                    ================================================== */}

                    <div>

                      <label className="block text-sm font-semibold text-slate-700">
                        Nama Paket
                        <span className="ml-1 text-rose-500">
                          *
                        </span>
                      </label>

                      <input
                        value={nama}
                        onChange={(e) =>
                          setNama(
                            e.target.value
                          )
                        }
                        required
                        placeholder="Contoh: Professional"
                        className="mt-3 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />

                    </div>

                    {/* ==================================================
                        DESKRIPSI
                    ================================================== */}

                    <div>

                      <label className="block text-sm font-semibold text-slate-700">
                        Deskripsi
                      </label>

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
                        placeholder="Deskripsi singkat paket"
                        className="mt-3 block w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium leading-6 text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />

                    </div>

                    {/* ==================================================
                        HARGA + DURASI
                    ================================================== */}

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                      {/* HARGA */}

                      <div>

                        <label className="block text-sm font-semibold text-slate-700">
                          Harga
                        </label>

                        <div className="relative mt-3">

                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                            Rp
                          </span>

                          <input
                            type="number"
                            min="0"
                            value={harga}
                            onChange={(e) =>
                              setHarga(
                                e.target.value
                              )
                            }
                            className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                          />

                        </div>
                      </div>

                      {/* DURASI */}

                      <div>

                        <label className="block text-sm font-semibold text-slate-700">
                          Durasi
                        </label>

                        <div className="relative mt-3">

                          <CalendarDays
                            size={16}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            type="number"
                            min="1"
                            value={durasi}
                            onChange={(e) =>
                              setDurasi(
                                e.target.value
                              )
                            }
                            required
                            className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-16 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                          />

                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                            hari
                          </span>

                        </div>

                        <p className="mt-2 text-[11px] text-slate-400">
                          Contoh: 30 hari,
                          365 hari, atau 14 hari.
                        </p>

                      </div>

                    </div>

                    {/* ==================================================
                        STATUS
                    ================================================== */}

                    <div>

                      <label className="block text-sm font-semibold text-slate-700">
                        Status Paket
                      </label>

                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">

                        {/* AKTIF */}

                        <button
                          type="button"
                          onClick={() =>
                            setStatus(
                              "aktif"
                            )
                          }
                          className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                            status ===
                            "aktif"
                              ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100"
                              : "border-slate-200 bg-white hover:bg-slate-50"
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

                          <span className="min-w-0 flex-1">

                            <span className="block text-sm font-semibold text-slate-700">
                              Aktif
                            </span>

                            <span className="block truncate text-xs text-slate-400">
                              Paket tersedia
                            </span>

                          </span>

                          {status ===
                            "aktif" && (
                            <Check
                              size={16}
                              className="shrink-0 text-emerald-500"
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
                          className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition ${
                            status ===
                            "nonaktif"
                              ? "border-slate-300 bg-slate-100 ring-2 ring-slate-100"
                              : "border-slate-200 bg-white hover:bg-slate-50"
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

                          <span className="min-w-0 flex-1">

                            <span className="block text-sm font-semibold text-slate-700">
                              Nonaktif
                            </span>

                            <span className="block truncate text-xs text-slate-400">
                              Paket tidak tersedia
                            </span>

                          </span>

                          {status ===
                            "nonaktif" && (
                            <Check
                              size={16}
                              className="shrink-0 text-slate-600"
                            />
                          )}

                        </button>

                      </div>
                    </div>

                    {/* ==================================================
                        MODUL / FITUR
                    ================================================== */}

                    <div>

                      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">

                        <div className="min-w-0">

                          <label className="block text-sm font-semibold text-slate-700">
                            Modul / Fitur
                          </label>

                          <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
                            Centang modul yang
                            ingin dimasukkan
                            ke dalam paket.
                          </p>

                        </div>

                        <div className="flex flex-wrap items-center gap-2">

                          <button
                            type="button"
                            onClick={
                              pilihSemuaFitur
                            }
                            disabled={
                              fiturList.length ===
                              0
                            }
                            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Pilih Semua
                          </button>

                          <button
                            type="button"
                            onClick={
                              hapusSemuaFitur
                            }
                            disabled={
                              fiturTerpilih.length ===
                              0
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Hapus Semua
                          </button>

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                            <Check
                              size={13}
                            />

                            {
                              fiturTerpilih.length
                            }{" "}
                            dipilih
                          </span>

                        </div>
                      </div>

                      {/* SEARCH */}

                      {!loadingFitur &&
                        fiturList.length >
                          0 && (
                          <div className="relative mt-4">

                            <Search
                              size={17}
                              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                              value={
                                searchFitur
                              }
                              onChange={(e) =>
                                setSearchFitur(
                                  e.target.value
                                )
                              }
                              placeholder="Cari modul atau fitur..."
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                            />

                          </div>
                        )}

                      {/* LOADING */}

                      {loadingFitur ? (
                        <div className="mt-4 flex min-h-[220px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50">

                          <div className="flex flex-col items-center gap-3">

                            <Loader2
                              size={28}
                              className="animate-spin text-blue-600"
                            />

                            <p className="text-sm text-slate-400">
                              Memuat daftar fitur...
                            </p>

                          </div>

                        </div>
                      ) : fiturList.length ===
                        0 ? (
                        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center">

                          <Layers
                            size={32}
                            className="mx-auto mb-3 text-slate-300"
                          />

                          <p className="text-sm font-semibold text-slate-500">
                            Belum ada fitur
                          </p>

                          <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
                            Belum ada modul aktif
                            yang tersedia dari
                            server.
                          </p>

                        </div>
                      ) : filteredFitur.length ===
                        0 ? (
                        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">

                          <Search
                            size={28}
                            className="mx-auto mb-2 text-slate-300"
                          />

                          <p className="text-sm font-semibold text-slate-500">
                            Fitur tidak ditemukan
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Coba gunakan kata
                            pencarian lain.
                          </p>

                        </div>
                      ) : (
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                          {filteredFitur.map(
                            (fitur) => {
                              const checked =
                                fiturTerpilih.some(
                                  (selectedId) =>
                                    String(
                                      selectedId
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
                                  key={
                                    fitur.id
                                  }
                                  type="button"
                                  onClick={() =>
                                    toggleFitur(
                                      fitur.id
                                    )
                                  }
                                  className={`group flex min-w-0 w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                                    checked
                                      ? "border-blue-300 bg-blue-50/70 shadow-sm"
                                      : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                                  }`}
                                >

                                  {/* CHECKBOX */}

                                  <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                      checked
                                        ? "border-blue-600 bg-blue-600"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  >
                                    {checked && (
                                      <Check
                                        size={12}
                                        strokeWidth={3}
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
                                      size={16}
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

                                    {fitur.kode && (
                                      <span className="mt-0.5 block truncate text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                        {
                                          fitur.kode
                                        }
                                      </span>
                                    )}

                                    {fitur.deskripsi && (
                                      <span className="mt-0.5 block truncate text-xs text-slate-400">
                                        {
                                          fitur.deskripsi
                                        }
                                      </span>
                                    )}

                                  </span>

                                  {checked && (
                                    <Check
                                      size={17}
                                      className="shrink-0 text-blue-600"
                                    />
                                  )}

                                </button>
                              );
                            }
                          )}

                        </div>
                      )}

                    </div>
                  </div>

                  {/* ==================================================
                      FOOTER
                  ================================================== */}

                  <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-5 sm:px-6 lg:px-7">

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                      <button
                        type="button"
                        onClick={
                          goBack
                        }
                        disabled={
                          saving
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={
                          saving
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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

                            Simpan Perubahan
                          </>
                        )}

                      </button>

                    </div>

                  </div>
                </div>
              </form>

              {/* ==================================================
                  PREVIEW
              ================================================== */}

              <aside className="w-full min-w-0 xl:sticky xl:top-6">

                <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

                  {/* PREVIEW HEADER */}

                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-5 text-white sm:px-5">

                    <div className="flex items-center justify-between gap-3">

                      <div className="min-w-0">

                        <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-100">
                          Preview
                        </p>

                        <h2 className="mt-1 truncate text-lg font-bold">
                          Paket Sekolah
                        </h2>

                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                        <Package
                          size={19}
                        />
                      </div>

                    </div>

                  </div>

                  {/* PREVIEW BODY */}

                  <div className="p-4 sm:p-5">

                    {/* PACKAGE */}

                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0 flex-1">

                          <p className="text-xs text-slate-400">
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

                      <p className="mt-3 min-h-[48px] break-words text-xs leading-5 text-slate-400">
                        {deskripsi.trim() ||
                          "Deskripsi paket akan tampil di sini."}
                      </p>

                      <div className="mt-4 border-t border-slate-200 pt-4">

                        <p className="text-[11px] text-slate-400">
                          Harga
                        </p>

                        <p className="mt-1 break-words text-xl font-bold text-slate-800">
                          Rp
                          {Number(
                            harga || 0
                          ).toLocaleString(
                            "id-ID"
                          )}
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">

                          <CalendarDays
                            size={13}
                          />

                          Berlaku{" "}
                          {Number(
                            durasi || 0
                          )}{" "}
                          hari

                        </p>

                      </div>
                    </div>

                    {/* SELECTED MODULES */}

                    <div className="mt-5">

                      <div className="flex items-center justify-between gap-3">

                        <p className="text-sm font-bold text-slate-700">
                          Modul Termasuk
                        </p>

                        <span className="shrink-0 text-xs font-semibold text-blue-600">
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
                            8
                          )
                          .map(
                            (fitur) => {
                              const Icon =
                                fitur.icon ||
                                Layers;

                              return (
                                <div
                                  key={
                                    fitur.id
                                  }
                                  className="flex min-w-0 items-center gap-2.5 rounded-lg border border-slate-100 bg-white px-3 py-2.5"
                                >

                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Icon
                                      size={14}
                                    />
                                  </span>

                                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600">
                                    {
                                      fitur.nama
                                    }
                                  </span>

                                  <Check
                                    size={14}
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
                              Belum ada fitur
                            </p>

                            <p className="mt-1 px-3 text-[11px] text-slate-400">
                              Pilih fitur dari
                              form di sebelah.
                            </p>

                          </div>
                        )}

                        {selectedFeatures.length >
                          8 && (
                          <p className="pt-1 text-center text-[11px] font-medium text-slate-400">
                            +
                            {selectedFeatures.length -
                              8}{" "}
                            fitur lainnya
                          </p>
                        )}

                      </div>
                    </div>

                    {/* INFO */}

                    <div className="mt-5 flex min-w-0 gap-2.5 rounded-xl border border-blue-100 bg-blue-50 p-3.5">

                      <Info
                        size={16}
                        className="mt-0.5 shrink-0 text-blue-500"
                      />

                      <p className="min-w-0 break-words text-xs leading-5 text-blue-700">
                        Modul yang
                        tercentang akan
                        dikirim sebagai{" "}
                        <b>
                          modulIds
                        </b>{" "}
                        saat menyimpan
                        perubahan.
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
