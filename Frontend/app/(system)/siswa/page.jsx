"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import { getKelasMapel } from "../../services/kelasMapel.service";
import { getKelas, getKelasById } from "../../services/kelas.service";

import {
  BookOpen,
  Calculator,
  FlaskConical,
  Globe2,
  Languages,
  Palette,
  Music,
  Dumbbell,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  School,
  Sparkles,
  CalendarDays,
  ArrowUpRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/* =========================================================
   COLOR MAP
========================================================= */

const colorMap = {
  blue: {
    icon: "from-[#155DFC] to-[#0D47C9]",
    progress: "bg-[#155DFC]",
    ring: "group-hover:ring-blue-100",
    border: "group-hover:border-blue-200",
  },

  rose: {
    icon: "from-rose-500 to-rose-600",
    progress: "bg-rose-500",
    ring: "group-hover:ring-rose-100",
    border: "group-hover:border-rose-200",
  },

  emerald: {
    icon: "from-emerald-500 to-emerald-600",
    progress: "bg-emerald-500",
    ring: "group-hover:ring-emerald-100",
    border: "group-hover:border-emerald-200",
  },

  amber: {
    icon: "from-amber-500 to-amber-600",
    progress: "bg-amber-500",
    ring: "group-hover:ring-amber-100",
    border: "group-hover:border-amber-200",
  },

  indigo: {
    icon: "from-indigo-500 to-indigo-600",
    progress: "bg-indigo-500",
    ring: "group-hover:ring-indigo-100",
    border: "group-hover:border-indigo-200",
  },

  fuchsia: {
    icon: "from-fuchsia-500 to-fuchsia-600",
    progress: "bg-fuchsia-500",
    ring: "group-hover:ring-fuchsia-100",
    border: "group-hover:border-fuchsia-200",
  },

  cyan: {
    icon: "from-cyan-500 to-cyan-600",
    progress: "bg-cyan-500",
    ring: "group-hover:ring-cyan-100",
    border: "group-hover:border-cyan-200",
  },

  orange: {
    icon: "from-orange-500 to-orange-600",
    progress: "bg-orange-500",
    ring: "group-hover:ring-orange-100",
    border: "group-hover:border-orange-200",
  },
};

/* =========================================================
   ICON MATA PELAJARAN
========================================================= */

function getMapelIcon(nama = "") {
  const value = String(nama).toLowerCase();

  if (
    value.includes("matematika") ||
    value.includes("math")
  ) {
    return Calculator;
  }

  if (
    value.includes("ipa") ||
    value.includes("fisika") ||
    value.includes("kimia") ||
    value.includes("biologi")
  ) {
    return FlaskConical;
  }

  if (
    value.includes("ips") ||
    value.includes("geografi") ||
    value.includes("sosiologi") ||
    value.includes("ekonomi") ||
    value.includes("sejarah")
  ) {
    return Globe2;
  }

  if (
    value.includes("bahasa indonesia") ||
    value === "indonesia" ||
    value.includes("indonesia")
  ) {
    return Languages;
  }

  if (
    value.includes("bahasa inggris") ||
    value.includes("english")
  ) {
    return BookOpen;
  }

  if (
    value.includes("seni budaya") ||
    value.includes("seni rupa")
  ) {
    return Palette;
  }

  if (
    value.includes("musik") ||
    value.includes("seni musik")
  ) {
    return Music;
  }

  if (
    value.includes("pjok") ||
    value.includes("penjaskes") ||
    value.includes("olahraga")
  ) {
    return Dumbbell;
  }

  return BookOpen;
}

/* =========================================================
   WARNA MATA PELAJARAN
========================================================= */

const colorNames = [
  "blue",
  "rose",
  "emerald",
  "amber",
  "indigo",
  "fuchsia",
  "cyan",
  "orange",
];

function getMapelColor(index) {
  return colorNames[index % colorNames.length];
}

/* =========================================================
   AMBIL USERNAME
========================================================= */

function getUsername(user) {
  if (!user) {
    return "Siswa";
  }

  const username =
    user.username ||
    user.userName ||
    user.nama ||
    user.namaLengkap ||
    user.namalengkap ||
    user.name ||
    user.fullName ||
    user.full_name ||
    user.nama_pengguna ||
    user.namaPengguna ||
    user.siswa?.nama ||
    user.siswa?.namaLengkap ||
    user.data?.nama ||
    user.data?.namaLengkap;

  if (
    typeof username === "string" &&
    username.trim() !== ""
  ) {
    return username.trim();
  }

  return "Siswa";
}

/* =========================================================
   AMBIL USER ID
========================================================= */

function getUserId(user) {
  if (!user) {
    return "";
  }

  const userId =
    user.userId ||
    user.id ||
    user.penggunaId ||
    user.siswaId ||
    user.siswa?.id ||
    user.data?.userId ||
    user.data?.id ||
    user.data?.penggunaId ||
    user.data?.siswaId ||
    user.data?.siswa?.id ||
    "";

  return userId ? String(userId) : "";
}

/* =========================================================
   AMBIL KELAS ID DARI USER
========================================================= */

function getUserKelasId(user) {
  if (!user) {
    return "";
  }

  const kelasId =
    user.kelasId ||
    user.kelas_id ||
    user.kelas?.id ||
    user.siswa?.kelasId ||
    user.siswa?.kelas?.id ||
    user.data?.kelasId ||
    user.data?.kelas?.id ||
    user.data?.siswa?.kelasId ||
    user.data?.siswa?.kelas?.id ||
    "";

  return kelasId ? String(kelasId) : "";
}

/* =========================================================
   AMBIL NAMA KELAS USER
========================================================= */

function getUserKelasName(user) {
  if (!user) {
    return "";
  }

  const kelasName =
    user.kelas?.nama ||
    user.kelas?.namaKelas ||
    user.namaKelas ||
    user.siswa?.kelas?.nama ||
    user.siswa?.kelas?.namaKelas ||
    user.data?.kelas?.nama ||
    user.data?.kelas?.namaKelas ||
    user.data?.siswa?.kelas?.nama ||
    user.data?.siswa?.kelas?.namaKelas ||
    "";

  return typeof kelasName === "string"
    ? kelasName.trim()
    : "";
}

/* =========================================================
   INITIAL AVATAR
========================================================= */

function getInitials(name) {
  if (!name) {
    return "S";
  }

  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "S";
  }

  if (words.length === 1) {
    return words[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[words.length - 1].charAt(0)
  ).toUpperCase();
}

/* =========================================================
   NORMALIZE RESPONSE ARRAY
========================================================= */

function extractArray(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    Array.isArray(response?.data)
  ) {
    return response.data;
  }

  if (
    Array.isArray(response?.data?.data)
  ) {
    return response.data.data;
  }

  if (
    Array.isArray(response?.data?.list)
  ) {
    return response.data.list;
  }

  if (
    Array.isArray(response?.list)
  ) {
    return response.list;
  }

  if (
    Array.isArray(response?.items)
  ) {
    return response.items;
  }

  return [];
}

