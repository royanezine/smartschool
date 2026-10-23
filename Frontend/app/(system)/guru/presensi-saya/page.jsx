"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  Clock3,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  MapPin,
  LogIn,
  LogOut,
  RefreshCw,
  Loader2,
  History,
  Timer,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Hand,
  Info,
  ShieldCheck,
} from "lucide-react";

import {
  checkInShift,
  checkOutShift,
  getRiwayatShiftSaya,
} from "@/services/absensi.service";

const PAGE_SIZE = 10;
const TIME_ZONE = "Asia/Jakarta";
const REFRESH_INTERVAL = 10000;

const METODE_ABSENSI = [
  {
    value: "lokasi",
    label: "Lokasi GPS",
    description: "Gunakan lokasi perangkat saat melakukan check-in.",
    icon: MapPin,
  },
  {
    value: "manual",
    label: "Manual",
    description: "Kirim presensi dengan metode manual.",
    icon: Hand,
  },
];

const getDateParts = (value = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);

  const result = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      result[part.type] = part.value;
    }
  }

  return result;
};

const getToday = () => {
  const { year, month, day } = getDateParts();
  return `${year}-${month}-${day}`;
};

const formatDate = (value) => {
  if (!value) return "-";

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    const [year, month, day] = value.split("-").map(Number);

    return new Date(
      Date.UTC(year, month - 1, day, 12)
    ).toLocaleDateString("id-ID", {
      timeZone: "UTC",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (
    typeof value === "string" &&
    /^\d{2}:\d{2}(:\d{2})?$/.test(value)
  ) {
    return value.slice(0, 5);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString("id-ID", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const getRecordDate = (record) => {
  if (record?.waktuMasuk) {
    const date = new Date(record.waktuMasuk);

    if (!Number.isNaN(date.getTime())) {
      const { year, month, day } = getDateParts(date);
      return `${year}-${month}-${day}`;
    }
  }

  if (
    typeof record?.tanggal === "string" &&
    /^\d{4}-\d{2}-\d{2}/.test(record.tanggal)
  ) {
    return record.tanggal.slice(0, 10);
  }

  if (record?.tanggal) {
    const date = new Date(record.tanggal);

    if (!Number.isNaN(date.getTime())) {
      const { year, month, day } = getDateParts(date);
      return `${year}-${month}-${day}`;
    }
  }

  if (record?.dibuatPada) {
    const date = new Date(record.dibuatPada);

    if (!Number.isNaN(date.getTime())) {
      const { year, month, day } = getDateParts(date);
      return `${year}-${month}-${day}`;
    }
  }

  return "";
};

const normalizeText = (value) =>
  String(value ?? "").trim().toLowerCase();

const getAttendanceStatus = (record) => {
  const shiftStatus = normalizeText(record?.statusShift);
  const attendanceStatus = normalizeText(record?.status);

  if (shiftStatus.includes("terlambat_dan_pulang_cepat")) {
    return {
      label: "Terlambat & pulang cepat",
      className: "theme-warning",
    };
  }

  if (shiftStatus.includes("terlambat")) {
    return {
      label: "Terlambat",
      className: "theme-warning",
    };
  }

  if (shiftStatus.includes("pulang_cepat")) {
    return {
      label: "Pulang cepat",
      className: "theme-warning",
    };
  }

  if (shiftStatus.includes("tepat_waktu")) {
    return {
      label: "Tepat waktu",
      className: "theme-success",
    };
  }

  if (attendanceStatus === "hadir") {
    return {
      label: "Hadir",
      className: "theme-success",
    };
  }

  if (attendanceStatus === "izin") {
    return {
      label: "Izin",
      className: "theme-info",
    };
  }

  if (attendanceStatus === "sakit") {
    return {
      label: "Sakit",
      className: "theme-info",
    };
  }

  if (attendanceStatus === "alpha") {
    return {
      label: "Alpha",
      className: "theme-danger",
    };
  }

  return {
    label: record?.statusShift || record?.status || "Tercatat",
    className: "theme-info",
  };
};

const getShiftName = (record) =>
  record?.shiftKerja?.nama ??
  record?.shiftKerjaMaster?.nama ??
  record?.shift?.nama ??
  "Shift kerja";

const getShiftStart = (record) =>
  record?.shiftKerja?.jamMasuk ??
  record?.shiftKerjaMaster?.jamMasuk ??
  record?.shift?.jamMasuk ??
  null;

const getShiftEnd = (record) =>
  record?.shiftKerja?.jamKeluar ??
  record?.shiftKerjaMaster?.jamKeluar ??
  record?.shift?.jamKeluar ??
  null;

const getMethodLabel = (method) => {
  const found = METODE_ABSENSI.find(
    (item) => item.value === method
  );

  if (found) return found.label;
  return method || "-";
};

const getErrorMessage = (error) => {
  const message = String(error?.message ?? "");

  if (
    message.toLowerCase().includes("failed to fetch") ||
    message.toLowerCase().includes("networkerror")
  ) {
    return "Server tidak dapat dihubungi. Periksa koneksi Backend dan alamat API.";
  }

  return message || "Terjadi kesalahan. Silakan coba kembali.";
};

const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (
      typeof navigator === "undefined" ||
      !navigator.geolocation
    ) {
      reject(
        new Error("Browser tidak mendukung akses lokasi.")
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lintang: position.coords.latitude,
          bujur: position.coords.longitude,
        });
      },
      (geoError) => {
        if (geoError.code === 1) {
          reject(
            new Error(
              "Izin lokasi ditolak. Aktifkan izin lokasi browser untuk melanjutkan."
            )
          );
          return;
        }

        if (geoError.code === 2) {
          reject(
            new Error(
              "Lokasi tidak berhasil ditemukan. Periksa GPS atau koneksi perangkat."
            )
          );
          return;
        }

        reject(
          new Error(
            "Pengambilan lokasi terlalu lama. Silakan coba kembali."
          )
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });

const normalizeAttendanceResponse = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.data?.items)) {
    return response.data.items;
  }

  if (Array.isArray(response?.result?.data)) {
    return response.result.data;
  }

  return [];
};

const getRecordTimestamp = (record) => {
  const value =
    record?.waktuMasuk ??
    record?.dibuatPada ??
    record?.tanggal;

  if (!value) return 0;

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export default function AbsensiGuruPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeAction, setActiveAction] = useState("");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedMethod, setSelectedMethod] = useState("lokasi");
  const [keterangan, setKeterangan] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [today, setToday] = useState(() => getToday());

  useEffect(() => {
    const updateToday = () => setToday(getToday());

    updateToday();

    const intervalId = setInterval(updateToday, 30000);

    return () => clearInterval(intervalId);
  }, []);


  const fetchHistory = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);

        setError("");

        const response = await getRiwayatShiftSaya(1, 100);
        const data = normalizeAttendanceResponse(response);

        const sortedData = [...data].sort(
          (a, b) =>
            getRecordTimestamp(b) - getRecordTimestamp(a)
        );

        setRecords(sortedData);

        setCurrentPage((previousPage) => {
          const maxPage = Math.max(
            1,
            Math.ceil(sortedData.length / PAGE_SIZE)
          );

          return Math.min(previousPage, maxPage);
        });
      } catch (err) {
        console.error(
          "Gagal mengambil riwayat presensi:",
          err
        );

        if (showLoading) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchHistory(true);

    const intervalId = setInterval(() => {
      if (
        typeof document !== "undefined" &&
        document.visibilityState === "visible"
      ) {
        fetchHistory(false);
      }
    }, REFRESH_INTERVAL);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchHistory(false);
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      clearInterval(intervalId);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [fetchHistory]);


  const todayRecords = useMemo(
    () =>
      records
        .filter((record) => getRecordDate(record) === today)
        .sort(
          (a, b) =>
            getRecordTimestamp(b) - getRecordTimestamp(a)
        ),
    [records, today]
  );

  const todayRecord = todayRecords[0] ?? null;

  const hasCheckedIn = Boolean(todayRecord?.waktuMasuk);
  const hasCheckedOut = Boolean(todayRecord?.waktuKeluar);

  const canCheckIn = !hasCheckedIn;
  const canCheckOut = hasCheckedIn && !hasCheckedOut;


  const summary = useMemo(() => {
    const hadir = records.filter((record) => {
      const shiftStatus = normalizeText(record?.statusShift);
      const status = normalizeText(record?.status);

      return (
        shiftStatus === "tepat_waktu" ||
        shiftStatus === "terlambat" ||
        shiftStatus === "terlambat_dan_pulang_cepat" ||
        shiftStatus === "pulang_cepat" ||
        status === "hadir"
      );
    }).length;

    const terlambat = records.filter((record) => {
      const status = normalizeText(record?.statusShift);

      return (
        status === "terlambat" ||
        status === "terlambat_dan_pulang_cepat"
      );
    }).length;

    const selesai = records.filter(
      (record) => Boolean(record?.waktuKeluar)
    ).length;

    return {
      total: records.length,
      hadir,
      terlambat,
      selesai,
    };
  }, [records]);


  const getMethodPayload = async () => {
    const payload = {
      metode: selectedMethod,
    };

    if (keterangan.trim()) {
      payload.keterangan = keterangan.trim();
    }

    if (selectedMethod === "lokasi") {
      const location = await getCurrentLocation();

      payload.lintang = location.lintang;
      payload.bujur = location.bujur;
    }

    return payload;
  };


  const handleCheckIn = async () => {
    if (submitting || loading || !canCheckIn) return;

    if (
      !window.confirm(
        `Lakukan check-in menggunakan metode ${getMethodLabel(
          selectedMethod
        )}?`
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setActiveAction("checkin");
      setError("");
      setNotice("");

      const payload = await getMethodPayload();

      await checkInShift({
        status: "hadir",
        ...payload,
      });

      setNotice(
        "Check-in berhasil dicatat. Riwayat presensi diperbarui."
      );

      setKeterangan("");

      await fetchHistory(false);
    } catch (err) {
      console.error("Gagal check-in:", err);
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
      setActiveAction("");
    }
  };


  const handleCheckOut = async () => {
    if (submitting || loading || !canCheckOut) return;

    if (!window.confirm("Lakukan check-out sekarang?")) {
      return;
    }

    try {
      setSubmitting(true);
      setActiveAction("checkout");
      setError("");
      setNotice("");

      const payload = {};

      if (keterangan.trim()) {
        payload.keterangan = keterangan.trim();
      }

      await checkOutShift(payload);

      setNotice(
        "Check-out berhasil dicatat. Riwayat presensi diperbarui."
      );

      setKeterangan("");

      await fetchHistory(false);
    } catch (err) {
      console.error("Gagal check-out:", err);
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
      setActiveAction("");
    }
  };


  const totalPages = Math.max(
    1,
    Math.ceil(records.length / PAGE_SIZE)
  );

  const paginatedRecords = records.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentStatus = !hasCheckedIn
    ? {
        label: "Belum check-in",
        className: "theme-warning",
      }
    : !hasCheckedOut
      ? {
          label: "Sedang bekerja",
          className: "theme-info",
        }
      : {
          label: "Selesai",
          className: "theme-success",
        };

  const selectedMethodInfo = METODE_ABSENSI.find(
    (item) => item.value === selectedMethod
  );


  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        active="absensi"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={() =>
            setIsCollapsed((value) => !value)
          }
          notifications={[]}
          user={{
            name: "Guru",
            email: "",
            avatar: "GU",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-4 md:p-6 lg:p-8">
            <div className="max-w-[1500px] mx-auto space-y-6">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[image:var(--color-brand-logo-bg)] text-white flex items-center justify-center shadow-sm">
                    <ClipboardCheck size={21} />
                  </div>

                  <div>
                    <h1 className="text-xl font-semibold theme-text">
                      Presensi Saya
                    </h1>

                    <p className="text-sm theme-text-secondary mt-1">
                      Kelola kehadiran, check-in, dan check-out
                      berdasarkan shift kerja.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fetchHistory(true)}
                  disabled={loading || submitting}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-secondary hover:text-[var(--color-primary)] transition disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  Perbarui data
                </button>
              </div>


              <div className="theme-card border theme-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg theme-info">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <p className="text-xs theme-text-muted">
                      Hari ini
                    </p>

                    <p className="text-sm font-semibold theme-text mt-1">
                      {formatDate(today)}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-2 w-fit px-3 py-2 rounded-lg text-xs font-semibold ${currentStatus.className}`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                  {currentStatus.label}
                </span>
              </div>


              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl border theme-danger">
                  <CircleAlert
                    size={20}
                    className="shrink-0 mt-0.5"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">
                      Presensi belum berhasil diproses
                    </p>

                    <p className="text-sm mt-1 break-words">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchHistory(true)}
                    disabled={loading || submitting}
                    className="text-sm font-medium hover:opacity-80 disabled:opacity-50"
                  >
                    Coba lagi
                  </button>
                </div>
              )}


              {notice && (
                <div className="flex items-start gap-3 p-4 rounded-xl border theme-success">
                  <CheckCircle2
                    size={20}
                    className="shrink-0 mt-0.5"
                  />
                  <p className="text-sm">{notice}</p>
                </div>
              )}


              <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="theme-card border theme-border rounded-xl p-5 lg:col-span-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold theme-text">
                        Kehadiran hari ini
                      </p>

                      <p className="text-xs theme-text-muted mt-1">
                        Jam masuk dan pulang mengikuti data Backend.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg theme-info">
                      <Clock3 size={20} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-xl theme-card-soft border theme-border">
                      <div className="flex items-center gap-2 theme-text-muted">
                        <LogIn size={17} />
                        <span className="text-xs">Jam masuk</span>
                      </div>

                      <p className="text-2xl font-semibold theme-text mt-3">
                        {loading
                          ? "—"
                          : formatTime(todayRecord?.waktuMasuk)}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl theme-card-soft border theme-border">
                      <div className="flex items-center gap-2 theme-text-muted">
                        <LogOut size={17} />
                        <span className="text-xs">Jam pulang</span>
                      </div>

                      <p className="text-2xl font-semibold theme-text mt-3">
                        {loading
                          ? "—"
                          : formatTime(todayRecord?.waktuKeluar)}
                      </p>
                    </div>
                  </div>


                  <div className="mt-6">
                    <p className="text-sm font-semibold theme-text">
                      Metode presensi
                    </p>

                    <p className="text-xs theme-text-muted mt-1 mb-3">
                      Pilih metode yang tersedia pada endpoint shift.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {METODE_ABSENSI.map((method) => {
                        const Icon = method.icon;
                        const selected =
                          selectedMethod === method.value;

                        return (
                          <button
                            key={method.value}
                            type="button"
                            onClick={() => {
                              if (submitting) return;

                              setSelectedMethod(method.value);
                              setError("");
                              setNotice("");
                            }}
                            disabled={submitting}
                            className={`text-left p-4 rounded-xl border transition ${
                              selected
                                ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)] theme-card"
                                : "theme-border theme-card hover:border-[var(--color-primary)]"
                            } disabled:opacity-50`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2.5 rounded-lg ${
                                  selected
                                    ? "theme-primary"
                                    : "theme-card-soft theme-text-secondary"
                                }`}
                              >
                                <Icon size={19} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-semibold theme-text">
                                    {method.label}
                                  </p>

                                  {selected && (
                                    <CheckCircle2
                                      size={17}
                                      className="text-[var(--color-primary)] shrink-0"
                                    />
                                  )}
                                </div>

                                <p className="text-xs theme-text-muted mt-1 leading-5">
                                  {method.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>


                    <div className="mt-4">
                      <label
                        htmlFor="keterangan"
                        className="block text-sm font-medium theme-text mb-2"
                      >
                        Keterangan{" "}
                        <span className="font-normal theme-text-muted">
                          (opsional)
                        </span>
                      </label>

                      <textarea
                        id="keterangan"
                        rows={2}
                        value={keterangan}
                        onChange={(event) =>
                          setKeterangan(event.target.value)
                        }
                        disabled={submitting}
                        placeholder="Tambahkan keterangan jika diperlukan..."
                        className="w-full px-4 py-3 rounded-xl border theme-border theme-card theme-text text-sm outline-none resize-y focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                    </div>

                    <div className="flex items-start gap-2 mt-4 p-3 rounded-xl border theme-border theme-card-soft">
                      <Info
                        size={17}
                        className="theme-text-muted shrink-0 mt-0.5"
                      />

                      <p className="text-xs theme-text-secondary leading-5">
                        Metode terpilih:{" "}
                        <strong>{selectedMethodInfo?.label}</strong>.{" "}
                        {selectedMethod === "lokasi"
                          ? "Browser akan meminta izin lokasi saat check-in. Backend memeriksa metode dan koordinat berdasarkan pengaturan sekolah."
                          : "Presensi dikirim menggunakan metode manual. Backend tetap memproses dan mencatat presensi."}
                      </p>
                    </div>
                  </div>


                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleCheckIn}
                      disabled={
                        loading || submitting || !canCheckIn
                      }
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl theme-primary font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {activeAction === "checkin" ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <LogIn size={17} />
                      )}

                      {hasCheckedIn
                        ? "Sudah check-in"
                        : activeAction === "checkin"
                          ? "Memproses check-in..."
                          : "Check-in"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCheckOut}
                      disabled={
                        loading || submitting || !canCheckOut
                      }
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border theme-border theme-card theme-text-secondary font-semibold text-sm hover:border-[var(--color-primary)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {activeAction === "checkout" ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <LogOut size={17} />
                      )}

                      {hasCheckedOut
                        ? "Sudah check-out"
                        : activeAction === "checkout"
                          ? "Memproses check-out..."
                          : "Check-out"}
                    </button>
                  </div>
                </div>


                <div className="theme-card border theme-border rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold theme-text">
                        Shift kerja
                      </p>

                      <p className="text-xs theme-text-muted mt-1">
                        Berdasarkan catatan presensi.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg theme-info">
                      <CalendarClock size={20} />
                    </div>
                  </div>

                  {todayRecord?.shiftKerja ||
                  todayRecord?.shiftKerjaMaster ||
                  todayRecord?.shift ? (
                    <div className="mt-6 space-y-4">
                      <div>
                        <p className="text-xs theme-text-muted">
                          Nama shift
                        </p>

                        <p className="text-base font-semibold theme-text mt-1">
                          {getShiftName(todayRecord)}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl theme-card-soft border theme-border">
                        <p className="text-xs theme-text-muted">
                          Jadwal kerja
                        </p>

                        <p className="text-lg font-semibold theme-text mt-2">
                          {formatTime(getShiftStart(todayRecord))}
                          {" – "}
                          {formatTime(getShiftEnd(todayRecord))}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 p-4 rounded-xl theme-card-soft border theme-border">
                      <p className="text-sm font-medium theme-text">
                        {loading
                          ? "Memuat data shift..."
                          : "Data shift belum tersedia"}
                      </p>

                      <p className="text-xs theme-text-muted mt-2 leading-5">
                        Shift kerja ditampilkan apabila tersedia pada
                        catatan riwayat. Pastikan Admin Sekolah telah
                        menetapkan shift untuk akun guru.
                      </p>
                    </div>
                  )}
                </div>
              </section>


              <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <div className="theme-card border theme-border rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg theme-info">
                      <History size={17} />
                    </div>

                    <p className="text-xs theme-text-muted">
                      Total catatan
                    </p>
                  </div>

                  <p className="text-2xl font-bold theme-text mt-3">
                    {loading ? "—" : summary.total}
                  </p>
                </div>

                <div className="theme-card border theme-border rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg theme-success">
                      <CheckCircle2 size={17} />
                    </div>

                    <p className="text-xs theme-text-muted">Hadir</p>
                  </div>

                  <p className="text-2xl font-bold theme-text mt-3">
                    {loading ? "—" : summary.hadir}
                  </p>
                </div>

                <div className="theme-card border theme-border rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg theme-warning">
                      <Timer size={17} />
                    </div>

                    <p className="text-xs theme-text-muted">
                      Terlambat
                    </p>
                  </div>

                  <p className="text-2xl font-bold theme-text mt-3">
                    {loading ? "—" : summary.terlambat}
                  </p>
                </div>

                <div className="theme-card border theme-border rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg theme-info">
                      <LogOut size={17} />
                    </div>

                    <p className="text-xs theme-text-muted">
                      Selesai check-out
                    </p>
                  </div>

                  <p className="text-2xl font-bold theme-text mt-3">
                    {loading ? "—" : summary.selesai}
                  </p>
                </div>
              </section>


              <section className="theme-card border theme-border rounded-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b theme-border">
                  <div>
                    <h2 className="text-base font-semibold theme-text">
                      Riwayat presensi
                    </h2>

                    <p className="text-xs theme-text-muted mt-1">
                      Riwayat check-in dan check-out dari Backend.
                    </p>
                  </div>

                  <span className="text-xs theme-text-muted">
                    {records.length} catatan dimuat
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px]">
                    <thead>
                      <tr className="theme-primary">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-white">
                          Tanggal
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold text-white">
                          Shift
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold text-white">
                          Jam masuk
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold text-white">
                          Jam pulang
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold text-white">
                          Metode
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold text-white">
                          Status
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold text-white">
                          Keterangan
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-5 py-14 text-center"
                          >
                            <Loader2
                              size={26}
                              className="animate-spin mx-auto text-[var(--color-primary)]"
                            />

                            <p className="text-sm theme-text-secondary mt-3">
                              Mengambil riwayat presensi...
                            </p>
                          </td>
                        </tr>
                      ) : paginatedRecords.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-5 py-14 text-center"
                          >
                            <div className="w-12 h-12 rounded-full theme-info mx-auto flex items-center justify-center">
                              <History size={23} />
                            </div>

                            <p className="text-sm font-semibold theme-text mt-3">
                              Belum ada riwayat presensi
                            </p>

                            <p className="text-xs theme-text-muted mt-1">
                              Riwayat akan muncul setelah presensi
                              berhasil dicatat.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        paginatedRecords.map((record, index) => {
                          const status = getAttendanceStatus(record);

                          return (
                            <tr
                              key={
                                record.id ??
                                `${getRecordDate(record)}-${index}`
                              }
                              className="theme-table-hover border-t theme-border"
                            >
                              <td className="px-5 py-4 text-sm theme-text-secondary whitespace-nowrap">
                                {formatDate(
                                  record.tanggal ??
                                    record.waktuMasuk ??
                                    record.dibuatPada
                                )}
                              </td>

                              <td className="px-5 py-4 text-sm theme-text-secondary">
                                {getShiftName(record)}
                              </td>

                              <td className="px-5 py-4 text-sm theme-text-secondary whitespace-nowrap">
                                {formatTime(record.waktuMasuk)}
                              </td>

                              <td className="px-5 py-4 text-sm theme-text-secondary whitespace-nowrap">
                                {formatTime(record.waktuKeluar)}
                              </td>

                              <td className="px-5 py-4 text-sm theme-text-secondary whitespace-nowrap">
                                {getMethodLabel(record.metode)}
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                  {status.label}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-sm theme-text-secondary max-w-[220px]">
                                <span className="block truncate">
                                  {record.keterangan || "-"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {!loading && records.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t theme-border theme-card-soft">
                    <p className="text-xs theme-text-muted">
                      Menampilkan{" "}
                      {(currentPage - 1) * PAGE_SIZE + 1}
                      {" – "}
                      {Math.min(
                        currentPage * PAGE_SIZE,
                        records.length
                      )}
                      {" dari "}
                      {records.length} catatan
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          changePage(currentPage - 1)
                        }
                        disabled={currentPage <= 1}
                        className="p-2 rounded-lg border theme-border theme-card theme-text-secondary disabled:opacity-40"
                        aria-label="Halaman sebelumnya"
                      >
                        <ChevronLeft size={17} />
                      </button>

                      <span className="text-xs theme-text-secondary">
                        Halaman {currentPage} dari {totalPages}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          changePage(currentPage + 1)
                        }
                        disabled={currentPage >= totalPages}
                        className="p-2 rounded-lg border theme-border theme-card theme-text-secondary disabled:opacity-40"
                        aria-label="Halaman berikutnya"
                      >
                        <ChevronRight size={17} />
                      </button>
                    </div>
                  </div>
                )}
              </section>


              <div className="flex items-start gap-3 p-4 rounded-xl border theme-border theme-card">
                <ShieldCheck
                  size={18}
                  className="theme-text-muted shrink-0 mt-0.5"
                />

                <div>
                  <p className="text-sm font-medium theme-text">
                    Informasi presensi
                  </p>

                  <p className="text-xs theme-text-muted mt-1 leading-5">
                    Riwayat diperbarui otomatis setiap 10 detik
                    saat halaman aktif. Jam masuk, jam pulang,
                    status, dan shift mengikuti data Backend.
                    Metode Face ID dan barcode tidak ditampilkan
                    karena belum diverifikasi pada endpoint shift
                    dalam implementasi Backend yang diberikan.
                  </p>
                </div>
              </div>

              <footer className="text-center text-xs theme-text-muted py-3 border-t theme-border">
                © 2026 SmartSchool • Presensi Guru
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}