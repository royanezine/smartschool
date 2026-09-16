"use client";

import { useMemo, useRef, useState } from "react";
import {
  Search,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  GraduationCap,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import {
  verifikasiPpdb,
  uploadBerkasPpdb,
} from "../../../services/ppdb.service";

// =========================================================
// DATA SEMENTARA UNTUK UI
// =========================================================
// BE saat ini belum menyediakan GET daftar pendaftar.
// Karena itu data list tetap dari data yang sudah ada.
// Aksi verifikasi & upload sudah terhubung ke BE.
// =========================================================

const initialPendaftar = [
  {
    id: "demo-1",
    nomorPendaftaran: "PPDB-2026-0001",
    namaLengkap: "Ahmad Fauzan",
    nisn: "0087654321",
    asalSekolah: "SMP Negeri 1 Tasikmalaya",
    jalur: "Jalur Reguler",
    tanggalDaftar: "2026-08-20",
    status: "menunggu",
    tempatLahir: "Tasikmalaya",
    tanggalLahir: "2010-05-12",
    jenisKelamin: "L",
    alamat: "Jl. Merdeka No. 10, Tasikmalaya",
    telepon: "081234567890",
    email: "ahmad@example.com",
    namaAyah: "Budi Fauzan",
    namaIbu: "Siti Aminah",
    nilaiRapor: 88.5,
    kelasId: "",
    berkas: {
      KK: null,
      AKTE: null,
      IJAZAH: null,
    },
  },
  {
    id: "demo-2",
    nomorPendaftaran: "PPDB-2026-0002",
    namaLengkap: "Siti Aulia",
    nisn: "0087654322",
    asalSekolah: "SMP Negeri 2 Tasikmalaya",
    jalur: "Jalur Prestasi",
    tanggalDaftar: "2026-08-21",
    status: "menunggu",
    tempatLahir: "Tasikmalaya",
    tanggalLahir: "2010-03-21",
    jenisKelamin: "P",
    alamat: "Jl. HZ Mustofa No. 20, Tasikmalaya",
    telepon: "081298765432",
    email: "sitiaulia@example.com",
    namaAyah: "Andi",
    namaIbu: "Rina",
    nilaiRapor: 92.3,
    kelasId: "",
    berkas: {
      KK: null,
      AKTE: null,
      IJAZAH: null,
    },
  },
  {
    id: "demo-3",
    nomorPendaftaran: "PPDB-2026-0003",
    namaLengkap: "Rizky Ramadhan",
    nisn: "0087654323",
    asalSekolah: "SMP Negeri 3 Tasikmalaya",
    jalur: "Jalur Afirmasi",
    tanggalDaftar: "2026-08-22",
    status: "lulus",
    tempatLahir: "Garut",
    tanggalLahir: "2010-01-10",
    jenisKelamin: "L",
    alamat: "Jl. Cihideung No. 15",
    telepon: "081377889900",
    email: "rizky@example.com",
    namaAyah: "Dedi",
    namaIbu: "Yuni",
    nilaiRapor: 86.7,
    kelasId: "kelas-demo",
    berkas: {
      KK: null,
      AKTE: null,
      IJAZAH: null,
    },
  },
  {
    id: "demo-4",
    nomorPendaftaran: "PPDB-2026-0004",
    namaLengkap: "Nabila Putri",
    nisn: "0087654324",
    asalSekolah: "SMP Negeri 4 Tasikmalaya",
    jalur: "Jalur Mutasi",
    tanggalDaftar: "2026-08-23",
    status: "ditolak",
    tempatLahir: "Bandung",
    tanggalLahir: "2010-06-17",
    jenisKelamin: "P",
    alamat: "Jl. Siliwangi No. 8",
    telepon: "081234567899",
    email: "nabila@example.com",
    namaAyah: "Agus",
    namaIbu: "Dewi",
    nilaiRapor: 78.4,
    kelasId: "",
    berkas: {
      KK: null,
      AKTE: null,
      IJAZAH: null,
    },
  },
];

const STATUS_FILTERS = [
  {
    key: "semua",
    label: "Semua",
  },
  {
    key: "menunggu",
    label: "Menunggu",
  },
  {
    key: "lulus",
    label: "Lulus",
  },
  {
    key: "ditolak",
    label: "Ditolak",
  },
];

const STATUS_STYLES = {
  menunggu:
    "bg-amber-50 text-amber-600 border-amber-100",
  lulus:
    "bg-emerald-50 text-emerald-600 border-emerald-100",
  ditolak:
    "bg-rose-50 text-rose-600 border-rose-100",
};

const STATUS_LABELS = {
  menunggu: "Menunggu",
  lulus: "Lulus",
  ditolak: "Ditolak",
};

const BERKAS_LIST = [
  {
    key: "KK",
    label: "Kartu Keluarga",
  },
  {
    key: "AKTE",
    label: "Akta Kelahiran",
  },
  {
    key: "IJAZAH",
    label: "Ijazah / SKL",
  },
];

// =========================================================
// HELPERS
// =========================================================

function formatTanggal(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return "-";
  }
}

