
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getToken,
  getSessionUser,
  subscribeAuth,
} from "@/lib/auth";

import {
  getKelas,
  getKelasById,
} from "@/services/kelas.service";

import { getTugasByKelasMapel } from "@/services/tugas.service";
import { getMateriPembelajaran } from "@/services/materiPembelajaran.service";
import { getDashboardSiswa } from "@/services/dashboardSiswa.service";

import {
  BookOpen,
  Calculator,
  FlaskConical,
  Globe2,
  Languages,
  Palette,
  Music,
  Dumbbell,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  School,
  Sparkles,
  CalendarDays,
  ArrowUpRight,
  AlertCircle,
  Loader2,
  FileText,
  RefreshCw,
  CalendarClock,
  Clock3,
  MapPin,
  Wallet,
  Bell,
  ShieldAlert,
  Banknote,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";

/* =========================================================
   THEME
========================================================= */

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const subjectThemes = [
  {
    surface:
      "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
    text: "text-[var(--color-primary)]",
    hover:
      "group-hover:border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)] group-hover:ring-2 group-hover:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]",
  },
  {
    surface:
      "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
    text: "text-[var(--color-success)]",
    hover:
      "group-hover:border-[color-mix(in_srgb,var(--color-success)_25%,transparent)] group-hover:ring-2 group-hover:ring-[color-mix(in_srgb,var(--color-success)_12%,transparent)]",
  },
  {
    surface:
      "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]",
    text: "text-[var(--color-warning)]",
    hover:
      "group-hover:border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)] group-hover:ring-2 group-hover:ring-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]",
  },
  {
    surface:
      "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",
    text: "text-[var(--color-info)]",
    hover:
      "group-hover:border-[color-mix(in_srgb,var(--color-info)_25%,transparent)] group-hover:ring-2 group-hover:ring-[color-mix(in_srgb,var(--color-info)_12%,transparent)]",
  },
  {
    surface:
      "bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)]",
    text: "text-[var(--color-primary)]",
    hover:
      "group-hover:border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)] group-hover:ring-2 group-hover:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
  },
  {
    surface:
      "bg-[color-mix(in_srgb,var(--color-info)_7%,transparent)]",
    text: "text-[var(--color-info)]",
    hover:
      "group-hover:border-[color-mix(in_srgb,var(--color-info)_22%,transparent)] group-hover:ring-2 group-hover:ring-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",
  },
];

const iconMap = {
  matematika: Calculator,
  biologi: FlaskConical,
  ipa: FlaskConical,
  fisika: FlaskConical,
  kimia: FlaskConical,
  ekonomi: BookOpen,
  ips: Globe2,
  "bahasa indonesia": Languages,
  bindo: Languages,
  "bahasa inggris": Languages,
  inggris: Languages,
};

/* =========================================================
   HELPER
========================================================= */

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getMapelIcon(nama = "") {
  const value = String(nama).toLowerCase();

  if (value.includes("matematika") || value.includes("math")) {
    return Calculator;
  }

  if (
    value.includes("ipa") ||
    value.includes("fisika") ||
    value.includes("kimia") ||
    value.includes("biologi")
  ) {
    return FlaskConical;
  }

  if (
    value.includes("ips") ||
    value.includes("geografi") ||
    value.includes("sosiologi") ||
    value.includes("ekonomi") ||
    value.includes("sejarah")
  ) {
    return Globe2;
  }

  if (value.includes("indonesia")) return Languages;

  if (
    value.includes("bahasa inggris") ||
    value.includes("english")
  ) {
    return BookOpen;
  }

  if (
    value.includes("seni budaya") ||
    value.includes("seni rupa")
  ) {
    return Palette;
  }

  if (value.includes("musik")) return Music;

  if (
    value.includes("pjok") ||
    value.includes("penjaskes") ||
    value.includes("olahraga")
  ) {
    return Dumbbell;
  }

  return BookOpen;
}

function getMapelTheme(index) {
  return subjectThemes[index % subjectThemes.length];
}

function getUsername(user) {
  if (!user || typeof user !== "object") return "";

  const candidates = [
    user.namaLengkap,
    user.namalengkap,
    user.nama,
    user.name,
    user.fullName,
    user.full_name,
    user.namaPengguna,
    user.nama_pengguna,
    user.username,
    user.userName,
    user.siswa?.namaLengkap,
    user.siswa?.nama,
    user.user?.namaLengkap,
    user.data?.namaLengkap,
  ];

  const name = candidates.find(
    (value) =>
      typeof value === "string" && value.trim() !== ""
  );

  return name ? name.trim() : "";
}

function getUserId(user) {
  if (!user) return "";

  const userId =
    user.userId ||
    user.id ||
    user.penggunaId ||
    user.siswaId ||
    user.siswa?.id ||
    user.data?.userId ||
    user.data?.id ||
    user.data?.penggunaId ||
    user.data?.siswaId ||
    user.data?.siswa?.id ||
    "";

  return userId ? String(userId) : "";
}

function getUserKelasId(user) {
  if (!user) return "";

  const kelasId =
    user.kelasId ||
    user.kelas_id ||
    user.kelas?.id ||
    user.siswa?.kelasId ||
    user.siswa?.kelas?.id ||
    user.data?.kelasId ||
    user.data?.kelas?.id ||
    user.data?.siswa?.kelasId ||
    user.data?.siswa?.kelas?.id ||
    "";

  return kelasId ? String(kelasId) : "";
}

function getUserKelasName(user) {
  if (!user) return "";

  const kelasName =
    user.kelas?.nama ||
    user.kelas?.namaKelas ||
    user.namaKelas ||
    user.siswa?.kelas?.nama ||
    user.siswa?.kelas?.namaKelas ||
    user.data?.kelas?.nama ||
    user.data?.kelas?.namaKelas ||
    user.data?.siswa?.kelas?.nama ||
    user.data?.siswa?.kelas?.namaKelas ||
    "";

  return typeof kelasName === "string"
    ? kelasName.trim()
    : "";
}

function readSessionUser() {
  const sessionUser = getSessionUser();

  if (!sessionUser || typeof sessionUser !== "object") {
    return null;
  }

  return {
    username: getUsername(sessionUser),
    email: sessionUser.email || "",
    userId: getUserId(sessionUser),
    sekolahId:
      sessionUser.sekolahId ||
      sessionUser.schoolId ||
      "",
    kelasId: getUserKelasId(sessionUser),
    kelasName: getUserKelasName(sessionUser),
  };
}

function extractArray(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.data?.list)) {
    return response.data.list;
  }

  if (Array.isArray(response?.list)) {
    return response.list;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
}

