"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import { getKelasMapel } from "../../../../services/kelasMapel.service";
import { getKelasById } from "../../../../services/kelas.service";
import {
  getUjianByKelasMapel,
  getDetailUjian,
} from "../../../../services/ujian.service";

import {
  AlertCircle,
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  Loader2,
  Search,
  Users,
  X,
} from "lucide-react";

// ============================================================
// THEME HELPERS
// ============================================================

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

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

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

// ============================================================
// HELPERS
// ============================================================

function parseData(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.data?.items)) return response.data.items;
  return [];
}

function parseObject(response) {
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

function getCurrentUser() {
  if (typeof window === "undefined") return null;

  const keys = ["user", "currentUser", "pengguna", "profile"];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);

      if (parsed) return parsed?.data || parsed;
    } catch {}
  }

  return null;
}

function getCurrentUserId() {
  const user = getCurrentUser();

  if (!user) return null;

  return (
    user.id ||
    user.userId ||
    user.penggunaId ||
    user.guruId ||
    null
  );
}

function normalizeId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return String(value);
}

function formatDate(date) {
  if (!date) return "-";

  try {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(parsed);
  } catch {
    return "-";
  }
}

function formatDateTime(date) {
  if (!date) return "-";

  try {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(parsed);
  } catch {
    return "-";
  }
}

function formatDuration(minutes) {
  if (
    minutes === null ||
    minutes === undefined ||
    minutes === ""
  ) {
    return "-";
  }

  const total = Number(minutes);

  if (Number.isNaN(total)) return "-";

  if (total < 60) return `${total} menit`;

  const hours = Math.floor(total / 60);
  const remaining = total % 60;

  if (remaining === 0) return `${hours} jam`;

  return `${hours} jam ${remaining} menit`;
}

function getJenisLabel(jenis) {
  if (!jenis) return "Ujian";

  const value = String(jenis).toLowerCase();

  const labels = {
    uts: "UTS",
    uas: "UAS",
    quiz: "Quiz",
    kuis: "Quiz",
    tugas: "Tugas",
    ujian: "Ujian",
    asesmen: "Asesmen",
    assessment: "Asesmen",
  };

  return labels[value] || jenis;
}

function getStudentId(item) {
  if (!item) return null;

  const siswa =
    item.siswa ||
    item.pengguna ||
    item.student ||
    item.user ||
    null;

  return normalizeId(
    item.siswaId ||
      item.penggunaId ||
      item.studentId ||
      item.userId ||
      item.idSiswa ||
      item.idPengguna ||
      siswa?.id
  );
}

function getStudentName(item) {
  if (!item) return "Nama siswa belum tersedia";

  const siswa =
    item.siswa ||
    item.pengguna ||
    item.student ||
    item.user ||
    null;

  return (
    siswa?.namaLengkap ||
    siswa?.nama ||
    item.namaLengkap ||
    item.namaSiswa ||
    item.nama ||
    "Nama siswa belum tersedia"
  );
}

function getStudentNis(item) {
  if (!item) return "-";

  const siswa =
    item.siswa ||
    item.pengguna ||
    item.student ||
    item.user ||
    null;

  return siswa?.nis || item.nis || item.nomorInduk || "-";
}

function getStudentNisn(item) {
  if (!item) return "-";

  const siswa =
    item.siswa ||
    item.pengguna ||
    item.student ||
    item.user ||
    null;

  return siswa?.nisn || item.nisn || "-";
}

function getHasil(item) {
  if (!item) return null;

  return (
    item.hasilUjian ||
    item.hasilAsesmen ||
    item.hasil ||
    item.result ||
    item.nilaiHasil ||
    null
  );
}

