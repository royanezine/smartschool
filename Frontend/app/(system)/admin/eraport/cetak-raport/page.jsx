"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Filter,
  Loader2,
  Printer,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import {
  getRaportSiswa,
  getKelas,
  getDetailKelas,
  getTahunAjaran,
} from "../../../../../services/raport.service";

import {
  getNilaiUjianUntukKelas,
} from "../../../../../services/ujian.service";

/* =========================================================
   CONSTANT
========================================================= */

const ITEMS_PER_PAGE = 10;

/* =========================================================
   GENERIC RESPONSE HELPER
========================================================= */

const getRows = (result) => {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  if (Array.isArray(result?.data?.data)) {
    return result.data.data;
  }

  if (Array.isArray(result?.data?.items)) {
    return result.data.items;
  }

  if (Array.isArray(result?.data?.rows)) {
    return result.data.rows;
  }

  if (Array.isArray(result?.data?.siswa)) {
    return result.data.siswa;
  }

  if (Array.isArray(result?.data?.users)) {
    return result.data.users;
  }

  if (Array.isArray(result?.data?.pengguna)) {
    return result.data.pengguna;
  }

  return [];
};

/* =========================================================
   HELPER NILAI UJIAN
========================================================= */

const getExamRows = (result) => {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  if (Array.isArray(result?.data?.data)) {
    return result.data.data;
  }

  if (Array.isArray(result?.data?.items)) {
    return result.data.items;
  }

  if (Array.isArray(result?.data?.rows)) {
    return result.data.rows;
  }

  if (Array.isArray(result?.data?.nilaiSiswa)) {
    return result.data.nilaiSiswa;
  }

  if (Array.isArray(result?.data?.percobaanUjian)) {
    return result.data.percobaanUjian;
  }

  if (Array.isArray(result?.data?.percobaanAsesmen)) {
    return result.data.percobaanAsesmen;
  }

  return [];
};

/* =========================================================
   AMBIL ID SISWA DARI DATA UJIAN
========================================================= */

const getExamStudentId = (item) => {
  if (!item || typeof item !== "object") {
    return null;
  }

  const directId =
    item?.siswaId ??
    item?.siswa_id ??
    item?.studentId ??
    item?.student_id ??
    item?.pesertaDidikId ??
    item?.peserta_didik_id;

  if (directId) {
    return String(directId);
  }

  if (item?.siswa?.id) {
    return String(item.siswa.id);
  }

  if (item?.student?.id) {
    return String(item.student.id);
  }

  if (item?.pesertaDidik?.id) {
    return String(item.pesertaDidik.id);
  }

  if (item?.peserta?.siswaId) {
    return String(item.peserta.siswaId);
  }

  if (item?.hasilUjian?.siswaId) {
    return String(item.hasilUjian.siswaId);
  }

  if (item?.hasilAsesmen?.siswaId) {
    return String(item.hasilAsesmen.siswaId);
  }

  return null;
};

/* =========================================================
   AMBIL NILAI UJIAN
========================================================= */

const getExamScore = (item) => {
  const candidates = [
    item?.nilai,
    item?.totalNilai,
    item?.score,
    item?.skor,
    item?.hasilUjian?.totalNilai,
    item?.hasilAsesmen?.totalNilai,
    item?.hasil?.totalNilai,
  ];

  for (const value of candidates) {
    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
  }

  return null;
};

/* =========================================================
   STATUS UJIAN
========================================================= */

const getExamStatus = (item) => {
  const rawStatus = String(
    item?.status ??
      item?.hasilUjian?.status ??
      item?.hasilAsesmen?.status ??
      ""
  ).toLowerCase();

  if (
    rawStatus === "selesai" ||
    rawStatus === "completed" ||
    rawStatus === "submitted"
  ) {
    return "Selesai";
  }

  return item?.status || "";
};

/* =========================================================
   PARSE NILAI UJIAN
========================================================= */

const getExamDataFromRows = (rows) => {
  const result = {};

  if (!Array.isArray(rows)) {
    return result;
  }

  rows.forEach((item) => {
    const siswaId = getExamStudentId(item);

    if (!siswaId) {
      return;
    }

    const nilai = getExamScore(item);

    if (nilai === null) {
      return;
    }

    const key = String(siswaId);

    const current = result[key];

    if (
      !current ||
      Number(nilai) > Number(current.nilai)
    ) {
      result[key] = {
        nilai: Number(nilai),
        status: getExamStatus(item),

        ujianId:
          item?.ujianId ||
          item?.asesmenId ||
          item?.id ||
          null,

        judul:
          item?.judul ||
          item?.judulUjian ||
          item?.namaUjian ||
          item?.asesmen?.judul ||
          "Ujian Online",

        selesaiPada:
          item?.selesaiPada ||
          item?.waktuSelesai ||
          item?.hasilUjian?.dibuatPada ||
          item?.hasilAsesmen?.dibuatPada ||
          null,
      };
    }
  });

  return result;
};

