"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Calendar,
  Clock,
  Search,
  AlertCircle,
  CheckCircle,
  FileText,
  BookOpen,
  FileCheck,
  PenTool,
  ClipboardList,
  Layers,
  RefreshCw,
  GraduationCap,
  Timer,
  CircleCheck,
  CircleDot,
  ArrowUpRight,
} from "lucide-react";

import {
  getKelas,
  getKelasById,
} from "@/services/kelas.service";

import { getKelasMapel } from "@/services/kelasMapel.service";
import { getUjianByKelasMapel } from "@/services/ujian.service";

// =========================================================
// THEME HELPERS
// =========================================================

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

// =========================================================
// JENIS UJIAN
// =========================================================

function getIconByJenis(jenis) {
  const map = {
    UTS: BookOpen,
    UAS: FileCheck,
    Kuis: PenTool,
    Harian: ClipboardList,
    Lainnya: Layers,
  };

  return map[jenis] || Layers;
}

function getThemeByJenis(jenis) {
  const map = {
    UTS: {
      surface: themePrimarySoft,
      border: themePrimarySoftBorder,
      text: themePrimaryText,
    },

    UAS: {
      surface: themeDangerSurface,
      border: themeDangerBorder,
      text: "text-[var(--color-text)]",
    },

    Kuis: {
      surface: themeWarningSurface,
      border: themeWarningBorder,
      text: "text-[var(--color-warning)]",
    },

    Harian: {
      surface: themeSuccessSurface,
      border: themeSuccessBorder,
      text: "text-[var(--color-success)]",
    },

    Lainnya: {
      surface: themeNeutralSurface,
      border: themeNeutralBorder,
      text: "theme-text-secondary",
    },
  };

  return map[jenis] || map.Lainnya;
}

function getStatusUjian(ujian) {
  const now = new Date();

  const waktuMulai = ujian?.waktuMulai
    ? new Date(ujian.waktuMulai)
    : null;

  const waktuSelesai = ujian?.waktuSelesai
    ? new Date(ujian.waktuSelesai)
    : null;

  if (
    waktuMulai &&
    !Number.isNaN(waktuMulai.getTime()) &&
    now < waktuMulai
  ) {
    return "belum";
  }

  if (
    waktuSelesai &&
    !Number.isNaN(waktuSelesai.getTime()) &&
    now > waktuSelesai
  ) {
    return "selesai";
  }

  return "sedang";
}

// =========================================================
// NORMALIZER
// =========================================================

function normalizeArrayResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

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

function normalizeObjectResponse(response) {
  if (!response) {
    return null;
  }

  if (
    typeof response === "object" &&
    !Array.isArray(response) &&
    response.id
  ) {
    return response;
  }

  if (
    response?.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data) &&
    response.data.id
  ) {
    return response.data;
  }

  if (
    response?.data?.data &&
    typeof response.data.data === "object" &&
    !Array.isArray(response.data.data) &&
    response.data.data.id
  ) {
    return response.data.data;
  }

  return null;
}

// =========================================================
// GET USER ID
// =========================================================

function getLoggedInUserId() {
  try {
    const rawUser = localStorage.getItem("user");

    if (!rawUser) {
      return null;
    }

    const user = JSON.parse(rawUser);

    const userId =
      user?.userId ||
      user?.id ||
      user?.penggunaId ||
      user?.siswaId ||
      user?.siswa?.id ||
      user?.data?.userId ||
      user?.data?.id ||
      user?.data?.penggunaId ||
      user?.data?.siswaId ||
      user?.data?.siswa?.id ||
      null;

    return userId ? String(userId) : null;
  } catch (error) {
    console.error("Gagal membaca data user:", error);
    return null;
  }
}

// =========================================================
// CHECK STUDENT MEMBER
// =========================================================

