"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Printer,
  User,
  ClipboardCheck,
} from "lucide-react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  getRaportSiswa,
  getTahunAjaran,
  getKelas,
  getDetailKelas,
} from "@/services/raport.service";

import {
  getNilaiUjianUntukKelas,
} from "@/services/ujian.service";

/* =========================================================
   HELPER
========================================================= */

const getResultData = (result) => {
  if (result?.data?.data) {
    return result.data.data;
  }

  return result?.data || null;
};

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

  if (Array.isArray(result?.items)) {
    return result.items;
  }

  if (Array.isArray(result?.rows)) {
    return result.rows;
  }

  return [];
};

const normalizeId = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  return String(value);
};

const formatNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(Number(value))
  ) {
    return "-";
  }

  const number = Number(value);

  if (Number.isInteger(number)) {
    return number;
  }

  return Number(number.toFixed(2));
};

/* =========================================================
   STATUS / BADGE THEME
========================================================= */

const getPredikatClass = (predikat) => {
  switch (predikat) {
    case "A":
      return "theme-success";

    case "B":
      return "theme-info";

    case "C":
      return "theme-warning";

    case "D":
      return "theme-danger";

    default:
      return "theme-card-soft theme-text-muted";
  }
};

const getExamStatusClass = (status) => {
  switch (status) {
    case "selesai":
      return "theme-success";

    case "berlangsung":
      return "theme-info";

    default:
      return "theme-warning";
  }
};

/* =========================================================
   NORMALIZE NILAI UJIAN
========================================================= */

const getStudentIdFromNilai = (item) => {
  return normalizeId(
    item?.siswaId ||
      item?.siswa?.id ||
      item?.penggunaId ||
      item?.pengguna?.id ||
      item?.studentId ||
      item?.student?.id ||
      item?.userId ||
      item?.user?.id
  );
};

const getStudentNameFromNilai = (item) => {
  return (
    item?.siswa?.namaLengkap ||
    item?.siswa?.nama ||
    item?.pengguna?.namaLengkap ||
    item?.pengguna?.nama ||
    item?.student?.namaLengkap ||
    item?.student?.nama ||
    item?.user?.namaLengkap ||
    item?.user?.nama ||
    item?.namaLengkap ||
    item?.namaSiswa ||
    item?.nama ||
    "-"
  );
};

