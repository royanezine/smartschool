"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  getKelas,
  getKelasById,
} from "../../../../../services/kelas.service";

import {
  getTahunAjaran,
} from "../../../../../services/tahunAjaran.service";

import { getRaportSiswa } from "../../../../../services/raport.service";

import { getNilaiUjianUntukKelas } from "../../../../../services/ujian.service";

import {
  FileCheck2,
  ChevronDown,
  Sparkles,
  Users,
  BarChart3,
  AlertTriangle,
  Printer,
  Info,
  Loader2,
  RefreshCw,
} from "lucide-react";

/* =========================================================
   THEME HELPERS
========================================================= */

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

/* =========================================================
   RESPONSE HELPERS
========================================================= */

function getResultData(response) {
  if (!response) return null;

  if (
    response?.data?.data &&
    typeof response.data.data === "object" &&
    !Array.isArray(response.data.data)
  ) {
    return response.data.data;
  }

  if (
    response?.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }

  return response;
}

function getRows(response) {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.data?.items)) {
    return response.data.items;
  }

  return [];
}

function normalizeId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return String(value);
}

/* =========================================================
   STUDENT HELPERS
========================================================= */

function getStudentId(item) {
  if (!item) return null;

  return normalizeId(
    item?.siswaId ||
      item?.siswa?.id ||
      item?.penggunaId ||
      item?.pengguna?.id ||
      item?.studentId ||
      item?.student?.id ||
      item?.userId ||
      item?.user?.id ||
      item?.id
  );
}

function getStudentName(item) {
  if (!item) return "-";

  return (
    item?.namaLengkap ||
    item?.namaSiswa ||
    item?.siswa?.namaLengkap ||
    item?.siswa?.nama ||
    item?.pengguna?.namaLengkap ||
    item?.pengguna?.nama ||
    item?.student?.namaLengkap ||
    item?.student?.nama ||
    item?.user?.namaLengkap ||
    item?.user?.nama ||
    "Nama siswa belum tersedia"
  );
}

function getStudentNis(item) {
  if (!item) return "-";

  return (
    item?.nis ||
    item?.siswa?.nis ||
    item?.pengguna?.nis ||
    item?.student?.nis ||
    item?.user?.nis ||
    "-"
  );
}

function getStudentNisn(item) {
  if (!item) return "-";

  return (
    item?.nisn ||
    item?.siswa?.nisn ||
    item?.pengguna?.nisn ||
    item?.student?.nisn ||
    item?.user?.nisn ||
    "-"
  );
}

/* =========================================================
   NILAI UJIAN HELPERS
========================================================= */

function getNilaiFromItem(item) {
  if (!item) return null;

  const candidates = [
    item?.nilai,
    item?.totalNilai,
    item?.nilaiAkhir,
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
}

function getStatusFromItem(item) {
  if (!item) return "belum_mengerjakan";

  const status = String(
    item?.status ||
      item?.statusUjian ||
      item?.statusPercobaan ||
      item?.hasilUjian?.status ||
      item?.hasilAsesmen?.status ||
      ""
  )
    .trim()
    .toLowerCase();

  if (
    status === "selesai" ||
    status === "completed" ||
    status === "finish" ||
    status === "finished"
  ) {
    return "selesai";
  }

  if (
    status === "sedang_mengerjakan" ||
    status === "berlangsung" ||
    status === "in_progress" ||
    status === "ongoing"
  ) {
    return "berlangsung";
  }

  const nilai = getNilaiFromItem(item);

  if (nilai !== null) {
    return "selesai";
  }

  return "belum_mengerjakan";
}

function getTanggalSelesai(item) {
  return (
    item?.selesaiPada ||
    item?.waktuSelesai ||
    item?.hasilUjian?.dibuatPada ||
    item?.hasilUjian?.diperbaruiPada ||
    item?.hasilAsesmen?.dibuatPada ||
    item?.hasilAsesmen?.diperbaruiPada ||
    null
  );
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "-";
  }

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(1);
}

function formatDate(value) {
  if (!value) return "-";

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return "-";
  }
}

function getPredikat(nilai, kkm = 75) {
  if (
    nilai === null ||
    nilai === undefined ||
    Number.isNaN(Number(nilai))
  ) {
    return {
      label: "-",
      color: "slate",
    };
  }

  const value = Number(nilai);

  if (value >= 90) {
    return {
      label: "A",
      color: "emerald",
    };
  }

  if (value >= Number(kkm || 75)) {
    return {
      label: "B",
      color: "blue",
    };
  }

  if (value >= 60) {
    return {
      label: "C",
      color: "amber",
    };
  }

  return {
    label: "D",
    color: "rose",
  };
}

