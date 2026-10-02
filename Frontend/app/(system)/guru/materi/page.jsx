"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

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
} from "../../../../services/materiPembelajaran.service";

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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeOverlay =
  "bg-[color-mix(in_srgb,var(--color-text)_70%,transparent)]";

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

// ============================================================
// TIPE MATERI
// ============================================================

function getTipeInfo(tipe) {
  switch (String(tipe || "").toLowerCase()) {
    case "pdf":
      return {
        label: "PDF",
        description: "Dokumen PDF",
        icon: FileText,
        bg: themeDangerSurface,
        color: "theme-danger",
        border: themeDangerBorder,
      };

    case "video":
      return {
        label: "Video",
        description: "Video pembelajaran",
        icon: Video,
        bg: themePrimarySoft,
        color: themePrimaryText,
        border: themePrimarySoftBorder,
      };

    case "link":
      return {
        label: "Link",
        description: "Tautan eksternal",
        icon: LinkIcon,
        bg: themeInfoSurface,
        color: "text-[var(--color-info)]",
        border: themeInfoBorder,
      };

    default:
      return {
        label: "Materi",
        description: "Bahan ajar",
        icon: File,
        bg: themeNeutralSurface,
        color: "theme-text-secondary",
        border: themeNeutralBorder,
      };
  }
}

// ============================================================
// KELAS STYLE
// ============================================================

function getKelasColor(kelas) {
  const value = String(kelas || "").toLowerCase();

  if (value.includes("12") || value.includes("xii")) {
    return `${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`;
  }

  if (value.includes("11") || value.includes("xi")) {
    return `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`;
  }

  if (value.includes("10") || value.includes("x ")) {
    return `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`;
  }

  if (value.includes("9")) {
    return `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`;
  }

  if (value.includes("8")) {
    return `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`;
  }

  if (value.includes("7")) {
    return `${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`;
  }

  return `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`;
}

// ============================================================
// SKELETON
// ============================================================

