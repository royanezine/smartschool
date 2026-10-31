"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  RotateCcw,
} from "lucide-react";

import PpdbHeader from "@/app/components/ppdb/PpdbHeader";
import PpdbFooter from "@/app/components/ppdb/PpdbFooter";
import { urlFormulirPendaftaran } from "@/app/components/ppdb/rutePpdb";

import {
  uploadBerkasPpdb,
  getDetailSaya,
  getPendaftarPpdbById,
  getOpsiPpdbSekolah,
} from "@/services/ppdb.service";
import { getJalurPpdbById } from "@/services/jalurPpdb.service";

export const SEMUA_BERKAS_PPDB = {
  KK: {
    id: "KK",
    label: "Kartu Keluarga",
    description: "Unggah Kartu Keluarga yang memuat data calon siswa.",
  },
  AKTE: {
    id: "AKTE",
    label: "Akta Kelahiran",
    description: "Unggah Akta Kelahiran calon siswa.",
  },
  IJAZAH: {
    id: "IJAZAH",
    label: "Ijazah / Surat Keterangan Lulus",
    description: "Unggah Ijazah atau dokumen kelulusan calon siswa.",
  },
  SERTIFIKAT: {
    id: "SERTIFIKAT",
    label: "Sertifikat Prestasi",
    description: "Unggah sertifikat atau piagam prestasi calon siswa.",
  },
  SKTM: {
    id: "SKTM",
    label: "Surat Keterangan Tidak Mampu (SKTM)",
    description: "Unggah Surat Keterangan Tidak Mampu dari kelurahan/desa setempat.",
  },
  KIP: {
    id: "KIP",
    label: "Kartu Indonesia Pintar (KIP)",
    description: "Unggah Kartu Indonesia Pintar (KIP) atau KPS calon siswa.",
  },
  SURAT_TUGAS: {
    id: "SURAT_TUGAS",
    label: "Surat Penugasan Orang Tua",
    description: "Unggah surat penugasan kerja atau mutasi instansi orang tua/wali.",
  },
};

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SESI_PENDAFTARAN = "ppdb_pendaftaran_id";
const SESI_SUBMISSION = "ppdb_last_submission";

function isUuid(value) {
  return UUID_REGEX.test(String(value || "").trim());
}

function formatFileSize(size) {
  if (!size) {
    return "0 KB";
  }

  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function sanitizeErrorMessage(rawMessage, fallback = "Terjadi kesalahan.") {
  if (!rawMessage || typeof rawMessage !== "string") return fallback;
  return (
    rawMessage
      .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]")
      .replace(/(?:token|tokenPendaftaran)\s*[:=]\s*[^\s,]+/gi, "token: [REDACTED]")
      .replace(/ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g, "[REDACTED]")
      .trim() || fallback
  );
}

function pesanKesalahan(error, fallback) {
  const message = String(error?.message || "").trim();

  if (
    /failed to fetch|networkerror|load failed|network request failed/i.test(
      message
    )
  ) {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi.";
  }

  return sanitizeErrorMessage(message || fallback);
}

function bacaRingkasan() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(SESI_SUBMISSION);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function simpanBuktiBerkas(pendaftaranId, namaBerkas, berkas) {
  if (typeof window === "undefined") {
    return;
  }

  const ringkasan = bacaRingkasan();

  const dasar =
    ringkasan &&
    String(ringkasan.pendaftaranId) === String(pendaftaranId)
      ? ringkasan
      : {
          pendaftaranId: String(pendaftaranId),
          nomorPendaftaran: null,
          namaLengkap: "",
          status: null,
          berkas: [],
        };

  const berkasLain = Array.isArray(dasar.berkas)
    ? dasar.berkas.filter(
        (item) => item?.namaBerkas !== namaBerkas
      )
    : [];

  sessionStorage.setItem(
    SESI_SUBMISSION,
    JSON.stringify({
      ...dasar,
      berkas: [
        ...berkasLain,
        {
          namaBerkas,
          id: berkas?.id || null,
          urlFile: berkas?.urlFile || null,
          status: berkas?.status || null,
          diterimaPada: new Date().toISOString(),
        },
      ],
    })
  );
}

function buatStatusAwal() {
  return Object.fromEntries(
    Object.keys(SEMUA_BERKAS_PPDB).map((id) => [
      id,
      {
        file: null,
        status: "idle",
        error: "",
        berkas: null,
      },
    ])
  );
}

