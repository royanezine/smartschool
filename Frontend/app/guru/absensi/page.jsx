"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import {
  ClipboardCheck,
  Users,
  CheckCircle2,
  Stethoscope,
  FileText,
  XCircle,
  CalendarDays,
  History,
  RefreshCw,
  AlertCircle,
  MapPin,
  ScanLine,
  Camera,
  UserCheck,
  Plus,
  GraduationCap,
  ChevronDown,
} from "lucide-react";

import { getAbsensiKelas } from "../../../services/absensi.service";
import { getKelas } from "../../../services/kelas.service";

const STATUS_CONFIG = {
  hadir: {
    label: "Hadir",
    icon: CheckCircle2,
    badge: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },

  sakit: {
    label: "Sakit",
    icon: Stethoscope,
    badge: "bg-amber-50 text-amber-600 border-amber-200",
  },

  izin: {
    label: "Izin",
    icon: FileText,
    badge: "bg-blue-50 text-blue-600 border-blue-200",
  },

  alpha: {
    label: "Alpha",
    icon: XCircle,
    badge: "bg-rose-50 text-rose-600 border-rose-200",
  },
};

const METODE_CONFIG = {
  lokasi: {
    label: "Lokasi",
    icon: MapPin,
  },

  barcode: {
    label: "Barcode",
    icon: ScanLine,
  },

  face: {
    label: "Face",
    icon: Camera,
  },

  manual: {
    label: "Manual",
    icon: UserCheck,
  },
};

