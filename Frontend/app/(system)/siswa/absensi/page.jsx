/* app/(system)/siswa/absensi/page.jsx */

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
} from "lucide-react";

import {
  getAbsensiSaya,
  absenDenganFace,
} from "../../../../services/absensi.service";

import {
  getKelasSayaDariAnggota,
} from "../../../../services/kelas.service";

import { ajukanIzin } from "../../../../services/izin.service";
import { apiFetch } from "../../../../lib/api";

/* =========================================================
   THEME COMPATIBILITY
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

/* =========================================================
   STATUS CONSTANT
========================================================= */

const STATUS_LABEL = {
  hadir: "Hadir",
  izin: "Izin",
  sakit: "Sakit",
  alpha: "Alpha",
};

const STATUS_CLASS = {
  hadir:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  izin:
    "bg-blue-50 text-blue-700 border-blue-200",
  sakit:
    "bg-amber-50 text-amber-700 border-amber-200",
  alpha:
    "bg-rose-50 text-rose-700 border-rose-200",
};

/* =========================================================
   DATE HELPER
========================================================= */

function getDateKey(date = new Date()) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

function formatTime(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

/* =========================================================
   RESPONSE HELPER
========================================================= */

function getResponseData(response) {
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

  if (Array.isArray(response?.data?.items)) {
    return response.data.items;
  }

  return [];
}

function getResponseObject(response) {
  if (!response) {
    return null;
  }

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
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  if (
    typeof error?.message === "string" &&
    error.message
  ) {
    return error.message;
  }

  if (
    typeof error?.response?.message === "string"
  ) {
    return error.response.message;
  }

  if (
    typeof error?.data?.message === "string"
  ) {
    return error.data.message;
  }

  return fallback;
}

/* =========================================================
   NORMALIZE ABSENSI
========================================================= */

function normalizeAbsensi(item) {
  return {
    id: item?.id,

    tanggal:
      item?.tanggal ||
      item?.dibuatPada ||
      item?.createdAt,

    status: item?.status || "",

    keterangan:
      item?.keterangan || "",

    metode:
      item?.metode || "",

    dibuatPada:
      item?.dibuatPada ||
      item?.createdAt,

    lintang: item?.lintang,

    bujur: item?.bujur,
  };
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

export default function SiswaAbsensiPage() {
  /* =======================================================
     REF
  ======================================================= */

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  /* =======================================================
     UI STATE
  ======================================================= */

  const [activeTab, setActiveTab] =
    useState("absensi");

  const [mounted, setMounted] =
    useState(false);

  /* =======================================================
     DATA STATE
  ======================================================= */

  const [kelas, setKelas] =
    useState(null);

  const [absensi, setAbsensi] =
    useState([]);

  /* =======================================================
     LOADING STATE
  ======================================================= */

  const [loading, setLoading] =
    useState(true);

  const [loadingAbsen, setLoadingAbsen] =
    useState(false);

  const [cameraReady, setCameraReady] =
    useState(false);

  const [cameraLoading, setCameraLoading] =
    useState(false);

  const [location, setLocation] =
    useState(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  /* =======================================================
     KAMERA STATE
  ======================================================= */

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [cameraError, setCameraError] =
    useState("");

  const [cameras, setCameras] =
    useState([]);

  const [selectedCameraId, setSelectedCameraId] =
    useState("");

  const [capturedImage, setCapturedImage] =
    useState(null);

  /* =======================================================
     LOCATION UI STATE
  ======================================================= */

  const [locationStatus, setLocationStatus] =
    useState("idle");

  const [locationText, setLocationText] =
    useState("");

  const [locationData, setLocationData] =
    useState(null);

  /* =======================================================
     IZIN STATE
  ======================================================= */

  const [showIzinForm, setShowIzinForm] =
    useState(false);

  const [jenisIzin, setJenisIzin] =
    useState("izin");

  const [tanggalMulai, setTanggalMulai] =
    useState("");

  const [tanggalSelesai, setTanggalSelesai] =
    useState("");

  const [keterangan, setKeterangan] =
    useState("");

  const [bukti, setBukti] =
    useState(null);

  /* =======================================================
     MESSAGE STATE
  ======================================================= */

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* =======================================================
     MOUNT
  ======================================================= */

  useEffect(() => {
    setMounted(true);
  }, []);

  /* =======================================================
     TODAY
  ======================================================= */

  const today = new Date();

  const todayKey = mounted
    ? getDateKey(today)
    : "";

  /* =======================================================
     AMBIL DATA KELAS SISWA
  ======================================================= */

  const loadKelas =
    useCallback(async () => {
      try {
        const siswaResponse =
          await apiFetch(
            "/api/v1/siswa/me",
            {
              method: "GET",
            }
          );

        const siswa =
          getResponseObject(
            siswaResponse
          );

        if (!siswa?.id) {
          throw new Error(
            "Data siswa tidak ditemukan."
          );
        }

        const kelasSaya =
          await getKelasSayaDariAnggota(
            siswa.id
          );

        if (!kelasSaya) {
          throw new Error(
            "Kelas siswa belum ditemukan."
          );
        }

        setKelas({
          ...kelasSaya,

          kelasId:
            kelasSaya?.kelasId ||
            kelasSaya?.id ||
            null,

          nama:
            kelasSaya?.nama ||
            kelasSaya?.namaKelas ||
            "-",
        });
      } catch (err) {
        setKelas(null);

        setError(
          getErrorMessage(
            err,
            "Gagal mengambil data kelas siswa."
          )
        );
      }
    }, []);

  /* =======================================================
     AMBIL HISTORI ABSENSI
  ======================================================= */

  const loadAbsensi =
    useCallback(async () => {
      try {
        setLoading(true);

        const response =
          await getAbsensiSaya();

        const data =
          getResponseData(
            response
          );

        setAbsensi(
          data.map(
            normalizeAbsensi
          )
        );
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Gagal mengambil data absensi."
          )
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /* =======================================================
     LOAD SEMUA DATA
  ======================================================= */

  const loadPage =
    useCallback(async () => {
      setError("");

      await Promise.all([
        loadKelas(),
        loadAbsensi(),
      ]);
    }, [
      loadKelas,
      loadAbsensi,
    ]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    loadPage();
  }, [
    mounted,
    loadPage,
  ]);

  /* =======================================================
     CLEANUP CAMERA
  ======================================================= */

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });
      }
    };
  }, []);

  /* =======================================================
     ABSENSI HARI INI
  ======================================================= */

  const todayAttendance =
    useMemo(() => {
      if (
        !mounted ||
        !todayKey
      ) {
        return undefined;
      }

      return absensi.find(
        (item) => {
          if (!item.tanggal) {
            return false;
          }

          const date =
            new Date(
              item.tanggal
            );

          if (
            Number.isNaN(
              date.getTime()
            )
          ) {
            return false;
          }

          return (
            getDateKey(date) ===
            todayKey
          );
        }
      );
    }, [
      absensi,
      todayKey,
      mounted,
    ]);

  /* =======================================================
     HISTORI
  ======================================================= */

  const history =
    useMemo(() => {
      return [...absensi]
        .sort((a, b) => {
          const dateA =
            new Date(
              a.tanggal ||
                a.dibuatPada ||
                0
            ).getTime();

          const dateB =
            new Date(
              b.tanggal ||
                b.dibuatPada ||
                0
            ).getTime();

          return dateB - dateA;
        })
        .slice(0, 20);
    }, [absensi]);

  /* =======================================================
     START CAMERA
  ======================================================= */

  const startCamera =
    async (deviceId = "") => {
      try {
        setCameraLoading(true);
        setCameraOpen(true);
        setCameraError("");
        setError("");
        setSuccess("");

        if (
          !navigator
            .mediaDevices
            ?.getUserMedia
        ) {
          throw new Error(
            "Browser tidak mendukung kamera."
          );
        }

        if (
          streamRef.current
        ) {
          streamRef.current
            .getTracks()
            .forEach(
              (track) =>
                track.stop()
            );
        }

        const videoConstraints =
          deviceId
            ? {
                deviceId: {
                  exact: deviceId,
                },
                width: {
                  ideal: 1280,
                },
                height: {
                  ideal: 720,
                },
              }
            : {
                facingMode: "user",
                width: {
                  ideal: 1280,
                },
                height: {
                  ideal: 720,
                },
              };

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: false,
          });

        streamRef.current =
          stream;

        if (
          videoRef.current
        ) {
          videoRef.current.srcObject =
            stream;

          await videoRef.current.play();
        }

        setCameraReady(true);
        setCameraOpen(true);
      } catch (err) {
        setCameraReady(false);
        setCameraOpen(false);

        const message =
          getErrorMessage(
            err,
            "Kamera tidak dapat digunakan. Pastikan izin kamera sudah diberikan."
          );

        setCameraError(message);
        setError(message);
      } finally {
        setCameraLoading(false);
      }
    };

  /* =======================================================
     STOP CAMERA
  ======================================================= */

  const stopCamera =
    () => {
      if (
        streamRef.current
      ) {
        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

        streamRef.current = null;
      }

      if (
        videoRef.current
      ) {
        videoRef.current.srcObject =
          null;
      }

      setCameraReady(false);
    };

  /* =======================================================
     GPS
  ======================================================= */

  const getLocation =
    async () => {
      if (
        !navigator.geolocation
      ) {
        throw new Error(
          "Browser tidak mendukung GPS."
        );
      }

      setLocationLoading(true);
      setLocationStatus("loading");

      try {
        const position =
          await new Promise(
            (
              resolve,
              reject
            ) => {
              navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                  enableHighAccuracy:
                    true,
                  timeout: 15000,
                  maximumAge: 0,
                }
              );
            }
          );

        const nextLocation =
          {
            lintang:
              position.coords
                .latitude,

            bujur:
              position.coords
                .longitude,

            akurasi:
              position.coords
                .accuracy,
          };

        setLocation(
          nextLocation
        );

        return nextLocation;
      } catch (err) {
        setLocationStatus("error");

        let message =
          "Lokasi GPS tidak dapat diperoleh.";

        if (
          err?.code === 1
        ) {
          message =
            "Izin lokasi ditolak. Aktifkan akses lokasi pada browser untuk melakukan absensi.";
        } else if (
          err?.code === 2
        ) {
          message =
            "Lokasi tidak tersedia. Coba aktifkan GPS lalu ulangi.";
        } else if (
          err?.code === 3
        ) {
          message =
            "Pengambilan lokasi terlalu lama. Silakan coba lagi.";
        }

        throw new Error(
          message
        );
      } finally {
        setLocationLoading(
          false
        );
      }
    };

  /* =======================================================
     CAPTURE SNAPSHOT
  ======================================================= */

  const captureSnapshot =
    () => {
      if (
        !videoRef.current ||
        !canvasRef.current
      ) {
        throw new Error(
          "Kamera belum siap."
        );
      }

      const video =
        videoRef.current;

      const canvas =
        canvasRef.current;

      if (
        !video.videoWidth ||
        !video.videoHeight
      ) {
        throw new Error(
          "Kamera belum siap mengambil foto."
        );
      }

      canvas.width =
        video.videoWidth;

      canvas.height =
        video.videoHeight;

      const context =
        canvas.getContext(
          "2d"
        );

      if (!context) {
        throw new Error(
          "Gagal memproses kamera."
        );
      }

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      return new Promise(
        (
          resolve,
          reject
        ) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(
                  new Error(
                    "Gagal mengambil foto wajah."
                  )
                );

                return;
              }

              resolve(blob);
            },
            "image/jpeg",
            0.9
          );
        }
      );
    };

  /* =======================================================
     HANDLE ABSEN
  ======================================================= */

  const handleAbsen =
    async () => {
      try {
        setLoadingAbsen(true);
        setError("");
        setSuccess("");

        if (
          !kelas?.kelasId
        ) {
          throw new Error(
            "Data kelas belum tersedia. Silakan refresh halaman."
          );
        }

        if (!cameraReady) {
          throw new Error(
            "Kamera belum aktif."
          );
        }

        const currentLocation =
          await getLocation();

        const snapshot =
          await captureSnapshot();

        await absenDenganFace({
          kelasId:
            kelas.kelasId,

          snapshot,

          status: "hadir",

          lintang:
            currentLocation.lintang,

          bujur:
            currentLocation.bujur,
        });

        setSuccess(
          "Absensi berhasil dicatat."
        );

        stopCamera();

        setCameraOpen(false);
        setCapturedImage(null);

        await loadAbsensi();
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Gagal melakukan absensi."
          )
        );
      } finally {
        setLoadingAbsen(false);
      }
    };

  /* =======================================================
     AJUKAN IZIN / SAKIT
  ======================================================= */

  const handleSubmitManual =
    async () => {
      if (!tanggalMulai) {
        setError(
          "Tanggal mulai wajib diisi."
        );

        return;
      }

      if (!tanggalSelesai) {
        setError(
          "Tanggal selesai wajib diisi."
        );

        return;
      }

      if (
        tanggalSelesai <
        tanggalMulai
      ) {
        setError(
          "Tanggal selesai tidak boleh sebelum tanggal mulai."
        );

        return;
      }

      if (
        !keterangan.trim()
      ) {
        setError(
          "Alasan wajib diisi."
        );

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

          alasan:
            keterangan.trim(),

          bukti,
        });

        setSuccess(
          `Permohonan ${
            jenisIzin === "sakit"
              ? "sakit"
              : "izin"
          } berhasil diajukan dan menunggu verifikasi.`
        );

        setKeterangan("");
        setTanggalMulai("");
        setTanggalSelesai("");
        setJenisIzin("izin");
        setBukti(null);
        setShowIzinForm(false);
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Gagal mengajukan permohonan izin."
          )
        );
      } finally {
        setLoadingAbsen(false);
      }
    };

  /* =======================================================
     STATUS
  ======================================================= */

  const getStatusLabel =
    (status) => {
      return (
        STATUS_LABEL[
          String(
            status || ""
          ).toLowerCase()
        ] ||
        status ||
        "-"
      );
    };

  const getTodayStatus =
    () => {
      if (!todayAttendance) {
        return {
          label: "Belum Absen",

          className:
            "bg-slate-100 text-slate-600 border-slate-200",
        };
      }

      return {
        label:
          getStatusLabel(
            todayAttendance.status
          ),

        className:
          STATUS_CLASS[
            String(
              todayAttendance.status ||
                ""
            ).toLowerCase()
          ] ||
          "bg-slate-100 text-slate-600 border-slate-200",
      };
    };

  const todayStatus =
    getTodayStatus();

  /* =======================================================
     THEME / DATA COMPATIBILITY
  ======================================================= */

  const kelasSaya = kelas;

  const kelasId =
    kelasSaya?.kelasId ||
    kelasSaya?.id ||
    null;

  const absensiData =
    absensi;

  const loadingKelas =
    loading;

  const loadingData =
    loading;

  const loadKelasSaya =
    loadKelas;

  const absensiHariIni =
    todayAttendance;

  const sudahAbsen =
    Boolean(todayAttendance);

  const statistikAbsensi =
    useMemo(() => {
      const total =
        absensi.length;

      const hadir =
        absensi.filter(
          (item) =>
            String(
              item?.status || ""
            ).toLowerCase() ===
            "hadir"
        ).length;

      const izin =
        absensi.filter(
          (item) => {
            const status =
              String(
                item?.status || ""
              ).toLowerCase();

            return (
              status === "izin" ||
              status === "sakit"
            );
          }
        ).length;

      const alpha =
        absensi.filter(
          (item) => {
            const status =
              String(
                item?.status || ""
              ).toLowerCase();

            return (
              status === "alpha" ||
              status === "alpa"
            );
          }
        ).length;

      return {
        total,
        hadir,
        izin,
        alpha,
      };
    }, [absensi]);

  /* =======================================================
     CALENDAR
  ======================================================= */

  const [
    currentMonth,
    setCurrentMonth,
  ] = useState(
    () => new Date()
  );

  const calendarYear =
    currentMonth.getFullYear();

  const calendarMonth =
    currentMonth.getMonth();

  const firstDay =
    new Date(
      calendarYear,
      calendarMonth,
      1
    ).getDay();

  const daysInMonth =
    new Date(
      calendarYear,
      calendarMonth + 1,
      0
    ).getDate();

  const calendarDays = [
    ...Array(
      firstDay
    ).fill(null),

    ...Array.from(
      {
        length:
          daysInMonth,
      },
      (_, index) =>
        index + 1
    ),
  ];

  function hasAttendanceOnDate(
    date
  ) {
    return absensiData.some(
      (item) => {
        if (!item?.tanggal) {
          return false;
        }

        const value =
          new Date(
            item.tanggal
          );

        if (
          Number.isNaN(
            value.getTime()
          )
        ) {
          return false;
        }

        return (
          value.getDate() ===
            date &&
          value.getMonth() ===
            calendarMonth &&
          value.getFullYear() ===
            calendarYear
        );
      }
    );
  }

  const sortedAbsensiData =
    history;

  const formatTanggal =
    formatDate;

  const formatJam =
    formatTime;

  /* =======================================================
     CAMERA LIST
  ======================================================= */

  const loadCameras =
    useCallback(async () => {
      try {
        if (
          typeof navigator ===
            "undefined" ||
          !navigator
            .mediaDevices
            ?.enumerateDevices
        ) {
          return;
        }

        const devices =
          await navigator.mediaDevices.enumerateDevices();

        const videoDevices =
          devices.filter(
            (device) =>
              device.kind ===
              "videoinput"
          );

        setCameras(
          videoDevices
        );

        if (
          !videoDevices.length
        ) {
          setSelectedCameraId(
            ""
          );

          return;
        }

        const exists =
          videoDevices.some(
            (device) =>
              device.deviceId ===
              selectedCameraId
          );

        if (!exists) {
          setSelectedCameraId(
            videoDevices[0]
              .deviceId
          );
        }
      } catch (err) {
        setCameraError(
          getErrorMessage(
            err,
            "Tidak dapat membaca daftar kamera."
          )
        );
      }
    }, [
      selectedCameraId,
    ]);

  /* =======================================================
     CAMERA CHANGE
  ======================================================= */

  const handleCameraChange =
    async (event) => {
      const deviceId =
        event.target.value;

      setSelectedCameraId(
        deviceId
      );

      if (
        cameraOpen &&
        deviceId
      ) {
        await startCamera(
          deviceId
        );
      }
    };

  /* =======================================================
     CLOSE CAMERA
  ======================================================= */

  const closeCamera =
    () => {
      stopCamera();

      setCameraOpen(false);
      setCameraError("");
    };

  /* =======================================================
     TAKE PHOTO
  ======================================================= */

  const takePhoto =
    () => {
      const video =
        videoRef.current;

      const canvas =
        canvasRef.current;

      if (
        !video ||
        !canvas ||
        !video.videoWidth ||
        !video.videoHeight
      ) {
        setCameraError(
          "Kamera belum siap. Tunggu sebentar lalu coba lagi."
        );

        return;
      }

      canvas.width =
        video.videoWidth;

      canvas.height =
        video.videoHeight;

      const context =
        canvas.getContext(
          "2d"
        );

      if (!context) {
        setCameraError(
          "Gagal memproses foto."
        );

        return;
      }

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      setCapturedImage(
        canvas.toDataURL(
          "image/jpeg",
          0.9
        )
      );

      stopCamera();
      setCameraOpen(false);
      setCameraError("");
    };

  const handleSubmitAbsen =
    handleAbsen;

  /* =======================================================
     RESET PHOTO
  ======================================================= */

  const resetPhoto =
    () => {
      setCapturedImage(null);
      setError("");
      setSuccess("");
      setLocationStatus(
        "idle"
      );
      setLocationText("");
      setLocationData(null);
    };

  /* =======================================================
     LOAD CAMERA DEVICES
  ======================================================= */

  useEffect(() => {
    if (
      typeof navigator ===
        "undefined" ||
      !navigator.mediaDevices
    ) {
      return;
    }

    loadCameras();

    const handleDeviceChange =
      () =>
        loadCameras();

    navigator.mediaDevices.addEventListener?.(
      "devicechange",
      handleDeviceChange
    );

    return () => {
      navigator.mediaDevices.removeEventListener?.(
        "devicechange",
        handleDeviceChange
      );
    };
  }, [loadCameras]);

  /* =======================================================
     LOCATION UI
  ======================================================= */

  useEffect(() => {
    if (!location) {
      return;
    }

    const accuracy =
      Number(
        location.akurasi
      );

    setLocationData({
      latitude: Number(
        location.lintang
      ),

      longitude: Number(
        location.bujur
      ),

      accuracy:
        Number.isFinite(
          accuracy
        )
          ? accuracy
          : null,
    });

    setLocationStatus(
      "success"
    );

    setLocationText(
      Number.isFinite(
        accuracy
      )
        ? `GPS aktif • Akurasi ±${Math.round(
            accuracy
          )} meter`
        : "GPS aktif"
    );
  }, [location]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="theme-page min-h-full w-full">
      <div className="mx-auto w-full max-w-6xl space-y-5 p-4 sm:p-6 lg:p-8">

        {/* =================================================
            HERO
        ================================================= */}

        <section
          className={`overflow-hidden rounded-2xl ${themePrimaryGradient} ${themePrimaryShadow}`}
        >
          <div className="p-6 sm:p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]">
                  Portal Siswa
                </p>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-card)] sm:text-3xl">
                  Absensi
                </h1>

                <p className="mt-1.5 text-sm text-[color-mix(in_srgb,var(--color-card)_78%,transparent)]">
                  {formatTanggal(
                    new Date()
                  )}

                  <span className="mx-2 opacity-60">
                    •
                  </span>

                  {formatJam(
                    new Date()
                  )}
                </p>
              </div>

              {kelasSaya && (
                <div className="inline-flex items-center gap-2 self-start rounded-lg bg-[color-mix(in_srgb,var(--color-card)_14%,transparent)] px-3 py-2 text-xs font-semibold text-[var(--color-card)] backdrop-blur-sm sm:self-auto">
                  <UserCheck
                    size={14}
                  />

                  {kelasSaya.nama}
                </div>
              )}
            </div>
          </div>

          {/* STATS */}

          <div className="grid grid-cols-3 border-t border-[color-mix(in_srgb,var(--color-card)_14%,transparent)]">

            <div className="px-6 py-4 text-center">
              <p className="text-xl font-bold text-[var(--color-card)] sm:text-2xl">
                {statistikAbsensi.total}
              </p>

              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-[color-mix(in_srgb,var(--color-card)_70%,transparent)]">
                Total
              </p>
            </div>

            <div className="border-x border-[color-mix(in_srgb,var(--color-card)_14%,transparent)] px-6 py-4 text-center">
              <p className="text-xl font-bold text-[var(--color-card)] sm:text-2xl">
                {statistikAbsensi.hadir}
              </p>

              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-[color-mix(in_srgb,var(--color-card)_70%,transparent)]">
                Hadir
              </p>
            </div>

            <div className="px-6 py-4 text-center">
              <p className="text-xl font-bold text-[var(--color-card)] sm:text-2xl">
                {statistikAbsensi.izin +
                  statistikAbsensi.alpha}
              </p>

              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-[color-mix(in_srgb,var(--color-card)_70%,transparent)]">
                Izin/Alpha
              </p>
            </div>

          </div>
        </section>

        {/* =================================================
            TABS
        ================================================= */}

        <div
          className={`flex items-center justify-between border-b ${themeDivider}`}
        >
          <div className="flex gap-5">

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "absensi"
                )
              }
              className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition ${
                activeTab ===
                "absensi"
                  ? themePrimaryText
                  : "theme-text-muted hover:text-[var(--color-primary)]"
              }`}
            >
              <ScanFace
                size={16}
              />

              Absensi

              {activeTab ===
                "absensi" && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--color-primary)]" />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "histori"
                )
              }
              className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition ${
                activeTab ===
                "histori"
                  ? themePrimaryText
                  : "theme-text-muted hover:text-[var(--color-primary)]"
              }`}
            >
              <History
                size={16}
              />

              Histori

              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeTab ===
                  "histori"
                    ? `${themePrimarySoft} ${themePrimaryText}`
                    : `${themeNeutralSurface} theme-text-muted`
                }`}
              >
                {absensiData.length}
              </span>

              {activeTab ===
                "histori" && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--color-primary)]" />
              )}
            </button>

          </div>

          <button
            type="button"
            onClick={() => {
              loadKelasSaya();
              loadAbsensi();
            }}
            disabled={
              loadingData ||
              loadingKelas
            }
            className={`mb-3 inline-flex h-9 items-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card px-3 text-xs font-semibold theme-text-secondary transition hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <RefreshCw
              size={13}
              className={
                loadingData ||
                loadingKelas
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
          <div
            className={`flex items-center gap-3 rounded-xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
          >
            <Loader2
              size={18}
              className={`animate-spin ${themePrimaryText}`}
            />

            <p className="text-sm font-medium theme-text">
              Memuat data kelas siswa...
            </p>
          </div>
        )}

        {!loadingKelas &&
          !kelasId && (
            <div
              className={`flex items-start gap-3 rounded-xl border ${themeWarningBorder} ${themeWarningSurface} p-4`}
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-[var(--color-warning)]"
              />

              <div>
                <h3 className="text-sm font-semibold theme-text">
                  Kelas belum tersedia
                </h3>

                <p className="mt-1 text-sm leading-6 theme-text-secondary">
                  Akun siswa belum
                  terdaftar pada
                  kelas. Silakan
                  hubungi admin
                  sekolah.
                </p>
              </div>
            </div>
          )}

        {error && (
          <div
            className={`flex items-start gap-3 rounded-xl border ${themeDangerBorder} ${themeDangerSurface} p-4`}
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 theme-text"
            />

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
              onClick={() =>
                setError("")
              }
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
              <p className="text-sm font-semibold theme-text">
                Berhasil
              </p>

              <p className="mt-1 text-sm theme-text-secondary">
                {success}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className={`rounded-lg p-1 theme-text-muted transition ${themeNeutralHover} hover:text-[var(--color-success)]`}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =================================================
            TAB ABSENSI
        ================================================= */}

        {activeTab ===
          "absensi" && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">

            {/* KAMERA */}

            <section
              className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <div
                className={`flex items-center justify-between border-b ${themeDivider} px-5 py-4`}
              >
                <div className="flex items-center gap-3">

                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                  >
                    <ScanFace
                      size={18}
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold theme-text">
                      Verifikasi
                      Wajah
                    </h2>

                    <p className="text-xs theme-text-muted">
                      Foto wajah &
                      GPS
                    </p>
                  </div>
                </div>

                {sudahAbsen && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full ${themeSuccessSurface} px-2.5 py-1 text-[10px] font-bold text-[var(--color-success)]`}
                  >
                    <CheckCircle2
                      size={11}
                    />
                    Sudah
                    Absen
                  </span>
                )}
              </div>

              <div className="p-5">

                {/* DEVICE PICKER */}

                <div className="mb-4">

                  <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest theme-text-muted">
                    <Video
                      size={12}
                      className={
                        themePrimaryText
                      }
                    />
                    Pilih
                    Kamera
                  </label>

                  <div className="relative">

                    <select
                      value={
                        selectedCameraId
                      }
                      onChange={
                        handleCameraChange
                      }
                      disabled={
                        cameraLoading ||
                        sudahAbsen
                      }
                      className={`theme-input w-full appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm font-medium outline-none transition ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {cameras.length ===
                      0 ? (
                        <option value="">
                          Kamera belum
                          terdeteksi
                        </option>
                      ) : (
                        cameras.map(
                          (
                            camera,
                            index
                          ) => (
                            <option
                              key={
                                camera.deviceId ||
                                index
                              }
                              value={
                                camera.deviceId
                              }
                            >
                              {getCameraName(
                                camera,
                                index
                              )}

                              {isVirtualCamera(
                                camera
                              )
                                ? " (Virtual)"
                                : ""}
                            </option>
                          )
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
                    />
                  </div>
                </div>

                {/* PREVIEW */}

                {cameraOpen ? (
                  <div className="space-y-3">

                    <div className="relative overflow-hidden rounded-xl bg-[color-mix(in_srgb,var(--color-text)_92%,var(--color-card))]">

                      <video
                        ref={
                          videoRef
                        }
                        autoPlay
                        muted
                        playsInline
                        className="aspect-video w-full object-cover"
                      />

                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                        <div className="h-56 w-44 rounded-[45%] border-2 border-[color-mix(in_srgb,var(--color-card)_80%,transparent)] shadow-[0_0_0_999px_color-mix(in_srgb,var(--color-text)_42%,transparent)]" />
                      </div>

                      {cameraLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[color-mix(in_srgb,var(--color-text)_70%,transparent)]">

                          <div className="flex flex-col items-center gap-2 text-[var(--color-card)]">

                            <Loader2
                              size={24}
                              className="animate-spin"
                            />

                            <span className="text-xs">
                              Membuka
                              kamera...
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {cameraError && (
                      <div
                        className={`rounded-lg border ${themeDangerBorder} ${themeDangerSurface} p-3 text-xs theme-text-secondary`}
                      >
                        {
                          cameraError
                        }
                      </div>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row">

                      <button
                        type="button"
                        onClick={
                          takePhoto
                        }
                        disabled={
                          cameraLoading
                        }
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-[var(--color-card)] transition ${themePrimaryGradient} hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        <Camera
                          size={16}
                        />
                        Ambil
                        Foto
                      </button>

                      <button
                        type="button"
                        onClick={
                          closeCamera
                        }
                        className={`flex items-center justify-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card px-4 py-2.5 text-sm font-semibold theme-text-secondary transition ${themeNeutralHover}`}
                      >
                        <X
                          size={15}
                        />
                        Batal
                      </button>

                    </div>
                  </div>
                ) : capturedImage ? (
                  <div className="space-y-3">

                    <div
                      className={`relative overflow-hidden rounded-xl ${themeNeutralSurface}`}
                    >
                      <img
                        src={
                          capturedImage
                        }
                        alt="Preview"
                        className="aspect-video w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={
                          resetPhoto
                        }
                        className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full theme-card theme-text-secondary ${themeSmallShadow} transition ${themeNeutralHover}`}
                      >
                        <X
                          size={15}
                        />
                      </button>
                    </div>

                    {/* LOCATION */}

                    <div
                      className={`flex items-start gap-3 rounded-lg border p-3 ${
                        locationStatus ===
                        "success"
                          ? `${themeSuccessBorder} ${themeSuccessSurface}`
                          : locationStatus ===
                            "error"
                          ? `${themeDangerBorder} ${themeDangerSurface}`
                          : locationStatus ===
                            "loading"
                          ? `${themeInfoBorder} ${themeInfoSurface}`
                          : `${themeNeutralBorder} ${themeNeutralSurface}`
                      }`}
                    >
                      <MapPin
                        size={16}
                        className={
                          locationStatus ===
                          "success"
                            ? "mt-0.5 shrink-0 text-[var(--color-success)]"
                            : locationStatus ===
                              "error"
                            ? "mt-0.5 shrink-0 theme-text"
                            : locationStatus ===
                              "loading"
                            ? `mt-0.5 shrink-0 ${themePrimaryText}`
                            : "mt-0.5 shrink-0 theme-text-placeholder"
                        }
                      />

                      <div className="min-w-0 flex-1">

                        <p className="text-[10px] font-bold uppercase tracking-widest theme-text-muted">
                          Lokasi
                          GPS
                        </p>

                        <p className="mt-0.5 text-xs font-medium theme-text-secondary">
                          {locationText ||
                            "Diperiksa saat absensi dikirim."}
                        </p>

                        {locationData && (
                          <div className="mt-2 flex gap-3 text-[10px] theme-text-muted">

                            <span>
                              Lat{" "}
                              <b className="theme-text">
                                {locationData.latitude.toFixed(
                                  5
                                )}
                              </b>
                            </span>

                            <span>
                              Lng{" "}
                              <b className="theme-text">
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
                        onClick={
                          handleSubmitAbsen
                        }
                        disabled={
                          loadingAbsen ||
                          !kelasId ||
                          sudahAbsen
                        }
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-[var(--color-card)] transition ${themePrimaryGradient} hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60`}
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
                            <CheckCircle2
                              size={16}
                            />
                            Sudah
                            Absen
                          </>
                        ) : (
                          <>
                            <UserCheck
                              size={16}
                            />
                            Kirim
                            Absensi
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          startCamera(
                            selectedCameraId
                          )
                        }
                        disabled={
                          loadingAbsen ||
                          sudahAbsen
                        }
                        className={`flex items-center justify-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card px-4 py-2.5 text-sm font-semibold theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <Camera
                          size={15}
                        />
                        Foto Ulang
                      </button>

                    </div>
                  </div>
                ) : (
                  <div
                    className={`flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed ${themeNeutralBorder} ${themeNeutralSurface} px-6 py-12 text-center`}
                  >
                    <div
                      className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${themePrimarySoft} ${themePrimaryText}`}
                    >
                      <Camera
                        size={26}
                      />
                    </div>

                    <h3 className="text-sm font-bold theme-text">
                      Kamera belum
                      dibuka
                    </h3>

                    <p className="mt-1.5 max-w-sm text-xs leading-6 theme-text-muted">
                      Pilih kamera,
                      lalu buka
                      untuk
                      memulai
                      verifikasi
                      wajah.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        startCamera(
                          selectedCameraId
                        )
                      }
                      disabled={
                        !kelasId ||
                        sudahAbsen ||
                        cameras.length ===
                          0
                      }
                      className={`mt-5 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--color-card)] transition ${themePrimaryGradient} hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <Camera
                        size={16}
                      />

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

              <div
                className={`theme-card rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest theme-text-placeholder">
                  Status Hari Ini
                </p>

                <div className="mt-3">

                  {loadingData ? (
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
                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeSuccessSurface} text-[var(--color-success)]`}
                      >
                        <CheckCircle2
                          size={18}
                        />
                      </div>

                      <div>
                        <p className="text-sm font-bold theme-text">
                          {getStatusLabel(
                            absensiHariIni?.status
                          )}
                        </p>

                        <p className="text-xs theme-text-muted">
                          {formatJam(
                            absensiHariIni?.tanggal
                          )}
                        </p>
                      </div>

                    </div>
                  ) : (
                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeWarningSurface} text-[var(--color-warning)]`}
                      >
                        <Clock3
                          size={18}
                        />
                      </div>

                      <div>
                        <p className="text-sm font-bold theme-text">
                          Belum Absen
                        </p>

                        <p className="text-xs theme-text-muted">
                          Silakan lakukan
                          absensi
                        </p>
                      </div>

                    </div>
                  )}
                </div>
              </div>

              {/* KALENDER */}

              <div
                className={`theme-card rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
              >
                <div className="flex items-center justify-between">

                  <p className="text-[10px] font-bold uppercase tracking-widest theme-text-placeholder">
                    Kalender
                  </p>

                  <CalendarDays
                    size={14}
                    className={
                      themePrimaryText
                    }
                  />
                </div>

                <div className="mt-3">

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-bold capitalize theme-text-secondary">
                      {currentMonth.toLocaleDateString(
                        "id-ID",
                        {
                          month:
                            "long",
                          year:
                            "numeric",
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
                              calendarMonth -
                                1,
                              1
                            )
                          )
                        }
                        className={`rounded p-1 theme-text-placeholder transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
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
                              calendarMonth +
                                1,
                              1
                            )
                          )
                        }
                        className={`rounded p-1 theme-text-placeholder transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
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

                    {[
                      "M",
                      "S",
                      "S",
                      "R",
                      "K",
                      "J",
                      "S",
                    ].map(
                      (
                        day,
                        index
                      ) => (
                        <div
                          key={
                            `${day}-${index}`
                          }
                          className="py-1 text-[9px] font-bold uppercase theme-text-placeholder"
                        >
                          {day}
                        </div>
                      )
                    )}

                    {calendarDays.map(
                      (
                        date,
                        index
                      ) => {
                        if (
                          date ===
                          null
                        ) {
                          return (
                            <div
                              key={`empty-${index}`}
                              className="aspect-square"
                            />
                          );
                        }

                        const isCurrentDay =
                          date ===
                            today.getDate() &&
                          calendarMonth ===
                            today.getMonth() &&
                          calendarYear ===
                            today.getFullYear();

                        const hasAbsen =
                          hasAttendanceOnDate(
                            date
                          );

                        return (
                          <div
                            key={date}
                            className={`flex aspect-square items-center justify-center rounded text-[11px] font-medium ${
                              isCurrentDay
                                ? `${themePrimaryGradient} font-bold text-[var(--color-card)]`
                                : hasAbsen
                                ? `${themePrimarySoft} font-semibold ${themePrimaryText}`
                                : "theme-text-muted"
                            }`}
                          >
                            {date}
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div
                    className={`mt-3 flex items-center gap-3 border-t ${themeDivider} pt-3 text-[9px] font-semibold uppercase tracking-widest theme-text-placeholder`}
                  >
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-sm bg-[var(--color-primary)]" />
                      Hari ini
                    </span>

                    <span className="flex items-center gap-1">
                      <span
                        className={`h-2 w-2 rounded-sm ${themePrimarySoft}`}
                      />
                      Ada absensi
                    </span>
                  </div>
                </div>
              </div>

              {/* IZIN FORM */}

              <div
                className={`theme-card rounded-2xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
              >
                <div className="flex items-start gap-2.5">

                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                  >
                    <FileText
                      size={16}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold theme-text">
                      Ajukan
                      Keterangan
                    </h3>

                    <p className="mt-0.5 text-xs theme-text-muted">
                      Izin, sakit,
                      atau alpha
                    </p>
                  </div>
                </div>

                {!showIzinForm ? (
                  <button
                    type="button"
                    onClick={() =>
                      setShowIzinForm(
                        true
                      )
                    }
                    disabled={
                      !kelasId ||
                      sudahAbsen
                    }
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card px-3 py-2 text-xs font-semibold theme-text-secondary transition hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <FileText
                      size={13}
                    />
                    Ajukan
                    Sekarang
                  </button>
                ) : (
                  <div className="mt-3 space-y-3">

                    <div className="grid grid-cols-3 gap-1.5">

                      <button
                        type="button"
                        onClick={() =>
                          setJenisIzin(
                            "izin"
                          )
                        }
                        className={`rounded-lg border px-2 py-2 text-[11px] font-semibold transition ${
                          jenisIzin ===
                          "izin"
                            ? `${themePrimaryGradient} border-transparent text-[var(--color-card)]`
                            : `${themeNeutralBorder} theme-card theme-text-secondary ${themeNeutralHover}`
                        }`}
                      >
                        Izin
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setJenisIzin(
                            "sakit"
                          )
                        }
                        className={`rounded-lg border px-2 py-2 text-[11px] font-semibold transition ${
                          jenisIzin ===
                          "sakit"
                            ? `${themePrimaryGradient} border-transparent text-[var(--color-card)]`
                            : `${themeNeutralBorder} theme-card theme-text-secondary ${themeNeutralHover}`
                        }`}
                      >
                        Sakit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setJenisIzin(
                            "alpha"
                          )
                        }
                        className={`rounded-lg border px-2 py-2 text-[11px] font-semibold transition ${
                          jenisIzin ===
                          "alpha"
                            ? `${themePrimaryGradient} border-transparent text-[var(--color-card)]`
                            : `${themeNeutralBorder} theme-card theme-text-secondary ${themeNeutralHover}`
                        }`}
                      >
                        Alpha
                      </button>

                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                      <div>
                        <label
                          htmlFor="tanggalMulai"
                          className="mb-1 block text-[10px] font-semibold uppercase tracking-wider theme-text-muted"
                        >
                          Tanggal
                          Mulai
                        </label>

                        <input
                          id="tanggalMulai"
                          type="date"
                          value={
                            tanggalMulai
                          }
                          onChange={(
                            event
                          ) =>
                            setTanggalMulai(
                              event
                                .target
                                .value
                            )
                          }
                          className={`theme-input w-full rounded-lg border px-3 py-2 text-xs outline-none transition ${themeFocus}`}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="tanggalSelesai"
                          className="mb-1 block text-[10px] font-semibold uppercase tracking-wider theme-text-muted"
                        >
                          Tanggal
                          Selesai
                        </label>

                        <input
                          id="tanggalSelesai"
                          type="date"
                          value={
                            tanggalSelesai
                          }
                          onChange={(
                            event
                          ) =>
                            setTanggalSelesai(
                              event
                                .target
                                .value
                            )
                          }
                          className={`theme-input w-full rounded-lg border px-3 py-2 text-xs outline-none transition ${themeFocus}`}
                        />
                      </div>

                    </div>

                    <textarea
                      id="keterangan"
                      value={
                        keterangan
                      }
                      onChange={(
                        event
                      ) =>
                        setKeterangan(
                          event
                            .target
                            .value
                        )
                      }
                      rows={3}
                      placeholder="Tulis keterangan..."
                      className={`theme-input w-full resize-none rounded-lg border px-3 py-2 text-xs outline-none transition ${themeFocus}`}
                    />

                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={() => {
                          setShowIzinForm(
                            false
                          );

                          setKeterangan(
                            ""
                          );

                          setTanggalMulai(
                            ""
                          );

                          setTanggalSelesai(
                            ""
                          );

                          setBukti(
                            null
                          );

                          setError(
                            ""
                          );
                        }}
                        className={`flex-1 rounded-lg border ${themeNeutralBorder} theme-card px-3 py-2 text-xs font-semibold theme-text-secondary transition ${themeNeutralHover}`}
                      >
                        Batal
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleSubmitManual
                        }
                        disabled={
                          loadingAbsen ||
                          !kelasId ||
                          sudahAbsen
                        }
                        className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold text-[var(--color-card)] transition ${themePrimaryGradient} hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60`}
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

        {activeTab ===
          "histori" && (
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
                  <History
                    size={18}
                  />
                </div>

                <div>
                  <h2 className="text-sm font-bold theme-text">
                    Riwayat
                    Absensi
                  </h2>

                  <p className="text-xs theme-text-muted">
                    Seluruh data
                    absensi kamu
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 self-start rounded-full ${themeNeutralSurface} px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest theme-text-secondary sm:self-auto`}
              >
                {absensiData.length}{" "}
                Data
              </span>
            </div>

            <div className="p-5">

              {loadingData ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center">

                  <Loader2
                    size={26}
                    className={`animate-spin ${themePrimaryText}`}
                  />

                  <p className="mt-3 text-xs theme-text-muted">
                    Memuat riwayat...
                  </p>
                </div>
              ) : sortedAbsensiData.length ===
                0 ? (
                <div
                  className={`flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed ${themeNeutralBorder} ${themeNeutralSurface} px-6 text-center`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full theme-card theme-text-placeholder ${themeSmallShadow}`}
                  >
                    <History
                      size={24}
                    />
                  </div>

                  <h3 className="mt-4 text-sm font-bold theme-text">
                    Belum ada
                    riwayat
                    absensi
                  </h3>

                  <p className="mt-1 max-w-sm text-xs leading-5 theme-text-muted">
                    Data absensi
                    akan muncul
                    di sini.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        "absensi"
                      )
                    }
                    className={`mt-5 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-[var(--color-card)] transition ${themePrimaryGradient} hover:brightness-95`}
                  >
                    <ScanFace
                      size={13}
                    />
                    Mulai
                    Absensi
                  </button>
                </div>
              ) : (
                <div
                  className={`divide-y ${themeDivider}`}
                >
                  {sortedAbsensiData.map(
                    (
                      item,
                      index
                    ) => {
                      const status =
                        String(
                          item?.status ||
                            ""
                        ).toLowerCase();

                      const isHadir =
                        status ===
                        "hadir";

                      const isSakit =
                        status ===
                        "sakit";

                      const isIzin =
                        status ===
                        "izin";

                      const isAlpha =
                        status ===
                          "alpha" ||
                        status ===
                          "alpa";

                      return (
                        <div
                          key={
                            item?.id ||
                            index
                          }
                          className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                              isHadir
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
                            {isHadir ? (
                              <UserCheck
                                size={18}
                              />
                            ) : isSakit ? (
                              <HeartPulse
                                size={18}
                              />
                            ) : isAlpha ? (
                              <UserX
                                size={18}
                              />
                            ) : (
                              <FileText
                                size={18}
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <p className="text-sm font-bold theme-text">
                                {getStatusLabel(
                                  item?.status
                                )}
                              </p>

                              {item?.metode && (
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full ${themeNeutralSurface} px-2 py-0.5 text-[10px] font-semibold theme-text-muted`}
                                >
                                  <ScanFace
                                    size={10}
                                  />

                                  {
                                    item.metode
                                  }
                                </span>
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs theme-text-muted">

                              <span className="flex items-center gap-1">
                                <CalendarDays
                                  size={12}
                                />

                                {formatTanggal(
                                  item?.tanggal
                                )}
                              </span>

                              <span className="flex items-center gap-1">
                                <Clock3
                                  size={12}
                                />

                                {formatJam(
                                  item?.tanggal
                                )}
                              </span>
                            </div>

                            {item?.keterangan && (
                              <p className="mt-2 text-xs leading-5 theme-text-muted">
                                {
                                  item.keterangan
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="h-6" />
      </div>

      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </div>
  );
}