const getNilaiFromItem = (item) => {
  const candidates = [
    item?.nilai,
    item?.totalNilai,
    item?.hasilUjian?.totalNilai,
    item?.hasilAsesmen?.totalNilai,
    item?.hasil?.totalNilai,
    item?.hasil?.nilai,
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

const getStatusFromItem = (item) => {
  const status = String(
    item?.status ||
      item?.statusPengerjaan ||
      item?.statusPercobaan ||
      item?.statusUjian ||
      item?.statusAsesmen ||
      item?.hasilUjian?.status ||
      item?.hasilAsesmen?.status ||
      ""
  ).toLowerCase();

  if (
    status === "selesai" ||
    status === "completed" ||
    status === "complete" ||
    status === "submitted" ||
    status === "submit" ||
    status === "dikumpulkan" ||
    status === "sudah_mengerjakan"
  ) {
    return "selesai";
  }

  if (
    item?.selesaiPada ||
    item?.waktuSelesai ||
    item?.submittedAt ||
    item?.dikumpulkanPada
  ) {
    return "selesai";
  }

  if (
    status === "berlangsung" ||
    status === "sedang_mengerjakan" ||
    status === "in_progress" ||
    status === "progress" ||
    status === "ongoing" ||
    status === "mengerjakan"
  ) {
    return "berlangsung";
  }

  return status || "belum_mengerjakan";
};

const extractNilaiUjian = (result) => {
  const output = [];

  const pushItems = (items) => {
    if (!Array.isArray(items)) {
      return;
    }

    items.forEach((item) => {
      if (item) {
        output.push(item);
      }
    });
  };

  if (Array.isArray(result)) {
    pushItems(result);
  }

  if (Array.isArray(result?.data)) {
    pushItems(result.data);
  }

  if (Array.isArray(result?.data?.data)) {
    pushItems(result.data.data);
  }

  if (Array.isArray(result?.data?.items)) {
    pushItems(result.data.items);
  }

  if (Array.isArray(result?.data?.rows)) {
    pushItems(result.data.rows);
  }

  if (Array.isArray(result?.items)) {
    pushItems(result.items);
  }

  if (Array.isArray(result?.rows)) {
    pushItems(result.rows);
  }

  const detail =
    result?.data?.data ||
    result?.data ||
    result ||
    {};

  pushItems(detail?.nilaiSiswa);
  pushItems(detail?.percobaanUjian);
  pushItems(detail?.percobaanAsesmen);

  pushItems(detail?.data?.nilaiSiswa);
  pushItems(detail?.data?.percobaanUjian);
  pushItems(detail?.data?.percobaanAsesmen);

  return output;
};

/* =========================================================
   PAGE
========================================================= */

export default function DetailRaportPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const siswaId = params?.siswaId
    ? String(params.siswaId)
    : "";

  const tahunAjaranId =
    searchParams.get("tahunAjaranId") || "";

  const shouldPrint =
    searchParams.get("print") === "1";

  const semesterFromUrl =
    searchParams.get("semester") || "";

  const [report, setReport] = useState(null);
  const [tahunAjaran, setTahunAjaran] =
    useState(null);

  const [nilaiUjian, setNilaiUjian] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingNilaiUjian, setLoadingNilaiUjian] =
    useState(false);

  const [printing, setPrinting] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD RAPORT
  ======================================================= */

  const loadReport = useCallback(async () => {
    if (!siswaId) {
      setError("ID siswa tidak ditemukan.");
      setLoading(false);
      return;
    }

    if (!tahunAjaranId) {
      setError(
        "Tahun ajaran tidak ditemukan. Silakan kembali ke halaman cetak raport."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await getRaportSiswa(
        siswaId,
        tahunAjaranId
      );

      const data = getResultData(result);

      if (!data) {
        throw new Error(
          "Data raport siswa tidak ditemukan."
        );
      }

      setReport(data);
    } catch (err) {
      console.error(
        "Gagal mengambil detail raport:",
        err
      );

      setReport(null);

      setError(
        err?.message ||
          "Gagal mengambil data raport siswa."
      );
    } finally {
      setLoading(false);
    }
  }, [siswaId, tahunAjaranId]);

  /* =======================================================
     LOAD TAHUN AJARAN
  ======================================================= */

  const loadTahunAjaran =
    useCallback(async () => {
      if (!tahunAjaranId) {
        return;
      }

      try {
        const result =
          await getTahunAjaran();

        const rows = getRows(result);

        const selected = rows.find(
          (item) =>
            String(item?.id) ===
            String(tahunAjaranId)
        );

        if (selected) {
          setTahunAjaran(selected);
        }
      } catch (err) {
        console.error(
          "Gagal mengambil tahun ajaran:",
          err
        );
      }
    }, [tahunAjaranId]);

  /* =======================================================
     LOAD NILAI UJIAN
  ======================================================= */

  const loadNilaiUjian =
    useCallback(async () => {
      if (!siswaId) {
        return;
      }

      try {
        setLoadingNilaiUjian(true);

        const kelasResult =
          await getKelas({
            page: 1,
            limit: 100,
            tahunAjaranId:
              tahunAjaranId || undefined,
          });

        const kelasRows =
          getRows(kelasResult);

        if (!kelasRows.length) {
          setNilaiUjian([]);
          return;
        }

        const semuaNilai = [];

        for (const kelas of kelasRows) {
          if (!kelas?.id) {
            continue;
          }

          try {
            const detailResult =
              await getDetailKelas(
                kelas.id
              );

            const detail =
              detailResult?.data?.data ||
              detailResult?.data ||
              detailResult ||
              null;

            const anggota = Array.isArray(
              detail?.anggota
            )
              ? detail.anggota
              : Array.isArray(
                  detail?.anggotaKelas
                )
              ? detail.anggotaKelas
              : Array.isArray(
                  detail?.siswa
                )
              ? detail.siswa
              : [];

            const siswaAda =
              anggota.some(
                (anggotaItem) => {
                  const siswa =
                    anggotaItem?.siswa ||
                    anggotaItem?.pengguna ||
                    anggotaItem?.student ||
                    anggotaItem?.user ||
                    anggotaItem;

                  const anggotaSiswaId =
                    anggotaItem?.siswaId ||
                    anggotaItem?.penggunaId ||
                    anggotaItem?.studentId ||
                    anggotaItem?.userId ||
                    siswa?.id;

                  return (
                    normalizeId(
                      anggotaSiswaId
                    ) ===
                    normalizeId(
                      siswaId
                    )
                  );
                }
              );

            if (!siswaAda) {
              continue;
            }

            const kelasMapelCandidates = [
              ...(Array.isArray(
                detail?.kelasMapel
              )
                ? detail.kelasMapel
                : []),

              ...(Array.isArray(
                detail?.kelasMapels
              )
                ? detail.kelasMapels
                : []),

              ...(Array.isArray(
                detail?.kelas_mapel
              )
                ? detail.kelas_mapel
                : []),

              ...(Array.isArray(
                detail?.mapel
              )
                ? detail.mapel
                : []),

              ...(Array.isArray(
                kelas?.kelasMapel
              )
                ? kelas.kelasMapel
                : []),

              ...(Array.isArray(
                kelas?.kelasMapels
              )
                ? kelas.kelasMapels
                : []),
            ];

            const kelasMapelIds =
              Array.from(
                new Set(
                  kelasMapelCandidates
                    .map(
                      (item) =>
                        item?.id ||
                        item?.kelasMapelId ||
                        item?.kelas_mapel_id
                    )
                    .filter(Boolean)
                    .map(String)
                )
              );

            for (const kelasMapelId of kelasMapelIds) {
              try {
                const result =
                  await getNilaiUjianUntukKelas(
                    kelasMapelId
                  );

                const rows =
                  extractNilaiUjian(
                    result
                  );

                rows.forEach((item) => {
                  const itemSiswaId =
                    getStudentIdFromNilai(
                      item
                    );

                  if (
                    itemSiswaId ===
                    normalizeId(
                      siswaId
                    )
                  ) {
                    semuaNilai.push({
                      ...item,

                      siswaId:
                        itemSiswaId,

                      namaLengkap:
                        getStudentNameFromNilai(
                          item
                        ),

                      nilai:
                        getNilaiFromItem(
                          item
                        ),

                      status:
                        getStatusFromItem(
                          item
                        ),
                    });
                  }
                });
              } catch (err) {
                console.warn(
                  `Gagal mengambil nilai ujian kelasMapel ${kelasMapelId}:`,
                  err
                );
              }
            }
          } catch (err) {
            console.warn(
              `Gagal mengambil detail kelas ${kelas.id}:`,
              err
            );
          }
        }

        const unique =
          Array.from(
            new Map(
              semuaNilai.map(
                (item, index) => {
                  const key =
                    item?.id ||
                    item?.percobaanUjianId ||
                    item?.percobaanAsesmenId ||
                    `${item?.siswaId}-${index}`;

                  return [
                    String(key),
                    item,
                  ];
                }
              )
            ).values()
          );

        setNilaiUjian(unique);

        console.log(
          "[DETAIL RAPORT] Nilai ujian siswa:",
          unique
        );
      } catch (err) {
        console.error(
          "[DETAIL RAPORT] Gagal mengambil nilai ujian:",
          err
        );

        setNilaiUjian([]);
      } finally {
        setLoadingNilaiUjian(
          false
        );
      }
    }, [siswaId, tahunAjaranId]);

  /* =======================================================
     EFFECT
  ======================================================= */

  useEffect(() => {
    loadReport();
    loadTahunAjaran();
  }, [
    loadReport,
    loadTahunAjaran,
  ]);

  useEffect(() => {
    loadNilaiUjian();
  }, [loadNilaiUjian]);

  /* =======================================================
     AUTO PRINT
  ======================================================= */

  useEffect(() => {
    if (
      !shouldPrint ||
      loading ||
      !report ||
      loadingNilaiUjian
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setPrinting(true);

      setTimeout(() => {
        window.print();

        setTimeout(() => {
          setPrinting(false);
        }, 500);
      }, 300);
    }, 700);

    return () =>
      clearTimeout(timer);
  }, [
    shouldPrint,
    loading,
    report,
    loadingNilaiUjian,
  ]);

  /* =======================================================
     MANUAL PRINT
  ======================================================= */

  const handlePrint = () => {
    if (!report) {
      return;
    }

    setPrinting(true);

    setTimeout(() => {
      window.print();

      setTimeout(() => {
        setPrinting(false);
      }, 500);
    }, 200);
  };

  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = () => {
    router.push(
      "/admin/eraport/cetak-raport"
    );
  };

  /* =======================================================
     DATA
  ======================================================= */

  const identitas =
    report?.identitas || {};

  const akademik =
    Array.isArray(report?.akademik)
      ? report.akademik
      : [];

  const kehadiran =
    report?.kehadiran || {};

  const catatanWaliKelas =
    report?.catatanWaliKelas || "-";

  const semester =
    semesterFromUrl ||
    tahunAjaran?.semester ||
    "";

  /* =======================================================
     NILAI UJIAN SISWA
  ======================================================= */

  const nilaiUjianSiswa =
    useMemo(() => {
      const targetId =
        normalizeId(siswaId);

      if (!targetId) {
        return [];
      }

      return nilaiUjian.filter(
        (item) => {
          const itemSiswaId =
            getStudentIdFromNilai(
              item
            );

          return (
            itemSiswaId &&
            itemSiswaId ===
              targetId
          );
        }
      );
    }, [nilaiUjian, siswaId]);

  /* =======================================================
     NILAI UJIAN SELESAI
  ======================================================= */

  const nilaiUjianSelesai =
    useMemo(() => {
      return nilaiUjianSiswa.filter(
        (item) => {
          const nilai =
            getNilaiFromItem(
              item
            );

          const status =
            getStatusFromItem(
              item
            );

          return (
            nilai !== null &&
            status === "selesai"
          );
        }
      );
    }, [nilaiUjianSiswa]);

  /* =======================================================
     NILAI UJIAN TERAKHIR
  ======================================================= */

  const nilaiUjianTerakhir =
    useMemo(() => {
      if (
        !nilaiUjianSelesai.length
      ) {
        return null;
      }

      return [
        ...nilaiUjianSelesai,
      ].sort((a, b) => {
        const dateA =
          new Date(
            a?.selesaiPada ||
              a?.waktuSelesai ||
              a?.waktuSelesaiPada ||
              a?.updatedAt ||
              a?.diperbaruiPada ||
              0
          ).getTime();

        const dateB =
          new Date(
            b?.selesaiPada ||
              b?.waktuSelesai ||
              b?.waktuSelesaiPada ||
              b?.updatedAt ||
              b?.diperbaruiPada ||
              0
          ).getTime();

        return dateB - dateA;
      })[0];
    }, [nilaiUjianSelesai]);

  const nilaiUjianTerakhirValue =
    nilaiUjianTerakhir
      ? getNilaiFromItem(
          nilaiUjianTerakhir
        )
      : null;

  /* =======================================================
     NILAI AKADEMIK
  ======================================================= */

  const totalNilai =
    akademik.reduce(
      (total, item) => {
        const nilai = Number(
          item?.totalNilai
        );

        return Number.isNaN(nilai)
          ? total
          : total + nilai;
      },
      0
    );

  const rataRata =
    akademik.length > 0
      ? Math.round(
          totalNilai /
            akademik.length
        )
      : 0;

  /* =======================================================
     RATA-RATA NILAI UJIAN
  ======================================================= */

  const rataRataUjian =
    nilaiUjianSelesai.length > 0
      ? Math.round(
          nilaiUjianSelesai.reduce(
            (total, item) => {
              const nilai =
                getNilaiFromItem(
                  item
                );

              return (
                total +
                (nilai ?? 0)
              );
            },
            0
          ) /
            nilaiUjianSelesai.length
        )
      : null;

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar />

        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          <Header />

          <main className="flex flex-1 items-center justify-center overflow-y-auto">
            <div className="flex flex-col items-center justify-center text-center">
              <Loader2
                size={36}
                className="theme-sidebar-text-active animate-spin"
              />

              <p className="theme-text mt-4 text-sm font-semibold">
                Mengambil data raport...
              </p>

              <p className="theme-text-muted mt-1 text-sm">
                Mohon tunggu sebentar.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !report) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar />

        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          <Header />

          <main className="flex flex-1 items-center justify-center overflow-y-auto p-6">
            <div className="theme-card w-full max-w-lg rounded-xl border p-8 text-center shadow-sm">
              <div className="theme-danger mx-auto flex h-14 w-14 items-center justify-center rounded-full">
                <AlertCircle size={28} />
              </div>

              <h1 className="theme-text mt-5 text-lg font-bold">
                Data Raport Tidak Ditemukan
              </h1>

              <p className="theme-text-secondary mt-2 text-sm leading-6">
                {error ||
                  "Data raport siswa tidak tersedia."}
              </p>

              <button
                type="button"
                onClick={handleBack}
                className="theme-primary mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition"
              >
                <ArrowLeft size={17} />
                Kembali ke Daftar Raport
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          html,
          body {
            background: white !important;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
          }

          .no-print {
            display: none !important;
          }

          .print-page {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-card {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            background: white !important;
            color: #0f172a !important;
          }

          .print-table {
            break-inside: avoid;
          }

          .print-section {
            break-inside: avoid;
          }

          .print-card .theme-text {
            color: #0f172a !important;
          }

          .print-card .theme-text-secondary {
            color: #475569 !important;
          }

          .print-card .theme-text-muted {
            color: #64748b !important;
          }
        }
      `}</style>

      <div className="theme-page flex h-screen w-full overflow-hidden">
        {/* SIDEBAR */}
        <div className="no-print">
          <Sidebar />
        </div>

        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          {/* HEADER */}
          <div className="no-print">
            <Header />
          </div>

          <main className="flex-1 overflow-y-auto">
            <div className="print-page mx-auto w-full max-w-[1100px] space-y-6 p-4 sm:p-6 lg:p-8">

              {/* PAGE HEADER */}
              <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="theme-card theme-text-secondary theme-sidebar-hover mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition"
                  >
                    <ArrowLeft size={19} />
                  </button>

                  <div>
                    <h1 className="theme-text text-2xl font-bold">
                      Detail Raport Siswa
                    </h1>

                    <p className="theme-text-muted mt-1 text-sm">
                      Detail nilai dan kehadiran siswa.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={
                    printing ||
                    loadingNilaiUjian
                  }
                  className="theme-primary inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {printing ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Printer size={17} />
                  )}

                  Cetak Raport
                </button>
              </div>

              {/* RAPORT */}
              <div className="print-card theme-card rounded-xl border p-5 shadow-sm sm:p-8">

                {/* HEADER RAPORT */}
                <div className="print-section theme-border border-b pb-6 text-center">
                  <h1 className="theme-text text-xl font-bold uppercase tracking-wide sm:text-2xl">
                    RAPORT HASIL BELAJAR
                  </h1>

                  <p className="theme-text-secondary mt-2 text-sm font-medium">
                    SmartSchool
                  </p>

                  <div className="theme-text-secondary mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={15} />

                      Tahun Ajaran:

                      <strong className="theme-text">
                        {tahunAjaran?.nama ||
                          "-"}
                      </strong>
                    </span>

                    <span>
                      Semester:

                      <strong className="theme-text">
                        {" "}
                        {semester || "-"}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* IDENTITAS */}
                <div className="print-section mt-6">
                  <div className="mb-3 flex items-center gap-2">
                    <User
                      size={18}
                      className="theme-sidebar-text-active"
                    />

                    <h2 className="theme-text font-bold">
                      Identitas Siswa
                    </h2>
                  </div>

                  <div className="theme-card-soft grid grid-cols-1 gap-x-8 gap-y-3 rounded-lg border p-4 sm:grid-cols-2">
                    <div>
                      <p className="theme-text-muted text-xs font-medium uppercase tracking-wide">
                        Nama Siswa
                      </p>

                      <p className="theme-text mt-1 text-sm font-semibold">
                        {identitas.nama ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <p className="theme-text-muted text-xs font-medium uppercase tracking-wide">
                        Kelas
                      </p>

                      <p className="theme-text mt-1 text-sm font-semibold">
                        {identitas.kelas ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <p className="theme-text-muted text-xs font-medium uppercase tracking-wide">
                        NIS
                      </p>

                      <p className="theme-text-secondary mt-1 text-sm">
                        {identitas.nis ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <p className="theme-text-muted text-xs font-medium uppercase tracking-wide">
                        NISN
                      </p>

                      <p className="theme-text-secondary mt-1 text-sm">
                        {identitas.nisn ||
                          "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* NILAI AKADEMIK */}
                <div className="print-section mt-8">
                  <div className="mb-3 flex items-center gap-2">
                    <BookOpen
                      size={18}
                      className="theme-sidebar-text-active"
                    />

                    <h2 className="theme-text font-bold">
                      Nilai Akademik
                    </h2>
                  </div>

                  <div className="print-table theme-card overflow-hidden rounded-lg border">
                    <table className="w-full text-left">
                      <thead className="theme-table-header">
                        <tr>
                          <th className="theme-border w-14 border-b px-4 py-3 text-center text-xs font-bold uppercase tracking-wide">
                            No
                          </th>

                          <th className="theme-border border-b px-4 py-3 text-xs font-bold uppercase tracking-wide">
                            Mata Pelajaran
                          </th>

                          <th className="theme-border w-32 border-b px-4 py-3 text-center text-xs font-bold uppercase tracking-wide">
                            Nilai
                          </th>

                          <th className="theme-border w-28 border-b px-4 py-3 text-center text-xs font-bold uppercase tracking-wide">
                            KKM
                          </th>

                          <th className="theme-border w-28 border-b px-4 py-3 text-center text-xs font-bold uppercase tracking-wide">
                            Predikat
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {akademik.length > 0 ? (
                          akademik.map(
                            (item, index) => (
                              <tr
                                key={`${item?.mapel || "mapel"}-${index}`}
                                className="theme-table-hover"
                              >
                                <td className="theme-border theme-text-secondary border-b px-4 py-3 text-center text-sm">
                                  {index + 1}
                                </td>

                                <td className="theme-border theme-text border-b px-4 py-3 text-sm font-medium">
                                  {item?.mapel ||
                                    "-"}
                                </td>

                                <td className="theme-border theme-text border-b px-4 py-3 text-center text-sm font-semibold">
                                  {formatNumber(
                                    item?.totalNilai
                                  )}
                                </td>

                                <td className="theme-border theme-text-secondary border-b px-4 py-3 text-center text-sm">
                                  {formatNumber(
                                    item?.kkm
                                  )}
                                </td>

                                <td className="theme-border border-b px-4 py-3 text-center">
                                  <span
                                    className={`inline-flex min-w-8 items-center justify-center rounded-md border px-2 py-1 text-xs font-bold ${getPredikatClass(
                                      item?.predikat
                                    )}`}
                                  >
                                    {item?.predikat ||
                                      "-"}
                                  </span>
                                </td>
                              </tr>
                            )
                          )
                        ) : (
                          <tr>
                            <td
                              colSpan={5}
                              className="theme-text-muted px-4 py-8 text-center text-sm"
                            >
                              Belum ada data nilai akademik.
                            </td>
                          </tr>
                        )}
                      </tbody>

                      {akademik.length > 0 && (
                        <tfoot>
                          <tr className="theme-table-header">
                            <td
                              colSpan={2}
                              className="theme-text border-b px-4 py-3 text-right text-sm font-bold"
                            >
                              Rata-rata
                            </td>

                            <td className="theme-sidebar-text-active border-b px-4 py-3 text-center text-sm font-bold">
                              {rataRata || "-"}
                            </td>

                            <td
                              colSpan={2}
                              className="theme-border border-b px-4 py-3"
                            />
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>

                {/* NILAI UJIAN ONLINE */}
                <div className="print-section mt-8">
                  <div className="mb-3 flex items-center gap-2">
                    <ClipboardCheck
                      size={18}
                      className="theme-sidebar-text-active"
                    />

                    <h2 className="theme-text font-bold">
                      Nilai Ujian Online
                    </h2>
                  </div>

                  <div className="theme-card overflow-hidden rounded-lg border">
                    {loadingNilaiUjian ? (
                      <div className="theme-text-muted flex items-center justify-center gap-2 px-4 py-8 text-sm">
                        <Loader2
                          size={18}
                          className="theme-sidebar-text-active animate-spin"
                        />

                        Mengambil nilai ujian...
                      </div>
                    ) : nilaiUjianSiswa.length > 0 ? (
                      <table className="w-full text-left">
                        <thead className="theme-table-header">
                          <tr>
                            <th className="theme-border w-14 border-b px-4 py-3 text-center text-xs font-bold uppercase tracking-wide">
                              No
                            </th>

                            <th className="theme-border border-b px-4 py-3 text-xs font-bold uppercase tracking-wide">
                              Ujian
                            </th>

                            <th className="theme-border w-32 border-b px-4 py-3 text-center text-xs font-bold uppercase tracking-wide">
                              Nilai
                            </th>

                            <th className="theme-border w-32 border-b px-4 py-3 text-center text-xs font-bold uppercase tracking-wide">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {nilaiUjianSiswa.map(
                            (item, index) => {
                              const nilai =
                                getNilaiFromItem(
                                  item
                                );

                              const status =
                                getStatusFromItem(
                                  item
                                );

                              const judul =
                                item?.judul ||
                                item?.judulUjian ||
                                item?.namaUjian ||
                                item?.asesmen?.judul ||
                                item?.asesmen?.nama ||
                                item?.ujian?.judul ||
                                item?.ujian?.nama ||
                                "Ujian Online";

                              return (
                                <tr
                                  key={
                                    item?.id ||
                                    item?.percobaanUjianId ||
                                    item?.percobaanAsesmenId ||
                                    index
                                  }
                                  className="theme-table-hover"
                                >
                                  <td className="theme-border theme-text-secondary border-b px-4 py-3 text-center text-sm">
                                    {index + 1}
                                  </td>

                                  <td className="theme-border theme-text border-b px-4 py-3 text-sm font-medium">
                                    {judul}
                                  </td>

                                  <td className="theme-sidebar-text-active theme-border border-b px-4 py-3 text-center text-sm font-bold">
                                    {nilai !== null
                                      ? formatNumber(
                                          nilai
                                        )
                                      : "-"}
                                  </td>

                                  <td className="theme-border border-b px-4 py-3 text-center">
                                    <span
                                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getExamStatusClass(
                                        status
                                      )}`}
                                    >
                                      {status ===
                                      "selesai"
                                        ? "Selesai"
                                        : status ===
                                          "berlangsung"
                                        ? "Berlangsung"
                                        : "Belum Mengerjakan"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <div className="theme-card-soft mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
                          <ClipboardCheck
                            size={26}
                            className="theme-text-muted"
                          />
                        </div>

                        <p className="theme-text-secondary mt-3 text-sm font-medium">
                          Belum ada nilai ujian online.
                        </p>

                        <p className="theme-text-muted mt-1 text-xs">
                          Nilai akan muncul setelah siswa menyelesaikan ujian.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* RINGKASAN NILAI UJIAN */}
                  {nilaiUjianSelesai.length >
                    0 && (
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="theme-info rounded-lg border p-4">
                        <p className="theme-text-secondary text-xs font-medium uppercase tracking-wide">
                          Rata-rata Nilai Ujian
                        </p>

                        <p className="theme-sidebar-text-active mt-1 text-2xl font-bold">
                          {rataRataUjian}
                        </p>
                      </div>

                      <div className="theme-success rounded-lg border p-4">
                        <p className="theme-text-secondary text-xs font-medium uppercase tracking-wide">
                          Ujian Terakhir
                        </p>

                        <p className="theme-success mt-1 bg-transparent p-0 text-2xl font-bold">
                          {nilaiUjianTerakhirValue !==
                          null
                            ? formatNumber(
                                nilaiUjianTerakhirValue
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* KEHADIRAN */}
                <div className="print-section mt-8">
                  <div className="mb-3 flex items-center gap-2">
                    <CheckCircle2
                      size={18}
                      className="theme-sidebar-text-active"
                    />

                    <h2 className="theme-text font-bold">
                      Kehadiran
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="theme-card rounded-lg border p-4 text-center">
                      <p className="theme-text-muted text-xs font-medium uppercase tracking-wide">
                        Hadir
                      </p>

                      <p className="theme-success mt-2 bg-transparent p-0 text-xl font-bold">
                        {kehadiran.hadir ??
                          0}
                      </p>
                    </div>

                    <div className="theme-card rounded-lg border p-4 text-center">
                      <p className="theme-text-muted text-xs font-medium uppercase tracking-wide">
                        Izin
                      </p>

                      <p className="theme-info mt-2 bg-transparent p-0 text-xl font-bold">
                        {kehadiran.izin ??
                          0}
                      </p>
                    </div>

                    <div className="theme-card rounded-lg border p-4 text-center">
                      <p className="theme-text-muted text-xs font-medium uppercase tracking-wide">
                        Sakit
                      </p>

                      <p className="theme-warning mt-2 bg-transparent p-0 text-xl font-bold">
                        {kehadiran.sakit ??
                          0}
                      </p>
                    </div>

                    <div className="theme-card rounded-lg border p-4 text-center">
                      <p className="theme-text-muted text-xs font-medium uppercase tracking-wide">
                        Alpha
                      </p>

                      <p className="theme-danger mt-2 bg-transparent p-0 text-xl font-bold">
                        {kehadiran.alpha ??
                          0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CATATAN WALI KELAS */}
                <div className="print-section mt-8">
                  <h2 className="theme-text mb-3 font-bold">
                    Catatan Wali Kelas
                  </h2>

                  <div className="theme-card-soft min-h-[100px] rounded-lg border p-4">
                    <p className="theme-text-secondary text-sm leading-7">
                      {catatanWaliKelas}
                    </p>
                  </div>
                </div>

                {/* TANDA TANGAN */}
                <div className="print-section mt-12 grid grid-cols-1 gap-10 text-center sm:grid-cols-2">
                  <div>
                    <p className="theme-text-secondary text-sm">
                      Mengetahui,
                    </p>

                    <p className="theme-text mt-1 text-sm font-semibold">
                      Wali Kelas
                    </p>

                    <div className="h-20" />

                    <div className="theme-border mx-auto w-48 border-b" />

                    <p className="theme-text-muted mt-2 text-sm">
                      ____________________
                    </p>
                  </div>

                  <div>
                    <p className="theme-text-secondary text-sm">
                      Orang Tua/Wali
                    </p>

                    <p className="theme-text mt-1 text-sm font-semibold">
                      Siswa
                    </p>

                    <div className="h-20" />

                    <div className="theme-border mx-auto w-48 border-b" />

                    <p className="theme-text mt-2 text-sm font-semibold">
                      {identitas.nama ||
                        "____________________"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}