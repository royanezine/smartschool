"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  ArrowLeft,
  FileText,
  Video,
  Presentation,
  Image as ImageIcon,
  File,
  Download,
  Eye,
  Search,
  Calculator,
  FlaskConical,
  Globe2,
  Languages,
  BookOpen,
  Palette,
  Music,
  Dumbbell,
  Loader2,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Layers3,
  BookMarked,
  Clock3,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import {
  getMateriPembelajaran,
  getKelasMapel,
} from "../../../../services/materiPembelajaran.service";

/* =========================================================
   MATA PELAJARAN
========================================================= */

const mataPelajaranList = [
  {
    id: "matematika",
    nama: "Matematika",
    guru: "Budi Santoso",
    icon: Calculator,
    color: "blue",
  },
  {
    id: "bindo",
    nama: "Bahasa Indonesia",
    guru: "Pak Budi",
    icon: Languages,
    color: "rose",
  },
  {
    id: "ipa",
    nama: "IPA",
    guru: "Bu Dewi",
    icon: FlaskConical,
    color: "emerald",
  },
  {
    id: "ips",
    nama: "IPS",
    guru: "Pak Anwar",
    icon: Globe2,
    color: "amber",
  },
  {
    id: "binggris",
    nama: "Bahasa Inggris",
    guru: "Bu Rina",
    icon: BookOpen,
    color: "indigo",
  },
  {
    id: "seni",
    nama: "Seni Budaya",
    guru: "Bu Wulan",
    icon: Palette,
    color: "fuchsia",
  },
  {
    id: "musik",
    nama: "Seni Musik",
    guru: "Pak Doni",
    icon: Music,
    color: "cyan",
  },
  {
    id: "penjas",
    nama: "Penjaskes",
    guru: "Pak Rudi",
    icon: Dumbbell,
    color: "orange",
  },
];

/* =========================================================
   WARNA MAPEL
========================================================= */

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-100",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-100",
  },
  fuchsia: {
    bg: "bg-fuchsia-50",
    text: "text-fuchsia-600",
    border: "border-fuchsia-100",
  },
  cyan: {
    bg: "bg-cyan-50",
    text: "text-cyan-600",
    border: "border-cyan-100",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-100",
  },
};

/* =========================================================
   FILE TYPE STYLE
========================================================= */

const FILE_TYPE_STYLE = {
  pdf: {
    icon: FileText,
    bg: "bg-red-50",
    text: "text-red-600",
    label: "PDF",
  },

  video: {
    icon: Video,
    bg: "bg-purple-50",
    text: "text-purple-600",
    label: "Video",
  },

  ppt: {
    icon: Presentation,
    bg: "bg-orange-50",
    text: "text-orange-600",
    label: "Slide",
  },

  pptx: {
    icon: Presentation,
    bg: "bg-orange-50",
    text: "text-orange-600",
    label: "Slide",
  },

  gambar: {
    icon: ImageIcon,
    bg: "bg-blue-50",
    text: "text-blue-600",
    label: "Gambar",
  },

  image: {
    icon: ImageIcon,
    bg: "bg-blue-50",
    text: "text-blue-600",
    label: "Gambar",
  },

  link: {
    icon: ExternalLink,
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    label: "Link",
  },

  lainnya: {
    icon: File,
    bg: "bg-slate-50",
    text: "text-slate-500",
    label: "File",
  },

  file: {
    icon: File,
    bg: "bg-slate-50",
    text: "text-slate-500",
    label: "File",
  },
};

