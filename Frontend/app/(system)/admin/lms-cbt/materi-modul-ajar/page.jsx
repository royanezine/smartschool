"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpenCheck,
  Plus,
  Search,
  Users,
  CheckCircle2,
  Clock3,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  X,
  FileText,
  Video,
  Link as LinkIcon,
  Download,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Upload,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  getMateriPembelajaran,
  getKelasMapel,
  createMateriDenganFile,
  createMateriDenganLink,
  updateMateriDenganFile,
  updateMateriDenganLink,
  updateMateriTanpaSumber,
  deleteMateriPembelajaran,
} from "@/services/materiPembelajaran.service";


const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const themeTextHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_24px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";


const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const FILE_BASE_URL = API_URL.endsWith("/api")
  ? API_URL.slice(0, -4)
  : API_URL;

function getFileUrl(url) {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const clean = url.startsWith("/") ? url : `/${url}`;
  return `${FILE_BASE_URL}${clean}`;
}

function formatTanggal(isoString) {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "-";
  }
}

function getTipeBadge(tipe) {
  const t = String(tipe || "").toLowerCase();
  if (t === "pdf") {
    return {
      label: "PDF",
      icon: FileText,
      className: "theme-danger",
    };
  }
  if (t === "video") {
    return {
      label: "Video",
      icon: Video,
      className: "theme-info",
    };
  }
  if (t === "link") {
    return {
      label: "Tautan",
      icon: LinkIcon,
      className: "theme-warning",
    };
  }
  return {
    label: tipe || "Materi",
    icon: BookOpenCheck,
    className: "theme-card-soft",
  };
}


