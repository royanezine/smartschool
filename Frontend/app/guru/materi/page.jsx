"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import {
  BookOpen,
  Search,
  ChevronDown,
  Plus,
  FileText,
  Layers,
  CalendarDays,
  Eye,
  Pencil,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
  Video,
  X,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Filter,
  File,
  Sparkles,
  GraduationCap,
  Clock,
  HardDrive,
} from "lucide-react";

import {
  getMateriPembelajaran,
  deleteMateriPembelajaran,
} from "../../../services/materiPembelajaran.service";

// ============================================================
// HELPER
// ============================================================

function getKelasName(materi) {
  return (
    materi?.kelasMapel?.kelas?.nama ||
    materi?.kelasMapel?.kelas?.namaKelas ||
    materi?.kelasMapel?.kelas?.kode ||
    materi?.kelas?.nama ||
    materi?.kelas?.namaKelas ||
    materi?.kelasNama ||
    materi?.namaKelas ||
    "-"
  );
}

function getMapelName(materi) {
  return (
    materi?.kelasMapel?.mataPelajaran?.nama ||
    materi?.kelasMapel?.mataPelajaran?.namaMapel ||
    materi?.kelasMapel?.mataPelajaran?.namaMataPelajaran ||
    materi?.mataPelajaran?.nama ||
    materi?.mataPelajaran?.namaMapel ||
    materi?.namaMapel ||
    "-"
  );
}

function getGuruName(materi) {
  return (
    materi?.kelasMapel?.guruPengajar?.namaLengkap ||
    materi?.guru?.namaLengkap ||
    materi?.guru?.nama ||
    "-"
  );
}

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getTipeInfo(tipe) {
  switch (String(tipe || "").toLowerCase()) {
    case "pdf":
      return {
        label: "PDF",
        description: "Dokumen PDF",
        icon: FileText,
        bg: "bg-red-50",
        color: "text-red-600",
        border: "border-red-200",
      };

    case "video":
      return {
        label: "Video",
        description: "Video pembelajaran",
        icon: Video,
        bg: "bg-purple-50",
        color: "text-purple-600",
        border: "border-purple-200",
      };

    case "link":
      return {
        label: "Link",
        description: "Tautan eksternal",
        icon: LinkIcon,
        bg: "bg-blue-50",
        color: "text-blue-600",
        border: "border-blue-200",
      };

    default:
      return {
        label: "Materi",
        description: "Bahan ajar",
        icon: File,
        bg: "bg-slate-50",
        color: "text-slate-600",
        border: "border-slate-200",
      };
  }
}

