"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Camera,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  CalendarDays,
  Clock3,
  FileText,
  X,
  History,
  UserCheck,
  ChevronDown,
  HeartPulse,
  ScanFace,
  UserX,
  Video,
  Loader2,
  Layers3,
  CalendarCheck,
  CalendarX,
  ClipboardList,
  ShieldCheck,
  Barcode,
  ScanLine,
  Timer,
  AlarmClock,
} from "lucide-react";

import {
  getAbsensiSaya,
  absenDenganFace,
  absenDenganBarcode,
  absenDenganLokasi,
  getMetodeAbsensiAktif,
} from "@/services/absensi.service";

import { getKelasSayaDariAnggota } from "@/services/kelas.service";
import { ajukanIzin, formatIzinErrorMessage } from "@/services/izin.service";
import { apiFetch } from "../../../../lib/api";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_80%,#000))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

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

const themeInfoText = "text-[var(--color-info)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeSuccessText = "text-[var(--color-success)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeWarningText = "text-[var(--color-warning)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const STATUS_LABEL = {
  hadir: "Hadir",
  izin: "Izin",
  sakit: "Sakit",
  alpha: "Alpha",
};

const STATUS_SHIFT_LABEL = {
  tepat_waktu: "Tepat Waktu",
  terlambat: "Terlambat",
  pulang_cepat: "Pulang Cepat",
  terlambat_dan_pulang_cepat: "Terlambat & Pulang Cepat",
};

const METODE_CONFIG = {
  barcode: {
    label: "Barcode",
    description: "Scan atau masukkan kode barcode siswa",
    icon: Barcode,
  },
  face: {
    label: "Face Recognition",
    description: "Verifikasi wajah menggunakan kamera",
    icon: ScanFace,
  },
  lokasi: {
    label: "Lokasi GPS",
    description: "Absensi dengan validasi lokasi sekolah",
    icon: MapPin,
  },
};

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDurasi(menit) {
  const value = Number(menit) || 0;
  if (value <= 0) return "0 menit";

  const jam = Math.floor(value / 60);
  const sisa = value % 60;

  if (jam <= 0) return `${sisa} menit`;

  return sisa > 0 ? `${jam} jam ${sisa} menit` : `${jam} jam`;
}

function getResponseData(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  return [];
}

function getResponseObject(response) {
  if (!response) return null;

  if (
    response?.data &&
    !Array.isArray(response.data) &&
    typeof response.data === "object"
  ) {
    if (
      response.data.data &&
      typeof response.data.data === "object" &&
      !Array.isArray(response.data.data)
    ) {
      return response.data.data;
    }

    return response.data;
  }

  return response;
}

function getErrorMessage(error, fallback) {
  if (error?.status === 429 || error?.statusCode === 429 || error?.response?.status === 429) {
    return "Terlalu banyak percobaan, mohon tunggu sebentar.";
  }
  if (error instanceof Error && error.message) return error.message;
  if (typeof error?.message === "string" && error.message) {
    return error.message;
  }
  if (typeof error?.response?.message === "string") {
    return error.response.message;
  }
  if (typeof error?.data?.message === "string") {
    return error.data.message;
  }

  return fallback;
}

function normalizeAbsensi(item) {
  return {
    id: item?.id,
    tanggal: item?.tanggal || item?.dibuatPada || item?.createdAt,
    status: item?.status || "",
    keterangan: item?.keterangan || "",
    metode: item?.metode || "",
    dibuatPada: item?.dibuatPada || item?.createdAt,
    lintang: item?.lintang,
    bujur: item?.bujur,
    waktuMasuk: item?.waktuMasuk || null,
    waktuKeluar: item?.waktuKeluar || null,
    terlambatMenit: Number(item?.terlambatMenit) || 0,
    statusShift: item?.statusShift || null,
    durasiKerjaMenit: Number(item?.durasiKerjaMenit) || 0,
    durasiJamKerja: Number(item?.durasiJamKerja) || 0,
  };
}

function getCameraName(device, index) {
  if (!device) return `Kamera ${index + 1}`;
  if (device.label) return device.label;
  return `Kamera ${index + 1}`;
}

function isVirtualCamera(device) {
  const label = String(device?.label || "").toLowerCase();

  return (
    label.includes("snap") ||
    label.includes("virtual") ||
    label.includes("obs") ||
    label.includes("droidcam") ||
    label.includes("manycam") ||
    label.includes("xsplit") ||
    label.includes("ndi")
  );
}

function isTerlambat(item) {
  const statusShift = String(item?.statusShift || "").toLowerCase();
  if (statusShift === "terlambat" || statusShift === "terlambat_dan_pulang_cepat") {
    return true;
  }
  return Number(item?.terlambatMenit) > 0;
}

function isTepatWaktu(item) {
  return String(item?.statusShift || "").toLowerCase() === "tepat_waktu";
}

