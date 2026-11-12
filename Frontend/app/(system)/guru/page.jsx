"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  getRiwayatShiftSaya,
  getAbsensiSaya,
  getAbsensiKelas,
} from "@/services/absensi.service";
import {
  getKelasMapel,
  getKelasMapelDiampu,
} from "@/services/kelasMapel.service";
import { getJadwalMengajar } from "@/services/jadwalMengajar.service";
import {
  getNotifikasi,
  markNotifikasiAsRead,
  markAllNotifikasiAsRead,
} from "@/services/notifikasi.service";
import { getKelasById } from "@/services/kelas.service";
import {
  getTugasByKelasMapel,
  getPengumpulanByTugas,
} from "@/services/tugas.service";
import { getSessionUser, subscribeAuth } from "@/lib/auth";

import {
  CalendarDays,
  NotebookPen,
  ClipboardCheck,
  BookOpen,
  ClipboardList,
  ChevronRight,
  Users,
  Clock3,
  Bell,
  AlertCircle,
  ArrowUpRight,
  GraduationCap,
  CalendarCheck2,
  RefreshCw,
  CheckCircle2,
  MapPin,
  LogIn,
  LogOut,
  Sparkles,
  Sunrise,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Token tema — semua warna mengikuti --color-* (bisa diubah dari CMS) */
/* ------------------------------------------------------------------ */

const TONES = {
  primary: "var(--color-primary)",
  success: "var(--color-success, #16a34a)",
  warning: "var(--color-warning, #d97706)",
  info: "var(--color-primary)",
  violet: "var(--color-primary)",
  danger: "var(--color-danger, #dc2626)",
  muted: "var(--color-text-muted, #94a3b8)",
};

const tint = (color, pct = 12) =>
  `color-mix(in srgb, ${color} ${pct}%, transparent)`;

const themeCard =
  "rounded-2xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] theme-card shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themePrimary = "text-[var(--color-primary)]";
const themeSoft = "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";
const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";
const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeMuted = "theme-text-muted";
const divider = "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const ACCENT = "var(--color-primary)";
const ACCENT_SOFT = "color-mix(in srgb, var(--color-primary) 32%, transparent)";
const TRACK = "color-mix(in srgb, var(--color-text) 8%, transparent)";
const GRID_LINE = "color-mix(in srgb, var(--color-text) 8%, transparent)";

/* ------------------------------------------------------------------ */
/* Data statis                                                         */
/* ------------------------------------------------------------------ */

const quickMenu = [
  {
    id: "presensi",
    title: "Presensi Saya",
    desc: "Check-in & check-out kehadiran Anda",
    icon: ClipboardCheck,
    path: "/guru/absensi",
    color: "var(--color-primary)",
  },
  {
    id: "jadwal",
    title: "Jadwal",
    desc: "Jadwal dan agenda mengajar",
    icon: CalendarDays,
    path: "/guru/jadwal",
    color: "var(--color-info, var(--color-primary))",
  },
  {
    id: "materi",
    title: "Materi",
    desc: "Kelola bahan ajar untuk kelas",
    icon: BookOpen,
    path: "/guru/materi",
    color: "var(--color-success, #16a34a)",
  },
  {
    id: "tugas",
    title: "Tugas",
    desc: "Buat tugas & pantau pengumpulan",
    icon: ClipboardList,
    path: "/guru/tugas",
    color: "var(--color-warning, #d97706)",
  },
];

const HOURLY_MESSAGES = [
  "Larut malam, jangan lupa istirahat yang cukup.",
  "Waktunya beristirahat, esok masih ada kelas.",
  "Malam yang tenang, sisakan tenaga untuk besok.",
  "Dini hari yang hening, semoga lelap menyertai.",
  "Fajar hampir tiba, bersiap untuk hari mengajar.",
  "Mulai hari dengan niat baik dan semangat mengajar.",
  "Pagi yang segar, jangan lupa check-in kehadiran.",
  "Siswa mulai berdatangan, siapkan materi hari ini.",
  "Semangat pagi, jam pelajaran sedang berjalan.",
  "Periksa jadwal dan absensi kelas sebelum istirahat.",
  "Tetap semangat, separuh hari mengajar sudah terlewati.",
  "Menjelang siang, pastikan absensi kelas sudah terisi.",
  "Waktunya jeda sejenak, isi tenaga untuk sesi berikutnya.",
  "Siang yang produktif, lanjutkan sesi mengajar Anda.",
  "Kegiatan belajar hampir usai, cek tugas yang masuk.",
  "Sore hari, saatnya menilai tugas siswa.",
  "Tinjau kembali capaian kelas hari ini.",
  "Menjelang petang, jangan lupa check-out kehadiran.",
  "Terima kasih atas pengabdian hari ini, selamat beristirahat.",
  "Malam yang tenang, rencanakan materi untuk besok.",
  "Hari hampir usai, semoga semua berjalan lancar.",
  "Waktunya memulihkan tenaga untuk esok hari.",
  "Sudah malam, sisakan pekerjaan untuk besok.",
  "Selamat malam, sampai jumpa di hari yang baru.",
];

const STATUS_META = {
  hadir: { label: "Hadir", color: TONES.success },
  terlambat: { label: "Terlambat", color: TONES.warning },
  izin: { label: "Izin", color: TONES.info },
  sakit: { label: "Sakit", color: TONES.violet },
  alpha: { label: "Alpha", color: TONES.danger },
  lainnya: { label: "Lainnya", color: TONES.muted },
};

const STATUS_ORDER = ["hadir", "terlambat", "izin", "sakit", "alpha", "lainnya"];

const DAY_ORDER = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];

const DAY_LABEL = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
  minggu: "Minggu",
};

const SCHEDULE_TONE = {
  Berlangsung: "success",
  Berikutnya: "info",
  Selesai: "muted",
  Jadwal: "muted",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getPayload(response) {
  if (response?.data?.data !== undefined) return response.data.data;
  if (response?.data !== undefined) return response.data;
  return response;
}

function getArrayPayload(response) {
  const payload = getPayload(response);

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.records)) return payload.records;

  return [];
}

function getJakartaDateString(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return year && month && day ? `${year}-${month}-${day}` : "";
}

function getJakartaHour(date = new Date()) {
  return (
    Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        hour12: false,
      }).format(date)
    ) % 24
  );
}

function getGreeting(date = new Date()) {
  const hour = getJakartaHour(date);

  if (hour >= 5 && hour < 11) {
    return { text: "Selamat pagi", icon: Sunrise, hour };
  }
  if (hour >= 11 && hour < 15) {
    return { text: "Selamat siang", icon: Sun, hour };
  }
  if (hour >= 15 && hour < 18) {
    return { text: "Selamat sore", icon: Sunset, hour };
  }
  return { text: "Selamat malam", icon: Moon, hour };
}

function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatClock(date) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(".", ":");
}

