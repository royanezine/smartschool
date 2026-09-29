"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import { getKelas, getKelasById } from "../../../services/kelas.service";

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
// COLOR LIST
// ============================================================

const colorList = [
  "blue",
  "indigo",
  "slate",
  "blue",
  "indigo",
  "blue",
  "slate",
  "indigo",
];

// ============================================================
// COLOR MAP
// ============================================================

const colorMap = {
  blue: {
    gradient: "from-blue-600 to-blue-700",
    background: "bg-blue-50",
    text: "text-blue-600",
    border: "hover:border-blue-300",
  },

  indigo: {
    gradient: "from-indigo-600 to-blue-700",
    background: "bg-indigo-50",
    text: "text-indigo-600",
    border: "hover:border-indigo-300",
  },

  slate: {
    gradient: "from-slate-700 to-slate-800",
    background: "bg-slate-100",
    text: "text-slate-600",
    border: "hover:border-slate-300",
  },
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
// Mendukung beberapa kemungkinan response backend
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
// Untuk response GET /api/kelas/:id
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
// Kalau login response suatu saat sudah punya kelasId,
// fungsi ini tetap bisa langsung menggunakannya.
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
// GET USER NAME
// ============================================================

function getUserName(user) {
  return (
    user?.namaLengkap ||
    user?.nama ||
    user?.name ||
    user?.siswa?.namaLengkap ||
    user?.siswa?.nama ||
    user?.data?.namaLengkap ||
    user?.data?.nama ||
    "Siswa"
  );
}

// ============================================================
// GET USER EMAIL
// ============================================================

function getUserEmail(user) {
  return (
    user?.email ||
    user?.siswa?.email ||
    user?.data?.email ||
    "siswa@smartschool.com"
  );
}

// ============================================================
// GET USER AVATAR
// ============================================================

function getUserAvatar(user) {
  const name = getUserName(user);

  return name
    .split(" ")
    .filter(Boolean)
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ============================================================
// PAGE
// ============================================================

export default function MataPelajaranPage() {
  const router = useRouter();

  // ==========================================================
  // STATE
  // ==========================================================

  const [mataPelajaranList, setMataPelajaranList] = useState([]);

  const [selectedId, setSelectedId] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  const [userLoaded, setUserLoaded] = useState(false);

  // ==========================================================
  // KELAS SISWA
  // ==========================================================

  const [kelasSiswa, setKelasSiswa] = useState(null);

  // ==========================================================
  // NOTIFICATION STATE
  // ==========================================================

  const [notifications, setNotifications] = useState([]);

  const [notificationLoading, setNotificationLoading] =
    useState(true);

  // ==========================================================
  // FIND KELAS SISWA
  // ==========================================================

  const findKelasSiswa = useCallback(async (user) => {
    const userId = getUserId(user);

    if (!userId) {
      throw new Error(
        "ID siswa tidak ditemukan. Silakan login kembali."
      );
    }

    console.log("======================================");
    console.log("[MATA PELAJARAN] USER ID:", userId);
    console.log(
      "[MATA PELAJARAN] USER KELAS ID:",
      getUserKelasId(user)
    );
    console.log("======================================");

    // --------------------------------------------------------
    // JIKA KELAS ID SUDAH ADA DI LOCAL STORAGE
    // --------------------------------------------------------

    const explicitKelasId = getUserKelasId(user);

    if (explicitKelasId) {
      try {
        console.log(
          "[MATA PELAJARAN] Mengambil kelas langsung:",
          explicitKelasId
        );

        const result =
          await getKelasById(explicitKelasId);

        const detail = extractObject(result);

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

    // --------------------------------------------------------
    // KALAU KELAS ID TIDAK ADA
    // CARI BERDASARKAN ANGGOTA KELAS
    // --------------------------------------------------------

    console.log(
      "[MATA PELAJARAN] kelasId tidak tersedia."
    );

    console.log(
      "[MATA PELAJARAN] Mencari kelas berdasarkan anggota.siswa.id..."
    );

    const kelasResult = await getKelas({
      page: 1,
      limit: 100,
      sortBy: "tingkat",
      sortOrder: "asc",
    });

    console.log(
      "[MATA PELAJARAN] RESPONSE GET KELAS:",
      kelasResult
    );

    const kelasList = extractArray(kelasResult);

    if (!kelasList.length) {
      throw new Error(
        "Data kelas belum tersedia untuk sekolah ini."
      );
    }

    console.log(
      "[MATA PELAJARAN] JUMLAH KELAS:",
      kelasList.length
    );

    // --------------------------------------------------------
    // AMBIL DETAIL SEMUA KELAS
    // --------------------------------------------------------

    const detailKelasList = await Promise.all(
      kelasList.map(async (kelas) => {
        if (!kelas?.id) {
          return null;
        }

        try {
          const result =
            await getKelasById(kelas.id);

          return extractObject(result);
        } catch (error) {
          console.warn(
            `[MATA PELAJARAN] Gagal mengambil detail kelas ${kelas.id}:`,
            error
          );

          return null;
        }
      })
    );

    // --------------------------------------------------------
    // CARI KELAS YANG MEMILIKI SISWA LOGIN
    // --------------------------------------------------------

    const foundKelas = detailKelasList.find(
      (kelas) => {
        if (!kelas) {
          return false;
        }

        const anggota = Array.isArray(
          kelas.anggota
        )
          ? kelas.anggota
          : [];

        return anggota.some((anggotaItem) => {
          const siswaId =
            anggotaItem?.siswa?.id ??
            anggotaItem?.siswaId ??
            null;

          return (
            siswaId &&
            String(siswaId) ===
              String(userId)
          );
        });
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
  }, []);

  // ==========================================================
  // FETCH NOTIFICATIONS
  // ==========================================================

  const fetchNotifications = useCallback(async () => {
    try {
      setNotificationLoading(true);

      const token = getToken();

      if (!token) {
        setNotifications([]);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/v1/notifikasi`,
        {
          method: "GET",
          headers: getHeaders(),
          cache: "no-store",
        }
      );

      let result = null;

      try {
        result = await response.json();
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

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  // ==========================================================
  // FETCH TUGAS
  // ==========================================================

  const fetchJumlahTugas = useCallback(
    async (kelasMapelId) => {
      try {
        if (!kelasMapelId) {
          return 0;
        }

        const response = await fetch(
          `${API_URL}/api/v1/tugas/kelas-mapel/${kelasMapelId}`,
          {
            method: "GET",
            headers: getHeaders(),
            cache: "no-store",
          }
        );

        let result = null;

        try {
          result = await response.json();
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

        const tugasData = extractArray(result);

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
          data.map(async (item) => {
            const jumlahTugas =
              await fetchJumlahTugas(
                item?.id
              );

            return {
              ...item,
              jumlahTugas,
            };
          })
        );
      },
      [fetchJumlahTugas]
    );

  // ==========================================================
  // FETCH MATERI
  // ==========================================================

  const fetchSemuaMateri = useCallback(
    async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/materi-pembelajaran`,
          {
            method: "GET",
            headers: getHeaders(),
            cache: "no-store",
          }
        );

        let result = null;

        try {
          result = await response.json();
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

        return extractArray(result);
      } catch (error) {
        console.error(
          "[MATA PELAJARAN] Error fetch materi:",
          error
        );

        return [];
      }
    },
    []
  );

  // ==========================================================
  // FETCH MATA PELAJARAN
  // ==========================================================

  const fetchMataPelajaran = useCallback(
    async () => {
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

        // ------------------------------------------------------
        // CARI KELAS SISWA DARI BACKEND
        // ------------------------------------------------------

        const kelas = await findKelasSiswa(
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

        // ------------------------------------------------------
        // AMBIL KELAS MAPEL DARI DETAIL KELAS
        // ------------------------------------------------------

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

        // ------------------------------------------------------
        // FETCH MATERI + TUGAS
        // ------------------------------------------------------

        const [
          materiData,
          dataDenganTugas,
        ] = await Promise.all([
          fetchSemuaMateri(),
          fetchJumlahTugasSemuaMapel(
            dataKelasSiswa
          ),
        ]);

        // ------------------------------------------------------
        // NORMALIZE
        // ------------------------------------------------------

        const normalized =
          dataDenganTugas.map(
            (item, index) => {
              const kelasMapelId =
                item?.id || null;

              const namaMapel =
                item?.mataPelajaran?.nama ||
                item?.mataPelajaran?.namaMapel ||
                item?.mataPelajaran
                  ?.namaMataPelajaran ||
                item?.mataPelajaran
                  ?.nama_mata_pelajaran ||
                item?.namaMataPelajaran ||
                "Mata Pelajaran";

              const guru =
                item?.guruPengajar
                  ?.namaLengkap ||
                item?.guru?.namaLengkap ||
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
                      materi?.kelasMapel?.id ??
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

                color:
                  colorList[
                    index %
                      colorList.length
                  ],

                materi:
                  jumlahMateri,

                tugas:
                  Number(
                    item?.jumlahTugas
                  ) || 0,

                ujian: 0,
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
    },
    [
      currentUser,
      findKelasSiswa,
      fetchSemuaMateri,
      fetchJumlahTugasSemuaMapel,
    ]
  );

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

  const selected = useMemo(
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

  const totalMateri = useMemo(
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

  const totalTugas = useMemo(
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
  // HEADER USER
  // ==========================================================

  const headerUser = useMemo(
    () => ({
      name: getUserName(
        currentUser
      ),

      email: getUserEmail(
        currentUser
      ),

      avatar: getUserAvatar(
        currentUser
      ),
    }),
    [currentUser]
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
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar
          role="siswa"
          active="mataPelajaran"
          collapsed={
            sidebarCollapsed
          }
          setCollapsed={
            setSidebarCollapsed
          }
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <Header
            toggleSidebar={() =>
              setSidebarCollapsed(
                !sidebarCollapsed
              )
            }
            user={{
              name: "Siswa",
              email:
                "siswa@smartschool.com",
              avatar: "S",
            }}
          />

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="animate-pulse">
                <div className="h-4 w-28 bg-slate-200 rounded mb-3" />

                <div className="h-8 w-64 bg-slate-200 rounded mb-2" />

                <div className="h-4 w-80 max-w-full bg-slate-200 rounded mb-8" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3].map(
                    (item) => (
                      <div
                        key={item}
                        className="h-24 bg-white border border-slate-200 rounded-2xl"
                      />
                    )
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <div className="h-5 w-40 bg-slate-200 rounded mb-5" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(
                      (item) => (
                        <div
                          key={item}
                          className="h-48 bg-slate-100 rounded-2xl"
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* SIDEBAR */}

      <Sidebar
        role="siswa"
        active="mataPelajaran"
        collapsed={
          sidebarCollapsed
        }
        setCollapsed={
          setSidebarCollapsed
        }
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* HEADER */}

        <Header
          toggleSidebar={() =>
            setSidebarCollapsed(
              !sidebarCollapsed
            )
          }
          user={headerUser}
        />

        {/* MAIN */}

        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {/* PAGE TITLE */}

            <div className="flex items-start gap-3 mb-7">
              {selected && (
                <button
                  type="button"
                  onClick={
                    backToList
                  }
                  className="
                    mt-1
                    w-10 h-10
                    flex items-center justify-center
                    rounded-xl
                    bg-white
                    border border-slate-200
                    text-slate-500
                    hover:text-blue-600
                    hover:border-blue-200
                    hover:bg-blue-50
                    transition
                  "
                >
                  <ArrowLeft
                    size={17}
                  />
                </button>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />

                  <p className="text-xs sm:text-sm font-semibold text-blue-600">
                    {selected?.kelas ||
                      kelasSiswa?.nama ||
                      currentUser
                        ?.kelas
                        ?.nama ||
                      "Kelas Siswa"}
                  </p>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  {selected
                    ? selected.nama
                    : "Mata Pelajaran"}
                </h1>

                <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
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
                className="
                  ml-auto
                  flex-shrink-0
                  w-10 h-10
                  flex items-center justify-center
                  rounded-xl
                  bg-white
                  border border-slate-200
                  text-slate-500
                  hover:text-blue-600
                  hover:border-blue-200
                  hover:bg-blue-50
                  transition
                  disabled:opacity-50
                "
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
              <div className="mb-6 rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                    <AlertCircle
                      size={18}
                      className="text-rose-600"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      Gagal memuat data
                    </p>

                    <p className="text-xs text-slate-500 mt-1 break-words">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={
                        fetchMataPelajaran
                      }
                      className="
                        mt-3
                        inline-flex items-center gap-2
                        px-3 py-2
                        rounded-lg
                        bg-blue-600
                        text-white
                        text-xs font-semibold
                        hover:bg-blue-700
                        transition
                      "
                    >
                      <RefreshCw
                        size={13}
                      />

                      Coba lagi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================
                DETAIL MAPEL
            ================================================== */}

            {selected ? (
              <div className="space-y-6">
                {/* DETAIL HEADER */}

                <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="absolute right-0 top-0 w-56 h-56 rounded-full bg-blue-50/80 blur-3xl pointer-events-none" />

                  <div className="relative p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                      <div
                        className="
                          w-16 h-16
                          rounded-2xl
                          bg-gradient-to-br from-blue-600 to-blue-700
                          text-white
                          flex items-center justify-center
                          shadow-lg shadow-blue-600/15
                          flex-shrink-0
                        "
                      >
                        <selected.icon
                          size={27}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Mata Pelajaran
                        </p>

                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                          {selected.nama}
                        </h2>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                          <span className="text-sm text-slate-500">
                            {selected.guru}
                          </span>

                          <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />

                          <span className="text-sm text-slate-400">
                            {selected.kelas}
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-700">
                        <BookOpen
                          size={16}
                        />

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
                    value={
                      selected.materi
                    }
                    description="Materi tersedia"
                    icon={FileText}
                  />

                  <MiniStat
                    label="Tugas"
                    value={
                      selected.tugas
                    }
                    description="Tugas pembelajaran"
                    icon={
                      ClipboardList
                    }
                  />

                  <MiniStat
                    label="Ujian"
                    value={
                      selected.ujian
                    }
                    description="Jadwal ujian"
                    icon={
                      GraduationCap
                    }
                  />
                </div>

                {/* AKTIVITAS */}

                <div>
                  <div className="mb-4">
                    <h2 className="text-base font-bold text-slate-900">
                      Aktivitas Pembelajaran
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
                      Akses materi, tugas, dan
                      ujian untuk mata pelajaran ini.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SectionCard
                      icon={FileText}
                      title="Materi"
                      description="Pelajari materi pembelajaran"
                      count={
                        selected.materi
                      }
                      countLabel="materi"
                      color="blue"
                      onClick={() =>
                        goTo("materi")
                      }
                    />

                    <SectionCard
                      icon={
                        ClipboardList
                      }
                      title="Tugas"
                      description="Lihat dan kerjakan tugas"
                      count={
                        selected.tugas
                      }
                      countLabel="tugas"
                      color="indigo"
                      onClick={() =>
                        goTo("tugas")
                      }
                    />

                    <SectionCard
                      icon={
                        GraduationCap
                      }
                      title="Ujian"
                      description="Jadwal dan hasil ujian"
                      count={
                        selected.ujian
                      }
                      countLabel="ujian"
                      color="slate"
                      onClick={() =>
                        goTo("ujian")
                      }
                    />
                  </div>
                </div>

                {/* INFO PEMBELAJARAN */}

                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-blue-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen
                        size={17}
                        className="text-blue-600"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-blue-900">
                        Informasi pembelajaran
                      </p>

                      <p className="text-xs text-blue-700 mt-1">
                        {selected.kelas}
                        {" · "}
                        {selected.nama}
                        {" · "}
                        {selected.guru}
                      </p>

                      <p className="text-[11px] text-blue-500/80 mt-2 break-all">
                        ID Kelas Mapel:{" "}
                        {selected.kelasMapelId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AKTIVITAS TERBARU */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                        <Bell
                          size={17}
                        />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">
                          Aktivitas Terbaru
                        </h3>

                        <p className="text-xs text-slate-400 mt-0.5">
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
              /* =================================================
                 LIST MAPEL
              ================================================= */

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
                    value={
                      totalMateri
                    }
                    description="Materi tersedia"
                  />

                  <OverviewCard
                    icon={
                      ClipboardList
                    }
                    label="Total Tugas"
                    value={
                      totalTugas
                    }
                    description="Tugas pembelajaran"
                  />
                </div>

                {/* CONTENT */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* MAPEL */}

                  <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-5 border-b border-slate-100">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h2 className="text-base font-bold text-slate-900">
                            Mata Pelajaran
                          </h2>

                          <p className="text-xs text-slate-400 mt-1">
                            Pilih mata pelajaran untuk
                            melihat detail pembelajaran.
                          </p>
                        </div>

                        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-600">
                          <BookOpen
                            size={16}
                          />

                          <span className="text-xs font-semibold">
                            {
                              mataPelajaranList.length
                            }{" "}
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

                              const c =
                                colorMap[
                                  mapel.color
                                ] ||
                                colorMap.blue;

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
                                    bg-white
                                    border border-slate-200
                                    ${c.border}
                                    rounded-2xl
                                    p-4
                                    shadow-sm
                                    hover:shadow-md
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
                                        bg-gradient-to-br
                                        ${c.gradient}
                                        text-white
                                        flex items-center justify-center
                                        shadow-sm
                                      `}
                                    >
                                      <Icon
                                        size={20}
                                        strokeWidth={
                                          1.9
                                        }
                                      />
                                    </div>

                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition">
                                      <ChevronRight
                                        size={16}
                                        className="text-slate-300 group-hover:text-blue-600 transition"
                                      />
                                    </div>
                                  </div>

                                  <div className="mt-4">
                                    <h3 className="text-sm font-bold text-slate-900 truncate">
                                      {
                                        mapel.nama
                                      }
                                    </h3>

                                    <p className="text-xs text-slate-500 mt-1 truncate">
                                      {
                                        mapel.guru
                                      }
                                    </p>

                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="w-1 h-1 rounded-full bg-slate-300" />

                                      <span className="text-[11px] text-slate-400 truncate">
                                        {
                                          mapel.kelas
                                        }
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <ContentBadge
                                        icon={
                                          FileText
                                        }
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
                                        blue
                                      />
                                    </div>

                                    <span className="text-[11px] font-semibold text-blue-600 group-hover:text-blue-700">
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

                  {/* =================================================
                      RIGHT SIDEBAR
                  ================================================= */}

                  <aside className="space-y-4">
                    {/* INFO */}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <BookOpen
                              size={17}
                            />
                          </div>

                          <div>
                            <h3 className="text-sm font-semibold text-slate-800">
                              Pembelajaran
                            </h3>

                            <p className="text-xs text-slate-400 mt-0.5">
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
                            value={
                              totalMateri
                            }
                          />

                          <InfoRow
                            label="Total Tugas"
                            value={
                              totalTugas
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* QUICK NOTE */}

                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white shadow-sm">
                      <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10" />

                      <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mb-4">
                          <GraduationCap
                            size={18}
                          />
                        </div>

                        <h3 className="text-sm font-semibold">
                          Fokus belajar
                        </h3>

                        <p className="text-xs text-blue-100 leading-relaxed mt-1.5">
                          Pilih mata pelajaran dan
                          lanjutkan aktivitas
                          pembelajaranmu.
                        </p>
                      </div>
                    </div>

                    {/* =================================================
                        INFO TERBARU / NOTIFIKASI
                    ================================================= */}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                              <Bell
                                size={17}
                              />

                              {notifications.some(
                                (
                                  notification
                                ) =>
                                  !notification.dibaca
                              ) && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
                              )}
                            </div>

                            <div>
                              <h3 className="text-sm font-semibold text-slate-800">
                                Info Terbaru
                              </h3>

                              <p className="text-xs text-slate-400 mt-0.5">
                                Notifikasi pembelajaran kamu
                              </p>
                            </div>
                          </div>

                          {notifications.length >
                            0 && (
                            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                              {
                                notifications.length
                              }{" "}
                              terbaru
                            </span>
                          )}
                        </div>
                      </div>

                      {/* LOADING */}

                      {notificationLoading ? (
                        <div className="p-5 space-y-3">
                          {[1, 2, 3].map(
                            (item) => (
                              <div
                                key={item}
                                className="flex items-start gap-3 animate-pulse"
                              >
                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex-shrink-0" />

                                <div className="flex-1 min-w-0">
                                  <div className="h-3 w-3/4 bg-slate-100 rounded" />

                                  <div className="h-2.5 w-full bg-slate-100 rounded mt-2" />

                                  <div className="h-2.5 w-1/3 bg-slate-100 rounded mt-2" />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : notifications.length ===
                        0 ? (
                        <div className="p-6 text-center">
                          <div className="w-11 h-11 mx-auto rounded-xl bg-slate-50 flex items-center justify-center">
                            <Bell
                              size={19}
                              className="text-slate-300"
                            />
                          </div>

                          <p className="text-xs text-slate-400 mt-3">
                            Belum ada notifikasi terbaru.
                          </p>

                          <p className="text-[11px] text-slate-300 mt-1">
                            Notifikasi tugas dan pembelajaran
                            akan muncul di sini.
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {notifications.map(
                            (
                              notification
                            ) => {
                              const isUnread =
                                !notification.dibaca;

                              const title =
                                notification.judul ||
                                "Notifikasi";

                              const description =
                                notification.isi ||
                                "Ada informasi baru untuk kamu.";

                              let timeText =
                                "";

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
                                    hover:bg-slate-50
                                    ${
                                      isUnread
                                        ? "bg-blue-50/40"
                                        : "bg-white"
                                    }
                                  `}
                                >
                                  {/* ICON */}

                                  <div
                                    className={`
                                      w-9 h-9
                                      rounded-xl
                                      flex items-center justify-center
                                      flex-shrink-0
                                      ${
                                        isUnread
                                          ? "bg-blue-100 text-blue-600"
                                          : "bg-slate-100 text-slate-500"
                                      }
                                    `}
                                  >
                                    {notification.kategori ===
                                    "deadline_tugas" ? (
                                      <ClipboardList
                                        size={16}
                                      />
                                    ) : (
                                      <Bell
                                        size={16}
                                      />
                                    )}
                                  </div>

                                  {/* CONTENT */}

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start gap-2">
                                      <p
                                        className={`
                                          text-xs
                                          leading-relaxed
                                          flex-1
                                          ${
                                            isUnread
                                              ? "font-semibold text-slate-800"
                                              : "font-medium text-slate-700"
                                          }
                                        `}
                                      >
                                        {title}
                                      </p>

                                      {isUnread && (
                                        <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                                      )}
                                    </div>

                                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1 line-clamp-2">
                                      {description}
                                    </p>

                                    {timeText && (
                                      <p className="text-[10px] text-slate-400 mt-1.5">
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
        </main>
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
        relative overflow-hidden
        rounded-2xl
        border
        shadow-sm
        p-4 sm:p-5
        ${
          primary
            ? "bg-blue-600 border-blue-600 text-white"
            : "bg-white border-slate-200"
        }
      `}
    >
      {primary && (
        <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10" />
      )}

      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p
            className={`text-xs font-medium ${
              primary
                ? "text-blue-100"
                : "text-slate-400"
            }`}
          >
            {label}
          </p>

          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-bold ${
                primary
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              {value}
            </span>
          </div>

          <p
            className={`text-[11px] mt-0.5 ${
              primary
                ? "text-blue-100"
                : "text-slate-400"
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
                ? "bg-white/10 text-white"
                : "bg-blue-50 text-blue-600"
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-400">
            {label}
          </p>

          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-slate-900">
              {value}
            </span>

            <span className="text-xs text-slate-400">
              item
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-0.5">
            {description}
          </p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
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
  color,
  onClick,
}) {
  const c =
    colorMap[color] ||
    colorMap.blue;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        text-left
        w-full
        bg-white
        border border-slate-200
        ${c.border}
        rounded-2xl
        p-5
        shadow-sm
        hover:shadow-md
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
            ${c.background}
            ${c.text}
            flex items-center justify-center
          `}
        >
          <Icon
            size={20}
            strokeWidth={1.9}
          />
        </div>

        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition">
          <ChevronRight
            size={16}
            className="text-slate-300 group-hover:text-blue-600 transition"
          />
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-900 mt-5">
        {title}
      </h3>

      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
        {description}
      </p>

      <div className="flex items-baseline gap-1.5 mt-5">
        <span
          className={`text-2xl font-bold ${c.text}`}
        >
          {count}
        </span>

        <span className="text-xs text-slate-400">
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
  blue = false,
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2 py-1
        rounded-lg
        text-[10px] font-semibold
        ${
          blue
            ? "bg-blue-50 text-blue-600"
            : "bg-slate-50 text-slate-500"
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
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-800">
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
      <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center">
        <BookOpen
          size={24}
          className="text-slate-300"
        />
      </div>

      <h3 className="text-sm font-semibold text-slate-700 mt-4">
        Belum ada mata pelajaran
      </h3>

      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
        Belum ada data mata pelajaran yang
        tersedia untuk kelas kamu.
      </p>

      <button
        type="button"
        onClick={onRefresh}
        className="
          mt-5
          inline-flex items-center gap-2
          px-4 py-2.5
          rounded-xl
          bg-blue-600
          text-white
          text-xs font-semibold
          hover:bg-blue-700
          transition
        "
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
      <div className="w-12 h-12 mx-auto rounded-xl bg-slate-50 flex items-center justify-center">
        <Bell
          size={20}
          className="text-slate-300"
        />
      </div>

      <p className="text-sm text-slate-400 mt-3">
        Belum ada aktivitas terbaru.
      </p>

      <p className="text-[11px] text-slate-300 mt-1">
        Aktivitas pembelajaran akan muncul di sini.
      </p>
    </div>
  );
}