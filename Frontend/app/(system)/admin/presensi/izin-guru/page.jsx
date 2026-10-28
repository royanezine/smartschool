"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  getDaftarIzin,
  verifikasiIzin,
  verifikasiPengajuan,
} from "@/services/izin.service";
import { getUsers } from "@/services/user.service";

/* =========================================================
   HELPER RESPONSE API
========================================================= */

function normalizeResponseData(response) {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];

  const candidates = [
    response.data,
    response.data?.data,
    response.data?.items,
    response.data?.results,
    response.items,
    response.results,
  ];

  return candidates.find(Array.isArray) || [];
}

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

/* =========================================================
   HELPER PENGGUNA
========================================================= */

function getPengguna(item) {
  return (
    item?.pengguna ||
    item?.user ||
    item?.pemohon ||
    item?.siswa ||
    item?.pegawai ||
    {}
  );
}

function getRoleValues(item) {
  const pengguna = getPengguna(item);
  const peran = pengguna?.peran;
  const role = pengguna?.role;

  const values = [
    peran?.namaTampilan,
    peran?.nama,
    peran?.kode,
    typeof peran === "string" ? peran : null,
    role?.namaTampilan,
    role?.nama,
    role?.name,
    role?.kode,
    typeof role === "string" ? role : null,
    pengguna?.jabatan,
    pengguna?.jenisPengguna,
    pengguna?.namaRole,
    item?.peran?.namaTampilan,
    item?.peran?.nama,
    typeof item?.peran === "string" ? item.peran : null,
    item?.role?.nama,
    item?.role?.name,
    typeof item?.role === "string" ? item.role : null,
    item?.jabatan,
    item?.jenisPengguna,
  ];

  return values
    .filter((value) => typeof value === "string" && value.trim())
    .map(normalizeText);
}

function getKategoriPengguna(item) {
  const roles = getRoleValues(item);

  const mengandung = (kataKunci) =>
    roles.some((role) =>
      kataKunci.some((kata) => role.includes(kata))
    );

  if (mengandung(["siswa", "murid", "student", "peserta_didik"])) {
    return "siswa";
  }

  if (mengandung(["guru", "teacher", "tenaga_pendidik", "pendidik"])) {
    return "guru";
  }

  if (mengandung(["orang_tua", "wali_murid", "parent", "wali_siswa"])) {
    return "orang_tua";
  }

  if (
    mengandung([
      "pegawai",
      "staff",
      "staf",
      "karyawan",
      "admin",
      "kepala_sekolah",
      "tenaga_kependidikan",
    ])
  ) {
    return "lainnya";
  }

  return "tidak_diketahui";
}

function getLabelKategori(kategori) {
  const labels = {
    guru: "Guru",
    siswa: "Siswa",
    orang_tua: "Orang Tua",
    lainnya: "Pegawai/Lainnya",
    tidak_diketahui: "Jenis pengguna belum tersedia",
  };

  return labels[kategori] || "Jenis pengguna belum tersedia";
}

function getNamaPengguna(item) {
  const pengguna = getPengguna(item);

  return (
    pengguna?.namaLengkap ||
    pengguna?.nama ||
    pengguna?.name ||
    item?.namaLengkap ||
    item?.nama ||
    item?.name ||
    "Nama tidak tersedia"
  );
}

function getIdentitasPengguna(item) {
  const pengguna = getPengguna(item);
  const kategori = getKategoriPengguna(item);

  if (kategori === "siswa") {
    return (
      pengguna?.nisn ||
      pengguna?.nis ||
      item?.nisn ||
      item?.nis ||
      pengguna?.nomorInduk ||
      "-"
    );
  }

  return (
    pengguna?.nip ||
    item?.nip ||
    pengguna?.nisn ||
    item?.nisn ||
    pengguna?.nis ||
    item?.nis ||
    "-"
  );
}

function getJabatanPengguna(item) {
  const pengguna = getPengguna(item);
  const peran = pengguna?.peran;
  const role = pengguna?.role;

  return (
    pengguna?.jabatan ||
    peran?.namaTampilan ||
    peran?.nama ||
    role?.namaTampilan ||
    role?.nama ||
    role?.name ||
    (typeof peran === "string" ? peran : "") ||
    (typeof role === "string" ? role : "") ||
    item?.jabatan ||
    ""
  );
}

