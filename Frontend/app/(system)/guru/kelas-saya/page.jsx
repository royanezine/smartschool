"use client";

import { useEffect, useMemo, useState } from "react";
import { getStoredUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

import { getKelasMapel } from "@/services/kelasMapel.service";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  BookOpen,
  Search,
  Users,
  GraduationCap,
  School,
  ChevronRight,
  ArrowUpRight,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  Loader2,
  ClipboardList,
  BookMarked,
  X,
} from "lucide-react";

import { getKelasById } from "@/services/kelas.service";
import { getTahunAjaran } from "@/services/tahunAjaran.service";



const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const cardAccents = [
  {
    surface:
      "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
    text: "text-[var(--color-primary)]",
    border:
      "group-hover:border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]",
    bar: "bg-[var(--color-primary)]",
  },
  {
    surface:
      "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
    text: "text-[var(--color-success)]",
    border:
      "group-hover:border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]",
    bar: "bg-[var(--color-success)]",
  },
  {
    surface:
      "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",
    text: "text-[var(--color-info)]",
    border:
      "group-hover:border-[color-mix(in_srgb,var(--color-info)_25%,transparent)]",
    bar: "bg-[var(--color-info)]",
  },
];



function getTeacherId(user) {
  if (!user) return "";

  const id =
    user.userId ||
    user.id ||
    user.penggunaId ||
    user.guruId ||
    user.guru?.id ||
    user.data?.userId ||
    user.data?.id ||
    "";

  return id ? String(id) : "";
}

function getTeacherName(user) {
  if (!user) return "Guru";

  const name =
    user.namaLengkap ||
    user.namalengkap ||
    user.nama ||
    user.name ||
    user.fullName ||
    user.full_name ||
    user.namaPengguna ||
    user.username ||
    user.guru?.namaLengkap ||
    "";

  return typeof name === "string" && name.trim()
    ? name.trim()
    : "Guru";
}

function getTeacherEmail(user) {
  return (
    user?.email ||
    user?.emailPengguna ||
    user?.guru?.email ||
    ""
  );
}

function unwrapArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.list)) return response.list;
  return [];
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getTeacherRelationIds(item) {
  const candidates = [
    item?.guruId,
    item?.guruPengajarId,
    item?.guru?.id,
    item?.guruPengajar?.id,
    item?.guru?.userId,
    item?.guruPengajar?.userId,
    item?.pengajarId,
    item?.pengajar?.id,
    item?.guru?.penggunaId,
    item?.guruPengajar?.penggunaId,
  ];

  return candidates
    .filter((value) => value !== undefined && value !== null && value !== "")
    .map(String);
}

function getSubjectName(item) {
  return (
    item?.mataPelajaran?.nama ||
    item?.mataPelajaran?.namaMataPelajaran ||
    item?.mapel?.nama ||
    item?.namaMataPelajaran ||
    item?.namaMapel ||
    item?.mapelNama ||
    item?.nama ||
    "Mata Pelajaran"
  );
}

function getClassName(item) {
  return (
    item?.kelas?.nama ||
    item?.kelas?.namaKelas ||
    item?.namaKelas ||
    item?.kelasNama ||
    item?.nama ||
    "Kelas belum bernama"
  );
}

function getClassLevel(item) {
  return (
    item?.kelas?.tingkat ||
    item?.kelas?.level ||
    item?.tingkat ||
    item?.level ||
    item?.kelas?.jenjang ||
    item?.jenjang ||
    ""
  );
}

function getClassId(item) {
  const id =
    item?.kelasId ||
    item?.kelas?.id ||
    item?.idKelas ||
    item?.kelas?.kelasId ||
    "";

  return id ? String(id) : "";
}

function getStudentCount(item) {
  const possibleCounts = [
    item?.jumlahSiswa,
    item?.totalSiswa,
    item?.jumlah_siswa,
    item?.total_siswa,
    item?.kelas?.jumlahSiswa,
    item?.kelas?.totalSiswa,
    item?.kelas?.jumlah_siswa,
    item?.kelas?.total_siswa,
    item?.anggota?.length,
    item?.kelas?.anggota?.length,
    item?.siswa?.length,
    item?.kelas?.siswa?.length,
    item?.kelas?.siswaKelas?.length,
    item?.kelas?.anggotaKelas?.length,
    item?.kelas?.daftarSiswa?.length,
  ];

  const found = possibleCounts.find(
    (value) => typeof value === "number" && Number.isFinite(value) && value >= 0
  );

  return typeof found === "number" ? found : null;
}

