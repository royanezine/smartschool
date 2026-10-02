"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  FileText,
  Video,
  Link as LinkIcon,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Download,
  Clock,
  User,
  FolderOpen,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  getMateriPembelajaranById,
  deleteMateriPembelajaran,
} from "@/services/materiPembelajaran.service";

// ============================================================
// API
// ============================================================

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const FILE_BASE_URL = API_URL.replace(/\/api$/, "");

// ============================================================
// THEME HELPERS
// ============================================================

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

// ============================================================
// HELPERS
// ============================================================

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

function getGuruName(item) {
  return (
    item?.kelasMapel?.guruPengajar?.namaLengkap ||
    item?.kelasMapel?.guruPengajar?.nama ||
    "-"
  );
}

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatWaktu(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================================
// TIPE BADGE
// ============================================================

function getTipeBadge(tipe) {
  const map = {
    pdf: {
      label: "PDF",
      icon: FileText,
      surface: themeDangerSurface,
      border: themeDangerBorder,
      text: "theme-danger",
    },

    video: {
      label: "Video",
      icon: Video,
      surface: themeInfoSurface,
      border: themeInfoBorder,
      text: "text-[var(--color-info)]",
    },

    link: {
      label: "Link",
      icon: LinkIcon,
      surface: themePrimarySoft,
      border: themePrimarySoftBorder,
      text: themePrimaryText,
    },
  };

  return (
    map[tipe] || {
      label: "Materi",
      icon: FileText,
      surface: themeNeutralSurface,
      border: themeNeutralBorder,
      text: "theme-text-secondary",
    }
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function MateriDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id;

  const [materi, setMateri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    if (!id) return;

    async function loadMateri() {
      try {
        setLoading(true);
        setError("");

        const response = await getMateriPembelajaranById(id);

        setMateri(response?.data || null);
      } catch (err) {
        console.error(err);

        setError(
          err?.message || "Gagal mengambil detail materi."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMateri();
  }, [id]);

  // ============================================================
  // DELETE
  // ============================================================

  async function handleDelete() {
    if (!materi) return;

    const confirmed = window.confirm(
      `Yakin ingin menghapus materi "${materi.judul}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await deleteMateriPembelajaran(materi.id);

      router.push("/guru/materi");
    } catch (err) {
      alert(err?.message || "Materi gagal dihapus.");
    } finally {
      setDeleting(false);
    }
  }

  // ============================================================
  // FILE URL
  // ============================================================

  function getFileUrl(urlFile) {
    if (!urlFile) return "#";

    if (urlFile.startsWith("http")) {
      return urlFile;
    }

    return `${FILE_BASE_URL}${urlFile}`;
  }

  // ============================================================
  // LOADING
  // ============================================================

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

        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            toggleSidebar={() => {}}
            notifications={[]}
            user={{
              name: "Bu Sari",
              email: "guru@smartschool.com",
              avatar: "BS",
            }}
          />

          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-3 theme-text-secondary">
              <Loader2
                size={22}
                className={`animate-spin ${themePrimaryText}`}
              />

              <span className="text-sm font-medium">
                Memuat detail materi...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* ======================================================
          SIDEBAR GURU
      ====================================================== */}

      <Sidebar
        active="materi"
        setActive={() => {}}
        collapsed={false}
        setCollapsed={() => {}}
        role="guru"
      />

      {/* ======================================================
          CONTENT WRAPPER
      ====================================================== */}

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => {}}
          notifications={[]}
          user={{
            name: "Bu Sari",
            email: "guru@smartschool.com",
            avatar: "BS",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl space-y-6">

              {/* ==================================================
                  BACK BUTTON
              ================================================== */}

              <button
                type="button"
                onClick={() => router.push("/guru/materi")}
                className="theme-text-secondary inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--color-primary)]"
              >
                <ArrowLeft size={17} />
                Kembali ke Daftar Materi
              </button>

              {/* ==================================================
                  ERROR
              ================================================== */}

              {error && (
                <div
                  className={`flex items-start gap-3 rounded-xl border p-4 ${themeDangerSurface} ${themeDangerBorder}`}
                >
                  <AlertCircle
                    size={18}
                    className="theme-danger mt-0.5 shrink-0"
                  />

                  <p className="theme-danger text-sm">
                    {error}
                  </p>
                </div>
              )}

              {/* ==================================================
                  EMPTY
              ================================================== */}

              {!materi ? (
                <div
                  className={`theme-card rounded-xl border p-16 text-center ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  <BookOpen
                    size={36}
                    className="theme-text-muted mx-auto"
                  />

                  <p className="theme-text-secondary mt-4 text-sm font-medium">
                    Materi tidak ditemukan.
                  </p>
                </div>
              ) : (
                <>
                  {/* ==================================================
                      MAIN CARD
                  ================================================== */}

                  <div
                    className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
                  >
                    {/* ==================================================
                        HEADER SECTION
                    ================================================== */}

                    <div
                      className={`border-b p-6 sm:p-8 ${themeDivider}`}
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                        {/* ==================================================
                            TITLE
                        ================================================== */}

                        <div className="flex min-w-0 items-start gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                          >
                            {materi.tipe === "video" ? (
                              <Video size={22} />
                            ) : materi.tipe === "link" ? (
                              <LinkIcon size={22} />
                            ) : (
                              <FileText size={22} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <h1 className="theme-text break-words text-xl font-bold sm:text-2xl">
                                {materi.judul}
                              </h1>

                              {(() => {
                                const badge = getTipeBadge(materi.tipe);
                                const BadgeIcon = badge.icon;

                                return (
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${badge.surface} ${badge.border} ${badge.text}`}
                                  >
                                    <BadgeIcon size={11} />
                                    {badge.label}
                                  </span>
                                );
                              })()}
                            </div>

                            {/* MAPEL + KELAS */}

                            <div className="theme-text-secondary mt-1.5 flex items-center gap-2 text-sm">
                              <BookOpen
                                size={14}
                                className={themePrimaryText}
                              />

                              <span>
                                {getMapelName(materi.kelasMapel)}
                              </span>

                              <span className="theme-text-muted">
                                ·
                              </span>

                              <span>
                                {getKelasName(materi.kelasMapel)}
                              </span>
                            </div>

                            {/* KATEGORI */}

                            {materi.kategori && (
                              <div className="mt-2">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-medium ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
                                >
                                  <FolderOpen size={11} />

                                  {materi.kategori}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ==================================================
                            ACTION BUTTONS
                        ================================================== */}

                        <div className="flex shrink-0 items-center gap-2">
                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/guru/materi/${materi.id}/edit`
                              )
                            }
                            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText} hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]`}
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className={`theme-danger inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${themeDangerSurface} ${themeDangerBorder} hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            {deleting ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={15} />
                            )}

                            Hapus
                          </button>
                        </div>
                      </div>

                      {/* ==================================================
                          META INFO
                      ================================================== */}

                      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

                        {/* TANGGAL */}

                        <div
                          className={`flex items-center gap-2 rounded-lg border p-3 ${themeNeutralSurface} ${themeNeutralBorder}`}
                        >
                          <CalendarDays
                            size={15}
                            className="theme-text-muted shrink-0"
                          />

                          <div>
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Tanggal
                            </p>

                            <p className="theme-text-secondary text-sm font-medium">
                              {formatTanggal(materi.dibuatPada)}
                            </p>
                          </div>
                        </div>

                        {/* WAKTU */}

                        <div
                          className={`flex items-center gap-2 rounded-lg border p-3 ${themeNeutralSurface} ${themeNeutralBorder}`}
                        >
                          <Clock
                            size={15}
                            className="theme-text-muted shrink-0"
                          />

                          <div>
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Waktu
                            </p>

                            <p className="theme-text-secondary text-sm font-medium">
                              {formatWaktu(materi.dibuatPada)}
                            </p>
                          </div>
                        </div>

                        {/* PENGAJAR */}

                        <div
                          className={`flex items-center gap-2 rounded-lg border p-3 ${themeNeutralSurface} ${themeNeutralBorder}`}
                        >
                          <User
                            size={15}
                            className="theme-text-muted shrink-0"
                          />

                          <div>
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Pengajar
                            </p>

                            <p className="theme-text-secondary text-sm font-medium">
                              {getGuruName(materi)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ==================================================
                        BODY SECTION
                    ================================================== */}

                    <div className="space-y-7 p-6 sm:p-8">

                      {/* ==================================================
                          DESKRIPSI
                      ================================================== */}

                      <div>
                        <h2 className="theme-text-secondary mb-2 flex items-center gap-2 text-sm font-semibold">
                          <FileText
                            size={15}
                            className={themePrimaryText}
                          />

                          Deskripsi Materi
                        </h2>

                        <div
                          className={`rounded-lg border p-4 ${themeNeutralSurface} ${themeNeutralBorder}`}
                        >
                          <p className="theme-text-secondary whitespace-pre-line text-sm leading-relaxed">
                            {materi.deskripsi ||
                              "Tidak ada deskripsi materi."}
                          </p>
                        </div>
                      </div>

                      {/* ==================================================
                          SUMBER MATERI
                      ================================================== */}

                      <div>
                        <h2 className="theme-text-secondary mb-3 flex items-center gap-2 text-sm font-semibold">
                          <LinkIcon
                            size={15}
                            className={themePrimaryText}
                          />

                          Sumber Materi
                        </h2>

                        {/* ==================================================
                            LINK
                        ================================================== */}

                        {materi.tipe === "link" &&
                        materi.urlLink ? (
                          <a
                            href={materi.urlLink}
                            target="_blank"
                            rel="noreferrer"
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} hover:opacity-90`}
                          >
                            <LinkIcon size={16} />

                            Buka Link Materi
                          </a>
                        ) : materi.urlFile ? (
                          <div className="flex flex-wrap items-center gap-3">

                            {/* BUKA FILE */}

                            <a
                              href={getFileUrl(materi.urlFile)}
                              target="_blank"
                              rel="noreferrer"
                              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} hover:opacity-90`}
                            >
                              <FileText size={16} />

                              Buka File
                            </a>

                            {/* DOWNLOAD */}

                            <a
                              href={getFileUrl(materi.urlFile)}
                              download
                              className={`theme-card theme-text-secondary inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${themeNeutralBorder} ${themeNeutralHover} ${themeSmallShadow}`}
                            >
                              <Download size={16} />

                              Download
                            </a>

                            {/* FILE NAME */}

                            <span
                              className={`theme-text-muted rounded-full border px-3 py-1.5 text-xs ${themeNeutralSurface} ${themeNeutralBorder}`}
                            >
                              {materi.urlFile
                                .split("/")
                                .pop()
                                ?.slice(0, 30) || "File"}
                            </span>
                          </div>
                        ) : (
                          <p className="theme-text-muted text-sm">
                            Tidak ada sumber materi.
                          </p>
                        )}
                      </div>

                      {/* ==================================================
                          INFORMASI TAMBAHAN
                      ================================================== */}

                      <div
                        className={`border-t pt-6 ${themeDivider}`}
                      >
                        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">

                          {/* ID */}

                          <div>
                            <p className="theme-text-muted text-xs font-medium">
                              ID Materi
                            </p>

                            <p className="theme-text-secondary mt-0.5 font-mono text-sm font-medium break-all">
                              {materi.id}
                            </p>
                          </div>

                          {/* TIPE */}

                          <div>
                            <p className="theme-text-muted text-xs font-medium">
                              Tipe
                            </p>

                            <p className="theme-text-secondary mt-0.5 text-sm font-medium capitalize">
                              {materi.tipe || "-"}
                            </p>
                          </div>

                          {/* UPDATED */}

                          {materi.updatedAt &&
                            materi.updatedAt !==
                              materi.dibuatPada && (
                              <div className="sm:col-span-2">
                                <p className="theme-text-muted text-xs font-medium">
                                  Terakhir Diperbarui
                                </p>

                                <p className="theme-text-secondary mt-0.5 text-sm font-medium">
                                  {formatTanggal(
                                    materi.updatedAt
                                  )}{" "}
                                  ·{" "}
                                  {formatWaktu(
                                    materi.updatedAt
                                  )}
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}