function getKelasColor(kelas) {
  const value = String(kelas || "").toLowerCase();

  if (
    value.includes("12") ||
    value.includes("xii")
  ) {
    return "bg-violet-100 text-violet-700 border-violet-200";
  }

  if (
    value.includes("11") ||
    value.includes("xi")
  ) {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  if (
    value.includes("10") ||
    value.includes("x ")
  ) {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  if (value.includes("9")) {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  if (value.includes("8")) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  if (value.includes("7")) {
    return "bg-purple-100 text-purple-700 border-purple-200";
  }

  return "bg-slate-100 text-slate-600 border-slate-200";
}

// ============================================================
// SKELETON
// ============================================================

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-slate-200" />
        <div className="w-20 h-6 rounded-full bg-slate-200" />
      </div>

      <div className="mt-4 h-6 bg-slate-200 rounded-lg w-3/4" />

      <div className="mt-2 h-4 bg-slate-200 rounded-lg w-1/2" />

      <div className="mt-3 h-4 bg-slate-200 rounded-lg w-full" />

      <div className="mt-3 h-4 bg-slate-200 rounded-lg w-5/6" />

      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-3">
          <div className="h-8 bg-slate-200 rounded-lg" />
          <div className="h-8 bg-slate-200 rounded-lg" />
        </div>

        <div className="mt-3 h-4 bg-slate-200 rounded-lg w-1/3" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="h-10 bg-slate-200 rounded-lg" />
        <div className="h-10 bg-slate-200 rounded-lg" />
      </div>
    </div>
  );
}

// ============================================================
// SEARCHABLE KELAS DROPDOWN
// ============================================================

function KelasSearchDropdown({
  value,
  options,
  onChange,
  disabled,
}) {
  const wrapperRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const filteredOptions = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    if (!search) {
      return options;
    }

    return options.filter((item) =>
      String(item)
        .toLowerCase()
        .includes(search)
    );
  }, [options, keyword]);

  function handleSelect(item) {
    onChange(item);
    setKeyword("");
    setOpen(false);
  }

  function handleInputChange(event) {
    const text = event.target.value;

    setKeyword(text);
    setOpen(true);

    if (text === "") {
      onChange("Semua Kelas");
    }
  }

  return (
    <div
      ref={wrapperRef}
      className="relative w-full"
    >
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">
        Kelas
      </label>

      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />

        <input
          type="text"
          value={
            open
              ? keyword
              : value === "Semua Kelas"
              ? ""
              : value
          }
          onFocus={() => {
            setOpen(true);
            setKeyword(
              value === "Semua Kelas"
                ? ""
                : value
            );
          }}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder="Cari kelas..."
          className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all hover:border-slate-300 focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 disabled:opacity-60"
        />

        {value !== "Semua Kelas" && (
          <button
            type="button"
            onClick={() => {
              onChange("Semua Kelas");
              setKeyword("");
              setOpen(false);
            }}
            className="absolute right-9 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setOpen((prev) => !prev);
            setKeyword(
              value === "Semua Kelas"
                ? ""
                : value
            );
          }}
          disabled={disabled}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600"
        >
          <ChevronDown
            size={15}
            className={`transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {open && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-300/30 overflow-hidden">
          <div className="max-h-60 overflow-y-auto p-1.5">
            <button
              type="button"
              onClick={() =>
                handleSelect("Semua Kelas")
              }
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                value === "Semua Kelas"
                  ? "bg-blue-50 text-[#155DFC] font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>Semua Kelas</span>

              {value === "Semua Kelas" && (
                <CheckCircle2
                  size={15}
                  className="text-[#155DFC]"
                />
              )}
            </button>

            {filteredOptions
              .filter(
                (item) =>
                  item !== "Semua Kelas"
              )
              .map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    handleSelect(item)
                  }
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                    value === item
                      ? "bg-blue-50 text-[#155DFC] font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">
                    {item}
                  </span>

                  {value === item && (
                    <CheckCircle2
                      size={15}
                      className="text-[#155DFC] shrink-0"
                    />
                  )}
                </button>
              ))}

            {filteredOptions.filter(
              (item) =>
                item !== "Semua Kelas"
            ).length === 0 && (
              <div className="px-4 py-6 text-center">
                <Search
                  size={22}
                  className="mx-auto text-slate-300"
                />

                <p className="text-sm font-medium text-slate-500 mt-2">
                  Kelas tidak ditemukan
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Coba kata pencarian lain
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function GuruMateriPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [materiList, setMateriList] =
    useState([]);

  const [kelas, setKelas] =
    useState("Semua Kelas");

  const [tipe, setTipe] =
    useState("Semua Tipe");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState(null);

  const [successMessage, setSuccessMessage] =
    useState("");

  const notifications = [
    {
      id: 1,
      title: "Rapat Wali Kelas",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Batas Input Nilai Rapor",
      desc: "Dikirim 5 jam lalu",
      read: false,
    },
  ];

  // ============================================================
  // LOAD MATERI
  // ============================================================

  const loadMateri = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await getMateriPembelajaran();

        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

        setMateriList(data);
      } catch (err) {
        console.error(
          "Gagal mengambil materi:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil data materi dari server."
        );

        setMateriList([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadMateri();
  }, [loadMateri]);

  // ============================================================
  // KELAS YANG TERSEDIA UNTUK GURU
  // ============================================================

  const kelasOptions = useMemo(() => {
    const values = materiList
      .map((item) => getKelasName(item))
      .filter(
        (item) =>
          item &&
          item !== "-" &&
          String(item).trim() !== ""
      );

    const uniqueValues = Array.from(
      new Set(values)
    );

    uniqueValues.sort((a, b) =>
      String(a).localeCompare(
        String(b),
        "id",
        {
          numeric: true,
          sensitivity: "base",
        }
      )
    );

    return [
      "Semua Kelas",
      ...uniqueValues,
    ];
  }, [materiList]);

  // ============================================================
  // TIPE
  // ============================================================

  const tipeOptions = [
    "Semua Tipe",
    "pdf",
    "video",
    "link",
  ];

  // ============================================================
  // FILTER MATERI
  // ============================================================

  const filteredMateri = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return materiList.filter((materi) => {
      const namaKelas =
        getKelasName(materi);

      const namaMapel =
        getMapelName(materi);

      const judul = String(
        materi?.judul || ""
      ).toLowerCase();

      const deskripsi = String(
        materi?.deskripsi || ""
      ).toLowerCase();

      const kategori = String(
        materi?.kategori || ""
      ).toLowerCase();

      const mapel = String(
        namaMapel || ""
      ).toLowerCase();

      const kelasMateri = String(
        namaKelas || ""
      ).toLowerCase();

      const matchKelas =
        kelas === "Semua Kelas" ||
        namaKelas === kelas;

      const matchTipe =
        tipe === "Semua Tipe" ||
        String(materi?.tipe || "").toLowerCase() ===
          tipe.toLowerCase();

      const matchSearch =
        !keyword ||
        judul.includes(keyword) ||
        deskripsi.includes(keyword) ||
        mapel.includes(keyword) ||
        kelasMateri.includes(keyword) ||
        kategori.includes(keyword);

      return (
        matchKelas &&
        matchTipe &&
        matchSearch
      );
    });
  }, [
    materiList,
    kelas,
    tipe,
    search,
  ]);

  // ============================================================
  // SUMMARY
  // ============================================================

  const summary = useMemo(() => {
    const now = new Date();

    const total = materiList.length;

    const bulanIni =
      materiList.filter((item) => {
        if (!item?.dibuatPada) {
          return false;
        }

        const date = new Date(
          item.dibuatPada
        );

        return (
          !Number.isNaN(
            date.getTime()
          ) &&
          date.getMonth() ===
            now.getMonth() &&
          date.getFullYear() ===
            now.getFullYear()
        );
      }).length;

    const kelasTercakup =
      new Set(
        materiList
          .map((item) =>
            getKelasName(item)
          )
          .filter(
            (item) =>
              item &&
              item !== "-"
          )
      ).size;

    const totalFile =
      materiList.filter(
        (item) =>
          item?.urlFile
      ).length;

    const totalLink =
      materiList.filter(
        (item) =>
          item?.urlLink
      ).length;

    return {
      total,
      bulanIni,
      kelasTercakup,
      totalFile,
      totalLink,
    };
  }, [materiList]);

  // ============================================================
  // DELETE
  // ============================================================

  async function handleDelete(id) {
    const materi =
      materiList.find(
        (item) => item.id === id
      );

    if (!materi) {
      return;
    }

    const confirmed =
      window.confirm(
        `Hapus materi "${materi.judul}"?\n\nMateri yang dihapus tidak akan tampil lagi pada daftar.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await deleteMateriPembelajaran(
        id
      );

      setMateriList((prev) =>
        prev.filter(
          (item) =>
            item.id !== id
        )
      );

      setSuccessMessage(
        "Materi berhasil dihapus."
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error(
        "Gagal menghapus materi:",
        err
      );

      setError(
        err?.message ||
          "Materi gagal dihapus."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ============================================================
  // RESET
  // ============================================================

  function resetFilter() {
    setKelas("Semua Kelas");
    setTipe("Semua Tipe");
    setSearch("");
  }

  const hasFilter =
    kelas !== "Semua Kelas" ||
    tipe !== "Semua Tipe" ||
    search.trim() !== "";

  // ============================================================
  // SIDEBAR
  // ============================================================

  function toggleSidebar() {
    setSidebarOpen(
      (prev) => !prev
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        active="materi"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(
            (prev) => !prev
          )
        }
        role="guru"
      />

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={
            toggleSidebar
          }
          notifications={
            notifications
          }
          user={{
            name: "Bu Sari",
            email:
              "guru@smartschool.com",
            avatar: "BS",
          }}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

              {/* ==================================================
                  HERO
              ================================================== */}

              <section className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 sm:p-8 shadow-xl border border-white/10">

                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                  <div className="flex items-start gap-4">

                    <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/20">
                      <BookOpen
                        size={24}
                        className="text-blue-400"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-3 flex-wrap">

                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                          Materi Pembelajaran
                        </h1>

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/20 text-blue-300 text-xs font-medium">
                          <Sparkles size={12} />
                          Guru
                        </span>

                      </div>

                      <p className="text-blue-300/80 text-sm mt-1">
                        Kelola bahan ajar untuk siswa berdasarkan kelas dan mata pelajaran
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">

                    <button
                      type="button"
                      onClick={() =>
                        loadMateri(true)
                      }
                      disabled={
                        refreshing
                      }
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-medium transition-all border border-white/20 disabled:opacity-60"
                    >
                      <RefreshCw
                        size={15}
                        className={
                          refreshing
                            ? "animate-spin"
                            : ""
                        }
                      />

                      Refresh
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/guru/materi/tambah"
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/30"
                    >
                      <Plus size={16} />

                      Tambah Materi
                    </button>

                  </div>
                </div>

                {/* ==================================================
                    QUICK STATS
                ================================================== */}

                <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">

                  {[
                    {
                      label:
                        "Total Materi",
                      value:
                        loading
                          ? "—"
                          : summary.total,
                      icon: Layers,
                    },
                    {
                      label:
                        "Bulan Ini",
                      value:
                        loading
                          ? "—"
                          : summary.bulanIni,
                      icon: CalendarDays,
                    },
                    {
                      label:
                        "Kelas",
                      value:
                        loading
                          ? "—"
                          : summary.kelasTercakup,
                      icon: GraduationCap,
                    },
                    {
                      label:
                        "Sumber",
                      value:
                        loading
                          ? "Memuat..."
                          : `${summary.totalFile} file · ${summary.totalLink} link`,
                      icon: HardDrive,
                    },
                  ].map(
                    (stat, idx) => (
                      <div
                        key={idx}
                        className="bg-white/5 backdrop-blur-sm rounded-xl p-3.5 border border-white/10 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-center gap-2.5">

                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <stat.icon
                              size={16}
                              className="text-blue-300"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-lg font-bold text-white truncate">
                              {
                                stat.value
                              }
                            </p>

                            <p className="text-[10px] text-white/50 uppercase tracking-wider truncate">
                              {
                                stat.label
                              }
                            </p>
                          </div>

                        </div>
                      </div>
                    )
                  )}

                </div>
              </section>

              {/* ==================================================
                  SUCCESS
              ================================================== */}

              {successMessage && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">

                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2
                      size={17}
                    />
                  </div>

                  <p className="text-sm font-medium text-emerald-700">
                    {
                      successMessage
                    }
                  </p>

                </div>
              )}

              {/* ==================================================
                  ERROR
              ================================================== */}

              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">

                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <AlertCircle
                      size={17}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-red-700">
                      Terjadi kesalahan
                    </p>

                    <p className="text-sm text-red-600 mt-1 break-words leading-relaxed">
                      {error}
                    </p>
                  </div>

                </div>
              )}

              {/* ==================================================
                  FILTER
              ================================================== */}

              <section className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/80 p-4 sm:p-5">

                <div className="flex flex-col lg:flex-row lg:items-end gap-4">

                  {/* FILTER TITLE */}

                  <div className="lg:w-36 shrink-0">

                    <div className="flex items-center gap-2">

                      <div className="w-8 h-8 rounded-lg bg-[#eaf1ff] text-[#155DFC] flex items-center justify-center">
                        <Filter
                          size={15}
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          Filter
                        </p>

                        <p className="text-xs text-slate-400">
                          Daftar materi
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* ==================================================
                      KELAS SEARCHABLE
                  ================================================== */}

                  <div className="w-full lg:w-64">
                    <KelasSearchDropdown
                      value={kelas}
                      options={
                        kelasOptions
                      }
                      onChange={
                        setKelas
                      }
                      disabled={
                        loading
                      }
                    />
                  </div>

                  {/* ==================================================
                      TIPE
                  ================================================== */}

                  <div className="w-full lg:w-56">

                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                      Tipe Materi
                    </label>

                    <div className="relative">

                      <select
                        value={tipe}
                        onChange={(e) =>
                          setTipe(
                            e.target.value
                          )
                        }
                        disabled={
                          loading
                        }
                        className="w-full appearance-none px-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 disabled:opacity-60"
                      >

                        {tipeOptions.map(
                          (item) => (
                            <option
                              key={
                                item
                              }
                              value={
                                item
                              }
                            >
                              {item ===
                              "Semua Tipe"
                                ? item
                                : getTipeInfo(
                                    item
                                  )
                                    .label}
                            </option>
                          )
                        )}

                      </select>

                      <ChevronDown
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />

                    </div>
                  </div>

                  {/* ==================================================
                      SEARCH
                  ================================================== */}

                  <div className="flex-1 min-w-0">

                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                      Pencarian
                    </label>

                    <div className="relative">

                      <Search
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                          setSearch(
                            e.target.value
                          )
                        }
                        disabled={
                          loading
                        }
                        placeholder="Cari judul, kelas, mapel, atau kategori..."
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-all hover:border-slate-300 focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 disabled:opacity-60"
                      />

                      {search && (
                        <button
                          type="button"
                          onClick={() =>
                            setSearch("")
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        >
                          <X
                            size={14}
                          />
                        </button>
                      )}

                    </div>
                  </div>

                  {/* ==================================================
                      RESET
                  ================================================== */}

                  {hasFilter && (
                    <button
                      type="button"
                      onClick={
                        resetFilter
                      }
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 text-sm font-medium shrink-0 transition-all"
                    >
                      <X size={14} />

                      Reset Filter
                    </button>
                  )}

                </div>

                {/* ==================================================
                    INFO KELAS
                ================================================== */}

                {!loading &&
                  kelasOptions.length >
                    1 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                      <div className="flex items-center gap-2 text-xs text-slate-400">

                        <GraduationCap
                          size={14}
                          className="text-[#155DFC]"
                        />

                        <span>
                          {
                            kelasOptions.length -
                            1
                          }{" "}
                          kelas tersedia pada materi yang diajar
                        </span>

                      </div>

                      {kelas !==
                        "Semua Kelas" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#155DFC] text-xs font-semibold">
                          Kelas:{" "}
                          {kelas}
                        </span>
                      )}

                    </div>
                  )}

              </section>

              {/* ==================================================
                  LIST HEADER
              ================================================== */}

              {!loading && (
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">

                  <div>

                    <h2 className="text-lg font-semibold text-slate-800">
                      Daftar Materi
                    </h2>

                    <p className="text-sm text-slate-400 mt-0.5">
                      {
                        filteredMateri.length
                      }{" "}
                      materi ditampilkan dari{" "}
                      {
                        materiList.length
                      }{" "}
                      data
                    </p>

                  </div>

                  {hasFilter && (
                    <span className="text-xs text-[#155DFC] font-medium bg-[#eaf1ff] px-3 py-1 rounded-full">
                      Filter aktif
                    </span>
                  )}

                </div>
              )}

              {/* ==================================================
                  LOADING
              ================================================== */}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-5">

                  {[
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                  ].map((i) => (
                    <SkeletonCard
                      key={i}
                    />
                  ))}

                </div>
              ) : filteredMateri.length ===
                0 ? (
                /* ==================================================
                    EMPTY
                ================================================== */

                <section className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/80 p-12 sm:p-16 text-center">

                  <div className="max-w-md mx-auto">

                    <div className="w-20 h-20 mx-auto rounded-2xl bg-[#eaf1ff] border border-[#c7dbff] flex items-center justify-center">

                      <BookOpen
                        size={36}
                        className="text-[#155DFC]"
                      />

                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mt-6">
                      {materiList.length ===
                      0
                        ? "Belum Ada Materi"
                        : "Materi Tidak Ditemukan"}
                    </h3>

                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                      {materiList.length ===
                      0
                        ? "Anda belum memiliki bahan ajar. Mulai bagikan materi untuk siswa."
                        : "Coba ubah filter kelas, tipe materi, atau kata pencarian."}
                    </p>

                    {materiList.length ===
                    0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            "/guru/materi/tambah"
                          )
                        }
                        className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-[#155DFC] hover:bg-[#0d47c9] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-200"
                      >
                        <Plus
                          size={16}
                        />

                        Tambah Materi
                        Sekarang
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={
                          resetFilter
                        }
                        className="inline-flex items-center gap-2 mt-6 px-5 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-all"
                      >
                        <RefreshCw
                          size={16}
                        />

                        Reset Filter
                      </button>
                    )}

                  </div>

                </section>
              ) : (
                /* ==================================================
                    CARD GRID
                ================================================== */

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-5">

                  {filteredMateri.map(
                    (materi) => {
                      const kelasName =
                        getKelasName(
                          materi
                        );

                      const mapelName =
                        getMapelName(
                          materi
                        );

                      const guruName =
                        getGuruName(
                          materi
                        );

                      const tipeInfo =
                        getTipeInfo(
                          materi?.tipe
                        );

                      const TypeIcon =
                        tipeInfo.icon;

                      return (
                        <article
                          key={
                            materi.id
                          }
                          className="group flex flex-col min-w-0 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-[#155DFC] hover:shadow-xl hover:shadow-[#155DFC]/10 transition-all duration-300 overflow-hidden"
                        >

                          <div className="p-5 flex flex-col flex-1">

                            {/* HEADER */}

                            <div className="flex items-start justify-between gap-3">

                              <div
                                className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${tipeInfo.bg} ${tipeInfo.color} ${tipeInfo.border}`}
                              >
                                <TypeIcon
                                  size={20}
                                />
                              </div>

                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold shrink-0 ${getKelasColor(
                                  kelasName
                                )}`}
                              >
                                {
                                  kelasName
                                }
                              </span>

                            </div>

                            {/* TITLE */}

                            <h3 className="mt-4 text-base sm:text-[17px] font-semibold leading-6 text-slate-800 break-words line-clamp-2 group-hover:text-[#155DFC] transition-colors">
                              {materi.judul ||
                                "Tanpa Judul"}
                            </h3>

                            {/* MAPEL */}

                            <div className="flex items-center gap-2 mt-2">

                              <BookOpen
                                size={
                                  14
                                }
                                className="text-[#155DFC] shrink-0"
                              />

                              <p className="text-sm font-medium text-[#155DFC] truncate">
                                {
                                  mapelName
                                }
                              </p>

                            </div>

                            {/* KATEGORI */}

                            {materi.kategori && (
                              <div className="mt-3">

                                <span className="inline-flex max-w-full px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-500 truncate">
                                  {
                                    materi.kategori
                                  }
                                </span>

                              </div>
                            )}

                            {/* DESKRIPSI */}

                            <p className="mt-3 text-sm text-slate-500 leading-6 line-clamp-3 min-h-[72px]">
                              {materi.deskripsi ||
                                "Belum ada deskripsi materi."}
                            </p>

                            {/* META */}

                            <div className="mt-4 pt-4 border-t border-slate-100 flex-1">

                              <div className="grid grid-cols-2 gap-3">

                                <div className="min-w-0">

                                  <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                                    Tanggal
                                  </p>

                                  <div className="flex items-center gap-1.5 mt-1">

                                    <CalendarDays
                                      size={
                                        13
                                      }
                                      className="text-slate-400 shrink-0"
                                    />

                                    <p className="text-xs font-medium text-slate-600 truncate">
                                      {formatTanggal(
                                        materi.dibuatPada
                                      )}
                                    </p>

                                  </div>

                                </div>

                                <div className="min-w-0">

                                  <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                                    Sumber
                                  </p>

                                  <div className="flex items-center gap-1.5 mt-1">

                                    <TypeIcon
                                      size={
                                        13
                                      }
                                      className="text-slate-400 shrink-0"
                                    />

                                    <p className="text-xs font-medium text-slate-600">
                                      {
                                        tipeInfo.label
                                      }
                                    </p>

                                  </div>

                                </div>

                              </div>

                              <div className="mt-3">

                                <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                                  Pengajar
                                </p>

                                <p className="text-xs font-medium text-slate-600 mt-1 truncate">
                                  {
                                    guruName
                                  }
                                </p>

                              </div>

                            </div>
                          </div>

                          {/* ACTION */}

                          <div className="px-5 pb-5">

                            <div className="grid grid-cols-2 gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/guru/materi/${materi.id}`
                                  )
                                }
                                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-sm font-medium transition-all"
                              >
                                <Eye
                                  size={
                                    15
                                  }
                                />

                                Lihat
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/guru/materi/${materi.id}/edit`
                                  )
                                }
                                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#eaf1ff] border border-[#c7dbff] text-[#155DFC] hover:bg-[#d6e6ff] text-sm font-medium transition-all"
                              >
                                <Pencil
                                  size={
                                    15
                                  }
                                />

                                Edit
                              </button>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  materi.id
                                )
                              }
                              disabled={
                                deletingId ===
                                materi.id
                              }
                              className="mt-2.5 w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >

                              {deletingId ===
                              materi.id ? (
                                <>
                                  <Loader2
                                    size={
                                      15
                                    }
                                    className="animate-spin"
                                  />

                                  Menghapus...
                                </>
                              ) : (
                                <>
                                  <Trash2
                                    size={
                                      15
                                    }
                                  />

                                  Hapus
                                </>
                              )}

                            </button>

                          </div>

                        </article>
                      );
                    }
                  )}

                </div>
              )}

              {/* ==================================================
                  FOOTER
              ================================================== */}

              {!loading &&
                filteredMateri.length >
                  0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-slate-200/50">

                    <p className="text-xs sm:text-sm text-slate-400">
                      Menampilkan{" "}
                      <span className="font-semibold text-slate-600">
                        {
                          filteredMateri.length
                        }
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold text-slate-600">
                        {
                          materiList.length
                        }
                      </span>{" "}
                      materi
                    </p>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5">

                      <Clock
                        size={12}
                      />

                      Data berasal dari sistem SmartSchool

                    </p>

                  </div>
                )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}