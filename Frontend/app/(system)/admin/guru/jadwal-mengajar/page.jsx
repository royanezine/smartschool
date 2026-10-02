"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

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
} from "@/services/jadwalMengajar.service";

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
    const hari = normalizeHari(getHari(item));

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

      jamMulai: item?.jamMulai || "",

      jamSelesai: item?.jamSelesai || "",

      ruangan: item?.ruangan || "",

      original: item,
    };
  });
}

/* =========================================================
   COLOR MAP
   SEMUA MENGGUNAKAN THEME SYSTEM
========================================================= */

const MAPEL_COLOR = [
  {
    bg: "theme-info",
    border: "theme-border",
    text: "text-[var(--color-info)]",
    icon: "theme-info",
    line: "bg-[var(--color-info)]",
  },
  {
    bg: "theme-sidebar-active",
    border: "theme-border",
    text: "text-[var(--color-primary)]",
    icon: "theme-sidebar-active text-[var(--color-primary)]",
    line: "bg-[var(--color-primary)]",
  },
  {
    bg: "theme-success",
    border: "theme-border",
    text: "text-[var(--color-success)]",
    icon: "theme-success",
    line: "bg-[var(--color-success)]",
  },
  {
    bg: "theme-warning",
    border: "theme-border",
    text: "text-[var(--color-warning)]",
    icon: "theme-warning",
    line: "bg-[var(--color-warning)]",
  },
  {
    bg: "theme-danger",
    border: "theme-border",
    text: "text-[var(--color-danger)]",
    icon: "theme-danger",
    line: "bg-[var(--color-danger)]",
  },
  {
    bg: "theme-info",
    border: "theme-border",
    text: "text-[var(--color-info)]",
    icon: "theme-info",
    line: "bg-[var(--color-info)]",
  },
  {
    bg: "theme-sidebar-active",
    border: "theme-border",
    text: "text-[var(--color-primary)]",
    icon: "theme-sidebar-active text-[var(--color-primary)]",
    line: "bg-[var(--color-primary)]",
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

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [mapelFilter, setMapelFilter] =
    useState("Semua Mapel");

  const [selectedHari, setSelectedHari] =
    useState("senin");

  const [jadwal, setJadwal] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState(null);

  const [viewMode, setViewMode] =
    useState("timeline");

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
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

      const data = Array.isArray(
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

  const MAPEL_OPTIONS = useMemo(() => {
    const mapel = jadwal
      .map((item) => item.mapel)
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

  const filteredJadwal = useMemo(() => {
    const keyword = search
      .toLowerCase()
      .trim();

    return jadwal.filter((item) => {
      const nama = String(
        item.nama || ""
      ).toLowerCase();

      const kode = String(
        item.kode || ""
      ).toLowerCase();

      const mapel = String(
        item.mapel || ""
      ).toLowerCase();

      const kelas = String(
        item.kelas || ""
      ).toLowerCase();

      const matchSearch =
        !keyword ||
        nama.includes(keyword) ||
        kode.includes(keyword) ||
        mapel.includes(keyword) ||
        kelas.includes(keyword);

      const matchMapel =
        mapelFilter === "Semua Mapel" ||
        item.mapel === mapelFilter;

      return (
        matchSearch &&
        matchMapel
      );
    });
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

  const totalGuru = useMemo(() => {
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

  const totalMapel = useMemo(() => {
    return new Set(
      jadwal
        .map(
          (item) =>
            item.mapel
        )
        .filter(Boolean)
    ).size;
  }, [jadwal]);

  const totalKelas = useMemo(() => {
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

  const getDayCount = (day) => {
    return filteredJadwal.filter(
      (item) =>
        item.hari === day
    ).length;
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async (
    item
  ) => {
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
      setDeletingId(item.id);

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
        selectedHari === item.hari &&
        jadwalHariAktif.length === 1
      ) {
        setSelectedHari("senin");
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
      setDeletingId(null);
    }
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const handleEdit = (item) => {
    if (!item?.id) {
      window.alert(
        "ID jadwal tidak ditemukan."
      );
      return;
    }

    router.push(
      `/admin/guru/jadwal-mengajar/${item.id}/edit`
    );
  };

  /* =========================================================
     TAMBAH
  ========================================================= */

  const handleTambah = () => {
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
    setSelectedHari("senin");
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      {/* SIDEBAR */}

      <Sidebar
        active="guruJadwalMengajar"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* MAIN */}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
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

              <section className="relative overflow-hidden rounded-[24px] theme-card theme-border border shadow-sm">

                {/* DECORATION */}

                <div className="absolute -right-16 -top-20 w-72 h-72 rounded-full bg-[var(--color-primary)]/5 blur-sm" />

                <div className="absolute right-24 -bottom-24 w-64 h-64 rounded-full bg-[var(--color-primary)]/5" />

                <div className="absolute left-1/2 top-0 w-40 h-40 rounded-full bg-[var(--color-info)]/5 blur-2xl" />

                <div className="relative p-5 sm:p-7 lg:p-8">

                  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-7">

                    <div className="max-w-2xl">

                      <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg theme-info border theme-border-soft mb-4">

                        <CalendarClock
                          size={14}
                        />

                        <span className="text-[10px] font-bold tracking-[0.12em] uppercase theme-text-secondary">
                          Akademik
                        </span>

                      </div>

                      <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight theme-text">
                        Jadwal Mengajar
                      </h1>

                      <p className="text-sm theme-text-secondary mt-2 max-w-xl leading-relaxed">
                        Kelola jadwal mengajar
                        guru, mata pelajaran,
                        kelas, waktu, dan
                        ruangan dalam satu
                        tampilan yang lebih
                        terstruktur.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-5">

                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl theme-card-soft theme-border border">

                          <CalendarDays
                            size={14}
                            className="text-[var(--color-primary)]"
                          />

                          <span className="text-xs font-medium theme-text-secondary">
                            Tahun Ajaran
                            2026/2027
                          </span>

                        </div>

                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl theme-card-soft theme-border border">

                          <BookMarked
                            size={14}
                            className="text-[var(--color-primary)]"
                          />

                          <span className="text-xs font-medium theme-text-secondary">
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
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl theme-primary text-sm font-bold shadow-sm transition-all"
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
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl theme-card-soft theme-border border theme-text-secondary theme-sidebar-hover text-sm font-semibold transition-all"
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
                  numberClass="text-[var(--color-primary)]"
                  iconClass="theme-info text-[var(--color-primary)]"
                />

                <PremiumStat
                  icon={BookMarked}
                  title="Mata Pelajaran"
                  value={totalMapel}
                  description="Mapel terjadwal"
                  numberClass="text-[var(--color-primary)]"
                  iconClass="theme-sidebar-active text-[var(--color-primary)]"
                />

                <PremiumStat
                  icon={School}
                  title="Kelas"
                  value={totalKelas}
                  description="Kelas memiliki jadwal"
                  numberClass="text-[var(--color-success)]"
                  iconClass="theme-success"
                />

                <PremiumStat
                  icon={Clock3}
                  title="Slot Mingguan"
                  value={totalSlot}
                  description="Total jadwal"
                  numberClass="text-[var(--color-warning)]"
                  iconClass="theme-warning"
                />

              </section>

              {/* =================================================
                  CONTROL BAR
              ================================================= */}

              <section className="theme-card theme-border border rounded-2xl shadow-sm p-4">

                <div className="flex flex-col xl:flex-row xl:items-center gap-3">

                  {/* SEARCH */}

                  <div className="relative flex-1">

                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Cari guru, NIP, mata pelajaran, atau kelas..."
                      className="theme-input w-full pl-10 pr-10 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15 focus:border-[var(--color-primary)] transition-all"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearch("")
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted hover:text-[var(--color-text)]"
                      >
                        <X size={14} />
                      </button>
                    )}

                  </div>

                  {/* MAPEL */}

                  <div className="flex items-center gap-2">

                    <Filter
                      size={15}
                      className="theme-text-muted hidden sm:block"
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
                      className="theme-input w-full sm:w-auto min-w-[190px] px-3 py-3 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15 focus:border-[var(--color-primary)]"
                    >
                      {MAPEL_OPTIONS.map(
                        (mapel) => (
                          <option
                            key={mapel}
                            value={mapel}
                          >
                            {mapel}
                          </option>
                        )
                      )}
                    </select>

                  </div>

                  {/* VIEW */}

                  <div className="flex items-center gap-1 p-1 theme-card-soft rounded-xl">

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
                          ? "theme-card theme-text-primary shadow-sm"
                          : "theme-text-muted theme-sidebar-hover"
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
                          ? "theme-card text-[var(--color-primary)] shadow-sm"
                          : "theme-text-muted theme-sidebar-hover"
                      }`}
                    >
                      <List size={14} />
                      Tabel
                    </button>

                  </div>

                  {/* RESET */}

                  <button
                    type="button"
                    onClick={
                      resetFilter
                    }
                    className="inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl border theme-border theme-card theme-text-secondary theme-sidebar-hover text-xs font-semibold transition-all"
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
                <div className="rounded-2xl theme-danger theme-border border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                  <div>
                    <p className="text-sm font-bold text-[var(--color-danger)]">
                      Gagal mengambil
                      data jadwal
                    </p>

                    <p className="text-xs text-[var(--color-danger)] mt-1">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      fetchJadwal
                    }
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg theme-card theme-border border text-xs font-semibold text-[var(--color-danger)] theme-sidebar-hover"
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

                    <div className="theme-card theme-border border rounded-2xl shadow-sm p-3">

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
                                    ? "theme-primary shadow-md"
                                    : "theme-card-soft theme-text-secondary theme-sidebar-hover"
                                }`}
                              >

                                <div className="flex items-center justify-between">

                                  <span
                                    className={`text-xs font-bold ${
                                      active
                                        ? "theme-text"
                                        : "theme-text-secondary"
                                    }`}
                                  >
                                    {day.label}
                                  </span>

                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                      active
                                        ? "theme-card text-[var(--color-primary)]"
                                        : "theme-card theme-text-placeholder"
                                    }`}
                                  >
                                    {count}
                                  </span>

                                </div>

                                <p
                                  className={`text-[10px] mt-1 ${
                                    active
                                      ? "opacity-80"
                                      : "theme-text-placeholder"
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

                    <div className="theme-card theme-border border rounded-2xl shadow-sm overflow-hidden">

                      <div className="px-5 sm:px-6 py-4 border-b theme-border-soft flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                        <div>

                          <div className="flex items-center gap-2">

                            <div className="w-8 h-8 rounded-lg theme-info flex items-center justify-center">
                              <CalendarDays
                                size={15}
                                className="text-[var(--color-primary)]"
                              />
                            </div>

                            <div>
                              <h2 className="text-sm font-bold theme-text">
                                Jadwal Hari{" "}
                                {HARI.find(
                                  (d) =>
                                    d.key ===
                                    selectedHari
                                )
                                  ?.label ||
                                  ""}
                              </h2>

                              <p className="text-[10px] theme-text-muted mt-0.5">
                                Daftar sesi
                                pembelajaran
                                hari ini
                              </p>
                            </div>

                          </div>

                        </div>

                        <div className="flex items-center gap-2">

                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg theme-success text-[10px] font-bold">
                            <CheckCircle2
                              size={12}
                            />
                            {
                              jadwalHariAktif.length
                            }{" "}
                            sesi
                          </span>

                        </div>

                      </div>

                      {jadwalHariAktif.length >
                      0 ? (
                        <div className="p-4 sm:p-6">

                          <div className="relative">

                            {/* VERTICAL LINE */}

                            <div className="absolute left-[51px] sm:left-[75px] top-5 bottom-5 w-px bg-[var(--color-border)]" />

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
                  <section className="theme-card theme-border border rounded-2xl shadow-sm overflow-hidden">

                    <div className="px-5 py-4 border-b theme-border-soft flex items-center justify-between">

                      <div>
                        <h2 className="text-sm font-bold theme-text">
                          Data Jadwal
                          Mengajar
                        </h2>

                        <p className="text-[10px] theme-text-muted mt-0.5">
                          {
                            filteredJadwal.length
                          }{" "}
                          jadwal
                          ditemukan
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          handlePrint
                        }
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border theme-border theme-text-secondary theme-sidebar-hover text-xs font-semibold"
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
                          <tr className="theme-table-header border-b theme-border">

                            <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wide font-bold theme-text-muted">
                              No
                            </th>

                            <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wide font-bold theme-text-muted">
                              Guru
                            </th>

                            <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wide font-bold theme-text-muted">
                              Mata Pelajaran
                            </th>

                            <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wide font-bold theme-text-muted">
                              Kelas
                            </th>

                            <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wide font-bold theme-text-muted">
                              Hari
                            </th>

                            <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wide font-bold theme-text-muted">
                              Jam
                            </th>

                            <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wide font-bold theme-text-muted">
                              Ruangan
                            </th>

                            <th className="px-5 py-3 text-center text-[10px] uppercase tracking-wide font-bold theme-text-muted">
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
                                  className="border-b theme-border-soft theme-table-hover transition-colors"
                                >

                                  <td className="px-5 py-4 text-xs font-semibold theme-text-muted">
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

                                      <div className="w-9 h-9 rounded-lg theme-info text-[var(--color-primary)] flex items-center justify-center shrink-0">
                                        <UserRound
                                          size={15}
                                        />
                                      </div>

                                      <div>
                                        <p className="text-xs font-bold theme-text">
                                          {
                                            item.nama
                                          }
                                        </p>

                                        <p className="text-[10px] theme-text-placeholder mt-0.5">
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

                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold theme-text-secondary">
                                      <School
                                        size={13}
                                        className="theme-text-muted"
                                      />

                                      {
                                        item.kelas
                                      }
                                    </span>

                                  </td>

                                  <td className="px-5 py-4">

                                    <span className="text-xs font-semibold text-[var(--color-primary)] capitalize">
                                      {
                                        item.hari
                                      }
                                    </span>

                                  </td>

                                  <td className="px-5 py-4">

                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold theme-text-secondary">
                                      <Clock3
                                        size={13}
                                        className="text-[var(--color-primary)]"
                                      />

                                      {getJam(
                                        item
                                      ) ||
                                        "-"}
                                    </span>

                                  </td>

                                  <td className="px-5 py-4">

                                    <span className="inline-flex items-center gap-1.5 text-xs theme-text-muted">
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
                                        onClick={handleEdit.bind(
                                          null,
                                          item
                                        )}
                                        className="w-8 h-8 rounded-lg theme-warning flex items-center justify-center hover:opacity-80 transition-colors"
                                        title="Edit"
                                      >
                                        <Pencil
                                          size={14}
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
                                        className="w-8 h-8 rounded-lg theme-danger flex items-center justify-center hover:opacity-80 disabled:opacity-50 transition-colors"
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

                    <div className="theme-card theme-border border rounded-2xl p-5 overflow-hidden relative">

                      <div className="absolute right-0 top-0 w-40 h-40 bg-[var(--color-primary)]/5 rounded-full -translate-y-1/2 translate-x-1/2" />

                      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">

                        <div className="w-10 h-10 rounded-xl theme-info flex items-center justify-center shrink-0">
                          <Sparkles
                            size={18}
                            className="text-[var(--color-primary)]"
                          />
                        </div>

                        <div>
                          <p className="text-sm font-semibold theme-text">
                            Jadwal terorganisir
                          </p>

                          <p className="text-[11px] theme-text-muted mt-1">
                            Terdapat{" "}
                            <span className="theme-text font-bold">
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

                    <div className="theme-card theme-border border rounded-2xl px-5 py-4 flex items-center gap-3">

                      <div className="w-9 h-9 rounded-xl theme-success flex items-center justify-center">
                        <CheckCircle2
                          size={17}
                          className="text-[var(--color-success)]"
                        />
                      </div>

                      <div>
                        <p className="text-[10px] theme-text-placeholder">
                          Status Sistem
                        </p>

                        <p className="text-xs font-bold theme-text-secondary mt-0.5">
                          Data tersinkron
                        </p>
                      </div>

                    </div>

                  </section>
                )}

              {/* FOOTER */}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1 pb-4">

                <p className="text-[10px] theme-text-placeholder">
                  SmartSchool • Akademik •
                  Jadwal Mengajar
                </p>

                <div className="flex items-center gap-1.5 text-[10px] theme-text-placeholder">
                  <CheckCircle2
                    size={12}
                    className="text-[var(--color-success)]"
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
    <div className="group theme-card theme-border border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

      <div className="flex items-start justify-between gap-3">

        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold theme-text-placeholder">
            {title}
          </p>

          <p
            className={`text-2xl sm:text-[28px] font-bold mt-2 ${numberClass}`}
          >
            {value}
          </p>

          <p className="text-[10px] theme-text-muted mt-1">
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

        <p className="text-xs sm:text-sm font-bold theme-text-secondary">
          {item.jamMulai ||
            "--:--"}
        </p>

        <p className="text-[9px] sm:text-[10px] theme-text-placeholder mt-0.5">
          {item.jamSelesai ||
            "--:--"}
        </p>

      </div>

      {/* DOT */}

      <div className="absolute left-[51px] sm:left-[75px] top-5 -translate-x-1/2 z-10">

        <div
          className={`w-3 h-3 rounded-full border-[3px] border-[var(--color-card)] shadow-sm ${color.line}`}
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
                  className={`px-2 py-1 rounded-md theme-card ${color.text} text-[9px] font-bold uppercase tracking-wide`}
                >
                  {item.mapel}
                </span>

                <span className="px-2 py-1 rounded-md theme-card theme-text-muted text-[9px] font-semibold">
                  {item.kelas}
                </span>

              </div>

              <h3 className="text-sm sm:text-base font-bold theme-text mt-2">
                {item.mapel}
              </h3>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">

                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] theme-text-muted">
                  <UserRound
                    size={12}
                  />

                  {item.nama}
                </span>

                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] theme-text-muted">
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
                className="w-8 h-8 rounded-lg theme-card theme-border border theme-text-muted hover:text-[var(--color-primary)] flex items-center justify-center transition-colors"
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
                className="w-8 h-8 rounded-lg theme-card theme-border border theme-text-muted hover:text-[var(--color-danger)] flex items-center justify-center transition-colors disabled:opacity-50"
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
                className="w-8 h-8 rounded-lg theme-card theme-border border theme-text-muted hover:text-[var(--color-text)] flex items-center justify-center"
              >
                <MoreHorizontal
                  size={14}
                />
              </button>

            </div>

          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t theme-border">

            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold theme-text-muted">
              <Clock3
                size={11}
              />

              {getJam(item) ||
                "-"}
            </span>

            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold theme-text-muted">
              <School
                size={11}
              />

              Kelas{" "}
              {item.kelas}
            </span>

            {item.kode &&
              item.kode !==
                "-" && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono theme-text-placeholder">
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

      <div className="w-14 h-14 rounded-2xl theme-info mx-auto flex items-center justify-center">
        <CalendarClock
          size={25}
          className="text-[var(--color-primary)]"
        />
      </div>

      <h3 className="text-sm font-bold theme-text-secondary mt-4">
        Belum ada jadwal
      </h3>

      <p className="text-xs theme-text-muted max-w-sm mx-auto mt-1.5 leading-relaxed">
        Tidak ada jadwal mengajar
        yang sesuai dengan filter
        yang dipilih.
      </p>

      <button
        type="button"
        onClick={
          onTambah
        }
        className="inline-flex items-center gap-2 px-4 py-2.5 mt-5 rounded-xl theme-primary text-xs font-semibold shadow-sm transition-all"
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
    <div className="theme-card theme-border border rounded-2xl shadow-sm p-8">

      <div className="flex flex-col items-center justify-center">

        <div className="w-12 h-12 rounded-2xl theme-info flex items-center justify-center">
          <RefreshCw
            size={22}
            className="text-[var(--color-primary)] animate-spin"
          />
        </div>

        <p className="text-sm font-semibold theme-text-secondary mt-4">
          Memuat jadwal...
        </p>

        <p className="text-[11px] theme-text-muted mt-1">
          Mengambil data jadwal
          mengajar dari server
        </p>

      </div>

    </div>
  );
}