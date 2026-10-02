"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

// =========================================================
// THEME HELPERS
// =========================================================

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const themeTextHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeCardShadow =
  "shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

export default function EditFaceIdPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id;

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // API
  // =========================================================

  const API_URL = (
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  const API_PREFIX = `${API_URL}/api`;

  // =========================================================
  // TOKEN
  // =========================================================

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken")
    );
  };

  // =========================================================
  // GET USER
  // =========================================================

  useEffect(() => {
    if (!id) return;

    fetchUser();

    return () => {
      stopCamera();
    };
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Token login tidak ditemukan.");
      }

      const requestUrl = `${API_PREFIX}/users/${id}`;

      console.log("GET USER:", requestUrl);

      const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const contentType =
        response.headers.get("content-type") || "";

      const responseText = await response.text();

      console.log("USER STATUS:", response.status);
      console.log("USER RESPONSE:", responseText);

      let result;

      if (contentType.includes("application/json")) {
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error("Response JSON tidak valid.");
        }
      } else {
        throw new Error(
          `API tidak mengembalikan JSON. Status: ${response.status}`
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            `Gagal mengambil data user. Status ${response.status}`
        );
      }

      const userData =
        result?.data?.user ||
        result?.data ||
        result?.user ||
        result;

      setUser(userData);
    } catch (err) {
      console.error("FETCH USER ERROR:", err);

      setError(
        err?.message ||
          "Gagal mengambil data pengguna."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // START CAMERA
  // =========================================================

  const startCamera = async () => {
    try {
      setError("");
      setSuccess("");
      setCameraLoading(true);

      console.log("Memulai kamera...");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Browser tidak mendukung akses kamera."
        );
      }

      // Matikan stream lama
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }

      if (!videoRef.current) {
        throw new Error(
          "Elemen video belum tersedia. Silakan refresh halaman."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
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
        });

      console.log(
        "Stream kamera berhasil:",
        stream
      );

      streamRef.current = stream;

      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;

      await videoRef.current.play();

      console.log(
        "Video kamera berhasil diputar."
      );

      setCameraActive(true);
    } catch (err) {
      console.error("CAMERA ERROR:", err);

      if (err?.name === "NotAllowedError") {
        setError(
          "Akses kamera ditolak. Izinkan kamera melalui pengaturan browser."
        );
      } else if (err?.name === "NotFoundError") {
        setError(
          "Kamera tidak ditemukan di perangkat."
        );
      } else if (
        err?.name === "NotReadableError"
      ) {
        setError(
          "Kamera sedang digunakan aplikasi lain. Tutup aplikasi yang menggunakan kamera."
        );
      } else if (
        err?.name === "OverconstrainedError"
      ) {
        setError(
          "Pengaturan kamera tidak didukung perangkat."
        );
      } else {
        setError(
          err?.message ||
            "Tidak dapat membuka kamera."
        );
      }
    } finally {
      setCameraLoading(false);
    }
  };

  // =========================================================
  // STOP CAMERA
  // =========================================================

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

  // =========================================================
  // CAPTURE PHOTO
  // =========================================================

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setError("Kamera belum siap.");
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      setError(
        "Video kamera belum siap. Tunggu sebentar lalu coba lagi."
      );
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setError("Gagal mengambil foto.");
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imageData = canvas.toDataURL(
      "image/jpeg",
      0.9
    );

    setCapturedImage(imageData);

    stopCamera();

    setSuccess("Foto berhasil diambil.");
  };

  // =========================================================
  // RETAKE
  // =========================================================

  const retakePhoto = () => {
    setCapturedImage(null);
    setError("");
    setSuccess("");
    startCamera();
  };

  // =========================================================
  // SAVE FACE ID
  // =========================================================

  const handleSave = async () => {
    if (!capturedImage) {
      setError(
        "Silakan ambil foto terlebih dahulu."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Token login tidak ditemukan."
        );
      }

      // Base64 → Blob
      const blobResponse =
        await fetch(capturedImage);

      const blob =
        await blobResponse.blob();

      const file = new File(
        [blob],
        `face-id-${id}.jpg`,
        {
          type: "image/jpeg",
        }
      );

      const formData = new FormData();

      // Backend:
      // uploadFaceId.single("foto")
      formData.append("foto", file);

      const requestUrl =
        `${API_PREFIX}/users/${id}/face-id`;

      console.log(
        "POST FACE ID:",
        requestUrl
      );

      const response = await fetch(
        requestUrl,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      const responseText =
        await response.text();

      console.log(
        "FACE ID STATUS:",
        response.status
      );

      console.log(
        "FACE ID RESPONSE:",
        responseText
      );

      let result;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        try {
          result =
            JSON.parse(
              responseText
            );
        } catch {
          throw new Error(
            "Response JSON tidak valid."
          );
        }
      } else {
        throw new Error(
          `API tidak mengembalikan JSON. Status: ${response.status}`
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Gagal memperbarui Face ID."
        );
      }

      setSuccess(
        result?.message ||
          "Face ID berhasil diperbarui."
      );

      setCapturedImage(null);

      await fetchUser();

      setTimeout(() => {
        router.push(
          "/admin/pengguna/face-id"
        );
      }, 1200);
    } catch (err) {
      console.error(
        "SAVE FACE ID ERROR:",
        err
      );

      setError(
        err?.message ||
          "Gagal memperbarui Face ID."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE FACE ID
  // =========================================================

  const handleDeleteFaceId = async () => {
    const confirmed = window.confirm(
      "Yakin ingin menghapus Face ID pengguna ini?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Token login tidak ditemukan."
        );
      }

      const requestUrl =
        `${API_PREFIX}/users/${id}/face-id`;

      const response = await fetch(
        requestUrl,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      const responseText =
        await response.text();

      let result;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        result =
          JSON.parse(
            responseText
          );
      } else {
        throw new Error(
          `API tidak mengembalikan JSON. Status: ${response.status}`
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Gagal menghapus Face ID."
        );
      }

      setSuccess(
        result?.message ||
          "Face ID berhasil dihapus."
      );

      await fetchUser();
    } catch (err) {
      console.error(
        "DELETE FACE ID ERROR:",
        err
      );

      setError(
        err?.message ||
          "Gagal menghapus Face ID."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="theme-page flex h-screen overflow-hidden">
        <Sidebar
          role="admin"
          active="face-id"
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header />

          <main className="flex flex-1 items-center justify-center overflow-y-auto p-6">
            <div className="text-center">
              <div
                className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] border-t-[var(--color-primary)]"
              />

              <p className="theme-text-secondary">
                Memuat data pengguna...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // USER NOT FOUND
  // =========================================================

  if (!user) {
    return (
      <div className="theme-page flex h-screen overflow-hidden">
        <Sidebar
          role="admin"
          active="face-id"
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">

              <button
                onClick={() =>
                  router.push(
                    "/admin/pengguna/face-id"
                  )
                }
                className="theme-text-secondary mb-6 text-sm transition hover:text-[var(--color-primary)]"
              >
                ← Kembali
              </button>

              <div
                className={`theme-card ${themeCardShadow} rounded-2xl border p-8 text-center`}
              >
                <div className="theme-danger mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl">
                  <span className="text-xl">
                    !
                  </span>
                </div>

                <h2 className="theme-text mb-2 text-xl font-semibold">
                  Data pengguna tidak ditemukan
                </h2>

                <p className="theme-text-secondary text-sm">
                  {error ||
                    "Gagal mengambil data pengguna."}
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =========================================================
  // USER DATA
  // =========================================================

  const userName =
    user?.nama ||
    user?.namaLengkap ||
    user?.name ||
    user?.username ||
    "-";

  const userEmail =
    user?.email || "-";

  const currentFaceId =
    user?.biometrikWajah ||
    user?.faceId ||
    user?.faceID ||
    user?.biometrik ||
    null;

  const currentFacePhoto =
    currentFaceId?.urlFotoReferensi ||
    currentFaceId?.url ||
    user?.urlFotoReferensi ||
    null;

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        role="admin"
        active="face-id"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

            {/* HEADER */}

            <div className="mb-8">
              <button
                onClick={() =>
                  router.push(
                    "/admin/pengguna/face-id"
                  )
                }
                className="theme-text-secondary mb-3 text-sm transition hover:text-[var(--color-primary)]"
              >
                ← Kembali ke Face ID
              </button>

              <h1 className="theme-text text-2xl font-bold">
                Perbarui Face ID
              </h1>

              <p className="theme-text-secondary mt-1 text-sm">
                Perbarui data Face ID pengguna
              </p>
            </div>

            {/* ALERT */}

            {error && (
              <div className="theme-danger mb-6 rounded-xl border px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="theme-success mb-6 rounded-xl border px-4 py-3 text-sm">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              {/* USER INFO */}

              <div
                className={`theme-card ${themeCardShadow} h-fit rounded-2xl border p-6`}
              >
                <h2 className="theme-text mb-5 font-semibold">
                  Data Pengguna
                </h2>

                <div className="mb-6 flex items-center gap-4">

                  <div
                    className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-full ${themePrimarySoft} text-xl font-bold text-[var(--color-primary)]`}
                  >
                    {user?.foto ? (
                      <img
                        src={user.foto}
                        alt={userName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      userName
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="theme-text truncate font-semibold">
                      {userName}
                    </h3>

                    <p className="theme-text-secondary truncate text-sm">
                      {userEmail}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-sm">

                  <div>
                    <p className="theme-text-muted mb-1">
                      Username
                    </p>

                    <p className="theme-text font-medium">
                      {user?.username || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="theme-text-muted mb-1">
                      Peran
                    </p>

                    <p className="theme-text font-medium">
                      {user?.peran?.nama ||
                        user?.role ||
                        user?.jabatan ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="theme-text-muted mb-1">
                      Status Face ID
                    </p>

                    <span
                      className={
                        currentFaceId
                          ? "theme-success inline-flex rounded-full border px-3 py-1 text-xs font-medium"
                          : "theme-card-soft theme-text-secondary inline-flex rounded-full border px-3 py-1 text-xs font-medium"
                      }
                    >
                      {currentFaceId
                        ? "Sudah terdaftar"
                        : "Belum terdaftar"}
                    </span>
                  </div>

                </div>
              </div>

              {/* FACE ID */}

              <div
                className={`theme-card ${themeCardShadow} rounded-2xl border p-6 lg:col-span-2`}
              >
                <div className="mb-6">
                  <h2 className="theme-text font-semibold">
                    Foto Face ID
                  </h2>

                  <p className="theme-text-secondary mt-1 text-sm">
                    Ambil foto wajah baru untuk memperbarui Face ID.
                  </p>
                </div>

                {/* VIDEO */}

                <div className="mx-auto w-full max-w-2xl">

                  <div
                    className={`relative aspect-video overflow-hidden rounded-2xl bg-black ${
                      cameraActive
                        ? "block"
                        : "hidden"
                    }`}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full object-cover"
                    />

                    {/* FACE GUIDE */}

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="h-80 w-64 rounded-[45%] border-2 border-white/80" />
                    </div>

                    {/* CAMERA BUTTON */}

                    <div className="absolute bottom-5 left-0 right-0 flex justify-center">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[var(--color-border)] bg-white shadow-lg transition hover:scale-105"
                      >
                        <div className="h-11 w-11 rounded-full bg-[var(--color-primary)]" />
                      </button>
                    </div>
                  </div>

                  {/* CURRENT FACE ID */}

                  {!cameraActive &&
                    !capturedImage &&
                    currentFacePhoto && (
                      <div className="mb-6">
                        <p className="theme-text mb-3 text-sm font-medium">
                          Foto Face ID saat ini
                        </p>

                        <div className="theme-card-soft aspect-square w-full max-w-sm overflow-hidden rounded-2xl border">
                          <img
                            src={currentFacePhoto}
                            alt="Face ID saat ini"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                  {/* CAPTURED PHOTO */}

                  {capturedImage &&
                    !cameraActive && (
                      <div className="space-y-4">

                        <div className="theme-card-soft relative aspect-video overflow-hidden rounded-2xl border">
                          <img
                            src={capturedImage}
                            alt="Foto Face ID baru"
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="flex gap-3">

                          <button
                            type="button"
                            onClick={retakePhoto}
                            disabled={saving}
                            className={`theme-card theme-text-secondary flex-1 rounded-xl border px-4 py-3 font-medium transition ${themeTextHover} disabled:opacity-50`}
                          >
                            Ambil Ulang
                          </button>

                          <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex-1 rounded-xl bg-[var(--color-primary)] px-4 py-3 font-medium text-white transition ${themePrimaryHover} ${themePrimaryShadow} disabled:opacity-50`}
                          >
                            {saving
                              ? "Menyimpan..."
                              : "Simpan Face ID"}
                          </button>

                        </div>
                      </div>
                    )}

                  {/* OPEN CAMERA */}

                  {!cameraActive &&
                    !capturedImage && (
                      <div
                        className={`rounded-2xl border-2 border-dashed p-10 text-center ${themePrimarySoftBorder}`}
                      >
                        <div
                          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${themePrimarySoft}`}
                        >
                          <span className="text-2xl">
                            📷
                          </span>
                        </div>

                        <h3 className="theme-text mb-2 font-semibold">
                          Ambil Foto Face ID Baru
                        </h3>

                        <p className="theme-text-secondary mx-auto mb-6 max-w-md text-sm">
                          Pastikan wajah terlihat jelas,
                          pencahayaan cukup, dan menghadap kamera.
                        </p>

                        <button
                          type="button"
                          onClick={startCamera}
                          disabled={cameraLoading}
                          className={`rounded-xl bg-[var(--color-primary)] px-6 py-3 font-medium text-white transition ${themePrimaryHover} ${themePrimaryShadow} disabled:opacity-50`}
                        >
                          {cameraLoading
                            ? "Membuka Kamera..."
                            : "Buka Kamera"}
                        </button>
                      </div>
                    )}
                </div>

                {/* DELETE */}

                {currentFaceId && (
                  <div className="theme-border mt-8 border-t pt-6">
                    <h3 className="theme-text mb-1 text-sm font-semibold">
                      Hapus Face ID
                    </h3>

                    <p className="theme-text-secondary mb-4 text-sm">
                      Face ID pengguna akan dinonaktifkan.
                    </p>

                    <button
                      type="button"
                      onClick={handleDeleteFaceId}
                      disabled={saving}
                      className="theme-danger rounded-xl border px-4 py-2.5 font-medium transition disabled:opacity-50"
                    >
                      Hapus Face ID
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        </main>
      </div>

      {/* CANVAS */}

      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </div>
  );
}