/* =========================================================
   HELPER
========================================================= */

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function getFileType(item) {
  const tipe = String(item?.tipe || "").toLowerCase();

  if (FILE_TYPE_STYLE[tipe]) {
    return tipe;
  }

  const url = String(item?.urlFile || "").toLowerCase();
  const judul = String(item?.judul || "").toLowerCase();

  if (url.includes(".pdf") || judul.includes(".pdf")) {
    return "pdf";
  }

  if (
    url.includes(".ppt") ||
    url.includes(".pptx") ||
    judul.includes(".ppt") ||
    judul.includes(".pptx")
  ) {
    return "ppt";
  }

  if (
    url.includes(".png") ||
    url.includes(".jpg") ||
    url.includes(".jpeg") ||
    url.includes(".webp")
  ) {
    return "gambar";
  }

  if (
    url.includes(".mp4") ||
    url.includes(".mov") ||
    url.includes(".webm")
  ) {
    return "video";
  }

  if (item?.urlLink && !item?.urlFile) {
    return "link";
  }

  return "lainnya";
}

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getBackendFileUrl(url) {
  if (!url) return null;

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const backendOrigin = apiUrl.replace(/\/api\/?$/, "");

  if (url.startsWith("/")) {
    return `${backendOrigin}${url}`;
  }

  return `${backendOrigin}/${url}`;
}

function getCurrentUser() {
  if (typeof window === "undefined") return null;

  try {
    const rawUser = localStorage.getItem("user");

    if (!rawUser) return null;

    return JSON.parse(rawUser);
  } catch (error) {
    console.error(
      "Gagal membaca user dari localStorage:",
      error
    );

    return null;
  }
}

function getMapelSlug(nama) {
  const text = normalizeText(nama);

  if (text.includes("matematika")) {
    return "matematika";
  }

  if (
    text.includes("bahasa indonesia") ||
    text === "bindo"
  ) {
    return "bindo";
  }

  if (
    text === "ipa" ||
    text.includes("ilmu pengetahuan alam") ||
    text.includes("biologi")
  ) {
    return "ipa";
  }

  if (
    text === "ips" ||
    text.includes("ilmu pengetahuan sosial")
  ) {
    return "ips";
  }

  if (
    text.includes("bahasa inggris") ||
    text === "inggris"
  ) {
    return "binggris";
  }

  if (text.includes("seni budaya")) {
    return "seni";
  }

  if (text.includes("seni musik")) {
    return "musik";
  }

  if (
    text.includes("penjaskes") ||
    text.includes("pendidikan jasmani") ||
    text.includes("pjok")
  ) {
    return "penjas";
  }

  return null;
}

/* =========================================================
   PAGE
========================================================= */

export default function MateriPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Loader2
                size={20}
                className="animate-spin text-blue-600"
              />
            </div>

            <p className="text-sm font-medium text-slate-600 mt-3">
              Memuat halaman...
            </p>
          </div>
        </div>
      }
    >
      <MateriPageInner />
    </Suspense>
  );
}

/* =========================================================
   INNER PAGE
========================================================= */

function MateriPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mapelParam = searchParams.get("mapel");
  const kelasMapelParam = searchParams.get("kelasMapelId");

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [activeMapel, setActiveMapel] = useState(
    mapelParam || "semua"
  );

  const [query, setQuery] = useState("");

  const [materiList, setMateriList] = useState([]);
  const [kelasMapelList, setKelasMapelList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  /* =======================================================
     USER
  ======================================================= */

  useEffect(() => {
    const user = getCurrentUser();

    console.log(
      "[SISWA MATERI] CURRENT USER:",
      user
    );

    setCurrentUser(user);
  }, []);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        kelasMapelResponse,
        materiResponse,
      ] = await Promise.all([
        getKelasMapel(),
        getMateriPembelajaran(),
      ]);

      const kelasMapelData = Array.isArray(
        kelasMapelResponse?.data
      )
        ? kelasMapelResponse.data
        : [];

      const materiData = Array.isArray(
        materiResponse?.data
      )
        ? materiResponse.data
        : [];

      setKelasMapelList(kelasMapelData);
      setMateriList(materiData);
    } catch (err) {
      console.error(
        "[SISWA MATERI] GAGAL LOAD:",
        err
      );

      setError(
        err?.message ||
          "Materi gagal dimuat. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     SELECTED MAPEL
  ======================================================= */

  const selectedMapel = mataPelajaranList.find(
    (m) => m.id === activeMapel
  );

  /* =======================================================
     KELAS SISWA
  ======================================================= */

  const userKelasId =
    currentUser?.kelasId ??
    currentUser?.kelas_id ??
    currentUser?.kelas?.id ??
    currentUser?.siswa?.kelasId ??
    currentUser?.data?.kelasId ??
    null;

  /* =======================================================
     KELAS MAPEL SISWA
  ======================================================= */

  const kelasMapelSiswa = useMemo(() => {
    if (!currentUser) return [];

    let data = kelasMapelList;

    if (kelasMapelParam) {
      return data.filter(
        (item) => item.id === kelasMapelParam
      );
    }

    if (userKelasId) {
      data = data.filter((item) => {
        const kelasId =
          item?.kelasId ??
          item?.kelas?.id ??
          null;

        return kelasId === userKelasId;
      });
    }

    return data;
  }, [
    currentUser,
    kelasMapelList,
    kelasMapelParam,
    userKelasId,
  ]);

  /* =======================================================
     KELAS MAPEL AKTIF
  ======================================================= */

  const kelasMapelAktif = useMemo(() => {
    if (activeMapel === "semua") {
      return kelasMapelSiswa;
    }

    return kelasMapelSiswa.filter((item) => {
      const namaMapel =
        item?.mataPelajaran?.nama ??
        item?.mataPelajaran?.namaMapel ??
        item?.mataPelajaran?.nama_mata_pelajaran ??
        "";

      return (
        getMapelSlug(namaMapel) === activeMapel
      );
    });
  }, [
    activeMapel,
    kelasMapelSiswa,
  ]);

  /* =======================================================
     FILTER MATERI
  ======================================================= */

  const filteredMateri = useMemo(() => {
    let data = materiList;

    if (kelasMapelSiswa.length > 0) {
      const allowedIds = new Set(
        kelasMapelSiswa.map(
          (item) => item.id
        )
      );

      data = data.filter((materi) =>
        allowedIds.has(
          materi.kelasMapelId
        )
      );
    }

    if (activeMapel !== "semua") {
      data = data.filter((materi) => {
        const kelasMapel =
          kelasMapelSiswa.find(
            (item) =>
              item.id ===
              materi.kelasMapelId
          );

        const namaMapel =
          kelasMapel
            ?.mataPelajaran
            ?.nama ??
          kelasMapel
            ?.mataPelajaran
            ?.namaMapel ??
          kelasMapel
            ?.mataPelajaran
            ?.nama_mata_pelajaran ??
          "";

        return (
          getMapelSlug(namaMapel) ===
          activeMapel
        );
      });
    }

    if (query.trim()) {
      const keyword =
        normalizeText(query);

      data = data.filter((materi) => {
        return (
          normalizeText(
            materi?.judul
          ).includes(keyword) ||
          normalizeText(
            materi?.deskripsi
          ).includes(keyword) ||
          normalizeText(
            materi?.kategori
          ).includes(keyword)
        );
      });
    }

    return [...data].sort((a, b) => {
      const dateA = new Date(
        a?.dibuatPada ??
          a?.createdAt ??
          a?.tanggalDibuat ??
          0
      ).getTime();

      const dateB = new Date(
        b?.dibuatPada ??
          b?.createdAt ??
          b?.tanggalDibuat ??
          0
      ).getTime();

      return dateB - dateA;
    });
  }, [
    materiList,
    kelasMapelSiswa,
    activeMapel,
    query,
  ]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalMateri = filteredMateri.length;

  const totalMapel = useMemo(() => {
    const ids = new Set();

    filteredMateri.forEach((materi) => {
      const kelasMapel =
        kelasMapelSiswa.find(
          (item) =>
            item.id ===
            materi.kelasMapelId
        );

      if (kelasMapel) {
        ids.add(
          kelasMapel.id
        );
      }
    });

    return ids.size;
  }, [
    filteredMateri,
    kelasMapelSiswa,
  ]);

  const totalFile = useMemo(() => {
    return filteredMateri.filter(
      (item) => item?.urlFile
    ).length;
  }, [filteredMateri]);

  const totalLink = useMemo(() => {
    return filteredMateri.filter(
      (item) =>
        item?.urlLink &&
        !item?.urlFile
    ).length;
  }, [filteredMateri]);

  /* =======================================================
     GET KELAS MAPEL
  ======================================================= */

  function getKelasMapelFromMateri(materi) {
    return kelasMapelSiswa.find(
      (item) =>
        item.id ===
        materi.kelasMapelId
    );
  }

  /* =======================================================
     OPEN FILE
  ======================================================= */

  function handleOpenFile(item) {
    const url = item?.urlFile
      ? getBackendFileUrl(
          item.urlFile
        )
      : item?.urlLink || null;

    if (!url) {
      alert(
        "File atau link materi belum tersedia."
      );

      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /* =======================================================
     DOWNLOAD
  ======================================================= */

  function handleDownload(item) {
    const url = item?.urlFile
      ? getBackendFileUrl(
          item.urlFile
        )
      : item?.urlLink || null;

    if (!url) {
      alert(
        "File materi belum tersedia."
      );

      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /* =======================================================
     NOTIFICATION
  ======================================================= */

  const notifications = [
    {
      id: 1,
      title: "Materi pembelajaran",
      desc:
        "Materi terbaru dari guru akan muncul di sini.",
      read: true,
    },
  ];

  /* =======================================================
     USER HEADER
  ======================================================= */

  const userName =
    currentUser?.namaLengkap ||
    currentUser?.nama ||
    currentUser?.name ||
    "Siswa";

  const userAvatar = userName
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Sidebar
        role="siswa"
        active="mataPelajaran"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(
            !sidebarOpen
          )
        }
      />

      {/* ===================================================
          MAIN
      =================================================== */}

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
          notifications={notifications}
          user={{
            name: userName,
            email:
              currentUser?.email ||
              "siswa@smartschool.com",
            avatar: userAvatar,
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[1280px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

            {/* =================================================
                TOP NAV
            ================================================= */}

            <button
              onClick={() =>
                router.push(
                  "/siswa/mataPelajaran"
                )
              }
              className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-5"
            >
              <span className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                <ArrowLeft size={15} />
              </span>

              Kembali ke mata pelajaran
            </button>

            {/* =================================================
                HERO
            ================================================= */}

            <section className="relative overflow-hidden rounded-2xl bg-[#155DFC] p-5 sm:p-6 lg:p-7 shadow-sm mb-6">
              {/* Decorative */}
              <div className="absolute -right-16 -top-20 w-56 h-56 rounded-full bg-white/10" />

              <div className="absolute right-20 -bottom-24 w-44 h-44 rounded-full bg-white/[0.07]" />

              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/[0.06] to-transparent pointer-events-none" />

              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-medium text-white/90 mb-4">
                    <BookMarked size={13} />
                    Ruang belajar siswa
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Materi Pembelajaran
                  </h1>

                  <p className="text-sm sm:text-[15px] leading-6 text-blue-100 mt-2 max-w-xl">
                    Akses materi yang dibagikan
                    guru untuk membantu kamu
                    belajar dengan lebih terarah.
                  </p>

                  {selectedMapel && (
                    <div className="flex items-center gap-2 mt-5">
                      <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                        <selectedMapel.icon
                          size={16}
                          className="text-white"
                        />
                      </div>

                      <div>
                        <p className="text-[11px] text-blue-100">
                          Mata pelajaran aktif
                        </p>

                        <p className="text-sm font-semibold text-white">
                          {selectedMapel.nama}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hero summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2.5 min-w-0 lg:min-w-[280px]">
                  <div className="rounded-xl bg-white/10 border border-white/10 px-4 py-3.5">
                    <p className="text-[11px] text-blue-100">
                      Total materi
                    </p>

                    <p className="text-2xl font-bold text-white mt-1">
                      {loading
                        ? "—"
                        : totalMateri}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/10 border border-white/10 px-4 py-3.5">
                    <p className="text-[11px] text-blue-100">
                      File tersedia
                    </p>

                    <p className="text-2xl font-bold text-white mt-1">
                      {loading
                        ? "—"
                        : totalFile}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/10 border border-white/10 px-4 py-3.5 col-span-2 sm:col-span-1 lg:col-span-2">
                    <p className="text-[11px] text-blue-100">
                      Sumber belajar
                    </p>

                    <div className="flex items-center gap-3 mt-1">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {loading
                            ? "Memuat..."
                            : `${totalMapel} mata pelajaran`}
                        </p>
                      </div>

                      <div className="ml-auto">
                        <Sparkles
                          size={17}
                          className="text-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">
                      Materi
                    </p>

                    <p className="text-xl font-bold text-slate-800 mt-1">
                      {loading
                        ? "—"
                        : totalMateri}
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Layers3 size={17} />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">
                      File
                    </p>

                    <p className="text-xl font-bold text-slate-800 mt-1">
                      {loading
                        ? "—"
                        : totalFile}
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FileText size={17} />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">
                      Link
                    </p>

                    <p className="text-xl font-bold text-slate-800 mt-1">
                      {loading
                        ? "—"
                        : totalLink}
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ExternalLink size={17} />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">
                      Mata pelajaran
                    </p>

                    <p className="text-xl font-bold text-slate-800 mt-1">
                      {loading
                        ? "—"
                        : totalMapel}
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <BookOpen size={17} />
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                FILTER AREA
            ================================================= */}

            <section className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm mb-5">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">

                {/* Search */}
                <div className="relative flex-1 min-w-0">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />

                  <input
                    value={query}
                    onChange={(e) =>
                      setQuery(
                        e.target.value
                      )
                    }
                    placeholder="Cari judul, deskripsi, atau kategori materi..."
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {/* Refresh */}
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                >
                  <RefreshCw
                    size={15}
                    className={
                      loading
                        ? "animate-spin"
                        : ""
                    }
                  />

                  <span className="hidden sm:inline">
                    Refresh
                  </span>
                </button>
              </div>

              {/* Mapel filters */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs font-semibold text-slate-600">
                    Mata pelajaran
                  </span>

                  {activeMapel !==
                    "semua" && (
                    <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      1 dipilih
                    </span>
                  )}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  <button
                    onClick={() =>
                      setActiveMapel(
                        "semua"
                      )
                    }
                    className={`flex-shrink-0 h-9 px-4 rounded-lg text-xs font-semibold border transition-all ${
                      activeMapel ===
                      "semua"
                        ? "bg-[#155DFC] border-[#155DFC] text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-600"
                    }`}
                  >
                    Semua
                  </button>

                  {mataPelajaranList.map(
                    (m) => {
                      const colors =
                        colorMap[
                          m.color
                        ];

                      const Icon =
                        m.icon;

                      const active =
                        activeMapel ===
                        m.id;

                      return (
                        <button
                          key={m.id}
                          onClick={() =>
                            setActiveMapel(
                              m.id
                            )
                          }
                          className={`flex-shrink-0 h-9 px-3 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                            active
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center ${
                              active
                                ? colors.bg
                                : "bg-slate-50"
                            }`}
                          >
                            <Icon
                              size={12}
                              className={
                                active
                                  ? colors.text
                                  : "text-slate-400"
                              }
                            />
                          </span>

                          {m.nama}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </section>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mb-5 bg-red-50 border border-red-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-red-500 flex-shrink-0">
                    <AlertCircle size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-700">
                      Gagal memuat materi
                    </p>

                    <p className="text-xs text-red-600 mt-1 leading-5">
                      {error}
                    </p>
                  </div>

                  <button
                    onClick={
                      loadData
                    }
                    className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    <RefreshCw
                      size={14}
                    />

                    Coba lagi
                  </button>
                </div>
              </div>
            )}

            {/* =================================================
                CLASS INFO
            ================================================= */}

            {!loading &&
              activeMapel !==
                "semua" &&
              kelasMapelAktif.length >
                0 && (
                <div className="mb-5 bg-blue-50/70 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-blue-600 flex-shrink-0">
                      <BookOpen
                        size={17}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-blue-700">
                        Materi untuk kelas kamu
                      </p>

                      <p className="text-xs text-blue-600 mt-1 truncate">
                        {kelasMapelAktif
                          .map(
                            (
                              item
                            ) =>
                              item
                                ?.kelas
                                ?.nama ||
                              item
                                ?.kelas
                                ?.namaKelas ||
                              "-"
                          )
                          .filter(
                            Boolean
                          )
                          .join(
                            ", "
                          )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* =================================================
                RESULT HEADER
            ================================================= */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 px-1">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Materi tersedia
                </h2>

                {!loading && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {totalMateri} materi
                    {activeMapel !==
                      "semua" &&
                      selectedMapel
                      ? ` · ${selectedMapel.nama}`
                      : ""}
                    {query
                      ? " · hasil pencarian"
                      : ""}
                  </p>
                )}
              </div>

              {!loading &&
                filteredMateri.length >
                  0 && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock3
                      size={13}
                    />

                    Terbaru
                  </div>
                )}
            </div>

            {/* =================================================
                MATERIAL LIST
            ================================================= */}

            <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">

              {/* LOADING */}
              {loading ? (
                <div className="divide-y divide-slate-100">
                  {Array.from({
                    length: 5,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="p-4 sm:p-5 animate-pulse"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 flex-shrink-0" />

                        <div className="flex-1 min-w-0">
                          <div className="h-3 w-20 bg-slate-100 rounded mb-2" />

                          <div className="h-4 w-2/3 bg-slate-100 rounded mb-2" />

                          <div className="h-3 w-1/2 bg-slate-100 rounded" />
                        </div>

                        <div className="hidden sm:block w-20 h-8 rounded-lg bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredMateri.length >
                0 ? (
                <div className="divide-y divide-slate-100">
                  {filteredMateri.map(
                    (item) => {
                      const kelasMapel =
                        getKelasMapelFromMateri(
                          item
                        );

                      const tipe =
                        getFileType(
                          item
                        );

                      const ft =
                        FILE_TYPE_STYLE[
                          tipe
                        ] ||
                        FILE_TYPE_STYLE.lainnya;

                      const FtIcon =
                        ft.icon;

                      const mapelNama =
                        kelasMapel
                          ?.mataPelajaran
                          ?.nama ||
                        kelasMapel
                          ?.mataPelajaran
                          ?.namaMapel ||
                        "-";

                      const kelasNama =
                        kelasMapel
                          ?.kelas?.nama ||
                        kelasMapel
                          ?.kelas
                          ?.namaKelas ||
                        "-";

                      const guruNama =
                        kelasMapel
                          ?.guruPengajar
                          ?.namaLengkap ||
                        item?.guru
                          ?.namaLengkap ||
                        item?.guruNama ||
                        "-";

                      const tanggal =
                        item?.dibuatPada ??
                        item?.createdAt ??
                        item?.tanggalDibuat;

                      const fileUrl =
                        item?.urlFile
                          ? getBackendFileUrl(
                              item.urlFile
                            )
                          : item?.urlLink ||
                            null;

                      const mapelData =
                        mataPelajaranList.find(
                          (m) =>
                            m.id ===
                            getMapelSlug(
                              mapelNama
                            )
                        );

                      const mapelColors =
                        colorMap[
                          mapelData?.color ||
                            "blue"
                        ];

                      return (
                        <article
                          key={
                            item.id
                          }
                          className="group p-4 sm:p-5 hover:bg-slate-50/70 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                            {/* File icon */}
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${ft.bg} ${ft.text}`}
                            >
                              <FtIcon
                                size={20}
                              />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${ft.bg} ${ft.text}`}
                                >
                                  {
                                    ft.label
                                  }
                                </span>

                                {activeMapel ===
                                  "semua" &&
                                  mapelNama !==
                                    "-" && (
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${mapelColors.bg} ${mapelColors.text}`}
                                    >
                                      {mapelNama}
                                    </span>
                                  )}

                                {kelasNama !==
                                  "-" && (
                                  <span className="text-[10px] text-slate-400">
                                    {kelasNama}
                                  </span>
                                )}
                              </div>

                              <h3 className="text-sm sm:text-[15px] font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                                {item?.judul ||
                                  "Materi tanpa judul"}
                              </h3>

                              {item?.deskripsi && (
                                <p className="text-xs text-slate-400 mt-1 line-clamp-1 max-w-3xl">
                                  {
                                    item.deskripsi
                                  }
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[11px] text-slate-400">
                                <span className="font-medium text-slate-500">
                                  {
                                    guruNama
                                  }
                                </span>

                                <span className="text-slate-300">
                                  •
                                </span>

                                <span>
                                  {formatTanggal(
                                    tanggal
                                  )}
                                </span>

                                {item?.ukuran && (
                                  <>
                                    <span className="text-slate-300">
                                      •
                                    </span>

                                    <span>
                                      {
                                        item.ukuran
                                      }
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 sm:flex-shrink-0">
                              {fileUrl ? (
                                <>
                                  <button
                                    onClick={() =>
                                      handleOpenFile(
                                        item
                                      )
                                    }
                                    className="flex-1 sm:flex-none h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all inline-flex items-center justify-center gap-1.5 text-xs font-semibold"
                                  >
                                    <Eye
                                      size={
                                        14
                                      }
                                    />

                                    <span>
                                      Lihat
                                    </span>
                                  </button>

                                  {item?.urlFile && (
                                    <button
                                      onClick={() =>
                                        handleDownload(
                                          item
                                        )
                                      }
                                      className="h-9 px-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all inline-flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm"
                                    >
                                      <Download
                                        size={
                                          14
                                        }
                                      />

                                      <span className="hidden sm:inline">
                                        Unduh
                                      </span>
                                    </button>
                                  )}
                                </>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 text-[11px] font-medium text-slate-400">
                                  <File
                                    size={
                                      13
                                    }
                                  />

                                  File belum
                                  tersedia
                                </span>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              ) : (
                /* EMPTY */
                <div className="py-16 px-5 text-center">
                  <div className="relative mx-auto w-fit mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                      <BookMarked
                        size={27}
                      />
                    </div>

                    <div className="absolute -right-1 -top-1 w-5 h-5 rounded-full bg-white border border-blue-100 flex items-center justify-center">
                      <FileText
                        size={10}
                        className="text-blue-500"
                      />
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-700">
                    Belum ada materi
                  </h3>

                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5 leading-5">
                    {query
                      ? "Tidak ada materi yang sesuai dengan kata kunci pencarian."
                      : activeMapel !==
                        "semua"
                      ? "Guru belum mengupload materi untuk mata pelajaran ini."
                      : "Belum ada materi pembelajaran yang tersedia untuk kelas kamu."}
                  </p>

                  {(query ||
                    activeMapel !==
                      "semua") && (
                    <button
                      onClick={() => {
                        setQuery("");
                        setActiveMapel(
                          "semua"
                        );
                      }}
                      className="mt-5 inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-semibold"
                    >
                      Tampilkan semua materi
                      <ChevronRight
                        size={14}
                      />
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* =================================================
                FOOTER INFO
            ================================================= */}

            {!loading &&
              filteredMateri.length >
                0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1 pt-1 pb-5">
                  <p className="text-[11px] text-slate-400">
                    Menampilkan{" "}
                    <span className="font-semibold text-slate-500">
                      {filteredMateri.length}
                    </span>{" "}
                    materi pembelajaran
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Materi terbaru ditampilkan
                    terlebih dahulu
                  </p>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}