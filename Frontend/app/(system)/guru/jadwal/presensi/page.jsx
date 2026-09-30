"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Camera,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Loader2,
  Calendar,
  BookOpen,
  UserCheck,
  Activity,
  Database,
  Shield,
} from "lucide-react";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

// ============================================================
// API
// ============================================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

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
// TOKEN
// ============================================================

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

// ============================================================
// RESPONSE PARSER
// ============================================================

async function parseResponse(response) {
  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      `Response bukan JSON. Status: ${response.status}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        data?.detail ||
        `Request gagal (${response.status})`
    );
  }

  return data;
}

// ============================================================
// DATE
// ============================================================

function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentDayName() {
  const days = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];

  return days[new Date().getDay()];
}

function formatTanggal(value) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ).format(new Date(value));
  } catch {
    return value;
  }
}

function formatJam(value) {
  if (!value) return "-";

  if (
    typeof value === "string" &&
    /^\d{1,2}:\d{2}/.test(value)
  ) {
    return value.substring(0, 5);
  }

  try {
    return new Intl.DateTimeFormat(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(value));
  } catch {
    return value;
  }
}

// ============================================================
// STATUS
// ============================================================

function getStatusLabel(status) {
  const value = String(
    status || ""
  ).toLowerCase();

  if (value === "hadir") {
    return "Hadir";
  }

  if (value === "terlambat") {
    return "Terlambat";
  }

  if (value === "izin") {
    return "Izin";
  }

  if (value === "sakit") {
    return "Sakit";
  }

  if (
    value === "alpha" ||
    value === "alpa"
  ) {
    return "Alpa";
  }

  return status || "-";
}

function getStatusClass(status) {
  const value = String(
    status || ""
  ).toLowerCase();

  if (value === "hadir") {
    return `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`;
  }

  if (value === "terlambat") {
    return `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`;
  }

  if (value === "izin") {
    return `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`;
  }

  if (value === "sakit") {
    return `${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`;
  }

  if (
    value === "alpha" ||
    value === "alpa"
  ) {
    return `${themeDangerSurface} theme-danger ${themeDangerBorder}`;
  }

  return `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`;
}

// ============================================================
// RESPONSE LIST
// ============================================================

function getScheduleList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.jadwal)) {
    return data.jadwal;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.rows)) {
    return data.rows;
  }

  return [];
}

function getAbsensiList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.absensi)) {
    return data.absensi;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.rows)) {
    return data.rows;
  }

  return [];
}

// ============================================================
// SCHEDULE HELPERS
// ============================================================

function getKelasIdFromSchedule(schedule) {
  if (!schedule) return null;

  return (
    schedule.kelasId ||
    schedule.kelas?.id ||
    schedule.kelasMapel?.kelasId ||
    schedule.kelasMapel?.kelas?.id ||
    schedule.kelasMataPelajaran
      ?.kelasId ||
    schedule.kelasMataPelajaran
      ?.kelas?.id ||
    null
  );
}

function getScheduleDay(schedule) {
  if (!schedule) return "";

  return String(
    schedule.hari ||
      schedule.hariNama ||
      schedule.hariMengajar ||
      schedule.day ||
      ""
  ).toLowerCase();
}

function getScheduleStart(schedule) {
  return (
    schedule.jamMulai ||
    schedule.waktuMulai ||
    schedule.mulai ||
    schedule.jam?.mulai ||
    schedule.jamPelajaran?.mulai ||
    ""
  );
}

function getScheduleEnd(schedule) {
  return (
    schedule.jamSelesai ||
    schedule.waktuSelesai ||
    schedule.selesai ||
    schedule.jam?.selesai ||
    schedule.jamPelajaran?.selesai ||
    ""
  );
}

function getScheduleMapel(schedule) {
  return (
    schedule.mapel?.nama ||
    schedule.mapel?.namaMapel ||
    schedule.mataPelajaran?.nama ||
    schedule.mataPelajaran?.namaMapel ||
    schedule.namaMapel ||
    schedule.mapelNama ||
    "Mata Pelajaran"
  );
}

function getScheduleKelas(schedule) {
  return (
    schedule.kelas?.nama ||
    schedule.kelas?.namaKelas ||
    schedule.namaKelas ||
    schedule.kelasNama ||
    "Kelas"
  );
}

function isTodaySchedule(schedule) {
  const currentDay =
    getCurrentDayName().toLowerCase();

  const scheduleDay =
    getScheduleDay(schedule);

  if (!scheduleDay) {
    return true;
  }

  return (
    scheduleDay === currentDay ||
    scheduleDay.includes(currentDay)
  );
}

function getTimeInMinutes(value) {
  if (!value) return null;

  const match = String(value).match(
    /(\d{1,2}):(\d{2})/
  );

  if (!match) {
    return null;
  }

  return (
    Number(match[1]) * 60 +
    Number(match[2])
  );
}

function isScheduleCurrentlyActive(
  schedule
) {
  const start =
    getTimeInMinutes(
      getScheduleStart(schedule)
    );

  const end =
    getTimeInMinutes(
      getScheduleEnd(schedule)
    );

  if (
    start === null ||
    end === null
  ) {
    return false;
  }

  const now = new Date();

  const current =
    now.getHours() * 60 +
    now.getMinutes();

  return (
    current >= start &&
    current <= end
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function PresensiGuruPage() {
  const videoRef =
    useRef(null);

  const canvasRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [absensi, setAbsensi] =
    useState([]);

  const [jadwal, setJadwal] =
    useState([]);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [cameraLoading, setCameraLoading] =
    useState(false);

  const [cameraError, setCameraError] =
    useState("");

  const [capturedPhoto, setCapturedPhoto] =
    useState(null);

  const [location, setLocation] =
    useState(null);

  const [
    locationLoading,
    setLocationLoading,
  ] = useState(false);

  const [
    locationError,
    setLocationError,
  ] = useState("");

  const [jadwalAktif, setJadwalAktif] =
    useState(null);

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadData =
    useCallback(async () => {
      const token = getToken();

      if (!token) {
        setError(
          "Sesi login tidak ditemukan."
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [
          absensiResponse,
          jadwalResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/api/v1/absensi/saya`,
            {
              method: "GET",
              headers,
              cache: "no-store",
            }
          ),

          fetch(
            `${API_URL}/api/v1/jadwal-mengajar`,
            {
              method: "GET",
              headers,
              cache: "no-store",
            }
          ),
        ]);

        const absensiResult =
          await parseResponse(
            absensiResponse
          );

        const jadwalResult =
          await parseResponse(
            jadwalResponse
          );

        const absensiData =
          getAbsensiList(
            absensiResult
          );

        const jadwalData =
          getScheduleList(
            jadwalResult
          );

        setAbsensi(absensiData);
        setJadwal(jadwalData);

        const userRaw =
          typeof window !== "undefined"
            ? localStorage.getItem(
                "user"
              )
            : null;

        if (userRaw) {
          try {
            setUser(
              JSON.parse(userRaw)
            );
          } catch {
            setUser(null);
          }
        }

        const todaySchedules =
          jadwalData.filter(
            isTodaySchedule
          );

        const active =
          todaySchedules.find(
            isScheduleCurrentlyActive
          ) ||
          todaySchedules[0] ||
          null;

        setJadwalAktif(active);
      } catch (err) {
        console.error(
          "Gagal mengambil data presensi:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil data presensi."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================================
  // CLEANUP
  // ==========================================================

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );
      }

      if (capturedPhoto?.url) {
        URL.revokeObjectURL(
          capturedPhoto.url
        );
      }
    };
  }, [capturedPhoto]);

  // ==========================================================
  // GPS
  // ==========================================================

  const getCurrentLocation =
    () => {
      return new Promise(
        (resolve, reject) => {
          if (
            !navigator.geolocation
          ) {
            reject(
              new Error(
                "Browser tidak mendukung GPS."
              )
            );

            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lintang:
                  position.coords
                    .latitude,

                bujur:
                  position.coords
                    .longitude,

                accuracy:
                  position.coords
                    .accuracy,
              });
            },

            (err) => {
              let message =
                "Lokasi tidak dapat diperoleh.";

              if (
                err.code === 1
              ) {
                message =
                  "Izin lokasi ditolak. Silakan aktifkan lokasi pada browser.";
              } else if (
                err.code === 2
              ) {
                message =
                  "Lokasi tidak tersedia.";
              } else if (
                err.code === 3
              ) {
                message =
                  "Pengambilan lokasi terlalu lama.";
              }

              reject(
                new Error(message)
              );
            },

            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0,
            }
          );
        }
      );
    };

  const checkLocation =
    async () => {
      try {
        setLocationLoading(true);
        setLocationError("");

        const currentLocation =
          await getCurrentLocation();

        setLocation(
          currentLocation
        );

        return currentLocation;
      } catch (err) {
        console.error(
          "GPS error:",
          err
        );

        setLocationError(
          err?.message ||
            "Lokasi tidak dapat diperoleh."
        );

        return null;
      } finally {
        setLocationLoading(false);
      }
    };

  // ==========================================================
  // CAMERA
  // ==========================================================

  const startCamera =
    async () => {
      try {
        setCameraLoading(true);
        setCameraError("");
        setError("");
        setSuccess("");

        if (
          !navigator.mediaDevices
            ?.getUserMedia
        ) {
          throw new Error(
            "Browser tidak mendukung akses kamera."
          );
        }

        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach(
              (track) =>
                track.stop()
            );
        }

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: {
                facingMode:
                  "user",

                width: {
                  ideal: 1280,
                },

                height: {
                  ideal: 720,
                },
              },

              audio: false,
            }
          );

        streamRef.current =
          stream;

        setCameraOpen(true);

        requestAnimationFrame(
          () => {
            if (
              videoRef.current
            ) {
              videoRef.current.srcObject =
                stream;

              videoRef.current
                .play()
                .catch(
                  () => {}
                );
            }
          }
        );

        await checkLocation();
      } catch (err) {
        console.error(
          "Camera error:",
          err
        );

        setCameraError(
          err?.message ||
            "Kamera tidak dapat dibuka."
        );
      } finally {
        setCameraLoading(false);
      }
    };

  const stopCamera =
    () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

        streamRef.current = null;
      }

      setCameraOpen(false);
      setCameraLoading(false);
      setCameraError("");
    };

  // ==========================================================
  // CAPTURE
  // ==========================================================

  const capturePhoto =
    () => {
      try {
        setCameraError("");

        const video =
          videoRef.current;

        const canvas =
          canvasRef.current;

        if (!video || !canvas) {
          setCameraError(
            "Kamera belum siap."
          );

          return;
        }

        if (
          video.readyState <
          HTMLMediaElement.HAVE_CURRENT_DATA
        ) {
          setCameraError(
            "Tunggu kamera siap terlebih dahulu."
          );

          return;
        }

        const width =
          video.videoWidth ||
          1280;

        const height =
          video.videoHeight ||
          720;

        if (
          !width ||
          !height
        ) {
          setCameraError(
            "Ukuran kamera belum tersedia."
          );

          return;
        }

        canvas.width = width;
        canvas.height = height;

        const context =
          canvas.getContext(
            "2d"
          );

        if (!context) {
          setCameraError(
            "Gagal menyiapkan kamera."
          );

          return;
        }

        context.drawImage(
          video,
          0,
          0,
          width,
          height
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              setCameraError(
                "Gagal mengambil foto wajah."
              );

              return;
            }

            if (
              capturedPhoto?.url
            ) {
              URL.revokeObjectURL(
                capturedPhoto.url
              );
            }

            const url =
              URL.createObjectURL(
                blob
              );

            setCapturedPhoto({
              blob,
              url,
            });
          },
          "image/jpeg",
          0.9
        );
      } catch (err) {
        console.error(
          "Capture photo error:",
          err
        );

        setCameraError(
          "Gagal mengambil foto wajah."
        );
      }
    };

  const retakePhoto =
    () => {
      if (
        capturedPhoto?.url
      ) {
        URL.revokeObjectURL(
          capturedPhoto.url
        );
      }

      setCapturedPhoto(null);
      setCameraError("");
    };

  // ==========================================================
  // SELECT SCHEDULE
  // ==========================================================

  const getSelectedSchedule =
    () => {
      if (jadwalAktif) {
        return jadwalAktif;
      }

      const todaySchedules =
        jadwal.filter(
          isTodaySchedule
        );

      return (
        todaySchedules[0] ||
        null
      );
    };

  // ==========================================================
  // CHECK IN
  // ==========================================================

  const handleCheckin =
    async () => {
      try {
        setError("");
        setSuccess("");

        if (submitting) {
          return;
        }

        if (!capturedPhoto?.blob) {
          setError(
            "Silakan ambil foto wajah terlebih dahulu."
          );

          return;
        }

        const schedule =
          getSelectedSchedule();

        const kelasId =
          getKelasIdFromSchedule(
            schedule
          );

        if (!kelasId) {
          setError(
            "Kelas pada jadwal mengajar tidak ditemukan."
          );

          return;
        }

        let currentLocation =
          location;

        if (!currentLocation) {
          currentLocation =
            await getCurrentLocation();

          setLocation(
            currentLocation
          );
        }

        if (!currentLocation) {
          setError(
            "Lokasi GPS wajib diaktifkan untuk presensi Face ID."
          );

          return;
        }

        const token =
          getToken();

        if (!token) {
          setError(
            "Sesi login tidak ditemukan."
          );

          return;
        }

        setSubmitting(true);

        const formData =
          new FormData();

        formData.append(
          "kelasId",
          String(kelasId)
        );

        formData.append(
          "status",
          "hadir"
        );

        formData.append(
          "metode",
          "face"
        );

        formData.append(
          "lintang",
          String(
            currentLocation.lintang
          )
        );

        formData.append(
          "bujur",
          String(
            currentLocation.bujur
          )
        );

        formData.append(
          "snapshot",
          capturedPhoto.blob,
          `face-${Date.now()}.jpg`
        );

        const response =
          await fetch(
            `${API_URL}/api/v1/absensi/`,
            {
              method: "POST",

              headers: {
                Authorization: `Bearer ${token}`,
              },

              body: formData,
            }
          );

        const result =
          await parseResponse(
            response
          );

        setSuccess(
          result?.message ||
            "Presensi Face ID berhasil dicatat."
        );

        setCapturedPhoto(
          null
        );

        stopCamera();

        await loadData();
      } catch (err) {
        console.error(
          "Presensi Face ID gagal:",
          err
        );

        setError(
          err?.message ||
            "Presensi Face ID gagal."
        );
      } finally {
        setSubmitting(false);
      }
    };

  // ==========================================================
  // DERIVED DATA
  // ==========================================================

  const today =
    getTodayDate();

  const absensiHariIni =
    absensi.find((item) => {
      const tanggal =
        item.tanggal ||
        item.waktuAbsensi ||
        item.dibuatPada ||
        item.createdAt;

      if (!tanggal) {
        return false;
      }

      return (
        String(tanggal).substring(
          0,
          10
        ) === today
      );
    });

  const jumlahHadir =
    absensi.filter(
      (item) =>
        String(
          item.status || ""
        ).toLowerCase() ===
        "hadir"
    ).length;

  const jumlahTerlambat =
    absensi.filter(
      (item) =>
        String(
          item.status || ""
        ).toLowerCase() ===
        "terlambat"
    ).length;

  const jumlahIzin =
    absensi.filter(
      (item) =>
        String(
          item.status || ""
        ).toLowerCase() ===
        "izin"
    ).length;

  const todaySchedules =
    jadwal.filter(
      isTodaySchedule
    );

  const selectedSchedule =
    getSelectedSchedule();

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        role="guru"
        activeMenu="presensi"
        isOpen={sidebarOpen}
        onToggle={() =>
          setSidebarOpen(
            !sidebarOpen
          )
        }
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          title="Presensi"
          onMenuClick={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
          user={user}
        />

        {/* ===================================================
            SCROLL AREA
        =================================================== */}

        <main className="theme-page flex-1 overflow-y-auto">
          <div className="w-full min-w-0 p-3 sm:p-4 lg:p-6 xl:p-8">
            <div className="mx-auto w-full max-w-none space-y-4 sm:space-y-5 lg:space-y-6">

              {/* =================================================
                  HEADER
              ================================================== */}

              <section className="theme-card relative overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-4 shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)] sm:p-5 lg:p-6">
                {/* decorative */}

                <div
                  className="pointer-events-none absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/3 rounded-full opacity-60 blur-3xl"
                  style={{
                    background:
                      "color-mix(in_srgb,var(--color-primary)_12%,transparent)",
                  }}
                />

                <div className="relative flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} ${themeSmallShadow}`}
                    >
                      <Camera
                        size={20}
                        className={themePrimaryText}
                      />
                    </div>

                    <div className="min-w-0">
                      <h1 className="theme-text truncate text-xl font-bold sm:text-2xl">
                        Presensi Mengajar
                      </h1>

                      <p className="theme-text-muted mt-1 text-xs sm:text-sm">
                        Presensi mengajar dengan verifikasi Face ID.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`theme-card shrink-0 rounded-xl border ${themeNeutralBorder} px-4 py-3 ${themeSmallShadow}`}
                  >
                    <p className="theme-text-muted text-[10px] font-medium uppercase tracking-wide">
                      Hari ini
                    </p>

                    <p className="theme-text mt-1 text-sm font-bold">
                      {new Intl.DateTimeFormat(
                        "id-ID",
                        {
                          weekday:
                            "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      ).format(
                        new Date()
                      )}
                    </p>
                  </div>
                </div>
              </section>

              {/* =================================================
                  ERROR
              ================================================== */}

              {error && (
                <div
                  className={`flex min-w-0 items-start gap-3 rounded-xl border ${themeDangerBorder} ${themeDangerSurface} p-4`}
                >
                  <AlertCircle
                    size={19}
                    className="theme-danger mt-0.5 shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="theme-danger text-sm font-semibold">
                      Presensi gagal
                    </p>

                    <p className="theme-text-secondary mt-0.5 text-sm">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                    className="theme-danger shrink-0 rounded-lg p-1 transition hover:opacity-70"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* =================================================
                  SUCCESS
              ================================================== */}

              {success && (
                <div
                  className={`flex min-w-0 items-start gap-3 rounded-xl border ${themeSuccessBorder} ${themeSuccessSurface} p-4`}
                >
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-[var(--color-success)]"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-[var(--color-success)] text-sm font-semibold">
                      Berhasil
                    </p>

                    <p className="theme-text-secondary mt-0.5 text-sm">
                      {success}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSuccess("")
                    }
                    className="text-[var(--color-success)] shrink-0 rounded-lg p-1 transition hover:opacity-70"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* =================================================
                  STATISTICS
              ================================================== */}

              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <StatCard
                  title="Hadir"
                  value={jumlahHadir}
                  description="Total kehadiran"
                  icon={UserCheck}
                  iconClass="text-[var(--color-success)]"
                  iconSurface={themeSuccessSurface}
                  iconBorder={themeSuccessBorder}
                />

                <StatCard
                  title="Terlambat"
                  value={jumlahTerlambat}
                  description="Total keterlambatan"
                  icon={Clock}
                  iconClass="text-[var(--color-warning)]"
                  iconSurface={themeWarningSurface}
                  iconBorder={themeWarningBorder}
                />

                <StatCard
                  title="Izin"
                  value={jumlahIzin}
                  description="Total izin"
                  icon={Calendar}
                  iconClass="text-[var(--color-info)]"
                  iconSurface={themeInfoSurface}
                  iconBorder={themeInfoBorder}
                />

                <StatCard
                  title="Total Riwayat"
                  value={absensi.length}
                  description="Data tersimpan"
                  icon={Database}
                  iconClass={themePrimaryText}
                  iconSurface={themePrimarySoft}
                  iconBorder={themePrimarySoftBorder}
                />
              </div>

              {/* =================================================
                  MAIN GRID
              ================================================== */}

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)]">

                {/* =================================================
                    CHECK IN
                ================================================== */}

                <section
                  className={`theme-card min-w-0 overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  <div
                    className={`border-b ${themeDivider} px-4 py-4 sm:px-5 lg:px-6`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft}`}
                      >
                        <Camera
                          size={15}
                          className={themePrimaryText}
                        />
                      </div>

                      <h2 className="theme-text text-sm font-bold">
                        Check-in Presensi
                      </h2>
                    </div>

                    <p className="theme-text-muted mt-1 text-xs">
                      Verifikasi wajah untuk mencatat kehadiran mengajar.
                    </p>
                  </div>

                  <div className="space-y-4 p-4 sm:p-6">

                    {/* JADWAL */}

                    <div
                      className={`rounded-xl border ${themeInfoBorder} ${themeInfoSurface} p-4`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-info)]">
                            Jadwal Mengajar
                          </p>

                          <p className="theme-text mt-1 truncate text-base font-bold">
                            {selectedSchedule
                              ? getScheduleMapel(
                                  selectedSchedule
                                )
                              : "Belum ada jadwal"}
                          </p>

                          <p className="theme-text-secondary mt-1 truncate text-sm">
                            {selectedSchedule
                              ? getScheduleKelas(
                                  selectedSchedule
                                )
                              : "Tidak ada jadwal mengajar hari ini"}
                          </p>
                        </div>

                        {selectedSchedule && (
                          <div
                            className={`theme-card shrink-0 rounded-lg border ${themeInfoBorder} px-3 py-2 text-right`}
                          >
                            <p className="theme-text-muted text-[10px]">
                              Jam
                            </p>

                            <p className="text-[var(--color-info)] text-sm font-bold">
                              {formatJam(
                                getScheduleStart(
                                  selectedSchedule
                                )
                              )}{" "}
                              -{" "}
                              {formatJam(
                                getScheduleEnd(
                                  selectedSchedule
                                )
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* STATUS */}

                    <div
                      className={`rounded-xl border ${themeNeutralBorder} p-4`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="theme-text text-sm font-semibold">
                            Status Hari Ini
                          </p>

                          <p className="theme-text-muted mt-1 text-xs">
                            Status presensi kamu untuk hari ini.
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                            absensiHariIni
                              ? getStatusClass(
                                  absensiHariIni.status
                                )
                              : `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`
                          }`}
                        >
                          {absensiHariIni
                            ? getStatusLabel(
                                absensiHariIni.status
                              )
                            : "Belum Absen"}
                        </span>
                      </div>
                    </div>

                    {/* GPS */}

                    <div
                      className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${themeInfoBorder} ${themeInfoSurface}`}
                        >
                          <MapPin
                            size={18}
                            className="text-[var(--color-info)]"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="theme-text text-sm font-semibold">
                            Lokasi GPS
                          </p>

                          {locationLoading ? (
                            <p className="theme-text-muted mt-1 text-xs">
                              Mengambil lokasi...
                            </p>
                          ) : location ? (
                            <p className="mt-1 text-xs text-[var(--color-success)]">
                              Lokasi berhasil didapatkan
                              {location.accuracy
                                ? ` • Akurasi ±${Math.round(
                                    location.accuracy
                                  )} m`
                                : ""}
                            </p>
                          ) : (
                            <p className="theme-text-muted mt-1 text-xs">
                              GPS akan digunakan saat melakukan presensi.
                            </p>
                          )}

                          {locationError && (
                            <p className="theme-danger mt-1 text-xs">
                              {locationError}
                            </p>
                          )}
                        </div>

                        {!location && (
                          <button
                            type="button"
                            onClick={
                              checkLocation
                            }
                            disabled={
                              locationLoading
                            }
                            className={`theme-card theme-text-secondary shrink-0 rounded-lg border ${themeNeutralBorder} px-3 py-2 text-xs font-semibold transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            {locationLoading
                              ? "Memuat..."
                              : "Aktifkan"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* CAMERA BUTTON */}

                    <button
                      type="button"
                      onClick={
                        startCamera
                      }
                      disabled={
                        cameraLoading ||
                        submitting ||
                        Boolean(
                          absensiHariIni
                        )
                      }
                      className={`
                        group flex w-full
                        items-center justify-center
                        gap-3 rounded-xl
                        ${themePrimaryGradient}
                        px-5 py-4
                        text-sm font-bold
                        text-[var(--color-card)]
                        ${themePrimaryShadow}
                        transition
                        hover:brightness-95
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      `}
                    >
                      {cameraLoading ? (
                        <>
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                          Membuka Kamera...
                        </>
                      ) : absensiHariIni ? (
                        <>
                          <CheckCircle2 size={18} />
                          Sudah Melakukan Presensi
                        </>
                      ) : (
                        <>
                          <Camera size={18} />
                          Buka Kamera Face ID
                        </>
                      )}
                    </button>

                    <p className="theme-text-placeholder text-center text-xs leading-5">
                      Pastikan wajah terlihat jelas, pencahayaan cukup,
                      dan posisi wajah berada di dalam oval.
                    </p>
                  </div>
                </section>

                {/* =================================================
                    SUMMARY
                ================================================== */}

                <section
                  className={`theme-card min-w-0 overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  <div
                    className={`border-b ${themeDivider} px-4 py-4 sm:px-5 lg:px-6`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft}`}
                      >
                        <Activity
                          size={15}
                          className={themePrimaryText}
                        />
                      </div>

                      <h2 className="theme-text text-sm font-bold">
                        Ringkasan Presensi
                      </h2>
                    </div>

                    <p className="theme-text-muted mt-1 text-xs">
                      Rekap data presensi kamu.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-6 xl:grid-cols-1">
                    <SummaryBox
                      label="Hadir"
                      value={
                        jumlahHadir
                      }
                      surface={
                        themeSuccessSurface
                      }
                      border={
                        themeSuccessBorder
                      }
                      text="text-[var(--color-success)]"
                    />

                    <SummaryBox
                      label="Terlambat"
                      value={
                        jumlahTerlambat
                      }
                      surface={
                        themeWarningSurface
                      }
                      border={
                        themeWarningBorder
                      }
                      text="text-[var(--color-warning)]"
                    />

                    <SummaryBox
                      label="Izin"
                      value={
                        jumlahIzin
                      }
                      surface={
                        themeInfoSurface
                      }
                      border={
                        themeInfoBorder
                      }
                      text="text-[var(--color-info)]"
                    />
                  </div>

                  <div
                    className={`border-t ${themeDivider} p-6`}
                  >
                    <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                      Total Riwayat
                    </p>

                    <p className="theme-text mt-1 text-2xl font-bold">
                      {absensi.length}
                    </p>

                    <p className="theme-text-muted mt-1 text-xs">
                      data presensi tersimpan
                    </p>
                  </div>
                </section>
              </div>

              {/* =================================================
                  JADWAL HARI INI
              ================================================== */}

              <section
                className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`border-b ${themeDivider} px-4 py-4 sm:px-5 lg:px-6`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft}`}
                    >
                      <BookOpen
                        size={15}
                        className={themePrimaryText}
                      />
                    </div>

                    <h2 className="theme-text text-sm font-bold">
                      Jadwal Hari Ini
                    </h2>
                  </div>

                  <p className="theme-text-muted mt-1 text-xs">
                    Daftar jadwal mengajar kamu hari ini.
                  </p>
                </div>

                <div className="p-4 sm:p-6">
                  {loading ? (
                    <div className="theme-text-muted py-10 text-center text-sm">
                      <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                      Memuat jadwal...
                    </div>
                  ) : todaySchedules.length ===
                    0 ? (
                    <div
                      className={`theme-text-muted rounded-xl border border-dashed ${themeNeutralBorder} py-10 text-center`}
                    >
                      <Calendar className="mx-auto mb-2 h-8 w-8 opacity-50" />

                      <p className="theme-text-secondary text-sm font-medium">
                        Belum ada jadwal mengajar hari ini.
                      </p>

                      <p className="theme-text-placeholder mt-1 text-xs">
                        Jadwal akan muncul jika sudah tersedia.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {todaySchedules.map(
                        (
                          schedule,
                          index
                        ) => {
                          const active =
                            jadwalAktif ===
                            schedule;

                          return (
                            <div
                              key={
                                schedule.id ||
                                schedule.jadwalId ||
                                index
                              }
                              className={`
                                rounded-xl
                                border p-4
                                transition-all
                                ${
                                  active
                                    ? `${themePrimarySoftBorder} ${themePrimarySoft}`
                                    : `theme-card ${themeNeutralBorder} ${themeNeutralHover}`
                                }
                              `}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="theme-text truncate text-sm font-bold">
                                    {getScheduleMapel(
                                      schedule
                                    )}
                                  </p>

                                  <p className="theme-text-muted mt-1 truncate text-xs">
                                    {getScheduleKelas(
                                      schedule
                                    )}
                                  </p>
                                </div>

                                {active && (
                                  <span
                                    className={`
                                      shrink-0
                                      rounded-full
                                      border
                                      ${themePrimarySoftBorder}
                                      ${themePrimarySoft}
                                      ${themePrimaryText}
                                      px-2.5 py-1
                                      text-[10px]
                                      font-bold
                                    `}
                                  >
                                    Aktif
                                  </span>
                                )}
                              </div>

                              <div className="theme-text-secondary mt-4 flex items-center gap-2 text-xs font-medium">
                                <Clock
                                  size={13}
                                />

                                {formatJam(
                                  getScheduleStart(
                                    schedule
                                  )
                                )}{" "}
                                -{" "}
                                {formatJam(
                                  getScheduleEnd(
                                    schedule
                                  )
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================
                  RIWAYAT
              ================================================== */}

              <section
                className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
              >
                <div
                  className={`border-b ${themeDivider} px-4 py-4 sm:px-5 lg:px-6`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft}`}
                    >
                      <Database
                        size={15}
                        className={themePrimaryText}
                      />
                    </div>

                    <h2 className="theme-text text-sm font-bold">
                      Riwayat Presensi
                    </h2>
                  </div>

                  <p className="theme-text-muted mt-1 text-xs">
                    Riwayat presensi yang sudah tercatat.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="theme-text-muted px-6 py-10 text-center text-sm">
                      Memuat riwayat...
                    </div>
                  ) : absensi.length ===
                    0 ? (
                    <div className="px-6 py-10 text-center">
                      <Database className="theme-text-placeholder mx-auto mb-2 h-8 w-8" />

                      <p className="theme-text-secondary text-sm font-medium">
                        Belum ada riwayat presensi.
                      </p>

                      <p className="theme-text-muted mt-1 text-xs">
                        Data presensi akan muncul setelah kamu melakukan check-in.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full min-w-[700px] text-left">
                      <thead>
                        <tr
                          className={`
                            ${themePrimaryGradient}
                            text-[var(--color-card)]
                          `}
                        >
                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide">
                            Tanggal
                          </th>

                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide">
                            Jam
                          </th>

                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide">
                            Status
                          </th>

                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide">
                            Metode
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {absensi
                          .slice(
                            0,
                            10
                          )
                          .map(
                            (
                              item,
                              index
                            ) => {
                              const date =
                                item.tanggal ||
                                item.waktuAbsensi ||
                                item.dibuatPada ||
                                item.createdAt;

                              return (
                                <tr
                                  key={
                                    item.id ||
                                    index
                                  }
                                  className={`
                                    border-b
                                    ${themeDivider}
                                    last:border-0
                                    transition-colors
                                    ${themeNeutralHover}
                                  `}
                                >
                                  <td className="theme-text px-6 py-4 text-sm font-medium">
                                    {formatTanggal(
                                      date
                                    )}
                                  </td>

                                  <td className="theme-text-secondary px-6 py-4 text-sm">
                                    {formatJam(
                                      item.jam ||
                                        item.waktuAbsensi ||
                                        item.dibuatPada ||
                                        item.createdAt
                                    )}
                                  </td>

                                  <td className="px-6 py-4">
                                    <span
                                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                        item.status
                                      )}`}
                                    >
                                      {getStatusLabel(
                                        item.status
                                      )}
                                    </span>
                                  </td>

                                  <td className="theme-text-secondary px-6 py-4 text-sm capitalize">
                                    {item.metode ||
                                      "-"}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* =====================================================
          CAMERA MODAL
      ====================================================== */}

      {cameraOpen && (
        <div
          className="
            fixed inset-0 z-[100]
            flex items-center justify-center
            bg-[color-mix(in_srgb,var(--color-text)_82%,transparent)]
            p-4
            backdrop-blur-sm
          "
        >
          <div
            className={`
              theme-card
              w-full max-w-2xl
              overflow-hidden
              rounded-2xl
              border ${themeNeutralBorder}
              ${themeCardShadow}
            `}
          >
            {/* MODAL HEADER */}

            <div
              className={`
                flex items-center justify-between
                border-b ${themeDivider}
                px-5 py-4
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft}`}
                >
                  <Shield
                    size={17}
                    className={themePrimaryText}
                  />
                </div>

                <div>
                  <h3 className="theme-text text-sm font-bold">
                    Verifikasi Face ID
                  </h3>

                  <p className="theme-text-muted mt-0.5 text-[11px]">
                    Posisikan wajah di tengah oval.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  stopCamera
                }
                disabled={
                  submitting
                }
                className={`
                  theme-text-secondary
                  flex h-9 w-9
                  items-center justify-center
                  rounded-lg
                  transition
                  ${themeNeutralHover}
                  hover:text-[var(--color-primary)]
                  disabled:opacity-50
                `}
              >
                <X size={18} />
              </button>
            </div>

            {/* CAMERA AREA */}

            <div
              className="
                bg-[color-mix(in_srgb,var(--color-text)_88%,var(--color-card))]
                p-4
                sm:p-6
              "
            >
              <div className="theme-card relative mx-auto w-full max-w-[620px] overflow-hidden rounded-2xl">
                {!capturedPhoto ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="aspect-video h-auto w-full object-cover"
                      style={{
                        transform:
                          "scaleX(-1)",
                      }}
                    />

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div
                        className="
                          h-[76%]
                          w-[34%]
                          min-w-[170px]
                          max-w-[260px]
                          rounded-[50%]
                          border-2
                          border-[var(--color-card)]
                          shadow-[0_0_0_9999px_color-mix(in_srgb,var(--color-text)_18%,transparent)]
                        "
                      />
                    </div>

                    <div
                      className="
                        pointer-events-none
                        absolute inset-x-0 bottom-0
                        bg-[linear-gradient(to_top,color-mix(in_srgb,var(--color-text)_70%,transparent),transparent)]
                        px-5 pb-5 pt-14
                        text-center
                      "
                    >
                      <p className="text-sm font-semibold text-[var(--color-card)]">
                        Posisikan wajah di dalam oval
                      </p>

                      <p className="mt-1 text-xs text-[color-mix(in_srgb,var(--color-card)_75%,transparent)]">
                        Pastikan pencahayaan cukup dan wajah terlihat jelas
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={
                        capturedPhoto.url
                      }
                      alt="Preview wajah"
                      className="aspect-video h-auto w-full object-cover"
                    />

                    <div
                      className={`
                        absolute left-3 top-3
                        rounded-full
                        border ${themeSuccessBorder}
                        ${themeSuccessSurface}
                        px-3 py-1.5
                        text-xs font-bold
                        text-[var(--color-success)]
                        ${themeSmallShadow}
                      `}
                    >
                      Foto siap diverifikasi
                    </div>
                  </>
                )}
              </div>

              <canvas
                ref={canvasRef}
                className="hidden"
              />

              {cameraError && (
                <div
                  className={`
                    mt-4 rounded-xl
                    border ${themeDangerBorder}
                    ${themeDangerSurface}
                    px-4 py-3
                    text-sm
                  `}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle
                      size={17}
                      className="theme-danger mt-0.5 shrink-0"
                    />

                    <p className="theme-danger">
                      {cameraError}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]">
                <MapPin size={14} />

                {location
                  ? `GPS aktif • akurasi ±${Math.round(
                      location.accuracy ||
                        0
                    )} m`
                  : "Mengambil lokasi GPS..."}
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div
              className={`
                flex flex-col gap-3
                border-t ${themeDivider}
                ${themeNeutralSurface}
                p-5
                sm:flex-row sm:justify-end
              `}
            >
              {!capturedPhoto ? (
                <>
                  <button
                    type="button"
                    onClick={
                      stopCamera
                    }
                    disabled={
                      submitting
                    }
                    className={`
                      theme-card
                      theme-text-secondary
                      rounded-xl
                      border ${themeNeutralBorder}
                      px-5 py-3
                      text-sm font-semibold
                      transition
                      ${themeNeutralHover}
                      disabled:opacity-50
                    `}
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={
                      capturePhoto
                    }
                    disabled={
                      submitting ||
                      cameraLoading
                    }
                    className={`
                      ${themePrimaryGradient}
                      rounded-xl
                      px-6 py-3
                      text-sm font-bold
                      text-[var(--color-card)]
                      ${themePrimaryShadow}
                      transition
                      hover:brightness-95
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    `}
                  >
                    Ambil Foto
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={
                      retakePhoto
                    }
                    disabled={
                      submitting
                    }
                    className={`
                      theme-card
                      theme-text-secondary
                      rounded-xl
                      border ${themeNeutralBorder}
                      px-5 py-3
                      text-sm font-semibold
                      transition
                      ${themeNeutralHover}
                      disabled:opacity-50
                    `}
                  >
                    Ambil Ulang
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleCheckin
                    }
                    disabled={
                      submitting ||
                      !location
                    }
                    className={`
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      ${themePrimaryGradient}
                      px-6 py-3
                      text-sm font-bold
                      text-[var(--color-card)]
                      ${themePrimaryShadow}
                      transition
                      hover:brightness-95
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    `}
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                        Memverifikasi Wajah...
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          size={15}
                        />
                        Verifikasi & Check-in
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  iconSurface,
  iconBorder,
}) {
  return (
    <div
      className={`
        theme-card
        rounded-2xl
        border ${themeNeutralBorder}
        p-4 sm:p-5
        ${themeCardShadow}
        transition-all duration-200
        ${themeNeutralHover}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-muted text-[11px] font-medium sm:text-xs">
            {title}
          </p>

          <p className="theme-text mt-1.5 text-2xl font-bold sm:text-3xl">
            {value}
          </p>

          <p className="theme-text-placeholder mt-1 text-[10px] sm:text-xs">
            {description}
          </p>
        </div>

        <div
          className={`
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-xl
            border ${iconBorder}
            ${iconSurface}
          `}
        >
          <Icon
            size={18}
            className={iconClass}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUMMARY BOX
// ============================================================

function SummaryBox({
  label,
  value,
  surface,
  border,
  text,
}) {
  return (
    <div
      className={`
        rounded-xl
        border ${border}
        ${surface}
        p-4
      `}
    >
      <p
        className={`text-xs font-medium ${text}`}
      >
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${text}`}
      >
        {value}
      </p>
    </div>
  );
}