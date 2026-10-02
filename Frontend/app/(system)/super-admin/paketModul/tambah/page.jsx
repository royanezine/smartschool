"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
} from "@/services/paket.service";

/* =========================================================
   THEME HELPERS
========================================================= */

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

  const nama = getFeatureName(item);

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
    deskripsi: getFeatureDescription(item),
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

  if (Array.isArray(response.data?.data)) {
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

  return `Rp${number.toLocaleString("id-ID")}`;
}

/* =========================================================
   DURASI
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

function TambahPaketPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isDuplikat =
    searchParams.get("duplikat") === "true";

  /* =======================================================
     STATE
  ======================================================= */

  const [fiturList, setFiturList] = useState([]);
  const [loadingFitur, setLoadingFitur] = useState(true);

  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [harga, setHarga] = useState(0);
  const [siklus, setSiklus] = useState("bulan");
  const [status, setStatus] = useState("aktif");

  const [fiturTerpilih, setFiturTerpilih] =
    useState([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* =======================================================
     LOAD FITUR
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadFitur() {
      try {
        setLoadingFitur(true);
        setError("");

        const response = await getFitur();
        const data = getResponseData(response);

        if (!mounted) return;

        const normalized = data.map(
          (item, index) =>
            normalizeFeature(item, index)
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

      const parsed = JSON.parse(stored);

      console.log(
        "DATA DUPLIKAT:",
        parsed
      );

      setNama(parsed.nama || "");
      setDeskripsi(parsed.deskripsi || "");
      setHarga(Number(parsed.harga) || 0);

      if (parsed.siklus) {
        setSiklus(parsed.siklus);
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

      const modulIds =
        Array.isArray(parsed.modulIds)
          ? parsed.modulIds
          : [];

      setFiturTerpilih(modulIds);

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

    setFiturTerpilih((current) => {
      const exists = current.some(
        (item) =>
          String(item) === String(id)
      );

      if (exists) {
        return current.filter(
          (item) =>
            String(item) !== String(id)
        );
      }

      return [...current, id];
    });
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
      !Array.isArray(fiturTerpilih)
    ) {
      setError(
        "Data modul tidak valid."
      );
      return;
    }

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
        deskripsi: deskripsi.trim(),
        harga: Number(harga) || 0,
        durasi,
        modulIds,
      };

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

      await createPaket(payload);

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
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1600px] mx-auto px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-7">
          <div className="min-w-0">
            <div className="flex items-start gap-3">

              <button
                type="button"
                onClick={goBack}
                disabled={saving}
                className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${themeNeutralBorder} ${themeCardShadow} theme-card theme-text-muted transition-all hover:text-[var(--color-primary)] ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight theme-text">
                    {isDuplikat
                      ? "Duplikat Paket"
                      : "Tambah Paket Baru"}
                  </h1>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full ${themePrimarySoft} ${themePrimarySoftBorder} border px-2.5 py-1 text-xs font-semibold ${themePrimaryText}`}
                  >
                    <Sparkles size={12} />
                    Paket Langganan
                  </span>

                </div>

                <p className="mt-1.5 max-w-2xl text-sm sm:text-[15px] leading-6 theme-text-secondary">
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
          <div
            className={`mb-6 flex items-start gap-3 rounded-xl border ${themeWarningBorder} ${themeWarningSurface} p-4 ${themeSmallShadow}`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${theme-card} ${themeWarningSurface} text-[var(--color-warning)] ${themeSmallShadow}`}
            >
              <AlertCircle size={17} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold theme-text">
                Terjadi kesalahan
              </p>

              <p className="mt-0.5 text-sm leading-5 text-[var(--color-warning)] break-words">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 rounded-lg p-1.5 text-[var(--color-warning)] hover:bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] transition-colors"
            >
              <X size={16} />
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
            onSubmit={handleSubmit}
            className="min-w-0"
          >
            <div
              className={`overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
            >

              {/* FORM HEADER */}

              <div
                className={`border-b ${themeDivider} px-5 py-5 sm:px-7`}
              >
                <div className="flex items-center gap-3">

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                  >
                    <Package size={19} />
                  </div>

                  <div>
                    <h2 className="text-base sm:text-lg font-bold theme-text">
                      Informasi Paket
                    </h2>

                    <p className="mt-0.5 text-xs sm:text-sm theme-text-muted">
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
                  <label className="block text-sm font-semibold theme-text">
                    Nama Paket{" "}
                    <span className="ml-1 text-[var(--color-warning)]">
                      *
                    </span>
                  </label>

                  <p className="mt-1 text-xs sm:text-sm theme-text-muted">
                    Nama yang akan ditampilkan kepada sekolah.
                  </p>

                  <input
                    value={nama}
                    onChange={(e) =>
                      setNama(e.target.value)
                    }
                    required
                    placeholder="Contoh: Professional"
                    className={`mt-3 w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-4 py-3 text-sm sm:text-[15px] font-medium theme-text outline-none transition-all placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                  />
                </div>

                {/* =================================================
                    DESKRIPSI
                ================================================= */}

                <div>
                  <label className="block text-sm font-semibold theme-text">
                    Deskripsi Paket
                  </label>

                  <p className="mt-1 text-xs sm:text-sm theme-text-muted">
                    Jelaskan secara singkat manfaat paket ini.
                  </p>

                  <textarea
                    value={deskripsi}
                    onChange={(e) =>
                      setDeskripsi(
                        e.target.value
                      )
                    }
                    rows={4}
                    placeholder="Contoh: Paket lengkap untuk sekolah yang membutuhkan fitur akademik dan administrasi."
                    className={`mt-3 w-full resize-none rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-4 py-3 text-sm sm:text-[15px] leading-6 font-medium theme-text outline-none transition-all placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                  />
                </div>

                {/* =================================================
                    HARGA + SIKLUS
                ================================================= */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* HARGA */}

                  <div>
                    <label className="block text-sm font-semibold theme-text">
                      Harga Paket
                    </label>

                    <p className="mt-1 text-xs sm:text-sm theme-text-muted">
                      Masukkan harga dalam Rupiah.
                    </p>

                    <div className="relative mt-3">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold theme-text-muted">
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
                        className={`w-full rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} py-3 pl-11 pr-4 text-sm sm:text-[15px] font-semibold theme-text outline-none transition-all ${themeFocus}`}
                      />

                    </div>
                  </div>

                  {/* SIKLUS */}

                  <div>
                    <label className="block text-sm font-semibold theme-text">
                      Siklus Pembayaran
                    </label>

                    <p className="mt-1 text-xs sm:text-sm theme-text-muted">
                      Tentukan periode pembayaran.
                    </p>

                    <div className="relative mt-3">

                      <CalendarDays
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none"
                      />

                      <select
                        value={siklus}
                        onChange={(e) =>
                          setSiklus(
                            e.target.value
                          )
                        }
                        className={`theme-input theme-text w-full appearance-none rounded-xl border px-4 py-3 pl-11 text-sm sm:text-[15px] font-medium outline-none transition-all ${themeFocus}`}
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

                    <p className="mt-2 text-[11px] theme-text-muted">
                      Durasi yang disimpan ke database:{" "}
                      <span className="font-semibold theme-text-secondary">
                        {getDurasiFromSiklus(
                          siklus
                        )}{" "}
                        hari
                      </span>
                    </p>
                  </div>
                </div>

                {/* =================================================
                    STATUS
                ================================================= */}

                <div>
                  <label className="block text-sm font-semibold theme-text">
                    Status Paket
                  </label>

                  <p className="mt-1 text-xs sm:text-sm theme-text-muted">
                    Tentukan apakah paket dapat digunakan oleh sekolah.
                  </p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {/* AKTIF */}

                    <button
                      type="button"
                      onClick={() =>
                        setStatus("aktif")
                      }
                      className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                        status === "aktif"
                          ? `${themeSuccessBorder} ${themeSuccessSurface} ring-2 ring-[color-mix(in_srgb,var(--color-success)_12%,transparent)] ${themeSmallShadow}`
                          : `${themeNeutralBorder} theme-card ${themeNeutralHover}`
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          status === "aktif"
                            ? "bg-[var(--color-success)] text-[var(--color-card)]"
                            : `${themeNeutralSurface} theme-text-muted`
                        }`}
                      >
                        <CircleCheck size={18} />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-sm font-semibold theme-text">
                          Aktif
                        </span>

                        <span className="block text-xs theme-text-muted">
                          Paket tersedia untuk sekolah
                        </span>
                      </span>

                      {status === "aktif" && (
                        <Check
                          size={16}
                          className="ml-auto shrink-0 text-[var(--color-success)]"
                        />
                      )}
                    </button>

                    {/* NONAKTIF */}

                    <button
                      type="button"
                      onClick={() =>
                        setStatus("nonaktif")
                      }
                      className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                        status === "nonaktif"
                          ? `${themeNeutralBorder} ${themeNeutralSurface} ring-2 ring-[color-mix(in_srgb,var(--color-text)_8%,transparent)] ${themeSmallShadow}`
                          : `${themeNeutralBorder} theme-card ${themeNeutralHover}`
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          status === "nonaktif"
                            ? "bg-[var(--color-text)] text-[var(--color-card)]"
                            : `${themeNeutralSurface} theme-text-muted`
                        }`}
                      >
                        <ShieldCheck size={18} />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-sm font-semibold theme-text">
                          Nonaktif
                        </span>

                        <span className="block text-xs theme-text-muted">
                          Paket tidak tersedia
                        </span>
                      </span>

                      {status === "nonaktif" && (
                        <Check
                          size={16}
                          className="ml-auto shrink-0 theme-text"
                        />
                      )}
                    </button>

                  </div>

                  {status !== "aktif" && (
                    <p className="mt-2 text-[11px] text-[var(--color-warning)]">
                      Catatan: saat membuat paket baru, backend saat ini otomatis menyimpan status sebagai{" "}
                      <strong>aktif</strong>.
                    </p>
                  )}
                </div>

                {/* =================================================
                    MODUL / FITUR
                ================================================= */}

                <div>
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">

                    <div>
                      <label className="block text-sm font-semibold theme-text">
                        Modul / Fitur
                      </label>

                      <p className="mt-1 text-xs sm:text-sm theme-text-muted">
                        Pilih modul yang termasuk dalam paket.
                      </p>
                    </div>

                    <div
                      className={`inline-flex w-fit items-center gap-1.5 rounded-full ${themePrimarySoft} ${themePrimarySoftBorder} border px-3 py-1.5 text-xs font-semibold ${themePrimaryText}`}
                    >
                      <Check size={13} />
                      {fiturTerpilih.length} dipilih
                    </div>

                  </div>

                  {/* LOADING */}

                  {loadingFitur ? (
                    <div
                      className={`mt-4 flex min-h-[180px] items-center justify-center rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface}`}
                    >
                      <div className="flex flex-col items-center gap-3">

                        <Loader2
                          size={25}
                          className={`animate-spin ${themePrimaryText}`}
                        />

                        <p className="text-sm theme-text-muted">
                          Memuat daftar modul...
                        </p>

                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">

                      {fiturList.map((fitur) => {
                        const checked =
                          fiturTerpilih.some(
                            (id) =>
                              String(id) ===
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
                            key={fitur.id}
                            onClick={() =>
                              toggleFitur(
                                fitur.id
                              )
                            }
                            className={`group flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                              checked
                                ? `${themePrimarySoftBorder} ${themePrimarySoft} ${themeSmallShadow}`
                                : `${themeNeutralBorder} theme-card ${themeNeutralHover} hover:border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]`
                            }`}
                          >

                            {/* CHECKBOX */}

                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                                checked
                                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                                  : `${themeNeutralBorder} theme-card group-hover:border-[var(--color-primary)]`
                              }`}
                            >
                              {checked && (
                                <Check
                                  size={12}
                                  strokeWidth={3}
                                  className="text-[var(--color-card)]"
                                />
                              )}
                            </span>

                            {/* ICON */}

                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                checked
                                  ? `${theme-card} ${themePrimaryText} ${themeSmallShadow}`
                                  : `${themeNeutralSurface} theme-text-muted`
                              }`}
                            >
                              <Icon size={16} />
                            </span>

                            {/* TEXT */}

                            <span className="min-w-0 flex-1">

                              <span
                                className={`block truncate text-sm font-semibold ${
                                  checked
                                    ? themePrimaryText
                                    : "theme-text"
                                }`}
                              >
                                {fitur.nama}
                              </span>

                              {fitur.deskripsi && (
                                <span className="mt-0.5 block truncate text-xs theme-text-muted">
                                  {fitur.deskripsi}
                                </span>
                              )}

                            </span>

                          </button>
                        );
                      })}

                      {fiturList.length === 0 && (
                        <div
                          className={`sm:col-span-2 rounded-xl border border-dashed ${themeNeutralBorder} ${themeNeutralSurface} py-10 text-center`}
                        >
                          <Layers
                            size={28}
                            className="mx-auto mb-2 theme-text-muted"
                          />

                          <p className="text-sm font-medium theme-text-secondary">
                            Belum ada modul
                          </p>

                          <p className="mt-1 text-xs theme-text-muted">
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

              <div
                className={`border-t ${themeDivider} ${themeNeutralSurface} px-5 py-5 sm:px-7`}
              >
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

                  <button
                    type="button"
                    onClick={goBack}
                    disabled={saving}
                    className={`w-full sm:w-auto min-w-[130px] rounded-xl border ${themeNeutralBorder} theme-card px-5 py-3 text-sm font-semibold theme-text-secondary ${themeSmallShadow} transition-all ${themeNeutralHover} hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      loadingFitur
                    }
                    className={`w-full sm:w-auto min-w-[170px] flex items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-5 py-3 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60`}
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
                        <Check size={16} />
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

            <div
              className={`overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
            >

              {/* PREVIEW HEADER */}

              <div
                className={`${themePrimaryGradient} px-5 py-5 text-[var(--color-card)]`}
              >
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]">
                      Preview
                    </p>

                    <h2 className="mt-1 text-lg font-bold">
                      Paket Sekolah
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-card)_14%,transparent)] backdrop-blur-sm">
                    <Package size={19} />
                  </div>

                </div>

                <p className="mt-3 text-xs leading-5 text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]">
                  Tampilan ringkas paket berdasarkan data yang kamu masukkan.
                </p>
              </div>

              {/* PREVIEW BODY */}

              <div className="p-5">

                <div
                  className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
                >
                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="text-xs font-medium theme-text-muted">
                        Nama Paket
                      </p>

                      <h3 className="mt-1 break-words text-lg font-bold theme-text">
                        {nama.trim() ||
                          "Nama Paket"}
                      </h3>

                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        status === "aktif"
                          ? `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder} border`
                          : `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder} border`
                      }`}
                    >
                      {status === "aktif"
                        ? "AKTIF"
                        : "NONAKTIF"}
                    </span>

                  </div>

                  <p className="mt-3 min-h-[48px] text-xs leading-5 theme-text-muted">
                    {deskripsi.trim() ||
                      "Deskripsi paket akan tampil di sini."}
                  </p>

                  <div
                    className={`mt-4 border-t ${themeDivider} pt-4`}
                  >
                    <p className="text-[11px] font-medium theme-text-muted">
                      Harga
                    </p>

                    <div className="mt-1 flex flex-wrap items-baseline gap-1">

                      <span className="text-xl font-bold theme-text">
                        {formatRupiah(harga)}
                      </span>

                      {Number(harga) > 0 && (
                        <span className="text-xs theme-text-muted">
                          / {siklus}
                        </span>
                      )}

                    </div>

                    <p className="mt-1 text-[10px] theme-text-muted">
                      Durasi:{" "}
                      {getDurasiFromSiklus(
                        siklus
                      )}{" "}
                      hari
                    </p>
                  </div>
                </div>

                {/* PREVIEW MODULE */}

                <div className="mt-5">

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-bold theme-text">
                      Modul Termasuk
                    </p>

                    <span
                      className={`text-xs font-semibold ${themePrimaryText}`}
                    >
                      {selectedFeatures.length} fitur
                    </span>

                  </div>

                  <div className="mt-3 space-y-2">

                    {selectedFeatures
                      .slice(0, 6)
                      .map((fitur) => {
                        const Icon =
                          fitur.icon ||
                          Layers;

                        return (
                          <div
                            key={fitur.id}
                            className={`flex items-center gap-2.5 rounded-lg border ${themeNeutralBorder} theme-card px-3 py-2.5`}
                          >

                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                            >
                              <Icon size={14} />
                            </span>

                            <span className="min-w-0 flex-1 truncate text-xs font-medium theme-text-secondary">
                              {fitur.nama}
                            </span>

                            <Check
                              size={14}
                              className="shrink-0 text-[var(--color-success)]"
                            />
                          </div>
                        );
                      })}

                    {selectedFeatures.length === 0 && (
                      <div
                        className={`rounded-xl border border-dashed ${themeNeutralBorder} ${themeNeutralSurface} py-7 text-center`}
                      >
                        <Layers
                          size={24}
                          className="mx-auto mb-2 theme-text-muted"
                        />

                        <p className="text-xs font-medium theme-text-secondary">
                          Belum ada fitur dipilih
                        </p>

                        <p className="mt-1 text-[11px] theme-text-muted">
                          Pilih modul dari form.
                        </p>
                      </div>
                    )}

                    {selectedFeatures.length > 6 && (
                      <p className="pt-1 text-center text-[11px] font-medium theme-text-muted">
                        +{" "}
                        {selectedFeatures.length - 6}{" "}
                        fitur lainnya
                      </p>
                    )}

                  </div>
                </div>

                {/* INFO */}

                <div
                  className={`mt-5 flex gap-2.5 rounded-xl border ${themeInfoBorder} ${themeInfoSurface} p-3.5`}
                >
                  <Info
                    size={16}
                    className="mt-0.5 shrink-0 text-[var(--color-info)]"
                  />

                  <p className="text-xs leading-5 text-[var(--color-info)]">
                    Pastikan informasi paket dan modul sudah benar sebelum menyimpan.
                  </p>
                </div>

              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

export default function TambahPaketPage() {
  return (
    <Suspense
      fallback={
        <div className="theme-page min-h-full" />
      }
    >
      <TambahPaketPageContent />
    </Suspense>
  );
}