const colorClasses = {
  emerald: {
    badge: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
  },

  blue: {
    badge: `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,
  },

  amber: {
    badge: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
  },

  rose: {
    badge: `${themeDangerSurface} theme-danger ${themeDangerBorder}`,
  },

  slate: {
    badge: `${themeNeutralSurface} theme-text-muted ${themeNeutralBorder}`,
  },
};

/* =========================================================
   NORMALIZE ANGGOTA KELAS
========================================================= */

function normalizeAnggotaKelas(detail) {
  if (!detail) return [];

  const candidates = [
    detail?.anggota,
    detail?.anggotaKelas,
    detail?.siswa,
    detail?.siswaKelas,
    detail?.members,
    detail?.data?.anggota,
    detail?.data?.anggotaKelas,
    detail?.data?.siswa,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

/* =========================================================
   NORMALIZE NILAI UJIAN
========================================================= */

function extractNilaiUjian(response) {
  const output = [];

  const pushItem = (item, parent = {}) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const nestedArrays = [
      item?.nilaiSiswa,
      item?.percobaanUjian,
      item?.percobaanAsesmen,
      item?.data?.nilaiSiswa,
      item?.data?.percobaanUjian,
      item?.data?.percobaanAsesmen,
    ].filter(Array.isArray);

    if (nestedArrays.length > 0) {
      for (const list of nestedArrays) {
        for (const child of list) {
          output.push({
            ...parent,
            ...item,
            ...child,
          });
        }
      }

      return;
    }

    output.push({
      ...parent,
      ...item,
    });
  };

  const pushArray = (items, parent = {}) => {
    if (!Array.isArray(items)) return;

    for (const item of items) {
      pushItem(item, parent);
    }
  };

  if (Array.isArray(response)) {
    pushArray(response);
  } else {
    pushArray(response?.data);
    pushArray(response?.data?.data);
    pushArray(response?.results);
    pushArray(response?.items);
    pushArray(response?.data?.items);

    const detail = getResultData(response);

    if (detail) {
      pushArray(detail?.nilaiSiswa);
      pushArray(detail?.percobaanUjian);
      pushArray(detail?.percobaanAsesmen);

      if (
        !Array.isArray(detail?.nilaiSiswa) &&
        !Array.isArray(detail?.percobaanUjian) &&
        !Array.isArray(detail?.percobaanAsesmen)
      ) {
        pushItem(detail);
      }
    }
  }

  const unique = new Map();

  output.forEach((item, index) => {
    const siswaId = getStudentId(item);

    const key =
      normalizeId(
        item?.id ||
          item?.percobaanUjianId ||
          item?.percobaanAsesmenId ||
          `${siswaId || "unknown"}-${index}`
      ) || `nilai-${index}`;

    if (!unique.has(key)) {
      unique.set(key, item);
    }
  });

  return Array.from(unique.values());
}

/* =========================================================
   PAGE
========================================================= */

export default function GuruRaporPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [tahunAjaran, setTahunAjaran] = useState(null);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);

  const [kelasList, setKelasList] = useState([]);
  const [selectedKelasId, setSelectedKelasId] = useState("");
  const [kelasDetail, setKelasDetail] = useState(null);

  const [anggotaKelas, setAnggotaKelas] = useState([]);

  const [nilaiRaport, setNilaiRaport] = useState([]);
  const [nilaiUjian, setNilaiUjian] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingNilai, setLoadingNilai] = useState(false);
  const [error, setError] = useState("");

  const notifications = [
    {
      id: 1,
      title: "Rapat Wali Kelas",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Batas Input Nilai Rapor",
      desc: "Dikirim 5 jam lalu",
      read: false,
    },
  ];

  /* =======================================================
     LOAD TAHUN AJARAN
  ======================================================= */

  const loadTahunAjaran = useCallback(async () => {
    try {
      const response = await getTahunAjaran();

      const rows = getRows(response);

      setTahunAjaranList(rows);

      const aktif =
        rows.find(
          (item) =>
            item?.aktif === true ||
            item?.isAktif === true ||
            item?.status === "aktif"
        ) ||
        rows[0] ||
        null;

      setTahunAjaran(aktif);

      return aktif;
    } catch (err) {
      console.error("Gagal mengambil tahun ajaran:", err);
      throw err;
    }
  }, []);

  /* =======================================================
     LOAD KELAS
  ======================================================= */

  const loadKelas = useCallback(async (tahunAjaranId) => {
    if (!tahunAjaranId) {
      setKelasList([]);
      return [];
    }

    try {
      const response = await getKelas({
        tahunAjaranId,
      });

      const rows = getRows(response);

      setKelasList(rows);

      if (rows.length > 0) {
        setSelectedKelasId((current) => {
          if (
            current &&
            rows.some(
              (item) =>
                normalizeId(item?.id) ===
                normalizeId(current)
            )
          ) {
            return current;
          }

          return rows[0]?.id || "";
        });
      } else {
        setSelectedKelasId("");
      }

      return rows;
    } catch (err) {
      console.error("Gagal mengambil kelas:", err);

      setKelasList([]);
      setSelectedKelasId("");

      throw err;
    }
  }, []);

  /* =======================================================
     LOAD DETAIL KELAS
  ======================================================= */

  const loadDetailKelas = useCallback(
    async (kelasId) => {
      if (!kelasId) {
        setKelasDetail(null);
        return null;
      }

      try {
        const response = await getKelasById(kelasId);

        const detail =
          response?.data?.data ??
          response?.data ??
          response;

        setKelasDetail(detail);

        return detail;
      } catch (err) {
        console.error(
          "Gagal mengambil detail kelas:",
          err
        );

        const fallback = kelasList.find(
          (item) =>
            normalizeId(item?.id) ===
            normalizeId(kelasId)
        );

        setKelasDetail(fallback || null);

        return fallback || null;
      }
    },
    [kelasList]
  );

  /* =======================================================
     LOAD NILAI RAPORT
  ======================================================= */

  const loadNilaiRaport = useCallback(
    async (anggota, tahunAjaranId) => {
      if (
        !Array.isArray(anggota) ||
        anggota.length === 0
      ) {
        setNilaiRaport([]);
        return;
      }

      if (!tahunAjaranId) {
        setNilaiRaport([]);
        return;
      }

      const requests = anggota.map(
        async (anggotaItem) => {
          const siswa =
            anggotaItem?.siswa ||
            anggotaItem?.pengguna ||
            anggotaItem?.student ||
            anggotaItem?.user ||
            anggotaItem;

          const siswaId =
            siswa?.id ||
            anggotaItem?.siswaId ||
            anggotaItem?.penggunaId ||
            anggotaItem?.studentId ||
            anggotaItem?.userId;

          if (!siswaId) {
            return null;
          }

          try {
            const response = await getRaportSiswa(
              siswaId,
              tahunAjaranId
            );

            const report =
              getResultData(response);

            return {
              anggota: anggotaItem,
              siswa,
              siswaId: normalizeId(siswaId),
              report,
            };
          } catch (err) {
            console.warn(
              `Gagal mengambil raport siswa ${siswaId}:`,
              err
            );

            return {
              anggota: anggotaItem,
              siswa,
              siswaId: normalizeId(siswaId),
              report: null,
            };
          }
        }
      );

      const responses =
        await Promise.all(requests);

      const result = responses.filter(Boolean);

      setNilaiRaport(result);
    },
    []
  );

  /* =======================================================
     LOAD NILAI UJIAN
  ======================================================= */

  const loadNilaiUjian = useCallback(
    async (kelasId) => {
      if (!kelasId) {
        setNilaiUjian([]);
        return;
      }

      setLoadingNilai(true);

      try {
        let kelas = kelasList.find(
          (item) =>
            normalizeId(item?.id) ===
            normalizeId(kelasId)
        );

        const hasKelasMapel =
          Array.isArray(kelas?.kelasMapel) ||
          Array.isArray(kelas?.kelasMapels) ||
          Array.isArray(
            kelas?.data?.kelasMapel
          );

        if (!hasKelasMapel) {
          try {
            const detailResponse =
              await getKelasById(kelasId);

            const detailData =
              detailResponse?.data?.data ??
              detailResponse?.data ??
              detailResponse;

            if (detailData) {
              kelas = detailData;
            }
          } catch (detailError) {
            console.warn(
              "Gagal mengambil detail kelas:",
              detailError
            );
          }
        }

        const kelasMapelCandidates = [
          kelas?.kelasMapel,
          kelas?.kelasMapels,
          kelas?.data?.kelasMapel,
          kelas?.data?.kelasMapels,
          kelas?.mapel,
          kelas?.mataPelajaran,
        ];

        let kelasMapel = [];

        for (const candidate of kelasMapelCandidates) {
          if (
            Array.isArray(candidate) &&
            candidate.length > 0
          ) {
            kelasMapel = candidate;
            break;
          }
        }

        if (
          kelasMapel.length === 0 &&
          kelas?.kelasMapel &&
          typeof kelas.kelasMapel === "object" &&
          !Array.isArray(kelas.kelasMapel)
        ) {
          kelasMapel = [kelas.kelasMapel];
        }

        if (kelasMapel.length === 0) {
          const nestedCandidates = [
            kelas?.data?.data,
            kelas?.results,
            kelas?.items,
          ];

          for (const candidate of nestedCandidates) {
            if (!Array.isArray(candidate)) continue;

            const found = candidate.filter(
              (item) =>
                item?.kelasMapelId ||
                item?.kelas_mapel_id ||
                item?.mataPelajaran ||
                item?.mapel ||
                item?.kelas
            );

            if (found.length > 0) {
              kelasMapel = found;
              break;
            }
          }
        }

        if (kelasMapel.length === 0) {
          console.warn(
            "Tidak ditemukan kelasMapel untuk kelas:",
            kelasId,
            kelas
          );

          setNilaiUjian([]);
          return;
        }

        const allResults = [];

        for (const item of kelasMapel) {
          const kelasMapelId =
            item?.id ||
            item?.kelasMapelId ||
            item?.kelas_mapel_id ||
            item?.data?.id ||
            item?.data?.kelasMapelId;

          if (!kelasMapelId) {
            continue;
          }

          try {
            const response =
              await getNilaiUjianUntukKelas(
                kelasMapelId
              );

            const rows =
              extractNilaiUjian(response);

            if (!Array.isArray(rows)) {
              continue;
            }

            rows.forEach((row) => {
              if (!row) return;

              allResults.push({
                ...row,

                kelasMapelId,

                kelasId:
                  row?.kelasId ||
                  item?.kelasId ||
                  item?.kelas?.id ||
                  kelas?.id ||
                  kelasId,

                mataPelajaranId:
                  row?.mataPelajaranId ||
                  item?.mataPelajaranId ||
                  item?.mataPelajaran?.id ||
                  item?.mapelId ||
                  null,

                mataPelajaran:
                  row?.mataPelajaran ||
                  item?.mataPelajaran ||
                  item?.mapel ||
                  null,
              });
            });
          } catch (err) {
            console.warn(
              `Gagal mengambil nilai ujian kelasMapel ${kelasMapelId}:`,
              err
            );
          }
        }

        const uniqueResults = [];
        const seen = new Set();

        for (const row of allResults) {
          const studentId =
            row?.siswaId ||
            row?.siswa?.id ||
            row?.penggunaId ||
            row?.pengguna?.id ||
            row?.studentId ||
            row?.userId ||
            null;

          const examId =
            row?.ujianId ||
            row?.asesmenId ||
            row?.id ||
            row?.percobaanUjianId ||
            null;

          const key = [
            normalizeId(studentId),
            normalizeId(examId),
            normalizeId(row?.kelasMapelId),
          ].join("-");

          if (
            key === "--" ||
            key ===
              `--${normalizeId(
                row?.kelasMapelId
              )}`
          ) {
            uniqueResults.push(row);
            continue;
          }

          if (!seen.has(key)) {
            seen.add(key);
            uniqueResults.push(row);
          }
        }

        setNilaiUjian(uniqueResults);
      } catch (err) {
        console.error(
          "Gagal mengambil nilai ujian:",
          err
        );

        setNilaiUjian([]);
      } finally {
        setLoadingNilai(false);
      }
    },
    [kelasList]
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      setError("");

      try {
        const aktif =
          await loadTahunAjaran();

        if (!mounted) return;

        if (!aktif?.id) {
          setError(
            "Tahun ajaran aktif belum tersedia."
          );
          return;
        }

        await loadKelas(aktif.id);
      } catch (err) {
        console.error(err);

        if (mounted) {
          setError(
            err?.message ||
              "Gagal mengambil data tahun ajaran dan kelas."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [
    loadTahunAjaran,
    loadKelas,
  ]);

  /* =======================================================
     LOAD KETIKA KELAS BERUBAH
  ======================================================= */

  useEffect(() => {
    if (!selectedKelasId) {
      setAnggotaKelas([]);
      setNilaiRaport([]);
      setNilaiUjian([]);
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        setLoadingNilai(true);

        const detail =
          await loadDetailKelas(
            selectedKelasId
          );

        if (!mounted) return;

        const anggota =
          normalizeAnggotaKelas(detail);

        setAnggotaKelas(anggota);

        await loadNilaiRaport(
          anggota,
          tahunAjaran?.id
        );

        if (!mounted) return;

        await loadNilaiUjian(
          selectedKelasId
        );
      } catch (err) {
        console.error(
          "Gagal memuat data kelas:",
          err
        );
      } finally {
        if (mounted) {
          setLoadingNilai(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [
    selectedKelasId,
    tahunAjaran?.id,
    loadDetailKelas,
    loadNilaiRaport,
    loadNilaiUjian,
  ]);

  /* =======================================================
     DATA KELAS TERPILIH
  ======================================================= */

  const selectedKelas = useMemo(() => {
    return (
      kelasList.find(
        (item) =>
          normalizeId(item?.id) ===
          normalizeId(selectedKelasId)
      ) || null
    );
  }, [
    kelasList,
    selectedKelasId,
  ]);

  const namaKelas =
    selectedKelas?.nama ||
    selectedKelas?.namaKelas ||
    selectedKelas?.kelas ||
    kelasDetail?.nama ||
    kelasDetail?.namaKelas ||
    "-";

  /* =======================================================
     NORMALIZE DATA RAPORT SISWA
  ======================================================= */

  const dataRapor = useMemo(() => {
    const map = new Map();

    anggotaKelas.forEach(
      (anggota, index) => {
        const siswa =
          anggota?.siswa ||
          anggota?.pengguna ||
          anggota?.student ||
          anggota?.user ||
          anggota;

        const siswaId = normalizeId(
          siswa?.id ||
            anggota?.siswaId ||
            anggota?.penggunaId ||
            anggota?.studentId ||
            anggota?.userId
        );

        if (!siswaId) {
          return;
        }

        map.set(siswaId, {
          id: siswaId,
          nama:
            siswa?.namaLengkap ||
            siswa?.nama ||
            anggota?.namaLengkap ||
            anggota?.nama ||
            `Siswa ${index + 1}`,
          nis:
            siswa?.nis ||
            anggota?.nis ||
            "-",
          nisn:
            siswa?.nisn ||
            anggota?.nisn ||
            "-",
          akademik: [],
          report: null,
        });
      }
    );

    nilaiRaport.forEach((item) => {
      const siswaId = normalizeId(
        item?.siswaId ||
          item?.siswa?.id ||
          item?.anggota?.siswaId
      );

      if (!siswaId) return;

      const existing =
        map.get(siswaId) || {
          id: siswaId,
          nama:
            item?.siswa?.namaLengkap ||
            item?.siswa?.nama ||
            "Nama siswa belum tersedia",
          nis:
            item?.siswa?.nis ||
            "-",
          nisn:
            item?.siswa?.nisn ||
            "-",
          akademik: [],
          report: null,
        };

      existing.report =
        item?.report || null;

      existing.akademik =
        Array.isArray(
          item?.report?.akademik
        )
          ? item.report.akademik
          : [];

      existing.nama =
        item?.report?.identitas
          ?.namaLengkap ||
        item?.report?.identitas?.nama ||
        existing.nama;

      existing.nis =
        item?.report?.identitas?.nis ||
        existing.nis;

      existing.nisn =
        item?.report?.identitas?.nisn ||
        existing.nisn;

      map.set(siswaId, existing);
    });

    return Array.from(
      map.values()
    ).map((student) => {
      const akademik =
        Array.isArray(student.akademik)
          ? student.akademik
          : [];

      const nilaiMapel =
        akademik.find((item) => {
          const namaMapel = String(
            item?.mataPelajaran?.nama ||
              item?.mapel?.nama ||
              item?.namaMapel ||
              item?.mataPelajaranNama ||
              ""
          )
            .trim()
            .toLowerCase();

          return Boolean(namaMapel);
        });

      const nilaiCandidates =
        akademik
          .map((item) => {
            const value =
              item?.totalNilai ??
              item?.nilaiAkhir ??
              item?.nilai ??
              item?.rataRata ??
              null;

            if (
              value === null ||
              value === undefined ||
              value === ""
            ) {
              return null;
            }

            const number = Number(value);

            return Number.isNaN(number)
              ? null
              : number;
          })
          .filter(
            (value) =>
              value !== null &&
              value !== undefined
          );

      const nilaiAkhir =
        nilaiMapel?.totalNilai ??
        nilaiMapel?.nilaiAkhir ??
        nilaiMapel?.nilai ??
        (nilaiCandidates.length > 0
          ? nilaiCandidates[0]
          : null);

      const kkm =
        nilaiMapel?.kkm ??
        nilaiMapel?.KKM ??
        75;

      const predikatBackend =
        nilaiMapel?.predikat ||
        nilaiMapel?.grade ||
        null;

      const predikat =
        predikatBackend
          ? {
              label: String(
                predikatBackend
              ).toUpperCase(),
              color:
                String(
                  predikatBackend
                ).toUpperCase() === "A"
                  ? "emerald"
                  : String(
                        predikatBackend
                      ).toUpperCase() ===
                    "B"
                  ? "blue"
                  : String(
                        predikatBackend
                      ).toUpperCase() ===
                    "C"
                  ? "amber"
                  : "rose",
            }
          : getPredikat(
              nilaiAkhir,
              kkm
            );

      return {
        ...student,
        nilaiAkhir:
          nilaiAkhir !== null &&
          nilaiAkhir !== undefined
            ? Number(nilaiAkhir)
            : null,
        kkm: Number(kkm || 75),
        predikat,
        mapel:
          nilaiMapel || null,
      };
    });
  }, [
    anggotaKelas,
    nilaiRaport,
  ]);

  /* =======================================================
     NILAI UJIAN PER SISWA
  ======================================================= */

  const nilaiUjianBySiswa =
    useMemo(() => {
      const map = new Map();

      for (const item of nilaiUjian) {
        const siswaId =
          getStudentId(item);

        if (!siswaId) continue;

        const nilai =
          getNilaiFromItem(item);

        if (nilai === null) continue;

        const existing =
          map.get(siswaId);

        if (!existing) {
          map.set(siswaId, item);
          continue;
        }

        const existingDate =
          new Date(
            getTanggalSelesai(
              existing
            ) || 0
          ).getTime();

        const currentDate =
          new Date(
            getTanggalSelesai(
              item
            ) || 0
          ).getTime();

        if (
          currentDate >=
          existingDate
        ) {
          map.set(siswaId, item);
        }
      }

      return map;
    }, [nilaiUjian]);

  /* =======================================================
     GABUNG RAPORT + UJIAN
  ======================================================= */

  const dataTabel = useMemo(() => {
    return dataRapor
      .map((student) => {
        const ujian =
          nilaiUjianBySiswa.get(
            normalizeId(student.id)
          );

        const nilaiOnline =
          getNilaiFromItem(ujian);

        return {
          ...student,
          nilaiUjian:
            nilaiOnline !== null
              ? nilaiOnline
              : null,
          statusUjian: ujian
            ? getStatusFromItem(ujian)
            : "belum_mengerjakan",
          selesaiUjian: ujian
            ? getTanggalSelesai(ujian)
            : null,
        };
      })
      .sort((a, b) => {
        const nilaiA =
          a.nilaiAkhir === null
            ? -1
            : Number(a.nilaiAkhir);

        const nilaiB =
          b.nilaiAkhir === null
            ? -1
            : Number(b.nilaiAkhir);

        return nilaiB - nilaiA;
      });
  }, [
    dataRapor,
    nilaiUjianBySiswa,
  ]);

  /* =======================================================
     REKAP
  ======================================================= */

  const rekap = useMemo(() => {
    if (dataTabel.length === 0) {
      return {
        rataRata: 0,
        tuntas: 0,
        belumTuntas: 0,
        totalNilai: 0,
      };
    }

    const nilaiValid =
      dataTabel.filter(
        (student) =>
          student.nilaiAkhir !== null &&
          !Number.isNaN(
            Number(student.nilaiAkhir)
          )
      );

    const total =
      nilaiValid.reduce(
        (sum, student) =>
          sum +
          Number(student.nilaiAkhir),
        0
      );

    const rataRata =
      nilaiValid.length > 0
        ? Math.round(
            (total /
              nilaiValid.length) *
              10
          ) / 10
        : 0;

    const tuntas =
      dataTabel.filter(
        (student) =>
          student.nilaiAkhir !== null &&
          Number(student.nilaiAkhir) >=
            Number(student.kkm || 75)
      ).length;

    const belumTuntas =
      dataTabel.length - tuntas;

    return {
      rataRata,
      tuntas,
      belumTuntas,
      totalNilai: nilaiValid.length,
    };
  }, [dataTabel]);

  /* =======================================================
     MATA PELAJARAN
  ======================================================= */

  const mataPelajaran = useMemo(() => {
    const names = [];

    dataTabel.forEach((student) => {
      const name =
        student?.mapel
          ?.mataPelajaran?.nama ||
        student?.mapel?.mapel?.nama ||
        student?.mapel?.namaMapel ||
        student?.mapel
          ?.mataPelajaranNama;

      if (
        name &&
        !names.includes(name)
      ) {
        names.push(name);
      }
    });

    return names.length > 0
      ? names.join(", ")
      : "Data mata pelajaran";
  }, [dataTabel]);

  /* =======================================================
     PRINT
  ======================================================= */

  const handlePrint = () => {
    window.print();
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden theme-page">
        <Sidebar
          role="guru"
          active="rapor"
          isCollapsed={!sidebarOpen}
          setIsCollapsed={() =>
            setSidebarOpen(
              (value) => !value
            )
          }
        />

        <div className="flex flex-1 flex-col min-w-0">
          <Header
            toggleSidebar={() =>
              setSidebarOpen(
                (value) => !value
              )
            }
            notifications={notifications}
            user={{
              name: "Guru",
              email:
                "guru@smartschool.com",
              avatar: "GR",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-6 theme-page">
            <div
              className={`w-full max-w-sm rounded-2xl border ${themeNeutralBorder} theme-card p-8 text-center ${themeCardShadow}`}
            >
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${themePrimarySoft}`}
              >
                <Loader2
                  className={`h-7 w-7 animate-spin ${themePrimaryText}`}
                />
              </div>

              <h2 className="mt-5 text-base font-bold theme-text">
                Memuat data rapor
              </h2>

              <p className="mt-2 text-sm leading-6 theme-text-secondary">
                Sedang mengambil tahun
                ajaran, kelas, siswa,
                dan nilai dari backend.
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

  if (error) {
    return (
      <div className="flex h-screen overflow-hidden theme-page">
        <Sidebar
          role="guru"
          active="rapor"
          isCollapsed={!sidebarOpen}
          setIsCollapsed={() =>
            setSidebarOpen(
              (value) => !value
            )
          }
        />

        <div className="flex flex-1 flex-col min-w-0">
          <Header
            toggleSidebar={() =>
              setSidebarOpen(
                (value) => !value
              )
            }
            notifications={notifications}
            user={{
              name: "Guru",
              email:
                "guru@smartschool.com",
              avatar: "GR",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-6 theme-page">
            <div
              className={`w-full max-w-lg rounded-2xl border ${themeDangerBorder} theme-card p-8 text-center ${themeCardShadow}`}
            >
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${themeDangerSurface}`}
              >
                <AlertTriangle
                  className="h-7 w-7 theme-danger"
                />
              </div>

              <h2 className="mt-5 text-base font-bold theme-text">
                Data gagal dimuat
              </h2>

              <p className="mt-2 text-sm leading-6 theme-text-secondary">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className={`mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} transition-opacity hover:opacity-90`}
              >
                <RefreshCw size={15} />
                Muat Ulang
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
    <div className="flex h-screen overflow-hidden theme-page">
      <Sidebar
        role="guru"
        active="rapor"
        isCollapsed={!sidebarOpen}
        setIsCollapsed={() =>
          setSidebarOpen(
            (value) => !value
          )
        }
      />

      <div className="flex flex-1 flex-col min-w-0 theme-page">
        <Header
          toggleSidebar={() =>
            setSidebarOpen(
              (value) => !value
            )
          }
          notifications={notifications}
          user={{
            name: "Guru",
            email:
              "guru@smartschool.com",
            avatar: "GR",
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 theme-page">
          <div className="w-full space-y-6">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex shrink-0 items-center justify-center rounded-lg p-2 text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow}`}
                  >
                    <FileCheck2 size={18} />
                  </div>

                  <div>
                    <h1 className="text-xl font-semibold theme-text sm:text-2xl">
                      Rapor
                    </h1>

                    <p className="mt-1 flex items-center gap-1.5 text-sm theme-text-secondary">
                      <Sparkles
                        size={14}
                        className="shrink-0 theme-text-muted"
                      />

                      <span>
                        Rekap nilai siswa
                        berdasarkan data
                        dari backend.
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className={`flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} transition-opacity hover:opacity-90`}
              >
                <Printer size={15} />
                Cetak Rapor
              </button>
            </div>

            {/* =================================================
                FILTER
            ================================================= */}

            <div
              className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                  {/* TAHUN AJARAN */}

                  <div className="relative w-full sm:w-56">
                    <select
                      value={
                        tahunAjaran?.id ||
                        ""
                      }
                      onChange={async (e) => {
                        const id =
                          e.target.value;

                        const selected =
                          tahunAjaranList.find(
                            (item) =>
                              normalizeId(
                                item?.id
                              ) ===
                              normalizeId(
                                id
                              )
                          );

                        setTahunAjaran(
                          selected || null
                        );

                        setSelectedKelasId(
                          ""
                        );
                        setKelasList([]);
                        setAnggotaKelas([]);
                        setNilaiRaport([]);
                        setNilaiUjian([]);

                        if (id) {
                          try {
                            await loadKelas(
                              id
                            );
                          } catch (err) {
                            console.error(
                              err
                            );
                          }
                        }
                      }}
                      className={`w-full appearance-none rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-3 py-2.5 pr-9 text-sm font-medium theme-text transition-colors hover:opacity-90 focus:outline-none ${themeFocus}`}
                    >
                      <option value="">
                        Pilih Tahun Ajaran
                      </option>

                      {tahunAjaranList.map(
                        (item) => (
                          <option
                            key={
                              item?.id
                            }
                            value={
                              item?.id
                            }
                          >
                            {item?.nama ||
                              item?.tahun ||
                              item?.tahunAjaran ||
                              "Tahun Ajaran"}
                            {item?.semester
                              ? ` · ${item.semester}`
                              : ""}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />
                  </div>

                  {/* KELAS */}

                  <div className="relative w-full sm:w-48">
                    <select
                      value={
                        selectedKelasId
                      }
                      onChange={(e) =>
                        setSelectedKelasId(
                          e.target.value
                        )
                      }
                      disabled={
                        kelasList.length ===
                        0
                      }
                      className={`w-full appearance-none rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-3 py-2.5 pr-9 text-sm font-medium theme-text transition-colors focus:outline-none ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <option value="">
                        Pilih Kelas
                      </option>

                      {kelasList.map(
                        (item) => (
                          <option
                            key={
                              item?.id
                            }
                            value={
                              item?.id
                            }
                          >
                            {item?.nama ||
                              item?.namaKelas ||
                              item?.kelas ||
                              "Kelas"}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />
                  </div>
                </div>

                {/* INFO */}

                <div className="flex flex-wrap items-center gap-2 text-[11px] theme-text-secondary">
                  <Info
                    size={13}
                    className="shrink-0 theme-text-muted"
                  />

                  <span>
                    Tahun:
                  </span>

                  <span
                    className={`rounded-full border ${themeNeutralBorder} ${themeNeutralSurface} px-2.5 py-1`}
                  >
                    {tahunAjaran?.nama ||
                      tahunAjaran?.tahun ||
                      tahunAjaran?.tahunAjaran ||
                      "-"}
                  </span>

                  <span>
                    Mata Pelajaran:
                  </span>

                  <span
                    className={`rounded-full border ${themeNeutralBorder} ${themeNeutralSurface} px-2.5 py-1`}
                  >
                    {mataPelajaran}
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                LOADING NILAI
            ================================================= */}

            {loadingNilai && (
              <div
                className={`flex items-center gap-3 rounded-xl border ${themeInfoBorder} ${themeInfoSurface} px-4 py-3`}
              >
                <Loader2
                  className={`h-4 w-4 animate-spin ${themePrimaryText}`}
                />

                <p className="text-sm theme-text-secondary">
                  Sedang mengambil data
                  nilai siswa...
                </p>
              </div>
            )}

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

              {/* TOTAL */}

              <div
                className={`theme-card flex min-w-0 items-center gap-3 rounded-xl border ${themeNeutralBorder} p-3.5 ${themeCardShadow}`}
              >
                <div
                  className={`flex shrink-0 items-center justify-center rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-2 theme-text-secondary`}
                >
                  <Users size={16} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                    Total Siswa
                  </p>

                  <p className="text-lg font-bold theme-text">
                    {dataTabel.length}
                  </p>
                </div>
              </div>

              {/* RATA-RATA */}

              <div
                className={`theme-card flex min-w-0 items-center gap-3 rounded-xl border ${themeNeutralBorder} p-3.5 ${themeCardShadow}`}
              >
                <div
                  className={`flex shrink-0 items-center justify-center rounded-lg border ${themeInfoBorder} ${themeInfoSurface} p-2 ${themePrimaryText}`}
                >
                  <BarChart3 size={16} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                    Rata-rata
                  </p>

                  <p className="text-lg font-bold theme-text">
                    {formatNumber(
                      rekap.rataRata
                    )}
                  </p>
                </div>
              </div>

              {/* TUNTAS */}

              <div
                className={`theme-card flex min-w-0 items-center gap-3 rounded-xl border ${themeNeutralBorder} p-3.5 ${themeCardShadow}`}
              >
                <div
                  className={`flex shrink-0 items-center justify-center rounded-lg border ${themeSuccessBorder} ${themeSuccessSurface} p-2 text-[var(--color-success)]`}
                >
                  <FileCheck2 size={16} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                    Tuntas
                  </p>

                  <p className="text-lg font-bold theme-text">
                    {rekap.tuntas}
                  </p>
                </div>
              </div>

              {/* BELUM TUNTAS */}

              <div
                className={`theme-card flex min-w-0 items-center gap-3 rounded-xl border ${themeNeutralBorder} p-3.5 ${themeCardShadow}`}
              >
                <div
                  className={`flex shrink-0 items-center justify-center rounded-lg border ${themeWarningBorder} ${themeWarningSurface} p-2 text-[var(--color-warning)]`}
                >
                  <AlertTriangle size={16} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                    Belum Tuntas
                  </p>

                  <p className="text-lg font-bold theme-text">
                    {rekap.belumTuntas}
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                TABEL
            ================================================= */}

            <div
              className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <div
                className={`flex flex-col gap-2 border-b ${themeDivider} p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5`}
              >
                <div>
                  <h2 className="text-sm font-semibold theme-text">
                    Rekap Nilai Akhir
                  </h2>

                  <p className="mt-1 text-xs theme-text-muted">
                    Kelas {namaKelas}
                  </p>
                </div>

                <span className="text-xs theme-text-muted">
                  Data dari backend
                </span>
              </div>

              {dataTabel.length === 0 ? (
                <div className="p-10 text-center">
                  <div
                    className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${themeNeutralSurface}`}
                  >
                    <Users className="h-6 w-6 theme-text-muted" />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold theme-text">
                    Belum ada data siswa
                  </h3>

                  <p className="mt-1 text-sm theme-text-secondary">
                    Pilih tahun ajaran
                    dan kelas untuk
                    menampilkan data.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1050px] text-sm">
                    <thead>
                      <tr
                        className={`${themeNeutralSurface} text-left`}
                      >
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider theme-text-secondary">
                          #
                        </th>

                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider theme-text-secondary">
                          Siswa
                        </th>

                        <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider theme-text-secondary">
                          Nilai Ujian
                        </th>

                        <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider theme-text-secondary">
                          Nilai Akhir
                        </th>

                        <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider theme-text-secondary">
                          KKM
                        </th>

                        <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider theme-text-secondary">
                          Predikat
                        </th>

                        <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider theme-text-secondary">
                          Status Ujian
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {dataTabel.map(
                        (
                          student,
                          index
                        ) => {
                          const predikat =
                            student.predikat ||
                            getPredikat(
                              student.nilaiAkhir,
                              student.kkm
                            );

                          return (
                            <tr
                              key={
                                student.id ||
                                `student-${index}`
                              }
                              className={`border-b ${themeDivider} last:border-b-0 ${themeNeutralHover} transition-colors`}
                            >
                              {/* NO */}

                              <td className="px-4 py-3 text-xs theme-text-muted">
                                {index + 1}
                              </td>

                              {/* SISWA */}

                              <td className="px-4 py-3">
                                <div>
                                  <p className="text-sm font-medium theme-text">
                                    {student.nama}
                                  </p>

                                  <div className="mt-0.5 flex flex-wrap gap-2 text-[11px] theme-text-muted">
                                    <span>
                                      NIS{" "}
                                      {student.nis ||
                                        "-"}
                                    </span>

                                    {student.nisn &&
                                      student.nisn !==
                                        "-" && (
                                        <span>
                                          NISN{" "}
                                          {
                                            student.nisn
                                          }
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </td>

                              {/* NILAI UJIAN */}

                              <td className="px-3 py-3 text-center">
                                {student.nilaiUjian !==
                                null ? (
                                  <div>
                                    <p
                                      className={`font-semibold ${themePrimaryText}`}
                                    >
                                      {formatNumber(
                                        student.nilaiUjian
                                      )}
                                    </p>

                                    {student.selesaiUjian && (
                                      <p className="mt-0.5 text-[10px] theme-text-muted">
                                        {formatDate(
                                          student.selesaiUjian
                                        )}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="theme-text-muted">
                                    -
                                  </span>
                                )}
                              </td>

                              {/* NILAI AKHIR */}

                              <td className="px-3 py-3 text-center">
                                {student.nilaiAkhir !==
                                null ? (
                                  <span className="font-semibold theme-text">
                                    {formatNumber(
                                      student.nilaiAkhir
                                    )}
                                  </span>
                                ) : (
                                  <span className="theme-text-muted">
                                    -
                                  </span>
                                )}
                              </td>

                              {/* KKM */}

                              <td className="px-3 py-3 text-center theme-text-secondary">
                                {formatNumber(
                                  student.kkm
                                )}
                              </td>

                              {/* PREDIKAT */}

                              <td className="px-3 py-3 text-center">
                                <span
                                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold ${
                                    colorClasses[
                                      predikat.color
                                    ]?.badge ||
                                    colorClasses
                                      .slate
                                      .badge
                                  }`}
                                >
                                  {
                                    predikat.label
                                  }
                                </span>
                              </td>

                              {/* STATUS */}

                              <td className="px-4 py-3 text-center">
                                {student.statusUjian ===
                                "selesai" ? (
                                  <span
                                    className={`inline-flex items-center rounded-full border ${themeSuccessBorder} ${themeSuccessSurface} px-2.5 py-1 text-[10px] font-semibold text-[var(--color-success)]`}
                                  >
                                    Selesai
                                  </span>
                                ) : student.statusUjian ===
                                  "berlangsung" ? (
                                  <span
                                    className={`inline-flex items-center rounded-full border ${themeInfoBorder} ${themeInfoSurface} px-2.5 py-1 text-[10px] font-semibold ${themePrimaryText}`}
                                  >
                                    Berlangsung
                                  </span>
                                ) : (
                                  <span
                                    className={`inline-flex items-center rounded-full border ${themeNeutralBorder} ${themeNeutralSurface} px-2.5 py-1 text-[10px] font-semibold theme-text-muted`}
                                  >
                                    Belum
                                    Mengerjakan
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* FOOTER */}

              {dataTabel.length > 0 && (
                <div
                  className={`flex flex-col gap-2 border-t ${themeDivider} ${themeNeutralSurface} px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5`}
                >
                  <p className="text-xs theme-text-secondary">
                    Menampilkan{" "}
                    <span className="font-semibold theme-text">
                      {dataTabel.length}
                    </span>{" "}
                    siswa
                  </p>

                  <p className="text-xs theme-text-muted">
                    Nilai diambil dari data
                    backend SmartSchool
                  </p>
                </div>
              )}
            </div>

            {/* =================================================
                CATATAN
            ================================================= */}

            <div
              className={`rounded-xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themeCardShadow} theme-card ${themePrimaryText}`}
                >
                  <Info size={16} />
                </div>

                <div>
                  <p className="text-sm font-semibold theme-text">
                    Sumber data nilai
                  </p>

                  <p className="mt-1 text-xs leading-5 theme-text-secondary">
                    Nilai akhir diambil
                    dari data akademik
                    raport siswa. Nilai
                    ujian online
                    ditampilkan dari hasil
                    ujian yang tersimpan
                    di backend.
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