export default function MateriModulAjarPage() {
  const router = useRouter();
  const [materiList, setMateriList] = useState([]);
  const [kelasMapelList, setKelasMapelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const [search, setSearch] = useState("");
  const [filterTipe, setFilterTipe] = useState("all");
  const [filterKelas, setFilterKelas] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); 
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formKelasMapelId, setFormKelasMapelId] = useState("");
  const [formJudul, setFormJudul] = useState("");
  const [formKategori, setFormKategori] = useState("Modul Ajar");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [formSumberTipe, setFormSumberTipe] = useState("file"); 
  const [formFile, setFormFile] = useState(null);
  const [formUrlLink, setFormUrlLink] = useState("");
  const [formEditModeSumber, setFormEditModeSumber] = useState("keep"); 


  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setPageError(null);

    try {
      const [materiRes, kmRes] = await Promise.allSettled([
        getMateriPembelajaran(),
        getKelasMapel(),
      ]);

      if (materiRes.status === "fulfilled" && materiRes.value?.success) {
        setMateriList(Array.isArray(materiRes.value.data) ? materiRes.value.data : []);
      } else {
        const errMsg =
          materiRes.status === "rejected"
            ? materiRes.reason?.message || "Gagal memuat daftar materi"
            : materiRes.value?.message || "Gagal memuat materi";
        throw new Error(errMsg);
      }

      if (kmRes.status === "fulfilled" && kmRes.value?.success) {
        setKelasMapelList(Array.isArray(kmRes.value.data) ? kmRes.value.data : []);
      }
    } catch (err) {
      setPageError(err.message || "Gagal menghubungi server backend.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);


  const totalMateri = materiList.length;
  const pdfCount = materiList.filter((m) => m.tipe === "pdf").length;
  const videoCount = materiList.filter((m) => m.tipe === "video").length;
  const linkCount = materiList.filter((m) => m.tipe === "link").length;


  const distinctKelas = useMemo(() => {
    const map = new Map();
    materiList.forEach((m) => {
      const k = m.kelasMapel?.kelas;
      if (k?.id && !map.has(k.id)) {
        map.set(k.id, k.nama);
      }
    });
    return Array.from(map.entries()).map(([id, nama]) => ({ id, nama }));
  }, [materiList]);

  const filteredMateri = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return materiList.filter((item) => {
      if (filterTipe !== "all" && item.tipe !== filterTipe) {
        return false;
      }

      if (filterKelas !== "all" && item.kelasMapel?.kelas?.id !== filterKelas) {
        return false;
      }

      if (!keyword) return true;

      const judul = (item.judul || "").toLowerCase();
      const mapel = (item.kelasMapel?.mataPelajaran?.nama || "").toLowerCase();
      const kelas = (item.kelasMapel?.kelas?.nama || "").toLowerCase();
      const guru = (item.kelasMapel?.guruPengajar?.namaLengkap || "").toLowerCase();
      const kategori = (item.kategori || "").toLowerCase();

      return (
        judul.includes(keyword) ||
        mapel.includes(keyword) ||
        kelas.includes(keyword) ||
        guru.includes(keyword) ||
        kategori.includes(keyword)
      );
    });
  }, [materiList, search, filterTipe, filterKelas]);

  const totalPages = Math.max(1, Math.ceil(filteredMateri.length / pageSize));

  const paginatedMateri = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMateri.slice(start, start + pageSize);
  }, [filteredMateri, currentPage]);

  const handleFilterChange = (setter, val) => {
    setter(val);
    setCurrentPage(1);
  };


  const openAddModal = () => {
    router.push("/admin/lms-cbt/materi-modul-ajar/tambah");
  };

  const openDetailModal = (item) => {
    if (item?.id) {
      router.push(`/admin/lms-cbt/materi-modul-ajar/${item.id}`);
    }
  };

  const openEditModal = (item) => {
    if (item?.id) {
      router.push(`/admin/lms-cbt/materi-modul-ajar/${item.id}/edit`);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formKelasMapelId) {
      setFormError("Silakan pilih Kelas dan Mata Pelajaran.");
      return;
    }
    if (!formJudul.trim()) {
      setFormError("Judul materi wajib diisi.");
      return;
    }
    if (formJudul.trim().length > 100) {
      setFormError("Judul materi maksimal 100 karakter.");
      return;
    }

    setSubmitting(true);

    try {
      if (modalType === "add") {
        if (formSumberTipe === "file") {
          if (!formFile) {
            setFormError("Pilih file materi (PDF atau Video) untuk diunggah.");
            setSubmitting(false);
            return;
          }
          await createMateriDenganFile(
            {
              kelasMapelId: formKelasMapelId,
              judul: formJudul.trim(),
              kategori: formKategori.trim() || undefined,
              deskripsi: formDeskripsi.trim() || undefined,
              file: formFile,
            }
          );
        } else {
          if (!formUrlLink.trim()) {
            setFormError("Masukkan tautan link materi (URL).");
            setSubmitting(false);
            return;
          }
          if (!/^https?:\/\//i.test(formUrlLink.trim())) {
            setFormError("Format URL tidak valid. Awali dengan http:// atau https://");
            setSubmitting(false);
            return;
          }
          await createMateriDenganLink({
            kelasMapelId: formKelasMapelId,
            judul: formJudul.trim(),
            kategori: formKategori.trim() || undefined,
            deskripsi: formDeskripsi.trim() || undefined,
            urlLink: formUrlLink.trim(),
          });
        }

        setFeedback({
          type: "success",
          message: "Materi pembelajaran berhasil ditambahkan.",
        });
      } else if (modalType === "edit" && selectedMateri) {
        if (formEditModeSumber === "keep") {
          if (selectedMateri.tipe === "link") {
            await updateMateriDenganLink(selectedMateri.id, {
              kelasMapelId: formKelasMapelId,
              judul: formJudul.trim(),
              kategori: formKategori.trim() || undefined,
              deskripsi: formDeskripsi.trim() || undefined,
              urlLink: selectedMateri.urlLink || formUrlLink.trim(),
            });
          } else {
            await updateMateriTanpaSumber(selectedMateri.id, {
              kelasMapelId: formKelasMapelId,
              judul: formJudul.trim(),
              kategori: formKategori.trim() || undefined,
              deskripsi: formDeskripsi.trim() || undefined,
            });
          }
        } else if (formEditModeSumber === "change-file") {
          if (!formFile) {
            setFormError("Pilih berkas baru (PDF atau Video) untuk diunggah.");
            setSubmitting(false);
            return;
          }
          await updateMateriDenganFile(selectedMateri.id, {
            kelasMapelId: formKelasMapelId,
            judul: formJudul.trim(),
            kategori: formKategori.trim() || undefined,
            deskripsi: formDeskripsi.trim() || undefined,
            file: formFile,
          });
        } else if (formEditModeSumber === "change-link") {
          if (!formUrlLink.trim()) {
            setFormError("Masukkan URL tautan baru.");
            setSubmitting(false);
            return;
          }
          if (!/^https?:\/\//i.test(formUrlLink.trim())) {
            setFormError("Format URL tidak valid. Awali dengan http:// atau https://");
            setSubmitting(false);
            return;
          }
          await updateMateriDenganLink(selectedMateri.id, {
            kelasMapelId: formKelasMapelId,
            judul: formJudul.trim(),
            kategori: formKategori.trim() || undefined,
            deskripsi: formDeskripsi.trim() || undefined,
            urlLink: formUrlLink.trim(),
          });
        }

        setFeedback({
          type: "success",
          message: "Materi pembelajaran berhasil diperbarui.",
        });
      }

      setShowModal(false);
      await loadData(true);
    } catch (err) {
      setFormError(err.message || "Gagal menyimpan data materi.");
    } finally {
      setSubmitting(false);
    }
  };


  const confirmDelete = async () => {
    if (!deleteConfirmItem) return;
    setSubmitting(true);
    try {
      await deleteMateriPembelajaran(deleteConfirmItem.id);
      setFeedback({
        type: "success",
        message: `Materi "${deleteConfirmItem.judul}" berhasil dihapus.`,
      });
      setDeleteConfirmItem(null);
      await loadData(true);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Gagal menghapus materi.",
      });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen flex theme-page">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 theme-page">
          <div className="mb-3">
            <p className="text-sm theme-text-muted">
              LMS & CBT
              <span className="mx-2 theme-text-placeholder">/</span>
              <span className="theme-text-secondary">
                Materi dan Modul Ajar
              </span>
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
            <div className="flex items-center gap-3">
              <div
                className={`
                  w-12 h-12
                  rounded-xl
                  bg-[var(--color-primary)]
                  flex
                  items-center
                  justify-center
                  ${themePrimaryShadow}
                `}
              >
                <BookOpenCheck size={24} className="text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold theme-text">
                  Materi dan Modul Ajar
                </h1>
                <p className="text-sm theme-text-muted mt-1">
                  Kelola modul pembelajaran, berkas PDF, video, dan tautan belajar siswa.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadData(true)}
                disabled={loading || refreshing}
                className={`
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-3
                  rounded-xl
                  theme-card
                  theme-border
                  border
                  text-sm
                  font-medium
                  theme-text-secondary
                  ${themeTextHover}
                  transition-all
                  ${themeCardShadow}
                `}
                title="Segarkan data dari server"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">Segarkan</span>
              </button>

              <button
                type="button"
                onClick={openAddModal}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-3
                  bg-[var(--color-primary)]
                  hover:brightness-95
                  text-white
                  text-sm
                  font-semibold
                  rounded-xl
                  transition-all
                  shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                "
              >
                <Plus size={18} />
                Tambah Materi
              </button>
            </div>
          </div>

          {feedback && (
            <div
              className={`
                mb-6 p-4 rounded-xl border flex items-center justify-between
                ${
                  feedback.type === "success"
                    ? "theme-success border-[color-mix(in_srgb,var(--color-success)_30%,transparent)]"
                    : "theme-danger border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)]"
                }
              `}
            >
              <div className="flex items-center gap-3">
                {feedback.type === "success" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                <p className="text-sm font-medium">{feedback.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="p-1 rounded-lg hover:opacity-70 transition"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {pageError && (
            <div className="mb-6 p-4 rounded-xl border theme-danger border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={18} />
                <p className="text-sm font-medium">{pageError}</p>
              </div>
              <button
                type="button"
                onClick={() => loadData(true)}
                className="text-xs underline font-semibold px-2 py-1"
              >
                Coba Lagi
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div
              className={`
                theme-card
                theme-border
                rounded-2xl
                border
                p-5
                ${themeCardShadow}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm theme-text-muted">Total Materi</p>
                  <p className="text-3xl font-bold theme-text mt-2">
                    {loading ? "..." : totalMateri}
                  </p>
                  <p className="text-xs theme-text-placeholder mt-2">
                    Seluruh materi & modul ajar
                  </p>
                </div>
                <div
                  className={`
                    w-11 h-11
                    rounded-xl
                    ${themePrimarySoft}
                    flex items-center justify-center
                    text-[var(--color-primary)]
                  `}
                >
                  <BookOpenCheck size={21} />
                </div>
              </div>
            </div>

            <div
              className={`
                theme-card
                theme-border
                rounded-2xl
                border
                p-5
                ${themeCardShadow}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm theme-text-muted">Dokumen PDF</p>
                  <p className="text-3xl font-bold theme-text mt-2">
                    {loading ? "..." : pdfCount}
                  </p>
                  <p className="text-xs theme-text-placeholder mt-2">
                    Berkas teks & modul PDF
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl theme-danger flex items-center justify-center">
                  <FileText size={21} />
                </div>
              </div>
            </div>

            <div
              className={`
                theme-card
                theme-border
                rounded-2xl
                border
                p-5
                ${themeCardShadow}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm theme-text-muted">Video Belajar</p>
                  <p className="text-3xl font-bold theme-text mt-2">
                    {loading ? "..." : videoCount}
                  </p>
                  <p className="text-xs theme-text-placeholder mt-2">
                    Media video pembelajaran
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl theme-info flex items-center justify-center">
                  <Video size={21} />
                </div>
              </div>
            </div>

            <div
              className={`
                theme-card
                theme-border
                rounded-2xl
                border
                p-5
                ${themeCardShadow}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm theme-text-muted">Tautan Web</p>
                  <p className="text-3xl font-bold theme-text mt-2">
                    {loading ? "..." : linkCount}
                  </p>
                  <p className="text-xs theme-text-placeholder mt-2">
                    Link sumber eksternal
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl theme-warning flex items-center justify-center">
                  <LinkIcon size={21} />
                </div>
              </div>
            </div>
          </div>

          <div
            className={`
              theme-card
              theme-border
              rounded-2xl
              border
              ${themeCardShadow}
              overflow-hidden
            `}
          >
            <div className="p-5 theme-border-soft border-b">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="font-semibold theme-text">Daftar Materi</h2>
                  <p className="text-xs theme-text-placeholder mt-1">
                    Daftar materi dan modul ajar terintegrasi server sekolah.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative">
                    <select
                      value={filterTipe}
                      onChange={(e) =>
                        handleFilterChange(setFilterTipe, e.target.value)
                      }
                      className="
                        theme-input
                        px-3
                        py-2.5
                        rounded-xl
                        text-xs
                        focus:outline-none
                      "
                    >
                      <option value="all">Semua Tipe</option>
                      <option value="pdf">PDF</option>
                      <option value="video">Video</option>
                      <option value="link">Tautan Web</option>
                    </select>
                  </div>

                  {distinctKelas.length > 0 && (
                    <div className="relative">
                      <select
                        value={filterKelas}
                        onChange={(e) =>
                          handleFilterChange(setFilterKelas, e.target.value)
                        }
                        className="
                          theme-input
                          px-3
                          py-2.5
                          rounded-xl
                          text-xs
                          focus:outline-none
                        "
                      >
                        <option value="all">Semua Kelas</option>
                        {distinctKelas.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="relative w-full sm:w-64">
                    <Search
                      size={16}
                      className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        theme-text-placeholder
                      "
                    />
                    <input
                      value={search}
                      onChange={(e) =>
                        handleFilterChange(setSearch, e.target.value)
                      }
                      placeholder="Cari judul, mapel, guru..."
                      className="
                        theme-input
                        w-full
                        pl-9
                        pr-4
                        py-2.5
                        rounded-xl
                        text-sm
                        focus:outline-none
                      "
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="theme-card-soft theme-border-soft border-b">
                    <th className="text-left px-5 py-4 text-xs font-semibold theme-text-muted">
                      Materi & Kategori
                    </th>
                    <th className="text-left px-5 py-4 text-xs font-semibold theme-text-muted">
                      Mata Pelajaran
                    </th>
                    <th className="text-left px-5 py-4 text-xs font-semibold theme-text-muted">
                      Kelas
                    </th>
                    <th className="text-left px-5 py-4 text-xs font-semibold theme-text-muted">
                      Guru Pengajar
                    </th>
                    <th className="text-left px-5 py-4 text-xs font-semibold theme-text-muted">
                      Tipe / Berkas
                    </th>
                    <th className="text-left px-5 py-4 text-xs font-semibold theme-text-muted">
                      Tanggal
                    </th>
                    <th className="text-right px-5 py-4 text-xs font-semibold theme-text-muted">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y theme-border-soft">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center">
                        <Loader2
                          size={28}
                          className="mx-auto animate-spin text-[var(--color-primary)] mb-2"
                        />
                        <p className="text-sm font-medium theme-text-secondary">
                          Memuat materi pembelajaran...
                        </p>
                      </td>
                    </tr>
                  ) : paginatedMateri.length > 0 ? (
                    paginatedMateri.map((item) => {
                      const tipeBadge = getTipeBadge(item.tipe);
                      const IconComponent = tipeBadge.icon;
                      const hasFile = Boolean(item.urlFile);
                      const hasLink = Boolean(item.urlLink);

                      return (
                        <tr
                          key={item.id}
                          className={`
                            transition-colors
                            ${themePrimaryHover}
                          `}
                        >
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-semibold text-sm theme-text line-clamp-1">
                                {item.judul}
                              </p>
                              <p className="text-xs theme-text-placeholder mt-0.5">
                                {item.kategori || "Materi Umum"}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-sm theme-text-secondary">
                              {item.kelasMapel?.mataPelajaran?.nama || "-"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-sm theme-text-secondary">
                              {item.kelasMapel?.kelas?.nama || "-"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-sm theme-text-secondary">
                              {item.kelasMapel?.guruPengajar?.namaLengkap || "-"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  px-2.5
                                  py-1
                                  rounded-full
                                  text-xs
                                  font-medium
                                  ${tipeBadge.className}
                                `}
                              >
                                <IconComponent size={12} />
                                {tipeBadge.label}
                              </span>

                              {hasFile && (
                                <a
                                  href={getFileUrl(item.urlFile)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="
                                    p-1.5
                                    rounded-lg
                                    theme-card-soft
                                    theme-text-secondary
                                    hover:text-[var(--color-primary)]
                                    transition
                                  "
                                  title="Unduh / Buka Berkas"
                                >
                                  <Download size={14} />
                                </a>
                              )}

                              {hasLink && (
                                <a
                                  href={item.urlLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="
                                    p-1.5
                                    rounded-lg
                                    theme-card-soft
                                    theme-text-secondary
                                    hover:text-[var(--color-primary)]
                                    transition
                                  "
                                  title="Buka Tautan"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-xs theme-text-placeholder">
                              {formatTanggal(item.dibuatPada)}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openDetailModal(item)}
                                className={`
                                  p-2
                                  rounded-lg
                                  theme-text-placeholder
                                  transition
                                  hover:text-[var(--color-primary)]
                                  ${themePrimarySoft}
                                `}
                                title="Lihat Detail"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="
                                  p-2
                                  rounded-lg
                                  theme-text-placeholder
                                  hover:theme-warning
                                  transition
                                "
                                title="Edit Materi"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteConfirmItem(item)}
                                className="
                                  p-2
                                  rounded-lg
                                  theme-text-placeholder
                                  hover:theme-danger
                                  transition
                                "
                                title="Hapus Materi"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center">
                        <BookOpenCheck
                          size={38}
                          className="mx-auto theme-text-placeholder mb-3"
                        />
                        <p className="text-sm font-medium theme-text-secondary">
                          Materi tidak ditemukan
                        </p>
                        <p className="text-xs theme-text-placeholder mt-1">
                          {search || filterTipe !== "all" || filterKelas !== "all"
                            ? "Coba gunakan kata kunci pencarian atau filter lain."
                            : "Belum ada materi pembelajaran yang dibuat."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filteredMateri.length > 0 && (
              <div className="px-5 py-4 theme-border-soft border-t flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs theme-text-muted">
                  Menampilkan{" "}
                  <span className="font-semibold theme-text">
                    {(currentPage - 1) * pageSize + 1}
                  </span>{" "}
                  sampai{" "}
                  <span className="font-semibold theme-text">
                    {Math.min(currentPage * pageSize, filteredMateri.length)}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold theme-text">
                    {filteredMateri.length}
                  </span>{" "}
                  materi
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="
                      p-2
                      rounded-lg
                      theme-card
                      theme-border
                      border
                      theme-text-secondary
                      hover:brightness-95
                      disabled:opacity-40
                      disabled:cursor-not-allowed
                      transition
                    "
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="px-3 py-1 text-xs font-semibold theme-text">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="
                      p-2
                      rounded-lg
                      theme-card
                      theme-border
                      border
                      theme-text-secondary
                      hover:brightness-95
                      disabled:opacity-40
                      disabled:cursor-not-allowed
                      transition
                    "
                    title="Halaman Selanjutnya"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--color-text)_45%,transparent)] backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`
              theme-card
              theme-border
              w-full
              max-w-md
              rounded-2xl
              border
              ${themeCardShadow}
              p-6
            `}
          >
            <div className="w-12 h-12 rounded-xl theme-danger flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>

            <h3 className="text-lg font-bold theme-text">Hapus Materi</h3>
            <p className="text-sm theme-text-secondary mt-2">
              Apakah Anda yakin ingin menghapus materi{" "}
              <span className="font-semibold text-[var(--color-primary)]">
                &ldquo;{deleteConfirmItem.judul}&rdquo;
              </span>
              ? Tindakan ini akan menghapus materi dari sistem.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                disabled={submitting}
                className="
                  px-4
                  py-2.5
                  rounded-xl
                  theme-card-soft
                  theme-text-secondary
                  text-sm
                  font-medium
                  hover:brightness-95
                  transition
                "
              >
                Batal
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={submitting}
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-5
                  py-2.5
                  rounded-xl
                  bg-[var(--color-danger,#ef4444)]
                  text-white
                  text-sm
                  font-semibold
                  hover:brightness-95
                  disabled:opacity-60
                  transition
                "
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
