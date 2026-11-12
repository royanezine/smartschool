"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  BookOpen,
  MapPin,
  Search,
  RefreshCw,
  GraduationCap,
  CalendarCheck,
  AlertCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { getStoredUser } from "@/lib/auth";
import { getJadwalMengajar } from "@/services/jadwalMengajar.service";

const DAYS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

const normalizeDay = (value) => {
  const day = String(value || "").trim().toLowerCase();

  return DAYS.find((item) => item.toLowerCase() === day) || "";
};

function getScheduleList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.jadwal)) return response.jadwal;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.rows)) return response.rows;

  return [];
}

function getScheduleDay(schedule) {
  return normalizeDay(
    schedule?.hari ||
      schedule?.hariNama ||
      schedule?.hariMengajar ||
      schedule?.day
  );
}

function getScheduleStart(schedule) {
  return (
    schedule?.jamMulai ||
    schedule?.waktuMulai ||
    schedule?.mulai ||
    schedule?.jam?.mulai ||
    "-"
  );
}

function getScheduleEnd(schedule) {
  return (
    schedule?.jamSelesai ||
    schedule?.waktuSelesai ||
    schedule?.selesai ||
    schedule?.jam?.selesai ||
    "-"
  );
}

function formatJam(value) {
  if (!value || value === "-") return "-";

  const match = String(value).match(/(\d{1,2}):(\d{2})/);

  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : value;
}

function getTimeInMinutes(value) {
  const match = String(value || "").match(/(\d{1,2}):(\d{2})/);

  if (!match) return 0;

  return Number(match[1]) * 60 + Number(match[2]);
}

function getScheduleMapel(schedule) {
  const mapel =
    schedule?.kelasMapel?.mataPelajaran ||
    schedule?.kelasMataPelajaran?.mataPelajaran ||
    schedule?.mataPelajaran ||
    schedule?.mapel;

  if (typeof mapel === "string") return mapel;

  return (
    mapel?.namaMapel ||
    mapel?.namaMataPelajaran ||
    mapel?.nama ||
    schedule?.namaMapel ||
    schedule?.mapelNama ||
    "Mata Pelajaran belum tersedia"
  );
}

function getScheduleKelas(schedule) {
  const kelas =
    schedule?.kelasMapel?.kelas ||
    schedule?.kelasMataPelajaran?.kelas ||
    schedule?.kelas;

  if (typeof kelas === "string") return kelas;

  return (
    kelas?.namaKelas ||
    kelas?.nama ||
    kelas?.namaLengkap ||
    kelas?.tingkatKelas ||
    schedule?.namaKelas ||
    schedule?.kelasNama ||
    "Kelas belum tersedia"
  );
}

function getScheduleGuru(schedule) {
  return (
    schedule?.kelasMapel?.guruPengajar?.namaLengkap ||
    schedule?.kelasMapel?.guruPengajar?.nama ||
    schedule?.guruPengajar?.namaLengkap ||
    schedule?.guru?.namaLengkap ||
    "-"
  );
}

function getScheduleRoom(schedule) {
  return (
    schedule?.ruanganRef?.nama ||
    schedule?.ruangan ||
    schedule?.namaRuangan ||
    "-"
  );
}

function getTodayName() {
  return DAYS[(new Date().getDay() + 6) % 7];
}

