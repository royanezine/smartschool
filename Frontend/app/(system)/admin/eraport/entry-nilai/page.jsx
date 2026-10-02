"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  GraduationCap,
  Search,
  RefreshCw,
  ChevronDown,
  Users,
  BookOpen,
  ClipboardCheck,
  CircleCheck,
  CircleAlert,
  Eye,
  X,
  Award,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  getTahunAjaran,
  getKelas,
  getDetailKelas,
  getRaportSiswa,
} from "@/services/raport.service";

import {
  exportRekapNilai,
  downloadRekapNilai,
} from "@/services/nilai.service";

import {
  getNilaiUjianUntukKelas,
} from "@/services/ujian.service";

/* =========================================================
   HELPERS
========================================================= */

function getResultData(result) {
  if (result?.data?.data) {
    return result.data.data;
  }

  return result?.data || null;
}

function getListData(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  if (Array.isArray(result?.data?.data)) {
    return result.data.data;
  }

  return [];
}

function normalizeSemester(value) {
  const semester = String(value || "")
    .trim()
    .toLowerCase();

  if (semester === "ganjil") {
    return "Ganjil";
  }

  if (semester === "genap") {
    return "Genap";
  }

  return "";
}

function getTahunAjaranLabel(item) {
  if (!item) {
    return "-";
  }

  return (
    item.nama ||
    item.tahunAjaran ||
    item.tahun ||
    item.label ||
    item.namaTahunAjaran ||
    (item.tahunMulai && item.tahunSelesai
      ? `${item.tahunMulai}/${item.tahunSelesai}`
      : null) ||
    "-"
  );
}

function getGrade(finalScore) {
  const score = Number(finalScore) || 0;

  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";

  return "E";
}

/* =========================================================
   GRADE STYLE
   Menggunakan theme status global
========================================================= */

