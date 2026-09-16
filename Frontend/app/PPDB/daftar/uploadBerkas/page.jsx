"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  GraduationCap,
  Loader2,
  AlertCircle,
  UploadCloud,
  X,
  ShieldCheck,
  Info,
  FileCheck2,
} from "lucide-react";

import PpdbHeader from "../../../components/ppdb/PpdbHeader";
import PpdbFooter from "../../../components/ppdb/PpdbFooter";

import { uploadBerkasPpdb } from "../../../../services/ppdb.service";

/* =========================================================
   DOKUMEN SESUAI BACKEND

   Backend menerima:
   KK
   AKTE
   IJAZAH
========================================================= */

const dokumenList = [
  {
    id: "KK",
    number: "01",
    label: "Kartu Keluarga",
    description:
      "Unggah Kartu Keluarga yang memuat data calon siswa.",
  },
  {
    id: "AKTE",
    number: "02",
    label: "Akta Kelahiran",
    description:
      "Unggah Akta Kelahiran calon siswa.",
  },
  {
    id: "IJAZAH",
    number: "03",
    label: "Ijazah / Surat Keterangan Lulus",
    description:
      "Unggah Ijazah atau dokumen kelulusan calon siswa.",
  },
];

/* =========================================================
   VALIDASI FRONTEND

   Tipe yang diizinkan frontend:
   JPG / PNG / PDF

   Maksimal 2MB per file.
========================================================= */

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

const MAX_FILE_SIZE = 2 * 1024 * 1024;

/* =========================================================
   FORMAT UKURAN FILE
========================================================= */

