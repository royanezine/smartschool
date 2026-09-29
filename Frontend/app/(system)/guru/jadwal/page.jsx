"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  CheckSquare,
  FileText,
  CalendarDays,
  CircleDot,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

/* =========================================================
   CONFIG
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const BASE_ENDPOINT = "/api/v1/jadwal-mengajar";

const HARI_OPTIONS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
];

/* =========================================================
   HELPER - TOKEN
========================================================= */

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const tokenKeys = [
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "jwt",
  ];

  for (const key of tokenKeys) {
    const value = localStorage.getItem(key);

    if (value && value.trim()) {
      return value
        .trim()
        .replace(/^Bearer\s+/i, "");
    }
  }

  return null;
}

/* =========================================================
   HELPER - DECODE JWT
========================================================= */

function getUserFromToken() {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];

    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(
          (char) =>
            "%" +
            ("00" + char.charCodeAt(0).toString(16)).slice(-2)
        )
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Gagal membaca JWT:", error);
    return null;
  }
}

/* =========================================================
   HELPER - REQUEST
========================================================= */

async function getJadwalMengajar() {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Token login tidak ditemukan. Silakan login kembali."
    );
  }

  const response = await fetch(
    `${API_URL}${BASE_ENDPOINT}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const rawText = await response.text();

  let result = null;

  if (rawText.trim()) {
    try {
      result = JSON.parse(rawText);
    } catch {
      throw new Error(
        `Server mengembalikan response bukan JSON (${response.status}).`
      );
    }
  }

  if (response.status === 401) {
    throw new Error(
      result?.message ||
        "Token tidak valid atau sudah expired. Silakan login kembali."
    );
  }

  if (response.status === 403) {
    throw new Error(
      result?.message ||
        "Anda tidak memiliki akses ke jadwal mengajar."
    );
  }

  if (!response.ok) {
    throw new Error(
      result?.message ||
        `Gagal mengambil jadwal mengajar (${response.status}).`
    );
  }

  return result;
}

/* =========================================================
   HELPER - HARI SEKARANG
========================================================= */

function getHariSekarang() {
  const hari = new Date().getDay();

  const mapping = {
    0: "Minggu",
    1: "Senin",
    2: "Selasa",
    3: "Rabu",
    4: "Kamis",
    5: "Jumat",
    6: "Sabtu",
  };

  return mapping[hari];
}

/* =========================================================
   HELPER - JAM KE MENIT
========================================================= */

function timeToMinutes(time) {
  if (!time) {
    return 0;
  }

  const [hours, minutes] = String(time)
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

/* =========================================================
   HELPER - FORMAT JAM
========================================================= */

function formatTime(time) {
  if (!time) {
    return "-";
  }

  const value = String(time);

  const parts = value.split(":");

  if (parts.length < 2) {
    return value;
  }

  return `${parts[0].padStart(2, "0")}.${parts[1].padStart(
    2,
    "0"
  )}`;
}

/* =========================================================
   HELPER - STATUS JADWAL
========================================================= */

function getStatusJadwal(jadwal) {
  const hariSekarang = getHariSekarang();

  if (jadwal.hari !== hariSekarang) {
    return "akan datang";
  }

  const now = new Date();

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  const mulai = timeToMinutes(jadwal.jamMulai);
  const selesai = timeToMinutes(jadwal.jamSelesai);

  if (currentMinutes < mulai) {
    return "akan datang";
  }

  if (
    currentMinutes >= mulai &&
    currentMinutes <= selesai
  ) {
    return "berlangsung";
  }

  return "selesai";
}

/* =========================================================
   STATUS STYLE
========================================================= */

const statusStyle = {
  selesai: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
    label: "Selesai",
  },

  berlangsung: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
    label: "Berlangsung",
  },

  "akan datang": {
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-400",
    label: "Akan datang",
  },
};

/* =========================================================
   NORMALIZE DATA
========================================================= */

function normalizeJadwal(item) {
  return {
    ...item,

    kelasNama:
      item?.kelasMapel?.kelas?.nama ||
      "-",

    mapelNama:
      item?.kelasMapel?.mataPelajaran?.nama ||
      "-",

    guruNama:
      item?.kelasMapel?.guruPengajar?.namaLengkap ||
      "-",

    guruId:
      item?.kelasMapel?.guruPengajar?.id ||
      null,

    kelasId:
      item?.kelasMapel?.kelas?.id ||
      null,

    mataPelajaranId:
      item?.kelasMapel?.mataPelajaran?.id ||
      null,

    statusJadwal:
      getStatusJadwal(item),
  };
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function GuruJadwalPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [hariAktif, setHariAktif] =
    useState("Senin");

  const [jadwal, setJadwal] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [userData, setUserData] =
    useState(null);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  async function loadJadwal(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const tokenUser = getUserFromToken();

      setUserData(tokenUser);

      const response =
        await getJadwalMengajar();

      const semuaJadwal =
        response?.data || [];

      if (!Array.isArray(semuaJadwal)) {
        setJadwal([]);
        return;
      }

      /*
       * BE mengembalikan semua jadwal dalam sekolah.
       *
       * Kita filter hanya jadwal milik guru yang login.
       */

      const userId =
        tokenUser?.userId ||
        tokenUser?.id ||
        null;

      let jadwalGuru = semuaJadwal;

      if (userId) {
        jadwalGuru = semuaJadwal.filter(
          (item) =>
            item?.kelasMapel?.guruPengajar?.id ===
            userId
        );
      }

      const normalized =
        jadwalGuru
          .map(normalizeJadwal)
          .sort((a, b) => {
            const hariOrder = {
              Senin: 1,
              Selasa: 2,
              Rabu: 3,
              Kamis: 4,
              Jumat: 5,
              Sabtu: 6,
              Minggu: 7,
            };

            const hariA =
              hariOrder[a.hari] || 99;

            const hariB =
              hariOrder[b.hari] || 99;

            if (hariA !== hariB) {
              return hariA - hariB;
            }

            return (
              timeToMinutes(a.jamMulai) -
              timeToMinutes(b.jamMulai)
            );
          });

      setJadwal(normalized);
    } catch (err) {
      console.error(
        "Gagal mengambil jadwal mengajar:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil jadwal mengajar."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    const hariSekarang =
      getHariSekarang();

    if (
      HARI_OPTIONS.includes(hariSekarang)
    ) {
      setHariAktif(hariSekarang);
    }

    loadJadwal();
  }, []);

  /* =======================================================
     REFRESH STATUS
     Supaya status berlangsung/selesai berubah otomatis.
  ======================================================= */

  useEffect(() => {
    const interval = setInterval(() => {
      setJadwal((current) =>
        current.map((item) => ({
          ...item,
          statusJadwal:
            getStatusJadwal(item),
        }))
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  /* =======================================================
     JADWAL HARI AKTIF
  ======================================================= */

  const sesiHari = useMemo(() => {
    return jadwal
      .filter(
        (item) =>
          item.hari === hariAktif
      )
      .sort(
        (a, b) =>
          timeToMinutes(a.jamMulai) -
          timeToMinutes(b.jamMulai)
      );
  }, [jadwal, hariAktif]);

  /* =======================================================
     SUMMARY - SESI HARI INI
  ======================================================= */

  const sesiHariIni = useMemo(() => {
    const hariSekarang =
      getHariSekarang();

    if (
      !HARI_OPTIONS.includes(hariSekarang)
    ) {
      return 0;
    }

    return jadwal.filter(
      (item) =>
        item.hari === hariSekarang
    ).length;
  }, [jadwal]);

  /* =======================================================
     SUMMARY - JAM PER MINGGU
  ======================================================= */

  const jamPerMinggu = useMemo(() => {
    let totalMinutes = 0;

    jadwal.forEach((item) => {
      const mulai =
        timeToMinutes(item.jamMulai);

      const selesai =
        timeToMinutes(item.jamSelesai);

      if (selesai > mulai) {
        totalMinutes +=
          selesai - mulai;
      }
    });

    const hours =
      Math.floor(totalMinutes / 60);

    const minutes =
      totalMinutes % 60;

    if (minutes === 0) {
      return `${hours} jam`;
    }

    return `${hours} jam ${minutes} menit`;
  }, [jadwal]);

  /* =======================================================
     SUMMARY - PRESENSI
     
     Belum mengambil dari endpoint absensi karena halaman
     jadwal ini belum menggunakan endpoint summary absensi.
  ======================================================= */

  const presensiBulanIni = "-";

  /* =======================================================
     SUMMARY - IZIN
     
     Belum mengambil dari endpoint izin karena endpoint
     izin belum diberikan.
  ======================================================= */

  const izinDiajukan = "-";

  /* =======================================================
     USER HEADER
  ======================================================= */

  const userName =
    userData?.namaLengkap ||
    userData?.nama ||
    "Guru";

  const userEmail =
    userData?.email ||
    "guru@smartschool.com";

  const avatar =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) =>
        word.charAt(0).toUpperCase()
      )
      .join("") || "GU";

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const notifications = [
    {
      id: 1,
      title: "Jadwal Mengajar",
      desc: `${jadwal.length} jadwal mengajar ditemukan`,
      read: true,
    },
  ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        active="jadwal"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
          notifications={notifications}
          user={{
            name: userName,
            email: userEmail,
            avatar,
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-600 text-white shadow-sm flex-shrink-0">
                    <Calendar size={18} />
                  </div>

                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                    Jadwal Mengajar
                  </h1>
                </div>

                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles
                    size={14}
                    className="text-slate-400 flex-shrink-0"
                  />

                  <span className="truncate">
                    Jadwal kelas dan waktu mengajar Anda.
                  </span>
                </p>
              </div>

              {/* ACTION */}

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() =>
                    loadJadwal(true)
                  }
                  disabled={refreshing}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  {refreshing
                    ? "Memuat..."
                    : "Refresh"}
                </button>

                <button
                  onClick={() =>
                    router.push(
                      "/guru/jadwal/presensi"
                    )
                  }
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors shadow-sm whitespace-nowrap"
                >
                  <CheckSquare size={16} />
                  Presensi
                </button>

                <button
                  onClick={() =>
                    router.push(
                      "/guru/jadwal/izin"
                    )
                  }
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap"
                >
                  <FileText size={16} />
                  Ajukan Izin
                </button>
              </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="text-red-500 flex-shrink-0 mt-0.5"
                />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-red-700">
                    Gagal memuat jadwal
                  </p>

                  <p className="text-sm text-red-600 mt-1">
                    {error}
                  </p>

                  <button
                    onClick={() =>
                      loadJadwal(true)
                    }
                    className="mt-3 text-xs font-semibold text-red-700 hover:text-red-800 underline"
                  >
                    Coba lagi
                  </button>
                </div>
              </div>
            )}

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

              {/* SESI */}

              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-blue-50 text-blue-600 border-blue-200 flex-shrink-0">
                  <CalendarDays size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">
                    Sesi Hari Ini
                  </p>

                  <p className="text-lg font-bold text-slate-800">
                    {loading
                      ? "..."
                      : sesiHariIni}
                  </p>
                </div>
              </div>

              {/* JAM */}

              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-purple-50 text-purple-600 border-purple-200 flex-shrink-0">
                  <Clock size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">
                    Jam per Minggu
                  </p>

                  <p className="text-lg font-bold text-slate-800">
                    {loading
                      ? "..."
                      : jamPerMinggu}
                  </p>
                </div>
              </div>

              {/* PRESENSI */}

              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-200 flex-shrink-0">
                  <CheckSquare size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">
                    Presensi Bulan Ini
                  </p>

                  <p className="text-lg font-bold text-slate-800">
                    {presensiBulanIni}
                  </p>
                </div>
              </div>

              {/* IZIN */}

              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-amber-50 text-amber-600 border-amber-200 flex-shrink-0">
                  <FileText size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">
                    Izin Diajukan
                  </p>

                  <p className="text-lg font-bold text-slate-800">
                    {izinDiajukan}
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-12 text-center">
                <RefreshCw
                  size={28}
                  className="mx-auto text-blue-500 animate-spin mb-3"
                />

                <p className="text-sm font-medium text-slate-600">
                  Memuat jadwal mengajar...
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Mengambil data dari server
                </p>
              </div>
            )}

            {/* =================================================
                JADWAL MINGGUAN
            ================================================= */}

            {!loading && (
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">

                {/* HEADER */}

                <div className="p-4 sm:p-5 border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 truncate">
                      Jadwal Minggu Ini
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Menampilkan jadwal mengajar Anda dari sistem.
                    </p>
                  </div>

                  {/* HARI */}

                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
                    {HARI_OPTIONS.map(
                      (hari) => (
                        <button
                          key={hari}
                          onClick={() =>
                            setHariAktif(hari)
                          }
                          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex-shrink-0 ${
                            hariAktif === hari
                              ? "bg-white text-slate-800 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          {hari}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* DATA */}

                <div className="divide-y divide-slate-100">

                  {sesiHari.length === 0 && (
                    <div className="p-10 text-center">
                      <Calendar
                        size={28}
                        className="mx-auto text-slate-300 mb-2"
                      />

                      <p className="text-sm text-slate-400">
                        Tidak ada jadwal mengajar di hari{" "}
                        {hariAktif}.
                      </p>
                    </div>
                  )}

                  {sesiHari.map(
                    (sesi) => {
                      const status =
                        sesi.statusJadwal ||
                        getStatusJadwal(
                          sesi
                        );

                      const s =
                        statusStyle[
                          status
                        ] ||
                        statusStyle[
                          "akan datang"
                        ];

                      return (
                        <div
                          key={sesi.id}
                          className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-5 py-4"
                        >
                          {/* JAM */}

                          <span className="text-xs font-medium text-slate-400 sm:w-32 flex-shrink-0 flex items-center gap-1.5">
                            <Clock
                              size={13}
                              className="flex-shrink-0"
                            />

                            {formatTime(
                              sesi.jamMulai
                            )}{" "}
                            -{" "}
                            {formatTime(
                              sesi.jamSelesai
                            )}
                          </span>

                          {/* MAPEL */}

                          <div className="min-w-0 sm:flex-1">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {sesi.mapelNama}
                            </p>

                            <p className="text-xs text-slate-400 mt-0.5">
                              {sesi.guruNama}
                            </p>
                          </div>

                          {/* RUANGAN */}

                          <span className="text-xs text-slate-500 flex items-center gap-1.5 flex-shrink-0">
                            <MapPin
                              size={13}
                              className="flex-shrink-0"
                            />

                            {sesi.ruangan ||
                              "Ruangan belum ditentukan"}
                          </span>

                          {/* KELAS */}

                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border bg-slate-100 text-slate-500 border-slate-200 flex-shrink-0">
                            Kelas{" "}
                            {sesi.kelasNama}
                          </span>

                          {/* STATUS */}

                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text} flex items-center gap-1 flex-shrink-0 w-fit`}
                          >
                            <CircleDot
                              size={10}
                              className={`${s.dot} rounded-full`}
                            />

                            {s.label}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* =================================================
                PINTASAN
            ================================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* PRESENSI */}

              <button
                onClick={() =>
                  router.push(
                    "/guru/jadwal/presensi"
                  )
                }
                className="group text-left bg-white rounded-2xl border border-blue-200 hover:border-blue-300 p-5 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden min-w-0"
              >
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-blue-50 opacity-70" />

                <div className="relative min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
                      <CheckSquare size={20} />
                    </div>

                    <ChevronRight
                      size={20}
                      className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0"
                    />
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-slate-800 truncate">
                    Check-in Presensi
                  </h3>

                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                    Catat kehadiran Anda saat masuk mengajar hari ini.
                  </p>
                </div>
              </button>

              {/* IZIN */}

              <button
                onClick={() =>
                  router.push(
                    "/guru/jadwal/izin"
                  )
                }
                className="group text-left bg-white rounded-2xl border border-amber-200 hover:border-amber-300 p-5 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden min-w-0"
              >
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-amber-50 opacity-70" />

                <div className="relative min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-amber-50 text-amber-600 flex-shrink-0">
                      <FileText size={20} />
                    </div>

                    <ChevronRight
                      size={20}
                      className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0"
                    />
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-slate-800 truncate">
                    Pengajuan Izin
                  </h3>

                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                    Ajukan izin tidak hadir mengajar dan pantau statusnya.
                  </p>
                </div>
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}