/* =========================================================
   FORMAT DATA
========================================================= */

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTanggalSingkat(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTanggalWaktu(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function hitungDurasi(mulai, selesai) {
  if (!mulai || !selesai) return "-";

  const awal = new Date(mulai);
  const akhir = new Date(selesai);

  if (
    Number.isNaN(awal.getTime()) ||
    Number.isNaN(akhir.getTime())
  ) {
    return "-";
  }

  const selisihHari = Math.floor(
    (Date.UTC(
      akhir.getFullYear(),
      akhir.getMonth(),
      akhir.getDate()
    ) -
      Date.UTC(
        awal.getFullYear(),
        awal.getMonth(),
        awal.getDate()
      )) /
      86400000
  );

  return `${Math.abs(selisihHari) + 1} hari`;
}

function getInitials(nama) {
  return (
    String(nama || "NA")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((bagian) => bagian[0].toUpperCase())
      .join("") || "NA"
  );
}

function getJenisLabel(jenis) {
  const value = normalizeText(jenis);

  if (value === "sakit") return "Sakit";
  if (value === "izin") return "Izin";
  if (value === "cuti") return "Cuti";

  return jenis || "-";
}

function getStatusLabel(status) {
  const value = normalizeText(status);

  if (["menunggu", "pending"].includes(value)) return "Menunggu";
  if (["disetujui", "approved"].includes(value)) return "Disetujui";
  if (["ditolak", "rejected"].includes(value)) return "Ditolak";

  return status || "-";
}

function getStatusStyle(status) {
  const value = normalizeText(status);

  if (["menunggu", "pending"].includes(value)) {
    return {
      badge: "theme-warning",
      dot: "bg-[var(--color-warning)]",
    };
  }

  if (["disetujui", "approved"].includes(value)) {
    return {
      badge: "theme-success",
      dot: "bg-[var(--color-success)]",
    };
  }

  if (["ditolak", "rejected"].includes(value)) {
    return {
      badge: "theme-danger",
      dot: "bg-[var(--color-danger)]",
    };
  }

  return {
    badge: "theme-card-soft theme-text-secondary theme-border",
    dot: "bg-[var(--color-text-muted)]",
  };
}

function getJenisStyle(jenis) {
  const value = normalizeText(jenis);

  if (value === "sakit") return "theme-warning";
  if (value === "izin") return "theme-info";

  return "theme-card-soft theme-text-secondary theme-border";
}

function getUploadUrl(url) {
  if (!url) return null;

  if (/^https?:\/\//i.test(url)) return url;

  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
  ).replace(/\/+$/, "");

  const path = String(url).replace(/^\/+/, "");

  const serverBase = apiBase.replace(/\/api$/i, "");

  return `${serverBase}/${path}`;
}

/* =========================================================
   MAPPING PERMOHONAN IZIN
========================================================= */

function mapIzinToAdminData(item) {
  const pengguna = getPengguna(item);

  const guruPengganti =
    item?.guruPengganti ||
    item?.guru_pengganti ||
    item?.pengganti ||
    null;

  return {
    id: item?.id ?? item?.izinId ?? item?.pengajuanId ?? null,
    nama: getNamaPengguna(item),
    identitas: getIdentitasPengguna(item),
    jabatan: getJabatanPengguna(item),
    kategori: getKategoriPengguna(item),
    penggunaId:
      item?.penggunaId ||
      item?.userId ||
      pengguna?.id ||
      pengguna?.userId ||
      null,
    jenis: item?.jenis || item?.jenisIzin || "-",
    tanggalMulai: item?.tanggalMulai || item?.mulai || null,
    tanggalSelesai: item?.tanggalSelesai || item?.selesai || null,
    alasan: item?.alasan || item?.keterangan || "-",
    urlBukti:
      item?.urlBukti ||
      item?.fileBukti ||
      item?.lampiran ||
      item?.bukti ||
      null,
    status: normalizeText(item?.status || "menunggu"),
    catatan: item?.catatan || item?.catatanVerifikasi || null,
    penyetujuId: item?.penyetujuId || null,
    penyetujuNama:
      item?.penyetuju?.namaLengkap ||
      item?.penyetuju?.nama ||
      item?.penyetuju?.name ||
      null,

    /* Guru pengganti */
    guruPenggantiId:
      item?.guruPenggantiId ||
      guruPengganti?.id ||
      null,
    guruPenggantiNama:
      guruPengganti?.namaLengkap ||
      guruPengganti?.nama ||
      null,
    guruPenggantiNip: guruPengganti?.nip || null,
    guruPenggantiJabatan: guruPengganti?.jabatan || null,

    dibuatPada: item?.dibuatPada || item?.createdAt || null,
    diperbaruiPada: item?.diperbaruiPada || item?.updatedAt || null,
    raw: item,
  };
}

/* =========================================================
   KOMPONEN STATISTIK
========================================================= */

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border theme-border theme-card p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider theme-text-placeholder">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight theme-text">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HALAMAN PERMOHONAN IZIN
========================================================= */

export default function PermohonanIzinGuruPage() {
  const [data, setData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [jenisFilter, setJenisFilter] = useState("semua");
  const [kategoriFilter, setKategoriFilter] = useState("semua");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  /* Modal setujui */
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveGuruPenggantiId, setApproveGuruPenggantiId] =
    useState("");

  /* Modal tolak */
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectCatatan, setRejectCatatan] = useState("");

  /* Daftar guru untuk dropdown pengganti */
  const [guruList, setGuruList] = useState([]);
  const [loadingGuru, setLoadingGuru] = useState(false);

  /* ---------- load data ---------- */

  const loadData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getDaftarIzin();
      const items = normalizeResponseData(response);

      const mapped = items
        .map(mapIzinToAdminData)
        .filter((item) => item.id != null);

      setData(mapped);

      setSelectedId((previousId) => {
        if (!previousId) return null;

        return mapped.some(
          (item) => String(item.id) === String(previousId)
        )
          ? previousId
          : null;
      });
    } catch (err) {
      console.error("Gagal mengambil data permohonan izin:", err);
      setError(
        err?.message || "Gagal mengambil data permohonan izin."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* ---------- load daftar guru ---------- */

  const loadGuru = useCallback(async () => {
    if (guruList.length > 0) return;

    try {
      setLoadingGuru(true);

      const response = await getUsers({
        role: "guru",
        status: "aktif",
        limit: 200,
      });

      const raw =
        response?.data?.data ||
        response?.data ||
        response?.users ||
        response;

      const list = Array.isArray(raw) ? raw : [];

      setGuruList(
        list
          .map((item) => ({
            id: item?.id,
            nama:
              item?.namaLengkap ||
              item?.nama ||
              item?.name ||
              "Tanpa nama",
            nip: item?.nip || null,
            jabatan: item?.jabatan || null,
          }))
          .filter((item) => item.id)
      );
    } catch (err) {
      console.error("Gagal memuat daftar guru:", err);
      // Tidak dijadikan error fatal — dropdown tetap kosong.
    } finally {
      setLoadingGuru(false);
    }
  }, [guruList.length]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---------- derived ---------- */

  const selectedData = useMemo(
    () =>
      data.find((item) => String(item.id) === String(selectedId)) ||
      null,
    [data, selectedId]
  );

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return data.filter((item) => {
      const matchSearch =
        !keyword ||
        String(item.nama).toLowerCase().includes(keyword) ||
        String(item.identitas).toLowerCase().includes(keyword) ||
        String(item.alasan).toLowerCase().includes(keyword) ||
        String(item.jabatan || "").toLowerCase().includes(keyword) ||
        getLabelKategori(item.kategori).toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "semua" || item.status === statusFilter;

      const matchJenis =
        jenisFilter === "semua" ||
        normalizeText(item.jenis) === normalizeText(jenisFilter);

      const matchKategori =
        kategoriFilter === "semua" ||
        item.kategori === kategoriFilter;

      return (
        matchSearch &&
        matchStatus &&
        matchJenis &&
        matchKategori
      );
    });
  }, [data, search, statusFilter, jenisFilter, kategoriFilter]);

  const statistics = useMemo(
    () => ({
      total: data.length,
      menunggu: data.filter((item) =>
        ["menunggu", "pending"].includes(item.status)
      ).length,
      disetujui: data.filter((item) =>
        ["disetujui", "approved"].includes(item.status)
      ).length,
      ditolak: data.filter((item) =>
        ["ditolak", "rejected"].includes(item.status)
      ).length,
    }),
    [data]
  );

  const kategoriStatistics = useMemo(
    () => ({
      guru: data.filter((item) => item.kategori === "guru").length,
      siswa: data.filter((item) => item.kategori === "siswa").length,
      orangTua: data.filter((item) => item.kategori === "orang_tua").length,
      lainnya: data.filter((item) => item.kategori === "lainnya").length,
      tidakDiketahui: data.filter(
        (item) => item.kategori === "tidak_diketahui"
      ).length,
    }),
    [data]
  );

  /* ---------- handlers ---------- */

  const handleSelectData = (item) => {
    setSelectedId(item.id);
    setRejectCatatan(item.catatan || "");
    setApproveGuruPenggantiId(item.guruPenggantiId || "");
    setError("");
  };

  const openApproveModal = () => {
    if (!selectedData) return;

    setError("");
    setApproveGuruPenggantiId(selectedData.guruPenggantiId || "");
    setShowApproveModal(true);

    // Hanya butuh daftar guru kalau pemohon adalah guru.
    if (selectedData.kategori === "guru") {
      loadGuru();
    }
  };

  const openRejectModal = () => {
    if (!selectedData) return;

    setRejectCatatan(selectedData.catatan || "");
    setError("");
    setShowRejectModal(true);
  };

  const handleApprove = async () => {
    if (!selectedData) return;

    try {
      setProcessingId(selectedData.id);
      setError("");

      const guruPenggantiId =
        selectedData.kategori === "guru"
          ? approveGuruPenggantiId || null
          : null;

      // verifikasiPengajuan mendukung payload guruPenggantiId.
      // Kalau backend belum mendukung, ia akan melempar error
      // dengan pesan informatif dan ditangkap di catch.
      await verifikasiPengajuan(selectedData.id, {
        status: "disetujui",
        catatan: "Permohonan izin disetujui.",
        guruPenggantiId,
      });

      setShowApproveModal(false);
      setApproveGuruPenggantiId("");
      await loadData(true);
    } catch (err) {
      console.error("Gagal menyetujui permohonan:", err);
      setError(err?.message || "Gagal menyetujui permohonan izin.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedData) return;

    try {
      setProcessingId(selectedData.id);
      setError("");

      await verifikasiIzin(selectedData.id, {
        status: "ditolak",
        catatan: rejectCatatan.trim() || "Permohonan izin ditolak.",
      });

      setShowRejectModal(false);
      setRejectCatatan("");
      await loadData(true);
    } catch (err) {
      console.error("Gagal menolak permohonan:", err);
      setError(err?.message || "Gagal menolak permohonan izin.");
    } finally {
      setProcessingId(null);
    }
  };

  const isMenunggu = (status) =>
    ["menunggu", "pending"].includes(normalizeText(status));

  /* ---------- render ---------- */

  return (
    <div className="flex h-screen w-full overflow-hidden theme-page">
      <Sidebar />

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 flex-shrink-0 border-b theme-border theme-card">
          <Header />
        </header>

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto theme-page">
          <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
            {/* HEADER */}
            <section className="rounded-2xl border theme-border theme-card shadow-sm">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl theme-primary text-white">
                    <FileText className="h-6 w-6" />
                  </div>

                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs theme-text-placeholder">
                      <span>Admin</span>
                      <span>/</span>
                      <span>Presensi</span>
                      <span>/</span>
                      <span className="font-medium theme-text-secondary">
                        Permohonan Izin
                      </span>
                    </div>

                    <h1 className="text-xl font-bold tracking-tight theme-text sm:text-2xl">
                      Permohonan Izin
                    </h1>

                    <p className="mt-1 text-sm theme-text-muted">
                      Kelola pengajuan izin dan verifikasi permohonan pengguna.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={refreshing}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 text-sm font-medium theme-text-secondary shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      refreshing ? "animate-spin" : ""
                    }`}
                  />
                  {refreshing ? "Memuat..." : "Refresh"}
                </button>
              </div>
            </section>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border theme-danger p-4 text-sm shadow-sm">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Terjadi kesalahan</p>
                  <p className="mt-0.5 break-words">{error}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Tutup pesan kesalahan"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* STATISTIK */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Pengajuan"
                value={statistics.total}
                icon={FileText}
                color="theme-info"
              />
              <StatCard
                label="Menunggu"
                value={statistics.menunggu}
                icon={Clock3}
                color="theme-warning"
              />
              <StatCard
                label="Disetujui"
                value={statistics.disetujui}
                icon={CheckCircle2}
                color="theme-success"
              />
              <StatCard
                label="Ditolak"
                value={statistics.ditolak}
                icon={XCircle}
                color="theme-danger"
              />
            </div>

            {/* KATEGORI PEMOHON */}
            <section className="rounded-2xl border theme-border theme-card p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 theme-text-primary" />
                <h2 className="text-sm font-bold theme-text">
                  Kategori Pemohon
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {[
                  { label: "Guru", value: kategoriStatistics.guru },
                  { label: "Siswa", value: kategoriStatistics.siswa },
                  
                  {
                    label: "Pegawai/Lainnya",
                    value: kategoriStatistics.lainnya,
                  },
                  {
                    label: "Belum Teridentifikasi",
                    value: kategoriStatistics.tidakDiketahui,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border theme-border theme-card-soft p-3"
                  >
                    <p className="text-xs theme-text-muted">{item.label}</p>
                    <p className="mt-1 text-xl font-bold theme-text">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {kategoriStatistics.tidakDiketahui > 0 && (
                <p className="mt-3 text-xs leading-5 theme-text-muted">
                  Jenis pengguna yang belum teridentifikasi tetap ditampilkan.
                  Pastikan response API menyertakan relasi peran dan jabatan
                  pengguna.
                </p>
              )}
            </section>

            {/* DAFTAR DAN DETAIL */}
            <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              {/* KOLOM KIRI: TABEL */}
              <section className="min-w-0 overflow-hidden rounded-2xl border theme-border theme-card shadow-sm">
                <div className="space-y-3 border-b theme-border theme-card-soft p-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 theme-text-placeholder" />

                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Cari nama, NIP/NISN, jabatan, atau alasan..."
                      className="h-10 w-full rounded-xl border theme-border theme-input pl-10 pr-4 text-sm theme-text outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="relative">
                      <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 theme-text-placeholder" />

                      <select
                        value={kategoriFilter}
                        onChange={(event) =>
                          setKategoriFilter(event.target.value)
                        }
                        className="h-10 w-full appearance-none rounded-xl border theme-border theme-input pl-10 pr-3 text-sm theme-text-secondary"
                      >
                        <option value="semua">Semua Pemohon</option>
                        <option value="guru">Guru</option>
                        <option value="siswa">Siswa</option>
                        <option value="orang_tua">Orang Tua</option>
                        <option value="lainnya">Pegawai/Lainnya</option>
                        <option value="tidak_diketahui">
                          Belum Teridentifikasi
                        </option>
                      </select>
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="h-10 w-full rounded-xl border theme-border theme-input px-3 text-sm theme-text-secondary"
                    >
                      <option value="semua">Semua Status</option>
                      <option value="menunggu">Menunggu</option>
                      <option value="disetujui">Disetujui</option>
                      <option value="ditolak">Ditolak</option>
                    </select>

                    <select
                      value={jenisFilter}
                      onChange={(event) => setJenisFilter(event.target.value)}
                      className="h-10 w-full rounded-xl border theme-border theme-input px-3 text-sm theme-text-secondary"
                    >
                      <option value="semua">Semua Jenis</option>
                      <option value="sakit">Sakit</option>
                      <option value="izin">Izin</option>
                      <option value="cuti">Cuti</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="border-b theme-border theme-table-header">
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                          Pemohon
                        </th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                          Jenis Izin
                        </th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                          Periode
                        </th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                          Status
                        </th>
                        <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border-soft)]">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-16 text-center">
                            <Loader2 className="mx-auto h-7 w-7 animate-spin theme-text-primary" />
                            <p className="mt-3 text-sm theme-text-muted">
                              Memuat data pengajuan...
                            </p>
                          </td>
                        </tr>
                      ) : filteredData.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-16 text-center">
                            <FileText className="mx-auto h-8 w-8 theme-text-placeholder" />
                            <p className="mt-3 text-sm font-semibold theme-text-secondary">
                              Tidak ada data
                            </p>
                            <p className="mt-1 text-xs theme-text-muted">
                              Tidak ada permohonan yang sesuai dengan filter.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((item) => {
                          const selected =
                            String(item.id) === String(selectedId);
                          const statusStyle = getStatusStyle(item.status);

                          return (
                            <tr
                              key={item.id}
                              onClick={() => handleSelectData(item)}
                              className={`cursor-pointer transition ${
                                selected
                                  ? "bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]"
                                  : "hover:theme-table-hover"
                              }`}
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl theme-primary text-xs font-bold text-white">
                                    {getInitials(item.nama)}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold theme-text">
                                      {item.nama}
                                    </p>
                                    <p className="mt-0.5 text-xs theme-text-muted">
                                      {item.identitas}
                                    </p>
                                    <span className="mt-1 inline-flex rounded-full border theme-border theme-card-soft px-2 py-0.5 text-[10px] font-semibold theme-text-secondary">
                                      {getLabelKategori(item.kategori)}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getJenisStyle(item.jenis)}`}
                                >
                                  {getJenisLabel(item.jenis)}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <p className="text-sm font-medium theme-text-secondary">
                                  {formatTanggalSingkat(item.tanggalMulai)}
                                </p>
                                <p className="mt-0.5 text-xs theme-text-muted">
                                  s/d {formatTanggalSingkat(item.tanggalSelesai)}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle.badge}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                                  />
                                  {getStatusLabel(item.status)}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleSelectData(item);
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold theme-text-primary hover:theme-primary hover:text-white"
                                >
                                  Detail
                                  <ArrowLeft className="h-4 w-4 rotate-180" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {!loading && filteredData.length > 0 && (
                  <div className="border-t theme-border theme-card-soft px-5 py-3">
                    <p className="text-xs theme-text-muted">
                      Menampilkan{" "}
                      <strong className="theme-text-primary">
                        {filteredData.length}
                      </strong>{" "}
                      dari{" "}
                      <strong className="theme-text-secondary">
                        {data.length}
                      </strong>{" "}
                      pengajuan.
                    </p>
                  </div>
                )}
              </section>

              {/* KOLOM KANAN: DETAIL (STICKY) */}
              <section className="min-w-0 xl:sticky xl:top-6">
                <div className="max-h-[calc(100vh-3rem)] overflow-hidden rounded-2xl border theme-border theme-card shadow-sm">
                  <div className="max-h-[calc(100vh-3rem)] overflow-y-auto">
                    {!selectedData ? (
                      <div className="flex min-h-[500px] flex-col items-center justify-center px-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl theme-card-soft theme-text-primary">
                          <FileText className="h-7 w-7" />
                        </div>
                        <h3 className="mt-5 text-base font-bold theme-text">
                          Pilih pengajuan
                        </h3>
                        <p className="mt-1.5 max-w-xs text-sm leading-6 theme-text-muted">
                          Pilih data pada tabel untuk melihat detail dan melakukan
                          verifikasi.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="border-b theme-border theme-card-soft p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl theme-primary text-sm font-bold text-white">
                                {getInitials(selectedData.nama)}
                              </div>

                              <div className="min-w-0">
                                <h2 className="break-words text-base font-bold theme-text">
                                  {selectedData.nama}
                                </h2>
                                <p className="mt-0.5 text-xs theme-text-muted">
                                  Identitas: {selectedData.identitas}
                                </p>
                                <span className="mt-1 inline-flex rounded-full border theme-border theme-card px-2 py-0.5 text-[10px] font-semibold theme-text-secondary">
                                  {getLabelKategori(selectedData.kategori)}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(selectedData.status).badge}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${getStatusStyle(selectedData.status).dot}`}
                              />
                              {getStatusLabel(selectedData.status)}
                            </span>
                          </div>

                          {selectedData.jabatan && (
                            <div className="mt-4">
                              <span className="inline-flex rounded-lg border theme-border theme-card px-2.5 py-1 text-xs theme-text-secondary">
                                Jabatan/Peran: {selectedData.jabatan}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-5 p-5">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border theme-border theme-card-soft p-3.5">
                              <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-placeholder">
                                Jenis Izin
                              </p>
                              <span
                                className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getJenisStyle(selectedData.jenis)}`}
                              >
                                {getJenisLabel(selectedData.jenis)}
                              </span>
                            </div>

                            <div className="rounded-xl border theme-border theme-card-soft p-3.5">
                              <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-placeholder">
                                Durasi
                              </p>
                              <p className="mt-2 text-sm font-bold theme-text">
                                {hitungDurasi(
                                  selectedData.tanggalMulai,
                                  selectedData.tanggalSelesai
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-xl border theme-border theme-card p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 theme-text-primary" />
                              <p className="text-sm font-bold theme-text">
                                Periode Izin
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-placeholder">
                                  Mulai
                                </p>
                                <p className="mt-1 text-sm font-semibold theme-text">
                                  {formatTanggal(selectedData.tanggalMulai)}
                                </p>
                              </div>

                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-placeholder">
                                  Selesai
                                </p>
                                <p className="mt-1 text-sm font-semibold theme-text">
                                  {formatTanggal(selectedData.tanggalSelesai)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="mb-2 text-sm font-bold theme-text">
                              Alasan
                            </p>
                            <div className="rounded-xl border theme-border theme-card-soft p-4">
                              <p className="whitespace-pre-wrap break-words text-sm leading-6 theme-text-secondary">
                                {selectedData.alasan}
                              </p>
                            </div>
                          </div>

                          {selectedData.urlBukti && (
                            <div>
                              <p className="mb-2 text-sm font-bold theme-text">
                                Bukti Izin
                              </p>
                              <a
                                href={getUploadUrl(selectedData.urlBukti)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-3 rounded-xl border theme-border theme-card p-3 transition hover:border-[var(--color-primary)]"
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-primary text-white">
                                    <FileText className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold theme-text">
                                      Lihat bukti izin
                                    </p>
                                    <p className="text-xs theme-text-muted">
                                      Buka dokumen atau lampiran
                                    </p>
                                  </div>
                                </div>
                                <ExternalLink className="h-4 w-4 shrink-0 theme-text-placeholder" />
                              </a>
                            </div>
                          )}

                          {/* GURU PENGGANTI */}
                          {(selectedData.kategori === "guru" ||
                            selectedData.guruPenggantiId) && (
                            <div>
                              <p className="mb-2 flex items-center gap-2 text-sm font-bold theme-text">
                                <UserCheck className="h-4 w-4 theme-text-primary" />
                                Guru Pengganti
                              </p>

                              {selectedData.guruPenggantiNama ? (
                                <div className="rounded-xl border theme-info p-4">
                                  <p className="text-sm font-bold">
                                    {selectedData.guruPenggantiNama}
                                  </p>
                                  <p className="mt-1 text-xs opacity-80">
                                    {selectedData.guruPenggantiNip
                                      ? `NIP: ${selectedData.guruPenggantiNip}`
                                      : "NIP belum tersedia"}
                                    {selectedData.guruPenggantiJabatan
                                      ? ` · ${selectedData.guruPenggantiJabatan}`
                                      : ""}
                                  </p>
                                </div>
                              ) : isMenunggu(selectedData.status) ? (
                                <div className="rounded-xl border border-dashed theme-border-soft p-3 text-xs theme-text-muted">
                                  Belum ditentukan. Pilih guru pengganti saat
                                  menyetujui.
                                </div>
                              ) : (
                                <div className="rounded-xl border border-dashed theme-border-soft p-3 text-xs theme-text-muted">
                                  Tidak ada guru pengganti yang ditugaskan.
                                </div>
                              )}
                            </div>
                          )}

                          {selectedData.catatan && (
                            <div>
                              <p className="mb-2 text-sm font-bold theme-text">
                                Catatan Verifikasi
                              </p>
                              <div className="rounded-xl border theme-warning p-4">
                                <p className="whitespace-pre-wrap break-words text-sm leading-6">
                                  {selectedData.catatan}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="space-y-2.5 border-t theme-border pt-4">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-xs font-medium uppercase tracking-wider theme-text-placeholder">
                                Diajukan
                              </span>
                              <span className="text-right text-xs font-semibold theme-text-secondary">
                                {formatTanggalWaktu(selectedData.dibuatPada)}
                              </span>
                            </div>

                            {selectedData.penyetujuNama && (
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs font-medium uppercase tracking-wider theme-text-placeholder">
                                  Diproses oleh
                                </span>
                                <span className="text-right text-xs font-semibold theme-text-secondary">
                                  {selectedData.penyetujuNama}
                                </span>
                              </div>
                            )}
                          </div>

                          {isMenunggu(selectedData.status) && (
                            <div className="grid grid-cols-2 gap-3 border-t theme-border pt-5">
                              <button
                                type="button"
                                onClick={openRejectModal}
                                disabled={processingId != null}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border theme-danger px-4 text-sm font-bold transition hover:opacity-80 disabled:opacity-50"
                              >
                                <XCircle className="h-4 w-4" />
                                Tolak
                              </button>

                              <button
                                type="button"
                                onClick={openApproveModal}
                                disabled={processingId != null}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl theme-primary px-4 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Setujui
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL PERSETUJUAN */}
      {showApproveModal && selectedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-md overflow-hidden rounded-2xl theme-card shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b theme-border theme-card-soft px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl theme-success">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-base font-bold theme-text">
                    Setujui Permohonan
                  </h3>
                  <p className="mt-0.5 text-xs theme-text-muted">
                    Periksa informasi sebelum menyetujui.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                disabled={processingId != null}
                aria-label="Tutup modal persetujuan"
                className="rounded-lg p-1.5 theme-text-placeholder disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl border theme-border theme-card-soft p-4">
                <p className="text-sm font-bold theme-text">
                  {selectedData.nama}
                </p>
                <p className="mt-1 text-xs theme-text-muted">
                  {getLabelKategori(selectedData.kategori)} · Identitas:{" "}
                  {selectedData.identitas}
                </p>
                <p className="mt-3 border-t theme-border pt-3 text-sm theme-text-secondary">
                  Periode: {formatTanggalSingkat(selectedData.tanggalMulai)} -{" "}
                  {formatTanggalSingkat(selectedData.tanggalSelesai)}
                </p>
              </div>

              {/* DROPDOWN GURU PENGGANTI — hanya untuk pemohon guru */}
              {selectedData.kategori === "guru" && (
                <div>
                  <label className="mb-2 block text-sm font-bold theme-text">
                    Guru Pengganti{" "}
                    <span className="font-normal theme-text-muted">
                      (opsional)
                    </span>
                  </label>

                  <select
                    value={approveGuruPenggantiId}
                    onChange={(event) =>
                      setApproveGuruPenggantiId(event.target.value)
                    }
                    disabled={loadingGuru || processingId != null}
                    className="h-11 w-full rounded-xl border theme-border theme-input px-3 text-sm theme-text-secondary disabled:opacity-60"
                  >
                    <option value="">
                      {loadingGuru
                        ? "Memuat daftar guru..."
                        : "Tanpa guru pengganti"}
                    </option>

                    {guruList
                      .filter(
                        (guru) =>
                          String(guru.id) !==
                          String(selectedData.penggunaId)
                      )
                      .map((guru) => (
                        <option key={guru.id} value={guru.id}>
                          {guru.nama}
                          {guru.nip ? ` — ${guru.nip}` : ""}
                        </option>
                      ))}
                  </select>

                  <p className="mt-1.5 text-xs leading-5 theme-text-muted">
                    Guru pengganti akan ditugaskan untuk menggantikan guru yang
                    mengajukan izin selama periode izin.
                  </p>
                </div>
              )}

              <div className="flex gap-3 rounded-xl border theme-info p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="text-xs leading-5">
                  Permohonan akan disetujui sesuai API backend. Jika backend
                  belum mendukung penyimpanan guru pengganti, penugasan akan
                  diabaikan dan pesan error akan ditampilkan.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t theme-border theme-card-soft px-5 py-4">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                disabled={processingId != null}
                className="h-10 rounded-xl border theme-border theme-card px-4 text-sm font-semibold theme-text-secondary disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={processingId != null}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl theme-primary px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processingId != null ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Setujui Permohonan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENOLAKAN */}
      {showRejectModal && selectedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-md overflow-hidden rounded-2xl theme-card shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b theme-border theme-card-soft px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl theme-danger">
                  <XCircle className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-base font-bold theme-text">
                    Tolak Permohonan
                  </h3>
                  <p className="mt-0.5 text-xs theme-text-muted">
                    Tambahkan catatan penolakan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                disabled={processingId != null}
                aria-label="Tutup modal penolakan"
                className="rounded-lg p-1.5 theme-text-placeholder disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl border theme-danger p-4">
                <p className="text-sm font-bold">{selectedData.nama}</p>
                <p className="mt-1 text-xs opacity-80">
                  Permohonan ini akan ditolak.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold theme-text">
                  Catatan Penolakan
                </label>
                <textarea
                  value={rejectCatatan}
                  onChange={(event) => setRejectCatatan(event.target.value)}
                  rows={4}
                  placeholder="Masukkan catatan penolakan..."
                  disabled={processingId != null}
                  className="w-full resize-y rounded-xl border theme-border theme-input px-3 py-2.5 text-sm theme-text-secondary outline-none focus:border-[var(--color-danger)] disabled:opacity-60"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t theme-border theme-card-soft px-5 py-4">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                disabled={processingId != null}
                className="h-10 rounded-xl border theme-border theme-card px-4 text-sm font-semibold theme-text-secondary disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={processingId != null}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl theme-danger px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processingId != null ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Tolak Permohonan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}