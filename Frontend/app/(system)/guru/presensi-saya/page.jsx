"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  Clock3,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
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
  Info,
  ShieldCheck,
  Camera,
  CameraOff,
  RotateCcw,
  Search,
  Filter,
} from "lucide-react";

import {
  checkInShift,
  checkOutShift,
  getRiwayatShiftSaya,
  getMetodeAbsensiAktif,
} from "@/services/absensi.service";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const PAGE_SIZE = 10;
const TIME_ZONE = "Asia/Jakarta";
const REFRESH_INTERVAL = 10000;
const MAX_GPS_ACCURACY_METERS = 200;
const GPS_TIMEOUT_MS = 30000;

const METODE_CONFIG = {
  lokasi: {
    value: "lokasi",
    label: "Lokasi GPS",
    description:
      "Presensi menggunakan koordinat GPS perangkat dan validasi lokasi oleh Backend.",
    icon: Clock3,
    requiresLocation: true,
  },
  face: {
    value: "face",
    label: "Face ID",
    description:
      "Ambil foto wajah melalui kamera. Foto akan dikirim ke Backend untuk verifikasi wajah saat check-in.",
    icon: ShieldCheck,
    requiresLocation: true,
  },

  manual: {
    value: "manual",
    label: "Manual",
    description:
      "Metode presensi manual sesuai konfigurasi sekolah.",
    icon: CalendarClock,
    requiresLocation: false,
  },
};

const getDateParts = (value = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);

  const result = {};

  for (const part of parts) {
    if (part.type !== "literal") result[part.type] = part.value;
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
  record?.nama ??
  record?.shiftKerja?.nama ??
  record?.shiftKerjaMaster?.nama ??
  record?.shift?.nama ??
  "Shift kerja";

const getShiftStart = (record) =>
  record?.jamMasuk ??
  record?.shiftKerja?.jamMasuk ??
  record?.shiftKerjaMaster?.jamMasuk ??
  record?.shift?.jamMasuk ??
  null;

const getShiftEnd = (record) =>
  record?.jamKeluar ??
  record?.shiftKerja?.jamKeluar ??
  record?.shiftKerjaMaster?.jamKeluar ??
  record?.shift?.jamKeluar ??
  null;

const getMethodLabel = (method) => {
  const normalized = normalizeText(method);
  const found = METODE_CONFIG[normalized];

  return found?.label ?? method ?? "-";
};

const getErrorMessage = (error) => {
  const message = String(error?.message ?? "").trim();
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("failed to fetch") ||
    lowerMessage.includes("networkerror")
  ) {
    return "Server tidak dapat dihubungi. Periksa koneksi Backend dan alamat API.";
  }

  if (
    lowerMessage.includes("meter dari sekolah") ||
    lowerMessage.includes("radius")
  ) {
    return `${message} Periksa koordinat sekolah di database dan pastikan GPS perangkat akurat.`;
  }

  if (
    lowerMessage.includes("akses lokasi") &&
    lowerMessage.includes("gps")
  ) {
    return "Lokasi GPS wajib diaktifkan. Izinkan akses lokasi untuk SmartSchool, kemudian coba lagi.";
  }

  if (
    lowerMessage.includes("akurasi gps") ||
    lowerMessage.includes("akurasi lokasi") ||
    lowerMessage.includes("lokasi belum cukup akurat") ||
    lowerMessage.includes("lokasi belum berhasil diperoleh") ||
    lowerMessage.includes("lokasi tidak dapat diakses") ||
    lowerMessage.includes("izin lokasi ditolak") ||
    lowerMessage.includes("browser tidak mendukung akses lokasi") ||
    lowerMessage.includes("browser gagal memulai gps") ||
    lowerMessage.includes("layanan lokasi") ||
    lowerMessage.includes("gagal mendapatkan lokasi")
  ) {
    return message;
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
        new Error(
          "Browser tidak mendukung akses lokasi. Gunakan browser yang mendukung GPS."
        )
      );
      return;
    }

    let watchId = null;
    let timeoutId = null;
    let bestPosition = null;
    let finished = false;

    const cleanup = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }

      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const finish = (callback, value) => {
      if (finished) return;

      finished = true;
      cleanup();
      callback(value);
    };

    const handlePosition = (position) => {
      if (finished) return;

      const { latitude, longitude, accuracy } = position.coords;

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180 ||
        !Number.isFinite(accuracy) ||
        accuracy <= 0
      ) {
        return;
      }

      if (
        !bestPosition ||
        accuracy < bestPosition.coords.accuracy
      ) {
        bestPosition = position;
      }

      console.info("[GPS PRESENSI]", {
        lintang: latitude,
        bujur: longitude,
        akurasiMeter: Math.round(accuracy),
      });

      if (accuracy <= MAX_GPS_ACCURACY_METERS) {
        finish(resolve, {
          lintang: Number(latitude),
          bujur: Number(longitude),
          akurasi: Number(accuracy),
        });
      }
    };

    const handlePositionError = (error) => {
      if (finished) return;

      console.warn("[GPS PRESENSI] Gagal membaca lokasi:", {
        code: error.code,
        message: error.message,
      });

      if (error.code === 1) {
        finish(
          reject,
          new Error(
            "Izin lokasi ditolak. Izinkan akses lokasi untuk SmartSchool melalui pengaturan browser."
          )
        );
      }
    };

    try {
      watchId = navigator.geolocation.watchPosition(
        handlePosition,
        handlePositionError,
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: GPS_TIMEOUT_MS,
        }
      );
    } catch {
      finish(
        reject,
        new Error(
          "Browser gagal memulai GPS. Periksa pengaturan lokasi perangkat."
        )
      );
      return;
    }

    timeoutId = setTimeout(() => {
      if (!bestPosition) {
        finish(
          reject,
          new Error(
            "Lokasi belum berhasil diperoleh dalam 30 detik. Aktifkan GPS dan izinkan akses lokasi, lalu coba kembali."
          )
        );
        return;
      }

      const { latitude, longitude, accuracy } =
        bestPosition.coords;

      if (accuracy > MAX_GPS_ACCURACY_METERS) {
        finish(
          reject,
          new Error(
            `Akurasi GPS masih sekitar ${Math.round(
              accuracy
            )} meter setelah 30 detik. Presensi membutuhkan akurasi maksimal ${MAX_GPS_ACCURACY_METERS} meter.`
          )
        );
        return;
      }

      finish(resolve, {
        lintang: Number(latitude),
        bujur: Number(longitude),
        akurasi: Number(accuracy),
      });
    }, GPS_TIMEOUT_MS);
  });

const normalizeAttendanceResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.result?.data)) return response.result.data;

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

const getShiftFromRecord = (record) => {
  if (!record || typeof record !== "object") return null;

  const shift =
    record.shiftKerjaMaster ??
    record.shiftKerja ??
    record.shift ??
    null;

  if (shift && typeof shift === "object") return shift;

  if (record.nama && (record.jamMasuk || record.jamKeluar)) {
    return record;
  }

  return null;
};

const normalizeMethodResponse = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.metodeAktif)) {
    return response.metodeAktif;
  }

  if (Array.isArray(response?.data?.metodeAktif)) {
    return response.data.metodeAktif;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

export default function AbsensiGuruPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [records, setRecords] = useState([]);
  const [assignedShift, setAssignedShift] = useState(null);

  const [loading, setLoading] = useState(true);
  const [shiftLoading, setShiftLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeAction, setActiveAction] = useState("");

  const [error, setError] = useState("");
  const [shiftError, setShiftError] = useState("");
  const [notice, setNotice] = useState("");

  const [keterangan, setKeterangan] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [today, setToday] = useState(() => getToday());

  const [metodeAktif, setMetodeAktif] = useState([]);
  const [metodeTerpilih, setMetodeTerpilih] = useState("");
  const [metodeLoading, setMetodeLoading] = useState(true);
  const [metodeError, setMetodeError] = useState("");

  // State dan ref untuk Face ID
  const [cameraStream, setCameraStream] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setCameraStream(null);
  }, [cameraStream]);

  const startCamera = useCallback(async () => {
    try {
      setCameraError("");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Browser tidak mendukung akses kamera. Gunakan browser yang mendukung kamera."
        );
      }

      // Hentikan stream lama jika kamera dibuka kembali.
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }

      setSnapshot(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("[FACE ID] Gagal membuka kamera:", err);
      setCameraError(
        err?.message ||
          "Kamera tidak dapat diakses. Periksa izin kamera browser."
      );
    }
  }, [cameraStream]);

  const captureSnapshot = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.videoWidth === 0) {
      setCameraError(
        "Kamera belum siap. Tunggu preview wajah muncul, lalu coba lagi."
      );
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("Browser tidak dapat memproses foto kamera.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Gagal mengambil foto. Silakan coba lagi.");
          return;
        }

        const file = new File([blob], "snapshot.jpg", {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        setSnapshot(file);
        setCameraError("");
        setNotice("");
      },
      "image/jpeg",
      0.9
    );
  }, []);

  // Hentikan kamera saat halaman ditutup atau komponen dilepas.
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Hentikan kamera dan bersihkan foto ketika metode bukan Face ID.
  useEffect(() => {
    if (metodeTerpilih !== "face") {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCameraStream(null);
      }

      setSnapshot(null);
      setCameraError("");
    }
  }, [metodeTerpilih, cameraStream]);

  const fetchMetodeAbsensi = useCallback(async () => {
    try {
      setMetodeLoading(true);
      setMetodeError("");

      const response = await getMetodeAbsensiAktif();
      const rawMethods = normalizeMethodResponse(response);

      const normalizedMethods = [
        ...new Set(
          rawMethods
            .map((method) =>
              String(method ?? "").trim().toLowerCase()
            )
            .filter((method) => Boolean(METODE_CONFIG[method]))
        ),
      ];

      setMetodeAktif(normalizedMethods);

      setMetodeTerpilih((current) => {
        if (current && normalizedMethods.includes(current)) {
          return current;
        }

        return normalizedMethods[0] ?? "";
      });

      if (normalizedMethods.length === 0) {
        setMetodeError(
          "Belum ada metode presensi aktif yang tersedia dari konfigurasi sekolah."
        );
      }
    } catch (err) {
      console.error("Gagal mengambil metode presensi:", err);
      setMetodeAktif([]);
      setMetodeTerpilih("");
      setMetodeError(getErrorMessage(err));
    } finally {
      setMetodeLoading(false);
    }
  }, []);

  useEffect(() => {
    const updateToday = () => setToday(getToday());

    updateToday();

    const intervalId = setInterval(updateToday, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchHistory = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      setError("");

      const response = await getRiwayatShiftSaya(1, 100);
      const data = normalizeAttendanceResponse(response);

      const sortedData = [...data].sort(
        (a, b) => getRecordTimestamp(b) - getRecordTimestamp(a)
      );

      setRecords(sortedData);

      setCurrentPage((previousPage) => {
        const maxPage = Math.max(
          1,
          Math.ceil(sortedData.length / PAGE_SIZE)
        );

        return Math.min(previousPage, maxPage);
      });

      const shiftRecord = sortedData.find((record) =>
        Boolean(getShiftFromRecord(record))
      );

      const shift = shiftRecord
        ? getShiftFromRecord(shiftRecord)
        : null;

      setAssignedShift(shift);

      if (!shift) {
        setShiftError(
          "Shift belum tersedia pada data riwayat presensi. Pastikan respons Backend menyertakan informasi shift."
        );
      } else {
        setShiftError("");
      }
    } catch (err) {
      console.error("Gagal mengambil riwayat presensi:", err);

      if (showLoading) {
        setError(getErrorMessage(err));
      }

      setShiftError(getErrorMessage(err));
    } finally {
      if (showLoading) setLoading(false);
      setShiftLoading(false);
    }
  }, []);

  const fetchAssignedShift = useCallback(async () => {
    setShiftLoading(true);
    setShiftError("");

    try {
      const response = await getRiwayatShiftSaya(1, 100);
      const data = normalizeAttendanceResponse(response);

      const shiftRecord = data.find((record) =>
        Boolean(getShiftFromRecord(record))
      );

      const shift = shiftRecord
        ? getShiftFromRecord(shiftRecord)
        : null;

      setAssignedShift(shift);

      if (!shift) {
        setShiftError(
          "Shift belum tersedia pada data riwayat presensi. Pastikan respons Backend menyertakan informasi shift."
        );
      }
    } catch (err) {
      console.error(
        "Gagal mengambil shift dari riwayat presensi:",
        err
      );

      setAssignedShift(null);
      setShiftError(getErrorMessage(err));
    } finally {
      setShiftLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMetodeAbsensi();
  }, [fetchMetodeAbsensi]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
          (a, b) => getRecordTimestamp(b) - getRecordTimestamp(a)
        ),
    [records, today]
  );

  const todayRecord = todayRecords[0] ?? null;

  const hasCheckedIn = Boolean(todayRecord?.waktuMasuk);
  const hasCheckedOut = Boolean(todayRecord?.waktuKeluar);

  const canCheckIn = !hasCheckedIn;
  const canCheckOut = hasCheckedIn && !hasCheckedOut;

  const displayedShift =
    assignedShift ?? getShiftFromRecord(todayRecord) ?? null;

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

    const izin = records.filter((record) => {
      const status = normalizeText(record?.status);
      return status === "izin";
    }).length;

    const sakit = records.filter((record) => {
      const status = normalizeText(record?.status);
      return status === "sakit";
    }).length;

    const tidakHadir = records.filter((record) => {
      const status = normalizeText(record?.status);
      return status === "alpha" || status === "tidak_hadir" || status === "alpa";
    }).length;

    const selesai = records.filter((record) =>
      Boolean(record?.waktuKeluar)
    ).length;

    return {
      total: records.length,
      hadir,
      terlambat,
      izin,
      sakit,
      tidakHadir,
      selesai,
    };
  }, [records]);

  const handleCheckIn = async () => {
    if (submitting || loading || !canCheckIn) return;

    if (metodeLoading) {
      setError("Sedang memuat konfigurasi metode presensi.");
      return;
    }

    if (
      !metodeTerpilih ||
      !metodeAktif.includes(metodeTerpilih)
    ) {
      setError("Pilih metode presensi yang aktif terlebih dahulu.");
      return;
    }

    // Validasi sebelum meminta konfirmasi atau membaca GPS.
    if (metodeTerpilih === "face" && !snapshot) {
      setError(
        "Ambil foto wajah terlebih dahulu sebelum check-in menggunakan Face ID."
      );
      return;
    }

    if (
      !window.confirm(
        `Lanjutkan check-in menggunakan metode ${
          METODE_CONFIG[metodeTerpilih]?.label ?? metodeTerpilih
        }?`
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setActiveAction("checkin");
      setError("");
      setNotice("");

      let lokasi = null;

      if (METODE_CONFIG[metodeTerpilih]?.requiresLocation) {
        lokasi = await getCurrentLocation();

        if (
          !Number.isFinite(lokasi.lintang) ||
          !Number.isFinite(lokasi.bujur)
        ) {
          throw new Error(
            "Koordinat GPS tidak valid. Coba perbarui lokasi perangkat."
          );
        }
      }

      const payload = {
        status: "hadir",
        metode: metodeTerpilih,
        ...(lokasi
          ? {
              lintang: Number(lokasi.lintang),
              bujur: Number(lokasi.bujur),
            }
          : {}),
        ...(keterangan.trim()
          ? { keterangan: keterangan.trim() }
          : {}),
        ...(metodeTerpilih === "face" && snapshot
          ? { snapshot }
          : {}),
      };

      console.info("[PRESENSI SHIFT] Check-in", {
        status: payload.status,
        metode: payload.metode,
        memilikiSnapshot: Boolean(payload.snapshot),
        ukuranSnapshotByte: payload.snapshot?.size ?? 0,
        lintang: payload.lintang ?? null,
        bujur: payload.bujur ?? null,
        akurasiGPS: lokasi?.akurasi ?? null,
      });

      await checkInShift(payload);

      setNotice(
        lokasi
          ? `Check-in berhasil dicatat menggunakan ${
              METODE_CONFIG[metodeTerpilih]?.label ?? metodeTerpilih
            }. Akurasi GPS ±${Math.round(lokasi.akurasi)} meter.`
          : `Check-in berhasil dicatat menggunakan ${
              METODE_CONFIG[metodeTerpilih]?.label ?? metodeTerpilih
            }.`
      );

      setKeterangan("");
      setSnapshot(null);
      stopCamera();

      await fetchHistory(false);
    } catch (err) {
      console.error("[PRESENSI SHIFT] Check-in gagal:", err);
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
      setActiveAction("");
    }
  };

  const handleCheckOut = async () => {
    if (submitting || loading || !canCheckOut) return;

    if (metodeLoading) {
      setError("Sedang memuat konfigurasi metode presensi.");
      return;
    }

    if (
      !metodeTerpilih ||
      !metodeAktif.includes(metodeTerpilih)
    ) {
      setError("Pilih metode presensi yang aktif terlebih dahulu.");
      return;
    }

    if (
      !window.confirm(
        `Lakukan check-out menggunakan metode ${
          METODE_CONFIG[metodeTerpilih]?.label ?? metodeTerpilih
        }?`
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setActiveAction("checkout");
      setError("");
      setNotice("");

      let lokasi = null;

      if (METODE_CONFIG[metodeTerpilih]?.requiresLocation) {
        lokasi = await getCurrentLocation();
      }

      const payload = {
        metode: metodeTerpilih,
        ...(lokasi
          ? {
              lintang: Number(lokasi.lintang),
              bujur: Number(lokasi.bujur),
            }
          : {}),
        ...(keterangan.trim()
          ? { keterangan: keterangan.trim() }
          : {}),
      };

      console.info("[PRESENSI SHIFT] Check-out", {
        metode: payload.metode,
        lintang: payload.lintang ?? null,
        bujur: payload.bujur ?? null,
        akurasiGPS: lokasi?.akurasi ?? null,
      });

      await checkOutShift(payload);

      setNotice(
        `Check-out berhasil dicatat menggunakan ${
          METODE_CONFIG[metodeTerpilih]?.label ?? metodeTerpilih
        }${
          lokasi
            ? `. Akurasi GPS ±${Math.round(lokasi.akurasi)} meter.`
            : "."
        }`
      );

      setKeterangan("");
      await fetchHistory(false);
    } catch (err) {
      console.error("[PRESENSI SHIFT] Check-out gagal:", err);
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
      setActiveAction("");
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const statusObj = getAttendanceStatus(record);
      const shiftName = getShiftName(record) || "";
      const dateStr = formatDate(record.tanggal ?? record.waktuMasuk ?? record.dibuatPada) || "";
      const ket = record.keterangan || "";

      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        shiftName.toLowerCase().includes(query) ||
        dateStr.toLowerCase().includes(query) ||
        ket.toLowerCase().includes(query) ||
        statusObj.label.toLowerCase().includes(query);

      const statusKey = statusFilter.toLowerCase();
      const rawStatus = normalizeText(record?.status);
      const shiftStatus = normalizeText(record?.statusShift);

      let matchesStatus = true;
      if (statusKey === "hadir") {
        matchesStatus =
          shiftStatus === "tepat_waktu" ||
          shiftStatus === "pulang_cepat" ||
          rawStatus === "hadir";
      } else if (statusKey === "terlambat") {
        matchesStatus =
          shiftStatus === "terlambat" ||
          shiftStatus === "terlambat_dan_pulang_cepat";
      } else if (statusKey === "izin") {
        matchesStatus = rawStatus === "izin";
      } else if (statusKey === "sakit") {
        matchesStatus = rawStatus === "sakit";
      } else if (statusKey === "alpha") {
        matchesStatus =
          rawStatus === "alpha" ||
          rawStatus === "alpa" ||
          rawStatus === "tidak_hadir";
      }

      return matchesSearch && matchesStatus;
    });
  }, [records, searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / PAGE_SIZE)
  );

  const paginatedRecords = filteredRecords.slice(
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

  const selectedMethodInfo = METODE_CONFIG[metodeTerpilih];

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        role="guru"
        active="absensi"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <div className="shrink-0">
          <Header
            role="guru"
            toggleSidebar={() => setIsCollapsed((value) => !value)}
            notifications={[]}
            user={{ name: "Guru", email: "", avatar: "GU" }}
          />
        </div>

        <main className="theme-page min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
            {/* ================= A. HEADER HALAMAN ================= */}
            <section
              className={`theme-card relative overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <div className="pointer-events-none absolute inset-0">
                <div
                  className={`absolute -right-24 -top-24 h-60 w-60 rounded-full ${themePrimarySoft} blur-3xl`}
                />
                <div className="absolute -bottom-28 left-1/3 h-52 w-52 rounded-full bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)] blur-3xl" />
              </div>

              <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                  >
                    <ClipboardCheck size={22} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                        Presensi Saya
                      </h1>
                      <span
                        className={`rounded-full ${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder} border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide`}
                      >
                        Guru
                      </span>
                    </div>

                    <p className="theme-text-secondary mt-1.5 max-w-2xl text-sm leading-6">
                      Kelola kehadiran harian, check-in, dan check-out shift kerja secara real-time.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] text-xs theme-text font-medium">
                    <CalendarDays size={15} className="text-[var(--color-primary)]" />
                    <span>{formatDate(today)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      fetchHistory(true);
                      fetchMetodeAbsensi();
                    }}
                    disabled={loading || shiftLoading || submitting}
                    className={`inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-4 py-2.5 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition hover:opacity-90 sm:w-auto disabled:opacity-50`}
                  >
                    <RefreshCw
                      size={15}
                      className={
                        loading || shiftLoading || metodeLoading
                          ? "animate-spin"
                          : ""
                      }
                    />
                    Perbarui Data
                  </button>
                </div>
              </div>
            </section>

            {/* Alert Error & Notice */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl border theme-danger">
                <CircleAlert size={20} className="shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">
                    Presensi belum berhasil diproses
                  </p>
                  <p className="text-sm mt-1 break-words">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchHistory(true)}
                  disabled={loading || submitting}
                  className="text-sm font-medium hover:opacity-80 disabled:opacity-50"
                >
                  Muat ulang
                </button>
              </div>
            )}

            {notice && (
              <div className="flex items-start gap-3 p-4 rounded-xl border theme-success">
                <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm">{notice}</p>
              </div>
            )}

            {/* ================= B. RINGKASAN STATISTIK ================= */}
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 2xl:grid-cols-6 gap-3 sm:gap-4">
              <div
                className={`theme-card border ${themeNeutralBorder} rounded-xl p-4 ${themeCardShadow} transition duration-200 hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium theme-text-secondary">
                    Total Presensi
                  </span>
                  <div className="p-2 rounded-lg theme-info">
                    <History size={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold theme-text mt-3 tabular-nums">
                  {loading ? "—" : summary.total}
                </p>
                <span className="text-[11px] theme-text-muted mt-1 block">
                  Semua catatan
                </span>
              </div>

              <div
                className={`theme-card border ${themeNeutralBorder} rounded-xl p-4 ${themeCardShadow} transition duration-200 hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium theme-text-secondary">
                    Hadir
                  </span>
                  <div className="p-2 rounded-lg theme-success">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold theme-text mt-3 tabular-nums">
                  {loading ? "—" : summary.hadir}
                </p>
                <span className="text-[11px] theme-text-muted mt-1 block">
                  Tepat waktu / hadir
                </span>
              </div>

              <div
                className={`theme-card border ${themeNeutralBorder} rounded-xl p-4 ${themeCardShadow} transition duration-200 hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium theme-text-secondary">
                    Terlambat
                  </span>
                  <div className="p-2 rounded-lg theme-warning">
                    <Timer size={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold theme-text mt-3 tabular-nums">
                  {loading ? "—" : summary.terlambat}
                </p>
                <span className="text-[11px] theme-text-muted mt-1 block">
                  Lewat jam masuk
                </span>
              </div>

              <div
                className={`theme-card border ${themeNeutralBorder} rounded-xl p-4 ${themeCardShadow} transition duration-200 hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium theme-text-secondary">
                    Izin
                  </span>
                  <div className="p-2 rounded-lg theme-info">
                    <CalendarDays size={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold theme-text mt-3 tabular-nums">
                  {loading ? "—" : summary.izin}
                </p>
                <span className="text-[11px] theme-text-muted mt-1 block">
                  Izin tercatat
                </span>
              </div>

              <div
                className={`theme-card border ${themeNeutralBorder} rounded-xl p-4 ${themeCardShadow} transition duration-200 hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium theme-text-secondary">
                    Sakit
                  </span>
                  <div className="p-2 rounded-lg theme-warning">
                    <Clock3 size={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold theme-text mt-3 tabular-nums">
                  {loading ? "—" : summary.sakit}
                </p>
                <span className="text-[11px] theme-text-muted mt-1 block">
                  Keterangan sakit
                </span>
              </div>

              <div
                className={`theme-card border ${themeNeutralBorder} rounded-xl p-4 ${themeCardShadow} transition duration-200 hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium theme-text-secondary">
                    Tidak Hadir
                  </span>
                  <div className="p-2 rounded-lg theme-danger">
                    <CircleAlert size={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold theme-text mt-3 tabular-nums">
                  {loading ? "—" : summary.tidakHadir}
                </p>
                <span className="text-[11px] theme-text-muted mt-1 block">
                  Alpha / absen
                </span>
              </div>
            </section>

            {/* ================= C. INFORMASI PRESENSI & SHIFT ================= */}
            <section className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3 2xl:grid-cols-3">
              <div
                className={`min-w-0 theme-card border ${themeNeutralBorder} rounded-2xl p-5 sm:p-6 ${themeCardShadow} lg:col-span-2 space-y-6`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b theme-border">
                  <div>
                    <h2 className="text-base font-semibold theme-text">
                      Kehadiran Hari Ini
                    </h2>
                    <p className="text-xs theme-text-muted mt-1">
                      Jam masuk dan pulang mengikuti data Backend.
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-lg text-xs font-semibold ${currentStatus.className}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {currentStatus.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl theme-card-soft border theme-border">
                    <div className="flex items-center gap-2 theme-text-muted">
                      <LogIn size={17} />
                      <span className="text-xs font-medium">Jam Masuk</span>
                    </div>
                    <p className="text-2xl font-semibold theme-text mt-3 tabular-nums">
                      {loading
                        ? "—"
                        : formatTime(todayRecord?.waktuMasuk)}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl theme-card-soft border theme-border">
                    <div className="flex items-center gap-2 theme-text-muted">
                      <LogOut size={17} />
                      <span className="text-xs font-medium">Jam Pulang</span>
                    </div>
                    <p className="text-2xl font-semibold theme-text mt-3 tabular-nums">
                      {loading
                        ? "—"
                        : formatTime(todayRecord?.waktuKeluar)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold theme-text">
                    Metode Presensi
                  </h3>
                  <p className="text-xs theme-text-muted mt-1 mb-3">
                    Metode yang dikonfigurasi oleh sekolah.
                  </p>

                  {metodeLoading ? (
                    <div className="flex items-center gap-2 p-4 rounded-xl border theme-border theme-card">
                      <Loader2
                        size={17}
                        className="animate-spin text-[var(--color-primary)]"
                      />
                      <span className="text-sm theme-text-secondary">
                        Memuat metode presensi...
                      </span>
                    </div>
                  ) : metodeError ? (
                    <div className="flex items-start gap-2 p-4 rounded-xl border theme-warning">
                      <CircleAlert
                        size={18}
                        className="shrink-0 mt-0.5"
                      />
                      <p className="text-sm">{metodeError}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {metodeAktif.map((methodValue) => {
                        const method = METODE_CONFIG[methodValue];
                        if (!method) return null;

                        const Icon = method.icon;
                        const selected = metodeTerpilih === method.value;

                        return (
                          <button
                            key={method.value}
                            type="button"
                            onClick={() => {
                              setMetodeTerpilih(method.value);
                              setError("");
                              setNotice("");
                            }}
                            disabled={submitting}
                            aria-pressed={selected}
                            className={`text-left p-4 rounded-xl border transition disabled:opacity-50 ${
                              selected
                                ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)] theme-card"
                                : "theme-border theme-card hover:border-[var(--color-primary)]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2.5 rounded-lg theme-primary">
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
                  )}

                  {/* UI kamera hanya tampil saat Face ID dipilih */}
                  {metodeTerpilih === "face" && (
                    <div className="mt-4 p-4 rounded-xl border theme-border theme-card-soft space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg theme-info shrink-0">
                          <Camera size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold theme-text">
                            Verifikasi Wajah
                          </p>
                          <p className="text-xs theme-text-muted mt-1 leading-5">
                            Buka kamera, posisikan wajah di tengah, lalu
                            ambil foto sebelum melakukan check-in.
                          </p>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-xl border theme-border bg-black">
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className="block w-full max-h-[360px] object-contain"
                        />
                      </div>

                      <canvas ref={canvasRef} className="hidden" />

                      {snapshot && (
                        <div className="flex items-start gap-2 p-3 rounded-lg border theme-success">
                          <CheckCircle2
                            size={17}
                            className="shrink-0 mt-0.5"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium">
                              Foto wajah berhasil diambil
                            </p>
                            <p className="text-xs mt-1">
                              Ukuran foto:{" "}
                              {Math.max(
                                1,
                                Math.round(snapshot.size / 1024)
                              )}{" "}
                              KB. Foto akan dikirim saat check-in.
                            </p>
                          </div>
                        </div>
                      )}

                      {cameraError && (
                        <div className="flex items-start gap-2 p-3 rounded-lg border theme-danger">
                          <CircleAlert
                            size={17}
                            className="shrink-0 mt-0.5"
                          />
                          <p className="text-sm break-words">
                            {cameraError}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2">
                        {!cameraStream ? (
                          <button
                            type="button"
                            onClick={startCamera}
                            disabled={submitting}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl theme-primary font-semibold text-sm transition disabled:opacity-50"
                          >
                            <Camera size={17} />
                            Buka kamera
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={captureSnapshot}
                              disabled={submitting}
                              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl theme-primary font-semibold text-sm transition disabled:opacity-50"
                            >
                              <Camera size={17} />
                              Ambil foto
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSnapshot(null);
                                setCameraError("");
                                captureSnapshot();
                              }}
                              disabled={submitting}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-secondary font-semibold text-sm transition disabled:opacity-50"
                            >
                              <RotateCcw size={16} />
                              Ambil ulang
                            </button>

                            <button
                              type="button"
                              onClick={stopCamera}
                              disabled={submitting}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-secondary font-semibold text-sm transition disabled:opacity-50"
                            >
                              <CameraOff size={16} />
                              Tutup kamera
                            </button>
                          </>
                        )}
                      </div>

                      {!snapshot && (
                        <p className="text-xs theme-text-muted leading-5">
                          Foto wajib tersedia sebelum check-in dengan
                          metode Face ID. Mengaktifkan kamera saja belum
                          mengambil foto.
                        </p>
                      )}
                    </div>
                  )}

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
                      className="w-full px-4 py-3 rounded-xl border theme-border theme-card theme-text text-sm outline-none resize-y focus:ring-2 focus:ring-[var(--color-primary)] placeholder:text-[var(--color-text-placeholder)]"
                    />
                  </div>

                  <div className="mt-4 p-3.5 rounded-xl border theme-border theme-card-soft flex items-start gap-2.5">
                    <Info
                      size={17}
                      className="theme-text-muted shrink-0 mt-0.5"
                    />

                    <p className="text-xs theme-text-secondary leading-5">
                      {selectedMethodInfo ? (
                        <>
                          Metode terpilih:{" "}
                          <strong>{selectedMethodInfo.label}</strong>.
                          {selectedMethodInfo.requiresLocation
                            ? " GPS perangkat digunakan sesuai validasi Backend."
                            : " Metode akan dikirim ke endpoint presensi Backend."}
                          {metodeTerpilih === "face" &&
                            " Foto wajib diambil terlebih dahulu. Backend akan memverifikasi foto ketika check-in."}
                          {metodeTerpilih === "barcode" &&
                            " Pastikan Backend benar-benar memvalidasi barcode pada endpoint shift."}
                        </>
                      ) : (
                        "Belum ada metode presensi yang dapat dipilih."
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleCheckIn}
                    disabled={
                      loading ||
                      submitting ||
                      metodeLoading ||
                      !metodeTerpilih ||
                      !canCheckIn ||
                      (metodeTerpilih === "face" && !snapshot)
                    }
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl theme-primary font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {activeAction === "checkin" ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <ShieldCheck size={17} />
                    )}

                    {hasCheckedIn
                      ? "Sudah check-in"
                      : activeAction === "checkin"
                        ? "Memproses check-in..."
                        : metodeTerpilih === "face" && !snapshot
                          ? "Ambil foto untuk check-in"
                          : "Check-in"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCheckOut}
                    disabled={
                      loading ||
                      submitting ||
                      metodeLoading ||
                      !metodeTerpilih ||
                      !canCheckOut
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

              <div
                className={`min-w-0 theme-card border ${themeNeutralBorder} rounded-2xl p-5 sm:p-6 ${themeCardShadow} lg:col-span-1 space-y-5`}
              >
                <div className="flex items-start justify-between gap-3 pb-4 border-b theme-border">
                  <div>
                    <h2 className="text-base font-semibold theme-text">
                      Shift Kerja
                    </h2>
                    <p className="text-xs theme-text-muted mt-1">
                      Informasi shift kerja akun Anda.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg theme-info">
                    <CalendarClock size={20} />
                  </div>
                </div>

                {displayedShift ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs theme-text-muted">
                        Nama Shift
                      </p>
                      <p className="text-base font-semibold theme-text mt-1">
                        {getShiftName(displayedShift)}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl theme-card-soft border theme-border">
                      <p className="text-xs theme-text-muted">
                        Jadwal Kerja
                      </p>
                      <p className="text-lg font-semibold theme-text mt-2 tabular-nums">
                        {formatTime(getShiftStart(displayedShift))}
                        {" – "}
                        {formatTime(getShiftEnd(displayedShift))}
                      </p>
                    </div>

                    {displayedShift.id && (
                      <p className="text-xs theme-text-muted">
                        ID shift: {displayedShift.id}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl theme-card-soft border theme-border">
                    <p className="text-sm font-medium theme-text">
                      {shiftLoading
                        ? "Memuat shift kerja..."
                        : "Shift belum tersedia"}
                    </p>

                    <p className="text-xs theme-text-muted mt-2 leading-5">
                      {shiftLoading
                        ? "Sedang memeriksa informasi shift pada data presensi."
                        : shiftError ||
                          "Informasi shift belum tersedia pada riwayat presensi."}
                    </p>

                    {!shiftLoading && (
                      <button
                        type="button"
                        onClick={fetchAssignedShift}
                        className="mt-3 text-sm font-medium text-[var(--color-primary)] hover:opacity-80"
                      >
                        Muat ulang shift
                      </button>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t theme-border space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider theme-text-muted">
                    Ringkasan Hari Ini
                  </span>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="theme-text-secondary">Tanggal</span>
                    <span className="font-medium theme-text">{formatDate(today)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="theme-text-secondary">Status Kerja</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${currentStatus.className}`}>
                      {currentStatus.label}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ================= D. RIWAYAT PRESENSI & E. FILTER ================= */}
            <section
              className={`theme-card border ${themeNeutralBorder} rounded-2xl overflow-hidden ${themeCardShadow}`}
            >
              <div className="p-5 border-b theme-border flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-base font-semibold theme-text">
                    Riwayat Presensi
                  </h2>
                  <p className="text-xs theme-text-muted mt-1">
                    Riwayat check-in dan check-out dari Backend.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative min-w-0 sm:w-64">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none"
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Cari tanggal, shift, status..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border theme-border theme-card theme-text outline-none focus:ring-2 focus:ring-[var(--color-primary)] placeholder:text-[var(--color-text-placeholder)]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter size={14} className="theme-text-muted shrink-0" />
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 text-xs rounded-xl border theme-border theme-card theme-text outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                      <option value="all">Semua Status</option>
                      <option value="hadir">Hadir / Tepat Waktu</option>
                      <option value="terlambat">Terlambat</option>
                      <option value="izin">Izin</option>
                      <option value="sakit">Sakit</option>
                      <option value="alpha">Alpha / Tidak Hadir</option>
                    </select>
                  </div>

                  <span className="text-xs theme-text-muted shrink-0 text-right sm:text-left">
                    {filteredRecords.length} catatan
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto min-w-0">
                <table className="w-full min-w-[950px] border-collapse">
                  <thead>
                    <tr className="border-b theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold theme-text uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold theme-text uppercase tracking-wider">
                        Shift
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold theme-text uppercase tracking-wider">
                        Jam Masuk
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold theme-text uppercase tracking-wider">
                        Jam Pulang
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold theme-text uppercase tracking-wider">
                        Metode
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold theme-text uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold theme-text uppercase tracking-wider">
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
                            {searchTerm || statusFilter !== "all"
                              ? "Tidak ada data presensi yang sesuai dengan filter pencarian."
                              : "Riwayat akan muncul setelah presensi berhasil dicatat."}
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
                            className="theme-table-hover border-t theme-border transition-colors"
                          >
                            <td className="px-5 py-4 text-sm theme-text-secondary whitespace-nowrap">
                              {formatDate(
                                record.tanggal ??
                                  record.waktuMasuk ??
                                  record.dibuatPada
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm theme-text font-medium">
                              {getShiftName(record)}
                            </td>

                            <td className="px-5 py-4 text-sm theme-text-secondary whitespace-nowrap tabular-nums">
                              {formatTime(record.waktuMasuk)}
                            </td>

                            <td className="px-5 py-4 text-sm theme-text-secondary whitespace-nowrap tabular-nums">
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

              {!loading && filteredRecords.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t theme-border theme-card-soft">
                  <p className="text-xs theme-text-muted">
                    Menampilkan{" "}
                    {(currentPage - 1) * PAGE_SIZE + 1}
                    {" – "}
                    {Math.min(
                      currentPage * PAGE_SIZE,
                      filteredRecords.length
                    )}
                    {" dari "}
                    {filteredRecords.length} catatan
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changePage(currentPage - 1)}
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
                      onClick={() => changePage(currentPage + 1)}
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

            {/* Info Footer */}
            <div className="flex items-start gap-3 p-4 rounded-xl border theme-border theme-card">
              <ShieldCheck
                size={18}
                className="theme-text-muted shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm font-medium theme-text">
                  Informasi Presensi
                </p>
                <p className="text-xs theme-text-muted mt-1 leading-5">
                  Riwayat diperbarui otomatis setiap 10 detik saat halaman
                  aktif. Metode presensi mengikuti pengaturan Backend
                  sekolah. Face ID mengirim foto untuk verifikasi Backend.
                  Dukungan barcode tetap bergantung pada validasi endpoint
                  Backend.
                </p>
              </div>
            </div>

            <footer className="text-center text-xs theme-text-muted py-3 border-t theme-border">
              © 2026 SmartSchool • Presensi Guru
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
