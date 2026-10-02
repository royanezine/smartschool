"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getKelasMapel } from "@/services/kelasMapel.service";
import {
  getKelas,
  getKelasById,
} from "@/services/kelas.service";

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

/*
 * API_URL tetap disiapkan karena kemungkinan digunakan
 * oleh service / pengembangan berikutnya.
 */
void API_URL;

/* =========================================================
   GLOBAL THEME HELPERS
========================================================= */

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

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

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

/* =========================================================
   THEME MATA PELAJARAN
========================================================= */

const subjectThemes = [
  {
    surface:
      "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",

    text:
      "text-[var(--color-primary)]",

    progress:
      "bg-[var(--color-primary)]",

    hover:
      "group-hover:border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)] group-hover:ring-2 group-hover:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]",
  },

  {
    surface:
      "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",

    text:
      "text-[var(--color-success)]",

    progress:
      "bg-[var(--color-success)]",

    hover:
      "group-hover:border-[color-mix(in_srgb,var(--color-success)_25%,transparent)] group-hover:ring-2 group-hover:ring-[color-mix(in_srgb,var(--color-success)_12%,transparent)]",
  },

  {
    surface:
      "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]",

    text:
      "text-[var(--color-warning)]",

    progress:
      "bg-[var(--color-warning)]",

    hover:
      "group-hover:border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)] group-hover:ring-2 group-hover:ring-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]",
  },

  {
    surface:
      "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",

    text:
      "text-[var(--color-info)]",

    progress:
      "bg-[var(--color-info)]",

    hover:
      "group-hover:border-[color-mix(in_srgb,var(--color-info)_25%,transparent)] group-hover:ring-2 group-hover:ring-[color-mix(in_srgb,var(--color-info)_12%,transparent)]",
  },

  {
    surface:
      "bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)]",

    text:
      "text-[var(--color-primary)]",

    progress:
      "bg-[color-mix(in_srgb,var(--color-primary)_78%,var(--color-info))]",

    hover:
      "group-hover:border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)] group-hover:ring-2 group-hover:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
  },

  {
    surface:
      "bg-[color-mix(in_srgb,var(--color-info)_7%,transparent)]",

    text:
      "text-[var(--color-info)]",

    progress:
      "bg-[color-mix(in_srgb,var(--color-info)_82%,var(--color-primary))]",

    hover:
      "group-hover:border-[color-mix(in_srgb,var(--color-info)_22%,transparent)] group-hover:ring-2 group-hover:ring-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",
  },
];

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
   THEME MATA PELAJARAN
========================================================= */

