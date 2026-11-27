"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Clock3,
  CalendarClock,
  UserRoundCog,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  BarChart3,
  Table2,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { hasMenuAccess } from "@/lib/auth";
import { getShiftKerja } from "@/services/shiftKerja.service";
import { getUsers } from "@/services/user.service";

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeRoleText(value) {
  return normalizeText(value).replace(/[\s-]+/g, "_").replace(/_+/g, "_");
}

function formatTime(value) {
  if (!value) return "--:--";
  if (typeof value === "string") {
    const match = value.match(/^(\d{1,2}):(\d{2})/);
    if (match) return `${match[1].padStart(2, "0")}:${match[2]}`;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  }
  return String(value);
}

function normalizeShift(item) {
  return {
    ...item,
    id: item?.id ? String(item.id) : "",
    nama: item?.nama ?? item?.name ?? "Shift tanpa nama",
    kode: item?.kode ?? "",
    jamMasuk: item?.jamMasuk ?? item?.jam_masuk ?? null,
    jamKeluar: item?.jamKeluar ?? item?.jam_keluar ?? null,
    toleransiTerlambatMenit: Number(
      item?.toleransiTerlambatMenit ?? item?.toleransiTerlambat ?? 15
    ),
    status: String(item?.status ?? "aktif").toLowerCase(),
    jumlahPegawai: Number(
      item?.jumlahPegawai ?? item?._count?.pengguna ?? 0
    ),
  };
}

function getArray(response, keys = []) {
  let current = response;

  for (let i = 0; i < 10 && current != null; i++) {
    if (Array.isArray(current)) return current;
    if (!isObject(current)) return [];

    for (const key of keys) {
      if (Array.isArray(current[key])) return current[key];
    }

    for (const key of ["items", "results", "rows"]) {
      if (Array.isArray(current[key])) return current[key];
    }

    if (!("data" in current)) return [];
    current = current.data;
  }

  return Array.isArray(current) ? current : [];
}

function getRole(user) {
  if (!isObject(user)) return "";

  const candidates = [
    user.peran?.namaTampilan,
    user.peran?.nama,
    user.peran?.kode,
    user.role?.namaTampilan,
    user.role?.nama,
    user.role?.name,
    user.role?.kode,
    user.role?.code,
    typeof user.role === "string" ? user.role : "",
    user.namaRole,
    user.jenisPengguna,
    user.tipePengguna,
  ];

  const roleValue = candidates.find(
    (value) =>
      value != null &&
      typeof value !== "object" &&
      String(value).trim()
  );

  return normalizeRoleText(roleValue);
}

function isSiswa(user) {
  const role = getRole(user);
  return (
    role === "siswa" ||
    role === "student" ||
    role === "murid" ||
    role.includes("siswa") ||
    role.includes("student") ||
    role.includes("murid")
  );
}

function isAdministrativeRole(user) {
  const role = getRole(user);
  return [
    "super_admin",
    "superadmin",
    "admin",
    "admin_sekolah",
    "adminsekolah",
    "admin_yayasan",
    "adminyayasan",
    "cms_admin",
    "orang_tua",
    "orangtua",
    "parent",
    "wali_murid",
  ].includes(role);
}

function isGuruAtauPegawai(user) {
  if (!isObject(user) || !user.id) return false;
  if (isSiswa(user) || isAdministrativeRole(user)) return false;

  const role = getRole(user);
  const employeeRoles = [
    "guru",
    "teacher",
    "pegawai",
    "staff",
    "staf",
    "karyawan",
    "tenaga_kependidikan",
    "tenaga_pendidik",
  ];

  if (employeeRoles.includes(role)) return true;

  const jabatan = normalizeRoleText(
    typeof user.jabatan === "string"
      ? user.jabatan
      : user.jabatan?.nama ??
          user.jabatan?.namaJabatan ??
          user.jabatan?.namaTampilan ??
          ""
  );

  return (
    jabatan === "guru" ||
    jabatan === "teacher" ||
    jabatan === "pegawai" ||
    jabatan === "staff" ||
    jabatan === "staf" ||
    jabatan === "karyawan" ||
    jabatan.includes("guru") ||
    jabatan.includes("pegawai") ||
    jabatan.includes("karyawan") ||
    jabatan.includes("tenaga_kependidikan") ||
    jabatan.includes("tenaga_pendidik")
  );
}

