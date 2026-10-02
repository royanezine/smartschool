"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getKelas, getKelasById } from "../../../../services/kelas.service";

import {
  AlertCircle,
  ArrowLeft,
  Bell,
  BookOpen,
  Calculator,
  ChevronRight,
  ClipboardList,
  FileText,
  FlaskConical,
  GraduationCap,
  Languages,
  RefreshCw,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySurface =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySurfaceStrong =
  "bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryHoverBorder =
  "hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryBg =
  "bg-[var(--color-primary)]";

const themePrimaryHoverText =
  "hover:text-[var(--color-primary)]";

const themePrimaryHoverSurface =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeHoverShadow =
  "hover:shadow-[0_8px_22px_color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralSurfaceStrong =
  "bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeNeutralHoverBorder =
  "hover:border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeDivide =
  "divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoSurfaceStrong =
  "bg-[color-mix(in_srgb,var(--color-info)_13%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeInfoText =
  "text-[var(--color-info)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeSuccessText =
  "text-[var(--color-success)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeWarningText =
  "text-[var(--color-warning)]";

const themeCardSurface =
  "theme-card";

const themeText =
  "theme-text";

const themeTextSecondary =
  "theme-text-secondary";

const themeTextMuted =
  "theme-text-muted";

const themeTextPlaceholder =
  "theme-text-placeholder";

// ============================================================
// ICON MAP
// ============================================================

const iconMap = {
  matematika: Calculator,

  biologi: FlaskConical,
  ipa: FlaskConical,
  fisika: FlaskConical,
  kimia: FlaskConical,

  ekonomi: BookOpen,
  ips: BookOpen,

  "bahasa indonesia": Languages,
  bindo: Languages,

  "bahasa inggris": Languages,
  inggris: Languages,
};

// ============================================================
// HELPER
// ============================================================

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

// ============================================================
// EXTRACT ARRAY
// ============================================================

function extractArray(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  if (Array.isArray(result?.data?.data)) {
    return result.data.data;
  }

  if (Array.isArray(result?.data?.list)) {
    return result.data.list;
  }

  if (Array.isArray(result?.list)) {
    return result.list;
  }

  return [];
}

// ============================================================
// EXTRACT OBJECT
// ============================================================

function extractObject(result) {
  if (!result) {
    return null;
  }

  if (
    result?.data &&
    !Array.isArray(result.data) &&
    typeof result.data === "object"
  ) {
    if (
      result.data.data &&
      !Array.isArray(result.data.data) &&
      typeof result.data.data === "object"
    ) {
      return result.data.data;
    }

    return result.data;
  }

  if (
    result?.data?.data &&
    !Array.isArray(result.data.data) &&
    typeof result.data.data === "object"
  ) {
    return result.data.data;
  }

  if (
    typeof result === "object" &&
    !Array.isArray(result)
  ) {
    return result;
  }

  return null;
}

// ============================================================
// GET CURRENT USER
// ============================================================

function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawUser = localStorage.getItem("user");

    if (!rawUser) {
      return null;
    }

    return JSON.parse(rawUser);
  } catch (error) {
    console.error(
      "[MATA PELAJARAN] Gagal membaca user:",
      error
    );

    return null;
  }
}

// ============================================================
// GET TOKEN
// ============================================================

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken")
  );
}

// ============================================================
// GET HEADERS
// ============================================================

function getHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    Accept: "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

// ============================================================
// GET USER ID
// ============================================================

function getUserId(user) {
  if (!user) {
    return null;
  }

  return (
    user?.userId ??
    user?.id ??
    user?.siswaId ??
    user?.siswa?.id ??
    user?.data?.userId ??
    user?.data?.id ??
    user?.data?.siswaId ??
    user?.data?.siswa?.id ??
    null
  );
}

// ============================================================
// GET USER KELAS ID
// ============================================================

function getUserKelasId(user) {
  if (!user) {
    return null;
  }

  return (
    user?.kelasId ??
    user?.kelas_id ??
    user?.kelas?.id ??
    user?.siswa?.kelasId ??
    user?.siswa?.kelas?.id ??
    user?.data?.kelasId ??
    user?.data?.kelas?.id ??
    null
  );
}

// ============================================================
// PAGE
// ============================================================