function getMapelTheme(index) {
  return subjectThemes[
    index % subjectThemes.length
  ];
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
   AMBIL KELAS ID
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
   AMBIL NAMA KELAS
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
   EXTRACT ARRAY
========================================================= */

function extractArray(response) {
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

/* =========================================================
   EXTRACT OBJECT
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
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt") ||
    ""
  );
}

/* =========================================================
   FETCH DETAIL KELAS
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
   CARI KELAS SISWA
========================================================= */

async function findStudentClass(
  userId,
  existingKelasId = ""
) {
  /* -------------------------------------------------------
     PRIORITAS 1:
     kelasId sudah tersedia di user
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     PRIORITAS 2:
     Ambil semua kelas
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     CARI SISWA DI SETIAP KELAS
  ------------------------------------------------------- */

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
        "[KELAS] SISWA DITEMUKAN:",
        detail.nama
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

    theme:
      getMapelTheme(index),

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

      if (!storedUser) {
        console.warn(
          "localStorage user tidak ditemukan."
        );

        return;
      }

      const parsedUser =
        JSON.parse(storedUser);

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

      setUser({
        username,
        email,
        userId,
        sekolahId,
        kelasId,
        kelasName,
      });
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
          JSON.parse(storedUser);

        const userId =
          getUserId(parsedUser);

        if (!userId) {
          throw new Error(
            "ID siswa tidak ditemukan dari akun yang sedang login."
          );
        }

        const existingKelasId =
          getUserKelasId(
            parsedUser
          );

        /* -------------------------------------------------
           CARI KELAS SISWA
        ------------------------------------------------- */

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

        /* -------------------------------------------------
           UPDATE USER
        ------------------------------------------------- */

        setUser(
          (previous) => ({
            ...previous,
            kelasId,
            kelasName,
          })
        );

        /* -------------------------------------------------
           AMBIL SEMUA KELAS MAPEL
        ------------------------------------------------- */

        const kelasMapelResponse =
          await getKelasMapel();

        if (cancelled) {
          return;
        }

        if (
          !Array.isArray(
            kelasMapelResponse
          )
        ) {
          throw new Error(
            "Data kelas-mapel dari server tidak valid."
          );
        }

        /* -------------------------------------------------
           FILTER BERDASARKAN KELAS SISWA
        ------------------------------------------------- */

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

        /* -------------------------------------------------
           FALLBACK DETAIL KELAS
        ------------------------------------------------- */

        let finalData =
          filteredData;

        if (
          finalData.length === 0 &&
          Array.isArray(
            kelasSiswa?.kelasMapel
          )
        ) {
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

        /* -------------------------------------------------
           NORMALISASI
        ------------------------------------------------- */

        const normalizedData =
          finalData.map(
            (item, index) =>
              normalizeKelasMapel(
                item,
                index
              )
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

  /* =======================================================
     QUICK STATS
  ======================================================= */

  const quickStats = [
    {
      title: "Kehadiran",
      value: "92%",
      description: "Bulan ini",
      icon: ClipboardCheck,
      iconSurface:
        themeSuccessSurface,
      iconText:
        "text-[var(--color-success)]",
      valueText:
        "text-[var(--color-success)]",
    },

    {
      title: "Tugas Belum Selesai",
      value: "3",
      description: "Perlu dikerjakan",
      icon: ClipboardList,
      iconSurface:
        themeWarningSurface,
      iconText:
        "text-[var(--color-warning)]",
      valueText:
        "text-[var(--color-warning)]",
    },

    {
      title: "Ujian Mendatang",
      value: "2",
      description: "Dalam waktu dekat",
      icon: CalendarDays,
      iconSurface:
        themePrimarySoft,
      iconText:
        "text-[var(--color-primary)]",
      valueText:
        "text-[var(--color-primary)]",
    },
  ];

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="theme-page min-h-full w-full">
      <div
        className={`
          mx-auto
          w-full
          max-w-[1600px]
          space-y-6
          p-4
          transition-all
          duration-700
          sm:p-6
          lg:p-8
          ${
            mounted
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }
        `}
      >

        {/* =================================================
            HERO
        ================================================= */}

        <section
          className={`
            theme-card
            relative
            isolate
            overflow-hidden
            rounded-2xl
            border
            ${themeNeutralBorder}
            ${themeCardShadow}
          `}
        >
          {/* BACKGROUND */}

          <div
            className={`
              absolute
              inset-0
              -z-30
              ${themePrimarySoft}
            `}
          />

          <div
            className="
              absolute
              -right-24
              -top-28
              -z-20
              h-80
              w-80
              rounded-full
              bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
              blur-3xl
            "
          />

          <div
            className="
              absolute
              -bottom-32
              right-[20%]
              -z-20
              h-80
              w-80
              rounded-full
              bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]
              blur-3xl
            "
          />

          <div
            className="
              absolute
              left-[10%]
              top-[-40%]
              -z-20
              h-96
              w-96
              rounded-full
              bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]
              blur-3xl
            "
          />

          {/* DECORATION */}

          <div className="pointer-events-none absolute inset-0 overflow-hidden">

            <div
              className="
                absolute
                -right-12
                top-8
                h-40
                w-40
                rounded-2xl
                border
                border-[color-mix(in_srgb,var(--color-card)_25%,transparent)]
                bg-[color-mix(in_srgb,var(--color-card)_20%,transparent)]
                shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_8%,transparent)]
                backdrop-blur-xl
              "
            />

            <div
              className="
                absolute
                bottom-12
                right-[30%]
                h-28
                w-28
                rounded-2xl
                border
                border-[color-mix(in_srgb,var(--color-card)_25%,transparent)]
                bg-[color-mix(in_srgb,var(--color-card)_20%,transparent)]
                shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_8%,transparent)]
                backdrop-blur-xl
              "
            />

            <div
              className="
                absolute
                left-[15%]
                top-[60%]
                h-20
                w-20
                rounded-full
                border
                border-[color-mix(in_srgb,var(--color-card)_25%,transparent)]
                bg-[color-mix(in_srgb,var(--color-card)_20%,transparent)]
                shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_8%,transparent)]
                backdrop-blur-xl
              "
            />

            <span
              className="
                absolute
                right-[35%]
                top-[20%]
                h-2
                w-2
                rounded-full
                bg-[color-mix(in_srgb,var(--color-primary)_40%,transparent)]
              "
            />

            <span
              className="
                absolute
                right-[15%]
                top-[45%]
                h-3
                w-3
                rounded-full
                bg-[color-mix(in_srgb,var(--color-info)_30%,transparent)]
              "
            />

            <span
              className="
                absolute
                left-[25%]
                top-[30%]
                h-2
                w-2
                rounded-full
                bg-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]
              "
            />

            {/* SCHOOL */}

            <div className="absolute bottom-0 right-4 hidden h-[90%] w-[400px] lg:block">

              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  h-4
                  w-full
                  rounded-full
                  bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]
                "
              />

              <div
                className="
                  absolute
                  bottom-0
                  left-10
                  h-[75%]
                  w-[280px]
                  rounded-t-xl
                  border
                  border-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]
                  bg-[color-mix(in_srgb,var(--color-card)_80%,transparent)]
                  shadow-[0_20px_60px_color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                  backdrop-blur-md
                "
              >

                <div
                  className={`
                    absolute
                    -top-7
                    left-[-16px]
                    h-8
                    w-[312px]
                    rounded-t-lg
                    ${themePrimaryGradient}
                  `}
                />

                <div
                  className="
                    absolute
                    left-1/2
                    top-3
                    -translate-x-1/2
                    rounded-md
                    border
                    border-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                    bg-[color-mix(in_srgb,var(--color-card)_90%,transparent)]
                    px-4
                    py-1.5
                    shadow-sm
                    backdrop-blur
                  "
                >
                  <div className="flex items-center gap-1.5">
                    <School
                      size={11}
                      className={themePrimaryText}
                    />

                    <span
                      className="
                        whitespace-nowrap
                        text-[8px]
                        font-bold
                        tracking-[0.18em]
                        text-[var(--color-primary)]
                      "
                    >
                      SMART SCHOOL
                    </span>
                  </div>
                </div>

                <div className="absolute left-7 top-16 grid grid-cols-4 gap-5">
                  {Array.from({
                    length: 8,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="
                        h-9
                        w-8
                        rounded-md
                        border
                        border-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                        bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]
                        shadow-inner
                      "
                    >
                      <div
                        className="
                          mx-auto
                          mt-2
                          h-4
                          w-4
                          rounded-sm
                          bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]
                        "
                      />
                    </div>
                  ))}
                </div>

                <div
                  className="
                    absolute
                    bottom-0
                    left-1/2
                    h-28
                    w-20
                    -translate-x-1/2
                    rounded-t-xl
                    border-x
                    border-t
                    border-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                    bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]
                  "
                >
                  <div
                    className="
                      absolute
                      bottom-0
                      left-1/2
                      h-20
                      w-12
                      -translate-x-1/2
                      rounded-t-lg
                      bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]
                    "
                  />
                </div>
              </div>

              <div
                className="
                  absolute
                  bottom-0
                  right-0
                  h-[50%]
                  w-20
                  rounded-t-lg
                  border
                  border-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                  bg-[color-mix(in_srgb,var(--color-card)_70%,transparent)]
                  backdrop-blur-sm
                "
              >
                <div
                  className="
                    absolute
                    -top-4
                    left-0
                    h-5
                    w-full
                    rounded-t-md
                    bg-[color-mix(in_srgb,var(--color-primary)_70%,transparent)]
                  "
                />

                <div className="mt-8 grid gap-4 px-3">
                  {Array.from({
                    length: 3,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="
                        h-7
                        rounded
                        border
                        border-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                        bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)]
                      "
                    />
                  ))}
                </div>
              </div>

              <div className="absolute bottom-0 left-0">
                <div
                  className="
                    mx-auto
                    h-16
                    w-1.5
                    rounded-full
                    bg-[color-mix(in_srgb,var(--color-success)_40%,transparent)]
                  "
                />

                <div
                  className="
                    -mt-12
                    h-16
                    w-16
                    rounded-full
                    bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)]
                  "
                />
              </div>

              <div className="absolute bottom-0 right-[-30px]">
                <div
                  className="
                    mx-auto
                    h-14
                    w-1.5
                    rounded-full
                    bg-[color-mix(in_srgb,var(--color-success)_35%,transparent)]
                  "
                />

                <div
                  className="
                    -mt-10
                    h-14
                    w-14
                    rounded-full
                    bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]
                  "
                />
              </div>

            </div>
          </div>

          {/* HERO CONTENT */}

          <div className="relative z-10 px-5 py-7 sm:px-7 sm:py-8 lg:px-9 lg:py-10">

            <div className="max-w-2xl">

              <div
                className="
                  mb-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                  bg-[color-mix(in_srgb,var(--color-card)_95%,transparent)]
                  px-3
                  py-1.5
                  shadow-sm
                  backdrop-blur
                "
              >
                <div
                  className={`
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-full
                    ${themePrimarySoft}
                    ${themePrimaryText}
                  `}
                >
                  <School size={14} />
                </div>

                <span
                  className="
                    text-xs
                    font-semibold
                    tracking-wide
                    text-[var(--color-primary)]
                  "
                >
                  SMARTSCHOOL STUDENT
                </span>

                <span
                  className="
                    h-1
                    w-1
                    rounded-full
                    bg-[color-mix(in_srgb,var(--color-primary)_40%,transparent)]
                  "
                />

                <span className="theme-text-secondary text-xs font-medium">
                  Siswa
                </span>
              </div>

              <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                <span>
                  Selamat datang kembali,
                </span>

                <span
                  className="
                    mt-1
                    block
                    bg-[linear-gradient(90deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_70%,var(--color-info)))]
                    bg-clip-text
                    text-transparent
                  "
                >
                  {username}
                </span>
              </h1>

              <p className="theme-text-secondary mt-3 max-w-xl text-sm leading-6 sm:text-base">
                Pantau pembelajaran, tugas, kehadiran,
                dan perkembangan akademikmu dalam satu tempat.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">

                <div
                  className={`
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    border
                    ${themeNeutralBorder}
                    ${themeCardShadow}
                    bg-[color-mix(in_srgb,var(--color-card)_90%,transparent)]
                    px-3
                    py-2
                    text-xs
                    font-medium
                    theme-text-secondary
                  `}
                >
                  <GraduationCap
                    size={15}
                    className={themePrimaryText}
                  />

                  {user.kelasName
                    ? `Kelas ${user.kelasName}`
                    : "Kelas siswa"}
                </div>

                <div
                  className="
                    theme-text-secondary
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    border
                    border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                    bg-[color-mix(in_srgb,var(--color-card)_90%,transparent)]
                    px-3
                    py-2
                    text-xs
                    font-medium
                    shadow-sm
                  "
                >
                  <GraduationCap
                    size={15}
                    className={themePrimaryText}
                  />

                  Tahun Ajaran 2026/2027
                </div>

                <div
                  className="
                    theme-text-secondary
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    border
                    border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                    bg-[color-mix(in_srgb,var(--color-card)_90%,transparent)]
                    px-3
                    py-2
                    text-xs
                    font-medium
                    shadow-sm
                  "
                >
                  <Sparkles
                    size={14}
                    className={themePrimaryText}
                  />

                  Semangat belajar hari ini
                </div>

              </div>
            </div>
          </div>

          <div
            className="
              absolute
              bottom-0
              left-0
              h-1
              w-full
              bg-[linear-gradient(90deg,var(--color-primary),var(--color-info))]
            "
          />
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
                  key={stat.title}
                  className={`
                    theme-card
                    group
                    relative
                    overflow-hidden
                    rounded-xl
                    border
                    ${themeNeutralBorder}
                    p-5
                    ${themeCardShadow}
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]
                    hover:shadow-[0_10px_30px_color-mix(in_srgb,var(--color-text)_10%,transparent)]
                  `}
                >
                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0">
                      <p className="theme-text-secondary text-sm font-medium">
                        {stat.title}
                      </p>

                      <div className="mt-2 flex items-end gap-2">
                        <span
                          className={`text-2xl font-bold ${stat.valueText}`}
                        >
                          {stat.value}
                        </span>

                        <span className="theme-text-muted mb-1 text-xs font-medium">
                          {stat.description}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        ${stat.iconSurface}
                        ${stat.iconText}
                      `}
                    >
                      <Icon size={20} />
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

        <section
          className={`
            theme-card
            overflow-hidden
            rounded-2xl
            border
            ${themeNeutralBorder}
            ${themeCardShadow}
          `}
        >

          {/* HEADER */}

          <div
            className={`
              border-b
              ${themeDivider}
              px-5
              py-5
              sm:px-6
            `}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div
                  className={`
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    ${themePrimarySoft}
                    ${themePrimaryText}
                  `}
                >
                  <BookOpen size={19} />
                </div>

                <div>
                  <h2 className="theme-text text-lg font-bold">
                    Mata Pelajaran
                  </h2>

                  <p className="theme-text-secondary mt-0.5 text-xs">
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
                className={`
                  group
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  ${themeNeutralBorder}
                  theme-card
                  px-3.5
                  py-2
                  text-sm
                  font-semibold
                  theme-text-secondary
                  transition-all
                  ${themeNeutralHover}
                  hover:border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]
                  hover:text-[var(--color-primary)]
                `}
              >
                Lihat semua

                <ArrowUpRight
                  size={15}
                  className="
                    transition-transform
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                  "
                />
              </button>

            </div>
          </div>

          {/* CONTENT */}

          <div className="p-5 sm:p-6">

            {/* LOADING */}

            {loadingMapel && (
              <div className="flex min-h-[220px] flex-col items-center justify-center">

                <div
                  className={`
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    ${themePrimarySoft}
                    ${themePrimaryText}
                  `}
                >
                  <Loader2
                    size={22}
                    className="animate-spin"
                  />
                </div>

                <p className="theme-text mt-4 text-sm font-medium">
                  Memuat mata pelajaran...
                </p>

                <p className="theme-text-muted mt-1 text-center text-xs">
                  Mencari kelas siswa dan mengambil mata pelajaran dari server
                </p>
              </div>
            )}

            {/* ERROR */}

            {!loadingMapel &&
              mapelError &&
              mataPelajaranList.length === 0 && (
                <div
                  className={`
                    flex
                    min-h-[220px]
                    flex-col
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-dashed
                    ${themeWarningBorder}
                    ${themeWarningSurface}
                    px-5
                    text-center
                  `}
                >
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)]
                      text-[var(--color-warning)]
                    "
                  >
                    <AlertCircle size={22} />
                  </div>

                  <h3 className="theme-text mt-4 text-sm font-bold">
                    Data mata pelajaran belum tersedia
                  </h3>

                  <p className="theme-text-secondary mt-1 max-w-md text-xs leading-5">
                    {mapelError}
                  </p>
                </div>
              )}

            {/* EMPTY */}

            {!loadingMapel &&
              !mapelError &&
              mataPelajaranList.length === 0 && (
                <div
                  className={`
                    flex
                    min-h-[220px]
                    flex-col
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-dashed
                    ${themeNeutralBorder}
                    ${themeNeutralSurface}
                    px-5
                    text-center
                  `}
                >
                  <div
                    className={`
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      ${themePrimarySoft}
                      ${themePrimaryText}
                    `}
                  >
                    <BookOpen size={22} />
                  </div>

                  <h3 className="theme-text mt-4 text-sm font-bold">
                    Belum ada mata pelajaran
                  </h3>

                  <p className="theme-text-secondary mt-1 max-w-md text-xs leading-5">
                    Belum ada mata pelajaran yang terhubung dengan kelas kamu.
                  </p>
                </div>
              )}

            {/* MAPEL */}

            {!loadingMapel &&
              mataPelajaranList.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                  {mataPelajaranList.map(
                    (mapel) => {
                      const Icon =
                        mapel.icon;

                      const theme =
                        mapel.theme ||
                        subjectThemes[0];

                      return (
                        <button
                          key={mapel.id}
                          type="button"
                          onClick={() =>
                            router.push(
                              "/siswa/mataPelajaran"
                            )
                          }
                          className={`
                            theme-card
                            group
                            relative
                            overflow-hidden
                            rounded-xl
                            border
                            ${themeNeutralBorder}
                            p-4
                            text-left
                            ${themeCardShadow}
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:shadow-[0_12px_30px_color-mix(in_srgb,var(--color-text)_10%,transparent)]
                            ${theme.hover}
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
                                ${theme.surface}
                                ${theme.text}
                                transition-transform
                                duration-300
                                group-hover:scale-105
                              `}
                            >
                              <Icon size={20} />
                            </div>

                            <div
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-full
                                bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]
                                text-[var(--color-text-muted)]
                                transition-all
                                group-hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]
                                group-hover:text-[var(--color-primary)]
                              "
                            >
                              <ChevronRight size={16} />
                            </div>

                          </div>

                          <div className="mt-5">

                            <h3 className="theme-text truncate text-sm font-bold">
                              {mapel.nama}
                            </h3>

                            <p className="theme-text-secondary mt-1 truncate text-xs">
                              {mapel.guru}
                            </p>

                            {mapel.kode && (
                              <span
                                className="
                                  mt-2
                                  inline-flex
                                  rounded-md
                                  bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]
                                  px-2
                                  py-1
                                  text-[10px]
                                  font-semibold
                                  theme-text-muted
                                "
                              >
                                {mapel.kode}
                              </span>
                            )}

                          </div>

                          <div className="mt-5">

                            <div className="mb-2 flex items-center justify-between">

                              <span className="theme-text-muted text-[11px] font-medium">
                                Progress pembelajaran
                              </span>

                              <span className="theme-text-secondary text-xs font-bold">
                                {mapel.progress}%
                              </span>

                            </div>

                            <div
                              className="
                                h-1.5
                                overflow-hidden
                                rounded-full
                                bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]
                              "
                            >
                              <div
                                className={`
                                  h-full
                                  rounded-full
                                  ${theme.progress}
                                `}
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

          <div
            className={`
              border-t
              ${themeDivider}
              ${themeNeutralSurface}
              px-5
              py-3.5
              sm:px-6
            `}
          >
            <div className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">

              <span className="theme-text-secondary">
                Menampilkan{" "}

                <strong className="theme-text font-semibold">
                  {mataPelajaranList.length}
                </strong>{" "}

                mata pelajaran
              </span>

              <span className="theme-text-muted font-medium">
                {user.kelasName
                  ? `Kelas ${user.kelasName}`
                  : "Data pembelajaran semester berjalan"}
              </span>

            </div>
          </div>

        </section>

      </div>
    </div>
  );
}