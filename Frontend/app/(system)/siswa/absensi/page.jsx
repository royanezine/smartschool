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
  UserCheck,
  X,
  Loader2,
  FileText,
  HeartPulse,
  UserX,
  ScanFace,
  Video,
  ChevronDown,
  History,
} from "lucide-react";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import {
  getAbsensiSaya,
  absenDenganFace,
  absenManual,
} from "../../../services/absensi.service";

import { getKelasSaya } from "../../../services/siswa.service";

/* =========================================================
   GPS
========================================================= */

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (
      typeof navigator === "undefined" ||
      !navigator.geolocation
    ) {
      reject(
        new Error(
          "Browser kamu tidak mendukung fitur lokasi."
        )
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position);
      },
      (error) => {
        let message = "Gagal mendapatkan lokasi.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message =
              "Izin lokasi ditolak. Aktifkan lokasi dan izinkan website ini mengakses GPS.";
            break;

          case error.POSITION_UNAVAILABLE:
            message =
              "Lokasi tidak tersedia. Pastikan GPS perangkat aktif.";
            break;

          case error.TIMEOUT:
            message =
              "Waktu mengambil lokasi habis. Silakan coba lagi.";
            break;

          default:
            message =
              "Gagal mendapatkan lokasi GPS.";
        }

        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  });
}

/* =========================================================
   FORMAT TANGGAL
========================================================= */