function unwrapObject(response) {
  return (
    response?.data?.data ??
    response?.data ??
    response
  );
}

function countStudentsInClass(detail) {
  const possibleCounts = [
    detail?.jumlahSiswa,
    detail?.totalSiswa,
    detail?.jumlah_siswa,
    detail?.total_siswa,
  ];

  const count = possibleCounts.find(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(Number(value)) &&
      Number(value) >= 0
  );

  if (count !== undefined) {
    return Number(count);
  }

  const anggota = Array.isArray(detail?.anggota)
    ? detail.anggota
    : Array.isArray(detail?.siswaKelas)
      ? detail.siswaKelas
      : [];

  return anggota.length;
}

function getTeacherObject(item) {
  return (
    item?.guruPengajar ||
    item?.guru ||
    item?.pengajar ||
    null
  );
}

function normalizeTeachingAssignment(item, index) {
  const teacher = getTeacherObject(item);
  const classObject = item?.kelas || {};

  return {
    id:
      item?.id ||
      `${getClassId(item) || "kelas"}-${index}`,
    kelasId: getClassId(item),
    kelasNama: getClassName(item),
    tingkat: getClassLevel(item),
    mapel: getSubjectName(item),
    guruId:
      item?.guruId ||
      item?.guruPengajarId ||
      teacher?.id ||
      teacher?.userId ||
      teacher?.penggunaId ||
      "",
    guruNama:
      teacher?.namaLengkap ||
      teacher?.nama ||
      item?.guruNama ||
      "",
    jumlahSiswa: getStudentCount({
      ...item,
      kelas: classObject,
    }),
    tahunAjaran:
      item?.tahunAjaran?.nama ||
      item?.tahunAjaran ||
      classObject?.tahunAjaran?.nama ||
      "",
    raw: item,
  };
}


export default function GuruKelasSayaPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [teacher, setTeacher] = useState({
    id: "",
    name: "Guru",
    email: "",
  });

  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMapel, setSelectedMapel] = useState("semua");
  const [selectedTingkat, setSelectedTingkat] = useState("semua");
  const [tahunAjaranAktif, setTahunAjaranAktif] = useState(null);
const [loadingTahunAjaran, setLoadingTahunAjaran] = useState(true);

  useEffect(() => {
    setMounted(true);

    const user = getStoredUser();

    setTeacher({
      id: getTeacherId(user),
      name: getTeacherName(user),
      email: getTeacherEmail(user),
    });
  }, []);

  useEffect(() => {
  let isMounted = true;

  async function loadTahunAjaranAktif() {
    setLoadingTahunAjaran(true);

    try {
      const data = await getTahunAjaran();

      const aktif = data.find(
        (item) =>
          String(item.status).toLowerCase() === "aktif"
      );

      if (isMounted) {
        setTahunAjaranAktif(aktif || null);
      }
    } catch (error) {
      console.error(
        "[KELAS SAYA] Gagal mengambil tahun ajaran:",
        error
      );

      if (isMounted) {
        setTahunAjaranAktif(null);
      }
    } finally {
      if (isMounted) {
        setLoadingTahunAjaran(false);
      }
    }
  }

  loadTahunAjaranAktif();

  return () => {
    isMounted = false;
  };
}, []);
  
