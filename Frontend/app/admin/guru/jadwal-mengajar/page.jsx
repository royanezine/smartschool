"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import {
  Search,
  Filter,
  CalendarClock,
  Printer,
  Pencil,
  Trash2,
  Users,
  BookMarked,
  Clock3,
  Plus,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  MapPin,
  GraduationCap,
  LayoutGrid,
  List,
  CheckCircle2,
  MoreHorizontal,
  CalendarDays,
  UserRound,
  School,
  Sparkles,
  X,
} from "lucide-react";

import {
  getJadwalMengajar,
  deleteJadwalMengajar,
} from "../../../../services/jadwalMengajar.service";

/* =========================================================
   HARI
========================================================= */

const HARI = [
  {
    key: "senin",
    label: "Senin",
    short: "Sen",
  },
  {
    key: "selasa",
    label: "Selasa",
    short: "Sel",
  },
  {
    key: "rabu",
    label: "Rabu",
    short: "Rab",
  },
  {
    key: "kamis",
    label: "Kamis",
    short: "Kam",
  },
  {
    key: "jumat",
    label: "Jumat",
    short: "Jum",
  },
  {
    key: "sabtu",
    label: "Sabtu",
    short: "Sab",
  },
];

/* =========================================================
   HELPER
========================================================= */

function getNamaGuru(item) {
  return (
    item?.kelasMapel?.guruPengajar?.namaLengkap ||
    item?.guru?.namaLengkap ||
    item?.namaGuru ||
    "-"
  );
}

function getKodeGuru(item) {
  return (
    item?.kelasMapel?.guruPengajar?.nip ||
    item?.guru?.nip ||
    item?.nip ||
    "-"
  );
}

function getMapel(item) {
  return (
    item?.kelasMapel?.mataPelajaran?.nama ||
    item?.mapel?.nama ||
    item?.mataPelajaran?.nama ||
    "-"
  );
}

function getKelas(item) {
  return (
    item?.kelasMapel?.kelas?.nama ||
    item?.kelas?.nama ||
    "-"
  );
}

function getHari(item) {
  return String(item?.hari || "")
    .toLowerCase()
    .trim();
}

function getJam(item) {
  const mulai = item?.jamMulai || "";
  const selesai = item?.jamSelesai || "";

  if (mulai && selesai) {
    return `${mulai}–${selesai}`;
  }

  if (mulai) {
    return mulai;
  }

  if (selesai) {
    return selesai;
  }

  return "";
}

function normalizeHari(hari) {
  const value = String(hari || "")
    .toLowerCase()
    .trim();

  const map = {
    senin: "senin",
    monday: "senin",

    selasa: "selasa",
    tuesday: "selasa",

    rabu: "rabu",
    wednesday: "rabu",

    kamis: "kamis",
    thursday: "kamis",

    jumat: "jumat",
    friday: "jumat",

    sabtu: "sabtu",
    saturday: "sabtu",
  };

  return map[value] || value;
}

/* =========================================================
   NORMALISASI DATA
========================================================= */

function normalizeJadwalData(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => {
    const hari = normalizeHari(
      getHari(item)
    );

    return {
      id: item?.id || "",

      kelasMapelId:
        item?.kelasMapelId ||
        item?.kelasMapel?.id ||
        "",

      guruId:
        item?.kelasMapel?.guruPengajar?.id ||
        item?.guruId ||
        "",

      mapelId:
        item?.kelasMapel?.mataPelajaran?.id ||
        item?.mataPelajaranId ||
        "",

      nama: getNamaGuru(item),

      kode: getKodeGuru(item),

      mapel: getMapel(item),

      kelas: getKelas(item),

      hari,

      jamMulai:
        item?.jamMulai || "",

      jamSelesai:
        item?.jamSelesai || "",

      ruangan:
        item?.ruangan || "",

      original: item,
    };
  });
}

/* =========================================================
   COLOR MAP
========================================================= */