/* =========================================================
   NORMALIZE RESPONSE OBJECT
========================================================= */

function extractObject(response) {
  if (!response) {
    return null;
  }

  if (
    response?.data &&
    !Array.isArray(response.data)
  ) {
    if (
      response.data?.data &&
      !Array.isArray(response.data.data)
    ) {
      return response.data.data;
    }

    return response.data;
  }

  return response;
}

/* =========================================================
   TOKEN
========================================================= */

function getToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

/* =========================================================
   FETCH DETAIL KELAS LANGSUNG
========================================================= */

async function fetchKelasDetail(id) {
  if (!id) {
    return null;
  }

  try {
    const result =
      await getKelasById(id);

    return extractObject(result);
  } catch (error) {
    console.warn(
      "Gagal mengambil detail kelas:",
      id,
      error
    );

    return null;
  }
}

/* =========================================================
   CARI KELAS SISWA BERDASARKAN USER ID
========================================================= */

async function findStudentClass(
  userId,
  existingKelasId = ""
) {
  /*
   * PRIORITAS 1
   * Kalau kelasId sudah ada di user login,
   * langsung ambil detail kelas tersebut.
   */

  if (existingKelasId) {
    console.log(
      "[KELAS] Menggunakan kelasId dari user:",
      existingKelasId
    );

    const detail =
      await fetchKelasDetail(
        existingKelasId
      );

    if (detail) {
      return detail;
    }
  }

  /*
   * PRIORITAS 2
   * Ambil daftar kelas.
   */

  console.log(
    "[KELAS] kelasId belum tersedia."
  );

  console.log(
    "[KELAS] Mengambil daftar kelas..."
  );

  const kelasResponse =
    await getKelas({
      page: 1,
      limit: 100,
    });

  const daftarKelas =
    extractArray(kelasResponse);

  console.log(
    "[KELAS] Daftar kelas:",
    daftarKelas
  );

  if (
    daftarKelas.length === 0
  ) {
    throw new Error(
      "Belum ada data kelas yang tersedia."
    );
  }

  /*
   * Cari kelas yang memiliki
   * anggota siswa dengan ID yang sama
   * dengan user login.
   */

  for (
    const kelas of daftarKelas
  ) {
    if (!kelas?.id) {
      continue;
    }

    const detail =
      await fetchKelasDetail(
        kelas.id
      );

    if (!detail) {
      continue;
    }

    const anggota =
      Array.isArray(
        detail?.anggota
      )
        ? detail.anggota
        : [];

    console.log(
      `[KELAS] Cek kelas ${kelas.id}:`,
      detail.nama,
      "anggota:",
      anggota
    );

    const siswaDitemukan =
      anggota.some(
        (anggotaItem) => {
          const siswaId =
            anggotaItem?.siswa?.id ||
            anggotaItem?.siswaId ||
            anggotaItem?.penggunaId ||
            anggotaItem?.pengguna?.id ||
            "";

          return (
            String(siswaId) ===
            String(userId)
          );
        }
      );

    if (siswaDitemukan) {
      console.log(
        "=========================================="
      );

      console.log(
        "[KELAS] SISWA DITEMUKAN"
      );

      console.log(
        "[KELAS] USER ID:",
        userId
      );

      console.log(
        "[KELAS] KELAS ID:",
        detail.id
      );

      console.log(
        "[KELAS] NAMA KELAS:",
        detail.nama
      );

      console.log(
        "=========================================="
      );

      return detail;
    }
  }

  return null;
}

