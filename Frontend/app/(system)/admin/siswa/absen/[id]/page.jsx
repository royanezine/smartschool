"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getBackendOrigin } from "@/lib/auth";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Camera,
  Navigation,
  UserRound,
  ClipboardCheck,
  RefreshCw,
  AlertCircle,
  ImageOff,
  ExternalLink,
  Pencil,
  X,
  Check,
} from "lucide-react";

import CanAccess from "@/app/components/auth/CanAccess";
import { getAuthRole } from "@/lib/auth";
import {
  getAbsensiKelas,
  updateAbsensi,
} from "@/services/absensi.service";
import { getKelas } from "@/services/kelas.service";


function normalizeArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.result?.data)) return response.result.data;
  return [];
}

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase().trim();

  if (value === "hadir") return "Hadir";
  if (value === "izin") return "Izin";
  if (value === "sakit") return "Sakit";
  if (value === "alpa" || value === "alpha") return "Alpa";
  if (value === "terlambat") return "Terlambat";

  return status ? String(status) : "Alpa";
}

function formatTanggal(value) {
  if (!value) return "-";

  const raw = String(value);
  const date = new Date(`${raw.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return raw;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatJam(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getInitials(nama) {
  return String(nama || "Siswa")
    .replace(/,.*/, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word?.[0] || "")
    .join("")
    .toUpperCase();
}

function getNamaSiswa(item) {
  return (
    item?.pengguna?.namaLengkap ||
    item?.siswa?.namaLengkap ||
    item?.namaLengkap ||
    item?.pengguna?.nama ||
    item?.siswa?.nama ||
    item?.nama ||
    "Siswa"
  );
}

function getNisn(item) {
  return (
    item?.pengguna?.nisn ||
    item?.siswa?.nisn ||
    item?.nisn ||
    item?.pengguna?.nomorInduk ||
    item?.nomorInduk ||
    "-"
  );
}

function getNamaKelas(item, kelas) {
  return (
    item?.kelas?.nama ||
    item?.kelas?.namaKelas ||
    item?.namaKelas ||
    kelas?.nama ||
    kelas?.namaKelas ||
    `Kelas ${kelas?.tingkat || "-"}`
  );
}

function getFotoWajah(item) {
  const candidates = [
    item?.urlFoto,
    item?.fotoUrl,
    item?.foto,
    item?.fotoWajah,
    item?.urlFotoWajah,
    item?.fotoAbsensi,
    item?.fotoProfil,
    item?.pathFoto,
    item?.pathFotoWajah,
    item?.fileFoto,
    item?.gambar,
    item?.pengguna?.foto,
    item?.pengguna?.fotoProfil,
    item?.pengguna?.urlFoto,
    item?.siswa?.foto,
    item?.siswa?.fotoProfil,
    item?.siswa?.urlFoto,
  ];

  return (
    candidates.find(
      (value) =>
        typeof value === "string" && value.trim() !== ""
    ) || null
  );
}


function resolveFotoUrl(foto) {
  if (typeof foto !== "string" || !foto.trim()) return null;

  const value = foto.trim();

  if (/^(data:image\/|blob:)/i.test(value)) {
    return value;
  }

  try {
    const origin = getBackendOrigin();

    if (/^https?:\/\//i.test(value)) {
      const url = new URL(value);

      if (
        ["localhost", "127.0.0.1"].includes(url.hostname) &&
        !["localhost", "127.0.0.1"].includes(new URL(origin).hostname)
      ) {
        return `${origin}${url.pathname}${url.search}${url.hash}`;
      }

      return value;
    }

    const path = value.startsWith("/") ? value : `/${value}`;
    return `${origin}${path}`;
  } catch {
    return value.startsWith("/") ? value : `/${value}`;
  }
}


function mapAbsensi(item, kelas) {
  const tanggal = item?.tanggal || item?.dibuatPada || null;
  const dibuatPada = item?.dibuatPada || null;

  const latitude =
    item?.lintang !== null && item?.lintang !== undefined
      ? Number(item.lintang)
      : null;

  const longitude =
    item?.bujur !== null && item?.bujur !== undefined
      ? Number(item.bujur)
      : null;

  const akurasi =
    item?.akurasi !== null && item?.akurasi !== undefined
      ? Number(item.akurasi)
      : null;

  let status = normalizeStatus(item?.status);

  const terlambatValue =
    item?.terlambat ??
    item?.terlambatMenit ??
    item?.menitTerlambat ??
    0;

  const isTerlambatShift = String(item?.statusShift || "")
    .toLowerCase()
    .includes("terlambat");

  if (status === "Hadir" && (Number(terlambatValue) > 0 || isTerlambatShift)) {
    status = "Terlambat";
  }

  const fotoMentah = getFotoWajah(item);

  return {
    id: item?.id,
    nama: getNamaSiswa(item),
    nisn: getNisn(item),
    kelas: getNamaKelas(item, kelas),
    kelasId: item?.kelasId || item?.kelas?.id || kelas?.id || null,
    tanggal,
    tanggalLabel: formatTanggal(tanggal),
    jamMasuk: formatJam(dibuatPada || tanggal),
    status,
    lokasi:
      item?.metode === "lokasi"
        ? "Sekolah"
        : item?.metode
          ? String(item.metode)
          : "-",
    metode: item?.metode || "-",
    latitude,
    longitude,
    akurasi,
    foto: resolveFotoUrl(fotoMentah),
    fotoMentah,
    keterangan: item?.keterangan || "-",
    waliKelas:
      item?.kelas?.waliKelas?.namaLengkap ||
      item?.kelas?.waliKelas?.nama ||
      kelas?.waliKelas?.namaLengkap ||
      kelas?.waliKelas?.nama ||
      "-",
    dibuatPada,
    terlambat: Number(terlambatValue) || 0,
    raw: item,
  };
}


function StatusBadge({ status }) {
  const styles = {
    Hadir: "theme-success border-[color-mix(in_srgb,var(--color-success)_20%,transparent)]",
    Terlambat: "theme-warning border-[color-mix(in_srgb,var(--color-warning)_20%,transparent)]",
    Izin: "theme-info border-[color-mix(in_srgb,var(--color-info)_20%,transparent)]",
    Sakit: "theme-warning border-[color-mix(in_srgb,var(--color-warning)_20%,transparent)]",
    Alpa: "theme-danger border-[color-mix(in_srgb,var(--color-danger)_20%,transparent)]",
  };

  const dots = {
    Hadir: "bg-[var(--color-success)]",
    Terlambat: "bg-[var(--color-warning)]",
    Izin: "bg-[var(--color-info)]",
    Sakit: "bg-[var(--color-warning)]",
    Alpa: "bg-[var(--color-danger)]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
        styles[status] || "theme-card-soft theme-text-secondary theme-border"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          dots[status] || "bg-[var(--color-text-muted)]"
        }`}
      />
      {status}
    </span>
  );
}