function formatFileSize(size) {
  if (!size) {
    return "0 KB";
  }

  if (size < 1024 * 1024) {
    return `${Math.max(
      1,
      Math.round(size / 1024)
    )} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}

/* =========================================================
   MAIN
========================================================= */

export default function UploadBerkasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* =======================================================
     ID PENDAFTARAN

     URL:
     /PPDB/daftar/uploadBerkas?id=UUID
  ======================================================= */

  const pendaftaranId =
    searchParams.get("id") || "";

  /* =======================================================
     STATE
  ======================================================= */

  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] =
    useState("");

  const [uploading, setUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [success, setSuccess] =
    useState(false);

  /* =======================================================
     HITUNG DOKUMEN TERPILIH
  ======================================================= */

  const selectedCount = useMemo(() => {
    return dokumenList.filter(
      (document) =>
        files[document.id]
    ).length;
  }, [files]);

  const allSelected =
    selectedCount ===
    dokumenList.length;

  /* =======================================================
     HANDLE FILE
  ======================================================= */

  const handleFileChange = (
    documentId,
    file
  ) => {
    if (!file) {
      return;
    }

    setSubmitError("");
    setSuccess(false);

    setErrors((current) => ({
      ...current,
      [documentId]: undefined,
    }));

    /* =====================================================
       CEK FORMAT
    ===================================================== */

    if (
      !ALLOWED_TYPES.includes(
        file.type
      )
    ) {
      setErrors((current) => ({
        ...current,
        [documentId]:
          "Format file harus JPG, PNG, atau PDF.",
      }));

      return;
    }

    /* =====================================================
       CEK UKURAN
    ===================================================== */

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      setErrors((current) => ({
        ...current,
        [documentId]:
          "Ukuran file maksimal 2MB.",
      }));

      return;
    }

    /* =====================================================
       SIMPAN FILE
    ===================================================== */

    setFiles((current) => ({
      ...current,
      [documentId]: file,
    }));
  };

  /* =======================================================
     HAPUS FILE
  ======================================================= */

  const handleRemoveFile = (
    documentId
  ) => {
    setFiles((current) => {
      const next = {
        ...current,
      };

      delete next[documentId];

      return next;
    });

    setErrors((current) => ({
      ...current,
      [documentId]: undefined,
    }));

    setSubmitError("");
    setSuccess(false);
  };

  /* =======================================================
     VALIDASI
  ======================================================= */

  const validate = () => {
    const nextErrors = {};

    if (!pendaftaranId) {
      setSubmitError(
        "ID pendaftaran tidak ditemukan."
      );

      return false;
    }

    dokumenList.forEach(
      (document) => {
        if (!files[document.id]) {
          nextErrors[document.id] =
            "Dokumen ini wajib diunggah.";
        }
      }
    );

    if (
      Object.keys(nextErrors)
        .length > 0
    ) {
      setErrors(nextErrors);

      setSubmitError(
        "Lengkapi seluruh dokumen persyaratan terlebih dahulu."
      );

      return false;
    }

    setErrors({});
    setSubmitError("");

    return true;
  };

  /* =======================================================
     SUBMIT

     Backend:
     POST /api/v1/ppdb/:id/berkas

     Field:
     file
     namaBerkas
  ======================================================= */

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setUploading(true);
      setSubmitError("");
      setSuccess(false);
      setUploadProgress(0);

      /* ===================================================
         UPLOAD SATU PER SATU
      =================================================== */

      for (
        let index = 0;
        index <
        dokumenList.length;
        index++
      ) {
        const document =
          dokumenList[index];

        const file =
          files[document.id];

        if (!file) {
          throw new Error(
            `${document.label} belum dipilih.`
          );
        }

        console.log(
          `Upload ${document.id}:`,
          file.name
        );

        /* =================================================
           REQUEST KE BE
        ================================================= */

        const response =
          await uploadBerkasPpdb(
            pendaftaranId,
            file,
            document.id
          );

        console.log(
          `Response upload ${document.id}:`,
          response
        );

        if (
          !response?.success
        ) {
          throw new Error(
            response?.message ||
              `Gagal mengupload ${document.label}.`
          );
        }

        /* =================================================
           UPDATE PROGRESS
        ================================================= */

        setUploadProgress(
          Math.round(
            ((index + 1) /
              dokumenList.length) *
              100
          )
        );
      }

      /* ===================================================
         SEMUA BERHASIL
      =================================================== */

      setUploadProgress(100);
      setSuccess(true);
    } catch (error) {
      console.error(
        "Error upload berkas PPDB:",
        error
      );

      setSubmitError(
        error?.message ||
          "Terjadi kesalahan saat mengupload berkas."
      );
    } finally {
      setUploading(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* =================================================
            KEMBALI
        ================================================= */}

        <button
          type="button"
          onClick={() => router.back()}
          disabled={uploading}
          className="mb-5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={15} />
          Kembali
        </button>

        {/* =================================================
            HEADER
        ================================================= */}

        <PpdbHeader
          eyebrow="PPDB Online"
          title="Dokumen Persyaratan"
          description="Lengkapi dan unggah dokumen persyaratan untuk menyelesaikan pendaftaran peserta didik baru."
        />

        <div className="mt-6">

          {/* =================================================
              STATUS
          ================================================= */}

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">

            {/* CARD 1 */}

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText size={18} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Dokumen wajib
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {dokumenList.length} Dokumen
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 2 */}

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FileCheck2 size={18} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Sudah dipilih
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {selectedCount} dari{" "}
                    {dokumenList.length}
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 3 */}

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Format
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    JPG, PNG, PDF
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              ID PENDAFTARAN
          ================================================= */}

          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <GraduationCap
                size={19}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  ID Pendaftaran
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-blue-900">
                  {pendaftaranId ||
                    "ID pendaftaran tidak ditemukan"}
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-700">
                  ID ini digunakan untuk mengaitkan
                  dokumen dengan data pendaftaran kamu.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {submitError && !success && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-rose-500"
              />

              <div>
                <p className="text-sm font-semibold text-rose-700">
                  Upload belum berhasil
                </p>

                <p className="mt-1 text-xs leading-5 text-rose-600">
                  {submitError}
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={22} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-emerald-800 sm:text-base">
                    Pendaftaran berhasil diselesaikan
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-emerald-700 sm:text-sm">
                    Seluruh dokumen persyaratan berhasil
                    diunggah dan dikirim ke sistem PPDB.
                    Selanjutnya berkas akan masuk ke proses
                    verifikasi sekolah.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              MAIN CARD
          ================================================= */}

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="border-b border-slate-100 pb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Tahap Dokumen
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-slate-800 sm:text-xl">
                    Upload Dokumen Persyaratan
                  </h2>

                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                    Unggah dokumen sesuai persyaratan.
                    Pastikan dokumen terlihat jelas dan
                    seluruh informasi dapat dibaca.
                  </p>
                </div>

                <div className="shrink-0">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-xs text-slate-500">
                      Kelengkapan
                    </span>

                    <span
                      className={`text-sm font-semibold ${
                        allSelected
                          ? "text-emerald-600"
                          : "text-slate-700"
                      }`}
                    >
                      {selectedCount}/
                      {dokumenList.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* =================================================
                  PROGRESS
              ================================================= */}

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-500">
                    Progress dokumen
                  </p>

                  <p className="text-xs font-semibold text-slate-600">
                    {Math.round(
                      (selectedCount /
                        dokumenList.length) *
                        100
                    )}
                    %
                  </p>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      allSelected
                        ? "bg-emerald-500"
                        : "bg-blue-600"
                    }`}
                    style={{
                      width: `${
                        (selectedCount /
                          dokumenList.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* =================================================
                INFO
            ================================================= */}

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
              <Info
                size={17}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div>
                <p className="text-xs font-semibold text-amber-800">
                  Perhatikan sebelum mengunggah
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-700">
                  Pastikan dokumen jelas, tidak terpotong,
                  dan seluruh informasi dapat dibaca.
                  Format yang digunakan adalah JPG, PNG,
                  atau PDF dengan ukuran maksimal 2MB per
                  file.
                </p>
              </div>
            </div>

            {/* =================================================
                DOCUMENT LIST
            ================================================= */}

            <div className="mt-6 space-y-5">
              {dokumenList.map(
                (document) => {
                  const selected =
                    files[document.id];

                  const error =
                    errors[document.id];

                  return (
                    <div
                      key={document.id}
                      className={`rounded-2xl border transition-all ${
                        error
                          ? "border-rose-300 bg-rose-50/30"
                          : selected
                            ? "border-emerald-200 bg-emerald-50/20"
                            : "border-slate-200 bg-white"
                      }`}
                    >
                      {/* =========================================
                          DOCUMENT HEADER
                      ========================================= */}

                      <div className="flex items-start gap-4 p-5">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                            selected
                              ? "bg-emerald-100 text-emerald-700"
                              : error
                                ? "bg-rose-100 text-rose-600"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {selected ? (
                            <Check size={17} />
                          ) : (
                            document.number
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h3 className="text-sm font-semibold text-slate-800 sm:text-base">
                                {document.label}
                              </h3>

                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {document.description}
                              </p>
                            </div>

                            <div className="shrink-0">
                              {selected ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                  <Check size={12} />
                                  Siap diunggah
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                                  Wajib diunggah
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* =========================================
                          UPLOAD AREA
                      ========================================= */}

                      <div className="px-5 pb-5">
                        {selected ? (
                          <div className="rounded-xl border border-emerald-200 bg-white p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                  <FileCheck2
                                    size={20}
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-800">
                                    {selected.name}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {formatFileSize(
                                      selected.size
                                    )}{" "}
                                    •{" "}
                                    {selected.type ===
                                    "application/pdf"
                                      ? "PDF"
                                      : "Gambar"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-2">
                                <label
                                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 ${
                                    uploading ||
                                    success
                                      ? "pointer-events-none opacity-50"
                                      : ""
                                  }`}
                                >
                                  <UploadCloud size={14} />
                                  Ganti Dokumen

                                  <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    className="hidden"
                                    disabled={
                                      uploading ||
                                      success
                                    }
                                    onChange={(
                                      event
                                    ) => {
                                      handleFileChange(
                                        document.id,
                                        event.target
                                          .files?.[0]
                                      );

                                      event.target.value =
                                        "";
                                    }}
                                  />
                                </label>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveFile(
                                      document.id
                                    )
                                  }
                                  disabled={
                                    uploading ||
                                    success
                                  }
                                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <label
                            className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-7 text-center transition ${
                              error
                                ? "border-rose-300 bg-rose-50/40 hover:border-rose-400"
                                : "border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/40"
                            } ${
                              uploading ||
                              success
                                ? "pointer-events-none opacity-50"
                                : ""
                            }`}
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
                              <UploadCloud
                                size={21}
                              />
                            </div>

                            <p className="mt-3 text-sm font-semibold text-slate-700">
                              Pilih dokumen untuk diunggah
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Klik area ini untuk memilih
                              file dari perangkat
                            </p>

                            <span className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition group-hover:bg-blue-700">
                              Pilih Dokumen
                            </span>

                            <p className="mt-3 text-[11px] text-slate-400">
                              JPG, PNG, atau PDF • Maks. 2MB
                            </p>

                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              className="hidden"
                              disabled={
                                uploading ||
                                success
                              }
                              onChange={(event) => {
                                handleFileChange(
                                  document.id,
                                  event.target
                                    .files?.[0]
                                );

                                event.target.value =
                                  "";
                              }}
                            />
                          </label>
                        )}

                        {/* ERROR */}
                        {error && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <AlertCircle
                              size={13}
                              className="shrink-0 text-rose-500"
                            />

                            <p className="text-xs text-rose-500">
                              {error}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* =================================================
                UPLOAD PROGRESS
            ================================================= */}

            {uploading && (
              <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2
                      size={15}
                      className="animate-spin text-blue-600"
                    />

                    <p className="text-xs font-semibold text-blue-700">
                      Mengunggah dokumen...
                    </p>
                  </div>

                  <span className="text-xs font-bold text-blue-600">
                    {uploadProgress}%
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${uploadProgress}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-[11px] text-blue-600">
                  Mohon jangan menutup halaman selama
                  proses upload berlangsung.
                </p>
              </div>
            )}

            {/* =================================================
                FOOTER ACTION
            ================================================= */}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() =>
                  router.back()
                }
                disabled={
                  uploading
                }
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft size={15} />
                Kembali
              </button>

              {success ? (
                <button
                  type="button"
                  onClick={() =>
                    router.push("/PPDB")
                  }
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  Selesai
                  <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    uploading ||
                    !pendaftaranId ||
                    !allSelected
                  }
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      Upload & Selesaikan
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <PpdbFooter />
    </div>
  );
}