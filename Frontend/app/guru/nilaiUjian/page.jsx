"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import { getKelasMapel } from "../../../services/kelasMapel.service";
import { getKelasById } from "../../../services/kelas.service";
import {
  getUjianByKelasMapel,
  getDetailUjian,
} from "../../../services/ujian.service";

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
  return user.id || user.userId || user.penggunaId || user.guruId || null;
}

function normalizeId(value) {
  if (value === null || value === undefined || value === "") return null;
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
  if (minutes === null || minutes === undefined || minutes === "") return "-";
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
  const siswa = item.siswa || item.pengguna || item.student || item.user || null;
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
  const siswa = item.siswa || item.pengguna || item.student || item.user || null;
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
  const siswa = item.siswa || item.pengguna || item.student || item.user || null;
  return siswa?.nis || item.nis || item.nomorInduk || "-";
}

function getStudentNisn(item) {
  if (!item) return "-";
  const siswa = item.siswa || item.pengguna || item.student || item.user || null;
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
  return Number(hasil?.jumlahBenar ?? item?.jumlahBenar ?? item?.benar ?? 0);
}

function getSalah(item) {
  const hasil = getHasil(item);
  return Number(hasil?.jumlahSalah ?? item?.jumlahSalah ?? item?.salah ?? 0);
}

