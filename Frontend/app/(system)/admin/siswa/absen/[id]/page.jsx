"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

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
} from "lucide-react";

import {
  getAbsensiKelas,
} from "@/services/absensi.service";

import {
  getKelas,
} from "@/services/kelas.service";

/* =========================================================
   HELPERS
========================================================= */

function normalizeArray(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.result)) {
    return response.result;
  }

  if (Array.isArray(response?.result?.data)) {
    return response.result.data;
  }

  return [];
}

function normalizeStatus(status) {
  const value = String(status || "")
    .toLowerCase()
    .trim();

  if (value === "hadir") return "Hadir";

  if (value === "izin") return "Izin";

  if (value === "sakit") return "Sakit";

  if (
    value === "alpa" ||
    value === "alpha"
  ) {
    return "Alpa";
  }

  if (value === "terlambat") {
    return "Terlambat";
  }

  return status
    ? String(status)
    : "Alpa";
}

function formatTanggal(value) {
  if (!value) return "-";

  const raw = String(value);

  const dateOnly = raw.slice(0, 10);

  const date = new Date(
    `${dateOnly}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}

function formatJam(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleTimeString(
    "id-ID",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  );
}

function getInitials(nama) {
  return String(nama || "Siswa")
    .replace(/,.*/, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (word) => word?.[0] || ""
    )
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

function mapAbsensi(item, kelas) {
  const tanggal =
    item?.tanggal ||
    item?.dibuatPada ||
    null;

  const dibuatPada =
    item?.dibuatPada ||
    null;

  const latitude =
    item?.lintang !== null &&
    item?.lintang !== undefined
      ? Number(item.lintang)
      : null;

  const longitude =
    item?.bujur !== null &&
    item?.bujur !== undefined
      ? Number(item.bujur)
      : null;

  const akurasi =
    item?.akurasi !== null &&
    item?.akurasi !== undefined
      ? Number(item.akurasi)
      : null;

  let status = normalizeStatus(
    item?.status
  );

  const terlambatValue =
    item?.terlambat ??
    item?.terlambatMenit ??
    item?.menitTerlambat ??
    0;

  if (
    status === "Hadir" &&
    Number(terlambatValue) > 0
  ) {
    status = "Terlambat";
  }

  return {
    id: item?.id,

    nama: getNamaSiswa(item),

    nisn: getNisn(item),

    kelas: getNamaKelas(
      item,
      kelas
    ),

    kelasId:
      item?.kelasId ||
      item?.kelas?.id ||
      kelas?.id ||
      null,

    tanggal,

    tanggalLabel:
      formatTanggal(tanggal),

    jamMasuk:
      formatJam(
        dibuatPada || tanggal
      ),

    status,

    lokasi:
      item?.metode === "lokasi"
        ? "Sekolah"
        : item?.metode
        ? String(item.metode)
        : "-",

    metode:
      item?.metode || "-",

    latitude,

    longitude,

    akurasi,

    foto:
      item?.urlFoto ||
      item?.fotoUrl ||
      item?.foto ||
      null,

    keterangan:
      item?.keterangan || "-",

    waliKelas:
      item?.kelas?.waliKelas
        ?.namaLengkap ||
      item?.kelas?.waliKelas?.nama ||
      kelas?.waliKelas
        ?.namaLengkap ||
      kelas?.waliKelas?.nama ||
      "-",

    dibuatPada,

    terlambat:
      Number(terlambatValue) || 0,

    raw: item,
  };
}

/* =========================================================
   UI HELPERS
========================================================= */

function StatusBadge({ status }) {
  const styles = {
    Hadir:
      "bg-emerald-50 text-emerald-600 border-emerald-200",

    Terlambat:
      "bg-amber-50 text-amber-600 border-amber-200",

    Izin:
      "bg-blue-50 text-blue-600 border-blue-200",

    Sakit:
      "bg-orange-50 text-orange-600 border-orange-200",

    Alpa:
      "bg-red-50 text-red-600 border-red-200",
  };

  const dots = {
    Hadir: "bg-emerald-500",

    Terlambat: "bg-amber-500",

    Izin: "bg-blue-500",

    Sakit: "bg-orange-500",

    Alpa: "bg-red-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
        styles[status] ||
        "bg-slate-100 text-slate-500 border-slate-200"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          dots[status] ||
          "bg-slate-400"
        }`}
      />

      {status}
    </span>
  );
}

function DetailBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="p-3 rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2">
        <Icon
          size={14}
          className="text-[#155DFC]"
        />

        <span className="text-[11px] text-slate-500">
          {label}
        </span>
      </div>

      <p className="text-sm font-semibold text-slate-700 mt-2">
        {value || "-"}
      </p>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function DetailAbsenSiswaPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const absenId = params?.id
    ? String(params.id)
    : "";

  const kelasIdFromQuery =
    searchParams?.get("kelasId") || "";

  const [
    isCollapsed,
    setIsCollapsed,
  ] = useState(false);

  const [
    absensi,
    setAbsensi,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* =========================================================
     LOAD DETAIL
  ========================================================= */

  const loadDetail =
    useCallback(async () => {
      if (!absenId) return;

      try {
        setLoading(true);
        setError("");

        /*
         * Kalau ada kelasId dari query,
         * ambil langsung dari kelas itu.
         */
        if (kelasIdFromQuery) {
          const kelasResponse =
            await getKelas({
              page: 1,
              limit: 100,
            });

          const daftarKelas =
            normalizeArray(
              kelasResponse
            );

          const kelas =
            daftarKelas.find(
              (k) =>
                String(k.id) ===
                String(kelasIdFromQuery)
            );

          const response =
            await getAbsensiKelas(
              kelasIdFromQuery,
              null
            );

          const items =
            normalizeArray(response);

          const found = items.find(
            (item) =>
              String(item.id) ===
              String(absenId)
          );

          if (found) {
            setAbsensi(
              mapAbsensi(
                found,
                kelas || null
              )
            );
            return;
          }
        }

        /*
         * Fallback: cari di semua kelas.
         */
        const kelasResponse =
          await getKelas({
            page: 1,
            limit: 100,
            sortBy: "tingkat",
            sortOrder: "asc",
          });

        const daftarKelas =
          normalizeArray(
            kelasResponse
          );

        for (const kelas of daftarKelas) {
          try {
            const response =
              await getAbsensiKelas(
                kelas.id,
                null
              );

            const items =
              normalizeArray(response);

            const found = items.find(
              (item) =>
                String(item.id) ===
                String(absenId)
            );

            if (found) {
              setAbsensi(
                mapAbsensi(
                  found,
                  kelas
                )
              );
              return;
            }
          } catch {
            // lanjut ke kelas berikutnya
          }
        }

        setAbsensi(null);
        setError(
          "Data absensi tidak ditemukan."
        );
      } catch (err) {
        console.error(
          "Gagal mengambil detail absensi:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil detail absensi."
        );
      } finally {
        setLoading(false);
      }
    }, [absenId, kelasIdFromQuery]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar
        active="siswaAbsen"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={() =>
            setIsCollapsed(
              (prev) => !prev
            )
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email:
              "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">

            {/* HEADER */}

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/siswa/absen"
                    )
                  }
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft size={15} />
                  Kembali
                </button>

                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white shadow-lg shadow-[#155DFC]/20">
                  <ClipboardCheck
                    size={20}
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Detail Absensi
                    Siswa
                  </h1>

                  <p className="text-sm text-slate-500">
                    Informasi lengkap
                    kehadiran siswa.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadDetail}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>
            </div>

            {/* ERROR */}

            {error && !loading && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertCircle
                  size={18}
                  className="text-red-500 mt-0.5"
                />

                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Gagal memuat detail
                  </p>

                  <p className="text-xs text-red-600 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* LOADING */}

            {loading && (
              <div className="bg-white rounded-xl border border-slate-200/80 p-14 shadow-sm">
                <div className="flex flex-col items-center">
                  <RefreshCw
                    size={24}
                    className="text-[#155DFC] animate-spin"
                  />

                  <p className="text-sm font-semibold text-slate-700 mt-3">
                    Memuat detail
                    absensi...
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Data sedang diambil
                    dari backend.
                  </p>
                </div>
              </div>
            )}

            {/* CONTENT */}

            {!loading && absensi && (
              <>
                {/* PROFIL */}

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white flex items-center justify-center font-bold text-lg">
                      {getInitials(
                        absensi.nama
                      )}
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <h2 className="text-lg font-bold text-slate-800">
                        {absensi.nama}
                      </h2>

                      <p className="text-xs text-slate-500 mt-1">
                        NISN:{" "}
                        {absensi.nisn}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2.5 py-1 rounded-lg bg-[#eaf1ff] border border-[#c7dbff] text-[#155DFC] text-[11px] font-bold">
                          {absensi.kelas}
                        </span>

                        <StatusBadge
                          status={
                            absensi.status
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* DETAIL BOXES */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <DetailBox
                    icon={CalendarDays}
                    label="Tanggal"
                    value={
                      absensi.tanggalLabel
                    }
                  />

                  <DetailBox
                    icon={Clock3}
                    label="Jam Masuk"
                    value={
                      absensi.jamMasuk
                    }
                  />

                  <DetailBox
                    icon={UserRound}
                    label="Wali Kelas"
                    value={
                      absensi.waliKelas
                    }
                  />

                  <DetailBox
                    icon={ClipboardCheck}
                    label="Metode"
                    value={
                      absensi.metode
                    }
                  />
                </div>

                {/* FOTO + GPS */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* FOTO */}

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Camera
                          size={15}
                          className="text-[#155DFC]"
                        />

                        <p className="text-xs font-semibold text-slate-700">
                          Foto Kehadiran
                        </p>
                      </div>
                    </div>

                    <div className="aspect-video bg-slate-100 flex items-center justify-center">
                      {absensi.foto ? (
                        <img
                          src={absensi.foto}
                          alt="Foto kehadiran"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Camera
                            size={32}
                            className="text-slate-300"
                          />

                          <p className="text-xs text-slate-400 mt-2">
                            Foto belum
                            tersedia
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GPS */}

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Navigation
                          size={15}
                          className="text-[#155DFC]"
                        />

                        <p className="text-xs font-semibold text-slate-700">
                          Lokasi GPS
                        </p>
                      </div>
                    </div>

                    <div className="p-4">
                      {Number.isFinite(
                        absensi.latitude
                      ) ? (
                        <>
                          <div className="h-32 rounded-lg bg-[#eaf1ff] flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-30">
                              <div className="w-full h-full bg-[linear-gradient(90deg,transparent_49%,#155DFC_50%,transparent_51%),linear-gradient(0deg,transparent_49%,#155DFC_50%,transparent_51%)] bg-[size:30px_30px]" />
                            </div>

                            <div className="relative w-10 h-10 rounded-full bg-[#155DFC]/20 flex items-center justify-center">
                              <MapPin
                                size={22}
                                className="text-[#155DFC]"
                                fill="currentColor"
                              />
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            <div>
                              <p className="text-[10px] text-slate-400">
                                Latitude
                              </p>

                              <p className="font-mono text-xs text-slate-700">
                                {absensi.latitude.toFixed(
                                  6
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] text-slate-400">
                                Longitude
                              </p>

                              <p className="font-mono text-xs text-slate-700">
                                {Number.isFinite(
                                  absensi.longitude
                                )
                                  ? absensi.longitude.toFixed(
                                      6
                                    )
                                  : "-"}
                              </p>
                            </div>

                            {Number.isFinite(
                              absensi.akurasi
                            ) && (
                              <div className="flex items-center gap-2 text-[11px] text-emerald-600">
                                <Navigation
                                  size={12}
                                />

                                Akurasi GPS ±
                                {
                                  absensi.akurasi
                                }{" "}
                                meter
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="h-48 flex flex-col items-center justify-center">
                          <MapPin
                            size={32}
                            className="text-slate-300"
                          />

                          <p className="text-xs text-slate-400 mt-2">
                            Lokasi tidak
                            tersedia
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* KETERANGAN */}

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
                    Keterangan
                  </p>

                  <p className="text-sm text-slate-700 mt-2">
                    {absensi.keterangan}
                  </p>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}