"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  QrCode,
  Camera,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  createAbsensi,
  absenDenganLokasi,
  absenDenganBarcode,
  absenDenganFace,
} from "@/services/absensi.service";

// =====================================================
// THEME HELPERS
// =====================================================

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

// =====================================================
// METODE ABSENSI
// =====================================================

const metodeConfig = {
  lokasi: {
    title: "Lokasi",
    description: "Menggunakan GPS",
    icon: MapPin,
    activeSurface: themePrimarySoft,
    activeBorder: themePrimarySoftBorder,
    iconSurface: themePrimarySoft,
    iconText: themePrimaryText,
  },

  barcode: {
    title: "Barcode / QR",
    description: "Menggunakan kode siswa",
    icon: QrCode,
    activeSurface: themeInfoSurface,
    activeBorder: themeInfoBorder,
    iconSurface: themeInfoSurface,
    iconText: "text-[var(--color-info)]",
  },

  face: {
    title: "Face Recognition",
    description: "Menggunakan foto wajah",
    icon: Camera,
    activeSurface: themeSuccessSurface,
    activeBorder: themeSuccessBorder,
    iconSurface: themeSuccessSurface,
    iconText: "text-[var(--color-success)]",
  },

  manual: {
    title: "Manual",
    description: "Pencatatan manual",
    icon: CheckCircle2,
    activeSurface: themeNeutralSurface,
    activeBorder: themeNeutralBorder,
    iconSurface: themeNeutralSurface,
    iconText: "theme-text-secondary",
  },
};

// =====================================================
// MAIN CONTENT
// =====================================================

function TambahAbsensiPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const kelasIdDariUrl = searchParams.get("kelasId") || "";

  const [kelasId, setKelasId] = useState(kelasIdDariUrl);
  const [status, setStatus] = useState("hadir");
  const [metode, setMetode] = useState("lokasi");
  const [keterangan, setKeterangan] = useState("");

  const [barcodeData, setBarcodeData] = useState("");
  const [snapshot, setSnapshot] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!kelasId.trim()) {
      setError("ID kelas wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      let result;

      if (metode === "lokasi") {
        result = await absenDenganLokasi({
          kelasId: kelasId.trim(),
          status,
          keterangan,
        });
      } else if (metode === "barcode") {
        if (!barcodeData.trim()) {
          throw new Error("Data barcode/QR wajib diisi.");
        }

        result = await absenDenganBarcode({
          kelasId: kelasId.trim(),
          barcodeData: barcodeData.trim(),
          status,
          keterangan,
        });
      } else if (metode === "face") {
        if (!snapshot) {
          throw new Error("Foto wajah wajib disertakan.");
        }

        result = await absenDenganFace({
          kelasId: kelasId.trim(),
          snapshot,
          status,
          keterangan,
        });
      } else {
        result = await createAbsensi({
          kelasId: kelasId.trim(),
          status,
          metode: "manual",
          keterangan,
        });
      }

      setSuccess("Absensi berhasil dicatat.");

      setTimeout(() => {
        router.push(
          `/guru/absensi?kelasId=${encodeURIComponent(
            kelasId.trim()
          )}`
        );
      }, 1000);
    } catch (err) {
      setError(
        err?.message || "Gagal menyimpan absensi."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SNAPSHOT
  // =====================================================

  const handleSnapshotChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setSnapshot(null);
      return;
    }

    setSnapshot(file);
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="theme-page min-h-screen">
      <Header />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-6 flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className={`
                  flex h-10 w-10 shrink-0 items-center
                  justify-center rounded-xl border
                  ${themeNeutralBorder}
                  theme-card
                  theme-text-secondary
                  transition
                  ${themeNeutralHover}
                `}
              >
                <ArrowLeft size={20} />
              </button>

              <div className="min-w-0">
                <h1 className="theme-text text-2xl font-bold">
                  Tambah Absensi
                </h1>

                <p className="theme-text-secondary mt-1 text-sm">
                  Catat absensi menggunakan metode yang
                  tersedia pada sistem.
                </p>
              </div>
            </div>

            {/* =================================================
                INFO BACKEND
            ================================================= */}

            <div
              className={`
                ${themeInfoBorder}
                ${themeInfoSurface}
                mb-6 rounded-2xl border p-4
              `}
            >
              <div className="flex gap-3">
                <AlertCircle
                  className="theme-info mt-0.5 shrink-0"
                  size={20}
                />

                <div className="min-w-0">
                  <p className="theme-text font-semibold">
                    Informasi
                  </p>

                  <p className="theme-text-secondary mt-1 text-sm leading-6">
                    Absensi akan dicatat untuk akun yang
                    sedang login. Data dikirim langsung ke
                    backend sesuai metode absensi yang
                    dipilih.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className={`
                  ${themeDangerBorder}
                  ${themeDangerSurface}
                  mb-5 flex items-start gap-3
                  rounded-xl border p-4
                `}
              >
                <AlertCircle
                  size={20}
                  className="theme-danger mt-0.5 shrink-0"
                />

                <p className="theme-danger text-sm font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (
              <div
                className={`
                  ${themeSuccessBorder}
                  ${themeSuccessSurface}
                  mb-5 flex items-start gap-3
                  rounded-xl border p-4
                `}
              >
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-[var(--color-success)]"
                />

                <p className="text-sm font-medium text-[var(--color-success)]">
                  {success}
                </p>
              </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleSubmit}>
              <div
                className={`
                  theme-card
                  ${themeNeutralBorder}
                  ${themeCardShadow}
                  overflow-hidden rounded-2xl border
                `}
              >
                {/* =================================================
                    FORM HEADER
                ================================================= */}

                <div
                  className={`
                    ${themeDivider}
                    border-b px-5 py-5 sm:px-6
                  `}
                >
                  <h2 className="theme-text text-lg font-semibold">
                    Data Absensi
                  </h2>

                  <p className="theme-text-secondary mt-1 text-sm">
                    Lengkapi data berikut sebelum menyimpan
                    absensi.
                  </p>
                </div>

                {/* =================================================
                    FORM BODY
                ================================================= */}

                <div className="space-y-6 p-5 sm:p-6">

                  {/* =================================================
                      KELAS
                  ================================================= */}

                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      ID Kelas
                    </label>

                    <input
                      type="text"
                      value={kelasId}
                      onChange={(e) =>
                        setKelasId(e.target.value)
                      }
                      placeholder="Masukkan UUID kelas"
                      className={`
                        theme-input
                        ${themeFocus}
                        w-full rounded-xl border
                        px-4 py-3 text-sm outline-none
                        transition
                        placeholder:text-[var(--color-text-placeholder)]
                      `}
                    />

                    <p className="theme-text-muted mt-2 text-xs">
                      BE membutuhkan{" "}
                      <code
                        className={`
                          ${themeNeutralSurface}
                          theme-text-secondary
                          rounded px-1.5 py-0.5
                        `}
                      >
                        kelasId
                      </code>{" "}
                      dalam format UUID.
                    </p>
                  </div>

                  {/* =================================================
                      STATUS
                  ================================================= */}

                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Status Absensi
                    </label>

                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value)
                      }
                      className={`
                        theme-input
                        ${themeFocus}
                        theme-text-secondary
                        w-full rounded-xl border
                        px-4 py-3 text-sm outline-none
                        transition
                      `}
                    >
                      <option value="hadir">
                        Hadir
                      </option>

                      <option value="izin">
                        Izin
                      </option>

                      <option value="sakit">
                        Sakit
                      </option>

                      <option value="alpha">
                        Alpha
                      </option>
                    </select>
                  </div>

                  {/* =================================================
                      METODE ABSENSI
                  ================================================= */}

                  <div>
                    <label className="theme-text mb-3 block text-sm font-semibold">
                      Metode Absensi
                    </label>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {Object.entries(metodeConfig).map(
                        ([key, config]) => {
                          const Icon = config.icon;
                          const isActive = metode === key;

                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() =>
                                setMetode(key)
                              }
                              className={`
                                rounded-xl border p-4
                                text-left transition
                                ${
                                  isActive
                                    ? `${config.activeBorder} ${config.activeSurface} ring-2 ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]`
                                    : `${themeNeutralBorder} ${themeNeutralHover}`
                                }
                              `}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`
                                    flex h-10 w-10
                                    shrink-0 items-center
                                    justify-center rounded-lg
                                    ${config.iconSurface}
                                    ${config.iconText}
                                  `}
                                >
                                  <Icon size={20} />
                                </div>

                                <div className="min-w-0">
                                  <p className="theme-text font-semibold">
                                    {config.title}
                                  </p>

                                  <p className="theme-text-muted text-xs">
                                    {config.description}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* =================================================
                      BARCODE
                  ================================================= */}

                  {metode === "barcode" && (
                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Data Barcode / QR
                      </label>

                      <input
                        type="text"
                        value={barcodeData}
                        onChange={(e) =>
                          setBarcodeData(
                            e.target.value
                          )
                        }
                        placeholder="Masukkan hasil scan barcode / QR"
                        className={`
                          theme-input
                          ${themeFocus}
                          w-full rounded-xl border
                          px-4 py-3 text-sm outline-none
                          transition
                          placeholder:text-[var(--color-text-placeholder)]
                        `}
                      />

                      <p className="theme-text-muted mt-2 text-xs">
                        BE akan mencocokkan nilai ini dengan
                        NISN akun yang sedang login.
                      </p>
                    </div>
                  )}

                  {/* =================================================
                      FACE
                  ================================================= */}

                  {metode === "face" && (
                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Foto Wajah
                      </label>

                      <div
                        className={`
                          ${themeNeutralBorder}
                          ${themeNeutralSurface}
                          rounded-xl border-2 border-dashed p-5
                        `}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          capture="user"
                          onChange={
                            handleSnapshotChange
                          }
                          className="
                            theme-text-secondary
                            block w-full text-sm
                            file:mr-4
                            file:rounded-lg
                            file:border-0
                            file:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]
                            file:px-4
                            file:py-2
                            file:text-sm
                            file:font-semibold
                            file:text-[var(--color-primary)]
                            hover:file:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]
                          "
                        />

                        {snapshot && (
                          <div
                            className={`
                              ${themeSuccessBorder}
                              ${themeSuccessSurface}
                              mt-3 rounded-lg border p-3
                              text-sm
                            `}
                          >
                            <span className="text-[var(--color-success)]">
                              Foto dipilih:{" "}
                            </span>

                            <span className="font-semibold text-[var(--color-success)]">
                              {snapshot.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="theme-text-muted mt-2 text-xs">
                        File akan dikirim sebagai field{" "}
                        <code
                          className={`
                            ${themeNeutralSurface}
                            theme-text-secondary
                            rounded px-1.5 py-0.5
                          `}
                        >
                          snapshot
                        </code>{" "}
                        ke BE.
                      </p>
                    </div>
                  )}

                  {/* =================================================
                      KETERANGAN
                  ================================================= */}

                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Keterangan
                      <span className="theme-text-muted ml-1 font-normal">
                        (opsional)
                      </span>
                    </label>

                    <textarea
                      value={keterangan}
                      onChange={(e) =>
                        setKeterangan(e.target.value)
                      }
                      rows={4}
                      placeholder="Tambahkan keterangan jika diperlukan..."
                      className={`
                        theme-input
                        ${themeFocus}
                        w-full resize-none rounded-xl border
                        px-4 py-3 text-sm outline-none
                        transition
                        placeholder:text-[var(--color-text-placeholder)]
                      `}
                    />
                  </div>
                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                  className={`
                    ${themeDivider}
                    ${themeNeutralSurface}
                    flex flex-col-reverse gap-3
                    border-t px-5 py-5
                    sm:flex-row sm:justify-end sm:px-6
                  `}
                >
                  {/* BATAL */}

                  <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={loading}
                    className={`
                      theme-card
                      ${themeNeutralBorder}
                      theme-text-secondary
                      ${themeNeutralHover}
                      rounded-xl border
                      px-5 py-3 text-sm font-semibold
                      transition
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    `}
                  >
                    Batal
                  </button>

                  {/* SIMPAN */}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`
                      ${themePrimaryGradient}
                      ${themePrimaryShadow}
                      flex items-center
                      justify-center gap-2
                      rounded-xl px-5 py-3
                      text-sm font-semibold
                      text-[var(--color-card)]
                      transition
                      hover:brightness-95
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    `}
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={18} />

                        Simpan Absensi
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

// =====================================================
// SUSPENSE WRAPPER
// =====================================================

export default function TambahAbsensiPage() {
  return (
    <Suspense
      fallback={
        <div className="theme-page min-h-screen" />
      }
    >
      <TambahAbsensiPageContent />
    </Suspense>
  );
}