function getLewati(item) {
  const hasil = getHasil(item);
  return Number(hasil?.jumlahLewati ?? item?.jumlahLewati ?? item?.lewati ?? 0);
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

  if (["dibatalkan", "cancelled", "canceled"].includes(value)) {
    return "dibatalkan";
  }

  if (hasil || item.selesaiPada || item.waktuSelesai || item.submittedAt) {
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
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "berlangsung":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "dibatalkan":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function getScoreClasses(score) {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
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

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
  valueClass = "text-slate-900",
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={`mt-2 text-3xl font-bold tracking-tight ${valueClass}`}>
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
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

export default function NilaiUjianGuruPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [kelasMapel, setKelasMapel] = useState([]);
  const [selectedKelasMapel, setSelectedKelasMapel] = useState(null);
  const [kelas, setKelas] = useState(null);
  const [ujian, setUjian] = useState([]);
  const [selectedUjianId, setSelectedUjianId] = useState("");
  const [detailUjian, setDetailUjian] = useState(null);
  const [loadingKelasMapel, setLoadingKelasMapel] = useState(true);
  const [loadingUjian, setLoadingUjian] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [sortBy, setSortBy] = useState("nama");
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
            return normalizeId(guruId) === normalizeId(currentUserId);
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
      console.error("Gagal memuat kelas mapel:", err);
      setError(err?.message || "Gagal memuat daftar kelas dan mata pelajaran.");
    } finally {
      setLoadingKelasMapel(false);
    }
  }, []);

  const loadDetailKelas = useCallback(async (kelasId) => {
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
      console.error("Gagal memuat detail kelas:", err);
      setKelas(null);
      return null;
    }
  }, []);

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
      const response = await getUjianByKelasMapel(selectedKelasMapel.id);
      const list = parseData(response);
      setUjian(list);
      if (list.length > 0) {
        const first = list[0];
        setSelectedUjianId(first.id || first.asesmenId || "");
      } else {
        setSelectedUjianId("");
        setDetailUjian(null);
      }
    } catch (err) {
      console.error("Gagal memuat ujian:", err);
      setUjian([]);
      setError(err?.message || "Gagal memuat daftar ujian.");
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
      const response = await getDetailUjian(selectedUjianId);
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
      console.error("Gagal memuat detail ujian:", err);
      setDetailUjian(null);
      setError(err?.message || "Gagal memuat detail nilai ujian.");
    } finally {
      setLoadingDetail(false);
    }
  }, [selectedUjianId, selectedKelasMapel, loadDetailKelas]);

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
      (item) => normalizeId(item.id) === normalizeId(id)
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
    if (Array.isArray(detailUjian.nilaiSiswa)) return detailUjian.nilaiSiswa;
    if (Array.isArray(detailUjian.percobaanUjian))
      return detailUjian.percobaanUjian;
    if (Array.isArray(detailUjian.data?.nilaiSiswa))
      return detailUjian.data.nilaiSiswa;
    if (Array.isArray(detailUjian.data?.percobaanUjian))
      return detailUjian.data.percobaanUjian;
    return [];
  }, [detailUjian]);

  const anggotaKelas = useMemo(() => {
    if (!kelas) return [];
    if (Array.isArray(kelas.anggota)) return kelas.anggota;
    if (Array.isArray(kelas.anggotaKelas)) return kelas.anggotaKelas;
    if (Array.isArray(kelas.siswa)) return kelas.siswa;
    if (Array.isArray(kelas.data?.anggota)) return kelas.data.anggota;
    if (Array.isArray(kelas.data?.anggotaKelas)) return kelas.data.anggotaKelas;
    if (Array.isArray(kelas.data?.siswa)) return kelas.data.siswa;
    return [];
  }, [kelas]);

  const normalizedNilaiSource = useMemo(() => {
    if (!Array.isArray(nilaiSource)) return [];
    return nilaiSource.map((item, index) => {
      const siswa =
        item?.siswa || item?.pengguna || item?.student || item?.user || null;
      const siswaId = getStudentId(item);
      const hasil =
        item?.hasilUjian || item?.hasilAsesmen || item?.hasil || null;
      const nilai = item?.nilai ?? hasil?.totalNilai ?? item?.totalNilai ?? null;
      return {
        ...item,
        _sourceIndex: index,
        id: item?.id || item?.percobaanUjianId || `nilai-${siswaId || index}`,
        siswaId,
        siswa,
        namaLengkap: getStudentName(item),
        nis: getStudentNis(item),
        nisn: getStudentNisn(item),
        nilai:
          nilai !== null && nilai !== undefined && nilai !== ""
            ? Number(nilai)
            : 0,
        status: getStatus(item),
        hasil,
        waktuMulai: item?.dimulaiPada || item?.waktuMulai || item?.mulaiPada || null,
        waktuSelesai: item?.selesaiPada || item?.waktuSelesai || null,
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
        existing.waktuSelesai || existing.waktuMulai || 0
      ).getTime();
      const currentTime = new Date(
        item.waktuSelesai || item.waktuMulai || 0
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
        let attempt = siswaId ? nilaiBySiswaId.get(siswaId) : null;
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
                  String(item.namaLengkap || "").trim().toLowerCase() === nama
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
        const nis = siswa?.nis || anggota?.nis || attempt?.nis || "-";
        const nisn = siswa?.nisn || anggota?.nisn || attempt?.nisn || "-";
        if (attempt) {
          return {
            ...attempt,
            id: attempt.id || `attempt-${siswaId || index}`,
            siswaId: siswaId || attempt.siswaId,
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
          id: `kelas-member-${siswaId || index}`,
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
  }, [anggotaKelas, nilaiBySiswaId, normalizedNilaiSource]);

  const filteredNilaiSiswa = useMemo(() => {
    let result = [...nilaiSiswa];
    const keyword = search.trim().toLowerCase();
    if (keyword) {
      result = result.filter((item) => {
        const nama = String(item.namaLengkap || "").toLowerCase();
        const nis = String(item.nis || "").toLowerCase();
        const nisn = String(item.nisn || "").toLowerCase();
        return (
          nama.includes(keyword) ||
          nis.includes(keyword) ||
          nisn.includes(keyword)
        );
      });
    }
    if (statusFilter !== "semua") {
      result = result.filter((item) => getStatus(item) === statusFilter);
    }
    result.sort((a, b) => {
      if (sortBy === "nilai_tertinggi") return getNilai(b) - getNilai(a);
      if (sortBy === "nilai_terendah") return getNilai(a) - getNilai(b);
      if (sortBy === "status") return getStatus(a).localeCompare(getStatus(b));
      return String(a.namaLengkap || "").localeCompare(
        String(b.namaLengkap || ""),
        "id"
      );
    });
    return result;
  }, [nilaiSiswa, search, statusFilter, sortBy]);

  const statistics = useMemo(() => {
    const total = nilaiSiswa.length;
    const selesai = nilaiSiswa.filter(
      (item) => getStatus(item) === "selesai"
    ).length;
    const berlangsung = nilaiSiswa.filter(
      (item) => getStatus(item) === "berlangsung"
    ).length;
    const belum = nilaiSiswa.filter(
      (item) => getStatus(item) === "belum_mengerjakan"
    ).length;
    const dikerjakan = nilaiSiswa.filter((item) => {
      const status = getStatus(item);
      return status === "selesai" || status === "berlangsung";
    });
    const scores = dikerjakan
      .map((item) => getNilai(item))
      .filter((score) => !Number.isNaN(Number(score)));
    const totalNilai = scores.reduce((sum, value) => sum + Number(value), 0);
    const rataRata = scores.length > 0 ? totalNilai / scores.length : 0;
    const nilaiTertinggi = scores.length > 0 ? Math.max(...scores) : 0;
    const nilaiTerendah = scores.length > 0 ? Math.min(...scores) : 0;
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
          normalizeId(item.id || item.asesmenId) ===
          normalizeId(selectedUjianId)
      ) ||
      detailUjian ||
      null
    );
  }, [ujian, selectedUjianId, detailUjian]);

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

  const durasi = detailUjian?.durasi ?? currentUjian?.durasi ?? null;

  const tanggalMulai =
    detailUjian?.waktuMulai ||
    detailUjian?.tanggalMulai ||
    detailUjian?.mulaiPada ||
    currentUjian?.waktuMulai ||
    currentUjian?.tanggalMulai ||
    null;

  const mataPelajaran =
    detailUjian?.kelasMapel?.mataPelajaran?.nama ||
    selectedKelasMapel?.mataPelajaran?.nama ||
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

  if (loadingKelasMapel) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
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
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
              </div>
              <h2 className="mt-5 text-base font-bold text-slate-900">
                Memuat data
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sedang menyiapkan kelas, mata pelajaran, dan data ujian Anda.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
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
            <section className="relative mb-6 overflow-hidden rounded-3xl bg-[#0D47C9] shadow-lg">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
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
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50 backdrop-blur-sm">
                      <Award className="h-3.5 w-3.5" />
                      PENILAIAN AKADEMIK
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                      Nilai Ujian
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
                      Pantau hasil pengerjaan, perkembangan nilai, dan status
                      siswa pada setiap ujian yang Anda kelola.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
                        {namaKelas !== "-" ? namaKelas : "Kelas belum dipilih"}
                      </span>
                      <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
                        {mataPelajaran !== "-" ? mataPelajaran : "Mata pelajaran"}
                      </span>
                      {selectedUjianId && (
                        <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
                          {getJenisLabel(jenisUjian)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                      Ujian Terpilih
                    </p>
                    <p className="mt-2 line-clamp-2 text-lg font-bold text-white">
                      {namaUjian}
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-white/10 p-3">
                        <p className="text-[11px] text-blue-100">Siswa</p>
                        <p className="mt-1 text-xl font-bold text-white">
                          {statistics.total}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white/10 p-3">
                        <p className="text-[11px] text-blue-100">Selesai</p>
                        <p className="mt-1 text-xl font-bold text-white">
                          {statistics.selesai}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white/10 p-3">
                        <p className="text-[11px] text-blue-100">Rata-rata</p>
                        <p className="mt-1 text-xl font-bold text-white">
                          {statistics.rataRata.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-red-800">Terjadi kesalahan</p>
                  <p className="mt-1 text-sm leading-5 text-red-700">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    loadKelasMapel();
                  }}
                  className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Coba lagi
                </button>
              </div>
            )}

            <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-slate-900">
                      Kelas & Mata Pelajaran
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Pilih kelas dan mata pelajaran yang ingin Anda pantau.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={selectedKelasMapel?.id || ""}
                    onChange={(e) => handleChangeKelasMapel(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-11 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  >
                    {kelasMapel.length === 0 ? (
                      <option value="">
                        Belum ada kelas dan mata pelajaran
                      </option>
                    ) : (
                      kelasMapel.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.kelas?.nama || item.namaKelas || "Kelas"} —{" "}
                          {item.mataPelajaran?.nama ||
                            item.namaMataPelajaran ||
                            "Mata Pelajaran"}
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-slate-900">Pilih Ujian</h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Pilih ujian untuk melihat hasil nilai siswa.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={selectedUjianId}
                    onChange={(e) => setSelectedUjianId(e.target.value)}
                    disabled={loadingUjian || ujian.length === 0}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-11 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingUjian ? (
                      <option value="">Memuat ujian...</option>
                    ) : ujian.length === 0 ? (
                      <option value="">Belum ada ujian</option>
                    ) : (
                      ujian.map((item) => {
                        const id = item.id || item.asesmenId;
                        return (
                          <option key={id} value={id}>
                            {item.judul ||
                              item.nama ||
                              item.namaUjian ||
                              "Ujian"}
                          </option>
                        );
                      })
                    )}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </section>

            {!loadingUjian && ujian.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <FileText className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  Belum ada ujian
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Belum terdapat ujian pada kelas dan mata pelajaran yang
                  dipilih.
                </p>
              </div>
            )}

            {selectedUjianId && currentUjian && (
              <>
                <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            {getJenisLabel(jenisUjian)}
                          </span>
                          {detailUjian?.dipublikasikan && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Dipublikasikan
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                          {namaUjian}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <GraduationCap className="h-4 w-4 text-blue-500" />
                            {namaKelas}
                          </span>
                          <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
                          <span className="inline-flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            {mataPelajaran}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[520px]">
                        <div className="rounded-xl bg-slate-50 p-3.5">
                          <div className="flex items-center gap-2 text-slate-500">
                            <BookOpen className="h-4 w-4" />
                            <span className="text-xs">Soal</span>
                          </div>
                          <p className="mt-1.5 text-lg font-bold text-slate-900">
                            {jumlahSoal}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3.5">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Clock3 className="h-4 w-4" />
                            <span className="text-xs">Durasi</span>
                          </div>
                          <p className="mt-1.5 text-sm font-bold text-slate-900">
                            {formatDuration(durasi)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3.5">
                          <div className="flex items-center gap-2 text-slate-500">
                            <CalendarDays className="h-4 w-4" />
                            <span className="text-xs">Mulai</span>
                          </div>
                          <p className="mt-1.5 text-xs font-bold text-slate-900">
                            {tanggalMulai ? formatDate(tanggalMulai) : "-"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3.5">
                          <div className="flex items-center gap-2 text-blue-600">
                            <Users className="h-4 w-4" />
                            <span className="text-xs">Siswa</span>
                          </div>
                          <p className="mt-1.5 text-lg font-bold text-blue-700">
                            {statistics.total}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {(detailUjian?.deskripsi || detailUjian?.keterangan) && (
                    <div className="bg-slate-50/70 px-6 py-4">
                      <p className="text-sm leading-6 text-slate-600">
                        {detailUjian?.deskripsi || detailUjian?.keterangan}
                      </p>
                    </div>
                  )}
                </section>

                <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    label="Total Siswa"
                    value={statistics.total}
                    description="Jumlah anggota kelas"
                    icon={Users}
                    iconClass="bg-blue-50 text-blue-600"
                  />
                  <StatCard
                    label="Sudah Mengerjakan"
                    value={statistics.selesai}
                    description="Ujian telah selesai"
                    icon={CheckCircle2}
                    iconClass="bg-emerald-50 text-emerald-600"
                    valueClass="text-emerald-600"
                  />
                  <StatCard
                    label="Belum Mengerjakan"
                    value={statistics.belum}
                    description="Menunggu pengerjaan"
                    icon={Clock3}
                    iconClass="bg-slate-100 text-slate-600"
                    valueClass="text-slate-700"
                  />
                  <StatCard
                    label="Nilai Rata-rata"
                    value={statistics.rataRata.toFixed(2)}
                    description="Dari siswa yang mengerjakan"
                    icon={BarChart3}
                    iconClass="bg-indigo-50 text-indigo-600"
                    valueClass={getScoreClasses(statistics.rataRata)}
                  />
                </section>

                <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          Nilai Tertinggi
                        </p>
                        <p
                          className={`mt-2 text-3xl font-bold ${getScoreClasses(
                            statistics.nilaiTertinggi
                          )}`}
                        >
                          {statistics.nilaiTertinggi.toFixed(0)}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Award className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          Nilai Terendah
                        </p>
                        <p
                          className={`mt-2 text-3xl font-bold ${getScoreClasses(
                            statistics.nilaiTerendah
                          )}`}
                        >
                          {statistics.nilaiTerendah.toFixed(0)}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          Progress Pengerjaan
                        </p>
                        <p className="mt-2 text-3xl font-bold text-blue-600">
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
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

                <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">
                            Daftar Nilai Siswa
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500">
                            Menampilkan{" "}
                            <span className="font-semibold text-slate-700">
                              {filteredNilaiSiswa.length}
                            </span>{" "}
                            dari{" "}
                            <span className="font-semibold text-slate-700">
                              {nilaiSiswa.length}
                            </span>{" "}
                            siswa
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="relative md:min-w-[260px]">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Cari nama, NIS, NISN..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        />
                      </div>
                      <div className="relative">
                        <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        >
                          <option value="semua">Semua Status</option>
                          <option value="selesai">Selesai</option>
                          <option value="berlangsung">Berlangsung</option>
                          <option value="belum_mengerjakan">
                            Belum Mengerjakan
                          </option>
                          <option value="dibatalkan">Dibatalkan</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        >
                          <option value="nama">Nama A-Z</option>
                          <option value="nilai_tertinggi">
                            Nilai Tertinggi
                          </option>
                          <option value="nilai_terendah">
                            Nilai Terendah
                          </option>
                          <option value="status">Status</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </section>

                {loadingDetail ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-14 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                      <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
                    </div>
                    <h3 className="mt-5 font-bold text-slate-900">
                      Memuat data nilai
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Sedang mengambil hasil pengerjaan siswa...
                    </p>
                  </div>
                ) : filteredNilaiSiswa.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Users className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-900">
                      Data siswa belum ditemukan
                    </h3>
                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                      Tidak ada data siswa yang sesuai dengan pencarian atau
                      filter yang dipilih.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm md:block">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[1050px]">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                Siswa
                              </th>
                              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                Identitas
                              </th>
                              <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                Nilai
                              </th>
                              <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                Status
                              </th>
                              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                Waktu Pengerjaan
                              </th>
                              <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                Aksi
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredNilaiSiswa.map((item, index) => {
                              const score = getNilai(item);
                              const status = getStatus(item);
                              return (
                                <tr
                                  key={
                                    item.id || item.siswaId || `row-${index}`
                                  }
                                  className="group transition hover:bg-blue-50/40"
                                >
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700 transition group-hover:bg-blue-100">
                                        {String(item.namaLengkap || "S")
                                          .charAt(0)
                                          .toUpperCase()}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="max-w-[230px] truncate text-sm font-bold text-slate-900">
                                          {item.namaLengkap ||
                                            "Nama siswa belum tersedia"}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                          {item.siswaId
                                            ? `ID: ${item.siswaId}`
                                            : "ID tidak tersedia"}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium text-slate-700">
                                        NIS:{" "}
                                        <span className="font-semibold text-slate-900">
                                          {item.nis || "-"}
                                        </span>
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        NISN: {item.nisn || "-"}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    {status === "belum_mengerjakan" ? (
                                      <span className="text-lg font-semibold text-slate-300">
                                        —
                                      </span>
                                    ) : (
                                      <div>
                                        <span
                                          className={`text-2xl font-bold ${getScoreClasses(
                                            score
                                          )}`}
                                        >
                                          {score.toFixed(0)}
                                        </span>
                                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
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
                                      {getStatusLabel(status)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    {getStartTime(item) ? (
                                      <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                          <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                                          <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                              Mulai
                                            </p>
                                            <p className="mt-0.5 text-xs font-medium text-slate-700">
                                              {formatDateTime(
                                                getStartTime(item)
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                        {getEndTime(item) && (
                                          <div className="flex items-start gap-2">
                                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                            <div>
                                              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                Selesai
                                              </p>
                                              <p className="mt-0.5 text-xs font-medium text-slate-700">
                                                {formatDateTime(
                                                  getEndTime(item)
                                                )}
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-slate-400">
                                        Belum ada percobaan
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <button
                                      type="button"
                                      onClick={() => openDetail(item)}
                                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                    >
                                      <Eye className="h-4 w-4" />
                                      Detail
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-3">
                        <p className="text-xs text-slate-500">
                          Menampilkan{" "}
                          <span className="font-semibold text-slate-700">
                            {filteredNilaiSiswa.length}
                          </span>{" "}
                          siswa
                        </p>
                        <p className="text-xs text-slate-400">
                          Data nilai berasal dari hasil pengerjaan ujian
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 md:hidden">
                      {filteredNilaiSiswa.map((item, index) => {
                        const score = getNilai(item);
                        const status = getStatus(item);
                        return (
                          <div
                            key={
                              item.id || item.siswaId || `mobile-${index}`
                            }
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                          >
                            <div className="p-5">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
                                    {String(item.namaLengkap || "S")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className="truncate text-sm font-bold text-slate-900">
                                      {item.namaLengkap ||
                                        "Nama siswa belum tersedia"}
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                      NIS: {item.nis || "-"}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusClasses(
                                    status
                                  )}`}
                                >
                                  {getStatusLabel(status)}
                                </span>
                              </div>

                              <div className="mt-5 grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-slate-50 p-4 text-center">
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                    Nilai
                                  </p>
                                  <p
                                    className={`mt-1 text-3xl font-bold ${getScoreClasses(
                                      score
                                    )}`}
                                  >
                                    {status === "belum_mengerjakan"
                                      ? "-"
                                      : score.toFixed(0)}
                                  </p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-4">
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                    NISN
                                  </p>
                                  <p className="mt-2 truncate text-sm font-bold text-slate-800">
                                    {item.nisn || "-"}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 rounded-xl border border-slate-100 p-4">
                                <div className="flex items-center gap-2 text-slate-500">
                                  <Clock3 className="h-4 w-4 text-blue-500" />
                                  <span className="text-xs font-semibold">
                                    Waktu Pengerjaan
                                  </span>
                                </div>
                                {getStartTime(item) ? (
                                  <div className="mt-3 space-y-2">
                                    <div className="flex justify-between gap-3">
                                      <span className="text-xs text-slate-400">
                                        Mulai
                                      </span>
                                      <span className="text-right text-xs font-medium text-slate-700">
                                        {formatDateTime(getStartTime(item))}
                                      </span>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                      <span className="text-xs text-slate-400">
                                        Selesai
                                      </span>
                                      <span className="text-right text-xs font-medium text-slate-700">
                                        {getEndTime(item)
                                          ? formatDateTime(getEndTime(item))
                                          : "Belum selesai"}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="mt-2 text-xs text-slate-400">
                                    Belum ada percobaan
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => openDetail(item)}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Eye className="h-4 w-4" />
                                Lihat Detail
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {showDetailModal && selectedSiswa && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={closeDetail}
        >
          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50/80 p-5 md:p-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Award className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-900">
                    Detail Nilai
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Hasil pengerjaan siswa
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDetail}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(92vh-140px)] overflow-y-auto p-5 md:p-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg font-bold text-blue-700">
                    {String(selectedSiswa.namaLengkap || "S")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold text-slate-900">
                      {selectedSiswa.namaLengkap ||
                        "Nama siswa belum tersedia"}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>NIS: {selectedSiswa.nis || "-"}</span>
                      <span>NISN: {selectedSiswa.nisn || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Nilai Akhir
                  </p>
                  <p
                    className={`mt-3 text-5xl font-bold ${getScoreClasses(
                      getNilai(selectedSiswa)
                    )}`}
                  >
                    {getStatus(selectedSiswa) === "belum_mengerjakan"
                      ? "-"
                      : getNilai(selectedSiswa).toFixed(0)}
                  </p>
                  <span
                    className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                      getStatus(selectedSiswa)
                    )}`}
                  >
                    {getStatusLabel(getStatus(selectedSiswa))}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-bold text-slate-900">
                    Ringkasan Jawaban
                  </p>
                  <div className="mt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Benar</span>
                      <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-bold text-emerald-600">
                        {getBenar(selectedSiswa)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Salah</span>
                      <span className="rounded-lg bg-red-50 px-2.5 py-1 text-sm font-bold text-red-600">
                        {getSalah(selectedSiswa)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Dilewati</span>
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-bold text-slate-600">
                        {getLewati(selectedSiswa)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-bold text-slate-900">
                  Informasi Ujian
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Ujian
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {namaUjian}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Mata Pelajaran
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {mataPelajaran}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Kelas
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {namaKelas}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Jenis
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {getJenisLabel(jenisUjian)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Clock3 className="h-4 w-4 text-blue-600" />
                  Waktu Pengerjaan
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Waktu Mulai
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {getStartTime(selectedSiswa)
                        ? formatDateTime(getStartTime(selectedSiswa))
                        : "Belum mulai"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Waktu Selesai
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {getEndTime(selectedSiswa)
                        ? formatDateTime(getEndTime(selectedSiswa))
                        : "Belum selesai"}
                    </p>
                  </div>
                </div>
              </div>

              {getHasil(selectedSiswa) && (
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900">
                        Hasil ujian tersimpan
                      </p>
                      <p className="mt-1 text-xs leading-5 text-blue-700">
                        Nilai yang ditampilkan menggunakan hasil yang dihitung
                        dan dikirim oleh backend.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-200 bg-slate-50/70 p-4 md:p-5">
              <button
                type="button"
                onClick={closeDetail}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
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