function extractUserShiftCandidates(user) {
  if (!isObject(user)) return [];

  const rawCandidates = [];

  if (Array.isArray(user.shifts)) rawCandidates.push(...user.shifts);
  if (Array.isArray(user.shiftKerjaList)) {
    rawCandidates.push(...user.shiftKerjaList);
  }
  if (Array.isArray(user.penugasanShift)) {
    rawCandidates.push(...user.penugasanShift);
  }
  if (Array.isArray(user.shiftKerja)) {
    rawCandidates.push(...user.shiftKerja);
  }

  if (user.shiftKerjaMaster) rawCandidates.push(user.shiftKerjaMaster);
  if (user.shiftKerjaId) rawCandidates.push(user.shiftKerjaId);
  if (
    user.shiftKerja !== undefined &&
    user.shiftKerja !== null &&
    !Array.isArray(user.shiftKerja)
  ) {
    rawCandidates.push(user.shiftKerja);
  }
  if (user.shift?.id) rawCandidates.push(user.shift.id);
  if (user.shift !== undefined && user.shift !== null) {
    rawCandidates.push(user.shift);
  }

  return rawCandidates.filter((val) => val !== null && val !== undefined && val !== "");
}

function matchShiftRecord(candidate, shiftList = []) {
  if (candidate == null || candidate === "") return null;

  if (isObject(candidate)) {
    const id = String(
      candidate.id ??
        candidate.shiftKerjaId ??
        candidate.shiftKerjaMaster?.id ??
        ""
    ).trim();

    if (id) {
      const byId = shiftList.find((s) => String(s.id) === id);
      if (byId) return byId;
    }

    const nameCandidate = String(
      candidate.nama ??
        candidate.namaShift ??
        candidate.kode ??
        candidate.jenisShift ??
        candidate.shift ??
        ""
    ).trim();

    if (nameCandidate) {
      const norm = normalizeText(nameCandidate);
      const byName = shiftList.find(
        (s) =>
          normalizeText(s.nama) === norm || normalizeText(s.kode) === norm
      );
      if (byName) return byName;

      const status = String(candidate.status ?? "aktif").toLowerCase();
      if (status !== "nonaktif") {
        return {
          id: id || `custom:${norm}`,
          nama: nameCandidate,
          status: "aktif",
        };
      }
    }
    return null;
  }

  const text = String(candidate).trim();
  if (!text) return null;
  const norm = normalizeText(text);

  const matched = shiftList.find(
    (s) =>
      String(s.id) === text ||
      normalizeText(s.nama) === norm ||
      normalizeText(s.kode) === norm
  );

  if (matched) return matched;

  const looksLikeUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      text
    );

  if (!looksLikeUuid) {
    return {
      id: `custom:${norm}`,
      nama: norm === "pagi" ? "Pagi" : norm === "siang" ? "Siang" : text,
      status: "aktif",
    };
  }

  return null;
}

/**
 * Menghitung metrik dashboard Manajemen Shift secara murni & deterministik.
 * - Jika 1 guru/staf memiliki beberapa penugasan shift (baik beberapa record dengan user.id sama
 *   maupun beberapa shift dalam 1 objek user), orang tersebut dihitung 1 kali untuk cakupan.
 * - Hanya penugasan shift yang berlaku (aktif) yang dihitung sebagai sudah ditugaskan.
 */