function getGradeStyle(grade) {
  if (grade === "A") {
    return "theme-success";
  }

  if (grade === "B") {
    return "theme-info";
  }

  if (grade === "C") {
    return "theme-warning";
  }

  return "theme-danger";
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  type = "blue",
}) {
  const styles = {
    blue: {
      box: "theme-info",
      icon: "text-theme-info",
      value: "theme-text",
    },

    green: {
      box: "theme-success",
      icon: "text-theme-success",
      value: "text-theme-success",
    },

    orange: {
      box: "theme-warning",
      icon: "text-theme-warning",
      value: "text-theme-warning",
    },

    purple: {
      box: "theme-info",
      icon: "text-theme-info",
      value: "text-theme-info",
    },
  };

  const style = styles[type];

  return (
    <div
      className="
        theme-card
        min-w-0
        rounded-xl
        border
        px-4
        py-4
        shadow-[0_1px_3px_rgba(15,23,42,0.08)]
        transition-colors
        sm:px-5
      "
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-lg
            ${style.box}
            ${style.icon}
          `}
        >
          <Icon size={19} strokeWidth={2} />
        </div>

        <div className="min-w-0">
          <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
            {label}
          </p>

          <p
            className={`
              mt-1
              text-2xl
              font-bold
              tracking-tight
              ${style.value}
            `}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function EntryNilaiPage() {
  /* =======================================================
     DATA STATE
  ======================================================= */

  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [students, setStudents] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [selectedKelasData, setSelectedKelasData] = useState(null);

  /* =======================================================
     FILTER STATE
  ======================================================= */

  const [tahunAjaranId, setTahunAjaranId] = useState("");
  const [semester, setSemester] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [kelasMapelId, setKelasMapelId] = useState("");
  const [search, setSearch] = useState("");

  /* =======================================================
     UI STATE
  ======================================================= */

  const [loadingTahunAjaran, setLoadingTahunAjaran] =
    useState(true);

  const [loadingKelas, setLoadingKelas] = useState(false);
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [loadingNilai, setLoadingNilai] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [error, setError] = useState("");
  const [modalStudent, setModalStudent] = useState(null);

  /* =======================================================
     LOAD TAHUN AJARAN
  ======================================================= */

  const loadTahunAjaran = useCallback(async () => {
    try {
      setLoadingTahunAjaran(true);
      setError("");

      const result = await getTahunAjaran();

      console.log(
        "[ENTRY NILAI] Response Tahun Ajaran:",
        result
      );

      const data = getListData(result);

      console.log(
        "[ENTRY NILAI] Data Tahun Ajaran:",
        data
      );

      setTahunAjaranList(data);

      if (data.length === 0) {
        setTahunAjaranId("");
        setSemester("");
        setKelasList([]);
        setKelasId("");
        setMapelList([]);
        setKelasMapelId("");
        setStudents([]);
        setSelectedKelasData(null);

        return;
      }

      const aktif =
        data.find(
          (item) =>
            String(item?.status || "")
              .trim()
              .toLowerCase() === "aktif"
        ) || data[0];

      const selectedYearId = String(aktif?.id || "");

      const selectedSemester = normalizeSemester(
        aktif?.semester
      );

      setTahunAjaranId(selectedYearId);
      setSemester(selectedSemester);

      console.log(
        "[ENTRY NILAI] Tahun Ajaran Terpilih:",
        {
          id: selectedYearId,
          nama: getTahunAjaranLabel(aktif),
          semester: selectedSemester,
          status: aktif?.status,
        }
      );
    } catch (err) {
      console.error(
        "Gagal mengambil tahun ajaran:",
        err
      );

      setTahunAjaranList([]);
      setTahunAjaranId("");
      setSemester("");

      setKelasList([]);
      setKelasId("");

      setMapelList([]);
      setKelasMapelId("");

      setStudents([]);
      setSelectedKelasData(null);

      setError(
        err?.message ||
          "Gagal mengambil data tahun ajaran."
      );
    } finally {
      setLoadingTahunAjaran(false);
    }
  }, []);

  useEffect(() => {
    loadTahunAjaran();
  }, [loadTahunAjaran]);

  /* =======================================================
     LOAD KELAS
  ======================================================= */

  const loadKelas = useCallback(async () => {
    if (!tahunAjaranId) {
      setKelasList([]);
      setKelasId("");

      setStudents([]);
      setMapelList([]);
      setKelasMapelId("");
      setSelectedKelasData(null);

      return;
    }

    try {
      setLoadingKelas(true);
      setError("");

      const selectedYear =
        tahunAjaranList.find(
          (item) =>
            String(item?.id) ===
            String(tahunAjaranId)
        );

      const selectedSemester =
        normalizeSemester(
          selectedYear?.semester
        );

      setSemester(selectedSemester);

      console.log(
        "[ENTRY NILAI] Load Kelas:",
        {
          tahunAjaranId,
          semester: selectedSemester,
        }
      );

      const result = await getKelas({
        page: 1,
        limit: 100,
        tahunAjaranId: String(
          tahunAjaranId
        ),
      });

      console.log(
        "[ENTRY NILAI] Response Kelas:",
        result
      );

      const data = getListData(result);

      console.log(
        "[ENTRY NILAI] Data Kelas:",
        data
      );

      setKelasList(data);

      if (data.length > 0) {
        setKelasId(String(data[0].id));
      } else {
        setKelasId("");

        setStudents([]);
        setMapelList([]);
        setKelasMapelId("");
        setSelectedKelasData(null);
      }
    } catch (err) {
      console.error(
        "Gagal mengambil kelas:",
        err
      );

      setKelasList([]);
      setKelasId("");

      setStudents([]);
      setMapelList([]);
      setKelasMapelId("");
      setSelectedKelasData(null);

      setError(
        err?.message ||
          "Gagal mengambil data kelas."
      );
    } finally {
      setLoadingKelas(false);
    }
  }, [
    tahunAjaranId,
    tahunAjaranList,
  ]);

  useEffect(() => {
    loadKelas();
  }, [loadKelas]);

  /* =======================================================
     LOAD DETAIL KELAS
  ======================================================= */

  const loadDetailKelas = useCallback(async () => {
    if (!kelasId) {
      setSelectedKelasData(null);
      setStudents([]);
      setMapelList([]);
      setKelasMapelId("");

      return;
    }

    try {
      setLoadingSiswa(true);
      setError("");

      const result =
        await getDetailKelas(
          String(kelasId)
        );

      console.log(
        "[ENTRY NILAI] Response Detail Kelas:",
        result
      );

      const data = getResultData(result);

      console.log(
        "[ENTRY NILAI] Detail Kelas:",
        data
      );

      setSelectedKelasData(data);

      const anggota =
        Array.isArray(data?.anggota)
          ? data.anggota
          : [];

      const siswa = anggota
        .map((item) => {
          const siswaData = item?.siswa;

          if (!siswaData) {
            return null;
          }

          return {
            id: siswaData.id,
            nis: siswaData.nis || "-",
            nisn: siswaData.nisn || "-",
            nama:
              siswaData.namaLengkap ||
              "Tanpa Nama",
            avatar:
              siswaData.avatar || null,

            nilaiAkhir: null,
            predikat: null,
            kkm: 75,

            reportLoaded: false,
            reportError: null,
          };
        })
        .filter(Boolean);

      setStudents(siswa);

      const kelasMapel =
        Array.isArray(data?.kelasMapel)
          ? data.kelasMapel
          : [];

      setMapelList(kelasMapel);

      if (kelasMapel.length > 0) {
        setKelasMapelId(
          String(kelasMapel[0].id)
        );
      } else {
        setKelasMapelId("");
      }
    } catch (err) {
      console.error(
        "Gagal mengambil detail kelas:",
        err
      );

      setSelectedKelasData(null);
      setStudents([]);
      setMapelList([]);
      setKelasMapelId("");

      setError(
        err?.message ||
          "Gagal mengambil data siswa dan mata pelajaran."
      );
    } finally {
      setLoadingSiswa(false);
    }
  }, [kelasId]);

  useEffect(() => {
    loadDetailKelas();
  }, [loadDetailKelas]);

  /* =======================================================
     LOAD NILAI RAPORT + NILAI UJIAN
  ======================================================= */

  useEffect(() => {
    if (
      !tahunAjaranId ||
      !students.length
    ) {
      return;
    }

    let cancelled = false;

    const loadNilai = async () => {
      try {
        setLoadingNilai(true);

        /* =================================================
           1. NILAI UJIAN
        ================================================= */

        let nilaiUjian = [];

        if (kelasMapelId) {
          try {
            console.log(
              "[ENTRY NILAI] Mengambil nilai ujian:",
              {
                kelasMapelId,
              }
            );

            const response =
              await getNilaiUjianUntukKelas(
                String(kelasMapelId)
              );

            nilaiUjian =
              Array.isArray(response)
                ? response
                : [];

            console.log(
              "[ENTRY NILAI] NILAI UJIAN:",
              nilaiUjian
            );
          } catch (err) {
            console.error(
              "[ENTRY NILAI] Gagal mengambil nilai ujian:",
              err
            );

            nilaiUjian = [];
          }
        }

        /* =================================================
           2. NILAI RAPORT
        ================================================= */

        const results =
          await Promise.all(
            students.map(
              async (student) => {
                try {
                  const result =
                    await getRaportSiswa(
                      String(
                        student.id
                      ),
                      String(
                        tahunAjaranId
                      )
                    );

                  const data =
                    getResultData(
                      result
                    );

                  const akademik =
                    Array.isArray(
                      data?.akademik
                    )
                      ? data.akademik
                      : [];

                  return {
                    studentId:
                      student.id,
                    akademik,
                    error: null,
                  };
                } catch (err) {
                  console.error(
                    `[ENTRY NILAI] Gagal mengambil raport siswa ${student.id}:`,
                    err
                  );

                  return {
                    studentId:
                      student.id,
                    akademik: [],
                    error:
                      err?.message ||
                      "Nilai belum tersedia.",
                  };
                }
              }
            )
          );

        if (cancelled) {
          return;
        }

        /* =================================================
           3. UPDATE DATA SISWA
        ================================================= */

        setStudents(
          (current) =>
            current.map(
              (student) => {
                const result =
                  results.find(
                    (item) =>
                      String(
                        item.studentId
                      ) ===
                      String(
                        student.id
                      )
                  );

                const selectedMapel =
                  mapelList.find(
                    (item) =>
                      String(
                        item?.id
                      ) ===
                      String(
                        kelasMapelId
                      )
                  );

                const selectedMapelName =
                  selectedMapel
                    ?.mataPelajaran
                    ?.nama;

                let nilaiData =
                  result?.akademik ||
                  [];

                if (
                  selectedMapelName
                ) {
                  nilaiData =
                    nilaiData.filter(
                      (item) =>
                        String(
                          item?.mapel ||
                            ""
                        )
                          .trim()
                          .toLowerCase() ===
                        String(
                          selectedMapelName
                        )
                          .trim()
                          .toLowerCase()
                    );
                }

                const nilaiRaport =
                  nilaiData[0] ||
                  null;

                const scoreRaport =
                  nilaiRaport
                    ?.totalNilai !==
                    null &&
                  nilaiRaport
                    ?.totalNilai !==
                    undefined
                    ? Number(
                        nilaiRaport.totalNilai
                      )
                    : null;

                const nilaiUjianSiswa =
                  nilaiUjian.find(
                    (item) =>
                      String(
                        item?.siswaId
                      ) ===
                      String(
                        student.id
                      )
                  );

                const scoreUjian =
                  nilaiUjianSiswa
                    ?.nilai !==
                    null &&
                  nilaiUjianSiswa
                    ?.nilai !==
                    undefined
                    ? Number(
                        nilaiUjianSiswa.nilai
                      )
                    : null;

                const finalScore =
                  scoreUjian !== null
                    ? scoreUjian
                    : scoreRaport;

                return {
                  ...student,

                  nilaiAkhir:
                    finalScore,

                  nilaiUjian:
                    scoreUjian,

                  nilaiRaport:
                    scoreRaport,

                  statusUjian:
                    nilaiUjianSiswa
                      ?.status ||
                    null,

                  ujianId:
                    nilaiUjianSiswa
                      ?.ujianId ||
                    null,

                  judulUjian:
                    nilaiUjianSiswa
                      ?.judulUjian ||
                    null,

                  selesaiUjianPada:
                    nilaiUjianSiswa
                      ?.selesaiPada ||
                    null,

                  predikat:
                    finalScore !==
                    null
                      ? getGrade(
                          finalScore
                        )
                      : null,

                  kkm: nilaiRaport
                    ? Number(
                        nilaiRaport.kkm
                      ) || 75
                    : 75,

                  reportLoaded: true,

                  reportError:
                    result?.error ||
                    null,
                };
              }
            )
        );
      } catch (err) {
        console.error(
          "[ENTRY NILAI] Gagal mengambil nilai:",
          err
        );
      } finally {
        if (!cancelled) {
          setLoadingNilai(false);
        }
      }
    };

    loadNilai();

    return () => {
      cancelled = true;
    };
  }, [
    tahunAjaranId,
    kelasMapelId,
    mapelList,
    students.length,
  ]);

  /* =======================================================
     SELECTED DATA
  ======================================================= */

  const selectedTahunAjaran =
    useMemo(
      () =>
        tahunAjaranList.find(
          (item) =>
            String(item?.id) ===
            String(tahunAjaranId)
        ),
      [
        tahunAjaranList,
        tahunAjaranId,
      ]
    );

  const selectedKelas =
    useMemo(
      () =>
        kelasList.find(
          (item) =>
            String(item?.id) ===
            String(kelasId)
        ),
      [kelasList, kelasId]
    );

  const selectedMapel =
    useMemo(
      () =>
        mapelList.find(
          (item) =>
            String(item?.id) ===
            String(kelasMapelId)
        ),
      [
        mapelList,
        kelasMapelId,
      ]
    );

  const selectedMapelName =
    selectedMapel
      ?.mataPelajaran
      ?.nama ||
    "Mata Pelajaran";

  /* =======================================================
     FILTER STUDENTS
  ======================================================= */

  const filteredStudents =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLowerCase();

      if (!q) {
        return students;
      }

      return students.filter(
        (student) =>
          String(
            student.nama || ""
          )
            .toLowerCase()
            .includes(q) ||
          String(
            student.nis || ""
          )
            .toLowerCase()
            .includes(q) ||
          String(
            student.nisn || ""
          )
            .toLowerCase()
            .includes(q)
      );
    }, [
      students,
      search,
    ]);

  /* =======================================================
     STATISTIC
  ======================================================= */

  const totalStudents =
    students.length;

  const completedStudents =
    students.filter(
      (student) =>
        student.nilaiAkhir !==
          null &&
        student.nilaiAkhir !==
          undefined
    ).length;

  const incompleteStudents =
    totalStudents -
    completedStudents;

  const averageScore =
    completedStudents > 0
      ? Math.round(
          students.reduce(
            (total, student) =>
              total +
              (Number(
                student.nilaiAkhir
              ) || 0),
            0
          ) /
            completedStudents
        )
      : 0;

  /* =======================================================
     RESET
  ======================================================= */

  const resetFilter = () => {
    setSearch("");

    if (
      tahunAjaranList.length >
      0
    ) {
      const aktif =
        tahunAjaranList.find(
          (item) =>
            String(
              item?.status || ""
            )
              .trim()
              .toLowerCase() ===
            "aktif"
        ) ||
        tahunAjaranList[0];

      const selectedId =
        String(
          aktif?.id || ""
        );

      const selectedSemester =
        normalizeSemester(
          aktif?.semester
        );

      setTahunAjaranId(
        selectedId
      );

      setSemester(
        selectedSemester
      );

      setKelasId("");
      setKelasMapelId("");
      setStudents([]);
      setMapelList([]);
      setSelectedKelasData(
        null
      );
    } else {
      setTahunAjaranId("");
      setSemester("");
      setKelasId("");
      setKelasMapelId("");
      setStudents([]);
      setMapelList([]);
      setSelectedKelasData(
        null
      );
    }
  };

  /* =======================================================
     EXPORT
  ======================================================= */

  const handleExport = async () => {
    try {
      setExporting(true);
      setError("");

      const blob =
        await exportRekapNilai({
          kelasId,
          kelasMapelId,
        });

      downloadRekapNilai(
        blob,
        `rekap-nilai-${
          selectedKelas?.nama ||
          "kelas"
        }-${
          selectedMapelName ||
          "mapel"
        }.xlsx`
      );
    } catch (err) {
      console.error(
        "Export nilai gagal:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengekspor rekap nilai."
      );
    } finally {
      setExporting(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="theme-page flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1280px]">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">

                <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm">
                  <GraduationCap
                    size={23}
                    strokeWidth={2}
                  />
                </div>

                <div className="min-w-0">
                  <h1 className="theme-text text-[24px] font-bold tracking-tight sm:text-[27px]">
                    Entry Nilai
                  </h1>

                  <p className="theme-text-secondary text-sm">
                    Kelola dan lihat nilai siswa untuk e-Rapor
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">

                <button
                  type="button"
                  onClick={resetFilter}
                  className="
                    theme-card
                    theme-border
                    theme-text-secondary
                    flex
                    h-10
                    items-center
                    gap-2
                    rounded-lg
                    border
                    px-3.5
                    text-sm
                    font-medium
                    transition
                    hover:bg-theme-card-soft
                  "
                >
                  <RefreshCw size={16} />

                  <span className="hidden sm:inline">
                    Reset
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  disabled={
                    exporting ||
                    !kelasId
                  }
                  className="
                    theme-primary-outline
                    flex
                    h-10
                    items-center
                    gap-2
                    rounded-lg
                    border
                    bg-transparent
                    px-4
                    text-sm
                    font-semibold
                    transition
                    hover:bg-theme-card-soft
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {exporting ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Download size={17} />
                  )}

                  Export Excel
                </button>

              </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="theme-danger mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="font-semibold">
                    Terjadi masalah
                  </p>

                  <p className="mt-0.5 text-xs opacity-80">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                icon={Users}
                label="Total Siswa"
                value={totalStudents}
                type="blue"
              />

              <StatCard
                icon={CircleCheck}
                label="Nilai Tersedia"
                value={completedStudents}
                type="green"
              />

              <StatCard
                icon={CircleAlert}
                label="Belum Ada Nilai"
                value={incompleteStudents}
                type="orange"
              />

              <StatCard
                icon={Award}
                label="Rata-rata Nilai"
                value={averageScore}
                type="purple"
              />

            </div>

            {/* =================================================
                FILTER CARD
            ================================================= */}

            <div
              className="
                theme-card
                theme-border
                mt-5
                rounded-xl
                border
                p-4
                shadow-[0_1px_3px_rgba(15,23,42,0.08)]
                sm:p-5
              "
            >

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

                {/* TAHUN AJARAN */}

                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                    Tahun Ajaran
                  </label>

                  <div className="relative">
                    <select
                      value={
                        tahunAjaranId
                      }
                      onChange={(e) => {
                        const value =
                          e.target.value;

                        const selected =
                          tahunAjaranList.find(
                            (item) =>
                              String(
                                item?.id
                              ) ===
                              String(
                                value
                              )
                          );

                        const selectedSemester =
                          normalizeSemester(
                            selected?.semester
                          );

                        setTahunAjaranId(
                          value
                        );

                        setSemester(
                          selectedSemester
                        );

                        setKelasId("");
                        setKelasMapelId(
                          ""
                        );
                        setStudents([]);
                        setMapelList([]);
                        setSelectedKelasData(
                          null
                        );
                      }}
                      disabled={
                        loadingTahunAjaran
                      }
                      className="
                        theme-input
                        theme-border
                        h-10
                        w-full
                        appearance-none
                        rounded-lg
                        border
                        px-3.5
                        pr-9
                        text-sm
                        outline-none
                        transition
                        focus:border-theme-primary
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      <option value="">
                        {loadingTahunAjaran
                          ? "Memuat..."
                          : "Pilih Tahun Ajaran"}
                      </option>

                      {tahunAjaranList.map(
                        (item) => (
                          <option
                            key={
                              item.id
                            }
                            value={
                              item.id
                            }
                          >
                            {getTahunAjaranLabel(
                              item
                            )}
                            {item.status
                              ? ` • ${
                                  String(
                                    item.status
                                  )
                                    .trim()
                                    .toLowerCase() ===
                                  "aktif"
                                    ? "Aktif"
                                    : "Tidak Aktif"
                                }`
                              : ""}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={15}
                      className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>

                {/* SEMESTER */}

                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                    Semester
                  </label>

                  <div className="relative">
                    <select
                      value={
                        semester || ""
                      }
                      disabled
                      className="
                        theme-input
                        theme-border
                        h-10
                        w-full
                        appearance-none
                        rounded-lg
                        border
                        px-3.5
                        pr-9
                        text-sm
                        outline-none
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      <option value="">
                        -
                      </option>

                      <option value="Ganjil">
                        Semester Ganjil
                      </option>

                      <option value="Genap">
                        Semester Genap
                      </option>
                    </select>

                    <ChevronDown
                      size={15}
                      className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>

                  <p className="theme-text-muted mt-1 text-[11px]">
                    Mengikuti semester pada Tahun Ajaran
                  </p>
                </div>

                {/* KELAS */}

                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                    Kelas
                  </label>

                  <div className="relative">
                    <select
                      value={kelasId}
                      onChange={(e) => {
                        setKelasId(
                          e.target.value
                        );
                        setKelasMapelId(
                          ""
                        );
                        setStudents([]);
                        setMapelList([]);
                        setSelectedKelasData(
                          null
                        );
                      }}
                      disabled={
                        loadingKelas ||
                        !tahunAjaranId
                      }
                      className="
                        theme-input
                        theme-border
                        h-10
                        w-full
                        appearance-none
                        rounded-lg
                        border
                        px-3.5
                        pr-9
                        text-sm
                        outline-none
                        transition
                        focus:border-theme-primary
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      <option value="">
                        {loadingKelas
                          ? "Memuat..."
                          : !tahunAjaranId
                            ? "Pilih Tahun Ajaran"
                            : "Pilih Kelas"}
                      </option>

                      {kelasList.map(
                        (item) => (
                          <option
                            key={
                              item.id
                            }
                            value={
                              item.id
                            }
                          >
                            {item.nama}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={15}
                      className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>

                {/* MAPEL */}

                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                    Mata Pelajaran
                  </label>

                  <div className="relative">
                    <select
                      value={
                        kelasMapelId
                      }
                      onChange={(e) =>
                        setKelasMapelId(
                          e.target.value
                        )
                      }
                      disabled={
                        !mapelList.length
                      }
                      className="
                        theme-input
                        theme-border
                        h-10
                        w-full
                        appearance-none
                        rounded-lg
                        border
                        px-3.5
                        pr-9
                        text-sm
                        outline-none
                        transition
                        focus:border-theme-primary
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      <option value="">
                        {mapelList.length
                          ? "Pilih Mata Pelajaran"
                          : "Tidak ada mapel"}
                      </option>

                      {mapelList.map(
                        (item) => (
                          <option
                            key={
                              item.id
                            }
                            value={
                              item.id
                            }
                          >
                            {item
                              ?.mataPelajaran
                              ?.nama ||
                              "Mata Pelajaran"}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={15}
                      className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>

              </div>

              {/* SEARCH */}

              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">

                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Cari nama siswa, NIS, atau NISN..."
                    className="
                      theme-input
                      theme-border
                      h-11
                      w-full
                      rounded-lg
                      border
                      pl-10
                      pr-4
                      text-sm
                      outline-none
                      transition
                      focus:border-theme-primary
                    "
                  />
                </div>

                <div className="shrink-0">
                  <span className="theme-text-muted text-sm font-medium">
                    {
                      filteredStudents.length
                    }{" "}
                    siswa ditemukan
                  </span>
                </div>

              </div>
            </div>

            {/* =================================================
                SUBJECT INFO
            ================================================= */}

            <div
              className="
                theme-info
                mt-5
                rounded-xl
                border
                px-5
                py-4
              "
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div className="flex items-center gap-3">

                  <div className="theme-card flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm">
                    <BookOpen
                      size={19}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium opacity-80">
                      {semester || "-"} •{" "}
                      {getTahunAjaranLabel(
                        selectedTahunAjaran
                      )}
                    </p>

                    <h2 className="theme-text mt-0.5 text-sm font-bold">
                      {selectedMapelName}
                    </h2>

                    <p className="theme-text-secondary mt-0.5 text-xs">
                      Kelas{" "}
                      {selectedKelas?.nama ||
                        "-"}{" "}
                      • Data nilai dari e-Rapor
                    </p>
                  </div>

                </div>

                <div className="theme-card theme-border flex items-center gap-2 rounded-lg border px-3 py-2">

                  <ClipboardCheck
                    size={17}
                    className="text-theme-info"
                  />

                  <div>
                    <p className="theme-text-muted text-[11px]">
                      Sumber Data
                    </p>

                    <p className="theme-text text-xs font-semibold">
                      Backend SmartSchool
                    </p>
                  </div>

                </div>

              </div>
            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {(loadingSiswa ||
              loadingNilai) && (
              <div
                className="
                  theme-card
                  theme-border
                  theme-text-secondary
                  mt-5
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  px-5
                  py-8
                  text-sm
                "
              >
                <Loader2
                  size={18}
                  className="text-theme-primary animate-spin"
                />

                {loadingSiswa
                  ? "Memuat data siswa..."
                  : "Memuat nilai siswa..."}
              </div>
            )}

            {/* =================================================
                TABLE
            ================================================= */}

            {!loadingSiswa &&
              !loadingNilai && (
                <div
                  className="
                    theme-card
                    theme-border
                    mt-5
                    overflow-hidden
                    rounded-xl
                    border
                    shadow-[0_1px_3px_rgba(15,23,42,0.08)]
                  "
                >
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] border-collapse text-left">

                      <thead>
                        <tr className="theme-primary text-xs font-semibold uppercase tracking-wide">
                          <th className="w-16 px-4 py-3.5 text-center">
                            No
                          </th>

                          <th className="px-4 py-3.5">
                            Siswa
                          </th>

                          <th className="px-4 py-3.5">
                            NIS
                          </th>

                          <th className="px-4 py-3.5 text-center">
                            Nilai Akhir
                          </th>

                          <th className="px-4 py-3.5 text-center">
                            KKM
                          </th>

                          <th className="px-4 py-3.5 text-center">
                            Predikat
                          </th>

                          <th className="px-4 py-3.5 text-right">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody>

                        {filteredStudents.map(
                          (
                            student,
                            index
                          ) => {
                            const score =
                              student.nilaiAkhir;

                            const grade =
                              student.predikat ||
                              (score !==
                                null
                                ? getGrade(
                                    score
                                  )
                                : null);

                            return (
                              <tr
                                key={
                                  student.id
                                }
                                className="
                                  theme-border-soft
                                  theme-table-hover
                                  border-b
                                  transition
                                "
                              >

                                <td className="theme-text-muted px-4 py-4 text-center text-sm font-medium">
                                  {index +
                                    1}
                                </td>

                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">

                                    <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold">
                                      {student.nama
                                        .charAt(
                                          0
                                        )
                                        .toUpperCase()}
                                    </div>

                                    <div className="min-w-0">
                                      <p className="theme-text truncate text-sm font-semibold">
                                        {
                                          student.nama
                                        }
                                      </p>

                                      <p className="theme-text-muted mt-0.5 text-xs">
                                        NISN{" "}
                                        {
                                          student.nisn
                                        }
                                      </p>
                                    </div>

                                  </div>
                                </td>

                                <td className="theme-text-secondary px-4 py-4 text-sm">
                                  {student.nis}
                                </td>

                                <td className="px-4 py-4 text-center">
                                  {score !==
                                    null &&
                                  score !==
                                    undefined ? (
                                    <span className="theme-text text-sm font-bold">
                                      {score}
                                    </span>
                                  ) : (
                                    <span className="theme-text-muted text-xs font-medium">
                                      Belum ada
                                    </span>
                                  )}
                                </td>

                                <td className="theme-text-secondary px-4 py-4 text-center text-sm">
                                  {student.kkm ||
                                    75}
                                </td>

                                <td className="px-4 py-4 text-center">
                                  {grade ? (
                                    <span
                                      className={`
                                        ${getGradeStyle(
                                          grade
                                        )}
                                        inline-flex
                                        min-w-[36px]
                                        items-center
                                        justify-center
                                        rounded-md
                                        border
                                        px-2.5
                                        py-1
                                        text-xs
                                        font-bold
                                      `}
                                    >
                                      {grade}
                                    </span>
                                  ) : (
                                    <span className="theme-text-muted text-xs">
                                      -
                                    </span>
                                  )}
                                </td>

                                <td className="px-4 py-4">
                                  <div className="flex items-center justify-end">

                                    <button
                                      type="button"
                                      title="Lihat detail nilai"
                                      onClick={() =>
                                        setModalStudent(
                                          student
                                        )
                                      }
                                      className="
                                        theme-text-muted
                                        flex
                                        h-8
                                        w-8
                                        items-center
                                        justify-center
                                        rounded-md
                                        transition
                                        hover:bg-theme-card-soft
                                        hover:text-theme-primary
                                      "
                                    >
                                      <Eye
                                        size={
                                          16
                                        }
                                      />
                                    </button>

                                  </div>
                                </td>

                              </tr>
                            );
                          }
                        )}

                        {filteredStudents.length ===
                          0 && (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-5 py-16 text-center"
                            >
                              <div className="theme-card-soft theme-text-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                                <Search
                                  size={
                                    21
                                  }
                                />
                              </div>

                              <p className="theme-text mt-3 text-sm font-semibold">
                                Siswa tidak ditemukan
                              </p>

                              <p className="theme-text-muted mt-1 text-xs">
                                Coba ubah kata kunci pencarian.
                              </p>
                            </td>
                          </tr>
                        )}

                      </tbody>
                    </table>
                  </div>

                  {/* FOOTER */}

                  <div className="theme-border-soft flex flex-col gap-2 border-t px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="theme-text-muted text-xs">
                      Menampilkan{" "}
                      <span className="theme-text font-medium">
                        {
                          filteredStudents.length
                        }
                      </span>{" "}
                      dari{" "}
                      <span className="theme-text font-medium">
                        {
                          students.length
                        }
                      </span>{" "}
                      siswa
                    </p>

                    <p className="theme-text-muted text-xs">
                      Nilai ditampilkan berdasarkan data dari backend.
                    </p>
                  </div>
                </div>
              )}

            {/* =================================================
                INFO
            ================================================= */}

            <div className="theme-warning mt-5 rounded-xl border px-5 py-4">
              <div className="flex gap-3">

                <div className="theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                  <ClipboardCheck
                    size={18}
                  />
                </div>

                <div>
                  <p className="theme-text text-sm font-semibold">
                    Informasi Data Nilai
                  </p>

                  <p className="theme-text-secondary mt-1 text-xs leading-5">
                    Halaman ini sudah mengambil data
                    tahun ajaran, kelas, siswa, mata
                    pelajaran, dan nilai dari backend
                    SmartSchool. Endpoint backend yang
                    tersedia saat ini belum menyediakan
                    API untuk input atau update nilai.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>

      {/* =====================================================
          DETAIL NILAI MODAL
      ===================================================== */}

      {modalStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">

          <div
            className="
              theme-card
              theme-border
              w-full
              max-w-lg
              overflow-hidden
              rounded-2xl
              border
              shadow-2xl
            "
          >

            {/* HEADER */}

            <div className="theme-border flex items-center justify-between border-b px-5 py-4 sm:px-6">

              <div>
                <h2 className="theme-text text-lg font-bold">
                  Detail Nilai Siswa
                </h2>

                <p className="theme-text-secondary mt-0.5 text-xs">
                  {modalStudent.nama}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalStudent(null)
                }
                className="
                  theme-text-muted
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  transition
                  hover:bg-theme-card-soft
                  hover:text-theme-text
                "
              >
                <X size={18} />
              </button>

            </div>

            {/* BODY */}

            <div className="p-5 sm:p-6">

              <div className="theme-card-soft mb-5 flex items-center gap-3 rounded-xl p-4">

                <div className="theme-primary flex h-11 w-11 items-center justify-center rounded-lg">
                  <GraduationCap
                    size={20}
                  />
                </div>

                <div>
                  <p className="theme-text text-sm font-semibold">
                    {modalStudent.nama}
                  </p>

                  <p className="theme-text-secondary mt-0.5 text-xs">
                    NIS{" "}
                    {modalStudent.nis}{" "}
                    •{" "}
                    {selectedKelas?.nama ||
                      "-"}
                  </p>
                </div>

              </div>

              {/* NILAI */}

              <div className="theme-card theme-border rounded-xl border p-5">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="theme-text-muted text-xs">
                      Mata Pelajaran
                    </p>

                    <p className="theme-text mt-1 text-sm font-semibold">
                      {selectedMapelName}
                    </p>
                  </div>

                  <BookOpen
                    size={20}
                    className="text-theme-primary"
                  />

                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">

                  <div className="theme-card-soft theme-border rounded-lg border p-4">

                    <p className="theme-text-muted text-xs">
                      Nilai Akhir
                    </p>

                    <p className="theme-text mt-2 text-2xl font-bold">
                      {modalStudent.nilaiAkhir !==
                      null
                        ? modalStudent.nilaiAkhir
                        : "-"}
                    </p>

                  </div>

                  <div className="theme-card-soft theme-border rounded-lg border p-4">

                    <p className="theme-text-muted text-xs">
                      KKM
                    </p>

                    <p className="theme-text mt-2 text-2xl font-bold">
                      {modalStudent.kkm}
                    </p>

                  </div>

                </div>

                <div className="theme-info mt-4 flex items-center justify-between rounded-xl border px-4 py-4">

                  <div>
                    <p className="text-xs font-medium">
                      Predikat
                    </p>

                    <p className="theme-text-secondary mt-1 text-sm font-semibold">
                      Berdasarkan nilai akhir
                    </p>
                  </div>

                  {modalStudent.predikat ? (
                    <span
                      className={`
                        ${getGradeStyle(
                          modalStudent.predikat
                        )}
                        inline-flex
                        min-w-[40px]
                        justify-center
                        rounded-md
                        border
                        px-3
                        py-1
                        text-sm
                        font-bold
                      `}
                    >
                      {
                        modalStudent.predikat
                      }
                    </span>
                  ) : (
                    <span className="theme-text-muted text-sm">
                      Belum ada
                    </span>
                  )}

                </div>

              </div>

              {/* INFO */}

              <div className="theme-warning mt-4 rounded-lg border px-4 py-3">

                <p className="theme-text-secondary text-xs leading-5">
                  Backend saat ini mengirimkan
                  nilai yang sudah diagregasi.
                  Rincian Tugas, UTS, UAS, dan
                  Praktik belum tersedia melalui
                  endpoint raport.
                </p>

              </div>

            </div>

            {/* FOOTER */}

            <div className="theme-border flex justify-end border-t px-5 py-4 sm:px-6">

              <button
                type="button"
                onClick={() =>
                  setModalStudent(null)
                }
                className="
                  theme-card
                  theme-border
                  theme-text-secondary
                  h-10
                  rounded-lg
                  border
                  px-5
                  text-sm
                  font-medium
                  transition
                  hover:bg-theme-card-soft
                "
              >
                Tutup
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}