const MAPEL_COLOR = [
  {
    bg: "bg-blue-50",
    border: "border-blue-100",
    text: "text-blue-700",
    icon: "bg-blue-100 text-blue-600",
    line: "bg-blue-500",
  },
  {
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    text: "text-indigo-700",
    icon: "bg-indigo-100 text-indigo-600",
    line: "bg-indigo-500",
  },
  {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-700",
    icon: "bg-emerald-100 text-emerald-600",
    line: "bg-emerald-500",
  },
  {
    bg: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-700",
    icon: "bg-amber-100 text-amber-600",
    line: "bg-amber-500",
  },
  {
    bg: "bg-rose-50",
    border: "border-rose-100",
    text: "text-rose-700",
    icon: "bg-rose-100 text-rose-600",
    line: "bg-rose-500",
  },
  {
    bg: "bg-cyan-50",
    border: "border-cyan-100",
    text: "text-cyan-700",
    icon: "bg-cyan-100 text-cyan-600",
    line: "bg-cyan-500",
  },
  {
    bg: "bg-violet-50",
    border: "border-violet-100",
    text: "text-violet-700",
    icon: "bg-violet-100 text-violet-600",
    line: "bg-violet-500",
  },
];

function getColor(index) {
  return MAPEL_COLOR[index % MAPEL_COLOR.length];
}

/* =========================================================
   PAGE
========================================================= */

