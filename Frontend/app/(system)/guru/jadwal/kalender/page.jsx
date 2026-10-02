// app/guru/jadwal/kalender/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plus,
  Home,
  CalendarDays,
  CheckCircle,
  XCircle,
  Building2,
  Sparkles,
  Sun,
  Award,
  Bell,
  Timer,
  CalendarCheck,
  CalendarOff,
  ClockArrowUp,
  Star,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import { getJadwalMengajar } from "../../../../../services/jadwalMengajar.service";

// ============================================================
// THEME HELPERS
// ============================================================

// FIX: themeCard sebelumnya belum didefinisikan
const themeCard = "theme-card";

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

// ============================================================
// CONSTANT
// ============================================================

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const dayNames = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const subjectColors = [
  "#2563EB",
  "#0D9488",
  "#059669",
  "#DC2626",
  "#0891B2",
  "#D97706",
  "#7C3AED",
  "#DB2777",
  "#F59E0B",
  "#4F46E5",
];

const getDayName = (dayIndex) => {
  return dayNames[dayIndex] ?? "";
};

// ============================================================
// NORMALIZER
// ============================================================

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function normalizeDay(value) {
  return normalizeText(value);
}

function normalizeEmail(value) {
  return normalizeText(value);
}

// ============================================================
// TOKEN / USER
// ============================================================

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const tokenKeys = [
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "jwt",
  ];

  for (const key of tokenKeys) {
    const value = localStorage.getItem(key);

    if (value && value.trim()) {
      return value
        .trim()
        .replace(/^Bearer\s+/i, "");
    }
  }

  return null;
}

function getCurrentUserFromToken() {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    let base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    base64 += "=".repeat(
      (4 - (base64.length % 4)) % 4
    );

    const binary = atob(base64);

    const bytes = Uint8Array.from(
      binary,
      (char) => char.charCodeAt(0)
    );

    const json = new TextDecoder().decode(bytes);

    const payload = JSON.parse(json);

    return {
      id:
        payload?.userId ??
        payload?.id ??
        payload?.sub ??
        null,

      name:
        payload?.namaLengkap ??
        payload?.name ??
        payload?.nama ??
        null,

      email: payload?.email ?? null,

      username:
        payload?.username ??
        payload?.userName ??
        null,

      sekolahId:
        payload?.sekolahId ?? null,

      role:
        payload?.role ??
        payload?.peran ??
        null,
    };
  } catch (error) {
    console.error(
      "[KALENDER GURU] Gagal membaca JWT:",
      error
    );

    return null;
  }
}

// ============================================================
// SUBJECT COLOR
// ============================================================

function getSubjectColor(
  subjectId,
  subjectName
) {
  const source = String(
    subjectId ||
      subjectName ||
      "subject"
  );

  let hash = 0;

  for (let i = 0; i < source.length; i++) {
    hash =
      source.charCodeAt(i) +
      ((hash << 5) - hash);
  }

  const index =
    Math.abs(hash) %
    subjectColors.length;

  return subjectColors[index];
}

// ============================================================
// NORMALIZE BACKEND SCHEDULE
// ============================================================

function normalizeSchedule(schedule) {
  const kelasMapel =
    schedule?.kelasMapel || {};

  const kelas =
    kelasMapel?.kelas || {};

  const mataPelajaran =
    kelasMapel?.mataPelajaran || {};

  const guru =
    kelasMapel?.guruPengajar || {};

  const subjectId =
    kelasMapel?.mataPelajaranId ??
    mataPelajaran?.id ??
    "";

  const subjectName =
    mataPelajaran?.nama ??
    "Mata Pelajaran";

  const teacherId =
    kelasMapel?.guruPengajarId ??
    guru?.id ??
    "";

  const teacherName =
    guru?.namaLengkap ??
    guru?.nama ??
    "";

  const teacherEmail =
    guru?.email ??
    "";

  return {
    id: schedule?.id ?? "",

    kelasMapelId:
      schedule?.kelasMapelId ??
      kelasMapel?.id ??
      "",

    day: normalizeDay(
      schedule?.hari
    ),

    startTime:
      schedule?.jamMulai ?? "",

    endTime:
      schedule?.jamSelesai ?? "",

    roomName:
      schedule?.ruangan ?? "",

    subjectId,

    subjectName,

    subjectCode:
      mataPelajaran?.kode ?? "",

    subjectColor:
      getSubjectColor(
        subjectId,
        subjectName
      ),

    classId:
      kelasMapel?.kelasId ??
      kelas?.id ??
      "",

    className:
      kelas?.nama ?? "Kelas",

    teacherId,

    teacherName,

    teacherEmail,

    schoolId:
      kelas?.sekolahId ??
      schedule?.sekolahId ??
      null,

    notes:
      schedule?.keterangan ?? "",

    raw: schedule,
  };
}

// ============================================================
// TIME HELPERS
// ============================================================