export default function MataPelajaranPage() {
  const router = useRouter();

  const [mataPelajaranList, setMataPelajaranList] =
    useState([]);

  const [selectedId, setSelectedId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [currentUser, setCurrentUser] =
    useState(null);

  const [userLoaded, setUserLoaded] =
    useState(false);

  const [kelasSiswa, setKelasSiswa] =
    useState(null);

  const [notifications, setNotifications] =
    useState([]);

  const [notificationLoading, setNotificationLoading] =
    useState(true);

  // ==========================================================
  // FIND KELAS SISWA
  // ==========================================================

  const findKelasSiswa = useCallback(
    async (user) => {
      const userId = getUserId(user);

      if (!userId) {
        throw new Error(
          "ID siswa tidak ditemukan. Silakan login kembali."
        );
      }

      console.log(
        "======================================"
      );

      console.log(
        "[MATA PELAJARAN] USER ID:",
        userId
      );

      console.log(
        "[MATA PELAJARAN] USER KELAS ID:",
        getUserKelasId(user)
      );

      console.log(
        "======================================"
      );

      const explicitKelasId =
        getUserKelasId(user);

      if (explicitKelasId) {
        try {
          console.log(
            "[MATA PELAJARAN] Mengambil kelas langsung:",
            explicitKelasId
          );

          const result =
            await getKelasById(
              explicitKelasId
            );

          const detail =
            extractObject(result);

          if (detail) {
            console.log(
              "[MATA PELAJARAN] Kelas ditemukan langsung:",
              detail
            );

            return detail;
          }
        } catch (error) {
          console.warn(
            "[MATA PELAJARAN] Gagal mengambil kelas langsung:",
            error
          );
        }
      }

      console.log(
        "[MATA PELAJARAN] kelasId tidak tersedia."
      );

      console.log(
        "[MATA PELAJARAN] Mencari kelas berdasarkan anggota.siswa.id..."
      );

      const kelasResult =
        await getKelas({
          page: 1,
          limit: 100,
          sortBy: "tingkat",
          sortOrder: "asc",
        });

      console.log(
        "[MATA PELAJARAN] RESPONSE GET KELAS:",
        kelasResult
      );

      const kelasList =
        extractArray(kelasResult);

      if (!kelasList.length) {
        throw new Error(
          "Data kelas belum tersedia untuk sekolah ini."
        );
      }

      console.log(
        "[MATA PELAJARAN] JUMLAH KELAS:",
        kelasList.length
      );

      const detailKelasList =
        await Promise.all(
          kelasList.map(
            async (kelas) => {
              if (!kelas?.id) {
                return null;
              }

              try {
                const result =
                  await getKelasById(
                    kelas.id
                  );

                return extractObject(
                  result
                );
              } catch (error) {
                console.warn(
                  `[MATA PELAJARAN] Gagal mengambil detail kelas ${kelas.id}:`,
                  error
                );

                return null;
              }
            }
          )
        );

      const foundKelas =
        detailKelasList.find(
          (kelas) => {
            if (!kelas) {
              return false;
            }

            const anggota =
              Array.isArray(
                kelas.anggota
              )
                ? kelas.anggota
                : [];

            return anggota.some(
              (anggotaItem) => {
                const siswaId =
                  anggotaItem?.siswa
                    ?.id ??
                  anggotaItem?.siswaId ??
                  null;

                return (
                  siswaId &&
                  String(
                    siswaId
                  ) ===
                    String(
                      userId
                    )
                );
              }
            );
          }
        );

      console.log(
        "[MATA PELAJARAN] KELAS SISWA:",
        foundKelas
      );

      if (!foundKelas) {
        throw new Error(
          "Kelas siswa belum ditemukan. Pastikan siswa sudah dimasukkan ke dalam kelas."
        );
      }

      return foundKelas;
    },
    []
  );

  // ==========================================================
  // FETCH NOTIFICATIONS
  // ==========================================================

  const fetchNotifications =
    useCallback(async () => {
      try {
        setNotificationLoading(true);

        const token = getToken();

        if (!token) {
          setNotifications([]);
          return;
        }

        const response =
          await fetch(
            `${API_URL}/api/notifikasi`,
            {
              method: "GET",
              headers: getHeaders(),
              cache: "no-store",
            }
          );

        let result = null;

        try {
          result =
            await response.json();
        } catch {
          result = null;
        }

        if (!response.ok) {
          console.error(
            "[MATA PELAJARAN] Gagal mengambil notifikasi:",
            result
          );

          setNotifications([]);
          return;
        }

        const list =
          result?.data?.list ||
          result?.data?.data ||
          result?.data ||
          result?.list ||
          [];

        setNotifications(
          Array.isArray(list)
            ? list.slice(0, 5)
            : []
        );
      } catch (error) {
        console.error(
          "[MATA PELAJARAN] Error notifikasi:",
          error
        );

        setNotifications([]);
      } finally {
        setNotificationLoading(false);
      }
    }, []);

  // ==========================================================
  // AUTO REFRESH NOTIFICATION
  // ==========================================================

  useEffect(() => {
    fetchNotifications();

    const interval =
      setInterval(() => {
        fetchNotifications();
      }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  // ==========================================================
  // FETCH TUGAS
  // ==========================================================

  const fetchJumlahTugas =
    useCallback(
      async (kelasMapelId) => {
        try {
          if (!kelasMapelId) {
            return 0;
          }

          const response =
            await fetch(
              `${API_URL}/api/tugas/kelas-mapel/${kelasMapelId}`,
              {
                method: "GET",
                headers: getHeaders(),
                cache: "no-store",
              }
            );

          let result = null;

          try {
            result =
              await response.json();
          } catch {
            result = null;
          }

          if (!response.ok) {
            console.error(
              `[MATA PELAJARAN] Gagal fetch tugas ${kelasMapelId}:`,
              result
            );

            return 0;
          }

          const tugasData =
            extractArray(result);

          return tugasData.length;
        } catch (error) {
          console.error(
            `[MATA PELAJARAN] Gagal fetch tugas ${kelasMapelId}:`,
            error
          );

          return 0;
        }
      },
      []
    );

  // ==========================================================
  // FETCH JUMLAH TUGAS SEMUA MAPEL
  // ==========================================================

  const fetchJumlahTugasSemuaMapel =
    useCallback(
      async (data) => {
        if (
          !Array.isArray(data) ||
          data.length === 0
        ) {
          return [];
        }

        return Promise.all(
          data.map(
            async (item) => {
              const jumlahTugas =
                await fetchJumlahTugas(
                  item?.id
                );

              return {
                ...item,
                jumlahTugas,
              };
            }
          )
        );
      },
      [fetchJumlahTugas]
    );

  // ==========================================================
  // FETCH MATERI
  // ==========================================================

  const fetchSemuaMateri =
    useCallback(async () => {
      try {
        const response =
          await fetch(
            `${API_URL}/api/materi-pembelajaran`,
            {
              method: "GET",
              headers: getHeaders(),
              cache: "no-store",
            }
          );

        let result = null;

        try {
          result =
            await response.json();
        } catch {
          result = null;
        }

        if (!response.ok) {
          console.error(
            "[MATA PELAJARAN] Gagal fetch materi:",
            result
          );

          return [];
        }

        return extractArray(
          result
        );
      } catch (error) {
        console.error(
          "[MATA PELAJARAN] Error fetch materi:",
          error
        );

        return [];
      }
    }, []);

  // ==========================================================
  // FETCH MATA PELAJARAN
  // ==========================================================

  const fetchMataPelajaran =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          setError(
            "Token login tidak ditemukan. Silakan login kembali."
          );

          setMataPelajaranList([]);
          setKelasSiswa(null);

          return;
        }

        const user =
          currentUser ||
          getCurrentUser();

        if (!user) {
          throw new Error(
            "Data siswa tidak ditemukan. Silakan login kembali."
          );
        }

        const kelas =
          await findKelasSiswa(
            user
          );

        setKelasSiswa(kelas);

        console.log(
          "======================================"
        );

        console.log(
          "[MATA PELAJARAN] KELAS AKTIF SISWA:",
          kelas?.id
        );

        console.log(
          "[MATA PELAJARAN] NAMA KELAS:",
          kelas?.nama
        );

        console.log(
          "[MATA PELAJARAN] KELAS MAPEL:",
          kelas?.kelasMapel
        );

        console.log(
          "======================================"
        );

        const dataKelasSiswa =
          Array.isArray(
            kelas?.kelasMapel
          )
            ? kelas.kelasMapel.filter(
                (item) =>
                  item?.dihapusPada == null
              )
            : [];

        if (
          dataKelasSiswa.length === 0
        ) {
          setMataPelajaranList([]);

          console.warn(
            "[MATA PELAJARAN] Kelas siswa belum memiliki kelasMapel."
          );

          return;
        }

        const [
          materiData,
          dataDenganTugas,
        ] = await Promise.all([
          fetchSemuaMateri(),
          fetchJumlahTugasSemuaMapel(
            dataKelasSiswa
          ),
        ]);

        const normalized =
          dataDenganTugas.map(
            (item, index) => {
              const kelasMapelId =
                item?.id || null;

              const namaMapel =
                item?.mataPelajaran
                  ?.nama ||
                item?.mataPelajaran
                  ?.namaMapel ||
                item?.mataPelajaran
                  ?.namaMataPelajaran ||
                item?.mataPelajaran
                  ?.nama_mata_pelajaran ||
                item?.namaMataPelajaran ||
                "Mata Pelajaran";

              const guru =
                item?.guruPengajar
                  ?.namaLengkap ||
                item?.guru
                  ?.namaLengkap ||
                item?.guruNama ||
                "Guru";

              const kelasNama =
                kelas?.nama ||
                item?.kelas?.nama ||
                item?.kelas?.namaKelas ||
                item?.kelasNama ||
                "Kelas";

              const Icon =
                iconMap[
                  normalizeText(
                    namaMapel
                  )
                ] || BookOpen;

              const jumlahMateri =
                materiData.filter(
                  (materi) => {
                    const materiKelasMapelId =
                      materi?.kelasMapelId ??
                      materi?.kelas_mapel_id ??
                      materi?.kelasMapel
                        ?.id ??
                      null;

                    return (
                      String(
                        materiKelasMapelId
                      ) ===
                      String(
                        kelasMapelId
                      )
                    );
                  }
                ).length;

              return {
                kelasMapelId,

                mataPelajaranId:
                  item
                    ?.mataPelajaran
                    ?.id ||
                  item?.mataPelajaranId ||
                  null,

                nama: namaMapel,

                guru,

                kelas: kelasNama,

                icon: Icon,

                materi:
                  jumlahMateri,

                tugas:
                  Number(
                    item?.jumlahTugas
                  ) || 0,

                ujian: 0,

                color:
                  index %
                    3,
              };
            }
          );

        setMataPelajaranList(
          normalized
        );

        setSelectedId(null);
      } catch (err) {
        console.error(
          "[MATA PELAJARAN] Fetch error:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil mata pelajaran."
        );

        setMataPelajaranList([]);
        setKelasSiswa(null);
      } finally {
        setLoading(false);
      }
    }, [
      currentUser,
      findKelasSiswa,
      fetchSemuaMateri,
      fetchJumlahTugasSemuaMapel,
    ]);

  // ==========================================================
  // LOAD USER
  // ==========================================================

  useEffect(() => {
    const user =
      getCurrentUser();

    setCurrentUser(user);
    setUserLoaded(true);
  }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    if (
      userLoaded &&
      currentUser
    ) {
      fetchMataPelajaran();
    }

    if (
      userLoaded &&
      !currentUser
    ) {
      setLoading(false);

      setError(
        "Data siswa tidak ditemukan. Silakan login kembali."
      );
    }
  }, [
    userLoaded,
    currentUser,
    fetchMataPelajaran,
  ]);

  // ==========================================================
  // SELECTED MAPEL
  // ==========================================================

  const selected =
    useMemo(
      () =>
        mataPelajaranList.find(
          (item) =>
            item.kelasMapelId ===
            selectedId
        ),
      [
        mataPelajaranList,
        selectedId,
      ]
    );

  // ==========================================================
  // TOTAL
  // ==========================================================

  const totalMateri =
    useMemo(
      () =>
        mataPelajaranList.reduce(
          (total, item) =>
            total +
            Number(
              item.materi || 0
            ),
          0
        ),
      [mataPelajaranList]
    );

  const totalTugas =
    useMemo(
      () =>
        mataPelajaranList.reduce(
          (total, item) =>
            total +
            Number(
              item.tugas || 0
            ),
          0
        ),
      [mataPelajaranList]
    );

  // ==========================================================
  // GO TO SECTION
  // ==========================================================

  const goTo = (section) => {
    if (
      !selected ||
      !selected.kelasMapelId
    ) {
      return;
    }

    const url =
      `/siswa/mataPelajaran/${section}` +
      `?kelasMapelId=${encodeURIComponent(
        selected.kelasMapelId
      )}` +
      `&mapel=${encodeURIComponent(
        normalizeText(
          selected.nama
        )
      )}`;

    router.push(url);
  };

  // ==========================================================
  // BACK
  // ==========================================================

  const backToList = () => {
    setSelectedId(null);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="theme-page theme-text min-h-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="animate-pulse">
            <div
              className={`h-4 w-28 rounded mb-3 ${themeNeutralSurface}`}
            />

            <div
              className={`h-8 w-64 rounded mb-2 ${themeNeutralSurface}`}
            />

            <div
              className={`h-4 w-80 max-w-full rounded mb-8 ${themeNeutralSurface}`}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className={`h-24 rounded-2xl ${themeCardSurface} ${themeNeutralBorder}`}
                  />
                )
              )}
            </div>

            <div
              className={`${themeCardSurface} ${themeNeutralBorder} rounded-2xl p-5`}
            >
              <div
                className={`h-5 w-40 rounded mb-5 ${themeNeutralSurface}`}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(
                  (item) => (
                    <div
                      key={item}
                      className={`h-48 rounded-2xl ${themeNeutralSurface}`}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* PAGE TITLE */}

        <div className="flex items-start gap-3 mb-7">
          {selected && (
            <button
              type="button"
              onClick={backToList}
              className={`
                mt-1
                w-10 h-10
                flex items-center justify-center
                rounded-xl
                ${themeCardSurface}
                ${themeNeutralBorder}
                ${themeTextSecondary}
                ${themePrimaryHoverText}
                ${themePrimaryHoverBorder}
                ${themePrimaryHoverSurface}
                transition
              `}
            >
              <ArrowLeft size={17} />
            </button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${themePrimaryBg}`}
              />

              <p
                className={`text-xs sm:text-sm font-semibold ${themePrimaryText}`}
              >
                {selected?.kelas ||
                  kelasSiswa?.nama ||
                  currentUser?.kelas?.nama ||
                  "Kelas Siswa"}
              </p>
            </div>

            <h1
              className={`text-2xl sm:text-3xl font-bold tracking-tight ${themeText}`}
            >
              {selected
                ? selected.nama
                : "Mata Pelajaran"}
            </h1>

            <p
              className={`text-sm ${themeTextMuted} mt-1.5 max-w-2xl`}
            >
              {selected
                ? `Diampu oleh ${selected.guru}`
                : "Kelola aktivitas pembelajaran berdasarkan mata pelajaran yang kamu ikuti."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              fetchMataPelajaran();
              fetchNotifications();
            }}
            disabled={loading}
            className={`
              ml-auto
              flex-shrink-0
              w-10 h-10
              flex items-center justify-center
              rounded-xl
              ${themeCardSurface}
              ${themeNeutralBorder}
              ${themeTextSecondary}
              ${themePrimaryHoverText}
              ${themePrimaryHoverBorder}
              ${themePrimaryHoverSurface}
              transition
              disabled:opacity-50
            `}
            title="Refresh"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div
            className={`
              mb-6
              rounded-2xl
              border
              ${themeNeutralBorder}
              ${themeCardSurface}
              p-4
              ${themeCardShadow}
            `}
          >
            <div className="flex items-start gap-3">
              <div
                className={`
                  w-9 h-9
                  rounded-xl
                  ${themeNeutralSurface}
                  flex items-center justify-center
                  flex-shrink-0
                `}
              >
                <AlertCircle
                  size={18}
                  className={themeTextSecondary}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold ${themeText}`}
                >
                  Gagal memuat data
                </p>

                <p
                  className={`text-xs ${themeTextMuted} mt-1 break-words`}
                >
                  {error}
                </p>

                <button
                  type="button"
                  onClick={
                    fetchMataPelajaran
                  }
                  className={`
                    mt-3
                    inline-flex items-center gap-2
                    px-3 py-2
                    rounded-lg
                    ${themePrimaryGradient}
                    text-[var(--color-card)]
                    text-xs font-semibold
                    hover:opacity-90
                    transition
                  `}
                >
                  <RefreshCw size={13} />
                  Coba lagi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DETAIL MAPEL */}

        {selected ? (
          <div className="space-y-6">

            {/* DETAIL HEADER */}

            <div
              className={`
                relative
                overflow-hidden
                rounded-2xl
                ${themeCardSurface}
                border
                ${themeNeutralBorder}
                ${themeCardShadow}
              `}
            >
              <div
                className={`
                  absolute
                  right-0
                  top-0
                  w-56
                  h-56
                  rounded-full
                  ${themePrimarySurface}
                  blur-3xl
                  pointer-events-none
                `}
              />

              <div className="relative p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div
                    className={`
                      w-16 h-16
                      rounded-2xl
                      ${themePrimaryGradient}
                      text-[var(--color-card)]
                      flex items-center justify-center
                      ${themePrimaryShadow}
                      flex-shrink-0
                    `}
                  >
                    <selected.icon
                      size={27}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-medium ${themeTextMuted} uppercase tracking-wider`}
                    >
                      Mata Pelajaran
                    </p>

                    <h2
                      className={`text-xl sm:text-2xl font-bold ${themeText} mt-1`}
                    >
                      {selected.nama}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                      <span
                        className={`text-sm ${themeTextSecondary}`}
                      >
                        {selected.guru}
                      </span>

                      <span
                        className={`hidden sm:block w-1 h-1 rounded-full ${themeNeutralSurface}`}
                      />

                      <span
                        className={`text-sm ${themeTextMuted}`}
                      >
                        {selected.kelas}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`
                      hidden sm:flex
                      items-center gap-2
                      px-3 py-2
                      rounded-xl
                      ${themePrimarySurface}
                      ${themePrimaryText}
                    `}
                  >
                    <BookOpen size={16} />

                    <span className="text-xs font-semibold">
                      Pembelajaran
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SUMMARY */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MiniStat
                label="Materi"
                value={selected.materi}
                description="Materi tersedia"
                icon={FileText}
              />

              <MiniStat
                label="Tugas"
                value={selected.tugas}
                description="Tugas pembelajaran"
                icon={ClipboardList}
              />

              <MiniStat
                label="Ujian"
                value={selected.ujian}
                description="Jadwal ujian"
                icon={GraduationCap}
              />
            </div>

            {/* AKTIVITAS */}

            <div>
              <div className="mb-4">
                <h2
                  className={`text-base font-bold ${themeText}`}
                >
                  Aktivitas Pembelajaran
                </h2>

                <p
                  className={`text-xs ${themeTextMuted} mt-1`}
                >
                  Akses materi, tugas, dan ujian untuk
                  mata pelajaran ini.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SectionCard
                  icon={FileText}
                  title="Materi"
                  description="Pelajari materi pembelajaran"
                  count={selected.materi}
                  countLabel="materi"
                  variant="primary"
                  onClick={() =>
                    goTo("materi")
                  }
                />

                <SectionCard
                  icon={ClipboardList}
                  title="Tugas"
                  description="Lihat dan kerjakan tugas"
                  count={selected.tugas}
                  countLabel="tugas"
                  variant="info"
                  onClick={() =>
                    goTo("tugas")
                  }
                />

                <SectionCard
                  icon={GraduationCap}
                  title="Ujian"
                  description="Jadwal dan hasil ujian"
                  count={selected.ujian}
                  countLabel="ujian"
                  variant="neutral"
                  onClick={() =>
                    goTo("ujian")
                  }
                />
              </div>
            </div>

            {/* INFO PEMBELAJARAN */}

            <div
              className={`
                rounded-2xl
                border
                ${themeInfoBorder}
                ${themeInfoSurface}
                p-4
              `}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`
                    w-9 h-9
                    rounded-xl
                    ${themeCardSurface}
                    border
                    ${themeInfoBorder}
                    flex items-center justify-center
                    flex-shrink-0
                  `}
                >
                  <BookOpen
                    size={17}
                    className={themeInfoText}
                  />
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold ${themeInfoText}`}
                  >
                    Informasi pembelajaran
                  </p>

                  <p
                    className={`text-xs ${themeInfoText} mt-1`}
                  >
                    {selected.kelas}
                    {" · "}
                    {selected.nama}
                    {" · "}
                    {selected.guru}
                  </p>

                  <p
                    className={`text-[11px] ${themeTextMuted} mt-2 break-all`}
                  >
                    ID Kelas Mapel:{" "}
                    {selected.kelasMapelId}
                  </p>
                </div>
              </div>
            </div>

            {/* AKTIVITAS TERBARU */}

            <div
              className={`
                ${themeCardSurface}
                rounded-2xl
                border
                ${themeNeutralBorder}
                ${themeCardShadow}
                overflow-hidden
              `}
            >
              <div
                className={`px-5 py-4 border-b ${themeDivider}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      w-9 h-9
                      rounded-xl
                      ${themeNeutralSurface}
                      ${themeTextSecondary}
                      flex items-center justify-center
                    `}
                  >
                    <Bell size={17} />
                  </div>

                  <div>
                    <h3
                      className={`text-sm font-semibold ${themeText}`}
                    >
                      Aktivitas Terbaru
                    </h3>

                    <p
                      className={`text-xs ${themeTextMuted} mt-0.5`}
                    >
                      Pembaruan pembelajaran{" "}
                      {selected.nama}
                    </p>
                  </div>
                </div>
              </div>

              <EmptyActivity />
            </div>
          </div>
        ) : (
          <div className="space-y-6">

            {/* OVERVIEW */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <OverviewCard
                icon={BookOpen}
                label="Mata Pelajaran"
                value={
                  mataPelajaranList.length
                }
                description="Pelajaran aktif"
                primary
              />

              <OverviewCard
                icon={FileText}
                label="Total Materi"
                value={totalMateri}
                description="Materi tersedia"
              />

              <OverviewCard
                icon={ClipboardList}
                label="Total Tugas"
                value={totalTugas}
                description="Tugas pembelajaran"
              />
            </div>

            {/* CONTENT */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* MAPEL */}

              <section
                className={`
                  lg:col-span-2
                  ${themeCardSurface}
                  rounded-2xl
                  border
                  ${themeNeutralBorder}
                  ${themeCardShadow}
                  overflow-hidden
                `}
              >
                <div
                  className={`px-5 py-5 border-b ${themeDivider}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2
                        className={`text-base font-bold ${themeText}`}
                      >
                        Mata Pelajaran
                      </h2>

                      <p
                        className={`text-xs ${themeTextMuted} mt-1`}
                      >
                        Pilih mata pelajaran untuk melihat
                        detail pembelajaran.
                      </p>
                    </div>

                    <div
                      className={`
                        hidden sm:flex
                        items-center gap-2
                        px-3 py-2
                        rounded-xl
                        ${themePrimarySurface}
                        ${themePrimaryText}
                      `}
                    >
                      <BookOpen size={16} />

                      <span className="text-xs font-semibold">
                        {mataPelajaranList.length}{" "}
                        pelajaran
                      </span>
                    </div>
                  </div>
                </div>

                {mataPelajaranList.length ===
                0 ? (
                  <EmptySubjects
                    onRefresh={
                      fetchMataPelajaran
                    }
                  />
                ) : (
                  <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {mataPelajaranList.map(
                        (mapel) => {
                          const Icon =
                            mapel.icon;

                          return (
                            <button
                              key={
                                mapel.kelasMapelId
                              }
                              type="button"
                              onClick={() =>
                                setSelectedId(
                                  mapel.kelasMapelId
                                )
                              }
                              className={`
                                group
                                text-left
                                w-full
                                ${themeCardSurface}
                                border
                                ${themeNeutralBorder}
                                ${themePrimaryHoverBorder}
                                rounded-2xl
                                p-4
                                ${themeSmallShadow}
                                ${themeHoverShadow}
                                hover:-translate-y-0.5
                                transition-all
                                duration-200
                              `}
                            >
                              <div className="flex items-start justify-between">
                                <div
                                  className={`
                                    w-11 h-11
                                    rounded-xl
                                    ${themePrimaryGradient}
                                    text-[var(--color-card)]
                                    flex items-center justify-center
                                    ${themeSmallShadow}
                                  `}
                                >
                                  <Icon
                                    size={20}
                                    strokeWidth={1.9}
                                  />
                                </div>

                                <div
                                  className={`
                                    w-8 h-8
                                    rounded-lg
                                    ${themeNeutralSurface}
                                    flex items-center justify-center
                                    ${themePrimaryHoverSurface}
                                    transition
                                  `}
                                >
                                  <ChevronRight
                                    size={16}
                                    className={`
                                      ${themeTextMuted}
                                      ${themePrimaryHoverText}
                                      transition
                                    `}
                                  />
                                </div>
                              </div>

                              <div className="mt-4">
                                <h3
                                  className={`
                                    text-sm
                                    font-bold
                                    ${themeText}
                                    truncate
                                  `}
                                >
                                  {mapel.nama}
                                </h3>

                                <p
                                  className={`
                                    text-xs
                                    ${themeTextSecondary}
                                    mt-1
                                    truncate
                                  `}
                                >
                                  {mapel.guru}
                                </p>

                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`
                                      w-1 h-1
                                      rounded-full
                                      ${themeNeutralSurface}
                                    `}
                                  />

                                  <span
                                    className={`
                                      text-[11px]
                                      ${themeTextMuted}
                                      truncate
                                    `}
                                  >
                                    {mapel.kelas}
                                  </span>
                                </div>
                              </div>

                              <div
                                className={`
                                  mt-4
                                  pt-3
                                  border-t
                                  ${themeDivider}
                                  flex items-center
                                  justify-between gap-2
                                `}
                              >
                                <div className="flex items-center gap-2">
                                  <ContentBadge
                                    icon={FileText}
                                    value={
                                      mapel.materi
                                    }
                                    label="materi"
                                  />

                                  <ContentBadge
                                    icon={
                                      ClipboardList
                                    }
                                    value={
                                      mapel.tugas
                                    }
                                    label="tugas"
                                    primary
                                  />
                                </div>

                                <span
                                  className={`
                                    text-[11px]
                                    font-semibold
                                    ${themePrimaryText}
                                  `}
                                >
                                  Buka
                                </span>
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* RIGHT SIDEBAR */}

              <aside className="space-y-4">

                {/* INFO */}

                <div
                  className={`
                    ${themeCardSurface}
                    rounded-2xl
                    border
                    ${themeNeutralBorder}
                    ${themeCardShadow}
                    overflow-hidden
                  `}
                >
                  <div
                    className={`px-5 py-4 border-b ${themeDivider}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          w-9 h-9
                          rounded-xl
                          ${themePrimarySurface}
                          ${themePrimaryText}
                          flex items-center justify-center
                        `}
                      >
                        <BookOpen size={17} />
                      </div>

                      <div>
                        <h3
                          className={`text-sm font-semibold ${themeText}`}
                        >
                          Pembelajaran
                        </h3>

                        <p
                          className={`text-xs ${themeTextMuted} mt-0.5`}
                        >
                          {kelasSiswa?.nama
                            ? `Ringkasan ${kelasSiswa.nama}`
                            : "Ringkasan kelas kamu"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="space-y-4">
                      <InfoRow
                        label="Kelas"
                        value={
                          kelasSiswa?.nama ||
                          "-"
                        }
                      />

                      <InfoRow
                        label="Mata Pelajaran"
                        value={
                          mataPelajaranList.length
                        }
                      />

                      <InfoRow
                        label="Total Materi"
                        value={totalMateri}
                      />

                      <InfoRow
                        label="Total Tugas"
                        value={totalTugas}
                      />
                    </div>
                  </div>
                </div>

                {/* QUICK NOTE */}

                <div
                  className={`
                    relative
                    overflow-hidden
                    rounded-2xl
                    ${themePrimaryGradient}
                    p-5
                    text-[var(--color-card)]
                    ${themePrimaryShadow}
                  `}
                >
                  <div
                    className="
                      absolute
                      -right-8
                      -top-8
                      w-28
                      h-28
                      rounded-full
                      bg-white/10
                    "
                  />

                  <div className="relative">
                    <div
                      className="
                        w-9 h-9
                        rounded-xl
                        bg-white/10
                        border border-white/10
                        flex items-center justify-center
                        mb-4
                      "
                    >
                      <GraduationCap size={18} />
                    </div>

                    <h3 className="text-sm font-semibold">
                      Fokus belajar
                    </h3>

                    <p className="text-xs opacity-80 leading-relaxed mt-1.5">
                      Pilih mata pelajaran dan lanjutkan
                      aktivitas pembelajaranmu.
                    </p>
                  </div>
                </div>

                {/* INFO TERBARU */}

                <div
                  className={`
                    ${themeCardSurface}
                    rounded-2xl
                    border
                    ${themeNeutralBorder}
                    ${themeCardShadow}
                    overflow-hidden
                  `}
                >
                  <div
                    className={`px-5 py-4 border-b ${themeDivider}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            relative
                            w-9 h-9
                            rounded-xl
                            ${themePrimarySurface}
                            ${themePrimaryText}
                            flex items-center justify-center
                          `}
                        >
                          <Bell size={17} />

                          {notifications.some(
                            (notification) =>
                              !notification.dibaca
                          ) && (
                            <span
                              className={`
                                absolute
                                -top-1
                                -right-1
                                w-2.5
                                h-2.5
                                rounded-full
                                ${themePrimaryBg}
                                border-2
                                border-[var(--color-card)]
                              `}
                            />
                          )}
                        </div>

                        <div>
                          <h3
                            className={`text-sm font-semibold ${themeText}`}
                          >
                            Info Terbaru
                          </h3>

                          <p
                            className={`text-xs ${themeTextMuted} mt-0.5`}
                          >
                            Notifikasi pembelajaran kamu
                          </p>
                        </div>
                      </div>

                      {notifications.length >
                        0 && (
                        <span
                          className={`
                            text-[10px]
                            font-semibold
                            ${themePrimaryText}
                            ${themePrimarySurface}
                            px-2
                            py-1
                            rounded-lg
                          `}
                        >
                          {notifications.length}{" "}
                          terbaru
                        </span>
                      )}
                    </div>
                  </div>

                  {notificationLoading ? (
                    <div className="p-5 space-y-3">
                      {[1, 2, 3].map(
                        (item) => (
                          <div
                            key={item}
                            className="flex items-start gap-3 animate-pulse"
                          >
                            <div
                              className={`
                                w-9 h-9
                                rounded-xl
                                ${themeNeutralSurface}
                                flex-shrink-0
                              `}
                            />

                            <div className="flex-1 min-w-0">
                              <div
                                className={`
                                  h-3
                                  w-3/4
                                  rounded
                                  ${themeNeutralSurface}
                                `}
                              />

                              <div
                                className={`
                                  h-2.5
                                  w-full
                                  rounded
                                  mt-2
                                  ${themeNeutralSurface}
                                `}
                              />

                              <div
                                className={`
                                  h-2.5
                                  w-1/3
                                  rounded
                                  mt-2
                                  ${themeNeutralSurface}
                                `}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : notifications.length ===
                    0 ? (
                    <div className="p-6 text-center">
                      <div
                        className={`
                          w-11 h-11
                          mx-auto
                          rounded-xl
                          ${themeNeutralSurface}
                          flex items-center justify-center
                        `}
                      >
                        <Bell
                          size={19}
                          className={themeTextMuted}
                        />
                      </div>

                      <p
                        className={`text-xs ${themeTextMuted} mt-3`}
                      >
                        Belum ada notifikasi terbaru.
                      </p>

                      <p
                        className={`text-[11px] ${themeTextPlaceholder} mt-1`}
                      >
                        Notifikasi tugas dan pembelajaran
                        akan muncul di sini.
                      </p>
                    </div>
                  ) : (
                    <div
                      className={`divide-y ${themeDivide}`}
                    >
                      {notifications.map(
                        (notification) => {
                          const isUnread =
                            !notification.dibaca;

                          const title =
                            notification.judul ||
                            "Notifikasi";

                          const description =
                            notification.isi ||
                            "Ada informasi baru untuk kamu.";

                          let timeText = "";

                          if (
                            notification.dibuatPada
                          ) {
                            const date =
                              new Date(
                                notification.dibuatPada
                              );

                            if (
                              !Number.isNaN(
                                date.getTime()
                              )
                            ) {
                              timeText =
                                date.toLocaleString(
                                  "id-ID",
                                  {
                                    day: "2-digit",
                                    month:
                                      "short",
                                    hour: "2-digit",
                                    minute:
                                      "2-digit",
                                  }
                                );
                            }
                          }

                          return (
                            <button
                              key={
                                notification.id
                              }
                              type="button"
                              onClick={() => {
                                if (
                                  notification.targetUrl
                                ) {
                                  router.push(
                                    notification.targetUrl
                                  );
                                }
                              }}
                              className={`
                                w-full
                                text-left
                                p-4
                                flex items-start gap-3
                                transition
                                ${themeNeutralHover}
                                ${
                                  isUnread
                                    ? themePrimarySurface
                                    : themeCardSurface
                                }
                              `}
                            >
                              <div
                                className={`
                                  w-9 h-9
                                  rounded-xl
                                  flex items-center justify-center
                                  flex-shrink-0
                                  ${
                                    isUnread
                                      ? `${themePrimarySurface} ${themePrimaryText}`
                                      : `${themeNeutralSurface} ${themeTextSecondary}`
                                  }
                                `}
                              >
                                {notification.kategori ===
                                "deadline_tugas" ? (
                                  <ClipboardList
                                    size={16}
                                  />
                                ) : (
                                  <Bell size={16} />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start gap-2">
                                  <p
                                    className={`
                                      text-xs
                                      leading-relaxed
                                      flex-1
                                      ${
                                        isUnread
                                          ? `font-semibold ${themeText}`
                                          : `font-medium ${themeTextSecondary}`
                                      }
                                    `}
                                  >
                                    {title}
                                  </p>

                                  {isUnread && (
                                    <span
                                      className={`
                                        w-2 h-2
                                        rounded-full
                                        ${themePrimaryBg}
                                        flex-shrink-0
                                        mt-1
                                      `}
                                    />
                                  )}
                                </div>

                                <p
                                  className={`
                                    text-[11px]
                                    ${themeTextSecondary}
                                    leading-relaxed
                                    mt-1
                                    line-clamp-2
                                  `}
                                >
                                  {description}
                                </p>

                                {timeText && (
                                  <p
                                    className={`
                                      text-[10px]
                                      ${themeTextMuted}
                                      mt-1.5
                                    `}
                                  >
                                    {timeText}
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// OVERVIEW CARD
// ============================================================

function OverviewCard({
  icon: Icon,
  label,
  value,
  description,
  primary = false,
}) {
  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-2xl
        border
        p-4 sm:p-5
        ${themeCardShadow}
        ${
          primary
            ? `${themePrimaryGradient} border-[color-mix(in_srgb,var(--color-primary)_40%,transparent)] text-[var(--color-card)]`
            : `${themeCardSurface} ${themeNeutralBorder}`
        }
      `}
    >
      {primary && (
        <div
          className="
            absolute
            -right-8
            -top-8
            w-28
            h-28
            rounded-full
            bg-white/10
          "
        />
      )}

      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p
            className={`text-xs font-medium ${
              primary
                ? "opacity-75"
                : themeTextMuted
            }`}
          >
            {label}
          </p>

          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-bold ${
                primary
                  ? "text-[var(--color-card)]"
                  : themeText
              }`}
            >
              {value}
            </span>
          </div>

          <p
            className={`text-[11px] mt-0.5 ${
              primary
                ? "opacity-75"
                : themeTextMuted
            }`}
          >
            {description}
          </p>
        </div>

        <div
          className={`
            w-11 h-11
            rounded-xl
            flex items-center justify-center
            flex-shrink-0
            ${
              primary
                ? "bg-white/10 text-[var(--color-card)]"
                : `${themePrimarySurface} ${themePrimaryText}`
            }
          `}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MINI STAT
// ============================================================

function MiniStat({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div
      className={`
        ${themeCardSurface}
        rounded-2xl
        border
        ${themeNeutralBorder}
        ${themeCardShadow}
        p-4
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className={`text-xs font-medium ${themeTextMuted}`}
          >
            {label}
          </p>

          <div className="flex items-baseline gap-1.5 mt-1">
            <span
              className={`text-2xl font-bold ${themeText}`}
            >
              {value}
            </span>

            <span
              className={`text-xs ${themeTextMuted}`}
            >
              item
            </span>
          </div>

          <p
            className={`text-[11px] ${themeTextMuted} mt-0.5`}
          >
            {description}
          </p>
        </div>

        <div
          className={`
            w-10 h-10
            rounded-xl
            ${themePrimarySurface}
            ${themePrimaryText}
            flex items-center justify-center
          `}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SECTION CARD
// ============================================================

function SectionCard({
  icon: Icon,
  title,
  description,
  count,
  countLabel,
  variant = "primary",
  onClick,
}) {
  const variantClasses = {
    primary: {
      surface: themePrimarySurface,
      text: themePrimaryText,
      border: themePrimaryHoverBorder,
    },

    info: {
      surface: themeInfoSurface,
      text: themeInfoText,
      border:
        "hover:border-[color-mix(in_srgb,var(--color-info)_30%,transparent)]",
    },

    neutral: {
      surface: themeNeutralSurface,
      text: themeTextSecondary,
      border: themeNeutralHoverBorder,
    },
  };

  const c =
    variantClasses[variant] ||
    variantClasses.primary;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        text-left
        w-full
        ${themeCardSurface}
        border
        ${themeNeutralBorder}
        ${c.border}
        rounded-2xl
        p-5
        ${themeSmallShadow}
        ${themeHoverShadow}
        hover:-translate-y-0.5
        transition-all
        duration-200
      `}
    >
      <div className="flex items-start justify-between">
        <div
          className={`
            w-11 h-11
            rounded-xl
            ${c.surface}
            ${c.text}
            flex items-center justify-center
          `}
        >
          <Icon
            size={20}
            strokeWidth={1.9}
          />
        </div>

        <div
          className={`
            w-8 h-8
            rounded-lg
            ${themeNeutralSurface}
            flex items-center justify-center
            ${themePrimaryHoverSurface}
            transition
          `}
        >
          <ChevronRight
            size={16}
            className={`
              ${themeTextMuted}
              ${themePrimaryHoverText}
              transition
            `}
          />
        </div>
      </div>

      <h3
        className={`text-sm font-bold ${themeText} mt-5`}
      >
        {title}
      </h3>

      <p
        className={`text-xs ${themeTextSecondary} mt-1 leading-relaxed`}
      >
        {description}
      </p>

      <div className="flex items-baseline gap-1.5 mt-5">
        <span
          className={`text-2xl font-bold ${c.text}`}
        >
          {count}
        </span>

        <span
          className={`text-xs ${themeTextMuted}`}
        >
          {countLabel}
        </span>
      </div>
    </button>
  );
}

// ============================================================
// CONTENT BADGE
// ============================================================

function ContentBadge({
  icon: Icon,
  value,
  label,
  primary = false,
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2 py-1
        rounded-lg
        text-[10px] font-semibold
        ${
          primary
            ? `${themePrimarySurface} ${themePrimaryText}`
            : `${themeNeutralSurface} ${themeTextSecondary}`
        }
      `}
    >
      <Icon size={10} />

      {value} {label}
    </span>
  );
}

// ============================================================
// INFO ROW
// ============================================================

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={`text-xs ${themeTextSecondary}`}
      >
        {label}
      </span>

      <span
        className={`text-sm font-semibold ${themeText}`}
      >
        {value}
      </span>
    </div>
  );
}