/* =========================================================
   PARSE DETAIL NILAI UJIAN
========================================================= */

const getExamDataFromDetail = (detail) => {
  if (!detail || typeof detail !== "object") {
    return {};
  }

  const sources = [
    detail?.nilaiSiswa,
    detail?.percobaanUjian,
    detail?.percobaanAsesmen,
    detail?.data?.nilaiSiswa,
    detail?.data?.percobaanUjian,
    detail?.data?.percobaanAsesmen,
  ];

  const rows = sources
    .filter(Array.isArray)
    .flat();

  return getExamDataFromRows(rows);
};

/* =========================================================
   NORMALIZE SISWA
========================================================= */

const normalizeStudent = (
  student,
  kelas = null,
  kelasMapelIds = []
) => {
  if (!student) {
    return null;
  }

  const siswa =
    student?.siswa ||
    student?.student ||
    student?.pesertaDidik ||
    student;

  const kelasSiswa = Array.isArray(
    siswa?.kelasSiswa
  )
    ? siswa.kelasSiswa
    : [];

  const kelasDariRelasi =
    kelasSiswa?.[0]?.kelas?.nama ||
    kelasSiswa?.[0]?.kelas?.namaKelas ||
    kelasSiswa?.[0]?.namaKelas ||
    "";

  const kelasNama =
    kelasDariRelasi ||
    kelas?.nama ||
    kelas?.namaKelas ||
    kelas?.name ||
    siswa?.kelas?.nama ||
    siswa?.kelas?.namaKelas ||
    siswa?.namaKelas ||
    siswa?.kelasNama ||
    "-";

  const id =
    siswa?.id ||
    siswa?.siswaId ||
    siswa?.siswa_id ||
    student?.siswaId ||
    student?.siswa_id ||
    student?.id;

  if (!id) {
    return null;
  }

  return {
    id: String(id),

    nama:
      siswa?.namaLengkap ||
      siswa?.nama ||
      siswa?.name ||
      "-",

    nis: String(
      siswa?.nis ||
        siswa?.nomorInduk ||
        siswa?.nomor_induk ||
        "-"
    ),

    nisn: String(
      siswa?.nisn || "-"
    ),

    kelas: kelasNama,

    kelasId:
      kelas?.id ||
      kelas?.kelasId ||
      kelas?.kelas_id ||
      siswa?.kelas?.id ||
      null,

    kelasMapelIds: Array.from(
      new Set(
        kelasMapelIds
          .filter(Boolean)
          .map(String)
      )
    ),
  };
};

/* =========================================================
   REPORT SUMMARY
========================================================= */

const getReportSummary = (report) => {
  if (!report) {
    return {
      totalMapel: 0,
      nilaiTerisi: 0,
      rataRata: 0,
      status: "Belum Dicek",
    };
  }

  const akademik = Array.isArray(
    report?.akademik
  )
    ? report.akademik
    : Array.isArray(
        report?.data?.akademik
      )
      ? report.data.akademik
      : [];

  const nilaiValid = akademik.filter(
    (item) =>
      item &&
      item.totalNilai !== null &&
      item.totalNilai !== undefined &&
      item.totalNilai !== "" &&
      !Number.isNaN(
        Number(item.totalNilai)
      )
  );

  const totalNilai =
    nilaiValid.reduce(
      (total, item) =>
        total +
        Number(item.totalNilai),
      0
    );

  const rataRata =
    nilaiValid.length > 0
      ? Math.round(
          totalNilai /
            nilaiValid.length
        )
      : 0;

  const semuaNilaiLengkap =
    akademik.length > 0 &&
    nilaiValid.length ===
      akademik.length;

  return {
    totalMapel: akademik.length,
    nilaiTerisi: nilaiValid.length,
    rataRata,

    status: semuaNilaiLengkap
      ? "Siap Dicetak"
      : akademik.length > 0
        ? "Belum Lengkap"
        : "Belum Dicek",
  };
};

/* =========================================================
   STATUS CLASS
========================================================= */