export function computeShiftDashboardMetrics(rawShifts = [], rawStaff = []) {
  const normalizedShifts = (Array.isArray(rawShifts) ? rawShifts : []).map(
    normalizeShift
  );

  const totalMasterShift = normalizedShifts.length;
  const shiftAktifCount = normalizedShifts.filter(
    (item) => item.status === "aktif"
  ).length;

  // Map unik per guru/staf berdasarkan ID
  const uniqueStaffShiftsMap = new Map();
  // Map set userId unik per shift.id untuk distribusi per shift
  const shiftAssignedUsersMap = new Map();
  normalizedShifts.forEach((shift) => {
    shiftAssignedUsersMap.set(String(shift.id), new Set());
  });

  (Array.isArray(rawStaff) ? rawStaff : []).forEach((user) => {
    if (!isObject(user) || !user.id) return;
    const userId = String(user.id).trim();
    if (!userId) return;

    if (!uniqueStaffShiftsMap.has(userId)) {
      uniqueStaffShiftsMap.set(userId, new Set());
    }

    const userAssignedSet = uniqueStaffShiftsMap.get(userId);
    const candidates = extractUserShiftCandidates(user);

    candidates.forEach((candidate) => {
      const matchedShift = matchShiftRecord(candidate, normalizedShifts);
      if (!matchedShift) return;

      const isShiftActive =
        String(matchedShift.status ?? "aktif").toLowerCase() === "aktif";

      if (isShiftActive) {
        const shiftKey = String(matchedShift.id || matchedShift.nama);
        userAssignedSet.add(shiftKey);

        if (shiftAssignedUsersMap.has(String(matchedShift.id))) {
          shiftAssignedUsersMap.get(String(matchedShift.id)).add(userId);
        }
      }
    });
  });

  const totalStaffCount = uniqueStaffShiftsMap.size;
  let assignedUniqueStaffCount = 0;

  uniqueStaffShiftsMap.forEach((assignedSet) => {
    if (assignedSet.size > 0) {
      assignedUniqueStaffCount += 1;
    }
  });

  const unassignedUniqueStaffCount = Math.max(
    0,
    totalStaffCount - assignedUniqueStaffCount
  );

  const coveragePercentage =
    totalStaffCount > 0
      ? Math.round((assignedUniqueStaffCount / totalStaffCount) * 100)
      : 0;

  // Tabel & distribusi per shift
  const shiftsWithCount = normalizedShifts.map((shift) => {
    const matchedUserSet = shiftAssignedUsersMap.get(String(shift.id));
    const computedUserCount = matchedUserSet ? matchedUserSet.size : 0;
    const assignedCount =
      totalStaffCount > 0
        ? computedUserCount
        : Number(shift.jumlahPegawai ?? 0);

    return {
      ...shift,
      assignedCount,
    };
  });

  const maxShiftAssignedCount = shiftsWithCount.reduce(
    (max, item) => Math.max(max, item.assignedCount),
    0
  );

  return {
    totalMasterShift,
    shiftAktifCount,
    totalStaffCount,
    assignedUniqueStaffCount,
    unassignedUniqueStaffCount,
    coveragePercentage,
    shiftsWithCount,
    maxShiftAssignedCount,
  };
}

async function withRetry(fn, retries = 1, delayMs = 350) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return withRetry(fn, retries - 1, delayMs);
  }
}

async function fetchAllStaffUsers() {
  const firstPage = await withRetry(() => getUsers({ page: 1, limit: 100 }));
  const firstItems = getArray(firstPage, ["users", "pengguna", "data"]);
  const meta = firstPage?.meta ?? firstPage?.pagination ?? {};
  const totalPages = Math.min(Number(meta?.totalPages ?? 1) || 1, 10);

  if (totalPages <= 1) {
    return firstItems;
  }

  const pagePromises = [];
  for (let p = 2; p <= totalPages; p += 1) {
    pagePromises.push(withRetry(() => getUsers({ page: p, limit: 100 })));
  }

  const remainingPages = await Promise.allSettled(pagePromises);
  const allItems = [...firstItems];

  remainingPages.forEach((res) => {
    if (res.status === "fulfilled") {
      allItems.push(...getArray(res.value, ["users", "pengguna", "data"]));
    }
  });

  return allItems;
}

export default function ManajemenShiftOverviewPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shifts, setShifts] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const loadDashboardData = useCallback(async () => {
    if (!hasMenuAccess("shift", "view")) {
      setError("Anda tidak memiliki akses ke menu Manajemen Shift.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [shiftResult, userResult] = await Promise.allSettled([
        withRetry(() => getShiftKerja({ page: 1, limit: 100 })),
        fetchAllStaffUsers(),
      ]);

      if (
        shiftResult.status === "rejected" &&
        userResult.status === "rejected"
      ) {
        throw new Error(
          shiftResult.reason?.message ||
            userResult.reason?.message ||
            "Gagal memuat data Manajemen Shift dari server."
        );
      }

      let loadedShifts = [];
      if (shiftResult.status === "fulfilled") {
        loadedShifts = Array.isArray(shiftResult.value?.data)
          ? shiftResult.value.data
          : getArray(shiftResult.value, ["shifts", "shiftKerja"]);
      }

      let loadedStaff = [];
      if (userResult.status === "fulfilled") {
        const rawUsers = Array.isArray(userResult.value)
          ? userResult.value
          : getArray(userResult.value, ["users", "pengguna", "data"]);
        loadedStaff = rawUsers.filter(isGuruAtauPegawai);
      }

      setShifts(loadedShifts);
      setStaffList(loadedStaff);
    } catch (err) {
      setError(
        err?.message || "Gagal memuat data Manajemen Shift. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboardData();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadDashboardData]);

  const metrics = useMemo(
    () => computeShiftDashboardMetrics(shifts, staffList),
    [shifts, staffList]
  );

  return (
    <div className="flex h-screen overflow-hidden theme-page theme-text">
      <Sidebar
        role="admin"
        active="manajemenShift"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Header
            title="Manajemen Shift"
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header Section */}
            <section className="theme-card theme-border rounded-2xl border p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-md">
                    <Clock3 size={23} />
                  </div>

                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="theme-primary-soft theme-primary-text rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        Manajemen Shift
                      </span>
                    </div>

                    <h1 className="text-xl font-bold tracking-tight theme-text sm:text-2xl">
                      Manajemen Shift
                    </h1>

                    <p className="mt-1 max-w-2xl text-sm theme-text-muted">
                      Pantau cakupan penugasan shift kerja, distribusi guru dan
                      staf per shift, serta daftar jadwal Master Shift yang
                      berlaku di sekolah.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={loadDashboardData}
                    disabled={loading}
                    className="theme-card theme-border theme-text-secondary inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold shadow-sm transition hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] hover:text-[var(--color-primary)] disabled:opacity-60"
                  >
                    <RefreshCw
                      size={14}
                      className={
                        loading ? "animate-spin theme-primary-text" : ""
                      }
                    />
                    Muat Ulang
                  </button>
                </div>
              </div>
            </section>

            {/* Error State */}
            {error && (
              <div className="flex items-start justify-between gap-4 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                  />
                  <div>
                    <p className="text-sm font-semibold theme-text">
                      Gagal memuat data Manajemen Shift
                    </p>
                    <p className="mt-1 text-xs theme-text-muted">{error}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loadDashboardData}
                  className="shrink-0 rounded-lg border theme-border theme-card px-3 py-1.5 text-xs font-semibold theme-text transition hover:border-[var(--color-primary)]"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* 1. Empat Kartu Angka di Bagian Atas */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="theme-card theme-border rounded-xl border p-4 shadow-sm sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                      Total Master Shift
                    </p>
                    <p
                      data-testid="stat-total-master-shift"
                      className="mt-2 text-2xl font-bold tracking-tight tabular-nums theme-text sm:text-3xl"
                    >
                      {loading ? "—" : metrics.totalMasterShift}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <CalendarClock size={20} />
                  </div>
                </div>
              </div>

              <div className="theme-card theme-border rounded-xl border p-4 shadow-sm sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                      Shift Aktif
                    </p>
                    <p
                      data-testid="stat-shift-aktif"
                      className="mt-2 text-2xl font-bold tracking-tight tabular-nums theme-text sm:text-3xl"
                    >
                      {loading ? "—" : metrics.shiftAktifCount}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
              </div>

              <div className="theme-card theme-border rounded-xl border p-4 shadow-sm sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                      Guru & Staf Sudah Ditugaskan
                    </p>
                    <p
                      data-testid="stat-staf-ditugaskan"
                      className="mt-2 text-2xl font-bold tracking-tight tabular-nums theme-text sm:text-3xl"
                    >
                      {loading ? "—" : metrics.assignedUniqueStaffCount}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <UserCheck size={20} />
                  </div>
                </div>
              </div>

              <div className="theme-card theme-border rounded-xl border p-4 shadow-sm sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]" />
                      Guru & Staf Belum Ditugaskan
                    </p>
                    <p
                      data-testid="stat-staf-belum-ditugaskan"
                      className="mt-2 text-2xl font-bold tracking-tight tabular-nums theme-text sm:text-3xl"
                    >
                      {loading ? "—" : metrics.unassignedUniqueStaffCount}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <UserX size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* 2 & 3. Panel Utama: Cakupan Penugasan Shift & Distribusi Guru & Staf per Shift */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Panel Utama: Cakupan Penugasan Shift */}
              <section
                id="cakupan-penugasan-shift-panel"
                className="theme-card theme-border flex flex-col justify-between rounded-2xl border p-6 shadow-sm lg:col-span-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                        <UserRoundCog size={22} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold theme-text">
                          Cakupan Penugasan Shift
                        </h2>
                        <p className="mt-0.5 text-xs theme-text-muted">
                          Proporsi guru dan staf unik dengan shift kerja aktif
                        </p>
                      </div>
                    </div>
                  </div>

                  {loading ? (
                    <div className="mt-6 rounded-xl border theme-border p-8 text-center text-xs theme-text-muted">
                      Menghitung cakupan penugasan shift...
                    </div>
                  ) : metrics.totalStaffCount === 0 ? (
                    <div className="mt-6 rounded-xl border border-dashed theme-border p-8 text-center">
                      <p
                        data-testid="coverage-empty-text"
                        className="text-sm font-semibold theme-text"
                      >
                        Belum ada data guru & staf
                      </p>
                      <p className="mt-1 text-xs theme-text-muted">
                        Tambahkan data guru atau tenaga kependidikan terlebih
                        dahulu untuk mulai mengatur penugasan shift.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <div className="flex items-baseline justify-between gap-4">
                        <span
                          data-testid="coverage-percentage"
                          className="text-4xl font-extrabold tracking-tight tabular-nums theme-primary-text sm:text-5xl"
                        >
                          {metrics.coveragePercentage}%
                        </span>
                        <span className="rounded-full border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-3 py-1 text-xs font-semibold theme-primary-text">
                          Cakupan Aktif
                        </span>
                      </div>

                      <p
                        data-testid="coverage-comparison-text"
                        className="mt-2 text-sm font-medium theme-text-secondary"
                      >
                        {metrics.assignedUniqueStaffCount} dari{" "}
                        {metrics.totalStaffCount} guru & staf sudah ditugaskan
                      </p>

                      {/* Progress Bar */}
                      <div
                        role="progressbar"
                        aria-label="Cakupan Penugasan Shift"
                        aria-valuenow={metrics.coveragePercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="mt-4 h-3.5 w-full overflow-hidden rounded-full bg-[var(--color-input)]"
                      >
                        <div
                          className="theme-primary h-full rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${metrics.coveragePercentage}%` }}
                        />
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border theme-border bg-[var(--color-input)] p-3.5">
                          <p className="text-[11px] font-medium theme-text-muted">
                            Sudah Ditugaskan
                          </p>
                          <p className="mt-1 text-lg font-bold tabular-nums text-[var(--color-success)]">
                            {metrics.assignedUniqueStaffCount} orang
                          </p>
                        </div>

                        <div className="rounded-xl border theme-border bg-[var(--color-input)] p-3.5">
                          <p className="text-[11px] font-medium theme-text-muted">
                            Belum Ditugaskan
                          </p>
                          <p className="mt-1 text-lg font-bold tabular-nums text-[var(--color-warning)]">
                            {metrics.unassignedUniqueStaffCount} orang
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t theme-border pt-4">
                  <Link
                    href="/admin/presensi/penugasan-shift"
                    className="inline-flex items-center gap-2 text-xs font-semibold theme-primary-text transition hover:opacity-80 sm:text-sm"
                  >
                    Kelola Penugasan Shift
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </section>

              {/* Panel Samping: Distribusi Guru & Staf per Shift */}
              <section
                id="distribusi-shift-panel"
                className="theme-card theme-border flex flex-col justify-between rounded-2xl border p-6 shadow-sm lg:col-span-7"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                        <BarChart3 size={22} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold theme-text">
                          Distribusi Guru & Staf per Shift
                        </h2>
                        <p className="mt-0.5 text-xs theme-text-muted">
                          Perbandingan jumlah guru dan staf pada setiap jadwal
                          shift
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full border theme-border bg-[var(--color-input)] px-3 py-1 text-xs font-semibold theme-text-secondary">
                      {loading
                        ? "..."
                        : `${metrics.shiftsWithCount.length} Shift`}
                    </span>
                  </div>

                  <div className="mt-6">
                    {loading ? (
                      <div className="rounded-xl border theme-border p-8 text-center text-xs theme-text-muted">
                        Memuat grafik distribusi shift...
                      </div>
                    ) : metrics.shiftsWithCount.length === 0 ? (
                      <div className="rounded-xl border border-dashed theme-border p-8 text-center">
                        <p className="text-sm font-semibold theme-text">
                          Belum ada jadwal Master Shift
                        </p>
                        <p className="mt-1 text-xs theme-text-muted">
                          Tambahkan jadwal pada menu Master Shift untuk melihat
                          distribusi penugasan guru dan staf per shift.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {metrics.shiftsWithCount.map((shift) => {
                          const denominator = Math.max(
                            metrics.totalStaffCount,
                            metrics.maxShiftAssignedCount,
                            1
                          );
                          const barPercent =
                            shift.assignedCount > 0
                              ? Math.max(
                                  6,
                                  Math.min(
                                    100,
                                    Math.round(
                                      (shift.assignedCount / denominator) * 100
                                    )
                                  )
                                )
                              : 0;

                          return (
                            <div
                              key={shift.id || shift.nama}
                              data-testid={`distribusi-row-${shift.nama}`}
                              className="rounded-xl border theme-border bg-[var(--color-input)] p-4"
                            >
                              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                                <div className="flex min-w-0 items-center gap-2">
                                  <span className="truncate font-semibold theme-text">
                                    {shift.nama}
                                  </span>
                                  {shift.kode ? (
                                    <span className="shrink-0 text-xs theme-text-muted">
                                      ({shift.kode})
                                    </span>
                                  ) : null}
                                </div>

                                <span className="shrink-0 font-bold tabular-nums theme-text">
                                  {shift.assignedCount} orang
                                </span>
                              </div>

                              <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-[var(--color-card)]">
                                <div
                                  className="theme-primary h-full rounded-full transition-all duration-500 ease-out"
                                  style={{ width: `${barPercent}%` }}
                                />
                              </div>

                              <div className="mt-2 flex items-center justify-between text-[11px] theme-text-muted">
                                <span>
                                  Jam {formatTime(shift.jamMasuk)} –{" "}
                                  {formatTime(shift.jamKeluar)}
                                </span>
                                <span>
                                  Status:{" "}
                                  {shift.status === "aktif"
                                    ? "Aktif"
                                    : "Nonaktif"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t theme-border pt-4">
                  <Link
                    href="/admin/presensi/master-shift"
                    className="inline-flex items-center gap-2 text-xs font-semibold theme-primary-text transition hover:opacity-80 sm:text-sm"
                  >
                    Kelola Master Shift
                    <ArrowRight size={15} />
                  </Link>

                  <Link
                    href="/admin/presensi/penugasan-shift"
                    className="inline-flex items-center gap-2 text-xs font-semibold theme-text-secondary transition hover:text-[var(--color-primary)] sm:text-sm"
                  >
                    Kelola Penugasan Shift
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </section>
            </div>

            {/* 4. Tabel Master Shift di Bawah Grafik */}
            <section
              id="tabel-master-shift-section"
              className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm"
            >
              <div className="flex flex-col gap-4 border-b theme-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <Table2 size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold theme-text">
                      Master Shift
                    </h2>
                    <p className="mt-0.5 text-xs theme-text-muted">
                      Daftar jadwal shift kerja beserta jam operasional, status,
                      dan jumlah guru & staf yang ditugaskan
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    href="/admin/presensi/master-shift"
                    className="theme-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                  >
                    Kelola Master Shift
                    <ArrowRight size={14} />
                  </Link>

                  <Link
                    href="/admin/presensi/penugasan-shift"
                    className="theme-card theme-border inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold theme-text transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    Kelola Penugasan Shift
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b theme-border bg-[var(--color-input)] text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                    <tr>
                      <th className="px-5 py-3.5">Nama Shift</th>
                      <th className="px-5 py-3.5">Jam Masuk</th>
                      <th className="px-5 py-3.5">Jam Pulang</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">
                        Jumlah Orang yang Ditugaskan
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y theme-border">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-8 text-center text-xs theme-text-muted"
                        >
                          Memuat tabel Master Shift...
                        </td>
                      </tr>
                    ) : metrics.shiftsWithCount.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-8 text-center text-xs theme-text-muted"
                        >
                          Belum ada jadwal Master Shift yang terdaftar.
                        </td>
                      </tr>
                    ) : (
                      metrics.shiftsWithCount.map((shift) => {
                        const isAktif = shift.status === "aktif";
                        return (
                          <tr
                            key={shift.id || shift.nama}
                            className="transition hover:bg-[var(--color-input)]"
                          >
                            <td className="px-5 py-4 font-semibold theme-text">
                              <div>
                                <span>{shift.nama}</span>
                                {shift.kode ? (
                                  <span className="ml-2 rounded-md border theme-border bg-[var(--color-input)] px-2 py-0.5 text-[11px] font-normal theme-text-muted">
                                    {shift.kode}
                                  </span>
                                ) : null}
                              </div>
                            </td>

                            <td className="px-5 py-4 tabular-nums theme-text-secondary">
                              {formatTime(shift.jamMasuk)}
                            </td>

                            <td className="px-5 py-4 tabular-nums theme-text-secondary">
                              {formatTime(shift.jamKeluar)}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  isAktif
                                    ? "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]"
                                    : "bg-[var(--color-input)] theme-text-muted"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    isAktif
                                      ? "bg-[var(--color-success)]"
                                      : "bg-current"
                                  }`}
                                />
                                {isAktif ? "Aktif" : "Nonaktif"}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right font-bold tabular-nums theme-text">
                              {shift.assignedCount} orang
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
