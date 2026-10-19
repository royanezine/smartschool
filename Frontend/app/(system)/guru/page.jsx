"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { apiFetch } from "@/lib/api";

import {
  LayoutDashboard,
  CalendarDays,
  NotebookPen,
  ClipboardCheck,
  BookOpen,
  ClipboardList,
  HelpCircle,
  ChevronRight,
  Users,
  Clock3,
  Bell,
  AlertCircle,
  ArrowUpRight,
  GraduationCap,
  CalendarCheck2,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";

const quickMenu = [
  { id: "jadwal", title: "Jadwal Mengajar", desc: "Lihat jadwal dan agenda mengajar", icon: CalendarDays, path: "/guru/jadwal" },
  { id: "nilai", title: "Kelola Nilai", desc: "Periksa pengumpulan dan penilaian", icon: NotebookPen, path: "/guru/nilai" },
  { id: "absensi", title: "Absensi", desc: "Pantau kehadiran siswa", icon: ClipboardCheck, path: "/guru/absensi" },
  { id: "materi", title: "Materi Pembelajaran", desc: "Kelola bahan ajar", icon: BookOpen, path: "/guru/materi" },
  { id: "tugas", title: "Tugas Siswa", desc: "Pantau tugas dan pengumpulan", icon: ClipboardList, path: "/guru/tugas" },
  { id: "quiz", title: "Quiz & CBT", desc: "Kelola evaluasi pembelajaran", icon: HelpCircle, path: "/guru/quiz" },
];

const themeCard =
  "rounded-2xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] theme-card shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themePrimary = "text-[var(--color-primary)]";
const themeSoft = "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";
const themeMuted = "theme-text-muted";

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

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Tanggal dalam zona waktu Jakarta (WIB).
 * Dipakai untuk mencocokkan catatan absensi dengan hari ini.
 */
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

function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  // Format jam langsung dari Backend, misalnya "07:30" atau "07:30:00".
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
  if (typeof window === "undefined") return { name: "", email: "" };

  for (const key of ["user", "pengguna", "currentUser"]) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      const user = parsed?.data?.user || parsed?.user || parsed;

      if (user && typeof user === "object") {
        return {
          name: user.namaLengkap || user.name || user.nama || "",
          email: user.email || "",
        };
      }
    } catch {
      // Coba key penyimpanan berikutnya.
    }
  }

  return { name: "", email: "" };
}

function getStoredUserId() {
  if (typeof window === "undefined") return "";

  for (const key of ["user", "pengguna", "currentUser"]) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      const user = parsed?.data?.user || parsed?.user || parsed;
      const id = user?.id || user?.userId || user?.penggunaId;

      if (id) return String(id);
    } catch {
      // Coba key penyimpanan berikutnya.
    }
  }

  return "";
}