export default function JadwalMengajarPage() {
  const router = useRouter();

  const [
    isCollapsed,
    setIsCollapsed,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    mapelFilter,
    setMapelFilter,
  ] = useState("Semua Mapel");

  const [
    selectedHari,
    setSelectedHari,
  ] = useState("senin");

  const [
    jadwal,
    setJadwal,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    viewMode,
    setViewMode,
  ] = useState("timeline");

  const toggleSidebar = () => {
    setIsCollapsed(
      (prev) => !prev
    );
  };

  /* =========================================================
     FETCH
  ========================================================= */

  const fetchJadwal = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getJadwalMengajar();

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Gagal mengambil data jadwal mengajar."
        );
      }

      const data =
        Array.isArray(
          response?.data
        )
          ? response.data
          : [];

      setJadwal(
        normalizeJadwalData(data)
      );
    } catch (err) {
      console.error(
        "[JADWAL] Error:",
        err
      );

      setJadwal([]);

      setError(
        err?.message ||
          "Gagal mengambil data jadwal mengajar."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwal();
  }, []);

  /* =========================================================
     MAPEL OPTIONS
  ========================================================= */

  const MAPEL_OPTIONS =
    useMemo(() => {
      const mapel = jadwal
        .map(
          (item) => item.mapel
        )
        .filter(Boolean);

      return [
        "Semua Mapel",
        ...Array.from(
          new Set(mapel)
        ).sort(),
      ];
    }, [jadwal]);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredJadwal =
    useMemo(() => {
      const keyword =
        search
          .toLowerCase()
          .trim();

      return jadwal.filter(
        (item) => {
          const nama =
            String(
              item.nama || ""
            ).toLowerCase();

          const kode =
            String(
              item.kode || ""
            ).toLowerCase();

          const mapel =
            String(
              item.mapel || ""
            ).toLowerCase();

          const kelas =
            String(
              item.kelas || ""
            ).toLowerCase();

          const matchSearch =
            !keyword ||
            nama.includes(
              keyword
            ) ||
            kode.includes(
              keyword
            ) ||
            mapel.includes(
              keyword
            ) ||
            kelas.includes(
              keyword
            );

          const matchMapel =
            mapelFilter ===
              "Semua Mapel" ||
            item.mapel ===
              mapelFilter;

          return (
            matchSearch &&
            matchMapel
          );
        }
      );
    }, [
      jadwal,
      search,
      mapelFilter,
    ]);

  /* =========================================================
     HARI DATA
  ========================================================= */

  const jadwalHariAktif =
    useMemo(() => {
      return filteredJadwal
        .filter(
          (item) =>
            item.hari ===
            selectedHari
        )
        .sort((a, b) =>
          String(
            a.jamMulai || ""
          ).localeCompare(
            String(
              b.jamMulai || ""
            )
          )
        );
    }, [
      filteredJadwal,
      selectedHari,
    ]);

  /* =========================================================
     STATISTIK
  ========================================================= */

  const totalGuru =
    useMemo(() => {
      return new Set(
        jadwal
          .map(
            (item) =>
              item.guruId ||
              item.nama
          )
          .filter(Boolean)
      ).size;
    }, [jadwal]);

  const totalMapel =
    useMemo(() => {
      return new Set(
        jadwal
          .map(
            (item) =>
              item.mapel
          )
          .filter(Boolean)
      ).size;
    }, [jadwal]);

  const totalKelas =
    useMemo(() => {
      return new Set(
        jadwal
          .map(
            (item) =>
              item.kelas
          )
          .filter(Boolean)
      ).size;
    }, [jadwal]);

  const totalSlot =
    jadwal.length;

  /* =========================================================
     DAY COUNTS
  ========================================================= */

  const getDayCount = (
    day
  ) => {
    return filteredJadwal.filter(
      (item) =>
        item.hari ===
        day
    ).length;
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete =
    async (item) => {
      if (!item?.id) {
        window.alert(
          "ID jadwal tidak ditemukan."
        );

        return;
      }

      const yakin =
        window.confirm(
          `Yakin ingin menghapus jadwal ${item.nama} - ${item.mapel} pada ${item.hari}?`
        );

      if (!yakin) {
        return;
      }

      try {
        setDeletingId(
          item.id
        );

        const response =
          await deleteJadwalMengajar(
            item.id
          );

        if (
          response?.success ===
          false
        ) {
          throw new Error(
            response?.message ||
              "Gagal menghapus jadwal."
          );
        }

        await fetchJadwal();

        if (
          selectedHari ===
            item.hari &&
          jadwalHariAktif.length ===
            1
        ) {
          setSelectedHari(
            "senin"
          );
        }
      } catch (err) {
        console.error(
          "[JADWAL] Delete:",
          err
        );

        window.alert(
          err?.message ||
            "Gagal menghapus jadwal."
        );
      } finally {
        setDeletingId(
          null
        );
      }
    };

  /* =========================================================
     EDIT
  ========================================================= */

  const handleEdit = (item) => {
  if (!item?.id) {
    window.alert("ID jadwal tidak ditemukan.");
    return;
  }

  router.push(`/admin/guru/jadwal-mengajar/${item.id}/edit`);
};

  /* =========================================================
     TAMBAH
  ========================================================= */

  const handleTambah =
    () => {
      router.push(
        "/admin/guru/jadwal-mengajar/tambah"
      );
    };

  /* =========================================================
     PRINT
  ========================================================= */

  const handlePrint = () => {
    window.print();
  };

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilter = () => {
    setSearch("");
    setMapelFilter(
      "Semua Mapel"
    );
    setSelectedHari(
      "senin"
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex h-screen w-full bg-[#f6f8fc] overflow-hidden">
      {/* SIDEBAR */}

      <Sidebar
        active="guruJadwalMengajar"
        setActive={() => {}}
        collapsed={
          isCollapsed
        }
        setCollapsed={
          setIsCollapsed
        }
        role="admin"
      />

      {/* MAIN */}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={
            toggleSidebar
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
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-[1500px] mx-auto space-y-6">

              {/* =================================================
                  HERO
              ================================================= */}

              <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#11337c] via-[#203e7c] to-[#122a50] text-white shadow-xl shadow-blue-900/10">

                {/* DECORATION */}

                <div className="absolute -right-16 -top-20 w-72 h-72 rounded-full bg-white/10 blur-sm" />

                <div className="absolute right-24 -bottom-24 w-64 h-64 rounded-full bg-white/10" />

                <div className="absolute left-1/2 top-0 w-40 h-40 rounded-full bg-blue-300/10 blur-2xl" />

                <div className="relative p-5 sm:p-7 lg:p-8">

                  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-7">

                    <div className="max-w-2xl">

                      <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/10 border border-white/15 backdrop-blur-sm mb-4">
                        <CalendarClock
                          size={14}
                        />

                        <span className="text-[10px] font-bold tracking-[0.12em] uppercase">
                          Akademik
                        </span>
                      </div>

                      <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight">
                        Jadwal Mengajar
                      </h1>

                      <p className="text-sm text-blue-100 mt-2 max-w-xl leading-relaxed">
                        Kelola jadwal mengajar
                        guru, mata pelajaran,
                        kelas, waktu, dan
                        ruangan dalam satu
                        tampilan yang lebih
                        terstruktur.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-5">

                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/10">
                          <CalendarDays
                            size={14}
                          />

                          <span className="text-xs font-medium">
                            Tahun Ajaran
                            2026/2027
                          </span>
                        </div>

                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/10">
                          <BookMarked
                            size={14}
                          />

                          <span className="text-xs font-medium">
                            Semester Ganjil
                          </span>
                        </div>

                      </div>

                    </div>

                    {/* HERO ACTION */}

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:min-w-[190px]">

                      <button
                        type="button"
                        onClick={
                          handleTambah
                        }
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-[#155DFC] text-sm font-bold shadow-lg hover:bg-blue-50 transition-all"
                      >
                        <Plus
                          size={17}
                        />
                        Tambah Jadwal
                      </button>

                      <button
                        type="button"
                        onClick={
                          handlePrint
                        }
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/15 transition-all"
                      >
                        <Printer
                          size={16}
                        />
                        Cetak Jadwal
                      </button>

                    </div>

                  </div>

                </div>
              </section>

              {/* =================================================
                  STATISTICS
              ================================================= */}

              <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">

                <PremiumStat
                  icon={Users}
                  title="Guru Mengajar"
                  value={totalGuru}
                  description="Guru terjadwal"
                  numberClass="text-[#155DFC]"
                  iconClass="bg-blue-50 text-[#155DFC]"
                />

                <PremiumStat
                  icon={BookMarked}
                  title="Mata Pelajaran"
                  value={totalMapel}
                  description="Mapel terjadwal"
                  numberClass="text-indigo-600"
                  iconClass="bg-indigo-50 text-indigo-600"
                />

                <PremiumStat
                  icon={School}
                  title="Kelas"
                  value={totalKelas}
                  description="Kelas memiliki jadwal"
                  numberClass="text-emerald-600"
                  iconClass="bg-emerald-50 text-emerald-600"
                />

                <PremiumStat
                  icon={Clock3}
                  title="Slot Mingguan"
                  value={totalSlot}
                  description="Total jadwal"
                  numberClass="text-amber-600"
                  iconClass="bg-amber-50 text-amber-600"
                />

              </section>

              {/* =================================================
                  CONTROL BAR
              ================================================= */}

              <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4">

                <div className="flex flex-col xl:flex-row xl:items-center gap-3">

                  {/* SEARCH */}

                  <div className="relative flex-1">

                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={
                        search
                      }
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Cari guru, NIP, mata pelajaran, atau kelas..."
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/15 focus:border-[#155DFC]/40 focus:bg-white transition-all"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearch(
                            ""
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X
                          size={14}
                        />
                      </button>
                    )}

                  </div>

                  {/* MAPEL */}

                  <div className="flex items-center gap-2">

                    <Filter
                      size={15}
                      className="text-slate-400 hidden sm:block"
                    />

                    <select
                      value={
                        mapelFilter
                      }
                      onChange={(e) =>
                        setMapelFilter(
                          e.target.value
                        )
                      }
                      className="w-full sm:w-auto min-w-[190px] px-3 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/15 focus:border-[#155DFC]/40"
                    >
                      {MAPEL_OPTIONS.map(
                        (
                          mapel
                        ) => (
                          <option
                            key={
                              mapel
                            }
                            value={
                              mapel
                            }
                          >
                            {mapel}
                          </option>
                        )
                      )}
                    </select>

                  </div>

                  {/* VIEW */}

                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">

                    <button
                      type="button"
                      onClick={() =>
                        setViewMode(
                          "timeline"
                        )
                      }
                      className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        viewMode ===
                        "timeline"
                          ? "bg-white text-[#155DFC] shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <LayoutGrid
                        size={14}
                      />
                      Jadwal
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setViewMode(
                          "table"
                        )
                      }
                      className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        viewMode ===
                        "table"
                          ? "bg-white text-[#155DFC] shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <List
                        size={14}
                      />
                      Tabel
                    </button>

                  </div>

                  {/* RESET */}

                  <button
                    type="button"
                    onClick={
                      resetFilter
                    }
                    className="inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <RefreshCw
                      size={14}
                    />
                    Reset
                  </button>

                </div>

              </section>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                  <div>
                    <p className="text-sm font-bold text-rose-700">
                      Gagal mengambil
                      data jadwal
                    </p>

                    <p className="text-xs text-rose-600 mt-1">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      fetchJadwal
                    }
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                  >
                    <RefreshCw
                      size={13}
                    />
                    Coba Lagi
                  </button>

                </div>
              )}

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading && (
                <LoadingState />
              )}

              {/* =================================================
                  TIMELINE VIEW
              ================================================= */}

              {!loading &&
                viewMode ===
                  "timeline" && (
                  <section className="space-y-4">

                    {/* DAY NAVIGATION */}

                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3">

                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">

                        {HARI.map(
                          (day) => {
                            const count =
                              getDayCount(
                                day.key
                              );

                            const active =
                              selectedHari ===
                              day.key;

                            return (
                              <button
                                type="button"
                                key={
                                  day.key
                                }
                                onClick={() =>
                                  setSelectedHari(
                                    day.key
                                  )
                                }
                                className={`relative p-3 rounded-xl text-left transition-all duration-200 ${
                                  active
                                    ? "bg-[#155DFC] text-white shadow-md shadow-blue-500/20"
                                    : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-[#155DFC]"
                                }`}
                              >

                                <div className="flex items-center justify-between">

                                  <span
                                    className={`text-xs font-bold ${
                                      active
                                        ? "text-white"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    {day.label}
                                  </span>

                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                      active
                                        ? "bg-white/15 text-white"
                                        : "bg-white text-slate-400"
                                    }`}
                                  >
                                    {count}
                                  </span>

                                </div>

                                <p
                                  className={`text-[10px] mt-1 ${
                                    active
                                      ? "text-blue-100"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {count ===
                                  0
                                    ? "Kosong"
                                    : count ===
                                      1
                                    ? "1 jadwal"
                                    : `${count} jadwal`}
                                </p>

                              </button>
                            );
                          }
                        )}

                      </div>

                    </div>

                    {/* TIMELINE */}

                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

                      <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                        <div>

                          <div className="flex items-center gap-2">

                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                              <CalendarDays
                                size={15}
                                className="text-[#155DFC]"
                              />
                            </div>

                            <div>
                              <h2 className="text-sm font-bold text-slate-800">
                                Jadwal Hari{" "}
                                {HARI.find(
                                  (
                                    d
                                  ) =>
                                    d.key ===
                                    selectedHari
                                )
                                  ?.label ||
                                  ""}
                              </h2>

                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Daftar sesi
                                pembelajaran
                                hari ini
                              </p>
                            </div>

                          </div>

                        </div>

                        <div className="flex items-center gap-2">

                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                            <CheckCircle2
                              size={12}
                            />
                            {jadwalHariAktif.length}{" "}
                            sesi
                          </span>

                        </div>

                      </div>

                      {jadwalHariAktif.length >
                      0 ? (
                        <div className="p-4 sm:p-6">

                          <div className="relative">

                            {/* VERTICAL LINE */}

                            <div className="absolute left-[51px] sm:left-[75px] top-5 bottom-5 w-px bg-slate-200" />

                            <div className="space-y-3">

                              {jadwalHariAktif.map(
                                (
                                  item,
                                  index
                                ) => (
                                  <TimelineItem
                                    key={
                                      item.id
                                    }
                                    item={
                                      item
                                    }
                                    index={
                                      index
                                    }
                                    onEdit={
                                      handleEdit
                                    }
                                    onDelete={
                                      handleDelete
                                    }
                                    deletingId={
                                      deletingId
                                    }
                                  />
                                )
                              )}

                            </div>

                          </div>

                        </div>
                      ) : (
                        <EmptyState
                          onTambah={
                            handleTambah
                          }
                        />
                      )}

                    </div>

                  </section>
                )}

              {/* =================================================
                  TABLE VIEW
              ================================================= */}

              {!loading &&
                viewMode ===
                  "table" && (
                  <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

                      <div>
                        <h2 className="text-sm font-bold text-slate-800">
                          Data Jadwal
                          Mengajar
                        </h2>

                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {filteredJadwal.length}{" "}
                          jadwal
                          ditemukan
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          handlePrint
                        }
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        <Printer
                          size={14}
                        />
                        Cetak
                      </button>

                    </div>

                    <div className="overflow-x-auto">

                      <table className="w-full text-sm">

                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">

                            <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wide font-bold text-slate-400">
                              No
                            </th>

                            <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wide font-bold text-slate-400">
                              Guru
                            </th>

                            <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wide font-bold text-slate-400">
                              Mata Pelajaran
                            </th>

                            <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wide font-bold text-slate-400">
                              Kelas
                            </th>

                            <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wide font-bold text-slate-400">
                              Hari
                            </th>

                            <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wide font-bold text-slate-400">
                              Jam
                            </th>

                            <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wide font-bold text-slate-400">
                              Ruangan
                            </th>

                            <th className="px-5 py-3 text-center text-[10px] uppercase tracking-wide font-bold text-slate-400">
                              Aksi
                            </th>

                          </tr>
                        </thead>

                        <tbody>

                          {filteredJadwal.map(
                            (
                              item,
                              index
                            ) => {
                              const color =
                                getColor(
                                  index
                                );

                              return (
                                <tr
                                  key={
                                    item.id
                                  }
                                  className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors"
                                >

                                  <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                                    {String(
                                      index +
                                        1
                                    ).padStart(
                                      2,
                                      "0"
                                    )}
                                  </td>

                                  <td className="px-5 py-4">

                                    <div className="flex items-center gap-3">

                                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#155DFC] flex items-center justify-center shrink-0">
                                        <UserRound
                                          size={15}
                                        />
                                      </div>

                                      <div>
                                        <p className="text-xs font-bold text-slate-800">
                                          {
                                            item.nama
                                          }
                                        </p>

                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                          {
                                            item.kode
                                          }
                                        </p>
                                      </div>

                                    </div>

                                  </td>

                                  <td className="px-5 py-4">

                                    <span
                                      className={`inline-flex items-center px-2.5 py-1.5 rounded-lg ${color.bg} ${color.text} text-[10px] font-bold`}
                                    >
                                      {
                                        item.mapel
                                      }
                                    </span>

                                  </td>

                                  <td className="px-5 py-4">

                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                      <School
                                        size={13}
                                        className="text-slate-400"
                                      />

                                      {
                                        item.kelas
                                      }
                                    </span>

                                  </td>

                                  <td className="px-5 py-4">

                                    <span className="text-xs font-semibold text-[#155DFC] capitalize">
                                      {
                                        item.hari
                                      }
                                    </span>

                                  </td>

                                  <td className="px-5 py-4">

                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                      <Clock3
                                        size={13}
                                        className="text-[#155DFC]"
                                      />

                                      {getJam(
                                        item
                                      ) ||
                                        "-"
                                      }
                                    </span>

                                  </td>

                                  <td className="px-5 py-4">

                                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                      <MapPin
                                        size={13}
                                      />

                                      {
                                        item.ruangan ||
                                        "-"
                                      }
                                    </span>

                                  </td>

                                  <td className="px-5 py-4">

                                    <div className="flex justify-center items-center gap-1.5">

                                      <button
                                        type="button"
                                        onClick={
                                          handleEdit.bind(
                                            null,
                                            item
                                          )
                                        }
                                        className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors"
                                        title="Edit"
                                      >
                                        <Pencil
                                          size={
                                            14
                                          }
                                        />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDelete(
                                            item
                                          )
                                        }
                                        disabled={
                                          deletingId ===
                                          item.id
                                        }
                                        className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 disabled:opacity-50 transition-colors"
                                        title="Hapus"
                                      >
                                        {deletingId ===
                                        item.id ? (
                                          <RefreshCw
                                            size={
                                              14
                                            }
                                            className="animate-spin"
                                          />
                                        ) : (
                                          <Trash2
                                            size={
                                              14
                                            }
                                          />
                                        )}
                                      </button>

                                    </div>

                                  </td>

                                </tr>
                              );
                            }
                          )}

                        </tbody>

                      </table>

                    </div>

                    {filteredJadwal.length ===
                      0 && (
                      <EmptyState
                        onTambah={
                          handleTambah
                        }
                      />
                    )}

                  </section>
                )}

              {/* =================================================
                  BOTTOM SUMMARY
              ================================================= */}

              {!loading &&
                filteredJadwal.length >
                  0 && (
                  <section className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">

                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white overflow-hidden relative">

                      <div className="absolute right-0 top-0 w-40 h-40 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />

                      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">

                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                          <Sparkles
                            size={18}
                          />
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            Jadwal terorganisir
                          </p>

                          <p className="text-[11px] text-slate-400 mt-1">
                            Terdapat{" "}
                            <span className="text-white font-bold">
                              {
                                filteredJadwal.length
                              }{" "}
                              jadwal
                            </span>{" "}
                            yang sesuai dengan
                            filter saat ini.
                          </p>
                        </div>

                      </div>

                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-2xl px-5 py-4 flex items-center gap-3">

                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <CheckCircle2
                          size={17}
                          className="text-emerald-600"
                        />
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400">
                          Status Sistem
                        </p>

                        <p className="text-xs font-bold text-slate-700 mt-0.5">
                          Data tersinkron
                        </p>
                      </div>

                    </div>

                  </section>
                )}

              {/* FOOTER */}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1 pb-4">

                <p className="text-[10px] text-slate-400">
                  SmartSchool • Akademik •
                  Jadwal Mengajar
                </p>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <CheckCircle2
                    size={12}
                    className="text-emerald-500"
                  />
                  Sistem berjalan normal
                </div>

              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   STAT
========================================================= */

function PremiumStat({
  icon: Icon,
  title,
  value,
  description,
  iconClass,
  numberClass,
}) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

      <div className="flex items-start justify-between gap-3">

        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
            {title}
          </p>

          <p
            className={`text-2xl sm:text-[28px] font-bold mt-2 ${numberClass}`}
          >
            {value}
          </p>

          <p className="text-[10px] text-slate-400 mt-1">
            {description}
          </p>
        </div>

        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          <Icon size={19} />
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   TIMELINE ITEM
========================================================= */

function TimelineItem({
  item,
  index,
  onEdit,
  onDelete,
  deletingId,
}) {
  const color =
    getColor(index);

  return (
    <div className="relative grid grid-cols-[72px_1fr] sm:grid-cols-[100px_1fr] gap-3 sm:gap-5">

      {/* TIME */}

      <div className="pt-4 text-right pr-1 sm:pr-2">

        <p className="text-xs sm:text-sm font-bold text-slate-700">
          {item.jamMulai ||
            "--:--"}
        </p>

        <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
          {item.jamSelesai ||
            "--:--"}
        </p>

      </div>

      {/* DOT */}

      <div className="absolute left-[51px] sm:left-[75px] top-5 -translate-x-1/2 z-10">

        <div
          className={`w-3 h-3 rounded-full border-[3px] border-white shadow-sm ${color.line}`}
        />

      </div>

      {/* CARD */}

      <div
        className={`relative overflow-hidden rounded-xl border ${color.border} ${color.bg} p-4 sm:p-5 group hover:shadow-md transition-all duration-200`}
      >

        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${color.line}`}
        />

        <div className="pl-1">

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <span
                  className={`px-2 py-1 rounded-md bg-white/70 ${color.text} text-[9px] font-bold uppercase tracking-wide`}
                >
                  {item.mapel}
                </span>

                <span className="px-2 py-1 rounded-md bg-white/70 text-slate-500 text-[9px] font-semibold">
                  {item.kelas}
                </span>

              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-800 mt-2">
                {item.mapel}
              </h3>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">

                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500">
                  <UserRound
                    size={12}
                  />

                  {item.nama}
                </span>

                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500">
                  <MapPin
                    size={12}
                  />

                  {item.ruangan ||
                    "Ruangan belum ditentukan"}
                </span>

              </div>

            </div>

            {/* ACTION */}

            <div className="flex items-center gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">

              <button
                type="button"
                onClick={() =>
                  onEdit(item)
                }
                className="w-8 h-8 rounded-lg bg-white border border-white/80 text-slate-500 hover:text-[#155DFC] flex items-center justify-center transition-colors"
                title="Edit"
              >
                <Pencil
                  size={13}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  onDelete(item)
                }
                disabled={
                  deletingId ===
                  item.id
                }
                className="w-8 h-8 rounded-lg bg-white border border-white/80 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors disabled:opacity-50"
                title="Hapus"
              >
                {deletingId ===
                item.id ? (
                  <RefreshCw
                    size={13}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2
                    size={13}
                  />
                )}
              </button>

              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-white border border-white/80 text-slate-500 hover:text-slate-700 flex items-center justify-center"
              >
                <MoreHorizontal
                  size={14}
                />
              </button>

            </div>

          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-white/70">

            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
              <Clock3
                size={11}
              />

              {getJam(item) ||
                "-"}
            </span>

            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
              <School
                size={11}
              />

              Kelas{" "}
              {item.kelas}
            </span>

            {item.kode &&
              item.kode !==
                "-" && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  NIP{" "}
                  {item.kode}
                </span>
              )}

          </div>

        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  onTambah,
}) {
  return (
    <div className="px-5 py-16 text-center">

      <div className="w-14 h-14 rounded-2xl bg-blue-50 mx-auto flex items-center justify-center">
        <CalendarClock
          size={25}
          className="text-[#155DFC]"
        />
      </div>

      <h3 className="text-sm font-bold text-slate-700 mt-4">
        Belum ada jadwal
      </h3>

      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1.5 leading-relaxed">
        Tidak ada jadwal mengajar
        yang sesuai dengan filter
        yang dipilih.
      </p>

      <button
        type="button"
        onClick={
          onTambah
        }
        className="inline-flex items-center gap-2 px-4 py-2.5 mt-5 rounded-xl bg-[#155DFC] hover:bg-[#0D47C9] text-white text-xs font-semibold shadow-sm transition-all"
      >
        <Plus
          size={14}
        />
        Tambah Jadwal
      </button>

    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">

      <div className="flex flex-col items-center justify-center">

        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
          <RefreshCw
            size={22}
            className="text-[#155DFC] animate-spin"
          />
        </div>

        <p className="text-sm font-semibold text-slate-600 mt-4">
          Memuat jadwal...
        </p>

        <p className="text-[11px] text-slate-400 mt-1">
          Mengambil data jadwal
          mengajar dari server
        </p>

      </div>

    </div>
  );
}