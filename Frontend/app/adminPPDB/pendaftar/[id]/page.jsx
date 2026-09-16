"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  GraduationCap,
  Loader2,
  ShieldCheck,
  Upload,
  User,
  X,
  XCircle,
} from "lucide-react";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import {
  uploadBerkasPpdb,
  verifikasiPpdb,
} from "../../../../services/ppdb.service";


/* =========================================================
   DATA DUMMY LAMA
   =========================================================
   Karena BE saat ini belum mempunyai GET /ppdb/:id,
   data detail belum bisa diambil dari database.

   Struktur ini sengaja dipertahankan supaya desain halaman
   kamu tidak berubah.
========================================================= */

const initialPendaftar = [
  {
    id: 1,

    noPendaftaran: "PPDB001",
    status: "Menunggu",

    jalur: "Zonasi",
    gelombang: "Gelombang 1",
    tanggalDaftar: "2026-07-01",

    pribadi: {
      nama: "Ahmad Fauzan",
      nik: "3273010101010001",
      nisn: "0087654321",
      tempatLahir: "Tasikmalaya",
      tanggalLahir: "2012-05-12",
      jenisKelamin: "Laki-laki",
      alamat:
        "Jl. Raya Tasikmalaya No. 10, Tasikmalaya",
      telepon: "081234567890",
      email: "ahmad@example.com",
    },

    ortu: {
      namaAyah: "Budi Santoso",
      namaIbu: "Siti Aminah",
      telepon: "081234567891",
      pekerjaanAyah: "Wiraswasta",
      pekerjaanIbu: "Ibu Rumah Tangga",
    },

    sekolah: {
      asalSekolah: "SD Negeri 01 Tasikmalaya",
      npsn: "20212345",
      tahunLulus: "2026",
      nilaiRapor: "87.50",
    },

    jurusan: {
      pilihan1: "IPA",
      pilihan2: "IPS",
      pilihan3: "-",
    },

    berkas: [
      {
        id: "KK",
        nama: "Kartu Keluarga",
        file: "kk-ahmad.pdf",
        url: "#",
        status: "Menunggu",
      },
      {
        id: "AKTE",
        nama: "Akta Kelahiran",
        file: "akte-ahmad.pdf",
        url: "#",
        status: "Menunggu",
      },
      {
        id: "IJAZAH",
        nama: "Ijazah / Surat Keterangan Lulus",
        file: "ijazah-ahmad.pdf",
        url: "#",
        status: "Menunggu",
      },
    ],
  },
];


/* =========================================================
   STYLE STATUS
========================================================= */

const STATUS_STYLES = {
  Menunggu:
    "bg-amber-50 text-amber-600 border-amber-100",

  Lulus:
    "bg-emerald-50 text-emerald-600 border-emerald-100",

  Ditolak:
    "bg-rose-50 text-rose-600 border-rose-100",

  "Perlu Perbaikan":
    "bg-blue-50 text-blue-600 border-blue-100",

  Terverifikasi:
    "bg-emerald-50 text-emerald-600 border-emerald-100",
};


/* =========================================================
   HELPER
========================================================= */

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}


/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({
  title,
  icon: Icon,
  children,
}) {
  return (
    <section className="bg-white rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <Icon size={15} />
        </div>

        <h2 className="text-sm font-semibold text-slate-700">
          {title}
        </h2>
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}


/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-[11px] text-slate-400 mb-1">
        {label}
      </p>

      <p className="text-sm text-slate-700 font-medium break-words">
        {value || "-"}
      </p>
    </div>
  );
}


/* =========================================================
   PAGE
========================================================= */