function StatCard({ title, value, subtitle, Icon }) {
  return (
    <div className={`${themeCard} min-w-0 p-4 sm:p-5`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themeSoft} ${themePrimary}`}>
          <Icon size={19} />
        </div>
        <div className="min-w-0">
          <p className={`truncate text-xs ${themeMuted}`}>{title}</p>
          <p className="mt-1 text-xl font-bold theme-text">{value}</p>
          <p className={`mt-1 text-[10px] ${themeMuted}`}>{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ABSENSI GURU — REVISI
========================================================= */

/**
 * Menentukan tanggal absensi dengan prioritas:
 * 1. Waktu masuk/keluar (paling akurat).
 * 2. DibuatPada.
 * 3. Tanggal shift (fallback terakhir).
 */
function getAttendanceDate(item) {
  if (!item) return "";

  const todayKey = getJakartaDateString(new Date());

  // Waktu masuk/keluar lebih akurat daripada tanggal shift.
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
      (item) =>
        item.date &&
        !Number.isNaN(item.timestamp)
    );

  // Jika salah satu waktu absensi terjadi hari ini, tampilkan catatannya.
  if (timestamps.some((item) => item.date === todayKey)) {
    return todayKey;
  }

  if (timestamps.length > 0) {
    timestamps.sort((a, b) => b.timestamp - a.timestamp);
    return timestamps[0].date;
  }

  // Gunakan tanggal shift hanya jika tidak ada timestamp absensi.
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

  // Periksa juga kemungkinan data tersimpan dalam objek relasi.
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

/* =========================================================
   HALAMAN
========================================================= */

export default function GuruDashboardPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState({ name: "", email: "" });
  const [kelasMapel, setKelasMapel] = useState([]);
  const [jadwal, setJadwal] = useState([]);
  const [notifikasi, setNotifikasi] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [attendanceByClass, setAttendanceByClass] = useState({});
  const [attendanceToday, setAttendanceToday] = useState(null);
  const [attendanceTodayError, setAttendanceTodayError] = useState("");
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [taskCountAvailable, setTaskCountAvailable] = useState(true);

  const today = useMemo(() => new Date(), []);
  const todayString = getLocalDateString();

  /* =======================================================
     LOAD ATTENDANCE TODAY (REVISI)
  ======================================================= */

  const loadAttendanceToday = useCallback(async () => {
    try {
      setAttendanceTodayError("");

      const response = await apiFetch(
        "/api/absensi/shift-saya?page=1&limit=100"
      );

      const records = getArrayPayload(response);
      const todayKey = getJakartaDateString(new Date());

      const todayRecords = records.filter(
        (item) => getAttendanceDate(item) === todayKey
      );

      todayRecords.sort((a, b) => {
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

        return getLatestTimestamp(b) - getLatestTimestamp(a);
      });

      setAttendanceToday(todayRecords[0] || null);
    } catch (err) {
      setAttendanceToday(null);
      setAttendanceTodayError(
        err?.message || "Data absensi guru gagal dimuat."
      );
    }
  }, []);

  /* =======================================================
     LOAD DASHBOARD (REVISI bagian filter absensi)
  ======================================================= */

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        setUser(getUserFromStorage());

        const [kelasResult, jadwalResult, notificationResult, attendanceResult] =
          await Promise.allSettled([
            apiFetch("/api/kelas-mapel"),
            apiFetch("/api/jadwal-mengajar"),
            apiFetch("/api/notifikasi"),
            apiFetch("/api/absensi/shift-saya?page=1&limit=100"),
          ]);

        const kelasPayload =
          kelasResult.status === "fulfilled"
            ? getPayload(kelasResult.value)
            : [];

        const jadwalPayload =
          jadwalResult.status === "fulfilled"
            ? getPayload(jadwalResult.value)
            : [];

        const notificationPayload =
          notificationResult.status === "fulfilled"
            ? getPayload(notificationResult.value)
            : null;

        const kelasList = Array.isArray(kelasPayload)
          ? kelasPayload
          : Array.isArray(kelasPayload?.items)
            ? kelasPayload.items
            : [];

        const jadwalList = Array.isArray(jadwalPayload)
          ? jadwalPayload
          : Array.isArray(jadwalPayload?.items)
            ? jadwalPayload.items
            : [];

        const notifList = Array.isArray(notificationPayload?.list)
          ? notificationPayload.list
          : Array.isArray(notificationPayload)
            ? notificationPayload
            : [];

        setNotifikasi(notifList);
        setUnreadCount(Number(notificationPayload?.unreadCount || 0));

        // ===================================================
        // Ambil catatan absensi shift hari ini berdasarkan
        // waktu Jakarta (REVISI).
        // ===================================================
        if (attendanceResult.status === "fulfilled") {
          const attendanceRecords = getArrayPayload(
            attendanceResult.value
          );

          const todayKey = getJakartaDateString(new Date());

          const todayRecords = attendanceRecords.filter(
            (item) => getAttendanceDate(item) === todayKey
          );

          todayRecords.sort((a, b) => {
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

            return getLatestTimestamp(b) - getLatestTimestamp(a);
          });

          setAttendanceToday(todayRecords[0] || null);
          setAttendanceTodayError("");
        } else {
          setAttendanceToday(null);
          setAttendanceTodayError(
            attendanceResult.reason?.message ||
              "Data absensi guru gagal dimuat."
          );
        }

        const storedUserId = getStoredUserId();

        const teacherSchedule = storedUserId
          ? jadwalList.filter(
              (item) =>
                String(item?.kelasMapel?.guruPengajar?.id || "") === storedUserId ||
                String(item?.kelasMapel?.guruPengajarId || "") === storedUserId
            )
          : [];

        const teacherClassMapel = storedUserId
          ? kelasList.filter(
              (item) =>
                String(item?.guruPengajarId || "") === storedUserId ||
                String(item?.guruPengajar?.id || "") === storedUserId
            )
          : [];

        setJadwal(
          teacherSchedule.filter(
            (item) => normalizeDay(item.hari) === getTodayName()
          )
        );

        setKelasMapel(teacherClassMapel);

        const uniqueClasses = [
          ...new Map(
            teacherClassMapel
              .filter((item) => item?.kelas?.id)
              .map((item) => [item.kelas.id, item.kelas])
          ).values(),
        ];

        const attendanceEntries = await Promise.all(
          uniqueClasses.map(async (kelas) => {
            try {
              const response = await apiFetch(
                `/api/absensi/kelas/${encodeURIComponent(kelas.id)}?tanggal=${encodeURIComponent(todayString)}`
              );

              const records = getArrayPayload(response);
              const present = records.filter((item) =>
                isPresentStatus(item.status)
              ).length;

              return [
                kelas.id,
                {
                  id: kelas.id,
                  name: kelas.nama || kelas.namaKelas || "Kelas",
                  totalRecorded: records.length,
                  present,
                  absent: records.length - present,
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
                  percentage: null,
                },
              ];
            }
          })
        );

        setAttendanceByClass(Object.fromEntries(attendanceEntries));

        let pendingCount = 0;
        let taskDataFailed = false;

        try {
          const taskLists = await Promise.all(
            teacherClassMapel.map(async (item) => {
              if (!item?.id) return [];

              try {
                const response = await apiFetch(
                  `/api/tugas/kelas-mapel/${encodeURIComponent(item.id)}`
                );
                const tasks = getArrayPayload(response);
                return tasks;
              } catch {
                taskDataFailed = true;
                return [];
              }
            })
          );

          const tasks = taskLists.flat();

          const submissionLists = await Promise.all(
            tasks.map(async (task) => {
              if (!task?.id) return [];

              try {
                const response = await apiFetch(
                  `/api/tugas/${encodeURIComponent(task.id)}/pengumpulan`
                );
                return getArrayPayload(response);
              } catch {
                taskDataFailed = true;
                return [];
              }
            })
          );

          for (const submissions of submissionLists) {
            for (const submission of submissions) {
              const status = String(submission?.status || "").toLowerCase();
              const hasGrade =
                submission?.nilai !== null &&
                submission?.nilai !== undefined;

              if (status !== "dinilai" && !hasGrade) pendingCount += 1;
            }
          }
        } catch {
          taskDataFailed = true;
        }

        setPendingSubmissions(pendingCount);
        setTaskCountAvailable(!taskDataFailed);

        if (
          kelasResult.status === "rejected" &&
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
    [todayString]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /*
   * Sinkronkan identitas pengguna bila sesi berubah
   * (pada tab ini atau tab lain), agar nama profil di dashboard
   * tidak tertinggal data akun sebelumnya.
   */
  useEffect(() => {
    const syncUser = () => setUser(getUserFromStorage());

    // Sesi disimpan di localStorage: cukup reaksi event `user-updated` tab ini.
    window.addEventListener("user-updated", syncUser);

    return () => {
      window.removeEventListener("user-updated", syncUser);
    };
  }, []);

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

    return {
      totalRecorded,
      totalPresent,
      totalAbsent: totalRecorded - totalPresent,
      percentage:
        totalRecorded > 0
          ? Math.round((totalPresent / totalRecorded) * 100)
          : null,
    };
  }, [attendanceByClass]);

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

  async function markNotificationAsRead(item) {
    if (!item?.id || item.dibaca) return;

    try {
      await apiFetch(
        `/api/notifikasi/${encodeURIComponent(item.id)}/read`,
        { method: "PATCH" }
      );

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
      await apiFetch("/api/notifikasi/read-all", { method: "PATCH" });
      setNotifikasi((previous) =>
        previous.map((item) => ({ ...item, dibaca: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err?.message || "Notifikasi gagal diperbarui.");
    }
  }

  const displayName = user.name || user.email?.split("@")[0] || "Guru";

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="dashboard"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen((value) => !value)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header
            toggleSidebar={() => setSidebarOpen((value) => !value)}
            notifications={headerNotifications}
            user={{
              name: displayName,
              email: user.email || "",
              avatar: getInitials(displayName, user.email),
            }}
          />
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1600px] p-3 sm:p-4 md:p-5 lg:p-6">
            <div className="space-y-5 lg:space-y-6">
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
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

              <section className={`${themeCard} relative overflow-hidden p-5 sm:p-6 lg:p-7`}>
                <div className={`pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full ${themeSoft}`} />
                <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themeSoft} ${themePrimary}`}>
                      <LayoutDashboard size={21} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-medium ${themePrimary}`}>Dashboard Guru</p>
                      <h1 className="mt-1 break-words text-xl font-bold theme-text sm:text-2xl">
                        Selamat datang, {displayName}
                      </h1>
                      <p className="mt-2 max-w-2xl text-xs leading-relaxed theme-text-secondary sm:text-sm">
                        Pantau jadwal mengajar, pengumpulan tugas, absensi, dan notifikasi dari satu tempat.
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-3 sm:justify-start">
                    <CalendarDays size={17} className={themePrimary} />
                    <span className="text-xs font-semibold theme-text">{formatDate(today)}</span>
                    <button
                      type="button"
                      title="Muat ulang data"
                      onClick={() => loadDashboard(true)}
                      disabled={refreshing}
                      className="ml-1 rounded-lg p-2 theme-text-secondary hover:bg-black/5 disabled:opacity-50"
                    >
                      <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                    </button>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Kelas Diampu" value={loading ? "…" : uniqueClassCount} subtitle="Kelas unik dari kelas-mapel" Icon={GraduationCap} />
                <StatCard title="Siswa Diampu" value="—" subtitle="Jumlah anggota kelas belum tersedia" Icon={Users} />
                <StatCard
                  title="Pengumpulan Belum Dinilai"
                  value={loading ? "…" : taskCountAvailable ? pendingSubmissions : "—"}
                  subtitle={taskCountAvailable ? "Berdasarkan pengumpulan siswa" : "Data penilaian belum berhasil dimuat"}
                  Icon={ClipboardList}
                />
                <StatCard
                  title="Kehadiran Siswa Hari Ini"
                  value={loading ? "…" : attendanceSummary.percentage === null ? "—" : `${attendanceSummary.percentage}%`}
                  subtitle="Dari catatan absensi kelas"
                  Icon={CalendarCheck2}
                />
              </section>

              {/* KEHADIRAN GURU: waktu aktual dari Backend */}
              <section className={`${themeCard} min-w-0 overflow-hidden`}>
                <div className="flex items-center gap-3 border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] p-4 sm:p-5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeSoft} ${themePrimary}`}>
                    <Clock3 size={17} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold theme-text">Kehadiran hari ini</h2>
                    <p className={`mt-1 text-xs ${themeMuted}`}>
                      Waktu absensi dicatat oleh Backend.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadDashboard(true)}
                    disabled={refreshing}
                    title="Perbarui data kehadiran"
                    className={`ml-auto rounded-lg p-2 ${themeMuted} hover:bg-black/5 disabled:opacity-50`}
                  >
                    <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
                  <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-4">
                    <p className={`text-xs ${themeMuted}`}>Jam masuk</p>
                    <p className="mt-2 text-2xl font-bold theme-text">
                      {getAttendanceTime(attendanceToday, "masuk")
                        ? formatTime(getAttendanceTime(attendanceToday, "masuk"))
                        : "-"}
                    </p>
                    <p className={`mt-1 text-xs ${themeMuted}`}>
                      {getAttendanceTime(attendanceToday, "masuk")
                        ? "Check-in tercatat"
                        : "Belum ada check-in"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-4">
                    <p className={`text-xs ${themeMuted}`}>Jam pulang</p>
                    <p className="mt-2 text-2xl font-bold theme-text">
                      {getAttendanceTime(attendanceToday, "keluar")
                        ? formatTime(getAttendanceTime(attendanceToday, "keluar"))
                        : "-"}
                    </p>
                    <p className={`mt-1 text-xs ${themeMuted}`}>
                      {getAttendanceTime(attendanceToday, "keluar")
                        ? "Check-out tercatat"
                        : "Belum ada check-out"}
                    </p>
                  </div>
                </div>

                {attendanceTodayError ? (
                  <div className="mx-4 mb-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 sm:mx-5">
                    <p className="text-xs text-red-500">{attendanceTodayError}</p>
                  </div>
                ) : !attendanceToday ? (
                  <p className={`px-4 pb-4 text-xs ${themeMuted} sm:px-5`}>
                    Belum ditemukan catatan absensi shift untuk hari ini. Pastikan guru sudah melakukan check-in dan memiliki shift kerja.
                  </p>
                ) : (
                  <div className="px-4 pb-4 sm:px-5">
                    <p className={`text-xs ${themeMuted}`}>
                      Status: <span className="font-semibold theme-text">{attendanceToday.statusShift || attendanceToday.status || "Tercatat"}</span>
                      {attendanceToday.shiftKerja?.nama
                        ? ` · Shift ${attendanceToday.shiftKerja.nama}`
                        : ""}
                    </p>
                  </div>
                )}
              </section>

              {/* AKSES CEPAT */}
              <section>
                <div className="mb-3">
                  <h2 className="text-sm font-bold theme-text sm:text-base">Akses Cepat</h2>
                  <p className={`mt-1 text-xs ${themeMuted}`}>Kelola aktivitas pembelajaran</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {quickMenu.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => router.push(item.path)}
                        className={`${themeCard} group flex min-w-0 items-center gap-4 p-4 text-left transition hover:-translate-y-0.5`}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themeSoft} ${themePrimary}`}>
                          <Icon size={19} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="truncate text-sm font-semibold theme-text">{item.title}</h3>
                            <ChevronRight size={15} className={`shrink-0 ${themeMuted}`} />
                          </div>
                          <p className="mt-1 text-xs theme-text-secondary">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* JADWAL DAN NOTIFIKASI */}
              <section className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-3">
                <div className={`${themeCard} min-w-0 overflow-hidden xl:col-span-2`}>
                  <div className="flex items-center justify-between gap-3 border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeSoft} ${themePrimary}`}>
                        <Clock3 size={17} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold theme-text">Jadwal Hari Ini</h2>
                        <p className={`mt-1 text-xs ${themeMuted}`}>{formatDate(today)}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => router.push("/guru/jadwal")} className={`flex items-center gap-1 text-xs font-semibold ${themePrimary}`}>
                      Lihat jadwal <ChevronRight size={13} />
                    </button>
                  </div>

                  {loading ? (
                    <p className="p-5 text-sm theme-text-secondary">Memuat jadwal…</p>
                  ) : jadwal.length === 0 ? (
                    <div className="p-6 text-center">
                      <CalendarDays size={25} className={`mx-auto ${themeMuted}`} />
                      <p className="mt-3 text-sm font-semibold theme-text">Belum ada jadwal yang dapat ditampilkan</p>
                      <p className={`mt-1 text-xs ${themeMuted}`}>Periksa penugasan guru pada kelas-mapel dan data jadwal di Backend.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                      {jadwal.map((item, index) => {
                        const status = getScheduleStatus(item);
                        const kelasMapelItem = item.kelasMapel || {};

                        return (
                          <div key={item.id || `${index}-${item.jamMulai}`} className={`flex min-w-0 items-center gap-3 p-4 sm:p-5 ${status === "Berlangsung" ? "bg-[color-mix(in_srgb,var(--color-info)_7%,transparent)]" : ""}`}>
                            <div className="w-[78px] shrink-0">
                              <p className="text-xs font-bold theme-text">{formatTime(item.jamMulai)}</p>
                              <p className={`mt-1 text-[10px] ${themeMuted}`}>{formatTime(item.jamSelesai)}</p>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold theme-text">
                                {kelasMapelItem.mataPelajaran?.nama || kelasMapelItem.mataPelajaran?.namaMapel || "Mata pelajaran"}
                              </p>
                              <p className={`mt-1 text-xs ${themeMuted}`}>
                                {kelasMapelItem.kelas?.nama || kelasMapelItem.kelas?.namaKelas || "Kelas belum tersedia"}
                                {item.ruangan ? ` · ${item.ruangan}` : ""}
                              </p>
                            </div>
                            <span className="hidden rounded-full border border-[color-mix(in_srgb,var(--color-text)_12%,transparent)] px-2 py-1 text-[10px] theme-text-secondary sm:inline-flex">
                              {status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className={`${themeCard} min-w-0 overflow-hidden`}>
                  <div className="flex items-center justify-between gap-3 border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeSoft} ${themePrimary}`}>
                        <Bell size={17} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold theme-text">Notifikasi</h2>
                        <p className={`mt-1 text-xs ${themeMuted}`}>Informasi akun kamu</p>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${themeSoft} ${themePrimary}`}>
                        {unreadCount} baru
                      </span>
                    )}
                  </div>

                  {loading ? (
                    <p className="p-4 text-sm theme-text-secondary">Memuat notifikasi…</p>
                  ) : notifikasi.length === 0 ? (
                    <p className="p-5 text-sm theme-text-secondary">Belum ada notifikasi.</p>
                  ) : (
                    <div className="divide-y divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                      {notifikasi.slice(0, 5).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => markNotificationAsRead(item)}
                          className="flex w-full gap-3 p-4 text-left transition hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"
                        >
                          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.dibaca ? "bg-[var(--color-text-muted)]" : "bg-[var(--color-primary)]"}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold theme-text">{item.judul || "Notifikasi"}</p>
                            <p className="mt-1 line-clamp-2 text-xs theme-text-secondary">{item.isi || "Tidak ada detail."}</p>
                            <p className={`mt-1 text-[10px] ${themeMuted}`}>
                              {item.dibuatPada ? new Date(item.dibuatPada).toLocaleString("id-ID") : ""}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsAsRead}
                      className={`w-full border-t border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] p-3 text-xs font-semibold ${themePrimary}`}
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                </div>
              </section>

              {/* REKAP KEHADIRAN SISWA PER KELAS */}
              <section className={`${themeCard} min-w-0 overflow-hidden`}>
                <div className="flex items-center justify-between gap-3 border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeSoft} ${themePrimary}`}>
                      <CalendarCheck2 size={17} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold theme-text">Kehadiran per Kelas</h2>
                      <p className={`mt-1 text-xs ${themeMuted}`}>Berdasarkan catatan absensi hari ini</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => router.push("/guru/absensi")} className={`flex items-center gap-1 text-xs font-semibold ${themePrimary}`}>
                    Lihat absensi <ChevronRight size={13} />
                  </button>
                </div>

                {loading ? (
                  <p className="p-5 text-sm theme-text-secondary">Memuat data absensi…</p>
                ) : Object.keys(attendanceByClass).length === 0 ? (
                  <p className="p-5 text-sm theme-text-secondary">Belum ada data kelas yang dapat ditampilkan.</p>
                ) : (
                  <div className="space-y-5 p-4 sm:p-5">
                    {Object.values(attendanceByClass).map((item) => (
                      <div key={item.id} className="min-w-0">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold theme-text sm:text-sm">{item.name}</p>
                            <p className={`mt-1 text-[10px] ${themeMuted}`}>
                              {item.totalRecorded === null
                                ? "Data absensi tidak tersedia"
                                : `${item.present} hadir dari ${item.totalRecorded} catatan absensi`}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs font-semibold theme-text-secondary">
                            {item.percentage === null ? "—" : `${item.percentage}%`}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]">
                          <div className="h-full rounded-full bg-[var(--color-primary)] transition-all" style={{ width: `${item.percentage ?? 0}%` }} />
                        </div>
                      </div>
                    ))}

                    <div className="grid grid-cols-1 gap-3 border-t border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] pt-4 sm:grid-cols-3">
                      <div>
                        <p className={`text-xs ${themeMuted}`}>Catatan absensi</p>
                        <p className="mt-1 text-lg font-bold theme-text">{attendanceSummary.totalRecorded}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${themeMuted}`}>Hadir / terlambat</p>
                        <p className="mt-1 text-lg font-bold theme-text">{attendanceSummary.totalPresent}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${themeMuted}`}>Catatan tidak hadir</p>
                        <p className="mt-1 text-lg font-bold theme-text">{attendanceSummary.totalAbsent}</p>
                      </div>
                    </div>

                    <p className={`text-[10px] leading-relaxed ${themeMuted}`}>
                      Persentase dihitung dari catatan absensi yang dikembalikan API, bukan dari jumlah seluruh siswa terdaftar.
                    </p>
                  </div>
                )}
              </section>

              {/* PENGINGAT */}
              <section className="rounded-2xl border border-[color-mix(in_srgb,var(--color-info)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--color-info)_22%,transparent)] theme-card">
                    <AlertCircle size={17} className="text-[var(--color-info)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold theme-text">Pengingat penilaian</p>
                    <p className="mt-1 text-xs leading-relaxed theme-text-secondary">
                      {taskCountAvailable
                        ? `Terdapat ${pendingSubmissions} pengumpulan siswa yang belum terdeteksi selesai dinilai.`
                        : "Data pengumpulan belum berhasil diambil. Periksa izin akses dan endpoint tugas."}
                    </p>
                  </div>
                  <button type="button" onClick={() => router.push("/guru/nilai")} className={`hidden shrink-0 items-center gap-1 rounded-lg border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] px-3 py-2 text-xs font-semibold sm:flex ${themePrimary}`}>
                    Periksa nilai <ArrowUpRight size={13} />
                  </button>
                </div>
                <button type="button" onClick={() => router.push("/guru/nilai")} className={`mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-2 text-xs font-semibold sm:hidden ${themePrimary}`}>
                  Periksa nilai <ArrowUpRight size={13} />
                </button>
              </section>

              {/* AKTIVITAS */}
              <section className={`${themeCard} p-4 sm:p-5`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeSoft} ${themePrimary}`}>
                    <MoreHorizontal size={17} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold theme-text">Aktivitas Terbaru</h2>
                    <p className={`mt-1 text-xs ${themeMuted}`}>
                      Belum tersedia endpoint aktivitas khusus guru pada route yang diperiksa.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}