function extractObject(response) {
  if (!response || typeof response !== "object") {
    return null;
  }

  if (
    response.data &&
    !Array.isArray(response.data)
  ) {
    if (
      response.data.data &&
      !Array.isArray(response.data.data)
    ) {
      return response.data.data;
    }

    return response.data;
  }

  return response;
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/* =========================================================
   DATA KELAS DAN MATA PELAJARAN
========================================================= */

async function fetchKelasDetail(id) {
  if (!id) return null;

  try {
    const result = await getKelasById(id);
    return extractObject(result);
  } catch (error) {
    console.warn(
      "[KELAS] Gagal mengambil detail kelas:",
      id,
      error
    );

    throw error;
  }
}

async function findStudentClass(
  userId,
  existingKelasId = ""
) {
  if (existingKelasId) {
    const detail = await fetchKelasDetail(existingKelasId);

    if (detail) return detail;
  }

  const kelasResponse = await getKelas({
    page: 1,
    limit: 100,
  });

  const daftarKelas = extractArray(kelasResponse);

  if (daftarKelas.length === 0) return null;

  for (const kelas of daftarKelas) {
    if (!kelas?.id) continue;

    const detail = await fetchKelasDetail(kelas.id);

    if (!detail) continue;

    const anggota = Array.isArray(detail.anggota)
      ? detail.anggota
      : [];

    const siswaDitemukan = anggota.some(
      (anggotaItem) => {
        const siswaId =
          anggotaItem?.siswa?.id ||
          anggotaItem?.siswaId ||
          anggotaItem?.penggunaId ||
          anggotaItem?.pengguna?.id ||
          "";

        return String(siswaId) === String(userId);
      }
    );

    if (siswaDitemukan) return detail;
  }

  return null;
}

async function fetchJumlahTugas(kelasMapelId) {
  if (!kelasMapelId) return 0;

  const result = await getTugasByKelasMapel(
    kelasMapelId
  );

  return extractArray(result).length;
}

async function fetchSemuaMateri() {
  return extractArray(
    await getMateriPembelajaran()
  );
}

function normalizeKelasMapel(
  item,
  index,
  kelasId,
  kelasName,
  jumlahMateri = 0,
  jumlahTugas = 0
) {
  const nama =
    item?.mataPelajaran?.nama ||
    item?.mataPelajaran?.namaMapel ||
    item?.mataPelajaran?.namaMataPelajaran ||
    item?.mataPelajaran?.nama_mata_pelajaran ||
    item?.namaMataPelajaran ||
    item?.namaMapel ||
    item?.nama ||
    "Mata Pelajaran";

  const guru =
    item?.guruPengajar?.namaLengkap ||
    item?.guruPengajar?.nama ||
    item?.guru?.namaLengkap ||
    item?.guru?.nama ||
    item?.guruNama ||
    "Guru belum tersedia";

  return {
    id: item?.id || `mapel-${index}`,
    kelasMapelId: item?.id || `mapel-${index}`,
    kelasId:
      item?.kelasId ||
      item?.kelas?.id ||
      kelasId ||
      "",
    kelas: kelasName || "",
    nama: String(nama),
    guru: String(guru),
    kode:
      item?.mataPelajaran?.kode ||
      item?.kode ||
      "",
    icon:
      iconMap[normalizeText(nama)] ||
      getMapelIcon(String(nama)),
    theme: getMapelTheme(index),
    materi: Number(jumlahMateri) || 0,
    tugas: Number(jumlahTugas) || 0,
    progress: 0,
  };
}

/* =========================================================
   REUSABLE COMPONENT
========================================================= */

function EmptyState({
  icon: Icon = Info,
  title,
  description,
}) {
  return (
    <div className="flex min-h-[150px] flex-col items-center justify-center px-5 py-8 text-center">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${themeNeutralSurface} theme-text-muted`}
      >
        <Icon size={21} />
      </div>

      <p className="theme-text mt-3 text-sm font-semibold">
        {title}
      </p>

      {description && (
        <p className="theme-text-secondary mt-1 max-w-sm text-xs leading-5">
          {description}
        </p>
      )}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  iconClass = `${themePrimarySoft} ${themePrimaryText}`,
  rightContent,
}) {
  return (
    <div
      className={`flex flex-col gap-3 border-b ${themeDivider} px-5 py-4 sm:flex-row sm:items-center sm:justify-between`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={20} />
        </div>

        <div>
          <h2 className="theme-text text-base font-bold">
            {title}
          </h2>

          {description && (
            <p className="theme-text-secondary mt-0.5 text-xs">
              {description}
            </p>
          )}
        </div>
      </div>

      {rightContent}
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function SiswaDashboardPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  const [user, setUser] = useState({
    username: "",
    email: "",
    userId: "",
    sekolahId: "",
    kelasId: "",
    kelasName: "",
  });

  const [dashboard, setDashboard] = useState(null);
  const [dashboardError, setDashboardError] = useState("");
  const [loadingDashboard, setLoadingDashboard] =
    useState(true);

  const [mataPelajaranList, setMataPelajaranList] =
    useState([]);

  const [loadingMapel, setLoadingMapel] =
    useState(true);

  const [mapelError, setMapelError] = useState("");

  /* =======================================================
     AUTH SESSION
  ======================================================= */

  useEffect(() => {
    setMounted(true);

    const syncUser = () => {
      const sessionUser = readSessionUser();

      if (sessionUser) {
        setUser(sessionUser);
      }
    };

    syncUser();

    const unsubscribe = subscribeAuth(syncUser);

    return () => unsubscribe();
  }, []);

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoadingDashboard(true);
        setDashboardError("");

        if (!getToken()) {
          router.replace("/login?sessionExpired=1");
          return;
        }

        const data = await getDashboardSiswa();

        if (cancelled) return;

        setDashboard(data);

        const profile = data?.profil || {};
        const kelas = data?.kelas || {};

        setUser((previous) => ({
          ...previous,
          username:
            profile.namaLengkap ||
            previous.username ||
            "Siswa",
          email:
            profile.email ||
            previous.email ||
            "",
          userId:
            profile.id ||
            previous.userId,
          kelasId:
            kelas.id ||
            previous.kelasId,
          kelasName:
            kelas.nama ||
            previous.kelasName,
        }));
      } catch (error) {
        if (cancelled) return;

        console.error(
          "[DASHBOARD SISWA] Gagal memuat dashboard:",
          error
        );

        if (error?.status === 401) {
          router.replace("/login?sessionExpired=1");
          return;
        }

        setDashboardError(
          error?.message ||
            "Gagal mengambil data dashboard siswa."
        );
      } finally {
        if (!cancelled) {
          setLoadingDashboard(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [router]);

  /* =======================================================
     LOAD MATA PELAJARAN
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadMataPelajaran() {
      try {
        setLoadingMapel(true);
        setMapelError("");

        if (!getToken()) {
          router.replace("/login?sessionExpired=1");
          return;
        }

        const sessionUser = readSessionUser();

        if (!sessionUser) {
          throw new Error(
            "Data pengguna tidak ditemukan. Silakan login kembali."
          );
        }

        const userId = sessionUser.userId;
        const existingKelasId = sessionUser.kelasId;

        if (!userId) {
          throw new Error(
            "ID siswa tidak ditemukan dari sesi login."
          );
        }

        const kelasSiswa = await findStudentClass(
          userId,
          existingKelasId
        );

        if (cancelled) return;

        if (!kelasSiswa) {
          setMataPelajaranList([]);
          setMapelError(
            "Kelas siswa belum ditemukan. Pastikan siswa sudah dimasukkan ke kelas oleh Admin Sekolah."
          );
          return;
        }

        const kelasId = String(kelasSiswa.id);

        const kelasName =
          kelasSiswa.nama ||
          kelasSiswa.namaKelas ||
          "Kelas siswa";

        setUser((previous) => ({
          ...previous,
          kelasId,
          kelasName,
        }));

        const dataKelasSiswa = Array.isArray(
          kelasSiswa.kelasMapel
        )
          ? kelasSiswa.kelasMapel.filter(
              (item) => item?.dihapusPada == null
            )
          : [];

        if (dataKelasSiswa.length === 0) {
          setMataPelajaranList([]);
          setMapelError(
            `Belum ada mata pelajaran yang terhubung dengan ${kelasName}.`
          );
          return;
        }

        const [materiData, tugasCounts] =
          await Promise.all([
            fetchSemuaMateri(),
            Promise.all(
              dataKelasSiswa.map((item) =>
                fetchJumlahTugas(item?.id)
              )
            ),
          ]);

        if (cancelled) return;

        const normalized = dataKelasSiswa.map(
          (item, index) => {
            const kelasMapelId = item?.id;

            const jumlahMateri = materiData.filter(
              (materi) => {
                const materiKelasMapelId =
                  materi?.kelasMapelId ??
                  materi?.kelas_mapel_id ??
                  materi?.kelasMapel?.id ??
                  null;

                return (
                  String(materiKelasMapelId) ===
                  String(kelasMapelId)
                );
              }
            ).length;

            return normalizeKelasMapel(
              item,
              index,
              kelasId,
              kelasName,
              jumlahMateri,
              tugasCounts[index]
            );
          }
        );

        setMataPelajaranList(normalized);
      } catch (error) {
        if (cancelled) return;

        console.error(
          "[MATA PELAJARAN] Gagal memuat:",
          error
        );

        if (error?.status === 401) {
          router.replace("/login?sessionExpired=1");
          return;
        }

        setMataPelajaranList([]);

        setMapelError(
          error?.message ||
            "Gagal mengambil data mata pelajaran dari server."
        );
      } finally {
        if (!cancelled) {
          setLoadingMapel(false);
        }
      }
    }

    loadMataPelajaran();

    return () => {
      cancelled = true;
    };
  }, [router]);

  /* =======================================================
     DATA DISPLAY
  ======================================================= */

  const username = user.username || "Siswa";
  const kelasName = user.kelasName || "Kelas siswa";

  const kehadiran = dashboard?.kehadiranBulanIni;

  const quickStats = [
    {
      title: "Kehadiran",
      value:
        kehadiran &&
        Number.isFinite(Number(kehadiran.persentase))
          ? `${kehadiran.persentase}%`
          : "—",
      description: "Bulan ini",
      icon: ClipboardCheck,
      iconSurface: themeSuccessSurface,
      iconText: "text-[var(--color-success)]",
      valueText: "text-[var(--color-success)]",
    },
    {
      title: "Tugas Belum Selesai",
      value: dashboard
        ? String(dashboard.tugasMendatang?.length ?? 0)
        : "—",
      description: "Perlu dikerjakan",
      icon: ClipboardList,
      iconSurface: themeWarningSurface,
      iconText: "text-[var(--color-warning)]",
      valueText: "text-[var(--color-warning)]",
    },
    {
      title: "Notifikasi",
      value: dashboard
        ? String(dashboard.notifikasiBelumDibaca ?? 0)
        : "—",
      description: "Belum dibaca",
      icon: Bell,
      iconSurface: themePrimarySoft,
      iconText: themePrimaryText,
      valueText: themePrimaryText,
    },
  ];

  const tugasMendatang =
    dashboard?.tugasMendatang || [];

  const nilaiTerbaru =
    dashboard?.nilaiTerbaru || [];

  const jadwalHariIni =
    dashboard?.jadwalHariIni || [];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex h-screen overflow-hidden theme-page theme-text">
      <div className="flex min-h-0 flex-1 flex-col">
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div
            className={`w-full space-y-6 p-4 transition-all duration-700 sm:p-6 lg:p-8 ${
              mounted
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            {/* =================================================
                HERO
            ================================================= */}

            <section
              className={`theme-card relative isolate overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <div
                className={`absolute inset-0 -z-30 ${themePrimarySoft}`}
              />

              <div className="absolute -right-24 -top-28 -z-20 h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] blur-3xl" />

              <div className="absolute -bottom-32 right-[20%] -z-20 h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)] blur-3xl" />

              <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
                <div className="absolute bottom-0 right-4 h-[90%] w-[400px]">
                  <div className="absolute bottom-0 left-0 h-4 w-full rounded-full bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]" />

                  <div className="absolute bottom-0 left-10 h-[75%] w-[280px] rounded-t-xl border border-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_80%,transparent)] shadow-[0_20px_60px_color-mix(in_srgb,var(--color-primary)_10%,transparent)] backdrop-blur-md">
                    <div
                      className={`absolute -top-7 left-[-16px] h-8 w-[312px] rounded-t-lg ${themePrimaryGradient}`}
                    />

                    <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-md border border-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_90%,transparent)] px-4 py-1.5 shadow-sm backdrop-blur">
                      <div className="flex items-center gap-1.5">
                        <School
                          size={11}
                          className={themePrimaryText}
                        />
                        <span className="whitespace-nowrap text-[8px] font-bold tracking-[0.18em] text-[var(--color-primary)]">
                          SMART SCHOOL
                        </span>
                      </div>
                    </div>

                    <div className="absolute left-7 top-16 grid grid-cols-4 gap-5">
                      {Array.from({ length: 8 }).map(
                        (_, index) => (
                          <div
                            key={index}
                            className="h-9 w-8 rounded-md border border-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] shadow-inner"
                          >
                            <div className="mx-auto mt-2 h-4 w-4 rounded-sm bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]" />
                          </div>
                        )
                      )}
                    </div>

                    <div className="absolute bottom-0 left-1/2 h-28 w-20 -translate-x-1/2 rounded-t-xl border-x border-t border-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]">
                      <div className="absolute bottom-0 left-1/2 h-20 w-12 -translate-x-1/2 rounded-t-lg bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 px-5 py-7 sm:px-7 sm:py-8 lg:px-9 lg:py-10">
                <div className="max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_95%,transparent)] px-3 py-1.5 shadow-sm backdrop-blur">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${themePrimarySoft} ${themePrimaryText}`}
                    >
                      <School size={14} />
                    </div>

                    <span className="text-xs font-semibold tracking-wide text-[var(--color-primary)]">
                      SMARTSCHOOL STUDENT
                    </span>

                    <span className="h-1 w-1 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_40%,transparent)]" />

                    <span className="theme-text-secondary text-xs font-medium">
                      Siswa
                    </span>
                  </div>

                  <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                    Selamat datang kembali,

                    <span className="mt-1 block bg-[linear-gradient(90deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_70%,var(--color-info)))] bg-clip-text text-transparent">
                      {username}
                    </span>
                  </h1>

                  <p className="theme-text-secondary mt-3 max-w-xl text-sm leading-6 sm:text-base">
                    Pantau pembelajaran, tugas, kehadiran,
                    dan perkembangan akademikmu dalam satu
                    tempat.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <div
                      className={`inline-flex items-center gap-2 rounded-lg border ${themeNeutralBorder} ${themeCardShadow} bg-[color-mix(in_srgb,var(--color-card)_90%,transparent)] px-3 py-2 text-xs font-medium theme-text-secondary`}
                    >
                      <GraduationCap
                        size={15}
                        className={themePrimaryText}
                      />
                      {kelasName}
                    </div>

                    <div
                      className={`theme-text-secondary inline-flex items-center gap-2 rounded-lg border ${themeNeutralBorder} bg-[color-mix(in_srgb,var(--color-card)_90%,transparent)] px-3 py-2 text-xs font-medium shadow-sm`}
                    >
                      <CalendarDays
                        size={15}
                        className={themePrimaryText}
                      />

                      {dashboard?.kelas?.tahunAjaran?.tahunAjaran
                        ? `Tahun Ajaran ${dashboard.kelas.tahunAjaran.tahunAjaran}`
                        : "Tahun ajaran belum tersedia"}
                    </div>

                    <div
                      className={`theme-text-secondary inline-flex items-center gap-2 rounded-lg border ${themeNeutralBorder} bg-[color-mix(in_srgb,var(--color-card)_90%,transparent)] px-3 py-2 text-xs font-medium shadow-sm`}
                    >
                      <Sparkles
                        size={14}
                        className={themePrimaryText}
                      />
                      Semangat belajar hari ini
                    </div>
                  </div>

                  {dashboardError && (
                    <div
                      className={`mt-5 flex items-start gap-2 rounded-lg border ${themeWarningBorder} ${themeWarningSurface} p-3 text-sm`}
                    >
                      <AlertCircle
                        size={17}
                        className="mt-0.5 shrink-0 text-[var(--color-warning)]"
                      />

                      <div>
                        <p className="font-semibold theme-text">
                          Dashboard belum dapat dimuat
                        </p>

                        <p className="mt-1 theme-text-secondary">
                          {dashboardError}
                        </p>

                        <button
                          type="button"
                          onClick={() => window.location.reload()}
                          className={`mt-2 inline-flex items-center gap-2 font-semibold ${themePrimaryText}`}
                        >
                          <RefreshCw size={14} />
                          Coba lagi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 h-1 w-full bg-[linear-gradient(90deg,var(--color-primary),var(--color-info))]" />
            </section>

            {/* =================================================
                QUICK STATS
            ================================================= */}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {quickStats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className={`theme-card group relative overflow-hidden rounded-xl border ${themeNeutralBorder} p-5 ${themeCardShadow} transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] hover:shadow-[0_10px_30px_color-mix(in_srgb,var(--color-text)_10%,transparent)]`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="theme-text-secondary text-sm font-medium">
                          {stat.title}
                        </p>

                        <div className="mt-2 flex items-end gap-2">
                          <span
                            className={`text-2xl font-bold ${stat.valueText}`}
                          >
                            {stat.value}
                          </span>

                          <span className="theme-text-muted mb-1 text-xs font-medium">
                            {stat.description}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconSurface} ${stat.iconText}`}
                      >
                        <Icon size={20} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* =================================================
                KEHADIRAN
            ================================================= */}

            <section
              className={`theme-card rounded-2xl border ${themeNeutralBorder} p-5 sm:p-6 ${themeCardShadow}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="theme-text text-lg font-bold">
                    Kehadiran Bulan Ini
                  </h2>

                  <p className="theme-text-secondary mt-1 text-xs">
                    Rekap kehadiran berdasarkan data absensi
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${themeSuccessSurface} text-[var(--color-success)]`}
                >
                  <ClipboardCheck size={21} />
                </div>
              </div>

              {loadingDashboard ? (
                <div className="mt-5 flex items-center gap-2 theme-text-secondary text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Memuat data kehadiran...
                </div>
              ) : (
                <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="min-w-[130px]">
                    <p className="text-3xl font-bold text-[var(--color-success)]">
                      {kehadiran?.persentase ?? 0}%
                    </p>

                    <p className="theme-text-muted mt-1 text-xs">
                      Persentase kehadiran
                    </p>

                    <p className="theme-text-secondary mt-1 text-xs">
                      Total {kehadiran?.total ?? 0} absensi
                    </p>
                  </div>

                  <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      {
                        label: "Hadir",
                        value: kehadiran?.hadir ?? 0,
                        color: "text-[var(--color-success)]",
                      },
                      {
                        label: "Izin",
                        value: kehadiran?.izin ?? 0,
                        color: "text-[var(--color-info)]",
                      },
                      {
                        label: "Sakit",
                        value: kehadiran?.sakit ?? 0,
                        color: "text-[var(--color-warning)]",
                      },
                      {
                        label: "Alpha",
                        value: kehadiran?.alpha ?? 0,
                        color: "text-[var(--color-danger)]",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`rounded-xl ${themeNeutralSurface} p-3`}
                      >
                        <p className="theme-text-secondary text-xs">
                          {item.label}
                        </p>

                        <p
                          className={`mt-1 text-xl font-bold ${item.color}`}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* =================================================
                JADWAL HARI INI
            ================================================= */}

            <section
              className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <SectionHeader
                icon={CalendarClock}
                title="Jadwal Hari Ini"
                description="Jadwal pelajaran sesuai kelasmu"
                rightContent={
                  <span className="theme-text-secondary text-xs">
                    {jadwalHariIni.length} jadwal
                  </span>
                }
              />

              {loadingDashboard ? (
                <div className="flex items-center gap-2 px-5 py-8 theme-text-secondary text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Memuat jadwal...
                </div>
              ) : jadwalHariIni.length > 0 ? (
                <div
                  className={`divide-y ${themeDivider}`}
                >
                  {jadwalHariIni.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                        >
                          <BookOpen size={20} />
                        </div>

                        <div className="min-w-0">
                          <p className="theme-text truncate text-sm font-bold">
                            {item.mataPelajaran}
                          </p>

                          <p className="theme-text-secondary mt-1 text-xs">
                            {item.guru}
                          </p>

                          <p className="theme-text-muted mt-1 flex items-center gap-1 text-xs">
                            <MapPin size={12} />
                            {item.ruangan ||
                              "Ruangan belum ditentukan"}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`flex shrink-0 items-center gap-2 self-start rounded-lg ${themeNeutralSurface} px-3 py-2 sm:self-center`}
                      >
                        <Clock3
                          size={15}
                          className={themePrimaryText}
                        />

                        <span className="theme-text text-xs font-semibold">
                          {item.jamMulai} - {item.jamSelesai}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="Tidak ada jadwal hari ini"
                  description="Belum ada jadwal pelajaran untuk kelasmu hari ini."
                />
              )}
            </section>

            {/* =================================================
                TUGAS DAN NILAI
            ================================================= */}

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {/* TUGAS */}

              <div
                className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <SectionHeader
                  icon={ClipboardList}
                  title="Tugas Mendatang"
                  description="Tugas yang belum dikumpulkan"
                  iconClass={`${themeWarningSurface} text-[var(--color-warning)]`}
                  rightContent={
                    <span className="theme-text-secondary text-xs">
                      {tugasMendatang.length} tugas
                    </span>
                  }
                />

                {loadingDashboard ? (
                  <div className="flex items-center gap-2 px-5 py-8 theme-text-secondary text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    Memuat tugas...
                  </div>
                ) : tugasMendatang.length > 0 ? (
                  <div className={`divide-y ${themeDivider}`}>
                    {tugasMendatang.map((item) => (
                      <div
                        key={item.id}
                        className="px-5 py-4"
                      >
                        <p className="theme-text text-sm font-semibold">
                          {item.judul}
                        </p>

                        <div className="theme-text-secondary mt-2 flex flex-wrap items-center gap-3 text-xs">
                          <span className="inline-flex items-center gap-1">
                            <BookOpen size={12} />
                            {item.mataPelajaran}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={12} />
                            {formatTanggal(item.batasWaktu)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={CheckCircle2}
                    title="Tidak ada tugas mendatang"
                    description="Saat ini tidak ada tugas yang perlu dikumpulkan."
                  />
                )}
              </div>

              {/* NILAI */}

              <div
                className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <SectionHeader
                  icon={GraduationCap}
                  title="Nilai Terbaru"
                  description="Hasil penilaian akademik"
                  iconClass={`${themeSuccessSurface} text-[var(--color-success)]`}
                />

                <div
                  className={`border-b ${themeDivider} px-5 py-4`}
                >
                  <p className="theme-text-secondary text-xs">
                    Rata-rata nilai akhir
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <p
                      className={`text-2xl font-bold ${themePrimaryText}`}
                    >
                      {dashboard?.rataRataNilai ?? 0}
                    </p>

                    <TrendingUp
                      size={17}
                      className="text-[var(--color-success)]"
                    />
                  </div>
                </div>

                {loadingDashboard ? (
                  <div className="flex items-center gap-2 px-5 py-8 theme-text-secondary text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    Memuat nilai...
                  </div>
                ) : nilaiTerbaru.length > 0 ? (
                  <div className={`divide-y ${themeDivider}`}>
                    {nilaiTerbaru.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 px-5 py-4"
                      >
                        <div className="min-w-0">
                          <p className="theme-text truncate text-sm font-semibold">
                            {item.mataPelajaran}
                          </p>

                          <p className="theme-text-secondary mt-1 text-xs">
                            {item.komponen} · {item.jenis}
                          </p>

                          <p className="theme-text-muted mt-1 text-xs">
                            {formatTanggal(item.tanggal)}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-lg ${themeSuccessSurface} px-3 py-2 text-sm font-bold text-[var(--color-success)]`}
                        >
                          {item.nilai}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={GraduationCap}
                    title="Belum ada nilai terbaru"
                    description="Nilai yang sudah diterbitkan akan ditampilkan di sini."
                  />
                )}
              </div>
            </section>

            {/* =================================================
                KEUANGAN DAN KEDISIPLINAN
            ================================================= */}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* TAGIHAN */}

              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${themeWarningSurface} text-[var(--color-warning)]`}
                  >
                    <Wallet size={20} />
                  </div>

                  <span className="theme-text-muted text-xs">
                    Keuangan
                  </span>
                </div>

                <p className="theme-text-secondary mt-4 text-xs">
                  Total sisa tagihan
                </p>

                <p className="theme-text mt-1 break-words text-xl font-bold">
                  {formatRupiah(
                    dashboard?.tagihan?.totalSisa
                  )}
                </p>

                <p className="theme-text-muted mt-2 text-xs">
                  {dashboard?.tagihan?.jumlahBelumLunas ?? 0}{" "}
                  tagihan belum lunas
                </p>

                {dashboard?.tagihan?.terdekat && (
                  <div
                    className={`mt-4 border-t ${themeDivider} pt-3`}
                  >
                    <p className="theme-text-secondary text-xs">
                      Tagihan terdekat:{" "}
                      {dashboard.tagihan.terdekat.kategori}
                    </p>

                    <p className="theme-text mt-1 text-xs font-semibold">
                      Jatuh tempo:{" "}
                      {formatTanggal(
                        dashboard.tagihan.terdekat.jatuhTempo
                      )}
                    </p>

                    <p className="theme-text mt-1 text-xs">
                      Sisa:{" "}
                      {formatRupiah(
                        dashboard.tagihan.terdekat.sisa
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* TABUNGAN */}

              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                  >
                    <Banknote size={20} />
                  </div>

                  <span className="theme-text-muted text-xs">
                    Keuangan
                  </span>
                </div>

                <p className="theme-text-secondary mt-4 text-xs">
                  Saldo tabungan
                </p>

                <p className="theme-text mt-1 break-words text-xl font-bold">
                  {formatRupiah(
                    dashboard?.tabungan?.saldo
                  )}
                </p>

                <p className="theme-text-muted mt-2 text-xs">
                  Saldo tabungan siswa
                </p>
              </div>

              {/* PELANGGARAN */}

              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${themeWarningSurface} text-[var(--color-warning)]`}
                  >
                    <ShieldAlert size={20} />
                  </div>

                  <span className="theme-text-muted text-xs">
                    Kedisiplinan
                  </span>
                </div>

                <p className="theme-text-secondary mt-4 text-xs">
                  Jumlah pelanggaran
                </p>

                <p className="theme-text mt-1 text-xl font-bold">
                  {dashboard?.pelanggaran?.jumlah ?? 0}
                </p>

                <p className="theme-text-muted mt-2 text-xs">
                  Total{" "}
                  {dashboard?.pelanggaran?.totalPoin ?? 0}{" "}
                  poin pelanggaran
                </p>
              </div>

              {/* NOTIFIKASI */}

              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                  >
                    <Bell size={20} />
                  </div>

                  <span className="theme-text-muted text-xs">
                    Informasi
                  </span>
                </div>

                <p className="theme-text-secondary mt-4 text-xs">
                  Notifikasi belum dibaca
                </p>

                <p className="theme-text mt-1 text-xl font-bold">
                  {dashboard?.notifikasiBelumDibaca ?? 0}
                </p>

                <p className="theme-text-muted mt-2 text-xs">
                  Informasi yang perlu diperiksa
                </p>
              </div>
            </section>

            {/* =================================================
                MATA PELAJARAN
            ================================================= */}

            <section
              className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <div
                className={`border-b ${themeDivider} px-5 py-5 sm:px-6`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                    >
                      <BookOpen size={19} />
                    </div>

                    <div>
                      <h2 className="theme-text text-lg font-bold">
                        Mata Pelajaran
                      </h2>

                      <p className="theme-text-secondary mt-0.5 text-xs">
                        {user.kelasName
                          ? `Mata pelajaran untuk kelas ${user.kelasName}`
                          : "Mata pelajaran sesuai kelasmu"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/siswa/mataPelajaran")
                    }
                    className={`group inline-flex items-center justify-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card px-3.5 py-2 text-sm font-semibold theme-text-secondary transition-all ${themeNeutralHover} hover:border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)] hover:text-[var(--color-primary)]`}
                  >
                    Lihat semua

                    <ArrowUpRight
                      size={15}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {loadingMapel && (
                  <div className="flex min-h-[220px] flex-col items-center justify-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${themePrimarySoft} ${themePrimaryText}`}
                    >
                      <Loader2
                        size={22}
                        className="animate-spin"
                      />
                    </div>

                    <p className="theme-text mt-4 text-sm font-medium">
                      Memuat mata pelajaran...
                    </p>

                    <p className="theme-text-muted mt-1 text-center text-xs">
                      Mengambil kelas dan mata pelajaran dari server
                    </p>
                  </div>
                )}

                {!loadingMapel &&
                  mapelError &&
                  mataPelajaranList.length === 0 && (
                    <div
                      className={`flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed ${themeWarningBorder} ${themeWarningSurface} px-5 text-center`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)] text-[var(--color-warning)]">
                        <AlertCircle size={22} />
                      </div>

                      <h3 className="theme-text mt-4 text-sm font-bold">
                        Data mata pelajaran belum tersedia
                      </h3>

                      <p className="theme-text-secondary mt-1 max-w-md text-xs leading-5">
                        {mapelError}
                      </p>
                    </div>
                  )}

                {!loadingMapel &&
                  !mapelError &&
                  mataPelajaranList.length === 0 && (
                    <EmptyState
                      icon={BookOpen}
                      title="Belum ada mata pelajaran"
                      description="Belum ada mata pelajaran yang terhubung dengan kelas kamu."
                    />
                  )}

                {!loadingMapel &&
                  mataPelajaranList.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {mataPelajaranList.map((mapel) => {
                        const Icon = mapel.icon;

                        const theme =
                          mapel.theme || subjectThemes[0];

                        return (
                          <button
                            key={
                              mapel.kelasMapelId ||
                              mapel.id
                            }
                            type="button"
                            onClick={() =>
                              router.push(
                                `/siswa/mataPelajaran?kelasMapelId=${encodeURIComponent(
                                  mapel.kelasMapelId ||
                                    mapel.id
                                )}&mapel=${encodeURIComponent(
                                  String(
                                    mapel.nama
                                  ).toLowerCase()
                                )}`
                              )
                            }
                            className={`theme-card group relative overflow-hidden rounded-xl border ${themeNeutralBorder} p-4 text-left ${themeCardShadow} transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_color-mix(in_srgb,var(--color-text)_10%,transparent)] ${theme.hover}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.surface} ${theme.text} transition-transform duration-300 group-hover:scale-105`}
                              >
                                <Icon size={20} />
                              </div>

                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] text-[var(--color-text-muted)] transition-all group-hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] group-hover:text-[var(--color-primary)]">
                                <ChevronRight size={16} />
                              </div>
                            </div>

                            <div className="mt-5">
                              <h3 className="theme-text truncate text-sm font-bold">
                                {mapel.nama}
                              </h3>

                              <p className="theme-text-secondary mt-1 truncate text-xs">
                                {mapel.guru}
                              </p>

                              {mapel.kelas && (
                                <p className="theme-text-muted mt-1 truncate text-[11px]">
                                  {mapel.kelas}
                                </p>
                              )}
                            </div>

                            <div
                              className={`mt-4 flex items-center gap-2 border-t ${themeDivider} pt-3`}
                            >
                              <span className="inline-flex items-center gap-1 rounded-md bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-2 py-1 text-[10px] font-semibold theme-text-secondary">
                                <FileText size={10} />
                                {mapel.materi} materi
                              </span>

                              <span className="inline-flex items-center gap-1 rounded-md bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] px-2 py-1 text-[10px] font-semibold text-[var(--color-primary)]">
                                <ClipboardList size={10} />
                                {mapel.tugas} tugas
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
              </div>

              <div
                className={`border-t ${themeDivider} ${themeNeutralSurface} px-5 py-3.5 sm:px-6`}
              >
                <div className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <span className="theme-text-secondary">
                    Menampilkan{" "}
                    <strong className="theme-text font-semibold">
                      {mataPelajaranList.length}
                    </strong>{" "}
                    mata pelajaran
                  </span>

                  <span className="theme-text-muted font-medium">
                    {user.kelasName
                      ? `Kelas ${user.kelasName}`
                      : "Data pembelajaran"}
                  </span>
                </div>
              </div>
            </section>

            {/* =================================================
                LOADING FOOTER
            ================================================= */}

            {loadingDashboard && (
              <div className="theme-text-secondary flex items-center gap-2 text-sm">
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Memuat ringkasan dashboard...
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