function timeToMinutes(time) {
  if (
    !time ||
    !String(time).includes(":")
  ) {
    return 0;
  }

  const [hour, minute] =
    String(time)
      .split(":")
      .map(Number);

  return (
    (Number.isFinite(hour)
      ? hour
      : 0) *
      60 +
    (Number.isFinite(minute)
      ? minute
      : 0)
  );
}

function getDurationInMinutes(
  start,
  end
) {
  return Math.max(
    0,
    timeToMinutes(end) -
      timeToMinutes(start)
  );
}

function formatDuration(
  totalMinutes
) {
  const hours = Math.floor(
    totalMinutes / 60
  );

  const minutes =
    totalMinutes % 60;

  if (
    hours === 0 &&
    minutes === 0
  ) {
    return "0j 0m";
  }

  return `${hours}j ${minutes}m`;
}

// ============================================================
// DATE HELPERS
// ============================================================

function isSameDate(
  dateA,
  dateB
) {
  return (
    dateA.getFullYear() ===
      dateB.getFullYear() &&
    dateA.getMonth() ===
      dateB.getMonth() &&
    dateA.getDate() ===
      dateB.getDate()
  );
}

function getWeekDays(
  baseDate
) {
  const date = new Date(
    baseDate
  );

  const day = date.getDay();

  const diff =
    day === 0
      ? -6
      : 1 - day;

  const weekStart =
    new Date(date);

  weekStart.setDate(
    date.getDate() + diff
  );

  return Array.from(
    { length: 7 },
    (_, index) => {
      const current =
        new Date(
          weekStart
        );

      current.setDate(
        weekStart.getDate() +
          index
      );

      return current;
    }
  );
}

// ============================================================
// COMPONENT
// ============================================================