function SkeletonCard() {
  return (
    <div
      className={`theme-card ${themeNeutralBorder} rounded-2xl ${themeSmallShadow} p-5 animate-pulse`}
    >
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl theme-neutral-surface bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]" />
        <div className="w-20 h-6 rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]" />
      </div>

      <div className="mt-4 h-6 bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] rounded-lg w-3/4" />

      <div className="mt-2 h-4 bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] rounded-lg w-1/2" />

      <div className="mt-3 h-4 bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] rounded-lg w-full" />

      <div className="mt-3 h-4 bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] rounded-lg w-5/6" />

      <div className={`mt-4 pt-4 border-t ${themeDivider}`}>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-8 bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] rounded-lg" />
          <div className="h-8 bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] rounded-lg" />
        </div>

        <div className="mt-3 h-4 bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] rounded-lg w-1/3" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="h-10 bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] rounded-lg" />
        <div className="h-10 bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] rounded-lg" />
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
      <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
        Kelas
      </label>

      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none"
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
          className={`theme-input w-full pl-10 pr-20 py-2.5 rounded-xl text-sm font-medium outline-none transition-all ${themeFocus} placeholder:text-[var(--color-text-placeholder)] disabled:opacity-60`}
        />

        {value !== "Semua Kelas" && (
          <button
            type="button"
            onClick={() => {
              onChange("Semua Kelas");
              setKeyword("");
              setOpen(false);
            }}
            className={`absolute right-9 top-1/2 -translate-y-1/2 p-1 rounded-md theme-text-muted ${themeNeutralHover} hover:text-[var(--color-text)]`}
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
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md theme-text-muted ${themeNeutralHover}`}
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
        <div
          className={`absolute z-50 left-0 right-0 mt-2 theme-card border ${themeNeutralBorder} rounded-xl ${themePrimaryShadow} overflow-hidden`}
        >
          <div className="max-h-60 overflow-y-auto p-1.5">
            <button
              type="button"
              onClick={() =>
                handleSelect("Semua Kelas")
              }
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                value === "Semua Kelas"
                  ? `${themePrimarySoft} ${themePrimaryText} font-semibold`
                  : `theme-text-secondary ${themeNeutralHover}`
              }`}
            >
              <span>Semua Kelas</span>

              {value === "Semua Kelas" && (
                <CheckCircle2
                  size={15}
                  className={themePrimaryText}
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
                      ? `${themePrimarySoft} ${themePrimaryText} font-semibold`
                      : `theme-text-secondary ${themeNeutralHover}`
                  }`}
                >
                  <span className="truncate">
                    {item}
                  </span>

                  {value === item && (
                    <CheckCircle2
                      size={15}
                      className={`${themePrimaryText} shrink-0`}
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
                  className="mx-auto theme-text-muted"
                />

                <p className="text-sm font-medium theme-text-secondary mt-2">
                  Kelas tidak ditemukan
                </p>

                <p className="text-xs theme-text-muted mt-1">
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
  // KELAS
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
  // FILTER
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
        String(
          materi?.tipe || ""
        ).toLowerCase() ===
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

      await deleteMateriPembelajaran(id);

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
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* SIDEBAR */}

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

      {/* CONTENT */}

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

              <section
                className={`relative overflow-hidden rounded-2xl ${themeCardShadow} border ${themePrimarySoftBorder} p-6 sm:p-8`}
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 18%, var(--color-card)), color-mix(in srgb, var(--color-info) 10%, var(--color-card)))",
                }}
              >
                <div
                  className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-40"
                  style={{
                    background:
                      "color-mix(in srgb, var(--color-primary) 22%, transparent)",
                  }}
                />

                <div
                  className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 opacity-30"
                  style={{
                    background:
                      "color-mix(in srgb, var(--color-info) 20%, transparent)",
                  }}
                />

                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`hidden sm:flex items-center justify-center w-12 h-12 rounded-xl ${themePrimarySoft} border ${themePrimarySoftBorder}`}
                    >
                      <BookOpen
                        size={24}
                        className={themePrimaryText}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-bold theme-text tracking-tight">
                          Materi Pembelajaran
                        </h1>

                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${themePrimarySoft} border ${themePrimarySoftBorder} ${themePrimaryText} text-xs font-medium`}
                        >
                          <Sparkles size={12} />
                          Guru
                        </span>
                      </div>

                      <p className="theme-text-secondary text-sm mt-1">
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
                      disabled={refreshing}
                      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl theme-card ${themeNeutralBorder} theme-text-secondary ${themeNeutralHover} text-sm font-medium transition-all disabled:opacity-60`}
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
                      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl ${themePrimaryGradient} text-[var(--color-card)] text-sm font-semibold transition-all ${themePrimaryShadow}`}
                    >
                      <Plus size={16} />
                      Tambah Materi
                    </button>
                  </div>
                </div>

                {/* QUICK STATS */}

                <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Total Materi",
                      value: loading
                        ? "—"
                        : summary.total,
                      icon: Layers,
                    },
                    {
                      label: "Bulan Ini",
                      value: loading
                        ? "—"
                        : summary.bulanIni,
                      icon: CalendarDays,
                    },
                    {
                      label: "Kelas",
                      value: loading
                        ? "—"
                        : summary.kelasTercakup,
                      icon: GraduationCap,
                    },
                    {
                      label: "Sumber",
                      value: loading
                        ? "Memuat..."
                        : `${summary.totalFile} file · ${summary.totalLink} link`,
                      icon: HardDrive,
                    },
                  ].map(
                    (stat, idx) => (
                      <div
                        key={idx}
                        className={`theme-card-soft rounded-xl p-3.5 border ${themeNeutralBorder} ${themeNeutralHover} transition-all`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg ${themePrimarySoft} flex items-center justify-center`}
                          >
                            <stat.icon
                              size={16}
                              className={themePrimaryText}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-lg font-bold theme-text truncate">
                              {stat.value}
                            </p>

                            <p className="text-[10px] theme-text-muted uppercase tracking-wider truncate">
                              {stat.label}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>

              {/* SUCCESS */}

              {successMessage && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-xl ${themeSuccessSurface} border ${themeSuccessBorder}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${themeSuccessSurface} text-[var(--color-success)] flex items-center justify-center shrink-0`}
                  >
                    <CheckCircle2 size={17} />
                  </div>

                  <p className="text-sm font-medium text-[var(--color-success)]">
                    {successMessage}
                  </p>
                </div>
              )}

              {/* ERROR */}

              {error && (
                <div
                  className={`flex items-start gap-3 p-4 rounded-xl ${themeDangerSurface} border ${themeDangerBorder}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${themeDangerSurface} theme-danger flex items-center justify-center shrink-0`}
                  >
                    <AlertCircle size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold theme-danger">
                      Terjadi kesalahan
                    </p>

                    <p className="text-sm theme-danger mt-1 break-words leading-relaxed">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* FILTER */}

              <section
                className={`theme-card rounded-2xl ${themeCardShadow} border ${themeNeutralBorder} p-4 sm:p-5`}
              >
                <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                  {/* FILTER TITLE */}

                  <div className="lg:w-36 shrink-0">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg ${themePrimarySoft} ${themePrimaryText} flex items-center justify-center`}
                      >
                        <Filter size={15} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold theme-text">
                          Filter
                        </p>

                        <p className="text-xs theme-text-muted">
                          Daftar materi
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* KELAS */}

                  <div className="w-full lg:w-64">
                    <KelasSearchDropdown
                      value={kelas}
                      options={kelasOptions}
                      onChange={setKelas}
                      disabled={loading}
                    />
                  </div>

                  {/* TIPE */}

                  <div className="w-full lg:w-56">
                    <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
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
                        disabled={loading}
                        className={`theme-input w-full appearance-none px-3.5 pr-10 py-2.5 rounded-xl text-sm font-medium outline-none transition-all ${themeFocus} disabled:opacity-60`}
                      >
                        {tipeOptions.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item ===
                              "Semua Tipe"
                                ? item
                                : getTipeInfo(
                                    item
                                  ).label}
                            </option>
                          )
                        )}
                      </select>

                      <ChevronDown
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* SEARCH */}

                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
                      Pencarian
                    </label>

                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
                      />

                      <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                          setSearch(
                            e.target.value
                          )
                        }
                        disabled={loading}
                        placeholder="Cari judul, kelas, mapel, atau kategori..."
                        className={`theme-input w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all ${themeFocus} placeholder:text-[var(--color-text-placeholder)] disabled:opacity-60`}
                      />

                      {search && (
                        <button
                          type="button"
                          onClick={() =>
                            setSearch("")
                          }
                          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md theme-text-muted ${themeNeutralHover}`}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* RESET */}

                  {hasFilter && (
                    <button
                      type="button"
                      onClick={resetFilter}
                      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl theme-card ${themeNeutralBorder} theme-text-secondary ${themeNeutralHover} text-sm font-medium shrink-0 transition-all`}
                    >
                      <X size={14} />
                      Reset Filter
                    </button>
                  )}
                </div>

                {/* INFO KELAS */}

                {!loading &&
                  kelasOptions.length > 1 && (
                    <div
                      className={`mt-4 pt-4 border-t ${themeDivider} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2`}
                    >
                      <div className="flex items-center gap-2 text-xs theme-text-muted">
                        <GraduationCap
                          size={14}
                          className={themePrimaryText}
                        />

                        <span>
                          {kelasOptions.length - 1}{" "}
                          kelas tersedia pada materi yang diajar
                        </span>
                      </div>

                      {kelas !==
                        "Semua Kelas" && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${themePrimarySoft} border ${themePrimarySoftBorder} ${themePrimaryText} text-xs font-semibold`}
                        >
                          Kelas: {kelas}
                        </span>
                      )}
                    </div>
                  )}
              </section>

              {/* LIST HEADER */}

              {!loading && (
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold theme-text">
                      Daftar Materi
                    </h2>

                    <p className="text-sm theme-text-muted mt-0.5">
                      {filteredMateri.length}{" "}
                      materi ditampilkan dari{" "}
                      {materiList.length} data
                    </p>
                  </div>

                  {hasFilter && (
                    <span
                      className={`text-xs ${themePrimaryText} font-medium ${themePrimarySoft} px-3 py-1 rounded-full`}
                    >
                      Filter aktif
                    </span>
                  )}
                </div>
              )}

              {/* LOADING */}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-5">
                  {[1, 2, 3, 4, 5, 6].map(
                    (i) => (
                      <SkeletonCard key={i} />
                    )
                  )}
                </div>
              ) : filteredMateri.length === 0 ? (
                /* EMPTY */

                <section
                  className={`theme-card rounded-2xl ${themeCardShadow} border ${themeNeutralBorder} p-12 sm:p-16 text-center`}
                >
                  <div className="max-w-md mx-auto">
                    <div
                      className={`w-20 h-20 mx-auto rounded-2xl ${themePrimarySoft} border ${themePrimarySoftBorder} flex items-center justify-center`}
                    >
                      <BookOpen
                        size={36}
                        className={themePrimaryText}
                      />
                    </div>

                    <h3 className="text-xl font-bold theme-text mt-6">
                      {materiList.length === 0
                        ? "Belum Ada Materi"
                        : "Materi Tidak Ditemukan"}
                    </h3>

                    <p className="text-sm theme-text-secondary mt-2 leading-relaxed">
                      {materiList.length === 0
                        ? "Anda belum memiliki bahan ajar. Mulai bagikan materi untuk siswa."
                        : "Coba ubah filter kelas, tipe materi, atau kata pencarian."}
                    </p>

                    {materiList.length === 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            "/guru/materi/tambah"
                          )
                        }
                        className={`inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl ${themePrimaryGradient} text-[var(--color-card)] text-sm font-semibold transition-all ${themePrimaryShadow}`}
                      >
                        <Plus size={16} />
                        Tambah Materi Sekarang
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={resetFilter}
                        className={`inline-flex items-center gap-2 mt-6 px-5 py-3 theme-card border ${themeNeutralBorder} theme-text-secondary ${themeNeutralHover} rounded-xl text-sm font-semibold transition-all`}
                      >
                        <RefreshCw size={16} />
                        Reset Filter
                      </button>
                    )}
                  </div>
                </section>
              ) : (
                /* CARD GRID */

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
                          className={`group flex flex-col min-w-0 theme-card border ${themeNeutralBorder} rounded-2xl ${themeSmallShadow} hover:border-[var(--color-primary)] hover:shadow-[0_10px_30px_color-mix(in_srgb,var(--color-primary)_10%,transparent)] transition-all duration-300 overflow-hidden`}
                        >
                          <div className="p-5 flex flex-col flex-1">
                            {/* HEADER */}

                            <div className="flex items-start justify-between gap-3">
                              <div
                                className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${tipeInfo.bg} ${tipeInfo.color} ${tipeInfo.border}`}
                              >
                                <TypeIcon size={20} />
                              </div>

                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold shrink-0 ${getKelasColor(
                                  kelasName
                                )}`}
                              >
                                {kelasName}
                              </span>
                            </div>

                            {/* TITLE */}

                            <h3
                              className={`mt-4 text-base sm:text-[17px] font-semibold leading-6 theme-text break-words line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors`}
                            >
                              {materi.judul ||
                                "Tanpa Judul"}
                            </h3>

                            {/* MAPEL */}

                            <div className="flex items-center gap-2 mt-2">
                              <BookOpen
                                size={14}
                                className={`${themePrimaryText} shrink-0`}
                              />

                              <p
                                className={`text-sm font-medium ${themePrimaryText} truncate`}
                              >
                                {mapelName}
                              </p>
                            </div>

                            {/* KATEGORI */}

                            {materi.kategori && (
                              <div className="mt-3">
                                <span
                                  className={`inline-flex max-w-full px-2.5 py-1 rounded-md ${themeNeutralSurface} border ${themeNeutralBorder} text-xs font-medium theme-text-secondary truncate`}
                                >
                                  {materi.kategori}
                                </span>
                              </div>
                            )}

                            {/* DESKRIPSI */}

                            <p className="mt-3 text-sm theme-text-secondary leading-6 line-clamp-3 min-h-[72px]">
                              {materi.deskripsi ||
                                "Belum ada deskripsi materi."}
                            </p>

                            {/* META */}

                            <div
                              className={`mt-4 pt-4 border-t ${themeDivider} flex-1`}
                            >
                              <div className="grid grid-cols-2 gap-3">
                                <div className="min-w-0">
                                  <p className="text-[11px] uppercase tracking-wider font-semibold theme-text-muted">
                                    Tanggal
                                  </p>

                                  <div className="flex items-center gap-1.5 mt-1">
                                    <CalendarDays
                                      size={13}
                                      className="theme-text-muted shrink-0"
                                    />

                                    <p className="text-xs font-medium theme-text-secondary truncate">
                                      {formatTanggal(
                                        materi.dibuatPada
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div className="min-w-0">
                                  <p className="text-[11px] uppercase tracking-wider font-semibold theme-text-muted">
                                    Sumber
                                  </p>

                                  <div className="flex items-center gap-1.5 mt-1">
                                    <TypeIcon
                                      size={13}
                                      className="theme-text-muted shrink-0"
                                    />

                                    <p className="text-xs font-medium theme-text-secondary">
                                      {tipeInfo.label}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-3">
                                <p className="text-[11px] uppercase tracking-wider font-semibold theme-text-muted">
                                  Pengajar
                                </p>

                                <p className="text-xs font-medium theme-text-secondary mt-1 truncate">
                                  {guruName}
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
                                className={`inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl theme-card border ${themeNeutralBorder} theme-text-secondary ${themeNeutralHover} text-sm font-medium transition-all`}
                              >
                                <Eye size={15} />
                                Lihat
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/guru/materi/${materi.id}/edit`
                                  )
                                }
                                className={`inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl ${themePrimarySoft} border ${themePrimarySoftBorder} ${themePrimaryText} hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] text-sm font-medium transition-all`}
                              >
                                <Pencil size={15} />
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
                              className={`mt-2.5 w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl ${themeDangerSurface} border ${themeDangerBorder} theme-danger hover:bg-[color-mix(in_srgb,var(--color-text)_9%,transparent)] text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                              {deletingId ===
                              materi.id ? (
                                <>
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                  Menghapus...
                                </>
                              ) : (
                                <>
                                  <Trash2 size={15} />
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

              {/* FOOTER */}

              {!loading &&
                filteredMateri.length > 0 && (
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t ${themeDivider}`}
                  >
                    <p className="text-xs sm:text-sm theme-text-muted">
                      Menampilkan{" "}
                      <span className="font-semibold theme-text-secondary">
                        {
                          filteredMateri.length
                        }
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold theme-text-secondary">
                        {
                          materiList.length
                        }
                      </span>{" "}
                      materi
                    </p>

                    <p className="text-xs theme-text-muted flex items-center gap-1.5">
                      <Clock size={12} />
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