const getStatusClass = (status) => {
  if (status === "Siap Dicetak") {
    return "theme-success";
  }

  if (status === "Belum Lengkap") {
    return "theme-warning";
  }

  return "theme-card-soft theme-text-muted";
};

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  type = "blue",
}) {
  const iconClass =
    type === "green"
      ? "theme-success"
      : type === "amber"
        ? "theme-warning"
        : type === "purple"
          ? "theme-info"
          : "theme-info";

  return (
    <div className="theme-card rounded-xl border p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="theme-text-muted text-xs font-medium">
            {label}
          </p>

          <p className="theme-text mt-1 text-2xl font-bold">
            {value}
          </p>

          {description ? (
            <p className="theme-text-muted mt-1 text-[11px]">
              {description}
            </p>
          ) : null}
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function CetakRaportPage() {
  const router = useRouter();

  /* =======================================================
     STATE
  ======================================================= */

  const [students, setStudents] =
    useState([]);

  const [tahunAjaran, setTahunAjaran] =
    useState([]);

  const [selectedYearId, setSelectedYearId] =
    useState("");

  const [semester, setSemester] =
    useState("");

  const [kelasFilter, setKelasFilter] =
    useState("Semua Kelas");

  const [statusFilter, setStatusFilter] =
    useState("Semua Status");

  const [search, setSearch] =
    useState("");

  const [selectedIds, setSelectedIds] =
    useState([]);

  const [reportCache, setReportCache] =
    useState({});

  const [examScoreCache, setExamScoreCache] =
    useState({});

  const [loadingStudents, setLoadingStudents] =
    useState(true);

  const [loadingYears, setLoadingYears] =
    useState(true);

  const [loadingReports, setLoadingReports] =
    useState(false);

  const [loadingExamScores, setLoadingExamScores] =
    useState(false);

  const [error, setError] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  /* =======================================================
     LOAD TAHUN AJARAN
  ======================================================= */

  const loadTahunAjaran =
    useCallback(async () => {
      try {
        setLoadingYears(true);
        setError("");

        const result =
          await getTahunAjaran();

        const rows =
          getRows(result);

        const normalized =
          rows
            .map((item) => ({
              id: item?.id
                ? String(item.id)
                : "",

              nama:
                item?.nama ||
                item?.namaTahunAjaran ||
                item?.tahunAjaran ||
                item?.name ||
                "-",

              semester:
                item?.semester ||
                item?.semesterAktif ||
                "",

              status:
                item?.status ||
                "",
            }))
            .filter(
              (item) => item.id
            );

        setTahunAjaran(
          normalized
        );

        const tahunAktif =
          normalized.find(
            (item) =>
              String(
                item.status
              ).toLowerCase() ===
              "aktif"
          ) ||
          normalized[0];

        if (tahunAktif) {
          setSelectedYearId(
            tahunAktif.id
          );

          setSemester(
            tahunAktif.semester ||
              ""
          );
        }
      } catch (err) {
        console.error(
          "Gagal mengambil tahun ajaran:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil data tahun ajaran."
        );
      } finally {
        setLoadingYears(false);
      }
    }, []);

  /* =======================================================
     LOAD SISWA
  ======================================================= */

  const loadStudents =
    useCallback(async () => {
      if (!selectedYearId) {
        setStudents([]);
        return;
      }

      try {
        setLoadingStudents(true);
        setError("");

        const kelasResult =
          await getKelas({
            page: 1,
            limit: 100,
            tahunAjaranId:
              selectedYearId,
          });

        const kelasRows =
          getRows(kelasResult);

        const detailResults =
          await Promise.all(
            kelasRows.map(
              async (kelas) => {
                try {
                  const result =
                    await getDetailKelas(
                      kelas.id
                    );

                  const detail =
                    result?.data?.data ||
                    result?.data ||
                    result ||
                    null;

                  return {
                    kelas,
                    detail,
                  };
                } catch (err) {
                  console.error(
                    `Gagal mengambil detail kelas ${kelas?.id}:`,
                    err
                  );

                  return {
                    kelas,
                    detail: null,
                  };
                }
              }
            )
          );

        const normalized =
          detailResults.flatMap(
            ({
              kelas,
              detail,
            }) => {
              const anggota =
                Array.isArray(
                  detail?.anggota
                )
                  ? detail.anggota
                  : Array.isArray(
                      detail?.data?.anggota
                    )
                    ? detail.data
                        .anggota
                    : [];

              const kelasMapelRows =
                detail?.kelasMapel ||
                detail?.kelasMapels ||
                detail?.mapelKelas ||
                detail?.mataPelajaranKelas ||
                detail?.data?.kelasMapel ||
                detail?.data?.kelasMapels ||
                kelas?.kelasMapel ||
                kelas?.kelasMapels ||
                [];

              const kelasMapelIds =
                Array.isArray(
                  kelasMapelRows
                )
                  ? kelasMapelRows
                      .map(
                        (item) =>
                          item?.id ||
                          item?.kelasMapelId ||
                          item?.kelas_mapel_id
                      )
                      .filter(Boolean)
                      .map(String)
                  : [];

              return anggota
                .map(
                  (anggotaItem) => {
                    const siswa =
                      anggotaItem?.siswa ||
                      anggotaItem?.student ||
                      anggotaItem;

                    return normalizeStudent(
                      siswa,
                      kelas,
                      kelasMapelIds
                    );
                  }
                )
                .filter(Boolean);
            }
          );

        const uniqueStudents =
          Array.from(
            new Map(
              normalized.map(
                (student) => [
                  student.id,
                  student,
                ]
              )
            ).values()
          );

        setStudents(
          uniqueStudents
        );

        setSelectedIds([]);
        setCurrentPage(1);
      } catch (err) {
        console.error(
          "Gagal mengambil data siswa:",
          err
        );

        setStudents([]);

        setError(
          err?.message ||
            "Gagal mengambil daftar siswa."
        );
      } finally {
        setLoadingStudents(false);
      }
    }, [selectedYearId]);

  /* =======================================================
     LOAD RAPORT
  ======================================================= */

  const loadReports =
    useCallback(
      async (
        studentList,
        yearId
      ) => {
        if (
          !studentList?.length ||
          !yearId
        ) {
          setReportCache({});
          return;
        }

        try {
          setLoadingReports(true);

          const results =
            await Promise.allSettled(
              studentList.map(
                async (student) => {
                  const result =
                    await getRaportSiswa(
                      student.id,
                      yearId
                    );

                  return {
                    studentId:
                      student.id,

                    report:
                      result?.data ||
                      result ||
                      null,
                  };
                }
              )
            );

          const nextCache = {};

          results.forEach(
            (result) => {
              if (
                result.status ===
                  "fulfilled" &&
                result.value?.studentId
              ) {
                nextCache[
                  `${yearId}:${result.value.studentId}`
                ] =
                  result.value.report;
              }
            }
          );

          setReportCache(
            nextCache
          );
        } catch (err) {
          console.error(
            "Gagal mengambil data raport:",
            err
          );

          setError(
            err?.message ||
              "Gagal mengambil data raport."
          );
        } finally {
          setLoadingReports(false);
        }
      },
      []
    );

  /* =======================================================
     LOAD NILAI UJIAN
  ======================================================= */

  const loadExamScores =
    useCallback(
      async (studentList) => {
        if (
          !studentList?.length
        ) {
          setExamScoreCache({});
          return;
        }

        try {
          setLoadingExamScores(
            true
          );

          const allKelasMapelIds =
            Array.from(
              new Set(
                studentList.flatMap(
                  (student) =>
                    Array.isArray(
                      student?.kelasMapelIds
                    )
                      ? student.kelasMapelIds
                      : []
                )
              )
            );

          if (
            !allKelasMapelIds.length
          ) {
            setExamScoreCache({});
            return;
          }

          const cache = {};

          const results =
            await Promise.allSettled(
              allKelasMapelIds.map(
                async (
                  kelasMapelId
                ) => {
                  try {
                    const result =
                      await getNilaiUjianUntukKelas(
                        kelasMapelId
                      );

                    return {
                      result,
                    };
                  } catch (err) {
                    console.error(
                      `Gagal mengambil nilai kelas-mapel ${kelasMapelId}:`,
                      err
                    );

                    return {
                      result: null,
                    };
                  }
                }
              )
            );

          results.forEach(
            (result) => {
              if (
                result.status !==
                "fulfilled"
              ) {
                return;
              }

              const rawResult =
                result.value?.result;

              const rows =
                getExamRows(
                  rawResult
                );

              const directData =
                getExamDataFromRows(
                  rows
                );

              Object.entries(
                directData
              ).forEach(
                ([
                  siswaId,
                  data,
                ]) => {
                  const old =
                    cache[siswaId];

                  if (
                    !old ||
                    Number(
                      data.nilai
                    ) >
                      Number(
                        old.nilai
                      )
                  ) {
                    cache[
                      siswaId
                    ] = data;
                  }
                }
              );

              rows.forEach(
                (item) => {
                  const detail =
                    item?.detail ||
                    item?.data ||
                    item;

                  const detailData =
                    getExamDataFromDetail(
                      detail
                    );

                  Object.entries(
                    detailData
                  ).forEach(
                    ([
                      siswaId,
                      data,
                    ]) => {
                      const old =
                        cache[
                          siswaId
                        ];

                      if (
                        !old ||
                        Number(
                          data.nilai
                        ) >
                          Number(
                            old.nilai
                          )
                      ) {
                        cache[
                          siswaId
                        ] = data;
                      }
                    }
                  );
                }
              );
            }
          );

          setExamScoreCache(
            cache
          );
        } catch (err) {
          console.error(
            "Gagal mengambil nilai ujian:",
            err
          );

          setExamScoreCache({});
        } finally {
          setLoadingExamScores(
            false
          );
        }
      },
      []
    );

  /* =======================================================
     EFFECTS
  ======================================================= */

  useEffect(() => {
    loadTahunAjaran();
  }, [loadTahunAjaran]);

  useEffect(() => {
    if (!selectedYearId) {
      return;
    }

    loadStudents();
  }, [
    selectedYearId,
    loadStudents,
  ]);

  useEffect(() => {
    if (
      !selectedYearId ||
      !students.length
    ) {
      setReportCache({});
      setExamScoreCache({});
      return;
    }

    loadReports(
      students,
      selectedYearId
    );

    loadExamScores(
      students
    );
  }, [
    selectedYearId,
    students,
    loadReports,
    loadExamScores,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    kelasFilter,
    statusFilter,
    selectedYearId,
  ]);

  /* =======================================================
     FILTER OPTIONS
  ======================================================= */

  const kelasOptions =
    useMemo(() => {
      const values =
        students
          .map(
            (student) =>
              student.kelas
          )
          .filter(
            (kelas) =>
              kelas &&
              kelas !== "-"
          );

      return [
        "Semua Kelas",
        ...Array.from(
          new Set(values)
        ),
      ];
    }, [students]);

  /* =======================================================
     REPORT KEY
  ======================================================= */

  const getReportKey =
    useCallback(
      (studentId) =>
        `${selectedYearId}:${studentId}`,
      [selectedYearId]
    );

  /* =======================================================
     FILTER STUDENTS
  ======================================================= */

  const filteredStudents =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return students.filter(
        (student) => {
          const report =
            reportCache[
              getReportKey(
                student.id
              )
            ];

          const summary =
            getReportSummary(
              report
            );

          const matchSearch =
            !keyword ||
            student.nama
              .toLowerCase()
              .includes(keyword) ||
            student.nis
              .toLowerCase()
              .includes(keyword) ||
            student.nisn
              .toLowerCase()
              .includes(keyword);

          const matchKelas =
            kelasFilter ===
              "Semua Kelas" ||
            student.kelas ===
              kelasFilter;

          const matchStatus =
            statusFilter ===
              "Semua Status" ||
            summary.status ===
              statusFilter;

          return (
            matchSearch &&
            matchKelas &&
            matchStatus
          );
        }
      );
    }, [
      students,
      reportCache,
      getReportKey,
      search,
      kelasFilter,
      statusFilter,
    ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredStudents.length /
          ITEMS_PER_PAGE
      )
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const paginatedStudents =
    filteredStudents.slice(
      (safeCurrentPage - 1) *
        ITEMS_PER_PAGE,
      safeCurrentPage *
        ITEMS_PER_PAGE
    );

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics =
    useMemo(() => {
      let siap = 0;
      let belum = 0;
      let totalNilai = 0;
      let jumlahNilai = 0;

      students.forEach(
        (student) => {
          const report =
            reportCache[
              getReportKey(
                student.id
              )
            ];

          const summary =
            getReportSummary(
              report
            );

          if (
            summary.status ===
            "Siap Dicetak"
          ) {
            siap++;
          }

          if (
            summary.status ===
              "Belum Lengkap" ||
            summary.status ===
              "Belum Dicek"
          ) {
            belum++;
          }

          if (
            summary.rataRata >
            0
          ) {
            totalNilai +=
              summary.rataRata;

            jumlahNilai++;
          }
        }
      );

      return {
        total:
          students.length,

        siap,

        belum,

        rataRata:
          jumlahNilai > 0
            ? Math.round(
                totalNilai /
                  jumlahNilai
              )
            : 0,
      };
    }, [
      students,
      reportCache,
      getReportKey,
    ]);

  /* =======================================================
     SELECT
  ======================================================= */

  const toggleStudent = (
    studentId
  ) => {
    setSelectedIds(
      (current) =>
        current.includes(
          studentId
        )
          ? current.filter(
              (id) =>
                id !==
                studentId
            )
          : [
              ...current,
              studentId,
            ]
    );
  };

  const toggleAll = () => {
    const visibleIds =
      paginatedStudents.map(
        (student) =>
          student.id
      );

    const allSelected =
      visibleIds.length >
        0 &&
      visibleIds.every(
        (id) =>
          selectedIds.includes(
            id
          )
      );

    if (allSelected) {
      setSelectedIds(
        (current) =>
          current.filter(
            (id) =>
              !visibleIds.includes(
                id
              )
          )
      );
    } else {
      setSelectedIds(
        (current) =>
          Array.from(
            new Set([
              ...current,
              ...visibleIds,
            ])
          )
      );
    }
  };

  /* =======================================================
     RESET FILTER
  ======================================================= */

  const resetFilter = () => {
    setSearch("");
    setKelasFilter(
      "Semua Kelas"
    );
    setStatusFilter(
      "Semua Status"
    );
    setSelectedIds([]);
    setCurrentPage(1);
  };

  /* =======================================================
     NAVIGASI DETAIL
  ======================================================= */

  const goToDetail = (
    student,
    autoPrint = false
  ) => {
    if (!student?.id) {
      setError(
        "ID siswa tidak ditemukan."
      );
      return;
    }

    const params =
      new URLSearchParams();

    if (selectedYearId) {
      params.set(
        "tahunAjaranId",
        selectedYearId
      );
    }

    if (semester) {
      params.set(
        "semester",
        semester
      );
    }

    if (autoPrint) {
      params.set(
        "print",
        "1"
      );
    }

    const query =
      params.toString();

    const targetUrl =
      `/admin/eraport/cetak-raport/${encodeURIComponent(
        student.id
      )}${
        query
          ? `?${query}`
          : ""
      }`;

    router.push(
      targetUrl
    );
  };

  const handleDetail = (
    student
  ) => {
    goToDetail(
      student,
      false
    );
  };

  const handlePrint = (
    student
  ) => {
    goToDetail(
      student,
      true
    );
  };

  const handleBulkPrint =
    () => {
      if (
        selectedIds.length ===
        0
      ) {
        setError(
          "Pilih minimal satu siswa terlebih dahulu."
        );
        return;
      }

      const firstStudent =
        students.find(
          (student) =>
            student.id ===
            selectedIds[0]
        );

      if (firstStudent) {
        goToDetail(
          firstStudent,
          true
        );
      }
    };

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    async () => {
      setError("");

      await loadTahunAjaran();
      await loadStudents();
    };

  /* =======================================================
     LOADING
  ======================================================= */

  const isLoading =
    loadingStudents ||
    loadingYears;

  const isProcessing =
    loadingReports ||
    loadingExamScores;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="theme-page flex min-h-screen w-full">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() =>
                    router.back()
                  }
                  className="theme-card theme-text-secondary mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition hover:opacity-75"
                  title="Kembali"
                >
                  <ArrowLeft
                    size={19}
                  />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <div className="theme-info flex h-10 w-10 items-center justify-center rounded-xl">
                      <Printer
                        size={21}
                      />
                    </div>

                    <div>
                      <h1 className="theme-text text-xl font-bold">
                        Cetak Raport Siswa
                      </h1>

                      <p className="theme-text-muted mt-0.5 text-sm">
                        Kelola preview dan
                        pencetakan raport
                        siswa.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={
                    handleRefresh
                  }
                  disabled={
                    isLoading ||
                    isProcessing
                  }
                  className="theme-card theme-text-secondary inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={17}
                    className={
                      isLoading ||
                      isProcessing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh
                </button>

                {selectedIds.length >
                0 ? (
                  <button
                    type="button"
                    onClick={
                      handleBulkPrint
                    }
                    className="theme-primary inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold"
                  >
                    <Printer
                      size={17}
                    />

                    Cetak{" "}
                    {
                      selectedIds.length
                    }{" "}
                    Raport
                  </button>
                ) : null}
              </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error ? (
              <div className="theme-danger flex items-start justify-between gap-4 rounded-lg border px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-1">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="opacity-70 transition hover:opacity-100"
                >
                  <X size={18} />
                </button>
              </div>
            ) : null}

            {/* =================================================
                INFO
            ================================================= */}

            <div className="theme-info rounded-xl border px-4 py-4">
              <div className="flex items-start gap-3">
                <FileText
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="theme-text text-sm font-semibold">
                    Informasi data raport
                  </p>

                  <p className="theme-text-secondary mt-1 text-xs leading-5">
                    Data nilai raport dan
                    nilai ujian online
                    diambil dari Backend.
                    Gunakan tombol Detail
                    untuk membuka halaman
                    raport siswa sebelum
                    mencetak.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={Users}
                label="Total Siswa"
                value={
                  statistics.total
                }
                description="Siswa terdaftar"
                type="blue"
              />

              <StatCard
                icon={
                  CheckCircle2
                }
                label="Siap Dicetak"
                value={
                  statistics.siap
                }
                description="Nilai lengkap"
                type="green"
              />

              <StatCard
                icon={FileText}
                label="Belum Lengkap"
                value={
                  statistics.belum
                }
                description="Perlu dilengkapi"
                type="amber"
              />

              <StatCard
                icon={BookOpen}
                label="Rata-rata Nilai"
                value={
                  statistics.rataRata ||
                  "-"
                }
                description="Rata-rata nilai"
                type="purple"
              />
            </div>

            {/* =================================================
                FILTER
            ================================================= */}

            <div className="theme-card rounded-xl border p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <Filter
                  size={18}
                  className="theme-text-secondary"
                />

                <h2 className="theme-text font-semibold">
                  Filter Data
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">

                {/* TAHUN AJARAN */}
                <div>
                  <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                    Tahun Ajaran
                  </label>

                  <select
                    value={
                      selectedYearId
                    }
                    onChange={(event) =>
                      setSelectedYearId(
                        event.target.value
                      )
                    }
                    disabled={
                      loadingYears
                    }
                    className="theme-input h-10 w-full rounded-lg border px-3 text-sm font-medium outline-none"
                  >
                    <option value="">
                      Pilih Tahun
                      Ajaran
                    </option>

                    {tahunAjaran.map(
                      (item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.nama}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* SEMESTER */}
                <div>
                  <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                    Semester
                  </label>

                  <select
                    value={semester}
                    onChange={(event) =>
                      setSemester(
                        event.target.value
                      )
                    }
                    className="theme-input h-10 w-full rounded-lg border px-3 text-sm font-medium outline-none"
                  >
                    <option value="">
                      Semua Semester
                    </option>

                    <option value="Ganjil">
                      Ganjil
                    </option>

                    <option value="Genap">
                      Genap
                    </option>
                  </select>
                </div>

                {/* KELAS */}
                <div>
                  <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                    Kelas
                  </label>

                  <select
                    value={
                      kelasFilter
                    }
                    onChange={(event) =>
                      setKelasFilter(
                        event.target.value
                      )
                    }
                    className="theme-input h-10 w-full rounded-lg border px-3 text-sm font-medium outline-none"
                  >
                    {kelasOptions.map(
                      (kelas) => (
                        <option
                          key={kelas}
                          value={kelas}
                        >
                          {kelas}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* STATUS */}
                <div>
                  <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                    Status Raport
                  </label>

                  <select
                    value={
                      statusFilter
                    }
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value
                      )
                    }
                    className="theme-input h-10 w-full rounded-lg border px-3 text-sm font-medium outline-none"
                  >
                    <option value="Semua Status">
                      Semua Status
                    </option>

                    <option value="Siap Dicetak">
                      Siap Dicetak
                    </option>

                    <option value="Belum Lengkap">
                      Belum Lengkap
                    </option>

                    <option value="Belum Dicek">
                      Belum Dicek
                    </option>
                  </select>
                </div>

                {/* SEARCH */}
                <div>
                  <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                    Cari Siswa
                  </label>

                  <div className="relative">
                    <Search
                      size={17}
                      className="theme-text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value
                        )
                      }
                      placeholder="Nama, NIS, atau NISN..."
                      className="theme-input h-10 w-full rounded-lg border pl-10 pr-3 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={
                    resetFilter
                  }
                  className="theme-sidebar-text-active theme-sidebar-hover rounded-lg px-3 py-2 text-xs font-semibold transition"
                >
                  Reset Filter
                </button>
              </div>
            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="theme-card overflow-hidden rounded-xl border shadow-sm">
              <div className="theme-card-soft flex flex-col gap-2 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="theme-text font-semibold">
                    Data Raport Siswa
                  </h2>

                  <p className="theme-text-muted mt-1 text-xs">
                    {
                      filteredStudents.length
                    }{" "}
                    siswa ditemukan
                  </p>
                </div>

                {selectedIds.length >
                0 ? (
                  <span className="theme-sidebar-text-active text-xs font-semibold">
                    {
                      selectedIds.length
                    }{" "}
                    siswa dipilih
                  </span>
                ) : null}
              </div>

              {isLoading ||
              isProcessing ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center">
                  <Loader2
                    size={32}
                    className="theme-text-secondary animate-spin"
                  />

                  <p className="theme-text mt-3 text-sm font-semibold">
                    {loadingStudents
                      ? "Mengambil data siswa..."
                      : loadingReports
                        ? "Mengambil data raport..."
                        : "Mengambil nilai ujian online..."}
                  </p>

                  <p className="theme-text-muted mt-1 text-xs">
                    Mohon tunggu
                    sebentar.
                  </p>
                </div>
              ) : paginatedStudents.length ===
                0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
                  <div className="theme-card-soft theme-text-muted flex h-14 w-14 items-center justify-center rounded-xl">
                    <Users
                      size={25}
                    />
                  </div>

                  <h3 className="theme-text mt-4 font-semibold">
                    Data tidak
                    ditemukan
                  </h3>

                  <p className="theme-text-muted mt-1 max-w-md text-sm">
                    Belum ada siswa
                    yang sesuai
                    dengan filter
                    yang dipilih.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1150px]">
                      <thead className="theme-table-header">
                        <tr>
                          <th className="w-12 px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={
                                paginatedStudents.length >
                                  0 &&
                                paginatedStudents.every(
                                  (
                                    student
                                  ) =>
                                    selectedIds.includes(
                                      student.id
                                    )
                                )
                              }
                              onChange={
                                toggleAll
                              }
                              className="h-4 w-4"
                            />
                          </th>

                          <th className="w-14 px-4 py-3 text-center text-xs font-semibold">
                            No
                          </th>

                          <th className="px-4 py-3 text-left text-xs font-semibold">
                            Siswa
                          </th>

                          <th className="px-4 py-3 text-left text-xs font-semibold">
                            NIS / NISN
                          </th>

                          <th className="px-4 py-3 text-left text-xs font-semibold">
                            Kelas
                          </th>

                          <th className="px-4 py-3 text-center text-xs font-semibold">
                            Nilai Ujian
                          </th>

                          <th className="px-4 py-3 text-center text-xs font-semibold">
                            Rata-rata
                          </th>

                          <th className="px-4 py-3 text-center text-xs font-semibold">
                            Status
                          </th>

                          <th className="px-5 py-3 text-right text-xs font-semibold">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {paginatedStudents.map(
                          (
                            student,
                            index
                          ) => {
                            const report =
                              reportCache[
                                getReportKey(
                                  student.id
                                )
                              ];

                            const summary =
                              getReportSummary(
                                report
                              );

                            const examData =
                              examScoreCache[
                                String(
                                  student.id
                                )
                              ];

                            const examScore =
                              examData?.nilai;

                            const selected =
                              selectedIds.includes(
                                student.id
                              );

                            return (
                              <tr
                                key={
                                  student.id
                                }
                                className={`theme-table-hover border-b last:border-b-0 ${
                                  selected
                                    ? "theme-selected"
                                    : ""
                                }`}
                              >
                                {/* CHECKBOX */}
                                <td className="px-4 py-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={
                                      selected
                                    }
                                    onChange={() =>
                                      toggleStudent(
                                        student.id
                                      )
                                    }
                                    className="h-4 w-4"
                                  />
                                </td>

                                {/* NO */}
                                <td className="theme-text-secondary px-4 py-4 text-center text-sm">
                                  {(safeCurrentPage -
                                    1) *
                                    ITEMS_PER_PAGE +
                                    index +
                                    1}
                                </td>

                                {/* SISWA */}
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold">
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
                                        NIS{" "}
                                        {
                                          student.nis
                                        }
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* NIS / NISN */}
                                <td className="px-4 py-4">
                                  <p className="theme-text-secondary text-sm font-medium">
                                    {
                                      student.nis
                                    }
                                  </p>

                                  <p className="theme-text-muted mt-0.5 text-xs">
                                    NISN{" "}
                                    {
                                      student.nisn
                                    }
                                  </p>
                                </td>

                                {/* KELAS */}
                                <td className="theme-text-secondary px-4 py-4 text-sm font-medium">
                                  {
                                    student.kelas
                                  }
                                </td>

                                {/* NILAI UJIAN */}
                                <td className="px-4 py-4 text-center">
                                  {examScore !==
                                    undefined &&
                                  examScore !==
                                    null ? (
                                    <div className="flex flex-col items-center">
                                      <span className="theme-sidebar-text-active text-base font-bold">
                                        {Number(
                                          examScore
                                        ).toFixed(
                                          2
                                        )}
                                      </span>

                                      <span className="theme-text-muted mt-0.5 text-[11px]">
                                        {
                                          examData?.judul
                                        }
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="theme-text-muted text-xs">
                                      Belum ada
                                    </span>
                                  )}
                                </td>

                                {/* RATA-RATA */}
                                <td className="px-4 py-4 text-center">
                                  <span className="theme-text text-sm font-bold">
                                    {summary.rataRata ||
                                      "-"}
                                  </span>
                                </td>

                                {/* STATUS */}
                                <td className="px-4 py-4 text-center">
                                  <span
                                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                                      summary.status
                                    )}`}
                                  >
                                    {
                                      summary.status
                                    }
                                  </span>
                                </td>

                                {/* AKSI */}
                                <td className="px-5 py-4">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDetail(
                                          student
                                        )
                                      }
                                      title="Lihat detail raport"
                                      className="theme-card theme-text-secondary theme-sidebar-hover flex h-9 w-9 items-center justify-center rounded-lg border transition"
                                    >
                                      <Eye
                                        size={
                                          17
                                        }
                                      />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handlePrint(
                                          student
                                        )
                                      }
                                      disabled={
                                        !report ||
                                        summary.status !==
                                          "Siap Dicetak"
                                      }
                                      title="Cetak raport"
                                      className="theme-primary flex h-9 w-9 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      <Printer
                                        size={
                                          17
                                        }
                                      />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* =================================================
                      PAGINATION
                  ================================================= */}

                  <div className="theme-card-soft flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="theme-text-muted text-sm">
                      Menampilkan{" "}
                      <span className="theme-text font-semibold">
                        {filteredStudents.length ===
                        0
                          ? 0
                          : (safeCurrentPage -
                              1) *
                              ITEMS_PER_PAGE +
                            1}
                      </span>{" "}
                      -{" "}
                      <span className="theme-text font-semibold">
                        {Math.min(
                          safeCurrentPage *
                            ITEMS_PER_PAGE,
                          filteredStudents.length
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="theme-text font-semibold">
                        {
                          filteredStudents.length
                        }
                      </span>{" "}
                      siswa
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage(
                            (page) =>
                              Math.max(
                                1,
                                page - 1
                              )
                          )
                        }
                        disabled={
                          safeCurrentPage ===
                          1
                        }
                        className="theme-card theme-text-secondary flex h-9 w-9 items-center justify-center rounded-lg border transition hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft
                          size={17}
                        />
                      </button>

                      <span className="theme-text min-w-[70px] text-center text-xs font-semibold">
                        {safeCurrentPage}{" "}
                        /{" "}
                        {totalPages}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage(
                            (page) =>
                              Math.min(
                                totalPages,
                                page + 1
                              )
                          )
                        }
                        disabled={
                          safeCurrentPage ===
                          totalPages
                        }
                        className="theme-card theme-text-secondary flex h-9 w-9 items-center justify-center rounded-lg border transition hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRight
                          size={17}
                        />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* =================================================
                FOOTER INFO
            ================================================= */}

            <div className="theme-card-soft rounded-xl border p-4">
              <div className="flex gap-3">
                <FileText
                  size={18}
                  className="theme-text-secondary mt-0.5 shrink-0"
                />

                <div>
                  <p className="theme-text text-sm font-semibold">
                    Informasi Cetak Raport
                  </p>

                  <p className="theme-text-secondary mt-1 text-xs leading-5">
                    Raport dapat dicetak
                    melalui halaman detail
                    siswa. Gunakan checkbox
                    untuk memilih beberapa
                    siswa sebelum menjalankan
                    aksi cetak.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}