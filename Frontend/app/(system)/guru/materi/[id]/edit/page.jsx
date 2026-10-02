"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Save,
  Upload,
  FileText,
  FileVideo,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  BookOpen,
  FolderOpen,
  Info,
  Clock,
  File,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  getMateriPembelajaranById,
  getKelasMapel,
  updateMateriDenganFile,
  updateMateriDenganLink,
  updateMateriTanpaSumber,
} from "@/services/materiPembelajaran.service";

/* ============================================================
   GLOBAL THEME HELPERS
============================================================ */

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

const themeDashedBorder =
  "border-[color-mix(in_srgb,var(--color-text)_14%,transparent)]";

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

/* ============================================================
   HELPERS
============================================================ */

function getKelasName(item) {
  return (
    item?.kelas?.nama ||
    item?.kelas?.namaKelas ||
    item?.kelas?.kode ||
    "-"
  );
}

function getMapelName(item) {
  return (
    item?.mataPelajaran?.nama ||
    item?.mataPelajaran?.namaMapel ||
    item?.mataPelajaran?.namaMataPelajaran ||
    "-"
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function EditMateriPage() {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const id = params?.id;

  const [materi, setMateri] = useState(null);
  const [kelasMapelList, setKelasMapelList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [kelasMapelId, setKelasMapelId] =
    useState("");

  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState("");
  const [deskripsi, setDeskripsi] =
    useState("");

  const [urlLink, setUrlLink] = useState("");

  const [mode, setMode] = useState("file");
  const [file, setFile] = useState(null);

  /* ==========================================================
     LOAD DATA
  ========================================================== */

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [
          materiResponse,
          kelasMapelResponse,
        ] = await Promise.all([
          getMateriPembelajaranById(id),
          getKelasMapel(),
        ]);

        const materiData =
          materiResponse?.data;

        const kelasMapelData =
          Array.isArray(kelasMapelResponse)
            ? kelasMapelResponse
            : Array.isArray(
                kelasMapelResponse?.data
              )
            ? kelasMapelResponse.data
            : [];

        if (!materiData) {
          throw new Error(
            "Materi tidak ditemukan."
          );
        }

        setMateri(materiData);
        setKelasMapelList(
          kelasMapelData
        );

        setKelasMapelId(
          materiData.kelasMapelId ||
            materiData.kelasMapel?.id ||
            ""
        );

        setJudul(
          materiData.judul || ""
        );

        setKategori(
          materiData.kategori || ""
        );

        setDeskripsi(
          materiData.deskripsi || ""
        );

        setUrlLink(
          materiData.urlLink || ""
        );

        setMode(
          materiData.tipe === "link"
            ? "link"
            : "file"
        );
      } catch (err) {
        console.error(err);

        setError(
          err?.message ||
            "Gagal memuat data materi."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const selectedKelasMapel =
    kelasMapelList.find(
      (item) =>
        item.id === kelasMapelId
    ) || null;

  /* ==========================================================
     FILE VALIDATION
  ========================================================== */

  function validateFile(selectedFile) {
    const allowedMimeTypes = [
      "application/pdf",
      "video/mp4",
      "video/mpeg",
      "video/webm",
      "video/quicktime",
    ];

    const allowedExtensions = [
      ".pdf",
      ".mp4",
      ".mpeg",
      ".webm",
      ".mov",
    ];

    const extension =
      selectedFile.name
        .slice(
          selectedFile.name.lastIndexOf(
            "."
          )
        )
        .toLowerCase();

    if (
      !allowedMimeTypes.includes(
        selectedFile.type
      ) &&
      !allowedExtensions.includes(
        extension
      )
    ) {
      setError(
        "Format file tidak didukung."
      );

      return false;
    }

    if (
      selectedFile.size >
      100 * 1024 * 1024
    ) {
      setError(
        "Ukuran file maksimal 100 MB."
      );

      return false;
    }

    setError("");

    return true;
  }

  function handleFileChange(event) {
    const selected =
      event.target.files?.[0];

    if (!selected) return;

    if (validateFile(selected)) {
      setFile(selected);
      setMode("file");
    }
  }

  function removeNewFile() {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  }

  /* ==========================================================
     SUBMIT
  ========================================================== */

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!kelasMapelId) {
      setError(
        "Kelas dan mata pelajaran wajib dipilih."
      );

      return;
    }

    if (!judul.trim()) {
      setError(
        "Judul materi wajib diisi."
      );

      return;
    }

    try {
      setSaving(true);

      if (mode === "link") {
        if (!urlLink.trim()) {
          setError(
            "URL materi wajib diisi."
          );

          return;
        }

        await updateMateriDenganLink(
          id,
          {
            kelasMapelId,
            judul: judul.trim(),
            kategori:
              kategori.trim() ||
              undefined,
            deskripsi:
              deskripsi.trim() ||
              undefined,
            urlLink:
              urlLink.trim(),
          }
        );
      } else if (file) {
        await updateMateriDenganFile(
          id,
          {
            kelasMapelId,
            judul: judul.trim(),
            kategori:
              kategori.trim() ||
              undefined,
            deskripsi:
              deskripsi.trim() ||
              undefined,
            file,
          }
        );
      } else {
        await updateMateriTanpaSumber(
          id,
          {
            kelasMapelId,
            judul: judul.trim(),
            kategori:
              kategori.trim() ||
              undefined,
            deskripsi:
              deskripsi.trim() ||
              undefined,
          }
        );
      }

      setSuccess(
        "Materi berhasil diperbarui."
      );

      setTimeout(() => {
        router.push(
          `/guru/materi/${id}`
        );
      }, 1000);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Materi gagal diperbarui."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active="materi"
          setActive={() => {}}
          collapsed={false}
          setCollapsed={() => {}}
          role="guru"
        />

        <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
          <Header
            toggleSidebar={() => {}}
            notifications={[]}
            user={{
              name: "Bu Sari",
              email:
                "guru@smartschool.com",
              avatar: "BS",
            }}
          />

          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-3">
              <Loader2
                size={24}
                className={`${themePrimaryText} animate-spin`}
              />

              <span className="theme-text-secondary text-sm font-medium">
                Memuat materi...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* =====================================================
          SIDEBAR GURU
      ===================================================== */}

      <Sidebar
        active="materi"
        setActive={() => {}}
        collapsed={false}
        setCollapsed={() => {}}
        role="guru"
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <Header
          toggleSidebar={() => {}}
          notifications={[]}
          user={{
            name: "Bu Sari",
            email:
              "guru@smartschool.com",
            avatar: "BS",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
              {/* =================================================
                  PAGE HEADER
              ================================================= */}

              <section
                className={`theme-card rounded-2xl border ${themeNeutralBorder} p-5 sm:p-6 lg:p-7 ${themeCardShadow}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`}
                    >
                      <FileText size={22} />
                    </div>

                    <div className="min-w-0">
                      <h1 className="theme-text text-2xl font-bold tracking-tight">
                        Edit Materi
                      </h1>

                      <p className="theme-text-secondary mt-1 text-sm">
                        Perbarui informasi materi pembelajaran yang sudah ada
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/guru/materi/${id}`
                      )
                    }
                    className={`theme-card theme-text-secondary inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} px-4 py-2.5 text-sm font-medium transition-all ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                  >
                    <ArrowLeft size={16} />
                    Kembali ke Detail
                  </button>
                </div>

                {/* INFO BAR */}

                <div
                  className={`mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t ${themeDivider} pt-4`}
                >
                  <span className="theme-text-muted flex items-center gap-1.5 text-xs">
                    <Clock size={13} />

                    Terakhir diperbarui:{" "}
                    {materi?.updatedAt
                      ? new Date(
                          materi.updatedAt
                        ).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "-"}
                  </span>

                  <span
                    className={`hidden h-4 w-px sm:block ${themeNeutralBorder} border-l`}
                  />

                  <span className="theme-text-muted flex items-center gap-1.5 text-xs">
                    <File size={13} />

                    {materi?.tipe ===
                    "link"
                      ? "Link"
                      : "File"}
                  </span>

                  {materi?.status && (
                    <>
                      <span
                        className={`hidden h-4 w-px sm:block ${themeNeutralBorder} border-l`}
                      />

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border ${themeSuccessBorder} ${themeSuccessSurface} px-2.5 py-1 text-[10px] font-semibold text-[var(--color-success)]`}
                      >
                        <CheckCircle
                          size={10}
                        />

                        {materi.status}
                      </span>
                    </>
                  )}
                </div>
              </section>

              {/* =================================================
                  NOTIFICATIONS
              ================================================= */}

              {error && (
                <div
                  className={`flex items-start gap-3 rounded-xl border ${themeDangerBorder} ${themeDangerSurface} p-4`}
                >
                  <AlertCircle
                    size={18}
                    className="theme-danger mt-0.5 shrink-0"
                  />

                  <div className="min-w-0">
                    <p className="theme-danger text-sm font-semibold">
                      Terjadi kesalahan
                    </p>

                    <p className="theme-text-secondary mt-1 text-sm">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                    className="theme-danger ml-auto shrink-0 transition-opacity hover:opacity-70"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {success && (
                <div
                  className={`flex items-start gap-3 rounded-xl border ${themeSuccessBorder} ${themeSuccessSurface} p-4`}
                >
                  <CheckCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--color-success)]"
                  />

                  <div>
                    <p className="text-[var(--color-success)] text-sm font-semibold">
                      Berhasil
                    </p>

                    <p className="theme-text-secondary mt-1 text-sm">
                      {success}
                    </p>
                  </div>
                </div>
              )}

              {/* =================================================
                  FORM
              ================================================= */}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                  {/* =================================================
                      LEFT
                  ================================================= */}

                  <div className="space-y-6">
                    {/* =================================================
                        INFORMASI DASAR
                    ================================================= */}

                    <section
                      className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
                    >
                      <SectionHeader
                        icon={BookOpen}
                        title="Informasi Materi"
                        description="Data dasar materi pembelajaran"
                      />

                      <div className="space-y-5 p-5 sm:p-6">
                        {/* KELAS MAPEL */}

                        <div>
                          <label className="theme-text mb-1.5 block text-sm font-semibold">
                            Kelas & Mata Pelajaran{" "}
                            <span className="theme-danger">
                              *
                            </span>
                          </label>

                          <select
                            value={
                              kelasMapelId
                            }
                            onChange={(e) =>
                              setKelasMapelId(
                                e.target
                                  .value
                              )
                            }
                            disabled={saving}
                            className={`theme-input theme-text w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            <option value="">
                              Pilih kelas & mata pelajaran
                            </option>

                            {kelasMapelList.map(
                              (item) => (
                                <option
                                  key={
                                    item.id
                                  }
                                  value={
                                    item.id
                                  }
                                >
                                  {getKelasName(
                                    item
                                  )}{" "}
                                  —{" "}
                                  {getMapelName(
                                    item
                                  )}
                                </option>
                              )
                            )}
                          </select>

                          {selectedKelasMapel && (
                            <div
                              className={`mt-2 inline-flex items-center gap-2 rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} px-3 py-1.5 text-xs ${themePrimaryText}`}
                            >
                              <BookOpen
                                size={13}
                              />

                              {getKelasName(
                                selectedKelasMapel
                              )}{" "}
                              ·{" "}
                              {getMapelName(
                                selectedKelasMapel
                              )}
                            </div>
                          )}
                        </div>

                        {/* JUDUL */}

                        <div>
                          <div className="mb-1.5 flex items-center justify-between gap-3">
                            <label className="theme-text block text-sm font-semibold">
                              Judul Materi{" "}
                              <span className="theme-danger">
                                *
                              </span>
                            </label>

                            <span className="theme-text-muted text-xs">
                              {judul.length}/100
                            </span>
                          </div>

                          <input
                            type="text"
                            value={judul}
                            maxLength={100}
                            onChange={(e) =>
                              setJudul(
                                e.target
                                  .value
                              )
                            }
                            disabled={saving}
                            placeholder="Contoh: Pengenalan React Hooks"
                            className={`theme-input theme-text w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${themeFocus} placeholder:text-[var(--color-text-placeholder)] disabled:cursor-not-allowed disabled:opacity-60`}
                          />
                        </div>

                        {/* KATEGORI */}

                        <div>
                          <label className="theme-text mb-1.5 block text-sm font-semibold">
                            Bab / Kategori
                          </label>

                          <input
                            type="text"
                            value={kategori}
                            onChange={(e) =>
                              setKategori(
                                e.target
                                  .value
                              )
                            }
                            disabled={saving}
                            placeholder="Contoh: Bab 1 — Aljabar"
                            className={`theme-input theme-text w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${themeFocus} placeholder:text-[var(--color-text-placeholder)] disabled:cursor-not-allowed disabled:opacity-60`}
                          />
                        </div>

                        {/* DESKRIPSI */}

                        <div>
                          <label className="theme-text mb-1.5 block text-sm font-semibold">
                            Deskripsi
                          </label>

                          <textarea
                            value={
                              deskripsi
                            }
                            onChange={(e) =>
                              setDeskripsi(
                                e.target
                                  .value
                              )
                            }
                            rows={4}
                            disabled={saving}
                            placeholder="Tuliskan ringkasan singkat mengenai materi..."
                            className={`theme-input theme-text w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-all ${themeFocus} placeholder:text-[var(--color-text-placeholder)] disabled:cursor-not-allowed disabled:opacity-60`}
                          />
                        </div>
                      </div>
                    </section>

                    {/* =================================================
                        SUMBER MATERI
                    ================================================= */}

                    <section
                      className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
                    >
                      <SectionHeader
                        icon={FolderOpen}
                        title="Sumber Materi"
                        description="Pilih jenis sumber materi"
                      />

                      <div className="space-y-5 p-5 sm:p-6">
                        {/* MODE TOGGLE */}

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              setMode(
                                "file"
                              )
                            }
                            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                              mode === "file"
                                ? `${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`
                                : `theme-card theme-text-secondary ${themeNeutralBorder} ${themeNeutralHover}`
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            <Upload
                              size={16}
                            />

                            File
                          </button>

                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              setMode(
                                "link"
                              )
                            }
                            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                              mode === "link"
                                ? `${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`
                                : `theme-card theme-text-secondary ${themeNeutralBorder} ${themeNeutralHover}`
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            <LinkIcon
                              size={16}
                            />

                            Link
                          </button>
                        </div>

                        {/* FILE */}

                        {mode ===
                          "file" && (
                          <div>
                            <label className="theme-text mb-1.5 block text-sm font-semibold">
                              File Materi
                            </label>

                            {materi?.urlFile &&
                              !file && (
                                <div
                                  className={`mb-3 flex items-center gap-2 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
                                >
                                  <FileText
                                    size={16}
                                    className="theme-text-secondary"
                                  />

                                  <span className="theme-text-secondary text-sm">
                                    File saat ini tersimpan
                                  </span>
                                </div>
                              )}

                            <div
                              className={`rounded-xl border-2 border-dashed ${themeDashedBorder} p-5 transition-all hover:border-[color-mix(in_srgb,var(--color-primary)_35%,transparent)]`}
                            >
                              <input
                                ref={
                                  fileInputRef
                                }
                                type="file"
                                accept=".pdf,.mp4,.mpeg,.webm,.mov"
                                onChange={
                                  handleFileChange
                                }
                                disabled={
                                  saving
                                }
                                className={`theme-text-secondary w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-[var(--color-card)] ${themePrimaryGradient} disabled:opacity-60`}
                              />

                              {file && (
                                <div
                                  className={`mt-3 flex items-center justify-between gap-3 rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} p-3`}
                                >
                                  <div className="flex min-w-0 items-center gap-2">
                                    {file.type.includes(
                                      "video"
                                    ) ? (
                                      <FileVideo
                                        size={
                                          18
                                        }
                                        className={`${themePrimaryText} shrink-0`}
                                      />
                                    ) : (
                                      <FileText
                                        size={
                                          18
                                        }
                                        className={`${themePrimaryText} shrink-0`}
                                      />
                                    )}

                                    <p
                                      className={`truncate text-sm ${themePrimaryText}`}
                                    >
                                      {
                                        file.name
                                      }
                                    </p>

                                    <span
                                      className={`shrink-0 rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} px-2 py-0.5 text-xs ${themePrimaryText}`}
                                    >
                                      {(
                                        file.size /
                                        (1024 *
                                          1024)
                                      ).toFixed(
                                        2
                                      )}{" "}
                                      MB
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={
                                      removeNewFile
                                    }
                                    className={`shrink-0 rounded-lg p-1.5 ${themePrimaryText} transition ${themePrimarySoft} hover:opacity-75`}
                                  >
                                    <X
                                      size={
                                        15
                                      }
                                    />
                                  </button>
                                </div>
                              )}

                              <p className="theme-text-muted mt-2 text-xs">
                                Kosongkan jika tidak ingin mengganti file. Maksimal 100 MB.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* LINK */}

                        {mode ===
                          "link" && (
                          <div>
                            <label className="theme-text mb-1.5 block text-sm font-semibold">
                              URL Materi{" "}
                              <span className="theme-danger">
                                *
                              </span>
                            </label>

                            <div className="relative">
                              <LinkIcon
                                size={16}
                                className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                              />

                              <input
                                type="url"
                                value={
                                  urlLink
                                }
                                onChange={(
                                  e
                                ) =>
                                  setUrlLink(
                                    e.target
                                      .value
                                  )
                                }
                                disabled={
                                  saving
                                }
                                placeholder="https://..."
                                className={`theme-input theme-text w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition-all ${themeFocus} placeholder:text-[var(--color-text-placeholder)] disabled:cursor-not-allowed disabled:opacity-60`}
                              />
                            </div>

                            <p className="theme-text-muted mt-2 text-xs">
                              Masukkan URL lengkap materi dari platform eksternal.
                            </p>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>

                  {/* =================================================
                      RIGHT SIDEBAR
                  ================================================= */}

                  <div className="space-y-6">
                    {/* RINGKASAN */}

                    <section
                      className={`theme-card rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
                    >
                      <div className="mb-4 flex items-center gap-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themeWarningBorder} ${themeWarningSurface}`}
                        >
                          <Info
                            size={16}
                            className="text-[var(--color-warning)]"
                          />
                        </div>

                        <h3 className="theme-text text-sm font-semibold">
                          Ringkasan
                        </h3>
                      </div>

                      <div className="space-y-4 text-sm">
                        <SummaryItem
                          label="Judul"
                          value={
                            judul ||
                            "Belum diisi"
                          }
                        />

                        <SummaryItem
                          label="Kelas"
                          value={
                            selectedKelasMapel
                              ? getKelasName(
                                  selectedKelasMapel
                                )
                              : "Belum dipilih"
                          }
                        />

                        <SummaryItem
                          label="Mapel"
                          value={
                            selectedKelasMapel
                              ? getMapelName(
                                  selectedKelasMapel
                                )
                              : "Belum dipilih"
                          }
                        />

                        <div>
                          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                            Sumber
                          </p>

                          <div
                            className={`theme-text-secondary mt-1 inline-flex items-center gap-2 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-3 py-1.5 text-xs font-semibold`}
                          >
                            {mode ===
                            "file" ? (
                              <>
                                <Upload
                                  size={
                                    13
                                  }
                                />

                                File
                              </>
                            ) : (
                              <>
                                <LinkIcon
                                  size={
                                    13
                                  }
                                />

                                Link
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* TIPS */}

                    <section
                      className={`rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-5`}
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themeInfoBorder} ${theme-card}`}
                        >
                          <Info
                            size={16}
                            className="text-[var(--color-info)]"
                          />
                        </div>

                        <h3 className="text-[var(--color-info)] text-sm font-semibold">
                          Tips Edit
                        </h3>
                      </div>

                      <ul className="space-y-2">
                        <TipItem>
                          Pastikan data kelas dan mapel sudah sesuai
                        </TipItem>

                        <TipItem>
                          Ganti file hanya jika diperlukan
                        </TipItem>

                        <TipItem>
                          Perubahan akan langsung tampil untuk siswa
                        </TipItem>
                      </ul>
                    </section>
                  </div>
                </div>

                {/* =================================================
                    ACTION BUTTONS
                ================================================= */}

                <div
                  className={`theme-card mt-6 flex flex-col gap-3 rounded-2xl border ${themeNeutralBorder} p-5 sm:flex-row sm:items-center sm:justify-between ${themeCardShadow}`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/guru/materi/${id}`
                      )
                    }
                    disabled={saving}
                    className={`theme-card theme-text-secondary inline-flex items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} px-5 py-2.5 text-sm font-medium transition-all ${themeNeutralHover} hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <X size={16} />
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-8 py-2.5 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60`}
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
                        <Save size={16} />

                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div
      className={`border-b ${themeDivider} px-5 py-4 sm:px-6`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft}`}
        >
          <Icon
            size={18}
            className={themePrimaryText}
          />
        </div>

        <div>
          <h2 className="theme-text text-base font-semibold">
            {title}
          </h2>

          <p className="theme-text-muted mt-0.5 text-xs">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SUMMARY ITEM
============================================================ */

function SummaryItem({
  label,
  value,
}) {
  return (
    <div
      className={`border-b ${themeDivider} pb-3 last:border-0 last:pb-0`}
    >
      <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
        {label}
      </p>

      <p className="theme-text mt-1 break-words font-semibold">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   TIP ITEM
============================================================ */

function TipItem({ children }) {
  return (
    <li
      className={`flex items-start gap-2 rounded-lg border ${themeInfoBorder} theme-card p-2`}
    >
      <CheckCircle
        size={13}
        className="mt-0.5 shrink-0 text-[var(--color-success)]"
      />

      <span className="theme-text-secondary text-xs leading-5">
        {children}
      </span>
    </li>
  );
}