function formatTanggalPanjang(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  } catch {
    return "-";
  }
}

function formatJenisKelamin(value) {
  if (value === "L") return "Laki-laki";
  if (value === "P") return "Perempuan";

  if (
    String(value).toLowerCase() ===
    "laki-laki"
  ) {
    return "Laki-laki";
  }

  if (
    String(value).toLowerCase() ===
    "perempuan"
  ) {
    return "Perempuan";
  }

  return value || "-";
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase();
}

// =========================================================
// PAGE
// =========================================================

export default function PendaftarPPDBPage() {
  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [pendaftarList, setPendaftarList] =
    useState(initialPendaftar);

  const [activeStatus, setActiveStatus] =
    useState("semua");

  const [search, setSearch] = useState("");

  const [selectedPendaftar, setSelectedPendaftar] =
    useState(null);

  const [showDetail, setShowDetail] =
    useState(false);

  const [showLulusModal, setShowLulusModal] =
    useState(false);

  const [showUploadModal, setShowUploadModal] =
    useState(false);

  const [selectedBerkas, setSelectedBerkas] =
    useState(null);

  const [kelasId, setKelasId] = useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [actionError, setActionError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const fileInputRef = useRef(null);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredPendaftar = useMemo(() => {
    const keyword = search
      .toLowerCase()
      .trim();

    return pendaftarList.filter((item) => {
      const matchStatus =
        activeStatus === "semua" ||
        item.status === activeStatus;

      const matchSearch =
        !keyword ||
        item.namaLengkap
          ?.toLowerCase()
          .includes(keyword) ||
        item.nisn
          ?.toLowerCase()
          .includes(keyword) ||
        item.nomorPendaftaran
          ?.toLowerCase()
          .includes(keyword) ||
        item.asalSekolah
          ?.toLowerCase()
          .includes(keyword);

      return matchStatus && matchSearch;
    });
  }, [
    pendaftarList,
    activeStatus,
    search,
  ]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalPendaftar =
    pendaftarList.length;

  const totalMenunggu =
    pendaftarList.filter(
      (item) => item.status === "menunggu"
    ).length;

  const totalLulus =
    pendaftarList.filter(
      (item) => item.status === "lulus"
    ).length;

  const totalDitolak =
    pendaftarList.filter(
      (item) => item.status === "ditolak"
    ).length;

  // =========================================================
  // SIDEBAR
  // =========================================================

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  // =========================================================
  // DETAIL
  // =========================================================

  const openDetail = (pendaftar) => {
    setSelectedPendaftar(pendaftar);
    setActionError("");
    setSuccessMessage("");
    setShowDetail(true);
  };

  const closeDetail = () => {
    if (actionLoading) return;

    setShowDetail(false);
    setSelectedPendaftar(null);
    setActionError("");
  };

  // =========================================================
  // OPEN LULUS
  // =========================================================

  const openLulusModal = (pendaftar) => {
    setSelectedPendaftar(pendaftar);
    setKelasId(
      pendaftar?.kelasId || ""
    );
    setActionError("");
    setSuccessMessage("");
    setShowLulusModal(true);
  };

  const closeLulusModal = () => {
    if (actionLoading) return;

    setShowLulusModal(false);
    setKelasId("");
    setActionError("");
  };

  // =========================================================
  // VERIFIKASI LULUS
  // =========================================================

  const handleLulus = async () => {
    if (!selectedPendaftar?.id) {
      setActionError(
        "ID pendaftar tidak ditemukan."
      );
      return;
    }

    if (!kelasId.trim()) {
      setActionError(
        "Kelas wajib dipilih untuk pendaftar yang lulus."
      );
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      setSuccessMessage("");

      const response =
        await verifikasiPpdb(
          selectedPendaftar.id,
          {
            status: "lulus",
            kelasId: kelasId.trim(),
          }
        );

      console.log(
        "Response verifikasi lulus:",
        response
      );

      setPendaftarList((prev) =>
        prev.map((item) =>
          item.id === selectedPendaftar.id
            ? {
                ...item,
                status: "lulus",
                kelasId: kelasId.trim(),
              }
            : item
        )
      );

      setSelectedPendaftar((prev) =>
        prev
          ? {
              ...prev,
              status: "lulus",
              kelasId: kelasId.trim(),
            }
          : prev
      );

      setSuccessMessage(
        response?.message ||
          "Pendaftar berhasil dinyatakan lulus."
      );

      setShowLulusModal(false);
      setKelasId("");
    } catch (error) {
      console.error(
        "Gagal verifikasi lulus:",
        error
      );

      setActionError(
        error?.message ||
          "Gagal memproses kelulusan."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // VERIFIKASI DITOLAK
  // =========================================================

  const handleTolak = async (pendaftar) => {
    if (!pendaftar?.id) {
      alert("ID pendaftar tidak ditemukan.");
      return;
    }

    const yakin = window.confirm(
      `Yakin ingin menolak pendaftaran ${pendaftar.namaLengkap}?`
    );

    if (!yakin) return;

    try {
      setActionLoading(true);
      setActionError("");
      setSuccessMessage("");

      const response =
        await verifikasiPpdb(
          pendaftar.id,
          {
            status: "ditolak",
          }
        );

      console.log(
        "Response verifikasi ditolak:",
        response
      );

      setPendaftarList((prev) =>
        prev.map((item) =>
          item.id === pendaftar.id
            ? {
                ...item,
                status: "ditolak",
              }
            : item
        )
      );

      setSelectedPendaftar((prev) =>
        prev?.id === pendaftar.id
          ? {
              ...prev,
              status: "ditolak",
            }
          : prev
      );

      setSuccessMessage(
        response?.message ||
          "Pendaftaran berhasil ditolak."
      );
    } catch (error) {
      console.error(
        "Gagal menolak pendaftar:",
        error
      );

      setActionError(
        error?.message ||
          "Gagal menolak pendaftaran."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // UPLOAD BERKAS
  // =========================================================

  const openUploadModal = (
    pendaftar,
    berkas
  ) => {
    setSelectedPendaftar(pendaftar);
    setSelectedBerkas(berkas);
    setActionError("");
    setSuccessMessage("");
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    if (actionLoading) return;

    setShowUploadModal(false);
    setSelectedBerkas(null);
    setActionError("");
  };

  const handleFileChange = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      !selectedPendaftar?.id ||
      !selectedBerkas
    ) {
      setActionError(
        "Data upload tidak lengkap."
      );
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      setSuccessMessage("");

      const response =
        await uploadBerkasPpdb(
          selectedPendaftar.id,
          file,
          selectedBerkas.key
        );

      console.log(
        "Response upload berkas:",
        response
      );

      setPendaftarList((prev) =>
        prev.map((item) => {
          if (
            item.id !==
            selectedPendaftar.id
          ) {
            return item;
          }

          return {
            ...item,
            berkas: {
              ...(item.berkas || {}),
              [selectedBerkas.key]:
                response?.data || {
                  namaBerkas:
                    selectedBerkas.key,
                  namaFile: file.name,
                  status: "menunggu",
                },
            },
          };
        })
      );

      setSelectedPendaftar((prev) =>
        prev
          ? {
              ...prev,
              berkas: {
                ...(prev.berkas || {}),
                [selectedBerkas.key]:
                  response?.data || {
                    namaBerkas:
                      selectedBerkas.key,
                    namaFile: file.name,
                    status: "menunggu",
                  },
              },
            }
          : prev
      );

      setSuccessMessage(
        response?.message ||
          `${selectedBerkas.label} berhasil diupload.`
      );

      setShowUploadModal(false);
      setSelectedBerkas(null);
    } catch (error) {
      console.error(
        "Gagal upload berkas:",
        error
      );

      setActionError(
        error?.message ||
          "Gagal mengupload berkas."
      );
    } finally {
      setActionLoading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // =========================================================
  // REFRESH UI
  // =========================================================
  // Belum melakukan GET karena BE belum menyediakan endpoint
  // list pendaftar.
  // =========================================================

  const handleRefresh = () => {
    setActionError("");
    setSuccessMessage(
      "Data tampilan diperbarui."
    );

    setTimeout(() => {
      setSuccessMessage("");
    }, 2500);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="flex h-screen w-full bg-[#EEF0F2] overflow-hidden">
      <Sidebar
        role="adminPPDB"
        active="pendaftar"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin PPDB",
            email:
              "adminppdb@smartschool.com",
            avatar: "PP",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-4 md:p-6 lg:p-8">
            <div className="w-full max-w-[1320px] mx-auto space-y-5">

              {/* ================================================= */}
              {/* BREADCRUMB */}
              {/* ================================================= */}

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>PPDB</span>

                <ChevronRight size={12} />

                <span className="text-slate-600 font-medium">
                  Pendaftar
                </span>
              </div>

              {/* ================================================= */}
              {/* SUCCESS */}
              {/* ================================================= */}

              {successMessage && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl px-4 py-3 text-sm">
                  <CheckCircle2
                    size={17}
                  />

                  <span>
                    {successMessage}
                  </span>

                  <button
                    onClick={() =>
                      setSuccessMessage("")
                    }
                    className="ml-auto"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* ================================================= */}
              {/* ERROR */}
              {/* ================================================= */}

              {actionError && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle
                    size={17}
                  />

                  <span>
                    {actionError}
                  </span>

                  <button
                    onClick={() =>
                      setActionError("")
                    }
                    className="ml-auto"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* ================================================= */}
              {/* SUMMARY */}
              {/* ================================================= */}

              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">
                    Total Pendaftar
                  </p>

                  <p className="text-2xl font-bold text-slate-800 mt-2">
                    {totalPendaftar}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">
                    Menunggu Verifikasi
                  </p>

                  <p className="text-2xl font-bold text-amber-500 mt-2">
                    {totalMenunggu}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">
                    Lulus
                  </p>

                  <p className="text-2xl font-bold text-emerald-500 mt-2">
                    {totalLulus}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">
                    Ditolak
                  </p>

                  <p className="text-2xl font-bold text-rose-500 mt-2">
                    {totalDitolak}
                  </p>
                </div>

              </section>

              {/* ================================================= */}
              {/* MAIN PANEL */}
              {/* ================================================= */}

              <section className="bg-white rounded-xl overflow-hidden">

                {/* HEADER */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-4 border-b border-slate-100">

                  <div className="flex items-center gap-5 overflow-x-auto">

                    {STATUS_FILTERS.map(
                      (filter) => (
                        <button
                          key={filter.key}
                          onClick={() =>
                            setActiveStatus(
                              filter.key
                            )
                          }
                          className={`relative pb-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                            activeStatus ===
                            filter.key
                              ? "text-blue-600"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          {filter.label}

                          {activeStatus ===
                            filter.key && (
                            <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-blue-600 rounded-full" />
                          )}
                        </button>
                      )
                    )}

                  </div>

                  <div className="flex items-center gap-2">

                    <div className="flex items-center gap-2 text-xs text-slate-500 border border-slate-200 rounded-md px-3 py-2">

                      <Search
                        size={14}
                        className="text-slate-400"
                      />

                      <input
                        value={search}
                        onChange={(e) =>
                          setSearch(
                            e.target.value
                          )
                        }
                        placeholder="Cari pendaftar..."
                        className="outline-none bg-transparent placeholder:text-slate-400 w-44"
                      />
                    </div>

                    <button
                      onClick={handleRefresh}
                      className="flex items-center justify-center border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-md w-9 h-9 transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw
                        size={15}
                      />
                    </button>

                  </div>
                </div>

                {/* ================================================= */}
                {/* TABLE */}
                {/* ================================================= */}

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[1050px]">

                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">

                        <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                          Pendaftar
                        </th>

                        <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                          NISN
                        </th>

                        <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                          Asal Sekolah
                        </th>

                        <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                          Jalur
                        </th>

                        <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                          Tanggal
                        </th>

                        <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                          Status
                        </th>

                        <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                          Aksi
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {filteredPendaftar.length ===
                        0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center py-14 text-sm text-slate-400"
                          >
                            Tidak ada pendaftar
                            ditemukan.
                          </td>
                        </tr>
                      )}

                      {filteredPendaftar.map(
                        (pendaftar) => (
                          <tr
                            key={
                              pendaftar.id
                            }
                            className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                          >

                            {/* Pendaftar */}
                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">

                                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                  {getInitials(
                                    pendaftar.namaLengkap
                                  )}
                                </div>

                                <div className="min-w-0">

                                  <p className="text-sm font-semibold text-slate-700 truncate">
                                    {
                                      pendaftar.namaLengkap
                                    }
                                  </p>

                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    {
                                      pendaftar.nomorPendaftaran
                                    }
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* NISN */}
                            <td className="px-4 py-4">
                              <span className="text-xs text-slate-600 font-mono">
                                {
                                  pendaftar.nisn
                                }
                              </span>
                            </td>

                            {/* Sekolah */}
                            <td className="px-4 py-4">
                              <span className="text-xs text-slate-600">
                                {
                                  pendaftar.asalSekolah ||
                                  "-"
                                }
                              </span>
                            </td>

                            {/* Jalur */}
                            <td className="px-4 py-4">
                              <span className="text-xs text-slate-600">
                                {
                                  pendaftar.jalur ||
                                  "-"
                                }
                              </span>
                            </td>

                            {/* Tanggal */}
                            <td className="px-4 py-4">
                              <span className="text-xs text-slate-500">
                                {formatTanggal(
                                  pendaftar.tanggalDaftar
                                )}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-4">

                              <span
                                className={`inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                                  STATUS_STYLES[
                                    pendaftar.status
                                  ] ||
                                  "bg-slate-50 text-slate-500 border-slate-100"
                                }`}
                              >
                                {
                                  STATUS_LABELS[
                                    pendaftar.status
                                  ] ||
                                  pendaftar.status
                                }
                              </span>

                            </td>

                            {/* Aksi */}
                            <td className="px-5 py-4">

                              <div className="flex items-center justify-end gap-1.5">

                                <button
                                  onClick={() =>
                                    openDetail(
                                      pendaftar
                                    )
                                  }
                                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-md transition-colors"
                                >
                                  <Eye
                                    size={14}
                                  />
                                  Detail
                                </button>

                                {pendaftar.status ===
                                  "menunggu" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        openLulusModal(
                                          pendaftar
                                        )
                                      }
                                      disabled={
                                        actionLoading
                                      }
                                      className="flex items-center gap-1.5 text-xs text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-md transition-colors disabled:opacity-50"
                                    >
                                      <CheckCircle2
                                        size={14}
                                      />
                                      Lulus
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleTolak(
                                          pendaftar
                                        )
                                      }
                                      disabled={
                                        actionLoading
                                      }
                                      className="flex items-center gap-1.5 text-xs text-rose-500 hover:bg-rose-50 px-2.5 py-1.5 rounded-md transition-colors disabled:opacity-50"
                                    >
                                      <XCircle
                                        size={14}
                                      />
                                      Tolak
                                    </button>
                                  </>
                                )}

                              </div>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </section>

            </div>
          </div>
        </main>
      </div>

      {/* ===================================================== */}
      {/* DETAIL MODAL */}
      {/* ===================================================== */}

      {showDetail &&
        selectedPendaftar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
              onClick={closeDetail}
            />

            <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-xl overflow-hidden">

              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">

                <div>
                  <h3 className="text-base font-semibold text-slate-800">
                    Detail Pendaftar
                  </h3>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {
                      selectedPendaftar.nomorPendaftaran
                    }
                  </p>
                </div>

                <button
                  onClick={closeDetail}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X size={18} />
                </button>

              </div>

              {/* BODY */}
              <div className="overflow-y-auto max-h-[calc(90vh-130px)] p-6 space-y-6">

                {/* PROFILE */}
                <div className="flex items-center gap-4">

                  <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    {getInitials(
                      selectedPendaftar.namaLengkap
                    )}
                  </div>

                  <div className="flex-1">

                    <h4 className="text-lg font-semibold text-slate-800">
                      {
                        selectedPendaftar.namaLengkap
                      }
                    </h4>

                    <p className="text-xs text-slate-400 mt-1">
                      NISN{" "}
                      {selectedPendaftar.nisn}
                    </p>

                  </div>

                  <span
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                      STATUS_STYLES[
                        selectedPendaftar.status
                      ]
                    }`}
                  >
                    {
                      STATUS_LABELS[
                        selectedPendaftar.status
                      ]
                    }
                  </span>

                </div>

                {/* DATA PRIBADI */}
                <div>

                  <div className="flex items-center gap-2 mb-3">
                    <User
                      size={15}
                      className="text-blue-600"
                    />

                    <h4 className="text-sm font-semibold text-slate-700">
                      Data Pribadi
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                    <InfoItem
                      label="Tempat, Tanggal Lahir"
                      value={`${selectedPendaftar.tempatLahir || "-"}, ${formatTanggalPanjang(
                        selectedPendaftar.tanggalLahir
                      )}`}
                    />

                    <InfoItem
                      label="Jenis Kelamin"
                      value={formatJenisKelamin(
                        selectedPendaftar.jenisKelamin
                      )}
                    />

                    <InfoItem
                      label="NISN"
                      value={
                        selectedPendaftar.nisn
                      }
                    />

                    <InfoItem
                      label="Tanggal Daftar"
                      value={formatTanggalPanjang(
                        selectedPendaftar.tanggalDaftar
                      )}
                    />

                    <InfoItem
                      label="Asal Sekolah"
                      value={
                        selectedPendaftar.asalSekolah
                      }
                    />

                    <InfoItem
                      label="Jalur PPDB"
                      value={
                        selectedPendaftar.jalur
                      }
                    />

                  </div>

                </div>

                {/* KONTAK */}
                <div>

                  <div className="flex items-center gap-2 mb-3">
                    <Phone
                      size={15}
                      className="text-blue-600"
                    />

                    <h4 className="text-sm font-semibold text-slate-700">
                      Kontak
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                    <InfoItem
                      label="Telepon"
                      value={
                        selectedPendaftar.telepon
                      }
                    />

                    <InfoItem
                      label="Email"
                      value={
                        selectedPendaftar.email
                      }
                    />

                    <InfoItem
                      label="Alamat"
                      value={
                        selectedPendaftar.alamat
                      }
                      full
                    />

                  </div>

                </div>

                {/* ORANG TUA */}
                <div>

                  <div className="flex items-center gap-2 mb-3">
                    <User
                      size={15}
                      className="text-blue-600"
                    />

                    <h4 className="text-sm font-semibold text-slate-700">
                      Data Orang Tua
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                    <InfoItem
                      label="Nama Ayah"
                      value={
                        selectedPendaftar.namaAyah
                      }
                    />

                    <InfoItem
                      label="Nama Ibu"
                      value={
                        selectedPendaftar.namaIbu
                      }
                    />

                  </div>

                </div>

                {/* NILAI */}
                <div>

                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap
                      size={15}
                      className="text-blue-600"
                    />

                    <h4 className="text-sm font-semibold text-slate-700">
                      Data Akademik
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                    <InfoItem
                      label="Nilai Rapor"
                      value={
                        selectedPendaftar.nilaiRapor ??
                        "-"
                      }
                    />

                    <InfoItem
                      label="Kelas"
                      value={
                        selectedPendaftar.kelasId ||
                        "Belum ditentukan"
                      }
                    />

                  </div>

                </div>

                {/* BERKAS */}
                <div>

                  <div className="flex items-center gap-2 mb-3">
                    <FileText
                      size={15}
                      className="text-blue-600"
                    />

                    <h4 className="text-sm font-semibold text-slate-700">
                      Berkas Pendaftaran
                    </h4>
                  </div>

                  <div className="space-y-2">

                    {BERKAS_LIST.map(
                      (berkas) => {
                        const file =
                          selectedPendaftar
                            .berkas?.[
                            berkas.key
                          ];

                        return (
                          <div
                            key={
                              berkas.key
                            }
                            className="flex items-center justify-between gap-3 border border-slate-100 rounded-xl p-3"
                          >

                            <div className="flex items-center gap-3">

                              <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
                                <FileText
                                  size={16}
                                  className="text-slate-400"
                                />
                              </div>

                              <div>

                                <p className="text-xs font-medium text-slate-700">
                                  {
                                    berkas.label
                                  }
                                </p>

                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  {file
                                    ? file.namaFile ||
                                      file.urlFile ||
                                      "Sudah tersedia"
                                    : "Belum diupload"}
                                </p>

                              </div>

                            </div>

                            <div className="flex items-center gap-2">

                              {file && (
                                <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                                  Tersedia
                                </span>
                              )}

                              <button
                                onClick={() =>
                                  openUploadModal(
                                    selectedPendaftar,
                                    berkas
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                                className="flex items-center gap-1.5 text-xs text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-md disabled:opacity-50"
                              >
                                <Upload
                                  size={13}
                                />
                                Upload
                              </button>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

              </div>

              {/* FOOTER */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">

                <button
                  onClick={closeDetail}
                  disabled={actionLoading}
                  className="text-xs text-slate-500 hover:text-slate-700 px-3 py-2"
                >
                  Tutup
                </button>

                {selectedPendaftar.status ===
                  "menunggu" && (
                  <div className="flex items-center gap-2">

                    <button
                      onClick={() =>
                        handleTolak(
                          selectedPendaftar
                        )
                      }
                      disabled={
                        actionLoading
                      }
                      className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-medium px-3.5 py-2 rounded-lg disabled:opacity-50"
                    >
                      <XCircle
                        size={14}
                      />
                      Tolak
                    </button>

                    <button
                      onClick={() =>
                        openLulusModal(
                          selectedPendaftar
                        )
                      }
                      disabled={
                        actionLoading
                      }
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3.5 py-2 rounded-lg disabled:opacity-50"
                    >
                      <CheckCircle2
                        size={14}
                      />
                      Luluskan
                    </button>

                  </div>
                )}

              </div>

            </div>
          </div>
        )}

      {/* ===================================================== */}
      {/* MODAL LULUS */}
      {/* ===================================================== */}

      {showLulusModal &&
        selectedPendaftar && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

            <div
              className="absolute inset-0 bg-slate-900/40"
              onClick={
                actionLoading
                  ? undefined
                  : closeLulusModal
              }
            />

            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl">

              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">

                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Luluskan Pendaftar
                  </h3>

                  <p className="text-[11px] text-slate-400 mt-1">
                    {
                      selectedPendaftar.namaLengkap
                    }
                  </p>
                </div>

                <button
                  onClick={
                    closeLulusModal
                  }
                  disabled={
                    actionLoading
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X size={17} />
                </button>

              </div>

              <div className="p-5">

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Pendaftar yang dinyatakan
                    lulus akan dikonversi oleh
                    BE menjadi akun siswa dan
                    dimasukkan ke kelas yang
                    dipilih.
                  </p>
                </div>

                <label className="block text-xs font-medium text-slate-600 mb-2">
                  ID Kelas
                </label>

                <input
                  value={kelasId}
                  onChange={(e) =>
                    setKelasId(
                      e.target.value
                    )
                  }
                  placeholder="Masukkan ID kelas"
                  disabled={
                    actionLoading
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                />

                {actionError && (
                  <p className="text-xs text-rose-600 mt-2">
                    {actionError}
                  </p>
                )}

              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">

                <button
                  onClick={
                    closeLulusModal
                  }
                  disabled={
                    actionLoading
                  }
                  className="text-xs text-slate-500 px-3 py-2"
                >
                  Batal
                </button>

                <button
                  onClick={handleLulus}
                  disabled={
                    actionLoading
                  }
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4 py-2.5 rounded-lg disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw
                        size={13}
                        className="animate-spin"
                      />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        size={14}
                      />
                      Luluskan
                    </>
                  )}
                </button>

              </div>

            </div>
          </div>
        )}

      {/* ===================================================== */}
      {/* MODAL UPLOAD */}
      {/* ===================================================== */}

      {showUploadModal &&
        selectedPendaftar &&
        selectedBerkas && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

            <div
              className="absolute inset-0 bg-slate-900/40"
              onClick={
                actionLoading
                  ? undefined
                  : closeUploadModal
              }
            />

            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl">

              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">

                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Upload Berkas
                  </h3>

                  <p className="text-[11px] text-slate-400 mt-1">
                    {
                      selectedBerkas.label
                    }
                  </p>
                </div>

                <button
                  onClick={
                    closeUploadModal
                  }
                  disabled={
                    actionLoading
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X size={17} />
                </button>

              </div>

              <div className="p-5">

                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors">

                  <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <Upload
                      size={21}
                    />
                  </div>

                  <p className="text-sm font-medium text-slate-700">
                    Pilih file berkas
                  </p>

                  <p className="text-[11px] text-slate-400 mt-1 mb-4">
                    PDF, JPG, JPEG, atau PNG
                  </p>

                  <input
                    ref={
                      fileInputRef
                    }
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={
                      handleFileChange
                    }
                    disabled={
                      actionLoading
                    }
                    className="hidden"
                    id="ppdb-file-upload"
                  />

                  <label
                    htmlFor="ppdb-file-upload"
                    className={`inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2.5 rounded-lg cursor-pointer ${
                      actionLoading
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }`}
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw
                          size={13}
                          className="animate-spin"
                        />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload
                          size={13}
                        />
                        Pilih File
                      </>
                    )}
                  </label>

                </div>

                {actionError && (
                  <p className="text-xs text-rose-600 mt-3">
                    {actionError}
                  </p>
                )}

              </div>

            </div>
          </div>
        )}
    </div>
  );
}

// =========================================================
// INFO ITEM
// =========================================================

function InfoItem({
  label,
  value,
  full = false,
}) {
  return (
    <div
      className={`bg-slate-50 rounded-lg px-3 py-2.5 ${
        full ? "md:col-span-2" : ""
      }`}
    >
      <p className="text-[10px] text-slate-400 mb-1">
        {label}
      </p>

      <p className="text-xs text-slate-700 break-words">
        {value || "-"}
      </p>
    </div>
  );
}