
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  RefreshCw,
  Users,
  BriefcaseBusiness,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  X,
  UserRound,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Info,
  GraduationCap,
  BookOpen,
  Clock3,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getUsers } from "@/services/user.service";
import { getShiftKerja } from "@/services/shiftKerja.service";
import {
  getKelas,
  getShiftKelas,
  updateShiftKelas,
} from "@/services/kelas.service";

const PAGE_SIZE = 10;

/* =========================================================
   HELPERS
========================================================= */

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeRoleText(value) {
  return normalizeText(value).replace(/[\s-]+/g, "_").replace(/_+/g, "_");
}

function getArray(response, keys = []) {
  let current = response;

  for (let i = 0; i < 8 && current != null; i++) {
    if (Array.isArray(current)) return current;
    if (typeof current !== "object") return [];

    for (const key of keys) {
      if (Array.isArray(current[key])) return current[key];
    }

    if (Array.isArray(current.items)) return current.items;
    if (Array.isArray(current.results)) return current.results;

    if (!("data" in current)) return [];
    current = current.data;
  }

  return Array.isArray(current) ? current : [];
}

function unwrapResponse(response) {
  let current = response;

  for (let i = 0; i < 6 && current != null; i++) {
    if (typeof current !== "object" || Array.isArray(current)) {
      return current;
    }

    if ("shift" in current) return current;

    if ("kelas" in current && current.kelas?.shift !== undefined) {
      return current.kelas;
    }

    if (!("data" in current)) return current;
    current = current.data;
  }

  return current;
}

function getRole(user) {
  if (!user || typeof user !== "object") return "";

  const candidates = [
    user.peran?.namaTampilan,
    user.peran?.nama,
    user.peran?.kode,
    user.role?.namaTampilan,
    user.role?.nama,
    user.role?.name,
    user.role?.kode,
    user.role?.code,
    user.namaRole,
    user.role,
    user.jenisPengguna,
    user.tipePengguna,
  ];

  const roleValue = candidates.find(
    (value) => value != null && typeof value !== "object" && String(value).trim()
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
  if (!user || typeof user !== "object" || !user.id) return false;
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

/*
 * Mendukung shift berbentuk object maupun ID string.
 * Contoh:
 * { id: "uuid", nama: "Shift Pagi" }
 * "uuid-shift"
 */
function getShiftId(value) {
  if (value == null || value === "") return "";

  if (typeof value === "object") {
    return String(value.id ?? value.shiftKerjaId ?? "");
  }

  const text = String(value).trim();

  // Nilai lama "pagi"/"siang" bukan ID master shift.
  if (["pagi", "siang"].includes(normalizeText(text))) return "";

  return text;
}

function getShiftName(value, shiftList = []) {
  if (value == null || value === "") return "";

  if (typeof value === "object") {
    const id = getShiftId(value);

    if (id) {
      const matched = shiftList.find(
        (item) => String(item.id) === String(id)
      );

      if (matched) {
        return String(matched.nama ?? matched.namaShift ?? matched.kode ?? "");
      }
    }

    return String(
      value.nama ??
        value.namaShift ??
        value.kode ??
        value.jenisShift ??
        ""
    );
  }

  const text = String(value).trim();
  const normalized = normalizeText(text);

  if (normalized === "pagi" || normalized === "siang") return text;

  const matched = shiftList.find(
    (item) =>
      String(item.id) === text ||
      normalizeText(item.nama) === normalized ||
      normalizeText(item.namaShift) === normalized ||
      normalizeText(item.kode) === normalized
  );

  // Jangan tampilkan UUID mentah sebagai nama shift.
  if (!matched) {
    const looksLikeUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        text
      );

    return looksLikeUuid ? "" : text;
  }

  return String(matched.nama ?? matched.namaShift ?? matched.kode ?? "");
}

function getShiftDetail(shiftList, value) {
  if (value == null || value === "") return null;

  const id = getShiftId(value);

  if (id) {
    const matchedById = shiftList.find(
      (item) => String(item.id) === String(id)
    );

    if (matchedById) return matchedById;
  }

  const name = getShiftName(value, shiftList);

  if (name) {
    const matchedByName = shiftList.find((item) =>
      [item.nama, item.namaShift, item.kode].some(
        (candidate) =>
          candidate != null &&
          normalizeText(candidate) === normalizeText(name)
      )
    );

    if (matchedByName) return matchedByName;
  }

  return null;
}

function getUserShift(user) {
  /*
   * Relasi master menjadi sumber utama.
   * Jika relasi belum tersedia, gunakan ID yang dikirim API.
   * Field shiftKerja dipakai sebagai fallback untuk data lama.
   */
  return (
    user?.shiftKerjaMaster ??
    user?.shiftKerjaId ??
    user?.shiftKerja ??
    user?.shift ??
    null
  );
}

function normalizeUser(user) {
  const shiftKerjaMaster =
    user?.shiftKerjaMaster &&
    typeof user.shiftKerjaMaster === "object"
      ? user.shiftKerjaMaster
      : null;

  const shiftKerja =
    user?.shiftKerja && typeof user.shiftKerja === "object"
      ? user.shiftKerja
      : null;

  return {
    ...user,
    shiftKerjaId:
      user?.shiftKerjaId ??
      shiftKerjaMaster?.id ??
      shiftKerja?.id ??
      null,
    shiftKerjaMaster,
  };
}

function getShiftKelasValue(value) {
  if (value == null || value === "") return "";

  const normalized = normalizeText(
    typeof value === "object"
      ? value.shift ?? value.nama ?? value.kode ?? ""
      : value
  );

  if (normalized === "pagi") return "pagi";
  if (normalized === "siang") return "siang";

  return "";
}

function formatJam(value) {
  if (!value) return "-";

  const match = String(value).match(/^(\d{1,2}):(\d{2})/);

  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }

  const date = new Date(value);

  if (!Number.isNaN(date.getTime()) && String(value).includes("T")) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
  }

  return String(value);
}

