"use client";

import { useCallback, useEffect, useState } from "react";
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
  UserRound,
  Mail,
  Hash,
  BookMarked,
  CalendarCheck,
  XCircle,
  Info,
  CreditCard,
  Award,
  Star,
  Zap,
  Target,
  CircleDot,
} from "lucide-react";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_68%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themeCardShadow =
  "shadow-[0_1px_2px_color-mix(in_srgb,var(--color-text)_4%,transparent),0_8px_28px_-8px_color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeCardHoverShadow =
  "hover:shadow-[0_2px_4px_color-mix(in_srgb,var(--color-text)_5%,transparent),0_18px_48px_-12px_color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_9%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]";

const subjectThemes = [
  {
    surface: "bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]",
    text: "text-[var(--color-primary)]",
    ring: "group-hover:ring-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]",
    glow: "group-hover:shadow-[0_20px_60px_-18px_color-mix(in_srgb,var(--color-primary)_45%,transparent)]",
  },
  {
    surface: "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)]",
    text: "text-[var(--color-success)]",
    ring: "group-hover:ring-[color-mix(in_srgb,var(--color-success)_30%,transparent)]",
    glow: "group-hover:shadow-[0_20px_60px_-18px_color-mix(in_srgb,var(--color-success)_45%,transparent)]",
  },
  {
    surface: "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]",
    text: "text-[var(--color-warning)]",
    ring: "group-hover:ring-[color-mix(in_srgb,var(--color-warning)_30%,transparent)]",
    glow: "group-hover:shadow-[0_20px_60px_-18px_color-mix(in_srgb,var(--color-warning)_45%,transparent)]",
  },
  {
    surface: "bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)]",
    text: "text-[var(--color-info)]",
    ring: "group-hover:ring-[color-mix(in_srgb,var(--color-info)_30%,transparent)]",
    glow: "group-hover:shadow-[0_20px_60px_-18px_color-mix(in_srgb,var(--color-info)_45%,transparent)]",
  },
  {
    surface: "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]",
    text: "text-[var(--color-primary)]",
    ring: "group-hover:ring-[color-mix(in_srgb,var(--color-primary)_26%,transparent)]",
    glow: "group-hover:shadow-[0_20px_60px_-18px_color-mix(in_srgb,var(--color-primary)_40%,transparent)]",
  },
  {
    surface: "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]",
    text: "text-[var(--color-info)]",
    ring: "group-hover:ring-[color-mix(in_srgb,var(--color-info)_26%,transparent)]",
    glow: "group-hover:shadow-[0_20px_60px_-18px_color-mix(in_srgb,var(--color-info)_40%,transparent)]",
  },
];

function normalizeText(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.list)) return response.data.list;
  if (Array.isArray(response?.list)) return response.list;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

function extractObject(response) {
  if (!isObject(response)) return null;

  if (isObject(response.data)) {
    if (isObject(response.data.data)) {
      return response.data.data;
    }
    return response.data;
  }

  return response;
}

function getMapelIcon(nama = "") {
  const value = normalizeText(nama);

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

  if (value.includes("inggris") || value.includes("english")) {
    return BookOpen;
  }

  if (value.includes("seni")) return Palette;
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
  if (!isObject(user)) return "";

  const candidates = [
    user.namaLengkap,
    user.nama,
    user.name,
    user.fullName,
    user.username,
    user.siswa?.namaLengkap,
    user.user?.namaLengkap,
    user.data?.namaLengkap,
  ];

  const result = candidates.find(
    (value) => typeof value === "string" && value.trim()
  );

  return result ? result.trim() : "";
}

function getUserId(user) {
  if (!user) return "";

  return String(
    user.userId ||
      user.id ||
      user.penggunaId ||
      user.siswaId ||
      user.siswa?.id ||
      user.data?.id ||
      ""
  );
}

function getUserKelasId(user) {
  if (!user) return "";

  return String(
    user.kelasId ||
      user.kelas?.id ||
      user.siswa?.kelasId ||
      user.siswa?.kelas?.id ||
      user.data?.kelasId ||
      user.data?.kelas?.id ||
      ""
  );
}

