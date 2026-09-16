"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

  // app.ts:
  // app.use("/api/users", userRoutes);

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
        throw new Error(
          "Token login tidak ditemukan."
        );
      }

      const requestUrl =
        `${API_PREFIX}/users/${id}`;

      console.log(
        "GET USER:",
        requestUrl
      );

      const response = await fetch(
        requestUrl,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      const responseText =
        await response.text();

      console.log(
        "USER STATUS:",
        response.status
      );

      console.log(
        "USER RESPONSE:",
        responseText
      );

      let result;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        try {
          result = JSON.parse(
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
      console.error(
        "FETCH USER ERROR:",
        err
      );

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

      console.log(
        "Memulai kamera..."
      );

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
          .forEach((track) =>
            track.stop()
          );

        streamRef.current = null;
      }

      /*
       * Pastikan video sudah tersedia.
       *
       * Karena video sekarang selalu dirender,
       * ref seharusnya sudah tersedia.
       */

      if (!videoRef.current) {
        throw new Error(
          "Elemen video belum tersedia. Silakan refresh halaman."
        );
      }

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
          }
        );

      console.log(
        "Stream kamera berhasil:",
        stream
      );

      streamRef.current = stream;

      videoRef.current.srcObject =
        stream;

      videoRef.current.muted = true;
      videoRef.current.playsInline = true;

      await videoRef.current.play();

      console.log(
        "Video kamera berhasil diputar."
      );

      setCameraActive(true);
    } catch (err) {
      console.error(
        "CAMERA ERROR:",
        err
      );

      if (
        err?.name ===
        "NotAllowedError"
      ) {
        setError(
          "Akses kamera ditolak. Izinkan kamera melalui pengaturan browser."
        );
      } else if (
        err?.name ===
        "NotFoundError"
      ) {
        setError(
          "Kamera tidak ditemukan di perangkat."
        );
      } else if (
        err?.name ===
        "NotReadableError"
      ) {
        setError(
          "Kamera sedang digunakan aplikasi lain. Tutup aplikasi yang menggunakan kamera."
        );
      } else if (
        err?.name ===
        "OverconstrainedError"
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
      videoRef.current.srcObject =
        null;
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
      setError(
        "Kamera belum siap."
      );
      return;
    }

    if (
      !video.videoWidth ||
      !video.videoHeight
    ) {
      setError(
        "Video kamera belum siap. Tunggu sebentar lalu coba lagi."
      );
      return;
    }

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    const context =
      canvas.getContext("2d");

    if (!context) {
      setError(
        "Gagal mengambil foto."
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

    const imageData =
      canvas.toDataURL(
        "image/jpeg",
        0.9
      );

    setCapturedImage(
      imageData
    );

    stopCamera();

    setSuccess(
      "Foto berhasil diambil."
    );
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

      /*
       * Base64 → Blob
       */

      const blobResponse =
        await fetch(
          capturedImage
        );

      const blob =
        await blobResponse.blob();

      const file = new File(
        [blob],
        `face-id-${id}.jpg`,
        {
          type: "image/jpeg",
        }
      );

      const formData =
        new FormData();

      /*
       * Backend:
       * uploadFaceId.single("foto")
       */

      formData.append(
        "foto",
        file
      );

      const requestUrl =
        `${API_PREFIX}/users/${id}/face-id`;

      console.log(
        "POST FACE ID:",
        requestUrl
      );

      const response =
        await fetch(
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

  const handleDeleteFaceId =
    async () => {
      const confirmed =
        window.confirm(
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

        const response =
          await fetch(
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-600">
            Memuat data pengguna...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // USER NOT FOUND
  // =========================================================

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() =>
              router.push(
                "/admin/pengguna/face-id"
              )
            }
            className="mb-6 text-sm text-blue-600 hover:text-blue-800"
          >
            ← Kembali
          </button>

          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="text-4xl mb-4">
              ⚠️
            </div>

            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Data pengguna tidak ditemukan
            </h2>

            <p className="text-sm text-slate-500">
              {error ||
                "Gagal mengambil data pengguna."}
            </p>
          </div>
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* HEADER */}

        <div className="mb-8">
          <button
            onClick={() =>
              router.push(
                "/admin/pengguna/face-id"
              )
            }
            className="text-sm text-slate-500 hover:text-blue-600 mb-3"
          >
            ← Kembali ke Face ID
          </button>

          <h1 className="text-2xl font-bold text-slate-900">
            Perbarui Face ID
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Perbarui data Face ID pengguna
          </p>
        </div>

        {/* ALERT */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* USER INFO */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
            <h2 className="font-semibold text-slate-900 mb-5">
              Data Pengguna
            </h2>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl overflow-hidden">
                {user?.foto ? (
                  <img
                    src={user.foto}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userName
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">
                  {userName}
                </h3>

                <p className="text-sm text-slate-500 truncate">
                  {userEmail}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-400 mb-1">
                  Username
                </p>

                <p className="text-slate-700 font-medium">
                  {user?.username ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-slate-400 mb-1">
                  Peran
                </p>

                <p className="text-slate-700 font-medium">
                  {user?.peran?.nama ||
                    user?.role ||
                    user?.jabatan ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-slate-400 mb-1">
                  Status Face ID
                </p>

                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    currentFaceId
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {currentFaceId
                    ? "Sudah terdaftar"
                    : "Belum terdaftar"}
                </span>
              </div>
            </div>
          </div>

          {/* FACE ID */}

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            <div className="mb-6">
              <h2 className="font-semibold text-slate-900">
                Foto Face ID
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Ambil foto wajah baru untuk memperbarui Face ID.
              </p>
            </div>

            {/* =================================================
                VIDEO
                ================================================= */}

            <div className="w-full max-w-2xl mx-auto">

              {/*
               * VIDEO SELALU ADA.
               *
               * Ini bagian penting dari perbaikan.
               */}

              <div
                className={`relative rounded-2xl overflow-hidden bg-black aspect-video ${
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
                  className="w-full h-full object-cover"
                />

                {/* FACE GUIDE */}

                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-80 border-2 border-white/80 rounded-[45%]" />
                </div>

                {/* CAMERA BUTTON */}

                <div className="absolute bottom-5 left-0 right-0 flex justify-center">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="w-16 h-16 rounded-full bg-white border-4 border-slate-300 shadow-lg hover:scale-105 transition"
                  >
                    <div className="w-11 h-11 rounded-full bg-blue-600 mx-auto" />
                  </button>
                </div>
              </div>

              {/* =================================================
                  CURRENT FACE ID
                  ================================================= */}

              {!cameraActive &&
                !capturedImage &&
                currentFacePhoto && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-slate-700 mb-3">
                      Foto Face ID saat ini
                    </p>

                    <div className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={currentFacePhoto}
                        alt="Face ID saat ini"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

              {/* =================================================
                  CAPTURED PHOTO
                  ================================================= */}

              {capturedImage &&
                !cameraActive && (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-video">
                      <img
                        src={capturedImage}
                        alt="Foto Face ID baru"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={
                          retakePhoto
                        }
                        disabled={saving}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50"
                      >
                        Ambil Ulang
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleSave
                        }
                        disabled={saving}
                        className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving
                          ? "Menyimpan..."
                          : "Simpan Face ID"}
                      </button>
                    </div>
                  </div>
                )}

              {/* =================================================
                  OPEN CAMERA
                  ================================================= */}

              {!cameraActive &&
                !capturedImage && (
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center">

                    <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 text-2xl">
                      📷
                    </div>

                    <h3 className="font-semibold text-slate-800 mb-2">
                      Ambil Foto Face ID Baru
                    </h3>

                    <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                      Pastikan wajah terlihat jelas,
                      pencahayaan cukup, dan menghadap kamera.
                    </p>

                    <button
                      type="button"
                      onClick={
                        startCamera
                      }
                      disabled={
                        cameraLoading
                      }
                      className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {cameraLoading
                        ? "Membuka Kamera..."
                        : "Buka Kamera"}
                    </button>
                  </div>
                )}
            </div>

            {/* =================================================
                DELETE
                ================================================= */}

            {currentFaceId && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  Hapus Face ID
                </h3>

                <p className="text-sm text-slate-500 mb-4">
                  Face ID pengguna akan dinonaktifkan.
                </p>

                <button
                  type="button"
                  onClick={
                    handleDeleteFaceId
                  }
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 disabled:opacity-50"
                >
                  Hapus Face ID
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CANVAS */}

      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </div>
  );
}