function statusBadge(documentState) {
  if (documentState.status === "success") {
    return {
      label: "Berhasil diunggah",
      className:
        "bg-emerald-100 text-emerald-700",
      Icon: Check,
    };
  }

  if (documentState.status === "uploading") {
    return {
      label: "Sedang diunggah",
      className: "bg-blue-100 text-blue-700",
      Icon: Loader2,
    };
  }

  if (documentState.status === "error") {
    return {
      label: "Gagal diunggah",
      className: "bg-rose-100 text-rose-700",
      Icon: AlertCircle,
    };
  }

  if (documentState.file) {
    return {
      label: "Siap diunggah",
      className: "bg-amber-100 text-amber-700",
      Icon: UploadCloud,
    };
  }

  return {
    label: "Belum diunggah",
    className: "bg-slate-100 text-slate-500",
    Icon: FileText,
  };
}

export default function PpdbUploadBerkas({ basePath = "" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryId = searchParams.get("id") || "";

  const uploadLockRef = useRef(false);

  const [pendaftaranId, setPendaftaranId] = useState("");
  const [tokenPendaftaran, setTokenPendaftaran] = useState("");
  const [nomorPendaftaran, setNomorPendaftaran] = useState("");
  const [idStatus, setIdStatus] = useState("checking");
  const [idError, setIdError] = useState("");

  const [berkasWajib, setBerkasWajib] = useState([
    "KK",
    "AKTE",
    "IJAZAH",
  ]);

  const dokumenList = useMemo(() => {
    const list =
      Array.isArray(berkasWajib) && berkasWajib.length > 0
        ? berkasWajib
        : ["KK", "AKTE", "IJAZAH"];

    return list.map((id, index) => {
      const meta = SEMUA_BERKAS_PPDB[id] || {
        id,
        label: id,
        description: `Unggah dokumen ${id} calon siswa.`,
      };
      return {
        ...meta,
        number: String(index + 1).padStart(2, "0"),
      };
    });
  }, [berkasWajib]);

  const [dokumen, setDokumen] = useState(buatStatusAwal);
  const [submitError, setSubmitError] = useState("");
  const [uploadingId, setUploadingId] = useState("");
  const [uploadingAll, setUploadingAll] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const dariQuery = queryId.trim();

    if (dariQuery && !isUuid(dariQuery)) {
      setIdStatus("invalid");
      setIdError(
        "ID pendaftaran pada tautan tidak valid. Buka kembali halaman ini dari alur pendaftaran atau dari tautan yang diberikan sekolah."
      );
      return;
    }

    let id = dariQuery;

    if (!id) {
      id = String(
        sessionStorage.getItem(SESI_PENDAFTARAN) || ""
      ).trim();

      if (id && !isUuid(id)) {
        sessionStorage.removeItem(SESI_PENDAFTARAN);
        id = "";
      }
    }

    if (!id) {
      setIdStatus("invalid");
      setIdError(
        "ID pendaftaran tidak ditemukan. Silakan isi formulir pendaftaran terlebih dahulu agar dokumen dapat dikaitkan dengan data Anda."
      );
      return;
    }

    const queryToken = String(
      searchParams.get("token") || searchParams.get("tokenPendaftaran") || ""
    ).trim();

    let effectiveToken = queryToken;

    if (effectiveToken) {
      try {
        sessionStorage.setItem("ppdb_token_pendaftaran", effectiveToken);
      } catch {
      }
    } else {
      try {
        effectiveToken = String(
          sessionStorage.getItem("ppdb_token_pendaftaran") || ""
        ).trim();
      } catch {
      }
    }

    const ringkasan = bacaRingkasan();

    if (
      ringkasan &&
      String(ringkasan.pendaftaranId) === id
    ) {
      if (!effectiveToken && ringkasan.tokenPendaftaran) {
        effectiveToken = String(ringkasan.tokenPendaftaran).trim();
      }

      if (ringkasan.nomorPendaftaran) {
        setNomorPendaftaran(
          String(ringkasan.nomorPendaftaran)
        );
      }

      if (Array.isArray(ringkasan.berkas) && ringkasan.berkas.length > 0) {
        setDokumen((current) => {
          const next = { ...current };
          for (const item of ringkasan.berkas) {
            if (item?.namaBerkas && next[item.namaBerkas]) {
              next[item.namaBerkas] = {
                ...next[item.namaBerkas],
                status: "success",
                berkas: item,
                error: "",
              };
            }
          }
          return next;
        });
      }
    }

    setTokenPendaftaran(effectiveToken);
    setPendaftaranId(id);
    setIdStatus("ready");
    setIdError("");
  }, [queryId, searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function muatDataBackend() {
      const jalurId =
        searchParams.get("jalurPpdbId") || searchParams.get("jalurId");
      const sekolahId = searchParams.get("sekolahId");

      // 1. Ambil berkas wajib langsung dari jalurPpdb jika ID jalur ada di URL
      if (jalurId) {
        try {
          const jalurRes = await getJalurPpdbById(jalurId);
          if (
            !cancelled &&
            jalurRes?.success &&
            Array.isArray(jalurRes?.data?.berkasWajib) &&
            jalurRes.data.berkasWajib.length > 0
          ) {
            setBerkasWajib(jalurRes.data.berkasWajib);
          }
        } catch {}
      }

      // 2. Ambil detail pendaftar saya via token pendaftaran
      if (tokenPendaftaran) {
        try {
          const detailRes = await getDetailSaya(tokenPendaftaran);
          if (!cancelled && detailRes?.success && detailRes?.data) {
            const wajib =
              detailRes.data.berkas?.wajib ||
              detailRes.data.jalur?.berkasWajib;
            if (Array.isArray(wajib) && wajib.length > 0) {
              setBerkasWajib(wajib);
            }
            if (detailRes.data.pendaftar?.nomorPendaftaran) {
              setNomorPendaftaran(detailRes.data.pendaftar.nomorPendaftaran);
            }
            if (Array.isArray(detailRes.data.berkas?.terunggah)) {
              setDokumen((current) => {
                const next = { ...current };
                for (const item of detailRes.data.berkas.terunggah) {
                  if (item?.namaBerkas && next[item.namaBerkas]) {
                    next[item.namaBerkas] = {
                      ...next[item.namaBerkas],
                      status: "success",
                      berkas: item,
                      error: "",
                    };
                  }
                }
                return next;
              });
            }
            return;
          }
        } catch {}
      }

      // 3. Ambil detail pendaftar sebagai admin jika ID pendaftaran tersedia
      if (pendaftaranId) {
        try {
          const pendaftarRes = await getPendaftarPpdbById(pendaftaranId);
          if (!cancelled && pendaftarRes?.success && pendaftarRes?.data) {
            const wajib = pendaftarRes.data.jalurPpdb?.berkasWajib;
            if (Array.isArray(wajib) && wajib.length > 0) {
              setBerkasWajib(wajib);
            }
            if (pendaftarRes.data.nomorPendaftaran) {
              setNomorPendaftaran(pendaftarRes.data.nomorPendaftaran);
            }
            if (Array.isArray(pendaftarRes.data.berkasPpdb)) {
              setDokumen((current) => {
                const next = { ...current };
                for (const item of pendaftarRes.data.berkasPpdb) {
                  if (item?.namaBerkas && next[item.namaBerkas]) {
                    next[item.namaBerkas] = {
                      ...next[item.namaBerkas],
                      status: "success",
                      berkas: item,
                      error: "",
                    };
                  }
                }
                return next;
              });
            }
            return;
          }
        } catch {}
      }

      // 4. Jika sekolahId tersedia, ambil opsi PPDB sekolah
      if (sekolahId) {
        try {
          const opsiRes = await getOpsiPpdbSekolah(sekolahId);
          if (
            !cancelled &&
            opsiRes?.success &&
            Array.isArray(opsiRes?.data?.jalur)
          ) {
            const target = jalurId
              ? opsiRes.data.jalur.find((j) => j.id === jalurId)
              : opsiRes.data.jalur[0];
            if (
              target &&
              Array.isArray(target.berkasWajib) &&
              target.berkasWajib.length > 0
            ) {
              setBerkasWajib(target.berkasWajib);
            }
          }
        } catch {}
      }
    }

    if (pendaftaranId || tokenPendaftaran || searchParams.get("jalurPpdbId")) {
      muatDataBackend();
    }

    return () => {
      cancelled = true;
    };
  }, [pendaftaranId, tokenPendaftaran, searchParams]);

  const berhasilCount = useMemo(
    () =>
      dokumenList.filter(
        (document) =>
          dokumen[document.id]?.status === "success"
      ).length,
    [dokumen, dokumenList]
  );

  const selectedCount = useMemo(
    () =>
      dokumenList.filter(
        (document) => Boolean(dokumen[document.id]?.file)
      ).length,
    [dokumen, dokumenList]
  );

  const allSuccess = berhasilCount === dokumenList.length;

  const sedangSibuk = uploadingAll || Boolean(uploadingId);

  const selesaiUrl = `${basePath}/PPDB/daftar/kirimPendaftaran?id=${encodeURIComponent(
    pendaftaranId
  )}`;

  const handleFileChange = (documentId, file) => {
    if (!file || sedangSibuk) {
      return;
    }

    setSubmitError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setDokumen((current) => ({
        ...current,
        [documentId]: {
          ...current[documentId],
          error: "Format file harus JPG, PNG, atau PDF.",
        },
      }));

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setDokumen((current) => ({
        ...current,
        [documentId]: {
          ...current[documentId],
          error: "Ukuran file maksimal 5MB.",
        },
      }));

      return;
    }

    setDokumen((current) => {
      const sebelumnya = current[documentId];

      return {
        ...current,
        [documentId]: {
          ...sebelumnya,
          file,
          status: "idle",
          error: "",
          berkas: sebelumnya.berkas,
        },
      };
    });
  };

  const handleRemoveFile = (documentId) => {
    if (sedangSibuk) {
      return;
    }

    setDokumen((current) => ({
      ...current,
      [documentId]: {
        ...current[documentId],
        file: null,
        status:
          current[documentId].status === "success"
            ? "success"
            : "idle",
        error: "",
      },
    }));

    setSubmitError("");
  };

  const unggahFile = async (documentId, file) => {
    setDokumen((current) => ({
      ...current,
      [documentId]: {
        ...current[documentId],
        status: "uploading",
        error: "",
      },
    }));

    setUploadingId(documentId);

    try {
      const response = await uploadBerkasPpdb(
        pendaftaranId,
        file,
        documentId,
        tokenPendaftaran
      );

      if (!response?.success || !response?.data) {
        throw new Error(
          response?.message ||
            "Server tidak mengembalikan konfirmasi upload."
        );
      }

      setDokumen((current) => ({
        ...current,
        [documentId]: {
          ...current[documentId],
          status: "success",
          error: "",
          berkas: response.data,
        },
      }));

      simpanBuktiBerkas(
        pendaftaranId,
        documentId,
        response.data
      );

      return true;
    } catch (error) {
      setDokumen((current) => ({
        ...current,
        [documentId]: {
          ...current[documentId],
          status: "error",
          error: pesanKesalahan(
            error,
            "Dokumen gagal diunggah. Silakan coba lagi."
          ),
        },
      }));

      return false;
    } finally {
      setUploadingId("");
    }
  };

  const handleUploadOne = async (documentId) => {
    if (
      uploadLockRef.current ||
      sedangSibuk ||
      !pendaftaranId
    ) {
      return;
    }

    const file = dokumen[documentId]?.file;

    if (!file) {
      return;
    }

    uploadLockRef.current = true;
    setSubmitError("");

    try {
      await unggahFile(documentId, file);
    } finally {
      uploadLockRef.current = false;
    }
  };

  const handleUploadAll = async () => {
    if (
      uploadLockRef.current ||
      sedangSibuk ||
      !pendaftaranId ||
      allSuccess
    ) {
      return;
    }

    uploadLockRef.current = true;
    setUploadingAll(true);
    setSubmitError("");

    let adaYangGagal = false;
    let adaYangBelumDipilih = false;

    try {
      for (const document of dokumenList) {
        const current = dokumen[document.id];

        if (current?.status === "success") {
          continue;
        }

        if (!current?.file) {
          adaYangBelumDipilih = true;
          continue;
        }

        const berhasil = await unggahFile(
          document.id,
          current.file
        );

        if (!berhasil) {
          adaYangGagal = true;
        }
      }

      if (adaYangBelumDipilih) {
        setSubmitError(
          "Masih ada dokumen yang belum dipilih. Pilih seluruh dokumen wajib sebelum menyelesaikan pendaftaran."
        );
      } else if (adaYangGagal) {
        setSubmitError(
          "Beberapa dokumen gagal diunggah. Gunakan tombol Coba Lagi pada dokumen tersebut; dokumen yang sudah berhasil tidak perlu diunggah ulang."
        );
      }
    } finally {
      setUploadingAll(false);
      uploadLockRef.current = false;
    }
  };

  if (idStatus === "invalid") {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <PpdbHeader
            eyebrow="PPDB Online"
            title="Unggah Dokumen"
            description="Dokumen hanya dapat diunggah setelah data pendaftaran berhasil dikirim."
          />

          <div className="mt-6 rounded-2xl border border-rose-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertCircle size={21} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  Halaman upload tidak dapat dibuka
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {idError}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  router.push(urlFormulirPendaftaran(basePath))
                }
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Isi Formulir Pendaftaran
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(`${basePath}/PPDB`)
                }
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <ArrowLeft size={15} />
                Kembali ke PPDB
              </button>
            </div>
          </div>
        </main>

        <PpdbFooter />
      </div>
    );
  }

  if (idStatus === "checking") {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={17} className="animate-spin" />
            Memeriksa data pendaftaran...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.push(urlFormulirPendaftaran(basePath))}
          disabled={sedangSibuk}
          className="mb-5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={15} />
          Kembali
        </button>

        <PpdbHeader
          eyebrow="PPDB Online"
          title="Dokumen Persyaratan"
          description="Unggah dokumen persyaratan satu per satu. Dokumen yang sudah berhasil tidak perlu diunggah ulang jika ada dokumen lain yang gagal."
        />

        <div className="mt-6">
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
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

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FileCheck2 size={18} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Berhasil diunggah
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {berhasilCount} dari {dokumenList.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">Format</p>

                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    JPG, PNG, PDF
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <GraduationCap
                size={19}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {nomorPendaftaran
                    ? "Nomor Pendaftaran"
                    : "Referensi Pendaftaran"}
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-blue-900">
                  {nomorPendaftaran ||
                    "Nomor pendaftaran belum tersedia dari server"}
                </p>

                <p className="mt-1 break-all text-[11px] leading-5 text-blue-700">
                  ID pendaftaran: {pendaftaranId}
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-700">
                  Dokumen akan dikaitkan dengan data
                  pendaftaran ini. Jangan membagikan
                  tautan halaman ini kepada orang lain.
                </p>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-rose-500"
              />

              <div>
                <p className="text-sm font-semibold text-rose-700">
                  Upload belum selesai
                </p>

                <p className="mt-1 text-xs leading-5 text-rose-600">
                  {submitError}
                </p>
              </div>
            </div>
          )}

          {allSuccess && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={22} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-emerald-800 sm:text-base">
                    Seluruh dokumen berhasil diunggah
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-emerald-700 sm:text-sm">
                    Server memberikan konfirmasi berhasil
                    untuk ketiga dokumen. Berkas akan
                    diperiksa oleh panitia PPDB sekolah.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
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
                    Pilih file lalu unggah. Setiap dokumen
                    memiliki status sendiri sehingga jika
                    satu gagal, Anda hanya perlu mencoba
                    ulang dokumen tersebut.
                  </p>
                </div>

                <div className="shrink-0">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-xs text-slate-500">
                      Berhasil
                    </span>

                    <span
                      className={`text-sm font-semibold ${
                        allSuccess
                          ? "text-emerald-600"
                          : "text-slate-700"
                      }`}
                    >
                      {berhasilCount}/{dokumenList.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-500">
                    Progress upload
                  </p>

                  <p className="text-xs font-semibold text-slate-600">
                    {Math.round(
                      (berhasilCount / dokumenList.length) * 100
                    )}
                    %
                  </p>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      allSuccess
                        ? "bg-emerald-500"
                        : "bg-blue-600"
                    }`}
                    style={{
                      width: `${
                        (berhasilCount / dokumenList.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

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
                  Format JPG, PNG, atau PDF dengan ukuran
                  maksimal 5MB per file.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {dokumenList.map((document) => {
                const current = dokumen[document.id];
                const badge = statusBadge(current);
                const BadgeIcon = badge.Icon;

                return (
                  <div
                    key={document.id}
                    className={`rounded-2xl border transition-all ${
                      current.status === "error"
                        ? "border-rose-300 bg-rose-50/30"
                        : current.status === "success"
                          ? "border-emerald-200 bg-emerald-50/20"
                          : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4 p-5">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                          current.status === "success"
                            ? "bg-emerald-100 text-emerald-700"
                            : current.status === "error"
                              ? "bg-rose-100 text-rose-600"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {current.status === "success" ? (
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
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}
                            >
                              <BadgeIcon
                                size={12}
                                className={
                                  current.status === "uploading"
                                    ? "animate-spin"
                                    : ""
                                }
                              />
                              {badge.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 pb-5">
                      {current.file ? (
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <FileCheck2 size={20} />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {current.file.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {formatFileSize(
                                    current.file.size
                                  )}{" "}
                                  •{" "}
                                  {current.file.type ===
                                  "application/pdf"
                                    ? "PDF"
                                    : "Gambar"}
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                              {current.status !== "success" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUploadOne(
                                      document.id
                                    )
                                  }
                                  disabled={
                                    sedangSibuk ||
                                    current.status === "uploading"
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {current.status ===
                                  "uploading" ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : current.status ===
                                    "error" ? (
                                    <RotateCcw size={14} />
                                  ) : (
                                    <UploadCloud size={14} />
                                  )}

                                  {current.status === "uploading"
                                    ? "Mengunggah..."
                                    : current.status === "error"
                                      ? "Coba Lagi"
                                      : "Unggah"}
                                </button>
                              )}

                              <label
                                className={`inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 ${
                                  sedangSibuk
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
                                  disabled={sedangSibuk}
                                  onChange={(event) => {
                                    handleFileChange(
                                      document.id,
                                      event.target.files?.[0]
                                    );

                                    event.target.value = "";
                                  }}
                                />
                              </label>

                              {current.status !== "success" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveFile(
                                      document.id
                                    )
                                  }
                                  disabled={sedangSibuk}
                                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                  aria-label={`Batalkan pilihan file ${document.label}`}
                                >
                                  <X size={15} />
                                </button>
                              )}
                            </div>
                          </div>

                          {current.berkas &&
                            current.status !== "success" && (
                              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-700">
                                File sebelumnya sudah diterima
                                server. Unggah file baru untuk
                                menggantinya.
                              </p>
                            )}
                        </div>
                      ) : (
                        <label
                          className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-7 text-center transition ${
                            current.error
                              ? "border-rose-300 bg-rose-50/40 hover:border-rose-400"
                              : "border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/40"
                          } ${
                            sedangSibuk
                              ? "pointer-events-none opacity-50"
                              : ""
                          }`}
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
                            <UploadCloud size={21} />
                          </div>

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            Pilih dokumen untuk diunggah
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Klik area ini untuk memilih file
                            dari perangkat
                          </p>

                          <span className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition group-hover:bg-blue-700">
                            Pilih Dokumen
                          </span>

                          <p className="mt-3 text-[11px] text-slate-400">
                            JPG, PNG, atau PDF • Maks. 5MB
                          </p>

                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            disabled={sedangSibuk}
                            onChange={(event) => {
                              handleFileChange(
                                document.id,
                                event.target.files?.[0]
                              );

                              event.target.value = "";
                            }}
                          />
                        </label>
                      )}

                      {current.error && (
                        <div className="mt-2 flex items-start gap-1.5">
                          <AlertCircle
                            size={13}
                            className="mt-0.5 shrink-0 text-rose-500"
                          />

                          <p className="text-xs text-rose-500">
                            {current.error}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {uploadingAll && (
              <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center gap-2">
                  <Loader2
                    size={15}
                    className="animate-spin text-blue-600"
                  />

                  <p className="text-xs font-semibold text-blue-700">
                    Mengunggah dokumen yang belum berhasil...
                  </p>
                </div>

                <p className="mt-2 text-[11px] text-blue-600">
                  Dokumen yang sudah berhasil tidak akan
                  diunggah ulang.
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() =>
                  router.push(urlFormulirPendaftaran(basePath))
                }
                disabled={sedangSibuk}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft size={15} />
                Kembali
              </button>

              {allSuccess ? (
                <button
                  type="button"
                  onClick={() => router.push(selesaiUrl)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  Selesai
                  <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleUploadAll}
                  disabled={
                    sedangSibuk ||
                    !pendaftaranId ||
                    selectedCount === 0
                  }
                  aria-busy={uploadingAll}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploadingAll ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      Unggah Dokumen
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