function formatTanggal() {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default function JadwalGuruPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState("Semua");

  const today = getTodayName();

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const result = await getJadwalMengajar();
      const data = getScheduleList(result);

      setJadwal(data);

      const userRaw = getStoredUser();

      if (userRaw) {
        try {
          setUser(
            typeof userRaw === "string"
              ? JSON.parse(userRaw)
              : userRaw
          );
        } catch {
          setUser(null);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil jadwal mengajar:", err);
      setError(
        err?.message || "Gagal mengambil data jadwal mengajar."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const filteredSchedules = useMemo(() => {
    return jadwal
      .filter((item) => {
        const day = getScheduleDay(item);

        if (selectedDay !== "Semua" && day !== selectedDay) {
          return false;
        }

        const keyword = search.toLowerCase().trim();

        if (!keyword) return true;

        const searchable = [
          getScheduleMapel(item),
          getScheduleKelas(item),
          getScheduleGuru(item),
          getScheduleRoom(item),
          day,
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(keyword);
      })
      .sort((a, b) => {
        const dayA = DAYS.indexOf(getScheduleDay(a));
        const dayB = DAYS.indexOf(getScheduleDay(b));

        if (dayA !== dayB) return dayA - dayB;

        return (
          getTimeInMinutes(getScheduleStart(a)) -
          getTimeInMinutes(getScheduleStart(b))
        );
      });
  }, [jadwal, selectedDay, search]);

  const todaySchedules = jadwal
    .filter((item) => getScheduleDay(item) === today)
    .sort(
      (a, b) =>
        getTimeInMinutes(getScheduleStart(a)) -
        getTimeInMinutes(getScheduleStart(b))
    );

  const totalMapel = new Set(
    jadwal.map((item) => getScheduleMapel(item))
  ).size;

  const totalKelas = new Set(
    jadwal.map((item) => getScheduleKelas(item))
  ).size;

  const getScheduleStatus = (schedule) => {
    if (getScheduleDay(schedule) !== today) return "";

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const start = getTimeInMinutes(getScheduleStart(schedule));
    const end = getTimeInMinutes(getScheduleEnd(schedule));

    if (currentMinutes >= start && currentMinutes <= end) {
      return "Berlangsung";
    }

    if (currentMinutes < start) {
      return "Akan Datang";
    }

    return "Selesai";
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="guru"
        activeMenu="jadwal"
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          title="Jadwal Mengajar"
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="space-y-6 p-4 sm:p-6 lg:p-8">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-md">
                  <CalendarDays size={23} />
                </div>

                <div>
                  <h1 className="theme-text text-xl font-bold sm:text-2xl">
                    Jadwal Mengajar
                  </h1>
                  <p className="theme-text-secondary mt-1 text-xs sm:text-sm">
                    Informasi jadwal kegiatan mengajar guru.
                  </p>
                </div>
              </div>

              <div className="theme-card flex items-center gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] px-4 py-3">
                <CalendarCheck
                  size={19}
                  className="text-[var(--color-primary)]"
                />

                <div>
                  <p className="theme-text-muted text-[10px] font-medium uppercase">
                    Hari ini
                  </p>
                  <p className="theme-text mt-1 text-sm font-semibold">
                    {formatTanggal()}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-4">
                <AlertCircle
                  size={19}
                  className="theme-danger mt-0.5 shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <p className="theme-danger text-sm font-semibold">
                    Gagal memuat jadwal
                  </p>
                  <p className="theme-text-secondary mt-1 text-sm">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadData(true)}
                  className="theme-text text-xs font-semibold"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              <div className="theme-card rounded-2xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="theme-text-secondary text-xs font-medium">
                      Total Jadwal
                    </p>
                    <p className="theme-text mt-2 text-3xl font-bold">
                      {loading ? "-" : jadwal.length}
                    </p>
                    <p className="theme-text-muted mt-1 text-xs">
                      Jadwal mengajar
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                    <CalendarDays size={23} />
                  </div>
                </div>
              </div>

              <div className="theme-card rounded-2xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="theme-text-secondary text-xs font-medium">
                      Mata Pelajaran
                    </p>
                    <p className="theme-text mt-2 text-3xl font-bold">
                      {loading ? "-" : totalMapel}
                    </p>
                    <p className="theme-text-muted mt-1 text-xs">
                      Mata pelajaran diampu
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <BookOpen size={23} />
                  </div>
                </div>
              </div>

              <div className="theme-card rounded-2xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="theme-text-secondary text-xs font-medium">
                      Total Kelas
                    </p>
                    <p className="theme-text mt-2 text-3xl font-bold">
                      {loading ? "-" : totalKelas}
                    </p>
                    <p className="theme-text-muted mt-1 text-xs">
                      Kelas yang diajar
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <GraduationCap size={23} />
                  </div>
                </div>
              </div>

            </div>

            <section className="theme-card overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] shadow-sm">

              <div className="flex flex-col justify-between gap-3 border-b border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="theme-text text-base font-bold">
                    Jadwal Hari Ini
                  </h2>
                  <p className="theme-text-secondary mt-1 text-xs">
                    Daftar kegiatan mengajar sesuai jadwal hari ini.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
                  {loading ? "Memuat..." : `${todaySchedules.length} Jadwal`}
                </span>
              </div>

              <div className="p-5">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-10">
                    <Loader2
                      size={19}
                      className="animate-spin text-[var(--color-primary)]"
                    />
                    <span className="theme-text-secondary text-sm">
                      Memuat jadwal...
                    </span>
                  </div>
                ) : todaySchedules.length === 0 ? (
                  <div className="py-10 text-center">
                    <CalendarDays
                      size={35}
                      className="theme-text-muted mx-auto mb-3"
                    />
                    <p className="theme-text text-sm font-semibold">
                      Tidak ada jadwal mengajar hari ini
                    </p>
                    <p className="theme-text-secondary mt-1 text-xs">
                      Jadwal mengajar akan ditampilkan jika tersedia.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todaySchedules.map((schedule, index) => {
                      const status = getScheduleStatus(schedule);

                      return (
                        <div
                          key={schedule.id || index}
                          className="flex flex-col gap-4 rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-4 transition hover:border-[var(--color-primary)] sm:flex-row sm:items-center"
                        >
                          <div className="flex shrink-0 items-center gap-3 sm:w-40">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                              <Clock size={20} />
                            </div>

                            <div>
                              <p className="theme-text text-sm font-bold">
                                {formatJam(getScheduleStart(schedule))}
                              </p>
                              <p className="theme-text-muted text-xs">
                                {formatJam(getScheduleEnd(schedule))}
                              </p>
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="theme-text text-sm font-bold">
                              {getScheduleMapel(schedule)}
                            </p>

                            <p className="theme-text-secondary mt-1 text-xs">
                              {getScheduleKelas(schedule)}
                            </p>

                            <div className="theme-text-muted mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                              <span className="flex items-center gap-1">
                                <MapPin size={13} />
                                {getScheduleRoom(schedule)}
                              </span>

                              <span className="flex items-center gap-1">
                                <GraduationCap size={13} />
                                {getScheduleGuru(schedule)}
                              </span>
                            </div>
                          </div>

                          {status && (
                            <span
                              className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold ${
                                status === "Berlangsung"
                                  ? "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]"
                                  : status === "Akan Datang"
                                    ? "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] text-[var(--color-info)]"
                                    : "bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] theme-text-secondary"
                              }`}
                            >
                              {status}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <section className="theme-card overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] shadow-sm">

              <div className="flex flex-col justify-between gap-4 border-b border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5 lg:flex-row lg:items-center">
                <div>
                  <h2 className="theme-text text-base font-bold">
                    Seluruh Jadwal Mengajar
                  </h2>
                  <p className="theme-text-secondary mt-1 text-xs">
                    Informasi jadwal mengajar selama satu minggu.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={refreshing}
                  className="flex items-center justify-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--color-text)_12%,transparent)] px-4 py-2.5 text-xs font-semibold theme-text transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50"
                >
                  <RefreshCw
                    size={14}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  {refreshing ? "Memuat..." : "Muat Ulang"}
                </button>
              </div>

              <div className="space-y-4 p-5">

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_200px]">
                  <div className="relative">
                    <Search
                      size={17}
                      className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari mata pelajaran, kelas, atau ruangan..."
                      className="theme-input w-full rounded-xl border border-[color-mix(in_srgb,var(--color-text)_12%,transparent)] py-3 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="theme-input w-full appearance-none rounded-xl border border-[color-mix(in_srgb,var(--color-text)_12%,transparent)] px-4 py-3 pr-10 text-sm outline-none focus:border-[var(--color-primary)]"
                    >
                      <option value="Semua">Semua Hari</option>
                      {DAYS.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={16}
                      className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDay("Semua")}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      selectedDay === "Semua"
                        ? "bg-[var(--color-primary)] text-white"
                        : "theme-neutral-surface theme-text-secondary"
                    }`}
                  >
                    Semua
                  </button>

                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        selectedDay === day
                          ? "bg-[var(--color-primary)] text-white"
                          : "theme-neutral-surface theme-text-secondary"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="py-12 text-center">
                    <Loader2
                      size={22}
                      className="mx-auto animate-spin text-[var(--color-primary)]"
                    />
                    <p className="theme-text-secondary mt-3 text-sm">
                      Mengambil data jadwal...
                    </p>
                  </div>
                ) : filteredSchedules.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[color-mix(in_srgb,var(--color-text)_15%,transparent)] py-12 text-center">
                    <CalendarDays
                      size={35}
                      className="theme-text-muted mx-auto mb-3"
                    />

                    <p className="theme-text text-sm font-semibold">
                      Jadwal tidak ditemukan
                    </p>

                    <p className="theme-text-secondary mt-1 text-xs">
                      Coba ubah kata kunci atau filter hari.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[750px] text-left">
                      <thead>
                        <tr className="bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]">
                          <th className="theme-text px-4 py-3 text-xs font-semibold">
                            Hari
                          </th>
                          <th className="theme-text px-4 py-3 text-xs font-semibold">
                            Waktu
                          </th>
                          <th className="theme-text px-4 py-3 text-xs font-semibold">
                            Mata Pelajaran
                          </th>
                          <th className="theme-text px-4 py-3 text-xs font-semibold">
                            Kelas
                          </th>
                          <th className="theme-text px-4 py-3 text-xs font-semibold">
                            Ruangan
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredSchedules.map((schedule, index) => (
                          <tr
                            key={schedule.id || index}
                            className="border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"
                          >
                            <td className="theme-text px-4 py-4 text-sm font-semibold">
                              {getScheduleDay(schedule) || "-"}
                            </td>

                            <td className="theme-text-secondary px-4 py-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock
                                  size={14}
                                  className="theme-text-muted"
                                />
                                {formatJam(getScheduleStart(schedule))}
                                {" - "}
                                {formatJam(getScheduleEnd(schedule))}
                              </div>
                            </td>

                            <td className="theme-text px-4 py-4 text-sm font-medium">
                              {getScheduleMapel(schedule)}
                            </td>

                            <td className="theme-text-secondary px-4 py-4 text-sm">
                              {getScheduleKelas(schedule)}
                            </td>

                            <td className="theme-text-secondary px-4 py-4 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin size={14} />
                                {getScheduleRoom(schedule)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!loading && filteredSchedules.length > 0 && (
                  <p className="theme-text-muted text-xs">
                    Menampilkan {filteredSchedules.length} dari {jadwal.length} jadwal.
                  </p>
                )}
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}