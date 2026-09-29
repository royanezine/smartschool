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
  GraduationCap,
  UserCheck,
  UserX,
  Activity,
  Database,
  Shield,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

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

function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

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
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
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
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getStatusLabel(status) {
  const value = String(status || "").toLowerCase();

  if (value === "hadir") return "Hadir";
  if (value === "terlambat") return "Terlambat";
  if (value === "izin") return "Izin";
  if (value === "sakit") return "Sakit";
  if (value === "alpha" || value === "alpa") return "Alpa";

  return status || "-";
}

function getStatusClass(status) {
  const value = String(status || "").toLowerCase();

  if (value === "hadir") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (value === "terlambat") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (value === "izin") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (value === "sakit") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (value === "alpha" || value === "alpa") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-slate-50 text-slate-600 border-slate-200";
}

function getScheduleList(data) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.jadwal)) return data.jadwal;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;

  return [];
}

function getAbsensiList(data) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.absensi)) return data.absensi;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;

  return [];
}

function getKelasIdFromSchedule(schedule) {
  if (!schedule) return null;

  return (
    schedule.kelasId ||
    schedule.kelas?.id ||
    schedule.kelasMapel?.kelasId ||
    schedule.kelasMapel?.kelas?.id ||
    schedule.kelasMataPelajaran?.kelasId ||
    schedule.kelasMataPelajaran?.kelas?.id ||
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
  const currentDay = getCurrentDayName().toLowerCase();
  const scheduleDay = getScheduleDay(schedule);

  if (!scheduleDay) return true;

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

  if (!match) return null;

  return (
    Number(match[1]) * 60 +
    Number(match[2])
  );
}

function isScheduleCurrentlyActive(schedule) {
  const start = getTimeInMinutes(
    getScheduleStart(schedule)
  );

  const end = getTimeInMinutes(
    getScheduleEnd(schedule)
  );

  if (start === null || end === null) {
    return false;
  }

  const now = new Date();

  const current =
    now.getHours() * 60 + now.getMinutes();

  return current >= start && current <= end;
}

export default function PresensiGuruPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [absensi, setAbsensi] = useState([]);
  const [jadwal, setJadwal] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const [capturedPhoto, setCapturedPhoto] = useState(null);

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] =
    useState(false);
  const [locationError, setLocationError] =
    useState("");

  const [jadwalAktif, setJadwalAktif] =
    useState(null);

  const loadData = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setError("Sesi login tidak ditemukan.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [absensiResponse, jadwalResponse] =
        await Promise.all([
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
        await parseResponse(absensiResponse);

      const jadwalResult =
        await parseResponse(jadwalResponse);

      const absensiData =
        getAbsensiList(absensiResult);

      const jadwalData =
        getScheduleList(jadwalResult);

      setAbsensi(absensiData);
      setJadwal(jadwalData);

      const userRaw =
        typeof window !== "undefined"
          ? localStorage.getItem("user")
          : null;

      if (userRaw) {
        try {
          setUser(JSON.parse(userRaw));
        } catch {
          setUser(null);
        }
      }

      const todaySchedules =
        jadwalData.filter(isTodaySchedule);

      const active =
        todaySchedules.find(
          isScheduleCurrentlyActive
        ) ||
        todaySchedules[0] ||
        null;

      setJadwalAktif(active);
    } catch (err) {
      console.error("Gagal mengambil data presensi:", err);

      setError(
        err?.message ||
          "Gagal mengambil data presensi."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (capturedPhoto?.url) {
        URL.revokeObjectURL(
          capturedPhoto.url
        );
      }
    };
  }, [capturedPhoto]);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
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
            lintang: position.coords.latitude,
            bujur: position.coords.longitude,
            accuracy:
              position.coords.accuracy,
          });
        },
        (err) => {
          let message =
            "Lokasi tidak dapat diperoleh.";

          if (err.code === 1) {
            message =
              "Izin lokasi ditolak. Silakan aktifkan lokasi pada browser.";
          } else if (err.code === 2) {
            message =
              "Lokasi tidak tersedia.";
          } else if (err.code === 3) {
            message =
              "Pengambilan lokasi terlalu lama.";
          }

          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  };

  const checkLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError("");

      const currentLocation =
        await getCurrentLocation();

      setLocation(currentLocation);

      return currentLocation;
    } catch (err) {
      console.error("GPS error:", err);

      setLocationError(
        err?.message ||
          "Lokasi tidak dapat diperoleh."
      );

      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setCameraLoading(true);
      setCameraError("");
      setError("");
      setSuccess("");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Browser tidak mendukung akses kamera."
        );
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

      streamRef.current = stream;

      setCameraOpen(true);

      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current
            .play()
            .catch(() => {});
        }
      });

      await checkLocation();
    } catch (err) {
      console.error("Camera error:", err);

      setCameraError(
        err?.message ||
          "Kamera tidak dapat dibuka."
      );
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    setCameraOpen(false);
    setCameraLoading(false);
    setCameraError("");
  };

  const capturePhoto = () => {
    try {
      setCameraError("");

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) {
        setCameraError("Kamera belum siap.");
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

      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;

      if (!width || !height) {
        setCameraError(
          "Ukuran kamera belum tersedia."
        );
        return;
      }

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

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

          if (capturedPhoto?.url) {
            URL.revokeObjectURL(
              capturedPhoto.url
            );
          }

          const url =
            URL.createObjectURL(blob);

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

  const retakePhoto = () => {
    if (capturedPhoto?.url) {
      URL.revokeObjectURL(
        capturedPhoto.url
      );
    }

    setCapturedPhoto(null);
    setCameraError("");
  };

  const getSelectedSchedule = () => {
    if (jadwalAktif) {
      return jadwalAktif;
    }

    const todaySchedules =
      jadwal.filter(isTodaySchedule);

    return todaySchedules[0] || null;
  };

  const handleCheckin = async () => {
    try {
      setError("");
      setSuccess("");

      if (submitting) return;

      if (!capturedPhoto?.blob) {
        setError(
          "Silakan ambil foto wajah terlebih dahulu."
        );
        return;
      }

      const schedule =
        getSelectedSchedule();

      const kelasId =
        getKelasIdFromSchedule(schedule);

      if (!kelasId) {
        setError(
          "Kelas pada jadwal mengajar tidak ditemukan."
        );
        return;
      }

      let currentLocation = location;

      if (!currentLocation) {
        currentLocation =
          await getCurrentLocation();

        setLocation(currentLocation);
      }

      if (!currentLocation) {
        setError(
          "Lokasi GPS wajib diaktifkan untuk presensi Face ID."
        );
        return;
      }

      const token = getToken();

      if (!token) {
        setError(
          "Sesi login tidak ditemukan."
        );
        return;
      }

      setSubmitting(true);

      const formData = new FormData();

      formData.append(
        "kelasId",
        String(kelasId)
      );

      formData.append("status", "hadir");
      formData.append("metode", "face");

      formData.append(
        "lintang",
        String(currentLocation.lintang)
      );

      formData.append(
        "bujur",
        String(currentLocation.bujur)
      );

      formData.append(
        "snapshot",
        capturedPhoto.blob,
        `face-${Date.now()}.jpg`
      );

      const response = await fetch(
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
        await parseResponse(response);

      setSuccess(
        result?.message ||
          "Presensi Face ID berhasil dicatat."
      );

      setCapturedPhoto(null);
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

  const today = getTodayDate();

  const absensiHariIni = absensi.find(
    (item) => {
      const tanggal =
        item.tanggal ||
        item.waktuAbsensi ||
        item.dibuatPada ||
        item.createdAt;

      if (!tanggal) return false;

      return (
        String(tanggal).substring(0, 10) ===
        today
      );
    }
  );

  const jumlahHadir = absensi.filter(
    (item) =>
      String(item.status || "").toLowerCase() ===
      "hadir"
  ).length;

  const jumlahTerlambat = absensi.filter(
    (item) =>
      String(item.status || "").toLowerCase() ===
      "terlambat"
  ).length;

  const jumlahIzin = absensi.filter(
    (item) =>
      String(item.status || "").toLowerCase() ===
      "izin"
  ).length;

  const todaySchedules =
    jadwal.filter(isTodaySchedule);

  const selectedSchedule =
    getSelectedSchedule();

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        role="guru"
        activeMenu="presensi"
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* HEADER */}

        <Header
          title="Presensi"
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />

        {/* =====================================================
            PAGE (HANYA AREA INI YANG SCROLL)
        ===================================================== */}

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
            {/* =================================================
                PAGE HEADER
            ================================================== */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* TITLE */}

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white flex items-center justify-center shadow-lg shadow-[#155DFC]/20 shrink-0">
                  <Camera size={20} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">
                    Presensi Mengajar
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Presensi mengajar dengan verifikasi Face ID.
                  </p>
                </div>
              </div>

              {/* DATE BADGE */}

              <div className="rounded-xl border border-slate-200 bg-white px-5 py-3">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                  Hari ini
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {new Intl.DateTimeFormat("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date())}
                </p>
              </div>
            </div>

            {/* =================================================
                ALERT ERROR
            ================================================== */}

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">
                    Presensi gagal
                  </p>

                  <p className="mt-0.5 text-sm text-red-700">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* =================================================
                ALERT SUCCESS
            ================================================== */}

            {success && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-800">
                    Berhasil
                  </p>

                  <p className="mt-0.5 text-sm text-emerald-700">
                    {success}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSuccess("")}
                  className="text-emerald-500 hover:text-emerald-700"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* =================================================
                STATISTICS
            ================================================== */}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title="Hadir"
                value={jumlahHadir}
                description="Total kehadiran"
                icon={UserCheck}
                iconClass="text-emerald-500"
              />

              <StatCard
                title="Terlambat"
                value={jumlahTerlambat}
                description="Total keterlambatan"
                icon={Clock}
                iconClass="text-amber-500"
              />

              <StatCard
                title="Izin"
                value={jumlahIzin}
                description="Total izin"
                icon={Calendar}
                iconClass="text-blue-500"
              />

              <StatCard
                title="Total Riwayat"
                value={absensi.length}
                description="Data tersimpan"
                icon={Database}
                iconClass="text-[#155DFC]"
              />
            </div>

            {/* =================================================
                MAIN GRID
            ================================================== */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)]">
              {/* CHECK IN */}

              <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-5 lg:px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#eaf1ff] border border-[#c7dbff] flex items-center justify-center">
                      <Camera
                        size={15}
                        className="text-[#155DFC]"
                      />
                    </div>

                    <h2 className="text-sm font-bold text-slate-800">
                      Check-in Presensi
                    </h2>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    Verifikasi wajah untuk mencatat kehadiran mengajar.
                  </p>
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                  {/* JADWAL AKTIF */}

                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                          Jadwal Mengajar
                        </p>

                        <p className="mt-1 text-base font-bold text-slate-900 truncate">
                          {selectedSchedule
                            ? getScheduleMapel(selectedSchedule)
                            : "Belum ada jadwal"}
                        </p>

                        <p className="mt-1 text-sm text-slate-600 truncate">
                          {selectedSchedule
                            ? getScheduleKelas(selectedSchedule)
                            : "Tidak ada jadwal mengajar hari ini"}
                        </p>
                      </div>

                      {selectedSchedule && (
                        <div className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-right shrink-0">
                          <p className="text-[10px] text-slate-500">
                            Jam
                          </p>

                          <p className="text-sm font-bold text-blue-700">
                            {formatJam(getScheduleStart(selectedSchedule))}{" "}
                            -{" "}
                            {formatJam(getScheduleEnd(selectedSchedule))}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* STATUS HARI INI */}

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Status Hari Ini
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Status presensi kamu untuk hari ini.
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                          absensiHariIni
                            ? getStatusClass(absensiHariIni.status)
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {absensiHariIni
                          ? getStatusLabel(absensiHariIni.status)
                          : "Belum Absen"}
                      </span>
                    </div>
                  </div>

                  {/* GPS STATUS */}

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                        <MapPin size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800">
                          Lokasi GPS
                        </p>

                        {locationLoading ? (
                          <p className="mt-1 text-xs text-slate-500">
                            Mengambil lokasi...
                          </p>
                        ) : location ? (
                          <p className="mt-1 text-xs text-emerald-600">
                            Lokasi berhasil didapatkan
                            {location.accuracy
                              ? ` • Akurasi ±${Math.round(
                                  location.accuracy
                                )} m`
                              : ""}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-slate-500">
                            GPS akan digunakan saat melakukan presensi.
                          </p>
                        )}

                        {locationError && (
                          <p className="mt-1 text-xs text-red-600">
                            {locationError}
                          </p>
                        )}
                      </div>

                      {!location && (
                        <button
                          type="button"
                          onClick={checkLocation}
                          disabled={locationLoading}
                          className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                    onClick={startCamera}
                    disabled={
                      cameraLoading ||
                      submitting ||
                      Boolean(absensiHariIni)
                    }
                    className="
                      group
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-3
                      rounded-xl
                      bg-gradient-to-r
                      from-[#155DFC]
                      to-[#0d47c9]
                      px-5
                      py-4
                      text-sm
                      font-bold
                      text-white
                      shadow-sm
                      transition
                      hover:brightness-110
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
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

                  <p className="text-center text-xs leading-5 text-slate-400">
                    Pastikan wajah terlihat jelas, pencahayaan cukup,
                    dan posisi wajah berada di dalam oval.
                  </p>
                </div>
              </section>

              {/* SUMMARY */}

              <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-5 lg:px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#eaf1ff] border border-[#c7dbff] flex items-center justify-center">
                      <Activity
                        size={15}
                        className="text-[#155DFC]"
                      />
                    </div>

                    <h2 className="text-sm font-bold text-slate-800">
                      Ringkasan Presensi
                    </h2>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    Rekap data presensi kamu.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 p-4 sm:p-6 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-xs font-medium text-emerald-600">
                      Hadir
                    </p>

                    <p className="mt-2 text-2xl font-bold text-emerald-700">
                      {jumlahHadir}
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                    <p className="text-xs font-medium text-amber-600">
                      Terlambat
                    </p>

                    <p className="mt-2 text-2xl font-bold text-amber-700">
                      {jumlahTerlambat}
                    </p>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-xs font-medium text-blue-600">
                      Izin
                    </p>

                    <p className="mt-2 text-2xl font-bold text-blue-700">
                      {jumlahIzin}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Total Riwayat
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {absensi.length}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    data presensi tersimpan
                  </p>
                </div>
              </section>
            </div>

            {/* =================================================
                JADWAL HARI INI
            ================================================== */}

            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-5 lg:px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#eaf1ff] border border-[#c7dbff] flex items-center justify-center">
                    <BookOpen
                      size={15}
                      className="text-[#155DFC]"
                    />
                  </div>

                  <h2 className="text-sm font-bold text-slate-800">
                    Jadwal Hari Ini
                  </h2>
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  Daftar jadwal mengajar kamu hari ini.
                </p>
              </div>

              <div className="p-4 sm:p-6">
                {loading ? (
                  <div className="py-10 text-center text-sm text-slate-500">
                    Memuat jadwal...
                  </div>
                ) : todaySchedules.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      Belum ada jadwal mengajar hari ini.
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Jadwal akan muncul jika sudah tersedia.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {todaySchedules.map((schedule, index) => {
                      const active = jadwalAktif === schedule;

                      return (
                        <div
                          key={
                            schedule.id ||
                            schedule.jadwalId ||
                            index
                          }
                          className={`rounded-xl border p-4 transition ${
                            active
                              ? "border-blue-200 bg-blue-50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {getScheduleMapel(schedule)}
                              </p>

                              <p className="mt-1 text-xs text-slate-500 truncate">
                                {getScheduleKelas(schedule)}
                              </p>
                            </div>

                            {active && (
                              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white shrink-0">
                                Aktif
                              </span>
                            )}
                          </div>

                          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-600">
                            <Clock size={13} />

                            {formatJam(getScheduleStart(schedule))}{" "}
                            -{" "}
                            {formatJam(getScheduleEnd(schedule))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                RIWAYAT
            ================================================== */}

            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-5 lg:px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#eaf1ff] border border-[#c7dbff] flex items-center justify-center">
                    <Database
                      size={15}
                      className="text-[#155DFC]"
                    />
                  </div>

                  <h2 className="text-sm font-bold text-slate-800">
                    Riwayat Presensi
                  </h2>
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  Riwayat presensi yang sudah tercatat.
                </p>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="px-6 py-10 text-center text-sm text-slate-500">
                    Memuat riwayat...
                  </div>
                ) : absensi.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      Belum ada riwayat presensi.
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Data presensi akan muncul setelah kamu melakukan check-in.
                    </p>
                  </div>
                ) : (
                  <table className="w-full min-w-[700px] text-left">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white">
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
                      {absensi.slice(0, 10).map((item, index) => {
                        const date =
                          item.tanggal ||
                          item.waktuAbsensi ||
                          item.dibuatPada ||
                          item.createdAt;

                        return (
                          <tr
                            key={item.id || index}
                            className="border-b border-slate-100 last:border-0 hover:bg-[#eaf1ff] transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-medium text-slate-800">
                              {formatTanggal(date)}
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-600">
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
                                {getStatusLabel(item.status)}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-sm capitalize text-slate-600">
                              {item.metode || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* =====================================================
          CAMERA MODAL
      ====================================================== */}

      {cameraOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#eaf1ff] border border-[#c7dbff] flex items-center justify-center">
                  <Shield
                    size={17}
                    className="text-[#155DFC]"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Verifikasi Face ID
                  </h3>

                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Posisikan wajah di tengah oval.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={stopCamera}
                disabled={submitting}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* CAMERA AREA */}

            <div className="bg-slate-950 p-4 sm:p-6">
              <div className="relative mx-auto w-full max-w-[620px] overflow-hidden rounded-2xl bg-black">
                {!capturedPhoto ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="aspect-video h-auto w-full object-cover"
                      style={{ transform: "scaleX(-1)" }}
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
                          border-white/90
                          shadow-[0_0_0_9999px_rgba(0,0,0,0.18)]
                        "
                      />
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-5 pb-5 pt-14 text-center">
                      <p className="text-sm font-semibold text-white">
                        Posisikan wajah di dalam oval
                      </p>

                      <p className="mt-1 text-xs text-white/75">
                        Pastikan pencahayaan cukup dan wajah terlihat jelas
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={capturedPhoto.url}
                      alt="Preview wajah"
                      className="aspect-video h-auto w-full object-cover"
                    />

                    <div className="absolute left-3 top-3 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow">
                      Foto siap diverifikasi
                    </div>
                  </>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              {cameraError && (
                <div className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {cameraError}
                </div>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/70">
                <MapPin size={14} />

                {location
                  ? `GPS aktif • akurasi ±${Math.round(
                      location.accuracy || 0
                    )} m`
                  : "Mengambil lokasi GPS..."}
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-white p-5 sm:flex-row sm:justify-end">
              {!capturedPhoto ? (
                <>
                  <button
                    type="button"
                    onClick={stopCamera}
                    disabled={submitting}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={submitting || cameraLoading}
                    className="rounded-xl bg-gradient-to-r from-[#155DFC] to-[#0d47c9] px-6 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Ambil Foto
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={retakePhoto}
                    disabled={submitting}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Ambil Ulang
                  </button>

                  <button
                    type="button"
                    onClick={handleCheckin}
                    disabled={submitting || !location}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#0d47c9] px-6 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
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
                        <CheckCircle2 size={15} />
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

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
}) {
  return (
    <div
      className="
        bg-white
        rounded-2xl
        border
        border-slate-200/80
        p-4
        sm:p-5
        shadow-sm
        hover:shadow-md
        transition-all
        duration-200
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-1.5 text-2xl sm:text-3xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-[10px] sm:text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className="
            w-10
            h-10
            rounded-xl
            bg-slate-50
            border
            border-slate-100
            flex
            items-center
            justify-center
            shrink-0
          "
        >
          <Icon size={18} className={iconClass} />
        </div>
      </div>
    </div>
  );
}