// ============================================================
// EMPTY SUBJECT
// ============================================================

function EmptySubjects({
  onRefresh,
}) {
  return (
    <div className="py-16 px-5 text-center">
      <div
        className={`
          w-14 h-14
          mx-auto
          rounded-2xl
          ${themeNeutralSurface}
          flex items-center justify-center
        `}
      >
        <BookOpen
          size={24}
          className={themeTextMuted}
        />
      </div>

      <h3
        className={`text-sm font-semibold ${themeText} mt-4`}
      >
        Belum ada mata pelajaran
      </h3>

      <p
        className={`
          text-xs
          ${themeTextMuted}
          mt-1
          max-w-sm
          mx-auto
          leading-relaxed
        `}
      >
        Belum ada data mata pelajaran yang tersedia
        untuk kelas kamu.
      </p>

      <button
        type="button"
        onClick={onRefresh}
        className={`
          mt-5
          inline-flex items-center gap-2
          px-4 py-2.5
          rounded-xl
          ${themePrimaryGradient}
          text-[var(--color-card)]
          text-xs font-semibold
          hover:opacity-90
          transition
        `}
      >
        <RefreshCw size={14} />

        Muat ulang
      </button>
    </div>
  );
}

// ============================================================
// EMPTY ACTIVITY
// ============================================================

function EmptyActivity() {
  return (
    <div className="py-12 px-5 text-center">
      <div
        className={`
          w-12 h-12
          mx-auto
          rounded-xl
          ${themeNeutralSurface}
          flex items-center justify-center
        `}
      >
        <Bell
          size={20}
          className={themeTextMuted}
        />
      </div>

      <p
        className={`text-sm ${themeTextMuted} mt-3`}
      >
        Belum ada aktivitas terbaru.
      </p>

      <p
        className={`text-[11px] ${themeTextPlaceholder} mt-1`}
      >
        Aktivitas pembelajaran akan muncul di sini.
      </p>
    </div>
  );
}