function isStudentMemberOfClass(anggota, userId) {
  if (!anggota || !userId) {
    return false;
  }

  const anggotaUserId =
    anggota?.siswa?.id ||
    anggota?.penggunaId ||
    anggota?.siswaId ||
    anggota?.pengguna?.id ||
    anggota?.userId ||
    anggota?.user?.id ||
    null;

  if (!anggotaUserId) {
    return false;
  }

  return String(anggotaUserId) === String(userId);
}

// =========================================================
// FIND STUDENT CLASS
// =========================================================

async function findStudentClass() {
  const userId = getLoggedInUserId();

  if (!userId) {
    throw new Error(
      "Data siswa yang sedang login tidak ditemukan. Silakan login kembali."
    );
  }

  const kelasResponse = await getKelas({
    page: 1,
    limit: 100,
  });

  console.log("========== PENCARIAN KELAS SISWA ==========");
  console.log("USER ID:", userId);
  console.log("RESPONSE GET KELAS:", kelasResponse);

  const daftarKelas = normalizeArrayResponse(kelasResponse);

  console.log("DAFTAR KELAS:", daftarKelas);
  console.log("JUMLAH KELAS:", daftarKelas.length);

  if (daftarKelas.length === 0) {
    throw new Error(
      "Belum ada data kelas pada sekolah akun siswa."
    );
  }

  const hasilPencarian = await Promise.allSettled(
    daftarKelas.map(async (kelas) => {
      if (!kelas?.id) {
        return null;
      }

      try {
        const response = await getKelasById(
          String(kelas.id)
        );

        const detail = normalizeObjectResponse(response);

        if (!detail?.id) {
          return null;
        }

        const anggota = Array.isArray(detail.anggota)
          ? detail.anggota
          : [];

        console.log(
          `DETAIL KELAS ${detail.nama || detail.id}:`,
          detail
        );

        console.log(
          `ANGGOTA KELAS ${detail.nama || detail.id}:`,
          anggota
        );

        const ditemukan = anggota.some((item) =>
          isStudentMemberOfClass(item, userId)
        );

        if (ditemukan) {
          console.log(
            "KELAS SISWA DITEMUKAN:",
            detail
          );

          return detail;
        }

        return null;
      } catch (error) {
        console.warn(
          `Gagal mengambil detail kelas ${kelas.id}:`,
          error
        );

        return null;
      }
    })
  );

  for (const result of hasilPencarian) {
    if (
      result.status === "fulfilled" &&
      result.value?.id
    ) {
      return result.value;
    }
  }

  throw new Error(
    "Kelas siswa tidak ditemukan. Pastikan siswa sudah dimasukkan ke kelas oleh Admin Sekolah."
  );
}

// =========================================================
// STATUS CONFIG
// =========================================================

const STATUS_CONFIG = {
  semua: {
    label: "Semua",
    icon: Layers,
  },

  belum: {
    label: "Belum Dimulai",
    icon: Clock,
  },

  sedang: {
    label: "Berlangsung",
    icon: CircleDot,
  },

  selesai: {
    label: "Selesai",
    icon: CircleCheck,
  },
};

// =========================================================
// PAGE
// =========================================================