export default function KalenderGuruPage() {
  const router = useRouter();

  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);

  const [
    schedules,
    setSchedules,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    () => new Date()
  );

  const [
    viewDate,
    setViewDate,
  ] = useState(
    () => new Date()
  );

  const [
    filterClass,
    setFilterClass,
  ] = useState("all");

  const [
    filterSubject,
    setFilterSubject,
  ] = useState("all");

  useEffect(() => {
    const user =
      getCurrentUserFromToken();

    console.log(
      "[KALENDER GURU] USER LOGIN:",
      user
    );

    setCurrentUser(user);
  }, []);

  const loadSchedules =
    async () => {
      try {
        setLoading(true);
        setError("");

        const user =
          getCurrentUserFromToken();

        if (!user) {
          throw new Error(
            "Data user tidak ditemukan dari token login. Silakan login kembali."
          );
        }

        setCurrentUser(user);

        const response =
          await getJadwalMengajar();

        console.log(
          "[KALENDER GURU] RESPONSE API:",
          response
        );

        if (
          !response?.success
        ) {
          throw new Error(
            response?.message ||
              "Gagal mengambil jadwal mengajar."
          );
        }

        const backendSchedules =
          Array.isArray(
            response?.data
          )
            ? response.data
            : [];

        const teacherSchedules =
          backendSchedules.filter(
            (item) => {
              const guru =
                item
                  ?.kelasMapel
                  ?.guruPengajar;

              const guruId =
                guru?.id ??
                item
                  ?.kelasMapel
                  ?.guruPengajarId ??
                "";

              const guruEmail =
                guru?.email ?? "";

              const guruName =
                guru?.namaLengkap ??
                guru?.nama ??
                "";

              const userId =
                user?.id ?? "";

              const userEmail =
                user?.email ?? "";

              const userName =
                user?.name ?? "";

              const matchById =
                Boolean(
                  guruId &&
                    userId
                ) &&
                String(
                  guruId
                ) ===
                  String(
                    userId
                  );

              const matchByEmail =
                Boolean(
                  guruEmail &&
                    userEmail
                ) &&
                normalizeEmail(
                  guruEmail
                ) ===
                  normalizeEmail(
                    userEmail
                  );

              const matchByName =
                Boolean(
                  guruName &&
                    userName
                ) &&
                normalizeText(
                  guruName
                ) ===
                  normalizeText(
                    userName
                  );

              return (
                matchById ||
                matchByEmail ||
                matchByName
              );
            }
          );

        const normalized =
          teacherSchedules
            .map(
              normalizeSchedule
            )
            .filter(
              (item) =>
                item.id &&
                item.day &&
                item.startTime &&
                item.endTime
            );

        setSchedules(
          normalized
        );

        if (
          backendSchedules.length >
            0 &&
          normalized.length === 0
        ) {
          console.warn(
            "[KALENDER GURU] API memiliki jadwal, tetapi tidak ada yang cocok dengan user login."
          );
        }
      } catch (err) {
        console.error(
          "[KALENDER GURU] ERROR:",
          err
        );

        setSchedules([]);

        setError(
          err?.message ||
            "Gagal mengambil jadwal mengajar dari backend."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadSchedules();
  }, []);

  const today = new Date();

  const weekDays =
    useMemo(
      () =>
        getWeekDays(
          viewDate
        ),
      [viewDate]
    );

  const classOptions =
    useMemo(() => {
      const map = new Map();

      schedules.forEach(
        (schedule) => {
          if (
            schedule.classId
          ) {
            map.set(
              schedule.classId,
              {
                id:
                  schedule.classId,
                name:
                  schedule.className,
              }
            );
          }
        }
      );

      return Array.from(
        map.values()
      ).sort(
        (a, b) =>
          a.name.localeCompare(
            b.name,
            "id"
          )
      );
    }, [schedules]);

  const subjectOptions =
    useMemo(() => {
      const map = new Map();

      schedules.forEach(
        (schedule) => {
          if (
            schedule.subjectId
          ) {
            map.set(
              schedule.subjectId,
              {
                id:
                  schedule.subjectId,
                name:
                  schedule.subjectName,
              }
            );
          }
        }
      );

      return Array.from(
        map.values()
      ).sort(
        (a, b) =>
          a.name.localeCompare(
            b.name,
            "id"
          )
      );
    }, [schedules]);

  const selectedDay =
    selectedDate.getDay();

  const selectedDayName =
    normalizeDay(
      getDayName(
        selectedDay
      )
    );

  const selectedDayDisplay =
    getDayName(
      selectedDay
    );

  const filteredSchedules =
    useMemo(() => {
      return schedules
        .filter(
          (schedule) =>
            normalizeDay(
              schedule.day
            ) ===
            selectedDayName
        )
        .filter(
          (schedule) =>
            filterClass ===
              "all" ||
            String(
              schedule.classId
            ) ===
              String(
                filterClass
              )
        )
        .filter(
          (schedule) =>
            filterSubject ===
              "all" ||
            String(
              schedule.subjectId
            ) ===
              String(
                filterSubject
              )
        )
        .sort(
          (a, b) =>
            timeToMinutes(
              a.startTime
            ) -
            timeToMinutes(
              b.startTime
            )
        );
    }, [
      schedules,
      selectedDayName,
      filterClass,
      filterSubject,
    ]);

  const totalMinutes =
    useMemo(() => {
      return filteredSchedules.reduce(
        (
          total,
          schedule
        ) =>
          total +
          getDurationInMinutes(
            schedule.startTime,
            schedule.endTime
          ),
        0
      );
    }, [filteredSchedules]);

  const totalSessions =
    filteredSchedules.length;

  const uniqueClasses =
    useMemo(() => {
      return [
        ...new Set(
          filteredSchedules
            .map(
              (
                schedule
              ) =>
                schedule.className
            )
            .filter(Boolean)
        ),
      ];
    }, [filteredSchedules]);

  const uniqueSubjects =
    useMemo(() => {
      return [
        ...new Set(
          filteredSchedules
            .map(
              (
                schedule
              ) =>
                schedule.subjectName
            )
            .filter(Boolean)
        ),
      ];
    }, [filteredSchedules]);

  const nextSchedule =
    useMemo(() => {
      if (
        filteredSchedules.length ===
        0
      ) {
        return null;
      }

      const nowDate =
        new Date();

      const selectedIsToday =
        isSameDate(
          selectedDate,
          nowDate
        );

      if (
        !selectedIsToday
      ) {
        return (
          filteredSchedules[0] ||
          null
        );
      }

      const nowMinutes =
        nowDate.getHours() *
          60 +
        nowDate.getMinutes();

      return (
        filteredSchedules.find(
          (
            schedule
          ) =>
            timeToMinutes(
              schedule.startTime
            ) >
            nowMinutes
        ) || null
      );
    }, [
      filteredSchedules,
      selectedDate,
    ]);

  const getGreeting =
    () => {
      const hour =
        today.getHours();

      if (hour < 12) {
        return {
          text: "Selamat Pagi",
          icon: Sun,
        };
      }

      if (hour < 15) {
        return {
          text: "Selamat Siang",
          icon: Sun,
        };
      }

      if (hour < 18) {
        return {
          text: "Selamat Sore",
          icon: Sun,
        };
      }

      return {
        text: "Selamat Malam",
        icon: Moon,
      };
    };

  const greeting =
    getGreeting();

  const GreetingIcon =
    greeting.icon;

  const goToPrevWeek =
    () => {
      const date =
        new Date(
          viewDate
        );

      date.setDate(
        date.getDate() - 7
      );

      setViewDate(date);
    };

  const goToNextWeek =
    () => {
      const date =
        new Date(
          viewDate
        );

      date.setDate(
        date.getDate() + 7
      );

      setViewDate(date);
    };

  const goToToday =
    () => {
      const current =
        new Date();

      setViewDate(
        current
      );

      setSelectedDate(
        current
      );

      setFilterClass(
        "all"
      );

      setFilterSubject(
        "all"
      );
    };

  const handleDateClick =
    (date) => {
      if (!date) {
        return;
      }

      setSelectedDate(
        new Date(date)
      );
    };

  const getScheduleStatus =
    (schedule) => {
      const selected =
        new Date(
          selectedDate
        );

      const current =
        new Date();

      const selectedDayStart =
        new Date(
          selected
        );

      selectedDayStart.setHours(
        0,
        0,
        0,
        0
      );

      const todayStart =
        new Date(
          current
        );

      todayStart.setHours(
        0,
        0,
        0,
        0
      );

      if (
        selectedDayStart <
        todayStart
      ) {
        return "past";
      }

      if (
        selectedDayStart >
        todayStart
      ) {
        return "upcoming";
      }

      const nowMinutes =
        current.getHours() *
          60 +
        current.getMinutes();

      const startMinutes =
        timeToMinutes(
          schedule.startTime
        );

      const endMinutes =
        timeToMinutes(
          schedule.endTime
        );

      if (
        nowMinutes >=
          startMinutes &&
        nowMinutes <
          endMinutes
      ) {
        return "current";
      }

      if (
        nowMinutes >=
        endMinutes
      ) {
        return "past";
      }

      return "upcoming";
    };

  return (
    <div className="theme-page flex h-screen min-h-0 w-full overflow-hidden">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          user={{
            name:
              currentUser?.name ||
              "Bapak/Ibu Guru",
            email:
              currentUser?.email ||
              "guru@smartschool.com",
            avatar:
              currentUser?.name
                ? currentUser.name
                    .split(" ")
                    .map(
                      (word) =>
                        word
                          .charAt(0)
                          .toUpperCase()
                    )
                    .slice(0, 2)
                    .join("")
                : "GU",
          }}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full min-w-0 p-3 sm:p-4 lg:p-6 xl:p-8">
            <div className="mx-auto w-full min-w-0 max-w-none space-y-4 sm:space-y-5 lg:space-y-6">

              {/* HEADER */}

              <section
                className={`${themeCard} relative w-full min-w-0 overflow-hidden rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow} sm:rounded-3xl sm:p-5 lg:p-7`}
              >
                <div
                  className="pointer-events-none absolute right-0 top-0 h-56 w-56 -translate-y-1/2 translate-x-1/3 rounded-full blur-3xl"
                  style={{
                    background:
                      "color-mix(in srgb, var(--color-primary) 8%, transparent)",
                  }}
                />

                <div
                  className="pointer-events-none absolute bottom-0 left-0 h-44 w-44 -translate-x-1/4 translate-y-1/2 rounded-full blur-3xl"
                  style={{
                    background:
                      "color-mix(in srgb, var(--color-info) 7%, transparent)",
                  }}
                />

                <div className="relative flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <div
                      className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${themePrimarySoftBorder} ${themePrimarySoft} ${themeSmallShadow} sm:flex lg:h-12 lg:w-12`}
                    >
                      <GreetingIcon
                        className={`h-5 w-5 ${themePrimaryText} lg:h-6 lg:w-6`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h1 className="min-w-0 text-xl font-bold tracking-tight theme-text sm:text-2xl lg:text-3xl">
                          {greeting.text},{" "}
                          <span className={themePrimaryText}>
                            {currentUser?.name ||
                              "Bapak/Ibu Guru"}
                          </span>
                        </h1>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} px-2.5 py-1 text-xs font-medium ${themePrimaryText}`}
                        >
                          <Sparkles className="h-3 w-3" />
                          Pro
                        </span>
                      </div>

                      <div className="theme-text-secondary mt-1 flex min-w-0 items-start gap-2 text-xs sm:text-sm">
                        <CalendarDays
                          className={`mt-0.5 h-4 w-4 shrink-0 ${themePrimaryText}`}
                        />

                        <span className="min-w-0">
                          Kelola jadwal mengajar Anda dengan mudah dan profesional
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        "/guru/jadwal/kalender/buat"
                      )
                    }
                    className={`group ${themePrimaryGradient} inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition-all duration-300 hover:brightness-105 sm:w-auto`}
                  >
                    <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                    <span>Buat Jadwal</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>

                <div className="relative mt-4 grid w-full min-w-0 grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-4 sm:gap-3">
                  {[
                    {
                      label:
                        "Total Sesi Hari Ini",
                      value:
                        totalSessions,
                      icon: Clock,
                    },
                    {
                      label:
                        "Total Jam",
                      value:
                        formatDuration(
                          totalMinutes
                        ),
                      icon: Timer,
                    },
                    {
                      label: "Kelas",
                      value:
                        uniqueClasses.length ||
                        "-",
                      icon: Users,
                    },
                    {
                      label: "Mapel",
                      value:
                        uniqueSubjects.length ||
                        "-",
                      icon: BookOpen,
                    },
                  ].map(
                    (
                      stat,
                      index
                    ) => {
                      const Icon =
                        stat.icon;

                      return (
                        <div
                          key={
                            index
                          }
                          className={`min-w-0 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3 transition-all duration-300 ${themeNeutralHover}`}
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <Icon
                              className={`h-3.5 w-3.5 shrink-0 ${themePrimaryText}`}
                            />

                            <span className="theme-text-muted min-w-0 truncate text-xs font-medium">
                              {
                                stat.label
                              }
                            </span>
                          </div>

                          <p className="theme-text mt-0.5 truncate text-lg font-bold sm:text-xl">
                            {
                              stat.value
                            }
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              </section>

              {/* ERROR */}

              {error && (
                <section
                  className={`rounded-2xl border ${themeDangerBorder} ${themeDangerSurface} p-4 ${themeSmallShadow}`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <AlertCircle className="theme-danger mt-0.5 h-5 w-5 shrink-0" />

                    <div className="min-w-0 flex-1">
                      <p className="theme-danger text-sm font-semibold">
                        Gagal memuat jadwal
                      </p>

                      <p className="theme-text-secondary mt-1 text-xs leading-5 sm:text-sm">
                        {error}
                      </p>
                    </div>

                    <button
                      onClick={
                        loadSchedules
                      }
                      className={`${themeCard} theme-danger inline-flex shrink-0 items-center gap-1.5 rounded-lg border ${themeDangerBorder} px-3 py-2 text-xs font-semibold transition ${themeNeutralHover}`}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Coba lagi
                    </button>
                  </div>
                </section>
              )}

              {/* FILTER */}

              <section
                className={`${themeCard} w-full min-w-0 rounded-2xl border ${themeNeutralBorder} p-3 ${themeCardShadow} sm:p-4`}
              >
                <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                  <div
                    className={`flex shrink-0 items-center gap-2 rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} px-3 py-1.5`}
                  >
                    <Home
                      className={`h-4 w-4 ${themePrimaryText}`}
                    />

                    <span className="theme-text text-xs font-semibold sm:text-sm">
                      HARI INI
                    </span>
                  </div>

                  <span className="theme-text-secondary min-w-0 truncate text-xs font-medium sm:text-sm">
                    {selectedDate.toLocaleDateString(
                      "id-ID",
                      {
                        weekday:
                          "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </span>

                  <div
                    className={`hidden h-6 w-px ${themeNeutralSurface} lg:block`}
                  />

                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <Building2 className="theme-text-muted h-3.5 w-3.5 shrink-0" />

                      <div
                        className={`${themeCard} flex h-9 min-w-0 items-center rounded-xl border ${themeNeutralBorder} px-2.5 text-xs sm:text-sm`}
                      >
                        <span className="truncate">
                          Sekolah saya
                        </span>
                      </div>
                    </div>

                    <div className="flex min-w-0 items-center gap-1.5">
                      <Users className="theme-text-muted h-3.5 w-3.5 shrink-0" />

                      <select
                        value={
                          filterClass
                        }
                        onChange={(
                          e
                        ) =>
                          setFilterClass(
                            e.target
                              .value
                          )
                        }
                        className={`theme-input h-9 min-w-0 rounded-xl border px-2.5 text-xs outline-none transition-all ${themeFocus} sm:text-sm`}
                      >
                        <option value="all">
                          Semua Kelas
                        </option>

                        {classOptions.map(
                          (
                            item
                          ) => (
                            <option
                              key={
                                item.id
                              }
                              value={
                                item.id
                              }
                            >
                              {
                                item.name
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="flex min-w-0 items-center gap-1.5">
                      <BookOpen className="theme-text-muted h-3.5 w-3.5 shrink-0" />

                      <select
                        value={
                          filterSubject
                        }
                        onChange={(
                          e
                        ) =>
                          setFilterSubject(
                            e.target
                              .value
                          )
                        }
                        className={`theme-input h-9 min-w-0 rounded-xl border px-2.5 text-xs outline-none transition-all ${themeFocus} sm:text-sm`}
                      >
                        <option value="all">
                          Semua Mapel
                        </option>

                        {subjectOptions.map(
                          (
                            item
                          ) => (
                            <option
                              key={
                                item.id
                              }
                              value={
                                item.id
                              }
                            >
                              {
                                item.name
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={
                      goToToday
                    }
                    className={`shrink-0 rounded-xl ${themePrimaryGradient} px-3 py-2 text-xs font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition-all hover:brightness-105 sm:px-4 sm:text-sm`}
                  >
                    Hari ini
                  </button>
                </div>
              </section>

              {/* MAIN */}

              <div className="grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">

                {/* LEFT */}

                <aside className="min-w-0 space-y-4 sm:space-y-5">

                  {/* CALENDAR */}

                  <div
                    className={`${themeCard} w-full min-w-0 rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow} sm:p-5`}
                  >
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <h3 className="theme-text flex min-w-0 items-center gap-2 text-sm font-bold">
                        <Calendar
                          className={`h-4 w-4 shrink-0 ${themePrimaryText}`}
                        />

                        <span className="truncate">
                          {
                            monthNames[
                              viewDate.getMonth()
                            ]
                          }{" "}
                          {
                            viewDate.getFullYear()
                          }
                        </span>
                      </h3>

                      <div className="flex shrink-0 gap-0.5">
                        <button
                          onClick={
                            goToPrevWeek
                          }
                          className={`theme-text-secondary rounded-lg p-1.5 transition ${themeNeutralHover}`}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        <button
                          onClick={
                            goToNextWeek
                          }
                          className={`theme-text-secondary rounded-lg p-1.5 transition ${themeNeutralHover}`}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="theme-text-muted grid grid-cols-7 gap-1 text-center text-[10px] font-semibold sm:text-xs">
                      {[
                        "Sen",
                        "Sel",
                        "Rab",
                        "Kam",
                        "Jum",
                        "Sab",
                        "Min",
                      ].map(
                        (day) => (
                          <div
                            key={day}
                            className="py-1"
                          >
                            {day}
                          </div>
                        )
                      )}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {weekDays.map(
                        (date) => {
                          const isToday =
                            isSameDate(
                              date,
                              today
                            );

                          const isSelected =
                            isSameDate(
                              date,
                              selectedDate
                            );

                          const dayName =
                            normalizeDay(
                              getDayName(
                                date.getDay()
                              )
                            );

                          const hasSchedule =
                            schedules.some(
                              (
                                schedule
                              ) =>
                                normalizeDay(
                                  schedule.day
                                ) ===
                                dayName
                            );

                          const isWeekend =
                            date.getDay() ===
                              0 ||
                            date.getDay() ===
                              6;

                          return (
                            <button
                              key={date.toISOString()}
                              onClick={() =>
                                handleDateClick(
                                  date
                                )
                              }
                              className={`
                                relative flex aspect-square min-w-0 flex-col items-center justify-center rounded-lg text-xs font-medium transition-all sm:text-sm
                                ${
                                  isSelected
                                    ? `${themePrimaryGradient} scale-95 text-[var(--color-card)] ${themePrimaryShadow}`
                                    : ""
                                }
                                ${
                                  isToday &&
                                  !isSelected
                                    ? `border-2 ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`
                                    : ""
                                }
                                ${
                                  !isSelected &&
                                  !isToday
                                    ? `theme-text ${themeNeutralHover}`
                                    : ""
                                }
                                ${
                                  isWeekend &&
                                  !isSelected &&
                                  !isToday
                                    ? "theme-text-muted"
                                    : ""
                                }
                              `}
                            >
                              <span>
                                {date.getDate()}
                              </span>

                              {hasSchedule && (
                                <span
                                  className="absolute bottom-1 h-1.5 w-1.5 rounded-full"
                                  style={{
                                    background:
                                      isSelected
                                        ? "var(--color-card)"
                                        : "var(--color-primary)",
                                    opacity:
                                      isSelected
                                        ? 0.7
                                        : 0.65,
                                  }}
                                />
                              )}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <div
                      className={`mt-4 flex items-center justify-between gap-2 border-t ${themeDivider} pt-3`}
                    >
                      <button
                        onClick={
                          goToToday
                        }
                        className={`flex shrink-0 items-center gap-1 text-xs font-medium ${themePrimaryText} transition-colors hover:brightness-90`}
                      >
                        <CalendarCheck className="h-3.5 w-3.5" />
                        Hari ini
                      </button>

                      <span className="theme-text-muted flex min-w-0 items-center gap-1 truncate text-[10px] sm:text-xs">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{
                            background:
                              "var(--color-primary)",
                          }}
                        />
                        Ada jadwal
                      </span>
                    </div>
                  </div>

                  {/* RINGKASAN */}

                  <div
                    className={`${themeCard} w-full min-w-0 rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow} sm:p-5`}
                  >
                    <h4 className="theme-text mb-3 flex items-center gap-2 text-sm font-semibold">
                      <Award
                        className="h-4 w-4 text-[var(--color-warning)]"
                      />
                      Ringkasan Hari Ini
                    </h4>

                    <div className="space-y-2.5">
                      {[
                        {
                          label:
                            "Total Jam",
                          value:
                            formatDuration(
                              totalMinutes
                            ),
                          icon: Timer,
                          color:
                            "var(--color-primary)",
                        },
                        {
                          label:
                            "Sesi",
                          value:
                            totalSessions,
                          icon: Clock,
                          color:
                            "var(--color-primary)",
                        },
                        {
                          label:
                            "Kelas",
                          value:
                            uniqueClasses.join(
                              ", "
                            ) ||
                            "-",
                          icon: Users,
                          color:
                            "var(--color-info)",
                        },
                        {
                          label:
                            "Mapel",
                          value:
                            uniqueSubjects.join(
                              ", "
                            ) ||
                            "-",
                          icon: BookOpen,
                          color:
                            "var(--color-warning)",
                        },
                      ].map(
                        (
                          item,
                          index
                        ) => {
                          const Icon =
                            item.icon;

                          return (
                            <div
                              key={
                                index
                              }
                              className={`flex min-w-0 items-center justify-between gap-3 border-b ${themeDivider} py-1.5 last:border-0`}
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <Icon
                                  className="h-3.5 w-3.5 shrink-0"
                                  style={{
                                    color:
                                      item.color,
                                  }}
                                />

                                <span className="theme-text-muted truncate text-xs sm:text-sm">
                                  {
                                    item.label
                                  }
                                </span>
                              </div>

                              <span className="theme-text max-w-[55%] truncate text-right text-xs font-semibold sm:text-sm">
                                {
                                  item.value
                                }
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </aside>

                {/* RIGHT */}

                <section className="min-w-0 space-y-4 sm:space-y-5">

                  {/* JADWAL */}

                  <div
                    className={`${themeCard} w-full min-w-0 rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow} sm:p-5 lg:p-6`}
                  >
                    <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h2 className="theme-text flex min-w-0 items-center gap-2 text-base font-bold sm:text-lg">
                          <Clock
                            className={`h-5 w-5 shrink-0 ${themePrimaryText}`}
                          />

                          <span>
                            Jadwal{" "}
                            {
                              selectedDayDisplay
                            }
                          </span>
                        </h2>

                        <span
                          className={`theme-text-muted rounded-full ${themeNeutralSurface} px-2.5 py-0.5 text-xs font-normal`}
                        >
                          {selectedDate.toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>

                        <span
                          className={`theme-text-muted flex items-center gap-1 rounded-full ${themeNeutralSurface} px-2.5 py-0.5 text-xs`}
                        >
                          <Building2 className="h-3 w-3" />
                          Sekolah saya
                        </span>
                      </div>

                      <span
                        className={`theme-text-muted w-fit shrink-0 rounded-full ${themeNeutralSurface} px-3 py-1 text-xs sm:text-sm`}
                      >
                        {
                          filteredSchedules.length
                        }{" "}
                        sesi
                      </span>
                    </div>

                    {loading ? (
                      <div className="flex min-h-[260px] items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${themePrimarySoft}`}
                          >
                            <RefreshCw
                              className={`h-6 w-6 animate-spin ${themePrimaryText}`}
                            />
                          </div>

                          <p className="theme-text-secondary text-sm font-medium">
                            Memuat jadwal mengajar...
                          </p>
                        </div>
                      </div>
                    ) : filteredSchedules.length ===
                      0 ? (
                      <div className="py-10 text-center sm:py-14">
                        <CalendarOff className="theme-text-muted mx-auto mb-2 h-10 w-10 sm:h-12 sm:w-12" />

                        <p className="theme-text-secondary text-sm">
                          Tidak ada jadwal untuk{" "}
                          {
                            selectedDayDisplay
                          }
                        </p>

                        <p className="theme-text-muted mt-1 text-xs">
                          Jadwal yang tampil berasal dari data backend dan hanya untuk guru yang sedang login.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {filteredSchedules.map(
                          (
                            schedule
                          ) => {
                            const status =
                              getScheduleStatus(
                                schedule
                              );

                            const isNow =
                              status ===
                              "current";

                            const isPast =
                              status ===
                              "past";

                            return (
                              <div
                                key={
                                  schedule.id
                                }
                                className={`
                                  flex min-w-0 items-start gap-3 rounded-xl p-3 transition-all sm:gap-4 sm:p-4
                                  ${
                                    isNow
                                      ? `${themePrimarySoftBorder} ${themePrimarySoft} border-2`
                                      : isPast
                                      ? `${themeNeutralBorder} ${themeNeutralSurface} border opacity-70`
                                      : `${themeCard} ${themeNeutralBorder} border ${themeNeutralHover}`
                                  }
                                `}
                              >
                                <div className="theme-text-secondary w-12 shrink-0 pt-0.5 text-xs font-semibold sm:w-16 sm:text-sm">
                                  {
                                    schedule.startTime
                                  }
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                                    <span
                                      className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm sm:h-3 sm:w-3"
                                      style={{
                                        backgroundColor:
                                          schedule.subjectColor,
                                      }}
                                    />

                                    <span className="theme-text max-w-full truncate text-sm font-bold sm:text-base">
                                      {
                                        schedule.subjectName
                                      }
                                    </span>

                                    <span
                                      className={`theme-text-secondary max-w-full truncate rounded-lg ${themeNeutralSurface} px-2 py-0.5 text-xs`}
                                    >
                                      {
                                        schedule.className
                                      }
                                    </span>

                                    {schedule.roomName && (
                                      <span className="theme-text-secondary flex min-w-0 max-w-full items-center gap-1 text-xs">
                                        <MapPin className="h-3 w-3 shrink-0" />

                                        <span className="truncate">
                                          {
                                            schedule.roomName
                                          }
                                        </span>
                                      </span>
                                    )}

                                    <div className="ml-auto shrink-0">
                                      {isNow && (
                                        <span
                                          className={`inline-flex items-center gap-1 rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} px-2 py-0.5 text-[10px] font-semibold sm:text-xs`}
                                        >
                                          <CheckCircle className="h-3 w-3" />
                                          Mengajar
                                        </span>
                                      )}

                                      {isPast && (
                                        <span
                                          className={`theme-text-muted inline-flex items-center gap-1 rounded-full border ${themeNeutralBorder} ${themeNeutralSurface} px-2 py-0.5 text-[10px] font-semibold sm:text-xs`}
                                        >
                                          <XCircle className="h-3 w-3" />
                                          Selesai
                                        </span>
                                      )}

                                      {!isNow &&
                                        !isPast && (
                                          <span
                                            className={`inline-flex items-center gap-1 rounded-full border ${themeSuccessBorder} ${themeSuccessSurface} px-2 py-0.5 text-[10px] font-semibold text-[var(--color-success)] sm:text-xs`}
                                          >
                                            <Clock className="h-3 w-3" />
                                            Akan datang
                                          </span>
                                        )}
                                    </div>
                                  </div>

                                  <div className="theme-text-muted mt-1 flex min-w-0 items-center gap-2 text-xs">
                                    <Clock className="h-3 w-3 shrink-0" />

                                    <span>
                                      {
                                        schedule.startTime
                                      }{" "}
                                      -{" "}
                                      {
                                        schedule.endTime
                                      }
                                    </span>

                                    {schedule.subjectCode && (
                                      <>
                                        <span>•</span>

                                        <span className="truncate">
                                          {
                                            schedule.subjectCode
                                          }
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>

                  {/* BOTTOM */}

                  <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">

                    {/* AGENDA */}

                    <div
                      className={`${themeCard} min-w-0 rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow} sm:p-5`}
                    >
                      <h3 className="theme-text mb-4 flex items-center gap-2 text-sm font-bold">
                        <Bell
                          className={`h-4 w-4 ${themePrimaryText}`}
                        />
                        Agenda Mendatang
                      </h3>

                      <div
                        className={`theme-card-soft flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed ${themeNeutralBorder} px-4 text-center`}
                      >
                        <Star className="theme-text-muted mb-2 h-8 w-8" />

                        <p className="theme-text-secondary text-sm font-medium">
                          Agenda belum tersedia
                        </p>

                        <p className="theme-text-muted mt-1 max-w-sm text-xs leading-5">
                          Backend yang digunakan halaman ini hanya menyediakan endpoint jadwal mengajar. Belum ada endpoint agenda mendatang.
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          router.push(
                            "/guru/jadwal/kalender/buat"
                          )
                        }
                        className={`mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed ${themePrimarySoftBorder} py-2 text-xs font-medium ${themePrimaryText} transition ${themePrimarySoft} sm:text-sm`}
                      >
                        <Plus className="h-4 w-4" />
                        Buat Jadwal
                      </button>
                    </div>

                    {/* NEXT */}

                    <div
                      className={`${themeCard} min-w-0 rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow} sm:p-5`}
                    >
                      <h3 className="theme-text mb-4 flex items-center gap-2 text-sm font-bold">
                        <ClockArrowUp className="h-4 w-4 text-[var(--color-warning)]" />
                        Jadwal Berikutnya
                      </h3>

                      {nextSchedule ? (
                        <div
                          className={`rounded-xl border ${themeWarningBorder} ${themeWarningSurface} p-3 sm:p-4`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${themeWarningBorder} ${themeWarningSurface} text-[var(--color-warning)] sm:h-10 sm:w-10`}
                            >
                              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-[var(--color-warning)] text-base font-bold sm:text-lg">
                                {
                                  nextSchedule.startTime
                                }{" "}
                                -{" "}
                                {
                                  nextSchedule.endTime
                                }
                              </p>

                              <p className="theme-text truncate text-xs font-semibold sm:text-sm">
                                {
                                  nextSchedule.subjectName
                                }{" "}
                                •{" "}
                                {
                                  nextSchedule.className
                                }
                              </p>

                              {nextSchedule.roomName && (
                                <p className="theme-text-muted flex min-w-0 items-center gap-1 truncate text-[10px] sm:text-xs">
                                  <MapPin className="h-3 w-3 shrink-0" />

                                  <span className="truncate">
                                    {
                                      nextSchedule.roomName
                                    }
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`theme-card-soft flex min-h-[120px] items-center justify-center rounded-xl border border-dashed ${themeNeutralBorder}`}
                        >
                          <div className="text-center">
                            <ClockArrowUp className="theme-text-muted mx-auto mb-2 h-7 w-7" />

                            <p className="theme-text-muted text-xs">
                              Tidak ada jadwal berikutnya
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================
// MOON ICON
// ============================================================

function Moon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}