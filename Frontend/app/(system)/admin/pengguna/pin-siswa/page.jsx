"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getToken, getStoredUser } from "@/lib/auth";

import {
  Search,
  ShieldCheck,
  Users,
  RefreshCw,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  X,
  GraduationCap,
  Database,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { apiFetch } from "@/lib/api";
import { getKelasSayaDariAnggota } from "@/services/kelas.service";



const ENDPOINT_SISWA = "/api/siswa";

const ENDPOINT_RESET_PIN = (userId) =>
  `/api/auth/pin/admin-reset/${encodeURIComponent(userId)}`;



function unwrapResponse(response) {
  let result = response;

  for (let i = 0; i < 4; i += 1) {
    if (!result || typeof result !== "object" || Array.isArray(result)) {
      return result;
    }

    if (
      Array.isArray(result.siswa) ||
      Array.isArray(result.items) ||
      Array.isArray(result.results) ||
      Array.isArray(result.data)
    ) {
      return result;
    }

    if (
      result.data &&
      typeof result.data === "object" &&
      !Array.isArray(result.data)
    ) {
      result = result.data;
      continue;
    }

    break;
  }

  return result;
}

function ambilDaftarSiswa(response) {
  const result = unwrapResponse(response);

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.siswa)) return result.siswa;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.results)) return result.results;
  if (Array.isArray(result?.data)) return result.data;

  return [];
}

function formatNamaSiswa(siswa) {
  return (
    siswa?.namaLengkap ||
    siswa?.nama ||
    siswa?.name ||
    siswa?.namaPengguna ||
    "Nama tidak tersedia"
  );
}

function formatIdentifier(siswa) {
  return (
    siswa?.nis ||
    siswa?.nomorInduk ||
    siswa?.nisn ||
    siswa?.namaPengguna ||
    siswa?.username ||
    siswa?.email ||
    "-"
  );
}

function formatKelas(siswa) {
  return (
    siswa?.kelas?.nama ||
    siswa?.kelas?.namaKelas ||
    siswa?.kelas?.nama_kelas ||
    siswa?.namaKelas ||
    siswa?.kelasNama ||
    siswa?.kelas?.tingkatNama ||
    ""
  );
}

function statusPinSiswa(siswa) {
  const status =
    siswa?.pinConfigured ??
    siswa?.sudahAturPin ??
    siswa?.hasPin ??
    siswa?.memilikiPin;

  if (status === true || status === 1 || status === "true") {
    return "Sudah diatur";
  }

  if (status === false || status === 0 || status === "false") {
    return "Belum diatur";
  }

  return "Belum diketahui";
}

function pesanResponse(response, pesanDefault) {
  const result = unwrapResponse(response);

  return result?.message || response?.message || pesanDefault;
}

function merupakanSiswa(siswa) {
  const role = String(
    siswa?.peran?.nama ||
      siswa?.peran?.namaTampilan ||
      siswa?.role ||
      siswa?.namaPeran ||
      siswa?.peranNama ||
      ""
  )
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return !role || role === "siswa";
}