export default function DaftarUjianPage() {
  const router = useRouter();

  const [daftarUjian, setDaftarUjian] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =======================================================
  // LOAD UJIAN
  // =======================================================

  const loadUjian = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // ====================================================
      // 1. CARI KELAS SISWA
      // ====================================================

      const kelasSiswa = await findStudentClass();

      if (!kelasSiswa?.id) {
        throw new Error(
          "Kelas siswa tidak ditemukan."
        );
      }

      const kelasSiswaId = String(kelasSiswa.id);

      console.log(
        "KELAS SISWA:",
        kelasSiswa
      );

      console.log(
        "KELAS SISWA ID:",
        kelasSiswaId
      );

      // ====================================================
      // 2. AMBIL KELAS MAPEL
      // ====================================================

      const kelasMapelResponse =
        await getKelasMapel();

      const semuaKelasMapel =
        normalizeArrayResponse(
          kelasMapelResponse
        );

      console.log(
        "SEMUA KELAS MAPEL:",
        semuaKelasMapel
      );

      // ====================================================
      // 3. FILTER KELAS MAPEL
      // ====================================================

      let kelasMapelData =
        semuaKelasMapel.filter((km) => {
          const kmKelasId =
            km?.kelasId ||
            km?.kelas?.id ||
            null;

          return (
            kmKelasId &&
            String(kmKelasId) ===
              kelasSiswaId
          );
        });

      // ====================================================
      // FALLBACK KELAS MAPEL
      // ====================================================

      if (
        kelasMapelData.length === 0 &&
        Array.isArray(
          kelasSiswa?.kelasMapel
        )
      ) {
        kelasMapelData =
          kelasSiswa.kelasMapel.filter(
            (km) => {
              const kmKelasId =
                km?.kelasId ||
                km?.kelas?.id ||
                null;

              return (
                kmKelasId &&
                String(kmKelasId) ===
                  kelasSiswaId
              );
            }
          );
      }

      console.log(
        "KELAS MAPEL KELAS SISWA:",
        kelasMapelData
      );

      if (kelasMapelData.length === 0) {
        setDaftarUjian([]);

        setError(
          `Belum ada mata pelajaran yang terdaftar untuk kelas ${
            kelasSiswa?.nama ||
            "siswa"
          }`
        );

        return;
      }

      // ====================================================
      // 4. AMBIL UJIAN
      // ====================================================

      const hasilRequest =
        await Promise.allSettled(
          kelasMapelData.map(
            async (km) => {
              if (!km?.id) {
                return [];
              }

              try {
                const response =
                  await getUjianByKelasMapel(
                    String(km.id)
                  );

                const data =
                  normalizeArrayResponse(
                    response
                  );

                console.log(
                  `UJIAN KELAS MAPEL ${km.id}:`,
                  data
                );

                return data
                  .map((ujian) => {
                    if (!ujian?.id) {
                      return null;
                    }

                    return {
                      ...ujian,

                      kelasMapel: {
                        ...(km || {}),

                        ...(ujian?.kelasMapel ||
                          {}),

                        kelas:
                          ujian
                            ?.kelasMapel
                            ?.kelas ||
                          km?.kelas ||
                          kelasSiswa ||
                          null,

                        mataPelajaran:
                          ujian
                            ?.kelasMapel
                            ?.mataPelajaran ||
                          km?.mataPelajaran ||
                          null,

                        guruPengajar:
                          ujian
                            ?.kelasMapel
                            ?.guruPengajar ||
                          km?.guruPengajar ||
                          null,
                      },
                    };
                  })
                  .filter(Boolean);
              } catch (error) {
                console.warn(
                  `Gagal mengambil ujian kelas mapel ${km.id}:`,
                  error
                );

                return [];
              }
            }
          )
        );

      // ====================================================
      // 5. GABUNGKAN HASIL
      // ====================================================

      const hasilUjian = [];

      hasilRequest.forEach(
        (result) => {
          if (
            result.status ===
              "fulfilled" &&
            Array.isArray(
              result.value
            )
          ) {
            hasilUjian.push(
              ...result.value
            );
          }
        }
      );

      console.log(
        "HASIL SEMUA UJIAN:",
        hasilUjian
      );

      // ====================================================
      // 6. FILTER KELAS SISWA
      // ====================================================

      const ujianKelasSiswa =
        hasilUjian.filter(
          (ujian) => {
            const ujianKelasId =
              ujian?.kelasMapel
                ?.kelasId ||
              ujian?.kelasMapel
                ?.kelas?.id ||
              null;

            return (
              ujianKelasId &&
              String(
                ujianKelasId
              ) === kelasSiswaId
            );
          }
        );

      // ====================================================
      // 7. HILANGKAN DUPLIKAT
      // ====================================================

      const uniqueUjian =
        Array.from(
          new Map(
            ujianKelasSiswa
              .filter(
                (item) =>
                  item?.id
              )
              .map((item) => [
                String(item.id),
                item,
              ])
          ).values()
        );

      // ====================================================
      // 8. MAPPING UI
      // ====================================================

      const mapped =
        uniqueUjian.map(
          (ujian) => {
            const kelas =
              ujian
                ?.kelasMapel
                ?.kelas ||
              kelasSiswa ||
              null;

            const mapel =
              ujian
                ?.kelasMapel
                ?.mataPelajaran ||
              null;

            const guru =
              ujian
                ?.kelasMapel
                ?.guruPengajar ||
              null;

            const status =
              getStatusUjian(
                ujian
              );

            return {
              id: ujian.id,

              judul:
                ujian?.judul ||
                "Ujian Tanpa Judul",

              mapel:
                mapel?.nama ||
                "-",

              guru:
                guru?.namaLengkap ||
                "-",

              kelas:
                kelas?.nama ||
                kelasSiswa?.nama ||
                "-",

              tanggal:
                ujian?.waktuMulai ||
                ujian?.dibuatPada ||
                null,

              durasi:
                ujian?.durasi
                  ? `${ujian.durasi} menit`
                  : "0 menit",

              soal:
                ujian?._count
                  ?.soalUjian ||
                ujian?._count
                  ?.soal ||
                0,

              status,

              warna:
                ujian?.jenis ||
                "Lainnya",

              icon:
                getIconByJenis(
                  ujian?.jenis
                ),

              waktuMulai:
                ujian?.waktuMulai ||
                null,

              waktuSelesai:
                ujian?.waktuSelesai ||
                null,

              dipublikasikan:
                Boolean(
                  ujian?.dipublikasikan
                ),

              jenis:
                ujian?.jenis ||
                "Lainnya",
            };
          }
        );

      console.log(
        "UJIAN FINAL UNTUK UI:",
        mapped
      );

      setDaftarUjian(mapped);
    } catch (err) {
      console.error(
        "Gagal memuat ujian siswa:",
        err
      );

      setDaftarUjian([]);

      setError(
        err?.message ||
          "Gagal mengambil data ujian. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =======================================================
  // EFFECT
  // =======================================================

  useEffect(() => {
    loadUjian();
  }, [loadUjian]);

  // =======================================================
  // FILTER
  // =======================================================

  const filtered = useMemo(() => {
    const keyword =
      search.toLowerCase().trim();

    return daftarUjian.filter(
      (ujian) => {
        const judul =
          String(
            ujian?.judul ||
              ""
          ).toLowerCase();

        const mapel =
          String(
            ujian?.mapel ||
              ""
          ).toLowerCase();

        const guru =
          String(
            ujian?.guru ||
              ""
          ).toLowerCase();

        const matchSearch =
          judul.includes(
            keyword
          ) ||
          mapel.includes(
            keyword
          ) ||
          guru.includes(
            keyword
          );

        if (!matchSearch) {
          return false;
        }

        if (
          filterStatus !==
            "semua" &&
          ujian.status !==
            filterStatus
        ) {
          return false;
        }

        return true;
      }
    );
  }, [
    daftarUjian,
    search,
    filterStatus,
  ]);

  // =======================================================
  // STATISTIK
  // =======================================================

  const stats = useMemo(
    () => ({
      total:
        daftarUjian.length,

      belum:
        daftarUjian.filter(
          (u) =>
            u.status ===
            "belum"
        ).length,

      sedang:
        daftarUjian.filter(
          (u) =>
            u.status ===
            "sedang"
        ).length,

      selesai:
        daftarUjian.filter(
          (u) =>
            u.status ===
            "selesai"
        ).length,
    }),
    [daftarUjian]
  );

  // =======================================================
  // FORMAT DATE
  // =======================================================

  const formatDate = (dateStr) => {
    if (!dateStr) {
      return "-";
    }

    const d =
      new Date(dateStr);

    if (
      Number.isNaN(
        d.getTime()
      )
    ) {
      return "-";
    }

    return d.toLocaleDateString(
      "id-ID",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (dateStr) => {
    if (!dateStr) {
      return "-";
    }

    const d =
      new Date(dateStr);

    if (
      Number.isNaN(
        d.getTime()
      )
    ) {
      return "-";
    }

    return d.toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =======================================================
  // CARD CLICK
  // =======================================================

  const handleCardClick = (ujianId) => {
    if (!ujianId) {
      return;
    }

    router.push(
      `/siswa/ujian/${ujianId}`
    );
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10">

        {/* =================================================
            PREMIUM HERO
        ================================================= */}

        <section
          className={`relative overflow-hidden rounded-[24px] ${themePrimaryGradient} ${themePrimaryShadow}`}
        >
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)] blur-2xl" />

          <div className="absolute -bottom-32 right-32 h-64 w-64 rounded-full bg-[color-mix(in_srgb,var(--color-card)_9%,transparent)] blur-3xl" />

          <div className="absolute left-1/3 top-0 h-full w-px bg-[color-mix(in_srgb,var(--color-card)_5%,transparent)]" />

          <div className="absolute right-1/4 top-0 h-full w-px bg-[color-mix(in_srgb,var(--color-card)_5%,transparent)]" />

          <div className="relative p-6 sm:p-8 lg:p-9">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">

              <div className="min-w-0 max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-card)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)] px-3 py-1.5 text-xs font-medium text-[var(--color-card)] backdrop-blur-sm">
                  <GraduationCap size={14} />

                  <span>
                    AKADEMIK SISWA
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-[var(--color-card)] sm:text-3xl lg:text-[34px]">
                  Daftar Ujian
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[color-mix(in_srgb,var(--color-card)_78%,transparent)] sm:text-[15px]">
                  Kelola dan ikuti seluruh ujian yang
                  tersedia untuk kelas kamu dalam satu
                  tempat.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <HeroStat
                  value={stats.total}
                  label="Total"
                />

                <HeroStat
                  value={stats.sedang}
                  label="Berlangsung"
                  highlight
                />

                <HeroStat
                  value={stats.selesai}
                  label="Selesai"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <section
          className={`theme-card theme-border ${themeCardShadow} rounded-2xl p-4 sm:p-5`}
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            {/* SEARCH */}

            <div className="relative w-full xl:max-w-md">
              <Search
                size={18}
                className="theme-text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Cari ujian, mata pelajaran, atau guru..."
                className={`theme-input ${themeFocus} h-11 w-full rounded-xl pl-10 pr-4 text-sm outline-none transition`}
              />
            </div>

            {/* STATUS FILTER */}

            <div
              className={`flex min-w-0 overflow-x-auto rounded-xl ${themeNeutralSurface} p-1`}
            >
              {Object.entries(
                STATUS_CONFIG
              ).map(
                ([
                  key,
                  config,
                ]) => {
                  const Icon =
                    config.icon;

                  const count =
                    key ===
                    "semua"
                      ? stats.total
                      : stats[key];

                  const active =
                    filterStatus ===
                    key;

                  return (
                    <button
                      key={key}
                      onClick={() =>
                        setFilterStatus(
                          key
                        )
                      }
                      className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:px-3.5 ${
                        active
                          ? "bg-[var(--color-card)] text-[var(--color-primary)] shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_8%,transparent)]"
                          : "theme-text-muted hover:text-[var(--color-text)]"
                      }`}
                    >
                      <Icon size={14} />

                      <span>
                        {
                          config.label
                        }
                      </span>

                      <span
                        className={`ml-0.5 rounded-md px-1.5 py-0.5 text-[10px] ${
                          active
                            ? themePrimarySoft +
                              " " +
                              themePrimaryText
                            : themeNeutralSurface +
                              " theme-text-muted"
                        }`}
                      >
                        {
                          count
                        }
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            {/* REFRESH */}

            <button
              onClick={
                loadUjian
              }
              disabled={loading}
              className={`theme-card theme-border theme-text-secondary ${themeNeutralHover} flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition hover:border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <RefreshCw
                size={16}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>
          </div>

          <div
            className={`mt-4 flex flex-wrap items-center justify-between gap-2 border-t ${themeDivider} pt-4`}
          >
            <p className="theme-text-muted text-xs">
              Menampilkan{" "}
              <span className="theme-text font-semibold">
                {
                  filtered.length
                }
              </span>{" "}
              dari{" "}
              <span className="theme-text font-semibold">
                {
                  daftarUjian.length
                }
              </span>{" "}
              ujian
            </p>

            {search && (
              <button
                onClick={() =>
                  setSearch("")
                }
                className="theme-primary-text text-xs font-medium hover:opacity-80"
              >
                Reset pencarian
              </button>
            )}
          </div>
        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            error={error}
            onRetry={loadUjian}
          />
        ) : filtered.length ===
          0 ? (
          <EmptyState
            search={search}
            onReset={() => {
              setSearch("");
              setFilterStatus(
                "semua"
              );
            }}
          />
        ) : (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="theme-text text-base font-bold">
                  Ujian Tersedia
                </h2>

                <p className="theme-text-muted mt-0.5 text-xs">
                  Pilih ujian untuk melihat
                  detail dan instruksi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filtered.map(
                (ujian) => {
                  const jenisTheme =
                    getThemeByJenis(
                      ujian.jenis
                    );

                  const statusBadge =
                    getStatusBadge(
                      ujian.status
                    );

                  const IconComponent =
                    ujian.icon;

                  const isSelesai =
                    ujian.status ===
                    "selesai";

                  const isSedang =
                    ujian.status ===
                    "sedang";

                  return (
                    <article
                      key={
                        ujian.id
                      }
                      onClick={() =>
                        handleCardClick(
                          ujian.id
                        )
                      }
                      className={`group relative flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow} transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)] hover:shadow-[0_14px_32px_color-mix(in_srgb,var(--color-text)_10%,transparent)]`}
                    >
                      {/* TOP ACCENT */}

                      <div
                        className={`h-1 w-full ${themePrimaryGradient}`}
                      />

                      <div className="p-5 pb-4">
                        <div className="flex items-start justify-between gap-3">

                          {/* ICON */}

                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${jenisTheme.surface} ${jenisTheme.text}`}
                          >
                            <IconComponent
                              size={21}
                            />
                          </div>

                          {/* STATUS */}

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold ${statusBadge.surface} ${statusBadge.border} ${statusBadge.text}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`}
                            />

                            {
                              statusBadge.label
                            }
                          </span>
                        </div>

                        <div className="mt-4">
                          <p
                            className={`text-[11px] font-bold uppercase tracking-[0.08em] ${jenisTheme.text}`}
                          >
                            {
                              ujian.jenis
                            }
                          </p>

                          <h3 className="theme-text mt-1.5 line-clamp-2 min-h-[42px] text-[15px] font-bold leading-5 transition-colors group-hover:text-[var(--color-primary)]">
                            {
                              ujian.judul
                            }
                          </h3>
                        </div>

                        <div className="mt-3 flex min-w-0 items-center gap-2">
                          <BookOpen
                            size={14}
                            className="theme-text-placeholder shrink-0"
                          />

                          <span className="theme-text-secondary truncate text-xs font-semibold">
                            {
                              ujian.mapel
                            }
                          </span>
                        </div>

                        <p className="theme-text-muted mt-1 truncate pl-5 text-[11px]">
                          {
                            ujian.guru
                          }
                        </p>
                      </div>

                      {/* DIVIDER */}

                      <div
                        className={`mx-5 border-t ${themeDivider}`}
                      />

                      {/* INFO */}

                      <div className="grid grid-cols-2 gap-2 p-5">
                        <InfoItem
                          icon={
                            Calendar
                          }
                          label="Tanggal"
                          value={formatDate(
                            ujian.tanggal
                          )}
                        />

                        <InfoItem
                          icon={
                            Clock
                          }
                          label="Waktu"
                          value={formatTime(
                            ujian.waktuMulai
                          )}
                        />

                        <InfoItem
                          icon={
                            Timer
                          }
                          label="Durasi"
                          value={
                            ujian.durasi
                          }
                        />

                        <InfoItem
                          icon={
                            FileText
                          }
                          label="Soal"
                          value={`${ujian.soal} soal`}
                        />
                      </div>

                      {/* KELAS */}

                      <div
                        className={`mx-5 rounded-xl ${themeNeutralSurface} px-3.5 py-3`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="theme-text-muted text-[10px] font-medium uppercase tracking-wide">
                              Kelas
                            </p>

                            <p className="theme-text-secondary mt-0.5 truncate text-xs font-semibold">
                              {
                                ujian.kelas
                              }
                            </p>
                          </div>

                          <div
                            className={`theme-card theme-text-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themeCardShadow}`}
                          >
                            <GraduationCap
                              size={15}
                            />
                          </div>
                        </div>
                      </div>

                      {/* ACTION */}

                      <div className="mt-auto p-5 pt-4">
                        <button
                          onClick={(
                            e
                          ) => {
                            e.stopPropagation();

                            handleCardClick(
                              ujian.id
                            );
                          }}
                          className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all active:scale-[0.98] ${
                            isSelesai
                              ? `${themeSuccessBorder} ${themeSuccessSurface} text-[var(--color-success)] hover:brightness-95`
                              : isSedang
                              ? `${themeWarningBorder} ${themeWarningSurface} text-[var(--color-warning)] hover:brightness-95`
                              : `${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} hover:brightness-95`
                          }`}
                        >
                          <span>
                            {isSelesai
                              ? "Lihat Hasil"
                              : isSedang
                              ? "Mulai Ujian"
                              : "Lihat Detail"}
                          </span>

                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-lg ${themeNeutralSurface}`}
                          >
                            <ArrowUpRight
                              size={14}
                            />
                          </span>
                        </button>
                      </div>

                      {/* BOTTOM ACCENT */}

                      <div
                        className={`absolute bottom-0 left-0 h-0.5 w-0 ${themePrimaryGradient} transition-all duration-300 group-hover:w-full`}
                      />
                    </article>
                  );
                }
              )}
            </div>
          </section>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          className={`border-t ${themeDivider} py-5`}
        >
          <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
            <p className="theme-text-muted text-[11px]">
              © 2026 SmartSchool. Daftar Ujian Siswa.
            </p>

            <p className="theme-text-muted text-[11px]">
              Sistem Informasi Akademik
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// =========================================================
// HERO STAT
// =========================================================

function HeroStat({
  value,
  label,
  highlight = false,
}) {
  return (
    <div className="min-w-[92px] rounded-xl border border-[color-mix(in_srgb,var(--color-card)_14%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-4 py-3 backdrop-blur-md">
      <div
        className={`text-xl font-bold ${
          highlight
            ? "text-[var(--color-warning)]"
            : "text-[var(--color-card)]"
        }`}
      >
        {value}
      </div>

      <div className="mt-0.5 text-[10px] font-medium text-[color-mix(in_srgb,var(--color-card)_75%,transparent)]">
        {label}
      </div>
    </div>
  );
}

// =========================================================
// INFO ITEM
// =========================================================

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className={`min-w-0 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-2.5`}
    >
      <div className="flex items-center gap-1.5">
        <Icon
          size={12}
          className="theme-text-placeholder shrink-0"
        />

        <span className="theme-text-muted text-[9px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="theme-text-secondary mt-1 truncate text-[11px] font-semibold">
        {value}
      </p>
    </div>
  );
}

// =========================================================
// STATUS BADGE
// =========================================================

function getStatusBadge(status) {
  const map = {
    belum: {
      label: "Belum Dimulai",
      surface: themeNeutralSurface,
      border: themeNeutralBorder,
      text: "theme-text-secondary",
      dot: "bg-[var(--color-text-muted)]",
      icon: Clock,
    },

    sedang: {
      label: "Berlangsung",
      surface: themeWarningSurface,
      border: themeWarningBorder,
      text: "text-[var(--color-warning)]",
      dot: "bg-[var(--color-warning)]",
      icon: AlertCircle,
    },

    selesai: {
      label: "Selesai",
      surface: themeSuccessSurface,
      border: themeSuccessBorder,
      text: "text-[var(--color-success)]",
      dot: "bg-[var(--color-success)]",
      icon: CheckCircle,
    },
  };

  return (
    map[status] ||
    map.belum
  );
}

// =========================================================
// LOADING
// =========================================================

function LoadingState() {
  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({
        length: 8,
      }).map((_, index) => (
        <div
          key={index}
          className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder}`}
        >
          <div
            className={`h-1 ${themeNeutralSurface}`}
          />

          <div className="animate-pulse p-5">
            <div className="flex justify-between">
              <div
                className={`h-11 w-11 rounded-xl ${themeNeutralSurface}`}
              />

              <div
                className={`h-7 w-24 rounded-full ${themeNeutralSurface}`}
              />
            </div>

            <div
              className={`mt-5 h-3 w-16 rounded ${themeNeutralSurface}`}
            />

            <div
              className={`mt-2 h-4 w-4/5 rounded ${themeNeutralSurface}`}
            />

            <div
              className={`mt-2 h-4 w-3/5 rounded ${themeNeutralSurface}`}
            />

            <div className="mt-5 grid grid-cols-2 gap-2">
              <div
                className={`h-12 rounded-xl ${themeNeutralSurface}`}
              />

              <div
                className={`h-12 rounded-xl ${themeNeutralSurface}`}
              />

              <div
                className={`h-12 rounded-xl ${themeNeutralSurface}`}
              />

              <div
                className={`h-12 rounded-xl ${themeNeutralSurface}`}
              />
            </div>

            <div
              className={`mt-3 h-12 rounded-xl ${themeNeutralSurface}`}
            />

            <div
              className={`mt-4 h-10 rounded-xl ${themeNeutralSurface}`}
            />
          </div>
        </div>
      ))}
    </section>
  );
}

// =========================================================
// ERROR
// =========================================================

function ErrorState({
  error,
  onRetry,
}) {
  return (
    <section
      className={`theme-card rounded-2xl border ${themeDangerBorder} p-8 ${themeCardShadow} sm:p-12`}
    >
      <div className="mx-auto max-w-lg text-center">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${themeDangerSurface} theme-text`}
        >
          <AlertCircle size={28} />
        </div>

        <h3 className="theme-text mt-5 text-base font-bold">
          Data ujian belum dapat dimuat
        </h3>

        <p className="theme-text-muted mt-2 text-sm leading-6">
          {error}
        </p>

        <button
          onClick={onRetry}
          className={`mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition hover:brightness-95 active:scale-[0.98]`}
        >
          <RefreshCw size={15} />
          Coba Lagi
        </button>
      </div>
    </section>
  );
}

// =========================================================
// EMPTY
// =========================================================

function EmptyState({
  search,
  onReset,
}) {
  return (
    <section
      className={`theme-card rounded-2xl border ${themeNeutralBorder} px-6 py-16 text-center ${themeCardShadow}`}
    >
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${themePrimarySoft} ${themePrimaryText}`}
      >
        {search ? (
          <Search size={27} />
        ) : (
          <FileCheck size={27} />
        )}
      </div>

      <h3 className="theme-text mt-5 text-base font-bold">
        {search
          ? "Ujian tidak ditemukan"
          : "Belum ada ujian tersedia"}
      </h3>

      <p className="theme-text-muted mx-auto mt-2 max-w-md text-sm leading-6">
        {search
          ? "Tidak ada ujian yang sesuai dengan pencarian atau filter yang dipilih."
          : "Belum terdapat ujian yang tersedia untuk kelas kamu saat ini."}
      </p>

      {search && (
        <button
          onClick={onReset}
          className={`mt-5 rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} px-4 py-2.5 text-xs font-semibold transition hover:brightness-95`}
        >
          Reset Filter
        </button>
      )}
    </section>
  );
}