"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Fingerprint,
  GraduationCap,
  Info,
  Mail,
  RefreshCw,
  ScanFace,
  ShieldCheck,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react";

/* =========================================================
   API CONFIG
========================================================= */

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const API_URL = API_BASE.endsWith("/api")
  ? API_BASE
  : `${API_BASE}/api`;

/* =========================================================
   ROLE CONFIG
========================================================= */

const roleConfig = {
  Guru: {
    icon: GraduationCap,
    className: "bg-blue-50 text-blue-600 border-blue-200",
  },

  Siswa: {
    icon: GraduationCap,
    className: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },

  Staff: {
    icon: UserCheck,
    className: "bg-amber-50 text-amber-600 border-amber-200",
  },

  Admin: {
    icon: ShieldCheck,
    className: "bg-purple-50 text-purple-600 border-purple-200",
  },
};

/* =========================================================
   ROLE BADGE
========================================================= */

function RoleBadge({ role }) {
  const config = roleConfig[role] || {
    icon: Users,
    className: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${config.className}`}
    >
      <Icon size={12} />
      {role}
    </span>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#eaf1ff] border border-[#c7dbff] flex items-center justify-center shrink-0">
        <Icon size={14} className="text-[#155DFC]" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
          {label}
        </p>

        <p className="text-sm font-medium text-slate-700 mt-0.5 truncate">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   NORMALIZE ROLE
========================================================= */

function normalizeRole(user) {
  const role = (
    user?.peran?.namaTampilan ||
    user?.peran?.nama ||
    ""
  ).toLowerCase();

  if (role.includes("guru")) {
    return "Guru";
  }

  if (role.includes("siswa") || role.includes("student")) {
    return "Siswa";
  }

  if (
    role.includes("admin") &&
    !role.includes("super")
  ) {
    return "Admin";
  }

  if (
    role.includes("staff") ||
    role.includes("staf")
  ) {
    return "Staff";
  }

  return "Staff";
}

/* =========================================================
   NORMALIZE USER
========================================================= */

function normalizeUser(user) {
  const nama =
    user?.namaLengkap ||
    user?.namaPengguna ||
    "Pengguna";

  const biometric = user?.biometrikWajah;

  const faceRegistered =
    biometric?.status === "aktif";

  return {
    id: user?.id || "",
    nama,
    username: user?.namaPengguna || "-",
    email: user?.email || "-",
    role: normalizeRole(user),
    jabatan:
      user?.jabatan ||
      user?.nisn ||
      user?.nip ||
      "Pengguna",
    status:
      user?.status === "aktif"
        ? "Aktif"
        : "Nonaktif",
    faceId: faceRegistered,
  };
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function TambahFaceIdPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  /* USER */

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [searchUser, setSearchUser] =
    useState("");

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [showUserList, setShowUserList] =
    useState(false);

  /* CAMERA */

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] =
    useState(false);

  const [faceDetected, setFaceDetected] =
    useState(false);

  const [capturedFile, setCapturedFile] =
    useState(null);

  const [previewUrl, setPreviewUrl] =
    useState("");

  /* REGISTRATION */

  const [
    registrationComplete,
    setRegistrationComplete,
  ] = useState(false);

  const [saving, setSaving] = useState(false);

  /* MESSAGE */

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  /* =======================================================
     LOAD USERS
  ======================================================= */

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Token login tidak ditemukan. Silakan login kembali.",
        );
      }

      const response = await fetch(
        `${API_URL}/users?page=1&limit=1000`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Gagal mengambil data pengguna.",
        );
      }

      /*
       * Menyesuaikan beberapa kemungkinan
       * bentuk response paginatedResponse.
       */

      let list = [];

      if (Array.isArray(result?.data)) {
        list = result.data;
      } else if (
        Array.isArray(result?.data?.data)
      ) {
        list = result.data.data;
      } else if (
        Array.isArray(result?.data?.items)
      ) {
        list = result.data.items;
      } else if (
        Array.isArray(result?.items)
      ) {
        list = result.items;
      }

      const normalized = list.map(normalizeUser);

      setUsers(normalized);
    } catch (err) {
      console.error(
        "Error load users:",
        err,
      );

      setError(
        err?.message ||
          "Gagal mengambil data pengguna.",
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadUsers();
  }, []);

  /* =======================================================
     FILTER USER
  ======================================================= */

  const availableUsers = useMemo(() => {
    const keyword =
      searchUser.toLowerCase().trim();

    return users.filter((user) => {
      const matchSearch =
        user.nama
          .toLowerCase()
          .includes(keyword) ||
        user.username
          .toLowerCase()
          .includes(keyword) ||
        user.id
          .toLowerCase()
          .includes(keyword) ||
        user.email
          .toLowerCase()
          .includes(keyword);

      return (
        matchSearch &&
        user.status === "Aktif" &&
        !user.faceId
      );
    });
  }, [users, searchUser]);

  /* =======================================================
     SIDEBAR
  ======================================================= */

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  /* =======================================================
     STOP CAMERA
  ======================================================= */

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
  };

  /* =======================================================
     SELECT USER
  ======================================================= */

  const handleSelectUser = (user) => {
    stopCamera();

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedUser(user);
    setSearchUser(user.nama);
    setShowUserList(false);

    setFaceDetected(false);
    setCapturedFile(null);
    setPreviewUrl("");
    setRegistrationComplete(false);

    setError("");
    setSuccessMessage("");
  };

  /* =======================================================
     START CAMERA
  ======================================================= */

  const handleStartCamera = async () => {
    if (!selectedUser) {
      setError(
        "Pilih pengguna terlebih dahulu.",
      );
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Browser tidak mendukung akses kamera.",
        );
      }

      /*
       * Kalau sebelumnya ada preview,
       * bersihkan terlebih dahulu.
       */

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl("");
      setCapturedFile(null);
      setFaceDetected(false);
      setRegistrationComplete(false);

      /*
       * Minta izin kamera.
       */

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              facingMode: "user",
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
            },
            audio: false,
          },
        );

      streamRef.current = stream;

      setCameraActive(true);
    } catch (err) {
      console.error(
        "Camera error:",
        err,
      );

      if (
        err?.name ===
        "NotAllowedError"
      ) {
        setError(
          "Akses kamera ditolak. Izinkan kamera pada browser terlebih dahulu.",
        );
      } else if (
        err?.name ===
        "NotFoundError"
      ) {
        setError(
          "Kamera tidak ditemukan pada perangkat.",
        );
      } else {
        setError(
          err?.message ||
            "Kamera tidak dapat diaktifkan.",
        );
      }

      setCameraActive(false);
    }
  };

  /* =======================================================
     CONNECT STREAM TO VIDEO
  ======================================================= */

  useEffect(() => {
    if (
      cameraActive &&
      videoRef.current &&
      streamRef.current
    ) {
      videoRef.current.srcObject =
        streamRef.current;

      videoRef.current
        .play()
        .catch(() => {});
    }
  }, [cameraActive]);

  /* =======================================================
     CAPTURE PHOTO
  ======================================================= */

  const handleCapture = () => {
    if (!videoRef.current) {
      setError(
        "Kamera belum siap.",
      );
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!canvas) {
      setError(
        "Canvas kamera belum siap.",
      );
      return;
    }

    if (
      !video.videoWidth ||
      !video.videoHeight
    ) {
      setError(
        "Video kamera belum siap. Tunggu sebentar lalu coba lagi.",
      );
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context =
      canvas.getContext("2d");

    if (!context) {
      setError(
        "Gagal memproses gambar kamera.",
      );
      return;
    }

    /*
     * Mirror kembali agar hasil foto
     * terlihat natural.
     */

    context.save();

    context.translate(
      canvas.width,
      0,
    );

    context.scale(-1, 1);

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    context.restore();

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError(
            "Gagal mengambil foto.",
          );
          return;
        }

        const file = new File(
          [blob],
          `face-${selectedUser.id}-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          },
        );

        const url =
          URL.createObjectURL(blob);

        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }

        setCapturedFile(file);
        setPreviewUrl(url);

        /*
         * Untuk tahap enrollment,
         * foto berhasil diambil = siap disimpan.
         */

        setFaceDetected(true);

        stopCamera();
      },
      "image/jpeg",
      0.92,
    );
  };

  /* =======================================================
     RESET CAPTURE
  ======================================================= */

  const handleReset = () => {
    stopCamera();

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl("");
    setCapturedFile(null);
    setFaceDetected(false);
    setRegistrationComplete(false);
    setError("");
    setSuccessMessage("");
  };

  /* =======================================================
     REGISTER FACE ID
  ======================================================= */

  const handleRegisterFace = async () => {
    if (!selectedUser) {
      setError(
        "Pilih pengguna terlebih dahulu.",
      );
      return;
    }

    if (!capturedFile) {
      setError(
        "Ambil foto wajah terlebih dahulu.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Token login tidak ditemukan. Silakan login kembali.",
        );
      }

      const formData = new FormData();

      /*
       * Nama field harus sama dengan
       * upload.single("foto") di backend.
       */

      formData.append(
        "foto",
        capturedFile,
      );

      const response = await fetch(
        `${API_URL}/users/${selectedUser.id}/face-id`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Gagal mendaftarkan Face ID.",
        );
      }

      setRegistrationComplete(true);

      setSuccessMessage(
        result?.message ||
          "Face ID berhasil didaftarkan.",
      );

      /*
       * Update data user setelah berhasil.
       */

      await loadUsers();

      /*
       * User yang baru didaftarkan tidak lagi
       * masuk ke daftar pengguna yang tersedia.
       */

      setSelectedUser((prev) =>
        prev
          ? {
              ...prev,
              faceId: true,
            }
          : prev,
      );
    } catch (err) {
      console.error(
        "Register Face ID error:",
        err,
      );

      setError(
        err?.message ||
          "Gagal mendaftarkan Face ID.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     CLOSE SELECTED USER
  ======================================================= */

  const handleClearUser = () => {
    stopCamera();

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedUser(null);
    setSearchUser("");
    setShowUserList(false);

    setFaceDetected(false);
    setCapturedFile(null);
    setPreviewUrl("");
    setRegistrationComplete(false);

    setError("");
    setSuccessMessage("");
  };

  /* =======================================================
     CLEANUP
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

      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl,
        );
      }
    };
  }, [previewUrl]);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        active="pengguna"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto space-y-6">

              {/* =================================================
                  BACK
              ================================================== */}

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/pengguna/face-id",
                    )
                  }
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#155DFC] transition"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Daftar Face ID
                </button>

                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                  <span>Pengguna</span>
                  <span>/</span>
                  <span>Face ID</span>
                  <span>/</span>
                  <span className="text-[#155DFC] font-medium">
                    Daftar Face ID
                  </span>
                </div>
              </div>

              {/* =================================================
                  PAGE HEADER
              ================================================== */}

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6 lg:p-7">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white flex items-center justify-center shadow-lg shadow-[#155DFC]/20 shrink-0">
                        <ScanFace size={25} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                            Daftar Face ID
                          </h1>

                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eaf1ff] text-[#155DFC] border border-[#c7dbff] text-[10px] font-bold">
                            <ShieldCheck size={12} />
                            Secure
                          </span>
                        </div>

                        <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
                          Daftarkan data wajah pengguna
                          untuk digunakan sebagai
                          identifikasi pada sistem
                          presensi SmartSchool.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-[10px] text-slate-400">
                          Status Sistem
                        </p>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />

                          <span className="text-xs font-semibold text-emerald-600">
                            Siap Digunakan
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* =================================================
                  ERROR
              ================================================== */}

              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                  <CircleAlert
                    size={17}
                    className="text-red-500 shrink-0 mt-0.5"
                  />

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-700">
                      Terjadi kesalahan
                    </p>

                    <p className="text-xs text-red-600 mt-1 leading-5">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                    className="text-red-400 hover:text-red-600"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              {/* =================================================
                  SUCCESS
              ================================================== */}

              {successMessage && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle2
                    size={17}
                    className="text-emerald-600 shrink-0 mt-0.5"
                  />

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-700">
                      Berhasil
                    </p>

                    <p className="text-xs text-emerald-600 mt-1">
                      {successMessage}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSuccessMessage("")
                    }
                    className="text-emerald-400 hover:text-emerald-600"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              {/* =================================================
                  STEP INDICATOR
              ================================================== */}

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                  {/* STEP 1 */}

                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        selectedUser
                          ? "bg-emerald-500 text-white"
                          : "bg-[#155DFC] text-white"
                      }`}
                    >
                      {selectedUser ? (
                        <Check size={17} />
                      ) : (
                        <span className="text-sm font-bold">
                          1
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Langkah 1
                      </p>

                      <p className="text-sm font-semibold text-slate-700">
                        Pilih Pengguna
                      </p>
                    </div>
                  </div>

                  {/* STEP 2 */}

                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        faceDetected
                          ? "bg-emerald-500 text-white"
                          : cameraActive
                            ? "bg-[#155DFC] text-white"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {faceDetected ? (
                        <Check size={17} />
                      ) : (
                        <span className="text-sm font-bold">
                          2
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Langkah 2
                      </p>

                      <p className="text-sm font-semibold text-slate-700">
                        Scan Wajah
                      </p>
                    </div>
                  </div>

                  {/* STEP 3 */}

                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        registrationComplete
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {registrationComplete ? (
                        <Check size={17} />
                      ) : (
                        <span className="text-sm font-bold">
                          3
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Langkah 3
                      </p>

                      <p className="text-sm font-semibold text-slate-700">
                        Simpan Face ID
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* =================================================
                  MAIN GRID
              ================================================== */}

              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)] gap-6">

                {/* =================================================
                    LEFT - CAMERA
                ================================================== */}

                <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

                  <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center justify-between gap-3">

                      <div>
                        <h2 className="text-sm font-bold text-slate-800">
                          Pendaftaran Wajah
                        </h2>

                        <p className="text-xs text-slate-400 mt-1">
                          Pastikan wajah terlihat jelas
                          pada area kamera.
                        </p>
                      </div>

                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border ${
                          cameraActive
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cameraActive
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />

                        {cameraActive
                          ? "Kamera Aktif"
                          : "Kamera Belum Aktif"}
                      </div>

                    </div>
                  </div>

                  <div className="p-5 sm:p-6">

                    {/* CAMERA AREA */}

                    <div className="relative w-full aspect-[4/3] max-h-[520px] rounded-2xl overflow-hidden bg-slate-950">

                      {/* CAMERA VIDEO */}

                      {cameraActive && (
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                        />
                      )}

                      {/* BACKGROUND */}

                      {!cameraActive &&
                        !previewUrl && (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#101c35] to-[#071022]" />
                        )}

                      {/* PREVIEW */}

                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Preview Face ID"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}

                      {/* DECORATIVE GRID */}

                      {!previewUrl && (
                        <div
                          className="absolute inset-0 opacity-[0.08] pointer-events-none"
                          style={{
                            backgroundImage:
                              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
                            backgroundSize:
                              "40px 40px",
                          }}
                        />
                      )}

                      {/* EMPTY CAMERA */}

                      {!cameraActive &&
                        !previewUrl && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center px-6">

                              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm flex items-center justify-center">
                                <Camera
                                  size={28}
                                  className="text-white/80"
                                />
                              </div>

                              <h3 className="mt-4 text-sm font-semibold text-white">
                                Kamera belum
                                diaktifkan
                              </h3>

                              <p className="mt-1.5 text-xs text-white/50 max-w-xs mx-auto">
                                Pilih pengguna terlebih
                                dahulu, kemudian
                                aktifkan kamera untuk
                                melakukan scan wajah.
                              </p>

                            </div>
                          </div>
                        )}

                      {/* FACE FRAME */}

                      {cameraActive && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

                          <div
                            className={`relative w-[48%] max-w-[230px] aspect-[3/4] rounded-[45%] border-2 transition-all duration-500 ${
                              faceDetected
                                ? "border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.25)]"
                                : "border-white/70"
                            }`}
                          >

                            {/* CORNERS */}

                            <span className="absolute -top-1 -left-1 w-7 h-7 border-l-2 border-t-2 border-[#155DFC] rounded-tl-xl" />

                            <span className="absolute -top-1 -right-1 w-7 h-7 border-r-2 border-t-2 border-[#155DFC] rounded-tr-xl" />

                            <span className="absolute -bottom-1 -left-1 w-7 h-7 border-l-2 border-b-2 border-[#155DFC] rounded-bl-xl" />

                            <span className="absolute -bottom-1 -right-1 w-7 h-7 border-r-2 border-b-2 border-[#155DFC] rounded-br-xl" />

                            {/* SCAN LINE */}

                            {!faceDetected && (
                              <div className="absolute left-3 right-3 top-1/2 h-px bg-[#60a5fa] shadow-[0_0_12px_rgba(96,165,250,0.8)] animate-pulse" />
                            )}

                          </div>

                        </div>
                      )}

                      {/* CAMERA STATUS */}

                      {cameraActive && (
                        <>
                          <div className="absolute top-4 left-1/2 -translate-x-1/2">
                            <div className="px-3 py-1.5 rounded-full backdrop-blur-md border text-[11px] font-semibold bg-white/10 border-white/10 text-white/80">
                              Posisikan wajah di dalam
                              frame
                            </div>
                          </div>

                          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">

                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />

                              <span className="text-[10px] font-medium text-white/70">
                                LIVE CAMERA
                              </span>
                            </div>

                            <span className="text-[10px] font-medium text-white/60">
                              Pastikan hanya satu
                              wajah
                            </span>

                          </div>
                        </>
                      )}

                      {/* CAPTURED STATUS */}

                      {previewUrl && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2">
                          <div className="px-3 py-1.5 rounded-full backdrop-blur-md border text-[11px] font-semibold bg-emerald-500/15 border-emerald-400/30 text-emerald-300">
                            Foto wajah siap
                            disimpan
                          </div>
                        </div>
                      )}

                      {/* HIDDEN CANVAS */}

                      <canvas
                        ref={canvasRef}
                        className="hidden"
                      />

                    </div>

                    {/* CAMERA CONTROLS */}

                    <div className="flex flex-col sm:flex-row gap-2 mt-4">

                      {!cameraActive &&
                      !capturedFile ? (
                        <button
                          type="button"
                          disabled={
                            !selectedUser ||
                            loadingUsers
                          }
                          onClick={
                            handleStartCamera
                          }
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold shadow-sm hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Camera size={17} />

                          {loadingUsers
                            ? "Memuat pengguna..."
                            : "Aktifkan Kamera"}
                        </button>
                      ) : cameraActive ? (
                        <>
                          <button
                            type="button"
                            onClick={
                              handleReset
                            }
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                          >
                            <RefreshCw
                              size={16}
                            />
                            Batal Scan
                          </button>

                          <button
                            type="button"
                            onClick={
                              handleCapture
                            }
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold shadow-sm hover:brightness-110 transition"
                          >
                            <Camera size={17} />
                            Ambil Foto
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={
                              handleReset
                            }
                            disabled={saving}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-40"
                          >
                            <RefreshCw
                              size={16}
                            />
                            Scan Ulang
                          </button>

                          <button
                            type="button"
                            disabled={
                              !capturedFile ||
                              saving
                            }
                            onClick={
                              handleRegisterFace
                            }
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold shadow-sm hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Fingerprint
                              size={17}
                            />

                            {saving
                              ? "Menyimpan..."
                              : "Simpan Face ID"}
                          </button>
                        </>
                      )}

                    </div>

                    {!selectedUser && (
                      <div className="flex items-start gap-2 mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                        <CircleAlert
                          size={15}
                          className="text-amber-500 shrink-0 mt-0.5"
                        />

                        <p className="text-[11px] leading-5 text-amber-700">
                          Pilih pengguna terlebih dahulu
                          sebelum mengaktifkan kamera.
                        </p>
                      </div>
                    )}

                    {capturedFile &&
                      !registrationComplete && (
                        <div className="flex items-start gap-3 mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200">

                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <CheckCircle2
                              size={17}
                              className="text-blue-600"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-blue-700">
                              Foto wajah berhasil
                              diambil
                            </p>

                            <p className="text-xs text-blue-600 mt-1 leading-5">
                              Periksa kembali foto wajah,
                              lalu klik "Simpan Face ID".
                            </p>
                          </div>

                        </div>
                      )}

                    {registrationComplete && (
                      <div className="flex items-start gap-3 mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">

                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                          <CheckCircle2
                            size={17}
                            className="text-emerald-600"
                          />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-emerald-700">
                            Face ID berhasil
                            didaftarkan
                          </p>

                          <p className="text-xs text-emerald-600 mt-1 leading-5">
                            Data wajah pengguna telah
                            tersimpan dan siap digunakan
                            untuk sistem identifikasi
                            SmartSchool.
                          </p>
                        </div>

                      </div>
                    )}

                  </div>
                </section>

                {/* =================================================
                    RIGHT
                ================================================== */}

                <div className="space-y-6">

                  {/* USER SELECT */}

                  <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-visible">

                    <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
                      <h2 className="text-sm font-bold text-slate-800">
                        Pilih Pengguna
                      </h2>

                      <p className="text-xs text-slate-400 mt-1">
                        Pilih akun yang akan
                        didaftarkan Face ID.
                      </p>
                    </div>

                    <div className="p-5 sm:p-6">

                      <div className="relative">

                        <div className="relative">
                          <Users
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            type="text"
                            value={searchUser}
                            onFocus={() =>
                              setShowUserList(
                                true,
                              )
                            }
                            onChange={(event) => {
                              setSearchUser(
                                event.target
                                  .value,
                              );

                              setSelectedUser(
                                null,
                              );

                              setShowUserList(
                                true,
                              );

                              handleReset();
                            }}
                            placeholder="Cari nama, username, atau ID..."
                            className="w-full pl-9 pr-10 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-[#155DFC]/50"
                          />

                          <ChevronDown
                            size={16}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition ${
                              showUserList
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </div>

                        {showUserList && (
                          <div className="absolute z-30 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">

                            <div className="max-h-64 overflow-y-auto">

                              {loadingUsers ? (
                                <div className="px-5 py-8 text-center">
                                  <RefreshCw
                                    size={20}
                                    className="mx-auto text-slate-300 animate-spin"
                                  />

                                  <p className="text-xs font-semibold text-slate-600 mt-2">
                                    Memuat pengguna...
                                  </p>
                                </div>
                              ) : availableUsers.length >
                                0 ? (
                                availableUsers.map(
                                  (user) => (
                                    <button
                                      type="button"
                                      key={
                                        user.id
                                      }
                                      onClick={() =>
                                        handleSelectUser(
                                          user,
                                        )
                                      }
                                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#eaf1ff] transition border-b border-slate-100 last:border-0"
                                    >
                                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                        {user.nama
                                          .split(
                                            " ",
                                          )
                                          .map(
                                            (
                                              item,
                                            ) =>
                                              item[0],
                                          )
                                          .slice(
                                            0,
                                            2,
                                          )
                                          .join(
                                            "",
                                          )}
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold text-slate-700 truncate">
                                          {
                                            user.nama
                                          }
                                        </p>

                                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                          {
                                            user.id
                                          }{" "}
                                          •{" "}
                                          {
                                            user.jabatan
                                          }
                                        </p>
                                      </div>

                                      <RoleBadge
                                        role={
                                          user.role
                                        }
                                      />
                                    </button>
                                  ),
                                )
                              ) : (
                                <div className="px-5 py-8 text-center">
                                  <Users
                                    size={20}
                                    className="mx-auto text-slate-300"
                                  />

                                  <p className="text-xs font-semibold text-slate-600 mt-2">
                                    Pengguna tidak
                                    ditemukan
                                  </p>

                                  <p className="text-[10px] text-slate-400 mt-1">
                                    Pengguna aktif yang
                                    belum memiliki Face
                                    ID tidak ditemukan.
                                  </p>
                                </div>
                              )}

                            </div>
                          </div>
                        )}

                      </div>

                      {/* SELECTED USER */}

                      {selectedUser && (
                        <div className="mt-4 p-4 rounded-xl bg-[#f7f9ff] border border-[#dbe7ff]">

                          <div className="flex items-center gap-3">

                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white flex items-center justify-center text-xs font-bold shrink-0">
                              {selectedUser.nama
                                .split(
                                  " ",
                                )
                                .map(
                                  (item) =>
                                    item[0],
                                )
                                .slice(
                                  0,
                                  2,
                                )
                                .join("")}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-800 truncate">
                                {
                                  selectedUser.nama
                                }
                              </p>

                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {
                                  selectedUser.email
                                }
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={
                                handleClearUser
                              }
                              className="w-7 h-7 rounded-lg hover:bg-white text-slate-400 hover:text-red-500 flex items-center justify-center transition"
                            >
                              <X size={14} />
                            </button>

                          </div>

                          <div className="flex items-center gap-2 mt-3">
                            <RoleBadge
                              role={
                                selectedUser.role
                              }
                            />

                            <span className="text-[10px] text-slate-400">
                              {selectedUser.id}
                            </span>
                          </div>

                        </div>
                      )}

                    </div>
                  </section>

                  {/* DETAIL USER */}

                  <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

                    <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
                      <h2 className="text-sm font-bold text-slate-800">
                        Informasi Pengguna
                      </h2>

                      <p className="text-xs text-slate-400 mt-1">
                        Detail akun yang dipilih.
                      </p>
                    </div>

                    <div className="p-5 sm:p-6">

                      {selectedUser ? (
                        <div className="space-y-4">

                          <InfoItem
                            icon={User}
                            label="Nama Lengkap"
                            value={
                              selectedUser.nama
                            }
                          />

                          <InfoItem
                            icon={Users}
                            label="User ID"
                            value={
                              selectedUser.id
                            }
                          />

                          <InfoItem
                            icon={Mail}
                            label="Email"
                            value={
                              selectedUser.email
                            }
                          />

                          <InfoItem
                            icon={UserCheck}
                            label="Username"
                            value={`@${selectedUser.username}`}
                          />

                          <InfoItem
                            icon={
                              GraduationCap
                            }
                            label="Jabatan / Keterangan"
                            value={
                              selectedUser.jabatan
                            }
                          />

                        </div>
                      ) : (
                        <div className="py-8 text-center">

                          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                            <User
                              size={20}
                              className="text-slate-300"
                            />
                          </div>

                          <p className="text-xs font-semibold text-slate-600 mt-3">
                            Belum ada pengguna
                            dipilih
                          </p>

                          <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">
                            Informasi pengguna akan
                            tampil setelah kamu
                            memilih akun.
                          </p>

                        </div>
                      )}

                    </div>
                  </section>

                  {/* INSTRUCTION */}

                  <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

                    <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Info
                          size={15}
                          className="text-[#155DFC]"
                        />

                        <h2 className="text-sm font-bold text-slate-800">
                          Panduan Pendaftaran
                        </h2>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">

                      <div className="space-y-3">

                        {[
                          "Pastikan pencahayaan wajah cukup dan merata.",
                          "Posisikan wajah tepat di tengah area kamera.",
                          "Lepaskan masker, topi, atau benda yang menutupi wajah.",
                          "Tatap kamera dan jangan banyak bergerak saat mengambil foto.",
                          "Pastikan hanya satu wajah yang berada di area kamera.",
                        ].map(
                          (text, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3"
                            >
                              <div className="w-6 h-6 rounded-full bg-[#eaf1ff] text-[#155DFC] border border-[#c7dbff] flex items-center justify-center text-[10px] font-bold shrink-0">
                                {index + 1}
                              </div>

                              <p className="text-xs leading-5 text-slate-500">
                                {text}
                              </p>
                            </div>
                          ),
                        )}

                      </div>

                    </div>
                  </section>

                </div>
              </div>

              {/* =================================================
                  SECURITY NOTICE
              ================================================== */}

              <section className="bg-[#f7f9ff] rounded-2xl border border-[#dbe7ff] p-4 sm:p-5">

                <div className="flex items-start gap-3">

                  <div className="w-9 h-9 rounded-xl bg-white border border-[#c7dbff] flex items-center justify-center shrink-0">
                    <ShieldCheck
                      size={17}
                      className="text-[#155DFC]"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Keamanan Data Face ID
                    </p>

                    <p className="text-xs text-slate-500 leading-5 mt-1">
                      Data biometrik digunakan hanya
                      untuk kebutuhan identifikasi dan
                      presensi pengguna dalam sistem
                      SmartSchool. Pastikan pendaftaran
                      dilakukan pada akun pengguna yang
                      benar.
                    </p>
                  </div>

                </div>

              </section>

              {/* =================================================
                  BOTTOM ACTION
              ================================================== */}

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/pengguna/face-id",
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  <ArrowLeft size={15} />
                  Batal
                </button>

                <div className="flex flex-col sm:flex-row gap-2">

                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={
                      !cameraActive &&
                      !capturedFile
                    }
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={15} />
                    Reset
                  </button>

                  <button
                    type="button"
                    disabled={
                      !selectedUser ||
                      !capturedFile ||
                      saving ||
                      registrationComplete
                    }
                    onClick={
                      handleRegisterFace
                    }
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold shadow-sm hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {registrationComplete ? (
                      <>
                        <CheckCircle2
                          size={16}
                        />
                        Face ID Terdaftar
                      </>
                    ) : (
                      <>
                        <Fingerprint
                          size={16}
                        />
                        {saving
                          ? "Menyimpan..."
                          : "Daftarkan Face ID"}
                      </>
                    )}
                  </button>

                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}