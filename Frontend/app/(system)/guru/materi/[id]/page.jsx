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

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  getMateriPembelajaranById,
  deleteMateriPembelajaran,
} from "../../../../services/materiPembelajaran.service";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

const FILE_BASE_URL = API_URL.replace(
  /\/api$/,
  ""
);

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

function getTipeBadge(tipe) {
  const map = {
    pdf: { label: "PDF", icon: FileText, color: "bg-red-50 text-red-700 border-red-200" },
    video: { label: "Video", icon: Video, color: "bg-purple-50 text-purple-700 border-purple-200" },
    link: { label: "Link", icon: LinkIcon, color: "bg-blue-50 text-blue-700 border-blue-200" },
  };
  return map[tipe] || { label: "Materi", icon: FileText, color: "bg-slate-50 text-slate-700 border-slate-200" };
}

export default function MateriDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [materi, setMateri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

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
        setError(err?.message || "Gagal mengambil detail materi.");
      } finally {
        setLoading(false);
      }
    }

    loadMateri();
  }, [id]);

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

  function getFileUrl(urlFile) {
    if (!urlFile) return "#";
    if (urlFile.startsWith("http")) return urlFile;
    return `${FILE_BASE_URL}${urlFile}`;
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
        <Sidebar active="materi" setActive={() => {}} collapsed={false} setCollapsed={() => {}} role="guru" />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header toggleSidebar={() => {}} notifications={[]} user={{ name: "Bu Sari", email: "guru@smartschool.com", avatar: "BS" }} />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 size={22} className="animate-spin text-blue-600" />
              <span className="text-sm font-medium">Memuat detail materi...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar active="materi" setActive={() => {}} collapsed={false} setCollapsed={() => {}} role="guru" />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={() => {}}
          notifications={[]}
          user={{ name: "Bu Sari", email: "guru@smartschool.com", avatar: "BS" }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-6">

              {/* =====================================================
                  BACK BUTTON
              ===================================================== */}
              <button
                type="button"
                onClick={() => router.push("/guru/materi")}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft size={17} />
                Kembali ke Daftar Materi
              </button>

              {/* =====================================================
                  ERROR
              ===================================================== */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {!materi ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center">
                  <BookOpen size={36} className="mx-auto text-slate-300" />
                  <p className="text-sm font-medium text-slate-600 mt-4">Materi tidak ditemukan.</p>
                </div>
              ) : (
                <>
                  {/* =====================================================
                      MAIN CARD
                  ===================================================== */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                    {/* HEADER SECTION */}
                    <div className="p-6 sm:p-8 border-b border-slate-100">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="p-3 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                            {materi.tipe === "video" ? (
                              <Video size={22} />
                            ) : materi.tipe === "link" ? (
                              <LinkIcon size={22} />
                            ) : (
                              <FileText size={22} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 break-words">
                                {materi.judul}
                              </h1>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                                {getTipeBadge(materi.tipe).label}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1.5 text-sm text-slate-500">
                              <BookOpen size={14} className="text-blue-500" />
                              <span>{getMapelName(materi.kelasMapel)}</span>
                              <span className="text-slate-300">·</span>
                              <span>{getKelasName(materi.kelasMapel)}</span>
                            </div>

                            {materi.kategori && (
                              <div className="mt-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-xs font-medium text-blue-700">
                                  <FolderOpen size={11} />
                                  {materi.kategori}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => router.push(`/guru/materi/${materi.id}/edit`)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-sm font-medium transition-colors"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-sm font-medium transition-colors disabled:opacity-60"
                          >
                            {deleting ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                            Hapus
                          </button>
                        </div>
                      </div>

                      {/* Meta Info Bar */}
                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
                          <CalendarDays size={15} className="text-slate-400 shrink-0" />
                          <div>
                            <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Tanggal</p>
                            <p className="text-sm font-medium text-slate-700">{formatTanggal(materi.dibuatPada)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
                          <Clock size={15} className="text-slate-400 shrink-0" />
                          <div>
                            <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Waktu</p>
                            <p className="text-sm font-medium text-slate-700">{formatWaktu(materi.dibuatPada)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
                          <User size={15} className="text-slate-400 shrink-0" />
                          <div>
                            <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Pengajar</p>
                            <p className="text-sm font-medium text-slate-700">{getGuruName(materi)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BODY SECTION */}
                    <div className="p-6 sm:p-8 space-y-7">

                      {/* Deskripsi */}
                      <div>
                        <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <FileText size={15} className="text-blue-500" />
                          Deskripsi Materi
                        </h2>
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                            {materi.deskripsi || "Tidak ada deskripsi materi."}
                          </p>
                        </div>
                      </div>

                      {/* Sumber Materi */}
                      <div>
                        <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <LinkIcon size={15} className="text-blue-500" />
                          Sumber Materi
                        </h2>

                        {materi.tipe === "link" && materi.urlLink ? (
                          <a
                            href={materi.urlLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            <LinkIcon size={16} />
                            Buka Link Materi
                          </a>
                        ) : materi.urlFile ? (
                          <div className="flex flex-wrap items-center gap-3">
                            <a
                              href={getFileUrl(materi.urlFile)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                            >
                              <FileText size={16} />
                              Buka File
                            </a>

                            <a
                              href={getFileUrl(materi.urlFile)}
                              download
                              className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                            >
                              <Download size={16} />
                              Download
                            </a>

                            <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                              {materi.urlFile.split("/").pop()?.slice(0, 30) || "File"}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400">Tidak ada sumber materi.</p>
                        )}
                      </div>

                      {/* Informasi Tambahan */}
                      <div className="pt-6 border-t border-slate-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs font-medium text-slate-400">ID Materi</p>
                            <p className="text-sm font-medium text-slate-700 mt-0.5 font-mono">{materi.id}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-400">Tipe</p>
                            <p className="text-sm font-medium text-slate-700 mt-0.5 capitalize">{materi.tipe || "-"}</p>
                          </div>
                          {materi.updatedAt && materi.updatedAt !== materi.dibuatPada && (
                            <div className="sm:col-span-2">
                              <p className="text-xs font-medium text-slate-400">Terakhir Diperbarui</p>
                              <p className="text-sm font-medium text-slate-700 mt-0.5">
                                {formatTanggal(materi.updatedAt)} · {formatWaktu(materi.updatedAt)}
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