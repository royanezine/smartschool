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

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  getMateriPembelajaranById,
  getKelasMapel,
  updateMateriDenganFile,
  updateMateriDenganLink,
  updateMateriTanpaSumber,
} from "../../../../../services/materiPembelajaran.service";

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

  const [kelasMapelId, setKelasMapelId] = useState("");
  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [urlLink, setUrlLink] = useState("");
  const [mode, setMode] = useState("file");
  const [file, setFile] = useState(null);

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [materiResponse, kelasMapelResponse] = await Promise.all([
          getMateriPembelajaranById(id),
          getKelasMapel(),
        ]);

        const materiData = materiResponse?.data;
        const kelasMapelData = Array.isArray(kelasMapelResponse)
          ? kelasMapelResponse
          : Array.isArray(kelasMapelResponse?.data)
          ? kelasMapelResponse.data
          : [];

        if (!materiData) {
          throw new Error("Materi tidak ditemukan.");
        }

        setMateri(materiData);
        setKelasMapelList(kelasMapelData);

        setKelasMapelId(materiData.kelasMapelId || materiData.kelasMapel?.id || "");
        setJudul(materiData.judul || "");
        setKategori(materiData.kategori || "");
        setDeskripsi(materiData.deskripsi || "");
        setUrlLink(materiData.urlLink || "");
        setMode(materiData.tipe === "link" ? "link" : "file");
      } catch (err) {
        console.error(err);
        setError(err?.message || "Gagal memuat data materi.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const selectedKelasMapel = kelasMapelList.find((item) => item.id === kelasMapelId) || null;

  // ============================================================
  // FILE VALIDATION
  // ============================================================

  function validateFile(selectedFile) {
    const allowedMimeTypes = [
      "application/pdf",
      "video/mp4",
      "video/mpeg",
      "video/webm",
      "video/quicktime",
    ];

    const allowedExtensions = [".pdf", ".mp4", ".mpeg", ".webm", ".mov"];
    const extension = selectedFile.name.slice(selectedFile.name.lastIndexOf(".")).toLowerCase();

    if (!allowedMimeTypes.includes(selectedFile.type) && !allowedExtensions.includes(extension)) {
      setError("Format file tidak didukung.");
      return false;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setError("Ukuran file maksimal 100 MB.");
      return false;
    }

    setError("");
    return true;
  }

  function handleFileChange(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (validateFile(selected)) {
      setFile(selected);
      setMode("file");
    }
  }

  function removeNewFile() {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!kelasMapelId) {
      setError("Kelas dan mata pelajaran wajib dipilih.");
      return;
    }

    if (!judul.trim()) {
      setError("Judul materi wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      if (mode === "link") {
        if (!urlLink.trim()) {
          setError("URL materi wajib diisi.");
          return;
        }
        await updateMateriDenganLink(id, {
          kelasMapelId,
          judul: judul.trim(),
          kategori: kategori.trim() || undefined,
          deskripsi: deskripsi.trim() || undefined,
          urlLink: urlLink.trim(),
        });
      } else if (file) {
        await updateMateriDenganFile(id, {
          kelasMapelId,
          judul: judul.trim(),
          kategori: kategori.trim() || undefined,
          deskripsi: deskripsi.trim() || undefined,
          file,
        });
      } else {
        await updateMateriTanpaSumber(id, {
          kelasMapelId,
          judul: judul.trim(),
          kategori: kategori.trim() || undefined,
          deskripsi: deskripsi.trim() || undefined,
        });
      }

      setSuccess("Materi berhasil diperbarui.");
      setTimeout(() => {
        router.push(`/guru/materi/${id}`);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Materi gagal diperbarui.");
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
        <Sidebar active="materi" setActive={() => {}} collapsed={false} setCollapsed={() => {}} role="guru" />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header toggleSidebar={() => {}} notifications={[]} user={{ name: "Bu Sari", email: "guru@smartschool.com", avatar: "BS" }} />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 size={24} className="animate-spin text-blue-600" />
              <span className="text-sm font-medium">Memuat materi...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

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
            <div className="max-w-7xl mx-auto space-y-6">
              {/* =====================================================
                  HEADER
              ===================================================== */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                      <FileText size={22} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                        Edit Materi
                      </h1>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Perbarui informasi materi pembelajaran yang sudah ada
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/guru/materi/${id}`)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 text-sm font-medium transition-all flex-shrink-0"
                  >
                    <ArrowLeft size={16} />
                    Kembali ke Detail
                  </button>
                </div>

                {/* Info Bar */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4">
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-400" />
                    Terakhir diperbarui: {materi?.updatedAt ? new Date(materi.updatedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }) : "-"}
                  </span>
                  <span className="w-px h-4 bg-slate-200" />
                  <span className="flex items-center gap-1.5">
                    <File size={13} className="text-slate-400" />
                    {materi?.tipe === "link" ? "Link" : "File"}
                  </span>
                  {materi?.status && (
                    <>
                      <span className="w-px h-4 bg-slate-200" />
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium border border-emerald-200">
                        <CheckCircle size={10} />
                        {materi.status}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* =====================================================
                  NOTIFICATIONS
              ===================================================== */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">Terjadi kesalahan</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                  <button type="button" onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">
                    <X size={16} />
                  </button>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">Berhasil</p>
                    <p className="text-sm text-emerald-600 mt-1">{success}</p>
                  </div>
                </div>
              )}

              {/* =====================================================
                  FORM - GRID LAYOUT
              ===================================================== */}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
                  {/* LEFT - FORM */}
                  <div className="space-y-6">
                    {/* Informasi Dasar */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                            <BookOpen size={18} />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-slate-800">Informasi Materi</h2>
                            <p className="text-xs text-slate-400">Data dasar materi pembelajaran</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-5">
                        {/* Kelas & Mapel */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Kelas & Mata Pelajaran <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={kelasMapelId}
                            onChange={(e) => setKelasMapelId(e.target.value)}
                            disabled={saving}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-slate-300 disabled:opacity-60"
                          >
                            <option value="">Pilih kelas & mata pelajaran</option>
                            {kelasMapelList.map((item) => (
                              <option key={item.id} value={item.id}>
                                {getKelasName(item)} — {getMapelName(item)}
                              </option>
                            ))}
                          </select>
                          {selectedKelasMapel && (
                            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700">
                              <BookOpen size={13} />
                              {getKelasName(selectedKelasMapel)} · {getMapelName(selectedKelasMapel)}
                            </div>
                          )}
                        </div>

                        {/* Judul */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-sm font-semibold text-slate-700">
                              Judul Materi <span className="text-red-500">*</span>
                            </label>
                            <span className="text-xs text-slate-400">{judul.length}/100</span>
                          </div>
                          <input
                            type="text"
                            value={judul}
                            maxLength={100}
                            onChange={(e) => setJudul(e.target.value)}
                            disabled={saving}
                            placeholder="Contoh: Pengenalan React Hooks"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-slate-300 placeholder:text-slate-400 disabled:opacity-60"
                          />
                        </div>

                        {/* Kategori */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Bab / Kategori
                          </label>
                          <input
                            type="text"
                            value={kategori}
                            onChange={(e) => setKategori(e.target.value)}
                            disabled={saving}
                            placeholder="Contoh: Bab 1 — Aljabar"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-slate-300 placeholder:text-slate-400 disabled:opacity-60"
                          />
                        </div>

                        {/* Deskripsi */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Deskripsi
                          </label>
                          <textarea
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                            rows={4}
                            disabled={saving}
                            placeholder="Tuliskan ringkasan singkat mengenai materi..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-slate-300 resize-none placeholder:text-slate-400 disabled:opacity-60"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sumber Materi */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                            <FolderOpen size={18} />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-slate-800">Sumber Materi</h2>
                            <p className="text-xs text-slate-400">Pilih jenis sumber materi</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-5">
                        {/* Mode Toggle */}
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => setMode("file")}
                            className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                              mode === "file"
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <Upload size={16} />
                            File
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => setMode("link")}
                            className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                              mode === "link"
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <LinkIcon size={16} />
                            Link
                          </button>
                        </div>

                        {/* File Mode */}
                        {mode === "file" && (
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                              File Materi
                            </label>

                            {materi?.urlFile && !file && (
                              <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                                <FileText size={16} className="text-slate-500" />
                                <span className="text-sm text-slate-600">File saat ini tersimpan</span>
                              </div>
                            )}

                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-all">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.mp4,.mpeg,.webm,.mov"
                                onChange={handleFileChange}
                                disabled={saving}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:font-semibold hover:file:bg-blue-100"
                              />

                              {file && (
                                <div className="flex items-center justify-between mt-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {file.type.includes("video") ? (
                                      <FileVideo size={18} className="text-blue-600 shrink-0" />
                                    ) : (
                                      <FileText size={18} className="text-blue-600 shrink-0" />
                                    )}
                                    <p className="text-sm text-blue-700 truncate">{file.name}</p>
                                    <span className="text-xs text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">
                                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={removeNewFile}
                                    className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-all"
                                  >
                                    <X size={15} />
                                  </button>
                                </div>
                              )}

                              <p className="text-xs text-slate-400 mt-2">
                                Kosongkan jika tidak ingin mengganti file. Maksimal 100 MB.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Link Mode */}
                        {mode === "link" && (
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                              URL Materi <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <LinkIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="url"
                                value={urlLink}
                                onChange={(e) => setUrlLink(e.target.value)}
                                disabled={saving}
                                placeholder="https://..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-slate-300 placeholder:text-slate-400 disabled:opacity-60"
                              />
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                              Masukkan URL lengkap materi dari platform eksternal.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT - SIDEBAR */}
                  <div className="space-y-6">
                    {/* Ringkasan */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                          <Info size={16} />
                        </div>
                        <h3 className="font-semibold text-slate-800 text-sm">Ringkasan</h3>
                      </div>

                      <div className="space-y-4 text-sm">
                        <div className="border-b border-slate-100 pb-3">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Judul</p>
                          <p className="mt-1 font-semibold text-slate-800 break-words">{judul || "Belum diisi"}</p>
                        </div>
                        <div className="border-b border-slate-100 pb-3">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kelas</p>
                          <p className="mt-1 font-semibold text-slate-800">{selectedKelasMapel ? getKelasName(selectedKelasMapel) : "Belum dipilih"}</p>
                        </div>
                        <div className="border-b border-slate-100 pb-3">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mapel</p>
                          <p className="mt-1 font-semibold text-slate-800">{selectedKelasMapel ? getMapelName(selectedKelasMapel) : "Belum dipilih"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sumber</p>
                          <div className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
                            {mode === "file" ? (
                              <>
                                <Upload size={13} />
                                File
                              </>
                            ) : (
                              <>
                                <LinkIcon size={13} />
                                Link
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                          <Info size={16} />
                        </div>
                        <h3 className="font-semibold text-blue-700 text-sm">Tips Edit</h3>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-600">
                        <li className="flex items-start gap-2 p-2 bg-white/70 rounded-lg border border-blue-50">
                          <CheckCircle size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>Pastikan data kelas dan mapel sudah sesuai</span>
                        </li>
                        <li className="flex items-start gap-2 p-2 bg-white/70 rounded-lg border border-blue-50">
                          <CheckCircle size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>Ganti file hanya jika diperlukan</span>
                        </li>
                        <li className="flex items-start gap-2 p-2 bg-white/70 rounded-lg border border-blue-50">
                          <CheckCircle size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>Perubahan akan langsung tampil untuk siswa</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* =====================================================
                    ACTION BUTTONS
                ===================================================== */}
                <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => router.push(`/guru/materi/${id}`)}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 text-sm font-medium transition-all disabled:opacity-60"
                  >
                    <X size={16} />
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
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