"use client";

import { useEffect, useRef, useState } from "react";
import { getToken } from "@/lib/auth";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  ArrowLeft, Camera, CameraOff, RefreshCw, Save, Trash2,
  UserRound, Mail, ShieldCheck, AlertCircle, CheckCircle2, Loader2,
} from "lucide-react";

const themePrimarySoft = "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";
const themePrimarySoftBorder = "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";
const themePrimaryHover = "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";
const themeTextHover = "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeCardShadow = "shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";
const themePrimaryShadow = "shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

function getBackendBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return apiUrl.trim().replace(/\/api\/v1\/?$/i, "").replace(/\/api\/?$/i, "").replace(/\/+$/, "");
}

function getFileUrl(filePath) {
  if (!filePath || typeof filePath !== "string") return "";
  const value = filePath.trim();
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      if (parsed.pathname.startsWith("/uploads/")) {
        return `${getBackendBaseUrl()}${parsed.pathname}${parsed.search}`;
      }
      return value;
    } catch {
      return value;
    }
  }

  const normalized = value.replace(/\\/g, "/");
  const absolute = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return `${getBackendBaseUrl()}${absolute}`;
}

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

  const API_URL = getBackendBaseUrl();
  const API_PREFIX = `${API_URL}/api`;

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
      if (!token) throw new Error("Token login tidak ditemukan.");

      const response = await fetch(`${API_PREFIX}/users/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("content-type") || "";
      const responseText = await response.text();

      let result;
      if (contentType.includes("application/json")) {
        result = JSON.parse(responseText);
      } else {
        throw new Error(`API tidak mengembalikan JSON. Status: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(
          result?.message || result?.error || `Gagal mengambil data user. Status ${response.status}`
        );
      }

      const userData = result?.data?.user || result?.data || result?.user || result;
      setUser(userData);
    } catch (err) {
      console.error("FETCH USER ERROR:", err);
      setError(err?.message || "Gagal mengambil data pengguna.");
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setError("");
      setSuccess("");
      setCameraLoading(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser tidak mendukung akses kamera.");
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (!videoRef.current) {
        throw new Error("Elemen video belum tersedia. Silakan refresh halaman.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;

      await videoRef.current.play();
      setCameraActive(true);
    } catch (err) {
      console.error("CAMERA ERROR:", err);
      if (err?.name === "NotAllowedError") {
        setError("Akses kamera ditolak. Izinkan kamera melalui pengaturan browser.");
      } else if (err?.name === "NotFoundError") {
        setError("Kamera tidak ditemukan di perangkat.");
      } else if (err?.name === "NotReadableError") {
        setError("Kamera sedang digunakan aplikasi lain. Tutup aplikasi yang menggunakan kamera.");
      } else {
        setError(err?.message || "Tidak dapat membuka kamera.");
      }
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return setError("Kamera belum siap.");
    if (!video.videoWidth || !video.videoHeight) return setError("Video kamera belum siap. Tunggu sebentar lalu coba lagi.");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) return setError("Gagal mengambil foto.");

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg", 0.9);

    setCapturedImage(imageData);
    stopCamera();
    setSuccess("Foto berhasil diambil.");
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setError("");
    setSuccess("");
    startCamera();
  };

  const handleSave = async () => {
    if (!capturedImage) return setError("Silakan ambil foto terlebih dahulu.");

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = getToken();
      if (!token) throw new Error("Token login tidak ditemukan.");

      const blobResponse = await fetch(capturedImage);
      const blob = await blobResponse.blob();
      const file = new File([blob], `face-id-${id}.jpg`, { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("foto", file);
      formData.append("targetUserId", String(id));

      const response = await fetch(`${API_PREFIX}/absensi/register-face`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const contentType = response.headers.get("content-type") || "";
      const responseText = await response.text();

      let result;
      if (contentType.includes("application/json")) {
        result = JSON.parse(responseText);
      } else {
        if (response.status === 404) throw new Error("Endpoint register-face tidak ditemukan (404). Periksa route backend.");
        throw new Error(`API tidak mengembalikan JSON. Status: ${response.status}`);
      }

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || result?.error || "Gagal memperbarui Face ID.");
      }

      setSuccess(result?.message || "Face ID berhasil diperbarui.");
      setCapturedImage(null);

      await fetchUser();

      setTimeout(() => {
        router.push("/admin/pengguna/face-id?refresh=true");
      }, 1200);
    } catch (err) {
      console.error("SAVE FACE ID ERROR:", err);
      setError(err?.message || "Gagal memperbarui Face ID.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaceId = async () => {
    const confirmed = window.confirm("Yakin ingin menghapus Face ID pengguna ini?");
    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = getToken();
      if (!token) throw new Error("Token login tidak ditemukan.");

      const response = await fetch(`${API_PREFIX}/absensi/register-face/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = response.headers.get("content-type") || "";
      const responseText = await response.text();

      let result;
      if (contentType.includes("application/json")) {
        result = JSON.parse(responseText);
      } else {
        if (response.status === 404) throw new Error("Endpoint hapus tidak ditemukan (404). Pastikan Anda sudah menambahkan route delete di backend.");
        throw new Error(`API tidak mengembalikan JSON. Status: ${response.status}`);
      }

      if (!response.ok) throw new Error(result?.message || result?.error || "Gagal menghapus Face ID.");

      setSuccess(result?.message || "Face ID berhasil dihapus.");
      await fetchUser();
    } catch (err) {
      console.error("DELETE FACE ID ERROR:", err);
      setError(err?.message || "Gagal menghapus Face ID.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar role="admin" active="face-id" />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 sticky top-0 z-40">
            <Header />
          </div>
          <main className="flex min-w-0 flex-1 items-center justify-center overflow-y-auto p-6">
            <div className="flex flex-col items-center">
              <Loader2 size={30} className="animate-spin text-[var(--color-primary)]" />
              <p className="theme-text-secondary mt-3 text-sm font-medium">Memuat data pengguna...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar role="admin" active="face-id" />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 sticky top-0 z-40">
            <Header />
          </div>
          <main className="flex min-w-0 flex-1 items-center justify-center overflow-y-auto p-6">
            <div className={`theme-card ${themeCardShadow} w-full max-w-md rounded-2xl border p-6 text-center`}>
              <div className="theme-danger mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
                <AlertCircle size={24} />
              </div>
              <h2 className="theme-text mt-4 text-base font-bold">Data tidak ditemukan</h2>
              <p className="theme-text-secondary mt-1 text-sm">{error || "Gagal mengambil data pengguna."}</p>
              <button
                onClick={() => router.push("/admin/pengguna/face-id")}
                className={`mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition ${themePrimaryShadow} ${themePrimaryHover}`}
              >
                <ArrowLeft size={16} /> Kembali ke Face ID
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const userName = user?.nama || user?.namaLengkap || user?.name || user?.username || "-";
  const userEmail = user?.email || "-";
  const currentFaceId = user?.biometrikWajah || user?.faceId || user?.faceID || user?.biometrik || null;
  const currentFacePhoto = getFileUrl(currentFaceId?.urlFotoReferensi || currentFaceId?.url || user?.urlFotoReferensi || null);

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar role="admin" active="face-id" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 sticky top-0 z-40">
          <Header />
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/admin/pengguna/face-id")}
                  className="theme-card theme-text-secondary inline-flex items-center justify-center rounded-lg border p-2 transition hover:text-[var(--color-primary)]"
                  aria-label="Kembali"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h1 className="theme-text text-xl font-bold tracking-tight">Perbarui Face ID</h1>
                  <p className="theme-text-secondary mt-0.5 text-sm">Perbarui data Face ID pengguna.</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="theme-danger mb-5 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="theme-success mb-5 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 2xl:grid-cols-4">
              <div className={`theme-card ${themeCardShadow} h-fit rounded-2xl border p-5 lg:col-span-1`}>
                <div className="mb-4 flex items-center gap-2">
                  <UserRound size={18} className="text-[var(--color-primary)]" />
                  <h2 className="theme-text text-sm font-bold">Data Pengguna</h2>
                </div>

                <div className="mb-5 flex items-center gap-3">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ${themePrimarySoft} text-lg font-bold text-[var(--color-primary)]`}>
                    {user?.foto ? (
                      <img src={getFileUrl(user.foto)} alt={userName} className="h-full w-full object-cover" />
                    ) : (
                      userName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="theme-text truncate text-sm font-semibold">{userName}</h3>
                    <p className="theme-text-secondary mt-0.5 flex items-center gap-1.5 truncate text-xs">
                      <Mail size={12} /> {userEmail}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">Username</p>
                    <p className="theme-text mt-1 font-medium">{user?.username || "-"}</p>
                  </div>
                  <div>
                    <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">Peran</p>
                    <p className="theme-text mt-1 font-medium">{user?.peran?.nama || user?.role || user?.jabatan || "-"}</p>
                  </div>
                  <div>
                    <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">Status Face ID</p>
                    <div className="mt-1.5">
                      {currentFaceId ? (
                        <span className="theme-success inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium">
                          <CheckCircle2 size={12} /> Sudah terdaftar
                        </span>
                      ) : (
                        <span className="theme-card-soft theme-text-secondary inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium">
                          <CameraOff size={12} /> Belum terdaftar
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`theme-card ${themeCardShadow} rounded-2xl border p-5 lg:col-span-2 2xl:col-span-3`}>
                <div className="mb-5 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[var(--color-primary)]" />
                  <h2 className="theme-text text-sm font-bold">Foto Face ID</h2>
                </div>

                <div className="w-full">
                  <div className={`relative aspect-video overflow-hidden rounded-2xl bg-black ${cameraActive ? "block" : "hidden"}`}>
                    <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="h-64 w-48 rounded-[45%] border-2 border-white/80 sm:h-72 sm:w-56" />
                    </div>
                    <div className="absolute bottom-5 left-0 right-0 flex justify-center">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[var(--color-border)] bg-white shadow-lg transition hover:scale-105"
                        aria-label="Ambil foto"
                      >
                        <div className="h-11 w-11 rounded-full bg-[var(--color-primary)]" />
                      </button>
                    </div>
                  </div>

                  {!cameraActive && !capturedImage && currentFacePhoto && (
                    <div className="mb-5">
                      <p className="theme-text mb-2 text-xs font-semibold uppercase tracking-wider">Foto Face ID saat ini</p>
                      <div className="theme-card-soft aspect-square w-full max-w-sm overflow-hidden rounded-2xl border">
                        <img src={currentFacePhoto} alt="Face ID saat ini" className="h-full w-full object-cover" />
                      </div>
                    </div>
                  )}

                  {capturedImage && !cameraActive && (
                    <div className="space-y-4">
                      <div className="theme-card-soft aspect-video w-full overflow-hidden rounded-2xl border">
                        <img src={capturedImage} alt="Foto Face ID baru" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={retakePhoto}
                          disabled={saving}
                          className={`theme-card theme-text-secondary inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${themeTextHover} disabled:opacity-50`}
                        >
                          <RefreshCw size={15} /> Ambil Ulang
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saving}
                          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-medium text-white transition ${themePrimaryHover} ${themePrimaryShadow} disabled:opacity-50`}
                        >
                          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                          {saving ? "Menyimpan..." : "Simpan Face ID"}
                        </button>
                      </div>
                    </div>
                  )}

                  {!cameraActive && !capturedImage && (
                    <div className={`rounded-2xl border-2 border-dashed p-8 text-center ${themePrimarySoftBorder}`}>
                      <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${themePrimarySoft}`}>
                        <Camera size={24} className="text-[var(--color-primary)]" />
                      </div>
                      <h3 className="theme-text mb-1 text-sm font-semibold">Ambil Foto Face ID Baru</h3>
                      <p className="theme-text-secondary mx-auto mb-5 max-w-md text-xs leading-relaxed">
                        Pastikan wajah terlihat jelas, pencahayaan cukup, dan menghadap kamera.
                      </p>
                      <button
                        type="button"
                        onClick={startCamera}
                        disabled={cameraLoading}
                        className={`inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition ${themePrimaryHover} ${themePrimaryShadow} disabled:opacity-50`}
                      >
                        {cameraLoading ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
                        {cameraLoading ? "Membuka Kamera..." : "Buka Kamera"}
                      </button>
                    </div>
                  )}
                </div>

                {currentFaceId && (
                  <div className="theme-border mt-6 border-t pt-5">
                    <h3 className="theme-text text-sm font-semibold">Hapus Face ID</h3>
                    <p className="theme-text-secondary mt-1 text-xs">Face ID pengguna akan dinonaktifkan.</p>
                    <button
                      type="button"
                      onClick={handleDeleteFaceId}
                      disabled={saving}
                      className="theme-danger mt-3 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:opacity-50"
                    >
                      <Trash2 size={15} /> Hapus Face ID
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}