async function loadKelasSaya() {
  setLoading(true);
  setErrorMessage("");

  try {
    const user = getStoredUser();
    const teacherId = getTeacherId(user);

    if (!user) {
      throw new Error(
        "Data akun belum ditemukan. Silakan login kembali."
      );
    }

    if (!teacherId) {
      throw new Error(
        "ID guru tidak ditemukan pada data login."
      );
    }

    const response = await getKelasMapel();
    const data = unwrapArray(response);

    if (!Array.isArray(data)) {
      throw new Error(
        "Data kelas-mapel dari server tidak valid."
      );
    }

    const teacherAssignments = data.filter((item) => {
      const ids = getTeacherRelationIds(item);
      return ids.includes(String(teacherId));
    });

    const normalized = teacherAssignments
      .map((item, index) =>
        normalizeTeachingAssignment(item, index)
      )
      .filter((item) => item.kelasId || item.kelasNama);

    const uniqueAssignments = [];
    const seen = new Set();

    for (const item of normalized) {
      const key =
        `${item.kelasId}|${normalizeText(item.mapel)}`;

      if (!seen.has(key)) {
        seen.add(key);
        uniqueAssignments.push(item);
      }
    }

    const classIds = [
      ...new Set(
        uniqueAssignments
          .map((item) => item.kelasId)
          .filter(Boolean)
      ),
    ];

    const classCounts = new Map();

    await Promise.all(
      classIds.map(async (kelasId) => {
        try {
          const detailResponse =
            await getKelasById(kelasId);

          const detail = unwrapObject(detailResponse);

          const jumlahSiswa =
            countStudentsInClass(detail);

          classCounts.set(
            String(kelasId),
            jumlahSiswa
          );
        } catch (error) {
          console.warn(
            `[KELAS SAYA] Gagal mengambil detail kelas ${kelasId}:`,
            error
          );
        }
      })
    );

    const result = uniqueAssignments.map((item) => ({
      ...item,
      jumlahSiswa: item.kelasId
        ? classCounts.get(String(item.kelasId)) ?? null
        : null,
    }));

    setKelasList(result);

    if (result.length === 0) {
      setErrorMessage(
        "Belum ditemukan kelas atau mata pelajaran yang terhubung dengan akun guru ini. Pastikan penugasan guru dan kelas-mapel sudah diatur oleh Admin Sekolah."
      );
    } else if (classCounts.size === 0 && classIds.length > 0) {
      setErrorMessage(
        "Penugasan kelas ditemukan, tetapi jumlah siswa belum berhasil diambil dari detail kelas."
      );
    }
  } catch (error) {
    console.error(
      "[KELAS SAYA] Gagal memuat data:",
      error
    );

    setKelasList([]);

    setErrorMessage(
      error?.message ||
        "Terjadi kesalahan saat mengambil data kelas. Silakan coba lagi."
    );
  } finally {
    setLoading(false);
  }
}


  useEffect(() => {
    loadKelasSaya();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapelOptions = useMemo(() => {
    const values = [...new Set(
      kelasList.map((item) => item.mapel).filter(Boolean)
    )];

    return values.sort((a, b) => a.localeCompare(b, "id"));
  }, [kelasList]);

  const tingkatOptions = useMemo(() => {
    const values = [...new Set(
      kelasList.map((item) => item.tingkat).filter(Boolean)
    )];

    return values.sort((a, b) => a.localeCompare(b, "id"));
  }, [kelasList]);

  const filteredKelas = useMemo(() => {
    const query = normalizeText(searchQuery);

    return kelasList.filter((item) => {
      const matchesSearch =
        !query ||
        normalizeText(item.kelasNama).includes(query) ||
        normalizeText(item.mapel).includes(query) ||
        normalizeText(item.tingkat).includes(query);

      const matchesMapel =
        selectedMapel === "semua" ||
        item.mapel === selectedMapel;

      const matchesTingkat =
        selectedTingkat === "semua" ||
        item.tingkat === selectedTingkat;

      return matchesSearch && matchesMapel && matchesTingkat;
    });
  }, [kelasList, searchQuery, selectedMapel, selectedTingkat]);

  const uniqueClassCount = useMemo(
    () => new Set(kelasList.map((item) => item.kelasId || item.kelasNama)).size,
    [kelasList]
  );

  const uniqueSubjectCount = useMemo(
    () => new Set(kelasList.map((item) => item.mapel)).size,
    [kelasList]
  );

 const knownStudentCount = useMemo(() => {
  const counts = new Map();

  for (const item of kelasList) {
    const key = item.kelasId || item.kelasNama;

    if (
      key &&
      item.jumlahSiswa !== null &&
      item.jumlahSiswa !== undefined &&
      !counts.has(key)
    ) {
      counts.set(key, item.jumlahSiswa);
    }
  }

  if (counts.size === 0) return null;

  return [...counts.values()].reduce(
    (sum, value) => sum + value,
    0
  );
}, [kelasList]);

  function resetFilters() {
    setSearchQuery("");
    setSelectedMapel("semua");
    setSelectedTingkat("semua");
  }

  function openClass(item) {
    if (item.kelasId) {
      router.push(`/guru/kelas-saya/${item.kelasId}`);
      return;
    }

    router.push("/guru/kelas-saya");
  }

  const stats = [
    {
      title: "Kelas Diajar",
      value: uniqueClassCount,
      description: "Kelas yang terhubung",
      icon: School,
      accent: cardAccents[0],
    },
    {
      title: "Mata Pelajaran",
      value: uniqueSubjectCount,
      description: "Mapel yang ditugaskan",
      icon: BookOpen,
      accent: cardAccents[1],
    },
    {
      title: "Total Siswa",
      value: knownStudentCount === null ? "—" : knownStudentCount,
      description:
        knownStudentCount === null
          ? "Data siswa belum tersedia"
          : "Dari kelas yang diajar",
      icon: Users,
      accent: cardAccents[2],
    },
  ];

  return (
    <div className="flex min-h-screen w-full theme-page">
      <Sidebar role="guru" />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header user={teacher} />

        <div className="min-w-0 flex-1">
    <main className="theme-page min-h-full w-full">
      <div
        className={`
          mx-auto
          w-full
          max-w-[1600px]
          space-y-6
          p-4
          transition-all
          duration-500
          sm:p-6
          lg:p-8
          ${
            mounted
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
          }
        `}
      >
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
          <div
            className={`
              absolute
              inset-0
              -z-20
              ${themePrimarySoft}
            `}
          />

          <div
            className="
              absolute
              -right-16
              -top-24
              -z-10
              h-72
              w-72
              rounded-full
              bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
              blur-3xl
            "
          />

          <div
            className="
              absolute
              bottom-[-100px]
              right-[25%]
              -z-10
              h-64
              w-64
              rounded-full
              bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]
              blur-3xl
            "
          />

          <div className="relative z-10 flex flex-col gap-5 px-5 py-6 sm:px-7 sm:py-7 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="max-w-3xl">
              <div
                className="
                  mb-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                  bg-[color-mix(in_srgb,var(--color-card)_90%,transparent)]
                  px-3
                  py-1.5
                  shadow-sm
                "
              >
                <span
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
                  <BookMarked size={14} />
                </span>

                <span className="text-xs font-semibold tracking-wide text-[var(--color-primary)]">
                  AREA GURU
                </span>

                <span className="h-1 w-1 rounded-full bg-[var(--color-primary)] opacity-50" />

                <span className="theme-text-secondary text-xs font-medium">
                  Pembelajaran
                </span>
              </div>

              <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                Kelas Saya
              </h1>

              <p className="theme-text-secondary mt-2 max-w-2xl text-sm leading-6 sm:text-base">
                Halo, {teacher.name}. Kelola kelas yang kamu ajar dan temukan
                informasi mata pelajaran serta siswa dalam satu tempat.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <div
                className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  ${themeNeutralBorder}
                  bg-[color-mix(in_srgb,var(--color-card)_85%,transparent)]
                  px-3
                  py-2.5
                  text-sm
                  ${themeCardShadow}
                `}
              >
                <GraduationCap size={17} className={themePrimaryText} />
               
<span className="theme-text-secondary">
  {loadingTahunAjaran
    ? "Memuat tahun ajaran..."
    : tahunAjaranAktif
      ? [
          tahunAjaranAktif.nama ||
            tahunAjaranAktif.tahunAjaran ||
            tahunAjaranAktif.tahun ||
            "",
          tahunAjaranAktif.semester || "",
        ]
          .filter(Boolean)
          .join(" • ") || "Tahun ajaran aktif belum tersedia"
      : "Tahun ajaran aktif belum tersedia"}
</span>

              </div>

              <button
                type="button"
                onClick={loadKelasSaya}
                disabled={loading}
                className={`
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  ${"bg-[var(--color-primary)] hover:opacity-90"}
                `}
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
                Muat ulang
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 h-1 w-full bg-[linear-gradient(90deg,var(--color-primary),var(--color-info))]" />
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const accent = stat.accent;

            return (
              <article
                key={stat.title}
                className={`
                  theme-card
                  relative
                  overflow-hidden
                  rounded-xl
                  border
                  ${themeNeutralBorder}
                  p-5
                  ${themeCardShadow}
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="theme-text-secondary text-sm font-medium">
                      {stat.title}
                    </p>

                    <p className="theme-text mt-2 text-3xl font-bold tracking-tight">
                      {stat.value}
                    </p>

                    <p className="theme-text-muted mt-1 text-xs">
                      {stat.description}
                    </p>
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
                      ${accent.surface}
                      ${accent.text}
                    `}
                  >
                    <Icon size={20} />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section
          className={`
            theme-card
            rounded-2xl
            border
            ${themeNeutralBorder}
            ${themeCardShadow}
          `}
        >
          <div className={`border-b ${themeDivider} px-5 py-5 sm:px-6`}>
            <div className="flex items-center gap-3">
              <div
                className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  ${themePrimarySoft}
                  ${themePrimaryText}
                `}
              >
                <SlidersHorizontal size={18} />
              </div>

              <div>
                <h2 className="theme-text text-base font-bold">
                  Daftar Kelas
                </h2>
                <p className="theme-text-secondary mt-0.5 text-xs">
                  Cari dan filter kelas berdasarkan mata pelajaran atau tingkat.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-[minmax(240px,1fr)_minmax(180px,0.55fr)_minmax(160px,0.45fr)_auto] sm:p-6">
            <label className="relative block">
              <span className="sr-only">Cari kelas</span>
              <Search
                size={17}
                className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari nama kelas atau mapel..."
                className={`
                  theme-input
                  w-full
                  rounded-lg
                  border
                  ${themeNeutralBorder}
                  bg-transparent
                  py-2.5
                  pl-10
                  pr-3
                  text-sm
                  theme-text
                  outline-none
                  transition
                  focus:border-[var(--color-primary)]
                  focus:ring-2
                  focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]
                `}
              />
            </label>

            <label className="block">
              <span className="sr-only">Filter mata pelajaran</span>
              <select
                value={selectedMapel}
                onChange={(event) => setSelectedMapel(event.target.value)}
                className={`
                  w-full
                  rounded-lg
                  border
                  ${themeNeutralBorder}
                  bg-[var(--color-card)]
                  px-3
                  py-2.5
                  text-sm
                  theme-text
                  outline-none
                  focus:border-[var(--color-primary)]
                  focus:ring-2
                  focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]
                `}
              >
                <option value="semua">Semua mata pelajaran</option>
                {mapelOptions.map((mapel) => (
                  <option key={mapel} value={mapel}>
                    {mapel}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="sr-only">Filter tingkat kelas</span>
              <select
                value={selectedTingkat}
                onChange={(event) => setSelectedTingkat(event.target.value)}
                className={`
                  w-full
                  rounded-lg
                  border
                  ${themeNeutralBorder}
                  bg-[var(--color-card)]
                  px-3
                  py-2.5
                  text-sm
                  theme-text
                  outline-none
                  focus:border-[var(--color-primary)]
                  focus:ring-2
                  focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]
                `}
              >
                <option value="semua">Semua tingkat</option>
                {tingkatOptions.map((tingkat) => (
                  <option key={tingkat} value={tingkat}>
                    {tingkat}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={resetFilters}
              className={`
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                ${themeNeutralBorder}
                px-3.5
                py-2.5
                text-sm
                font-semibold
                theme-text-secondary
                transition
                ${themeNeutralHover}
              `}
            >
              <X size={15} />
              Reset
            </button>
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="theme-text text-lg font-bold">
                Kelas yang Saya Ajar
              </h2>
              <p className="theme-text-secondary mt-1 text-sm">
                {loading
                  ? "Sedang mengambil data kelas..."
                  : `${filteredKelas.length} penugasan ditampilkan`}
              </p>
            </div>
          </div>

          {loading && (
            <div
              className={`
                theme-card
                flex
                min-h-[240px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                ${themeNeutralBorder}
                ${themeCardShadow}
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
                <Loader2 size={22} className="animate-spin" />
              </div>
              <p className="theme-text mt-4 text-sm font-semibold">
                Memuat kelas...
              </p>
              <p className="theme-text-muted mt-1 text-xs">
                Mengambil daftar penugasan dari server.
              </p>
            </div>
          )}

          {!loading && kelasList.length === 0 && (
            <div
              className={`
                theme-card
                flex
                min-h-[260px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                ${themeNeutralBorder}
                ${themeCardShadow}
                px-6
                py-10
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
                  ${errorMessage ? themeWarningSurface : themePrimarySoft}
                  ${errorMessage ? "text-[var(--color-warning)]" : themePrimaryText}
                `}
              >
                {errorMessage ? (
                  <AlertCircle size={22} />
                ) : (
                  <School size={22} />
                )}
              </div>

              <h3 className="theme-text mt-4 text-base font-bold">
                {errorMessage
                  ? "Kelas belum dapat ditampilkan"
                  : "Belum ada kelas"}
              </h3>

              <p className="theme-text-secondary mt-2 max-w-lg text-sm leading-6">
                {errorMessage ||
                  "Belum ada kelas yang ditugaskan kepada akun guru ini."}
              </p>

              <button
                type="button"
                onClick={loadKelasSaya}
                className={`
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-[var(--color-primary)]
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:opacity-90
                `}
              >
                <RefreshCw size={15} />
                Coba lagi
              </button>
            </div>
          )}

          {!loading && kelasList.length > 0 && filteredKelas.length === 0 && (
            <div
              className={`
                theme-card
                flex
                min-h-[220px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                ${themeNeutralBorder}
                px-6
                py-10
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
                <Search size={22} />
              </div>
              <h3 className="theme-text mt-4 text-sm font-bold">
                Kelas tidak ditemukan
              </h3>
              <p className="theme-text-secondary mt-1 text-sm">
                Coba ubah kata kunci atau filter yang dipilih.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className={`mt-4 text-sm font-semibold ${themePrimaryText}`}
              >
                Hapus semua filter
              </button>
            </div>
          )}

          {!loading && filteredKelas.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredKelas.map((item, index) => {
                const accent = cardAccents[index % cardAccents.length];

                return (
                  <article
                    key={item.id}
                    className={`
                      theme-card
                      group
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      ${themeNeutralBorder}
                      ${themeCardShadow}
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-[0_12px_30px_color-mix(in_srgb,var(--color-text)_10%,transparent)]
                      ${accent.border}
                    `}
                  >
                    <div className={`h-1 w-full ${accent.bar}`} />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            ${accent.surface}
                            ${accent.text}
                            transition-transform
                            duration-300
                            group-hover:scale-105
                          `}
                        >
                          <School size={22} />
                        </div>

                        <span
                          className={`
                            inline-flex
                            max-w-[55%]
                            items-center
                            rounded-md
                            border
                            ${themeNeutralBorder}
                            ${themeNeutralSurface}
                            px-2.5
                            py-1
                            text-[11px]
                            font-semibold
                            theme-text-secondary
                          `}
                        >
                          <span className="truncate">
                            {item.tingkat || "Tingkat belum diatur"}
                          </span>
                        </span>
                      </div>

                      <div className="mt-5">
                        <h3 className="theme-text truncate text-lg font-bold">
                          {item.kelasNama}
                        </h3>

                        <div className="mt-2 flex items-start gap-2">
                          <BookOpen
                            size={15}
                            className={`mt-0.5 shrink-0 ${accent.text}`}
                          />
                          <p className="theme-text-secondary line-clamp-2 text-sm">
                            {item.mapel}
                          </p>
                        </div>
                      </div>

                      <div className={`my-5 border-t ${themeDivider}`} />

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              ${themeNeutralSurface}
                              theme-text-secondary
                            `}
                          >
                            <Users size={16} />
                          </div>

                          <div>
                            <p className="theme-text text-sm font-semibold">
                              {item.jumlahSiswa === null
                                ? "—"
                                : item.jumlahSiswa}
                            </p>
                            <p className="theme-text-muted text-[11px]">
                              Siswa
                            </p>
                          </div>
                        </div>

                        {item.tahunAjaran ? (
                          <span className="theme-text-muted text-right text-[11px]">
                            {item.tahunAjaran}
                          </span>
                        ) : (
                          <span className="theme-text-muted text-right text-[11px]">
                            Tahun ajaran aktif
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => openClass(item)}
                        className={`
                          mt-5
                          flex
                          w-full
                          items-center
                          justify-between
                          rounded-lg
                          border
                          ${themeNeutralBorder}
                          px-3.5
                          py-2.5
                          text-sm
                          font-semibold
                          theme-text-secondary
                          transition-all
                          ${themeNeutralHover}
                          hover:border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]
                          hover:text-[var(--color-primary)]
                        `}
                      >
                        <span>Lihat kelas</span>
                        <span className="flex items-center gap-1">
                          Detail
                          <ChevronRight
                            size={16}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div
          className={`
            flex
            flex-col
            gap-2
            rounded-xl
            border
            ${themeNeutralBorder}
            ${themeNeutralSurface}
            px-4
            py-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          `}
        >
          <div className="flex items-start gap-2">
            <ClipboardList
              size={16}
              className={`mt-0.5 shrink-0 ${themePrimaryText}`}
            />
            <p className="theme-text-secondary text-xs leading-5">
              Data kelas mengikuti penugasan guru dan kelas-mapel yang tersedia
              pada sistem SmartSchool.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/guru/mataPelajaran")}
            className={`
              inline-flex
              shrink-0
              items-center
              gap-1.5
              text-xs
              font-semibold
              ${themePrimaryText}
              transition
              hover:opacity-75
            `}
          >
            Menu mata pelajaran
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </main>
        </div>
      </div>
    </div>
  );
}