/* =====================================================
   THEME HELPERS
===================================================== */

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themeCardShadow =
  "shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  loading,
}) {
  return (
    <div
      className={`
        theme-card
        rounded-2xl
        border
        theme-border
        p-4
        sm:p-5
        ${themeCardShadow}
        transition-all
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium theme-text-muted">
            {title}
          </p>

          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded-lg bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]" />
          ) : (
            <p className="mt-1.5 text-2xl font-bold theme-text sm:text-3xl">
              {value}
            </p>
          )}

          <p className="mt-1 text-[11px] theme-text-muted">
            {description}
          </p>
        </div>

        <div
          className={`
            flex h-10 w-10 shrink-0 items-center justify-center
            rounded-xl border ${themePrimarySoft} ${themePrimarySoftBorder}
          `}
        >
          <Icon size={18} className={iconClass} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   PIN STATUS BADGE
===================================================== */

function PinStatusBadge({ status }) {
  const config =
    status === "Sudah diatur"
      ? {
          icon: CheckCircle2,
          className: "theme-success",
        }
      : status === "Belum diatur"
        ? {
            icon: AlertCircle,
            className: "theme-warning",
          }
        : {
            icon: AlertCircle,
            className: "theme-text-secondary",
          };

  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full border theme-border
        px-2.5 py-1
        text-[11px] font-semibold whitespace-nowrap
        ${config.className}
      `}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function PengaturanPinPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [siswa, setSiswa] = useState([]);
  const [pencarian, setPencarian] = useState("");

  const [loading, setLoading] = useState(true);
  const [memuatUlang, setMemuatUlang] = useState(false);
  const [sedangReset, setSedangReset] = useState("");

  const [siswaDipilih, setSiswaDipilih] = useState(null);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");

  const [roleDiizinkan, setRoleDiizinkan] = useState(false);
  const [siapPeriksaRole, setSiapPeriksaRole] = useState(false);

  /* =====================================================
     LOAD STUDENTS
  ===================================================== */

  const muatSiswa = useCallback(async (refresh = false) => {
    setError("");
    setSukses("");

    if (refresh) {
      setMemuatUlang(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await apiFetch(ENDPOINT_SISWA, {
        method: "GET",
      });

      const daftarSiswa = ambilDaftarSiswa(response);

      if (!Array.isArray(daftarSiswa)) {
        throw new Error("Format daftar siswa dari Backend tidak valid.");
      }

      const daftarKhususSiswa = daftarSiswa.filter(merupakanSiswa);

      const daftarDenganKelas = await Promise.all(
        daftarKhususSiswa.map(async (item) => {
          const siswaId = item?.id || item?.userId;
          const kelasTersedia = formatKelas(item);

          if (kelasTersedia || !siswaId) {
            return {
              ...item,
              kelasTampilan: kelasTersedia || "Belum terdaftar",
            };
          }

          try {
            const detailKelas = await getKelasSayaDariAnggota(siswaId);

            const namaKelas =
              detailKelas?.nama ||
              detailKelas?.namaKelas ||
              detailKelas?.kelas?.nama ||
              detailKelas?.kelas?.namaKelas ||
              "";

            return {
              ...item,
              kelasTampilan: namaKelas || "Belum terdaftar",
            };
          } catch (err) {
            console.warn(`Gagal mengambil kelas siswa ${siswaId}:`, err);

            return {
              ...item,
              kelasTampilan: "Belum tersedia",
            };
          }
        })
      );

      setSiswa(daftarDenganKelas);

      if (daftarDenganKelas.length === 0) {
        setError(
          "Data siswa belum ditemukan. Periksa respons GET /api/siswa pada tab Network."
        );
      }
    } catch (err) {
      setSiswa([]);
      setError(
        err?.message ||
          "Gagal mengambil data siswa. Periksa koneksi Backend dan endpoint GET /api/siswa."
      );
    } finally {
      setLoading(false);
      setMemuatUlang(false);
    }
  }, []);

  /* =====================================================
     ACCESS CHECK
  ===================================================== */

  useEffect(() => {
    try {
      const user = getStoredUser() || {};
      const token = getToken();

      const role = String(
        user?.role ||
          user?.peran?.nama ||
          user?.namaPeran ||
          ""
      )
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");

      setRoleDiizinkan(
        Boolean(token) &&
          ["admin_sekolah", "super_admin", "superadmin"].includes(role)
      );
    } catch {
      setRoleDiizinkan(false);
    } finally {
      setSiapPeriksaRole(true);
    }
  }, []);

  useEffect(() => {
    if (siapPeriksaRole && roleDiizinkan) {
      muatSiswa();
    } else if (siapPeriksaRole) {
      setLoading(false);
    }
  }, [siapPeriksaRole, roleDiizinkan, muatSiswa]);

  /* =====================================================
     SEARCH
  ===================================================== */

  const siswaTerfilter = useMemo(() => {
    const keyword = pencarian.trim().toLowerCase();

    if (!keyword) return siswa;

    return siswa.filter((item) => {
      const nama = formatNamaSiswa(item).toLowerCase();
      const identifier = formatIdentifier(item).toLowerCase();
      const email = String(item?.email || "").toLowerCase();
      const kelas = String(
        item?.kelasTampilan || formatKelas(item) || ""
      ).toLowerCase();

      return (
        nama.includes(keyword) ||
        identifier.includes(keyword) ||
        email.includes(keyword) ||
        kelas.includes(keyword)
      );
    });
  }, [siswa, pencarian]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalSudahAtur = siswa.filter(
    (item) => statusPinSiswa(item) === "Sudah diatur"
  ).length;

  const totalBelumAtur = siswa.filter(
    (item) => statusPinSiswa(item) === "Belum diatur"
  ).length;

  const totalBelumDiketahui = siswa.filter(
    (item) => statusPinSiswa(item) === "Belum diketahui"
  ).length;

  /* =====================================================
     RESET PIN
  ===================================================== */

  async function handleResetPin() {
    if (!siswaDipilih?.id && !siswaDipilih?.userId) {
      setError("ID akun siswa tidak ditemukan.");
      return;
    }

    const target = siswaDipilih;
    const userId = target.id || target.userId;

    setError("");
    setSukses("");
    setSedangReset(String(userId));

    try {
      const response = await apiFetch(ENDPOINT_RESET_PIN(userId), {
        method: "POST",
      });

      setSukses(
        pesanResponse(
          response,
          "PIN siswa berhasil direset. Siswa perlu membuat PIN baru saat login berikutnya."
        )
      );

      setSiswaDipilih(null);

      setSiswa((daftar) =>
        daftar.map((item) =>
          String(item.id || item.userId) === String(userId)
            ? {
                ...item,
                pinConfigured: false,
                sudahAturPin: false,
                hasPin: false,
                memilikiPin: false,
              }
            : item
        )
      );

      await muatSiswa(true);
    } catch (err) {
      setError(
        err?.message ||
          "Reset PIN gagal. Pastikan token masih valid dan akun memiliki akses admin."
      );
    } finally {
      setSedangReset("");
    }
  }

  /* =====================================================
     LOADING / ACCESS
  ===================================================== */

  if (!siapPeriksaRole) {
    return (
      <div className="theme-page flex min-h-screen items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!roleDiizinkan) {
    return (
      <div className="theme-page flex min-h-screen items-center justify-center px-5">
        <div
          className={`
            theme-card w-full max-w-md rounded-2xl border theme-border
            p-8 text-center ${themeCardShadow}
          `}
        >
          <div
            className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${themePrimarySoft} ${themePrimarySoftBorder}`}
          >
            <ShieldCheck size={22} className="text-[var(--color-primary)]" />
          </div>

          <h1 className="text-xl font-bold theme-text">
            Akses tidak tersedia
          </h1>

          <p className="mt-2 text-sm leading-6 theme-text-secondary">
            Halaman ini hanya ditujukan untuk Admin Sekolah dan Super Admin.
            Silakan login menggunakan akun dengan hak akses yang sesuai.
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN RENDER
  ===================================================== */

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        activeMenu="pengguna"
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((previous) => !previous)}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          title="Pengaturan PIN Siswa"
          onMenuClick={() => setSidebarOpen((previous) => !previous)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8">
            {/* PAGE HEADER */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`
                    flex h-11 w-11 shrink-0 items-center justify-center
                    rounded-xl bg-[var(--color-primary)] text-white
                    shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                  `}
                >
                  <KeyRound size={20} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-bold theme-text sm:text-2xl">
                    Pengaturan PIN Siswa
                  </h1>

                  <p className="mt-1 text-xs theme-text-secondary sm:text-sm">
                    Pantau status PIN dan bantu pemulihan akses akun siswa.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => muatSiswa(true)}
                disabled={loading || memuatUlang}
                className="
                  inline-flex items-center justify-center gap-2
                  rounded-xl border theme-border theme-card
                  px-4 py-2.5 text-sm font-semibold theme-text-secondary
                  transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                  disabled:cursor-not-allowed disabled:opacity-60
                "
              >
                <RefreshCw
                  size={15}
                  className={memuatUlang ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            {/* STATISTICS */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 sm:gap-4">
              <StatCard
                title="Total Siswa"
                value={siswa.length}
                description="Akun siswa yang berhasil dimuat"
                icon={Users}
                iconClass="text-[var(--color-primary)]"
                loading={loading}
              />

              <StatCard
                title="PIN Sudah Diatur"
                value={totalSudahAtur}
                description="Siswa yang sudah membuat PIN"
                icon={CheckCircle2}
                iconClass="theme-success"
                loading={loading}
              />

              <StatCard
                title="PIN Belum Diatur"
                value={totalBelumAtur}
                description="Siswa yang perlu membuat PIN"
                icon={KeyRound}
                iconClass="theme-warning"
                loading={loading}
              />
            </div>

            {/* UNKNOWN STATUS */}

            {totalBelumDiketahui > 0 && (
              <div className="flex items-start gap-3 rounded-xl border theme-border theme-card p-4">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 theme-warning"
                />

                <div>
                  <p className="text-sm font-semibold theme-text">
                    Status PIN belum tersedia
                  </p>

                  <p className="mt-1 text-xs leading-5 theme-text-secondary">
                    {totalBelumDiketahui} siswa belum memiliki informasi status
                    PIN yang dapat dibaca. Pastikan GET /api/siswa mengirim
                    field pinConfigured berdasarkan pinHash, tanpa mengirimkan
                    hash PIN ke frontend.
                  </p>
                </div>
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="flex items-start gap-3 rounded-xl border theme-danger p-4">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />

                <div className="flex-1">
                  <p className="text-sm font-semibold">Terjadi kesalahan</p>
                  <p className="mt-1 text-sm">{error}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Tutup pesan error"
                  className="opacity-70 transition hover:opacity-100"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {/* SUCCESS */}

            {sukses && (
              <div className="flex items-start gap-3 rounded-xl border theme-success p-4">
                <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

                <div className="flex-1 text-sm">{sukses}</div>

                <button
                  type="button"
                  onClick={() => setSukses("")}
                  aria-label="Tutup pesan sukses"
                  className="opacity-70 transition hover:opacity-100"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {/* TABLE SECTION */}

            <section
              className={`theme-card overflow-hidden rounded-2xl border theme-border ${themeCardShadow}`}
            >
              <div className="flex flex-col gap-4 border-b theme-border-soft p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Database
                      size={16}
                      className="text-[var(--color-primary)]"
                    />

                    <h2 className="text-sm font-bold theme-text">
                      Daftar Akun Siswa
                    </h2>
                  </div>

                  <p className="mt-1 text-xs theme-text-muted">
                    Lihat kelas, status PIN, dan reset PIN bila diperlukan.
                  </p>
                </div>

                <div className="relative w-full sm:max-w-sm">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                  />

                  <input
                    type="search"
                    value={pencarian}
                    onChange={(event) => setPencarian(event.target.value)}
                    placeholder="Cari nama, NIS, email, atau kelas..."
                    className="
                      theme-input theme-border theme-text w-full rounded-xl
                      border py-2.5 pl-9 pr-3 text-sm outline-none
                      placeholder:text-[var(--color-text-placeholder)]
                      focus:border-[color-mix(in_srgb,var(--color-primary)_50%,transparent)]
                      focus:ring-2
                      focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                    "
                  />
                </div>
              </div>

              {/* TABLE */}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-[var(--color-primary)] text-white">
                      <th className="w-14 px-4 py-3 text-center font-semibold">
                        No
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Siswa
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        NIS / Username
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Kelas
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Status PIN
                      </th>
                      <th className="px-4 py-3 text-center font-semibold">
                        Tindakan
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr
                          key={index}
                          className="border-b theme-border-soft last:border-0"
                        >
                          {Array.from({ length: 6 }).map((__, cell) => (
                            <td key={cell} className="px-4 py-4">
                              <div className="h-4 animate-pulse rounded bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : siswaTerfilter.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-16 text-center">
                          <div
                            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full border ${themePrimarySoft} ${themePrimarySoftBorder}`}
                          >
                            <Search
                              size={20}
                              className="text-[var(--color-primary)]"
                            />
                          </div>

                          <p className="mt-3 text-sm font-semibold theme-text">
                            Data siswa tidak ditemukan
                          </p>

                          <p className="mt-1 text-xs theme-text-muted">
                            Periksa data Backend atau ubah kata pencarian.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      siswaTerfilter.map((item, index) => {
                        const status = statusPinSiswa(item);
                        const kelas =
                          item.kelasTampilan ||
                          formatKelas(item) ||
                          "Belum tersedia";

                        const idSiswa = item.id || item.userId;

                        return (
                          <tr
                            key={idSiswa || index}
                            className={`border-b theme-border-soft last:border-0 ${themeHover} transition-colors`}
                          >
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder} text-xs font-bold text-[var(--color-primary)]`}
                              >
                                {index + 1}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
                                  <GraduationCap size={18} />
                                </div>

                                <div className="min-w-0">
                                  <p className="max-w-[230px] truncate font-semibold theme-text">
                                    {formatNamaSiswa(item)}
                                  </p>

                                  <p className="mt-0.5 max-w-[230px] truncate text-xs theme-text-muted">
                                    {item.email || "Email belum tersedia"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3 text-xs theme-text-secondary">
                              {formatIdentifier(item)}
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 theme-text-secondary">
                                <GraduationCap
                                  size={15}
                                  className="shrink-0 theme-text-muted"
                                />
                                <span>{kelas}</span>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <PinStatusBadge status={status} />
                            </td>

                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => setSiswaDipilih(item)}
                                disabled={
                                  !idSiswa ||
                                  String(sedangReset) === String(idSiswa)
                                }
                                className="
                                  inline-flex items-center justify-center gap-2
                                  rounded-lg border theme-border theme-card
                                  px-3 py-2 text-xs font-semibold theme-text-secondary
                                  transition
                                  hover:border-[color-mix(in_srgb,var(--color-primary)_35%,transparent)]
                                  hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]
                                  hover:text-[var(--color-primary)]
                                  disabled:cursor-not-allowed disabled:opacity-50
                                "
                              >
                                <RotateCcw size={13} />
                                Reset PIN
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-2 border-t theme-border-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-xs theme-text-secondary">
                  Menampilkan{" "}
                  <span className="font-semibold theme-text">
                    {siswaTerfilter.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold theme-text">
                    {siswa.length}
                  </span>{" "}
                  siswa
                </p>

                <p className="text-xs theme-text-muted">
                  Data mengikuti respons Backend
                </p>
              </div>
            </section>

            {/* SECURITY INFO */}

            <div
              className={`flex items-start gap-3 rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} p-4`}
            >
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-[var(--color-primary)]"
              />

              <div>
                <p className="text-sm font-semibold theme-text">
                  Informasi keamanan
                </p>

                <p className="mt-1 text-xs leading-5 theme-text-secondary">
                  Reset PIN akan menghapus PIN lama siswa. Saat login
                  berikutnya, siswa perlu membuat PIN baru. Halaman ini tidak
                  menampilkan PIN maupun hash PIN.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* RESET CONFIRMATION MODAL */}

      {siswaDipilih && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !sedangReset
            ) {
              setSiswaDipilih(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-pin-title"
            className={`theme-card relative w-full max-w-md overflow-hidden rounded-2xl border theme-border ${themeCardShadow}`}
          >
            <div className="flex items-center justify-between border-b theme-border-soft px-5 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${themePrimarySoft} ${themePrimarySoftBorder}`}
                >
                  <KeyRound
                    size={18}
                    className="text-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <h2
                    id="reset-pin-title"
                    className="text-sm font-bold theme-text"
                  >
                    Reset PIN Siswa
                  </h2>

                  <p className="mt-0.5 text-xs theme-text-muted">
                    Konfirmasi tindakan
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!sedangReset) setSiswaDipilih(null);
                }}
                disabled={Boolean(sedangReset)}
                aria-label="Tutup modal"
                className={`flex h-8 w-8 items-center justify-center rounded-lg theme-text-muted ${themeHover} disabled:opacity-50`}
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3 rounded-xl border theme-border p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
                  <GraduationCap size={18} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold theme-text">
                    {formatNamaSiswa(siswaDipilih)}
                  </p>

                  <p className="mt-0.5 truncate text-xs theme-text-muted">
                    {formatIdentifier(siswaDipilih)}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 theme-text-secondary">
                PIN siswa akan dihapus. Siswa perlu membuat PIN baru saat
                login berikutnya. Apakah kamu yakin ingin melanjutkan?
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t theme-border-soft p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={Boolean(sedangReset)}
                onClick={() => setSiswaDipilih(null)}
                className="
                  rounded-lg border theme-border theme-card
                  px-4 py-2.5 text-sm font-semibold theme-text-secondary
                  transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                  disabled:opacity-50
                "
              >
                Batal
              </button>

              <button
                type="button"
                disabled={Boolean(sedangReset)}
                onClick={handleResetPin}
                className="
                  inline-flex items-center justify-center gap-2
                  rounded-lg bg-[var(--color-primary)] px-4 py-2.5
                  text-sm font-semibold text-white transition
                  hover:brightness-110 disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {sedangReset ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <RotateCcw size={14} />
                    Ya, reset PIN
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}