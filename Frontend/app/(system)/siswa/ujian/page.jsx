"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

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
} from "../../../services/kelas.service";

import { getKelasMapel } from "../../../services/kelasMapel.service";
import { getUjianByKelasMapel } from "../../../services/ujian.service";

// =========================================================
// COLOR MAP
// =========================================================

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-600",
    grad: "from-blue-500 to-blue-700",
    soft: "bg-blue-50",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    icon: "bg-blue-100 text-blue-600",
    line: "bg-blue-500",
  },

  rose: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-600",
    grad: "from-rose-500 to-rose-700",
    soft: "bg-rose-50",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    icon: "bg-rose-100 text-rose-600",
    line: "bg-rose-500",
  },

  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-600",
    grad: "from-emerald-500 to-emerald-700",
    soft: "bg-emerald-50",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: "bg-emerald-100 text-emerald-600",
    line: "bg-emerald-500",
  },

  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-600",
    grad: "from-amber-500 to-amber-700",
    soft: "bg-amber-50",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    icon: "bg-amber-100 text-amber-600",
    line: "bg-amber-500",
  },

  indigo: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-600",
    grad: "from-indigo-500 to-indigo-700",
    soft: "bg-indigo-50",
    badge: "border-indigo-200 bg-indigo-50 text-indigo-700",
    icon: "bg-indigo-100 text-indigo-600",
    line: "bg-indigo-500",
  },

  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-600",
    grad: "from-orange-500 to-orange-700",
    soft: "bg-orange-50",
    badge: "border-orange-200 bg-orange-50 text-orange-700",
    icon: "bg-orange-100 text-orange-600",
    line: "bg-orange-500",
  },
};

// =========================================================
// HELPER
// =========================================================