function formatTime(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "string") {
    const timeMatch = value.match(
      /^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/
    );

    if (timeMatch) {
      return `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function normalizeDay(value) {
  const days = {
    monday: "senin",
    tuesday: "selasa",
    wednesday: "rabu",
    thursday: "kamis",
    friday: "jumat",
    saturday: "sabtu",
    sunday: "minggu",
  };

  const normalized = String(value || "").toLowerCase().trim();
  return days[normalized] || normalized;
}

function getTodayName() {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long" })
    .format(new Date())
    .toLowerCase();
}

function getScheduleStatus(item) {
  const start = formatTime(item.jamMulai);
  const end = formatTime(item.jamSelesai);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  if ([startHour, startMinute, endHour, endMinute].some(Number.isNaN)) {
    return "Jadwal";
  }

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  if (currentMinutes < startMinutes) return "Berikutnya";
  if (currentMinutes <= endMinutes) return "Berlangsung";
  return "Selesai";
}

function isPresentStatus(status) {
  return ["h", "hadir", "present", "telat", "terlambat"].includes(
    String(status || "").toLowerCase()
  );
}

function getStatusKey(status) {
  const value = String(status || "").toLowerCase().trim();

  if (["h", "hadir", "present"].includes(value)) return "hadir";
  if (["telat", "terlambat"].includes(value)) return "terlambat";
  if (["i", "izin", "permit"].includes(value)) return "izin";
  if (["s", "sakit", "sick"].includes(value)) return "sakit";
  if (["a", "alpha", "alpa", "alfa", "absent"].includes(value)) return "alpha";

  return "lainnya";
}

function emptyBreakdown() {
  return {
    hadir: 0,
    terlambat: 0,
    izin: 0,
    sakit: 0,
    alpha: 0,
    lainnya: 0,
  };
}

function getInitials(name, email) {
  const source = String(name || email || "G")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (source.length >= 2) {
    return `${source[0][0]}${source[1][0]}`.toUpperCase();
  }

  return (source[0] || "G").slice(0, 2).toUpperCase();
}

function getUserFromStorage() {
  const sessionUser = getSessionUser();

  if (!sessionUser || typeof sessionUser !== "object") {
    return { name: "", email: "" };
  }

  return {
    name:
      sessionUser.namaLengkap ||
      sessionUser.nama ||
      sessionUser.name ||
      "",
    email: sessionUser.email || "",
  };
}

function getStoredUserId() {
  const sessionUser = getSessionUser();

  if (!sessionUser || typeof sessionUser !== "object") {
    return "";
  }

  const id =
    sessionUser.userId ||
    sessionUser.id ||
    sessionUser.penggunaId;

  return id ? String(id) : "";
}

const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(Number(value) || 0);

const formatDecimal = (value) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(
    Number(value) || 0
  );

const percentOf = (value, total) =>
  total > 0 ? (value / total) * 100 : 0;

function niceMax(max) {
  if (max <= 0) return 4;
  if (max <= 16) return Math.max(4, Math.ceil(max / 4) * 4);

  const exp = Math.pow(10, Math.floor(Math.log10(max)));
  const fraction = max / exp;
  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const step = steps.find((s) => fraction <= s) ?? 10;
  return step * exp;
}

function getAttendanceDate(item) {
  if (!item) return "";

  const todayKey = getJakartaDateString(new Date());

  const timestamps = [
    item.waktuMasuk,
    item.waktuKeluar,
    item.dibuatPada,
  ]
    .filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        value !== ""
    )
    .map((value) => ({
      value,
      date: getJakartaDateString(value),
      timestamp: new Date(value).getTime(),
    }))
    .filter(
      (entry) =>
        entry.date &&
        !Number.isNaN(entry.timestamp)
    );

  if (timestamps.some((entry) => entry.date === todayKey)) {
    return todayKey;
  }

  if (timestamps.length > 0) {
    timestamps.sort((a, b) => b.timestamp - a.timestamp);
    return timestamps[0].date;
  }

  return item.tanggal ? getJakartaDateString(item.tanggal) : "";
}

function getAttendanceTime(item, type) {
  if (!item) return null;

  const keys =
    type === "masuk"
      ? [
          "waktuMasuk",
          "jamMasuk",
          "checkIn",
          "checkin",
          "jam_masuk",
          "waktu_masuk",
          "check_in",
          "checkInAt",
          "checkinAt",
          "clockIn",
          "masukPada",
        ]
      : [
          "waktuKeluar",
          "jamKeluar",
          "checkOut",
          "checkout",
          "jam_keluar",
          "waktu_keluar",
          "check_out",
          "checkOutAt",
          "checkoutAt",
          "clockOut",
          "keluarPada",
        ];

  for (const key of keys) {
    const value = item[key];

    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }

  const nestedObjects = [
    item.absensi,
    item.data,
    item.presensi,
    item.detail,
  ];

  for (const nested of nestedObjects) {
    if (!nested || typeof nested !== "object") continue;

    for (const key of keys) {
      const value = nested[key];

      if (value !== null && value !== undefined && value !== "") {
        return value;
      }
    }
  }

  return null;
}

function pickLatestTodayRecord(records) {
  const todayKey = getJakartaDateString(new Date());

  const todayRecords = records.filter(
    (item) => getAttendanceDate(item) === todayKey
  );

  const getLatestTimestamp = (item) => {
    const timestamps = [
      item?.waktuMasuk,
      item?.waktuKeluar,
      item?.dibuatPada,
    ]
      .filter(Boolean)
      .map((value) => new Date(value).getTime())
      .filter((value) => !Number.isNaN(value));

    return timestamps.length ? Math.max(...timestamps) : 0;
  };

  todayRecords.sort((a, b) => getLatestTimestamp(b) - getLatestTimestamp(a));

  return todayRecords[0] || null;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function GuruDashboardPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(null);

  const [user, setUser] = useState({ name: "", email: "" });
  const [kelasMapel, setKelasMapel] = useState([]);
  const [jadwal, setJadwal] = useState([]);
  const [jadwalMingguan, setJadwalMingguan] = useState([]);
  const [notifikasi, setNotifikasi] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [attendanceByClass, setAttendanceByClass] = useState({});
  const [attendanceToday, setAttendanceToday] = useState(null);
  const [attendanceTodayError, setAttendanceTodayError] = useState("");
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [gradedSubmissions, setGradedSubmissions] = useState(0);
  const [taskCountAvailable, setTaskCountAvailable] = useState(true);
  const [studentCount, setStudentCount] = useState(0);
  const [studentsByClass, setStudentsByClass] = useState([]);
  const [studentCountAvailable, setStudentCountAvailable] = useState(false);

  const todayJakarta = useMemo(() => getJakartaDateString(new Date()), []);

  // Jam berjalan: sapaan, pesan, dan status jadwal ikut diperbarui.
  useEffect(() => {
    const first = setTimeout(() => setNow(new Date()), 0);
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        setUser(getUserFromStorage());
        const storedUserId = getStoredUserId();

        const [
          kelasDiampuResult,
          jadwalResult,
          notificationResult,
          absensiSayaResult,
          shiftSayaResult,
        ] = await Promise.allSettled([
          getKelasMapelDiampu(),
          getJadwalMengajar(),
          getNotifikasi(),
          getAbsensiSaya(),
          getRiwayatShiftSaya(1, 30),
        ]);

        let teacherClassMapel = [];
        if (kelasDiampuResult.status === "fulfilled") {
          const payload = getPayload(kelasDiampuResult.value);
          teacherClassMapel = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.items)
                ? payload.items
                : [];
        } else {
          try {
            const fallbackRes = await getKelasMapel();
            const fallbackPayload = getPayload(fallbackRes);
            const fallbackList = Array.isArray(fallbackPayload)
              ? fallbackPayload
              : Array.isArray(fallbackPayload?.items)
                ? fallbackPayload.items
                : [];
            teacherClassMapel = storedUserId
              ? fallbackList.filter(
                  (item) =>
                    String(item?.guruPengajarId || "") === storedUserId ||
                    String(item?.guruPengajar?.id || "") === storedUserId ||
                    String(item?.guruPengajar?.penggunaId || "") === storedUserId
                )
              : fallbackList;
          } catch {
            teacherClassMapel = [];
          }
        }

        setKelasMapel(teacherClassMapel);

        const notificationPayload =
          notificationResult.status === "fulfilled"
            ? getPayload(notificationResult.value)
            : null;

        const notifList = Array.isArray(notificationPayload?.list)
          ? notificationPayload.list
          : Array.isArray(notificationPayload)
            ? notificationPayload
            : [];

        setNotifikasi(notifList);
        setUnreadCount(
          Number(
            notificationPayload?.unreadCount ??
              notifList.filter((item) => !item.dibaca).length
          )
        );

        const myAttendanceRecords = [];
        let attendanceFetchFailed = false;

        if (absensiSayaResult.status === "fulfilled") {
          myAttendanceRecords.push(...getArrayPayload(absensiSayaResult.value));
        } else {
          attendanceFetchFailed = true;
        }

        if (shiftSayaResult.status === "fulfilled") {
          myAttendanceRecords.push(...getArrayPayload(shiftSayaResult.value));
        }

        const uniqueAttendance = [
          ...new Map(
            myAttendanceRecords
              .filter((r) => r?.id)
              .map((r) => [r.id, r])
          ).values(),
        ];

        const todayAttendanceRecord = pickLatestTodayRecord(uniqueAttendance);
        setAttendanceToday(todayAttendanceRecord);

        if (attendanceFetchFailed && myAttendanceRecords.length === 0) {
          setAttendanceTodayError(
            absensiSayaResult.reason?.message || "Data absensi guru gagal dimuat."
          );
        } else {
          setAttendanceTodayError("");
        }

        const teacherKmIds = new Set(
          teacherClassMapel.map((item) => item?.id).filter(Boolean)
        );

        const embeddedSchedules = [];
        for (const km of teacherClassMapel) {
          if (Array.isArray(km.jadwalMengajar)) {
            for (const jm of km.jadwalMengajar) {
              embeddedSchedules.push({
                ...jm,
                kelasMapel: {
                  ...km,
                  guruPengajar: km.guruPengajar,
                  kelas: km.kelas,
                  mataPelajaran: km.mataPelajaran,
                },
              });
            }
          }
        }

        let fetchedSchedules = [];
        if (jadwalResult.status === "fulfilled") {
          const rawJadwal = getPayload(jadwalResult.value);
          const jadwalList = Array.isArray(rawJadwal)
            ? rawJadwal
            : Array.isArray(rawJadwal?.items)
              ? rawJadwal.items
              : [];

          fetchedSchedules = jadwalList.filter((item) => {
            if (item.kelasMapelId && teacherKmIds.has(item.kelasMapelId)) return true;
            if (storedUserId) {
              if (String(item?.kelasMapel?.guruPengajar?.id || "") === storedUserId) return true;
              if (String(item?.kelasMapel?.guruPengajarId || "") === storedUserId) return true;
              if (String(item?.kelasMapel?.guruPengajar?.penggunaId || "") === storedUserId) return true;
            }
            return false;
          });
        }

        const mergedScheduleMap = new Map();
        for (const s of [...embeddedSchedules, ...fetchedSchedules]) {
          if (s?.id) mergedScheduleMap.set(s.id, s);
        }
        const teacherSchedule = Array.from(mergedScheduleMap.values());

        teacherSchedule.sort((a, b) => {
          const dayDiff =
            DAY_ORDER.indexOf(normalizeDay(a.hari)) -
            DAY_ORDER.indexOf(normalizeDay(b.hari));
          if (dayDiff !== 0) return dayDiff;
          return String(a.jamMulai || "").localeCompare(String(b.jamMulai || ""));
        });

        setJadwalMingguan(teacherSchedule);

        const todayName = getTodayName();
        const todaySchedules = teacherSchedule.filter(
          (item) => normalizeDay(item.hari) === todayName
        );
        todaySchedules.sort((a, b) =>
          String(a.jamMulai || "").localeCompare(String(b.jamMulai || ""))
        );
        setJadwal(todaySchedules);

        const uniqueClasses = [
          ...new Map(
            teacherClassMapel
              .filter((item) => item?.kelas?.id)
              .map((item) => [item.kelas.id, item.kelas])
          ).values(),
        ];

        let studentRows = [];
        let studentsCountAvailable = true;

        if (uniqueClasses.length === 0) {
          studentRows = [];
          studentsCountAvailable = true;
        } else {
          studentRows = await Promise.all(
            uniqueClasses.map(async (kelas) => {
              const directCount = kelas._count?.anggota;
              if (
                directCount !== null &&
                directCount !== undefined &&
                !Number.isNaN(Number(directCount))
              ) {
                return {
                  id: kelas.id,
                  name: kelas.nama || kelas.namaKelas || "Kelas",
                  count: Number(directCount),
                };
              }

              try {
                const res = await getKelasById(kelas.id);
                const kData = res?.data || res;
                const raw =
                  kData?._count?.anggota ??
                  (Array.isArray(kData?.anggota) ? kData.anggota.length : null) ??
                  kData?.jumlahSiswa ??
                  kData?.totalSiswa ??
                  (Array.isArray(kData?.siswaKelas) ? kData.siswaKelas.length : null);

                const count =
                  raw !== null && raw !== undefined && !Number.isNaN(Number(raw))
                    ? Number(raw)
                    : null;

                if (count === null) {
                  studentsCountAvailable = false;
                }

                return {
                  id: kelas.id,
                  name: kelas.nama || kelas.namaKelas || "Kelas",
                  count,
                };
              } catch {
                studentsCountAvailable = false;
                return {
                  id: kelas.id,
                  name: kelas.nama || kelas.namaKelas || "Kelas",
                  count: null,
                };
              }
            })
          );
        }

        setStudentsByClass(studentRows);
        const validStudentCounts = studentRows
          .map((r) => r.count)
          .filter((c) => c !== null && c !== undefined);

        if (uniqueClasses.length > 0 && validStudentCounts.length === 0) {
          setStudentCount(0);
          setStudentCountAvailable(false);
        } else {
          setStudentCount(validStudentCounts.reduce((acc, c) => acc + c, 0));
          setStudentCountAvailable(studentsCountAvailable);
        }

        const attendanceEntries = await Promise.all(
          uniqueClasses.map(async (kelas) => {
            try {
              const response = await getAbsensiKelas(kelas.id, todayJakarta);
              const records = getArrayPayload(response);
              const present = records.filter((item) =>
                isPresentStatus(item.status)
              ).length;

              const breakdown = emptyBreakdown();
              records.forEach((record) => {
                breakdown[getStatusKey(record.status)] += 1;
              });

              return [
                kelas.id,
                {
                  id: kelas.id,
                  name: kelas.nama || kelas.namaKelas || "Kelas",
                  totalRecorded: records.length,
                  present,
                  absent: records.length - present,
                  breakdown,
                  percentage:
                    records.length > 0
                      ? Math.round((present / records.length) * 100)
                      : null,
                },
              ];
            } catch {
              return [
                kelas.id,
                {
                  id: kelas.id,
                  name: kelas.nama || kelas.namaKelas || "Kelas",
                  totalRecorded: null,
                  present: null,
                  absent: null,
                  breakdown: null,
                  percentage: null,
                },
              ];
            }
          })
        );

        setAttendanceByClass(Object.fromEntries(attendanceEntries));

        let pendingCount = 0;
        let gradedCount = 0;
        let taskDataFailed = false;

        try {
          const taskLists = await Promise.all(
            teacherClassMapel.map(async (item) => {
              if (!item?.id) return [];
              try {
                const response = await getTugasByKelasMapel(item.id);
                return getArrayPayload(response);
              } catch {
                taskDataFailed = true;
                return [];
              }
            })
          );

          const rawTasks = taskLists.flat();
          const uniqueTasks = [
            ...new Map(rawTasks.filter((t) => t?.id).map((t) => [t.id, t])).values(),
          ];

          const submissionLists = await Promise.all(
            uniqueTasks.map(async (task) => {
              if (!task?.id) return [];
              try {
                const response = await getPengumpulanByTugas(task.id);
                return getArrayPayload(response);
              } catch {
                taskDataFailed = true;
                return [];
              }
            })
          );

          const rawSubmissions = submissionLists.flat();
          const uniqueSubmissions = [
            ...new Map(
              rawSubmissions
                .filter((s) => s?.id)
                .map((s) => [s.id, s])
            ).values(),
          ];

          for (const submission of uniqueSubmissions) {
            const status = String(submission?.status || "").toLowerCase();
            const hasGrade =
              submission?.nilai !== null &&
              submission?.nilai !== undefined;

            if (status === "dinilai" || hasGrade) {
              gradedCount += 1;
            } else {
              pendingCount += 1;
            }
          }
        } catch {
          taskDataFailed = true;
        }

        setPendingSubmissions(pendingCount);
        setGradedSubmissions(gradedCount);
        setTaskCountAvailable(!taskDataFailed);

        if (
          kelasDiampuResult.status === "rejected" &&
          jadwalResult.status === "rejected" &&
          notificationResult.status === "rejected"
        ) {
          setError(
            "Data dashboard tidak berhasil dimuat. Periksa koneksi API dan sesi login."
          );
        }
      } catch (err) {
        setError(err?.message || "Gagal memuat dashboard.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [todayJakarta]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboard();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDashboard]);

  useEffect(() => {
    const syncUser = () => setUser(getUserFromStorage());

    const unsubscribe = subscribeAuth(syncUser);

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(!loading);
    }, 60);
    return () => clearTimeout(timer);
  }, [loading]);

  const uniqueClassCount = useMemo(
    () =>
      new Set(kelasMapel.map((item) => item?.kelas?.id).filter(Boolean)).size,
    [kelasMapel]
  );

  const attendanceSummary = useMemo(() => {
    const rows = Object.values(attendanceByClass).filter(
      (item) => item.totalRecorded !== null
    );

    const totalRecorded = rows.reduce((sum, item) => sum + item.totalRecorded, 0);
    const totalPresent = rows.reduce((sum, item) => sum + item.present, 0);

    const breakdown = emptyBreakdown();
    rows.forEach((row) => {
      STATUS_ORDER.forEach((key) => {
        breakdown[key] += row.breakdown?.[key] || 0;
      });
    });

    return {
      totalRecorded,
      totalPresent,
      totalAbsent: totalRecorded - totalPresent,
      breakdown,
      percentage:
        totalRecorded > 0
          ? Math.round((totalPresent / totalRecorded) * 100)
          : null,
    };
  }, [attendanceByClass]);

  const attendanceDonutData = useMemo(
    () =>
      STATUS_ORDER.filter(
        (key) => key !== "lainnya" || attendanceSummary.breakdown.lainnya > 0
      ).map((key) => ({
        key,
        label: STATUS_META[key].label,
        color: STATUS_META[key].color,
        value: attendanceSummary.breakdown[key],
      })),
    [attendanceSummary]
  );

  const attendanceClassRows = useMemo(
    () => Object.values(attendanceByClass),
    [attendanceByClass]
  );

  const studentColumns = useMemo(
    () =>
      studentsByClass.map((row) => ({
        label: row.name,
        value: row.count !== null && row.count !== undefined ? row.count : 0,
        displayValue:
          row.count !== null && row.count !== undefined
            ? formatNumber(row.count)
            : "—",
        color: ACCENT,
      })),
    [studentsByClass]
  );

  const weeklyColumns = useMemo(() => {
    const days = [...DAY_ORDER];

    if (jadwalMingguan.some((item) => normalizeDay(item.hari) === "minggu")) {
      days.push("minggu");
    }

    const todayName = getTodayName();

    return days.map((day) => ({
      label: DAY_LABEL[day],
      value: jadwalMingguan.filter((item) => normalizeDay(item.hari) === day)
        .length,
      color: day === todayName ? ACCENT : ACCENT_SOFT,
    }));
  }, [jadwalMingguan]);

  const weeklyTotal = useMemo(
    () => weeklyColumns.reduce((sum, item) => sum + item.value, 0),
    [weeklyColumns]
  );

  const submissionTotal = pendingSubmissions + gradedSubmissions;

  const submissionDonutData = useMemo(
    () => [
      {
        key: "dinilai",
        label: "Sudah dinilai",
        color: TONES.success,
        value: gradedSubmissions,
      },
      {
        key: "belum",
        label: "Belum dinilai",
        color: TONES.warning,
        value: pendingSubmissions,
      },
    ],
    [gradedSubmissions, pendingSubmissions]
  );

  const headerNotifications = useMemo(
    () =>
      notifikasi.map((item) => ({
        id: item.id,
        title: item.judul || "Notifikasi",
        desc: item.isi || "",
        read: Boolean(item.dibaca),
      })),
    [notifikasi]
  );

  // `now` ikut jadi dependensi supaya status (Berlangsung/Berikutnya/Selesai)
  // ikut diperbarui seiring jam berjalan.
  const scheduleWithStatus = useMemo(
    () => jadwal.map((item) => ({ item, status: getScheduleStatus(item) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jadwal, now]
  );

  const focusSchedule = useMemo(
    () =>
      scheduleWithStatus.find((row) => row.status === "Berlangsung") ||
      scheduleWithStatus.find((row) => row.status === "Berikutnya") ||
      null,
    [scheduleWithStatus]
  );

  async function markNotificationAsRead(item) {
    if (!item?.id || item.dibaca) return;

    try {
      await markNotifikasiAsRead(item.id);

      setNotifikasi((previous) =>
        previous.map((notification) =>
          notification.id === item.id
            ? { ...notification, dibaca: true }
            : notification
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (err) {
      setError(err?.message || "Notifikasi gagal ditandai sudah dibaca.");
    }
  }

  async function markAllNotificationsAsRead() {
    try {
      await markAllNotifikasiAsRead();
      setNotifikasi((previous) =>
        previous.map((item) => ({ ...item, dibaca: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err?.message || "Notifikasi gagal diperbarui.");
    }
  }

  const displayName = user.name || user.email?.split("@")[0] || "Guru";

  const greeting = now ? getGreeting(now) : null;
  const GreetingIcon = greeting?.icon ?? Sparkles;
  const currentTime = now ? formatClock(now) : "--:--";
  const todayLabel = now ? formatDate(now) : "";

  const checkInValue = getAttendanceTime(attendanceToday, "masuk");
  const checkOutValue = getAttendanceTime(attendanceToday, "keluar");

  const attentionItems = [];

  if (!loading) {
    if (taskCountAvailable && pendingSubmissions > 0) {
      attentionItems.push({
        id: "nilai",
        tone: "warning",
        Icon: NotebookPen,
        title: `${formatNumber(pendingSubmissions)} pengumpulan belum dinilai`,
        desc: "Siswa sedang menunggu nilai dari Anda.",
        cta: "Nilai sekarang",
        onClick: () => router.push("/guru/nilai"),
      });
    }

    if (!attendanceTodayError && !checkInValue) {
      attentionItems.push({
        id: "checkin",
        tone: "info",
        Icon: LogIn,
        title: "Anda belum check-in hari ini",
        desc: "Catat kehadiran agar shift kerja Anda tercatat.",
        cta: "Buka presensi",
        onClick: () => router.push("/guru/absensi"),
      });
    }

    const unrecordedClasses = attendanceClassRows.filter(
      (row) => row.totalRecorded === 0
    ).length;

    if (unrecordedClasses > 0) {
      attentionItems.push({
        id: "absen-kelas",
        tone: "danger",
        Icon: ClipboardCheck,
        title: `${unrecordedClasses} kelas belum diabsen hari ini`,
        desc: "Belum ada catatan kehadiran siswa untuk kelas tersebut.",
        cta: "Isi absensi",
        onClick: () => router.push("/guru/absensi"),
      });
    }

    if (unreadCount > 0) {
      attentionItems.push({
        id: "notif",
        tone: "primary",
        Icon: Bell,
        title: `${formatNumber(unreadCount)} notifikasi baru`,
        desc: "Ada informasi baru untuk akun Anda.",
        cta: "Tandai dibaca",
        onClick: markAllNotificationsAsRead,
      });
    }
  }

  const heroSummary = loading
    ? "Sedang menyiapkan ringkasan hari ini…"
    : `Hari ini Anda memiliki ${formatNumber(jadwal.length)} sesi mengajar${
        taskCountAvailable
          ? ` dan ${formatNumber(pendingSubmissions)} pengumpulan yang menunggu penilaian`
          : ""
      }.`;

  const heroMessage = greeting ? HOURLY_MESSAGES[greeting.hour] : heroSummary;

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="dashboard"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="guru"
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header
            role="guru"
            toggleSidebar={() => setIsCollapsed((prev) => !prev)}
            notifications={headerNotifications}
            user={{
              name: displayName,
              email: user.email || "",
              avatar: getInitials(displayName, user.email),
            }}
          />
        </div>

        <main className="theme-page min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
            <div className="w-full space-y-6">
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold theme-text">
                      Ada data yang belum berhasil dimuat
                    </p>
                    <p className="mt-1 text-xs theme-text-secondary">{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadDashboard(true)}
                    className="text-xs font-semibold theme-text"
                  >
                    Coba lagi
                  </button>
                </div>
              )}

              {/* ================= BANNER SAPAAN ================= */}
              <section
                className={`relative overflow-hidden rounded-3xl border ${themePrimarySoftBorder} ${themeCardShadow} bg-[linear-gradient(120deg,color-mix(in_srgb,var(--color-primary)_16%,var(--color-card)),color-mix(in_srgb,var(--color-primary)_4%,var(--color-card)))]`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] blur-2xl"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      "linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />

                <div className="relative grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-12 lg:items-center">
                  <div className="min-w-0 lg:col-span-7">
                    <div
                      className={`inline-flex flex-wrap items-center gap-2 rounded-full border ${themePrimarySoftBorder} bg-[var(--color-card)] px-3 py-1.5 text-xs font-semibold ${themePrimary}`}
                    >
                      <GreetingIcon className="h-3.5 w-3.5" />
                      <span className="tabular-nums">{currentTime} WIB</span>
                      <span className="theme-text-muted">·</span>
                      <span className="theme-text-secondary">
                        {todayLabel || "Memuat tanggal..."}
                      </span>
                    </div>

                    <h1 className="mt-4 break-words text-2xl font-bold tracking-tight theme-text sm:text-3xl lg:text-4xl">
                      {greeting ? greeting.text : "Selamat datang"},{" "}
                      <span className={themePrimary}>{displayName}</span>
                    </h1>

                    <p className="mt-2 max-w-xl text-sm leading-6 theme-text-secondary sm:text-base">
                      {heroMessage}
                    </p>
                    <p className="mt-1 max-w-xl text-xs leading-5 theme-text-muted sm:text-sm">
                      {heroSummary}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => loadDashboard(true)}
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_22%,transparent)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                        />
                        {refreshing ? "Memuat..." : "Refresh Data"}
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push("/guru/jadwal")}
                        className="theme-card theme-border theme-text inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:shadow-sm"
                      >
                        <CalendarDays className="h-4 w-4" />
                        Lihat jadwal
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push("/guru/absensi")}
                        className="theme-card theme-border theme-text inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:shadow-sm"
                      >
                        <ClipboardCheck className="h-4 w-4" />
                        Presensi saya
                      </button>
                    </div>
                  </div>

                  {/* Kartu fokus: sesi berjalan / berikutnya + presensi */}
                  <div className="min-w-0 lg:col-span-5">
                    <div
                      className={`rounded-2xl border ${themePrimarySoftBorder} bg-[var(--color-card)] p-5 ${themeCardShadow}`}
                    >
                      <div
                        className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider ${themePrimary}`}
                      >
                        <Sparkles size={13} />
                        {focusSchedule
                          ? focusSchedule.status === "Berlangsung"
                            ? "Sedang berlangsung"
                            : "Kelas berikutnya"
                          : "Jadwal hari ini"}
                      </div>

                      {loading ? (
                        <p className="mt-3 text-sm theme-text-secondary">
                          Memuat jadwal…
                        </p>
                      ) : focusSchedule ? (
                        <>
                          <p className="mt-3 truncate text-xl font-bold theme-text">
                            {focusSchedule.item.kelasMapel?.mataPelajaran?.nama ||
                              focusSchedule.item.kelasMapel?.mataPelajaran
                                ?.namaMapel ||
                              "Mata pelajaran"}
                          </p>
                          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm theme-text-secondary">
                            <span className="inline-flex items-center gap-1.5">
                              <GraduationCap size={14} />
                              {focusSchedule.item.kelasMapel?.kelas?.nama ||
                                focusSchedule.item.kelasMapel?.kelas?.namaKelas ||
                                "Kelas"}
                            </span>
                            {focusSchedule.item.ruangan && (
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin size={14} />
                                {focusSchedule.item.ruangan}
                              </span>
                            )}
                          </p>
                          <p
                            className={`mt-3 inline-flex items-center gap-2 rounded-lg ${themeSoft} px-3 py-1.5 text-sm font-semibold tabular-nums ${themePrimary}`}
                          >
                            <Clock3 size={14} />
                            {formatTime(focusSchedule.item.jamMulai)} –{" "}
                            {formatTime(focusSchedule.item.jamSelesai)}
                          </p>
                        </>
                      ) : (
                        <p className="mt-3 text-sm leading-relaxed theme-text-secondary">
                          {jadwal.length === 0
                            ? "Tidak ada sesi mengajar hari ini."
                            : "Semua sesi mengajar hari ini sudah selesai."}
                        </p>
                      )}

                      <div
                        className={`mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t ${divider} pt-3 text-xs theme-text-secondary`}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <LogIn size={13} />
                          Masuk{" "}
                          <b className="tabular-nums theme-text">
                            {checkInValue ? formatTime(checkInValue) : "-"}
                          </b>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <LogOut size={13} />
                          Pulang{" "}
                          <b className="tabular-nums theme-text">
                            {checkOutValue ? formatTime(checkOutValue) : "-"}
                          </b>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ================= RINGKASAN ================= */}
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  label="Kelas Diampu"
                  value={loading ? "…" : formatNumber(uniqueClassCount)}
                  description="Jumlah kelas yang Anda ajar"
                  Icon={GraduationCap}
                  onClick={() => router.push("/guru/jadwal")}
                />
                <KpiCard
                  label="Siswa Diampu"
                  value={
                    loading
                      ? "…"
                      : studentCountAvailable
                        ? formatNumber(studentCount)
                        : "—"
                  }
                  description={
                    studentCountAvailable
                      ? "Total siswa di semua kelas Anda"
                      : "Data siswa belum berhasil dimuat"
                  }
                  Icon={Users}
                />
                <KpiCard
                  label="Belum Dinilai"
                  value={
                    loading
                      ? "…"
                      : taskCountAvailable
                        ? formatNumber(pendingSubmissions)
                        : "—"
                  }
                  description={
                    taskCountAvailable
                      ? "Pengumpulan menunggu nilai Anda"
                      : "Data penilaian belum berhasil dimuat"
                  }
                  Icon={ClipboardList}
                  onClick={() => router.push("/guru/nilai")}
                />
                <KpiCard
                  label="Kehadiran Siswa"
                  value={
                    loading
                      ? "…"
                      : attendanceSummary.percentage === null
                        ? "—"
                        : `${attendanceSummary.percentage}%`
                  }
                  description={
                    attendanceSummary.percentage === null
                      ? "Belum ada absensi kelas hari ini"
                      : `${formatNumber(attendanceSummary.totalPresent)} dari ${formatNumber(attendanceSummary.totalRecorded)} siswa hadir`
                  }
                  Icon={CalendarCheck2}
                  progress={attendanceSummary.percentage}
                  animate={animate}
                  onClick={() => router.push("/guru/absensi")}
                />
              </section>

              {/* ================= KALENDER & AKSI CEPAT ================= */}
              <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <ChartCard title="Kalender" subtitle="Bulan berjalan">
                  <MiniCalendar now={now} />
                </ChartCard>

                <div className="lg:col-span-2">
                  <ChartCard
                    title="Aksi Cepat"
                    subtitle="Langsung ke menu yang paling sering dipakai"
                    bodyClassName="flex"
                  >
                    <div className="grid w-full flex-1 auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2">
                      {quickMenu.map((item) => (
                        <QuickActionCard
                          key={item.id}
                          action={item}
                          onClick={() => router.push(item.path)}
                        />
                      ))}
                    </div>
                  </ChartCard>
                </div>
              </section>

              {/* ================= JADWAL & PERHATIAN ================= */}
              <section className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">
                <div className={`${themeCard} min-w-0 overflow-hidden lg:col-span-2`}>
                  <CardHeader
                    Icon={Clock3}
                    title="Jadwal Hari Ini"
                    subtitle={`${formatNumber(jadwal.length)} sesi mengajar`}
                    action={
                      <button
                        type="button"
                        onClick={() => router.push("/guru/jadwal")}
                        className={`flex items-center gap-1 text-xs font-semibold ${themePrimary}`}
                      >
                        Semua jadwal <ChevronRight size={13} />
                      </button>
                    }
                  />

                  {loading ? (
                    <div className="p-5">
                      <ChartLoading />
                    </div>
                  ) : scheduleWithStatus.length === 0 ? (
                    <div className="p-8 text-center">
                      <div
                        className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ background: tint(TONES.primary), color: TONES.primary }}
                      >
                        <CalendarDays size={22} />
                      </div>
                      <p className="mt-3 text-sm font-semibold theme-text">
                        Tidak ada sesi mengajar hari ini
                      </p>
                      <p className={`mx-auto mt-1 max-w-sm text-xs leading-relaxed ${themeMuted}`}>
                        Jika seharusnya ada jadwal, periksa penugasan guru pada kelas-mapel.
                      </p>
                    </div>
                  ) : (
                    <ol className="p-4 sm:p-5">
                      {scheduleWithStatus.map(({ item, status }, index) => {
                        const km = item.kelasMapel || {};
                        const tone = TONES[SCHEDULE_TONE[status] || "muted"];
                        const isLast = index === scheduleWithStatus.length - 1;
                        const isNow = status === "Berlangsung";

                        return (
                          <li
                            key={item.id || `${index}-${item.jamMulai}`}
                            className={`flex gap-3 sm:gap-4 ${status === "Selesai" ? "opacity-60" : ""}`}
                          >
                            <div className="w-14 shrink-0 pt-3 text-right sm:w-16">
                              <p className="text-sm font-semibold tabular-nums theme-text">
                                {formatTime(item.jamMulai)}
                              </p>
                              <p className={`mt-0.5 text-[11px] tabular-nums ${themeMuted}`}>
                                {formatTime(item.jamSelesai)}
                              </p>
                            </div>

                            <div className="flex flex-col items-center">
                              <span
                                className={`mt-4 h-3 w-3 shrink-0 rounded-full ring-4 ${isNow ? "animate-pulse" : ""}`}
                                style={{
                                  backgroundColor: tone,
                                  "--tw-ring-color": tint(tone, 25),
                                }}
                              />
                              {!isLast && (
                                <span
                                  className="mt-1 w-px flex-1"
                                  style={{ background: GRID_LINE }}
                                />
                              )}
                            </div>

                            <div
                              className={`mb-3 min-w-0 flex-1 rounded-xl border p-3.5 ${isLast ? "mb-0" : ""}`}
                              style={{
                                borderColor: isNow
                                  ? tint(TONES.success, 45)
                                  : "color-mix(in srgb, var(--color-text) 10%, transparent)",
                                background: isNow ? tint(TONES.success, 8) : "transparent",
                              }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold theme-text">
                                    {km.mataPelajaran?.nama ||
                                      km.mataPelajaran?.namaMapel ||
                                      "Mata pelajaran"}
                                  </p>
                                  <p className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs ${themeMuted}`}>
                                    <span className="inline-flex items-center gap-1">
                                      <GraduationCap size={12} />
                                      {km.kelas?.nama || km.kelas?.namaKelas || "Kelas belum tersedia"}
                                    </span>
                                    {item.ruangan && (
                                      <span className="inline-flex items-center gap-1">
                                        <MapPin size={12} />
                                        {item.ruangan}
                                      </span>
                                    )}
                                  </p>
                                </div>
                                <StatusPill label={status} color={tone} />
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </div>

                <div className={`${themeCard} min-w-0 overflow-hidden lg:col-span-1`}>
                  <CardHeader
                    Icon={AlertCircle}
                    title="Perlu Perhatian"
                    subtitle={
                      loading
                        ? "Memeriksa…"
                        : attentionItems.length > 0
                          ? `${attentionItems.length} hal perlu ditindaklanjuti`
                          : "Tidak ada yang mendesak"
                    }
                    tone={attentionItems.length > 0 ? "warning" : "success"}
                  />

                  {loading ? (
                    <div className="p-5">
                      <ChartLoading />
                    </div>
                  ) : attentionItems.length === 0 ? (
                    <div className="p-8 text-center">
                      <div
                        className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ background: tint(TONES.success), color: TONES.success }}
                      >
                        <CheckCircle2 size={22} />
                      </div>
                      <p className="mt-3 text-sm font-semibold theme-text">Semua beres</p>
                      <p className={`mt-1 text-xs leading-relaxed ${themeMuted}`}>
                        Tidak ada penilaian, absensi, atau notifikasi yang tertunda.
                      </p>
                    </div>
                  ) : (
                    <ul className={`divide-y ${divider}`}>
                      {attentionItems.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={item.onClick}
                            className="group flex w-full items-start gap-3 p-4 text-left transition hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"
                          >
                            <IconChip Icon={item.Icon} tone={item.tone} size={38} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold leading-snug theme-text">
                                {item.title}
                              </p>
                              <p className={`mt-0.5 text-xs leading-relaxed ${themeMuted}`}>
                                {item.desc}
                              </p>
                              <span
                                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold"
                                style={{ color: TONES[item.tone] }}
                              >
                                {item.cta}
                                <ArrowUpRight
                                  size={12}
                                  className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                />
                              </span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              {/* ================= KEHADIRAN SISWA ================= */}
              <section className="space-y-4">
                <SectionHeader
                  title="Kehadiran Siswa Hari Ini"
                  subtitle="Berdasarkan catatan absensi di kelas yang Anda ampu."
                  action={
                    <button
                      type="button"
                      onClick={() => router.push("/guru/absensi")}
                      className={`inline-flex items-center gap-1 text-sm font-semibold ${themePrimary} transition hover:opacity-75`}
                    >
                      Lihat absensi <ChevronRight size={14} />
                    </button>
                  }
                />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="min-w-0 lg:col-span-1">
                    <ChartCard
                      title="Ringkasan Semua Kelas"
                      subtitle="Status kehadiran seluruh siswa"
                    >
                      {loading ? (
                        <ChartLoading />
                      ) : attendanceSummary.totalRecorded === 0 ? (
                        <EmptyChart message="Belum ada catatan absensi hari ini." />
                      ) : (
                        <div className="flex flex-col items-center gap-6">
                          <DonutChart
                            data={attendanceDonutData}
                            total={attendanceSummary.totalRecorded}
                            animate={animate}
                            centerValue={
                              attendanceSummary.percentage === null
                                ? "—"
                                : `${attendanceSummary.percentage}%`
                            }
                            centerLabel="Hadir"
                          />
                          <LegendList
                            data={attendanceDonutData}
                            total={attendanceSummary.totalRecorded}
                          />
                        </div>
                      )}
                    </ChartCard>
                  </div>

                  <div className="min-w-0 lg:col-span-2">
                    <ChartCard
                      title="Per Kelas"
                      subtitle="Semakin hijau berarti semakin banyak siswa yang hadir"
                    >
                      {loading ? (
                        <ChartLoading />
                      ) : attendanceClassRows.length === 0 ? (
                        <EmptyChart message="Belum ada data kelas yang dapat ditampilkan." />
                      ) : (
                        <div className="space-y-5">
                          {attendanceClassRows.map((item) => (
                            <div key={item.id} className="min-w-0">
                              <div className="mb-2 flex items-baseline justify-between gap-3">
                                <p className="truncate text-sm font-medium theme-text">
                                  {item.name}
                                </p>
                                <span className="shrink-0 text-sm font-semibold tabular-nums theme-text">
                                  {item.percentage === null ? "—" : `${item.percentage}%`}
                                </span>
                              </div>

                              <StackedBar
                                breakdown={item.breakdown}
                                total={item.totalRecorded}
                                animate={animate}
                              />

                              <p className={`mt-1.5 text-[11px] tabular-nums ${themeMuted}`}>
                                {item.totalRecorded === null
                                  ? "Data absensi tidak tersedia"
                                  : item.totalRecorded === 0
                                    ? "Belum diabsen hari ini"
                                    : `${item.present} hadir dari ${item.totalRecorded} siswa tercatat`}
                              </p>
                            </div>
                          ))}

                          <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-4 ${divider}`}>
                            {attendanceDonutData.map((item) => (
                              <span
                                key={item.key}
                                className={`inline-flex items-center gap-1.5 text-[11px] ${themeMuted}`}
                              >
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                {item.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </ChartCard>
                  </div>
                </div>
              </section>

              {/* ================= KELAS & PENILAIAN ================= */}
              <section className="space-y-4">
                <SectionHeader
                  title="Kelas dan Penilaian"
                  subtitle="Sebaran siswa, status penilaian tugas, dan beban mengajar."
                />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="min-w-0 lg:col-span-2">
                    <ChartCard
                      title="Jumlah Siswa per Kelas"
                      subtitle="Kelas yang Anda ampu"
                    >
                      {loading ? (
                        <ChartLoading />
                      ) : studentColumns.length === 0 ? (
                        <EmptyChart message="Belum ada data kelas yang dapat ditampilkan." />
                      ) : (
                        <ColumnChart items={studentColumns} animate={animate} />
                      )}
                    </ChartCard>
                  </div>

                  <div className="min-w-0 lg:col-span-1">
                    <ChartCard
                      title="Status Penilaian Tugas"
                      subtitle="Dari seluruh pengumpulan siswa"
                    >
                      {loading ? (
                        <ChartLoading />
                      ) : !taskCountAvailable ? (
                        <EmptyChart message="Data pengumpulan belum berhasil diambil." />
                      ) : submissionTotal === 0 ? (
                        <EmptyChart message="Belum ada pengumpulan tugas." />
                      ) : (
                        <div className="flex flex-col items-center gap-6">
                          <DonutChart
                            data={submissionDonutData}
                            total={submissionTotal}
                            animate={animate}
                            centerValue={formatNumber(submissionTotal)}
                            centerLabel="Pengumpulan"
                          />
                          <LegendList
                            data={submissionDonutData}
                            total={submissionTotal}
                          />
                        </div>
                      )}
                    </ChartCard>
                  </div>

                  <div className="min-w-0 lg:col-span-2">
                    <ChartCard
                      title="Beban Jadwal Mingguan"
                      subtitle={`Sesi mengajar per hari · total ${weeklyTotal} sesi · hari ini ditandai warna penuh`}
                    >
                      {loading ? (
                        <ChartLoading />
                      ) : weeklyTotal === 0 ? (
                        <EmptyChart message="Belum ada jadwal mengajar yang dapat ditampilkan." />
                      ) : (
                        <ColumnChart items={weeklyColumns} animate={animate} height={180} />
                      )}
                    </ChartCard>
                  </div>

                  <div className="min-w-0 lg:col-span-1">
                    <ChartCard
                      title="Kehadiran Saya Hari Ini"
                      subtitle="Dicatat oleh sistem absensi"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <TimeBox
                          label="Jam masuk"
                          value={checkInValue}
                          doneText="Check-in tercatat"
                          emptyText="Belum check-in"
                          Icon={LogIn}
                          tone="primary"
                        />
                        <TimeBox
                          label="Jam pulang"
                          value={checkOutValue}
                          doneText="Check-out tercatat"
                          emptyText="Belum check-out"
                          Icon={LogOut}
                          tone="primary"
                        />
                      </div>

                      {attendanceTodayError ? (
                        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                          <p className="text-xs text-red-500">{attendanceTodayError}</p>
                        </div>
                      ) : !attendanceToday ? (
                        <p className={`mt-4 text-xs leading-relaxed ${themeMuted}`}>
                          Belum ada catatan absensi shift untuk hari ini. Pastikan Anda sudah check-in dan memiliki shift kerja.
                        </p>
                      ) : (
                        <p className={`mt-4 text-xs ${themeMuted}`}>
                          Status:{" "}
                          <span className="font-semibold theme-text">
                            {attendanceToday.statusShift || attendanceToday.status || "Tercatat"}
                          </span>
                          {attendanceToday.shiftKerja?.nama
                            ? ` · Shift ${attendanceToday.shiftKerja.nama}`
                            : ""}
                        </p>
                      )}
                    </ChartCard>
                  </div>
                </div>
              </section>

              {/* ================= NOTIFIKASI ================= */}
              <section className={`${themeCard} min-w-0 overflow-hidden`}>
                <CardHeader
                  Icon={Bell}
                  title="Notifikasi"
                  subtitle="Informasi terbaru untuk akun Anda"
                  action={
                    unreadCount > 0 ? (
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${themeSoft} ${themePrimary}`}>
                          {unreadCount} baru
                        </span>
                        <button
                          type="button"
                          onClick={markAllNotificationsAsRead}
                          className={`text-xs font-semibold ${themePrimary}`}
                        >
                          Tandai semua dibaca
                        </button>
                      </div>
                    ) : null
                  }
                />

                {loading ? (
                  <div className="p-5">
                    <ChartLoading />
                  </div>
                ) : notifikasi.length === 0 ? (
                  <p className={`p-6 text-center text-sm ${themeMuted}`}>
                    Belum ada notifikasi.
                  </p>
                ) : (
                  <ul className={`divide-y ${divider}`}>
                    {notifikasi.slice(0, 5).map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => markNotificationAsRead(item)}
                          className="flex w-full gap-3 p-4 text-left transition hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] sm:px-5"
                        >
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                            style={{
                              backgroundColor: item.dibaca ? TONES.muted : TONES.primary,
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm ${item.dibaca ? "font-medium" : "font-semibold"} theme-text`}>
                              {item.judul || "Notifikasi"}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-xs theme-text-secondary">
                              {item.isi || item.pesan || item.konten || "Tidak ada detail."}
                            </p>
                          </div>
                          <span className={`shrink-0 text-[11px] tabular-nums ${themeMuted}`}>
                            {item.dibuatPada
                              ? new Date(item.dibuatPada).toLocaleString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Komponen umum                                                       */
/* ------------------------------------------------------------------ */

function IconChip({ Icon, tone = "primary", size = 40 }) {
  const color = TONES[tone] || TONES.primary;

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-xl"
      style={{
        width: size,
        height: size,
        background: tint(color, 13),
        color,
      }}
    >
      <Icon size={Math.round(size * 0.46)} />
    </span>
  );
}

function StatusPill({ label, color }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: tint(color, 14), color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function CardHeader({ Icon, title, subtitle, action, tone = "primary" }) {
  return (
    <div className={`flex items-center justify-between gap-3 border-b p-4 sm:p-5 ${divider}`}>
      <div className="flex min-w-0 items-center gap-3">
        <IconChip Icon={Icon} tone={tone} size={38} />
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold theme-text">{title}</h2>
          {subtitle && <p className={`mt-0.5 truncate text-xs ${themeMuted}`}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold theme-text">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm theme-text-secondary">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function ChartCard({ title, subtitle, children, bodyClassName = "" }) {
  return (
    <div className={`${themeCard} flex h-full min-w-0 flex-col p-5 sm:p-6`}>
      <div className="mb-5">
        <h3 className="text-sm font-semibold theme-text">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs theme-text-secondary">{subtitle}</p>
        )}
      </div>

      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  description,
  Icon,
  progress,
  animate = true,
  onClick,
}) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      {...(onClick ? { type: "button", onClick } : {})}
      className={`${themeCard} min-w-0 p-5 text-left ${
        onClick
          ? "transition duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]"
          : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${themeSoft} ${themePrimary}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
            {label}
          </p>
          <p className="mt-0.5 break-words text-2xl font-bold tabular-nums tracking-tight theme-text">
            {value}
          </p>
        </div>
      </div>

      {typeof progress === "number" && (
        <div
          className="mt-4 h-1.5 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: TRACK }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: animate ? `${Math.min(100, Math.max(0, progress))}%` : "0%",
              backgroundColor: ACCENT,
            }}
          />
        </div>
      )}

      {description && (
        <p
          className={`${
            typeof progress === "number" ? "mt-2" : "mt-4"
          } text-xs font-medium ${themePrimary}`}
        >
          {description}
        </p>
      )}
    </Wrapper>
  );
}

/* ------------------------------------------------------------------ */
/* Aksi Cepat: kartu aksi                                              */
/* ------------------------------------------------------------------ */

function QuickActionCard({ action, onClick }) {
  const Icon = action.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ "--qa": action.color }}
      className={`group relative flex min-h-[132px] w-full flex-col justify-between overflow-hidden rounded-2xl border ${divider} bg-[color-mix(in_srgb,var(--qa)_5%,var(--color-card))] p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--qa)_45%,transparent)] hover:shadow-[0_10px_24px_color-mix(in_srgb,var(--qa)_16%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qa)]`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[color-mix(in_srgb,var(--qa)_10%,transparent)] transition duration-300 group-hover:scale-125"
      />

      <div className="relative flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--qa)_14%,transparent)] text-[var(--qa)] transition duration-200 group-hover:bg-[var(--qa)] group-hover:text-white group-hover:shadow-[0_6px_14px_color-mix(in_srgb,var(--qa)_35%,transparent)]">
          <Icon className="h-5 w-5" />
        </span>

        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] bg-[var(--color-card)] theme-text-muted transition duration-200 group-hover:border-transparent group-hover:bg-[var(--qa)] group-hover:text-white">
          <ArrowUpRight className="h-4 w-4 transition duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>

      <div className="relative mt-5 min-w-0">
        <span className="block text-base font-semibold theme-text">
          {action.title}
        </span>
        <span className="mt-1 block text-xs leading-5 theme-text-secondary">
          {action.desc}
        </span>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Kalender mini (mengikuti zona waktu Asia/Jakarta)                   */
/* ------------------------------------------------------------------ */

const HARI_SINGKAT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function MiniCalendar({ now }) {
  const current = now ?? new Date();
  const [yearStr, monthStr, dayStr] = getJakartaDateString(current).split("-");
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  const today = Number(dayStr);

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const monthLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));

  return (
    <div>
      <p className="mb-3 text-center text-sm font-semibold capitalize theme-text">
        {monthLabel}
      </p>

      <div className="grid grid-cols-7 gap-1 text-center">
        {HARI_SINGKAT.map((hari, index) => (
          <span
            key={hari}
            className={`py-1 text-[10px] font-semibold uppercase tracking-wide ${
              index === 6 ? "text-[var(--color-danger)]" : "theme-text-muted"
            }`}
          >
            {hari}
          </span>
        ))}

        {cells.map((day, index) => {
          if (day === null) {
            return <span key={`blank-${index}`} />;
          }

          const isToday = day === today;
          const isSunday = index % 7 === 6;

          return (
            <span
              key={day}
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs tabular-nums ${
                isToday
                  ? "bg-[var(--color-primary)] font-bold text-white"
                  : isSunday
                    ? "text-[var(--color-danger)]"
                    : "theme-text-secondary"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Komponen kecil lainnya                                              */
/* ------------------------------------------------------------------ */

function TimeBox({ label, value, doneText, emptyText, Icon, tone }) {
  const color = TONES[tone] || TONES.primary;
  const has = Boolean(value);

  return (
    <div
      className="rounded-xl border p-4"
      style={{
        borderColor: has
          ? tint(color, 35)
          : "color-mix(in srgb, var(--color-text) 10%, transparent)",
        background: has ? tint(color, 7) : "transparent",
      }}
    >
      <p className={`flex items-center gap-1.5 text-[11px] ${themeMuted}`}>
        <Icon size={12} style={{ color: has ? color : undefined }} />
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums theme-text">
        {has ? formatTime(value) : "-"}
      </p>
      <p className={`mt-1 text-[11px] ${themeMuted}`}>{has ? doneText : emptyText}</p>
    </div>
  );
}

function ChartLoading() {
  return (
    <div className="space-y-3 py-2">
      <div className="h-3 w-2/3 animate-pulse rounded" style={{ background: TRACK }} />
      <div className="h-3 w-full animate-pulse rounded" style={{ background: TRACK }} />
      <div className="h-3 w-1/2 animate-pulse rounded" style={{ background: TRACK }} />
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className={`flex min-h-[140px] items-center justify-center text-center text-sm ${themeMuted}`}>
      {message}
    </div>
  );
}

function LegendList({ data = [], total = 0 }) {
  return (
    <div className="w-full">
      <div className={`grid grid-cols-[1fr_auto_auto] gap-x-4 border-b pb-2 text-[10px] font-medium uppercase tracking-wider ${divider} ${themeMuted}`}>
        <span>Status</span>
        <span className="text-right">Jumlah</span>
        <span className="w-12 text-right">Persen</span>
      </div>

      {data.map((item) => (
        <div
          key={item.key}
          className={`grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b py-2.5 text-sm last:border-b-0 ${divider}`}
        >
          <span className="flex min-w-0 items-center gap-2.5 font-medium theme-text">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate">{item.label}</span>
          </span>
          <span className="text-right font-semibold tabular-nums theme-text">
            {formatNumber(item.value)}
          </span>
          <span className="w-12 text-right text-xs tabular-nums theme-text-secondary">
            {formatDecimal(percentOf(item.value, total))}%
          </span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({
  data = [],
  total = 0,
  animate = true,
  centerValue,
  centerLabel,
  size = 172,
  stroke = 16,
}) {
  const center = size / 2;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const visibleCount = data.filter((item) => item.value > 0).length;
  const gap = visibleCount > 1 ? 2 : 0;

  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Donut chart"
      >
        <g transform={`rotate(-90 ${center} ${center})`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            style={{ stroke: TRACK }}
          />

          {total > 0 &&
            data.map((item) => {
              const rawLength = (item.value / total) * circumference;
              const currentOffset = offset;
              offset += rawLength;

              if (item.value <= 0) return null;

              const length = Math.max(0, rawLength - gap);

              return (
                <circle
                  key={item.key}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  strokeWidth={stroke}
                  strokeDasharray={`${animate ? length : 0} ${circumference}`}
                  strokeDashoffset={-currentOffset}
                  style={{
                    stroke: item.color,
                    transition: "stroke-dasharray 0.9s ease-out",
                  }}
                >
                  <title>{`${item.label}: ${item.value}`}</title>
                </circle>
              );
            })}
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums theme-text">
          {centerValue}
        </span>
        <span className={`mt-0.5 text-[11px] ${themeMuted}`}>{centerLabel}</span>
      </div>
    </div>
  );
}

function StackedBar({ breakdown, total, animate = true }) {
  const hasData = breakdown && total > 0;

  return (
    <div
      className="flex h-2.5 w-full overflow-hidden rounded-full"
      style={{ backgroundColor: TRACK }}
    >
      {hasData &&
        STATUS_ORDER.map((key) => {
          const value = breakdown[key] || 0;
          if (value <= 0) return null;

          return (
            <div
              key={key}
              className="h-full transition-all duration-700 ease-out"
              style={{
                width: animate ? `${percentOf(value, total)}%` : "0%",
                backgroundColor: STATUS_META[key].color,
              }}
              title={`${STATUS_META[key].label}: ${value}`}
            />
          );
        })}
    </div>
  );
}

function ColumnChart({ items = [], animate = true, height = 200 }) {
  const rawMax = Math.max(...items.map((item) => item.value), 0);
  const axisMax = rawMax <= 4 ? Math.max(1, Math.ceil(rawMax)) : niceMax(rawMax);
  const tickCount = axisMax <= 4 ? axisMax : 4;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i / tickCount);
  const AXIS_WIDTH = 44;
  const MIN_COLUMN_WIDTH = 56;

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: AXIS_WIDTH + items.length * MIN_COLUMN_WIDTH }}>
        <div className="flex">
          <div
            className="relative shrink-0"
            style={{ width: AXIS_WIDTH, height }}
          >
            {ticks.map((tick) => (
              <span
                key={tick}
                className={`absolute right-3 text-[11px] tabular-nums ${themeMuted}`}
                style={{
                  bottom: `${tick * 100}%`,
                  transform: "translateY(50%)",
                }}
              >
                {formatNumber(Math.round(axisMax * tick))}
              </span>
            ))}
          </div>

          <div className="relative min-w-0 flex-1" style={{ height }}>
            {ticks.map((tick) => (
              <div
                key={tick}
                className="absolute inset-x-0 border-t"
                style={{
                  bottom: `${tick * 100}%`,
                  borderColor: GRID_LINE,
                }}
              />
            ))}

            <div
              className="relative grid h-full gap-3"
              style={{
                gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
              }}
            >
              {items.map((item, index) => {
                const pct = axisMax > 0 ? (item.value / axisMax) * 100 : 0;

                return (
                  <div key={`${item.label}-${index}`} className="relative h-full">
                    <div
                      className="absolute bottom-0 left-1/2 w-full max-w-[40px] -translate-x-1/2 rounded-t-md transition-all duration-700 ease-out"
                      style={{
                        height: animate ? `${Math.max(pct, 0.8)}%` : "0%",
                        backgroundColor: item.color || ACCENT,
                      }}
                      title={`${item.label}: ${item.value}`}
                    />

                    <span
                      className="absolute left-0 right-0 text-center text-xs font-semibold tabular-nums theme-text transition-all duration-700 ease-out"
                      style={{
                        bottom: animate
                          ? `calc(${Math.max(pct, 0.8)}% + 6px)`
                          : "6px",
                      }}
                    >
                      {item.displayValue || formatNumber(item.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3 flex">
          <div className="shrink-0" style={{ width: AXIS_WIDTH }} />
          <div
            className="grid min-w-0 flex-1 gap-3"
            style={{
              gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
            }}
          >
            {items.map((item, index) => (
              <span
                key={`${item.label}-${index}`}
                className="truncate text-center text-xs font-medium theme-text-secondary"
                title={item.label}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}