function readSessionUser() {
  const session = getSessionUser();

  if (!isObject(session)) return null;

  return {
    username: getUsername(session),
    email: session.email || "",
    userId: getUserId(session),
    kelasId: getUserKelasId(session),
  };
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

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTanggalHariIni() {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function getAvatarUrl(value) {
  if (!value || typeof value !== "string") return null;
  return value.trim() || null;
}

async function fetchKelasDetail(id) {
  if (!id) return null;

  const result = await getKelasById(id);
  return extractObject(result);
}

async function findStudentClass(userId, existingKelasId = "") {
  if (existingKelasId) {
    try {
      const detail = await fetchKelasDetail(existingKelasId);

      if (detail) return detail;
    } catch (error) {
      console.warn("Gagal mengambil detail kelas:", error);
    }
  }

  const response = await getKelas({
    page: 1,
    limit: 100,
  });

  const daftarKelas = extractArray(response);

  for (const kelas of daftarKelas) {
    if (!kelas?.id) continue;

    try {
      const detail = await fetchKelasDetail(kelas.id);

      if (!detail) continue;

      const anggota = Array.isArray(detail.anggota) ? detail.anggota : [];

      const ditemukan = anggota.some((item) => {
        const siswaId =
          item?.siswa?.id ||
          item?.siswaId ||
          item?.penggunaId ||
          item?.pengguna?.id;

        return String(siswaId || "") === String(userId);
      });

      if (ditemukan) return detail;
    } catch (error) {
      console.warn("Gagal memeriksa kelas:", kelas.id, error);
    }
  }

  return null;
}

async function fetchJumlahTugas(kelasMapelId) {
  if (!kelasMapelId) return 0;

  const result = await getTugasByKelasMapel(kelasMapelId);
  return extractArray(result).length;
}

async function fetchSemuaMateri() {
  const result = await getMateriPembelajaran();
  return extractArray(result);
}

function normalizeKelasMapel(
  item,
  index,
  kelasId,
  kelasName,
  jumlahMateri,
  jumlahTugas
) {
  const nama =
    item?.mataPelajaran?.nama ||
    item?.mataPelajaran?.namaMapel ||
    item?.mataPelajaran?.namaMataPelajaran ||
    item?.namaMataPelajaran ||
    item?.namaMapel ||
    item?.nama ||
    "Mata Pelajaran";

  const guru =
    item?.guruPengajar?.namaLengkap ||
    item?.guruPengajar?.nama ||
    item?.guru?.namaLengkap ||
    item?.guru?.nama ||
    "Guru belum tersedia";

  return {
    id: item.id || `mapel-${index}`,
    kelasMapelId: item.id || "",
    kelasId: item.kelasId || item.kelas?.id || kelasId,
    kelas: kelasName,
    nama: String(nama),
    guru: String(guru),
    icon: getMapelIcon(nama),
    theme: getMapelTheme(index),
    materi: Number(jumlahMateri) || 0,
    tugas: Number(jumlahTugas) || 0,
  };
}

function EmptyState({ icon: Icon = Info, title, description }) {
  return (
    <div className="flex min-h-[170px] flex-col items-center justify-center px-6 py-10 text-center">
      <div
        className={`relative flex h-14 w-14 items-center justify-center rounded-2xl ${themeNeutralSurface} ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-text)_6%,transparent)]`}
      >
        <Icon size={23} className="theme-text-secondary" />
        <span className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,color-mix(in_srgb,var(--color-primary)_10%,transparent),transparent_70%)]" />
      </div>

      <p className="theme-text mt-4 text-sm font-semibold tracking-tight">
        {title}
      </p>

      {description && (
        <p className="theme-text-secondary mt-1.5 max-w-sm text-xs leading-5">
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
  iconClass,
  rightContent,
}) {
  return (
    <div
      className={`flex flex-col gap-3 border-b ${themeDivider} px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-text)_5%,transparent)] ${
            iconClass || `${themePrimarySoft} ${themePrimaryText}`
          }`}
        >
          <Icon size={20} />
        </div>

        <div>
          <h2 className="theme-text text-base font-bold tracking-tight">
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

function LoadingState({ text = "Memuat data..." }) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-10 theme-text-secondary text-sm sm:px-6">
      <Loader2 size={17} className="animate-spin" />
      {text}
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  surface,
  color,
  accent,
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border ${themeNeutralBorder} bg-[color-mix(in_srgb,var(--color-card)_92%,transparent)] p-5 backdrop-blur-sm ${themeCardShadow} transition-all duration-300 hover:-translate-y-0.5 ${themeCardHoverShadow}`}
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-70 ${
          accent || "bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]"
        }`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-secondary text-[11px] font-semibold uppercase tracking-wider">
            {title}
          </p>

          <p
            className={`mt-2.5 break-words text-2xl font-bold tracking-tight ${
              color || "theme-text"
            }`}
          >
            {value}
          </p>

          <p className="theme-text-muted mt-1.5 text-xs">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition-transform duration-300 group-hover:scale-105 ${
            surface || themePrimarySoft
          } ${color || themePrimaryText}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ value = 0, size = 108, stroke = 9 }) {
  const safe = Math.min(100, Math.max(0, Number(value) || 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safe / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-[color-mix(in_srgb,var(--color-text)_8%,transparent)]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-[var(--color-success)] transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tracking-tight text-[var(--color-success)]">
          {safe}%
        </span>
      </div>
    </div>
  );
}

export default function SiswaDashboardPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  const [user, setUser] = useState({
    username: "",
    email: "",
    userId: "",
    kelasId: "",
  });

  const [dashboard, setDashboard] = useState(null);

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const [mataPelajaranList, setMataPelajaranList] = useState([]);
  const [loadingMapel, setLoadingMapel] = useState(true);
  const [mapelError, setMapelError] = useState("");

  useEffect(() => {
    setMounted(true);

    const syncUser = () => {
      const session = readSessionUser();

      if (session) {
        setUser((previous) => ({
          ...previous,
          ...session,
        }));
      }
    };

    syncUser();

    const unsubscribe = subscribeAuth(syncUser);

    return () => unsubscribe();
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      setLoadingDashboard(true);
      setDashboardError("");

      if (!getToken()) {
        router.replace("/login?sessionExpired=1");
        return;
      }

      const data = await getDashboardSiswa();

      setDashboard(data);

      setUser((previous) => ({
        ...previous,
        username: data.profil.namaLengkap || previous.username,
        email: data.profil.email || previous.email,
        userId: data.profil.id || previous.userId,
        kelasId: data.kelas?.id || previous.kelasId,
      }));
    } catch (error) {
      console.error("[DASHBOARD SISWA]", error);

      if (error?.status === 401) {
        router.replace("/login?sessionExpired=1");
        return;
      }

      setDashboardError(
        error?.message || "Gagal mengambil dashboard siswa."
      );
    } finally {
      setLoadingDashboard(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

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

        const session = readSessionUser();
        const userId = dashboard?.profil?.id || session?.userId;

        if (!userId) {
          if (dashboardError) {
            setMapelError("Data siswa belum berhasil dimuat.");
          }
          return;
        }

        let kelasSiswa = null;

        if (dashboard?.kelas?.id) {
          try {
            kelasSiswa = await fetchKelasDetail(dashboard.kelas.id);
          } catch (error) {
            console.warn("Gagal mengambil detail kelas:", error);
          }
        }

        if (!kelasSiswa) {
          kelasSiswa = await findStudentClass(
            userId,
            dashboard?.kelas?.id || session?.kelasId
          );
        }

        if (cancelled) return;

        if (!kelasSiswa) {
          setMataPelajaranList([]);
          setMapelError(
            "Kelas siswa belum ditemukan. Hubungi Admin Sekolah untuk memastikan siswa sudah dimasukkan ke kelas."
          );
          return;
        }

        const kelasId = String(kelasSiswa.id || dashboard?.kelas?.id);

        const kelasName =
          kelasSiswa.nama ||
          kelasSiswa.namaKelas ||
          dashboard?.kelas?.nama ||
          "Kelas siswa";

        const kelasMapel = Array.isArray(kelasSiswa.kelasMapel)
          ? kelasSiswa.kelasMapel.filter((item) => item?.dihapusPada == null)
          : [];

        if (kelasMapel.length === 0) {
          setMataPelajaranList([]);
          setMapelError(
            `Belum ada mata pelajaran yang terhubung dengan ${kelasName}.`
          );
          return;
        }

        const [materiData, tugasCounts] = await Promise.all([
          fetchSemuaMateri(),
          Promise.all(kelasMapel.map((item) => fetchJumlahTugas(item?.id))),
        ]);

        if (cancelled) return;

        const normalized = kelasMapel.map((item, index) => {
          const kelasMapelId = item.id;

          const jumlahMateri = materiData.filter((materi) => {
            const materiKelasMapelId =
              materi?.kelasMapelId ??
              materi?.kelas_mapel_id ??
              materi?.kelasMapel?.id;

            return (
              materiKelasMapelId != null &&
              String(materiKelasMapelId) === String(kelasMapelId)
            );
          }).length;

          return normalizeKelasMapel(
            item,
            index,
            kelasId,
            kelasName,
            jumlahMateri,
            tugasCounts[index]
          );
        });

        setMataPelajaranList(normalized);
      } catch (error) {
        if (cancelled) return;

        console.error("[MATA PELAJARAN]", error);

        if (error?.status === 401) {
          router.replace("/login?sessionExpired=1");
          return;
        }

        setMataPelajaranList([]);
        setMapelError(error?.message || "Gagal mengambil mata pelajaran.");
      } finally {
        if (!cancelled) {
          setLoadingMapel(false);
        }
      }
    }

    if (!loadingDashboard) {
      loadMataPelajaran();
    }

    return () => {
      cancelled = true;
    };
  }, [dashboard, dashboardError, loadingDashboard, router]);

  const profil = dashboard?.profil;
  const kelas = dashboard?.kelas;
  const kehadiran = dashboard?.kehadiranBulanIni;

  const jadwal = dashboard?.jadwalHariIni || [];
  const tugas = dashboard?.tugasMendatang || [];
  const nilai = dashboard?.nilaiTerbaru || [];

  const tagihan = dashboard?.tagihan;
  const tabungan = dashboard?.tabungan;
  const pelanggaran = dashboard?.pelanggaran;

  const username = profil?.namaLengkap || user.username || "Siswa";

  const kelasName = kelas?.nama || "Kelas belum tersedia";

  const avatar = getAvatarUrl(profil?.avatar);

  const totalMateri = mataPelajaranList.reduce(
    (total, item) => total + item.materi,
    0
  );

  const totalTugasMapel = mataPelajaranList.reduce(
    (total, item) => total + item.tugas,
    0
  );

  return (
    <div className="flex h-screen overflow-hidden theme-page theme-text">
      <div className="flex min-h-0 flex-1 flex-col">
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div
            className={`relative w-full space-y-6 p-4 transition-all duration-700 sm:p-6 lg:p-8 ${
              mounted
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--color-primary)_7%,transparent),transparent_60%)]" />

            <section className="theme-card relative isolate overflow-hidden rounded-3xl border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] shadow-[0_1px_2px_color-mix(in_srgb,var(--color-text)_4%,transparent),0_24px_70px_-24px_color-mix(in_srgb,var(--color-primary)_28%,transparent)]">
              <div className="absolute inset-0 -z-30 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-card)_96%,transparent),color-mix(in_srgb,var(--color-primary)_4%,var(--color-card)))]" />

              <div className="absolute inset-0 -z-20 opacity-[0.35] [background-image:radial-gradient(color-mix(in_srgb,var(--color-text)_18%,transparent)_1px,transparent_1px)] [background-size:22px_22px]" />

              <div className="absolute -right-28 -top-32 -z-10 h-96 w-96 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] blur-3xl" />

              <div className="absolute -bottom-40 right-[18%] -z-10 h-96 w-96 rounded-full bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] blur-3xl" />

              <div className="absolute -left-24 top-1/3 -z-10 h-72 w-72 rounded-full bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)] blur-3xl" />

              <div className="relative z-10 flex flex-col gap-7 px-5 py-8 sm:px-8 sm:py-10 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-12">
                <div className="max-w-2xl">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_88%,transparent)] px-3.5 py-1.5 shadow-[0_2px_10px_-2px_color-mix(in_srgb,var(--color-primary)_25%,transparent)] backdrop-blur-md">
                    <Sparkles size={14} className={themePrimaryText} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">
                      SmartSchool Student
                    </span>
                    <span className="h-1 w-1 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_50%,transparent)]" />
                    <span className="theme-text-secondary text-[10px] font-medium">
                      Dashboard Siswa
                    </span>
                  </div>

                  <h1 className="theme-text text-[26px] font-bold leading-tight tracking-tight sm:text-3xl lg:text-[38px]">
                    Selamat datang kembali,
                    <span className="mt-1.5 block bg-[linear-gradient(90deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_60%,var(--color-info)),var(--color-info))] bg-clip-text text-transparent">
                      {username}
                    </span>
                  </h1>

                  <p className="theme-text-secondary mt-3.5 max-w-xl text-sm leading-6">
                    Pantau pembelajaran, tugas, kehadiran, dan perkembangan
                    akademikmu dalam satu tempat yang rapi dan menyenangkan.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_80%,transparent)] px-3 py-2 text-xs backdrop-blur-sm">
                      <GraduationCap size={15} className={themePrimaryText} />
                      <span className="theme-text font-medium">{kelasName}</span>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_80%,transparent)] px-3 py-2 text-xs backdrop-blur-sm">
                      <CalendarDays size={15} className={themePrimaryText} />
                      <span className="theme-text font-medium">
                        {kelas?.tahunAjaran?.tahunAjaran
                          ? `Tahun Ajaran ${kelas.tahunAjaran.tahunAjaran}`
                          : "Tahun ajaran belum tersedia"}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_80%,transparent)] px-3 py-2 text-xs backdrop-blur-sm">
                      <CalendarCheck size={15} className={themePrimaryText} />
                      <span className="theme-text font-medium">
                        {formatTanggalHariIni()}
                      </span>
                    </div>
                  </div>

                  {dashboardError && (
                    <div
                      className={`mt-6 rounded-xl border ${themeWarningBorder} ${themeWarningSurface} p-4 backdrop-blur-sm`}
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertCircle
                          size={18}
                          className="mt-0.5 shrink-0 text-[var(--color-warning)]"
                        />
                        <div>
                          <p className="theme-text text-sm font-semibold">
                            Dashboard belum dapat dimuat
                          </p>
                          <p className="theme-text-secondary mt-1 text-xs leading-5">
                            {dashboardError}
                          </p>
                          <button
                            type="button"
                            onClick={loadDashboard}
                            className={`mt-2.5 inline-flex items-center gap-2 text-xs font-semibold ${themePrimaryText} transition-opacity hover:opacity-75`}
                          >
                            <RefreshCw size={13} />
                            Coba lagi
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full max-w-sm rounded-3xl border border-[color-mix(in_srgb,var(--color-text)_9%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_78%,transparent)] p-5 shadow-[0_8px_40px_-12px_color-mix(in_srgb,var(--color-text)_15%,transparent)] backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={username}
                        className="h-16 w-16 rounded-2xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] object-cover shadow-sm ring-2 ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
                      />
                    ) : (
                      <div
                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${themePrimaryGradient} text-white shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--color-primary)_60%,transparent)]`}
                      >
                        <UserRound size={30} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="theme-text truncate font-bold">
                        {username}
                      </p>
                      <p className="theme-text-secondary mt-1 flex items-center gap-1 truncate text-xs">
                        <Mail size={11} className="shrink-0" />
                        {profil?.email || user.email || "-"}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-success)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-success)_20%,transparent)]">
                        <CircleDot size={9} />
                        Siswa
                      </span>
                    </div>
                  </div>

                  <div
                    className={`mt-4 grid grid-cols-2 gap-3 border-t ${themeDivider} pt-4`}
                  >
                    <div className={`rounded-xl ${themeNeutralSurface} px-3 py-2.5`}>
                      <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                        NIS
                      </p>
                      <p className="theme-text mt-1 truncate text-sm font-bold">
                        {profil?.nis || "-"}
                      </p>
                    </div>

                    <div className={`rounded-xl ${themeNeutralSurface} px-3 py-2.5`}>
                      <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                        NISN
                      </p>
                      <p className="theme-text mt-1 truncate text-sm font-bold">
                        {profil?.nisn || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 h-1 w-full bg-[linear-gradient(90deg,var(--color-primary),var(--color-info),var(--color-success),var(--color-primary))] opacity-90" />
            </section>

            <section
              className={`theme-card rounded-2xl border ${themeNeutralBorder} bg-[color-mix(in_srgb,var(--color-card)_92%,transparent)] p-5 backdrop-blur-sm ${themeCardShadow} sm:p-6`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText} ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]`}
                >
                  <School size={20} />
                </div>
                <div>
                  <h2 className="theme-text text-base font-bold tracking-tight">
                    Informasi Kelas
                  </h2>
                  <p className="theme-text-secondary text-xs">
                    Informasi akademik dan wali kelas
                  </p>
                </div>
              </div>

              {loadingDashboard ? (
                <LoadingState text="Memuat informasi kelas..." />
              ) : kelas ? (
                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                  {[
                    { label: "Nama Kelas", value: kelas.nama, icon: School },
                    { label: "Tingkat", value: kelas.tingkat, icon: GraduationCap },
                    { label: "Shift", value: kelas.shift || "-", icon: Clock3 },
                    { label: "Wali Kelas", value: kelas.waliKelas || "-", icon: UserRound },
                    {
                      label: "Tahun Ajaran",
                      value: kelas.tahunAjaran?.tahunAjaran || "-",
                      icon: CalendarDays,
                    },
                    {
                      label: "Semester",
                      value: kelas.tahunAjaran?.semester || "-",
                      icon: CalendarCheck,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className={`group rounded-xl border border-transparent ${themeNeutralSurface} p-3.5 transition-all duration-300 hover:border-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)]`}
                      >
                        <Icon
                          size={17}
                          className={`${themePrimaryText} transition-transform duration-300 group-hover:scale-110`}
                        />
                        <p className="theme-text-muted mt-3 text-[10px] font-semibold uppercase tracking-wider">
                          {item.label}
                        </p>
                        <p className="theme-text mt-1 break-words text-sm font-semibold">
                          {item.value || "-"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={School}
                  title="Belum terdaftar di kelas"
                  description="Informasi kelas belum tersedia pada akun siswa."
                />
              )}
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Kehadiran"
                value={
                  loadingDashboard ? "..." : `${kehadiran?.persentase ?? 0}%`
                }
                description="Persentase bulan ini"
                icon={ClipboardCheck}
                surface={themeSuccessSurface}
                color="text-[var(--color-success)]"
                accent="bg-[color-mix(in_srgb,var(--color-success)_20%,transparent)]"
              />

              <StatCard
                title="Tugas Mendatang"
                value={loadingDashboard ? "..." : tugas.length}
                description="Belum dikumpulkan"
                icon={ClipboardList}
                surface={themeWarningSurface}
                color="text-[var(--color-warning)]"
                accent="bg-[color-mix(in_srgb,var(--color-warning)_20%,transparent)]"
              />

              <StatCard
                title="Rata-rata Nilai"
                value={loadingDashboard ? "..." : dashboard?.rataRataNilai ?? 0}
                description="Nilai akhir seluruh mapel"
                icon={Award}
                surface={themePrimarySoft}
                color={themePrimaryText}
                accent="bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]"
              />

              <StatCard
                title="Notifikasi"
                value={
                  loadingDashboard ? "..." : dashboard?.notifikasiBelumDibaca ?? 0
                }
                description="Belum dibaca"
                icon={Bell}
                surface={themePrimarySoft}
                color={themePrimaryText}
                accent="bg-[color-mix(in_srgb,var(--color-info)_18%,transparent)]"
              />
            </section>

            <section
              className={`theme-card rounded-2xl border ${themeNeutralBorder} bg-[color-mix(in_srgb,var(--color-card)_92%,transparent)] p-5 backdrop-blur-sm ${themeCardShadow} sm:p-6`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="theme-text text-lg font-bold tracking-tight">
                    Rekap Kehadiran
                  </h2>
                  <p className="theme-text-secondary mt-1 text-xs">
                    Rekap absensi bulan ini
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${themeSuccessSurface} text-[var(--color-success)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-success)_14%,transparent)]`}
                >
                  <ClipboardCheck size={21} />
                </div>
              </div>

              {loadingDashboard ? (
                <LoadingState text="Memuat rekap kehadiran..." />
              ) : (
                <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
                  <div className="flex shrink-0 flex-col items-center gap-3">
                    <ProgressRing value={kehadiran?.persentase ?? 0} />
                    <div className="text-center">
                      <p className="theme-text-secondary text-xs font-medium">
                        Persentase kehadiran
                      </p>
                      <p className="theme-text-muted mt-1 text-xs">
                        Total {kehadiran?.total ?? 0} absensi
                      </p>
                    </div>
                  </div>

                  <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      {
                        label: "Hadir",
                        value: kehadiran?.hadir ?? 0,
                        color: "text-[var(--color-success)]",
                        surface: themeSuccessSurface,
                      },
                      {
                        label: "Izin",
                        value: kehadiran?.izin ?? 0,
                        color: "text-[var(--color-info)]",
                        surface:
                          "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",
                      },
                      {
                        label: "Sakit",
                        value: kehadiran?.sakit ?? 0,
                        color: "text-[var(--color-warning)]",
                        surface: themeWarningSurface,
                      },
                      {
                        label: "Alpha",
                        value: kehadiran?.alpha ?? 0,
                        color: "text-[var(--color-danger)]",
                        surface: themeDangerSurface,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`rounded-xl border border-transparent ${item.surface} p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]`}
                      >
                        <p className="theme-text-secondary text-[11px] font-semibold uppercase tracking-wider">
                          {item.label}
                        </p>
                        <p className={`mt-2 text-2xl font-bold tracking-tight ${item.color}`}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section
              className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} bg-[color-mix(in_srgb,var(--color-card)_92%,transparent)] backdrop-blur-sm ${themeCardShadow}`}
            >
              <SectionHeader
                icon={CalendarClock}
                title="Jadwal Hari Ini"
                description="Jadwal pelajaran sesuai kelasmu"
                rightContent={
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-2.5 py-1 text-[11px] font-semibold theme-text-secondary">
                    <CalendarDays size={11} />
                    {jadwal.length} jadwal
                  </span>
                }
              />

              {loadingDashboard ? (
                <LoadingState text="Memuat jadwal pelajaran..." />
              ) : jadwal.length > 0 ? (
                <div className={`divide-y ${themeDivider}`}>
                  {jadwal.map((item) => (
                    <div
                      key={item.id}
                      className="group flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_3%,transparent)] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3.5">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText} ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] transition-transform duration-300 group-hover:scale-105`}
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
                            {item.ruangan || "Ruangan belum ditentukan"}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`flex shrink-0 items-center gap-2 self-start rounded-lg border border-[color-mix(in_srgb,var(--color-text)_7%,transparent)] ${themeNeutralSurface} px-3 py-2 sm:self-center`}
                      >
                        <Clock3 size={14} className={themePrimaryText} />
                        <span className="theme-text text-xs font-semibold tabular-nums">
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

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div
                className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} bg-[color-mix(in_srgb,var(--color-card)_92%,transparent)] backdrop-blur-sm ${themeCardShadow}`}
              >
                <SectionHeader
                  icon={ClipboardList}
                  title="Tugas Mendatang"
                  description="Tugas yang belum dikumpulkan"
                  iconClass={`${themeWarningSurface} text-[var(--color-warning)]`}
                  rightContent={
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--color-warning)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-warning)]">
                      <ClipboardList size={11} />
                      {tugas.length} tugas
                    </span>
                  }
                />

                {loadingDashboard ? (
                  <LoadingState text="Memuat tugas..." />
                ) : tugas.length > 0 ? (
                  <div className={`divide-y ${themeDivider}`}>
                    {tugas.map((item) => (
                      <div
                        key={item.id}
                        className="group px-5 py-4 transition-colors hover:bg-[color-mix(in_srgb,var(--color-warning)_3%,transparent)] sm:px-6"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="theme-text text-sm font-semibold">
                              {item.judul}
                            </p>
                            <p className="theme-text-secondary mt-2 flex items-center gap-1.5 text-xs">
                              <BookOpen size={12} />
                              {item.mataPelajaran}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-lg ${themeWarningSurface} px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-warning)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-warning)_14%,transparent)]`}
                          >
                            Belum dikumpulkan
                          </span>
                        </div>

                        <p className="theme-text-muted mt-3 flex items-center gap-1.5 text-xs">
                          <CalendarDays size={12} />
                          Batas: {formatTanggal(item.batasWaktu)}
                        </p>
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

              <div
                className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} bg-[color-mix(in_srgb,var(--color-card)_92%,transparent)] backdrop-blur-sm ${themeCardShadow}`}
              >
                <SectionHeader
                  icon={GraduationCap}
                  title="Nilai Terbaru"
                  description="Hasil penilaian akademik"
                  iconClass={`${themeSuccessSurface} text-[var(--color-success)]`}
                />

                <div
                  className={`relative overflow-hidden border-b ${themeDivider} px-5 py-5 sm:px-6`}
                >
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] blur-2xl" />

                  <div className="relative">
                    <p className="theme-text-secondary text-xs font-medium">
                      Rata-rata nilai akhir
                    </p>
                    <div className="mt-1.5 flex items-baseline gap-2.5">
                      <p className={`text-4xl font-bold tracking-tight ${themePrimaryText}`}>
                        {dashboard?.rataRataNilai ?? 0}
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-md bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-success)]">
                        <TrendingUp size={11} />
                        Aktif
                      </span>
                    </div>
                  </div>
                </div>

                {loadingDashboard ? (
                  <LoadingState text="Memuat nilai..." />
                ) : nilai.length > 0 ? (
                  <div className={`divide-y ${themeDivider}`}>
                    {nilai.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-[color-mix(in_srgb,var(--color-success)_3%,transparent)] sm:px-6"
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
                          className={`shrink-0 rounded-xl ${themeSuccessSurface} px-3.5 py-2 text-sm font-bold text-[var(--color-success)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-success)_14%,transparent)]`}
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

            <section>
              <div className="mb-4 flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}>
                  <Wallet size={16} />
                </div>
                <div>
                  <h2 className="theme-text text-lg font-bold tracking-tight">
                    Keuangan Siswa
                  </h2>
                  <p className="theme-text-secondary mt-0.5 text-xs">
                    Ringkasan tagihan dan tabungan sekolah
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div
                  className={`theme-card relative overflow-hidden rounded-2xl border ${themeNeutralBorder} bg-[color-mix(in_srgb,var(--color-card)_92%,transparent)] p-5 backdrop-blur-sm ${themeCardShadow} sm:p-6`}
                >
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] blur-2xl" />

                  <div className="relative flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${themeWarningSurface} text-[var(--color-warning)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]`}
                    >
                      <Wallet size={21} />
                    </div>

                    <span className="theme-text-muted text-[11px] font-semibold uppercase tracking-wider">
                      Tagihan sekolah
                    </span>
                  </div>

                  <p className="theme-text-secondary mt-5 text-xs font-medium">
                    Total sisa tagihan
                  </p>

                  <p className="theme-text mt-1.5 break-words text-2xl font-bold tracking-tight sm:text-3xl">
                    {loadingDashboard ? "..." : formatRupiah(tagihan?.totalSisa)}
                  </p>

                  <p className="theme-text-secondary mt-2 text-xs">
                    {tagihan?.jumlahBelumLunas ?? 0} tagihan belum lunas
                  </p>

                  {tagihan?.terdekat ? (
                    <div
                      className={`mt-5 rounded-xl border border-[color-mix(in_srgb,var(--color-warning)_14%,transparent)] ${themeWarningSurface} p-4`}
                    >
                      <div className="flex items-center gap-2 text-[var(--color-warning)]">
                        <CalendarClock size={15} />
                        <p className="text-xs font-bold uppercase tracking-wide">
                          Tagihan Terdekat
                        </p>
                      </div>

                      <p className="theme-text mt-3 text-sm font-semibold">
                        {tagihan.terdekat.kategori}
                      </p>

                      <p className="theme-text-secondary mt-1 text-xs">
                        Nomor: {tagihan.terdekat.nomorTagihan}
                      </p>

                      <div className="mt-3 flex flex-wrap justify-between gap-2">
                        <div>
                          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                            Jatuh tempo
                          </p>
                          <p className="theme-text mt-1 text-xs font-semibold">
                            {formatTanggal(tagihan.terdekat.jatuhTempo)}
                          </p>
                        </div>

                        <div>
                          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                            Sisa pembayaran
                          </p>
                          <p className="theme-text mt-1 text-xs font-bold">
                            {formatRupiah(tagihan.terdekat.sisa)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`mt-5 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_14%,transparent)] ${themeSuccessSurface} p-4`}
                    >
                      <div className="flex items-center gap-2 text-[var(--color-success)]">
                        <CheckCircle2 size={17} />
                        <p className="text-xs font-semibold">
                          Tidak ada tagihan yang belum lunas
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={`theme-card relative overflow-hidden rounded-2xl border ${themeNeutralBorder} bg-[color-mix(in_srgb,var(--color-card)_92%,transparent)] p-5 backdrop-blur-sm ${themeCardShadow} sm:p-6`}
                >
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] blur-2xl" />

                  <div className="relative flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText} ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]`}
                    >
                      <Banknote size={21} />
                    </div>

                    <span className="theme-text-muted text-[11px] font-semibold uppercase tracking-wider">
                      Tabungan siswa
                    </span>
                  </div>

                  <p className="theme-text-secondary mt-5 text-xs font-medium">
                    Saldo tabungan saat ini
                  </p>

                  <p className="theme-text mt-1.5 break-words text-2xl font-bold tracking-tight sm:text-3xl">
                    {loadingDashboard ? "..." : formatRupiah(tabungan?.saldo)}
                  </p>

                  <p className="theme-text-secondary mt-2 text-xs">
                    Informasi saldo tabungan siswa
                  </p>

                  <div
                    className={`mt-5 rounded-xl border border-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] ${themePrimarySoft} p-4`}
                  >
                    <div className={`flex items-center gap-2 ${themePrimaryText}`}>
                      <CreditCard size={16} />
                      <p className="text-xs font-bold uppercase tracking-wide">
                        Ringkasan tabungan
                      </p>
                    </div>
                    <p className="theme-text-secondary mt-2 text-xs leading-5">
                      Saldo ditampilkan berdasarkan data tabungan yang tercatat
                      pada sistem sekolah.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div
                className={`theme-card relative overflow-hidden rounded-2xl border ${themeNeutralBorder} bg-[color-mix(in_srgb,var(--color-card)_92%,transparent)] p-5 backdrop-blur-sm ${themeCardShadow} sm:p-6`}
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] blur-2xl" />

                <div className="relative flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${themeWarningSurface} text-[var(--color-warning)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]`}
                  >
                    <ShieldAlert size={21} />
                  </div>
                  <span className="theme-text-muted text-[11px] font-semibold uppercase tracking-wider">
                    Kedisiplinan
                  </span>
                </div>

                <p className="theme-text-secondary mt-5 text-xs font-medium">
                  Jumlah pelanggaran
                </p>

                <p className="theme-text mt-1.5 text-3xl font-bold tracking-tight">
                  {loadingDashboard ? "..." : pelanggaran?.jumlah ?? 0}
                </p>

                <div
                  className={`mt-4 flex items-center justify-between rounded-xl ${themeNeutralSurface} p-3.5`}
                >
                  <span className="theme-text-secondary text-xs">
                    Total poin pelanggaran
                  </span>
                  <span className="theme-text text-sm font-bold">
                    {pelanggaran?.totalPoin ?? 0} poin
                  </span>
                </div>
              </div>

              <div
                className={`theme-card relative overflow-hidden rounded-2xl border ${themeNeutralBorder} bg-[color-mix(in_srgb,var(--color-card)_92%,transparent)] p-5 backdrop-blur-sm ${themeCardShadow} sm:p-6`}
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] blur-2xl" />

                <div className="relative flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText} ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]`}
                  >
                    <Bell size={21} />
                  </div>
                  <span className="theme-text-muted text-[11px] font-semibold uppercase tracking-wider">
                    Informasi
                  </span>
                </div>

                <p className="theme-text-secondary mt-5 text-xs font-medium">
                  Notifikasi belum dibaca
                </p>

                <p className="theme-text mt-1.5 text-3xl font-bold tracking-tight">
                  {loadingDashboard ? "..." : dashboard?.notifikasiBelumDibaca ?? 0}
                </p>

                <div
                  className={`mt-4 flex items-center justify-between rounded-xl ${themeNeutralSurface} p-3.5`}
                >
                  <span className="theme-text-secondary text-xs">
                    Status notifikasi
                  </span>
                  <span className="theme-text text-xs font-semibold">
                    {(dashboard?.notifikasiBelumDibaca ?? 0) > 0
                      ? "Perlu diperiksa"
                      : "Sudah diperiksa"}
                  </span>
                </div>
              </div>
            </section>

            <section
              className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} bg-[color-mix(in_srgb,var(--color-card)_92%,transparent)] backdrop-blur-sm ${themeCardShadow}`}
            >
              <div className={`border-b ${themeDivider} px-5 py-5 sm:px-6`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText} ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]`}
                    >
                      <BookOpen size={19} />
                    </div>

                    <div>
                      <h2 className="theme-text text-lg font-bold tracking-tight">
                        Mata Pelajaran
                      </h2>
                      <p className="theme-text-secondary mt-0.5 text-xs">
                        {kelasName}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/siswa/mataPelajaran")}
                    className={`group inline-flex items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} bg-[color-mix(in_srgb,var(--color-card)_90%,transparent)] px-4 py-2.5 text-sm font-semibold theme-text-secondary transition-all hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)] hover:text-[var(--color-primary)] ${themeNeutralHover} hover:shadow-sm`}
                  >
                    Lihat semua
                    <ArrowUpRight
                      size={15}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </button>
                </div>

                {!loadingMapel && mataPelajaranList.length > 0 && (
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div
                      className={`rounded-xl border border-transparent ${themeNeutralSurface} p-3.5 transition-colors hover:border-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]`}
                    >
                      <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                        Mata pelajaran
                      </p>
                      <p className="theme-text mt-1.5 text-2xl font-bold tracking-tight">
                        {mataPelajaranList.length}
                      </p>
                    </div>

                    <div
                      className={`rounded-xl border border-transparent ${themeNeutralSurface} p-3.5 transition-colors hover:border-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]`}
                    >
                      <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                        Total materi
                      </p>
                      <p className="theme-text mt-1.5 text-2xl font-bold tracking-tight">
                        {totalMateri}
                      </p>
                    </div>

                    <div
                      className={`rounded-xl border border-transparent ${themeNeutralSurface} p-3.5 transition-colors hover:border-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]`}
                    >
                      <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                        Total tugas
                      </p>
                      <p className="theme-text mt-1.5 text-2xl font-bold tracking-tight">
                        {totalTugasMapel}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 sm:p-6">
                {loadingMapel && (
                  <div className="flex min-h-[220px] flex-col items-center justify-center">
                    <div className="relative">
                      <Loader2
                        size={30}
                        className={`animate-spin ${themePrimaryText}`}
                      />
                      <span className="absolute inset-0 animate-ping rounded-full bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] opacity-20" />
                    </div>
                    <p className="theme-text mt-5 text-sm font-semibold">
                      Memuat mata pelajaran...
                    </p>
                    <p className="theme-text-muted mt-1 text-xs">
                      Mengambil data pembelajaran dari server
                    </p>
                  </div>
                )}

                {!loadingMapel && mapelError && mataPelajaranList.length === 0 && (
                  <div
                    className={`flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed ${themeWarningBorder} ${themeWarningSurface} px-6 py-8 text-center`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)]">
                      <AlertCircle
                        size={24}
                        className="text-[var(--color-warning)]"
                      />
                    </div>
                    <h3 className="theme-text mt-4 text-sm font-bold">
                      Data mata pelajaran belum tersedia
                    </h3>
                    <p className="theme-text-secondary mt-2 max-w-md text-xs leading-5">
                      {mapelError}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMapelError("");
                        setLoadingMapel(true);
                        loadDashboard();
                      }}
                      className={`mt-4 inline-flex items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_80%,transparent)] px-3.5 py-2 text-xs font-semibold ${themePrimaryText} transition-all hover:-translate-y-0.5 hover:shadow-sm`}
                    >
                      <RefreshCw size={14} />
                      Muat ulang
                    </button>
                  </div>
                )}

                {!loadingMapel && !mapelError && mataPelajaranList.length === 0 && (
                  <EmptyState
                    icon={BookOpen}
                    title="Belum ada mata pelajaran"
                    description="Belum ada mata pelajaran yang terhubung dengan kelas kamu."
                  />
                )}

                {!loadingMapel && mataPelajaranList.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {mataPelajaranList.map((mapel) => {
                      const Icon = mapel.icon;
                      const theme = mapel.theme || subjectThemes[0];

                      return (
                        <button
                          key={mapel.kelasMapelId || mapel.id}
                          type="button"
                          onClick={() =>
                            router.push(
                              `/siswa/mataPelajaran?kelasMapelId=${encodeURIComponent(mapel.kelasMapelId)}&mapel=${encodeURIComponent(normalizeText(mapel.nama))}`
                            )
                          }
                          className={`theme-card group relative overflow-hidden rounded-2xl border ${themeNeutralBorder} bg-[color-mix(in_srgb,var(--color-card)_94%,transparent)] p-4 text-left ${themeCardShadow} ring-1 ring-inset ring-transparent transition-all duration-300 hover:-translate-y-1 ${theme.ring} ${theme.glow}`}
                        >
                          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                          <div className="relative flex items-start justify-between gap-3">
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.surface} ${theme.text} ring-1 ring-inset ring-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition-transform duration-300 group-hover:scale-110`}
                            >
                              <Icon size={20} />
                            </div>

                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full ${themeNeutralSurface} theme-text-secondary transition-all duration-300 group-hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] group-hover:${themePrimaryText}`}
                            >
                              <ChevronRight
                                size={16}
                                className="transition-transform duration-300 group-hover:translate-x-0.5"
                              />
                            </div>
                          </div>

                          <div className="relative mt-5">
                            <h3 className="theme-text truncate text-sm font-bold tracking-tight">
                              {mapel.nama}
                            </h3>
                            <p className="theme-text-secondary mt-1 truncate text-xs">
                              {mapel.guru}
                            </p>
                            <p className="theme-text-muted mt-1 truncate text-[11px]">
                              {mapel.kelas}
                            </p>
                          </div>

                          <div
                            className={`relative mt-4 flex flex-wrap items-center gap-2 border-t ${themeDivider} pt-3`}
                          >
                            <span
                              className={`inline-flex items-center gap-1 rounded-md ${themeNeutralSurface} px-2 py-1 text-[10px] font-semibold theme-text-secondary`}
                            >
                              <FileText size={10} />
                              {mapel.materi} materi
                            </span>

                            <span
                              className={`inline-flex items-center gap-1 rounded-md ${themePrimarySoft} px-2 py-1 text-[10px] font-semibold ${themePrimaryText}`}
                            >
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
                    {kelasName}
                  </span>
                </div>
              </div>
            </section>

            <div
              className={`flex flex-col gap-2 border-t ${themeDivider} pt-5 sm:flex-row sm:items-center sm:justify-between`}
            >
              <p className="theme-text-muted flex items-center gap-1.5 text-xs">
                <Sparkles size={12} className={themePrimaryText} />
                SmartSchool · Dashboard Siswa
              </p>

              <button
                type="button"
                onClick={() => {
                  loadDashboard();
                }}
                disabled={loadingDashboard}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} bg-[color-mix(in_srgb,var(--color-card)_80%,transparent)] px-3.5 py-2 text-xs font-semibold theme-text-secondary transition-all hover:-translate-y-0.5 hover:text-[var(--color-primary)] ${themeNeutralHover} disabled:opacity-50`}
              >
                <RefreshCw
                  size={13}
                  className={loadingDashboard ? "animate-spin" : ""}
                />
                Perbarui dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}