export default function PendaftarDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [status, setStatus] =
    useState("Menunggu");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /**
   * Modal konfirmasi.
   *
   * Hanya:
   * - lulus
   * - ditolak
   */
  const [confirmAction, setConfirmAction] =
    useState(null);

  /**
   * Untuk BE:
   *
   * lulus membutuhkan kelasId.
   */
  const [kelasId, setKelasId] =
    useState("");

  /**
   * Upload
   */
  const [uploadLoading, setUploadLoading] =
    useState(false);

  const [uploadTarget, setUploadTarget] =
    useState(null);

  /**
   * Preview
   */
  const [previewFile, setPreviewFile] =
    useState(null);


  /* =======================================================
     DATA
  ======================================================= */

  const data = useMemo(() => {
    const found =
      initialPendaftar.find(
        (p) =>
          String(p.id) ===
          String(params?.id)
      );

    return (
      found ||
      initialPendaftar[0]
    );
  }, [params?.id]);


  /* =======================================================
     SIDEBAR
  ======================================================= */

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };


  /* =======================================================
     STATUS
  ======================================================= */

  const currentStatus =
    status || data.status;


  /* =======================================================
     CONFIRM ACTION
  ======================================================= */

  const openConfirm = (action) => {
    setError("");
    setSuccess("");
    setKelasId("");
    setConfirmAction(action);
  };


  /* =======================================================
     VERIFIKASI / TOLAK
     ======================================================= */

  const handleConfirm = async () => {
    if (!confirmAction) return;

    setError("");
    setSuccess("");

    /**
     * =====================================================
     * TOLAK
     * =====================================================
     */

    if (confirmAction === "ditolak") {
      try {
        setLoading(true);

        const response =
          await verifikasiPpdb(
            String(data.id),
            {
              status: "ditolak",
            }
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Gagal menolak pendaftar."
          );
        }

        setStatus("Ditolak");

        setSuccess(
          "Pendaftar berhasil ditolak."
        );

        setConfirmAction(null);
      } catch (err) {
        console.error(
          "Gagal menolak pendaftar:",
          err
        );

        setError(
          err?.message ||
            "Gagal menolak pendaftar."
        );
      } finally {
        setLoading(false);
      }

      return;
    }


    /**
     * =====================================================
     * LULUS
     * =====================================================
     *
     * BE membutuhkan kelasId.
     */

    if (confirmAction === "lulus") {
      if (!kelasId.trim()) {
        setError(
          "Kelas ID wajib diisi untuk pendaftar yang lulus."
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await verifikasiPpdb(
            String(data.id),
            {
              status: "lulus",
              kelasId: kelasId.trim(),
            }
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Gagal meluluskan pendaftar."
          );
        }

        setStatus("Lulus");

        setSuccess(
          "Pendaftar berhasil dinyatakan lulus dan dikonversi menjadi siswa."
        );

        setConfirmAction(null);
        setKelasId("");
      } catch (err) {
        console.error(
          "Gagal meluluskan pendaftar:",
          err
        );

        setError(
          err?.message ||
            "Gagal meluluskan pendaftar."
        );
      } finally {
        setLoading(false);
      }
    }
  };


  /* =======================================================
     UPLOAD BERKAS
  ======================================================= */

  const handleUpload = async (
    event,
    berkas
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    /**
     * Validasi sederhana FE.
     */
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Format file harus PDF, JPG, JPEG, atau PNG."
      );

      event.target.value = "";
      return;
    }

    try {
      setUploadLoading(true);

      setUploadTarget(
        berkas.id
      );

      const response =
        await uploadBerkasPpdb(
          String(data.id),
          file,
          berkas.id
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Gagal mengupload berkas."
        );
      }

      setSuccess(
        `${berkas.nama} berhasil diupload.`
      );
    } catch (err) {
      console.error(
        "Upload berkas PPDB:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengupload berkas."
      );
    } finally {
      setUploadLoading(false);
      setUploadTarget(null);

      event.target.value = "";
    }
  };


  /* =======================================================
     PREVIEW
  ======================================================= */

  const handlePreview = (berkas) => {
    setPreviewFile(berkas);
  };


  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = () => {
    router.push(
      "/adminPPDB/pendaftar"
    );
  };


  return (
    <div className="flex h-screen w-full bg-[#EEF0F2] overflow-hidden">

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Sidebar
        role="adminPPDB"
        active="pendaftar"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />


      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin PPDB",
            email:
              "adminppdb@smartschool.com",
            avatar: "PP",
          }}
        />


        <main className="flex-1 overflow-y-auto">

          <div className="w-full p-4 md:p-6 lg:p-8">

            <div className="w-full max-w-[1320px] mx-auto space-y-5">


              {/* =================================================
                  BREADCRUMB
              ================================================= */}

              <div className="flex items-center gap-1 text-xs text-slate-400">

                <button
                  type="button"
                  onClick={handleBack}
                  className="hover:text-blue-600 transition-colors"
                >
                  PPDB
                </button>

                <ChevronRight size={12} />

                <button
                  type="button"
                  onClick={handleBack}
                  className="hover:text-blue-600 transition-colors"
                >
                  Pendaftar
                </button>

                <ChevronRight size={12} />

                <span className="text-slate-600 font-medium">
                  Detail Pendaftar
                </span>

              </div>


              {/* =================================================
                  ALERT ERROR
              ================================================= */}

              {error && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 flex items-start gap-3">

                  <XCircle
                    size={18}
                    className="text-rose-500 mt-0.5 flex-shrink-0"
                  />

                  <div className="min-w-0">

                    <p className="text-sm font-medium text-rose-700">
                      Terjadi kesalahan
                    </p>

                    <p className="text-xs text-rose-600 mt-0.5">
                      {error}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                    className="ml-auto text-rose-400 hover:text-rose-600"
                  >
                    <X size={15} />
                  </button>

                </div>
              )}


              {/* =================================================
                  ALERT SUCCESS
              ================================================= */}

              {success && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-start gap-3">

                  <CheckCircle2
                    size={18}
                    className="text-emerald-500 mt-0.5 flex-shrink-0"
                  />

                  <div className="min-w-0">

                    <p className="text-sm font-medium text-emerald-700">
                      Berhasil
                    </p>

                    <p className="text-xs text-emerald-600 mt-0.5">
                      {success}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSuccess("")
                    }
                    className="ml-auto text-emerald-400 hover:text-emerald-600"
                  >
                    <X size={15} />
                  </button>

                </div>
              )}


              {/* =================================================
                  HEADER DETAIL
              ================================================= */}

              <section className="bg-white rounded-xl p-5">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

                  <div className="flex items-center gap-4">

                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <User size={22} />
                    </div>

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <h1 className="text-lg font-semibold text-slate-800">
                          {data.pribadi?.nama ||
                            "-"}
                        </h1>

                        <span
                          className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                            STATUS_STYLES[
                              currentStatus
                            ] ||
                            STATUS_STYLES.Menunggu
                          }`}
                        >
                          {currentStatus}
                        </span>

                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">

                        <p className="text-xs text-slate-400">
                          No. Pendaftaran{" "}
                          <span className="font-medium text-slate-600">
                            {data.noPendaftaran ||
                              "-"}
                          </span>
                        </p>

                        <p className="text-xs text-slate-400">
                          Jalur{" "}
                          <span className="font-medium text-slate-600">
                            {data.jalur ||
                              "-"}
                          </span>
                        </p>

                        <p className="text-xs text-slate-400">
                          Daftar{" "}
                          <span className="font-medium text-slate-600">
                            {formatTanggal(
                              data.tanggalDaftar
                            )}
                          </span>
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* ACTION */}

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-2 border border-slate-200 rounded-md transition-colors"
                    >
                      <ArrowLeft size={14} />
                      Kembali
                    </button>


                    {/* TOLAK */}

                    {currentStatus !==
                      "Ditolak" &&
                      currentStatus !==
                        "Lulus" && (
                        <button
                          type="button"
                          onClick={() =>
                            openConfirm(
                              "ditolak"
                            )
                          }
                          disabled={loading}
                          className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 border border-rose-200 rounded-md transition-colors disabled:opacity-50"
                        >
                          <XCircle size={14} />
                          Tolak
                        </button>
                      )}


                    {/* LULUS */}

                    {currentStatus !==
                      "Ditolak" &&
                      currentStatus !==
                        "Lulus" && (
                        <button
                          type="button"
                          onClick={() =>
                            openConfirm(
                              "lulus"
                            )
                          }
                          disabled={loading}
                          className="flex items-center gap-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors disabled:opacity-50"
                        >
                          <ShieldCheck
                            size={14}
                          />
                          Verifikasi
                        </button>
                      )}

                  </div>

                </div>

              </section>


              {/* =================================================
                  DATA PRIBADI
              ================================================= */}

              <SectionCard
                title="Data Pribadi"
                icon={User}
              >

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">

                  <Field
                    label="Nama Lengkap"
                    value={
                      data.pribadi?.nama
                    }
                  />

                  <Field
                    label="NIK"
                    value={
                      data.pribadi?.nik
                    }
                  />

                  <Field
                    label="NISN"
                    value={
                      data.pribadi?.nisn
                    }
                  />

                  <Field
                    label="Tempat Lahir"
                    value={
                      data.pribadi
                        ?.tempatLahir
                    }
                  />

                  <Field
                    label="Tanggal Lahir"
                    value={formatTanggal(
                      data.pribadi
                        ?.tanggalLahir
                    )}
                  />

                  <Field
                    label="Jenis Kelamin"
                    value={
                      data.pribadi
                        ?.jenisKelamin
                    }
                  />

                  <Field
                    label="Nomor Telepon"
                    value={
                      data.pribadi?.telepon
                    }
                  />

                  <Field
                    label="Email"
                    value={
                      data.pribadi?.email
                    }
                  />

                  <div className="sm:col-span-2 lg:col-span-3">

                    <Field
                      label="Alamat"
                      value={
                        data.pribadi?.alamat
                      }
                    />

                  </div>

                </div>

              </SectionCard>


              {/* =================================================
                  DATA ORANG TUA
              ================================================= */}

              <SectionCard
                title="Data Orang Tua / Wali"
                icon={User}
              >

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">

                  <Field
                    label="Nama Ayah"
                    value={
                      data.ortu?.namaAyah
                    }
                  />

                  <Field
                    label="Nama Ibu"
                    value={
                      data.ortu?.namaIbu
                    }
                  />

                  <Field
                    label="Nomor Telepon"
                    value={
                      data.ortu?.telepon
                    }
                  />

                  <Field
                    label="Pekerjaan Ayah"
                    value={
                      data.ortu
                        ?.pekerjaanAyah
                    }
                  />

                  <Field
                    label="Pekerjaan Ibu"
                    value={
                      data.ortu
                        ?.pekerjaanIbu
                    }
                  />

                </div>

              </SectionCard>


              {/* =================================================
                  DATA SEKOLAH
              ================================================= */}

              <SectionCard
                title="Data Sekolah Asal"
                icon={GraduationCap}
              >

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">

                  <Field
                    label="Asal Sekolah"
                    value={
                      data.sekolah
                        ?.asalSekolah
                    }
                  />

                  <Field
                    label="NPSN"
                    value={
                      data.sekolah?.npsn
                    }
                  />

                  <Field
                    label="Tahun Lulus"
                    value={
                      data.sekolah
                        ?.tahunLulus
                    }
                  />

                  <Field
                    label="Nilai Rapor"
                    value={
                      data.sekolah
                        ?.nilaiRapor
                    }
                  />

                </div>

              </SectionCard>


              {/* =================================================
                  PILIHAN JURUSAN
              ================================================= */}

              <SectionCard
                title="Pilihan Jurusan"
                icon={GraduationCap}
              >

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div className="border border-slate-100 rounded-lg p-4">

                    <p className="text-[11px] text-slate-400">
                      Pilihan 1
                    </p>

                    <p className="text-sm font-medium text-slate-700 mt-1">
                      {data.jurusan
                        ?.pilihan1 ||
                        "-"}
                    </p>

                  </div>


                  <div className="border border-slate-100 rounded-lg p-4">

                    <p className="text-[11px] text-slate-400">
                      Pilihan 2
                    </p>

                    <p className="text-sm font-medium text-slate-700 mt-1">
                      {data.jurusan
                        ?.pilihan2 ||
                        "-"}
                    </p>

                  </div>


                  <div className="border border-slate-100 rounded-lg p-4">

                    <p className="text-[11px] text-slate-400">
                      Pilihan 3
                    </p>

                    <p className="text-sm font-medium text-slate-700 mt-1">
                      {data.jurusan
                        ?.pilihan3 ||
                        "-"}
                    </p>

                  </div>

                </div>

              </SectionCard>


              {/* =================================================
                  BERKAS
              ================================================= */}

              <SectionCard
                title="Berkas Pendaftaran"
                icon={FileText}
              >

                <div className="space-y-3">

                  {(data.berkas || [])
                    .map((berkas) => {

                      const isUploading =
                        uploadLoading &&
                        uploadTarget ===
                          berkas.id;

                      return (
                        <div
                          key={berkas.id}
                          className="border border-slate-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >

                          <div className="flex items-center gap-3 min-w-0">

                            <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                              <FileText
                                size={17}
                              />
                            </div>

                            <div className="min-w-0">

                              <p className="text-sm font-medium text-slate-700">
                                {berkas.nama}
                              </p>

                              <p className="text-xs text-slate-400 truncate mt-0.5">
                                {berkas.file ||
                                  "Belum ada file"}
                              </p>

                            </div>

                          </div>


                          <div className="flex items-center gap-2 flex-shrink-0">

                            <span
                              className={`text-[10px] font-medium px-2 py-1 rounded-full border ${
                                STATUS_STYLES[
                                  berkas.status
                                ] ||
                                STATUS_STYLES.Menunggu
                              }`}
                            >
                              {berkas.status ||
                                "Menunggu"}
                            </span>


                            {/* PREVIEW */}

                            <button
                              type="button"
                              onClick={() =>
                                handlePreview(
                                  berkas
                                )
                              }
                              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-md transition-colors"
                            >
                              <Eye size={13} />
                              Lihat
                            </button>


                            {/* UPLOAD */}

                            <label
                              className={`flex items-center gap-1 text-xs font-medium text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                                isUploading
                                  ? "opacity-50 pointer-events-none"
                                  : ""
                              }`}
                            >

                              {isUploading ? (
                                <Loader2
                                  size={13}
                                  className="animate-spin"
                                />
                              ) : (
                                <Upload
                                  size={13}
                                />
                              )}

                              {isUploading
                                ? "Mengunggah..."
                                : "Unggah"}

                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                disabled={
                                  isUploading
                                }
                                onChange={(
                                  event
                                ) =>
                                  handleUpload(
                                    event,
                                    berkas
                                  )
                                }
                              />

                            </label>

                          </div>

                        </div>
                      );
                    })}

                </div>

              </SectionCard>


              {/* =================================================
                  INFO INTEGRASI BE
              ================================================= */}

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">

                <div className="flex items-start gap-3">

                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <Check
                      size={15}
                      className="text-emerald-500"
                    />
                  </div>

                  <div>

                    <p className="text-xs font-medium text-slate-700">
                      Integrasi PPDB
                    </p>

                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Upload berkas dan proses
                      verifikasi menggunakan
                      endpoint PPDB yang sudah
                      tersedia di backend.
                      Data detail halaman ini
                      masih mengikuti data
                      halaman sebelumnya karena
                      backend saat ini belum
                      menyediakan endpoint GET
                      detail pendaftar.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </main>

      </div>


      {/* =====================================================
          MODAL KONFIRMASI
      ===================================================== */}

      {confirmAction && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-xl w-full max-w-md p-6">

            <div className="flex items-start justify-between gap-4">

              <div>

                <h3 className="text-sm font-semibold text-slate-800">

                  {confirmAction ===
                  "lulus"
                    ? "Verifikasi Pendaftar"
                    : "Tolak Pendaftar"}

                </h3>

                <p className="text-xs text-slate-500 mt-1 leading-relaxed">

                  {confirmAction ===
                  "lulus"
                    ? "Pendaftar akan dinyatakan lulus dan dibuatkan akun siswa."
                    : "Pendaftar akan dinyatakan ditolak."}

                </p>

              </div>

              <button
                type="button"
                onClick={() => {
                  if (!loading) {
                    setConfirmAction(
                      null
                    );
                    setKelasId("");
                    setError("");
                  }
                }}
                disabled={loading}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                <X size={17} />
              </button>

            </div>


            {/* =================================================
                KELAS ID — HANYA LULUS
            ================================================= */}

            {confirmAction ===
              "lulus" && (
              <div className="mt-5">

                <label className="block">

                  <span className="text-xs font-medium text-slate-600">
                    ID Kelas
                  </span>

                  <input
                    type="text"
                    value={kelasId}
                    onChange={(e) =>
                      setKelasId(
                        e.target.value
                      )
                    }
                    placeholder="Masukkan UUID kelas"
                    disabled={loading}
                    className="w-full mt-1.5 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 disabled:bg-slate-50"
                  />

                </label>

                <p className="text-[11px] text-slate-400 mt-1.5">
                  Backend saat ini membutuhkan
                  <span className="font-medium">
                    {" "}
                    kelasId
                  </span>{" "}
                  ketika pendaftar dinyatakan
                  lulus.
                </p>

              </div>
            )}


            {/* ERROR */}

            {error && (
              <div className="mt-4 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">

                <p className="text-xs text-rose-600">
                  {error}
                </p>

              </div>
            )}


            {/* BUTTON */}

            <div className="flex items-center justify-end gap-2 mt-6">

              <button
                type="button"
                onClick={() => {
                  if (!loading) {
                    setConfirmAction(
                      null
                    );
                    setKelasId("");
                    setError("");
                  }
                }}
                disabled={loading}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 px-4 py-2 disabled:opacity-50"
              >
                Batal
              </button>


              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={`flex items-center gap-1.5 text-xs font-medium text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 ${
                  confirmAction ===
                  "lulus"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >

                {loading && (
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                )}

                {confirmAction ===
                "lulus"
                  ? "Ya, Verifikasi"
                  : "Ya, Tolak"}

              </button>

            </div>

          </div>

        </div>
      )}


      {/* =====================================================
          MODAL PREVIEW BERKAS
      ===================================================== */}

      {previewFile && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-xl w-full max-w-3xl overflow-hidden">

            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">

              <div>

                <h3 className="text-sm font-semibold text-slate-800">
                  {previewFile.nama}
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  {previewFile.file ||
                    "Dokumen pendaftaran"}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setPreviewFile(null)
                }
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>

            </div>


            <div className="p-5">

              <div className="h-[420px] bg-slate-50 border border-slate-100 rounded-lg flex flex-col items-center justify-center text-center">

                <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center">

                  <FileText size={25} />

                </div>

                <p className="text-sm font-medium text-slate-700 mt-4">
                  {previewFile.file ||
                    "Dokumen"}
                </p>

                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Preview dokumen akan
                  menggunakan URL file yang
                  dikembalikan oleh backend.
                </p>

              </div>

            </div>


            <div className="flex justify-end px-5 py-4 border-t border-slate-100">

              <button
                type="button"
                onClick={() =>
                  setPreviewFile(null)
                }
                className="text-xs font-medium text-slate-500 hover:text-slate-700 px-4 py-2"
              >
                Tutup
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}