/* =========================================================
   NORMALISASI KELAS MAPEL
========================================================= */

function normalizeKelasMapel(
  item,
  index
) {
  const nama =
    item?.mataPelajaran?.nama ||
    item?.mataPelajaran?.namaMataPelajaran ||
    item?.namaMataPelajaran ||
    item?.namaMapel ||
    item?.nama ||
    "Mata Pelajaran";

  const guru =
    item?.guruPengajar?.namaLengkap ||
    item?.guruPengajar?.nama ||
    item?.guru?.namaLengkap ||
    item?.guru?.nama ||
    item?.guruNama ||
    "Guru belum tersedia";

  return {
    id:
      item?.id ||
      `mapel-${index}`,

    kelasId:
      item?.kelasId ||
      item?.kelas?.id ||
      "",

    nama: String(nama),

    guru: String(guru),

    kode:
      item?.mataPelajaran?.kode ||
      item?.kode ||
      "",

    icon:
      getMapelIcon(
        String(nama)
      ),

    color:
      getMapelColor(index),

    progress: 0,
  };
}

/* =========================================================
   DASHBOARD SISWA
========================================================= */

export default function SiswaDashboardPage() {
  const router = useRouter();

  const [mounted, setMounted] =
    useState(false);

  const [user, setUser] =
    useState({
      username: "",
      email: "",
      userId: "",
      sekolahId: "",
      kelasId: "",
      kelasName: "",
    });

  const [
    mataPelajaranList,
    setMataPelajaranList,
  ] = useState([]);

  const [
    loadingMapel,
    setLoadingMapel,
  ] = useState(true);

  const [
    mapelError,
    setMapelError,
  ] = useState("");

  /* =======================================================
     LOAD USER LOGIN
  ======================================================= */

  useEffect(() => {
    setMounted(true);

    try {
      const storedUser =
        localStorage.getItem("user");

      console.log(
        "========== USER LOGIN =========="
      );

      console.log(
        "localStorage.user:",
        storedUser
      );

      if (!storedUser) {
        console.warn(
          "localStorage user tidak ditemukan."
        );

        return;
      }

      const parsedUser =
        JSON.parse(storedUser);

      console.log(
        "Object user:",
        parsedUser
      );

      const username =
        getUsername(parsedUser);

      const email =
        parsedUser?.email ||
        parsedUser?.emailPengguna ||
        parsedUser?.data?.email ||
        "";

      const userId =
        getUserId(parsedUser);

      const sekolahId =
        parsedUser?.sekolahId ||
        parsedUser?.schoolId ||
        parsedUser?.data?.sekolahId ||
        "";

      const kelasId =
        getUserKelasId(
          parsedUser
        );

      const kelasName =
        getUserKelasName(
          parsedUser
        );

      const userData = {
        username,
        email,
        userId,
        sekolahId,
        kelasId,
        kelasName,
      };

      setUser(userData);

      console.log(
        "USERNAME:",
        username
      );

      console.log(
        "EMAIL:",
        email
      );

      console.log(
        "USER ID:",
        userId
      );

      console.log(
        "SEKOLAH ID:",
        sekolahId
      );

      console.log(
        "KELAS ID:",
        kelasId
      );

      console.log(
        "NAMA KELAS:",
        kelasName
      );

      console.log(
        "================================"
      );
    } catch (error) {
      console.error(
        "Gagal membaca user login:",
        error
      );
    }
  }, []);

  /* =======================================================
     LOAD MAPEL SESUAI SISWA LOGIN
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadMataPelajaran() {
      try {
        setLoadingMapel(true);
        setMapelError("");

        const storedUser =
          localStorage.getItem("user");

        const token =
          getToken();

        if (!storedUser) {
          throw new Error(
            "Data pengguna belum ditemukan. Silakan login kembali."
          );
        }

        if (!token) {
          throw new Error(
            "Token login tidak ditemukan. Silakan login kembali."
          );
        }

        const parsedUser =
          JSON.parse(
            storedUser
          );

        /* =================================================
           AMBIL USER ID SISWA LOGIN
        ================================================= */

        const userId =
          getUserId(
            parsedUser
          );

        if (!userId) {
          throw new Error(
            "ID siswa tidak ditemukan dari akun yang sedang login."
          );
        }

        /*
         * Kalau user sudah punya kelasId,
         * gunakan langsung.
         */

        const existingKelasId =
          getUserKelasId(
            parsedUser
          );

        console.log(
          "=========================================="
        );

        console.log(
          "[MAPEL] USER LOGIN:",
          parsedUser
        );

        console.log(
          "[MAPEL] USER ID:",
          userId
        );

        console.log(
          "[MAPEL] KELAS ID DARI USER:",
          existingKelasId
        );

        /* =================================================
           CARI KELAS SISWA
        ================================================= */

        const kelasSiswa =
          await findStudentClass(
            userId,
            existingKelasId
          );

        if (cancelled) {
          return;
        }

        if (!kelasSiswa) {
          throw new Error(
            "Kelas siswa tidak ditemukan. Pastikan siswa sudah dimasukkan ke kelas oleh Admin Sekolah."
          );
        }

        const kelasId =
          String(
            kelasSiswa.id
          );

        const kelasName =
          kelasSiswa.nama ||
          kelasSiswa.namaKelas ||
          "Kelas siswa";

        console.log(
          "[MAPEL] KELAS SISWA:",
          kelasSiswa
        );

        console.log(
          "[MAPEL] KELAS ID FINAL:",
          kelasId
        );

        console.log(
          "[MAPEL] NAMA KELAS FINAL:",
          kelasName
        );

        /* =================================================
           UPDATE DATA USER
        ================================================= */

        setUser(
          (previous) => ({
            ...previous,
            kelasId,
            kelasName,
          })
        );

        /* =================================================
           AMBIL KELAS MAPEL
        ================================================= */

        const kelasMapelResponse =
          await getKelasMapel();

        if (cancelled) {
          return;
        }

        console.log(
          "[MAPEL] SEMUA KELAS MAPEL:",
          kelasMapelResponse
        );

        if (
          !Array.isArray(
            kelasMapelResponse
          )
        ) {
          throw new Error(
            "Data kelas-mapel dari server tidak valid."
          );
        }

        /* =================================================
           FILTER MAPEL BERDASARKAN KELAS SISWA
        ================================================= */

        const filteredData =
          kelasMapelResponse.filter(
            (item) => {
              const itemKelasId =
                item?.kelasId ||
                item?.kelas?.id ||
                "";

              return (
                String(
                  itemKelasId
                ) ===
                String(
                  kelasId
                )
              );
            }
          );

        console.log(
          "[MAPEL] MAPEL SESUAI KELAS:",
          filteredData
        );

        /* =================================================
           FALLBACK DARI DETAIL KELAS
           
           GET /api/kelas/:id
           juga mengembalikan kelasMapel.
           
           Jadi kalau endpoint GET /api/kelas-mapel
           tidak mengembalikan data yang sesuai,
           kita tetap mengambil dari detail kelas.
        ================================================= */

        let finalData =
          filteredData;

        if (
          finalData.length === 0 &&
          Array.isArray(
            kelasSiswa?.kelasMapel
          )
        ) {
          console.log(
            "[MAPEL] Menggunakan kelasMapel dari detail kelas."
          );

          finalData =
            kelasSiswa.kelasMapel.filter(
              (item) => {
                const itemKelasId =
                  item?.kelasId ||
                  item?.kelas?.id ||
                  kelasId;

                return (
                  String(
                    itemKelasId
                  ) ===
                  String(
                    kelasId
                  )
                );
              }
            );
        }

        /* =================================================
           NORMALISASI MAPEL
        ================================================= */

        const normalizedData =
          finalData.map(
            (item, index) =>
              normalizeKelasMapel(
                item,
                index
              )
          );

        console.log(
          "[MAPEL] HASIL FINAL:",
          normalizedData
        );

        if (!cancelled) {
          setMataPelajaranList(
            normalizedData
          );

          if (
            normalizedData.length ===
            0
          ) {
            setMapelError(
              `Belum ada mata pelajaran yang terhubung dengan kelas ${kelasName}.`
            );
          }
        }

        console.log(
          "=========================================="
        );
      } catch (error) {
        console.error(
          "[MAPEL] GAGAL:",
          error
        );

        if (!cancelled) {
          setMataPelajaranList([]);

          setMapelError(
            error?.message ||
              "Gagal mengambil data mata pelajaran dari server."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingMapel(false);
        }
      }
    }

    loadMataPelajaran();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     DISPLAY USER
  ======================================================= */

  const username =
    user.username ||
    "Siswa";

  const email =
    user.email ||
    "Akun siswa";

  const avatar =
    getInitials(username);

  /* =======================================================
     QUICK STATS
  ======================================================= */

  const quickStats = [
    {
      title: "Kehadiran",
      value: "92%",
      description: "Bulan ini",
      icon: ClipboardCheck,
      iconClass:
        "bg-emerald-50 text-emerald-600",
      valueClass:
        "text-emerald-600",
    },

    {
      title: "Tugas Belum Selesai",
      value: "3",
      description: "Perlu dikerjakan",
      icon: ClipboardList,
      iconClass:
        "bg-amber-50 text-amber-600",
      valueClass:
        "text-amber-600",
    },

    {
      title: "Ujian Mendatang",
      value: "2",
      description: "Dalam waktu dekat",
      icon: CalendarDays,
      iconClass:
        "bg-[#EAF1FF] text-[#155DFC]",
      valueClass:
        "text-[#155DFC]",
    },
  ];

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar
        role="siswa"
        activeMenu="dashboard"
      />

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="shrink-0">
          <Header
            user={{
              name: username,
              email: email,
              avatar: avatar,
            }}
          />
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">

          <div
            className={`mx-auto w-full max-w-[1600px] space-y-6 transition-all duration-700 ${
              mounted
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >

            {/* =================================================
                HERO
            ================================================= */}

            <section className="relative isolate overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">

              <div className="absolute inset-0 -z-30 bg-gradient-to-br from-white via-[#EAF1FF]/60 to-white" />

              <div className="absolute -right-24 -top-28 -z-20 h-80 w-80 rounded-full bg-[#155DFC]/10 blur-3xl" />

              <div className="absolute -bottom-32 right-[20%] -z-20 h-80 w-80 rounded-full bg-[#2563EB]/8 blur-3xl" />

              <div className="absolute left-[10%] top-[-40%] -z-20 h-96 w-96 rounded-full bg-[#155DFC]/5 blur-3xl" />

              {/* DECORATION */}

              <div className="pointer-events-none absolute inset-0 overflow-hidden">

                <div className="absolute -right-12 top-8 h-40 w-40 rounded-2xl border border-white/20 bg-white/20 shadow-2xl backdrop-blur-xl" />

                <div className="absolute bottom-12 right-[30%] h-28 w-28 rounded-2xl border border-white/20 bg-white/20 shadow-2xl backdrop-blur-xl" />

                <div className="absolute left-[15%] top-[60%] h-20 w-20 rounded-full border border-white/20 bg-white/20 shadow-2xl backdrop-blur-xl" />

                <span className="absolute right-[35%] top-[20%] h-2 w-2 rounded-full bg-[#155DFC]/40" />

                <span className="absolute right-[15%] top-[45%] h-3 w-3 rounded-full bg-[#2563EB]/30" />

                <span className="absolute left-[25%] top-[30%] h-2 w-2 rounded-full bg-[#155DFC]/30" />

                {/* SCHOOL BUILDING */}

                <div className="absolute bottom-0 right-4 hidden h-[90%] w-[400px] lg:block">

                  <div className="absolute bottom-0 left-0 h-4 w-full rounded-full bg-[#0D47C9]/5" />

                  <div className="absolute bottom-0 left-10 h-[75%] w-[280px] rounded-t-xl border border-[#155DFC]/15 bg-white/80 shadow-[0_20px_60px_rgba(21,93,252,0.10)] backdrop-blur-md">

                    <div className="absolute -top-7 left-[-16px] h-8 w-[312px] rounded-t-lg bg-gradient-to-r from-[#155DFC] to-[#0D47C9] shadow-lg" />

                    <div className="absolute -top-2 left-0 h-1 w-full bg-white/30" />

                    <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-md border border-[#155DFC]/10 bg-white/90 px-4 py-1.5 shadow-sm backdrop-blur">

                      <div className="flex items-center gap-1.5">

                        <School
                          size={11}
                          className="text-[#155DFC]"
                        />

                        <span className="whitespace-nowrap text-[8px] font-bold tracking-[0.18em] text-[#0D47C9]">
                          SMART SCHOOL
                        </span>

                      </div>

                    </div>

                    <div className="absolute left-7 top-16 grid grid-cols-4 gap-5">

                      {Array.from({
                        length: 8,
                      }).map(
                        (_, index) => (
                          <div
                            key={index}
                            className="h-9 w-8 rounded-md border border-[#155DFC]/10 bg-[#EAF1FF]/80 shadow-inner"
                          >
                            <div className="mx-auto mt-2 h-4 w-4 rounded-sm bg-[#155DFC]/15" />
                          </div>
                        )
                      )}

                    </div>

                    <div className="absolute bottom-0 left-1/2 h-28 w-20 -translate-x-1/2 rounded-t-xl border-x border-t border-[#155DFC]/10 bg-[#EAF1FF]/80">

                      <div className="absolute bottom-0 left-1/2 h-20 w-12 -translate-x-1/2 rounded-t-lg bg-[#155DFC]/15" />

                      <div className="absolute bottom-9 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#155DFC]/60" />

                    </div>

                  </div>

                  <div className="absolute bottom-0 right-0 h-[50%] w-20 rounded-t-lg border border-[#155DFC]/10 bg-white/70 backdrop-blur-sm">

                    <div className="absolute -top-4 left-0 h-5 w-full rounded-t-md bg-[#155DFC]/70" />

                    <div className="mt-8 grid gap-4 px-3">

                      {Array.from({
                        length: 3,
                      }).map(
                        (_, index) => (
                          <div
                            key={index}
                            className="h-7 rounded border border-[#155DFC]/10 bg-[#EAF1FF]/60"
                          />
                        )
                      )}

                    </div>

                  </div>

                  <div className="absolute bottom-[75%] left-2">

                    <div className="h-20 w-px bg-slate-400/60" />

                    <div className="absolute left-0 top-0 h-7 w-11 rounded-r-sm bg-[#155DFC]/80" />

                  </div>

                  <div className="absolute bottom-0 left-0">

                    <div className="mx-auto h-16 w-1.5 rounded-full bg-emerald-700/40" />

                    <div className="-mt-12 h-16 w-16 rounded-full bg-emerald-100/80" />

                  </div>

                  <div className="absolute bottom-0 right-[-30px]">

                    <div className="mx-auto h-14 w-1.5 rounded-full bg-emerald-700/35" />

                    <div className="-mt-10 h-14 w-14 rounded-full bg-emerald-100/70" />

                  </div>

                </div>

              </div>

              {/* HERO CONTENT */}

              <div className="relative z-10 px-5 py-7 sm:px-7 sm:py-8 lg:px-9 lg:py-10">

                <div className="max-w-2xl">

                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur">

                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF1FF] text-[#155DFC]">

                      <School size={14} />

                    </div>

                    <span className="text-xs font-semibold tracking-wide text-[#0D47C9]">
                      SMARTSCHOOL STUDENT
                    </span>

                    <span className="h-1 w-1 rounded-full bg-[#155DFC]/40" />

                    <span className="text-xs font-medium text-slate-500">
                      Siswa
                    </span>

                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl lg:text-4xl">

                    <span>
                      Selamat datang kembali,
                    </span>

                    <span className="mt-1 block bg-gradient-to-r from-[#155DFC] to-[#0D47C9] bg-clip-text text-transparent">
                      {username}
                    </span>

                  </h1>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                    Pantau pembelajaran, tugas, kehadiran,
                    dan perkembangan akademikmu dalam satu tempat.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">

                    <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">

                      <GraduationCap
                        size={15}
                        className="text-[#155DFC]"
                      />

                      {user.kelasName
                        ? `Kelas ${user.kelasName}`
                        : "Kelas siswa"}

                    </div>

                    <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">

                      <GraduationCap
                        size={15}
                        className="text-[#155DFC]"
                      />

                      Tahun Ajaran 2026/2027

                    </div>

                    <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">

                      <Sparkles
                        size={14}
                        className="text-[#155DFC]"
                      />

                      Semangat belajar hari ini

                    </div>

                  </div>

                </div>

              </div>

              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[#0D47C9] via-[#155DFC] to-[#2563EB]" />

            </section>

            {/* =================================================
                QUICK STATS
            ================================================= */}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

              {quickStats.map(
                (stat) => {
                  const Icon =
                    stat.icon;

                  return (
                    <div
                      key={
                        stat.title
                      }
                      className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-lg"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">

                          <p className="text-sm font-medium text-slate-500">
                            {stat.title}
                          </p>

                          <div className="mt-2 flex items-end gap-2">

                            <span
                              className={`text-2xl font-bold ${stat.valueClass}`}
                            >
                              {stat.value}
                            </span>

                            <span className="mb-1 text-xs font-medium text-slate-400">
                              {stat.description}
                            </span>

                          </div>

                        </div>

                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}
                        >
                          <Icon
                            size={20}
                          />
                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </section>

            {/* =================================================
                MATA PELAJARAN
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

              {/* HEADER */}

              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#155DFC]">

                      <BookOpen
                        size={19}
                      />

                    </div>

                    <div>

                      <h2 className="text-lg font-bold text-slate-800">
                        Mata Pelajaran
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">

                        {user.kelasName
                          ? `Mata pelajaran untuk kelas ${user.kelasName}`
                          : "Mata pelajaran sesuai kelasmu"}

                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/siswa/mataPelajaran"
                      )
                    }
                    className="group inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-[#155DFC]/20 hover:bg-[#EAF1FF] hover:text-[#155DFC]"
                  >

                    Lihat semua

                    <ArrowUpRight
                      size={15}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />

                  </button>

                </div>

              </div>

              {/* CONTENT */}

              <div className="p-5 sm:p-6">

                {/* LOADING */}

                {loadingMapel && (
                  <div className="flex min-h-[220px] flex-col items-center justify-center">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF1FF]">

                      <Loader2
                        size={22}
                        className="animate-spin text-[#155DFC]"
                      />

                    </div>

                    <p className="mt-4 text-sm font-medium text-slate-600">
                      Memuat mata pelajaran...
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Mencari kelas siswa dan mengambil mata pelajaran dari server
                    </p>

                  </div>
                )}

                {/* ERROR */}

                {!loadingMapel &&
                  mapelError &&
                  mataPelajaranList.length ===
                    0 && (
                    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center">

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-500">

                        <AlertCircle
                          size={22}
                        />

                      </div>

                      <h3 className="mt-4 text-sm font-bold text-slate-700">
                        Data mata pelajaran belum tersedia
                      </h3>

                      <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                        {mapelError}
                      </p>

                    </div>
                  )}

                {/* EMPTY */}

                {!loadingMapel &&
                  !mapelError &&
                  mataPelajaranList.length ===
                    0 && (
                    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center">

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF1FF] text-[#155DFC]">

                        <BookOpen
                          size={22}
                        />

                      </div>

                      <h3 className="mt-4 text-sm font-bold text-slate-700">
                        Belum ada mata pelajaran
                      </h3>

                      <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                        Belum ada mata pelajaran yang terhubung dengan kelas kamu.
                      </p>

                    </div>
                  )}

                {/* MAPEL */}

                {!loadingMapel &&
                  mataPelajaranList.length >
                    0 && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                      {mataPelajaranList.map(
                        (mapel) => {
                          const Icon =
                            mapel.icon;

                          const colors =
                            colorMap[
                              mapel.color
                            ] ||
                            colorMap.blue;

                          return (
                            <button
                              key={
                                mapel.id
                              }
                              type="button"
                              onClick={() =>
                                router.push(
                                  "/siswa/mataPelajaran"
                                )
                              }
                              className={`
                                group
                                relative
                                overflow-hidden
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                p-4
                                text-left
                                shadow-sm
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:shadow-xl
                                hover:ring-4
                                ${colors.ring}
                                ${colors.border}
                              `}
                            >

                              <div className="flex items-start justify-between gap-3">

                                <div
                                  className={`
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-gradient-to-br
                                    text-white
                                    shadow-md
                                    transition-transform
                                    duration-300
                                    group-hover:scale-105
                                    ${colors.icon}
                                  `}
                                >

                                  <Icon
                                    size={20}
                                  />

                                </div>

                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-[#EAF1FF] group-hover:text-[#155DFC]">

                                  <ChevronRight
                                    size={16}
                                  />

                                </div>

                              </div>

                              <div className="mt-5">

                                <h3 className="truncate text-sm font-bold text-slate-800">
                                  {mapel.nama}
                                </h3>

                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {mapel.guru}
                                </p>

                                {mapel.kode && (
                                  <span className="mt-2 inline-flex rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                                    {mapel.kode}
                                  </span>
                                )}

                              </div>

                              <div className="mt-5">

                                <div className="mb-2 flex items-center justify-between">

                                  <span className="text-[11px] font-medium text-slate-400">
                                    Progress pembelajaran
                                  </span>

                                  <span className="text-xs font-bold text-slate-600">
                                    {mapel.progress}%
                                  </span>

                                </div>

                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">

                                  <div
                                    className={`h-full rounded-full ${colors.progress}`}
                                    style={{
                                      width: `${mapel.progress}%`,
                                    }}
                                  />

                                </div>

                              </div>

                            </button>
                          );
                        }
                      )}

                    </div>
                  )}

              </div>

              {/* FOOTER */}

              <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 sm:px-6">

                <div className="flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

                  <span>
                    Menampilkan{" "}
                    <strong className="font-semibold text-slate-700">
                      {
                        mataPelajaranList.length
                      }
                    </strong>{" "}
                    mata pelajaran
                  </span>

                  <span className="font-medium text-slate-400">

                    {user.kelasName
                      ? `Kelas ${user.kelasName}`
                      : "Data pembelajaran semester berjalan"}

                  </span>

                </div>

              </div>

            </section>

          </div>

        </main>

      </div>

      {/* =================================================
          ANIMATION
      ================================================= */}

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
          }

          50% {
            opacity: 0.8;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

    </div>
  );
}