function getNilai(item) {
  if (!item) return 0;

  const hasil = getHasil(item);

  const candidates = [
    item.nilai,
    item.totalNilai,
    item.nilaiAkhir,
    item.skor,
    item.score,
    hasil?.totalNilai,
    hasil?.nilai,
    hasil?.nilaiAkhir,
    hasil?.skor,
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

  return 0;
}

function getBenar(item) {
  const hasil = getHasil(item);

  return Number(
    hasil?.jumlahBenar ??
      item?.jumlahBenar ??
      item?.benar ??
      0
  );
}

function getSalah(item) {
  const hasil = getHasil(item);

  return Number(
    hasil?.jumlahSalah ??
      item?.jumlahSalah ??
      item?.salah ??
      0
  );
}

function getLewati(item) {
  const hasil = getHasil(item);

  return Number(
    hasil?.jumlahLewati ??
      item?.jumlahLewati ??
      item?.lewati ??
      0
  );
}

function getStatus(item) {
  if (!item) return "belum_mengerjakan";

  const hasil = getHasil(item);

  const raw =
    item.status ||
    item.statusPengerjaan ||
    item.statusPercobaan ||
    item.statusUjian ||
    item.statusAsesmen ||
    "";

  const value = String(raw).toLowerCase().trim();

  if (
    [
      "selesai",
      "completed",
      "complete",
      "submitted",
      "submit",
      "dikumpulkan",
      "sudah_mengerjakan",
    ].includes(value)
  ) {
    return "selesai";
  }

  if (
    [
      "berlangsung",
      "sedang_mengerjakan",
      "in_progress",
      "progress",
      "ongoing",
      "mengerjakan",
    ].includes(value)
  ) {
    return "berlangsung";
  }

  if (
    ["dibatalkan", "cancelled", "canceled"].includes(value)
  ) {
    return "dibatalkan";
  }

  if (
    hasil ||
    item.selesaiPada ||
    item.waktuSelesai ||
    item.submittedAt
  ) {
    return "selesai";
  }

  return "belum_mengerjakan";
}

function getStatusLabel(status) {
  switch (status) {
    case "selesai":
      return "Selesai";
    case "berlangsung":
      return "Berlangsung";
    case "dibatalkan":
      return "Dibatalkan";
    default:
      return "Belum Mengerjakan";
  }
}

function getStatusClasses(status) {
  switch (status) {
    case "selesai":
      return `${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`;

    case "berlangsung":
      return `${themeInfoSurface} ${themeInfoBorder} text-[var(--color-info)]`;

    case "dibatalkan":
      return `${themeDangerSurface} ${themeDangerBorder} theme-danger`;

    default:
      return `${themeNeutralSurface} ${themeNeutralBorder} theme-text-secondary`;
  }
}

function getScoreClasses(score) {
  if (score >= 85) {
    return "text-[var(--color-success)]";
  }

  if (score >= 70) {
    return "text-[var(--color-info)]";
  }

  if (score >= 60) {
    return "text-[var(--color-warning)]";
  }

  return "theme-danger";
}

function getStartTime(item) {
  if (!item) return null;

  return (
    item.dimulaiPada ||
    item.waktuMulai ||
    item.mulaiPada ||
    item.startedAt ||
    null
  );
}

function getEndTime(item) {
  if (!item) return null;

  return (
    item.selesaiPada ||
    item.waktuSelesai ||
    item.submittedAt ||
    item.dikumpulkanPada ||
    null
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
  valueClass = "theme-text",
}) {
  return (
    <div
      className={`theme-card group rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow} transition duration-200 hover:-translate-y-0.5 shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_8%,transparent)]`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="theme-text-secondary text-sm font-medium">
            {label}
          </p>

          <p
            className={`mt-2 text-3xl font-bold tracking-tight ${valueClass}`}
          >
            {value}
          </p>

          <p className="theme-text-muted mt-1 text-xs">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function NilaiUjianGuruPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [kelasMapel, setKelasMapel] = useState([]);
  const [selectedKelasMapel, setSelectedKelasMapel] = useState(null);
  const [kelas, setKelas] = useState(null);
  const [ujian, setUjian] = useState([]);
  const [selectedUjianId, setSelectedUjianId] = useState("");
  const [detailUjian, setDetailUjian] = useState(null);

  const [loadingKelasMapel, setLoadingKelasMapel] =
    useState(true);
  const [loadingUjian, setLoadingUjian] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [sortBy, setSortBy] = useState("nama");

  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [showDetailModal, setShowDetailModal] =
    useState(false);

  const loadKelasMapel = useCallback(async () => {
    try {
      setLoadingKelasMapel(true);
      setError("");

      const currentUserId = getCurrentUserId();
      const response = await getKelasMapel();
      const list = parseData(response);

      const filtered = currentUserId
        ? list.filter((item) => {
            const guruId =
              item.guruPengajarId ||
              item.guruPengajar?.id ||
              item.guru?.id ||
              item.penggunaId;

            return (
              normalizeId(guruId) ===
              normalizeId(currentUserId)
            );
          })
        : list;

      setKelasMapel(filtered);

      if (filtered.length > 0) {
        setSelectedKelasMapel(filtered[0]);
      } else {
        setSelectedKelasMapel(null);
        setKelas(null);
        setUjian([]);
        setSelectedUjianId("");
        setDetailUjian(null);
      }
    } catch (err) {
      console.error(
        "Gagal memuat kelas mapel:",
        err
      );

      setError(
        err?.message ||
          "Gagal memuat daftar kelas dan mata pelajaran."
      );
    } finally {
      setLoadingKelasMapel(false);
    }
  }, []);

  const loadDetailKelas = useCallback(
    async (kelasId) => {
      if (!kelasId) {
        setKelas(null);
        return null;
      }

      try {
        const response = await getKelasById(kelasId);
        const data = parseObject(response);

        setKelas(data);

        return data;
      } catch (err) {
        console.error(
          "Gagal memuat detail kelas:",
          err
        );

        setKelas(null);

        return null;
      }
    },
    []
  );

  const loadUjian = useCallback(async () => {
    if (!selectedKelasMapel?.id) {
      setUjian([]);
      setSelectedUjianId("");
      setDetailUjian(null);
      setKelas(null);
      return;
    }

    try {
      setLoadingUjian(true);
      setError("");

      const response = await getUjianByKelasMapel(
        selectedKelasMapel.id
      );

      const list = parseData(response);

      setUjian(list);

      if (list.length > 0) {
        const first = list[0];

        setSelectedUjianId(
          first.id || first.asesmenId || ""
        );
      } else {
        setSelectedUjianId("");
        setDetailUjian(null);
      }
    } catch (err) {
      console.error(
        "Gagal memuat ujian:",
        err
      );

      setUjian([]);

      setError(
        err?.message ||
          "Gagal memuat daftar ujian."
      );
    } finally {
      setLoadingUjian(false);
    }
  }, [selectedKelasMapel]);

  const loadDetailUjian = useCallback(async () => {
    if (!selectedUjianId) {
      setDetailUjian(null);
      return;
    }

    try {
      setLoadingDetail(true);
      setError("");

      const response =
        await getDetailUjian(selectedUjianId);

      const data = parseObject(response);

      setDetailUjian(data);

      const kelasId =
        data?.kelasMapel?.kelasId ||
        data?.kelasMapel?.kelas?.id ||
        selectedKelasMapel?.kelasId ||
        selectedKelasMapel?.kelas?.id ||
        null;

      if (kelasId) {
        await loadDetailKelas(kelasId);
      } else {
        setKelas(null);
      }
    } catch (err) {
      console.error(
        "Gagal memuat detail ujian:",
        err
      );

      setDetailUjian(null);

      setError(
        err?.message ||
          "Gagal memuat detail nilai ujian."
      );
    } finally {
      setLoadingDetail(false);
    }
  }, [
    selectedUjianId,
    selectedKelasMapel,
    loadDetailKelas,
  ]);

  useEffect(() => {
    loadKelasMapel();
  }, [loadKelasMapel]);

  useEffect(() => {
    loadUjian();
  }, [loadUjian]);

  useEffect(() => {
    loadDetailUjian();
  }, [loadDetailUjian]);

  const handleChangeKelasMapel = (id) => {
    const selected = kelasMapel.find(
      (item) =>
        normalizeId(item.id) === normalizeId(id)
    );

    setSelectedKelasMapel(selected || null);
    setKelas(null);
    setDetailUjian(null);
    setUjian([]);
    setSelectedUjianId("");
    setSearch("");
    setStatusFilter("semua");
  };

  const nilaiSource = useMemo(() => {
    if (!detailUjian) return [];

    if (Array.isArray(detailUjian.nilaiSiswa)) {
      return detailUjian.nilaiSiswa;
    }

    if (Array.isArray(detailUjian.percobaanUjian)) {
      return detailUjian.percobaanUjian;
    }

    if (Array.isArray(detailUjian.data?.nilaiSiswa)) {
      return detailUjian.data.nilaiSiswa;
    }

    if (
      Array.isArray(
        detailUjian.data?.percobaanUjian
      )
    ) {
      return detailUjian.data.percobaanUjian;
    }

    return [];
  }, [detailUjian]);

  const anggotaKelas = useMemo(() => {
    if (!kelas) return [];

    if (Array.isArray(kelas.anggota)) {
      return kelas.anggota;
    }

    if (Array.isArray(kelas.anggotaKelas)) {
      return kelas.anggotaKelas;
    }

    if (Array.isArray(kelas.siswa)) {
      return kelas.siswa;
    }

    if (Array.isArray(kelas.data?.anggota)) {
      return kelas.data.anggota;
    }

    if (Array.isArray(kelas.data?.anggotaKelas)) {
      return kelas.data.anggotaKelas;
    }

    if (Array.isArray(kelas.data?.siswa)) {
      return kelas.data.siswa;
    }

    return [];
  }, [kelas]);

  const normalizedNilaiSource = useMemo(() => {
    if (!Array.isArray(nilaiSource)) return [];

    return nilaiSource.map((item, index) => {
      const siswa =
        item?.siswa ||
        item?.pengguna ||
        item?.student ||
        item?.user ||
        null;

      const siswaId = getStudentId(item);

      const hasil =
        item?.hasilUjian ||
        item?.hasilAsesmen ||
        item?.hasil ||
        null;

      const nilai =
        item?.nilai ??
        hasil?.totalNilai ??
        item?.totalNilai ??
        null;

      return {
        ...item,
        _sourceIndex: index,
        id:
          item?.id ||
          item?.percobaanUjianId ||
          `nilai-${siswaId || index}`,
        siswaId,
        siswa,
        namaLengkap: getStudentName(item),
        nis: getStudentNis(item),
        nisn: getStudentNisn(item),
        nilai:
          nilai !== null &&
          nilai !== undefined &&
          nilai !== ""
            ? Number(nilai)
            : 0,
        status: getStatus(item),
        hasil,
        waktuMulai:
          item?.dimulaiPada ||
          item?.waktuMulai ||
          item?.mulaiPada ||
          null,
        waktuSelesai:
          item?.selesaiPada ||
          item?.waktuSelesai ||
          null,
      };
    });
  }, [nilaiSource]);

  const nilaiBySiswaId = useMemo(() => {
    const map = new Map();

    for (const item of normalizedNilaiSource) {
      const id = normalizeId(item.siswaId);

      if (!id) continue;

      const existing = map.get(id);

      if (!existing) {
        map.set(id, item);
        continue;
      }

      const existingTime = new Date(
        existing.waktuSelesai ||
          existing.waktuMulai ||
          0
      ).getTime();

      const currentTime = new Date(
        item.waktuSelesai ||
          item.waktuMulai ||
          0
      ).getTime();

      if (currentTime >= existingTime) {
        map.set(id, item);
      }
    }

    return map;
  }, [normalizedNilaiSource]);

  const nilaiSiswa = useMemo(() => {
    if (anggotaKelas.length > 0) {
      return anggotaKelas.map((anggota, index) => {
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

        let attempt = siswaId
          ? nilaiBySiswaId.get(siswaId)
          : null;

        if (!attempt) {
          const nama = String(
            siswa?.namaLengkap ||
              siswa?.nama ||
              anggota?.namaLengkap ||
              anggota?.nama ||
              ""
          )
            .trim()
            .toLowerCase();

          if (nama) {
            attempt =
              normalizedNilaiSource.find(
                (item) =>
                  String(
                    item.namaLengkap || ""
                  )
                    .trim()
                    .toLowerCase() === nama
              ) || null;
          }
        }

        const namaLengkap =
          siswa?.namaLengkap ||
          siswa?.nama ||
          anggota?.namaLengkap ||
          anggota?.nama ||
          attempt?.namaLengkap ||
          "Nama siswa belum tersedia";

        const nis =
          siswa?.nis ||
          anggota?.nis ||
          attempt?.nis ||
          "-";

        const nisn =
          siswa?.nisn ||
          anggota?.nisn ||
          attempt?.nisn ||
          "-";

        if (attempt) {
          return {
            ...attempt,
            id:
              attempt.id ||
              `attempt-${siswaId || index}`,
            siswaId:
              siswaId || attempt.siswaId,
            siswa: attempt.siswa || siswa,
            namaLengkap,
            nis,
            nisn,
            nilai: getNilai(attempt),
            status: getStatus(attempt),
            hasil: getHasil(attempt),
            waktuMulai: getStartTime(attempt),
            waktuSelesai: getEndTime(attempt),
          };
        }

        return {
          id: `kelas-member-${
            siswaId || index
          }`,
          siswaId,
          siswa,
          namaLengkap,
          nis,
          nisn,
          nilai: 0,
          status: "belum_mengerjakan",
          hasil: null,
          waktuMulai: null,
          waktuSelesai: null,
          percobaanUjianId: null,
        };
      });
    }

    return normalizedNilaiSource;
  }, [
    anggotaKelas,
    nilaiBySiswaId,
    normalizedNilaiSource,
  ]);

  const filteredNilaiSiswa = useMemo(() => {
    let result = [...nilaiSiswa];

    const keyword = search.trim().toLowerCase();

    if (keyword) {
      result = result.filter((item) => {
        const nama = String(
          item.namaLengkap || ""
        ).toLowerCase();

        const nis = String(
          item.nis || ""
        ).toLowerCase();

        const nisn = String(
          item.nisn || ""
        ).toLowerCase();

        return (
          nama.includes(keyword) ||
          nis.includes(keyword) ||
          nisn.includes(keyword)
        );
      });
    }

    if (statusFilter !== "semua") {
      result = result.filter(
        (item) =>
          getStatus(item) === statusFilter
      );
    }

    result.sort((a, b) => {
      if (sortBy === "nilai_tertinggi") {
        return getNilai(b) - getNilai(a);
      }

      if (sortBy === "nilai_terendah") {
        return getNilai(a) - getNilai(b);
      }

      if (sortBy === "status") {
        return getStatus(a).localeCompare(
          getStatus(b)
        );
      }

      return String(
        a.namaLengkap || ""
      ).localeCompare(
        String(b.namaLengkap || ""),
        "id"
      );
    });

    return result;
  }, [
    nilaiSiswa,
    search,
    statusFilter,
    sortBy,
  ]);

  const statistics = useMemo(() => {
    const total = nilaiSiswa.length;

    const selesai = nilaiSiswa.filter(
      (item) =>
        getStatus(item) === "selesai"
    ).length;

    const berlangsung = nilaiSiswa.filter(
      (item) =>
        getStatus(item) === "berlangsung"
    ).length;

    const belum = nilaiSiswa.filter(
      (item) =>
        getStatus(item) ===
        "belum_mengerjakan"
    ).length;

    const dikerjakan = nilaiSiswa.filter(
      (item) => {
        const status = getStatus(item);

        return (
          status === "selesai" ||
          status === "berlangsung"
        );
      }
    );

    const scores = dikerjakan
      .map((item) => getNilai(item))
      .filter(
        (score) =>
          !Number.isNaN(Number(score))
      );

    const totalNilai = scores.reduce(
      (sum, value) =>
        sum + Number(value),
      0
    );

    const rataRata =
      scores.length > 0
        ? totalNilai / scores.length
        : 0;

    const nilaiTertinggi =
      scores.length > 0
        ? Math.max(...scores)
        : 0;

    const nilaiTerendah =
      scores.length > 0
        ? Math.min(...scores)
        : 0;

    return {
      total,
      selesai,
      berlangsung,
      belum,
      rataRata,
      nilaiTertinggi,
      nilaiTerendah,
    };
  }, [nilaiSiswa]);

  const currentUjian = useMemo(() => {
    return (
      ujian.find(
        (item) =>
          normalizeId(
            item.id || item.asesmenId
          ) ===
          normalizeId(selectedUjianId)
      ) ||
      detailUjian ||
      null
    );
  }, [
    ujian,
    selectedUjianId,
    detailUjian,
  ]);

  const namaUjian =
    detailUjian?.judul ||
    detailUjian?.nama ||
    detailUjian?.namaUjian ||
    currentUjian?.judul ||
    currentUjian?.nama ||
    currentUjian?.namaUjian ||
    "Ujian";

  const jenisUjian =
    detailUjian?.jenis ||
    detailUjian?.jenisUjian ||
    currentUjian?.jenis ||
    "ujian";

  const jumlahSoal = Number(
    detailUjian?._count?.soalUjian ??
      detailUjian?.soalUjian?.length ??
      currentUjian?._count?.soalUjian ??
      0
  );

  const durasi =
    detailUjian?.durasi ??
    currentUjian?.durasi ??
    null;

  const tanggalMulai =
    detailUjian?.waktuMulai ||
    detailUjian?.tanggalMulai ||
    detailUjian?.mulaiPada ||
    currentUjian?.waktuMulai ||
    currentUjian?.tanggalMulai ||
    null;

  const mataPelajaran =
    detailUjian?.kelasMapel?.mataPelajaran
      ?.nama ||
    selectedKelasMapel?.mataPelajaran
      ?.nama ||
    detailUjian?.mataPelajaran?.nama ||
    "-";

  const namaKelas =
    detailUjian?.kelasMapel?.kelas?.nama ||
    selectedKelasMapel?.kelas?.nama ||
    kelas?.nama ||
    "-";

  const openDetail = (item) => {
    setSelectedSiswa(item);
    setShowDetailModal(true);
  };

  const closeDetail = () => {
    setSelectedSiswa(null);
    setShowDetailModal(false);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loadingKelasMapel) {
    return (
      <div className="theme-page flex h-screen overflow-hidden">
        <Sidebar
          role="guru"
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <div className="flex h-screen flex-1 flex-col overflow-hidden">
          <Header
            notifications={[]}
            user={{
              name: "Guru",
              email: "guru@smartschool.com",
              avatar: "GR",
            }}
          />

          <main className="flex flex-1 items-center justify-center overflow-y-auto p-6">
            <div
              className={`theme-card w-full max-w-sm rounded-2xl border ${themeNeutralBorder} p-8 text-center ${themeCardShadow}`}
            >
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${themePrimarySoft} ${themePrimaryText}`}
              >
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>

              <h2 className="theme-text mt-5 text-base font-bold">
                Memuat data
              </h2>

              <p className="theme-text-secondary mt-2 text-sm leading-6">
                Sedang menyiapkan kelas, mata pelajaran,
                dan data ujian Anda.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        role="guru"
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <Header
          notifications={[]}
          user={{
            name: "Guru",
            email: "guru@smartschool.com",
            avatar: "GR",
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1500px]">

            {/* =====================================================
                HERO
            ====================================================== */}

            <section
              className={`relative mb-6 overflow-hidden rounded-3xl ${themePrimaryGradient} ${themePrimaryShadow}`}
            >
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

                <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

                <div
                  className="absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
              </div>

              <div className="relative p-6 md:p-8">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
                </button>

                <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
                  <div className="max-w-3xl">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                      <Award className="h-3.5 w-3.5" />
                      PENILAIAN AKADEMIK
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                      Nilai Ujian
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 md:text-base">
                      Pantau hasil pengerjaan, perkembangan
                      nilai, dan status siswa pada setiap
                      ujian yang Anda kelola.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
                        {namaKelas !== "-"
                          ? namaKelas
                          : "Kelas belum dipilih"}
                      </span>

                      <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
                        {mataPelajaran !== "-"
                          ? mataPelajaran
                          : "Mata pelajaran"}
                      </span>

                      {selectedUjianId && (
                        <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
                          {getJenisLabel(jenisUjian)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                      Ujian Terpilih
                    </p>

                    <p className="mt-2 line-clamp-2 text-lg font-bold text-white">
                      {namaUjian}
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-white/10 p-3">
                        <p className="text-[11px] text-white/70">
                          Siswa
                        </p>

                        <p className="mt-1 text-xl font-bold text-white">
                          {statistics.total}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/10 p-3">
                        <p className="text-[11px] text-white/70">
                          Selesai
                        </p>

                        <p className="mt-1 text-xl font-bold text-white">
                          {statistics.selesai}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/10 p-3">
                        <p className="text-[11px] text-white/70">
                          Rata-rata
                        </p>

                        <p className="mt-1 text-xl font-bold text-white">
                          {statistics.rataRata.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =====================================================
                ERROR
            ====================================================== */}

            {error && (
              <div
                className={`mb-6 flex items-start gap-3 rounded-2xl border ${themeDangerBorder} ${themeDangerSurface} p-4`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themeNeutralSurface} theme-danger`}
                >
                  <AlertCircle className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="theme-danger font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="theme-text-secondary mt-1 text-sm leading-5">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    loadKelasMapel();
                  }}
                  className="theme-danger shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]"
                >
                  Coba lagi
                </button>
              </div>
            )}

            {/* =====================================================
                SELECTOR
            ====================================================== */}

            <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div
                className={`theme-card rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow} transition hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_8%,transparent)]`}
              >
                <div className="mb-4 flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                  >
                    <GraduationCap className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="theme-text font-bold">
                      Kelas & Mata Pelajaran
                    </h2>

                    <p className="theme-text-secondary mt-1 text-xs leading-5">
                      Pilih kelas dan mata pelajaran yang
                      ingin Anda pantau.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={selectedKelasMapel?.id || ""}
                    onChange={(e) =>
                      handleChangeKelasMapel(
                        e.target.value
                      )
                    }
                    className={`theme-input w-full appearance-none rounded-xl border px-4 py-3.5 pr-11 text-sm font-semibold outline-none transition ${themeFocus}`}
                  >
                    {kelasMapel.length === 0 ? (
                      <option value="">
                        Belum ada kelas dan mata pelajaran
                      </option>
                    ) : (
                      kelasMapel.map((item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.kelas?.nama ||
                            item.namaKelas ||
                            "Kelas"}{" "}
                          —{" "}
                          {item.mataPelajaran?.nama ||
                            item.namaMataPelajaran ||
                            "Mata Pelajaran"}
                        </option>
                      ))
                    )}
                  </select>

                  <ChevronDown className="theme-text-muted pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                </div>
              </div>

              <div
                className={`theme-card rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow} transition hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_8%,transparent)]`}
              >
                <div className="mb-4 flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themeInfoSurface} text-[var(--color-info)]`}
                  >
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="theme-text font-bold">
                      Pilih Ujian
                    </h2>

                    <p className="theme-text-secondary mt-1 text-xs leading-5">
                      Pilih ujian untuk melihat hasil nilai
                      siswa.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={selectedUjianId}
                    onChange={(e) =>
                      setSelectedUjianId(
                        e.target.value
                      )
                    }
                    disabled={
                      loadingUjian ||
                      ujian.length === 0
                    }
                    className={`theme-input w-full appearance-none rounded-xl border px-4 py-3.5 pr-11 text-sm font-semibold outline-none transition ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {loadingUjian ? (
                      <option value="">
                        Memuat ujian...
                      </option>
                    ) : ujian.length === 0 ? (
                      <option value="">
                        Belum ada ujian
                      </option>
                    ) : (
                      ujian.map((item) => {
                        const id =
                          item.id ||
                          item.asesmenId;

                        return (
                          <option
                            key={id}
                            value={id}
                          >
                            {item.judul ||
                              item.nama ||
                              item.namaUjian ||
                              "Ujian"}
                          </option>
                        );
                      })
                    )}
                  </select>

                  <ChevronDown className="theme-text-muted pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                </div>
              </div>
            </section>

            {/* =====================================================
                EMPTY EXAM
            ====================================================== */}

            {!loadingUjian &&
              ujian.length === 0 && (
                <div
                  className={`theme-card rounded-3xl border border-dashed ${themeNeutralBorder} p-12 text-center ${themeCardShadow}`}
                >
                  <div
                    className={`theme-text-muted mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${themeNeutralSurface}`}
                  >
                    <FileText className="h-7 w-7" />
                  </div>

                  <h3 className="theme-text mt-5 text-lg font-bold">
                    Belum ada ujian
                  </h3>

                  <p className="theme-text-secondary mx-auto mt-2 max-w-md text-sm leading-6">
                    Belum terdapat ujian pada kelas dan mata
                    pelajaran yang dipilih.
                  </p>
                </div>
              )}

            {selectedUjianId && currentUjian && (
              <>
                {/* =================================================
                    EXAM INFO
                ================================================== */}

                <section
                  className={`theme-card mb-6 overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  <div className={`border-b ${themeDivider} p-6`}>
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} px-3 py-1 text-xs font-bold ${themePrimaryText}`}
                          >
                            {getJenisLabel(
                              jenisUjian
                            )}
                          </span>

                          {detailUjian?.dipublikasikan && (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border ${themeSuccessBorder} ${themeSuccessSurface} px-3 py-1 text-xs font-bold text-[var(--color-success)]`}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Dipublikasikan
                            </span>
                          )}
                        </div>

                        <h2 className="theme-text text-xl font-bold tracking-tight md:text-2xl">
                          {namaUjian}
                        </h2>

                        <div className="theme-text-secondary mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                          <span className="inline-flex items-center gap-1.5">
                            <GraduationCap
                              className={`h-4 w-4 ${themePrimaryText}`}
                            />
                            {namaKelas}
                          </span>

                          <span
                            className={`theme-text-muted hidden h-1 w-1 rounded-full sm:block ${themeNeutralSurface}`}
                          />

                          <span className="inline-flex items-center gap-1.5">
                            <BookOpen
                              className={`h-4 w-4 ${themePrimaryText}`}
                            />
                            {mataPelajaran}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[520px]">
                        <div
                          className={`rounded-xl ${themeNeutralSurface} p-3.5`}
                        >
                          <div className="theme-text-secondary flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span className="text-xs">
                              Soal
                            </span>
                          </div>

                          <p className="theme-text mt-1.5 text-lg font-bold">
                            {jumlahSoal}
                          </p>
                        </div>

                        <div
                          className={`rounded-xl ${themeNeutralSurface} p-3.5`}
                        >
                          <div className="theme-text-secondary flex items-center gap-2">
                            <Clock3 className="h-4 w-4" />
                            <span className="text-xs">
                              Durasi
                            </span>
                          </div>

                          <p className="theme-text mt-1.5 text-sm font-bold">
                            {formatDuration(
                              durasi
                            )}
                          </p>
                        </div>

                        <div
                          className={`rounded-xl ${themeNeutralSurface} p-3.5`}
                        >
                          <div className="theme-text-secondary flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <span className="text-xs">
                              Mulai
                            </span>
                          </div>

                          <p className="theme-text mt-1.5 text-xs font-bold">
                            {tanggalMulai
                              ? formatDate(
                                  tanggalMulai
                                )
                              : "-"}
                          </p>
                        </div>

                        <div
                          className={`rounded-xl ${themePrimarySoft} p-3.5`}
                        >
                          <div
                            className={`flex items-center gap-2 ${themePrimaryText}`}
                          >
                            <Users className="h-4 w-4" />
                            <span className="text-xs">
                              Siswa
                            </span>
                          </div>

                          <p
                            className={`mt-1.5 text-lg font-bold ${themePrimaryText}`}
                          >
                            {statistics.total}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(detailUjian?.deskripsi ||
                    detailUjian?.keterangan) && (
                    <div
                      className={`${themeNeutralSurface} px-6 py-4`}
                    >
                      <p className="theme-text-secondary text-sm leading-6">
                        {detailUjian?.deskripsi ||
                          detailUjian?.keterangan}
                      </p>
                    </div>
                  )}
                </section>

                {/* =================================================
                    STATISTICS
                ================================================== */}

                <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    label="Total Siswa"
                    value={statistics.total}
                    description="Jumlah anggota kelas"
                    icon={Users}
                    iconClass={`${themePrimarySoft} ${themePrimaryText}`}
                  />

                  <StatCard
                    label="Sudah Mengerjakan"
                    value={statistics.selesai}
                    description="Ujian telah selesai"
                    icon={CheckCircle2}
                    iconClass={`${themeSuccessSurface} text-[var(--color-success)]`}
                    valueClass="text-[var(--color-success)]"
                  />

                  <StatCard
                    label="Belum Mengerjakan"
                    value={statistics.belum}
                    description="Menunggu pengerjaan"
                    icon={Clock3}
                    iconClass={`${themeNeutralSurface} theme-text-secondary`}
                    valueClass="theme-text-secondary"
                  />

                  <StatCard
                    label="Nilai Rata-rata"
                    value={statistics.rataRata.toFixed(2)}
                    description="Dari siswa yang mengerjakan"
                    icon={BarChart3}
                    iconClass={`${themeInfoSurface} text-[var(--color-info)]`}
                    valueClass={getScoreClasses(
                      statistics.rataRata
                    )}
                  />
                </section>

                {/* =================================================
                    SCORE SUMMARY
                ================================================== */}

                <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div
                    className={`theme-card rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="theme-text-muted text-xs font-medium uppercase tracking-wider">
                          Nilai Tertinggi
                        </p>

                        <p
                          className={`mt-2 text-3xl font-bold ${getScoreClasses(
                            statistics.nilaiTertinggi
                          )}`}
                        >
                          {statistics.nilaiTertinggi.toFixed(
                            0
                          )}
                        </p>
                      </div>

                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${themeSuccessSurface} text-[var(--color-success)]`}
                      >
                        <Award className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`theme-card rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="theme-text-muted text-xs font-medium uppercase tracking-wider">
                          Nilai Terendah
                        </p>

                        <p
                          className={`mt-2 text-3xl font-bold ${getScoreClasses(
                            statistics.nilaiTerendah
                          )}`}
                        >
                          {statistics.nilaiTerendah.toFixed(
                            0
                          )}
                        </p>
                      </div>

                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${themeWarningSurface} text-[var(--color-warning)]`}
                      >
                        <BarChart3 className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`theme-card rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="theme-text-muted text-xs font-medium uppercase tracking-wider">
                          Progress Pengerjaan
                        </p>

                        <p
                          className={`mt-2 text-3xl font-bold ${themePrimaryText}`}
                        >
                          {statistics.total > 0
                            ? Math.round(
                                ((statistics.selesai +
                                  statistics.berlangsung) /
                                  statistics.total) *
                                  100
                              )
                            : 0}
                          %
                        </p>
                      </div>

                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    </div>

                    <div
                      className={`mt-4 h-2 overflow-hidden rounded-full ${themeNeutralSurface}`}
                    >
                      <div
                        className={`h-full rounded-full ${themePrimaryGradient} transition-all duration-500`}
                        style={{
                          width: `${
                            statistics.total > 0
                              ? Math.min(
                                  100,
                                  ((statistics.selesai +
                                    statistics.berlangsung) /
                                    statistics.total) *
                                    100
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </section>

                {/* =================================================
                    FILTER
                ================================================== */}

                <section
                  className={`theme-card mb-6 rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                        >
                          <Users className="h-4 w-4" />
                        </div>

                        <div>
                          <h3 className="theme-text font-bold">
                            Daftar Nilai Siswa
                          </h3>

                          <p className="theme-text-secondary mt-0.5 text-xs">
                            Menampilkan{" "}
                            <span className="theme-text font-semibold">
                              {
                                filteredNilaiSiswa.length
                              }
                            </span>{" "}
                            dari{" "}
                            <span className="theme-text font-semibold">
                              {nilaiSiswa.length}
                            </span>{" "}
                            siswa
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="relative md:min-w-[260px]">
                        <Search className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />

                        <input
                          type="text"
                          value={search}
                          onChange={(e) =>
                            setSearch(
                              e.target.value
                            )
                          }
                          placeholder="Cari nama, NIS, NISN..."
                          className={`theme-input w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                        />
                      </div>

                      <div className="relative">
                        <Filter className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />

                        <select
                          value={statusFilter}
                          onChange={(e) =>
                            setStatusFilter(
                              e.target.value
                            )
                          }
                          className={`theme-input w-full appearance-none rounded-xl border py-2.5 pl-10 pr-10 text-sm font-medium outline-none transition ${themeFocus}`}
                        >
                          <option value="semua">
                            Semua Status
                          </option>
                          <option value="selesai">
                            Selesai
                          </option>
                          <option value="berlangsung">
                            Berlangsung
                          </option>
                          <option value="belum_mengerjakan">
                            Belum Mengerjakan
                          </option>
                          <option value="dibatalkan">
                            Dibatalkan
                          </option>
                        </select>

                        <ChevronDown className="theme-text-muted pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
                      </div>

                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) =>
                            setSortBy(
                              e.target.value
                            )
                          }
                          className={`theme-input w-full appearance-none rounded-xl border px-4 py-2.5 pr-10 text-sm font-medium outline-none transition ${themeFocus}`}
                        >
                          <option value="nama">
                            Nama A-Z
                          </option>

                          <option value="nilai_tertinggi">
                            Nilai Tertinggi
                          </option>

                          <option value="nilai_terendah">
                            Nilai Terendah
                          </option>

                          <option value="status">
                            Status
                          </option>
                        </select>

                        <ChevronDown className="theme-text-muted pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>
                </section>

                {/* =================================================
                    LOADING / EMPTY
                ================================================== */}

                {loadingDetail ? (
                  <div
                    className={`theme-card rounded-3xl border ${themeNeutralBorder} p-14 text-center ${themeCardShadow}`}
                  >
                    <div
                      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${themePrimarySoft} ${themePrimaryText}`}
                    >
                      <Loader2 className="h-7 w-7 animate-spin" />
                    </div>

                    <h3 className="theme-text mt-5 font-bold">
                      Memuat data nilai
                    </h3>

                    <p className="theme-text-secondary mt-2 text-sm">
                      Sedang mengambil hasil pengerjaan
                      siswa...
                    </p>
                  </div>
                ) : filteredNilaiSiswa.length === 0 ? (
                  <div
                    className={`theme-card rounded-3xl border border-dashed ${themeNeutralBorder} p-14 text-center ${themeCardShadow}`}
                  >
                    <div
                      className={`theme-text-muted mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${themeNeutralSurface}`}
                    >
                      <Users className="h-7 w-7" />
                    </div>

                    <h3 className="theme-text mt-5 text-lg font-bold">
                      Data siswa belum ditemukan
                    </h3>

                    <p className="theme-text-secondary mx-auto mt-2 max-w-lg text-sm leading-6">
                      Tidak ada data siswa yang sesuai
                      dengan pencarian atau filter yang
                      dipilih.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* =================================================
                        DESKTOP TABLE
                    ================================================== */}

                    <div
                      className={`theme-card hidden overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} md:block`}
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[1050px]">
                          <thead>
                            <tr
                              className={`border-b ${themeDivider} ${themeNeutralSurface}`}
                            >
                              {[
                                "Siswa",
                                "Identitas",
                                "Nilai",
                                "Status",
                                "Waktu Pengerjaan",
                                "Aksi",
                              ].map(
                                (
                                  label,
                                  index
                                ) => (
                                  <th
                                    key={label}
                                    className={`theme-text-secondary px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${
                                      index ===
                                        2 ||
                                      index ===
                                        3 ||
                                      index ===
                                        5
                                        ? "text-center"
                                        : "text-left"
                                    }`}
                                  >
                                    {label}
                                  </th>
                                )
                              )}
                            </tr>
                          </thead>

                          <tbody>
                            {filteredNilaiSiswa.map(
                              (
                                item,
                                index
                              ) => {
                                const score =
                                  getNilai(item);

                                const status =
                                  getStatus(item);

                                return (
                                  <tr
                                    key={
                                      item.id ||
                                      item.siswaId ||
                                      `row-${index}`
                                    }
                                    className={`group border-b ${themeDivider} transition ${themeNeutralHover}`}
                                  >
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div
                                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} text-sm font-bold ${themePrimaryText}`}
                                        >
                                          {String(
                                            item.namaLengkap ||
                                              "S"
                                          )
                                            .charAt(
                                              0
                                            )
                                            .toUpperCase()}
                                        </div>

                                        <div className="min-w-0">
                                          <p className="theme-text max-w-[230px] truncate text-sm font-bold">
                                            {item.namaLengkap ||
                                              "Nama siswa belum tersedia"}
                                          </p>

                                          <p className="theme-text-muted mt-1 text-xs">
                                            {item.siswaId
                                              ? `ID: ${item.siswaId}`
                                              : "ID tidak tersedia"}
                                          </p>
                                        </div>
                                      </div>
                                    </td>

                                    <td className="px-6 py-4">
                                      <div className="space-y-1">
                                        <p className="theme-text-secondary text-sm font-medium">
                                          NIS:{" "}
                                          <span className="theme-text font-semibold">
                                            {item.nis ||
                                              "-"}
                                          </span>
                                        </p>

                                        <p className="theme-text-secondary text-xs">
                                          NISN:{" "}
                                          {item.nisn ||
                                            "-"}
                                        </p>
                                      </div>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                      {status ===
                                      "belum_mengerjakan" ? (
                                        <span className="theme-text-muted text-lg font-semibold">
                                          —
                                        </span>
                                      ) : (
                                        <div>
                                          <span
                                            className={`text-2xl font-bold ${getScoreClasses(
                                              score
                                            )}`}
                                          >
                                            {score.toFixed(
                                              0
                                            )}
                                          </span>

                                          <p className="theme-text-muted mt-0.5 text-[10px] font-medium uppercase tracking-wide">
                                            nilai
                                          </p>
                                        </div>
                                      )}
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                      <span
                                        className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                                          status
                                        )}`}
                                      >
                                        {getStatusLabel(
                                          status
                                        )}
                                      </span>
                                    </td>

                                    <td className="px-6 py-4">
                                      {getStartTime(
                                        item
                                      ) ? (
                                        <div className="space-y-2">
                                          <div className="flex items-start gap-2">
                                            <Clock3
                                              className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${themePrimaryText}`}
                                            />

                                            <div>
                                              <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wide">
                                                Mulai
                                              </p>

                                              <p className="theme-text-secondary mt-0.5 text-xs font-medium">
                                                {formatDateTime(
                                                  getStartTime(
                                                    item
                                                  )
                                                )}
                                              </p>
                                            </div>
                                          </div>

                                          {getEndTime(
                                            item
                                          ) && (
                                            <div className="flex items-start gap-2">
                                              <CheckCircle2
                                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-success)]"
                                              />

                                              <div>
                                                <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wide">
                                                  Selesai
                                                </p>

                                                <p className="theme-text-secondary mt-0.5 text-xs font-medium">
                                                  {formatDateTime(
                                                    getEndTime(
                                                      item
                                                    )
                                                  )}
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="theme-text-muted text-xs">
                                          Belum ada percobaan
                                        </span>
                                      )}
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openDetail(
                                            item
                                          )
                                        }
                                        className={`theme-card inline-flex items-center gap-2 rounded-xl border ${themeNeutralBorder} px-3.5 py-2 text-xs font-bold theme-text-secondary ${themeSmallShadow} transition hover:${themePrimaryText} ${themePrimarySoft}`}
                                      >
                                        <Eye className="h-4 w-4" />
                                        Detail
                                      </button>
                                    </td>
                                  </tr>
                                );
                              }
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div
                        className={`flex items-center justify-between border-t ${themeDivider} ${themeNeutralSurface} px-6 py-3`}
                      >
                        <p className="theme-text-secondary text-xs">
                          Menampilkan{" "}
                          <span className="theme-text font-semibold">
                            {
                              filteredNilaiSiswa.length
                            }
                          </span>{" "}
                          siswa
                        </p>

                        <p className="theme-text-muted text-xs">
                          Data nilai berasal dari hasil
                          pengerjaan ujian
                        </p>
                      </div>
                    </div>

                    {/* =================================================
                        MOBILE
                    ================================================== */}

                    <div className="space-y-4 md:hidden">
                      {filteredNilaiSiswa.map(
                        (item, index) => {
                          const score =
                            getNilai(item);

                          const status =
                            getStatus(item);

                          return (
                            <div
                              key={
                                item.id ||
                                item.siswaId ||
                                `mobile-${index}`
                              }
                              className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
                            >
                              <div className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex min-w-0 items-center gap-3">
                                    <div
                                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} font-bold ${themePrimaryText}`}
                                    >
                                      {String(
                                        item.namaLengkap ||
                                          "S"
                                      )
                                        .charAt(
                                          0
                                        )
                                        .toUpperCase()}
                                    </div>

                                    <div className="min-w-0">
                                      <h3 className="theme-text truncate text-sm font-bold">
                                        {item.namaLengkap ||
                                          "Nama siswa belum tersedia"}
                                      </h3>

                                      <p className="theme-text-secondary mt-1 text-xs">
                                        NIS:{" "}
                                        {item.nis ||
                                          "-"}
                                      </p>
                                    </div>
                                  </div>

                                  <span
                                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusClasses(
                                      status
                                    )}`}
                                  >
                                    {getStatusLabel(
                                      status
                                    )}
                                  </span>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                  <div
                                    className={`rounded-xl ${themeNeutralSurface} p-4 text-center`}
                                  >
                                    <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
                                      Nilai
                                    </p>

                                    <p
                                      className={`mt-1 text-3xl font-bold ${getScoreClasses(
                                        score
                                      )}`}
                                    >
                                      {status ===
                                      "belum_mengerjakan"
                                        ? "-"
                                        : score.toFixed(
                                            0
                                          )}
                                    </p>
                                  </div>

                                  <div
                                    className={`rounded-xl ${themeNeutralSurface} p-4`}
                                  >
                                    <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
                                      NISN
                                    </p>

                                    <p className="theme-text mt-2 truncate text-sm font-bold">
                                      {item.nisn ||
                                        "-"}
                                    </p>
                                  </div>
                                </div>

                                <div
                                  className={`mt-3 rounded-xl border ${themeNeutralBorder} p-4`}
                                >
                                  <div className="theme-text-secondary flex items-center gap-2">
                                    <Clock3
                                      className={`h-4 w-4 ${themePrimaryText}`}
                                    />

                                    <span className="text-xs font-semibold">
                                      Waktu Pengerjaan
                                    </span>
                                  </div>

                                  {getStartTime(
                                    item
                                  ) ? (
                                    <div className="mt-3 space-y-2">
                                      <div className="flex justify-between gap-3">
                                        <span className="theme-text-muted text-xs">
                                          Mulai
                                        </span>

                                        <span className="theme-text-secondary text-right text-xs font-medium">
                                          {formatDateTime(
                                            getStartTime(
                                              item
                                            )
                                          )}
                                        </span>
                                      </div>

                                      <div className="flex justify-between gap-3">
                                        <span className="theme-text-muted text-xs">
                                          Selesai
                                        </span>

                                        <span className="theme-text-secondary text-right text-xs font-medium">
                                          {getEndTime(
                                            item
                                          )
                                            ? formatDateTime(
                                                getEndTime(
                                                  item
                                                )
                                              )
                                            : "Belum selesai"}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="theme-text-muted mt-2 text-xs">
                                      Belum ada percobaan
                                    </p>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openDetail(
                                      item
                                    )
                                  }
                                  className={`theme-card mt-4 flex w-full items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} px-4 py-3 text-sm font-bold theme-text-secondary transition hover:${themePrimaryText} ${themePrimarySoft}`}
                                >
                                  <Eye className="h-4 w-4" />
                                  Lihat Detail
                                </button>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* ==========================================================
          DETAIL MODAL
      =========================================================== */}

      {showDetailModal && selectedSiswa && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[color-mix(in_srgb,var(--color-text)_55%,transparent)] p-4 backdrop-blur-sm"
          onClick={closeDetail}
        >
          <div
            className={`theme-card max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl ${themeCardShadow}`}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div
              className={`flex items-start justify-between border-b ${themeDivider} ${themeNeutralSurface} p-5 md:p-6`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                >
                  <Award className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h2 className="theme-text text-lg font-bold">
                    Detail Nilai
                  </h2>

                  <p className="theme-text-secondary mt-0.5 text-xs">
                    Hasil pengerjaan siswa
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDetail}
                className={`theme-text-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${themeNeutralHover} hover:${themePrimaryText}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(92vh-140px)] overflow-y-auto p-5 md:p-6">
              <div
                className={`theme-card rounded-2xl border ${themeNeutralBorder} p-4 ${themeSmallShadow}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${themePrimarySoft} text-lg font-bold ${themePrimaryText}`}
                  >
                    {String(
                      selectedSiswa.namaLengkap ||
                        "S"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h3 className="theme-text truncate text-lg font-bold">
                      {selectedSiswa.namaLengkap ||
                        "Nama siswa belum tersedia"}
                    </h3>

                    <div className="theme-text-secondary mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <span>
                        NIS:{" "}
                        {selectedSiswa.nis || "-"}
                      </span>

                      <span>
                        NISN:{" "}
                        {selectedSiswa.nisn || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div
                  className={`rounded-2xl border ${themeNeutralBorder} ${themeNeutralSurface} p-5 text-center`}
                >
                  <p className="theme-text-muted text-xs font-bold uppercase tracking-wider">
                    Nilai Akhir
                  </p>

                  <p
                    className={`mt-3 text-5xl font-bold ${getScoreClasses(
                      getNilai(
                        selectedSiswa
                      )
                    )}`}
                  >
                    {getStatus(
                      selectedSiswa
                    ) === "belum_mengerjakan"
                      ? "-"
                      : getNilai(
                          selectedSiswa
                        ).toFixed(0)}
                  </p>

                  <span
                    className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                      getStatus(
                        selectedSiswa
                      )
                    )}`}
                  >
                    {getStatusLabel(
                      getStatus(
                        selectedSiswa
                      )
                    )}
                  </span>
                </div>

                <div
                  className={`theme-card rounded-2xl border ${themeNeutralBorder} p-5`}
                >
                  <p className="theme-text text-sm font-bold">
                    Ringkasan Jawaban
                  </p>

                  <div className="mt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="theme-text-secondary text-sm">
                        Benar
                      </span>

                      <span
                        className={`rounded-lg ${themeSuccessSurface} px-2.5 py-1 text-sm font-bold text-[var(--color-success)]`}
                      >
                        {getBenar(
                          selectedSiswa
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="theme-text-secondary text-sm">
                        Salah
                      </span>

                      <span
                        className={`rounded-lg ${themeDangerSurface} px-2.5 py-1 text-sm font-bold theme-danger`}
                      >
                        {getSalah(
                          selectedSiswa
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="theme-text-secondary text-sm">
                        Dilewati
                      </span>

                      <span
                        className={`rounded-lg ${themeNeutralSurface} px-2.5 py-1 text-sm font-bold theme-text-secondary`}
                      >
                        {getLewati(
                          selectedSiswa
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* INFORMASI UJIAN */}

              <div
                className={`theme-card mt-4 rounded-2xl border ${themeNeutralBorder} p-5`}
              >
                <p className="theme-text text-sm font-bold">
                  Informasi Ujian
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    ["Ujian", namaUjian],
                    [
                      "Mata Pelajaran",
                      mataPelajaran,
                    ],
                    ["Kelas", namaKelas],
                    [
                      "Jenis",
                      getJenisLabel(
                        jenisUjian
                      ),
                    ],
                  ].map(
                    ([label, value]) => (
                      <div key={label}>
                        <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
                          {label}
                        </p>

                        <p className="theme-text mt-1 text-sm font-semibold">
                          {value}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* WAKTU */}

              <div
                className={`theme-card mt-4 rounded-2xl border ${themeNeutralBorder} p-5`}
              >
                <h3 className="theme-text flex items-center gap-2 text-sm font-bold">
                  <Clock3
                    className={`h-4 w-4 ${themePrimaryText}`}
                  />
                  Waktu Pengerjaan
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div
                    className={`rounded-xl ${themeNeutralSurface} p-4`}
                  >
                    <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
                      Waktu Mulai
                    </p>

                    <p className="theme-text mt-2 text-sm font-semibold">
                      {getStartTime(
                        selectedSiswa
                      )
                        ? formatDateTime(
                            getStartTime(
                              selectedSiswa
                            )
                          )
                        : "Belum mulai"}
                    </p>
                  </div>

                  <div
                    className={`rounded-xl ${themeNeutralSurface} p-4`}
                  >
                    <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
                      Waktu Selesai
                    </p>

                    <p className="theme-text mt-2 text-sm font-semibold">
                      {getEndTime(
                        selectedSiswa
                      )
                        ? formatDateTime(
                            getEndTime(
                              selectedSiswa
                            )
                          )
                        : "Belum selesai"}
                    </p>
                  </div>
                </div>
              </div>

              {/* HASIL */}

              {getHasil(selectedSiswa) && (
                <div
                  className={`mt-4 rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${theme-card} ${themeInfoBorder} text-[var(--color-info)]`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-[var(--color-info)] text-sm font-bold">
                        Hasil ujian tersimpan
                      </p>

                      <p className="theme-text-secondary mt-1 text-xs leading-5">
                        Nilai yang ditampilkan menggunakan
                        hasil yang dihitung dan dikirim oleh
                        backend.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`flex justify-end border-t ${themeDivider} ${themeNeutralSurface} p-4 md:p-5`}
            >
              <button
                type="button"
                onClick={closeDetail}
                className={`rounded-xl ${themePrimaryGradient} px-5 py-2.5 text-sm font-bold text-[var(--color-card)] ${themePrimaryShadow} transition hover:opacity-90`}
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