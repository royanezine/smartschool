// app/guru/jadwal/kalender/page.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';

import Sidebar from '../../../components/Sidebar';
import Header from '../../../components/Header';

import { getJadwalMengajar } from '../../../../services/jadwalMengajar.service';

// ============================================================
// CONSTANT
// ============================================================

const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

const dayNames = [
    'Minggu',
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
];

const subjectColors = [
    '#2563EB',
    '#0D9488',
    '#059669',
    '#DC2626',
    '#0891B2',
    '#D97706',
    '#7C3AED',
    '#DB2777',
    '#F59E0B',
    '#4F46E5',
];

const getDayName = (dayIndex) => {
    return dayNames[dayIndex] ?? '';
};

// ============================================================
// NORMALIZER
// ============================================================

function normalizeText(value) {
    return String(value ?? '')
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
    if (typeof window === 'undefined') {
        return null;
    }

    const tokenKeys = [
        'token',
        'accessToken',
        'access_token',
        'authToken',
        'jwt',
    ];

    for (const key of tokenKeys) {
        const value = localStorage.getItem(key);

        if (value && value.trim()) {
            return value
                .trim()
                .replace(/^Bearer\s+/i, '');
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
        const parts = token.split('.');

        if (parts.length !== 3) {
            return null;
        }

        let base64 = parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        base64 += '='.repeat(
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

            email:
                payload?.email ??
                null,

            username:
                payload?.username ??
                payload?.userName ??
                null,

            sekolahId:
                payload?.sekolahId ??
                null,

            role:
                payload?.role ??
                payload?.peran ??
                null,
        };
    } catch (error) {
        console.error(
            '[KALENDER GURU] Gagal membaca JWT:',
            error
        );

        return null;
    }
}

// ============================================================
// SUBJECT COLOR
// ============================================================

function getSubjectColor(subjectId, subjectName) {
    const source = String(
        subjectId ||
            subjectName ||
            'subject'
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
        '';

    const subjectName =
        mataPelajaran?.nama ??
        'Mata Pelajaran';

    const teacherId =
        kelasMapel?.guruPengajarId ??
        guru?.id ??
        '';

    const teacherName =
        guru?.namaLengkap ??
        guru?.nama ??
        '';

    const teacherEmail =
        guru?.email ??
        '';

    return {
        id:
            schedule?.id ??
            '',

        kelasMapelId:
            schedule?.kelasMapelId ??
            kelasMapel?.id ??
            '',

        // PENTING:
        // Backend mengirim "senin", "selasa", dst.
        day: normalizeDay(
            schedule?.hari
        ),

        startTime:
            schedule?.jamMulai ??
            '',

        endTime:
            schedule?.jamSelesai ??
            '',

        roomName:
            schedule?.ruangan ??
            '',

        subjectId,

        subjectName,

        subjectCode:
            mataPelajaran?.kode ??
            '',

        subjectColor:
            getSubjectColor(
                subjectId,
                subjectName
            ),

        classId:
            kelasMapel?.kelasId ??
            kelas?.id ??
            '',

        className:
            kelas?.nama ??
            'Kelas',

        teacherId,

        teacherName,

        teacherEmail,

        schoolId:
            kelas?.sekolahId ??
            schedule?.sekolahId ??
            null,

        notes:
            schedule?.keterangan ??
            '',

        raw: schedule,
    };
}

// ============================================================
// TIME HELPERS
// ============================================================

function timeToMinutes(time) {
    if (
        !time ||
        !String(time).includes(':')
    ) {
        return 0;
    }

    const [hour, minute] =
        String(time)
            .split(':')
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
        return '0j 0m';
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

    // ========================================================
    // USER
    // ========================================================

    const [
        currentUser,
        setCurrentUser,
    ] = useState(null);

    // ========================================================
    // DATA
    // ========================================================

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
    ] = useState('');

    // ========================================================
    // DATE
    // ========================================================

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

    // ========================================================
    // FILTER
    // ========================================================

    const [
        filterClass,
        setFilterClass,
    ] = useState('all');

    const [
        filterSubject,
        setFilterSubject,
    ] = useState('all');

    // ========================================================
    // LOAD USER
    // ========================================================

    useEffect(() => {
        const user =
            getCurrentUserFromToken();

        console.log(
            '[KALENDER GURU] USER LOGIN:',
            user
        );

        setCurrentUser(user);
    }, []);

    // ========================================================
    // LOAD JADWAL
    // ========================================================

    const loadSchedules =
        async () => {
            try {
                setLoading(true);
                setError('');

                const user =
                    getCurrentUserFromToken();

                if (!user) {
                    throw new Error(
                        'Data user tidak ditemukan dari token login. Silakan login kembali.'
                    );
                }

                setCurrentUser(user);

                const response =
                    await getJadwalMengajar();

                console.log(
                    '[KALENDER GURU] RESPONSE API:',
                    response
                );

                if (
                    !response?.success
                ) {
                    throw new Error(
                        response?.message ||
                            'Gagal mengambil jadwal mengajar.'
                    );
                }

                const backendSchedules =
                    Array.isArray(
                        response?.data
                    )
                        ? response.data
                        : [];

                console.log(
                    '[KALENDER GURU] JUMLAH DATA BACKEND:',
                    backendSchedules.length
                );

                /*
                 * =====================================================
                 * DEBUG DATA BACKEND
                 * =====================================================
                 */

                backendSchedules.forEach(
                    (
                        item,
                        index
                    ) => {
                        const guru =
                            item
                                ?.kelasMapel
                                ?.guruPengajar;

                        console.log(
                            `[KALENDER GURU] JADWAL ${index + 1}:`,
                            {
                                id:
                                    item?.id,

                                hari:
                                    item?.hari,

                                jamMulai:
                                    item?.jamMulai,

                                jamSelesai:
                                    item?.jamSelesai,

                                kelas:
                                    item
                                        ?.kelasMapel
                                        ?.kelas
                                        ?.nama,

                                mapel:
                                    item
                                        ?.kelasMapel
                                        ?.mataPelajaran
                                        ?.nama,

                                guruId:
                                    guru?.id,

                                guruNama:
                                    guru?.namaLengkap ??
                                    guru?.nama,

                                guruEmail:
                                    guru?.email,

                                userId:
                                    user?.id,

                                userName:
                                    user?.name,

                                userEmail:
                                    user?.email,
                            }
                        );
                    }
                );

                /*
                 * =====================================================
                 * FILTER GURU
                 * =====================================================
                 *
                 * Masalah sebelumnya:
                 *
                 * guruPengajar.id
                 * tidak selalu sama dengan
                 * userId JWT.
                 *
                 * Jadi sekarang kita coba:
                 *
                 * 1. ID
                 * 2. Email
                 * 3. Nama
                 *
                 * =====================================================
                 */

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
                                '';

                            const guruEmail =
                                guru?.email ??
                                '';

                            const guruName =
                                guru?.namaLengkap ??
                                guru?.nama ??
                                '';

                            const userId =
                                user?.id ??
                                '';

                            const userEmail =
                                user?.email ??
                                '';

                            const userName =
                                user?.name ??
                                '';

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

                            const cocok =
                                matchById ||
                                matchByEmail ||
                                matchByName;

                            console.log(
                                '[KALENDER GURU] CEK GURU:',
                                {
                                    guruId,
                                    userId,
                                    guruEmail,
                                    userEmail,
                                    guruName,
                                    userName,
                                    matchById,
                                    matchByEmail,
                                    matchByName,
                                    cocok,
                                }
                            );

                            return cocok;
                        }
                    );

                console.log(
                    '[KALENDER GURU] HASIL FILTER GURU:',
                    teacherSchedules
                );

                /*
                 * =====================================================
                 * NORMALIZE
                 * =====================================================
                 */

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

                console.log(
                    '[KALENDER GURU] HASIL NORMALIZE:',
                    normalized
                );

                /*
                 * =====================================================
                 * PENTING
                 * =====================================================
                 *
                 * Jika hasil filter kosong,
                 * kita TIDAK langsung menampilkan
                 * semua jadwal sekolah.
                 *
                 * Karena halaman Guru harus tetap
                 * hanya menampilkan jadwal guru.
                 */

                setSchedules(
                    normalized
                );

                if (
                    backendSchedules.length >
                        0 &&
                    normalized.length === 0
                ) {
                    console.warn(
                        '[KALENDER GURU] API memiliki jadwal, tetapi tidak ada yang cocok dengan user login.'
                    );
                }
            } catch (err) {
                console.error(
                    '[KALENDER GURU] ERROR:',
                    err
                );

                setSchedules([]);

                setError(
                    err?.message ||
                        'Gagal mengambil jadwal mengajar dari backend.'
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        loadSchedules();
    }, []);

    // ========================================================
    // TODAY
    // ========================================================

    const today =
        new Date();

    // ========================================================
    // WEEK
    // ========================================================

    const weekDays =
        useMemo(
            () =>
                getWeekDays(
                    viewDate
                ),
            [viewDate]
        );

    // ========================================================
    // FILTER OPTIONS
    // ========================================================

    const classOptions =
        useMemo(() => {
            const map =
                new Map();

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
                        'id'
                    )
            );
        }, [schedules]);

    const subjectOptions =
        useMemo(() => {
            const map =
                new Map();

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
                        'id'
                    )
            );
        }, [schedules]);

    // ========================================================
    // SELECTED DAY
    // ========================================================

    const selectedDay =
        selectedDate.getDay();

    /*
     * PENTING:
     *
     * getDayName(1) = "Senin"
     *
     * Backend = "senin"
     *
     * Maka keduanya dinormalisasi menjadi:
     *
     * "senin"
     */

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

    // ========================================================
    // FILTERED SCHEDULES
    // ========================================================

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
                            'all' ||
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
                            'all' ||
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

    // ========================================================
    // STATISTICS
    // ========================================================

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
                        .filter(
                            Boolean
                        )
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
                        .filter(
                            Boolean
                        )
                ),
            ];
        }, [filteredSchedules]);

    // ========================================================
    // NEXT SCHEDULE
    // ========================================================

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

    // ========================================================
    // GREETING
    // ========================================================

    const getGreeting =
        () => {
            const hour =
                today.getHours();

            if (hour < 12) {
                return {
                    text: 'Selamat Pagi',
                    icon: Sun,
                };
            }

            if (hour < 15) {
                return {
                    text: 'Selamat Siang',
                    icon: Sun,
                };
            }

            if (hour < 18) {
                return {
                    text: 'Selamat Sore',
                    icon: Sun,
                };
            }

            return {
                text: 'Selamat Malam',
                icon: Moon,
            };
        };

    const greeting =
        getGreeting();

    const GreetingIcon =
        greeting.icon;

    // ========================================================
    // NAVIGATION
    // ========================================================

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
                'all'
            );

            setFilterSubject(
                'all'
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

    // ========================================================
    // STATUS JADWAL
    // ========================================================

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
                return 'past';
            }

            if (
                selectedDayStart >
                todayStart
            ) {
                return 'upcoming';
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
                return 'current';
            }

            if (
                nowMinutes >=
                endMinutes
            ) {
                return 'past';
            }

            return 'upcoming';
        };

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="flex h-screen min-h-0 w-full overflow-hidden bg-slate-50">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Header
                    user={{
                        name:
                            currentUser?.name ||
                            'Bapak/Ibu Guru',

                        email:
                            currentUser?.email ||
                            'guru@smartschool.com',

                        avatar:
                            currentUser?.name
                                ? currentUser.name
                                      .split(
                                          ' '
                                      )
                                      .map(
                                          (
                                              word
                                          ) =>
                                              word
                                                  .charAt(
                                                      0
                                                  )
                                                  .toUpperCase()
                                      )
                                      .slice(
                                          0,
                                          2
                                      )
                                      .join(
                                          ''
                                      )
                                : 'GU',
                    }}
                />

                <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="w-full min-w-0 p-3 sm:p-4 lg:p-6 xl:p-8">
                        <div className="mx-auto w-full min-w-0 max-w-none space-y-4 sm:space-y-5 lg:space-y-6">

                            {/* HEADER */}

                            <section className="relative w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5 lg:p-7">
                                <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 -translate-y-1/2 translate-x-1/3 rounded-full bg-blue-100/30 blur-3xl" />

                                <div className="pointer-events-none absolute bottom-0 left-0 h-44 w-44 -translate-x-1/4 translate-y-1/2 rounded-full bg-indigo-50/40 blur-3xl" />

                                <div className="relative flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                                        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200/50 bg-blue-100/60 shadow-sm sm:flex lg:h-12 lg:w-12">
                                            <GreetingIcon className="h-5 w-5 text-blue-600 lg:h-6 lg:w-6" />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                                                <h1 className="min-w-0 text-xl font-bold tracking-tight text-slate-800 sm:text-2xl lg:text-3xl">
                                                    {greeting.text},{' '}
                                                    <span className="text-blue-700">
                                                        {currentUser?.name ||
                                                            'Bapak/Ibu Guru'}
                                                    </span>
                                                </h1>

                                                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-blue-200/50 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                                    <Sparkles className="h-3 w-3" />
                                                    Pro
                                                </span>
                                            </div>

                                            <div className="mt-1 flex min-w-0 items-start gap-2 text-xs text-slate-500 sm:text-sm">
                                                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

                                                <span className="min-w-0">
                                                    Kelola jadwal mengajar Anda dengan mudah dan profesional
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() =>
                                            router.push(
                                                '/guru/jadwal/kalender/buat'
                                            )
                                        }
                                        className="group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all duration-300 hover:bg-blue-700 hover:shadow-blue-300 sm:w-auto"
                                    >
                                        <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />

                                        <span>
                                            Buat Jadwal
                                        </span>

                                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </button>
                                </div>

                                <div className="relative mt-4 grid w-full min-w-0 grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-4 sm:gap-3">
                                    {[
                                        {
                                            label: 'Total Sesi Hari Ini',
                                            value: totalSessions,
                                            icon: Clock,
                                        },
                                        {
                                            label: 'Total Jam',
                                            value: formatDuration(
                                                totalMinutes
                                            ),
                                            icon: Timer,
                                        },
                                        {
                                            label: 'Kelas',
                                            value:
                                                uniqueClasses.length ||
                                                '-',
                                            icon: Users,
                                        },
                                        {
                                            label: 'Mapel',
                                            value:
                                                uniqueSubjects.length ||
                                                '-',
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
                                                    className="min-w-0 rounded-xl border border-slate-200/60 bg-slate-50/80 p-3 transition-all duration-300 hover:bg-slate-100/80"
                                                >
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <Icon className="h-3.5 w-3.5 shrink-0 text-blue-600/70" />

                                                        <span className="min-w-0 truncate text-xs font-medium text-slate-500">
                                                            {
                                                                stat.label
                                                            }
                                                        </span>
                                                    </div>

                                                    <p className="mt-0.5 truncate text-lg font-bold text-slate-800 sm:text-xl">
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
                                <section className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-red-700">
                                                Gagal memuat jadwal
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-red-600 sm:text-sm">
                                                {error}
                                            </p>
                                        </div>

                                        <button
                                            onClick={
                                                loadSchedules
                                            }
                                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                        >
                                            <RefreshCw className="h-3.5 w-3.5" />
                                            Coba lagi
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* FILTER */}

                            <section className="w-full min-w-0 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
                                <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                                    <div className="flex shrink-0 items-center gap-2 rounded-xl border border-blue-200/50 bg-blue-50 px-3 py-1.5">
                                        <Home className="h-4 w-4 text-blue-600" />

                                        <span className="text-xs font-semibold text-slate-700 sm:text-sm">
                                            HARI INI
                                        </span>
                                    </div>

                                    <span className="min-w-0 truncate text-xs font-medium text-slate-600 sm:text-sm">
                                        {selectedDate.toLocaleDateString(
                                            'id-ID',
                                            {
                                                weekday:
                                                    'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            }
                                        )}
                                    </span>

                                    <div className="hidden h-6 w-px bg-slate-200 lg:block" />

                                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                                        <div className="flex min-w-0 items-center gap-1.5">
                                            <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                                            <div className="flex h-9 min-w-0 items-center rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-600 sm:text-sm">
                                                <span className="truncate">
                                                    Sekolah saya
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex min-w-0 items-center gap-1.5">
                                            <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                                            <select
                                                value={
                                                    filterClass
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setFilterClass(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                className="h-9 min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-400 sm:text-sm"
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
                                            <BookOpen className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                                            <select
                                                value={
                                                    filterSubject
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setFilterSubject(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                className="h-9 min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-400 sm:text-sm"
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
                                        className="shrink-0 rounded-xl bg-blue-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-blue-700 sm:px-4 sm:text-sm"
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

                                    <div className="w-full min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
                                        <div className="mb-4 flex items-center justify-between gap-2">
                                            <h3 className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-800">
                                                <Calendar className="h-4 w-4 shrink-0 text-blue-500" />

                                                <span className="truncate">
                                                    {
                                                        monthNames[
                                                            viewDate.getMonth()
                                                        ]
                                                    }{' '}
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
                                                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </button>

                                                <button
                                                    onClick={
                                                        goToNextWeek
                                                    }
                                                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 sm:text-xs">
                                            {[
                                                'Sen',
                                                'Sel',
                                                'Rab',
                                                'Kam',
                                                'Jum',
                                                'Sab',
                                                'Min',
                                            ].map(
                                                (
                                                    day
                                                ) => (
                                                    <div
                                                        key={
                                                            day
                                                        }
                                                        className="py-1"
                                                    >
                                                        {
                                                            day
                                                        }
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        <div className="grid grid-cols-7 gap-1">
                                            {weekDays.map(
                                                (
                                                    date
                                                ) => {
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

                                                    /*
                                                     * PENTING:
                                                     * schedules.day sekarang sudah lowercase.
                                                     * dayName juga lowercase.
                                                     */

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
                                                                        ? 'scale-95 bg-blue-600 text-white shadow-sm'
                                                                        : ''
                                                                }
                                                                ${
                                                                    isToday &&
                                                                    !isSelected
                                                                        ? 'border-2 border-blue-300/50 bg-blue-50 text-blue-700'
                                                                        : ''
                                                                }
                                                                ${
                                                                    !isSelected &&
                                                                    !isToday
                                                                        ? 'text-slate-700 hover:bg-slate-100'
                                                                        : ''
                                                                }
                                                                ${
                                                                    isWeekend &&
                                                                    !isSelected &&
                                                                    !isToday
                                                                        ? 'text-slate-300'
                                                                        : ''
                                                                }
                                                            `}
                                                        >
                                                            <span>
                                                                {date.getDate()}
                                                            </span>

                                                            {hasSchedule && (
                                                                <span
                                                                    className={`
                                                                        absolute bottom-1 h-1.5 w-1.5 rounded-full
                                                                        ${
                                                                            isSelected
                                                                                ? 'bg-white/70'
                                                                                : 'bg-blue-400'
                                                                        }
                                                                    `}
                                                                />
                                                            )}
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>

                                        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                                            <button
                                                onClick={
                                                    goToToday
                                                }
                                                className="flex shrink-0 items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                                            >
                                                <CalendarCheck className="h-3.5 w-3.5" />
                                                Hari ini
                                            </button>

                                            <span className="flex min-w-0 items-center gap-1 truncate text-[10px] text-slate-500 sm:text-xs">
                                                <span className="h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                                                Ada jadwal
                                            </span>
                                        </div>
                                    </div>

                                    {/* RINGKASAN */}

                                    <div className="w-full min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
                                        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                            <Award className="h-4 w-4 text-amber-500" />
                                            Ringkasan Hari Ini
                                        </h4>

                                        <div className="space-y-2.5">
                                            {[
                                                {
                                                    label: 'Total Jam',
                                                    value: formatDuration(
                                                        totalMinutes
                                                    ),
                                                    icon: Timer,
                                                    color: 'text-blue-600',
                                                },
                                                {
                                                    label: 'Sesi',
                                                    value: totalSessions,
                                                    icon: Clock,
                                                    color: 'text-blue-600',
                                                },
                                                {
                                                    label: 'Kelas',
                                                    value:
                                                        uniqueClasses.join(
                                                            ', '
                                                        ) ||
                                                        '-',
                                                    icon: Users,
                                                    color: 'text-indigo-600',
                                                },
                                                {
                                                    label: 'Mapel',
                                                    value:
                                                        uniqueSubjects.join(
                                                            ', '
                                                        ) ||
                                                        '-',
                                                    icon: BookOpen,
                                                    color: 'text-amber-600',
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
                                                            className="flex min-w-0 items-center justify-between gap-3 border-b border-slate-100/80 py-1.5 last:border-0"
                                                        >
                                                            <div className="flex min-w-0 items-center gap-2">
                                                                <Icon
                                                                    className={`h-3.5 w-3.5 shrink-0 ${item.color}`}
                                                                />

                                                                <span className="truncate text-xs text-slate-500 sm:text-sm">
                                                                    {
                                                                        item.label
                                                                    }
                                                                </span>
                                                            </div>

                                                            <span className="max-w-[55%] truncate text-right text-xs font-semibold text-slate-700 sm:text-sm">
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

                                    <div className="w-full min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
                                        <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                                                <h2 className="flex min-w-0 items-center gap-2 text-base font-bold text-slate-800 sm:text-lg">
                                                    <Clock className="h-5 w-5 shrink-0 text-blue-500" />

                                                    <span>
                                                        Jadwal{' '}
                                                        {
                                                            selectedDayDisplay
                                                        }
                                                    </span>
                                                </h2>

                                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-normal text-slate-400">
                                                    {selectedDate.toLocaleDateString(
                                                        'id-ID',
                                                        {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        }
                                                    )}
                                                </span>

                                                <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-400">
                                                    <Building2 className="h-3 w-3" />
                                                    Sekolah saya
                                                </span>
                                            </div>

                                            <span className="w-fit shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-400 sm:text-sm">
                                                {
                                                    filteredSchedules.length
                                                }{' '}
                                                sesi
                                            </span>
                                        </div>

                                        {loading ? (
                                            <div className="flex min-h-[260px] items-center justify-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                                                        <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                                                    </div>

                                                    <p className="text-sm font-medium text-slate-500">
                                                        Memuat jadwal mengajar...
                                                    </p>
                                                </div>
                                            </div>
                                        ) : filteredSchedules.length ===
                                          0 ? (
                                            <div className="py-10 text-center text-slate-400 sm:py-14">
                                                <CalendarOff className="mx-auto mb-2 h-10 w-10 text-slate-300 sm:h-12 sm:w-12" />

                                                <p className="text-sm">
                                                    Tidak ada jadwal untuk{' '}
                                                    {
                                                        selectedDayDisplay
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
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
                                                            'current';

                                                        const isPast =
                                                            status ===
                                                            'past';

                                                        return (
                                                            <div
                                                                key={
                                                                    schedule.id
                                                                }
                                                                className={`
                                                                    flex min-w-0 items-start gap-3 rounded-xl p-3 transition-all sm:gap-4 sm:p-4
                                                                    ${
                                                                        isNow
                                                                            ? 'border-2 border-blue-300/60 bg-blue-50/90 shadow-sm'
                                                                            : isPast
                                                                            ? 'border border-slate-100 bg-slate-50/70 opacity-70'
                                                                            : 'border border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm'
                                                                    }
                                                                `}
                                                            >
                                                                <div className="w-12 shrink-0 pt-0.5 text-xs font-semibold text-slate-600 sm:w-16 sm:text-sm">
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

                                                                        <span className="max-w-full truncate text-sm font-bold text-slate-800 sm:text-base">
                                                                            {
                                                                                schedule.subjectName
                                                                            }
                                                                        </span>

                                                                        <span className="max-w-full truncate rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                                                            {
                                                                                schedule.className
                                                                            }
                                                                        </span>

                                                                        {schedule.roomName && (
                                                                            <span className="flex min-w-0 max-w-full items-center gap-1 text-xs text-slate-500">
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
                                                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600 sm:text-xs">
                                                                                    <CheckCircle className="h-3 w-3" />
                                                                                    Mengajar
                                                                                </span>
                                                                            )}

                                                                            {isPast && (
                                                                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-400 sm:text-xs">
                                                                                    <XCircle className="h-3 w-3" />
                                                                                    Selesai
                                                                                </span>
                                                                            )}

                                                                            {!isNow &&
                                                                                !isPast && (
                                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 sm:text-xs">
                                                                                        <Clock className="h-3 w-3" />
                                                                                        Akan datang
                                                                                    </span>
                                                                                )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-slate-400">
                                                                        <Clock className="h-3 w-3 shrink-0" />

                                                                        <span>
                                                                            {
                                                                                schedule.startTime
                                                                            }{' '}
                                                                            -{' '}
                                                                            {
                                                                                schedule.endTime
                                                                            }
                                                                        </span>

                                                                        {schedule.subjectCode && (
                                                                            <>
                                                                                <span>
                                                                                    •
                                                                                </span>

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

                                        <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
                                            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                                                <Bell className="h-4 w-4 text-blue-500" />
                                                Agenda Mendatang
                                            </h3>

                                            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center">
                                                <Star className="mb-2 h-8 w-8 text-slate-300" />

                                                <p className="text-sm font-medium text-slate-500">
                                                    Agenda belum tersedia
                                                </p>

                                                <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                                                    Backend yang digunakan halaman ini hanya menyediakan endpoint jadwal mengajar. Belum ada endpoint agenda mendatang.
                                                </p>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        '/guru/jadwal/kalender/buat'
                                                    )
                                                }
                                                className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-blue-200 py-2 text-xs font-medium text-blue-600 transition hover:border-blue-300 hover:bg-blue-50 sm:text-sm"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Buat Jadwal
                                            </button>
                                        </div>

                                        {/* NEXT */}

                                        <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
                                            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                                                <ClockArrowUp className="h-4 w-4 text-amber-500" />
                                                Jadwal Berikutnya
                                            </h3>

                                            {nextSchedule ? (
                                                <div className="rounded-xl border border-amber-200/60 bg-amber-50/80 p-3 sm:p-4">
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200/50 text-amber-700 sm:h-10 sm:w-10">
                                                            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="text-base font-bold text-amber-800 sm:text-lg">
                                                                {
                                                                    nextSchedule.startTime
                                                                }{' '}
                                                                -{' '}
                                                                {
                                                                    nextSchedule.endTime
                                                                }
                                                            </p>

                                                            <p className="truncate text-xs font-semibold text-slate-700 sm:text-sm">
                                                                {
                                                                    nextSchedule.subjectName
                                                                }{' '}
                                                                •{' '}
                                                                {
                                                                    nextSchedule.className
                                                                }
                                                            </p>

                                                            {nextSchedule.roomName && (
                                                                <p className="flex min-w-0 items-center gap-1 truncate text-[10px] text-slate-500 sm:text-xs">
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
                                                <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
                                                    <div className="text-center">
                                                        <ClockArrowUp className="mx-auto mb-2 h-7 w-7 text-slate-300" />

                                                        <p className="text-xs text-slate-400">
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