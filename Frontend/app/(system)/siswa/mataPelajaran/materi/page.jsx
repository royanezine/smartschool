
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { getToken, getStoredUser, getSessionUser } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";

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
} from "@/services/materiPembelajaran.service";
import { getKelasMapelSiswa } from "@/services/kelasMapel.service";


const themePrimarySurface =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySurfaceStrong =
  "bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryBorderStrong =
  "border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimaryShadow =
  "shadow-[0_10px_28px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

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
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeInfoText = "text-[var(--color-info)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessText = "text-[var(--color-success)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningText = "text-[var(--color-warning)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_16%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";


const FILE_TYPE_STYLE = {
  pdf: {
    icon: FileText,
    bg: themeDangerSurface,
    text: "text-[var(--color-text)]",
    border: themeDangerBorder,
    label: "PDF",
  },
  video: {
    icon: Video,
    bg: themePrimarySurface,
    text: themePrimaryText,
    border: themePrimaryBorder,
    label: "Video",
  },
  ppt: {
    icon: Presentation,
    bg: themeWarningSurface,
    text: themeWarningText,
    border: themeDangerBorder,
    label: "Slide",
  },
  pptx: {
    icon: Presentation,
    bg: themeWarningSurface,
    text: themeWarningText,
    border: themeDangerBorder,
    label: "Slide",
  },
  gambar: {
    icon: ImageIcon,
    bg: themeInfoSurface,
    text: themeInfoText,
    border: themeInfoBorder,
    label: "Gambar",
  },
  image: {
    icon: ImageIcon,
    bg: themeInfoSurface,
    text: themeInfoText,
    border: themeInfoBorder,
    label: "Gambar",
  },
  link: {
    icon: ExternalLink,
    bg: themePrimarySurface,
    text: themePrimaryText,
    border: themePrimaryBorder,
    label: "Link",
  },
  lainnya: {
    icon: File,
    bg: themeNeutralSurface,
    text: "text-[var(--color-text-muted)]",
    border: themeNeutralBorder,
    label: "File",
  },
  file: {
    icon: File,
    bg: themeNeutralSurface,
    text: "text-[var(--color-text-muted)]",
    border: themeNeutralBorder,
    label: "File",
  },
};


function normalizeText(value) {
  return String(value ?? "").toLowerCase().trim();
}

function getMapelId(item) {
  const mapel = item?.mataPelajaran;

  return (
    mapel?.id ??
    item?.mataPelajaranId ??
    item?.mata_pelajaran_id ??
    null
  );
}

function getMapelNama(item) {
  const mapel = item?.mataPelajaran ?? item;

  return (
    mapel?.nama ??
    mapel?.namaMapel ??
    mapel?.nama_mata_pelajaran ??
    mapel?.namaMataPelajaran ??
    ""
  );
}

function getKelasId(item) {
  return (
    item?.kelasId ??
    item?.kelas_id ??
    item?.kelas?.id ??
    null
  );
}

function getMapelIcon(nama) {
  const text = normalizeText(nama);

  if (text.includes("matematika")) return Calculator;

  if (text.includes("bahasa indonesia")) {
    return Languages;
  }

  if (
    text === "ipa" ||
    text.includes("ilmu pengetahuan alam") ||
    text.includes("biologi") ||
    text.includes("fisika") ||
    text.includes("kimia")
  ) {
    return FlaskConical;
  }

  if (
    text === "ips" ||
    text.includes("ilmu pengetahuan sosial") ||
    text.includes("sejarah") ||
    text.includes("geografi")
  ) {
    return Globe2;
  }

  if (text.includes("bahasa inggris")) return BookOpen;
  if (text.includes("seni budaya")) return Palette;
  if (text.includes("seni musik")) return Music;

  if (
    text.includes("penjaskes") ||
    text.includes("pendidikan jasmani") ||
    text.includes("pjok")
  ) {
    return Dumbbell;
  }

  return BookOpen;
}

function getFileType(item) {
  const tipe = normalizeText(item?.tipe);

  if (FILE_TYPE_STYLE[tipe]) {
    return tipe;
  }

  const url = normalizeText(item?.urlFile);
  const judul = normalizeText(item?.judul);

  if (/\.(pdf)(?:$|[?#])/.test(url) || judul.endsWith(".pdf")) {
    return "pdf";
  }

  if (
    /\.(ppt|pptx)(?:$|[?#])/.test(url) ||
    judul.endsWith(".ppt") ||
    judul.endsWith(".pptx")
  ) {
    return "ppt";
  }

  if (/\.(png|jpg|jpeg|webp|gif)(?:$|[?#])/.test(url)) {
    return "gambar";
  }

  if (/\.(mp4|mov|webm)(?:$|[?#])/.test(url)) {
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

  if (/^(https?:\/\/|blob:)/i.test(url)) {
    return url;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api";

  const backendOrigin = apiUrl.replace(/\/api\/?$/, "");

  if (url.startsWith("/")) {
    return `${backendOrigin}${url}`;
  }

  return `${backendOrigin}/${url}`;
}


function getCurrentUser() {
  try {
    const sessionUser = getSessionUser();
    if (sessionUser) return sessionUser;

    const rawUser = getStoredUser();

    if (!rawUser) return null;

    if (typeof rawUser === "object") {
      return rawUser;
    }

    if (
      typeof rawUser === "string" &&
      !rawUser.startsWith("[object") &&
      rawUser !== "undefined"
    ) {
      return JSON.parse(rawUser);
    }

    return null;
  } catch (error) {
    console.error("[SISWA MATERI] Gagal membaca user:", error);
    return null;
  }
}



function PageLoading() {
  return (
    <div className="theme-page theme-text min-h-full flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-xl ${themePrimarySurface} flex items-center justify-center ${themePrimaryText}`}
        >
          <Loader2 size={20} className="animate-spin" />
        </div>

        <p className="text-sm font-medium theme-text-secondary mt-3">
          Memuat halaman...
        </p>
      </div>
    </div>
  );
}


function MateriPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mapelParam = searchParams.get("mapel");
  const kelasMapelParam = searchParams.get("kelasMapelId");

  const [activeMapel, setActiveMapel] = useState(
    kelasMapelParam || mapelParam || "semua"
  );

  const [query, setQuery] = useState("");
  const [materiList, setMateriList] = useState([]);
  const [kelasMapelList, setKelasMapelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);


  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentUser(getCurrentUser());
    }, 0);
    return () => clearTimeout(timer);
  }, []);


  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [kelasMapelResponse, materiResponse] =
        await Promise.all([
          getKelasMapelSiswa(),
          getMateriPembelajaran(),
        ]);

      const unwrapArray = (response) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.data?.data)) {
          return response.data.data;
        }
        if (Array.isArray(response?.kelasMapel)) {
          return response.kelasMapel;
        }
        if (Array.isArray(response?.materi)) {
          return response.materi;
        }
        return [];
      };

      setKelasMapelList(unwrapArray(kelasMapelResponse));
      setMateriList(unwrapArray(materiResponse));
    } catch (err) {
      console.error("[SISWA MATERI] Gagal load:", err);

      setError(
        err?.message ||
          "Materi gagal dimuat. Silakan coba lagi."
      );

      setKelasMapelList([]);
      setMateriList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);


  const userKelasId =
    currentUser?.kelasId ??
    currentUser?.kelas_id ??
    currentUser?.kelas?.id ??
    currentUser?.siswa?.kelasId ??
    currentUser?.siswa?.kelas?.id ??
    currentUser?.data?.kelasId ??
    null;


  const kelasMapelSiswa = useMemo(() => {
    let data = Array.isArray(kelasMapelList) ? kelasMapelList : [];

    if (kelasMapelParam) {
      return data.filter(
        (item) => String(item?.id) === String(kelasMapelParam)
      );
    }

    if (userKelasId != null) {
      const filteredByKelas = data.filter(
        (item) =>
          String(getKelasId(item)) === String(userKelasId)
      );
      if (filteredByKelas.length > 0) {
        return filteredByKelas;
      }
    }

    return data;
  }, [
    kelasMapelList,
    kelasMapelParam,
    userKelasId,
  ]);


  const mataPelajaranList = useMemo(() => {
    const mapelUnik = new Map();

    kelasMapelSiswa.forEach((item) => {
      const mapelId = getMapelId(item);
      const nama = getMapelNama(item);

      if (mapelId == null || !nama) return;

      const key = String(mapelId);

      if (!mapelUnik.has(key)) {
        mapelUnik.set(key, {
          id: key,
          nama,
          icon: getMapelIcon(nama),
        });
      }
    });

    return Array.from(mapelUnik.values()).sort((a, b) =>
      a.nama.localeCompare(b.nama, "id")
    );
  }, [kelasMapelSiswa]);


  useEffect(() => {
    if (activeMapel === "semua") return;

    const exists = mataPelajaranList.some(
      (item) => item.id === String(activeMapel)
    );

    const kelasMapelExists = kelasMapelSiswa.some(
      (item) => String(item.id) === String(activeMapel)
    );

    if (!exists && !kelasMapelExists) {
      const timer = setTimeout(() => {
        setActiveMapel("semua");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeMapel, mataPelajaranList, kelasMapelSiswa]);


  const selectedMapel = mataPelajaranList.find(
    (item) => item.id === String(activeMapel)
  );

  const SelectedMapelIcon = selectedMapel?.icon;


  const kelasMapelAktif = useMemo(() => {
    if (activeMapel === "semua") {
      return kelasMapelSiswa;
    }

    return kelasMapelSiswa.filter((item) => {
      return (
        String(getMapelId(item)) === String(activeMapel) ||
        String(item?.id) === String(activeMapel)
      );
    });
  }, [activeMapel, kelasMapelSiswa]);


  const filteredMateri = useMemo(() => {
    let data = materiList;

    const allowedIds = new Set(
      kelasMapelSiswa.map((item) => String(item.id))
    );

    data = data.filter((materi) => {
      const kelasMapelId =
        materi?.kelasMapelId ??
        materi?.kelas_mapel_id ??
        materi?.kelasMapel?.id ??
        null;

      return (
        kelasMapelId != null &&
        allowedIds.has(String(kelasMapelId))
      );
    });

    if (activeMapel !== "semua") {
      const selectedClassMapelIds = new Set(
        kelasMapelAktif.map((item) => String(item.id))
      );

      data = data.filter((materi) => {
        const kelasMapelId =
          materi?.kelasMapelId ??
          materi?.kelas_mapel_id ??
          materi?.kelasMapel?.id ??
          null;

        return (
          kelasMapelId != null &&
          selectedClassMapelIds.has(String(kelasMapelId))
        );
      });
    }

    if (query.trim()) {
      const keyword = normalizeText(query);

      data = data.filter((materi) => {
        return (
          normalizeText(materi?.judul).includes(keyword) ||
          normalizeText(materi?.deskripsi).includes(keyword) ||
          normalizeText(materi?.kategori).includes(keyword)
        );
      });
    }

    return [...data].sort((a, b) => {
      const dateA = new Date(
        a?.dibuatPada ?? a?.createdAt ?? a?.tanggalDibuat ?? 0
      ).getTime();

      const dateB = new Date(
        b?.dibuatPada ?? b?.createdAt ?? b?.tanggalDibuat ?? 0
      ).getTime();

      return dateB - dateA;
    });
  }, [
    materiList,
    kelasMapelSiswa,
    kelasMapelAktif,
    activeMapel,
    query,
  ]);


  const totalMateri = filteredMateri.length;

  const totalMapel = useMemo(() => {
    const ids = new Set();

    filteredMateri.forEach((materi) => {
      const kelasMapelId =
        materi?.kelasMapelId ??
        materi?.kelas_mapel_id ??
        materi?.kelasMapel?.id;

      const kelasMapel = kelasMapelSiswa.find(
        (item) => String(item.id) === String(kelasMapelId)
      );

      const mapelId = getMapelId(kelasMapel);

      if (mapelId != null) ids.add(String(mapelId));
    });

    return ids.size;
  }, [filteredMateri, kelasMapelSiswa]);

  const totalFile = useMemo(
    () => filteredMateri.filter((item) => item?.urlFile).length,
    [filteredMateri]
  );

  const totalLink = useMemo(
    () =>
      filteredMateri.filter(
        (item) => item?.urlLink && !item?.urlFile
      ).length,
    [filteredMateri]
  );


  function getKelasMapelFromMateri(materi) {
    const kelasMapelId =
      materi?.kelasMapelId ??
      materi?.kelas_mapel_id ??
      materi?.kelasMapel?.id;

    return kelasMapelSiswa.find(
      (item) => String(item.id) === String(kelasMapelId)
    );
  }


  function handleOpenFile(item) {
    const url = item?.urlFile
      ? getBackendFileUrl(item.urlFile)
      : item?.urlLink || null;

    if (!url) {
      alert("File atau link materi belum tersedia.");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }


async function handleDownload(item) {
  const url = item?.urlFile
    ? getBackendFileUrl(item.urlFile)
    : null;

  if (!url) {
    alert("File materi belum tersedia.");
    return;
  }

  try {
    const token =
      typeof window !== "undefined"
        ? getToken()
        : null;

    const response = await fetch(url, {
      method: "GET",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });

    if (!response.ok) {
      throw new Error(
        `Gagal mengunduh file. Status: ${response.status}`
      );
    }

    const blob = await response.blob();

    if (blob.size === 0) {
      throw new Error("File yang diterima kosong.");
    }

    const namaAsli =
      item?.namaFileAsli ||
      item?.namaFile ||
      item?.fileName ||
      item?.originalName ||
      item?.originalFilename ||
      item?.nama_file ||
      item?.nama_file_asli ||
      item?.judulFile ||
      "";

    const disposition =
      response.headers.get("Content-Disposition") || "";

    const utf8Match = disposition.match(
      /filename\*=UTF-8''([^;]+)/i
    );

    const normalMatch = disposition.match(
      /filename="?([^";]+)"?/i
    );

    let namaHeader = "";

    if (utf8Match?.[1]) {
      try {
        namaHeader = decodeURIComponent(
          utf8Match[1].trim()
        );
      } catch {
        namaHeader = utf8Match[1].trim();
      }
    } else if (normalMatch?.[1]) {
      namaHeader = normalMatch[1].trim();
    }

    let namaUrl = "";

    try {
      const pathname = new URL(url).pathname;
      namaUrl = decodeURIComponent(
        pathname.split("/").filter(Boolean).pop() || ""
      );
    } catch {
      namaUrl = "";
    }

    let filename = String(
      namaAsli || namaHeader || namaUrl || "materi"
    ).trim();

    filename = filename
      .replace(/^["']|["']$/g, "")
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .trim();

    if (!filename) {
      filename = "materi";
    }

    if (!/\.[a-z0-9]{1,10}$/i.test(filename)) {
      const extensionMatch = namaUrl.match(
        /\.([a-z0-9]{1,10})$/i
      );

      if (extensionMatch) {
        filename += `.${extensionMatch[1]}`;
      } else {
        const contentType = blob.type.toLowerCase();

        if (contentType.includes("pdf")) {
          filename += ".pdf";
        } else if (
          contentType.includes(
            "officedocument.presentationml"
          )
        ) {
          filename += ".pptx";
        } else if (
          contentType.includes("presentation")
        ) {
          filename += ".ppt";
        } else if (
          contentType.includes(
            "officedocument.wordprocessingml"
          )
        ) {
          filename += ".docx";
        } else if (contentType.includes("msword")) {
          filename += ".doc";
        } else if (contentType.includes("image/png")) {
          filename += ".png";
        } else if (
          contentType.includes("image/jpeg")
        ) {
          filename += ".jpg";
        }
      }
    }

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = blobUrl;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 2000);
  } catch (error) {
    console.error(
      "[SISWA MATERI] Gagal mengunduh file:",
      error
    );

    alert(
      "File gagal diunduh. Periksa URL file, koneksi, dan izin akses server."
    );
  }
}




  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1280px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">


        


        <section
          className={`relative overflow-hidden rounded-2xl ${themePrimaryGradient} p-5 sm:p-6 lg:p-7 ${themePrimaryShadow} mb-6`}
        >
          <div className="absolute -right-16 -top-20 w-56 h-56 rounded-full bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)]" />

          <div className="absolute right-20 -bottom-24 w-44 h-44 rounded-full bg-[color-mix(in_srgb,var(--color-card)_7%,transparent)]" />

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[linear-gradient(to_left,color-mix(in_srgb,var(--color-card)_6%,transparent),transparent)] pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-card)_15%,transparent)] px-3 py-1.5 text-xs font-medium text-[var(--color-card)] mb-4">
                <BookMarked size={13} />
                Ruang belajar siswa
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-card)]">
                Materi Pembelajaran
              </h1>

              <p className="text-sm sm:text-[15px] leading-6 text-[color-mix(in_srgb,var(--color-card)_78%,transparent)] mt-2 max-w-xl">
                Akses materi yang dibagikan guru untuk membantu kamu
                belajar dengan lebih terarah.
              </p>

              {selectedMapel && SelectedMapelIcon && (
                <div className="flex items-center gap-2 mt-5">
                  <div className="w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--color-card)_14%,transparent)] flex items-center justify-center">
                    <SelectedMapelIcon
                      size={16}
                      className="text-[var(--color-card)]"
                    />
                  </div>

                  <div>
                    <p className="text-[11px] text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]">
                      Mata pelajaran aktif
                    </p>
                    <p className="text-sm font-semibold text-[var(--color-card)]">
                      {selectedMapel.nama}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2.5 min-w-0 lg:min-w-[280px]">
              <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-4 py-3.5">
                <p className="text-[11px] text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]">
                  Total materi
                </p>
                <p className="text-2xl font-bold text-[var(--color-card)] mt-1">
                  {loading ? "—" : totalMateri}
                </p>
              </div>

              <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-4 py-3.5">
                <p className="text-[11px] text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]">
                  File tersedia
                </p>
                <p className="text-2xl font-bold text-[var(--color-card)] mt-1">
                  {loading ? "—" : totalFile}
                </p>
              </div>

              <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-4 py-3.5 col-span-2 sm:col-span-1 lg:col-span-2">
                <p className="text-[11px] text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]">
                  Sumber belajar
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-card)]">
                      {loading
                        ? "Memuat..."
                        : `${totalMapel} mata pelajaran`}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Sparkles
                      size={17}
                      className="text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl px-4 py-4`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs theme-text-muted">Materi</p>
                <p className="text-xl font-bold theme-text mt-1">
                  {loading ? "—" : totalMateri}
                </p>
              </div>
              <div className={`w-9 h-9 rounded-lg ${themePrimarySurface} ${themePrimaryText} flex items-center justify-center`}>
                <Layers3 size={17} />
              </div>
            </div>
          </div>

          <div className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl px-4 py-4`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs theme-text-muted">File</p>
                <p className="text-xl font-bold theme-text mt-1">
                  {loading ? "—" : totalFile}
                </p>
              </div>
              <div className={`w-9 h-9 rounded-lg ${themeSuccessSurface} ${themeSuccessText} flex items-center justify-center`}>
                <FileText size={17} />
              </div>
            </div>
          </div>

          <div className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl px-4 py-4`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs theme-text-muted">Link</p>
                <p className="text-xl font-bold theme-text mt-1">
                  {loading ? "—" : totalLink}
                </p>
              </div>
              <div className={`w-9 h-9 rounded-lg ${themeInfoSurface} ${themeInfoText} flex items-center justify-center`}>
                <ExternalLink size={17} />
              </div>
            </div>
          </div>

          <div className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl px-4 py-4`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs theme-text-muted">Mata pelajaran</p>
                <p className="text-xl font-bold theme-text mt-1">
                  {loading ? "—" : totalMapel}
                </p>
              </div>
              <div className={`w-9 h-9 rounded-lg ${themeWarningSurface} ${themeWarningText} flex items-center justify-center`}>
                <BookOpen size={17} />
              </div>
            </div>
          </div>
        </div>


        <section className={`theme-card ${themeNeutralBorder} rounded-2xl p-4 sm:p-5 ${themeCardShadow} mb-5`}>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1 min-w-0">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari judul, deskripsi, atau kategori materi..."
                className={`w-full h-11 rounded-xl ${themeNeutralBorder} ${themeNeutralSurface} pl-10 pr-4 text-sm theme-text theme-text-placeholder outline-none transition-all ${themeFocus}`}
              />
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className={`h-11 px-4 rounded-xl ${themeNeutralBorder} theme-card theme-text-secondary ${themeNeutralHover} hover:border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)] hover:text-[var(--color-primary)] transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50`}
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <div className={`mt-4 pt-4 border-t ${themeDivider}`}>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-xs font-semibold theme-text-secondary">
                Mata pelajaran
              </span>
              {activeMapel !== "semua" && (
                <span className={`text-[10px] font-medium ${themePrimaryText} ${themePrimarySurface} px-2 py-0.5 rounded-full`}>
                  1 dipilih
                </span>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <button
                onClick={() => setActiveMapel("semua")}
                className={`flex-shrink-0 h-9 px-4 rounded-lg text-xs font-semibold border transition-all ${
                  activeMapel === "semua"
                    ? `${themePrimaryGradient} ${themePrimaryBorderStrong} text-[var(--color-card)] ${themeSmallShadow}`
                    : `theme-card ${themeNeutralBorder} theme-text-secondary hover:border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)] hover:text-[var(--color-primary)]`
                }`}
              >
                Semua
              </button>

              {mataPelajaranList.map((m) => {
                const Icon = m.icon;
                const active = String(activeMapel) === String(m.id);

                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveMapel(m.id)}
                    className={`flex-shrink-0 h-9 px-3 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                      active
                        ? `${themePrimarySurface} ${themePrimaryBorder} ${themePrimaryText}`
                        : `theme-card ${themeNeutralBorder} theme-text-secondary hover:border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)] hover:text-[var(--color-primary)]`
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center ${active ? themePrimarySurfaceStrong : themeNeutralSurface}`}>
                      <Icon
                        size={12}
                        className={active ? themePrimaryText : "theme-text-muted"}
                      />
                    </span>
                    {m.nama}
                  </button>
                );
              })}
            </div>
          </div>
        </section>


        {error && (
          <div className={`mb-5 ${themeDangerSurface} ${themeDangerBorder} rounded-xl p-4`}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg theme-card flex items-center justify-center theme-text flex-shrink-0">
                <AlertCircle size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold theme-text">
                  Gagal memuat materi
                </p>
                <p className="text-xs theme-text-secondary mt-1 leading-5">
                  {error}
                </p>
              </div>
              <button
                onClick={loadData}
                className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold theme-text-secondary hover:text-[var(--color-primary)]"
              >
                <RefreshCw size={14} />
                Coba lagi
              </button>
            </div>
          </div>
        )}


        {!loading && activeMapel !== "semua" && kelasMapelAktif.length > 0 && (
          <div className={`mb-5 ${themeInfoSurface} ${themeInfoBorder} rounded-xl p-4`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg theme-card flex items-center justify-center ${themeInfoText} flex-shrink-0`}>
                <BookOpen size={17} />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-semibold ${themeInfoText}`}>
                  Materi untuk kelas kamu
                </p>
                <p className={`text-xs ${themeInfoText} mt-1 truncate`}>
                  {kelasMapelAktif
                    .map(
                      (item) =>
                        item?.kelas?.nama ??
                        item?.kelas?.namaKelas ??
                        "-"
                    )
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          </div>
        )}


        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 px-1">
          <div>
            <h2 className="text-sm font-semibold theme-text">
              Materi tersedia
            </h2>
            {!loading && (
              <p className="text-xs theme-text-muted mt-0.5">
                {totalMateri} materi
                {selectedMapel ? ` · ${selectedMapel.nama}` : ""}
                {query ? " · hasil pencarian" : ""}
              </p>
            )}
          </div>
          {!loading && filteredMateri.length > 0 && (
            <div className="inline-flex items-center gap-1.5 text-xs theme-text-muted">
              <Clock3 size={13} />
              Terbaru
            </div>
          )}
        </div>


        <section className={`theme-card ${themeNeutralBorder} rounded-2xl ${themeCardShadow} overflow-hidden`}>
          {loading ? (
            <div className={`divide-y ${themeDivider}`}>
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-5 animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl ${themeNeutralSurface} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className={`h-3 w-20 ${themeNeutralSurface} rounded mb-2`} />
                      <div className={`h-4 w-2/3 ${themeNeutralSurface} rounded mb-2`} />
                      <div className={`h-3 w-1/2 ${themeNeutralSurface} rounded`} />
                    </div>
                    <div className={`hidden sm:block w-20 h-8 rounded-lg ${themeNeutralSurface}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMateri.length > 0 ? (
            <div className={`divide-y ${themeDivider}`}>
              {filteredMateri.map((item) => {
                const kelasMapel = getKelasMapelFromMateri(item);
                const tipe = getFileType(item);
                const ft = FILE_TYPE_STYLE[tipe] || FILE_TYPE_STYLE.lainnya;
                const FtIcon = ft.icon;

                const mapelNama = getMapelNama(kelasMapel) || "-";

                const kelasNama =
                  kelasMapel?.kelas?.nama ??
                  kelasMapel?.kelas?.namaKelas ??
                  "-";

                const guruNama =
                  kelasMapel?.guruPengajar?.namaLengkap ??
                  kelasMapel?.guruPengajar?.nama ??
                  item?.guru?.namaLengkap ??
                  item?.guruNama ??
                  "-";

                const tanggal =
                  item?.dibuatPada ??
                  item?.createdAt ??
                  item?.tanggalDibuat;

                const fileUrl = item?.urlFile
                  ? getBackendFileUrl(item.urlFile)
                  : item?.urlLink || null;

                return (
                  <article
                    key={item.id}
                    className="group p-4 sm:p-5 hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${ft.bg} ${ft.text}`}>
                        <FtIcon size={20} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${ft.bg} ${ft.text}`}>
                            {ft.label}
                          </span>

                          {activeMapel === "semua" && mapelNama !== "-" && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${themePrimarySurface} ${themePrimaryText}`}>
                              {mapelNama}
                            </span>
                          )}

                          {kelasNama !== "-" && (
                            <span className="text-[10px] theme-text-muted">
                              {kelasNama}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-[15px] font-semibold theme-text truncate group-hover:text-[var(--color-primary)] transition-colors">
                          {item?.judul || "Materi tanpa judul"}
                        </h3>

                        {item?.deskripsi && (
                          <p className="text-xs theme-text-muted mt-1 line-clamp-1 max-w-3xl">
                            {item.deskripsi}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[11px] theme-text-muted">
                          <span className="font-medium theme-text-secondary">
                            {guruNama}
                          </span>
                          <span className="theme-text-placeholder">•</span>
                          <span>{formatTanggal(tanggal)}</span>

                          {item?.ukuran && (
                            <>
                              <span className="theme-text-placeholder">•</span>
                              <span>{item.ukuran}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:flex-shrink-0">
                        {fileUrl ? (
                          <>
                            <button
                              onClick={() => handleOpenFile(item)}
                              className={`flex-1 sm:flex-none h-9 px-3 rounded-lg ${themeNeutralBorder} theme-card theme-text-secondary hover:border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)] hover:text-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)] transition-all inline-flex items-center justify-center gap-1.5 text-xs font-semibold`}
                            >
                              <Eye size={14} />
                              <span>Lihat</span>
                            </button>

                            {item?.urlFile && (
                              <button
                                onClick={() => handleDownload(item)}
                                className={`h-9 px-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-card)] hover:opacity-90 transition-all inline-flex items-center justify-center gap-1.5 text-xs font-semibold ${themeSmallShadow}`}
                              >
                                <Download size={14} />
                                <span className="hidden sm:inline">Unduh</span>
                              </button>
                            )}
                          </>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg ${themeNeutralSurface} text-[11px] font-medium theme-text-muted`}>
                            <File size={13} />
                            File belum tersedia
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="py-16 px-5 text-center">
              <div className="relative mx-auto w-fit mb-4">
                <div className={`w-16 h-16 rounded-2xl ${themePrimarySurface} ${themePrimaryText} flex items-center justify-center`}>
                  <BookMarked size={27} />
                </div>
                <div className={`absolute -right-1 -top-1 w-5 h-5 rounded-full theme-card ${themePrimaryBorder} flex items-center justify-center`}>
                  <FileText size={10} className={themePrimaryText} />
                </div>
              </div>

              <h3 className="text-sm font-semibold theme-text-secondary">
                Belum ada materi
              </h3>

              <p className="text-xs theme-text-muted max-w-md mx-auto mt-1.5 leading-5">
                {query
                  ? "Tidak ada materi yang sesuai dengan kata kunci pencarian."
                  : activeMapel !== "semua"
                  ? "Guru belum mengupload materi untuk mata pelajaran ini."
                  : "Belum ada materi pembelajaran yang tersedia untuk kelas kamu."}
              </p>

              {(query || activeMapel !== "semua") && (
                <button
                  onClick={() => {
                    setQuery("");
                    setActiveMapel("semua");
                  }}
                  className={`mt-5 inline-flex items-center gap-2 h-9 px-4 rounded-lg ${themePrimarySurface} ${themePrimaryText} hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] transition-colors text-xs font-semibold`}
                >
                  Tampilkan semua materi
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          )}
        </section>


        {!loading && filteredMateri.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1 pt-1 pb-5">
            <p className="text-[11px] theme-text-muted">
              Menampilkan{" "}
              <span className="font-semibold theme-text-secondary">
                {filteredMateri.length}
              </span>{" "}
              materi pembelajaran
            </p>
            <p className="text-[11px] theme-text-muted">
              Materi terbaru ditampilkan terlebih dahulu
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


export default function MateriPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <MateriPageInner />
    </Suspense>
  );
}