function getJumlahSiswa(kelas) {
  const value =
    kelas?._count?.anggota ??
    kelas?._count?.siswa ??
    kelas?.jumlahSiswa ??
    kelas?.jumlahAnggota ??
    0;

  return Number(value) || 0;
}

function getTahunAjaran(kelas) {
  return (
    kelas?.tahunAjaran?.nama ??
    kelas?.tahunAjaran?.tahun ??
    kelas?.tahunAjaran?.namaTahunAjaran ??
    "-"
  );
}

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

/* =========================================================
   UI COMPONENTS
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "blue",
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    emerald:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    amber:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  };

  return (
    <div className="theme-card flex flex-col justify-between rounded-xl border theme-border p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-3 border-b theme-border pb-3">
        <p className="text-xs font-bold uppercase tracking-wider theme-text-muted">
          {title}
        </p>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            tones[tone] || tones.blue
          }`}
        >
          <Icon size={18} />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight theme-text">
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </p>

        <p className="mt-1 text-xs leading-relaxed theme-text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}

function ShiftBadge({ shift }) {
  const normalized = normalizeText(shift);

  if (normalized === "pagi") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
        <Clock3 size={13} />
        Pagi
      </span>
    );
  }

  if (normalized === "siang") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
        <Clock3 size={13} />
        Siang
      </span>
    );
  }

  if (shift) {
    return (
      <span className="inline-flex max-w-[180px] items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
        <Clock3 size={13} />
        <span className="truncate">{shift}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
      Belum diketahui
    </span>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function PenugasanShiftPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pegawai");

  const [pegawaiList, setPegawaiList] = useState([]);
  const [shiftList, setShiftList] = useState([]);
  const [kelasList, setKelasList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [updatingKelasId, setUpdatingKelasId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterShift, setFilterShift] = useState("semua");
  const [page, setPage] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setWarnings([]);

    try {
      const [usersResult, shiftsResult, kelasResult] =
        await Promise.allSettled([
          getUsers({ page: 1, limit: 100 }),
          getShiftKerja({
            page: 1,
            limit: 100,
            status: "aktif",
          }),
          getKelas({
            page: 1,
            limit: 100,
            sortBy: "tingkat",
            sortOrder: "asc",
          }),
        ]);

      const nextWarnings = [];

      let users = [];
      let shifts = [];
      let kelas = [];

      if (usersResult.status === "fulfilled") {
        users = getArray(usersResult.value, [
          "users",
          "pengguna",
          "pegawai",
        ]);
      } else {
        nextWarnings.push(
          `Data pengguna gagal dimuat: ${getErrorMessage(
            usersResult.reason,
            "Terjadi kesalahan."
          )}`
        );
      }

      if (shiftsResult.status === "fulfilled") {
        shifts = getArray(shiftsResult.value, [
          "shifts",
          "shiftKerja",
          "data",
        ]);
      } else {
        nextWarnings.push(
          `Master shift kerja gagal dimuat: ${getErrorMessage(
            shiftsResult.reason,
            "Terjadi kesalahan."
          )}`
        );
      }

      if (kelasResult.status === "fulfilled") {
        kelas = getArray(kelasResult.value, ["kelas"]).filter(
          (item) => item && typeof item === "object" && item.id
        );
      } else {
        nextWarnings.push(
          `Data kelas gagal dimuat: ${getErrorMessage(
            kelasResult.reason,
            "Terjadi kesalahan."
          )}`
        );
      }

      const normalizedUsers = users
        .filter(
          (user) =>
            user !== null &&
            typeof user === "object" &&
            !Array.isArray(user)
        )
        .map(normalizeUser);

      const employeeUsers = normalizedUsers.filter(isGuruAtauPegawai);

      if (
        usersResult.status === "fulfilled" &&
        normalizedUsers.length > 0 &&
        employeeUsers.length === 0
      ) {
        nextWarnings.push(
          "Data pengguna berhasil dimuat, tetapi role guru/pegawai tidak ditemukan. Periksa nama field role yang dikirim oleh endpoint pengguna."
        );
      }

      const kelasWithShift = await Promise.all(
        kelas.map(async (item) => {
          if (item.shift !== undefined && item.shift !== null) {
            return {
              ...item,
              shift: getShiftKelasValue(item.shift) || null,
              shiftLoadError: false,
            };
          }

          try {
            const response = await getShiftKelas(item.id);
            const detail = unwrapResponse(response);
            const shiftValue = detail?.shift ?? detail?.kelas?.shift ?? null;

            return {
              ...item,
              shift: getShiftKelasValue(shiftValue) || null,
              shiftLoadError: false,
            };
          } catch {
            return {
              ...item,
              shift: null,
              shiftLoadError: true,
            };
          }
        })
      );

      if (kelasWithShift.some((item) => item.shiftLoadError)) {
        nextWarnings.push(
          "Sebagian shift kelas gagal dimuat. Muat ulang data sebelum mengubah shift kelas tersebut."
        );
      }

      if (
        usersResult.status === "fulfilled" &&
        shifts.length > 0 &&
        employeeUsers.length > 0
      ) {
        const hasMasterAssignment = employeeUsers.some(
          (user) => user.shiftKerjaId || user.shiftKerjaMaster
        );

        if (!hasMasterAssignment) {
          nextWarnings.push(
            "Endpoint pengguna belum mengirim shiftKerjaId atau shiftKerjaMaster. Agar shift tetap tampil setelah halaman dimuat ulang, field tersebut harus dikembalikan oleh BE."
          );
        }
      }

      setPegawaiList(employeeUsers);
      setShiftList(
        shifts.filter((item) => item && typeof item === "object")
      );
      setKelasList(kelasWithShift);
      setWarnings(nextWarnings);

      if (
        usersResult.status === "rejected" &&
        shiftsResult.status === "rejected" &&
        kelasResult.status === "rejected"
      ) {
        setError(
          "Data penugasan tidak dapat dimuat. Periksa koneksi API, sesi login, dan hak akses akun."
        );
      }
    } catch (loadError) {
      setError(
        loadError?.message ||
          "Terjadi kesalahan saat memuat data penugasan."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /*
   * Muat ulang ketika pengguna kembali ke tab browser.
   * Berguna jika penugasan diubah di halaman detail, lalu pengguna
   * kembali ke halaman daftar.
   */
  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [loadData]);

  useEffect(() => {
    if (!notice) return undefined;

    const timeout = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    setPage(1);
    setSearch("");
    setFilterShift("semua");
    setError("");
    setNotice("");
  }, [activeTab]);

  async function handleSaveShiftKelas(kelasId, newShift) {
    const shift = newShift || null;

    const previousKelas = kelasList.find(
      (item) => String(item.id) === String(kelasId)
    );

    if (!previousKelas) return;

    if (previousKelas.shiftLoadError) {
      setError(
        "Detail shift kelas belum berhasil dimuat. Muat ulang data sebelum mengubah shift."
      );
      return;
    }

    if (previousKelas.shift === shift) return;

    setUpdatingKelasId(kelasId);
    setError("");
    setNotice("");

    try {
      // Kontrak BE: PATCH /kelas/:id/shift dengan body { shift }.
      await updateShiftKelas(kelasId, shift);

      setKelasList((previous) =>
        previous.map((item) =>
          String(item.id) === String(kelasId)
            ? {
                ...item,
                shift,
                shiftLoadError: false,
              }
            : item
        )
      );

      setNotice(
        shift
          ? `Shift kelas ${previousKelas.nama || ""} berhasil diubah menjadi ${shift}.`
          : `Shift kelas ${previousKelas.nama || ""} berhasil dihapus.`
      );
    } catch (saveError) {
      setError(
        saveError?.message || "Gagal menyimpan perubahan shift kelas."
      );
    } finally {
      setUpdatingKelasId(null);
    }
  }

  const activeData = activeTab === "pegawai" ? pegawaiList : kelasList;

  const filteredData = useMemo(() => {
    const keyword = normalizeText(search);

    return activeData.filter((item) => {
      let matchSearch = false;

      if (activeTab === "pegawai") {
        matchSearch =
          normalizeText(item.namaLengkap).includes(keyword) ||
          normalizeText(item.email).includes(keyword) ||
          normalizeText(item.nip).includes(keyword) ||
          normalizeText(
            typeof item.jabatan === "string"
              ? item.jabatan
              : item.jabatan?.nama ??
                  item.jabatan?.namaJabatan ??
                  item.peran?.namaTampilan ??
                  item.peran?.nama ??
                  getRole(item)
          ).includes(keyword);
      } else {
        matchSearch =
          normalizeText(item.nama).includes(keyword) ||
          normalizeText(item.tingkat).includes(keyword);
      }

      if (!matchSearch) return false;
      if (filterShift === "semua") return true;

      if (activeTab === "siswa") {
        if (filterShift === "belum") return !item.shift;
        return normalizeText(item.shift) === filterShift;
      }

      const assignedShift = getUserShift(item);
      const shiftName = getShiftName(assignedShift, shiftList);
      const shiftDetail = getShiftDetail(shiftList, assignedShift);

      if (filterShift === "belum") {
        return !shiftName && !shiftDetail;
      }

      return normalizeText(shiftName).includes(filterShift);
    });
  }, [activeData, activeTab, search, filterShift, shiftList]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleData = filteredData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const pegawaiWithShift = pegawaiList.filter((item) => {
    const assignedShift = getUserShift(item);

    return Boolean(
      getShiftName(assignedShift, shiftList) ||
        getShiftDetail(shiftList, assignedShift)
    );
  }).length;

  const pegawaiWithoutShift = pegawaiList.length - pegawaiWithShift;

  const kelasWithShift = kelasList.filter((item) => Boolean(item.shift)).length;
  const kelasWithoutShift = kelasList.length - kelasWithShift;

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                  Penugasan Shift
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 theme-text-secondary">
                  Kelola shift kerja guru dan pegawai serta shift belajar siswa
                  berdasarkan kelas.
                </p>
              </div>

              <button
                type="button"
                onClick={loadData}
                disabled={loading || updatingKelasId !== null}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border theme-border theme-card px-4 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Muat Ulang
              </button>
            </div>

            <div className="mb-6 overflow-x-auto border-b theme-border">
              <div className="flex min-w-max">
                <button
                  type="button"
                  onClick={() => setActiveTab("pegawai")}
                  aria-pressed={activeTab === "pegawai"}
                  className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition sm:px-6 ${
                    activeTab === "pegawai"
                      ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                      : "border-transparent theme-text-muted hover:text-[var(--color-text)]"
                  }`}
                >
                  <BriefcaseBusiness size={17} />
                  Guru / Pegawai
                  <span className="rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-2 py-0.5 text-xs">
                    {loading ? "—" : pegawaiList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("siswa")}
                  aria-pressed={activeTab === "siswa"}
                  className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition sm:px-6 ${
                    activeTab === "siswa"
                      ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                      : "border-transparent theme-text-muted hover:text-[var(--color-text)]"
                  }`}
                >
                  <GraduationCap size={18} />
                  Siswa (Per Kelas)
                  <span className="rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-2 py-0.5 text-xs">
                    {loading ? "—" : kelasList.length}
                  </span>
                </button>
              </div>
            </div>

            <div className="theme-card mb-6 flex items-start gap-3 rounded-lg border theme-border p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                <Info size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold theme-text">
                  {activeTab === "pegawai"
                    ? "Penugasan Shift Guru dan Pegawai"
                    : "Penugasan Shift Belajar Siswa"}
                </p>

                <p className="mt-1 text-xs leading-5 theme-text-muted">
                  {activeTab === "pegawai"
                    ? "Penugasan shift kerja menggunakan master shift kerja yang tersimpan pada pengguna."
                    : "Shift belajar disimpan pada data kelas menggunakan nilai pagi, siang, atau tanpa shift."}
                </p>
              </div>
            </div>

            {warnings.length > 0 && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />

                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Informasi pemuatan data</p>

                  <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-5">
                    {warnings.map((warning, index) => (
                      <li key={`${index}-${warning}`}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
              >
                <AlertCircle size={19} className="mt-0.5 shrink-0" />

                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Permintaan gagal</p>
                  <p className="mt-1 break-words">{error}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Tutup pesan kesalahan"
                  className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {notice && (
              <div
                role="status"
                className="mb-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                <CheckCircle2 size={18} className="shrink-0" />
                <p className="min-w-0 flex-1">{notice}</p>

                <button
                  type="button"
                  onClick={() => setNotice("")}
                  aria-label="Tutup notifikasi"
                  className="rounded p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {activeTab === "pegawai" ? (
                <>
                  <StatCard
                    title="Total Guru / Pegawai"
                    value={loading ? "—" : pegawaiList.length}
                    description="Pengguna dengan role guru atau pegawai"
                    icon={Users}
                    tone="blue"
                  />

                  <StatCard
                    title="Sudah Memiliki Shift"
                    value={loading ? "—" : pegawaiWithShift}
                    description="Pengguna dengan shift kerja teridentifikasi"
                    icon={CheckCircle2}
                    tone="emerald"
                  />

                  <StatCard
                    title="Belum Memiliki Shift"
                    value={loading ? "—" : pegawaiWithoutShift}
                    description="Pengguna tanpa penugasan shift yang teridentifikasi"
                    icon={CalendarClock}
                    tone="amber"
                  />
                </>
              ) : (
                <>
                  <StatCard
                    title="Total Kelas"
                    value={loading ? "—" : kelasList.length}
                    description="Kelas yang terdaftar"
                    icon={BookOpen}
                    tone="blue"
                  />

                  <StatCard
                    title="Kelas Memiliki Shift"
                    value={loading ? "—" : kelasWithShift}
                    description="Kelas dengan shift pagi atau siang"
                    icon={CheckCircle2}
                    tone="emerald"
                  />

                  <StatCard
                    title="Kelas Belum Memiliki Shift"
                    value={loading ? "—" : kelasWithoutShift}
                    description="Kelas yang belum ditetapkan shift"
                    icon={CalendarClock}
                    tone="amber"
                  />
                </>
              )}
            </div>

            <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
              <div className="border-b theme-border p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-base font-bold theme-text">
                      {activeTab === "pegawai"
                        ? "Daftar Penugasan Guru / Pegawai"
                        : "Daftar Penugasan Shift Kelas"}
                    </h2>

                    <p className="mt-1 text-xs theme-text-muted">
                      {filteredData.length.toLocaleString("id-ID")} data ditemukan
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative min-w-0 sm:w-64">
                      <Search
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                      />

                      <input
                        type="search"
                        value={search}
                        onChange={(event) => {
                          setSearch(event.target.value);
                          setPage(1);
                        }}
                        placeholder={
                          activeTab === "pegawai"
                            ? "Cari nama, email, atau jabatan..."
                            : "Cari nama atau tingkat kelas..."
                        }
                        className="theme-input h-10 w-full rounded-lg border pl-10 pr-3 text-sm outline-none transition"
                      />
                    </div>

                    <select
                      value={filterShift}
                      onChange={(event) => {
                        setFilterShift(event.target.value);
                        setPage(1);
                      }}
                      aria-label="Filter berdasarkan shift"
                      className="theme-input h-10 rounded-lg border px-3 text-sm outline-none sm:w-48"
                    >
                      <option value="semua">Semua shift</option>
                      <option value="belum">Belum ada shift</option>
                      <option value="pagi">Pagi</option>
                      <option value="siang">Siang</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="relative overflow-x-auto">
                {loading ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center">
                    <LoaderCircle
                      size={30}
                      className="animate-spin text-[var(--color-primary)]"
                    />
                    <p className="mt-3 text-sm font-medium theme-text-muted">
                      Memuat data penugasan...
                    </p>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
                    <Users size={32} className="mb-3 theme-text-muted opacity-50" />
                    <p className="font-semibold theme-text">Data tidak ditemukan</p>
                    <p className="mt-1 text-xs theme-text-muted">
                      Coba ubah kata kunci atau filter shift yang dipilih.
                    </p>
                  </div>
                ) : activeTab === "pegawai" ? (
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="border-b theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-xs uppercase tracking-wide theme-text-muted">
                      <tr>
                        <th className="px-5 py-4 font-semibold">Guru / Pegawai</th>
                        <th className="px-5 py-4 font-semibold">Jabatan</th>
                        <th className="px-5 py-4 font-semibold">Shift Kerja</th>
                        <th className="px-5 py-4 font-semibold">Jam Kerja</th>
                        <th className="px-5 py-4 text-right font-semibold">Aksi</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
                      {visibleData.map((item) => {
                        const assignedShift = getUserShift(item);
                        const shiftName = getShiftName(assignedShift, shiftList);
                        const shift = getShiftDetail(shiftList, assignedShift);

                        const jabatan =
                          typeof item.jabatan === "string"
                            ? item.jabatan
                            : item.jabatan?.nama ??
                              item.jabatan?.namaJabatan ??
                              item.peran?.namaTampilan ??
                              item.peran?.nama ??
                              getRole(item);

                        return (
                          <tr
                            key={item.id}
                            className="transition hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
                                  <UserRound size={19} />
                                </div>

                                <div className="min-w-0">
                                  <p className="font-semibold theme-text">
                                    {item.namaLengkap || item.nama || "-"}
                                  </p>
                                  <p className="mt-0.5 text-xs theme-text-muted">
                                    {item.email || "-"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="font-medium theme-text">
                                {jabatan || "Pegawai"}
                              </div>

                              {item.nip && (
                                <p className="mt-1 text-xs theme-text-muted">
                                  NIP: {item.nip}
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <ShiftBadge shift={shiftName} />
                            </td>

                            <td className="px-5 py-4 text-xs theme-text-muted">
                              {shift
                                ? `${formatJam(shift.jamMasuk)} - ${formatJam(shift.jamKeluar)}`
                                : shiftName
                                  ? "Detail jam tidak tersedia"
                                  : "Belum diketahui"}
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/admin/presensi/penugasan-shift/${item.id}`
                                  )
                                }
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 text-xs font-semibold text-white transition hover:opacity-90"
                              >
                                <BriefcaseBusiness size={14} />
                                Atur Shift
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="border-b theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-xs uppercase tracking-wide theme-text-muted">
                      <tr>
                        <th className="px-5 py-4 font-semibold">Nama Kelas</th>
                        <th className="px-5 py-4 font-semibold">Tingkat</th>
                        <th className="px-5 py-4 font-semibold">Tahun Ajaran</th>
                        <th className="px-5 py-4 font-semibold">Jumlah Siswa</th>
                        <th className="px-5 py-4 font-semibold">Shift Belajar</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
                      {visibleData.map((item) => (
                        <tr
                          key={item.id}
                          className="transition hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300">
                                <BookOpen size={19} />
                              </div>

                              <div>
                                <p className="font-semibold theme-text">
                                  {item.nama || "-"}
                                </p>

                                {item.waliKelas?.namaLengkap && (
                                  <p className="mt-1 text-xs theme-text-muted">
                                    Wali kelas: {item.waliKelas.namaLengkap}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 font-medium theme-text">
                            Tingkat {item.tingkat || "-"}
                          </td>

                          <td className="px-5 py-4 text-xs theme-text-muted">
                            {getTahunAjaran(item)}
                          </td>

                          <td className="px-5 py-4 theme-text-muted">
                            {getJumlahSiswa(item).toLocaleString("id-ID")} siswa
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <select
                                value={item.shift || ""}
                                disabled={
                                  updatingKelasId === item.id ||
                                  item.shiftLoadError
                                }
                                onChange={(event) =>
                                  handleSaveShiftKelas(item.id, event.target.value)
                                }
                                aria-label={`Shift kelas ${item.nama}`}
                                className={`theme-input h-9 min-w-[140px] rounded-lg border px-2 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                  item.shift === "pagi"
                                    ? "border-blue-300 bg-blue-50 font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                                    : item.shift === "siang"
                                      ? "border-orange-300 bg-orange-50 font-semibold text-orange-700 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300"
                                      : "theme-border theme-text-muted"
                                }`}
                              >
                                {item.shiftLoadError ? (
                                  <option value="">Gagal memuat shift</option>
                                ) : (
                                  <>
                                    <option value="">Tanpa Shift</option>
                                    <option value="pagi">Pagi</option>
                                    <option value="siang">Siang</option>
                                  </>
                                )}
                              </select>

                              {updatingKelasId === item.id && (
                                <LoaderCircle
                                  size={16}
                                  className="animate-spin text-[var(--color-primary)]"
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {!loading && filteredData.length > 0 && (
                <div className="flex flex-col gap-3 border-t theme-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <p className="text-xs theme-text-muted">
                    Menampilkan {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, filteredData.length)} dari{" "}
                    {filteredData.length} data
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() =>
                        setPage((previous) => Math.max(1, previous - 1))
                      }
                      className="flex h-9 items-center gap-1 rounded-lg border theme-border px-3 text-xs font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={14} />
                      Sebelumnya
                    </button>

                    <span className="px-2 text-xs theme-text-muted">
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setPage((previous) =>
                          Math.min(totalPages, previous + 1)
                        )
                      }
                      className="flex h-9 items-center gap-1 rounded-lg border theme-border px-3 text-xs font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Berikutnya
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </section>

            <p className="mt-4 text-xs leading-5 theme-text-muted">
              Catatan: penugasan shift kerja guru dan pegawai menggunakan relasi
              master shift pada pengguna, sedangkan shift belajar siswa disimpan
              pada data kelas. Perubahan shift kelas tidak otomatis mengubah
              field shiftKerja pada akun siswa.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