function formatTanggal(tanggal) {
  if (!tanggal) return "-";

  const date = new Date(tanggal);

  if (Number.isNaN(date.getTime())) {
    return String(tanggal);
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatJam(tanggal) {
  if (!tanggal) return "-";

  const date = new Date(tanggal);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Karena response backend bisa berbentuk:
 *
 * {
 *   success: true,
 *   data: [...]
 * }
 *
 * atau:
 *
 * {
 *   success: true,
 *   data: {
 *      data: [...]
 *   }
 * }
 *
 * maka kita buat normalizer supaya frontend aman.
 */
function normalizeKelasResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
}

function normalizeAbsensiResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
}

export default function GuruAbsensiPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  /**
   * DATA KELAS
   */
  const [kelas, setKelas] = useState([]);
  const [kelasId, setKelasId] = useState("");

  /**
   * FILTER TANGGAL
   */
  const [tanggal, setTanggal] = useState("");

  /**
   * DATA ABSENSI
   */
  const [absensi, setAbsensi] = useState([]);

  /**
   * LOADING
   */
  const [loadingKelas, setLoadingKelas] = useState(false);
  const [loadingAbsensi, setLoadingAbsensi] = useState(false);

  /**
   * ERROR
   */
  const [errorKelas, setErrorKelas] = useState("");
  const [errorAbsensi, setErrorAbsensi] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);

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

  /**
   * ============================================================
   * AMBIL DAFTAR KELAS DARI BACKEND
   * GET /api/kelas
   * ============================================================
   */
  const fetchKelas = useCallback(async () => {
    try {
      setLoadingKelas(true);
      setErrorKelas("");

      const response = await getKelas({
        page: 1,
        limit: 100,
        sortBy: "tingkat",
        sortOrder: "asc",
      });

      console.log("========== DATA KELAS ==========");
      console.log("RESPONSE:", response);

      const dataKelas = normalizeKelasResponse(response);

      console.log("KELAS NORMALIZED:", dataKelas);
      console.log("===============================");

      setKelas(dataKelas);

      /**
       * Kalau belum ada kelas yang dipilih,
       * otomatis pilih kelas pertama.
       */
      if (dataKelas.length > 0) {
        setKelasId((currentId) => {
          if (currentId) {
            const masihAda = dataKelas.some(
              (item) => item?.id === currentId,
            );

            if (masihAda) {
              return currentId;
            }
          }

          return dataKelas[0]?.id || "";
        });
      } else {
        setKelasId("");
      }
    } catch (err) {
      console.error("Error fetch kelas:", err);

      setKelas([]);
      setKelasId("");

      setErrorKelas(
        err?.message || "Gagal mengambil data kelas.",
      );
    } finally {
      setLoadingKelas(false);
    }
  }, []);

  /**
   * LOAD KELAS SAAT HALAMAN DIBUKA
   */
  useEffect(() => {
    fetchKelas();
  }, [fetchKelas]);

  /**
   * ============================================================
   * AMBIL KELAS ID DARI URL JIKA ADA
   *
   * Contoh:
   * /guru/absensi?kelasId=uuid
   * ============================================================
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(
      window.location.search,
    );

    const idFromUrl = params.get("kelasId");

    if (idFromUrl) {
      setKelasId(idFromUrl);
    }
  }, []);

  /**
   * ============================================================
   * FETCH ABSENSI
   * GET /api/v1/absensi/kelas/:kelasId
   * ============================================================
   */
  const fetchAbsensi = useCallback(async () => {
    if (!kelasId) {
      setAbsensi([]);
      return;
    }

    try {
      setLoadingAbsensi(true);
      setErrorAbsensi("");

      console.log(
        "========== GET ABSENSI ==========",
      );

      console.log("KELAS ID:", kelasId);
      console.log("TANGGAL:", tanggal || "SEMUA");

      const response = await getAbsensiKelas(
        kelasId,
        tanggal || null,
      );

      console.log("RESPONSE ABSENSI:", response);

      const dataAbsensi =
        normalizeAbsensiResponse(response);

      console.log(
        "ABSENSI NORMALIZED:",
        dataAbsensi,
      );

      console.log(
        "=================================",
      );

      setAbsensi(dataAbsensi);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(
        "Error fetch absensi kelas:",
        err,
      );

      setAbsensi([]);

      setErrorAbsensi(
        err?.message ||
          "Gagal mengambil data absensi kelas.",
      );
    } finally {
      setLoadingAbsensi(false);
    }
  }, [kelasId, tanggal]);

  /**
   * FETCH ABSENSI SETIAP KELAS ID / TANGGAL BERUBAH
   */
  useEffect(() => {
    if (kelasId) {
      fetchAbsensi();
    }
  }, [kelasId, fetchAbsensi]);

  /**
   * ============================================================
   * KELAS YANG SEDANG DIPILIH
   * ============================================================
   */
  const selectedKelas = useMemo(() => {
    return kelas.find(
      (item) => item?.id === kelasId,
    );
  }, [kelas, kelasId]);

  /**
   * ============================================================
   * REKAP ABSENSI
   * ============================================================
   */
  const rekap = useMemo(() => {
    const result = {
      total: absensi.length,
      hadir: 0,
      sakit: 0,
      izin: 0,
      alpha: 0,
    };

    absensi.forEach((item) => {
      const status = String(
        item?.status || "",
      ).toLowerCase();

      if (status === "hadir") {
        result.hadir += 1;
      }

      if (status === "sakit") {
        result.sakit += 1;
      }

      if (status === "izin") {
        result.izin += 1;
      }

      if (
        status === "alpha" ||
        status === "alpa"
      ) {
        result.alpha += 1;
      }
    });

    return result;
  }, [absensi]);

  /**
   * ============================================================
   * RIWAYAT TANGGAL
   * ============================================================
   */
  const riwayatTanggal = useMemo(() => {
    const map = new Map();

    absensi.forEach((item) => {
      if (!item?.tanggal) return;

      const key = String(item.tanggal).slice(
        0,
        10,
      );

      if (!map.has(key)) {
        map.set(key, {
          tanggal: item.tanggal,
          jumlah: 0,
        });
      }

      map.get(key).jumlah += 1;
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.tanggal) -
        new Date(a.tanggal),
    );
  }, [absensi]);

  /**
   * ============================================================
   * SORT DATA ABSENSI
   * ============================================================
   */
  const daftarAbsensi = useMemo(() => {
    return [...absensi].sort(
      (a, b) =>
        new Date(
          b?.dibuatPada ||
            b?.tanggal ||
            0,
        ) -
        new Date(
          a?.dibuatPada ||
            a?.tanggal ||
            0,
        ),
    );
  }, [absensi]);

  /**
   * ============================================================
   * PILIH KELAS
   * ============================================================
   */
  const handleChangeKelas = (e) => {
    const value = e.target.value;

    setKelasId(value);
    setTanggal("");

    setErrorAbsensi("");

    /**
     * Update URL juga.
     *
     * Contoh:
     * /guru/absensi?kelasId=uuid
     */
    if (value) {
      router.replace(
        `/guru/absensi?kelasId=${encodeURIComponent(
          value,
        )}`,
      );
    } else {
      router.replace("/guru/absensi");
    }
  };

  /**
   * ============================================================
   * PILIH TANGGAL DARI RIWAYAT
   * ============================================================
   */
  const pilihTanggal = (value) => {
    if (!value) return;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return;
    }

    const yyyy = date.getFullYear();

    const mm = String(
      date.getMonth() + 1,
    ).padStart(2, "0");

    const dd = String(
      date.getDate(),
    ).padStart(2, "0");

    setTanggal(
      `${yyyy}-${mm}-${dd}`,
    );
  };

  /**
   * ============================================================
   * TAMBAH ABSENSI
   * ============================================================
   */
  const handleTambahAbsensi = () => {
    if (!kelasId) {
      setErrorAbsensi(
        "Silakan pilih kelas terlebih dahulu.",
      );
      return;
    }

    router.push(
      `/guru/absensi/tambah?kelasId=${encodeURIComponent(
        kelasId,
      )}`,
    );
  };

  /**
   * ============================================================
   * REFRESH SEMUA
   * ============================================================
   */
  const handleRefresh = async () => {
    await fetchKelas();

    if (kelasId) {
      await fetchAbsensi();
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}
      <Sidebar
        active="absensi"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen((prev) => !prev)
        }
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* ====================================================
            HEADER
        ==================================================== */}
        <Header
          toggleSidebar={() =>
            setSidebarOpen((prev) => !prev)
          }
          notifications={notifications}
          user={{
            name: "Guru",
            email: "guru@smartschool.com",
            avatar: "G",
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">
            {/* =================================================
                PAGE HEADER
            ================================================= */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-600 text-white shadow-sm flex-shrink-0">
                    <ClipboardCheck size={18} />
                  </div>

                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
                    Absensi
                  </h1>
                </div>

                <p className="text-sm text-slate-500 mt-1 ml-[42px]">
                  Kelola dan lihat data absensi
                  siswa berdasarkan kelas.
                </p>
              </div>

              {/* ACTION */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={handleTambahAbsensi}
                  disabled={
                    !kelasId ||
                    loadingKelas
                  }
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  Tambah Absensi
                </button>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={
                    loadingKelas ||
                    loadingAbsensi
                  }
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw
                    size={15}
                    className={
                      loadingKelas ||
                      loadingAbsensi
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh
                </button>
              </div>
            </div>

            {/* =================================================
                FILTER
            ================================================= */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* KELAS */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Kelas
                  </label>

                  <div className="relative">
                    <GraduationCap
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />

                    <select
                      value={kelasId}
                      onChange={
                        handleChangeKelas
                      }
                      disabled={
                        loadingKelas ||
                        kelas.length === 0
                      }
                      className="appearance-none w-full pl-10 pr-10 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-60"
                    >
                      {loadingKelas ? (
                        <option value="">
                          Mengambil data
                          kelas...
                        </option>
                      ) : kelas.length ===
                        0 ? (
                        <option value="">
                          Belum ada kelas
                        </option>
                      ) : (
                        <>
                          <option value="">
                            Pilih kelas
                          </option>

                          {kelas.map(
                            (item) => (
                              <option
                                key={
                                  item.id
                                }
                                value={
                                  item.id
                                }
                              >
                                {item.nama ||
                                  `Kelas ${item.tingkat}`}
                                {item.tingkat
                                  ? ` - Tingkat ${item.tingkat}`
                                  : ""}
                              </option>
                            ),
                          )}
                        </>
                      )}
                    </select>

                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>

                  {/* INFO KELAS */}
                  {selectedKelas && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md">
                        <GraduationCap
                          size={12}
                        />

                        {selectedKelas.nama ||
                          "-"}
                      </span>

                      {selectedKelas.tingkat && (
                        <span className="text-[11px] text-slate-400">
                          Tingkat{" "}
                          {
                            selectedKelas.tingkat
                          }
                        </span>
                      )}

                      {selectedKelas
                        .waliKelas
                        ?.namaLengkap && (
                        <span className="text-[11px] text-slate-400">
                          Wali Kelas:{" "}
                          {
                            selectedKelas
                              .waliKelas
                              .namaLengkap
                          }
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* TANGGAL */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Tanggal
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />

                    <input
                      type="date"
                      value={tanggal}
                      onChange={(e) =>
                        setTanggal(
                          e.target.value,
                        )
                      }
                      disabled={!kelasId}
                      className="w-full pl-9 pr-3 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-60"
                    />
                  </div>

                  {tanggal && (
                    <button
                      type="button"
                      onClick={() =>
                        setTanggal("")
                      }
                      className="mt-2 text-[11px] font-medium text-blue-600 hover:text-blue-700"
                    >
                      Tampilkan semua
                      tanggal
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                ERROR KELAS
            ================================================= */}
            {errorKelas && (
              <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertCircle
                  size={18}
                  className="text-rose-500 mt-0.5 flex-shrink-0"
                />

                <div>
                  <p className="text-sm font-medium text-rose-700">
                    Gagal mengambil data
                    kelas
                  </p>

                  <p className="text-xs text-rose-600 mt-1">
                    {errorKelas}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                ERROR ABSENSI
            ================================================= */}
            {errorAbsensi && (
              <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertCircle
                  size={18}
                  className="text-rose-500 mt-0.5 flex-shrink-0"
                />

                <div>
                  <p className="text-sm font-medium text-rose-700">
                    Gagal mengambil data
                    absensi
                  </p>

                  <p className="text-xs text-rose-600 mt-1">
                    {errorAbsensi}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                BELUM ADA KELAS
            ================================================= */}
            {!loadingKelas &&
              kelas.length === 0 &&
              !errorKelas && (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-50 flex items-center justify-center">
                    <Users
                      size={20}
                      className="text-blue-500"
                    />
                  </div>

                  <h2 className="text-sm font-semibold text-slate-700">
                    Belum ada kelas
                  </h2>

                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Backend belum
                    mengembalikan data
                    kelas untuk sekolah
                    ini.
                  </p>
                </div>
              )}

            {/* =================================================
                LOADING ABSENSI
            ================================================= */}
            {loadingAbsensi && (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <RefreshCw
                  size={24}
                  className="mx-auto text-blue-500 animate-spin"
                />

                <p className="text-sm text-slate-500 mt-3">
                  Mengambil data absensi...
                </p>

                {selectedKelas && (
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedKelas.nama ||
                      "-"}
                  </p>
                )}
              </div>
            )}

            {/* =================================================
                CONTENT
            ================================================= */}
            {!loadingKelas &&
              !loadingAbsensi &&
              kelasId &&
              !errorAbsensi && (
                <>
                  {/* =================================================
                      SUMMARY
                  ================================================= */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {/* TOTAL */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3">
                      <div className="p-2 rounded-lg border bg-slate-100 text-slate-500 border-slate-200">
                        <Users size={16} />
                      </div>

                      <div>
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                          Total
                        </p>

                        <p className="text-lg font-bold text-slate-800">
                          {rekap.total}
                        </p>
                      </div>
                    </div>

                    {/* STATUS */}
                    {Object.entries(
                      STATUS_CONFIG,
                    ).map(
                      ([key, config]) => {
                        const Icon =
                          config.icon;

                        return (
                          <div
                            key={key}
                            className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3"
                          >
                            <div
                              className={`p-2 rounded-lg border ${config.badge}`}
                            >
                              <Icon size={16} />
                            </div>

                            <div>
                              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                {
                                  config.label
                                }
                              </p>

                              <p className="text-lg font-bold text-slate-800">
                                {
                                  rekap[
                                    key
                                  ]
                                }
                              </p>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>

                  {/* =================================================
                      DATA ABSENSI
                  ================================================= */}
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 border-b border-slate-100">
                      <div>
                        <h2 className="text-sm font-semibold text-slate-800">
                          Data Absensi Kelas
                        </h2>

                        <p className="text-xs text-slate-400 mt-0.5">
                          {selectedKelas
                            ?.nama
                            ? `Kelas ${selectedKelas.nama}`
                            : "Kelas terpilih"}

                          {tanggal
                            ? ` • ${formatTanggal(
                                tanggal,
                              )}`
                            : ""}
                        </p>
                      </div>

                      {lastUpdated && (
                        <span className="text-[11px] text-slate-400">
                          Diperbarui{" "}
                          {formatJam(
                            lastUpdated,
                          )}
                        </span>
                      )}
                    </div>

                    {daftarAbsensi.length ===
                    0 ? (
                      <div className="p-10 text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
                          <ClipboardCheck
                            size={20}
                            className="text-slate-400"
                          />
                        </div>

                        <p className="text-sm font-medium text-slate-600 mt-3">
                          Belum ada data
                          absensi
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          Tidak ada record
                          absensi untuk
                          kelas dan
                          tanggal yang
                          dipilih.
                        </p>

                        <button
                          type="button"
                          onClick={
                            handleTambahAbsensi
                          }
                          className="inline-flex items-center gap-2 mt-4 px-3.5 py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Plus size={14} />
                          Tambah Absensi
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px]">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70">
                              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Siswa
                              </th>

                              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Tanggal
                              </th>

                              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Status
                              </th>

                              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Metode
                              </th>

                              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Keterangan
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100">
                            {daftarAbsensi.map(
                              (
                                item,
                                index,
                              ) => {
                                const status =
                                  String(
                                    item?.status ||
                                      "",
                                  ).toLowerCase();

                                const config =
                                  STATUS_CONFIG[
                                    status
                                  ];

                                const StatusIcon =
                                  config?.icon ||
                                  AlertCircle;

                                const metode =
                                  String(
                                    item?.metode ||
                                      "",
                                  ).toLowerCase();

                                const metodeConfig =
                                  METODE_CONFIG[
                                    metode
                                  ];

                                const MetodeIcon =
                                  metodeConfig?.icon ||
                                  ClipboardCheck;

                                const siswa =
                                  item?.pengguna ||
                                  item?.siswa;

                                return (
                                  <tr
                                    key={
                                      item?.id ||
                                      index
                                    }
                                    className="hover:bg-slate-50/60 transition-colors"
                                  >
                                    {/* SISWA */}
                                    <td className="px-5 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                          <UserCheck
                                            size={
                                              16
                                            }
                                          />
                                        </div>

                                        <div className="min-w-0">
                                          <p className="text-sm font-medium text-slate-800 truncate">
                                            {siswa?.namaLengkap ||
                                              item?.namaLengkap ||
                                              "-"}
                                          </p>

                                          <p className="text-[11px] text-slate-400">
                                            NISN:{" "}
                                            {siswa?.nisn ||
                                              item?.nisn ||
                                              "-"}
                                          </p>
                                        </div>
                                      </div>
                                    </td>

                                    {/* TANGGAL */}
                                    <td className="px-5 py-4">
                                      <div>
                                        <p className="text-xs font-medium text-slate-700">
                                          {formatTanggal(
                                            item?.tanggal,
                                          )}
                                        </p>

                                        {item?.dibuatPada && (
                                          <p className="text-[11px] text-slate-400 mt-0.5">
                                            {formatJam(
                                              item.dibuatPada,
                                            )}
                                          </p>
                                        )}
                                      </div>
                                    </td>

                                    {/* STATUS */}
                                    <td className="px-5 py-4">
                                      <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border ${
                                          config?.badge ||
                                          "bg-slate-50 text-slate-500 border-slate-200"
                                        }`}
                                      >
                                        <StatusIcon
                                          size={
                                            12
                                          }
                                        />

                                        {config?.label ||
                                          item?.status ||
                                          "-"}
                                      </span>
                                    </td>

                                    {/* METODE */}
                                    <td className="px-5 py-4">
                                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                                        <MetodeIcon
                                          size={
                                            13
                                          }
                                          className="text-slate-400"
                                        />

                                        {metodeConfig?.label ||
                                          item?.metode ||
                                          "-"}
                                      </span>
                                    </td>

                                    {/* KETERANGAN */}
                                    <td className="px-5 py-4">
                                      <span className="text-xs text-slate-500">
                                        {item?.keterangan ||
                                          "-"}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              },
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* =================================================
                      RIWAYAT
                  ================================================= */}
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 p-4 sm:p-5 border-b border-slate-100">
                      <History
                        size={16}
                        className="text-slate-400"
                      />

                      <div>
                        <h2 className="text-sm font-semibold text-slate-800">
                          Riwayat Data
                        </h2>

                        <p className="text-xs text-slate-400 mt-0.5">
                          Riwayat tanggal absensi
                          dari backend
                        </p>
                      </div>
                    </div>

                    {riwayatTanggal.length ===
                    0 ? (
                      <div className="p-6 text-center">
                        <p className="text-xs text-slate-400">
                          Belum ada riwayat
                          absensi.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {riwayatTanggal.map(
                          (item) => {
                            const tanggalItem =
                              new Date(
                                item.tanggal,
                              );

                            const tanggalKey =
                              tanggalItem
                                .toISOString()
                                .slice(
                                  0,
                                  10,
                                );

                            const isActive =
                              tanggal ===
                              tanggalKey;

                            return (
                              <button
                                type="button"
                                key={
                                  tanggalKey
                                }
                                onClick={() =>
                                  pilihTanggal(
                                    item.tanggal,
                                  )
                                }
                                className={`w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors ${
                                  isActive
                                    ? "bg-blue-50/60"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                                    <CalendarDays
                                      size={
                                        15
                                      }
                                    />
                                  </div>

                                  <div>
                                    <p className="text-xs font-medium text-slate-700">
                                      {formatTanggal(
                                        item.tanggal,
                                      )}
                                    </p>

                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                      {
                                        item.jumlah
                                      }{" "}
                                      data
                                      absensi
                                    </p>
                                  </div>
                                </div>

                                {isActive && (
                                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full">
                                    Dipilih
                                  </span>
                                )}
                              </button>
                            );
                          },
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}