export default function SiswaAbsensiPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const barcodeInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("absensi");
  const [mounted, setMounted] = useState(false);

  const [kelas, setKelas] = useState(null);
  const [absensi, setAbsensi] = useState([]);
  const [metodeAktif, setMetodeAktif] = useState([]);
  const [metodeTerpilih, setMetodeTerpilih] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingAbsen, setLoadingAbsen] = useState(false);
  const [loadingMetode, setLoadingMetode] = useState(true);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");

  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [barcodeData, setBarcodeData] = useState("");

  const [showIzinForm, setShowIzinForm] = useState(false);
  const [jenisIzin, setJenisIzin] = useState("izin");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [bukti, setBukti] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = new Date();
  const todayKey = mounted ? getDateKey(today) : "";

  const loadMetodeAktif = useCallback(async () => {
    try {
      setLoadingMetode(true);

      const aktif = await getMetodeAbsensiAktif();

      const metodeValid = Array.isArray(aktif)
        ? aktif
            .map((item) => String(item).toLowerCase())
            .filter((item) => Object.prototype.hasOwnProperty.call(METODE_CONFIG, item))
        : [];

      setMetodeAktif(metodeValid);

      setMetodeTerpilih((current) => {
        if (current && metodeValid.includes(current)) {
          return current;
        }

        return metodeValid[0] || "";
      });
    } catch (err) {
      console.warn("Gagal cek metode absensi aktif:", err);
      setMetodeAktif([]);
      setMetodeTerpilih("");
    } finally {
      setLoadingMetode(false);
    }
  }, []);

  const barcodeAktif = metodeAktif.includes("barcode");
  const faceAktif = metodeAktif.includes("face");
  const lokasiAktif = metodeAktif.includes("lokasi");

  const loadKelas = useCallback(async () => {
    try {
      const siswaResponse = await apiFetch("/api/siswa/me", {
        method: "GET",
      });

      const siswa = getResponseObject(siswaResponse);

      if (!siswa?.id) {
        throw new Error("Data siswa tidak ditemukan.");
      }

      const kelasSaya = await getKelasSayaDariAnggota(siswa.id);

      if (!kelasSaya) {
        throw new Error("Kelas siswa belum ditemukan.");
      }

      setKelas({
        ...kelasSaya,
        kelasId: kelasSaya?.kelasId || kelasSaya?.id || null,
        nama: kelasSaya?.nama || kelasSaya?.namaKelas || "-",
      });
    } catch (err) {
      setKelas(null);
      setError(
        getErrorMessage(err, "Gagal mengambil data kelas siswa."),
      );
    }
  }, []);

  const loadAbsensi = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAbsensiSaya();
      const data = getResponseData(response);

      setAbsensi(data.map(normalizeAbsensi));
    } catch (err) {
      setError(getErrorMessage(err, "Gagal mengambil data absensi."));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPage = useCallback(async () => {
    setError("");

    await Promise.all([
      loadKelas(),
      loadAbsensi(),
      loadMetodeAktif(),
    ]);
  }, [loadKelas, loadAbsensi, loadMetodeAktif]);

  useEffect(() => {
    if (!mounted) return;

    loadPage();
  }, [mounted, loadPage]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const todayAttendance = useMemo(() => {
    if (!mounted || !todayKey) return undefined;

    return absensi.find((item) => {
      if (!item.tanggal) return false;

      const date = new Date(item.tanggal);

      if (Number.isNaN(date.getTime())) return false;

      return getDateKey(date) === todayKey;
    });
  }, [absensi, todayKey, mounted]);

  const sudahAbsen = Boolean(todayAttendance);

  const todayTerlambat = Boolean(todayAttendance && isTerlambat(todayAttendance));
  const todayTerlambatMenit = todayAttendance?.terlambatMenit || 0;

  const history = useMemo(() => {
    return [...absensi]
      .sort((a, b) => {
        const aT = new Date(a.tanggal || a.dibuatPada || 0).getTime();
        const bT = new Date(b.tanggal || b.dibuatPada || 0).getTime();

        return bT - aT;
      })
      .slice(0, 20);
  }, [absensi]);

  const getStatusLabel = (status) =>
    STATUS_LABEL[String(status || "").toLowerCase()] || status || "-";

  const getStatusShiftLabel = (statusShift) =>
    STATUS_SHIFT_LABEL[String(statusShift || "").toLowerCase()] || null;

  const todayStatusText = sudahAbsen
    ? getStatusLabel(todayAttendance?.status)
    : "Belum Absen";

  const loadCameras = useCallback(async () => {
    try {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.enumerateDevices
      ) {
        return;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();

      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );

      setCameras(videoDevices);

      if (!videoDevices.length) {
        setSelectedCameraId("");
        return;
      }

      const exists = videoDevices.some(
        (device) => device.deviceId === selectedCameraId,
      );

      if (!exists) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }
    } catch (err) {
      setCameraError(
        getErrorMessage(err, "Tidak dapat membaca daftar kamera."),
      );
    }
  }, [selectedCameraId]);

  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices
    ) {
      return;
    }

    loadCameras();

    const handleDeviceChange = () => loadCameras();

    navigator.mediaDevices.addEventListener?.(
      "devicechange",
      handleDeviceChange,
    );

    return () => {
      navigator.mediaDevices.removeEventListener?.(
        "devicechange",
        handleDeviceChange,
      );
    };
  }, [loadCameras]);

  const startCamera = async (deviceId = "") => {
    try {
      setCameraLoading(true);
      setCameraOpen(true);
      setCameraError("");
      setError("");
      setSuccess("");

      if (!faceAktif) {
        throw new Error(
          "Metode Face Recognition sedang dinonaktifkan oleh sekolah.",
        );
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Browser tidak mendukung kamera.");
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const videoConstraints = deviceId
        ? {
            deviceId: { exact: deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        : {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraReady(true);
      setCameraOpen(true);
    } catch (err) {
      setCameraReady(false);
      setCameraOpen(false);

      const message = getErrorMessage(
        err,
        "Kamera tidak dapat digunakan. Pastikan izin kamera sudah diberikan.",
      );

      setCameraError(message);
      setError(message);
    } finally {
      setCameraLoading(false);
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      setCameraError("Kamera belum siap. Tunggu sebentar lalu coba lagi.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("Gagal memproses foto.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Gagal mengambil foto wajah.");
          return;
        }

        setCapturedBlob(blob);
        setCapturedImage(canvas.toDataURL("image/jpeg", 0.9));

        stopCamera();
        setCameraOpen(false);
        setCameraError("");
        setError("");
      },
      "image/jpeg",
      0.9,
    );
  };

  const handleCameraChange = async (event) => {
    const deviceId = event.target.value;

    setSelectedCameraId(deviceId);

    if (cameraOpen && deviceId) {
      await startCamera(deviceId);
    }
  };

  const closeCamera = () => {
    stopCamera();
    setCameraOpen(false);
    setCameraError("");
  };

  const resetPhoto = () => {
    setCapturedBlob(null);
    setCapturedImage(null);
    setError("");
    setSuccess("");
  };

  const handleAbsenFace = async () => {
    try {
      setLoadingAbsen(true);
      setError("");
      setSuccess("");

      if (!faceAktif) {
        throw new Error(
          "Metode Face Recognition sedang dinonaktifkan oleh sekolah.",
        );
      }

      if (!kelas?.kelasId) {
        throw new Error("Data kelas belum tersedia. Silakan refresh halaman.");
      }

      if (sudahAbsen) {
        throw new Error("Anda sudah absen hari ini.");
      }

      if (!capturedBlob) {
        throw new Error("Foto wajah belum diambil.");
      }

      if (!navigator.geolocation) {
        throw new Error("Browser tidak mendukung GPS.");
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });

      await absenDenganFace({
        kelasId: kelas.kelasId,
        snapshot: capturedBlob,
        status: "hadir",
        lintang: position.coords.latitude,
        bujur: position.coords.longitude,
      });

      setSuccess("Absensi Face Recognition berhasil dicatat.");
      setCapturedBlob(null);
      setCapturedImage(null);

      await loadAbsensi();
    } catch (err) {
      let message = getErrorMessage(err, "Gagal melakukan absensi.");

      if (err?.code === 1) {
        message =
          "Izin lokasi ditolak. Aktifkan akses lokasi pada browser.";
      } else if (err?.code === 2) {
        message = "Lokasi tidak tersedia. Periksa GPS perangkat.";
      } else if (err?.code === 3) {
        message = "Pengambilan lokasi terlalu lama. Silakan coba lagi.";
      }

      setError(message);
    } finally {
      setLoadingAbsen(false);
    }
  };

  const handleAbsenBarcode = async (event) => {
    event?.preventDefault();

    try {
      setLoadingAbsen(true);
      setError("");
      setSuccess("");

      if (!barcodeAktif) {
        throw new Error(
          "Metode Barcode sedang dinonaktifkan oleh sekolah.",
        );
      }

      if (!kelas?.kelasId) {
        throw new Error("Data kelas belum tersedia. Silakan refresh halaman.");
      }

      if (sudahAbsen) {
        throw new Error("Anda sudah absen hari ini.");
      }

      const kode = barcodeData.trim();

      if (!kode) {
        throw new Error("Silakan scan atau masukkan kode barcode terlebih dahulu.");
      }

      await absenDenganBarcode({
        kelasId: kelas.kelasId,
        barcodeData: kode,
        status: "hadir",
      });

      setSuccess("Absensi menggunakan barcode berhasil dicatat.");
      setBarcodeData("");

      await loadAbsensi();
    } catch (err) {
      setError(getErrorMessage(err, "Gagal melakukan absensi barcode."));
    } finally {
      setLoadingAbsen(false);
    }
  };

  const handleAbsenLokasi = async () => {
    try {
      setLoadingAbsen(true);
      setError("");
      setSuccess("");

      if (!lokasiAktif) {
        throw new Error(
          "Metode Lokasi GPS sedang dinonaktifkan oleh sekolah.",
        );
      }

      if (!kelas?.kelasId) {
        throw new Error("Data kelas belum tersedia. Silakan refresh halaman.");
      }

      if (sudahAbsen) {
        throw new Error("Anda sudah absen hari ini.");
      }

      if (!navigator.geolocation) {
        throw new Error("Browser tidak mendukung GPS.");
      }

      setLocationLoading(true);

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });

      const koordinat = {
        lintang: position.coords.latitude,
        bujur: position.coords.longitude,
        akurasi: position.coords.accuracy,
      };

      setLocation(koordinat);

      await absenDenganLokasi({
        kelasId: kelas.kelasId,
        status: "hadir",
      });

      setSuccess("Absensi menggunakan lokasi berhasil dicatat.");

      await loadAbsensi();
    } catch (err) {
      let message = getErrorMessage(err, "Gagal melakukan absensi lokasi.");

      if (err?.code === 1) {
        message =
          "Izin lokasi ditolak. Aktifkan akses lokasi pada browser.";
      } else if (err?.code === 2) {
        message = "Lokasi tidak tersedia. Periksa GPS perangkat.";
      } else if (err?.code === 3) {
        message = "Pengambilan lokasi terlalu lama. Silakan coba lagi.";
      }

      setError(message);
    } finally {
      setLocationLoading(false);
      setLoadingAbsen(false);
    }
  };

  const handleSubmitManual = async () => {
    if (!["izin", "sakit"].includes(jenisIzin)) {
      setError("Jenis izin harus sakit atau izin.");
      return;
    }

    if (!tanggalMulai) {
      setError("Tanggal mulai wajib diisi.");
      return;
    }

    if (!tanggalSelesai) {
      setError("Tanggal selesai wajib diisi.");
      return;
    }

    if (tanggalSelesai < tanggalMulai) {
      setError("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }

    const trimmedAlasan = keterangan.trim();
    if (!trimmedAlasan) {
      setError("Alasan wajib diisi.");
      return;
    }

    if (trimmedAlasan.length < 5) {
      setError("Alasan minimal 5 karakter.");
      return;
    }

    try {
      setLoadingAbsen(true);
      setError("");
      setSuccess("");

      await ajukanIzin({
        jenis: jenisIzin,
        tanggalMulai,
        tanggalSelesai,
        alasan: trimmedAlasan,
        bukti,
      });

      setSuccess(
        `Permohonan ${
          jenisIzin === "sakit" ? "sakit" : "izin"
        } berhasil diajukan dan menunggu verifikasi.`,
      );

      setKeterangan("");
      setTanggalMulai("");
      setTanggalSelesai("");
      setJenisIzin("izin");
      setBukti(null);
      setShowIzinForm(false);
    } catch (err) {
      setError(
        formatIzinErrorMessage(
          err,
          getErrorMessage(err, "Gagal mengajukan permohonan izin."),
        ),
      );
    } finally {
      setLoadingAbsen(false);
    }
  };

  const statistikAbsensi = useMemo(() => {
    const total = absensi.length;

    const hadir = absensi.filter(
      (item) => String(item?.status || "").toLowerCase() === "hadir",
    ).length;

    const izin = absensi.filter(
      (item) => String(item?.status || "").toLowerCase() === "izin",
    ).length;

    const sakit = absensi.filter(
      (item) => String(item?.status || "").toLowerCase() === "sakit",
    ).length;

    const alpha = absensi.filter((item) => {
      const status = String(item?.status || "").toLowerCase();
      return status === "alpha" || status === "alpa";
    }).length;

    const hadirItems = absensi.filter(
      (item) => String(item?.status || "").toLowerCase() === "hadir",
    );

    const totalTerlambat = hadirItems.filter(isTerlambat).length;
    const totalTepatWaktu = hadirItems.filter(isTepatWaktu).length;
    const totalMenitTerlambat = hadirItems.reduce(
      (sum, item) => sum + (Number(item?.terlambatMenit) || 0),
      0,
    );

    const persentaseTepatWaktu =
      hadirItems.length > 0
        ? Math.round((totalTepatWaktu / hadirItems.length) * 100)
        : 0;

    return {
      total,
      hadir,
      izin,
      sakit,
      alpha,
      izinSakit: izin + sakit,
      totalTerlambat,
      totalTepatWaktu,
      totalMenitTerlambat,
      persentaseTepatWaktu,
    };
  }, [absensi]);

  const calendarYear = currentMonth.getFullYear();
  const calendarMonth = currentMonth.getMonth();

  const firstDay = new Date(
    calendarYear,
    calendarMonth,
    1,
  ).getDay();

  const daysInMonth = new Date(
    calendarYear,
    calendarMonth + 1,
    0,
  ).getDate();

  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  function getAttendanceOnDate(date) {
    return absensi.find((item) => {
      if (!item?.tanggal) return false;

      const value = new Date(item.tanggal);

      if (Number.isNaN(value.getTime())) return false;

      return (
        value.getDate() === date &&
        value.getMonth() === calendarMonth &&
        value.getFullYear() === calendarYear
      );
    });
  }

  function hasAttendanceOnDate(date) {
    return Boolean(getAttendanceOnDate(date));
  }

  const pilihMetode = (metode) => {
    if (!metodeAktif.includes(metode)) return;

    setMetodeTerpilih(metode);
    setError("");
    setSuccess("");
  };

  return (
    <main className="min-w-0 flex-1 overflow-y-auto theme-page theme-text">
      <div className="w-full space-y-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

        <section
          className={`overflow-hidden rounded-2xl ${themePrimaryGradient} ${themePrimaryShadow}`}
        >
          <div className="p-6 sm:p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/75">
                  Portal Siswa
                </p>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Absensi
                </h1>

                <p className="mt-1.5 text-sm text-white/80">
                  {formatDate(new Date())}
                  <span className="mx-2 opacity-60">•</span>
                  {formatTime(new Date())}
                </p>

                {todayTerlambat && (
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                    <AlarmClock size={12} />
                    Terlambat {formatDurasi(todayTerlambatMenit)} hari ini
                  </div>
                )}
              </div>

              {kelas && (
                <div className="inline-flex items-center gap-2 self-start rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm sm:self-auto">
                  <UserCheck size={14} />
                  {kelas.nama}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-white/15">
            <div className="px-6 py-4 text-center">
              <p className="text-xl font-bold text-white sm:text-2xl">
                {statistikAbsensi.total}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/70">
                Total
              </p>
            </div>

            <div className="border-x border-white/15 px-6 py-4 text-center">
              <p className="text-xl font-bold text-white sm:text-2xl">
                {statistikAbsensi.hadir}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/70">
                Hadir
              </p>
            </div>

            <div className="px-6 py-4 text-center">
              <p className="text-xl font-bold text-white sm:text-2xl">
                {statistikAbsensi.izinSakit + statistikAbsensi.alpha}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/70">
                Izin/Alpha
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-8">
          {[
            {
              label: "Total",
              value: statistikAbsensi.total,
              icon: Layers3,
              tone: "primary",
            },
            {
              label: "Hadir",
              value: statistikAbsensi.hadir,
              icon: CalendarCheck,
              tone: "primary",
            },
            {
              label: "Izin",
              value: statistikAbsensi.izin,
              icon: FileText,
              tone: "primary",
            },
            {
              label: "Sakit",
              value: statistikAbsensi.sakit,
              icon: HeartPulse,
              tone: "primary",
            },
            {
              label: "Alpha",
              value: statistikAbsensi.alpha,
              icon: CalendarX,
              tone: "primary",
            },
            {
              label: "Terlambat",
              value: statistikAbsensi.totalTerlambat,
              subtitle: `${formatDurasi(statistikAbsensi.totalMenitTerlambat)}`,
              icon: AlarmClock,
              tone: "primary",
            },
            {
              label: "Tepat Waktu",
              value: statistikAbsensi.totalTepatWaktu,
              subtitle: `${statistikAbsensi.persentaseTepatWaktu}%`,
              icon: Timer,
              tone: "primary",
            },
          ].map((card) => {
            const Icon = card.icon;

            const toneClass = `${themePrimarySoft} ${themePrimaryText}`;

            return (
              <div
                key={card.label}
                className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl px-4 py-4`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs theme-text-muted">{card.label}</p>
                    <p className="mt-1 text-xl font-bold theme-text">
                      {loading ? "—" : card.value}
                    </p>
                    {card.subtitle && !loading && (
                      <p className="mt-0.5 truncate text-[10px] font-semibold theme-text-placeholder">
                        {card.subtitle}
                      </p>
                    )}
                  </div>

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClass}`}
                  >
                    <Icon size={17} />
                  </div>
                </div>
              </div>
            );
          })}

          <div
            className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl px-4 py-4`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs theme-text-muted">Status hari ini</p>
                <p className="mt-1 truncate text-sm font-bold theme-text">
                  {loading ? "—" : todayStatusText}
                </p>
                {!loading && todayTerlambat && (
                  <p className="mt-0.5 truncate text-[10px] font-semibold text-[var(--color-warning)]">
                    Terlambat {formatDurasi(todayTerlambatMenit)}
                  </p>
                )}
              </div>

              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  sudahAbsen
                    ? todayTerlambat
                      ? `${themeWarningSurface} ${themeWarningText}`
                      : `${themeSuccessSurface} ${themeSuccessText}`
                    : `${themeWarningSurface} ${themeWarningText}`
                }`}
              >
                <ClipboardList size={17} />
              </div>
            </div>
          </div>
        </div>

        <div className={`flex items-center justify-between border-b ${themeDivider}`}>
          <div className="flex gap-5">
            <button
              type="button"
              onClick={() => setActiveTab("absensi")}
              className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition ${
                activeTab === "absensi"
                  ? themePrimaryText
                  : "theme-text-muted hover:text-[var(--color-primary)]"
              }`}
            >
              <ScanFace size={16} />
              Absensi

              {activeTab === "absensi" && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--color-primary)]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("histori")}
              className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition ${
                activeTab === "histori"
                  ? themePrimaryText
                  : "theme-text-muted hover:text-[var(--color-primary)]"
              }`}
            >
              <History size={16} />
              Histori

              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeTab === "histori"
                    ? `${themePrimarySoft} ${themePrimaryText}`
                    : `${themeNeutralSurface} theme-text-muted`
                }`}
              >
                {absensi.length}
              </span>

              {activeTab === "histori" && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--color-primary)]" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={loadPage}
            disabled={loading || loadingMetode}
            className={`mb-3 inline-flex h-9 items-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card px-3 text-xs font-semibold theme-text-secondary transition hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <RefreshCw
              size={13}
              className={loading || loadingMetode ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div
            className={`flex items-start gap-3 rounded-xl border ${themeDangerBorder} ${themeDangerSurface} p-4`}
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0 theme-text" />

            <div className="flex-1">
              <p className="text-sm font-semibold theme-text">
                Terjadi kesalahan
              </p>
              <p className="mt-1 whitespace-pre-line text-sm theme-text-secondary">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className={`rounded-lg p-1 theme-text-muted transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div
            className={`flex items-start gap-3 rounded-xl border ${themeSuccessBorder} ${themeSuccessSurface} p-4`}
          >
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-[var(--color-success)]"
            />

            <div className="flex-1">
              <p className="text-sm font-semibold theme-text">Berhasil</p>
              <p className="mt-1 text-sm theme-text-secondary">{success}</p>
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className={`rounded-lg p-1 theme-text-muted transition ${themeNeutralHover} hover:text-[var(--color-success)]`}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {activeTab === "absensi" && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_380px]">

            <section
              className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <div className={`border-b ${themeDivider} px-5 py-4`}>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                  >
                    <ScanLine size={18} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold theme-text">
                      Pilih Metode Absensi
                    </h2>
                    <p className="text-xs theme-text-muted">
                      Metode mengikuti pengaturan dari admin sekolah.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">

                {loadingMetode && (
                  <div className="flex min-h-[180px] flex-col items-center justify-center">
                    <Loader2
                      size={26}
                      className={`animate-spin ${themePrimaryText}`}
                    />
                    <p className="mt-3 text-xs theme-text-muted">
                      Memuat metode absensi...
                    </p>
                  </div>
                )}

                {!loadingMetode && metodeAktif.length === 0 && (
                  <div
                    className={`flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed ${themeWarningBorder} ${themeWarningSurface} px-6 text-center`}
                  >
                    <AlertCircle
                      size={30}
                      className={themeWarningText}
                    />

                    <h3 className="mt-3 text-sm font-bold theme-text">
                      Belum Ada Metode Absensi Aktif
                    </h3>

                    <p className="mt-1 max-w-sm text-xs leading-6 theme-text-muted">
                      Sekolah belum mengaktifkan metode absensi. Silakan
                      hubungi admin sekolah untuk mengatur metode absensi.
                    </p>

                    <button
                      type="button"
                      onClick={loadMetodeAktif}
                      className={`mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white ${themePrimaryGradient}`}
                    >
                      <RefreshCw size={13} />
                      Cek Kembali
                    </button>
                  </div>
                )}

                {!loadingMetode && metodeAktif.length > 0 && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {metodeAktif.map((metode) => {
                        const config = METODE_CONFIG[metode];
                        if (!config) return null;

                        const Icon = config.icon;
                        const selected = metodeTerpilih === metode;

                        return (
                          <button
                            key={metode}
                            type="button"
                            disabled={sudahAbsen || loadingAbsen}
                            onClick={() => pilihMetode(metode)}
                            className={`relative flex min-h-[125px] flex-col items-start rounded-xl border p-4 text-left transition ${
                              selected
                                ? "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)] ring-2 ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
                                : `${themeNeutralBorder} theme-card hover:border-[color-mix(in_srgb,var(--color-primary)_35%,transparent)]`
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            {selected && (
                              <span className="absolute right-3 top-3 text-[var(--color-primary)]">
                                <CheckCircle2 size={17} />
                              </span>
                            )}

                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                selected
                                  ? `${themePrimaryGradient} text-white`
                                  : `${themeNeutralSurface} theme-text-secondary`
                              }`}
                            >
                              <Icon size={20} />
                            </div>

                            <span className="mt-3 text-sm font-bold theme-text">
                              {config.label}
                            </span>

                            <span className="mt-1 text-[11px] leading-5 theme-text-muted">
                              {config.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {sudahAbsen && (
                      <div
                        className={`flex items-center gap-3 rounded-xl border ${
                          todayTerlambat
                            ? `${themeWarningBorder} ${themeWarningSurface}`
                            : `${themeSuccessBorder} ${themeSuccessSurface}`
                        } p-4`}
                      >
                        {todayTerlambat ? (
                          <AlarmClock
                            size={19}
                            className={themeWarningText}
                          />
                        ) : (
                          <CheckCircle2
                            size={19}
                            className={themeSuccessText}
                          />
                        )}
                        <div>
                          <p className="text-sm font-semibold theme-text">
                            Absensi hari ini sudah tercatat
                          </p>
                          <p className="mt-1 text-xs theme-text-muted">
                            {todayTerlambat
                              ? `Anda tercatat terlambat ${formatDurasi(todayTerlambatMenit)}.`
                              : "Kamu tidak dapat melakukan absensi kembali hari ini."}
                          </p>
                        </div>
                      </div>
                    )}

                    {metodeTerpilih === "barcode" && barcodeAktif && (
                      <div className={`rounded-xl border ${themeNeutralBorder} p-5`}>
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                          >
                            <Barcode size={21} />
                          </div>

                          <div>
                            <h3 className="text-sm font-bold theme-text">
                              Absensi Barcode
                            </h3>
                            <p className="text-xs theme-text-muted">
                              Scan barcode siswa atau masukkan kode secara manual.
                            </p>
                          </div>
                        </div>

                        <form
                          onSubmit={handleAbsenBarcode}
                          className="mt-5 space-y-3"
                        >
                          <label className="block text-xs font-semibold theme-text-secondary">
                            Kode Barcode / NISN
                          </label>

                          <input
                            ref={barcodeInputRef}
                            type="text"
                            value={barcodeData}
                            onChange={(event) =>
                              setBarcodeData(event.target.value)
                            }
                            placeholder="Scan atau masukkan kode barcode..."
                            autoComplete="off"
                            disabled={sudahAbsen || loadingAbsen}
                            className={`theme-input w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                          />

                          <p className="text-[11px] leading-5 theme-text-muted">
                            Jika menggunakan scanner barcode USB, arahkan
                            scanner ke kode siswa. Hasil scan akan masuk ke
                            kolom di atas.
                          </p>

                          <button
                            type="submit"
                            disabled={
                              loadingAbsen ||
                              sudahAbsen ||
                              !kelas?.kelasId ||
                              !barcodeData.trim()
                            }
                            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition ${themePrimaryGradient} hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            {loadingAbsen ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                Memproses...
                              </>
                            ) : (
                              <>
                                <ShieldCheck size={16} />
                                Kirim Absensi Barcode
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    )}

                    {metodeTerpilih === "face" && faceAktif && (
                      <div className={`rounded-xl border ${themeNeutralBorder} p-5`}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                            >
                              <ScanFace size={21} />
                            </div>

                            <div>
                              <h3 className="text-sm font-bold theme-text">
                                Verifikasi Wajah
                              </h3>
                              <p className="text-xs theme-text-muted">
                                Foto wajah dan validasi GPS.
                              </p>
                            </div>
                          </div>

                          {sudahAbsen && (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full ${
                                todayTerlambat
                                  ? `${themeWarningSurface} text-[var(--color-warning)]`
                                  : `${themeSuccessSurface} text-[var(--color-success)]`
                              } px-2.5 py-1 text-[10px] font-bold`}
                            >
                              <CheckCircle2 size={11} />
                              Sudah Absen
                            </span>
                          )}
                        </div>

                        <div className="mt-5">
                          <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest theme-text-muted">
                            <Video size={12} className={themePrimaryText} />
                            Pilih Kamera
                          </label>

                          <div className="relative">
                            <select
                              value={selectedCameraId}
                              onChange={handleCameraChange}
                              disabled={cameraLoading || sudahAbsen}
                              className={`theme-input w-full appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm font-medium outline-none transition ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                              {cameras.length === 0 ? (
                                <option value="">
                                  Kamera belum terdeteksi
                                </option>
                              ) : (
                                cameras.map((camera, index) => (
                                  <option
                                    key={camera.deviceId || index}
                                    value={camera.deviceId}
                                  >
                                    {getCameraName(camera, index)}
                                    {isVirtualCamera(camera)
                                      ? " (Virtual)"
                                      : ""}
                                  </option>
                                ))
                              )}
                            </select>

                            <ChevronDown
                              size={15}
                              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
                            />
                          </div>
                        </div>

                        {cameraOpen ? (
                          <div className="mt-4 space-y-3">
                            <div className="relative overflow-hidden rounded-xl theme-card-soft">
                              <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                onCanPlay={() => setCameraReady(true)}
                                className="aspect-video w-full object-cover"
                              />

                              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="h-56 w-44 rounded-[45%] border-2 border-[color-mix(in_srgb,var(--color-card)_80%,transparent)] shadow-[0_0_0_999px_color-mix(in_srgb,var(--color-text)_42%,transparent)]" />
                              </div>

                              {cameraLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[color-mix(in_srgb,var(--color-text)_70%,transparent)]">
                                  <div className="flex flex-col items-center gap-2 text-white">
                                    <Loader2
                                      size={24}
                                      className="animate-spin"
                                    />
                                    <span className="text-xs">
                                      Membuka kamera...
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {cameraError && (
                              <div
                                className={`rounded-lg border ${themeDangerBorder} ${themeDangerSurface} p-3 text-xs theme-text-secondary`}
                              >
                                {cameraError}
                              </div>
                            )}

                            <div className="flex flex-col gap-2 sm:flex-row">
                              <button
                                type="button"
                                onClick={takePhoto}
                                disabled={cameraLoading || !cameraReady}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition ${themePrimaryGradient} hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60`}
                              >
                                <Camera size={16} />
                                Ambil Foto
                              </button>

                              <button
                                type="button"
                                onClick={closeCamera}
                                className={`flex items-center justify-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card px-4 py-2.5 text-sm font-semibold theme-text-secondary transition ${themeNeutralHover}`}
                              >
                                <X size={15} />
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : capturedImage ? (
                          <div className="mt-4 space-y-3">
                            <div
                              className={`relative overflow-hidden rounded-xl ${themeNeutralSurface}`}
                            >
                              <img
                                src={capturedImage}
                                alt="Preview wajah siswa"
                                className="aspect-video w-full object-cover"
                              />

                              <button
                                type="button"
                                onClick={resetPhoto}
                                className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full theme-card theme-text-secondary ${themeSmallShadow} transition ${themeNeutralHover}`}
                              >
                                <X size={15} />
                              </button>
                            </div>

                            <div
                              className={`flex items-start gap-3 rounded-lg border ${themeInfoBorder} ${themeInfoSurface} p-3`}
                            >
                              <MapPin
                                size={16}
                                className={`mt-0.5 shrink-0 ${themeInfoText}`}
                              />

                              <div>
                                <p className="text-xs font-semibold theme-text">
                                  Validasi Lokasi GPS
                                </p>
                                <p className="mt-1 text-xs leading-5 theme-text-muted">
                                  Lokasi perangkat akan diperiksa ketika
                                  absensi dikirim. Pastikan izin lokasi browser
                                  sudah aktif.
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                              <button
                                type="button"
                                onClick={handleAbsenFace}
                                disabled={
                                  loadingAbsen ||
                                  !kelas?.kelasId ||
                                  sudahAbsen
                                }
                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition ${themePrimaryGradient} hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60`}
                              >
                                {loadingAbsen ? (
                                  <>
                                    <Loader2
                                      size={16}
                                      className="animate-spin"
                                    />
                                    Memproses...
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck size={16} />
                                    Kirim Absensi
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => startCamera(selectedCameraId)}
                                disabled={loadingAbsen || sudahAbsen}
                                className={`flex items-center justify-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card px-4 py-2.5 text-sm font-semibold theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                              >
                                <Camera size={15} />
                                Foto Ulang
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`mt-4 flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed ${themeNeutralBorder} ${themeNeutralSurface} px-6 py-10 text-center`}
                          >
                            <div
                              className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${themePrimarySoft} ${themePrimaryText}`}
                            >
                              <Camera size={26} />
                            </div>

                            <h3 className="text-sm font-bold theme-text">
                              Kamera belum dibuka
                            </h3>

                            <p className="mt-1.5 max-w-sm text-xs leading-6 theme-text-muted">
                              Pilih kamera, lalu buka untuk memulai verifikasi
                              wajah.
                            </p>

                            <button
                              type="button"
                              onClick={() => startCamera(selectedCameraId)}
                              disabled={
                                !kelas?.kelasId ||
                                sudahAbsen ||
                                cameras.length === 0
                              }
                              className={`mt-5 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition ${themePrimaryGradient} hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              <Camera size={16} />
                              {sudahAbsen ? "Sudah Absen" : "Buka Kamera"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {metodeTerpilih === "lokasi" && lokasiAktif && (
                      <div className={`rounded-xl border ${themeNeutralBorder} p-5`}>
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                          >
                            <MapPin size={21} />
                          </div>

                          <div>
                            <h3 className="text-sm font-bold theme-text">
                              Absensi Lokasi GPS
                            </h3>
                            <p className="text-xs theme-text-muted">
                              Gunakan lokasi perangkat untuk melakukan absensi.
                            </p>
                          </div>
                        </div>

                        <div
                          className={`mt-5 rounded-xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
                        >
                          <div className="flex items-start gap-3">
                            <MapPin
                              size={19}
                              className={`mt-0.5 ${themeInfoText}`}
                            />

                            <div>
                              <p className="text-sm font-semibold theme-text">
                                Validasi lokasi sekolah
                              </p>
                              <p className="mt-1 text-xs leading-5 theme-text-muted">
                                Browser akan meminta izin akses lokasi.
                                Backend akan memeriksa apakah lokasi kamu
                                berada dalam radius absensi sekolah.
                              </p>
                            </div>
                          </div>
                        </div>

                        {location && (
                          <div
                            className={`mt-3 rounded-lg border ${themeSuccessBorder} ${themeSuccessSurface} p-3`}
                          >
                            <p className="text-xs font-semibold theme-text">
                              Lokasi perangkat terdeteksi
                            </p>

                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs theme-text-muted">
                              <p>
                                Latitude:{" "}
                                <b className="theme-text">
                                  {location.lintang.toFixed(6)}
                                </b>
                              </p>

                              <p>
                                Longitude:{" "}
                                <b className="theme-text">
                                  {location.bujur.toFixed(6)}
                                </b>
                              </p>

                              <p>
                                Akurasi:{" "}
                                <b className="theme-text">
                                  ±{Math.round(location.akurasi)} meter
                                </b>
                              </p>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleAbsenLokasi}
                          disabled={
                            loadingAbsen ||
                            locationLoading ||
                            !kelas?.kelasId ||
                            sudahAbsen
                          }
                          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition ${themePrimaryGradient} hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {loadingAbsen || locationLoading ? (
                            <>
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                              Memeriksa Lokasi...
                            </>
                          ) : sudahAbsen ? (
                            <>
                              <CheckCircle2 size={16} />
                              Sudah Absen
                            </>
                          ) : (
                            <>
                              <MapPin size={16} />
                              Absen dengan Lokasi
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>

            <aside className="space-y-4">

              <div
                className={`theme-card rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest theme-text-placeholder">
                  Status Hari Ini
                </p>

                <div className="mt-3">
                  {loading ? (
                    <div className="flex items-center gap-2.5">
                      <Loader2
                        size={15}
                        className={`animate-spin ${themePrimaryText}`}
                      />
                      <span className="text-xs theme-text-muted">
                        Memuat...
                      </span>
                    </div>
                  ) : sudahAbsen ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            todayTerlambat
                              ? `${themeWarningSurface} text-[var(--color-warning)]`
                              : `${themeSuccessSurface} text-[var(--color-success)]`
                          }`}
                        >
                          {todayTerlambat ? (
                            <AlarmClock size={18} />
                          ) : (
                            <CheckCircle2 size={18} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-bold theme-text">
                            {getStatusLabel(todayAttendance?.status)}
                          </p>
                          <p className="text-xs theme-text-muted">
                            {formatTime(
                              todayAttendance?.waktuMasuk ||
                                todayAttendance?.tanggal,
                            )}
                          </p>
                        </div>
                      </div>

                      {todayTerlambat ? (
                        <div
                          className={`rounded-lg border ${themeWarningBorder} ${themeWarningSurface} px-3 py-2`}
                        >
                          <p className="text-[11px] font-semibold text-[var(--color-warning)]">
                            Terlambat {formatDurasi(todayTerlambatMenit)}
                          </p>
                        </div>
                      ) : (
                        <div
                          className={`rounded-lg border ${themeSuccessBorder} ${themeSuccessSurface} px-3 py-2`}
                        >
                          <p className="text-[11px] font-semibold text-[var(--color-success)]">
                            Tepat Waktu
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeWarningSurface} text-[var(--color-warning)]`}
                      >
                        <Clock3 size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-bold theme-text">
                          Belum Absen
                        </p>
                        <p className="text-xs theme-text-muted">
                          Silakan lakukan absensi
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`theme-card rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest theme-text-placeholder">
                    Ringkasan Keterlambatan
                  </p>
                  <AlarmClock size={14} className={themeWarningText} />
                </div>

                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs theme-text-muted">
                      Hari terlambat
                    </span>
                    <span className="text-xs font-bold theme-text">
                      {loading ? "—" : `${statistikAbsensi.totalTerlambat} hari`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs theme-text-muted">
                      Total menit
                    </span>
                    <span className="text-xs font-bold theme-text">
                      {loading
                        ? "—"
                        : formatDurasi(statistikAbsensi.totalMenitTerlambat)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs theme-text-muted">
                      Tepat waktu
                    </span>
                    <span className="text-xs font-bold text-[var(--color-success)]">
                      {loading
                        ? "—"
                        : `${statistikAbsensi.persentaseTepatWaktu}%`}
                    </span>
                  </div>

                  <div
                    className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${themeNeutralSurface}`}
                  >
                    <div
                      className="h-full rounded-full bg-[var(--color-success)] transition-all"
                      style={{
                        width: `${statistikAbsensi.persentaseTepatWaktu}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                className={`theme-card rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest theme-text-placeholder">
                    Kalender
                  </p>
                  <CalendarDays size={14} className={themePrimaryText} />
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold capitalize theme-text-secondary">
                      {currentMonth.toLocaleDateString("id-ID", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>

                    <div className="flex gap-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentMonth(
                            new Date(
                              calendarYear,
                              calendarMonth - 1,
                              1,
                            ),
                          )
                        }
                        className={`rounded p-1 theme-text-placeholder transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                        aria-label="Sebelumnya"
                      >
                        <ChevronDown size={13} className="rotate-90" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentMonth(
                            new Date(
                              calendarYear,
                              calendarMonth + 1,
                              1,
                            ),
                          )
                        }
                        className={`rounded p-1 theme-text-placeholder transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                        aria-label="Berikutnya"
                      >
                        <ChevronDown size={13} className="-rotate-90" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-7 gap-0.5 text-center">
                    {["M", "S", "S", "R", "K", "J", "S"].map(
                      (day, index) => (
                        <div
                          key={`${day}-${index}`}
                          className="py-1 text-[9px] font-bold uppercase theme-text-placeholder"
                        >
                          {day}
                        </div>
                      ),
                    )}

                    {calendarDays.map((date, index) => {
                      if (date === null) {
                        return (
                          <div
                            key={`empty-${index}`}
                            className="aspect-square"
                          />
                        );
                      }

                      const isCurrentDay =
                        date === today.getDate() &&
                        calendarMonth === today.getMonth() &&
                        calendarYear === today.getFullYear();

                      const dayAttendance = getAttendanceOnDate(date);
                      const hasAbsen = Boolean(dayAttendance);
                      const dayTerlambat = dayAttendance
                        ? isTerlambat(dayAttendance)
                        : false;

                      return (
                        <div
                          key={date}
                          title={
                            dayTerlambat
                              ? `Terlambat ${formatDurasi(
                                  dayAttendance?.terlambatMenit,
                                )}`
                              : undefined
                          }
                          className={`flex aspect-square items-center justify-center rounded text-[11px] font-medium ${
                            isCurrentDay
                              ? `${themePrimaryGradient} font-bold text-white`
                              : dayTerlambat
                                ? `${themeWarningSurface} font-semibold text-[var(--color-warning)]`
                                : hasAbsen
                                  ? `${themePrimarySoft} font-semibold ${themePrimaryText}`
                                  : "theme-text-muted"
                          }`}
                        >
                          {date}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] theme-text-placeholder">
                    <span className="flex items-center gap-1">
                      <span className={`inline-block h-2 w-2 rounded ${themePrimarySoft}`} />
                      Hadir
                    </span>
                    <span className="flex items-center gap-1">
                      <span className={`inline-block h-2 w-2 rounded ${themeWarningSurface}`} />
                      Terlambat
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`theme-card rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                  >
                    <FileText size={16} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold theme-text">
                      Ajukan Keterangan
                    </h3>
                    <p className="mt-0.5 text-xs theme-text-muted">
                      Izin atau sakit
                    </p>
                  </div>
                </div>

                {!showIzinForm ? (
                  <button
                    type="button"
                    onClick={() => setShowIzinForm(true)}
                    disabled={!kelas?.kelasId || sudahAbsen}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card px-3 py-2 text-xs font-semibold theme-text-secondary transition hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <FileText size={13} />
                    Ajukan Sekarang
                  </button>
                ) : (
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-1.5">
                      {["izin", "sakit"].map((jenis) => (
                        <button
                          key={jenis}
                          type="button"
                          onClick={() => setJenisIzin(jenis)}
                          className={`rounded-lg border px-2 py-2 text-[11px] font-semibold capitalize transition ${
                            jenisIzin === jenis
                              ? `${themePrimaryGradient} border-transparent text-white`
                              : `${themeNeutralBorder} theme-card theme-text-secondary ${themeNeutralHover}`
                          }`}
                        >
                          {jenis}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                          Tanggal Mulai
                        </label>

                        <input
                          type="date"
                          value={tanggalMulai}
                          onChange={(event) =>
                            setTanggalMulai(event.target.value)
                          }
                          className={`theme-input w-full rounded-lg border px-3 py-2 text-xs outline-none transition ${themeFocus}`}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                          Tanggal Selesai
                        </label>

                        <input
                          type="date"
                          value={tanggalSelesai}
                          onChange={(event) =>
                            setTanggalSelesai(event.target.value)
                          }
                          className={`theme-input w-full rounded-lg border px-3 py-2 text-xs outline-none transition ${themeFocus}`}
                        />
                      </div>
                    </div>

                    <textarea
                      value={keterangan}
                      onChange={(event) =>
                        setKeterangan(event.target.value)
                      }
                      rows={3}
                      placeholder="Tulis keterangan..."
                      className={`theme-input w-full resize-none rounded-lg border px-3 py-2 text-xs outline-none transition ${themeFocus}`}
                    />

                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                        Bukti Pendukung (Opsional)
                      </label>

                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, application/pdf"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          if (!file) {
                            setBukti(null);
                            return;
                          }

                          const validMimes = [
                            "image/png",
                            "image/jpeg",
                            "image/jpg",
                            "application/pdf",
                          ];
                          const validExtensions = [
                            ".png",
                            ".jpg",
                            ".jpeg",
                            ".pdf",
                          ];
                          const fileName = (file.name || "").toLowerCase();
                          const hasValidExt = validExtensions.some((ext) =>
                            fileName.endsWith(ext)
                          );
                          const hasValidMime =
                            !file.type ||
                            validMimes.includes(file.type.toLowerCase());

                          if (!hasValidExt || !hasValidMime) {
                            setError(
                              "Format file tidak didukung. Hanya JPG, PNG, atau PDF."
                            );
                            setBukti(null);
                            event.target.value = "";
                            return;
                          }

                          if (file.size > 5 * 1024 * 1024) {
                            setError("Ukuran file bukti maksimal 5 MB.");
                            setBukti(null);
                            event.target.value = "";
                            return;
                          }

                          setError("");
                          setBukti(file);
                        }}
                        className="w-full text-xs theme-text-muted"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowIzinForm(false);
                          setKeterangan("");
                          setTanggalMulai("");
                          setTanggalSelesai("");
                          setBukti(null);
                          setError("");
                        }}
                        className={`flex-1 rounded-lg border ${themeNeutralBorder} theme-card px-3 py-2 text-xs font-semibold theme-text-secondary transition ${themeNeutralHover}`}
                      >
                        Batal
                      </button>

                      <button
                        type="button"
                        onClick={handleSubmitManual}
                        disabled={
                          loadingAbsen || !kelas?.kelasId || sudahAbsen
                        }
                        className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold text-white transition ${themePrimaryGradient} hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {loadingAbsen ? "Kirim..." : "Kirim"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}

        {activeTab === "histori" && (
          <div
            className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
          >
            <div
              className={`flex flex-col gap-3 border-b ${themeDivider} px-5 py-4 sm:flex-row sm:items-center sm:justify-between`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                >
                  <History size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-bold theme-text">
                    Riwayat Absensi
                  </h2>
                  <p className="text-xs theme-text-muted">
                    Seluruh data absensi kamu
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                {statistikAbsensi.totalTerlambat > 0 && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full ${themeWarningSurface} px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-warning)]`}
                  >
                    <AlarmClock size={11} />
                    {statistikAbsensi.totalTerlambat} Terlambat
                  </span>
                )}

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full ${themeNeutralSurface} px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest theme-text-secondary`}
                >
                  {absensi.length} Data
                </span>
              </div>
            </div>

            <div className="overflow-x-auto p-5">
              {loading ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center">
                  <Loader2
                    size={26}
                    className={`animate-spin ${themePrimaryText}`}
                  />
                  <p className="mt-3 text-xs theme-text-muted">
                    Memuat riwayat...
                  </p>
                </div>
              ) : history.length === 0 ? (
                <div
                  className={`flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed ${themeNeutralBorder} ${themeNeutralSurface} px-6 text-center`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full theme-card theme-text-placeholder ${themeSmallShadow}`}
                  >
                    <History size={24} />
                  </div>

                  <h3 className="mt-4 text-sm font-bold theme-text">
                    Belum ada riwayat absensi
                  </h3>

                  <p className="mt-1 max-w-sm text-xs leading-5 theme-text-muted">
                    Data absensi akan muncul di sini.
                  </p>

                  <button
                    type="button"
                    onClick={() => setActiveTab("absensi")}
                    className={`mt-5 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition ${themePrimaryGradient} hover:brightness-95`}
                  >
                    <ScanFace size={13} />
                    Mulai Absensi
                  </button>
                </div>
              ) : (
                <div className={`min-w-[560px] divide-y ${themeDivider}`}>
                  {history.map((item, index) => {
                    const status = String(
                      item?.status || "",
                    ).toLowerCase();

                    const isHadir = status === "hadir";
                    const isSakit = status === "sakit";
                    const isIzin = status === "izin";
                    const isAlpha =
                      status === "alpha" || status === "alpa";

                    const itemTerlambat = isHadir && isTerlambat(item);
                    const itemTerlambatMenit = item?.terlambatMenit || 0;
                    const statusShiftLabel = getStatusShiftLabel(
                      item?.statusShift,
                    );

                    return (
                      <div
                        key={item?.id || index}
                        className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            isHadir && itemTerlambat
                              ? `${themeWarningSurface} text-[var(--color-warning)]`
                              : isHadir
                                ? `${themeSuccessSurface} text-[var(--color-success)]`
                                : isSakit
                                  ? `${themeDangerSurface} theme-text`
                                  : isIzin
                                    ? `${themeInfoSurface} ${themePrimaryText}`
                                    : isAlpha
                                      ? `${themeNeutralSurface} theme-text-secondary`
                                      : `${themeWarningSurface} text-[var(--color-warning)]`
                          }`}
                        >
                          {isHadir && itemTerlambat ? (
                            <AlarmClock size={18} />
                          ) : isHadir ? (
                            <UserCheck size={18} />
                          ) : isSakit ? (
                            <HeartPulse size={18} />
                          ) : isAlpha ? (
                            <UserX size={18} />
                          ) : (
                            <FileText size={18} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold theme-text">
                              {getStatusLabel(item?.status)}
                            </p>

                            {isHadir && itemTerlambat && (
                              <span
                                className={`inline-flex items-center gap-1 rounded-full ${themeWarningSurface} px-2 py-0.5 text-[10px] font-bold text-[var(--color-warning)]`}
                              >
                                <AlarmClock size={10} />
                                Terlambat {formatDurasi(itemTerlambatMenit)}
                              </span>
                            )}

                            {isHadir && !itemTerlambat && statusShiftLabel && (
                              <span
                                className={`inline-flex items-center gap-1 rounded-full ${themeSuccessSurface} px-2 py-0.5 text-[10px] font-semibold text-[var(--color-success)]`}
                              >
                                <Timer size={10} />
                                {statusShiftLabel}
                              </span>
                            )}

                            {item?.metode && (
                              <span
                                className={`inline-flex items-center gap-1 rounded-full ${themeNeutralSurface} px-2 py-0.5 text-[10px] font-semibold theme-text-muted`}
                              >
                                <ScanFace size={10} />
                                {METODE_CONFIG[
                                  String(item.metode).toLowerCase()
                                ]?.label || item.metode}
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs theme-text-muted">
                            <span className="flex items-center gap-1">
                              <CalendarDays size={12} />
                              {formatDate(item?.tanggal)}
                            </span>

                            <span className="flex items-center gap-1">
                              <Clock3 size={12} />
                              {formatTime(
                                item?.waktuMasuk || item?.tanggal,
                              )}
                            </span>

                            {item?.durasiJamKerja > 0 && (
                              <span className="flex items-center gap-1">
                                <Timer size={12} />
                                {item.durasiJamKerja} jam
                              </span>
                            )}
                          </div>

                          {item?.keterangan && (
                            <p className="mt-2 text-xs leading-5 theme-text-muted">
                              {item.keterangan}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="h-6" />
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}