function DetailBox({ icon: Icon, label, value }) {
  return (
    <div className="p-3 rounded-xl border theme-border theme-card shadow-sm">
      <div className="flex items-center gap-2">
        <Icon size={14} className="theme-text-primary" />
        <span className="text-[11px] theme-text-muted">{label}</span>
      </div>
      <p className="text-sm font-semibold theme-text mt-2 break-words">
        {value || "-"}
      </p>
    </div>
  );
}


function FotoKehadiran({ foto, nama }) {
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    setGagal(false);
  }, [foto]);

  return (
    <div className="theme-card border theme-border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 theme-card-soft border-b theme-border">
        <div className="flex items-center gap-2">
          <Camera size={15} className="theme-text-primary" />
          <p className="text-xs font-semibold theme-text">
            Foto Wajah Saat Absensi
          </p>
        </div>
      </div>

      <div className="min-h-72 theme-card-soft flex items-center justify-center p-4">
        {foto && !gagal ? (
          <div className="w-full flex flex-col items-center gap-3">
            <img
              src={foto}
              alt={`Foto wajah ${nama}`}
              className="max-h-[420px] w-auto max-w-full rounded-xl object-contain theme-card shadow-sm border theme-border"
              onError={() => {
                console.error(
                  "[ABSENSI] Gagal memuat foto wajah:",
                  foto
                );
                setGagal(true);
              }}
            />

            <a
              href={foto}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold theme-text-primary hover:opacity-80"
            >
              <ExternalLink size={13} />
              Buka foto di tab baru
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center max-w-sm">
            {gagal ? (
              <ImageOff size={36} className="theme-text-muted" />
            ) : (
              <Camera size={36} className="theme-text-placeholder" />
            )}

            <p className="text-sm font-semibold theme-text mt-3">
              {gagal
                ? "Foto gagal dimuat"
                : "Foto wajah tidak tersedia"}
            </p>

            <p className="text-xs theme-text-muted mt-1">
              {gagal
                ? "Periksa URL foto, izin akses file, atau respons server pada tab Network."
                : "Respons API absensi belum menyediakan field foto yang dikenali halaman ini."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


export default function DetailAbsenSiswaPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const absenId = params?.id ? String(params.id) : "";
  const kelasIdFromQuery = searchParams?.get("kelasId") || "";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [absensi, setAbsensi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("hadir");
  const [editKeterangan, setEditKeterangan] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const isAdminSekolah = getAuthRole() === "admin_sekolah";

  const toBackendStatus = (label) => {
    const clean = String(label || "").toLowerCase().trim();
    if (clean === "terlambat") return "terlambat";
    if (clean === "izin") return "izin";
    if (clean === "sakit") return "sakit";
    if (clean === "alpa" || clean === "alpha") return "alpha";
    return "hadir";
  };

  const openEditModal = () => {
    if (!absensi) return;
    setEditStatus(toBackendStatus(absensi.status));
    setEditKeterangan(
      absensi.keterangan && absensi.keterangan !== "-" ? absensi.keterangan : ""
    );
    setEditError("");
    setEditOpen(true);
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    if (!absensi?.id) return;

    try {
      setSavingEdit(true);
      setEditError("");
      setSaveSuccess("");

      const trimmedKeterangan = editKeterangan.trim();

      await updateAbsensi(String(absensi.id), {
        status: editStatus,
        keterangan: trimmedKeterangan ? trimmedKeterangan : null,
      });

      setEditOpen(false);
      setSaveSuccess("Status absensi berhasil diperbarui.");
      await loadDetail();
    } catch (err) {
      setEditError(
        err?.message || "Gagal memperbarui status absensi siswa."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const loadDetail = useCallback(async () => {
    if (!absenId) {
      setAbsensi(null);
      setError("ID absensi tidak ditemukan pada URL.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (kelasIdFromQuery) {
        try {
          const [kelasResponse, response] = await Promise.all([
            getKelas({ page: 1, limit: 100 }),
            getAbsensiKelas(kelasIdFromQuery, null),
          ]);

          const daftarKelas = normalizeArray(kelasResponse);
          const kelas = daftarKelas.find(
            (item) => String(item.id) === String(kelasIdFromQuery)
          );

          const items = normalizeArray(response);
          const found = items.find(
            (item) => String(item.id) === String(absenId)
          );

          if (found) {
            console.log("[ABSENSI] Data detail:", found);
            console.log("[ABSENSI] Field foto:", getFotoWajah(found));
            setAbsensi(mapAbsensi(found, kelas || null));
            return;
          }
        } catch (err) {
          console.warn(
            "[ABSENSI] Gagal mencari pada kelas dari query:",
            err
          );
        }
      }

      const kelasResponse = await getKelas({
        page: 1,
        limit: 100,
        sortBy: "tingkat",
        sortOrder: "asc",
      });

      const daftarKelas = normalizeArray(kelasResponse);

      for (const kelas of daftarKelas) {
        try {
          const response = await getAbsensiKelas(kelas.id, null);
          const items = normalizeArray(response);

          const found = items.find(
            (item) => String(item.id) === String(absenId)
          );

          if (found) {
            console.log("[ABSENSI] Data detail:", found);
            console.log("[ABSENSI] Field foto:", getFotoWajah(found));
            setAbsensi(mapAbsensi(found, kelas));
            return;
          }
        } catch (err) {
          console.warn(
            "[ABSENSI] Gagal mengambil absensi kelas:",
            kelas?.id,
            err
          );
        }
      }

      setAbsensi(null);
      setError("Data absensi tidak ditemukan.");
    } catch (err) {
      console.error("[ABSENSI] Gagal mengambil detail:", err);
      setError(err?.message || "Gagal mengambil detail absensi.");
    } finally {
      setLoading(false);
    }
  }, [absenId, kelasIdFromQuery]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        active="siswaAbsen"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={() => setIsCollapsed((prev) => !prev)}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/admin/siswa/absen")}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border theme-border theme-card theme-text-secondary text-sm font-semibold hover:theme-card-soft transition-colors"
                >
                  <ArrowLeft size={15} />
                  Kembali
                </button>

                <div className="p-2.5 rounded-xl theme-primary text-white shadow-sm">
                  <ClipboardCheck size={20} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold theme-text">
                    Detail Absensi Siswa
                  </h1>
                  <p className="text-sm theme-text-muted">
                    Informasi lengkap kehadiran siswa.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!loading && absensi && isAdminSekolah && (
                  <CanAccess menu="monitoring absensi" action="update">
                    <button
                      type="button"
                      onClick={openEditModal}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl theme-primary text-white text-sm font-semibold hover:brightness-95 transition"
                    >
                      <Pencil size={15} />
                      Ubah Status
                    </button>
                  </CanAccess>
                )}

                <button
                  type="button"
                  onClick={loadDetail}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-secondary text-sm font-semibold hover:theme-card-soft transition-colors disabled:opacity-60"
                >
                  <RefreshCw
                    size={15}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {saveSuccess && (
              <div className="flex items-center justify-between gap-3 rounded-xl border theme-success px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <Check size={16} className="shrink-0" />
                  <span>{saveSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSaveSuccess("")}
                  aria-label="Tutup notifikasi"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {error && !loading && (
              <div className="flex items-start gap-3 rounded-xl border theme-danger p-4">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold">
                    Gagal memuat detail
                  </p>
                  <p className="text-xs mt-1 opacity-90">{error}</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="theme-card rounded-xl border theme-border p-14 shadow-sm">
                <div className="flex flex-col items-center">
                  <RefreshCw
                    size={24}
                    className="theme-text-primary animate-spin"
                  />
                  <p className="text-sm font-semibold theme-text mt-3">
                    Memuat detail absensi...
                  </p>
                  <p className="text-xs theme-text-muted mt-1">
                    Data sedang diambil dari backend.
                  </p>
                </div>
              </div>
            )}

            {!loading && absensi && (
              <>
                <div className="theme-card rounded-2xl border theme-border p-5 shadow-sm">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-16 h-16 rounded-full theme-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {getInitials(absensi.nama)}
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <h2 className="text-lg font-bold theme-text">
                        {absensi.nama}
                      </h2>
                      <p className="text-xs theme-text-muted mt-1">
                        NISN: {absensi.nisn}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2.5 py-1 rounded-lg theme-primary-soft theme-text-primary text-[11px] font-bold border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]">
                          {absensi.kelas}
                        </span>
                        <StatusBadge status={absensi.status} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <DetailBox
                    icon={CalendarDays}
                    label="Tanggal"
                    value={absensi.tanggalLabel}
                  />
                  <DetailBox
                    icon={Clock3}
                    label="Jam Masuk"
                    value={absensi.jamMasuk}
                  />
                  <DetailBox
                    icon={UserRound}
                    label="Wali Kelas"
                    value={absensi.waliKelas}
                  />
                  <DetailBox
                    icon={ClipboardCheck}
                    label="Metode"
                    value={absensi.metode}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FotoKehadiran
                    foto={absensi.foto}
                    nama={absensi.nama}
                  />

                  <div className="theme-card border theme-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-4 py-3 theme-card-soft border-b theme-border">
                      <div className="flex items-center gap-2">
                        <Navigation
                          size={15}
                          className="theme-text-primary"
                        />
                        <p className="text-xs font-semibold theme-text">
                          Lokasi GPS
                        </p>
                      </div>
                    </div>

                    <div className="p-4">
                      {Number.isFinite(absensi.latitude) &&
                      Number.isFinite(absensi.longitude) ? (
                        <>
                          <a
                            href={`https://www.google.com/maps?q=${absensi.latitude},${absensi.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="h-32 rounded-lg border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex items-center justify-center relative overflow-hidden hover:opacity-80 transition-opacity"
                            title="Buka lokasi di Google Maps"
                          >
                            <div className="absolute inset-0 opacity-10">
                              <div className="w-full h-full bg-[linear-gradient(90deg,transparent_49%,currentColor_50%,transparent_51%),linear-gradient(0deg,transparent_49%,currentColor_50%,transparent_51%)] bg-[size:30px_30px]" />
                            </div>
                            <div className="relative w-10 h-10 rounded-full theme-card flex items-center justify-center shadow-sm">
                              <MapPin
                                size={22}
                                className="theme-text-primary"
                                fill="currentColor"
                              />
                            </div>
                          </a>

                          <div className="mt-3 space-y-3">
                            <div>
                              <p className="text-[10px] theme-text-placeholder">
                                Latitude
                              </p>
                              <p className="font-mono text-xs theme-text-secondary">
                                {absensi.latitude.toFixed(6)}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] theme-text-placeholder">
                                Longitude
                              </p>
                              <p className="font-mono text-xs theme-text-secondary">
                                {absensi.longitude.toFixed(6)}
                              </p>
                            </div>

                            {Number.isFinite(absensi.akurasi) && (
                              <div className="flex items-center gap-2 text-[11px] theme-primary-text">
                                <Navigation size={12} />
                                Akurasi GPS ±{absensi.akurasi} meter
                              </div>
                            )}

                            <a
                              href={`https://www.google.com/maps?q=${absensi.latitude},${absensi.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-xs font-semibold theme-text-primary hover:opacity-80"
                            >
                              <ExternalLink size={13} />
                              Buka di Google Maps
                            </a>
                          </div>
                        </>
                      ) : (
                        <div className="h-48 flex flex-col items-center justify-center">
                          <MapPin size={32} className="theme-text-placeholder" />
                          <p className="text-xs theme-text-muted mt-2">
                            Lokasi GPS tidak tersedia
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl theme-card border theme-border shadow-sm">
                  <p className="text-[10px] uppercase tracking-wide font-bold theme-text-placeholder">
                    Keterangan
                  </p>
                  <p className="text-sm theme-text-secondary mt-2">
                    {absensi.keterangan}
                  </p>
                </div>

                {editOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="theme-card border theme-border rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4">
                      <div className="flex items-center justify-between border-b theme-border pb-3">
                        <div>
                          <h3 className="text-base font-bold theme-text">
                            Ubah Status Absensi
                          </h3>
                          <p className="text-xs theme-text-muted mt-0.5">
                            {absensi.nama} • {absensi.tanggalLabel}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditOpen(false)}
                          disabled={savingEdit}
                          className="p-1.5 rounded-lg theme-text-muted hover:theme-card-soft"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {editError && (
                        <div className="rounded-xl border theme-danger p-3 text-xs">
                          {editError}
                        </div>
                      )}

                      <form onSubmit={handleSaveEdit} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
                            Status Kehadiran
                          </label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            disabled={savingEdit}
                            className="theme-input w-full rounded-xl border theme-border px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                          >
                            <option value="hadir">Hadir</option>
                            <option value="terlambat">Terlambat</option>
                            <option value="izin">Izin</option>
                            <option value="sakit">Sakit</option>
                            <option value="alpha">Alpa</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold theme-text-secondary mb-1.5">
                            Keterangan
                          </label>
                          <textarea
                            rows={3}
                            maxLength={500}
                            value={editKeterangan}
                            onChange={(e) => setEditKeterangan(e.target.value)}
                            disabled={savingEdit}
                            placeholder="Catatan atau alasan perubahan status absensi..."
                            className="theme-input w-full rounded-xl border theme-border px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditOpen(false)}
                            disabled={savingEdit}
                            className="px-4 py-2 rounded-xl border theme-border theme-text-secondary text-sm font-semibold hover:theme-card-soft"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            disabled={savingEdit}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl theme-primary text-white text-sm font-semibold hover:brightness-95 disabled:opacity-60"
                          >
                            {savingEdit && (
                              <RefreshCw size={14} className="animate-spin" />
                            )}
                            Simpan Perubahan
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}