function getColorByJenis(jenis) {
  const map = {
    UTS: "blue",
    UAS: "rose",
    Kuis: "amber",
    Harian: "emerald",
    Lainnya: "indigo",
  };

  return map[jenis] || "indigo";
}

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

  /*
   * Struktur BE:
   *
   * anggota[].siswa.id
   *
   * berdasarkan:
   * AnggotaKelas -> siswa Pengguna
   */

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

  /*
   * JANGAN menggunakan kelasId dari localStorage
   * sebagai sumber utama.
   *
   * Sumber kelas siswa berasal dari BE:
   *
   * GET /api/kelas
   *      ↓
   * GET /api/kelas/:id
   *      ↓
   * detail.anggota[].siswa.id
   */

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

  /*
   * Ambil detail setiap kelas.
   *
   * BE getDetailKelas() mengembalikan:
   *
   * anggota: [
   *   {
   *     siswa: {
   *       id,
   *       namaLengkap,
   *       nisn,
   *       nis,
   *       ...
   *     }
   *   }
   * ]
   */

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
      // 1. CARI KELAS SISWA DARI BACKEND
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
      // 3. FILTER KELAS MAPEL BERDASARKAN KELAS SISWA
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

      /*
       * FALLBACK:
       *
       * getDetailKelas() BE juga include kelasMapel.
       *
       * Jadi kalau endpoint getKelasMapel
       * tidak mengembalikan data yang diperlukan,
       * gunakan data dari detail kelas yang
       * memang sudah diberikan oleh BE.
       */

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
      // 4. AMBIL UJIAN DARI SETIAP KELAS MAPEL
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
      // 6. FILTER BERDASARKAN KELAS SISWA
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
      // 8. MAPPING UNTUK UI
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
                getColorByJenis(
                  ujian?.jenis
                ),

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

  const formatDate = (
    dateStr
  ) => {
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

  const formatTime = (
    dateStr
  ) => {
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

  const handleCardClick = (
    ujianId
  ) => {
    if (!ujianId) {
      return;
    }

    router.push(
      `/siswa/ujian/${ujianId}`
    );
  };

  // =======================================================
  // STATUS
  // =======================================================

  const getStatusBadge = (
    status
  ) => {
    const map = {
      belum: {
        label:
          "Belum Dimulai",
        color:
          "border-slate-200 bg-slate-50 text-slate-600",
        dot: "bg-slate-400",
        icon: Clock,
      },

      sedang: {
        label:
          "Berlangsung",
        color:
          "border-amber-200 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
        icon: AlertCircle,
      },

      selesai: {
        label: "Selesai",
        color:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
        icon: CheckCircle,
      },
    };

    return (
      map[status] ||
      map.belum
    );
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F6F8FC]">
      <Sidebar
        role="siswa"
        active="ujian"
        setActive={() => {}}
        collapsed={false}
        setCollapsed={() => {}}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1600px] space-y-6">

              {/* =================================================
                  PREMIUM HERO
              ================================================= */}

              <section className="relative overflow-hidden rounded-[24px] bg-[#0D47C9] shadow-[0_18px_45px_rgba(15,70,200,0.18)]">

                <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

                <div className="absolute -bottom-32 right-32 h-64 w-64 rounded-full bg-blue-300/10 blur-3xl" />

                <div className="absolute left-1/3 top-0 h-full w-px bg-white/[0.04]" />

                <div className="absolute right-1/4 top-0 h-full w-px bg-white/[0.04]" />

                <div className="relative p-6 sm:p-8 lg:p-9">
                  <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">

                    <div className="min-w-0 max-w-2xl">
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50 backdrop-blur-sm">
                        <GraduationCap size={14} />
                        <span>
                          AKADEMIK SISWA
                        </span>
                      </div>

                      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[34px]">
                        Daftar Ujian
                      </h1>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-[15px]">
                        Kelola dan ikuti seluruh ujian yang
                        tersedia untuk kelas kamu dalam satu
                        tempat.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <HeroStat
                        value={
                          stats.total
                        }
                        label="Total"
                      />

                      <HeroStat
                        value={
                          stats.sedang
                        }
                        label="Berlangsung"
                        highlight
                      />

                      <HeroStat
                        value={
                          stats.selesai
                        }
                        label="Selesai"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  TOOLBAR
              ================================================= */}

              <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_20px_rgba(15,23,42,0.04)] sm:p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                  <div className="relative w-full xl:max-w-md">
                    <Search
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <div className="flex min-w-0 overflow-x-auto rounded-xl bg-slate-100 p-1">
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
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            <Icon
                              size={14}
                            />

                            <span>
                              {
                                config.label
                              }
                            </span>

                            <span
                              className={`ml-0.5 rounded-md px-1.5 py-0.5 text-[10px] ${
                                active
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-slate-200 text-slate-500"
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

                  <button
                    onClick={
                      loadUjian
                    }
                    disabled={loading}
                    className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
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

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-500">
                    Menampilkan{" "}
                    <span className="font-semibold text-slate-700">
                      {
                        filtered.length
                      }
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-slate-700">
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
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
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
                  onRetry={
                    loadUjian
                  }
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
                      <h2 className="text-base font-bold text-slate-800">
                        Ujian Tersedia
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Pilih ujian untuk melihat
                        detail dan instruksi.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {filtered.map(
                      (ujian) => {
                        const c =
                          colorMap[
                            ujian.warna
                          ] ||
                          colorMap.indigo;

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
                            className="group relative flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_14px_32px_rgba(15,23,42,0.09)]"
                          >
                            <div
                              className={`h-1 w-full bg-gradient-to-r ${c.grad}`}
                            />

                            <div className="p-5 pb-4">
                              <div className="flex items-start justify-between gap-3">
                                <div
                                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.icon}`}
                                >
                                  <IconComponent
                                    size={21}
                                  />
                                </div>

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold ${statusBadge.color}`}
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
                                  className={`text-[11px] font-bold uppercase tracking-[0.08em] ${c.text}`}
                                >
                                  {
                                    ujian.jenis
                                  }
                                </p>

                                <h3 className="mt-1.5 line-clamp-2 min-h-[42px] text-[15px] font-bold leading-5 text-slate-800 transition-colors group-hover:text-blue-700">
                                  {
                                    ujian.judul
                                  }
                                </h3>
                              </div>

                              <div className="mt-3 flex min-w-0 items-center gap-2">
                                <BookOpen
                                  size={14}
                                  className="shrink-0 text-slate-400"
                                />

                                <span className="truncate text-xs font-semibold text-slate-600">
                                  {
                                    ujian.mapel
                                  }
                                </span>
                              </div>

                              <p className="mt-1 truncate pl-5 text-[11px] text-slate-400">
                                {
                                  ujian.guru
                                }
                              </p>
                            </div>

                            <div className="mx-5 border-t border-slate-100" />

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

                            <div className="mx-5 rounded-xl bg-slate-50 px-3.5 py-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                    Kelas
                                  </p>

                                  <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">
                                    {
                                      ujian.kelas
                                    }
                                  </p>
                                </div>

                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                                  <GraduationCap
                                    size={15}
                                  />
                                </div>
                              </div>
                            </div>

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
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    : isSedang
                                    ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                    : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                }`}
                              >
                                <span>
                                  {isSelesai
                                    ? "Lihat Hasil"
                                    : isSedang
                                    ? "Mulai Ujian"
                                    : "Lihat Detail"}
                                </span>

                                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/70">
                                  <ArrowUpRight
                                    size={14}
                                  />
                                </span>
                              </button>
                            </div>

                            <div
                              className={`absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r ${c.grad} transition-all duration-300 group-hover:w-full`}
                            />
                          </article>
                        );
                      }
                    )}
                  </div>
                </section>
              )}

              <footer className="border-t border-slate-200/70 py-5">
                <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
                  <p className="text-[11px] text-slate-400">
                    © 2026 SmartSchool. Daftar Ujian Siswa.
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Sistem Informasi Akademik
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </main>
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
    <div className="min-w-[92px] rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
      <div
        className={`text-xl font-bold ${
          highlight
            ? "text-amber-300"
            : "text-white"
        }`}
      >
        {value}
      </div>

      <div className="mt-0.5 text-[10px] font-medium text-blue-100">
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
    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
      <div className="flex items-center gap-1.5">
        <Icon
          size={12}
          className="shrink-0 text-slate-400"
        />

        <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-1 truncate text-[11px] font-semibold text-slate-700">
        {value}
      </p>
    </div>
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
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="h-1 bg-slate-100" />

          <div className="animate-pulse p-5">
            <div className="flex justify-between">
              <div className="h-11 w-11 rounded-xl bg-slate-100" />

              <div className="h-7 w-24 rounded-full bg-slate-100" />
            </div>

            <div className="mt-5 h-3 w-16 rounded bg-slate-100" />

            <div className="mt-2 h-4 w-4/5 rounded bg-slate-100" />

            <div className="mt-2 h-4 w-3/5 rounded bg-slate-100" />

            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="h-12 rounded-xl bg-slate-50" />
              <div className="h-12 rounded-xl bg-slate-50" />
              <div className="h-12 rounded-xl bg-slate-50" />
              <div className="h-12 rounded-xl bg-slate-50" />
            </div>

            <div className="mt-3 h-12 rounded-xl bg-slate-50" />

            <div className="mt-4 h-10 rounded-xl bg-slate-100" />
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
    <section className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm sm:p-12">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <AlertCircle size={28} />
        </div>

        <h3 className="mt-5 text-base font-bold text-slate-800">
          Data ujian belum dapat dimuat
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {error}
        </p>

        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#155DFC] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0D47C9] active:scale-[0.98]"
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
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
        {search ? (
          <Search size={27} />
        ) : (
          <FileCheck size={27} />
        )}
      </div>

      <h3 className="mt-5 text-base font-bold text-slate-800">
        {search
          ? "Ujian tidak ditemukan"
          : "Belum ada ujian tersedia"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {search
          ? "Tidak ada ujian yang sesuai dengan pencarian atau filter yang dipilih."
          : "Belum terdapat ujian yang tersedia untuk kelas kamu saat ini."}
      </p>

      {search && (
        <button
          onClick={onReset}
          className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
        >
          Reset Filter
        </button>
      )}
    </section>
  );
}