function formatTanggal(tanggal) {
  if (!tanggal) {
    return "-";
  }

  const date = new Date(tanggal);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* =========================================================
   FORMAT JAM
========================================================= */

function formatJam(tanggal) {
  if (!tanggal) {
    return "-";
  }

  const date = new Date(tanggal);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================================================
   STATUS LABEL
========================================================= */

function getStatusLabel(status) {
  switch (String(status || "").toLowerCase()) {
    case "hadir":
      return "Hadir";

    case "izin":
      return "Izin";

    case "sakit":
      return "Sakit";

    case "alpha":
      return "Alpha";

    case "alpa":
      return "Alpha";

    default:
      return status || "-";
  }
}

/* =========================================================
   FORMAT NAMA KAMERA
========================================================= */

function getCameraName(device, index) {
  if (!device) {
    return `Kamera ${index + 1}`;
  }

  if (device.label) {
    return device.label;
  }

  return `Kamera ${index + 1}`;
}

/* =========================================================
   CEK KAMERA VIRTUAL
========================================================= */

function isVirtualCamera(device) {
  const label = String(
    device?.label || ""
  ).toLowerCase();

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

/* =========================================================
   PAGE
========================================================= */

export default function AbsensiSiswaPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("absensi");

  const [kelasId, setKelasId] = useState(null);
  const [kelasSaya, setKelasSaya] = useState(null);
  const [loadingKelas, setLoadingKelas] = useState(true);

  const [absensiData, setAbsensiData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingAbsen, setLoadingAbsen] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showIzinForm, setShowIzinForm] = useState(false);
  const [jenisIzin, setJenisIzin] = useState("izin");
  const [keterangan, setKeterangan] = useState("");

  const [locationStatus, setLocationStatus] = useState("idle");
  const [locationText, setLocationText] = useState("");
  const [locationData, setLocationData] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  /* LOAD KELAS */
  const loadKelasSaya = useCallback(async () => {
    try {
      setLoadingKelas(true);
      setError("");
      const response = await getKelasSaya();
      const data =
        response?.data?.data || response?.data || response;
      if (!data?.kelasId) {
        throw new Error("Siswa belum terdaftar di kelas.");
      }
      setKelasSaya(data);
      setKelasId(data.kelasId);
    } catch (err) {
      setKelasId(null);
      setKelasSaya(null);
      setError(
        err?.message || "Gagal mengambil data kelas siswa."
      );
    } finally {
      setLoadingKelas(false);
    }
  }, []);

  /* LOAD ABSENSI */
  const loadAbsensi = useCallback(async () => {
    try {
      setLoadingData(true);
      setError("");
      const response = await getAbsensiSaya();
      let data = [];
      if (Array.isArray(response)) data = response;
      else if (Array.isArray(response?.data)) data = response.data;
      else if (Array.isArray(response?.data?.data))
        data = response.data.data;
      else if (Array.isArray(response?.items)) data = response.items;
      else if (Array.isArray(response?.data?.items))
        data = response.data.items;
      setAbsensiData(data);
    } catch (err) {
      setAbsensiData([]);
      setError(err?.message || "Gagal mengambil data absensi.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadKelasSaya();
    loadAbsensi();
  }, [loadKelasSaya, loadAbsensi]);

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const absensiHariIni = useMemo(() => {
    return absensiData.find((item) => {
      if (!item?.tanggal) return false;
      const itemDate = new Date(item.tanggal);
      if (Number.isNaN(itemDate.getTime())) return false;
      const itemDateString = [
        itemDate.getFullYear(),
        String(itemDate.getMonth() + 1).padStart(2, "0"),
        String(itemDate.getDate()).padStart(2, "0"),
      ].join("-");
      const tanggalSama = itemDateString === todayString;
      const kelasSama = !kelasId || item.kelasId === kelasId;
      return tanggalSama && kelasSama;
    });
  }, [absensiData, kelasId, todayString]);

  const sudahAbsen = Boolean(absensiHariIni);

  const statistikAbsensi = useMemo(() => {
    const total = absensiData.length;
    const hadir = absensiData.filter(
      (item) =>
        String(item?.status || "").toLowerCase() === "hadir"
    ).length;
    const izin = absensiData.filter((item) => {
      const s = String(item?.status || "").toLowerCase();
      return s === "izin" || s === "sakit";
    }).length;
    const alpha = absensiData.filter((item) => {
      const s = String(item?.status || "").toLowerCase();
      return s === "alpha" || s === "alpa";
    }).length;
    return { total, hadir, izin, alpha };
  }, [absensiData]);

  const sortedAbsensiData = useMemo(() => {
    return absensiData.slice().sort(
      (a, b) =>
        new Date(b?.tanggal || b?.dibuatPada || 0).getTime() -
        new Date(a?.tanggal || a?.dibuatPada || 0).getTime()
    );
  }, [absensiData]);

  const calendarYear = currentMonth.getFullYear();
  const calendarMonth = currentMonth.getMonth();
  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(
    calendarYear,
    calendarMonth + 1,
    0
  ).getDate();

  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function hasAttendanceOnDate(date) {
    return absensiData.some((item) => {
      if (!item?.tanggal) return false;
      const d = new Date(item.tanggal);
      if (Number.isNaN(d.getTime())) return false;
      return (
        d.getDate() === date &&
        d.getMonth() === calendarMonth &&
        d.getFullYear() === calendarYear
      );
    });
  }

  const loadCameras = useCallback(async () => {
    try {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.enumerateDevices
      ) {
        throw new Error("Browser tidak mendukung daftar kamera.");
      }
      const devices =
        await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setCameras(videoDevices);
      if (videoDevices.length === 0) {
        setSelectedCameraId("");
        return;
      }
      const selectedStillExists = videoDevices.some(
        (device) => device.deviceId === selectedCameraId
      );
      if (selectedStillExists) return;
      const realCamera = videoDevices.find(
        (device) => !isVirtualCamera(device)
      );
      const firstCamera = realCamera || videoDevices[0];
      setSelectedCameraId(firstCamera.deviceId);
    } catch (err) {
      setCameraError(
        err?.message || "Tidak dapat membaca daftar kamera."
      );
    }
  }, [selectedCameraId]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(
    async (deviceId = null) => {
      try {
        setCameraError("");
        setError("");
        setCameraLoading(true);
        setCameraOpen(true);

        if (
          typeof navigator === "undefined" ||
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {
          throw new Error("Browser tidak mendukung kamera.");
        }

        stopCamera();
        let cameraId = deviceId || selectedCameraId;

        if (!cameraId) {
          const devices =
            await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(
            (device) => device.kind === "videoinput"
          );
          if (videoDevices.length === 0) {
            throw new Error(
              "Kamera tidak ditemukan. Pastikan webcam terhubung."
            );
          }
          const realCamera = videoDevices.find(
            (device) => !isVirtualCamera(device)
          );
          cameraId = (realCamera || videoDevices[0]).deviceId;
          setCameras(videoDevices);
          setSelectedCameraId(cameraId);
        }

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: cameraId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        await loadCameras();
      } catch (err) {
        setCameraError(
          err?.message || "Kamera tidak dapat dibuka."
        );
      } finally {
        setCameraLoading(false);
      }
    },
    [loadCameras, selectedCameraId, stopCamera]
  );

  useEffect(() => {
    loadCameras();
  }, [loadCameras]);

  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices
    ) {
      return;
    }
    const handleDeviceChange = () => loadCameras();
    navigator.mediaDevices.addEventListener(
      "devicechange",
      handleDeviceChange
    );
    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange
      );
    };
  }, [loadCameras]);

  async function handleCameraChange(event) {
    const deviceId = event.target.value;
    setSelectedCameraId(deviceId);
    if (cameraOpen && deviceId) {
      await startCamera(deviceId);
    }
  }

  function closeCamera() {
    stopCamera();
    setCameraOpen(false);
    setCameraError("");
  }

  function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      setCameraError("Kamera belum siap.");
      return;
    }
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError(
        "Kamera belum siap. Tunggu sebentar lalu coba lagi."
      );
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Gagal memproses foto.");
      return;
    }
    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );
    const image = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(image);
    stopCamera();
    setCameraOpen(false);
    setCameraError("");
  }

  async function getLocation() {
    try {
      setLocationStatus("loading");
      setLocationText("Mengambil lokasi GPS terbaru...");
      setLocationData(null);

      const position = await getCurrentLocation();
      const latitude = Number(position?.coords?.latitude);
      const longitude = Number(position?.coords?.longitude);
      const accuracy = Number(position?.coords?.accuracy);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        throw new Error("Koordinat GPS tidak valid.");
      }

      const data = {
        latitude,
        longitude,
        accuracy: Number.isFinite(accuracy) ? accuracy : null,
      };

      setLocationData(data);
      setLocationStatus("success");

      if (Number.isFinite(accuracy)) {
        setLocationText(
          `GPS aktif • Akurasi ±${Math.round(accuracy)} meter`
        );
      } else {
        setLocationText("GPS aktif");
      }

      return { latitude, longitude };
    } catch (err) {
      setLocationStatus("error");
      setLocationData(null);
      setLocationText(err?.message || "Lokasi tidak tersedia.");
      throw err;
    }
  }

  async function handleSubmitAbsen() {
    if (!kelasId) {
      setError(
        "Kelas siswa belum tersedia. Pastikan akun siswa sudah terdaftar di kelas."
      );
      return;
    }
    if (sudahAbsen) {
      setError("Kamu sudah melakukan absensi hari ini.");
      return;
    }
    if (!capturedImage) {
      setError("Silakan ambil foto terlebih dahulu.");
      return;
    }

    try {
      setLoadingAbsen(true);
      setError("");
      setSuccess("");

      const position = await getLocation();
      const response = await fetch(capturedImage);
      if (!response.ok) {
        throw new Error("Gagal memproses foto.");
      }
      const blob = await response.blob();

      await absenDenganFace({
        kelasId,
        snapshot: blob,
        status: "hadir",
        keterangan:
          "Absen masuk melalui verifikasi wajah",
        lintang: position.latitude,
        bujur: position.longitude,
      });

      setSuccess("Absensi berhasil dicatat!");
      setCapturedImage(null);
      setLocationStatus("idle");
      setLocationText("");
      setLocationData(null);
      await loadAbsensi();
    } catch (err) {
      setError(err?.message || "Gagal melakukan absensi.");
    } finally {
      setLoadingAbsen(false);
    }
  }

  async function handleSubmitManual() {
    if (!kelasId) {
      setError("Kelas siswa belum tersedia.");
      return;
    }
    if (sudahAbsen) {
      setError("Kamu sudah melakukan absensi hari ini.");
      return;
    }
    if (!keterangan.trim()) {
      setError("Keterangan wajib diisi.");
      return;
    }

    try {
      setLoadingAbsen(true);
      setError("");
      setSuccess("");

      await absenManual({
        kelasId,
        status: jenisIzin,
        keterangan: keterangan.trim(),
      });

      setSuccess(
        `Pengajuan ${getStatusLabel(
          jenisIzin
        ).toLowerCase()} berhasil dikirim.`
      );
      setKeterangan("");
      setShowIzinForm(false);
      await loadAbsensi();
    } catch (err) {
      setError(err?.message || "Gagal mengirim absensi.");
    } finally {
      setLoadingAbsen(false);
    }
  }

  function resetPhoto() {
    setCapturedImage(null);
    setError("");
    setSuccess("");
    setLocationStatus("idle");
    setLocationText("");
    setLocationData(null);
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">

      <Sidebar
        active="absensi"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={toggleSidebar}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">

        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Siswa",
            email: "siswa@smartschool.com",
            avatar: "SW",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">

          <div className="mx-auto w-full max-w-6xl space-y-5 p-4 sm:p-6 lg:p-8">

            {/* =================================================
                HERO — SIMPLE BLUE PANEL
            ================================================= */}

            <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm">

              <div className="p-6 sm:p-7">

                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-200">
                      Portal Siswa
                    </p>

                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      Absensi
                    </h1>

                    <p className="mt-1.5 text-sm text-blue-100">
                      {formatTanggal(new Date())}
                      <span className="mx-2 text-blue-300">•</span>
                      {formatJam(new Date())}
                    </p>

                  </div>

                  {kelasSaya && (
                    <div className="inline-flex items-center gap-2 self-start rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm sm:self-auto">

                      <UserCheck size={14} />

                      {kelasSaya.nama}

                    </div>
                  )}

                </div>

              </div>

              {/* STATS STRIP */}

              <div className="grid grid-cols-3 border-t border-white/10">

                <div className="px-6 py-4 text-center">

                  <p className="text-xl font-bold text-white sm:text-2xl">
                    {statistikAbsensi.total}
                  </p>

                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-blue-200">
                    Total
                  </p>

                </div>

                <div className="border-x border-white/10 px-6 py-4 text-center">

                  <p className="text-xl font-bold text-white sm:text-2xl">
                    {statistikAbsensi.hadir}
                  </p>

                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-blue-200">
                    Hadir
                  </p>

                </div>

                <div className="px-6 py-4 text-center">

                  <p className="text-xl font-bold text-white sm:text-2xl">
                    {statistikAbsensi.izin +
                      statistikAbsensi.alpha}
                  </p>

                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-blue-200">
                    Izin/Alpha
                  </p>

                </div>

              </div>

            </section>

            {/* =================================================
                TABS + REFRESH
            ================================================= */}

            <div className="flex items-center justify-between border-b border-slate-200">

              <div className="flex gap-5">

                <button
                  type="button"
                  onClick={() => setActiveTab("absensi")}
                  className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition ${
                    activeTab === "absensi"
                      ? "text-blue-700"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >

                  <ScanFace size={16} />

                  Absensi

                  {activeTab === "absensi" && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-blue-600" />
                  )}

                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("histori")}
                  className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition ${
                    activeTab === "histori"
                      ? "text-blue-700"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >

                  <History size={16} />

                  Histori

                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      activeTab === "histori"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {absensiData.length}
                  </span>

                  {activeTab === "histori" && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-blue-600" />
                  )}

                </button>

              </div>

              <button
                type="button"
                onClick={() => {
                  loadKelasSaya();
                  loadAbsensi();
                }}
                disabled={loadingData || loadingKelas}
                className="mb-3 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                <RefreshCw
                  size={13}
                  className={
                    loadingData || loadingKelas
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh

              </button>

            </div>

            {/* =================================================
                ALERTS
            ================================================= */}

            {loadingKelas && (
              <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">

                <Loader2
                  size={18}
                  className="animate-spin text-blue-600"
                />

                <p className="text-sm font-medium text-blue-700">
                  Memuat data kelas siswa...
                </p>

              </div>
            )}

            {!loadingKelas && !kelasId && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4">

                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <div>

                  <h3 className="text-sm font-semibold text-amber-800">
                    Kelas belum tersedia
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-amber-700">
                    Akun siswa belum terdaftar pada kelas.
                    Silakan hubungi admin sekolah.
                  </p>

                </div>

              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/60 p-4">

                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div className="flex-1">

                  <p className="text-sm font-semibold text-red-800">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-1 whitespace-pre-line text-sm text-red-700">
                    {error}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="rounded-lg p-1 text-red-500 transition hover:bg-red-100"
                >

                  <X size={16} />

                </button>

              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">

                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div className="flex-1">

                  <p className="text-sm font-semibold text-emerald-800">
                    Berhasil
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    {success}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => setSuccess("")}
                  className="rounded-lg p-1 text-emerald-500 transition hover:bg-emerald-100"
                >

                  <X size={16} />

                </button>

              </div>
            )}

            {/* =================================================
                TAB ABSENSI
            ================================================= */}

            {activeTab === "absensi" && (
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">

                {/* =================================================
                    KAMERA
                ================================================= */}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                        <ScanFace size={18} />

                      </div>

                      <div>

                        <h2 className="text-sm font-bold text-slate-900">
                          Verifikasi Wajah
                        </h2>

                        <p className="text-xs text-slate-500">
                          Foto wajah & GPS
                        </p>

                      </div>

                    </div>

                    {sudahAbsen && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">

                        <CheckCircle2 size={11} />

                        Sudah Absen

                      </span>
                    )}

                  </div>

                  <div className="p-5">

                    {/* DEVICE PICKER */}

                    <div className="mb-4">

                      <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">

                        <Video size={12} className="text-blue-600" />

                        Pilih Kamera

                      </label>

                      <div className="relative">

                        <select
                          value={selectedCameraId}
                          onChange={handleCameraChange}
                          disabled={cameraLoading || sudahAbsen}
                          className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                        >

                          {cameras.length === 0 ? (
                            <option value="">
                              Kamera belum terdeteksi
                            </option>
                          ) : (
                            cameras.map((camera, index) => (
                              <option
                                key={
                                  camera.deviceId || index
                                }
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
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                      </div>

                    </div>

                    {/* PREVIEW */}

                    {cameraOpen ? (
                      <div className="space-y-3">

                        <div className="relative overflow-hidden rounded-xl bg-slate-900">

                          <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="aspect-video w-full object-cover"
                          />

                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                            <div className="h-56 w-44 rounded-[45%] border-2 border-white/80 shadow-[0_0_0_999px_rgba(0,0,0,0.4)]" />

                          </div>

                          {cameraLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70">

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
                          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                            {cameraError}
                          </div>
                        )}

                        <div className="flex flex-col gap-2 sm:flex-row">

                          <button
                            type="button"
                            onClick={takePhoto}
                            disabled={cameraLoading}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >

                            <Camera size={16} />

                            Ambil Foto

                          </button>

                          <button
                            type="button"
                            onClick={closeCamera}
                            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >

                            <X size={15} />

                            Batal

                          </button>

                        </div>

                      </div>
                    ) : capturedImage ? (
                      <div className="space-y-3">

                        <div className="relative overflow-hidden rounded-xl bg-slate-100">

                          <img
                            src={capturedImage}
                            alt="Preview"
                            className="aspect-video w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={resetPhoto}
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md transition hover:bg-white"
                          >

                            <X size={15} />

                          </button>

                        </div>

                        {/* LOCATION */}

                        <div
                          className={`flex items-start gap-3 rounded-lg border p-3 ${
                            locationStatus === "success"
                              ? "border-emerald-200 bg-emerald-50"
                              : locationStatus === "error"
                              ? "border-red-200 bg-red-50"
                              : locationStatus === "loading"
                              ? "border-blue-200 bg-blue-50"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >

                          <MapPin
                            size={16}
                            className={
                              locationStatus === "success"
                                ? "mt-0.5 shrink-0 text-emerald-600"
                                : locationStatus === "error"
                                ? "mt-0.5 shrink-0 text-red-600"
                                : locationStatus === "loading"
                                ? "mt-0.5 shrink-0 text-blue-600"
                                : "mt-0.5 shrink-0 text-slate-400"
                            }
                          />

                          <div className="min-w-0 flex-1">

                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              Lokasi GPS
                            </p>

                            <p className="mt-0.5 text-xs font-medium text-slate-700">
                              {locationText ||
                                "Diperiksa saat absensi dikirim."}
                            </p>

                            {locationData && (
                              <div className="mt-2 flex gap-3 text-[10px] text-slate-500">

                                <span>

                                  Lat{" "}
                                  <b className="text-slate-700">
                                    {locationData.latitude.toFixed(
                                      5
                                    )}
                                  </b>

                                </span>

                                <span>

                                  Lng{" "}
                                  <b className="text-slate-700">
                                    {locationData.longitude.toFixed(
                                      5
                                    )}
                                  </b>

                                </span>

                              </div>
                            )}

                          </div>

                        </div>

                        {/* SUBMIT */}

                        <div className="flex flex-col gap-2 sm:flex-row">

                          <button
                            type="button"
                            onClick={handleSubmitAbsen}
                            disabled={
                              loadingAbsen ||
                              !kelasId ||
                              sudahAbsen
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >

                            {loadingAbsen ? (
                              <>
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />

                                Memproses...
                              </>
                            ) : sudahAbsen ? (
                              <>
                                <CheckCircle2 size={16} />

                                Sudah Absen
                              </>
                            ) : (
                              <>
                                <UserCheck size={16} />

                                Kirim Absensi
                              </>
                            )}

                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              startCamera(selectedCameraId)
                            }
                            disabled={loadingAbsen || sudahAbsen}
                            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <Camera size={15} />

                            Foto Ulang

                          </button>

                        </div>

                      </div>
                    ) : (
                      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-12 text-center">

                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">

                          <Camera size={26} />

                        </div>

                        <h3 className="text-sm font-bold text-slate-900">
                          Kamera belum dibuka
                        </h3>

                        <p className="mt-1.5 max-w-sm text-xs leading-6 text-slate-500">
                          Pilih kamera, lalu buka untuk memulai
                          verifikasi wajah.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            startCamera(selectedCameraId)
                          }
                          disabled={
                            !kelasId ||
                            sudahAbsen ||
                            cameras.length === 0
                          }
                          className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          <Camera size={16} />

                          {sudahAbsen
                            ? "Sudah Absen"
                            : "Buka Kamera"}

                        </button>

                      </div>
                    )}

                  </div>

                </section>

                {/* =================================================
                    SIDEBAR KANAN
                ================================================= */}

                <aside className="space-y-4">

                  {/* STATUS HARI INI */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">

                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Status Hari Ini
                    </p>

                    <div className="mt-3">

                      {loadingData ? (
                        <div className="flex items-center gap-2.5">

                          <Loader2
                            size={15}
                            className="animate-spin text-blue-600"
                          />

                          <span className="text-xs text-slate-500">
                            Memuat...
                          </span>

                        </div>
                      ) : sudahAbsen ? (
                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">

                            <CheckCircle2 size={18} />

                          </div>

                          <div>

                            <p className="text-sm font-bold text-slate-900">
                              {getStatusLabel(
                                absensiHariIni?.status
                              )}
                            </p>

                            <p className="text-xs text-slate-500">
                              {formatJam(
                                absensiHariIni?.tanggal
                              )}
                            </p>

                          </div>

                        </div>
                      ) : (
                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">

                            <Clock3 size={18} />

                          </div>

                          <div>

                            <p className="text-sm font-bold text-slate-900">
                              Belum Absen
                            </p>

                            <p className="text-xs text-slate-500">
                              Silakan lakukan absensi
                            </p>

                          </div>

                        </div>
                      )}

                    </div>

                  </div>

                  {/* KALENDER */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">

                    <div className="flex items-center justify-between">

                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Kalender
                      </p>

                      <CalendarDays
                        size={14}
                        className="text-blue-600"
                      />

                    </div>

                    <div className="mt-3">

                      <div className="flex items-center justify-between">

                        <span className="text-xs font-bold capitalize text-slate-700">
                          {currentMonth.toLocaleDateString(
                            "id-ID",
                            {
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </span>

                        <div className="flex gap-0.5">

                          <button
                            type="button"
                            onClick={() =>
                              setCurrentMonth(
                                new Date(
                                  calendarYear,
                                  calendarMonth - 1,
                                  1
                                )
                              )
                            }
                            className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            aria-label="Sebelumnya"
                          >

                            <ChevronDown
                              size={13}
                              className="rotate-90"
                            />

                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setCurrentMonth(
                                new Date(
                                  calendarYear,
                                  calendarMonth + 1,
                                  1
                                )
                              )
                            }
                            className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            aria-label="Berikutnya"
                          >

                            <ChevronDown
                              size={13}
                              className="-rotate-90"
                            />

                          </button>

                        </div>

                      </div>

                      <div className="mt-2 grid grid-cols-7 gap-0.5 text-center">

                        {["S", "S", "R", "K", "J", "S", "M"].map(
                          (d, i) => (
                            <div
                              key={i}
                              className="py-1 text-[9px] font-bold uppercase text-slate-400"
                            >
                              {d}
                            </div>
                          )
                        )}

                        {calendarDays.map((date, index) => {

                          if (date === null) {
                            return (
                              <div
                                key={`e-${index}`}
                                className="aspect-square"
                              />
                            );
                          }

                          const isToday =
                            date === today.getDate() &&
                            calendarMonth ===
                              today.getMonth() &&
                            calendarYear ===
                              today.getFullYear();

                          const hasAbsen =
                            hasAttendanceOnDate(date);

                          return (
                            <div
                              key={date}
                              className={`flex aspect-square items-center justify-center rounded text-[11px] font-medium ${
                                isToday
                                  ? "bg-blue-600 font-bold text-white"
                                  : hasAbsen
                                  ? "bg-blue-50 font-semibold text-blue-700"
                                  : "text-slate-500"
                              }`}
                            >
                              {date}
                            </div>
                          );
                        })}

                      </div>

                      <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 text-[9px] font-semibold uppercase tracking-widest text-slate-400">

                        <span className="flex items-center gap-1">

                          <span className="h-2 w-2 rounded-sm bg-blue-600" />

                          Hari ini

                        </span>

                        <span className="flex items-center gap-1">

                          <span className="h-2 w-2 rounded-sm bg-blue-100" />

                          Ada absensi

                        </span>

                      </div>

                    </div>

                  </div>

                  {/* IZIN FORM */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">

                    <div className="flex items-start gap-2.5">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                        <FileText size={16} />

                      </div>

                      <div>

                        <h3 className="text-sm font-bold text-slate-900">
                          Ajukan Keterangan
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Izin, sakit, atau alpha
                        </p>

                      </div>

                    </div>

                    {!showIzinForm ? (
                      <button
                        type="button"
                        onClick={() => setShowIzinForm(true)}
                        disabled={!kelasId || sudahAbsen}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        <FileText size={13} />

                        Ajukan Sekarang

                      </button>
                    ) : (
                      <div className="mt-3 space-y-3">

                        <div className="grid grid-cols-3 gap-1.5">

                          <button
                            type="button"
                            onClick={() => setJenisIzin("izin")}
                            className={`rounded-lg border px-2 py-2 text-[11px] font-semibold transition ${
                              jenisIzin === "izin"
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            Izin
                          </button>

                          <button
                            type="button"
                            onClick={() => setJenisIzin("sakit")}
                            className={`rounded-lg border px-2 py-2 text-[11px] font-semibold transition ${
                              jenisIzin === "sakit"
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            Sakit
                          </button>

                          <button
                            type="button"
                            onClick={() => setJenisIzin("alpha")}
                            className={`rounded-lg border px-2 py-2 text-[11px] font-semibold transition ${
                              jenisIzin === "alpha"
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            Alpha
                          </button>

                        </div>

                        <textarea
                          id="keterangan"
                          value={keterangan}
                          onChange={(event) =>
                            setKeterangan(event.target.value)
                          }
                          rows={3}
                          placeholder="Tulis keterangan..."
                          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <div className="flex gap-2">

                          <button
                            type="button"
                            onClick={() => {
                              setShowIzinForm(false);
                              setKeterangan("");
                              setError("");
                            }}
                            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Batal
                          </button>

                          <button
                            type="button"
                            onClick={handleSubmitManual}
                            disabled={
                              loadingAbsen ||
                              !kelasId ||
                              sudahAbsen
                            }
                            className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >

                            {loadingAbsen
                              ? "Kirim..."
                              : "Kirim"}

                          </button>

                        </div>

                      </div>
                    )}

                  </div>

                </aside>

              </div>
            )}

            {/* =================================================
                TAB HISTORI
            ================================================= */}

            {activeTab === "histori" && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                      <History size={18} />

                    </div>

                    <div>

                      <h2 className="text-sm font-bold text-slate-900">
                        Riwayat Absensi
                      </h2>

                      <p className="text-xs text-slate-500">
                        Seluruh data absensi kamu
                      </p>

                    </div>

                  </div>

                  <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600 sm:self-auto">

                    {absensiData.length} Data

                  </span>

                </div>

                <div className="p-5">

                  {loadingData ? (
                    <div className="flex min-h-[240px] flex-col items-center justify-center">

                      <Loader2
                        size={26}
                        className="animate-spin text-blue-600"
                      />

                      <p className="mt-3 text-xs text-slate-500">
                        Memuat riwayat...
                      </p>

                    </div>
                  ) : sortedAbsensiData.length === 0 ? (
                    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">

                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">

                        <History size={24} />

                      </div>

                      <h3 className="mt-4 text-sm font-bold text-slate-800">
                        Belum ada riwayat absensi
                      </h3>

                      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                        Data absensi akan muncul di sini.
                      </p>

                      <button
                        type="button"
                        onClick={() => setActiveTab("absensi")}
                        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >

                        <ScanFace size={13} />

                        Mulai Absensi

                      </button>

                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">

                      {sortedAbsensiData.map((item, index) => {

                        const status = String(
                          item?.status || ""
                        ).toLowerCase();

                        const isHadir = status === "hadir";
                        const isSakit = status === "sakit";
                        const isIzin = status === "izin";
                        const isAlpha =
                          status === "alpha" ||
                          status === "alpa";

                        return (
                          <div
                            key={item?.id || index}
                            className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                          >

                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                isHadir
                                  ? "bg-emerald-50 text-emerald-600"
                                  : isSakit
                                  ? "bg-red-50 text-red-600"
                                  : isIzin
                                  ? "bg-blue-50 text-blue-600"
                                  : isAlpha
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-orange-50 text-orange-600"
                              }`}
                            >

                              {isHadir ? (
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

                                <p className="text-sm font-bold text-slate-900">
                                  {getStatusLabel(item?.status)}
                                </p>

                                {item?.metode && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">

                                    <ScanFace size={10} />

                                    {item.metode}

                                  </span>
                                )}

                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">

                                <span className="flex items-center gap-1">

                                  <CalendarDays size={12} />

                                  {formatTanggal(item?.tanggal)}

                                </span>

                                <span className="flex items-center gap-1">

                                  <Clock3 size={12} />

                                  {formatJam(item?.tanggal)}

                                </span>

                              </div>

                              {item?.keterangan && (
                                <p className="mt-2 text-xs leading-5 text-slate-500">

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

        </main>

      </div>

      <canvas ref={canvasRef} className="hidden" />

    </div>
  );
}